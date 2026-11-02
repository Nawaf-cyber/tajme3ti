/* ============ «خلنا نجمّعها لك» — ما يشترك فيه الخادم والمتصفّح ============
 * الأنواع والثوابت التي يقرؤها components/HomePlanner ('use client')، بلا prisma:
 * lib/home-showcase يستورد unstable_cache وprisma، واستيرادُ ثابتٍ منه في مكوّن
 * عميل يسحبهما إلى المتصفّح فينهار البناء (درس lib/build-name). */
import type { TierPlan } from './intent-plans';

/** صفوف الخطّة في الواجهة بهذا الترتيب */
export const PLAN_CATS = ['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'Cooler', 'PSU', 'Case'] as const;
export const PLAN_RES = ['1080p', '1440p', '4K'] as const;
export const planKey = (use: string, res: string | null) => `${use}|${res ?? '-'}`;
/* «افتحها في الباني» بصيغة التجميعات الجاهزة (lib/prebuilds · builderHref) */
export const planHref = (parts: (string | null)[]) =>
  '/builder?' + PLAN_CATS.flatMap((cat, i) => (parts[i] ? [`${cat.toLowerCase()}=${encodeURIComponent(parts[i]!)}`] : [])).join('&');

export type ShowStore = { name: string; color: string; /** قطعٌ متوفّرةٌ عنده الحين */ live: number };
/** store: موضع المتجر في `stores` */
export type PlanPart = { name: string; price: number; store: number };
/** مقاسٌ يُرسم خطَّ أبعاد: value (+extra هامش) من max. والتسميات في الواجهة بالمفتاح
 *  (rad = مبرّدٌ مائيّ يقاس برادييتره، cooler = هوائيّ بارتفاعه) */
export type Gauge = { key: 'gpu' | 'cooler' | 'rad' | 'psu'; value: number; extra: number; max: number };
export type PlanView = {
  key: TierPlan['key'];
  total: number;
  /** معرّفات القطع بترتيب PLAN_CATS، وnull لما لا يلزم (المكتبي بلا كرت) —
   *  ومنها يُبنى رابط الباني في الواجهة (planHref) */
  parts: (string | null)[];
  perf: TierPlan['perf'] | null;
  gauges: Gauge[];
  /** ما يقوله فحص الباني (lib/build-check) — الخطط تُبنى متوافقة، فالمتوقَّع صفر */
  issues: number;
};
/** reason: سطر USE_PROFILE — يُعرض حين لا قياس إطارات (المونتاج والمكتبي) */
export type PlannerUse = { key: string; label: string; res: boolean; reason: string };
export type Planner = { parts: Record<string, PlanPart>; uses: PlannerUse[]; plans: Record<string, PlanView[]> };

