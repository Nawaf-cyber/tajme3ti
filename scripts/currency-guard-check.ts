/* ============ فحص حارس العملة ============
 *
 * يشغّل `scrapeGeneric` على صفحاتٍ حقيقية ويقارن الحكم:
 *   • نون (يُعلن SAR)          ⇒ يمرّ كما كان
 *   • كازاسوق عبر المسار العامّ ⇒ يُعلن BHD ⇒ يُرفض بدل أن يُحفظ ÷١٠
 *
 * ⚠️ وكازاسوق في الإنتاج **لا يمرّ** بهذا المسار — له ساحبٌ مخصّص يعالج
 * الدينار بضربه في ١٠. فاستعماله هنا محاكاةٌ لمتجرٍ يضيفه الأدمن ويقع في
 * الفخّ نفسه، لأنه أصدق من صفحةٍ مصنوعة.
 *
 *   npx tsx scripts/currency-guard-check.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { scrapeGeneric } from '../lib/scrape-generic';
import { SCRAPE_STORE_SELECT } from '../lib/stores-server';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G = '\x1b[32m', R = '\x1b[31m', X = '\x1b[0m';
let pass = 0, fail = 0;
const check = (t: string, ok: boolean, d = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${t}`); } else { fail++; console.log(`  ${R}✘ ${t}${X} ${d}`); }
};

async function main() {
  const token = process.env.SCRAPER_API_KEY!;
  const stores = await prisma.store.findMany({ select: SCRAPE_STORE_SELECT });

  for (const slug of ['noon', 'cazasouq']) {
    const s = stores.find((x) => x.slug === slug)!;
    const o = await prisma.componentOffer.findFirst({ where: { storeId: s.id, price: { gt: 0 } }, select: { url: true } });
    if (!o) { console.log(`\n${slug}: لا عرض`); continue; }

    const r = await scrapeGeneric(s as any, o.url, token);
    console.log(`\n${slug} — currencyFound=${JSON.stringify(r.currencyFound)}  price=${r.price}`);

    if (slug === 'noon') {
      check('SAR تمرّ كما كانت', r.price != null && r.price > 0, `price=${r.price}`);
      check('بلا خطأ عملة', !r.errors.some((e) => e.includes('العملة')), r.errors.join(' | '));
    } else {
      check('BHD تُرفض ولا تُحفظ', r.price === null, `price=${r.price}`);
      check('السبب مذكورٌ بالعملة', r.errors.some((e) => e.includes('BHD')), r.errors.join(' | '));
      const msg = r.errors.find((e) => e.includes('العملة'));
      if (msg) console.log(`      ${msg}`);
    }
  }

  console.log(`\n${'═'.repeat(40)}`);
  console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
  await prisma.$disconnect();
  if (fail) process.exit(1);
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
