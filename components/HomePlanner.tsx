'use client';

/* ============ «قل لنا وش بتسوي» — الشيء الحيّ في الرئيسية (2026-11-02) ============
 * خطط «ما تدري وش تبي؟» نفسها (lib/intent-plans) محسوبةً في الخادم لكلّ استخدامٍ
 * ودقّة (lib/home-showcase)، فالاختيار يبدّل التجميعة فوراً بلا طلب: القطع الثمان
 * بأرخص متجر، والمجموع يعدّ إليه، وتوزيعه على المتاجر، والإطارات المقيسة،
 * ومقاسات التركيب خطوطَ أبعاد كرسم المخطّط. و«افتحها في الباني» يفتحها كاملة.
 * الحركة بعد أوّل نقرة فقط — الصفحة تُرسم ساكنةً وكاملة. */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import RiyalSign from './RiyalSign';
import { formatPrice, formatTotal } from '../lib/price';
import { catMeta } from '../lib/category-meta';
import { GPU_PERF_SOURCE } from '../lib/gpu-perf';
import { PLAN_CATS, PLAN_RES, planHref, planKey, type Gauge, type PlanView, type Planner, type ShowStore } from '../lib/home-plan';

type Tier = PlanView['key'];
const TIERS: { key: Tier; label: string }[] = [
  { key: 'value', label: 'اقتصادية' },
  { key: 'balanced', label: 'متوازنة' },
  { key: 'strong', label: 'قوية' },
];

