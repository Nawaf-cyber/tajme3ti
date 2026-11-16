/**
 * 2026-11-15 — شاهدٌ ثانٍ لقطعٍ بمتجرٍ واحد. نوّاف: «أبدا فيها طيب» (بند الـ٧٣ — صار ١١٢ مع نموّ الكتالوج).
 *
 * المصدر: find-second-source.ts (مايكرولس/كازاسوق/إنفيني آرك/ريد زون — مجّاناً) + بحث أمازون من لوحة
 * المتصفّح (fetch داخل تبويب amazon.sa، بلا Scrape.do). وكلّ رابطٍ هنا رُوجع يدويّاً: رمز الطراز في صفحة
 * أمازون أو عنوان المتجر يطابق رمزنا (من رابط مايكرولس/نون الموجود)، واللون، والنسخة.
 *
 * ⚠️ مرفوضة رغم أنّ المُطابِق قبِلها — لا تُضَف:
 *   · Z890 AORUS Elite WiFi7 ← «WIFI7 PLUS» في مايكرولس وكازاسوق: لوحةٌ أخرى (تحديثٌ بشبكة 5GbE).
 *     المُطابِق يعدّ PLUS كلمةً عامّة فلا يشترط غيابها.
 *   · Ryzen 7 9800X3D ← ريد زون «تجميعة الفئة الخارقة»: جهازٌ كامل (كاشف الأجهزة لا يقرأ «تجميعة»).
 *   · PNY 5070 Ti OC Triple Fan Plus ← إنفيني آرك VCG5070T16TFXPB1: النسخة بلا OC.
 *   · Corsair 4000D Airflow ← إنفيني آرك «iCUE 4000D RGB AIRFLOW»: نسخة RGB.
 *   · Vengeance RGB 64GB 6400 ← كازاسوق 4×16 وقطعتنا 2×32.
 *   · MSI MAG A650BN ← كازاسوق «A650BN III» (جيلٌ آخر؛ وأمازون يطابق).
 * ⚠️ وتُركت لغموضها: Trident Z5 RGB 6400 كازاسوق (لا CL ولا لون)، Frozen Notte 240 White أمازون (V1 وقطعتنا V2)،
 *   TR100 أمازون (ألوانٌ عدّة)، Fury Beast 64GB CL30 أسود (أمازون أبيض أو CL36)،
 *   RTX 5060 Ti WINDFORCE 16G (أمازون OC وحده)، Renegade RGB 8000 (أمازون بلا RGB)، MasterBox 600 (أمازون أبيض).
 *
 *   node scripts/add-second-sources-2026-11-15.mjs           # عرض
 *   node scripts/add-second-sources-2026-11-15.mjs --apply   # تنفيذ (بعد نسخةٍ احتياطيّة)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

/* [لاحقة المعرّف أو المعرّف كاملاً, المتجر, الرابط أو ASIN, متوفّر؟, ما ثبّت المطابقة] */
const ROWS = [
  // ---- أمازون (ASIN) — رمز الطراز من جدول صفحة المنتج
  ['ju22ew', 'amazon', 'B0BNL8ZM1T', true, 'NH-L9a-AM5 (بنّي)'],
  ['yhdaav', 'amazon', 'B0BR3JQTSN', true, 'PS120SE ARGB'],
  ['1tejjt', 'amazon', 'B0GQ8L13BG', true, 'H6 Compact، اللون White'],
  ['kk1sgu', 'amazon', 'B0FGPRBFWJ', true, 'FD-C-NOR1C-05'],
  ['0kk1wz', 'amazon', 'B0CS3VJ5FL', false, 'FD-C-MES3A-04 — بلا زرّ شراء اليوم'],
  ['5ex08k', 'amazon', 'B0BRBW94VL', true, 'RR-S4NA-17PA-R1'],
  ['mxtbyo', 'amazon', 'B0DJDF92JW', true, 'ROG STRIX Z890-A GAMING WIFI (اللوحة بيضاء أصلاً)'],
  ['hucuz0', 'amazon', 'B0DDCLBC3B', true, 'HS 420 VGPU، اللون white'],
  ['l77jnz', 'amazon', 'B0CVKZ9T3Q', true, 'NH-D12L chromax.black'],
  ['4ecx7s', 'amazon', 'B0CL9W968Y', true, 'PS120 EVO'],
  ['7vxqqy', 'amazon', 'B0FC9CZTXL', true, 'MPG B850I Edge TI WiFi'],
  ['1xp9k2', 'amazon', 'B09HCHYMJM', true, 'NH-L9i-17xx chromax.black'],
  ['dkhv6b', 'amazon', 'B0BV2CTRQM', true, 'MAG 274QPF X30MV'],
  ['7u0a8k', 'amazon', 'B0FQCD4HD4', true, 'PS120 VISION EVO'],
  ['9ucmx1', 'amazon', 'B0DWT52KHY', false, 'MZ-VAP4T0CW — بلا زرّ شراء اليوم'],
  ['8cp5aj', 'amazon', 'B0D2JD6P86', true, 'Ryzen 5 8400F (علبة لا tray)'],
  ['gourb1', 'amazon', 'B0GF9JV5B7', true, 'GS25F14 EK'],
  ['ta1daz', 'amazon', 'B096Y43VFZ', true, 'MAG 274QPF E20 (3CF6)'],
  ['50bbcn', 'amazon', 'B097999ZCY', true, '306-7ZWHA21-L80'],
  ['rtubgz', 'amazon', 'B0DWZBNGQW', true, 'BK043'],
  ['v9imyi', 'amazon', 'B0DLHDVHKP', true, 'Power Zone 2 850W'],
  ['hsvfyf', 'amazon', 'B0H8CR3RGN', true, 'DV PRO 360 ARGB WHITE'],
  ['59dv18', 'amazon', 'B0CNW41QV7', true, 'AS120 EVO WHITE ARGB'],
  ['5jnmft', 'amazon', 'B09SDG4DFF', true, 'PA120 SE ARGB'],
  ['ry2v4z', 'amazon', 'B0C4H5KXL6', true, 'LNM790X001T-RNNNG'],
  ['aec8dl', 'amazon', 'B0DWZF6VVQ', true, 'BK040'],
  ['xwhcei', 'amazon', 'B0CT3XNCZ9', true, '306-7ZP9B18-CE0 في العنوان'],
  ['1a4nsl', 'amazon', 'B0C91X5DZL', false, 'LNM790X002T (لاحقة منطقة) — بلا زرّ شراء اليوم'],
  ['ab7k4g', 'amazon', 'B09YSZ4ZG6', true, 'PA120 SE WHITE ARGB'],
  ['50aa7g', 'amazon', 'B09GW3QZLJ', true, 'MAG A650BN (قابس بريطانيّ = السعوديّ)'],
  // ---- مايكرولس — رمز الطراز في الرابط
  ['cmpiecq26005b00ymniswty6k', 'microless', 'https://saudi.microless.com/product/corsair-dominator-titanium-32gb-2-x-16gb-ddr5-rgb-desktop-memory-kit-6000mt-s-memory-speed-cl30-cas-latency-1-40v-tested-voltage-288-pin-intel-xmp-3-0-amd-expo-white-cmp32gx5m2b6000z30w/', true, 'CMP32GX5M2B6000Z30W أبيض CL30'],
  ['cmsqb1s2l0002gwym8ntgkn52', 'microless', 'https://saudi.microless.com/product/amd-ryzen-9-9900x3d-am5-desktop-processor-12-core-24-threads-up-to-5-5-ghz-boost-clock-amd-radeon-graphics-192gb-max-memory-dual-channel-black-100-100001368wof/', true, '100-100001368WOF'],
  ['cmpiebfu0001p00ymfr3v5m1x', 'microless', 'https://saudi.microless.com/product/amd-ryzen-9-9950x-am5-cpu-processor-16-cores-32-threads-64mb-l3-cache-up-to-5-7-ghz-max-boost-clock-ddr5-memory-type-zen-5-architecture-amd-radeon-graphics-100-100001277wof/', true, '100-100001277WOF'],
  ['cmuztrzgp001wkcymd4enth3j', 'microless', 'https://saudi.microless.com/product/msi-spatium-m480-pro-pcie-gen4x4-m-2-2280-internal-ssd-1tb-capacity-up-to-7400mb-s-sequential-read-6000mb-s-sequential-write-speed-700-tbw-3d-nand-s78-440l1g0-p83/', true, 'S78-440L1G0-P83'],
  ['cmv2saqbb000pukymemswxb01', 'microless', 'https://saudi.microless.com/product/gigabyte-b650-eagle-ax-amd-atx-motherboard-amd-b650-chipset-4x-ddr5-dimm-slot-256gb-max-memory-3x-m-2-slots-1x-pcie-4-0-x16-wi-fi-6e-network-connectivity-black-b650-eagle-ax/', true, 'B650-EAGLE-AX'],
  ['cmpieb9ip000z00ym8x341l21', 'microless', 'https://saudi.microless.com/product/corsair-rm850x-shift-fully-modular-atx-power-supply-850w-power-cybenetics-efficiency-gold-140mm-fan-size-fdb-technology-japanese-electrolytic-capacitors-atx-3-1-certified-black-cp-9020299-uk/', true, 'CP-9020299-UK'],
  ['cmpnewmaga750gl000000000', 'microless', 'https://saudi.microless.com/product/msi-mag-a750gl-pcie5-750w-modular-power-supply-intel-atx12v-version-3-0-120mm-cooling-fan-80-plus-gold-efficiency-rating-4-x-pcie-6-2-pin-connectors-8-x-sata-connectors-black-306-7zp8b18-ce0/', true, '306-7ZP8B18-CE0'],
  ['cmszmckvi0000zsymfit1wgzk', 'microless', 'https://saudi.microless.com/product/deepcool-ag400-g2-argb-single-tower-cpu-cooler-4x-6mm-heat-pipes-2200rpm-fan-speed-75-89cfm-air-flow-31-6dba-noise-level-intel-lga-amd-compatible-black-r-ag400-bkammg2-g/', true, 'R-AG400-BKAMMG2-G أسود (G2 لا BK ARGB V2)'],
  // ---- كازاسوق (واجهتهم تُعلن المخزون)
  ['cmtjkzbaa000024ym3k1a3v4x', 'cazasouq', 'https://www.cazasouq.com/product/xpg-armax-ddr5-rgb-32gb-6000mhz-2x16gb-black', true, 'ARMAX RGB 6000 2×16 أسود'],
  ['cmpfzir170008x4ymbxuyvrxc', 'cazasouq', 'https://www.cazasouq.com/product/intel-core-i7-14700k-cpu', false, 'i7-14700K'],
  ['cmtjkypz6000x70ymgihucuz0', 'cazasouq', 'https://www.cazasouq.com/product/havn-hs-420-premium-mid-tower-gaming-case-white', false, 'HS 420 VGPU أبيض'],
  ['cmv1evsmo0009l4ymbj6d34cn', 'cazasouq', 'https://www.cazasouq.com/product/msi-mpg-velox-100p-airflow-case', false, 'Velox 100P Airflow'],
  // ---- إنفيني آرك — رمز الطراز في الرابط
  ['cmuzsa1ct0014u8ymaqjltr2p', 'infiniarc', 'https://www.infiniarc.com/shop/board/90mb1ie0-m0eay0-asus-rog-crosshair-x870e-hero-am5-wifi-ddr5-motherboard-9079', true, '90MB1IE0-M0EAY0'],
  ['cmpiec4ez002w00ymzs3x1rz9', 'infiniarc', 'https://www.infiniarc.com/shop/board/z790-aorus-elite-ax-1-1-gigabyte-z790-aorus-elite-ax-1-1-wi-fi-6e-lga-1700-ddr5-atx-motherboard-10408', true, 'Z790 AORUS ELITE AX (مراجعة 1.1؛ لا ELITE X)'],
  ['cmpieb6x4000p00ymdkuz2p92', 'infiniarc', 'https://www.infiniarc.com/shop/board/90mb1er0-m1eay0-asus-tuf-gaming-b760-plus-wifi-ddr5-motherboard-9251', true, '90MB1ER0-M1EAY0 DDR5'],
  ['cmtjkyoi3000u70yms91tejjt', 'infiniarc', 'https://www.infiniarc.com/shop/case/cc-h62fw-01-nzxt-h6-compact-dual-chamber-mid-tower-airflow-all-white-case-15246', true, 'CC-H62FW-01 (نفس رمز مايكرولس)'],
  ['cmuzoq3fr001anoym4c2rjxcm', 'infiniarc', 'https://www.infiniarc.com/shop/case/cm-h72fb-r1-nzxt-h7-flow-rgb-mid-tower-all-black-gaming-case-11429', true, 'CM-H72FB-R1 أسود'],
];

