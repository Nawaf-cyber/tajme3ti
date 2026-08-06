/** أي قطع تخلّفت عن دورة التحديث، وما القاسم المشترك بينها؟ */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const now = Date.now();
const comps = await prisma.component.findMany({
  where: { offers: { some: { url: { contains: 'http' }, store: { active: true, scrapeMode: { not: 'off' } } } } },
  select: {
    id: true, name: true, updatedAt: true,
    offers: { select: { url: true, store: { select: { slug: true } } } },
  },
});

// آخر نقطة سعر لكل قطعة = آخر مرة سُحبت فعلاً
const last = await prisma.priceHistory.groupBy({
  by: ['componentId'], _max: { recordedAt: true },
});
const lastMap = new Map(last.map((r) => [r.componentId, r._max.recordedAt]));

const rows = comps.map((c) => {
  const d = lastMap.get(c.id);
  return { name: c.name, days: d ? (now - new Date(d).getTime()) / 86400000 : Infinity, stores: c.offers.length };
});

const buckets = { 'خلال يوم': 0, '١-٣ أيام': 0, '٣-٧ أيام': 0, 'أكثر من ٧': 0, 'لم تُسحب قط': 0 };
for (const r of rows) {
  if (r.days === Infinity) buckets['لم تُسحب قط']++;
  else if (r.days <= 1) buckets['خلال يوم']++;
  else if (r.days <= 3) buckets['١-٣ أيام']++;
  else if (r.days <= 7) buckets['٣-٧ أيام']++;
  else buckets['أكثر من ٧']++;
}
console.log('════ آخر سحب ناجح لكل قطعة ════');
for (const [k, v] of Object.entries(buckets)) console.log(`  ${k.padEnd(14)} ${v}`);

const stale = rows.filter((r) => r.days > 7).sort((a, b) => b.days - a.days);
console.log(`\n════ أقدم ١٥ قطعة (${stale.length} متخلّفة) ════`);
for (const r of stale.slice(0, 15)) {
  console.log(`  ${(r.days === Infinity ? 'لم تُسحب' : r.days.toFixed(0) + ' يوم').padStart(9)} · ${r.stores} متجر · ${r.name.slice(0, 42)}`);
}

await prisma.$disconnect();
