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

/* ---- منع الشارات المتداخلة ----
 * القطعة الواحدة تحمل مفاتيح يصف بعضها بعضاً: قرص NVMe نوعه "NVMe M.2"
 * وشكله "M.2 2280"، فتظهر شارتان تقولان الشيء نفسه وتُهدران مكان شارة
 * ثالثة مفيدة. القاعدة: ترفَض الشارة إن شاركت المقبولةَ كلمةً كاملة.
 *
 * التقسيم بالمسافات لا بالرموز عمداً: "M.2" كلمة واحدة لا "M" و"2"،
 * وبلا ذلك يتصادم كل رقم مع كل رقم فتُرفَض شارات سليمة.
 */
const words = (s: string) => s.toLowerCase().split(/\s+/).filter(Boolean);

const overlaps = (candidate: string, accepted: string[]): boolean => {
  const a = new Set(words(candidate));
  return accepted.some((prev) => words(prev).some((w) => a.has(w)));
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
      if (!val) continue;
      /* التخطّي لا الخروج: رفض المتداخلة يُفسح المجال لمفتاح تالٍ في
         قائمة الأولوية، فنكسب شارة ثالثة مفيدة بدل تكرار الثانية. */
      if (overlaps(val, badges)) continue;
      badges.push(val);
    }
  } catch {
    /* specs غير صالح JSON — قطعة بلا شارات أهون من صفحة تنهار */
  }

  // الطاقة أخيراً: مفيدة دائماً لكنها لا تسبق ما يُعرّف القطعة
  if (comp.tdpWattage && badges.length < max) badges.push(`${comp.tdpWattage}W`);

  return badges;
}
