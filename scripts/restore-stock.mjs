/**
 * استرجاع حالة التوفّر التي أفسدها عطل خادم متجر.
 *
 * الحالة: تعطّل خادم كازاسوق فأعاد صفحة خطأ PHP، ففسّرها السحب "نافد"
 * وعلّم عشرات المنتجات غير متوفّرة. الحارس الجديد (isBrokenPage) يمنع
 * تكرارها، لكن البيانات المتضرّرة تحتاج استرجاعاً من نسخة ما قبل العطل.
 *
 * المصدر: backups/store-columns-*.json (الأحدث قبل العطل).
 * لا يلمس السعر — التوفّر فقط، ولا يلمس إلا عروض المتجر المحدّد.
 *
 * التشغيل:  node scripts/restore-stock.mjs <slug> [--apply]
 *   بلا --apply يعرض ما سيفعله فقط (تشغيل جافّ).
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

dotenv.config();
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const slug = process.argv[2];
const apply = process.argv.includes('--apply');
if (!slug) { console.error('استخدم: node scripts/restore-stock.mjs <slug> [--apply]'); process.exit(1); }

// أحدث نسخة احتياطية
const dir = join(process.cwd(), 'backups');
const files = readdirSync(dir).filter((f) => f.startsWith('store-columns-')).sort();
if (!files.length) { console.error('لا توجد نسخة احتياطية في backups/'); process.exit(1); }
const file = files[files.length - 1];
const backup = JSON.parse(readFileSync(join(dir, file), 'utf8'));
console.log(`النسخة المرجعية: ${file} (${backup.takenAt})`);

// عمود التوفّر القديم المقابل لهذا المتجر
const col = `${slug}InStock`;
if (backup.rows[0][col] === undefined) {
  console.error(`النسخة لا تحوي العمود ${col} — هذا المتجر أُضيف بعد الترحيل، فلا مرجع للاسترجاع.`);
  process.exit(1);
}
const wasInStock = new Map(backup.rows.map((r) => [r.id, r[col]]));

const offers = await prisma.componentOffer.findMany({
  where: { store: { slug }, url: { not: null } },
  select: { id: true, componentId: true, inStock: true, price: true, component: { select: { name: true } } },
});

const toFix = offers.filter((o) => o.inStock === false && wasInStock.get(o.componentId) === true);

console.log(`\nعروض ${slug}: ${offers.length} · نافد الآن: ${offers.filter((o) => !o.inStock).length}`);
console.log(`كانت متوفّرة قبل العطل وصارت نافدة: ${toFix.length}`);
toFix.slice(0, 12).forEach((o) => console.log(`   • ${o.component.name.slice(0, 40)} (سعر مخزَّن: ${o.price ?? '—'})`));
if (toFix.length > 12) console.log(`   … و${toFix.length - 12} غيرها`);

if (!apply) {
  console.log('\n(تشغيل جافّ — أعد التشغيل مع --apply للتنفيذ)');
} else {
  for (const o of toFix) {
    await prisma.componentOffer.update({ where: { id: o.id }, data: { inStock: true } });
  }
  console.log(`\n✅ استُرجع التوفّر لـ ${toFix.length} عرض. ستُصحّحه أول دورة سحب ناجحة على أي حال.`);
}

await prisma.$disconnect();
