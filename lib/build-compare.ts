/**
 * ============ تحليل ومقارنة التجميعات الكاملة ============
 *
 * منطق نقي بلا prisma ولا React — يُختبر بمعزل، ويستخدمه:
 *   - صفحة مقارنة التجميعات
 *   - (لاحقاً) أي مكان يحتاج تلخيص تجميعة
 *
 * الفكرة: مقارنة القطع تجيب "أي كرت أفضل؟"، ومقارنة التجميعات تجيب
 * السؤال الحقيقي: "أي جهاز أشتري؟" — وهو ما يهمّ المشتري فعلاً.
 *
 * ============ مراجعة 2026-10-14 ============
 * شُغّل على التجميعات المحفوظة كلّها (١١٩ لـ٥٧ مستخدماً)، فظهر:
 *   ١) «الأداء الأعلى» بمتوسّط درجتي المعالج والكرت (من ٥): في ٢٨١ زوجاً من تجميعات
 *      المستخدم نفسه بينها فرقٌ حقيقيّ في الكرت — تعادلٌ في ٣٦ واختيارُ الأبطأ في ٥٣
 *      (i7-14700K + 3080 Ti «أقوى» من 7700X + 5090). ← الإطارات المقيسة (lib/gpu-perf)
 *      وأداء المعالج المقيس (lib/cpu-perf)، كمقارنة القطع.
 *   ٢) لا فحص توافق — ٤ تجميعات لا تُركَّب تُقارَن كأنّها سليمة. ← checkBuild نفسه.
 *   ٣) المجموع يجمع النافد كأنّه يُشترى (٥١ تجميعة فيها قطعةٌ نافدة، و١٥ فيها قطعةٌ
 *      سعرها 0). ← المجموع للمتوفّر، والنافد يُسمّى.
 *   ٤) «ناقصة» كاذبة: المبرّد لمعالجٍ يأتي بمبرّد (٣٥)، والكرت لمعالجٍ برسوميّات (٤)،
 *      وبأسماء إنجليزيّة (Cooler · GPU). ← المطلوب يُشتقّ من المعالج، بأسماء عربيّة.
 *   ٥) «8/7 قطع» بعد إضافة المبرّد. ← «مكتملة» أو «ناقصة: …».
 *
 * ومراجعة ثانية في اليوم نفسه:
 *   ٦) حكما السعر والقيمة لا يظهران إلّا لتجميعاتٍ بلا نافد ولا ناقص — ٢٧ من ١١٩ فقط،
 *      فظهر «أقل ميزانية» في ٧ أزواج من ٤٢٢. ← النافد بآخر سعرٍ معروف (تقديريّ)،
 *      والناقص لا يمنع إن نقص الشيءُ نفسه من الجميع (priceComparable).
 *   ٧) ٣٩ تجميعة معالجها ليس في جدول القياس (أكثرها 7500F) فلا حكم «للمونتاج».
 *      ولا يُضاف من مصدرٍ آخر (يكسر المقارنة) ولا يُقدَّر — فالحكم بعدد الخيوط من
 *      المواصفات، معلَناً أنّه بالمواصفات.
 *   ٨) الإطارات بدقّة 1440p ثابتة. ← الدقّة يختارها الزائر (Res).
 */

import { capacityGb } from './capacity';
import { isAvailable } from './stores';
import { checkBuild, bundledCooler, computeDraw, psuHeadroom, type Issue } from './build-check';
import { gpuPerf, type GpuPerf } from './gpu-perf';
import { cpuPerf, type CpuPerf } from './cpu-perf';
import { catMeta } from './category-meta';

/* المبرّد أُضيف بعد إطلاق فئته: بدونه تُقارَن تجميعتان فيسقط الفرق بينهما
   حين يكون المبرّد هو ما يفرّق — ويسقط سعره من المجموع أيضاً. */
export const BUILD_PART_ORDER = [
  'CPU', 'Cooler', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Case',
] as const;
export type BuildPartKey = (typeof BUILD_PART_ORDER)[number];

