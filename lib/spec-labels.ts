/**
 * ============ تسميات المواصفات المعروضة ============
 *
 * توحيد المفاتيح جعلها camelCase — وهو ما يحتاجه الكود، لا ما يقرؤه الزائر.
 * وقبل هذا الملف كان جدول المواصفات يعرض المفتاح الخام، فصار الزائر يقرأ
 * «lengthMm» و«powerConnectors» بعد أن كان يقرأ «Memory Bus» و«VRAM».
 *
 * القاعدة: **المفتاح للكود، والتسمية للإنسان.** فأي مفتاح جديد يعمل بلا
 * تسجيله هنا (يظهر كما هو)، لكن تسجيله يجعله عربياً مقروءاً.
 */

const LABELS: Record<string, string> = {
  // مشتركة
  formFactor: 'الحجم',
  interface: 'الواجهة',
  type: 'النوع',
  capacity: 'السعة',
  architecture: 'المعمارية',
  color: 'اللون',

  // المعالج
  socket: 'المقبس',
  cores: 'الأنوية',
  threads: 'المسارات',
  baseClock: 'التردد الأساسي',
  boostClock: 'التردد الأقصى',
  l3Cache: 'ذاكرة L3',
  pCores: 'أنوية الأداء',
  eCores: 'أنوية الكفاءة',
  integratedGraphics: 'رسوميات مدمجة',
  memorySupport: 'الرام المدعوم',

  // كرت الشاشة
  vram: 'ذاكرة الكرت',
  memoryType: 'نوع الذاكرة',
  memoryBus: 'ناقل الذاكرة',
  lengthMm: 'الطول',
  powerConnectors: 'موصّلات الطاقة',
  ports: 'المنافذ',
  /* ⚠️ كان اسمه `radiatorSupport` — وهو مفتاح **الكيس**، استُعير لكرتٍ
     واحد فيه تبريدٌ مائي مدمج (ROG Astral LC). المعلومة صحيحة والمفتاح
     خاطئ: يوم تدخل فئة المبرّدات سيحمل الاسم الواحد معنيين متناقضين —
     «الكيس يقبل راديتر ٣٦٠» و«الكرت يأتي براديتر ٣٦٠». */
  includedAio: 'تبريد مائي مرفق',

  // اللوحة الأم
  chipset: 'الشيبست',
  ramType: 'نوع الرام',
  maxRam: 'أقصى رام',
  memorySpeed: 'سرعة الرام',
  m2Slots: 'فتحات M.2',
  pcieVersion: 'إصدار PCIe',

  // الرام
  speed: 'السرعة',
  kit: 'الطقم',
  casLatency: 'زمن الاستجابة',
  profile: 'البروفايل',
  rgb: 'إضاءة RGB',

  // التخزين
  readSpeed: 'سرعة القراءة',
  writeSpeed: 'سرعة الكتابة',

  // المزوّد
  wattage: 'القدرة',
  rating: 'شهادة الكفاءة',
  modularity: 'الكابلات',

  /* ============ الصندوق ============
   *
   * ⚠️ كانت هنا تسعُ تسمياتٍ أُسقطت: design وairflow وglass وhandles
   * وstorage وmodular وcoolingModes وacoustics وorientation.
   *
   * سببها أن الكيس بلغ **٢٢ مفتاحاً وشاملَين اثنين** — أسوأ فئةٍ انضباطاً
   * في الكتالوج (التخزين ٦ مفاتيح كلّها شاملة). وثمانيةٌ منها على قطعةٍ
   * واحدة في الكتالوج كلّه، فجدول `/compare` كان يعرض قائمتين متجاورتين
   * لا مقارنة: ستّة صفوف من ثمانية نصفها فارغ.
   *
   * وقبل الحذف فُحص وصفُ كل قطعة: سبعٌ من عشر قيمٍ يتيمة كانت مذكورةً في
   * الوصف بجملةٍ أوضح من المفتاح، والثلاث الباقية نُقلت إليه.
   * راجع scripts/tidy-case-specs.ts — فيه سبب كل حذفٍ مفرداً.
   */
  maxGpuLength: 'أقصى طول كرت',
  /* ⚠️ كان بلا تسمية رغم أنه **مفتاح توافق** يقرؤه psuFitsCase — فيظهر
     في الجدول بالإنجليزية عبر humanize: «Psu Form Factor». */
  psuFormFactor: 'مقاس المزوّد المقبول',
  /* حقلٌ جديد مُلئ للسبعة والعشرين كلّها — ولا يقرؤه محرّك التوافق بعد.
     هو الشرط الذي كانت تنتظره فئة المبرّدات: مبرّدٌ هوائي أطول من هذا
     الرقم لا يُغلق اللوح الجانبي. */
  maxCoolerHeight: 'أقصى ارتفاع مبرّد',
  includedFans: 'المراوح المرفقة',
  radiatorSupport: 'دعم الرادييتر',
  sidePanel: 'اللوح الجانبي',
  frontPanel: 'الواجهة الأمامية',
  cableManagement: 'تنظيم الكابلات',
  verticalGpu: 'تركيب عمودي للكرت',
  dualChamber: 'حجرتان',
  pcieRiser: 'كابل رايزر',
  screen: 'شاشة',
};

