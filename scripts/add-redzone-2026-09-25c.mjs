/**
 * ============ ريد زون — كروت الشركاء على صفوف الشريحة العامّة · 2026-09-25 ============
 *
 * بقرار نوّاف: «اتبع السابقة واربط كروت الشركاء». والسابقة أنّ صفّ الشريحة
 * العامّ («NVIDIA GeForce RTX 5070 12GB») يحمل عروضاً من شركاءٍ مختلفين —
 * ASUS TUF وPNY وGigabyte WINDFORCE — والأداء بينها في حدود ١–٣٪.
 *
 * وعرضٌ واحدٌ لكلّ متجرٍ في الصفّ، فاختير من ريد زون:
 *   RTX 5070 ← ZOTAC Solid OC (الوحيد المتوفّر؛ MSI Shadow 2X نافد)
 *   RTX 5060 ← ASUS Dual OC (نفس طراز عرض أمازون على الصفّ)
 *   RTX 5050 ← ASUS Dual OC (الأرخص، ونفس طراز مايكرولس على الصفّ)
 *
 * ⚠️ والطول يختلف بين الشركاء والصفُّ يحمل رقماً واحداً (من صفحات المصنّع):
 *   ZOTAC 5070 Solid OC ٣٠٤٫٤ مم والصفّ ٢٨٢ · ASUS Dual 5060 ٢٢٨ والصفّ ٢٢٠٫٥
 *   · ASUS Dual 5050 ٢٠٣ والصفّ ٢٢٠٫٥
 * فالفحص قد يقول «يدخل» لكيسٍ يضيق عن الكرت الذي يُباع فعلاً. مذكورٌ لنوّاف.
 *
 *   node scripts/add-redzone-2026-09-25c.mjs           # عرض
 *   node scripts/add-redzone-2026-09-25c.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const R = 'https://redzzone.com/products/';
const OFFERS = [
  ['cmq122okp000mjwymt3193qwb', 'RTX 5070 ← ZOTAC Solid OC', R + 'كرت-شاشة-زوتاك-قيمنق-جي-فورس-آر-تي-إكس-5070-سوليد-أو-سي-12-جيجابايت-gddr7', 3499],
  ['cmq5060xx000000ym00000001', 'RTX 5060 ← ASUS Dual OC', R + 'كرت-شاشة-أسوس-دويل-جي-فورس-آر-تي-إكس-5060-أو-سي-إيديشن-8-جيجابايت-gddr7', 1799],
  ['cmr3g8pru000ancym86ilohco', 'RTX 5050 ← ASUS Dual OC', R + 'كرت-شاشة-asus-dual-geforce-rtx-5050-oc-edition-8gb-gddr6', 1429],
].map(([componentId, label, url, seen]) => ({ componentId, label, url: encodeURI(url), seen }));

const store = await prisma.store.findFirst({ where: { slug: 'redzone' } });
if (!store) { console.log('⛔ لا متجر ريد زون'); process.exit(1); }

let blocked = false;
for (const o of OFFERS) {
  const c = await prisma.component.findUnique({ where: { id: o.componentId }, select: { name: true } });
  if (!c) { console.log(`⛔ لا قطعة ${o.componentId}`); blocked = true; continue; }
  const taken = await prisma.componentOffer.findFirst({ where: { url: o.url }, select: { component: { select: { name: true } } } });
  if (taken) { console.log(`⛔ الرابط مستعمل في: ${taken.component.name}`); blocked = true; continue; }
  const dup = await prisma.componentOffer.findFirst({ where: { componentId: o.componentId, storeId: store.id } });
  if (dup) { console.log(`⛔ ${c.name} له عرضُ ريد زون أصلاً`); blocked = true; continue; }
  console.log(`  ✔ ${o.label} ← ${o.seen} ﷼`);
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/add-redzone-c-${stamp}.json`, JSON.stringify(OFFERS, null, 2));
for (const o of OFFERS) {
  await prisma.componentOffer.create({ data: { componentId: o.componentId, storeId: store.id, url: o.url, inStock: true } });
}
console.log(`✔ ${OFFERS.length} عروض\n\nالتالي:\n  npx tsx scripts/scrape-one.ts ${OFFERS.map((o) => o.componentId).join(' ')}`);
await prisma.$disconnect();
