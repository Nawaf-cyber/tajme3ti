/**
 * ============ هل تُقرأ صفحات كازاسوق مباشرةً بلا Scrape.do؟ — قياسٌ للقراءة فقط (2026-11-06) ============
 *
 *   DOTENV_CONFIG_PATH=../../../.env npx tsx scripts/cazasouq-direct-check-2026-11-06.ts [--proxy N] [--out file.json]
 *
 * منذ انتقل موقعهم إلى Netlify (~2026-10-25) يردّ خادمُهم على طلبٍ عاديٍّ بـ200 وبالـJSON-LD نفسه
 * (`data-seo-prerender`) الذي يقرؤه readCazasouqPage. فلكلّ عرضٍ لكازاسوق في القاعدة:
 *   ١) يُجلب الرابط مباشرةً (redirect: 'follow') ويُقرأ بـreadCazasouqPage مع `res.url` رابطاً نهائيّاً
 *      — بدل رأس Scrape.do-Resolved-Url الذي به يُعرف المنتج المحذوف.
 *   ٢) ويُقارَن بآخر قراءةٍ بالوسيط (سعر العرض وتوفّره في القاعدة، كتبها الكرون) — مجّاناً.
 *   ٣) وبشاهدٍ ثالثٍ مجّانيّ: واجهتهم البرمجيّة (api.cazasouq.com، منها تُرسم الصفحة الحيّة) بقاعدتهم في
 *      السعر والمخزون (كما في lib/store-search · cazPriceSar).
 *   ٤) و`--proxy N`: كلّ ما اختلف + N عرضاً عشوائيّاً متطابقاً يُجلب بالوسيط الآن (~وحدة لكلّ طلب)
 *      ويُقارَن الـJSON-LD الخام بالطريقتين والرابطُ النهائيّ (res.url مقابل Scrape.do-Resolved-Url).
 *   ٥) وإشارة «أُزيل»: روابط لا وجود لها بالشكلين القديم والجديد، مباشرةً (ومع --proxy بالوسيط أيضاً).
 * لا كتابة في القاعدة.
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
import { prisma } from '../lib/prisma';
import { readCazasouqPage, jsonLdOffer, GONE_MARK, type OfferTarget, type StoreOutcome } from '../lib/scrape-prices';
import { bhdToSar } from '../lib/currency';

const argv = process.argv.slice(2);
const arg = (k: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const PROXY_N = Number(arg('--proxy') ?? 0);
const OUT = arg('--out');
const TOKEN = process.env.SCRAPER_API_KEY || '';
const SITE = 'https://www.cazasouq.com';

type Fetched = { status: number; finalUrl: string | null; ms: number; html: string; cacheStatus: string | null; age: string | null; cost?: number | null; err?: string };

async function direct(url: string): Promise<Fetched> {
  const t = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, { redirect: 'follow', cache: 'no-store', signal: ctrl.signal });
    const html = res.ok ? await res.text() : '';
    return { status: res.status, finalUrl: res.url || null, ms: Date.now() - t, html, cacheStatus: res.headers.get('cache-status'), age: res.headers.get('age') };
  } catch (e: any) {
    return { status: 0, finalUrl: null, ms: Date.now() - t, html: '', cacheStatus: null, age: null, err: String(e?.message || e) };
  } finally { clearTimeout(timer); }
}

async function proxied(url: string): Promise<Fetched> {
  const t = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(`https://api.scrape.do/?token=${TOKEN}&url=${encodeURIComponent(url)}`, { cache: 'no-store', signal: ctrl.signal });
    const html = res.ok ? await res.text() : '';
    return { status: res.status, finalUrl: res.headers.get('scrape.do-resolved-url'), ms: Date.now() - t, html, cacheStatus: res.headers.get('cache-status'), age: res.headers.get('age'), cost: Number(res.headers.get('scrape.do-request-cost')) };
  } catch (e: any) {
    return { status: 0, finalUrl: null, ms: Date.now() - t, html: '', cacheStatus: null, age: null, err: String(e?.message || e) };
  } finally { clearTimeout(timer); }
}

/** القراءة كما يحكم الساحب: صفحةٌ غير ناجحة تُحكم بما يحكم به httpFailure (404/410 ← «أُزيل») */
function read(f: Fetched, t: OfferTarget): StoreOutcome {
  if (f.status !== 200) {
    const gone = f.status === 404 || f.status === 410;
    return { price: null, listPrice: undefined, inStock: t.inStock ?? true, errors: [gone ? `${GONE_MARK} (${f.status})` : `HTTP ${f.status}${f.err ? ' ' + f.err : ''}`], gone };
  }
  return readCazasouqPage(f.html, t, f.finalUrl);
}

