/**
 * ============ سحب أسعار قطعٍ بعينها ============
 *
 * القطعة المضافة حديثاً تولد بسعر صفر — السعر يأتي من الرابط لا من الكاتب.
 * ومسار /api/update-single يشترط جلسة أدمن فلا يصلح من سطر الأوامر، والكرون
 * الشامل يرفض التشغيل خارج موعده (وتشغيله لدفعة كاملة يحرق رصيد سحب).
 *
 * هذا يستدعي **نفس** مكتبتَي السحب اللتين يستدعيهما المسار والكرون
 * (scrapeComponentOffers ثم resolveOfferPrices)، فلا ينشأ منطقٌ ثالث
 * يتباعد عنهما — وهو الخطأ الذي عاش مرّتين في محدّد كازاسوق.
 *
 * ⚠️ الامتداد .ts لا .mts عمداً: package.json بلا "type": "module"، فتُترجم
 * ملفات lib إلى CJS. وملفٌ ESM يستورد منها بأسماء يفشل عند الربط
 * («does not provide an export named»). فالجسم ملفوفٌ في main() لأن CJS
 * لا يسمح بـ await في المستوى الأعلى.
 *
 *   npx tsx scripts/scrape-one.ts <id> [<id> …]
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { scrapeComponentOffers, resolveOfferPrices } from '../lib/scrape-offers';
import { recordPriceHistory, setScrapeDeadline } from '../lib/scrape-prices';
import { SCRAPE_STORE_SELECT } from '../lib/stores-server';

async function main() {
  const ids = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  if (ids.length === 0) {
    console.error('استعمال: npx tsx scripts/scrape-one.ts <id> [<id> …]');
    process.exit(1);
  }

  const token = process.env.SCRAPER_API_KEY;
  if (!token) {
    console.error('⛔ SCRAPER_API_KEY غير مضبوط');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  setScrapeDeadline(52000);

  for (const id of ids) {
    const comp = await prisma.component.findUnique({
      where: { id },
      include: {
        offers: {
          where: { store: { active: true, scrapeMode: { not: 'off' } } },
          include: { store: { select: SCRAPE_STORE_SELECT } },
        },
      },
    });
    if (!comp) {
      console.log(`✖ ${id}: غير موجودة`);
      continue;
    }

    const { results, errors } = await scrapeComponentOffers(comp as any, token);
    const r = resolveOfferPrices(comp as any, results);

    for (const u of r.offerUpdates) {
      await prisma.componentOffer.update({ where: { id: u.offerId }, data: u.data });
    }
    if (r.lowestPrice > 0) {
      await prisma.component.update({
        where: { id },
        data: { price: r.lowestPrice, lastScrapedAt: new Date() },
      });
      await recordPriceHistory(prisma as any, id, r.pricePoints);
    }

    console.log(`\n=== ${comp.brand} ${comp.name}`);
    for (const line of r.lines) {
      console.log(`   ${line.label.padEnd(12)} ${line.inStock ? '✔' : '✖'} ${line.price ?? '—'}`);
    }
    console.log(`   أقل سعر: ${r.lowestPrice || '— لم يُقرأ'}${r.cheapestStore ? ' من ' + r.cheapestStore : ''}`);
    errors.forEach((e) => console.log(`   ⚠ ${e}`));
    r.holds.forEach((h) => console.log(`   ⏸ ارتفاع معلَّق: ${h.storeName} ${h.oldPrice}→${h.newPrice}`));
  }

  await prisma.$disconnect();
}

main();
