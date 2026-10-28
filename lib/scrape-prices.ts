/**
 * ============ سحب الأسعار — مصدر واحد للحقيقة ============
 *
 * ⚠️ لماذا هذا الملف موجود:
 * كان منطق السحب مكرّراً حرفياً في مسارين (الكرون الشامل و«تحديث قطعة
 * واحدة»). فلمّا اكتُشف أن محدّد سعر كازاسوق يقرأ **منتجاً مجاوراً** من
 * الكاروسيل بدل المنتج المعروض، كان لا بد من إصلاحه مرّتين — وأي إصلاح
 * قادم سيحمل الخطر نفسه. الآن المسارَان يستدعيان هذه الوحدة، فأي تصحيح
 * يسري على الاثنين.
 *
 * لا تستورد prisma هنا: الوحدة تسحب وتحسب فقط، والكتابة مسؤولية المسار.
 */

import * as cheerio from 'cheerio';
import { isBhdText, bhdToSar } from './currency';
import { classifyPriceChange } from './price';
import { withProxyFallback } from './proxy-fallback';

/* ---- تدوير لمنزلتين ----
   يمنع نواتج الفاصلة العائمة مثل 409.09*10 = 4090.8999999999996
   التي كانت تُخزَّن وتُعرض كما هي في صفحة المنتج. */
export const round2 = (n: number) => Math.round(n * 100) / 100;

/** استخراج أول رقم من نص سعر ("BHD 370.80" → 370.8) */
export const parseMoney = (text: string): number => {
  const m = String(text || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
};

/* ---- قبول سعر ما قبل الخصم ----
   لا نعلن خصماً إلا إن كان السعر المشطوب أعلى فعلاً وبفارق معقول.
   بلا هذا الحدّ، أي رقم شاذ في الصفحة يصير "خصماً" وهمياً يضلّل المستخدم. */
export const acceptListPrice = (list: number, current: number): number | null => {
  if (!(list > 0) || !(current > 0)) return null;
  if (list <= current * 1.005) return null;   // فارق أقل من ٠٫٥٪ ليس خصماً
  /* السقف ٢× (أي خصم ٥٠٪ كحد أقصى). كان ٣× فمرّ خصم وهمي ٦٠٪ من
     مايكرولس (7554.03 لكرت سعره 3042). خصومات قطع الحاسب الحقيقية
     تتراوح ٥–٤٠٪؛ ما فوق ٥٠٪ على عتاد حديث هو خطأ قراءة لا عرض. */
  if (list > current * 2) return null;
  return round2(list);
};

/* ---- حارس الانحراف ----
   شبكة أمان لو تغيّرت بنية الصفحة وصار المحدّد يقرأ عنصراً آخر:
   قفزة تتجاوز ٦٠٪ عن آخر سعر معروف تُرفض ويُسجّل الخطأ بدل تخزين رقم فاسد.
   (لا يمنع الخصومات العادية — خصم ٦٪ يمرّ بسهولة.) */
export const isPlausible = (next: number, previous: number | null | undefined): boolean => {
  if (!previous || previous <= 0) return true;   // لا مرجع للمقارنة
  const ratio = next / previous;
  return ratio >= 0.4 && ratio <= 1.6;
};

/* ---- شاهد مستقل من بيانات schema.org ----
   الحارس أعلاه يفترض أن القفزة الكبيرة = خطأ قراءة. لكنها أحياناً ارتفاع
   حقيقي (رصدنا ٢٠٢٦-٠٨-٠٨: قرص ارتفع من ٦٠٠ إلى ٩٨٠ عند كازاسوق، فرفضه
   الحارس وبقي الموقع يعرض السعر القديم — أسوأ من الخطأ الذي يحمينا منه).
   الحلّ: إن أكّد مصدر ثانٍ في الصفحة (JSON-LD) الرقمَ نفسه، فالقراءة سليمة
   والقفزة واقع سوق. لا نتجاوز الحارس إلا بهذا التطابق. */
/** والحقول الخام لمن يريد ألّا يُخمَّن له (قارئ كازاسوق): `currency` ‏priceCurrency كما كُتبت،
 *  و`availability` آخر مقطعٍ من الرابط («InStock»)، و`offerType` («Offer» أو «AggregateOffer»)،
 *  و`offerUrl` رابط العرض. null = لم يُذكر. وقراءة `price`/`inStock` كما كانت لا تتغيّر. */
export type LdOffer = {
  price: number | null; inStock: boolean | null;
  currency?: string | null; availability?: string | null; offerType?: string | null; offerUrl?: string | null;
};

export const jsonLdOffer = ($: cheerio.CheerioAPI): LdOffer => {
  const found: LdOffer = { price: null, inStock: null, currency: null, availability: null, offerType: null, offerUrl: null };
  $('script[type="application/ld+json"]').each((_, el) => {
    if (found.price != null || found.inStock != null) return;
    try {
      const parsed = JSON.parse($(el).text());
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        if (node?.['@type'] !== 'Product' || !node.offers) continue;
        const offer = Array.isArray(node.offers) ? node.offers[0] : node.offers;
        found.offerType = offer?.['@type'] ? String(offer['@type']) : null;
        found.availability = offer?.availability ? String(offer.availability).split('/').pop() || null : null;
        found.offerUrl = offer?.url ? String(offer.url) : null;
        const p = parseFloat(String(offer?.price ?? '').replace(/,/g, ''));
        if (p > 0) { found.price = p; found.currency = offer?.priceCurrency ? String(offer.priceCurrency) : null; }
        const av = String(offer?.availability ?? '').toLowerCase();
        if (av.includes('outofstock') || av.includes('soldout') || av.includes('discontinued')) found.inStock = false;
        else if (av.includes('instock') || av.includes('limitedavailability') || av.includes('preorder')) found.inStock = true;
        if (found.price != null || found.inStock != null) return;
      }
    } catch { /* JSON-LD مكسور ليس خطأً نُبلغ عنه — نتجاهله فحسب */ }
  });
  return found;
};

