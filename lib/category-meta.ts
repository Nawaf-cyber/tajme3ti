/* ============ هويّة الفئة: اسمٌ عربيّ وأيقونة ============
 *
 * كانت موزّعةً على خريطتين متطابقتين تقريباً:
 *   `PCBuilderClient.CATEGORY_META`  ← أيقونة + رمز مختصر
 *   `BuildTuner.CAT_META`            ← أيقونة + تسمية عربية
 * وصفحة «تجميعاتي» لا تملك أيّاً منهما، فكانت تعرض `CPU` و`Motherboard`
 * للزائر بينما عرّبنا كل شيءٍ حوله.
 *
 * وخريطتان تحملان نفس الأيقونات تفترقان: تُضاف فئةٌ إلى إحداهما وتُنسى في
 * الأخرى — وهو ما حدث بالضبط، فقد كان `Cooler` في كلتيهما قبل وجود الفئة،
 * ثم أُطلقت الفئة ولم تصل «تجميعاتي».
 *
 * ⚠️ والاسم الإنجليزي يبقى **مفتاحاً** لا يُترجم: هو `Category.name` في
 * القاعدة، وعليه تدور كل الفحوص. المترجَم هو ما يراه الزائر وحده.
 */

export type CategoryMeta = {
  /** ما يراه الزائر */
  label: string;
  icon: string;
  /** رمزٌ لاتينيّ قصير للبطاقات الضيّقة */
  short: string;
};

export const CATEGORY_META: Record<string, CategoryMeta> = {
  CPU:         { label: 'المعالج',        icon: '🔲', short: 'CPU' },
  Motherboard: { label: 'اللوحة الأم',    icon: '🔳', short: 'MB' },
  GPU:         { label: 'كرت الشاشة',     icon: '🎮', short: 'GPU' },
  RAM:         { label: 'الذاكرة',        icon: '📊', short: 'RAM' },
  Storage:     { label: 'التخزين',        icon: '💾', short: 'SSD' },
  PSU:         { label: 'مزوّد الطاقة',   icon: '⚡', short: 'PSU' },
  Case:        { label: 'الكيس',          icon: '🗄️', short: 'CASE' },
  Cooler:      { label: 'المبرّد',        icon: '❄️', short: 'COOL' },
  /* ليست قطعة تجميعة — اقتراحٌ بجانبها (isBuildCategory أدناه) */
  Monitor:     { label: 'الشاشة',         icon: '🖥️', short: 'MON' },
};

/** فئةٌ غير مسجّلة تُعرض باسمها بدل أن تختفي — النقص يُرى ولا يُسكت عنه */
export const catMeta = (name: string): CategoryMeta =>
  CATEGORY_META[name] ?? { label: name, icon: '🔧', short: name.slice(0, 4).toUpperCase() };

/**
 * ترتيب العرض في التجميعة — المعالج واللوحة أولاً لأنهما يحدّدان الباقي،
 * والمبرّد بعد المعالج مباشرةً لأنه تابعٌ له لا قطعةٌ مستقلّة.
 *
 * ⚠️ ليست هي `requiredCategories`: تجميعةٌ بلا مبرّد صالحة (قد يأتي مع
 * المعالج)، فهذه ترتيبُ عرضٍ لا قائمةَ إلزام.
 */
export const BUILD_ORDER = [
  'CPU', 'Cooler', 'Motherboard', 'RAM', 'GPU', 'Storage', 'PSU', 'Case',
] as const;

/**
 * قطعة تجميعة؟ — الفئات الثماني وحدها.
 *
 * كان الباني يعرض «كلّ فئةٍ فيها قطعة» (lib/categories · HAS_PARTS)، فأوّل شاشةٍ تُضاف
 * كانت ستصير خانةً تاسعة يُجمع سعرها واستهلاكها في التجميعة (2026-11-06). والشاشة
 * اقتراحٌ بجانب التجميعة لا جزءٌ منها — فما يخصّ التجميعة (الباني، التجميعات الجاهزة،
 * «أضفها لتجميعتي»، «تناسب جهازك»، حكم المقارنة بالمستوى) يُقصر على هذه القائمة:
 * **قائمةُ سماح لا قائمة منع**، فأيّ فئةٍ قادمة تبقى خارجها حتى تُضاف عمداً.
 */
export const isBuildCategory = (name: string | null | undefined): boolean =>
  !!name && (BUILD_ORDER as readonly string[]).includes(name);
