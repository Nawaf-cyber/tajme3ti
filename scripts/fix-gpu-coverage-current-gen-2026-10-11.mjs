/**
 * 2026-10-11 — المرحلة ١ من الخطّة («ثقة البيانات — تغطية الكروت»)، الجزء الأوّل: كروت الجيل الحاليّ.
 *
 * قبلها: من ٥٧ كرتاً ١٣ فقط في متجرين حيّين، و٣١ في متجرٍ واحد، و١٣ بلا متجر.
 *
 * القاعدة:
 *   - **صفّ الشريحة العامّ** («NVIDIA GeForce RTX 5060 Ti 8GB»…) يقبل أيّ نسخة شركةٍ من الشريحة والذاكرة نفسهما —
 *     هكذا بُني (شارة النسخة لكلّ متجر في الصفحة). فالعرض النافد يُستبدل رابطه بنسخةٍ متوفّرة **من المتجر نفسه**،
 *     والمتجر الغائب يُضاف.
 *   - **صفّ الشركة** (Ventus، Astral، ICE…) لا يُربط إلا بالطراز نفسه حرفياً.
 *
 * التحقّق: صفحة كلّ ASIN فُتحت (زرّ الشراء + «Graphics co-processor»)، وبحث مايكرولس يعرض «Currently Unavailable» للنافد،
 * وإنفيني آرك #stickyBarAddToCart = «إضافة إلى السلة».
 *
 * لم يُعثر على متجرٍ ثانٍ مطابق (يبقى كما هو): MSI 5070 VENTUS 2X OC وMSI 5070 Ti VENTUS 3X OC (أمازون وحده؛ مايكرولس وكازاسوق نافدان)،
 * ROG Astral LC 5090 (أمازون 54,229 — سعرٌ شاذّ لا يُربط)، Gigabyte 5060 Ti WINDFORCE 16G (المتوفّر نسخة OC برمزٍ آخر)،
 * PNY 5070 Ti OC Triple Fan Plus (لا يُعرف رمز «Plus» يقيناً).
 *
 *   node scripts/fix-gpu-coverage-current-gen-2026-10-11.mjs           # عرض
 *   node scripts/fix-gpu-coverage-current-gen-2026-10-11.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const A = (asin) => `https://www.amazon.sa/dp/${asin}`;
const M = (slug) => `https://saudi.microless.com/product/${slug}/`;
const I = (path) => `https://www.infiniarc.com/shop/gpu/${path}`;

/* row = الصفّ، name = اسمه للتأكّد، kind: replace (رابط عرض المتجر القائم) | add (متجرٌ جديد) */
const OPS = [
  // RTX 5050 8GB — العامّ
  { row: 'cmr3g8pru000ancym86ilohco', name: 'GeForce RTX 5050 8GB', kind: 'replace', store: 'amazon', url: A('B0FH5X31CY'), note: 'ASUS DUAL RTX5050 O8G (المتوفّر بدل B09CMF65V5 النافد)' },
  { row: 'cmr3g8pru000ancym86ilohco', name: 'GeForce RTX 5050 8GB', kind: 'replace', store: 'microless', url: M('inno3d-geforce-rtx-5050-twin-x2-8gb-graphics-card-gddr6-128-bit-memory-2317-mhz-base-clock-20-gbps-memory-clock-2560-cuda-cores-pci-express-gen-5-n50502-08d6-174071n'), note: 'Inno3D TWIN X2 1519' },
  // RTX 5060 — العامّ
  { row: 'cmq5060xx000000ym00000001', name: 'GeForce RTX 5060', kind: 'replace', store: 'amazon', url: A('B0F7HZ9QSZ'), note: 'ASUS DUAL RTX5060 O8G' },
  { row: 'cmq5060xx000000ym00000001', name: 'GeForce RTX 5060', kind: 'replace', store: 'microless', url: M('asus-dual-geforce-rtx-5060-oc-edition-graphics-card-dual-rtx5060-o8g-8gb-gddr7-128-bit-memory-2565-mhz-boost-clock-28-gbps-memory-speed-3840-cuda-cores-pci-express-5-0-90yv0n12-m0na00'), note: 'ASUS Dual 5060 OC 1985' },
  { row: 'cmq5060xx000000ym00000001', name: 'GeForce RTX 5060', kind: 'add', store: 'infiniarc', url: I('zt-b50600e-10m-zotac-twin-edge-gaming-geforce-rtx-5060-8gb-black-gpu-12216'), note: 'ZOTAC Twin Edge 2349' },
  // RTX 5060 Low Profile 8GB — العامّ (كان بلا متجرٍ متوفّر)
  { row: 'cmsjx3wm0000004ie04ids0wj', name: 'GeForce RTX 5060 Low Profile 8GB', kind: 'add', store: 'amazon', url: A('B0F6NMXJ1M'), note: 'Gigabyte 5060 OC Low Profile 2642' },
  // RTX 5060 Ti 8GB — العامّ (كان بلا متجرٍ متوفّر)
  { row: 'cmsqbc2k50000ucymjpelflif', name: 'GeForce RTX 5060 Ti 8GB', kind: 'replace', store: 'amazon', url: A('B0F4YRNHSJ'), note: 'PNY 5060 Ti 8GB OC Dual 2200' },
  { row: 'cmsqbc2k50000ucymjpelflif', name: 'GeForce RTX 5060 Ti 8GB', kind: 'add', store: 'microless', url: M('msi-geforce-rtx-5060-ti-8gb-shadow-2x-oc-plus-graphics-card-gddr7-128-bit-memory-2602-mhz-boost-clock-28-gbps-memory-speed-4608-cuda-cores-pci-express-gen-5-912-v536-023'), note: 'MSI SHADOW 2X OC PLUS 8GB 2349' },
  { row: 'cmsqbc2k50000ucymjpelflif', name: 'GeForce RTX 5060 Ti 8GB', kind: 'add', store: 'infiniarc', url: I('gv-n506twf2-8gd-gigabyte-geforce-rtx-5060-ti-windforce-8g-gpu-10347'), note: 'Gigabyte WINDFORCE 8G 2599' },
  // RTX 5060 Ti 16GB — العامّ
  { row: 'cmq5060tixx00000ym00000002', name: 'GeForce RTX 5060 Ti 16GB', kind: 'replace', store: 'microless', url: M('msi-geforce-rtx-5060-ti-16gb-shadow-2x-oc-plus-graphics-card-gddr7-128-bit-memory-2602-mhz-boost-clock-28-gbps-memory-speed-4608-cuda-cores-pci-express-gen-5-912-v535-029'), note: 'MSI SHADOW 2X OC PLUS 16GB 3678' },
  // RTX 5070 Ti 16GB — العامّ
  { row: 'cmr3g8pei0008ncym5xpf3k1s', name: 'GeForce RTX 5070 Ti 16GB', kind: 'replace', store: 'microless', url: M('zotac-gaming-geforce-rtx-5070-ti-amp-extreme-infinity-graphics-card-16gb-gddr7-256-bit-2512-mhz-engine-clock-28-gbps-memory-clock-8960-cuda-cores-pci-express-5-0-x16-zt-b50710b-10p'), note: 'ZOTAC AMP Extreme INFINITY 5450' },
  { row: 'cmr3g8pei0008ncym5xpf3k1s', name: 'GeForce RTX 5070 Ti 16GB', kind: 'add', store: 'infiniarc', url: I('gv-n507twf3oc-16gd-gigabyte-windforce-geforce-rtx-5070-ti-oc-sff-16g-gpu-10385'), note: 'Gigabyte WINDFORCE OC SFF 5699 (نسخة أمازون نفسها)' },
  // RX 9060 XT 8GB — العامّ
  { row: 'cmsqbc2ux0002ucym3ao7916c', name: 'Radeon RX 9060 XT 8GB', kind: 'add', store: 'microless', url: M('xfx-swift-amd-radeon-rx-9060-xt-oc-gaming-edition-graphics-8gb-gddr6-128-bit-memory-3320-mhz-boost-speeds-2048-stream-processors-20-gbps-memory-clock-black-rx-96tsw8gbq'), note: 'XFX Swift OC أسود 1929' },
  // متجرٌ ثالث للشريحتين الأكثر طلباً
  { row: 'cmq122okp000mjwymt3193qwb', name: 'GeForce RTX 5070 12GB', kind: 'add', store: 'infiniarc', url: I('gv-n5070wf3oc-12gd-gigabyte-windforce-geforce-rtx-5070-oc-12gb-sff-gpu-10384'), note: 'Gigabyte WINDFORCE OC SFF 3699 (نسخة أمازون نفسها)' },
  { row: 'cmq122obq000ljwymcp0jcafw', name: 'GeForce RTX 5080 16GB', kind: 'add', store: 'infiniarc', url: I('gv-n5080wf3ocv2-16gd-gigabyte-windforce-geforce-rtx-5080-oc-v2-16gb-gpu-14287'), note: 'Gigabyte WINDFORCE OC V2 7299' },
  // صفوف شركات — الطراز نفسه
  { row: 'cmu6n3azs000ew4ymmcbilw0d', name: 'Radeon RX 9070 XT GAMING OC ICE 16G', kind: 'add', store: 'amazon', url: A('B0G14L8BLN'), note: 'GV-R907XGAMING OC ICE في العنوان، 4390' },
  { row: 'cmsqdmxs70000nsym1shvn9sm', name: 'ROG Astral RTX 5090 OC 32GB', kind: 'replace', store: 'amazon', url: A('B0DV9BSDSM'), note: 'ROG-ASTRAL-RTX5090-O32G-GAMING (الأسود) بدل B0DS2WQZ2M النافد' },
];

