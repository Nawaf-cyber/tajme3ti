/* ============ سعرٌ بلا مصدر ============
 *
 * «P3 Plus 4TB» كان سعرها ٩٩٩ ﷼ مأخوذاً من عرض أمازون الذي تبيّن أنه
 * يشير إلى `CT4000P3SSD8` — وهو P3 العاديّ لا P3 Plus. حُذف العرض،
 * فبقي الرقم يُعرض للمشتري بلا ما يسنده.
 *
 * ولا يُوضع مكانه تقدير: لا كازاسوق ولا نون ولا أمازون تحمل الطراز
 * الصحيح `CT4000P3PSSD8`، ومايكرولس تحمله نافداً بلا سعر. فيُصفَّر —
 * والواجهة تقول «غير متوفر — لا سعر مسجّل» بدل أن تعرض رقماً مختلقاً.
 * ويعود السعر وحده متى عاد المخزون وسحبه الساحب.
 *
 * ⚠️ فُحص أوّلاً: ٠ تجميعة محفوظة تستعمل هذه القطعة، فلا مجموع يتأثّر.
 *
 *   npx tsx scripts/clear-orphan-price.ts --apply
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const APPLY = process.argv.includes('--apply');
async function main() {
  const c = await prisma.component.findFirst({ where: { name: 'P3 Plus 4TB' }, select: { id: true, name: true, price: true } });
  if (!c) { console.log('غير موجودة'); return; }
  const used = await prisma.savedBuild.count({ where: { storageId: c.id } });
  console.log(`\n${c.name} — ${c.price} ﷼ — تجميعات تستعملها: ${used}`);
  if (used > 0) { console.log('⛔ تستعملها تجميعات — أوقف'); process.exit(1); }
  if (!APPLY) { console.log('عرض فقط — أضف --apply'); return; }
  await prisma.component.update({ where: { id: c.id }, data: { price: 0 } });
  const after = await prisma.component.findUnique({ where: { id: c.id }, select: { price: true } });
  console.log(`✔ صار ${after?.price} — والواجهة تقول «غير متوفر — لا سعر مسجّل»`);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
