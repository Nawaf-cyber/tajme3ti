'use client';

/** خلية "الشراء" — رقائق المتاجر المتوفّرة، الأرخص أولاً.
 *  المتاجر تأتي من عروض القطعة، ولون كل رقاقة من صفّ متجرها — فما عاد
 *  هنا أي اسم متجر ولا لون مكتوب يدوياً. */

import { buildStoreUrl, storeLinkProps } from '../../lib/affiliate';
import { formatPrice, discountPercent } from '../../lib/price';
import { liveOffers, storeVars, type Offer } from '../../lib/stores';

export { liveOffers as getOffers };

export default function BuyCell({ component }: { component: { offers?: Offer[] | null } }) {
  const offers = liveOffers(component.offers);

  if (offers.length === 0) {
    return (
      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
        غير متوفر
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 items-stretch">
      {offers.map((o, i) => {
        const pct = discountPercent(o.price, o.listPrice);
        return (
          <a
            key={o.storeId}
            /* ⚠️ كانت هذه الخلية تستخدم الرابط الخام بلا وسم عمولة — أي كل
               نقرة شراء من صفحة المقارنة تُهدر العمولة. الآن تمرّ على
               المصدر المركزي مثل بقية الموقع. */
            href={buildStoreUrl(o.store, o.url, o.affiliateUrl)}
            {...storeLinkProps(o.store)}
            style={storeVars(o.store.color)}
            className={`group/buy flex flex-wrap min-w-0 items-center justify-between gap-x-2 gap-y-0.5 px-2.5 py-2 border rounded-sm transition-colors ${
              i === 0
                ? 'border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[color:var(--store-color)] hover:text-[color:var(--store-color)]'
            }`}
          >
            <span className="text-xs font-black shrink-0 flex items-center gap-1">
              {o.store.name}
              {pct > 0 && (
                <span className="text-[12px] font-black text-white bg-rose-500 px-1 py-0.5 rounded-sm tabular-nums">
                  ‎-{pct}%
                </span>
              )}
            </span>
            <span className="flex items-center gap-1 font-mono text-xs font-black">
              {/* السعر قبل الخصم مشطوباً — دليل أن العرض حقيقي */}
              {pct > 0 && o.listPrice && (
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 line-through">
                  {formatPrice(o.listPrice)}
                </span>
              )}
              {formatPrice(o.price)}
              {i === 0 && offers.length > 1 && <span className="font-sans text-xs opacity-80">أرخص</span>}
              <svg
                className="w-2.5 h-2.5 opacity-0 group-hover/buy:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
          </a>
        );
      })}
    </div>
  );
}
