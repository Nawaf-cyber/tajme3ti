/* ============ البروكسي العادي أولاً، والمتقدّم احتياطاً — أمازون ومايكرولس ============
 *
 * ⚠️ السبب رصيدٌ مقيس (2026-10-19): مرورٌ واحد على الكتالوج = ١١٬٨١٩ وحدة سحب، ٩٧٪
 * منها لأمازون (٦٢٧ عرضاً) ومايكرولس (٥٢٤) لأنّ كلّ طلبٍ لهما بالبروكسي المتقدّم
 * (super=true = ١٠ وحدات). والجدولة تمرّ مرّةً يومياً تقريباً، أي ~٣٥٥ ألفاً في الشهر
 * وخطّة Scrape.do ٢٥٠ ألفاً. وجُرّبت ثماني صفحات بالبروكسي العادي (وحدة واحدة)
 * بالمحلّل نفسه: الثماني مقروءة، وسبعٌ بالسعر المسجّل حرفاً.
 *
 * فلكلّ صفحة: نجرّب العاديّ، ونقبله فقط إن خرج **نظيفاً** — بلا أيّ خطأ، ولم
 * يقل «المنتج غير موجود»، ولم يقرأ ارتفاعاً مشبوهاً. وإلّا أعدنا الصفحة نفسها فوراً
 * بالمتقدّم، كما كان كلّ طلبٍ قبل هذا. فأسوأ حالةٍ تكلّف ما كانت تكلّفه.
 *
 * والخطر الذي لا يُرى خطأً: صفحةٌ تُفتح عادياً بسعرٍ مختلف (نسخةُ بلدٍ آخر مثلاً).
 * فعيّنةٌ صغيرة (SAMPLE_RATE) تُطلب بالطريقتين ويُقارَن السعران، والمختلف يُسجَّل
 * ويُنبَّه عليه، ويُعتمد فيه سعرُ المتقدّم.
 *
 * والعدّادات هنا في الذاكرة (لنسخة الدالة)، ويفرغها lib/proxy-stats في القاعدة
 * آخرَ كلّ تشغيلة. والوضع (`auto` أو `premium`) يحمّله المسار من اللوحة قبل السحب.
 */

import type { StoreOutcome } from './scrape-prices';

export type ProxyMode = 'auto' | 'premium';
export type ProxyKind = 'normalOk' | 'fallback' | 'bothFail' | 'sampleSame' | 'sampleDiff';
export type ProxyCounts = Record<ProxyKind, number>;
export type ProxyDiff = {
  store: string;
  name: string;
  url: string;
  normal: { price: number | null; inStock: boolean };
  premium: { price: number | null; inStock: boolean };
  at: string;
};

/** نحو ٢٠ صفحة يومياً من ~١١٥٠ — كافيةٌ لرصد فرقٍ منهجيّ، وكلفتها <٢٪ من الاستهلاك */
export const SAMPLE_RATE = 0.02;

/* ============ الوضع لكلّ متجر ============
   ⚠️ قيس بعد أوّل يومٍ في الإنتاج (2026-10-20): الدورة صارت تغطّي ٤٠–٥٥ قطعة بدل ٨٠–١٠٠،
   فارتفعت المتأخّرة من ٥ إلى ٢٩١. والسبب مايكرولس: صفحتُه بالعاديّ ٦٫٩ث وسطياً وبالمتقدّم
   ١٫٦ث (خمس صفحات بالطريقتين)، والدفعة تنتظر أبطأ صفحاتها. وأمازون بالعاديّ ٤٫٠ث وبالمتقدّم
   ٤٫٠ث — لا فرق في السرعة وعُشر الرصيد. فالوضع لكلّ متجر، والافتراضيّ ما قِيس. */
export const PROXY_STORES = ['amazon', 'microless'] as const;

