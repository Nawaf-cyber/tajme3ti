/* ============ ملاحظة إيقاف مبرّدات AMD ============
 *
 * في ١ أغسطس ٢٠٢٥ أوقفت AMD مبرّدَي Wraith Prism و Wraith Spire:
 *   • Prism بلا بديل ⇒ Ryzen 7 7700 و Ryzen 9 7900 تُباعان بلا مبرّد.
 *   • Spire حلّ محلّه Wraith Stealth الأصغر ⇒ Ryzen 7 8700G.
 * مصادر: Tom's Hardware · VideoCardz · PCWorld (أغسطس ٢٠٢٥).
 *
 * والحقل `includedCooler` وحده لا يكفي هنا: يقول «لا يوجد» ولا يقول
 * **لماذا**. والمشتري الذي قرأ مراجعةً قديمة تقول إن 7700 يأتي بمبرّد RGB
 * سيظنّ بياناتنا خاطئة — فيثق بالمراجعة ويشتري بلا مبرّد.
 *
 * فالملاحظة تشرح التغيّر وتاريخه ومصدره. وهي `notes` لا `features`: تحفّظٌ
 * على القطعة لا ميزةٌ لها، وتُعرض بلونٍ يقول «انتبه».
 *
 *   npx tsx scripts/fill-cpu-cooler-notes.ts          # عرض
 *   npx tsx scripts/fill-cpu-cooler-notes.ts --apply  # كتابة
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const PRISM =
  'أوقفت AMD مبرّد Wraith Prism في أغسطس ٢٠٢٥ بلا بديل، فصارت العلب الجديدة تُباع بلا مبرّد. ' +
  'وقد تجد علبةً من مخزونٍ قديم فيها المبرّد — فتأكّد قبل الشراء إن كنت تعتمد عليه.';

const SPIRE =
  'كان يأتي بمبرّد Wraith Spire، وبعد إيقافه في أغسطس ٢٠٢٥ صار يأتي بـWraith Stealth الأصغر. ' +
  'يكفي للاستعمال العادي، لكنه أضعف ممّا تصفه المراجعات القديمة.';

const MAP: Record<string, string> = {
  cmrd7irgy000204l6f0eofmx8: PRISM, // Ryzen 7 7700
  cmrd7isc9000804l6rhu42saz: PRISM, // Ryzen 9 7900
  cmpiecx8z006100ymz8ys8m2h: SPIRE, // Ryzen 7 8700G
};

const apply = process.argv.includes('--apply');

async function main() {
  const ids = Object.keys(MAP);
  const cpus = await prisma.component.findMany({
    where: { id: { in: ids } },
    select: { id: true, brand: true, name: true, specs: true },
  });

  const ghosts = ids.filter((id) => !cpus.some((c) => c.id === id));
  if (ghosts.length) {
    console.error('⛔ معرّفات لا يقابلها شيء: ' + ghosts.join(', '));
    process.exit(1);
  }

  console.log(`\n${apply ? '✍️  كتابة' : '👁️  عرض فقط'} — ${cpus.length} معالجات\n`);

  let done = 0;
  for (const c of cpus) {
    const sp: any = typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs || {};
    const note = MAP[c.id];
    const current: string[] = Array.isArray(sp.notes) ? sp.notes : [];

    if (current.includes(note)) {
      console.log(`  ⏭️  ${c.brand} ${c.name}`);
      continue;
    }

    console.log(`  ➕ ${c.brand} ${c.name}`);
    console.log(`      ${note.slice(0, 90)}…`);
    if (apply) {
      /* تُضاف ولا تستبدل: قد تحمل القطعة ملاحظةً أخرى لا شأن لها بالمبرّد */
      await prisma.component.update({
        where: { id: c.id },
        data: { specs: { ...sp, notes: [...current, note] } },
      });
    }
    done++;
  }

  console.log(`\n${'═'.repeat(46)}\n${apply ? 'كُتبت' : 'ستُكتب'}: ${done}`);
  if (!apply) console.log('\nأضف --apply للكتابة.');

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
