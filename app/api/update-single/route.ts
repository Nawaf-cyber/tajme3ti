import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import {
  scrapeComponent,
  resolvePrices,
  recordPriceHistory,
  type ScrapeTarget,
} from '../../../lib/scrape-prices';

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

    const comp = await prisma.component.findUnique({ where: { id } });
    if (!comp) return NextResponse.json({ error: "القطعة غير موجودة" }, { status: 404 });

    // ملاحظة: الخدمة المستخدمة هي Scrape.do (token)، لا ScraperAPI.
    // اسم المتغيّر تاريخي — القيمة هي توكن Scrape.do من dashboard.scrape.do
    const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
    if (!SCRAPER_API_KEY) return NextResponse.json({ error: "SCRAPER_API_KEY غير مضبوط" }, { status: 500 });

    if (!comp.amazonUrl && !comp.cazasouqUrl && !comp.microlessUrl) {
      return NextResponse.json({ error: "لا يوجد رابط متجر واحد لهذه القطعة" }, { status: 400 });
    }

    // ---- السحب والحساب: نفس منطق الكرون ----
    const scraped = await scrapeComponent(comp as ScrapeTarget, SCRAPER_API_KEY);
    const resolved = resolvePrices(comp as ScrapeTarget, scraped);

    await prisma.component.update({ where: { id }, data: resolved.data });

    // سجلّ الأسعار — نقطة واحدة لكل متجر في اليوم (كان مفقوداً هنا تماماً)
    await recordPriceHistory(prisma, id, resolved.pricePoints);

    return NextResponse.json({
      success: true,
      price: resolved.lowestPrice,
      previousPrice: comp.price,
      cheapestStore: resolved.cheapestStore,
      // تفاصيل الخصم لعرضها في لوحة الإدارة
      listPrice: resolved.cheapestListPrice,
      discountPct: resolved.discountPct,
      priceDropped: resolved.priceDropped,
      restocked: resolved.restocked,
      amazonPrice: resolved.data.amazonPrice ?? null,
      cazasouqPrice: resolved.data.cazasouqPrice ?? null,
      microlessPrice: resolved.data.microlessPrice ?? null,
      amazonInStock: scraped.amazon.inStock,
      cazasouqInStock: scraped.cazasouq.inStock,
      microlessInStock: scraped.microless.inStock,
      errors: scraped.errors.length > 0 ? scraped.errors : undefined,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
