/**
 * رقائق الشراء المدمجة — صفحة تجميعاتي وصفحة التجميعة المشتركة.
 *
 * كانت في كل صفحة ثلاث كتل، لكل متجر لونه المكتوب يدوياً (bg-[#232F3E]…)
 * وبألوان متضاربة بين الصفحتين (كازاسوق برتقالي هنا، بنفسجي هناك).
 * الآن لون واحد لكل متجر مصدره جدول Store، عبر متغيّر CSS.
 *
 * ============ ولماذا صار السعر على كل شارة ============
 *
 * كانت الشارة تقول «Amazon» و«Microless» ولا تقول بكم. والموقع كلُّه قائمٌ
 * على مقارنة الأسعار، فإخفاؤها هنا يجبر الزائر على فتح كل رابطٍ ليعرف —
 * أي أن الشارات تعرض **أين** يشتري ولا تعرض **من أين يوفّر**.
 *
 * والأرخص مُعلَّمٌ صراحةً: `liveOffers` تُرتّب تصاعدياً بالسعر، فالأول هو
 * الأرخص بحكم الترتيب لا بحسابٍ إضافيّ يتباعد عنه.
 *
 * ⚠️ ويُعلَّم بحلقةٍ خضراء لا بكلمة «الأرخص»: الشارة عرضها عشر بكسلات من
 * النصّ، وكلمةٌ إضافية تدفع الشارات إلى سطرٍ ثانٍ في كل صفّ. واللون
 * الأخضر هو لون السعر في الموقع كلّه، فالحلقة تُقرأ بلا شرح.
 */

import { buildStoreUrl, storeLinkProps } from '../lib/affiliate';
import { liveOffers, storeVars, type Offer } from '../lib/stores';
import { formatPrice } from '../lib/price';

export default function StoreBuyChips({
  offers,
  solid = false,
  /** إخفاء السعر حين يكون معروضاً بجانب الشارات أصلاً */
  showPrice = true,
}: {
  offers?: Offer[] | null;
  /** true = رقاقة مصمتة بلون المتجر · false = خفيفة بحدود ملوّنة */
  solid?: boolean;
  showPrice?: boolean;
}) {
  const rows = liveOffers(offers);
  if (rows.length === 0) return null;

  /* أرخص من واحد لا معنى لتعليمه: التعليم يقول «هذا أفضل من غيره»،
     ولا غيرَ حين يكون المتجر وحيداً. */
  const markCheapest = rows.length > 1;

  return (
    <>
      {rows.map((o, i) => {
        const cheapest = markCheapest && i === 0;
        return (
          <a
            key={o.storeId}
            href={buildStoreUrl(o.store, o.url, o.affiliateUrl)}
            {...storeLinkProps(o.store)}
            title={cheapest ? `${o.store.latinName} — الأرخص` : o.store.latinName}
            style={{
              ...storeVars(o.store.color),
              ...(solid ? { backgroundColor: 'var(--store-color)' } : {}),
            }}
            className={
              (solid
                ? 'flex items-center gap-1.5 px-2.5 py-1.5 text-white text-[10px] rounded-full font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:brightness-110'
                : 'flex items-center gap-1.5 px-2.5 py-1 bg-[var(--store-tint)] hover:bg-[var(--store-soft)] text-[color:var(--store-color)] text-[10px] rounded border border-[var(--store-soft)] font-bold transition-colors') +
              (cheapest ? ' ring-2 ring-emerald-400 dark:ring-emerald-500' : '')
            }
          >
            <span>{o.store.latinName}</span>

            {showPrice && (
              /* dir=ltr على الرقم: العربية تقلب ترتيب «1,234.5» بلا ذلك.
                 و tabular-nums تجعل الأرقام متساوية العرض فتصطفّ الشارات. */
              <span
                dir="ltr"
                className={
                  'tabular-nums font-black rounded px-1 ' +
                  (solid ? 'bg-white/20' : 'bg-[var(--store-soft)]')
                }
              >
                {formatPrice(o.price)}
              </span>
            )}

            <svg className="w-2.5 h-2.5 opacity-70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        );
      })}
    </>
  );
}
