/**
 * ============ كيسا Mini-ITX ============
 *
 * الكتالوج فيه كيسا Mini-ITX اثنان فقط (NZXT H210 بـ٤٥٤ ﷼ وNR200P بـ٨٤٥)،
 * وأولهما يقبل كرتاً حتى ٣٢٥ مم والثاني ٣٣٠ — أي أن من يريد جهازاً صغيراً
 * أمامه خياران لا ثالث لهما.
 *
 * ⚠️ وكلاهما هنا يشترط مزوّد **SFX أو SFX-L** لا ATX — ومحرّك التوافق في
 * الموقع لا يفحص شكل المزوّد مقابل الكيس (يفحص القدرة فقط). فمن يختار
 * أحدهما مع مزوّد ATX تمرّ تجميعته وهي لا تُركَّب. كُتب التحذير في وصفَيهما
 * صراحةً، والكتالوج فيه أربعة مزوّدات SFX تصلح لهما.
 *
 *   node scripts/add-itx-cases.mjs --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const CASE = 'cmpfziquj0006x4ym53f0ehcw';
const H210 = 'cmpieb2em000900ymqr0r68gv';
const NR200P = 'cmpieb303000b00ymn7wfi2t2';

const PARTS = [
  {
    categoryId: CASE, brand: 'Corsair', name: '2000D Airflow Mini-ITX',
    tdpWattage: 0, performanceTier: 3,
    specs: {
      formFactor: 'Mini-ITX', maxGpuLength: '320', radiatorSupport: '360mm',
      airflow: 'High Airflow Mesh', frontPanel: 'Mesh', sidePanel: 'Mesh',
    },
    url: 'https://www.cazasouq.com/corsair-2000d-airflow-mini-itx-case-19881',
    description: `### Corsair 2000D Airflow Mini-ITX

برجٌ عمودي ضيّق (200×271 مم قاعدةً و458 مم ارتفاعاً) يقبل كرتاً حتى **320 مم** ورادييتر 360 — أرقامٌ لا تجدها عادةً في هذا الحجم.

التقنيات الأساسية المدعومة:

[green]كرت حتى 320 مم:[/green] أطول ممّا يقبله كيسا Mini-ITX الآخران في الكتالوج، فيتّسع لكروت الفئة العليا.

[green]رادييتر 360 مم:[/green] على حاملٍ جانبي — تبريد مائي كامل في هيكل صغير.

[green]شبكة من ثلاث جهات:[/green] الواجهة والجانبان مفتوحة للهواء، وتقبل حتى ثماني مراوح 120 مم.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **يشترط مزوّد SFX أو SFX-L** — لا يقبل مزوّد ATX العادي مهما كانت قدرته. وفحص التوافق في الموقع يقارن القدرة لا الشكل، فانتبه: الكتالوج فيه أربعة مزوّدات SFX تصلح له.
* ثلاث فتحات توسعة فقط.
* بلا مراوح مرفقة — تُحسب تكلفتها فوق السعر.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات Micro-ATX ولا ATX — Mini-ITX وحدها.
* التصميم المفتوح يعني ضجيجاً أعلى من الكيسات المغلقة.

---
بإمكانك التوجه إلى [NZXT H210 Mini ITX](/components/${H210}) إذا كان توجهك يتركز على الآتي:
* يقبل مزوّد SFX ولكن بتصميم أهدأ وسعر أقلّ، مع كرتٍ أقصر.
https://www.corsair.com/us/en/p/pc-cases/cc-9011244-ww/2000d-airflow-mini-itx-pc-case-black-cc-9011244-ww`,
  },
  {
    categoryId: CASE, brand: 'Lian Li', name: 'A4-H2O Mini-ITX',
    tdpWattage: 0, performanceTier: 4,
    specs: {
      formFactor: 'Mini-ITX', maxGpuLength: '322', radiatorSupport: '240mm',
      pcieRiser: 'Included', sidePanel: 'Aluminum',
    },
    url: 'https://www.cazasouq.com/lian-li-a4h2o-mini-itx-case-black-aa18305',
    description: `### Lian Li A4-H2O Mini-ITX

أحد عشر لتراً فقط — وهو من أصغر ما يقبل كرتاً بثلاث فتحات وطول **322 مم** مع رادييتر 240. صُمّم بالتعاون مع DAN Cases، وهي مرجعٌ في هذه الفئة.

التقنيات الأساسية المدعومة:

[green]11 لتراً فحسب:[/green] حجمٌ يقارب جهاز ألعاب منزلي، ويحمل عتاد جهاز كامل.

[green]كرت حتى 322 مم بثلاث فتحات:[/green] تخطيط «الشطيرة» يضع الكرت في طبقة واللوحة في أخرى، فيتّسع لما لا يتّسع له حجمه ظاهرياً.

[green]كابل رايزر PCIe 4.0 مرفق:[/green] لا يُشترى منفصلاً — وهو بندٌ مكلف في كيسات هذه الفئة.

[green]رادييتر 240 مم بسماكة حتى 55 مم:[/green] تبريد مائي حقيقي لا اسمي.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **يشترط مزوّد SFX أو SFX-L** — ومحرّك التوافق هنا يفحص القدرة لا الشكل، فتأكّد بنفسك.
* ارتفاع مبرّد المعالج محدود جداً؛ التبريد الهوائي الضخم غير وارد.
* التجميع فيه يحتاج صبراً وترتيباً — ليس كيس مبتدئين.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* Mini-ITX وحدها.
* بلا مراوح مرفقة، وبلا مساحة لأقراص كثيرة.

---
بإمكانك التوجه إلى [Cooler Master MasterBox NR200P](/components/${NR200P}) إذا كان توجهك يتركز على الآتي:
* حجمٌ أكبر قليلاً وتجميعٌ أسهل، مع قبول مبرّدات هوائية أطول.
https://lian-li.com/product/a4h2o/`,
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
writeFileSync(`backups/added-itx-${stamp}.json`, JSON.stringify(PARTS, null, 2));
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
