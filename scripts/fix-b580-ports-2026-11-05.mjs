/**
 * 2026-11-05 — Arc B580 مكتوبٌ «3x DP 2.0»، وصفحة Intel (ark 241598) تقول «DP2.1 up to UHBR 13.5»،
 * وأخوه B570 من المعماريّة نفسها (Battlemage) مكتوبٌ DP 2.1. وجده scripts/audit-gpu-ports.ts.
 * الوصف لا يذكر المنافذ، فالتصحيح في المواصفات وحدها.
 *
 *   node scripts/fix-b580-ports-2026-11-05.mjs           # عرض
 *   node scripts/fix-b580-ports-2026-11-05.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const ID = 'cmpiebcif001c00ymfowp9clr';
const FROM = '1x HDMI 2.1, 3x DP 2.0';
const TO = '1x HDMI 2.1, 3x DP 2.1';

const c = await prisma.component.findUnique({ where: { id: ID }, select: { brand: true, name: true, specs: true } });
const specs = typeof c?.specs === 'string' ? JSON.parse(c.specs) : { ...(c?.specs || {}) };
if (!c || c.name !== 'Arc B580' || specs.architecture !== 'Battlemage' || specs.ports !== FROM) {
  console.log('⛔ الصفّ ليس كما قُرئ:', c?.name, specs.architecture, specs.ports);
  await prisma.$disconnect();
  process.exit(1);
}
console.log(`✎ ${c.brand} ${c.name}: «${FROM}» → «${TO}»`);
if (!apply) { console.log('(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/fix-b580-ports-${stamp}.json`, JSON.stringify({ id: ID, specsBefore: c.specs }, null, 2));
await prisma.component.update({ where: { id: ID }, data: { specs: { ...specs, ports: TO } } });
console.log(`✔ نسخة: backups/fix-b580-ports-${stamp}.json`);
await prisma.$disconnect();
