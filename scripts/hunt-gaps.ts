/**
 * ============ صيدُ ما نقص — بالسعر والمخزون معاً ============
 *
 * `/admin/store-search` تبحث بكلمةٍ واحدة وتعرض النتائج بلا أسعار.
 * وهذا يسأل عدّة كلماتٍ دفعةً، ثمّ **يفتح صفحة كلّ مرشَّح** فيقرأ سعره
 * ومخزونه، ولا يطبع إلّا ما هو متوفّرٌ فعلاً وليس عندنا رابطُه.
 *
 * ⚠️ والمتجران مجّانيّان: مايكرولس وإنفيني آرك يستجيبان لطلبٍ من خادم.
 * فلا رصيد Scrape.do يُستهلك مهما طال البحث — وهذا سببُ اقتصاره عليهما.
 *
 * ⚠️ وسببُ قراءة كلّ صفحة: الجولة الأولى (2026-09-16) أعادت ستّة مرشّحين
 * «جاهزين»، فلمّا فُتحت صفحاتُهم كان **خمسةٌ منهم نافداً** — Burst Assassin
 * وArctic Freezer 36 CO وRyzen 7 5700X3D وRyzen 5 5600X. صفحةُ النتائج
 * لا تعرف المخزون، وقائمةُ مرشّحين نصفُها نافدٌ ليست قائمةَ عمل.
 *
 *   npx tsx scripts/hunt-gaps.ts "Arctic cooler" "Ryzen 5 5600"
 *   npx tsx scripts/hunt-gaps.ts --file queries.txt
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync } from 'node:fs';
import { searchStore, readProductPage } from '../lib/store-search';
import { isSystem, shortTitle, normUrl } from '../lib/discover';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G = '\x1b[32m', D = '\x1b[2m', X = '\x1b[0m';

/** المتاجر التي لا تكلّف رصيداً — وهي وحدها تُسأل هنا */
const FREE = ['microless', 'infiniarc'];

(async () => {
  const args = process.argv.slice(2);
  const fileArg = args.indexOf('--file');
  const queries = fileArg >= 0
    ? readFileSync(args[fileArg + 1], 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'))
    : args;
  if (!queries.length) { console.error('اكتب كلمةَ بحثٍ واحدةً على الأقل.'); process.exit(1); }

  const mine = new Set(
    (await prisma.componentOffer.findMany({ select: { url: true } })).map((o) => normUrl(o.url || '')),
  );

  const seen = new Set<string>();
  let hits = 0, read = 0;

  for (const q of queries) {
    for (const src of FREE) {
      let found: any[] = [];
      try { found = await searchStore(src, q, ''); } catch { /* متجرٌ لم يردّ — نكمل */ }

      for (const c of found.filter((x) => !isSystem(x.title)).slice(0, 14)) {
        const u = normUrl(c.url);
        if (!u || mine.has(u) || seen.has(u)) continue;
        seen.add(u);

        const p = await readProductPage(c.url);
        read++;
        if (p?.price && p.inStock) {
          hits++;
          console.log(`${G}${String(Math.round(p.price)).padStart(6)} ﷼${X} [${src.padEnd(9)}] ${shortTitle(c.title).padEnd(50)} ${D}${c.url}${X}`);
        }
        /* فاصلٌ يحفظ ماء الوجه مع متجرٍ يستضيفنا مجّاناً */
        await new Promise((r) => setTimeout(r, 450));
      }
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`${queries.length} كلمة · ${read} صفحةً قُرئت · ${hits} متوفّرةً وليست عندنا`);
  await prisma.$disconnect();
})();
