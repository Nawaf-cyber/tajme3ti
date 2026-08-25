/* ============ نون: سحبٌ موقوف وسعرٌ يدويّ ============
 *
 * تسعة عشر عرضاً من نون، **كلُّها** عليها خطأ ولا واحدَ ينجح — منذ أُضيف
 * المتجر (2026-08-05) لا منذ أُضيفت عروض المبرّدات.
 *
 * والسبب قُيس لا خُمّن (`scripts/noon-probe.ts`):
 *
 *   بلا وسيط        → 403 «Access Denied» من errors.edgesuite.net (Akamai)
 *   Scrape.do عاديّ  → 200 و186KB في 14.6 ثانية… ثم 1KB محجوب في المحاولة
 *                      التالية بعد 58 ثانية
 *   Scrape.do مميّز  → انقطع بعد 45 ثانية
 *
 * والمتصفّح الحقيقيّ نفسه يُردّ. فالمشكلة ليست مهلةً تُرفع ولا محدّداً
 * يُكتب: نون يحجب الآلات، وكل دورةٍ تحرق رصيداً وتُنتج ١٩ علامةً حمراء.
 *
 * فيُوقَف سحبه ويبقى سعره يدوياً — وهو حكمٌ يدعمه المخطّط أصلاً
 * (`scrapeMode: 'off'` = «لا يُسحب، سعر يدوي»).
 *
 * ⚠️ وقد سبق هذا إصلاحٌ لازم: كان المتجر الموقوف يسقط من **قائمة العروض**
 * في الكرون، فيسقط من حساب أرخص سعر — فلو أُوقف نون لارتفع سعر LE240 V2
 * من 279 إلى 304.48 بينما شارة نون تعرض 279. صار يسقط من الجلب وحده.
 * (`scripts/skipped-offer-check.ts`)
 *
 *   npx tsx scripts/noon-manual-mode.ts          (عرض فقط)
 *   npx tsx scripts/noon-manual-mode.ts --apply  (تنفيذ)
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const APPLY = process.argv.includes('--apply');
const G = '\x1b[32m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

async function main() {
  console.log(APPLY ? `\n${Y}وضع التنفيذ${X}` : `\n${D}عرض فقط — أضف --apply للتنفيذ${X}`);

  const noon = await prisma.store.findFirst({ where: { slug: 'noon' } });
  if (!noon) { console.error('⛔ متجر نون غير موجود'); process.exit(1); }

  const offers = await prisma.componentOffer.count({ where: { storeId: noon.id } });
  const withErr = await prisma.componentOffer.count({ where: { storeId: noon.id, lastError: { not: null } } });
  console.log(`\nنون: وضع «${noon.scrapeMode}» · ${offers} عرضاً · ${withErr} عليها خطأ`);

  if (!APPLY) {
    console.log(`\n${D}سيُضبط الوضع على «off» وتُمسح الأخطاء الـ${withErr}.${X}`);
    console.log(`${D}الأسعار لا تُلمس — قُرئت من نون يدوياً وهي صحيحة.${X}`);
    await prisma.$disconnect();
    return;
  }

  await prisma.store.update({ where: { id: noon.id }, data: { scrapeMode: 'off' } });
  const { count } = await prisma.componentOffer.updateMany({
    where: { storeId: noon.id, lastError: { not: null } },
    data: { lastError: null },
  });

  const left = await prisma.componentOffer.count({ where: { lastError: { not: null } } });
  const byStore = await prisma.componentOffer.groupBy({
    by: ['storeId'],
    where: { lastError: { not: null } },
    _count: true,
  });
  const stores = await prisma.store.findMany({ select: { id: true, name: true } });
  const nameOf = new Map(stores.map((s) => [s.id, s.name]));

  console.log(`\n${G}✔${X} نون → off · مُسحت ${count} علامة خطأ`);
  console.log(`\nالباقي في الموقع كلّه: ${left} عرضاً عليه خطأ`);
  byStore.forEach((b) => console.log(`   ${D}${nameOf.get(b.storeId)}: ${b._count}${X}`));

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
