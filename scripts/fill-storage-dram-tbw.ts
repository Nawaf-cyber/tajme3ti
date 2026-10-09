/**
 * ============ التخزين: ذاكرة DRAM والتحمّل (TBW) — ٤٠ قرصاً ============
 *
 * جدول المقارنة كان يقول السعة والسرعة وحدهما، فيبدو NV3 مثل KC3000 —
 * والفرق في ما لا يُرى في السرعة القصوى: KC3000 فيه ذاكرة DRAM وتحمّله
 * ٨٠٠ تيرابايت كتابة، وNV3 بلا DRAM وتحمّله ٣٢٠.
 *
 * المصدر: صفحات المواصفات للشركات، وللمشكوك فيه قوائم البائعين والمراجعات
 * الناقلة عنها (TechPowerUp، StorageReview، Geizhals) — قُرئت 2026-10-08.
 * ⚠️ والأقراص الميكانيكيّة لا يُكتب لها شيء: لا DRAM فيها بالمعنى نفسه،
 *    وتحمّلها يُعلَن بوحدةٍ أخرى (حمولة سنويّة) لا تقارَن بـTBW.
 *
 *   npx tsx scripts/fill-storage-dram-tbw.ts            # عرض
 *   npx tsx scripts/fill-storage-dram-tbw.ts --apply
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';

/** الاسم في الكتالوج → [DRAM؟، TBW] */
const DATA: Record<string, [boolean, number]> = {
  '870 EVO 1TB SATA': [true, 600],
  '870 EVO 500GB SATA': [true, 300],
  '9100 PRO 1TB Gen5': [true, 600],
  '9100 PRO 2TB Gen5': [true, 1200],
  '9100 PRO 4TB Heatsink': [true, 2400],
  '980 Pro 1TB': [true, 600],
  '990 EVO Plus 1TB': [false, 600],
  '990 EVO Plus 2TB': [false, 1200],
  '990 PRO 1TB': [true, 600],
  '990 PRO 2TB': [true, 1200],
  'BX500 1TB SATA': [false, 360],
  'Black SN770 1TB': [false, 600],
  'Black SN8100 2TB Gen5': [true, 1200],
  'Black SN850X 1TB': [true, 600],
  'Black SN850X 2TB': [true, 1200],
  'Blue SN5100 2TB': [false, 900],
  'Blue SN580 1TB': [false, 600],
  'Blue SN580 2TB': [false, 900],
  'FireCuda 530 2TB': [true, 2550],
  'FireCuda 530 4TB': [true, 5100],
  'GAMMIX S70 Blade 512GB': [true, 370],
  'KC3000 1TB': [true, 800],
  'KC3000 2TB': [true, 1600],
  'Legend 710 512GB': [false, 130],
  'Legend 800 1TB': [false, 600],
  'MP700 Pro 2TB': [true, 1400],
  'NM790 1TB': [false, 1000],
  'NM790 2TB': [false, 1500],
  'NM790 4TB': [false, 3000],
  'NV3 1TB': [false, 320],
  'NV3 2TB': [false, 640],
  'P3 Plus 1TB NVMe': [false, 220],
  'P3 Plus 2TB': [false, 440],
  'P3 Plus 4TB': [false, 800],
  'P310 1TB': [false, 220],
  'P310 2TB': [false, 440],
  'Rocket 4 Plus 2TB': [true, 1400],
  'SX6000 Pro 512GB': [false, 300],
  'T500 1TB': [true, 600],
  'T705 2TB Gen5': [true, 1200],
};

const apply = process.argv.includes('--apply');
(async () => {
  const drives = await prisma.component.findMany({ where: { category: { name: 'Storage' } }, select: { id: true, name: true, specs: true } });
  const sp = (s: unknown): any => ({ ...(typeof s === 'string' ? JSON.parse(s) : (s as any) || {}) });
  const unknown = drives.filter((d) => !DATA[d.name] && !/hdd/i.test(String(sp(d.specs).type))).map((d) => d.name);
  if (unknown.length) { console.log('بلا بيانات:', unknown.join('، ')); process.exit(1); }
  if (apply) writeFileSync(`backups/storage-dram-tbw-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(drives, null, 2));
  let n = 0;
  for (const d of drives) {
    const row = DATA[d.name];
    if (!row) continue;
    const s = sp(d.specs);
    const dram = row[0] ? 'Yes' : 'No', tbw = `${row[1]} TB`;
    if (s.dramCache === dram && s.tbw === tbw) continue;
    s.dramCache = dram; s.tbw = tbw; n++;
    console.log(`${d.name.padEnd(26)} DRAM ${dram.padEnd(3)} · ${tbw}`);
    if (apply) await prisma.component.update({ where: { id: d.id }, data: { specs: s } });
  }
  console.log(`\n${n} قرصاً ${apply ? 'حُدّث (نسخةٌ في backups/)' : 'سيُحدَّث (أضف --apply)'}`);
  await prisma.$disconnect();
})();
