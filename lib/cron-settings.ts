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

export const isValidFrequency = (n: number): n is UpdateFrequency =>
  (UPDATE_FREQUENCIES as readonly number[]).includes(n);
