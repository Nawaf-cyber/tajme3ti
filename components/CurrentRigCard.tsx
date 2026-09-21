'use client';

/* ============ «جهازي الحالي» — البطاقة العليا ============
 *
 * ⚠️ وتخرج من الشبكة كليّاً لا تُوسَم داخلها: أوّلُ صياغةٍ أعطتها وسماً
 * سماويّاً وتركتها في مكانها حسب الفرز — فصاحبُ اثنتين وعشرين تجميعةً
 * يجدها في الصفّ الثالث، ويدوّر الصفحة ليصل إلى مرجعِه. وجهازُك ليس
 * «تجميعةً من ٢٢»؛ هو ما تقيس عليه البقيّة.
 *
 * ⚠️ والمعروض فيها ما ندافع عنه وحده: السعر، والتوافق، والاختناق. ولا
 * رقمَ أداءٍ — لا نملك بيانات قياسٍ إطلاقاً، ودرجاتُنا الخمس سقطت حين
 * استُعملت مقياساً مطلقاً. ورقمٌ مخترَعٌ يُسقط الثقة عن الأسعار الصحيحة
 * معه.
 */

import Link from 'next/link';
import { productImage, IMAGE_FALLBACK } from '../lib/image';
import { formatPrice } from '../lib/price';
import { checkBuild } from '../lib/build-check';
import { bottleneck } from '../lib/bottleneck';
import { CATEGORY_META } from '../lib/category-meta';

const RiyalIcon = ({ size = 'h-4 w-4' }: { size?: string }) => (
  <div
    className={`${size} bg-emerald-500 inline-block align-middle shrink-0`}
    style={{
      maskImage: "url('/riyal.svg')", WebkitMaskImage: "url('/riyal.svg')",
      maskSize: 'contain', WebkitMaskSize: 'contain',
      maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center', WebkitMaskPosition: 'center',
    }}
  />
);

/** الترتيب الذي يقرأ به الناس تجميعةً — لا ترتيب الأعمدة في القاعدة */
const ORDER = ['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Case', 'Cooler'] as const;

const LABEL: Record<string, string> = {
  CPU: 'المعالج', GPU: 'الكرت', Motherboard: 'اللوحة', RAM: 'الذاكرة',
  Storage: 'التخزين', PSU: 'المزوّد', Case: 'الكيس', Cooler: 'المبرّد',
};

