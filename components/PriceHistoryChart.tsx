import { prisma } from '../lib/prisma';

/* ============ رسم تاريخ السعر ============
   مكوّن خادم بحت (بلا 'use client') — يرندر SVG على الخادم،
   فيراه جوجل كمحتوى فعلي ولا يحتاج أي مكتبة رسم.

   يعرض 4 خطوط خلال آخر 90 يوماً:
   - خط لكل متجر (أمازون · كازاسوق · مايكروليس) بلونه الخاص.
   - خط "أدنى سعر" منقّط فوق الجميع (أرخص متجر في كل يوم).
   كل متجر يُرسم بنقاطه الحقيقية فقط — لا نسدّ الفجوات بتخمين. */

type StorePoint = { date: Date; price: number };
type StoreKey = 'amazon' | 'cazasouq' | 'microless';

const STORE_META: Record<StoreKey, { label: string; color: string }> = {
  amazon: { label: 'أمازون', color: '#FF9900' },
  cazasouq: { label: 'كازاسوق', color: '#A855F7' },
  microless: { label: 'مايكروليس', color: '#DC2626' },
};
const STORE_ORDER: StoreKey[] = ['amazon', 'cazasouq', 'microless'];
const LOWEST_COLOR = '#10B981'; // أخضر لخط أدنى سعر

