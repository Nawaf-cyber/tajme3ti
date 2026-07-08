import Link from 'next/link';
import { prisma } from '../lib/prisma';
import AutoBuildsSection from '../components/AutoBuildsSection';

export const revalidate = 300; // تحديث كل 5 دقائق — توازن بين السرعة وحداثة الأسعار والصور

export default async function HomePage() {
  const latestComponents = await prisma.component.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });

  const latestPrebuilds = await prisma.prebuild.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

  const latestNews = await prisma.news.findMany({
    take: 4, 
    orderBy: { createdAt: 'desc' }
  });

  const componentsCount = await prisma.component.count();

  const RiyalIcon = ({ size = 'h-5 w-5', colorClass = 'bg-blue-600 dark:bg-blue-400' }: { size?: string, colorClass?: string }) => (
    <div 
      className={`${size} ${colorClass} inline-block align-middle`} 
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

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100 transition-colors pb-20 font-sans selection:bg-cyan-500/20">

      {/* حاوية المحتوى فوق الخلفية العامة */}
      <div className="relative z-10">
      
      
      {/* 1. القسم العلوي (Gaming/Tech Hero — مسارات اللوحة) */}
      <section className="relative overflow-hidden py-24 md:py-36 flex flex-col items-center text-center px-4">

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center animate-fade-up">
          
          {/* البرق — عنصر التوقيع */}
          <div className="relative w-20 h-20 mb-7">
            <div className="absolute inset-0 bg-cyan-400/30 blur-2xl rounded-full"></div>
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
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
            <Link href="/builder" className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 text-base flex items-center justify-center gap-2 w-full sm:w-auto overflow-hidden">
              <span className="relative z-10">ابدأ التجميع الذكي</span>
              <svg className="w-5 h-5 transform rotate-180 relative z-10 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700"></span>
            </Link>
            <Link href="/components" className="bg-white dark:bg-[#0F172A]/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 dark:hover:text-cyan-300 font-bold py-4 px-10 rounded-2xl transition-all duration-300 text-base shadow-sm hover:-translate-y-0.5 w-full sm:w-auto">
              استعراض المكونات
            </Link>
          </div>

          {/* شريط الإحصائيات المدمج */}
          <div className="flex max-w-2xl w-full bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl backdrop-blur-sm overflow-hidden shadow-sm">
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

      {/* 2. قسم أحدث القطع */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
            أحدث القطع المضافة
          </h2>
          <Link href="/components" className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors">
            عرض الكل &larr;
          </Link>
        </div>
        
        {latestComponents.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 font-medium">
            لا توجد قطع مضافة حالياً في النظام.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {latestComponents.map((comp) => (
              <Link href={`/components/${comp.id}`} key={comp.id} className="group bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-cyan-400/50 dark:hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300">
                <div className="h-40 bg-slate-50 dark:bg-white p-6 flex items-center justify-center border-b border-slate-100 dark:border-slate-200 relative">
                  <img 
                    src={comp.imageUrl || `/images/${comp.categoryId}/boxed.png`} 
                    alt={comp.name} 
                    className="max-w-full max-h-full object-contain filter drop-shadow-sm mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest rounded-lg shadow-sm">
                      {comp.category?.name}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1 font-bold">{comp.brand}</p>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-1 mb-4">{comp.name}</h3>
                  <div className="font-black text-lg text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                    <div className="flex items-center justify-center gap-1 leading-none">
                      {parseFloat(Number(comp.price).toFixed(2))} <RiyalIcon size="h-4 w-4" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 2. قسم التجميعات المقترحة (الآلي الجديد بدلاً من القديم اليدوي) */}
      <AutoBuildsSection />

      {/* 3. قسم التجميعات الجاهزة */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
            تجميعات مقترحة جاهزة
          </h2>
          <Link href="/prebuilds" className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors">
            عرض الكل &larr;
          </Link>
        </div>

        {latestPrebuilds.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 font-medium">
            لا توجد تجميعات مقترحة مضافة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPrebuilds.map((build) => (
              <div key={build.id} className="bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{build.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 line-clamp-3 leading-loose font-medium">{build.description}</p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 leading-none">
                    {parseFloat(Number(build.price).toFixed(2))} <RiyalIcon size="h-4 w-4" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                  </div>
                  <Link href="/prebuilds" className="text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-white px-5 py-2.5 rounded-xl transition-colors">
                    استعراض
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. قسم الأخبار */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
            أحدث الأخبار التقنية
          </h2>
          <Link href="/news" className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors">
            الأرشيف &larr;
          </Link>
        </div>

        {latestNews.length === 0 ? (
          <div className="text-center py-12 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 font-medium">
            لا توجد أخبار مضافة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {latestNews.map((newsItem, index) => (
              <Link 
                href={`/news/${newsItem.id}`} 
                key={newsItem.id} 
                className={`group bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-cyan-400/50 dark:hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300 ${
                  index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 mb-3 uppercase tracking-widest bg-cyan-50 dark:bg-cyan-500/10 w-fit px-2.5 py-1 rounded-lg border border-transparent dark:border-cyan-500/20">
                    {new Date(newsItem.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                  <h3 className={`${index === 0 ? 'text-2xl md:text-3xl' : 'text-base'} font-black text-slate-900 dark:text-white mb-3 line-clamp-2 leading-[1.4] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors`}>
                    {newsItem.title}
                  </h3>
                  {index === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mt-4 leading-loose font-medium">
                      {newsItem.content}
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