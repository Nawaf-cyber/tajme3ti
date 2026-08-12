/**
 * ============ خمسة معالجات: قمّة X3D ومدخلا المنصّتين ============
 *
 * أخطر ما كشفه المسح: الكتالوج فيه 9800X3D و9950X و7950X3D، و**صفر** من
 * 9950X3D — وهو أعلى معالج ألعابٍ يُباع اليوم. أي أن من يبحث عن أقوى ما
 * يُشترى لا يجده، ويجد ما دونه وما قبله.
 *
 * ومعه ثغرتان في الأسفل: Ryzen 5 7600 (أشهر مدخل AM5 اقتصادي، والكتالوج
 * فيه 7600X الأغلى فقط)، وCore Ultra 5 225F (مدخل LGA1851، والكتالوج
 * أرخص ما فيه للمقبس 245K بـ٩٠٦ ﷼).
 *
 * كل رقم من صفحة الصانع. وصحّحت AMD الرسمية رقماً كان سيمرّ خطأً:
 * 9900X3D تردّده الأقصى **5.5** لا 5.6 كما تنشر بعض المتاجر.
 *
 *   node scripts/add-cpus-2026.mjs           # عرض
 *   node scripts/add-cpus-2026.mjs --apply   # تنفيذ مع نسخة احتياطية
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const CPU = 'cmpfziqb20000x4ymfmkovawm';

const R9800X3D = 'cmpfzir160007x4ym7w2xdh50';
const R9950X = 'cmpiebfu0001p00ymfr3v5m1x';
const R7600X = 'cmplabz470000mwym2x95ji3y';
const R7500F = 'cmrd7ir6a000004l6ytznx4nk';
const ULTRA245K = 'cmpiecyon006600ymq5jegejh';

const PARTS = [
  {
    categoryId: CPU, brand: 'AMD', name: 'Ryzen 9 9950X3D', tdpWattage: 170, performanceTier: 5,
    specs: { socket: 'AM5', cores: '16', threads: '32', baseClock: '4.3 GHz', boostClock: '5.7 GHz', l3Cache: '128MB', architecture: 'Zen 5' },
    url: 'https://www.cazasouq.com/amd-ryzen-9-9950x3d-tray-cpu-34218',
    description: `### AMD Ryzen 9 9950X3D

المعالج الوحيد الذي يجمع ذاكرة 3D V-Cache مع ستّ عشرة نواة — أي أنه لا يطلب منك الاختيار بين أعلى أداء ألعاب وأعلى أداء إنتاج، وهو ما تطلبه كل المعالجات الأخرى.

التقنيات الأساسية المدعومة:

[green]16 نواة و32 مساراً مع 128MB ذاكرة L3:[/green] وحدتا معالجة، إحداهما تحمل الذاكرة الضخمة للألعاب والأخرى بترددات أعلى للإنتاج — ويوزّع النظام المهامّ بينهما.

[green]الجيل الثاني من 3D V-Cache:[/green] الذاكرة تحت النواة لا فوقها، فالحرارة تخرج مباشرةً إلى الغطاء — ولذلك تردّده الأقصى 5.7 جيجاهرتز لا أقلّ من أخيه غير المزوّد بها.

[green]منصّة AM5 حيّة:[/green] مقبس ما زال يتلقّى معالجات جديدة، فالترقية لاحقاً بلا تغيير اللوحة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 170 واط تحتاج تبريداً مائياً جادّاً ومزوّداً بهامش.
* في الألعاب وحدها لا يتقدّم كثيراً على [Ryzen 7 9800X3D](/components/${R9800X3D}) بثلث سعره — الفارق يظهر حين تُشغّل بثّاً ورندراً معه.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا مبرّد مرفق.
* سعره لا يُبرَّر لمن يلعب فقط.

---
بإمكانك التوجه إلى [Ryzen 9 9950X](/components/${R9950X}) إذا كان توجهك يتركز على الآتي:
* الإنتاج والرندر وحدهما — نفس الأنوية بلا ذاكرة X3D وبسعر أقلّ.
https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x3d.html`,
  },
  {
    categoryId: CPU, brand: 'AMD', name: 'Ryzen 9 9900X3D', tdpWattage: 120, performanceTier: 5,
    specs: { socket: 'AM5', cores: '12', threads: '24', baseClock: '4.4 GHz', boostClock: '5.5 GHz', l3Cache: '128MB', architecture: 'Zen 5' },
    url: 'https://www.cazasouq.com/ryzen-9-9900x3d-tray',
    description: `### AMD Ryzen 9 9900X3D

اثنتا عشرة نواة مع ذاكرة 3D V-Cache كاملة — الوسط بين معالج الألعاب الخالص ومعالج الإنتاج، وحرارته أهدأ من أخيه الأكبر بخمسين واطاً.

التقنيات الأساسية المدعومة:

[green]12 نواة و24 مساراً و128MB ذاكرة L3:[/green] نفس ذاكرة 9950X3D بأنوية أقلّ — فأداء الألعاب قريب جداً منه.

[green]120 واط فقط:[/green] خمسون واطاً أقلّ من 9950X3D، فيقبل تبريداً هوائياً جادّاً بدل المائي.

[green]الجيل الثاني من 3D V-Cache:[/green] بتردّد أقصى 5.5 جيجاهرتز — لا تنازل عن السرعة مقابل الذاكرة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* وحدتا معالجة إحداهما بلا ذاكرة X3D؛ توزيع المهامّ يعتمد على برنامج AMD ونظام ويندوز، وقد يحتاج ضبطاً في حالات نادرة.
* في الألعاب لا يتقدّم على [Ryzen 7 9800X3D](/components/${R9800X3D}) بما يوازي فرق سعره.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا مبرّد مرفق.

---
بإمكانك التوجه إلى [Ryzen 7 9800X3D](/components/${R9800X3D}) إذا كان توجهك يتركز على الآتي:
* الألعاب وحدها — أداء مماثل أو أعلى بسعر أقلّ كثيراً.
https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9900x3d.html`,
  },
  {
    categoryId: CPU, brand: 'AMD', name: 'Ryzen 7 9850X3D', tdpWattage: 120, performanceTier: 5,
    specs: { socket: 'AM5', cores: '8', threads: '16', baseClock: '4.7 GHz', boostClock: '5.6 GHz', l3Cache: '96MB', architecture: 'Zen 5' },
    url: 'https://www.cazasouq.com/amd-ryzen-7-9850x3d-tray-cpu-42089',
    description: `### AMD Ryzen 7 9850X3D

خليفة 9800X3D الصادر في يناير 2026: نفس الأنوية الثماني ونفس ذاكرة 96 ميجابايت، بتردّد أقصى أعلى بأربعمئة ميجاهرتز.

التقنيات الأساسية المدعومة:

[green]5.6 جيجاهرتز:[/green] أعلى تردّد في عائلة X3D ذات الوحدة الواحدة — وأربعمئة ميجاهرتز فوق 9800X3D.

[green]96MB ذاكرة L3:[/green] وحدة معالجة واحدة تحملها كلّها، فلا توزيع مهامّ بين وحدتين ولا اعتماد على برمجيات الجدولة.

[green]120 واط:[/green] يقبل مبرّداً هوائياً من الفئة العليا بلا تبريد مائي.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ثماني أنوية تكفي الألعاب بسخاء وتضيق أمام الرندر الثقيل.
* الفارق عن [Ryzen 7 9800X3D](/components/${R9800X3D}) في الألعاب صغير — يقاس بنسبٍ مئوية مفردة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا مبرّد مرفق.
* بلا رسوميات مدمجة قوية — يلزمه كرت شاشة.

---
بإمكانك التوجه إلى [Ryzen 7 9800X3D](/components/${R9800X3D}) إذا كان توجهك يتركز على الآتي:
* أداء ألعاب قريب جداً بسعر أقلّ — الفارق بينهما تردّد لا بنية.
https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-9000-series/amd-ryzen-7-9850x3d.html`,
  },
  {
    categoryId: CPU, brand: 'AMD', name: 'Ryzen 5 7600', tdpWattage: 65, performanceTier: 3,
    specs: { socket: 'AM5', cores: '6', threads: '12', baseClock: '3.8 GHz', boostClock: '5.1 GHz', l3Cache: '32MB', integratedGraphics: 'Radeon Graphics', architecture: 'Zen 4' },
    url: 'https://www.cazasouq.com/amd-ryzen-5-7600-cpu-24283',
    description: `### AMD Ryzen 5 7600

أشهر مدخل اقتصادي إلى منصّة AM5: ستّ أنوية بخمسة وستّين واطاً ومبرّد مرفق ورسوميات مدمجة تكفي لتشغيل الجهاز بلا كرت شاشة حتى تشتريه.

التقنيات الأساسية المدعومة:

[green]65 واط ومبرّد مرفق:[/green] يعمل من الصندوق بلا شراء مبرّد — وهو ما لا تعطيه نسخة 7600X.

[green]رسوميات Radeon مدمجة:[/green] تكفي لتركيب النظام واستعماله المكتبي، فتستطيع شراء كرت الشاشة لاحقاً.

[green]PCIe 5.0 وDDR5:[/green] منصّة حديثة كاملة، لا مجرّد معالج رخيص.

[green]مقبس AM5 حيّ:[/green] ترقية المعالج لاحقاً بلا تغيير اللوحة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* تردّده الأقصى 5.1 مقابل 5.3 في [Ryzen 5 7600X](/components/${R7600X}) — فرق طفيف يستهلك مقابله وقوداً أكثر.
* الرسوميات المدمجة للعرض لا للّعب.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا ذاكرة 3D V-Cache.

---
بإمكانك التوجه إلى [Ryzen 5 7500F](/components/${R7500F}) إذا كان توجهك يتركز على الآتي:
* سعر أقلّ، مع التنازل عن الرسوميات المدمجة والمبرّد المرفق.
https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7600.html`,
  },
  {
    categoryId: CPU, brand: 'Intel', name: 'Core Ultra 5 225F', tdpWattage: 65, performanceTier: 3,
    specs: { socket: 'LGA1851', cores: '10', threads: '10', pCores: '6', eCores: '4', baseClock: '3.3 GHz', boostClock: '4.9 GHz', l3Cache: '20MB', architecture: 'Arrow Lake' },
    url: 'https://www.cazasouq.com/intel-core-ultra5-225f',
    description: `### Intel Core Ultra 5 225F

أرخص باب إلى مقبس LGA1851 — عشر أنوية بخمسة وستّين واطاً، لمن يريد منصّة إنتل الحديثة بلا ثمن معالجات K.

التقنيات الأساسية المدعومة:

[green]10 أنوية (6 أداء + 4 كفاءة):[/green] توزيع يكفي الألعاب والمهامّ اليومية معاً.

[green]65 واط أساسية:[/green] حرارة منخفضة تقبل مبرّداً هوائياً متوسّطاً، بذروة 121 واط تحت الحمل.

[green]DDR5-6400 وPCIe 5.0:[/green] منصّة كاملة الحداثة رغم سعرها.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **عشرة مسارات لعشر أنوية** — أنوية الأداء بلا Hyper-Threading في هذا الجيل، فالمسارات أقلّ ممّا اعتدته من إنتل.
* غير قابل لكسر السرعة (بلا لاحقة K).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* اللاحقة F تعني **بلا رسوميات مدمجة** — يلزمه كرت شاشة ليعمل أصلاً.
* لوحات LGA1851 أغلى من نظيراتها في المقابس الأقدم، فوفر المعالج قد يبتلعه ثمن اللوحة.

---
بإمكانك التوجه إلى [Core Ultra 5 245K](/components/${ULTRA245K}) إذا كان توجهك يتركز على الآتي:
* أنوية أكثر وتردّد أعلى وكسر سرعة مفتوح.
https://www.intel.com/content/www/us/en/products/sku/241069/intel-core-ultra-5-processor-225f-20m-cache-up-to-4-90-ghz/specifications.html`,
  },
];

// ---------------------------------------------------------------- التنفيذ
const caza = await prisma.store.findFirst({ where: { slug: 'cazasouq' }, select: { id: true } });
let blocked = false;
for (const p of PARTS) {
  const dup = await prisma.component.findFirst({ where: { name: p.name, brand: p.brand } });
  const taken = await prisma.componentOffer.findFirst({ where: { url: p.url }, select: { component: { select: { name: true } } } });
  console.log(`\n=== ${p.brand} ${p.name}`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  if (dup) { console.log(`    ⛔ موجودة: ${dup.id}`); blocked = true; }
  if (taken) { console.log(`    ⛔ الرابط مستعمل في: ${taken.component.name}`); blocked = true; }
}
if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-cpus-${stamp}.json`, JSON.stringify(PARTS, null, 2));
console.log(`\nنسخة احتياطية: backups/added-cpus-${stamp}.json`);
const ids = [];
for (const p of PARTS) {
  const { url, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  await prisma.componentOffer.create({ data: { componentId: c.id, storeId: caza.id, url, inStock: true } });
  ids.push(c.id);
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}
console.log(`\nنسخ للتالي:\n${ids.join(' ')}`);
await prisma.$disconnect();
