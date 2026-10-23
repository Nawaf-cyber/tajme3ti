/* ============ الأداء المقيس في صفحة القطعة ============
 *
 * كانت صفحة المقارنة وحدها تعرض إطارات الكرت ونِسَب المعالج، وصفحةُ القطعة —
 * وهي ما يهبط عليه القادم من البحث — بلا رقم أداءٍ واحد. فالمجرّب الخبير
 * (تجربة المستخدمين 2026-10-17) قرأ 117 إطاراً في المقارنة ثمّ فتح صفحة الكرت
 * فلم يجدها.
 *
 * والأرقام نفسها من الجدولين نفسيهما (lib/gpu-perf · lib/cpu-perf) — لا
 * تقدير: ما ليس في جدول المصدر لا يُعرض له شيء، فيغيب القسم كلّه.
 * (2026-10-22: للكرت وحده — إطاراته بكلّ دقّة. والمستوى للقطعتين في components/PartRating.)
 */

import { gpuPerf, feelLine, feel, GPU_PERF_SOURCE } from '../lib/gpu-perf';
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

  /* المعالج: تقييماه (الألعاب والمونتاج) في بطاقة «تقييم الأداء» قرب السعر (components/PartRating) —
     كانت هنا أشرطةٌ بالنِّسب نفسها، فتكرّر الرقم مرّتين في الصفحة */
  return null;
}
