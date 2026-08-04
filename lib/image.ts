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

/** النطاقات التي يسمح بها البروكسي — يجب أن تطابق ALLOWED_HOSTS فيه */
const PROXIED_HOSTS = new Set([
  'm.media-amazon.com',
  'images-na.ssl-images-amazon.com',
  'images-eu.ssl-images-amazon.com',
  'cazasouq.com',
  'www.cazasouq.com',
  'static.cazasouq.com',
  'saudi.microless.com',
  'microless.com',
  'www.microless.com',
]);

/**
 * يحوّل رابط صورة منتج إلى رابط عبر نطاقنا.
 * الروابط المحلية (/images/...) والنطاقات غير المعروفة تُعاد كما هي.
 */
export function productImage(url: string | null | undefined, fallback?: string): string {
  const src = (url || '').trim();
  if (!src) return fallback || '/images/placeholder.png';

  // رابط محلي أو نسبي — لا حاجة لبروكسي
  if (src.startsWith('/') || src.startsWith('data:')) return src;

  try {
    const u = new URL(src);
    if (u.protocol !== 'https:') return fallback || '/images/placeholder.png';
    if (!PROXIED_HOSTS.has(u.hostname)) return src; // نطاق غير مدعوم — كما هو
    return `/api/img-proxy?url=${encodeURIComponent(src)}`;
  } catch {
    return fallback || '/images/placeholder.png';
  }
}
