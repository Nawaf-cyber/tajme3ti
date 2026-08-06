/**
 * جلب المتاجر والعروض من القاعدة — الجانب الخادمي فقط.
 * (المنطق النقي في lib/stores.ts كي تستورده مكوّنات العميل بلا prisma.)
 *
 * كل صفحة تعرض أسعاراً تستعمل OFFER_INCLUDE، فتتّفق كل الصفحات على نفس
 * الحقول ونفس شرط "المتاجر المفعّلة فقط" — لا تظهر أسعار متجر أوقفته في
 * صفحة نسي أحدنا تحديثها.
 */

import { prisma } from './prisma';
import { cache } from 'react';
import type { StoreInfo } from './stores';

/** حقول المتجر التي تحتاجها الواجهة — مطابقة لـ StoreInfo */
export const STORE_SELECT = {
  id: true,
  slug: true,
  name: true,
  latinName: true,
  color: true,
  domain: true,
  affiliateParam: true,
  affiliateId: true,
  usesDeepLinks: true,
  sortOrder: true,
} as const;

/** حقول المتجر التي يحتاجها السحب (لا تُرسل للعميل — تحوي إعدادات داخلية) */
export const SCRAPE_STORE_SELECT = {
  id: true,
  slug: true,
  name: true,
  currency: true,
  rateToSar: true,
  scrapeMode: true,
  priceSelector: true,
  listSelector: true,
  stockSelector: true,
  premiumProxy: true,
} as const;

/** يُدمج في أي استعلام component ليجلب عروضه جاهزة للعرض */
export const OFFER_INCLUDE = {
  offers: {
    where: { store: { active: true } },
    include: { store: { select: STORE_SELECT } },
    orderBy: { store: { sortOrder: 'asc' } },
  },
} as const;

/** المتاجر المفعّلة مرتّبة — لنماذج الأدمن ورؤوس الجداول ومفاتيح الألوان */
export const getStores = cache(async (): Promise<StoreInfo[]> => {
  return prisma.store.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
    select: STORE_SELECT,
  });
});

/** كل المتاجر بما فيها المعطّلة — لوحة إدارة المتاجر وحدها */
export const getAllStores = cache(async () => {
  return prisma.store.findMany({ orderBy: { sortOrder: 'asc' } });
});
