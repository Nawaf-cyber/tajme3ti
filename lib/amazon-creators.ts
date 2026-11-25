/**
 * ============ أسعار أمازون من Creators API (الطريق الرسميّ) ============
 *
 * ردّ دعم شركاء أمازون (2026-11-25): أسعار أمازون وتوفّرها لا تُؤخذ إلّا من واجهتهم البرمجيّة
 * (PA-API سابقاً، Creators API الآن) — لا من سحب الصفحات. والوصول مشروطٌ بـ١٠ مبيعاتٍ مؤهّلة
 * في آخر ٣٠ يوماً، ويسقط إن مرّ ٣٠ يوماً بلا مبيعات (ويعود خلال يومين من أوّل مبيعة).
 *
 * الوضع من AMAZON_SOURCE:
 *   scrape (الافتراضيّ إن لم يُضبط) — السحب القديم كما هو، وهذا الملف لا يعمل.
 *   api    — الواجهة وحدها. إن فشلت بقي السعر السابق (ويُخفى إن قدُم — lib/stores · isStaleOffer)،
 *            ولا سحب احتياطاً: السحب هو المخالفة نفسها.
 *   auto   — الواجهة أوّلاً؛ فإن رفضت لعدم الأهليّة (AssociateNotEligible) أو تعطّل الدخول رجع
 *            السحب حتى تعود. فيتحوّل الموقع وحده إلى الطريق الرسميّ متى صار الحساب مؤهّلاً.
 *
 * المفاتيح: AMAZON_CREATORS_ID وAMAZON_CREATORS_SECRET (إصدار v3.2 ← منطقة أوروبا، ومنها السعوديّة).
 * الحدود: ١ طلب/ثانية و٨٦٤٠/يوم في البداية، وطلب getItems الواحد يحمل حتى ١٠ ASIN ويُعدّ طلباً واحداً.
 * فالكرون يجلب أمازون دفعةً واحدة قبل أن يبدأ (prefetchAmazon) — ٣٥ قطعة ≈ ٤ طلبات.
 *
 * ⚠️ لا يعتمد هذا الملف على lib/scrape-prices — هو ينقل البيانات فقط، والحكم على السعر
 * (يُطبَّق/يُعلَّق/يُرفض) يبقى في applyPriceVerdict هناك (درس تكرار منطق السحب).
 */

const TOKEN_URL = 'https://api.amazon.co.uk/auth/o2/token';
const GET_ITEMS_URL = 'https://creatorsapi.amazon/catalog/v1/getItems';
const MARKETPLACE = 'www.amazon.sa';
const PARTNER_TAG = 'tajmee3ti-21';
const RESOURCES = [
  'offersV2.listings.price',
  'offersV2.listings.availability',
  'offersV2.listings.merchantInfo',
  'offersV2.listings.condition',
];

export type AmazonSource = 'scrape' | 'api' | 'auto';
export function amazonSource(): AmazonSource {
  const v = process.env.AMAZON_SOURCE?.trim().toLowerCase();
  if (v !== 'api' && v !== 'auto') return 'scrape';
  return process.env.AMAZON_CREATORS_ID?.trim() && process.env.AMAZON_CREATORS_SECRET?.trim() ? v : 'scrape';
}

/** ما نحتاجه من عرض أمازون، بلا تفسير */
export type AmazonApiItem =
  | { kind: 'offer'; price: number | null; listPrice: number | null; availability: string; merchant: string | null }
  | { kind: 'no-offer' } // لا عرض مميّز (buy box) — الوثائق: يُعامل نافداً
  | { kind: 'missing'; code: string }; // ItemNotAccessible ونحوه

export class AmazonApiUnavailable extends Error {
  constructor(readonly reason: string, readonly status: number) { super(reason); }
}

export const asinOf = (url: string | null | undefined): string | null =>
  url?.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})(?=[/?#]|$)/i)?.[1]?.toUpperCase() ?? null;

/* ---------------- الدخول (رمزٌ يعيش ساعة؛ نجدّده قبلها بخمس دقائق) ---------------- */
let token: { value: string; until: number } | null = null;
async function accessToken(): Promise<string> {
  if (token && Date.now() < token.until) return token.value;
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.AMAZON_CREATORS_ID!.trim(),
      client_secret: process.env.AMAZON_CREATORS_SECRET!.trim(),
      scope: 'creatorsapi::default',
    }),
    signal: AbortSignal.timeout(10000),
  });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok || !j.access_token) throw new AmazonApiUnavailable(`token ${j.error ?? res.status}`, res.status);
  token = { value: j.access_token, until: Date.now() + (Number(j.expires_in) || 3600) * 1000 - 300_000 };
  return token.value;
}

/* ---------------- بوّابة: طلبٌ كلّ ١٫١ ثانية (الحدّ ١/ث) ---------------- */
let gate: Promise<void> = Promise.resolve();
let lastCall = 0;
function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const run = gate.then(async () => {
    const wait = lastCall + 1100 - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCall = Date.now();
  });
  gate = run.catch(() => {});
  return run.then(fn);
}

