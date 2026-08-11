import { prisma } from '../../../lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImageZoom from '../ImageZoom';
import { AFFILIATE_LINK_PROPS } from '../../../lib/affiliate';
import PriceHistoryChart from '../../../components/PriceHistoryChart';
import StoreOfferList from '../../../components/StoreOfferList';
import PriceMismatchReport from '../../../components/PriceMismatchReport';
import StoreNotices from '../../../components/StoreNotice';
import { OFFER_INCLUDE, getStoreNotices } from '../../../lib/stores-server';
import { cheapestStoreNames, offerDeal } from '../../../lib/stores';
import { formatPrice } from '../../../lib/price';
import type { Metadata } from 'next';
import { productImage } from '../../../lib/image';
import RichDescription from '../../../components/RichDescription';
import { specLabel, sortedSpecs } from '../../../lib/spec-labels';

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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
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
                src={productImage(comp.imageUrl, `/images/${comp.categoryId}/boxed.png`)} 
                alt={comp.name} 
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 tracking-wider">#{comp.id.slice(-4).toUpperCase()}</span>
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-sm text-xs font-bold uppercase tracking-widest font-mono">
                {comp.category?.name}
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

            <div className="flex flex-wrap items-end gap-5 mb-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-mono uppercase tracking-widest">أقل سعر · SAR</p>
                <div className="text-4xl md:text-5xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-mono">
                  {formatPrice(comp.price)} <RiyalIcon size="h-9 w-9" />
                </div>
                {/* السعر قبل الخصم — مشطوباً، مع قيمة التوفير */}
                {mainDiscount > 0 && cheapestListPrice && (
                  <div className="flex items-center gap-2.5 mt-2">
                    <span className="text-lg font-bold text-slate-400 dark:text-slate-500 line-through font-mono" dir="ltr">
                      {formatPrice(cheapestListPrice)}
                    </span>
                    <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 rounded-sm">
                      وفّرت {formatPrice(savedAmount)} ﷼
                    </span>
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

            {/* إعلانات المتاجر السارية — تشمل الموقوف، فيعرف الزائر سبب اختفائه */}
            <StoreNotices stores={notices as any} />
            <StoreOfferList offers={comp.offers as any} />
            {/* تحت الأسعار مباشرةً — عند النظر إلى الرقم لا في أسفل الصفحة */}
            <PriceMismatchReport offers={comp.offers as any} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white px-2 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
              المواصفات التقنية
            </h3>
            <div className="relative bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-t-cyan-500/70 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-6 shadow-sm h-full">
              {Object.keys(specs).length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 font-bold text-sm">
                  لا توجد مواصفات فنية مسجلة.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                  {sortedSpecs(comp.category?.name, specs).map(([key, value]) => (
                    <div key={key} className="bg-white dark:bg-[#0B1120] p-3.5 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 transition-colors group">
                      {/* التسمية للإنسان والمفتاح للكود — بلا هذا يقرأ الزائر
                          «powerConnectors» بعد توحيد المفاتيح إلى camelCase */}
                      <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1 group-hover:text-cyan-500 transition-colors">
                        {specLabel(key)}
                      </span>
                      <span className="block text-sm font-black text-slate-900 dark:text-white font-mono" dir="ltr">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white px-2 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
              نظرة عامة
            </h3>
            <div className="relative bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-t-cyan-500/70 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-6 md:p-8 shadow-sm h-full">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="text-slate-700 dark:text-slate-300 leading-loose font-medium text-[15px] md:text-base">
                  {comp.description ? <RichDescription text={comp.description} /> : "لا يوجد وصف إضافي متاح لهذه القطعة حالياً."}
                </div>
              </div>
            </div>
          </div>

        </div>
        <PriceHistoryChart componentId={comp.id} />
      </div>
    </div>
  );
}