/**
 * ============ إصلاح الروابط الداخلية المكسورة في أوصاف القطع ============
 *
 * السبب: أوصاف كُتبت بنصوص نائبة (PLACEHOLDER_GX850) لم تُستبدل، وأخرى
 * تشير إلى قطع حُذفت لاحقاً. الزائر يضغط «البديل الأرخص» فيصل إلى 404 —
 * وهي أسوأ لحظة ممكنة، لأن الوصف أقنعه للتوّ أن يشتري الأرخص.
 *
 * التصميم: لا مطابقة تخمينية. كل استبدال مكتوب صراحةً هنا، والقطعة الهدف
 * تُحلّ **بالاسم** لا بمعرّف ملصوق — فلو تغيّر معرّف في القاعدة، يفشل
 * السكربت بوضوح بدل أن يكتب رابطاً ميتاً جديداً.
 *
 * التشغيل:
 *   node scripts/fix-broken-links.mjs           تجربة جافّة (لا تكتب شيئاً)
 *   node scripts/fix-broken-links.mjs --apply   التطبيق
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const APPLY = process.argv.includes('--apply');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

/* ---- ١) معرّفات نائبة: الهدف مؤكّد بتطابق تامّ للاسم ----
   المفتاح هو المعرّف المكسور، والقيمة اسم القطعة الهدف كما في القاعدة. */
const ID_MAP = {
  PLACEHOLDER_SP12:  'Straight Power 12 750W',
  PLACEHOLDER_B860:  'PRO B860-P WiFi',
  PLACEHOLDER_B860P: 'PRO B860-P WiFi',
  PLACEHOLDER_GX850: 'Focus GX-850',
  PLACEHOLDER_Z890E: 'ROG STRIX Z890-E Gaming WiFi',
  PLACEHOLDER_Z890:  'Z890 AORUS Elite WiFi7',
  PLACEHOLDER_LPX16: 'Vengeance LPX 16GB (2x8GB) DDR4 3200MHz',
  PLACEHOLDER_LPX32: 'Vengeance LPX 32GB (2x16GB) DDR4 3600MHz',
  // قطع حُذفت من الكتالوج فبقيت الإشارة إليها
  cmpiecgds004400ymwtyggkmk: 'RM1000x Shift 1000W',
  cmpieceqw003y00ymcg4ax5pa: 'Blue SN580 1TB',
};

/* ---- ٢) روابط لا مقابل لها بالاسم: نوجّهها لأقرب بديل **يفي بما تعد به
   الجملة نفسها**، ونصحّح نصّ الرابط ليطابق القطعة الجديدة. الاختيار قرار
   تحريري لا آليّ، ولذلك كُتب بيد ومعه سببه. ---- */
const EDITORIAL = [
  {
    in: 'MAG A550BN',
    from: '[Corsair RM550e](/components/PLACEHOLDER_RM550)',
    toName: 'MAG A750GL PCIe 5',
    toText: 'MSI MAG A750GL PCIe 5',
    // الجملة تعد بـ: ذهبي + كابلات قابلة للفصل + ATX 3.0 بفارق بسيط
    why: 'Gold · Full modular · PCIe 5 · نفس الشركة · +170 ﷼ فقط',
  },
  {
    in: 'RM1000x Shift 1000W',
    from: '[Vertex GX-1000](/components/cmpieba2j001100ym6ljcej6j)',
    toName: 'RM1000e',
    toText: 'Corsair RM1000e',
    why: 'الجملة تطلب تصميماً خلفياً تقليدياً بقدرة 1000W',
  },
  {
    in: 'Toughpower GF3 1000W',
    from: '[Vertex GX-1000](/components/cmpieba2j001100ym6ljcej6j)',
    toName: 'RM1000x Shift 1000W',
    toText: 'Corsair RM1000x Shift',
    why: 'الجملة تطلب هدوءاً، والنصّ نفسه يقيس على سلسلة RMx',
  },
  {
    in: 'Ripjaws V 32GB (2x16GB) DDR4 3600MHz',
    from: '[Ripjaws V 16GB DDR4 3200MHz](/components/PLACEHOLDER_LPX16)',
    toName: 'Vengeance LPX 16GB (2x8GB) DDR4 3200MHz',
    toText: 'Vengeance LPX 16GB DDR4 3200MHz',
    why: 'لا يوجد Ripjaws V 16GB؛ والنائب LPX16 يقول إن المقصود Vengeance LPX',
  },
];

