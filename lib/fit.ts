/**
 * ============ هل تدخل اللوحة في الكيس؟ ============
 *
 * سؤالٌ لم يكن أحدٌ يسأله في الموقع.
 *
 * محرّك التوافق يفحص المقبس ونوع الرام وطول الكرت وقدرة المزوّد — ولا
 * يفحص **حجم اللوحة مقابل حجم الكيس** إطلاقاً. فتمرّ تجميعةٌ بلوحة ATX
 * في كيس Micro-ATX، وهي لا تُركَّب مهما فعلت.
 *
 * رُصد فعلاً في «تجميعات مقترحة»: اثنتان من ثلاث كانتا مستحيلتين —
 * لوحة ATX في Thermaltake Tower 300 (كيس Micro-ATX)، ولوحة Micro-ATX في
 * NZXT H210 (كيس Mini-ITX).
 *
 * والقاعدة بسيطة: الكيس يقبل مقاسه وما دونه، لا ما فوقه.
 */

/** رتبة مقاس اللوحة — الأصغر أوّلاً */
const BOARD_RANK: Record<string, number> = {
  'Mini-ITX': 1,
  'Micro-ATX': 2,
  'ATX': 3,
  'E-ATX': 4,
};

/** أكبر لوحة يقبلها كل نوع كيس */
const CASE_RANK: Record<string, number> = {
  'Mini-ITX': 1,
  'Micro-ATX Tower': 2,
  'Mid Tower': 3,
  'Full Tower': 4,
};

export const boardRank = (formFactor: unknown): number | null =>
  BOARD_RANK[String(formFactor || '').trim()] ?? null;

export const caseRank = (formFactor: unknown): number | null =>
  CASE_RANK[String(formFactor || '').trim()] ?? null;

/**
 * هل تدخل هذه اللوحة في هذا الكيس؟
 *
 * ⚠️ القيمة المجهولة تُقبل عمداً: مقاسٌ لم نسجّله بعد لا يجوز أن يُسقط
 * تجميعةً صحيحة. الحارس يمنع المستحيل المعروف، ولا يخترع منعاً من نقص
 * البيانات.
 */
export function boardFitsCase(boardFormFactor: unknown, caseFormFactor: unknown): boolean {
  const b = boardRank(boardFormFactor);
  const c = caseRank(caseFormFactor);
  if (b == null || c == null) return true;
  return c >= b;
}

/** نصٌّ عربي يشرح سبب الرفض — للرسائل في المجمّع */
export function fitReason(boardFormFactor: unknown, caseFormFactor: unknown): string | null {
  if (boardFitsCase(boardFormFactor, caseFormFactor)) return null;
  return `اللوحة من مقاس ${boardFormFactor} ولا تدخل كيساً من نوع ${caseFormFactor}.`;
}

/* ============ هل يدخل المزوّد في الكيس؟ ============
 *
 * ⚠️ لا يُشتقّ من حجم الكيس. جرّبتُ القاعدة الحدسية «Mini-ITX ⇒ SFX»
 * فتبيّن أنها خاطئة: NZXT H210 يقبل ATX بطول ٣١١ مم (وحامل SFX مركّب
 * قابل للنزع)، وNR200P يقبل ATX بحاملٍ يُشترى. فمنعُهما من ATX كان
 * سيُسقط تجميعاتٍ صحيحة تماماً.
 *
 * فالمصدر بيانٌ على الكيس نفسه (`psuFormFactor`) لا استنتاج. وما لم
 * يُسجَّل يُقبل — الحارس يمنع المستحيل المعروف لا المجهول.
 *
 * و«ATX 3.0» نسخةُ معيارٍ لا مقاسٌ فيزيائي: المزوّد بها ATX الحجم،
 * فتُطبَّع قبل المقارنة وإلّا رُفض مزوّدٌ يدخل فعلاً.
 */
const normPsu = (raw: unknown): string => {
  const s = String(raw || '').trim().toUpperCase();
  if (!s) return '';
  if (s.startsWith('SFX-L')) return 'SFX-L';
  if (s.startsWith('SFX')) return 'SFX';
  if (s.startsWith('ATX')) return 'ATX';
  return s;
};

export function psuFitsCase(psuFormFactor: unknown, casePsuSupport: unknown): boolean {
  const psu = normPsu(psuFormFactor);
  const support = String(casePsuSupport || '').trim();
  if (!psu || !support) return true;

  const accepted = support.split('/').map((x) => normPsu(x)).filter(Boolean);
  if (accepted.length === 0) return true;

  // كيسٌ يقبل SFX-L يقبل SFX الأصغر منه بالضرورة
  if (psu === 'SFX' && accepted.includes('SFX-L')) return true;
  return accepted.includes(psu);
}

export function psuFitReason(psuFormFactor: unknown, casePsuSupport: unknown): string | null {
  if (psuFitsCase(psuFormFactor, casePsuSupport)) return null;
  return `الكيس يقبل مزوّدات ${casePsuSupport} والمزوّد المختار من مقاس ${psuFormFactor}.`;
}
