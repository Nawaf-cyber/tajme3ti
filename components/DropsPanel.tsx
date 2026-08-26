'use client';

/* ============ لوحة «نزلت أسعارها» — العرض وحده ============
 *
 * مفصولةٌ عن الجلب عمداً: القسم لا يظهر إلا لمستخدمٍ مسجَّل، فلو كان
 * الجلبُ داخله لتعذّر فحص شكله ومقاساته ونِسَب تباينه إلا بانتحال جلسة.
 * بياناتٌ داخلة = يُفحص بأي بيانات، ويبقى الجلب في مكانٍ واحد.
 */

import Link from 'next/link';
import { productImage } from '../lib/image';
import { formatPrice } from '../lib/price';

export type Drop = {
  componentId: string; name: string; brand: string; categoryName: string;
  imageUrl: string | null; price: number; previousPrice: number;
  pct: number; saved: number; source: 'build' | 'watch'; unseen: boolean;
  /* اسم التجميعة ومعرّفها — النقر يفتحها بدل الذهاب إلى صفحة القطعة */
  buildName?: string; buildId?: string;
};


/* غلافُ البطاقة: زرٌّ يفتح التجميعة، أو رابطٌ إلى صفحة القطعة.
   ⚠️ ومحتواها مكتوبٌ مرّةً واحدة — نسخُه في فرعين يعني تعديلاً يُنسى في أحدهما. */
function CardShell({ drop, onOpenBuild, children }: {
  drop: Drop; onOpenBuild?: (buildId: string) => void; children: React.ReactNode;
}) {
  const cls = "group flex items-center gap-3 p-3 rounded-sm border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-white/60 dark:bg-[#0B1120]/40 transition-colors";
  if (drop.source === 'build' && drop.buildId && onOpenBuild) {
    return (
      <button
        type="button"
        onClick={() => onOpenBuild(drop.buildId!)}
        className={cls + ' w-full text-right'}
        title={`افتح «${drop.buildName}»`}
      >
        {children}
      </button>
    );
  }
  return <Link href={`/components/${drop.componentId}`} className={cls}>{children}</Link>;
}

const RiyalIcon = ({ size = 'h-3.5 w-3.5', colorClass = 'bg-emerald-600 dark:bg-emerald-400' }) => (
  <div className={`${size} ${colorClass} inline-block shrink-0 align-middle`} style={{
    maskImage: "url('/riyal.svg')", WebkitMaskImage: "url('/riyal.svg')",
    maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center',
  }} />
);

export default function DropsPanel({ drops, unseen, totalSaved, onOpenBuild }: {
  drops: Drop[]; unseen: number; totalSaved: number;
  /* يُمرَّر من «تجميعاتي» وحدها: هناك التجميعة على الصفحة نفسها فتُفتح.
     وحيث لا يُمرَّر تبقى البطاقة رابطاً إلى صفحة القطعة — زرٌّ لا يفعل
     شيئاً أسوأ من رابطٍ يذهب إلى مكانٍ آخر. */
  onOpenBuild?: (buildId: string) => void;
}) {
  /* لا شيء يُعرض قبل الجواب ولا حين لا انخفاض: قسمٌ فارغٌ يقول «لا جديد»
     في كل زيارة يشغل مكاناً ولا يفيد. */
  if (!drops.length) return null;

  return (
    <section className="mb-8 relative overflow-hidden bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border-x border-b border-t-2 border-slate-200 border-t-emerald-500 dark:border-slate-800/80 dark:border-t-emerald-500 rounded-sm shadow-sm">
      <div className="absolute -top-16 -left-16 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              نزلت أسعارها
              {unseen > 0 && (
                <span className="text-[12px] font-black text-white bg-emerald-700 px-2 py-0.5 rounded-sm tabular-nums">
                  {unseen} جديد
                </span>
              )}
            </h2>
            <p className="mt-1 text-[13px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
              قطعٌ في تجميعاتك أو تتابعها نزل سعرها خلال ٣٠ يوماً.
            </p>
          </div>

          {totalSaved > 0 && (
            <div className="shrink-0 text-left" dir="ltr">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums flex items-center gap-1.5">
                {formatPrice(totalSaved)} <RiyalIcon size="h-5 w-5" />
              </div>
              <div className="text-[12px] font-bold text-slate-500 dark:text-slate-400 text-right">مجموع الانخفاض</div>
            </div>
          )}
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {drops.map((d) => (
            <li key={d.componentId}>
              <CardShell drop={d} onOpenBuild={onOpenBuild}>
                <div className="relative shrink-0 w-14 h-14 rounded-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <img
                    src={productImage(d.imageUrl)} alt={d.name}
                    className="w-full h-full object-contain p-1" loading="lazy"
                  />
                  {d.unseen && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B1120]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-black text-slate-500 dark:text-slate-400">{d.categoryName}</span>
                    <span className="text-[12px] font-black text-white bg-emerald-700 px-1.5 py-0.5 rounded-sm tabular-nums" dir="ltr">
                      ‎-{d.pct}%
                    </span>
                  </div>
                  <p className="mt-0.5 text-[13px] font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {d.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[12px] tabular-nums" dir="ltr">
                    <span className="font-bold text-slate-600 dark:text-slate-400 line-through">{formatPrice(d.previousPrice)}</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400">{formatPrice(d.price)}</span>
                  </div>
                  {/* لماذا يراها: من تجميعةٍ أم من متابعةٍ صريحة */}
                  <p className="mt-0.5 text-[12px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    {d.source === 'build' ? `في «${d.buildName}»` : 'تتابعها'}
                  </p>
                </div>
              </CardShell>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
          نرصد الأسعار يومياً وتظهر هنا حين تفتح الصفحة — لا نُرسل بريداً بعد.
        </p>
      </div>
    </section>
  );
}
