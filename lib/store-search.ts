/* ============ البحث في المتاجر ============
 *
 * طبقةٌ واحدة تجلب المرشّحين، ويقرّر كلُّ متجرٍ طريقَه بحسب ما يسمح به:
 *
 *   مايكرولس  يستجيب لطلبٍ عاديّ من الخادم — 200 في نصف ثانية، **بلا رصيد**
 *   كازاسوق   يردّ 403 على كل طلبٍ من خادم (جُرّب بلا ترويسات، وبمتصفّحٍ
 *             مزيّف، ومع Accept — الثلاثة 403). فيمرّ عبر Scrape.do،
 *             **ويكلّف طلباً لكل بحث** — ولذلك لا يُشغَّل إلا بطلبٍ صريح.
 *   نون       محجوب بـ Akamai حتى أمام متصفّحٍ حقيقيّ. لا يُبحث فيه.
 *
 * ⚠️ ولا يُستعمل متصفّح الزائر: صفحةُ الإدارة تعمل في متصفّحه، وطلبُها إلى
 * `cazasouq.com` يُحجب بـ CORS — المتجر لا يأذن لنطاقنا بقراءة ردّه. فما
 * ينجح في متصفّحٍ نتحكّم به مباشرةً لا ينجح من صفحةٍ في نطاقنا.
 *
 * ============ لماذا سجلّ لا شروط ============
 *
 * كان اختيارُ المتجر مكتوباً باليد في **سبعة مواضع**: نوعٌ اتّحاديّ هنا،
 * وثلاثيّةٌ في `searchStore`، وحالةٌ في صفحة الإدارة، وقائمةُ أزرارٍ فيها،
 * وشرطُ الرمز في المسار، وفاصلُ الطلبات، وحساب الرصيد. فإضافة متجرٍ ثامنٍ
 * تعني سبعة تعديلات، ونسيانُ أحدها لا يُنتج خطأ بناءٍ بل سلوكاً صامتاً
 * خاطئاً — كأن يُحسب متجرٌ مدفوعٌ مجّانيّاً فيُستهلك الرصيد بلا علم.
 *
 * فصار المتجر **صفّاً في `ADAPTERS`**: معرّفه واسمه وكلفته وفاصله وكيف
 * يُبنى رابط بحثه وكيف تُقرأ نتيجته. وما عداه يقرأ منه.
 */

import type { Candidate } from './source-match';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

/** معرّف المتجر — يجب أن يطابق `Store.slug` في القاعدة */
export type SearchSource = string;

export type StoreAdapter = {
  slug: SearchSource;
  /** الاسم العربي المعروض للأدمن */
  label: string;
  /** يمرّ عبر Scrape.do — أي يكلّف طلباً لكل بحث */
  needsProxy: boolean;
  /** فاصلٌ بين طلبين بالملّي: لا نُغرق متجراً يستضيفنا ولا نستدعي 429 */
  delayMs: number;
  /** ملاحظةٌ تُعرض في صفحة الإدارة */
  note: string;
  /** رابط صفحة البحث في المتجر */
  searchUrl: (query: string) => string;
  /** يستخرج المرشّحين من صفحة النتائج */
  parse: (html: string) => Candidate[];
};

const fetchText = async (url: string, timeoutMs = 25000): Promise<string> => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA } }).then((r) => r.text());
  } finally {
    clearTimeout(timer);
  }
};

/**
 * مايكرولس — بلا وسيط.
 *
 * ⚠️ ثلاثة مزالق تعلّمناها بالتجربة:
 *   • المعامل `query` لا `q` — والخطأ يُعيد صفحةً بلا نتائج، لا خطأً.
 *   • النتائج داخل `#search-results-products` وحده؛ وما قبله كاروسيل
 *     «موصى به»، فقراءته تُعطي لابتوباً مرشّحاً لطقم رام.
 *   • العنوان من `alt` الصورة لا من نصّ الرابط — هو وحده يحمل رمز الطراز.
 */
function parseMicroless(html: string): Candidate[] {
  {
    const start = html.indexOf('id="search-results-products"');
    if (start < 0) return [];
    const body = html.slice(start);

    const out: Candidate[] = [];
    const seen = new Set<string>();
    const re =
      /data-listid="search"[\s\S]{0,1200}?href="(https:\/\/saudi\.microless\.com\/product\/[^"]+)"[\s\S]{0,600}?alt="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(body))) {
      if (seen.has(m[1])) continue;
      seen.add(m[1]);
      out.push({ url: m[1], title: m[2].replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim() });
      if (out.length >= 12) break;
    }
    return out;
  }
}

