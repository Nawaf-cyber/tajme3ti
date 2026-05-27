import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewsDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const news = await prisma.news.findUnique({
    where: { id }
  });

  if (!news) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-20 transition-colors duration-300 overflow-x-hidden selection:bg-blue-500/20">
      
      {/* القسم العلوي (الصورة والعنوان) */}
      <div className="relative w-full h-[50vh] md:h-[65vh] bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 flex items-end">
        {news.imageUrl ? (
          <>
            <img 
              src={news.imageUrl} 
              alt={news.title} 
              className="absolute inset-0 w-full h-full object-cover" 
            />
            {/* تدرج لوني مكثف لضمان قراءة النص فوق الصورة */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#F5F7FA] via-[#F5F7FA]/80 dark:from-[#0B1120] dark:via-[#0B1120]/80 to-transparent"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-[#F5F7FA] dark:bg-[#0F172A] flex items-center justify-center">
            <span className="text-9xl opacity-10">📰</span>
            <div className="absolute inset-0 bg-gradient-to-t from-[#F5F7FA] dark:from-[#0B1120] to-transparent"></div>
          </div>
        )}

        {/* زر العودة العائم */}
        <div className="absolute top-6 right-4 sm:right-6 lg:right-12 z-20">
          <Link href="/news" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/50 transition-all shadow-lg group">
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="font-bold text-sm">العودة</span>
          </Link>
        </div>

        {/* العنوان والبيانات فوق الصورة */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 md:pb-40">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-lg shadow-md shadow-blue-600/20">
              {news.category}
            </span>
            <span className="text-sm text-slate-700 dark:text-slate-300 font-bold bg-white/50 dark:bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 dark:border-white/10">
              {new Date(news.createdAt).toLocaleDateString('ar-SA')}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.3] drop-shadow-xl selection:text-white dark:selection:text-slate-950">
            {news.title}
          </h1>
        </div>
      </div>

      {/* حاوية محتوى الخبر (Overlapping Card) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-24 md:-mt-32">
        <article className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 md:p-12 lg:p-14 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800/80">
          <div className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-loose md:leading-[2.4] font-medium whitespace-pre-wrap break-words selection:bg-blue-50 selection:text-blue-900 dark:selection:bg-blue-900/40 dark:selection:text-blue-100">
            {news.content}
          </div>
          
          {/* خط نهاية الخبر */}
          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-1"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-1"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-1"></span>
          </div>
        </article>
      </div>
      
    </main>
  );
}