export const jsonLdPrice = ($: cheerio.CheerioAPI): number | null => jsonLdOffer($).price;

/** هل يطابق الشاهدُ السعرَ المقروء (بفارق ١٪ يستوعب التقريب)؟ */
export const confirmsPrice = (witness: number | null, price: number): boolean =>
  witness != null && witness > 0 && Math.abs(witness - price) / price <= 0.01;

/* ============ حدّ التزامن — بوّابة واحدة لكل طلبات Scrape.do ============
 *
 * خطة Scrape.do تسمح بعدد محدّد من الطلبات المتزامنة، وتجاوزه يردّ 429.
 * الخطأ الذي وقعنا فيه: التزامن كان محسوباً بعدد **القطع** (١٠ قطع دفعة)،
 * بينما كل قطعة تسحب متاجرها بالتوازي. فمع ٣ متاجر = ٣٠ طلباً، ومع إضافة
 * متجر رابع صارت ٤٠ — فامتلأ الحدّ وفشلت أغلب الطلبات بـ429.
 *
 * الآن العدّ على الطلبات نفسها: مهما بلغ عدد القطع أو المتاجر، لا يتجاوز
 * المفتوح فعلياً SCRAPE_CONCURRENCY. إضافة متجر خامس تُبطئ الدفعة قليلاً
 * ولا تُسقطها.
 */
const MAX_CONCURRENT = Math.max(1, Number(process.env.SCRAPE_CONCURRENCY || 8));
let activeRequests = 0;
const waiting: (() => void)[] = [];

const acquireSlot = async (): Promise<void> => {
  if (activeRequests < MAX_CONCURRENT) {
    activeRequests++;
    return;
  }
  await new Promise<void>((resolve) => waiting.push(resolve));
};

