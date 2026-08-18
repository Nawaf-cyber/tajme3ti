'use client';

/* ============ مقارنة تاريخ الأسعار ============
   خط لكل قطعة (أدنى سعر يومي عبر كل المتاجر) خلال ٩٠ يوماً.

   لماذا أدنى سعر لا سعر كل متجر: هنا نقارن **قطعاً** لا متاجر، والزائر
   يدفع الأرخص المتاح. عرض ٣ قطع × ٣ متاجر = ٩ خطوط لا تُقرأ.
   (صفحة القطعة الواحدة تفصّل المتاجر — وهذا مكانها الصحيح.)

   SVG خالص بلا مكتبة رسم، والألوان تطابق ترتيب أعمدة الجدول. */

import { formatPrice } from '../../lib/price';
import { Panel, SectionHeading } from '../../components/Panel';

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
      <section className="mt-8 flex flex-col gap-4">
        <SectionHeading note="آخر 90 يوماً">تاريخ السعر</SectionHeading>
        <Panel className="px-6 py-8 text-center">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            نجمع بيانات الأسعار لهذه القطع — سيظهر الرسم بعد عدة أيام من التتبّع.
          </p>
        </Panel>
      </section>
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
    /* ⚠️ كان هنا غلافٌ وعنوانٌ مكتوبان يدوياً — نسخةٌ ثانية من `Panel` و
       `SectionHeading` بأرقامٍ مقاربة لا مطابقة: حدٌّ علويّ `border-t-cyan-500`
       بدل `/70`، وخلفيةٌ `/50` بدل `/60`، وعنوانٌ `text-lg` وشريطٌ `h-7` بدل
       `text-xl` و`h-8`، وملحوظةٌ بخطٍّ أحاديّ المسافة (لا يحمل حروفاً عربية).

       فبدا القسمان متشابهين ومختلفين معاً — وهو أسوأ من اختلافٍ صريح.
       والآن مصدرٌ واحد: أي تعديلٍ على `Panel` يصل الصفحتين. */
    <section className="mt-8 flex flex-col gap-4 animate-fade-up">
      <SectionHeading note="آخر 90 يوماً">تاريخ السعر</SectionHeading>
      <Panel className="px-5 py-5 md:px-6">

      {/* ============ مفتاح الألوان ============
          كان بطاقاتٍ محاطةً في شبكة — إطارٌ داخل إطار، وهو ما لا تفعله
          صفحة القطعة: مفتاحها سطرٌ واحد من شرطاتٍ رفيعة بلون الخطّ نفسه،
          فتربط العين الشرطةَ بالخطّ في الرسم بلا وسيط.

          فأُخذ النمط نفسه هنا: شرطةٌ بلون السلسلة، ثم الاسم، ثم تغيّره —
          وبقيت شارة «أدنى سعر مسجّل» لأنها خبرٌ لا زينة. */}
      <div className="flex items-center flex-wrap gap-x-5 gap-y-2 mb-4">
        {series.map((s) => {
          const st = stat(s.points);
          return (
            <div key={s.componentId} className="flex items-center gap-1.5 min-w-0">
              <span
                className="inline-block w-5 h-0.5 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[190px]">
                {s.label?.name ?? '—'}
              </span>
              <span
                className={`text-[11px] font-black flex items-center gap-0.5 shrink-0 ${
                  st.change < 0 ? 'text-emerald-500' : st.change > 0 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {st.change === 0 ? '—' : `${st.change < 0 ? '▼' : '▲'} ${formatPrice(Math.abs(st.change))}`}
              </span>
              {st.atLowest && (
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded-sm shrink-0">
                  أدنى سعر مسجّل
                </span>
              )}
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
      </Panel>
    </section>
  );
}