export type BuildPart = {
  id: string;
  name: string;
  brand: string;
  price: number;
  performanceTier?: number | null;
  tdpWattage?: number | null;
  specs?: any;
  /** عروض المتاجر — منها يُعرف التوفّر (lib/stores · isAvailable) */
  offers?: any[] | null;
} | null;

export type Res = '1080p' | '1440p' | '4K';

export type BuildLike = {
  id: string;
  name: string;
  parts: Partial<Record<BuildPartKey, BuildPart>>;
  totalPrice?: number;
  createdAt?: string | Date;
};

const parseSpecs = (s: any) => {
  if (!s) return {};
  if (typeof s === 'string') { try { return JSON.parse(s); } catch { return {}; } }
  return s;
};
const specNum = (v: any): number => {
  if (v == null) return 0;
  const m = String(v).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
};

export const partLabel = (k: string) => catMeta(k).label;

export type BuildAnalysis = {
  /** مجموع القطع **المتوفّرة** — ما يُدفع اليوم فعلاً */
  totalPrice: number;
  /** القطع النافدة: لا تدخل المجموع، وتُسمّى (lastPrice: آخر سعرٍ معروف أو 0) */
  unavailable: { key: BuildPartKey; name: string; lastPrice: number }[];
  /** المتوفّر + آخر سعرٍ معروف للنافد — ما ستكلّفه التجميعة تقريباً متى توفّر */
  estTotal: number;
  /** في estTotal سعرٌ قديم لقطعةٍ نافدة — يُعلن «تقديريّ» */
  estimated: boolean;
  /** نافدٌ بلا أيّ سعرٍ معروف — لا يُقدَّر، فيمنع مقارنة السعر */
  unpriced: BuildPartKey[];
  /** خيوط المعالج من مواصفاته — احتياطُ «المونتاج» حين لا قياس */
  cpuThreads: number;
  /** سعر كلّ قطعةٍ حاضرة (المتوفّر أو آخر سعر؛ null لنافدٍ بلا سعر) — لمقارنة القطع المشتركة */
  partPrice: Partial<Record<BuildPartKey, number | null>>;
  /** استهلاك القطع مجتمعة (بلا هامش) — computeDraw كفحص الباني */
  totalTdp: number;
  /** سعة المزوّد المختار */
  psuWattage: number;
  /** ما يحتاجه المزوّد: الاستهلاك + هامشٌ يكبر مع الكرت (lib/build-check · psuHeadroom) */
  psuNeed: number;
  /** هامش الطاقة كنسبة من سعة المزوّد — للتوافق مع السكربتات القديمة */
  powerHeadroomPct: number | null;
  cpuTier: number | null;
  gpuTier: number | null;
  /** متوسط مستوى القطعتين — احتياطٌ حين لا قياس، لا حكم */
  perfScore: number | null;
  /** إطارات الكرت المقيسة؛ null لكرتٍ ليس في جدول المصدر أو بلا كرت */
  gpuPerf: GpuPerf | null;
  /** أداء المعالج المقيس (ألعاب، تعدّد) */
  cpuPerf: CpuPerf | null;
  hasGpu: boolean;
  /** بلا كرت والمعالج برسوميّات مدمجة — جهازٌ مكتبيّ لا ناقص */
  igpuOnly: boolean;
  ramGb: number;
  storageGb: number;
  /** عدد القطع المُختارة (من ٨) */
  filledCount: number;
  /** القطع التي تحتاجها هذه التجميعة تحديداً (الكرت والمبرّد بحسب المعالج) */
  required: BuildPartKey[];
  /** المطلوب الغائب */
  missing: BuildPartKey[];
  complete: boolean;
  /** فحص الباني نفسه (lib/build-check) — المانع أوّلاً */
  issues: Issue[];
  blocked: boolean;
  /** فارق مستوى المعالج عن الكرت: سالب = المعالج أضعف (اختناق) */
  bottleneckDelta: number | null;
};

