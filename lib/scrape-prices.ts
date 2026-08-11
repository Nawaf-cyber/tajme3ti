/**
 * ============ سحب الأسعار — مصدر واحد للحقيقة ============
 *
 * ⚠️ لماذا هذا الملف موجود:
 * كان منطق السحب مكرّراً حرفياً في مسارين (الكرون الشامل و«تحديث قطعة
 * واحدة»). فلمّا اكتُشف أن محدّد سعر كازاسوق يقرأ **منتجاً مجاوراً** من
 * الكاروسيل بدل المنتج المعروض، كان لا بد من إصلاحه مرّتين — وأي إصلاح
 * قادم سيحمل الخطر نفسه. الآن المسارَان يستدعيان هذه الوحدة، فأي تصحيح
 * يسري على الاثنين.
 *
 * لا تستورد prisma هنا: الوحدة تسحب وتحسب فقط، والكتابة مسؤولية المسار.
 */

import * as cheerio from 'cheerio';
import { classifyPriceChange } from './price';

/* ---- تدوير لمنزلتين ----
   يمنع نواتج الفاصلة العائمة مثل 409.09*10 = 4090.8999999999996
   التي كانت تُخزَّن وتُعرض كما هي في صفحة المنتج. */
export const round2 = (n: number) => Math.round(n * 100) / 100;

/** استخراج أول رقم من نص سعر ("BHD 370.80" → 370.8) */
export const parseMoney = (text: string): number => {
  const m = String(text || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
};

/* ---- قبول سعر ما قبل الخصم ----
   لا نعلن خصماً إلا إن كان السعر المشطوب أعلى فعلاً وبفارق معقول.
   بلا هذا الحدّ، أي رقم شاذ في الصفحة يصير "خصماً" وهمياً يضلّل المستخدم. */
export const acceptListPrice = (list: number, current: number): number | null => {
  if (!(list > 0) || !(current > 0)) return null;
  if (list <= current * 1.005) return null;   // فارق أقل من ٠٫٥٪ ليس خصماً
  /* السقف ٢× (أي خصم ٥٠٪ كحد أقصى). كان ٣× فمرّ خصم وهمي ٦٠٪ من
     مايكرولس (7554.03 لكرت سعره 3042). خصومات قطع الحاسب الحقيقية
     تتراوح ٥–٤٠٪؛ ما فوق ٥٠٪ على عتاد حديث هو خطأ قراءة لا عرض. */
  if (list > current * 2) return null;
  return round2(list);
};

/* ---- حارس الانحراف ----
   شبكة أمان لو تغيّرت بنية الصفحة وصار المحدّد يقرأ عنصراً آخر:
   قفزة تتجاوز ٦٠٪ عن آخر سعر معروف تُرفض ويُسجّل الخطأ بدل تخزين رقم فاسد.
   (لا يمنع الخصومات العادية — خصم ٦٪ يمرّ بسهولة.) */
export const isPlausible = (next: number, previous: number | null | undefined): boolean => {
  if (!previous || previous <= 0) return true;   // لا مرجع للمقارنة
  const ratio = next / previous;
  return ratio >= 0.4 && ratio <= 1.6;
};

/* ---- شاهد مستقل من بيانات schema.org ----
   الحارس أعلاه يفترض أن القفزة الكبيرة = خطأ قراءة. لكنها أحياناً ارتفاع
   حقيقي (رصدنا ٢٠٢٦-٠٨-٠٨: قرص ارتفع من ٦٠٠ إلى ٩٨٠ عند كازاسوق، فرفضه
   الحارس وبقي الموقع يعرض السعر القديم — أسوأ من الخطأ الذي يحمينا منه).
   الحلّ: إن أكّد مصدر ثانٍ في الصفحة (JSON-LD) الرقمَ نفسه، فالقراءة سليمة
   والقفزة واقع سوق. لا نتجاوز الحارس إلا بهذا التطابق. */
export type LdOffer = { price: number | null; inStock: boolean | null };

export const jsonLdOffer = ($: cheerio.CheerioAPI): LdOffer => {
  const found: LdOffer = { price: null, inStock: null };
  $('script[type="application/ld+json"]').each((_, el) => {
    if (found.price != null || found.inStock != null) return;
    try {
      const parsed = JSON.parse($(el).text());
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        if (node?.['@type'] !== 'Product' || !node.offers) continue;
        const offer = Array.isArray(node.offers) ? node.offers[0] : node.offers;
        const p = parseFloat(String(offer?.price ?? '').replace(/,/g, ''));
        if (p > 0) found.price = p;
        const av = String(offer?.availability ?? '').toLowerCase();
        if (av.includes('outofstock') || av.includes('soldout') || av.includes('discontinued')) found.inStock = false;
        else if (av.includes('instock') || av.includes('limitedavailability') || av.includes('preorder')) found.inStock = true;
        if (found.price != null || found.inStock != null) return;
      }
    } catch { /* JSON-LD مكسور ليس خطأً نُبلغ عنه — نتجاهله فحسب */ }
  });
  return found;
};