const comps = await prisma.component.findMany({ select: { id: true, brand: true, name: true, offers: { select: { url: true, store: { select: { slug: true } } } } } });
const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
const plan = [];
for (const [key, store, ref, inStock, why] of ROWS) {
  const hits = comps.filter((c) => (key.length > 10 ? c.id === key : c.id.endsWith(key)));
  if (hits.length !== 1) throw new Error(`«${key}»: ${hits.length} قطعة`);
  const c = hits[0];
  const url = store === 'amazon' ? `https://www.amazon.sa/dp/${ref}` : ref;
  if (c.offers.some((o) => o.store.slug === store)) throw new Error(`${c.name} عندها ${store} أصلاً`);
  const taken = await prisma.componentOffer.findFirst({ where: { url: store === 'amazon' ? { contains: ref } : url }, select: { component: { select: { name: true } } } });
  if (taken) throw new Error(`${url} مستعمل لـ«${taken.component.name}»`);
  plan.push({ componentId: c.id, storeId: stores[store], url, inStock, label: `${store.padEnd(9)} ${inStock ? '✔' : '✖'} ${c.brand} ${c.name}  ← ${why}` });
}
plan.forEach((r) => console.log(r.label));
console.log(`\n${plan.length} عرضاً لـ${new Set(plan.map((r) => r.componentId)).size} قطعة`);
if (!apply) { console.log('(عرض فقط — أضف --apply)'); process.exit(0); }

const ids = [...new Set(plan.map((r) => r.componentId))];
const file = `backups/second-sources-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
writeFileSync(file, JSON.stringify(await prisma.component.findMany({ where: { id: { in: ids } }, include: { offers: true } }), null, 1));
console.log('نسخة احتياطيّة:', file);
for (const r of plan) await prisma.componentOffer.create({ data: { componentId: r.componentId, storeId: r.storeId, url: r.url, inStock: r.inStock } });
console.log(`أُضيف ${plan.length}. للسحب:\nnpx tsx scripts/scrape-one.ts ${ids.join(' ')}`);
await prisma.$disconnect();
