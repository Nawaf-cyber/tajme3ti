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
 * والمجموعات ثلاثٌ لأنّ لكلٍّ منها قاعدةَ بقاءٍ مختلفة:
 *
 *   «جديد منذ زيارتك» — خبر: يُعرض مرّةً ثم يختفي وحده.
 *   «محفوظة»          — أمسكه المستخدم بيده: يبقى حتى يرفعه.
 *   «أرخص ما كانت»    — حال: صحيحٌ اليوم، ويموت وحده حين يرتفع السعر.
 *                       ولا يُعرض إلا حين لا جديد — وإلّا صار حائطاً ثانياً.
 */

import { useState } from 'react';
import Link from 'next/link';
import { productImage } from '../lib/image';
import { formatPrice } from '../lib/price';

export type Drop = {
  componentId: string; name: string; brand: string; categoryName: string;
  imageUrl: string | null; price: number; previousPrice: number | null;
  pct: number; saved: number; source: 'build' | 'watch';
  /* اسم التجميعة ومعرّفها — النقر يفتحها بدل الذهاب إلى صفحة القطعة */
  buildName?: string; buildId?: string;
  /** أدنى سعرٍ لها منذ شهر */
  atLowest: boolean;
  /** السعر الذي حفظه بيده، والفرق عنه (موجبٌ = ارتفع فانتهى الخصم) */
  pinnedPrice?: number; vsPinned?: number;
};

export type DropsView = { fresh: Drop[]; pinned: Drop[]; lowest: Drop[]; totalSaved: number };

/** كم يُعرض من كل مجموعةٍ قبل الطيّ */
const HEAD = 3;

const RiyalIcon = ({ size = 'h-3.5 w-3.5', colorClass = 'bg-emerald-700 dark:bg-emerald-400' }) => (
  <div className={`${size} ${colorClass} inline-block shrink-0 align-middle`} style={{
    maskImage: "url('/riyal.svg')", WebkitMaskImage: "url('/riyal.svg')",
    maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center',
  }} />
);

const ROW_CLS = 'group flex-1 min-w-0 flex items-center gap-3 px-2 py-2.5 rounded-sm text-right hover:bg-emerald-50/70 dark:hover:bg-emerald-500/5 transition-colors';

/* غلافُ الصفّ: زرٌّ يفتح التجميعة، أو رابطٌ إلى صفحة القطعة.
   ⚠️ ومحتواه مكتوبٌ مرّةً واحدة — نسخُه في فرعين تعديلٌ يُنسى في أحدهما.
   ⚠️ ولا يبتلع زرَّ الحفظ: زرٌّ داخل زرٍّ وسمٌ غير صالح، ونقرةٌ واحدة
   تُشغّل الاثنين. فالحفظ شقيقُه لا ابنُه. */
function RowShell({ drop, onOpenBuild, children }: {
  drop: Drop; onOpenBuild?: (buildId: string) => void; children: React.ReactNode;
}) {
  if (drop.source === 'build' && drop.buildId && onOpenBuild) {
    return (
      <button type="button" onClick={() => onOpenBuild(drop.buildId!)} className={ROW_CLS}
        title={`افتح «${drop.buildName}»`}>
        {children}
      </button>
    );
  }
  return <Link href={`/components/${drop.componentId}`} className={ROW_CLS}>{children}</Link>;
}

/* السعران — مكتوبان مرّةً ويُركَّبان في موضعين حسب العرض.
   وفي «محفوظة» يكون المرجع هو سعرُه المحفوظ لا `previousPrice` عندنا. */
