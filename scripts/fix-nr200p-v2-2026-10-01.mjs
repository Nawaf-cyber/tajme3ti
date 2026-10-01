/**
 * ============ MasterBox NR200P ← NR200P V2 — 2026-10-01 ============
 *
 * روابط الصفّ (مايكرولس وأمازون NR200PV2-KCNN-S00) للنسخة V2، والمواصفات
 * للأولى المتوقّفة. والروابط هي المنتج المبيع اليوم — فيُصحَّح الصفّ إليها
 * لا تُحذف. من صفحة Cooler Master للنسخة V2 (قُرئت 2026-10-01):
 *
 *   includedFans   2x 120mm ← 1x 120mm («Pre-installed Fans - Bottom: 1x 120mm»)
 *   maxGpuLength   330 ← 334 («Not exceed front bracket: L: 334mm»؛ و357 بتجاوزه —
 *                  يؤخذ الأحوط، فالباني يمنع بهذا الرقم)
 *
 * ولا يُمسّ maxCoolerHeight (155): الصفحة تقول 67mm، وهو يناقض هيكل V1 نفسه
 * (155) — خطأٌ في الصفحة على الأرجح، والمنعُ بناءً عليه يُسقط كلّ مبرّدٍ برجيّ.
 *
 *   node scripts/fix-nr200p-v2-2026-10-01.mjs           # عرض
 *   node scripts/fix-nr200p-v2-2026-10-01.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const FROM = 'MasterBox NR200P', TO = 'MasterBox NR200P V2';
const c = await prisma.component.findFirst({ where: { brand: 'Cooler Master', name: FROM, category: { name: 'Case' } } });
const clash = await prisma.component.findFirst({ where: { brand: 'Cooler Master', name: TO } });
if (!c) { console.log(clash ? 'مُصحَّحٌ سابقاً' : `⛔ لا صفّ «${FROM}»`); await prisma.$disconnect(); process.exit(clash ? 0 : 1); }
if (clash) { console.log(`⛔ «${TO}» موجودٌ أصلاً`); await prisma.$disconnect(); process.exit(1); }

const specs = typeof c.specs === 'string' ? JSON.parse(c.specs) : { ...c.specs };
const next = { ...specs, includedFans: '1x 120mm', maxGpuLength: '334' };
console.log(`  الاسم: ${FROM} ← ${TO}`);
for (const k of ['includedFans', 'maxGpuLength']) console.log(`  ${k}: ${specs[k]} ← ${next[k]}`);

if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/nr200p-v2-${stamp}.json`, JSON.stringify(c, null, 2));
await prisma.component.update({ where: { id: c.id }, data: { name: TO, specs: next } });
console.log(`\n✔ نسخة احتياطية: backups/nr200p-v2-${stamp}.json`);
await prisma.$disconnect();
