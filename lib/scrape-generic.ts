/**
 * ============ محرّك السحب العام — أي متجر ============
 *
 * يجلب الصفحة عبر Scrape.do (نفس طبقة الجلب التي تستخدمها المتاجر الثلاثة
 * الحالية)، ثم يقرأ منها بالترتيب:
 *
 *   1. JSON-LD (schema.org/Product) — البيانات التي يضعها المتجر لجوجل.
 *      وهي الأدقّ: محصورة بالمنتج المعروض، فلا تلتقط منتجاً مجاوراً من
 *      كاروسيل "منتجات ذات صلة" — وهو الخطأ الذي أفسد أسعار كازاسوق شهوراً.
 *   2. وسوم meta (product:price:amount / og:price:amount).
 *   3. محدّدات CSS يكتبها الأدمن للمتجر عند فشل الاثنين.
 *
 * تُعاد أيضاً `via` (مصدر القراءة) كي يعرضها زرّ «اختبر المتجر» فيرى الأدمن
 * من أين جاء الرقم قبل أن يعتمد المتجر.
 */

import * as cheerio from 'cheerio';
import { round2, parseMoney, acceptListPrice, scrapeFetch, httpReason, isBrokenPage } from './scrape-prices';

export type GenericStoreConfig = {
  slug: string;
  name: string;
  currency: string;
  rateToSar: number;
  scrapeMode: string;
  priceSelector: string | null;
  listSelector: string | null;
  stockSelector: string | null;
  premiumProxy: boolean;
};

export type GenericResult = {
  price: number | null;
  listPrice: number | null;
  inStock: boolean;
  /** من أين قرأنا السعر — يظهر في اختبار المتجر */
  via: 'json-ld' | 'meta' | 'selector' | 'none';
  currencyFound: string | null;
  errors: string[];
};

const scrapeUrl = (token: string, target: string, premium: boolean) =>
  `https://api.scrape.do/?token=${token}&url=${encodeURIComponent(target)}${premium ? '&super=true' : ''}`;

/** يمرّ على كل كتل JSON-LD ويعيد أول كائن Product فيه سعر */
/* مُصدَّرة كي تُفحص على صفحةٍ حقيقية بلا استهلاك رصيد Scrape.do:
   المحتوى يُجلب مباشرةً في الفحص، ويُمرَّر إلى القارئ نفسه الذي يعمل في الإنتاج. */
export function readJsonLd($: cheerio.CheerioAPI): {
  price: number; listPrice: number; inStock: boolean | null; currency: string | null;
} | null {
  const blocks = $('script[type="application/ld+json"]').toArray();

  for (const el of blocks) {
    let parsed: any;
    try { parsed = JSON.parse($(el).text()); } catch { continue; }

    // الصفحة قد تضع مصفوفة، أو @graph، أو كائناً واحداً
    const nodes: any[] = Array.isArray(parsed) ? parsed : parsed['@graph'] ?? [parsed];

    for (const node of nodes) {
      const type = node?.['@type'];
      const isProduct = type === 'Product' || (Array.isArray(type) && type.includes('Product'));
      if (!isProduct) continue;

      const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
      if (!offers) continue;

      const price = parseMoney(String(offers.price ?? offers.lowPrice ?? ''));
      if (!(price > 0)) continue;

      const availability = String(offers.availability ?? '').toLowerCase();
      const inStock = availability
        ? !(availability.includes('outofstock') || availability.includes('soldout') || availability.includes('discontinued'))
        : null;

      return {
        price,
        // بعض المتاجر تضع السعر قبل الخصم في highPrice أو priceSpecification
        listPrice: parseMoney(String(offers.highPrice ?? node.listPrice ?? '')),
        inStock,
        currency: offers.priceCurrency ?? null,
      };
    }
  }
  return null;
}

/** وسوم meta المعيارية — يدعمها OpenGraph وأغلب منصّات المتاجر */
function readMeta($: cheerio.CheerioAPI) {
  const price = parseMoney(
    $('meta[property="product:price:amount"]').attr('content') ||
    $('meta[property="og:price:amount"]').attr('content') ||
    '',
  );
  const currency =
    $('meta[property="product:price:currency"]').attr('content') ||
    $('meta[property="og:price:currency"]').attr('content') ||
    null;
  const availability = ($('meta[property="product:availability"]').attr('content') || '').toLowerCase();
  const inStock = availability
    ? !(availability.includes('out of stock') || availability.includes('oos') || availability.includes('outofstock'))
    : null;
  return price > 0 ? { price, listPrice: 0, inStock, currency } : null;
}

