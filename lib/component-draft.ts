/* ============ مسودّة قطعةٍ من نتيجة بحث ============
 *
 * الطلب كان: «تنضاف الخصائص كاملة». والصادق أنّ **هذا غير ممكنٍ آليّاً**،
 * وقيس ذلك ولم يُفترَض:
 *
 *   • مايكرولس يبني جدول مواصفاته **في المتصفّح** — خادمُه يُعيد قائمة مدنٍ
 *     وتنقّلاً فقط (١٤٫٣ ألف حرفٍ بلا رقمٍ واحد من المواصفات).
 *   • إنفيني آرك يحمل JSON-LD غنيّاً، لكنه اسمٌ وسعرٌ وصورةٌ وتوفّر — لا
 *     مقبسٌ ولا ارتفاعُ مبرّدٍ ولا طولُ كرت.
 *   • أمازون عناوينه عربيّةٌ ومواصفاته في جدولٍ حرٍّ لا معياريّ.
 *
 * والمواصفات ليست زينة: `fit.ts` يبني عليها حكم التوافق. فقطعةٌ بمقبسٍ
 * مخترَع تكذب في الباني، وقطعةٌ بمقبسٍ فارغ تُقبل مع كل معالج.
 *
 * فالمسودّة تفعل ما يمكن فعله بصدق:
 *   ١) تستخرج من **العنوان** ما يحمله فعلاً (السعة، السرعة، المقاس…).
 *   ٢) تُعلّم كل حقلٍ: `read` قُرئ · `guess` استُنتج · `empty` عليك أنت.
 *   ٣) وتمنع الحفظ حتى تُملأ الحقول التي يقرؤها فاحص التوافق.
 *
 * فالأدمن لا يكتب من الصفر، ولا يُنشر شيءٌ مخترَع.
 */

/** الحقول التي لا تُحفظ القطعة بدونها — مقيسةٌ من الكتالوج القائم */
export const REQUIRED_SPECS: Record<string, string[]> = {
  CPU: ['socket', 'cores', 'threads', 'baseClock', 'boostClock', 'l3Cache', 'architecture', 'includedCooler'],
  Motherboard: ['socket', 'chipset', 'ramType', 'formFactor', 'maxRam', 'memorySpeed', 'm2Slots', 'pcieVersion'],
  RAM: ['type', 'capacity', 'speed', 'kit', 'casLatency', 'profile', 'rgb', 'heightMm'],
  GPU: ['vram', 'memoryType', 'memoryBus', 'interface', 'lengthMm', 'ports', 'powerConnectors', 'architecture'],
  Storage: ['type', 'capacity', 'interface', 'formFactor', 'readSpeed', 'writeSpeed'],
  PSU: ['wattage', 'rating', 'formFactor', 'modularity'],
  Case: ['formFactor', 'maxGpuLength', 'maxCoolerHeight', 'radiatorSupport', 'psuFormFactor', 'includedFans'],
  Cooler: ['type', 'sizeMm', 'sockets', 'fanSize', 'fanCount', 'rgb'],
};

/** فئاتٌ يُشترط فيها استهلاكٌ بالواط — الباني يجمعها لحساب المزوّد */
export const NEEDS_TDP = new Set(['CPU', 'GPU', 'Motherboard']);

export type FieldOrigin = 'read' | 'guess' | 'empty';

export type Draft = {
  category: string | null;
  brand: string;
  name: string;
  price: number | null;
  currency: string | null;
  url: string;
  imageUrl: string | null;
  storeSlug: string;
  tdpWattage: number;
  performanceTier: number;
  specs: Record<string, string>;
  description: string;
  origins: Record<string, FieldOrigin>;
  /** ما يمنع الحفظ الآن */
  missing: string[];
};

/* ============ التخمين ============ */

/* ⚠️ الترتيب يهمّ: «Cooler» قبل «Case» لأن «CPU Cooler Case» ليست صندوقاً،
   و«Motherboard» قبل «RAM» لأن وصف اللوحة يذكر الرام دائماً. */
