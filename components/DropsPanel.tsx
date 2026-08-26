'use client';

/* ============ لوحة «نزلت أسعارها» — العرض وحده ============
 *
 * مفصولةٌ عن الجلب عمداً: القسم لا يظهر إلا لمستخدمٍ مسجَّل، فلو كان
 * الجلبُ داخله لتعذّر فحص شكله ومقاساته ونِسَب تباينه إلا بانتحال جلسة.
 * بياناتٌ داخلة = يُفحص بأي بيانات، ويبقى الجلب في مكانٍ واحد.
 *
 * ⚠️ وأوّل صياغةٍ عرضت **كلّ** انخفاضٍ ببطاقةٍ كاملة بوزنٍ واحد. مستخدمٌ عنده
 * عشرون انخفاضاً صارت لوحتُه ٢٢٠٠ بكسل — يمرّ عليها قبل أن يصل إلى تجميعاته
 * التي جاء من أجلها. وعشرون خبراً متساويةً ليست عشرين خبراً، بل لا خبر:
 * انخفاضُ ٣٥٪ يضيع بين انخفاضاتِ ٣٪.
 *
 * فصار العرض: أقوى ثلاثةٍ بالنسبة، والبقيّة خلف زرّ. والمجموع في الأعلى يقول
 * الحصيلة كاملةً في رقمٍ واحد، فلا يُخفى شيءٌ — يُختصر فحسب.
 */

import { useState } from 'react';
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

/** كم يُعرض قبل الطيّ */
const HEAD = 3;

const RiyalIcon = ({ size = 'h-3.5 w-3.5', colorClass = 'bg-emerald-600 dark:bg-emerald-400' }) => (
  <div className={`${size} ${colorClass} inline-block shrink-0 align-middle`} style={{
    maskImage: "url('/riyal.svg')", WebkitMaskImage: "url('/riyal.svg')",
    maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center',
  }} />
);

/* غلافُ الصفّ: زرٌّ يفتح التجميعة، أو رابطٌ إلى صفحة القطعة.
   ⚠️ ومحتواه مكتوبٌ مرّةً واحدة — نسخُه في فرعين تعديلٌ يُنسى في أحدهما. */
function RowShell({ drop, onOpenBuild, children }: {
  drop: Drop; onOpenBuild?: (buildId: string) => void; children: React.ReactNode;
}) {
  /* بلا إطارٍ لكل صفّ: عشرون إطاراً متجاوراً شبكةٌ تُقرأ كجدولٍ لا كأخبار.
     الفاصل خطٌّ واحدٌ بينها، والإبرازُ عند التحويم وحده. */
  const cls = 'group w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-right hover:bg-emerald-50/70 dark:hover:bg-emerald-500/5 transition-colors';
  if (drop.source === 'build' && drop.buildId && onOpenBuild) {
    return (
      <button type="button" onClick={() => onOpenBuild(drop.buildId!)} className={cls}
        title={`افتح «${drop.buildName}»`}>
        {children}
      </button>
    );
  }
  return <Link href={`/components/${drop.componentId}`} className={cls}>{children}</Link>;
}

/* السعران والنسبة — مكتوبةٌ مرّةً وتُركَّب في موضعين حسب العرض */
function Prices({ drop }: { drop: Drop }) {
  return (
    <div className="shrink-0 flex items-center gap-2.5" dir="ltr">
      <div className="text-left font-mono text-[12px] tabular-nums leading-tight">
        <div className="font-bold text-slate-500 dark:text-slate-400 line-through">{formatPrice(drop.previousPrice)}</div>
        <div className="font-black text-emerald-700 dark:text-emerald-400">{formatPrice(drop.price)}</div>
      </div>
      <span className="w-11 text-center text-[12px] font-black text-white bg-emerald-700 px-1 py-0.5 rounded-sm tabular-nums">
        ‎-{drop.pct}%
      </span>
    </div>
  );
}

