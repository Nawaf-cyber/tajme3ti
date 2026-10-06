/* ============ «تكلفة المنصّة» — المعالج ولوحته معاً ============
 *
 * مقارنةُ معالج AMD بمعالج Intel بسعرهما وحده مضلّلة: اللوحة جزءٌ من
 * الثمن ولا يعمل المعالج بدونها، وأرخصُ لوحةٍ لمقبسٍ قد تفرق مئات الريالات
 * عن أرخصها لمقبسٍ آخر. فالرقمُ هنا: المعالج + أرخص لوحةٍ **متوفّرة الآن**
 * تقبله.
 *
 * ⚠️ «تقبله» بفحص الباني نفسه (checkBuild): المقبس، وحدّ قدرة اللوحة
 * (cpuPower). ومقبسٌ مجهول يُستبعد لا يُقبل — لا نَعِد بما لم نتحقّق منه.
 *
 * ⚠️ وما لا يُحسب يُقال لا يُسكت عنه:
 *   • لوحات 600 من AM5 مع Ryzen 8000/9000 — قد تحتاج تحديث BIOS (تقوله
 *     AMD، وهو ملاحظة السلسلة في lib/series-motherboard). تبقى مرشّحة
 *     لأنها تعمل بعد التحديث، ويُنبَّه عليها.
 *   • المبرّد غير المرفق لا يُضاف ثمنه: أرخص مبرّدٍ قد لا يكفي معالجاً
 *     بـ١٢٠ واط، وأيُّ رقمٍ نضيفه تخمين. فيُقال «بلا مبرّد» صراحةً.
 *   • نوع الذاكرة (DDR4/DDR5) يُذكر: لوحة DDR4 الأرخص تعني ذاكرةً أخرى.
 */

import { checkBuild, bundledCooler, type PartLike } from './build-check';
import { isAvailable } from './stores';

export type PlatformCost = {
  board: { id: string; brand: string; name: string; price: number; ramType: string | null; chipset: string | null };
  /** سعر المعالج + اللوحة */
  total: number;
  /** كم لوحةً متوفّرة تقبله — «أرخص واحدة من ٢٣» غير «الوحيدة» */
  options: number;
  /** لوحة 600 مع Ryzen 8000/9000 */
  biosNote: boolean;
  /** المعالج بلا مبرّد في علبته */
  noCooler: boolean;
  /** لوحةٌ اقتصاديّة بلا حدّ قدرةٍ مسجَّل، ومعالجٌ فوق ٦٥ واط — لم نتحقّق */
  powerUnverified: boolean;
};

const specsOf = (p: any) => (typeof p?.specs === 'string' ? JSON.parse(p.specs) : p?.specs ?? {});

/** فحوص اللوحة مع المعالج التي تمنع اعتبارها «تقبله» */
const BLOCKING = new Set(['socket', 'cpuPower']);

const RYZEN_NEW = /Ryzen\s+(?:AI\s+)?\d\s+(?:PRO\s+)?[89]\d{3}/i;
const AM5_600 = /^[ABX]6\d\d/i;

export function platformCost(cpu: PartLike & { price: number }, boards: (PartLike & { id: string; brand: string; name: string; price: number })[]): PlatformCost | null {
  if (!cpu || !(cpu.price > 0)) return null;
  const fits = boards.filter((b) =>
    b.price > 0 && isAvailable(b as any) &&
    !checkBuild({ CPU: cpu, Motherboard: b }).some((i) => BLOCKING.has(i.code)),
  );
  if (!fits.length) return null;
  const best = fits.reduce((a, b) => (b.price < a.price ? b : a));
  const bs = specsOf(best);
  return {
    board: { id: best.id, brand: best.brand, name: best.name, price: best.price, ramType: bs.ramType ?? null, chipset: bs.chipset ?? null },
    total: Math.round((cpu.price + best.price) * 100) / 100,
    options: fits.length,
    biosNote: RYZEN_NEW.test(cpu.name ?? '') && AM5_600.test(String(bs.chipset ?? '')),
    noCooler: bundledCooler(specsOf(cpu).includedCooler) === 'no',
    /* ⚠️ حدّ القدرة (maxCpuTdpW) مسجَّلٌ على لوحةٍ واحدة من ٥٧ (2026-10-06)،
       فـcpuPowerFitsBoard يمرّر الباقي بلا حكم. واللوحات الاقتصاديّة هي التي
       تحدّ قدرة المعالج عادةً — وهي بالضبط ما يختاره «الأرخص». فيُقال. */
    powerUnverified: ENTRY.test(String(bs.chipset ?? '')) && !bs.maxCpuTdpW
      && !(Number(specsOf(cpu).tdpW) > 0 && Number(specsOf(cpu).tdpW) <= 65),
  };
}

/** شيبستات اللوحات الاقتصاديّة — حيث يُعلَن حدّ قدرة المعالج عادةً */
const ENTRY = /^(A620|A520|H610|H810)/i;
