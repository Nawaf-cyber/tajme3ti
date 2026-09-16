/**
 * ============ مصدر صور المنتجات ============
 *
 * ⚠️ لماذا لا نربط صور المتاجر مباشرةً (hotlinking):
 * كانت كل صور المنتجات تُحمَّل من m.media-amazon.com و microless.com
 * مباشرةً إلى متصفّح الزائر. هذا يعني:
 *   1. مراجع AdSense يرى موقعاً كل صوره من نطاقات غيره — إشارة
 *      "محتوى لا تملكه"، وهي من أشهر أسباب الرفض.
 *   2. استهلاك نطاق المتاجر بلا إذن، وقد يحجبوننا في أي وقت فتنكسر الصور.
 *   3. تسريب مُحيل (Referer) لكل زائر إلى نطاق طرف ثالث.
 *
 * الحل: تمريرها عبر /api/img-proxy — نطاقنا، بقائمة بيضاء صارمة،
 * ومخزَّنة مؤقتاً (يوم في المتصفّح، أسبوع على الحافة). فتصبح الصور
 * same-origin بلا تخزين دائم عندنا ولا ادّعاء ملكية.
 */

import { IMAGE_HOSTS } from './image-hosts';

/**
 * الصورة البديلة حين لا صورة للقطعة.
 *
 * ⚠️ وكانت المواضع السبعة تمرّر `/images/${categoryId}/boxed.png` — ومجلّدٌ
 * بهذا الاسم **غير موجود**: `public/images/` فيه `parts` وحده. فكلّ قطعةٍ
 * بلا صورة كانت تعرض أيقونةَ صورةٍ مكسورة و404 في سجلّ الشبكة، في البطاقة
 * وصفحة القطعة والمقارنة والرئيسية معاً. ولم يظهر العطل لأنّ الكتالوج بقي
 * زمناً بلا قطعةٍ ناقصة الصورة.
 */
export const IMAGE_FALLBACK = '/images/placeholder.svg';

/** النطاقات المسموحة — نسخةٌ واحدة يقرؤها البروكسي وساحبُ الصور معها */
const PROXIED_HOSTS = IMAGE_HOSTS;

/**
 * يحوّل رابط صورة منتج إلى رابط عبر نطاقنا.
 * الروابط المحلية (/images/...) والنطاقات غير المعروفة تُعاد كما هي.
 */
export function productImage(url: string | null | undefined, fallback?: string): string {
  const src = (url || '').trim();
  if (!src) return fallback || IMAGE_FALLBACK;

  // رابط محلي أو نسبي — لا حاجة لبروكسي
  if (src.startsWith('/') || src.startsWith('data:')) return src;

  try {
    const u = new URL(src);
    if (u.protocol !== 'https:') return fallback || IMAGE_FALLBACK;
    if (!PROXIED_HOSTS.has(u.hostname)) return src; // نطاق غير مدعوم — كما هو
    return `/api/img-proxy?url=${encodeURIComponent(src)}`;
  } catch {
    return fallback || IMAGE_FALLBACK;
  }
}
