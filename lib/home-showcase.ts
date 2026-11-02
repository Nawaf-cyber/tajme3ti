/* ============ بيانات الرئيسية — شكل «التاج» (2026-11-02) ============
 * كان شكل س١ (لوحة أمّ مرسومة والشعار مكان المعالج) — قال نوّاف «ماعجبني…
 * ابهرني». فالرأس تاجٌ من المتاجر حول الشعار (components/HomeCrown)، وتحته
 * «خلنا نجمّعها لك» (components/HomePlanner): خطط «ما تدري وش تبي؟» نفسها
 * (lib/intent-plans) محسوبةً مسبقاً لكلّ استخدامٍ ودقّة، فيتبدّل الاختيار في
 * المتصفّح بلا طلب. ثمّ فرق المتاجر محسوباً على الكتالوج كلّه، والتجميعات الجاهزة.
 *
 * ⚠️ الحساب يقرأ الكتالوج كاملاً بعروضه (٣٫٧ ثانية من جهاز نوّاف إلى Neon)،
 * فهو في unstable_cache عشر دقائق لا في كلّ طلب. وتأخّر الأسعار هنا عشر دقائق
 * مقبول لأنّها أمثلة لا فاتورة: الباني يقرأ الحيّ حين يفتح الزائر الخطّة. */
import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import { HAS_PARTS } from './categories';
import { OFFER_INCLUDE } from './stores-server';
import { cheapestOffer, liveOffers } from './stores';
import { buildIntentPlans, USE_PROFILE, type Intent, type TierPlan } from './intent-plans';
import { checkBuild, computeDraw, psuHeadroom } from './build-check';
import { caseGpuMaxMm, maxRadiator, shownGpuLengthMm } from './fit';
import { gpuPerf, type GpuPerf } from './gpu-perf';
import { prebuildLive } from './prebuilds';
import { PLAN_CATS, PLAN_RES, planKey, type Gauge, type PlanPart, type PlanView, type Planner, type ShowStore } from './home-plan';

export type { ShowStore } from './home-plan';

const specsOf = (c: { specs?: unknown } | null | undefined): any => {
  if (!c?.specs) return {};
  if (typeof c.specs !== 'string') return c.specs;
  try { return JSON.parse(c.specs); } catch { return {}; }
};
const num = (v: unknown): number | null => {
  const m = String(v ?? '').match(/[\d.]+/);
  const n = m ? parseFloat(m[0]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
};

/* ما يختاره الزائر — كما في components/IntentPicker: الألعاب والبثّ بدقّاتها،
   والمونتاج والمكتبي بلا دقّة */
const USES: { key: string; res: boolean }[] = [
  { key: 'aaa-gaming', res: true },
  { key: 'competitive-shooter', res: true },
  { key: 'casual-gaming', res: true },
  { key: 'streaming', res: true },
  { key: 'editing', res: false },
  { key: 'office', res: false },
];

export type StoreQuote = { store: string; color: string; price: number };
export type Spread = {
  /** قطعٌ لها سعرٌ متوفّر في متجرين فأكثر */
  multi: number;
  /** وسيط الفرق بين أرخص وأغلى متجر للقطعة نفسها: نسبةً من الأرخص، وبالريال */
  medianPct: number;
  medianSar: number;
  /** كرتٌ مثالٌ بعروضه، من الأرخص */
  gpu: { id: string; name: string; quotes: StoreQuote[]; perf: GpuPerf | null } | null;
};

export type HomeShowcase = {
  /** المتاجر النشطة، الأكثرُ قطعاً أوّلاً */
  stores: ShowStore[];
  livePrices: number;
  planner: Planner;
  spread: Spread;
  /** التجميعات الجاهزة بمجموعها اللحظيّ */
  prebuilds: { id: string; title: string; budgetType: string; total: number; missing: number; href: string }[];
};

/* الكرت المثال: RTX 5070 أوّلاً (الأكثر طلباً في الموقع) والذي فرقُ متاجره أوضح،
   وإلّا أيّ كرتٍ مقيس. وشرطه متجران على الأقلّ: عرضٌ وحيد لا يقارَن بشيء. */
const PREFERRED_GPU = /RTX\s*5070(?!\s*Ti)/i;

/* «AMD Radeon RX 9070» — الشركة قبل الاسم ما لم يبدأ بها */
const fullName = (c: { brand?: string | null; name: string }) => {
  const brand = String(c.brand || '').trim();
  return brand && !c.name.toLowerCase().startsWith(brand.toLowerCase()) ? `${brand} ${c.name}` : c.name;
};

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};

