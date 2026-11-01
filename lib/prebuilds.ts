/* ============ التجميعة الجاهزة كما تُعرض اليوم ============
 * `Prebuild.components` = {categoryId: componentId}، و`price` رقمٌ كُتب يوم أُنشئت
 * (للترتيب وحده). المعروض لحظيّ: مجموع المتوفّر من قطعها، والنافد يُسمّى.
 * كان الحساب في app/prebuilds وحده؛ ولمّا عرضت الرئيسية التجميعات (شكل س١،
 * 2026-11-01) نُقل هنا كي لا تتباعد نسختان. */
import { isAvailable } from './stores';

type Cat = { id: string; name: string };
type Comp = { id: string; name: string; price: number; offers?: any };

export type PrebuildPart = {
  categoryId: string;
  categoryName: string;
  componentId: string;
  componentName: string;
  isAvailable: boolean;
  price: number;
};

export function prebuildLive(build: { components: unknown }, categories: Cat[], components: Comp[]) {
  const compObj: Record<string, string> =
    typeof build.components === 'string' ? JSON.parse(build.components) : (build.components as any) || {};

  /* «افتحها في الباني»: معاملات الفئات تستبدل مسودّة الباني بالتجميعة كاملة
     (components/PCBuilderClient · hasUrlParams) — فيعدّلها بلا حساب */
  const builderHref = '/builder?' + categories
    .filter((cat) => compObj[cat.id])
    .map((cat) => `${cat.name.toLowerCase()}=${encodeURIComponent(compObj[cat.id])}`)
    .join('&');

  const parts = categories.map((cat) => {
    const compId = compObj[cat.id];
    if (!compId) return null;
    const c = components.find((x) => x.id === compId);
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      componentId: compId,
      componentName: c?.name || 'غير متوفر',
      isAvailable: c ? isAvailable(c as any) : false,
      price: c?.price ?? 0,
    };
  }).filter(Boolean) as PrebuildPart[];

  /* السعر لحظيّ للمتوفّر وحده — كان build.price رقماً ثابتاً حُفظ يوم أُنشئت
     التجميعة، ويجمع قطعاً صارت غير متوفّرة (مراجعة أدسنس 2026-10-15) */
  const missingParts = parts.filter((p) => !p.isAvailable);
  const liveTotal = parts.reduce((s, p) => s + (p.isAvailable ? p.price : 0), 0);

  return { compObj, builderHref, parts, missingParts, liveTotal };
}
