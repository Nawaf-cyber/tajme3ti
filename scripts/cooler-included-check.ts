/* ============ فحص «هل مع المعالج مبرّد؟» ============
 *
 * ⚠️ سببُ وجوده: تحذيرُ «لا مبرّد» في الباني كان معلَّقاً على تعبيرٍ نمطيّ
 * ضيّق `/^(none|no|لا يوجد)$/` — فأيّ صياغةٍ سواه تُسكته سكوتاً تامّاً،
 * وتخرج تجميعةٌ بلا مبرّدٍ أصلاً بعلامة «توافقٌ تامّ». وهي لا تُقلع.
 *
 * وقد وقع الأمران معاً فعلاً:
 *   • «Included» في حقل Core Ultra 7 265F — نصٌّ لا يُمسكه التعبير.
 *   • «Wraith Stealth» على Ryzen 5 7500F — وعرضانا كلاهما نسخةُ tray بلا
 *     علبةٍ ولا مبرّد، فكان الموقع يَعِد المشتري بمبرّدٍ لن يصله.
 *
 * فيُشغَّل بعد كلّ إضافة معالجٍ:  npx tsx scripts/cooler-included-check.ts
 */
import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { bundledCooler } from '../lib/build-check';

/* ١) الصياغات: لا يجوز أن تُسكت صياغةٌ التحذيرَ إلّا باسم مبرّدٍ معروف */
const CASES: Array<[unknown, 'yes' | 'no' | 'unknown']> = [
  ['None', 'no'], ['none', 'no'], ['لا يوجد', 'no'], ['', 'no'], [null, 'no'], [undefined, 'no'],
  ['N/A', 'no'], ['-', 'no'], ['Not included', 'no'], ['Not Included (tray)', 'no'],
  ['Tray', 'no'], ['OEM', 'no'], ['بدون مبرّد', 'no'],
  ['Wraith Stealth', 'yes'], ['Laminar RM1', 'yes'], ['Laminar RH2', 'yes'],
  ['Included', 'yes'], ['مبرّد مرفق', 'yes'],
  ['???', 'unknown'], ['TBD', 'unknown'],
  /* العلبة فيها مبرّد وبعضُ عروضنا tray — فالجواب «يعتمد على العرض» */
  ['Laminar RM1 (بعض العروض tray)', 'unknown'],
];

(async () => {
  let bad = 0;
  for (const [input, want] of CASES) {
    const got = bundledCooler(input);
    if (got !== want) { bad++; console.log('✗ «' + input + '» → ' + got + ' والمتوقّع ' + want); }
  }
  console.log(bad === 0 ? '✔ الصياغات: ' + CASES.length + ' حالةً كلّها صحيحة' : '✗ ' + bad + ' صياغةً فشلت');

  /* ٢) الكتالوج: «مجهولٌ» مقصودٌ إن ذكر اسم مبرّدٍ مع تحفّظ tray — أمّا
        مجهولٌ بلا اسمٍ أصلاً فهو نصٌّ كتبناه ولا نفهمه، وذاك عطل. */
  const cpus = await prisma.component.findMany({ where: { category: { name: 'CPU' } }, orderBy: { name: 'asc' } });
  const tally: Record<string, number> = { yes: 0, no: 0, unknown: 0 };
  let unnamed = 0;
  for (const c of cpus) {
    const raw = ((c.specs as any) || {}).includedCooler;
    const v = bundledCooler(raw);
    tally[v]++;
    if (v !== 'unknown') continue;
    const named = /wraith|laminar/i.test(String(raw ?? ''));
    if (named) console.log('  ⓘ يعتمد على العرض: ' + c.brand + ' ' + c.name + ' = «' + raw + '»');
    else { unnamed++; console.log('  ✗ نصٌّ لا نفهمه: ' + c.brand + ' ' + c.name + ' = «' + raw + '»'); }
  }
  console.log('مبرّدٌ مؤكَّد: ' + tally.yes + ' · بلا مبرّد: ' + tally.no + ' · يعتمد على العرض: ' + tally.unknown + ' (من ' + cpus.length + ')');

  await prisma.$disconnect();
  process.exit(bad === 0 && unnamed === 0 ? 0 : 1);
})();
