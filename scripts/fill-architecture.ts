/**
 * ============ المعمارية — مشتقّة لا مبحوثة ============
 *
 * ٥٤ قطعة بلا `architecture`. وهي الحقل الوحيد في قائمة النقص الذي
 * **يُستنتج من رقم الموديل** بلا فتح صفحة مصنّع: كل معالج Ryzen 9000 هو
 * Zen 5، وكل كرت RTX 50 هو Blackwell. فالقاعدة تُكتب مرّة وتُطبَّق على
 * الجميع، ولا يُترك مجالٌ لخطأ نسخٍ يدوي.
 *
 * ⚠️ والاستثناءات مكتوبة صراحةً لأنها تكسر القاعدة:
 *   · Ryzen 5 8500G يحمل Zen 4c لا Zen 4 (نوى مصغّرة).
 *   · Ryzen 5 5500 من Cezanne لا Vermeer (نواة APU بلا رسوميات).
 *   · Core i5-14500 و i7-14700 من Raptor Lake **Refresh** كبقيّة الجيل ١٤.
 *   · RTX 4070 SUPER وما شابهها Ada Lovelace كالجيل ٤٠ كلّه.
 *
 * الترتيب مهمّ: أوّل نمطٍ يطابق يفوز، فالأخصّ قبل الأعمّ.
 *
 *   npx tsx scripts/fill-architecture.ts            # عرض
 *   npx tsx scripts/fill-architecture.ts --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

type Rule = [RegExp, string];

const CPU_RULES: Rule[] = [
  // ── استثناءات أوّلاً ──
  [/Ryzen \d+ 5500\b/i, 'Zen 3 (Cezanne)'],
  [/Ryzen \d+ 8500G/i, 'Zen 4c'],
  // ── AMD بالجيل ──
  [/Ryzen \d+ 9\d{3}/i, 'Zen 5'],
  [/Ryzen \d+ 8\d{3}/i, 'Zen 4'],
  [/Ryzen \d+ 7\d{3}/i, 'Zen 4'],
  [/Ryzen \d+ 5\d{3}/i, 'Zen 3'],
  // ── Intel ──
  [/Core Ultra \d+ \d{3}/i, 'Arrow Lake'],
  [/Core i\d+-14\d{3}/i, 'Raptor Lake Refresh'],
  [/Core i\d+-13\d{3}/i, 'Raptor Lake'],
  [/Core i\d+-12\d{3}/i, 'Alder Lake'],
];

const GPU_RULES: Rule[] = [
  [/RTX 50\d{2}/i, 'Blackwell'],
  [/RTX 40\d{2}/i, 'Ada Lovelace'],
  [/RTX 30\d{2}/i, 'Ampere'],
  [/GTX 16\d{2}/i, 'Turing'],
  [/RX 9\d{3}/i, 'RDNA 4'],
  [/RX 7\d{3}/i, 'RDNA 3'],
  [/RX 6\d{3}/i, 'RDNA 2'],
  [/Arc B\d{3}/i, 'Battlemage'],
  [/Arc A\d{3}/i, 'Alchemist'],
];

const parse = (s: unknown): Record<string, any> =>
  typeof s === 'string' ? JSON.parse(s) : ((s as any) || {});

const match = (name: string, rules: Rule[]): string | null => {
  for (const [re, arch] of rules) if (re.test(name)) return arch;
  return null;
};

async function main() {
  const apply = process.argv.includes('--apply');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const rows = await prisma.component.findMany({
    select: { id: true, brand: true, name: true, specs: true, category: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });

  const updates: { id: string; specs: any }[] = [];
  const unmatched: string[] = [];
  let already = 0;

  for (const r of rows) {
    const cat = r.category.name;
    if (cat !== 'CPU' && cat !== 'GPU') continue;
    const specs = { ...parse(r.specs) };
    if (String(specs.architecture ?? '').trim()) { already++; continue; }

    const full = `${r.brand} ${r.name}`;
    const arch = match(full, cat === 'CPU' ? CPU_RULES : GPU_RULES);
    if (!arch) { unmatched.push(`${cat}  ${full}`); continue; }

    specs.architecture = arch;
    updates.push({ id: r.id, specs });
    console.log(`  ${cat.padEnd(4)} ${full.padEnd(42).slice(0, 42)} → ${arch}`);
  }

  console.log(`\nستُملأ: ${updates.length} · مسجّلة أصلاً: ${already} · بلا قاعدة: ${unmatched.length}`);
  for (const u of unmatched) console.log(`   ⚠️ ${u}`);

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); return; }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/architecture-before-${stamp}.json`,
    JSON.stringify(rows.filter((r) => updates.some((u) => u.id === r.id)), null, 2));

  for (const u of updates) await prisma.component.update({ where: { id: u.id }, data: { specs: u.specs } });
  console.log(`✔ حُدّثت ${updates.length} قطعة`);
  await prisma.$disconnect();
}

main();
