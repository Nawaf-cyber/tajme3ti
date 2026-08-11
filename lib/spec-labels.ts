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
  GPU: ['vram', 'memoryType', 'memoryBus', 'lengthMm', 'powerConnectors', 'interface', 'ports', 'architecture', 'formFactor'],
  Motherboard: ['socket', 'chipset', 'formFactor', 'ramType', 'maxRam', 'memorySpeed', 'm2Slots', 'pcieVersion'],
  RAM: ['type', 'capacity', 'kit', 'speed', 'casLatency', 'profile', 'rgb', 'color'],
  Storage: ['type', 'capacity', 'interface', 'formFactor', 'readSpeed', 'writeSpeed'],
  PSU: ['wattage', 'rating', 'modularity', 'formFactor'],
  Case: ['formFactor', 'maxGpuLength', 'includedFans', 'radiatorSupport', 'airflow', 'sidePanel', 'frontPanel', 'cableManagement', 'verticalGpu', 'dualChamber', 'pcieRiser', 'coolingModes', 'orientation', 'design', 'screen', 'glass', 'handles', 'storage', 'color', 'modular', 'acoustics'],
};

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