/* متوسّط وحدات السحب للقطعة بالأوضاع الافتراضيّة — تقديرٌ محسوب لا مقيس: مرور الكتالوج
   (2026-10-20) أمازون ٦٢٧ عرضاً بالعاديّ (~١٬٠٠٠ مع الاحتياط والعيّنة) + مايكرولس ٥٢٤ بالمتقدّم
   (٥٬٢٤٠) + الباقي (٣٠٩) ≈ ٦٬٥٥٠ ÷ ٧١٧ قطعة. وكان ١٦٫١ مقيساً من عدّاد Scrape.do قبل
   البروكسي العاديّ (2026-08-11). يقرؤه زرّ «المتأخّرة» وردّ الكرون. */
export const CREDITS_PER_PART = 9.1;
export const DEFAULT_PROXY_MODES: Record<string, ProxyMode> = { amazon: 'auto', microless: 'premium' };

let modes: Record<string, ProxyMode> = { ...DEFAULT_PROXY_MODES };
export const setProxyModes = (m: Record<string, ProxyMode>) => { modes = { ...DEFAULT_PROXY_MODES, ...m }; };
export const getProxyModes = () => modes;

const emptyCounts = (): ProxyCounts => ({ normalOk: 0, fallback: 0, bothFail: 0, sampleSame: 0, sampleDiff: 0 });
let tally: Record<string, ProxyCounts> = {};
let diffs: ProxyDiff[] = [];

const bump = (store: string, kind: ProxyKind) => {
  (tally[store] ??= emptyCounts())[kind]++;
};

/** لقطةُ العدّادات وتصفيرها — يأخذها lib/proxy-stats ليكتبها */
export function takeProxyTally(): { counts: Record<string, ProxyCounts>; diffs: ProxyDiff[] } {
  const snap = { counts: tally, diffs };
  tally = {};
  diffs = [];
  return snap;
}

/** خرجت القراءة نظيفة؟ لا خطأ، ولا «غير موجود»، ولا ارتفاعٌ معلَّق للمراجعة */
const clean = (o: StoreOutcome) => o.errors.length === 0 && !o.gone && o.heldPrice == null;

/* ⚠️ والعاديّ يُشترط فيه شيءٌ زائد: أن تكون الصفحة صفحةَ منتجٍ عُرفت فعلاً، أو قُرئ
   منها سعر. فصفحةُ كابتشا لعرضٍ نافد لا تُخرج خطأً اليوم (النافد بلا سعر ليس خطأً)،
   فكانت ستُقبل «نظيفة» ويُكتب على العرض أنّه فُحص. */
const cleanNormal = (o: StoreOutcome) => clean(o) && (o.price != null || o.pageRecognized === true);

/** نفس القراءة؟ التوفّر نفسه، والسعر بفرقٍ لا يتجاوز نصف بالمئة */
const sameReading = (a: StoreOutcome, b: StoreOutcome) => {
  if (a.inStock !== b.inStock) return false;
  if (a.price == null || b.price == null) return a.price == null && b.price == null;
  return Math.abs(a.price - b.price) / Math.max(a.price, b.price) <= 0.005;
};

export async function withProxyFallback(
  store: string,
  target: { name: string; url: string | null },
  run: (premium: boolean) => Promise<StoreOutcome>,
): Promise<StoreOutcome> {
  if (modes[store] !== 'auto' || !target.url) return run(true);

  const normal = await run(false);
  if (!cleanNormal(normal)) {
    const premium = await run(true);
    bump(store, clean(premium) ? 'fallback' : 'bothFail');
    return premium;
  }

  bump(store, 'normalOk');
  if (Math.random() >= SAMPLE_RATE) return normal;

  // ---- عيّنة المقارنة ----
  const premium = await run(true);
  if (!clean(premium)) return normal; // المتقدّم نفسه فشل: لا حكم، والعاديّ نظيف
  if (sameReading(normal, premium)) {
    bump(store, 'sampleSame');
    return normal;
  }
  bump(store, 'sampleDiff');
  diffs.push({
    store,
    name: target.name,
    url: target.url,
    normal: { price: normal.price, inStock: normal.inStock },
    premium: { price: premium.price, inStock: premium.inStock },
    at: new Date().toISOString(),
  });
  return premium; // المتقدّم هو المرجع المجرَّب منذ البداية
}
