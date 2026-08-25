/* ============ البحث عن شاهدٍ ثانٍ — من الطرفية ============
 *
 * نفس منطق صفحة `/admin/find-sources` بالحرف: المطابقة في
 * `lib/source-match.ts` والبحث في `lib/store-search.ts`. لا نسخةَ ثانية
 * هنا — نسختان تعنيان عيباً يُصلَح في واحدة ويعيش في الأخرى.
 *
 * والفرق الوحيد أن هذا يُشغَّل على دفعةٍ كبيرة بلا متصفّح، والصفحة
 * تُشغَّل بضغطةٍ وتُراجَع سطراً سطراً.
 *
 *   npx tsx scripts/find-second-source.ts                 كل الفئات، مايكرولس
 *   npx tsx scripts/find-second-source.ts RAM             فئة بعينها
 *   npx tsx scripts/find-second-source.ts RAM --apply
 *   npx tsx scripts/find-second-source.ts GPU --cazasouq  ⚠ يستهلك رصيداً
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { liveOffers } from '../lib/stores';
import { fingerprint, pick } from '../lib/source-match';
import { searchStore, type SearchSource } from '../lib/store-search';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const ARGS = process.argv.slice(2);
const APPLY = ARGS.includes('--apply');
const SOURCE: SearchSource = ARGS.includes('--cazasouq') ? 'cazasouq' : 'microless';
const ONLY = ARGS.find((a) => !a.startsWith('--')) || null;
const G = '\x1b[32m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const parseSpecs = (s: any) => (typeof s === 'string' ? JSON.parse(s) : (s as any) || {});

async function main() {
  const token = process.env.SCRAPER_API_KEY || '';
  if (SOURCE === 'cazasouq' && !token) { console.error('⛔ كازاسوق يحتاج SCRAPER_API_KEY'); process.exit(1); }

  const all = await prisma.component.findMany({
    where: ONLY ? { category: { name: ONLY } } : {},
    include: { category: true, offers: { include: { store: true } } },
    orderBy: { price: 'desc' },
  });

  /* مصدرٌ حيٌّ واحد، ولا صفَّ في المتجر المقصود */
  const need = all
    .filter((c) => liveOffers(c.offers as any).length === 1)
    .filter((c) => !c.offers.some((o) => o.store.slug === SOURCE));

  console.log(`\n${need.length} قطعة تحتاج شاهداً ثانياً${ONLY ? ` في ${ONLY}` : ''}`);
  console.log(`${D}المتجر: ${SOURCE}${SOURCE === 'cazasouq' ? ' — عبر Scrape.do، طلبٌ لكل قطعة' : ' — مباشر بلا رصيد'}${X}\n`);

  const store = await prisma.store.findFirst({ where: { slug: SOURCE }, select: { id: true } });
  if (!store) { console.error(`⛔ متجر ${SOURCE} غير موجود`); process.exit(1); }

  let found = 0, none = 0, added = 0;

  for (const c of need) {
    const fp = fingerprint(c.brand, c.name, parseSpecs(c.specs));
    const cands = await searchStore(SOURCE, fp.query, token);
    await sleep(SOURCE === 'microless' ? 700 : 1200);

    const { hit, nearest } = pick(fp, cands);
    if (!hit) {
      none++;
      console.log(`  ${D}—${X} ${c.brand} ${c.name}  ${D}(«${fp.query}» · ${cands.length} مرشّحاً)${X}`);
      if (nearest) console.log(`      ${D}أقربها: ${nearest.slice(0, 78)}${X}`);
      continue;
    }

    found++;
    console.log(`  ${G}✔${X} ${c.brand} ${c.name}`);
    console.log(`      ${hit.title.slice(0, 92)}`);
    console.log(`      ${D}${hit.url.slice(0, 96)}${X}`);

    if (APPLY) {
      const taken = await prisma.componentOffer.findFirst({
        where: { url: hit.url }, select: { component: { select: { name: true } } },
      });
      if (taken) { console.log(`      ${Y}⚠ الرابط مستعمل لـ«${taken.component.name}» — لا يُكتب${X}`); continue; }
      await prisma.componentOffer.create({
        data: { componentId: c.id, storeId: store.id, url: hit.url, inStock: true },
      });
      added++;
      console.log(`      ${G}✚ أُضيف — السعر يملؤه السحب القادم${X}`);
    }
  }

  console.log(`\n${'─'.repeat(56)}`);
  console.log(`مطابق: ${found} · بلا مطابق: ${none}${APPLY ? ` · أُضيف: ${added}` : ''}`);
  if (!APPLY && found) console.log(`${D}أضف --apply للكتابة، أو راجعها في /admin/find-sources.${X}`);

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