export function analyzeBuild(b: BuildLike): BuildAnalysis {
  const parts = b.parts || {};
  const get = (k: BuildPartKey) => parts[k] || null;

  let totalPrice = 0;
  let filledCount = 0;
  const unavailable: BuildAnalysis['unavailable'] = [];
  const partPrice: BuildAnalysis['partPrice'] = {};

  for (const k of BUILD_PART_ORDER) {
    const p = get(k);
    if (!p) continue;
    filledCount++;
    /* بلا عروضٍ مجلوبة (سكربتٌ قديم) نثق بالسعر كما كان */
    const live = p.offers ? isAvailable(p as any) && p.price > 0 : p.price > 0;
    if (live) totalPrice += p.price;
    else unavailable.push({ key: k, name: p.name, lastPrice: p.price || 0 });
    partPrice[k] = p.price > 0 ? p.price : null;
  }

  const cpu = get('CPU');
  const gpu = get('GPU');
  const cpuSp = parseSpecs(cpu?.specs);
  const ig = String(cpuSp.integratedGraphics ?? '').trim();
  const cpuHasIgpu = !!ig && !/^(none|no|لا يوجد)$/i.test(ig);

  /* المطلوب يُشتقّ من المعالج: الكرت إلّا مع رسوميّاتٍ مدمجة، والمبرّد إن قال الفحص
     إنّ المعالج بلا مبرّد قطعاً. و«غير مؤكّد» (عروض tray) يتركه للفحص ينبّه عليه. */
  const required = BUILD_PART_ORDER.filter((k) => {
    if (k === 'GPU') return !cpu || !cpuHasIgpu;
    if (k === 'Cooler') return !cpu || bundledCooler(cpuSp.includedCooler) === 'no';
    return true;
  });
  const missing = required.filter((k) => !get(k));

  /* الفحص بلا تكرار: «لا مبرّد» و«لا صورة» يقولهما «ناقصة» حين تكون القطعة مطلوبة */
  const issues = checkBuild(parts as any).filter((i) =>
    !(i.code === 'noCooler' && missing.includes('Cooler')) && !(i.code === 'noDisplay' && missing.includes('GPU')));

  const totalTdp = computeDraw(parts as any);
  const psu = get('PSU');
  const psuWattage = psu ? specNum(parseSpecs(psu.specs).wattage) : 0;
  const psuNeed = totalTdp + psuHeadroom(Number(gpu?.tdpWattage) || 0);
  const powerHeadroomPct =
    psuWattage > 0 ? Math.round(((psuWattage - totalTdp) / psuWattage) * 100) : null;

  const cpuTier = cpu?.performanceTier ?? null;
  const gpuTier = gpu?.performanceTier ?? null;
  const perfScore =
    cpuTier != null && gpuTier != null ? (cpuTier + gpuTier) / 2 : (gpuTier ?? cpuTier);

  const ram = get('RAM');
  const ramSp = parseSpecs(ram?.specs);
  const ramGb = capacityGb(ramSp.capacity ?? ramSp.Capacity);

  const st = get('Storage');
  const stSp = parseSpecs(st?.specs);
  const storageGb = capacityGb(stSp.capacity ?? stSp.Capacity);

  const gpuVram = gpu ? specNum(parseSpecs(gpu.specs).vram) || null : null;

  const known = unavailable.filter((u) => u.lastPrice > 0);
  const estTotal = totalPrice + known.reduce((s, u) => s + u.lastPrice, 0);

  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    unavailable,
    estTotal: Math.round(estTotal * 100) / 100,
    estimated: known.length > 0,
    unpriced: unavailable.filter((u) => !(u.lastPrice > 0)).map((u) => u.key),
    cpuThreads: specNum(cpuSp.threads) || specNum(cpuSp.cores),
    partPrice,
    totalTdp,
    psuWattage,
    psuNeed,
    powerHeadroomPct,
    cpuTier,
    gpuTier,
    perfScore,
    gpuPerf: gpu ? gpuPerf(gpu.name, gpuVram) : null,
    cpuPerf: cpu ? cpuPerf(cpu.name) : null,
    hasGpu: !!gpu,
    igpuOnly: !gpu && !!cpu && cpuHasIgpu,
    ramGb,
    storageGb,
    filledCount,
    required,
    missing,
    complete: missing.length === 0,
    issues,
    blocked: issues.some((i) => i.level === 'block'),
    bottleneckDelta: cpuTier != null && gpuTier != null ? cpuTier - gpuTier : null,
  };
}

