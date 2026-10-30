import Link from 'next/link';
import { Metadata } from 'next';
import { getGuides } from '../../lib/content';
import ArticleGrid from '../../components/ArticleGrid';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'أدلّة تجميع الحاسب',
  description:
    'أدلّة عملية لاختيار قطع الحاسب وتجميعه: المعالج، كرت الشاشة، اللوحة الأم، الذاكرة، التخزين، ومزوّد الطاقة — بأسلوب مبسّط من واقع تجربة.',
  alternates: { canonical: 'https://www.tajme3ti.com/guides' },
};

/* الرأس مضغوطٌ كرأس «تصفّح القطع» (2026-10-30)، والهويّة الخضراء تميّز الأدلّة عن
   الأخبار. وحُذفت شارة «PC Building Guides» الإنجليزيّة (مراجعة أدسنس 2026-10-15). */
export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <div className="min-h-screen py-8 md:py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 selection:bg-emerald-500/20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              أدلّة <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">التجميع.</span>
            </h1>
            <p className="mt-2 text-[14px] font-semibold text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              شروحات عملية تساعدك تختار كل قطعة وتجمّع جهازك بثقة — من اختيار المعالج إلى حساب مزوّد الطاقة.
            </p>
          </div>
          <Link href="/news" className="text-[13px] font-extrabold text-cyan-700 dark:text-cyan-400 hover:underline">الأخبار &larr;</Link>
        </div>

        <ArticleGrid
          items={guides}
          base="/guides"
          tone="guide"
          cta="اقرأ الدليل"
          badge={() => 'دليل'}
          emptyIcon="📘"
          emptyText="لا توجد أدلّة حالياً."
        />
      </div>
    </div>
  );
}
