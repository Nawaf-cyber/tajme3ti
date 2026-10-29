import { prisma } from '../../../lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImageZoom from '../ImageZoom';
import PriceHistoryChart from '../../../components/PriceHistoryChart';
import StoreOfferList from '../../../components/StoreOfferList';
import PriceMismatchReport from '../../../components/PriceMismatchReport';
import WatchPriceButton from '../../../components/WatchPriceButton';
import RigFitPanel from '../../../components/RigFitPanel';
import StoreNotices from '../../../components/StoreNotice';
import { OFFER_INCLUDE, getStoreNotices } from '../../../lib/stores-server';
import { cheapestStoreNames, offerDeal, liveOffers, priceAsOf } from '../../../lib/stores';
import { formatPrice } from '../../../lib/price';
import type { Metadata } from 'next';
import { productImage, IMAGE_FALLBACK } from '../../../lib/image';
import JsonLd, { absUrl, plainText, breadcrumbs } from '../../../components/JsonLd';
import RichDescription from '../../../components/RichDescription';
import SpecSheet from '../../../components/SpecSheet';
import { SeriesDetails, SeriesLine } from '../../../components/SeriesInfo';
import { seriesHeading } from '../../../lib/series';
import { Panel, SectionHeading, MicroLabel } from '../../../components/Panel';
import { timeAgoAr, exactAr, isPriceStale } from '../../../lib/time-ago';
import { fetchPriceStats } from '../../../lib/price-stats';
import { catMeta } from '../../../lib/category-meta';
import PartPerformance from '../../../components/PartPerformance';
import PartRating from '../../../components/PartRating';
import PricePosition from '../../../components/PricePosition';
import RiyalSign from '../../../components/RiyalSign';

