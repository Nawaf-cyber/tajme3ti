/**
 * ============ جودة المزوّدات — تصنيف SPL — ٣٨ مزوّداً ============
 *
 * «80+ Gold» تقيس الكفاءة لا الجودة: MSI MAG A650GL ذهبيّ وتصنيفه B،
 * وCorsair RM850x Shift ذهبيّ وتصنيفه A+. والفرق في المكوّنات والحماية
 * واستقرار الجهد — وهو ما يحمي القطع الأخرى.
 *
 * المصدر: SPL's PSU Tier List — «Main List (Proper Ratings Only)»، قُرئت
 * 2026-10-08 (docs.google.com/spreadsheets/d/1akCHL7Vhzk_EhrpIGkz8zTEvYfLDcaSpZRB6Xt6JWkc).
 * سلّمها: A للأجهزة القويّة، B للمتوسّطة، C للاقتصاديّة، D/E/F لا يُنصح بها.
 *
 * ⚠️ حين يحتمل اسمنا أكثر من نسخة في القائمة (C850 Gold: V1 وV2، Focus GX:
 *    2019 وV4 وV5) يُؤخذ **الأدنى** بينها — لا نَعِد بأعلى ممّا نعرف.
 * ⚠️ ولا شيء لما ليس في القائمة الرئيسيّة (Straight Power 12، TR-KG) — لا تخمين.
 *
 *   npx tsx scripts/fill-psu-tier.ts            # عرض
 *   npx tsx scripts/fill-psu-tier.ts --apply
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';

/** الاسم في الكتالوج → [التصنيف، سطر القائمة] */
const DATA: Record<string, [string, string] | null> = {
  'C850 Gold': ['A', 'NZXT C Series Gold V1/V2'],
  'FOCUS 650 Gold SSR-650FM': ['A', 'Seasonic Focus GM'],
  'Focus GX-850': ['A-', 'Seasonic Focus GX (2019 A · V4/V5 A-)'],
  'Focus SGX-650 650W Gold SFX-L': ['A', 'Seasonic Focus SGX SFX-L'],
  'GX III Gold 850W': ['B+', 'Cooler Master GX III Gold ATX 3.1 650-850W'],
  'HX1500i': ['A+', 'Corsair HX-i 1500W'],
  'MAG A1000GL PCIe 5': ['B+', 'MSI MAG A-GL PCIE5 1000/1250W'],
  'MAG A550BN': ['C', 'MSI MAG A-BN 550/650W'],
  'MAG A600DN': ['E', 'MSI MAG A-DN 500/600W'],
  'MAG A650BN': ['C', 'MSI MAG A-BN 550/650W'],
  'MAG A650GL': ['B', 'MSI MAG A-GL 650W'],
  'MAG A750BN PCIe 5 III': ['B-', 'MSI MAG A-BN PCIE5 III 650/750W'],
  'MAG A750GL PCIe 5': ['B', 'MSI MAG A-GL PCIE5 750/850W'],
  'MAG A850GL PCIe 5': ['B', 'MSI MAG A-GL PCIE5 750/850W'],
  'MPG A1000G PCIe 5': ['A', 'MSI MPG A-G PCIE5'],
  'MWE Gold 750 V2': ['B+', 'Cooler Master MWE V2 Gold'],
  'P650SS ICE': ['C+', 'Gigabyte P-SS ICE 550/650W'],
  'PL550D': ['C-', 'DeepCool PL-D 550W'],
  'POWER ZONE 2 850W': ['B+', 'be quiet! Power Zone 2 750-1000W'],
  'PQ1200G 1200W Gold': ['A-', 'DeepCool PQ G 1000/1200W'],
  'Pure Power 13 M 850W': ['B+', 'be quiet! Pure Power 13 M 750/850W'],
  'RM1000e': ['B+', 'Corsair RM-e (كلّ النسخ B+)'],
  'RM1000e 1000W ATX 3.1 White': ['B+', 'Corsair RM-e 2025 ATX 3.1'],
  'RM1000x Shift 1000W': ['A+', 'Corsair RM-x Shift'],
  'RM750e': ['B+', 'Corsair RM-e (كلّ النسخ B+)'],
  'RM850 (2021)': ['B+', 'Corsair RM 2021'],
  'RM850e 850W ATX 3.1 Gold White': ['B+', 'Corsair RM-e 2025 ATX 3.1'],
  'RM850x Shift 850W Gold': ['A+', 'Corsair RM-x Shift'],
  'ROG Loki SFX-L 850W': ['A', 'ASUS ROG Loki Platinum'],
  'ROG Strix 1200W Platinum': ['B+', 'ASUS ROG Strix Platinum 1200W'],
  'ROG Thor 1200P2': ['A', 'ASUS ROG Thor Platinum II 1000/1200W'],
  'SF750 Platinum SFX': ['A', 'Corsair SF Platinum 2019 (A) · 2024 (A+)'],
  'SF850 Platinum SFX': ['A+', 'Corsair SF Platinum 2024 ATX 3.1'],
  'Straight Power 12 750W': null,
  'TR-KG650W 650W Gold White': null,
  'Toughpower GF3 1000W': ['A+', 'Thermaltake Toughpower GF3 Premium 750-1000W'],
  'Toughpower PT 1000W': ['A-', 'Thermaltake Toughpower PT'],
  'V850 SFX Gold': ['A', 'Cooler Master V SFX Gold'],
};

const apply = process.argv.includes('--apply');
(async () => {
  const psus = await prisma.component.findMany({ where: { category: { name: 'PSU' } }, select: { id: true, name: true, specs: true } });
  const missing = psus.filter((p) => !(p.name in DATA)).map((p) => p.name);
  if (missing.length) { console.log('بلا قرار:', missing.join('، ')); process.exit(1); }
  if (apply) writeFileSync(`backups/psu-tier-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(psus, null, 2));
  let n = 0;
  for (const p of psus) {
    const d = DATA[p.name];
    if (!d) continue;
    const sp: any = { ...(typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs || {}) };
    if (sp.qualityTier === d[0]) continue;
    sp.qualityTier = d[0]; n++;
    console.log(`${p.name.padEnd(32)} ${d[0].padEnd(3)} ← ${d[1]}`);
    if (apply) await prisma.component.update({ where: { id: p.id }, data: { specs: sp } });
  }
  console.log(`\n${n} مزوّداً ${apply ? 'حُدّث (نسخةٌ في backups/)' : 'سيُحدَّث (أضف --apply)'}`);
  await prisma.$disconnect();
})();
