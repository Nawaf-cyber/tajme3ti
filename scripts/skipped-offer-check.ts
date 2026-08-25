/* ============ المتجر الموقوف سحبه: هل يبقى منافساً؟ ============
 *
 * نون محجوب بـ Akamai — يُردّ حتى المتصفّح الحقيقيّ بـ«Access Denied»،
 * والوسيط ينجح مرّةً ويُحجب أخرى. فيُوقَف سحبه ويبقى سعره يدوياً.
 *
 * ⚠️ وهنا الفخّ: كان استعلاما الكرون و«تحديث قطعة» يستثنيان المتجر
 * الموقوف من **قائمة العروض** لا من الجلب وحده. فلو أُوقف نون لسقط من
 * حساب «أرخص سعر»، وارتفع السعر المعروض إلى المتجر التالي — بينما شارة
 * المتجر على البطاقة ما زالت تعرض سعر نون الأرخص. رقمان متناقضان.
 *
 * يشغّل `scrapeComponentOffers` + `resolveOfferPrices` بلا شبكة (كل
 * العروض `skipped`) على قطعٍ حقيقية، ويقارن الناتج بالمتوقّع.
 *
 * **يقرأ ولا يكتب.**
 *   npx tsx scripts/skipped-offer-check.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { scrapeComponentOffers, resolveOfferPrices, type OfferRow } from '../lib/scrape-offers';
import { SCRAPE_STORE_SELECT } from '../lib/stores-server';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G = '\x1b[32m', R = '\x1b[31m', D = '\x1b[2m', X = '\x1b[0m';

let pass = 0, fail = 0;
const check = (t: string, ok: boolean, d = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${t}`); } else { fail++; console.log(`  ${R}✘ ${t}${X}  ${d}`); }
};

/** يجعل كل متاجر القطعة موقوفةً — فلا شبكة تُلمَس في هذا الفحص */
const allOff = (offers: any[]): OfferRow[] =>
  offers.map((o) => ({ ...o, store: { ...o.store, scrapeMode: 'off' } }));

async function main() {
  /* قطعةٌ أرخصُ عروضها من نون — وهي الحالة التي كان الاستثناء يُفسدها */
  const comp = await prisma.component.findFirst({
    where: { name: 'LE240 V2' },
    include: { offers: { where: { store: { active: true } }, include: { store: { select: SCRAPE_STORE_SELECT } } } },
  });
  if (!comp) { console.error('⛔ لم تُوجد LE240 V2'); process.exit(1); }

  console.log(`\nالقطعة: ${comp.name} — السعر المخزّن ${comp.price} ﷼`);
  for (const o of comp.offers) {
    console.log(`   ${D}${o.store.name}: ${o.price} ﷼ · مخزون=${o.inStock} · خطأ=${o.lastError ? 'نعم' : 'لا'} · وضع=${o.store.scrapeMode}${X}`);
  }

  const cheapestLive = Math.min(
    ...comp.offers.filter((o) => o.inStock && (o.price ?? 0) > 0).map((o) => o.price!),
  );

  /* ١ — كلُّها موقوفة: لا شبكة، والسعر يبقى أرخصَ ما هو محفوظ */
  console.log('\n١) كل المتاجر موقوفة (لا شبكة تُلمَس)');
  const offComp = { ...comp, offers: allOff(comp.offers) };
  const scraped = await scrapeComponentOffers(offComp as any, 'TOKEN-غير-مستعمل');
  const resolved = resolveOfferPrices(offComp as any, scraped.results);

  check('لا خطأ من السحب', scraped.errors.length === 0, scraped.errors.join(' | '));
  check(
    `أرخص سعر = ${cheapestLive} (لا يسقط المتجر الموقوف)`,
    Math.abs(resolved.lowestPrice - cheapestLive) < 0.01,
    `= ${resolved.lowestPrice}`,
  );
  check('كل العروض ما زالت في السطور', resolved.lines.length === comp.offers.length);

  /* ٢ — لا وقتَ فحصٍ يُكتب على ما لم يُفحص */
  console.log('\n٢) ما لم يُفحَص لا يُكتب له وقت فحص');
  const wroteTime = resolved.offerUpdates.filter((u) => 'lastCheckedAt' in u.data).length;
  check('٠ عرضاً كُتب له lastCheckedAt', wroteTime === 0, `كُتب لـ${wroteTime}`);

  /* ٣ — لكنّ الخطأ القديم يُمسح */
  console.log('\n٣) الخطأ المعلّق يُمسح');
  const clears = resolved.offerUpdates.filter((u) => u.data.lastError === null).length;
  check('كل عرضٍ يُمسح خطؤه', clears === comp.offers.length, `${clears} من ${comp.offers.length}`);

  /* ٤ — العرض النافد لا يصير أرخص سعر */
  console.log('\n٤) النافد لا ينافس');
  const faked = allOff(comp.offers).map((o, i) => (i === 0 ? { ...o, price: 1, inStock: false } : o));
  const r2 = resolveOfferPrices({ ...comp, offers: faked } as any,
    (await scrapeComponentOffers({ ...comp, offers: faked } as any, 'X')).results);
  check('سعر ١ ﷼ نافد لا يُعتمد', r2.lowestPrice !== 1, `= ${r2.lowestPrice}`);

  console.log(`\n${'═'.repeat(46)}`);
  console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
  await prisma.$disconnect();
  if (fail) process.exit(1);
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
