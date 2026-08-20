/* ============ هل غيّر التوحيدُ حكماً؟ ============
 *
 * وُحّد فحص المقبس ونوع الذاكرة في `lib/fit.ts` بعد أن كان منسوخاً في
 * `PCBuilderClient` (النقص = خطأ) و`BuildTuner` (النقص يمرّ صامتاً).
 *
 * وهذا الفحص يُشغّل **الصيغتين القديمتين** والصيغة الجديدة على كل زوجٍ
 * حقيقيّ في الكتالوج، ويعدّ أين تختلف. المطلوب:
 *
 *   • مقابل الباني: صفر اختلاف — قاعدته هي التي بقيت.
 *   • مقابل المُوالِف: تختلف فقط حيث كانت البيانات ناقصة، وهو العطب.
 *
 * **يقرأ ولا يكتب.**
 *
 *   npx tsx scripts/compat-unify-check.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { socketMatch, ramTypeMatch } from '../lib/fit';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

let pass = 0, fail = 0;
const check = (t: string, ok: boolean, d = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${t}`); } else { fail++; console.log(`  ${R}✘ ${t}${X}  ${d}`); }
};

const sp = (s: unknown): Record<string, any> => (typeof s === 'string' ? JSON.parse(s) : ((s as any) || {}));
const v = (x: unknown) => String(x ?? '').trim();

/* الصيغتان كما كانتا حرفياً قبل التوحيد */
const oldBuilder = (a: unknown, b: unknown): 'ok' | 'gap' | 'clash' =>
  !v(a) || !v(b) ? 'gap' : v(a) !== v(b) ? 'clash' : 'ok';
const oldTuner = (a: unknown, b: unknown): 'ok' | 'gap' | 'clash' =>
  v(a) && v(b) && v(a) !== v(b) ? 'clash' : 'ok'; // النقص كان يُعدّ سليماً

const now = (m: { ok: boolean; unknown: boolean }): 'ok' | 'gap' | 'clash' =>
  m.ok ? 'ok' : m.unknown ? 'gap' : 'clash';

async function main() {
  const all = await prisma.component.findMany({
    include: { category: true },
    orderBy: { name: 'asc' },
  });
  const by = (n: string) => all.filter((c) => c.category.name === n);
  const cpus = by('CPU'), boards = by('Motherboard'), rams = by('RAM');

  console.log(`\nالكتالوج: ${cpus.length} معالج · ${boards.length} لوحة · ${rams.length} رام`);

  /* ١ — هل توجد فجوات بيانات أصلاً؟ */
  console.log('\n١) اكتمال حقول التوافق');
  const gapCpu = cpus.filter((c) => !v(sp(c.specs).socket));
  const gapBoardSock = boards.filter((c) => !v(sp(c.specs).socket));
  const gapBoardRam = boards.filter((c) => !v(sp(c.specs).ramType));
  const gapRam = rams.filter((c) => !v(sp(c.specs).type));
  check(`كل معالج له socket`, gapCpu.length === 0, gapCpu.map((c) => c.name).join('، '));
  check(`كل لوحة لها socket`, gapBoardSock.length === 0, gapBoardSock.map((c) => c.name).join('، '));
  check(`كل لوحة لها ramType`, gapBoardRam.length === 0, gapBoardRam.map((c) => c.name).join('، '));
  check(`كل رام لها type`, gapRam.length === 0, gapRam.map((c) => c.name).join('، '));

  /* ٢ — المقارنة الشاملة */
  console.log('\n٢) كل زوجٍ حقيقيّ — الجديد مقابل القديمَين');
  let pairs = 0, diffBuilder = 0, diffTuner = 0;
  const tunerExamples: string[] = [];

  for (const c of cpus) for (const b of boards) {
    pairs++;
    const n = now(socketMatch(sp(c.specs).socket, sp(b.specs).socket));
    if (n !== oldBuilder(sp(c.specs).socket, sp(b.specs).socket)) diffBuilder++;
    if (n !== oldTuner(sp(c.specs).socket, sp(b.specs).socket)) {
      diffTuner++;
      if (tunerExamples.length < 5) tunerExamples.push(`${c.name} × ${b.name}`);
    }
  }
  for (const r of rams) for (const b of boards) {
    pairs++;
    const n = now(ramTypeMatch(sp(r.specs).type, sp(b.specs).ramType));
    if (n !== oldBuilder(sp(r.specs).type, sp(b.specs).ramType)) diffBuilder++;
    if (n !== oldTuner(sp(r.specs).type, sp(b.specs).ramType)) {
      diffTuner++;
      if (tunerExamples.length < 5) tunerExamples.push(`${r.name} × ${b.name}`);
    }
  }

  console.log(`   ${D}أزواج مفحوصة: ${pairs}${X}`);
  check('لا يختلف عن الباني في زوجٍ واحد', diffBuilder === 0, `اختلف في ${diffBuilder}`);
  if (diffTuner === 0) {
    console.log(`  ${G}✔${X} لا يختلف عن المُوالِف — لا فجوة بيانات في الكتالوج اليوم`);
    console.log(`      ${D}والفرق يبقى حارساً: أي قطعةٍ تُضاف بحقلٍ ناقص سيُحذَّر منها بدل أن تمرّ${X}`);
    pass++;
  } else {
    console.log(`  ${Y}⚠${X} يختلف عن المُوالِف في ${diffTuner} زوجاً — وهذا هو العطب الذي أُصلح`);
    tunerExamples.forEach((e) => console.log(`      ${D}${e}${X}`));
    pass++;
  }

  /* ٣ — القاعدة نفسها على مدخلاتٍ مصنوعة */
  console.log('\n٣) القاعدة الموحّدة');
  check('تعارضٌ مؤكَّد يُمنع', now(socketMatch('AM5', 'LGA1700')) === 'clash');
  check('تطابقٌ يمرّ', now(socketMatch('AM5', 'AM5')) === 'ok');
  check('نقصٌ يُحذَّر منه لا يُمرَّر', now(socketMatch('', 'AM5')) === 'gap');
  check('النقص يسمّي الطرف الناقص', socketMatch('', 'AM5').reason?.includes('المعالج') === true, socketMatch('', 'AM5').reason || '');
  check('الفراغ والمسافات سواء', now(socketMatch('  ', 'AM5')) === 'gap');
  check('الرام كذلك', now(ramTypeMatch('DDR4', 'DDR5')) === 'clash' && now(ramTypeMatch('DDR5', 'DDR5')) === 'ok');

  console.log(`\n${'═'.repeat(46)}`);
  console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
  await prisma.$disconnect();
  if (fail) process.exit(1);
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
