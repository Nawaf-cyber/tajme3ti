/* ============ كتابة قطعةٍ جديدة في الكتالوج ============
 *
 * مفصولٌ عن مسار الـAPI لأنّ الكتابة تحدث من مكانين: لوحةُ «ابحث في المتاجر»
 * (بجلسة أدمن)، وسكربتاتُ الإضافة بالجملة (بلا جلسة). ونسختان من هذا المنطق
 * تعنيان أن يُضاف نصفُ ما يلزم من أحدهما: قطعةٌ بلا نقطة سعرٍ أولى فلا رسمٌ
 * بيانيّ لها، أو بلا فحص تكرارٍ فتدخل مرجعاً مكرّراً.
 *
 * ⚠️ وفحص النقص يجري هنا لا في المتصفّح وحده: زرٌّ معطَّلٌ ليس حارساً.
 *
 * ⚠️ والعروض قائمةٌ لا واحد: أكثر ما نضيفه موجودٌ في متجرين، وسعر القطعة
 * أرخصُهما. وإضافتها في نداءٍ واحد تمنع الحالة التي تُنشأ فيها القطعة ثم
 * يفشل العرض الثاني فتبقى بسعرٍ أعلى من الحقيقة.
 */

import { prisma } from './prisma';
import { missingOf } from './component-draft';

export type SaveOffer = { storeSlug: string; url: string; price: number };

export type SaveInput = {
  category: string | null;
  brand: string;
  name: string;
  specs: Record<string, string>;
  tdpWattage?: number;
  performanceTier?: number;
  imageUrl?: string | null;
  description?: string | null;
  /** الأوّل هو المصدر الأساسيّ، والسعر أرخصُ الكلّ */
  offers: SaveOffer[];
};

/* ⚠️ حقولٌ اختياريّة لا اتّحادٌ مميَّز: المستودع على `strict: false`، وفيه
   لا يُضيَّق `{ok:true}|{ok:false}` بـ`if (!r.ok)` — يبقى النوع الاتّحادَ
   كلَّه فيشتكي المترجم من `r.error`. فالشكل الواحد يعمل هنا. */
export type SaveResult = {
  ok: boolean;
  id?: string;
  name?: string;
  price?: number;
  offers?: number;
  error?: string;
  status?: number;
  existingId?: string;
};

export async function saveComponent(input: SaveInput): Promise<SaveResult> {
  const offers = (input.offers || []).filter((o) => o?.storeSlug && o?.url && Number(o.price) > 0);
  if (!offers.length) return { ok: false, error: 'بلا عرضٍ صالح', status: 400 };

  const price = Math.min(...offers.map((o) => Number(o.price)));

  const missing = missingOf({
    category: input.category ?? null,
    brand: input.brand ?? '',
    name: input.name ?? '',
    price,
    specs: input.specs ?? {},
    tdpWattage: Number(input.tdpWattage) || 0,
  });
  if (missing.length) return { ok: false, error: 'ناقص: ' + missing.join('، '), status: 400 };

  const cat = await prisma.category.findFirst({ where: { name: input.category! }, select: { id: true } });
  if (!cat) return { ok: false, error: 'فئةٌ غير معروفة', status: 400 };

  const stores = await prisma.store.findMany({
    where: { slug: { in: [...new Set(offers.map((o) => o.storeSlug))] } },
    select: { id: true, slug: true },
  });
  const storeId = new Map(stores.map((s) => [s.slug, s.id]));
  const unknown = offers.find((o) => !storeId.has(o.storeSlug));
  if (unknown) return { ok: false, error: `متجرٌ غير معروف: ${unknown.storeSlug}`, status: 400 };

  const dupName = await prisma.component.findFirst({
    where: { name: { equals: String(input.name).trim(), mode: 'insensitive' } },
    select: { id: true },
  });
  if (dupName) return { ok: false, error: 'الاسم موجودٌ عندنا', status: 409, existingId: dupName.id };

  /* ⚠️ والرابط يُفحص أيضاً: الاسم قد يُكتب بصيغةٍ أخرى فيمرّ، لكنّ رابط
     المنتج نفسه لا يكذب — وعرضان لرابطٍ واحد قطعتان مكرّرتان في الكتالوج. */
  const dupUrl = await prisma.componentOffer.findFirst({
    where: { url: { in: offers.map((o) => o.url) } },
    select: { componentId: true, component: { select: { name: true } } },
  });
  if (dupUrl) {
    return {
      ok: false,
      error: `الرابط مربوطٌ بقطعةٍ عندنا: ${dupUrl.component?.name ?? ''}`,
      status: 409,
      existingId: dupUrl.componentId,
    };
  }

  try {
    const comp = await prisma.$transaction(async (tx) => {
      const c = await tx.component.create({
        data: {
          categoryId: cat.id,
          brand: String(input.brand).trim(),
          name: String(input.name).trim(),
          price,
          tdpWattage: Number(input.tdpWattage) || 0,
          performanceTier: Math.min(5, Math.max(1, Number(input.performanceTier) || 3)),
          specs: input.specs,
          imageUrl: input.imageUrl || null,
          description: String(input.description || '').trim() || null,
          lastScrapedAt: new Date(),
        },
      });
      for (const o of offers) {
        await tx.componentOffer.create({
          data: {
            componentId: c.id,
            storeId: storeId.get(o.storeSlug)!,
            url: o.url,
            price: Number(o.price),
            inStock: true,
            lastCheckedAt: new Date(),
          },
        });
        /* نقطةُ سعرٍ أولى لكل متجر: بلا سجلٍّ لا رسمٌ بيانيّ ولا «أدنى سعر» */
        await tx.priceHistory.create({
          data: { componentId: c.id, store: o.storeSlug, price: Number(o.price) },
        });
      }
      return c;
    });
    return { ok: true, id: comp.id, name: comp.name, price, offers: offers.length };
  } catch (e: any) {
    console.error('[saveComponent]', e);
    return { ok: false, error: 'تعذّر الحفظ', status: 500 };
  }
}