const ldRaw = (html: string) => {
  if (!html) return null;
  const o = jsonLdOffer(cheerio.load(html));
  return { price: o.price, currency: o.currency, availability: o.availability, offerUrl: o.offerUrl };
};
const shown = (o: StoreOutcome) => o.price ?? o.heldPrice ?? null;
const samePrice = (a: number | null, b: number | null) => (a == null || b == null ? a == null && b == null : Math.abs(a - b) / Math.max(a, b) <= 0.005);
const slugOf = (u: string | null) => u?.match(/\/product\/([^/?#]+)/)?.[1] ?? null;

async function pool<T, R>(items: T[], n: number, fn: (x: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); } }));
  return out;
}

/* الشاهد الثالث: صفوف منتجاتهم بالـslug — المفتاح العامّ من وسم meta في الصفحة (كما lib/store-search) */
async function apiRows(slugs: string[]) {
  const html = await (await fetch(`${SITE}/shop`)).text();
  const meta = (name: string) => html.match(new RegExp(`<meta[^>]+name="${name}"[^>]+content="([^"]+)"`))?.[1];
  const base = (meta('cazasouq-supabase-url') || '').replace(/\/+$/, '');
  const key = meta('cazasouq-supabase-anon-key');
  if (!base || !key) throw new Error('لا مفتاح عامّ في رأس الصفحة');
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const select = 'slug,price,discount_price,discount_starts_at,discount_ends_at,stock_quantity,stock_unlimited,is_active,is_archived';
  const rows = new Map<string, any>();
  for (let i = 0; i < slugs.length; i += 60) {
    const part = slugs.slice(i, i + 60).map((s) => `"${decodeURIComponent(s).replace(/"/g, '\\"')}"`).join(',');
    const r = await fetch(`${base}/rest/v1/products?select=${select}&slug=in.(${encodeURIComponent(part)})`, { headers });
    for (const row of (await r.json()) as any[]) rows.set(row.slug, row);
  }
  return rows;
}
const apiReading = (r: any, now = new Date()) => {
  if (!r) return null;
  const p = Number(r.price), d = Number(r.discount_price);
  const onSale = r.discount_price != null && d > 0 && d < p
    && !(r.discount_starts_at && new Date(r.discount_starts_at) > now)
    && !(r.discount_ends_at && new Date(r.discount_ends_at) <= now);
  const bhd = onSale ? d : p;
  return {
    price: Number.isFinite(bhd) && bhd > 0 ? Math.round(bhdToSar(bhd) * 100) / 100 : null,
    inStock: r.stock_unlimited === true || Math.floor(Number(r.stock_quantity)) > 0,
    onSale, active: r.is_active !== false && r.is_archived !== true,
  };
};

