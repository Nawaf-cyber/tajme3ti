/**
 * ============ تنسيق الأسعار — مصدر واحد للحقيقة ============
 *
 * السبب: القيم المخزّنة قد تحمل ذيل الفاصلة العائمة الناتج عن تحويل العملة
 * في السحب (مثال حقيقي: 409.09 × 10 = 4090.8999999999996)، فكانت تُعرض
 * في صفحة المنتج كما هي. التدوير في السحب يمنع الجديد، وهذه الدالة تحمي
 * العرض من أي قيمة قديمة باقية في القاعدة.
 */

/** رقم السعر مدوّراً لمنزلتين، بلا أصفار زائدة: 4090.8999→"4,090.9" */
export const formatPrice = (value: number | null | undefined): string => {
  if (value == null || !Number.isFinite(value)) return '---';
  const rounded = Math.round(value * 100) / 100;
  return rounded.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

/** نسبة الخصم صحيحةً، أو 0 إن لم يوجد خصم معتبر */
/** أقصى خصم نعتبره حقيقياً — ما فوقه خطأ قراءة لا عرض */
export const MAX_PLAUSIBLE_DISCOUNT = 50;

export const discountPercent = (
  current: number | null | undefined,
  listPrice: number | null | undefined
): number => {
  if (!current || !listPrice) return 0;
  if (!(listPrice > current)) return 0;
  const pct = Math.round((1 - current / listPrice) * 100);
  // أقل من ٣٪ لا يستحق وسم "خصم" — قد يكون فرق تقريب أو ضريبة
  if (pct < 3) return 0;
  /* سقف المعقولية: خصومات قطع الحاسب الحقيقية ٥–٤٠٪. أي رقم فوق ٥٠٪
     صادفناه كان خطأ محدّد في السحب (مثال حقيقي: 7554.03 لكرت بـ3042
     = ‎-60%). نحجبه هنا أيضاً لا في السحب وحده، كي تتوقّف أي قيمة خاطئة
     مخزّنة عن الظهور فوراً بلا انتظار دورة سحب جديدة. */
  if (pct > MAX_PLAUSIBLE_DISCOUNT) return 0;
  return pct;
};

/** أقل سعر متوفّر مع سعره قبل الخصم — يُستخدم لعرض الشارة على السعر المعروض */
export type StorePrice = {
  price: number | null | undefined;
  listPrice: number | null | undefined;
  inStock: boolean | null | undefined;
};

export const cheapestOffer = (offers: StorePrice[]) => {
  const live = offers.filter(o => (o.price ?? 0) > 0 && o.inStock !== false);
  if (!live.length) return null;
  return live.reduce((best, o) => ((o.price as number) < (best.price as number) ? o : best));
};

/**
 * خصم القطعة — يُحسب على **المتجر الأرخص المتوفّر فقط**.
 * إعلان خصم متجر أغلى بينما نعرض سعر متجر آخر يضلّل المستخدم.
 *
 * مصدر واحد تستخدمه صفحة التصفّح وصفحة المنتج، فلا يتباعد الحسابان.
 */
export type DiscountInfo = { pct: number; listPrice: number | null };

export const componentDiscount = (comp: {
  amazonPrice?: number | null; amazonListPrice?: number | null; amazonInStock?: boolean | null;
  cazasouqPrice?: number | null; cazasouqListPrice?: number | null; cazasouqInStock?: boolean | null;
  microlessPrice?: number | null; microlessListPrice?: number | null; microlessInStock?: boolean | null;
}): DiscountInfo => {
  const best = cheapestOffer([
    { price: comp.amazonPrice, listPrice: comp.amazonListPrice, inStock: comp.amazonInStock },
    { price: comp.cazasouqPrice, listPrice: comp.cazasouqListPrice, inStock: comp.cazasouqInStock },
    { price: comp.microlessPrice, listPrice: comp.microlessListPrice, inStock: comp.microlessInStock },
  ]);
  if (!best) return { pct: 0, listPrice: null };
  const pct = discountPercent(best.price, best.listPrice);
  return { pct, listPrice: pct > 0 ? (best.listPrice ?? null) : null };
};
