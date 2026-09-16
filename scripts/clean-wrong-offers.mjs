/**
 * ============ عروضٌ رابطُها منتجٌ آخر ============
 *
 * كُنس الكتالوج كلُّه يوم 2026-09-16: قُرئ اسمُ كلّ منتجٍ من مسار رابطه
 * وقُورن ببصمة قطعته (`lib/source-match.ts`). ونتج ١٤٥ تنبيهاً، أغلبُها
 * ضجيجُ فاحصٍ مشدود (عنوانٌ طويل يذكر مواصفاتٍ لا نذكرها). وبقي بعد
 * المراجعة اليدويّة **ثمانيةٌ أخطاءٌ حقيقيّة** — كلٌّ منها سعرُ منتجٍ
 * مختلفٍ معلَّقٌ على قطعةٍ عندنا.
 *
 * وكلُّها اليوم «نافدة»، فحذفُها لا يُغيّر سعراً معروضاً الآن. لكنّ بقاءها
 * قنبلةٌ موقوتة: يوم يعود المخزون يدخل السعر الخاطئ **ويصير الأرخص**
 * فيتصدّر المقارنة. أوضحُها كازاسوق على «RTX 5060 Ti 8GB» — ورابطُه
 * RTX 5060 بلا Ti بـ١٨٠٠ ﷼ بينما القطعة بـ٢٣٩٥.
 *
 * ⚠️ ولا تُحذف القطعة: العرض وحده. القطعة صحيحة، ورابطُها الآخر صحيح.
 *
 * وتُحذف معها ستّةُ «طلبات قطع» ليست طلبات — نصوصُ فحصٍ كُتبت في
 * 2026-09-15 (`xss-src` و`deduptest-xyz-123` و`<img src=x onerror=…>`)
 * تجلس في طابور الإدارة وتُخفي الطلبات الحقيقيّة تحتها.
 *
 *   node scripts/clean-wrong-offers.mjs           # عرض
 *   node scripts/clean-wrong-offers.mjs --apply   # حذف
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const WRONG_OFFERS = [
  ['cmsqbc2po0001ucymzr6m030a', 'RTX 5060 Ti 8GB ← الرابط RTX 5060 بلا Ti (Gigabyte Ice Eagle) بـ١٨٠٠ ﷼'],
  ['cmsgejvvo005mpsymynzprd5v', 'RTX 4070 12GB ← الرابط RTX 4070 **SUPER**'],
  ['cmsgejz17006epsymxu2rb8h4', 'MPG A1000G ← الرابط A1000G**S** (طرازٌ آخر)'],
  ['cmsgekb0d009hpsym1v4xhmxg', 'FireCuda 530 2TB ← الرابط 530**R**'],
  ['cmsgekhho00b7psymhsyid2j2', 'FireCuda 530 4TB ← الرابط 530**R**'],
  ['cmtfyei45000htwyms8sm75wr', 'Spectrix D60G 3600MHz ← الرابط 3200MHz (AX4U3200316G16A)'],
  ['cmsgejq5d0049psymakoo1k7z', 'Trident Z5 Neo 6000 ← الرابط 6400MHz RGB'],
  ['cmsgejq9i004apsym52hnt2fq', 'Trident Z5 Neo 32GB ← الرابط طقم 64GB (2x32)'],
];

const JUNK_REQUESTS = ['idprobe-zz1', '<img src=x onerror=alert(1)>', 'xss-src', 'deduptest-xyz-123', 'massassign', 'test part'];

let n = 0;
for (const [id, why] of WRONG_OFFERS) {
  const o = await prisma.componentOffer.findUnique({
    where: { id }, include: { component: { select: { name: true } }, store: { select: { name: true } } },
  });
  if (!o) { console.log(`— مفقود مسبقاً: ${why}`); continue; }
  console.log(`${apply ? '✔ حُذف' : '·'} ${o.store.name} من «${o.component.name}» — ${why}`);
  if (apply) { await prisma.componentOffer.delete({ where: { id } }); n++; }
}

const junk = await prisma.requestedPart.findMany({ where: { name: { in: JUNK_REQUESTS } }, select: { name: true } });
console.log(`\n${junk.length} «طلب قطعة» من نصوص الفحص: ${junk.map((j) => j.name).join(' · ')}`);
if (apply) {
  const d = await prisma.requestedPart.deleteMany({ where: { name: { in: JUNK_REQUESTS } } });
  console.log(`✔ حُذف ${d.count}`);
}

console.log(apply ? `\nتمّ: ${n} عرضاً.` : '\n(عرضٌ فقط — أضف --apply)');
await prisma.$disconnect();
