/**
 * ============ «ما تدري وش تبي؟» — ثلاث تجميعات من الكتالوج الحقيقي ============
 *
 * نُقل من components/PCBuilderClient.tsx (2026-10-14) إلى هنا كي يُختبر
 * مباشرةً — كان مدفوناً في مكوّن من ٢٤٠٠ سطر فلا يُشغَّل إلّا بالنقر.
 * والمكوّن يستدعيه بسطرٍ واحد: buildIntentPlans(categories, intent).
 *
 * ============ إصلاحات 2026-10-14 (مراجعة نوّاف) ============
 * شُغّل على الكتالوج كلّه (١٤ تركيبة: ٦ استخدامات × الدقّات + تفضيلا شركة = ٣٦ خطّة)
 * ومعه فحص التجميعة (lib/build-check) على كلّ خطّة، فظهر:
 *   ١) ٣٣ من ٣٦ بلا مبرّد — المعالج لا يأتي به والخطّة لا تضيفه، فالتجميعة ناقصة
 *      وسعرها أقلّ من الحقيقة. ← مبرّدٌ بقدر سحب المعالج (coolerMeets) يدخل الكيس.
 *   ٢) التخزين بالسرعة والسعة في شريحة سعرية: «قوي» = Samsung 9100 PRO 8TB بـ٩٣٠٩﷼
 *      فصارت الخطّة ١٧–٢١ ألفاً، و٢٢ خطّة بقرص 4TB فأكثر (١٣ منها FireCuda 4TB بسعر نسخة 1TB — رابطٌ خاطئ صُحّح). ← سعةٌ مستهدفة (1TB/2TB).
 *   ٣) البثّ = i9-14900KF دائماً حتى مع Arc A750 في «اقتصادي». ← المعالج لا يعلو
 *      الكرت بأكثر من مستوى (إلّا المونتاج)، وأرضية البثّ ٣.
 *   ٤) «مكتبي» بكرتٍ منفصل وقرص 4TB (٥٤٨٥﷼). ← معالجٌ برسوميّات مدمجة بلا كرت.
 *   ٥) ١٢ خطّة برامٍ أسرع من لوحتها (8000 على لوحات 7200)، وAM5 حيث 6000 هي الأنسب.
 *      ← سقف سرعةٍ من المنصّة واللوحة.
 *   ٦) الكيس أرخصُ متّسعٍ في كلّ المستويات (١٩٨﷼ تحت تجميعة ٢٠ ألفاً).
 *      ← مستوى الكيس يتبع مستوى الخطّة وسحبها، ويُختار مع المبرّد زوجاً.
 *   ٧) الكرت «أكبر ذاكرة ضمن السقف» فاختير RX 7900 XT القديم (٢٠GB، ٤٦٧٩﷼).
 *      ← بالإطارات المقيسة (lib/gpu-perf): متوازن أكثرُ إطاراتٍ لكلّ ريال،
 *        وقوي الأسرع — والجيل الأحدث لما ليس في الجدول.
 *   ٨) تفضيل شركة الكرت يقارن حقل brand، وفيه الشريك (ASUS، Sapphire…) لا صانع
 *      الشريحة — فأسقط ١٤ كرتاً. ← الصانع من الاسم (gpuVendor).
 * وبعدها على التركيبات نفسها: صفر بلا مبرّد، وصفر رام أسرع من اللوحة، وصفر قرص 4TB،
 * وصفر مانع، وأغلى خطّة ١٣٬٦ ألفاً (كانت ٢١).
 *   ٩) `vramHeavy` معرّفٌ للألعاب الثقيلة والمونتاج ولا يقرؤه شيء — فالمونتاج يأخذ
 *      Arc A750 بـ8GB. ← حاجة ذاكرة الكرت: ١٢ للاقتصادي و١٦ لما فوقه (gpuVramNeed).
 *  ١٠) البطاقة لا تجيب «يكفيني؟» ← الإطارات المقيسة للكرت بدقّة المستخدم (perf).
 *
 * والفحص الدوريّ على الكتالوج الحيّ: npx tsx scripts/intent-plans-audit.ts
 */
import { isAvailable } from './stores';
import { boardFitsCase, psuFitsCase, gpuFitsCase, shownGpuLengthMm, coolerFitsCase, coolerFitsCpu, cpuPowerFitsBoard } from './fit';
import { bundledCooler } from './build-check';
import { gpuPerf, feel, type FeelLevel } from './gpu-perf';
import { cpuPerf } from './cpu-perf';
import { cpuTierFromMulti } from './perf-tier';

export type TierPlan = {
  key: 'value' | 'balanced' | 'strong';
  label: string;
  note: string;
  total: number;
  picks: Record<string, any>;
  /* إطارات الكرت المقيسة بدقّة المستخدم (lib/gpu-perf) — للألعاب فقط، وnull لكرتٍ
     ليس في جدول المصدر. note: تنبيهٌ يُعرض معها (الشوتر أخفّ من ألعاب القياس). */
  perf?: { fps: number; res: string; feel: FeelLevel; note?: string } | null;
  /* حاجة ذاكرة الكرت التي بُنيت عليها الخطّة — يقرؤها الفحص الدوريّ */
  vramNeed?: number;
};

export type Intent = {
  use: string;
  resolution: string | null;
  alsoStreams: boolean | null;
  gpuBrand: string | null;
  cpuBrand: string | null;
};

type Category = { name: string; components: any[] };

/* ============ ملفّات الاستخدام ============
   المستوى (اقتصادي/متوازن/قوي) = **مستوى أداء مستهدف**، لا شريحة سعرية.
   كان التصميم الأقدم يقصّ الكتالوج بشرائح مئوية من السعر، فأنتج تناقضات:
   "قوي" أغلى بآلاف بلا ترقية، و1440p يعطي كرتاً أضعف من 1080p.
   الآن كل مستوى يستهدف performanceTier محدّداً، والدقة ترفع المستوى
   المستهدف واحتياج الذاكرة — فالسلّم مضمون بالبناء لا بالحظّ.

   gpuStep: إزاحة مستوى الكرت لهذا الاستخدام (سالب = يكفيه أقل).
   cpuBias: إزاحة مستوى المعالج نسبةً لمستوى الكرت (+ = المعالج أهم).
   vramHeavy: ذاكرة الكرت حاسمة (ألعاب ثقيلة، مونتاج) — ترفع حاجتها (gpuVramNeed).
   noGpu:   بلا كرتٍ منفصل — المعالج برسوميّاته المدمجة (مكتبي). */
