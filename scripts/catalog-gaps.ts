/**
 * ============ أين ثقوب الكتالوج؟ ============
 *
 * السؤال «ما القطعة الناقصة؟» يُجاب بالحدس عادةً، وهو يخطئ: يقترح ما نتذكّره
 * لا ما يحتاجه المولّد. وهذه الأداة تسأل البيانات بدلاً منه:
 *
 *   ١) فجوات السعر داخل كل فئة — أين يقفز السعر قفزةً بلا قطعةٍ بينها؟
 *   ٢) توزيع المستويات — أي مستوى فارغ أو شبه فارغ في فئة؟
 *   ٣) المفاتيح الفارغة — كم قطعةً بلا `socket` أو `formFactor`... إلخ.
 *   ٤) القطع النافدة كلّياً — موجودةٌ في الكتالوج ولا يمكن شراؤها.
 *   ٥) عرضٌ واحد — لا مقارنة، وهي جوهر الموقع.
 *
 *   npx tsx scripts/catalog-gaps.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const parse = (s: unknown): Record<string, any> =>
  typeof s === 'string' ? JSON.parse(s) : ((s as any) || {});

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const cats = await prisma.category.findMany({ select: { id: true, name: true } });
  const comps = await prisma.component.findMany({
    include: { offers: { select: { price: true, inStock: true, url: true } } },
  });

  for (const cat of cats) {
    const list = comps.filter((c) => c.categoryId === cat.id).sort((a, b) => a.price - b.price);
    if (!list.length) { console.log(`\n████ ${cat.name}: فارغة تماماً`); continue; }

    console.log(`\n████ ${cat.name}  (${list.length} قطعة)`);

    // ---- المستويات
    const tiers = [1, 2, 3, 4, 5].map((t) => list.filter((c) => c.performanceTier === t).length);
    console.log(`   المستويات 1→5 : ${tiers.map((n, i) => `T${i + 1}:${n}`).join('  ')}`);
    const empty = tiers.map((n, i) => (n === 0 ? i + 1 : 0)).filter(Boolean);
    if (empty.length) console.log(`   ⚠️ مستوى فارغ: ${empty.map((t) => `T${t}`).join('، ')}`);

    // ---- فجوات السعر: قفزة أكبر من ضعف السعر السابق
    const gaps: string[] = [];
    for (let i = 1; i < list.length; i++) {
      const lo = list[i - 1], hi = list[i];
      if (lo.price > 0 && hi.price >= lo.price * 2 && hi.price - lo.price > 400) {
        gaps.push(`${lo.price}﷼ (${lo.name}) → ${hi.price}﷼ (${hi.name})`);
      }
    }
    if (gaps.length) { console.log('   ⚠️ فجوة سعرية:'); gaps.forEach((g) => console.log(`      ${g}`)); }

    // ---- مفاتيح ناقصة
    const keyCount: Record<string, number> = {};
    for (const c of list) for (const k of Object.keys(parse(c.specs))) keyCount[k] = (keyCount[k] || 0) + 1;
    const partial = Object.entries(keyCount)
      .filter(([, n]) => n > 0 && n < list.length)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5);
    if (partial.length) {
      console.log(`   مفاتيح غير مكتملة: ${partial.map(([k, n]) => `${k} ${n}/${list.length}`).join('  ')}`);
    }

    // ---- التوفّر والمقارنة
    const dead = list.filter((c) => !c.offers.some((o) => o.inStock && (o.price ?? 0) > 0));
    const solo = list.filter((c) => c.offers.filter((o) => o.url).length === 1);
    if (dead.length) console.log(`   ⛔ نافدة كلّياً: ${dead.length} — ${dead.slice(0, 4).map((c) => c.name).join('، ')}${dead.length > 4 ? '…' : ''}`);
    if (solo.length) console.log(`   بعرضٍ واحد: ${solo.length}/${list.length}`);
  }

  await prisma.$disconnect();
}

main();
