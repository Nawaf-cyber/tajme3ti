/**
 * ============ سرعة الرام القصوى — الحقل الأخير ============
 *
 * ٣٧ لوحة بلا `memorySpeed`. وهو الحقل الوحيد في المخطّط الذي **لا يُشتقّ
 * ولا يُعمَّم**: لوحتان بالشيبست نفسه تختلفان — MSI B650 Gaming Plus عند
 * 7200، وMPG B650 Edge عند 7800، وكلتاهما B650. فكل لوحةٍ صفحةُ مصنّعٍ
 * مستقلّة، ولا مفرّ من البحث الفردي.
 *
 * ولذلك تُملأ على دفعات، وما لم يُتحقّق منه **يُترك فارغاً** بدل تعميم
 * رقمٍ من لوحةٍ شقيقة — فالرقم المخترع يصير حقيقةً في القاعدة يقرؤها
 * الزائر ويشتري عليها رامات لا تعمل بسرعتها.
 *
 * ⚠️ واستثناءٌ واحد يُعمَّم بحقّ: شيبست H610 **لا يدعم كسر سرعة الذاكرة
 * إطلاقاً**، فسقفه هو معيار JEDEC نفسه (DDR4-3200) — لا اجتهاد فيه.
 * وهو ما سُجّل فعلاً على لوحتَي H610 الأخريَين في الكتالوج.
 *
 *   npx tsx scripts/fill-mb-memspeed.ts            # عرض
 *   npx tsx scripts/fill-mb-memspeed.ts --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

/** جزءٌ من الاسم → السرعة القصوى (من صفحة المصنّع) */
const SPEED: [string, string][] = [
  ['ROG Maximus Z790 Hero', '7800+ MHz (OC)'],
  ['ROG Strix Z790-E', '7800+ MHz (OC)'],
  ['Prime Z790-P', '7200+ MHz (OC)'],
  ['Z790 AORUS Elite AX', '7600 MHz (OC)'],
  ['B650 Gaming Plus WiFi', '7200+ MHz (OC)'],
  ['MPG B650 Edge WiFi', '7800+ MHz (OC)'],
  ['B760M Pro RS', '7200+ MHz (OC)'],
  ['H610M H DDR4', '3200 MHz'],   // H610 بلا كسر سرعة — سقف JEDEC
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

    const hit = [...SPEED].sort((a, b) => b[0].length - a[0].length)
      .find(([frag]) => m.name.includes(frag));
    if (!hit) { still.push(`${m.brand} ${m.name}`); continue; }

    specs.memorySpeed = hit[1];
    updates.push({ id: m.id, specs });
    console.log(`  ✔ ${(m.brand + ' ' + m.name).padEnd(38).slice(0, 38)} → ${hit[1]}`);
  }

  console.log(`\nستُملأ: ${updates.length} · ما زالت تحتاج بحثاً: ${still.length}`);
  for (const s of still) console.log(`   · ${s}`);

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); return; }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/mb-memspeed-before-${stamp}.json`,
    JSON.stringify(mbs.filter((m) => updates.some((u) => u.id === m.id)), null, 2));
  for (const u of updates) await prisma.component.update({ where: { id: u.id }, data: { specs: u.specs } });
  console.log(`✔ حُدّثت ${updates.length} لوحة`);
  await prisma.$disconnect();
}

main();