/**
 * كازاسوق — عبر Scrape.do، فيكلّف طلباً لكل بحث.
 *
 * ⚠️ ويُقصّ من `?search=` في الروابط: كازاسوق يُلحق سؤالَك بكل رابطٍ في
 * صفحة النتائج، فيصير الرابط حاملاً اسم قطعتنا حرفياً — ويُخفي أن المسار
 * نفسه لمنتجٍ آخر. (وقع ذلك فعلاً على «Ryzen 5 9600x» فأخفى رابطاً ميتاً.)
 */
function parseCazasouq(html: string): Candidate[] {
  {
    const out: Candidate[] = [];
    const seen = new Set<string>();
    /* بطاقة المنتج: عنوانٌ داخل h4 ورابطٌ في a، والسعر في .price */
    const re = /<div class="product-thumb[\s\S]{0,2500}?<\/div>\s*<\/div>\s*<\/div>/g;
    for (const block of html.match(re) || []) {
      const href = (block.match(/href="(https:\/\/www\.cazasouq\.com\/[^"]+)"/) || [])[1];
      const title = (block.match(/<h4[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/) || [])[1];
      if (!href || !title) continue;
      const url = href.split('?')[0];
      if (seen.has(url)) continue;
      seen.add(url);

      const priceRaw = (block.match(/class="price[^"]*"[^>]*>([\s\S]{0,120}?)</) || [])[1] || '';
      const num = priceRaw.replace(/[^\d.]/g, '');
      /* كازاسوق يعرض بالدينار البحريني — التحويل يتكفّل به الساحب، فلا
         يُخزَّن رقمٌ هنا إلا للعرض على الأدمن. */
      out.push({
        url,
        title: title.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(),
        price: num ? Number(num) : null,
      });
      if (out.length >= 12) break;
    }
    return out;
  }
}

/**
 * إنفيني آرك — متجرٌ سعوديّ بالريال، ويستجيب لطلبٍ من خادم في نصف ثانية.
 *
 * ⚠️ والنتائج تُقرأ من `ItemList` في JSON-LD لا من وسوم البطاقات: شبكة
 * المنتجات في Odoo تتغيّر أصنافها مع كل تحديث قالب، والقائمة المنظَّمة تحمل
 * الاسم والرابط والصورة بعقدٍ ثابت. (وجُرّب مطابقة الروابط بالتعبير النمطيّ
 * أوّلاً فأعادت صفراً بينما الصفحة تحمل ثمانية منتجات.)
 *
 * ⚠️ ولا سعر في القائمة — وهذا مقصود: `Candidate.price` اختياريّ، والسعر
 * يُقرأ من صفحة المنتج حيث JSON-LD يحمله بعملته صراحةً.
 */
function parseInfiniarc(html: string): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set<string>();
  for (const block of [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])) {
    if (!block.includes('ItemList')) continue;
    let items: any[] = [];
    try {
      const j = JSON.parse(block);
      const list = j['@type'] === 'ItemList' ? j : (j['@graph'] || []).find((x: any) => x['@type'] === 'ItemList');
      items = list?.itemListElement ?? [];
    } catch { continue; }
    for (const it of items) {
      const url = String(it?.url || '').split('?')[0];
      const title = String(it?.name || '').replace(/\s+/g, ' ').trim();
      if (!url.startsWith('https://www.infiniarc.com/') || !title) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      out.push({ url, title });
      if (out.length >= 12) break;
    }
  }
  return out;
}

/* ============ السجلّ ============
 * إضافة متجرٍ = صفٌّ هنا. ولا شيء آخر يُعدَّل.
 * و`slug` يجب أن يطابق `Store.slug` وإلا لم يُربَط العرض بمتجره. */
export const ADAPTERS: StoreAdapter[] = [
  {
    slug: 'microless',
    label: 'مايكرولس',
    needsProxy: false,
    delayMs: 600,
    note: 'مجّاني — يستجيب لطلبٍ من خادم',
    searchUrl: (q) => 'https://saudi.microless.com/search/?query=' + encodeURIComponent(q),
    parse: parseMicroless,
  },
  {
    slug: 'cazasouq',
    label: 'كازاسوق',
    needsProxy: true,
    delayMs: 1200,
    note: 'يستهلك رصيداً — يردّ 403 لكل طلبٍ من خادم',
    searchUrl: (q) => 'https://www.cazasouq.com/index.php?route=product/search&search=' + encodeURIComponent(q),
    parse: parseCazasouq,
  },
  {
    slug: 'infiniarc',
    label: 'إنفيني آرك',
    needsProxy: false,
    delayMs: 700,
    note: 'مجّاني · سعوديّ بالريال',
    searchUrl: (q) => 'https://www.infiniarc.com/ar/shop?search=' + encodeURIComponent(q),
    parse: parseInfiniarc,
  },
];

