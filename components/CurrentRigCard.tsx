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
    <section className="mb-8">
      <div className="relative overflow-hidden rounded-2xl border border-cyan-300/70 dark:border-cyan-800/50 bg-gradient-to-b from-cyan-50/80 to-white/60 dark:from-cyan-950/30 dark:to-slate-900/40 backdrop-blur-sm shadow-sm">
        {/* شريطٌ سماويّ علويّ — نفس مفردة البطاقات في الموقع */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500" />

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
            <span className="text-[11px] font-black text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-900/40 border border-cyan-300 dark:border-cyan-700/50 px-2 py-1 rounded">
              🖥️ جهازي الحالي
            </span>
            <h2 className="font-black text-xl text-slate-900 dark:text-white truncate">{build.name}</h2>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {filled} من ٨ قطع
            </span>

            <div className="ms-auto flex items-center gap-2">
              <button
                onClick={onOpen}
                className="px-3 py-1.5 rounded-sm text-[12px] font-black bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                افتحه
              </button>
              <button
                onClick={onUnset}
                className="px-3 py-1.5 rounded-sm text-[12px] font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="لم يعد هذا جهازي"
              >
                ليس جهازي
              </button>
            </div>
          </div>

          {/* ============ القطع ============ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {ORDER.map((k) => {
              const p = parts[k];
              const text = custom[k];
              const meta = (CATEGORY_META as any)?.[k];
              return (
                <div
                  key={k}
                  className={`flex items-center gap-2 p-2 rounded-sm border ${
                    p
                      ? 'bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
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
                      className="w-8 h-8 object-contain rounded-sm bg-white shrink-0"
                    />
                  ) : (
                    <span className="w-8 h-8 flex items-center justify-center text-[15px] opacity-50 shrink-0">
                      {text ? '✍️' : meta?.icon ?? '—'}
                    </span>
                  )}
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500">{LABEL[k]}</span>
                    <span
                      className={`block text-[11.5px] font-bold truncate ${
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 font-black text-lg text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatPrice(Number(build.totalPrice) || 0)} <RiyalIcon />
            </span>

            <span className="mx-1 w-px h-5 bg-slate-300/70 dark:bg-slate-700" />

            {blocks.length > 0 ? (
              <span className="text-[12px] font-black text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-2 py-1 rounded-sm">
                ⛔ {blocks.length} تعارض
              </span>
            ) : warns.length > 0 ? (
              <span className="text-[12px] font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-sm">
                ⚠️ {warns.length} ملاحظة
              </span>
            ) : (
              <span className="text-[12px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-sm">
                ✓ متوافق
              </span>
            )}

            <Link
              href="/components"
              className="ms-auto text-[12px] font-bold text-cyan-700 dark:text-cyan-400 hover:underline"
            >
              تصفّح القطع — نقول لك ما يناسبه ←
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
