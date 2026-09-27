/**
 * فحصُ «أُزيل من المتجر» (lib/scrape-prices.ts · GONE_MARK).
 *
 *   npx tsx scripts/gone-check.ts          # القواعد والإشارتان
 *   npx tsx scripts/gone-check.ts --live   # + صفحاتٌ حقيقيّة من كلّ متجر (رصيد Scrape.do)
 *
 * ⚠️ و--live هو الفحص الذي يهمّ: إيجابٌ كاذبٌ واحد — متجرٌ صفحاتُه الحيّة
 * تشير «أصليّتها» إلى الرئيسيّة — يُسقط عروضه كلّها في فحصين. فيُجرَّب
 * على عروضٍ متوفّرةٍ يُقرأ سعرُها اليوم (يجب ألّا يُعلَّم أيٌّ منها)، وعلى
 * الأربعة التي ثبت يدويّاً أنّها أُزيلت (يجب أن تُعلَّم).
 */
import 'dotenv/config';
import { redirectedHome, httpFailure, GONE_MARK } from '../lib/scrape-prices';
import { resolveOfferPrices, type OfferRow, type OfferResult } from '../lib/scrape-offers';

let failed = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : ` — got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`}`);
};

/* ============ القاعدة ============ */
const page = (canonical: string) => `<html><head><link rel="canonical" href="${canonical}"/></head><body>${'x'.repeat(600)}</body></html>`;
const P = 'https://www.infiniarc.com/shop/gpu/some-card-9012';
eq('الرئيسيّة بدل المنتج ← أُزيل', redirectedHome(page('https://www.infiniarc.com/'), P), true);
eq('الرئيسيّة بلا www ← أُزيل', redirectedHome(page('https://infiniarc.com'), P), true);
eq('صفحة المنتج نفسها ← حيّ', redirectedHome(page(P), P), false);
eq('أصليّةٌ لمنتجٍ آخر (نسخة لون) ← ليست إزالة', redirectedHome(page('https://www.infiniarc.com/shop/gpu/other'), P), false);
eq('بلا أصليّة ← لا حكم', redirectedHome('<html><head></head></html>', P), false);
eq('نطاقٌ آخر ← لا حكم', redirectedHome(page('https://cdn.example.com/'), P), false);
eq('og:url للرئيسيّة ← أُزيل', redirectedHome(`<meta property="og:url" content="https://www.infiniarc.com/"/>`, P), true);
eq('الرابط المطلوب نفسه هو الرئيسيّة ← لا حكم', redirectedHome(page('https://www.infiniarc.com/'), 'https://www.infiniarc.com/'), false);

const o1: any = { errors: [] };
httpFailure(o1, 'أمازون (X)', 404);
eq('404 ← gone', o1.gone, true);
const o2: any = { errors: [] };
httpFailure(o2, 'أمازون (X)', 503);
eq('503 ← ليس gone (عطلٌ عابر)', o2.gone, undefined);

/* ============ الإشارتان ============ */
const store: any = { id: 's', slug: 'amazon', name: 'أمازون', scrapeMode: 'native' };
const offer = (lastError: string | null, inStock = true): OfferRow => ({ id: 'o1', url: 'https://x/p', price: 425, listPrice: null, inStock, lastError, store });
const other: OfferRow = { id: 'o2', url: 'https://y/p', price: 480, listPrice: null, inStock: true, lastError: null, store: { ...store, slug: 'microless' } };
const goneResult: OfferResult = { offerId: 'o1', storeSlug: 'amazon', storeName: 'أمازون', url: 'https://x/p', outcome: { price: null, listPrice: undefined, inStock: true, errors: [`أمازون (X): ${GONE_MARK} — الصفحة غير موجودة (404)`], gone: true } };
const okOther: OfferResult = { offerId: 'o2', storeSlug: 'microless', storeName: 'مايكروليس', url: 'https://y/p', outcome: { price: 480, listPrice: null, inStock: true, errors: [] } };

const first = resolveOfferPrices({ price: 425, offers: [offer(null), other] }, [goneResult, okOther]);
eq('الإشارة الأولى: يبقى متوفّراً', first.offerUpdates[0].data.inStock, true);
eq('الإشارة الأولى: يُسجَّل الخطأ بالعلامة', String(first.offerUpdates[0].data.lastError).includes(GONE_MARK), true);
eq('الإشارة الأولى: السعر المعروض لا يتغيّر', first.lowestPrice, 425);

const second = resolveOfferPrices({ price: 425, offers: [offer(first.offerUpdates[0].data.lastError), other] }, [goneResult, okOther]);
eq('الإشارة الثانية: يسقط', second.offerUpdates[0].data.inStock, false);
eq('الإشارة الثانية: السعر ينتقل للمتجر التالي', second.lowestPrice, 480);

const afterTimeout = resolveOfferPrices({ price: 425, offers: [offer('أمازون (X): تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.'), other] }, [goneResult, okOther]);
eq('مهلةٌ ثمّ 404: إشارةٌ أولى لا ثانية', afterTimeout.offerUpdates[0].data.inStock, true);

(async () => {
  if (process.argv.includes('--live')) {
    const token = process.env.SCRAPER_API_KEY!;
    const { prisma } = await import('../lib/prisma');
    const { scrapeComponentOffers } = await import('../lib/scrape-offers');

    /* عيّنة حيّة: ثلاثة عروضٍ متوفّرة بلا خطأ من كلّ متجرٍ يُسحب */
    const stores = await prisma.store.findMany({ where: { active: true, scrapeMode: { not: 'off' } } });
    console.log('\n— صفحاتٌ حيّة: يجب ألّا يُعلَّم أيٌّ منها —');
    for (const s of stores) {
      const rows = await prisma.componentOffer.findMany({
        where: { storeId: s.id, inStock: true, lastError: null, url: { contains: 'http' } },
        take: 3,
        include: { store: true, component: { select: { name: true } } },
      });
      for (const r of rows) {
        const { results } = await scrapeComponentOffers({ name: r.component.name, offers: [r as any] }, token);
        const o = results[0].outcome;
        eq(`${s.slug} · ${r.component.name.slice(0, 34)} (سعر ${o.price ?? '—'})`, !!o.gone, false);
      }
    }

    console.log('\n— ما ثبت يدويّاً أنّه أُزيل: يجب أن يُعلَّم —');
    const known = await prisma.componentOffer.findMany({
      where: {
        OR: [
          { store: { slug: 'amazon' }, component: { name: 'Ryzen 5 5500' } },
          { store: { slug: 'infiniarc' }, component: { name: { in: ['GeForce RTX 5080 PRIME OC 16G', 'ROG Astral RTX 5090 OC 32GB', 'GeForce RTX 5070 EAGLE OC ICE 12G'] } } },
        ],
      },
      include: { store: true, component: { select: { name: true } } },
    });
    for (const r of known) {
      const { results } = await scrapeComponentOffers({ name: r.component.name, offers: [r as any] }, token);
      eq(`${r.store.slug} · ${r.component.name}`, !!results[0].outcome.gone, true);
    }
    await prisma.$disconnect();
  }
  console.log(failed ? `\n✗ ${failed} فشل` : '\n✓ كلّها');
  process.exit(failed ? 1 : 0);
})();
