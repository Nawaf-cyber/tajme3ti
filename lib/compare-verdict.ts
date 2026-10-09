/* ============ «الحكم» في صفحة المقارنة ============
 *
 * كان هنا قسمان: «أيّهما أنصح؟» و«الخلاصة» — يقولان الشيء نفسه مرّتين،
 * ويتعارضان أحياناً (الخلاصة تذكر «الأقلّ استهلاكاً» والترشيح يُسقطه)،
 * ولا يذكران عيباً واحداً: 265F بلا رسوميات مدمجة ولم يُقل.
 *
 * فصار حكماً واحداً:
 *   • سطرٌ يجيب «لأغلب الناس»: أفضل قيمةٍ بين المتوفّر الذي يركب.
 *   • بطاقةٌ لكلّ قطعة: مزاياها (✓) وعيوبها (✗) و«اخترها إذا».
 *
 * ⚠️ كلُّ سطرٍ هنا من صفٍّ في الجدول — لا جملةٌ بلا رقمٍ تحتها. ولا نِسَب
 * أداء: «مستوى الأداء» خمس درجات، و«أسرع بـ ٢٠٪» منه اختراع.
 * ⚠️ والفرق يُقال حين يكون فرقاً: ضمانٌ متساوٍ لا يُذكر، واستهلاكٌ بفارق
 * ١٠ واط لا يُعدّ ميزة.
 */

export type VerdictInput = {
  name: string;
  /** سعر العمود (أرخص متوفّر، أو آخر مسجّل للنافدة) */
  price: number;
  /** ما يُدفع فعلاً: للمعالج = تكلفة المنصّة (لوحةٌ ومبرّدٌ إن لزم — lib/platform-cost)، ولغيره = السعر */
  cost: number;
  costIsPlatform: boolean;
  avail: boolean;
  tier: number | null;
  /** للمعالج والكرت وحدهما — استهلاك اللوحة والكيس ليس ميزة */
  tdp: number | null;
  warrantyYears: number | null;
  warrantyText: string | null;
  issues: number;
  issueLevel: string | null;
  igpu: boolean | null;
  cooler: 'yes' | 'no' | 'unknown' | null;
  /** ثمنُ مبرّدٍ تقديريّ داخلٌ في cost (lib/platform-cost) */
  coolerInCost?: boolean;
  /** المعالج على لوحة جهاز الزائر — ثمن اللوحة خارج cost */
  ownBoard?: boolean;
  /** لا تقبله لوحة الجهاز، فثمنُ لوحةٍ جديدة في cost — والسبب («مقبسه LGA1851 ولوحتك AM5») */
  newBoard?: string | null;
  capacityGb: number | null;
  /** للرام: CL × 2000 ÷ السرعة */
  latencyNs: number | null;
  /** أداءٌ مقيس (إطارات 1440p من lib/gpu-perf) — يحلّ محلّ الدرجة إن وُجد لكلّ القطع */
  perf: number | null;
  /** الإطارات بكلّ دقّة — لسطر «يشغّل الألعاب بمتوسّط…» */
  fps: GpuPerf | null;
  /** الرفع بالذكاء الاصطناعي الذي يدعمه الكرت (lib/gpu-upscaling) */
  upscaler: Upscaler | null;
  /** المعالج: نِسَب الألعاب والتعدّد (lib/cpu-perf) — perf = الألعاب */
  cpu?: CpuPerf | null;
  /** ذاكرة الكرت بالجيجابايت — للكروت وحدها */
  vramGb: number | null;
  /** موضع السعر: نسبةٌ فوق أدنى ما رُصد، وعدد أيّام المتابعة */
  pctAboveLow: number | null;
  /** أدنى سعرٍ رُصد من المتاجر البائعة الآن — لتنبيه «سعره اليوم X وأدناه Y» */
  lowPrice: number | null;
  days: number | null;
  /** «تناسب جهازك؟» — null لمن لا جهاز له */
  fit: 'fits' | 'warn' | 'block' | 'mine' | null;
  /* ---- حقول فئاتٍ بعينها: يحكم كلٌّ بمعياره لا بالدرجة ---- */
  /** التخزين: سرعة القراءة MB/s، والنوع (HDD للأرشيف لا للنظام) */
  readMBs?: number | null;
  storageType?: 'hdd' | 'sata' | 'nvme' | null;
  /** التخزين: فيه ذاكرة DRAM؟ (scripts/fill-storage-dram-tbw) */
  dram?: boolean | null;
  /** الرام: السرعة MT/s */
  ramSpeed?: number | null;
  /** اللوحة: المقبس، وميزاتها التي يُدفع الفرق مقابلها */
  socket?: string | null;
  wifi?: boolean | null;
  m2Slots?: number | null;
  pcieGen?: number | null;
  ramSpeedMax?: number | null;
  /** الكيس: عدد المراوح المرفقة (0 = بلا مراوح)، وأقصى طول كرت */
  caseFans?: number | null;
  gpuMaxMm?: number | null;
  /** الكيس: الحجم — Mini-ITX لا يأخذ لوحة ATX */
  caseSize?: string | null;
  /** المزوّد: تصنيف SPL (A+ … F) — scripts/fill-psu-tier */
  psuTier?: string | null;
};

export type Card = { pros: string[]; cons: string[]; chooseIf: string | null };
export type Verdict = {
  /** اسم المرشَّح — null حين لا يُرشَّح شيء (كلّها نافدة أو لا تركب) */
  pick: string | null;
  /** سعره (مع اللوحة للمعالج) */
  price: number | null;
  priceIsPlatform: boolean;
  /** ممّ يتكوّن سعر المرشَّح: «المعالج + لوحة + مبرّد» أو «المعالج + مبرّد — لوحتك الحالية تكفيه» */
  priceNote: string | null;
  /** «يشغّل الألعاب بمتوسّط 104 إطار في 1440p (…)» — للكروت المقيسة */
  lead: string | null;
  /** «مريح لـ 1080p و1440p · محدود في 4K» */
  feel: string | null;
  /** سطرٌ لكلّ قطعةٍ أخرى: «لو دفعت أكثر / لو وفّرت» بالإطارات والريالات، أو «مقابل X: …» */
  options: string[];
  /** الخلاصة: «تاخذ 89% من أداء X بـ 47% من سعره» */
  summary: string | null;
  /** سعره اليوم وأدنى ما رُصد — حين يعلو ١٠٪ فأكثر */
  watch: string | null;
  /** الأفضل قيمةً نافد — يُقال لا يُسقط */
  outNote: string | null;
  /** سببُ عدم الترشيح */
  empty: string | null;
  /** الرفع بالذكاء الاصطناعي حين يختلف بين الكروت — سطرٌ واحد */
  ai: string | null;
  /** مصدر الإطارات وحدود «مريح/مقبول» — سطرٌ صغير */
  footnote: string | null;
  cards: Card[];
};

import { daysAr } from './price-stats-core';
import { feelLine, type GpuPerf } from './gpu-perf';
import { upscalerLine, type Upscaler } from './gpu-upscaling';
import { CPU_GAMING_TOP, type CpuPerf } from './cpu-perf';

/* اسمٌ لاتينيّ داخل جملةٍ عربيّة: «980 Pro 1TB» يبدأ برقمٍ فيقلبه المتصفّح
   («Pro 1TB 980»)، ويُفلت القوسَ من مكانه. FSI…PDI يعزله فيُعرض كما كُتب. */
const iso = (s: string) => `\u2068${s}\u2069`;

/* اسمٌ مختصر لسطر الذكاء الاصطناعيّ المزدحم: «RTX 5070 Ti 16GB» تكفي —
   GeForce/Radeon في أوّله حشوٌ تكرّر فوق للتوّ. البادئة فقط، فـPULSE Radeon تبقى. */
