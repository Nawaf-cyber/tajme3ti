/**
 * ============ روابط كيساتٍ لمنتجٍ آخر — 2026-10-01 ============
 *
 * مواصفات الصفوف صحيحة (طول الكرت، المراوح المرفقة…) والروابط لغيرها —
 * فُتحت كلّ صفحةٍ وقُرئ عنوانها:
 *
 *   Meshify 2      مايكرولس «Meshify 2 Compact Lite» · أمازون «Meshify 2 Compact»
 *   TUF GT502      كازاسوق ومايكرولس «GT502 PLUS» · أمازون «GT502 Horizon» — كلّها بمراوح، وصفّنا بلا
 *   4000D Airflow  أمازون «FRAME 4000D» · كازاسوق «4000D V2»
 *   5000D Airflow  كازاسوق «iCUE 5000D RGB» (أمازون صحيح CC-9011211-WW)
 *   H9 Flow        أمازون «H9 Flow (2025)» · مايكرولس «H9 Flow RGB» CM-H92 — وصفّنا نسخة 2023
 *                  بأربع مراوح 120 (كازاسوق AA12236 صحيح، ولكازاسوق صفحةٌ أخرى «2025»)
 *
 * يُحذف العرض الخاطئ، ومعه تاريخ سعر المتجر لتلك القطعة — كان سعرَ المنتج
 * الآخر (كتاريخ BarraCuda في fix-barracuda-offers-2026-09-30). والروابط
 * الصحيحة تُضاف بعده بـ scripts/add-offer.ts، والأسعار بـ scrape-one.
 *
 *   node scripts/fix-case-offers-2026-10-01.mjs           # عرض
 *   node scripts/fix-case-offers-2026-10-01.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

/* [الصفّ، جزءٌ من الرابط الخاطئ] */
const WRONG = [
  ['Meshify 2', 'meshify-2-compact-lite'],
  ['Meshify 2', 'B0822WTQW9'],
  ['TUF GT502', 'gt502-plus-tuf-gaming-case-white-aa13930'],
  ['TUF GT502', 'asus-tuf-gaming-gt502-plus-pc-case'],
  ['TUF GT502', 'B08H4KKQM7'],
  ['4000D Airflow', 'B0DFHQG8VH'],
  ['4000D Airflow', 'corsair-4000d-v2-airflow'],
  ['5000D Airflow', 'corsair-icue-5000d-rgb'],
  ['H9 Flow', 'B0DQPPKNSS'],
  ['H9 Flow', 'nzxt-h9-flow-rgb-dual-chamber'],
];

const found = [];
let blocked = false;
for (const [name, frag] of WRONG) {
  const c = await prisma.component.findFirst({ where: { name, category: { name: 'Case' } }, include: { offers: { include: { store: true } } } });
  if (!c) { console.log(`⛔ لا صفّ «${name}»`); blocked = true; continue; }
  const hits = c.offers.filter((o) => decodeURIComponent(o.url ?? '').includes(frag));
  if (hits.length === 0) { console.log(`  ${name}: «${frag}» محذوفٌ سابقاً`); continue; }
  if (hits.length > 1) { console.log(`⛔ ${name}: «${frag}» يطابق ${hits.length} عروض`); blocked = true; continue; }
  const o = hits[0];
  const hist = await prisma.priceHistory.findMany({ where: { componentId: c.id, store: o.store.slug } });
  console.log(`  ${name.padEnd(14)} ${o.store.slug.padEnd(10)} ${String(o.price ?? '—').padStart(7)}  ${o.inStock ? 'متوفّر ' : 'نافد   '} تاريخ ${hist.length}  ← يُحذف`);
  found.push({ componentId: c.id, name, offer: o, hist });
}

/* وسعر H9 Flow بقي 775.64 — سعرَ عرض مايكرولس المحذوف (RGB): كلّ عروضه
   الباقية نافدة فلا يُعاد حسابه. فيأخذ آخر سعرٍ لعرضه الصحيح الباقي (كازاسوق
   2023)، كسلوك الموقع مع القطعة النافدة. */
const reprice = [];
{
  const c = await prisma.component.findFirst({ where: { name: 'H9 Flow', category: { name: 'Case' } }, include: { offers: true } });
  const left = c.offers.filter((o) => !found.some((f) => f.offer.id === o.id) && o.price > 0);
  const next = left.some((o) => o.inStock) ? null : left.length ? Math.min(...left.map((o) => o.price)) : 0;
  if (next !== null && next !== c.price) { console.log(`  H9 Flow: سعر الصفّ ${c.price} ← ${next} (آخر سعرٍ لعرضه الصحيح، نافد)`); reprice.push({ id: c.id, from: c.price, to: next }); }
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
if (found.length) writeFileSync(`backups/case-offers-${stamp}.json`, JSON.stringify(found, null, 2));
if (reprice.length) writeFileSync(`backups/case-price-${stamp}.json`, JSON.stringify(reprice, null, 2));
for (const r of reprice) await prisma.component.update({ where: { id: r.id }, data: { price: r.to } });
for (const f of found) {
  await prisma.componentOffer.delete({ where: { id: f.offer.id } });
  if (f.hist.length) await prisma.priceHistory.deleteMany({ where: { id: { in: f.hist.map((h) => h.id) } } });
}
console.log(`\n✔ حُذف ${found.length} عرضاً و${found.reduce((n, f) => n + f.hist.length, 0)} نقطة تاريخ · نسخة احتياطية: backups/case-offers-${stamp}.json`);
await prisma.$disconnect();
