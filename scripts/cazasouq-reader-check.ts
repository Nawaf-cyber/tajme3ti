/**
 * ============ فحص قارئ كازاسوق على صفحاتٍ حقيقيّة — وكلّ طريقٍ يخرب منه ============
 *
 *   npx tsx scripts/cazasouq-reader-check.ts      # يخرج برمز ١ إن خالفت حالةٌ المتوقَّع
 *
 * لماذا: القارئ القديم انقلب على العروض الـ٢٥٤ «نافدة» بصمتٍ يومين حين غيّروا موقعهم
 * (lib/scrape-prices · readCazasouqPage يشرح). فكلّ تعديلٍ على القارئ يمرّ هنا قبل الرفع.
 *
 * الصفحات في scripts/fixtures/cazasouq — قُرئت 2026-10-28 كما يرسلها خادمهم (الـHTML الخام)، والمفتاح
 * العامّ في رأسها مستبدَل بـREDACTED. ومنها تُصنع الحالات المكسورة بتعديلٍ صغيرٍ واحد لكلّ حالة.
 * والقاعدة المفحوصة: لا «نافد» ولا «أُزيل» إلّا من إشارةٍ صريحة، وما عداها خطأٌ معلن والحالة كما هي.
 */
import { readFileSync } from 'node:fs';
import { readCazasouqPage, GONE_MARK } from '../lib/scrape-prices';

const F = (n: string) => readFileSync(`scripts/fixtures/cazasouq/${n}`, 'utf8');
const IN = F('product-in-stock.html');          // Core i7-14700F — 147 دينار، InStock
const OUT = F('product-out-of-stock.html');     // RX 9070 Gaming OC — 275 دينار، OutOfStock
const CAT = F('removed-to-category.html');      // رابط 7900X بعد حذفه: صفحة فئة
const P_IN = 'https://www.cazasouq.com/product/intel-core-i7-14700f-cpu?lang=ar';
const P_OUT = 'https://www.cazasouq.com/product/gigabyte-radeon-rx-9070-gaming-oc-16gb-gddr6-gpu?lang=ar';
const OLD = 'https://www.cazasouq.com/intel-core-i7-14700f-cpu-aa16621';

/* يُفكّ كلّ JSON-LD ويُعدَّل ثمّ يُعاد — لا استبدال نصوصٍ يكسر الـJSON بالخطأ */
const editLd = (html: string, fn: (p: any) => void) =>
  html.replace(/(<script type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g, (m, a, body, c) => {
    const j = JSON.parse(body);
    if (j['@type'] === 'Product') fn(j);
    return a + JSON.stringify(j) + c;
  });
const noLd = (html: string) => html.replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/g, '');

type Exp = { inStock?: boolean; price?: number | null; gone?: boolean; error?: RegExp | null; held?: boolean };
type Case = [name: string, html: string, final: string | null, prev: { price: number | null; inStock: boolean }, exp: Exp];

