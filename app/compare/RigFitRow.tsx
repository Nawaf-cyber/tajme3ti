'use client';

/* ============ «تناسب جهازك؟» — صفّ القرار أوّلَ الجدول ============
 *
 * أفضل قطعةٍ في المقارنة لا تنفع إن لم تُركَّب. والحكم نفسه الذي تعرضه
 * صفحة القطعة (RigFitPanel): `fitsRig` على الجهاز المسجَّل — فرقُ حالتين،
 * فلا يُنسب للمرشَّح عيبٌ قائمٌ في الجهاز أصلاً. والجلب مشترك (useRig).
 *
 * ⚠️ وما لم يُفحص يُقال: من لم يسجّل كيسه لا يُقال له «تناسب» عن كرتٍ
 * قد لا يدخل — يُقال «لم نفحص: الكيس».
 *
 * والحكم يُحسب مرّةً في useRigFits ويقرؤه الصفّ و«الحكم» أسفل الجدول معاً
 * (lib/compare-verdict) — فلا يقول الصفّ «لا تركب» والحكمُ يرشّحها.
 */

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRig } from '../../lib/use-rig';
import { goToLogin } from '../../lib/login-href';
import { fitsRig, type RigCategory, type FitVerdict } from '../../lib/rig-fit';
import { catMeta } from '../../lib/category-meta';
import type { BuildParts } from '../../lib/build-check';

type Rig = { buildId: string; name: string; rig: BuildParts; customParts: Record<string, string> };

export type RigFits =
  | { state: 'loading' | 'guest' | 'none' }
  | { state: 'ready'; rigName: string; verdicts: (FitVerdict | 'mine')[];
      /** لوحة الجهاز — لـ«تكلفة المنصّة»: إن قبلت المعالج فثمنها لا يُحسب. null لقطعةٍ مكتوبة باليد (بلا مواصفات) */
      rigBoard: any | null };

/** حكم «تناسب جهازك؟» لكلّ عمود — مرّةً للصفحة */
export function useRigFits(parts: any[], category: string): RigFits {
  const { status } = useSession();
  const rigState = useRig();
  if (rigState.state === 'loading') return { state: 'loading' };
  if (rigState.state !== 'ready') return { state: status !== 'authenticated' ? 'guest' : 'none' };
  const rig = rigState.rig as Rig;
  const custom = Object.keys(rig.customParts).filter(Boolean) as RigCategory[];
  const cat = category as RigCategory;
  return {
    state: 'ready',
    rigName: rig.name,
    /* قطعتُه نفسها: «تناسب» عنها صحيحٌ وفارغ — يُقال إنّها عنده */
    verdicts: parts.map((p) => ((rig.rig[cat] as any)?.id === p.id ? 'mine' : fitsRig(rig.rig, cat, p, custom))),
    rigBoard: custom.includes('Motherboard' as RigCategory) ? null : (rig.rig as any).Motherboard ?? null,
  };
}

const HEAD: Record<FitVerdict['state'], { icon: string; text: string; cls: string }> = {
  fits: { icon: '✅', text: 'تناسب جهازك', cls: 'text-emerald-700 dark:text-emerald-400' },
  warn: { icon: '⚠️', text: 'تعمل — مع ملاحظة', cls: 'text-amber-700 dark:text-amber-400' },
  block: { icon: '⛔', text: 'لا تناسب جهازك', cls: 'text-rose-700 dark:text-rose-400' },
};

const TH = 'sticky right-0 z-10 bg-white dark:bg-[#0F172A] text-right py-3.5 px-4 text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 align-top';

export default function RigFitRow({ parts, fits, bestIdx, addCol }: {
  parts: any[];
  fits: RigFits;
  /** عمود «أفضل قيمة» — يُظلَّل كبقية الصفوف */
  bestIdx: number;
  /** عمود «أضف قطعة» الفارغ */
  addCol: boolean;
}) {
  if (fits.state === 'loading') return null; // لا هيكلٌ يقفز

  const filler = addCol ? (
    <td className="border-b border-slate-200 dark:border-slate-800" data-filler style={{ borderRight: '1px dashed rgba(34,211,238,0.15)' }}></td>
  ) : null;

  /* الزائر والمسجَّل بلا جهاز: دعوةٌ في عرض الصفّ، لا خاناتٌ فارغة */
  if (fits.state !== 'ready') {
    const guest = fits.state === 'guest';
    return (
      <tr data-noexport>
        <th scope="row" className={TH}>تناسب جهازك؟</th>
        <td colSpan={parts.length} className="py-3.5 px-3 text-center border-b border-r border-slate-200 dark:border-slate-800">
          <Link
            href={guest ? '/login' : '/my-builds'}
            onClick={guest ? goToLogin : undefined}
            className="text-xs md:text-sm font-bold text-cyan-700 dark:text-cyan-400 hover:underline"
          >
            🖥️ {guest ? 'سجّل دخولك وسجّل جهازك' : 'سجّل جهازك الحالي'} لنقول لك أيّها يركب فيه ←
          </Link>
        </td>
        {filler}
      </tr>
    );
  }

  return (
    <tr data-noexport>
      <th scope="row" className={TH}>
        تناسب جهازك؟
        <span className="block mt-1 text-xs font-normal text-slate-600 dark:text-slate-400 truncate max-w-[160px]" title={fits.rigName}>
          {fits.rigName}
        </span>
      </th>
      {parts.map((p, i) => {
        const shade = i === bestIdx ? 'bg-cyan-500/[0.05] dark:bg-cyan-400/[0.04]' : '';
        const v = fits.verdicts[i];
        if (v === 'mine') {
          return (
            <td key={p.id} className={`py-3.5 px-3 text-center align-top border-b border-r border-slate-200 dark:border-slate-800 ${shade}`}>
              <span className="text-xs md:text-sm font-black text-cyan-700 dark:text-cyan-400">🖥️ في جهازك الحالي</span>
            </td>
          );
        }
        const h = HEAD[v.state];
        return (
          <td key={p.id} className={`py-3.5 px-3 text-center align-top border-b border-r border-slate-200 dark:border-slate-800 ${shade}`}>
            <span className={`text-xs md:text-sm font-black ${h.cls}`}>{h.icon} {h.text}</span>
            {v.issues.length > 0 && (
              <ul className="mt-1.5 space-y-1 text-right">
                {v.issues.map((x) => (
                  <li key={x.code + x.message} className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                    — {x.message}
                  </li>
                ))}
              </ul>
            )}
            {v.unchecked.length > 0 && (
              <span className="block mt-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
                لم نفحص: {v.unchecked.map((u) => catMeta(u.need).label).join('، ')} — ليست في جهازك
              </span>
            )}
          </td>
        );
      })}
      {filler}
    </tr>
  );
}
