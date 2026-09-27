/**
 * ============ طولُ الكرت على كلّ عرض — 2026-09-25 ============
 *
 * «الطول صفة موديل لا صفة شريحة» (scripts/fix-gpu-lengths.mjs) — وهذا
 * يكمّلها: صفُّ الشريحة العامّ يحمل عروضاً من شركاء مختلفين، فالطول يُكتب
 * على **العرض** (ComponentOffer.lengthMm). والمنطق في lib/fit · gpuFitVerdict.
 *
 * كلُّ رقمٍ معه مصدره، والطراز عُرف من رابط العرض أو عنوانه في المتجر
 * (عناوين أمازون قُرئت من صفحاتها 2026-09-25). وأغلبُ العروض المغطّاة
 * **متوفّرةٌ اليوم** — النافدُ لا يُشترى، ويأخذ طولَ صفّه حتى يُقاس.
 *
 * ⚠️ ما لم يُكتب عمداً: XFX Swift 9060 XT OC 8GB (كازاسوق) — لم يُعرف
 * أهو ثنائيّ المراوح أم ثلاثيّها، وطولاهما مختلفان.
 *
 *   npx tsx scripts/set-offer-lengths.ts           # عرض
 *   npx tsx scripts/set-offer-lengths.ts --apply   # تنفيذ
 *
 * ويكتب معه اسمَ النسخة (`variant`) — يُعرض بجانب سعر كلّ متجر.
 *
 * ⚠️ يحتاج عمودَي `lengthMm` و`variant` في القاعدة (`npx prisma db push`) ثمّ `prisma generate`.
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';

const apply = process.argv.includes('--apply');

/* [صفّ الكتالوج، المتجر، الطراز الذي يبيعه العرض، الطول مم، المصدر] */
const L: [string, string, string, number, string][] = [
  ['Arc A380 6GB', 'amazon', 'ASRock Challenger ITX', 190, 'asrock.com'],
  ['GeForce RTX 3070 8GB', 'microless', 'Gigabyte Gaming OC', 286, 'gigabyte.com'],
  ['GeForce RTX 4060', 'cazasouq', 'Palit Infinity 2', 250, 'palit.com'],
  ['GeForce RTX 4060', 'amazon', 'Gigabyte WINDFORCE OC (GV-N4060WF2OC-8GD)', 192, 'gigabyte.com'],
  ['GeForce RTX 4060 Ti', 'amazon', 'ZOTAC Twin Edge OC (ZT-D40610H-10M)', 225.5, 'zotac.com'],
  ['GeForce RTX 4070 12GB', 'amazon', 'Gigabyte WINDFORCE OC (GV-N4070WF3OC-12GD)', 261, 'gigabyte.com'],
  ['GeForce RTX 4070 Ti 12GB', 'amazon', 'ZOTAC Trinity (ZT-D40710D-10P)', 306.8, 'zotac.com'],
  ['GeForce RTX 4070 Ti SUPER', 'amazon', 'Gigabyte WINDFORCE OC (GV-N407TSWF3OC-16GD)', 261, 'gigabyte.com'],
  ['GeForce RTX 4080 SUPER', 'amazon', 'Gigabyte WINDFORCE V2 (GV-N408SWF3V2-16GD)', 330, 'gigabyte.com'],
  ['GeForce RTX 5050 8GB', 'redzone', 'ASUS Dual OC (DUAL-RTX5050-O8G)', 203, 'asus.com'],
  ['GeForce RTX 5050 8GB', 'microless', 'ASUS Dual OC (DUAL-RTX5050-O8G)', 203, 'asus.com'],
  ['GeForce RTX 5050 8GB', 'amazon', 'ASUS Dual OC (DUAL-RTX5050-O8G)', 203, 'asus.com'],
  ['GeForce RTX 5050 8GB', 'cazasouq', 'ZOTAC Twin Edge OC', 220.5, 'zotac.com'],
  ['GeForce RTX 5060', 'redzone', 'ASUS Dual OC (DUAL-RTX5060-O8G)', 228, 'asus.com'],
  ['GeForce RTX 5060', 'amazon', 'ASUS Dual OC (DUAL-RTX5060-O8G)', 228, 'asus.com'],
  ['GeForce RTX 5060', 'cazasouq', 'ZOTAC Twin Edge', 220.5, 'zotac.com'],
  ['GeForce RTX 5060 Ti 16GB', 'amazon', 'ASUS Dual OC (90YV0MH0-M0NA00)', 229, 'asus.com'],
  ['GeForce RTX 5070 12GB', 'redzone', 'ZOTAC Solid OC (ZT-B50700J-10P)', 304.4, 'zotac.com (brochure)'],
  ['GeForce RTX 5070 12GB', 'microless', 'ASUS TUF OC (TUF-RTX5070-O12G)', 329, 'asus.com'],
  ['GeForce RTX 5070 12GB', 'noon', 'Gigabyte WINDFORCE OC SFF', 282, 'gigabyte.com'],
  ['GeForce RTX 5070 12GB', 'cazasouq', 'Gigabyte WINDFORCE OC SFF', 282, 'gigabyte.com'],
  ['GeForce RTX 5070 12GB', 'amazon', 'Gigabyte WINDFORCE OC SFF (GV-N5070WF3OC-12GD)', 282, 'gigabyte.com'],
  ['GeForce RTX 5070 Ti 16GB', 'amazon', 'Gigabyte WINDFORCE OC SFF (GV-N507TWF3OC-16GD)', 304, 'gigabyte.com'],
  ['GeForce RTX 5080 16GB', 'microless', 'ZOTAC Solid Core OC (ZT-B50800J2-10P)', 303.5, 'zotac.com (brochure)'],
  ['GeForce RTX 5080 16GB', 'amazon', 'Gigabyte Gaming OC (GV-N5080GAMING OC-16GD)', 340, 'techpowerup.com'],
  ['GeForce RTX 5090 32GB', 'microless', 'Gigabyte AORUS Master ICE (GV-N5090AORUSM-ICE-32GD)', 360, 'gigabyte.com'],
  ['GeForce RTX 5090 32GB', 'cazasouq', 'ASUS TUF OC', 348, 'asus.com'],
  ['Radeon RX 6500 XT 4GB', 'amazon', 'ASRock Phantom Gaming D OC (RX6500XT PGD 4GO)', 240, 'asrock.com'],
  ['Radeon RX 6600 XT 8GB', 'amazon', 'ASUS Dual OC (DUAL-RX6600XT-O8G)', 243, 'asus.com'],
  ['Radeon RX 6650 XT 8GB', 'microless', 'XFX Speedster SWFT 210', 241, 'pcpartpicker.com'],
  ['Radeon RX 6700 XT 12GB', 'microless', 'XFX Speedster SWFT 309', 304, 'xfxforce.com'],
  ['Radeon RX 6700 XT 12GB', 'amazon', 'PowerColor Hellhound (AXRX 6700XT 12GBD6-3DHL)', 305, 'powercolor.com'],
  ['Radeon RX 6800 XT', 'microless', 'XFX Speedster MERC 319', 326, 'newegg.com'],
  ['Radeon RX 6950 XT', 'amazon', 'AMD reference (100-438416)', 267, 'amd.com'],
  ['Radeon RX 7700 XT', 'microless', 'Sapphire NITRO+', 320, 'sapphiretech.com'],
  ['Radeon RX 7700 XT', 'amazon', 'XFX Speedster QICK 319 (RX-77TQICKB9)', 323, 'pcpartpicker.com'],
  ['Radeon RX 7800 XT', 'amazon', 'XFX Speedster MERC 319 (RX-78TMERCB9)', 326, 'newegg.com'],
  ['Radeon RX 7900 GRE 16GB', 'amazon', 'PowerColor Fighter (RX7900GRE 16G-F/OC)', 303, 'pcpartpicker.com'],
  ['Radeon RX 7900 XT', 'amazon', 'PowerColor Hellhound (RX7900XT 20G-L/OC)', 320, 'powercolor.com'],
  ['Radeon RX 7900 XTX', 'amazon', 'XFX Speedster MERC 310 (RX-79XMERCB9)', 344, 'xfxforce.com'],
  ['Radeon RX 9060 XT 16GB', 'microless', 'Sapphire PULSE OC', 240, 'sapphiretech.com'],
  ['Radeon RX 9060 XT 16GB', 'amazon', 'ASUS Dual (DUAL-RX9060XT-16G)', 202, 'asus.com'],
  ['Radeon RX 9070 OC', 'microless', 'ASUS Prime OC', 312, 'asus.com'],
  ['Radeon RX 9070 OC', 'amazon', 'ASUS Prime OC (PRIME-RX9070-O16G)', 312, 'asus.com'],
  ['Radeon RX 9070 XT OC', 'microless', 'ASUS Prime OC (90YV0L71-M0NA00)', 312, 'asus.com'],
  ['Radeon RX 9070 XT OC', 'amazon', 'Gigabyte Gaming OC (GV-R9070XTGAMING OC-16GD)', 288, 'gigabyte.com'],
];

