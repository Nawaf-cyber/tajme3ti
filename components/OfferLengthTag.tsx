'use client';

/* ============ طولُ النسخة بجانب سعر المتجر ============
 *
 * صفُّ الكرت العامّ يبيع نسخاً من شركاء مختلفين، وكلُّ متجرٍ نسخةٌ بطولها
 * (lib/fit · gpuFitVerdict). فالسعرُ الأرخص قد يكون كرتاً أطول — وهذا يُقال
 * بجانب السعر، في لحظة الاختيار.
 *
 * ولا يُعرض إلّا حين **تختلف** الأطوال بين المتاجر (يقرّره المستدعي):
 * كرتٌ بطولٍ واحد يكفيه رقمُه في المواصفات.
 *
 * ومن سجّل جهازه وفيه كيسٌ معروفُ المساحة يرى الحكم: يدخل كيسك أو لا.
 */

import { useRig } from '../lib/use-rig';
import { gpuFitsCase, caseGpuMaxMm } from '../lib/fit';

export default function OfferLengthTag({ lengthMm, variant }: {
  lengthMm: number;
  /** اسم النسخة («ASUS TUF OC») — يُغني عن «طول هذه النسخة» ويقول أيَّ كرتٍ هو */
  variant?: string | null;
}) {
  const rig = useRig();
  const cse: any = rig.state === 'ready' ? (rig.rig.rig as any).Case : null;
  const specs = cse?.specs ? (typeof cse.specs === 'string' ? JSON.parse(cse.specs) : cse.specs) : null;
  const fits = specs ? gpuFitsCase({ lengthMm }, specs) : null;

  return (
    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-sans text-[11.5px] font-bold text-slate-500 dark:text-slate-400">
      {variant ? (
        <span>
          <span className="text-slate-700 dark:text-slate-200" dir="ltr">{variant}</span>
          <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
          <span dir="ltr">{lengthMm}</span> مم
        </span>
      ) : (
        <span>طول هذه النسخة <span dir="ltr">{lengthMm}</span> مم</span>
      )}
      {fits === true && (
        <span className="text-emerald-600 dark:text-emerald-400">✓ يدخل كيسك</span>
      )}
      {fits === false && (
        <span className="text-rose-600 dark:text-rose-400">
          ✕ أطول من كيسك (<span dir="ltr">{caseGpuMaxMm(specs)}</span> مم)
        </span>
      )}
    </span>
  );
}
