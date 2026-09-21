/* ============ توازنُ المعالج والكرت ============
 *
 * ⚠️ ادّعاءٌ **نسبيٌّ بين قطعتين**، لا رقمُ أداءٍ مطلق. والفرق جوهريّ:
 * درجاتُنا خمسٌ مكتوبةٌ بأيدينا، وقد سقطت حين استُعملت مقياساً مطلقاً
 * (٢٤١ من ٣٠٦ قطعةً وجدت «بديلاً أرخص بنفس الدرجة» — لأنّ الدرجة تتجاهل
 * المقبس والسعة، فأخرجت i3-14100F ← Ryzen 5 5500). أمّا «أيُّهما أضعف»
 * فاتّجاهٌ لا مقدار، وخمسُ درجاتٍ تكفيه.
 *
 * ⚠️ ومكانُه هنا لا في `my-builds/page.tsx`: البطاقة العليا والشبكة
 * تعرضانه معاً، ونسختان تتباعدان — وهو درسٌ تكرّر في هذا المشروع أربع
 * مرّات (منطق السحب · IS_SYSTEM · قوائم الصور · عمر السعر).
 */

export type Balance = {
  title: string;
  desc: string;
  /** اتّجاه الخلل — تستعمله الواجهة للّون وللترتيب */
  kind: 'cpu-weak' | 'gpu-weak' | 'balanced';
  color: string;
  bg: string;
};

type Tiered = { performanceTier?: number | null } | null | undefined;

export function bottleneck(cpu: Tiered, gpu: Tiered): Balance | null {
  const c = cpu?.performanceTier;
  const g = gpu?.performanceTier;
  if (!c || !g) return null;

  const diff = c - g;

  /* ⚠️ والعتبة درجتان لا واحدة: الدرجات خمسٌ خشنة، وفارقُ درجةٍ واحدة
     داخل ضجيجها — فاعتبارُه اختناقاً يُنذر نصفَ التجميعات بلا سبب. */
  if (diff < -1) {
    return {
      kind: 'cpu-weak',
      title: '⚠️ تنبيه: المعالج أضعف من الكرت',
      desc: "سيشكل المعالج 'عنق زجاجة' ولن يتمكن من مجاراة الكرت، خاصة على دقة 1080p. يُنصح بترقية المعالج أو اللعب على دقة 4K لتقليل الضغط عليه.",
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/40',
    };
  }

  if (diff > 1) {
    return {
      kind: 'gpu-weak',
      title: '💡 تنبيه: الكرت أضعف من المعالج',
      desc: 'أداء ممتاز في ألعاب (Esports) لاعتمادها على المعالج، لكن الكرت سيحد من قوة الجهاز في ألعاب القصة (AAA) والدقات العالية.',
      color: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/40',
    };
  }

  return {
    kind: 'balanced',
    title: '🚀 توازن أداء مثالي',
    desc: 'المعالج والكرت من نفس الفئة تقريباً. ستحصل على أداء مستقر وتستغل كامل قوة الجهاز بدون عنق زجاجة ملحوظ.',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40',
  };
}

/**
 * أضعفُ حلقةٍ في الجهاز — الفئة التي ترفعها أوّلاً.
 *
 * ⚠️ ولا يُقارن إلّا المعالجُ والكرت: هما وحدهما اللذان تُقاس عليهما
 * «قوّة الجهاز» في الألعاب، وبقيّةُ القطع تُمكّن أو تمنع ولا تتدرّج.
 * وقولُ «رامك أضعف حلقة» بلا بيانٍ يسنده ادّعاءٌ لا نملكه.
 */
export const weakestLink = (cpu: Tiered, gpu: Tiered): 'CPU' | 'GPU' | null => {
  const b = bottleneck(cpu, gpu);
  if (!b) return null;
  return b.kind === 'cpu-weak' ? 'CPU' : b.kind === 'gpu-weak' ? 'GPU' : null;
};
