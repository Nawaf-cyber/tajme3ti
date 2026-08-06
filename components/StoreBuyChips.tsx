/**
 * رقائق الشراء المدمجة — صفحة تجميعاتي وصفحة التجميعة المشتركة.
 *
 * كانت في كل صفحة ثلاث كتل، لكل متجر لونه المكتوب يدوياً (bg-[#232F3E]…)
 * وبألوان متضاربة بين الصفحتين (كازاسوق برتقالي هنا، بنفسجي هناك).
 * الآن لون واحد لكل متجر مصدره جدول Store، عبر متغيّر CSS.
 */

import { buildStoreUrl, AFFILIATE_LINK_PROPS } from '../lib/affiliate';
import { liveOffers, storeVars, type Offer } from '../lib/stores';

export default function StoreBuyChips({
  offers,
  solid = false,
}: {
  offers?: Offer[] | null;
  /** true = رقاقة مصمتة بلون المتجر · false = خفيفة بحدود ملوّنة */
  solid?: boolean;
}) {
  const rows = liveOffers(offers);
  if (rows.length === 0) return null;

  return (
    <>
      {rows.map((o) => (
        <a
          key={o.storeId}
          href={buildStoreUrl(o.store, o.url, o.affiliateUrl)}
          {...AFFILIATE_LINK_PROPS}
          style={{
            ...storeVars(o.store.color),
            ...(solid ? { backgroundColor: 'var(--store-color)' } : {}),
          }}
          className={
            solid
              ? 'flex items-center gap-1 px-3 py-1.5 text-white text-[10px] rounded-full font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:brightness-110'
              : 'flex items-center gap-1 px-2.5 py-1 bg-[var(--store-tint)] hover:bg-[var(--store-soft)] text-[color:var(--store-color)] text-[10px] rounded border border-[var(--store-soft)] font-bold transition-colors'
          }
        >
          <span>{o.store.latinName}</span>
          <svg className="w-2.5 h-2.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      ))}
    </>
  );
}
