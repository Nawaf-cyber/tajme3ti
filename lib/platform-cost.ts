/* ============ «تكلفة المنصّة» — المعالج ولوحته معاً ============
 *
 * مقارنةُ معالج AMD بمعالج Intel بسعرهما وحده مضلّلة: اللوحة جزءٌ من
 * الثمن ولا يعمل المعالج بدونها، وأرخصُ لوحةٍ لمقبسٍ قد تفرق مئات الريالات
 * عن أرخصها لمقبسٍ آخر. فالرقمُ هنا: المعالج + أرخص لوحةٍ **متوفّرة الآن**
 * تقبله + مبرّدٌ مناسب إن لم يكن في علبته.
 *
 * ⚠️ «تقبله» بفحص الباني نفسه (checkBuild): المقبس، وحدّ قدرة اللوحة
 * (cpuPower — من قوائم الشركات، scripts/fill-board-cpu-power). ومقبسٌ مجهول
 * يُستبعد لا يُقبل — لا نَعِد بما لم نتحقّق منه.
 *
 * والقائمة كلّها تُعاد (boards) لا الأرخص وحده: الزائر يختار غيرها في الصفحة،
 * والمجموع يُحسب من اختياره.
 */

import { checkBuild, bundledCooler, type PartLike } from './build-check';
import { isAvailable } from './stores';

export type BoardOption = {
  id: string; brand: string; name: string; price: number;
  ramType: string | null; chipset: string | null;
  /** لوحة 600 مع Ryzen 8000/9000 — تعمل بعد تحديث BIOS، وأغلب المعروض محدَّث */
  biosNote: boolean;
  /** لوحةٌ اقتصاديّة تدعم المعالج رسمياً، ومعالجٌ يسحب ٢٠٠ واط فأكثر — قد تحدّ أداءه تحت الحمل الطويل */
  entryHeavy: boolean;
  /** لوحةٌ اقتصاديّة بلا حدّ قدرةٍ مسجَّل، ومعالجٌ فوق ٦٥ واط — لم نتحقّق */
  powerUnverified: boolean;
};

export type CoolerOption = { id: string; brand: string; name: string; price: number };

export type PlatformCost = {
  /** كلّ اللوحات المتوفّرة التي تقبله، الأرخص أوّلاً */
  boards: BoardOption[];
  /** الأرخص — boards[0] */
  board: BoardOption;
  /** المعالج + أرخص لوحة + المبرّد إن لزم */
  total: number;
  /** كم لوحةً متوفّرة تقبله — «أرخص واحدة من ٢٣» غير «الوحيدة» */
  options: number;
  /** المعالج بلا مبرّد في علبته */
  noCooler: boolean;
  /** أرخص مبرّدٍ متوفّر يكفيه — يدخل المجموع تقديراً (null: في علبته مبرّد، أو لا مناسب متوفّر) */
  cooler: CoolerOption | null;
  /** للأرخص — تبقى لمن يقرأ الحقول القديمة */
  biosNote: boolean;
  powerUnverified: boolean;
};

const specsOf = (p: any) => (typeof p?.specs === 'string' ? JSON.parse(p.specs) : p?.specs ?? {});

/** فحوص اللوحة مع المعالج التي تمنع اعتبارها «تقبله» */
const BLOCKING = new Set(['socket', 'cpuPower']);

const RYZEN_NEW = /Ryzen\s+(?:AI\s+)?\d\s+(?:PRO\s+)?[89]\d{3}/i;
const AM5_600 = /^[ABX]6\d\d/i;

/** Ryzen 8000/9000 على لوحة 600 — تعمل بعد تحديث BIOS. ومُصدَّرة: لوحة جهاز الزائر تُفحص بها أيضاً */
export const biosNoteFor = (cpuName: string | null | undefined, chipset: unknown): boolean =>
  RYZEN_NEW.test(cpuName ?? '') && AM5_600.test(String(chipset ?? ''));
