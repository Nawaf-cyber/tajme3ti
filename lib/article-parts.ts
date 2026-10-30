/* ============ «الشرائح المذكورة · أسعارها عندنا الحين» (2026-10-30) ============
 *
 * عمود صفحة المقال: الكروت والمعالجات التي يذكرها النصّ بالاسم، وأرخص نسخةٍ
 * متوفّرة من كلٍّ منها الآن. بلا حقلٍ في القاعدة: الأسماء تُلتقط من النصّ بقوائم
 * الشرائح نفسها التي يقيس بها التقييم (lib/gpu-perf · lib/cpu-perf)، والقطعة
 * تُنسب إلى شريحتها بالدالّتين نفسيهما اللتين يستعملهما الموقع كلّه.
 *
 * ⚠️ حدّه المعروف: ما ليس في قوائم التقييم لا يُلتقط (شريحةٌ أُعلنت ولم تُقَس بعد).
 * قِيس 2026-10-30 على ٢٠ مقالاً: ثلاثةٌ تذكر شرائح بالاسم، وكلّها التُقطت صحيحةً
 * بلا خطأ — و«RTX 5070 SUPER» في مقال التسريبات لم تُحسب RTX 5070.
 */
import { prisma } from './prisma';
import { OFFER_INCLUDE } from './stores-server';
import { cheapestOffer } from './stores';
import { gpuChipsIn, gpuPerf } from './gpu-perf';
import { cpuChipsIn, cpuPerf } from './cpu-perf';

export type MentionedPart = {
  chip: string;
  kind: 'GPU' | 'CPU';
  id: string;
  brand: string;
  name: string;
  price: number;
  store: string;
};

const MAX = 6;

const specsOf = (s: unknown): Record<string, unknown> => {
  if (typeof s !== 'string') return (s as Record<string, unknown>) || {};
  try { return JSON.parse(s); } catch { return {}; }
};

export async function mentionedParts(text: string): Promise<MentionedPart[]> {
  const gpuChips = gpuChipsIn(text);
  const cpuChips = cpuChipsIn(text);
  if (!gpuChips.length && !cpuChips.length) return [];

  const comps = await prisma.component.findMany({
    where: { category: { name: { in: [...(gpuChips.length ? ['GPU'] : []), ...(cpuChips.length ? ['CPU'] : [])] } } },
    select: { id: true, brand: true, name: true, specs: true, category: { select: { name: true } }, ...OFFER_INCLUDE },
  });

  /* أرخص نسخةٍ متوفّرة لكلّ شريحة */
  const best = new Map<string, MentionedPart>();
  for (const c of comps) {
    const kind = c.category.name as 'GPU' | 'CPU';
    const chip = kind === 'GPU'
      ? gpuPerf(c.name, parseFloat(String(specsOf(c.specs).vram ?? '')) || null)?.chip
      : cpuPerf(c.name)?.chip;
    if (!chip) continue;
    const wanted = kind === 'GPU' ? gpuChips : cpuChips;
    if (!wanted.includes(chip)) continue;
    const o = cheapestOffer(c.offers as any);
    if (!o?.price) continue;
    const cur = best.get(chip);
    if (!cur || o.price < cur.price) {
      best.set(chip, { chip, kind, id: c.id, brand: c.brand, name: c.name, price: o.price, store: o.store.name });
    }
  }

  /* بترتيب ذكرها في المقال */
  return [...gpuChips.map((c) => best.get(c)), ...cpuChips.map((c) => best.get(c))]
    .filter((x): x is MentionedPart => !!x)
    .slice(0, MAX);
}
