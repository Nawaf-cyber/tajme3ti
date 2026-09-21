'use client';

/**
 * حالة آخر فحص للقطعة — يفرّق بين حالاتٍ كانت تبدو واحدة:
 *   ✓ فُحصت وقرأنا سعراً
 *   ⏸ فُحصت ولا سعر (نافدة) — ليست عطلاً
 *   ⚠ فُحصت وفشلت القراءة (حظر/محدّد مكسور) — هنا العطل الحقيقي
 *   ⏳ لم تُفحص بعد
 *   🕰 فُحصت للتوّ، و**السعر المعروض** قديم — انظر أدناه
 *
 * قبل هذا كان الدليل الوحيد هو سجلّ الأسعار، وهو يسجّل النجاح فقط — فبدت
 * القطع النافدة "متوقّفة عن التحديث" وهي تُفحص يومياً.
 *
 * ============ ولماذا رقمان لا رقم ============
 *
 * ⚠️ قِيس 2026-09-21 على «RTX 5070 Ti 16GB»: الإدارة تقول «قبل دقائق»
 * وصفحةُ القطعة تقول «قبل ٢٨ يوماً» — **وكلاهما صادق**. الكرون مرّ فعلاً
 * وفحص مايكرولس وكازاسوق وأمازون، لكنّ السعر المعروض من **نون** — وهو
 * `scrapeMode: 'off'` (محجوب بـAkamai) وأسعارُه تُكتب يداً.
 *
 * فـ`lastScrapedAt` تجيب «هل وصلها الكرون؟»، و`priceAsOf` تجيب «كم عمر
 * الرقم الذي يراه الزائر؟». وهما سؤالان، والثاني هو الذي يحتاجه الأدمن
 * ليعرف أيَّ سعرٍ يدويٍّ يذهب فيصحّحه — وكانت المنارة تخفيه عنه.
 *
 * ⚠️ والحساب بـ`priceAsOf` نفسها التي تستعملها صفحة القطعة، لا بنسخةٍ
 * هنا: نسختان تتباعدان فيعود التعارض من بابٍ آخر.
 *
 * قِيس: ٨ قطعٍ من ٣٥٣ فيها هذا الفرق، والفائز في **ثمانيتها** نون.
 */

import { priceAsOf } from '../../lib/stores';

type OfferLike = {
  lastCheckedAt?: string | Date | null;
  lastError?: string | null;
  price?: number | null;
  inStock?: boolean;
  url?: string | null;
  store?: { name: string };
};

const hoursSince = (d?: string | Date | null): number | null =>
  d ? (Date.now() - new Date(d).getTime()) / 3600000 : null;

/**
 * عمرُ السعر المعروض للزائر — لا عمرُ آخر محاولة.
 *
 * ⚠️ ويقبل شكل القطعة كما تأتي من `OFFER_INCLUDE`، فلا يحتاج المستدعي
 * أن يتذكّر تمرير شيءٍ ثانٍ — ونسيانُه كان سيُعيد العطل صامتاً.
 */
export const shownPriceAge = (comp: {
  lastScrapedAt?: string | Date | null;
  offers?: any[] | null;
}): number | null => hoursSince(priceAsOf(comp as any));

export const since = (d?: string | Date | null): string => {
  if (!d) return 'لم تُفحص';
  const h = (Date.now() - new Date(d).getTime()) / 3600000;
  if (h < 1) return 'قبل دقائق';
  if (h < 24) return `قبل ${Math.round(h)} ساعة`;
  return `قبل ${Math.round(h / 24)} يوم`;
};

/**
 * متأخّرة = لم تُفحص إطلاقاً، أو مضى على فحصها أكثر من يوم، أو **السعر
 * المعروض** أقدم من يوم.
 *
 * ⚠️ والثالثة هي المضافة: مرشّح «المتأخّرة» كان يُخفي القطع الثماني
 * المعلّقة على سعرٍ يدويٍّ عمرُه ٢٨ يوماً — لأنّ الكرون يمرّ عليها كلَّ
 * يوم فتبدو سليمة. وهي أحوج ما في اللوحة إلى مراجعة.
 */
export const isStale = (comp: {
  lastScrapedAt?: string | Date | null;
  offers?: any[] | null;
}): boolean => {
  if (!comp.lastScrapedAt) return true;
  if (Date.now() - new Date(comp.lastScrapedAt).getTime() > 24 * 3600000) return true;
  const shown = shownPriceAge(comp);
  return shown != null && shown > 24;
};

export default function ScrapeStatusBadge({
  lastScrapedAt,
  offers = [],
}: {
  lastScrapedAt?: string | Date | null;
  offers?: OfferLike[];
}) {
  const linked = offers.filter((o) => o.url);
  const failed = linked.filter((o) => o.lastError);

  const scrapedH = hoursSince(lastScrapedAt);
  const shownH = shownPriceAge({ lastScrapedAt, offers });
  /* ⚠️ الفرقُ شرطٌ ثانٍ لا مجرّد قِدَم: قطعةٌ لم يمرّ عليها الكرون منذ
     يومين سعرُها المعروض قديمٌ بالضرورة — وتلك حالة «متأخّرة» المعروفة.
     والمقصود هنا ما يخدع: فُحصت للتوّ وسعرُها المعروض قديم. */
  const shownIsOld =
    shownH != null && shownH > 24 && scrapedH != null && shownH - scrapedH >= 12;

  const stale = isStale({ lastScrapedAt, offers });

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
  } else if (shownIsOld) {
    /* السعر المعروض هو ما يراه الزائر — فهو الرقم الذي يُعلن */
    cls = shownH! > 24 * 7
      ? 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30'
      : 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
    icon = '🕰';
    text = `السعر المعروض ${since(priceAsOf({ lastScrapedAt, offers } as any))}`;
  } else if (stale) {
    cls = 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
    icon = '⏸';
    text = since(lastScrapedAt);
  }

  // تفصيل كل متجر في tooltip — يغني عن فتح القاعدة لمعرفة السبب
  const detail = [
    ...(shownIsOld ? [`آخر فحصٍ للقطعة: ${since(lastScrapedAt)}`, ''] : []),
    ...linked.map((o) => {
      const n = o.store?.name || '';
      if (o.lastError) return `${n}: ${o.lastError}`;
      if (!o.inStock) return `${n}: نافد`;
      return `${n}: ${o.price ?? '—'} · ${since(o.lastCheckedAt)}`;
    }),
  ].join('\n');

  return (
    <span
      title={detail || 'لا روابط متاجر'}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black align-middle ${cls}`}
    >
      {icon} {text}
    </span>
  );
}
