/**
 * ============ سدّ فجوة المزوّدات ٥٥٠–٦٥٠ واط ============
 *
 * الكتالوج قبل هذا: مزوّدٌ واحد عند ٥٥٠ وواحد عند ٦٥٠، مقابل **عشرة** عند
 * ٨٥٠ وخمسة عند ٧٥٠. وكل تجميعة اقتصادية تنتهي عند ذلك الطرف الضيّق —
 * فمُنتقي المزوّد الآلي يختار الأرخص الذي يكفي القدرة المطلوبة، ولم يكن
 * أمامه ما يختار بينه. وتدرّج **٦٠٠ واط كان غائباً تماماً**.
 *
 * الثلاثة مأخوذة من قسم المزوّدات في كازاسوق (١٠٤ منتجاً) لا من بحثٍ عام،
 * والمواصفات من صفحات الصانع.
 *
 * ⚠️ وتصحيحٌ التقطه التحقّق: MSI MAG A600DN ليست 80+ Bronze كما يُظنّ من
 * أخواتها في العائلة (A550BN برونزية وA650GL ذهبية) — هي **80 PLUS
 * قياسية (بيضاء)** بذروة كفاءة ٨١٪. كتابتها «برونزية» كانت ستكون رقماً
 * مخترعاً في جدول يقارن به الزائر.
 *
 *   node scripts/add-budget-psus.mjs           # عرض الخطة
 *   node scripts/add-budget-psus.mjs --apply   # تنفيذ مع نسخة احتياطية
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const PSU_CAT = 'cmpfziqh70002x4ym6ln587z2';

/* السعر والتوفّر لا يُكتبان هنا: السحب يقرؤهما من الرابط ويبقيهما محدّثين.
   قطعةٌ بسعرٍ مكتوب يدوياً تتجمّد عند لحظة كتابتها. */
