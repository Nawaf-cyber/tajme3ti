/* ============ تقييم الأداء كما يراه الزائر ============
 *
 * كلمةٌ لا كسر: «أداء الألعاب: قوي» لا «ألعاب 4/5» — الكسر يُقرأ عدد ألعاب (ملاحظة نوّاف
 * 2026-10-22). ومع الكلمة الرقمُ المقيس ومصدره، وما لا قياس له «غير مقيس» — لا تقدير.
 *
 * والمستوى من القياس نفسه الذي يُكتب في القاعدة (lib/perf-tier · scripts/fix-perf-tiers-measured)،
 * فما تقوله البطاقة هو ما يحكم به الباني على الاختناق. ومصدرٌ واحد تقرؤه صفحة القطعة وصفحة
 * «كيف نقيّم؟» (وبعدهما قوائم الباني والمقارنة) — لا نسخة في كلّ مكان.
 */

import { cpuPerf, CPU_PERF_SOURCE, CPU_GAMING_TOP } from './cpu-perf';
import { gpuPerf, GPU_PERF_SOURCE } from './gpu-perf';
import { cpuTierFromGaming, cpuTierFromMulti, cpuStem } from './perf-tier';

export const LEVEL_WORDS = ['', 'أساسي', 'اقتصادي', 'متوسّط', 'قوي', 'قمّة'] as const;
export const levelWord = (level: number) => LEVEL_WORDS[Math.max(1, Math.min(5, Math.round(level)))];

/* حدود الكرت — إطارات 1440p المقيسة، بنفس ترتيب المستويات المخزّنة (متّسقة معها بعد إصلاح 2026-10-22) */
export const GPU_FPS_LEVELS: [number, number][] = [[118, 5], [86, 4], [61, 3], [35, 2], [0, 1]];
export const gpuTierFromFps = (f1440: number) => GPU_FPS_LEVELS.find(([min]) => f1440 >= min)![1];

export type Rating = {
  /** «الألعاب» أو «المونتاج والتصميم» */
  label: string;
  level: number | null;
  word: string | null;
  /** الرقم المقيس بجملة: «٧٣٪ من أسرع معالج ألعاب» */
  metric: string | null;
  /** المقيسة غيرُها (نفس الشريحة): اسمها، يُذكر صراحةً */
  via: string | null;
  /** الرقم المقيس نفسه — للترتيب «الأقوى أولاً» داخل المستوى (إطارات 1440p أو ٪) */
  value: number | null;
};

const num = (v: unknown): number | null => {
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : null;
};

/** القياس للمعالج — ونظيره المقيس حين لا قياس له (9600 ← 9600X، 13900KS ← 13900K) */
function cpuMeasured(name: string): { p: NonNullable<ReturnType<typeof cpuPerf>>; via: string | null } | null {
  const own = cpuPerf(name);
  if (own) return { p: own, via: null };
  /* ⚠️ النظير بالجذع نفسه الذي كتب به السكربت المستوى في القاعدة (lib/perf-tier · cpuStem):
     كان هنا ثلاثُ صيغ فاتها 14700F و265F — فالبطاقة تقول «غير مقيس» والقاعدة تحكم بمستوى
     14700K، وحكم الباني يسقط إلى الجملة العامّة (2026-10-22). */
  const n = name.trim();
  const stem = cpuStem(n);
  for (const twin of [`${n}X`, n.replace(/KS$/i, 'K'), `${n}K`, `${stem}K`, `${stem}X`, stem]) {
    if (twin === n) continue;
    const p = cpuPerf(twin);
    if (p) return { p, via: p.chip };
  }
  return null;
}

/** تقييمات القطعة — للمعالج اثنان (الألعاب والمونتاج)، وللكرت واحد. وغيرهما لا تقييم */
export function partRatings(category: string | null | undefined, name: string, specs: any): Rating[] {
  if (category === 'GPU') {
    const p = gpuPerf(name, num(specs?.vram));
    if (!p) return [{ label: 'الألعاب', level: null, word: null, metric: null, via: null, value: null }];
    const level = gpuTierFromFps(p.f1440);
    return [{ label: 'الألعاب', level, word: levelWord(level), metric: `نحو ${Math.round(p.f1440)} إطاراً في 1440p`, via: null, value: p.f1440 }];
  }
  if (category === 'CPU') {
    const m = cpuMeasured(name);
    const g = m?.p.gaming ?? null;
    const w = m?.p.multi ?? null;
    return [
      g != null
        ? { label: 'الألعاب', level: cpuTierFromGaming(g), word: levelWord(cpuTierFromGaming(g)), metric: `${Math.round(g)}٪ من أسرع معالج ألعاب (${CPU_GAMING_TOP})`, via: m!.via, value: g }
        : { label: 'الألعاب', level: null, word: null, metric: null, via: null, value: null },
      w != null
        ? { label: 'المونتاج والتصميم', level: cpuTierFromMulti(w), word: levelWord(cpuTierFromMulti(w)), metric: `${Math.round(w)}٪ من الأسرع في تعدّد الأنوية`, via: m!.via, value: w }
        : { label: 'المونتاج والتصميم', level: null, word: null, metric: null, via: null, value: null },
    ];
  }
  return [];
}

export const RATING_SOURCES = { cpu: CPU_PERF_SOURCE, gpu: GPU_PERF_SOURCE };
