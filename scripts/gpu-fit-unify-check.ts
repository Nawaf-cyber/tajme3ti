/* ============ هل غيّر توحيدُ «طول الكرت ومساحة الكيس» حكماً؟ ============
 *
 * كانت المقارنة منسوخةً ١٤ مرّةً في ٧ ملفّات بخمس صيغ (lib/fit.ts · gpuFitsCase).
 * وهذا يُشغّل **كلَّ صيغةٍ قديمة كما كانت حرفاً** والجديدة على كلّ زوجٍ
 * (كرت × كيس) حقيقيّ في الكتالوج، ويعدّ أين تختلف. المطلوب صفر — وأيُّ
 * اختلافٍ يُطبع بزوجه وأرقامه ليُفهم لا ليُسكت.
 *
 * **يقرأ ولا يكتب.**
 *
 *   npx tsx scripts/gpu-fit-unify-check.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { gpuFitsCase, gpuFitVerdict, shortestGpuMm, shownGpuLengthMm } from '../lib/fit';
import { checkBuild } from '../lib/build-check';

const G = '\x1b[32m', R = '\x1b[31m', X = '\x1b[0m';
let pass = 0, fail = 0;
const check = (t: string, ok: boolean, d = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${t}`); } else { fail++; console.log(`  ${R}✘ ${t}${X}  ${d}`); }
};
const sp = (s: unknown): Record<string, any> => (typeof s === 'string' ? JSON.parse(s) : ((s as any) || {}));

/* ---- الصيغ القديمة، منسوخةً كما كانت قبل التوحيد ---- */
const old = {
  /** lib/build-check.ts — numOf ينظّف الرقم */
  checkBuild: (g: any, c: any) => {
    const numOf = (v: unknown) => { const n = parseFloat(String(v ?? '').replace(/[^\d.]/g, '')); return Number.isFinite(n) && n > 0 ? n : null; };
    const len = numOf(g.lengthMm), max = numOf(c.maxGpuLength);
    return !!(len && max && len > max);
  },
  /** الباني (عند الاختيار وفي القائمة) + المُوالِف بصيغة < + لوحة التجميعات الجاهزة */
  builder: (g: any, c: any) => !!(g.lengthMm && c.maxGpuLength && parseFloat(g.lengthMm) > parseFloat(c.maxGpuLength)),
  /** BuildTuner */
  tuner: (g: any, c: any) => { const len = parseFloat(g.lengthMm), max = parseFloat(c.maxGpuLength); return !isNaN(len) && !isNaN(max) && len > max; },
  /** app/build/[id] + اقتراحات الترقية في الباني: يمرّ إن… */
  buildPagePasses: (g: any, c: any) => parseFloat(g.lengthMm || '0') <= parseFloat(c.maxGpuLength || '999'),
  /** app/builds/page + التجميعة الآليّة في الباني — مولّد: يمرّ إن… */
  buildsPasses: (g: any, c: any) => parseFloat(c.maxGpuLength || '999') >= parseFloat(g.lengthMm || '320'),
  /** AutoBuildsSection — مولّد، ويقرأ length بديلاً */
  autoPasses: (g: any, c: any) => parseFloat(c.maxGpuLength || '999') >= parseFloat(g.lengthMm || g.length || '320'),
};

