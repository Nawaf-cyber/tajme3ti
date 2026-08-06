/**
 * قائمة عروض المتاجر في صفحة القطعة.
 *
 * كانت ثلاث كتل JSX متطابقة، كل واحدة بلون متجرها مكتوباً في الأصناف
 * (border-r-[#FF9900] …). فأي متجر رابع = نسخة رابعة تُنسى عند أي تعديل.
 * الآن كتلة واحدة تدور على العروض، واللون يأتي من صفّ المتجر عبر متغيّر
 * CSS — لأن Tailwind يُجمّع أصنافه وقت البناء فلا يعرف لوناً يُختار وقت
 * التشغيل، بينما `var(--store-color)` يُحسم في المتصفّح.
 */

import { buildStoreUrl, AFFILIATE_LINK_PROPS } from '../lib/affiliate';
import { formatPrice, discountPercent } from '../lib/price';
import { storeVars, type Offer } from '../lib/stores';

const RiyalIcon = ({ size = 'h-5 w-5' }: { size?: string }) => (
  <div
    className={`${size} bg-emerald-500 inline-block align-middle`}
    style={{
      maskImage: "url('/riyal.svg')", WebkitMaskImage: "url('/riyal.svg')",
      maskSize: 'contain', WebkitMaskSize: 'contain',
      maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center', WebkitMaskPosition: 'center',
    }}
  />
);

export default function StoreOfferList({ offers }: { offers: Offer[] }) {
  // نعرض كل متجر له رابط — حتى النافد، ليعرف الزائر أنه مرصود لا مفقود
  const rows = (offers || []).filter((o) => !!o.url);
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-4 w-full relative z-0">
      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 font-mono uppercase tracking-widest">
        مقارنة الأسعار · STORES
      </h3>

      {rows.map((o) => {
        const live = o.inStock && !!o.price;
        const pct = discountPercent(o.price, o.listPrice);
        return (
          <a
            key={o.storeId}
            href={buildStoreUrl(o.store, o.url, o.affiliateUrl)}
            {...AFFILIATE_LINK_PROPS}
            style={storeVars(o.store.color)}
            className={`flex items-center justify-between p-3.5 border-r-2 rounded-sm transition-all group shadow-sm ${
              !live
                ? 'bg-slate-100 dark:bg-[#0B1120]/60 border-r-slate-400 dark:border-r-slate-700 opacity-60 grayscale cursor-not-allowed'
                : 'bg-white/60 dark:bg-slate-800/40 border-r-[color:var(--store-color)] hover:bg-white dark:hover:bg-slate-800/70 hover:shadow-md hover:-translate-x-0.5'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-sm bg-[var(--store-tint)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <span
                  className={`w-3 h-3 rounded-full ${live ? 'bg-[color:var(--store-color)]' : 'bg-rose-500'}`}
                  style={live ? { boxShadow: '0 0 8px var(--store-glow)' } : undefined}
                />
              </div>
              <span className="font-mono font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-[color:var(--store-color)] transition-colors flex flex-col">
                {o.store.latinName}
                {!live && <span className="text-[10px] font-black text-rose-500 mt-0.5">غير متوفر حالياً</span>}
              </span>
            </div>

            <span
              className={`font-mono font-black text-xl flex items-center gap-1.5 transition-colors ${
                live ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500' : 'text-slate-500'
              }`}
            >
              {o.price ? (
                <>
                  {/* السعر المشطوب يظهر فقط عند وجود خصم معلن على هذا المتجر */}
                  {pct > 0 && (
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500 line-through" dir="ltr">
                      {formatPrice(o.listPrice)}
                    </span>
                  )}
                  {formatPrice(o.price)} <RiyalIcon />
                </>
              ) : (
                '---'
              )}
            </span>
          </a>
        );
      })}
    </div>
  );
}
