/* ============ المبرّدات — الدفعة الثانية ============
 *
 * سبعةٌ تُكمل الأولى: ثلاث علامات بدل واحدة، ومدىً من ١٢٩ مم هوائيّ إلى
 * رادييتر ٣٦٠ بشاشة.
 *
 * ⚠️ **وأهمّ ما فيها Xigmatek**: صفحة المصنّع تذكر LGA1700/1200/115x و
 * AM5/AM4/AM3 — و**لا تذكر LGA1851**. فمقابسه تُكتب بلا LGA1851، وسيستبعده
 * المحرّك من معالجات Core Ultra الأربعة بحقّ. ولو نسخنا «كل المقابس» كسلاً
 * لقلنا للمشتري إنه يركّب على 245K وهو لا يركّب.
 *
 * ونفس قاعدة الدفعة الأولى: مقاس الرادييتر **فئة** لا طولاً (277 و397 و402
 * تُخزَّن 240 و360 و360)، والهوائيّ ارتفاعه الحقيقيّ.
 *
 * و`tdpRating` يُكتب حيث نُشر فقط: AG300 ‏150 واط و Xigmatek ‏160 واط.
 * أمّا LT و Mystique و Kraken فلا تنشره صفحاتها — فيبقى «غير معلن».
 *
 *   npx tsx scripts/add-coolers-batch2.ts          # عرض
 *   npx tsx scripts/add-coolers-batch2.ts --apply  # كتابة
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { judgeSpecs } from '../lib/import-specs';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const COOLER = 'cmszm2ym00000swymvd5s2yxm';

/** المقابس الأربعة الموجودة في كتالوجنا */
const ALL = 'AM5/AM4/LGA1851/LGA1700';
/** بلا LGA1851 — مقابس Xigmatek كما نشرها المصنّع */
const NO_1851 = 'AM5/AM4/LGA1700';

type Part = { brand: string; name: string; tier: number; specs: Record<string, any>; url: string; description: string };

