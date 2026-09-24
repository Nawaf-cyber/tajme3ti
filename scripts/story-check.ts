/**
 * فحصُ ستوري «جهازي»: أيُّ الأسماء تُخفى (lib/build-card.ts · isAutoName).
 *
 *   npx tsx scripts/story-check.ts
 *   npx tsx scripts/story-check.ts --render <مجلّد>   # يرسم الأجهزة الحاليّة فعلاً
 *
 * ثمّ يمرّ على أسماء التجميعات الحقيقيّة ويطبع ما سيُخفى وما سيبقى —
 * فخطأٌ في القاعدة يظهر على بياناتٍ لا على أمثلةٍ مكتوبة.
 */
import 'dotenv/config';
import { isAutoName } from '../lib/build-card';

let failed = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const ok = got === want;
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : ` — got ${got}, want ${want}`}`);
};

const RLM = String.fromCharCode(0x200f);
eq('ميلاديّ بعلامات الاتجاه يُخفى', isAutoName(`تجميعة ٢٢${RLM}/٩${RLM}/٢٠٢٦`), true);
eq('هجريّ يُخفى', isAutoName('تجميعة ١١ ربيع الآخر، ١٤٤٨ هـ'), true);
eq('هجريّ بشرطات يُخفى', isAutoName('تجميعة ٢٤/٢/١٤٤٨ هـ'), true);
eq('«تجميعة» وحدها تُخفى', isAutoName('تجميعة'), true);
eq('الافتراضيّ في المخطّط يُخفى', isAutoName('تجميعة مخصصة'), true);
eq('اسمٌ بموديل يبقى', isAutoName('تجميعة 5070 Ti'), false);
eq('«تجميعة - ١» كتبها صاحبها — تبقى', isAutoName('تجميعة - ١'), false);
eq('«تجميعتي 3» تبقى', isAutoName('تجميعتي 3'), false);
eq('«تجميعة الرخص» تبقى', isAutoName('تجميعة الرخص'), false);
eq('لاتينيّ يبقى', isAutoName('last PC'), false);

(async () => {
  const { prisma } = await import('../lib/prisma');
  const names = [...new Set((await prisma.savedBuild.findMany({ select: { name: true } })).map((b) => b.name))];
  const hidden = names.filter(isAutoName);
  const shown = names.filter((n) => !isAutoName(n));
  console.log(`\nعلى ${names.length} اسماً فريداً: يُخفى ${hidden.length} · يبقى ${shown.length}`);
  console.log('يبقى:', shown.join(' | '));

  /* الرسمُ الحقيقيّ: كلُّ جهازٍ حاليّ بالسعر وبدونه، وحالةُ قطعةٍ مكتوبة
     مصطنعةٌ **في الذاكرة** — لا كتابة في القاعدة. */
  const at = process.argv.indexOf('--render');
  if (at > 0) {
    const out = process.argv[at + 1];
    const fs = await import('node:fs');
    const { buildCard } = await import('../lib/build-card');
    const { renderRigStory } = await import('../lib/rig-story');
    const save = async (name: string, card: any, price: boolean) => {
      const img = await renderRigStory(card, { price });
      fs.writeFileSync(`${out}/${name}.png`, Buffer.from(await img.arrayBuffer()));
      console.log(`  🖼  ${name}.png`);
    };
    const rigs = await prisma.savedBuild.findMany({ where: { isCurrent: true }, select: { id: true } });
    for (const [i, r] of rigs.entries()) {
      const card = (await buildCard(r.id))!;
      await save(`rig${i}-price`, card, true);
      await save(`rig${i}-noprice`, card, false);
    }
    const named = await prisma.savedBuild.findFirst({ where: { name: 'تجميعة الهيمنة' }, select: { id: true } });
    if (named) await save('named', (await buildCard(named.id))!, true);

    const base = (await buildCard(rigs[0].id))!;
    const handwritten = {
      ...base,
      parts: base.parts.filter((p) => p.category !== 'GPU'),
      custom: [{ category: 'GPU', label: 'كرت الشاشة', text: 'GTX 1060 6GB' }],
      balance: null,
    };
    await save('custom-price-requested', handwritten, true);
  }

  await prisma.$disconnect();
  console.log(failed ? `\n✗ ${failed} فشل` : '\n✓ كلّها');
  process.exit(failed ? 1 : 0);
})();
