/* ============ «وين سعر اليوم؟» — مؤشّر موقع السعر (شكل أ · 2026-10-29) ============
 *
 * شريطٌ من الأدنى (يسار) إلى الأعلى (يمين) وعليه علامةُ اليوم، وجملةٌ تقول
 * بُعده عن الطرفين. الأرقام من lib/price-stats نفسها التي يرسم بها الرسم
 * أسفل الصفحة — فلا يظهر رقمان مختلفان لشيءٍ واحد.
 *
 * ⚠️ «عند أدنى ما رصدناه» تُكتب حين تصدق فقط (ضمن ٢٪)، وإلّا فالنسبتان.
 */
import { pctAboveMin, daysAr, type PriceStats } from '../lib/price-stats-core';

const money = (n: number) => Math.round(n).toLocaleString('en-US');

export default function PricePosition({ now, stats }: { now: number; stats: PriceStats }) {
  const span = stats.max - stats.min;
  const pos = span > 0 ? Math.min(1, Math.max(0, (now - stats.min) / span)) : 0;
  const aboveMin = pctAboveMin(now, stats.min);
  const belowMax = stats.max > 0 ? Math.max(0, Math.round(((stats.max - now) / stats.max) * 100)) : 0;
  const atLow = aboveMin <= 2;

  return (
    <div dir="ltr" className="mb-4 flex flex-col gap-2 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-3 text-[11.5px] font-bold text-slate-500 dark:text-slate-400">
        <span>أدنى <span className="font-mono tabular-nums text-slate-700 dark:text-slate-200">{money(stats.min)}</span></span>
        <span dir="rtl" className="text-center text-[12.5px] text-slate-700 dark:text-slate-300">وين سعر اليوم خلال {daysAr(stats.days)} من المتابعة؟</span>
        <span>أعلى <span className="font-mono tabular-nums text-slate-700 dark:text-slate-200">{money(stats.max)}</span></span>
      </div>
      <div className="relative h-2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500">
        <span
          className="absolute -top-[5px] h-[18px] w-[18px] -ml-[9px] rounded-full bg-white border-[3px] border-slate-900 dark:border-[#0B1120] shadow-[0_0_0_2px_#22D3EE]"
          style={{ left: `${pos * 100}%` }}
          aria-hidden="true"
        />
      </div>
      <p dir="rtl" className="m-0 text-[12.5px] font-bold leading-relaxed text-slate-700 dark:text-slate-300">
        اليوم <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400" dir="ltr">{money(now)}</span>
        {' — '}
        {atLow
          ? <span className="text-emerald-700 dark:text-emerald-400">عند أدنى ما رصدناه ✓</span>
          : <>أعلى من الأدنى بـ<span className="font-mono tabular-nums">{aboveMin}%</span> وتحت الأعلى بـ<span className="font-mono tabular-nums">{belowMax}%</span>.</>}
        {' '}
        <a href="#price-history" className="text-cyan-700 dark:text-cyan-400 underline underline-offset-2">شوف الرسم ↓</a>
      </p>
    </div>
  );
}
