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
  if (list > current * 3) return null;        // فارق خرافي = قراءة خاطئة
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

export type Store = 'amazon' | 'cazasouq' | 'microless';

/** القطعة كما نحتاجها للسحب — نوع فضفاض ليقبل مخرجات Prisma مباشرة */
export type ScrapeTarget = {
  id: string;
  name: string;
  price: number;
  amazonUrl?: string | null;
  cazasouqUrl?: string | null;
  microlessUrl?: string | null;
  amazonPrice?: number | null;
  cazasouqPrice?: number | null;
  microlessPrice?: number | null;
  amazonInStock?: boolean | null;
  cazasouqInStock?: boolean | null;
  microlessInStock?: boolean | null;
  amazonListPrice?: number | null;
  cazasouqListPrice?: number | null;
  microlessListPrice?: number | null;
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
export async function scrapeAmazon(comp: ScrapeTarget, token: string): Promise<StoreOutcome> {
  const out = emptyOutcome(comp.amazonInStock ?? true);
  if (!comp.amazonUrl || comp.amazonUrl.length <= 12) return out;

  try {
    const res = await fetchWithTimeout(scrapeUrl(token, comp.amazonUrl, true), { cache: 'no-store' });
    if (!res.ok) {
      out.errors.push(`أمازون (${comp.name}): فشل الاتصال ${res.status}`);
      return out;
    }
    const html = await res.text();
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
      if (isPlausible(price, comp.amazonPrice)) {
        out.price = price;
        out.listPrice = acceptListPrice(round2(parseMoney(listText)), price);
      } else {
        out.errors.push(`أمازون (${comp.name}): سعر مرفوض لانحرافه الشديد (${price} مقابل ${comp.amazonPrice} سابقاً).`);
      }
    } else {
      out.errors.push(`أمازون (${comp.name}): لم يتم العثور على سعر صالح.`);
    }
  } catch {
    out.errors.push(`أمازون (${comp.name}): تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.`);
  }
  return out;
}

/* ============================ كازاسوق ============================ */
export async function scrapeCazasouq(comp: ScrapeTarget, token: string): Promise<StoreOutcome> {
  const out = emptyOutcome(comp.cazasouqInStock ?? true);
  if (!comp.cazasouqUrl || comp.cazasouqUrl.length <= 12) return out;

  try {
    // بروكسي عادي (بلا super) — كازاسوق لا يحتاج حماية متقدمة، فيوفّر الرصيد
    const res = await fetchWithTimeout(scrapeUrl(token, comp.cazasouqUrl, false), { cache: 'no-store' });
    if (!res.ok) {
      out.errors.push(`كازاسوق (${comp.name}): فشل الاتصال ${res.status}`);
      return out;
    }
    const html = await res.text();
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
      if (isPlausible(price, comp.cazasouqPrice)) {
        out.price = price;
        out.listPrice = acceptListPrice(listPrice, price);
      } else {
        out.errors.push(`كازاسوق (${comp.name}): سعر مرفوض لانحرافه الشديد (${price} مقابل ${comp.cazasouqPrice} سابقاً) — تحقّق من بنية الصفحة.`);
      }
    } else {
      // تعذُّر قراءة السعر ليس دليل نفاد — نُبقي نتيجة فحص التوفّر كما هي.
      out.errors.push(`كازاسوق (${comp.name}): لم يتم العثور على سعر في كتلة المنتج (.product-price-new).`);
    }
  } catch {
    out.errors.push(`كازاسوق (${comp.name}): تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.`);
  }
  return out;
}

/* =========================== مايكرولس =========================== */
export async function scrapeMicroless(comp: ScrapeTarget, token: string): Promise<StoreOutcome> {
  const out = emptyOutcome(comp.microlessInStock ?? true);
  if (!comp.microlessUrl || comp.microlessUrl.length <= 12) return out;

  try {
    const res = await fetchWithTimeout(scrapeUrl(token, comp.microlessUrl, true), { cache: 'no-store' });
    if (!res.ok) {
      out.errors.push(`مايكروليس (${comp.name}): فشل الاتصال ${res.status}`);
      return out;
    }
    const html = await res.text();
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

    /* سعر ما قبل الخصم: وسم مخصّص أو سعر مشطوب */
    const listText =
      $('meta[property="product:original_price:amount"]').attr('content') ||
      $('.product-details del, .product-info del, .price-was, .old-price').first().text() ||
      '';

    let price = parseMoney(priceText || '');
    let listPrice = parseMoney(listText);

    if (htmlLower.includes('aed') && !htmlLower.includes('sar')) {
      price = price * 1.022;
      if (listPrice > 0) listPrice = listPrice * 1.022;
    }

    price = round2(price);
    listPrice = round2(listPrice);

    if (price > 0) {
      if (isPlausible(price, comp.microlessPrice)) {
        out.price = price;
        out.listPrice = acceptListPrice(listPrice, price);
      } else {
        out.errors.push(`مايكروليس (${comp.name}): سعر مرفوض لانحرافه الشديد (${price} مقابل ${comp.microlessPrice} سابقاً).`);
      }
    } else {
      out.errors.push(`مايكروليس (${comp.name}): لم يتم العثور على سعر صالح.`);
    }
  } catch {
    out.errors.push(`مايكروليس (${comp.name}): تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.`);
  }
  return out;
}

export type ComponentScrape = {
  amazon: StoreOutcome;
  cazasouq: StoreOutcome;
  microless: StoreOutcome;
  errors: string[];
};

