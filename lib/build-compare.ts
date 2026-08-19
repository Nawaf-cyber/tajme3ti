/**
 * ============ تحليل ومقارنة التجميعات الكاملة ============
 *
 * منطق نقي بلا prisma ولا React — يُختبر بمعزل، ويستخدمه:
 *   - صفحة مقارنة التجميعات
 *   - (لاحقاً) أي مكان يحتاج تلخيص تجميعة
 *
 * الفكرة: مقارنة القطع تجيب "أي كرت أفضل؟"، ومقارنة التجميعات تجيب
 * السؤال الحقيقي: "أي جهاز أشتري؟" — وهو ما يهمّ المشتري فعلاً.
 */

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
} | null;

export type BuildLike = {
  id: string;
  name: string;
  parts: Partial<Record<BuildPartKey, BuildPart>>;
  totalPrice?: number;
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

export type BuildAnalysis = {
  totalPrice: number;
  /** استهلاك القطع مجتمعة (بلا هامش) */
  totalTdp: number;
  /** سعة المزوّد المختار — لمقارنتها بالاستهلاك */
  psuWattage: number;
  /** هامش الطاقة كنسبة من سعة المزوّد (سالب = المزوّد أصغر من اللازم) */
  powerHeadroomPct: number | null;
  cpuTier: number | null;
  gpuTier: number | null;
  /** متوسط مستوى القطعتين الحاسمتين — مؤشّر أداء التجميعة */
  perfScore: number | null;
  ramGb: number;
  storageGb: number;
  /** عدد القطع المُختارة من أصل ٧ */
  filledCount: number;
  missing: BuildPartKey[];
  /** فارق مستوى المعالج عن الكرت: سالب = المعالج أضعف (اختناق) */
  bottleneckDelta: number | null;
};

export function analyzeBuild(b: BuildLike): BuildAnalysis {
  const parts = b.parts || {};
  const get = (k: BuildPartKey) => parts[k] || null;

  let totalPrice = 0;
  let totalTdp = 0;
  let filledCount = 0;
  const missing: BuildPartKey[] = [];

  for (const k of BUILD_PART_ORDER) {
    const p = get(k);
    if (p) {
      filledCount++;
      totalPrice += p.price || 0;
      totalTdp += p.tdpWattage || 0;
    } else {
      missing.push(k);
    }
  }

  const psu = get('PSU');
  const psuWattage = psu ? specNum(parseSpecs(psu.specs).wattage) : 0;
  const powerHeadroomPct =
    psuWattage > 0 ? Math.round(((psuWattage - totalTdp) / psuWattage) * 100) : null;

  const cpu = get('CPU');
  const gpu = get('GPU');
  const cpuTier = cpu?.performanceTier ?? null;
  const gpuTier = gpu?.performanceTier ?? null;
  const perfScore =
    cpuTier != null && gpuTier != null ? (cpuTier + gpuTier) / 2 : (gpuTier ?? cpuTier);

  const ram = get('RAM');
  const ramSp = parseSpecs(ram?.specs);
  const ramGb = specNum(ramSp.capacity ?? ramSp.Capacity);

  const st = get('Storage');
  const stSp = parseSpecs(st?.specs);
  const storageGb = specNum(stSp.capacity ?? stSp.Capacity);

  return {
    totalPrice: Math.round((b.totalPrice ?? totalPrice) * 100) / 100,
    totalTdp,
    psuWattage,
    powerHeadroomPct,
    cpuTier,
    gpuTier,
    perfScore,
    ramGb,
    storageGb,
    filledCount,
    missing,
    bottleneckDelta: cpuTier != null && gpuTier != null ? cpuTier - gpuTier : null,
  };
}

/** الأداء مقابل الريال — مؤشّر نسبي للمقارنة (الأعلى أفضل) */
export const buildValueScore = (a: BuildAnalysis): number | null =>
  a.perfScore != null && a.totalPrice > 0 ? Math.pow(a.perfScore, 2) / a.totalPrice : null;

export type BuildVerdict = { icon: string; forWhat: string; buildIdx: number; why: string };

/**
 * توصيات حاسمة عبر التجميعات — نفس فلسفة مقارنة القطع:
 * سطر واحد لكل حاجة بدل أن يقارن المستخدم ٧ قطع × ٣ تجميعات يدوياً.
 */
export function buildVerdicts(names: string[], list: BuildAnalysis[]): BuildVerdict[] {
  if (list.length < 2) return [];
  const out: BuildVerdict[] = [];

  const idxOfMax = (vals: (number | null)[]) => {
    const valid = vals.filter((v): v is number => v != null);
    if (valid.length < 2) return -1;
    const best = Math.max(...valid);
    // نتجاهل التعادل التام — لا معنى لتوصية حين تتساوى الكل
    if (vals.filter((v) => v === best).length === valid.length) return -1;
    return vals.indexOf(best);
  };
  const idxOfMin = (vals: (number | null)[]) => {
    const valid = vals.filter((v): v is number => v != null);
    if (valid.length < 2) return -1;
    const best = Math.min(...valid);
    if (vals.filter((v) => v === best).length === valid.length) return -1;
    return vals.indexOf(best);
  };

  const perfIdx = idxOfMax(list.map((a) => a.perfScore));
  const valueIdx = idxOfMax(list.map(buildValueScore));
  const cheapIdx = idxOfMin(list.map((a) => (a.totalPrice > 0 ? a.totalPrice : null)));
  const powerIdx = idxOfMin(list.map((a) => (a.totalTdp > 0 ? a.totalTdp : null)));

  if (perfIdx >= 0) {
    const cheapest = Math.min(...list.map((a) => a.totalPrice).filter((p) => p > 0));
    const extra = list[perfIdx].totalPrice - cheapest;
    out.push({
      icon: '🚀', forWhat: 'للأداء الأعلى', buildIdx: perfIdx,
      why: extra > 0
        ? `أقوى تجميعة (أغلى بـ ${Math.round(extra).toLocaleString('en-US')} ﷼)`
        : 'أقوى تجميعة وأوفرها معاً',
    });
  }
  if (valueIdx >= 0 && valueIdx !== perfIdx) {
    out.push({
      icon: '⚖️', forWhat: 'لأفضل قيمة', buildIdx: valueIdx,
      why: 'أعلى أداء مقابل كل ريال',
    });
  }
  if (cheapIdx >= 0 && cheapIdx !== valueIdx && cheapIdx !== perfIdx) {
    out.push({
      icon: '💰', forWhat: 'لأقل ميزانية', buildIdx: cheapIdx,
      why: `الأوفر (${Math.round(list[cheapIdx].totalPrice).toLocaleString('en-US')} ﷼)`,
    });
  }
  if (powerIdx >= 0 && powerIdx !== perfIdx && powerIdx !== valueIdx) {
    const others = list.filter((_, i) => i !== powerIdx).map((a) => a.totalTdp).filter((t) => t > 0);
    if (others.length) {
      out.push({
        icon: '🔋', forWhat: 'لأقل استهلاك', buildIdx: powerIdx,
        why: `أقل بـ ${Math.min(...others) - list[powerIdx].totalTdp} واط`,
      });
    }
  }
  return out;
}

/** تحذيرات لكل تجميعة — نُصرّح بالمشاكل بدل إخفائها */
export function buildWarnings(a: BuildAnalysis): string[] {
  const w: string[] = [];
  if (a.missing.length > 0) w.push(`ناقصة ${a.missing.length} قطعة: ${a.missing.join(' · ')}`);
  if (a.powerHeadroomPct != null && a.powerHeadroomPct < 0) {
    w.push('المزوّد أصغر من استهلاك القطع — لا تعمل بأمان');
  } else if (a.powerHeadroomPct != null && a.powerHeadroomPct < 20) {
    w.push(`هامش الطاقة ضيّق (${a.powerHeadroomPct}%) — يُنصح بـ20% على الأقل`);
  }
  if (a.bottleneckDelta != null && a.bottleneckDelta <= -2) {
    w.push('المعالج أضعف بكثير من الكرت — اختناق متوقّع');
  } else if (a.bottleneckDelta != null && a.bottleneckDelta >= 2) {
    w.push('الكرت أضعف بكثير من المعالج — الكرت يحدّ الأداء');
  }
  return w;
}
