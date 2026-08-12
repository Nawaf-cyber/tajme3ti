/**
 * ============ DDR5 32GB 6000 CL30 RGB أبيض ============
 *
 * طلبٌ محدّد. والكتالوج فيه ثمانية أطقم عند 6000 ميجاهرتز — **ولا واحد
 * بإضاءة RGB**، وواحدٌ فقط عند CL30 (وهو رمادي/أسود). وأطقم بيضاء بسعة
 * 32 جيجابايت: **صفر** (الأبيض الوحيد 48 و64 جيجابايت بأسعار الضعف).
 *
 * فمن يبني تجميعةً بيضاء — وهي موضة قائمة — لا يجد رامات تناسبها.
 *
 * ⚠️ ومطابقة دقيقة: الكتالوج فيه «ADATA Lancer Blade 32GB 6000MHz» وقد
 * تبدو الطلب نفسه. لكنها **CL36 وبلا إضاءة**، وعرضها في كازاسوق للنسخة
 * **السوداء**. فالمطلوب منتج آخر لا نسخة لون منها.
 *
 * الاثنان مطابقان برقم القطعة لا بالاسم:
 *   FF4D532G6000HC30DC01   TeamGroup — الحرف الرابع D يعني الأبيض
 *   CMH32GX5M2B6000Z30W    Corsair  — اللاحقة W تعني White
 *
 *   node scripts/add-ddr5-white-rgb.mjs --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const RAM = 'cmpfziqks0003x4yma730h1be';
const ZENITH = 'cmpiecqry005e00ymvr32waij';

const PARTS = [
  {
    categoryId: RAM, brand: 'TeamGroup', name: 'T-Force Delta RGB 32GB (2x16GB) DDR5 6000MHz CL30 White',
    tdpWattage: 0, performanceTier: 4,
    specs: {
      type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '6000',
      casLatency: 'CL30', profile: 'XMP 3.0 & EXPO', rgb: 'Yes', color: 'White',
    },
    url: 'https://www.amazon.sa/dp/B0B3HGJ4V7',
    description: `### TeamGroup T-Force Delta RGB 32GB DDR5 6000 CL30 White

الطقم الذي يجمع الأربعة معاً: 6000 ميجاهرتز، وكمون CL30، وإضاءة RGB، ولونٌ أبيض — وهي توليفة لم تكن في الكتالوج إطلاقاً.

التقنيات الأساسية المدعومة:

[green]6000 CL30:[/green] النقطة المثلى لمعالجات Ryzen 7000 و9000 — التردّد الذي تعمل عنده ساعةُ الرابط بأفضل توافق، بأقلّ كمون في فئتها.

[green]XMP 3.0 وEXPO معاً:[/green] بروفايل جاهز لكلٍّ من إنتل وAMD — لا تحتاج ضبطاً يدوياً على أي منصّة.

[green]إضاءة بزاوية 120 درجة:[/green] شريط ناشر عريض لا نقاط مضيئة، بمتحكّم RGB ذكي يتزامن مع برامج اللوحات الأمّ.

[green]ECC داخل الرقاقة وPMIC مبرَّد:[/green] تصحيح أخطاء آنيّ وتنظيم طاقة على العصا نفسها — وهو ما يميّز DDR5 عن سابقتها.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المشتّت المضيء أعلى من الأطقم المنخفضة — يُقاس مقابل مبرّد المعالج الهوائي الضخم قبل الشراء.
* 32 جيجابايت تكفي الألعاب والعمل، وتضيق أمام الرندر الثقيل ومحاكاة البيانات.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تعمل في لوحات DDR4 — منصّات AM5 وLGA1700/1851 المزوّدة بـDDR5 فقط.

---
بإمكانك التوجه إلى [Silicon Power Zenith DDR5 32GB](/components/${ZENITH}) إذا كان توجهك يتركز على الآتي:
* نفس السرعة والكمون بلا إضاءة وبمشتّت أخفض، لمن يريد الأداء دون المظهر.
https://www.teamgroupinc.com/en/product-detail/memory/T-FORCE/delta-rgb-ddr5-white/`,
  },
  {
    categoryId: RAM, brand: 'Corsair', name: 'Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30 White',
    tdpWattage: 0, performanceTier: 4,
    specs: {
      type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '6000',
      casLatency: 'CL30', profile: 'XMP 3.0 & EXPO', rgb: 'Yes', color: 'White',
    },
    url: 'https://www.amazon.sa/dp/B0DPJ9DJ3D',
    description: `### Corsair Vengeance RGB 32GB DDR5 6000 CL30 White

نفس مواصفة الطقم السابق من بيتٍ أعرق في الذاكرة، بعشر مناطق إضاءة مستقلّة لكل عصا وتنظيم جهدٍ على اللوحة نفسها.

التقنيات الأساسية المدعومة:

[green]عشر مناطق RGB لكل عصا:[/green] أدقّ تحكّماً من الأشرطة المستمرّة، وتُدار ببرنامج iCUE أو ببرنامج لوحتك الأمّ.

[green]6000 MT/s بكمون CL30-36-36-76:[/green] عند جهد 1.40 فولت.

[green]XMP 3.0 وEXPO:[/green] بروفايلان مزدوجان — تفعيلٌ بضغطة على إنتل وAMD معاً.

[green]تنظيم جهد على العصا:[/green] يجعل كسر السرعة اليدوي أثبت وأدقّ لمن يتجاوز البروفايل الجاهز.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* جهد 1.40 فولت أعلى من بعض الأطقم المنافسة عند السرعة نفسها — حرارة أعلى قليلاً داخل كيسٍ ضيّق التهوية.
* ارتفاع المشتّت يزاحم المبرّدات الهوائية الضخمة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* DDR5 فقط — لا تعمل في لوحات DDR4.

---
بإمكانك التوجه إلى [Silicon Power Zenith DDR5 32GB](/components/${ZENITH}) إذا كان توجهك يتركز على الآتي:
* نفس السرعة والكمون بسعرٍ أقلّ، بلا إضاءة ولا لونٍ أبيض.
https://www.corsair.com/us/en/p/memory/cmh32gx5m2b6000z30w/vengeance-rgb-32gb-2x16gb-ddr5-dram-6000mts-cl30-amd-expo-intel-xmp-memory-kit-white-cmh32gx5m2b6000z30w`,
  },
];

// ---------------------------------------------------------------- التنفيذ
const amazon = await prisma.store.findFirst({ where: { slug: 'amazon' }, select: { id: true } });
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
writeFileSync(`backups/added-ddr5-white-${stamp}.json`, JSON.stringify(PARTS, null, 2));
const ids = [];
for (const p of PARTS) {
  const { url, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  await prisma.componentOffer.create({ data: { componentId: c.id, storeId: amazon.id, url, inStock: true } });
  ids.push(c.id);
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}
console.log(`\nنسخ للتالي:\n${ids.join(' ')}`);
await prisma.$disconnect();
