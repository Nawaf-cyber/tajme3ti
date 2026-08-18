/**
 * ============ شكل كل حقلٍ في نموذج اللوحة ============
 *
 * `lib/spec-schema.ts` يقول **ما** يجب أن تحمله كل فئة. وهذا يقول **كيف
 * يُدخَل**: خانةُ رقمٍ أم نصّ أم قائمة، وبأي خيارات.
 *
 * ⚠️ وقبل هذا الملف كانت اللوحة تحمل خريطةً ثالثة (`categoryFieldsMap`
 * داخل `AdminManager.tsx`) مستقلّةً عن المخطّط — وقد افترقتا:
 *
 *   المعالج    يوجب ٧ حقول · النموذج يعرض ٤
 *   اللوحة الأم يوجب ٨          · يعرض ٣
 *   الكرت      يوجب ٨          · يعرض ٢
 *   الكيس      يوجب ٦          · يعرض ٢   ← وثلاثةٌ منها مفاتيح توافق
 *
 * فكانت كل قطعة تُضاف من اللوحة تولد ناقصة، ونحن نسدّ النقص بسكربتات.
 * الكتالوج بلغ صفر نقص، واللوحة تعيده من الباب الخلفي.
 *
 * والخيارات هنا **مستخرجةٌ من الكتالوج نفسه** لا مكتوبةٌ من الذاكرة: قائمة
 * المقابس القديمة كانت تعرض `LGA1200` (لا وجود له في الكتالوج) وتُغفل
 * `LGA1851` (موجود في ست لوحات وأربعة معالجات).
 *
 * والقائمة تُستعمل حين تكون القيم معدودةً ومغلقة (المقبس، نوع الرام).
 * وحين تتنوّع (٢٣ سرعة رام مختلفة) يبقى الحقل نصّاً حرّاً — فالقائمةُ
 * المغلقة على قيمٍ مفتوحة تمنع إدخال الصحيح.
 */

export type FieldType = 'text' | 'number' | 'select';

export type FieldMeta = {
  type: FieldType;
  options?: string[];
  /** تلميحٌ داخل الخانة — مثالٌ من الكتالوج لا وصفٌ مجرّد */
  hint?: string;
};

const SOCKETS = ['AM5', 'AM4', 'LGA1700', 'LGA1851'];
const RAM_TYPES = ['DDR5', 'DDR4'];

/** المفتاح → شكله. مشتركٌ بين الفئات ما لم تُخصّصه `BY_CATEGORY`. */
const COMMON: Record<string, FieldMeta> = {
  socket: { type: 'select', options: SOCKETS },
  cores: { type: 'number', hint: '8' },
  threads: { type: 'number', hint: '16' },
  baseClock: { type: 'text', hint: '4.7 GHz' },
  boostClock: { type: 'text', hint: '5.2 GHz' },
  l3Cache: { type: 'text', hint: '96MB' },
  architecture: { type: 'text', hint: 'Zen 5' },
  pCores: { type: 'number', hint: '8' },
  eCores: { type: 'number', hint: '16' },
  integratedGraphics: { type: 'text', hint: 'Radeon Graphics' },
  memorySupport: { type: 'select', options: ['DDR5', 'DDR4', 'DDR4 / DDR5'] },

  ramType: { type: 'select', options: RAM_TYPES },
  chipset: { type: 'text', hint: 'B850' },
  maxRam: { type: 'select', options: ['64GB', '96GB', '128GB', '192GB', '256GB'] },
  memorySpeed: { type: 'text', hint: '8000+ MT/s (OC)' },
  m2Slots: { type: 'number', hint: '3' },
  pcieVersion: { type: 'select', options: ['PCIe 5.0', 'PCIe 4.0', 'PCIe 3.0'] },

  type: { type: 'text' },
  capacity: { type: 'text', hint: '32GB' },
  kit: { type: 'text', hint: '2x16GB' },
  speed: { type: 'number', hint: '6000' },
  casLatency: { type: 'text', hint: 'CL30' },
  profile: { type: 'text', hint: 'AMD EXPO' },
  rgb: { type: 'select', options: ['Yes', 'No'] },
  color: { type: 'text', hint: 'White — يُسجَّل حين لا يكون أسود' },

  vram: { type: 'text', hint: '16GB' },
  memoryType: { type: 'select', options: ['GDDR7', 'GDDR6X', 'GDDR6'] },
  memoryBus: { type: 'text', hint: '256-bit' },
  lengthMm: { type: 'number', hint: '328' },
  powerConnectors: { type: 'text', hint: '1x 16-pin' },
  ports: { type: 'text', hint: '1x HDMI 2.1b, 3x DP 2.1b' },
  includedAio: { type: 'text', hint: '360mm AIO مرفق' },

  interface: { type: 'text', hint: 'PCIe 4.0 x4' },
  readSpeed: { type: 'text', hint: '7400 MB/s' },
  writeSpeed: { type: 'text', hint: '6500 MB/s' },

  wattage: { type: 'number', hint: '850' },
  rating: { type: 'select', options: ['80+ Titanium', '80+ Platinum', '80+ Gold', '80+ Silver', '80+ Bronze', '80+ Standard'] },
  modularity: { type: 'select', options: ['Full', 'Semi', 'Non-Modular'] },

  maxGpuLength: { type: 'number', hint: '400' },
  maxCoolerHeight: { type: 'number', hint: '170' },
  radiatorSupport: { type: 'select', options: ['120mm', '240mm', '280mm', '360mm', '420mm', '2x 360mm'] },
  psuFormFactor: { type: 'select', options: ['ATX', 'ATX / SFX', 'SFX / SFX-L', 'SFX'] },
  includedFans: { type: 'text', hint: '3x 120mm ARGB — أو «لا يوجد»' },
  dualChamber: { type: 'select', options: ['Yes'] },
  verticalGpu: { type: 'select', options: ['Supported', 'Included', 'Bracket Ready'] },
  pcieRiser: { type: 'select', options: ['Included'] },
  screen: { type: 'text', hint: '14.1" 4K Touchscreen' },
};

