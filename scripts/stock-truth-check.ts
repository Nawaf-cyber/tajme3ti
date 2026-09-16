/* ============ هل نصدّق المتجر حين يكذب؟ ============
 *
 * كلّ حالةٍ هنا مقيسةٌ على صفحةٍ حقيقيّة يوم 2026-09-16، لا مفترضة.
 *
 *   npx tsx scripts/stock-truth-check.ts
 */
import { correctStock } from '../lib/stock-truth';
const G = '\x1b[32m', R = '\x1b[31m', X = '\x1b[0m';
let pass = 0, fail = 0;
const t = (ok: boolean, title: string) => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${title}`); }
  else { fail++; console.log(`  ${R}✘ ${title}${X}`); }
};

const IA = 'https://www.infiniarc.com/shop/cooler/x-11970';
const ML = 'https://saudi.microless.com/product/x/';

/* زرّ الشراء المعطَّل — الشكل الحرفيّ كما ورد في صفحة Burst Assassin */
const SOLD_OUT_BTN =
  '<a href="#" class="btn btn-buy-primary disabled" aria-disabled="true" role="button" tabindex="-1">Out of Stock</a>';
const BUY_BTN = '<a href="#" class="btn btn-buy-primary" role="button">Add to Cart</a>';

/* ⚠️ الصفحة نفسها تُعلن InStock في JSON-LD — وهذا سبب وجود الملفّ كلّه */
const LD_IN_STOCK = '<script type="application/ld+json">{"availability":"https://schema.org/InStock"}</script>';

console.log('\nالحالات:');
t(correctStock(IA, LD_IN_STOCK + SOLD_OUT_BTN, true) === false,
  'إنفيني آرك: زرّ معطَّل يغلب JSON-LD الكاذب');
t(correctStock(IA, LD_IN_STOCK + BUY_BTN, true) === true,
  'إنفيني آرك: زرٌّ سليم يبقى متوفّراً');

/* ⚠️ أسفل صفحاتهم «منتجاتٌ مشابهة»، وقد يكون فيها النافد. فالبحث الحرّ عن
   العبارة يُدين الصفحة بمخزون جارتها — ولذلك نلتزم بزرّ الشراء وحده. */
t(correctStock(IA, BUY_BTN + '<div class="related">Out of Stock</div>', true) === true,
  'إنفيني آرك: «نافد» في المنتجات المشابهة لا يُدين الصفحة');

t(correctStock(ML, SOLD_OUT_BTN, true) === true,
  'مايكرولس: لا يُطبَّق عليه — بيانه المُهيكل سليم');
t(correctStock(IA, BUY_BTN, false) === false,
  'لا يُنعش نافداً: الدالة تُضيّق ولا تُوسّع');
t(correctStock('ليس رابطاً', SOLD_OUT_BTN, true) === true,
  'رابطٌ معطوب يُعيد الحكم كما هو بلا انهيار');

console.log(`\n${'═'.repeat(46)}`);
console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
if (fail) process.exit(1);
