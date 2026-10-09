/**
 * ============ حدّ قدرة المعالج في اللوحات الاقتصاديّة — ٨ لوحات ============
 *
 * «تكلفة المنصّة» تختار أرخص لوحةٍ تقبل المعالج — وهي اقتصاديّةٌ دائماً
 * (A620 وH610 وH810). وحدّ القدرة كان مسجّلاً على واحدةٍ منها فقط، فكتبنا
 * تحت ٣٢ معالجاً من ٤٨ «لم نتحقّق من دعمها لقدرة هذا المعالج» — تحذيرٌ على
 * اللوحة التي رشّحناها نحن.
 *
 * فالرقم من **قائمة المعالجات المدعومة** في موقع كلّ شركة، وكلّها تكتب
 * القدرة بجانب كلّ معالج: maxCpuTdpW = أعلى قدرةٍ في القائمة. قُرئت 2026-10-08.
 * ومعالجٌ فوقه يمنعه lib/fit · cpuPowerFitsBoard بلا سطرٍ جديد.
 *
 * ⚠️ PRIME H610M-K D4 = ١٢٥: قائمة ASUS تخلو من 13900KS و14900KS (١٥٠ واط)،
 *    وأخواتها الثلاث من H610 تذكرهما. فـ13900KS يُمنع عليها — لا يُحذَّر.
 * ⚠️ ASRock تكتب فوق قائمتها: «CPU performance may be limited due to system
 *    configuration» — مدعومٌ لا يعني بلا سقف أداء، وهو سطرٌ رماديّ في المقارنة.
 *
 *   npx tsx scripts/fill-board-cpu-power.ts            # عرض
 *   npx tsx scripts/fill-board-cpu-power.ts --apply
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';

const DATA: Record<string, [number, string]> = {
  'PRO A620M-E': [200, 'https://www.msi.com/Motherboard/PRO-A620M-E/support#cpu'],
  'TUF Gaming A620M-Plus WiFi': [170, 'https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-a620m-plus-wifi/helpdesk_qvl_cpu/'],
  'H610M H DDR4': [150, 'https://www.gigabyte.com/Motherboard/H610M-H-DDR4-rev-10/support#Support-Cpu-Support'],
  'H610M-HDV/M.2+ D5': [150, 'https://www.asrock.com/mb/Intel/H610M-HDVM.2+%20D5/index.asp#CPU'],
  'PRO H610M-G WiFi DDR4': [150, 'https://www.msi.com/Motherboard/PRO-H610M-G-WIFI-DDR4/support#cpu'],
  'PRIME H610M-K D4': [125, 'https://www.asus.com/motherboards-components/motherboards/prime/prime-h610m-k-d4/helpdesk_qvl_cpu/'],
  'H810M H': [125, 'https://www.gigabyte.com/Motherboard/H810M-H-rev-10/support#Support-Cpu-Support'],
  'PRO H810M-B DDR5': [125, 'https://www.msi.com/Motherboard/PRO-H810M-B/support#cpu'],
};

const apply = process.argv.includes('--apply');
(async () => {
  const boards = await prisma.component.findMany({ where: { category: { name: 'Motherboard' }, name: { in: Object.keys(DATA) } }, select: { id: true, name: true, specs: true } });
  const missing = Object.keys(DATA).filter((n) => !boards.some((b) => b.name === n));
  if (missing.length) { console.log('ليست في الكتالوج:', missing.join('، ')); process.exit(1); }
  if (apply) writeFileSync(`backups/board-cpu-power-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(boards, null, 2));
  for (const b of boards) {
    const sp: any = { ...(typeof b.specs === 'string' ? JSON.parse(b.specs) : b.specs || {}) };
    const [w] = DATA[b.name];
    console.log(`${b.name.padEnd(28)} ${sp.maxCpuTdpW ?? '—'} → ${w}`);
    if (apply && sp.maxCpuTdpW !== w) { sp.maxCpuTdpW = w; await prisma.component.update({ where: { id: b.id }, data: { specs: sp } }); }
  }
  console.log(apply ? '\nحُدّثت (نسخةٌ في backups/)' : '\n(عرضٌ فقط — أضف --apply)');
  await prisma.$disconnect();
})();
