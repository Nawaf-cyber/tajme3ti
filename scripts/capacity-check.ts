/* ============ السعة: هل يُقارَن التخزين بشكلٍ صحيح؟ ============
 *
 * العطب: `analyzeBuild` كانت تقرأ السعة بدالّةٍ تُهمل الوحدة، فـ'8TB'
 * تصير 8 و'512GB' تصير 512 — فيتفوّق نصفُ تيرابايت على ثمانية.
 *
 * يشغّل الدالّة الموحّدة على **كل صيغةٍ موجودة في الكتالوج**، ثم يقارن
 * تجميعتين حقيقيتين من التجميعات المحفوظة.
 *
 * **يقرأ ولا يكتب.**
 *   npx tsx scripts/capacity-check.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { capacityGb, formatCapacity } from '../lib/capacity';
import { analyzeBuild, type BuildLike } from '../lib/build-compare';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G = '\x1b[32m', R = '\x1b[31m', D = '\x1b[2m', X = '\x1b[0m';
const sp = (s: any) => (typeof s === 'string' ? JSON.parse(s) : s || {});

/* الدالّة المعطوبة كما كانت — للمقارنة */
const oldSpecNum = (v: any): number => {
  if (v == null) return 0;
  const m = String(v).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
};

let pass = 0, fail = 0;
const check = (t: string, ok: boolean, d = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${t}`); } else { fail++; console.log(`  ${R}✘ ${t}${X}  ${d}`); }
};

async function main() {
  /* ١ — صيغ مصنوعة */
  console.log('\n١) الصيغ');
  const cases: [string, number, string][] = [
    ['2TB', 2048, '2TB'],
    ['8TB', 8192, '8TB'],
    ['512GB', 512, '512GB'],
    ['500GB', 500, '500GB'],
    ['1TB', 1024, '1TB'],
    ['64GB (2x32GB)', 64, '64GB'],
    ['2x16GB', 32, '32GB'],
    ['32GB', 32, '32GB'],
    ['', 0, '—'],
  ];
  for (const [raw, gb, txt] of cases) {
    const got = capacityGb(raw);
    check(`«${raw || 'فارغ'}» → ${gb} → «${txt}»`, got === gb && formatCapacity(got) === txt, `= ${got} → «${formatCapacity(got)}»`);
  }

  /* ٢ — كل صيغةٍ حقيقية في الكتالوج */
  console.log('\n٢) الكتالوج — كل صيغةٍ مسجّلة');
  const parts = await prisma.component.findMany({
    where: { category: { name: { in: ['Storage', 'RAM'] } } },
    select: { name: true, specs: true, category: { select: { name: true } } },
  });
  const forms = new Map<string, string>();
  parts.forEach((p) => {
    const c = String(sp(p.specs).capacity ?? '');
    if (c && !forms.has(c)) forms.set(c, p.category.name);
  });
  let flipped = 0;
  for (const [raw, cat] of [...forms.entries()].sort()) {
    const now = capacityGb(raw);
    const before = oldSpecNum(raw);
    const differs = Math.abs(now - before) > 0.001;
    if (differs) flipped++;
    console.log(`   ${D}[${cat}]${X} ${raw.padEnd(14)} ${differs ? R : D}${before}${X} → ${G}${now}${X}  «${formatCapacity(now)}»`);
  }
  check('كل صيغةٍ تُقرأ بقيمةٍ موجبة', [...forms.keys()].every((k) => capacityGb(k) > 0));
  console.log(`   ${D}${flipped} صيغة كانت تُقرأ خطأً${X}`);

  /* ٣ — تجميعتان حقيقيتان: هل تنقلب النتيجة؟ */
  console.log('\n٣) مقارنة تجميعتين حقيقيتين');
  const builds = await prisma.savedBuild.findMany({ take: 60 });
  const ids = [...new Set(builds.flatMap((b) => [b.storageId, b.ramId]).filter(Boolean) as string[])];
  const comps = await prisma.component.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, brand: true, price: true, specs: true, performanceTier: true, tdpWattage: true, category: { select: { name: true } } },
  });
  const map = new Map(comps.map((c) => [c.id, c]));

  const toLike = (b: any): BuildLike => ({
    id: b.id, name: b.name,
    parts: {
      Storage: b.storageId ? (map.get(b.storageId) as any) ?? null : null,
      RAM: b.ramId ? (map.get(b.ramId) as any) ?? null : null,
    },
  });

  /* نبحث عن زوجٍ تنقلب فيه النتيجة: واحدٌ بالتيرا وآخرُ بالجيجا */
  const withTb = builds.find((b) => b.storageId && /TB/i.test(String(sp(map.get(b.storageId!)?.specs).capacity ?? '')));
  const withGb = builds.find((b) => b.storageId && /GB/i.test(String(sp(map.get(b.storageId!)?.specs).capacity ?? '')));

  if (withTb && withGb) {
    const a = analyzeBuild(toLike(withTb));
    const c = analyzeBuild(toLike(withGb));
    const rawA = String(sp(map.get(withTb.storageId!)?.specs).capacity);
    const rawC = String(sp(map.get(withGb.storageId!)?.specs).capacity);

    console.log(`   «${withTb.name}»  ${rawA}  →  ${formatCapacity(a.storageGb)}  (${a.storageGb} GB)`);
    console.log(`   «${withGb.name}»  ${rawC}  →  ${formatCapacity(c.storageGb)}  (${c.storageGb} GB)`);

    const oldA = oldSpecNum(rawA), oldC = oldSpecNum(rawC);
    const oldWinner = oldA >= oldC ? 'الأولى' : 'الثانية';
    const newWinner = a.storageGb >= c.storageGb ? 'الأولى' : 'الثانية';
    console.log(`   ${D}قبل: تفوز ${oldWinner} (${oldA} مقابل ${oldC}) · بعد: تفوز ${newWinner}${X}`);

    check('الأكبر فعلاً هو من يفوز', (a.storageGb >= c.storageGb) === (capacityGb(rawA) >= capacityGb(rawC)));
    check('التنسيق يعيد ما كُتب', formatCapacity(a.storageGb) === rawA.toUpperCase().replace(/\s/g, ''), `${formatCapacity(a.storageGb)} مقابل ${rawA}`);
  } else {
    console.log(`   ${D}لا زوج يجمع التيرا والجيجا في التجميعات المحفوظة — يُتخطّى${X}`);
  }

  console.log(`\n${'═'.repeat(46)}`);
  console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
  await prisma.$disconnect();
  if (fail) process.exit(1);
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
