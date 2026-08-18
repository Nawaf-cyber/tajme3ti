/**
 * ============ ٢١ قيمة محقَّقة ============
 *
 * الدفعة الأولى من نواقص المخطّط. كلّها إمّا مؤكَّدة من رقم الموديل نفسه
 * أو من صفحة المصنّع — لا تخمين.
 *
 * ⛔ وأهمّها المزوّدات الأربعة: `formFactor` **مفتاح توافق**، وفراغه يعني
 *    للمحرّك «اقبل كل كيس». فهذه الأربعة كانت تدخل اليوم كيس Mini-ITX
 *    الذي لا يتّسع لمزوّد ATX أصلاً.
 *
 * ⚠️ وأطقم الرام: أربعة أُكّدت من روابط المتاجر («2x16gb» في العنوان)،
 *    والأربعة الباقية من رمز المنتج لدى المصنّع:
 *      Crucial CP2K16G56C46U5   → 2K16G = طقمان × ١٦
 *      Kingston KF560C36BBE2AK2 → K2    = طقم من قطعتين
 *    وأطقم ٤٨ جيجابايت في DDR5 هي ٢×٢٤ دائماً (لا توجد وحدة ٤٨).
 *
 *   npx tsx scripts/fill-gaps-batch1.ts            # عرض
 *   npx tsx scripts/fill-gaps-batch1.ts --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

/** المعرّف → المفاتيح التي تُضاف */
const FILL: Record<string, Record<string, string>> = {
  // ═══ المزوّدات — مفتاح توافق ═══
  cmpi5h9s2000704l1iq4czxdf: { formFactor: 'ATX', modularity: 'Full' },       // MSI MAG A650GL
  cmpiebak8001300ym1b8btkok: { formFactor: 'ATX', modularity: 'Full' },       // MSI MAG A850GL PCIe 5
  cmpieb9r7001000ymgi5gvaai: { formFactor: 'ATX', modularity: 'Full' },       // Corsair RM1000x Shift
  cmpiecipz004g00ymnacid88v: { formFactor: 'ATX', modularity: 'Full' },       // ASUS ROG Thor 1200P2

  // ═══ الكرت — السعة مكتوبة في اسم القطعة نفسه ═══
  RX6600XT: { vram: '8GB' },
  RX6700XT: { vram: '12GB' },
  RX6800XT: { memoryType: 'GDDR6' },
  RTX3080TI: { memoryType: 'GDDR6X' },
  RTX4090: { memoryType: 'GDDR6X' },

  // ═══ أطقم الرام ═══
  cmpiebdbz001f00ymszifpqs9: { kit: '2x16GB' },  // Kingston Fury Beast DDR5 32GB 6000
  cmpiecpi9005900ymuuylqjby: { kit: '2x16GB' },  // TeamGroup T-Force Delta RGB 32GB 6400
  cmpiecq26005b00ymniswty6k: { kit: '2x24GB' },  // Corsair Dominator Titanium 48GB
  cmpiecptm005a00ym19nh2ieb: { kit: '2x16GB' },  // Crucial Pro DDR5 32GB 5600
  cmpiebd2l001e00ym1y8bzzlv: { kit: '2x16GB' },  // Corsair Vengeance DDR5 32GB 6000
  cmpiebcpt001d00ymnktdbbjv: { kit: '2x16GB' },  // G.Skill Trident Z5 RGB 32GB 6400
  cmpiecqao005c00ym91dkcumi: { kit: '2x16GB' },  // ADATA Lancer Blade 32GB 6000
  cmr2mmrrq000wjgymi7pcp21t: { kit: '2x16GB' },  // G.Skill Trident Z5 Neo 32GB
};

/** الكروت تُطابَق بالاسم لا بالمعرّف — أسماؤها مميّزة وأقصر من معرّفاتها */
const BY_NAME: Record<string, Record<string, string>> = {
  'RX 6600 XT': { vram: '8GB' },
  'RX 6700 XT': { vram: '12GB' },
  'RX 6800 XT': { memoryType: 'GDDR6' },
  'RTX 3080 Ti': { memoryType: 'GDDR6X' },
  'RTX 4090': { memoryType: 'GDDR6X' },
};
for (const k of ['RX6600XT', 'RX6700XT', 'RX6800XT', 'RTX3080TI', 'RTX4090']) delete FILL[k];

const parse = (s: unknown): Record<string, any> =>
  typeof s === 'string' ? JSON.parse(s) : ((s as any) || {});

async function main() {
  const apply = process.argv.includes('--apply');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const rows = await prisma.component.findMany({
    select: { id: true, brand: true, name: true, specs: true, category: { select: { name: true } } },
  });

  const updates: { id: string; specs: any }[] = [];
  let added = 0, skipped = 0;
  const notFound: string[] = [];

  const applyTo = (r: any, fields: Record<string, string>) => {
    const specs = { ...parse(r.specs) };
    const notes: string[] = [];
    for (const [k, v] of Object.entries(fields)) {
      const cur = String(specs[k] ?? '').trim();
      if (cur) { skipped++; notes.push(`≠ ${k} مسجّل «${cur}» — تُرك`); continue; }
      specs[k] = v; added++; notes.push(`+ ${k}=${v}`);
    }
    if (notes.some((n) => n.startsWith('+'))) updates.push({ id: r.id, specs });
    console.log(`${(r.brand + ' ' + r.name).padEnd(42).slice(0, 42)}  ${notes.join('  ·  ')}`);
  };

  for (const [id, fields] of Object.entries(FILL)) {
    const r = rows.find((x) => x.id === id);
    if (!r) { notFound.push(id); continue; }
    applyTo(r, fields);
  }
  for (const [frag, fields] of Object.entries(BY_NAME)) {
    const r = rows.find((x) => x.category.name === 'GPU' && x.name.includes(frag));
    if (!r) { notFound.push(frag); continue; }
    applyTo(r, fields);
  }

  console.log(`\nقيم أُضيفت: ${added} · مسجّلة سلفاً فتُركت: ${skipped} · قطع تُحدَّث: ${updates.length}`);
  if (notFound.length) { console.log(`⛔ لم تُوجد: ${notFound.join('، ')}`); await prisma.$disconnect(); process.exit(1); }

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); return; }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/gaps-batch1-before-${stamp}.json`,
    JSON.stringify(rows.filter((r) => updates.some((u) => u.id === r.id)), null, 2));
  for (const u of updates) await prisma.component.update({ where: { id: u.id }, data: { specs: u.specs } });
  console.log(`✔ حُدّثت ${updates.length} قطعة`);
  await prisma.$disconnect();
}

main();
