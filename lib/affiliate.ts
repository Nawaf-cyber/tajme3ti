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
  cazasouq_affiliate: '800',   // معرّف الشريك في iDevAffiliate (لوحة كازاسوق)
  microless_affiliate: '',     // فارغ = معطّل — معامله غير مؤكّد بعد
};

/* ============ تتبّع كازاسوق — الحقيقة المُثبتة بالفحص ============
 *
 * نتائج فحص فعلي (2026-07-30/31)، صحّحت اعتقاداً خاطئاً كان موثّقاً هنا
 * بأن `?idev_id=800` "مؤكّد من رابط تتبّع فعلي". هو **ليس** كذلك:
 *
 *  ✗ https://www.cazasouq.com/<منتج>?idev_id=800
 *      صفحة المنتج **لا تحتوي أي سكربت لـiDevAffiliate**، ولا يُضبط كوكي.
 *      أي أن أحداً لا يقرأ المعامل — تجربة ممتازة و**عمولة صفر**.
 *  ~ https://cazasouq.idevaffiliate.com/800.html
 *      يحوّل للصفحة الرئيسية ويضبط كوكي HttpOnly. العمولة تُحتسب لكن
 *      الزائر يفقد المنتج الذي أراده.
 *  ✗ 800.html?url= / ?u= / ?dest= / ?target= / ?r=  → كلها تتجاهل الوجهة.
 *  ✗ 800_1.html و 800_2.html (صفحات هبوط)          → 404.
 *
 *  ✓✓ https://cazasouq.idevaffiliate.com/idevaffiliate.php?id=800&url=799
 *      **الحل الصحيح.** يمرّ عبر خادم التتبّع (فتُحتسب العمولة) ويهبط
 *      مباشرةً على صفحة المنتج. مُختبَر فعلياً وأكّد الهبوط على المنتج.
 *
 * ⚠️ الرقم 799 معرّف **يولّده خادم كازاسوق** لهذه الوجهة تحديداً، ويُنشأ
 * يدوياً من لوحة الشريك:
 *     روابط التتبّع ← الروابط البديلة للصفحات الداخلة ← إنشاء رابط أوتوماتيكي
 * فهو **لا يُشتقّ ولا يُخمَّن**: رقم مجاور (798/800) يوجّه لوجهة مختلفة
 * تماماً، فتحويل المشتري لمنتج خاطئ أسوأ من فقدان العمولة.
 * لذلك يُخزَّن لكل قطعة في Component.cazasouqAffiliateUrl.
 *
 * والكوكي يدوم 14 يوماً من أول نقرة ويغطّي الموقع (من أسئلتهم الشائعة).
 */

/** هل هذا رابط تتبّع كازاسوق صالح؟ نتحقّق كي لا يُلصق رابط خاطئ في اللوحة */
export const isCazasouqTrackingUrl = (u?: string | null): boolean => {
  if (!u) return false;
  try {
    const parsed = new URL(u.trim());
    return parsed.hostname.endsWith('idevaffiliate.com') && parsed.searchParams.has('id');
  } catch {
    return false;
  }
};

/** السلوك حين لا يوجد رابط تتبّع مولَّد للقطعة */
export type CazasouqFallback =
  | 'product-link'        // رابط المنتج مباشرة: تجربة جيدة، بلا عمولة
  | 'affiliate-redirect'; // 800.html: عمولة تُحتسب، لكن هبوط على الرئيسية

/** غيّر هذه القيمة وحدها لتبديل السلوك الاحتياطي عبر الموقع كله */
export const CAZASOUQ_FALLBACK: CazasouqFallback = 'product-link';

