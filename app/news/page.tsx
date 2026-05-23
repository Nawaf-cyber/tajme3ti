import { prisma } from '../../lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const newsList = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">📰 أحدث أخبار التقنية</h1>
          <p className="text-gray-600 dark:text-gray-400">تابع أحدث الإصدارات والتسريبات في عالم قطع أجهزة الـ PC</p>
        </div>

        {newsList.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
            <p className="text-xl text-gray-500 dark:text-gray-400">لا توجد أخبار حالياً. سيتم إضافة الأخبار قريباً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsList.map((news) => (
              <article key={news.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition-all duration-200 flex flex-col">
                
                {/* كود عرض الصورة */}
                {news.imageUrl && (
                  <div className="h-48 w-full overflow-hidden border-b border-gray-100 dark:border-slate-800">
                    <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-800">
                      {news.category}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-mono" dir="ltr">
                      {new Date(news.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight line-clamp-2">
                    {news.title}
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 flex-1 line-clamp-3">
                    {news.summary}
                  </p>
                  
                  <Link href={`/news/${news.id}`} className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-800 dark:hover:text-blue-300 transition-colors self-start flex items-center gap-2 mt-auto">
                    <span>اقرأ التفاصيل</span>
                    <span dir="ltr">&rarr;</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}