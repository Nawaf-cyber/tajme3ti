/**
 * ============ نسختا 8 جيجابايت الغائبتان ============
 *
 * الكتالوج فيه RTX 5060 Ti بـ16GB وRX 9060 XT بـ16GB، و**صفر** من نسختَي
 * 8GB — وهما منتجان مختلفان بسعرٍ أقلّ بألف ريال تقريباً، لا مجرّد خيار
 * لوني. فمن ميزانيته عند ١٧٠٠ ﷼ كان يرى الكرتين بسعر ٢٠٥٠ و٢٨٣٥ ويظنّ
 * أنهما خارج متناوله وهما ليسا كذلك.
 *
 * ⚠️ وأثناء التحقّق ظهر خطأ في المدخلة القائمة RTX 5060 Ti 16GB:
 *   الناقل   192-bit  ←  الصحيح 128-bit
 *   الواجهة  PCIe 5.0 x16  ←  الصحيح PCIe 5.0 x8
 *   القدرة   160 واط  ←  الصحيح 180 واط
 * وشريحة GB206 لا تملك إلا ثماني مسارات كهربائية مهما بدا طول الموصّل —
 * وهذا يهمّ من يركّبها في لوحة PCIe 3.0 فتنخفض إلى ١٦ جيجابايت/ث. أُصلحت
 * الثلاثة هنا، وفُحصت بقية كروت الجيل فوُجدت سليمة.
 *
 *   node scripts/add-gpus-8gb.mjs           # عرض
 *   node scripts/add-gpus-8gb.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const GPU = 'cmpfziqnv0004x4ymffnp204c';

const TI_16 = 'cmq5060tixx00000ym00000002';
const XT_16 = 'cmr3g8py9000bncymdsx8dbv8';
const RTX5060 = 'cmq5060xx000000ym00000001';

/* تصحيح المدخلة القائمة — القيم من NVIDIA وTechPowerUp */
const FIXES = [
  { id: TI_16, specs: { memoryBus: '128-bit', interface: 'PCIe 5.0 x8' }, tdpWattage: 180 },
];

