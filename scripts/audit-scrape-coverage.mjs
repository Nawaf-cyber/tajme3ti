/**
 * تقرير تغطية السحب: كم قطعة سُحبت فعلاً لكل متجر، وتوزيع التشغيلات
 * على آخر ١٤ يوماً. يكشف بسرعة إن توقّف الكرون أو إن متجراً يفشل بصمت.
 *
 * التشغيل:  node scripts/audit-scrape-coverage.mjs
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const now = Date.now();
const D = (n) => new Date(now - n * 86400000);

const stores = await prisma.store.findMany({ select: { slug: true, name: true } });

console.log('════ كم قطعة سُحبت فعلاً لكل متجر ════');
for (const s of stores) {
  const offers = await prisma.componentOffer.findMany({
    where: { store: { slug: s.slug }, url: { not: null } },
    select: { componentId: true },
  });
  const ids = offers.map((o) => o.componentId);
  if (!ids.length) continue;

  const seen = async (since) => {
    const rows = await prisma.priceHistory.findMany({
      where: { store: s.slug, componentId: { in: ids }, recordedAt: { gte: since } },
      select: { componentId: true },
      distinct: ['componentId'],
    });
    return rows.length;
  };

  const d1 = await seen(D(1));
  const d7 = await seen(D(7));
  const d30 = await seen(D(30));
  const ever = await prisma.priceHistory.findMany({
    where: { store: s.slug, componentId: { in: ids } },
    select: { componentId: true }, distinct: ['componentId'],
  });

  console.log(
    `${s.name.padEnd(12)} | روابط: ${String(ids.length).padStart(3)} | ` +
    `٢٤س: ${String(d1).padStart(3)} · ٧أيام: ${String(d7).padStart(3)} · ٣٠يوم: ${String(d30).padStart(3)} · ` +
    `سُحبت يوماً: ${ever.length}/${ids.length}`,
  );
}

console.log('\n════ توزيع تشغيلات السحب (نقاط سجلّ الأسعار لكل يوم) ════');
const recent = await prisma.priceHistory.findMany({
  where: { recordedAt: { gte: D(14) } },
  select: { recordedAt: true, store: true },
});
const byDay = {};
for (const r of recent) {
  const d = new Date(r.recordedAt).toISOString().slice(0, 10);
  byDay[d] = byDay[d] || {};
  byDay[d][r.store] = (byDay[d][r.store] || 0) + 1;
}
for (const d of Object.keys(byDay).sort().reverse()) {
  const parts = Object.entries(byDay[d]).map(([k, v]) => `${k}:${v}`).join('  ');
  console.log(`  ${d}  ${parts}`);
}

await prisma.$disconnect();