const PARTS: Part[] = [
  {
    brand: 'DeepCool', name: 'AG300', tier: 1,
    // 119×77×129 (L×W×H) ⇒ ارتفاع 129 · مروحة 92 مم · 150 واط
    specs: { type: 'Air', sizeMm: '129', sockets: ALL, tdpRating: '150', fanCount: '1', fanSize: '92mm', rgb: 'No' },
    url: 'https://www.cazasouq.com/deepcool-ag300-air-cooler-aa16249',
    description: `### DeepCool AG300

مبرّدٌ هوائيّ مضغوط بثلاثة أنابيب نحاسية ومروحة ٩٢ مم.

**التقنيات الأساسية المدعومة:**

[green]ارتفاع 129 مم:[/green] من أقصر الأبراج — يدخل كيسات لا تقبل المبرّدات الكاملة.

[green]150 واط:[/green] يكفي معالجات الفئة المتوسطة ٦٥ واط بأريحية.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مروحة ٩٢ مم أصغر من المعتاد: هواءٌ أقلّ وصوتٌ أعلى عند السرعات القصوى.`,
  },
  {
    brand: 'DeepCool', name: 'LT240 ARGB', tier: 3,
    // رادييتر 282×120×27 ⇒ فئة 240
    specs: { type: 'AIO', sizeMm: '240', sockets: ALL, fanCount: '2', fanSize: '120mm', rgb: 'Yes' },
    url: 'https://www.cazasouq.com/deepcool-lt240-a-rgb-240mm-cooler-black-22961',
    description: `### DeepCool LT240 ARGB

رادييتر ٢٤٠ مم ومروحتا FD12 ARGB مع مضخّة الجيل الخامس.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 240 مم:[/green] يدخل معظم الأبراج المتوسطة.

[green]مضخّة الجيل الخامس:[/green] تدفّقٌ أعلى من سلسلة LE عند الحجم نفسه.`,
  },
  {
    brand: 'DeepCool', name: 'LT360 ARGB White', tier: 4,
    // رادييتر 402×120×27 ⇒ فئة 360
    specs: { type: 'AIO', sizeMm: '360', sockets: ALL, fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'White' },
    url: 'https://www.cazasouq.com/deepcool-lt360-a-rgb-360mm-cooler-white-22958',
    description: `### DeepCool LT360 ARGB White

رادييتر ٣٦٠ مم وثلاث مراوح FD12 ARGB بيضاء.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 360 مم:[/green] لمعالجات الفئة العليا تحت حملٍ طويل.

[green]مضخّة الجيل الخامس:[/green] أداءٌ أعلى من سلسلة LE.`,
  },
  {
    brand: 'DeepCool', name: 'Mystique 360 ARGB', tier: 5,
    specs: {
      type: 'AIO', sizeMm: '360', sockets: ALL, fanCount: '3', fanSize: '120mm', rgb: 'Yes',
      features: ['شاشة LCD مقاس 2.8 بوصة بدقّة 640×480', 'حسّاس دوران يضبط اتجاه الشاشة تلقائياً'],
    },
    url: 'https://www.cazasouq.com/deepcool-aio-liquid-cooler-mystique-360-argb-2-8-lcd-black-22973',
    description: `### DeepCool Mystique 360 ARGB

قمّة سلسلة DeepCool المائية: رادييتر ٣٦٠ مم وشاشة LCD ‏٢٫٨ بوصة على المضخّة.

**التقنيات الأساسية المدعومة:**

[green]شاشة 2.8 بوصة:[/green] تعرض الحرارة أو صورةً متحرّكة، وتضبط اتجاهها بحسّاس دوران.

[green]مضخّة الجيل الخامس:[/green] حتى ٣٤٠٠ دورة، وقاعدة تلامسٍ بقنوات ٠٫١٣ مم.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الشاشة ترفع السعر — فإن كان همّك التبريد وحده فسلسلة LT تعطي الأداء نفسه بأقلّ.`,
  },
  {
    brand: 'Xigmatek', name: 'Air-Killer Pro Arctic White', tier: 2,
    // 128×76×160 (L×W×H) ⇒ ارتفاع 160 · 160 واط
    // ⚠️ المصنّع لا يذكر LGA1851 — فلا يُكتب
    specs: { type: 'Air', sizeMm: '160', sockets: NO_1851, tdpRating: '160', fanCount: '1', fanSize: '120mm', rgb: 'Yes', color: 'White' },
    url: 'https://www.cazasouq.com/xigmatek-air-killer-pro-arctic-air-cooler-white-20481',
    description: `### Xigmatek Air-Killer Pro Arctic

برجٌ أبيض بارتفاع ١٦٠ مم ومروحة X22A بإضاءة ARGB.

**التقنيات الأساسية المدعومة:**

[green]160 واط:[/green] يغطّي معالجات الفئة المتوسطة والعليا في الاستعمال العادي.

[green]تحكّم بالإضاءة:[/green] وحدة تحكّم بثلاثة أزرار وحتى ٨٥ نمطاً بلا حاجة إلى لوحةٍ داعمة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدعم مقبس LGA1851 — أي أنه لا يركّب على معالجات Core Ultra.`,
  },
  {
    brand: 'NZXT', name: 'Kraken Core 240 RGB', tier: 3,
    // رادييتر 277×120×27 ⇒ فئة 240 · مروحة واحدة بإطارٍ يحمل وحدتين
    specs: { type: 'AIO', sizeMm: '240', sockets: ALL, fanCount: '2', fanSize: '120mm', rgb: 'Yes' },
    url: 'https://www.cazasouq.com/nzxt-kraken-core-rgb-240mm-aio-liquid-cooler-black-39609',
    description: `### NZXT Kraken Core 240 RGB

رادييتر ٢٤٠ مم بمضخّة ٣١٠٠ دورة ومروحة F240 RGB Core بإطارٍ واحد.

**التقنيات الأساسية المدعومة:**

[green]إطار مروحةٍ واحد:[/green] وحدتان في هيكلٍ واحد — كابلٌ واحد وتركيبٌ أسرع.

[green]بلا وحدة تحكّم:[/green] يتّصل باللوحة مباشرة، فكابلاتٌ أقلّ داخل الكيس.

[green]ضمان ٥ سنوات.[/green]`,
  },
  {
    brand: 'NZXT', name: 'Kraken Core 360 RGB', tier: 4,
    // رادييتر 397×120×27 ⇒ فئة 360
    specs: { type: 'AIO', sizeMm: '360', sockets: ALL, fanCount: '3', fanSize: '120mm', rgb: 'Yes' },
    url: 'https://www.cazasouq.com/nzxt-kraken-core-rgb-360mm-aio-liquid-cooler-black-39619',
    description: `### NZXT Kraken Core 360 RGB

رادييتر ٣٦٠ مم بمضخّة ٣١٠٠ دورة ومروحة F360 RGB Core بإطارٍ واحد يحمل ثلاث وحدات.

**التقنيات الأساسية المدعومة:**

[green]إطار مروحةٍ واحد:[/green] ثلاث وحدات في هيكلٍ واحد — كابلٌ واحد بدل ثلاثة.

[green]رادييتر 360 مم:[/green] لمعالجات الفئة العليا.

[green]ضمان ٥ سنوات.[/green]`,
  },
];