/* ⚠️ والعربيّة في قائمةٍ منفصلة **بلا `\b`**: حدود الكلمات في جافاسكربت
 * تُبنى على `[A-Za-z0-9_]`، والحرف العربيّ ليس منها — فـ`\bمبرد\b` لا يطابق
 * شيئاً أبداً. قيس على عنوان أمازون «مبرد هواء وحدة المعالجة المركزية
 * 120 SE» فخرجت الفئة `null` وهي مبرّد. */
const CATEGORY_HINTS_AR: [string, RegExp][] = [
  ['Cooler', /مبرّ?د|تبريد/],
  ['GPU', /كرت شاشة|بطاقة رسوم|بطاقة شاشة/],
  ['CPU', /وحدة المعالجة المركزية|معالج مركزي/],
  ['Motherboard', /لوحة ?أم|اللوحة الأم|مذربورد/],
  ['RAM', /ذاكرة عشوائية|ذاكرة سطح المكتب/],
  ['Storage', /قرص صلب|وحدة تخزين|هارد/],
  ['PSU', /مزوّ?د طاقة|وحدة تغذية/],
  ['Case', /صندوق كمبيوتر|كيس كمبيوتر|هيكل كمبيوتر/],
];

const CATEGORY_HINTS: [string, RegExp][] = [
  ['Cooler', /\b(cpu (air )?cooler|heatsink|aio|liquid (freezer|cooler)|مبرّ?د|تبريد)\b/i],
  ['GPU', /\b(rtx|gtx|radeon rx|geforce|arc [ab]\d|graphics card|كرت شاشة|بطاقة رسوم)\b/i],
  ['CPU', /\b(ryzen \d|core i[3579]|core ultra|processor|معالج)\b/i],
  ['Motherboard', /\b(motherboard|mainboard|[abxzhb]\d{3}[a-z]?m?\b.*(wifi|gaming|tomahawk|aorus|prime|tuf)|لوحة ?أم|اللوحة الأم)\b/i],
  ['RAM', /\b(ddr[45]|dimm|memory kit|desktop memory|ذاكرة|رام)\b/i],
  ['Storage', /\b(ssd|nvme|m\.2|hdd|hard drive|قرص|تخزين)\b/i],
  ['PSU', /\b(power supply|psu|80\s*plus|80\+|مزود طاقة|مزوّد طاقة)\b/i],
  /* ⚠️ الشرطة والصيغ: «Mid-Tower» بشرطةٍ و«ATX Case» لم تطابقا أوّل صياغة
     (كانت «mid tower» بمسافةٍ و«computer case» فقط) — قيس على عنوان
     «Montech AIR 903 MAX Mid-Tower ATX Case» فخرجت الفئة null. */
  ['Case', /\b(mid[- ]?tower|full[- ]?tower|(computer|pc|atx|itx|tower)\s+case|case\s+(atx|mid|full))\b/i],
];

const BRANDS = [
  'Thermalright', 'Cooler Master', 'be quiet!', 'be quiet', 'DeepCool', 'Noctua', 'Arctic',
  'Corsair', 'Kingston', 'G.Skill', 'GSkill', 'TeamGroup', 'T-Force', 'Crucial', 'Lexar', 'ADATA', 'XPG',
  'Samsung', 'Western Digital', 'WD', 'Seagate', 'Sabrent', 'Silicon Power',
  'ASUS', 'Gigabyte', 'MSI', 'ASRock', 'NZXT', 'Lian Li', 'Phanteks', 'Fractal Design',
  'Montech', 'Thermaltake', 'HYTE', 'Antec', 'Seasonic', 'PNY', 'Zotac', 'Sapphire', 'XFX', 'Palit',
  'AMD', 'Intel', 'NVIDIA', 'Gamdias', 'Xigmatek',
];

export const guessCategory = (title: string): string | null =>
  CATEGORY_HINTS.find(([, re]) => re.test(title))?.[0]
  ?? CATEGORY_HINTS_AR.find(([, re]) => re.test(title))?.[0]
  ?? null;

