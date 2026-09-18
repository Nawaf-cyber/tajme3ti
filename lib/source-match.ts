/* ============ مطابقة قطعتنا بمنتجٍ في متجر ============
 *
 * منطقٌ نقيّ بلا شبكة ولا prisma — يستعمله السكربت وصفحة الإدارة معاً.
 * وُضع هنا لا في أحدهما لأن نسختين تعنيان عيباً يُصلَح في واحدة ويعيش في
 * الأخرى، وهو درس ساحبات الأسعار.
 *
 * ⚠️ **المطابقة هي كل شيء.** البحث يعطي أشباهاً لا أطرافاً، وقد كذب
 * المطابق ثلاث مرّاتٍ قبل أن يصدق:
 *
 *     AG400 BK ARGB   ≠ AG400 G2 ARGB       Ryzen 9 9950X ≠ 9950X3D
 *     Ryzen 9 7900    ≠ 7900X                Ryzen 5 5500  ≠ 5500H (لابتوب)
 *     B650 Gaming     ≠ B650M Gaming         SSR-650FM     ≠ SSR-650FX
 *     RX 7900 GRE     ≠ RX 7900 XTX          Crosshair Hero ≠ Crosshair Extreme
 *
 * فالقاعدة: لا يُقبل مرشّحٌ إلا إذا حمل **كل** رمزٍ مميّز في اسمنا —
 * الشركة، والسعة، والطراز بحدّ كلمة، وكل كلمةٍ غير عامّة، ومقاس اللوحة،
 * واللون في الاتّجاهين. وما شكّ فيه يُعرض للمراجعة ولا يُكتب.
 */

import { capacityGb } from './capacity';

/** ⚠️ `image` اختياريّة: صفحةُ النتائج تحملها في مايكرولس وإنفيني آرك بلا
    طلبٍ إضافيّ، وغيرُهما لا يحملها. والمُطابِق لا يقرؤها — هي للعرض وحده. */
export type Candidate = { title: string; url: string; price?: number | null; image?: string | null };
export type Verdict = { ok: boolean; why: string };

const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

