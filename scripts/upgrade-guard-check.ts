/* ============ هل نقترح ترقيةً ليست ترقية؟ ============
 *
 * ⚠️ كلُّ حالةٍ هنا وقعت فعلاً أو كادت — رصدها نوّاف في بطاقة جهازه:
 * «أضعف حلقة: Ryzen 5 **9600x**» ثمّ «أرخص ترقية: Ryzen 5 **9600**».
 * وهي نفس الشريحة بلاحقةٍ أدنى.
 *
 *   npx tsx scripts/upgrade-guard-check.ts
 */
import { baseModel, sameChip, specDominates, upgradeRejectReason } from '../lib/upgrade-guard';
const G = '\x1b[32m', R = '\x1b[31m', X = '\x1b[0m';
let pass = 0, fail = 0;
const t = (ok: boolean, title: string, d = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${title}`); } else { fail++; console.log(`  ${R}✘ ${title}${X} ${d}`); }
};

const cpu = (name: string, cores: string, threads: string, boost: string, l3: string) =>
  ({ name, specs: { cores, threads, boostClock: boost, l3Cache: l3 } });

console.log('\nرقمُ الطراز:');
t(baseModel('Ryzen 5 9600X') === '9600', 'Ryzen 5 9600X → 9600', String(baseModel('Ryzen 5 9600X')));
t(baseModel('Core Ultra 7 265KF') === '265', 'Core Ultra 7 265KF → 265', String(baseModel('Core Ultra 7 265KF')));
t(baseModel('Core i5-14600K') === '14600', 'Core i5-14600K → 14600', String(baseModel('Core i5-14600K')));
t(baseModel('GeForce RTX 5070 Ti') === '5070', 'RTX 5070 Ti → 5070', String(baseModel('GeForce RTX 5070 Ti')));

console.log('\nالحالة التي رصدها نوّاف:');
{
  const cur = cpu('Ryzen 5 9600x', '6', '12', '5.4 GHz', '32MB');
  const cand = cpu('Ryzen 5 9600', '6', '12', '5.2 GHz', '32MB');
  t(sameChip(cand, cur), '9600 و9600x شريحةٌ واحدة');
  t(upgradeRejectReason('CPU', cand, cur) !== null, 'فلا يُقترح الأدنى ترقيةً للأعلى', String(upgradeRejectReason('CPU', cand, cur)));
}
{
  /* والعكس ممنوعٌ أيضاً — لا نقترح 9600x لمن عنده 9600، فهي نفس الشريحة */
  const cur = cpu('Ryzen 5 9600', '6', '12', '5.2 GHz', '32MB');
  const cand = cpu('Ryzen 5 9600x', '6', '12', '5.4 GHz', '32MB');
  t(upgradeRejectReason('CPU', cand, cur) !== null, 'ولا الأعلى للأدنى — الفرقُ لاحقةٌ لا ترقية');
}

console.log('\nوالترقيةُ الحقيقيّة تمرّ:');
{
  const cur = cpu('Ryzen 5 8500G', '6', '12', '5.0 GHz', '16MB');
  const cand = cpu('Ryzen 5 8400F', '6', '12', '4.7 GHz', '16MB');
  /* ⚠️ 8400F ترقيةٌ بمعمارٍ (Zen 4 مقابل Zen 4c) لا بتردّد — ومواصفاتُنا
     لا تحمل ذلك، فتردّده **أقلّ**. والحارس يرفضه، وهو صوابٌ: ما لا نملك
     دليلَه لا نوصي به. */
  t(upgradeRejectReason('CPU', cand, cur) !== null, '8500G ← 8400F يُرفض: تردّدُه أقلّ ولا دليل عندنا على العكس');
}
{
  const cur = cpu('Ryzen 5 7600', '6', '12', '5.1 GHz', '32MB');
  const cand = cpu('Ryzen 7 9700X', '8', '16', '5.5 GHz', '32MB');
  t(upgradeRejectReason('CPU', cand, cur) === null, '7600 ← 9700X يمرّ: أكثر نوىً وخيوطاً وتردّداً');
  t(specDominates('CPU', cand, cur) === true, 'ويسيطر على كلّ المحاور');
}
{
  const cur = cpu('Ryzen 5 7600', '6', '12', '5.1 GHz', '32MB');
  const cand = cpu('Ryzen 9 7900', '12', '24', '5.4 GHz', '64MB');
  t(upgradeRejectReason('CPU', cand, cur) === null, '7600 ← 7900 يمرّ');
}

console.log('\nوكرتُ الشاشة لا يُحكم بمواصفاته:');
{
  /* ⚠️ مواصفاتُنا عن الكروت ليست رتبيّة: ٨ جيجابايت من جيلٍ جديد تسبق
     ١٦ من جيلٍ قديم. فادّعاءُ الترتيب فيها اختراع. */
  const cur = { name: 'GeForce RTX 4060', specs: { vram: '8GB' } };
  const cand = { name: 'Intel Arc A770', specs: { vram: '16GB' } };
  t(specDominates('GPU', cand, cur) === null, 'لا حكمَ بالمواصفات على الكروت');
  t(upgradeRejectReason('GPU', cand, cur) === null, 'فيبقى الحكمُ للدرجة وحدها — وهي ما تحتاج مراجعة');
}

console.log(`\n${'═'.repeat(52)}`);
console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
if (fail) process.exit(1);
