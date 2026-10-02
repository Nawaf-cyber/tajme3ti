/**
 * ============ تحديثُ أسعار نون يدوياً ============
 *
 *   npx tsx scripts/noon-refresh.ts           # عرض
 *   npx tsx scripts/noon-refresh.ts --apply   # تنفيذ
 *
 * نون `scrapeMode: 'off'` لأنّ Akamai يحجب كلَّ طلبٍ لا يأتي من متصفّحٍ
 * حقيقيّ: بلا وسيط 403 من `errors.edgesuite.net`، وScrape.do يُحجب،
 * والمميّز ينقطع. فأسعارُه تُكتب بيدٍ — **وتشيخ**، وزرُّ 🔄 في اللوحة لا
 * يلمسها (لا شيء يُسحب).
 *
 * ⚠️ وشيخوختُها مقيسة مرّتين:
 *   · 2026-09-22، بعد ٢٩ يوماً: من ثمانٍ ٤ مطابقة · ٢ نافدة نعرضها متوفّرة
 *     · ٢ سعرُها خاطئ (PNY 5070 Ti عندنا ٤٬٣٩٩ وعند نون ٦٬٢٠١).
 *   · 2026-09-24، بعد يومين فقط: من ١٩ تغيّرت **٧** — BX500 من ٧٥١ إلى
 *     ١٬٢٨٠، وRTX 5070 من ٣٬٦٩٩ إلى ٤٬٣٤٩، ونفد اثنان.
 * فالسعر اليدويّ من نون لا يصمد أسبوعاً. والعلاج الدائم متجرٌ ثانٍ يُسحب
 * آلياً لكلّ قطعة؛ وهذا السكربت جسرٌ إلى ذلك لا بديل عنه.
 *
 * ============ كيف تُقرأ ============
 *
 * ⚠️ **المتصفّح وحده يفتح نون** — لا `curl` ولا `fetch` من سكربت، ولا
 * `fetch` من داخل صفحة نون نفسها (يعود بلا JSON-LD: الموقع يُصيّره في
 * المتصفّح). فافتح كلّ رابطٍ في تبويبٍ حقيقيّ، ثمّ نفّذ في وحدة التحكّم:
 *
 *   const b = [...document.querySelectorAll('script[type="application/ld+json"]')]
 *     .map(s => { try { return JSON.parse(s.textContent) } catch { return null } })
 *     .filter(Boolean).flatMap(j => j['@graph'] ?? (Array.isArray(j) ? j : [j]));
 *   const p = b.find(x => String(x?.['@type']).includes('Product'));
 *   const o = Array.isArray(p?.offers) ? p.offers[0] : p?.offers;
 *   ({ price: o?.price, avail: String(o?.availability).split('/').pop() })
 *
 * و`price: 0` مع `OutOfStock` تعني نافداً — لا سعراً صفراً.
 *
 * ⚠️ ولماذا TypeScript لا `.mjs` كما كان: النسخة السابقة لم تستطع استيراد
 * `lib/` فكرّرت شرط «العرض الحيّ» بيدها، ولم تكتب تاريخ السعر، ولم تكتب
 * وقت الفحص للسعر المطابق — فبقيت قطعٌ مؤكَّدةٌ قبل يومين تُعرض «قبل ٣١
 * يوماً». الآن المنطق منطقُ الموقع نفسه.
 */
import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { cheapestOffer } from '../lib/stores';
import { recordPriceHistory, round2 } from '../lib/scrape-prices';

const apply = process.argv.includes('--apply');

/** [اسم القطعة كما في الكتالوج، السعر المقروء أو null إن نفد] — قُرئت 2026-09-24،
 *  وأُعيدت قراءتها كلّها 2026-09-30 فطابقت (١٦ متوفّرة بسعرها، ٣ نافدة)،
 *  ثمّ 2026-10-02: تغيّر اثنان — LE240 V2 عاد متوفّراً بـ290، وLE360 V2 من ٣٤٦ إلى ٣٣٥ */
