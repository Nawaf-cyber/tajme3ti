/**
 * ============ عرضان لـBarraCuda يشيران إلى قرصٍ آخر — 2026-09-30 ============
 *
 *  · «BarraCuda 1TB HDD» · أمازون B07H28QRKN: الصفحة اليوم «BarraCuda 2TB …
 *    2.5 Inch … (ST2000LM015)» بـ635.75 ريالاً ومتوفّرة — سعة أخرى ومقاس
 *    آخر، وهو السعر الوحيد المتوفّر للصفّ فيُعرض سعراً لـ1TB. ومسار الرابط
 *    يقول «تيرابايت، ST1000LMZ48» — أمازون بدّلت المنتج تحت الرقم نفسه،
 *    فلا يمسكه scripts/audit-offer-links.
 *  · «BarraCuda 2TB HDD» · مايكرولس: ST2000LM015 — لابتوب 2.5، وقطعتنا 3.5
 *    (ST2000DM008 كرابط أمازون للصفّ نفسه). غير متوفّر وبلا سعر، لكنّه
 *    سيُقرأ إن عاد. أمسكه فحص المقاس الجديد في audit-offer-links.
 *
 * يُحذف العرضان (مع نسخة احتياطيّة)، ويبقى لكلّ صفٍّ عرضه الصحيح.
 * ثمّ سعر الصفّ (Component.price) — محسوبٌ من العروض ولا يُعاد حسابه بالحذف،
 * فبقي 635 لـ1TB بلا عرضٍ يسنده. يُصفَّر كسابقة scripts/clear-orphan-price
 * (P3 Plus 4TB) إن لم يبقَ عرضٌ متوفّرٌ بسعر، وبعد التأكّد أنّ لا تجميعة
 * محفوظة تستعمله؛ والواجهة تقول «غير متوفر — لا سعر مسجّل». ويعود وحده
 * متى سحب الساحب سعراً. والتشغيل الثاني يتخطّى المحذوف ويكمل هذه الخطوة.
 *
 *   node scripts/fix-barracuda-offers-2026-09-30.mjs           # عرض
 *   node scripts/fix-barracuda-offers-2026-09-30.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const WRONG = [
  { part: 'BarraCuda 1TB HDD', url: 'B07H28QRKN' },
  { part: 'BarraCuda 2TB HDD', url: 'st2000lm015' },
];

const found = [];
let blocked = false;
for (const w of WRONG) {
  const c = await prisma.component.findFirst({ where: { brand: 'Seagate', name: w.part }, include: { offers: { include: { store: true } } } });
  const hits = c?.offers.filter((o) => o.url?.includes(w.url)) ?? [];
  if (hits.length === 0 && c) { console.log(`  ${w.part}: العرض محذوفٌ سابقاً`); continue; }
  if (hits.length !== 1) { console.log(`⛔ ${w.part}: توقّعت عرضاً واحداً فيه ${w.url}، وجدت ${hits.length}`); blocked = true; continue; }
  const o = hits[0];
  console.log(`  ${w.part} · ${o.store.name} · ${o.price ?? '—'} ريال · ${o.inStock ? 'متوفّر' : 'غير متوفّر'}  ← يُحذف`);
  console.log(`     ويبقى: ${c.offers.filter((x) => x.id !== o.id).map((x) => `${x.store.name} ${x.price ?? '—'}`).join('، ') || 'لا شيء'}`);
  found.push(o);
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
/* سعر الصفّ بعد الحذف — لـ1TB وحده: سعره 635 من منتجٍ آخر.
   أمّا 2TB فسعره 579 من عرضه الصحيح (ST2000DM008) نافداً — وهذا سلوك الموقع
   المعتاد للقطعة النافدة، فلا يُمسّ.
   وسابقة clear-orphan-price كانت تتوقّف إن استعملت القطعةَ تجميعةٌ محفوظة؛
   لكنّ مجموع التجميعة يُحسب حيّاً من Component.price (app/build/[id]/page.tsx)
   بلا نسخةٍ محفوظة — فالتجميعات الثلاث تعرض الآن 635 خطأً، والتصفير يصحّحها. */
const reprice = [];
{
  const c = await prisma.component.findFirst({ where: { brand: 'Seagate', name: 'BarraCuda 1TB HDD' }, include: { offers: true } });
  const left = c.offers.filter((o) => !found.some((f) => f.id === o.id) && o.inStock && o.price > 0).map((o) => o.price);
  const next = left.length ? Math.min(...left) : 0;
  const used = await prisma.savedBuild.count({ where: { storageId: c.id } });
  if (next !== c.price) {
    console.log(`  ${c.name}: سعر الصفّ ${c.price} ← ${next} · تجميعات تعرضه (وتُصحَّح معه): ${used}`);
    reprice.push({ id: c.id, name: c.name, from: c.price, to: next, savedBuilds: used });
  }
}
/* وتاريخ أمازون للصفّ نفسه من العرض المحذوف: 54 نقطةً تتأرجح بين 368 و811
   (الرابط صفحة متغيّرات تعيد سعةً مرّةً وأخرى مرّة) — فلا نقطة فيه يوثق بها.
   ويبقى تاريخ مايكرولس إن وُجد. */
const hist = await prisma.priceHistory.findMany({ where: { component: { brand: 'Seagate', name: 'BarraCuda 1TB HDD' }, store: 'amazon' } });
if (hist.length) console.log(`  BarraCuda 1TB HDD: تاريخ أمازون ${hist.length} نقطة (${Math.min(...hist.map((h) => h.price))}–${Math.max(...hist.map((h) => h.price))})  ← يُحذف`);

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }

if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
if (found.length) writeFileSync(`backups/barracuda-offers-${stamp}.json`, JSON.stringify(found, null, 2));
if (reprice.length) writeFileSync(`backups/barracuda-price-${stamp}.json`, JSON.stringify(reprice, null, 2));
for (const o of found) await prisma.componentOffer.delete({ where: { id: o.id } });
for (const r of reprice) await prisma.component.update({ where: { id: r.id }, data: { price: r.to } });
if (hist.length) {
  writeFileSync(`backups/barracuda-history-${stamp}.json`, JSON.stringify(hist, null, 2));
  await prisma.priceHistory.deleteMany({ where: { id: { in: hist.map((h) => h.id) } } });
  console.log(`  حُذف تاريخ أمازون: ${hist.length} نقطة`);
}
console.log(`\n✔ حُذف ${found.length} عرضاً · وسُعّر ${reprice.length} صفّاً · النسخ في backups/ (${stamp})`);
await prisma.$disconnect();
