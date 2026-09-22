/**
 * ============ مراجعةُ درجات الكروت ============
 *
 * رصد نوّاف توصيةً خاطئة: «رقِّ RTX 4060 إلى Intel Arc A770». والسبب أنّ
 * درجةَ A770 عندنا ٣ ودرجةَ 4060 ٢ — والواقع أنّهما متقاربان.
 *
 * ============ المقياس ============
 *
 * الدرجاتُ خمسٌ خشنة، وكانت تُكتب بالتقدير فتناقضت. فأُسندت إلى **أداءٍ
 * نسبيٍّ منشور**، مرجعُه RTX 4060 = ١٠٠ (١٠٨٠p فائق):
 *
 *   ١ : أقلّ من ٧٠    — لا يكفي 1080p عالياً
 *   ٢ : ٧٠ – ١١٩      — 1080p
 *   ٣ : ١٢٠ – ١٧٥     — 1080p عالٍ / مدخل 1440p
 *   ٤ : ١٧٦ – ٢٥٥     — 1440p / مدخل 4K
 *   ٥ : أكثر من ٢٥٥   — 4K وما فوق
 *
 * ⚠️ والحدودُ تُكتب هنا لا في رؤوسنا: درجةٌ بلا مقياسٍ معلَن تتناقض مع
 * جارتها بعد شهر — وهو ما وقع. ومن يضيف كرتاً غداً يقرأ الجدول ويضعه.
 *
 * ============ ما يتغيّر ============
 *
 * خمسٌ من ٥٥، وكلُّها مُسندة:
 *   • A770 و B580 و 6700 XT  — في نطاق 4060 لا فوقه بدرجة.
 *   • 7800 XT — يساوي RTX 4070 (درجتُه ٣)، فلا يعلوه بدرجة.
 *   • 7900 XT — يساوي 4070 Ti SUPER و5070 Ti (درجتهما ٤)، ودونه
 *     7900 XTX بـ١٥٪ وهي ٥.
 *
 * ⚠️ والأثر يتعدّى «أضعف حلقة»: الدرجة تغذّي فحص الاختناق في «تجميعاتي»
 * و«تجميعات مقترحة» والباني. فتصحيحُها يُصلح الأربعة لا واحداً.
 *
 *   node scripts/fix-gpu-tiers.mjs           # عرض
 *   node scripts/fix-gpu-tiers.mjs --apply   # تنفيذ مع نسخة احتياطية
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

/** الاسم كما هو في الكتالوج → [الدرجة الجديدة، الأداء النسبيّ، السند] */
const FIXES = [
  ['Intel Arc A770', 2, 102,
   'B580 أسرع من A770 و4060 بنحو ١٠٪ — أي أنّ A770 في نطاق 4060 (GamersNexus · TechSpot)'],
  ['Intel Arc B580', 2, 112,
   'أسرع من 4060 بنحو ١٠٪ وسطاً — داخل نطاق 1080p لا فوقه بدرجة'],
  ['AMD Radeon RX 6700 XT 12GB', 2, 106,
   'أسرع من 4060 بـ٦٪ عند 1440p — نفس النطاق'],
  ['AMD Radeon RX 7800 XT', 3, 165,
   'يساوي RTX 4070 (أعلى منه رستَرةً وأدنى في تتبّع الأشعّة) — و4070 درجتُه ٣'],
  ['AMD Radeon RX 7900 XT', 4, 235,
   'يساوي 4070 Ti SUPER و5070 Ti ودرجتهما ٤؛ و7900 XTX أسرع منه ١٥٪ وهي ٥'],
];

// ---------------------------------------------------------------- التنفيذ

const rows = await prisma.component.findMany({
  where: { category: { name: 'GPU' } },
  select: { id: true, brand: true, name: true, performanceTier: true },
});

const byName = new Map(rows.map((c) => [`${c.brand} ${c.name}`, c]));

let blocked = false;
const plan = [];
for (const [full, tier, rel, why] of FIXES) {
  const c = byName.get(full);
  if (!c) { console.log(`⛔ لم أجد «${full}»`); blocked = true; continue; }
  if (c.performanceTier === tier) { console.log(`— «${full}» درجتُه ${tier} أصلاً`); continue; }
  plan.push({ id: c.id, full, from: c.performanceTier, to: tier, rel, why });
}

console.log(`\n${plan.length} درجةً تتغيّر من ${rows.length} كرتاً:\n`);
for (const p of plan) {
  console.log(`  ${p.from} → ${p.to}   ${p.full}`);
  console.log(`        نسبيّ ≈ ${p.rel} (4060 = 100)`);
  console.log(`        ${p.why}\n`);
}

if (blocked) { console.log('⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/gpu-tiers-${stamp}.json`,
  JSON.stringify(rows.map((c) => ({ id: c.id, name: `${c.brand} ${c.name}`, tier: c.performanceTier })), null, 2));
console.log(`نسخة احتياطية (الدرجات كلّها قبل التغيير): backups/gpu-tiers-${stamp}.json\n`);

for (const p of plan) {
  await prisma.component.update({ where: { id: p.id }, data: { performanceTier: p.to } });
  console.log(`✔ ${p.full}: ${p.from} → ${p.to}`);
}

await prisma.$disconnect();
