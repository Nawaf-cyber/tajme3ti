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
