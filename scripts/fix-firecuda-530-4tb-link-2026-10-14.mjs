/**
 * ============ FireCuda 530 4TB: رابط أمازون لنسخة 1TB — 2026-10-14 ============
 *
 * ظهر في مراجعة «ما تدري وش تبي؟»: خطّة «متوازن» تضع FireCuda 530 4TB بـ١١٥٩ ريالاً —
 * ثمنٌ لا يُباع به قرص 4TB من هذه الفئة. قُرئت الصفحة في المتصفّح:
 *
 *   B0977LW48F (الرابط الحاليّ) = «FireCuda 530, 1 TB … Heatsink (ZP1000GM3A023)» بـ١١٥٩٫٥٢
 *     — الرابط يحمل في نصّه ZP4000GM3A023، لكنّ الـASIN لنسخة 1TB من العائلة نفسها.
 *   B0977K3N1M = «FireCuda 530, 4 TB … 5100 TBW, Heatsink (ZP4000GM3A023)» — هذه القطعة
 *     (5100 TBW كمواصفاتها). غير متوفّرة الآن.
 *   (B0CWHF3CZ7 = FireCuda **530R** 4TB ZP4000GM3A073 — طرازٌ آخر، غير متوفّر أيضاً.)
 *
 * فيُصحَّح الرابط، ويُفرَّغ السعر (كان سعر 1TB) والعرض نافد حتى يقرأه السحب. ولا عرض
 * متوفّر يبقى للقطعة، فسعرها المعروض 0 = «لا سعر مسجّل» (كـfix-prices-after-mislinks-2026-10-10).
 *
 * ⚠️ لا يُحذف تاريخ السعر هنا (٧٥ قراءة من أمازون 1154–1229 — أسعار 1TB): حذفه بإذن نوّاف.
 *
 *   node scripts/fix-firecuda-530-4tb-link-2026-10-14.mjs           # عرض
 *   node scripts/fix-firecuda-530-4tb-link-2026-10-14.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const COMPONENT = 'cmpiecfmp004100ymrwgy5yts';
const OFFER = 'cmsgekhd800b6psympmlhmjh2';
const WRONG_ASIN = 'B0977LW48F';
const RIGHT_URL = 'https://www.amazon.sa/dp/B0977K3N1M';

const c = await prisma.component.findUnique({
  where: { id: COMPONENT },
  select: { id: true, brand: true, name: true, price: true, offers: { select: { id: true, url: true, price: true, inStock: true, lastCheckedAt: true, store: { select: { slug: true } } } } },
});
if (!c || c.name !== 'FireCuda 530 4TB') { console.log(`⛔ القطعة غير موجودة أو تغيّر اسمها (${c?.name})`); await prisma.$disconnect(); process.exit(1); }
const o = c.offers.find((x) => x.id === OFFER);
if (!o) { console.log('⛔ العرض غير موجود'); await prisma.$disconnect(); process.exit(1); }
if (o.url === RIGHT_URL) { console.log('مُصحَّحٌ سابقاً'); await prisma.$disconnect(); process.exit(0); }
if (!o.url.includes(WRONG_ASIN)) { console.log(`⛔ تغيّر رابط العرض: ${o.url.slice(0, 80)}`); await prisma.$disconnect(); process.exit(1); }

const others = c.offers.filter((x) => x.id !== OFFER);
const live = others.filter((x) => x.inStock && x.price > 0).map((x) => x.price);
const nextPrice = live.length ? Math.min(...live) : 0;
console.log(`${c.brand} ${c.name}`);
console.log(`  أمازون ${WRONG_ASIN} (${o.price ?? '—'}، ${o.inStock ? 'متوفّر' : 'نافد'}) ← ${RIGHT_URL} (نافد، بلا سعر حتى يُسحب)`);
console.log(`  ويبقى: ${others.map((x) => `${x.store.slug} ${x.price ?? '—'}${x.inStock ? '' : ' (نافد)'}`).join('، ') || '—'}`);
console.log(`  السعر المعروض ${c.price} ← ${nextPrice || 'لا سعر مسجّل (0)'}`);

if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/fix-firecuda-530-4tb-${stamp}.json`, JSON.stringify({ component: c, offer: o }, null, 2));
await prisma.componentOffer.update({ where: { id: OFFER }, data: { url: RIGHT_URL, price: null, inStock: false, lastError: null } });
if (nextPrice !== c.price) await prisma.component.update({ where: { id: COMPONENT }, data: { price: nextPrice } });
console.log(`\n✔ نُفّذ — النسخة في backups/fix-firecuda-530-4tb-${stamp}.json`);
await prisma.$disconnect();