/* ⚠️ صانعو الرقائق آخِراً: عنوانُ مبرّدٍ يذكر «AMD AM4/AM5» في دعم المقابس،
   فطابقت «AMD» وصارت ماركةَ المبرّد — قيس على عنوان أمازون حقيقيّ. فهؤلاء
   لا يُقبلون إلا إن لم تُطابق ماركةُ مصنّعٍ حقيقيّة. */
const CHIP_VENDORS = new Set(['AMD', 'Intel', 'NVIDIA']);

/** أسماءٌ عربية تكتبها المتاجر بالحروف العربية — أمازون السعودية خاصّةً */
const BRANDS_AR: [RegExp, string][] = [
  [/ثيرمال ?رايت|ثيرمالرايت/, 'Thermalright'],
  [/كولر ?ماستر/, 'Cooler Master'],
  [/ديب ?كول/, 'DeepCool'],
  [/كورسير|كورساير/, 'Corsair'],
  [/كينجستون|كينغستون/, 'Kingston'],
  [/سامسونج|سامسونغ/, 'Samsung'],
  [/جيجابايت|قيقابايت/, 'Gigabyte'],
  [/اسوس|أسوس/, 'ASUS'],
  [/نوكتوا/, 'Noctua'],
  [/سيجيت|سي ?جيت/, 'Seagate'],
];

export const guessBrand = (title: string): string => {
  const esc = (b: string) => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hits = BRANDS.filter((b) => new RegExp(`(^|[^a-z])${esc(b)}([^a-z]|$)`, 'i').test(title));
  const real = hits.find((b) => !CHIP_VENDORS.has(b));
  const ar = BRANDS_AR.find(([re]) => re.test(title))?.[1];
  const hit = real ?? ar ?? hits[0];
  return hit === 'be quiet' ? 'be quiet!' : hit === 'GSkill' ? 'G.Skill' : hit ?? '';
};

/* ============ ما يحمله العنوان فعلاً ============
 * كلُّ تعبيرٍ هنا يقرأ رقماً **مكتوباً في العنوان**، فلا يُخترع شيء. */

const grab = (t: string, re: RegExp, i = 1): string => (t.match(re) || [])[i] ?? '';

