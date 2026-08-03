/**
 * ============ طلبات القطع الناقصة — منطق مشترك ============
 *
 * مصدر واحد للتطبيع (الدمج) وتسميات الحالات، يستخدمه:
 *   - API الإرسال (يجد أو ينشئ RequestedPart بالاسم المطبّع)
 *   - لوحة الإدارة (العدّاد + تغيير الحالة)
 *   - صفحة المستخدم (عرض الحالة)
 * فلا يتباعد التطبيع بين الأطراف (وإلا انقسم "RTX 5070" و"rtx  5070" لطلبين).
 */

export type PartStatus = 'REVIEWING' | 'ADDING' | 'ADDED';

/** تطبيع اسم القطعة للدمج والعدّ:
 *  حروف صغيرة · مسافات مضغوطة · إزالة الرموز عدا الحروف والأرقام والشرطة.
 *  يُبقي العربية والإنجليزية والأرقام. */
export const normalizePartName = (raw: string): string =>
  (raw || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    // نُبقي: أحرف لاتينية/عربية + أرقام + مسافة + شرطة. نحذف ما عداها.
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

/** أطوال مقبولة — يمنع الفراغ والإغراق */
export const isValidPartName = (raw: string): boolean => {
  const n = normalizePartName(raw);
  return n.length >= 2 && n.length <= 80;
};

/** بيانات عرض كل حالة — لون + أيقونة + نص، بنمط الموقع (لا ألوان غريبة) */
export const STATUS_META: Record<PartStatus, {
  label: string;
  icon: string;
  /* أصناف Tailwind جاهزة للشارة */
  badge: string;
  dot: string;
}> = {
  REVIEWING: {
    label: 'قيد المراجعة',
    icon: '🟡',
    badge: 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-800/50',
    dot: 'bg-amber-500',
  },
  ADDING: {
    label: 'قيد الإضافة',
    icon: '🔵',
    badge: 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800/50',
    dot: 'bg-blue-500',
  },
  ADDED: {
    label: 'تمت الإضافة',
    icon: '✅',
    badge: 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-800/50',
    dot: 'bg-emerald-500',
  },
};

export const STATUS_ORDER: PartStatus[] = ['REVIEWING', 'ADDING', 'ADDED'];

/** رابط "ابنِ تجميعة بهذه القطعة" — يفتح المُجمّع مع القطعة مُختارة مسبقاً.
 *  PCBuilderClient يقرأ ?<اسم الفئة بحروف صغيرة>=<id> من الرابط. */
export const buildWithPartUrl = (categoryName: string, componentId: string): string =>
  `/builder?${encodeURIComponent(categoryName.toLowerCase())}=${encodeURIComponent(componentId)}`;
