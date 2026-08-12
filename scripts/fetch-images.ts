/**
 * ============ جلب صورة المنتج من عروضه ============
 *
 * القطعة المضافة بلا imageUrl تسقط إلى صورة الفئة البديلة — فتبدو صفحتها
 * وبطاقتها ناقصتين، وتتشابه كل قطع الفئة في التصفّح.
 *
 * ترتيب المصادر مقصود:
 *   ١) **أمازون** أوّلاً — صورها على خلفية بيضاء نظيفة وبدقّة عالية،
 *      وهو ما يناسب إطار الصورة الأبيض في صفحة القطعة.
 *   ٢) **كازاسوق** بديلاً حين لا يوجد عرض أمازون.
 *   ✗ **مايكرولس مستبعد** بطلب صاحب الموقع.
 *
 * والنطاقان المستعملان (m.media-amazon.com وstatic.cazasouq.com) داخل
 * قائمة /api/img-proxy البيضاء أصلاً، فالصورة تُقدَّم من نطاقنا لا مربوطةً
 * من نطاق المتجر — انظر التعليق في lib/image.ts.
 *
 *   npx tsx scripts/fetch-images.ts <id> [<id> …]
 *   npx tsx scripts/fetch-images.ts --missing      # بلا صورة
 *   npx tsx scripts/fetch-images.ts --microless    # صورتها من مايكرولس
 *   npx tsx scripts/fetch-images.ts --not-amazon   # لها عرض أمازون وصورتها من غيره
 *   … مع --dry لعرض المرشّحات بلا جلب (لا يكلّف رصيداً)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as cheerio from 'cheerio';
import 'dotenv/config';
import { scrapeFetch, setScrapeDeadline } from '../lib/scrape-prices';

/** الترتيب هو التفضيل؛ وما ليس في القائمة لا يُستعمل مصدراً للصور */
const SOURCE_ORDER = ['amazon', 'cazasouq'];
const PREMIUM = new Set(['amazon']);

const ALLOWED_HOSTS = new Set([
  'm.media-amazon.com',
  'images-na.ssl-images-amazon.com',
  'images-eu.ssl-images-amazon.com',
  'cazasouq.com',
  'www.cazasouq.com',
  'static.cazasouq.com',
]);

const scrapeUrl = (token: string, target: string, premium: boolean) =>
  `https://api.scrape.do/?token=${token}&url=${encodeURIComponent(target)}${premium ? '&super=true' : ''}`;

function extractAmazon($: cheerio.CheerioAPI): string | null {
  /* data-a-dynamic-image خريطة {رابط: [عرض، ارتفاع]} — نأخذ الأكبر.
     وdata-old-hires النسخة كاملة الدقّة حين توجد. og:image آخر الملاذات
     لأنها أحياناً صورةٌ مصغّرة أو شعار الصفحة. */
  const hires = $('#landingImage').attr('data-old-hires');
  if (hires) return hires;

  const dyn = $('#landingImage').attr('data-a-dynamic-image');
  if (dyn) {
    try {
      const map = JSON.parse(dyn) as Record<string, [number, number]>;
      const best = Object.entries(map).sort((a, b) => b[1][0] - a[1][0])[0];
      if (best) return best[0];
    } catch { /* JSON مشوّه — ننتقل للبديل */ }
  }
  return $('#landingImage').attr('src') || $('meta[property="og:image"]').attr('content') || null;
}

function extractCazasouq($: cheerio.CheerioAPI): string | null {
  /* الصورة الرئيسية تُحمَّل كسولاً، فالرابط الحقيقي في data-src لا src
     (وsrc نفسها تكون صورة base64 شفّافة نائبة). */
  const main = $('.product-image img, .main-image img, a.product-img img').first();
  const lazy = main.attr('data-src') || main.attr('data-zoom-image') || main.attr('src');
  if (lazy && !lazy.startsWith('data:')) return lazy;
  return $('meta[property="og:image"]').attr('content') || null;
}

