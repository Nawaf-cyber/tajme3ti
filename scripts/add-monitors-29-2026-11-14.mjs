/**
 * 2026-11-14 — الشاشات الـ٢٩ الباقية (خطّة الشاشات: IPS ١٥ · VA ٩ · OLED ٦ مع LG 27GS75Q-B الموجودة). نوّاف: «ضيف».
 *
 * البيانات في scripts/data/monitors-29-2026-11-14.json — جُمعت بخمسة وكلاء بحث من صفحات الشركات
 * ونشراتها (msi.com وgigabyte.com يردّان 403 للأدوات، فمن نشرات PDF الرسميّة)، والعروض من بحث
 * lib/store-search المجّانيّ (مايكرولس/كازاسوق/إنفيني آرك/ريد زون) وصفحات أمازون مقروءةً بالمتصفّح
 * (رقم الطراز في كلّ صفحة طابق: LS27FG502E=G50F، LS27FG600E=G60F، LS32FG810S=G81SF، XG27AQDMGR).
 * قرارات: المقاس بالمُعلَن (31.5←32، 26.5/26.7←27، 23.8←24)؛ Dell G2524H HDMI «2.0» (2.1 بنمط TMDS
 * بعرض 2.0)؛ VG27AQ5A 210 (ASUS لا تنشر إلّا المرفوع)؛ G81SF بلا G-Sync (السعوديّة تقول لا).
 * الصور: أمازون إن وُجد، وإلّا كازاسوق (نطاق supabase المسموح)، وإلّا public/images/parts/ (٨ صور تحتاج رفعاً).
 * performanceTier = null. والبديل يُكتب بعد الإنشاء بمعرّفاته، ومعه بديلٌ لـLG الأولى.
 *
 *   node scripts/add-monitors-29-2026-11-14.mjs           # عرض
 *   node scripts/add-monitors-29-2026-11-14.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const DATA = JSON.parse(readFileSync('scripts/data/monitors-29-2026-11-14.json', 'utf8'));
const LG_KEY = 'LG UltraGear 27GS75Q-B';
const LG_ALT = ['ASUS ROG Strix XG27ACG', 'الدقّة والتردّد نفساهما مع منفذ USB-C لصورة اللابتوب وشهادة DisplayHDR 400.'];

const altBlock = (name, id, why) => `---\nبإمكانك التوجه إلى [${name}](/components/${id}) إذا كان توجهك يتركز على الآتي:\n* ${why}`;
const withAlt = (desc, block) => {
  const lines = desc.trimEnd().split('\n');
  const url = lines.pop();
  return `${lines.join('\n').trimEnd()}\n\n${block}\n${url}`;
};
const keyOf = (u) => (u.match(/\/dp\/([A-Z0-9]{10})/) || [])[1] || u.replace(/\/$/, '').split('/').pop().split('?')[0];

// ---------------------------------------------------------------- الفحص
const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
const cat = await prisma.category.findUnique({ where: { name: 'Monitor' }, select: { id: true } });
const lg = await prisma.component.findFirst({ where: { name: 'UltraGear 27GS75Q-B' }, select: { id: true, description: true } });
let bad = false;
const stop = (m) => { console.log('⛔ ' + m); bad = true; };
if (!cat) stop('لا فئة Monitor');
if (!lg) stop('LG الأولى غير موجودة');
if (DATA.length !== 29) stop(`العدد ${DATA.length} لا 29`);
const keys = new Set([...DATA.map((d) => d.key), LG_KEY]);
const RES = new Set(['1920x1080', '2560x1080', '2560x1440', '3440x1440', '3840x2160']);
const PANEL = new Set(['IPS', 'VA', 'OLED', 'QD-OLED', 'TN']);
for (const d of DATA) {
  const tag = `${d.brand} ${d.name}`;
  const s = d.specs;
  if (!RES.has(s.resolution)) stop(`${tag}: دقّة ${s.resolution}`);
  if (!PANEL.has(s.panel)) stop(`${tag}: لوحة ${s.panel}`);
  if (!(+s.refreshHz >= 60)) stop(`${tag}: هرتز ${s.refreshHz}`);
  if (!['1.2', '1.4', '2.1', 'None'].includes(s.dpVersion) || !['1.4', '2.0', '2.1'].includes(s.hdmiVersion)) stop(`${tag}: منافذ ${s.dpVersion}/${s.hdmiVersion}`);
  if (/\*\*\[(yellow|red|green)\]/.test(d.description)) stop(`${tag}: نجوم حول وسم`);
  if (!/^https?:\/\//.test(d.description.trim().split('\n').pop())) stop(`${tag}: الرابط ليس السطر الأخير`);
  if (!d.description.startsWith('### ')) stop(`${tag}: بلا عنوان`);
  if (!keys.has(d.altKey)) stop(`${tag}: بديلٌ مجهول ${d.altKey}`);
  if (d.imageUrl.startsWith('/images/') && !existsSync('public' + d.imageUrl)) stop(`${tag}: صورة محلّيّة مفقودة`);
  if (!d.offers.length) stop(`${tag}: بلا عروض`);
  const dup = await prisma.component.findFirst({ where: { brand: { equals: d.brand, mode: 'insensitive' }, name: { equals: d.name, mode: 'insensitive' } }, select: { id: true } });
  if (dup) stop(`${tag}: موجودة ${dup.id}`);
  for (const o of d.offers) {
    if (!stores[o.store]) stop(`${tag}: متجر ${o.store}`);
    const t = await prisma.componentOffer.findFirst({ where: { url: { contains: keyOf(o.url), mode: 'insensitive' } }, select: { component: { select: { name: true } } } });
    if (t) stop(`${tag}: ${o.store} مستعمل في ${t.component.name}`);
  }
}
const urls = DATA.flatMap((d) => d.offers.map((o) => o.url));
if (new Set(urls).size !== urls.length) stop('رابط عرضٍ مكرّر بين شاشتين');
const count = (re) => DATA.filter((d) => re.test(d.specs.panel)).length;
console.log(`✚ ${DATA.length} شاشة · IPS ${count(/^IPS$/)} · VA ${count(/^VA$/)} · OLED ${count(/OLED/)} · عروض ${urls.length} · صور محلّيّة ${DATA.filter((d) => d.imageUrl.startsWith('/')).length}`);

if (bad || !apply) { console.log(bad ? '⛔ متوقّف' : '(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(bad ? 1 : 0); }

// ---------------------------------------------------------------- التنفيذ
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/monitors-29-${stamp}.json`, JSON.stringify({ DATA, lgDescriptionBefore: lg.description }, null, 2));

const ids = { [LG_KEY]: { id: lg.id, name: 'LG UltraGear 27GS75Q-B' } };
for (const d of DATA) {
  const c = await prisma.component.create({ data: {
    brand: d.brand, name: d.name, categoryId: cat.id, price: 0, tdpWattage: 0, performanceTier: null,
    specs: d.specs, imageUrl: d.imageUrl, description: d.description,
  } });
  for (const o of d.offers) await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: true } });
  ids[d.key] = { id: c.id, name: `${d.brand} ${d.name}` };
  console.log(`✔ ${d.brand} ${d.name} → ${c.id}`);
}
for (const d of DATA) {
  const a = ids[d.altKey];
  await prisma.component.update({ where: { id: ids[d.key].id }, data: { description: withAlt(d.description, altBlock(a.name, a.id, d.altReason)) } });
}
const la = ids[LG_ALT[0]];
await prisma.component.update({ where: { id: lg.id }, data: { description: withAlt(lg.description, altBlock(la.name, la.id, LG_ALT[1])) } });
console.log(`✔ البدائل (${DATA.length} + LG)\nنسخة: backups/monitors-29-${stamp}.json`);
writeFileSync(`backups/monitors-29-ids-${stamp}.json`, JSON.stringify(ids, null, 1));
console.log('التالي: npx tsx scripts/scrape-one.ts ' + DATA.map((d) => ids[d.key].id).join(' '));
await prisma.$disconnect();
