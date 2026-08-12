/**
 * ============ حذف قطعة من الكتالوج ============
 *
 * السبب المعتاد: قطعةٌ أُضيفت ثم تبيّن أنها نافدة في كل متجر يحملها،
 * فتبقى بسعر صفر — تعرض «0 ﷼» للزائر وتُحتسب في اللوحة قطعةً معطوبة.
 *
 * وقبل الحذف يفحص **الروابط الداخلية إليها**: وصفُ قطعةٍ أخرى قد يشير
 * إلى /components/<id> بصيغة «بإمكانك التوجه إلى …»، وحذفُ الهدف يترك
 * رابطاً ميّتاً في صفحةٍ حيّة — وهي المشكلة التي كلّفتنا ثمانية عشر رابطاً
 * مكسوراً من قبل. فإن وُجد مشير، يتوقّف ويطبع من يشير.
 *
 *   npx tsx scripts/delete-component.ts <id> [<id> …]
 *   npx tsx scripts/delete-component.ts <id> --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

async function main() {
  const args = process.argv.slice(2);
  const ids = args.filter((a) => !a.startsWith('-'));
  const apply = args.includes('--apply');
  if (ids.length === 0) {
    console.error('استعمال: npx tsx scripts/delete-component.ts <id> [<id> …] [--apply]');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const targets = await prisma.component.findMany({
    where: { id: { in: ids } },
    include: { offers: { include: { store: { select: { slug: true } } } }, category: { select: { name: true } } },
  });

  if (targets.length === 0) { console.log('لا قطع مطابقة.'); await prisma.$disconnect(); return; }

  const all = await prisma.component.findMany({ select: { id: true, brand: true, name: true, description: true } });

  let blocked = false;
  for (const t of targets) {
    const referrers = all.filter((c) => c.id !== t.id && (c.description || '').includes(`/components/${t.id}`));
    console.log(`\n=== ${t.brand} ${t.name} (${t.category?.name}) — ${t.price}﷼`);
    console.log(`    عروض: ${t.offers.map((o) => `${o.store.slug}=${o.price ?? '—'}${o.inStock ? '' : ' نافد'}`).join(' · ') || 'لا شيء'}`);
    if (referrers.length) {
      console.log(`    ⛔ يشير إليها ${referrers.length}: ${referrers.map((r) => `${r.brand} ${r.name}`).join('، ')}`);
      blocked = true;
    } else {
      console.log('    ✓ لا روابط داخلية إليها');
    }
  }

  if (blocked) {
    console.log('\n⛔ متوقّف: أصلح الروابط المشيرة أوّلاً (أو احذفها معاً).');
    await prisma.$disconnect();
    process.exit(1);
  }

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply للحذف)'); await prisma.$disconnect(); return; }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const path = `backups/deleted-components-${stamp}.json`;
  writeFileSync(path, JSON.stringify(targets, null, 2));
  console.log(`\nنسخة احتياطية كاملة (تشمل العروض): ${path}`);

  // العروض تُحذف تلقائياً بـonDelete: Cascade في المخطّط
  for (const t of targets) {
    await prisma.component.delete({ where: { id: t.id } });
    console.log(`✔ حُذفت: ${t.brand} ${t.name}`);
  }

  await prisma.$disconnect();
}

main();