const PARTS = [
  {
    categoryId: PSU_CAT,
    brand: 'DeepCool',
    name: 'PL550D',
    tdpWattage: 0,
    performanceTier: 2,
    specs: {
      wattage: '550',
      rating: '80+ Bronze',
      modularity: 'Non-Modular',
      formFactor: 'ATX 3.0',
    },
    url: 'https://www.cazasouq.com/deepcool-pl550d-550w-bronze-atx3-0-pcie-5-0-psu-21317',
    description: `### DeepCool PL550D

مزوّد ٥٥٠ واط بمعيار ATX 3.0 وموصّل PCIe 5.0 أصلي — وهو أرخص مدخل في الكتالوج إلى المعيار الحديث دون القفز إلى فئة ٧٥٠ واط.

التقنيات الأساسية المدعومة:

[green]Native 12VHPWR:[/green] كابل PCIe 5.0 مدمج بقدرة 300 واط، فلا يلزمك محوّل مع كروت الشاشة الحديثة.

[green]ATX 3.0 Power Excursion:[/green] يحتمل ضعف قدرته لجزء من الألف من الثانية، وهي القفزات اللحظية التي تُسقط المزوّدات القديمة أمام كروت اليوم.

[green]80+ Bronze:[/green] كفاءة برونزية بنحو ٨٥٪ عند نصف الحمل، ومروحة 120 مم بمحمل هيدروليكي.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* كابلات غير قابلة للفصل، فالزائد منها يُخبّأ داخل الصندوق.
* ٥٥٠ واط تكفي كرتاً متوسطاً ولا تكفي الفئة العليا.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* كفاءة برونزية لا ذهبية، فالهدر والحرارة أعلى قليلاً.

---
بإمكانك التوجه إلى [MSI MAG A750GL PCIe 5](/components/cmpnewmaga750gl000000000) إذا كان توجهك يتركز على الآتي:
* كفاءة ذهبية وكابلات قابلة للفصل بالكامل.
* مئتا واط إضافية تفتح الباب لكروت أعلى لاحقاً.
https://www.deepcool.com/products/Gaming/powersupplies/PL-D-Series-ATX30-Power-Supply/`,
  },
  {
    categoryId: PSU_CAT,
    brand: 'MSI',
    name: 'MAG A600DN',
    tdpWattage: 0,
    performanceTier: 1,
    specs: {
      wattage: '600',
      rating: '80+ Standard',
      modularity: 'Non-Modular',
      formFactor: 'ATX',
    },
    url: 'https://www.cazasouq.com/msi-mag-a600dn-600w-psu-aa15273',
    description: `### MSI MAG A600DN

مزوّد ٦٠٠ واط من عائلة MAG، يملأ الفراغ بين ٥٥٠ و٦٥٠ واط بأقل تكلفة ممكنة للتجميعات المكتبية والاقتصادية.

التقنيات الأساسية المدعومة:

[green]600W للتجميعات الاقتصادية:[/green] هامش مريح فوق ٥٥٠ واط لمعالج متوسط مع كرت شاشة من الفئة الدنيا أو المتوسطة.

[green]Active PFC:[/green] تصحيح معامل القدرة الفعّال يعطي جهداً أثبت عند تذبذب الكهرباء.

[green]مروحة 120 مم:[/green] بمحمل هيدروليكي وتشغيل هادئ تحت الحمل العادي.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* شهادة 80 PLUS **قياسية** (بيضاء) لا برونزية — ذروة كفاءتها نحو ٨١٪، وهي أدنى ما في الكتالوج.
* كابلات غير قابلة للفصل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدعم ATX 3.0 ولا كابل 12VHPWR.
* غير مناسب لكروت الشاشة القوية ولا للتجميعات عالية الاستهلاك.

---
بإمكانك التوجه إلى [MSI MAG A650GL](/components/cmpi5h9s2000704l1iq4czxdf) إذا كان توجهك يتركز على الآتي:
* كفاءة ذهبية بدل القياسية، وهي فرق ملموس في الهدر والحرارة.
* خمسون واطاً إضافية بفارق سعر معقول.
https://www.msi.com/Power-Supply/MAG-A600DN/Specification`,
  },
  {
    categoryId: PSU_CAT,
    brand: 'Gigabyte',
    name: 'P650SS ICE',
    tdpWattage: 0,
    performanceTier: 2,
    specs: {
      wattage: '650',
      rating: '80+ Silver',
      modularity: 'Non-Modular',
      formFactor: 'ATX 3.0',
      color: 'White',
    },
    url: 'https://www.cazasouq.com/gigabyte-p650ss-ice-650w-silver-atx3-0-non-modular-psu-39773',
    description: `### Gigabyte P650SS ICE

مزوّد ٦٥٠ واط بشهادة فضّية ومعيار ATX 3.0، وهو المزوّد الأبيض الوحيد في الكتالوج — يخدم التجميعات البيضاء التي تضطرّ اليوم إلى مزوّد أسود.

التقنيات الأساسية المدعومة:

[green]80+ Silver:[/green] كفاءة فضّية تصل إلى ٩٠٪ عند نصف الحمل (٢٣٠ فولت)، أعلى من البرونزية وأقلّ تكلفة من الذهبية.

[green]ATX 3.0 / 3.1:[/green] يحتمل قفزات القدرة حتى ٢٠٠٪ وفق دليل Intel، فيثبت أمام كروت الشاشة الحديثة.

[green]مروحة FDB:[/green] محمل مائي ديناميكي بطبقة زيت تمتصّ الاهتزاز، أهدأ وأطول عمراً من المحامل الكروية.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* كابلات غير قابلة للفصل، وإن كانت مسطّحة تسهّل التمرير خلف اللوح.
* موصّلا PCIe من نوع 6+2 فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا كابل 12VHPWR مخصّص رغم توافقه مع ATX 3.0 — فكروت الفئة العليا تحتاج محوّلاً.

---
بإمكانك التوجه إلى [MSI MAG A750GL PCIe 5](/components/cmpnewmaga750gl000000000) إذا كان توجهك يتركز على الآتي:
* موصّل 12VHPWR أصلي وكابلات قابلة للفصل بالكامل.
* كفاءة ذهبية ومئة واط إضافية.
https://www.gigabyte.com/Power-Supply/GP-P650SS-ICE/sp`,
  },
];

// ---------------------------------------------------------------- التنفيذ

const caza = await prisma.store.findFirst({ where: { slug: 'cazasouq' }, select: { id: true } });
if (!caza) { console.error('⛔ متجر كازاسوق غير موجود'); process.exit(1); }

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
  /* الرابط نفسه على قطعتين يعني عرضين يشيران لمنتج واحد — وهو أصل خطأ
     «السعر من صفحة منتج آخر» الذي يحرسه الموقع. */
  if (urlTaken) { console.log(`    ⛔ الرابط مستعمل في: ${urlTaken.component.name}`); blocked = true; }
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply للتنفيذ)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-psus-${stamp}.json`, JSON.stringify(PARTS, null, 2));
console.log(`\nنسخة احتياطية: backups/added-psus-${stamp}.json`);

for (const p of PARTS) {
  const { url, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  await prisma.componentOffer.create({
    data: { componentId: c.id, storeId: caza.id, url, inStock: true },
  });
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}

console.log('\nالخطوة التالية: شغّل تحديث الأسعار — السعر صفرٌ حتى يقرأه السحب من الرابط.');
await prisma.$disconnect();
