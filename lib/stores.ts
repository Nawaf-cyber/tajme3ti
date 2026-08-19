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
  /** إعلان حالة (عطل/صيانة) — يُعرض عند عروض هذا المتجر */
  noticeMessage?: string | null;
  noticeUntil?: string | Date | null;
};

/** عرض متجر واحد لقطعة واحدة، ومعه بيانات متجره */
export type Offer = {
  /** معرّف صفّ العرض — يحتاجه بلاغ فرق السعر ليحدّد المتجر المقصود بعينه */
  id: string;
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
    /* نصٌّ مقروء في الوضعين — انظر readableOn أدناه */
    '--store-ink': readableOn(color, SURFACE_LIGHT),
    '--store-ink-dark': readableOn(color, SURFACE_DARK),
  }) as React.CSSProperties;

/** لون افتراضي لمتجر لم يُضبط لونه */
export const DEFAULT_STORE_COLOR = '#0EA5E9';

/* ============ لونٌ مقروء لكل متجر ============
 *
 * ⚠️ لون المتجر هويّةٌ لا لونُ نصّ. وقياس التباين يُثبت ذلك:
 *
 *              اللون      نصٌّ أبيض عليه
 *   Microless  #DC2626        4.83  ✓
 *   CazaSouq   #A855F7        3.96  ✗
 *   Amazon     #FF9900        2.14  ✗
 *   Noon       #EEFF00        1.11  ✗✗  ← يكاد يختفي
 *
 * والحدّ المطلوب للنصّ ٤٫٥ (WCAG AA). فالشارة المصمتة بلون المتجر ونصٌّ
 * أبيض عليها تُخفي ثلاثة من أربعة. وعكسُها — لونُ المتجر نصّاً على أبيض —
 * يُخفي الثلاثة نفسها، لأن المشكلة في اللون لا في موضعه.
 *
 * فالحلّ أن يُعتَّم اللون (أو يُفتَّح) حتى يبلغ الحدّ، ويبقى قريباً من
 * الهويّة: أصفر نون يصير زيتونياً داكناً على الأبيض، ويبقى أصفر على الداكن.
 * والحدود تحتفظ باللون الأصلي — الحدّ لا يُقرأ فلا يخضع للحدّ.
 */

const _rgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '').trim();
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const n = parseInt(f, 16);
  return Number.isNaN(n) ? [14, 165, 233] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const _lum = ([r, g, b]: [number, number, number]): number => {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

/** نسبة التباين بين لونين (١ إلى ٢١) */
export const contrastRatio = (a: string, b: string): number => {
  const la = _lum(_rgb(a)), lb = _lum(_rgb(b));
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
};

const _hex = ([r, g, b]: [number, number, number]) =>
  '#' + [r, g, b].map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('');

/**
 * أقربُ صورةٍ من لون المتجر تبلغ التباين المطلوب على خلفيةٍ معطاة.
 * تُمزج نحو الأسود على الخلفيات الفاتحة، ونحو الأبيض على الداكنة، خطوةً
 * خطوة — فيُؤخذ **أوّل** لونٍ يكفي لا أشدُّه، كي تبقى الهويّة أقرب ما يمكن.
 */
export const readableOn = (color: string, bg: string, target = 4.5): string => {
  if (contrastRatio(color, bg) >= target) return color;
  const toward: [number, number, number] = _lum(_rgb(bg)) > 0.5 ? [0, 0, 0] : [255, 255, 255];
  const base = _rgb(color);
  for (let i = 1; i <= 20; i++) {
    const t = i / 20;
    const mixed: [number, number, number] = [
      base[0] + (toward[0] - base[0]) * t,
      base[1] + (toward[1] - base[1]) * t,
      base[2] + (toward[2] - base[2]) * t,
    ];
    const hex = _hex(mixed);
    if (contrastRatio(hex, bg) >= target) return hex;
  }
  return _hex(toward);
};

/** الخلفيتان اللتان تُقرأ عليهما الشارات فعلاً */
export const SURFACE_LIGHT = '#ffffff';
export const SURFACE_DARK = '#0f172a';