function specsFromTitle(cat: string, title: string): Record<string, string> {
  const t = title;
  const s: Record<string, string> = {};

  if (cat === 'RAM') {
    const type = grab(t, /\b(DDR[45])\b/i).toUpperCase();
    if (type) s.type = type;
    const cap = grab(t, /\b(\d{1,3})\s*GB\b/i);
    if (cap) s.capacity = cap + 'GB';
    const sp = grab(t, /\b(\d{4,5})\s*(?:MHz|MT\/s)\b/i);
    if (sp) s.speed = sp + 'MHz';
    const kit = t.match(/\((\d)\s*[xX]\s*(\d{1,3})\s*GB\)/);
    if (kit) s.kit = `${kit[1]}x${kit[2]}GB`;
    const cl = grab(t, /\bCL(\d{2})\b/i);
    if (cl) s.casLatency = 'CL' + cl;
    if (/\bRGB\b/i.test(t)) s.rgb = 'Yes';
  }

  if (cat === 'Storage') {
    const cap = grab(t, /\b(\d{3,4})\s*(GB|TB)\b/i) && t.match(/\b(\d{1,4})\s*(GB|TB)\b/i);
    if (cap) s.capacity = `${cap[1]}${cap[2].toUpperCase()}`;
    if (/\bNVMe\b/i.test(t)) s.type = 'NVMe M.2';
    else if (/\bSATA\b/i.test(t)) s.type = 'SATA SSD';
    else if (/\bHDD\b/i.test(t)) s.type = 'HDD';
    if (/\bM\.?2\s*2280\b/i.test(t)) s.formFactor = 'M.2 2280';
    else if (/\b2\.5["”]?\b/i.test(t)) s.formFactor = '2.5"';
    const gen = grab(t, /\bPCIe\s*(?:Gen\s*)?([345])(?:\.0)?\s*x?4?\b/i);
    if (gen) s.interface = `PCIe ${gen}.0 x4`;
    const read = grab(t, /(?:up to\s*)?([\d,]{3,5})\s*MB\/s/i);
    if (read) s.readSpeed = read.replace(/,/g, '') + ' MB/s';
  }

  if (cat === 'PSU') {
    const w = grab(t, /\b(\d{3,4})\s*W\b/i);
    if (w) s.wattage = w;
    const r = t.match(/80\s*\+?\s*(?:plus\s*)?(bronze|silver|gold|platinum|titanium)/i);
    if (r) s.rating = '80+ ' + r[1][0].toUpperCase() + r[1].slice(1).toLowerCase();
    if (/\bSFX\b/i.test(t)) s.formFactor = 'SFX';
    else if (/\bATX\s*3\.[01]\b/i.test(t)) s.formFactor = 'ATX 3.' + grab(t, /ATX\s*3\.([01])/i);
    else if (/\bATX\b/i.test(t)) s.formFactor = 'ATX';
    if (/full[- ]?modular/i.test(t)) s.modularity = 'Full';
    else if (/semi[- ]?modular/i.test(t)) s.modularity = 'Semi';
    else if (/non[- ]?modular/i.test(t)) s.modularity = 'Non-Modular';
  }

  if (cat === 'Cooler') {
    if (/\b(aio|liquid|water|رادييتر|تبريد مائي)\b/i.test(t)) s.type = 'AIO';
    else if (/\b(air cooler|tower|هوائي)\b/i.test(t)) s.type = 'Air';
    const rad = grab(t, /\b(120|240|280|360|420)\s*mm\b/i);
    if (rad && s.type === 'AIO') s.sizeMm = rad;
    const fan = grab(t, /\b(92|120|140)\s*mm\b/i);
    if (fan) s.fanSize = fan + 'mm';
    const n = t.match(/\b(\d)\s*[xX]\s*\d{2,3}\s*mm\b/);
    if (n) s.fanCount = n[1];
    s.rgb = /\b(a?rgb|argb)\b/i.test(t) ? 'Yes' : 'No';
  }

  if (cat === 'Case') {
    if (/mid[- ]?tower/i.test(t)) s.formFactor = 'Mid Tower';
    else if (/full[- ]?tower/i.test(t)) s.formFactor = 'Full Tower';
    else if (/mini[- ]?itx/i.test(t)) s.formFactor = 'Mini-ITX';
    else if (/micro[- ]?atx|m-?atx/i.test(t)) s.formFactor = 'Micro-ATX';
    const rad = grab(t, /up to\s*(\d{3})\s*mm\s*radiator/i) || grab(t, /(\d{3})\s*mm\s*radiator/i);
    if (rad) s.radiatorSupport = rad + 'mm';
    if (/\bATX\b/i.test(t)) s.psuFormFactor = 'ATX';
  }

  if (cat === 'GPU') {
    const v = grab(t, /\b(\d{1,2})\s*GB\b/i);
    if (v) s.vram = v + 'GB';
    const mt = grab(t, /\b(GDDR[567]X?)\b/i);
    if (mt) s.memoryType = mt.toUpperCase();
    if (/\bPCIe\s*5/i.test(t)) s.interface = 'PCIe 5.0 x16';
    else if (/\bPCIe\s*4/i.test(t)) s.interface = 'PCIe 4.0 x16';
  }

  if (cat === 'Motherboard') {
    const cs = grab(t, /\b([ABXZH]\d{3}E?)\b/i);
    if (cs) s.chipset = cs.toUpperCase();
    if (/\bDDR5\b/i.test(t)) s.ramType = 'DDR5';
    else if (/\bDDR4\b/i.test(t)) s.ramType = 'DDR4';
    if (/\bITX\b/i.test(t)) s.formFactor = 'Mini-ITX';
    else if (/\bM-?ATX\b|micro[- ]?atx/i.test(t)) s.formFactor = 'Micro-ATX';
    else if (/\bE-?ATX\b/i.test(t)) s.formFactor = 'E-ATX';
    else if (/\bATX\b/i.test(t)) s.formFactor = 'ATX';
  }

  if (cat === 'CPU') {
    const c = grab(t, /\b(\d{1,2})[- ]?cores?\b/i);
    if (c) s.cores = c;
    const th = grab(t, /\b(\d{1,2})[- ]?threads?\b/i);
    if (th) s.threads = th;
    if (/\bAM5\b/i.test(t)) s.socket = 'AM5';
    else if (/\bAM4\b/i.test(t)) s.socket = 'AM4';
    else if (/\bLGA\s*1851\b/i.test(t)) s.socket = 'LGA1851';
    else if (/\bLGA\s*1700\b/i.test(t)) s.socket = 'LGA1700';
  }

  return s;
}

/** اسمٌ نظيف: تُنزع الماركة والزوائد التسويقية من أوّل العنوان */
function cleanName(title: string, brand: string): string {
  let n = title;
  if (brand) n = n.replace(new RegExp(`^\\s*${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'), '');
  /* ما بعد أوّل فاصلةٍ وصفٌ لا اسم — «RTX 5070 Ti, Dual Tower, 6x6mm…» */
  n = n.split(/[,|]/)[0];
  return n.replace(/\s+/g, ' ').trim().slice(0, 90);
}

export function buildDraft(input: {
  title: string; url: string; price: number | null; currency: string | null;
  image: string | null; storeSlug: string; category?: string | null;
}): Draft {
  const category = input.category ?? guessCategory(input.title);
  const brand = guessBrand(input.title);
  const name = cleanName(input.title, brand);

  const specs: Record<string, string> = {};
  const origins: Record<string, FieldOrigin> = {};

  origins.name = name ? 'guess' : 'empty';
  origins.brand = brand ? 'guess' : 'empty';
  origins.category = category ? 'guess' : 'empty';
  origins.price = input.price != null ? 'read' : 'empty';
  origins.imageUrl = input.image ? 'read' : 'empty';

  if (category) {
    const fromTitle = specsFromTitle(category, input.title);
    for (const k of REQUIRED_SPECS[category] ?? []) {
      specs[k] = fromTitle[k] ?? '';
      origins['specs.' + k] = fromTitle[k] ? 'guess' : 'empty';
    }
  }

  const missing: string[] = [];
  if (!category) missing.push('الفئة');
  if (!brand) missing.push('الماركة');
  if (!name) missing.push('الاسم');
  if (input.price == null) missing.push('السعر');
  if (category) {
    for (const k of REQUIRED_SPECS[category] ?? []) if (!specs[k]) missing.push(k);
  }

  return {
    category, brand, name,
    price: input.price, currency: input.currency,
    url: input.url, imageUrl: input.image, storeSlug: input.storeSlug,
    tdpWattage: 0,
    performanceTier: 3,
    specs,
    description: '',
    origins,
    missing,
  };
}

/** يُعاد حسابه بعد كل تعديلٍ من الأدمن — الحفظ لا يُفتح إلا حين يفرغ */
export function missingOf(d: {
  category: string | null; brand: string; name: string; price: number | null;
  specs: Record<string, string>; tdpWattage: number;
}): string[] {
  const out: string[] = [];
  if (!d.category) out.push('الفئة');
  if (!d.brand?.trim()) out.push('الماركة');
  if (!d.name?.trim()) out.push('الاسم');
  if (d.price == null || !(d.price > 0)) out.push('السعر');
  if (d.category) {
    for (const k of REQUIRED_SPECS[d.category] ?? []) if (!String(d.specs?.[k] ?? '').trim()) out.push(k);
    /* ⚠️ الاستهلاك ليس تجميلاً: الباني يجمعه ليقترح مزوّداً. وصفرٌ في معالجٍ
       أو كرتٍ يعني تجميعةً تُقترح لها ٤٥٠ واط وهي تحتاج ٧٠٠. */
    if (NEEDS_TDP.has(d.category) && !(d.tdpWattage > 0)) out.push('الاستهلاك (واط)');
  }
  return out;
}
