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
  lengthMm: 'الطول (مم)',
  powerConnectors: 'موصّلات الطاقة',
  ports: 'المنافذ',

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
  casLatency: 'الكمون',
  profile: 'البروفايل',
  rgb: 'إضاءة RGB',

  // التخزين
  readSpeed: 'سرعة القراءة',
  writeSpeed: 'سرعة الكتابة',

  // المزوّد
  wattage: 'القدرة (واط)',
  rating: 'شهادة الكفاءة',
  modularity: 'الكابلات',

  // الصندوق
  maxGpuLength: 'أقصى طول كرت',
  includedFans: 'المراوح المرفقة',
  radiatorSupport: 'دعم الرادييتر',
  airflow: 'تدفّق الهواء',
  sidePanel: 'اللوح الجانبي',
  frontPanel: 'الواجهة الأمامية',
  cableManagement: 'تنظيم الكابلات',
  verticalGpu: 'تركيب عمودي للكرت',
  dualChamber: 'حجرتان',
  pcieRiser: 'كابل رايزر',
  coolingModes: 'أنماط التبريد',
  orientation: 'الوضعية',
  design: 'التصميم',
  screen: 'شاشة',
  glass: 'زجاج',
  handles: 'مقابض',
  storage: 'التخزين',
  modular: 'قابل للفكّ',
  acoustics: 'العزل الصوتي',
};

/** camelCase → «كلمتان» حين لا توجد تسمية مسجّلة — أفضل من عرض المفتاح خاماً */
const humanize = (key: string): string =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (ch) => ch.toUpperCase());

export const specLabel = (key: string): string => LABELS[key] ?? humanize(key);
