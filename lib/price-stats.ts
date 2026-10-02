/* ============ موضع السعر من تاريخه — مع الجلب ============
 *
 * ⚠️ وُجد هذا الملفّ لأنّ الرقم نفسه صار يُعرض في موضعين: ملخّصُ رسم تاريخ
 * السعر، وسطرُ «متجرٌ واحد» فوق قائمة العروض. وحسابُه مرّتين يعني رقمين
 * مختلفين على **صفحةٍ واحدة** — وهو أسوأ من ألّا يُعرض.
 *
 * والحساب نفسه في lib/price-stats-core (بلا prisma، فيُستورد من العميل)،
 * وهنا الجلب من القاعدة وحده، ويُعاد تصدير الحساب لمن يستورد من هنا.
 */

import { prisma } from './prisma';
import { liveStats, type PriceStats } from './price-stats-core';

export { liveStats, pctAboveMin, type HistoryRow, type PriceStats } from './price-stats-core';

/** نفس الحساب مع الجلب — لمن لا يملك الصفوف أصلاً */
export async function fetchPriceStats(
  componentId: string,
  liveStores: string[],
  spanDays = 90,
): Promise<PriceStats | null> {
  if (!liveStores.length) return null;
  const since = new Date(Date.now() - spanDays * 86400000);
  const rows = await prisma.priceHistory.findMany({
    where: { componentId, recordedAt: { gte: since }, store: { in: liveStores } },
    select: { store: true, price: true, recordedAt: true },
  });
  return liveStats(rows, liveStores);
}
