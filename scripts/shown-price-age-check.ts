/* ============ هل تعرف الإدارةُ عمرَ السعر الذي يراه الزائر؟ ============
 *
 * ⚠️ وقع التعارض فعلاً يوم 2026-09-21: صفحة «RTX 5070 Ti 16GB» تقول
 * «قبل ٢٨ يوماً» ولوحةُ الإدارة تقول «قبل دقائق» — وكلاهما صادق. الكرون
 * مرّ وفحص ثلاثة متاجر، والسعر المعروض من **نون** وهو `scrapeMode: off`.
 *
 * فالرقمان سؤالان: «هل وصلها الكرون؟» و«كم عمر ما يراه الزائر؟». وهذا
 * الفحص يحرس الثاني — وهو الذي كانت اللوحة تخفيه.
 *
 *   npx tsx scripts/shown-price-age-check.ts
 */
import { isStale, shownPriceAge } from '../app/admin/ScrapeStatusBadge';

const G = '\x1b[32m', R = '\x1b[31m', X = '\x1b[0m';
let pass = 0, fail = 0;
const t = (ok: boolean, title: string, detail = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${title}`); }
  else { fail++; console.log(`  ${R}✘ ${title}${X} ${detail}`); }
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000);
const store = (name: string, sortOrder = 1) => ({ name, sortOrder, slug: name });

/* العرضُ الفائز يُنتقى بالسعر ثمّ ترتيب المتجر — فالشكل هنا كامل */
const offer = (name: string, price: number | null, checkedH: number, inStock = true) => ({
  id: name, storeId: name, url: `https://x/${name}`, affiliateUrl: null,
  price, listPrice: null, inStock, lastCheckedAt: hoursAgo(checkedH), store: store(name),
});

console.log('\nالحالة التي وقعت:');
{
  /* نون ٥٢٤٩ منذ ٢٨ يوماً (أرخص متوفّر) · أمازون ٥٨٠٠ منذ ساعة ·
     مايكرولس وكازاسوق نافدان — وهي بيانات القطعة الحقيقيّة. */
  const comp = {
    lastScrapedAt: hoursAgo(0.2),
    offers: [
      offer('مايكرولس', null, 0.2, false),
      offer('كازاسوق', 3950, 0.2, false),
      offer('نون', 5249, 676),
      offer('أمازون', 5800, 0.2),
    ],
  };
  const age = shownPriceAge(comp);
  t(age != null && Math.round(age) === 676, 'عمرُ السعر المعروض ٦٧٦ ساعة لا صفراً', String(age));
  t(isStale(comp), 'ويُعدّ «متأخّراً» رغم أنّ الكرون مرّ قبل دقائق');
}

console.log('\nولا يُنذَر بلا سبب:');
{
  /* قطعةٌ كلُّ عروضها حيّةٌ وحديثة */
  const comp = {
    lastScrapedAt: hoursAgo(1),
    offers: [offer('مايكرولس', 900, 1), offer('أمازون', 1100, 1)],
  };
  t(!isStale(comp), 'قطعةٌ أسعارُها كلُّها طازجة ليست متأخّرة');
  t(Math.round(shownPriceAge(comp)!) === 1, 'وعمرُ سعرها ساعةٌ واحدة');
}
{
  /* ⚠️ والنافد لا يُحتسب: العرضُ الفائز هو الأرخص **المتوفّر**، فسعرٌ
     نافدٌ قديمٌ لا يجعل القطعة متأخّرة ما دام المعروض حديثاً. */
  const comp = {
    lastScrapedAt: hoursAgo(1),
    offers: [offer('كازاسوق', 500, 900, false), offer('أمازون', 1100, 1)],
  };
  t(!isStale(comp), 'عرضٌ نافدٌ قديم لا يُدين القطعة — الفائز حديث');
}
{
  /* ولم تُفحص إطلاقاً */
  t(isStale({ lastScrapedAt: null, offers: [] }), 'قطعةٌ لم تُفحص قطُّ متأخّرة');
}
{
  /* والكرون لم يمرّ منذ يومين — الحالة القديمة، وتبقى */
  const comp = { lastScrapedAt: hoursAgo(50), offers: [offer('أمازون', 1100, 50)] };
  t(isStale(comp), 'ومن لم يمرّ عليها الكرون منذ يومين متأخّرة كما كانت');
}

console.log(`\n${'═'.repeat(50)}`);
console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
if (fail) process.exit(1);
