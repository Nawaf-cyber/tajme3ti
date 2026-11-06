/* ============ البحث في المتاجر ============
 *
 * طبقةٌ واحدة تجلب المرشّحين، ويقرّر كلُّ متجرٍ طريقَه بحسب ما يسمح به:
 *
 *   مايكرولس  يستجيب لطلبٍ عاديّ من الخادم — 200 في نصف ثانية، **بلا رصيد**
 *   كازاسوق   منذ موقعه الجديد (~2026-10-25) واجهةٌ برمجيّة عامّة بلا وسيط و**بلا رصيد**
 *             — انظر `searchCazasouq`. (كان قبلها يردّ 403 لكلّ طلبٍ من خادم.)
 *   أمازون    أوّل طلباتٍ تنجح ثم يردّ هيكلاً فارغاً بحالة 200 بلا إعلان.
 *             فيمرّ عبر Scrape.do.
 *   إنفيني آرك وريد زون  صفحة بحثٍ عاديّة من الخادم، **بلا رصيد**.
 *   نون       خلف Akamai: الطلب المباشر يُعلَّق حتى المهلة، والوسيط العاديّ يفشل
 *             (`ROTATION_FAILED` بعد ٥٧ث، بلا كلفة)، والمتقدّم (super) ينجح بـ**١٠
 *             وحدات** للبحث (قِيس 2026-11-05). فلا محوّل له هنا: صفحة الإدارة تبحث
 *             بالجملة، وعشرُ وحداتٍ للقطعة ثمنٌ لا يُدفع بلا قرار. والبحث اليدويّ
 *             المدفوع في scripts/find-in-stores.ts.
 *
 * ⚠️ ولا يُستعمل متصفّح الزائر: صفحةُ الإدارة تعمل في متصفّحه، وطلبُها إلى
 * المتاجر يُحجب بـ CORS — المتجر لا يأذن لنطاقنا بقراءة ردّه. فما ينجح في
 * متصفّحٍ نتحكّم به مباشرةً لا ينجح من صفحةٍ في نطاقنا.
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
import { bhdToSar } from './currency';
import { correctStock } from './stock-truth';

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
  /**
   * زمن الطلب الواحد مقيساً — **لا مقدَّراً**.
   *
   * ⚠️ ولِمَ يُسجَّل أصلاً: مسار الإدارة سقفُه `maxDuration = 60` ثانية،
   * وكان يقبل حتى أربعين قطعة لأيّ متجر. وكازاسوق يمرّ عبر الوسيط فيأخذ
   * ٥٫١ ثانية للطلب + ١٫٢ فاصلاً = ٦٫٣ للقطعة ⇐ تسعُ قطعٍ لا غير. فطلبُ
   * خمس عشرة — وهو الحدّ المبدئيّ في الواجهة — يموت في منتصفه: **الرصيد
   * يُستهلك كاملاً ولا يعود للأدمن سطرٌ واحد**.
   *
   * قِيس 2026-09-03 بثلاثة طلباتٍ لكلّ متجر.
   */
  perItemMs: number;
  /** ملاحظةٌ تُعرض في صفحة الإدارة */
  note: string;
  /** رابط صفحة البحث في المتجر — كما يفتحها إنسان */
  searchUrl: (query: string) => string;
  /** يستخرج المرشّحين من صفحة النتائج */
  parse?: (html: string) => Candidate[];
  /**
   * بحثٌ كاملٌ بنفسه بدل «اجلب `searchUrl` ثمّ `parse`» — لمتجرٍ صفحةُ بحثه
   * هيكلٌ فارغ تملؤه جافاسكربت من واجهةٍ برمجيّة (كازاسوق). يرمي عند الفشل.
   */
  search?: (query: string) => Promise<Candidate[]>;
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

