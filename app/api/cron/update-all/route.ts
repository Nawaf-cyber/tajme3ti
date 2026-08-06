import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { recordPriceHistory } from '../../../../lib/scrape-prices';
import { scrapeComponentOffers, resolveOfferPrices } from '../../../../lib/scrape-offers';
import { SCRAPE_STORE_SELECT } from '../../../../lib/stores-server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * التحديث الشامل — يسحب دفعة من القطع (الأقدم تحديثاً أولاً).
 *
 * منطق السحب والحساب يعيش في lib/scrape-prices ويشاركه مسار «تحديث قطعة
 * واحدة». كان مكرّراً في الملفين، فاحتاج خطأ محدّد كازاسوق إصلاحاً مزدوجاً.
 */
export async function GET(req: Request) {
  // حماية المسار: يُسمح بالوصول عبر مصدرين فقط —
  // 1) Vercel Cron: يحمل سر الكرون في الـ Authorization header
  // 2) لوحة الإدارة: جلسة مستخدم بصلاحية ADMIN (يُفحص الدور من قاعدة البيانات)
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization') || '';
  const isValidCron = Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`;

  let isAdmin = false;
  if (!isValidCron) {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { role: true },
      });
      isAdmin = user?.role === 'ADMIN';
    }
  }

  if (!isValidCron && !isAdmin) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  try {
    const setting = await prisma.systemSetting.findUnique({ where: { id: "default" } });
    const isCronEnabled = setting ? setting.cronEnabled : false;

    if (!isCronEnabled) {
      return NextResponse.json({ message: "التحديث التلقائي معطل حالياً من لوحة التحكم." }, { status: 200 });
    }

    // ملاحظة: الخدمة المستخدمة هي Scrape.do (token)، لا ScraperAPI.
    // اسم المتغيّر تاريخي — القيمة هي توكن Scrape.do من dashboard.scrape.do
    const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
    if (!SCRAPER_API_KEY) {
      return NextResponse.json({ error: "SCRAPER_API_KEY غير مضبوط في متغيرات البيئة." }, { status: 500 });
    }

    /* القطع المرشّحة: لها عرض واحد على الأقل برابط في متجر مفعّل يُسحب.
       المتجر الموقوف سحبه (scrapeMode: off) لا يستهلك رصيداً. */
    const searchConditions = {
      offers: {
        some: {
          url: { contains: 'http' },
          store: { active: true, scrapeMode: { not: 'off' } },
        },
      },
    };

    const totalMatchingCount = await prisma.component.count({ where: searchConditions });

    /* خطة Scrape.do: 10 طلبات متزامنة.
       35 قطعة/تشغيلة × 8 تشغيلات يومياً (كل 3 ساعات) = 280 > عدد القطع،
       فتكتمل الدورة يومياً بهامش.
       ?limit=N يقلّص الدفعة (للطلبات المصرَّح لها فقط) — لاختبار السحب بعد إضافة متجر
       أو تغيير محدّد، بلا إحراق رصيد دفعة كاملة. */
    const limitParam = parseInt(new URL(req.url).searchParams.get('limit') || '', 10);
    const BATCH_SIZE = limitParam > 0 ? Math.min(limitParam, 35) : 35;
    const components = await prisma.component.findMany({
      where: searchConditions,
      /* الأقدم سحباً أولاً، والتي لم تُسحب قط في المقدّمة تماماً.
         (كان الترتيب بـ updatedAt فتقفز أي قطعة تعدّلها لآخر الطابور.) */
      orderBy: { lastScrapedAt: { sort: 'asc', nulls: 'first' } },
      take: BATCH_SIZE,
      include: {
        offers: {
          where: { store: { active: true, scrapeMode: { not: 'off' } } },
          include: { store: { select: SCRAPE_STORE_SELECT } },
        },
      },
    });

    let updatedCount = 0;
    let updatedItems: { name: string; storeLinks: string[] }[] = [];
    let allErrors: string[] = [];

    // حماية زمنية: نتوقف قبل انتهاء مهلة Vercel (60 ثانية) لنحفظ ما أُنجز.
    const startTime = Date.now();
    const TIME_BUDGET_MS = 50000; // 50 ثانية — هامش أمان 10 ثوانٍ
    let stoppedEarly = false;

    // chunkSize يطابق عدد الطلبات المتزامنة في الخطة (10)
    const chunkSize = 10;
    for (let i = 0; i < components.length; i += chunkSize) {
      // إن اقترب الوقت من الحد، نتوقف بأمان بدل أن تُقطع العملية فجأة
      if (Date.now() - startTime > TIME_BUDGET_MS) {
        stoppedEarly = true;
        allErrors.push(`توقّف مبكر: بقيت ${components.length - i} قطعة لتشغيلة قادمة.`);
        break;
      }

      const chunk = components.slice(i, i + chunkSize);

      await Promise.all(chunk.map(async (comp) => {
        // ---- السحب والحساب: منطق مشترك مع «تحديث قطعة واحدة» ----
        const scraped = await scrapeComponentOffers(comp as any, SCRAPER_API_KEY);
        const resolved = resolveOfferPrices(comp as any, scraped.results);
        allErrors.push(...scraped.errors);

        // كل عرض يُحدَّث في صفّه، والقطعة تحمل أقل سعر معروض
        for (const u of resolved.offerUpdates) {
          await prisma.componentOffer.update({ where: { id: u.offerId }, data: u.data });
        }
        await prisma.component.update({ where: { id: comp.id }, data: { price: resolved.lowestPrice, lastScrapedAt: new Date() } });
        await recordPriceHistory(prisma, comp.id, resolved.pricePoints);

        // ---- وسوم إشعار ديسكورد ----
        const alertTag = resolved.priceDropped
          ? " 📉 **سعر لقطة!** <@&1510204041588900023>"
          : "";
        const restockTag = resolved.restocked
          ? " 📦 **توفرت من جديد!** <@&1510206266243416127>"
          : "";
        const discountTag = resolved.discountPct >= 3
          ? ` 🔻 **خصم ${resolved.discountPct}%**`
          : "";

        // ---- روابط المتاجر في الإشعار ----
        const cleanUrl = (raw: string) => {
          let u = raw.trim();
          if (u.includes('/ref=')) u = u.split('/ref=')[0];
          if (u.includes('?')) u = u.split('?')[0];
          try { return encodeURI(decodeURI(u)); } catch { return u; }
        };

        // سطر لكل متجر — تُبنى من العروض، فالمتجر الجديد يظهر في الإشعار تلقائياً
        const stores: string[] = resolved.lines
          .filter((l) => l.url && l.url.length > 12)
          .map((l) => {
            const link = cleanUrl(l.url!);
            return l.inStock && l.price != null && l.price > 0
              ? `[${l.label}: ${l.price} ريال](${link})`
              : `[${l.label}: غير متوفر ❌](${link})`;
          });

        updatedCount++;
        updatedItems.push({
          name: `${comp.name}${alertTag}${restockTag}${discountTag}`,
          storeLinks: stores
        });
      }));
    }

    const updatedNames = updatedItems.map(item => item.name);

    if (updatedCount > 0 && process.env.DISCORD_WEBHOOK_URL) {
      try {
        let descriptionText = `تم فحص وتحديث **${updatedCount}** قطعة.\n\n` +
          updatedItems.map(item => {
            const linksText = item.storeLinks.length > 0 ? item.storeLinks.join(" | ") : "لا توجد روابط ⚠️";
            return `**${item.name}**\n↳ ${linksText}`;
          }).join("\n\n");

        if (descriptionText.length > 4000) {
          descriptionText = descriptionText.substring(0, 4000) + "\n\n**... (تم قص باقي الرسالة لتجاوز حد أحرف ديسكورد)**";
        }

        const discordPayload = {
          embeds: [
            {
              title: "✅ تم تحديث الأسعار والتوفر",
              description: descriptionText,
              color: 3066993,
              timestamp: new Date().toISOString()
            }
          ]
        };

        await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordPayload)
        });
      } catch (error) {
        console.error("فشل إرسال إشعار الديسكورد:", error);
      }
    }

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

    return NextResponse.json({
      success: true,
      message: `تم تحديث بيانات ${updatedCount} قطعة بنجاح.`,
      updatedNames,
      totalMatchingCount,
      // معلومات تشغيلية للمراقبة
      batchSize: BATCH_SIZE,
      processed: components.length,
      elapsedSeconds: elapsedSec,
      stoppedEarly,
      estimatedCredits: components.length * 21, // ~21 credit/قطعة (premium لأمازون ومايكروليس)
      errors: allErrors.length > 0 ? allErrors : null
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
