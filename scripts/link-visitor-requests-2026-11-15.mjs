/**
 * 2026-11-15 — ربط طلبات الزوّار بقطعها وتحويلها «تمت الإضافة». نوّاف: «أضف كلها واربط الموجودة».
 * نفس ما يفعله updatePartRequest في app/admin/actions.ts (componentId + ADDED) — بلا إشعارات.
 * الطلبات متعدّدة القطع تُربط بقطعةٍ واحدة (الحقل واحد)، والردّ يذكر البقيّة.
 *
 *   node scripts/link-visitor-requests-2026-11-15.mjs           # عرض
 *   node scripts/link-visitor-requests-2026-11-15.mjs --apply   # تنفيذ (بعد نسخة احتياطيّة)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const LINKS = [
  // البند ١ — أُضيفت اليوم (add-visitor-requests-2026-11-15.mjs)
  ['cmvb9wcne000406l57hg526fq', 'cmwhrvzxf0000fcymr2pc1rpl'], // RTX 5080 ROG ASTRAL
  ['cmv604u27000206jk0sedaq0l', 'cmwhrw0gt0004fcym99a7pqr5'], // X870E Taichi Lite
  ['cmv1im1pa000106lefu2t2x15', 'cmwhrw0wb0008fcyma7e9d3pt'], // 5060 oc eagle white
  ['cmw91n9m9000008jwsrxu16z9', 'cmwhrw19m000bfcymhakog99e'], // مبرّد ماجيستي 360 بشاشة
  ['cmsylujp4000004jola8rut6a', 'cmwhrw1kl000dfcymhkiynova'], // Majesty Power Supply 700W
  ['cmuhu3ea6000504jsh323biuo', 'cmwhrw1tj000ffcymjq34j9vp'], // Majsteay Power Supply → 850W Gold (والردّ يذكر 700W)
  ['cmv6ttcmn000b06l9vl610yda', 'cmwhrw24y000ifcym1lt0nsfg'], // جميع صناديق ماجيستي → Mavera Pro (والردّ يذكر الثمانية)
  ['cmuhu2rr4000304js1s9st068', 'cmwhrw2ro000pfcymur45l3ra'], // Majestay Speace C → X-Space Plus (والردّ يذكر X-Space)
  // البند ٢ — موجودة من قبل
  ['cmw27v5xp000008lbqn39iier', 'cmw3k1u7q0004wwyma2wr1ghz'], // LANCOOL 217 Walnut (أُضيف 11-05)
  ['cmvbvx5nd000506jsrjjbz0xt', 'cmq122okp000mjwymt3193qwb'], // RTX 5070 → NVIDIA 12GB
  ['cmva43vbx000706ldpjpcy1pd', 'cmq5060tixx00000ym00000002'], // RTX 5060 ti → 16GB
  ['cmwhw2nmr000308jqu7cixtfb', 'cmq5060tixx00000ym00000002'], // Rtx 5060 ti 16gb (جديد اليوم)
  ['cmvg324lk000007lcnlc7wajp', 'cmuzymuzt001kwwymq5pc5jm0'], // Asus 850w gold → TUF Gaming 850W Gold
];

const reqs = await prisma.requestedPart.findMany({ where: { id: { in: LINKS.map((l) => l[0]) } } });
const comps = await prisma.component.findMany({ where: { id: { in: LINKS.map((l) => l[1]) } }, select: { id: true, brand: true, name: true } });
if (reqs.length !== LINKS.length) throw new Error(`طلبات ناقصة: ${reqs.length}/${LINKS.length}`);
for (const [r, c] of LINKS) {
  const q = reqs.find((x) => x.id === r), k = comps.find((x) => x.id === c);
  if (!k) throw new Error(`قطعة مفقودة ${c}`);
  console.log(`${q.status.padEnd(9)} «${q.name.slice(0, 50)}» → ${k.brand} ${k.name}`);
}
if (!apply) { console.log('\n(عرض فقط — أضف --apply)'); process.exit(0); }

const file = `backups/link-requests-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
writeFileSync(file, JSON.stringify(reqs, null, 1));
console.log('نسخة احتياطيّة:', file);
for (const [r, c] of LINKS) await prisma.requestedPart.update({ where: { id: r }, data: { status: 'ADDED', componentId: c } });
console.log(`رُبط ${LINKS.length} طلباً.`);
await prisma.$disconnect();