export async function scrapeGeneric(
  store: GenericStoreConfig,
  url: string,
  token: string,
): Promise<GenericResult> {
  const out: GenericResult = {
    price: null, listPrice: null, inStock: true, via: 'none', currencyFound: null, errors: [],
  };

  if (!url || url.length <= 12) {
    out.errors.push(`${store.name}: لا يوجد رابط منتج.`);
    return out;
  }

  let html = '';
  try {
    const res = await scrapeFetch(scrapeUrl(token, url, store.premiumProxy));
    if (!res.ok) {
      out.errors.push(`${store.name}: ${httpReason(res.status)}`);
      return out;
    }
    html = await res.text();
  } catch {
    out.errors.push(`${store.name}: تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.`);
    return out;
  }

  /* صفحة معطّلة/صيانة ليست دليل نفاد — نُبقي الحالة السابقة كما هي */
  if (isBrokenPage(html)) {
    out.errors.push(`${store.name}: صفحة المتجر معطّلة أو تحت الصيانة — أُبقيت الحالة السابقة.`);
    out.inStock = true; // لا نغيّر شيئاً: المستدعي يتجاهل النتيجة بلا سعر
    return out;
  }

  const $ = cheerio.load(html);

  /* الترتيب مقصود: المنظَّم أولاً لأنه محصور بالمنتج، والمحدّد اليدوي أخيراً
     لأنه الأسهل كسراً عند أي تغيير في تصميم المتجر. */
  let found: { price: number; listPrice: number; inStock: boolean | null; currency: string | null } | null = null;

  if (store.scrapeMode !== 'custom') {
    found = readJsonLd($);
    if (found) out.via = 'json-ld';
    if (!found) {
      found = readMeta($);
      if (found) out.via = 'meta';
    }
  }

  if (!found && store.priceSelector) {
    const price = parseMoney($(store.priceSelector).first().text());
    if (price > 0) {
      const listPrice = store.listSelector ? parseMoney($(store.listSelector).first().text()) : 0;
      let inStock: boolean | null = null;
      if (store.stockSelector) {
        const el = $(store.stockSelector).first();
        // وجود العنصر يعني "متوفّر" ما لم يقل نصّه خلاف ذلك
        const t = el.text().toLowerCase();
        inStock = el.length > 0 && !(t.includes('نفد') || t.includes('غير متوفر') || t.includes('out of stock'));
      }
      found = { price, listPrice, inStock, currency: null };
      out.via = 'selector';
    }
  }

  if (!found) {
    out.errors.push(
      `${store.name}: لم نجد سعراً — لا JSON-LD ولا وسوم meta` +
      (store.priceSelector ? ' ولا محدّد CSS المحفوظ.' : '. أضف محدّد CSS للسعر من إعدادات المتجر.'),
    );
    return out;
  }

  out.currencyFound = found.currency;

  /* تحويل العملة: نثق بعملة الصفحة إن صرّحت بها، وإلا نستخدم عملة المتجر.
     (لا حيل تخمينية مثل "اضرب ×10 إن بدا السعر صغيراً" — تلك الحيلة هي
     التي حوّلت سعر منتج مجاور إلى رقم يبدو معقولاً فمرّ.) */
  const currency = (found.currency || store.currency || 'SAR').toUpperCase();

  /* ============ عملةٌ غريبة بلا سعر صرف = رفض ============
   *
   * القاعدة القديمة كانت ، وكل متاجرنا الأربعة
   * rateToSar = 1. فصفحةٌ تُعلن BHD تُضرب في **واحد** وتُحفظ كأنها ريال —
   * والدينار ≈ عشرة ريالات، فالسعر يهبط عشرة أضعاف بلا خطأ ولا أثر.
   *
   * والخطر ليس نظرياً: كازاسوق يخدم واجهةَ البحرين لبعض العناوين، ولذلك
   * لساحبه المخصّص معالجةٌ صريحة للدينار. أمّا هذا المسار العامّ فيخدم
   * المتاجر التي يضيفها الأدمن من اللوحة — وهي تولد كلُّها بـrateToSar = 1.
   *
   * فالسكوت هنا أسوأ من الرفض: السعر الخاطئ يجعل المتجر «الأرخص» في كل
   * قطعة، فيوجّه إليه كلَّ زائر، ويبني عليه المُجمّع اختياره. والرفض يُبقي
   * السعر القديم ويُظهر السبب في تقرير السحب.
   */
  if (currency !== 'SAR' && !(store.rateToSar && store.rateToSar !== 1)) {
    out.errors.push(
      `${store.name}: الصفحة أعلنت العملة ${currency} ولا سعر صرف مضبوط للمتجر — ` +
      `رُفض السعر بدل حفظه كأنه ريال. اضبط rateToSar أو صحّح الرابط للواجهة السعودية.`,
    );
    return out;
  }

  const rate = currency === 'SAR' ? 1 : store.rateToSar || 1;

  const price = round2(found.price * rate);
  const listPrice = found.listPrice > 0 ? round2(found.listPrice * rate) : 0;

  out.price = price;
  out.listPrice = acceptListPrice(listPrice, price);
  out.inStock = found.inStock ?? true;
  return out;
}