type Profile = {
  label: string;
  gpuStep: number;
  cpuBias: number;
  ramMinGB: number;
  ramCapGB: number;
  prefNvme: boolean;
  vramHeavy: boolean;
  gpuCap: number;
  cpuCap: number;
  cpuFloor: number;
  cpuPref: 'x3d' | 'cores' | 'balanced';
  noGpu?: boolean;
  reason: string;
};

export const USE_PROFILE: Record<string, Profile> = {
  'competitive-shooter': { label: 'شوتر تنافسي', gpuStep: 0, cpuBias: 1, ramMinGB: 16, ramCapGB: 32, prefNvme: true, vramHeavy: false, gpuCap: 4, cpuCap: 5, cpuFloor: 3, cpuPref: 'x3d', reason: 'مناسبة لألعاب الشوتر التنافسي بأعلى فريمات ممكنة' },
  'aaa-gaming': { label: 'ألعاب ثقيلة', gpuStep: 0, cpuBias: -1, ramMinGB: 16, ramCapGB: 32, prefNvme: true, vramHeavy: true, gpuCap: 5, cpuCap: 4, cpuFloor: 3, cpuPref: 'balanced', reason: 'مناسبة للألعاب الثقيلة بإعدادات عالية' },
  'casual-gaming': { label: 'ألعاب خفيفة', gpuStep: -1, cpuBias: 0, ramMinGB: 16, ramCapGB: 16, prefNvme: false, vramHeavy: false, gpuCap: 2, cpuCap: 3, cpuFloor: 1, cpuPref: 'balanced', reason: 'مناسبة للألعاب الخفيفة والاستخدام اليومي' },
  'editing': { label: 'مونتاج وتصميم', gpuStep: 0, cpuBias: 1, ramMinGB: 32, ramCapGB: 999, prefNvme: true, vramHeavy: true, gpuCap: 5, cpuCap: 5, cpuFloor: 4, cpuPref: 'cores', reason: 'مناسبة لتحرير الفيديو والتصميم بذاكرة كبيرة وتخزين سريع' },
  /* أرضية البثّ ٣ لا ٤ (2026-10-14): كانت تفرض i9-14900KF حتى في «اقتصادي»،
     والبثّ اليوم يُرمَّز في الكرت (NVENC/AV1) أكثر منه في المعالج. */
  'streaming': { label: 'بث مباشر', gpuStep: 0, cpuBias: 1, ramMinGB: 32, ramCapGB: 32, prefNvme: true, vramHeavy: false, gpuCap: 4, cpuCap: 5, cpuFloor: 3, cpuPref: 'cores', reason: 'مناسبة للبث المباشر مع اللعب بسلاسة' },
  /* مكتبي بلا كرت (2026-10-14): كان يضع Arc B580 وقرص 4TB في «متوازن» بـ٥٤٨٥﷼ */
  'office': { label: 'مكتبي ودراسة', gpuStep: -1, cpuBias: 0, ramMinGB: 16, ramCapGB: 16, prefNvme: true, vramHeavy: false, gpuCap: 2, cpuCap: 3, cpuFloor: 1, cpuPref: 'balanced', noGpu: true, reason: 'مناسبة للأعمال المكتبية والدراسة والتصفّح، برسوميّات المعالج المدمجة' },
  'mixed': { label: 'استخدام متنوّع', gpuStep: 0, cpuBias: 0, ramMinGB: 16, ramCapGB: 64, prefNvme: true, vramHeavy: false, gpuCap: 5, cpuCap: 5, cpuFloor: 3, cpuPref: 'balanced', reason: 'مناسبة للاستخدام المتنوّع بين الألعاب والمهام' },
};

/* ---- قراءة آمنة للمواصفات (المفاتيح غير موحّدة في الكتالوج) ---- */
const parseSpecs = (s: any) => (!s ? {} : typeof s === 'string' ? JSON.parse(s) : s);
const specVal = (sp: any, keys: string[]) => { for (const k of keys) if (sp?.[k] != null) return sp[k]; return null; };
const specNum = (v: any) => { if (v == null) return 0; const m = String(v).match(/[\d.]+/); return m ? parseFloat(m[0]) : 0; };

/* ذاكرة الكرت: بعض القطع سعتها مفقودة في القاعدة (RX 6600 XT / 6700 XT)
   فنقرؤها من الاسم بدل أن تُحسب صفراً فتُظلم القطعة في الترشيح. */
const vramOf = (c: any): number => {
  const direct = specNum(specVal(parseSpecs(c.specs), ['vram', 'VRAM']));
  if (direct > 0) return direct;
  const m = String(c.name || '').match(/(\d+)\s*GB/i);
  return m ? parseFloat(m[1]) : 0;
};

/* سعة التخزين بالجيجابايت — «1TB» و«512GB» و«2 TB» */
const capacityGB = (c: any): number => {
  const raw = String(specVal(parseSpecs(c.specs), ['capacity', 'Capacity']) || '');
  const n = specNum(raw);
  return /TB/i.test(raw) ? n * 1000 : n;
};

/* حداثة جيل الكرت داخل المستوى نفسه (إصلاح ٧): بين كرتين في المستوى ذاته
   الأحدثُ أكفأ وأطول دعماً — وكان «أكبر ذاكرة» يختار RDNA 3 القديم الأغلى. */
const GPU_GEN: Record<string, number> = {
  'Blackwell': 5, 'RDNA 4': 5, 'Battlemage': 4, 'Ada Lovelace': 4, 'RDNA 3': 4,
  'Alchemist': 3, 'Ampere': 3, 'RDNA 2': 3, 'Turing': 2,
};
const gpuGen = (c: any) => GPU_GEN[String(parseSpecs(c.specs).architecture || '')] ?? 3;

