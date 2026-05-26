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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors pb-20 font-sans">
      
      {/* 1. القسم العلوي الحديث (Premium Clean Hero) */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
        {/* تأثيرات الإضاءة الخلفية الشفافة الناعمة */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* النصوص والأزرار */}
          <div className="lg:col-span-7 space-y-6 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide">
              ✨ منصة تجميع الحواسيب المتكاملة
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              ابنِ حاسوبك المخصص <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">بأسلوب عصري ودقيق</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-xl font-medium leading-relaxed">
              تصفح مئات القطع، تحقق من توافق اللوحة الأم والمعالج، وتابع أسعار السوق المحلية والعالمية من مكان واحد وبأعلى دقة.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/builder" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-blue-500/10 text-base flex items-center gap-2">
                ابدأ التجميع الذكي
                <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
              <Link href="/components" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-bold py-3.5 px-8 rounded-xl transition-all text-base shadow-sm">
                استعراض المكونات
              </Link>
            </div>
          </div>

          {/* شبكة مميزات البينتو المشرقة */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl p-6 flex flex-col justify-between shadow-md row-span-2 min-h-[240px]">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h3 className="text-3xl font-black">100%</h3>
                <p className="text-xs font-bold opacity-90 mt-1">فحص توافق المكونات تلقائياً</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">المزامنة</span>
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">أسعار حية</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">تحديث فوري من المتاجر</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">المخزون</span>
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1.5" dir="ltr">
                  +{componentsCount}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">قطعة مسجلة جاهزة</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. قسم أحدث القطع (تصميم أفقي متناسق) */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 dark:bg-blue-500 rounded-full"></span>
            أحدث القطع المضافة
          </h2>
          <Link href="/components" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline transition-colors">
            عرض الكل &larr;
          </Link>
        </div>
        
        {latestComponents.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 font-medium">
            لا توجد قطع مضافة حالياً في النظام.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestComponents.map((comp) => (
              <Link href={`/components/${comp.id}`} key={comp.id} className="group flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 shadow-sm transition-all h-36">
                <div className="w-1/3 bg-slate-50 dark:bg-slate-900/50 p-4 h-full flex items-center justify-center border-l border-slate-100 dark:border-slate-700/50 relative">
                  <img 
                    src={comp.imageUrl || `/images/${comp.categoryId}/boxed.png`} 
                    alt={comp.name} 
                    className="max-w-full max-h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="w-2/3 p-5 flex flex-col h-full justify-center">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">{comp.category?.name}</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight line-clamp-1 mb-1">{comp.name}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-auto font-medium">{comp.brand}</p>
                  <div className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-2">
                    {comp.price} <RiyalIcon size="h-4 w-4" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. قسم التجميعات الجاهزة */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
            تجميعات مقترحة جاهزة
          </h2>
          <Link href="/prebuilds" className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            عرض الكل &larr;
          </Link>
        </div>

        {latestPrebuilds.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 font-medium">
            لا توجد تجميعات مقترحة مضافة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPrebuilds.map((build) => (
              <div key={build.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{build.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed font-medium">{build.description}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
                  <div className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    {build.price} <RiyalIcon size="h-4 w-4" colorClass="bg-slate-900 dark:bg-white" />
                  </div>
                  <Link href="/prebuilds" className="text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-white px-4 py-2 rounded-lg transition-colors">
                    استعراض التجميعة
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. قسم الأخبار (تم الحفاظ الكامل على شبكة البينتو الفريدة والذكية) */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
            أخبار وتقنيات الهاردوير
          </h2>
          <Link href="/news" className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            الأرشيف &larr;
          </Link>
        </div>

        {latestNews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 font-medium">
            لا توجد أخبار مضافة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestNews.map((newsItem, index) => (
              <Link 
                href={`/news/${newsItem.id}`} 
                key={newsItem.id} 
                className={`group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 dark:hover:border-indigo-400/50 shadow-sm transition-all ${
                  index === 0 ? 'lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-indigo-50/40 via-white to-white dark:from-indigo-950/20 dark:via-slate-800 dark:to-slate-800 border-indigo-100 dark:border-indigo-900/50 shadow-indigo-500/5' : ''
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">
                    {new Date(newsItem.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                  <h3 className={`${index === 0 ? 'text-2xl md:text-3xl' : 'text-base'} font-extrabold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors`}>
                    {newsItem.title}
                  </h3>
                  {index === 0 && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-4 mt-4 leading-relaxed font-medium">
                      {newsItem.content}
                    </p>
                  )}
                </div>
                {index === 0 && (
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5 mt-6">
                    قراءة الخبر بالكامل
                    <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}