/* فحصُ محرّك جرير — على روابطَ حقيقيّة، بلا قاعدة.
 *
 *   npx tsx scripts/jarir-check.ts            # المحرّك كما يعمل في الكرون (العاديّ ثمّ المتقدّم احتياطاً)
 *   npx tsx scripts/jarir-check.ts --channels # يقيس كلّ طريقٍ وحده: مباشر · Scrape.do عاديّ · متقدّم
 *
 * يحتاج SCRAPER_API_KEY (منذ 2026-11-14 جرير خلف Cloudflare — الطلب المباشر ٤٠٣). لا يطبع المفتاح.
 * و--channels يكلّف نحو ٥ × (١ + ١٠) = ٥٥ وحدة للمسار وحده؛ والوضع العاديّ ~١٠ إن نجح العاديّ.
 *
 * المرجع (قراءة متصفّحٍ حقيقيّ 2026-11-17 من المسارين نفسيهما):
 *   652116 ‏3749 متوفّر · 624046 ‏1099 نفد · 631428 ‏1249 نفد · 649830 ‏649 متوفّر · 633685 ‏1099 متوفّر
 */
import 'dotenv/config';
import { scrapeJarir, takeCreditTally } from '../lib/scrape-prices';
import { takeProxyTally } from '../lib/proxy-fallback';

const TOKEN = process.env.SCRAPER_API_KEY || '';

const CASES: Array<[string, string, number | null, boolean | null]> = [
  ['PNY RTX 5070',      'https://www.jarir.com/sa-en/pny-technologies-geforce-rtx-5070-argb-graphics-card-652116.html', 3749, true],
  ['WD SN850P 1TB',     'https://www.jarir.com/sa-en/wd-sn850p-nvme-other-gaming-accessories-624046.html', 1099, false],
  ['990 PRO 1TB HS',    'https://www.jarir.com/sa-en/samsung-990-pro-with-heatsink-other-gaming-accessories-631428.html', 1249, false],
  ['PNY CS900 1TB',     'https://www.jarir.com/sa-en/pny-technologies-cs900-hard-disk-solid-state-drives-649830.html', 649, true],
  ['O11 Dynamic EVO XL', 'https://www.jarir.com/sa-en/lian-li-xl-other-gaming-accessories-633685.html', 1099, true],
  ['رابطٌ بلا رمز',      'https://www.jarir.com/sa-en/computer-peripherals.html', null, null],
];

const skuOf = (u: string) => /-(\d{6,8})\.html/.exec(u)?.[1];

/** طريقٌ واحد على مسار المنتج: الحالة والزمن والكلفة وهل خرج JSON بالرمز نفسه */
async function probe(url: string, how: 'direct' | 'normal' | 'super') {
  const sku = skuOf(url)!;
  const api = `https://www.jarir.com/api/catalogv2/product/store/sa-en/sku/${sku}/visibilityAll/true/size/1`;
  const target = how === 'direct' ? api
    : `https://api.scrape.do/?token=${TOKEN}&url=${encodeURIComponent(api)}${how === 'super' ? '&super=true' : ''}`;
  const t0 = Date.now();
  try {
    const res = await fetch(target, { cache: 'no-store', signal: AbortSignal.timeout(60000) });
    const text = await res.text();
    let price: number | null = null, ok = false;
    try { const s = JSON.parse(text)?.data?.hits?.hits?.[0]?._source; ok = String(s?.sku) === sku; price = s?.final_price ?? null; } catch { /* ليس JSON */ }
    return `${how.padEnd(6)} ${res.status} ${String(Date.now() - t0).padStart(6)}ms كلفة=${res.headers.get('scrape.do-request-cost') ?? '-'} ${ok ? `JSON ✔ ${price}` : `✗ ${res.headers.get('cf-mitigated') ? 'cf-challenge ' : ''}${text.slice(0, 40).replace(/\s+/g, ' ')}`}`;
  } catch (e: any) {
    return `${how.padEnd(6)} خطأ ${e?.name || e}`;
  }
}

(async () => {
  if (!TOKEN) { console.error('⛔ SCRAPER_API_KEY غير مضبوط'); process.exit(1); }

  if (process.argv.includes('--channels')) {
    for (const [label, url] of CASES) {
      if (!skuOf(url)) continue;
      console.log(`\n${label}`);
      for (const how of ['direct', 'normal', 'super'] as const) console.log('  ' + await probe(url, how));
    }
    return;
  }

  let bad = 0;
  for (const [label, url, wantPrice, wantStock] of CASES) {
    const r = await scrapeJarir({ name: label, url, price: wantPrice, inStock: true }, TOKEN);
    const ok = wantPrice == null
      ? r.errors.length > 0
      : r.errors.length === 0 && (r.price === wantPrice || r.price == null) && r.inStock === wantStock;
    if (!ok) bad++;
    console.log((ok ? '✔' : '✗') + ' ' + label.padEnd(20)
      + 'سعر ' + String(r.price ?? '—').padStart(8)
      + ' · ' + (r.inStock ? 'متوفّر' : 'نفد')
      + (r.errors.length ? '  ⟵ ' + r.errors[0].slice(0, 80) : ''));
  }
  console.log('\nالطرق:', JSON.stringify(takeProxyTally().counts.jarir ?? {}));
  console.log('الرصيد:', JSON.stringify(takeCreditTally()));
  console.log(bad === 0 ? `نجحت ${CASES.length}` : `فشل ${bad} (والأسعار قد تتغيّر عن المرجع — قارن بالمتصفّح)`);
  process.exit(bad ? 1 : 0);
})();
