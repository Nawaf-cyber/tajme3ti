import { prisma } from '../../../lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImageZoom from '../ImageZoom';
import { AFFILIATE_LINK_PROPS } from '../../../lib/affiliate';
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
import { pctAboveMin, daysAr } from '../../../lib/price-stats-core';
import { catMeta } from '../../../lib/category-meta';
import PartPerformance from '../../../components/PartPerformance';

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
  const cat = comp.category?.name || 'قطعة';
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

const RiyalIcon = ({ size = 'h-6 w-6' }: { size?: string }) => (
  <div 
    className={`${size} bg-emerald-500 inline-block align-middle`} 
    style={{ 
      maskImage: "url('/riyal.svg')", 
      WebkitMaskImage: "url('/riyal.svg')", 
      maskSize: 'contain', 
      WebkitMaskSize: 'contain', 
      maskRepeat: 'no-repeat', 
      WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskPosition: 'center'
    }} 
  />
);


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

  /* ⚠️ موضعُ السعر من تاريخه — يُعرض فوق قائمة العروض حين لا يوجد إلّا
     متجرٌ واحد (وذاك حالُ ١٩٢ قطعةً من ٣٣١). ونفسُ الدالّة يستعملها الرسم
     أسفل الصفحة، فلا يظهر رقمان مختلفان لشيءٍ واحد. */
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
     الرقم المعروض مسحوبٌ من المتجر لا مكتوبٌ بيدنا، وعمرُه جزءٌ من معناه:
     «٥٬٢٩٠ ﷼» قبل ساعتين معلومة، ونفسها قبل أسبوع تخمين. وبدون الطابع كان
     الزائر يفترض الأحدث دائماً، فإن وجد المتجر مختلفاً ظنّ الموقع كاذباً لا
     متأخّراً.

     المصدر `lastScrapedAt` على القطعة: يُكتب في المعاملة نفسها التي تكتب
     أسعار العروض (راجع مسار الكرون)، فهو طابع السعر المعروض نفسه لا طابعاً
     مجاوراً له. */
  /* ⚠️ من العرض الفائز لا من القطعة: `lastScrapedAt` تُكتب كلَّ دورةٍ حتى
     لو تُخطّيت عروضها كلّها، فتقول «منذ ٨ ساعات» على سعرٍ عمره ستّة أيام. */
  /* نسخ الشركاء على عروض هذا الصفّ — لملاحظات صفّ الشريحة العامّ (lib/series · variantNotes).
     باسم المتجر العربيّ كما يُقال في النصّ: «عند أمازون، نون». */
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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={[productLd, breadcrumbs([['الرئيسية', '/'], ['القطع', '/components'], [comp.name, `/components/${comp.id}`]])]} />
      <div className="max-w-6xl mx-auto space-y-8">
        
        <nav>
          <Link href="/components" className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors">
            <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span> عودة للقطع
          </Link>
        </nav>

        <div className="relative bg-gradient-to-b from-white/80 to-white/60 dark:from-[#0F172A]/70 dark:to-[#0B1120]/50 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-6 md:p-10 shadow-sm flex flex-col lg:flex-row gap-10 items-center overflow-hidden">
          {/* زاوية هندسية */}
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-cyan-500/60 border-l-[16px] border-l-transparent z-20"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/8 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="w-full lg:w-1/2 flex justify-center relative z-[100]">
            <div className="w-full max-w-[450px] aspect-square bg-white rounded-sm flex items-center justify-center p-6 shadow-md">

              <ImageZoom 
                src={productImage(comp.imageUrl, IMAGE_FALLBACK)} 
                alt={comp.name} 
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              {/* اسم الفئة بالعربية — كان «GPU» بخطٍّ لاتينيّ متباعد (تجربة المستخدمين 2026-10-17) */}
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-sm text-xs font-bold">
                {comp.category?.name ? catMeta(comp.category.name).label : ''}
              </span>
              <span className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-sm text-xs font-bold uppercase tracking-widest border border-cyan-500/40 font-mono">
                {comp.brand}
              </span>
            </div>
            
            <div className="flex items-start gap-3 mb-6">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                {comp.name}
              </h1>
              {mainDiscount > 0 && (
                <span className="shrink-0 mt-2 px-2.5 py-1 rounded-sm bg-rose-500 text-white text-xs font-black font-mono shadow-[0_0_12px_rgba(244,63,94,0.5)]">
                  ‎-{mainDiscount}%
                </span>
              )}
            </div>

            {/* تحت الاسم لا بعيداً عنه: السلسلة والضمان من هويّة القطعة، يُقرآن
                معها قبل السعر. والتفاصيل والملاحظات في قسمها تحت المواصفات. */}
            {comp.category?.name && (
              <SeriesLine
                part={{ brand: comp.brand, name: comp.name }}
                category={comp.category.name}
                offers={variantOffers}
                href="#series"
                className="-mt-3 mb-6 text-[13px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed"
              />
            )}

            <div className="flex flex-wrap items-end gap-5 mb-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                {/* كان: font-mono uppercase tracking-widest بحجم ١٠ بكسل.
                    ثلاثتها تؤذي العربية — انظر MicroLabel في Panel.tsx */}
                <MicroLabel className="mb-2">أقل سعر متاح</MicroLabel>
                {/* سعرٌ صفر = لا سعر مسجّل (نُزع عرضٌ خاطئ ولم يبقَ ما يسنده) — لا «0 ريال» */}
                {comp.price > 0 ? (
                  <div className="text-4xl md:text-5xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-mono">
                    {formatPrice(comp.price)} <RiyalIcon size="h-9 w-9" />
                  </div>
                ) : (
                  <div className="text-2xl font-black text-slate-500 dark:text-slate-400">غير متوفر — لا سعر مسجّل</div>
                )}
                {/* السعر قبل الخصم — مشطوباً، مع قيمة التوفير */}
                {mainDiscount > 0 && cheapestListPrice && (
                  <div className="flex items-center gap-2.5 mt-2">
                    <span className="text-lg font-bold text-slate-400 dark:text-slate-500 line-through font-mono" dir="ltr">
                      {formatPrice(cheapestListPrice)}
                    </span>
                    <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 rounded-sm">
                      {/* «توفّر» لا «وفّرت»: الزائر لم يشترِ بعد */}
                      توفّر {formatPrice(savedAmount)} ﷼
                    </span>
                  </div>
                )}

                {/* عمر السعر — تحت الرقم مباشرةً لأنه صفةٌ له لا معلومةٌ جانبية.
                    يصفرّ بعد يوم كامل: إشارةٌ هادئة أن الدورة تأخّرت، بلا
                    إنذارٍ أحمر يخيف من رقمٍ غالباً ما يزال صحيحاً. */}
                {priceAge && (
                  <div
                    title={priceAgeExact}
                    className={`flex items-center gap-1.5 mt-2.5 text-[12px] font-bold ${
                      priceStale
                        ? 'text-amber-600 dark:text-amber-500'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span aria-hidden>{priceStale ? '⏸' : '🕒'}</span>
                    <span>آخر تحديث للسعر {priceAge}</span>
                  </div>
                )}
              </div>
              {sourceText && (
                <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-sm text-emerald-800 dark:text-emerald-400 text-sm font-extrabold flex items-center gap-2 mb-1 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse"></span>
                  {sourceText}
                </div>
              )}
            </div>

            {/* «هل السعر جيّد الآن؟» عند الرقم — كان الجواب في رسمٍ أسفل الصفحة بعد ستّ شاشاتٍ
                على الجوال (تجربة المستخدمين 2026-10-17). ومتجرٌ واحد له ملاحظته في قائمة العروض. */}
            {priceStats && comp.price > 0 && liveForLd.length > 1 && (() => {
              const pct = pctAboveMin(comp.price, priceStats.min);
              return (
                <p className={`-mt-1 mb-4 text-[13px] font-bold leading-relaxed ${pct <= 2 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pct <= 2
                    ? <>✓ سعرها اليوم عند أدنى ما رصدناه خلال {daysAr(priceStats.days)} من المتابعة.</>
                    : <>سعرها اليوم أعلى من أدنى ما رصدناه (<span className="font-mono">{Math.round(priceStats.min).toLocaleString('en-US')}</span> ﷼) بـ{pct}% — خلال {daysAr(priceStats.days)} من المتابعة.</>}
                  {' '}<a href="#price-history" className="text-cyan-700 dark:text-cyan-400 underline underline-offset-2">شاهد الرسم ↓</a>
                </p>
              );
            })()}

            {/* ما بعد القراءة: كانت الصفحة طريقاً مسدوداً إلّا الخروج إلى متجر — لا «أضفها لتجميعتي»
                ولا «قارنها»، والقادم من البحث يهبط هنا (تجربة المستخدمين 2026-10-17).
                والإضافة تدمج القطعة في مسودّة الباني ولا تمحوها (PCBuilderClient · ?add=). */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <Link
                href={`/builder?add=${comp.id}`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[13px] font-black hover:opacity-90 transition-opacity"
              >
                ＋ أضفها لتجميعتي
              </Link>
              <Link
                href={`/compare?ids=${comp.id}`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-sm border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[13px] font-black hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors"
              >
                ⚖ قارنها بغيرها
              </Link>
            </div>

            {/* إعلانات المتاجر السارية — تشمل الموقوف، فيعرف الزائر سبب اختفائه */}
            <StoreNotices stores={notices as any} />
            <StoreOfferList
              offers={comp.offers as any}
              rowName={comp.name}
              stats={priceStats}
              gpuSpecs={comp.category?.name === 'GPU' ? (typeof comp.specs === 'string' ? JSON.parse(comp.specs) : comp.specs ?? {}) : undefined}
            />
            {/* تحت الأسعار مباشرةً — عند النظر إلى الرقم لا في أسفل الصفحة */}
            <PriceMismatchReport offers={comp.offers as any} />
            {/* «تابع السعر» هنا لا في أسفل الصفحة: القرار يُتّخذ عند رؤية
                الرقم — من رآه غالياً ونزل، هذا مكان اعتراضه. */}
            <WatchPriceButton componentId={comp.id} />
            {/* ⚠️ فوق «تابع السعر» لا تحته: «هل تناسب جهازي؟» سؤالُ قرارٍ،
                و«تابع السعر» سؤالُ تأجيل. ومن يقرأ أنّها لا تناسبه لا
                يحتاج أن يتابع سعرها. */}
            <RigFitPanel category={comp.category?.name as any} part={comp as any} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-5 flex flex-col gap-4">
            <PartPerformance category={comp.category?.name} name={comp.name} specs={specs} />
            <SectionHeading>المواصفات التقنية</SectionHeading>
            {/* بلا h-full: اللوحة كانت تُشدّ لطول الوصف، فتترك تحت ثماني
                مواصفات ٢٤٢ بكسل فراغاً يبدو خللاً. تحتضن محتواها الآن. */}
            <Panel className="px-6 py-4">
              <SpecSheet categoryName={comp.category?.name} specs={specs} />
            </Panel>

            {/* ما تنشره الشركة عن سلسلتها وضمانها، وما قاله عنها مختبرٌ مستقلّ —
                كان في الباني وحده، ومن يأتي من البحث يهبط هنا. lib/series.ts */}
            {comp.category?.name && seriesHeading(comp, comp.category.name, variantOffers) && (
              <div id="series" className="scroll-mt-24 flex flex-col gap-4">
                <SectionHeading>{seriesHeading(comp, comp.category.name, variantOffers)}</SectionHeading>
                <Panel className="px-6 py-5">
                  <SeriesDetails part={{ brand: comp.brand, name: comp.name }} category={comp.category.name} offers={variantOffers} />
                </Panel>
              </div>
            )}
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
        {/* المتاجر التي تبيعها الآن — الرسم يحتاجها لأن سجلّ الأسعار لا
            يخزّن التوفّر، فبدونها يلخّص سعراً لا يبيعه أحد */}
        <PriceHistoryChart
          componentId={comp.id}
          liveStores={liveOffers(comp.offers as any).map((o) => o.store.slug)}
        />
      </div>
    </div>
  );
}