function Row({ drop, onOpenBuild }: { drop: Drop; onOpenBuild?: (buildId: string) => void }) {
  return (
    <li>
      <RowShell drop={drop} onOpenBuild={onOpenBuild}>
        <div className="relative shrink-0 w-10 h-10 rounded-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
          <img src={productImage(drop.imageUrl)} alt="" className="w-full h-full object-contain p-0.5" loading="lazy" />
          {drop.unseen && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0F172A]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {drop.name}
          </p>
          {/* ⚠️ وعلى الجوّال ينزل السعر سطراً: عمودُ الأسعار والنسبة يأكل ١٧٠
              بكسل من ٣١٩، فيبقى للاسم ١٣٤ — «Vengeance 16GB (2x8GB) 5200MHz»
              يُقصّ عند «Vengeance 16GB». والاسم هو الخبر. */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 truncate">
              {drop.categoryName}
              <span className="mx-1.5 opacity-40">·</span>
              {drop.source === 'build' ? `في «${drop.buildName}»` : 'تتابعها'}
            </p>
            <div className="sm:hidden"><Prices drop={drop} /></div>
          </div>
        </div>

        <div className="hidden sm:flex shrink-0"><Prices drop={drop} /></div>
      </RowShell>
    </li>
  );
}

export default function DropsPanel({ drops, unseen, totalSaved, onOpenBuild }: {
  drops: Drop[]; unseen: number; totalSaved: number;
  /* يُمرَّر من «تجميعاتي» وحدها: هناك التجميعة على الصفحة نفسها فتُفتح.
     وحيث لا يُمرَّر تبقى البطاقة رابطاً إلى صفحة القطعة — زرٌّ لا يفعل
     شيئاً أسوأ من رابطٍ يذهب إلى مكانٍ آخر. */
  onOpenBuild?: (buildId: string) => void;
}) {
  const [all, setAll] = useState(false);

  /* لا شيء يُعرض حين لا انخفاض: قسمٌ فارغٌ يقول «لا جديد» في كل زيارة يشغل
     مكاناً ولا يفيد. */
  if (!drops.length) return null;

  /* الأقوى أوّلاً: الترتيب الزمنيّ يجعل انخفاض ٣٪ اليوم يسبق ٣٥٪ أمس */
  const sorted = [...drops].sort((a, b) => b.pct - a.pct);
  const shown = all ? sorted : sorted.slice(0, HEAD);
  const rest = sorted.length - shown.length;

  return (
    <section className="mb-8 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border-x border-b border-t-2 border-slate-200 border-t-emerald-500 dark:border-slate-800/80 dark:border-t-emerald-500 rounded-sm shadow-sm">
      <div className="p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-black text-slate-900 dark:text-white flex items-center gap-2">
              نزلت أسعارها
              <span className="text-[12px] font-black text-slate-600 dark:text-slate-300 tabular-nums">
                ({drops.length})
              </span>
              {unseen > 0 && (
                <span className="text-[12px] font-black text-white bg-emerald-700 px-2 py-0.5 rounded-sm tabular-nums">
                  {unseen} جديد
                </span>
              )}
            </h2>
          </div>

          {totalSaved > 0 && (
            /* الحصيلة كلّها في رقمٍ واحد — فالطيُّ يختصر ولا يُخفي */
            <div className="shrink-0 flex items-baseline gap-1.5">
              <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400">مجموع الانخفاض</span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 tabular-nums flex items-center gap-1" dir="ltr">
                {formatPrice(totalSaved)} <RiyalIcon size="h-3.5 w-3.5" colorClass="bg-emerald-700 dark:bg-emerald-400" />
              </span>
            </div>
          )}
        </div>

        <ul className="divide-y divide-slate-100 dark:divide-slate-800/70 border-y border-slate-100 dark:border-slate-800/70">
          {shown.map((d) => <Row key={d.componentId} drop={d} onOpenBuild={onOpenBuild} />)}
        </ul>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {/* ⚠️ ولا يُكتب «يصلك إشعار»: لا بريد ولا دفعَ ويب. المكتوب هو الواقع. */}
          <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
            تظهر هنا حين تفتح الصفحة — لا نُرسل بريداً بعد.
          </p>
          {rest > 0 && (
            <button type="button" onClick={() => setAll(true)}
              className="text-[12px] font-black text-emerald-700 dark:text-emerald-400 hover:underline">
              وأخرى ({rest}) ↓
            </button>
          )}
          {all && sorted.length > HEAD && (
            <button type="button" onClick={() => setAll(false)}
              className="text-[12px] font-black text-slate-600 dark:text-slate-300 hover:underline">
              اطوِ ↑
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