const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
let bad = false;
const stop = (m) => { console.log('⛔ ' + m); bad = true; };
const plan = [];
for (const op of OPS) {
  const c = await prisma.component.findUnique({ where: { id: op.row }, select: { name: true, offers: { select: { id: true, url: true, inStock: true, storeId: true } } } });
  if (!c || c.name !== op.name) { stop(`${op.row} ليس «${op.name}»`); continue; }
  const asin = (op.url.match(/\/dp\/([A-Z0-9]{10})/) || [])[1];
  const taken = await prisma.componentOffer.findFirst({ where: asin ? { url: { contains: `/dp/${asin}` } } : { url: { startsWith: op.url.replace(/\/$/, '') } }, select: { component: { select: { name: true } } } });
  if (taken) { stop(`${op.url.slice(0, 80)} مستعمل في ${taken.component.name}`); continue; }
  const mine = c.offers.filter((o) => o.storeId === stores[op.store]);
  if (op.kind === 'replace') {
    if (mine.length !== 1) { stop(`${op.name}: عروض ${op.store} = ${mine.length} (المتوقّع واحد للاستبدال)`); continue; }
    if (mine[0].inStock) { stop(`${op.name}: عرض ${op.store} القائم متوفّر — لا يُستبدل`); continue; }
    plan.push({ ...op, offerId: mine[0].id, oldUrl: mine[0].url });
    console.log(`↻ ${op.name} · ${op.store}: ${op.note}`);
  } else {
    if (mine.length) { stop(`${op.name}: له عرض ${op.store} أصلاً`); continue; }
    plan.push(op);
    console.log(`✚ ${op.name} · ${op.store}: ${op.note}`);
  }
}
if (bad || !apply) { console.log(bad ? '⛔ متوقّف' : `\n${plan.length} عملية — (عرضٌ فقط — أضف --apply)`); await prisma.$disconnect(); process.exit(bad ? 1 : 0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/fix-gpu-coverage-${stamp}.json`, JSON.stringify(plan, null, 2));
for (const p of plan) {
  if (p.kind === 'replace') await prisma.componentOffer.update({ where: { id: p.offerId }, data: { url: p.url, inStock: true } });
  else await prisma.componentOffer.create({ data: { componentId: p.row, storeId: stores[p.store], url: p.url, inStock: true } });
}
console.log(`✔ ${plan.length} عملية — نسخة: backups/fix-gpu-coverage-${stamp}.json`);
console.log('التالي: scrape-one لـ', [...new Set(plan.map((p) => p.row))].join(' '));
await prisma.$disconnect();
