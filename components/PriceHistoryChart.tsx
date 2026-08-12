import { prisma } from '../lib/prisma';
import { Panel, SectionHeading, StatStrip, type Stat } from './Panel';

/* ============ رسم تاريخ السعر ============
   مكوّن خادم بحت (بلا 'use client') — يرندر SVG على الخادم،
   فيراه جوجل كمحتوى فعلي ولا يحتاج أي مكتبة رسم.

   يعرض خلال آخر 90 يوماً:
   - خطاً لكل متجر بلونه المسجّل في جدول Store (كان الثلاثة مكتوبين هنا
     يدوياً، فالمتجر الرابع كان سيُرسم بلا لون ولا اسم — أو لا يُرسم أصلاً).
   - خط "أدنى سعر" منقّط فوق الجميع (أرخص متجر في كل يوم).
   كل متجر يُرسم بنقاطه الحقيقية فقط — لا نسدّ الفجوات بتخمين. */

type StorePoint = { date: Date; price: number };

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

export default async function PriceHistoryChart({
  componentId,
  liveStores = [],
}: {
  componentId: string;
  /** slugs المتاجر التي تبيع القطعة الآن — انظر «شريط الملخّص» أدناه */
  liveStores?: string[];
}) {
  // آخر 90 يوماً
  const since = new Date();
  since.setDate(since.getDate() - 90);

  /* سجلّ الأسعار يخزّن slug المتجر نصّاً، فنجلب المتاجر لنعرف اسمها ولونها
     وترتيبها. المعطّلة تُستثنى — كي يختفي خطّها فور إيقافها من اللوحة. */
  const [rows, stores] = await Promise.all([
    prisma.priceHistory.findMany({
      where: { componentId, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
      select: { price: true, recordedAt: true, store: true },
    }),
    prisma.store.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      select: { slug: true, name: true, color: true },
    }),
  ]);

  const storeMeta = new Map(stores.map((s) => [s.slug, s]));

  // نجمّع النقاط لكل متجر على حدة (نقطة واحدة لكل يوم/متجر — الأدنى إن تكرر)
  const perStore = new Map<string, Map<string, number>>();
  // ولأدنى سعر يومي عبر كل المتاجر
  const lowestByDay = new Map<string, number>();

  for (const r of rows) {
    if (!storeMeta.has(r.store)) continue; // متجر محذوف أو معطّل
    const day = r.recordedAt.toISOString().slice(0, 10);

    if (!perStore.has(r.store)) perStore.set(r.store, new Map());
    const days = perStore.get(r.store)!;
    const cur = days.get(day);
    if (cur == null || r.price < cur) days.set(day, r.price);

    const low = lowestByDay.get(day);
    if (low == null || r.price < low) lowestByDay.set(day, r.price);
  }

  const toPoints = (m: Map<string, number>): StorePoint[] =>
    Array.from(m.entries())
      .map(([k, price]) => ({ date: new Date(k), price }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

  // بترتيب المتاجر في اللوحة، لا بترتيب ورود الصفوف من القاعدة
  const storeSeries = stores
    .map((s) => ({ slug: s.slug, label: s.name, color: s.color, points: toPoints(perStore.get(s.slug) ?? new Map()) }))
    .filter((s) => s.points.length > 0);

  const lowestPoints = toPoints(lowestByDay);

  // نحتاج نقطتين على الأقل (في أي سلسلة) لرسم خط
  const maxLen = Math.max(lowestPoints.length, ...storeSeries.map((s) => s.points.length), 0);
  if (maxLen < 2) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeading note="آخر 90 يوماً">تاريخ السعر</SectionHeading>
        <Panel className="px-6 py-8 text-center">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            نجمع بيانات الأسعار لهذه القطعة — سيظهر الرسم البياني قريباً.
          </p>
        </Panel>
      </section>
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
      label: s.label,
      color: s.color,
      dashed: false,
      change: storeChange(s.points),
    })),
    ...(lowestPoints.length >= 2
      ? [{ label: 'أدنى سعر', color: LOWEST_COLOR, dashed: true, change: null }]
      : []),
  ];

  const fmtDate = (d: Date) => d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });

  /* ============ أعمدة التأشير ============
   * تلميح لكل **يوم** لا لكل نقطة، لثلاثة أسباب:
   *  ١) ما يريده القارئ هو المقارنة: كم كان سعر كل متجر في ذلك اليوم.
   *  ٢) SVG بلا z-index — تلميحُ نقطةٍ مبكرة يختفي تحت ما يُرسم بعدها.
   *     الأعمدة لا تتقاطع أفقياً وواحدٌ فقط ظاهر، فترتيب الطبقات ينحلّ.
   *  ٣) منطقة التأشير تصير عموداً كامل الارتفاع بدل دائرة نصف قطرها ٣ —
   *     إصابتها بالفأرة (والإصبع) أسهل بكثير.
   */
  const dayKeys = Array.from(new Set(allPoints.map((p) => p.date.toISOString().slice(0, 10)))).sort();
  const colW = dayKeys.length > 1 ? plotW / (dayKeys.length - 1) : plotW;

  const columns = dayKeys.map((key) => {
    const date = new Date(key);
    const cx = x(date);
    const entries = storeSeries
      .map((s) => {
        const hit = s.points.find((p) => p.date.toISOString().slice(0, 10) === key);
        return hit ? { name: s.label, color: s.color, price: hit.price } : null;
      })
      .filter((e): e is { name: string; color: string; price: number } => e !== null)
      .sort((a, b) => a.price - b.price);
    return { key, date, cx, entries };
  }).filter((c) => c.entries.length > 0);

  /* ============ تسميات فوق النقاط ============
   * لا نسمّي كل نقطة: السعر الثابت أسبوعاً يعطي سبع تسميات متطابقة تحجب
   * الخط ولا تضيف خبراً. نسمّي أوّل نقطة وآخرها وكلَّ نقطة تغيّر فيها
   * السعر — وهي مواضع الخبر بالضبط.
   *
   * ثم مرشّح تصادم: التسمية تسقط إن تداخل صندوقها مع صندوق سُمّي قبله.
   * الترتيب من اليمين (الأحدث) فالأولوية للأقرب زمناً.
   */
  type Label = { cx: number; cy: number; text: string; color: string };
  const candidates: Label[] = [];
  for (const s of storeSeries) {
    s.points.forEach((p, i) => {
      const isEdge = i === 0 || i === s.points.length - 1;
      const changed = i > 0 && s.points[i - 1].price !== p.price;
      if (!isEdge && !changed) return;
      candidates.push({
        cx: x(p.date),
        cy: y(p.price),
        text: Math.round(p.price).toLocaleString('en-US'),
        color: s.color,
      });
    });
  }

  const placed: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const labels = candidates
    .sort((a, b) => b.cx - a.cx) // الأحدث أوّلاً
    .filter((l) => {
      const w = l.text.length * 5.6 + 6;
      const box = { x1: l.cx - w / 2, y1: l.cy - 18, x2: l.cx + w / 2, y2: l.cy - 6 };
      const clash = placed.some((b) => !(box.x2 < b.x1 || box.x1 > b.x2 || box.y2 < b.y1 || box.y1 > b.y2));
      if (clash) return false;
      placed.push(box);
      return true;
    });

  /* ============ شريط الملخّص ============
   * الرسم يُجيب «كيف تحرّك السعر»، ولا يُجيب «كم أدنى ما بلغ» إلا بتتبّع
   * العين للخطّ وقراءة المحور. وهو أوّل ما يريده من يفكّر في الشراء الآن.
   *
   * ⚠️ ولماذا لا يُبنى على خطّ «أدنى سعر» المنقّط رغم أنه الأقرب شكلاً:
   * جدول PriceHistory يخزّن السعر ولا يخزّن التوفّر، والسحب يسجّل سعر
   * المتجر النافد كما يسجّل سعر المتوفّر. فمتجرٌ معلَّق بسعرٍ قديم منخفض
   * يقود ذلك الخطّ إلى الأبد.
   *
   * رُصد فعلاً على RTX 5070 Ti: كازاسوق يسجّل ٣٩٥٠ يومياً وهو نافد، بينما
   * أرخص ما يُشترى ٥٢٩٠. فكان الشريط سيصدّر عنواناً يقول «أدنى سعر بلغه
   * ٣٧٠٨ ﷼» لسعرٍ لا يبيعه أحد — وهو أسوأ من ألّا يُكتب.
   *
   * فالملخّص يُحسب من سلاسل المتاجر التي تبيع القطعة **الآن** فقط. تقريبٌ
   * لا يقين — فقد ينفد أحدها في يومٍ ماضٍ ولا نعلم — لكنه رقمٌ يقابله
   * زرُّ شراء، والخطوط تحته تبقى كاملة كما هي.
   */
  const liveSet = new Set(liveStores);
  const liveDaily = new Map<string, number>();
  for (const s of storeSeries) {
    if (!liveSet.has(s.slug)) continue;
    for (const p of s.points) {
      const day = p.date.toISOString().slice(0, 10);
      const cur = liveDaily.get(day);
      if (cur == null || p.price < cur) liveDaily.set(day, p.price);
    }
  }
  const livePoints = toPoints(liveDaily);
  const money = (n: number) => Math.round(n).toLocaleString('en-US');

  let summary: Stat[] = [];
  if (livePoints.length >= 2) {
    const prices = livePoints.map((p) => p.price);
    const netChange = Math.round(prices[prices.length - 1] - prices[0]);
    summary = [
      { label: 'أدنى ما بلغه', value: money(Math.min(...prices)), unit: '﷼', accent: 'emerald' },
      { label: 'أعلى ما بلغه', value: money(Math.max(...prices)), unit: '﷼', accent: 'none' },
      netChange === 0
        ? { label: 'التغيّر خلال الفترة', value: '—', accent: 'none' }
        : {
            label: 'التغيّر خلال الفترة',
            value: `${netChange < 0 ? '-' : '+'}${money(Math.abs(netChange))}`,
            unit: '﷼',
            accent: netChange < 0 ? 'emerald' : 'rose',
          },
    ];
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading note="آخر 90 يوماً">تاريخ السعر</SectionHeading>
      <Panel className="px-5 py-5 md:px-6">
      <StatStrip stats={summary} />

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

      {/* direction مضمّن لا صفّي: تثبيت الهندسة أهمّ من أن يعتمد على قاعدة
          قد تصل ناقصة — انظر التعليق في <style> أدناه */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ direction: 'ltr' }}
        role="img"
        aria-label="رسم تاريخ السعر لكل متجر"
      >
        {/* الأنماط داخل الـSVG لا في globals.css: القسم يبقى مكوّن خادم بلا
            جافاسكربت، ولا يتعطّل التلميح لو وصل ملف الأنماط قديماً — وهو
            عطلٌ وقعنا فيه فعلاً في شريط التخفيضات. */}
        <style>{`
          /* ⚠️ الصفحة RTL والـSVG يرث الاتجاه، وفي RTL ينقلب معنى
             text-anchor: start تعني اليمين وend تعني اليسار — عكس ما بُنيت
             عليه إحداثيات هذا الرسم. النتيجة نصوصٌ تخرج من صناديقها
             (رُصد: سعرٌ يمتدّ إلى ١٣٤ في صندوق عرضه ١٢٦) وتسمياتُ محاورٍ
             تمتدّ إلى الهامش. نثبّت الهندسة على LTR، والنصّ العربي نفسه
             يبقى صحيحاً لأن خوارزمية الاتجاه ثنائي الاتجاه تتولّى كل مقطع
             على حدة. والترتيب البصري العربي نصنعه بالإحداثيات لا بالوراثة. */
          .ph-col .ph-tip, .ph-col .ph-guide { opacity: 0; transition: opacity .12s ease; }
          .ph-col:hover .ph-tip, .ph-col:hover .ph-guide,
          .ph-col:active .ph-tip, .ph-col:active .ph-guide { opacity: 1; }
          .ph-col { cursor: crosshair; -webkit-tap-highlight-color: transparent; }
        `}</style>

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
          <g key={s.slug}>
            <path
              d={pathFor(s.points)}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* نقطة عند كل قيمة فعلية */}
            {s.points.map((p, idx) => (
              <circle key={idx} cx={x(p.date)} cy={y(p.price)} r="3" fill={s.color} />
            ))}
          </g>
        ))}

        {/* تسميات الأسعار فوق النقاط — بحاشية بلون الخلفية (paint-order)
            كي تُقرأ فوق الخطوط بدل أن تختلط بها */}
        {labels.map((l, i) => (
          <text
            key={i}
            x={l.cx}
            y={l.cy - 8}
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="800"
            fill={l.color}
            paintOrder="stroke"
            strokeWidth="3"
            strokeLinejoin="round"
            className="stroke-white dark:stroke-slate-900"
          >
            {l.text}
          </text>
        ))}

        {/* أعمدة التأشير — آخر طبقة كي يعلو التلميح على كل ما سبق */}
        {columns.map((col) => {
          /* مقاسات التلميح مرفوعة درجةً: كان التاريخ عند ١٠ بكسل واسم
             المتجر عند ١٠٫٥ — وكلاهما عربي، والعربية دون ١١ بكسل تُقرأ
             بمشقّة لأن حروفها متّصلة وصواعدها تحتاج ارتفاعاً أكبر من
             اللاتينية. ورفعُ الخطّ يوجب رفع الصندوق وإلا خرج النصّ منه. */
          const rowH = 16;
          const tipH = 24 + col.entries.length * rowH;
          const tipW = Math.max(
            134,
            ...col.entries.map((e) => 42 + e.name.length * 7.2 + String(Math.round(e.price)).length * 7),
          );
          // ينقلب إلى اليسار قرب الحافّة اليمنى كي لا يخرج عن الإطار
          const flip = col.cx + 10 + tipW > W - 4;
          const tx = flip ? col.cx - 10 - tipW : col.cx + 10;
          const ty = Math.min(PAD.top + 4, H - tipH - 4);

          return (
            <g key={col.key} className="ph-col">
              {/* نصّ بديل: يقرؤه قارئ الشاشة، ويظهر كتلميح أصلي لو تعطّل
                  الـCSS لأي سبب — التلميح المرسوم ليس المسار الوحيد للمعلومة */}
              <title>
                {`${fmtDate(col.date)}: ${col.entries.map((e) => `${e.name} ${Math.round(e.price)}`).join('، ')}`}
              </title>
              {/* منطقة التقاط بعرض المسافة بين يومين */}
              <rect
                x={col.cx - colW / 2}
                y={PAD.top}
                width={colW}
                height={plotH}
                fill="transparent"
              />
              <line
                className="ph-guide stroke-slate-400 dark:stroke-slate-500"
                x1={col.cx}
                y1={PAD.top}
                x2={col.cx}
                y2={PAD.top + plotH}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <g className="ph-tip" transform={`translate(${tx.toFixed(1)}, ${ty.toFixed(1)})`}>
                <rect
                  width={tipW}
                  height={tipH}
                  rx="8"
                  className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-600"
                  strokeWidth="1"
                />
                {/* الترتيب عربي بالإحداثيات: التاريخ والمتجر يميناً والسعر
                    يساراً — والهندسة LTR فـ end تعني اليمين بيقين */}
                <text
                  x={tipW - 10}
                  y="16"
                  textAnchor="end"
                  fontSize="11"
                  fontWeight="800"
                  className="fill-slate-500 dark:fill-slate-400"
                >
                  {fmtDate(col.date)}
                </text>
                {col.entries.map((e, i) => {
                  const ry = 24 + i * rowH + 10;
                  return (
                    <g key={e.name}>
                      <circle cx={tipW - 14} cy={ry - 3.5} r="3.5" fill={e.color} />
                      <text
                        x={tipW - 24}
                        y={ry}
                        textAnchor="end"
                        fontSize="11.5"
                        fontWeight="700"
                        className="fill-slate-600 dark:fill-slate-300"
                      >
                        {e.name}
                      </text>
                      <text
                        x="10"
                        y={ry}
                        textAnchor="start"
                        fontSize="11.5"
                        fontWeight="900"
                        className="fill-slate-900 dark:fill-white"
                      >
                        {Math.round(e.price).toLocaleString('en-US')}
                      </text>
                    </g>
                  );
                })}
              </g>
            </g>
          );
        })}

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

      <p className="mt-3 border-t border-dashed border-slate-200 pt-3 text-center text-[11.5px] font-semibold text-slate-400 dark:border-slate-800 dark:text-slate-500">
        أشِر على أي يوم (أو المس واستمرّ) لترى أسعار المتاجر فيه — الخط المنقّط يمثّل أدنى سعر مسجّل
        {summary.length > 0 && '، والملخّص أعلاه يحسب المتاجر التي تبيعها الآن'}
      </p>
      </Panel>
    </section>
  );
}