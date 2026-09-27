/**
 * ============ متجر ريد زون + أوّل عروضه — 2026-09-25 ============
 *
 * اقتراح FatoOom Nasser («ريد زون وانفيني ارك وكانا وطبيب الكمبيوتر»).
 * وحكمُ الأربعة مقيسٌ لا مظنون:
 *   · إنفيني آرك — موجودٌ أصلاً (١٢ عرضاً).
 *   · ريد زون  — ✓ هذا الملف.
 *   · طبيب الكمبيوتر (pcd.com.sa) — صفحة القطع ترجع «Application error»
 *     من خادمهم يوم الفحص. يُعاد لاحقاً.
 *   · كانا (thekanaa.com) — ألعابٌ وإلكترونيّات عامّة، لا قطع كمبيوتر.
 *
 * ============ لماذا يُضاف بلا سطر كود ============
 * منصّة «زد»، وصفحة المنتج تحمل JSON-LD كاملاً (السعر والتوفّر) من
 * الخادم مباشرةً — فوضعُ `auto` يقرؤه كما يقرأ إنفيني آرك.
 *
 * ⚠️ لكنّ **بحثَه يجري في المتصفّح**: `/products?search=` يتجاهله الخادم
 * ويردّ القائمة العامّة. فلا محوّل بحثٍ له في lib/store-search. والبديل
 * أرخص: كتالوج القطع عنده ٩٧ منتجاً فقط في ثمانية أقسام، جُمعت كلّها
 * وطوبقت يدوياً بالطراز.
 *
 * ============ ما رُبط، وما لم يُربط ولماذا ============
 * رُبطت خمسٌ لها اليوم متجرٌ واحد، كلٌّ بعد قراءة صفحتها:
 *   i5-14400F (علبة) · i5-12400F (علبة) · PRIME 5060 (90YV0N10 في الصفحة)
 *   · Vengeance LPX 2×8 DDR4 3200 أسود · RM1000e ‏CP-9020297 (ATX 3.1 أسود)
 *
 * ⚠️ ولم يُربط Corsair 4000D Airflow الأسود: عرضُ كازاسوق على صفّنا هو
 * **V2 أبيض** وصفُّنا بلا لون — فأيُّ نسخةٍ هو صفُّنا؟ يُحسم أوّلاً.
 * ⚠️ والأرقام العامّة (RTX 5050/5070 من زوتاك وASUS Dual) لم تُربط بصفوف
 * الشريحة العامّة: قرارُ «أيّ نسخ الشركاء تدخل الصفّ العامّ» لنوّاف.
 *
 *   node scripts/add-redzone-2026-09-25.mjs           # عرض
 *   node scripts/add-redzone-2026-09-25.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const STORE = {
  slug: 'redzone',
  name: 'ريد زون',
  latinName: 'RedZone',
  color: '#E11D2E',
  domain: 'redzzone.com',
  active: true,
  sortOrder: 5,
  currency: 'SAR',
  rateToSar: 1,
  scrapeMode: 'auto',
  premiumProxy: false,
  usesDeepLinks: false,
};

const R = 'https://redzzone.com/products/';
/** [اسم القطعة في الكتالوج، رابطها في ريد زون، السعر المقروء يوم الربط] */
const OFFERS = [
  ['Core i5-14400F', R + 'معالج-كمبيوتر-مكتبي-كور-انتل-i5-14400f-بـ-10-أنوية-سداسي-النواة-مرتفعة-الأداء-رباعي-ذات-الكفاءة-العالية-حتى-47-جيجاهرتز-ghz-بي-جي-ايه-ال-1700', 949],
  ['Core i5-12400F', R + 'معالج-كمبيوتر-انتل-كور-i5-12400f-6-12-25-جيجاهرتز-lga1700', 769],
  ['GeForce RTX 5060 PRIME OC 8G', R + 'كرت-شاشة-سس-بطاقة-شاشة-prime-rtx5060-o8g-nvidia-geforce-rtx-5060-8gb-gddr7-128bit-hdmi-3xdp-dlss3', 1649],
  ['Vengeance LPX 16GB (2x8GB) DDR4 3200MHz', R + 'رامات-كورسير-فينجيانج-ال-بي-اكس-16-جيجابايت-قطعتين-دي-دي-ار-4-بتردد-3200-ميجاهرتز-أسود', 899],
  ['RM1000e', R + 'مزود-طاقة-corsair-rme-series-rm1000e-atx-31-قابل-للتعديل-بالكامل-cp-9020297-uk', 799],
].map(([name, url, seen]) => ({ name, url: encodeURI(url), seen }));

let store = await prisma.store.findFirst({ where: { slug: STORE.slug } });
console.log(store ? `المتجر موجود: ${store.id}` : `المتجر سيُنشأ: ${STORE.name} (${STORE.domain}) · auto`);

let blocked = false;
const plan = [];
for (const o of OFFERS) {
  const c = await prisma.component.findFirst({ where: { name: o.name }, select: { id: true, brand: true, name: true } });
  if (!c) { console.log(`⛔ لم أجد «${o.name}»`); blocked = true; continue; }
  const taken = await prisma.componentOffer.findFirst({ where: { url: o.url }, select: { component: { select: { name: true } } } });
  if (taken) { console.log(`⛔ الرابط مستعمل في: ${taken.component.name}`); blocked = true; continue; }
  if (store) {
    const dup = await prisma.componentOffer.findFirst({ where: { componentId: c.id, storeId: store.id } });
    if (dup) { console.log(`⛔ ${c.name} له عرضُ ريد زون أصلاً`); blocked = true; continue; }
  }
  console.log(`  ✔ ${c.brand} ${c.name} ← ${o.seen} ﷼`);
  plan.push({ componentId: c.id, url: o.url });
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/add-redzone-${stamp}.json`, JSON.stringify({ STORE, OFFERS }, null, 2));

if (!store) {
  store = await prisma.store.create({ data: STORE });
  console.log(`\n✔ المتجر ← ${store.id}`);
}
const ids = [];
for (const p of plan) {
  await prisma.componentOffer.create({ data: { componentId: p.componentId, storeId: store.id, url: p.url, inStock: true } });
  ids.push(p.componentId);
}
console.log(`✔ ${plan.length} عروض\n\nالتالي:\n  npx tsx scripts/scrape-one.ts ${ids.join(' ')}`);
await prisma.$disconnect();
