/**
 * ============ روابط العمولة (Affiliate) — منطق نقي ============
 *
 * ⚠️ لا تستورد prisma هنا إطلاقاً.
 * هذا الملف يُستورد من مكوّنات العميل ('use client')، و prisma
 * يسحب pg → dns وهي وحدات Node لا وجود لها في المتصفّح،
 * فينهار البناء بـ "Can't resolve 'dns'".
 *
 * جلب المعرّفات من قاعدة البيانات في lib/affiliate-server.ts.
 *
 * مصدر واحد للحقيقة. كانت الدالة مكرّرة في أربعة ملفات، كل نسخة
 * بمعرّف مكتوب يدوياً — وثلاث منها بمعامل خاطئ لكازاسوق،
 * والرابعة (صفحة التجميعة المشتركة) بلا معرّف إطلاقاً.
 *
 * المعرّفات تأتي من لوحة الإدارة (جدول Setting)، والقيم أدناه احتياطية.
 */

export type Store = 'amazon' | 'cazasouq' | 'microless';

export type AffiliateIds = {
  amazon_affiliate?: string;
  cazasouq_affiliate?: string;
  microless_affiliate?: string;
};

/** قيم احتياطية تُستخدم لو كان جدول Setting فارغاً */
export const FALLBACK: Required<AffiliateIds> = {
  amazon_affiliate: 'tajmee3ti-21',
  cazasouq_affiliate: '800',   // مؤكّد من رابط تتبّع فعلي: ?idev_id=800
  microless_affiliate: '',     // فارغ = معطّل — معامله غير مؤكّد بعد
};

/**
 * تنظيف رابط كازاسوق من ضجيج البحث.
 * روابط منسوخة من صفحة نتائج تحمل ?search=...&description=true —
 * تُطيل الرابط وقد تُربك التتبّع. نُبقي المسار فقط.
 */
const cleanCazasouq = (url: string): string => {
  try {
    const u = new URL(url);
    // نحذف كل معاملات البحث والعرض، ونُبقي المسار
    ['search', 'description', 'limit', 'sort', 'order', 'page', 'route', 'product_id'].forEach((k) =>
      u.searchParams.delete(k)
    );
    return u.origin + u.pathname + (u.searchParams.toString() ? `?${u.searchParams}` : '');
  } catch {
    return url;
  }
};

/** إضافة معامل لرابط، بمراعاة وجود معاملات سابقة */
const withParam = (url: string, key: string, val: string): string =>
  url.includes('?') ? `${url}&${key}=${val}` : `${url}?${key}=${val}`;

/**
 * بناء رابط العمولة.
 * @param url رابط المنتج كما هو مخزّن
 * @param store المتجر
 * @param ids معرّفات لوحة الإدارة (اختيارية — تسقط للاحتياطي)
 */
export function buildAffiliateUrl(
  url: string | null | undefined,
  store: Store,
  ids?: AffiliateIds
): string {
  if (!url) return '#';

  const amazonTag = ids?.amazon_affiliate ?? FALLBACK.amazon_affiliate;
  const cazaId = ids?.cazasouq_affiliate ?? FALLBACK.cazasouq_affiliate;
  const microId = ids?.microless_affiliate ?? FALLBACK.microless_affiliate;

  switch (store) {
    case 'amazon': {
      if (!url.includes('amazon.sa') && !url.includes('amazon.com')) return url;
      if (!amazonTag) return url;
      // نستخرج رابط المنتج النظيف (dp/ASIN) ونتخلّص من ضجيج ref
      const match = url.match(/(https?:\/\/[^\/]+\/(?:[^\/]+\/)?(?:dp|gp\/product)\/[A-Z0-9]{10})/i);
      if (match) return `${match[1]}?tag=${amazonTag}`;
      return withParam(url, 'tag', amazonTag);
    }

    case 'cazasouq': {
      // كازاسوق يعمل على iDevAffiliate — المعامل idev_id لا aff
      if (!url.includes('cazasouq.com')) return url;
      if (!cazaId) return url;
      return withParam(cleanCazasouq(url), 'idev_id', cazaId);
    }

    case 'microless': {
      // ⚠️ المعامل aff_id غير مؤكّد — يبقى معطّلاً حتى نتحقق من رابط تتبّع فعلي.
      // رابط بمعامل خاطئ أسوأ من رابط بلا معامل: يبدو ناجحاً ولا يُحتسب.
      if (!url.includes('microless.com')) return url;
      if (!microId) return url;
      return withParam(url, 'aff_id', microId);
    }

    default:
      return url;
  }
}

/** سمات الرابط الصحيحة لروابط العمولة — مطلب SEO */
export const AFFILIATE_LINK_PROPS = {
  target: '_blank' as const,
  rel: 'nofollow sponsored noopener noreferrer',
};