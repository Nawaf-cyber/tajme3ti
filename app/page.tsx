import Link from 'next/link';
import type { Metadata } from 'next';

// الرئيسية هي المصدر الوحيد لـcanonical الجذر
export const metadata: Metadata = { alternates: { canonical: '/' } };
import { prisma } from '../lib/prisma';
import CompareTeaser from '../components/CompareTeaser';
import PriceDropsSection from '../components/PriceDropsSection';
import HomeBuildsCard from '../components/HomeBuildsCard';
import RiyalSign from '../components/RiyalSign';
import { productImage, IMAGE_FALLBACK } from '../lib/image';
import { formatPrice } from '../lib/price';
import { GUIDE_CATEGORIES } from '../lib/content';
import { catMeta, CATEGORY_META } from '../lib/category-meta';
import { HAS_PARTS } from '../lib/categories';
import { OFFER_INCLUDE } from '../lib/stores-server';
import { liveOffers, cheapestOffer } from '../lib/stores';
import { longDateAr } from '../lib/time-ago';

/* ⚠️ كانت revalidate = 300 فتُخزَّن النسخة ٥ دقائق، ومع stale-while-revalidate
   يرى أول زائرٍ بعدها النسخة **القديمة** ويُطلق التجديد للتالي — فالتأخير
   العملي يقارب ١٠ دقائق، ويتضاعف بتعدّد مناطق فيرسل. الصفحة تعرض أسعاراً
   وقسم تخفيضات، والسعر المتأخّر أسوأ من الصفحة الأبطأ بأجزاء الثانية. */
export const dynamic = 'force-dynamic';

/* ============ الرئيسية «المرصوصة» — شكل هـ (2026-10-29) ============
 * الرأس لوحةٌ مقسومة: العنوان ٤٦px (كان ٩٦) والأزرار وشريط الإحصاء يميناً،
 * وتجميعات اليوم الثلاث يساراً (HomeBuildsCard — كانت قسماً كاملاً تحته).
 * ثمّ الفئات بأعدادها، وأحدث القطع، والتخفيضات، والمقارنة، والمقالات.
 * ولم يعد قسم «التجميعات المقترحة» الثابت هنا؛ رابطه في بطاقة الرأس. */

/* «متجر واحد» · «متجرين» · «3 متاجر» */
const storesAr = (n: number) => (n === 1 ? 'متجر واحد' : n === 2 ? 'متجرين' : n <= 10 ? `${n} متاجر` : `${n} متجراً`);

/* ترتيب بلاطات الفئات: كما في lib/category-meta، وما لم يُسجَّل بعدها */
const CAT_ORDER = Object.keys(CATEGORY_META);
const catRank = (name: string) => { const i = CAT_ORDER.indexOf(name); return i < 0 ? 99 : i; };

