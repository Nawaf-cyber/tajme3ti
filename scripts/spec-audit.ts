/**
 * ============ قياس الكتالوج على المخطّط ============
 *
 * `lib/spec-schema.ts` يقول ما **يجب** أن تحمله كل فئة. وهذه الأداة تقول
 * ما تحمله **فعلاً** — قطعةً قطعة، قبل أن يُفرض شيء.
 *
 * تُشغَّل قبل أي فرضٍ وقبل أي ملء: الفرض على كتالوجٍ ناقص يمنع تعديل
 * القطع الموجودة، والملء بلا قائمةٍ دقيقة بحثٌ في الظلام.
 *
 * وتُخرج ثلاثة أشياء:
 *   ١) تغطية كل مفتاح في فئته — وأين الثقوب بالضبط
 *   ٢) القطع الناقصة بالاسم — قائمة عملٍ لا إحصاء
 *   ٣) مفاتيح موجودة في البيانات وليست في المخطّط ← مرشّحات «المزايا»
 *
 *   npx tsx scripts/spec-audit.ts             # ملخّص
 *   npx tsx scripts/spec-audit.ts --parts     # مع أسماء القطع الناقصة
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { SPEC_SCHEMA, requiredKeys, isFeatureKey } from '../lib/spec-schema';
import 'dotenv/config';

const parse = (s: unknown): Record<string, any> =>
  typeof s === 'string' ? JSON.parse(s) : ((s as any) || {});

const has = (specs: Record<string, any>, k: string) =>
  k in specs && String(specs[k] ?? '').trim() !== '';

const bar = (n: number, total: number) => {
  const w = Math.round((n / Math.max(1, total)) * 24);
  return '█'.repeat(w) + '·'.repeat(24 - w);
};

async function main() {
  const showParts = process.argv.includes('--parts');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const cats = await prisma.category.findMany({ select: { id: true, name: true } });
  const comps = await prisma.component.findMany({
    select: { id: true, brand: true, name: true, categoryId: true, specs: true },
    orderBy: { price: 'asc' },
  });

  let totalMissing = 0;
  const extrasAll: Record<string, number> = {};

  for (const cat of cats) {
    const schema = SPEC_SCHEMA[cat.name];
    const list = comps.filter((c) => c.categoryId === cat.id);
    if (!list.length) continue;

    console.log(`\n████████ ${cat.name}  (${list.length} قطعة)`);
    if (!schema) { console.log('   ⛔ لا مخطّط لهذه الفئة'); continue; }

    const groups: [string, string[], string][] = [
      ['توافق  ', schema.compat, '⛔'],
      ['مقارنة ', schema.compare, '⚠️'],
      ['مشروطة', schema.conditional, '·'],
      ['رمادية', schema.undecided, '?'],
    ];

    for (const [label, keys, mark] of groups) {
      if (!keys.length) continue;
      console.log(`  ── ${label}`);
      for (const k of keys) {
        const present = list.filter((c) => has(parse(c.specs), k));
        const n = present.length;
        const full = n === list.length;
        const required = schema.compat.includes(k) || schema.compare.includes(k);
        if (required && !full) totalMissing += list.length - n;
        console.log(
          `     ${full ? '✔' : mark} ${k.padEnd(18)} ${bar(n, list.length)} ${String(n).padStart(3)}/${list.length}` +
          (full || !required ? '' : `   ينقص ${list.length - n}`)
        );
        if (showParts && required && !full) {
          const missing = list.filter((c) => !has(parse(c.specs), k));
          for (const m of missing.slice(0, 40)) console.log(`          · ${m.brand} ${m.name}`);
          if (missing.length > 40) console.log(`          · … و${missing.length - 40} غيرها`);
        }
      }
    }

    /* مفاتيح في البيانات وليست في المخطّط — هذه ستنزل إلى «المزايا» */
    const known = new Set([...schema.compat, ...schema.compare, ...schema.conditional, ...schema.undecided]);
    const extras: Record<string, number> = {};
    for (const c of list) for (const k of Object.keys(parse(c.specs))) {
      /* المزايا ليست «خارج المخطّط» — لها مكانٌ معرَّف فيه */
      if (!known.has(k) && !isFeatureKey(k)) { extras[k] = (extras[k] || 0) + 1; extrasAll[k] = (extrasAll[k] || 0) + 1; }
    }
    const ex = Object.entries(extras).sort((a, b) => b[1] - a[1]);
    if (ex.length) console.log(`  ── خارج المخطّط (مرشّحة للمزايا): ${ex.map(([k, n]) => `${k}:${n}`).join('  ')}`);
  }

  console.log('\n════════════════════════════════════');
  console.log(`قيم ناقصة في الحقول المفروضة (توافق + مقارنة): ${totalMissing}`);
  const ea = Object.entries(extrasAll).sort((a, b) => b[1] - a[1]);
  console.log(`مفاتيح خارج المخطّط كلّياً: ${ea.length}${ea.length ? '  — ' + ea.map(([k, n]) => `${k}:${n}`).join('، ') : ''}`);
  if (!showParts) console.log('\n(أضف --parts لأسماء القطع الناقصة)');

  await prisma.$disconnect();
}

main();
