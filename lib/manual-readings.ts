/* ============ قراءاتٌ يدويّة لمتجرٍ لا يُسحب آلياً ============
 *
 * متجرٌ `scrapeMode: 'off'` (نون خلف Akamai، وكازاسوق بعد تغيير موقعه 2026-10-25) تُقرأ صفحاته
 * بمتصفّحٍ حقيقيّ ثمّ تُكتب هنا — بمنطق الكرون نفسه لا بنسخةٍ منه:
 *   · العرض: السعر والتوفّر ووقت الفحص (حتى المطابق: القراءة تأكيد، وبدونه تبقى الشارة
 *     «قبل ٣١ يوماً» على سعرٍ قُرئ اليوم)، ويُمسح الخطأ.
 *   · تاريخ السعر كما يكتبه الكرون (lib/scrape-prices · recordPriceHistory).
 *   · السعر المعروض يُعاد اشتقاقه من العروض (lib/stores · cheapestOffer) لكلّ قطعةٍ لُمست.
 *
 * ⚠️ ولا يُكتب `previousPrice`/`priceDroppedAt`: عودةُ سعرٍ بعد عطلٍ ليست «انخفاضاً»، وكتابتُها
 *    كانت ستُظهر تخفيضاتٍ وهميّة في /deals.
 * ⚠️ وقفزةٌ فوق `maxJump` عن السعر المحفوظ لا تُكتب — تُعاد للمراجعة (حارس الانحراف نفسه
 *    الذي في الكرون: محدّدٌ يقرأ عنصراً آخر يُخرج رقماً معقول الشكل).
 *
 * نُقل منطقه من scripts/noon-refresh.ts — وذاك يبقى كما هو حتى يُنقل إليه.
 */
import { cheapestOffer } from './stores';
import { recordPriceHistory, round2 } from './scrape-prices';

export type StoreReading = {
  offerId: string;
  /** null = لم يظهر سعر (النافد يحتفظ بآخر سعرٍ عُرف، ولا يُعرض) */
  price: number | null;
  /** السعر قبل الخصم؛ null = قُرئت الصفحة ولا خصم */
  listPrice?: number | null;
  inStock: boolean;
};

export type ReadingsResult = {
  changed: { offerId: string; name: string; from: string; to: string }[];
  same: number;
  held: { offerId: string; name: string; old: number; read: number }[];
  missing: string[];
  repriced: { name: string; from: number; to: number; store: string }[];
};

export async function applyStoreReadings(
  db: any,
  storeSlug: string,
  readings: StoreReading[],
  { apply, maxJump = 0.4 }: { apply: boolean; maxJump?: number },
): Promise<ReadingsResult> {
  const res: ReadingsResult = { changed: [], same: 0, held: [], missing: [], repriced: [] };
  const touched = new Set<string>();

  for (const r of readings) {
    const offer = await db.componentOffer.findUnique({
      where: { id: r.offerId },
      select: { id: true, price: true, listPrice: true, inStock: true, componentId: true, store: { select: { slug: true } }, component: { select: { name: true } } },
    });
    if (!offer || offer.store.slug !== storeSlug) { res.missing.push(r.offerId); continue; }

    if (r.price != null && offer.price && Math.abs(r.price - offer.price) / offer.price > maxJump) {
      res.held.push({ offerId: offer.id, name: offer.component.name, old: offer.price, read: r.price });
      continue;
    }

    const nextPrice = r.price ?? offer.price;
    const nextList = r.listPrice !== undefined ? r.listPrice : offer.listPrice;
    const same = offer.inStock === r.inStock && offer.price === nextPrice && offer.listPrice === nextList;
    const fmt = (p: number | null, s: boolean) => `${p ?? '—'}${s ? '' : ' نافد'}`;
    if (same) res.same++;
    else res.changed.push({ offerId: offer.id, name: offer.component.name, from: fmt(offer.price, offer.inStock), to: fmt(nextPrice, r.inStock) });
    touched.add(offer.componentId);

    if (!apply) continue;
    await db.componentOffer.update({
      where: { id: offer.id },
      data: { price: nextPrice, listPrice: nextList, inStock: r.inStock, lastCheckedAt: new Date(), lastError: null },
    });
    if (r.price != null && r.price > 0) await recordPriceHistory(db, offer.componentId, [{ store: storeSlug as any, price: r.price }]);
  }

  if (apply) {
    for (const id of touched) {
      const c = await db.component.findUnique({ where: { id }, include: { offers: { include: { store: true } } } });
      if (!c) continue;
      const best = cheapestOffer(c.offers as any);
      const next = best ? round2(best.price!) : c.price;
      if (next !== c.price) {
        await db.component.update({ where: { id }, data: { price: next } });
        res.repriced.push({ name: c.name, from: c.price, to: next, store: best?.store.slug ?? '—' });
      }
    }
  }
  return res;
}
