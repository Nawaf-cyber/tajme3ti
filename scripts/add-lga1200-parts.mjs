/**
 * ============ إضافة قطعتَي LGA1200 ============
 *
 * طلبان من الزوّار: Intel Core i5-10400F وGigabyte Z490 UD AC.
 *
 * المواصفات كلّها من صفحة الصانع لا من بائعٍ ولا من موقع تجميع:
 *   - المعالج: Intel ARK (SKU 199278)
 *   - اللوحة: gigabyte.com/Motherboard/Z490-UD-AC-rev-10/sp
 *
 * ⚠️ وفَرْقٌ التقطته صفحة الصانع وأخطأته المواقع الأخرى: سرعة الذاكرة على
 * هذه اللوحة تتبع **فئة المعالج**. المواقع تنشر «حتى 4500 MHz (O.C.)»،
 * وصفحة جيجابايت تفصّل: i9/i7 تصل إلى 4500 كسر سرعة، أما **i5/i3
 * فتقف عند 2666 رسمياً بلا كسر سرعة**. والطلب هنا i5 — فالرقم المنشور
 * لا ينطبق على هذه التوليفة بالذات.
 *
 *   node scripts/add-lga1200-parts.mjs           # عرض الخطة فقط
 *   node scripts/add-lga1200-parts.mjs --apply   # تنفيذ مع نسخة احتياطية
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const CAT = {
  CPU: 'cmpfziqb20000x4ymfmkovawm',
  Motherboard: 'cmpfziqe70001x4ym928tt3o2',
};

/* ============ الروابط ============
 *
 * تُملأ يدوياً: بحثتُ في متاجر الموقع الأربعة فلم أجد القطعتين مفردتين
 * (كازاسوق وميكروليس: لا نتائج؛ نون: أجهزة مجمّعة تحوي المعالج لا المعالج
 * نفسه؛ أمازون: تعذّر الوصول آلياً). وربطُ جهازٍ مجمّع كعرضٍ لمعالج هو
 * بالضبط خطأ «الرابط يشير لمنتج آخر» الذي يحرسه الموقع.
 *
 * الشكل: { amazon: 'https://…', noon: 'https://…' }
 * السعر والتوفّر يقرؤهما السحب من الرابط، فلا تُكتب هنا.
 */
const LINKS = {
  'Core i5-10400F': {},
  'Z490 UD AC': {},
};

const PARTS = [
  {
    categoryId: CAT.CPU,
    brand: 'Intel',
    name: 'Core i5-10400F',
    tdpWattage: 65,
    performanceTier: 2,
    specs: {
      socket: 'LGA1200',
      cores: '6',
      threads: '12',
      baseClock: '2.9 GHz',
      boostClock: '4.3 GHz',
      l3Cache: '12MB',
      memorySupport: 'DDR4-2666',
      architecture: 'Comet Lake',
    },
    description: `### Intel Core i5-10400F

معالج سداسي النواة من الجيل العاشر (Comet Lake) بمقبس LGA1200 — منصّة أُغلقت بعد الجيل الحادي عشر، فلا مسار ترقية للمعالج بعدها.

التقنيات الأساسية المدعومة:

[green]6 Cores / 12 Threads:[/green] ست أنوية باثني عشر مساراً، تكفي الألعاب والمهام اليومية بلا اختناق.

[green]12MB L3 Cache:[/green] ذاكرة مخبأة وافرة لفئته، تفيد في الألعاب التي يقودها المعالج.

[green]65W TDP:[/green] استهلاك منخفض يعمل بمبرّد الصندوق المرفق بلا حاجة إلى مبرّد إضافي.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الذاكرة تقف عند DDR4-2666 رسمياً، وهي أبطأ ممّا تجده في أي منصّة حديثة.
* منافذ PCIe من معيار 3.0 فقط، فكروت الشاشة وأقراص NVMe الحديثة تعمل دون سقفها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا رسوميات مدمجة (اللاحقة F) — يلزمه كرت شاشة منفصل ليعمل أصلاً.
* غير قابل لكسر السرعة، ومقبس LGA1200 متوقّف فلا ترقية لاحقة.

---
بإمكانك التوجه إلى معالج [Core i5-12400F](/components/cmrd7is1t000604l65w1djfbi) إذا كان توجهك يتركز على الآتي:
* أداء أعلى محسوس بفارق سعر قريب، ويعمل بذاكرة DDR4 كذلك.
* منصّة LGA1700 أحدث وأوسع خياراً في اللوحات.
https://www.intel.com/content/www/us/en/products/sku/199278/intel-core-i510400f-processor-12m-cache-up-to-4-30-ghz/specifications.html`,
  },
  {
    categoryId: CAT.Motherboard,
    brand: 'Gigabyte',
    name: 'Z490 UD AC',
    tdpWattage: 0,
    performanceTier: 2,
    specs: {
      socket: 'LGA1200',
      chipset: 'Z490',
      formFactor: 'ATX',
      ramType: 'DDR4',
      maxRam: '128GB',
      memorySpeed: 'DDR4-2666 (4500 O.C.)',
      m2Slots: '2',
      pcieVersion: 'PCIe 3.0',
    },
    description: `### Gigabyte Z490 UD AC

لوحة ATX بشيبست Z490 ومقبس LGA1200، تدعم الجيل العاشر من معالجات Intel وحده، وتأتي بشبكة لاسلكية مدمجة.

التقنيات الأساسية المدعومة:

[green]Wi-Fi AC + Bluetooth 5:[/green] وحدة Intel Wi-Fi AC 9462 مدمجة — وهي ما تعنيه لاحقة AC في الاسم، فتوفّر شراء بطاقة شبكة منفصلة.

[green]Dual M.2:[/green] منفذا M.2 لأقراص NVMe، ومعهما ستة منافذ SATA 6Gb/s.

[green]4x DDR4 up to 128GB:[/green] أربع فتحات ذاكرة تصل إلى 128 جيجابايت (32 لكل فتحة).

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سرعة الذاكرة تتبع فئة المعالج: مع i5 وi3 تقف عند DDR4-2666 رسمياً، ولا يُفتح كسر السرعة حتى 4500 إلا مع i7 وi9.
* شيبست Z يسمح بكسر سرعة المعالج، لكن مرحلات الطاقة في هذه الفئة الاقتصادية لا تناسب معالجات i9 تحت حمل طويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* كل منافذ PCIe من معيار 3.0 — بلا PCIe 4.0.
* لا تدعم الجيل الحادي عشر (Rocket Lake)، فمسار الترقية مقفل عند الجيل العاشر.

---
بإمكانك التوجه إلى لوحة [B760M Pro RS](/components/cmpieb67b000m00ymc9cu16eo) إذا كان توجهك يتركز على الآتي:
* منصّة LGA1700 ما زالت حيّة، فمسار ترقية المعالج مفتوح.
* شيبست أحدث بمنافذ PCIe 4.0.
https://www.gigabyte.com/Motherboard/Z490-UD-AC-rev-10/sp`,
  },
];

