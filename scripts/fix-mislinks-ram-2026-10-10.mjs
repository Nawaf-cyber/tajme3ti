/**
 * ============ روابط رامٍ مربوطة بطرازٍ آخر — 2026-10-10 ============
 *
 * ظهرت أثناء إعادة كتابة أوصاف الرام: قُرئ عنوان صفحة أمازون ورمز آخر رابط مايكرولس
 * وعنوان كازاسوق، وقورنت بالقطعة. كلّ ما يُحذف هنا طرازٌ آخر برمزه:
 *
 *   Dominator Titanium 48GB 7200 (CMP48GX5M2X7200C36W):
 *     أمازون B0CHSHNHD8 = 48GB **6000 CL30** أبيض (CMP48GX5M2B6000C30W) — سرعةٌ أخرى.
 *   Kingston Fury Beast DDR5 32GB 6000 (2x16، KF560C36BBE2K2-32 في أمازون):
 *     مايكرولس ‎…kf560c36bbe-32 = **شريحةٌ واحدة** 32GB، لا طقم 2x16.
 *   G.Skill Trident Z5 RGB 32GB 6400 (F5-6400J3239G16GX2-TZ5RS):
 *     كازاسوق «trident-z5-**neo**-rgb … amd-expo» — سلسلةٌ أخرى.
 *   Corsair Vengeance DDR5 32GB 6000 **CL36** (CMK32GX5M2D6000Z36):
 *     كازاسوق «… 38-44-44-96» — نسخة CL38.
 *
 * كلّها نافدة اليوم، فلا يتغيّر سعرٌ معروض — لكنّها كانت ستُعرض سعراً لطرازٍ آخر حين تتوفّر.
 *
 *   node scripts/fix-mislinks-ram-2026-10-10.mjs           # عرض
 *   node scripts/fix-mislinks-ram-2026-10-10.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

/* [معرّف العرض، ما يجب أن يحويه رابطه — حارسٌ ضدّ حذف عرضٍ تغيّر] */
const REMOVE = [
  ['cmsgejzwd006mpsym6ud5krkq', 'B0CHSHNHD8'],
  ['cmsgejj65002opsymnc9ka0p3', 'kf560c36bbe-32'],
  ['cmsgejk19002vpsymqkyxyrlb', 'trident-z5-neo'],
  ['cmsgej96n000apsymp0ypb7pt', '38-44-44-96'],
];

const backup = [];
for (const [id, has] of REMOVE) {
  const o = await prisma.componentOffer.findUnique({ where: { id }, include: { component: { select: { brand: true, name: true } } } });
  if (!o || !decodeURI(o.url).includes(has)) { console.log(`✗ ${id}: غير موجود أو تغيّر رابطه`); process.exitCode = 1; continue; }
  console.log(`− ${o.component.brand} ${o.component.name}: ${has}`);
  backup.push(o);
}
if (process.exitCode) process.exit(1);
if (apply) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  writeFileSync(`backups/fix-mislinks-ram-${stamp}.json`, JSON.stringify(backup, null, 2));
  for (const o of backup) await prisma.componentOffer.delete({ where: { id: o.id } });
  console.log(`نُفّذ — النسخة في backups/fix-mislinks-ram-${stamp}.json`);
} else console.log('(عرضٌ فقط — أضف --apply)');
await prisma.$disconnect();
