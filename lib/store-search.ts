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
 */

import type { Candidate } from './source-match';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

export type SearchSource = 'microless' | 'cazasouq';

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
export async function searchMicroless(query: string): Promise<Candidate[]> {
  try {
    const html = await fetchText('https://saudi.microless.com/search/?query=' + encodeURIComponent(query));
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
  } catch {
    return [];
  }
}

/**
 * كازاسوق — عبر Scrape.do، فيكلّف طلباً لكل بحث.
 *
 * ⚠️ ويُقصّ من `?search=` في الروابط: كازاسوق يُلحق سؤالَك بكل رابطٍ في
 * صفحة النتائج، فيصير الرابط حاملاً اسم قطعتنا حرفياً — ويُخفي أن المسار
 * نفسه لمنتجٍ آخر. (وقع ذلك فعلاً على «Ryzen 5 9600x» فأخفى رابطاً ميتاً.)
 */
export async function searchCazasouq(query: string, token: string): Promise<Candidate[]> {
  if (!token) return [];
  const target = 'https://www.cazasouq.com/index.php?route=product/search&search=' + encodeURIComponent(query);
  try {
    const html = await fetchText(
      `https://api.scrape.do/?token=${token}&url=${encodeURIComponent(target)}`,
      45000,
    );

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
  } catch {
    return [];
  }
}

export const searchStore = (source: SearchSource, query: string, token: string) =>
  source === 'microless' ? searchMicroless(query) : searchCazasouq(query, token);