export default async function HomePage() {
  const [latestComponents, latestNews, componentsCount, storesCount, categories, minPrices] = await Promise.all([
    prisma.component.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { category: true, ...OFFER_INCLUDE } }),
    prisma.news.findMany({ take: 4, orderBy: { createdAt: 'desc' } }),
    prisma.component.count(),
    prisma.store.count({ where: { active: true } }),
    prisma.category.findMany({ where: HAS_PARTS, include: { _count: { select: { components: true } } } }),
    prisma.component.groupBy({ by: ['categoryId'], where: { price: { gt: 0 } }, _min: { price: true } }),
  ]);
  const minByCat = new Map(minPrices.map((m) => [m.categoryId, m._min.price ?? 0]));
  const tiles = [...categories].sort((a, b) => catRank(a.name) - catRank(b.name));

  /* مقتطفٌ يُقصّ في الخادم (~١٦٠ حرفاً) — كانت البطاقة تحمل المقال كاملاً داخل الرابط
     ويُخفيه line-clamp وحده، فيقرأ الزاحف رابطاً بـ١٨٠٠ حرف (مراجعة أدسنس 2026-10-15) */
  const excerpt = (n: { summary: string; content: string }) => {
    const src = n.summary && n.summary !== 'بدون ملخص' ? n.summary : n.content;
    const plain = src.replace(/\[\/?[a-z]+\]/gi, '').replace(/[#*_>`]/g, '').replace(/\s+/g, ' ').trim();
    return plain.length > 160 ? `${plain.slice(0, plain.lastIndexOf(' ', 160) || 160)}…` : plain;
  };

  /* سطر المتجر تحت سعر البطاقة: «الأرخص مايكرولس · من متجرين» */
  const storeLine = (c: { offers?: any[] | null }) => {
    const live = liveOffers(c.offers as any);
    const cheapest = cheapestOffer(c.offers as any);
    if (!live.length || !cheapest) return 'غير متوفر حالياً';
    return live.length === 1 ? `${cheapest.store.name} · متجر واحد` : `الأرخص ${cheapest.store.name} · من ${storesAr(live.length)}`;
  };

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
      <span className="h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_10px] shadow-cyan-500/40"></span>
      {children}
    </h2>
  );
  const More = ({ href, children, muted = false }: { href: string; children: React.ReactNode; muted?: boolean }) => (
    <Link href={href} className={`text-[13px] font-extrabold transition-colors ${muted ? 'text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300' : 'text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300'}`}>
      {children} &larr;
    </Link>
  );

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100 transition-colors pb-16 font-sans selection:bg-cyan-500/20">
      <div className="relative z-10">

        <div className="max-w-7xl mx-auto px-4 pt-7 md:pt-9 flex flex-col gap-10">

          {/* ===== 1. الرأس المقسوم ===== */}
          <section className="relative overflow-hidden rounded-sm border-x border-b border-t-2 border-slate-200 border-t-cyan-500 dark:border-slate-800 bg-gradient-to-b from-white/80 to-white/60 dark:from-[#0F172A]/70 dark:to-[#0B1120]/50 backdrop-blur-sm shadow-sm p-5 md:p-9 flex flex-col lg:flex-row gap-8 lg:gap-10 items-center">
            <span aria-hidden="true" className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-cyan-500/60 border-l-[16px] border-l-transparent z-20"></span>
            <span aria-hidden="true" className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-cyan-500/10 blur-[56px] pointer-events-none"></span>

            <div className="relative flex-1 min-w-0 flex flex-col gap-4 animate-fade-up">
              <div className="flex items-center gap-3.5">
                {/* البرق — عنصر التوقيع؛ نهاراً بلا توهّج (الظلال السماويّة تُطفأ في globals.css) */}
                <span className="relative w-11 h-11 flex items-center justify-center shrink-0">
                  <span className="absolute inset-0 rounded-full bg-cyan-400/30 blur-[14px]"></span>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="relative w-[34px] h-[34px] text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" aria-hidden="true">
                    <path d="M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z" />
                  </svg>
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-cyan-950/30 border border-slate-200 dark:border-cyan-500/30 text-slate-600 dark:text-cyan-300 text-[11.5px] font-extrabold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse shadow-[0_0_8px_2px] shadow-cyan-500/50"></span>
                  منصة تجميع الحواسيب
                </span>
              </div>

              <h1 className="text-4xl md:text-[46px] leading-[1.12] font-black tracking-tight text-slate-900 dark:text-white">
                جمّع بثقة.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-300">من أول مرة.</span>
              </h1>

              <p className="text-base leading-relaxed font-medium text-slate-600 dark:text-slate-400 max-w-[520px]">
                نظام يفحص توافق كل قطعة برمجياً، ويقارن أسعار المتاجر. تبني بثقة، بدون أخطاء ولا ندم.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/builder" className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold py-3 px-6 rounded-sm transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2 overflow-hidden">
                  <span className="relative z-10">ابدأ التجميع الذكي</span>
                  <span className="relative z-10 group-hover:-translate-x-1 transition-transform" aria-hidden="true">&larr;</span>
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700"></span>
                </Link>
                <Link href="/components" className="bg-white dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 dark:hover:text-cyan-300 font-extrabold py-3 px-6 rounded-sm transition-all duration-300 text-sm shadow-sm hover:-translate-y-0.5 text-center">
                  تصفّح القطع
                </Link>
              </div>

              {/* شريط الإحصاء المدمج */}
              <div className="flex max-w-[520px] w-full bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/90 rounded-sm overflow-hidden">
                <div className="flex-1 py-3.5 px-3 border-l border-slate-200 dark:border-slate-800/90">
                  <div className="font-black text-cyan-600 dark:text-cyan-400 text-2xl tracking-tight font-mono" dir="ltr">100%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">فحص توافق دقيق</div>
                </div>
                <div className="flex-1 py-3.5 px-3 border-l border-slate-200 dark:border-slate-800/90">
                  <div className="font-black text-slate-900 dark:text-white text-2xl tracking-tight font-mono" dir="ltr">+{componentsCount}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">قطعة جاهزة</div>
                </div>
                <div className="flex-1 py-3.5 px-3">
                  <div className="font-black text-emerald-600 dark:text-emerald-400 text-2xl tracking-tight">حيّة</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">أسعار من {storesAr(storesCount)}</div>
                </div>
              </div>
            </div>

            <HomeBuildsCard />
          </section>

          {/* ===== 2. تصفّح بالفئة — بأعدادها وأرخص سعر ===== */}
          <section className="flex flex-col gap-3.5">
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <div>
                <Heading>تصفّح بالفئة</Heading>
                <p className="mt-1.5 ms-4 text-[11.5px] font-bold text-slate-500 dark:text-slate-400">
                  {componentsCount} قطعة من {storesAr(storesCount)} سعودية · الأسعار تتحدّث آلياً عدّة مرّات يومياً
                </p>
              </div>
              <More href="/components">كل القطع</More>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {tiles.map((cat) => {
                const min = minByCat.get(cat.id) ?? 0;
                const hint = cat.name === 'RAM' ? 'DDR4 وDDR5' : cat.name === 'Storage' ? 'NVMe وSATA' : min > 0 ? `من ${formatPrice(min)} ريال` : '';
                return (
                  <Link
                    key={cat.id}
                    href={`/components?cat=${encodeURIComponent(cat.name)}`}
                    className="group relative overflow-hidden flex flex-col gap-1.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0F172A]/60 px-3.5 pt-3.5 pb-3 hover:border-cyan-400/60 dark:hover:border-cyan-500/50 hover:shadow-[inset_0_2px_0_rgba(6,182,212,0.7)] transition-all"
                  >
                    <b className="text-[14px] font-extrabold text-slate-800 dark:text-slate-200">{catMeta(cat.name).label}</b>
                    <span className="font-mono text-[22px] font-black leading-none text-slate-900 dark:text-white tabular-nums" dir="ltr">
                      {cat._count.components}<small className="ms-1 text-[11px] font-bold text-slate-500 dark:text-slate-500 font-sans">قطعة</small>
                    </span>
                    <span className="text-[11.5px] font-bold text-slate-500 dark:text-slate-500">{hint}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ===== 3. أحدث القطع ===== */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <Heading>أحدث القطع المضافة</Heading>
              <More href="/components">عرض الكل</More>
            </div>
            {latestComponents.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-sm text-slate-500 font-medium">
                لا توجد قطع مضافة حالياً في النظام.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* ثلاثٌ على الجوال لا ستّ: كانت البطاقات الستّ وحدها شاشتين ونصفاً (تجربة المستخدمين
                    2026-10-17)، و«عرض الكل» فوقها. والستّ كلّها في HTML وعلى الشاشات الأعرض. */}
                {latestComponents.map((comp, i) => (
                  <Link href={`/components/${comp.id}`} key={comp.id} className={`${i >= 3 ? 'max-sm:hidden ' : ''}group flex flex-col overflow-hidden rounded-sm border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm hover:border-cyan-400/50 dark:hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300`}>
                    <span className="relative h-[150px] bg-slate-50 dark:bg-white p-3.5 flex items-center justify-center border-b border-slate-100 dark:border-slate-200">
                      <img src={productImage(comp.imageUrl, IMAGE_FALLBACK)} alt={comp.name} className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-sm group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white dark:bg-slate-100 border border-slate-200 text-[11px] font-black text-slate-600 rounded-sm">
                        {comp.category?.name ? catMeta(comp.category.name).label : ''}
                      </span>
                    </span>
                    <span className="flex flex-col gap-1 px-4 pt-3.5 pb-4">
                      <span className="text-[11.5px] font-extrabold text-slate-500 dark:text-slate-300">{comp.brand}</span>
                      <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug truncate">{comp.name}</h3>
                      <span className="flex items-center justify-between gap-2 mt-2">
                        <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums" dir="ltr">{formatPrice(comp.price)}<RiyalSign /></span>
                        <span className="text-[11.5px] font-bold text-slate-500 dark:text-slate-500 truncate">{storeLine(comp)}</span>
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ===== 4. التخفيضات — تحتفظ بقسمها (ليست في شكل هـ، وأُبقيت لقيمتها) ===== */}
        <div className="mt-4">
          <PriceDropsSection />
        </div>

        <div className="max-w-7xl mx-auto px-4 flex flex-col gap-10">
          {/* ===== 5. المقارنة ===== */}
          <CompareTeaser />

          {/* ===== 6. أحدث المقالات ===== */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <Heading>أحدث المقالات</Heading>
              {/* القائمة أدلّةٌ وأخبار معاً */}
              <span className="flex items-center gap-4">
                <More href="/guides">الأدلّة</More>
                <More href="/news" muted>الأخبار</More>
              </span>
            </div>
            {latestNews.length === 0 ? (
              <div className="text-center py-12 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-sm text-slate-500 font-medium">
                لا توجد أخبار مضافة حالياً.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {latestNews.map((n, i) => {
                  const big = i === 0;
                  return (
                    <Link
                      key={n.id}
                      href={`${GUIDE_CATEGORIES.includes(n.category) ? '/guides' : '/news'}/${n.id}`}
                      className={`group flex flex-col justify-between gap-2.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm p-5 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300 ${big ? 'lg:col-span-2 lg:row-span-2' : i === 3 ? 'lg:col-span-2' : ''}`}
                    >
                      <span>
                        <span className="inline-block text-[11px] font-extrabold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border border-transparent dark:border-cyan-500/20 px-2.5 py-1 rounded-sm">
                          {longDateAr(n.createdAt)}{n.category ? ` · ${n.category}` : ''}
                        </span>
                        <h3 className={`${big ? 'text-2xl mt-3' : 'text-[15px] mt-2.5'} font-black text-slate-900 dark:text-white leading-[1.5] line-clamp-3 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors`}>
                          {n.title}
                        </h3>
                        {big && (
                          <p className="mt-3 text-[13px] font-medium leading-[1.8] text-slate-500 dark:text-slate-400 line-clamp-4">{excerpt(n)}</p>
                        )}
                      </span>
                      {big && <span className="text-[12.5px] font-extrabold text-cyan-700 dark:text-cyan-400">اقرأ المقال &larr;</span>}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}
