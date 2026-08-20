/* ============ أيّ سعرٍ معروضٍ اليوم يُضلّل؟ ============
 *
 * البند كان مكتوباً «أسعار رام مبالغة — 16GB DDR5 بـ١٢٩٩ ﷼ والمفروض
 * ~٢٠٠» على أنه عطبٌ في السحب. وليس كذلك:
 *
 *   • السعر المخزّن على كل قطعة يساوي **أرخص عرضٍ متوفّر** بالضبط —
 *     ٢٦٨ قطعة من ٢٦٨ لها عرضٌ حيّ، بلا استثناءٍ واحد.
 *   • وفُتحت صفحتا أمازون بنفسي: Corsair Vengeance DDR5 32GB معروضةٌ
 *     هناك بـ٢٢٤٩ ﷼ فعلاً، وGTX 1650 بـ١٢٥٩ ﷼ فعلاً. البائع طرفٌ ثالث
 *     يغالي، والسحب ينقل ما يرى.
 *
 * فالعطب في **المصدر لا في الحساب**: حين ينفد المتجر الرخيص يبقى
 * الإعلان المغالي وحده متوفّراً، فيصير هو سعرنا — ويصعد إلى التوصيات
 * وإلى مجاميع التجميعات كأنه سعر السوق.
 *
 * وهذا الكاشف يفرز الحالة التي تُضلّل فعلاً: قطعةٌ **نعرف** لها سعراً
 * أرخص عند متجرٍ آخر، لكنه نافد — فالفارق ليس تقديراً منّا بل رقمان
 * من متجرين على المنتج نفسه.
 *
 * **يقرأ ولا يكتب.**
 *
 *   npx tsx scripts/price-sanity.ts          (الفارق ≥ ٥٠٪)
 *   npx tsx scripts/price-sanity.ts 100      (عتبة أخرى)
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { liveOffers, lowestPrice } from '../lib/stores';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const THRESHOLD = Number(process.argv[2]) || 50;
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

const fmt = (n: number) => n.toFixed(0).padStart(7);

async function main() {
  const all = await prisma.component.findMany({
    include: { category: true, offers: { include: { store: true } } },
  });

  /* ١ — هل السعر المخزّن هو أرخص عرضٍ حيّ؟ (سلامة الحساب) */
  let mismatch = 0, noLive = 0;
  for (const c of all) {
    const live = liveOffers(c.offers as any);
    if (!live.length) { noLive++; continue; }
    if (Math.abs(lowestPrice(c.offers as any) - c.price) >= 0.01) mismatch++;
  }
  console.log(`\nالكتالوج: ${all.length} قطعة · ${noLive} بلا عرضٍ حيّ`);
  console.log(
    mismatch === 0
      ? `  ${G}✔${X} السعر المخزّن = أرخص عرضٍ متوفّر في كل قطعة — الحساب سليم`
      : `  ${R}✘${X} ${mismatch} قطعة سعرها لا يطابق أرخص عرضٍ متوفّر`,
  );

  /* ٢ — أين يوجد سعرٌ أرخص لكنه نافد؟ */
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`قطعٌ سعرها المعروض أعلى بـ${THRESHOLD}٪+ من سعرٍ نعرفه عند متجرٍ نافد:\n`);

  type Row = { cat: string; name: string; shown: number; known: number; pct: number; liveAt: string; knownAt: string };
  const rows: Row[] = [];

  for (const c of all) {
    const live = liveOffers(c.offers as any);
    if (!live.length) continue;
    const shown = live[0];

    /* عروضٌ لها سعرٌ مسجَّل لكنها ليست ضمن المتوفّر */
    const dormant = (c.offers as any[])
      .filter((o) => (o.price ?? 0) > 0 && !live.includes(o))
      .sort((a, b) => a.price - b.price);
    if (!dormant.length) continue;

    const cheapest = dormant[0];
    if (cheapest.price >= shown.price) continue;
    const pct = ((shown.price - cheapest.price) / cheapest.price) * 100;
    if (pct < THRESHOLD) continue;

    rows.push({
      cat: c.category.name,
      name: c.name,
      shown: shown.price,
      known: cheapest.price,
      pct,
      liveAt: shown.store.name,
      knownAt: cheapest.store.name,
    });
  }

  rows.sort((a, b) => b.pct - a.pct);
  for (const r of rows) {
    console.log(`  ${R}+${r.pct.toFixed(0)}٪${X}  ${fmt(r.shown)} ﷼ (${r.liveAt})  ${D}←${X}  ${fmt(r.known)} ﷼ (${r.knownAt}، نافد)`);
    console.log(`        ${D}[${r.cat}] ${r.name}${X}`);
  }
  if (!rows.length) console.log(`  ${G}لا شيء فوق العتبة${X}`);

  /* ٣ — القطع ذات المصدر الواحد: لا مرجعَ يكشف مغالاتها */
  const single = all.filter((c) => liveOffers(c.offers as any).length === 1);
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`${Y}${single.length}${X} قطعة بمصدرٍ حيٍّ واحد — لا رقمَ ثانياً يكشف مغالاتها.`);
  console.log(`${D}وهذا هو البند «١٧ قطعة بلا عرض · ٧٧ بعرضٍ واحد» نفسه: إضافة متجرٍ ثانٍ${X}`);
  console.log(`${D}تُصلح السعر والثقة معاً، ولا تحتاج سطر كودٍ واحد.${X}`);

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
