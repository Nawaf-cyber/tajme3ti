import Link from 'next/link';
import { prisma } from '../lib/prisma';
import { isComponentAvailable } from '../lib/availability';
import { productImage } from '../lib/image';

/* ============ شارة "جديد" مربوطة بتاريخ ============
   بعد هذا التاريخ تختفي وحدها. لا تحتاج تدخّلاً.
   الشارة الدائمة تصير ضوضاء — الزائر المتكرّر يتجاهلها،
   والزائر الجديد لا تعني له شيئاً أصلاً. */
const NEW_UNTIL = new Date('2026-08-10T00:00:00Z');

// معرّف فئة كروت الشاشة — أوضح فئة للمقارنة البصرية
const GPU_CATEGORY_ID = 'cmpfziqnv0004x4ymffnp204c';

/* ============ تثبيت يدوي (اختياري) ============
   ضع معرّفَي قطعتين لعرضهما دائماً، وتجاهُل الاختيار التلقائي.
   اتركها فارغة `[]` ليختار النظام تلقائياً.
   ⚠️ القطعة المثبّتة إن نفدت أو حُذفت، يسقط النظام تلقائياً
   إلى الاختيار الآلي بدل أن يكسر القسم. */
const PINNED_IDS: string[] = [];

// نفس الأسّ المعتمد في صفحة المقارنة (اختُبر على بيانات حقيقية)
const VALUE_EXPONENT = 2.0;
const valueScore = (tier: number, price: number) =>
  price > 0 && tier > 0 ? Math.pow(tier, VALUE_EXPONENT) / price : 0;

