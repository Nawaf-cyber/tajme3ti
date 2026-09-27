/* ============ أرخصُ ترقيةٍ تفكّ الاختناق ============
 *
 * ⚠️ ومنطقٌ نقيٌّ خارج المسار: العطبُ الممكن هنا أن نقترح قطعةً **لا
 * تُركَّب** — كرتاً لا يدخل الكيس، أو معالجاً لا يقبله المقبس. وذلك لا
 * يُكتشف من قراءة الكود، ويُكتشف من تشغيله على أجهزةٍ حقيقيّة.
 *
 * ⚠️ والفحص بـ`fitsRig` نفسها التي تُجيب في صفحة القطعة: نسخةٌ ثانية من
 * شروط التركيب تعني ترقيةً «متوافقة» هنا و«لا تناسب جهازك» هناك — وهو
 * تناقضٌ يراه المستخدم في نقرتين.
 */

import { fitsRig, type RigCategory } from './rig-fit';
import type { BuildParts, PartLike } from './build-check';
import { upgradeRejectReason } from './upgrade-guard';

export type Candidate = PartLike & {
  id?: string;
  price?: number | null;
  performanceTier?: number | null;
  /** له عرضٌ قابلٌ للشراء اليوم */
  live?: boolean;
  /** ملاحظة التركيب إن قُبل بها («لا يأتي بمبرّد») — مع `allowWarn` وحده */
  fitNote?: string;
};

export type UpgradePick = {
  pick: Candidate | null;
  /** عندنا ما هو أقوى، لكن لا شيء منه يُركَّب كما هو */
  blocked: boolean;
};

/**
 * @param rig       قطع الجهاز
 * @param weak      الفئة التي تُرقّى
 * @param all       كلُّ ما في تلك الفئة
 * @param customKeys فئاتٌ مكتوبةٌ بخطّ اليد — لا مواصفات لها فلا تُفحص
 */
export function pickUpgrade(
  rig: BuildParts,
  weak: RigCategory,
  all: Candidate[],
  customKeys: RigCategory[] = [],
): UpgradePick {
  const { options, blocked } = upgradeOptions(rig, weak, all, customKeys, { limit: 1 });
  return { pick: options[0] ?? null, blocked };
}

/**
 * كلُّ الترقيات التي تُركَّب، الأرخص أوّلاً — ومنها `pickUpgrade` أوّلُها.
 *
 * ⚠️ مصدرٌ واحد لصفحتين: بطاقة «جهازي» (ترقيةٌ واحدة) وصفحة التجميعة
 * المشتركة (حتى ستّ). وكانت الصفحة تحمل نسختها: الأرخص بالدرجة وحدها،
 * بلا فحص توفّر ولا حارس ترقية ولا فحص تركيب إلّا المقبس — فتقترح قطعةً
 * نافدة، أو نسخةً أضعف من الشريحة نفسها («9600X ← 9600»).
 *
 * @param opts.allowWarn يقبل المرشَّح الذي عليه **ملاحظة** لا مانع، ويحملها في
 *   `fitNote`. قِيس على التجميعات المحفوظة: ٩ من ١٨ فيها اختناق فقدت كلَّ
 *   اقتراحاتها بلا هذا — لأنّها بلا مبرّد، فكلُّ معالجٍ لا يأتي بمبرّدٍ
 *   «ملاحظة». وتلك معلومةٌ يحتاجها المرقّي، لا سببٌ لإخفاء الترقية. وبطاقة
 *   «جهازي» تبقى على `'fits'` وحدها (مختبَرة كذلك).
 * @param opts.minTier أدنى درجةٍ تُقبل. الافتراض «أقوى من الحاليّة»؛ والصفحة
 *   المشتركة تطلب ما **يسدّ الفجوة** مع القطعة الأخرى (درجتُها − ١) — لأنّ
 *   قارئها قرأ للتوّ «المعالج يحدّ من الكرت»، وترقيةٌ لا تفكّ ذلك لا تُجيبه.
 */
export function upgradeOptions(
  rig: BuildParts,
  weak: RigCategory,
  all: Candidate[],
  customKeys: RigCategory[] = [],
  opts: { limit?: number; minTier?: number; allowWarn?: boolean } = {},
): { options: Candidate[]; blocked: boolean } {
  const currentTier = (rig[weak] as any)?.performanceTier ?? 0;
  const minTier = Math.max(currentTier + 1, opts.minTier ?? 0);

  const current = rig[weak] as PartLike;

  const stronger = all
    .filter((c) => c.live !== false)
    .filter((c) => (c.performanceTier ?? 0) >= minTier)
    /* ⚠️ والدرجةُ وحدها لا تكفي: قِيس فوجدنا 9600x درجتُه ٣ و9600 درجتُه
       ٤ — فيُقترح الأضعف ترقيةً للأقوى. والحارسان يقرآن رقم الطراز
       والمواصفات، لا الدرجة. انظر `lib/upgrade-guard.ts`. */
    .filter((c) => upgradeRejectReason(weak, c, current) === null)
    /* ⚠️ الأرخص أوّلاً: الغرضُ أن يعرف الحدَّ الأدنى الذي يحلّ مشكلته،
       لا أن نبيعه أغلى ما عندنا. */
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));

  if (!stronger.length) return { options: [], blocked: false };

  const fitting: Candidate[] = [];
  for (const c of stronger) {
    const v = fitsRig(rig, weak, c, customKeys);
    if (v.state === 'fits') fitting.push(c);
    else if (v.state === 'warn' && opts.allowWarn) fitting.push({ ...c, fitNote: v.issues[0]?.message });
  }
  return { options: fitting.slice(0, opts.limit ?? fitting.length), blocked: fitting.length === 0 };
}
