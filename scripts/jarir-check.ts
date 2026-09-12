/* فحصُ محرّك جرير — على روابطَ حقيقيّة، بلا قاعدةٍ وبلا رصيد.
 *   npx tsx scripts/jarir-check.ts
 */
import 'dotenv/config';
import { scrapeJarir } from '../lib/scrape-prices';

const CASES: Array<[string, string]> = [
  ['كرت PNY RTX 5070', 'https://www.jarir.com/sa-en/pny-technologies-geforce-rtx-5070-argb-graphics-card-652116.html'],
  ['كرت PNY RTX 5080', 'https://www.jarir.com/sa-en/pny-technologies-geforce-rtx-5080-graphics-card-652070.html'],
  ['رابطٌ بلا رمز',    'https://www.jarir.com/sa-en/computer-peripherals.html'],
  ['رمزٌ لا وجود له',  'https://www.jarir.com/sa-en/ghost-product-999999.html'],
];

(async () => {
  let bad = 0;
  for (const [label, url] of CASES) {
    const r = await scrapeJarir({ name: label, url, price: null, inStock: true } as any, '');
    const ok = /بلا رمز|لا وجود/.test(label) ? r.errors.length > 0 : (r.price ?? 0) > 0 || r.inStock === false;
    if (!ok) bad++;
    console.log((ok ? '✔' : '✗') + ' ' + label.padEnd(18)
      + 'سعر ' + String(r.price ?? '—').padStart(8)
      + ' · ' + (r.inStock ? 'متوفّر' : 'نفد')
      + (r.errors.length ? '  ⟵ ' + r.errors[0].slice(0, 70) : ''));
  }
  console.log(bad === 0 ? '\nنجحت ' + CASES.length : '\nفشل ' + bad);
  process.exit(bad ? 1 : 0);
})();
