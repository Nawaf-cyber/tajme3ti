/**
 * ============ ذاكرة L3 — ٢٧ معالجاً ============
 *
 * أُدرجت في المقارنة لأنها الفارق الحاسم في الألعاب: سلسلة X3D كلّها قائمة
 * عليها (7800X3D = ٩٦ ميجابايت مقابل ٣٢ لـ7700X من الجيل نفسه).
 *
 * المصدر: صفحات Intel Ark الرسمية للمعالجات الزرقاء.
 * وAMD تتبع قاعدةً منشورة: **٣٢ ميجابايت لكل شريحة حوسبة (CCD)**، فالسداسي
 * والثماني ٣٢، والاثنا عشر ٦٤.
 *
 * ⚠️ واستثناءان يكسران القاعدة ويُكتبان صراحةً:
 *   · معالجات 8000G (وحدة واحدة مدمجة بالرسوميات) = **١٦** لا ٣٢.
 *   · 7800X3D = ٩٦ — أي ٣٢ عادية + ٦٤ مكدّسة ثلاثية الأبعاد.
 *
 *   npx tsx scripts/fill-l3cache.ts            # عرض
 *   npx tsx scripts/fill-l3cache.ts --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

/** جزءٌ مميّز من الاسم → ذاكرة L3 */
const L3: [string, string][] = [
  // ── Intel — من صفحات Intel Ark
  ['Core Ultra 7 265K', '30MB'],
  ['i3-13100F', '12MB'],
  ['i3-14100F', '12MB'],
  ['i5-12400F', '18MB'],
  ['i5-13400F', '20MB'],
  ['i5-13600KF', '24MB'],
  ['i5-14400F', '20MB'],
  ['i5-14500', '24MB'],
  ['i5-14600KF', '24MB'],
  ['i5-14600K', '24MB'],
  ['i7-12700K', '25MB'],
  ['i7-13700K', '30MB'],
  ['i7-14700K', '33MB'],
  ['i9-13900KS', '36MB'],

  // ── AMD — استثناءات أوّلاً
  ['7800X3D', '96MB'],   // ٣٢ + ٦٤ مكدّسة
  ['8500G', '16MB'],     // وحدة APU مدمجة
  ['8600G', '16MB'],
  ['8700G', '16MB'],
  // ── ثم القاعدة: ٣٢ لكل CCD
  ['Ryzen 5 7500F', '32MB'],
  ['Ryzen 5 7600X', '32MB'],
  ['Ryzen 5 9600x', '32MB'],
  ['Ryzen 5 9600', '32MB'],
  ['Ryzen 7 7700X', '32MB'],
  ['Ryzen 7 7700', '32MB'],
  ['Ryzen 9 7900X', '64MB'],  // شريحتا حوسبة
  ['Ryzen 9 7900', '64MB'],
  ['Ryzen 9 9900X', '64MB'],
];

const parse = (s: unknown): Record<string, any> =>
  typeof s === 'string' ? JSON.parse(s) : ((s as any) || {});

async function main() {
  const apply = process.argv.includes('--apply');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const cpus = await prisma.component.findMany({
    where: { category: { name: 'CPU' } },
    select: { id: true, brand: true, name: true, specs: true },
    orderBy: { name: 'asc' },
  });

  const updates: { id: string; specs: any }[] = [];
  const unmatched: string[] = [];
  let added = 0;

  for (const c of cpus) {
    const specs = { ...parse(c.specs) };
    if (String(specs.l3Cache ?? '').trim()) continue;

    /* الأطول أوّلاً: «i5-14600KF» قبل «i5-14600K» وإلّا التقط الأقصرُ الأطولَ */
    const hit = [...L3].sort((a, b) => b[0].length - a[0].length)
      .find(([frag]) => c.name.includes(frag));
    if (!hit) { unmatched.push(`${c.brand} ${c.name}`); continue; }

    specs.l3Cache = hit[1];
    updates.push({ id: c.id, specs });
    added++;
    console.log(`  ${(c.brand + ' ' + c.name).padEnd(34).slice(0, 34)} → ${hit[1]}`);
  }

  console.log(`\nستُملأ: ${added} · بلا قيمة: ${unmatched.length}`);
  for (const u of unmatched) console.log(`   ⚠️ ${u}`);
  if (unmatched.length) { await prisma.$disconnect(); process.exit(1); }

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); return; }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/l3cache-before-${stamp}.json`,
    JSON.stringify(cpus.filter((c) => updates.some((u) => u.id === c.id)), null, 2));
  for (const u of updates) await prisma.component.update({ where: { id: u.id }, data: { specs: u.specs } });
  console.log(`✔ حُدّث ${updates.length} معالجاً`);
  await prisma.$disconnect();
}

main();
