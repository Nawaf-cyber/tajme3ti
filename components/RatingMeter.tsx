/* ============ «أداء الألعاب: قوي» بشريطٍ من خمس خانات — الشكل المختصر ============
 *
 * لقوائم الاختيار في الباني وصفّ المقارنة. ⚠️ بلا كسر («٤/٥» يُقرأ عدد ألعاب — ملاحظة نوّاف
 * 2026-10-22)، والشريط يجعله مقياساً لا عدداً. والألوان: أخضر للقمّة، وسماويّ للقويّ، ورماديّ
 * لما دونهما — لا أحمر، فـ«متوسّط» ليس تحذيراً. والحساب في lib/perf-rating.
 * بلا 'use client' ولا حالة: يُرسم في مكوّنات الخادم والعميل معاً.
 */
import type { Rating } from '../lib/perf-rating';

const TONE: Record<number, { bar: string; text: string }> = {
  5: { bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
  4: { bar: 'bg-cyan-500', text: 'text-cyan-700 dark:text-cyan-400' },
};
const NEUTRAL = { bar: 'bg-slate-500 dark:bg-slate-400', text: 'text-slate-600 dark:text-slate-300' };

export default function RatingMeter({ r, className = '' }: { r: Rating; className?: string }) {
  if (r.level == null) {
    return <span className={`text-[11.5px] font-bold text-slate-400 dark:text-slate-500 ${className}`}>أداء {r.label}: غير مقيس</span>;
  }
  const tone = TONE[r.level] ?? NEUTRAL;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-bold ${tone.text} ${className}`}>
      <span className="inline-flex gap-[2px]" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`w-[6px] h-[9px] rounded-[2px] ${i <= r.level! ? tone.bar : 'bg-slate-200 dark:bg-slate-700'}`} />
        ))}
      </span>
      أداء {r.label}: {r.word}
    </span>
  );
}