export const adapterFor = (slug: string): StoreAdapter | null =>
  ADAPTERS.find((a) => a.slug === slug) ?? null;

/** ما تحتاجه صفحة الإدارة — بلا المحلّلات، فلا تُشحن إلى المتصفّح */
export const sourceMeta = () =>
  ADAPTERS.map(({ slug, label, needsProxy, note }) => ({ slug, label, needsProxy, note }));

/**
 * بحثٌ في متجرٍ واحد.
 *
 * ⚠️ ومتجرٌ غير معروفٍ يُعيد خطأً لا مصفوفةً فارغة: الفارغة تُقرأ «بحثتُ فلم
 * أجد»، وهي كذبةٌ حين لا يكون البحث قد وقع أصلاً.
 */
export async function searchStore(
  source: SearchSource,
  query: string,
  token: string,
): Promise<Candidate[]> {
  const ad = adapterFor(source);
  if (!ad) throw new Error(`لا محرّك بحثٍ للمتجر «${source}»`);
  if (ad.needsProxy && !token) throw new Error(`${ad.label} يحتاج SCRAPER_API_KEY`);

  const target = ad.searchUrl(query);
  const url = ad.needsProxy
    ? `https://api.scrape.do/?token=${token}&url=${encodeURIComponent(target)}`
    : target;
  try {
    return ad.parse(await fetchText(url, ad.needsProxy ? 45000 : 25000));
  } catch {
    return [];
  }
}

/* ============ قراءة صفحة منتجٍ واحد ============
 *
 * صفحةُ نتائج البحث **لا تحمل السعر** في مايكرولس ولا في إنفيني آرك (جُرّب:
 * يعود فارغاً في كل النتائج، وقائمة `ItemList` تحمل الاسم والرابط لا الثمن).
 * فمن أراد سعراً فتح صفحة المنتج.
 *
 * ⚠️ والترتيب مقصود: JSON-LD أوّلاً لأنه محصورٌ بالمنتج وموقَّعٌ بعملته، ثم
 * وسوم meta. وقد قيس هذا القارئ مقابل ٨ عروضٍ مخزَّنة عندنا فطابق ٦ بالضبط،
 * والاثنان الباقيان صفحتاهما نافدتان بلا سعرٍ معلن — أي أنّ الصفر صفرٌ صادق.
 */

export type ProductRead = {
  title: string;
  url: string;
  price: number | null;
  currency: string | null;
  inStock: boolean;
  image: string | null;
};

export async function readProductPage(url: string): Promise<ProductRead | null> {
  try {
    const html = await fetchText(url, 20000);
    if (!html || html.length < 200) return null;

    const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    let price: number | null = null;
    let currency: string | null = null;
    let inStock: boolean | null = null;

    for (const b of blocks) {
      let j: any;
      try { j = JSON.parse(b); } catch { continue; }
      const nodes = j['@graph'] ?? (Array.isArray(j) ? j : [j]);
      const prod = nodes.find((x: any) => String(x?.['@type']).includes('Product'));
      const offer = Array.isArray(prod?.offers) ? prod.offers[0] : prod?.offers;
      if (!offer) continue;
      const n = Number(offer.price);
      if (Number.isFinite(n) && n > 0) price = Math.round(n * 100) / 100;
      currency = offer.priceCurrency ?? currency;
      if (offer.availability) inStock = !/OutOfStock|SoldOut|Discontinued/i.test(String(offer.availability));
      if (price) break;
    }

    const meta = (prop: string) =>
      (html.match(new RegExp(`<meta[^>]+(?:property|name)="${prop}"[^>]+content="([^"]*)"`, 'i')) || [])[1] ?? null;

    if (price == null) {
      const m = meta('product:price:amount');
      const n = m ? Number(m) : NaN;
      if (Number.isFinite(n) && n > 0) price = Math.round(n * 100) / 100;
    }
    currency ??= meta('product:price:currency');
    if (inStock == null) {
      const av = meta('product:availability');
      inStock = av ? !/out ?of ?stock|oos/i.test(av) : true;
    }

    return {
      title: (meta('og:title') || (html.match(/<title[^>]*>([^<]*)/i) || [])[1] || '').replace(/\s+/g, ' ').trim(),
      url,
      price,
      currency,
      inStock,
      image: meta('og:image'),
    };
  } catch {
    return null;
  }
}
