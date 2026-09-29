/* ============ هل لكلّ قطعةٍ سلسلةٌ واحدة بالضبط؟ ============
 *
 * lib/series.ts يطابق بالاسم — وهذا يشغّله على الكتالوج الحقيقيّ:
 * صفرُ قطعٍ بلا سلسلة، وصفرُ قطعٍ بسلسلتين. **يقرأ ولا يكتب.**
 *
 *   npx tsx scripts/series-check.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { matchSeries, seriesLine, warrantyText } from '../lib/series';

const G = '\x1b[32m', R = '\x1b[31m', X = '\x1b[0m';
let pass = 0, fail = 0;
const check = (t: string, ok: boolean, d = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${t}`); } else { fail++; console.log(`  ${R}✘ ${t}${X}  ${d}`); }
};

let rowsAll: { brand: string; name: string }[] = [];

async function main() {
  rowsAll = await prisma.component.findMany({ where: { category: { name: 'PSU' } }, select: { brand: true, name: true } });
  for (const category of ['PSU']) {
    const rows = await prisma.component.findMany({ where: { category: { name: category } }, select: { brand: true, name: true }, orderBy: [{ brand: 'asc' }, { name: 'asc' }] });
    console.log(`\n${category} — ${rows.length} قطعة`);
    const none: string[] = [], many: string[] = [];
    for (const r of rows) {
      const m = matchSeries(r, category);
      if (m.length === 0) none.push(`${r.brand} ${r.name}`);
      else if (m.length > 1) many.push(`${r.brand} ${r.name} → ${m.map((s) => s.label).join(' + ')}`);
      else console.log(`    ${r.brand.padEnd(14)} ${r.name.padEnd(34)} ${seriesLine(m[0])}`);
    }
    check(`كلُّها لها سلسلة (${rows.length - none.length}/${rows.length})`, none.length === 0, none.join(' · '));
    check('ولا قطعة بسلسلتين', many.length === 0, many.join(' · '));
  }

  console.log('\nالقواعد');
  const s = (brand: string, name: string) => matchSeries({ brand, name }, 'PSU')[0];
  check('RMe ضمانها 7 لا 10 (صفحة المنتج تغلب الدليل العامّ)', s('Corsair', 'RM750e')?.warranty?.max === 7);
  check('RMx SHIFT لا تُحسب RMx', s('Corsair', 'RM850x Shift 850W Gold')?.label === 'RMx SHIFT');
  check('RM (2021) خارج السُّلَّم', !s('Corsair', 'RM850 (2021)')?.rank && !!s('Corsair', 'RM850 (2021)')?.offLadder);
  check('MSI A-DN بلا ضمان — لم تنشره الشركة', !s('MSI', 'MAG A600DN')?.warranty);
  check('الشركة تُطابق بلا اعتبار للحالة', s('corsair', 'RM750e')?.label === 'RMe');
  check('شركةٌ بلا سُلَّم ← لا درجة', !s('DeepCool', 'PL550D')?.rank && !s('DeepCool', 'PL550D')?.ladder);
  check('«12 سنة» · «7 سنوات» · مدى', warrantyText({ min: 12, max: 12 }) === '12 سنة' && warrantyText({ min: 7, max: 7 }) === '7 سنوات' && warrantyText({ min: 7, max: 10 }) === '7 إلى 10 سنوات');
  check('فئةٌ بلا بيانات ← لا شيء', matchSeries({ brand: 'Corsair', name: 'Vengeance 32GB' }, 'RAM').length === 0);

  console.log('\nالملاحظات');
  const iss = (brand: string, name: string) => s(brand, name)?.issues ?? [];
  check('ملاحظة الموديل تخصّه: A850GL نعم، A750GL لا (عليه ملاحظة السلسلة وحدها)', iss('MSI', 'MAG A850GL PCIe 5').some((i) => i.text.startsWith('أداؤه')) && !iss('MSI', 'MAG A750GL PCIe 5').some((i) => i.text.startsWith('أداؤه')));
  check('ملاحظة السلسلة تعمّ: كلُّ RMe', ['RM750e', 'RM1000e', 'RM850e 850W ATX 3.1 Gold White'].every((n) => iss('Corsair', n).length === 1));
  check('الاستدعاء المنتهي موسوم', !!iss('Corsair', 'SF750 Platinum SFX')[0]?.resolved);
  check('ولا يعمّ SF850 — صدر بعد دفعات 2019-2020', iss('Corsair', 'SF850 Platinum SFX').length === 0);
  check('SHIFT: شرط التركيب رسميّ', iss('Corsair', 'RM850x Shift 850W Gold')[0]?.level === 'official');
  check('اختبارٌ نظيف يُقال بمصدره', !!s('be quiet!', 'Pure Power 13 M 850W')?.cleanTest && iss('be quiet!', 'Pure Power 13 M 850W').length === 0);
  check('لا ملاحظة بلا مصدر https', rowsAll.every((r) => (matchSeries(r, 'PSU')[0]?.issues ?? []).every((i) => i.sources.length > 0 && i.sources.every((x) => x.url.startsWith('https://')))));
  check('«متداول» غير مستعمل الآن', rowsAll.every((r) => (matchSeries(r, 'PSU')[0]?.issues ?? []).every((i) => i.level !== 'reported')));
  check('A850GL: ملاحظة السلسلة وملاحظته معاً', iss('MSI', 'MAG A850GL PCIe 5').length === 2 && iss('MSI', 'MAG A650GL').length === 1);
  check('A-BN: A550BN وA650BN نعم، A750BN PCIe 5 III لا', iss('MSI', 'MAG A550BN').length === 1 && iss('MSI', 'MAG A650BN').length === 1 && iss('MSI', 'MAG A750BN PCIe 5 III').length === 0);
  check('اختبار SF850 النظيف لا يُنسب لـSF750', !!s('Corsair', 'SF850 Platinum SFX')?.cleanTest && !s('Corsair', 'SF750 Platinum SFX')?.cleanTest);
  check('Power Zone 2 نظيف باختباره هو لا باختبار Pure Power', s('be quiet!', 'POWER ZONE 2 850W')?.cleanTest?.url.includes('power-zone-2') === true);
  /* الاختبار النظيف لا يجتمع مع ملاحظة اختبار — ويجتمع مع الرسميّة (شرط تركيب SHIFT) */
  check('ولا قطعة بملاحظة اختبارٍ واختبارٍ نظيفٍ معاً', rowsAll.every((r) => { const x = matchSeries(r, 'PSU')[0]; return !(x?.issues.some((i) => i.level === 'tested') && x?.cleanTest); }));
  check('SHIFT: الشرط الرسميّ والاختبار النظيف معاً', iss('Corsair', 'RM850x Shift 850W Gold')[0]?.level === 'official' && !!s('Corsair', 'RM850x Shift 850W Gold')?.cleanTest);
  const silent = rowsAll.filter((r) => { const x = matchSeries(r, 'PSU')[0]; return !x?.issues.length && !x?.cleanTest; });
  console.log(`    بلا شيء (لا اختبار مطابق): ${silent.map((r) => r.name).join(' · ')}`);
  const withIssues = rowsAll.filter((r) => (matchSeries(r, 'PSU')[0]?.issues.length ?? 0) > 0);
  console.log(`    ${withIssues.length} من ${rowsAll.length} مزوّداً عليه ملاحظة: ${withIssues.map((r) => r.name).join(' · ')}`);

  console.log(`\n${'═'.repeat(46)}`);
  console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
  await prisma.$disconnect();
  if (fail) process.exit(1);
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
