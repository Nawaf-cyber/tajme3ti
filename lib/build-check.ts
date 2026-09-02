/* ============ فحص التجميعة كاملةً — مصدرٌ واحد ============
 *
 * ⚠️ لماذا هذا الملفّ موجود:
 *
 * `lib/fit.ts` يحمل القواعد، لكنّ **من يستدعيها** كان ثلاثة، وكلٌّ يستدعي
 * ما شاء. قيس على الكود لا على الظنّ:
 *
 *   الفحص                 الباني   المُعدِّل   التجميعات المقترحة
 *   المقبس                  ✓        ✓        مقارنةُ نصٍّ يدويّة لا fit.ts
 *   نوع الذاكرة             ✓        ✓        ✗
 *   مقاس اللوحة ↔ الصندوق   ✓        ✗        ✓
 *   مقاس المزوّد ↔ الصندوق   ✓        ✗        ✓
 *   المبرّد ↔ المقبس/الصندوق  عند الاختيار فقط  ✗   ✗
 *
 * فكان المستخدم يُخرج من «المُعدِّل» تجميعةً بلوحة ATX في صندوق Mini-ITX،
 * وهي لا تُركَّب. وهو **نفس صنف العطل** الذي أصاب ساحبات الأسعار: منطقٌ
 * واحد بثلاث نسخ، يُشفى في واحدة ويبقى في اثنتين.
 *
 * فالحكم كلّه هنا، والسطوح الثلاثة تنادي `checkBuild` وتعرض كلٌّ بطريقتها.
 *
 * ============ مستويان لا واحد ============
 *
 *   block  تعارضٌ مؤكَّد — لا تُركَّب أو لا تُقلع.
 *   warn   نقصٌ في بياناتنا، أو أمرٌ يُنقص الأداء ولا يمنع التشغيل.
 *
 * ⚠️ والفرق ليس تجميليّاً: منعُ تجميعةٍ صحيحة بسبب حقلٍ لم نسجّله نحن
 * عقوبةٌ على المستخدم بخطئنا. والدرس مكتوبٌ في `fit.ts`: أوّل صياغةٍ
 * لقاعدة E-ATX منعتها من ٢١ صندوقاً من ٢٤ تقبلها فعلاً.
 */

import {
  socketMatch, ramTypeMatch, fitReason, psuFitReason,
  coolerFitsCpu, coolerCpuReason, coolerFitsCase, coolerFitReason,
} from './fit';
import { capacityGb, formatCapacity } from './capacity';

export type PartLike = {
  id?: string;
  name?: string;
  brand?: string;
  specs?: any;
  tdpWattage?: number | null;
} | null | undefined;

export type BuildParts = {
  CPU?: PartLike;
  Motherboard?: PartLike;
  RAM?: PartLike;
  GPU?: PartLike;
  Case?: PartLike;
  PSU?: PartLike;
  Storage?: PartLike;
  Cooler?: PartLike;
};

export type Issue = {
  level: 'block' | 'warn';
  /** الفئة التي يُصلَح فيها العطل — تستعملها الواجهة لتوجيه المستخدم */
  fixCategory: keyof BuildParts;
  code: string;
  message: string;
};

const specsOf = (p: PartLike): any => {
  const s = p?.specs;
  if (!s) return {};
  if (typeof s === 'string') { try { return JSON.parse(s); } catch { return {}; } }
  return s;
};