/** مكشوفةٌ للسكربتات (unstable_cache لا يعمل خارج Next) */
export async function computeHomeShowcase(): Promise<HomeShowcase> {
  const [categories, storeRows, prebuildRows] = await Promise.all([
    /* ترتيب الباني نفسه (app/builder/page.tsx) — الخطط تتعادل أحياناً، والترتيب يحسمها،
       فبه تطابق الرئيسيّةُ ما يراه الزائر في «ما تدري وش تبي؟» */
    prisma.category.findMany({ where: HAS_PARTS, include: { components: { include: OFFER_INCLUDE, orderBy: [{ brand: 'asc' }, { name: 'asc' }] } } }),
    prisma.store.findMany({ where: { active: true }, select: { name: true, color: true } }),
    prisma.prebuild.findMany({ orderBy: { price: 'asc' } }),
  ]);
  const all = categories.flatMap((c) => c.components as any[]);

  /* ---- كلّ قطعة: أرخص سعرٍ عند كلّ متجر ---- */
  const quotesOf = (c: any): StoreQuote[] => {
    const best = new Map<string, StoreQuote>();
    for (const o of liveOffers(c.offers)) {
      const name = o.store?.name;
      if (!name) continue;
      const cur = best.get(name);
      if (!cur || o.price! < cur.price) best.set(name, { store: name, color: o.store.color, price: o.price! });
    }
    return [...best.values()].sort((a, b) => a.price - b.price);
  };
  const live = new Map<string, number>();
  let livePrices = 0;
  const pcts: number[] = [];
  const sars: number[] = [];
  const quotesById = new Map<string, StoreQuote[]>();
  for (const c of all) {
    const q = quotesOf(c);
    quotesById.set(c.id, q);
    livePrices += liveOffers(c.offers).length;
    for (const x of q) live.set(x.store, (live.get(x.store) ?? 0) + 1);
    if (q.length >= 2) {
      const lo = q[0].price, hi = q[q.length - 1].price;
      pcts.push((hi - lo) / lo);
      sars.push(hi - lo);
    }
  }
  const stores: ShowStore[] = storeRows
    .map((s) => ({ name: s.name, color: s.color, live: live.get(s.name) ?? 0 }))
    .sort((a, b) => b.live - a.live);
  const storeAt = (name?: string) => Math.max(0, stores.findIndex((s) => s.name === name));

  /* ---- الخطط ---- */
  const parts: Record<string, PlanPart> = {};
  const view = (p: TierPlan): PlanView => {
    const picks = p.picks as Record<string, any>;
    const ids = PLAN_CATS.map((cat) => {
      const c = picks[cat];
      if (!c) return null;
      if (!parts[c.id]) {
        const o = cheapestOffer(c.offers);
        parts[c.id] = {
          name: fullName(c),
          price: o?.price ?? c.price,
          store: storeAt(o?.store?.name),
        };
      }
      return c.id as string;
    });

    const gauges: Gauge[] = [];
    const kase = specsOf(picks.Case);
    if (picks.GPU && picks.Case) {
      const len = shownGpuLengthMm(picks.GPU);
      const max = caseGpuMaxMm(kase);
      if (len && max) gauges.push({ key: 'gpu', value: len, extra: 0, max });
    }
    if (picks.Cooler && picks.Case) {
      const k = specsOf(picks.Cooler);
      const size = num(k.sizeMm);
      if (String(k.type || '').toUpperCase() === 'AIO') {
        const rad = maxRadiator(kase.radiatorSupport);
        if (size && rad) gauges.push({ key: 'rad', value: size, extra: 0, max: rad });
      } else {
        const h = num(kase.maxCoolerHeight);
        if (size && h) gauges.push({ key: 'cooler', value: size, extra: 0, max: h });
      }
    }
    if (picks.PSU) {
      const draw = computeDraw(picks);
      const w = num(specsOf(picks.PSU).wattage);
      if (w && draw) gauges.push({ key: 'psu', value: draw, extra: psuHeadroom(Number(picks.GPU?.tdpWattage) || 0), max: w });
    }

    return {
      key: p.key,
      total: Math.round(ids.reduce((s, id) => s + (id ? parts[id].price : 0), 0)),
      parts: ids,
      perf: p.perf ?? null,
      gauges,
      issues: checkBuild(picks).length,
    };
  };

  const plans: Record<string, PlanView[]> = {};
  for (const u of USES) {
    for (const res of u.res ? PLAN_RES : [null]) {
      const intent: Intent = { use: u.key, resolution: res, alsoStreams: u.key === 'streaming', gpuBrand: null, cpuBrand: null };
      const built = buildIntentPlans(categories as any, intent);
      if (built?.length) plans[planKey(u.key, res)] = built.map(view);
    }
  }
  const uses = USES.filter((u) => Object.keys(plans).some((k) => k.startsWith(`${u.key}|`)))
    .map((u) => ({ key: u.key, label: USE_PROFILE[u.key].label, res: u.res, reason: USE_PROFILE[u.key].reason }));

  /* ---- الكرت المثال ---- */
  const gpuCands = (categories.find((c) => c.name === 'GPU')?.components ?? [])
    .map((g: any) => {
      const quotes = quotesById.get(g.id) ?? [];
      return { g, quotes, perf: gpuPerf(g.name, num(specsOf(g).vram)), spread: quotes.length ? quotes[quotes.length - 1].price - quotes[0].price : 0 };
    })
    .filter((x) => x.quotes.length >= 2 && x.perf);
  const widest = (pool: typeof gpuCands) => [...pool].sort((a, b) => b.spread - a.spread)[0];
  const ex = widest(gpuCands.filter((x) => PREFERRED_GPU.test(x.g.name))) ?? widest(gpuCands);

  /* ---- التجميعات الجاهزة ---- */
  const prebuilds = prebuildRows.map((p) => {
    const lv = prebuildLive(p, categories, all);
    return { id: p.id, title: p.title, budgetType: p.budgetType, total: lv.liveTotal, missing: lv.missingParts.length, href: lv.builderHref };
  });

  return {
    stores,
    livePrices,
    planner: { parts, uses, plans },
    spread: {
      multi: pcts.length,
      medianPct: median(pcts),
      medianSar: median(sars),
      gpu: ex ? { id: ex.g.id, name: fullName(ex.g), quotes: ex.quotes, perf: ex.perf } : null,
    },
    prebuilds,
  };
}

export const homeShowcase = unstable_cache(computeHomeShowcase, ['home-showcase-crown-v1'], { revalidate: 600 });
