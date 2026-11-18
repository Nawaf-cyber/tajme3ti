import Link from 'next/link';
import type { Metadata } from 'next';

// الرئيسية هي المصدر الوحيد لـcanonical الجذر
export const metadata: Metadata = { alternates: { canonical: '/' } };
import { prisma } from '../lib/prisma';
import AutoBuildsSection from '../components/AutoBuildsSection';
import CompareTeaser from '../components/CompareTeaser';
import PriceDropsSection from '../components/PriceDropsSection';
import { GUIDE_CATEGORIES } from '../lib/content';
import { BUILD_PART } from '../lib/categories';

/* ⚠️ كانت revalidate = 300 فتُخزَّن النسخة ٥ دقائق، ومع stale-while-revalidate
   يرى أول زائرٍ بعدها النسخة **القديمة** ويُطلق التجديد للتالي — فالتأخير
   العملي يقارب ١٠ دقائق، ويتضاعف بتعدّد مناطق فيرسل. الصفحة تعرض أسعاراً
   وقسم تخفيضات، والسعر المتأخّر أسوأ من الصفحة الأبطأ بأجزاء الثانية. */
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  /* عناوين التجميعات الجاهزة للسطر تحت التجميعات اليوميّة */
  const prebuilds = await prisma.prebuild.findMany({ select: { id: true, title: true }, orderBy: { price: 'asc' } });

  const latestNews = await prisma.news.findMany({
    take: 4, 
    orderBy: { createdAt: 'desc' }
  });

  const componentsCount = await prisma.component.count({ where: BUILD_PART });

  /* مقتطفٌ يُقصّ في الخادم (~١٦٠ حرفاً) — كانت البطاقة تحمل المقال كاملاً داخل الرابط
     ويُخفيه line-clamp وحده، فيقرأ الزاحف رابطاً بـ١٨٠٠ حرف (مراجعة أدسنس 2026-10-15) */
  const excerpt = (n: { summary: string; content: string }) => {
    const src = n.summary && n.summary !== 'بدون ملخص' ? n.summary : n.content;
    const plain = src.replace(/\[\/?[a-z]+\]/gi, '').replace(/[#*_>`]/g, '').replace(/\s+/g, ' ').trim();
    return plain.length > 160 ? `${plain.slice(0, plain.lastIndexOf(' ', 160) || 160)}…` : plain;
  };

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100 transition-colors pb-20 font-sans selection:bg-cyan-500/20">

      {/* حاوية المحتوى فوق الخلفية العامة */}
      <div className="relative z-10">
      
      
      {/* 1. القسم العلوي (Gaming/Tech Hero — مسارات اللوحة) */}
      {/* py-14 على الجوال لا py-24: كان القسم العلويّ وحده شاشةً ونصفاً، والصفحة عشر شاشات
          والتجميعات بالميزانية في السابعة (تجربة المستخدمين 2026-10-17) */}
      <section className="relative overflow-hidden py-14 md:py-36 flex flex-col items-center text-center px-4">

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center animate-fade-up">
          
          {/* البرق — عنصر التوقيع */}
          <div className="relative w-20 h-20 mb-7">
            <div className="absolute inset-0 bg-cyan-400/30 blur-2xl rounded-full"></div>
            {/* نهاراً لا توهّج: البرق مرسومٌ بالفرجار — دائرةُ إنشاءٍ متقطّعة
                ومحوران، كأنّه على لوح الرسم */}
            <svg viewBox="0 0 120 120" className="dark:hidden absolute -inset-5 w-[calc(100%+2.5rem)] h-[calc(100%+2.5rem)] text-cyan-700" fill="none" stroke="currentColor" aria-hidden="true">
              <circle cx="60" cy="60" r="50" strokeOpacity="0.45" strokeDasharray="3 5" />
              <circle cx="60" cy="60" r="36" strokeOpacity="0.18" />
              <path d="M60 0V18M60 102V120M0 60H18M102 60H120" strokeOpacity="0.5" />
              <path d="M57 10H63M57 110H63M10 57V63M110 57V63" strokeOpacity="0.5" />
            </svg>
            <svg viewBox="0 0 24 24" fill="currentColor" className="relative w-full h-full text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
              <path d="M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z" />
            </svg>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-cyan-950/30 backdrop-blur-sm border border-slate-200 dark:border-cyan-500/30 text-slate-600 dark:text-cyan-300 text-xs font-bold tracking-widest uppercase mb-7 shadow-sm dark:shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse shadow-[0_0_8px_2px] shadow-cyan-500/50"></span>
            منصة تجميع الحواسيب 
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 leading-[1.05]">
            جمّع بثقة. <br />
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-300">
             من أول مرة.
              <span className="absolute -inset-x-4 -inset-y-2 bg-cyan-500/10 blur-2xl -z-10 dark:bg-cyan-400/20"></span>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl font-medium leading-relaxed">
            نظام يفحص توافق كل قطعة برمجياً، ويقارن أسعار المتاجر. تبني بثقة، بدون أخطاء ولا ندم.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-10 md:mb-16 w-full sm:w-auto">
            <Link href="/builder" className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-10 rounded-sm transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 text-base flex items-center justify-center gap-2 w-full sm:w-auto overflow-hidden">
              <span className="relative z-10">ابدأ التجميع الذكي</span>
              <svg className="w-5 h-5 transform rotate-180 relative z-10 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700"></span>
            </Link>
            <Link href="/components" className="bg-white dark:bg-[#0F172A]/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 dark:hover:text-cyan-300 font-bold py-4 px-10 rounded-sm transition-all duration-300 text-base shadow-sm hover:-translate-y-0.5 w-full sm:w-auto">
              {/* باسم الصفحة التي يفتحها («تصفّح القطع») — كان «استعراض المكونات» والموقع كلّه يقول «القطع» */}
              تصفّح القطع
            </Link>
          </div>

          {/* شريط الإحصائيات المدمج */}
          <div className="flex max-w-2xl w-full bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-sm backdrop-blur-sm overflow-hidden shadow-sm">
            <div className="flex-1 py-5 px-3 border-l border-slate-200 dark:border-slate-800/60">
              <div className="font-black text-cyan-600 dark:text-cyan-400 text-2xl md:text-3xl tracking-tight" dir="ltr">100%</div>
              <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">فحص توافق دقيق</div>
            </div>
            <div className="flex-1 py-5 px-3 border-l border-slate-200 dark:border-slate-800/60">
              <div className="font-black text-slate-900 dark:text-white text-2xl md:text-3xl tracking-tight" dir="ltr">+{componentsCount}</div>
              <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">قطعة جاهزة</div>
            </div>
            <div className="flex-1 py-5 px-3">
              <div className="font-black text-emerald-600 dark:text-emerald-400 text-2xl md:text-3xl tracking-tight">حيّة</div>
              <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">أسعار المتاجر</div>
            </div>
          </div>

        </div>
      </section>

      {/* التجميعات بالميزانية أوّلاً — أقرب ما يبحث عنه المبتدئ، وكانت في الشاشة السابعة على الجوال
          بعد التخفيضات والمقارنة وأحدث القطع (تجربة المستخدمين 2026-10-17) */}
      <AutoBuildsSection />
      {/* التجميعات الجاهزة سطرٌ تحت التجميعات اليوميّة لا قسماً ثانياً بالفكرة نفسها (والثاني كان بأسعارٍ
          مخزّنة)، وأُزيل «أحدث القطع المضافة» (بطاقات بلا سياق): قسم الأدوات يأخذ مكانهما لا يزيد عليهما (2026-11-18) */}
      {prebuilds.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 -mt-10 pb-16">
          {/* صندوقٌ واضح لا سطرٌ باهت (نوّاف: «وضّح أزرار التجميعات الجاهزة»)، وكلّ زرٍّ يفتح تجميعته في /prebuilds */}
          <div className="rounded-sm border border-cyan-500/30 bg-cyan-500/[0.05] dark:bg-cyan-500/[0.07] p-4 md:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">تبي تجميعة لاستخدام محدّد؟</h3>
              <Link href="/prebuilds" className="text-sm font-black text-cyan-700 dark:text-cyan-400 hover:underline">كل التجميعات الجاهزة &larr;</Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
              {prebuilds.map((b) => (
                <Link
                  key={b.id}
                  href={`/prebuilds#pb-${b.id}`}
                  className="inline-flex items-center gap-2 text-sm font-black px-4 py-2.5 rounded-sm border border-cyan-500/40 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm hover:border-cyan-500 hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-[#052e37] transition-colors"
                >
                  <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25" /></svg>
                  {b.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ما يميّز الموقع عن قائمة أسعار — رُفض أدسنس «محتوى منخفض القيمة» (2026-11-17) والصفحة
          كانت قوائم قطعٍ وأسعارٍ تحت العنوان، والأدوات لا تُرى إلّا لمن يدخلها */}
      <ToolsSection />

        {/* قسم أداة المقارنة */}
      <PriceDropsSection />

      <CompareTeaser />

      {/* 4. قسم الأخبار */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
            أحدث المقالات
          </h2>
          {/* القائمة أدلّةٌ وأخبار معاً — كانت «أحدث الأخبار التقنية» فوق أدلّة */}
          <div className="flex items-center gap-4 text-sm font-bold">
            <Link href="/guides" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors">الأدلّة &larr;</Link>
            <Link href="/news" className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">الأخبار &larr;</Link>
          </div>
        </div>

        {latestNews.length === 0 ? (
          <div className="text-center py-12 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-sm text-slate-500 font-medium">
            لا توجد أخبار مضافة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {latestNews.map((newsItem, index) => (
              <Link 
                href={`${GUIDE_CATEGORIES.includes(newsItem.category) ? '/guides' : '/news'}/${newsItem.id}`} 
                key={newsItem.id} 
                className={`group bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-sm p-6 flex flex-col justify-between hover:border-cyan-400/50 dark:hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300 ${
                  index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
                }`}
              >
                <div>
                  <div className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 mb-3 uppercase tracking-widest bg-cyan-50 dark:bg-cyan-500/10 w-fit px-2.5 py-1 rounded-sm border border-transparent dark:border-cyan-500/20">
                    {new Date(newsItem.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                  <h3 className={`${index === 0 ? 'text-2xl md:text-3xl' : 'text-base'} font-black text-slate-900 dark:text-white mb-3 line-clamp-2 leading-[1.4] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors`}>
                    {newsItem.title}
                  </h3>
                  {index === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mt-4 leading-loose font-medium">
                      {excerpt(newsItem)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      </div>
    </div>
  );
}
/* ============ «وش يسوّي لك تجميعتي» — الأدوات ============
   كلّ بطاقةٍ تصف أداةً موجودةً فعلاً وتفتحها، بلهجة الواجهة (سعوديّة بيضاء خفيفة).
   ⚠️ الأرقام هنا تُراجَع إن تغيّرت: سبعة متاجر (أمازون، نون، مايكرولس، كازاسوق، إنفيني آرك،
   ريد زون، جرير)، والإطارات من جدول lib/gpu-perf. */
const TOOLS = [
  {
    href: '/builder',
    title: 'فحص توافق فعلي',
    body: 'نفحص المقبس ونوع الرام ومقاس اللوحة مع الكيس وطول الكرت وارتفاع المبرّد وقدرة المزوّد — وإذا ناقصنا معلومة نقولها بدل ما نطمّنك.',
    cta: 'جمّع تجميعتك',
    icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
  {
    href: '/how-we-rate',
    title: 'كم إطار يعطيك كرتك؟',
    body: 'تقدير الإطارات لكل كرت في 1080p و1440p و4K من قياسات منشورة، مو تخمين — وتشوف وين الكرت مريح ووين يتعب.',
    cta: 'كيف نقيّم؟',
    icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
  },
  {
    href: '/components?cat=Monitor',
    title: 'شاشة تلائم كرتك',
    body: 'من إطارات كرتك نحسب الدقّة والهرتز اللي تستفيد منها فعلاً، ونتأكّد إنّ منافذه توصل الشاشة لسرعتها، ونقترح لك ثلاث شاشات.',
    cta: 'اختر كرتك',
    icon: 'M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25',
  },
  {
    href: '/deals',
    title: 'سعر القطعة في ٧ متاجر',
    body: 'نقارن سعر القطعة نفسها بين أمازون ونون ومايكرولس وكازاسوق وغيرها، ونسجّل تاريخ سعرها عشان تعرف هل السعر اليوم زين أو لا.',
    cta: 'شوف التخفيضات',
    icon: 'M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941',
  },
];

function ToolsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 pb-20">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
          <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
          وش يسوّي لك تجميعتي؟
        </h2>
        <p className="mt-2 text-sm md:text-base font-medium text-slate-600 dark:text-slate-400 max-w-3xl">
          مو قائمة أسعار بس: أدوات تساعدك تختار صح قبل ما تدفع.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group flex flex-col bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-sm p-5 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <span className="w-10 h-10 rounded-sm flex items-center justify-center bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
              </svg>
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">{t.title}</h3>
            <p className="text-sm leading-relaxed font-medium text-slate-600 dark:text-slate-400 flex-1">{t.body}</p>
            <span className="mt-4 text-sm font-black text-cyan-700 dark:text-cyan-400 group-hover:underline">{t.cta} &larr;</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