/** ما يختلف شكله باختلاف الفئة — `formFactor` أوضح مثال */
const BY_CATEGORY: Record<string, Record<string, FieldMeta>> = {
  CPU: {},
  Motherboard: { formFactor: { type: 'select', options: ['ATX', 'Micro-ATX', 'Mini-ITX', 'E-ATX'] } },
  RAM: {
    heightMm: { type: 'number', hint: '44' },
    type: { type: 'select', options: RAM_TYPES },
    capacity: { type: 'select', options: ['16GB', '32GB', '48GB', '64GB', '96GB', '128GB'] },
  },
  GPU: { formFactor: { type: 'select', options: ['2.5 Slot', '3 Slot', '3.8 Slot', 'Low Profile (نصف ارتفاع)'] } },
  Storage: {
    type: { type: 'select', options: ['NVMe M.2', 'SATA SSD 2.5"', 'HDD'] },
    capacity: { type: 'select', options: ['256GB', '500GB', '512GB', '1TB', '2TB', '4TB', '8TB'] },
    formFactor: { type: 'select', options: ['M.2 2280', 'M.2 2230', '2.5-inch', '3.5-inch'] },
    interface: { type: 'select', options: ['PCIe 5.0 x4', 'PCIe 4.0 x4', 'PCIe 3.0 x4', 'SATA III'] },
  },
  Cooler: {
    type: { type: 'select', options: ['Air', 'AIO'] },
    sizeMm: { type: 'number', hint: '165' },
    sockets: { type: 'text', hint: 'AM5/AM4/LGA1700/LGA1851' },
    tdpRating: { type: 'number', hint: '220' },
    fanCount: { type: 'number', hint: '2' },
    fanSize: { type: 'text', hint: '120mm' },
    clearanceMm: { type: 'number', hint: '32' },
  },
  PSU: { formFactor: { type: 'select', options: ['ATX', 'ATX 3.0', 'ATX 3.1', 'SFX', 'SFX-L'] } },
  Case: { formFactor: { type: 'select', options: ['Mid Tower', 'Full Tower', 'Micro-ATX Tower', 'Mini-ITX'] } },
};

/** شكل الحقل في فئةٍ بعينها — أو نصٌّ حرّ إن لم يُسجَّل */
export const fieldMeta = (category: string, key: string): FieldMeta =>
  BY_CATEGORY[category]?.[key] ?? COMMON[key] ?? { type: 'text' };
