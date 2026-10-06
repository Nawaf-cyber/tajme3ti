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
  /** ما يُدفع فعلاً: للمعالج = مع أرخص لوحة (lib/platform-cost)، ولغيره = السعر */
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
  capacityGb: number | null;
  /** للرام: CL × 2000 ÷ السرعة */
  latencyNs: number | null;
  /** أداءٌ مقيس (إطارات 1440p من lib/gpu-perf) — يحلّ محلّ الدرجة إن وُجد لكلّ القطع */
  perf: number | null;
  /** الإطارات بكلّ دقّة — لسطر «يشغّل الألعاب بمتوسّط…» */
  fps: GpuPerf | null;
  /** الرفع بالذكاء الاصطناعي الذي يدعمه الكرت (lib/gpu-upscaling) */
  upscaler: Upscaler | null;
  /** ذاكرة الكرت بالجيجابايت — للكروت وحدها */
  vramGb: number | null;
  /** موضع السعر: نسبةٌ فوق أدنى ما رُصد، وعدد أيّام المتابعة */
  pctAboveLow: number | null;
  /** أدنى سعرٍ رُصد من المتاجر البائعة الآن — لتنبيه «سعره اليوم X وأدناه Y» */
  lowPrice: number | null;
  days: number | null;
  /** «تناسب جهازك؟» — null لمن لا جهاز له */
  fit: 'fits' | 'warn' | 'block' | 'mine' | null;
};