const comps = await prisma.component.findMany({ select: { id: true, name: true, description: true } });
const byName = new Map(comps.map((c) => [c.name, c]));
const ids = new Set(comps.map((c) => c.id));

/* نحلّ الأسماء إلى معرّفات، ونتوقّف عند أول اسم غير موجود: الاستمرار يعني
   كتابة روابط ميتة جديدة مكان القديمة. */
const resolve = (name) => {
  const c = byName.get(name);
  if (!c) throw new Error(`القطعة الهدف غير موجودة في القاعدة: «${name}»`);
  return c.id;
};

const idFix = Object.fromEntries(Object.entries(ID_MAP).map(([bad, name]) => [bad, resolve(name)]));
for (const e of EDITORIAL) e.toId = resolve(e.toName);

console.log(`الوضع: ${APPLY ? '🔴 تطبيق' : '🟢 تجربة جافّة (لا كتابة)'}\n`);

const changes = [];
for (const c of comps) {
  let text = c.description || '';
  if (!text) continue;
  const before = text;
  const notes = [];

  // التحرير أولاً: يستهدف نصّاً كاملاً قد يحوي معرّفاً نُصلحه في الخطوة التالية
  for (const e of EDITORIAL) {
    if (c.name === e.in && text.includes(e.from)) {
      text = text.split(e.from).join(`[${e.toText}](/components/${e.toId})`);
      notes.push(`تحرير: «${e.from.match(/\[([^\]]+)\]/)[1]}» ← «${e.toText}» (${e.why})`);
    }
  }

  /* الاستبدال مرتبط بالقوس المغلق: PLACEHOLDER_Z890 بادئة لـPLACEHOLDER_Z890E،
     واستبدالٌ غير محدود كان سيُنتج «cmr2k5vs4…E» — رابطاً ميتاً جديداً. */
  for (const [bad, good] of Object.entries(idFix)) {
    const needle = `](/components/${bad})`;
    if (text.includes(needle)) {
      const n = text.split(needle).length - 1;
      text = text.split(needle).join(`](/components/${good})`);
      notes.push(`معرّف: ${bad} ← ${good}${n > 1 ? ` (${n} مواضع)` : ''}`);
    }
  }

  if (text !== before) changes.push({ id: c.id, name: c.name, text, notes });
}

console.log(`قطع ستتغيّر أوصافها: ${changes.length}\n`);
for (const ch of changes) {
  console.log(`── ${ch.name}`);
  ch.notes.forEach((n) => console.log(`     ${n}`));
}

/* تحقّق بعديّ: لا يبقى في أي وصف رابطٌ لمعرّف غير موجود */
const finalText = new Map(comps.map((c) => [c.id, c.description || '']));
changes.forEach((ch) => finalText.set(ch.id, ch.text));
let remaining = 0;
for (const [, t] of finalText)
  for (const m of t.matchAll(/\/components\/([A-Za-z0-9_-]+)/g)) if (!ids.has(m[1])) remaining++;
console.log(`\nروابط مكسورة بعد التعديل: ${remaining}`);

if (!APPLY) {
  console.log('\nتجربة جافّة — لم يُكتب شيء. للتطبيق: node scripts/fix-broken-links.mjs --apply');
} else {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const file = `backups/descriptions-before-linkfix-${stamp}.json`;
  fs.mkdirSync('backups', { recursive: true });
  fs.writeFileSync(
    file,
    JSON.stringify(changes.map((ch) => ({ id: ch.id, name: ch.name, description: byName.get(ch.name)?.description })), null, 1),
    'utf8',
  );
  console.log(`\nنسخة الأوصاف قبل التعديل: ${file}`);
  for (const ch of changes) {
    await prisma.component.update({ where: { id: ch.id }, data: { description: ch.text } });
  }
  console.log(`✅ حُدِّثت ${changes.length} قطعة.`);
}

await prisma.$disconnect();