export default function CurrentRigCard({
  build,
  onOpen,
  onUnset,
}: {
  build: any;
  onOpen: () => void;
  onUnset: () => void;
}) {
  const parts = build.parts ?? {};
  const custom: Record<string, string> =
    build.customParts && typeof build.customParts === 'object' ? build.customParts : {};

  const issues = checkBuild(parts);
  const blocks = issues.filter((i) => i.level === 'block');
  const warns = issues.filter((i) => i.level === 'warn');
  const balance = bottleneck(parts.CPU, parts.GPU);

  const filled = ORDER.filter((k) => parts[k] || custom[k]).length;

  return (
    <section className="mb-10">
      <div className="relative overflow-hidden rounded-2xl border border-cyan-300/60 dark:border-cyan-800/40 bg-gradient-to-br from-cyan-50/90 via-white/70 to-white/50 dark:from-cyan-950/40 dark:via-slate-900/50 dark:to-slate-900/30 backdrop-blur-sm shadow-lg shadow-cyan-500/5">
        {/* شريطٌ سماويّ علويّ — نفس توقيع الرئيسية */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400" />
        {/* هالتان تُعطيان العمق الذي يليق بأوّل ما تقع عليه العين */}
        <div className="absolute -top-24 -start-24 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/[0.07] blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-28 -end-20 w-72 h-72 bg-blue-500/8 dark:bg-blue-500/[0.05] blur-3xl rounded-full pointer-events-none" />
        {/* زاويةٌ هندسيّة — مفردةُ البطاقات في الموقع */}
        <div className="absolute top-0 end-0 w-0 h-0 border-t-[18px] border-t-cyan-500/50 border-s-[18px] border-s-transparent" />

        <div className="relative p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-3 mb-5">
            <span className="flex items-center gap-1.5 text-[11px] font-black text-cyan-800 dark:text-cyan-300 bg-cyan-100/80 dark:bg-cyan-900/40 border border-cyan-300 dark:border-cyan-700/50 px-2.5 py-1.5 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
              </span>
              جهازي الحالي
            </span>

            <div className="min-w-0">
              <h2 className="font-black text-2xl sm:text-[28px] leading-tight text-slate-900 dark:text-white truncate">
                {build.name}
              </h2>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                {filled} من ٨ قطع
              </span>
            </div>

            <div className="ms-auto flex items-center gap-2">
              <button
                onClick={onOpen}
                className="px-4 py-2 rounded-sm text-[12.5px] font-black bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm hover:shadow-md hover:shadow-cyan-500/20 transition-all"
              >
                افتحه
              </button>
              <button
                onClick={onUnset}
                className="px-3 py-2 rounded-sm text-[12px] font-bold text-slate-500 dark:text-slate-400 border border-slate-300/80 dark:border-slate-700 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="لم يعد هذا جهازي"
              >
                ليس جهازي
              </button>
            </div>
          </div>

          {/* ============ القطع ============ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
            {ORDER.map((k) => {
              const p = parts[k];
              const text = custom[k];
              const meta = (CATEGORY_META as any)?.[k];
              return (
                <div
                  key={k}
                  className={`group/part flex items-center gap-2.5 p-2.5 rounded-sm border transition-colors ${
                    p
                      ? 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-cyan-400/60 dark:hover:border-cyan-600/50'
                      : text
                        /* ⚠️ الحدُّ المتقطّع ليس زخرفة: القطعةُ المكتوبة بخطّ
                           اليد بلا سعرٍ ولا تنبيهٍ ولا فحصِ توافق، فالشكلُ
                           يقول ذلك قبل أن يقرأ سطراً. */
                        ? 'bg-transparent border-dashed border-slate-300 dark:border-slate-700'
                        : 'bg-transparent border-dashed border-slate-200/70 dark:border-slate-800/60'
                  }`}
                >
                  {p ? (
                    <img
                      src={productImage(p.imageUrl, IMAGE_FALLBACK)}
                      alt=""
                      loading="lazy"
                      className="w-9 h-9 object-contain rounded-sm bg-white shrink-0 p-0.5"
                    />
                  ) : (
                    <span className="w-9 h-9 flex items-center justify-center text-[16px] opacity-40 shrink-0">
                      {text ? '✍️' : meta?.icon ?? '—'}
                    </span>
                  )}
                  <div className="min-w-0">
                    <span className="block text-[9.5px] font-black tracking-wide text-slate-400 dark:text-slate-500 uppercase">
                      {LABEL[k]}
                    </span>
                    <span
                      className={`block text-[12px] font-bold truncate ${
                        p ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'
                      }`}
                      title={p ? `${p.brand} ${p.name}` : text || 'لم تُضف'}
                    >
                      {p ? p.name : text || '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ============ الحكم ============ */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
            <span className="flex items-center gap-1.5 font-black text-2xl text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatPrice(Number(build.totalPrice) || 0)} <RiyalIcon size="h-5 w-5" />
            </span>

            {blocks.length > 0 ? (
              <span className="text-[12px] font-black text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/40 px-2.5 py-1.5 rounded-full">
                ⛔ {blocks.length} تعارض
              </span>
            ) : warns.length > 0 ? (
              <span className="text-[12px] font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/40 px-2.5 py-1.5 rounded-full">
                ⚠️ {warns.length} ملاحظة
              </span>
            ) : (
              <span className="text-[12px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1.5 rounded-full">
                ✓ متوافق
              </span>
            )}

            <Link
              href="/components"
              className="ms-auto group/cta inline-flex items-center gap-1.5 text-[12.5px] font-black text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
            >
              تصفّح القطع — نقول لك ما يناسبه
              <span className="transition-transform group-hover/cta:-translate-x-1">←</span>
            </Link>
          </div>

          {/* أوّلُ تعارضٍ بنصّه: العدد وحده لا يُصلَح به شيء */}
          {blocks.length > 0 && (
            <p className="mt-2 text-[12px] font-bold text-rose-800 dark:text-rose-300 leading-relaxed">
              {blocks[0].message}
            </p>
          )}

          {balance && (
            <div className={`mt-3 p-3 rounded-sm border ${balance.bg}`}>
              <p className={`text-[12.5px] font-black ${balance.color}`}>{balance.title}</p>
              <p className="mt-1 text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">{balance.desc}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
