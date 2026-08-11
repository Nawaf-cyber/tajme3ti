/**
 * ============ توحيد صيغ قيم المواصفات ============
 *
 * توحيد المفاتيح جعل لكل معنى مفتاحاً واحداً؛ وهذا يجعل لكل مفتاح **صيغة**
 * واحدة. بدونه يقرأ الزائر في الجدول نفسه: «4.3GHz» و«4.7 GHz» و«3.3»،
 * و«نعم» تحت قطعة و«Yes» تحت التي تليها.
 *
 * ---- قواعد البيت (مستخرجة من الأغلبية القائمة لا مخترعة) ----
 *   سعة    → بلا مسافة:   32GB · 2TB · 96MB      (capacity ٢٣/٢٣ هكذا)
 *   معدّل   → بمسافة:      7000 MB/s              (readSpeed ٣٤/٣٤ هكذا)
 *   تردّد   → بمسافة:      4.3 GHz                (الأكثر: ١٥ من ٣٧)
 *   رقم مجرّد → بلا وحدة:  6000 · 850 · 400       (wattage وcores وmaxGpuLength)
 *   نعم/لا  → إنجليزي:     Yes / No               (١٩ من ٢٣، ومثل بقيّة القيم)
 *
 * ⚠️ لا يمسّ الاختلافات الحقيقية: GDDR6 مقابل GDDR6X، وGold مقابل Platinum،
 * وXMP مقابل EXPO — تلك فروق منتجات لا فروق كتابة.
 *
 *   node scripts/normalize-spec-values.mjs           معاينة
 *   node scripts/normalize-spec-values.mjs --apply   تطبيق
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const APPLY = process.argv.includes('--apply');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const parse = (s) => { try { return typeof s === 'string' ? JSON.parse(s || '{}') : (s || {}); } catch { return {}; } };

const norm = {
  /* «2x16GB» — عدد الشرائح × سعة الواحدة.
     «16 x 2» تعني ١٦GB × شريحتين، فتُقلب لا تُنسخ كما هي. */
  kit: (v) => {
    const s = String(v).trim();
    let m = s.match(/(\d+)\s*[x×]\s*(\d+)\s*GB/i);           // 2x16GB أو 2 x 16 GB
    if (m) return `${m[1]}x${m[2]}GB`;
    m = s.match(/(\d+)\s*GB\s*[x×]\s*(\d+)/i);               // 16GB x 2
    if (m) return `${m[2]}x${m[1]}GB`;
    m = s.match(/^(\d+)\s*[x×]\s*(\d+)$/);                   // «16 x 2» = 16GB × 2
    if (m) return `${m[2]}x${m[1]}GB`;
    return s;
  },
  speed: (v) => String(v).replace(/\s*MHz\s*/i, '').trim(),
  rgb: (v) => {
    const s = String(v).trim().toLowerCase();
    if (['نعم', 'yes', 'true'].includes(s)) return 'Yes';
    if (['لا', 'no', 'false'].includes(s)) return 'No';
    return String(v);
  },
  clock: (v) => {
    const s = String(v).trim();
    const m = s.match(/^([\d.]+)\s*(GHz)?$/i);
    return m ? `${m[1]} GHz` : s;
  },
  cache: (v) => {
    const s = String(v).trim();
    const m = s.match(/^([\d.]+)\s*MB$/i);
    return m ? `${m[1]}MB` : s;
  },
};

const RULES = {
  RAM: { kit: norm.kit, speed: norm.speed, rgb: norm.rgb },
  CPU: { baseClock: norm.clock, boostClock: norm.clock, l3Cache: norm.cache },
};

const comps = await prisma.component.findMany({ include: { category: { select: { name: true } } } });
const changes = [];
for (const c of comps) {
  const rules = RULES[c.category?.name];
  if (!rules) continue;
  const s = parse(c.specs);
  const next = { ...s };
  const notes = [];
  for (const [key, fn] of Object.entries(rules)) {
    if (s[key] == null || s[key] === '') continue;
    const v = fn(s[key]);
    if (String(v) !== String(s[key])) { next[key] = v; notes.push(`${key}: «${s[key]}» → «${v}»`); }
  }
  if (notes.length) changes.push({ id: c.id, cat: c.category?.name, name: c.name, specs: next, notes });
}

console.log(`الوضع: ${APPLY ? '🔴 تطبيق' : '🟢 معاينة'}\n`);
console.log(`قطع ستتغيّر: ${changes.length}\n`);
for (const ch of changes) {
  console.log(`── ${ch.cat}/${ch.name}`);
  ch.notes.forEach((n) => console.log(`     ${n}`));
}

// الأشكال الباقية بعد التطبيق — يجب أن تصير واحدة لكل حقل
const finalOf = new Map(comps.map((c) => [c.id, parse(c.specs)]));
changes.forEach((ch) => finalOf.set(ch.id, ch.specs));
const shape = (v) => String(v).replace(/[\d.]+/g, '#').replace(/\s+/g, '·');
console.log('\n══ الأشكال بعد التوحيد ══');
for (const [cat, rules] of Object.entries(RULES)) {
  for (const key of Object.keys(rules)) {
    const vals = comps.filter((c) => c.category?.name === cat).map((c) => finalOf.get(c.id)[key]).filter((v) => v != null && v !== '');
    const shapes = [...new Set(vals.map(shape))];
    console.log(`   ${shapes.length === 1 ? '✅' : '🔴'} ${cat}/${key.padEnd(12)} ${shapes.length} شكل: ${shapes.join(' · ')}`);
  }
}

if (!APPLY) {
  console.log('\nمعاينة — لم يُكتب شيء. للتطبيق: node scripts/normalize-spec-values.mjs --apply');
} else {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  fs.mkdirSync('backups', { recursive: true });
  const file = `backups/specs-before-values-${stamp}.json`;
  fs.writeFileSync(file, JSON.stringify(comps.map((c) => ({ id: c.id, name: c.name, specs: c.specs })), null, 1), 'utf8');
  console.log(`\nنسخة احتياطية: ${file}`);
  for (const ch of changes) await prisma.component.update({ where: { id: ch.id }, data: { specs: ch.specs } });
  console.log(`✅ حُدِّثت ${changes.length} قطعة.`);
}

await prisma.$disconnect();
