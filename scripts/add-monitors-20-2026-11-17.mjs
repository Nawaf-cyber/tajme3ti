/**
 * 2026-11-17 — عشرون شاشة جديدة (نوّاف: «الـ٢١ اللي اقترحتها» — ثمّ سقطت AOC Q27G4ZD، انظر أدناه).
 *
 * الاختيار: قائمة الأكثر مبيعاً في أمازون السعوديّة + مسح المتاجر المجّانيّة الأربعة (lib/store-search)
 * + أمازون ونون وجرير من لوحة المتصفّح. **الشرط: متوفّرةٌ الآن في متجرين يُسحبان آليّاً على الأقلّ**
 * (مايكرولس/أمازون/كازاسوق/إنفيني آرك/ريد زون). نون لم يُضف عمداً: كلّ صفحة نون حملٌ على مهمّة
 * noon-auto-refresh وهو يحجب بعد ~٣٦–٤١ صفحة. وجرير معطّل (403 منذ 2026-11-14) فلم يُضف.
 *
 * البيانات في scripts/data/monitors-20-2026-11-17.json — جمعها أربعة وكلاء بحث من صفحات الشركات
 * ونشراتها وأدلّتها الرسميّة (المصادر وأدلّة مطابقة الطراز في حقل notes لكلّ شاشة). قرارات:
 *   · AOC Q27G4ZD سقطت: أمازون يبيع نسخة 280 هرتز (HDMI 2.1) ومايكرولس نسخة 240 هرتز (HDMI 2.0) —
 *     طرازان، فلكلٍّ متجرٌ واحد.
 *   · HDMI «2.0» لـAW2725DF وAW2725DM وS2725DSM: Dell تسمّيه 2.1 لكنّه TMDS ويقف عند 144 هرتز
 *     (كما في Dell G2524H)، كي لا يزعم فحص المنافذ أنّ HDMI يبلغ أعلى تردّد.
 *   · Gigabyte M27Q3 = 300 هرتز (320 OC) بدليل Gigabyte؛ عنوان أمازون «170Hz» منسوخ من M27Q القديمة،
 *     وصور معرض أمازون لـM27UP — فالصورة من كازاسوق.
 *   · AW3225QF انحناء 1700R — أُضيف خياراً في lib/spec-fields.
 *   · MO27U2 تشارك MO32U2 صورة أمازون نفسها (أمازون يستعمل صورة العائلة لكلتيهما).
 * performanceTier = null. والبديل يُكتب بعد الإنشاء بمعرّفه (من الدفعة أو من الكتالوج).
 *
 *   node scripts/add-monitors-20-2026-11-17.mjs           # عرض
 *   node scripts/add-monitors-20-2026-11-17.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync, writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const DATA = JSON.parse(readFileSync('scripts/data/monitors-20-2026-11-17.json', 'utf8'));

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
const existing = await prisma.component.findMany({ where: { categoryId: cat?.id }, select: { id: true, brand: true, name: true } });
const existingByLabel = Object.fromEntries(existing.map((c) => [`${c.brand} ${c.name}`, c]));
let bad = false;
const stop = (m) => { console.log('⛔ ' + m); bad = true; };
if (!cat) stop('لا فئة Monitor');
if (DATA.length !== 20) stop(`العدد ${DATA.length} لا 20`);
const keys = new Set(DATA.map((d) => d.key));
const RES = new Set(['1920x1080', '2560x1080', '2560x1440', '3440x1440', '3840x2160']);
const PANEL = new Set(['IPS', 'VA', 'OLED', 'QD-OLED', 'TN']);
for (const d of DATA) {
  const tag = `${d.brand} ${d.name}`;
  const s = d.specs;
  if (!RES.has(s.resolution)) stop(`${tag}: دقّة ${s.resolution}`);
  if (!PANEL.has(s.panel)) stop(`${tag}: لوحة ${s.panel}`);
  if (!(+s.refreshHz >= 60)) stop(`${tag}: هرتز ${s.refreshHz}`);
  if (!['1.2', '1.4', '2.1', 'None'].includes(s.dpVersion) || !['1.4', '2.0', '2.1'].includes(s.hdmiVersion)) stop(`${tag}: منافذ ${s.dpVersion}/${s.hdmiVersion}`);
  if (s.dpUhbr && s.dpVersion !== '2.1') stop(`${tag}: dpUhbr بلا DP 2.1`);
  if (/\*\*\[(yellow|red|green)\]/.test(d.description)) stop(`${tag}: نجوم حول وسم`);
  if (!/^https?:\/\//.test(d.description.trim().split('\n').pop())) stop(`${tag}: الرابط ليس السطر الأخير`);
  if (!d.description.startsWith('### ')) stop(`${tag}: بلا عنوان`);
  if (d.description.length < 1200) stop(`${tag}: وصفٌ قصير (${d.description.length})`);
  if (!keys.has(d.altKey) && !existingByLabel[d.altKey]) stop(`${tag}: بديلٌ مجهول ${d.altKey}`);
  if (d.altKey === d.key) stop(`${tag}: بديله نفسه`);
  if (!/^https:\/\/(m\.media-amazon\.com|chqgmmjhrrcjwtnbhcpr\.supabase\.co)\//.test(d.imageUrl)) stop(`${tag}: صورة من نطاقٍ غير مسموح ${d.imageUrl}`);
  if (d.offers.length < 2) stop(`${tag}: أقلّ من عرضين`);
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
const byRes = (r) => DATA.filter((d) => d.specs.resolution === r).length;
console.log(`✚ ${DATA.length} شاشة · 1080p ${byRes('1920x1080')} · 1440p ${byRes('2560x1440')} · 4K ${byRes('3840x2160')} · IPS ${count(/^IPS$/)} · VA ${count(/^VA$/)} · OLED ${count(/OLED/)} · عروض ${urls.length}`);

if (bad || !apply) { console.log(bad ? '⛔ متوقّف' : '(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(bad ? 1 : 0); }

// ---------------------------------------------------------------- التنفيذ
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/monitors-20-${stamp}.json`, JSON.stringify({ DATA }, null, 2));

const ids = {};
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
  const a = ids[d.altKey] ?? { id: existingByLabel[d.altKey].id, name: d.altKey };
  await prisma.component.update({ where: { id: ids[d.key].id }, data: { description: withAlt(d.description, altBlock(a.name, a.id, d.altReason)) } });
}
console.log(`✔ البدائل (${DATA.length})\nنسخة: backups/monitors-20-${stamp}.json`);
writeFileSync(`backups/monitors-20-ids-${stamp}.json`, JSON.stringify(ids, null, 1));
console.log('التالي: npx tsx scripts/scrape-one.ts ' + DATA.map((d) => ids[d.key].id).join(' '));
await prisma.$disconnect();
