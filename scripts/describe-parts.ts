/* ============ كتابة أوصاف القطع الناقصة ============
 *
 * يقرأ القطع بلا وصف، يبني لكلٍّ منها مسوّدةً من **مواصفاتها المسجّلة
 * عندنا** لا من معرفةٍ عامّة، يفحصها، ثمّ يعرضها. ولا يكتب في القاعدة إلّا
 * بـ`--apply` — والفصل مقصودٌ كفصل `/admin/find-sources`.
 *
 *   npx tsx scripts/describe-parts.ts                    مسوّدات لكلّ ناقص
 *   npx tsx scripts/describe-parts.ts GPU                فئةٌ بعينها
 *   npx tsx scripts/describe-parts.ts --limit 3          دفعةٌ صغيرة للتجربة
 *   npx tsx scripts/describe-parts.ts --dry              يطبع الطلب بلا نداء
 *   npx tsx scripts/describe-parts.ts GPU --apply        يكتب بعد أن تقرأ
 *
 * ⚠️ ويحتاج `ANTHROPIC_API_KEY` في `.env`. وبلا مفتاح يعمل `--dry` وحده،
 * فيُرى الطلب كاملاً قبل أن يُدفع فيه ريال.
 */
import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { liveOffers } from '../lib/stores';
import { draftDescription, buildUserPrompt, costUsd, DESCRIBE_MODEL, type PeerInput } from '../lib/describe';

const ARGS = process.argv.slice(2);
const APPLY = ARGS.includes('--apply');
const DRY = ARGS.includes('--dry');
/* ⚠️ لإعادة كتابة وصفٍ موجود — ومعه `--apply` يُستبدل نصٌّ كتبه إنسان.
   فلا يُجمع الاثنان إلّا بقصد، ويُطبع تحذيرٌ قبل أوّل استبدال. */
const REWRITE = ARGS.includes('--rewrite');
const ONLY = ARGS.find((a) => !a.startsWith('--') && !/^\d+$/.test(a)) || null;
const LIMIT = Number(ARGS[ARGS.indexOf('--limit') + 1]) || 999;
const G = '\x1b[32m', Y = '\x1b[33m', R = '\x1b[31m', D = '\x1b[2m', X = '\x1b[0m';

const parseSpecs = (s: any) => (typeof s === 'string' ? (() => { try { return JSON.parse(s); } catch { return {}; } })() : (s as any) || {});

async function main() {
  if (!DRY && !process.env.ANTHROPIC_API_KEY) {
    console.error('⛔ لا مفتاح: ضع ANTHROPIC_API_KEY في .env — أو شغّل --dry لرؤية الطلب بلا نداء.');
    process.exit(1);
  }

  const all = await prisma.component.findMany({
    where: ONLY ? { category: { name: ONLY } } : {},
    include: { category: true, offers: { include: { store: true } } },
    orderBy: { price: 'desc' },
  });

  const need = all.filter((c) => REWRITE || !String(c.description ?? '').trim()).slice(0, LIMIT);
  console.log(`\n${need.length} قطعة ${REWRITE ? 'لإعادة الكتابة' : 'بلا وصف'}${ONLY ? ` في ${ONLY}` : ''} · النموذج ${DESCRIBE_MODEL}${DRY ? `${D} (تجربةٌ بلا نداء)${X}` : ''}`);
  if (REWRITE && APPLY) console.log(`${Y}⚠ --rewrite مع --apply يستبدل أوصافاً موجودة — منها ما كتبه إنسان.${X}`);
  console.log('');
  if (!need.length) { await prisma.$disconnect(); return; }

  let written = 0, failed = 0, spent = 0;

  for (const c of need) {
    /* ⚠️ البدائل من **نفس الفئة** وحدها، وأقربُها سعراً — قائمةٌ كاملة
       تُغرق الطلب وتُغري النموذج ببديلٍ بعيدٍ عن الحاجة. */
    const peers: PeerInput[] = all
      .filter((p) => p.categoryId === c.categoryId && p.id !== c.id && liveOffers(p.offers as any).length > 0)
      .sort((a, b) => Math.abs(a.price - c.price) - Math.abs(b.price - c.price))
      .slice(0, 12)
      .map((p) => ({ id: p.id, brand: p.brand, name: p.name, price: p.price, specs: parseSpecs(p.specs) }));

    const part = {
      id: c.id, brand: c.brand, name: c.name, category: c.category.name,
      price: c.price, tdpWattage: c.tdpWattage, specs: parseSpecs(c.specs),
      stores: liveOffers(c.offers as any).map((o: any) => o.store.name),
    };

    console.log(`${'─'.repeat(60)}\n${c.brand} ${c.name}  ${D}[${c.category.name}] ${Math.round(c.price)}﷼ · ${peers.length} بديلاً${X}`);

    if (DRY) { console.log(D + buildUserPrompt(part, peers) + X); continue; }

    try {
      const d = await draftDescription(part, peers);
      spent += costUsd(d.usage);

      console.log(d.description);
      console.log(`${D}— ${d.usage.input} دخلاً · ${d.usage.output} خرجاً · مخزَّنٌ قُرئ ${d.usage.cacheRead} · $${costUsd(d.usage).toFixed(3)}${X}`);

      if (d.problems.length) {
        failed++;
        console.log(`${R}✗ لم يجتز الفحص: ${d.problems.join(' · ')}${X}`);
        continue;   /* لا يُكتب ما لم يجتز — ولو مع --apply */
      }
      console.log(`${G}✔ اجتاز الفحص${X}`);

      if (APPLY) {
        await prisma.component.update({ where: { id: c.id }, data: { description: d.description } });
        written++;
        console.log(`${G}✚ كُتب في القاعدة${X}`);
      }
    } catch (e: any) {
      failed++;
      console.log(`${R}✗ فشل النداء: ${String(e?.message || e).slice(0, 120)}${X}`);
    }
  }

  if (!DRY) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`مسوّدات: ${need.length} · لم تجتز: ${failed}${APPLY ? ` · كُتب: ${written}` : ''} · الكلفة: $${spent.toFixed(3)} ≈ ${(spent * 3.75).toFixed(2)}﷼`);
    if (!APPLY && written === 0) console.log(`${D}أضف --apply للكتابة بعد أن تقرأ.${X}`);
  }
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