async function main() {
  const gpus = await prisma.component.findMany({ where: { category: { name: 'GPU' } }, select: { name: true, specs: true } });
  const cases = await prisma.component.findMany({ where: { category: { name: 'Case' } }, select: { name: true, specs: true } });
  console.log(`${gpus.length} كرتاً × ${cases.length} كيساً = ${gpus.length * cases.length} زوجاً\n`);

  const diffs: Record<string, string[]> = {};
  const note = (k: string, g: any, c: any, gs: any, cs: any) =>
    (diffs[k] ??= []).push(`${g.name} (${gs.lengthMm ?? gs.length ?? '—'}) × ${c.name} (${cs.maxGpuLength ?? '—'})`);

  let blocks = 0;
  for (const g of gpus) for (const c of cases) {
    const gs = sp(g.specs), cs = sp(c.specs);
    const blockedNow = gpuFitsCase(gs, cs) === false;
    const genPassNow = gpuFitsCase(gs, cs, { unknownGpuMm: 320 }) !== false;
    if (blockedNow) blocks++;

    if (old.checkBuild(gs, cs) !== blockedNow) note('الفحص الموحّد', g, c, gs, cs);
    if (old.builder(gs, cs) !== blockedNow) note('الباني ولوحة التجميعات الجاهزة', g, c, gs, cs);
    if (old.tuner(gs, cs) !== blockedNow) note('المُوالِف', g, c, gs, cs);
    if (old.buildPagePasses(gs, cs) !== !blockedNow) note('صفحة التجميعة', g, c, gs, cs);
    if (old.buildsPasses(gs, cs) !== genPassNow) note('صفحة التجميعات', g, c, gs, cs);
    if (old.autoPasses(gs, cs) !== genPassNow) note('التجميعات الآليّة', g, c, gs, cs);

    /* والفحص الموحّد نفسه بعد التوحيد: يقرأ من gpuFitsCase */
    const viaCheck = checkBuild({ GPU: { specs: gs }, Case: { specs: cs } }).some((i) => i.code === 'gpuLength');
    if (viaCheck !== blockedNow) note('checkBuild بعد التوحيد', g, c, gs, cs);
  }

  console.log(`١) الأحكام على البيانات الحقيقيّة (${blocks} زوجاً «لا يدخل»)`);
  for (const k of ['الفحص الموحّد', 'الباني ولوحة التجميعات الجاهزة', 'المُوالِف', 'صفحة التجميعة', 'صفحة التجميعات', 'التجميعات الآليّة', 'checkBuild بعد التوحيد']) {
    const d = diffs[k] ?? [];
    check(`${k}: ${d.length} اختلاف`, d.length === 0, d.slice(0, 4).join(' · '));
  }

  console.log('\n٢) القاعدة');
  check('أطول من المساحة ← لا يدخل', gpuFitsCase({ lengthMm: '304.4' }, { maxGpuLength: '290' }) === false);
  check('مساوٍ للمساحة ← يدخل', gpuFitsCase({ lengthMm: '290' }, { maxGpuLength: '290' }) === true);
  check('طولٌ غائب ← لا نعرف', gpuFitsCase({}, { maxGpuLength: '290' }) === null);
  check('مساحةٌ غائبة ← لا نعرف', gpuFitsCase({ lengthMm: '300' }, {}) === null);
  check('المولّد يفترض المجهول ٣٢٠', gpuFitsCase({}, { maxGpuLength: '310' }, { unknownGpuMm: 320 }) === false);
  check('«268.3 mm» يُقرأ ٢٦٨٫٣', gpuFitsCase({ lengthMm: '268.3 mm' }, { maxGpuLength: '268' }) === false);
  check('المفتاح البديل length يُقرأ', gpuFitsCase({ length: '330' }, { maxGpuLength: '320' }) === false);

  /* ٣) الطول لكلّ عرض — صفّ 5070 كما قِيس 2026-09-25، وكيسٌ يتّسع ٢٩٠ */
  console.log('\n٣) الطول لكلّ عرض');
  const offer = (store: string, price: number, lengthMm: number | null, inStock = true) =>
    ({ price, inStock, url: 'https://x', lengthMm, store: { name: store, sortOrder: 1 } });
  const rtx5070 = {
    specs: { lengthMm: '282' },
    offers: [offer('ريد زون', 3499, 304.4), offer('أمازون', 3699, 282), offer('مايكرولس', 3981, 329)],
  };
  const c290 = { maxGpuLength: '290' };
  check('بعضُ النسخ تدخل ← some', gpuFitVerdict(rtx5070, c290) === 'some');
  check('كلُّها تدخل كيساً ٣٤٠ ← true', gpuFitVerdict(rtx5070, { maxGpuLength: '340' }) === true);
  check('لا شيء يدخل ٢٨٠ ← false', gpuFitVerdict(rtx5070, { maxGpuLength: '280' }) === false);
  check('النافد لا يُحسب', gpuFitVerdict({ specs: {}, offers: [offer('أ', 1, 282), offer('ب', 1, 400, false)] }, c290) === true);
  check('عرضٌ بلا طول يأخذ طول صفّه', gpuFitVerdict({ specs: { lengthMm: '300' }, offers: [offer('أ', 1, null)] }, c290) === false);
  check('بلا عروضٍ متوفّرة ← طول الصفّ', gpuFitVerdict({ specs: { lengthMm: '282' }, offers: [] }, c290) === true);
  check('أقصر نسخة = ٢٨٢', shortestGpuMm(rtx5070) === 282);
  check('الكرت المعروض سعرُه = الأرخص (ZOTAC ٣٠٤٫٤)', shownGpuLengthMm(rtx5070) === 304.4);
  const warn = checkBuild({ GPU: rtx5070 as any, Case: { specs: c290 } }).find((i) => i.code === 'gpuLengthSome');
  check('الفحص الموحّد ينبّه ولا يمنع', !!warn && warn.level === 'warn', warn?.message ?? 'لا تنبيه');
  check('ويسمّي المتجر الذي تدخل نسخته وسعره', !!warn?.message.includes('أمازون') && !!warn?.message.includes('3699'), warn?.message ?? '');
  check('ويسمّي ما لا يدخل بطوله', !!warn?.message.includes('ريد زون (304.4مم)') && !!warn?.message.includes('مايكرولس (329مم)'), warn?.message ?? '');
  const named = {
    specs: { lengthMm: '282' },
    offers: [
      { ...offer('أمازون', 3699, 282), variant: 'Gigabyte WINDFORCE OC SFF' },
      { ...offer('مايكرولس', 3981, 329), variant: 'ASUS TUF OC' },
    ],
  };
  const namedWarn = checkBuild({ GPU: named as any, Case: { specs: c290 } }).find((i) => i.code === 'gpuLengthSome');
  check('واسمُ النسخة يُذكر مع متجرها', !!namedWarn?.message.includes('Gigabyte WINDFORCE OC SFF من أمازون') && !!namedWarn?.message.includes('ASUS TUF OC من مايكرولس (329مم)'), namedWarn?.message ?? '');
  const block = checkBuild({ GPU: rtx5070 as any, Case: { specs: { maxGpuLength: '280' } } }).find((i) => i.code === 'gpuLength');
  check('ولا شيء يدخل ← منعٌ بأقصر نسخة', !!block && block.message.includes('282'), block?.message ?? 'لا منع');

  console.log(`\n${'═'.repeat(46)}`);
  console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
  await prisma.$disconnect();
  if (fail) process.exit(1);
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
