/* ============ متى يكون سعر القطعة «متأخّراً»؟ — تعريفٌ واحد ============
 *
 * كان في app/admin/ScrapeStatusBadge.tsx، وهو ملفّ 'use client': مسار الخادم
 * لا يستطيع استدعاء دالّةٍ منه (تصير مرجعَ عميل). وزرّ «حدّث المتأخّرة فقط»
 * (2026-10-17) يحتاج التعريف نفسه في الخادم ليختار القطع — فنُقل إلى هنا،
 * والشارة تستورده. نسختان كانتا ستعطيان رقمين: اللوحة تقول «٧٢ متأخّرة»
 * والزرّ يحدّث ستّين.
 */

import { priceAsOf, cheapestOffer } from './stores';

type WithScrape = {
  lastScrapedAt?: string | Date | null;
  offers?: any[] | null;
};

const hoursSince = (d?: string | Date | null): number | null =>
  d ? (Date.now() - new Date(d).getTime()) / 3600000 : null;

/**
 * عمرُ السعر المعروض للزائر — لا عمرُ آخر محاولة.
 *
 * ⚠️ ويقبل شكل القطعة كما تأتي من `OFFER_INCLUDE`، فلا يحتاج المستدعي
 * أن يتذكّر تمرير شيءٍ ثانٍ — ونسيانُه كان سيُعيد العطل صامتاً.
 */
export const shownPriceAge = (comp: WithScrape): number | null => hoursSince(priceAsOf(comp as any));

/**
 * متأخّرة = لم تُفحص إطلاقاً، أو مضى على فحصها أكثر من يوم، أو **السعر
 * المعروض** أقدم من يوم.
 *
 * ⚠️ والثالثة هي المضافة: مرشّح «المتأخّرة» كان يُخفي القطع الثماني
 * المعلّقة على سعرٍ يدويٍّ عمرُه ٢٨ يوماً — لأنّ الكرون يمرّ عليها كلَّ
 * يوم فتبدو سليمة. وهي أحوج ما في اللوحة إلى مراجعة.
 */
export const isStale = (comp: WithScrape): boolean => {
  if (!comp.lastScrapedAt) return true;
  if (Date.now() - new Date(comp.lastScrapedAt).getTime() > 24 * 3600000) return true;
  const shown = shownPriceAge(comp);
  return shown != null && shown > 24;
};

/**
 * هل يصلح السحبُ تأخّرَ هذه القطعة؟ — لزرّ «حدّث المتأخّرة فقط» ولعدّاده.
 *
 * لا، في حالتين:
 * • لا يبيعها متجرٌ يُسحب (برابطٍ في متجرٍ سحبُه غير موقوف) — نون مثلاً: سعرُه يدويّ.
 * • سُحبت خلال يوم، وتأخّرُها من سعرٍ فائزٍ يدويّ: سحبُها ثانيةً لا يغيّره.
 * فهذه تُصحَّح يداً، وعدُّها في الزرّ وعدٌ لا يفي به (قيس 2026-10-17: خمسٌ من
 * ٧٢، كلّها لا يبيعها إلّا نون).
 *
 * ⚠️ القطعة كما تأتي من OFFER_INCLUDE (المتاجر المفعّلة وحدها، و`store.scrapeMode`).
 */
export const fixableByScrape = (comp: WithScrape): boolean => {
  const offers = comp.offers || [];
  const scrapable = offers.some(
    (o: any) => typeof o.url === 'string' && o.url.includes('http') && o.store?.scrapeMode !== 'off',
  );
  if (!scrapable) return false;
  const fresh = !!comp.lastScrapedAt && Date.now() - new Date(comp.lastScrapedAt).getTime() < 24 * 3600000;
  return !(fresh && cheapestOffer(offers as any)?.store?.scrapeMode === 'off');
};
