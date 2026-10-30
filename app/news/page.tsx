import Link from 'next/link';
import { getNews } from '../../lib/content';
import ArticleGrid from '../../components/ArticleGrid';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'أخبار عتاد الحاسب',
  description: 'آخر أخبار قطع الحاسب: إطلاقات كروت الشاشة والمعالجات، تحرّكات الأسعار في السوق السعودي، وما يهمّ المجمِّع العربي.',
  alternates: { canonical: '/news' },
};

/* الرأس مضغوطٌ كرأس «تصفّح القطع» (2026-10-30): عنوانٌ ٣٠–٣٦ بكسل وسطرٌ تحته بدل
   عنوانٍ ٦٠ بكسل يملأ الشاشة الأولى، وحُذفت شارة «Hardware Updates» الإنجليزيّة —
   زينةٌ لاتينيّة في صفحةٍ عربيّة (مراجعة أدسنس 2026-10-15). */
export default async function NewsPage() {
  const newsList = await getNews();

  return (
    <div className="min-h-screen py-8 md:py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 selection:bg-cyan-500/20 overflow-x-clip">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              أحدث أخبار <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400">التقنية.</span>
            </h1>
            <p className="mt-2 text-[14px] font-semibold text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              تابع أحدث الإصدارات والتسريبات وتحرّكات الأسعار في عالم قطع الـ PC، قبل ما تقرّر تشتري.
            </p>
          </div>
          <Link href="/guides" className="text-[13px] font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline">أدلّة التجميع &larr;</Link>
        </div>

        <ArticleGrid
          items={newsList}
          base="/news"
          tone="news"
          cta="اقرأ الخبر"
          badge={(a) => a.category}
          emptyIcon="📰"
          emptyText="لا توجد أخبار حالياً. تنضاف قريباً."
        />
      </div>
    </div>
  );
}
