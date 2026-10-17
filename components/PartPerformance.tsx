/* ============ الأداء المقيس في صفحة القطعة ============
 *
 * كانت صفحة المقارنة وحدها تعرض إطارات الكرت ونِسَب المعالج، وصفحةُ القطعة —
 * وهي ما يهبط عليه القادم من البحث — بلا رقم أداءٍ واحد. فالمجرّب الخبير
 * (تجربة المستخدمين 2026-10-17) قرأ 117 إطاراً في المقارنة ثمّ فتح صفحة الكرت
 * فلم يجدها.
 *
 * والأرقام نفسها من الجدولين نفسيهما (lib/gpu-perf · lib/cpu-perf) — لا
 * تقدير: ما ليس في جدول المصدر لا يُعرض له شيء، فيغيب القسم كلّه.
 */

import { gpuPerf, feelLine, feel, GPU_PERF_SOURCE } from '../lib/gpu-perf';
import { cpuPerf, CPU_PERF_SOURCE, CPU_GAMING_TOP } from '../lib/cpu-perf';
import { Panel, SectionHeading } from './Panel';

const num = (v: unknown): number | null => {
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : null;
};

const FEEL_CLS: Record<string, string> = {
  'مريح': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  'مقبول': 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  'محدود': 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
};

export default function PartPerformance({ category, name, specs }: { category?: string; name: string; specs: any }) {
  if (category === 'GPU') {
    const p = gpuPerf(name, num(specs?.vram));
    if (!p) return null;
    const rows: [string, number][] = [['1080p', p.f1080], ['1440p', p.f1440], ['4K', p.f4k]];
    return (
      <div className="flex flex-col gap-4">
        <SectionHeading>الأداء في الألعاب</SectionHeading>
        <Panel className="px-6 py-5">
          <div className="grid grid-cols-3 gap-2 text-center">
            {rows.map(([res, fps]) => (
              <div key={res} className="rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 py-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{Math.round(fps)}</div>
                <div className="text-[12px] font-bold text-slate-500 dark:text-slate-400">إطار بدقّة <span dir="ltr">{res}</span></div>
                <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded-sm text-[11px] font-black ${FEEL_CLS[feel(fps)]}`}>{feel(fps)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{feelLine(p)}</p>
          <p className="mt-2 text-[12px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
            متوسّط الإطارات لشريحة {p.chip} في اختبارات{' '}
            <a href={GPU_PERF_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-700 dark:hover:text-cyan-400">{GPU_PERF_SOURCE.name}</a>
            {' '}— يختلف باللعبة والمعالج. «مريح» 60 إطاراً فأكثر، و«مقبول» 45–60.
          </p>
        </Panel>
      </div>
    );
  }

  if (category === 'CPU') {
    const p = cpuPerf(name);
    if (!p || (p.gaming == null && p.multi == null)) return null;
    const bar = (label: string, v: number | null, hint: string) => (
      <div>
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="text-[13px] font-black text-slate-700 dark:text-slate-300">{label}</span>
          <span className="text-[13px] font-black text-slate-900 dark:text-white font-mono">{v != null ? `${Math.round(v)}%` : 'لم يُختبر'}</span>
        </div>
        <div className="h-2 rounded-sm bg-slate-200 dark:bg-slate-800 overflow-hidden" dir="ltr">
          {v != null && <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${Math.min(100, v)}%` }} />}
        </div>
        <p className="mt-1 text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">{hint}</p>
      </div>
    );
    return (
      <div className="flex flex-col gap-4">
        <SectionHeading>الأداء المقيس</SectionHeading>
        <Panel className="px-6 py-5 flex flex-col gap-4">
          {bar('الألعاب', p.gaming, `نسبةً لأسرع معالج ألعاب اليوم (${CPU_GAMING_TOP})`)}
          {bar('تعدّد الأنوية', p.multi, 'للمونتاج والرندر والبرامج الثقيلة — نسبةً للأسرع في الجدول')}
          <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
            من جداول{' '}
            <a href={CPU_PERF_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-700 dark:hover:text-cyan-400">{CPU_PERF_SOURCE.name}</a>.
          </p>
        </Panel>
      </div>
    );
  }

  return null;
}
