/**
 * ============ البحث عن قطعة في متاجر الموقع ============
 *
 * إضافةُ قطعةٍ تحتاج رابطاً في كل متجر — والمقارنة هي جوهر الموقع، فقطعةٌ
 * بعرضٍ واحد نصفُ قطعة. لكن أمازون ونون يردّان 503 على الجلب المباشر،
 * وتصفّحهما يدوياً بطيء ويسقط عند حواجز الروبوت.
 *
 * والموقع يملك المفتاح أصلاً: Scrape.do هو ما يقرأ به أسعار أمازون كل يوم.
 * فهذه الأداة تستعمله لجلب **صفحة البحث** بدل صفحة المنتج.
 *
 * ⚠️ التكلفة ليست متساوية: أمازون وميكروليس يمرّان بـsuper=true فيكلّف
 * الطلب **١٠ وحدات**، ونون وكازاسوق وحدةً واحدة. فالبحث في المتاجر
 * الأربعة لقطعة واحدة = ٢٢ وحدة لا ٤. لذا تُمرَّر المتاجر صراحةً.
 *
 *   npx tsx scripts/find-in-stores.ts "MSI MAG A600DN" amazon noon
 */
import 'dotenv/config';
import * as cheerio from 'cheerio';
import { scrapeFetch, setScrapeDeadline } from '../lib/scrape-prices';

type StoreDef = {
  premium: boolean;
  search: (q: string) => string;
  parse: ($: cheerio.CheerioAPI) => { title: string; url: string; price: string }[];
};

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

const STORES: Record<string, StoreDef> = {
  amazon: {
    premium: true,
    search: (q) => `https://www.amazon.sa/s?k=${encodeURIComponent(q)}`,
    parse: ($) => {
      const out: { title: string; url: string; price: string }[] = [];
      $('div[data-asin]').each((_, el) => {
        const asin = $(el).attr('data-asin');
        if (!asin) return;
        /* أمازون تغيّر بنية بطاقة النتيجة كثيراً، وh2 وحدها أعادت «MSI»
           فقط (سطر العلامة لا العنوان). فنجرّب عدّة مواضع ونأخذ أطولها —
           و alt الصورة هو الأثبت عبر تغييراتهم. */
        const title = [
          $(el).find('img.s-image').attr('alt') || '',
          $(el).find('h2 span').first().text(),
          $(el).find('[data-cy="title-recipe"]').text(),
          $(el).find('h2').first().text(),
        ].map(clean).sort((a, b) => b.length - a.length)[0];
        if (!title) return;
        const price = clean($(el).find('.a-price .a-offscreen').first().text());
        out.push({ title, url: `https://www.amazon.sa/dp/${asin}`, price });
      });
      return out;
    },
  },
  noon: {
    premium: false,
    search: (q) => `https://www.noon.com/saudi-en/search/?q=${encodeURIComponent(q)}`,
    parse: ($) => {
      const out: { title: string; url: string; price: string }[] = [];
      $('a[href*="/p/"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const title = clean($(el).attr('title') || $(el).text());
        if (!title) return;
        out.push({
          title: title.slice(0, 120),
          url: href.startsWith('http') ? href.split('?')[0] : `https://www.noon.com${href.split('?')[0]}`,
          price: '',
        });
      });
      return out;
    },
  },
  microless: {
    premium: true,
    /* ⚠️ المعامل `query` لا `q`. بـ`?q=` تردّ الصفحة «لم نجد أي منتجات»
       لأي كلمة — حتى «corsair» — فيبدو المتجر خالياً وهو مليء. كُشف بقراءة
       action النموذج في صفحتهم: <form action="/search/"><input name="query">. */
    search: (q) => `https://saudi.microless.com/search/?query=${encodeURIComponent(q)}`,
    parse: ($) => {
      const out: { title: string; url: string; price: string }[] = [];
      $('a[href*="/product/"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        // روابط المراجعات تشير للمنتج نفسه بعنوانٍ مثل «(1)»
        if (href.includes('#')) return;
        const title = clean($(el).find('img').attr('alt') || $(el).text());
        if (!title) return;
        out.push({
          title: title.slice(0, 120),
          url: href.startsWith('http') ? href.split('?')[0] : `https://saudi.microless.com${href.split('?')[0]}`,
          price: '',
        });
      });
      return out;
    },
  },
  cazasouq: {
    premium: false,
    search: (q) => `https://www.cazasouq.com/index.php?route=product/search&search=${encodeURIComponent(q)}&limit=100`,
    parse: ($) => {
      const out: { title: string; url: string; price: string }[] = [];
      $('a.product-img').each((_, el) => {
        const href = ($(el).attr('href') || '').split('?')[0];
        const title = clean($(el).find('img').attr('alt') || '');
        if (!title) return;
        const price = clean($(el).closest('.product-layout').find('.price').first().text());
        out.push({ title, url: href, price });
      });
      return out;
    },
  },
};

const scrapeUrl = (token: string, target: string, premium: boolean) =>
  `https://api.scrape.do/?token=${token}&url=${encodeURIComponent(target)}${premium ? '&super=true' : ''}`;

async function main() {
  const [query, ...slugs] = process.argv.slice(2);
  if (!query) {
    console.error('استعمال: npx tsx scripts/find-in-stores.ts "<اسم القطعة>" [amazon] [noon] [microless] [cazasouq]');
    process.exit(1);
  }
  const targets = slugs.length ? slugs : ['cazasouq'];
  const token = process.env.SCRAPER_API_KEY;
  if (!token) { console.error('⛔ SCRAPER_API_KEY غير مضبوط'); process.exit(1); }

  setScrapeDeadline(0); // بلا مهلة دورة — هذه أداة يدوية لا كرون
  const cost = targets.reduce((n, s) => n + (STORES[s]?.premium ? 10 : 1), 0);
  console.log(`البحث عن «${query}» في: ${targets.join('، ')}  (≈${cost} وحدة سحب)\n`);

  /* الترشيح: كل كلمة من الاستعلام يجب أن تظهر في العنوان. البحث في
     المتاجر فضفاض — أمازون يردّ أجهزة كاملة على اسم معالج — ومطابقةُ كل
     الكلمات تُسقط ذلك بلا أن تُسقط اختلاف الترتيب أو الزوائد التسويقية. */
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);

  for (const slug of targets) {
    const store = STORES[slug];
    if (!store) { console.log(`✖ متجر غير معروف: ${slug}`); continue; }
    try {
      const res = await scrapeFetch(scrapeUrl(token, store.search(query), store.premium), 30000);
      if (!res.ok) { console.log(`✖ ${slug}: HTTP ${res.status}`); continue; }
      const $ = cheerio.load(await res.text());
      const all = store.parse($);
      const seen = new Set<string>();
      const hits = all.filter((h) => {
        if (seen.has(h.url)) return false;
        seen.add(h.url);
        const t = h.title.toLowerCase();
        return words.every((w) => t.includes(w));
      });
      console.log(`=== ${slug}: ${hits.length} مطابقة من ${all.length} نتيجة`);
      hits.slice(0, 6).forEach((h) => console.log(`   ${h.price ? h.price.padEnd(12) : ''}${h.title.slice(0, 70)}\n     ${h.url}`));
      if (hits.length === 0 && all.length > 0) {
        console.log(`   (أقرب العناوين: ${all.slice(0, 3).map((h) => h.title.slice(0, 45)).join(' | ')})`);
      }
    } catch (e: any) {
      console.log(`✖ ${slug}: ${e.message}`);
    }
  }
}

main();
