/**
 * ============ ما الذي يجب أن تحمله كل قطعة؟ ============
 *
 * الكتالوج نما بلا عقدٍ مكتوب، فتفاوتت الفئات تفاوتاً حاداً:
 *
 *   التخزين  ٤٢ قطعة ·  ٦ مفاتيح · **٦ شاملة**   ← النموذج
 *   الكيس    ٢٧ قطعة · ٢٢ مفتاحاً · **٢ شاملان**  ← وثمانيةٌ على قطعةٍ واحدة
 *
 * والنتيجة أن جدول المقارنة يعرض قائمتين متجاورتين لا مقارنة. فهذا الملف
 * هو العقد: ما تلتزم به كل فئة، وما يبقى حرّاً.
 *
 * ============ المعيار: «هل تُقارَن؟» لا «هل مهمّة؟» ============
 *
 * الأخير ذوقيّ يُتجادل فيه كل مرّة. والأوّل يُحسم بسؤال: هل تملك كل قطعتين
 * في الفئة قيمةً لها، بنفس الوحدة، تجيب سؤالاً يسأله المفاضِل؟
 *
 *   maxCoolerHeight  ← كل كيس يملكه، بالمليمتر، ويجيب «هل يدخل مبرّدي؟»
 *   screen           ← كيسٌ واحد يملكه. عرضه يعطي «14.1 بوصة / — / —»
 *                      وهذا **إعلانٌ لا مقارنة**.
 *
 * ============ الطبقات الأربع ============
 *
 *   compat      إلزامي ويُرفض ما دونه — خطأٌ فيه يبني تجميعةً لا تُركَّب.
 *               ⚠️ وفراغه ليس حياداً: `psuFormFactor` فارغاً يعني للمحرّك
 *               «اقبل كل مزوّد»، فالنقص هنا يغيّر سلوك الفحص لا العرض.
 *   compare     إلزامي، يظهر في الجدول والمقارنة.
 *   conditional إلزامي **إن انطبق** — أنوية الكفاءة لمعالجات إنتل الهجينة
 *               وحدها، وفراغها عند AMD يعني «لا يوجد» وهو خبرٌ مفيد.
 *   (المزايا)   ما ليس في القوائم أعلاه: حرٌّ، ويظهر في صفحة القطعة فقط.
 *
 * ⚠️ الرمادية موسومة بـ`undecided` — لم تُحسم بعد، والمسح يعدّها ولا يطالب بها.
 */

export type CategorySchema = {
  compat: string[];
  compare: string[];
  conditional: string[];
  /** قيد القرار: تُقاس ولا تُفرض حتى نحسمها */
  undecided: string[];
};

export const SPEC_SCHEMA: Record<string, CategorySchema> = {
  /* المعالج — المقبس وحده يقرؤه المحرّك. وذاكرة L3 في المقارنة لأنها
     الفارق الحاسم في الألعاب (سلسلة X3D قائمة عليها). */
  CPU: {
    compat: ['socket'],
    compare: ['cores', 'threads', 'baseClock', 'boostClock', 'l3Cache', 'architecture'],
    conditional: ['pCores', 'eCores', 'integratedGraphics', 'memorySupport'],
    undecided: [],
  },

  /* الكرت — الطول يقرؤه المحرّك (يدخل الكيس أو لا).
     ⚠️ formFactor هنا مشروط لا إلزامي: قيمته «Low Profile» أو «2.5 Slot»
     أي أنها تصف الشاذّ لا القاعدة. وسُمك الكرت بالفتحات يستحقّ حقلاً
     مستقلّاً يوماً ما (كرتٌ بثلاث فتحات يحجب الفتحة تحته) — ولا قاعدة
     توافق تقرؤه اليوم، فلا يُفرض. */
  GPU: {
    compat: ['lengthMm'],
    compare: ['vram', 'memoryType', 'memoryBus', 'interface', 'powerConnectors', 'ports', 'architecture'],
    conditional: ['formFactor', 'includedAio'],
    undecided: [],
  },

  Motherboard: {
    compat: ['socket', 'ramType', 'formFactor'],
    compare: ['chipset', 'maxRam', 'memorySpeed', 'm2Slots', 'pcieVersion'],
    conditional: [],
    undecided: [],
  },

  /* الرام — `kit` رُفع إلى المقارنة: ٣٢ جيجابايت في شريحتين غير ٣٢ في
     واحدة (قناة مزدوجة)، وهو فرقٌ في الأداء لا في الشكل. */
  RAM: {
    compat: ['type'],
    compare: ['capacity', 'kit', 'speed', 'casLatency', 'profile', 'rgb'],
    conditional: ['color'],
    undecided: [],
  },

  /* التخزين — الفئة الوحيدة المكتملة أصلاً، وهي النموذج.
     ⚠️ `formFactor` مرشّحٌ ليصير مفتاح توافق: قرص 2.5 بوصة يحتاج منفذ
     SATA وخانةً في الكيس، وM.2 يحتاج فتحةً في اللوحة — ولا فحص لذلك بعد. */
  Storage: {
    compat: [],
    compare: ['type', 'capacity', 'interface', 'formFactor', 'readSpeed', 'writeSpeed'],
    conditional: [],
    undecided: [],
  },

  PSU: {
    compat: ['wattage', 'formFactor'],
    compare: ['rating', 'modularity'],
    conditional: ['color'],
    undecided: [],
  },

  /* الكيس — الثلاثة الأولى يقرؤها المحرّك.
     و`includedFans` تبقى في المقارنة **نصّاً يُقرأ بلا نجمة**: قيمتها
     مركّبة («2x 160mm + 1x 140mm») لا تُقارَن رقمياً، وعدُّ المراوح ليس
     مقياس تبريد أصلاً — مروحتا ١٦٠ تدفعان أكثر من أربع ١٢٠. */
  Case: {
    compat: ['formFactor', 'maxGpuLength', 'psuFormFactor'],
    compare: ['maxCoolerHeight', 'radiatorSupport', 'includedFans'],
    conditional: ['dualChamber', 'verticalGpu', 'pcieRiser', 'screen', 'color'],
    undecided: [],
  },
};

