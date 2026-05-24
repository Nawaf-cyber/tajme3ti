import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function NewsDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const news = await prisma.news.findUnique({
    where: { id }
  });

  if (!news) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <Link href="/news" className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-800 mb-8 inline-flex items-center gap-2">
          <span dir="ltr">&larr;</span>
          <span>العودة للأخبار</span>
        </Link>
        
        <article className="bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-12 shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-bold rounded-full border border-blue-200 dark:border-blue-800">
              {news.category}
            </span>
            <span className="text-gray-500 dark:text-gray-400 font-mono" dir="ltr">
              {new Date(news.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-8 leading-tight">
            {news.title}
          </h1>

          {/* كود عرض الصورة */}
          {news.imageUrl && (
            <div className="w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800">
              <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
            {news.content}
          </div>
        </article>
      </div>
    </main>
  );
}