export type Card = { pros: string[]; cons: string[]; chooseIf: string | null };
export type Verdict = {
  /** اسم المرشَّح — null حين لا يُرشَّح شيء (كلّها نافدة أو لا تركب) */
  pick: string | null;
  /** سعره (مع اللوحة للمعالج) */
  price: number | null;
  priceIsPlatform: boolean;
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

/* اسمٌ لاتينيّ داخل جملةٍ عربيّة: «980 Pro 1TB» يبدأ برقمٍ فيقلبه المتصفّح
   («Pro 1TB 980»)، ويُفلت القوسَ من مكانه. FSI…PDI يعزله فيُعرض كما كُتب. */
const iso = (s: string) => `\u2068${s}\u2069`;

/** أقصى زيادةٍ في السعر تشتريها ذاكرةٌ أكبر بين كرتين من المستوى نفسه (٢٠٪) */
const VRAM_PREMIUM = 0.2;

const money = (n: number) => Math.round(n).toLocaleString('en-US');

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
  const EMPTY: Verdict = { pick: null, price: null, priceIsPlatform: false, lead: null, feel: null, options: [], summary: null, watch: null, outNote: null, empty: null, ai: null, footnote: null, cards: [] };
  const n = parts.length;
  if (n < 2) return EMPTY;
  const storage = category === 'Storage';

  /* ============ الأداء: مقيسٌ إن وُجد لكلّ القطع، وإلّا الدرجة ============
     «مستوى الأداء» خمس درجات لا يفرّق 5070 عن 5070 Ti — فقال الحكم «بنفس
     مستوى الأداء» عن كرتٍ أبطأ بـ١٧٪ (قال نوّاف: «غير منطقي»). فحين يكون
     الرقم المقيس (lib/gpu-perf) لكلّ القطع، يُحكم به وتُقال الفروق بالنسبة.
     وقطعةٌ واحدة بلا رقم تُعيد الكلّ إلى الدرجة — لا مقارنة رقمٍ بتخمين. */
  const measured = parts.every((p) => p.perf != null);
  const perfOf = (p: VerdictInput) => (measured ? p.perf : p.tier);
  const pct = (a: number, b: number) => Math.round((a / b - 1) * 100);
  /** كم الأبطأ أقلّ من الأسرع — «أبطأ بـ ٥١٪»، لا مقلوب «أسرع بـ ١٠٣٪» */
  const slower = (slow: number, fast: number) => Math.round((1 - slow / fast) * 100);

  const perfs = parts.map(perfOf);
  const topPerf = uniqueBest(perfs, 'max');
  const lowPerf = uniqueBest(perfs, 'min');
  const cheapest = uniqueBest(parts.map((p) => (p.cost > 0 ? p.cost : null)), 'min');
  /* القيمة: المقيس = الأداء لكلّ ريال (يُقال للزائر كما هو)، والدرجة = المستوى² ÷ السعر */
  const values = parts.map((p) => (measured ? (p.cost > 0 ? p.perf! / p.cost : null) : valueOf(p, storage)));
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
  const costWord = parts.some((p) => p.costIsPlatform) ? 'مع أرخص لوحة' : '';

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
    if (p.fit === 'mine') pros.push('في جهازك الحالي');
    if (!p.avail) cons.push(p.price > 0 ? 'نافدة حالياً من كل المتاجر' : 'غير متوفرة — لا سعر مسجّل');

    if (measured) {
      const others = perfs.filter((_, j) => j !== i) as number[];
      if (i === topPerf) {
        pros.push(`الأسرع: ${Math.round(p.perf!)} إطار في 1440p (+${Math.round(p.perf! - Math.max(...others))} عن التالي)`);
        tags.push('تبي الأداء الأعلى');
      } else {
        const top = Math.max(...(perfs as number[]));
        if (slower(p.perf!, top) >= 3) cons.push(`${Math.round(p.perf!)} إطار في 1440p (−${Math.round(top - p.perf!)} عن الأسرع)`);
      }
    } else if (i === topPerf) { pros.push(storage ? 'الأسرع في المقارنة' : 'أعلى أداء في المقارنة'); tags.push(storage ? 'تبي السرعة' : 'تبي الأداء الأعلى'); }
    else if (i === lowPerf) cons.push(storage ? 'الأبطأ في المقارنة' : 'أقلّ أداءً في المقارنة');

    if (i === cheapest) {
      pros.push(costWord ? `الأرخص ${costWord}` : 'الأرخص');
      tags.push('ميزانيتك محدودة');
    } else if (p.cost > minCost && cheapest >= 0) {
      cons.push(`أغلى بـ ${money(p.cost - minCost)} ريال${costWord ? ` ${costWord}` : ''}`);
    }
    if (i === bestValue && i !== cheapest && i !== topPerf) {
      pros.push(measured ? 'أعلى أداء لكلّ ريال' : costWord ? 'أفضل قيمة مقابل السعر مع اللوحة' : 'أفضل قيمة مقابل السعر');
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
      else if (p.cooler === 'no') cons.push('بلا مبرّد — ثمنه إضافيّ');
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

    if (i === longW && p.warrantyText) { pros.push(`ضمان الشركة أطول (${p.warrantyText})`); tags.push('يهمّك الضمان'); }
    else if (i === shortW && p.warrantyText) cons.push(`ضمان الشركة أقصر (${p.warrantyText})`);

    if (p.issues > 0) cons.push(`عليه ${p.issues === 1 ? 'ملاحظة' : p.issues === 2 ? 'ملاحظتان' : `${p.issues} ملاحظات`}${p.issueLevel ? ` ${p.issueLevel}` : ''}`);

    if (p.avail && p.pctAboveLow != null && p.days) {
      if (p.pctAboveLow <= 2) pros.push(`سعره الآن عند أدنى ما رصدناه خلال ${daysAr(p.days)} من المتابعة`);
      else if (p.pctAboveLow >= 10) cons.push(p.lowPrice ? `سعره اليوم أعلى بـ ${p.pctAboveLow}% من أدنى ما رصدناه (${money(p.lowPrice)} ريال)` : `سعره اليوم أعلى بـ ${p.pctAboveLow}% من أدنى ما رصدناه`);
    }

    return { pros, cons, chooseIf: tags.length ? tags.slice(0, 2).join(' أو ') : null };
  });

  /* ============ «ترشيحنا» ============
     الأعلى قيمةً بين المتوفّر الذي لا يُمنع من جهاز الزائر. وإن كان الأفضل
     مطلقاً نافداً قيل ذلك صراحةً — لا يُسقط بصمت (قرار نوّاف: النافدة تبقى).
     والسبب مقارنةٌ بأرقام مع كلّ قطعةٍ أخرى، والقاعدة نفسها تُكتب للزائر
     (method) — «اشرح الفرق وليش تحدد الحكم». */
  const eligible = parts.map((p, i) => (p.avail && p.fit !== 'block' ? i : -1)).filter((i) => i >= 0);
  const pickFrom = (idx: number[]) => idx.reduce<number>((b, i) =>
    b < 0 ? i
    : (values[i] ?? -1) > (values[b] ?? -1) ? i
    : (values[i] ?? -1) === (values[b] ?? -1) && parts[i].cost < parts[b].cost ? i : b, -1);

  let pick = pickFrom(eligible);

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
  const withBoard = p.costIsPlatform ? ' مع اللوحة' : '';
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

  if (measured && p.fps) {
    lead = `يشغّل الألعاب بمتوسّط ${fps(p.fps.f1440)} إطار في ${iso("1440p")} — ${iso(`${fps(p.fps.f1080)} في 1080p`)} · ${iso(`${fps(p.fps.f4k)} في 4K`)}`;
    feelTxt = feelLine(p.fps);
    parts.forEach((o, j) => {
      if (j === pick || !o.fps) return;
      const df = fps(o.fps.f1440) - fps(p.fps!.f1440);
      const d = o.cost - p.cost;
      const frames = `${fps(o.fps.f1440)} إطار (${df >= 0 ? '+' : '−'}${Math.abs(df)})`;
      const money_ = d >= 0 ? `بزيادة ${money(d)} ريال` : `وأرخص بـ ${money(-d)} ريال`;
      const mem = o.vramGb != null && p.vramGb != null && o.vramGb !== p.vramGb ? ` · ذاكرة ${o.vramGb}GB` : '';
      const out = !o.avail ? ' · نافد الآن' : '';
      const label = df > 0 && d > 0 ? 'لو دفعت أكثر'
        : df < 0 && d < 0 ? 'لو وفّرت'
        : df <= 0 && d >= 0 ? 'أبطأ وأغلى'
        : 'أسرع وأرخص';
      /* «لو دفعت أكثر: X …» — وحين لا مقايضة (أبطأ وأغلى) يُبدأ بالاسم: «X أبطأ وأغلى: …» */
      options.push(label.startsWith("لو") ? `${label}: ${iso(o.name)} — ${frames} ${money_}${mem}${out}` : `${iso(o.name)} ${label}: ${frames} ${money_}${mem}${out}`);
    });
    if (vramPick) {
      const o = parts.filter((_, j) => j !== pick).sort((x, y) => x.cost - y.cost)[0];
      summary = `أداء ${iso(o.name)} نفسه تقريباً، وذاكرة ${p.vramGb}GB بدل ${o.vramGb}GB بزيادة ${pct(p.cost, o.cost)}% في السعر`;
    } else {
      const fastest = parts.reduce((b, o) => (o.fps && (!b.fps || o.fps.f1440 > b.fps.f1440) ? o : b));
      const cheapestP = parts.reduce((b, o) => (o.cost > 0 && o.cost < b.cost ? o : b));
      if (fastest === p && cheapestP === p) summary = 'الأسرع والأرخص معاً';
      else if (fastest !== p) summary = `تاخذ ${Math.round((p.fps.f1440 / fastest.fps!.f1440) * 100)}% من أداء ${iso(fastest.name)} بـ ${Math.round((p.cost / fastest.cost) * 100)}% من سعره`;
      else summary = `تدفع ${pct(p.cost, cheapestP.cost)}% أكثر من ${iso(cheapestP.name)} وتاخذ ${pct(p.fps.f1440, cheapestP.fps!.f1440)}% أداء أكثر`;
    }
  } else {
    /* بلا أرقامٍ مقيسة (معالجات، تخزين، …): الفرق بالدرجة والسعر، وسببٌ واحد */
    parts.forEach((o, j) => {
      if (j === pick) return;
      const bits: string[] = [];
      if (p.tier != null && o.tier != null) bits.push(p.tier === o.tier ? 'درجة الأداء نفسها عندنا' : `درجة الأداء ${p.tier} مقابل ${o.tier} من 5`);
      const d = o.cost - p.cost;
      if (Math.round(d) !== 0 && o.cost > 0) {
        bits.push(d > 0 ? `أرخص بـ ${money(d)} ريال${withBoard}` : `أغلى بـ ${money(-d)} ريال${withBoard}`);
      }
      if (p.vramGb != null && o.vramGb != null && p.vramGb !== o.vramGb) bits.push(`ذاكرة ${p.vramGb}GB مقابل ${o.vramGb}GB`);
      if (storage && p.capacityGb && o.capacityGb && p.capacityGb !== o.capacityGb) bits.push(`سعة ${fmtCap(p.capacityGb)} مقابل ${fmtCap(o.capacityGb)}`);
      if (!o.avail) bits.push('ذاك نافد');
      if (bits.length) options.push(`مقابل ${iso(o.name)}: ${bits.join(' · ')}`);
    });
    if (storage && perTb[pick] != null && perTb.every((v, j) => j === pick || v == null || v > perTb[pick]!)) {
      summary = `أرخص للتيرابايت: ${money(perTb[pick]!)} ريال`;
    } else {
      summary = pick === topPerf && pick === cheapest ? 'الأعلى أداءً والأرخص معاً'
        : `أفضل قيمة هنا: درجة الأداء${storage ? ' والسعة' : ''} مقابل السعر${withBoard}`;
    }
  }
  if (p.fit === 'fits') summary += '، ويركب في جهازك';

  /* «RTX 5070: DLSS 4.5 + توليد إطارات متعدد · RX 9070 OC: FSR 4 + توليد إطارات» —
     ومعه نتيجة الاختبار الأعمى حين يتقابل DLSS وFSR 4 وحدهما (لم يشمل XeSS) */
  let ai: string | null = null;
  if (upDiffers) {
    /* مجمّعاً بالتقنية: «DLSS 4.5 + …: 5070 و5070 Ti · FSR 4 + …: 9070 OC» — لا تكرار */
    const byLine = new Map<string, string[]>();
    parts.forEach((o, j) => byLine.set(upLines[j]!, [...(byLine.get(upLines[j]!) ?? []), iso(o.name)]));
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
  const outNote = absBest !== pick && !parts[absBest].avail
    ? `${iso(parts[absBest].name)} أفضل قيمةً، لكنّه نافد الآن.`
    : null;

  return {
    pick: p.name, price: p.cost, priceIsPlatform: p.costIsPlatform,
    lead, feel: feelTxt, options, summary, watch, outNote, empty: null, ai,
    footnote: measured ? 'متوسّط ألعاب Tom\'s Hardware بإعدادات Ultra، بلا DLSS/FSR — يختلف حسب اللعبة والمعالج. و«مريح» = 60 إطاراً فأكثر، و«مقبول» = 45–60.' : null,
    cards,
  };
}

/** 2048 → «2TB»، 512 → «512GB» */
const fmtCap = (gb: number) => (gb >= 1024 ? `${+(gb / 1024).toFixed(1)}TB` : `${Math.round(gb)}GB`);
