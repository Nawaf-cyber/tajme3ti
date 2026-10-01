/* ============ هل يطابق حدُّ قدرة اللوحة قائمةَ شركتها؟ ============
 *
 * lib/fit · cpuPowerFitsBoard يمنع المعالج فوق حدّ اللوحة. والمرجع قائمة ASUS
 * الرسميّة لمعالجات PRIME A620M-K (قُرئت 2026-09-30): فيها كلّ معالجاتنا دون
 * 170 واط، ولا شيء من 7900X و9950X و9950X3D. فالممنوع يجب أن يساوي الغائب
 * عنها بالضبط — لا أكثر (منعُ ما يعمل) ولا أقلّ. **يقرأ ولا يكتب.**
 *
 *   npx tsx scripts/cpu-power-check.ts
 */
import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { cpuPowerFitsBoard } from '../lib/fit';
import { checkBuild } from '../lib/build-check';

const G = '\x1b[32m', R = '\x1b[31m', X = '\x1b[0m';
let pass = 0, fail = 0;
const check = (t: string, ok: boolean, d = '') => { if (ok) { pass++; console.log(`  ${G}✔${X} ${t}`); } else { fail++; console.log(`  ${R}✘ ${t}${X}  ${d}`); } };
const sp = (s: unknown): any => (typeof s === 'string' ? JSON.parse(s) : s ?? {});

/* غائبةٌ عن قائمة ASUS للوحة — والباقي حاضرٌ فيها */
const NOT_IN_ASUS_LIST = ['Ryzen 9 7900X', 'Ryzen 9 9950X', 'Ryzen 9 9950X3D'];

(async () => {
  const cpus = await prisma.component.findMany({ where: { category: { name: 'CPU' } }, select: { name: true, specs: true } });
  const boards = await prisma.component.findMany({ where: { category: { name: 'Motherboard' } }, select: { name: true, specs: true } });
  const a620k = boards.find((b) => b.name === 'PRIME A620M-K')!;
  const am5 = cpus.filter((c) => sp(c.specs).socket === 'AM5');

  const blocked = am5.filter((c) => cpuPowerFitsBoard(sp(c.specs), sp(a620k.specs))).map((c) => c.name).sort();
  check(`PRIME A620M-K يمنع بالضبط ما غاب عن قائمة ASUS (${blocked.length})`, JSON.stringify(blocked) === JSON.stringify([...NOT_IN_ASUS_LIST].sort()), blocked.join('، '));
  check('9800X3D و9900X يمرّان (tdpWattage فيهما 162، والرسميّة 120)', !cpuPowerFitsBoard(sp(am5.find((c) => c.name === 'Ryzen 7 9800X3D')!.specs), sp(a620k.specs)) && !cpuPowerFitsBoard(sp(am5.find((c) => c.name === 'Ryzen 9 9900X')!.specs), sp(a620k.specs)));
  check('كلّ معالج AM5 له قدرةٌ رسميّة', am5.every((c) => Number(sp(c.specs).tdpW) > 0), am5.filter((c) => !sp(c.specs).tdpW).map((c) => c.name).join('، '));

  const otherPairs = boards.filter((b) => b.name !== 'PRIME A620M-K').flatMap((b) => cpus.filter((c) => cpuPowerFitsBoard(sp(c.specs), sp(b.specs))).map((c) => `${b.name}×${c.name}`));
  check('ولا لوحة غيرها تمنع شيئاً', otherPairs.length === 0, otherPairs.slice(0, 4).join(' · '));

  const issue = checkBuild({ CPU: { specs: sp(am5.find((c) => c.name === 'Ryzen 9 9950X')!.specs) }, Motherboard: { specs: sp(a620k.specs) } }).find((i) => i.code === 'cpuPower');
  check('الفحص الموحّد: منعٌ برسالته', issue?.level === 'block' && issue.message.includes('120'), issue?.message ?? 'لا منع');
  check('وبلا الرقمين لا حكم', cpuPowerFitsBoard({}, { maxCpuTdpW: 120 }) === null && cpuPowerFitsBoard({ tdpW: 170 }, {}) === null);

  console.log(fail === 0 ? `\n${G}نجحت (${pass})${X}` : `\n${R}فشل ${fail} من ${pass + fail}${X}`);
  await prisma.$disconnect();
  if (fail) process.exit(1);
})();