/* صانع شريحة الكرت من اسمه لا من حقل brand: الحقل يحمل الشريك (ASUS، MSI،
   Gigabyte، PNY، Sapphire) في ١٤ من ٥٩ كرتاً — فكان تفضيل «AMD» يُسقط
   PULSE RX 9070 XT، وتفضيل «NVIDIA» يُسقط كلّ 5080 و5090 من ASUS. */
const gpuVendor = (c: any): string => {
  const n = String(c.name || '');
  if (/radeon|\bRX\s?\d/i.test(n)) return 'amd';
  if (/geforce|\b[RG]TX\b/i.test(n)) return 'nvidia';
  if (/\barc\b/i.test(n)) return 'intel';
  return String(c.brand || '').toLowerCase();
};

/* ============ المبرّد (إصلاح ١) ============
   ٣٨ من ٦١ معالجاً في الكتالوج بلا مبرّد في العلبة (includedCooler: None)،
   والخطّة كانت تتركه — تجميعةٌ لا تعمل، وسعرٌ أقلّ من الحقيقة.
   الحاجة من سحب المعالج (tdpWattage):
     ≤ ١٠٥ واط: أيّ مبرّد، ومبرّد العلبة يكفي إن وُجد.
     ١٠٦–١٧٠:   برجٌ هوائيّ من المستوى ٢ فما فوق، أو مائيّ ٢٤٠+.
     ١٧١–٢٠٠:   مائيّ ٢٤٠+ أو برجٌ مزدوج (مستوى ٤+).
     > ٢٠٠:      مائيّ ٣٦٠ (i9-14900K وCore Ultra 7 270K يسحبان ~٢٥٠).
   ويُختار الأرخص الذي يلبّي الحاجة ويدعم المقبس ويدخل الكيس. */
const coolerMeets = (k: any, cpuDraw: number): boolean => {
  const sp = parseSpecs(k.specs);
  const aio = String(sp.type || '').toUpperCase() === 'AIO';
  const size = specNum(sp.sizeMm);
  const tier = k.performanceTier ?? 1;
  if (cpuDraw > 200) return aio && size >= 360;
  if (cpuDraw > 170) return aio ? size >= 240 : tier >= 4;
  if (cpuDraw > 105) return aio ? size >= 240 : tier >= 2;
  return true;
};

/* ============ حاجة ذاكرة الكرت (إصلاح ٩) ============
   الدقّة: 8GB لـ1080p، و١٢ لـ1440p، و١٦ لـ4K. والاستخدام الذي ذاكرتُه حاسمة
   (vramHeavy: ألعاب ثقيلة، مونتاج) يرفعها: ١٢ للاقتصادي و١٦ لما فوقه — الخطّ
   الزمنيّ للمونتاج وأنسجة الألعاب الحديثة تملأ 8GB، فيتباطأ الكرت ولو كان سريعاً.
   مُصدَّرة كي يقرأ الفحص الدوريّ (scripts/intent-plans-audit.ts) القاعدة نفسها. */
export function gpuVramNeed(intent: Intent, level: TierPlan['key']): number {
  const res = intent.resolution || '1080p';
  const base = res === '4K' ? 16 : res === '1440p' ? 12 : 8;
  const profile = USE_PROFILE[intent.use] || USE_PROFILE['mixed'];
  return profile.vramHeavy ? Math.max(base, level === 'value' ? 12 : 16) : base;
}