/** يسحب المتاجر الثلاثة للقطعة (بالتوازي) */
export async function scrapeComponent(comp: ScrapeTarget, token: string): Promise<ComponentScrape> {
  const [amazon, cazasouq, microless] = await Promise.all([
    scrapeAmazon(comp, token),
    scrapeCazasouq(comp, token),
    scrapeMicroless(comp, token),
  ]);
  return {
    amazon, cazasouq, microless,
    errors: [...amazon.errors, ...cazasouq.errors, ...microless.errors],
  };
}

export type ResolvedPrices = {
  /** حقول جاهزة لتمريرها إلى prisma.component.update */
  data: Record<string, any>;
  lowestPrice: number;
  /** المتجر الذي جاء منه أقل سعر، أو null إن لم يتوفّر أي متجر */
  cheapestStore: Store | null;
  /** سعر ما قبل الخصم على المتجر الأرخص (إن وُجد) */
  cheapestListPrice: number | null;
  discountPct: number;
  restocked: boolean;
  priceDropped: boolean;
  /** نقاط لسجلّ الأسعار: المتاجر التي قرأنا لها سعراً صالحاً */
  pricePoints: { store: Store; price: number }[];
};

/**
 * يحوّل نتيجة السحب إلى قيم قابلة للكتابة: أقل سعر، الخصم، وحقول التحديث.
 * منطق واحد يستخدمه الكرون و«تحديث قطعة واحدة» — فلا يتباعد الحسابان.
 */
export function resolvePrices(comp: ScrapeTarget, s: ComponentScrape): ResolvedPrices {
  const priceOf = (o: StoreOutcome, prev: number | null | undefined) =>
    o.price != null ? o.price : (prev ?? null);

  const amzPrice = priceOf(s.amazon, comp.amazonPrice);
  const cazaPrice = priceOf(s.cazasouq, comp.cazasouqPrice);
  const micrPrice = priceOf(s.microless, comp.microlessPrice);

  // السعر المعروض يأتي من متجر متوفّر فقط
  const candidates: { store: Store; price: number; list: number | null }[] = [];
  const listOf = (v: number | null | undefined, fallback: number | null | undefined) =>
    (v !== undefined ? v : (fallback ?? null)) ?? null;

  if (s.amazon.inStock && (amzPrice ?? 0) > 0) {
    candidates.push({ store: 'amazon', price: amzPrice!, list: listOf(s.amazon.listPrice, comp.amazonListPrice) });
  }
  if (s.cazasouq.inStock && (cazaPrice ?? 0) > 0) {
    candidates.push({ store: 'cazasouq', price: cazaPrice!, list: listOf(s.cazasouq.listPrice, comp.cazasouqListPrice) });
  }
  if (s.microless.inStock && (micrPrice ?? 0) > 0) {
    candidates.push({ store: 'microless', price: micrPrice!, list: listOf(s.microless.listPrice, comp.microlessListPrice) });
  }

  candidates.sort((a, b) => a.price - b.price);
  const best = candidates[0] || null;
  const lowestPrice = round2(best ? best.price : comp.price);

  /* الخصم يُعلن على المتجر الأرخص فقط — إعلان خصم متجر أغلى بينما نعرض
     سعر متجر آخر يضلّل المستخدم. */
  const cheapestListPrice = best && best.list && best.list > lowestPrice ? best.list : null;
  const discountPct = cheapestListPrice
    ? Math.round((1 - lowestPrice / cheapestListPrice) * 100)
    : 0;

  const restocked =
    (comp.amazonInStock === false && s.amazon.inStock && s.amazon.price != null) ||
    (comp.cazasouqInStock === false && s.cazasouq.inStock && s.cazasouq.price != null) ||
    (comp.microlessInStock === false && s.microless.inStock && s.microless.price != null);

  const priceDropped = lowestPrice > 0 && lowestPrice < comp.price;

  const pricePoints: { store: Store; price: number }[] = [];
  if (s.amazon.price != null && s.amazon.price > 0) pricePoints.push({ store: 'amazon', price: s.amazon.price });
  if (s.cazasouq.price != null && s.cazasouq.price > 0) pricePoints.push({ store: 'cazasouq', price: s.cazasouq.price });
  if (s.microless.price != null && s.microless.price > 0) pricePoints.push({ store: 'microless', price: s.microless.price });

  const data: Record<string, any> = {
    amazonPrice: s.amazon.price != null ? s.amazon.price : comp.amazonPrice,
    // 170 قيمة شاذة قديمة كانت تُخزَّن لكازاسوق — ننظّفها عند أول لقاء
    cazasouqPrice: s.cazasouq.price != null ? s.cazasouq.price : (comp.cazasouqPrice === 170 ? null : comp.cazasouqPrice),
    microlessPrice: s.microless.price != null ? s.microless.price : comp.microlessPrice,
    amazonInStock: s.amazon.inStock,
    cazasouqInStock: s.cazasouq.inStock,
    microlessInStock: s.microless.inStock,
    price: lowestPrice,
  };
  // undefined = لم نقرأ الصفحة فنُبقي القديم؛ null = قرأناها ولا خصم
  if (s.amazon.listPrice !== undefined) data.amazonListPrice = s.amazon.listPrice;
  if (s.cazasouq.listPrice !== undefined) data.cazasouqListPrice = s.cazasouq.listPrice;
  if (s.microless.listPrice !== undefined) data.microlessListPrice = s.microless.listPrice;

  return {
    data, lowestPrice,
    cheapestStore: best ? best.store : null,
    cheapestListPrice, discountPct, restocked, priceDropped, pricePoints,
  };
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
