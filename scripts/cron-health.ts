/**
 * ============ صحّة دورة التحديث ============
 *
 * الكرون يعمل أو لا يعمل — والجواب لا يُقرأ من ملف الـworkflow ولا من
 * سجلّ GitHub، بل من أثره في القاعدة: متى آخر دورة، وكم قطعةً بلا سحبٍ
 * منذ متى.
 *
 * توزيع `lastScrapedAt` هو المقياس الحقيقي للتغطية: لو الدورة تعمل
 * وترتيبها «الأقدم أولاً» سليم، فلا يوجد ذيلٌ طويل من القطع المهجورة.
 *
 *   npx tsx scripts/cron-health.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { BATCHES_PER_RUN, PER_RUN } from '../lib/cron-settings';
import 'dotenv/config';

const hoursAgo = (d: Date | null) => (d ? (Date.now() - d.getTime()) / 3600_000 : Infinity);
const fmt = (h: number) => (h === Infinity ? 'لم تُسحب قط' : h < 1 ? `${Math.round(h * 60)} دقيقة` : `${h.toFixed(1)} ساعة`);

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const s = await prisma.systemSetting.findUnique({ where: { id: 'default' } });
  const perDay = Math.min(24, Math.max(1, s?.updatesPerDay ?? 6));
  const intervalH = 24 / perDay;

  console.log('════════ الإعداد ════════');
  console.log(`  التحديث التلقائي : ${s?.cronEnabled ? '✔ مفعّل' : '✖ موقوف'}`);
  console.log(`  التردّد           : ${perDay} مرّات يومياً (كل ${intervalH} ساعة)`);
  console.log(`  آخر دورة          : ${s?.lastCronRunAt ? `${fmt(hoursAgo(s.lastCronRunAt))} مضت — ${s.lastCronRunAt.toISOString()}` : 'لا يوجد'}`);

  const since = hoursAgo(s?.lastCronRunAt ?? null);
  if (s?.cronEnabled) {
    if (since === Infinity) console.log('  ⚠️ لم تُسجَّل أيّ دورة — الجدولة لم تصل السيرفر قط.');
    else if (since > intervalH * 2) console.log(`  ⚠️ تأخّرت الدورة: المتوقّع كل ${intervalH} ساعة، ومضى ${fmt(since)}.`);
    else console.log('  ✔ الدورة الأخيرة ضمن موعدها.');
  }

  /* القطع المرشّحة للسحب — نفس شرط المسار حرفياً. الفرق بينها وبين
     إجمالي الكتالوج هو عدد القطع التي لا يمسّها الكرون أصلاً. */
  const scrapable = {
    offers: { some: { url: { contains: 'http' }, store: { active: true, scrapeMode: { not: 'off' } } } },
  };
  const total = await prisma.component.count();
  const cand = await prisma.component.count({ where: scrapable });

  console.log('\n════════ التغطية ════════');
  console.log(`  الكتالوج          : ${total} قطعة`);
  console.log(`  مرشّحة للسحب      : ${cand} قطعة${cand < total ? `  (${total - cand} خارج الدورة)` : ''}`);

  /* الأرقام نفسها التي ترسمها اللوحة — من الثوابت المشتركة لا من نصٍّ مكتوب.
     فإن كذبت هنا كذبت هناك، ويُكشف الكذب بتشغيلة واحدة. */
  const daily = PER_RUN * perDay;
  const cov = cand > 0 ? daily / cand : 0;
  console.log(`  الدورة الواحدة    : ${BATCHES_PER_RUN} دفعات ≈ ${PER_RUN} قطعة`);
  console.log(`  يومياً            : ${daily} فحصاً = ${cov >= 1 ? `كل قطعة ~${cov.toFixed(1)} مرّة` : `~${Math.round(cov * 100)}٪ من الكتالوج`}`);
  console.log(`  رصيد السحب       : ~${Math.round(daily * 16.1).toLocaleString('en')} وحدة يومياً · ~${Math.round(daily * 16.1 * 30).toLocaleString('en')} شهرياً من 250,000`);

  const rows = await prisma.component.findMany({
    where: scrapable,
    select: { name: true, brand: true, lastScrapedAt: true },
  });

  const buckets = [
    { label: 'أقلّ من ٦ ساعات', max: 6 },
    { label: '٦ – ١٢ ساعة', max: 12 },
    { label: '١٢ – ٢٤ ساعة', max: 24 },
    { label: 'يوم – ٣ أيام', max: 72 },
    { label: 'أكثر من ٣ أيام', max: Infinity },
  ];
  const counts = buckets.map(() => 0);
  for (const r of rows) {
    const h = hoursAgo(r.lastScrapedAt);
    counts[buckets.findIndex((b) => h < b.max)]++;
  }
  buckets.forEach((b, i) => {
    const bar = '█'.repeat(Math.round((counts[i] / Math.max(1, rows.length)) * 40));
    console.log(`  ${b.label.padEnd(16)} ${String(counts[i]).padStart(4)}  ${bar}`);
  });

  const stale = rows
    .filter((r) => hoursAgo(r.lastScrapedAt) > 72)
    .sort((a, b) => hoursAgo(b.lastScrapedAt) - hoursAgo(a.lastScrapedAt));
  if (stale.length) {
    console.log(`\n  أقدم ${Math.min(10, stale.length)} قطعة:`);
    for (const r of stale.slice(0, 10)) console.log(`    ${fmt(hoursAgo(r.lastScrapedAt)).padStart(14)} · ${r.brand} ${r.name}`);
  }

  await prisma.$disconnect();
}

main();