/** مثل fetchText لكن يرمي عند ردٍّ غير ناجح — فصفحة خطأٍ لا تُقرأ «لا نتائج» */
const fetchOk = async (url: string, timeoutMs: number, init: RequestInit = {}): Promise<Response> => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, headers: { 'User-Agent': UA, ...(init.headers || {}) } });
    if (!res.ok) {
      const body = (await res.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200);
      throw new Error(`HTTP ${res.status}${body ? ` — ${body}` : ''}`);
    }
    return res;
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
    /* ⚠️ والصورة من `data-src` لا من `src`: البطاقة كسولةُ التحميل، و`src`
       فيها بكسلٌ شفّافٌ واحد (`pixel-paceholder-1x1.png`). فقراءةُ `src`
       تُعطي صورةً بيضاء لكلّ منتج. وهي مجّانيّة — في نفس الوسم الذي نقرأ
       منه العنوان أصلاً، فلا طلبَ إضافيّ. */
    const re =
      /data-listid="search"[\s\S]{0,1200}?href="(https:\/\/saudi\.microless\.com\/product\/[^"]+)"([\s\S]{0,600}?)alt="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(body))) {
      if (seen.has(m[1])) continue;
      seen.add(m[1]);
      const img = /data-src="([^"]+)"/.exec(m[2] || '')?.[1] ?? null;
      const title = m[3].replace(/&quot;/g, '"').replace(/&#0?39;|&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
      out.push({ url: m[1], title, image: img });
      if (out.length >= 12) break;
    }
    return out;
  }
}

/**
 * كازاسوق — من واجهتهم البرمجيّة نفسها، بلا وسيط و**بلا رصيد**.
 *
 * ⚠️ صفحة البحث `/shop?q=` في موقعهم الجديد (~2026-10-25) هيكلٌ فارغ (٦٫٦KB،
 * `<div id="root">`) تملؤه جافاسكربت — وكاش Netlify عندهم لا يفرّق بين سؤالٍ
 * وآخر (`Netlify-Vary: query=lang`)، فلا نتائج فيها حتى عبر الوسيط. والبحث
 * القديم `index.php?route=product/search` يُحوَّل إليها، فأعاد المُحلِّل القديم
 * «0 من 0» لكلّ قطعة — بلا خطأ، كأنّ كازاسوق لا يبيع شيئاً.
 *
 * وصفحتهم تبحث بخطوتين (قِيس في المتصفّح 2026-11-05)، على `api.cazasouq.com` (Supabase):
 *   ١) POST /rest/v1/rpc/search_products ← معرّفات المنتجات بترتيب الصلة
 *   ٢) GET  /rest/v1/products?id=in.(…)  ← الاسم والرابط والسعر والمخزون
 * بالمفتاح العامّ الذي ترسله كلّ صفحةٍ لكلّ زائر في `<meta name="cazasouq-supabase-anon-key">`.
 * ويُقرأ من الصفحة لا يُكتب هنا: إن غيّروه لم ننكسر، وإن اختفى الوسم رمينا خطأً معلناً لا صفراً.
 *
 * والسعر والمخزون بقاعدتهم هم (وحدتا pricing وinventory في حزمتهم):
 *   · الخصم ساري إن كان أقلّ من السعر وضمن نافذته (البداية ≤ الآن < النهاية).
 *   · المتوفّر: stock_unlimited أو stock_quantity > 0. والطلب المسبق ليس «متوفّراً الآن»
 *     — كما يحكم ساحب الأسعار (PreOrder في CAZ_OUT بـlib/scrape-prices).
 *   · العملة دينار بحرينيّ: 57.000 في الواجهة = 57 BHD في JSON-LD صفحة المنتج.
 */
const CAZ_SITE = 'https://www.cazasouq.com';
let cazApi: Promise<{ base: string; key: string }> | null = null;

const cazasouqApi = () =>
  (cazApi ??= (async () => {
    const html = await (await fetchOk(`${CAZ_SITE}/shop`, 20000)).text();
    const meta = (name: string) => html.match(new RegExp(`<meta[^>]+name="${name}"[^>]+content="([^"]+)"`))?.[1];
    const base = (meta('cazasouq-supabase-url') || '').replace(/\/+$/, '');
    const key = meta('cazasouq-supabase-anon-key');
    if (!/^https:\/\/[a-z0-9.-]+\.cazasouq\.com$/.test(base) || !key) {
      throw new Error('كازاسوق: لا عنوان واجهةٍ أو مفتاحٍ عامّ في رأس الصفحة — تغيّر موقعهم؟');
    }
    return { base, key };
  })().catch((e) => { cazApi = null; throw e; }));

type CazRow = {
  id: string; slug: string | null; name_en: string | null; name_ar: string | null;
  price: number | null; discount_price: number | null;
  discount_starts_at: string | null; discount_ends_at: string | null;
  stock_quantity: number | null; stock_unlimited: boolean | null;
  product_images?: { url: string; is_primary: boolean | null; sort_order: number | null }[] | null;
};

