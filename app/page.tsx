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
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

  // مكون فرعي معزول لتجنب تكرار كود الشعار
  const RiyalIcon = ({ size = 'h-4 w-4' }: { size?: string }) => (
    <div 
      className={`${size} bg-emerald-600 dark:bg-emerald-400 inline-block`} 
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] transition-colors">
      
      {/* 1. القسم العلوي (Hero Section) */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
          ابنِ جهاز أحلامك <span className="text-blue-600">بسهولة</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          منصة متكاملة لاختيار القطع، التحقق من التوافق، واستكشاف أحدث التجميعات الجاهزة.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/builder" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg shadow-sm">
            ابدأ تجميعتك الآن
          </Link>
          <Link href="/prebuilds" className="bg-white dark:bg-[#0F172A] border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-blue-600 dark:hover:border-blue-600 font-bold py-4 px-8 rounded-xl transition-colors text-lg shadow-sm">
            تصفح التجميعات المقترحة
          </Link>
        </div>
      </section>

      {/* 2. قسم أحدث القطع (Latest Components) */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-slate-200 dark:border-slate-800/60">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">أحدث القطع المضافة</h2>
          <Link href="/components" className="text-blue-600 font-bold hover:underline">
            عرض الكل &larr;
          </Link>
        </div>
        
        {latestComponents.length === 0 ? (
          <div className="text-center text-slate-500 p-8 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0F172A]">
            لا توجد قطع مضافة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestComponents.map((comp) => (
              <div key={comp.id} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
                      {comp.category?.name || 'قطعة'}
                    </span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      {comp.price} <RiyalIcon size="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{comp.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">{comp.brand}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link href={`/components/${comp.id}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 block text-center">
                    عرض التفاصيل &larr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. قسم التجميعات الجاهزة (Latest Prebuilds) */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-slate-200 dark:border-slate-800/60">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">أحدث التجميعات المقترحة</h2>
          <Link href="/prebuilds" className="text-blue-600 font-bold hover:underline">
            عرض الكل &larr;
          </Link>
        </div>

        {latestPrebuilds.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 font-medium shadow-sm">
            لا توجد تجميعات مقترحة مضافة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPrebuilds.map((build) => (
              <div key={build.id} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{build.title}</h3>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-1">
                    {build.price} <RiyalIcon size="h-5 w-5" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 whitespace-pre-wrap">{build.description}</p>
                </div>
                <Link href="/prebuilds" className="block w-full text-center bg-slate-100 hover:bg-slate-200 dark:bg-[#0B1120] dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold py-3 rounded-xl transition-colors text-sm border border-transparent dark:border-slate-800">
                  عرض التجميعة &larr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. قسم الأخبار (Latest News) */}
      <section className="max-w-7xl mx-auto px-4 py-16 mb-20 border-t border-slate-200 dark:border-slate-800/60">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">أحدث الأخبار التقنية</h2>
          <Link href="/news" className="text-blue-600 font-bold hover:underline">
            عرض الكل &larr;
          </Link>
        </div>

        {latestNews.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 font-medium shadow-sm">
            لا توجد أخبار مضافة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((newsItem) => (
              <div key={newsItem.id} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-purple-500/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-bold">
                    {new Date(newsItem.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2">{newsItem.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">{newsItem.content}</p>
                </div>
                <Link href={`/news/${newsItem.id}`} className="text-purple-600 font-bold hover:text-purple-700 text-sm">
                  قراءة المزيد &larr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}