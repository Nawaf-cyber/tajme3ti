/* ============ «مرّةً واحدة» — هل تعني مرّةً واحدة؟ ============
 *
 * عطبُ هذه النافذة الوحيد الممكن أن تُعرض مرّتين، ولا يُكتشف إلّا بعد
 * أن يراها المستخدم مرّتين. فيُفحص قبلَه.
 *
 *   npx tsx scripts/rig-prompt-check.ts
 */
import { shouldPromptRig } from '../lib/rig-prompt';
const G = '\x1b[32m', R = '\x1b[31m', X = '\x1b[0m';
let pass = 0, fail = 0;
const t = (ok: boolean, title: string) => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${title}`); } else { fail++; console.log(`  ${R}✘ ${title}${X}`); }
};

console.log('\nمتى تُعرض:');
t(shouldPromptRig({ seenAt: null, currentRigs: 0, savedBuilds: 3 }).show,
  'لم يرها ولا جهازَ له → تُعرض');
t(!shouldPromptRig({ seenAt: new Date(), currentRigs: 0, savedBuilds: 3 }).show,
  'رآها وأغلقها → لا تعود ولو لم يعيّن جهازاً');
t(!shouldPromptRig({ seenAt: null, currentRigs: 1, savedBuilds: 3 }).show,
  'عيّن جهازه من الزرّ بلا نافذة → لا يُعرَّف بما يستعمله');
t(!shouldPromptRig({ seenAt: new Date(), currentRigs: 1, savedBuilds: 3 }).show,
  'رآها وعيّن → لا تعود');

console.log('\nوأيُّ دعوةٍ فيها:');
t(shouldPromptRig({ seenAt: null, currentRigs: 0, savedBuilds: 22 }).hasBuilds,
  'من له تجميعات → «اختر واحدةً منها»');
t(!shouldPromptRig({ seenAt: null, currentRigs: 0, savedBuilds: 0 }).hasBuilds,
  'ومن لا تجميعةَ له → «ابنِ جهازك» (٨٦ من ١٢٩ كذلك)');

console.log(`\n${'═'.repeat(46)}`);
console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
if (fail) process.exit(1);
