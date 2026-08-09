/**
 * ============ شارات المواصفات السريعة ============
 *
 * «AM4 · 6 · 65W» — الثلاث الأهمّ التي تُعرّف القطعة بنظرة.
 *
 * كان هذا المنطق مكتوباً داخل ComponentsClient، فلمّا احتاجه شريط
 * التخفيضات كان الخيار نسخه — وهو الطريق نفسه الذي جعل خطأ محدّد كازاسوق
 * يعيش في ملفين ويحتاج إصلاحاً مزدوجاً. الآن مصدر واحد: أي تعديل على
 * ترتيب الأولويات أو التنسيق يسري على كل مكان يعرض الشارات.
 */

/* ترتيب الأولوية: ما يبحث عنه المشتري أولاً. السعة قبل السرعة، والمقبس
   قبل المعمارية — لأن المقبس يقرّر التوافق والمعمارية تفصيل تسويقي. */
const PRIORITY = [
  'capacity', 'Capacity', 'memory', 'wattage', 'socket', 'chipset',
  'speed', 'Speed', 'type', 'Type', 'cores', 'formFactor', 'architecture',
] as const;

export type BadgeSource = {
  specs?: unknown;
  tdpWattage?: number | null;
};

/**
 * @param max عدد الشارات المطلوب (٣ في صفحة القطع، وأقلّ في المساحات الضيّقة)
 */
export function specBadges(comp: BadgeSource, max = 3): string[] {
  const badges: string[] = [];

  try {
    const sp = (typeof comp.specs === 'string' ? JSON.parse(comp.specs) : comp.specs || {}) as Record<string, unknown>;
    for (const key of PRIORITY) {
      if (badges.length >= max) break;
      const raw = sp?.[key];
      if (raw === undefined || raw === null || raw === '') continue;
      /* نحذف الشرح بين قوسين ونقصّ الطويل: الشارة تلميح لا مواصفة كاملة،
         والقيمة الطويلة تكسر الصفّ في البطاقات الضيّقة. */
      const val = String(raw).replace(/\s*\(.*\)/, '').slice(0, 12).trim();
      if (val && !badges.includes(val)) badges.push(val);
    }
  } catch {
    /* specs غير صالح JSON — قطعة بلا شارات أهون من صفحة تنهار */
  }

  // الطاقة أخيراً: مفيدة دائماً لكنها لا تسبق ما يُعرّف القطعة
  if (comp.tdpWattage && badges.length < max) badges.push(`${comp.tdpWattage}W`);

  return badges;
}
