/**
 * ============ سدّ فجوة كيسات Micro-ATX ============
 *
 * الكتالوج قبل هذا: كيس Micro-ATX **واحد** (Thermaltake Tower 300 بـ٦٩١ ﷼)
 * مقابل **ثماني** لوحات Micro-ATX. فمن يختار لوحة صغيرة يجد كيساً واحداً
 * وهو الأغلى في فئته — أي أن الحجم الصغير كان يُكلّف صاحبه بلا سبب.
 *
 * والكيسان مختلفان عمداً لا مكرّران:
 *   - Forge M100A: أربع مراوح مرفقة، وكرت حتى ٣٠٠ مم — كيس البداية.
 *   - CH260: كرت حتى ٣٨٨ مم في هيكل مدمج — يبتلع كروتاً تعجز عنها
 *     كيسات Mid Tower في الكتالوج (Corsair 4000D يقف عند ٣٦٠).
 *
 * المواصفات من صفحات الصانع، و**أقصى طول كرت** بالذات لأن محرّك التوافق
 * يقارنه بطول الكرت ويرفض التجميعة إن تجاوزه.
 *
 *   node scripts/add-matx-cases.mjs           # عرض الخطة
 *   node scripts/add-matx-cases.mjs --apply   # تنفيذ مع نسخة احتياطية
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const CASE_CAT = 'cmpfziquj0006x4ym53f0ehcw';

const PARTS = [
  {
    categoryId: CASE_CAT,
    brand: 'MSI',
    name: 'MAG Forge M100A',
    tdpWattage: 0,
    performanceTier: 2,
    specs: {
      formFactor: 'Micro-ATX Tower',
      maxGpuLength: '300',
      includedFans: '4x 120mm ARGB',
      radiatorSupport: '240mm',
      frontPanel: 'Mesh',
      sidePanel: 'Tempered Glass',
    },
    url: 'https://www.cazasouq.com/msi-mag-forge-m100a-micro-atx-tower-black-gaming-case-19193',
    description: `### MSI MAG Forge M100A

كيس Micro-ATX يأتي بأربع مراوح ARGB مركّبة من المصنع — وهي وحدها تساوي جزءاً معتبراً من سعره، فيصير أرخص مدخل إلى تجميعة صغيرة مضاءة ومبرَّدة بلا شراء مراوح إضافية.

التقنيات الأساسية المدعومة:

[green]4x 120mm ARGB مرفقة:[/green] ثلاث في الواجهة وواحدة خلفية، مركّبة وموصّلة — لا مروحة تُشترى بعدها.

[green]واجهة شبكية:[/green] الهواء يدخل مباشرةً إلى المراوح الأمامية بدل أن يخنقه لوحٌ مصمت.

[green]دعم رادييتر 240 مم:[/green] في الواجهة أو الأعلى، فيقبل تبريداً مائياً مغلقاً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* أقصى طول كرت ٣٠٠ مم — يقبل أغلب كروت الفئة المتوسطة ويرفض الطويلة منها.
* يقبل لوحات Micro-ATX وMini-ITX فقط، لا ATX كاملة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* حجمه الصغير يحدّ ارتفاع مبرّد المعالج وعدد أقراص التخزين.

---
بإمكانك التوجه إلى [DeepCool CH260](/components/CH260_ID) إذا كان توجهك يتركز على الآتي:
* كرت شاشة أطول بكثير (٣٨٨ مم) في هيكل مدمج مشابه.
https://www.msi.com/PC-Case/MAG-FORGE-M100A/Specification`,
  },
  {
    categoryId: CASE_CAT,
    brand: 'DeepCool',
    name: 'CH260',
    tdpWattage: 0,
    performanceTier: 3,
    specs: {
      formFactor: 'Micro-ATX Tower',
      maxGpuLength: '388',
      airflow: 'High Airflow Mesh',
      frontPanel: 'Mesh',
      sidePanel: 'Tempered Glass',
    },
    url: 'https://www.cazasouq.com/ch260-portable-matx-case',
    description: `### DeepCool CH260

هيكل مدمج بأبعاد 438×225×312 مم يبتلع كرت شاشة حتى **٣٨٨ مم** — أطول ممّا يقبله كثير من كيسات Mid Tower في الكتالوج، وهي مفارقةٌ تجعله الخيار حين تريد كرتاً كبيراً بمساحة مكتب صغيرة.

التقنيات الأساسية المدعومة:

[green]كرت حتى 388 مم:[/green] و٤١٣ مم عند نزع المراوح الأمامية — يقبل الفئة العليا بطولها الكامل.

[green]تهوية شبكية شاملة:[/green] هيكل مفتوح للهواء يعوّض صِغر الحجم، فلا تختنق القطع.

[green]دعم اللوحات ذات التوصيل الخلفي:[/green] يقبل لوحات الجيل الجديد التي تُخفي كل الموصّلات خلف اللوح.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ارتفاع مبرّد المعالج يقف عند ١٧٤ مم، فبعض المبرّدات الهوائية الضخمة لا تدخل.
* المزوّد بطول ١٥٠ مم كحدّ أقصى — يستبعد المزوّدات المطوّلة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا مراوح مرفقة، فتُحسب تكلفتها فوق السعر.
* يقبل Micro-ATX وMini-ITX فقط، لا ATX كاملة.

---
بإمكانك التوجه إلى [MSI MAG Forge M100A](/components/M100A_ID) إذا كان توجهك يتركز على الآتي:
* أربع مراوح ARGB مرفقة بلا شراء إضافي.
https://www.deepcool.com/products/Cases/CH260-High-Airflow-M-ATX-Compact-Case-Supports-Rear-Connector-Motherboards/2025/20030.shtml`,
  },
];

// ---------------------------------------------------------------- التنفيذ

const caza = await prisma.store.findFirst({ where: { slug: 'cazasouq' }, select: { id: true } });

let blocked = false;
for (const p of PARTS) {
  const dup = await prisma.component.findFirst({ where: { name: p.name, brand: p.brand } });
  const urlTaken = await prisma.componentOffer.findFirst({
    where: { url: p.url },
    select: { component: { select: { name: true } } },
  });
  console.log(`\n=== ${p.brand} ${p.name}`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  console.log(`    ${p.url}`);
  if (dup) { console.log(`    ⛔ موجودة مسبقاً: ${dup.id}`); blocked = true; }
  if (urlTaken) { console.log(`    ⛔ الرابط مستعمل في: ${urlTaken.component.name}`); blocked = true; }
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply للتنفيذ)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-cases-${stamp}.json`, JSON.stringify(PARTS, null, 2));
console.log(`\nنسخة احتياطية: backups/added-cases-${stamp}.json`);

/* الوصفان يشير كلٌّ منهما إلى الآخر، والمعرّفان لا يُعرفان قبل الإنشاء.
   فيُنشآن أوّلاً بنائبين نصّيين ثم يُستبدلان — بدل ترك رابطٍ ميّت. */
const created = {};
for (const p of PARTS) {
  const { url, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  created[p.name] = c.id;
  await prisma.componentOffer.create({ data: { componentId: c.id, storeId: caza.id, url, inStock: true } });
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}

for (const p of PARTS) {
  const fixed = p.description
    .replace('/components/CH260_ID', `/components/${created['CH260']}`)
    .replace('/components/M100A_ID', `/components/${created['MAG Forge M100A']}`);
  await prisma.component.update({ where: { id: created[p.name] }, data: { description: fixed } });
}
console.log('✔ رُبط الوصفان أحدهما بالآخر');

console.log('\nالخطوة التالية: البحث في بقية المتاجر ثم scrape-one.');
await prisma.$disconnect();