/* ============ ما نزل إلى «المزايا» ============
 *
 * ليست مفاتيح بعد اليوم — جُمَلٌ حرّة تظهر في صفحة القطعة وحدها:
 *
 *   frontPanel · sidePanel · cableManagement
 *
 * السبب واحد: تصف **مظهراً** لا بُعداً يُقاس. «Mesh» مقابل «Tempered Glass»
 * ليست أكبر ولا أصغر، و«RapidRoute» اسمٌ تجاريّ لا يعني شيئاً لمن لا يعرف
 * كورسير. وصفّها في المقارنة كان يمتلئ بالشرطات لأن سبعةً من ٢٧ تحمله.
 *
 * ============ `color` مشروط بقاعدة صريحة ============
 *
 * يُسجَّل **حين يكون غير الأسود**. جُرّب رفعه إلى المقارنة فتبيّن أن ثمنه
 * ٧٢ قيمة عبر ثلاث فئات، مقابل صفٍّ يقول «أسود / أسود» في أغلب الحالات.
 * وقيمته الحقيقية في **التصفية** لا المقارنة — والتصفية غير مبنيّة بعد.
 */

/* ============ المزايا ============
 *
 * كل ما ليس في الطبقات الأربع أعلاه يعيش هنا: قائمة **جُمَل** لا مفاتيح.
 *
 * ولماذا جُمَل: المفتاح يَعِد بالمقارنة ضمناً — فإن كتبنا `frontPanel` توقّع
 * الجدول صفّاً يقابله في كل قطعة، وسبعةٌ من ٢٧ تحمله فيمتلئ الصفّ بالشرطات.
 * والجملة لا تَعِد بشيء: تُقرأ حيث هي، ولا يُنتظر لها نظير.
 *
 * ⚠️ وهي المكان الذي يُغري بالفوضى: لو قبلت أزواج مفتاح/قيمة عدنا إلى
 * اثنين وعشرين مفتاحاً في دلوٍ آخر. فالنوع `string[]` عمداً — لا مفتاح
 * يُخترع، ولا توقّع بأنها تُقارَن.
 *
 * وتظهر في صفحة القطعة وحدها. و`isFeatureKey` هو الحارس: تستدعيه صفحة
 * المقارنة وجدول المواصفات ليُخرجاها من صفوفهما.
 */
export const FEATURES_KEY = 'features';

export const isFeatureKey = (key: string): boolean => key === FEATURES_KEY;

/** المزايا المسجّلة على قطعة — أو مصفوفة فارغة */
export const readFeatures = (specs: Record<string, unknown> | null | undefined): string[] => {
  const raw = specs?.[FEATURES_KEY];
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : [];
};

/** ما يُفرض فعلاً: التوافق والمقارنة. المشروطة والرمادية تُقاس ولا تُطالَب. */
export const requiredKeys = (category: string): string[] => {
  const s = SPEC_SCHEMA[category];
  return s ? [...s.compat, ...s.compare] : [];
};

export const allKnownKeys = (category: string): string[] => {
  const s = SPEC_SCHEMA[category];
  return s ? [...s.compat, ...s.compare, ...s.conditional, ...s.undecided] : [];
};