const cazPriceSar = (r: CazRow, now = new Date()): number | null => {
  const p = Number(r.price), d = Number(r.discount_price);
  const onSale = r.discount_price != null && d > 0 && d < p
    && !(r.discount_starts_at && new Date(r.discount_starts_at) > now)
    && !(r.discount_ends_at && new Date(r.discount_ends_at) <= now);
  const bhd = onSale ? d : p;
  return Number.isFinite(bhd) && bhd > 0 ? Math.round(bhdToSar(bhd) * 100) / 100 : null;
};

async function searchCazasouq(query: string): Promise<Candidate[]> {
  const { base, key } = await cazasouqApi();
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  const hits: { id?: string }[] = await (await fetchOk(`${base}/rest/v1/rpc/search_products`, 20000, {
    method: 'POST',
    headers,
    /* المعاملات كما ترسلها صفحتهم حرفياً — الدالّة لها نسخٌ بمعاملاتٍ مختلفة */
    body: JSON.stringify({
      p_term: query, p_on_sale: false, p_in_stock: false, p_price_min: null, p_price_max: null,
      p_sort: 'relevance', p_limit: 24, p_offset: 0,
      p_category_ids: null, p_brand_ids: null, p_product_ids: null,
    }),
  })).json();
  const order = (Array.isArray(hits) ? hits : []).map((h) => String(h?.id || '')).filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (!order.length) return [];

  const select = 'id,slug,name_en,name_ar,price,discount_price,discount_starts_at,discount_ends_at,'
    + 'stock_quantity,stock_unlimited,product_images(url,is_primary,sort_order)';
  const rows: CazRow[] = await (await fetchOk(
    `${base}/rest/v1/products?select=${encodeURIComponent(select)}&id=in.(${order.join(',')})&is_active=eq.true&is_archived=eq.false`,
    20000,
    { headers },
  )).json();

  const byId = new Map(rows.map((r) => [r.id, r]));
  const out: Candidate[] = [];
  for (const id of order) {
    const r = byId.get(id);
    const title = (r?.name_en || r?.name_ar || '').replace(/\s+/g, ' ').trim();
    if (!r?.slug || !title) continue;
    const img = [...(r.product_images || [])]
      .sort((a, b) => Number(!!b.is_primary) - Number(!!a.is_primary) || (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
    out.push({
      url: `${CAZ_SITE}/product/${r.slug}`,
      title,
      price: cazPriceSar(r),
      inStock: r.stock_unlimited === true || Math.floor(Number(r.stock_quantity)) > 0,
      image: img?.url ?? null,
    });
    if (out.length >= 12) break;
  }
  return out;
}

/**
 * ريد زون — متجر Zid سعوديّ بالريال، ويستجيب لطلبٍ من خادم بلا رصيد.
 *
 * ⚠️ المعامل `q` لا `search`: نموذج البحث في رأس صفحتهم يرسل `?search=`، والخادم
 * يتجاهله فيعيد **كلّ المنتجات** (٢٣ صفحة) — فيبدو كلّ بحثٍ ناجحاً. أمّا `?q=` (وهو
 * `urlTemplate` في SearchAction بـJSON-LD صفحتهم) فيرشّح فعلاً: «zzqxv» صفرٌ،
 * و«x space» منتجان (قِيس 2026-11-05).
 *
 * والنتائج من `ItemList` في JSON-LD كإنفيني آرك، والسعر من البطاقة ذات الرابط نفسه —
 * القائمة بلا سعر. والروابط بالترميز المئويّ كما تُخزَّن عروضهم عندنا (normUrl لا يفكّه).
 */
function parseRedzone(html: string): Candidate[] {
  const key = (u: string) => { try { return decodeURIComponent(new URL(u, 'https://redzzone.com').pathname); } catch { return u; } };

  const prices = new Map<string, number>();
  for (const card of html.split('js-card-item').slice(1)) {
    const href = card.match(/<h2[\s\S]{0,300}?href="(\/products\/[^"]+)"/)?.[1];
    const n = Number(card.match(/<strong[^>]*>\s*([\d.,]+)\s*ر\.س/)?.[1]?.replace(/,/g, ''));
    if (href && Number.isFinite(n) && n > 0 && !prices.has(key(href))) prices.set(key(href), n);
  }

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
      let url = '';
      try { url = new URL(String(it?.url || '')).href; } catch { continue; }
      const title = String(it?.name || '').replace(/\s+/g, ' ').trim();
      if (!url.startsWith('https://redzzone.com/products/') || !title || seen.has(url)) continue;
      seen.add(url);
      out.push({ url, title, price: prices.get(key(url)) ?? null });
      if (out.length >= 12) break;
    }
  }
  return out;
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
      /* الصورة في ld+json حين توجد — قد تكون نصّاً أو مصفوفة */
      const img = Array.isArray(it?.image) ? it.image[0] : it?.image;
      out.push({ url, title, image: typeof img === 'string' ? img : null });
      if (out.length >= 12) break;
    }
  }
  return out;
}