const EXTRACT: Record<string, ($: cheerio.CheerioAPI) => string | null> = {
  amazon: extractAmazon,
  cazasouq: extractCazasouq,
};

async function main() {
  const args = process.argv.slice(2);
  const token = process.env.SCRAPER_API_KEY;
  if (!token) { console.error('⛔ SCRAPER_API_KEY غير مضبوط'); process.exit(1); }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  setScrapeDeadline(0);

  const dry = args.includes('--dry');
  const select = {
    id: true, brand: true, name: true, imageUrl: true,
    offers: { select: { url: true, store: { select: { slug: true } } } },
  };

  let comps: any[];
  if (args.includes('--missing')) {
    comps = await prisma.component.findMany({ where: { OR: [{ imageUrl: null }, { imageUrl: '' }] }, select });
  } else if (args.includes('--microless')) {
    comps = (await prisma.component.findMany({ select })).filter((c) => /microless/i.test(c.imageUrl || ''));
  } else if (args.includes('--not-amazon')) {
    /* لها عرض أمازون وصورتها من مصدرٍ أدنى في التفضيل — تُرقّى. */
    comps = (await prisma.component.findMany({ select })).filter(
      (c) => c.offers.some((o: any) => o.store.slug === 'amazon' && o.url)
        && !/m\.media-amazon\.com/i.test(c.imageUrl || ''),
    );
  } else {
    comps = await prisma.component.findMany({ where: { id: { in: args.filter((a) => !a.startsWith('-')) } }, select });
  }

  if (comps.length === 0) { console.log('لا قطع مطابقة.'); await prisma.$disconnect(); return; }

  if (dry) {
    console.log(`${comps.length} مرشّحة (عرضٌ فقط، بلا تكلفة):\n`);
    comps.forEach((c) => {
      const src = c.offers.filter((o: any) => SOURCE_ORDER.includes(o.store.slug) && o.url).map((o: any) => o.store.slug);
      let host = '—';
      try { host = c.imageUrl ? new URL(c.imageUrl).hostname : '— بلا صورة'; } catch { host = '(رابط غير صالح)'; }
      console.log(`  ${(c.brand + ' ' + c.name).padEnd(34)} الآن: ${host.padEnd(24)} متاح: ${src.join('، ') || 'لا مصدر مسموح'}`);
    });
    await prisma.$disconnect();
    return;
  }

  for (const c of comps) {
    console.log(`\n=== ${c.brand} ${c.name}`);
    let done = false;

    for (const slug of SOURCE_ORDER) {
      const offer = c.offers.find((o) => o.store.slug === slug && o.url);
      if (!offer?.url) continue;

      try {
        const res = await scrapeFetch(scrapeUrl(token, offer.url, PREMIUM.has(slug)), 30000);
        if (!res.ok) { console.log(`   ${slug}: HTTP ${res.status}`); continue; }
        const raw = EXTRACT[slug](cheerio.load(await res.text()));
        if (!raw) { console.log(`   ${slug}: لم تُستخرج صورة`); continue; }

        const abs = raw.startsWith('//') ? `https:${raw}` : raw;
        /* الحارس: رابطٌ خارج قائمة البروكسي البيضاء سيُقدَّم للزائر مربوطاً
           من نطاق المتجر مباشرةً — وهو ما بُني البروكسي لمنعه. */
        const host = new URL(abs).hostname;
        if (!ALLOWED_HOSTS.has(host)) { console.log(`   ${slug}: نطاق خارج القائمة البيضاء (${host})`); continue; }

        await prisma.component.update({ where: { id: c.id }, data: { imageUrl: abs } });
        console.log(`   ✔ من ${slug}: ${abs.slice(0, 95)}`);
        done = true;
        break;
      } catch (e: any) {
        console.log(`   ${slug}: ${e.message}`);
      }
    }

    if (!done) console.log('   ✖ بلا صورة — تبقى على البديل');
  }

  await prisma.$disconnect();
}

main();
