/**
 * ============ المتاجر والعروض — طبقة قراءة واحدة ============
 *
 * ⚠️ لا تستورد prisma هنا: هذا الملف يُستورد من مكوّنات العميل ('use client')،
 * و prisma يسحب pg → dns فينهار البناء. الجلب في lib/stores-server.ts.
 *
 * لماذا وُجد هذا الملف: كانت المتاجر الثلاثة مكتوبة يدوياً في كل موضع —
 * أعمدة ثابتة في القاعدة، وشروط توفّر في lib/availability.ts، وحساب خصم في
 * lib/price.ts، وألوان في سبع صفحات. إضافة متجر رابع كانت تعني تعديل كل
 * هذه المواضع. الآن: صفّ في جدول Store + عرض في ComponentOffer، وكل
 * الاشتقاقات (الأرخص · التوفّر · الخصم · اللون · رابط العمولة) من هنا.
 */

import { discountPercent } from './price';

/** المتجر كما تحتاجه الواجهة — مطابق لحقول Store التي نختارها من prisma */
export type StoreInfo = {
  id: string;
  slug: string;
  name: string;       // العربي المعروض
  latinName: string;  // اللاتيني (بطاقات الشراء وصفحة القطعة)
  color: string;      // hex يختاره الأدمن
  domain: string | null;
  affiliateParam: string | null;
  affiliateId: string | null;
  usesDeepLinks: boolean;
  sortOrder: number;
};

/** عرض متجر واحد لقطعة واحدة، ومعه بيانات متجره */
export type Offer = {
  storeId: string;
  url: string | null;
  affiliateUrl: string | null;
  price: number | null;
  listPrice: number | null;
  inStock: boolean;
  store: StoreInfo;
};

/** أي كائن قطعة يحمل عروضه — نوع فضفاض ليقبل مخرجات prisma مباشرة */
export type WithOffers = { offers?: Offer[] | null };

/* ------------------------------ الاختيار ------------------------------ */

/** العروض القابلة للشراء فعلاً: سعر صالح + متوفّر + رابط، الأرخص أولاً.
 *  عند تساوي السعر يفصل ترتيب المتجر (sortOrder) لا ترتيب القاعدة العشوائي. */
export const liveOffers = (offers?: Offer[] | null): Offer[] =>
  (offers || [])
    .filter((o) => (o.price ?? 0) > 0 && o.inStock !== false && !!o.url)
    .sort((a, b) => a.price! - b.price! || a.store.sortOrder - b.store.sortOrder);

/** أرخص عرض متوفّر، أو null إن لم يتوفّر شيء */
export const cheapestOffer = (offers?: Offer[] | null): Offer | null =>
  liveOffers(offers)[0] ?? null;

/** القطعة متوفّرة إذا كان متجر واحد على الأقل عنده سعر صالح ومخزون */
export const isAvailable = (comp: WithOffers): boolean => liveOffers(comp.offers).length > 0;

/** أقل سعر معروض، أو 0 */
export const lowestPrice = (offers?: Offer[] | null): number => cheapestOffer(offers)?.price ?? 0;

/**
 * خصم القطعة — على **المتجر الأرخص المتوفّر فقط**.
 * إعلان خصم متجر أغلى بينما نعرض سعر متجر آخر يضلّل المشتري.
 */
export type Deal = { pct: number; listPrice: number | null };

export const offerDeal = (comp: WithOffers): Deal => {
  const best = cheapestOffer(comp.offers);
  if (!best) return { pct: 0, listPrice: null };
  const pct = discountPercent(best.price, best.listPrice);
  return { pct, listPrice: pct > 0 ? best.listPrice ?? null : null };
};

/** أسماء المتاجر التي تعطي أقل سعر (قد تتساوى) — لنص "أفضل سعر من: …" */
export const cheapestStoreNames = (comp: WithOffers): string[] => {
  const live = liveOffers(comp.offers);
  if (!live.length) return [];
  const min = live[0].price!;
  return live.filter((o) => o.price === min).map((o) => o.store.name);
};

/* ------------------------------- الألوان ------------------------------- */

/* لون المتجر يأتي من القاعدة وقت التشغيل، و Tailwind يُجمّع أصنافه وقت
   البناء — فلا يمكن توليد صنف مثل `text-[#FF9900]` من قيمة متغيّرة.
   الحل: نمرّر اللون كمتغيّرات CSS، والأصناف ثابتة تشير إليها:
     style={storeVars(store.color)} className="text-[color:var(--store-color)]" */
export const hexAlpha = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(n)) return `rgba(14,165,233,${alpha})`; // احتياطي: سماوي
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

export const storeVars = (color: string) =>
  ({
    '--store-color': color,
    '--store-tint': hexAlpha(color, 0.1),
    '--store-soft': hexAlpha(color, 0.25),
    '--store-glow': hexAlpha(color, 0.6),
  }) as React.CSSProperties;

/** لون افتراضي لمتجر لم يُضبط لونه */
export const DEFAULT_STORE_COLOR = '#0EA5E9';
