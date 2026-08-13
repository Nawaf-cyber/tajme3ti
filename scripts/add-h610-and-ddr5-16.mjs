/**
 * ============ سدّ ثغرتين كشفهما مسح المولّد ============
 *
 * ١) رام DDR5 بسعة 16GB: ثلاث قطع في الكتالوج وأسرعها 5600، و**لا واحدة
 *    عند 6000** — وهو التردّد الأمثل لمعالجات Ryzen. والمولّد التلقائي
 *    يضع 16GB في مستواه الاقتصادي، فكان يبني بأبطأ ما عندنا.
 *
 * ٢) لوحات LGA1700/H610: **واحدة** بـ٣٠٦ ﷼ لأرخص مسار إنتل كلّه
 *    (i3-13100F بـ٥٨٠). واللوحتان المضافتان DDR4 أيضاً، فتسدّان معها
 *    ثغرةً ثانية: الكتالوج فيه أربع لوحات DDR4 فقط من ٤٦.
 *
 * المواصفات من صفحتَي ASUS وMSI.
 *
 *   node scripts/add-h610-and-ddr5-16.mjs --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const RAM = 'cmpfziqks0003x4yma730h1be';
const MB = 'cmpfziqe70001x4ym928tt3o2';

const H610_OLD = 'cmryzpkmd0004c0ymi7y12o3j';   // Gigabyte H610M H DDR4
const VENG_16 = 'cmpiedh03006b00ym57kak80u';    // Corsair Vengeance 16GB 5200
const FLARE_32 = 'cmpiecrkg005h00ymkt3mt6pp';   // G.Skill Flare X5 32GB 6000
const I3_13100F = 'cmrd7irwl000504l6xm185w06';

const PARTS = [
  {
    categoryId: RAM, brand: 'G.Skill', name: 'Flare X5 16GB (2x8GB) DDR5 6000MHz CL30',
    tdpWattage: 0, performanceTier: 3, store: 'amazon',
    specs: {
      type: 'DDR5', capacity: '16GB', kit: '2x8GB', speed: '6000',
      casLatency: 'CL30', profile: 'AMD EXPO', rgb: 'No', color: 'Black',
    },
    url: 'https://www.amazon.sa/dp/B0G7PFF5N6',
    description: `### G.Skill Flare X5 16GB DDR5 6000 CL30

أوّل طقم 16 جيجابايت عند 6000 ميجاهرتز في الكتالوج — وهو التردّد الذي تعمل عنده معالجات Ryzen بأفضل توافق بين سرعة الذاكرة وساعة الرابط.

التقنيات الأساسية المدعومة:

[green]6000 CL30:[/green] النقطة المثلى لـRyzen 7000 و9000. وما كان في الكتالوج قبله من أطقم 16 جيجابايت يقف عند 5600 وأقلّ.

[green]AMD EXPO:[/green] بروفايل مُصمَّم لمنصّة AMD تحديداً، يُفعَّل بضغطة في البايوس.

[green]مشتّت منخفض بلا إضاءة:[/green] لا يزاحم مبرّدات المعالج الهوائية الضخمة — وهو ما تفعله الأطقم المضيئة العالية.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 16 جيجابايت تكفي الألعاب اليوم، وتضيق أمام البثّ والمونتاج مع اللعب.
* بروفايل EXPO موجّه لـAMD؛ يعمل على إنتل لكن قد يحتاج ضبطاً يدوياً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا إضاءة RGB.
* DDR5 فقط — لا تعمل في لوحات DDR4.

---
بإمكانك التوجه إلى [G.Skill Flare X5 32GB](/components/${FLARE_32}) إذا كان توجهك يتركز على الآتي:
* ضِعف السعة بنفس السرعة والكمون، لمن يبثّ أو يحرّر مع اللعب.
https://www.gskill.com/product/165/393/1687162081/F5-6000J3038F8GX2-FX5`,
  },
  {
    categoryId: MB, brand: 'ASUS', name: 'PRIME H610M-K D4',
    tdpWattage: 0, performanceTier: 1, store: 'cazasouq',
    specs: {
      socket: 'LGA1700', chipset: 'H610', formFactor: 'Micro-ATX',
      ramType: 'DDR4', maxRam: '64GB', memorySpeed: '3200 MHz',
      m2Slots: '1', pcieVersion: 'PCIe 4.0',
    },
    url: 'https://www.cazasouq.com/asus-prime-h610m-k-d4-gaming-motherboard-cp857-4-7539',
    description: `### ASUS PRIME H610M-K D4

لوحة H610 بذاكرة DDR4 — تفتح مسار إنتل الاقتصادي لمن يملك رامات DDR4 من جهاز سابق، فلا يشتري ذاكرة جديدة مع اللوحة.

التقنيات الأساسية المدعومة:

[green]DDR4 حتى 64 جيجابايت:[/green] فتحتان بقناة مزدوجة عند 3200 ميجاهرتز — والرام DDR4 أرخص كثيراً من DDR5 بالسعة نفسها.

[green]فتحة كرت PCIe 4.0:[/green] الجيل الرابع كاملاً للكرت رغم كون الشيبست اقتصادياً.

[green]تقبل الجيل 12 و13 و14:[/green] مسار ترقية داخل المقبس نفسه.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **منفذ M.2 يتقاسم المسار مع منفذ SATA رقم 4** — فتركيب قرص M.2 من نوع SATA يُعطّل ذلك المنفذ. (أقراص NVMe لا تتأثّر.)
* فتحتا ذاكرة فقط بسقف 64 جيجابايت.
* شيبست H610 لا يدعم كسر سرعة المعالج ولا الذاكرة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا واي‑فاي مدمج.
* شبكة 1 جيجابت لا 2.5.

---
بإمكانك التوجه إلى [MSI PRO B760M-P DDR4](/components/cmryzpkds0003c0ymzpcub8vs) إذا كان توجهك يتركز على الآتي:
* شيبست B760 يفتح كسر سرعة الذاكرة ومنافذ توسعة أكثر.
https://www.asus.com/motherboards-components/motherboards/prime/prime-h610m-k-d4/techspec/`,
  },
  {
    categoryId: MB, brand: 'MSI', name: 'PRO H610M-G WiFi DDR4',
    tdpWattage: 0, performanceTier: 1, store: 'cazasouq',
    specs: {
      socket: 'LGA1700', chipset: 'H610', formFactor: 'Micro-ATX',
      ramType: 'DDR4', maxRam: '64GB', memorySpeed: '3200 MHz',
      m2Slots: '1', pcieVersion: 'PCIe 4.0',
    },
    url: 'https://www.cazasouq.com/msi-pro-h610m-g-ddr4-wifi-motherboard-34333',
    description: `### MSI PRO H610M-G WiFi DDR4

نفس فئة H610 الاقتصادية لكن بواي‑فاي مدمج — وهو ما يوفّر شراء بطاقة شبكة، وأكثر ما يُطلب في التجميعات البعيدة عن الراوتر.

التقنيات الأساسية المدعومة:

[green]واي‑فاي مزدوج النطاق مدمج:[/green] 802.11ac على منفذ M.2 من نوع E-key مخصّص للشبكة.

[green]DDR4 حتى 64 جيجابايت:[/green] عند 3200 ميجاهرتز بقناة مزدوجة.

[green]فتحة كرت PCIe 4.0 من المعالج:[/green] وأربعة منافذ SATA.

[green]تقبل الجيل 12 و13 و14:[/green] بما فيها معالجات Core i5 و i7.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **منفذ التخزين M.2 من الجيل الثالث لا الرابع** — فقرص Gen4 يعمل فيه بنصف سرعته. (فتحة الكرت وحدها Gen4.)
* فتحتا ذاكرة فقط.
* H610 بلا كسر سرعة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* مراحل طاقة أساسية — لا تناسب معالجات i7 وi9 تحت حمل طويل.

---
بإمكانك التوجه إلى [Core i3-13100F](/components/${I3_13100F}) لتكملة التجميعة — وهو أرخص معالج LGA1700 في الموقع ويناسب هذه اللوحة تماماً.
https://www.msi.com/Motherboard/PRO-H610M-G-WIFI-DDR4`,
  },
];

// ---------------------------------------------------------------- التنفيذ
const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map(s => [s.slug, s.id]));

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
writeFileSync(`backups/added-h610-ddr5-${stamp}.json`, JSON.stringify(PARTS, null, 2));
const ids = [];
for (const p of PARTS) {
  const { url, store, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[store], url, inStock: true } });
  ids.push(c.id);
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}
console.log(`\nنسخ للتالي:\n${ids.join(' ')}`);
await prisma.$disconnect();