// ---------------------------------------------------------------- التنفيذ

const stores = await prisma.store.findMany({ select: { id: true, slug: true } });
const storeId = Object.fromEntries(stores.map((s) => [s.slug, s.id]));

let blocked = false;
for (const p of PARTS) {
  const existing = await prisma.component.findFirst({ where: { name: p.name } });
  const links = LINKS[p.name] || {};
  const linkCount = Object.keys(links).length;

  console.log(`\n=== ${p.brand} ${p.name}`);
  console.log(`    موجودة مسبقاً؟ ${existing ? 'نعم — ' + existing.id : 'لا'}`);
  console.log(`    المواصفات: ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  console.log(`    الروابط: ${linkCount === 0 ? '⛔ لا شيء' : Object.entries(links).map(([s, u]) => `${s}=${u.slice(0, 50)}…`).join(' · ')}`);

  for (const s of Object.keys(links)) {
    if (!storeId[s]) { console.log(`    ⛔ متجر غير معروف: ${s}`); blocked = true; }
  }
  if (linkCount === 0) blocked = true;
}

if (blocked) {
  console.log(`\n⛔ متوقّف: قطعةٌ بلا رابط تُنشأ بسعر صفر — تظهر «0 ﷼» للزائر،`);
  console.log(`   وتُحتسب في لوحة الإدارة قطعةً بلا عرض. املأ LINKS في أعلى الملف.`);
  await prisma.$disconnect();
  process.exit(1);
}

if (!apply) {
  console.log('\n(عرضٌ فقط — أضف --apply للتنفيذ)');
  await prisma.$disconnect();
  process.exit(0);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-lga1200-${stamp}.json`, JSON.stringify(PARTS, null, 2));
console.log(`\nنسخة احتياطية: backups/added-lga1200-${stamp}.json`);

for (const p of PARTS) {
  const { description, specs, ...rest } = p;
  const created = await prisma.component.create({
    data: { ...rest, description, specs, price: 0 },
  });
  for (const [slug, url] of Object.entries(LINKS[p.name])) {
    await prisma.componentOffer.create({
      data: { componentId: created.id, storeId: storeId[slug], url, inStock: true },
    });
  }
  console.log(`✔ ${p.name} → ${created.id}`);
}

console.log('\nالخطوة التالية: شغّل تحديث الأسعار ليقرأ السحبُ السعرَ والتوفّر من الروابط.');
await prisma.$disconnect();
