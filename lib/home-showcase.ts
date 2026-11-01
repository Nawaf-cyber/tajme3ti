/* ============ أمثلة الرئيسية — شكل س١ (2026-11-01) ============
 * الرأس لوحةٌ أمّ مرسومة، وتعليقاتها تشرح الموقع بأمثلةٍ من القاعدة نفسها لا
 * بأرقامٍ مكتوبة: كرتٌ واحد يُظهر فرق المتاجر وإطاراته المقيسة، ومعالجٌ يُظهر
 * كم لوحةً تركب عليه، والتجميعات الجاهزة بمداها. كلّها لحظيّة (الصفحة
 * force-dynamic) وكلّها تسقط بهدوء إن لم يكن في الكتالوج ما يُعرض. */
import { prisma } from './prisma';
import { OFFER_INCLUDE } from './stores-server';
import { isAvailable, liveOffers } from './stores';
import { gpuPerf, type GpuPerf } from './gpu-perf';
import { socketMatch } from './fit';
import { prebuildLive } from './prebuilds';

const specsOf = (c: { specs?: unknown }): any => {
  if (!c.specs) return {};
  if (typeof c.specs !== 'string') return c.specs;
  try { return JSON.parse(c.specs); } catch { return {}; }
};

export type StoreQuote = { store: string; color: string | null; price: number };

export type HomeShowcase = {
  /** كرتٌ في متجرين فأكثر: الأرخص والأغلى وما بينهما، وإطاراته إن قِيس */
  gpu: { id: string; name: string; brand: string; quotes: StoreQuote[]; perf: GpuPerf | null } | null;
  /** معالجٌ وكم لوحةً متوفّرةً تركب عليه، وأرخصها */
  cpu: { id: string; name: string; socket: string; boards: number; cheapestBoard: number } | null;
  /** التجميعات الجاهزة بمجموعها اللحظيّ */
  prebuilds: { id: string; title: string; budgetType: string; total: number; missing: number; href: string }[];
};

/* الكرت المثال: RTX 5070 أوّلاً (الأكثر طلباً في الموقع)، وإلّا أيّ كرتٍ مقيس —
   والذي فرقُ متاجره أوضح. شرطه متجران على الأقلّ: عرضٌ وحيد لا يقارَن بشيء. */
const PREFERRED_GPU = /RTX\s*5070(?!\s*Ti)/i;
/* المعالج المثال: الأرخص الشائع على AM5 إن وُجد */
const PREFERRED_CPU = /Ryzen 5 7500F/i;

export async function homeShowcase(): Promise<HomeShowcase> {
  const [gpus, cpus, boards, prebuilds, categories] = await Promise.all([
    prisma.component.findMany({ where: { category: { name: 'GPU' } }, include: OFFER_INCLUDE }),
    prisma.component.findMany({ where: { category: { name: 'CPU' } }, include: OFFER_INCLUDE }),
    prisma.component.findMany({ where: { category: { name: 'Motherboard' } }, include: OFFER_INCLUDE }),
    prisma.prebuild.findMany({ orderBy: { price: 'asc' } }),
    prisma.category.findMany(),
  ]);

  /* ---- الكرت ---- */
  const gpuCands = gpus
    .map((g) => {
      const offers = liveOffers((g as any).offers);
      /* متجرٌ واحد = عرضٌ واحد (الأرخص منه) */
      const byStore = new Map<string, StoreQuote>();
      for (const o of offers) {
        const name = o.store?.name;
        if (name && !byStore.has(name)) byStore.set(name, { store: name, color: (o.store as any)?.color ?? null, price: o.price! });
      }
      const quotes = [...byStore.values()].sort((a, b) => a.price - b.price);
      const perf = gpuPerf(g.name, Number(specsOf(g).vram) || null);
      return { g, quotes, perf, spread: quotes.length ? quotes[quotes.length - 1].price - quotes[0].price : 0 };
    })
    .filter((x) => x.quotes.length >= 2 && x.perf);
  const pickGpu = (pool: typeof gpuCands) => pool.sort((a, b) => b.spread - a.spread)[0];
  const g = pickGpu(gpuCands.filter((x) => PREFERRED_GPU.test(x.g.name))) ?? pickGpu(gpuCands);

  /* ---- المعالج ---- */
  const availCpus = cpus.filter(isAvailable).filter((c) => specsOf(c).socket);
  const cpu = availCpus.find((c) => PREFERRED_CPU.test(c.name)) ?? availCpus.sort((a, b) => a.price - b.price)[0];
  const fits = cpu ? boards.filter(isAvailable).filter((b) => socketMatch(specsOf(cpu).socket, specsOf(b).socket).ok) : [];

  /* ---- التجميعات الجاهزة ---- */
  const ids = prebuilds.flatMap((p) => Object.values(prebuildLive(p, categories, []).compObj));
  const parts = ids.length
    ? await prisma.component.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, price: true, ...OFFER_INCLUDE } })
    : [];

  return {
    gpu: g ? { id: g.g.id, name: g.g.name, brand: g.g.brand, quotes: g.quotes, perf: g.perf } : null,
    cpu: cpu && fits.length
      ? { id: cpu.id, name: cpu.name, socket: String(specsOf(cpu).socket), boards: fits.length, cheapestBoard: Math.min(...fits.map((b) => b.price)) }
      : null,
    prebuilds: prebuilds.map((p) => {
      const live = prebuildLive(p, categories, parts as any);
      return { id: p.id, title: p.title, budgetType: p.budgetType, total: live.liveTotal, missing: live.missingParts.length, href: live.builderHref };
    }),
  };
}
