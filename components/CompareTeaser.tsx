import Link from 'next/link';
import { prisma } from '../lib/prisma';
import { isAvailable, cheapestOffer } from '../lib/stores';
import { OFFER_INCLUDE } from '../lib/stores-server';
import { specBadges } from '../lib/spec-badges';
import { levelWord } from '../lib/perf-rating';
import { formatPrice } from '../lib/price';

/* ============ «قارن قبل ما تشتري» — لوحة مصغّرة بجدولٍ حقيقيّ (شكل هـ · 2026-10-29) ============
 *
 * كانت القسمَ الأطول في الرئيسية (عنوان ٤٨px وبطاقتان بصورتين). صارت لوحةً
 * واحدة: النصّ والأزرار يميناً، ومعاينةُ جدول المقارنة يساراً لكرتين حقيقيّين
 * من مستويين متجاورين — اختيارهما كما كان (أدناه). */

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

const pctDiff = (a: number, b: number) => (a > 0 ? Math.round(((b - a) / a) * 100) : 0);

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
      specs: true,
      tdpWattage: true,
      performanceTier: true,
      ...OFFER_INCLUDE,
    },
  });

  // نعرض قطعاً متوفّرة فقط — لا معنى لعرض مقارنة لقطع لا تُشترى
  const pool = gpus.filter(isAvailable);

  // تشخيص أثناء التطوير فقط — يظهر في طرفية `next dev`، لا في الإنتاج
  if (process.env.NODE_ENV === 'development') {
    const dist = pool.reduce<Record<number, number>>((m, c) => {
      const t = c.performanceTier ?? 0;
      m[t] = (m[t] ?? 0) + 1;
      return m;
    }, {});
    console.log(`[CompareTeaser] كروت في الفئة: ${gpus.length} · متوفّرة: ${pool.length} · توزيع المستويات:`, dist);
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

    const tiers = [...byTier.keys()].sort((a, b) => b - a);
    for (const t of tiers) {
      const upper = byTier.get(t)!;
      const lower = byTier.get(t - 1);
      if (!lower?.length) continue;
      // الأقوى: أرخص كرت في المستوى الأعلى (أقرب نقطة تماس)
      hero = [...upper].sort((a, b) => a.price - b.price)[0];
      // المنافس: أفضل قيمة في المستوى الأدنى
      rival = [...lower].sort(
        (a, b) => valueScore(b.performanceTier ?? 0, b.price) - valueScore(a.performanceTier ?? 0, a.price),
      )[0];
      break;
    }
  }

  /* ---- ٣) احتياطي: أصغر فجوة مستويات ممكنة ---- */
  if (!hero || !rival) {
    let best: { a: Card; b: Card; gap: number; ratio: number } | null = null;
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const a = pool[i];
        const b = pool[j];
        const gap = Math.abs((a.performanceTier ?? 0) - (b.performanceTier ?? 0));
        const hi = Math.max(a.price, b.price);
        const lo = Math.min(a.price, b.price);
        const ratio = lo > 0 ? hi / lo : Infinity;
        if (!best || gap < best.gap || (gap === best.gap && ratio < best.ratio)) best = { a, b, gap, ratio };
      }
    }
    if (best) {
      const strongerFirst = (best.a.performanceTier ?? 0) >= (best.b.performanceTier ?? 0) ? [best.a, best.b] : [best.b, best.a];
      hero = strongerFirst[0];
      rival = strongerFirst[1];
    }
  }

  if (!hero || !rival) return null;

  // الأرخص أوّلاً (يميناً في جدولٍ عربيّ)
  const [right, left] = hero.price <= rival.price ? [hero, rival] : [rival, hero];
  const pair = [right, left];
  const priceGap = Math.abs(hero.price - rival.price);
  const cheaper = hero.price <= rival.price ? hero : rival;
  const bestValue =
    valueScore(hero.performanceTier ?? 0, hero.price) >= valueScore(rival.performanceTier ?? 0, rival.price) ? hero : rival;
  const compareHref = `/compare?ids=${right.id},${left.id}`;

  /* اسمٌ قصير لرأس الجدول: بلا «GeForce»/«Radeon» التي تُطيل ولا تميّز */
  const short = (c: Card) => c.name.replace(/\b(GeForce|Radeon|NVIDIA|AMD)\b/g, '').replace(/\s+/g, ' ').trim();
  const store = (c: Card) => cheapestOffer(c.offers as any)?.store.name ?? '';
  const watts = (c: Card) => c.tdpWattage ?? 0;
  const wattDiff = watts(right) > 0 && watts(left) > 0 ? pctDiff(watts(right), watts(left)) : 0;

  const th = 'text-start font-bold text-[11.5px] text-slate-500 dark:text-slate-500 px-2 py-1.5 border-b border-slate-200 dark:border-slate-800';
  const td = 'px-2 py-2 border-b border-slate-100 dark:border-slate-800/70 text-[12.5px] font-bold text-slate-800 dark:text-slate-200 align-top';
  const k = `${td} text-slate-500 dark:text-slate-400 w-[84px]`;

  return (
    <section className="relative overflow-hidden rounded-sm border-x border-b border-t-2 border-slate-200 border-t-cyan-500/70 dark:border-slate-800 bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm shadow-sm p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center">
      <span aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[32rem] h-48 bg-cyan-500/10 blur-3xl rounded-full"></span>

      {/* ===== النصّ ===== */}
      <div className="relative flex-1 min-w-0 flex flex-col gap-3.5">
        <h2 className="text-[28px] md:text-[32px] font-black leading-[1.15] tracking-tight text-slate-900 dark:text-white">
          قارن قبل{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-400">ما تشتري.</span>
        </h2>
        <p className="text-sm leading-relaxed font-medium text-slate-600 dark:text-slate-400">
          قارن <b className="text-slate-800 dark:text-slate-200">قطعاً مفردة</b> أو <b className="text-slate-800 dark:text-slate-200">أجهزة كاملة</b> جنباً إلى جنب.
          المواصفات موحّدة، والأسعار لحظية، والخلاصة محسوبة من الأرقام — لا من رأي محرّر.
        </p>
        <ul className="flex flex-col gap-2">
          {[
            'يقول لك أيّها أنصح: للأداء · لأفضل قيمة · لأقل ميزانية',
            'يُظهر الفارق بالنسبة المئوية، ويُخفي المواصفات المتطابقة',
            'قارن تجميعاتك المحفوظة: السعر الكلي والأداء والاستهلاك',
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-[13px] font-semibold leading-relaxed text-slate-600 dark:text-slate-400">
              <span aria-hidden="true" className="mt-0.5 w-4 h-4 shrink-0 rounded-sm bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 text-[11px] font-black leading-4 text-center">✓</span>
              {t}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2.5 mt-1">
          <Link href={compareHref} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold py-2.5 px-5 rounded-sm text-[13px] shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-0.5">
            شاهد هذه المقارنة &larr;
          </Link>
          <Link href="/compare" className="bg-white dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 font-extrabold py-2.5 px-5 rounded-sm text-[13px] shadow-sm transition-all hover:-translate-y-0.5">
            افتح أداة المقارنة
          </Link>
        </div>
        <Link href="/compare/builds" className="text-[12.5px] font-bold text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors">
          عندك أكثر من تجميعة؟ قارنها كاملة: السعر الكلي · الأداء · الاستهلاك &larr;
        </Link>
      </div>

      {/* ===== معاينة الجدول (بيانات حقيقية) ===== */}
      <Link href={compareHref} className="group relative w-full lg:w-[460px] shrink-0 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0B1120]/70 overflow-hidden hover:border-cyan-500/50 transition-colors">
        <span className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0F172A]/80">
          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
          <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 ms-2" dir="ltr">tajme3ti.com/compare</span>
        </span>
        <table className="w-full border-collapse mt-1">
          <thead>
            <tr>
              <th className={th}></th>
              {pair.map((c) => (
                <th key={c.id} className={`${th} text-slate-700 dark:text-slate-200`}>
                  <span className="block text-[10.5px] font-extrabold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">{c.brand}</span>
                  <span className="block line-clamp-2 leading-snug">{short(c)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={k}>السعر</td>
              {pair.map((c) => (
                <td key={c.id} className={td}>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 tabular-nums" dir="ltr">{formatPrice(c.price)}</span>
                  <span className="ms-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-500">{store(c)}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className={k}>المواصفات</td>
              {pair.map((c) => (
                <td key={c.id} className={td}><span className="font-mono text-[12px]" dir="ltr">{specBadges(c, 3).join(' · ')}</span></td>
              ))}
            </tr>
            <tr>
              <td className={k}>الاستهلاك</td>
              {pair.map((c, i) => (
                <td key={c.id} className={td}>
                  {watts(c) > 0 ? <><span className="font-mono" dir="ltr">{watts(c)}</span> واط</> : '—'}
                  {i === 1 && wattDiff !== 0 && (
                    <span className={`ms-1.5 text-[10.5px] font-black ${wattDiff > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} dir="ltr">{wattDiff > 0 ? '+' : ''}{wattDiff}%</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className={k}>الأداء</td>
              {pair.map((c) => (
                <td key={c.id} className={`${td} font-black ${(c.performanceTier ?? 0) >= 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-cyan-700 dark:text-cyan-400'}`}>
                  {levelWord(c.performanceTier ?? 0)}
                </td>
              ))}
            </tr>
            <tr>
              <td className={`${k} border-b-0`}>الخلاصة</td>
              <td colSpan={2} className={`${td} border-b-0 text-[12px] font-semibold text-slate-700 dark:text-slate-300 leading-relaxed`}>
                الأرخص بفارق <span className="font-mono tabular-nums" dir="ltr">{formatPrice(priceGap)}</span> ريال: {short(cheaper)} · أفضل قيمة: {short(bestValue)} · والمتطابق مخفيّ
              </td>
            </tr>
          </tbody>
        </table>
      </Link>
    </section>
  );
}
