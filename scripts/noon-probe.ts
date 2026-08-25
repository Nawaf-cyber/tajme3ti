/* ============ لماذا تفشل قراءة نون؟ ============
 *
 * كل عروض نون التسعة عشر عليها خطأ «تجاوز الوقت المسموح»، ولا واحدٌ منها
 * ينجح — منذ أُضيف المتجر لا منذ أضفتُ عروضَ المبرّدات.
 *
 * والمتصفّح الحقيقيّ نفسه يُردّ بـ«Access Denied» من `errors.edgesuite.net`،
 * أي حائط Akamai. فالسؤال ليس «هل المحدّدات صحيحة» بل «هل نصل أصلاً».
 *
 * يُجرَّب رابطٌ واحد بثلاث طرق ويُقاس الفرق — طلبان أو ثلاثة من الرصيد،
 * وهو أرخص من تخمينٍ يُكتب في قاعدة الإنتاج.
 *
 *   npx tsx scripts/noon-probe.ts
 */

import 'dotenv/config';

const TOKEN = process.env.SCRAPER_API_KEY;
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

const URL_UNDER_TEST =
  'https://www.noon.com/saudi-ar/ag300-single-tower-92mm-cpu-cooler-500-3050-rpm-fan-speed-36-75-cfm-airflow-1-56w-power-30-5-dbafan-noise-hydro-bearing-4-pin-pwm-fan-connector-black-r-ag300-bknnmn-g/ZC1F9011B31131AE7C3F9Z/p/';

const probe = async (label: string, build: (t: string, u: string) => string) => {
  const started = Date.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45000);
    const res = await fetch(build(TOKEN!, URL_UNDER_TEST), { signal: ctrl.signal });
    clearTimeout(timer);
    const html = await res.text();
    const ms = Date.now() - started;

    const denied = /Access Denied|edgesuite\.net/i.test(html);
    const ld = (html.match(/application\/ld\+json/g) || []).length;
    const hasProduct = /"@type"\s*:\s*"Product"/.test(html);
    const priceMeta = /product:price:amount|og:price:amount/.test(html);
    const amount = html.match(/_amount_[^"]*"[^>]*>([\d,.]+)/)?.[1] ?? null;

    console.log(`\n${label}`);
    console.log(`  حالة ${res.status} · ${ms}ms · ${(html.length / 1024).toFixed(0)}KB`);
    console.log(`  ${denied ? `${R}محجوب (Access Denied)${X}` : `${G}مرّ${X}`}`);
    console.log(`  ${D}كتل JSON-LD: ${ld} · فيها Product: ${hasProduct} · وسوم سعر: ${priceMeta} · رقم في DOM: ${amount ?? '—'}${X}`);
    return { ok: !denied && res.status === 200, hasProduct, amount };
  } catch (e: any) {
    console.log(`\n${label}\n  ${R}فشل بعد ${Date.now() - started}ms: ${e.name} ${e.message}${X}`);
    return { ok: false, hasProduct: false, amount: null };
  }
};

async function main() {
  if (!TOKEN) { console.error('⛔ SCRAPER_API_KEY غير مضبوط'); process.exit(1); }
  console.log(`\nالرابط: ${D}…${URL_UNDER_TEST.slice(-42)}${X}`);

  await probe(`${Y}١) بلا وسيط — كما يفعل أي خادم${X}`, (_t, u) => u);

  await probe(
    `${Y}٢) Scrape.do عاديّ — وهو ما يُستعمل اليوم (premiumProxy=false)${X}`,
    (t, u) => `https://api.scrape.do/?token=${t}&url=${encodeURIComponent(u)}`,
  );

  await probe(
    `${Y}٣) Scrape.do مميّز (super=true) — premiumProxy=true${X}`,
    (t, u) => `https://api.scrape.do/?token=${t}&url=${encodeURIComponent(u)}&super=true`,
  );

  console.log(`\n${'─'.repeat(56)}`);
  console.log(`${D}إن نجح الثالث وحده ⇒ الحلّ تفعيل premiumProxy لنون.${X}`);
  console.log(`${D}وإن فشل الثلاثة ⇒ نون لا يُسحب، فيُوقَف سحبه وتبقى أسعاره يدوية.${X}`);
}

main();