/**
 * أمازون السعودية — بلا وسيط، وبالسعر في صفحة النتائج نفسها.
 *
 * ⚠️ ويمرّ عبر Scrape.do — وهذا صُحّح بعد قياسين متناقضين:
 *
 *   أوّل خمس طلباتٍ من خادمٍ نجحت: 200 في ١٫٤ ثانية بـ٩٢ منتجاً. فظننتُه
 *   مجّانيّاً وأدخلتُه كذلك. ثم بدأ يردّ **٢٬٢٦٢ بايت** — هيكلَ تنقّلٍ بلا
 *   منتجٍ واحد، **بحالة 200 وبلا كابتشا ولا رسالة**. أي أنّ الحجب صامت:
 *   لا يُعلن نفسه، بل يُعيد صفحةً تبدو سليمةً وهي فارغة.
 *
 * وهذا أخطر من 403: بحثٌ يُعيد صفراً يُقرأ «لا نتائج» لا «مُنعت». فمُيّز
 * أمازون بوسيطٍ كما يعامله ساحبُ الأسعار أصلاً — يُعطَّل بلا رمز ولا يَعِد
 * بما لا يفي.
 *
 * ⚠️ والسعر يُقرأ من `a-offscreen` — النصّ المخفيّ لقارئات الشاشة — لأنه
 * الوحيد الذي يحمل الرقم كاملاً بفاصلته. أمّا `a-price-whole` فيقطع الكسر
 * إلى وسمٍ آخر، فقراءته وحدها تُعطي «238» لسعرٍ هو 238.88.
 *
 * ⚠️ وتُشترط بطاقةٌ فيها عنوانُ h2 ورابطُ /dp/: صفحة النتائج تحمل صفوفاً
 * ليست منتجات («خيارات أخرى للشراء») تلتقطها أيّ قراءةٍ أوسع.
 */
function parseAmazon(html: string): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set<string>();
  for (const card of html.split(/data-asin="/).slice(1)) {
    const asin = card.slice(0, 10);
    if (!/^[A-Z0-9]{10}$/.test(asin) || seen.has(asin)) continue;
    if (!/\/dp\/|\/gp\/product\//.test(card.slice(0, 6000))) continue;

    /* ⚠️ **أطول** h2 لا أوّله: البطاقة تحمل عنوانين — الماركة في h2 قصير
       ثم اسم المنتج في h2 أطول. وقراءة الأوّل أعطت «Thermalright» لاثنتي
       عشرة نتيجةً كلّها، وهي أسماء لا تُميّز منتجاً عن آخر. وترتيبُهما
       يختلف بين الطلب المباشر والمارّ بالوسيط، فالطولُ أثبتُ من الموضع. */
    const heads = [...card.matchAll(/<h2[^>]*>([\s\S]{0,800}?)<\/h2>/g)]
      .map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/\s+/g, ' ').trim())
      .concat((card.match(/<img[^>]+alt="([^"]{10,300})"/) || [])[1] ?? '')
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
    const title = heads[0] ?? '';
    if (title.length < 12) continue;

    const off = card.match(/class="a-offscreen"[^>]*>([^<]{1,40})</);
    const num = off ? Number(off[1].replace(/[^\d.]/g, '')) : NaN;

    seen.add(asin);
    out.push({
      url: 'https://www.amazon.sa/dp/' + asin,
      title,
      price: Number.isFinite(num) && num > 0 ? num : null,
    });
    if (out.length >= 12) break;
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
    perItemMs: 1334,
    note: 'مجّاني — يستجيب لطلبٍ من خادم',
    searchUrl: (q) => 'https://saudi.microless.com/search/?query=' + encodeURIComponent(q),
    parse: parseMicroless,
  },
  {
    slug: 'cazasouq',
    label: 'كازاسوق',
    needsProxy: false,
    delayMs: 800,
    /* طلبان (البحث ثمّ المنتجات) ~١٫٦ث + الفاصل — قِيس 2026-11-05 بأربعة استعلامات؛
       وكان ٦٢٦٠ يوم كان يمرّ بالوسيط */
    perItemMs: 2400,
    note: 'مجّاني — من واجهة المتجر البرمجيّة · السعر بالدينار محوّلاً',
    searchUrl: (q) => 'https://www.cazasouq.com/shop?q=' + encodeURIComponent(q),
    search: searchCazasouq,
  },
  {
    slug: 'amazon',
    label: 'أمازون',
    /* ⚠️ يحجب الطلب المباشر صامتاً بعد طلباتٍ قليلة — انظر تعليق parseAmazon */
    needsProxy: true,
    delayMs: 1500,
    perItemMs: 6600,
    note: 'يستهلك رصيداً — يحجب الطلب المباشر صامتاً',
    searchUrl: (q) => 'https://www.amazon.sa/s?k=' + encodeURIComponent(q),
    parse: parseAmazon,
  },
  {
    slug: 'infiniarc',
    label: 'إنفيني آرك',
    needsProxy: false,
    delayMs: 700,
    perItemMs: 1237,
    note: 'مجّاني · سعوديّ بالريال',
    searchUrl: (q) => 'https://www.infiniarc.com/ar/shop?search=' + encodeURIComponent(q),
    parse: parseInfiniarc,
  },
  {
    slug: 'redzone',
    label: 'ريد زون',
    needsProxy: false,
    delayMs: 700,
    perItemMs: 1300, // ~٠٫٦ث للطلب + الفاصل — قِيس 2026-11-05 بأربعة استعلامات
    note: 'مجّاني · سعوديّ بالريال',
    searchUrl: (q) => 'https://redzzone.com/products?q=' + encodeURIComponent(q),
    parse: parseRedzone,
  },
];

