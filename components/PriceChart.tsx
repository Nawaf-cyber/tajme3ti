'use client';
/* ============ رسم تاريخ السعر — الجزء التفاعليّ ============
 *
 * البيانات تُجهَّز في الخادم (components/PriceHistoryChart) وتصل هنا سلاسلَ يوميّة
 * جاهزة، والتسميات نصوصٌ محسوبة هناك — فلا يختلف تاريخٌ بين الخادم والمتصفّح.
 *
 * الشكل «نموذج ب» (2026-11-24): خطٌّ واحد لأرخص سعرٍ متوفّر بتدرّج لون الموقع،
 * وفوقه سعر اليوم كبيراً وسطرُ «الأدنى · الأعلى»، وتحته سعرُ كلّ متجرٍ بائع.
 * جاء بعد تصميمٍ أوّل (رقمٌ كبير + شارة «فوق/تحت المتوسط» + جملة حكم + ملخّص
 * ثلاثيّ + خطّ متوسّط) رفضه نوّاف: «باهت»، والرقم نفسه يتكرّر ثلاث مرّات،
 * والشارة الحمراء سلبيّة. ⚠️ فكلّ رقمٍ يظهر مرّةً واحدة، ولا شارات سلبيّة.
 *
 *  - المؤشّر/اللمس يبدّل الرقم الكبير وأسعار المتاجر تحت الرسم إلى ذلك اليوم،
 *    فالإصبع لا يغطّي ما يقرؤه. والأسهم يمين/يسار تتنقّل بين الأيّام.
 *  - الرسم يُقاس بعرضه الحقيقيّ (ResizeObserver) فالخطّ والأرقام بحجمها الصحيح
 *    على أيّ شاشة.
 *  - المتجر النافد لا خطّ له ولا مربّع؛ سطرٌ واحد «نافدة الحين عند: …».
 *
 * ⚠️ عناصر النصّ في الـSVG قليلة عمداً (محاور + شارة اليوم): كان التلميح يُرسم
 * لكلّ يوم × كلّ متجر فصار في الصفحة ٤٨٩ عنصراً نصّياً (مراجعة أدسنس 2026-10-15).
 */
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

export type ChartDay = { key: string; label: string; month: string; dom: number };
export type ChartStore = { slug: string; name: string; color: string; live: boolean; vals: (number | null)[] };

const money = (n: number) => Math.round(n).toLocaleString('en-US');