/** رابط التحويل العام — يُحتسب لكنه يهبط على الرئيسية */
export const cazasouqRedirect = (affiliateId: string) =>
  `https://cazasouq.idevaffiliate.com/${affiliateId}.html`;

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
  ids?: AffiliateIds,
  /** رابط التتبّع العميق المولَّد لهذه القطعة (كازاسوق فقط) */
  deepLink?: string | null
): string {
  /* الرابط المولَّد يتقدّم على كل شيء: هو الوحيد الذي يجمع احتساب العمولة
     والهبوط على المنتج. نتحقّق من شكله كي لا يكسر رابطٌ خاطئ ملصوق. */
  if (store === 'cazasouq' && isCazasouqTrackingUrl(deepLink)) {
    return deepLink!.trim();
  }

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
      /* وصلنا هنا = لا يوجد رابط تتبّع مولَّد لهذه القطعة.
         راجع التعليق أعلاه: كلا الاحتياطيين ناقص، والحل هو توليد الرابط. */
      if (!url.includes('cazasouq.com')) return url;
      if (!cazaId) return url;

      if (CAZASOUQ_FALLBACK === 'affiliate-redirect') {
        return cazasouqRedirect(cazaId);
      }
      // 'product-link': رابط المنتج نظيفاً. لا عمولة، لكن تجربة سليمة.
      return cleanCazasouq(url);
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

/* ============ الرابط العام — أي متجر في جدول Store ============
 *
 * النسخة أعلاه (buildAffiliateUrl) مربوطة بثلاثة أسماء مكتوبة في الكود.
 * هذه تقرأ الإعدادات من صفّ المتجر، فمتجر جديد يعمل بلا سطر كود:
 *   - usesDeepLinks (مثل iDevAffiliate/كازاسوق): رابط التتبّع المولَّد يتقدّم،
 *     وإن غاب نسقط لرابط المنتج النظيف (تجربة سليمة بلا عمولة).
 *   - غيره: نضيف affiliateParam=affiliateId على الرابط.
 * ويبقى تنظيف أمازون الخاص (dp/ASIN) لأنه مُختبَر ويُسقط ضجيج ref.
 */

/** إعدادات المتجر التي يحتاجها بناء الرابط — جزء من صفّ Store */
export type StoreLink = {
  slug: string;
  domain?: string | null;
  affiliateParam?: string | null;
  affiliateId?: string | null;
  usesDeepLinks?: boolean;
};

/** تنظيف خاص بكل متجر — يُطبَّق قبل إضافة معامل العمولة */
const CLEANERS: Record<string, (url: string) => string> = {
  cazasouq: cleanCazasouq,
};

export function buildStoreUrl(
  store: StoreLink,
  url: string | null | undefined,
  deepLink?: string | null,
): string {
  // شبكات الروابط العميقة: الرابط المولَّد وحده يجمع العمولة والهبوط على المنتج
  if (store.usesDeepLinks) {
    if (isCazasouqTrackingUrl(deepLink)) return deepLink!.trim();
    if (!url) return '#';
    return (CLEANERS[store.slug] ?? ((u: string) => u))(url);
  }

  if (!url) return '#';
  const clean = (CLEANERS[store.slug] ?? ((u: string) => u))(url);

  const param = store.affiliateParam?.trim();
  const id = store.affiliateId?.trim();
  // بلا معرّف = رابط عادي. رابط بمعامل خاطئ أسوأ من رابط بلا معامل.
  if (!param || !id) return clean;

  /* نتحقّق أن الرابط فعلاً لهذا المتجر قبل وسمه بمعرّفنا.
     domain يقبل أكثر من نطاق مفصولة بفاصلة — أمازون السعودية تخزّن روابط
     amazon.sa و amazon.com معاً، ورفض أحدهما يُسقط وسم العمولة بصمت. */
  const domains = (store.domain || '').split(',').map((d) => d.trim()).filter(Boolean);
  if (domains.length && !domains.some((d) => clean.includes(d))) return clean;

  if (store.slug === 'amazon') {
    // رابط منتج نظيف (dp/ASIN) بلا ضجيج ref
    const match = clean.match(/(https?:\/\/[^\/]+\/(?:[^\/]+\/)?(?:dp|gp\/product)\/[A-Z0-9]{10})/i);
    if (match) return `${match[1]}?${param}=${id}`;
  }
  return withParam(clean, param, id);
}

/** سمات الرابط الصحيحة لروابط العمولة — مطلب SEO */
export const AFFILIATE_LINK_PROPS = {
  target: '_blank' as const,
  rel: 'nofollow sponsored noopener noreferrer',
};