/** حالة التجميعة بكلمة — لبطاقة الاختيار ورأس العمود */
export function buildStatus(a: BuildAnalysis): { tone: 'ok' | 'warn' | 'block'; text: string } {
  if (a.blocked) return { tone: 'block', text: 'لا تُركَّب كما هي' };
  if (a.missing.length) return { tone: 'warn', text: `ناقصة: ${a.missing.map(partLabel).join('، ')}` };
  if (a.unavailable.length) return { tone: 'warn', text: `${a.unavailable.length === 1 ? 'قطعة نافدة' : `${a.unavailable.length} قطع نافدة`}` };
  return { tone: 'ok', text: 'مكتملة' };
}

/** إطارات الألعاب بالدقّة المختارة — صفرٌ لجهازٍ بلا كرت (الرسوميّات المدمجة ليست للألعاب الثقيلة) */
export const fpsAt = (a: BuildAnalysis, res: Res): number | null => {
  if (!a.hasGpu) return 0;
  const p = a.gpuPerf;
  return p ? (res === '4K' ? p.f4k : res === '1080p' ? p.f1080 : p.f1440) : null;
};

/**
 * هل يُقارَن السعر؟ لا يُقارن مجموعٌ ينقصه شيءٌ بآخر كامل — فيبدو الناقص أرخص.
 * فيُشترط: لا نافدَ بلا سعرٍ معروف، والناقص (إن وُجد) هو نفسه في الجميع —
 * تجميعتان كلتاهما بلا مبرّد تُقارنان بعدل. والنافد بسعرٍ معروف يدخل تقديراً.
 */
export type PriceComparison = {
  ok: boolean;
  estimated: boolean;
  sameMissing: BuildPartKey[];
  reason: string;
  /* حين لا يُقارن المجموع: القطع الحاضرة بسعرٍ في الجميع، وما أُخرج منها — فتُقارن
     «القطع المشتركة» بإعلانٍ صريح (null إن قلّت عن خمس: مقارنةٌ بلا معنى) */
  common: BuildPartKey[] | null;
  excluded: BuildPartKey[];
};

export function priceComparable(list: BuildAnalysis[]): PriceComparison {
  const estimated = list.some((a) => a.estimated);
  const common = BUILD_PART_ORDER.filter((k) => list.every((a) => a.partPrice[k] != null));
  const excluded = BUILD_PART_ORDER.filter((k) => !common.includes(k) && list.some((a) => k in a.partPrice || a.missing.includes(k)));
  const partial = { common: common.length >= 5 ? common : null, excluded };
  const unpriced = list.find((a) => a.unpriced.length);
  if (unpriced) return { ok: false, estimated, sameMissing: [], reason: `في تجميعةٍ قطعةٌ نافدة بلا سعرٍ معروف (${partLabel(unpriced.unpriced[0])}) — لا يُقدَّر مجموعها`, ...partial };
  const key = (a: BuildAnalysis) => [...a.missing].sort().join(',');
  if (new Set(list.map(key)).size > 1) {
    return { ok: false, estimated, sameMissing: [], reason: 'إحداها ينقصها ما في الأخرى — فتبدو الناقصة أرخص', ...partial };
  }
  return { ok: true, estimated, sameMissing: list[0]?.missing ?? [], reason: '', common: null, excluded: [] };
}

/** مجموع القطع المشتركة — لمقارنة السعر حين يختلف ما في التجميعات */
export const commonTotal = (a: BuildAnalysis, keys: BuildPartKey[]) =>
  keys.reduce((s, k) => s + (a.partPrice[k] ?? 0), 0);

/** others: من يشارك الصدارة (تجميعتان بالكرت نفسه) — تُذكران معاً */
export type BuildVerdict = { icon: string; forWhat: string; buildIdx: number; others?: number[]; why: string };

