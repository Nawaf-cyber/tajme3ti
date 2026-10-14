/**
 * ============ FireCuda 530 4TB: تاريخ سعرٍ لنسخة 1TB وعرضٌ لطرازٍ آخر — 2026-10-14 ============
 *
 * تتمّة scripts/fix-firecuda-530-4tb-link-2026-10-14.mjs (صحّح رابط أمازون). بقي أمران
 * حذفُهما بإذن نوّاف («احذف السجلّ وعرض مايكرولس»):
 *
 *   ١) PriceHistory: ٧٥ قراءة من أمازون (1154–1229، من 2026-07-25) — كلّها من الرابط
 *      الخاطئ B0977LW48F، أي أسعار FireCuda 530 **1TB**. تظهر في رسم سعر الـ4TB.
 *   ٢) عرض مايكرولس `…zp4000gm30073` = FireCuda **530R** 4TB (طرازٌ آخر). نافدٌ بلا سعر
 *      الآن، لكنّه سيعرض سعر 530R متى توفّر. (ومراجعات أسعاره وبلاغاته تُحذف معه — Cascade — وهي في النسخة.)
 *
 * فتبقى للقطعة عرض أمازون الصحيح وحده (B0977K3N1M، نافد)، وسعرها 0 حتى يُقرأ.
 *
 *   node scripts/drop-firecuda-530-4tb-wrong-data-2026-10-14.mjs           # عرض
 *   node scripts/drop-firecuda-530-4tb-wrong-data-2026-10-14.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const COMPONENT = 'cmpiecfmp004100ymrwgy5yts';
const MICROLESS_OFFER = 'cmsgekhho00b7psymhsyid2j2';
const done = async (code = 0) => { await prisma.$disconnect(); process.exit(code); };

const c = await prisma.component.findUnique({ where: { id: COMPONENT }, select: { id: true, name: true, price: true } });
if (!c || c.name !== 'FireCuda 530 4TB') { console.log(`⛔ القطعة غير موجودة أو تغيّر اسمها (${c?.name})`); await done(1); }

/* حارس: لا يُحذف التاريخ قبل تصحيح الرابط — وإلّا أعاد السحب كتابة أسعار 1TB */
const amazon = await prisma.componentOffer.findFirst({ where: { componentId: COMPONENT, store: { slug: 'amazon' } }, select: { url: true } });
if (amazon?.url !== 'https://www.amazon.sa/dp/B0977K3N1M') { console.log(`⛔ رابط أمازون لم يُصحَّح بعد: ${amazon?.url?.slice(0, 70)}`); await done(1); }

const hist = await prisma.priceHistory.findMany({ where: { componentId: COMPONENT, store: 'amazon' }, orderBy: { recordedAt: 'asc' } });
const offer = await prisma.componentOffer.findUnique({ where: { id: MICROLESS_OFFER }, include: { reviews: true, reports: true } });
if (offer && (offer.componentId !== COMPONENT || !offer.url?.includes('zp4000gm30073'))) { console.log(`⛔ تغيّر عرض مايكرولس: ${offer.url?.slice(0, 80)}`); await done(1); }
/* وكلّ القراءات أسعار 1TB: لا قراءة فوق ١٣٠٠ (سعر 4TB الحقيقيّ ضعف ذلك) */
const odd = hist.filter((h) => h.price > 1300);
if (odd.length) { console.log(`⛔ ${odd.length} قراءة فوق ١٣٠٠ — قد تكون لنسخة 4TB، راجعها: ${odd.map((h) => h.price).join('، ')}`); await done(1); }

console.log(`${c.name} (السعر المعروض ${c.price})`);
console.log(`  − سجلّ السعر من أمازون: ${hist.length} قراءة${hist.length ? ` (${Math.min(...hist.map((h) => h.price))}–${Math.max(...hist.map((h) => h.price))}، ${hist[0].recordedAt.toISOString().slice(0, 10)} ← ${hist.at(-1).recordedAt.toISOString().slice(0, 10)})` : ''}`);
console.log(offer
  ? `  − عرض مايكرولس (530R): ${offer.price ?? '—'}، ${offer.inStock ? 'متوفّر' : 'نافد'}، مراجعات أسعار ${offer.reviews.length}، بلاغات ${offer.reports.length}`
  : '  · عرض مايكرولس محذوفٌ سابقاً');
if (!hist.length && !offer) { console.log('لا شيء يُحذف'); await done(0); }

if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await done(0); }
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/drop-firecuda-530-4tb-${stamp}.json`, JSON.stringify({ component: c, hist, offer }, null, 2));
if (hist.length) await prisma.priceHistory.deleteMany({ where: { id: { in: hist.map((h) => h.id) } } });
if (offer) await prisma.componentOffer.delete({ where: { id: offer.id } });
console.log(`\n✔ نُفّذ — النسخة في backups/drop-firecuda-530-4tb-${stamp}.json`);
await done(0);
