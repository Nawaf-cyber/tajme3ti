/**
 * ============ لوحتا X870E من «القطع الناقصة» — 2026-10-08 ============
 *
 * من جرد القطع غير الموجودة في الكتالوج (مايكرولس + كازاسوق + أمازون).
 * طلب نوّاف: «أضف اللوحات اللي في الثلاث متاجر» — وقاعدته: أهمّ شيء أكثر من متجر.
 *
 * العروض (قُرئت صفحاتها 2026-10-08):
 *   MSI X870E GAMING PLUS WIFI
 *     · كازاسوق    متوفّر (٧ قطع)
 *     · أمازون     ١٬١٢٩ ﷼ — يبيعه KSATechSolutions ويشحنه أمازون (B0F67B9XT7)
 *     · مايكرولس   ١٬٢٣٨ ﷼ — متوفّر (911-7E70-001)
 *   Gigabyte X870E AERO X3D WOOD
 *     · أمازون     ١٬٨٩٩ ﷼ — «بقي ٤» (B0G823QDFD)
 *     · مايكرولس   ١٬٧٥٤ ﷼ — متوفّر
 *     · كازاسوق    له صفحة و«غير متوفر حاليآ» — يُضاف عرضاً ليُلتقط حين يعود
 *
 * ✕ Gigabyte B760M DS3H AX DDR4 — ظهر في الجرد ولم يُضف: نافدٌ في كازاسوق
 *   ومايكرولس، وأمازون وحده متوفّر (استيرادٌ من Amazon US). متجرٌ حيٌّ واحد.
 *
 * المواصفات من صفحتَي الصانعين:
 *   https://www.msi.com/Motherboard/X870E-GAMING-PLUS-WIFI/Specification
 *   https://www.gigabyte.com/Motherboard/X870E-AERO-X3D-WOOD/sp
 *
 *   node scripts/add-x870e-boards-2026-10-08.mjs           # عرض
 *   node scripts/add-x870e-boards-2026-10-08.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const MB = 'cmpfziqe70001x4ym928tt3o2';
const CARBON = 'cmpiec9m9003e00ym9k9jj3c9'; // MSI MPG X870E Carbon WiFi
const X870_ELITE = 'cmpiec6p9003400ymwohd55y3'; // Gigabyte X870 AORUS Elite WiFi7

const PARTS = [
  {
    categoryId: MB, brand: 'MSI', name: 'X870E Gaming Plus WiFi',
    tdpWattage: 15, performanceTier: 4,
    specs: {
      socket: 'AM5', chipset: 'X870E', formFactor: 'ATX',
      ramType: 'DDR5', maxRam: '256GB', memorySpeed: '8200+ MT/s (OC)',
      m2Slots: '3', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '5GbE',
    },
    offers: [
      { store: 'cazasouq', url: 'https://www.cazasouq.com/msi-x870e-gaming-plus-wifi-am5-ddr5-motherboard-40439' },
      { store: 'amazon', url: 'https://www.amazon.sa/dp/B0F67B9XT7' },
      { store: 'microless', url: 'https://saudi.microless.com/product/msi-x870e-gaming-plus-wifi-atx-am5-motherboard-amd-x870e-chipset-4x-ddr5-udimm-slot-256gb-max-memory-3x-pci-e-x16-slot-3x-m-2-slots-911-7e70-001/' },
    ],
    description: `### MSI X870E Gaming Plus WiFi

أرخص طريق إلى شيبست X870E بمواصفاته الكاملة: فتحة كرتٍ ومنفذ تخزينٍ من الجيل الخامس، وUSB4، وواي‑فاي 7، وشبكة 5 جيجابت.

**التقنيات الأساسية المدعومة:**

[green]PCIe 5.0 للكرت والتخزين معاً:[/green] فتحة الكرت الأولى بالجيل الخامس x16، وأوّل منفذ M.2 بالجيل الخامس x4 — كلاهما من المعالج مباشرة.

[green]USB4 بسرعة 40 جيجابت:[/green] منفذ Type-C خلفيّ يحمل أيضاً صورة DisplayPort مع المعالجات ذات الرسوميات المدمجة.

[green]واي‑فاي 7 وبلوتوث 5.4:[/green] مثبّتٌ في اللوحة، مع شبكةٍ سلكيّة Realtek بسرعة 5 جيجابت.

[green]DDR5 حتى 256 جيجابايت:[/green] أربع فتحات، وسرعة تصل إلى 8200+ MT/s كسر سرعة مع معالجات Ryzen 9000 بشريحةٍ واحدة لكلّ قناة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ثلاثة منافذ M.2 فقط، اثنان منها بالجيل الرابع — أقلّ من لوحات X870E الأعلى التي تصل إلى أربعة أو خمسة.
* شريحة صوت Realtek ALC897 أساسيّة؛ تكفي السمّاعات العاديّة ولا تُقصد لمن يهتمّ بجودة الصوت.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* الفتحتان الإضافيّتان للكرت من الشيبست (x4 وx1) — لا تصلحان لكرتٍ ثانٍ بأداءٍ كامل.

---
بإمكانك التوجه إلى [MSI MPG X870E Carbon WiFi](/components/${CARBON}) إذا كان توجهك يتركز على الآتي:
* منافذ M.2 أكثر، وتبريدٌ ومراحل طاقةٍ أقوى لمعالجات Ryzen 9 تحت حملٍ طويل.
https://www.msi.com/Motherboard/X870E-GAMING-PLUS-WIFI/Specification`,
  },
  {
    categoryId: MB, brand: 'Gigabyte', name: 'X870E AERO X3D Wood',
    tdpWattage: 20, performanceTier: 5,
    specs: {
      socket: 'AM5', chipset: 'X870E', formFactor: 'ATX',
      ramType: 'DDR5', maxRam: '256GB', memorySpeed: '9000 MT/s (OC)',
      m2Slots: '4', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2x 5GbE',
    },
    offers: [
      { store: 'amazon', url: 'https://www.amazon.sa/dp/B0G823QDFD' },
      { store: 'microless', url: 'https://saudi.microless.com/product/gigabyte-x870e-aero-x3d-wood-atx-am5-motherboard-amd-x870e-chipset-4x-ddr5-dimm-slots-256gb-max-memory-2x-pcie-5-0-x16-4x-m-2-slots-x870e-aero-x-wood/' },
      { store: 'cazasouq', url: 'https://www.cazasouq.com/gigabyte-aero-x870e-x3d-wood-amd5-motherboard-41441' },
    ],
    description: `### Gigabyte X870E AERO X3D Wood

لوحة X870E فاخرة بلمساتٍ خشبيّة، موجّهة لمن يجمع جهازاً للعمل والإبداع معاً: شبكتان سلكيّتان، ومنفذا USB4، ومنفذا تخزينٍ من الجيل الخامس.

**التقنيات الأساسية المدعومة:**

[green]منفذا M.2 بالجيل الخامس من المعالج:[/green] ومنفذان آخران بالجيل الرابع — أربعة أقراص NVMe إجمالاً، مع أربعة منافذ SATA.

[green]شبكتان سلكيّتان بسرعة 5 جيجابت:[/green] من Realtek، مع واي‑فاي 7 وبلوتوث 5.4.

[green]منفذا USB4 بصورة DisplayPort:[/green] حتى 4K بتردّد 240 هرتز مع المعالجات ذات الرسوميات المدمجة، ومنفذ HDMI أماميّ إضافيّ.

[green]DDR5 حتى 256 جيجابايت:[/green] أربع فتحات بسرعة تصل إلى 9000 MT/s كسر سرعة.

[green]صوت Realtek ALC1220:[/green] أعلى من شرائح لوحات الفئة المتوسّطة، مع مخرج S/PDIF بصريّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 الثاني من الجيل الخامس يتقاسم السرعة مع شريحة USB4 — إن رُكّب فيه قرصٌ عمل الاثنان بنصف المسارات (x2).
* الفتحة الثانية للكرت تقسم مسارات الأولى: تركيب جهازٍ فيها يُنزل فتحة الكرت إلى x8.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعرها للتصميم والمنافذ لا للأداء: اللوحة لا تزيد فريمات الألعاب، ولوحة X870 أرخص تؤدّي الأداء نفسه.

---
بإمكانك التوجه إلى [Gigabyte X870 AORUS Elite WiFi7](/components/${X870_ELITE}) إذا كان توجهك يتركز على الآتي:
* أربعة منافذ M.2 وواي‑فاي 7 بسعرٍ أقلّ، دون الشبكتين والتصميم الخشبيّ.
https://www.gigabyte.com/Motherboard/X870E-AERO-X3D-WOOD/sp`,
  },
];

// ---------------------------------------------------------------- التنفيذ

const stores = Object.fromEntries(
  (await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]),
);

let blocked = false;
for (const p of PARTS) {
  console.log(`\n=== ${p.brand} ${p.name}`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  const dup = await prisma.component.findFirst({ where: { name: { equals: p.name, mode: 'insensitive' }, brand: p.brand } });
  if (dup) { console.log(`    ⛔ موجودة: ${dup.id}`); blocked = true; }
  for (const o of p.offers) {
    if (!stores[o.store]) { console.log(`    ⛔ لا متجر «${o.store}»`); blocked = true; continue; }
    const taken = await prisma.componentOffer.findFirst({ where: { url: o.url }, select: { component: { select: { name: true } } } });
    if (taken) { console.log(`    ⛔ رابط ${o.store} مستعمل في: ${taken.component.name}`); blocked = true; }
    else console.log(`    ✔ ${o.store}`);
  }
}
for (const id of [CARBON, X870_ELITE]) {
  if (!(await prisma.component.findUnique({ where: { id }, select: { id: true } }))) { console.log(`⛔ رابط البديل ${id} لا يشير إلى قطعة`); blocked = true; }
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-x870e-${stamp}.json`, JSON.stringify(PARTS, null, 2));
console.log(`\nنسخة احتياطية: backups/added-x870e-${stamp}.json`);

const ids = [];
for (const p of PARTS) {
  const { offers, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  for (const o of offers) {
    await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: true } });
  }
  ids.push(c.id);
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}

console.log(`\nالتالي:\n  npx tsx scripts/scrape-one.ts ${ids.join(' ')}\n  npx tsx scripts/fetch-images.ts --missing`);
await prisma.$disconnect();
