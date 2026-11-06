/**
 * ============ البحث عن قطعة في متاجر الموقع ============
 *
 * إضافةُ قطعةٍ تحتاج رابطاً في كل متجر — والمقارنة هي جوهر الموقع، فقطعةٌ
 * بعرضٍ واحد نصفُ قطعة. وتصفّح المتاجر يدوياً بطيء ويسقط عند حواجز الروبوت.
 *
 *   npx tsx scripts/find-in-stores.ts "LANCOOL 217" cazasouq microless redzone
 *
 * ⚠️ التكلفة ليست متساوية — ولذلك تُمرَّر المتاجر صراحةً:
 *   · **مجّانيّة** (بلا وسيط، من محوّلات lib/store-search — نفسها التي تبحث بها
 *     صفحة الإدارة، فإصلاحُ متجرٍ هناك إصلاحٌ هنا):
 *       cazasouq · microless · infiniarc · redzone
 *   · **١٠ وحدات** للبحث (Scrape.do المتقدّم super=true):
 *       amazon — يحجب الطلب المباشر صامتاً.
 *       noon   — خلف Akamai: الطلب المباشر يُعلَّق حتى المهلة، والوسيط العاديّ يفشل
 *                (`ROTATION_FAILED` بعد ٥٧ث، بلا كلفة)، والمتقدّم ينجح في ~١٣ث
 *                (قِيس 2026-11-05). وأسعار نون تُكتب بيدٍ أصلاً — فلا تبحث فيه إلّا لرابطٍ تحتاجه.
 *
 * ولماذا تغيّر (2026-11-05): كان كازاسوق يُبحث بصفحة OpenCart القديمة فيعيد «0 من 0»
 * لكلّ قطعة منذ صار موقعهم واجهة جافاسكربت، ونون بمهلة ٣٠ث والوسيط العاديّ فيُجهَض
 * دائماً، ومايكرولس يمرّ بالمتقدّم (١٠ وحدات) وهو يجيب الطلب المباشر مجّاناً.
 */
import 'dotenv/config';
import * as cheerio from 'cheerio';
import { scrapeFetch, setScrapeDeadline } from '../lib/scrape-prices';
import { ADAPTERS, adapterFor, searchStoreOrThrow } from '../lib/store-search';

type Hit = { title: string; url: string; price: string; stock?: string };

/** متجرٌ لا يُبحث فيه إلّا عبر Scrape.do المتقدّم — ولا محوّل له في lib عمداً (الكلفة) */
type ProxyStore = {
  search: (q: string) => string;
  parse: ($: cheerio.CheerioAPI) => Hit[];
  /** هل وصلنا صفحة البحث فعلاً؟ تحويلٌ إلى الرئيسيّة = حاجز، لا «لا نتائج» */
  landed?: (resolvedUrl: string) => boolean;
};

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

