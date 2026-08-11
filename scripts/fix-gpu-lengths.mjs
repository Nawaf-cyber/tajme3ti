/**
 * ============ تصحيح أطوال كروت الشاشة ============
 *
 * الكتالوج كان يسجّل **طول التصميم المرجعي** للشريحة، بينما الرابط يشير إلى
 * موديل AIB بطول مختلف تماماً: ثمانية كروت كُتب لها 267مم (مرجع AMD) وهي
 * فعلياً 305–344مم. والخطأ في هذا الاتجاه هو الخطر: نقول «يدخل الصندوق»
 * لكرت لا يدخل.
 *
 * القاعدة: **الطول صفة موديل لا صفة شريحة.** نسجّل طول الموديل الذي نربطه.
 *
 * كل رقم معه مصدره. و«سلسلة» تعني أن الرقم مأخوذ من موديل آخر بنفس المبرّد
 * (QICK 319 مثلاً) — أضعف من مصدر مباشر، ومُعلَّم كذلك كي يُراجَع لاحقاً.
 *
 *   node scripts/fix-gpu-lengths.mjs           معاينة
 *   node scripts/fix-gpu-lengths.mjs --apply   تطبيق
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const APPLY = process.argv.includes('--apply');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const L = [
  // اسم القطعة في الكتالوج            الموديل الفعلي                   الطول   المصدر
  ['GeForce RTX 3070 8GB',            'Gigabyte Gaming OC',             286,  'gigabyte.com'],
  ['GeForce RTX 3080 Ti',             'Gigabyte Vision OC',             320,  'gigabyte.com'],
  ['GeForce RTX 4060',                'Palit Infinity 2',               250,  'palit.com'],
  ['GeForce RTX 4060 Ti',             'Zotac Twin Edge OC',             225.5,'zotac.com'],
  ['GeForce RTX 4060 Ti 16GB',        'Zotac AMP',                      225.5,'zotac.com'],
  ['GeForce RTX 4070 12GB',           'Gigabyte WINDFORCE OC',          261,  'gigabyte.com'],
  ['GeForce RTX 4070 SUPER',          'Zotac Twin Edge OC',             234,  'zotac.com'],
  ['GeForce RTX 4070 Ti SUPER',       'Gigabyte WINDFORCE OC',          261,  'gigabyte.com'],
  ['GeForce RTX 4080 SUPER',          'Gigabyte WINDFORCE V2',          330,  'gigabyte.com'],
  ['GeForce RTX 5050 8GB',            'Zotac Twin Edge OC',             220.5,'zotac.com'],
  ['GeForce RTX 5060',                'Zotac Twin Edge',                220.5,'zotac.com'],
  ['GeForce RTX 5060 Ti 16GB',        'ASUS Dual OC',                   229,  'asus.com'],
  ['GeForce RTX 5070 12GB',           'Gigabyte WINDFORCE OC SFF',      282,  'gigabyte.com'],
  ['GeForce RTX 5070 Ti 16GB',        'Gigabyte Gaming OC',             340,  'gigabyte.com'],
  ['GeForce RTX 5080 16GB',           'Gigabyte Gaming OC',             340,  'techpowerup.com'],
  ['GeForce RTX 5090 32GB',           'ASUS TUF OC',                    348,  'asus.com'],
  ['Radeon RX 6600 XT 8GB',           'ASUS Dual OC',                   243,  'asus.com'],
  ['Radeon RX 6650 XT 8GB',           'XFX Speedster SWFT 210',         241,  'pcpartpicker.com'],
  ['Radeon RX 6700 XT 12GB',          'PowerColor Hellhound',           305,  'powercolor.com'],
  ['Radeon RX 6750 XT 12GB',          'XFX Speedster QICK 319',         323,  'pcpartpicker.com'],
  ['Radeon RX 6800 XT',               'XFX Speedster MERC 319',         326,  'newegg (سلسلة MERC 319)'],
  ['Radeon RX 7600 8GB',              'ASUS Dual EVO OC',               229,  'asus.com'],
  ['Radeon RX 7600 XT',               'XFX Speedster QICK 308',         274,  'pcpartpicker.com'],
  ['Radeon RX 7700 XT',               'XFX Speedster QICK 319',         323,  'pcpartpicker (سلسلة QICK 319)'],
  ['Radeon RX 7800 XT',               'XFX Speedster MERC 319',         326,  'newegg.com'],
  ['Radeon RX 7900 GRE 16GB',         'PowerColor Fighter',             303,  'pcpartpicker.com'],
  ['Radeon RX 7900 XT',               'PowerColor Hellhound',           320,  'powercolor.com'],
  ['Radeon RX 9070 OC',               'ASUS Prime OC',                  312,  'asus.com'],
  // الدفعة الثانية
  ['Arc A380 6GB',                    'ASRock Challenger ITX',          190,  'asrock.com'],
  ['Arc A770',                        'Sparkle ROC OC',                 281,  'sparkle.com.tw'],
  ['Arc B580',                        'ASRock Challenger OC',           249,  'asrock.com'],
  ['GeForce RTX 3060 12GB',           'MSI Ventus 3X 12G OC',           305,  'msi.com'],
  ['Radeon RX 6500 XT 4GB',           'Sapphire PULSE',                 194,  'techpowerup.com'],
  ['Radeon RX 9070 XT OC',            'Sapphire PURE OC',               320,  'sapphiretech.com'],
];

/* ============ كروت لم يُتحقّق من طولها ============
 *
 * تُركت بقيمها الحالية عن قصد، لا سهواً. السبب في كل حالة:
 *   Arc A750E   ASRock Challenger — ASRock لا تنشر الأبعاد، والبحث يرجع
 *               بمواصفات Challenger **SE** وهو موديل آخر.
 *   Arc B570    Sparkle Guardian OC — Sparkle لا تنشر الأبعاد.
 *   GTX 1650    ASUS TUF OC — أسوس تنشر ثلاث نسخ TUF بأطوال ٢٠٠/٢٠٦/٢٢٩،
 *               ولم يتبيّن أيّها في رابط المتجر.
 *   RX 6950 XT  الرابط يقول «AMD Radeon RX 6950 XT» بلا اسم مصنّع، فقد
 *               يكون التصميم المرجعي (٢٦٧ صحيح) وقد يكون AIB.
 *   RX 9060 XT  Sapphire تنشر أبعاد PULSE لا PURE، ومبرّداهما مختلفان.
 *
 * ولماذا لا يستحقّ الأمر توقّفاً: أطولها ٢٦٧مم، وأصغر صندوق في الكتالوج
 * يقبل ٣٢٥مم. فحتى بخطأ ٥٠مم لا ينقلب أي حكم توافق. يُراجَع إن أُضيف
 * صندوق أقصر من ٢٨٠مم — عندها يصير الرقم فاصلاً.
 */