async function main() {
  const store = await prisma.store.findUnique({ where: { slug: 'cazasouq' }, select: { id: true, scrapeMode: true } });
  if (!store) throw new Error('لا متجر cazasouq');
  const offers = await prisma.componentOffer.findMany({
    where: { storeId: store.id, url: { not: null } },
    select: { id: true, url: true, price: true, inStock: true, lastCheckedAt: true, lastError: true, component: { select: { name: true } } },
    orderBy: { id: 'asc' },
  });
  const checked = offers.map((o) => o.lastCheckedAt?.getTime() ?? 0).filter(Boolean).sort((a, b) => a - b);
  console.log(`كازاسوق: scrapeMode=${store.scrapeMode} · ${offers.length} عرضاً بروابط · آخر فحصٍ بالوسيط بين ${new Date(checked[0]).toISOString()} و${new Date(checked[checked.length - 1]).toISOString()}`);
  console.log(`  وفي القاعدة بخطأ: ${offers.filter((o) => o.lastError).length} (منها «أُزيل» ${offers.filter((o) => o.lastError?.includes(GONE_MARK)).length})\n`);

  /* ---- ١ — المباشر لكلّ عرض ---- */
  const t0 = Date.now();
  const rows = await pool(offers, 6, async (o) => {
    const t: OfferTarget = { name: o.component.name, url: o.url, price: o.price, inStock: o.inStock };
    const f = await direct(o.url!);
    return { o, t, f, r: read(f, t) };
  });
  console.log(`المباشر: ${rows.length} طلباً في ${((Date.now() - t0) / 1000).toFixed(0)}ث (٦ متوازية)`);

  /* ---- ٣ — الواجهة البرمجيّة ---- */
  const slugs = [...new Set(rows.map((x) => slugOf(x.f.finalUrl)).filter(Boolean) as string[])];
  const api = await apiRows(slugs).catch((e) => { console.log('  ⚠️ الواجهة البرمجيّة: ' + e.message); return new Map(); });

  const res = rows.map(({ o, t, f, r }) => {
    const a = apiReading(api.get(slugOf(f.finalUrl) || ''));
    const dbErr = o.lastError ? (o.lastError.includes(GONE_MARK) ? 'gone' : 'err') : null;
    const vsDb = r.errors.length || r.gone ? null : r.inStock === o.inStock && samePrice(shown(r), o.price);
    const vsApi = a && !r.errors.length && !r.gone ? r.inStock === a.inStock && samePrice(shown(r), a.price) : null;
    return {
      id: o.id, name: o.component.name, url: o.url, finalUrl: f.finalUrl, redirected: f.finalUrl !== o.url,
      status: f.status, ms: f.ms, age: f.age, cacheStatus: f.cacheStatus,
      direct: { price: shown(r), held: r.heldPrice != null, inStock: r.inStock, gone: !!r.gone, errors: r.errors, recognized: !!r.pageRecognized },
      db: { price: o.price, inStock: o.inStock, lastCheckedAt: o.lastCheckedAt?.toISOString() ?? null, lastError: o.lastError },
      dbErr, api: a, vsDb, vsApi,
      ld: ldRaw(f.html),
      proxy: null as any,
    };
  });

  /* ---- ٤ — الوسيط: كلّ اختلاف + عيّنة ---- */
  if (PROXY_N > 0) {
    if (!TOKEN) throw new Error('لا SCRAPER_API_KEY');
    const odd = res.filter((x) => x.vsDb !== true || x.vsApi === false);
    const fine = res.filter((x) => x.vsDb === true && x.vsApi !== false).sort(() => Math.random() - 0.5).slice(0, PROXY_N);
    const pick = [...odd, ...fine];
    console.log(`الوسيط: ${pick.length} طلباً (${odd.length} مختلفاً أو خاطئاً + ${fine.length} عيّنة)…`);
    await pool(pick, 4, async (x) => {
      const o = offers.find((y) => y.id === x.id)!;
      const t: OfferTarget = { name: o.component.name, url: o.url, price: o.price, inStock: o.inStock };
      const f = await proxied(o.url!);
      const r = read(f, t);
      const ldP = ldRaw(f.html);
      x.proxy = {
        status: f.status, finalUrl: f.finalUrl, ms: f.ms, cost: f.cost,
        price: shown(r), inStock: r.inStock, gone: !!r.gone, errors: r.errors,
        sameReading: r.inStock === x.direct.inStock && samePrice(shown(r), x.direct.price) && !!r.gone === x.direct.gone && (r.errors.length > 0) === (x.direct.errors.length > 0),
        sameLd: JSON.stringify(ldP) === JSON.stringify(x.ld),
        sameFinalPath: (f.finalUrl?.split('?')[0] ?? null) === (x.finalUrl?.split('?')[0] ?? null),
      };
    });
  }

  /* ---- ٥ — إشارة «أُزيل» بلا رأس Resolved-Url ---- */
  const goneProbes = [
    { what: 'رابطٌ قديم الشكل لا وجود له', url: `${SITE}/amd-ryzen-9-7900x-processor-aa99999` },
    { what: 'رابطٌ جديد الشكل لا وجود له', url: `${SITE}/product/no-such-product-zz-2026?lang=ar` },
    ...res.filter((x) => x.direct.gone || x.dbErr === 'gone').slice(0, 5).map((x) => ({ what: `من القاعدة: ${x.name}`, url: x.url! })),
  ];
  const probe = [];
  for (const g of goneProbes) {
    const t: OfferTarget = { name: g.what, url: g.url, price: 1000, inStock: true };
    const fd = await direct(g.url);
    const rd = read(fd, t);
    let p: any = res.find((x) => x.url === g.url)?.proxy ?? null;   // جُلب بالوسيط في (٤)؟ لا يُدفع مرّتين
    if (PROXY_N > 0 && !p) { const fp = await proxied(g.url); const rp = read(fp, t); p = { status: fp.status, finalUrl: fp.finalUrl, gone: !!rp.gone, errors: rp.errors, cost: fp.cost }; }
    probe.push({ ...g, direct: { status: fd.status, finalUrl: fd.finalUrl, gone: !!rd.gone, errors: rd.errors }, proxy: p });
  }

  /* ---- الخلاصة ---- */
  const n = (f: (x: (typeof res)[number]) => boolean) => res.filter(f).length;
  const ms = res.map((x) => x.ms).sort((a, b) => a - b);
  const q = (p: number) => ms[Math.min(ms.length - 1, Math.floor(p * ms.length))];
  console.log(`\n—— المباشر ——`);
  console.log(`  الحالة: ${Object.entries(res.reduce((m: any, x) => ((m[x.status] = (m[x.status] || 0) + 1), m), {})).map(([k, v]) => `${k}×${v}`).join(' · ')} · حُوِّل: ${n((x) => x.redirected)}`);
  console.log(`  الزمن: وسيط ${q(0.5)}ms · ٩٠٪ ${q(0.9)}ms · أقصى ${ms[ms.length - 1]}ms`);
  console.log(`  مقروءة (pageRecognized): ${n((x) => x.direct.recognized)} · بخطأ: ${n((x) => x.direct.errors.length > 0 && !x.direct.gone)} · «أُزيل»: ${n((x) => x.direct.gone)} · معلّقة للمراجعة: ${n((x) => x.direct.held)}`);
  console.log(`—— مقابل آخر قراءةٍ بالوسيط (القاعدة) ——`);
  console.log(`  متطابق: ${n((x) => x.vsDb === true)} · مختلف: ${n((x) => x.vsDb === false)} · لا مقارنة (خطأ/أُزيل): ${n((x) => x.vsDb === null)}`);
  console.log(`—— مقابل الواجهة البرمجيّة (الحيّ) ——`);
  console.log(`  متطابق: ${n((x) => x.vsApi === true)} · مختلف: ${n((x) => x.vsApi === false)} · لا صفّ أو لا مقارنة: ${n((x) => x.vsApi === null)} · بخصمٍ ساري: ${n((x) => !!x.api?.onSale)}`);
  if (PROXY_N > 0) {
    const pr = res.filter((x) => x.proxy);
    console.log(`—— الوسيط الآن (${pr.length} صفحة، ${pr.reduce((s, x) => s + (Number(x.proxy.cost) || 0), 0)} وحدة) ——`);
    console.log(`  قراءةٌ واحدة: ${pr.filter((x) => x.proxy.sameReading).length}/${pr.length} · JSON-LD حرفاً: ${pr.filter((x) => x.proxy.sameLd).length}/${pr.length} · الرابط النهائيّ نفسه: ${pr.filter((x) => x.proxy.sameFinalPath).length}/${pr.length}`);
  }
  console.log(`\n—— ما اختلف أو أخطأ ——`);
  for (const x of res.filter((y) => y.vsDb !== true || y.vsApi === false || (y.proxy && !y.proxy.sameReading))) {
    const f = (p: number | null, s: boolean) => `${p ?? '—'}${s ? '' : ' نافد'}`;
    console.log(`• ${x.name}\n    مباشر ${f(x.direct.price, x.direct.inStock)}${x.direct.gone ? ' «أُزيل»' : ''}${x.direct.held ? ' (معلّق)' : ''} · القاعدة ${f(x.db.price, x.db.inStock)} (${x.db.lastCheckedAt?.slice(0, 16)})${x.api ? ` · الواجهة ${f(x.api.price, x.api.inStock)}` : ''}${x.proxy ? ` · الوسيط الآن ${f(x.proxy.price, x.proxy.inStock)}${x.proxy.gone ? ' «أُزيل»' : ''}` : ''}`);
    if (x.direct.errors.length) console.log(`    خطأ المباشر: ${x.direct.errors.join(' | ')}`);
    if (x.proxy?.errors?.length) console.log(`    خطأ الوسيط: ${x.proxy.errors.join(' | ')}`);
    if (x.db.lastError) console.log(`    خطأ القاعدة: ${x.db.lastError.slice(0, 160)}`);
    console.log(`    ${x.url}${x.redirected ? `\n    ← ${x.finalUrl}` : ''}`);
  }
  console.log(`\n—— إشارة «أُزيل» ——`);
  for (const p of probe) {
    console.log(`• ${p.what}: مباشر ${p.direct.status} ← ${p.direct.finalUrl} · gone=${p.direct.gone}${p.proxy ? ` | وسيط ${p.proxy.status} ← ${p.proxy.finalUrl} · gone=${p.proxy.gone}` : ''}`);
    console.log(`    ${p.direct.errors[0] ?? 'لا خطأ'}`);
  }
  if (OUT) { writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), res, probe }, null, 2)); console.log(`\nالتفاصيل في ${OUT}`); }
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
