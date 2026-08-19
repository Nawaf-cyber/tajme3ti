/* ============ عروضٌ إضافية للمبرّدات ============
 *
 * ⚠️ **الواجهة السعودية لا العالمية.** عروضنا القائمة كلُّها على
 * `saudi.microless.com` و `noon.com/saudi-ar` و `amazon.sa`. والبحث يعطي
 * `global.microless.com` — وهي واجهةٌ بالدولار. ولو أُضيف رابطٌ عالميّ
 * لسجّل الساحبُ دولاراتٍ ريالاتٍ بلا اعتراض، لأن `currencyFound` يُلتقط
 * ولا يُفحص. فالتحويل إلى `saudi.` شرطٌ لا تجميل.
 *
 * ⚠️ **والمطابقة بالطراز لا بالاسم القريب.** بحث أمازون أعطى:
 *     AG400 BK ARGB   ← ليس AG400 **G2** ARGB (جيلٌ سابق)
 *     GAMMAXX L360 V2 ← ليس LE360 V2 (سلسلةٌ أخرى)
 * وإضافةُ أيٍّ منهما تربط سعر منتجٍ بمنتجٍ آخر — وهو أسوأ من عرضٍ واحد،
 * لأن المقارنة تصير كذباً بدل أن تكون ناقصة. فلا يُضاف إلا ما تطابق طرازه.
 *
 *   npx tsx scripts/add-cooler-offers.ts          # عرض
 *   npx tsx scripts/add-cooler-offers.ts --apply
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

/* [اسم القطعة, سلاق المتجر, الرابط] — رابطٌ واحد لكل سطر، مُتحقَّقٌ منه */
const OFFERS: [string, string, string][] = [
  [
    'Air-Killer Pro Arctic White', 'microless',
    'https://saudi.microless.com/product/xigmatek-air-killer-pro-arctic-cpu-cooler-1800rpm-fan-speed-82-2cfm-airflow-hydraulic-bearing-x22a-argb-fan-25-3-dba-fan-noise-level-4-pin-pwm-fan-connector-white-en47925/',
  ],
];

const apply = process.argv.includes('--apply');

async function main() {
  let added = 0;
  for (const [name, slug, url] of OFFERS) {
    if (/global\.microless|noon\.com\/(?!saudi)/i.test(url)) {
      console.error(`⛔ رابطٌ غير سعوديّ: ${url}`); process.exit(1);
    }

    const comp = await prisma.component.findFirst({
      where: { name, category: { name: 'Cooler' } }, select: { id: true, name: true },
    });
    if (!comp) { console.error(`⛔ لا مبرّد باسم «${name}»`); process.exit(1); }

    const store = await prisma.store.findFirst({ where: { slug }, select: { id: true } });
    if (!store) { console.error(`⛔ لا متجر «${slug}»`); process.exit(1); }

    const dup = await prisma.componentOffer.findFirst({ where: { url } });
    if (dup) { console.log(`  ⏭️  ${comp.name} — الرابط مستعمل`); continue; }

    console.log(`  ➕ ${comp.name.padEnd(30)} ${slug}`);
    if (apply) {
      await prisma.componentOffer.create({
        data: { componentId: comp.id, storeId: store.id, url, inStock: true },
      });
      added++;
    }
  }
  console.log(`\n${apply ? `أُضيفت: ${added}` : 'أضف --apply'}`);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
