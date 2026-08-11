import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { dropPercent } from '../../../lib/price';
import { recordPriceHistory, setScrapeDeadline } from '../../../lib/scrape-prices';
import { recordPriceHolds } from '../../../lib/price-review';
import { scrapeComponentOffers, resolveOfferPrices } from '../../../lib/scrape-offers';
import { SCRAPE_STORE_SELECT } from '../../../lib/stores-server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * تحديث قطعة واحدة فوراً — بنفس منطق الكرون الشامل بالحرف.
 *
 * كان هذا المسار يحمل نسخة مكرّرة من منطق السحب القديم، فورث كل عيوبه:
 * محدّد كازاسوق الذي يقرأ منتجاً مجاوراً، وفحص التوفّر الذي يعلّم المتوفّر
 * نافداً، وحيلة الضرب ×10، وبلا تدوير ولا سعر ما قبل الخصم ولا سجلّ أسعار.
 * الآن يستدعي lib/scrape-prices — فأي إصلاح يسري على المسارين معاً.
 */
export async function POST(req: Request) {
  // حماية المسار: لوحة الإدارة فقط (يُفحص الدور من قاعدة البيانات)
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const currentUser = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  if (currentUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "معرف القطعة مطلوب" }, { status: 400 });

    /* المهلة متغيّر على مستوى الوحدة تشاركه المسارات في نسخة الدالة الواحدة.
       لو ورثنا مهلةً منتهية من دورة كرون سابقة في نسخة دافئة، لقُصّت مهلة كل
       طلب هنا إلى حدّها الأدنى وفشل التحديث بلا سبب ظاهر. فنضبطها لأنفسنا. */
    setScrapeDeadline(52000);

    const comp = await prisma.component.findUnique({
      where: { id },
      include: {
        offers: {
          where: { store: { active: true, scrapeMode: { not: 'off' } } },
          include: { store: { select: SCRAPE_STORE_SELECT } },
        },
      },
    });
    if (!comp) return NextResponse.json({ error: "القطعة غير موجودة" }, { status: 404 });

    // ملاحظة: الخدمة المستخدمة هي Scrape.do (token)، لا ScraperAPI.
    // اسم المتغيّر تاريخي — القيمة هي توكن Scrape.do من dashboard.scrape.do
    const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
    if (!SCRAPER_API_KEY) return NextResponse.json({ error: "SCRAPER_API_KEY غير مضبوط" }, { status: 500 });

    if (!comp.offers.some((o) => o.url)) {
      return NextResponse.json({ error: "لا يوجد رابط متجر واحد لهذه القطعة" }, { status: 400 });
    }

    // ---- السحب والحساب: نفس منطق الكرون ----
    const scraped = await scrapeComponentOffers(comp as any, SCRAPER_API_KEY);
    const resolved = resolveOfferPrices(comp as any, scraped.results);

    for (const u of resolved.offerUpdates) {
      await prisma.componentOffer.update({ where: { id: u.offerId }, data: u.data });
    }
    // نفس منطق الكرون: الانخفاض المعتبر يُحفظ ليظهر في الرئيسية
    const drop = dropPercent(comp.price, resolved.lowestPrice);
    await prisma.component.update({
      where: { id },
      data: {
        price: resolved.lowestPrice,
        lastScrapedAt: new Date(),
        ...(drop > 0 ? { previousPrice: comp.price, priceDroppedAt: new Date() } : {}),
      },
    });

    // سجلّ الأسعار — نقطة واحدة لكل متجر في اليوم (كان مفقوداً هنا تماماً)
    await recordPriceHistory(prisma, id, resolved.pricePoints);
    // والطابور نفسه: الزرّ اليدوي لا يُفلت ارتفاعاً يوقفه الكرون
    const held = await recordPriceHolds(prisma, id, resolved.holds, resolved.settled);

    return NextResponse.json({
      success: true,
      heldForReview: held,
      price: resolved.lowestPrice,
      previousPrice: comp.price,
      cheapestStore: resolved.cheapestStore,
      // تفاصيل الخصم لعرضها في لوحة الإدارة
      listPrice: resolved.cheapestListPrice,
      discountPct: resolved.discountPct,
      priceDropped: resolved.priceDropped,
      restocked: resolved.restocked,
      // سطر لكل متجر — تعرضه اللوحة كما هو، فالمتجر الجديد يظهر تلقائياً
      stores: resolved.lines.map((l) => ({ label: l.label, price: l.price, inStock: l.inStock })),
      errors: scraped.errors.length > 0 ? scraped.errors : undefined,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
