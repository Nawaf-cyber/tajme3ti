/**
 * ============ خمس قطع تُغلق أربعة طلبات ============
 *
 * الطلبات الأربعة في `requestedPart` بحالة REVIEWING — وطلبٌ خامس عالقٌ في
 * ADDING من 2026-08-08 («b850 gaming») تُغلقه لوحة B850 نفسها.
 *
 *   Rtx5070ti        → PNY (علامةٌ جديدة، و**أرخص** من العام عندنا)
 *   5060 ti gigabyte → Gigabyte EAGLE OC ICE أبيض
 *   MSI PRO B650M    → PRO B650M-A WiFi
 *   B850 / b850 gaming → MSI B850 GAMING PLUS WIFI (ATX) و B850M (mATX)
 *
 * والكتالوج كان **بلا لوحة B850 واحدة** — وهو شيبست AM5 الحالي (٢٠٢٥) الذي
 * تُبنى عليه تجميعات رايزن ٩٠٠٠ اليوم. فالثغرة أكبر من طلبٍ عابر.
 *
 * ⚠️ المواصفات من صفحات MSI وGigabyte وPNY الرسمية **لا من صفحات المتاجر**.
 * وصف كازاسوق للوحة B850 يقول حرفياً «معالجات Intel Core الجيل الرابع، مقبس
 * LGA 1150، ذاكرة DDR3، PCIe 3.0» — وهي لوحة AMD AM5 بـDDR5 وPCIe 5.0.
 * نصٌّ مولَّد آلياً لا علاقة له بالمنتج، وأخذه كان سيزرع كذبة توافقٍ كاملة.
 *
 *   node scripts/add-requested-batch-aug17.mjs --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const GPU = 'cmpfziqnv0004x4ymffnp204c';
const MB = 'cmpfziqe70001x4ym928tt3o2';

const REF_5070TI = 'cmr3g8pei0008ncym5xpf3k1s';   // NVIDIA 5070 Ti 16GB — 5249
const REF_5060TI_16 = 'cmq5060tixx00000ym00000002'; // NVIDIA 5060 Ti 16GB — 2350
const REF_5060TI_8 = 'cmsqbc2k50000ucymjpelflif';  // NVIDIA 5060 Ti 8GB — 1800
const ASUS_B650M = 'cmpiec7yr003800ymo8zhug3e';    // ASUS PRIME B650M-A WiFi — 609
const MSI_B650 = 'cmpiec8hc003a00ymf8nwylx6';      // MSI B650 Gaming Plus WiFi — 837
const R7_9800X3D = 'cmpfzir160007x4ym7w2xdh50';

const PARTS = [
  // ─────────────────────────────── ١) كرت 5070 Ti بعلامة AIB
  {
    categoryId: GPU, brand: 'PNY', name: 'GeForce RTX 5070 Ti 16GB OC Triple Fan Plus',
    tdpWattage: 300, performanceTier: 4,
    specs: {
      vram: '16GB', memoryType: 'GDDR7', memoryBus: '256-bit', interface: 'PCIe 5.0 x16',
      architecture: 'Blackwell', lengthMm: '328', powerConnectors: '1x 16-pin',
      ports: '1x HDMI 2.1b, 3x DP 2.1b',
    },
    offers: [['noon', 'https://www.noon.com/saudi-en/geforce-rtx-5070-ti-16gb-overclocked-triple-fan-plus-dlss-4-graphics-card-black/N70261689V/p/']],
    description: `### PNY RTX 5070 Ti 16GB OC Triple Fan Plus

أوّل 5070 Ti بعلامة مُصنِّع في الكتالوج — وأرخص من النسخة المرجعية المسجّلة عندنا، فهو يُنزل سقف سعر هذه الفئة لا يزيده.

التقنيات الأساسية المدعومة:

[green]16 جيجابايت GDDR7 على ناقل 256 بت:[/green] نطاق 896 جيجابايت/ث — الذاكرة لا تخنق الكرت في 1440p ولا في 4K مع DLSS.

[green]DLSS 4 وتوليد الإطارات المتعدّد:[/green] معمارية Blackwell كاملةً، وهي الفارق الحقيقي في ألعاب تتبّع الأشعّة.

[green]تبريد ثلاثي المراوح بمعمل 2640 ميجاهرتز:[/green] كسر سرعةٍ من المصنع فوق تردّد النسخة المرجعية.

[green]مخارج DP 2.1b ثلاثة وHDMI 2.1b:[/green] أربع شاشات، ودقّة 8K.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **الطول 328 مم بثلاث فتحات** — قِس كيسك قبل الشراء؛ الكروت القصيرة في هذه الفئة تقف عند ~٣٠٠ مم.
* ٣٠٠ واط تحت الحمل: مزوّد 750 واط جيّد هو الحدّ العملي، لا 650.
* منفذ الطاقة 16 سنّاً (يأتي بمحوّل إلى ثلاثة × ٨ سنّ) — المزوّدات القديمة تحتاجه.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا تبريد مائي ولا شاشة على الكرت.
* PNY لا تنافس ROG وTUF في هدوء المراوح تحت الحمل الطويل.

---
بإمكانك التوجه إلى [RTX 5070 Ti (النسخة المرجعية)](/components/${REF_5070TI}) إذا كان توجهك يتركز على الآتي:
* مقارنة الأسعار: نفس الشريحة بعلامات أخرى وأطوال مختلفة.
https://www.pny.com/geforce-rtx-5070-ti-triple-fan-plus-models`,
  },

  /* ─────────────────────────────── ٢) 5060 Ti من Gigabyte
   *
   * ⚠️ أوّل اختيارٍ كان EAGLE OC ICE الأبيض من كازاسوق — فأوقفه حارس
   * الروابط: عنوانه **مستعملٌ أصلاً** لتسعير القطعة العامة «RTX 5060 Ti
   * 8GB». وليس خطأً: القطع العامة في الكتالوج مجمَّعةٌ عن قصد من أرخص
   * موديل AIB في كل متجر (5070 Ti العام يقرأ من Zotac وGigabyte وPNY
   * معاً)، فتعطي «أرخص 5060 Ti في السعودية أيّاً كانت علامته».
   *
   * فسحبُ العنوان منها كان سيرفع سعرها 1800 → 1979 ويُنقص عرضاً — إفسادُ
   * ما يعمل لأجل قطعةٍ جديدة. والموديل هنا مختلفٌ فعلاً: WINDFORCE بسعة
   * ١٦ جيجابايت لا ٨.
   */
  {
    categoryId: GPU, brand: 'Gigabyte', name: 'GeForce RTX 5060 Ti WINDFORCE 16G',
    tdpWattage: 180, performanceTier: 3,
    specs: {
      vram: '16GB', memoryType: 'GDDR7', memoryBus: '128-bit', interface: 'PCIe 5.0 x8',
      architecture: 'Blackwell', lengthMm: '208', powerConnectors: '1x 8-pin',
      ports: '1x HDMI 2.1b, 3x DP 2.1b',
    },
    offers: [['noon', 'https://www.noon.com/saudi-en/geforce-rtx-5060-ti-windforce-16gb-gddr7-graphics-card-2572-mhz-core-clock-pcie-5-0-8k-resolution-displayport-2-1b-x3-hdmi-2-1b-x1-650w-psu-recommended-atx-form-factor-gv-n506twf2-16gd/N70173160V/p/']],
    description: `### Gigabyte RTX 5060 Ti WINDFORCE 16G

**أقصر كرت 16 جيجابايت في الكتالوج — 208 مم.** وهو ما يجعله الاختيار العملي للتجميعات الصغيرة التي تريد ذاكرة كبيرة ولا تحتمل كرتاً بطول ٣٠٠ مم.

التقنيات الأساسية المدعومة:

[green]16 جيجابايت GDDR7:[/green] ضِعف ذاكرة نسخة الثمانية على الشريحة نفسها — الفرق يظهر في القوام العالي وفي 1440p.

[green]208 مم فقط ومنفذ ٨ سنّ واحد:[/green] ومزوّد ٦٥٠ واط يكفي. لا محوّلات ولا منفذ ١٦ سنّاً.

[green]DLSS 4 ومعمارية Blackwell:[/green] توليد الإطارات المتعدّد كاملاً.

[green]ثلاثة مخارج DP 2.1b وHDMI 2.1b:[/green] ودقّة تصل 8K.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **ناقل ذاكرة 128 بت** — يحدّ النطاق مهما زادت السعة؛ الـ16 جيجابايت تمنع نفاد الذاكرة لا تُسرّع الكرت.
* ناقل PCIe 5.0 **x8** لا x16: بلا أثر على لوحات الجيل الرابع والخامس، ويظهر على PCIe 3.0.
* مروحتان (WINDFORCE 2X) لا ثلاث — تردّدُه المرجعيّ 2572 ميجاهرتز بلا كسرٍ مصنعيّ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا إضاءة RGB وبلا بايوس مزدوج.
* ليس كرت 4K أصلاً.

---
بإمكانك التوجه إلى [RTX 5060 Ti 16GB (الأرخص من كل العلامات)](/components/${REF_5060TI_16}) إذا كان توجهك يتركز على الآتي:
* نفس السعة والشريحة بأرخص عرضٍ متاح أيّاً كان مُصنّع الكرت.

وإلى [RTX 5060 Ti 8GB](/components/${REF_5060TI_8}) إذا كان توجهك يتركز على الآتي:
* السعر الأدنى، إن كنت تلعب 1080p ولا تحتاج السعة.
https://www.gigabyte.com/Graphics-Card/GV-N506TWF2-16GD/sp`,
  },

  // ─────────────────────────────── ٣) MSI PRO B650M
  {
    categoryId: MB, brand: 'MSI', name: 'PRO B650M-A WiFi',
    tdpWattage: 0, performanceTier: 2,
    specs: {
      socket: 'AM5', chipset: 'B650', formFactor: 'Micro-ATX', ramType: 'DDR5',
      maxRam: '256GB', memorySpeed: '7200+ MHz (OC)', m2Slots: '2', pcieVersion: 'PCIe 4.0',
    },
    offers: [['amazon', 'https://www.amazon.sa/dp/B0BHBZRW66']],
    description: `### MSI PRO B650M-A WiFi

لوحة B650 صغيرة بأربع فتحات ذاكرة — وهو ما يميّزها عن أغلب لوحات Micro-ATX في هذه الفئة، فأكثرها فتحتان.

التقنيات الأساسية المدعومة:

[green]أربع فتحات DDR5 حتى 256 جيجابايت:[/green] وكسر سرعة حتى 7200+ ميجاهرتز على فتحةٍ واحدة لكل قناة.

[green]منفذا M.2 من الجيل الرابع، كلاهما من المعالج:[/green] لا يمرّان بالشيبست فلا يتقاسمان نطاقه.

[green]واي‑فاي 6E وشبكة 2.5 جيجابت:[/green] الطبقة السادسة الموسّعة (نطاق ٦ جيجاهرتز).

[green]تقبل رايزن 7000 و8000 و9000:[/green] بما فيها 9800X3D.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **منفذ M.2 الثاني يتعطّل مع معالجات Ryzen 8500/8300** — عددُ مسارات هذه المعالجات أقلّ.
* فتحة الكرت من الجيل **الرابع** لا الخامس: بلا أثر يُقاس في الألعاب اليوم.
* مراحل طاقة فئة PRO — تكفي حتى 9700X، ولا تُنصح لـ9950X تحت رندرٍ طويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا واي‑فاي ٧ وبلا PCIe 5.0.
* ليست لوحة كسر سرعة معالج.

---
بإمكانك التوجه إلى [ASUS PRIME B650M-A WiFi](/components/${ASUS_B650M}) إذا كان توجهك يتركز على الآتي:
* نفس الفئة والمقاس بسعرٍ أقلّ — قارن الرقمين قبل أن تقرّر.
https://www.msi.com/Motherboard/PRO-B650M-A-WIFI/Specification`,
  },

  // ─────────────────────────────── ٤) B850 حجم ATX
  {
    categoryId: MB, brand: 'MSI', name: 'B850 GAMING PLUS WiFi',
    tdpWattage: 0, performanceTier: 4,
    specs: {
      socket: 'AM5', chipset: 'B850', formFactor: 'ATX', ramType: 'DDR5',
      maxRam: '256GB', memorySpeed: '8200+ MHz (OC)', m2Slots: '3', pcieVersion: 'PCIe 5.0',
    },
    offers: [
      ['cazasouq', 'https://www.cazasouq.com/msi-b850-gaming-plus-wifi-motherboard-26639'],
      ['noon', 'https://www.noon.com/saudi-en/b850-gaming-plus-wi-fi-motherboard-amd-b850-chipset-am5-socket-supports-ryzen-9000-8000-7000-series-cpus-4x-ddr5-udimm-slots-up-to-256gb-8200mhz-oc-pcie-5-0-x16-pcie-4-0-x4-3x-m-2-slots-5g-lan-wi-fi-7-bluetooth-5-4-7-1-channel-audio-usb-2-0-5gbps-10g/N70147794V/p/'],
    ],
    description: `### MSI B850 GAMING PLUS WiFi

أوّل لوحة B850 في الكتالوج — وهو شيبست AM5 الحالي، يأتي بـPCIe 5.0 للكرت **وللتخزين** معاً، وهو ما لا يفعله B650 العادي.

التقنيات الأساسية المدعومة:

[green]فتحة كرت PCIe 5.0 x16 من المعالج:[/green] الجيل الخامس كاملاً، لا الرابع كما في B650.

[green]منفذ M.2 أوّل بـPCIe 5.0 x4:[/green] ضِعف نطاق الجيل الرابع لأقراص Gen5.

[green]أربع فتحات DDR5 حتى 256 جيجابايت و8200+ ميجاهرتز:[/green] أعلى كسر ذاكرة في لوحات AM5 عندنا.

[green]واي‑فاي 7 وشبكة 5 جيجابت:[/green] وبلوتوث 5.4.

[green]تقبل رايزن 7000 و8000 و9000:[/green] وهي اللوحة المقصودة لـ9800X3D و9950X3D.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **منفذ M.2 الثالث بمسارين فقط (PCIe 4.0 x2)** من الشيبست — قرصٌ سريع فيه يعمل بنصف سرعته. الأوّل والثاني بأربعة مسارات.
* فتحة الكرت تنزل إلى PCIe 4.0 x8 مع معالجات Ryzen 8000 (وهي بمسارات أقلّ).
* B850 لا يدعم كسر سرعة المعالج بحرّية X870E.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا Thunderbolt وبلا شبكة 10 جيجابت.
* بلا شاشة تشخيص على اللوحة.

---
بإمكانك التوجه إلى [MSI B650 Gaming Plus WiFi](/components/${MSI_B650}) إذا كان توجهك يتركز على الآتي:
* نفس العائلة بشيبست الجيل السابق وسعرٍ أقلّ، إن لم تكن تحتاج PCIe 5.0.
https://www.msi.com/Motherboard/B850-GAMING-PLUS-WIFI/Specification`,
  },

  // ─────────────────────────────── ٥) B850 حجم Micro-ATX
  {
    categoryId: MB, brand: 'MSI', name: 'B850M GAMING PLUS WiFi',
    tdpWattage: 0, performanceTier: 3,
    specs: {
      socket: 'AM5', chipset: 'B850', formFactor: 'Micro-ATX', ramType: 'DDR5',
      maxRam: '256GB', memorySpeed: '8200+ MHz (OC)', m2Slots: '2', pcieVersion: 'PCIe 5.0',
    },
    offers: [['cazasouq', 'https://www.cazasouq.com/msi-b850m-gaming-plus-wifi-am5-ddr5-m-atx-motherboard-47563']],
    description: `### MSI B850M GAMING PLUS WiFi

نفس شيبست B850 في مقاس Micro-ATX — لوحةُ تجميعةٍ صغيرة لا تتنازل عن PCIe 5.0 للكرت ولا للقرص الأوّل.

التقنيات الأساسية المدعومة:

[green]فتحة كرت PCIe 5.0 x16 من المعالج:[/green] في لوحةٍ بمقاس 243×243 مم.

[green]منفذ M.2 أوّل بـPCIe 5.0 x4:[/green] والثاني بالجيل الرابع، وكلاهما من المعالج.

[green]أربع فتحات DDR5 حتى 256 جيجابايت:[/green] وكسر سرعة حتى 8200+ ميجاهرتز — وأربع فتحات في مقاسٍ صغير أمرٌ غير معتاد.

[green]واي‑فاي 7 وشبكة 5 جيجابت:[/green] كالنسخة الكبيرة تماماً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذا M.2 لا ثلاثة — الفارق عن نسخة ATX.
* فتحة الكرت تنزل إلى PCIe 4.0 x8 مع معالجات Ryzen 8000.
* مقاس Micro-ATX يحتاج كيساً من مقاسه أو أكبر، ولا يدخل صناديق Mini-ITX.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا شبكة 10 جيجابت وبلا Thunderbolt.
* B850 دون X870E في حرّية كسر سرعة المعالج.

---
بإمكانك التوجه إلى [Ryzen 7 9800X3D](/components/${R7_9800X3D}) لتكملة التجميعة — أفضل معالج ألعاب لهذه اللوحة، ويعمل عليها بلا تحديث بايوس.
https://www.msi.com/Motherboard/B850M-GAMING-PLUS-WIFI/Specification`,
  },
];