const PROXY_STORES: Record<string, ProxyStore> = {
  amazon: {
    search: (q) => `https://www.amazon.sa/s?k=${encodeURIComponent(q)}`,
    parse: ($) => {
      const out: Hit[] = [];
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
    search: (q) => `https://www.noon.com/saudi-en/search/?q=${encodeURIComponent(q)}`,
    landed: (u) => /\/search\b/.test(u),
    /* ⚠️ البطاقة من وسوم `data-qa` لا من الأصناف: أصنافهم مولَّدة (`_title_ekcbv_19`)
       وتتغيّر مع كلّ نشرة، و`data-qa` لاختباراتهم فتثبت. والنصّ الكامل للرابط
       لا يصلح عنواناً — يحمل التقييم والسعر و«#9 in PC Cases» معاً.
       والسعر بالريال (`<strong>` داخل صندوق السعر؛ رمز العملة صورة). */
    parse: ($) => {
      const out: Hit[] = [];
      $('a[href*="/p/"]').each((_, el) => {
        const name = $(el).find('[data-qa="plp-product-box-name"]').first();
        if (!name.length) return;
        const title = clean(name.attr('title') || name.text());
        const href = ($(el).attr('href') || '').split('?')[0];
        if (!title || !href) return;
        const amount = clean($(el).find('[data-qa="plp-product-box-price"] strong').first().text());
        out.push({
          title,
          url: href.startsWith('http') ? href : `https://www.noon.com${href}`,
          price: amount ? `${amount} SAR` : '',
        });
      });
      /* احتياطٌ إن تغيّرت البطاقة: قائمة JSON-LD تحمل الاسم والرابط بلا سعر */
      if (!out.length) {
        $('script[type="application/ld+json"]').each((_, el) => {
          try {
            const j = JSON.parse($(el).text());
            if (j['@type'] !== 'ItemList') return;
            for (const it of j.itemListElement || []) {
              if (it?.name && it?.url) out.push({ title: clean(String(it.name)), url: String(it.url).split('?')[0], price: '' });
            }
          } catch { /* كتلةٌ أخرى */ }
        });
      }
      return out;
    },
  },
};

const scrapeUrl = (token: string, target: string) =>
  `https://api.scrape.do/?token=${token}&url=${encodeURIComponent(target)}&super=true`;

const KNOWN = [...Object.keys(PROXY_STORES), ...ADAPTERS.map((a) => a.slug).filter((s) => !PROXY_STORES[s])];
const costOf = (slug: string) => (PROXY_STORES[slug] ? 10 : adapterFor(slug)?.needsProxy ? 1 : 0);

/** نتائج المتجر — أو رميٌ بالسبب. صفرٌ هنا يعني «بحثتُ فلم أجد» وحده */
async function searchOne(slug: string, query: string, token: string): Promise<{ all: Hit[]; credits: number }> {
  const proxy = PROXY_STORES[slug];
  if (proxy) {
    if (!token) throw new Error('يحتاج SCRAPER_API_KEY');
    const res = await scrapeFetch(scrapeUrl(token, proxy.search(query)), 90000);
    const credits = Number(res.headers.get('scrape.do-request-cost')) || 0;
    const body = await res.text();
    if (!res.ok) {
      let why = body.slice(0, 160);
      try { const j = JSON.parse(body); why = [j.ErrorType, ...(j.Message || [])].filter(Boolean).join(' — '); } catch { /* ليس JSON */ }
      throw new Error(`HTTP ${res.status}${why ? ` (${why})` : ''}`);
    }
    const resolved = res.headers.get('scrape.do-resolved-url') || '';
    if (proxy.landed && resolved && !proxy.landed(resolved)) {
      throw new Error(`حُوِّل إلى ${resolved} لا إلى صفحة البحث — حاجز روبوت؟ (كلّف ${credits})`);
    }
    return { all: proxy.parse(cheerio.load(body)), credits };
  }

  const ad = adapterFor(slug);
  if (!ad) throw new Error(`متجر غير معروف — المعروفة: ${KNOWN.join(' ')}`);
  const cands = await searchStoreOrThrow(slug, query, token);
  return {
    all: cands.map((c) => ({
      title: c.title,
      url: c.url,
      price: c.price != null ? `${c.price.toFixed(2)} SAR` : '',
      stock: c.inStock == null ? undefined : c.inStock ? 'متوفّر' : 'نافد',
    })),
    credits: ad.needsProxy ? 1 : 0,
  };
}

async function main() {
  const [query, ...slugs] = process.argv.slice(2);
  if (!query) {
    console.error(`استعمال: npx tsx scripts/find-in-stores.ts "<اسم القطعة>" [${KNOWN.join('] [')}]`);
    process.exit(1);
  }
  const targets = slugs.length ? slugs : ['cazasouq'];
  const token = process.env.SCRAPER_API_KEY || '';

  setScrapeDeadline(0); // بلا مهلة دورة — هذه أداة يدوية لا كرون
  const cost = targets.reduce((n, s) => n + costOf(s), 0);
  console.log(`البحث عن «${query}» في: ${targets.join('، ')}  (≈${cost} وحدة سحب)\n`);

  /* الترشيح: كل كلمة من الاستعلام يجب أن تظهر في العنوان. البحث في
     المتاجر فضفاض — أمازون يردّ أجهزة كاملة على اسم معالج، ونون يحشر
     إعلاناتٍ لا صلة لها — ومطابقةُ كل الكلمات تُسقط ذلك بلا أن تُسقط
     اختلاف الترتيب أو الزوائد التسويقية. */
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);

  let spent = 0;
  for (const slug of targets) {
    const t0 = Date.now();
    try {
      const { all, credits } = await searchOne(slug, query, token);
      spent += credits;
      const seen = new Set<string>();
      const hits = all.filter((h) => {
        if (seen.has(h.url)) return false;
        seen.add(h.url);
        const t = h.title.toLowerCase();
        return words.every((w) => t.includes(w));
      });
      const secs = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`=== ${slug}: ${hits.length} مطابقة من ${all.length} نتيجة  (${secs}ث${credits ? ` · ${credits} وحدة` : ''})`);
      hits.slice(0, 6).forEach((h) => {
        const tag = [h.price, h.stock].filter(Boolean).join(' · ');
        console.log(`   ${tag ? tag.padEnd(22) : ''}${h.title.slice(0, 70)}\n     ${h.url}`);
      });
      if (hits.length === 0 && all.length > 0) {
        console.log(`   (أقرب العناوين: ${all.slice(0, 3).map((h) => h.title.slice(0, 45)).join(' | ')})`);
      }
    } catch (e: any) {
      console.log(`✖ ${slug}: ${e?.message || e}`);
    }
  }
  if (spent) console.log(`\nالكلفة الفعليّة من Scrape.do: ${spent} وحدة`);
}

main();
