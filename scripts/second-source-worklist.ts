/* ============ قائمة عمل: قطعٌ تحتاج شاهداً ثانياً ============
 *
 * القطع التي لها **مصدرٌ حيٌّ واحد ولا صفَّ متجرٍ آخر إطلاقاً** — أي التي
 * تحتاج بحثاً يدويّاً لا إصلاحاً. (أمّا التي لها صفٌّ خامد فتعود وحدها
 * حين يعود مخزون المتجر، ولا عملَ فيها.)
 *
 * والترتيب بالأثر لا بالعدد: قطعةٌ بأربعة آلاف ريال بمصدرٍ واحد تُضلّل
 * أكثر من عشرِ قطعٍ بمئتين. فالوزن = العدد × متوسط السعر.
 *
 * ⚠️ و«⚠ نون» تعني أن مصدرها الوحيد سعرٌ يدويّ لا يُحدَّث — أشدّها إلحاحاً.
 *
 * **يقرأ ولا يكتب.**
 *   npx tsx scripts/second-source-worklist.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { liveOffers } from '../lib/stores';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const Y='\x1b[33m',D='\x1b[2m',R='\x1b[31m',X='\x1b[0m';
async function main() {
  const all = await prisma.component.findMany({ include: { category: true, offers: { include: { store: true } } } });
  type Row = { cat: string; name: string; price: number; store: string; noon: boolean };
  const rows: Row[] = [];
  for (const c of all) {
    const live = liveOffers(c.offers as any);
    if (live.length !== 1) continue;
    const only = live[0] as any;
    if ((c.offers as any[]).length > 1) continue;   // له صفٌّ ثانٍ — ينتظر المخزون
    rows.push({ cat: c.category.name, name: `${c.brand} ${c.name}`, price: c.price, store: only.store.name, noon: only.store.slug === 'noon' });
  }
  const byCat: Record<string, Row[]> = {};
  rows.forEach(r => (byCat[r.cat] ||= []).push(r));
  const ranked = Object.entries(byCat).map(([cat, list]) => {
    const avg = list.reduce((s, r) => s + r.price, 0) / list.length;
    return { cat, n: list.length, avg, noon: list.filter(r=>r.noon).length, weight: list.length * avg, list };
  }).sort((a, b) => b.weight - a.weight);
  console.log(`\n${rows.length} قطعة تحتاج بحثاً عن مصدرٍ ثانٍ\n`);
  console.log('الفئة        | قطع | متوسط السعر | نون | الوزن');
  ranked.forEach(r => console.log(`${r.cat.padEnd(12)} | ${String(r.n).padStart(3)} | ${String(Math.round(r.avg)).padStart(10)} | ${String(r.noon).padStart(3)} | ${Math.round(r.weight).toLocaleString('en-US')}`));
  ranked.forEach(r => {
    console.log(`\n${Y}══ ${r.cat} — ${r.n} قطعة ══${X}`);
    r.list.sort((a,b)=>b.price-a.price).forEach(x =>
      console.log(`  ${String(Math.round(x.price)).padStart(6)} ﷼ | ${x.store.padEnd(9)}${x.noon?` ${R}⚠${X}`:'  '}| ${x.name}`));
  });
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
