/**
 * ثوابت التحديث الآلي — في وحدة مستقلّة عن actions.ts عمداً.
 *
 * ملف 'use server' لا يُصدِّر إلا دوالّ async (يعامل Next كل تصدير كإجراء
 * خادمي قابل للاستدعاء من العميل)، فتصدير مصفوفة منه يُفشل البناء.
 * وهذه القيم يحتاجها الطرفان: الإجراء الخادمي للتحقّق، والمكوّن لرسم الأزرار.
 */

/* الترددات المسموحة — أرقام تقسم اليوم بلا كسر، فالفترة بينها منتظمة.
   القائمة مغلقة عن قصد: القيمة تصل من العميل، وقبول أي عدد يعني السماح
   بـ 0 (تعطيل صامت) أو 500 (إحراق رصيد السحب في ساعة). */
export const UPDATE_FREQUENCIES = [1, 2, 3, 4, 6, 8, 12, 24] as const;
export type UpdateFrequency = (typeof UPDATE_FREQUENCIES)[number];

/** الافتراضي: ٦ دورات = فحص كل قطعة ~مرّتين يومياً للكتالوج الحالي */
export const DEFAULT_UPDATES_PER_DAY = 6;

/* ============ حجم الدورة ============
 * ثلاثة أرقام كانت مبعثرة في ثلاثة أماكن — سقف الدفعة في المسار، وعدد
 * الدفعات في ملف الـworkflow، والجملة التي تشرحها للأدمن في اللوحة. فتغيّر
 * الأولان وبقيت الجملة تقول «دفعتين (~٧٠ قطعة)» والكتالوج «٢٢٥ قطعة» بعد
 * أن صار ٢٥٦. رقمٌ يشرح نفسه ولا أحد يراجعه أخطرُ من رقمٍ غائب.
 */

/** سقف الدفعة الواحدة في مسار الكرون */
export const BATCH_SIZE = 35;

/** ما تُنجزه الدفعة فعلاً: الميزانية الزمنية (٤٢ث) توقفها قبل السقف */
export const BATCH_EFFECTIVE = 28;

/** دفعات التشغيلة الواحدة — يطابق BATCHES في .github/workflows/update-prices.yml */
export const BATCHES_PER_RUN = 3;

/** ما تفحصه دورةٌ واحدة تقريباً */
export const PER_RUN = BATCHES_PER_RUN * BATCH_EFFECTIVE;

export const isValidFrequency = (n: number): n is UpdateFrequency =>
  (UPDATE_FREQUENCIES as readonly number[]).includes(n);

/* ============ مصدر الجدولة — مفتاحٌ بين فيرسل وGitHub ============
 * الجدولتان مربوطتان معاً (vercel.json و.github/workflows/update-prices.yml)
 * وكلٌّ تنادي المسار كلّ ساعة. والمسار يُنفّذ نداء المصدر المختار وحده،
 * ويُهمل الآخر قبل أيّ سحب — فلا تتضاعف الدفعات ولا رصيد Scrape.do، والتبديل
 * ضغطةٌ في اللوحة لا تعديلُ ملفٍ ونشر.
 *
 * ولماذا فيرسل افتراضياً: جدولة GitHub في المستودع العامّ «أفضل جهد» — آخر
 * ١٢ تشغيلة قبل 2026-10-02 جاءت ~٥ يومياً لموعدٍ كلّ ساعة. وفيرسل Pro بالدقيقة.
 *
 * والقيمة في جدول Setting (مفتاحٌ ونصّ) لا عمودٌ في SystemSetting: لا تغيير مخطّط.
 */
export const CRON_SOURCES = ['vercel', 'github'] as const;
export type CronSource = (typeof CRON_SOURCES)[number];
export const CRON_SOURCE_KEY = 'cronSource';
export const DEFAULT_CRON_SOURCE: CronSource = 'vercel';

export const isValidCronSource = (s: unknown): s is CronSource =>
  (CRON_SOURCES as readonly unknown[]).includes(s);

/**
 * من نادى المسار؟ فيرسل يرسل مع كلّ نداء كرون ترويسة `x-vercel-cron-schedule`
 * (بنصّ الجدولة)، ووكيلُه `vercel-cron/…` — بحسب توثيقه. وما سواه نداء الـworkflow.
 */
export const cronCaller = (headers: Headers): CronSource =>
  headers.get('x-vercel-cron-schedule') || (headers.get('user-agent') ?? '').startsWith('vercel-cron')
    ? 'vercel'
    : 'github';
