/* ============ أداء الكروت في الألعاب — رقمٌ مقيس لا درجة ============
 *
 * «مستوى الأداء» عندنا خمس درجات، فـ5070 و5070 Ti كلاهما ٤ — وقال الحكم
 * «بنفس مستوى أداء 5070 Ti» عن كرتٍ أبطأ منه بـ١٧٪. قال نوّاف: «الكلام غير
 * منطقي». فالحكم يحتاج فرق الأداء الحقيقي.
 *
 * والرقم **إطاراتٌ في الثانية** لا نسبة: الزائر يسأل «يكفيني؟»، و«104 إطار
 * في 1440p» جوابٌ يفهمه، و«83٪» لا.
 *
 * المصدر: جدول Tom's Hardware «GPU Benchmarks Hierarchy» — قسم Rasterization،
 * متوسّط ألعاب مجموعتهم بإعدادات Ultra، بلا DLSS/FSR ولا توليد إطارات.
 * قُرئ في 2026-10-06، وتاريخ آخر تحديثٍ في الصفحة 2026-06-24.
 *
 * ⚠️ الرقم للشريحة لا للنسخة: نسخ الشركاء (VENTUS، PULSE، AORUS) تفرق عنه
 * بنسبٍ صغيرة، ونسخ Low Profile قد تقلّ أكثر. وهو متوسّطٌ — يختلف باللعبة
 * والمعالج.
 * ⚠️ والأرقام هنا تُنقل كما هي ولا تُعدَّل — تغييرها يكون بقراءة الجدول ثانيةً
 * وتحديث التاريخين.
 */

export const GPU_PERF_SOURCE = {
  name: "Tom's Hardware",
  url: 'https://www.tomshardware.com/reviews/gpu-hierarchy,4388.html',
  updated: '2026-06-24',
  read: '2026-10-06',
} as const;

/** [الشريحة، الذاكرة إن اختلفت نسخها، إطارات 1080p، 1440p، 4K] */
type Row = [chip: string, vram: number | null, f1080: number, f1440: number, f4k: number];

const ROWS: Row[] = [
  ['RTX 5090', null, 203.8, 167.3, 110.8],
  ['RTX 4090', null, 183.6, 143.4, 89.1],
  ['RTX 5080', null, 166.9, 128.3, 77.4],
  ['RX 7900 XTX', null, 161.5, 122.3, 70.6],
  ['RTX 4080 SUPER', null, 158.9, 118.6, 69.4],
  ['RTX 4080', null, 157.3, 117.5, 67.5],
  ['RTX 5070 TI', null, 155.4, 116.8, 68.6],
  ['RX 9070 XT', null, 156.6, 116.5, 65.8],
  ['RX 7900 XT', null, 145.4, 108.0, 59.8],
  ['RTX 4070 TI SUPER', null, 141.2, 104.0, 58.5],
  ['RX 9070', null, 140.9, 104.0, 57.7],
  ['RTX 3090 TI', null, 131.7, 99.9, 59.3],
  ['RTX 4070 TI', null, 135.1, 97.9, 53.9],
  ['RTX 5070', null, 132.6, 96.4, 54.3],
  ['RTX 3090', null, 122.9, 91.5, 53.1],
  ['RTX 4070 SUPER', null, 126.7, 91.2, 49.2],
  ['RX 6950 XT', null, 123.3, 89.5, 48.3],
  ['RTX 3080 TI', null, 119.6, 89.1, 51.0],
  ['RX 9070 GRE', null, 120.6, 86.6, 46.3],
  ['RX 7800 XT', null, 118.4, 84.7, 45.1],
  ['RX 6900 XT', null, 117.1, 83.9, 44.9],
  ['RTX 3080', null, 111.6, 82.0, 43.9],
  ['RX 6800 XT', null, 111.8, 79.6, 42.2],
  ['RTX 4070', null, 111.5, 77.8, 41.3],
  ['RTX 5060 TI', 16, 105.2, 73.4, 40.2],
  ['RX 7700 XT', null, 102.9, 72.7, 38.0],
  ['RX 9060 XT', 16, 98.3, 67.3, 35.2],
  ['RTX 5060 TI', 8, 100.4, 68.6, 28.1],
  ['RTX 3070 TI', null, 94.6, 66.9, 26.0],
  ['RX 9060 XT', 8, 93.2, 62.5, 29.7],
  ['RTX 4060 TI', 16, 89.3, 60.5, 31.3],
  ['RX 7600 XT', null, 102.1, 50.2, 25.5],
  ['RTX 3070', null, 87.2, 58.2, 26.2],
  ['RTX 4060 TI', 8, 88.0, 58.9, 23.9],
  ['RX 6750 XT', null, 83.2, 57.6, 29.6],
  ['RTX 5060', null, 88.5, 59.8, 21.8],
  ['RX 6700 XT', null, 79.2, 54.3, 28.0],
  ['ARC B580', null, 71.5, 50.7, 27.6],
  ['RTX 3060 TI', null, 74.2, 51.0, 19.4],
  ['RTX 4060', null, 71.5, 47.6, 17.4],
  ['RX 7600', null, 69.9, 45.4, 18.4],
  ['RTX 5050', null, 69.3, 45.2, 17.0],
  ['ARC B570', null, 63.5, 44.3, 19.6],
  ['RTX 3060', 12, 61.5, 41.9, 22.2],
  ['RX 6650 XT', null, 64.3, 38.0, 19.0],
  ['RX 6600 XT', null, 62.7, 40.7, 17.3],
  ['RX 6600', null, 51.9, 24.8, 14.5],
  ['RTX 3050', null, 44.6, 29.8, 12.6],
];

