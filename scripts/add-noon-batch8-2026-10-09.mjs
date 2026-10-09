/**
 * ============ عروض نون لقطع الدفعة الثامنة ============
 *
 * نون `scrapeMode: 'off'` — سعرُه يُقرأ بلوحة المتصفّح (فتح الصفحة ثم JSON-LD) ويُكتب بيدٍ،
 * ولا يُضاف عرضٌ بلا قراءة (السعر اليدويّ يشيخ — انظر scripts/noon-refresh.ts).
 *
 * 2026-10-09: الروابط الـ15 جُمعت من بحث نون، ثم حجب نون المتصفّح (Access Denied) بعد بحثٍ
 * كثيف؛ وحين رُفع قُرئت صفحةٌ واحدة قبل أن يعود الحجب. فالمقروء يُضاف، والباقي ينتظر:
 * املأ READ بقراءةٍ جديدة ثم أعد التشغيل — الموجود لا يُكرَّر.
 *
 *   node scripts/add-noon-batch8-2026-10-09.mjs           # عرض
 *   node scripts/add-noon-batch8-2026-10-09.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const N = (path) => `https://www.noon.com${path}`;

/** [الماركة، الاسم، رابط نون، القراءة: {price, inStock} أو null إن لم تُقرأ بعد] */
const NOON = [
  ['AMD', 'Ryzen 7 8700F', N('/saudi-en/ryzen-7-8700f-am5-socket-processor-grey/N70097986V/p/'), { price: 1199, inStock: true }], // 2026-10-09، البائع eKart
  ['AMD', 'Ryzen 5 7500X3D', N('/saudi-en/ryzen-5-7500x3d-am5-gaming-processor-6-cores-12-threads-4-0ghz-base-up-to-4-5ghz-boost-clock-96mb-3d-v-cache-pcie-5-0-support-65w-tdp-ddr5-memory-support/N70262428V/p/'), null],
  ['Intel', 'Core i7-14700KF', N('/saudi-en/core-i7-14700kf-2-5-ghz-20-core-lga-1700-14th-gen-processor-20-cores-28-threads-33mb-cache-memory-5-6ghz-maxturbo-boost-dual-channel-ddr5-5600-192gb-max-memory-blue/N70016653V/p/'), null],
  ['G.Skill', 'Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz CL36 White', N('/saudi-en/g-skill-trident-z5-rgb-series-ddr5-ram-intel-xmp-3-0-amd-expo-64gb-2x32gb-6000mt-s-cl36-36-36-96-1-35v-desktop-computer-memory-u-dimm-matte-white-f5-6000j3636f32gx2-tz5rw/Z4C91953F342B60C8C557Z/p/'), null],
  ['Crucial', 'P510 1TB', N('/saudi-en/crucial-p510-1tb-pcie-gen5-nvme-m-2-ssd-1-tb/N70277384V/p/'), null],
  ['Samsung', '990 PRO 1TB Heatsink', N('/saudi-en/990-pro-with-heatsink-nvme-m-2-ssd-1-0-tb/N53418048A/p/'), null],
  ['WD', 'Blue SN5100 1TB', N('/saudi-en/blue-sn5100-1tb-nvme-internal-ssd-pcie-gen4-x4-m-2-2280-up-to-7-100-mb-s-read-6-700-mb-s-write-qlc-nand-dram-less-600-tbw-endurance-single-sided-design-ultra-fast-gaming-content-creation-storage-wds100t5b0e-00cpe0-1-tb/N70250121V/p/'), null],
  ['Kingston', 'Fury Renegade 1TB Heatsink', N('/saudi-en/fury-renegade-1tb-pcie-4-0-nvme-m-2-ssd-with-heat-sink-ps5-ready-up-to-7300mb-s-read-speed-6000mb-s-write-speed-sfyrsk-1000g-black/N70157080V/p/'), null],
  ['Gigabyte', 'AORUS Gen5 14000 1TB', N('/saudi-en/aorus-gen5-14000-internal-ssd-1tb-capacity-pci-express-5-0x4-nvme-2-0-interface-m-2-2280-form-factor-up-to-13-600-mb-s-sequential-read-up-to-10-200-mb-s-sequential-write-ag514k1tb-1-tb/N70188059V/p/'), null],
  ['Lexar', 'NQ790 1TB', N('/saudi-en/nq790-ssd-1tb-nvme-1tb-ssd-m-2-2280-nvme-pcie-4-0-gen4x4-solid-state-drive-up-to-7000mb-s-read-6000mb-s-write-internal-ssd-compatible-ps5-pc-gaming-1-tb/N70142232V/p/'), null],
  ['Lexar', 'NQ790 4TB', N('/saudi-en/4tb-lexar-nq790-pcie-4-0-ssd-m-2-2280-pcle-gen4x4-nvm-up-to-7000mb-s-read-and-6000mb-s-write-4-tb/N70252934V/p/'), null],
  ['Noctua', 'NH-D15 G2', N('/saudi-en/noctua-nh-d15-g2-dual-tower-cpu-cooler-standard-all-round-version-recommended-for-amd-am5-and-intel-lga1851-lga1700-brown/Z03C5523F4D853379DB10Z/p/'), null],
  ['Noctua', 'NH-D15 chromax.black', N('/saudi-en/noctua-nh-d15-chromax-black-dual-tower-cpu-cooler-140mm-black/ZF5065CF73ED8A2E29366Z/p/'), null],
  ['Noctua', 'NH-U12A', N('/saudi-en/noctua-nh-u12a-premium-cpu-cooler-with-high-performance-quiet-nf-a12x25-pwm-fans-120mm-brown/ZDE92405A6D6DAEF9EAFEZ/p/'), null],
  ['Noctua', 'NH-U12S chromax.black', N('/saudi-en/noctua-nh-u12s-chromax-black-120mm-single-tower-cpu-cooler-black/Z1CCCD9E75B510C698436Z/p/'), null],
];

const noon = await prisma.store.findFirst({ where: { slug: 'noon' }, select: { id: true } });
let todo = 0;
for (const [brand, name, url, read] of NOON) {
  const c = await prisma.component.findFirst({ where: { brand, name }, select: { id: true } });
  if (!c) { console.log(`⛔ لا قطعة: ${brand} ${name}`); continue; }
  const has = await prisma.componentOffer.findFirst({ where: { componentId: c.id, storeId: noon.id } });
  if (has) { console.log(`· موجود: ${brand} ${name}`); continue; }
  if (!read) { console.log(`… لم يُقرأ بعد: ${brand} ${name}`); continue; }
  todo++;
  console.log(`＋ ${brand} ${name} ← نون ${read.inStock ? read.price : 'نافد'}`);
  if (apply) await prisma.componentOffer.create({ data: { componentId: c.id, storeId: noon.id, url, price: read.inStock ? read.price : null, inStock: read.inStock, lastCheckedAt: new Date() } });
}
console.log(apply ? `\nأُضيف ${todo}.` : `\n${todo} للإضافة — (عرضٌ فقط — أضف --apply)`);
await prisma.$disconnect();
