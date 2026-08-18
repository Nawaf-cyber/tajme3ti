/**
 * ============ المراوح المرفقة — ١٧ كيساً ============
 *
 * ⚠️ وأهمّ ما كشفه البحث أن **«بلا مراوح» قيمةٌ حقيقية لا نقص**. ستّة من
 * السبعة عشر تُباع فارغة عمداً — O11 Dynamic EVO وNV5 وY70 Touch وGT502
 * وCH260 و2000D Airflow — لأنها كيسات عرضٍ يشتري صاحبها مراوحه بلونٍ
 * يختاره. وترك الحقل فارغاً يقول «لم نبحث»، وكتابة «لا يوجد» تقول
 * «بحثنا، وهي لا تأتي معه» — وهذا فرقٌ يهمّ المشتري: ميزانيته تحتاج ٣٠٠ ﷼
 * إضافية.
 *
 * ⚠️ وفخّان في نسخ المنتجات:
 *   · Corsair 2000D **Airflow** بلا مراوح، بينما 2000D **RGB** Airflow
 *     يأتي بثلاث. المسجّل عندنا هو الأولى.
 *   · ASUS TUF GT502 بلا مراوح، وGT502 **PLUS** بأربع. المسجّل هو الأولى.
 *
 * المصدر صفحات المصنّعين ومراجعات مستقلّة.
 *
 *   npx tsx scripts/fill-case-fans.ts            # عرض
 *   npx tsx scripts/fill-case-fans.ts --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

/** جزءٌ من الاسم → المراوح المرفقة */
const FANS: [string, string][] = [
  ['2000D Airflow Mini-ITX', 'لا يوجد'],
  ['4000D Airflow', '2x 120mm'],
  ['5000D Airflow', '2x 120mm'],
  ['A4-H2O X5', 'لا يوجد'],
  ['CH260', 'لا يوجد'],
  ['CH560 Digital', '3x 140mm ARGB + 1x 120mm ARGB'],
  ['H210', '2x 120mm'],
  ['MasterBox NR200P', '2x 120mm'],
  ['Meshify 2', '3x 140mm'],
  ['Morpheus', '1x 420mm ARGB'],
  ['NV5', 'لا يوجد'],
  ['North XL', '3x 140mm PWM'],
  ['O11 Dynamic EVO', 'لا يوجد'],
  ['TUF GT502', 'لا يوجد'],
  ['Tower 300', '2x 140mm'],
  ['Y70 Touch', 'لا يوجد'],
  ['Y60', '3x 120mm'],
];

const parse = (s: unknown): Record<string, any> =>
  typeof s === 'string' ? JSON.parse(s) : ((s as any) || {});

async function main() {
  const apply = process.argv.includes('--apply');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const cases = await prisma.component.findMany({
    where: { category: { name: 'Case' } },
    select: { id: true, brand: true, name: true, specs: true },
    orderBy: { name: 'asc' },
  });

  const updates: { id: string; specs: any }[] = [];
  const unmatched: string[] = [];

  for (const c of cases) {
    const specs = { ...parse(c.specs) };
    if (String(specs.includedFans ?? '').trim()) continue;

    /* الأطول أوّلاً: «Y70 Touch» قبل «Y60» لا يهمّ، لكن «2000D Airflow
       Mini-ITX» يجب أن يسبق «...Airflow» العامّة لو أُضيفت لاحقاً. */
    const hit = [...FANS].sort((a, b) => b[0].length - a[0].length)
      .find(([frag]) => c.name.includes(frag));
    if (!hit) { unmatched.push(`${c.brand} ${c.name}`); continue; }

    specs.includedFans = hit[1];
    updates.push({ id: c.id, specs });
    console.log(`  ${(c.brand + ' ' + c.name).padEnd(38).slice(0, 38)} → ${hit[1]}`);
  }

  console.log(`\nستُملأ: ${updates.length} · بلا قيمة: ${unmatched.length}`);
  for (const u of unmatched) console.log(`   ⚠️ ${u}`);
  if (unmatched.length) { await prisma.$disconnect(); process.exit(1); }

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); return; }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/case-fans-before-${stamp}.json`,
    JSON.stringify(cases.filter((c) => updates.some((u) => u.id === c.id)), null, 2));
  for (const u of updates) await prisma.component.update({ where: { id: u.id }, data: { specs: u.specs } });
  console.log(`✔ حُدّث ${updates.length} كيساً`);
  await prisma.$disconnect();
}

main();
