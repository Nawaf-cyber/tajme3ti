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
    let res = await fetchWithTimeout(url, { cache: 'no-store' }, timeout);
    if (res.status === 429) {
      await sleep(2000 + Math.floor(Math.random() * 1000)); // تشتيت لتفادي الارتطام
      res = await fetchWithTimeout(url, { cache: 'no-store' }, timeout);
    }
    return res;
  } finally {
    releaseSlot();
  }
}

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
};

const emptyOutcome = (inStock: boolean): StoreOutcome => ({
  price: null, listPrice: undefined, inStock, errors: [],
});

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

    const availability = $('#availability').text().toLowerCase();
    out.inStock = !(
      availability.includes('currently unavailable') ||
      availability.includes('غير متوفر') ||
      availability.includes('لا يتوفر')
    );

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
      if (isPlausible(price, t.price)) {
        out.price = price;
        out.listPrice = acceptListPrice(round2(parseMoney(listText)), price);
      } else {
        out.errors.push(`أمازون (${t.name}): سعر مرفوض لانحرافه الشديد (${price} مقابل ${t.price} سابقاً).`);
      }
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
    const curText = priceScope.find('.product-price-new').first().text();
    const oldText = priceScope.find('.product-price-old').first().text();

    let price = parseMoney(curText);
    let listPrice = parseMoney(oldText);

    /* ---- العملة ----
       المتجر متعدّد العملات (BHD/SAR/AED...). نحدّدها من نصّ السعر نفسه لا
       من الصفحة كلها. وأُزيلت حيلة "اضرب ×10 إذا كان السعر أقل من ٢٠٪ من
       سعر أمازون" — هي التي حوّلت سعر منتج مجاور (409.09) إلى 4090.9
       فبدا رقماً معقولاً ومرّ. */
    const currencyText = `${curText} ${oldText}`;
    const isBHD = /BHD/i.test(currencyText) || currencyText.includes('د.ب');
    if (isBHD) {
      // الدينار البحريني ≈ ١٠ ريالات (المتجر يستخدم هذا التحويل نفسه)
      if (price > 0) price *= 10;
      if (listPrice > 0) listPrice *= 10;
    }

    price = round2(price);
    listPrice = round2(listPrice);

    if (price > 0) {
      if (isPlausible(price, t.price)) {
        out.price = price;
        out.listPrice = acceptListPrice(listPrice, price);
      } else {
        out.errors.push(`كازاسوق (${t.name}): سعر مرفوض لانحرافه الشديد (${price} مقابل ${t.price} سابقاً) — تحقّق من بنية الصفحة.`);
      }
    } else if (out.inStock) {
      /* غياب السعر مع كون المنتج **متوفّراً** = عطل حقيقي (محدّد مكسور).
         أمّا النافد فلا يعرض سعراً أصلاً — والإبلاغ عنه كخطأ يملأ لوحة
         التنبيهات بضوضاء تُخفي الأعطال الفعلية. */
      out.errors.push(`كازاسوق (${t.name}): لم يتم العثور على سعر في كتلة المنتج (.product-price-new).`);
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

    const metaAvailability = $('meta[property="product:availability"]').attr('content') || '';
    if (metaAvailability.includes('out of stock') || metaAvailability.includes('oos')) {
      out.inStock = false;
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
      if (isPlausible(price, t.price)) {
        out.price = price;
        /* ⚠️ سعر ما قبل الخصم لمايكرولس **معطّل** حتى نتحقّق من محدّده.
           المحاولة الأولى (meta[product:original_price] ثم del/.price-was)
           أنتجت خصماً وهمياً ١٠٠٪ من الحالات: 7554.03 لكرت سعره 3042 (‎-60%).
           والمبدأ نفسه المطبَّق على معامل عمولة مايكرولس ينطبق هنا:
           خصم بسعر خاطئ أسوأ من لا خصم — يبدو عرضاً حقيقياً ويضلّل المشتري.
           لإعادة تشغيله: افتح صفحة منتج مخفّض على مايكرولس، اقرأ بنية DOM
           الفعلية، ثم أعد المحدّد المؤكّد هنا.
           null (لا undefined) عن قصد: يمسح أي قيمة خاطئة مخزّنة سابقاً. */
        out.listPrice = null;
      } else {
        out.errors.push(`مايكروليس (${t.name}): سعر مرفوض لانحرافه الشديد (${price} مقابل ${t.price} سابقاً).`);
      }
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