export const UNVERIFIED_LENGTHS = [
  'Arc A750E', 'Arc B570 10GB', 'GeForce GTX 1650 GDDR6 4GB',
  'Radeon RX 6950 XT', 'Radeon RX 9060 XT 16GB',
];

const parse = (s) => { try { return typeof s === 'string' ? JSON.parse(s || '{}') : (s || {}); } catch { return {}; } };
const comps = await prisma.component.findMany({ where: { category: { name: 'GPU' } } });
const byName = new Map(comps.map((c) => [c.name, c]));

console.log(`الوضع: ${APPLY ? '🔴 تطبيق' : '🟢 معاينة'}\n`);
console.log('القطعة                        الموديل                     قديم →  جديد   الفرق   المصدر');
console.log('─'.repeat(112));

const updates = [];
const missing = [];
for (const [name, model, len, src] of L) {
  const c = byName.get(name);
  if (!c) { missing.push(name); continue; }
  const s = parse(c.specs);
  const old = Number(String(s.lengthMm ?? s.length ?? s.Length ?? '').replace(/[^\d.]/g, '')) || null;
  const diff = old ? (len - old) : null;
  const mark = diff === null ? '  ' : diff === 0 ? ' =' : diff > 0 ? ` +${diff.toFixed(0)}` : ` ${diff.toFixed(0)}`;
  console.log(
    `${name.slice(0, 28).padEnd(30)}${model.slice(0, 26).padEnd(28)}${String(old ?? '—').padStart(5)} → ${String(len).padStart(5)}${mark.padStart(7)}   ${src}`,
  );
  if (old !== len) {
    /* نكتب lengthMm ونمسح البدائل: بقاء `length` القديم يعني قيمتين
       متعارضتين تُختار إحداهما عشوائياً عند التوحيد. */
    const next = { ...s, lengthMm: String(len) };
    delete next.length; delete next.Length;
    updates.push({ id: c.id, name, specs: next, old, len });
  }
}

if (missing.length) console.log(`\n⚠️ لم أجدها في الكتالوج: ${missing.join(' · ')}`);

const grew = updates.filter((u) => u.old && u.len > u.old);
console.log(`\nستتغيّر: ${updates.length} كرتاً · منها ${grew.length} صارت **أطول** ممّا كنّا نقول`);

/* الأثر العملي: أي زوج (صندوق × كرت) ينقلب من «متوافق» إلى «لا يدخل» */
const cases = await prisma.component.findMany({ where: { category: { name: 'Case' } } });
const flips = [];
for (const u of grew) {
  for (const cs of cases) {
    const max = Number(String(parse(cs.specs).maxGpuLength ?? '').replace(/[^\d.]/g, ''));
    if (max && u.old <= max && u.len > max) flips.push(`${cs.name} (${max}مم) × ${u.name}`);
  }
}
console.log(`\nأزواج كانت تُعرض «متوافقة» وهي ليست كذلك: ${flips.length}`);
flips.forEach((f) => console.log(`   ❌ ${f}`));

if (!APPLY) {
  console.log('\nمعاينة — لم يُكتب شيء. للتطبيق: node scripts/fix-gpu-lengths.mjs --apply');
} else {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  fs.mkdirSync('backups', { recursive: true });
  const file = `backups/gpu-lengths-before-${stamp}.json`;
  fs.writeFileSync(file, JSON.stringify(comps.map((c) => ({ id: c.id, name: c.name, specs: c.specs })), null, 1), 'utf8');
  console.log(`\nنسخة احتياطية: ${file}`);
  for (const u of updates) await prisma.component.update({ where: { id: u.id }, data: { specs: u.specs } });
  console.log(`✅ حُدِّث ${updates.length} كرتاً.`);
}

await prisma.$disconnect();