// ---------------------------------------------------------------- التنفيذ
const stores = Object.fromEntries(
  (await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]),
);

let blocked = false;
for (const p of PARTS) {
  const dup = await prisma.component.findFirst({ where: { name: p.name, brand: p.brand } });
  console.log(`\n=== ${p.brand} ${p.name}   [T${p.performanceTier} · ${p.tdpWattage}W]`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  for (const [slug, url] of p.offers) {
    if (!stores[slug]) { console.log(`    ⛔ متجر مجهول: ${slug}`); blocked = true; continue; }
    const taken = await prisma.componentOffer.findFirst({ where: { url }, select: { component: { select: { name: true } } } });
    console.log(`    ${taken ? '⛔' : '·'} ${slug}: ${url.slice(0, 78)}`);
    if (taken) { console.log(`       الرابط مستعمل في: ${taken.component.name}`); blocked = true; }
  }
  if (dup) { console.log(`    ⛔ القطعة موجودة: ${dup.id}`); blocked = true; }
}
if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-requested-${stamp}.json`, JSON.stringify(PARTS, null, 2));

const ids = [];
for (const p of PARTS) {
  const { offers, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  for (const [slug, url] of offers) {
    await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[slug], url, inStock: true } });
  }
  ids.push(c.id);
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}  (${offers.length} عرض)`);
}
console.log(`\nنسخ للتالي:\n${ids.join(' ')}`);
await prisma.$disconnect();
