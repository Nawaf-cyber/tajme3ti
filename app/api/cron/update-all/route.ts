import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { dropPercent, MIN_DROP_PERCENT } from '../../../../lib/price';
import { recordPriceHistory, setScrapeDeadline } from '../../../../lib/scrape-prices';
import { recordPriceHolds } from '../../../../lib/price-review';
import { scrapeComponentOffers, resolveOfferPrices } from '../../../../lib/scrape-offers';
import { SCRAPE_STORE_SELECT } from '../../../../lib/stores-server';
import { BATCH_SIZE } from '../../../../lib/cron-settings';

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
      /* `disabled` علمٌ صريح: كان الزرّ في اللوحة يميّز هذه الحالة بمقارنة
         نصّ الرسالة حرفاً بحرف، فأي تحسينٍ لصياغتها كان سيحوّل «موقوف من
         اللوحة» إلى «خطأ غير معروف» في وجه الأدمن. */
      return NextResponse.json({
        disabled: true,
        message: "التحديث التلقائي معطل حالياً من لوحة التحكم.",
      }, { status: 200 });
    }

    /* ============ بوّابة التردّد ============
       الجدولة الخارجية تنادي هذا المسار كل ساعة، وعدد الدورات اليومية
       يُضبط من اللوحة. فبدل تعديل ملف workflow ثم دفعه ونشره كلّما أراد
       الأدمن تغيير التردّد، يقرّر السيرفر هنا: هل مضى ما يكفي منذ آخر دورة؟

       تُطبَّق على نداء الجدولة وحده. الأدمن الضاغط على الزرّ يقصد التحديث
       الآن — وردّ "لم يحن الموعد" على ضغطة صريحة سلوكٌ يحيّر لا يحمي.

       هامش الدقيقتين: مشغّلات الكرون تتأخّر قليلاً وتتقدّم قليلاً، ومقارنة
       صارمة كانت ستُسقط دورةً كاملة لتأخّر ثوانٍ ثم تنتظر ساعة أخرى.

       ---- ولماذا نافذة التشغيلة ----
       الدورة الواحدة ليست نداءً واحداً: مهلة الدالة ٦٠ث لا تكفي إلا لـ٣٥
       قطعة، فالـworkflow ينادي المسار دفعتين متتاليتين. بمقارنة زمنية
       ساذجة تكتب الدفعةُ الأولى الطابعَ فتُرفض الثانية بعد ثوانٍ — فتنزل
       التغطية من ٤٢٠ فرصة يومياً إلى ٢١٠، أي أقلّ من عدد القطع، وهو الخلل
       نفسه الذي أصلحناه من البداية عائداً من باب آخر.

       فالنداء ضمن RUN_WINDOW من بداية الدورة يُعدّ **استكمالاً** لها لا
       دورةً جديدة: يمرّ، ولا يُحرّك الطابع. النافذة (١٠د) أقصر من أقصر
       فترة ممكنة (ساعة عند تردّد ٢٤) فلا تبتلع دورةً تالية. */
    const perDay = Math.min(24, Math.max(1, setting?.updatesPerDay ?? 6));
    const intervalMs = (24 / perDay) * 3600_000;
    const RUN_WINDOW_MS = 10 * 60_000;
    const lastRun = setting?.lastCronRunAt?.getTime() ?? 0;
    const sinceLast = Date.now() - lastRun;

    const isContinuation = lastRun > 0 && sinceLast < RUN_WINDOW_MS;
    const isDue = lastRun === 0 || sinceLast >= intervalMs - 120_000;

    if (isValidCron && !isContinuation && !isDue) {
      const remainingMin = Math.ceil((intervalMs - sinceLast) / 60_000);
      return NextResponse.json({
        message: `لم يحن موعد الدورة القادمة — التردّد ${perDay} مرّات يومياً، وتبقّى ~${remainingMin} دقيقة.`,
        skipped: true,
        updatesPerDay: perDay,
      }, { status: 200 });
    }

    /* نُعلّم البداية لا النهاية: لو تعثّرت الدورة في منتصفها، لا تنطلق
       التالية فوراً فتتراكم دورتان على نفس المتاجر.
       والاستكمال لا يُعيد الكتابة، وإلا زحف الطابع مع كل دفعة فامتدّت
       نافذة التشغيلة بلا نهاية.

       ⚠️ ونداء الأدمن لا يكتبه إطلاقاً. كان يكتبه، فصار ضغطُ زرّ «تحديث
       يدوي» — وهو دفعةٌ واحدة تمسّ عشر قطع — يُزيح الدورة المجدولة ساعاتٍ
       عن موعدها، فتبقى بقيّة الكتالوج بلا سحبٍ لأن أحداً حدّث عشر قطع.
       رُصد فعلاً يوم 2026-08-13: كنسةٌ يدوية عند 08:38 جعلت كل نداءات
       الجدولة من 09:00 إلى 14:00 تُردّ بـskipped.

       والطابع الآن يعني ما يقوله: **آخر دورة مجدولة**. */
    if (isValidCron && !isContinuation) {
      await prisma.systemSetting.update({
        where: { id: "default" },
        data: { lastCronRunAt: new Date() },
      });
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
    const batchSize = limitParam > 0 ? Math.min(limitParam, BATCH_SIZE) : BATCH_SIZE;
    const components = await prisma.component.findMany({
      where: searchConditions,
      /* الأقدم سحباً أولاً، والتي لم تُسحب قط في المقدّمة تماماً.
         (كان الترتيب بـ updatedAt فتقفز أي قطعة تعدّلها لآخر الطابور.) */
      orderBy: { lastScrapedAt: { sort: 'asc', nulls: 'first' } },
      take: batchSize,
      include: {
        offers: {
          where: { store: { active: true, scrapeMode: { not: 'off' } } },
          include: { store: { select: SCRAPE_STORE_SELECT } },
        },
      },
    });

    let updatedCount = 0;
    let heldCount = 0; // ارتفاعات جديدة تنتظر قرارك في اللوحة
    let updatedItems: { name: string; tags: string; storeLinks: string[]; notable: boolean }[] = [];
    let allErrors: string[] = [];

    /* ============ حماية زمنية بطبقتين ============
       سقف دالة فيرسل ٦٠ث، وتجاوزه يعني 504 وضياع الردّ (وإن حُفظت البيانات).

       الطبقة الأولى — الميزانية: نتوقّف عن بدء عمل جديد بعد ٤٢ث.
       الطبقة الثانية — المهلة الصارمة: كل طلب شبكة يعرف متى تنتهي الدورة
       فيقصّر مهلته بنفسه. بلا هذه، طلبٌ واحد بطيء (٢٠ث، و٤٣ث مع إعادة
       محاولة 429) يتجاوز السقف مهما ضيّقنا الميزانية — وهو ما حدث في أوّل
       تشغيلة جدولة عملت فعلاً: الدفعة الأولى ٣٦ث ✓ والثانية 504.

       والفحص صار كل ٥ قطع لا كل ١٠: الفحص بين الدفعات يترك تجاوزاً بمقدار
       زمن الدفعة كاملة، وتنصيفها ينصّف التجاوز. (التزامن لا يتأثّر — يحكمه
       بوّابة SCRAPE_CONCURRENCY لا حجم الدفعة.) */
    const startTime = Date.now();
    const TIME_BUDGET_MS = 42000;
    setScrapeDeadline(52000); // آخر لحظة يُسمح فيها لطلب شبكة أن يتنفّس
    let stoppedEarly = false;

    const chunkSize = 5;
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
        /* رصد الانخفاض: نحفظه فقط إن تجاوز العتبة (٣٪) — دون ذلك
           تذبذبٌ لا يستحق أن يُعلَن "تخفيضاً" في الرئيسية. */
        const drop = dropPercent(comp.price, resolved.lowestPrice);
        await prisma.component.update({
          where: { id: comp.id },
          data: {
            price: resolved.lowestPrice,
            lastScrapedAt: new Date(),
            ...(drop > 0 ? { previousPrice: comp.price, priceDroppedAt: new Date() } : {}),
          },
        });
        await recordPriceHistory(prisma, comp.id, resolved.pricePoints);
        heldCount += await recordPriceHolds(prisma, comp.id, resolved.holds, resolved.settled);

        /* ---- ما الذي يستحقّ إشعاراً؟ ----
           كان الإشعار يسرد كل قطعة فُحصت — ثلاثين اسماً في كل دورة أغلبها
           بلا تغيير، فيصير الإشعار ضجيجاً يُتجاوَز بالنظر وتضيع فيه الأخبار
           الحقيقية. الآن لا يُذكر إلا ما فيه جديد.

           والعتبة هي نفسها عتبة قسم «انخفضت أسعارها» في الرئيسية (٣٪):
           كان وسم «سعر لقطة» يُطلق على أي انخفاض ولو ريالاً واحداً — فينبّه
           المشتركين في الرتبة على تذبذب تقريب. dropPercent يُصفّر ما دون
           العتبة، فيكفي أن يكون أكبر من صفر. */
        const dropPct = drop;
        const hasStoreDiscount = resolved.discountPct >= MIN_DROP_PERCENT;
        const notable = dropPct > 0 || hasStoreDiscount || resolved.restocked;

        const alertTag = dropPct > 0
          ? ` 📉 **نزل ${dropPct}%!** <@&1510204041588900023>`
          : "";
        const restockTag = resolved.restocked
          ? " 📦 **توفرت من جديد!** <@&1510206266243416127>"
          : "";
        const discountTag = hasStoreDiscount
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
        /* الاسم والوسوم منفصلان: الوسوم تحمل خطّها العريض بنفسها، ولفّ
           السطر كلّه بـ** كان يُنتج **اسم **خصم ١٣٪**** — تعشيشٌ يكسر
           ماركداون ديسكورد فيظهر النجم حرفاً. */
        updatedItems.push({
          name: comp.name,
          tags: `${alertTag}${restockTag}${discountTag}`,
          storeLinks: stores,
          notable,
        });
      }));
    }

    /* يبقى شاملاً كل ما فُحص: زرّ اللوحة يقرأ طوله ليعرف هل بقيت قطع
       (updatedNames.length === 0 → توقّف). تصفيته للإشعار كانت ستوقف
       الزرّ بعد أوّل دفعة بلا تخفيضات. */
    const updatedNames = updatedItems.map(item => `${item.name}${item.tags}`);

    // الإشعار للأحداث لا للجرد: صمتٌ حين لا جديد أصدق من قائمة بلا خبر
    const notableItems = updatedItems.filter(item => item.notable);

    if (notableItems.length > 0 && process.env.DISCORD_WEBHOOK_URL) {
      try {
        let descriptionText = `فُحصت **${updatedCount}** قطعة · **${notableItems.length}** عليها جديد.\n\n` +
          notableItems.map(item => {
            const linksText = item.storeLinks.length > 0 ? item.storeLinks.join(" | ") : "لا توجد روابط ⚠️";
            return `**${item.name}**${item.tags}\n↳ ${linksText}`;
          }).join("\n\n");

        if (descriptionText.length > 4000) {
          descriptionText = descriptionText.substring(0, 4000) + "\n\n**... (تم قص باقي الرسالة لتجاوز حد أحرف ديسكورد)**";
        }

        const discordPayload = {
          embeds: [
            {
              // العنوان يصف الخبر لا العملية — الإشعار لم يعد جرداً لما فُحص
              title: "📉 تغيّرات في الأسعار والتوفّر",
              description: descriptionText,
              color: 15277667, // وردي — لون التخفيضات نفسه في الموقع

              timestamp: new Date().toISOString()
            }
          ]
        };

        /* مهلة صريحة: هذا النداء يأتي **بعد** انتهاء ميزانية الدورة، وكان
           بلا مهلة إطلاقاً. فديسكورد بطيء أو محجوب يعلّق الدالة حتى يقتلها
           فيرسل بـ504 — فيضيع ردٌّ عن عملٍ اكتمل كلّه. الإشعار كماليّ،
           والدورة ليست كذلك. */
        const discordCtrl = new AbortController();
        const discordTimer = setTimeout(() => discordCtrl.abort(), 4000);
        try {
          await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(discordPayload),
            signal: discordCtrl.signal,
          });
        } finally {
          clearTimeout(discordTimer);
        }
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
      batchSize,
      /* العدد المُنجَز فعلاً لا حجم الدفعة المجلوبة: مع التوقّف المبكر كان
         السجلّ يقول «35/225 قطعة» وقد فُحصت 25، ويحسب الرصيد على 35. */
      processed: updatedCount,
      elapsedSeconds: elapsedSec,
      stoppedEarly,
      heldForReview: heldCount, // يظهر في سجلّ الـworkflow فتعرف أن ثمّة ما يُراجَع
      /* على المُنجَز لا على حجم الدفعة، وبالمعامل المقيس لا المقدَّر:
         قِيس فعلياً من عدّاد Scrape.do (٢٠٢٦-٠٨-١١) أن الطلب العادي = ١
         والمتقدّم super=true = ١٠، وأن القطعة تكلّف ١٦٫١ طلباً وسطياً. */
      estimatedCredits: Math.round(updatedCount * 16.1),
      errors: allErrors.length > 0 ? allErrors : null
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
