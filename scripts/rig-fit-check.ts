/* ============ هل يجيب «يناسب جهازي؟» بالصواب؟ ============
 *
 * كلُّ حالةٍ هنا بقطعٍ حقيقيّةٍ من الكتالوج بأرقامها الفعليّة، لا بمواصفاتٍ
 * مفترضة — فالفحص يكشف تغيّرَ البيانات كما يكشف تغيّرَ المنطق.
 *
 *   npx tsx scripts/rig-fit-check.ts
 */
import { fitsRig, type RigCategory } from '../lib/rig-fit';
import type { BuildParts } from '../lib/build-check';

const G = '\x1b[32m', R = '\x1b[31m', D = '\x1b[2m', X = '\x1b[0m';
let pass = 0, fail = 0;
const t = (ok: boolean, title: string, detail = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${title}`); }
  else { fail++; console.log(`  ${R}✘ ${title}${X} ${detail}`); }
};

/* ---- قطعٌ حقيقيّة (الأرقام من الكتالوج يوم 2026-09-21) ---- */
const R5_7600 = { id: 'cpu1', name: 'Ryzen 5 7600', tdpWattage: 65, specs: { socket: 'AM5', includedCooler: 'Wraith Stealth', integratedGraphics: 'Radeon Graphics' } };
const U7_265KF = { id: 'cpu2', name: 'Core Ultra 7 265KF', tdpWattage: 125, specs: { socket: 'LGA1851', includedCooler: 'None', integratedGraphics: 'None' } };
const B650M = { id: 'mb1', name: 'B650M DS3H', specs: { socket: 'AM5', formFactor: 'Micro-ATX', ramType: 'DDR5', maxRam: '128GB', memorySpeed: '6400' } };

/* Sapphire PULSE 9070 XT — ٣٢٠ مم · ٣٠٤ واط */
const PULSE_9070XT = { id: 'gpu1', name: 'PULSE RX 9070 XT', tdpWattage: 304, specs: { lengthMm: '320' } };
/* MSI VENTUS 2X 5070 — ٢٣٦ مم · ٢٥٠ واط */
const VENTUS_5070 = { id: 'gpu2', name: 'RTX 5070 VENTUS 2X OC', tdpWattage: 250, specs: { lengthMm: '236' } };

/* صفُّ 5070 Ti العامّ — ٣٤٠ مم · ٣٠٠ واط */
const TI_340 = { id: 'gpu3', name: 'GeForce RTX 5070 Ti 16GB', tdpWattage: 300, specs: { lengthMm: '340' } };
/* Lian Li A4-H2O X5 — مبرّد حتى ٥٥ مم · كرت حتى ٣٢٢ */
const A4_H2O = { id: 'case3', name: 'A4-H2O X5', specs: { formFactor: 'Mini-ITX', maxGpuLength: '322', maxCoolerHeight: '55', psuFormFactor: 'SFX', radiatorSupport: '240mm' } };

/* NZXT H210 — كرت حتى ٣٢٥ مم · مبرّد حتى ١٦٥ */
const H210 = { id: 'case1', name: 'H210 Mini ITX', specs: { formFactor: 'Mini-ITX', maxGpuLength: '325', maxCoolerHeight: '165', psuFormFactor: 'ATX', radiatorSupport: '240mm' } };
/* Montech KING 65 PRO — كرت حتى ٤٢٠ */
const KING65 = { id: 'case2', name: 'KING 65 PRO', specs: { formFactor: 'Mid Tower', maxGpuLength: '420', maxCoolerHeight: '175', psuFormFactor: 'ATX', radiatorSupport: '360mm' } };

const PSU_550 = { id: 'psu1', name: 'PL550D', specs: { wattage: '550', formFactor: 'ATX' } };
const PSU_850 = { id: 'psu2', name: 'NZXT C850', specs: { wattage: '850', formFactor: 'ATX' } };

/* Noctua NH-L9a — AM5 وحده · ٣٧ مم */
const NH_L9A = { id: 'cool1', name: 'NH-L9a-AM5', specs: { type: 'Air', sockets: 'AM5', sizeMm: '37' } };
/* Phantom Spirit Vision — ١٦٠ مم */
const PHANTOM_V = { id: 'cool2', name: 'Phantom Spirit 120 Vision EVO', specs: { type: 'Air', sockets: 'AM5/AM4/LGA1851/LGA1700', sizeMm: '160' } };

const has = (v: FitVerdictLike, code: string) => v.issues.some((i) => i.code === code);
type FitVerdictLike = ReturnType<typeof fitsRig>;
const needs = (v: FitVerdictLike, cat: RigCategory) => v.unchecked.some((u) => u.need === cat);

console.log('\nالحكم على المرشَّح وحده:');
{
  /* ⚠️ والحدُّ يُقرأ كما هو: ٣٢٠ مم **يدخل** كيساً يقبل ٣٢٥. وكتبتُ أوّلاً
     أنّه يُمنع فكذّبني الفحص — وهو ما وُجد له. */
  const rig: BuildParts = { CPU: R5_7600, Motherboard: B650M, Case: H210, PSU: PSU_850, Cooler: NH_L9A };
  const v = fitsRig(rig, 'GPU', PULSE_9070XT);
  t(v.state === 'fits', 'كرت ٣٢٠ مم يدخل كيساً يقبل ٣٢٥ — بالكاد', JSON.stringify(v.issues.map((i) => i.code)));
}
{
  /* وصفُّ 5070 Ti العامّ عندنا ٣٤٠ مم — فوق حدّ H210 */
  const rig: BuildParts = { CPU: R5_7600, Motherboard: B650M, Case: H210, PSU: PSU_850, Cooler: NH_L9A };
  const v = fitsRig(rig, 'GPU', TI_340);
  t(v.state === 'block' && has(v, 'gpuLength'), 'وكرت ٣٤٠ مم لا يدخله', JSON.stringify(v.issues.map((i) => i.code)));
}
{
  const rig: BuildParts = { CPU: R5_7600, Motherboard: B650M, Case: H210, PSU: PSU_850, Cooler: NH_L9A };
  const v = fitsRig(rig, 'GPU', VENTUS_5070);
  t(v.state === 'fits' && v.unchecked.length === 0, 'وكرت ٢٣٦ مم يمرّ بلا ملاحظة', JSON.stringify(v));
}
{
  /* ⚠️ A4-H2O X5 يقبل مبرّداً بـ**٥٥ مم** — وهو الرقم الذي جعل نوكتوا
     المنخفضة تستحقّ الإضافة أصلاً. */
  const rig: BuildParts = { CPU: R5_7600, Motherboard: B650M, Case: A4_H2O, PSU: PSU_850 };
  t(fitsRig(rig, 'Cooler', PHANTOM_V).state === 'block', 'مبرّد ١٦٠ مم في كيسٍ يقبل ٥٥ يُمنع');
  t(fitsRig(rig, 'Cooler', NH_L9A).state === 'fits', 'ونوكتوا ٣٧ مم تمرّ');
}

console.log('\nلا تُعرض عيوبُ الجهاز القائمة:');
{
  /* ⚠️ الجوهر: مزوّد ٥٥٠ واط مع معالجٍ ١٢٥. فكرت ٢٥٠ واط يمرّ (٣٧٥+١٠٠
     هامشاً = ٤٧٥)، وكرت ٣٠٤ لا يمرّ (٤٢٩+١٢٢ = ٥٥١). والهامش يكبر بكبر
     الكرت، فالفرق بينهما ليس ٥٤ واطاً بل ٧٦.
     ولو عُرضت نتيجة `checkBuild` كما هي لظهر «wattage» في **كلّ** كرتٍ
     يتصفّحه — حتى الذي لا ذنب له. والفرقُ ينسبه إلى مسبّبه وحده. */
  const rig: BuildParts = { CPU: U7_265KF, Motherboard: B650M, Case: KING65, PSU: PSU_550 };
  const light = fitsRig(rig, 'GPU', VENTUS_5070);
  const heavy = fitsRig(rig, 'GPU', PULSE_9070XT);
  t(!has(light, 'wattage'), 'المزوّد ٥٥٠ يكفي كرت ٢٥٠ واط فلا تحذير');
  t(has(heavy, 'wattage'), 'ولا يكفي كرت ٣٠٤ واط فيُنسب التحذير إليه');
  t(!light.issues.some((i) => i.code === 'socket'), 'ولا يُذكر عطلُ المقبس في صفحة كرت شاشة');
}
{
  /* ⚠️ «لا مبرّد» تحذيرٌ في الجهاز نفسه (265KF بلا مبرّد مرفق). ويجب ألّا
     يظهر حين يتصفّح **مبرّداً** — فالمرشَّح هو حلُّه لا سببُه. */
  const rig: BuildParts = { CPU: U7_265KF, Motherboard: B650M, Case: KING65, PSU: PSU_850 };
  const v = fitsRig(rig, 'Cooler', PHANTOM_V);
  t(!has(v, 'noCooler'), '«لا مبرّد» لا تظهر وهو يتصفّح مبرّداً');
  t(v.state === 'fits', 'ومبرّد ١٦٠ مم في كيسٍ يقبل ١٧٥ يمرّ', JSON.stringify(v.issues));
}
{
  /* والمبرّد الخطأ يُمنع: NH-L9a لمقبس AM5 وحده */
  const rig: BuildParts = { CPU: U7_265KF, Motherboard: B650M, Case: KING65, PSU: PSU_850 };
  const v = fitsRig(rig, 'Cooler', NH_L9A);
  t(v.state === 'block' && has(v, 'coolerSocket'), 'مبرّد AM5 على معالج LGA1851 يُمنع');
}

console.log('\nما لم يُفحص يُقال:');
{
  /* جهازٌ بلا كيسٍ ولا مزوّد — والكرتُ الطويل «يناسب» بالسكوت لولا هذا */
  const rig: BuildParts = { CPU: R5_7600, Motherboard: B650M };
  const v = fitsRig(rig, 'GPU', PULSE_9070XT);
  t(v.state === 'fits', 'بلا كيسٍ ولا مزوّد لا عطلَ يُكتشف');
  t(needs(v, 'Case') && needs(v, 'PSU'), 'لكنّه يقول: لم نفحص الطول ولا الطاقة', JSON.stringify(v.unchecked));
}
{
  /* ⚠️ والقطعةُ المكتوبة نصّاً كالغائبة: بطاقتُه تُظهر كيساً، ونحن لا
     نملك مقاساته. فالسكوت عنها كذبٌ بالسكوت. */
  const rig: BuildParts = { CPU: R5_7600, Motherboard: B650M, Case: H210, PSU: PSU_850 };
  const v = fitsRig(rig, 'GPU', PULSE_9070XT, ['Case']);
  t(v.state === 'fits' && needs(v, 'Case'), 'كيسٌ مكتوبٌ بخطّ اليد → لا يُفحص الطول، ويُقال');
}
{
  const rig: BuildParts = { CPU: R5_7600, Motherboard: B650M, Case: KING65, PSU: PSU_850 };
  const v = fitsRig(rig, 'Storage', { id: 's', name: 'NM790 1TB', specs: { type: 'NVMe M.2' } });
  t(v.state === 'fits' && v.unchecked.length === 0, 'التخزين بلا قيود — ولا يُخترع له شرط');
}

console.log(`\n${'═'.repeat(50)}`);
console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
if (fail) process.exit(1);
