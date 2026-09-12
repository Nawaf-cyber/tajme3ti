/**
 * قائمة عروض المتاجر في صفحة القطعة.
 *
 * كانت ثلاث كتل JSX متطابقة، كل واحدة بلون متجرها مكتوباً في الأصناف
 * (border-r-[#FF9900] …). فأي متجر رابع = نسخة رابعة تُنسى عند أي تعديل.
 * الآن كتلة واحدة تدور على العروض، واللون يأتي من صفّ المتجر عبر متغيّر
 * CSS — لأن Tailwind يُجمّع أصنافه وقت البناء فلا يعرف لوناً يُختار وقت
 * التشغيل، بينما `var(--store-color)` يُحسم في المتصفّح.
 */

import { buildStoreUrl, storeLinkProps } from '../lib/affiliate';
import { formatPrice, discountPercent } from '../lib/price';
import { pctAboveMin, type PriceStats } from '../lib/price-stats';
import { storeVars, type Offer } from '../lib/stores';
import { StoreNoticeInline } from './StoreNotice';

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

/**
 * موضعُ السعر من تاريخه — بديلُ المقارنة حين لا يوجد إلّا متجر.
 *
 * ⚠️ ويُقال بلا مبالغة: «عند أدنى ما رصدناه» تُكتب حين تصدق فقط، وإلّا
 * فالفرقُ بالريال والنسبة. ووعدٌ بصفقةٍ وهميّة يُفقد الثقة أسرع من صمت.
 */
function PriceContextNote({ stats, now }: { stats: PriceStats; now: number }) {
  const pct = pctAboveMin(now, stats.min);
  const money = (n: number) => Math.round(n).toLocaleString('en-US');
  const atLow = pct <= 2;

  return (
    <div
      className={`rounded-sm border p-3 text-[12.5px] font-semibold leading-relaxed ${
        atLow
          ? 'border-emerald-500/40 bg-emerald-500/[0.07] text-emerald-800 dark:text-emerald-300'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
      }`}
    >
      {atLow ? (
        <>
          سعرُه اليوم <strong>عند أدنى ما رصدناه</strong> خلال {stats.days} يوماً من المتابعة.
        </>
      ) : (
        <>
          متجرٌ واحد يبيعها عندنا — لكنّنا نتابع سعرها منذ <strong>{stats.days} يوماً</strong>:
          أدنى ما بلغته <strong dir="ltr">{money(stats.min)} ﷼</strong>، وأعلاه{' '}
          <strong dir="ltr">{money(stats.max)} ﷼</strong>. وسعرُ اليوم أعلى من أدناه بـ
          <strong> {pct}%</strong>.
        </>
      )}
      <span className="block mt-1 text-[11.5px] font-bold text-slate-500 dark:text-slate-400">
        الرسم البيانيّ أسفل الصفحة يوضّح الحركة يوماً بيوم.
      </span>
    </div>
  );
}

export default function StoreOfferList({
  offers,
  stats,
}: {
  offers: Offer[];
  /** موضع السعر من تاريخه — يُغني عن المقارنة حين لا يوجد إلّا متجرٌ واحد */
  stats?: PriceStats | null;
}) {
  // نعرض كل متجر له رابط — حتى النافد، ليعرف الزائر أنه مرصود لا مفقود
  const rows = (offers || []).filter((o) => !!o.url);
  if (rows.length === 0) return null;

  /* ⚠️ ١٩٢ قطعةً من ٣٣١ لا يبيعها إلّا متجرٌ واحد — والعنوان فوقها كان
     يقول «مقارنة الأسعار في المتاجر». وعدٌ مكسورٌ مكتوبٌ بخطّ عريض.
     وقِيس السببُ فإذا هو السوق لا أداتُنا: ٣٢٢ محاولةَ بحثٍ في المتجرين
     المجّانيَّين لم تُعد إلّا بمطابقتين. فالمتجر الثاني غير موجود.
     فالعنوان يصدُق، والمقارنةُ تتحوّل من «مقابل المتاجر» إلى «مقابل
     تاريخه» — وهي مقارنةٌ نملك بياناتها وحدنا. */
  const live = rows.filter((o) => o.inStock && !!o.price);
  const single = live.length === 1;

  return (
    <div className="flex flex-col gap-3 mt-4 w-full relative z-0">
      {/* كان: font-mono uppercase tracking-widest بحجم ١٠ بكسل — وهو مقبول
          على اللاتينية وثلاثةُ أخطاء على العربية. انظر MicroLabel */}
      <h3 className="mb-3 text-[11.5px] font-bold text-slate-400 dark:text-slate-500">
        {single ? 'المتجر الذي يبيعها' : 'مقارنة الأسعار في المتاجر'}
      </h3>

      {single && stats && (
        <PriceContextNote stats={stats} now={live[0].price!} />
      )}

      {rows.map((o) => {
        const live = o.inStock && !!o.price;
        const pct = discountPercent(o.price, o.listPrice);
        return (
          <a
            key={o.storeId}
            href={buildStoreUrl(o.store, o.url, o.affiliateUrl)}
            {...storeLinkProps(o.store)}
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
                {!live && <span className="text-[11.5px] font-black text-rose-500 mt-0.5">غير متوفر حالياً</span>}
                {/* إعلان حالة المتجر — في اللحظة التي يهمّ فيها: قبل الضغط */}
                <StoreNoticeInline store={{ ...o.store, id: o.storeId }} />
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
