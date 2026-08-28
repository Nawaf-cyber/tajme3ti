/* ============ إيجاد قطعٍ مرشّحة للإضافة — من مايكرولس، بلا رصيد ============
 *
 * صفحة البحث وصفحة المنتج في مايكرولس تستجيبان لطلبٍ عاديّ من الخادم، فلا
 * حاجة إلى Scrape.do هنا. (كازاسوق يردّ 403 دائماً، ونون محجوب بـAkamai.)
 *
 * ⚠️ والسعر **لا يُقرأ من صفحة البحث**: هي لا تحمله (جُرّب — يعود فارغاً في
 * كل النتائج). فيُفتح كل منتجٍ على حدة. وقد قيس القارئ مقابل ٨ عروضٍ مخزّنة
 * عندنا فطابق ٦ بالضبط، والاثنان الباقيان صفحتاهما نافدتان بلا سعرٍ معلن.
 *
 * ⚠️ وتُستبعد الحواسيب الجاهزة: بحثُ «DDR5 32GB» يُعيد ثمانية أجهزةٍ كاملة
 * لأن مواصفاتها تذكر الرام. `IS_SYSTEM` في `source-match` يمسكها.
 *
 *   npx tsx scripts/find-candidates.ts "استعلام" ["استعلام آخر" …]
 */

import 'dotenv/config';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { searchStore } from '../lib/store-search';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
const G = '\x1b[32m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

/* حاسوبٌ جاهز لا قطعة — تُذكر مواصفاته فيلتقطه البحث.
   ⚠️ و«خادم» أُضيف بعد أن ظهر EPYC بـ١٬٠١٦٬٥٩٢ ﷼ مرشّحاً لقرص NVMe. */
const IS_SYSTEM = /gaming pc|desktop pc|\bpc\b.*(ryzen|core ultra|rtx)|prebuilt|barebone|workstation|\bserver\b|rack ?mount|\bepyc\b|laptop|notebook/i;

export type Found = {
  title: string; url: string; price: number | null; inStock: boolean; image: string | null;
};

export async function readProduct(url: string): Promise<Found | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const $ = cheerio.load(await res.text());
    const ld = $('script[type="application/ld+json"]').map((_, e) => $(e).text()).get().join('\n');
    const meta = $('meta[property="product:price:amount"]').attr('content');
    let price = meta ? Number(meta) : null;
    if (!price) { const m = ld.match(/"price"\s*:\s*"?([\d.]+)/); price = m ? Number(m[1]) : null; }
    const av = $('meta[property="product:availability"]').attr('content') || '';
    const inStock = av ? !/out ?of ?stock|oos/i.test(av) : (/InStock/i.test(ld) && !/OutOfStock/i.test(ld));
    return {
      title: $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim(),
      url,
      price: price && price > 0 ? Math.round(price * 100) / 100 : null,
      inStock,
      image: $('meta[property="og:image"]').attr('content') || null,
    };
  } catch { return null; }
}

async function main() {
  const queries = process.argv.slice(2);
  if (!queries.length) { console.error('استعلامٌ واحد على الأقل'); process.exit(1); }

  /* ما عندنا أصلاً — كي لا يُقترح المكرَّر */
  const have = await prisma.componentOffer.findMany({ select: { url: true } });
  const haveUrls = new Set(have.map((o) => (o.url || '').replace(/\/$/, '')));
  const haveNames = new Set((await prisma.component.findMany({ select: { name: true } }))
    .map((c) => c.name.toLowerCase().replace(/[^a-z0-9]/g, '')));

  for (const q of queries) {
    const cands = (await searchStore('microless', q, '')).filter((c) => !IS_SYSTEM.test(c.title));
    console.log(`\n${Y}=== ${q}${X} ${D}(${cands.length} بعد استبعاد الأجهزة الجاهزة)${X}`);
    for (const c of cands.slice(0, 10)) {
      if (haveUrls.has(c.url.replace(/\/$/, ''))) { console.log(`  ${D}— عندنا: ${c.title.slice(0, 62)}${X}`); continue; }
      const d = await readProduct(c.url);
      if (!d || !d.price) { console.log(`  ${D}✘ بلا سعر: ${c.title.slice(0, 62)}${X}`); continue; }
      const dup = haveNames.has(d.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40));
      console.log(`  ${d.inStock ? G + '✔' + X : D + '✘نافد' + X} ${String(d.price).padStart(9)} ﷼ ${dup ? '(مكرّر؟) ' : ''}${d.title.slice(0, 72)}`);
      console.log(`      ${D}${d.url}${X}`);
    }
  }
  await prisma.$disconnect();
}

if (require.main === module) main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
