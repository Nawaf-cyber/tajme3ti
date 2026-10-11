/**
 * ============ روابط مربوطةٌ بالطراز الخطأ — 2026-10-09 ============
 *
 * فحصُ «رابطٌ واحد على قطعتين» (ASIN مكرّر) كشف أربعة، وكلّها قديمة. فُتحت
 * صفحة كلّ رابط في أمازون وقُرئ رمز الطراز منها:
 *
 *   B0DN7CYYSD = WD_BLACK SN7100 1TB        كان أيضاً على SN770 1TB  (WDS100T3X0E)
 *   B0CTHXMYL8 = Crucial Pro 6000 CL36 (CP2K16G60C36U5B)  كان أيضاً على Crucial Pro 5600
 *   B0CBRJ63RT = Corsair Vengeance 6000 CL30  كان أيضاً على Silicon Power Zenith
 *   B0F3DNMZRG = RM1000e **الأبيض** CP-9020294  كان أيضاً على RM1000e الأسود (CP-9020297)
 *     — ومعه رابط كازاسوق «…-white-41357» على الصفّ الأسود نفسه (ورابط أمازون يحوي
 *       النصّ نفسه في معاملات البحث، فيُطرح المكرّر بالمعرّف)
 *
 * فيُحذف العرض من الصفّ الخطأ وحده، ويُضاف الرابط الصحيح حيث وُجد برمزه:
 *   SN770 1TB ← B09QV692XY (WDS100T3X0E)، RM1000e الأسود ← B0DMTKVDYR (CP-9020297)
 * Crucial Pro 5600 وZenith لم يُعثر لهما في أمازون على رابطٍ برمزهما — يبقيان بلا عرض.
 *
 *   node scripts/fix-mislinks-2026-10-09.mjs           # عرض
 *   node scripts/fix-mislinks-2026-10-09.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

/* [الصفّ الخطأ، ما يجب أن يحويه الرابط] */
const REMOVE = [
  ['cmr3fmuuc000904lh1atlslez', 'B0DN7CYYSD'],
  ['cmpiecptm005a00ym19nh2ieb', 'B0CTHXMYL8'],
  ['cmpiecqry005e00ymvr32waij', 'B0CBRJ63RT'],
  ['cmpi5h9mv000604l1vseruv2k', 'B0F3DNMZRG'],
  ['cmpi5h9mv000604l1vseruv2k', 'white-41357'],
];
const ADD = [
  ['cmr3fmuuc000904lh1atlslez', 'https://www.amazon.sa/dp/B09QV692XY'],
  ['cmpi5h9mv000604l1vseruv2k', 'https://www.amazon.sa/dp/B0DMTKVDYR'],
];

const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
const backup = [];
for (const [cid, has] of REMOVE) {
  const offs = await prisma.componentOffer.findMany({ where: { componentId: cid, url: { contains: has } } });
  const c = await prisma.component.findUnique({ where: { id: cid }, select: { name: true } });
  if (!offs.length) { console.log(`✗ ${c?.name}: لا عرض يحوي ${has}`); process.exitCode = 1; continue; }
  for (const o of offs) { if (backup.some((b) => b.id === o.id)) continue; console.log(`− ${c.name}: ${o.url.slice(0, 70)}…`); backup.push(o); }
}
for (const [cid, url] of ADD) {
  const asin = url.split('/dp/')[1];
  const taken = await prisma.componentOffer.findFirst({ where: { url: { contains: `/dp/${asin}` } }, select: { component: { select: { name: true } } } });
  const c = await prisma.component.findUnique({ where: { id: cid }, select: { name: true } });
  if (taken) { console.log(`✗ ${asin} موجودٌ على ${taken.component.name}`); process.exitCode = 1; continue; }
  console.log(`+ ${c.name}: ${url}`);
}
if (process.exitCode) process.exit(1);

if (apply) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  writeFileSync(`backups/fix-mislinks-${stamp}.json`, JSON.stringify(backup, null, 2));
  for (const o of backup) await prisma.componentOffer.delete({ where: { id: o.id } });
  for (const [cid, url] of ADD) await prisma.componentOffer.create({ data: { componentId: cid, storeId: stores.amazon, url, inStock: true } });
  console.log(`\nنُفّذ — النسخة في backups/fix-mislinks-${stamp}.json`);
} else console.log('\n(عرضٌ فقط — أضف --apply)');
await prisma.$disconnect();