(async () => {
  let ok = 0;
  let blocked = false;
  const plan: { offerId: string; lengthMm: number; variant: string; line: string }[] = [];

  for (const [row, store, model, mm, source] of L) {
    const offer = await prisma.componentOffer.findFirst({
      where: { store: { slug: store }, component: { name: row, category: { name: 'GPU' } } },
      select: { id: true, inStock: true, component: { select: { specs: true } } },
    });
    if (!offer) { console.log(`⛔ لا عرض ${store} على «${row}»`); blocked = true; continue; }
    const rowLen = (offer.component.specs as any)?.lengthMm;
    const diff = rowLen ? mm - Number(rowLen) : 0;
    const line = `${row.padEnd(26)} ${store.padEnd(9)} ${String(mm).padEnd(6)} ${diff > 0 ? `+${diff.toFixed(1)}` : diff < 0 ? diff.toFixed(1) : '='}  ${offer.inStock ? '' : '(نافد) '}${model} · ${source}`;
    console.log('  ' + line);
    /* الاسم المعروض بلا رقم القطعة: «ASUS TUF OC (TUF-RTX5070-O12G)» ← «ASUS TUF OC».
       الرقم للتحقّق هنا، والزائر يحتاج الاسم. */
    plan.push({ offerId: offer.id, lengthMm: mm, variant: model.replace(/\s*\(.*\)\s*$/, '').trim(), line });
    ok++;
  }

  const longer = plan.filter((p) => /\s\+\d/.test(p.line)).length;
  console.log(`\n${ok} عرضاً · ${longer} منها أطول من رقم صفّها — وهي التي كان الفحص يقول عنها «يدخل» بلا حقّ`);

  if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
  if (!apply) { console.log('(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); return; }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/offer-lengths-${stamp}.json`, JSON.stringify(plan, null, 2));
  for (const p of plan) {
    await prisma.componentOffer.update({ where: { id: p.offerId }, data: { lengthMm: p.lengthMm, variant: p.variant } as any });
  }
  console.log(`✔ كُتب ${plan.length} طولاً`);
  await prisma.$disconnect();
})();
