/**
 * 2026-10-11 — المرحلة ١ من الخطّة («ثقة البيانات — تغطية الكروت»)، الجزء الثاني: الأجيال السابقة (RTX 30/40، RX 6000/7000).
 * أغلبها اختفى من مايكرولس (متوقّفة)، وعروض أمازون لها من بائعين طرفٍ ثالث بشحن أيّام — تُربط لأنّها تُشترى فعلاً، والسعر حقيقيّ.
 * استُبعد ASRock RX 6800 XT (B08QV6T8TG): صفحته تكتب الشريحة «FirePro S9300» خلاف العنوان.
 * باقيةٌ بمتجرٍ واحد (أمازون) لعدم وجود ثانٍ: Arc A380/A770/B570/B580، RTX 3080 Ti، 4060 Ti 8GB، 4070/4070 SUPER/4070 Ti/4080 SUPER/4090،
 * RX 6500 XT/6750 XT/7700 XT/7900 GRE/7900 XT/7900 XTX. وArc A750E بلا بديلٍ مؤكّد (طرازٌ خاصّ).
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
 *
 *   node scripts/fix-gpu-coverage-older-gen-2026-10-11.mjs           # عرض
 *   node scripts/fix-gpu-coverage-older-gen-2026-10-11.mjs --apply   # تنفيذ
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
  { row: 'cmrz8iz3b0006c0ym8tb8s1nt', name: 'GeForce GTX 1650 GDDR6 4GB', kind: 'replace', store: 'amazon', url: A('B0D2RQNKH5'), note: 'Gigabyte GTX 1650 D6 OC V4 1430 (Amazon UK)' },
  { row: 'cmr3g8qdh000dncymif9nzfpy', name: 'GeForce RTX 3060 12GB', kind: 'replace', store: 'amazon', url: A('B0BXH2DLZ6'), note: 'Gigabyte RTX 3060 WINDFORCE OC V2 12GB 1990' },
  { row: 'cmr3g8qdh000dncymif9nzfpy', name: 'GeForce RTX 3060 12GB', kind: 'add', store: 'microless', url: M('zotac-gaming-geforce-rtx-3060-twin-edge-graphics-card-12gb-gddr6-192-bit-memory-1777-mhz-engine-clock-15-gbps-memory-clock-3584-cuda-cores-pci-express-4-0-x16-zt-a30600e2-10m'), note: 'ZOTAC Twin Edge 12GB 1931' },
  { row: 'cmr3g8rqz000kncym1f63bk88', name: 'GeForce RTX 4060 Ti 16GB', kind: 'replace', store: 'amazon', url: A('B0CCC7MP3H'), note: 'ASUS ProArt 4060 Ti 16GB OC 5140 (طرفٌ ثالث)' },
  { row: 'cmpiecm61004v00ymbohfp1jv', name: 'GeForce RTX 4070 Ti SUPER', kind: 'replace', store: 'amazon', url: A('B0CSGCQY4K'), note: 'MSI 4070 Ti SUPER VENTUS 3X OC 6751 (طرفٌ ثالث)' },
  { row: 'cmpiecnrn005200ymvag8oe98', name: 'Radeon RX 6950 XT', kind: 'replace', store: 'amazon', url: A('B09ZV3XZ3M'), note: 'Gigabyte RX 6950 XT GAMING OC 5280 (Amazon Germany)' },
  { row: 'cmr3g8qly000encym7apcklu3', name: 'Radeon RX 7600 8GB', kind: 'replace', store: 'amazon', url: A('B0C49S5R55'), note: 'Sapphire PULSE RX 7600 1566 (Amazon Germany)' },
  { row: 'cmr3g8qly000encym7apcklu3', name: 'Radeon RX 7600 8GB', kind: 'replace', store: 'microless', url: M('xfx-speedster-swft-210-amd-radeon-rx-7600-core-graphics-card-8gb-gddr6-128bit-memory-2655-mhz-boost-clock-18gbps-memory-clock-2048-steam-processors-pci-e-4-0-3-dp-3-hdmi-2-1-rx-76pswftfy'), note: 'XFX SWFT 210 RX 7600 1575' },
  { row: 'cmpieclyv004u00ymuf81jl3o', name: 'Radeon RX 7600 XT', kind: 'replace', store: 'amazon', url: A('B0CSVJZNNX'), note: 'Gigabyte RX 7600 XT GAMING OC 16G 4584 (طرفٌ ثالث)' },
  { row: 'cmpiebasz001400ympwnk31n4', name: 'Radeon RX 7800 XT', kind: 'replace', store: 'amazon', url: A('B0CGHQ32S2'), note: 'Gigabyte RX 7800 XT GAMING OC 16G 4736 (طرفٌ ثالث)' },
  { row: 'cmr3g8reu000incymgaata2yd', name: 'GeForce RTX 3070 8GB', kind: 'replace', store: 'amazon', url: A('B09865Q9GS'), note: 'ASUS TUF RTX 3070 V2 OC 1930 (طرفٌ ثالث)' },
  { row: 'cmr3g8t61000rncympdiu2bi7', name: 'Radeon RX 6650 XT 8GB', kind: 'replace', store: 'amazon', url: A('B09ZZSMXPV'), note: 'Sapphire PULSE RX 6650 XT 3581 (طرفٌ ثالث)' },
  { row: 'cmr3g8qsn000fncym56qdxg80', name: 'Radeon RX 6600 XT 8GB', kind: 'replace', store: 'microless', url: M('xfx-speedster-swft-210-amd-radeon-rx-6600-xt-core-graphics-card-8gb-gddr6-128-bit-16-gbps-2359-mhz-game-clock-amd-rdna-2-pci-e-4-0-hdmi-3xdp-rx-66xt8dfdq'), note: 'XFX SWFT 210 RX 6600 XT 2676' },
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
writeFileSync(`backups/fix-gpu-coverage-older-${stamp}.json`, JSON.stringify(plan, null, 2));
for (const p of plan) {
  if (p.kind === 'replace') await prisma.componentOffer.update({ where: { id: p.offerId }, data: { url: p.url, inStock: true } });
  else await prisma.componentOffer.create({ data: { componentId: p.row, storeId: stores[p.store], url: p.url, inStock: true } });
}
console.log(`✔ ${plan.length} عملية — نسخة: backups/fix-gpu-coverage-older-${stamp}.json`);
console.log('التالي: scrape-one لـ', [...new Set(plan.map((p) => p.row))].join(' '));
await prisma.$disconnect();
