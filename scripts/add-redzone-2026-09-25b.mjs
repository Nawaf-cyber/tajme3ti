/**
 * ============ ريد زون — عروضٌ على قطعٍ لها متجران أو أكثر · 2026-09-25 ============
 *
 * الدفعة الثانية بعد scripts/add-redzone-2026-09-25.mjs. وبقرار نوّاف:
 * «لا مو جديدة، خلها على القطع القديمة» — فلا قطعةَ جديدة، روابطُ فقط.
 *
 * رُبطت أربع، كلٌّ بعد قراءة صفحتها وطرازها:
 *   Ryzen 9 9900X · Ryzen 7 9700X · Ryzen 7 7700 (علبة بمبرّد) · Kingston NV3 1TB
 *
 * ⚠️ ولم يُربط NZXT H9 Flow: صفُّنا خليطُ نسختين — كازاسوق «H9 Flow 2023
 * أسود» ومايكرولس «H9 Flow RGB» الأحدث — وريد زون يبيع «H9 Flow RGB أبيض».
 * فأيُّ نسخةٍ هو صفُّنا يُحسم أوّلاً، كـ4000D في الدفعة الأولى.
 *
 *   node scripts/add-redzone-2026-09-25b.mjs           # عرض
 *   node scripts/add-redzone-2026-09-25b.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const R = 'https://redzzone.com/products/';
const OFFERS = [
  ['Ryzen 9 9900X', R + 'معالج-كمبيوتر-مكتبي-إي-أم-دي-رايزن-9-9900-اكس-اثنا-عشر-نواة-سرعة-تصل-إلى-56-جيجاهرتز-من-السلسلة-9000', 1999],
  ['Ryzen 7 9700X', R + 'معالج-كمبيوتر-مكتبي-إي-أم-دي-رايزن-7-9700-اكس-ثماني-النواة-سرعة-تصل-إلى-55-جيجاهرتز-من-السلسلة-9000', 1749],
  ['Ryzen 7 7700', R + 'معالج-كمبيوتر-مكتبي-إي-أم-دي-رايزن-7-7700-ثماني-النواة-سرعة-تصل-إلى-53-جيجاهرتز-مع-مبرد-مدمج', 1649],
  ['NV3 1TB', R + 'وحدة-تخزين-kingston-nv3-nvme-ssd-1tb-m2-2280-6000mb', 599],
].map(([name, url, seen]) => ({ name, url: encodeURI(url), seen }));

const store = await prisma.store.findFirst({ where: { slug: 'redzone' } });
if (!store) { console.log('⛔ لا متجر ريد زون — شغّل add-redzone-2026-09-25.mjs أوّلاً'); process.exit(1); }

let blocked = false;
const plan = [];
for (const o of OFFERS) {
  const c = await prisma.component.findFirst({ where: { name: o.name }, select: { id: true, brand: true, name: true } });
  if (!c) { console.log(`⛔ لم أجد «${o.name}»`); blocked = true; continue; }
  const taken = await prisma.componentOffer.findFirst({ where: { url: o.url }, select: { component: { select: { name: true } } } });
  if (taken) { console.log(`⛔ الرابط مستعمل في: ${taken.component.name}`); blocked = true; continue; }
  const dup = await prisma.componentOffer.findFirst({ where: { componentId: c.id, storeId: store.id } });
  if (dup) { console.log(`⛔ ${c.name} له عرضُ ريد زون أصلاً`); blocked = true; continue; }
  console.log(`  ✔ ${c.brand} ${c.name} ← ${o.seen} ﷼`);
  plan.push({ componentId: c.id, url: o.url });
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/add-redzone-b-${stamp}.json`, JSON.stringify(OFFERS, null, 2));
const ids = [];
for (const p of plan) {
  await prisma.componentOffer.create({ data: { componentId: p.componentId, storeId: store.id, url: p.url, inStock: true } });
  ids.push(p.componentId);
}
console.log(`✔ ${plan.length} عروض\n\nالتالي:\n  npx tsx scripts/scrape-one.ts ${ids.join(' ')}`);
await prisma.$disconnect();
