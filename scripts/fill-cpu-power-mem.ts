/**
 * ============ استهلاك المعالجات، وأنويتها، والرام المدعوم — ٤٨ معالجاً ============
 *
 * ⚠️ `tdpWattage` كان خليطاً: 14600K = 181 (أقصى سحب) وأخوه 14600KF = 125
 * (القدرة الأساسيّة) وهما الشريحة نفسها. فقال حكم المقارنة «أقلّ استهلاكاً»
 * عن معالجٍ لأنّ رقمه سُجّل بمعيارٍ آخر. والباني يجمعه لتقدير المزوّد.
 *
 * فصار **أقصى سحبٍ رسميّ** للكلّ — كما الكرت (قدرة اللوحة كاملة):
 *   إنتل: Maximum Turbo Power من قائمة إنتل (ARK).
 *   AMD:  PPT = ١٫٣٥ × TDP، قاعدة AMD المنشورة للمقبسين AM4 وAM5:
 *         65→88 · 105→142 · 120→162 · 170→230.
 * والقدرة الرسميّة (TDP / Processor Base Power) في `tdpW` — يقرؤها فحص
 * اللوحة (lib/fit · cpuPowerFitsBoard) ولا تتغيّر لـAMD. وتُضاف لإنتل.
 *
 * والأنوية: أداء + كفاءة لمعالجات إنتل كلّها (الهجينة وغيرها: 12400F = 6+0).
 * والرام المدعوم بالسرعة الرسميّة لا «DDR5» وحدها.
 *
 * قُرئ 2026-10-08. 250K Plus و270K Plus وF/non-K من Arrow Lake تحقّقنا منها
 * بقائمة Corsair وNotebookcheck الناقلتين عن إنتل (159/250، 121/182/182).
 *
 *   npx tsx scripts/fill-cpu-power-mem.ts            # عرض
 *   npx tsx scripts/fill-cpu-power-mem.ts --apply
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';

type Row = { max: number; tdp: number; p?: number; e?: number; mem: string };

const D5_4800 = 'DDR5-4800 / DDR4-3200';
const D5_5600_D4 = 'DDR5-5600 / DDR4-3200';
const AM5_7000 = 'DDR5-5200';
const AM5_9000 = 'DDR5-5600';
const AL = 'DDR5-6400';

/* الاسم كما في الكتالوج (بلا العلامة) → القيم */
const DATA: Record<string, Row> = {
  // ── Intel 12th
  'Core i5-12400F': { max: 117, tdp: 65, p: 6, e: 0, mem: D5_4800 },
  'Core i7-12700K': { max: 190, tdp: 125, p: 8, e: 4, mem: D5_4800 },
  // ── Intel 13th
  'Core i3-13100F': { max: 89, tdp: 58, p: 4, e: 0, mem: D5_4800 },
  'Core i5-13400F': { max: 148, tdp: 65, p: 6, e: 4, mem: D5_4800 },
  'Core i5-13600KF': { max: 181, tdp: 125, p: 6, e: 8, mem: D5_5600_D4 },
  'Core i7-13700K': { max: 253, tdp: 125, p: 8, e: 8, mem: D5_5600_D4 },
  'Core i9-13900KS': { max: 253, tdp: 150, p: 8, e: 16, mem: D5_5600_D4 },
  // ── Intel 14th
  'Core i3-14100F': { max: 110, tdp: 58, p: 4, e: 0, mem: D5_4800 },
  'Core i5-14400F': { max: 148, tdp: 65, p: 6, e: 4, mem: D5_4800 },
  'Core i5-14500': { max: 154, tdp: 65, p: 6, e: 8, mem: D5_4800 },
  'Core i5-14600K': { max: 181, tdp: 125, p: 6, e: 8, mem: D5_5600_D4 },
  'Core i5-14600KF': { max: 181, tdp: 125, p: 6, e: 8, mem: D5_5600_D4 },
  'Core i7-14700': { max: 219, tdp: 65, p: 8, e: 12, mem: D5_5600_D4 },
  'Core i7-14700K': { max: 253, tdp: 125, p: 8, e: 12, mem: D5_5600_D4 },
  'Core i9-14900K': { max: 253, tdp: 125, p: 8, e: 16, mem: D5_5600_D4 },
  // ── Intel Core Ultra 200S (Arrow Lake) — DDR5 وحدها
  'Core Ultra 5 225F': { max: 121, tdp: 65, p: 6, e: 4, mem: AL },
  'Core Ultra 5 245K': { max: 159, tdp: 125, p: 6, e: 8, mem: AL },
  'Core Ultra 5 250K': { max: 159, tdp: 125, p: 6, e: 12, mem: 'DDR5-7200' },
  'Core Ultra 7 265F': { max: 182, tdp: 65, p: 8, e: 12, mem: AL },
  'Core Ultra 7 265K': { max: 250, tdp: 125, p: 8, e: 12, mem: AL },
  'Core Ultra 7 265KF': { max: 250, tdp: 125, p: 8, e: 12, mem: AL },
  'Core Ultra 7 270K': { max: 250, tdp: 125, p: 8, e: 16, mem: 'DDR5-7200' },
  'Core Ultra 9 285': { max: 182, tdp: 65, p: 8, e: 16, mem: AL },
  'Core Ultra 9 285K': { max: 250, tdp: 125, p: 8, e: 16, mem: AL },
  // ── AMD AM4
  'Ryzen 5 5500': { max: 88, tdp: 65, mem: 'DDR4-3200' },
  'Ryzen 5 5600': { max: 88, tdp: 65, mem: 'DDR4-3200' },
  // ── AMD Ryzen 7000 / 8000G
  'Ryzen 5 7500F': { max: 88, tdp: 65, mem: AM5_7000 },
  'Ryzen 5 7600': { max: 88, tdp: 65, mem: AM5_7000 },
  'Ryzen 5 7600X': { max: 142, tdp: 105, mem: AM5_7000 },
  'Ryzen 7 7700': { max: 88, tdp: 65, mem: AM5_7000 },
  'Ryzen 7 7700X': { max: 142, tdp: 105, mem: AM5_7000 },
  'Ryzen 7 7800X3D': { max: 162, tdp: 120, mem: AM5_7000 },
  'Ryzen 9 7900': { max: 88, tdp: 65, mem: AM5_7000 },
  'Ryzen 9 7900X': { max: 230, tdp: 170, mem: AM5_7000 },
  'Ryzen 9 7950X3D': { max: 162, tdp: 120, mem: AM5_7000 },
  'Ryzen 5 8400F': { max: 88, tdp: 65, mem: AM5_7000 },
  'Ryzen 5 8500G': { max: 88, tdp: 65, mem: AM5_7000 },
  'Ryzen 5 8600G': { max: 88, tdp: 65, mem: AM5_7000 },
  'Ryzen 7 8700G': { max: 88, tdp: 65, mem: AM5_7000 },
  // ── AMD Ryzen 9000
  'Ryzen 5 9600': { max: 88, tdp: 65, mem: AM5_9000 },
  'Ryzen 5 9600x': { max: 88, tdp: 65, mem: AM5_9000 },
  'Ryzen 7 9700X': { max: 88, tdp: 65, mem: AM5_9000 },
  'Ryzen 7 9800X3D': { max: 162, tdp: 120, mem: AM5_9000 },
  'Ryzen 7 9850X3D': { max: 162, tdp: 120, mem: AM5_9000 },
  'Ryzen 9 9900X': { max: 162, tdp: 120, mem: AM5_9000 },
  'Ryzen 9 9900X3D': { max: 162, tdp: 120, mem: AM5_9000 },
  'Ryzen 9 9950X': { max: 230, tdp: 170, mem: AM5_9000 },
  'Ryzen 9 9950X3D': { max: 230, tdp: 170, mem: AM5_9000 },
};