const short = (n: string) => n.replace(/^(?:NVIDIA\s+)?GeForce\s+|^(?:AMD\s+)?Radeon\s+|^(?:Intel\s+)?(?=Arc\s)/i, '');

/** أقصى زيادةٍ في السعر تشتريها ذاكرةٌ أكبر بين كرتين من المستوى نفسه (٢٠٪) */
const VRAM_PREMIUM = 0.2;

const money = (n: number) => Math.round(n).toLocaleString('en-US');

/** تصنيف SPL رقماً: A+ = 16 … F- = -1 — للمقارنة وحدها */
const splRank = (v: string | null | undefined): number | null => {
  const m = String(v ?? '').trim().match(/^([A-F])([+-]?)/);
  return m ? (70 - m[1].charCodeAt(0)) * 3 + (m[2] === '+' ? 1 : m[2] === '-' ? -1 : 0) : null;
};

/** فهرس الوحيد الذي يحمل القيمة القصوى/الدنيا — أو -1 عند التساوي أو نقص البيانات */
function uniqueBest(vals: (number | null)[], dir: 'max' | 'min'): number {
  const valid = vals.filter((v): v is number => v != null);
  if (valid.length < 2) return -1;
  const best = dir === 'max' ? Math.max(...valid) : Math.min(...valid);
  const idx = vals.map((v, i) => (v === best ? i : -1)).filter((i) => i >= 0);
  return idx.length === 1 ? idx[0] : -1;
}

/** القيمة: المستوى² ÷ التكلفة، وللتخزين السعة × المستوى ÷ التكلفة — كصفّ «القيمة مقابل السعر» */
export function valueOf(p: Pick<VerdictInput, 'tier' | 'cost' | 'capacityGb'>, storage: boolean): number | null {
  if (!p.tier || !(p.cost > 0)) return null;
  if (storage && p.capacityGb) return (p.capacityGb * p.tier) / p.cost;
  return (p.tier * p.tier) / p.cost;
}