const PARTS = [
  {
    categoryId: GPU, brand: 'NVIDIA', name: 'GeForce RTX 5060 Ti 8GB', tdpWattage: 180, performanceTier: 3,
    specs: {
      vram: '8GB', memoryType: 'GDDR7', memoryBus: '128-bit', lengthMm: '215',
      powerConnectors: '1x 8-pin', interface: 'PCIe 5.0 x8',
      ports: '1x HDMI 2.1, 3x DP 2.1', architecture: 'Blackwell',
    },
    url: 'https://www.cazasouq.com/gigabyte-geforce-rtx-5060-ice-eagle-oc-8gb-gddr7-gpu-white-47605',
    description: `### GeForce RTX 5060 Ti 8GB

نفس شريحة نسخة 16 جيجابايت وبنفس تردّداتها — الفارق الوحيد سعة الذاكرة، وهو فارقٌ يظهر في ألعابٍ بعينها لا في الأداء الخام.

المعروض هنا نسخة **Gigabyte EAGLE OC ICE** البيضاء بطول 215 مم فقط.

التقنيات الأساسية المدعومة:

[green]ذاكرة GDDR7:[/green] الجيل الأحدث من ذاكرات الكروت، بسرعة 28 جيجابت/ث على ناقل 128-bit.

[green]طول 215 مم:[/green] من أقصر كروت فئته — يدخل في الكيسات المدمجة التي ترفض كروتاً أطول.

[green]موصّل 8-pin تقليدي:[/green] لا يحتاج كابل 12VHPWR ولا محوّلاً، فيعمل مع أي مزوّد قديم.

[green]DLSS 4 وتوليد الإطارات المتعدّد:[/green] ميزة معمارية Blackwell التي ترفع الإطارات في الألعاب الداعمة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **ثماني مسارات PCIe فقط** — شريحة GB206 لا تملك أكثر مهما بدا طول الموصّل. في لوحة PCIe 4.0 لا فرق يُذكر، وفي لوحة PCIe 3.0 قديمة ينخفض العرض إلى النصف.
* 8 جيجابايت تضيق في بعض ألعاب 2025-2026 عند الإعدادات العالية ودقة 1440p.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس كرت 4K — موطنه 1080p و1440p.

---
بإمكانك التوجه إلى [GeForce RTX 5060 Ti 16GB](/components/${TI_16}) إذا كان توجهك يتركز على الآتي:
* ضِعف الذاكرة لنفس الشريحة — يفتح الإعدادات العالية في 1440p ويطيل عمر الكرت.
https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/`,
  },
  {
    categoryId: GPU, brand: 'AMD', name: 'Radeon RX 9060 XT 8GB', tdpWattage: 150, performanceTier: 3,
    specs: {
      vram: '8GB', memoryType: 'GDDR6', memoryBus: '128-bit', lengthMm: '270',
      powerConnectors: '1x 8-pin', interface: 'PCIe 5.0 x16',
      ports: '1x HDMI 2.1, 3x DP 2.1', architecture: 'RDNA 4',
    },
    url: 'https://www.cazasouq.com/xfx-swift-amd-radeon-rx-9060-xt-oc-8gb-2xdp-gpu-white-28522',
    description: `### Radeon RX 9060 XT 8GB

نسخة الثمانية جيجابايت من كرت RDNA 4 الاقتصادي — نفس اثنتين وثلاثين وحدة حوسبة ونفس التردّدات، بذاكرة أقلّ وقدرة أدنى بعشرة واط.

المعروض هنا نسخة **XFX Swift OC** البيضاء بثلاث مراوح وطول 270 مم.

التقنيات الأساسية المدعومة:

[green]PCIe 5.0 بستّة عشر مساراً:[/green] بخلاف منافسه المباشر من NVIDIA الذي يقتصر على ثمانية — فلا ينخفض أداؤه في اللوحات الأقدم.

[green]32 وحدة حوسبة RDNA 4:[/green] بمسرّعات تتبّع أشعة من الجيل الثالث ومسرّعات ذكاء اصطناعي من الجيل الثاني.

[green]150 واط وموصّل 8-pin واحد:[/green] يكفيه مزوّد 450 واط، فيناسب التجميعات الاقتصادية بلا ترقية المزوّد.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 8 جيجابايت على ناقل 128-bit — تضيق في الإعدادات العالية بدقّة 1440p.
* طول 270 مم لهذه النسخة تحديداً — أطول من كثير من كروت فئته، فيُقاس الكيس قبل الشراء.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* أداء تتبّع الأشعة أضعف من مقابله في NVIDIA رغم تحسّن الجيل الرابع.

---
بإمكانك التوجه إلى [Radeon RX 9060 XT 16GB](/components/${XT_16}) إذا كان توجهك يتركز على الآتي:
* ضِعف الذاكرة — وهو أهمّ فارق في هذه الفئة تحديداً لأن الشريحة نفسها.
https://www.techspot.com/specs/gpu/308914-amd-radeon-rx-9060-xt-8gb.html`,
  },
];

// ---------------------------------------------------------------- التنفيذ
const caza = await prisma.store.findFirst({ where: { slug: 'cazasouq' }, select: { id: true } });

console.log('=== تصحيحات على مدخلات قائمة ===');
for (const f of FIXES) {
  const c = await prisma.component.findUnique({ where: { id: f.id }, select: { name: true, tdpWattage: true, specs: true } });
  if (!c) { console.log(`  ⛔ ${f.id} غير موجودة`); continue; }
  for (const [k, v] of Object.entries(f.specs)) console.log(`  ${c.name}: ${k}  ${c.specs[k]} → ${v}`);
  if (f.tdpWattage) console.log(`  ${c.name}: tdpWattage  ${c.tdpWattage} → ${f.tdpWattage}`);
}

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
const before = await prisma.component.findMany({ where: { id: { in: FIXES.map(f => f.id) } }, select: { id: true, tdpWattage: true, specs: true } });
writeFileSync(`backups/gpus-8gb-${stamp}.json`, JSON.stringify({ added: PARTS, fixedBefore: before }, null, 2));
console.log(`\nنسخة احتياطية: backups/gpus-8gb-${stamp}.json`);

for (const f of FIXES) {
  const c = await prisma.component.findUnique({ where: { id: f.id }, select: { specs: true } });
  await prisma.component.update({ where: { id: f.id }, data: { specs: { ...c.specs, ...f.specs }, ...(f.tdpWattage ? { tdpWattage: f.tdpWattage } : {}) } });
  console.log(`✔ صُحّحت: ${f.id}`);
}

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
