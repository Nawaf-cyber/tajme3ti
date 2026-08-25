import Link from 'next/link';
import { Metadata } from 'next';
import { getGuides } from '../../lib/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'أدلّة تجميع الحاسب',
  description:
    'أدلّة عملية لاختيار قطع الحاسب وتجميعه: المعالج، كرت الشاشة، اللوحة الأم، الذاكرة، التخزين، ومزوّد الطاقة — بأسلوب مبسّط من واقع تجربة.',
  alternates: { canonical: 'https://www.tajme3ti.com/guides' },
};

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 selection:bg-emerald-500/20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">

        {/* الترويسة — هوية خضراء تميّزها عن الأخبار (الزرقاء) */}
        <div className="relative mb-20 pt-8 text-right">
          <div className="flex flex-col items-start lg:flex-row-reverse lg:items-center justify-between gap-6 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/50 shadow-[0_0_15px_-3px_#10b981]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[12px] font-bold text-white uppercase tracking-widest">PC Building Guides</span>
            </div>
          </div>

          <div className="w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white leading-tight mb-5">
              أدلّة{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                التجميع.
              </span>
            </h1>
            <p className="text-base md:text-lg font-medium text-slate-600 dark:text-slate-400 max-w-2xl ml-auto leading-relaxed">
              شروحات عملية تساعدك على اختيار كل قطعة وتجميع جهازك بثقة — من اختيار المعالج
              إلى حساب مزوّد الطاقة، بأسلوب مبسّط من واقع تجربة.
            </p>
          </div>
        </div>

        {guides.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#0F172A] rounded-sm border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <span className="text-4xl block mb-4 opacity-50">📘</span>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-bold">لا توجد أدلّة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide) => (
              <article
                key={guide.id}
                className="group bg-white dark:bg-[#0F172A] rounded-sm overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 border border-slate-200 dark:border-slate-800/80 transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                {guide.imageUrl ? (
                  <div className="h-56 w-full overflow-hidden border-b border-slate-100 dark:border-slate-800/60 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-transparent to-transparent opacity-0 dark:opacity-100 z-10 pointer-events-none"></div>
                    <img
                      src={guide.imageUrl}
                      alt={guide.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 z-20">
                      <span className="px-3 py-1.5 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-sm text-emerald-700 dark:text-emerald-400 text-[12px] font-black uppercase tracking-widest rounded-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                        دليل
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-56 w-full bg-slate-100 dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-center relative">
                    <div className="absolute top-4 right-4 z-20">
                      <span className="px-3 py-1.5 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-sm text-emerald-700 dark:text-emerald-400 text-[12px] font-black uppercase tracking-widest rounded-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                        دليل
                      </span>
                    </div>
                    <span className="text-5xl opacity-20">📘</span>
                  </div>
                )}

                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[12px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-sm">
                      {new Date(guide.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {guide.title}
                  </h2>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8 flex-1 line-clamp-3 font-medium">
                    {guide.summary}
                  </p>

                  <Link
                    href={`/guides/${guide.id}`}
                    className="mt-auto inline-flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-emerald-50 dark:bg-[#0B1120] dark:hover:bg-emerald-900/20 text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 font-bold py-3.5 rounded-sm transition-all border border-slate-200 dark:border-slate-800/60 group/btn"
                  >
                    <span>اقرأ الدليل</span>
                    <svg className="w-4 h-4 transform group-hover/btn:-translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
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