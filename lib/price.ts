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

/* ============ انخفاض السعر — عتبة العرض ============
 * ٣٪ فأكثر: أقل من ذلك تذبذبُ ضريبة أو تقريب، وإعلانه "تخفيضاً" يُفقد
 * القسم مصداقيته. والسقف نفسه سقفُ الخصم المعقول (٥٠٪) — ما فوقه خطأ قراءة.
 */
export const MIN_DROP_PERCENT = 3;

export const dropPercent = (
  previous: number | null | undefined,
  current: number | null | undefined,
): number => {
  if (!previous || !current || previous <= current) return 0;
  const pct = Math.round((1 - current / previous) * 100);
  if (pct < MIN_DROP_PERCENT || pct > MAX_PLAUSIBLE_DISCOUNT) return 0;
  return pct;
};

/* ============ حكم تغيّر السعر ============
 *
 * ثلاثة أحكام لا اثنان:
 *   ok     → يُطبَّق فوراً
 *   hold   → يُعلَّق للمراجعة، ويبقى القديم معروضاً حتى يقرّر الأدمن
 *   reject → يُرفض بلا سؤال (هبوطٌ شديد لا يكون إلا خطأ قراءة)
 *
 * ---- لماذا حدّان معاً لا حدّ واحد ----
 * الاعتماد على النسبة وحدها يُغرق اللوحة بأسئلة تافهة ويُسكت عن الجادّ:
 *   مبرّد ٦٠ → ٩٠ ريال    = ‎+٥٠٪ لكنها ٣٠ ريالاً — لا تستحقّ وقتك
 *   كرت ١٦٬٩٠٠ → ٢٠٬٠٠٠   = ‎+١٨٪ لكنها ٣٬١٠٠ ريال — حركة سوق معتادة لهذه الفئة
 * والاعتماد على المبلغ وحده يُعلّق كل قطعة غالية عند أي حركة طبيعية.
 * فالشرط أن يتجاوز الارتفاع الحدّين **معاً**: نسبةً كبيرة **و** مبلغاً يُشعر
 * به المشتري. عندها فقط يكون السؤال مستحقّاً.
 *
 * ---- الهبوط ----
 * يبقى رفضاً صامتاً كما كان: عرضُ سعرٍ أقلّ من الحقيقة يجرّ المشتري إلى
 * خيبة عند المتجر، والخطأ في هذا الاتجاه أشدّ ضرراً من تفويت تخفيض.
 */
export const SPIKE_MIN_PERCENT = 40;   // نسبة الارتفاع
export const SPIKE_MIN_AMOUNT = 200;   // ومقداره بالريال
/** ما دون هذه النسبة من السعر السابق = خطأ قراءة لا هبوط */
export const IMPLAUSIBLE_DROP_RATIO = 0.4;

export type PriceVerdict = 'ok' | 'hold' | 'reject';

export const classifyPriceChange = (
  next: number | null | undefined,
  previous: number | null | undefined,
): PriceVerdict => {
  if (!next || next <= 0) return 'reject';
  if (!previous || previous <= 0) return 'ok'; // لا مرجع نقيس عليه
  if (next / previous < IMPLAUSIBLE_DROP_RATIO) return 'reject';

  const rise = next - previous;
  if (rise <= 0) return 'ok';
  const risePct = (rise / previous) * 100;
  return risePct >= SPIKE_MIN_PERCENT && rise >= SPIKE_MIN_AMOUNT ? 'hold' : 'ok';
};

/** نسبة الارتفاع صحيحةً — للعرض في اللوحة */
export const risePercent = (previous: number, next: number): number =>
  previous > 0 ? Math.round(((next - previous) / previous) * 100) : 0;
