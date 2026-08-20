/* ============ حذف طلبات الاقتراح التي أنشأها الفحص الحيّ ============
 *
 * الفحص الحيّ لبطاقة الاقتراح يكتب في قاعدة الإنتاج (خادم التطوير يشير
 * إلى Neon نفسها)، فترك ثلاثة أسماءٍ وهمية في `RequestedPart`. تُحذف هنا
 * بأسمائها الصريحة — والأصوات تسقط معها بـ Cascade.
 *
 * ⚠️ يطبع ما سيحذف قبل أن يحذف، ولا يلمس ما ليس في القائمة.
 *
 *   npx tsx scripts/purge-test-requests.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const MARKS = ['اختبار الإشعار', 'اختبار ثانٍ', 'Peerless Assassin 120 SE — فحص'];
async function main() {
  const rows = await prisma.requestedPart.findMany({
    where: { OR: MARKS.map((m) => ({ name: { contains: m } })) },
    select: { id: true, name: true, createdAt: true, _count: { select: { votes: true } } },
  });
  console.log(`\nوُجد ${rows.length} طلباً من الفحص:`);
  rows.forEach((r) => console.log(`  · ${r.name}  (أصوات: ${r._count.votes})`));
  if (rows.length) {
    const { count } = await prisma.requestedPart.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
    console.log(`\nحُذف ${count}`);
  }
  console.log(`باقٍ في الجدول: ${await prisma.requestedPart.count()} طلباً حقيقياً`);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