export function buildVerdict(parts: VerdictInput[], category: string): Verdict {
  const EMPTY: Verdict = { pick: null, price: null, priceIsPlatform: false, priceNote: null, lead: null, feel: null, options: [], summary: null, watch: null, outNote: null, empty: null, ai: null, footnote: null, cards: [] };
  const n = parts.length;
  if (n < 2) return EMPTY;
  const storage = category === 'Storage';
  /* ⚠️ «درجة الأداء» من 5 كانت تحكم سبع فئات — ولا معنى لها في اللوحة والكيس،
     وتتجاهل أرقاماً حقيقيّة في الرام (زمن الاستجابة) والتخزين (السرعة والسعة).
     فلكلّ فئةٍ معيارها (طلب نوّاف بعد مراجعة الفئات الثماني، 2026-10-08):
       ram     — أرخص جيجابايت، ثمّ أسرع استجابة إن قارب سعرها
       storage — أرخص تيرابايت بين أقراص SSD، ثمّ الأسرع إن قارب سعره
       board   — الأرخص لمقبسك؛ الأغلى تُذكر ميزاته — ومقابس مختلفة لا ترشيح واحد
       case    — الأرخص بين ما فيه مراوح؛ وما بلا مراوح يُقال
       tier    — ما بقي (معالج، مزوّد، مبرّد) إلى أن تصله أرقامٌ مقيسة */
  const kind: 'ram' | 'storage' | 'board' | 'case' | 'tier' =
    category === 'RAM' ? 'ram' : storage ? 'storage' : category === 'Motherboard' ? 'board' : category === 'Case' ? 'case' : 'tier';

  /* ============ الأداء: مقيسٌ إن وُجد لقطعتين فأكثر، وإلّا الدرجة ============
     «مستوى الأداء» خمس درجات لا يفرّق 5070 عن 5070 Ti — فقال الحكم «بنفس
     مستوى الأداء» عن كرتٍ أبطأ بـ١٧٪ (قال نوّاف: «غير منطقي»). فحين يكون
     الرقم المقيس (lib/gpu-perf، lib/cpu-perf) يُحكم به وتُقال الفروق بالنسبة.
     ⚠️ وما ليس له رقم **لا يدخل الترشيح** ويُقال ذلك في سطره وبطاقته — لا
     مقارنة رقمٍ بتخمين. كانت قطعةٌ واحدة بلا رقم تُعيد الكلّ إلى الدرجة،
     فيسقط الحكم المقيس عن ثلاث قطع لأجل الرابعة. */
  const mParts = parts.filter((p) => p.perf != null);
  const measured = mParts.length >= 2;
  /* المعالج المقيس: perf = نسبة الألعاب (lib/cpu-perf)، والتكلفة مع أرخص لوحة —
     فيُحكم بأداء الألعاب لكلّ ريال كالكروت، وتُقال الفروق بالنسبة لا بالإطارات */
  const cpuM = measured && category === 'CPU';
  /** التعدّد معروفٌ للكلّ؟ — وإلّا لا يُقارن به */
  const multiAll = cpuM && mParts.every((p) => p.cpu?.multi != null);
  const perfOf = (p: VerdictInput) => (measured ? p.perf : p.tier);
  const pct = (a: number, b: number) => Math.round((a / b - 1) * 100);
  /** كم الأبطأ أقلّ من الأسرع — «أبطأ بـ ٥١٪»، لا مقلوب «أسرع بـ ١٠٣٪» */
  const slower = (slow: number, fast: number) => Math.round((1 - slow / fast) * 100);

  /* المزوّد: جودته من قائمة SPL (A+ … F) لا «درجة أداء» — المزوّد لا أداء له؛ ما يفرّق مكوّناته وحمايته.
     ‹splRank ÷ 3›: A = 5، B = 4، C = 3 — على سلّم الدرجة نفسه فيبقى حساب القيمة كما هو */
  const psuM = category === 'PSU' && parts.every((p) => splRank(p.psuTier) != null);
  const psuScore = (p: VerdictInput) => splRank(p.psuTier)! / 3;
  const perfs = parts.map((p) => (measured ? p.perf : kind === 'storage' ? p.readMBs ?? null : psuM ? psuScore(p) : kind === 'tier' ? p.tier : null));
  const topPerf = uniqueBest(perfs, 'max');
  const lowPerf = uniqueBest(perfs, 'min');
  const cheapest = uniqueBest(parts.map((p) => (p.cost > 0 ? p.cost : null)), 'min');
  /* القيمة: المقيس = الأداء لكلّ ريال (يُقال للزائر كما هو)، والدرجة = المستوى² ÷ السعر */
  const values = parts.map((p) => {
    if (!(p.cost > 0)) return null;
    if (measured) return p.perf != null ? p.perf / p.cost : null;
    if (kind === 'ram' || kind === 'storage') return p.capacityGb ? p.capacityGb / p.cost : null;
    if (kind === 'board' || kind === 'case') return 1 / p.cost;
    /* المزوّد: بين ما يجتاز حدّ الجودة (pool) يُرشَّح الأرخص — الجودة شرطٌ لا مقايضة */
    if (psuM) return 1 / p.cost;
    return valueOf(p, storage);
  });
  const bestValue = uniqueBest(values, 'max');
  const availBest = bestValue >= 0 && !parts[bestValue].avail
    ? uniqueBest(values.map((v, i) => (parts[i].avail ? v : null)), 'max') : -1;
  const minCost = Math.min(...parts.map((p) => p.cost).filter((c) => c > 0));

  const tdps = parts.map((p) => p.tdp);
  const lowTdp = uniqueBest(tdps, 'min');
  const tdpSpread = (() => { const v = tdps.filter((t): t is number => t != null); return v.length > 1 ? Math.max(...v) - Math.min(...v) : 0; })();

  const wYears = parts.map((p) => p.warrantyYears);
  const longW = uniqueBest(wYears, 'max');
  const shortW = uniqueBest(wYears, 'min');

  const bigCap = uniqueBest(parts.map((p) => p.capacityGb), 'max');
  const perTb = parts.map((p) => (storage && p.capacityGb && p.price > 0 ? p.price / (p.capacityGb / 1024) : null));
  const cheapTb = uniqueBest(perTb, 'min');
  const fastLat = uniqueBest(parts.map((p) => p.latencyNs), 'min');
  /* الذاكرة: الأكبر والأصغر وإن تكرّرا (كرتان 16 أمام 12) — لا «الوحيد» فقط */
  const vrams = parts.map((p) => p.vramGb).filter((v): v is number => v != null);
  const vramMax = vrams.length > 1 ? Math.max(...vrams) : null;
  const vramMin = vrams.length > 1 ? Math.min(...vrams) : null;
  const vramDiffers = vramMax != null && vramMax !== vramMin;

  const igpuDiffers = parts.some((p) => p.igpu === true) && parts.some((p) => p.igpu === false);
  const coolerDiffers = parts.some((p) => p.cooler === 'yes') && parts.some((p) => p.cooler === 'no');
  const costWord = parts.some((p) => p.costIsPlatform) ? 'في المجموع' : '';
  /** ممّ يتكوّن المجموع — بلغة الزائر */
  const costOf = (x: VerdictInput) => !x.costIsPlatform ? null
    : x.ownBoard ? `المعالج${x.coolerInCost ? ' + مبرّد' : ''} — لوحتك الحالية تكفيه`
    : `المعالج + لوحة${x.newBoard ? ' جديدة' : ''}${x.coolerInCost ? ' + مبرّد' : ''}`;

  /* ============ الرفع بالذكاء الاصطناعي — معلومةٌ لا تقلب الترشيح ============
     الإطارات التي نحكم بها مقيسةٌ بلا رفع، فلو قلبت التقنيةُ الترشيحَ لقام
     الحكم على جودة صورةٍ لا نقيسها بالدقّة نفسها. فتُعرض حين تختلف:
     سطرٌ في الحكم، وميزةٌ/عيبٌ في البطاقة. */
  const ups = parts.map((p) => p.upscaler);
  const upLines = ups.map((u) => (u ? upscalerLine(u) : null));
  const upDiffers = ups.every(Boolean) && new Set(upLines).size > 1;
  const upMax = upDiffers ? Math.max(...ups.map((u) => u!.rank)) : 0;
  const upMin = upDiffers ? Math.min(...ups.map((u) => u!.rank)) : 0;

  const cards: Card[] = parts.map((p, i) => {
    const pros: string[] = [];
    const cons: string[] = [];
    const tags: string[] = [];

    if (p.fit === 'block') cons.push('لا تركب في جهازك — السبب في صفّ «تناسب جهازك؟»');
    if (p.newBoard) cons.push(`لا يركب على لوحتك (${p.newBoard}) — يحتاج لوحة جديدة، وثمنها محسوبٌ في سعره`);
    if (p.ownBoard) { pros.push('يركب على لوحتك الحالية — لا تشتري لوحة'); tags.push('تبي تبقي لوحتك'); }
    if (p.fit === 'mine') pros.push('في جهازك الحالي');
    if (!p.avail) cons.push(p.price > 0 ? 'نافدة حالياً من كل المتاجر' : 'غير متوفرة — لا سعر مسجّل');

    const known = perfs.filter((v): v is number => v != null);
    if (measured && p.perf == null) {
      cons.push('ليس في جداول الأداء المقيس — لم يدخل الترشيح');
    } else if (cpuM) {
      const others = perfs.filter((v, j): v is number => j !== i && v != null);
      const top = Math.max(...known);
      /* ⚠️ فارقٌ دون ٣٪ ضجيجُ قياس (1080p مع أقوى كرت) — لا «أسرع» ولا «أبطأ» */
      const gap = i === topPerf ? pct(p.perf!, Math.max(...others)) : 0;
      if (gap >= 3) { pros.push(`الأسرع في الألعاب (+${gap}% عن التالي)`); tags.push('تبي أعلى إطارات مع كرتٍ قويّ'); }
      else if (slower(p.perf!, top) < 3) pros.push('أداء الألعاب بمستوى الأسرع هنا');
      else cons.push(`أبطأ في الألعاب بـ ${slower(p.perf!, top)}% من الأسرع هنا`);
      if (multiAll) {
        const ms = parts.map((o) => (o.perf != null ? o.cpu?.multi ?? null : null));
        const mTop = uniqueBest(ms, 'max');
        const mMax = Math.max(...ms.filter((v): v is number => v != null));
        const others_ = ms.filter((v, j): v is number => j !== i && v != null);
        if (i === mTop && pct(p.cpu!.multi!, Math.max(...others_)) >= 5) {
          pros.push(`الأقوى في التعدّد (+${pct(p.cpu!.multi!, Math.max(...others_))}%) — مونتاج، تصميم، بثّ`);
          tags.push('تشتغل مونتاج أو تصميم أو بثّ');
        } else if (slower(p.cpu!.multi!, mMax) >= 15) {
          cons.push(`أضعف في التعدّد بـ ${slower(p.cpu!.multi!, mMax)}% — يفرق في المونتاج والتصميم`);
        }
      }
    } else if (measured) {
      const others = perfs.filter((v, j): v is number => j !== i && v != null);
      const top = Math.max(...known);
      const n = Math.round(p.perf!);
      if (i === topPerf) {
        const gap = Math.round(p.perf! - Math.max(...others));
        /* فارقٌ دون إطارٍ لا يصنع «أسرع» — كان يطبع «(+0 عن التالي)» */
        if (gap >= 1) { pros.push(`الأسرع: ${n} إطار في 1440p (+${gap} عن التالي)`); tags.push('تبي الأداء الأعلى'); }
        else pros.push(`${n} إطار في 1440p — والتالي مثله`);
      } else if (slower(p.perf!, top) < 3) {
        /* ⚠️ كانت بطاقة المرشَّح تخلو من أيّ سطر أداءٍ وهو يعادل الأسرع —
           أهمّ معلومةٍ في المقارنة لا تُترك للاستنتاج */
        pros.push(`بنفس أداء الأسرع تقريباً (${n} إطار في 1440p)`);
      } else {
        cons.push(`${n} إطار في 1440p (−${Math.round(top - p.perf!)} عن الأسرع)`);
      }
    } else if (psuM) {
      /* سطر SPL في البطاقة يقول الجودة — لا «أعلى أداء» */
    } else if (category === 'CPU' && p.tier != null) {
      /* معالجٌ بلا رقمٍ مقيس (265F ليس في جداول Tom's) — «أعلى أداء في المقارنة» بلا رقمٍ مبهم:
         الرقم المقيس لمن له، والدرجة التقديريّة باسمها لمن ليس له */
      if (p.cpu?.gaming != null) pros.push(`في الألعاب: ${Math.round(p.cpu.gaming)}% من أداء أسرع معالج اليوم (Tom's Hardware)`);
      else cons.push('ليس في جداول الأداء المقيس — نقارنه بدرجتنا التقديريّة فقط');
      if (i === topPerf) { pros.push(`درجته التقديريّة أعلى (${p.tier} من 5)`); tags.push('تبي الأداء الأعلى'); }
      else if (i === lowPerf) cons.push(`درجته التقديريّة أقلّ (${p.tier} من 5)`);
    } else if (i === topPerf) { pros.push(storage ? 'الأسرع في المقارنة' : 'أعلى أداء في المقارنة'); tags.push(storage ? 'تبي السرعة' : 'تبي الأداء الأعلى'); }
    else if (i === lowPerf) cons.push(storage ? 'الأبطأ في المقارنة' : 'أقلّ أداءً في المقارنة');

    if (i === cheapest) {
      pros.push(costWord ? `الأرخص في المجموع (${costOf(p)})` : 'الأرخص');
      tags.push('ميزانيتك محدودة');
    } else if (p.cost > minCost && cheapest >= 0) {
      cons.push(`أغلى بـ ${money(p.cost - minCost)} ريال${costWord ? ` في المجموع (${costOf(p)})` : ''}`);
    }
    if (i === bestValue && i !== cheapest && i !== topPerf && kind !== 'storage' && kind !== 'board' && kind !== 'case') {
      pros.push(cpuM ? 'أعلى أداء ألعاب لكلّ ريال في المجموع' : measured ? 'أعلى أداء لكلّ ريال' : kind === 'ram' ? `أرخص للجيجابايت (${money(p.cost / p.capacityGb!)} ريال)` : costWord ? 'أفضل قيمة في المجموع' : 'أفضل قيمة مقابل السعر');
      tags.push('تبي أفضل قيمة');
    }
    /* الأفضل قيمةً نافد ⇒ أفضلُ المتوفّر يُقال له — وإلّا رُشّح في «ترشيحنا»
       بلا ميزةٍ مكتوبة في بطاقته (رُصد: NM790 أمام BarraCuda 8TB النافد) */
    if (i === availBest && i !== bestValue) { pros.push('أفضل قيمة بين المتوفّر'); tags.push('تبي أفضل قيمة متوفّرة'); }

    if (p.tdp != null && tdpSpread >= 20) {
      const others = tdps.filter((t, j): t is number => j !== i && t != null);
      if (i === lowTdp) { pros.push(`أقلّ استهلاكاً (${p.tdp} واط مقابل ${Math.min(...others)})`); tags.push('يهمّك الاستهلاك والحرارة'); }
      else if (p.tdp === Math.max(...tdps.filter((t): t is number => t != null))) cons.push(`استهلاكه أعلى (${p.tdp} واط)`);
    }

    if (igpuDiffers) {
      if (p.igpu) { pros.push('فيه رسوميات مدمجة — يعمل بلا كرت شاشة'); tags.push('ما عندك كرت شاشة'); }
      else if (p.igpu === false) cons.push('بلا رسوميات مدمجة — يحتاج كرت شاشة');
    }
    if (coolerDiffers) {
      if (p.cooler === 'yes') pros.push('مبرّد مرفق في العلبة');
      else if (p.cooler === 'no') cons.push(p.coolerInCost ? 'بلا مبرّد في علبته — ثمنُ مبرّدٍ محسوبٌ في المجموع' : 'بلا مبرّد — ثمنه إضافيّ');
    }

    if (i === bigCap) { pros.push('أكبر سعة'); tags.push('تحتاج سعة أكبر'); }
    if (i === cheapTb) pros.push(`أرخص للتيرابايت (${money(perTb[i]!)} ريال)`);
    if (i === fastLat) pros.push(`أقلّ زمن استجابة فعليّ (${p.latencyNs} ns)`);
    if (vramDiffers && p.vramGb === vramMax) { pros.push(`ذاكرة أكبر (${p.vramGb}GB)`); tags.push('تبي ذاكرة أكبر'); }
    else if (vramDiffers && p.vramGb === vramMin) cons.push(`ذاكرة أقلّ (${p.vramGb}GB مقابل ${vramMax}GB)`);

    if (upDiffers && p.upscaler) {
      const u = p.upscaler;
      if (upMax > upMin && u.rank === upMax) pros.push(upscalerLine(u));
      else if (upMax > upMin && u.rank === upMin) cons.push(!u.ai ? `${iso(u.tech)} — بلا رفعٍ بالذكاء الاصطناعي` : upMax === 3 && u.tech.startsWith('FSR 4') ? `${upscalerLine(u)} — وDLSS أوضح صورةً في اختبارٍ أعمى` : upscalerLine(u));
      else if (u.frameGen && /متعدد/.test(u.frameGen)) pros.push(upscalerLine(u));
      else if (!u.frameGen) cons.push(`${iso(u.tech)} بلا توليد إطارات`);
    }

    if (kind === 'storage' && p.storageType === 'hdd' && parts.some((o) => o.storageType && o.storageType !== 'hdd')) {
      cons.push('قرصٌ ميكانيكيّ — للأرشيف والملفّات الكبيرة، لا للنظام والألعاب');
    }
    if (kind === 'storage' && p.dram && parts.some((o) => o.dram === false)) {
      pros.push('فيه ذاكرة DRAM — أثبت سرعةً في النسخ الطويل وامتلاء القرص');
    }
    if (category === 'PSU' && p.psuTier) {
      const r = splRank(p.psuTier)!;
      const best = uniqueBest(parts.map((o) => splRank(o.psuTier)), 'max');
      if (r <= splRank('D')!) cons.push(`تصنيف جودته ${p.psuTier} في قائمة SPL — لا يُنصح به لجهازٍ فيه كرت شاشة`);
      else if (r <= splRank('C+')!) cons.push(`تصنيف جودته ${p.psuTier} في قائمة SPL — للأجهزة الاقتصاديّة`);
      else if (i === best) { pros.push(`أعلى تصنيف جودة هنا (${p.psuTier} في قائمة SPL)`); tags.push('تبي مزوّداً يحمي قطعك'); }
    }
    if (kind === 'board') {
      const others = parts.filter((_, j) => j !== i);
      if (p.wifi && others.some((o) => o.wifi === false)) pros.push('فيها واي فاي وبلوتوث');
      else if (p.wifi === false && others.some((o) => o.wifi)) cons.push('بلا واي فاي — تحتاج كيبل شبكة أو قطعة إضافيّة');
      const m2 = parts.map((o) => o.m2Slots ?? null);
      if (i === uniqueBest(m2, 'max')) pros.push(`أكثر فتحات M.2 (${p.m2Slots})`);
      if ((p.pcieGen ?? 0) >= 5 && others.some((o) => (o.pcieGen ?? 0) > 0 && (o.pcieGen ?? 0) < 5)) pros.push('PCIe 5.0 — جاهزة للأقراص والكروت الأحدث');
    }
    if (kind === 'case') {
      if (p.caseFans === 0) cons.push('بلا مراوح مرفقة — تحتاج تشتريها');
      else if (p.caseFans && parts.some((o) => o.caseFans === 0)) pros.push(`معه ${p.caseFans} مراوح`);
      if (i === uniqueBest(parts.map((o) => o.gpuMaxMm ?? null), 'max')) pros.push(`يقبل أطول كرت (${p.gpuMaxMm} مم)`);
    }

    if (i === longW && p.warrantyText) { pros.push(`ضمان الشركة أطول (${p.warrantyText})`); tags.push('يهمّك الضمان'); }
    else if (i === shortW && p.warrantyText) cons.push(`ضمان الشركة أقصر (${p.warrantyText})`);

    if (p.issues > 0) cons.push(`عليه ${p.issues === 1 ? 'ملاحظة' : p.issues === 2 ? 'ملاحظتان' : `${p.issues} ملاحظات`}${p.issueLevel ? ` ${p.issueLevel}` : ''}`);

    if (p.avail && p.pctAboveLow != null && p.days) {
      if (p.pctAboveLow <= 2) pros.push(`سعره الآن عند أدنى ما رصدناه خلال ${daysAr(p.days)} من المتابعة`);
      else if (p.pctAboveLow >= 10) cons.push(p.lowPrice ? `سعره اليوم أعلى بـ ${p.pctAboveLow}% من أدنى ما رصدناه (${money(p.lowPrice)} ريال)` : `سعره اليوم أعلى بـ ${p.pctAboveLow}% من أدنى ما رصدناه`);
    }

    /* «اخترها إذا: تبي الأداء الأعلى» فوقها «لا تركب في جهازك» تناقض — لا ترشيح لما لا يُركَّب */
    return { pros, cons, chooseIf: p.fit !== 'block' && tags.length ? tags.slice(0, 2).join(' أو ') : null };
  });

  /* ============ «ترشيحنا» ============
     الأعلى قيمةً بين المتوفّر الذي لا يُمنع من جهاز الزائر. وإن كان الأفضل
     مطلقاً نافداً قيل ذلك صراحةً — لا يُسقط بصمت (قرار نوّاف: النافدة تبقى).
     والسبب مقارنةٌ بأرقام مع كلّ قطعةٍ أخرى، والقاعدة نفسها تُكتب للزائر
     (method) — «اشرح الفرق وليش تحدد الحكم». */
  const eligible = parts.map((p, i) => (p.avail && p.fit !== 'block' && (!measured || p.perf != null) ? i : -1)).filter((i) => i >= 0);
  const pickFrom = (idx: number[]) => idx.reduce<number>((b, i) =>
    b < 0 ? i
    : (values[i] ?? -1) > (values[b] ?? -1) ? i
    : (values[i] ?? -1) === (values[b] ?? -1) && parts[i].cost < parts[b].cost ? i : b, -1);

  /* ⚠️ اللوحات بمقابس مختلفة (AM5 أمام LGA1700) لا ترتيب بينها — كلٌّ لمعالجٍ
     غير الآخر. كانت تُرتَّب كأنّها بدائل («X670E أفضل قيمة» أمام لوحة إنتل).
     فبلا جهازٍ مسجَّل: ترشيحٌ لكلّ مقبس. ومع جهاز: «تناسب جهازك؟» يمنع ما لا يقبل
     معالجه، فيبقى مقبسٌ واحد. */
  if (kind === 'board') {
    const sockets = [...new Set(eligible.map((i) => parts[i].socket).filter(Boolean))] as string[];
    if (sockets.length > 1) {
      const perSocket = sockets.map((sk) => {
        const idx = eligible.filter((i) => parts[i].socket === sk);
        const b = idx.reduce((x, y) => (parts[y].cost < parts[x].cost ? y : x));
        return `لمعالجات ${iso(sk)}: ${iso(parts[b].name)} (${money(parts[b].cost)} ريال)`;
      });
      return {
        ...EMPTY, cards,
        empty: `هذي اللوحات لمقابس مختلفة، فلا تُقارن ببعض — اختر مقبس معالجك أولاً. الأرخص لكلّ مقبس: ${perSocket.join(' · ')}`,
      };
    }
  }

  /* التخزين: النظام والألعاب على SSD — فالقرص الميكانيكيّ لا يُرشَّح ما دام بينها SSD
     (يُذكر في الخلاصة لما يصلح له: الأرشيف بأرخص تيرابايت) */
  const pool = kind === 'storage' && eligible.some((i) => parts[i].storageType && parts[i].storageType !== 'hdd')
    ? eligible.filter((i) => parts[i].storageType !== 'hdd')
    /* المزوّد: SPL تجعل B للأجهزة المتوسّطة وC للاقتصاديّة — فالترشيح بين B- فأعلى إن وُجد،
       وإلّا بين ما فوق D. رخصُ الضعيف لا يعوّض خطره على بقيّة القطع */
    : psuM && eligible.some((i) => splRank(parts[i].psuTier)! >= splRank('B-')!)
      ? eligible.filter((i) => splRank(parts[i].psuTier)! >= splRank('B-')!)
    : psuM && eligible.some((i) => splRank(parts[i].psuTier)! > splRank('D')!)
      ? eligible.filter((i) => splRank(parts[i].psuTier)! > splRank('D')!)
    /* الكيس: ما بلا مراوح يحتاج شراءها — فالترشيح بين ما فيه مراوح إن وُجد */
    : kind === 'case' && eligible.some((i) => (parts[i].caseFans ?? 0) > 0)
      ? eligible.filter((i) => (parts[i].caseFans ?? 0) > 0)
      : eligible;

  let pick = pickFrom(pool);

  /* الرام والتخزين: أرخص جيجابايت هو الأساس، وما قارب سعرُه (١٠٪ للرام، ١٥٪
     للتخزين) بسعةٍ لا تقلّ يُفضَّل إن كان أسرع: زمن استجابة أقلّ للرام، وقراءة
     أسرع للتخزين. فرقٌ صغير في السعر يشتري سرعةً لا تُرى في سعر الجيجا. */
  let speedPick = false;
  /* الأرخص قبل تفضيل السرعة — لجملة «قريبٌ من الأرخص (X مقابل Y)» */
  const basePick = pick;
  if (pick >= 0 && (kind === 'ram' || kind === 'storage')) {
    const band = kind === 'ram' ? 0.9 : 0.85;
    const near = pool.filter((j) => (values[j] ?? 0) >= band * (values[pick] ?? Infinity) && (parts[j].capacityGb ?? 0) >= (parts[pick].capacityGb ?? 0));
    const speed = (j: number) => (kind === 'ram' ? -(parts[j].latencyNs ?? Infinity) : parts[j].readMBs ?? 0);
    const best = near.reduce((b, j) => (speed(j) > speed(b) ? j : b), pick);
    if (best !== pick) { pick = best; speedPick = true; }
  }

  /* ============ الذاكرة — آخر تقييمٍ قبل الحكم (طلب نوّاف) ============
     كرتٌ أداؤه بمستوى المرشَّح (المقيس: ٩٥٪ منه فأعلى؛ الدرجة: الدرجة نفسها)
     وذاكرته أكبر، وسعره أعلى بـ ٢٠٪ فأقلّ (VRAM_PREMIUM — رُفع من ١١٪ بطلب
     نوّاف: «خلها تأثر»)، يأخذ الترشيح. وفرقٌ كبير في السعر لا تبرّره الذاكرة
     وحدها — فيبقى المرشَّح ويُقال فرق الذاكرة في سببه. */
  const sameLevel = (o: VerdictInput, q: VerdictInput) =>
    measured ? o.perf! >= q.perf! * 0.95 : o.tier != null && o.tier === q.tier;
  let vramPick = false;
  if (pick >= 0 && parts[pick].vramGb != null && perfOf(parts[pick]) != null) {
    const better = eligible.filter((j) => j !== pick
      && sameLevel(parts[j], parts[pick])
      && (parts[j].vramGb ?? 0) > parts[pick].vramGb!
      && parts[j].cost <= parts[pick].cost * (1 + VRAM_PREMIUM));
    if (better.length) {
      const prev = pick;
      pick = better.reduce((b, j) => ((parts[j].vramGb! > parts[b].vramGb!) || (parts[j].vramGb === parts[b].vramGb && parts[j].cost < parts[b].cost) ? j : b));
      vramPick = pick !== prev;
    }
  }

  if (pick < 0) {
    return {
      ...EMPTY, cards,
      empty: parts.some((q) => q.fit === 'block')
        ? 'لا نرشّح أيّاً منها الآن: ما يركب في جهازك نافد، والمتوفّر لا يركب.'
        : 'كلّها نافدة الآن — قارن مواصفاتها، وتابع سعرها حتى تعود.',
    };
  }

  const p = parts[pick];
  const withBoard = p.costIsPlatform ? ' في المجموع' : '';
  /** قطعةٌ بلا رقمٍ مقيس في مقارنةٍ مقيسة — تُذكر بسعرها ولا تُرتَّب */
  const unmeasuredLine = (o: VerdictInput) => {
    const d = Math.round(o.cost - p.cost);
    const m = d === 0 ? 'بالسعر نفسه' : d > 0 ? `أغلى بـ ${money(d)} ريال${withBoard}` : `أرخص بـ ${money(-d)} ريال${withBoard}`;
    return `مقابل ${iso(o.name)}: ليس في جداول الأداء المقيس فلم يدخل الترشيح · ${m}${!o.avail ? ' · نافد الآن' : ''}`;
  };
  const fps = (v: number) => Math.round(v);

  /* ============ بلغة الزائر: إطاراتٌ وريالات ============
     ⚠️ «فكّر الزائر وش يبي يعرف» (نوّاف): أيّهم آخذ؟ يكفيني؟ وش أخسر لو
     أخذت الأرخص ووش أكسب لو دفعت أكثر؟ — لا «أداء لكلّ ريال +42٪». فللكروت
     المقيسة: سطر الإطارات بكلّ دقّة، ثمّ «لو دفعت أكثر / لو وفّرت» لكلّ كرتٍ
     آخر بفرق الإطارات والريالات، ثمّ خلاصةٌ بنسبتين يفهمهما أيّ أحد. */
  let lead: string | null = null;
  let feelTxt: string | null = null;
  const options: string[] = [];
  let summary: string | null = null;

  if (cpuM) {
    /* المعالج: «أسرع بـ N% في الألعاب · +M ريال مع اللوحة» — والتعدّد إن اختلف */
    const g = Math.round(p.perf!);
    lead = p.cpu!.chip === CPU_GAMING_TOP
      ? `أسرع معالج ألعاب اليوم${p.cpu!.multi != null ? ` — وفي التعدّد ${Math.round(p.cpu!.multi)}% من الأقوى` : ''}`
      : `في الألعاب: ${g}% من أداء ${iso(CPU_GAMING_TOP.replace(/^Ryzen \d /, ''))}، أسرع معالج ألعاب اليوم`;
    feelTxt = 'مع كرتٍ متوسّط أو بدقّة 1440p فأعلى يصغر فرق المعالجات كثيراً — الكرت يحدّ قبله';
    parts.forEach((o, j) => {
      if (j === pick) return;
      if (o.perf == null) { options.push(unmeasuredLine(o)); return; }
      const dg = pct(o.perf!, p.perf!);
      const gTxt = Math.abs(dg) < 3 ? 'نفس الأداء في الألعاب' : dg > 0 ? `أسرع بـ ${dg}% في الألعاب` : `أبطأ بـ ${-dg}% في الألعاب`;
      const dm = multiAll ? pct(o.cpu!.multi!, p.cpu!.multi!) : 0;
      const mTxt = Math.abs(dm) >= 5 ? ` · ${dm > 0 ? 'أقوى' : 'أضعف'} بـ ${Math.abs(dm)}% في التعدّد` : '';
      const d = Math.round(o.cost - p.cost);
      const money_ = d === 0 ? 'بالسعر نفسه' : d > 0 ? `+${money(d)} ريال${withBoard}` : `أرخص بـ ${money(-d)} ريال${withBoard}`;
      const out = (!o.avail ? ' · نافد الآن' : '') + (o.fit === 'block' ? ' · ولا يركب في جهازك' : '') + (o.newBoard ? ' · يحتاج لوحة جديدة، وثمنها في مجموعه' : '');
      const eq = Math.abs(dg) < 3;
      const label = !eq && dg > 0 && d > 0 ? 'لو دفعت أكثر' : !eq && dg < 0 && d < 0 ? 'لو وفّرت' : null;
      options.push(label
        ? `${label}: ${iso(o.name)} — ${gTxt}${mTxt} · ${money_}${out}`
        : `مقابل ${iso(o.name)}: ${gTxt}${mTxt} · ${money_}${out}`);
    });
    const fastest = mParts.reduce((b, o) => (o.perf! > b.perf! ? o : b));
    const cheapestP = mParts.reduce((b, o) => (o.cost > 0 && o.cost < b.cost ? o : b));
    const nearTop = mParts.filter((o) => o !== p && slower(o.perf!, p.perf!) < 3 && slower(p.perf!, o.perf!) < 3);
    if (cheapestP === p && nearTop.length && slower(p.perf!, fastest.perf!) < 3) {
      const nextCost = Math.min(...nearTop.map((o) => o.cost));
      summary = `أداء الألعاب نفسه تقريباً${nearTop.length === parts.length - 1 ? ' للكلّ' : nearTop.length === mParts.length - 1 && mParts.length > 2 ? ' للمقيسة كلّها' : ` لـ${iso(nearTop[0].name)}`}، وهو الأرخص بفارق ${money(nextCost - p.cost)} ريال${withBoard}`;
    } else if (fastest === p && cheapestP === p) summary = 'الأسرع في الألعاب والأرخص معاً';
    else if (fastest !== p) {
      const perfPct = Math.round((p.perf! / fastest.perf!) * 100);
      const costPct = Math.round((p.cost / fastest.cost) * 100);
      summary = perfPct >= 97
        ? `بنفس أداء ${iso(fastest.name)} في الألعاب تقريباً، وبـ ${costPct}% من سعره${withBoard}`
        : `تاخذ ${perfPct}% من أداء ${iso(fastest.name)} في الألعاب بـ ${costPct}% من سعره${withBoard}`;
    } else summary = `تدفع ${pct(p.cost, cheapestP.cost)}% أكثر من ${iso(cheapestP.name)}${withBoard} وتاخذ ${pct(p.perf!, cheapestP.perf!)}% أداء أكثر في الألعاب`;
  } else if (measured && p.fps) {
    lead = `يشغّل الألعاب بمتوسّط ${fps(p.fps.f1440)} إطار في ${iso("1440p")} — ${iso(`${fps(p.fps.f1080)} في 1080p`)} · ${iso(`${fps(p.fps.f4k)} في 4K`)}`;
    feelTxt = feelLine(p.fps);
    parts.forEach((o, j) => {
      if (j === pick) return;
      if (!o.fps) { options.push(unmeasuredLine(o)); return; }
      /* ⚠️ df على الأرقام **المقرّبة**: الفرق دون إطارٍ تعادلٌ لا «أبطأ» —
         ظهر «أبطأ وأغلى: 117 إطار (+0)» عن كرتٍ مساوٍ (9070 XT أمام 5070 Ti). */
      const df = fps(o.fps.f1440) - fps(p.fps!.f1440);
      const d = Math.round(o.cost - p.cost);
      const frames = df === 0 ? `${fps(o.fps.f1440)} إطار (مثله)` : `${fps(o.fps.f1440)} إطار (${df > 0 ? '+' : '−'}${Math.abs(df)})`;
      const money_ = d === 0 ? 'بالسعر نفسه' : d > 0 ? `بزيادة ${money(d)} ريال` : `وأرخص بـ ${money(-d)} ريال`;
      const mem = o.vramGb != null && p.vramGb != null && o.vramGb !== p.vramGb ? ` · ذاكرة ${o.vramGb}GB` : '';
      const out = (!o.avail ? ' · نافد الآن' : '') + (o.fit === 'block' ? ' · ولا تركب في جهازك' : '');
      const label = df > 0 && d > 0 ? 'لو دفعت أكثر'
        : df < 0 && d < 0 ? 'لو وفّرت'
        : df === 0 ? `بنفس الأداء و${d > 0 ? 'أغلى' : d < 0 ? 'أرخص' : 'بسعره'}`
        : df < 0 ? `أبطأ و${d > 0 ? 'أغلى' : 'بنفس السعر'}`
        : 'أسرع وأرخص';
      /* «لو دفعت أكثر: X …» — وحين لا مقايضة يُبدأ بالاسم: «X بنفس الأداء وأغلى: …» */
      options.push(label.startsWith("لو") ? `${label}: ${iso(o.name)} — ${frames} ${money_}${mem}${out}` : `${iso(o.name)} ${label}: ${frames} ${money_}${mem}${out}`);
    });
    if (vramPick) {
      const o = parts.filter((_, j) => j !== pick).sort((x, y) => x.cost - y.cost)[0];
      summary = `أداء ${iso(o.name)} نفسه تقريباً، وذاكرة ${p.vramGb}GB بدل ${o.vramGb}GB بزيادة ${pct(p.cost, o.cost)}% في السعر`;
    } else {
      const fastest = parts.reduce((b, o) => (o.fps && (!b.fps || o.fps.f1440 > b.fps.f1440) ? o : b));
      const cheapestP = mParts.reduce((b, o) => (o.cost > 0 && o.cost < b.cost ? o : b));
      if (fastest === p && cheapestP === p) summary = 'الأسرع والأرخص معاً';
      else if (fastest !== p) {
        const perfPct = Math.round((p.fps.f1440 / fastest.fps!.f1440) * 100);
        const costPct = Math.round((p.cost / fastest.cost) * 100);
        /* ≥٩٧٪ تعادلٌ عمليّ — «تاخذ 100% من أداء X» صياغةٌ ملتوية لنفس المعنى */
        summary = perfPct >= 97
          ? `بنفس أداء ${iso(fastest.name)} تقريباً، وبـ ${costPct}% من سعره`
          : `تاخذ ${perfPct}% من أداء ${iso(fastest.name)} بـ ${costPct}% من سعره`;
      }
      else summary = `تدفع ${pct(p.cost, cheapestP.cost)}% أكثر من ${iso(cheapestP.name)} وتاخذ ${pct(p.fps.f1440, cheapestP.fps!.f1440)}% أداء أكثر`;
    }
  } else if (kind === 'ram') {
    /* الرام: السعة والسرعة الفعليّة وثمن الجيجا — أرقام الجدول نفسها */
    parts.forEach((o, j) => {
      if (j === pick) return;
      const bits: string[] = [];
      if (p.capacityGb && o.capacityGb && p.capacityGb !== o.capacityGb) bits.push(`سعة ${p.capacityGb}GB مقابل ${o.capacityGb}GB`);
      else if (p.capacityGb === o.capacityGb && p.ramSpeed === o.ramSpeed) bits.push('نفس السعة والسرعة');
      if (p.latencyNs && o.latencyNs && Math.abs(p.latencyNs - o.latencyNs) >= 0.3) {
        bits.push(`زمن استجابة ${p.latencyNs < o.latencyNs ? 'أقلّ' : 'أعلى'} (${p.latencyNs} مقابل ${o.latencyNs} ns)`);
      }
      const d = Math.round(o.cost - p.cost);
      if (d !== 0) bits.push(d > 0 ? `ذاك أغلى بـ ${money(d)} ريال` : `ذاك أرخص بـ ${money(-d)} ريال`);
      if (!o.avail) bits.push('ذاك نافد');
      if (o.fit === 'block') bits.push('لا تركب في جهازك');
      if (bits.length) options.push(`مقابل ${iso(o.name)}: ${bits.join(' · ')}`);
    });
    const perGb = money(p.cost / p.capacityGb!);
    summary = speedPick
      ? `سعر الجيجابايت ${perGb} ريال مقابل ${money(parts[basePick].cost / parts[basePick].capacityGb!)} للأرخص، وزمن استجابته أقلّ (${p.latencyNs} مقابل ${parts[basePick].latencyNs} ns)`
      : uniqueBest(parts.map((o) => o.latencyNs), 'min') === pick
        ? `أرخص جيجابايت هنا (${perGb} ريال) وأسرع استجابة`
        : `أرخص جيجابايت هنا (${perGb} ريال)`;
  } else if (kind === 'storage') {
    /* التخزين: السعة والسرعة وثمن التيرابايت — والميكانيكيّ للأرشيف */
    parts.forEach((o, j) => {
      if (j === pick) return;
      const bits: string[] = [];
      if (p.capacityGb && o.capacityGb && p.capacityGb !== o.capacityGb) bits.push(`سعة ${fmtCap(p.capacityGb)} مقابل ${fmtCap(o.capacityGb)}`);
      if (p.readMBs && o.readMBs && p.readMBs !== o.readMBs) bits.push(`قراءة ${money(p.readMBs)} مقابل ${money(o.readMBs)} MB/s`);
      const d = Math.round(o.cost - p.cost);
      if (d !== 0) bits.push(d > 0 ? `ذاك أغلى بـ ${money(d)} ريال` : `ذاك أرخص بـ ${money(-d)} ريال`);
      if (o.storageType === 'hdd' && p.storageType !== 'hdd') bits.push('ذاك ميكانيكيّ');
      if (!o.avail) bits.push('ذاك نافد');
      if (o.fit === 'block') bits.push('لا تركب في جهازك');
      if (bits.length) options.push(`مقابل ${iso(o.name)}: ${bits.join(' · ')}`);
    });
    const tb = money(perTb[pick]!);
    summary = speedPick
      ? `التيرابايت بـ ${tb} ريال مقابل ${money(perTb[basePick]!)} للأرخص، وهو أسرع بكثير (قراءة ${money(p.readMBs!)} مقابل ${money(parts[basePick].readMBs ?? 0)} MB/s)`
      : `أرخص تيرابايت${p.storageType !== 'hdd' && parts.some((o) => o.storageType === 'hdd') ? ' بين أقراص SSD' : ''} هنا (${tb} ريال)`;
    const hdd = parts.findIndex((o) => o.storageType === 'hdd');
    if (hdd >= 0 && hdd !== pick && perTb[hdd] != null) {
      summary += `. وللأرشيف والملفّات الكبيرة: ${iso(parts[hdd].name)} بـ ${money(perTb[hdd]!)} ريال للتيرابايت`;
    }
  } else if (kind === 'board') {
    /* اللوحة: الأرخص لمقبسك — والأغلى يُكتب ما تدفع زيادةً مقابله */
    parts.forEach((o, j) => {
      if (j === pick) return;
      const gains: string[] = [];
      if (o.wifi && p.wifi === false) gains.push('واي فاي');
      if ((o.m2Slots ?? 0) > (p.m2Slots ?? 0)) gains.push(`${o.m2Slots} فتحات M.2 بدل ${p.m2Slots}`);
      if ((o.pcieGen ?? 0) > (p.pcieGen ?? 0)) gains.push(`PCIe ${o.pcieGen}.0`);
      if ((o.ramSpeedMax ?? 0) > (p.ramSpeedMax ?? 0)) gains.push(`رام حتى ${o.ramSpeedMax}`);
      const d = Math.round(o.cost - p.cost);
      const tail = (!o.avail ? ' · نافدة' : '') + (o.fit === 'block' ? ' · لا تركب في جهازك' : '');
      if (d > 0) options.push(`لو دفعت أكثر: ${iso(o.name)} — +${money(d)} ريال${gains.length ? `: ${gains.join(' · ')}` : ' بلا ميزةٍ زائدة في جدولنا'}${tail}`);
      else options.push(`مقابل ${iso(o.name)}: ${d < 0 ? `ذاك أرخص بـ ${money(-d)} ريال` : 'بنفس السعر'}${tail}`);
    });
    summary = 'اللوحة لا تزيد أداء الألعاب غالباً — ترشيحنا الأرخص لمقبسك، وادفع أكثر فقط مقابل ميزةٍ تحتاجها';
  } else if (kind === 'case') {
    /* الكيس: الأرخص بين ما فيه مراوح — والفرق في المراوح والمقاس والكرت */
    parts.forEach((o, j) => {
      if (j === pick) return;
      const bits: string[] = [];
      if (o.caseSize && p.caseSize && o.caseSize !== p.caseSize) bits.push(`ذاك ${iso(o.caseSize)}${/itx/i.test(o.caseSize) ? ' — لا يأخذ لوحة ATX' : ''}`);
      if (o.caseFans != null && o.caseFans !== p.caseFans) bits.push(o.caseFans === 0 ? 'ذاك بلا مراوح' : `ذاك معه ${o.caseFans} مراوح`);
      if (o.gpuMaxMm && p.gpuMaxMm && o.gpuMaxMm !== p.gpuMaxMm) bits.push(`أقصى كرت ${p.gpuMaxMm} مقابل ${o.gpuMaxMm} مم`);
      const d = Math.round(o.cost - p.cost);
      if (d !== 0) bits.push(d > 0 ? `ذاك أغلى بـ ${money(d)} ريال` : `ذاك أرخص بـ ${money(-d)} ريال`);
      if (!o.avail) bits.push('ذاك نافد');
      if (o.fit === 'block') bits.push('لا تركب في جهازك');
      if (bits.length) options.push(`مقابل ${iso(o.name)}: ${bits.join(' · ')}`);
    });
    summary = parts.some((o) => o.caseFans === 0) && (p.caseFans ?? 0) > 0
      ? `الأرخص بين الكيسات اللي معها مراوح (${p.caseFans})`
      : 'الكيس لا يغيّر الأداء — ترشيحنا الأرخص، والفرق في المقاس والمراوح والشكل';
  } else {
    /* بلا أرقامٍ مقيسة (معالجات، تخزين، …): الفرق بالدرجة والسعر، وسببٌ واحد */
    parts.forEach((o, j) => {
      if (j === pick) return;
      const bits: string[] = [];
      if (psuM) bits.push(p.psuTier === o.psuTier ? `نفس تصنيف الجودة (${p.psuTier})` : `جودة ${p.psuTier} مقابل ${o.psuTier} في قائمة SPL`);
      else if (p.tier != null && o.tier != null) {
        const unm = category === 'CPU' && (p.cpu?.gaming == null || o.cpu?.gaming == null);
        bits.push(p.tier === o.tier ? 'درجتنا التقديريّة للأداء نفسها' : `درجتنا التقديريّة للأداء ${p.tier} مقابل ${o.tier} من 5`);
        if (unm) bits.push(`${o.cpu?.gaming == null ? 'ذاك' : 'هذا'} بلا أرقام أداء مقيسة`);
      }
      const d = o.cost - p.cost;
      if (Math.round(d) !== 0 && o.cost > 0) {
        bits.push(d > 0 ? `ذاك أغلى بـ ${money(d)} ريال${withBoard}` : `ذاك أرخص بـ ${money(-d)} ريال${withBoard}`);
      }
      if (p.vramGb != null && o.vramGb != null && p.vramGb !== o.vramGb) bits.push(`ذاكرة ${p.vramGb}GB مقابل ${o.vramGb}GB`);
      if (storage && p.capacityGb && o.capacityGb && p.capacityGb !== o.capacityGb) bits.push(`سعة ${fmtCap(p.capacityGb)} مقابل ${fmtCap(o.capacityGb)}`);
      if (!o.avail) bits.push('ذاك نافد');
      if (o.fit === 'block') bits.push('لا تركب في جهازك');
      if (o.newBoard) bits.push(`يحتاج لوحة جديدة (${o.newBoard})، وثمنها في مجموعه`);
      if (bits.length) options.push(`مقابل ${iso(o.name)}: ${bits.join(' · ')}`);
    });
    if (storage && perTb[pick] != null && perTb.every((v, j) => j === pick || v == null || v > perTb[pick]!)) {
      summary = `أرخص للتيرابايت: ${money(perTb[pick]!)} ريال`;
    } else {
      summary = psuM
        ? (pick === topPerf && pick === cheapest ? 'الأعلى جودةً والأرخص معاً'
          : splRank(p.psuTier)! >= splRank('B-')!
            ? `الأرخص بين المزوّدات من الفئة B فأعلى في قائمة SPL (هذا ${p.psuTier})${parts.some((o) => splRank(o.psuTier)! < splRank('B-')!) ? '؛ والفئة C للأجهزة الاقتصاديّة' : ''} — وتأكّد أنّ قدرته تكفي جهازك`
            : `كلّها دون الفئة B في قائمة SPL — للأجهزة الاقتصاديّة، وهذا الأرخص بينها`)
        : pick === topPerf && pick === cheapest ? 'الأعلى أداءً والأرخص معاً'
        : storage ? `أفضل قيمة هنا: درجة الأداء والسعة مقابل السعر${withBoard}`
        : (() => {
          const cheap = cheapest >= 0 ? parts[cheapest] : null;
          const top = topPerf >= 0 ? parts[topPerf] : null;
          if (cheap && cheap !== p && p.tier != null && cheap.tier != null) {
            return `تدفع ${money(p.cost - cheap.cost)} ريال أكثر من ${iso(cheap.name)}${withBoard}، ودرجته التقديريّة للأداء ${p.tier} مقابل ${cheap.tier} من 5`;
          }
          if (top && top !== p && p.tier != null && top.tier != null) {
            return `الأرخص${withBoard}، ودرجته التقديريّة ${p.tier} من 5 — و${iso(top.name)} بدرجة ${top.tier} أغلى بـ ${money(top.cost - p.cost)} ريال`;
          }
          return `أفضل قيمة هنا: درجة الأداء مقابل السعر${withBoard}`;
        })();
    }
  }
  if (p.ownBoard) summary += '، ويركب على لوحتك الحالية فلا تشتري لوحة';
  else if (p.fit === 'fits') summary += '، ويركب في جهازك';

  /* «RTX 5070: DLSS 4.5 + توليد إطارات متعدد · RX 9070 OC: FSR 4 + توليد إطارات» —
     ومعه نتيجة الاختبار الأعمى حين يتقابل DLSS وFSR 4 وحدهما (لم يشمل XeSS) */
  let ai: string | null = null;
  if (upDiffers) {
    /* مجمّعاً بالتقنية: «DLSS 4.5 + …: 5070 و5070 Ti · FSR 4 + …: 9070 OC» — لا تكرار */
    const byLine = new Map<string, string[]>();
    parts.forEach((o, j) => byLine.set(upLines[j]!, [...(byLine.get(upLines[j]!) ?? []), iso(short(o.name))]));
    ai = [...byLine].map(([line, names]) => `${names.join(' و')}: ${line}`).join(' · ');
    const techs = ups.map((u) => u!.tech);
    if (techs.some((t) => t.startsWith('DLSS')) && techs.some((t) => t.startsWith('FSR 4'))) {
      ai += ` — وفي اختبارٍ أعمى فضّل اللاعبون ${iso('DLSS 4.5')} على ${iso('FSR 4')} (48% مقابل 15%)`;
    }
  }

  const watch = p.pctAboveLow != null && p.pctAboveLow >= 10 && p.lowPrice
    ? `اليوم ${money(p.price)} ريال · أدنى ما رصدناه ${money(p.lowPrice)} (+${p.pctAboveLow}%)`
    : null;

  const absBest = pickFrom(parts.map((_, i) => i));
  /* المزوّد: «الأرخص» نافداً ليس «أفضل قيمة» — قيمته شرط الجودة لا السعر */
  const outNote = !psuM && absBest !== pick && !parts[absBest].avail
    ? `${iso(parts[absBest].name)} أفضل قيمةً، لكنّه نافد الآن.`
    : null;

  return {
    pick: p.name, price: p.cost, priceIsPlatform: p.costIsPlatform, priceNote: costOf(p),
    lead, feel: feelTxt, options, summary, watch, outNote, empty: null, ai,
    footnote: cpuM ? 'نِسَب Tom\'s Hardware: الألعاب بدقّة 1080p مع RTX 5090 ليظهر فرق المعالجات، والتعدّد من تطبيقات المونتاج والتصميم والضغط.' : measured ? 'متوسّط ألعاب Tom\'s Hardware بإعدادات Ultra، بلا DLSS/FSR — يختلف حسب اللعبة والمعالج. و«مريح» = 60 إطاراً فأكثر، و«مقبول» = 45–60.' : null,
    cards,
  };
}

/** 2048 → «2TB»، 512 → «512GB» */
const fmtCap = (gb: number) => (gb >= 1024 ? `${+(gb / 1024).toFixed(1)}TB` : `${Math.round(gb)}GB`);
