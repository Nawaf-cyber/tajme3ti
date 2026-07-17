import { prisma } from './prisma';
import { FALLBACK, type AffiliateIds } from './affiliate';

/**
 * ============ جلب معرّفات الأفلييت — خادم فقط ============
 *
 * مفصول عن lib/affiliate.ts عمداً: ذاك يُستورد من مكوّنات العميل،
 * وأي استيراد لـ prisma منه يسحب pg → dns فينهار البناء.
 *
 * استخدمه في مكوّنات الخادم فقط (page.tsx بلا 'use client').
 */
export async function getAffiliateIds(): Promise<AffiliateIds> {
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: ['amazon_affiliate', 'cazasouq_affiliate', 'microless_affiliate'] } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      amazon_affiliate: map.amazon_affiliate ?? FALLBACK.amazon_affiliate,
      cazasouq_affiliate: map.cazasouq_affiliate ?? FALLBACK.cazasouq_affiliate,
      microless_affiliate: map.microless_affiliate ?? FALLBACK.microless_affiliate,
    };
  } catch {
    return FALLBACK;
  }
}