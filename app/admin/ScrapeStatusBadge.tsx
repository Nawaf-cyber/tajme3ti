'use client';

/**
 * حالة آخر فحص للقطعة — يفرّق بين ثلاث حالات كانت تبدو واحدة:
 *   ✓ فُحصت وقرأنا سعراً
 *   ⏸ فُحصت ولا سعر (نافدة) — ليست عطلاً
 *   ⚠ فُحصت وفشلت القراءة (حظر/محدّد مكسور) — هنا العطل الحقيقي
 *   ⏳ لم تُفحص بعد
 *
 * قبل هذا كان الدليل الوحيد هو سجلّ الأسعار، وهو يسجّل النجاح فقط — فبدت
 * القطع النافدة "متوقّفة عن التحديث" وهي تُفحص يومياً.
 */

type OfferLike = {
  lastCheckedAt?: string | Date | null;
  lastError?: string | null;
  price?: number | null;
  inStock?: boolean;
  url?: string | null;
  store?: { name: string };
};

export const since = (d?: string | Date | null): string => {
  if (!d) return 'لم تُفحص';
  const h = (Date.now() - new Date(d).getTime()) / 3600000;
  if (h < 1) return 'قبل دقائق';
  if (h < 24) return `قبل ${Math.round(h)} ساعة`;
  return `قبل ${Math.round(h / 24)} يوم`;
};

/** متأخّرة = لم تُفحص إطلاقاً أو مضى على فحصها أكثر من يوم */
export const isStale = (lastScrapedAt?: string | Date | null): boolean =>
  !lastScrapedAt || Date.now() - new Date(lastScrapedAt).getTime() > 24 * 3600000;

export default function ScrapeStatusBadge({
  lastScrapedAt,
  offers = [],
}: {
  lastScrapedAt?: string | Date | null;
  offers?: OfferLike[];
}) {
  const linked = offers.filter((o) => o.url);
  const failed = linked.filter((o) => o.lastError);
  const stale = isStale(lastScrapedAt);

  let cls = 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
  let icon = '✓';
  let text = since(lastScrapedAt);

  if (!lastScrapedAt) {
    cls = 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';
    icon = '⏳';
    text = 'لم تُفحص';
  } else if (failed.length) {
    cls = 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30';
    icon = '⚠';
    text = `${failed.length} متجر فشل · ${since(lastScrapedAt)}`;
  } else if (stale) {
    cls = 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
    icon = '⏸';
    text = since(lastScrapedAt);
  }

  // تفصيل كل متجر في tooltip — يغني عن فتح القاعدة لمعرفة السبب
  const detail = linked
    .map((o) => {
      const n = o.store?.name || '';
      if (o.lastError) return `${n}: ${o.lastError}`;
      if (!o.inStock) return `${n}: نافد`;
      return `${n}: ${o.price ?? '—'}`;
    })
    .join('\n');

  return (
    <span
      title={detail || 'لا روابط متاجر'}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black align-middle ${cls}`}
    >
      {icon} {text}
    </span>
  );
}
