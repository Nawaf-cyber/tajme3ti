/* ============ صورة AG300: من المصنّع لا من المتجر ============
 *
 * `fetch-images.ts` جلب صورة AG300 من كازاسوق فجاءت باسم
 * «Deepcool AG400 Air cooler ARGB - Black». وتحقّقتُ من الصفحة: og:image
 * فيها **صورة AG400 فعلاً** — المتجر وضع صورة المنتج الأخ.
 *
 * وهما ليسا متشابهين: AG300 ارتفاعه ١٢٩ مم بمروحة ٩٢ مم، و AG400 ‏١٥٢ مم
 * بمروحة ١٢٠. فالصورة تعِد المشتري بشيءٍ لا يصله.
 *
 * ⚠️ ولم أستبدلها بالصورة الثانية على صفحة المتجر: اسمها رقمُ باركود لا
 * يُقرأ، ولا وسيلة عندي لرؤيتها. صورةٌ لا أستطيع التحقّق منها ليست أفضل
 * من صورةٍ أعرف أنها خاطئة — كلتاهما تخمين.
 *
 * فالمصدر هو المصنّع: مسار الصورة نفسه يحمل /AG300/، فالتسمية دليلٌ لا
 * ادّعاء. وتحقّقتُ أن الرابط يردّ 200 وimage/webp.
 *
 * (ولا قيود على مضيفات الصور في المشروع — لا next.config أصلاً.)
 *
 *   npx tsx scripts/fix-ag300-image.ts --apply
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const IMG = 'https://cdn.deepcool.com/public/ProductFile/DEEPCOOL/Cooling/CPUAirCoolers/AG300/Gallery/800X800/01.jpg';
const apply = process.argv.includes('--apply');

async function main() {
  const c = await prisma.component.findFirst({
    where: { name: 'AG300', category: { name: 'Cooler' } },
    select: { id: true, name: true, imageUrl: true },
  });
  if (!c) { console.error('⛔ AG300 غير موجود'); process.exit(1); }

  if (!/AG400/i.test(c.imageUrl || '')) {
    console.log('الصورة الحالية لا تحمل اسم AG400 — لم تُمسّ:\n  ' + c.imageUrl);
    await prisma.$disconnect();
    return;
  }

  console.log(`  − ${decodeURIComponent((c.imageUrl || '').split('/').pop() || '')}`);
  console.log(`  + ${IMG.split('/').slice(-4).join('/')}`);
  if (apply) await prisma.component.update({ where: { id: c.id }, data: { imageUrl: IMG } });
  console.log(apply ? '\n✔ كُتبت' : '\nأضف --apply');
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
