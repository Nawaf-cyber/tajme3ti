/**
 * 2026-11-06 — فئة الشاشات (خطّة الشاشات: «أساس النظام جاهز للشاشات»).
 *
 * ⚠️ لا prisma/seed.ts: يمسح القطع والفئات كلّها قبل أن يزرع. ولا مسار في الموقع ينشئ فئة.
 *
 * والفئة الفارغة لا تظهر في الباني ولا التصفّح ولا المقارنة (lib/categories · HAS_PARTS)،
 * لكنّها تظهر فوراً في موضعين يقرآن /api/categories بلا ترشيح — وهذا مقصود:
 *   · لوحة الإدارة (لتُضاف إليها القطع)
 *   · بطاقة «اقترح قطعة» للزوّار (components/SuggestPartCard)
 * وما يخصّ التجميعة لا تدخله أبداً (lib/category-meta · isBuildCategory).
 *
 *   node scripts/create-monitor-category-2026-11-06.mjs           # عرض
 *   node scripts/create-monitor-category-2026-11-06.mjs --apply   # إنشاء
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const NAME = 'Monitor';

const all = await prisma.category.findMany({ select: { id: true, name: true, _count: { select: { components: true } } }, orderBy: { name: 'asc' } });
console.log('الفئات الآن:', all.map((c) => `${c.name}(${c._count.components})`).join(' · '));

/* الاسم مفتاحٌ تدور عليه الفحوص (lib/category-meta) — ونسخةٌ بحالة أحرفٍ أخرى فئةٌ ثانية صامتة */
const clash = all.find((c) => c.name.toLowerCase() === NAME.toLowerCase());
if (clash) {
  console.log(clash.name === NAME ? `✓ «${NAME}» موجودة (${clash.id}) — لا شيء يُفعل` : `⛔ موجودةٌ باسمٍ قريب: «${clash.name}»`);
  await prisma.$disconnect();
  process.exit(clash.name === NAME ? 0 : 1);
}

if (!apply) { console.log(`✚ ستُنشأ «${NAME}» — (عرضٌ فقط، أضف --apply)`); await prisma.$disconnect(); process.exit(0); }

const c = await prisma.category.create({ data: { name: NAME } });
console.log(`✔ أُنشئت «${NAME}» → ${c.id}`);
await prisma.$disconnect();
