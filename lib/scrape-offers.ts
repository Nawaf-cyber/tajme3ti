/**
 * ============ سحب أسعار قطعة عبر كل متاجرها ============
 *
 * نقطة الدخول الوحيدة للكرون و«تحديث قطعة واحدة». كانت الدالة القديمة
 * تسحب ثلاثة متاجر مكتوبة بأسمائها؛ الآن تدور على عروض القطعة، وكل عرض
 * يُسحب بمحرّك متجره:
 *   native  → محرّك مكتوب بالكود لهذا الـslug (أمازون/كازاسوق/مايكرولس)
 *   auto    → JSON-LD ثم وسوم meta
 *   custom  → محدّدات CSS المحفوظة في صفّ المتجر
 *   off     → لا يُسحب (سعر يدوي)
 * فالمتجر الذي يضيفه الأدمن يدخل دورة التحديث بلا سطر كود.
 */

import {
  round2, isPlausible, acceptListPrice,
  scrapeAmazon, scrapeCazasouq, scrapeMicroless,
  type OfferTarget, type StoreOutcome,
} from './scrape-prices';
import { scrapeGeneric, type GenericStoreConfig } from './scrape-generic';

/** المحرّكات المخصّصة — مرتبطة بالـslug لأنها كُتبت لبنية صفحات بعينها */
const NATIVE: Record<string, (t: OfferTarget, token: string) => Promise<StoreOutcome>> = {
  amazon: scrapeAmazon,
  cazasouq: scrapeCazasouq,
  microless: scrapeMicroless,
};

export type StoreRow = GenericStoreConfig & { id: string };

export type OfferRow = {
  id: string;
  url: string | null;
  price: number | null;
  listPrice: number | null;
  inStock: boolean;
  store: StoreRow;
};

export type OfferResult = {
  offerId: string;
  storeSlug: string;
  storeName: string;
  url: string | null;
  outcome: StoreOutcome;
};

/** يسحب كل عروض القطعة بالتوازي */
export async function scrapeComponentOffers(
  comp: { name: string; offers: OfferRow[] },
  token: string,
): Promise<{ results: OfferResult[]; errors: string[] }> {
  const results = await Promise.all(
    comp.offers.map(async (o): Promise<OfferResult> => {
      const target: OfferTarget = { name: comp.name, url: o.url, price: o.price, inStock: o.inStock };
      const base = { offerId: o.id, storeSlug: o.store.slug, storeName: o.store.name, url: o.url };

      // لا رابط أو السحب موقوف لهذا المتجر → نُبقي القيم كما هي
      if (!o.url || o.store.scrapeMode === 'off') {
        return { ...base, outcome: { price: null, listPrice: undefined, inStock: o.inStock, errors: [] } };
      }

      const native = NATIVE[o.store.slug];
      if (native && o.store.scrapeMode === 'native') {
        return { ...base, outcome: await native(target, token) };
      }

      const g = await scrapeGeneric(o.store, o.url, token);
      const outcome: StoreOutcome = { price: null, listPrice: undefined, inStock: g.inStock, errors: g.errors };

      if (g.price != null && g.price > 0) {
        /* حارس الانحراف يسري على المتاجر الجديدة أيضاً: قفزة تتجاوز ٦٠٪ عن
           آخر سعر معروف تُرفض بدل أن تُخزَّن — نفس الحماية التي كشفت خطأ
           قراءة كازاسوق سابقاً. */
        if (isPlausible(g.price, o.price)) {
          outcome.price = round2(g.price);
          outcome.listPrice = g.listPrice != null ? acceptListPrice(g.listPrice, outcome.price) : null;
        } else {
          outcome.errors.push(
            `${o.store.name} (${comp.name}): سعر مرفوض لانحرافه الشديد (${g.price} مقابل ${o.price} سابقاً).`,
          );
        }
      }
      return { ...base, outcome };
    }),
  );

  return { results, errors: results.flatMap((r) => r.outcome.errors) };
}

export type ResolvedOffers = {
  /** تحديثات جاهزة لكل عرض */
  offerUpdates: { offerId: string; data: Record<string, any> }[];
  lowestPrice: number;
  cheapestStore: string | null;
  cheapestListPrice: number | null;
  discountPct: number;
  restocked: boolean;
  priceDropped: boolean;
  pricePoints: { store: string; price: number }[];
  /** سطر لكل متجر لإشعار ديسكورد */
  lines: { label: string; url: string | null; price: number | null; inStock: boolean }[];
};

/**
 * يحوّل نتائج السحب إلى قيم قابلة للكتابة: أقل سعر، الخصم، وتحديثات العروض.
 * منطق واحد للكرون و«تحديث قطعة واحدة» — فلا يتباعد الحسابان.
 */
export function resolveOfferPrices(
  comp: { price: number; offers: OfferRow[] },
  results: OfferResult[],
): ResolvedOffers {
  const byId = new Map(comp.offers.map((o) => [o.id, o]));

  const offerUpdates: ResolvedOffers['offerUpdates'] = [];
  const pricePoints: { store: string; price: number }[] = [];
  const lines: ResolvedOffers['lines'] = [];
  const candidates: { store: string; price: number; list: number | null }[] = [];

  let restocked = false;

  for (const r of results) {
    const prev = byId.get(r.offerId);
    if (!prev) continue;
    const o = r.outcome;

    // null = لم نحصل على سعر → نُبقي القديم
    const price = o.price != null ? o.price : prev.price;
    // undefined = لم نقرأ الصفحة → نُبقي القديم؛ null = قرأناها ولا خصم
    const listPrice = o.listPrice !== undefined ? o.listPrice : prev.listPrice;

    /* نسجّل أثر كل محاولة — لا النجاح وحده. بلا هذا، العرض النافد أو
       المحظور يبدو "لم يُحدَّث منذ أسبوع" وهو يُفحص كل يوم. */
    const data: Record<string, any> = {
      inStock: o.inStock,
      lastCheckedAt: new Date(),
      lastError: o.errors.length ? o.errors[0].slice(0, 300) : null,
    };
    if (o.price != null) data.price = o.price;
    if (o.listPrice !== undefined) data.listPrice = o.listPrice;
    offerUpdates.push({ offerId: r.offerId, data });

    if (o.inStock && (price ?? 0) > 0) {
      candidates.push({ store: r.storeSlug, price: price!, list: listPrice ?? null });
    }
    if (o.price != null && o.price > 0) pricePoints.push({ store: r.storeSlug, price: o.price });
    if (prev.inStock === false && o.inStock && o.price != null) restocked = true;

    lines.push({ label: r.storeName, url: r.url, price: price ?? null, inStock: o.inStock });
  }

  candidates.sort((a, b) => a.price - b.price);
  const best = candidates[0] || null;
  const lowestPrice = round2(best ? best.price : comp.price);

  /* الخصم يُعلن على المتجر الأرخص فقط — إعلان خصم متجر أغلى بينما نعرض
     سعر متجر آخر يضلّل المستخدم. */
  const cheapestListPrice = best && best.list && best.list > lowestPrice ? best.list : null;
  const discountPct = cheapestListPrice ? Math.round((1 - lowestPrice / cheapestListPrice) * 100) : 0;

  return {
    offerUpdates,
    lowestPrice,
    cheapestStore: best ? best.store : null,
    cheapestListPrice,
    discountPct,
    restocked,
    priceDropped: lowestPrice > 0 && lowestPrice < comp.price,
    pricePoints,
    lines,
  };
}
