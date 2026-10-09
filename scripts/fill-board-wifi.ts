/**
 * ============ الواي فاي في اللوحات — ٥٧ لوحة ============
 *
 * كانت في لوحةٍ واحدة. والمقارنة تستنتجها من الاسم («WiFi»، «AX») — والاسم
 * يُثبت ولا ينفي: X670E AORUS Master وMEG Z790 ACE فيهما واي فاي واسمهما
 * لا يذكره. فلا يُقال «بلا واي فاي» إلّا من حقلٍ مسجَّل.
 *
 * القيم:
 *   «Wi-Fi 7/6E/5» — حين تحقّقنا من المعيار (صفحة الشركة أو قوائم البائعين
 *                    الناقلة عنها، 2026-10-08)، أو حين يذكره الاسم (WiFi7).
 *   «Yes»          — في الاسم ولم نتحقّق من المعيار.
 *   «No»           — لوحاتٌ اقتصاديّة لها نسخةٌ بالواي فاي باسمٍ آخر
 *                    (B550M DS3H ↔ DS3H AC، B760M Pro RS ↔ Pro RS WiFi).
 *
 *   npx tsx scripts/fill-board-wifi.ts            # عرض
 *   npx tsx scripts/fill-board-wifi.ts --apply
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';

const VERIFIED: Record<string, string> = {
  'X670E Steel Legend': 'Wi-Fi 6E',
  'B850 AORUS STEALTH ICE': 'Wi-Fi 7',
  'X870 Aorus Elite X3D ICE Motherboard': 'Wi-Fi 7',
  'MEG Z790 ACE': 'Wi-Fi 6E',
  'Z790 UD AC': 'Wi-Fi 5',
  'ROG Crosshair X670E Hero': 'Wi-Fi 6E',
  'ROG Maximus Z790 Hero': 'Wi-Fi 6E',
  'X670E AORUS Master': 'Wi-Fi 6E',
  'B650E AORUS Master': 'Wi-Fi 6E',
  'MPG B850I EDGE TI WIFI': 'Wi-Fi 7',
};
const NO = new Set([
  'B550M DS3H', 'B650M DS3H', 'B760M Pro RS', 'H610M H DDR4', 'H610M-HDV/M.2+ D5', 'H810M H',
  'PRIME A620M-K', 'PRIME H610M-K D4', 'PRO A620M-E', 'PRO B760M-P DDR4', 'PRO H810M-B DDR5', 'TUF Gaming B550-Plus',
]);

const apply = process.argv.includes('--apply');
(async () => {
  const boards = await prisma.component.findMany({ where: { category: { name: 'Motherboard' } }, select: { id: true, name: true, specs: true } });
  const val = (name: string): string | null =>
    VERIFIED[name] ?? (NO.has(name) ? 'No' : /wi-?fi\s*7/i.test(name) ? 'Wi-Fi 7' : /wi-?fi|\bAX\b/i.test(name) ? 'Yes' : null);
  const unknown = boards.filter((b) => !val(b.name)).map((b) => b.name);
  if (unknown.length) { console.log('بلا قرار:', unknown.join('، ')); process.exit(1); }
  if (apply) writeFileSync(`backups/board-wifi-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(boards, null, 2));
  let n = 0;
  for (const b of boards) {
    const sp: any = { ...(typeof b.specs === 'string' ? JSON.parse(b.specs) : b.specs || {}) };
    const v = val(b.name)!;
    if (sp.wifi === v) continue;
    console.log(`${b.name.padEnd(40)} ${sp.wifi ?? '—'} → ${v}`);
    sp.wifi = v; n++;
    if (apply) await prisma.component.update({ where: { id: b.id }, data: { specs: sp } });
  }
  console.log(`\n${n} لوحة ${apply ? 'حُدّثت (نسخةٌ في backups/)' : 'ستُحدَّث (أضف --apply)'}`);
  await prisma.$disconnect();
})();
