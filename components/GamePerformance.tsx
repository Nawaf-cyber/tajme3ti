/* ============ «أداء الكرت في الألعاب» — إطاراتٌ مقيسة لا مقدَّرة ============
 *
 * ⚠️ كان هنا FpsEstimator: بطاقات «Cyberpunk +110» و«Valorant +500» محسوبةٌ من مستوى الكرت
 * والمعالج بمعاملاتٍ مكتوبة باليد (المستوى ٥ = ٥٥٠ «نقطة»، و1440p × ٠٫٧ …)، وخصمٌ مخترع
 * للاختناق (١٥٪ لكلّ مستوى في 1080p). فأعطى 9600 فريماتٍ أكثر من 9600X لأنّ مستواه كان
 * مقلوباً، وكان سيُناقض بطاقة «تقييم الأداء» المقيسة بجانبه (2026-10-22).
 *
 * الآن متوسّط الإطارات المقيس للكرت بكلّ دقّة (lib/gpu-perf · Tom's Hardware) ووصفه
 * (مريح/مقبول/محدود). ولا أرقام لكلّ لعبة: لا قياس عندنا لكلّ لعبة، فلا نخترعه. والمعالج
 * يُذكر بالكلمات إن كان أدنى من الكرت بدرجتين — بلا نسبة خصمٍ لا نملك قياسها.
 * بلا حالة ولا 'use client': يُرسم في صفحة الخادم (التجميعة المشتركة) وفي الباني و«تجميعاتي».
 */
import { gpuPerf, feel, GPU_PERF_SOURCE } from '../lib/gpu-perf';
import { partRatings } from '../lib/perf-rating';

type PartLike = { name: string; specs?: any } | null | undefined;

const specsOf = (p: PartLike) => {
  const s = p?.specs;
  if (!s) return {};
  if (typeof s === 'string') { try { return JSON.parse(s); } catch { return {}; } }
  return s;
};
const num = (v: unknown): number | null => {
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : null;
};

const FEEL_CLS: Record<string, string> = {
  'مريح': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  'مقبول': 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  'محدود': 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
};

export default function GamePerformance({ gpu, cpu }: { gpu: PartLike; cpu?: PartLike }) {
  if (!gpu) return null;
  const p = gpuPerf(gpu.name, num(specsOf(gpu).vram));
  const gpuR = partRatings('GPU', gpu.name, specsOf(gpu))[0];
  const cpuR = cpu ? partRatings('CPU', cpu.name, specsOf(cpu))[0] : null;
  const cpuBehind = !!(cpuR?.level != null && gpuR?.level != null && cpuR.level <= gpuR.level - 2);

  const rows: [string, number][] = p ? [['1080p', p.f1080], ['1440p', p.f1440], ['4K', p.f4k]] : [];
  /* الدقّة الأنسب: أعلى دقّةٍ يبقى فيها مريحاً (٦٠ إطاراً فأكثر) */
  const best = [...rows].reverse().find(([, f]) => feel(f) === 'مريح')?.[0] ?? null;

  return (
    <div className="mt-6 border border-slate-200 dark:border-slate-700/50 rounded-sm overflow-hidden bg-white dark:bg-slate-800/30 shadow-sm">
      <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700/50">
        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">⚡ أداء الكرت في الألعاب</h4>
        <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
          متوسّط الإطارات في ألعاب حديثة بإعدادات عالية — مقيس، مو تقدير
        </p>
      </div>

      {p ? (
        <div className="grid grid-cols-3 gap-2 p-3">
          {rows.map(([res, fps]) => (
            <div
              key={res}
              className={`rounded-sm border py-3 text-center ${res === best ? 'border-cyan-500/60 bg-cyan-500/[0.05]' : 'border-slate-200 dark:border-slate-700/60'}`}
            >
              <div className="text-[12px] font-black text-slate-500 dark:text-slate-400" dir="ltr">{res}{res === best && ' ★'}</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">{Math.round(fps)}</div>
              <div className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400">إطار</div>
              <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded-sm text-[11px] font-black ${FEEL_CLS[feel(fps)]}`}>{feel(fps)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="p-4 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
          ما لقينا قياساً منشوراً لهذا الكرت — فما نعرض أرقام فريمات بالتخمين.
        </p>
      )}

      {cpuBehind && p && (
        <p className="mx-3 mb-3 px-3 py-2 rounded-sm bg-amber-500/[0.08] border border-amber-500/30 text-[12px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
          أداء معالجك في الألعاب «{cpuR!.word}» والكرت «{gpuR.word}»: في 1080p و1440p ممكن تطلع إطاراتك أقل من هذي الأرقام في الألعاب الثقيلة على المعالج.
        </p>
      )}

      <div className="bg-slate-50 dark:bg-slate-800/40 px-3 py-2.5 border-t border-slate-100 dark:border-slate-700/50 text-center text-[12px] font-semibold text-slate-500 dark:text-slate-400">
        {p && <>«مريح» 60 إطاراً فأكثر، و«مقبول» 45–60 · {best && <>★ أعلى دقّة مريحة لكرتك · </>}</>}
        المصدر <a href={GPU_PERF_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline">{GPU_PERF_SOURCE.name}</a>
        {' · '}<a href="/how-we-rate" className="underline font-bold text-cyan-700 dark:text-cyan-400">كيف نقيّم؟</a>
      </div>
    </div>
  );
}