const CASES: Case[] = [
  ['متوفّر (حقيقيّ)', IN, P_IN, { price: 1467.11, inStock: false }, { inStock: true, price: 1467.11, error: null }],
  ['نافد (حقيقيّ)', OUT, P_OUT, { price: 2744.59, inStock: true }, { inStock: false, price: 2744.59, error: null }],
  ['الرابط القديم بلا رأس Resolved-Url', IN, null, { price: 1467.11, inStock: true }, { inStock: true, price: 1467.11, error: null }],
  ['منتجٌ حُذف فحُوِّل إلى فئة', CAT, 'https://www.cazasouq.com/category/amd-processor?lang=ar', { price: 2100, inStock: true }, { gone: true, inStock: true, error: new RegExp(GONE_MARK) }],
  ['صفحة فئة بلا رأس Resolved-Url ← لا «أُزيل»', CAT, null, { price: 2100, inStock: true }, { gone: false, inStock: true, error: /بلا بيانات منظّمة/ }],
  ['حُوِّل إلى الرئيسيّة', CAT, 'https://www.cazasouq.com/', { price: 2100, inStock: true }, { gone: true, error: new RegExp(GONE_MARK) }],
  ['صفحة منتجٍ بلا بياناتها (متوفّر سابقاً)', noLd(IN), P_IN, { price: 1467.11, inStock: true }, { gone: false, inStock: true, error: /بلا بيانات منظّمة/ }],
  ['صفحة منتجٍ بلا بياناتها (نافد سابقاً)', noLd(OUT), P_OUT, { price: 2744.59, inStock: false }, { gone: false, inStock: false, error: /بلا بيانات منظّمة/ }],
  ['تحقّق Cloudflare بدل الصفحة', '<!DOCTYPE html><html><head><title>Just a moment...</title></head><body><div id="cf-chl-widget">Checking your browser</div></body></html>', P_IN, { price: 1467.11, inStock: true }, { gone: false, inStock: true, error: /ليس صفحةً من المتجر|معطّلة/ }],
  ['ردّ فارغ', '', P_IN, { price: 1467.11, inStock: true }, { gone: false, inStock: true, error: /./ }],
  ['JSON-LD مكسور', IN.replace(/"@type":"Product"/, '"@type":"Product",,'), P_IN, { price: 1467.11, inStock: true }, { inStock: true, error: /بلا بيانات منظّمة/ }],
  ['العملة غير مذكورة', editLd(IN, (p) => { delete p.offers.priceCurrency; }), P_IN, { price: 1467.11, inStock: true }, { price: null, error: /عملة السعر غير مذكورة/ }],
  ['العملة AED', editLd(IN, (p) => { p.offers.priceCurrency = 'AED'; }), P_IN, { price: 1467.11, inStock: true }, { price: null, error: /غير متوقّعة \(AED\)/ }],
  ['العملة SAR', editLd(IN, (p) => { p.offers.priceCurrency = 'SAR'; p.offers.price = 1470; }), P_IN, { price: 1467.11, inStock: true }, { price: 1470, inStock: true, error: null }],
  ['طلبٌ مسبق PreOrder', editLd(IN, (p) => { p.offers.availability = 'https://schema.org/PreOrder'; }), P_IN, { price: 1467.11, inStock: true }, { inStock: false, price: 1467.11, error: null }],
  ['توفّرٌ غير معروف', editLd(IN, (p) => { p.offers.availability = 'https://schema.org/InStoreOnly'; }), P_IN, { price: 1467.11, inStock: true }, { inStock: true, price: null, error: /توفّرٌ غير معروف/ }],
  ['توفّرٌ غير مذكور', editLd(IN, (p) => { delete p.offers.availability; }), P_IN, { price: 1467.11, inStock: false }, { inStock: false, price: null, error: /توفّرٌ غير معروف/ }],
  ['AggregateOffer', editLd(IN, (p) => { p.offers = { '@type': 'AggregateOffer', lowPrice: 140, highPrice: 160, priceCurrency: 'BHD', availability: 'https://schema.org/InStock', url: p.offers.url }; }), P_IN, { price: 1467.11, inStock: true }, { price: null, error: /AggregateOffer/ }],
  ['بيانات منتجٍ آخر', editLd(IN, (p) => { p.offers.url = 'https://www.cazasouq.com/product/some-other-product'; }), P_IN, { price: 1467.11, inStock: true }, { price: null, inStock: true, error: /لمنتجٍ آخر/ }],
  ['متوفّر بلا سعر', editLd(IN, (p) => { p.offers.price = 0; }), P_IN, { price: 1467.11, inStock: true }, { inStock: true, price: null, error: /بلا سعر/ }],
  /* سياسة الموقع (applyPriceVerdict): القفزة الكبيرة تُعلَّق للمراجعة في اللوحة لا تُعتمد ولا تُعدّ خطأً */
  ['قفزة سعرٍ ×٢٫٧ ← تُعلَّق للمراجعة', OUT, P_OUT, { price: 1000, inStock: true }, { price: null, held: true }],
  ['انخفاض ٣٥٪ ← يُعتمد', editLd(IN, (p) => { p.offers.price = 96; }), P_IN, { price: 1467.11, inStock: true }, { price: 958.11, inStock: true, error: null }],
];

let fail = 0;
for (const [name, html, final, prev, exp] of CASES) {
  const o = readCazasouqPage(html, { name: 'x', url: OLD, price: prev.price, inStock: prev.inStock } as any, final);
  const bad: string[] = [];
  if (exp.inStock !== undefined && o.inStock !== exp.inStock) bad.push(`inStock ${o.inStock}≠${exp.inStock}`);
  if (exp.price !== undefined && (o.price ?? null) !== exp.price) bad.push(`price ${o.price}≠${exp.price}`);
  if (exp.gone !== undefined && !!o.gone !== exp.gone) bad.push(`gone ${!!o.gone}≠${exp.gone}`);
  if (exp.held !== undefined && (o.heldPrice != null) !== exp.held) bad.push(`held ${o.heldPrice != null}≠${exp.held}`);
  if (exp.error === null && o.errors.length) bad.push(`خطأٌ غير متوقّع: ${o.errors[0]}`);
  if (exp.error && !o.errors.some((e) => exp.error!.test(e))) bad.push(`الخطأ المتوقّع غائب (${o.errors[0] ?? 'لا خطأ'})`);
  if (bad.length) fail++;
  console.log(`${bad.length ? '✗' : '✓'} ${name}${bad.length ? ' — ' + bad.join(' · ') : ''}${o.heldPrice ? ` (معلّق للمراجعة ${o.heldPrice})` : ''}`);
}
console.log(`\n${CASES.length - fail}/${CASES.length} سليمة`);
if (fail) process.exitCode = 1;