export const jsonLdPrice = ($: cheerio.CheerioAPI): number | null => jsonLdOffer($).price;

/** هل يطابق الشاهدُ السعرَ المقروء (بفارق ١٪ يستوعب التقريب)؟ */
export const confirmsPrice = (witness: number | null, price: number): boolean =>
  witness != null && witness > 0 && Math.abs(witness - price) / price <= 0.01;

/* ============ حدّ التزامن — بوّابة واحدة لكل طلبات Scrape.do ============
 *
 * خطة Scrape.do تسمح بعدد محدّد من الطلبات المتزامنة، وتجاوزه يردّ 429.
 * الخطأ الذي وقعنا فيه: التزامن كان محسوباً بعدد **القطع** (١٠ قطع دفعة)،
 * بينما كل قطعة تسحب متاجرها بالتوازي. فمع ٣ متاجر = ٣٠ طلباً، ومع إضافة
 * متجر رابع صارت ٤٠ — فامتلأ الحدّ وفشلت أغلب الطلبات بـ429.
 *
 * الآن العدّ على الطلبات نفسها: مهما بلغ عدد القطع أو المتاجر، لا يتجاوز
 * المفتوح فعلياً SCRAPE_CONCURRENCY. إضافة متجر خامس تُبطئ الدفعة قليلاً
 * ولا تُسقطها.
 */
const MAX_CONCURRENT = Math.max(1, Number(process.env.SCRAPE_CONCURRENCY || 8));
let activeRequests = 0;
const waiting: (() => void)[] = [];

const acquireSlot = async (): Promise<void> => {
  if (activeRequests < MAX_CONCURRENT) {
    activeRequests++;
    return;
  }
  await new Promise<void>((resolve) => waiting.push(resolve));
};