/**
 * توصيات حاسمة عبر التجميعات — نفس فلسفة مقارنة القطع:
 * سطر واحد لكل حاجة بدل أن يقارن المستخدم ٨ قطع × ٣ تجميعات يدوياً.
 *
 * ⚠️ التجميعة التي لا تُركَّب لا تُوصى بها — تُذكر في تحذيراتها.
 * ⚠️ والفرق دون ٥٪ ليس فرقاً: لا يُعلن «أسرع» على إطارين.
 */
export function buildVerdicts(list: BuildAnalysis[], res: Res = '1440p'): BuildVerdict[] {
  const out: BuildVerdict[] = [];
  const ok = list.map((a, i) => ({ a, i })).filter(({ a }) => !a.blocked);
  if (ok.length < 2) return out;
  const used = new Set<number>();
  const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
  const pct = (a: number, b: number) => Math.round(((a - b) / b) * 100);

  /* يفوز الأعلى إن سبق الثانيَ بـ٥٪ — وإلّا لا حكم */
  const winner = (vals: { i: number; v: number }[], minGap = 0.05) => {
    if (vals.length < 2) return null;
    const s = [...vals].sort((x, y) => y.v - x.v);
    if (s[1].v > 0 ? s[0].v < s[1].v * (1 + minGap) : s[0].v <= 0) return null;
    return { i: s[0].i, v: s[0].v, second: s[1].v };
  };

  /* والصدارة قد تكون مشتركة: ثلاث تجميعات، اثنتان بالكرت نفسه — كان الحكم يختفي
     لأنّ الأولى لا تسبق الثانية، وهما معاً تسبقان الثالثة بالضعف. فتُذكران معاً
     إن سبقتا البقيّة بـ٥٪ (ومن هي ضمن ٥٪ من الأعلى فهي في الصدارة) */
  const leaders = (vals: { i: number; v: number }[], minGap = 0.05) => {
    if (vals.length < 2) return null;
    const s = [...vals].sort((x, y) => y.v - x.v);
    const top = s[0].v;
    const group = s.filter((x) => x.v * (1 + minGap) > top);
    if (group.length === s.length) return null;
    const second = s[group.length].v;
    if (second > 0 ? top < second * (1 + minGap) : top <= 0) return null;
    return { idxs: group.map((x) => x.i), v: top, second };
  };

  /* ---- الألعاب: إطارات الكرت المقيسة؛ وإن غاب قياسٌ فدرجة الفئة بإعلانٍ صريح ---- */
  const fpsVals = ok.map(({ a, i }) => ({ i, v: fpsAt(a, res) }));
  if (fpsVals.every((x) => x.v != null)) {
    const w = leaders(fpsVals as { i: number; v: number }[]);
    if (w) {
      const [first, ...others] = w.idxs;
      const shared = others.length ? ' (متقاربتان في الألعاب)' : '';
      out.push({
        icon: '🎮', forWhat: 'للألعاب', buildIdx: first, others,
        why: w.second > 0
          ? `أسرع بـ ${pct(w.v, w.second)}٪${others.length ? ' من البقيّة' : ''} — نحو ${fmt(w.v)} إطار بدقّة ${res} مقابل ${fmt(w.second)}${shared}`
          : `${others.length ? 'وحدهما' : 'الوحيدة'} بكرت شاشة — نحو ${fmt(w.v)} إطار بدقّة ${res}`,
      });
      w.idxs.forEach((i) => used.add(i));
    }
  } else {
    const tierVals = ok.map(({ a, i }) => ({ i, v: (a.gpuTier ?? 0) * 10 + (a.cpuTier ?? 0) }));
    const w = winner(tierVals, 0.0001);
    if (w) {
      out.push({ icon: '🎮', forWhat: 'للألعاب', buildIdx: w.i, why: 'كرتها من فئةٍ أعلى (تقديرٌ بالفئة — أحد الكروت ليس في جدول القياس)' });
      used.add(w.i);
    }
  }

  /* ---- المونتاج والتطبيقات الثقيلة: أداء المعالج في التعدّد ---- */
  const multi = ok.map(({ a, i }) => ({ i, v: a.cpuPerf?.multi ?? null }));
  if (multi.every((x) => x.v != null)) {
    const w = winner(multi as { i: number; v: number }[]);
    if (w) {
      out.push({ icon: '🎬', forWhat: 'للمونتاج والتطبيقات الثقيلة', buildIdx: w.i, why: `معالجها أسرع بـ ${pct(w.v, w.second)}٪ في المهامّ متعدّدة الأنوية` });
      used.add(w.i);
    }
  } else {
    /* معالجٌ ليس في جدول القياس: لا رقم أداءٍ يُخترع — بل حقيقةٌ من المواصفات، وفرقٌ
       واضح فقط (مرّة ونصف فأكثر)، والحكم يقول إنّه بالمواصفات */
    const th = ok.map(({ a, i }) => ({ i, v: a.cpuThreads }));
    if (th.every((x) => x.v > 0)) {
      const w = winner(th, 0.5);
      if (w) {
        out.push({ icon: '🎬', forWhat: 'للمونتاج والتطبيقات الثقيلة', buildIdx: w.i, why: `خيوط معالجها ${w.v} مقابل ${w.second} (بالمواصفات — معالجٌ ليس في جدول القياس)` });
        used.add(w.i);
      }
    }
  }

  /* ---- القيمة والميزانية: بالمجموع التقديريّ (النافد بآخر سعر)، وبشرط priceComparable —
     مجموعٌ ينقصه ما في غيره «أرخص» كذباً ---- */
  const pc = priceComparable(ok.map(({ a }) => a));
  if (pc.ok && ok.every(({ a }) => a.estTotal > 0)) {
    const tail = [
      pc.estimated ? 'تقديريّ: يشمل آخر سعرٍ لقطعةٍ نافدة' : '',
      pc.sameMissing.length ? `والجميع بلا ${pc.sameMissing.map(partLabel).join('، ')}` : '',
    ].filter(Boolean).join(' · ');
    const withTail = (s: string) => (tail ? `${s} — ${tail}` : s);
    const value = ok.map(({ a, i }) => ({ i, v: (fpsAt(a, res) ?? -1) / a.estTotal }));
    if (value.every((x) => x.v > 0)) {
      const w = winner(value);
      if (w && !used.has(w.i)) {
        out.push({ icon: '⚖️', forWhat: 'لأفضل قيمة', buildIdx: w.i, why: withTail(`أكثر إطاراتٍ لكلّ ريال بدقّة ${res} — ${(w.v * 1000).toFixed(1)} إطار لكلّ ألف ريال`) });
        used.add(w.i);
      }
    }
    const cheap = [...ok].sort((x, y) => x.a.estTotal - y.a.estTotal);
    const c0 = cheap[0], c1 = cheap[1];
    if (c1.a.estTotal > c0.a.estTotal && !used.has(c0.i)) {
      out.push({ icon: '💰', forWhat: 'لأقل ميزانية', buildIdx: c0.i, why: withTail(`أوفر بـ ${fmt(c1.a.estTotal - c0.a.estTotal)} ﷼ (${fmt(c0.a.estTotal)} ﷼)`) });
      used.add(c0.i);
    } else if (c1.a.estTotal > c0.a.estTotal) {
      /* الأرخص فاز بحكمٍ قبله (الأسرع غالباً) — لا يُسكت عن أنّه أرخص أيضاً:
         «أسرع وأرخص» أقوى ما يُقال في مقارنة */
      const v = out.find((x) => x.buildIdx === c0.i);
      if (v) v.why += ` — وهي الأرخص أيضاً بـ ${fmt(c1.a.estTotal - c0.a.estTotal)} ﷼${pc.estimated ? ' تقريباً' : ''}`;
    }
  } else if (pc.common) {
    /* المجموع لا يُقارن (إحداها بلا مبرّد مثلاً) — فالقطع الموجودة في الجميع وحدها،
       وما أُخرج يُسمّى. وفرقٌ دون ١٠٠ ريال لا يُعلن. */
    const keys = pc.common;
    const cheap = [...ok].sort((x, y) => commonTotal(x.a, keys) - commonTotal(y.a, keys));
    const c0 = cheap[0], c1 = cheap[1];
    const gap = commonTotal(c1.a, keys) - commonTotal(c0.a, keys);
    if (gap >= 100) {
      const note = `في القطع الموجودة في الجميع — دون ${pc.excluded.map(partLabel).join('، ')}${pc.estimated ? ' · تقديريّ' : ''}`;
      if (!used.has(c0.i)) {
        out.push({ icon: '💰', forWhat: 'لأقل ميزانية', buildIdx: c0.i, why: `أوفر بـ ${fmt(gap)} ﷼ ${note}` });
        used.add(c0.i);
      } else {
        const v = out.find((x) => x.buildIdx === c0.i);
        if (v) v.why += ` — وهي الأرخص أيضاً بـ ${fmt(gap)} ﷼ ${note}`;
      }
    }
  }

  /* ---- الاستهلاك: فرقٌ يُذكر فقط (٥٠ واط فأكثر) ---- */
  const pw = ok.filter(({ a }) => a.totalTdp > 0).sort((x, y) => x.a.totalTdp - y.a.totalTdp);
  if (pw.length >= 2 && pw[1].a.totalTdp - pw[0].a.totalTdp >= 50) {
    const diff = pw[1].a.totalTdp - pw[0].a.totalTdp;
    const v = out.find((x) => x.buildIdx === pw[0].i || x.others?.includes(pw[0].i));
    /* فاز بحكمٍ قبله (الأرخص غالباً) — فيُلحق به ولا يُسكت عنه */
    if (!v) out.push({ icon: '🔋', forWhat: 'لأقل استهلاك', buildIdx: pw[0].i, why: `أقل بـ ${diff} واط` });
    else if (!v.others?.length) v.why += ` — وأقل استهلاكاً بـ ${diff} واط`;
  }
  return out;
}