const RiyalMark = () => (
  <span
    className="inline-block h-3 w-3 bg-current align-middle"
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

export default async function PriceHistoryChart({ componentId }: { componentId: string }) {
  // آخر 90 يوماً
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const rows = await prisma.priceHistory.findMany({
    where: { componentId, recordedAt: { gte: since } },
    orderBy: { recordedAt: 'asc' },
    select: { price: true, recordedAt: true, store: true },
  });

  // نجمّع النقاط لكل متجر على حدة (نقطة واحدة لكل يوم/متجر — الأدنى إن تكرر)
  const perStore: Record<StoreKey, Map<string, number>> = {
    amazon: new Map(),
    cazasouq: new Map(),
    microless: new Map(),
  };
  // ولأدنى سعر يومي عبر كل المتاجر
  const lowestByDay = new Map<string, number>();

  for (const r of rows) {
    const store = r.store as StoreKey;
    if (!STORE_META[store]) continue; // نتجاهل أي متجر غير معروف
    const day = r.recordedAt.toISOString().slice(0, 10);

    const cur = perStore[store].get(day);
    if (cur == null || r.price < cur) perStore[store].set(day, r.price);

    const low = lowestByDay.get(day);
    if (low == null || r.price < low) lowestByDay.set(day, r.price);
  }

  const toPoints = (m: Map<string, number>): StorePoint[] =>
    Array.from(m.entries())
      .map(([k, price]) => ({ date: new Date(k), price }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

  const storeSeries: { key: StoreKey; points: StorePoint[] }[] = STORE_ORDER
    .map((key) => ({ key, points: toPoints(perStore[key]) }))
    .filter((s) => s.points.length > 0);

  const lowestPoints = toPoints(lowestByDay);

  // نحتاج نقطتين على الأقل (في أي سلسلة) لرسم خط
  const maxLen = Math.max(lowestPoints.length, ...storeSeries.map((s) => s.points.length), 0);
  if (maxLen < 2) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          نجمع بيانات الأسعار لهذه القطعة — سيظهر الرسم البياني قريباً.
        </p>
      </div>
    );
  }

  // أبعاد الرسم
  const W = 720;
  const H = 260;
  const PAD = { top: 20, right: 16, bottom: 28, left: 56 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  // النطاق الزمني والسعري عبر كل السلاسل مجتمعة
  const allPoints: StorePoint[] = [...lowestPoints, ...storeSeries.flatMap((s) => s.points)];
  const allPrices = allPoints.map((p) => p.price);
  const allTimes = allPoints.map((p) => p.date.getTime());

  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const range = maxP - minP || 1;
  const yMin = minP - range * 0.05;
  const yMax = maxP + range * 0.05;

  const t0 = Math.min(...allTimes);
  const t1 = Math.max(...allTimes);
  const span = t1 - t0 || 1;

  const x = (d: Date) => PAD.left + ((d.getTime() - t0) / span) * plotW;
  const y = (p: number) => PAD.top + (1 - (p - yMin) / (yMax - yMin)) * plotH;

  const pathFor = (pts: StorePoint[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.date).toFixed(1)} ${y(p.price).toFixed(1)}`).join(' ');

  // خطوط شبكية أفقية (3 مستويات)
  const gridLines = [0, 0.5, 1].map((f) => {
    const price = yMin + (yMax - yMin) * (1 - f);
    return { yPos: PAD.top + f * plotH, price: Math.round(price) };
  });

  // تغيّر كل متجر على حدة (آخر سعر − أول سعر خلال الفترة).
  // نعرضه بجانب اسم المتجر في المفتاح، فيرى الزائر حركة كل متجر.
  const storeChange = (pts: StorePoint[]): number | null => {
    if (pts.length < 2) return null;
    return pts[pts.length - 1].price - pts[0].price;
  };

  // عناصر مفتاح الألوان: المتاجر الظاهرة (مع تغيّرها) + خط أدنى سعر
  const legend: {
    label: string;
    color: string;
    dashed: boolean;
    change: number | null;
  }[] = [
    ...storeSeries.map((s) => ({
      label: STORE_META[s.key].label,
      color: STORE_META[s.key].color,
      dashed: false,
      change: storeChange(s.points),
    })),
    ...(lowestPoints.length >= 2
      ? [{ label: 'أدنى سعر', color: LOWEST_COLOR, dashed: true, change: null }]
      : []),
  ];

  const fmtDate = (d: Date) => d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-base font-black text-slate-900 dark:text-white">تاريخ السعر (آخر 90 يوماً)</h3>
      </div>

      {/* مفتاح الألوان مع تغيّر كل متجر */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-3">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-5 h-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: item.dashed ? 'transparent' : item.color,
                borderTop: item.dashed ? `2px dashed ${item.color}` : undefined,
              }}
            />
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
            {item.change !== null && (
              <span
                className={`text-[11px] font-black flex items-center gap-0.5 ${
                  item.change < 0
                    ? 'text-emerald-500'
                    : item.change > 0
                    ? 'text-red-500'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {item.change === 0 ? (
                  '—'
                ) : (
                  <>
                    {item.change < 0 ? '▼' : '▲'}
                    {Math.abs(Math.round(item.change))}
                    <RiyalMark />
                  </>
                )}
              </span>
            )}
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="رسم تاريخ السعر لكل متجر">
        {/* شبكة أفقية + تسميات المحور الرأسي */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={g.yPos}
              x2={W - PAD.right}
              y2={g.yPos}
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth="1"
              strokeDasharray="3 3"
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

        {/* خط أدنى سعر (منقّط، خلف خطوط المتاجر) */}
        {lowestPoints.length >= 2 && (
          <path
            d={pathFor(lowestPoints)}
            fill="none"
            stroke={LOWEST_COLOR}
            strokeWidth="2"
            strokeDasharray="5 4"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.8"
          />
        )}

        {/* خط لكل متجر بلونه */}
        {storeSeries.map((s) => (
          <g key={s.key}>
            <path
              d={pathFor(s.points)}
              fill="none"
              stroke={STORE_META[s.key].color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* نقطة عند كل قيمة فعلية */}
            {s.points.map((p, idx) => (
              <circle key={idx} cx={x(p.date)} cy={y(p.price)} r="3" fill={STORE_META[s.key].color} />
            ))}
          </g>
        ))}

        {/* تسميات المحور الأفقي: البداية والنهاية */}
        <text
          x={PAD.left}
          y={H - 8}
          textAnchor="start"
          className="fill-slate-400 dark:fill-slate-500"
          fontSize="11"
          fontWeight="700"
        >
          {fmtDate(new Date(t0))}
        </text>
        <text
          x={W - PAD.right}
          y={H - 8}
          textAnchor="end"
          className="fill-slate-400 dark:fill-slate-500"
          fontSize="11"
          fontWeight="700"
        >
          {fmtDate(new Date(t1))}
        </text>
      </svg>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 text-center font-medium">
        سعر كل متجر عبر الزمن — الخط المنقّط يمثّل أدنى سعر متاح
      </p>
    </div>
  );
}