const releaseSlot = () => {
  const next = waiting.shift();
  // نُسلّم المكان للمنتظر مباشرة بدل إنقاص العدّاد ثم زيادته
  if (next) next();
  else activeRequests--;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * كل طلب إلى Scrape.do يمرّ من هنا: يحترم حدّ التزامن، ويعيد المحاولة مرّة
 * واحدة عند 429 بعد مهلة قصيرة (الحدّ لحظي، فالانتظار وحده يكفي غالباً).
 */
export async function scrapeFetch(url: string, timeout = 20000): Promise<Response> {
  await acquireSlot();
  try {
    let res = await fetchWithTimeout(url, { cache: 'no-store' }, budgetedTimeout(timeout));
    // لا نُعيد المحاولة إن لم يبقَ وقتٌ يكفيها — الردّ الذي يصل بعد موت الدالة لا ينفع أحداً
    if (res.status === 429 && remainingBudget() > 6000) {
      await sleep(2000 + Math.floor(Math.random() * 1000)); // تشتيت لتفادي الارتطام
      res = await fetchWithTimeout(url, { cache: 'no-store' }, budgetedTimeout(timeout));
    }
    return res;
  } finally {
    releaseSlot();
  }
}

/* ============ المهلة الصارمة للدورة ============
 *
 * درس ٢٠٢٦-٠٨-١١: دالة فيرسل سقفها ٦٠ ثانية، وكانت الدورة تفحص ميزانيتها
 * الزمنية **بين كل عشر قطع فقط**. فإن مرّت العشرة الأخيرة والساعة عند ٤٥ث
 * ثم احتاجت ٢٠ث، تجاوزت الدالة السقف فقتلها فيرسل وردّ 504 — وهو ما أسقط
 * الدفعة الثانية في أول تشغيلة جدولة عملت فعلاً.
 *
 * فحصُ الميزانية بين الدفعات لا يكفي: الطلب الواحد نفسه قد يستغرق ٢٠ث،
 * ومع إعادة محاولة 429 يبلغ ٤٣ث. الحلّ أن يعرف **كل طلب** متى ينتهي وقت
 * الدورة، فيقصّر مهلته بنفسه بدل أن يتجاوزها.
 */
let deadlineAt = 0;

/** يضبطه المسار في بداية الدورة؛ 0 = بلا مهلة (تحديث قطعة واحدة) */
export const setScrapeDeadline = (msFromNow: number) => {
  deadlineAt = msFromNow > 0 ? Date.now() + msFromNow : 0;
};

export const remainingBudget = (): number =>
  deadlineAt === 0 ? Number.POSITIVE_INFINITY : Math.max(0, deadlineAt - Date.now());

/** مهلة الطلب مقصوصة على ما تبقّى من الدورة (بحدّ أدنى ٣ث كي لا نُجهض بلا داعٍ) */
const budgetedTimeout = (wanted: number): number => {
  const left = remainingBudget();
  if (!Number.isFinite(left)) return wanted;
  return Math.max(3000, Math.min(wanted, left));
};

/* ============ حارس الصفحة المعطّلة ============
 *
 * درس مكلّف (٢٠٢٦-٠٨-٠٦): تعطّل خادم كازاسوق وأعاد صفحة خطأ PHP بدل صفحة
 * المنتج. فحص التوفّر لم يجد صفّ المخزون ولا زرّ السلة، فاستنتج "نافد"
 * وعلّم **٥٦ من ٧٤ منتجاً** غير متوفّر دفعةً واحدة — فاختفت أسعار المتجر
 * من الموقع، وانتقل "الأرخص" لمتجر أغلى بلا أن يلاحظ أحد.
 *
 * القاعدة: صفحة لا نتعرّف عليها كصفحة منتج ≠ منتج نافد. الأولى تعني
 * "لم نستطع القراءة" فنُبقي الحالة السابقة، والثانية وحدها تُغيّرها.
 */
const BROKEN_PAGE = /fatal error|uncaught (error|exception)|call to a member function|whoops, looks like|maintenance mode|under maintenance|service (temporarily )?unavailable|database connection|502 bad gateway|504 gateway/i;

/** هل الصفحة معطّلة/صيانة بدل أن تكون صفحة منتج؟ */
export const isBrokenPage = (html: string): boolean => {
  if (!html || html.length < 500) return true;      // ردّ فارغ أو مبتور
  return BROKEN_PAGE.test(html.slice(0, 6000));      // رسائل الخطأ تظهر في الأعلى
};

/** رسالة خطأ مفهومة بدل رقم الحالة الخام */
export const httpReason = (status: number): string =>
  status === 429 ? 'تجاوز حدّ الطلبات المتزامنة (429) — قلّل SCRAPE_CONCURRENCY أو حجم الدفعة'
  : status === 403 || status === 401 ? `حظر من المتجر (${status}) — جرّب البروكسي المتقدّم`
  : `فشل الاتصال ${status}`;

/** حماية الاتصال من التعليق */
export async function fetchWithTimeout(url: string, options: any = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export type Store = string; // slug من جدول Store

/** هدف السحب: عرض متجر واحد + اسم القطعة للرسائل.
 *  كان النوع يحمل ١٢ عموداً بأسماء المتاجر الثلاثة؛ الآن شكل واحد يخدم
 *  أي متجر — وهو ما يجعل إضافة متجر لا تمسّ ملف السحب إطلاقاً. */
export type OfferTarget = {
  /** اسم القطعة — يظهر في رسائل الخطأ فقط */
  name: string;
  url: string | null;
  /** السعر السابق — مرجع حارس الانحراف */
  price: number | null;
  inStock: boolean | null;
};

export type StoreOutcome = {
  /** null = لم نحصل على سعر (نُبقي القديم) */
  price: number | null;
  /** undefined = لم نقرأ الصفحة؛ null = قرأناها ولا خصم */
  listPrice: number | null | undefined;
  inStock: boolean;
  errors: string[];
  /** سعر قُرئ بنجاح لكنه ارتفاع مشبوه — يُعلَّق للمراجعة ولا يُطبَّق */
  heldPrice?: number;
};

const emptyOutcome = (inStock: boolean): StoreOutcome => ({
  price: null, listPrice: undefined, inStock, errors: [],
});

/**
 * القرار المشترك لكل المتاجر: يُطبَّق، أم يُعلَّق للمراجعة، أم يُرفض؟
 *
 * كان كل محرّك متجر يكرّر الشرط بنفسه، فأي تعديل على السياسة يحتاج تحريره
 * في أربعة مواضع — وهو الطريق الذي جعل خطأ محدّد كازاسوق يعيش في نسختين.
 *
 * @param witness سعر من مصدر ثانٍ في الصفحة (JSON-LD). تطابقه يعني أن
 *                القراءة سليمة، فالقفزة واقعُ سوقٍ لا خطأ — فتُعتمد بلا سؤال.
 */
export function applyPriceVerdict(
  out: StoreOutcome,
  storeName: string,
  itemName: string,
  price: number,
  listPrice: number,
  previous: number | null | undefined,
  witness?: number | null,
): void {
  if (confirmsPrice(witness ?? null, price)) {
    out.price = price;
    out.listPrice = acceptListPrice(listPrice, price);
    return;
  }

  switch (classifyPriceChange(price, previous)) {
    case 'ok':
      out.price = price;
      out.listPrice = acceptListPrice(listPrice, price);
      return;
    case 'hold':
      /* لا نلمس السعر: يبقى القديم معروضاً حتى يقرّر الأدمن. ولا نُسجّله
         خطأً — الخطأ يعني عطلاً يُصلَح، وهذا سؤالٌ يُجاب. */
      out.heldPrice = price;
      return;
    case 'reject':
      out.errors.push(
        `${storeName} (${itemName}): سعر مرفوض لانحرافه الشديد (${price} مقابل ${previous ?? '؟'} سابقاً) — تحقّق من بنية الصفحة.`,
      );
      return;
  }
}

const scrapeUrl = (token: string, target: string, premium: boolean) =>
  `https://api.scrape.do/?token=${token}&url=${encodeURIComponent(target)}${premium ? '&super=true' : ''}`;

/* ============================ أمازون ============================ */
export async function scrapeAmazon(t: OfferTarget, token: string): Promise<StoreOutcome> {
  const out = emptyOutcome(t.inStock ?? true);
  if (!t.url || t.url.length <= 12) return out;

  try {
    const res = await scrapeFetch(scrapeUrl(token, t.url, true));
    if (!res.ok) {
      out.errors.push(`أمازون (${t.name}): ${httpReason(res.status)}`);
      return out;
    }
    const html = await res.text();

    /* صفحة معطّلة/صيانة ليست دليل نفاد — نخرج بلا أن نمسّ حالة التوفّر */
    if (isBrokenPage(html)) {
      out.errors.push(`أمازون (${t.name}): صفحة المتجر معطّلة أو تحت الصيانة — أُبقيت الحالة السابقة.`);
      return out;
    }
    const $ = cheerio.load(html);

    /* ---- التوفّر — من مسار الشراء لا من نصّ #availability وحده ----
       رُصد ٢٠٢٦-٠٨-٠٨: حين لا يوجد عرض إطلاقاً، تعيد أمازون استخدام
       #availability لكتلة جافاسكربت، فيخرج نصّاً بلا كلمة «unavailable»
       والفحص القديم يستنتج "متوفّر". النتيجة أن كرت RTX 5090 بقي معروضاً
       متوفّراً بسعر قديم، والسعر الوحيد في صفحته يخصّ ملحقاً (٢٨١ ﷼).

       الإشارة الموثوقة: هل توجد وسيلة شراء؟ ومع ذلك لا نعلن النفاد إلا إن
       كانت الصفحة مقروءة (فيها عنوان منتج) — صفحةٌ لم نفهمها تُبقي الحالة
       السابقة، وهو الدرس نفسه الذي كلّفنا ٥٦ منتجاً في كازاسوق. */
    const availability = $('#availability').text().toLowerCase();
    const saysUnavailable =
      availability.includes('currently unavailable') ||
      availability.includes('غير متوفر') ||
      availability.includes('لا يتوفر');
    const canBuy = $('#add-to-cart-button').length > 0 || $('#buy-now-button').length > 0;
    const hasPriceBlock =
      $('#corePriceDisplay_desktop_feature_div').length > 0 || $('#corePrice_feature_div').length > 0;
    const isProductPage = $('#productTitle').length > 0;

    if (saysUnavailable) out.inStock = false;
    else if (canBuy) out.inStock = true;
    else if (isProductPage && !hasPriceBlock) out.inStock = false; // صفحة منتج مقروءة بلا أي عرض
    // وإلّا: لم نتعرّف على الصفحة → out.inStock يبقى على قيمته السابقة

    let priceText = $('#corePriceDisplay_desktop_feature_div .a-price-whole').first().text();
    if (!priceText) priceText = $('#corePrice_feature_div .a-price-whole').first().text();
    if (!priceText) priceText = $('.apexPriceToPay .a-offscreen').first().text();
    if (!priceText) priceText = $('#priceblock_ourprice').text();
    if (!priceText) priceText = $('.a-price[data-a-size="xl"] .a-offscreen').first().text();

    /* سعر ما قبل الخصم: السعر المشطوب (List Price) — محصوراً في كتلة السعر */
    const listText =
      $('#corePriceDisplay_desktop_feature_div .basisPrice .a-offscreen').first().text() ||
      $('#corePriceDisplay_desktop_feature_div span[data-a-strike="true"] .a-offscreen').first().text() ||
      $('#corePrice_feature_div span[data-a-strike="true"] .a-offscreen').first().text() ||
      $('#priceblock_listprice').first().text();

    const price = round2(parseMoney(priceText));
    if (price > 0) {
      applyPriceVerdict(out, 'أمازون', t.name, price, round2(parseMoney(listText)), t.price);
    } else if (out.inStock) {
      // النافد لا يعرض سعراً — الإبلاغ عنه كخطأ ضوضاء تُخفي الأعطال الحقيقية
      out.errors.push(`أمازون (${t.name}): لم يتم العثور على سعر صالح.`);
    }
  } catch {
    out.errors.push(`أمازون (${t.name}): تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.`);
  }
  return out;
}

/* ============================ كازاسوق ============================ */
export async function scrapeCazasouq(t: OfferTarget, token: string): Promise<StoreOutcome> {
  const out = emptyOutcome(t.inStock ?? true);
  if (!t.url || t.url.length <= 12) return out;

  try {
    // بروكسي عادي (بلا super) — كازاسوق لا يحتاج حماية متقدمة، فيوفّر الرصيد
    const res = await scrapeFetch(scrapeUrl(token, t.url, false));
    if (!res.ok) {
      out.errors.push(`كازاسوق (${t.name}): ${httpReason(res.status)}`);
      return out;
    }
    const html = await res.text();

    /* صفحة معطّلة/صيانة ليست دليل نفاد — نخرج بلا أن نمسّ حالة التوفّر */
    if (isBrokenPage(html)) {
      out.errors.push(`كازاسوق (${t.name}): صفحة المتجر معطّلة أو تحت الصيانة — أُبقيت الحالة السابقة.`);
      return out;
    }
    const $ = cheerio.load(html);

    /* ---- التوفّر — من كتلة المنتج نفسه فقط ----
       الصفحة تحتوي كاروسيل "منتجات ذات صلة" فيه أزرار "تنبيه بالتوافر"
       لمنتجات نافدة أخرى (رصدناها مرّتين في HTML الخام لمنتج متوفّر).
       الفحص القديم كان يبحث في نص الصفحة كلها فيعلّم المتوفّر نافداً.
       المصدر الموثوق صف التوفّر الخاص بالمنتج:
         <li class="product-stock in-stock">التوفر: <span>1</span></li> */
    const stockRow = $('li.product-stock').first();
    const stockClass = String(stockRow.attr('class') || '');
    const stockText = stockRow.find('span').first().text().trim();
    const stockQty = parseMoney(stockText);

    if (stockClass.includes('out-of-stock')) {
      out.inStock = false;
    } else if (stockClass.includes('in-stock')) {
      out.inStock = stockQty > 0 || !stockText;
    } else if (stockRow.length) {
      out.inStock = stockQty > 0;
    } else {
      // احتياط: زر السلة داخل كتلة المنتج، لا في الكاروسيل
      const cartBtn = $('#button-cart').first();
      out.inStock = cartBtn.length > 0 && !cartBtn.is('[disabled]');
    }

    /* ---- السعر — من كتلة سعر المنتج حصراً ----
       ⚠️ الدرس المكلّف: المحدّدات القديمة (.price-new / .price /
       .product-price) تطابق **المنتجات المجاورة** في الكاروسيل، لا المنتج
       المعروض. فكان السعر المخزَّن سعر منتج آخر، ويتغيّر بتغيّر ترتيب
       الكاروسيل. بنية سعر المنتج المؤكّدة:
         div.product-price-group > div.price-wrapper > div.price-group >
           div.product-price-new  (الحالي)
           div.product-price-old  (قبل الخصم — يظهر عند وجود عرض) */
    const priceScope = $('.price-wrapper, .product-price-group').first();
    const newText = priceScope.find('.product-price-new').first().text();
    const oldText = priceScope.find('.product-price-old').first().text();

    /* بنيتان لا واحدة (رُصدت ٢٠٢٦-٠٨-٠٨):
         عليه خصم  → .product-price-old + .product-price-new
         بلا خصم   → .product-price وحده، ولا وجود لـ new إطلاقاً
       قراءة new فقط كانت تُسقط كل منتج بلا خصم — ٢٥ عرضاً بخطأ معلن،
       وأخرى صامتة أبقت سعراً قديماً بلا تنبيه. الاحتياط داخل النطاق نفسه
       كي لا يعود خطأ الكاروسيل. */
    const plainText = priceScope.find('.product-price').first().text();
    const curText = parseMoney(newText) > 0 ? newText : plainText;

    let price = parseMoney(curText);
    let listPrice = parseMoney(oldText);

    /* ---- العملة ----
       المتجر متعدّد العملات (BHD/SAR/AED...). نحدّدها من نصّ السعر نفسه لا
       من الصفحة كلها. وأُزيلت حيلة "اضرب ×10 إذا كان السعر أقل من ٢٠٪ من
       سعر أمازون" — هي التي حوّلت سعر منتج مجاور (409.09) إلى 4090.9
       فبدا رقماً معقولاً ومرّ. */
    const currencyText = `${curText} ${oldText}`;
    const isBHD = /BHD/i.test(currencyText) || currencyText.includes('د.ب');
    /* الشاهد يُقرأ بالعملة نفسها، فيخضع للتحويل نفسه — وإلا قارنّا ديناراً بريال */
    let witness = jsonLdPrice($);
    if (isBHD) {
      // الدينار البحريني ≈ ١٠ ريالات (المتجر يستخدم هذا التحويل نفسه)
      if (price > 0) price *= 10;
      if (listPrice > 0) listPrice *= 10;
      if (witness != null && witness > 0) witness *= 10;
    }

    price = round2(price);
    listPrice = round2(listPrice);

    if (price > 0) {
      applyPriceVerdict(out, 'كازاسوق', t.name, price, listPrice, t.price, witness);
    } else if (out.inStock) {
      /* غياب السعر مع كون المنتج **متوفّراً** = عطل حقيقي (محدّد مكسور).
         أمّا النافد فلا يعرض سعراً أصلاً — والإبلاغ عنه كخطأ يملأ لوحة
         التنبيهات بضوضاء تُخفي الأعطال الفعلية. */
      out.errors.push(`كازاسوق (${t.name}): لم يتم العثور على سعر في كتلة المنتج (.product-price / .product-price-new).`);
    }
  } catch {
    out.errors.push(`كازاسوق (${t.name}): تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.`);
  }
  return out;
}

/* =========================== مايكرولس =========================== */
export async function scrapeMicroless(t: OfferTarget, token: string): Promise<StoreOutcome> {
  const out = emptyOutcome(t.inStock ?? true);
  if (!t.url || t.url.length <= 12) return out;

  try {
    const res = await scrapeFetch(scrapeUrl(token, t.url, true));
    if (!res.ok) {
      out.errors.push(`مايكروليس (${t.name}): ${httpReason(res.status)}`);
      return out;
    }
    const html = await res.text();

    /* صفحة معطّلة/صيانة ليست دليل نفاد — نخرج بلا أن نمسّ حالة التوفّر */
    if (isBrokenPage(html)) {
      out.errors.push(`مايكروليس (${t.name}): صفحة المتجر معطّلة أو تحت الصيانة — أُبقيت الحالة السابقة.`);
      return out;
    }
    const $ = cheerio.load(html);
    const htmlLower = html.toLowerCase();

    /* ---- التوفّر — من بيانات schema.org أولاً ----
       رُصد ٢٠٢٦-٠٨-٠٨: صفحة مايكروليس السليمة تحتوي «add to cart» و«notify
       me» و«no longer available» **معاً** في قالبها، فالاستدلال بوجود النصّ
       لا يفرّق بين متوفّر ونافد. والنافد يُعلن نفسه صراحة:
         <script type="application/ld+json"> … "availability": ".../OutOfStock"
       فكانت ٥ أقراص نافدة تُحسب متوفّرة وتُسجَّل خطأ "لم نجد سعراً". */
    const ld = jsonLdOffer($);
    const metaAvailability = $('meta[property="product:availability"]').attr('content') || '';
    if (metaAvailability.includes('out of stock') || metaAvailability.includes('oos')) {
      out.inStock = false;
    } else if (ld.inStock != null) {
      out.inStock = ld.inStock;
    } else {
      const hasAddToCart = htmlLower.includes('add to cart') || htmlLower.includes('إضافة إلى العربة');
      out.inStock = !(!hasAddToCart && (htmlLower.includes('notify me') || htmlLower.includes('no longer available')));
    }

    let priceText = $('meta[property="product:price:amount"]').attr('content');
    if (!priceText) {
      priceText = $('.product-details .price, .product-info .amount, .product-price').first().text();
    }

    let price = round2(parseMoney(priceText || ''));

    if (htmlLower.includes('aed') && !htmlLower.includes('sar')) {
      price = round2(price * 1.022);
    }

    if (price > 0) {
      /* سعر ما قبل الخصم لمايكرولس **معطّل** حتى نتحقّق من محدّده: المحاولة
         الأولى (meta[product:original_price] ثم del/.price-was) أنتجت خصماً
         وهمياً ١٠٠٪ من الحالات — 7554.03 لكرت سعره 3042 (‎-60%). وخصمٌ بسعر
         خاطئ أسوأ من لا خصم: يبدو عرضاً حقيقياً ويضلّل المشتري.
         نُمرّر 0 فيسقط acceptListPrice إلى null، وnull يمسح أي قيمة خاطئة
         مخزّنة سابقاً. لإعادة تشغيله: اقرأ بنية DOM لصفحة منتج مخفّض. */
      applyPriceVerdict(out, 'مايكروليس', t.name, price, 0, t.price, ld.price);
    } else if (out.inStock) {
      // النافد لا يعرض سعراً — الإبلاغ عنه كخطأ ضوضاء تُخفي الأعطال الحقيقية
      out.errors.push(`مايكروليس (${t.name}): لم يتم العثور على سعر صالح.`);
    }
  } catch {
    out.errors.push(`مايكروليس (${t.name}): تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.`);
  }
  return out;
}

/**
 * يكتب نقطة سعر واحدة لكل متجر في اليوم (يحدّثها إن تغيّر السعر).
 * يُمرَّر عميل prisma من المسار — الوحدة لا تستورده.
 */
export async function recordPriceHistory(
  db: any,
  componentId: string,
  pricePoints: { store: Store; price: number }[]
) {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  for (const point of pricePoints) {
    const existing = await db.priceHistory.findFirst({
      where: { componentId, store: point.store, recordedAt: { gte: startOfDay } },
      select: { id: true, price: true },
    });

    if (!existing) {
      await db.priceHistory.create({
        data: { componentId, store: point.store, price: round2(point.price) },
      });
    } else if (existing.price !== round2(point.price)) {
      await db.priceHistory.update({
        where: { id: existing.id },
        data: { price: round2(point.price), recordedAt: new Date() },
      });
    }
    // موجود وبنفس السعر → لا شيء (تجنّب كتابة زائدة)
  }
}
