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
  CPU: {
    compat: ['socket'],
    compare: ['cores', 'threads', 'baseClock', 'boostClock', 'l3Cache'],
    conditional: ['pCores', 'eCores', 'integratedGraphics', 'memorySupport'],
    undecided: ['architecture'],
  },
  GPU: {
    compat: ['lengthMm'],
    compare: ['vram', 'memoryType', 'memoryBus', 'interface', 'powerConnectors', 'ports'],
    conditional: ['formFactor', 'includedAio'],
    undecided: ['architecture'],
  },
  Motherboard: {
    compat: ['socket', 'ramType', 'formFactor'],
    compare: ['chipset', 'maxRam', 'memorySpeed', 'm2Slots', 'pcieVersion'],
    conditional: [],
    undecided: [],
  },
  RAM: {
    compat: ['type'],
    compare: ['capacity', 'speed', 'casLatency', 'profile', 'rgb'],
    conditional: ['kit'],
    undecided: ['color'],
  },
  Storage: {
    compat: [],
    compare: ['type', 'capacity', 'interface', 'formFactor', 'readSpeed', 'writeSpeed'],
    conditional: [],
    undecided: [],
  },
  PSU: {
    compat: ['wattage', 'formFactor'],
    compare: ['rating', 'modularity'],
    conditional: [],
    undecided: ['color'],
  },
  Case: {
    compat: ['formFactor', 'maxGpuLength', 'psuFormFactor'],
    compare: ['maxCoolerHeight', 'radiatorSupport', 'includedFans'],
    conditional: ['dualChamber', 'verticalGpu', 'pcieRiser', 'screen'],
    undecided: ['frontPanel', 'sidePanel', 'cableManagement', 'color'],
  },
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
