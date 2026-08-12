/**
 * ============ قائمة عروض المتاجر ============
 *
 * كانت ثلاث كتل JSX متطابقة، كل واحدة بلون متجرها مكتوباً في الأصناف
 * (border-r-[#FF9900] …). فأي متجر رابع = نسخة رابعة تُنسى عند أي تعديل.
 * الآن كتلة واحدة تدور على العروض، واللون يأتي من صفّ المتجر عبر متغيّر
 * CSS — لأن Tailwind يُجمّع أصنافه وقت البناء فلا يعرف لوناً يُختار وقت
 * التشغيل، بينما `var(--store-color)` يُحسم في المتصفّح.
 *
 * ---- ولماذا تغيّر شكلها ----
 *
 * كانت بطاقاتٍ سميكة: لكل متجر صندوقٌ بخلفيةٍ وحدٍّ جانبيّ ملوّن وظلّ.
 * وتحتها مباشرةً جدولُ المواصفات بصفوفٍ تفصلها خطوطٌ شعرية. صندوقان
 * متجاوران يتكلّمان لغتين — والعين تقرأ ذلك اضطراباً لا تنوّعاً.
 *
 * فصارت بنحو المواصفات نفسه: شريطُ إحصاء ثم صفٌّ لكل متجر، الاسمُ عند
 * حافة البداية والسعرُ عند حافة النهاية، فتصطفّ الأسعار عموداً واحداً
 * يُقارَن رأسياً — وهو ما جاء الزائر ليفعله أصلاً. ولونُ المتجر بقي في
 * النقطة: يكفي للتعريف ولا يبني صندوقاً.
 */

import { buildStoreUrl, storeLinkProps } from '../lib/affiliate';
import { formatPrice, discountPercent } from '../lib/price';
import { storeVars, type Offer } from '../lib/stores';
import { StoreNoticeInline } from './StoreNotice';
import { StatStrip, type Stat } from './Panel';

const RiyalIcon = ({ size = 'h-4 w-4' }: { size?: string }) => (
  <div
    className={`${size} bg-current inline-block align-middle`}
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

  const livePrices = rows.filter((o) => o.inStock && !!o.price).map((o) => o.price!);
  const low = livePrices.length ? Math.min(...livePrices) : 0;
  const high = livePrices.length ? Math.max(...livePrices) : 0;

  /* الشريط لا يظهر إلا حين يقول خبراً: عرضٌ واحد لا فرق فيه، وعرضان
     بسعرٍ واحد لا يوفّران شيئاً — وثلاث بطاقاتٍ تكرّر الرقم نفسه ضجيج. */
  const stats: Stat[] =
    livePrices.length >= 2 && high > low
      ? [
          { label: 'أرخص عرض', value: formatPrice(low), unit: '﷼', accent: 'emerald', marker: 'أوفر خيار متاح الآن' },
          { label: 'أغلى عرض', value: formatPrice(high), unit: '﷼', accent: 'none' },
          { label: 'الفرق بينهما', value: formatPrice(high - low), unit: '﷼', accent: 'rose' },
        ]
      : [];

  return (
    <div className="mt-5 w-full relative z-0">
      <h3 className="mb-3 text-[11.5px] font-bold text-slate-400 dark:text-slate-500">
        مقارنة الأسعار في المتاجر
      </h3>

      <StatStrip stats={stats} />

      <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
        {rows.map((o) => {
          const live = o.inStock && !!o.price;
          const pct = discountPercent(o.price, o.listPrice);
          const cheapest = live && o.price === low && livePrices.length > 1;

          return (
            <a
              key={o.storeId}
              href={buildStoreUrl(o.store, o.url, o.affiliateUrl)}
              {...storeLinkProps(o.store)}
              style={storeVars(o.store.color)}
              className={`group -mx-3 flex items-baseline justify-between gap-5 px-3 py-3 transition-colors ${
                live
                  ? 'hover:bg-[var(--store-tint)]'
                  : 'opacity-50 grayscale cursor-not-allowed'
              }`}
            >
              {/* الاسم عند حافة البداية — بنحو تسمية المواصفة */}
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${live ? 'bg-[color:var(--store-color)]' : 'bg-slate-400'}`}
                  style={live ? { boxShadow: '0 0 6px var(--store-glow)' } : undefined}
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[14px] font-extrabold text-slate-800 transition-colors group-hover:text-[color:var(--store-color)] dark:text-slate-200">
                      {o.store.latinName}
                    </span>
                    {cheapest && (
                      <span className="rounded-sm bg-emerald-100 px-1.5 py-0.5 text-[11px] font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                        الأرخص
                      </span>
                    )}
                    {!live && (
                      <span className="text-[11.5px] font-bold text-rose-500">غير متوفر حالياً</span>
                    )}
                  </span>
                  {/* إعلان حالة المتجر — في اللحظة التي يهمّ فيها: قبل الضغط */}
                  <StoreNoticeInline store={{ ...o.store, id: o.storeId }} />
                </span>
              </span>

              {/* السعر عند حافة النهاية — فتصطفّ الأسعار عموداً يُقارَن */}
              <span
                dir="ltr"
                className={`flex shrink-0 items-center gap-1.5 text-left tabular-nums ${
                  live ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                }`}
              >
                {/* السعر المشطوب يظهر فقط عند وجود خصم معلن على هذا المتجر */}
                {o.price && pct > 0 && (
                  <span className="text-[12.5px] font-bold text-slate-400 line-through dark:text-slate-500">
                    {formatPrice(o.listPrice)}
                  </span>
                )}
                <span className="text-[17px] font-black">{o.price ? formatPrice(o.price) : '—'}</span>
                {o.price ? <RiyalIcon /> : null}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
