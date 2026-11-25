import { prisma } from '../lib/prisma';
import { Panel, SectionHeading } from './Panel';
import { daysAr } from '../lib/price-stats-core';
import PriceChart, { type ChartDay, type ChartStore } from './PriceChart';

/* ============ رسم تاريخ السعر — تجهيز البيانات (خادم) ============
 *
 * الرسم نفسه في components/PriceChart (عميل). هنا نجلب ٩٠ يوماً ونحوّلها إلى
 * سلاسل يوميّة متساوية الطول — يومٌ لكلّ خانة من أوّل قراءة حتى اليوم:
 *
 *  - لكلّ متجر: سعرُه يوماً بيوم. السجلّ يكتب نقطةً واحدة لكلّ متجر في اليوم
 *    (lib/scrape-prices · recordPriceHistory)، والسعر يبقى حتى يتغيّر، فنحمل
 *    آخر قراءة على الأيّام الخالية — من أوّل قراءة للمتجر حتى آخرها فقط، لا قبلها
 *    ولا بعدها (المتجر النافد ينتهي خطّه حيث انتهت قراءاته).
 *  - والمتجر البائع الآن يمتدّ خطّه إلى اليوم بسعر عرضه الحاليّ — وهو الرقم
 *    نفسه في قائمة العروض أعلى الصفحة.
 *
 * ⚠️ والخطّ الرئيس «الأرخص» من المتاجر البائعة الآن وحدها: السجلّ يخزّن السعر
 * ولا يخزّن التوفّر، ورُصد على RTX 5070 Ti كازاسوق يسجّل ٣٩٥٠ يوميّاً وهو نافد
 * وأرخصُ ما يُشترى ٥٢٩٠ — فخطٌّ من الجميع كان سيقول «الأدنى ٣٩٥٠» لسعرٍ لا
 * يبيعه أحد. (نفس قاعدة lib/price-stats-core · liveStats، فالأدنى والأعلى هنا
 * يطابقان سطر «سعرها اليوم عند أدنى ما رصدناه» أعلى الصفحة.)
 */

const DAY = 86_400_000;
const LOC = 'ar-SA-u-nu-latn-ca-gregory';

export type PriceChartData = {
  days: ChartDay[];
  stores: ChartStore[];
  low: (number | null)[];
  lowStore: (string | null)[];
  anyLive: boolean;
};

/** السلاسل اليوميّة للرسم، أو null إن لم تكفِ القراءات (أقلّ من يومين) */
export async function loadPriceChart(
  componentId: string,
  /** المتاجر التي تبيع القطعة الآن وسعرها — انظر التعليق أعلاه */
  live: { slug: string; price: number }[] = [],
): Promise<PriceChartData | null> {
  const since = new Date(Date.now() - 90 * DAY);

  /* المعطّلة تُستثنى — كي يختفي خطّها فور إيقافها من اللوحة */
  const [rows, storeRows] = await Promise.all([
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

  const known = new Set(storeRows.map((s) => s.slug));
  const liveMap = new Map(live.filter((o) => o.price > 0).map((o) => [o.slug, o.price]));

  // سعر كلّ متجر في كلّ يوم (الأدنى إن تكرّر)
  const perStore = new Map<string, Map<string, number>>();
  for (const r of rows) {
    if (!known.has(r.store) || !(r.price > 0)) continue;
    const day = r.recordedAt.toISOString().slice(0, 10);
    if (!perStore.has(r.store)) perStore.set(r.store, new Map());
    const m = perStore.get(r.store)!;
    const cur = m.get(day);
    if (cur == null || r.price < cur) m.set(day, r.price);
  }

  const allKeys = [...perStore.values()].flatMap((m) => [...m.keys()]).sort();
  if (new Set(allKeys).size < 2) return null;

  // خانات الأيّام: من أوّل قراءة حتى اليوم (UTC — كما يكتبها السجلّ)
  const todayKey = new Date().toISOString().slice(0, 10);
  const keys: string[] = [];
  for (let t = Date.parse(allKeys[0]); ; t += DAY) {
    const k = new Date(t).toISOString().slice(0, 10);
    keys.push(k);
    if (k >= todayKey) break;
  }
  const days: ChartDay[] = keys.map((k) => {
    const d = new Date(k);
    return {
      key: k,
      label: d.toLocaleDateString(LOC, { day: 'numeric', month: 'long', timeZone: 'UTC' }),
      month: d.toLocaleDateString(LOC, { month: 'long', timeZone: 'UTC' }),
      dom: d.getUTCDate(),
    };
  });

  const stores: ChartStore[] = storeRows
    .filter((s) => perStore.has(s.slug) || liveMap.has(s.slug))
    .map((s) => {
      const m = perStore.get(s.slug) ?? new Map<string, number>();
      const isLive = liveMap.has(s.slug);
      const own = [...m.keys()].sort();
      const lastOwn = own[own.length - 1] ?? '';
      let carry: number | null = null;
      const vals = keys.map((k, i) => {
        if (m.has(k)) carry = m.get(k)!;
        if (isLive && i === keys.length - 1) return liveMap.get(s.slug)!; // اليوم = سعر العرض الحاليّ
        if (!isLive && k > lastOwn) return null; // النافد ينتهي خطّه عند آخر قراءة
        return carry;
      });
      return { slug: s.slug, name: s.name, color: s.color, live: isLive, vals };
    })
    .filter((s) => s.vals.some((v) => v != null));

  /* الأرخص يوميّاً: من البائعين الآن، فإن لم يبعها أحد فمن الجميع («آخر سعر رصدناه») */
  const anyLive = stores.some((s) => s.live);
  const pool = anyLive ? stores.filter((s) => s.live) : stores;
  const low: (number | null)[] = [];
  const lowStore: (string | null)[] = [];
  keys.forEach((_, i) => {
    let best: number | null = null, who: string | null = null;
    for (const s of pool) {
      const v = s.vals[i];
      if (v != null && (best == null || v < best)) { best = v; who = s.slug; }
    }
    low.push(best);
    lowStore.push(who);
  });

  return { days, stores, low, lowStore, anyLive };
}

export default async function PriceHistoryChart({
  componentId,
  live = [],
}: {
  componentId: string;
  live?: { slug: string; price: number }[];
}) {
  const data = await loadPriceChart(componentId, live);
  if (!data) {
    return (
      <section id="price-history" className="flex flex-col gap-4 scroll-mt-24">
        <SectionHeading note="آخر 90 يوماً">تاريخ السعر</SectionHeading>
        <Panel className="px-6 py-8 text-center">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            نجمع بيانات الأسعار لهذه القطعة — سيظهر الرسم البياني قريباً.
          </p>
        </Panel>
      </section>
    );
  }

  /* ⚠️ العنوان يقول المدّة الحقيقيّة: «آخر 90 يوماً» فوق رسمٍ يبدأ قبل شهر يوهم أنّ
     المتابعة أطول ممّا هي (تجربة المستخدمين 2026-10-17) */
  const n = data.days.length;
  const periodNote = n >= 85 ? 'آخر 90 يوماً' : `منذ بدء متابعتها قبل ${daysAr(n)}`;

  return (
    <section id="price-history" className="flex flex-col gap-4 scroll-mt-24">
      <SectionHeading note={periodNote}>تاريخ السعر</SectionHeading>
      <Panel className="px-4 py-4 sm:px-6 sm:py-5">
        <PriceChart {...data} />
      </Panel>
    </section>
  );
}