const apply = process.argv.includes('--apply');

async function main() {
  const store = await prisma.store.findFirst({ where: { slug: 'cazasouq' }, select: { id: true } });
  if (!store) { console.error('⛔ متجر كازاسوق غير موجود'); process.exit(1); }

  console.log('\n── فحص المخطّط ──');
  let bad = 0;
  for (const p of PARTS) {
    const v = judgeSpecs('Cooler', null, p.specs);
    if (v.reject) { console.error(`  ⛔ ${p.name}: ${v.reject}`); bad++; }
    else console.log(`  ✔ ${p.name}${v.gaps.length ? `   (ينقصها: ${v.gaps.join('، ')})` : ''}`);
  }
  if (bad) { console.error('\nلم يُكتب شيء.'); process.exit(1); }

  const taken = await prisma.componentOffer.findMany({
    where: { url: { in: PARTS.map((p) => p.url) } },
    select: { url: true, component: { select: { name: true } } },
  });
  if (taken.length) {
    console.error('\n⛔ روابط مستعملة:');
    for (const t of taken) console.error(`   ${t.component.name} ← ${t.url}`);
    process.exit(1);
  }

  const dupes = await prisma.component.findMany({
    where: { name: { in: PARTS.map((p) => p.name) } }, select: { name: true },
  });
  if (dupes.length) { console.error('\n⛔ أسماء موجودة: ' + dupes.map((d) => d.name).join('، ')); process.exit(1); }

  console.log(`\n${apply ? '✍️  كتابة' : '👁️  عرض فقط'} — ${PARTS.length} مبرّدات\n`);
  const ids: string[] = [];
  for (const p of PARTS) {
    const label = p.specs.type === 'AIO' ? `رادييتر ${p.specs.sizeMm}` : `ارتفاع ${p.specs.sizeMm}مم`;
    const sock = p.specs.sockets === NO_1851 ? ' ⚠️ بلا LGA1851' : '';
    console.log(`  ${p.specs.type === 'AIO' ? '💧' : '🌀'} ${(p.brand + ' ' + p.name).padEnd(34)} ${label.padEnd(16)} فئة ${p.tier}${sock}`);
    if (!apply) continue;

    const c = await prisma.component.create({
      data: {
        categoryId: COOLER, brand: p.brand, name: p.name,
        price: 0, tdpWattage: 0, performanceTier: p.tier,
        specs: p.specs, description: p.description,
      },
    });
    await prisma.componentOffer.create({ data: { componentId: c.id, storeId: store.id, url: p.url, inStock: true } });
    ids.push(c.id);
  }

  if (apply) console.log(`\nللسحب:\nnpx tsx scripts/scrape-one.ts ${ids.join(' ')}`);
  else console.log('\nأضف --apply للكتابة.');

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
