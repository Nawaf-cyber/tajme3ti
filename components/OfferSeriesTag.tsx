/* ============ سلسلة نسخة المتجر — #٤ ============
 *
 * صفُّ الكرت العامّ يبيع نسخاً من شركاء مختلفين («ASUS TUF OC» هنا و«Gigabyte
 * WINDFORCE» هناك)، فالسلسلة ودرجتها صفةُ **العرض** لا الصفّ. تُقال بجانب
 * السعر، حيث يُقارن الزائر: فرق الـ500 ريال قد يكون فئةً أعلى لا متجراً أغلى.
 *
 * الدرجة لمن صرّحت الشركة بترتيبها (ASUS، MSI)؛ وللباقين اسم السلسلة وحده.
 * lib/series.ts · offerSeries
 */

import { notesCount, offerSeries, seriesBadge } from '../lib/series';

export default function OfferSeriesTag({ variant, showName, rowName }: {
  variant?: string | null;
  /** اسم النسخة نفسه — حين لا يعرضه OfferLengthTag (الأطوال متساوية) */
  showName?: boolean;
  /** اسم الصفّ: الملاحظة تخصّ النسخة على شريحةٍ بعينها */
  rowName?: string;
}) {
  if (!variant) return null;
  const s = offerSeries(variant, 'GPU', rowName);
  if (!s && !showName) return null;
  return (
    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-sans text-[11.5px] font-bold text-slate-500 dark:text-slate-400">
      {showName && <span className="text-slate-700 dark:text-slate-200" dir="ltr">{variant}</span>}
      {s && (
        <span
          title={s.ladder ? `تشكيلة ${s.brand}: ${s.ladder.join(' ← ')}` : undefined}
          className="whitespace-nowrap px-1.5 py-px rounded-sm border border-cyan-300 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300"
        >
          {seriesBadge(s)}
        </span>
      )}
      {/* الملاحظة نفسها في قسم «ملاحظات معروفة» تحت المواصفات، بنسختها ومتاجرها.
          نصٌّ لا رابط: السطر كلّه رابطٌ إلى المتجر، ورابطٌ داخل رابطٍ HTML فاسد */}
      {s && s.issues.length > 0 && (
        <span className="whitespace-nowrap text-amber-700 dark:text-amber-400">
          ⚑ عليها {notesCount(s.issues.length)} ↓
        </span>
      )}
    </span>
  );
}