export type BuildWarning = { level: 'block' | 'warn'; text: string };

/** تحذيرات كل تجميعة — نُصرّح بالمشاكل بدل إخفائها، المانع أوّلاً */
export function buildWarnings(a: BuildAnalysis): BuildWarning[] {
  const w: BuildWarning[] = [];
  for (const i of a.issues.filter((x) => x.level === 'block')) w.push({ level: 'block', text: i.message });
  if (a.missing.length > 0) w.push({ level: 'warn', text: `ناقصة: ${a.missing.map(partLabel).join('، ')}` });
  for (const u of a.unavailable) {
    w.push({ level: 'warn', text: `${partLabel(u.key)} نافد الآن: ${u.name} — غير محسوب في المجموع` });
  }
  for (const i of a.issues.filter((x) => x.level === 'warn')) w.push({ level: 'warn', text: i.message });
  if (a.bottleneckDelta != null && a.bottleneckDelta <= -2) {
    w.push({ level: 'warn', text: 'المعالج أضعف بكثير من الكرت — اختناق متوقّع' });
  } else if (a.bottleneckDelta != null && a.bottleneckDelta >= 2) {
    w.push({ level: 'warn', text: 'الكرت أضعف بكثير من المعالج — الكرت يحدّ الأداء' });
  }
  return w;
}

/** رابط فتح التجميعة في الباني للتعديل — مصدرٌ واحد لصفحتي «تجميعاتي» والمقارنة */
export function buildEditUrl(build: { id: string; name?: string | null; parts?: Record<string, { id?: string } | null | undefined> | null }): string {
  if (!build?.parts) return '/builder';
  const params = new URLSearchParams();
  params.set('editId', build.id);
  if (build.name) params.set('editName', build.name);
  for (const [cat, comp] of Object.entries(build.parts)) if (comp?.id) params.set(cat.toLowerCase(), comp.id);
  return `/builder?${params.toString()}`;
}
