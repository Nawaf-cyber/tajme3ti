/**
 * ============ من أين تُقبل صورة منتج ============
 *
 * قائمةٌ بيضاء صارمة، ونسخةٌ **واحدة** يقرأ منها الطرفان:
 *   • `scripts/fetch-images.ts` — يرفض حفظ رابطٍ خارجها.
 *   • `app/api/img-proxy/route.ts` — يرفض تقديم رابطٍ خارجها.
 *
 * ⚠️ وسببُ الفصل أنّ النسختين تباعدتا فعلاً: أُضيف `f.nooncdn.com` إلى
 * الساحب وحده حين صار نون مصدراً للصور، ولم يُضف إلى البروكسي. فصورة
 * نون تمرّ الحارس الأوّل وتُحفظ، ثمّ يردّها البروكسي **403** — فتظهر
 * القطعة بلا صورة في تصدير المقارنة، والسبب مكتوبٌ في ملفٍّ ثانٍ لا
 * يقرؤه من يعدّل الأوّل. وتعليقُ الساحب ما زال يقول إنّ نطاقاته «داخل
 * قائمة البروكسي أصلاً» — وهو ما لم يعد صحيحاً.
 *
 * ⚠️ ولا تُفتح للنطاقات الحرّة: البروكسي حينها يصير open proxy يُساء
 * استخدامه من نطاقنا.
 */
export const IMAGE_HOSTS: ReadonlySet<string> = new Set([
  // أمازون
  'm.media-amazon.com',
  'images-na.ssl-images-amazon.com',
  'images-eu.ssl-images-amazon.com',
  // كازاسوق
  'cazasouq.com',
  'www.cazasouq.com',
  'static.cazasouq.com',   // نطاق أصول كازاسوق (صور المنتجات الفعلية)
  // مايكرولس
  'saudi.microless.com',
  'microless.com',
  'www.microless.com',
  // نون
  'f.nooncdn.com',
  // إنفيني آرك — يقدّم الصورة من نطاقه نفسه (Odoo: /web/image/...)
  'www.infiniarc.com',
  'infiniarc.com',
]);

export const imageHostAllowed = (url: string): boolean => {
  try { return IMAGE_HOSTS.has(new URL(url).hostname); } catch { return false; }
};
