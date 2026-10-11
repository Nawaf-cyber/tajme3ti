/**
 * ============ روابط مزوّداتٍ مربوطة بطرازٍ آخر — 2026-10-10 ============
 *
 * ظهرت أثناء إعادة كتابة أوصاف المزوّدات: قُرئ عنوان كلّ صفحةٍ في المتصفّح وقورن بالقطعة.
 *
 *   ASUS ROG Thor 1200P2:
 *     أمازون B0B1VGVBY9 = **ROG Loki 750W SFX-L** — مزوّدٌ آخر تماماً، وكان متوفّراً بـ687 ريالاً
 *     فيُعرض سعراً لـ Thor (سعره الحقيقيّ ~1,330). يُحذف.
 *   NZXT C850 Gold:
 *     أمازون B0FQ51D4B6 «C850 Gold Core … ATX 3.1 … Black» ومايكرولس PA-8G3BB (Gold Core أسود) —
 *     هذان عرضا القطعة الحيّان، فتُسمّى C850 Gold Core (وصفها في rewrite-desc-psu2).
 *     إنفينيآرك PA-8G2BW = C850 Gold **V2 أبيض** — جيلٌ ولونٌ آخران. يُحذف.
 *     كازاسوق aa13192 «NZXT C Series C850» — الطراز القديم بلا رقم إصدار. يُحذف.
 *   Corsair RM850 (2021):
 *     عرضاه كلاهما للنسخة **البيضاء** CP-9020232 (أمازون B097F1CHL2 «… White»، ومايكرولس
 *     «… white-cp-9020232»)، فتُسمّى RM850 (2021) White ويُسجَّل لونها (الوصف في rewrite-desc-psu2).
 *
 *   node scripts/fix-mislinks-psu-2026-10-10.mjs           # عرض
 *   node scripts/fix-mislinks-psu-2026-10-10.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

/* [معرّف العرض، ما يجب أن يحويه رابطه — حارسٌ ضدّ حذف عرضٍ تغيّر] */
const REMOVE = [
  ['cmsgej9q7000epsymc7ayml6g', 'B0B1VGVBY9'],
  ['cmtfxell70000twymtoe2nd9w', 'pa-8g2bw'],
  ['cmsgek3ak007epsymxxf2gx4w', 'aa13192'],
];
/* [معرّف القطعة، الاسم الحاليّ، الاسم الجديد] */
const RENAME = [
  ['cmpiech5s004800ymicj1g7qh', 'C850 Gold', 'C850 Gold Core'],
  ['cmpfzir17000bx4ymjufo8pu8', 'RM850 (2021)', 'RM850 (2021) White'],
];

const backup = { offers: [], components: [] };
for (const [id, has] of REMOVE) {
  const o = await prisma.componentOffer.findUnique({ where: { id }, include: { component: { select: { brand: true, name: true } } } });
  if (!o || !decodeURI(o.url).includes(has)) { console.log(`✗ ${id}: غير موجود أو تغيّر رابطه`); process.exitCode = 1; continue; }
  console.log(`− ${o.component.brand} ${o.component.name}: ${has} (${o.price ?? '—'} ريال، ${o.inStock ? 'متوفّر' : 'نافد'})`);
  backup.offers.push(o);
}
for (const [id, from, to] of RENAME) {
  const c = await prisma.component.findUnique({ where: { id }, select: { id: true, brand: true, name: true } });
  if (!c || c.name !== from) { console.log(`✗ ${id}: غير موجود أو تغيّر اسمه (${c?.name})`); process.exitCode = 1; continue; }
  console.log(`✎ ${c.brand} ${from} ← ${to}`);
  backup.components.push(c);
}
if (process.exitCode) process.exit(1);
if (apply) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  writeFileSync(`backups/fix-mislinks-psu-${stamp}.json`, JSON.stringify(backup, null, 2));
  for (const o of backup.offers) await prisma.componentOffer.delete({ where: { id: o.id } });
  for (const [id, , to] of RENAME) await prisma.component.update({ where: { id }, data: { name: to } });
  console.log(`نُفّذ — النسخة في backups/fix-mislinks-psu-${stamp}.json`);
} else console.log('(عرضٌ فقط — أضف --apply)');
await prisma.$disconnect();
