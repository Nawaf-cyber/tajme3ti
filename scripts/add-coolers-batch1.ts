/* ============ المبرّدات — الدفعة الأولى ============
 *
 * أوّل قطعةٍ تُكتب هنا **تُطلق الفئة**: الحارس يُخفي الفئة الفارغة، فبمجرّد
 * وجود مبرّدٍ واحد تظهر القائمة المنسدلة في الباني وشريحةُ الترشيح في
 * «تصفّح القطع» وخيارُ المقارنة. لا زرَّ نشرٍ غير هذا السكربت.
 *
 * ⚠️ **مقاس الرادييتر: الفئة لا الطول.** رادييتر LE360 طوله الفعليّ ٤٠٢ مم،
 * والكيس يكتب في `radiatorSupport` قيمةَ «360mm». فلو خُزّن ٤٠٢ لرفضه كلُّ
 * كيسٍ في الكتالوج — بما فيها كيساتٌ صُنعت له. فالمخزَّن هو فئة الرادييتر
 * (240/360) لأنها اللغة التي يتكلّمها الطرف الآخر.
 *   LE240 V2 → رادييتر 282×120×27  ⇒ sizeMm = 240
 *   LE360 V2 → رادييتر 402×120×27  ⇒ sizeMm = 360
 * أمّا الهوائيّ فالمخزَّن ارتفاعه الحقيقيّ، لأن `maxCoolerHeight` مسافةٌ
 * فيزيائية لا فئة.
 *
 * ⚠️ و`tdpRating` **غير منشور** عند DeepCool: صفحات المواصفات لا تذكر
 * قدرةَ تبديدٍ بالواط لأيٍّ من الثلاثة. فيُترك فارغاً ويظهر «غير معلن» —
 * ورقمٌ من مراجعةٍ أو تقديرٍ يُسجَّل يقيناً ثم يُقرأ كأنه مقيس.
 *
 * والأسعار لا تُكتب هنا: `price: 0` والعروض تحمل الروابط، والسحب يملؤها.
 *
 *   npx tsx scripts/add-coolers-batch1.ts          # عرض
 *   npx tsx scripts/add-coolers-batch1.ts --apply  # كتابة
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { judgeSpecs } from '../lib/import-specs';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const COOLER = 'cmszm2ym00000swymvd5s2yxm';

/* مقابس الكتالوج الأربعة: AM5 · AM4 · LGA1851 · LGA1700. وكلُّ ما دونها
   (LGA1200 وأقدم) يُذكر عند المصنّع ولا معالجَ لنا عليه، فلا يُكتب. */
const SOCKETS_ALL = 'AM5/AM4/LGA1851/LGA1700';

type Part = {
  brand: string; name: string; tier: number;
  specs: Record<string, string>;
  url: string;
  description: string;
};

const PARTS: Part[] = [
  {
    brand: 'DeepCool', name: 'AG400 G2 ARGB', tier: 2,
    // الأبعاد 125×92×152 (L×W×H) ⇒ الارتفاع 152
    specs: { type: 'Air', sizeMm: '152', sockets: SOCKETS_ALL, fanCount: '1', fanSize: '120mm', rgb: 'Yes' },
    url: 'https://www.cazasouq.com/deepcool-ag400-g2-argb-cpu-air-cooler-black-48473',
    description: `### DeepCool AG400 G2 ARGB

برجٌ واحد بأربعة أنابيب حرارية ومروحة ١٢٠ مم بإضاءة ARGB.

**التقنيات الأساسية المدعومة:**

[green]ارتفاع 152 مم:[/green] يدخل الأبراج المتوسطة والكبيرة، ويخرج عن كيسات الـITX المنخفضة.

[green]توافق واسع:[/green] AM5 و AM4 و LGA1851 و LGA1700 — أي معالجٍ في الكتالوج.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مروحةٌ واحدة: يكفي معالجات ٦٥–١٢٥ واط، ودونه للمعالجات الأعلى استهلاكاً.`,
  },
  {
    brand: 'DeepCool', name: 'AG400 G2 ARGB White', tier: 2,
    specs: { type: 'Air', sizeMm: '152', sockets: SOCKETS_ALL, fanCount: '1', fanSize: '120mm', rgb: 'Yes', color: 'White' },
    url: 'https://www.cazasouq.com/deepcool-ag400-g2-argb-cpu-air-cooler-white-48452',
    description: `### DeepCool AG400 G2 ARGB White

النسخة البيضاء من AG400 G2 — نفس المشتّت والمروحة والارتفاع، ويتغيّر اللون وحده.

**التقنيات الأساسية المدعومة:**

[green]ارتفاع 152 مم:[/green] يدخل الأبراج المتوسطة والكبيرة.

[green]توافق واسع:[/green] AM5 و AM4 و LGA1851 و LGA1700.`,
  },
  {
    brand: 'DeepCool', name: 'LE240 V2', tier: 3,
    // رادييتر 282×120×27 ⇒ فئة 240
    specs: { type: 'AIO', sizeMm: '240', sockets: SOCKETS_ALL, fanCount: '2', fanSize: '120mm', rgb: 'Yes' },
    url: 'https://www.cazasouq.com/deepcool-le240-v2-black',
    description: `### DeepCool LE240 V2

تبريد مائي مغلق برادييتر ٢٤٠ مم ومروحتي ١٢٠ مم بإضاءة ARGB.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 240 مم:[/green] يدخل معظم الأبراج المتوسطة وبعض كيسات الـITX التي تدعم ٢٤٠.

[green]مضخّة PWM:[/green] تُضبط سرعتها من اللوحة فتهدأ عند الخمول.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المائي يحتاج مساحة تركيبٍ في الكيس (أعلى أو أمام)، فراجع دعم الكيس قبل الشراء.`,
  },
  {
    brand: 'DeepCool', name: 'LE240 V2 White', tier: 3,
    specs: { type: 'AIO', sizeMm: '240', sockets: SOCKETS_ALL, fanCount: '2', fanSize: '120mm', rgb: 'Yes', color: 'White' },
    url: 'https://www.cazasouq.com/deepcool-le240-v2-white',
    description: `### DeepCool LE240 V2 White

النسخة البيضاء من LE240 V2 — نفس الرادييتر والمضخّة والمراوح.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 240 مم:[/green] يدخل معظم الأبراج المتوسطة.`,
  },
  {
    brand: 'DeepCool', name: 'LE360 V2', tier: 4,
    // رادييتر 402×120×27 ⇒ فئة 360
    specs: { type: 'AIO', sizeMm: '360', sockets: SOCKETS_ALL, fanCount: '3', fanSize: '120mm', rgb: 'Yes' },
    url: 'https://www.cazasouq.com/deepcool-le360-v2-black',
    description: `### DeepCool LE360 V2

تبريد مائي برادييتر ٣٦٠ مم وثلاث مراوح ١٢٠ مم بإضاءة ARGB.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 360 مم:[/green] مساحة تبديدٍ تكفي معالجات الفئة العليا تحت حملٍ طويل.

[green]ثلاث مراوح PWM:[/green] هواءٌ أكثر بسرعةٍ أقلّ، فضجيجٌ أقلّ عند الأداء نفسه.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* يحتاج كيساً يدعم رادييتر ٣٦٠ — وهو ما لا يتوفّر في الأبراج الصغيرة.`,
  },
  {
    brand: 'DeepCool', name: 'LE360 V2 White', tier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: SOCKETS_ALL, fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'White' },
    url: 'https://www.cazasouq.com/deepcool-le360-v2-360mm-aio-liquid-cpu-cooler-white-48480',
    description: `### DeepCool LE360 V2 White

النسخة البيضاء من LE360 V2 — نفس الرادييتر والمضخّة والمراوح الثلاث.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 360 مم:[/green] للمعالجات العالية الاستهلاك.`,
  },
];