const releaseSlot = () => {
  const next = waiting.shift();
  // نُسلّم المكان للمنتظر مباشرة بدل إنقاص العدّاد ثم زيادته
  if (next) next();
  else activeRequests--;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * كل طلب إلى Scrape.do يمرّ من هنا: يحترم حدّ التزامن، ويعيد المحاولة مرّة
 * واحدة عند 429 بعد مهلة قصيرة (الحدّ لحظي، فالانتظار وحده يكفي غالباً).
 */
/* ============ الرصيد الفعليّ لكلّ متجر — من Scrape.do نفسه ============
 *
 * كلّ ردٍّ من Scrape.do يحمل كلفته (`Scrape.do-Request-Cost`، توثيقهم) — وقد تزيد على كلفة الطلب
 * الأساسيّة لأنهم يفرضون super أو render افتراضيّاً على بعض النطاقات. والتقدير السابق كان يضرب
 * عدد الفحوص في ثابت، ولا عدّاد لمتجرٍ خارج lib/proxy-fallback (كازاسوق) — فلو فُرض على نطاقٍ
 * عشرُ وحداتٍ لما عُرف إلّا من الفاتورة. هنا يُعدّ لكلّ نطاقٍ مستهدف، ويكتبه lib/proxy-stats كلّ ساعة. */
let creditTally: Record<string, { requests: number; credits: number }> = {};
const noteCost = (url: string, res: Response) => {
  if (!url.startsWith('https://api.scrape.do/')) return;
  let host = '?';
  try { host = new URL(new URL(url).searchParams.get('url') || '').hostname.replace(/^www\./, ''); } catch { /* يبقى «?» */ }
  const cost = Number(res.headers.get('scrape.do-request-cost'));
  const t = (creditTally[host] ??= { requests: 0, credits: 0 });
  t.requests++;
  if (Number.isFinite(cost)) t.credits += cost;
};
export const takeCreditTally = () => { const s = creditTally; creditTally = {}; return s; };

export async function scrapeFetch(url: string, timeout = 20000): Promise<Response> {
  await acquireSlot();
  try {
    let res = await fetchWithTimeout(url, { cache: 'no-store' }, budgetedTimeout(timeout));
    noteCost(url, res);
    // لا نُعيد المحاولة إن لم يبقَ وقتٌ يكفيها — الردّ الذي يصل بعد موت الدالة لا ينفع أحداً
    if (res.status === 429 && remainingBudget() > 6000) {
      await sleep(2000 + Math.floor(Math.random() * 1000)); // تشتيت لتفادي الارتطام
      res = await fetchWithTimeout(url, { cache: 'no-store' }, budgetedTimeout(timeout));
      noteCost(url, res);
    }
    return res;
  } finally {
    releaseSlot();
  }
}

/* ============ المهلة الصارمة للدورة ============
 *
 * درس ٢٠٢٦-٠٨-١١: دالة فيرسل سقفها ٦٠ ثانية، وكانت الدورة تفحص ميزانيتها
 * الزمنية **بين كل عشر قطع فقط**. فإن مرّت العشرة الأخيرة والساعة عند ٤٥ث
 * ثم احتاجت ٢٠ث، تجاوزت الدالة السقف فقتلها فيرسل وردّ 504 — وهو ما أسقط
 * الدفعة الثانية في أول تشغيلة جدولة عملت فعلاً.
 *
 * فحصُ الميزانية بين الدفعات لا يكفي: الطلب الواحد نفسه قد يستغرق ٢٠ث،
 * ومع إعادة محاولة 429 يبلغ ٤٣ث. الحلّ أن يعرف **كل طلب** متى ينتهي وقت
 * الدورة، فيقصّر مهلته بنفسه بدل أن يتجاوزها.
 */
let deadlineAt = 0;

/** يضبطه المسار في بداية الدورة؛ 0 = بلا مهلة (تحديث قطعة واحدة) */
export const setScrapeDeadline = (msFromNow: number) => {
  deadlineAt = msFromNow > 0 ? Date.now() + msFromNow : 0;
};

export const remainingBudget = (): number =>
  deadlineAt === 0 ? Number.POSITIVE_INFINITY : Math.max(0, deadlineAt - Date.now());

/** مهلة الطلب مقصوصة على ما تبقّى من الدورة (بحدّ أدنى ٣ث كي لا نُجهض بلا داعٍ) */
const budgetedTimeout = (wanted: number): number => {
  const left = remainingBudget();
  if (!Number.isFinite(left)) return wanted;
  return Math.max(3000, Math.min(wanted, left));
};

/* ============ حارس الصفحة المعطّلة ============
 *
 * درس مكلّف (٢٠٢٦-٠٨-٠٦): تعطّل خادم كازاسوق وأعاد صفحة خطأ PHP بدل صفحة
 * المنتج. فحص التوفّر لم يجد صفّ المخزون ولا زرّ السلة، فاستنتج "نافد"
 * وعلّم **٥٦ من ٧٤ منتجاً** غير متوفّر دفعةً واحدة — فاختفت أسعار المتجر
 * من الموقع، وانتقل "الأرخص" لمتجر أغلى بلا أن يلاحظ أحد.
 *
 * القاعدة: صفحة لا نتعرّف عليها كصفحة منتج ≠ منتج نافد. الأولى تعني
 * "لم نستطع القراءة" فنُبقي الحالة السابقة، والثانية وحدها تُغيّرها.
 */
const BROKEN_PAGE = /fatal error|uncaught (error|exception)|call to a member function|whoops, looks like|maintenance mode|under maintenance|service (temporarily )?unavailable|database connection|502 bad gateway|504 gateway/i;

/** هل الصفحة معطّلة/صيانة بدل أن تكون صفحة منتج؟ */
export const isBrokenPage = (html: string): boolean => {
  if (!html || html.length < 500) return true;      // ردّ فارغ أو مبتور
  return BROKEN_PAGE.test(html.slice(0, 6000));      // رسائل الخطأ تظهر في الأعلى
};

/** رسالة خطأ مفهومة بدل رقم الحالة الخام */
export const httpReason = (status: number): string =>
  status === 429 ? 'تجاوز حدّ الطلبات المتزامنة (429) — قلّل SCRAPE_CONCURRENCY أو حجم الدفعة'
  : status === 403 || status === 401 ? `حظر من المتجر (${status}) — جرّب البروكسي المتقدّم`
  : `فشل الاتصال ${status}`;

/* ============ «أُزيل من المتجر» ≠ «تعذّرت القراءة» ============
 *
 * حارسُ الصفحة المعطّلة أعلاه يُبقي الحالة السابقة عند كلّ فشل — وهو
 * صحيحٌ للعطل العابر، وخاطئٌ للمنتج الذي أزاله المتجر: كان يُفحص يومياً
 * ويبقى «متوفّراً» بسعره القديم **إلى الأبد**. قِيس 2026-09-24:
 *   · Ryzen 5 5500 — سعرُه المعروض ٤٢٥ من أمازون، وصفحة أمازون ترجع 404
 *     «الصفحة غير موجودة». فمن يضغط يصل إلى لا شيء.
 *   · ثلاثة كروت في إنفيني آرك — الرابط يُحوَّل إلى الرئيسيّة (أزالها
 *     المتجر)، فسُجّل «لم نجد سعراً» وبقي العرض متوفّراً ٥–٩ أيّام.
 *
 * فالإشارتان القاطعتان هنا: 404/410، أو صفحةٌ رابطُها الأصليّ (canonical)
 * هو الرئيسيّة. وتُعلَّم `gone` لا `inStock: false` مباشرةً:
 * `resolveOfferPrices` يُسقط العرض عند **الإشارة الثانية المتتالية** —
 * فـ404 عابرٌ من الوسيط لا يُخفي سعراً، وهو درسُ كازاسوق نفسه.
 */
export const GONE_MARK = 'أُزيل من المتجر';

/** ردٌّ غير ناجح: يكتب سببه، ويعلّم `gone` إن قال المتجر إنّ الصفحة غير موجودة */
export function httpFailure(out: { errors: string[]; gone?: boolean }, label: string, status: number) {
  if (status === 404 || status === 410) {
    out.gone = true;
    out.errors.push(`${label}: ${GONE_MARK} — الصفحة غير موجودة (${status})`);
  } else {
    out.errors.push(`${label}: ${httpReason(status)}`);
  }
}

/** هل وصلت الصفحةُ الرئيسيّة بدل صفحة المنتج؟ (تحويلُ رابطٍ أُزيل منتجه) */
export function redirectedHome(html: string, requested: string): boolean {
  const head = html.slice(0, 60000);
  const href =
    head.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ??
    head.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1] ??
    head.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i)?.[1];
  if (!href) return false;
  try {
    const c = new URL(href, requested);
    const r = new URL(requested);
    const host = (u: URL) => u.hostname.replace(/^www\./, '');
    const bare = (p: string) => p.replace(/\/+$/, '');
    return host(c) === host(r) && bare(c.pathname) === '' && bare(r.pathname) !== '';
  } catch {
    return false;
  }
}

