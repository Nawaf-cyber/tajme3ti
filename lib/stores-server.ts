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
import { unstable_cache } from 'next/cache';
import { verifiedListPrice } from './price';
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
  // إعلان حالة المتجر — يُعرض عند عروضه في صفحات القطع والمقارنة
  noticeMessage: true,
  noticeUntil: true,
  // وضع السحب وحده (لا محدّداته): 'off' يفعّل شبكة الأمان في liveOffers
  scrapeMode: true,
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

/**
 * المتاجر التي عليها إعلان سارٍ — **بما فيها الموقوفة**.
 *
 * مقصود: أكثر لحظة يحتاج فيها الزائر التفسير هي حين يختفي متجر كان يراه.
 * لو حصرناها بالمفعّلة، لصار إيقاف متجر معطّل يُخفي معه سبب اختفائه.
 */
export const getStoreNotices = cache(async () => {
  const now = new Date();
  return prisma.store.findMany({
    where: {
      noticeMessage: { not: null },
      OR: [{ noticeUntil: null }, { noticeUntil: { gt: now } }],
    },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, color: true, noticeMessage: true, noticeUntil: true },
  });
});

/** كل المتاجر بما فيها المعطّلة — لوحة إدارة المتاجر وحدها */
export const getAllStores = cache(async () => {
  return prisma.store.findMany({ orderBy: { sortOrder: 'asc' } });
});

/* ============ «السعر قبل» المصدَّق — انظر lib/price · verifiedListPrice ============
 *
 * أعلى سعرٍ رصدناه وعددُ أيّام القراءات لكلّ قطعة×متجر في ٩٠ يوماً — استعلامٌ
 * واحد مجمَّع (~١٦٠٠ صفّ) يُخزَّن ساعة: الأسعار تُسحب مرّةً في اليوم، والاستعلام
 * نفسه يأخذ ٣٠٠–٨٠٠ms فلا يُعاد مع كلّ صفحة.
 */
const listPriceEvidence = unstable_cache(
  async (): Promise<[string, number, number][]> => {
    const rows = await prisma.$queryRaw<{ componentId: string; store: string; mx: number; d: bigint | number }[]>`
      SELECT "componentId", store, MAX(price) AS mx, COUNT(DISTINCT DATE("recordedAt")) AS d
      FROM "PriceHistory" WHERE "recordedAt" >= NOW() - INTERVAL '90 days'
      GROUP BY "componentId", store`;
    return rows.map((r) => [`${r.componentId}|${r.store}`, Number(r.mx), Number(r.d)]);
  },
  ['list-price-evidence-v1'],
  { revalidate: 3600 },
);

/**
 * يستبدل listPrice في عروض القطع بالمصدَّق منه (أو null) — **قبل** أيّ عرضٍ له.
 * يعدّل الكائنات نفسها ويعيدها، فيكفي استدعاؤه بعد findMany مباشرة.
 * ⚠️ كلّ صفحةٍ تعرض خصماً تمرّ من هنا؛ صفحةٌ تنساه تعرض رقم المتجر الخام.
 */
export async function verifyListPrices<T extends { id: string; offers?: { price: number | null; listPrice: number | null; store: { slug: string } }[] }>(
  comps: T[],
): Promise<T[]> {
  if (!comps.some((c) => c.offers?.some((o) => o.listPrice != null))) return comps;
  const ev = new Map((await listPriceEvidence()).map(([k, max, days]) => [k, { max, days }]));
  for (const c of comps)
    for (const o of c.offers ?? [])
      if (o.listPrice != null) o.listPrice = verifiedListPrice(o.price, o.listPrice, ev.get(`${c.id}|${o.store.slug}`));
  return comps;
}
