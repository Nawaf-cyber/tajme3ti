/* ============ إعادة محاولة العروض الفاشلة ============
 *
 * الأخطاء الباقية بعد إيقاف نون كلُّها عابرة: «تجاوز الوقت المسموح»
 * و«429» من دورة الكرون الأخيرة — لا حجبَ دائم ولا محدّد خاطئ.
 *
 * وهي لا تُمسح وحدها إلا حين تصل القطعة دورَها في الطابور، والطابور
 * يرتّب بالأقدم سحباً — فقد تنتظر أياماً وهي علامةٌ حمراء في اللوحة.
 *
 * يُعيد سحب القطع المعنيّة **واحدةً واحدة** لا بالتوازي: سبب أحد
 * الأخطاء هو 429 نفسه، فإعادةُ المحاولة بالتوازي تُعيد إنتاجه.
 *
 * ⚠️ يكتب في الإنتاج بنفس منطق الكرون — لا منطقٍ موازٍ يتباعد عنه.
 *
 *   npx tsx scripts/retry-failed-offers.ts          (عرض فقط)
 *   npx tsx scripts/retry-failed-offers.ts --apply  (تنفيذ)
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { scrapeComponentOffers, resolveOfferPrices } from '../lib/scrape-offers';
import { SCRAPE_STORE_SELECT } from '../lib/stores-server';
import { setScrapeDeadline, recordPriceHistory } from '../lib/scrape-prices';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const APPLY = process.argv.includes('--apply');
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const token = process.env.SCRAPER_API_KEY;
  if (!token) { console.error('⛔ SCRAPER_API_KEY غير مضبوط'); process.exit(1); }

  const failing = await prisma.componentOffer.findMany({
    where: { lastError: { not: null }, store: { active: true, scrapeMode: { not: 'off' } } },
    select: { componentId: true, store: { select: { name: true } }, component: { select: { name: true } }, lastError: true },
  });

  const ids = [...new Set(failing.map((f) => f.componentId))];
  console.log(`\n${failing.length} عرضاً فاشلاً على ${ids.length} قطعة:`);
  failing.forEach((f) => console.log(`   ${D}[${f.store.name}] ${f.component.name} — ${String(f.lastError).slice(0, 46)}${X}`));

  if (!APPLY) {
    console.log(`\n${D}عرض فقط — أضف --apply لإعادة السحب (${ids.length} طلب سحب).${X}`);
    await prisma.$disconnect();
    return;
  }

  console.log(`\n${Y}إعادة السحب واحدةً واحدة${X}\n`);
  let fixed = 0, still = 0;

  for (const id of ids) {
    setScrapeDeadline(52000);
    const comp = await prisma.component.findUnique({
      where: { id },
      include: {
        offers: { where: { store: { active: true } }, include: { store: { select: SCRAPE_STORE_SELECT } } },
      },
    });
    if (!comp) continue;

    const scraped = await scrapeComponentOffers(comp as any, token);
    const resolved = resolveOfferPrices(comp as any, scraped.results);

    for (const u of resolved.offerUpdates) {
      await prisma.componentOffer.update({ where: { id: u.offerId }, data: u.data });
    }
    await prisma.component.update({
      where: { id },
      data: { price: resolved.lowestPrice, lastScrapedAt: new Date() },
    });
    await recordPriceHistory(prisma, id, resolved.pricePoints);

    const errs = resolved.offerUpdates.filter((u) => u.data.lastError).length;
    if (errs === 0) { fixed++; console.log(`  ${G}✔${X} ${comp.name} — ${resolved.lowestPrice} ﷼`); }
    else { still++; console.log(`  ${R}✘${X} ${comp.name} — ما زال ${errs} خطأ`); }

    await sleep(2500); // 429 كان أحد الأسباب — لا نُعيد إنتاجه
  }

  const left = await prisma.componentOffer.count({
    where: { lastError: { not: null }, store: { active: true, scrapeMode: { not: 'off' } } },
  });
  console.log(`\n${'─'.repeat(46)}\nنجح ${fixed} · بقي ${still} · الأخطاء المتبقّية في الموقع: ${left}`);

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
