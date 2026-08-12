/**
 * ============ شيبست H810 — الغائب عن LGA1851 ============
 *
 * مقبس LGA1851 في الكتالوج: لوحتا B860 ولوحتا Z890، وأرخصها **٨٠٦ ﷼**.
 * ولا شيء من H810 — وهو شيبست إنتل الاقتصادي لهذا المقبس، تماماً كما كان
 * A620 غائباً عن AM5 قبل أن نسدّه.
 *
 * والأثر نفسه: Core Ultra 5 225F بـ٩٥٠ ﷼ كان أرخص لوحة تناسبه أغلى منه
 * تقريباً. صار مدخل المقبس **٤٧٧** بدل ٨٠٦.
 *
 * والاثنتان مختلفتان في نقطة تُقاس لا في الشكل:
 *   Gigabyte H810M H   فتحة الكرت PCIe **4.0**
 *   MSI PRO H810M-B    فتحة الكرت PCIe **5.0** + شبكة 2.5 جيجابت
 *
 * المواصفات من صفحتَي الصانعين.
 *
 *   node scripts/add-h810-boards.mjs --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const MB = 'cmpfziqe70001x4ym928tt3o2';
const ULTRA225F = 'cmsqb1sxw0008gwym42i0r04s';

const b860 = await prisma.component.findFirst({ where: { name: { contains: 'B860-P' } }, select: { id: true, name: true } });

const PARTS = [
  {
    categoryId: MB, brand: 'Gigabyte', name: 'H810M H',
    tdpWattage: 0, performanceTier: 1,
    specs: {
      socket: 'LGA1851', chipset: 'H810', formFactor: 'Micro-ATX',
      ramType: 'DDR5', maxRam: '128GB', memorySpeed: '6400 MT/s (OC)',
      m2Slots: '1', pcieVersion: 'PCIe 4.0',
    },
    url: 'https://www.cazasouq.com/gigabyte-h810m-h-motherboard-33272',
    description: `### Gigabyte H810M H

أرخص باب إلى مقبس LGA1851 في الكتالوج — تعطي ما يلزم لتشغيل معالج Core Ultra حديث وكرت شاشة وقرص NVMe، وتترك ما عداه.

التقنيات الأساسية المدعومة:

[green]مقبس LGA1851:[/green] يقبل معالجات Core Ultra من السلسلة 200 — منصّة إنتل الحالية.

[green]DDR5 حتى 128 جيجابايت:[/green] فتحتان بقناة مزدوجة، وسرعة تصل إلى 6400 MT/s كسر سرعة.

[green]M.2 بـPCIe 4.0 x4:[/green] منفذ تخزين سريع متّصل بأربعة مسارات كاملة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **فتحة الكرت PCIe 4.0 لا 5.0** — لا فرق يُذكر مع كروت اليوم، لكنها نقطة الفرق بينها وبين MSI PRO H810M-B بسعرٍ قريب.
* فتحتا ذاكرة فقط — لا توسعة بإضافة عصاتين لاحقاً.
* منفذ M.2 واحد؛ القرص الثاني يكون SATA.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* شيبست H810 لا يدعم كسر سرعة المعالج.
* بلا واي‑فاي مدمج.

---
بإمكانك التوجه إلى [Core Ultra 5 225F](/components/${ULTRA225F}) لتكملة التجميعة — وهو أرخص معالج LGA1851 في الموقع ويناسب هذه اللوحة تماماً.
https://www.gigabyte.com/Motherboard/H810M-H-rev-10`,
  },
  {
    categoryId: MB, brand: 'MSI', name: 'PRO H810M-B DDR5',
    tdpWattage: 0, performanceTier: 2,
    specs: {
      socket: 'LGA1851', chipset: 'H810', formFactor: 'Micro-ATX',
      ramType: 'DDR5', maxRam: '128GB', memorySpeed: '6400 MT/s (OC)',
      m2Slots: '1', pcieVersion: 'PCIe 5.0',
    },
    url: 'https://www.cazasouq.com/msi-pro-h810m-b-ddr5-lga-1851-motherboard-39624',
    description: `### MSI PRO H810M-B DDR5

لوحة H810 تعطي فتحة كرتٍ من **الجيل الخامس** وشبكة 2.5 جيجابت — وهما ما تفتقده لوحات هذه الفئة عادةً.

التقنيات الأساسية المدعومة:

[green]فتحة كرت PCIe 5.0 x16 من المعالج:[/green] مسارات الجيل الخامس كاملة — جاهزية لكروت لا تحتاجها اليوم وقد تحتاجها غداً.

[green]شبكة Realtek 2.5 جيجابت:[/green] أسرع من الجيجابت الواحد الشائع في هذه الفئة.

[green]DDR5 حتى 128 جيجابايت بـ6400 MT/s:[/green] فتحتان بقناة مزدوجة.

[green]M.2 بـPCIe 4.0 x4 وأربعة منافذ SATA:[/green] تخزين يكفي تجميعةً كاملة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا ذاكرة فقط، ومنفذ M.2 واحد.
* شيبست H810 لا يدعم كسر سرعة المعالج.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا واي‑فاي مدمج.
* مراحل طاقة أساسية — لا تناسب معالجات Core Ultra 9 تحت حمل طويل.

---
بإمكانك التوجه إلى [${b860?.name || 'MSI PRO B860-P WiFi'}](/components/${b860?.id || ''}) إذا كان توجهك يتركز على الآتي:
* أربع فتحات ذاكرة ومنافذ M.2 أكثر وواي‑فاي مدمج.
https://www.msi.com/Motherboard/PRO-H810M-B/Specification`,
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
writeFileSync(`backups/added-h810-${stamp}.json`, JSON.stringify(PARTS, null, 2));
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