/** camelCase → «كلمتان» حين لا توجد تسمية مسجّلة — أفضل من عرض المفتاح خاماً */
const humanize = (key: string): string =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (ch) => ch.toUpperCase());

export const specLabel = (key: string): string => LABELS[key] ?? humanize(key);

/* ============ بحثٌ متساهل عن التسمية ============
 *
 * صفحة المقارنة كانت تحمل **نسخةً ثانية** من خريطة التسميات، وفيها مرادفات
 * للمفتاح الواحد (`performanceCores` و`pCores`، و`gpuMount` و`verticalGpu`).
 * وحين وُحّدت الخريطتان لزم ألّا تضيع تلك التساهلية: مفتاحٌ بحالة أحرفٍ
 * مختلفة أو بشرطةٍ زائدة يجب أن يجد تسميته لا أن يظهر بالإنجليزية.
 *
 * فالبحث: تطابقٌ تامّ أوّلاً، ثم تطابقٌ بعد تجريد الفواصل وحالة الأحرف.
 */
const normKey = (k: string) => k.toLowerCase().replace(/[\s_-]/g, '');

const NORMALIZED: Record<string, string> = Object.fromEntries(
  Object.entries(LABELS).map(([k, v]) => [normKey(k), v]),
);

export const specLabelLoose = (key: string): string =>
  LABELS[key] ?? NORMALIZED[normKey(key)] ?? humanize(key);

/* ============ ترتيب العرض ============
 *
 * ⚠️ لماذا هنا لا في القاعدة: عمود specs من نوع Json، وPostgres يخزّنه
 * jsonb — وjsonb **يعيد ترتيب المفاتيح بطول الاسم ثم أبجدياً** ويتجاهل
 * ترتيب الإدخال. فأي ترتيب نكتبه عند الحفظ يضيع، والجدول يظهر مرتّباً
 * بطول اسم المفتاح: vram ثم ports ثم lengthMm — ترتيبٌ بلا معنى للقارئ.
 *
 * فالترتيب يُفرض وقت العرض: ما يقرّر التوافق أولاً (المقبس، الطول، السعة)
 * ثم الأداء ثم الوصفي. وما ليس في القائمة يُلحق بآخرها كما هو.
 */
const ORDER: Record<string, string[]> = {
  CPU: ['socket', 'cores', 'threads', 'baseClock', 'boostClock', 'l3Cache', 'pCores', 'eCores', 'integratedGraphics', 'memorySupport', 'architecture'],
  GPU: ['vram', 'memoryType', 'memoryBus', 'lengthMm', 'powerConnectors', 'interface', 'ports', 'architecture', 'formFactor', 'includedAio'],
  Motherboard: ['socket', 'chipset', 'formFactor', 'ramType', 'maxRam', 'memorySpeed', 'm2Slots', 'pcieVersion'],
  RAM: ['type', 'capacity', 'kit', 'speed', 'casLatency', 'profile', 'rgb', 'color'],
  Storage: ['type', 'capacity', 'interface', 'formFactor', 'readSpeed', 'writeSpeed'],
  PSU: ['wattage', 'rating', 'modularity', 'formFactor'],
  Case: ['formFactor', 'maxGpuLength', 'maxCoolerHeight', 'radiatorSupport', 'psuFormFactor', 'includedFans', 'frontPanel', 'sidePanel', 'dualChamber', 'verticalGpu', 'pcieRiser', 'cableManagement', 'screen', 'color'],
};

/* ============ الوحدات ============
 *
 * القاعدة كانت حشو الوحدة في التسمية: «الطول (مم)» والقيمة «303». فيقرأ
 * الزائر رقماً عارياً ويعود بعينه إلى التسمية ليعرف وحدته. الوحدة تلتصق
 * بالرقم — «303 مم» — وتُرسم أخفت منه لأنها ثابتة والرقم هو المتغيّر.
 */
const UNITS: Record<string, string> = {
  lengthMm: 'مم',
  maxGpuLength: 'مم',
  maxCoolerHeight: 'مم',
  wattage: 'واط',
  speed: 'MT/s',
};

export const specUnit = (key: string): string | undefined => UNITS[key];

/* قيم إنجليزية مفردة يقرؤها العربي أسرع مترجمة. المطابقة تامّة عمداً:
   الترجمة الجزئية تُفسد قيماً مركّبة مثل «High Airflow Mesh». */
const VALUE_LABELS: Record<string, string> = {
  Yes: 'نعم',
  No: 'لا',
  None: 'لا يوجد',
  Included: 'مرفق',
  Supported: 'مدعوم',
  Full: 'كاملة الفكّ',
  'Semi-Modular': 'نصف قابلة للفكّ',
  'Non-Modular': 'غير قابلة للفكّ',
};

/**
 * القيمة مقسّمة لسطور ووحدة.
 *
 * المنافذ تُخزَّن سطراً واحداً: «1x HDMI 2.1, 3x DP 2.1» — وهي في الحقيقة
 * قائمة، فتُعرض قائمةً. القيم القصيرة تبقى سطراً واحداً مهما فيها فواصل.
 */