const numOf = (v: unknown): number | null => {
  const n = parseFloat(String(v ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

/* ============ هل مع المعالج مبرّد؟ ============
 *
 * ⚠️ لا يُسأل الحقل «هل تقول لا؟» بل «هل تُثبت نعم؟». والفرق ليس لفظيّاً:
 * كان الشرط `/^(none|no|لا يوجد)$/` — فأيّ صياغةٍ سواها تُسكت التحذير
 * سكوتاً تامّاً. وفي كتالوجنا فعلاً قيمةٌ اسمها «Included» ولو كُتب مكانها
 * «Not included» أو تُرك الحقل فارغاً لخرجت التجميعة بـ«توافقٌ تامّ» بلا
 * مبرّدٍ أصلاً — وهي لا تُقلع.
 *
 * فالسكوت الآن يحتاج **اسم مبرّدٍ معروف**، وما عداه — فراغاً كان أو نصّاً
 * لا نفهمه — يُحذَّر منه بصيغةٍ تقول إنّنا لم نتأكّد، لا إنّه لا مبرّد.
 */
const NO_COOLER_EXACT = /^\s*(none|no|n\/?a|-|—|بدون|لا\s*يوجد|غير\s*مرفق)\s*$/i;
const NO_COOLER_ANY = /not\s*included|without\s*(a\s*)?cooler|no\s*cooler|\btray\b|\boem\b|بدون\s*مبرّ?د/i;
const COOLER_NAME = /wraith|laminar|\bincluded\b|stock\s*cooler|boxed?\s*cooler|مبرّ?د|مرفق/i;

export const bundledCooler = (v: unknown): 'yes' | 'no' | 'unknown' => {
  const s = String(v ?? '').trim();
  if (!s || NO_COOLER_EXACT.test(s) || NO_COOLER_ANY.test(s)) return 'no';
  return COOLER_NAME.test(s) ? 'yes' : 'unknown';
};

/** هامش الأمان فوق مجموع الاستهلاك المسجَّل — الحدّ الأدنى */
export const PSU_HEADROOM = 100;

/**
 * هامشُ مزوّدٍ يتناسب مع الكرت لا رقمٌ ثابت.
 *
 * ⚠️ والهامش الثابت (١٠٠ واط) كان يُمرِّر تجميعاتٍ يرفضها المصنّع نفسه:
 * كرت 5090 استهلاكه ٥٧٥ واط مع معالجٍ ١٢٠ ⇐ ٧٩٥ واط، فيمرّ مزوّد ٨٥٠ —
 * وإنفيديا توصي بـ١٠٠٠. والسبب أن الكروت الحديثة تقفز لحظيّاً فوق
 * استهلاكها المعلَن، والقفزة تكبر بكبر الكرت لا بمقدارٍ ثابت.
 *
 * ⚠️ ولا يتغيّر شيءٌ للفئة المتوسطة: كرتٌ ٢٥٠ واط يعطي هامشاً ١٠٠ كما
 * كان. فالتشديد يقع حيث المشكلة وحدها.
 */
export const psuHeadroom = (gpuTdp: number): number =>
  Math.max(PSU_HEADROOM, Math.round((Number(gpuTdp) || 0) * 0.4));

/** مجموع الاستهلاك المسجَّل — والمسجَّل عندنا معالجٌ ولوحةٌ وكرت */
export const computeDraw = (parts: BuildParts): number =>
  Object.values(parts).reduce((sum, p) => sum + (Number(p?.tdpWattage) || 0), 0);

/**
 * كل ما يمكن قوله عن هذه التجميعة، مرتّباً: المانع قبل المحذّر.
 *
 * ⚠️ ويفحص ما هو **موجود** فقط: تجميعةٌ ناقصة تُفحص أجزاؤها الحاضرة، فلا
 * ينتظر المستخدم إكمال سبع قطعٍ ليعرف أنّ لوحته لا تدخل صندوقه.
 */
export function checkBuild(parts: BuildParts): Issue[] {
  const out: Issue[] = [];
  const cpu = specsOf(parts.CPU);
  const mobo = specsOf(parts.Motherboard);
  const ram = specsOf(parts.RAM);
  const gpu = specsOf(parts.GPU);
  const cse = specsOf(parts.Case);
  const psu = specsOf(parts.PSU);
  const cooler = specsOf(parts.Cooler);

  if (parts.CPU && parts.Motherboard) {
    const v = socketMatch(cpu.socket, mobo.socket);
    if (!v.ok) {
      out.push({ level: v.unknown ? 'warn' : 'block', fixCategory: 'Motherboard', code: 'socket', message: v.reason! });
    }
  }

  if (parts.RAM && parts.Motherboard) {
    const v = ramTypeMatch(ram.type, mobo.ramType);
    if (!v.ok) {
      out.push({ level: v.unknown ? 'warn' : 'block', fixCategory: 'RAM', code: 'ramType', message: v.reason! });
    }
  }

  if (parts.GPU && parts.Case) {
    const len = numOf(gpu.lengthMm);
    const max = numOf(cse.maxGpuLength);
    if (len && max && len > max) {
      out.push({
        level: 'block', fixCategory: 'Case', code: 'gpuLength',
        message: `طول الكرت ${len}مم أكبر من مساحة الصندوق ${max}مم.`,
      });
    }
  }

  if (parts.Motherboard && parts.Case) {
    const why = fitReason(mobo.formFactor, cse.formFactor);
    if (why) out.push({ level: 'block', fixCategory: 'Case', code: 'boardCase', message: why });
  }

  if (parts.PSU && parts.Case) {
    const why = psuFitReason(psu.formFactor, cse.psuFormFactor);
    if (why) out.push({ level: 'block', fixCategory: 'PSU', code: 'psuCase', message: why });
  }

  /* ============ المبرّد ============
   * كان يُفحص عند الاختيار فقط، فتخرج تجميعةٌ من «المُعدِّل» أو من تجميعةٍ
   * محفوظة بمبرّدٍ لا يُركَّب على معالجها. */
  if (parts.Cooler && parts.CPU && !coolerFitsCpu(cooler.sockets, cpu.socket)) {
    out.push({
      level: 'block', fixCategory: 'Cooler', code: 'coolerSocket',
      message: coolerCpuReason(cooler.sockets, cpu.socket)!,
    });
  }

  if (parts.Cooler && parts.Case
      && !coolerFitsCase(cooler.type, cooler.sizeMm, cse.maxCoolerHeight, cse.radiatorSupport)) {
    out.push({
      level: 'block', fixCategory: 'Cooler', code: 'coolerCase',
      message: coolerFitReason(cooler.type, cooler.sizeMm, cse.maxCoolerHeight, cse.radiatorSupport)!,
    });
  }

  /* ⚠️ ٢٩ من ٤٦ معالجاً عندنا لا يأتي بمبرّد. وكانت التجميعة تُعلن «توافقٌ
     تامّ» بلا مبرّدٍ أصلاً — وهي لا تُقلع.
     وهو تحذيرٌ لا منع: المستخدم قد يملك مبرّداً من جهازه السابق، ومنعُه
     يجعل الأداة تكذب في الاتّجاه الآخر. */
  if (parts.CPU && !parts.Cooler) {
    const verdict = bundledCooler(cpu.includedCooler);
    if (verdict !== 'yes') {
      out.push({
        level: 'warn', fixCategory: 'Cooler', code: 'noCooler',
        message: verdict === 'no'
          ? 'هذا المعالج لا يأتي بمبرّد — أضف مبرّداً أو تأكّد أنّ عندك واحداً يناسب مقبسه.'
          : 'لم نتأكّد من وجود مبرّدٍ مرفقٍ مع هذا المعالج — أضف مبرّداً أو تأكّد أنّ عندك واحداً يناسب مقبسه.',
      });
    }
  }

  /* ============ سعة الذاكرة ============
   * ⚠️ ولا تُقارن السلاسل: «32GB» و«256GB» نصّان، و«2x16GB» طقمٌ مجموعه ٣٢.
   * فالحساب من `lib/capacity.ts` — الوحدة نفسها التي يستعملها الكتالوج. */
  if (parts.RAM && parts.Motherboard) {
    const kit = capacityGb(ram.kit) || capacityGb(ram.capacity);
    const max = capacityGb(mobo.maxRam);
    if (kit > 0 && max > 0 && kit > max) {
      out.push({
        level: 'block', fixCategory: 'RAM', code: 'ramCapacity',
        message: `اللوحة تقبل حتى ${mobo.maxRam} والطقم المختار ${formatCapacity(kit)}.`,
      });
    }
  }

  /* ============ سرعة الذاكرة ============
   * تحذيرٌ لا منع: الرام تعمل على أعلى ما تدعمه اللوحة، ولا تتعطّل. لكنّ
   * المشتري دفع فرقاً لن يستفيد منه — وذلك ما يستحقّ أن يُقال. */
  if (parts.RAM && parts.Motherboard) {
    const rs = numOf(ram.speed);
    const ms = numOf(mobo.memorySpeed);
    if (rs && ms && rs > ms) {
      out.push({
        level: 'warn', fixCategory: 'RAM', code: 'ramSpeed',
        message: `الطقم ${rs} MT/s واللوحة تدعم حتى ${mobo.memorySpeed} — ستعمل الذاكرة بسرعةٍ أقلّ.`,
      });
    }
  }

  if (parts.PSU) {
    const draw = computeDraw(parts);
    const w = numOf(psu.wattage);
    const headroom = psuHeadroom(Number(parts.GPU?.tdpWattage) || 0);
    if (w && draw > 0 && w < draw + headroom) {
      out.push({
        level: 'block', fixCategory: 'PSU', code: 'wattage',
        message: `الاستهلاك التقريبي مع هامش الأمان (${draw + headroom}W) يتجاوز قدرة المزوّد (${w}W).`,
      });
    }
  }

  /* المانع أوّلاً: الواجهة تعرض الأوّل حين تعرض واحداً */
  return out.sort((a, b) => (a.level === b.level ? 0 : a.level === 'block' ? -1 : 1));
}

/** هل فيها ما يمنع التركيب؟ — للترشيح الآليّ في «تجميعات مقترحة» */
export const buildBlocks = (parts: BuildParts): Issue[] =>
  checkBuild(parts).filter((i) => i.level === 'block');
