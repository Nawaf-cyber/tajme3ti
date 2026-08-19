/* ============ لون العلامة التجارية ============
 *
 * كانت الدالّة منسوخةً في **أربعة** ملفات، وافترقت الأربع:
 *
 *              افتراضي     AMD        NVIDIA
 *   الباني     cyan-700    red-700    emerald-700
 *   تصفّح القطع blue-600    red-600    emerald-600
 *   تجميعاتي   blue-600    red-600    #76b900
 *   التجميعة   blue-600    red-600    #76b900
 *
 * فالكرت الواحد يظهر بأربعة ألوان حسب الصفحة التي تفتحها. وهذا ليس فرقاً
 * يُلاحظ بالمقارنة الجانبية فقط — الزائر ينتقل بين الصفحات في الجلسة
 * نفسها، فيرى لونه يتبدّل.
 *
 * ============ قراران في اللوحة الموحّدة ============
 *
 * ⚠️ ١) **NVIDIA في الوضع الفاتح ليست `#76b900`.** لونها الرسميّ أخضرُ
 * مصفرّ، وتباينه على الأبيض ~2.5:1 — دون حدّ WCAG للنصّ (4.5:1). فيُستعمل
 * `emerald-600` فاتحاً و`#8ce600` داكناً: الهويّة تُحفظ حيث تُقرأ، ولا
 * يُضحّى بالقراءة لأجل دقّة اللون.
 *
 * ⚠️ ٢) **الافتراضيّ صار محايداً بعد أن كان أزرق.** والأزرق هو لون إنتل
 * نفسه — فمزوّد Corsair كان يظهر بلون معالج إنتل، فيُقرأ اللون كأنه معنى
 * وهو ليس كذلك. اللون هنا يقول «هذه علامةٌ نميّزها»، والمحايد يقول
 * «لا نميّزها» — وهو خبرٌ أصدق من زرقةٍ بلا سبب.
 *
 * والتلوين للمعالج والكرت وحدهما حين تُعرف الفئة: تنافس AMD/NVIDIA/Intel
 * معنىً يعرفه المشتري، أمّا «أزرق Corsair» فزخرفة.
 */

const AMD = 'text-red-600 dark:text-red-500';
const NVIDIA = 'text-emerald-600 dark:text-[#8ce600]';
const INTEL = 'text-blue-600 dark:text-blue-500';
const NEUTRAL = 'text-slate-600 dark:text-slate-300';

/**
 * @param brand        اسم العلامة
 * @param name         اسم القطعة — يُقرأ لأن «GeForce RTX» قد تأتي بلا كلمة NVIDIA
 * @param categoryName الفئة إن عُرفت؛ فغير المعالج والكرت يبقى محايداً
 */
export const brandColor = (
  brand?: string | null,
  name?: string | null,
  categoryName?: string | null,
): string => {
  if (categoryName && categoryName !== 'CPU' && categoryName !== 'GPU') return NEUTRAL;

  const t = `${brand || ''} ${name || ''}`.toLowerCase();
  if (t.includes('amd') || t.includes('radeon') || t.includes('ryzen')) return AMD;
  if (t.includes('nvidia') || t.includes('geforce') || t.includes('rtx') || t.includes('gtx')) return NVIDIA;
  if (t.includes('intel') || t.includes('core ultra')) return INTEL;
  return NEUTRAL;
};
