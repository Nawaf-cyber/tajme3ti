'use client';

/* ============ «تناسب كرتك؟» — صفّ القرار أوّلَ جدول مقارنة الشاشات ============
 *
 * نظير RigFitRow للشاشات (وهي ليست قطعة تجميعة فلا يُفحص بها الجهاز): الحكم من lib/monitor-match
 * (judgeMonitor) — منطق «شاشة تلائم كرتك» نفسه في الباني وصفحة الشاشات، فلا يقول الصفّ شيئاً
 * ويقول المقترح غيره. والكرت: جهازك المسجَّل، وإلّا كرت مسودّة الباني، وإلّا يختاره الزائر —
 * وتغييره هنا لا يغيّر تجميعته. (طلب نوّاف 2026-11-18)
 */

import { useEffect, useMemo, useState } from 'react';
import { useRig } from '../../lib/use-rig';
import { judgeMonitor, type MonitorJudgement } from '../../lib/monitor-match';
import { GpuSearch, UsePicker, useMonitorUse, type GpuOpt } from '../../components/MonitorAdvice';
import { NoUpscaleBadge } from '../../components/FpsNote';

const TH = 'sticky right-0 z-10 bg-white dark:bg-[#0F172A] text-right py-3.5 px-4 text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 align-top';

const HEAD: Record<MonitorJudgement['level'], { icon: string; cls: string }> = {
  best: { icon: '✅', cls: 'text-emerald-700 dark:text-emerald-400' },
  over: { icon: '⚠️', cls: 'text-amber-700 dark:text-amber-400' },
  under: { icon: '⚠️', cls: 'text-amber-700 dark:text-amber-400' },
  heavy: { icon: '⚠️', cls: 'text-amber-700 dark:text-amber-400' },
  light: { icon: 'ℹ️', cls: 'text-slate-700 dark:text-slate-300' },
  limited: { icon: '⛔', cls: 'text-rose-700 dark:text-rose-400' },
};

const specsOf = (s: unknown) => (typeof s === 'string' ? JSON.parse(s) : (s as Record<string, any>) || {});

export default function MonitorFitRow({ parts, gpus, bestIdx, addCol }: {
  parts: any[];
  gpus: GpuOpt[];
  bestIdx: number;
  addCol: boolean;
}) {
  const rigState = useRig();
  const [gpuId, setGpuId] = useState('');
  const [source, setSource] = useState<'rig' | 'draft' | 'picked' | ''>('');
  const [use, setUse] = useMonitorUse();

  /* المصدر الافتراضيّ مرّةً: جهازك المسجَّل أوّلاً، ثمّ مسودّة الباني */
  useEffect(() => {
    if (gpuId || rigState.state === 'loading') return;
    const rigGpu = rigState.state === 'ready' ? (rigState.rig as any)?.rig?.GPU?.id : null;
    if (rigGpu && gpus.some((g) => g.id === rigGpu)) { setGpuId(rigGpu); setSource('rig'); return; }
    try {
      const d = JSON.parse(localStorage.getItem('draft_pc_build') || '{}')?.GPU?.id;
      if (d && gpus.some((g) => g.id === d)) { setGpuId(d); setSource('draft'); }
    } catch { /* مسودّة تالفة — بلا كرت */ }
  }, [rigState.state, gpus, gpuId, rigState]);

  const gpu = gpus.find((g) => g.id === gpuId) ?? null;
  const sorted = useMemo(() => [...gpus].sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`)), [gpus]);
  const verdicts = useMemo(
    () => parts.map((p) => (gpu ? judgeMonitor({ name: gpu.name, specs: specsOf(gpu.specs) }, { id: p.id, brand: p.brand, name: p.name, price: p.price, available: true, specs: specsOf(p.specs) }, use) : null)),
    [parts, gpu, use],
  );

  const filler = addCol ? (
    <td className="border-b border-slate-200 dark:border-slate-800" data-filler style={{ borderRight: '1px dashed rgba(34,211,238,0.15)' }}></td>
  ) : null;

  return (
    <tr data-noexport className="bg-cyan-500/[0.04]">
      <th scope="row" className={TH}>
        تناسب كرتك؟
        <span className="block mt-1.5"><NoUpscaleBadge href="/how-we-rate#monitors" /></span>
        <div className="mt-2 font-normal">
          <GpuSearch gpus={sorted} value={gpu} onPick={(g) => { setGpuId(g.id); setSource('picked'); }} />
        </div>
        {source === 'rig' && <span className="block mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">من جهازك المسجَّل</span>}
        {source === 'draft' && <span className="block mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">من تجميعتك — وتغييره هنا ما يغيّرها</span>}
        {gpu && <UsePicker value={use} onChange={setUse} className="mt-2" />}
        {gpu && use === 'competitive' && (
          <span className="block mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            قاعدة عامة مو قياس — <a href="/how-we-rate#monitors" className="underline">ليش؟</a>
          </span>
        )}
      </th>
      {!gpu ? (
        <td colSpan={parts.length} className="py-3.5 px-3 text-center border-b border-r border-slate-200 dark:border-slate-800 text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300">
          🖥️ اختر كرتك ونقول لك أيّ شاشةٍ تستفيد منها فعلاً
        </td>
      ) : (
        parts.map((p, i) => {
          const v = verdicts[i];
          const shade = i === bestIdx ? 'bg-cyan-500/[0.05] dark:bg-cyan-400/[0.04]' : '';
          return (
            <td key={p.id} className={`py-3.5 px-3 text-center align-top border-b border-r border-slate-200 dark:border-slate-800 ${shade}`}>
              {!v ? (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ما عندنا قياس إطارات لهذا الكرت</span>
              ) : (
                <>
                  <span className={`text-xs md:text-sm font-black ${HEAD[v.level].cls}`}>{HEAD[v.level].icon} {v.title}</span>
                  <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-300">{v.reason}</p>
                  {v.ports && <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">المنافذ: {v.ports}</p>}
                  {v.sharp && <p className="mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">{v.sharp}</p>}
                </>
              )}
            </td>
          );
        })
      )}
      {filler}
    </tr>
  );
}
