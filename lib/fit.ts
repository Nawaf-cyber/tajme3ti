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

/**
 * أصغر كيسٍ تحتاجه كل لوحة.
 *
 * ⚠️ E-ATX تحتاج **Mid Tower** لا Full Tower.
 * أوّل صياغة أعطتها رتبةً رابعة تقصرها على Full Tower، فمنعت لوحتَي
 * E-ATX من ٢١ كيساً من ٢٤ — ومنها Corsair 5000D وO11 Dynamic EVO
 * وMeshify 2 وLancool III، وكلّها تقبل E-ATX فعلاً. فكان الحارس يخترع
 * منعاً بدل أن يمنع مستحيلاً، وهو نقيض الغرض منه.
 *
 * و«Mid Tower» في الاستعمال الحديث تعني ATX/E-ATX. والدقّة التامّة تحتاج
 * حقلاً على كل كيس يقول أكبر لوحة يقبلها — وهو ما يستحقّ التسجيل لاحقاً،
 * ولا يجوز أن يُستبدل به تخمينٌ يمنع الصحيح.
 */
const BOARD_MIN_CASE: Record<string, number> = {
  'Mini-ITX': 1,
  'Micro-ATX': 2,
  'ATX': 3,
  'E-ATX': 3,
};

/** أكبر لوحة يقبلها كل نوع كيس */
const CASE_RANK: Record<string, number> = {
  'Mini-ITX': 1,
  'Micro-ATX Tower': 2,
  'Mid Tower': 3,
  'Full Tower': 4,
};

/** أصغر رتبة كيسٍ تقبل هذه اللوحة */
export const boardRank = (formFactor: unknown): number | null =>
  BOARD_MIN_CASE[String(formFactor || '').trim()] ?? null;

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

/**
 * المقاسات مرتّبة: الحاملُ الأكبر يقبل الأصغر.
 *
 * ⚠️ كانت المقارنة عضويةً حرفية في القائمة، مع استثناءٍ يدويّ واحد
 * (SFX داخل حامل SFX-L). وهي تكذب في اتجاهين:
 *
 *   · كيسٌ سُجّل عليه «ATX» يرفض مزوّد SFX — وهو يدخله فعلاً بالحامل
 *     المرفق معه. وهذا وحده كان سيولّد ١١٥ منعاً خاطئاً من ٨٦٤ زوجاً
 *     لحظةَ تُملأ حقول الأبراج الثلاثة والعشرين.
 *   · وNZXT H210 المسجّل «ATX / SFX» يرفض اليوم مزوّد SFX-L — وهو كيسٌ
 *     يبتلع مزوّد ATX بطول ٣١١ مم، فرفضُه ما هو أصغر منه تناقض.
 *
 * والرتب تحسم الاتجاهين بقاعدةٍ واحدة بدل استثناءات تُضاف واحداً واحداً.
 */
const PSU_RANK: Record<string, number> = { SFX: 1, 'SFX-L': 2, ATX: 3 };

export function psuFitsCase(psuFormFactor: unknown, casePsuSupport: unknown): boolean {
  const psu = normPsu(psuFormFactor);
  const support = String(casePsuSupport || '').trim();
  if (!psu || !support) return true;

  const accepted = support.split('/').map((x) => normPsu(x)).filter(Boolean);
  if (accepted.length === 0) return true;

  /* أكبر حاملٍ يذكره الكيس. ومقاسٌ لا نعرف رتبته (معيارٌ جديد لم يُسجَّل
     بعد) يُسقطنا إلى المطابقة الحرفية بدل أن نخمّن له موضعاً في السلّم. */
  const topRank = Math.max(...accepted.map((a) => PSU_RANK[a] ?? 0));
  const psuRank = PSU_RANK[psu] ?? 0;
  if (topRank === 0 || psuRank === 0) return accepted.includes(psu);

  return psuRank <= topRank;
}

export function psuFitReason(psuFormFactor: unknown, casePsuSupport: unknown): string | null {
  if (psuFitsCase(psuFormFactor, casePsuSupport)) return null;
  return `الكيس يقبل مزوّدات ${casePsuSupport} والمزوّد المختار من مقاس ${psuFormFactor}.`;
}
