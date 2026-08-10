'use client';

/* ============ مقارنة تاريخ الأسعار ============
   خط لكل قطعة (أدنى سعر يومي عبر كل المتاجر) خلال ٩٠ يوماً.

   لماذا أدنى سعر لا سعر كل متجر: هنا نقارن **قطعاً** لا متاجر، والزائر
   يدفع الأرخص المتاح. عرض ٣ قطع × ٣ متاجر = ٩ خطوط لا تُقرأ.
   (صفحة القطعة الواحدة تفصّل المتاجر — وهذا مكانها الصحيح.)

   SVG خالص بلا مكتبة رسم، والألوان تطابق ترتيب أعمدة الجدول. */

import { formatPrice } from '../../lib/price';

export type HistorySeries = { componentId: string; points: { d: string; p: number }[] };

/* ألوان الأعمدة — نفس التتابع في كل مكان كي يربط القارئ الخط بالعمود */
export const SERIES_COLORS = ['#06b6d4', '#f59e0b', '#a855f7'];

export default function ComparePriceHistory({
  history,
  labels,
}: {
  history: HistorySeries[];
  labels: { id: string; name: string; brand: string }[];
}) {
  // نحتاج قطعتين على الأقل لكل منهما نقطتان — وإلا فلا معنى للمقارنة
  const series = history
    .map((h, i) => ({ ...h, color: SERIES_COLORS[i % SERIES_COLORS.length], label: labels.find((l) => l.id === h.componentId) }))
    .filter((s) => s.points.length >= 2);

  if (series.length < 1) {
    return (
      <div className="mt-8 bg-white/70 dark:bg-[#0F172A]/50 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-6 text-center shadow-sm">
        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">تاريخ السعر</h2>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          نجمع بيانات الأسعار لهذه القطع — سيظهر الرسم بعد عدة أيام من التتبّع.
        </p>
      </div>
    );
  }

  const W = 760;
  const H = 300;
  const PAD = { top: 18, right: 18, bottom: 30, left: 60 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const all = series.flatMap((s) => s.points);
  const prices = all.map((p) => p.p);
  const times = all.map((p) => new Date(p.d).getTime());

  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const yMin = minP - range * 0.08;
  const yMax = maxP + range * 0.08;

  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const span = t1 - t0 || 1;

  const x = (d: string) => PAD.left + ((new Date(d).getTime() - t0) / span) * plotW;
  const y = (p: number) => PAD.top + (1 - (p - yMin) / (yMax - yMin)) * plotH;

  const pathFor = (pts: { d: string; p: number }[]) =>
    pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${x(pt.d).toFixed(1)} ${y(pt.p).toFixed(1)}`).join(' ');

  const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    yPos: PAD.top + f * plotH,
    price: Math.round(yMin + (yMax - yMin) * (1 - f)),
  }));

  const fmtDate = (t: number) =>
    new Date(t).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });

  /* لكل قطعة: التغيّر خلال الفترة + أدنى سعر سُجّل.
     "أدنى سعر مسجّل" هو المرجع الذي يحكم به الزائر على السعر الحالي. */
  const stat = (pts: { d: string; p: number }[]) => {
    const first = pts[0].p;
    const last = pts[pts.length - 1].p;
    const lowest = Math.min(...pts.map((q) => q.p));
    return { change: last - first, lowest, current: last, atLowest: last <= lowest };
  };

  return (
    <div className="relative mt-8 bg-white/70 dark:bg-[#0F172A]/50 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-5 md:p-6 shadow-sm animate-fade-up">
      {/* الزاوية الهندسية — بصمة بطاقات الموقع */}
      <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-cyan-500/60 border-l-[14px] border-l-transparent pointer-events-none"></div>
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
          تاريخ السعر
          <span className="font-mono text-[10px] font-normal text-slate-400 tracking-wider">آخر 90 يوماً</span>
        </h2>
      </div>

      {/* مفتاح الألوان: القطعة + تغيّرها + أدنى سعر مسجّل */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-5">
        {series.map((s) => {
          const st = stat(s.points);
          return (
            <div
              key={s.componentId}
              className="flex items-start gap-2.5 p-2.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30"
            >
              <span className="mt-1 w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate">
                  {s.label?.name ?? '—'}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className={`font-mono text-[10px] font-black ${
                      st.change < 0 ? 'text-emerald-500' : st.change > 0 ? 'text-red-500' : 'text-slate-400'
                    }`}
                  >
                    {st.change === 0 ? 'بلا تغيّر' : `${st.change < 0 ? '▼' : '▲'} ${formatPrice(Math.abs(st.change))}`}
                  </span>
                  {st.atLowest ? (
                    <span className="font-mono text-[9px] font-black text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded-sm">
                      أدنى سعر مسجّل
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      أدناه {formatPrice(st.lowest)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        {/* الصفحة RTL والـSVG يرث الاتجاه، وفي RTL ينقلب معنى text-anchor:
            start تعني اليمين وend تعني اليسار — عكس ما بُنيت عليه إحداثيات
            هذا الرسم، فتزحف تسمياتُ المحاور إلى الهوامش. النصّ العربي نفسه
            يبقى صحيحاً لأن خوارزمية ثنائي الاتجاه تتولّى كل مقطع على حدة. */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto min-w-[560px]"
          style={{ direction: 'ltr' }}
          role="img"
          aria-label="مقارنة تاريخ أسعار القطع المختارة"
        >
          {/* شبكة أفقية + تسميات السعر */}
          {grid.map((g, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={g.yPos}
                x2={W - PAD.right}
                y2={g.yPos}
                className="stroke-slate-200 dark:stroke-slate-700/70"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
              <text
                x={PAD.left - 8}
                y={g.yPos + 4}
                textAnchor="end"
                className="fill-slate-400 dark:fill-slate-500"
                fontSize="11"
                fontWeight="700"
              >
                {g.price.toLocaleString('en-US')}
              </text>
            </g>
          ))}

          {series.map((s) => (
            <g key={s.componentId}>
              {/* تعبئة خفيفة تحت الخط تُبرز أيّ قطعة أدنى سعراً */}
              <path
                d={`${pathFor(s.points)} L ${x(s.points[s.points.length - 1].d).toFixed(1)} ${(PAD.top + plotH).toFixed(1)} L ${x(s.points[0].d).toFixed(1)} ${(PAD.top + plotH).toFixed(1)} Z`}
                fill={s.color}
                opacity="0.07"
              />
              <path
                d={pathFor(s.points)}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {s.points.map((pt, idx) => (
                <circle key={idx} cx={x(pt.d)} cy={y(pt.p)} r="2.8" fill={s.color}>
                  <title>{`${s.label?.name ?? ''} · ${pt.d} · ${formatPrice(pt.p)} ﷼`}</title>
                </circle>
              ))}
            </g>
          ))}

          <text x={PAD.left} y={H - 8} textAnchor="start" className="fill-slate-400 dark:fill-slate-500" fontSize="11" fontWeight="700">
            {fmtDate(t0)}
          </text>
          <text x={W - PAD.right} y={H - 8} textAnchor="end" className="fill-slate-400 dark:fill-slate-500" fontSize="11" fontWeight="700">
            {fmtDate(t1)}
          </text>
        </svg>
      </div>

      <p className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 font-mono text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
        أدنى سعر متاح لكل قطعة في كل يوم — نقاط حقيقية مسجّلة، بلا تقدير للفجوات
      </p>
    </div>
  );
}