function Prices({ drop, mode }: { drop: Drop; mode: 'drop' | 'pin' }) {
  const ref = mode === 'pin' ? drop.pinnedPrice! : drop.previousPrice;
  const up = mode === 'pin' && (drop.vsPinned ?? 0) > 0;
  return (
    <div className="shrink-0 flex items-center gap-2.5" dir="ltr">
      <div className="text-left font-mono text-[12px] tabular-nums leading-tight">
        {ref != null && (
          <div className="font-bold text-slate-600 dark:text-slate-400 line-through">{formatPrice(ref)}</div>
        )}
        <div className={`font-black ${up ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
          {formatPrice(drop.price)}
        </div>
      </div>
      {mode === 'drop' && drop.pct > 0 && (
        <span className="w-11 text-center text-[12px] font-black text-white bg-emerald-700 px-1 py-0.5 rounded-sm tabular-nums">
          ‎-{drop.pct}%
        </span>
      )}
      {mode === 'pin' && (
        /* الفرق عن سعره المحفوظ صراحةً: «ارتفع ٤٠» أو «نزل ٣٠ أكثر» */
        <span className={`w-11 text-center text-[12px] font-black px-1 py-0.5 rounded-sm tabular-nums text-white ${up ? 'bg-rose-700' : 'bg-emerald-700'}`}>
          {up ? '+' : '‎-'}{formatPrice(Math.abs(drop.vsPinned ?? 0))}
        </span>
      )}
    </div>
  );
}

function Row({ drop, mode, inLowGroup, onOpenBuild, onPin, busy }: {
  drop: Drop; mode: 'drop' | 'pin';
  /* داخل مجموعة «أرخص ما كانت» كلُّ صفٍّ كذلك — فإعادتها في كل سطرٍ تكرارٌ
     يزاحم اسم الفئة بلا أن يضيف خبراً */
  inLowGroup?: boolean;
  onOpenBuild?: (buildId: string) => void;
  onPin?: (componentId: string, next: boolean) => void;
  busy?: boolean;
}) {
  const pinned = drop.pinnedPrice != null;
  const up = mode === 'pin' && (drop.vsPinned ?? 0) > 0;
  return (
    <li className={`flex items-center ${up ? 'opacity-70' : ''}`}>
      <RowShell drop={drop} onOpenBuild={onOpenBuild}>
        <div className="relative shrink-0 w-10 h-10 rounded-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
          <img src={productImage(drop.imageUrl)} alt="" className="w-full h-full object-contain p-0.5" loading="lazy" />
        </div>

        <div className="min-w-0 flex-1">
          {/* العنوان يكشف ما قُصّ: اسمٌ من ٣٠ حرفاً لا يسع ١٩٣ بكسل على
              الجوّال، والقصّ بلا كشفٍ يُخفي الخبر نفسه */}
          <p title={drop.name}
            className="text-[13px] font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {drop.name}
          </p>
          {/* ⚠️ وعلى الجوّال ينزل السعر سطراً: عمودُ الأسعار والنسبة يأكل ١٧٠
              بكسل من ٣١٩، فيبقى للاسم ١٣٤ — «Vengeance 16GB (2x8GB) 5200MHz»
              يُقصّ عند «Vengeance 16GB». والاسم هو الخبر. */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold text-slate-600 dark:text-slate-400 truncate">
              {up ? (
                <span className="text-rose-700 dark:text-rose-400">انتهى الخصم</span>
              ) : drop.atLowest && !inLowGroup ? (
                <span className="text-emerald-700 dark:text-emerald-400">أرخص ما كانت منذ شهر</span>
              ) : (
                drop.categoryName
              )}
              <span className="mx-1.5 opacity-40">·</span>
              {drop.source === 'build' ? `في «${drop.buildName}»` : 'تتابعها'}
            </p>
            <div className="sm:hidden"><Prices drop={drop} mode={mode} /></div>
          </div>
        </div>

        <div className="hidden sm:flex shrink-0"><Prices drop={drop} mode={mode} /></div>
      </RowShell>

      {onPin && (
        <button
          type="button"
          onClick={() => onPin(drop.componentId, !pinned)}
          disabled={busy}
          aria-pressed={pinned}
          title={pinned ? 'ارفع الحفظ' : 'احفظ هذا السعر ليبقى'}
          className={`shrink-0 ml-1 w-8 h-8 flex items-center justify-center rounded-sm transition-colors disabled:opacity-50 ${
            pinned
              ? 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/25'
              : 'text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookmarkIcon filled={pinned} />
        </button>
      )}
    </li>
  );
}

