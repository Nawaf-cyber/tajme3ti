/**
 * ============ قدرة المعالج الرسميّة وحدّ اللوحة — 2026-09-30 ============
 *
 * لفحص lib/fit · cpuPowerFitsBoard: المعالج بقدرةٍ فوق ما تعلنه شركة اللوحة
 * لا يوضع عليها.
 *
 *  · specs.tdpW لمعالجات AM5 — من قائمتي ASUS الرسميّتين للمعالجات المدعومة
 *    (قُرئتا 2026-09-30)، وكلٌّ يكتب القدرة بجانب الاسم:
 *      PRIME A620M-K        — كلّ ما دون 170 واط
 *      TUF GAMING A620M-PLUS WIFI — ومنها الـ170: 7900X و7950X و9950X و9950X3D
 *    ولا يُمسّ عمود tdpWattage: ذاك لحساب المزوّد، وفيه PPT لبعضها (7700X: 142).
 *  · specs.maxCpuTdpW = 120 لـPRIME A620M-K — صفحة مواصفاتها: «Supports up to
 *    AMD 120W CPU»، وقائمتها تخلو من كلّ معالجٍ 170 واط.
 *    وأختاها TUF A620M-Plus وPRIME B650M-A تعلنان 170 — أقصى AM5، فلا حدّ يُكتب.
 *
 *   node scripts/set-cpu-tdp-2026-09-30.mjs           # عرض
 *   node scripts/set-cpu-tdp-2026-09-30.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

/* الاسم كما في الكتالوج ← القدرة كما في قائمة ASUS */
const TDP = {
  'Ryzen 5 7500F': 65, 'Ryzen 5 7600': 65, 'Ryzen 5 7600X': 105, 'Ryzen 5 8400F': 65,
  'Ryzen 5 8500G': 65, 'Ryzen 5 8600G': 65, 'Ryzen 5 9600': 65, 'Ryzen 5 9600x': 65,
  'Ryzen 7 7700': 65, 'Ryzen 7 7700X': 105, 'Ryzen 7 7800X3D': 120, 'Ryzen 7 8700G': 65,
  'Ryzen 7 9700X': 65, 'Ryzen 7 9800X3D': 120, 'Ryzen 7 9850X3D': 120,
  'Ryzen 9 7900': 65, 'Ryzen 9 7900X': 170, 'Ryzen 9 7950X3D': 120, 'Ryzen 9 9900X': 120,
  'Ryzen 9 9900X3D': 120, 'Ryzen 9 9950X': 170, 'Ryzen 9 9950X3D': 170,
};
const BOARD = { brand: 'ASUS', name: 'PRIME A620M-K', maxCpuTdpW: 120 };

const backup = [];
let blocked = false;

const cpus = await prisma.component.findMany({ where: { category: { name: 'CPU' }, specs: { path: ['socket'], equals: 'AM5' } }, select: { id: true, name: true, specs: true, tdpWattage: true } });
const missing = cpus.filter((c) => !(c.name in TDP)).map((c) => c.name);
const unknown = Object.keys(TDP).filter((n) => !cpus.some((c) => c.name === n));
if (missing.length) { console.log(`⛔ معالجات AM5 بلا قدرة في الجدول: ${missing.join('، ')}`); blocked = true; }
if (unknown.length) { console.log(`⛔ في الجدول ولا تطابق الكتالوج: ${unknown.join('، ')}`); blocked = true; }
for (const c of cpus) {
  const was = c.specs?.tdpW;
  if (was !== TDP[c.name]) console.log(`  ${c.name.padEnd(18)} tdpW: ${was ?? '—'} ← ${TDP[c.name]}   (tdpWattage ${c.tdpWattage} لا يُمسّ)`);
  backup.push(c);
}

const b = await prisma.component.findFirst({ where: { brand: BOARD.brand, name: BOARD.name }, select: { id: true, name: true, specs: true } });
if (!b) { console.log(`⛔ لم أجد ${BOARD.brand} ${BOARD.name}`); blocked = true; }
else { console.log(`  ${b.name}: maxCpuTdpW ${b.specs?.maxCpuTdpW ?? '—'} ← ${BOARD.maxCpuTdpW}`); backup.push(b); }

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/cpu-tdp-${stamp}.json`, JSON.stringify(backup, null, 2));
for (const c of cpus) await prisma.component.update({ where: { id: c.id }, data: { specs: { ...c.specs, tdpW: TDP[c.name] } } });
await prisma.component.update({ where: { id: b.id }, data: { specs: { ...b.specs, maxCpuTdpW: BOARD.maxCpuTdpW } } });
console.log(`\n✔ ${cpus.length} معالجاً + لوحة · نسخة احتياطية: backups/cpu-tdp-${stamp}.json`);
await prisma.$disconnect();