/* ---------------- رفضٌ عامّ يُتذكّر ساعة (وضع auto يرجع فيها للسحب بلا طرق الباب كلّ قطعة) ---------------- */
let downUntil = 0;
let downReason = '';
export const amazonApiDown = (): string | null => (Date.now() < downUntil ? downReason : null);

const num = (v: unknown): number | null => (typeof v === 'number' && v > 0 ? Math.round(v * 100) / 100 : null);

function parseItem(it: any): AmazonApiItem {
  const listings: any[] = it?.offersV2?.listings ?? [];
  const l = listings.find((x) => x?.isBuyBoxWinner) ?? listings[0];
  if (!l) return { kind: 'no-offer' };
  return {
    kind: 'offer',
    price: num(l.price?.money?.amount),
    listPrice: num(l.price?.savingBasis?.money?.amount),
    availability: String(l.availability?.type ?? 'UNKNOWN'),
    merchant: l.merchantInfo?.name ?? null,
  };
}

async function getItems(asins: string[]): Promise<Map<string, AmazonApiItem>> {
  const tok = await accessToken();
  const res = await throttled(() =>
    fetch(GET_ITEMS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json', 'x-marketplace': MARKETPLACE },
      body: JSON.stringify({
        itemIds: asins, itemIdType: 'ASIN', marketplace: MARKETPLACE, partnerTag: PARTNER_TAG,
        condition: 'New', resources: RESOURCES,
      }),
      signal: AbortSignal.timeout(12000),
    }),
  );
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) token = null;
    throw new AmazonApiUnavailable(j.reason ?? j.type ?? `HTTP ${res.status}`, res.status);
  }
  const out = new Map<string, AmazonApiItem>();
  for (const it of j.itemsResult?.items ?? j.itemResults?.items ?? []) {
    if (it?.asin) out.set(String(it.asin).toUpperCase(), parseItem(it));
  }
  for (const e of j.errors ?? []) {
    const a = String(e?.message ?? '').match(/\b([A-Z0-9]{10})\b/)?.[1];
    if (a && !out.has(a)) out.set(a, { kind: 'missing', code: String(e.code ?? 'Error') });
  }
  return out;
}

/* ---------------- ذاكرة الدورة: ١٠ دقائق ---------------- */
const cache = new Map<string, { at: number; item: AmazonApiItem }>();
const TTL = 10 * 60_000;

/**
 * يجلب عروض أمازون لعدّة روابط دفعةً واحدة (١٠ لكلّ طلب) ويحفظها لقارئ القطعة.
 * لا يرمي: الفشل يُسجَّل في amazonApiDown ويقرّر القارئ (السحب في auto، الإبقاء في api).
 */
export async function prefetchAmazon(urls: (string | null | undefined)[]): Promise<{ fetched: number; error: string | null }> {
  if (amazonSource() === 'scrape' || amazonApiDown()) return { fetched: 0, error: amazonApiDown() };
  const asins = [...new Set(urls.map(asinOf).filter((a): a is string => !!a))]
    .filter((a) => !(cache.get(a) && Date.now() - cache.get(a)!.at < TTL));
  let fetched = 0;
  try {
    for (let i = 0; i < asins.length; i += 10) {
      const got = await getItems(asins.slice(i, i + 10));
      for (const [a, item] of got) cache.set(a, { at: Date.now(), item });
      fetched += got.size;
    }
    return { fetched, error: null };
  } catch (e) {
    return { fetched, error: noteFailure(e) };
  }
}

function noteFailure(e: unknown): string {
  const reason = e instanceof AmazonApiUnavailable ? e.reason : 'اتصال';
  /* عدم الأهليّة والدخول المرفوض حالةٌ تدوم — نتذكّرها ساعة. والاختناق/الاتصال عابر: دقيقة. */
  const lasting = e instanceof AmazonApiUnavailable && (e.status === 401 || e.status === 403 || e.status === 400);
  downUntil = Date.now() + (lasting ? 3_600_000 : 60_000);
  downReason = reason;
  return reason;
}

/**
 * عرض أمازون لرابطٍ واحد: من ذاكرة الدفعة، وإلّا طلبٌ لوحده.
 * null = الواجهة غير متاحة الآن (السبب في amazonApiDown).
 */
export async function amazonItem(url: string): Promise<AmazonApiItem | null> {
  const a = asinOf(url);
  if (!a) return { kind: 'missing', code: 'NoAsinInUrl' };
  const hit = cache.get(a);
  if (hit && Date.now() - hit.at < TTL) return hit.item;
  if (amazonApiDown()) return null;
  try {
    const got = await getItems([a]);
    const item = got.get(a) ?? { kind: 'missing', code: 'NotReturned' };
    cache.set(a, { at: Date.now(), item });
    return item;
  } catch (e) {
    noteFailure(e);
    return null;
  }
}

/** توفّر الواجهة ← متوفّر؟ (null = لا نعرف، تبقى الحالة السابقة) */
export function amazonInStock(availability: string): boolean | null {
  switch (availability) {
    case 'IN_STOCK':
    case 'IN_STOCK_SCARCE':
    case 'LEADTIME':
      return true;
    case 'OUT_OF_STOCK':
    case 'UNAVAILABLE':
    case 'PREORDER':
    case 'AVAILABLE_DATE':
      return false;
    default:
      return null;
  }
}