/* عنوان ووصف وcanonical خاصّان بكل قطعة.
   كانت ٢٢٤ صفحة ترث عنوان الرئيسية وcanonical يشير إليها — أي "محتوى مكرّر"
   في عين جوجل، وسبب مباشر لرفض AdSense. */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const comp = await prisma.component.findUnique({
    where: { id },
    select: { name: true, brand: true, price: true, description: true, category: { select: { name: true } } },
  });

  if (!comp) {
    return { title: 'القطعة غير موجودة', robots: { index: false, follow: true } };
  }

  const full = `${comp.brand} ${comp.name}`;
  // نأخذ أول جملة من الوصف الأصلي، وإلا نبني وصفاً من البيانات
  const firstLine = (comp.description || '')
    .replace(/[#*\[\]]/g, '')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 50);

  const description = firstLine
    ? `${firstLine.slice(0, 150)}…`
    : `${full} — السعر الحالي ${formatPrice(comp.price)} ريال. قارن أسعار المتاجر السعودية، وافحص توافقها مع تجميعتك على تجميعتي.`;

  return {
    title: `${full} — السعر والمواصفات`,
    description,
    alternates: { canonical: `/components/${id}` },
    openGraph: {
      title: `${full} | تجميعتي`,
      description,
      url: `/components/${id}`,
      type: 'website',
    },
  };
}

/* تحديث حيّ: الأسعار والتوفّر وإعلانات المتاجر تتغيّر خلال اليوم، وصفحة
   مُخزَّنة ثابتة كانت ستُظهر سعراً قديماً وتُخفي إعلان عطل متجر حتى إعادة
   البناء التالية. (باقي الصفحات المسعّرة تفعل الشيء نفسه.) */
export const dynamic = 'force-dynamic';

/* ============ صفحة القطعة — شكل أ «البطاقة المرصوصة + مؤشّر السعر» (2026-10-29) ============
 * الرأس لوحةٌ واحدة: الصورة (أقصر من مربّع ٤٥٠) وتحتها عروض المتاجر في العمود
 * الأيمن؛ والاسم والسعر و«وين سعر اليوم؟» (PricePosition) والأزرار في الأيسر.
 * ثمّ تاريخ السعر (٧ أعمدة) بجانب تقييم الأداء والإطارات والملاحظات (٥)، ثمّ
 * المواصفات (٥) بجانب النظرة العامّة (٧). كلّ المنطق كما كان. */

export default async function ComponentDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const comp = await prisma.component.findUnique({
    where: { id },
    include: { category: true, ...OFFER_INCLUDE }
  });

  if (!comp) return notFound();

  const specs = typeof comp.specs === 'string' ? JSON.parse(comp.specs) : comp.specs || {};

  // إعلانات حالة المتاجر (عطل/صيانة) — تظهر قبل روابط الشراء
  const notices = await getStoreNotices();

  /* ⚠️ موضعُ السعر من تاريخه — المؤشّر في الرأس (PricePosition) والرسمُ أسفل
     الصفحة يقرآن الدالّة نفسها، فلا يظهر رقمان مختلفان لشيءٍ واحد. */
  const priceStats = await fetchPriceStats(
    comp.id,
    liveOffers(comp.offers as any).map((o) => o.store.slug),
  );

  // المتاجر صاحبة أقل سعر — قد تتساوى فنقول "متطابق في"
  const lowestStores = cheapestStoreNames(comp as any);
  const sourceText =
    lowestStores.length > 1
      ? `السعر متطابق في: ${lowestStores.join(' و ')}`
      : lowestStores.length === 1
        ? `أفضل سعر من: ${lowestStores[0]}`
        : '';

  /* الخصم على المتجر الأرخص المتوفّر — نفس الدالة التي تستخدمها صفحة
     التصفّح، فلا يظهر خصم في مكان ويغيب في آخر. */
  const deal = offerDeal(comp as any);
  const mainDiscount = deal.pct;
  const cheapestListPrice = deal.listPrice;
  const savedAmount = mainDiscount > 0 && cheapestListPrice ? cheapestListPrice - comp.price : 0;

  /* ============ متى قُرئ هذا السعر؟ ============
     الرقم المعروض مسحوبٌ من المتجر لا مكتوبٌ بيدنا، وعمرُه جزءٌ من معناه.
     ⚠️ من العرض الفائز لا من القطعة: `lastScrapedAt` تُكتب كلَّ دورةٍ حتى
     لو تُخطّيت عروضها كلّها، فتقول «منذ ٨ ساعات» على سعرٍ عمره ستّة أيام. */
  /* نسخ الشركاء على عروض هذا الصفّ — لملاحظات صفّ الشريحة العامّ (lib/series · variantNotes). */
  const variantOffers = comp.offers.map((o: any) => ({ variant: o.variant, store: { name: o.store.name } }));

  const asOf = priceAsOf(comp as any);
  const priceAge = timeAgoAr(asOf);
  const priceAgeExact = exactAr(asOf);
  const priceStale = isPriceStale(asOf);

  /* بيانات منظّمة للبحث: المنتج بأسعار المتاجر المتوفّرة الآن، ومسار التنقّل */
  const liveForLd = liveOffers(comp.offers as any);
  const ldPrices = liveForLd.map((o) => o.price as number);
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${comp.brand} ${comp.name}`,
    brand: { '@type': 'Brand', name: comp.brand },
    image: absUrl(productImage(comp.imageUrl, IMAGE_FALLBACK)),
    description: plainText(comp.description) || undefined,
    category: comp.category?.name,
    url: absUrl(`/components/${comp.id}`),
    ...(ldPrices.length ? {
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'SAR',
        lowPrice: Math.min(...ldPrices),
        highPrice: Math.max(...ldPrices),
        offerCount: ldPrices.length,
        availability: 'https://schema.org/InStock',
      },
    } : {}),
  };

  const series = comp.category?.name ? seriesHeading(comp, comp.category.name, variantOffers) : null;
  const gpuSpecs = comp.category?.name === 'GPU' ? specs : undefined;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={[productLd, breadcrumbs([['الرئيسية', '/'], ['القطع', '/components'], [comp.name, `/components/${comp.id}`]])]} />
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        <nav>
          <Link href="/components" className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors">
            <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span> عودة للقطع
          </Link>
        </nav>

        {/* ===== الرأس: الصورة وعروض المتاجر | الاسم والسعر والقرار ===== */}
        <section className="relative overflow-hidden rounded-sm border-x border-b border-t-2 border-t-cyan-500 border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white/80 to-white/60 dark:from-[#0F172A]/70 dark:to-[#0B1120]/50 backdrop-blur-sm shadow-sm p-5 md:p-8 lg:p-9 flex flex-col lg:flex-row gap-8 lg:gap-9 items-start">
          <span aria-hidden="true" className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-cyan-500/60 border-l-[16px] border-l-transparent z-20"></span>
          <span aria-hidden="true" className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/8 blur-3xl rounded-full pointer-events-none"></span>

          {/* العمود الأيمن: الصورة ثمّ المتاجر تحتها مباشرة.
              z-[100] للصورة: نافذة التكبير (ImageZoom) تُقاس على هذه اللوحة بسبب backdrop-blur */}
          <div className="relative z-[100] w-full lg:w-[400px] shrink-0 flex flex-col gap-3.5">
            <div className="w-full h-[280px] bg-white rounded-sm flex items-center justify-center p-4 shadow-md">
              <ImageZoom src={productImage(comp.imageUrl, IMAGE_FALLBACK)} alt={comp.name} />
            </div>
            {/* إعلانات المتاجر السارية — تشمل الموقوف، فيعرف الزائر سبب اختفائه */}
            <StoreNotices stores={notices as any} />
            <StoreOfferList offers={comp.offers as any} rowName={comp.name} gpuSpecs={gpuSpecs} />
          </div>

          {/* العمود الأيسر */}
          <div className="relative z-[1] flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              {/* اسم الفئة بالعربية — كان «GPU» بخطٍّ لاتينيّ متباعد (تجربة المستخدمين 2026-10-17) */}
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-sm text-xs font-bold">
                {comp.category?.name ? catMeta(comp.category.name).label : ''}
              </span>
              <span className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-sm text-xs font-bold uppercase tracking-widest border border-cyan-500/40 font-mono">
                {comp.brand}
              </span>
            </div>

            <div className="flex items-start gap-3 mb-2.5">
              <h1 className="text-3xl md:text-[40px] font-black leading-[1.15] text-slate-900 dark:text-white">
                {comp.name}
              </h1>
              {mainDiscount > 0 && (
                <span className="shrink-0 mt-2 px-2.5 py-1 rounded-sm bg-rose-500 text-white text-xs font-black font-mono shadow-[0_0_12px_rgba(244,63,94,0.5)]">
                  ‎-{mainDiscount}%
                </span>
              )}
            </div>

            {/* تحت الاسم: السلسلة والضمان من هويّة القطعة، يُقرآن معها قبل السعر */}
            {comp.category?.name && (
              <SeriesLine
                part={{ brand: comp.brand, name: comp.name }}
                category={comp.category.name}
                offers={variantOffers}
                href="#series"
                className="mb-5 text-[13px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed"
              />
            )}

            <MicroLabel className="mb-1.5">أقل سعر متاح</MicroLabel>
            <div className="flex flex-wrap items-end gap-4 mb-2">
              {/* سعرٌ صفر = لا سعر مسجّل — لا «0 ريال» */}
              {comp.price > 0 ? (
                <div className="text-5xl md:text-[46px] leading-none font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums" dir="ltr">
                  {formatPrice(comp.price)}<RiyalSign className="text-emerald-500" />
                </div>
              ) : (
                <div className="text-2xl font-black text-slate-500 dark:text-slate-400">غير متوفر — لا سعر مسجّل</div>
              )}
              {sourceText && (
                <div className="px-3.5 py-2 mb-1 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-sm text-emerald-800 dark:text-emerald-400 text-[13px] font-extrabold flex items-center gap-2 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse"></span>
                  {sourceText}
                </div>
              )}
            </div>

            {/* السعر قبل الخصم — مشطوباً، مع قيمة التوفير («توفّر» لا «وفّرت»: الزائر لم يشترِ بعد) */}
            {mainDiscount > 0 && cheapestListPrice && (
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-lg font-bold text-slate-400 dark:text-slate-500 line-through font-mono" dir="ltr">{formatPrice(cheapestListPrice)}</span>
                <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 rounded-sm">
                  توفّر {formatPrice(savedAmount)} ﷼
                </span>
              </div>
            )}

            {/* عمر السعر — صفةٌ للرقم لا معلومةٌ جانبية؛ يصفرّ بعد يوم كامل */}
            {priceAge && (
              <p title={priceAgeExact} className={`mb-4 flex items-center gap-1.5 text-[12px] font-bold ${priceStale ? 'text-amber-600 dark:text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>
                <span aria-hidden>{priceStale ? '⏸' : '🕒'}</span>
                <span>آخر تحديث للسعر {priceAge}</span>
              </p>
            )}

            {/* «هل السعر جيّد الآن؟» عند الرقم — كان الجواب في رسمٍ أسفل الصفحة بعد ستّ شاشات */}
            {priceStats && comp.price > 0 && <PricePosition now={comp.price} stats={priceStats} />}

            {/* ما بعد القراءة: الإضافة تدمج القطعة في مسودّة الباني ولا تمحوها (PCBuilderClient · ?add=) */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Link href={`/builder?add=${comp.id}`} className="flex items-center justify-center gap-1.5 py-2.5 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[13px] font-black hover:opacity-90 transition-opacity">
                ＋ أضفها لتجميعتي
              </Link>
              <Link href={`/compare?ids=${comp.id}`} className="flex items-center justify-center gap-1.5 py-2.5 rounded-sm border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[13px] font-black hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors">
                ⚖ قارنها بغيرها
              </Link>
            </div>

            {/* «تابع السعر» هنا لا في أسفل الصفحة: القرار يُتّخذ عند رؤية الرقم */}
            <WatchPriceButton componentId={comp.id} />
            {/* «هل تناسب جهازي؟» سؤالُ قرار — فوق «بلّغ عن فرق» */}
            <RigFitPanel category={comp.category?.name as any} part={comp as any} />
            <PriceMismatchReport offers={comp.offers as any} />
          </div>
        </section>

        {/* ===== تاريخ السعر | تقييم الأداء والإطارات والملاحظات ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 min-w-0">
            {/* المتاجر التي تبيعها الآن — الرسم يحتاجها لأن سجلّ الأسعار لا يخزّن التوفّر */}
            <PriceHistoryChart componentId={comp.id} liveStores={liveOffers(comp.offers as any).map((o) => o.store.slug)} />
          </div>
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* تقييم الأداء بكلمةٍ وشريط ورقمٍ مقيس (lib/perf-rating) */}
            <PartRating category={comp.category?.name} name={comp.name} specs={specs} />
            <PartPerformance category={comp.category?.name} name={comp.name} specs={specs} />
            {/* ما تنشره الشركة عن سلسلتها وضمانها، وما قاله عنها مختبرٌ مستقلّ (lib/series.ts) */}
            {series && comp.category?.name && (
              <div id="series" className="scroll-mt-24 flex flex-col gap-4">
                <SectionHeading>{series}</SectionHeading>
                <Panel className="px-6 py-5">
                  <SeriesDetails part={{ brand: comp.brand, name: comp.name }} category={comp.category.name} offers={variantOffers} />
                </Panel>
              </div>
            )}
          </div>
        </div>

        {/* ===== المواصفات | نظرة عامة ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <SectionHeading>المواصفات التقنية</SectionHeading>
            {/* بلا h-full: اللوحة تحتضن محتواها ولا تُشدّ لطول الوصف */}
            <Panel className="px-6 py-4">
              <SpecSheet categoryName={comp.category?.name} specs={specs} />
            </Panel>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-4">
            <SectionHeading>نظرة عامة</SectionHeading>
            <Panel className="p-6 md:p-8">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="text-slate-700 dark:text-slate-300 leading-loose font-medium text-[15px] md:text-base">
                  {comp.description ? <RichDescription text={comp.description} /> : "لا يوجد وصف إضافي متاح لهذه القطعة حالياً."}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
