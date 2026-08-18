/* ============ قرارات المواصفات في الاستيراد ============
 *
 * منفصلةٌ عن `app/api/admin/import/route.ts` لسببٍ واحد: المسار خلف تسجيل
 * الدخول ويكتب في قاعدة الإنتاج، فلا يُختبر إلا بالكتابة فيها. وهذه
 * القرارات — أيّها يُرفض وأيّها يُدمج — هي كلُّ ما تغيّر، فوجب أن تُشغَّل
 * وتُرى قبل أن تُصدَّق. يستدعيها المسار ولا ينسخها.
 *
 * القاعدة: التوافق يمنع، والمقارنة تحذّر، والدخيل يُرفض.
 */

import { SPEC_SCHEMA, FEATURES_KEY, NOTES_KEY, unannouncedKeys } from './spec-schema';
import { specLabel } from './spec-labels';

export type Specs = Record<string, any>;

/** المواصفات كائناً — العمود jsonb وقد يعود نصاً */
export const asSpecs = (raw: unknown): Specs => {
  let sp: any = raw;
  if (typeof sp === 'string') {
    try { sp = JSON.parse(sp); } catch { return {}; }
  }
  return sp && typeof sp === 'object' ? sp : {};
};

/** مواصفات الصفّ المُرسَل — و`null` إن لم يذكر `specs` إطلاقاً */
export const incomingSpecs = (item: any): Specs | null =>
  item?.specs === undefined ? null : asSpecs(item.specs);

const missingKeys = (sp: Specs, keys: readonly string[]) =>
  keys.filter((k) => String(sp?.[k] ?? '').trim() === '');

/**
 * الجديد فوق القديم. والفراغ الصريح يحذف: الدمج لا يحذف بالإهمال — وإلّا
 * عاد فخّ المحو من الباب الآخر — فمن أراد إزالة مفتاحٍ كتبه فارغاً.
 * ومفتاح التوافق لا يُحذف فعلياً: البوّابة تردّه ناقصاً بعد الحذف.
 */
export const mergeSpecs = (base: Specs, incoming: Specs): Specs => {
  const out: Specs = { ...base };
  for (const [k, v] of Object.entries(incoming)) {
    if (typeof v === 'string' && v.trim() === '') delete out[k];
    else out[k] = v;
  }
  return out;
};

/** كل ما يعرفه المخطّط لفئة — بطبقاته الأربع، والمزايا الحرّة معها */
export const allowedKeys = (categoryName: string): Set<string> | null => {
  const schema = SPEC_SCHEMA[categoryName];
  if (!schema) return null;
  return new Set<string>([
    ...schema.compat, ...schema.compare, ...schema.conditional, ...schema.undecided,
    FEATURES_KEY, NOTES_KEY,
  ]);
};

export type SpecsVerdict = {
  /** رسالة الرفض — أو null إن قُبلت */
  reject: string | null;
  /** حقول المقارنة الناقصة في المحصّلة — تُذكر ولا تمنع */
  gaps: string[];
  /** ما سيُحفظ فعلاً — null يعني «لا تمسّ مواصفات القطعة» */
  effective: Specs | null;
};

/**
 * حكمُ صفٍّ واحد.
 * @param categoryName اسم الفئة (من الصفّ، وإلّا من القطعة القائمة)
 * @param existing     مواصفات القطعة القائمة — `null` للجديدة
 * @param incoming     ما أُرسل في الصفّ — `null` إن لم يُذكر `specs`
 */
export const judgeSpecs = (
  categoryName: string,
  existing: Specs | null,
  incoming: Specs | null,
): SpecsVerdict => {
  const schema = SPEC_SCHEMA[categoryName];
  const isNew = existing === null;

  /* تعديلٌ لا يمسّ المواصفات (سعرٌ أو صورة) يمرّ بلا فحص — وإلّا مُنع
     تحديثُ سعرٍ بسبب حقلٍ وصفيّ ناقص. */
  if (incoming === null) {
    return { reject: isNew ? 'قطعة جديدة بلا specs إطلاقاً' : null, gaps: [], effective: null };
  }

  const effective = mergeSpecs(existing ?? {}, incoming);
  if (!schema) return { reject: null, gaps: [], effective };

  /* الدخيل يُفحص على المُرسَل لا على المدموج: الغلطة في هذا الملف، والقديم
     بريءٌ منها — ولو فحصنا المدموج لاتُّهم بذنب غيره.
     وهذا الفحص ثمنُ الدمج: كان الاستبدال يمسك `sockett` بالصدفة لأنه
     يُسقط `socket`، والدمج يُبقي القديم سليماً فتمرّ الغلطة بلا أثر. */
  const known = allowedKeys(categoryName)!;
  const unknown = Object.keys(incoming).filter((k) => !known.has(k));
  if (unknown.length) {
    return { reject: `مفاتيح لا يعرفها مخطّط ${categoryName}: ${unknown.join(', ')}`, gaps: [], effective };
  }

  /* والتوافق يُفحص على المحصّلة لا على المُرسَل: صفٌّ يُصلح حقلاً واحداً لا
     يحمل بقيّة المفاتيح، وردُّه لأنها ليست فيه نقضٌ للدمج نفسه. */
  const missing = missingKeys(effective, schema.compat);
  if (missing.length) {
    return {
      reject: `ينقصها ${missing.length} من مفاتيح التوافق: ${missing.map(specLabel).join('، ')} (${missing.join(', ')})`,
      gaps: [],
      effective,
    };
  }

  /* حقول المقارنة الناقصة — بالدالّة المشتركة لا بحسابٍ محلّيّ: الصفحة
     التي ستعرض «غير معلن» يجب أن تعنيه هي وهذه الرسالةُ الشيءَ نفسه. */
  return { reject: null, gaps: unannouncedKeys(categoryName, effective), effective };
};
