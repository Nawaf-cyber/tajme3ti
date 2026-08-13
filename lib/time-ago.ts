/**
 * ============ «قبل كم؟» بعربيّةٍ صحيحة ============
 *
 * الصياغة الشائعة `قبل ${n} ساعة` تُنتج «قبل 3 ساعة» و«قبل 2 ساعة» — وكلاهما
 * خطأ. والعربية تعدّ على ثلاث درجات لا واحدة:
 *
 *   ١      → ساعة            (مفرد بلا رقم)
 *   ٢      → ساعتين          (مثنّى بلا رقم)
 *   ٣–١٠   → 3 ساعات         (جمع)
 *   ١١+    → 11 ساعة         (مفرد منصوب)
 *
 * الرقم في الحالتين الأوليين يُحذف: «قبل ساعة» لا «قبل 1 ساعة».
 *
 * هذا الملفّ خادميّ وعميليّ معاً، لكن الاستعمال في صفحة القطعة يجري على
 * الخادم: الصفحة `force-dynamic` فتُحسب اللحظة عند كل طلب، ولا يقع اختلاف
 * بين ما رسمه الخادم وما يرسمه المتصفّح.
 */

type Unit = { one: string; two: string; few: string; many: string };

const MINUTE: Unit = { one: 'دقيقة', two: 'دقيقتين', few: 'دقائق', many: 'دقيقة' };
const HOUR: Unit = { one: 'ساعة', two: 'ساعتين', few: 'ساعات', many: 'ساعة' };
const DAY: Unit = { one: 'يوم', two: 'يومين', few: 'أيام', many: 'يوماً' };

const count = (n: number, u: Unit): string => {
  if (n === 1) return u.one;
  if (n === 2) return u.two;
  if (n <= 10) return `${n} ${u.few}`;
  return `${n} ${u.many}`;
};

/**
 * «قبل ٣ ساعات» — أو `null` إن لم يكن هناك تاريخ.
 *
 * ما دون الدقيقتين يُقال «قبل لحظات» لا «قبل دقيقة»: الفارق بين ٤٠ ثانية
 * ودقيقة لا يعني القارئَ شيئاً، ودقّةٌ زائفة بهذا الحجم تُقرأ تشويشاً.
 */
export function timeAgoAr(date?: Date | string | null): string | null {
  if (!date) return null;
  const t = new Date(date).getTime();
  if (!Number.isFinite(t)) return null;

  const min = (Date.now() - t) / 60_000;
  if (min < 0) return 'الآن'; // ساعة الخادم قد تسبق الطابع بثوانٍ
  if (min < 2) return 'قبل لحظات';
  if (min < 60) return `قبل ${count(Math.round(min), MINUTE)}`;

  /* التقريب قبل المقارنة لا بعدها: بـ h<24 وحدها كانت 23.9 ساعة تُقرَّب
     إلى «قبل 24 ساعة» — وهي يومٌ يُقال يوماً، لا أربعٌ وعشرون ساعة. */
  const h = Math.round(min / 60);
  if (h < 24) return `قبل ${count(h, HOUR)}`;

  const d = Math.round(h / 24);
  if (d < 30) return `قبل ${count(d, DAY)}`;

  return new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(new Date(t));
}

/** الطابع كاملاً — لِـ`title` عند مرور المؤشّر، فمن أراد الدقّة وجدها */
export function exactAr(date?: Date | string | null): string | undefined {
  if (!date) return undefined;
  const t = new Date(date);
  if (!Number.isFinite(t.getTime())) return undefined;
  return new Intl.DateTimeFormat('ar', { dateStyle: 'full', timeStyle: 'short' }).format(t);
}

/**
 * هل مضى على السعر أكثر ممّا يُطمأنّ إليه؟
 *
 * العتبة ٢٤ ساعة لأنها أطول من أطول فترةٍ ممكنة بين دورتين (٦ ساعات عند
 * التردّد الحالي، و٢٤ عند أبطأ تردّد مسموح). فتجاوزها يعني أن شيئاً تعطّل
 * فعلاً لا أن الدورة تأخّرت قليلاً.
 */
export const isPriceStale = (date?: Date | string | null): boolean =>
  !date || Date.now() - new Date(date).getTime() > 24 * 3600_000;