const RiyalIcon = ({ size = 'h-3.5 w-3.5', colorClass = 'bg-emerald-600 dark:bg-emerald-400' }) => (
  <div
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

export default async function CompareTeaser() {
  const gpus = await prisma.component.findMany({
    where: {
      categoryId: GPU_CATEGORY_ID,
      price: { gt: 0 },
      performanceTier: { not: null },
    },
    select: {
      id: true,
      name: true,
      brand: true,
      price: true,
      imageUrl: true,
      tdpWattage: true,
      performanceTier: true,
      amazonInStock: true,
      amazonPrice: true,
      cazasouqInStock: true,
      cazasouqPrice: true,
      microlessInStock: true,
      microlessPrice: true,
    },
  });

  // نعرض قطعاً متوفّرة فقط — لا معنى لعرض مقارنة لقطع لا تُشترى
  const pool = gpus.filter(isComponentAvailable);

  // تشخيص أثناء التطوير فقط — يظهر في طرفية `next dev`، لا في الإنتاج
  if (process.env.NODE_ENV === 'development') {
    const dist = pool.reduce<Record<number, number>>((m, c) => {
      const t = c.performanceTier ?? 0;
      m[t] = (m[t] ?? 0) + 1;
      return m;
    }, {});
    console.log(
      `[CompareTeaser] كروت في الفئة: ${gpus.length} · متوفّرة: ${pool.length} · توزيع المستويات:`,
      dist
    );
  }

  if (pool.length < 2) return null;

  type Card = (typeof pool)[number];

  /* ---- ١) التثبيت اليدوي، إن وُجد وكان صالحاً ---- */
  let hero: Card | undefined;
  let rival: Card | undefined;

  if (PINNED_IDS.length === 2) {
    const a = pool.find((c) => c.id === PINNED_IDS[0]);
    const b = pool.find((c) => c.id === PINNED_IDS[1]);
    if (a && b && a.id !== b.id) {
      hero = a;
      rival = b;
    }
  }

  /* ---- ٢) الاختيار التلقائي: مستويان متجاوران ----
     لماذا؟ لأن مقارنة tier=5 بـ tier=2 عبثية — الفجوة السعرية
     تجعل "أفضل قيمة" تقع على الأرخص دائماً، فلا تُعلِّم شيئاً.
     المستويان المتجاوران هما موضع القرار الحقيقي للمشتري. */
  if (!hero || !rival) {
    const byTier = new Map<number, Card[]>();
    pool.forEach((c) => {
      const t = c.performanceTier ?? 0;
      byTier.set(t, [...(byTier.get(t) ?? []), c]);
    });

    // نبدأ من أعلى مستوى وننزل، بحثاً عن مستوى يليه مستوى مأهول
    const tiers = [...byTier.keys()].sort((a, b) => b - a);

    for (const t of tiers) {
      const upper = byTier.get(t)!;
      const lower = byTier.get(t - 1);
      if (!lower?.length) continue;

      // الأقوى: أرخص كرت في المستوى الأعلى (أقرب نقطة تماس)
      hero = [...upper].sort((a, b) => a.price - b.price)[0];
      // المنافس: أفضل قيمة في المستوى الأدنى
      rival = [...lower].sort(
        (a, b) =>
          valueScore(b.performanceTier ?? 0, b.price) -
          valueScore(a.performanceTier ?? 0, a.price)
      )[0];
      break;
    }
  }

  /* ---- ٣) احتياطي: أصغر فجوة مستويات ممكنة ----
     يُستدعى حين لا يوجد مستويان متجاوران مأهولان
     (عادةً لأن معظم الكروت نافدة، فالمجموعة صغيرة ومتباعدة).
     نختار أقرب زوج ممكن بدل أعلى مستوى — أقلّ سوءاً. */
  if (!hero || !rival) {
    let best: { a: Card; b: Card; gap: number; ratio: number } | null = null;

    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const a = pool[i];
        const b = pool[j];
        const gap = Math.abs((a.performanceTier ?? 0) - (b.performanceTier ?? 0));
        // عند تساوي الفجوة، نفضّل الزوج الأقرب سعراً
        const hi = Math.max(a.price, b.price);
        const lo = Math.min(a.price, b.price);
        const ratio = lo > 0 ? hi / lo : Infinity;

        if (!best || gap < best.gap || (gap === best.gap && ratio < best.ratio)) {
          best = { a, b, gap, ratio };
        }
      }
    }

    if (best) {
      // الأقوى أولاً
      const strongerFirst =
        (best.a.performanceTier ?? 0) >= (best.b.performanceTier ?? 0)
          ? [best.a, best.b]
          : [best.b, best.a];
      hero = strongerFirst[0];
      rival = strongerFirst[1];
    }
  }

  if (!hero || !rival) return null;

  // نرتّب الأرخص يميناً (اتجاه القراءة العربي: الأول يميناً)
  const [right, left] = hero.price <= rival.price ? [hero, rival] : [rival, hero];
  const pair = [right, left];

  const priceGap = Math.abs(hero.price - rival.price);
  const cheaper = hero.price <= rival.price ? hero : rival;
  const bestValueId =
    valueScore(hero.performanceTier ?? 0, hero.price) >=
    valueScore(rival.performanceTier ?? 0, rival.price)
      ? hero.id
      : rival.id;

  const compareHref = `/compare?ids=${right.id},${left.id}`;
  const isNew = Date.now() < NEW_UNTIL.getTime();

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="relative bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">

        {/* توهّج خلفي خفيف */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[32rem] h-48 bg-cyan-500/10 dark:bg-cyan-400/10 blur-3xl rounded-full"></div>

        <div className="relative grid lg:grid-cols-2 gap-10 p-8 md:p-12 items-center">

          {/* ===== النص ===== */}
          <div className="text-center lg:text-right">
            <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-6">
              {isNew && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  جديد
                </span>
              )}
              <span className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                أدوات المقارنة
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] mb-5">
              قارن قبل{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-400">
                ما تشتري.
              </span>
            </h2>

            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0">
              قارن <b className="text-slate-800 dark:text-slate-200">قطعاً مفردة</b> أو{' '}
              <b className="text-slate-800 dark:text-slate-200">أجهزة كاملة</b> جنباً إلى جنب.
              المواصفات موحّدة، والأسعار لحظية، والخلاصة محسوبة من الأرقام — لا من رأي محرّر.
            </p>

            {/* نقاط سريعة — تشمل الميزتين */}
            <ul className="space-y-2.5 mb-9 text-right max-w-lg mx-auto lg:mx-0">
              {[
                'يقول لك أيّها أنصح: للأداء · لأفضل قيمة · لأقل ميزانية',
                'يُظهر الفارق بالنسبة المئوية، ويُخفي المواصفات المتطابقة',
                'قارن تجميعاتك المحفوظة: السعر الكلي والأداء والاستهلاك',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 justify-start">
                  <svg
                    className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href={compareHref}
                className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 px-8 rounded-2xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2 overflow-hidden"
              >
                <span className="relative z-10">شاهد هذه المقارنة</span>
                <svg
                  className="w-4 h-4 rotate-180 relative z-10 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700"></span>
              </Link>

              <Link
                href="/compare"
                className="bg-white dark:bg-[#0F172A]/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 dark:hover:text-cyan-300 font-bold py-3.5 px-8 rounded-2xl transition-all duration-300 text-sm shadow-sm hover:-translate-y-0.5 flex items-center justify-center"
              >
                قارن قطعاً تختارها
              </Link>
            </div>

            {/* ===== المسار الثاني: مقارنة التجميعات الكاملة =====
                مستقلّ عن أزرار القطع كي لا يزاحمها، وواضح كفاية ليُكتشف. */}
            <Link
              href="/compare/builds"
              className="group mt-4 flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm hover:border-cyan-400/60 dark:hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-500/10 transition-all max-w-lg mx-auto lg:mx-0"
            >
              <span className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-lg shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                ⚖️
              </span>
              <span className="flex-1 min-w-0 text-right">
                <span className="block text-[13px] font-black text-slate-900 dark:text-white leading-snug">
                  عندك أكثر من تجميعة؟ قارنها كاملة
                </span>
                <span className="block text-[11.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  السعر الكلي · الأداء · الاستهلاك · قطعة بقطعة
                </span>
              </span>
              <svg
                className="w-4 h-4 shrink-0 text-cyan-500 transition-transform group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
          </div>

          {/* ===== معاينة حيّة (بيانات حقيقية) ===== */}
          <Link href={compareHref} className="group/preview block">
            <div className="relative bg-slate-50/80 dark:bg-[#0B1120]/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden group-hover/preview:border-cyan-500/50 transition-colors">

              {/* رأس المعاينة */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/70"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70"></span>
                <span className="mr-auto font-mono text-[9px] text-slate-400 truncate" dir="ltr">
                  tajme3ti.com/compare
                </span>
              </div>

              {/* عمودا القطع */}
              <div className="grid grid-cols-2">
                {pair.map((c) => {
                  const isBest = c.id === bestValueId;
                  return (
                    <div
                      key={c.id}
                      className={`p-4 border-l last:border-l-0 border-slate-200 dark:border-slate-800 relative ${
                        isBest ? 'bg-cyan-500/[0.06] dark:bg-cyan-400/[0.05]' : ''
                      }`}
                    >
                      {isBest && (
                        <>
                          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                          <div className="mb-2.5 text-center font-mono text-[8px] font-black text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 rounded-sm py-1 uppercase tracking-widest">
                            أفضل قيمة
                          </div>
                        </>
                      )}
                      {!isBest && <div className="mb-2.5 h-[22px]"></div>}

                      <div className="h-16 bg-white rounded-sm mb-3 flex items-center justify-center p-1.5 border border-slate-100 dark:border-slate-800">
                        <img
                          src={productImage(c.imageUrl, `/images/${GPU_CATEGORY_ID}/boxed.png`)}
                          alt={c.name}
                          className="max-w-full max-h-full object-contain mix-blend-multiply"
                        />
                      </div>

                      <div className="font-mono text-[8px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                        {c.brand}
                      </div>
                      <div className="text-[11px] font-black text-slate-900 dark:text-white leading-snug line-clamp-2 min-h-[2rem]">
                        {c.name}
                      </div>

                      {/* مستوى الأداء */}
                      <div className="mt-3 text-center text-[10px] tracking-widest" dir="ltr">
                        <span className="text-cyan-500 dark:text-cyan-400">
                          {'●'.repeat(c.performanceTier ?? 0)}
                        </span>
                        <span className="text-slate-200 dark:text-slate-700">
                          {'●'.repeat(5 - (c.performanceTier ?? 0))}
                        </span>
                      </div>

                      {/* السعر */}
                      <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-center">
                        <div className="inline-flex items-center gap-1 font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                          {c.price.toLocaleString('en-US')}
                          <RiyalIcon size="h-3 w-3" />
                        </div>
                        {c.id === cheaper.id && (
                          <div className="mt-0.5 text-[9px] font-bold text-emerald-600/70 dark:text-emerald-400/70">
                            الأوفر
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* شريط الخلاصة */}
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
                <p className="font-mono text-[9px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                  فارق السعر{' '}
                  <span className="text-red-500 dark:text-red-400 font-black">
                    {priceGap.toLocaleString('en-US')}
                  </span>{' '}
                  ريال · اضغط لعرض المقارنة الكاملة
                </p>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}