const READINGS: [string, number | null][] = [
  ['FOCUS 650 Gold SSR-650FM', 810],
  ['GeForce RTX 5060 Ti WINDFORCE 16G', 4468],
  ['GeForce RTX 5070 Ti 16GB OC Triple Fan Plus', 6201],
  ['NM790 2TB', 1620],
  ['P310 2TB', 1340],
  ['LE360 V2', 335],
  ['LE240 V2', 290],
  ['Radeon RX 9070 XT OC', null],
  ['TR-KG650W 650W Gold White', null],
  ['LE360 V2 White', 379],
  ['LT240 ARGB White', 502],
  ['LT360 ARGB White', 580],
  ['PRIME H610M-K D4', 402],
  ['GeForce RTX 5070 12GB', 4349],
  ['GeForce RTX 5070 Ti 16GB', null],
  ['B850 GAMING PLUS WiFi', 1005],
  ['BX500 1TB SATA', 1280],
  ['AG300', 89],
  ['LE240 V2 White', 323],
];

(async () => {
  const noon = await prisma.store.findFirst({ where: { slug: 'noon' }, select: { id: true } });
  if (!noon) throw new Error('لا متجر نون');

  let changed = 0;
  const touched: string[] = [];

  for (const [name, price] of READINGS) {
    const comp = await prisma.component.findFirst({ where: { name }, select: { id: true, name: true } });
    if (!comp) { console.log(`⛔ لم أجد «${name}»`); continue; }

    const offer = await prisma.componentOffer.findFirst({
      where: { componentId: comp.id, storeId: noon.id },
      select: { id: true, price: true, inStock: true },
    });
    if (!offer) { console.log(`⛔ لا عرضَ نون لـ«${name}»`); continue; }

    const inStock = price != null;
    const nextPrice = price ?? offer.price; // النافد يحتفظ بآخر سعرٍ عُرف، ولا يُعرض
    const same = offer.inStock === inStock && offer.price === nextPrice;
    if (!same) changed++;
    touched.push(comp.id);

    const was = `${offer.price}${offer.inStock ? '' : ' نافد'}`;
    console.log(same
      ? `  ✓ ${comp.name} — كما هي (${was})`
      : `  ${apply ? '✔' : '·'} ${comp.name}: ${was} → ${price == null ? 'نافد' : price}`);

    if (!apply) continue;

    /* ⚠️ والمطابقُ يُكتب وقتُ فحصه أيضاً: القراءة تأكيد، وبدونه تبقى الشارة
       «قبل ٣١ يوماً» على سعرٍ قُرئ اليوم. */
    await prisma.componentOffer.update({
      where: { id: offer.id },
      data: { price: nextPrice, inStock, lastCheckedAt: new Date(), lastError: null },
    });
    /* وتاريخُ السعر كما يكتبه الكرون: بدونه يبدو سعرُ نون في كلّ تدقيقٍ
       «لم يُقرأ منذ شهر» مهما حُدّث */
    if (price != null) await recordPriceHistory(prisma, comp.id, [{ store: 'noon', price }]);
  }

  /* ⚠️ والسعر المعروض يُشتقّ من العروض — يُعاد حسابه لكلّ قطعةٍ لُمست،
     وإلّا بقي عمود `price` يحمل سعر عرضٍ صار نافداً. */
  if (apply) {
    for (const id of touched) {
      const c = await prisma.component.findUnique({ where: { id }, include: { offers: { include: { store: true } } } });
      if (!c) continue;
      const best = cheapestOffer(c.offers as any);
      const next = best ? round2(best.price!) : c.price;
      if (next !== c.price) {
        await prisma.component.update({ where: { id }, data: { price: next } });
        console.log(`    ↳ ${c.name}: السعر المعروض ${c.price} → ${next} (${best?.store.slug ?? '—'})`);
      }
    }
  }

  console.log(`\n${changed} تغيّراً من ${READINGS.length}${apply ? '' : ' (عرضٌ فقط — أضف --apply)'}`);
  await prisma.$disconnect();
})();
