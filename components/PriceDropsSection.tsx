import Link from 'next/link';
import { prisma } from '../lib/prisma';
import { OFFER_INCLUDE } from '../lib/stores-server';
import { cheapestOffer, isAvailable } from '../lib/stores';
import { dropPercent, formatPrice, MIN_DROP_PERCENT } from '../lib/price';
import { productImage } from '../lib/image';

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
 * الشبكة كانت تحصر العرض في ٦ قطع ثم تتوقّف، وتضيف صناديق فوق صناديق في
 * صفحة مليئة بها أصلاً. الشريط يحلّ الاثنين: يستوعب ما زاد بلا أن يطول
 * ارتفاع الصفحة، ويسبح على خلفيتها بلا إطار — فيبدو جزءاً منها لا لصاقة
 * فوقها. والحركة كلّها CSS، فالقسم يبقى مكوّن سيرفر بلا جافاسكربت للعميل.
 */

const WINDOW_DAYS = 7;
/** سقف الشريط — يكفي للامتلاء بلا أن تصير الدورة الواحدة دقائق */
const MAX_SHOWN = 14;
/** ثوانٍ لكل بطاقة — الضابط الوحيد للسرعة الظاهرة (أكبر = أبطأ) */
const SECONDS_PER_CARD = 7;

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
     الحدّ الأدنى ٣٥ث يمنع سباقاً حين تكون التخفيضات قليلة. */
  const duration = Math.max(35, drops.length * SECONDS_PER_CARD);

  /* الطبعة الثانية للانسياب المتّصل، وهي مكرّرة بصرياً فتُخفى عن القارئ
     الآلي (aria-hidden) كي لا تُقرأ القائمة مرّتين. */
  const lane = [
    { items: drops, clone: false },
    { items: drops, clone: true },
  ];

  return (
    <section className="mb-16 animate-fade-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <span className="w-1.5 h-8 bg-gradient-to-b from-rose-400 to-rose-600 rounded-full shadow-[0_0_10px] shadow-rose-500/40"></span>
              انخفضت أسعارها
            </h2>
            <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
              رصدناها خلال آخر {WINDOW_DAYS} أيام — بمقارنة السعر بما كان عليه قبل الانخفاض.
            </p>
          </div>
          <Link
            href="/components"
            className="font-mono text-[11px] font-black text-rose-600 dark:text-rose-400 hover:underline uppercase tracking-wider shrink-0"
          >
            كل القطع ←
          </Link>
        </div>
      </div>

      {/* الشريط يمتدّ لعرض الشاشة كاملاً — الحدّ الأقصى للعرض يقطع الإيهام
          بأنه قادم من خارج الإطار */}
      <div className="marquee-viewport relative overflow-hidden py-1">
        <div
          className="marquee-track"
          /* التخطيط مضمّن لا صفّي — انظر التعليق في globals.css */
          style={{
            display: 'flex',
            width: 'max-content',
            ['--marquee-duration' as any]: `${duration}s`,
          }}
        >
          {lane.map(({ items, clone }, laneIndex) => (
            <ul
              key={laneIndex}
              className="flex shrink-0"
              aria-hidden={clone || undefined}
            >
              {items.map(({ c, pct }) => {
                const best = cheapestOffer((c as any).offers);
                const saved = (c.previousPrice as number) - c.price;

                return (
                  <li key={`${laneIndex}-${c.id}`} className="shrink-0">
                    <Link
                      href={`/components/${c.id}`}
                      tabIndex={clone ? -1 : undefined}
                      className="group flex items-center gap-3 w-[19rem] px-5 py-3 border-l border-slate-200/70 dark:border-slate-800/70 hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                        <img
                          src={productImage(c.imageUrl, `/images/${c.categoryId}/boxed.png`)}
                          alt={c.name}
                          loading="lazy"
                          className="max-w-full max-h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                        />
                        {/* النسبة على الصورة لا في صندوق — توفّر سطراً وتلفت النظر */}
                        <span className="absolute -top-1 -left-1 font-mono text-[10px] font-black text-white bg-rose-500 px-1 py-px rounded-sm shadow-[0_0_10px_rgba(244,63,94,0.5)] tabular-nums">
                          ‎-{pct}%
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {c.category?.name}
                        </p>
                        <p
                          className="text-[12.5px] font-black text-slate-900 dark:text-white leading-snug truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors"
                          dir="ltr"
                        >
                          {c.brand} {c.name}
                        </p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="font-mono text-[14px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {formatPrice(c.price)} ﷼
                          </span>
                          <span
                            className="font-mono text-[10.5px] font-bold text-slate-400 dark:text-slate-500 line-through tabular-nums"
                            dir="ltr"
                          >
                            {formatPrice(c.previousPrice)}
                          </span>
                        </div>
                        <p className="font-mono text-[9.5px] font-black text-rose-600/90 dark:text-rose-400/90 tabular-nums truncate">
                          وفّرت {formatPrice(saved)} ﷼
                          {best && (
                            <span className="text-slate-400 dark:text-slate-500 font-bold"> · {best.store.name}</span>
                          )}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