const apply = process.argv.includes('--apply');
(async () => {
  const cpus = await prisma.component.findMany({ where: { category: { name: 'CPU' } }, select: { id: true, name: true, tdpWattage: true, specs: true } });
  const missing = cpus.filter((c) => !DATA[c.name]).map((c) => c.name);
  if (missing.length) { console.log('بلا بيانات:', missing.join('، ')); process.exit(1); }

  if (apply) {
    const f = `backups/cpu-power-mem-${new Date().toISOString().slice(0, 10)}.json`;
    writeFileSync(f, JSON.stringify(cpus, null, 2));
    console.log('نسخة احتياطيّة:', f);
  }
  let changed = 0;
  for (const c of cpus) {
    const d = DATA[c.name];
    const sp: any = { ...(typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs || {}) };
    const before = JSON.stringify({ w: c.tdpWattage, tdpW: sp.tdpW, p: sp.pCores, e: sp.eCores, mem: sp.memorySupport });
    /* tdpW لـAMD موجودٌ ويقرؤه فحص اللوحة — يُتحقَّق منه لا يُستبدل بصمت */
    if (sp.tdpW != null && Number(sp.tdpW) !== d.tdp) { console.log(`⚠️ ${c.name}: tdpW ${sp.tdpW} ≠ ${d.tdp} — لم يُغيَّر`); }
    else sp.tdpW = d.tdp;
    if (d.p != null) { sp.pCores = d.p; sp.eCores = d.e; }
    sp.memorySupport = d.mem;
    const after = JSON.stringify({ w: d.max, tdpW: sp.tdpW, p: sp.pCores, e: sp.eCores, mem: sp.memorySupport });
    if (before === after) continue;
    changed++;
    console.log(`${c.name.padEnd(22)} ${before}\n${''.padEnd(22)} ${after}`);
    if (apply) await prisma.component.update({ where: { id: c.id }, data: { tdpWattage: d.max, specs: sp } });
  }
  console.log(`\n${changed} معالجاً ${apply ? 'حُدّث' : 'سيُحدَّث (أضف --apply)'}`);
  await prisma.$disconnect();
})();
