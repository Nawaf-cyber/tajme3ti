/* ============ موضع السعر من تاريخه — الحساب وحده ============
 *
 * الحساب هنا بلا قاعدة بيانات، والجلبُ في lib/price-stats (يستورد prisma).
 * فُصلا لأنّ قائمة المتاجر (components/StoreOfferList) صارت تُعرض في نافذة
 * تفاصيل الباني أيضاً — وهو مكوّن عميل، ومن استورد price-stats منه سحب prisma
 * إلى المتصفّح. وlib/price-stats يعيد تصدير ما هنا، فلا نسختان.
 *
 * ⚠️ والحساب من المتاجر التي تبيع القطعة **الآن** وحدها، لا من كلّ ما في
 * السجلّ. والسبب مقيسٌ على RTX 5070 Ti: كازاسوق يسجّل ٣٩٥٠ يوميّاً وهو
 * نافد، وأرخصُ ما يُشترى فعلاً ٥٢٩٠. فحسابُ الجميع يقول «أدنى ما بلغه
 * ٣٧٠٨» لسعرٍ لا يبيعه أحد.
 *
 * وهو تقريبٌ لا يقين: قد ينفد متجرٌ في يومٍ ماضٍ ولا نعلم. لكنّه رقمٌ
 * يقابله زرُّ شراء.
 */

export type HistoryRow = { store: string; price: number; recordedAt: Date };

export type PriceStats = {
  /** أدنى وأعلى ما بلغه في المدّة — من المتاجر البائعة الآن */
  min: number;
  max: number;
  /** عدد الأيّام التي رُصد فيها سعر — لا عدد القراءات */
  days: number;
  /** أوّل يومٍ وآخرُه بصيغة YYYY-MM-DD */
  from: string;
  to: string;
  /** سعرُ أوّل يومٍ مرصود وآخرِه — الفرق بينهما هو «التغيّر خلال الفترة» */
  first: number;
  last: number;
};

/**
 * سلسلةٌ يوميّة واحدة: أرخصُ سعرٍ في كلّ يومٍ بين المتاجر البائعة الآن.
 *
 * ⚠️ ونقطةٌ واحدة لكلّ يوم: الساحب يقرأ عدّة مرّاتٍ يوميّاً، وعدُّ القراءات
 * يجعل قطعةً سُحبت كثيراً تبدو أطولَ رصداً من غيرها.
 */
export function liveStats(rows: HistoryRow[], liveStores: string[]): PriceStats | null {
  const live = new Set(liveStores);
  const daily = new Map<string, number>();
  for (const r of rows) {
    if (!live.has(r.store)) continue;
    if (!(r.price > 0)) continue;
    const day = r.recordedAt.toISOString().slice(0, 10);
    const cur = daily.get(day);
    if (cur == null || r.price < cur) daily.set(day, r.price);
  }
  if (daily.size < 2) return null;

  const keys = [...daily.keys()].sort();
  const prices = keys.map((k) => daily.get(k)!);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    days: keys.length,
    from: keys[0],
    to: keys[keys.length - 1],
    first: prices[0],
    last: prices[prices.length - 1],
  };
}

/**
 * كم يزيد سعرُ اليوم عن أدنى ما رُصد — بالنسبة المئويّة.
 *
 * ⚠️ ويُقاس من الأدنى لا من المتوسّط: المشتري يسأل «هل فاتتني صفقة؟» لا
 * «هل هذا سعرٌ وسط؟». والصفرُ يعني أنّه عند أدنى ما رأيناه — وتلك أنفع
 * جملةٍ يمكن أن تُقال له.
 */
export const pctAboveMin = (now: number, min: number): number =>
  min > 0 ? Math.round(((now - min) / min) * 100) : 0;
