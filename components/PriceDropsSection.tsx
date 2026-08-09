import Link from 'next/link';
import { prisma } from '../lib/prisma';
import { OFFER_INCLUDE } from '../lib/stores-server';
import { cheapestOffer, isAvailable } from '../lib/stores';
import { dropPercent, formatPrice, MIN_DROP_PERCENT } from '../lib/price';
import { productImage } from '../lib/image';
import { specBadges } from '../lib/spec-badges';
import MarqueeRail from './MarqueeRail';

/**
 * ============ انخفضت أسعارها ============
 *
 * يعرض القطع التي رصد السحبُ انخفاض سعرها خلال الأيام الماضية.
 *
 * لماذا من عمودَي Component لا من سجلّ الأسعار: السجلّ فيه آلاف النقاط،
 * وحساب "كم انخفض كل شيء" في كل زيارة استعلامٌ ثقيل على صفحة هي الأكثر
 * زيارةً. الكرون يرصد الانخفاض مرّة ويكتبه، والصفحة تقرأ صفّاً جاهزاً.
 *
 * ولا نعرض إلا المتوفّر فعلاً: تخفيضٌ على قطعة نافدة إغراءٌ بلا مخرج.
 *
 * ---- لماذا شريط منساب لا شبكة بطاقات ----
 * الشبكة كانت تحصر العرض في ٦ قطع ثم تتوقّف، وتُطيل الصفحة كلّما زادت
 * التخفيضات. الشريط يستوعب ما زاد بارتفاع ثابت. والحركة كلّها CSS، فالقسم
 * يبقى مكوّن سيرفر بلا جافاسكربت للعميل.
 *
 * ---- الاتّساق البصري ----
 * البطاقة هنا مبنيّة بمفردات بقيّة الصفحة حرفياً: rounded-3xl، خلفية
 * زجاجية، لوح صورة أبيض بـmix-blend-multiply، شارة فئة، سعر أخضر بأيقونة
 * الريال، ورابط «عرض الكل» سماوي. اللون الوردي محصور في دلالة الانخفاض
 * (الشريط الجانبي وشارة النسبة وسطر التوفير) — فالقسم يُقرأ كجزء من
 * الصفحة لا كلصاقة عليها.
 */

const WINDOW_DAYS = 7;
/** سقف الشريط — يكفي للامتلاء بلا أن تصير الدورة الواحدة دقائق */
const MAX_SHOWN = 14;
/** ثوانٍ لكل بطاقة — الضابط الوحيد للسرعة الظاهرة (أكبر = أبطأ) */
const SECONDS_PER_CARD = 8;

/* أيقونة الريال — نفس النمط المعتمد في بقيّة الصفحات، لكن بـspan لا div.
   النسخ الأخرى تعيش داخل عناصر تسمح بـdiv؛ هنا الأيقونة تظهر داخل <p>
   في سطر التلخيص، و<div> داخل <p> غير صالح في HTML: المتصفّح يغلق الفقرة
   عنده فيختلف شجر العميل عن شجر السيرفر وتفشل الـhydration. */
const RiyalIcon = ({
  size = 'h-3.5 w-3.5',
  colorClass = 'bg-emerald-600 dark:bg-emerald-400',
}: {
  size?: string;
  colorClass?: string;
}) => (
  <span
    className={`${size} ${colorClass} inline-block align-middle shrink-0`}
    style={{
      maskImage: "url('/riyal.svg')",
      WebkitMaskImage: "url('/riyal.svg')",
      maskSize: 'contain',
      WebkitMaskSize: 'contain',
      maskRepeat: 'no-repeat',
      WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskPosition: 'center',
    }}
  />
);