/** متوسّط الإطارات في الثانية بكلّ دقّة */
export type GpuPerf = { chip: string; f1080: number; f1440: number; f4k: number };

/* «RTX 5070» لا تطابق «RTX 5070 Ti»: بعد الشريحة لا يأتي لاحقٌ يغيّرها */
const SUFFIX = '(?!\\s*(?:TI|SUPER|XTX|XT|GRE)\\b)';
const MATCHERS = ROWS.map((r) => ({ row: r, re: new RegExp(`\\b${r[0].replace(/ /g, '\\s*')}\\b${SUFFIX}`, 'i') }));

/** أداء الشريحة لاسم القطعة — null لما ليس في الجدول (Arc A، GTX 1650، 7900 GRE…) */
export function gpuPerf(name: string, vramGb?: number | null): GpuPerf | null {
  const hits = MATCHERS.filter((m) => m.re.test(name));
  /* نسختا ذاكرة لشريحةٍ واحدة (5060 Ti 8/16): تُختار بالذاكرة، ولا تخمين بلاها */
  const pool = hits.filter((m) => m.row[1] == null || m.row[1] === vramGb);
  if (!pool.length) return null;
  const best = pool.reduce((a, b) => (b.row[0].length > a.row[0].length ? b : a));
  const [chip, , f1080, f1440, f4k] = best.row;
  return { chip, f1080, f1440, f4k };
}

/* ============ «يكفيني؟» — وصفٌ لكلّ دقّة ============
 * ⚠️ الحدود من عندنا لا من المصدر: ٦٠ إطاراً فأكثر «مريح»، و٤٥–٦٠ «مقبول»،
 * وما دونه «محدود». تُقال كذلك في الصفحة. */
export type FeelLevel = 'مريح' | 'مقبول' | 'محدود';
export const feel = (fps: number): FeelLevel => (fps >= 60 ? 'مريح' : fps >= 45 ? 'مقبول' : 'محدود');

/* «1440p» داخل جملةٍ عربيّة تقلب ما حولها — FSI…PDI يعزلها */
const iso = (s: string) => `\u2068${s}\u2069`;

/** «مريح لـ 1080p و1440p · محدود في 4K» */
export function feelLine(p: GpuPerf): string {
  const res: [string, number][] = [['1080p', p.f1080], ['1440p', p.f1440], ['4K', p.f4k]];
  const groups = new Map<FeelLevel, string[]>();
  for (const [r, f] of res) groups.set(feel(f), [...(groups.get(feel(f)) ?? []), r]);
  return (['مريح', 'مقبول', 'محدود'] as FeelLevel[])
    .filter((l) => groups.has(l))
    .map((l) => `${l} ${l === 'محدود' ? 'في' : 'لـ'} ${groups.get(l)!.map(iso).join(' و')}`)
    .join(' · ');
}
