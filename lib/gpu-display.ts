/* ============ منافذ العرض في كرت الشاشة — بالمعماريّة لا بنصّ المواصفات ============
 *
 * نصّ `specs.ports` حرٌّ: «DP 2.1» و«2.1a» و«2.1b» لكرتين من الجيل نفسه، وصفوف الشريحة
 * العامّة (RTX 5070 مثلاً) تحمل عروضاً من شركاتٍ مختلفة. لكنّ **أعلى نسخة** DP وHDMI يحدّدها
 * محرّك العرض في المعالج الرسوميّ نفسه، فتتساوى فيها كلّ نسخ الشركاء من الشريحة؛ الشركاء
 * يغيّرون **العدد** فقط (منفذا HDMI بدل واحد) — ولا يهمّ العدد لشاشةٍ واحدة.
 *
 * فما يُبنى عليه حكم (فحص الشاشة، 2026-11) يُقرأ من هنا بحقل `specs.architecture`
 * (موجودٌ في الكروت كلّها، ٩ قيم)، والنصّ يبقى للعرض. والاستثناء Alchemist: HDMI 2.1 فيه
 * بشريحة تحويلٍ على اللوحة لا في المعالج، فيختلف بالنسخة — يُقرأ من نصّ الصفّ.
 *
 * المصادر (قُرئت 2026-11-05):
 *   NVIDIA  rtx-5070-family (4K 480Hz / 8K 165Hz مع DSC) · ورقة Blackwell (DP 2.1b بـUHBR20 حتى 80 جيجابت)
 *           rtx-4070-family (DP 1.4a، HDMI 2.1a، 4K 240Hz / 8K 60Hz مع DSC) · rtx-3060-3060ti (DP 1.4a+DSC، HDMI 2.1)
 *           جدول المقارنة: GTX 1650 G6 = DP 1.4a وHDMI 2.0b وDL-DVI-D
 *   AMD     RX 9070 XT: DP 2.1a وHDMI 2.1b، و«حتى 8K 144Hz» — بلا سرعة رابط · إعلان RDNA 3 (2022): UHBR 13.5 ≈ 54 جيجابت
 *           RX 6700 XT: DP 1.4a وHDMI 2.1 (4K120 / 8K60 مع VRR) — بلا ذكرٍ لـDSC
 *   Intel   Arc B580: DP 2.1 حتى UHBR 13.5، وHDMI 2.1 · Arc A770: DP 2.0 حتى UHBR 10، و«HDMI 2.1، HDMI 2.0b»
 *
 * ⚠️ ما لم يُذكر رسمياً لا يُخمَّن: `dsc: null` = لم تذكره الشركة، و`dpRateNote` يشرح سرعةً غير مذكورة.
 */

export type DisplayCap = {
  /** نسخة DisplayPort كما تكتبها الشركة */
  dp: string;
  /** أعلى سرعة رابط DP بالجيجابت/ث (الخام): HBR3 = 32.4، UHBR10 = 40، UHBR13.5 = 54، UHBR20 = 80 */
  dpGbps: number;
  /** سرعة الرابط غير مذكورة رسمياً — أُخذ الأدنى المرجّح وسببه هنا */
  dpRateNote?: string;
  /** نسخة HDMI — null: تختلف بنسخة الكرت (اقرأ نصّ الصفّ) */
  hdmi: string | null;
  /** HDMI 2.0b = 18 جيجابت، HDMI 2.1 (FRL) = 48 */
  hdmiGbps: number | null;
  /** ضغط DSC — null: لم تذكره الشركة في مصادرنا */
  dsc: boolean | null;
};

export const GPU_DISPLAY: Record<string, DisplayCap> = {
  'Blackwell':    { dp: '2.1b', dpGbps: 80,   hdmi: '2.1b', hdmiGbps: 48, dsc: true },
  'Ada Lovelace': { dp: '1.4a', dpGbps: 32.4, hdmi: '2.1a', hdmiGbps: 48, dsc: true },
  'Ampere':       { dp: '1.4a', dpGbps: 32.4, hdmi: '2.1',  hdmiGbps: 48, dsc: true },
  'Turing':       { dp: '1.4a', dpGbps: 32.4, hdmi: '2.0b', hdmiGbps: 18, dsc: null },
  'RDNA 4': {
    dp: '2.1a', dpGbps: 54, hdmi: '2.1b', hdmiGbps: 48, dsc: true,
    dpRateNote: 'AMD لا تذكر سرعة الرابط؛ أُخذت UHBR 13.5 المؤكّدة في الجيل السابق (RDNA 3). و«8K 144Hz» المعلنة لا تكون إلا بـDSC.',
  },
  'RDNA 3':       { dp: '2.1',  dpGbps: 54,   hdmi: '2.1',  hdmiGbps: 48, dsc: true },
  'RDNA 2':       { dp: '1.4a', dpGbps: 32.4, hdmi: '2.1',  hdmiGbps: 48, dsc: null },
  'Battlemage':   { dp: '2.1',  dpGbps: 54,   hdmi: '2.1',  hdmiGbps: 48, dsc: null },
  'Alchemist':    { dp: '2.0',  dpGbps: 40,   hdmi: null,   hdmiGbps: null, dsc: null },
};

/** «2.1b» ← «2.1»: الحرف لا يغيّر ما تحتاجه شاشةٌ اليوم، فالمقارنة على الرقمين */
const major = (v: string | null | undefined) => v?.match(/\d+\.\d+/)?.[0] ?? null;

const readVer = (ports: string, kind: 'DP' | 'HDMI') =>
  ports.match(new RegExp(`${kind}\\s*(\\d+\\.\\d+[a-z]?)`, 'i'))?.[1] ?? null;

/** منافذ الكرت لحكمٍ: من المعماريّة، وHDMI من نصّ الصفّ حين تختلف بالنسخة (Alchemist) */
export function gpuDisplay(architecture: string | null | undefined, portsText?: string | null): DisplayCap | null {
  const cap = architecture ? GPU_DISPLAY[architecture.trim()] : undefined;
  if (!cap) return null;
  if (cap.hdmi != null) return cap;
  const h = portsText ? readVer(portsText, 'HDMI') : null;
  const m = major(h);
  return { ...cap, hdmi: h, hdmiGbps: m === '2.1' ? 48 : m === '2.0' ? 18 : null };
}

/** ما يخالف فيه نصُّ الصفّ معماريّتَه (بالرقمين لا بالحرف) — لسكربت التدقيق */
export function portsMismatch(architecture: string | null | undefined, portsText: string | null | undefined): string[] {
  const cap = architecture ? GPU_DISPLAY[architecture.trim()] : undefined;
  if (!cap) return [`معماريّة غير معروفة: ${architecture ?? '—'}`];
  const out: string[] = [];
  const dp = readVer(portsText || '', 'DP');
  if (dp && major(dp) !== major(cap.dp)) out.push(`DP ${dp} والمعماريّة ${cap.dp}`);
  const hdmi = readVer(portsText || '', 'HDMI');
  if (hdmi && cap.hdmi && major(hdmi) !== major(cap.hdmi)) out.push(`HDMI ${hdmi} والمعماريّة ${cap.hdmi}`);
  return out;
}