const Riyal = ({ c }: { c: string }) => (
  <span
    className={`inline-block align-[-2px] bg-current ${c}`}
    style={{ maskImage: "url('/riyal.svg')", WebkitMaskImage: "url('/riyal.svg')", maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}
  />
);

/* خطوة شبكة «مستديرة» تعطي ٣–٤ خطوط */
function niceStep(span: number) {
  const raw = span / 3;
  for (const s of [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000]) if (s >= raw) return s;
  return 10000;
}

export default function PriceChart({
  days,
  stores,
  low,
  lowStore,
  anyLive,
}: {
  days: ChartDay[];
  stores: ChartStore[];
  /** أرخص سعر في كلّ يوم بين المتاجر البائعة الآن (null = لا قراءة) */
  low: (number | null)[];
  lowStore: (string | null)[];
  /** هل يبيعها أحدٌ الآن؟ لا ← «آخر سعر رصدناه» بدل «سعر اليوم» */
  anyLive: boolean;
}) {
  const canRange = days.length > 35;
  const [range, setRange] = useState<30 | 90>(90);
  const [hi, setHi] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    setW(Math.round(el.getBoundingClientRect().width));
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { D, L, LS, S, min, max, minI } = useMemo(() => {
    const start = canRange ? Math.max(0, days.length - range) : 0;
    const L = low.slice(start);
    const lows = L.filter((x): x is number => x != null);
    const min = lows.length ? Math.min(...lows) : 0;
    const max = lows.length ? Math.max(...lows) : 0;
    return {
      D: days.slice(start),
      L,
      LS: lowStore.slice(start),
      S: stores.map((s) => ({ ...s, vals: s.vals.slice(start) })),
      min,
      max,
      minI: L.indexOf(min),
    };
  }, [days, low, lowStore, stores, range, canRange]);

  const n = D.length;
  const lastI = (() => { for (let i = n - 1; i >= 0; i--) if (L[i] != null) return i; return n - 1; })();
  const today = L[lastI] ?? 0;
  const W = w || 720; // قبل القياس (الخادم): عرض المكتب، ثمّ يُعاد بالعرض الحقيقي
  const mobile = W < 560;
  const H = mobile ? 220 : 270;
  const RA = 46, LP = 2, T = 12, B = 28;
  const pw = Math.max(1, W - LP - RA);

  const vals = L.filter((x): x is number => x != null);
  const dMin = vals.length ? Math.min(...vals) : 0;
  const dMax = vals.length ? Math.max(...vals) : 1;
  const step = niceStep(Math.max(dMax - dMin, dMax * 0.04, 20));
  let y0 = Math.floor(dMin / step) * step, y1 = Math.ceil(dMax / step) * step;
  if (dMin - y0 < step * 0.15) y0 -= step; // لا يلتصق الخطّ بالمحور
  if (y1 - dMax < step * 0.1) y1 += step;
  y0 = Math.max(0, y0);
  const ticks: number[] = [];
  for (let p = y0; p <= y1 + 0.1; p += step) ticks.push(p);

  const x = (i: number) => LP + (n <= 1 ? pw : (i / (n - 1)) * pw);
  const y = (p: number) => T + (1 - (p - y0) / (y1 - y0 || 1)) * (H - T - B);
  /* خطّ «درجات»: السعر يبقى حتى يتغيّر — أصدق من خطٍّ مائل بين قراءتين */
  let line = '', prev: number | null = null;
  L.forEach((p, i) => {
    if (p == null) { prev = null; return; }
    line += prev == null ? `M${x(i).toFixed(1)},${y(p).toFixed(1)}` : `H${x(i).toFixed(1)}V${y(p).toFixed(1)}`;
    prev = p;
  });
  const firstLow = L.findIndex((p) => p != null);
  const area = line ? `${line}V${H - B}H${x(firstLow)}Z` : '';

  /* محور الزمن: بدايات الشهور للـ٩٠ يوماً، وكلّ أسبوع للـ٣٠ */
  const longRange = n > 40;
  const xt = D.map((d, i) => ({ d, i }))
    .filter(({ d, i }) => (longRange ? d.dom === 1 : (n - 1 - i) % (n <= 14 ? 3 : 7) === 0))
    .filter(({ i }) => x(i) > 16 && x(i) < LP + pw - 22);

  const sel = hi != null && hi >= 0 && hi < n ? hi : null;
  const ci = sel ?? lastI;
  const cur = L[ci];
  const curStore = stores.find((s) => s.slug === LS[ci]);
  const atLow = today > 0 && today <= min * 1.01;
  const span = canRange ? range : n;

  /* مربّعات المتاجر: البائعون الآن (أو الجميع إن لم يبعها أحد)، بسعرهم في اليوم المعروض */
  const chips = S.filter((s) => s.live || !anyLive)
    .map((s) => ({ s, p: s.vals[ci] }))
    .sort((a, b) => (a.p ?? 1e12) - (b.p ?? 1e12));
  const gone = anyLive ? S.filter((s) => !s.live) : [];

  const pick = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    const i = Math.round(((clientX - r.left - LP) / pw) * (n - 1));
    setHi(Math.max(0, Math.min(n - 1, i)));
  };

  return (
    <div>
      {/* الرأس: يتبدّل مع المؤشّر/اللمس */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-1.5 text-[12px] font-bold text-slate-500 dark:text-slate-400">
            {curStore && <span className="h-2 w-2 rounded-full" style={{ background: curStore.color }} />}
            {sel != null ? D[sel].label : anyLive ? 'أرخص سعر اليوم' : 'آخر سعر رصدناه'}
            {curStore && <> · {curStore.name}</>}
            {sel != null && (
              <button onClick={() => setHi(null)} className="mr-1 text-cyan-700 dark:text-cyan-400 underline underline-offset-2">
                رجوع لليوم
              </button>
            )}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-[32px] sm:text-[36px] font-black leading-none tabular-nums text-slate-900 dark:text-white">
              {cur != null ? money(cur) : '—'}
            </span>
            {cur != null && <Riyal c="h-5 w-5 text-slate-700 dark:text-slate-300" />}
            {sel == null && anyLive && atLow && (
              <span className="text-[12px] font-black rounded-sm px-1.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                أدنى سعر خلال {span} يوم
              </span>
            )}
          </p>
          {max > min && (
            <p className="mt-2 text-[12px] font-bold text-slate-500 dark:text-slate-400">
              خلال {span} يوم: الأدنى <b className="tabular-nums text-emerald-700 dark:text-emerald-400">{money(min)}</b>
              <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
              الأعلى <b className="tabular-nums text-slate-800 dark:text-slate-200">{money(max)}</b>
            </p>
          )}
        </div>
        {canRange && (
          <Seg opts={[['30', '٣٠ يوم'], ['90', '٩٠ يوم']]} val={String(range)} on={(k) => { setRange(Number(k) as 30 | 90); setHi(null); }} />
        )}
      </div>

      {/* الرسم */}
      <div
        ref={box}
        tabIndex={0}
        aria-label="رسم تاريخ السعر — الأسهم يمين ويسار تتنقّل بين الأيّام"
        className="relative mt-5 select-none outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 rounded-sm"
        style={{ height: H, touchAction: 'pan-y' }}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') setHi(null); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            setHi((h) => Math.max(0, Math.min(n - 1, (h ?? lastI) + (e.key === 'ArrowRight' ? 1 : -1))));
          } else if (e.key === 'Escape') setHi(null);
        }}
      >
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: 'ltr', display: 'block', maxWidth: '100%' }} role="img" aria-label={`أرخص سعر يومي: الأدنى ${money(min)} والأعلى ${money(max)}`}>
          <defs>
            <linearGradient id="price-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#06b6d4" stopOpacity="0.28" />
              <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            {/* ⚠️ userSpaceOnUse: بالافتراضيّ (objectBoundingBox) يختفي الخطّ كلّه إن ثبت السعر
                طوال الفترة — مسارٌ أفقيّ ارتفاعه صفر فلا يُرسم تدرّجه */}
            <linearGradient id="price-stroke" gradientUnits="userSpaceOnUse" x1={LP} y1="0" x2={LP + pw} y2="0">
              <stop offset="0" stopColor="#6366f1" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* الشبكة والمحور الرأسيّ (يمين — قرب «اليوم») */}
          {ticks.map((p) => (
            <g key={p}>
              <line x1={LP} x2={LP + pw} y1={y(p)} y2={y(p)} className="stroke-slate-200 dark:stroke-slate-800" />
              {/* الرقم يختفي إن غطّته شارة سعر اليوم */}
              {!(today > 0 && Math.abs(y(p) - y(today)) < 14) && (
                <text x={LP + pw + 7} y={y(p) + 4} fontSize="11" fontWeight="700" className="fill-slate-400 dark:fill-slate-500">{money(p)}</text>
              )}
            </g>
          ))}
          {xt.map(({ d, i }) => (
            <text key={d.key} x={x(i)} y={H - B + 18} fontSize="11" fontWeight="700" textAnchor="middle" style={{ direction: 'rtl' }} className="fill-slate-400 dark:fill-slate-500">
              {longRange ? d.month : d.label}
            </text>
          ))}

          <path d={area} fill="url(#price-area)" />
          <path d={line} fill="none" stroke="url(#price-stroke)" strokeWidth="3" strokeLinejoin="round" />
          {sel == null && minI >= 0 && !atLow && (
            <circle cx={x(minI)} cy={y(min)} r="4.5" strokeWidth="2.5" className="fill-emerald-500 stroke-white dark:stroke-slate-900" />
          )}

          {/* اليوم: نقطة + شارة سعر على المحور */}
          {today > 0 && (
            <>
              <circle cx={x(lastI)} cy={y(today)} r="5.5" strokeWidth="2.5" className="fill-cyan-500 stroke-white dark:stroke-slate-900" />
              <g transform={`translate(${LP + pw + 3},${y(today) - 10})`}>
                <rect width={RA - 3} height="20" rx="10" className={atLow ? 'fill-emerald-600' : 'fill-cyan-600'} />
                <text x={(RA - 3) / 2} y="14" fontSize="11" fontWeight="900" fill="#fff" textAnchor="middle">{money(today)}</text>
              </g>
            </>
          )}

          {/* المؤشّر */}
          {sel != null && (
            <g>
              <line x1={x(sel)} x2={x(sel)} y1={T - 4} y2={H - B} className="stroke-slate-900 dark:stroke-white" strokeOpacity="0.3" />
              {L[sel] != null && <circle cx={x(sel)} cy={y(L[sel]!)} r="5.5" strokeWidth="2.5" className="fill-cyan-500 stroke-white dark:stroke-slate-900" />}
            </g>
          )}
        </svg>
      </div>

      {/* المتاجر: سعر كلّ متجر في اليوم المعروض، والأرخص بإطارٍ أخضر */}
      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map(({ s, p }, i) => (
            <span
              key={s.slug}
              className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[12px] font-bold text-slate-700 dark:text-slate-200 ${
                i === 0 && p != null && s.live ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              {s.name}
              {p != null ? (
                <b className={`tabular-nums ${i === 0 && s.live ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>{money(p)}</b>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </span>
          ))}
        </div>
      )}
      {gone.length > 0 && (
        <p className="mt-2 text-[12px] font-bold text-slate-400 dark:text-slate-500">
          نافدة الحين عند: {gone.map((s) => s.name).join('، ')}
        </p>
      )}
      <p className="mt-3 text-[12px] text-slate-500 dark:text-slate-400">
        الخط = أرخص سعر متوفّر كل يوم. مرّر المؤشّر أو المس الرسم تشوف سعر أي يوم.
      </p>
    </div>
  );
}

function Seg({ opts, val, on }: { opts: [string, string][]; val: string; on: (k: string) => void }) {
  return (
    <div className="inline-flex shrink-0 rounded-sm border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 p-0.5 text-[12px] font-bold">
      {opts.map(([k, l]) => (
        <button
          key={k}
          onClick={() => on(k)}
          aria-pressed={val === k}
          className={`px-2.5 py-1.5 rounded-sm ${val === k ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-300'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
