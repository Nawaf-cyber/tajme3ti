/**
 * ============ سدّ شيبست A620 — الغائب تماماً ============
 *
 * الكتالوج فيه ٢٠ لوحة AM5 موزّعة على B650 وB650E وX670E وX870 وX870E،
 * و**صفر** من A620 — وهو مدخل AMD الاقتصادي إلى المنصّة. فأرخص لوحة AM5
 * كانت ٥٧٦ ﷼ بينما أرخص معالج AM5 (Ryzen 5 7500F) بـ٥٩٢ — أي أن اللوحة
 * كانت تكلّف كالمعالج، وهو ما لا يُبنى عليه جهاز اقتصادي.
 *
 * وA620 ليس تقليصاً عشوائياً: يُسقط كسر سرعة المعالج ويقلّل مسارات PCIe،
 * ويُبقي كل ما يحتاجه من يشتري معالجاً غير قابل للكسر أصلاً.
 *
 * الثلاث مرتّبة تصاعدياً في ما تعطيه لا في السعر وحده:
 *   PRIME A620M-K   — فتحتا رام، منفذ M.2 واحد. أقلّ ما يعمل.
 *   PRO A620M-E     — مثلها، بذاكرة تصل إلى 6000+ كسر سرعة.
 *   TUF A620M-PLUS  — أربع فتحات رام و192GB ومنفذا M.2 وواي‑فاي 6.
 *
 * المواصفات من صفحات الصانع.
 *
 *   node scripts/add-a620-boards.mjs           # عرض
 *   node scripts/add-a620-boards.mjs --apply   # تنفيذ مع نسخة احتياطية
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const MB_CAT = 'cmpfziqe70001x4ym928tt3o2';

const B650M_DS3H = 'cmpiec87q003900ymbge1evlg';
const RYZEN_7500F = 'cmrd7ir6a000004l6ytznx4nk';

const PARTS = [
  {
    categoryId: MB_CAT, brand: 'ASUS', name: 'PRIME A620M-K',
    tdpWattage: 0, performanceTier: 1,
    specs: {
      socket: 'AM5', chipset: 'A620', formFactor: 'Micro-ATX',
      ramType: 'DDR5', maxRam: '96GB', m2Slots: '1', pcieVersion: 'PCIe 4.0',
    },
    url: 'https://www.amazon.sa/dp/B0C6HWSX8C',
    description: `### ASUS PRIME A620M-K

أرخص باب إلى منصّة AM5 في الكتالوج — لوحة تعطي ما يلزم لتشغيل معالج Ryzen حديث وكرت شاشة وقرص NVMe، وتترك ما عداه.

التقنيات الأساسية المدعومة:

[green]مقبس AM5 حيّ:[/green] يقبل معالجات Ryzen من الجيلين 7000 و9000 — منصّة ما زالت تتلقّى معالجات جديدة، بخلاف AM4.

[green]PCIe 4.0 لكرت الشاشة وM.2:[/green] الفتحة الرئيسية ومنفذ التخزين كلاهما من الجيل الرابع.

[green]DDR5 حتى 96 جيجابايت:[/green] فتحتان تكفيان طقماً مزدوج القناة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا ذاكرة فقط — لا توسعة لاحقة بإضافة عصاتين.
* منفذ M.2 واحد؛ القرص الثاني يكون SATA.
* شيبست A620 لا يدعم كسر سرعة المعالج (يدعم EXPO للذاكرة).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا واي‑فاي ولا بلوتوث مدمج.
* مراحل طاقة أساسية — لا تناسب معالجات Ryzen 9 تحت حمل طويل.

---
بإمكانك التوجه إلى [Gigabyte B650M DS3H](/components/${B650M_DS3H}) إذا كان توجهك يتركز على الآتي:
* أربع فتحات ذاكرة ومنافذ M.2 أكثر.
* شيبست B650 يفتح كسر سرعة المعالج.
https://www.asus.com/motherboards-components/motherboards/prime/prime-a620m-k/techspec/`,
  },
  {
    categoryId: MB_CAT, brand: 'MSI', name: 'PRO A620M-E',
    tdpWattage: 0, performanceTier: 1,
    specs: {
      socket: 'AM5', chipset: 'A620', formFactor: 'Micro-ATX',
      ramType: 'DDR5', maxRam: '96GB', memorySpeed: '6000+ MHz (OC)',
      m2Slots: '1', pcieVersion: 'PCIe 4.0',
    },
    url: 'https://www.amazon.sa/dp/B0BZW9RG3P',
    description: `### MSI PRO A620M-E

لوحة A620 من خطّ PRO المكتبي — تركّز على الثبات لا على الزينة، وتقبل ذاكرة أسرع ممّا تعد به فئتها.

التقنيات الأساسية المدعومة:

[green]DDR5 حتى 6000+ كسر سرعة:[/green] أعلى من الأساس 4800، وهو التردّد الذي تستفيد منه معالجات Ryzen 7000 فعلاً.

[green]M.2 بـPCIe 4.0 x4:[/green] المنفذ متّصل بالمعالج مباشرةً، فيعمل بكامل سرعته.

[green]مقبس AM5:[/green] مسار ترقية مفتوح حتى الجيل 9000.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا ذاكرة فقط بسقف 96 جيجابايت.
* منفذ M.2 واحد.
* A620 بلا كسر سرعة للمعالج.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا واي‑فاي مدمج.
* منفذ DVI في اللوحة الخلفية — وهو معيار قديم لا يفيد الشاشات الحديثة.

---
بإمكانك التوجه إلى [Ryzen 5 7500F](/components/${RYZEN_7500F}) لتكملة التجميعة — وهو أرخص معالج AM5 في الموقع ويناسب هذه اللوحة تماماً.
https://www.msi.com/Motherboard/PRO-A620M-E`,
  },
  {
    categoryId: MB_CAT, brand: 'ASUS', name: 'TUF Gaming A620M-Plus WiFi',
    tdpWattage: 0, performanceTier: 2,
    specs: {
      socket: 'AM5', chipset: 'A620', formFactor: 'Micro-ATX',
      ramType: 'DDR5', maxRam: '192GB', m2Slots: '2', pcieVersion: 'PCIe 4.0',
    },
    url: 'https://www.amazon.sa/dp/B0C18ZN97N',
    description: `### ASUS TUF Gaming A620M-Plus WiFi

A620 لكنها ليست منزوعة: أربع فتحات ذاكرة ومنفذا M.2 وواي‑فاي 6 وشبكة 2.5 جيجابت — أي أنها تسقط كسر سرعة المعالج وحده وتحتفظ بالباقي.

التقنيات الأساسية المدعومة:

[green]4 فتحات DDR5 حتى 192 جيجابايت:[/green] ضِعف ما تعطيه لوحات A620 الأخرى، مع مجال للتوسعة لاحقاً.

[green]منفذا M.2 بـPCIe 4.0 x4:[/green] قرصان سريعان بلا تنازل، وكلاهما مقاس 2280.

[green]Wi-Fi 6 وشبكة 2.5Gb:[/green] لا حاجة إلى بطاقة شبكة منفصلة.

[green]مكوّنات TUF:[/green] مراحل طاقة ومكثّفات أمتن من فئة الدخول، تتحمّل معالجات أعلى.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* شيبست A620 لا يدعم كسر سرعة المعالج — تبقى ميزته في الذاكرة (EXPO).
* مسارات PCIe أقلّ من B650 للفتحات الثانوية.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعرها يقترب من لوحات B650 — فإن كنت تنوي كسر السرعة فالفارق لا يستحقّ التنازل.

---
بإمكانك التوجه إلى [Gigabyte B650M DS3H](/components/${B650M_DS3H}) إذا كان توجهك يتركز على الآتي:
* كسر سرعة المعالج، وهو ما يمنعه شيبست A620 مهما كانت اللوحة.
https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-a620m-plus-wifi/techspec/`,
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
writeFileSync(`backups/added-a620-${stamp}.json`, JSON.stringify(PARTS, null, 2));
console.log(`\nنسخة احتياطية: backups/added-a620-${stamp}.json`);

const ids = [];
for (const p of PARTS) {
  const { url, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  await prisma.componentOffer.create({ data: { componentId: c.id, storeId: amazon.id, url, inStock: true } });
  ids.push(c.id);
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}

console.log(`\nالتالي:\n  npx tsx scripts/scrape-one.ts ${ids.join(' ')}\n  npx tsx scripts/fetch-images.ts --missing`);
await prisma.$disconnect();
