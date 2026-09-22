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

export type Candidate = PartLike & {
  id?: string;
  price?: number | null;
  performanceTier?: number | null;
  /** له عرضٌ قابلٌ للشراء اليوم */
  live?: boolean;
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
  const currentTier = (rig[weak] as any)?.performanceTier ?? 0;

  const stronger = all
    .filter((c) => c.live !== false)
    .filter((c) => (c.performanceTier ?? 0) > currentTier)
    /* ⚠️ الأرخص أوّلاً: الغرضُ أن يعرف الحدَّ الأدنى الذي يحلّ مشكلته،
       لا أن نبيعه أغلى ما عندنا. */
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));

  if (!stronger.length) return { pick: null, blocked: false };

  const pick = stronger.find((c) => fitsRig(rig, weak, c, customKeys).state === 'fits') ?? null;
  return { pick, blocked: pick === null };
}