/** يعلّم `gone` ويكتب السبب إن كانت الصفحة الرئيسيّة — ويُرجع هل كانت */
export function markIfRedirectedHome(out: { errors: string[]; gone?: boolean }, label: string, html: string, url: string): boolean {
  if (!redirectedHome(html, url)) return false;
  out.gone = true;
  out.errors.push(`${label}: ${GONE_MARK} — الرابط يُحوَّل إلى الصفحة الرئيسيّة`);
  return true;
}

/** حماية الاتصال من التعليق */
export async function fetchWithTimeout(url: string, options: any = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export type Store = string; // slug من جدول Store

/** هدف السحب: عرض متجر واحد + اسم القطعة للرسائل.
 *  كان النوع يحمل ١٢ عموداً بأسماء المتاجر الثلاثة؛ الآن شكل واحد يخدم
 *  أي متجر — وهو ما يجعل إضافة متجر لا تمسّ ملف السحب إطلاقاً. */
export type OfferTarget = {
  /** اسم القطعة — يظهر في رسائل الخطأ فقط */
  name: string;
  url: string | null;
  /** السعر السابق — مرجع حارس الانحراف */
  price: number | null;
  inStock: boolean | null;
};

export type StoreOutcome = {
  /** null = لم نحصل على سعر (نُبقي القديم) */
  price: number | null;
  /** undefined = لم نقرأ الصفحة؛ null = قرأناها ولا خصم */
  listPrice: number | null | undefined;
  inStock: boolean;
  errors: string[];
  /** سعر قُرئ بنجاح لكنه ارتفاع مشبوه — يُعلَّق للمراجعة ولا يُطبَّق */
  heldPrice?: number;
  /**
   * لم تُجرَّب القراءة أصلاً: لا رابط، أو متجرٌ سحبه موقوف (سعر يدوي).
   * ⚠️ ويُفرَّق عن الفشل: الفاشل يُسجَّل وقتُ محاولته، وهذا لا محاولة له —
   * فكتابة `lastCheckedAt` عليه تجعل سعراً يدوياً يبدو مسحوباً للتوّ.
   */
  skipped?: boolean;
  /** المتجر قال إنّ المنتج غير موجود (404، أو تحويلٌ إلى الرئيسيّة) — انظر GONE_MARK */
  gone?: boolean;
  /** عُرفت الصفحة صفحةَ منتج (عنوانه أو بياناته المنظّمة) — شرطُ قبول البروكسي العادي (lib/proxy-fallback) */
  pageRecognized?: boolean;
};

const emptyOutcome = (inStock: boolean): StoreOutcome => ({
  price: null, listPrice: undefined, inStock, errors: [],
});

/**
 * القرار المشترك لكل المتاجر: يُطبَّق، أم يُعلَّق للمراجعة، أم يُرفض؟
 *
 * كان كل محرّك متجر يكرّر الشرط بنفسه، فأي تعديل على السياسة يحتاج تحريره
 * في أربعة مواضع — وهو الطريق الذي جعل خطأ محدّد كازاسوق يعيش في نسختين.
 *
 * @param witness سعر من مصدر ثانٍ في الصفحة (JSON-LD). تطابقه يعني أن
 *                القراءة سليمة، فالقفزة واقعُ سوقٍ لا خطأ — فتُعتمد بلا سؤال.
 */
export function applyPriceVerdict(
  out: StoreOutcome,
  storeName: string,
  itemName: string,
  price: number,
  listPrice: number,
  previous: number | null | undefined,
  witness?: number | null,
): void {
  if (confirmsPrice(witness ?? null, price)) {
    out.price = price;
    out.listPrice = acceptListPrice(listPrice, price);
    return;
  }

  switch (classifyPriceChange(price, previous)) {
    case 'ok':
      out.price = price;
      out.listPrice = acceptListPrice(listPrice, price);
      return;
    case 'hold':
      /* لا نلمس السعر: يبقى القديم معروضاً حتى يقرّر الأدمن. ولا نُسجّله
         خطأً — الخطأ يعني عطلاً يُصلَح، وهذا سؤالٌ يُجاب. */
      out.heldPrice = price;
      return;
    case 'reject':
      out.errors.push(
        `${storeName} (${itemName}): سعر مرفوض لانحرافه الشديد (${price} مقابل ${previous ?? '؟'} سابقاً) — تحقّق من بنية الصفحة.`,
      );
      return;
  }
}

const scrapeUrl = (token: string, target: string, premium: boolean) =>
  `https://api.scrape.do/?token=${token}&url=${encodeURIComponent(target)}${premium ? '&super=true' : ''}`;

/* ============================ أمازون ============================ */
/* البروكسي العاديّ أولاً والمتقدّم احتياطاً — انظر lib/proxy-fallback */
export const scrapeAmazon = (t: OfferTarget, token: string): Promise<StoreOutcome> =>
  withProxyFallback('amazon', t, (premium) => scrapeAmazonVia(t, token, premium));

async function scrapeAmazonVia(t: OfferTarget, token: string, premium: boolean): Promise<StoreOutcome> {
  const out = emptyOutcome(t.inStock ?? true);
  if (!t.url || t.url.length <= 12) return out;

  try {
    const res = await scrapeFetch(scrapeUrl(token, t.url, premium));
    if (!res.ok) {
      httpFailure(out, `أمازون (${t.name})`, res.status);
      return out;
    }
    const html = await res.text();

    /* صفحة معطّلة/صيانة ليست دليل نفاد — نخرج بلا أن نمسّ حالة التوفّر */
    if (isBrokenPage(html)) {
      out.errors.push(`أمازون (${t.name}): صفحة المتجر معطّلة أو تحت الصيانة — أُبقيت الحالة السابقة.`);
      return out;
    }
    if (markIfRedirectedHome(out, `أمازون (${t.name})`, html, t.url)) return out;
    const $ = cheerio.load(html);

    /* ---- التوفّر — من مسار الشراء لا من نصّ #availability وحده ----
       رُصد ٢٠٢٦-٠٨-٠٨: حين لا يوجد عرض إطلاقاً، تعيد أمازون استخدام
       #availability لكتلة جافاسكربت، فيخرج نصّاً بلا كلمة «unavailable»
       والفحص القديم يستنتج "متوفّر". النتيجة أن كرت RTX 5090 بقي معروضاً
       متوفّراً بسعر قديم، والسعر الوحيد في صفحته يخصّ ملحقاً (٢٨١ ﷼).

       الإشارة الموثوقة: هل توجد وسيلة شراء؟ ومع ذلك لا نعلن النفاد إلا إن
       كانت الصفحة مقروءة (فيها عنوان منتج) — صفحةٌ لم نفهمها تُبقي الحالة
       السابقة، وهو الدرس نفسه الذي كلّفنا ٥٦ منتجاً في كازاسوق. */
    const availability = $('#availability').text().toLowerCase();
    const saysUnavailable =
      availability.includes('currently unavailable') ||
      availability.includes('غير متوفر') ||
      availability.includes('لا يتوفر');
    const canBuy = $('#add-to-cart-button').length > 0 || $('#buy-now-button').length > 0;
    const hasPriceBlock =
      $('#corePriceDisplay_desktop_feature_div').length > 0 || $('#corePrice_feature_div').length > 0;
    const isProductPage = $('#productTitle').length > 0;
    out.pageRecognized = isProductPage;

    if (saysUnavailable) out.inStock = false;
    else if (canBuy) out.inStock = true;
    else if (isProductPage && !hasPriceBlock) out.inStock = false; // صفحة منتج مقروءة بلا أي عرض
    // وإلّا: لم نتعرّف على الصفحة → out.inStock يبقى على قيمته السابقة

    let priceText = $('#corePriceDisplay_desktop_feature_div .a-price-whole').first().text();
    if (!priceText) priceText = $('#corePrice_feature_div .a-price-whole').first().text();
    if (!priceText) priceText = $('.apexPriceToPay .a-offscreen').first().text();
    if (!priceText) priceText = $('#priceblock_ourprice').text();
    if (!priceText) priceText = $('.a-price[data-a-size="xl"] .a-offscreen').first().text();

    /* سعر ما قبل الخصم: السعر المشطوب (List Price) — محصوراً في كتلة السعر */
    const listText =
      $('#corePriceDisplay_desktop_feature_div .basisPrice .a-offscreen').first().text() ||
      $('#corePriceDisplay_desktop_feature_div span[data-a-strike="true"] .a-offscreen').first().text() ||
      $('#corePrice_feature_div span[data-a-strike="true"] .a-offscreen').first().text() ||
      $('#priceblock_listprice').first().text();

    const price = round2(parseMoney(priceText));
    if (price > 0) {
      applyPriceVerdict(out, 'أمازون', t.name, price, round2(parseMoney(listText)), t.price);
    } else if (out.inStock) {
      // النافد لا يعرض سعراً — الإبلاغ عنه كخطأ ضوضاء تُخفي الأعطال الحقيقية
      out.errors.push(`أمازون (${t.name}): لم يتم العثور على سعر صالح.`);
    }
  } catch {
    out.errors.push(`أمازون (${t.name}): تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.`);
  }
  return out;
}

/* ============================ كازاسوق ============================ */
/*
 * ⚠️ موقعهم الجديد (~2026-10-25) واجهة جافاسكربت: لا صفّ توفّر ولا زرّ سلّة ولا `.product-price`
 * في الـHTML الخام. والقارئ القديم كان يستنتج «نافد» من **غياب** زرّ السلّة — فانقلبت العروض
 * الـ٢٥٤ كلّها نافدةً بلا خطأٍ واحد ولا تنبيه، يومين حتى بلّغ نوّاف (scripts/pause-cazasouq-2026-10-28).
 *
 * لكنّ الخادم يُرسل مع كلّ صفحة منتجٍ بياناتها المنظّمة لمحرّكات البحث (`data-seo-prerender`):
 *   <script type="application/ld+json">{"@type":"Product", "offers":{"@type":"Offer", "price":275,
 *     "priceCurrency":"BHD", "availability":"https://schema.org/OutOfStock", "url":"…/product/<slug>"}}</script>
 * وقِيس 2026-10-28 على العروض الـ٢٥٤ (الخام مقابل الصفحة الحيّة المرسومة من الـAPI):
 *   ٢٥٢ فيها بيانات المنتج (والاثنان الباقيان منتجان حُذفا فحُوِّل رابطهما إلى صفحة فئة)، و٢٥٢ من
 *   ٢٥٢ يطابق سعرُها وتوفّرها الصفحةَ الحيّة؛ والردّ غير مخزّن (`max-age=0`، وعمرُه ٠–٤ ثوانٍ)،
 *   ويأتي من أوّل طلبٍ لصفحةٍ لم يزرها أحد؛ و`offers.url` يطابق og:url في الـ٢٥٢.
 *
 * والقاعدة التي خرقها القديم: **لا حكم من غياب شيء**. فكلّ ما لا نعرفه خطأٌ معلن والحالة كما هي،
 * والأحكام الثلاثة وحدها من إشاراتٍ صريحة — بالترتيب:
 *   ١) ليست صفحة متجرهم أصلاً (تحقّق Cloudflare، صفحة خطأ من الوسيط) ← خطأ، لا «أُزيل».
 *   ٢) انتهى الرابط خارج /product/ (‏Scrape.do-Resolved-Url: منتجٌ حُذف فحُوِّل إلى فئة) ← `gone`،
 *      ولا يسقط العرض إلّا بإشارتين متتاليتين (lib/scrape-offers · goneTwice).
 *   ٣) صفحة منتجٍ بلا بياناته ← خطأ (ويُعاد الطلب مرّةً في scrapeCazasouq) — لا «أُزيل»: صفحةٌ لم تُجهَّز
 *      بياناتها والمنتجُ المحذوف يبدوان واحداً من الداخل، والفرق في (٢) وحده.
 *   ٤) بيانات منتجٍ آخر (offers.url ≠ og:url) أو عرضٌ غير «Offer» (‏AggregateOffer لنسخٍ متعدّدة) ← خطأ.
 *   ٥) التوفّر من `availability`: InStock/LimitedAvailability/OnlineOnly متوفّر، وOutOfStock/SoldOut/
 *      Discontinued/PreOrder/BackOrder غير متوفّرٍ الآن، وما سواها خطأ.
 *   ٦) العملة من priceCurrency: BHD تُحوَّل (lib/currency)، وSAR كما هي، وغيابها أو غيرهما خطأ —
 *      دينارٌ يُقرأ ريالاً سعرٌ يبدو معقولاً وهو عُشر الحقيقة.
 * ⚠️ لم يُختبر: الخصم. لا عرضَ مخفّضاً في موقعهم يوم الكتابة، فلا يُعرف أيذكر JSON-LD السعر بعد الخصم.
 */
const CAZ_NO_DATA = 'صفحة المنتج بلا بيانات منظّمة (JSON-LD)';
const CAZ_IN = new Set(['InStock', 'LimitedAvailability', 'OnlineOnly']);
const CAZ_OUT = new Set(['OutOfStock', 'SoldOut', 'Discontinued', 'PreOrder', 'BackOrder']);
const pathOf = (u: string | null | undefined): string | null => {
  try { return u ? new URL(u, 'https://www.cazasouq.com').pathname.replace(/\/+$/, '') || '/' : null; } catch { return null; }
};

export function readCazasouqPage(html: string, t: OfferTarget, finalUrl?: string | null): StoreOutcome {
  const out = emptyOutcome(t.inStock ?? true);
  const label = `كازاسوق (${t.name})`;
  const keep = 'أُبقيت الحالة السابقة.';

  /* صفحة معطّلة/صيانة ليست دليل نفاد — نخرج بلا أن نمسّ حالة التوفّر */
  if (isBrokenPage(html)) {
    out.errors.push(`${label}: صفحة المتجر معطّلة أو تحت الصيانة — ${keep}`);
    return out;
  }
  /* ١ — كلّ صفحةٍ من تطبيقهم تحمل هذا الوسم في رأسها؛ ما خلا منه ليس من المتجر */
  if (!html.includes('cazasouq-supabase-url')) {
    out.errors.push(`${label}: الردّ ليس صفحةً من المتجر (تحقّق حماية أو خطأ وسيط؟) — ${keep}`);
    return out;
  }
  /* ٢ — أين انتهى الرابط؟ */
  const landed = pathOf(finalUrl);
  if (landed != null && !landed.startsWith('/product/')) {
    out.gone = true;
    out.errors.push(`${label}: ${GONE_MARK} — الرابط يُحوَّل إلى ${landed} لا إلى صفحة منتج`);
    return out;
  }
  if (markIfRedirectedHome(out, label, html, finalUrl || t.url!)) return out;

  const $ = cheerio.load(html);
  const ld = jsonLdOffer($);

  /* ٣ */
  if (ld.offerType == null && ld.price == null && ld.inStock == null) {
    out.errors.push(`${label}: ${CAZ_NO_DATA} — ${keep}`);
    return out;
  }
  /* ٤ */
  const ogPath = pathOf($('meta[property="og:url"]').attr('content'));
  const offerPath = pathOf(ld.offerUrl);
  if (ogPath && offerPath && ogPath !== offerPath) {
    out.errors.push(`${label}: بيانات الصفحة لمنتجٍ آخر (${offerPath} لا ${ogPath}) — ${keep}`);
    return out;
  }
  if (ld.offerType && ld.offerType !== 'Offer') {
    out.errors.push(`${label}: نوع عرضٍ غير معتاد (${ld.offerType}) — ${keep}`);
    return out;
  }
  /* ٥ */
  const av = ld.availability || '';
  if (!CAZ_IN.has(av) && !CAZ_OUT.has(av)) {
    out.errors.push(`${label}: توفّرٌ غير معروف (${av || 'غير مذكور'}) — ${keep}`);
    return out;
  }
  out.pageRecognized = true;
  out.inStock = CAZ_IN.has(av);

  /* ٦ */
  const cur = String(ld.currency || '').toUpperCase();
  let price = ld.price ?? 0;
  if (price > 0 && cur !== 'SAR' && !isBhdText(cur)) {
    out.errors.push(`${label}: عملة السعر ${cur ? `غير متوقّعة (${cur})` : 'غير مذكورة'} — لم يُعتمد السعر.`);
    return out;
  }
  if (isBhdText(cur)) price = bhdToSar(price);
  price = round2(price);

  /* لا «سعر قبل الخصم» في بياناتهم المنظّمة: 0 ← null = قرأنا الصفحة ولا خصمَ معلن — لا خصماً قديماً
     من الموقع السابق يبقى معلّقاً على سعرٍ جديد */
  if (price > 0) {
    applyPriceVerdict(out, 'كازاسوق', t.name, price, 0, t.price, null);
  } else if (out.inStock) {
    out.errors.push(`${label}: متوفّر بلا سعر في بياناته المنظّمة.`);
  }
  return out;
}

export async function scrapeCazasouq(t: OfferTarget, token: string): Promise<StoreOutcome> {
  const out = emptyOutcome(t.inStock ?? true);
  if (!t.url || t.url.length <= 12) return out;

  try {
    // بروكسي عادي (بلا super) — كازاسوق لا يحتاج حماية متقدمة، فيوفّر الرصيد
    const get = async () => {
      const res = await scrapeFetch(scrapeUrl(token, t.url!, false));
      /* الرابط النهائيّ بعد التحويل (توثيق Scrape.do) — به يُعرف المنتج المحذوف المحوَّل إلى فئة */
      return { res, html: res.ok ? await res.text() : '', final: res.headers.get('scrape.do-resolved-url') };
    };
    let r = await get();
    if (!r.res.ok) {
      httpFailure(out, `كازاسوق (${t.name})`, r.res.status);
      return out;
    }
    let o = readCazasouqPage(r.html, t, r.final);
    /* صفحة منتجٍ بلا بياناتها: طلبٌ ثانٍ واحد (وحدة رصيد) قبل الحكم بالخطأ — إن بقي وقتٌ يكفيه */
    if (o.errors.some((e) => e.includes(CAZ_NO_DATA)) && remainingBudget() > 8000) {
      await sleep(1500);
      r = await get();
      if (r.res.ok) o = readCazasouqPage(r.html, t, r.final);
    }
    return o;
  } catch {
    out.errors.push(`كازاسوق (${t.name}): تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.`);
  }
  return out;
}

/* =========================== مايكرولس =========================== */
/* البروكسي العاديّ أولاً والمتقدّم احتياطاً — انظر lib/proxy-fallback */
export const scrapeMicroless = (t: OfferTarget, token: string): Promise<StoreOutcome> =>
  withProxyFallback('microless', t, (premium) => scrapeMicrolessVia(t, token, premium));

async function scrapeMicrolessVia(t: OfferTarget, token: string, premium: boolean): Promise<StoreOutcome> {
  const out = emptyOutcome(t.inStock ?? true);
  if (!t.url || t.url.length <= 12) return out;

  try {
    const res = await scrapeFetch(scrapeUrl(token, t.url, premium));
    if (!res.ok) {
      httpFailure(out, `مايكروليس (${t.name})`, res.status);
      return out;
    }
    const html = await res.text();

    /* صفحة معطّلة/صيانة ليست دليل نفاد — نخرج بلا أن نمسّ حالة التوفّر */
    if (isBrokenPage(html)) {
      out.errors.push(`مايكروليس (${t.name}): صفحة المتجر معطّلة أو تحت الصيانة — أُبقيت الحالة السابقة.`);
      return out;
    }
    if (markIfRedirectedHome(out, `مايكروليس (${t.name})`, html, t.url)) return out;
    const $ = cheerio.load(html);
    const htmlLower = html.toLowerCase();

    /* ---- التوفّر — من بيانات schema.org أولاً ----
       رُصد ٢٠٢٦-٠٨-٠٨: صفحة مايكروليس السليمة تحتوي «add to cart» و«notify
       me» و«no longer available» **معاً** في قالبها، فالاستدلال بوجود النصّ
       لا يفرّق بين متوفّر ونافد. والنافد يُعلن نفسه صراحة:
         <script type="application/ld+json"> … "availability": ".../OutOfStock"
       فكانت ٥ أقراص نافدة تُحسب متوفّرة وتُسجَّل خطأ "لم نجد سعراً". */
    const ld = jsonLdOffer($);
    const metaAvailability = $('meta[property="product:availability"]').attr('content') || '';
    out.pageRecognized =
      !!metaAvailability || ld.inStock != null || ld.price != null ||
      !!$('meta[property="product:price:amount"]').attr('content');
    if (metaAvailability.includes('out of stock') || metaAvailability.includes('oos')) {
      out.inStock = false;
    } else if (ld.inStock != null) {
      out.inStock = ld.inStock;
    } else {
      const hasAddToCart = htmlLower.includes('add to cart') || htmlLower.includes('إضافة إلى العربة');
      out.inStock = !(!hasAddToCart && (htmlLower.includes('notify me') || htmlLower.includes('no longer available')));
    }

    let priceText = $('meta[property="product:price:amount"]').attr('content');
    if (!priceText) {
      priceText = $('.product-details .price, .product-info .amount, .product-price').first().text();
    }

    let price = round2(parseMoney(priceText || ''));

    if (htmlLower.includes('aed') && !htmlLower.includes('sar')) {
      price = round2(price * 1.022);
    }

    if (price > 0) {
      /* سعر ما قبل الخصم لمايكرولس **معطّل** حتى نتحقّق من محدّده: المحاولة
         الأولى (meta[product:original_price] ثم del/.price-was) أنتجت خصماً
         وهمياً ١٠٠٪ من الحالات — 7554.03 لكرت سعره 3042 (‎-60%). وخصمٌ بسعر
         خاطئ أسوأ من لا خصم: يبدو عرضاً حقيقياً ويضلّل المشتري.
         نُمرّر 0 فيسقط acceptListPrice إلى null، وnull يمسح أي قيمة خاطئة
         مخزّنة سابقاً. لإعادة تشغيله: اقرأ بنية DOM لصفحة منتج مخفّض. */
      applyPriceVerdict(out, 'مايكروليس', t.name, price, 0, t.price, ld.price);
    } else if (out.inStock) {
      // النافد لا يعرض سعراً — الإبلاغ عنه كخطأ ضوضاء تُخفي الأعطال الحقيقية
      out.errors.push(`مايكروليس (${t.name}): لم يتم العثور على سعر صالح.`);
    }
  } catch {
    out.errors.push(`مايكروليس (${t.name}): تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.`);
  }
  return out;
}

/**
 * ============ جرير ============
 *
 * ⚠️ ولا يُقرأ من HTML: موقعُ جرير يُصيَّر في المتصفّح (Nuxt)، فصفحةُ المنتج
 * التي يجلبها الخادم ١٬٦ ميجابايت **بلا اسمٍ ولا سعر**. قِيس: خمسةُ رموزٍ
 * ظهرت في طلبات المتصفّح لم يوجد أحدُها في HTML.
 *
 * ⚠️ فالقراءة من مسارهم الداخليّ الذي يناديه موقعُهم نفسه، ويستجيب لطلبٍ
 * عاديٍّ من خادمنا **بلا وسيط وبلا رصيد**:
 *
 *     /api/catalogv2/product/store/sa-en/sku/<SKU>/visibilityAll/true/size/1
 *
 * ويعيد وثيقةً فيها الاسم والسعر والتوفّر والصورة — أدقّ ممّا يُستخرج من
 * HTML بالمحدّدات، ولا ينكسر بتغيير التنسيق.
 *
 * ⚠️ والرمز يُقرأ من الرابط: كلُّ روابط منتجاتهم تنتهي بـ`-<ستّة أرقام>.html`
 *     …/pny-technologies-geforce-rtx-5070-argb-graphics-card-652116.html
 * فرابطٌ لا رمزَ فيه لا يُسحب — ويُقال سببُه بدل أن يُحسب نفاداً.
 */
const JARIR_SKU = /-(\d{6,8})\.html(?:[?#]|$)/;

export async function scrapeJarir(t: OfferTarget, _token: string): Promise<StoreOutcome> {
  const out = emptyOutcome(t.inStock ?? true);
  if (!t.url) return out;

  const sku = JARIR_SKU.exec(t.url)?.[1];
  if (!sku) {
    out.errors.push(`جرير (${t.name}): الرابط بلا رمز منتج — يجب أن ينتهي بـ«-123456.html».`);
    return out;
  }

  try {
    const api = `https://www.jarir.com/api/catalogv2/product/store/sa-en/sku/${sku}/visibilityAll/true/size/1`;
    const res = await scrapeFetch(api);
    if (!res.ok) {
      out.errors.push(`جرير (${t.name}): ${httpReason(res.status)}`);
      return out;
    }
    const json: any = await res.json().catch(() => null);
    const src = json?.data?.hits?.hits?.[0]?._source;
    /* ⚠️ ورمزٌ لا يُعيد وثيقةً ليس نفاداً: قد يكون المنتج حُذف أو الرابط
       خاطئاً. فتُبقى الحالة السابقة ويُقال الخبر. */
    if (!src) {
      out.errors.push(`جرير (${t.name}): لا منتج بالرمز ${sku} — أُبقيت الحالة السابقة.`);
      return out;
    }

    /* ⚠️ لا `stock.is_in_stock` وحده: قِيس 2026-10-09 أنه `false` بكمّيّة 0 حتى لما يبيعه
       جرير فعلاً — RTX 5070 (11 قطعة) و990 PRO (43) وCS900 (8) كلّها «نافدة» به، فكان كلُّ
       عرضٍ لجرير يُعرض نافداً. التوفّر الحقّ في مسار المخزون الذي يناديه زرّ «أضف للسلّة»
       عندهم، و`is_stock_available` بديلٌ حين يتعذّر. */
    out.inStock = src?.stock?.is_in_stock === true || Number(src?.is_stock_available) === 1;
    try {
      const st = await scrapeFetch(`https://www.jarir.com/api/v2/sa_en/stock/getavailability?skuData=${encodeURIComponent(`${sku}|1|0|0`)}&customer_group=&quote_id=`);
      const r: any = st.ok ? (await st.json().catch(() => null))?.data?.result?.[0] : null;
      if (r && String(r.sku_code) === sku) out.inStock = r.stock_availablity === 'AVAILABLE' && Number(r.available_qty) > 0;
    } catch { /* يبقى البديل */ }

    const price = round2(Number(src.final_price) || 0);
    /* سعرُ ما قبل الخصم: يُمرَّر فقط حين يكون أعلى فعلاً — وإلّا فلا خصم */
    const regular = round2(Number(src.regular_price) || 0);
    const listPrice = regular > price ? regular : 0;

    if (price > 0) {
      applyPriceVerdict(out, 'جرير', t.name, price, listPrice, t.price, null);
    } else if (out.inStock) {
      out.errors.push(`جرير (${t.name}): لم يتم العثور على سعر صالح.`);
    }
  } catch {
    out.errors.push(`جرير (${t.name}): تجاوز الوقت المسموح (Timeout) أو خطأ اتصال.`);
  }
  return out;
}

/**
 * يكتب نقطة سعر واحدة لكل متجر في اليوم (يحدّثها إن تغيّر السعر).
 * يُمرَّر عميل prisma من المسار — الوحدة لا تستورده.
 */
export async function recordPriceHistory(
  db: any,
  componentId: string,
  pricePoints: { store: Store; price: number }[]
) {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  for (const point of pricePoints) {
    const existing = await db.priceHistory.findFirst({
      where: { componentId, store: point.store, recordedAt: { gte: startOfDay } },
      select: { id: true, price: true },
    });

    if (!existing) {
      await db.priceHistory.create({
        data: { componentId, store: point.store, price: round2(point.price) },
      });
    } else if (existing.price !== round2(point.price)) {
      await db.priceHistory.update({
        where: { id: existing.id },
        data: { price: round2(point.price), recordedAt: new Date() },
      });
    }
    // موجود وبنفس السعر → لا شيء (تجنّب كتابة زائدة)
  }
}
