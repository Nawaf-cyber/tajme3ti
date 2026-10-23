/* ============ بطاقة «تقييم الأداء» في صفحة القطعة ============
 *
 * كلمةُ المستوى وشريطٌ من خمس خانات — بلا كسر («٤/٥» يُقرأ عدد ألعاب)، وتحتها الرقم المقيس
 * ومصدره. للمعالج تقييمان (الألعاب والمونتاج)، وللكرت واحد. وما لا قياس له «غير مقيس» —
 * لا تقدير. والحساب كلّه في lib/perf-rating (المصدر الذي تقرؤه الصفحات الأخرى بعدها).
 */
import Link from 'next/link';
import { partRatings, RATING_SOURCES, type Rating } from '../lib/perf-rating';

const TONE: Record<number, { bar: string; text: string }> = {
  5: { bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
  4: { bar: 'bg-cyan-500', text: 'text-cyan-700 dark:text-cyan-400' },
};
const NEUTRAL = { bar: 'bg-slate-500 dark:bg-slate-400', text: 'text-slate-700 dark:text-slate-300' };

function Row({ r }: { r: Rating }) {
  const tone = (r.level != null && TONE[r.level]) || NEUTRAL;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300">أداء {r.label}</span>
        <span className={`text-[14px] font-black ${r.word ? tone.text : 'text-slate-400 dark:text-slate-500'}`}>
          {r.word ?? 'غير مقيس'}
        </span>
      </div>
      {r.level != null && (
        <div className="flex gap-1 mt-1.5" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= r.level! ? tone.bar : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
      )}
      <p className="mt-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
        {r.metric ?? 'ما لقينا قياساً منشوراً لها — فما نعطيها تقييماً بالتخمين.'}
        {r.via && <> — مقيس على {r.via}، نفس الشريحة</>}
      </p>
    </div>
  );
}

export default function PartRating({ category, name, specs }: { category?: string | null; name: string; specs: any }) {
  const ratings = partRatings(category, name, specs);
  if (!ratings.length) return null;
  const src = category === 'GPU' ? RATING_SOURCES.gpu : RATING_SOURCES.cpu;
  const measured = ratings.some((r) => r.level != null);
  return (
    <section aria-labelledby="part-rating" className="mb-5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-4">
      <h2 id="part-rating" className="text-[13px] font-black text-slate-900 dark:text-white mb-3">تقييم الأداء</h2>
      <div className="flex flex-col gap-3">
        {ratings.map((r) => <Row key={r.label} r={r} />)}
      </div>
      <p className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
        {measured && (
          <>مقيس من <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-700 dark:hover:text-cyan-400">{src.name}</a> · </>
        )}
        <Link href="/how-we-rate" className="font-bold text-cyan-700 dark:text-cyan-400 hover:underline">كيف نقيّم؟</Link>
      </p>
    </section>
  );
}
