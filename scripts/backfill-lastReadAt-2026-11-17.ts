/* ملءُ lastReadAt (آخر قراءةٍ ناجحة) للعروض التي فشلت آخرُ محاولتها لحظةَ إضافة العمود — من آخر نقطةٍ في
 * PriceHistory لمتجرها. نُفّذ 2026-11-17 (٢٦ عرضاً) بعد نسخ الجدول إلى backups/component-offers-before-lastReadAt-*.json.
 * يمسّ ما lastReadAt فيه null وحده، فإعادته لا تكتب فوق شيء. العروض السليمة لا تحتاجه: lib/stores · lastGoodRead.
 *   npx tsx scripts/backfill-lastReadAt-2026-11-17.ts [--apply] */
import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { isStaleOffer } from '../lib/stores';
const apply = process.argv.includes('--apply');
(async () => {
  const offers = await prisma.componentOffer.findMany({
    where: { lastError: { not: null }, lastReadAt: null },
    select: { id: true, componentId: true, price: true, inStock: true, url: true, lastCheckedAt: true, lastError: true,
      store: { select: { slug: true, scrapeMode: true } }, component: { select: { name: true } } },
  });
  let set = 0;
  for (const o of offers) {
    const last = await prisma.priceHistory.findFirst({
      where: { componentId: o.componentId, store: o.store.slug }, orderBy: { recordedAt: 'desc' }, select: { recordedAt: true } });
    const live = (o.price ?? 0) > 0 && o.inStock && !!o.url;
    const stale = isStaleOffer({ ...o, lastReadAt: last?.recordedAt ?? null });
    console.log(`${o.store.slug.padEnd(10)} ${o.store.scrapeMode.padEnd(6)} last=${last?.recordedAt.toISOString().slice(0, 16) ?? '—'.padEnd(16)} live=${live ? 'Y' : 'n'} stale=${stale ? 'Y' : 'n'}  ${o.component.name.slice(0, 40)} | ${o.lastError!.slice(0, 50)}`);
    if (!last || o.store.scrapeMode === 'off') continue;
    set++;
    if (apply) await prisma.componentOffer.update({ where: { id: o.id }, data: { lastReadAt: last.recordedAt } });
  }
  console.log(`\n${offers.length} failing offers; ${set} ${apply ? 'written' : 'would be written'}`);
  await prisma.$disconnect();
})();
