/**
 * ============ WD اسماً واحداً — 2026-09-30 ============
 *
 * خمسة صفوف تخزين باسم «WD» واثنان باسم «Western Digital» — فتظهر الشركة
 * مرّتين في مرشّح الشركات، ولا تجمعها سلاسل التخزين (lib/series).
 * تُوحَّد على «WD»: هو ما على العلبة (WD_BLACK وWD Blue)، ومطابقة المتاجر
 * (lib/source-match) تشترط اسم الشركة في عنوان المتجر، و«wd» في العنوانين
 * «WD_BLACK…» و«Western Digital WD_BLACK…» معاً — فالتوحيد يوسّعها ولا يضيّقها.
 *
 * ومعه اسم «SN850X 1TB NVMe» ← «Black SN850X 1TB» كأخيه «Black SN850X 2TB».
 *
 * وXPG وAdata لا تُوحَّدان هنا: عناوين XPG في المتاجر كثيراً ما تخلو من ADATA،
 * فالتوحيد يُسقط مطابقتها. تُجمعان في lib/series بدلاً من ذلك.
 *
 *   node scripts/fix-wd-brand-2026-09-30.mjs           # عرض
 *   node scripts/fix-wd-brand-2026-09-30.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const RENAME = { 'SN850X 1TB NVMe': 'Black SN850X 1TB' };

const rows = await prisma.component.findMany({
  where: { brand: 'Western Digital', category: { name: 'Storage' } },
  select: { id: true, brand: true, name: true },
});
const others = await prisma.component.findMany({ where: { brand: { in: ['Western Digital', 'Western digital', 'WESTERN DIGITAL'] }, category: { name: { not: 'Storage' } } }, select: { name: true } });

let blocked = false;
if (rows.length !== 2) { console.log(`⛔ توقّعت صفّين، وجدت ${rows.length}`); blocked = true; }
if (others.length) console.log(`تنبيه: «Western Digital» في فئاتٍ أخرى لا تُمسّ: ${others.map((o) => o.name).join('، ')}`);
for (const r of rows) {
  const name = RENAME[r.name] ?? r.name;
  const clash = await prisma.component.findFirst({ where: { brand: 'WD', name, category: { name: 'Storage' } }, select: { id: true } });
  if (clash) { console.log(`⛔ «WD ${name}» موجودٌ أصلاً`); blocked = true; }
  console.log(`  ${r.brand} ${r.name}  ←  WD ${name}`);
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/wd-brand-${stamp}.json`, JSON.stringify(rows, null, 2));
for (const r of rows) await prisma.component.update({ where: { id: r.id }, data: { brand: 'WD', name: RENAME[r.name] ?? r.name } });
console.log(`\n✔ ${rows.length} · نسخة احتياطية: backups/wd-brand-${stamp}.json`);
await prisma.$disconnect();