/** شيبستات اللوحات الاقتصاديّة — حيث يُعلَن حدّ قدرة المعالج عادةً */
const ENTRY = /^(A620|A520|H610|H810)/i;
/** أقصى سحبٍ (tdpWattage) يبدأ عنده ضغطُ لوحةٍ اقتصاديّة — i7/i9 K وUltra 7/9 K وRyzen 9 بـ٢٣٠ */
const HEAVY_W = 200;

/* ============ المبرّد التقديريّ ============
 * لا تصنيف قدرةٍ موثوقٌ للمبرّدات (قدرة التبديد تعلنها شركتان من ٣٥ وبمعايير
 * مختلفة)، فالقاعدة بالشكل لا بالرقم:
 *   • حتى ١٠٠ واط سحباً (معالجات ٦٥ واط): أيّ مبرّد.
 *   • حتى ٢٠٠: برجٌ هوائيّ بمروحة 120 فأكبر، أو مائيّ — يكفي 9800X3D (162).
 *     ⚠️ لا 92 مم: AG300 بستّين ريالاً كان «مناسب» 9800X3D قبل هذا الشرط.
 *   • فوق ٢٠٠: مائيّ 240 فأكبر، أو هوائيّ بمروحتين.
 * ويُقال «تقديريّ» بجانبه: الغرض أن تُقارن المنصّتان بالثمن نفسه، لا اختيارُ مبرّدك. */
function pickCooler(cpu: any, coolers: any[]): CoolerOption | null {
  const sock = String(specsOf(cpu).socket ?? '');
  if (!sock) return null;
  const w = Number(cpu.tdpWattage) || 0;
  const heavy = w > HEAVY_W;
  const ok = coolers.filter((c) => {
    if (!(c.price > 0) || !isAvailable(c)) return false;
    const s = specsOf(c);
    if (!String(s.sockets ?? '').toUpperCase().split(/[\/,\s]+/).includes(sock.toUpperCase())) return false;
    const aio = /aio|liquid/i.test(String(s.type ?? ''));
    if (w <= 100) return true;
    if (!heavy) return aio || (parseFloat(s.fanSize) || 0) >= 120;
    return aio ? (parseFloat(s.sizeMm) || 0) >= 240 : (parseFloat(s.fanCount) || 0) >= 2;
  });
  if (!ok.length) return null;
  const c = ok.reduce((a, b) => (b.price < a.price ? b : a));
  return { id: c.id, brand: c.brand, name: c.name, price: c.price };
}

export function platformCost(
  cpu: PartLike & { price: number },
  boards: (PartLike & { id: string; brand: string; name: string; price: number })[],
  coolers: any[] = [],
): PlatformCost | null {
  if (!cpu || !(cpu.price > 0)) return null;
  const cs = specsOf(cpu);
  const fits = boards
    .filter((b) => b.price > 0 && isAvailable(b as any) && !checkBuild({ CPU: cpu, Motherboard: b }).some((i) => BLOCKING.has(i.code)))
    .sort((a, b) => a.price - b.price);
  if (!fits.length) return null;
  const opts: BoardOption[] = fits.map((b) => {
    const bs = specsOf(b);
    const entry = ENTRY.test(String(bs.chipset ?? ''));
    return {
      id: b.id, brand: b.brand, name: b.name, price: b.price, ramType: bs.ramType ?? null, chipset: bs.chipset ?? null,
      biosNote: biosNoteFor(cpu.name, bs.chipset),
      entryHeavy: entry && !!bs.maxCpuTdpW && (Number((cpu as any).tdpWattage) || 0) >= HEAVY_W,
      powerUnverified: entry && !bs.maxCpuTdpW && !(Number(cs.tdpW) > 0 && Number(cs.tdpW) <= 65),
    };
  });
  const noCooler = bundledCooler(cs.includedCooler) === 'no';
  const cooler = noCooler ? pickCooler(cpu, coolers) : null;
  return {
    boards: opts,
    board: opts[0],
    total: Math.round((cpu.price + opts[0].price + (cooler?.price ?? 0)) * 100) / 100,
    options: opts.length,
    noCooler,
    cooler,
    biosNote: opts[0].biosNote,
    powerUnverified: opts[0].powerUnverified,
  };
}
