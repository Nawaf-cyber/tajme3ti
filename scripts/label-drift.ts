/**
 * ============ القوائم التي ما زالت تُعرَّف بالنصّ العربي ============
 *
 * كانت التسميات مكتوبة **مرّتين**: في `lib/spec-labels.ts` وفي نسخةٍ
 * مستقلّة داخل `app/compare/CompareClient.tsx`. وقد افترقتا فعلاً —
 * ١٧ مفتاحاً بحمل اسمين حسب الصفحة — وانكشف الأمر حين ظهر مفتاحٌ جديد
 * في المقارنة بالإنجليزية خاماً. فوُحّدت الخريطة وصار المصدر واحداً.
 *
 * لكن بقي خطرٌ من نوعٍ آخر: صفحة المقارنة تُعرّف صفوفها **بتسميتها
 * العربية** لا بمفتاحها — الترتيب (`ROW_ORDER`) ومنطق الفائز
 * (`HIGHER_IS_BETTER` و`LOWER_IS_BETTER`) كلّها مصفوفات نصوص عربية.
 *
 * فتغييرُ كلمةٍ في `lib/spec-labels.ts` يقطع الوصلة بصمت:
 *   · الصفّ يسقط إلى آخر الجدول (لأنه لم يعد في ROW_ORDER)
 *   · أو يفقد نجمة «الأفضل» (لأنه لم يعد في HIGHER_IS_BETTER)
 * بلا خطأ في البناء ولا في الأنواع.
 *
 * هذه الأداة تمسك ذلك: تقرأ القوائم الثلاث نصّياً وتتأكّد أن كل نصٍّ فيها
 * تسميةٌ حقيقية تُنتجها الخريطة.
 *
 *   npx tsx scripts/label-drift.ts
 */
import { readFileSync } from 'node:fs';
import { specLabelLoose } from '../lib/spec-labels';

const SRC = 'app/compare/CompareClient.tsx';
const src = readFileSync(SRC, 'utf8');

/** كل مفتاحٍ يظهر فعلاً في الكتالوج */
const KEYS = [
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

const KNOWN = new Set(KEYS.map(specLabelLoose));

/** يستخرج نصوص مصفوفةٍ مسمّاة من الملف */
function arrayStrings(name: string): string[] {
  const i = src.indexOf(`const ${name} = [`);
  if (i === -1) throw new Error(`لم تُوجد ${name}`);
  const j = src.indexOf('];', i);
  return [...src.slice(i, j).matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

let bad = 0;
for (const name of ['ROW_ORDER', 'HIGHER_IS_BETTER', 'LOWER_IS_BETTER']) {
  const items = arrayStrings(name);
  const orphans = items.filter((x) => !KNOWN.has(x));
  console.log(`${orphans.length ? '⛔' : '✔'} ${name.padEnd(18)} ${items.length} نصّاً` +
    (orphans.length ? `  ← ${orphans.length} بلا تسمية مقابلة` : ''));
  for (const o of orphans) console.log(`      «${o}» لا تُنتجها الخريطة — الصفّ سيسقط بصمت`);
  bad += orphans.length;
}

/* والعكس: تسميةٌ موجودة ولا ترتيب لها → تظهر في آخر الجدول */
const order = new Set(arrayStrings('ROW_ORDER'));
const unordered = [...KNOWN].filter((l) => !order.has(l));
console.log(`${unordered.length ? '⚠️' : '✔'} تسميات بلا ترتيب: ${unordered.length}` +
  (unordered.length ? `  (${unordered.join('، ')})` : ''));

/* تصادم: مفتاحان بتسمية واحدة → أحدهما يسقط في rowData بصمت */
const byLabel: Record<string, string[]> = {};
for (const k of KEYS) (byLabel[specLabelLoose(k)] ||= []).push(k);
const clashes = Object.entries(byLabel).filter(([, ks]) => ks.length > 1);
console.log(`${clashes.length ? '⛔' : '✔'} تسميةٌ لمفتاحين: ${clashes.length}`);
for (const [l, ks] of clashes) console.log(`      «${l}» ← ${ks.join('، ')}`);

process.exit(bad || clashes.length ? 1 : 0);
