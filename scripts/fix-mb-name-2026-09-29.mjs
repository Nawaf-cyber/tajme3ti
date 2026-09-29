/**
 * ============ «X670E Carbon WiFi» ← «MPG X670E Carbon WiFi» — 2026-09-29 ============
 *
 * سقطت بادئة السلسلة من الاسم، واسمها عند MSI «MPG X670E CARBON WIFI».
 * ظهر أثناء ربط اللوحات بسلاسلها (lib/series-motherboard.ts): كانت تحتاج
 * استثناءً في المطابقة ليُعرف أنها MPG — والصحيح تصحيح الاسم لا الاستثناء.
 *
 *   node scripts/fix-mb-name-2026-09-29.mjs           # عرض
 *   node scripts/fix-mb-name-2026-09-29.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const FROM = 'X670E Carbon WiFi', TO = 'MPG X670E Carbon WiFi';

const c = await prisma.component.findFirst({ where: { brand: 'MSI', name: FROM }, select: { id: true, name: true, description: true } });
if (!c) { console.log(`⛔ لم أجد MSI ${FROM}`); process.exit(1); }
const dup = await prisma.component.findFirst({ where: { brand: 'MSI', name: TO } });
if (dup) { console.log(`⛔ «${TO}» موجودة: ${dup.id}`); process.exit(1); }

/* والوصف: العنوان والسطر الأوّل فقط، بالنصّ الحرفيّ — وكلٌّ يجب أن يوجد مرّةً واحدة */
const DESC = [
  ['### X670E Carbon WiFi', '### MSI MPG X670E Carbon WiFi'],
  ['لوحة X670E Carbon WiFi تستهدف', 'لوحة MPG X670E Carbon WiFi تستهدف'],
];
let desc = c.description || '';
for (const [a, b] of DESC) {
  if (desc.split(a).length !== 2) { console.log(`⛔ سطر الوصف غير موجود مرّةً واحدة: ${a.trim()}`); process.exit(1); }
  desc = desc.replace(a, b);
}

console.log(`${c.id}\n  الاسم: «${FROM}» ← «${TO}»`);
for (const [a, b] of DESC) console.log(`  الوصف:\n    − ${a.trim()}\n    + ${b.trim()}`);

if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/mb-name-fix-${stamp}.json`, JSON.stringify(c, null, 2));
await prisma.component.update({ where: { id: c.id }, data: { name: TO, description: desc } });
console.log(`✔ نسخة احتياطية: backups/mb-name-fix-${stamp}.json`);
await prisma.$disconnect();
