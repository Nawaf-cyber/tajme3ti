/* فحصُ الاكتشاف على المتجر الحقيقيّ — مجّانيّ (مايكرولس/إنفيني آرك بلا وسيط).
 *   npx tsx scripts/discover-check.ts [الفئة] [المتجر]
 */
import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { searchStore, adapterFor, maxItemsIn } from '../lib/store-search';
import { seedQueries, unknownOnly, normUrl, isSystem, type Known } from '../lib/discover';

const CAT = process.argv[2] || 'GPU';
const SRC = process.argv[3] || 'microless';

(async () => {
  const comps = await prisma.component.findMany({
    select: { id: true, brand: true, name: true, category: { select: { name: true } }, offers: { select: { url: true } } },
  });
  const known: Known[] = comps.map((c) => ({
    id: c.id, brand: c.brand, name: c.name, categoryName: c.category.name,
    offerUrls: c.offers.map((o) => o.url).filter(Boolean) as string[],
  }));

  const cap = maxItemsIn(SRC, 60000);
  const seeds = seedQueries(known, CAT).slice(0, cap);
  console.log('الفئة ' + CAT + ' · المتجر ' + SRC + ' · السقف ' + cap + ' · عائلات: ' + seeds.length);
  console.log('  ' + seeds.slice(0, 8).join(' | ') + (seeds.length > 8 ? ' …' : ''));

  const ad = adapterFor(SRC)!;
  const hits: any[] = [];
  let failed = 0, sys = 0;
  for (const q of seeds) {
    try { for (const c of await searchStore(SRC, q, '')) { if (isSystem(c.title)) { sys++; continue; } hits.push({ ...c, query: q }); } }
    catch { failed++; }
    await new Promise((r) => setTimeout(r, ad.delayMs));
  }
  const fresh = unknownOnly(hits, known);
  console.log('\nنتائج: ' + hits.length + ' · أجهزةٌ جاهزة استُبعدت: ' + sys + ' · فشل: ' + failed + ' · ليست عندنا: ' + fresh.length);
  for (const f of fresh.slice(0, 12)) console.log('  • ' + f.title.slice(0, 78) + '\n      ' + normUrl(f.url).slice(0, 90));
  await prisma.$disconnect();
})();
