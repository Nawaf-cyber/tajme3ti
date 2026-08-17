/**
 * ============ خريطتا تسميات، ولا أحد يحرسهما ============
 *
 * تسميات المواصفات مكتوبة **مرّتين**:
 *   · `lib/spec-labels.ts`        ← صفحة القطعة وجدول المواصفات
 *   · `app/compare/CompareClient.tsx` ← صفحة المقارنة (نسخة مستقلّة)
 *
 * وقد افترقتا فعلاً: المفتاح الواحد يظهر باسمين مختلفين حسب الصفحة التي
 * فتحها الزائر. وانكشف ذلك حين أُضيف `maxCoolerHeight` إلى الأولى فظهر في
 * المقارنة **بالإنجليزية خاماً** — أي أن كل مفتاح جديد يحتاج تذكّر مكانين.
 *
 * وهذا الدرس نفسه دفعناه في السحب من قبل: منطقٌ مشترك عاش في نسختين،
 * فاحتاج خطأ كازاسوق إصلاحاً مزدوجاً.
 *
 * توحيد الخريطتين ليس تعديلاً صغيراً: صفحة المقارنة تُعرّف كل صفٍّ
 * **بتسميته العربية** لا بمفتاحه (الترتيب، ومنطق الفائز، والفروق المئوية
 * كلّها تقارن نصوصاً عربية). فحتى يُعاد ذلك التصميم، هذه الأداة تجعل
 * الافتراق مرئياً بدل أن يُكتشف بالصدفة في صفحة.
 *
 *   npx tsx scripts/label-drift.ts
 */
import { readFileSync } from 'node:fs';
import { specLabel } from '../lib/spec-labels';

/** يقرأ SPEC_LABELS من ملف المقارنة نصّياً — لأنه مكوّن 'use client' */
function compareLabels(): Record<string, string> {
  const src = readFileSync('app/compare/CompareClient.tsx', 'utf8');
  const start = src.indexOf('const SPEC_LABELS');
  const end = src.indexOf('};', start);
  if (start === -1 || end === -1) throw new Error('لم يُعثر على SPEC_LABELS في CompareClient');
  const body = src.slice(start, end);

  const out: Record<string, string> = {};
  for (const m of body.matchAll(/^\s*([a-z0-9]+)\s*:\s*'([^']+)'/gim)) out[m[1]] = m[2];
  return out;
}

const norm = (k: string) => k.toLowerCase().replace(/[\s_-]/g, '');

/** المفاتيح المستعملة فعلاً في الكتالوج — تُمرَّر من catalog-gaps أو تُكتب هنا */
const LIB_KEYS = [
  'socket', 'cores', 'threads', 'baseClock', 'boostClock', 'l3Cache', 'pCores', 'eCores',
  'integratedGraphics', 'memorySupport', 'architecture',
  'vram', 'memoryType', 'memoryBus', 'lengthMm', 'powerConnectors', 'ports', 'includedAio',
  'chipset', 'ramType', 'maxRam', 'memorySpeed', 'm2Slots', 'pcieVersion',
  'type', 'capacity', 'kit', 'speed', 'casLatency', 'profile', 'rgb', 'color',
  'interface', 'readSpeed', 'writeSpeed', 'formFactor',
  'wattage', 'rating', 'modularity',
  'maxGpuLength', 'maxCoolerHeight', 'psuFormFactor', 'radiatorSupport', 'includedFans',
  'frontPanel', 'sidePanel', 'dualChamber', 'verticalGpu', 'pcieRiser', 'cableManagement', 'screen',
];

const cmp = compareLabels();

const onlyLib: string[] = [];
const differs: [string, string, string][] = [];

for (const key of LIB_KEYS) {
  const a = specLabel(key);
  const b = cmp[norm(key)];
  if (b == null) { onlyLib.push(`${key}  →  «${a}»`); continue; }
  if (a !== b) differs.push([key, a, b]);
}

console.log(`مفاتيح مفحوصة: ${LIB_KEYS.length}\n`);

/* ============ تصادم التسميات ============
 *
 * صفحة المقارنة تبني الصفّ من التسمية ثم تبحث عن مفتاحها هكذا:
 *   Object.keys(specs).find((k) => specLabel(k) === label)
 *
 * فلو حملت قطعةٌ **مفتاحين** يؤدّيان إلى التسمية نفسها، عُرض أوّلهما
 * وسقط الثاني بصمت — بلا خطأ ولا أثر. لذا يُفحص التصادم هنا لا في صفحة.
 */
const byLabel: Record<string, string[]> = {};
for (const key of LIB_KEYS) {
  const l = cmp[norm(key)];
  if (!l) continue;
  (byLabel[l] = byLabel[l] || []).push(key);
}
const clashes = Object.entries(byLabel).filter(([, keys]) => keys.length > 1);
if (clashes.length) {
  console.log(`⚠️ تسميةٌ واحدة لمفتاحين أو أكثر (${clashes.length}) — لو اجتمعا في قطعة سقط أحدهما بصمت:`);
  for (const [l, keys] of clashes) console.log(`   «${l}»  ←  ${keys.join('، ')}`);
  console.log('');
} else {
  console.log('✔ لا تسمية مشتركة بين مفتاحين\n');
}

if (onlyLib.length) {
  console.log(`⛔ في lib/spec-labels ولا تسمية لها في المقارنة (${onlyLib.length}) — ستظهر بالإنجليزية:`);
  onlyLib.forEach((l) => console.log('   ' + l));
} else {
  console.log('✔ كل مفتاح في lib له تسمية في المقارنة');
}

if (differs.length) {
  console.log(`\n⚠️ تسميتان مختلفتان للمفتاح الواحد (${differs.length}) — الاسم يتغيّر بتغيّر الصفحة:`);
  console.log(`   ${'المفتاح'.padEnd(20)} ${'صفحة القطعة'.padEnd(24)} صفحة المقارنة`);
  for (const [k, a, b] of differs) console.log(`   ${k.padEnd(20)} ${a.padEnd(24)} ${b}`);
} else {
  console.log('\n✔ لا اختلاف في التسميات');
}

process.exit(onlyLib.length ? 1 : 0);