export default async function PriceDropsSection() {
  const since = new Date(Date.now() - WINDOW_DAYS * 86400000);

  const rows = await prisma.component.findMany({
    where: {
      priceDroppedAt: { gte: since },
      previousPrice: { not: null },
      price: { gt: 0 },
    },
    orderBy: { priceDroppedAt: 'desc' },
    take: 40, // نجلب أكثر ثم نصفّي المتوفّر ونرتّب بالنسبة
    include: { category: { select: { name: true } }, ...OFFER_INCLUDE },
  });

  const drops = rows
    .map((c) => ({ c, pct: dropPercent(c.previousPrice, c.price) }))
    .filter(({ c, pct }) => pct >= MIN_DROP_PERCENT && isAvailable(c as any))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, MAX_SHOWN);

  // لا نعرض قسماً فارغاً — سوق هادئ لا يعني صفحة فيها عنوان بلا محتوى
  if (drops.length === 0) return null;

  /* المدّة تنمو مع العدد فتثبت السرعة الظاهرة.
     الحدّ الأدنى ٤٠ث يمنع سباقاً حين تكون التخفيضات قليلة. */
  const duration = Math.max(40, drops.length * SECONDS_PER_CARD);

  /* أكبر توفير في الدفعة — رقم واحد يلخّص قيمة القسم قبل أن يقرأ الزائر
     بطاقةً واحدة، ويعطي سبباً للتوقّف عند الشريط. */
  const topSaving = Math.max(...drops.map(({ c }) => (c.previousPrice as number) - c.price));

  /* ---- تعليم صاحب أعلى نسبة ----
   * القائمة مرتّبة بالنسبة تنازلياً، لكن **الترتيب في شريط متحرّك لا يُرى**:
   * الزائر يرى ما يمرّ أمامه لا ما هو «أوّل». فمعلومة "أعلى تخفيض" كانت
   * محسوبةً وضائعة. الشارة تجعلها تسافر مع البطاقة أينما بلغت.
   *
   * بالنسبة لا بالريال عمداً: النسبة هي ما تعرضه كل بطاقة، فلو علّمنا
   * صاحب أكبر توفير بالريال لظهرت الشارة على بطاقة نسبتها أصغر مما
   * بجانبها — تناقضٌ ظاهر للعين.
   */
  const topPct = drops[0].pct;
  const topPctId = drops[0].c.id;

  /* تمييز العدد في العربية: ٣–١٠ جمعُ قلّة، وما عداه مفرد منصوب.
     «٦ قطعة» خطأ يلفت النظر في سطرٍ هدفه بناء الثقة. */
  const countLabel =
    drops.length === 1 ? 'قطعة واحدة'
    : drops.length === 2 ? 'قطعتان'
    : drops.length <= 10 ? `${drops.length} قطع`
    : `${drops.length} قطعة`;

  /* الطبعة الثانية للانسياب المتّصل، وهي مكرّرة بصرياً فتُخفى عن القارئ
     الآلي (aria-hidden) كي لا تُقرأ القائمة مرّتين. */
  const lanes = [
    { items: drops, clone: false },
    { items: drops, clone: true },
  ];

  return (
    <section className="pt-4 pb-16 animate-fade-up">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center gap-4 mb-8 flex-wrap">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
              <span className="w-1.5 h-8 bg-gradient-to-b from-rose-400 to-rose-600 rounded-full shadow-[0_0_10px] shadow-rose-500/40"></span>
              انخفضت أسعارها
            </h2>
            {/* الإزاحة = عرض الشريط الجانبي (0.375rem) + الفجوة (0.75rem)،
                فيبدأ السطر تحت أول حرف من العنوان لا تحت الشريط */}
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium ms-[1.125rem]">
              {countLabel} نزل سعرها خلال آخر {WINDOW_DAYS} أيام · أعلى خصم{' '}
              <span className="font-black text-rose-600 dark:text-rose-400 tabular-nums">{topPct}٪</span> · أكبر توفير{' '}
              <span className="font-black text-rose-600 dark:text-rose-400 inline-flex items-baseline gap-1">
                {formatPrice(topSaving)}
                <RiyalIcon size="h-3 w-3" colorClass="bg-rose-600 dark:bg-rose-400" />
              </span>
            </p>
          </div>
          {/* «عرض الكل» كان وعداً فارغاً: الشريط يعرض كل الانخفاضات فعلاً
              (سقفه ١٤ وعددها أقلّ)، والضغط كان ينقل الزائر إلى ٢٢٥ قطعة غير
              مرتّبة — تنزيلٌ لا ترقية. النصّ الآن يقول وجهته بصدق. */}
          <Link
            href="/components"
            className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors shrink-0"
          >
            تصفّح كل القطع &larr;
          </Link>
        </div>
      </div>

      {/* الشريط يمتدّ لعرض الشاشة — الحدّ الأقصى للعرض يقطع الإيهام بأنه
          قادم من خارج الإطار. والحشو الرأسي يترك مجالاً لارتفاع البطاقة
          وظلّها عند المرور بدل أن يقصّهما overflow-hidden.
          الغلاف مكوّن عميل يضيف السحب باليد؛ البطاقات تبقى من السيرفر. */}
      <MarqueeRail durationSeconds={duration}>
          {lanes.map(({ items, clone }, laneIndex) => (
            <ul key={laneIndex} className="flex shrink-0" aria-hidden={clone || undefined}>
              {items.map(({ c, pct }) => {
                const best = cheapestOffer((c as any).offers);
                const saved = (c.previousPrice as number) - c.price;
                /* ثلاث شارات كما في صفحة القطع — الاسم وحده لا يقول
                   إن كان المعالج AM4 أو AM5، وهو أول ما يسأل عنه المشتري */
                const badges = specBadges(c as any, 3);

                return (
                  /* الحشو على العنصر لا فجوة flex: يبقى عرض الطبعة مضاعفاً
                     دقيقاً لعرض البطاقة، فتلتقي النسختان بلا فجوة عند الالتفاف */
                  <li key={`${laneIndex}-${c.id}`} className="shrink-0 px-2.5">
                    <Link
                      href={`/components/${c.id}`}
                      tabIndex={clone ? -1 : undefined}
                      /* ⚠️ سمة حقيقية لا CSS: الروابط والصور قابلة للسحب
                         افتراضياً في HTML، فكان أول تحريك يبدأ سحب-وإفلات
                         أصلياً يُلغي سلسلة المؤشّر — فلا الشريط يتحرّك ولا
                         النقرة تفتح المنتج. و‎-webkit-user-drag لا يكفي:
                         بادئة غير قياسية لا تدعمها فايرفوكس ولا تُبطل
                         السحب على الروابط. */
                      draggable={false}
                      /* أضيق على الجوّال ليظهر طرف البطاقة التالية — وهو
                         الدليل البصري الوحيد على أن الشريط يُسحب. بـ23rem
                         تملأ البطاقةُ شاشةَ 375px فيبدو القسم بطاقةً ساكنة. */
                      className="group flex gap-4 w-[19rem] sm:w-[23rem] p-4 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-rose-400/50 dark:hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* لوح الصورة الأبيض — نفس معالجة بطاقات «أحدث القطع» */}
                      <div className="relative w-[5.25rem] h-[5.25rem] shrink-0 bg-slate-50 dark:bg-white rounded-2xl border border-slate-100 dark:border-slate-200 flex items-center justify-center p-2.5">
                        <img
                          src={productImage(c.imageUrl, `/images/${c.categoryId}/boxed.png`)}
                          alt={c.name}
                          loading="lazy"
                          draggable={false}
                          className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute -top-2 -left-2 font-mono text-[11px] font-black text-white bg-rose-500 px-1.5 py-0.5 rounded-lg shadow-[0_0_12px_rgba(244,63,94,0.5)] tabular-nums">
                          ‎-{pct}%
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 flex flex-col">
                        {/* ارتفاع ثابت للصفّ: الشارة تظهر على بطاقة واحدة،
                            وبلا تثبيت يصير ارتفاعها مختلفاً عن جاراتها */}
                        <div className="flex items-center gap-1.5 h-[1.15rem]">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {c.category?.name}
                          </span>
                          {c.id === topPctId && (
                            <span className="text-[9.5px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/15 border border-amber-400/50 dark:border-amber-500/30 px-1.5 rounded-full whitespace-nowrap leading-[1.1rem]">
                              ★ الأعلى خصماً
                            </span>
                          )}
                        </div>

                        {/* صندوق سطرين ثابت لا مرن: بعض الأسماء سطر وبعضها
                            سطران، فكانت البطاقات بارتفاعات مختلفة (١٧٠ مقابل
                            ١٥١) وتتبعها الأسعار على مستويات متفاوتة — شريطٌ
                            متحرّك بحوافّ غير مستوية يبدو مكسوراً لا حيّاً. */}
                        <h3
                          className="text-[13.5px] font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2 mt-0.5 min-h-[2.32rem] group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors"
                          dir="ltr"
                        >
                          {c.brand} {c.name}
                        </h3>

                        {/* شارات المواصفات — نفس تنسيق صفحة القطع.
                            nowrap لأن البطاقة ضيّقة، والالتفاف يزيد ارتفاعها
                            فيختلّ اتّساق الشريط بين قطعة وأخرى. */}
                        {badges.length > 0 && (
                          <div className="flex gap-1.5 mt-2 overflow-hidden" dir="ltr">
                            {badges.map((b, i) => (
                              <span
                                key={i}
                                className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded-sm border border-slate-200 dark:border-slate-700/50 whitespace-nowrap shrink-0"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-baseline gap-2 mt-auto pt-2">
                          <span className="font-black text-lg text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 leading-none tabular-nums">
                            {formatPrice(c.price)}
                            <RiyalIcon size="h-3.5 w-3.5" />
                          </span>
                          <span
                            className="text-xs font-bold text-slate-400 dark:text-slate-500 line-through tabular-nums"
                            dir="ltr"
                          >
                            {formatPrice(c.previousPrice)}
                          </span>
                        </div>

                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 truncate">
                          <span className="text-rose-600 dark:text-rose-400 font-black">
                            وفّرت {formatPrice(saved)}
                          </span>
                          {best && <span> · {best.store.name}</span>}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ))}
      </MarqueeRail>
    </section>
  );
}