/* المجموع يعدّ من القديم إلى الجديد بدل أن يقفز */
function useTween(target: number, ms = 520) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (cur.current === target) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { cur.current = target; setV(target); return; }
    const from = cur.current;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      cur.current = from + (target - from) * (1 - (1 - k) ** 3);
      setV(cur.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

const GAUGE: Record<Gauge['key'], { label: string; unit: string; of: (g: Gauge) => string }> = {
  gpu: { label: 'طول الكرت', unit: 'مم', of: (g) => `الكيس يتّسع لـ${g.max} مم · يبقى ${Math.round(g.max - g.value)} مم` },
  cooler: { label: 'ارتفاع المبرّد', unit: 'مم', of: (g) => `أقصى ارتفاع في الكيس ${g.max} مم` },
  rad: { label: 'رادييتر المبرّد', unit: 'مم', of: (g) => (g.value === g.max ? `مقاس فتحة الكيس بالضبط (${g.max} مم)` : `الكيس يقبل حتى ${g.max} مم`) },
  psu: { label: 'سحب الطاقة', unit: 'واط', of: (g) => `${g.value} واط + هامش ${g.extra} للقفزات · المزوّد ${g.max} واط` },
};

function GaugeRow({ g }: { g: Gauge }) {
  const meta = GAUGE[g.key];
  const pct = (n: number) => `${Math.min(100, (n / g.max) * 100).toFixed(1)}%`;
  const tight = (g.value + g.extra) / g.max > 0.94;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="font-extrabold text-slate-700 dark:text-slate-300">{meta.label}</span>
        <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums" dir="ltr">
          <b className="text-slate-900 dark:text-white">{Math.round(g.value + g.extra)}</b> / {g.max} {g.key === 'psu' ? 'W' : 'mm'}
        </span>
      </div>
      {/* خطّ أبعاد: علامتان عند الصفر والحدّ، والمملوء حتى المقاس */}
      <div className="relative mt-1.5 h-3.5">
        <span className="absolute inset-x-0 top-1/2 h-px bg-slate-300 dark:bg-slate-700"></span>
        <span className="absolute start-0 inset-y-0 w-px bg-slate-400 dark:bg-slate-500"></span>
        <span className="absolute end-0 inset-y-0 w-px bg-slate-400 dark:bg-slate-500"></span>
        <span className="absolute start-0 top-[3px] h-2 flex transition-[width] duration-500 ease-out" style={{ width: pct(g.value + g.extra) }}>
          <span className={`h-full rounded-s-sm ${tight ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{ width: `${((g.value / (g.value + g.extra)) * 100).toFixed(1)}%` }}></span>
          {g.extra > 0 && <span className="h-full flex-1 rounded-e-sm hp-hatch"></span>}
        </span>
      </div>
      <p className="mt-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400">{meta.of(g)}</p>
    </div>
  );
}

export default function HomePlanner({ planner, stores }: { planner: Planner; stores: ShowStore[] }) {
  const { uses, plans, parts } = planner;
  const [use, setUse] = useState(uses.some((u) => u.key === 'aaa-gaming') ? 'aaa-gaming' : uses[0]?.key);
  const [res, setRes] = useState<(typeof PLAN_RES)[number]>('1440p');
  const [tier, setTier] = useState<Tier>('balanced');
  const [moved, setMoved] = useState(false);
  /* شريط الجوال: يظهر والأداة في الشاشة والخلاصة لم تصل بعد — كان المجموع وزرّ الباني
     تحت القطع الثمان، قرابة ٨٠٠px تحت الاختيار */
  const sectionRef = useRef<HTMLElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState({ section: false, aside: false });
  useEffect(() => {
    const sec = sectionRef.current, side = asideRef.current;
    if (!sec || !side || typeof IntersectionObserver === 'undefined') return;
    const watch = (el: Element, key: 'section' | 'aside', rootMargin: string) => {
      const io = new IntersectionObserver(([e]) => setSeen((v) => (v[key] === e.isIntersecting ? v : { ...v, [key]: e.isIntersecting })), { rootMargin });
      io.observe(el);
      return io;
    };
    /* الأداة «في الشاشة» حين يتجاوز أعلاها ٦٠٪ من ارتفاعها */
    const a = watch(sec, 'section', '0px 0px -40% 0px');
    const b = watch(side, 'aside', '0px');
    return () => { a.disconnect(); b.disconnect(); };
  }, []);

  const u = uses.find((x) => x.key === use) ?? uses[0];
  const list = u ? plans[planKey(u.key, u.res ? res : null)] ?? [] : [];
  /* المستوى المطلوب، وإلّا أقربُ مستوى موجود (بعض التركيبات خطّتان أو واحدة) */
  const order = TIERS.map((t) => t.key);
  const plan = list.find((p) => p.key === tier)
    ?? [...list].sort((a, b) => Math.abs(order.indexOf(a.key) - order.indexOf(tier)) - Math.abs(order.indexOf(b.key) - order.indexOf(tier)))[0];
  const total = useTween(plan?.total ?? 0);
  if (!u || !plan) return null;

  const pick = (fn: () => void) => { fn(); setMoved(true); };
  const showBar = seen.section && !seen.aside;
  const tierLabel = TIERS.find((t) => t.key === plan.key)?.label;

  /* المجموع موزّعاً على المتاجر */
  const byStore = new Map<number, number>();
  for (const id of plan.parts) if (id) byStore.set(parts[id].store, (byStore.get(parts[id].store) ?? 0) + parts[id].price);
  const split = [...byStore.entries()].sort((a, b) => b[1] - a[1]);
  /* سلّم المستويات بإطاراتها — لما تكون الخطط مقيسة */
  const ladder = list.filter((p) => p.perf);
  const ladderMax = Math.max(...ladder.map((p) => p.perf!.fps), 1);

  const chip = (on: boolean) =>
    `rounded-sm border px-3.5 py-2 text-[14px] font-extrabold transition-colors ${on
      ? 'border-cyan-600 bg-cyan-600 text-white shadow-[0_0_14px] shadow-cyan-500/30'
      : 'border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-[#0F172A]/80 text-slate-700 dark:text-slate-300 hover:border-cyan-500/60 hover:text-cyan-700 dark:hover:text-cyan-300'}`;

  return (
    <section ref={sectionRef} id="planner" className="scroll-mt-24 flex flex-col gap-6">
      <header className="flex flex-col items-center text-center gap-2.5">
        <h2 className="text-[27px] sm:text-[40px] leading-tight font-black tracking-tight text-slate-900 dark:text-white">
          قل لنا وش بتسوي، ونجمّعها لك الحين
        </h2>
        <p className="max-w-2xl text-[15px] sm:text-[16.5px] font-medium leading-relaxed text-slate-600 dark:text-slate-400">
          من القطع المتوفرة اليوم بأرخص سعر لكل قطعة، ومفحوصة قطعة قطعة: المقبس، ونوع الرام، والمقاسات، والطاقة.
        </p>
      </header>

      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="الاستخدام">
          {uses.map((x) => (
            <button key={x.key} type="button" aria-pressed={x.key === use} onClick={() => pick(() => setUse(x.key))} className={chip(x.key === use)}>
              {x.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[13px] font-bold text-slate-500 dark:text-slate-400">
          <span>الدقة</span>
          <div className="inline-flex rounded-sm border border-slate-300 dark:border-slate-700 overflow-hidden" role="group" aria-label="دقة الشاشة" dir="ltr">
            {PLAN_RES.map((r) => (
              <button
                key={r}
                type="button"
                disabled={!u.res}
                aria-pressed={u.res && r === res}
                onClick={() => pick(() => setRes(r))}
                className={`px-3.5 py-1.5 font-mono text-[13px] font-black transition-colors border-s first:border-s-0 border-slate-300 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed ${u.res && r === res ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white/80 dark:bg-[#0F172A]/80 text-slate-700 dark:text-slate-300 enabled:hover:text-cyan-700 dark:enabled:hover:text-cyan-300'}`}
              >
                {r}
              </button>
            ))}
          </div>
          {!u.res && <span>ما تفرق هنا</span>}
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] rounded-sm border border-slate-200 dark:border-slate-800 border-t-2 border-t-cyan-500 dark:border-t-cyan-500 bg-white/85 dark:bg-[#0F172A]/80 backdrop-blur-sm shadow-xl shadow-slate-900/5 dark:shadow-black/30">
        {/* ---- القطع ---- */}
        <div className="min-w-0">
          <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800" role="tablist" aria-label="المستوى">
            {TIERS.map((t) => {
              const p = list.find((x) => x.key === t.key);
              const on = p?.key === plan.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  disabled={!p}
                  onClick={() => pick(() => setTier(t.key))}
                  className={`relative flex flex-col items-center gap-0.5 px-2 py-3.5 transition-colors border-s first:border-s-0 border-slate-200 dark:border-slate-800 disabled:cursor-not-allowed ${on ? 'bg-cyan-500/[0.07]' : 'enabled:hover:bg-slate-500/5'}`}
                >
                  {on && <span className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-cyan-500"></span>}
                  <span className={`text-[14px] font-extrabold ${on ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-600 dark:text-slate-400'}`}>{t.label}</span>
                  <span className={`font-mono text-[15px] sm:text-[17px] font-black tabular-nums ${p ? (on ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400') : 'text-slate-400 dark:text-slate-600'}`} dir="ltr">
                    {p ? <>{formatTotal(p.total)}<RiyalSign /></> : '—'}
                  </span>
                </button>
              );
            })}
          </div>

          <ol className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
            {PLAN_CATS.map((cat, i) => {
              const id = plan.parts[i];
              const part = id ? parts[id] : null;
              const store = part ? stores[part.store] : null;
              return (
                <li
                  key={`${cat}-${id ?? 'none'}`}
                  className={`grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[104px_minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-1 px-4 sm:px-5 py-3.5 ${moved ? 'hp-in' : ''}`}
                  style={moved ? { ['--d' as string]: `${i * 35}ms` } : undefined}
                >
                  <span className="col-span-2 sm:col-span-1 text-[12.5px] font-extrabold text-slate-500 dark:text-slate-400">{catMeta(cat).label}</span>
                  {part ? (
                    <>
                      <bdi className="min-w-0 truncate text-right text-[14.5px] font-black text-slate-900 dark:text-white" dir="ltr" title={part.name}>{part.name}</bdi>
                      <span className="hidden sm:inline-flex items-center rounded-sm border border-s-2 border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[12px] font-extrabold text-slate-600 dark:text-slate-300 whitespace-nowrap" style={{ borderInlineStartColor: store?.color }}>
                        {store?.name}
                      </span>
                      <span className="font-mono text-[15px] font-black text-slate-900 dark:text-white tabular-nums whitespace-nowrap" dir="ltr">
                        {formatPrice(part.price)}<RiyalSign />
                      </span>
                      <span className="sm:hidden col-span-2 -mt-0.5 text-[12px] font-bold text-slate-500 dark:text-slate-400">
                        <span className="inline-block h-2 w-2 rounded-full me-1.5 align-middle" style={{ background: store?.color }}></span>{store?.name}
                      </span>
                    </>
                  ) : (
                    <span className="sm:col-span-3 text-[13.5px] font-bold text-slate-500 dark:text-slate-400">
                      {cat === 'GPU' ? 'بدون كرت — رسوميات المعالج تكفي' : cat === 'Cooler' ? 'مبرّد المعالج اللي في علبته يكفي' : '—'}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          {/* مقاسات التركيب — خطوط أبعاد تحت القطع كذيل المخطّط */}
          {plan.gauges.length > 0 && (
            <div className="border-t border-dashed border-slate-300 dark:border-slate-700 px-4 sm:px-5 pt-4 pb-5">
              <span className="text-[13px] font-extrabold text-slate-500 dark:text-slate-400">تركب؟ قسناها لك</span>
              <div className="mt-3 grid sm:grid-cols-3 gap-x-6 gap-y-4">
                {plan.gauges.map((g) => <GaugeRow key={g.key} g={g} />)}
              </div>
            </div>
          )}
        </div>

        {/* ---- الخلاصة ---- */}
        <aside ref={asideRef} className="flex flex-col gap-5 border-t lg:border-t-0 lg:border-s border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <div>
            <span className="text-[13px] font-extrabold text-slate-500 dark:text-slate-400">المجموع اليوم</span>
            <p className="font-mono text-[44px] leading-none mt-1.5 font-black text-emerald-600 dark:text-emerald-400 tabular-nums" dir="ltr">
              {formatTotal(total)}<RiyalSign />
            </p>
            {/* المجموع موزّعاً: شريطٌ بلون كلّ متجر */}
            <div className="mt-4 flex h-2.5 gap-0.5 overflow-hidden rounded-sm" dir="rtl">
              {split.map(([s, sum]) => (
                <span key={s} className="h-full transition-[flex-grow] duration-500 ease-out" style={{ flexGrow: sum, flexBasis: 0, background: stores[s]?.color }} title={stores[s]?.name}></span>
              ))}
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] font-bold text-slate-600 dark:text-slate-400">
              {split.map(([s, sum]) => (
                <li key={s} className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full ring-1 ring-slate-900/15 dark:ring-white/10" style={{ background: stores[s]?.color }}></span>
                  {stores[s]?.name}
                  <span className="font-mono text-slate-800 dark:text-slate-200 tabular-nums" dir="ltr">{formatTotal(sum)}</span>
                </li>
              ))}
            </ul>
          </div>

          {plan.perf ? (
            <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-4">
              <p className="flex items-baseline gap-2">
                <span className="font-mono text-[30px] leading-none font-black text-slate-900 dark:text-white tabular-nums">{Math.round(plan.perf.fps)}</span>
                <span className="text-[14px] font-extrabold text-slate-700 dark:text-slate-300">إطار بالثانية</span>
                <span className={`ms-auto rounded-sm px-2 py-0.5 text-[12px] font-black ${plan.perf.feel === 'مريح' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : plan.perf.feel === 'مقبول' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'}`}>{plan.perf.feel}</span>
              </p>
              <p className="mt-1.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                متوسط الألعاب على <bdi className="font-mono">{plan.perf.res}</bdi> من قياسات {GPU_PERF_SOURCE.name}{plan.perf.note ? ` · ${plan.perf.note}` : ''}
              </p>
              {/* وش تكسب لو زدت: إطارات كلّ مستوى بسعره — المختار مضيء */}
              {ladder.length > 1 && (
                <ul className="mt-4 flex flex-col gap-2">
                  {ladder.map((p) => {
                    const on = p.key === plan.key;
                    return (
                      <li key={p.key}>
                        <button type="button" onClick={() => pick(() => setTier(p.key))} className="group w-full grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-start">
                          <span className={`text-[12.5px] font-extrabold ${on ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>
                            {TIERS.find((t) => t.key === p.key)?.label} · <span className="font-mono tabular-nums" dir="ltr">{formatTotal(p.total)}</span>
                          </span>
                          <span className={`font-mono text-[13px] font-black tabular-nums ${on ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{Math.round(p.perf!.fps)}</span>
                          <span className="col-span-2 h-1.5 rounded-sm bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <span className={`block h-full rounded-sm transition-[width] duration-500 ease-out ${on ? 'bg-gradient-to-l from-cyan-400 to-blue-500' : 'bg-slate-400 dark:bg-slate-600'}`} style={{ width: `${Math.min(100, (p.perf!.fps / ladderMax) * 100).toFixed(1)}%` }}></span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <p className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-4 text-[13.5px] font-bold leading-relaxed text-slate-600 dark:text-slate-400">{u.reason}.</p>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <p className={`text-[13px] font-extrabold ${plan.issues ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {plan.issues ? `فيها ${plan.issues === 1 ? 'ملاحظة' : `${plan.issues} ملاحظات`} تشوفها في الباني` : '✓ كل القطع متوافقة مع بعض'}
            </p>
            <Link
              href={planHref(plan.parts)}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-6 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-0.5"
            >
              افتحها في الباني وعدّل عليها
            </Link>
          </div>
        </aside>
      </div>

      {/* ---- شريط الجوال: المجموع والزرّ تحت الإبهام ---- */}
      <div
        inert={!showBar}
        className={`lg:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-out ${showBar ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div
          className="flex items-center gap-3 border-t-2 border-cyan-500 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md px-4 pt-2.5 shadow-[0_-8px_24px_rgba(2,6,23,0.18)]"
          style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}
        >
          <div className="min-w-0">
            <span className="block truncate text-[12px] font-extrabold text-slate-500 dark:text-slate-400">
              {u.label} · {tierLabel}{u.res ? <> · <bdi className="font-mono">{res}</bdi></> : null}
            </span>
            <span className="font-mono text-[22px] leading-tight font-black text-emerald-600 dark:text-emerald-400 tabular-nums" dir="ltr">
              {formatTotal(total)}<RiyalSign />
            </span>
          </div>
          <Link
            href={planHref(plan.parts)}
            className="ms-auto shrink-0 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-[14px] font-bold text-white shadow-md shadow-cyan-500/25"
          >
            افتحها في الباني
          </Link>
        </div>
      </div>
    </section>
  );
}
