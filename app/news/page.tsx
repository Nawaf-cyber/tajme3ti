import Link from 'next/link';
import { getNews } from '../../lib/content';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'أخبار عتاد الحاسب',
  description: 'آخر أخبار قطع الحاسب: إطلاقات كروت الشاشة والمعالجات، تحرّكات الأسعار في السوق السعودي، وما يهمّ المجمِّع العربي.',
  alternates: { canonical: '/news' },
};

export default async function NewsPage() {
  const newsList = await getNews();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 selection:bg-blue-500/20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* الترويسة (Header) مطابقة للتصميم المعتمد */}
        <div className="relative mb-20 pt-8 text-right selection:bg-blue-500/20">
          <div className="flex flex-col items-start lg:flex-row-reverse lg:items-center justify-between gap-6 mb-10">
            {/* الشارة الوامضة */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/50 shadow-[0_0_15px_-3px_#3b82f6]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[11px] font-bold text-white uppercase tracking-widest">Hardware Updates</span>
            </div>
          </div>

          <div className="w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white leading-tight mb-5 selection:text-white dark:selection:text-slate-950">
              أحدث أخبار <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 selection:text-white dark:selection:text-slate-950">التقنية.</span>
            </h1>
            <p className="text-base md:text-lg font-medium text-slate-600 dark:text-slate-400 max-w-2xl ml-auto leading-relaxed selection:text-slate-950 dark:selection:text-slate-100">
              تابع أحدث الإصدارات، التسريبات، وتقييمات الأداء في عالم قطع أجهزة الـ PC لتكن دائماً خطوة للأمام قبل اتخاذ قرار الشراء.
            </p>
          </div>
        </div>

        {newsList.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <span className="text-4xl block mb-4 opacity-50">📰</span>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-bold">لا توجد أخبار حالياً. سيتم إضافة الأخبار قريباً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsList.map((news) => (
              <article key={news.id} className="group bg-white dark:bg-[#0F172A] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5 border border-slate-200 dark:border-slate-800/80 transition-all duration-300 flex flex-col hover:-translate-y-1">
                
                {/* قسم الصورة */}
                {news.imageUrl ? (
                  <div className="h-56 w-full overflow-hidden border-b border-slate-100 dark:border-slate-800/60 relative">
                    {/* تدرج لوني داكن أسفل الصورة للجمالية */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-transparent to-transparent opacity-0 dark:opacity-100 z-10 pointer-events-none"></div>
                    
                    <img 
                      src={news.imageUrl} 
                      alt={news.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                    />
                    
                    {/* شارة التصنيف العائمة فوق الصورة */}
                    <div className="absolute top-4 right-4 z-20">
                       <span className="px-3 py-1.5 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-sm text-blue-700 dark:text-blue-400 text-[11px] font-black uppercase tracking-widest rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                        {news.category}
                      </span>
                    </div>
                  </div>
                ) : (
                   <div className="h-56 w-full bg-slate-100 dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-center relative">
                     <div className="absolute top-4 right-4 z-20">
                       <span className="px-3 py-1.5 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-sm text-blue-700 dark:text-blue-400 text-[11px] font-black uppercase tracking-widest rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                        {news.category}
                      </span>
                    </div>
                     <span className="text-5xl opacity-20">📰</span>
                   </div>
                )}
                
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-md">
                      {new Date(news.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {news.title}
                  </h2>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8 flex-1 line-clamp-3 font-medium">
                    {news.summary}
                  </p>
                  
                  {/* زر القراءة */}
                  <Link href={`/news/${news.id}`} className="mt-auto inline-flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-blue-50 dark:bg-[#0B1120] dark:hover:bg-blue-900/20 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-bold py-3.5 rounded-xl transition-all border border-slate-200 dark:border-slate-800/60 group/btn">
                    <span>اقرأ التفاصيل</span>
                    <svg className="w-4 h-4 transform group-hover/btn:-translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}