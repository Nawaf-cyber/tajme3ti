/**
 * ============ سرعة الرام — الدفعة الثانية، ٢٩ لوحة ============
 *
 * كلّها من صفحات المصنّعين الرسمية، لوحةً لوحة. ولا تُشتقّ من الشيبست:
 * MSI PRO X870-P عند 8200 وMPG X870E Carbon عند 9000 — نفس العائلة وفارقٌ
 * ٨٠٠. وASUS PRIME B650M-A WiFi عند **5600** بينما ROG Strix B650-A عند
 * 7600، وكلتاهما B650.
 *
 * ⚠️ وفخّ استخراجٍ كاد يُدخل خمس قيمٍ خاطئة: **MSI تكتب المدى من الأعلى
 * إلى الأدنى** — «Memory Support DDR5 9000 - 5600 (OC) MT/s». فالتقاط
 * الرقم الملاصق لـ(OC) يعطي **٥٦٠٠** وهو أدنى المدى لا أعلاه. ورُصد لأن
 * ٥٦٠٠ على لوحة X870E رائدة رقمٌ لا يُصدَّق — فوُجب فتح الصفحة والنظر.
 * والدرس: الرقم الذي لا يُصدَّق يُفحص، لا يُسجَّل.
 *
 * ⚠️ وTUF Gaming B550-Plus سُجّلت **4600** لا 4800: الأخيرة سقفُ معالجات
 * Ryzen 4000G، والكتالوج فيه Ryzen 5000 وسقفها 4600.
 *
 *   npx tsx scripts/fill-mb-memspeed2.ts            # عرض
 *   npx tsx scripts/fill-mb-memspeed2.ts --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const SPEED: [string, string][] = [
  // ── ASUS
  ['ROG Strix X870E-E', '8000+ MHz (OC)'],
  ['ROG Strix B650-A', '7600+ MHz (OC)'],
  ['PRIME B650M-A WiFi', '5600 MHz (OC)'],
  ['TUF Gaming A620M-Plus', '7600+ MHz (OC)'],
  ['PRIME A620M-K', '7200+ MHz (OC)'],
  ['ROG Crosshair X670E Hero', '8000+ MHz (OC)'],
  ['TUF Gaming B760-Plus', '7200 MHz (OC)'],
  ['TUF Gaming B550-Plus', '4600 MHz (OC)'],
  ['ROG STRIX Z890-E', '9200+ MT/s (OC)'],
  ['ROG Strix Z790-I', '7600 MHz (OC)'],
  ['ProArt X670E-Creator', '8000+ MHz (OC)'],
  ['TUF Gaming X670E-Plus', '8000+ MHz (OC)'],
  // ── Gigabyte
  ['Z790 UD AC', '7600 MHz (OC)'],
  ['B650E AORUS Master', '8000 MHz (OC)'],
  ['B650M DS3H', '8000 MHz (OC)'],
  ['X670E AORUS Master', '8000 MHz (OC)'],
  ['B550M DS3H', '4733 MHz (OC)'],
  ['Z890 AORUS Elite WiFi7', '9200 MHz (OC)'],
  ['X870 AORUS Elite WiFi7', '8200 MHz (OC)'],
  // ── MSI
  ['MEG Z790 ACE', '7800+ MHz (OC)'],
  ['PRO X870-P WiFi', '8200 MT/s (OC)'],
  ['PRO B860-P WiFi', '8800 MT/s (OC)'],
  ['MPG X870E Carbon WiFi', '9000 MT/s (OC)'],
  ['X670E Carbon WiFi', '7800 MT/s (OC)'],
  ['PRO B760M-A WiFi', '6800 MT/s (OC)'],
  ['PRO B760M-P DDR4', '4800 MHz (OC)'],
  // ── ASRock
  ['X670E Steel Legend', '7600+ MHz (OC)'],
  ['Z790 Steel Legend WiFi', '7200+ MHz (OC)'],
  ['B860M Pro RS WiFi', '8666+ MHz (OC)'],
];

const parse = (s: unknown): Record<string, any> =>
  typeof s === 'string' ? JSON.parse(s) : ((s as any) || {});

async function main() {
  const apply = process.argv.includes('--apply');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const mbs = await prisma.component.findMany({
    where: { category: { name: 'Motherboard' } },
    select: { id: true, brand: true, name: true, specs: true },
    orderBy: { name: 'asc' },
  });

  const updates: { id: string; specs: any }[] = [];
  const still: string[] = [];

  for (const m of mbs) {
    const specs = { ...parse(m.specs) };
    if (String(specs.memorySpeed ?? '').trim()) continue;

    /* الأطول أوّلاً: «MPG X870E Carbon WiFi» قبل «X670E Carbon WiFi» */
    const hit = [...SPEED].sort((a, b) => b[0].length - a[0].length)
      .find(([frag]) => m.name.includes(frag));
    if (!hit) { still.push(`${m.brand} ${m.name}`); continue; }

    specs.memorySpeed = hit[1];
    updates.push({ id: m.id, specs });
    console.log(`  ✔ ${(m.brand + ' ' + m.name).padEnd(40).slice(0, 40)} → ${hit[1]}`);
  }

  console.log(`\nستُملأ: ${updates.length} · باقية: ${still.length}`);
  for (const s of still) console.log(`   · ${s}`);

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); return; }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/mb-memspeed2-before-${stamp}.json`,
    JSON.stringify(mbs.filter((m) => updates.some((u) => u.id === m.id)), null, 2));
  for (const u of updates) await prisma.component.update({ where: { id: u.id }, data: { specs: u.specs } });
  console.log(`✔ حُدّثت ${updates.length} لوحة`);
  await prisma.$disconnect();
}

main();
