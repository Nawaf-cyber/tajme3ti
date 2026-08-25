/* ============ ماذا يُضاف، وما الذي يسبقه؟ ============
 *
 * تقريرٌ **يقرأ ولا يكتب**. يُخرج ثلاث قوائم عمل مرتّبة بالأثر:
 *   ١) قطعٌ سعرها بلا شاهد ثانٍ — أعلى عائد لأقلّ عمل
 *   ٢) قطعٌ بلا عرضٍ حيّ إطلاقاً — تظهر للزائر ولا تُشترى
 *   ٣) قطعٌ سعرها المعروض أعلى بكثير من سعرٍ نعرفه — تُفسد التوصيات
 *
 *   npx tsx scripts/catalog-gaps.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { liveOffers } from '../lib/stores';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G='\x1b[32m',R='\x1b[31m',Y='\x1b[33m',D='\x1b[2m',X='\x1b[0m';

async function main() {
  const all = await prisma.component.findMany({ include: { category: true, offers: { include: { store: true } } }, orderBy: { price: 'desc' } });

  console.log(`\n${Y}════ ١) مصدرٌ حيٌّ واحد — مرتّبة بالسعر (الأغلى يضلّل أكثر) ════${X}`);
  const single = all.filter(c => liveOffers(c.offers as any).length === 1);
  const byCat: Record<string, any[]> = {};
  single.forEach(c => (byCat[c.category.name] ||= []).push(c));
  for (const [cat, list] of Object.entries(byCat).sort((a,b)=>b[1].length-a[1].length)) {
    console.log(`\n${cat} — ${list.length} قطعة`);
    list.slice(0, 40).forEach(c => {
      const o = liveOffers(c.offers as any)[0] as any;
      const others = (c.offers as any[]).filter(x => x !== o).map(x => x.store.name).join('، ');
      console.log(`   ${String(Math.round(c.price)).padStart(6)} ﷼ | ${o.store.name.padEnd(9)} | ${c.brand} ${c.name}${others ? `  ${D}(له صفّ عند: ${others})${X}` : ''}`);
    });
  }

  console.log(`\n${Y}════ ٢) بلا عرضٍ حيّ — تُعرض ولا تُشترى ════${X}`);
  const dead = all.filter(c => liveOffers(c.offers as any).length === 0);
  dead.forEach(c => {
    const st = (c.offers as any[]).map(o => `${o.store.name}:${o.price ?? '—'}${o.inStock===false?'(نافد)':''}`).join(' · ');
    console.log(`   ${String(Math.round(c.price)).padStart(6)} ﷼ | [${c.category.name}] ${c.name}  ${D}${st || 'لا عروض'}${X}`);
  });

  console.log(`\n${Y}════ ٣) اعتماد على نون (سعرٌ يدويّ يشيخ) ════${X}`);
  const noonCheap = all.filter(c => { const b = liveOffers(c.offers as any)[0] as any; return b && b.store.slug === 'noon'; });
  noonCheap.forEach(c => {
    const b = liveOffers(c.offers as any)[0] as any;
    const next = (liveOffers(c.offers as any)[1] as any);
    console.log(`   ${String(Math.round(c.price)).padStart(6)} ﷼ | [${c.category.name}] ${c.name} ${D}(التالي: ${next ? `${next.store.name} ${next.price}` : 'لا بديل'})${X}`);
  });

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`إجمالي: ${all.length} قطعة · ${single.length} بمصدر واحد · ${dead.length} بلا عرض حيّ · ${noonCheap.length} تعتمد على نون`);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
