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

/* ملاحظة: cheapestOffer و componentDiscount كانتا هنا وتقرآن أعمدة
   المتاجر الثلاثة بأسمائها. انتقلتا إلى lib/stores.ts (cheapestOffer/offerDeal)
   تعملان على العروض، فتشملان أي متجر يُضاف. حُذفتا هنا كي لا يستوردهما أحد
   فيحصل على بيانات مجمّدة بلا أن يلاحظ. */
