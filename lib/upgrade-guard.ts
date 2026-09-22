/* ============ حارسا الترقية — بلا اعتمادٍ على الدرجة ============
 *
 * ⚠️ وسببُ وجودهما أنّ `performanceTier` لا يحتمل توصيةَ شراء. قِيس على
 * الكتالوج يوم 2026-09-22:
 *
 *   ٣ | ٨١٧ | Ryzen 5 **9600x**   ← الأقوى، ودرجتُه أدنى
 *   ٤ | ٩٢١ | Ryzen 5 **9600**    ← الأضعف، ودرجتُه أعلى
 *
 *   ١ | ٤٨٨ | Core **i3-14100F**  ← الأحدث، ودرجتُه أدنى
 *   ٢ | ٤٧٦ | Core **i3-13100F**
 *
 * والدرجة ٣ وحدها تضمّ Ryzen 5 7500F بـ٥٤٩ وi5-13600KF بـ٢٬٣٢٢ — أربعةُ
 * أضعافٍ في سلّةٍ واحدة. فخمسُ درجاتٍ تكفي «أيُّهما أضعف» ولا تكفي
 * «أيُّهما أقوى بالضبط».
 *
 * فالحارسان يقرآن ما نثق به: **رقمَ الطراز** و**المواصفات**.
 */

import type { PartLike } from './build-check';

const specsOf = (p: PartLike): any => {
  const s = (p as any)?.specs;
  if (!s) return {};
  if (typeof s === 'string') { try { return JSON.parse(s); } catch { return {}; } }
  return s;
};

const num = (v: unknown): number | null => {
  const n = parseFloat(String(v ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * رقمُ الطراز مجرَّداً من لواحقه.
 *
 * ⚠️ واللواحق تُحذف عمداً: «9600X» و«9600» **نفس الشريحة**، و«265K»
 * و«265KF» كذلك. فمن يملك الأعلى لا يُقال له «رقِّ إلى الأدنى».
 *
 *   Ryzen 5 9600X   → 9600
 *   Core Ultra 7 265KF → 265
 *   Core i5-14600K  → 14600
 *   RTX 5070 Ti     → 5070
 */
export const baseModel = (name: unknown): string | null => {
  const s = String(name ?? '').toUpperCase();
  /* أطولُ عددٍ متّصل هو الطراز — والتسلسلات القصيرة (5 في «Ryzen 5») تُهمَل */
  const nums = s.match(/\d{3,5}/g);
  if (!nums?.length) return null;
  return nums.sort((a, b) => b.length - a.length)[0];
};

/** هل هما نسختان من شريحةٍ واحدة؟ */
export const sameChip = (a: PartLike, b: PartLike): boolean => {
  const ma = baseModel((a as any)?.name);
  const mb = baseModel((b as any)?.name);
  return !!ma && ma === mb;
};

/**
 * هل المرشَّح **ليس أسوأ** في أيّ مواصفةٍ مرتَّبة، وأفضل في واحدةٍ على الأقلّ؟
 *
 * ⚠️ ولا تُطبَّق إلّا حيث المواصفات مرتَّبة فعلاً: المعالج له نوىً وخيوطٌ
 * وتردّدٌ وذاكرةُ مخبأ — كلُّها «أكثر = أفضل». أمّا كرت الشاشة فمواصفاتُنا
 * عنه (سعة الذاكرة، الناقل، المعمارية) **ليست رتبيّة**: ٨ جيجابايت من
 * جيلٍ جديد تسبق ١٦ من جيلٍ قديم. فادّعاءُ الترتيب فيها اختراعٌ.
 *
 * @returns `null` إذا لم تكن الفئة قابلةً للحكم — فلا يُمنع ولا يُجاز
 */
export const specDominates = (
  category: string,
  candidate: PartLike,
  current: PartLike,
): boolean | null => {
  if (category !== 'CPU') return null;

  const c = specsOf(candidate);
  const o = specsOf(current);
  const AXES = ['cores', 'threads', 'boostClock', 'l3Cache'] as const;

  let better = 0;
  for (const k of AXES) {
    const a = num(c[k]);
    const b = num(o[k]);
    if (a == null || b == null) continue; // مجهولٌ لا يُدين ولا يُبرّئ
    if (a < b) return false;              // أسوأ في محورٍ واحد يكفي للرفض
    if (a > b) better++;
  }
  return better > 0;
};

/**
 * هل يصلح مرشَّحاً للترقية أصلاً — قبل فحص التركيب؟
 *
 * @returns سببُ الرفض، أو `null` إن صلح
 */
export function upgradeRejectReason(
  category: string,
  candidate: PartLike,
  current: PartLike,
): string | null {
  if (sameChip(candidate, current)) return 'نفس الشريحة بلاحقةٍ أخرى';
  if (specDominates(category, candidate, current) === false) return 'أضعف في مواصفةٍ أو أكثر';
  return null;
}
