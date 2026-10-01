/**
 * ============ Kraken Plus 360 RGB: رابط كازاسوق لـKraken Elite — 2026-10-02 ============
 *
 * رابط كازاسوق في الصفّ «nzxt-kraken-elite-360-rgb-v2» — مبرّدٌ آخر بشاشةٍ
 * أكبر وسعرٍ آخر. وبحثُ كازاسوق عن «kraken plus» يُرجع Plus 240 وحده، فلا
 * رابط صحيح يُستبدل به. أمّا أمازون (B0F5SCHSZQ) ومايكرولس فصحيحان — فُتحا.
 *
 * يُحذف العرض وتاريخ سعره (كـscripts/fix-case-offers-2026-10-01).
 *
 *   node scripts/fix-kraken-plus-offer-2026-10-02.mjs           # عرض
 *   node scripts/fix-kraken-plus-offer-2026-10-02.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const c = await prisma.component.findFirst({ where: { brand: 'NZXT', name: 'Kraken Plus 360 RGB' }, include: { offers: { include: { store: true } } } });
if (!c) { console.log('⛔ لا صفّ'); await prisma.$disconnect(); process.exit(1); }
const hits = c.offers.filter((o) => (o.url ?? '').includes('kraken-elite'));
if (hits.length === 0) { console.log('محذوفٌ سابقاً'); await prisma.$disconnect(); process.exit(0); }
if (hits.length > 1) { console.log(`⛔ ${hits.length} عروض`); await prisma.$disconnect(); process.exit(1); }
const o = hits[0];
const hist = await prisma.priceHistory.findMany({ where: { componentId: c.id, store: o.store.slug } });
const left = c.offers.filter((x) => x.id !== o.id);
console.log(`  ${o.store.slug} ${o.price ?? '—'} ${o.inStock ? 'متوفّر' : 'نافد'} · تاريخ ${hist.length}  ← يُحذف`);
console.log(`  ويبقى: ${left.map((x) => `${x.store.slug} ${x.price ?? '—'}${x.inStock ? '' : ' (نافد)'}`).join('، ')}`);

/* وسعر الصفّ إن كان من العرض المحذوف: أدنى عرضٍ متوفّرٍ باقٍ */
const live = left.filter((x) => x.inStock && x.price > 0).map((x) => x.price);
const next = live.length ? Math.min(...live) : null;
if (next !== null && next !== c.price) console.log(`  سعر الصفّ ${c.price} ← ${next}`);

if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/kraken-plus-offer-${stamp}.json`, JSON.stringify({ offer: o, hist, price: c.price }, null, 2));
await prisma.componentOffer.delete({ where: { id: o.id } });
if (hist.length) await prisma.priceHistory.deleteMany({ where: { id: { in: hist.map((h) => h.id) } } });
if (next !== null && next !== c.price) await prisma.component.update({ where: { id: c.id }, data: { price: next } });
console.log(`\n✔ نسخة احتياطية: backups/kraken-plus-offer-${stamp}.json`);
await prisma.$disconnect();
