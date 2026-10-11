/**
 * ============ أسعارٌ معروضة ورثتها القطعة من طرازٍ آخر — 2026-10-10 ============
 *
 * حذفت سكربتات fix-mislinks (2026-10-09 و-ram و-psu) عروضاً مربوطةً بطرازٍ آخر، لكنّ
 * `component.price` بقي على آخر سعرٍ حسبه السحب — وهو سعر ذلك الطراز الآخر:
 * resolveOfferPrices يُبقي السعر القديم حين لا يبقى عرضٌ متوفّر («آخر سعرٍ معروف»).
 *
 *   ASUS ROG Thor 1200P2           687  ← سعر ROG Loki 750W من أمازون. الباقي عرض كازاسوق
 *                                         (نافد، آخر سعر 1,330) فيصير هو آخر سعرٍ معروف.
 *   Crucial Pro DDR5 32GB 5600     2149 ← سعر Crucial Pro **6000**.            لا عرض باقٍ → 0
 *   Silicon Power Zenith 32GB 6000 2654 ← سعر Corsair Vengeance CL30.         لا عرض باقٍ → 0
 *   Corsair Dominator 48GB 7200    3993 ← سعر طقم 6000 CL30 الأبيض.           لا عرض باقٍ → 0
 *   Corsair Vengeance 32GB 6000 CL36 2654 ← لا عرض باقٍ يشهد له.             → 0
 *
 * 0 يعني في الموقع كلّه «لا سعر مسجّل» (compare-verdict و[id]/page و ComponentsClient)
 * — أصدق من سعر قطعةٍ أخرى. وتعود الأسعار متى أُضيف لها عرضٌ صحيح وسُحب.
 *
 * ومعه حذف عرض مايكرولس 64GB المربوط بـ Dominator 48GB (انظر badOffer).
 *
 *   node scripts/fix-prices-after-mislinks-2026-10-10.mjs           # عرض
 *   node scripts/fix-prices-after-mislinks-2026-10-10.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

/* [القطعة، السعر الحاليّ الخاطئ — حارس، السعر الصحيح] */
const FIX = [
  ['cmpiecipz004g00ymnacid88v', 687, 1330],
  ['cmpiecptm005a00ym19nh2ieb', 2149, 0],
];
/* الباقية تُقرأ بالاسم الكامل */
for (const [brand, name, wrong] of [['Corsair', 'Dominator Titanium 48GB 7200MHz', 3993], ['Silicon Power', 'Zenith DDR5 32GB 6000MHz', 2654], ['Corsair', 'Vengeance DDR5 32GB 6000MHz', 2654]]) {
  const c = await prisma.component.findFirst({ where: { brand, name }, select: { id: true } });
  if (c) FIX.push([c.id, wrong, 0]);
  else { console.log(`✗ ${brand} ${name}: غير موجودة`); process.exitCode = 1; }
}

/* وظهر في الفحص نفسه: عرض مايكرولس الباقي على Dominator 48GB (2x24) 7200 هو طقم **64GB (2x32) CL30**
   — سعةٌ أخرى. نافدٌ بلا سعر، فلا يغيّر شيئاً معروضاً، لكنّه كان سيعرض سعر 64GB متى توفّر. */
const dom = FIX.length ? await prisma.component.findFirst({ where: { brand: 'Corsair', name: 'Dominator Titanium 48GB 7200MHz' }, select: { offers: { select: { id: true, url: true, price: true, inStock: true, componentId: true, storeId: true } } } }) : null;
const badOffer = dom?.offers.find((o) => o.url.includes('dominator-titanium-64gb-2-x-32gb'));
if (!badOffer) { console.log('✗ عرض 64GB على Dominator 48GB: غير موجود أو تغيّر رابطه'); process.exitCode = 1; }
else console.log(`− Corsair Dominator Titanium 48GB 7200MHz: مايكرولس dominator-titanium-64gb-2-x-32gb (${badOffer.price ?? '—'}، ${badOffer.inStock ? 'متوفّر' : 'نافد'})`);

const backup = [];
for (const [id, wrong, right] of FIX) {
  const c = await prisma.component.findUnique({ where: { id }, select: { id: true, brand: true, name: true, price: true, offers: { select: { price: true, inStock: true } } } });
  if (!c || c.price !== wrong) { console.log(`✗ ${id}: غير موجودة أو تغيّر سعرها (${c?.price})`); process.exitCode = 1; continue; }
  const live = c.offers.filter((o) => o.inStock && o.price > 0);
  if (live.length) { console.log(`✗ ${c.brand} ${c.name}: لها عرضٌ متوفّر — يحسبه السحب، لا هذا السكربت`); process.exitCode = 1; continue; }
  console.log(`${c.brand} ${c.name}: ${wrong} ← ${right || 'لا سعر مسجّل (0)'}  (عروضها: ${c.offers.length})`);
  backup.push(c);
}
if (process.exitCode) process.exit(1);
if (apply) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const fullOffer = await prisma.componentOffer.findUnique({ where: { id: badOffer.id } });
  writeFileSync(`backups/fix-prices-after-mislinks-${stamp}.json`, JSON.stringify({ components: backup, offers: [fullOffer] }, null, 2));
  for (const [id, , right] of FIX) await prisma.component.update({ where: { id }, data: { price: right } });
  await prisma.componentOffer.delete({ where: { id: badOffer.id } });
  console.log(`نُفّذ — النسخة في backups/fix-prices-after-mislinks-${stamp}.json`);
} else console.log('(عرضٌ فقط — أضف --apply)');
await prisma.$disconnect();