/** مجموعةٌ بعنوانها وطيّها — الثلاث تتصرّف بالطريقة نفسها */
function Group({ title, hint, drops, mode, inLowGroup, onOpenBuild, onPin, busy }: {
  title: string; hint?: string; drops: Drop[]; mode: 'drop' | 'pin'; inLowGroup?: boolean;
  onOpenBuild?: (buildId: string) => void;
  onPin?: (componentId: string, next: boolean) => void;
  busy?: boolean;
}) {
  const [all, setAll] = useState(false);
  if (!drops.length) return null;
  const shown = all ? drops : drops.slice(0, HEAD);
  const rest = drops.length - shown.length;

  return (
    <div className="mt-4 first:mt-0">
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <h3 className="text-[13px] font-black text-slate-900 dark:text-white">
          {title}
          <span className="mr-1.5 text-[12px] font-black text-slate-600 dark:text-slate-300 tabular-nums">({drops.length})</span>
        </h3>
        {hint && <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400 truncate">{hint}</span>}
      </div>

      <ul className="divide-y divide-slate-100 dark:divide-slate-800/70 border-y border-slate-100 dark:border-slate-800/70">
        {shown.map((d) => (
          <Row key={d.componentId} drop={d} mode={mode} inLowGroup={inLowGroup}
            onOpenBuild={onOpenBuild} onPin={onPin} busy={busy} />
        ))}
      </ul>

      {drops.length > HEAD && (
        <button type="button" onClick={() => setAll(!all)}
          className="mt-1.5 text-[12px] font-black text-emerald-700 dark:text-emerald-400 hover:underline">
          {all ? 'اطوِ ↑' : `وأخرى (${rest}) ↓`}
        </button>
      )}
    </div>
  );
}

export default function DropsPanel({ view, onOpenBuild, onPin, busy }: {
  view: DropsView;
  /* يُمرَّر من «تجميعاتي» وحدها: هناك التجميعة على الصفحة نفسها فتُفتح.
     وحيث لا يُمرَّر تبقى البطاقة رابطاً إلى صفحة القطعة — زرٌّ لا يفعل
     شيئاً أسوأ من رابطٍ يذهب إلى مكانٍ آخر. */
  onOpenBuild?: (buildId: string) => void;
  onPin?: (componentId: string, next: boolean) => void;
  busy?: boolean;
}) {
  const { fresh, pinned, lowest, totalSaved } = view;

  /* «أرخص ما كانت» بديلٌ عن الفراغ لا إضافةٌ فوق الجديد: عرضُها مع الجديد
     يعيد الحائط الذي أزلناه. */
  const showLowest = fresh.length === 0 ? lowest : [];

  if (!fresh.length && !pinned.length && !showLowest.length) return null;

  return (
    <section className="mb-8 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border-x border-b border-t-2 border-slate-200 border-t-emerald-500 dark:border-slate-800/80 dark:border-t-emerald-500 rounded-sm shadow-sm">
      <div className="p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-3">
          <h2 className="text-[15px] font-black text-slate-900 dark:text-white flex items-center gap-2">
            أسعارٌ تخصّك
            {fresh.length > 0 && (
              <span className="text-[12px] font-black text-white bg-emerald-700 px-2 py-0.5 rounded-sm tabular-nums">
                {fresh.length} جديد
              </span>
            )}
          </h2>

          {totalSaved > 0 && (
            <div className="shrink-0 flex items-baseline gap-1.5">
              <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400">مجموع الانخفاض الجديد</span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 tabular-nums flex items-center gap-1" dir="ltr">
                {formatPrice(totalSaved)} <RiyalIcon />
              </span>
            </div>
          )}
        </div>

        <Group title="جديد منذ زيارتك" drops={fresh} mode="drop"
          onOpenBuild={onOpenBuild} onPin={onPin} busy={busy} />

        <Group title="محفوظة" hint="تبقى حتى ترفعها" drops={pinned} mode="pin"
          onOpenBuild={onOpenBuild} onPin={onPin} busy={busy} />

        <Group title="أرخص ما كانت منذ شهر" hint="لا جديد اليوم — لكن هذه في أدنى سعرٍ لها"
          drops={showLowest} mode="drop" inLowGroup onOpenBuild={onOpenBuild} onPin={onPin} busy={busy} />

        {/* ⚠️ ولا يُكتب «يصلك إشعار»: لا بريد ولا دفعَ ويب. المكتوب هو الواقع. */}
        <p className="mt-4 text-[12px] font-semibold text-slate-600 dark:text-slate-400">
          نرصد الأسعار يومياً وتظهر هنا حين تفتح الصفحة — لا نُرسل بريداً بعد.
          {fresh.length > 0 && ' واحفظ ما تريد الرجوع إليه بعلامة الحفظ.'}
        </p>
      </div>
    </section>
  );
}

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" />
  </svg>
);
