// lib/availability.ts
// دالة مركزية لتحديد توفّر القطعة عبر كل المتاجر.
// القطعة تُعتبر متوفرة إذا كان متجر واحد على الأقل عنده سعر صالح ومخزون.
// تُستخدم في: تصفّح القطع، تفاصيل القطعة، بناء التجميعة، التجميعات المقترحة، تجميعاتي.

type ComponentLike = {
  amazonInStock?: boolean | null;
  amazonPrice?: number | null;
  cazasouqInStock?: boolean | null;
  cazasouqPrice?: number | null;
  microlessInStock?: boolean | null;
  microlessPrice?: number | null;
};

export function isComponentAvailable(comp: ComponentLike): boolean {
  return Boolean(
    (comp.amazonInStock && comp.amazonPrice) ||
    (comp.cazasouqInStock && comp.cazasouqPrice) ||
    (comp.microlessInStock && comp.microlessPrice)
  );
}