export function buildIntentPlans(categories: Category[], intent: Intent): TierPlan[] | null {
  const profile = USE_PROFILE[intent.use] || USE_PROFILE['mixed'];
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  const pool = (name: string) => [...(categories.find((c) => c.name === name)?.components || [])]
    .filter(isAvailable)
    .sort((a, b) => a.price - b.price);

  const res = intent.resolution || '1080p';
  /* الدقة ترفع المستوى المستهدف واحتياج الذاكرة. و4K يرفع سقف الكرت درجة:
     حتى الشوتر يحتاج كرتاً أقوى على 4K، وكان السقف الثابت يمنع ذلك. */
  const resBump = res === '4K' ? 2 : res === '1440p' ? 1 : 0;
  const gpuCapEff = res === '4K' ? Math.min(5, profile.gpuCap + 1) : profile.gpuCap;

  /* السقوف تُطبّق أولاً: "ألعاب خفيفة" لا تتجاوز كرت مستوى 2 مهما كان المستوى.
     المستوى المجهول (null) يُستبعد — لا يخترق السقف بصمت. */
  const gpusAll = profile.noGpu ? [] : pool('GPU').filter((c) => c.performanceTier != null && c.performanceTier <= gpuCapEff);
  /* ============ المونتاج: المعالج بتعدّد الأنوية لا بالألعاب ============
     ⚠️ performanceTier في القاعدة مستوى **الألعاب** المقيس (lib/perf-tier — 2026-10-21)،
     وبه وحده صار مستوى ٥ معالجاتِ X3D الثمانية الأنوية؛ فاختار المونتاج 7800X3D بدل
     i9-14900KF ذي الأربعة والعشرين نواة. فلهذا الاستخدام وحده يُقرأ مستوى «العمل» من
     تعدّد الأنوية المقيس، على نسخٍ من القطع — والمختار يُعاد إلى أصله قبل الخطّة، كي لا
     يحمل الباني مستوىً غير مستوى القاعدة. ما لا قياس له يبقى بمستواه. */
  const workCpu = intent.use === 'editing';
  const cpuOriginal = new Map<string, any>();
  const forUse = (c: any) => {
    if (!workCpu) return c;
    const m = cpuPerf(String(c.name || ''))?.multi;
    if (m == null) return c;
    cpuOriginal.set(c.id, c);
    return { ...c, performanceTier: cpuTierFromMulti(m) };
  };

  /* مكتبي: المعالج وحده يرسم الشاشة — فلا يُقبل معالجٌ بلا رسوميّات مدمجة */
  const cpuBase = pool('CPU').map(forUse).filter((c) => !profile.noGpu || !/^\s*(none)?\s*$/i.test(String(parseSpecs(c.specs).integratedGraphics || '')));
  const cpuInRange = cpuBase.filter((c) => c.performanceTier != null && c.performanceTier >= profile.cpuFloor && c.performanceTier <= profile.cpuCap);
  let cpusAll = cpuInRange.length ? cpuInRange : cpuBase.filter((c) => c.performanceTier != null && c.performanceTier <= profile.cpuCap);

  /* ---- تفضيل الشركة (اختياري) ----
     نُطبّقه كتصفية، وإن أفرغ المجموعة نتجاهله بدل أن نفشل:
     تفضيل المستخدم لا يجوز أن يمنع ظهور أي تجميعة. */
  const byBrand = (arr: any[], brand: string | null | undefined, vendorOf: (c: any) => string) => {
    if (!brand) return arr;
    const f = arr.filter((c) => vendorOf(c) === brand.toLowerCase());
    return f.length ? f : arr;
  };
  const gpusPool = byBrand(gpusAll, intent.gpuBrand, gpuVendor);
  cpusAll = byBrand(cpusAll, intent.cpuBrand, (c) => String(c.brand || '').toLowerCase());

  /* الشوتر: ذاكرة 3D V-Cache هي محرّك الفريمات — إن توفّر X3D نقصر عليه.
     ⚠️ يأتي **بعد** تصفية الشركة عن قصد: X3D حصري لـAMD، فلو سبق التفضيل
     لأُلغي اختيار المستخدم لـIntel صامتاً. تفضيله الصريح يفوز على
     اجتهادنا، ونعطيه أفضل معالج ألعاب داخل شركته. */
  if (profile.cpuPref === 'x3d') {
    const x3ds = cpusAll.filter((c) => /x3d/i.test(String(c.name || '')));
    if (x3ds.length) cpusAll = x3ds;
  }

  const mobos = pool('Motherboard');
  const ramCapped = pool('RAM').filter((c) => {
    const gb = specNum(specVal(parseSpecs(c.specs), ['capacity', 'Capacity']));
    return gb > 0 && gb <= profile.ramCapGB;
  });
  const rams = ramCapped.length ? ramCapped : pool('RAM');
  const psus = pool('PSU');
  const cases = pool('Case');
  const coolers = pool('Cooler');
  // قرص النظام لا يكون HDD — يطابق دليل SSD مقابل HDD
  const storages = pool('Storage').filter((st) => {
    const t = String(parseSpecs(st.specs).type || '').toUpperCase();
    return t.includes('NVME') || t.includes('SSD');
  });

  if ((!profile.noGpu && !gpusAll.length) || !cpusAll.length || !mobos.length || !rams.length || !psus.length || !cases.length || !storages.length) {
    return null;
  }

  const gTiers = [...new Set(gpusPool.map((c) => c.performanceTier as number))].sort((a, b) => a - b);
  const cTiers = [...new Set(cpusAll.map((c) => c.performanceTier as number))].sort((a, b) => a - b);
  const gLo = gTiers[0], gHi = gTiers[gTiers.length - 1];
  const cLo = cTiers[0], cHi = cTiers[cTiers.length - 1];

  /* مجموعة المستوى المستهدف؛ إن كان فارغاً نوسّع للأقرب صعوداً ثم هبوطاً */
  const poolAtTier = (arr: any[], target: number, lo: number, hi: number) => {
    for (let d = 0; d <= 5; d++) {
      for (const t of (d === 0 ? [target] : [target + d, target - d])) {
        if (t < lo || t > hi) continue;
        const p = arr.filter((c) => c.performanceTier === t);
        if (p.length) return p;
      }
    }
    return arr;
  };

  const priceRank = (arr: any[], c: any) => {
    const s = [...arr].sort((a, b) => a.price - b.price);
    const i = s.findIndex((x) => x.id === c.id);
    return s.length > 1 ? i / (s.length - 1) : 0.5;
  };

  /* إطارات الكرت المقيسة بدقّة المستخدم (lib/gpu-perf · Tom's Hardware) —
     null لما ليس في الجدول (Arc A، 7900 GRE). المستوى خمس درجات فقط، فـRX 9070
     وRX 9070 XT كلاهما ٤ وبذاكرة ١٦ — والفرق بينهما ١٢٪ لا يراه إلّا هذا الرقم. */
  const resKey = res === '4K' ? 'f4k' : res === '1440p' ? 'f1440' : 'f1080';
  const fpsOf = (c: any): number | null => gpuPerf(String(c?.name || ''), vramOf(c))?.[resKey] ?? null;

  /* القوّة = المستوى ثم الإطارات المقيسة (أو الذاكرة لما لا قياس له). السعر
     وكيل رديء للأداء في كتالوج أسعاره مضطربة (كرت قديم قد يكون أغلى من أحدث منه). */
  const gStrength = (c: any) => (c ? (c.performanceTier ?? 0) * 1000 + (fpsOf(c) ?? vramOf(c)) : 0);
  const cStrength = (c: any) => (c.performanceTier ?? 0) * 100000 + c.price;

  const LEVELS: { key: TierPlan['key']; label: string; base: number }[] = [
    { key: 'value', label: 'اقتصادي', base: 2 },
    { key: 'balanced', label: 'متوازن', base: 3 },
    { key: 'strong', label: 'قوي', base: 4 },
  ];

  const plans: TierPlan[] = [];
  let lastGpuTier = -Infinity, lastGpuStrength = -Infinity, lastCpuTier = -Infinity;
  /** إطارات كرت المستوى السابق — «قوي» يُقاس عليها (انظر اختيار الكرت) */
  let lastGpuFps: number | null = null;

  for (const L of LEVELS) {
    const picks: Record<string, any> = {};

    /* ---- الكرت ---- */
    if (!profile.noGpu) {
      let tGpu = clamp(L.base + resBump + profile.gpuStep, gLo, gHi);
      if (tGpu < lastGpuTier) tGpu = lastGpuTier; // سلّم لا يهبط
      const gPool = poolAtTier(gpusPool, tGpu, gLo, gHi);

      /* داخل المستوى: نرشّح ما يلبّي احتياج الذاكرة، ثم نتدرّج بالطموح.
         السقف نسبة من أرخص كافٍ في نفس المستوى — يمنع الوصول إلى أغلى
         كرت في الفئة (5090) بلا داعٍ. */
      const vramNeed = gpuVramNeed(intent, L.key);
      const adequate = gPool.filter((c) => vramOf(c) >= vramNeed);
      /* ولا كافٍ في المستوى؟ فالأقرب إلى الحاجة (أكبر ذاكرةٍ فيه) لا أيُّ كرت —
         كان الرجوع إلى المستوى كلّه يُعيد كرت 8GB لمن يحتاج ١٦ */
      const maxV = Math.max(...gPool.map(vramOf));
      let gSrc = [...(adequate.length ? adequate : gPool.filter((c) => vramOf(c) === maxV))].sort((a, b) => a.price - b.price);
      const notWeaker = gSrc.filter((c) => gStrength(c) >= lastGpuStrength);
      if (notWeaker.length) gSrc = notWeaker;
      /* ============ Arc والشوتر التنافسي ============
       * كروت Intel Arc أرخص ما في المستويات الدنيا، والاختيار هناك أرخصُ
       * كافٍ — فكانت تتصدّر توصياتنا لكل استخدام. وهي في الشوتر التنافسي
       * تحديداً أضعفُ من سعرها: أداؤها في محرّكات DX9/DX11 القديمة التي
       * تبني عليها ألعاب الإسبورت يعتمد على طبقة ترجمة، والفريمات الدنيا
       * فيها غير مستقرّة — وهو بالضبط ما يشتريه لاعب الشوتر.
       * ⚠️ وموضعُها قبل سقف السعر لا بعده: السقف نسبةٌ من **أرخص كافٍ**،
       * فلو صُفّيت بعده لكان المرجعُ كرتَ Arc نفسه ولم يبقَ في المدى غيرُه.
       * وتُؤخَّر ولا تُحذف: إن لم يبقَ غيرها في المستوى تُختار، وإن اختار
       * المستخدم Intel صراحةً فاختيارُه أولى من تقديرنا. */
      if (intent.use === 'competitive-shooter' && intent.gpuBrand !== 'Intel') {
        const nonArc = gSrc.filter((c) => gpuVendor(c) !== 'intel');
        if (nonArc.length) gSrc = nonArc;
      }

      const capMult = L.key === 'value' ? 1.0 : L.key === 'balanced' ? 1.45 : 2.0;
      const inBudget = gSrc.filter((c) => c.price <= gSrc[0].price * capMult);
      const gList = inBudget.length ? inBudget : gSrc;
      /* اقتصادي: أرخص كافٍ. وما فوقه (إصلاح ٧) بالإطارات المقيسة لا «أكبر ذاكرة»
         التي جلبت RX 7900 XT بـ٤٦٧٩﷼ و9070 XT أسرع منه بـ٣١٥٠:
           متوازن: أكثر إطاراتٍ لكلّ ريال ضمن السقف.
           قوي: الأسرع ضمن السقف — إلّا أن يقاربه أرخصُ منه (٣٪): 5070 Ti يسبق
                9070 XT بثلث إطار ويزيد ٢٥٠٠﷼، فذاك ليس ترقيةً بل ثمناً.
         وما لا قياس له يُرتّب بالجيل الأحدث ثمّ الأرخص. */
      const measured = gList.filter((c) => fpsOf(c) != null);
      if (L.key === 'value') {
        picks['GPU'] = gList[0];
      } else if (measured.length) {
        if (L.key === 'balanced') {
          picks['GPU'] = [...measured].sort((a, b) => (fpsOf(b)! / b.price - fpsOf(a)! / a.price) || (a.price - b.price))[0];
        } else {
          /* قوي: أفضل قيمةٍ بين الكروت التي هي **خطوةٌ حقيقيّة** فوق «متوازن» — لا الأسرع.
             ⚠️ «الأسرع ضمن السقف» يشدّ دائماً إلى أغلى ما يسمح به السقف: اختار RTX 4090 بـ١٤٬٣٠٢
             لـ1440p (2026-10-22) — ١٥ إطاراً فوق 5080 بـ٧٬٠٠٣ ريال، أي ٤٦٤ ريالاً للإطار الزائد
             و5080 نفسه بـ٥٧. وسقفٌ بالريال يتقادم مع الأسعار. فالقاعدة بلا ريال: «خطوة» = ٨٪
             إطاراتٍ فوق «متوازن» (حدّ مرشّح السلّم نفسه أدناه)، ومنها الأقلّ ريالاً للإطار. فإن
             رخص 4090 يوماً إلى قرب 5080 اختير وحده. وإن لم يبلغ الخطوةَ كرتٌ، فالسلوك السابق. */
          const step = lastGpuFps != null ? measured.filter((c) => fpsOf(c)! >= lastGpuFps! * 1.08) : [];
          if (step.length) {
            picks['GPU'] = [...step].sort((a, b) => (a.price / fpsOf(a)! - b.price / fpsOf(b)!) || (a.price - b.price))[0];
          } else {
            const top = Math.max(...measured.map((c) => fpsOf(c)!));
            picks['GPU'] = measured.filter((c) => fpsOf(c)! >= top * 0.97).sort((a, b) => a.price - b.price)[0];
          }
        }
      } else {
        picks['GPU'] = [...gList].sort((a, b) => (gpuGen(b) - gpuGen(a)) || (a.price - b.price))[0];
      }
    }

    /* ---- المعالج: يتبع مستوى الكرت لتفادي الاختناق ----
       4K ينقل الثقل للكرت فيكفي معالج أقل؛ 1080p يحتاج معالجاً أقوى. */
    const resCpuBias = res === '4K' ? -1 : res === '1440p' ? 0 : 1;
    const streamBias = intent.alsoStreams ? 1 : 0;
    let tCpu: number;
    if (profile.noGpu) {
      tCpu = clamp(L.base - 1 + profile.cpuBias, cLo, cHi);
    } else {
      const gpuTier = (picks['GPU'].performanceTier ?? L.base) as number;
      const antiBottleneck = Math.max(cLo, gpuTier - 1); // لا نسمح باختناق فاضح
      tCpu = clamp(gpuTier + profile.cpuBias + resCpuBias + streamBias, antiBottleneck, cHi);
      /* ولا معالجٌ يعلو الكرت بأكثر من مستوى (إصلاح ٣): كان البثّ يجمع ثلاث
         إزاحات (+١ للاستخدام، +١ للبثّ، +١ لـ1080p) فيصل i9-14900KF مع Arc
         A750. والمونتاج مستثنى: المعالج فيه هو العمل نفسه. */
      if (intent.use !== 'editing') tCpu = Math.max(antiBottleneck, Math.min(tCpu, gpuTier + 1));
    }
    if (tCpu < lastCpuTier) tCpu = lastCpuTier;
    const cPool = poolAtTier(cpusAll, tCpu, cLo, cHi);

    const scoreCpu = (c: any) => {
      const sp = parseSpecs(c.specs);
      const coreScore = Math.min(1, (specNum(sp.cores) + specNum(sp.threads) / 2) / 40);
      const value = 1 - priceRank(cPool, c);
      if (profile.cpuPref === 'x3d') return (/x3d/i.test(String(c.name || '')) ? 0.5 : 0) + value * 0.4 + coreScore * 0.1;
      if (profile.cpuPref === 'cores') return coreScore * 0.6 + value * 0.4;
      return value * 0.6 + coreScore * 0.4;
    };
    picks['CPU'] = [...cPool].sort((a, b) => scoreCpu(b) - scoreCpu(a))[0];

    if (picks['GPU']) {
      lastGpuTier = picks['GPU'].performanceTier ?? lastGpuTier;
      lastGpuStrength = gStrength(picks['GPU']);
      lastGpuFps = fpsOf(picks['GPU']);
    }
    lastCpuTier = picks['CPU'].performanceTier ?? lastCpuTier;

    /* ---- اللوحة: أرخص متوافقة **تتحمّل المعالج** ----
       "الأرخص مطلقاً" كان خطأً: أرخص لوحة LGA1700 هي H610M (مستوى ١، DDR4)،
       وتركيبها مع i7-14700K بسحب 253W يعني VRM يخنق المعالج ورامات بطيئة.
       فنفرض أرضية مستوى للوحة مشتقّة من سحب المعالج ومستواه. */
    const cpuSp = parseSpecs(picks['CPU'].specs);
    const socket = String(cpuSp.socket || '');
    const cpuDraw = picks['CPU'].tdpWattage || 65;
    const cpuTier = (picks['CPU'].performanceTier ?? 3) as number;
    const moboFloor = (cpuDraw >= 200 || cpuTier >= 5) ? 4
      : (cpuDraw >= 125 || cpuTier >= 4) ? 3
      : 2; // نتفادى أدنى فئة (H610) حتى للمعالجات الهادئة
    /* وحدّ قدرة اللوحة: لوحةٌ تعلن «حتى ١٢٠ واط» لا تُقرن بمعالج ١٧٠ —
       الفحص يمنعها (lib/fit · cpuPowerFitsBoard)، فلا نقترحها أصلاً */
    const sameSocket = mobos.filter((m) => String(parseSpecs(m.specs).socket || '') === socket
      && !cpuPowerFitsBoard(cpuSp, parseSpecs(m.specs)));
    if (!sameSocket.length) continue;
    const strongEnough = sameSocket.filter((m) => (m.performanceTier ?? 0) >= moboFloor);
    // إن لم تتوفّر لوحة بالأرضية المطلوبة، نأخذ أقوى المتاح لهذا المقبس
    const moboSrc = strongEnough.length
      ? strongEnough
      : [...sameSocket].sort((a, b) => (b.performanceTier ?? 0) - (a.performanceTier ?? 0));
    picks['Motherboard'] = moboSrc[0]; // مرتّبة سعرياً تصاعدياً
    const moboSp = parseSpecs(picks['Motherboard'].specs);

    /* ---- الرام: السعة تتبع الدقة والمستوى، ثم أفضل سرعة بفارق سعر معقول ----
       16GB لا تكفي 4K ولا الألعاب الثقيلة على متوازن/قوي — المعيار 32GB. */
    const gamingUse = ['competitive-shooter', 'aaa-gaming', 'casual-gaming', 'mixed'].includes(intent.use);
    let ramNeed = profile.ramMinGB;
    if (gamingUse) {
      if (res === '4K') ramNeed = Math.max(ramNeed, 32);
      else if (res === '1440p' && L.key !== 'value') ramNeed = Math.max(ramNeed, 32);
      /* و«قوي» على 1080p كان يأخذ 16GB تحت تجميعة ٨٧٠٠﷼ — المعيار اليوم 32 */
      if (L.key === 'strong') ramNeed = Math.max(ramNeed, 32);
    }
    ramNeed = Math.min(ramNeed, profile.ramCapGB); // لا نخترق سقف الاستخدام

    const ramType = String(moboSp.ramType || '');
    const compatRams = rams.filter((r) => {
      const rt = String(parseSpecs(r.specs).type || '');
      return !ramType || rt === ramType;
    });
    /* سقف السرعة (إصلاح ٥): كان «أسرع طقم ضمن ٢٥٪» يجلب 8000 على لوحاتٍ
       سقفها 7000–7200 فتعمل الذاكرة أبطأ ونُنبّه عليها في الفحص، وعلى AM5
       حيث 6000 هي النقطة المثلى التي توصي بها AMD (فوقها قد لا يتزامن متحكّم
       الذاكرة معها فيضيع الفرق — وطقم 6000 عندنا أرخص من 6400 أصلاً). */
    const ramSpeed = (r: any) => specNum(specVal(parseSpecs(r.specs), ['speed', 'Speed']));
    let speedCap = /DDR4/i.test(ramType) ? 3600 : socket.toUpperCase() === 'AM5' ? 6000 : 7200;
    const boardMax = specNum(moboSp.memorySpeed);
    if (boardMax > 0) speedCap = Math.min(speedCap, boardMax);
    const withinCap = compatRams.filter((r) => !ramSpeed(r) || ramSpeed(r) <= speedCap);
    const rPool = withinCap.length ? withinCap : compatRams.length ? compatRams : rams;
    const meetsNeed = rPool.filter((r) => specNum(specVal(parseSpecs(r.specs), ['capacity', 'Capacity'])) >= ramNeed);
    const rSrc = [...(meetsNeed.length ? meetsNeed : rPool)].sort((a, b) => a.price - b.price);
    const ramBudget = rSrc[0].price * 1.25;
    const ramCands = rSrc.filter((r) => r.price <= ramBudget);
    // أعلى سرعة داخل الهامش والسقف، والأرخص عند تعادل السرعة
    picks['RAM'] = (ramCands.length ? ramCands : rSrc).sort((a, b) => (ramSpeed(b) - ramSpeed(a)) || (a.price - b.price))[0];

    /* ---- التخزين (إصلاح ٢): سعةٌ مستهدفة لا «أعلى سعة في شريحة سعرية» ----
       كانت «قوي» تأخذ 8TB بـ٩٣٠٩﷼ — نصف ثمن الخطّة. الآن: 1TB للاقتصادي،
       و2TB لما فوقه وللمونتاج كلّه. داخل السعة: اقتصادي الأرخص، ومتوازن
       الأسرع ضمن ١٢٥٪ من الأرخص، وقوي الأسرع ضمن ١٥٠٪. */
    const isNvme = (c: any) => String(specVal(parseSpecs(c.specs), ['type', 'Type']) || '').toUpperCase().includes('NVME');
    const stPool = profile.prefNvme && storages.some(isNvme) ? storages.filter(isNvme) : storages;
    const targetGB = intent.use === 'editing' ? 2000 : profile.noGpu || L.key === 'value' ? 1000 : 2000; // المكتبي 1TB في كلّ المستويات
    const atCap = (gb: number) => stPool.filter((c) => Math.abs(capacityGB(c) - gb) <= gb * 0.1);
    const capSteps = [targetGB, targetGB * 2, targetGB / 2, 4000, 500];
    let stSrc: any[] = [];
    for (const gb of capSteps) { stSrc = atCap(gb); if (stSrc.length) break; }
    if (!stSrc.length) stSrc = stPool;
    stSrc = [...stSrc].sort((a, b) => a.price - b.price);
    const stMult = L.key === 'value' ? 1.0 : L.key === 'balanced' ? 1.25 : 1.5;
    const stCands = stSrc.filter((c) => c.price <= stSrc[0].price * stMult);
    const readSpeed = (c: any) => specNum(parseSpecs(c.specs).readSpeed);
    picks['Storage'] = L.key === 'value'
      ? stSrc[0]
      : [...stCands].sort((a, b) => (readSpeed(b) - readSpeed(a)) || (a.price - b.price))[0];

    /* ---- المزوّد: بالقدرة لا بالمؤشّر — أصغر قدرة تكفي بهامش ٢٥٪ ---- */
    const gpuDraw = picks['GPU'] ? (picks['GPU'].tdpWattage || 200) : 0;
    const drawW = cpuDraw + gpuDraw + 80;
    const reqW = Math.ceil(drawW * 1.25);
    const okPsus = psus.filter((ps) => parseFloat(parseSpecs(ps.specs).wattage || '0') >= reqW);
    if (!okPsus.length) continue;
    const minW = Math.min(...okPsus.map((ps) => parseFloat(parseSpecs(ps.specs).wattage || '0')));
    picks['PSU'] = okPsus.filter((ps) => parseFloat(parseSpecs(ps.specs).wattage || '0') === minW)[0];

    /* ---- الكيس والمبرّد معاً (إصلاحا ١ و٦) ----
       الكيس يسع الكرت **الذي يُعرض سعرُه** (أرخص عرضٍ متوفّر؛ المجهول الطول
       يُفترض طويلاً) واللوحةَ والمزوّد — ثمّ مبرّداً يلبّي سحب المعالج.
       ومستواه يتبع الخطّة: كان أرخصَ متّسعٍ دائماً (١٩٨﷼) حتى تحت كرتٍ
       يسحب ٤٠٠ واط. متوازن ≥ ٣، قوي ≥ ٤، وأيّ خطّةٍ تسحب كثيراً ≥ ٣. */
    const shownGpuMm = picks['GPU'] ? shownGpuLengthMm(picks['GPU']) : null;
    const moboFF = moboSp.formFactor;
    const psuFF = parseSpecs(picks['PSU'].specs).formFactor;
    const fitting = cases.filter((c) =>
      (!picks['GPU'] || gpuFitsCase({ lengthMm: shownGpuMm }, parseSpecs(c.specs), { unknownGpuMm: 320 }) !== false)
      && boardFitsCase(moboFF, parseSpecs(c.specs).formFactor)
      && psuFitsCase(psuFF, parseSpecs(c.specs).psuFormFactor));
    if (!fitting.length) continue;
    // والمكتبي بلا كرت ولا حرارة: أرخص كيسٍ يكفيه في كلّ المستويات
    let caseTier = profile.noGpu ? 1 : L.key === 'strong' ? 4 : L.key === 'balanced' ? 3 : 1;
    if (gpuDraw >= 300 || cpuDraw >= 200) caseTier = Math.max(caseTier, 3);
    const tiered = fitting.filter((c) => (c.performanceTier ?? 0) >= caseTier);

    /* مبرّد العلبة بحكم الفحص نفسه (lib/build-check · bundledCooler): «غير مؤكّد»
       — عرضٌ tray بلا مبرّد — يُعامل كغائب، فلا تخرج الخطّة بتحذير «لا مبرّد» */
    const needCooler = bundledCooler(cpuSp.includedCooler) !== 'yes' || cpuDraw > 105;
    const coolerFor = (cse: any) => {
      const cs = parseSpecs(cse.specs);
      return coolers.find((k) => {
        const ks = parseSpecs(k.specs);
        return coolerFitsCpu(ks.sockets, socket) && coolerMeets(k, cpuDraw) && coolerFitsCase(ks.type, ks.sizeMm, cs.maxCoolerHeight, cs.radiatorSupport);
      }) || null;
    };
    /* أرخصُ **زوج** لا أرخص كيسٍ ثمّ ما يدخله: كيسٌ أرخص بعشرين ريالاً لا
       يسع إلّا مبرّداً مائياً بـ٢٢٥ أغلى من كيسٍ يسع برجاً بـ٨٥ */
    let chosenCase: any = null, chosenCooler: any = null;
    for (const list of [tiered, fitting]) {
      let best = Infinity;
      for (const cse of list) {
        const k = needCooler ? coolerFor(cse) : null;
        if (needCooler && !k) continue;
        const cost = cse.price + (k?.price || 0);
        if (cost < best) { best = cost; chosenCase = cse; chosenCooler = k; }
      }
      if (chosenCase) break;
    }
    /* لا مبرّد يدخل أيّ كيس؟ نُبقي الكيس ونترك المبرّد للفحص ينبّه عليه —
       لا نُسقط الخطّة كلّها */
    picks['Case'] = chosenCase || (tiered[0] ?? fitting[0]);
    if (chosenCooler) picks['Cooler'] = chosenCooler;

    const total = Object.values(picks).reduce((sum: number, c: any) => sum + (c?.price || 0), 0);

    /* ---- جملة السبب: النيّة + الدقة + البثّ + مواصفات فعلية ---- */
    const gpuVram = picks['GPU'] ? vramOf(picks['GPU']) : 0;
    const ramGb = specNum(specVal(parseSpecs(picks['RAM'].specs), ['capacity', 'Capacity']));
    const stGb = capacityGB(picks['Storage']);
    let reason = profile.reason;
    if (intent.resolution && ['competitive-shooter', 'aaa-gaming', 'casual-gaming'].includes(intent.use)) {
      reason += ` بدقة ${intent.resolution}`;
    }
    if (intent.alsoStreams && intent.use !== 'streaming') reason += ' مع البثّ المباشر';
    const specBits: string[] = [];
    if (ramGb) specBits.push(`${ramGb}GB رام`);
    if (gpuVram) specBits.push(`${gpuVram}GB كرت`);
    if (stGb) specBits.push(`${stGb >= 1000 ? `${stGb / 1000}TB` : `${stGb}GB`}${isNvme(picks['Storage']) ? ' NVMe' : ''}`);
    if (picks['Cooler']) specBits.push(String(parseSpecs(picks['Cooler'].specs).type || '').toUpperCase() === 'AIO' ? `تبريد مائي ${specNum(parseSpecs(picks['Cooler'].specs).sizeMm)}` : 'مبرّد هوائي');
    const reasonFull = specBits.length ? `${reason} — ${specBits.join('، ')}.` : `${reason}.`;

    /* ---- «يكفيني؟»: إطارات الكرت المقيسة بدقّة المستخدم — للألعاب وحدها ----
       المونتاج والمكتبي لا يُسألان عن دقّة لعب، فلا رقم لهما. والرقم متوسّط ألعاب
       حديثة بإعدادات Ultra، وألعاب الشوتر أخفّ بكثير — فيُقال ذلك معه. */
    const fps = picks['GPU'] && intent.resolution ? fpsOf(picks['GPU']) : null;
    const perf = fps != null
      ? { fps: Math.round(fps), res, feel: feel(fps), note: intent.use === 'competitive-shooter' ? 'وألعاب الشوتر أعلى بكثير' : undefined }
      : null;

    if (picks['CPU'] && cpuOriginal.has(picks['CPU'].id)) picks['CPU'] = cpuOriginal.get(picks['CPU'].id);
    plans.push({ key: L.key, label: L.label, note: reasonFull, total, picks, perf, vramNeed: picks['GPU'] ? gpuVramNeed(intent, L.key) : undefined });
  }

  /* ---- مرشّح السلّم: خطة تُعرض فقط إن كانت أفضل *فعلاً* من سابقتها ----
     يمنع "قوي أغلى بآلاف بلا ترقية" (تشبّع المستوى) و"متوازن أرخص من
     اقتصادي" (انقلاب بسبب اختلاف المنصّة). عرض خطتين صادقتين أفضل من
     ثلاث إحداها بلا معنى. */
  const kept: TierPlan[] = [];
  for (const p of plans) {
    if (!kept.length) { kept.push(p); continue; }
    const prev = kept[kept.length - 1];
    /* والترقية في الكرت تُقاس بالإطارات حين تُعرف للكرتين: ٨٪ فأكثر. كان
       «قوي» لألعاب خفيفة على 1440p يضع RX 6700 XT فوق Arc B580 بـ١٣٧٤﷼
       زيادةً لثلاثة إطارات ونصف (٧٪) — ثمنٌ لا ترقية. */
    const a = p.picks['GPU'], b = prev.picks['GPU'];
    const fa = a ? fpsOf(a) : null, fb = b ? fpsOf(b) : null;
    const gUp = fa != null && fb != null ? fa >= fb * 1.08 : gStrength(a) > gStrength(b);
    const cUp = cStrength(p.picks['CPU']) > cStrength(prev.picks['CPU']);
    if (p.total > prev.total + 300 && (gUp || cUp)) kept.push(p);
  }
  if (!kept.length) return null;

  /* ⚠️ لا تُعاد التسمية حسب العدد.
     كان الباقيان يُسمَّيان «متوازن/قوي» أياً كان أصلهما — فإن سقط مستوى
     «قوي» لأنه ليس ترقية، ظهرت خطّةُ **اقتصادي** باسم «متوازن».
     كل خطّة تحمل اسم مستواها الحقيقي، إلا حين تنجو واحدة فلا مقارنة. */
  if (kept.length === 1) kept[0].label = 'الأنسب لك';

  return kept;
}
