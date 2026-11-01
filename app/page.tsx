import Link from 'next/link';
import type { Metadata } from 'next';

// الرئيسية هي المصدر الوحيد لـcanonical الجذر
export const metadata: Metadata = { alternates: { canonical: '/' } };
import { prisma } from '../lib/prisma';
import PriceDropsSection from '../components/PriceDropsSection';
import HomeBoardHero, { HomeBoardDetails, HomePrebuilds } from '../components/HomeBoardHero';
import { homeShowcase } from '../lib/home-showcase';
import { formatPrice } from '../lib/price';
import { GUIDE_CATEGORIES } from '../lib/content';
import { catMeta, CATEGORY_META } from '../lib/category-meta';
import { HAS_PARTS } from '../lib/categories';
import { longDateAr } from '../lib/time-ago';

/* ⚠️ كانت revalidate = 300 فتُخزَّن النسخة ٥ دقائق، ومع stale-while-revalidate
   يرى أول زائرٍ بعدها النسخة **القديمة** ويُطلق التجديد للتالي — فالتأخير
   العملي يقارب ١٠ دقائق، ويتضاعف بتعدّد مناطق فيرسل. الصفحة تعرض أسعاراً
   وقسم تخفيضات، والسعر المتأخّر أسوأ من الصفحة الأبطأ بأجزاء الثانية. */
export const dynamic = 'force-dynamic';

/* ============ الرئيسية — شكل س١ «البرق في المقبس» (2026-11-01) ============
 * كان شكل هـ (رأسٌ مقسوم: عنوان ٤٦px وبطاقة تجميعات اليوم) — قال نوّاف «احسها
 * مبتذلة… ابي الصفحة توضح الموقع نفس القديمة يوم كان شعارنا بالوسط وتحسه هيبة».
 * فالرأس لوحةٌ أمّ مرسومة والشعار مكان المعالج، وتعليقاتها تشرح الموقع بأمثلةٍ
 * حيّة (components/HomeBoardHero · lib/home-showcase)، ثمّ «تفاصيل اللوحة»،
 * فالتجميعات الجاهزة الستّ، فالفئات بأعدادها، فالتخفيضات، فالمقالات.
 * ⚠️ أُزيل من الرئيسية: بطاقة تجميعات اليوم (HomeBuildsCard)، و«أحدث القطع»،
 * وCompareTeaser — مكوّناتها باقية إن أُرجعت. */

/* «متجر واحد» · «متجرين» · «3 متاجر» */
const storesAr = (n: number) => (n === 1 ? 'متجر واحد' : n === 2 ? 'متجرين' : n <= 10 ? `${n} متاجر` : `${n} متجراً`);

/* ترتيب بلاطات الفئات: كما في lib/category-meta، وما لم يُسجَّل بعدها */
const CAT_ORDER = Object.keys(CATEGORY_META);
const catRank = (name: string) => { const i = CAT_ORDER.indexOf(name); return i < 0 ? 99 : i; };

export default async function HomePage() {
  const [show, latestNews, componentsCount, storesCount, categories, minPrices] = await Promise.all([
    homeShowcase(),
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

        <div className="max-w-7xl mx-auto px-4 pt-6 xl:pt-7 flex flex-col gap-14">

          {/* ===== 1. الرأس — اللوحة الأمّ والشعار في المقبس ===== */}
          <HomeBoardHero show={show} partsCount={componentsCount} storesCount={storesCount} />

          {/* ===== 2. تفاصيل اللوحة — الأمثلة الثلاثة كاملة ===== */}
          <HomeBoardDetails show={show} />

          {/* ===== 3. التجميعات الجاهزة الستّ ===== */}
          <HomePrebuilds show={show} />

          {/* ===== 4. تصفّح بالفئة — بأعدادها وأرخص سعر ===== */}
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

        </div>

        {/* ===== 5. التخفيضات — قسمها كامل العرض ===== */}
        <div className="mt-4">
          <PriceDropsSection />
        </div>

        <div className="max-w-7xl mx-auto px-4 flex flex-col gap-10">
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
