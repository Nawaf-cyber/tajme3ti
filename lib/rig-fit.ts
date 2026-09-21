/* ============ «هل يناسب جهازي؟» ============
 *
 * يُسأل من صفحة القطعة: عنده جهازٌ مسجَّل، ويرى كرتاً، فيريد جواباً
 * واحداً — أيدخل أم لا؟
 *
 * ⚠️ ولا يُستدعى `checkBuild` على الجهاز + المرشَّح ثمّ تُعرض نتيجتُه:
 * تلك تُعيد عيوب الجهاز **القائمة** أيضاً. فمن يتصفّح كرت شاشة يرى
 * «ملفّ رامك EXPO على لوحة إنتل» — تحذيرٌ صحيح، في المكان الخطأ، وفي
 * اللحظة الخطأ. وتكرارُه على ٣٥٣ صفحةٍ يعلّمه تجاهل الصندوق كلَّه.
 *
 * فالجواب **فرقُ حالتين**: الجهازُ بلا قطعةِ هذه الفئة، ثمّ هو نفسه
 * والمرشَّحُ مكانها. وما ظهر في الثانية ولم يكن في الأولى هو وحده ما
 * يسبّبه المرشَّح. ويُسقط هذا الفرقُ تلقائياً تحذيرَي «لا مبرّد» و«لا
 * كرت» حين يكون المرشَّح مبرّداً أو كرتاً — فهما موجودان في الحالة
 * الأولى بحكم الحذف.
 *
 * ⚠️ وما لم يُفحص يُقال لا يُسكت عنه: `checkBuild` تتخطّى الفحص بصمتٍ
 * حين يغيب طرفُه. فمن لم يسجّل كيسه يحصل على «يناسب» في كرتٍ طولُه ٣٦٠
 * مم — وهو جوابٌ كاذبٌ بالسكوت. ولذلك `unchecked`.
 */

import { checkBuild, type BuildParts, type Issue, type PartLike } from './build-check';

export type RigCategory = keyof BuildParts;

export type FitState =
  /** لا يمنعه شيء ولا يحذّر منه */
  | 'fits'
  /** يعمل، وفيه ما يُقال */
  | 'warn'
  /** لا يُركَّب */
  | 'block';

export type FitVerdict = {
  state: FitState;
  /** ما يسبّبه المرشَّح وحده */
  issues: Issue[];
  /** فحوصٌ لم تُجرَ، وسببُها */
  unchecked: { need: RigCategory; why: string }[];
};

/**
 * ما يحتاجه فحصُ كلِّ فئةٍ من بقيّة الجهاز.
 *
 * ⚠️ وتُكتب صراحةً لا تُستنتج من رموز `checkBuild`: الرمز يخبرنا بما
 * **وقع**، ونحن نريد ما **لم يقع ولماذا**. والغيابُ لا رمزَ له.
 */
const NEEDS: Record<RigCategory, { need: RigCategory; why: string }[]> = {
  CPU: [
    { need: 'Motherboard', why: 'لنتأكّد أنّ مقبس اللوحة يقبله' },
    { need: 'Cooler', why: 'لنتأكّد أنّ مبرّدك يُركَّب على مقبسه' },
    { need: 'PSU', why: 'لنحسب هل يكفيه مزوّدك' },
  ],
  GPU: [
    { need: 'Case', why: 'لنتأكّد أنّ طوله يدخل كيسك' },
    { need: 'PSU', why: 'لنحسب هل يكفيه مزوّدك' },
  ],
  RAM: [
    { need: 'Motherboard', why: 'لنتأكّد من نوع الذاكرة وسعتها وسرعتها' },
  ],
  Motherboard: [
    { need: 'CPU', why: 'لنتأكّد أنّ مقبسها يقبل معالجك' },
    { need: 'Case', why: 'لنتأكّد أنّ مقاسها يدخل كيسك' },
    { need: 'RAM', why: 'لنتأكّد أنّها تقبل نوع ذاكرتك' },
  ],
  Case: [
    { need: 'GPU', why: 'لنتأكّد أنّ كرتك يدخل فيه' },
    { need: 'Motherboard', why: 'لنتأكّد أنّ لوحتك تدخل فيه' },
    { need: 'Cooler', why: 'لنتأكّد أنّ مبرّدك يدخل فيه' },
  ],
  PSU: [
    { need: 'Case', why: 'لنتأكّد أنّ مقاسه يدخل كيسك' },
    { need: 'GPU', why: 'لنحسب الاستهلاك بدقّة' },
  ],
  Cooler: [
    { need: 'CPU', why: 'لنتأكّد أنّه يُركَّب على مقبس معالجك' },
    { need: 'Case', why: 'لنتأكّد أنّ ارتفاعه يدخل كيسك' },
  ],
  /* ⚠️ ولا فحصَ للتخزين في `checkBuild` إطلاقاً: أقراص M.2 وSATA تدخل كلَّ
     لوحةٍ حديثة. فالصمتُ هنا صحيحٌ لا ناقص — ولا يُخترع له شرط. */
  Storage: [],
};

/** مفتاحُ مقارنةٍ يميّز العطل عن نظيره في فئةٍ أخرى */
const keyOf = (i: Issue) => `${i.code}|${i.fixCategory}|${i.message}`;

/**
 * @param rig      قطع الجهاز المسجَّل — الغائب يبقى غائباً
 * @param category فئة القطعة المعروضة
 * @param part     القطعة المعروضة
 * @param customKeys فئاتٌ في الجهاز كتبها المستخدم نصّاً — لا مواصفات لها،
 *                   فهي كالغائبة في الفحص وإن ظهرت في بطاقته
 */
export function fitsRig(
  rig: BuildParts,
  category: RigCategory,
  part: PartLike,
  customKeys: RigCategory[] = [],
): FitVerdict {
  const custom = new Set(customKeys);

  /* القطعةُ المكتوبة نصّاً تُحذف من الفحص: `specs` فارغة، ووجودُها يُفعّل
     شرطاً لا بيانات له فيخرج حكمٌ مبنيٌّ على فراغ. */
  const base: BuildParts = { ...rig };
  for (const k of custom) delete base[k];
  delete base[category];

  const before = new Set(checkBuild(base).map(keyOf));
  const after = checkBuild({ ...base, [category]: part });

  const issues = after.filter((i) => !before.has(keyOf(i)));

  const unchecked = (NEEDS[category] ?? []).filter(
    (n) => !base[n.need] || custom.has(n.need),
  );

  const state: FitState = issues.some((i) => i.level === 'block')
    ? 'block'
    : issues.length
      ? 'warn'
      : 'fits';

  return { state, issues, unchecked };
}

/** هل في الجهاز ما يكفي لإصدار حكمٍ أصلاً؟ */
export const rigIsEmpty = (rig: BuildParts): boolean =>
  (Object.keys(rig) as RigCategory[]).every((k) => !rig[k]);
