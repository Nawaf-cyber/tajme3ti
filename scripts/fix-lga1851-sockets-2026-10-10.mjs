/**
 * ============ LGA1851 على مبرّدَين يذكران LGA1700 وحده — 2026-10-10 ============
 *
 * المحرّك (lib/fit.ts coolerFitsCpu) يطابق المقبس حرفياً، فالمبرّد المسجّل «LGA1700» بلا
 * «LGA1851» يُمنع مع كلّ معالجات Core Ultra. وLGA1851 يحتفظ بفتحات تثبيت LGA1700 بحسب Intel.
 * خمسةٌ صُحّحت في rewrite-desc-cooler-2026-10-09، وهذان الباقيان (وصفاهما فوق 900 حرف):
 *   ASUS ROG Ryuo III 360 ARGB White، DeepCool AK400 Pink.
 *
 *   node scripts/fix-lga1851-sockets-2026-10-10.mjs           # عرض
 *   node scripts/fix-lga1851-sockets-2026-10-10.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const IDS = ['cmuzv44c80019pcymr3kf5vit', 'cmv0ioak7000x0syml2wy4b3b'];

const rows = await prisma.component.findMany({ where: { id: { in: IDS } }, select: { id: true, brand: true, name: true, specs: true } });
const plan = rows.map((r) => {
  const specs = typeof r.specs === 'string' ? JSON.parse(r.specs) : r.specs;
  const next = specs.sockets.replace('LGA1700', 'LGA1851/LGA1700');
  console.log(`${r.brand} ${r.name}: ${specs.sockets} → ${next}`);
  return { r, specs: { ...specs, sockets: next } };
});
if (apply) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  writeFileSync(`backups/fix-lga1851-${stamp}.json`, JSON.stringify(rows, null, 2));
  for (const p of plan) await prisma.component.update({ where: { id: p.r.id }, data: { specs: p.specs } });
  console.log(`نُفّذ — النسخة في backups/fix-lga1851-${stamp}.json`);
} else console.log('(عرضٌ فقط — أضف --apply)');
await prisma.$disconnect();