/** حدُّ كلمةٍ على النصّ الأصليّ — التطبيع يُذيب الفواصل فتصير 9950X3D حاويةً 9950X */
const hasWord = (haystack: string, token: string): boolean => {
  const t = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Za-z0-9])${t}([^A-Za-z0-9]|$)`, 'i').test(haystack);
};

/* كلماتٌ تقولها كل صفحةٍ في المتجر، فلا تُميّز شيئاً */
const GENERIC = new Set([
  'GAMING', 'WIFI', 'ATX', 'EATX', 'ITX', 'PLUS', 'PRO', 'MAX', 'EDITION', 'SERIES',
  'DESKTOP', 'MEMORY', 'INTERNAL', 'SSD', 'NVME', 'SATA', 'RGB', 'ARGB', 'BLACK',
  'GOLD', 'PLATINUM', 'TOWER', 'CASE', 'COOLER', 'LIQUID', 'AIR', 'FAN', 'AMD', 'INTEL',
  'GEFORCE', 'RADEON', 'NVIDIA', 'MOTHERBOARD', 'CPU', 'GPU', 'CORE', 'THE', 'AND', 'FOR',
  /* ⚠️ ULTRA اسمُ خطٍّ لا طراز — و«CORE» عامٌّ هنا أصلاً، فاشتراطُ نصفه
     الثاني وحده تفريق بلا معنى. والطرازُ (225F) هو الفاصل. */
  'ULTRA',
]);

/**
 * أسماء الشركات كما تُكتب بالعربيّة.
 *
 * ⚠️ إنفيني آرك يكتب عناوينه عربيّةً بالكامل: «معالج إنتل كور ألترا 5 225F».
 * فشرطُ ورود اسم الشركة لاتينيّاً يرفض المطابق **الصحيح** — وقد رفض فعلاً
 * Core Ultra 5 225F، وهو المعالج الوحيد المشترك بيننا وبين ذلك المتجر ممّا
 * ينقصنا. فبقي إنفيني آرك بعرضٍ واحدٍ في المعالجات كلّها لا لأنّه لا يبيع،
 * بل لأنّا لا نقرأ لغته.
 *
 * ⚠️ ولا يُلمس شرطُ الشركة نفسه: إسقاطه يقبل كرت MSI مكان كرت ASUS لأنّ
 * «RTX 5070» فيهما جميعاً. فالاسم يُقبل عربيّاً أو لاتينيّاً، ويبقى شرطاً.
 */
const BRAND_AR: Record<string, RegExp> = {
  intel: /[إا]نتل/,
  amd: /[أا]يه\s*[إا]م\s*دي/,
  asus: /[أا]سوس|[إا]يسوس/,
  gigabyte: /[جق]يجابايت|[جق]يقابايت/,
  msi: /[إا]م\s*[إا]س\s*[آا]ي/,
  corsair: /كورسير/,
  kingston: /كينج?ستون/,
};

/** أنظمةٌ كاملة تحمل اسم القطعة ولا تُساويها — لابتوب فيه Ryzen 5500H ليس معالجاً */
/**
 * جهازٌ كاملٌ لا قطعة.
 *
 * ⚠️ وكانت لهذه القاعدة **نسختان**: هذه، وأخرى في `lib/discover.ts` أوسع
 * منها. فأُضيفت «desktop computer» إلى تلك وحدها، وبقيت هذه عمياء عنها —
 * فقَبِلت «ASUS D500ME **Desktop Computers**, i7-13700 … RTX 3060» مرشَّحاً
 * لكرت RTX 3060. وهو **ثالثُ** وقوعٍ لنفس الدرس في هذا المشروع.
 *
 * فالقاعدة هنا، و`discover.ts` يُعيد تصديرها — لا ينسخها.
 */
export const IS_SYSTEM =
  /gaming pc|gaming desktop|gaming computer|desktop pc|desktop computer|desktop configuration|\bpc\b.*(ryzen|core ultra|rtx)|prebuilt|barebone|workstation|\bserver\b|rack ?mount|\bepyc\b|laptop|notebook|all-in-one|bundle|بي ?سي ?قيمنق|جهاز جاهز|تجميعة جاهزة|كمبيوتر مكتبي/i;

/**
 * ملحقٌ **لقطعة** لا القطعة نفسها.
 *
 * ⚠️ قِيس: «Alphacool Apex Distro Plate **Y60 for HYTE Case**» قُبل مرشَّحاً
 * لكيس HYTE Y60 — فيه اسمُ الشركة وفيه الطراز، والمُطابِق لا يرى أنّه لوحُ
 * تبريدٍ يُركَّب فيه لا هو.
 */
const IS_ACCESSORY =
  /distro plate|\bbracket\b|\briser\b|mounting kit|\bstand\b|dust filter|cable (kit|comb|extension)|adapter kit|replacement (fan|panel)|\bsleeve\b|\bscrews?\b/i;

/**
 * قطعتان تُباعان معاً — ولا تُسمّى «bundle».
 *
 * ⚠️ قِيس يوم 2026-09-18: أعاد بحثُ «Radeon RX 9070 XT» **خمسةَ** صفوفٍ
 * مثل «ASUS ROG Strix B850-E Gaming WiFi AM5 ATX Motherboard **with**
 * ASUS Prime Radeon RX 9070 XT OC Edition Graphics Card» بـ٤٬٨١٠ ﷼.
 * ولا تحمل كلمة bundle ولا kit ولا combo، فمرّت من `IS_SYSTEM` كلّها.
 *
 * والضرر مضاعف: تدخل مرشَّحةً **للوحة أمّ** بسعر لوحةٍ + كرت، وتدخل
 * مرشَّحةً **لكرت شاشة** بنفس السعر. وفي الحالتين رقمٌ يقارب ضعف الصواب.
 *
 * والقاعدة أنّ العنوان يسمّي **نوعين مختلفين** من القطع موصولين بـ«with»
 * أو «+». ولا تُفحص الكلمتان مبعثرتين في العنوان: «Motherboard» وحدها
 * تَرِد في كلّ عنوان لوحة، و«Graphics Card» في كلّ عنوان كرت. الرابط
 * بينهما هو ما يدلّ على الحزمة.
 */
const PART_NOUN =
  '(?:motherboard|graphics\\s*card|video\\s*card|processor|\\bcpu\\b|\\bgpu\\b|power\\s*supply|\\bpsu\\b|memory\\s*kit|\\bssd\\b|\\bcase\\b|cpu\\s*cooler)';
const IS_BUNDLE = new RegExp(`${PART_NOUN}[^,،]{0,80}?\\s(?:with|\\+)\\s[^,،]{0,80}?${PART_NOUN}`, 'i');


/**
 * لابتوبٌ لا يسمّي نفسه لابتوباً.
 *
 * ⚠️ قِيس: «MSI Creator Z16 with 16" QHD display, Intel Core **i9-12900H**,
 * 32GB RAM, 1TB SSD, NVIDIA GeForce RTX 3060» قُبل مرشَّحاً لكرت RTX 3060.
 * ولا تحمل الكلمةَ «laptop» ولا «notebook» — فالتقاطُها بعلامتين لا تكونان
 * إلّا في محمول: **مقاسُ شاشةٍ بالبوصة**، و**لاحقةُ معالجٍ محمول** (H/HX/HS/U).
 */
const IS_LAPTOP =
  /\b\d{2}(\.\d)?"\s*(qhd|fhd|uhd|oled|ips|display|screen)|\b(core\s*)?i[3579][- ]?\d{4,5}(hx|hs|h|u)\b|\bryzen\s*\d\s*\d{4}(hx|hs|h|u)\b/i;

/**
 * «هذا ليس قطعةً مفردة» — بوّابةٌ واحدة لمسار الاكتشاف.
 *
 * ⚠️ ووُجدت لأنّ الاكتشاف كان يفحص `IS_SYSTEM` وحدها في أربعة مواضع،
 * فكلُّ حارسٍ جديدٍ يُضاف إلى `matches` لا يصل إليه. والحارسان يسألان
 * نفس السؤال على طرفي المسار.
 *
 * وتُعيد **سبب** الرفض لا `true`: صفحةُ الإدارة تعدّ المرفوض وتشرحه،
 * ورقمٌ بلا سبب لا يُراجَع.
 */
export const notPartReason = (title: string): string | null => {
  const t = String(title || '');
  if (IS_SYSTEM.test(t)) return 'جهازٌ كامل لا قطعة';
  if (IS_BUNDLE.test(t)) return 'حزمةُ قطعتين لا قطعة';
  if (IS_LAPTOP.test(t)) return 'محمولٌ لا قطعة';
  return null;
};

/**
 * ألوانُ الطراز — نسخةٌ بلونٍ آخر رمزٌ آخر وسعرٌ آخر.
 *
 * ⚠️ قِيس: «ASUS ROG Astral **Dhahab** GeForce RTX 5090 … باللون الذهبي»
 * قُبل لقطعتنا العاديّة. وكان الفحص للأبيض وحده، وهذه تُكمله.
 *
 * ⚠️ وتُفحص باتّجاهين: أسماؤنا فيها ICE وSNOW فعلاً (5070 EAGLE OC ICE ·
 * Y70 Snow White)، فاشتراطُ الغياب يرفض الصحيح.
 */
const COLORWAY = /\b(WHITE|SNOW|ICE|DHAHAB|GOLD EDITION)\b|أبيض|الذهبي|ذهبيّ?ة?/gi;
const colorsOf = (s: string): string =>
  [...new Set((s.match(COLORWAY) ?? []).map((v) => v.toUpperCase().replace('الذهبي', 'DHAHAB').replace(/ذهبيّ?ة?/, 'DHAHAB')))]
    .sort().join(',');

/**
 * لواحقُ الطراز القصيرة — وهي أخطرُ ما يُفلت.
 *
 * ⚠️ فـ`models` لا تلتقط إلّا ما فيه رقم، و`words` لا تلتقط إلّا ثلاثة أحرفٍ
 * فأكثر. فـ«Ti» و«XT» **لا تُريان إطلاقاً**: قُبل «RTX 3080 10GB GamingPro»
 * مرشَّحاً لـ«RTX 3080 **Ti**» — كرتان بينهما فرقُ فئةٍ كاملة وسعرٍ كبير.
 *
 * ⚠️ والمقارنة **باتّجاهين**: لا يكفي أن نشترط لاحقتنا في المرشّح، بل يجب
 * أن تتساوى المجموعتان — وإلّا قَبِلنا «3080 Ti» لقطعتنا «3080»، فعرضنا
 * سعر كرتٍ أغلى على كرتٍ أرخص.
 */
/* ⚠️ و«LC» منها: قِيس على «ROG Astral **LC** RTX 5090» فقُبل له الكرتُ
   الهوائيّ العاديّ — والتبريد المائيّ رمزٌ آخر وسعرٌ آخر. */
const VARIANT = /\b(TI|XTX|XT|GRE|SUPER|GTS?|SE|LE|LC)\b/gi;
const variantsOf = (s: string): string =>
  [...new Set((s.match(VARIANT) ?? []).map((v) => v.toUpperCase()))].sort().join(',');

/**
 * جيلُ الذاكرة — يفصل لوحتين اسمُهما واحدٌ تقريباً.
 *
 * ⚠️ قِيس: «Gigabyte **H610M H DDR4**» قُبل له «GIGABYTE **H610M D3W** WIFI6
 * … 2x **DDR5** DIMM» — لوحتان مختلفتان لا تقبلان نفس الذاكرة أصلاً. وما
 * يفرّقهما في اسمنا حرفٌ واحد («H») لا تراه `models` ولا `words`.
 */
const DDR = /\bDDR([345])\b/gi;
const ddrOf = (s: string): string =>
  [...new Set((s.match(DDR) ?? []).map((v) => v.toUpperCase()))].sort().join(',');

/**
 * رقمُ المراجعة — «V2» نسخةٌ ثانيةٌ لا نفس المنتج.
 *
 * ⚠️ قِيس: «Corsair **4000D Airflow**» قُبل له «CORSAIR iCUE 4000D RGB
 * AIRFLOW **V2**» — مراجعةٌ ثانية بسعرٍ آخر. والمقارنة باتّجاهين: أسماؤنا
 * نفسُها فيها V2 أحياناً (LE360 V2 · Aura GL240 V2)، فاشتراطُ الغياب يرفض
 * الصحيح كما يرفض الخاطئ.
 */
const REV = /\b(V[2-9]|MK\s?[2-9]|REV\.?\s?[2-9])\b/gi;
const revOf = (s: string): string =>
  [...new Set((s.match(REV) ?? []).map((v) => v.toUpperCase().replace(/[\s.]/g, '')))].sort().join(',');

/** يُجرَّد الاسم من الوحدات كي تبقى كلماتُ الطراز وحدها */
const stripUnits = (name: string) =>
  name
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b\d+(\.\d+)?\s*(GB|TB|MB)\b/gi, ' ')
    .replace(/\b\d{3,5}\s*MHZ\b/gi, ' ')
    /* ⚠️ «DDR5-5600» قبل «DDR5»: الترتيب معكوساً يحذف «DDR5» ويترك «-5600»
       رقماً عارياً — وهو بالضبط ما جعل معالج «Ryzen 5 5600» يطابق عنوان
       «Ryzen 7 9700X … DDR5-5600 ECC». */
    .replace(/\bDDR[345][-\s]?\d{4,5}\b/gi, ' ')
    .replace(/\bDDR[345]\b/gi, ' ')
    .replace(/\bCL\d{2}\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * سؤال المتجر: اسم العائلة وحده.
 *
 * ⚠️ بحث مايكرولس يشترط **كل** الكلمات، فالاسم الكامل يخنقه:
 *   «Corsair Vengeance DDR5 32GB» → 4 نتائج أوّلها ذاكرةُ لابتوب
 *   «Vengeance LPX»               → 27 نتيجة أوّلها المطابقُ حرفياً
 * فالسؤال واسعٌ والتصفية ضيّقة، لا العكس.
 */
export const queryFor = (name: string): string => {
  const cleaned = stripUnits(name).replace(/\b(WHITE|BLACK)\b/gi, ' ').replace(/\s+/g, ' ').trim();
  const words = cleaned.split(' ').filter(Boolean).slice(0, 3).join(' ');
  return (words || name).trim();
};

/** توحيد أسماء المقاسات كما تكتبها المتاجر */
export const formFactorOf = (title: string): string | null => {
  const t = title.toUpperCase();
  if (/\bMINI[\s-]?ITX\b/.test(t)) return 'MINI-ITX';
  if (/\b(MICRO[\s-]?ATX|MATX|M-ATX)\b/.test(t)) return 'MICRO-ATX';
  if (/\bE[\s-]?ATX\b/.test(t)) return 'E-ATX';
  if (/\bATX\b/.test(t)) return 'ATX';
  return null;
};

export type Fingerprint = {
  brand: string;
  /** الاسم كما هو — تُقرأ منه لواحقُ الطراز القصيرة التي لا تلتقطها `models` */
  name: string;
  /** جيل الذاكرة من المواصفات (DDR4/DDR5) — الاسم لا يذكره دائماً */
  ramType: string | null;
  capacityGb: number;
  models: string[];   // رموزٌ فيها رقم: 9950X · B650 · SSR-650FM · GL240
  words: string[];    // كلماتٌ مميّزة بلا رقم: GRE · HERO · AORUS
  formFactor: string | null;
  white: boolean;
  /* ⚠️ ثلاث سماتٍ تفرّق نسخاً متطابقة الاسم: طقم DDR5 بسرعة 6400 ليس طقم
     6000، ومزوّد Gold ليس Platinum، والنسخة المضيئة ليست غيرها. وكلّها
     وقعت فعلاً: قُبل «Fury Beast Black RGB» لطقمنا غير المضيء، و«ROG Strix
     1200W Gold» لمزوّدنا البلاتينيّ. */
  speedMts: number | null;
  psuRating: string | null;
  rgb: boolean | null;
  query: string;
};

/** يستخرج ما لا يجوز أن يختلف بين قطعتنا والمرشّح */
export function fingerprint(brand: string, name: string, specs: any): Fingerprint {
  const stripped = stripUnits(name);
  const full = `${brand} ${name}`;

  const rawModels: string[] = stripped.match(/[A-Za-z]*\d[A-Za-z0-9-]*/g) ?? [];
  const models = [...new Set(rawModels.filter((t) => t.length >= 2).map((t) => t.toUpperCase()))];

  const rawWords: string[] = stripped.toUpperCase().match(/[A-Z]{3,}/g) ?? [];
  const words = [...new Set(rawWords.filter((w) => !GENERIC.has(w)))];

  const rating = String(specs?.rating ?? '').match(/titanium|platinum|gold|silver|bronze/i);
  const rgbSpec = String(specs?.rgb ?? '').trim();

  return {
    brand: norm(brand),
    name,
    /* اللوحة تسمّيه `ramType` والذاكرة تسمّيه `type` — كلاهما يُقرأ */
    ramType: String(specs?.ramType ?? specs?.type ?? '').trim() || null,
    capacityGb: capacityGb(specs?.capacity),
    speedMts: Number(String(specs?.speed ?? '').replace(/[^\d]/g, '')) || null,
    psuRating: rating ? rating[0].toLowerCase() : null,
    rgb: /^yes$/i.test(rgbSpec) ? true : /^no$/i.test(rgbSpec) ? false : null,
    models,
    words,
    formFactor: String(specs?.formFactor ?? '').trim().toUpperCase() || null,
    white: /WHITE/i.test(full),
    query: queryFor(name),
  };
}

/** هل المرشّح هو القطعة نفسها؟ */
export function matches(fp: Fingerprint, cand: string): Verdict {
  if (IS_SYSTEM.test(cand)) return { ok: false, why: 'جهازٌ كامل لا قطعة' };
  if (IS_ACCESSORY.test(cand)) return { ok: false, why: 'ملحقٌ للقطعة لا القطعة' };
  if (IS_BUNDLE.test(cand)) return { ok: false, why: 'حزمةُ قطعتين لا قطعة' };
  if (IS_LAPTOP.test(cand)) return { ok: false, why: 'محمولٌ لا قطعة' };

  /* ⚠️ لاحقةُ الطراز قبل كلّ شيء: «3080» و«3080 Ti» فئتان لا نسختان */
  const ourName = fp.name ?? '';
  const ourVar = variantsOf(ourName);
  const candVar = variantsOf(cand);
  if (ourVar !== candVar) {
    return { ok: false, why: `اللاحقة «${candVar || 'بلا'}» لا «${ourVar || 'بلا'}»` };
  }

  /* ⚠️ وجيلُ الذاكرة لا يُفحص إلّا حين يذكره **الطرفان**: عنوانٌ لا يذكره
     لا يُدان بجهلنا — وأغلب عناوين المتاجر لا تذكره. */
  const ourDdr = ddrOf(ourName + ' ' + (fp.ramType ?? ''));
  const candDdr = ddrOf(cand);
  if (ourDdr && candDdr && ourDdr !== candDdr) {
    return { ok: false, why: `الجيل ${candDdr} لا ${ourDdr}` };
  }

  const ourRev = revOf(ourName);
  const candRev = revOf(cand);
  if (ourRev !== candRev) {
    return { ok: false, why: `المراجعة «${candRev || 'بلا'}» لا «${ourRev || 'بلا'}»` };
  }

  const candWhite = /WHITE/i.test(cand);
  if (fp.white !== candWhite) {
    return { ok: false, why: fp.white ? 'قطعتنا بيضاء والمرشّح لا' : 'المرشّح أبيض وقطعتنا لا' };
  }

  /* ⚠️ وبقيّةُ ألوان الطراز بعد الأبيض: الذهبيّ والثلجيّ رموزٌ أخرى وأسعارٌ أخرى */
  const ourColors = colorsOf((fp.name ?? '') + ' ' + fp.brand);
  const candColors = colorsOf(cand);
  if (ourColors !== candColors) {
    return { ok: false, why: `اللون «${candColors || 'قياسيّ'}» لا «${ourColors || 'قياسيّ'}»` };
  }

  /* ⚠️ والمفتاح يُخفَّض: `norm` تُعيد الاسم بحروفٍ كبيرة، وجدولُنا صغيرة */
  if (!norm(cand).includes(fp.brand) && !BRAND_AR[fp.brand.toLowerCase()]?.test(cand)) {
    return { ok: false, why: 'شركةٌ أخرى' };
  }

  if (fp.capacityGb > 0) {
    /* ⚠️ وتُحذف سعة العصا الواحدة قبل القراءة: «32GB (2x16GB)» فيها رقمان،
       والثاني ليس سعة المنتج بل سعة قطعةٍ منه. وبلا هذا طابق طقمُنا
       **DDR4 16GB** طقمَ **DDR5 32GB (2x16GB)** — لأنّ «16» وردت فيه.
       والمقصود مقارنة المجموع بالمجموع. */
    const totals = cand.replace(/\(?\s*\d+\s*[xX]\s*\d+(?:\.\d+)?\s*(?:GB|TB)\s*\)?/gi, ' ');
    const found = [...totals.matchAll(/(\d+(?:\.\d+)?)\s*(TB|GB)\b/gi)].map((m) => capacityGb(`${m[1]}${m[2]}`));
    if (!found.some((v) => Math.abs(v - fp.capacityGb) < 0.5)) {
      return { ok: false, why: `السعة لا تطابق` };
    }
  }

  /* ⚠️ ويُجرَّد عنوان المرشّح من الوحدات قبل البحث عن الطراز، تماماً كما
     جُرّد اسمُنا عند بناء البصمة. وبلا ذلك يطابق رقمُ الطراز رقمَ **وحدةٍ**
     في وصف المرشّح: قيس على «Ryzen 5 5600» فقَبِل «Ryzen 7 9700X … DDR5-5600
     ECC» — سعرُ معالجٍ بـ١٬٢١٣ ريالاً على معالجٍ بـ٦٣٩.

     ويبقى فحص السعة على العنوان الخام: ذاك يحتاج «GB/TB» التي يحذفها التجريد. */
  const bare = stripUnits(cand);
  /* ⚠️ سرعة الذاكرة: «6000MT/s» و«6400Mhz» طقمان مختلفان باسمٍ واحد */
  if (fp.speedMts && fp.speedMts >= 2000) {
    const theirs = [...cand.matchAll(/(\d{4,5})\s*(?:MT\/s|MHz)/gi)].map((m) => Number(m[1]));
    if (theirs.length && !theirs.includes(fp.speedMts)) {
      return { ok: false, why: `السرعة ${theirs.join('/')} لا ${fp.speedMts}` };
    }
  }

  /* ⚠️ كفاءة المزوّد: «1200W Gold» ليس «1200W Platinum» */
  if (fp.psuRating) {
    const theirs = cand.match(/titanium|platinum|gold|silver|bronze/i);
    if (theirs && theirs[0].toLowerCase() !== fp.psuRating) {
      return { ok: false, why: `الكفاءة ${theirs[0]} لا ${fp.psuRating}` };
    }
  }

  /* ⚠️ الإضاءة: قطعتنا غير مضيئة والمرشّح يُعلن RGB صراحةً ⇒ نسخةٌ أخرى.
     والعكس لا يُدان: عنوانٌ لا يذكر RGB قد يكون مضيئاً ولم يُكتب. */
  if (fp.rgb === false && /\bA?RGB\b/i.test(cand)) {
    return { ok: false, why: 'المرشّح نسخةٌ مضيئة وقطعتنا ليست كذلك' };
  }

  for (const m of fp.models) if (!hasWord(bare, m)) return { ok: false, why: `ينقصه الطراز ${m}` };
  for (const w of fp.words) if (!hasWord(cand, w)) return { ok: false, why: `ينقصه «${w}»` };

  if (fp.formFactor) {
    const theirs = formFactorOf(cand);
    /* لا يُرفض على الجهل: صفحةٌ لا تذكر المقاس لا تُدين نفسها */
    if (theirs && theirs !== fp.formFactor) return { ok: false, why: `المقاس ${theirs} لا ${fp.formFactor}` };
  }

  return { ok: true, why: '' };
}

/** أفضل مرشّحٍ مطابق، مع سبب رفض الأقرب حين لا يوجد */
export function pick(fp: Fingerprint, cands: Candidate[]): { hit: Candidate | null; nearest: string | null } {
  for (const c of cands) if (matches(fp, c.title).ok) return { hit: c, nearest: null };
  return { hit: null, nearest: cands[0]?.title ?? null };
}
