import Link from 'next/link';
import { prisma } from '../lib/prisma';

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 transition-colors pb-20 font-sans selection:bg-blue-500/20">
      
      {/* 1. القسم العلوي (Centered Minimalist Hero) */}
      <section className="relative overflow-hidden py-24 md:py-32 flex flex-col items-center text-center px-4 border-b border-slate-200/60 dark:border-slate-800/60">
        
        {/* خلفية الشبكة الهندسية والإضاءة */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800A_1px,transparent_1px),linear-gradient(to_bottom,#8080800A_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0A_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0A_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold tracking-widest uppercase mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            منصة تجميع الحواسيب المتكاملة
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-[1.15]">
            صمم حاسوبك <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">بذكاء ودقة متناهية</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl font-medium leading-relaxed">
            تصفح مئات القطع، تحقق من توافق اللوحة الأم والمعالج برمجياً، وتابع أسعار السوق المحلية والعالمية من مكان واحد لاتخاذ القرار الأفضل.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
            <Link href="/builder" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg shadow-blue-600/20 text-base flex items-center justify-center gap-2 w-full sm:w-auto">
              ابدأ التجميع الذكي
              <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
            <Link href="/components" className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 font-bold py-4 px-10 rounded-2xl transition-all text-base shadow-sm w-full sm:w-auto">
              استعراض المكونات
            </Link>
          </div>

          {/* شريط المميزات الأفقي (بديل البطاقات) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full max-w-3xl pt-8 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-lg">فحص توافق 100%</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">نظام ذكي يمنع تعارض القطع</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-lg">مزامنة حية</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">تحديث فوري لأسعار المتاجر</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-lg" dir="ltr">+{componentsCount}</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">قطعة مسجلة وجاهزة للبناء</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. قسم أحدث القطع */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            أحدث القطع المضافة
          </h2>
          <Link href="/components" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
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
              <Link href={`/components/${comp.id}`} key={comp.id} className="group bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                <div className="h-40 bg-slate-50 dark:bg-slate-900/50 p-6 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/50 relative">
                  <img 
                    src={comp.imageUrl || `/images/${comp.categoryId}/boxed.png`} 
                    alt={comp.name} 
                    className="max-w-full max-h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest rounded-lg shadow-sm">
                      {comp.category?.name}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1 font-bold">{comp.brand}</p>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-1 mb-4">{comp.name}</h3>
                  <div className="font-black text-lg text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {comp.price} <RiyalIcon size="h-4 w-4" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. قسم التجميعات الجاهزة */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            تجميعات مقترحة جاهزة
          </h2>
          <Link href="/prebuilds" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
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
              <div key={build.id} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{build.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 line-clamp-3 leading-loose font-medium">{build.description}</p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    {build.price} <RiyalIcon size="h-4 w-4" colorClass="bg-slate-900 dark:bg-white" />
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
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            أحدث الأخبار التقنية
          </h2>
          <Link href="/news" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            الأرشيف &larr;
          </Link>
        </div>

        {latestNews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 font-medium">
            لا توجد أخبار مضافة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {latestNews.map((newsItem, index) => (
              <Link 
                href={`/news/${newsItem.id}`} 
                key={newsItem.id} 
                className={`group bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-lg transition-all ${
                  index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 w-fit px-2.5 py-1 rounded-lg">
                    {new Date(newsItem.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                  <h3 className={`${index === 0 ? 'text-2xl md:text-3xl' : 'text-base'} font-black text-slate-900 dark:text-white mb-3 line-clamp-2 leading-[1.4] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
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
  );
}