export const adapterFor = (slug: string): StoreAdapter | null =>
  ADAPTERS.find((a) => a.slug === slug) ?? null;

/** ما تحتاجه صفحة الإدارة — بلا المحلّلات، فلا تُشحن إلى المتصفّح */
export const sourceMeta = () =>
  ADAPTERS.map(({ slug, label, needsProxy, note, perItemMs }) => ({ slug, label, needsProxy, note, perItemMs }));

/**
 * كم قطعةً تسع في نافذةٍ زمنيّة — بالقياس لا بالأمل.
 *
 * ⚠️ ويُترك سُبعُ النافذة: الجلبُ من القاعدة وبناء الجواب وبردُ الدالّة
 * كلُّها خارج حساب الطلبات، وطلبٌ واحدٌ يتجاوز السقف يُبطل الدفعة كلَّها.
 * والخسارة ليست وقتاً فحسب — ما يمرّ بالوسيط (أمازون) يُحسب له الطلبُ ولو مات
 * المسار قبل عرض نتيجته.
 */
export const maxItemsIn = (slug: string, windowMs: number): number => {
  const a = adapterFor(slug);
  if (!a) return 1;
  return Math.max(1, Math.floor((windowMs * 6) / 7 / a.perItemMs));
};

/**
 * بحثٌ في متجرٍ واحد، **يرمي عند الفشل** — للأدوات اليدويّة التي تقول «لم أصل»
 * لا «لم أجد» (scripts/find-in-stores.ts).
 */
export async function searchStoreOrThrow(
  source: SearchSource,
  query: string,
  token: string,
): Promise<Candidate[]> {
  const ad = adapterFor(source);
  if (!ad) throw new Error(`لا محرّك بحثٍ للمتجر «${source}»`);
  if (ad.search) return ad.search(query);
  if (ad.needsProxy && !token) throw new Error(`${ad.label} يحتاج SCRAPER_API_KEY`);

  const target = ad.searchUrl(query);
  const url = ad.needsProxy
    ? `https://api.scrape.do/?token=${token}&url=${encodeURIComponent(target)}`
    : target;
  const html = await (await fetchOk(url, ad.needsProxy ? 45000 : 25000)).text();
  return ad.parse ? ad.parse(html) : [];
}

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
  try {
    return await searchStoreOrThrow(source, query, token);
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

    /* متجرٌ لا يُحدّث بيانه المُهيكل — الشرح في lib/stock-truth.ts */
    inStock = correctStock(url, html, inStock);

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
