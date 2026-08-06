import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { scrapeGeneric } from '../../../../lib/scrape-generic';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * «اختبر المتجر» — يجلب صفحة منتج واحدة بإعدادات المتجر ويُرجع ما قرأه.
 *
 * الغاية: أن يعرف الأدمن **قبل** اعتماد المتجر هل تنجح القراءة التلقائية
 * أم يحتاج محدّد CSS — بدل أن يكتشف ذلك بعد ربط عشرات القطع به.
 * الإعدادات تُقرأ من النموذج مباشرة (لا من القاعدة) ليختبر قبل الحفظ.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const token = process.env.SCRAPER_API_KEY;
  if (!token) return NextResponse.json({ error: 'SCRAPER_API_KEY غير مضبوط' }, { status: 500 });

  try {
    const body = await req.json();
    const url = String(body.url || '').trim();
    if (!url.startsWith('http')) {
      return NextResponse.json({ error: 'ألصق رابط منتج كاملاً يبدأ بـ https' }, { status: 400 });
    }

    // متجر محفوظ (بالمعرّف) أو إعدادات مؤقّتة من النموذج قبل الحفظ
    const saved = body.storeId
      ? await prisma.store.findUnique({ where: { id: body.storeId } })
      : null;

    const store = {
      slug: saved?.slug || 'test',
      name: body.name || saved?.name || 'المتجر',
      currency: body.currency || saved?.currency || 'SAR',
      rateToSar: Number(body.rateToSar ?? saved?.rateToSar ?? 1) || 1,
      // الاختبار يتجاهل native: الغاية فحص القراءة العامة لا المحرّك المخصّص
      scrapeMode: body.scrapeMode === 'custom' ? 'custom' : 'auto',
      priceSelector: body.priceSelector || saved?.priceSelector || null,
      listSelector: body.listSelector || saved?.listSelector || null,
      stockSelector: body.stockSelector || saved?.stockSelector || null,
      premiumProxy: body.premiumProxy === true || body.premiumProxy === 'true',
    };

    const started = Date.now();
    const result = await scrapeGeneric(store, url, token);

    const viaLabel: Record<string, string> = {
      'json-ld': 'بيانات منظّمة (JSON-LD)',
      meta: 'وسوم meta',
      selector: 'محدّد CSS',
      none: 'لم يُقرأ',
    };

    return NextResponse.json({
      success: result.price != null,
      price: result.price,
      listPrice: result.listPrice,
      inStock: result.inStock,
      via: result.via,
      viaLabel: viaLabel[result.via],
      currencyFound: result.currencyFound,
      tookMs: Date.now() - started,
      errors: result.errors,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