export function specValueLines(key: string, value: unknown): { lines: string[]; unit?: string } {
  const raw = String(value ?? '').trim();
  const translated = VALUE_LABELS[raw];
  if (translated) return { lines: [translated] };

  const segments = raw.split(/,\s*/).filter(Boolean);
  const lines = segments.length > 1 && raw.length > 16 ? segments : [raw];
  return { lines, unit: UNITS[key] };
}

/* ============ المفاتيح التي يقرأها محرّك التوافق ============
 *
 * ليست «أهمّ المواصفات» بالرأي — بل ما تقارنه دوالّ الفحص فعلاً في
 * PCBuilderClient. فوسمها في الجدول وعدٌ يمكن التحقّق منه: تغييرُ هذا
 * الرقم يغيّر نتيجة الفحص. أي وسمٍ لمفتاح لا يقرؤه المحرّك يكون كذباً
 * مهذّباً، فليبقَ الاثنان متطابقين.
 */
const COMPAT_KEYS: Record<string, string[]> = {
  CPU: ['socket'],
  Motherboard: ['socket', 'ramType'],
  RAM: ['type'],
  GPU: ['lengthMm'],
  /* `psuFormFactor` يقرؤه `psuFitsCase` فعلاً — وكان غائباً عن هذه القائمة
     لأنه كان مسجّلاً على أربعة كيسات فقط، فوسمُه وعدٌ لا يُوفى. وقد صار
     على السبعة والعشرين.
     و`maxCoolerHeight` **لا يُوسم بعد**: لا سطر يقرؤه حتى تدخل المبرّدات،
     ووسمُ ما لا يُفحص كذبٌ مهذّب. */
  Case: ['maxGpuLength', 'psuFormFactor'],
  PSU: ['wattage'],
};

export const isCompatKey = (categoryName: string | null | undefined, key: string): boolean =>
  (COMPAT_KEYS[categoryName || ''] || []).includes(key);

/* ============ الثلاث التي تُعرّف القطعة ============
 *
 * قائمةٌ مسطّحة تُعطي «المعمارية» وزنَ «الطول»، والزائر لا يقرأ ثمانية
 * أسطر ليصل إلى الثلاثة التي تهمّه. فتُرفَع ثلاثٌ إلى شريط علوي.
 *
 * المعيار: ما يقرّر الشراء. مفتاحُ التوافق أولاً حيث وُجد (المقبس، الطول،
 * القدرة)، ثم الحجم، ثم السرعة. وقيمها قصيرة عمداً — الشريط يعرضها
 * كبيرةً، والقيمة الطويلة تُصغّر البطاقات الثلاث معاً.
 */
const HERO: Record<string, string[]> = {
  CPU: ['socket', 'cores', 'boostClock', 'threads', 'l3Cache'],
  GPU: ['vram', 'lengthMm', 'memoryBus', 'memoryType'],
  Motherboard: ['socket', 'chipset', 'formFactor', 'ramType'],
  RAM: ['capacity', 'type', 'speed', 'kit'],
  Storage: ['capacity', 'type', 'readSpeed', 'interface'],
  PSU: ['wattage', 'rating', 'modularity', 'formFactor'],
  Case: ['formFactor', 'maxGpuLength', 'radiatorSupport', 'includedFans', 'sidePanel'],
};

/**
 * ثلاثة مفاتيح موجودة فعلاً في القطعة — أو لا شيء.
 *
 * «أو لا شيء» مقصودة: شريطٌ ببطاقتين يبدو ناقصاً لا مختصراً.
 *
 * والقائمة **تفضيلٌ مرتَّب لا شرط**: تُؤخذ أوّل ثلاثٍ متوفّرة منها. كانت
 * تشترط الثلاثة الأولى بأعيانها، فسقط الشريط عن أي كيسٍ بلا `includedFans`
 * — وهو مفتاح نادر (تسع قطع) — رغم أن الكيس يحمل ستّ مواصفات. فالقاعدة
 * الآن: من كان عنده ما يُبرَز أُبرِز، بترتيب ما يقرّر الشراء.
 */
export function heroKeys(categoryName: string | null | undefined, present: string[]): string[] {
  const picked = (HERO[categoryName || ''] || []).filter((k) => present.includes(k));
  return picked.length >= 3 ? picked.slice(0, 3) : [];
}

/** أزواج [مفتاح، قيمة] بترتيب العرض المعتمد للفئة */
export function sortedSpecs(
  categoryName: string | null | undefined,
  specs: Record<string, unknown>,
): [string, unknown][] {
  const order = ORDER[categoryName || ''] || [];
  const rank = (k: string) => {
    const i = order.indexOf(k);
    return i === -1 ? order.length : i;
  };
  return Object.entries(specs || {}).sort((a, b) => {
    const d = rank(a[0]) - rank(b[0]);
    // المفاتيح غير المذكورة تبقى بترتيبها بينها، فلا تقفز عشوائياً
    return d !== 0 ? d : 0;
  });
}