const apply = process.argv.includes('--apply');

async function main() {
  const cat = await prisma.category.findUnique({ where: { id: COOLER } });
  if (!cat || cat.name !== 'Cooler') { console.error('⛔ فئة المبرّدات غير موجودة'); process.exit(1); }

  const store = await prisma.store.findFirst({ where: { slug: 'cazasouq' }, select: { id: true } });
  if (!store) { console.error('⛔ متجر كازاسوق غير موجود'); process.exit(1); }

  /* البوّابة نفسها التي يمرّ بها الاستيراد — لا فحصٌ موازٍ يتباعد عنها */
  console.log('\n── فحص المخطّط ──');
  let bad = 0;
  for (const p of PARTS) {
    const v = judgeSpecs('Cooler', null, p.specs);
    if (v.reject) { console.error(`  ⛔ ${p.name}: ${v.reject}`); bad++; }
    else console.log(`  ✔ ${p.name}${v.gaps.length ? `   (ينقصها: ${v.gaps.join('، ')})` : ''}`);
  }
  if (bad) { console.error('\nلم يُكتب شيء.'); process.exit(1); }

  /* رابطٌ مستعملٌ سلفاً = قطعةٌ مكرّرة أو رابطٌ خاطئ. أوقف. */
  const urls = PARTS.map((p) => p.url);
  const taken = await prisma.componentOffer.findMany({
    where: { url: { in: urls } },
    select: { url: true, component: { select: { name: true } } },
  });
  if (taken.length) {
    console.error('\n⛔ روابط مستعملة:');
    for (const t of taken) console.error(`   ${t.component.name} ← ${t.url}`);
    process.exit(1);
  }

  const existing = await prisma.component.findMany({
    where: { name: { in: PARTS.map((p) => p.name) } }, select: { name: true },
  });
  if (existing.length) {
    console.error('\n⛔ أسماء موجودة سلفاً: ' + existing.map((e) => e.name).join('، '));
    process.exit(1);
  }

  console.log(`\n${apply ? '✍️  كتابة' : '👁️  عرض فقط'} — ${PARTS.length} مبرّدات\n`);
  for (const p of PARTS) {
    const t = p.specs.type === 'AIO' ? `رادييتر ${p.specs.sizeMm}` : `ارتفاع ${p.specs.sizeMm}مم`;
    console.log(`  ${p.specs.type === 'AIO' ? '💧' : '🌀'} ${(p.brand + ' ' + p.name).padEnd(32)} ${t.padEnd(18)} فئة ${p.tier}`);
    if (!apply) continue;

    const c = await prisma.component.create({
      data: {
        categoryId: COOLER, brand: p.brand, name: p.name,
        price: 0, tdpWattage: 0, performanceTier: p.tier,
        specs: p.specs, description: p.description,
      },
    });
    await prisma.componentOffer.create({
      data: { componentId: c.id, storeId: store.id, url: p.url, inStock: true },
    });
  }

  console.log(`\n${'═'.repeat(52)}`);
  if (apply) {
    console.log('⚠️ الفئة صارت مرئيةً الآن في الباني و«تصفّح القطع» والمقارنة.');
    console.log('   والأسعار صفر حتى يعمل السحب — شغّل تحديث الأسعار من /admin.');
  } else {
    console.log('أضف --apply للكتابة. ⚠️ الكتابة تُطلق الفئة للزوّار.');
  }

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
