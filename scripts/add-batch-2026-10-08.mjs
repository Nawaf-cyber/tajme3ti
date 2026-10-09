/**
 * ============ دفعة القطع الناقصة — ١٧ قطعة — 2026-10-08 ============
 *
 * طلب نوّاف: «تضيف كمية أكبر، 10–20، وتتأكّد منهم». وقاعدته: أكثر من متجر.
 *
 * كلّ قطعة هنا فُتحت صفحتها في كلّ متجر يومها، والمعتمد التوفّر لا الوجود:
 *   كازاسوق — «التوفر: N» في صفحة المنتج (لا قائمة البحث)
 *   أمازون  — صفحة /dp: العنوان والسعر و«In Stock» والبائع
 *   مايكرولس — readProductPage: السعر وحالة المخزون
 * ولا يُضاف ما توفّر في متجرٍ واحد. واستُبعد من القائمة الأولى بهذا:
 *   Ryzen 9 7950X (أمازون وحده) · Core i5-14400 (أمازون وحده)
 *   ASUS Prime Z890-P (كازاسوق بلا واي‑فاي، وأمازون بواي‑فاي — نسختان مختلفتان)
 *   MSI MAG B850 Tomahawk WiFi العاديّة: أُخذت MAX — في الثلاثة، وأرخص في أمازون
 *
 * ⚠️ صفحة كازاسوق لـB850M DS3H عنوانها «Ice - Black» — تناقض. فُصل بالباركود:
 *   4719331866518 = B850M DS3H العاديّة السوداء (قوائم بائعين أوروبيّين).
 *
 * ⚠️ روابط الصانعين في آخر كلّ وصف فُتحت قبل الإضافة — اثنان كُتبا من الذاكرة
 *    فأخطآ (245KF فتح صفحة 265K، وPrime 750W صفحة السلسلة) وصُحّحا.
 *
 * المواصفات من صفحات الصانعين (ASUS techspec · Gigabyte /sp · MSI /Specification ·
 * ASRock index.asp#Specification). المعالجات من صفوف أخواتها في الكتالوج (245K،
 * 14700) — الشريحة نفسها بلا رسوميات — مع الفرق المكتوب. وتصنيف SPL للمزوّد
 * من القائمة نفسها (scripts/fill-psu-tier).
 *
 *   node scripts/add-batch-2026-10-08.mjs           # عرض
 *   node scripts/add-batch-2026-10-08.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const MB = 'cmpfziqe70001x4ym928tt3o2', CPU = 'cmpfziqb20000x4ymfmkovawm', PSU = 'cmpfziqh70002x4ym6ln587z2', STO = 'cmpfziqr70005x4ym3k7uh079';
const ALT = {
  b650mDs3h: 'cmpiec87q003900ymbge1evlg', msiB850Plus: 'cmsxdaibx0006skymhs0llh1k', asusB850Max: 'cmu3md82v0000f8ymvalcrqm4',
  asrB860m: 'cmr2k5w2s0007jgym4ibatlpn', msiB860P: 'cmr2k5vx40006jgym04l2zz5r', z890Elite: 'cmr2k5vs40005jgymmq0eke3e',
  msiX870P: 'cmpiec7q8003700ym943fguar', b650Toma: 'cmpi1czn4000204l76f6pg7jr', i7_14700: 'cmpiecyih006500ymvwt22xem',
  u5_245k: 'cmpiecyon006600ymq5jegejh', strix1200: 'cmtjkyh0q000f70ymta24qfyh', a650bn: 'cmtcr2j4f0010o8ymgl50aa7g', pro2tb: 'cmpfzir17000fx4ym3tkdck9n',
};
const C = (u) => ({ store: 'cazasouq', url: `https://www.cazasouq.com/${u}` });
const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });
const M = (u) => ({ store: 'microless', url: `https://saudi.microless.com/product/${u}/` });
const board = (s) => ({ socket: s.socket, chipset: s.chipset, formFactor: s.ff, ramType: 'DDR5', maxRam: s.maxRam, memorySpeed: s.mem, m2Slots: String(s.m2), pcieVersion: s.pcie, wifi: s.wifi, lan: s.lan });

const PARTS = [
  // ═════════════════════ اللوحات — AM5 / B850 ═════════════════════
  {
    categoryId: MB, brand: 'ASUS', name: 'PRIME B850M-K', tdpWattage: 10, performanceTier: 2,
    specs: board({ socket: 'AM5', chipset: 'B850', ff: 'Micro-ATX', maxRam: '128GB', mem: '8200+ MT/s (OC)', m2: 2, pcie: 'PCIe 5.0', wifi: 'No', lan: '2.5GbE' }),
    offers: [C('asus-prime-b850m-k-am5-motherboard-33993'), A('B0F33N4FYQ')],
    description: `### ASUS PRIME B850M-K

أبسط لوحة B850 في الكتالوج: تعطي منصّة Ryzen الحديثة بفتحة كرتٍ ومنفذ تخزينٍ من الجيل الخامس، وتترك الكماليّات.

**التقنيات الأساسية المدعومة:**

[green]PCIe 5.0 للكرت والتخزين:[/green] فتحة الكرت بالجيل الخامس x16، وأوّل منفذ M.2 بالجيل الخامس x4.

[green]شبكة Realtek بسرعة 2.5 جيجابت:[/green] أسرع من الجيجابت الشائع في لوحات هذا السعر.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا ذاكرة فقط (حتى 128 جيجابايت) — الترقية لاحقاً تعني تبديل العصاتين لا إضافة اثنتين.
* منفذا M.2 فقط، أحدهما بالجيل الرابع.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا واي‑فاي مدمج.

---
بإمكانك التوجه إلى [Gigabyte B650M DS3H](/components/${ALT.b650mDs3h}) إذا كان توجهك يتركز على الآتي:
* أربع فتحات ذاكرة بسعرٍ قريب، والفرق الجيل الرابع للكرت بدل الخامس.
https://www.asus.com/motherboards-components/motherboards/prime/prime-b850m-k/techspec/`,
  },
  {
    categoryId: MB, brand: 'ASUS', name: 'TUF Gaming B850M-Plus WiFi', tdpWattage: 10, performanceTier: 3,
    specs: board({ socket: 'AM5', chipset: 'B850', ff: 'Micro-ATX', maxRam: '256GB', mem: '8000+ MT/s (OC)', m2: 3, pcie: 'PCIe 5.0', wifi: 'Wi-Fi 6E', lan: '2.5GbE' }),
    offers: [C('asus-b850m-plus-tuf-motherboard'), A('B0DP5BZZDZ')],
    description: `### ASUS TUF Gaming B850M-Plus WiFi

لوحة Micro-ATX كاملة الأدوات: أربع فتحات ذاكرة، وثلاثة منافذ M.2، وواي‑فاي — لمن يبني جهازاً صغيراً بلا تنازلات.

**التقنيات الأساسية المدعومة:**

[green]PCIe 5.0 للكرت والتخزين:[/green] فتحة الكرت x16 وأوّل منفذ M.2 بالجيل الخامس.

[green]DDR5 حتى 256 جيجابايت:[/green] أربع فتحات بسرعة 8000+ MT/s كسر سرعة.

[green]واي‑فاي 6E وشبكة 2.5 جيجابت:[/green] اتّصالٌ لاسلكيّ وسلكيّ سريعان في اللوحة نفسها.

[green]صوت Realtek ALC1220P:[/green] أعلى من شرائح الصوت المعتادة في هذا الحجم.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذا M.2 بالجيل الرابع إلى جانب منفذ الجيل الخامس.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* حجم Micro-ATX: فتحتا توسعة فقط، فلا مكان لبطاقاتٍ كثيرة.

---
بإمكانك التوجه إلى [ASUS B850 MAX GAMING WIFI W](/components/${ALT.asusB850Max}) إذا كان توجهك يتركز على الآتي:
* لوحة ATX بالحجم الكامل والميزات نفسها تقريباً.
https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b850m-plus-wifi/techspec/`,
  },
  {
    categoryId: MB, brand: 'Gigabyte', name: 'B850M DS3H', tdpWattage: 10, performanceTier: 2,
    specs: board({ socket: 'AM5', chipset: 'B850', ff: 'Micro-ATX', maxRam: '256GB', mem: '8200 MT/s (OC)', m2: 2, pcie: 'PCIe 5.0', wifi: 'No', lan: '2.5GbE' }),
    offers: [C('gigabyte-b850m-ds3h-ice'), A('B0DQLJHJ8B'), M('gigabyte-b850m-ds3h-am5-m-atx-motherboard-amd-b850-chipset-4x-ddr5-dimm-slots-up-to-256gb-max-memory-1x-pcie-5-0-x16-2x-m-2-slots-b850m-ds3h')],
    description: `### Gigabyte B850M DS3H

أرخص لوحة B850 بأربع فتحات ذاكرة في الكتالوج — الأساسيّات الكاملة لمنصّة Ryzen الحديثة بلا زيادة.

**التقنيات الأساسية المدعومة:**

[green]PCIe 5.0 للكرت:[/green] فتحة الكرت الرئيسيّة من المعالج بالجيل الخامس، ومنفذا M.2 من المعالج أيضاً.

[green]DDR5 حتى 256 جيجابايت:[/green] أربع فتحات بسرعة تصل إلى 8200 MT/s كسر سرعة.

[green]شبكة Realtek بسرعة 2.5 جيجابت.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذا M.2 فقط.
* الفتحة الثانية للكرت بالجيل الثالث x4 — للبطاقات الصغيرة لا لكرتٍ ثانٍ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا واي‑فاي مدمج.

---
بإمكانك التوجه إلى [Gigabyte B650M DS3H](/components/${ALT.b650mDs3h}) إذا كان توجهك يتركز على الآتي:
* اللوحة نفسها بشيبست B650 — فتحة كرتٍ بالجيل الرابع، وفرق سعرٍ صغير.
https://www.gigabyte.com/Motherboard/B850M-DS3H-rev-10/sp`,
  },
  {
    categoryId: MB, brand: 'Gigabyte', name: 'B850 GAMING X WiFi6E', tdpWattage: 10, performanceTier: 3,
    specs: board({ socket: 'AM5', chipset: 'B850', ff: 'ATX', maxRam: '256GB', mem: '8200 MT/s (OC)', m2: 3, pcie: 'PCIe 5.0', wifi: 'Wi-Fi 6E', lan: '2.5GbE' }),
    offers: [C('gigabyte-b850-gaming-x-wifi6e-motherboard-33260'), A('B0DQNK3Z2M'), M('gigabyte-b850-gaming-x-wifi6e-am5-atx-motherboard-amd-b850-chipset-4x-ddr5-dimm-slot-up-to-256gb-max-memory-1-x-pcie-5-0-x16-3-x-m-2-slots-wifi-bt-black-b850-gaming-x-wifi6e')],
    description: `### Gigabyte B850 GAMING X WiFi6E

لوحة ATX متوسّطة بكلّ ما يحتاجه جهاز ألعاب: ثلاثة منافذ M.2، وواي‑فاي 6E، وشبكة 2.5 جيجابت.

**التقنيات الأساسية المدعومة:**

[green]منفذا M.2 من المعالج:[/green] ومنفذٌ ثالث من الشيبست بالجيل الرابع.

[green]PCIe 5.0 لفتحة الكرت:[/green] من المعالج مباشرة.

[green]DDR5 حتى 256 جيجابايت:[/green] أربع فتحات بسرعة تصل إلى 8200 MT/s كسر سرعة.

[green]واي‑فاي 6E (Realtek RTL8852CE) وشبكة 2.5 جيجابت.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الفتحتان الإضافيّتان بالجيل الثالث x1 — لبطاقاتٍ صغيرة فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* واي‑فاي 6E لا 7 — يكفي أغلب الشبكات المنزليّة اليوم.

---
بإمكانك التوجه إلى [Gigabyte B850 AORUS Elite WiFi7](/components/{{AORUS_B850}}) إذا كان توجهك يتركز على الآتي:
* واي‑فاي 7 ومراحل طاقة أقوى بفرقٍ صغير.
https://www.gigabyte.com/Motherboard/B850-GAMING-X-WIFI6E-rev-1x/sp`,
  },
  {
    categoryId: MB, brand: 'Gigabyte', name: 'B850 AORUS Elite WiFi7', tdpWattage: 10, performanceTier: 4,
    specs: board({ socket: 'AM5', chipset: 'B850', ff: 'ATX', maxRam: '256GB', mem: '8200 MT/s (OC)', m2: 3, pcie: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE' }),
    offers: [C('gigabyte-b850-aorus-elite-wifi7-motherboard-47682'), A('B0DQLHVQSF')],
    description: `### Gigabyte B850 AORUS Elite WiFi7

لوحة B850 من خطّ AORUS: الأساس نفسه كلوحات الفئة المتوسّطة، مع واي‑فاي 7 وفتحة كرتٍ مقوّاة.

**التقنيات الأساسية المدعومة:**

[green]واي‑فاي 7 (Realtek RTL8922AE) وشبكة 2.5 جيجابت.[/green]

[green]PCIe 5.0 لفتحة الكرت:[/green] بفتحةٍ مقوّاة (PCIe UD Slot) تتحمّل الكروت الثقيلة.

[green]ثلاثة منافذ M.2:[/green] اثنان من المعالج وواحدٌ من الشيبست بالجيل الرابع.

[green]DDR5 حتى 256 جيجابايت:[/green] أربع فتحات بسرعة تصل إلى 8200 MT/s كسر سرعة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الفتحتان الإضافيّتان بالجيل الثالث x1.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* الفرق عن لوحات B850 الأرخص في الواي‑فاي والمتانة — لا في أداء الألعاب.

---
بإمكانك التوجه إلى [Gigabyte B850 GAMING X WiFi6E](/components/{{GAMINGX_B850}}) إذا كان توجهك يتركز على الآتي:
* المنافذ نفسها بسعرٍ أقلّ، وواي‑فاي 6E بدل 7.
https://www.gigabyte.com/Motherboard/B850-AORUS-ELITE-WIFI7-rev-1x/sp`,
  },
  {
    categoryId: MB, brand: 'ASRock', name: 'B850 Steel Legend WiFi', tdpWattage: 10, performanceTier: 4,
    specs: board({ socket: 'AM5', chipset: 'B850', ff: 'ATX', maxRam: '256GB', mem: '8000+ MT/s (OC)', m2: 4, pcie: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE' }),
    offers: [C('asrock-b850-steel-legend-wifi-ddr5-atx-motherboard-39827'), A('B0DRTTJ5D6')],
    description: `### ASRock B850 Steel Legend WiFi

أكثر منافذ تخزينٍ بين لوحات B850 بهذا السعر: أربعة منافذ M.2، مع واي‑فاي 7.

**التقنيات الأساسية المدعومة:**

[green]أربعة منافذ M.2:[/green] واحدٌ بالجيل الخامس وثلاثة بالجيل الرابع x4 — أربعة أقراص NVMe بلا محوّل.

[green]PCIe 5.0 لفتحة الكرت:[/green] x16 من المعالج.

[green]واي‑فاي 7 وشبكة 2.5 جيجابت.[/green]

[green]DDR5 حتى 256 جيجابايت:[/green] أربع فتحات بسرعة 8000+ MT/s كسر سرعة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الفتحة الثانية للكرت بالجيل الرابع x4.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* تقول ASRock إنّ الضمان عبر الموزّع والمتجر — اسأل المتجر عن مدّته.

---
بإمكانك التوجه إلى [MSI B850 GAMING PLUS WiFi](/components/${ALT.msiB850Plus}) إذا كان توجهك يتركز على الآتي:
* لوحة B850 بثلاثة منافذ M.2 وواي‑فاي من MSI.
https://www.asrock.com/mb/AMD/B850%20Steel%20Legend%20WiFi/index.asp#Specification`,
  },
  {
    categoryId: MB, brand: 'MSI', name: 'MAG B850 Tomahawk MAX WiFi', tdpWattage: 10, performanceTier: 4,
    specs: board({ socket: 'AM5', chipset: 'B850', ff: 'ATX', maxRam: '256GB', mem: '8400 MT/s (OC)', m2: 4, pcie: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '5GbE' }),
    offers: [C('b850-tomahawk-ddr5-am5'), A('B0DT58JK2W'), M('msi-mag-b850-tomahawk-max-wifi-am5-atx-motherboard-amd-b850-chipset-4x-ddr5-udimm-slots-up-to-256gb-max-memory-3x-pci-e-x16-slots-4x-m-2-slots-wi-fi-7-bluetooth-5-4-911-7e62-002')],
    description: `### MSI MAG B850 Tomahawk MAX WiFi

لوحة B850 بميزات X870 تقريباً: منفذا M.2 بالجيل الخامس، وشبكة 5 جيجابت، وواي‑فاي 7.

**التقنيات الأساسية المدعومة:**

[green]منفذا M.2 بالجيل الخامس من المعالج:[/green] ومنفذان آخران من الشيبست — أربعة أقراص إجمالاً.

[green]PCIe 5.0 لفتحة الكرت:[/green] x16 من المعالج.

[green]شبكة Realtek بسرعة 5 جيجابت وواي‑فاي 7.[/green]

[green]DDR5 حتى 256 جيجابايت:[/green] أربع فتحات بسرعة تصل إلى 8400 MT/s كسر سرعة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 الثالث بالجيل الرابع x2 — نصف سرعة المنافذ الأخرى.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا USB4 — وهو ما يضيفه شيبست X870.

---
بإمكانك التوجه إلى [MSI MAG B650 TOMAHAWK WIFI](/components/${ALT.b650Toma}) إذا كان توجهك يتركز على الآتي:
* الخطّ نفسه بشيبست B650 أرخص، بفتحة كرتٍ بالجيل الرابع.
https://www.msi.com/Motherboard/MAG-B850-TOMAHAWK-MAX-WIFI/Specification`,
  },
  // ═════════════════════ اللوحات — LGA1851 / B860 ═════════════════════
  {
    categoryId: MB, brand: 'ASUS', name: 'PRIME B860M-K', tdpWattage: 10, performanceTier: 2,
    specs: board({ socket: 'LGA1851', chipset: 'B860', ff: 'Micro-ATX', maxRam: '128GB', mem: '8800+ MT/s (OC)', m2: 2, pcie: 'PCIe 4.0', wifi: 'No', lan: '2.5GbE' }),
    offers: [C('asus-prime-b860m-k-motherboard-28399'), A('B0DPMPSGF6')],
    description: `### ASUS PRIME B860M-K

أرخص لوحة B860 في الكتالوج لمعالجات Core Ultra — الأساسيّات بلا زيادة.

**التقنيات الأساسية المدعومة:**

[green]منفذ M.2 بالجيل الخامس:[/green] من المعالج، ومنفذٌ ثانٍ بالجيل الرابع.

[green]DDR5 بسرعة 8800+ MT/s كسر سرعة:[/green] مع دعم ذاكرة CUDIMM.

[green]شبكة Realtek بسرعة 2.5 جيجابت.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **فتحة الكرت PCIe 4.0 لا 5.0** — لا فرق يُذكر مع كروت اليوم، لكنها نقطة الفرق عن لوحات B860 الأغلى.
* فتحتا ذاكرة فقط (حتى 128 جيجابايت).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا واي‑فاي مدمج.

---
بإمكانك التوجه إلى [ASRock B860M Pro RS WiFi](/components/${ALT.asrB860m}) إذا كان توجهك يتركز على الآتي:
* واي‑فاي مدمج وفتحة كرتٍ بالجيل الخامس.
https://www.asus.com/motherboards-components/motherboards/prime/prime-b860m-k/techspec/`,
  },
  {
    categoryId: MB, brand: 'MSI', name: 'B860M Gaming Plus WiFi', tdpWattage: 10, performanceTier: 3,
    specs: board({ socket: 'LGA1851', chipset: 'B860', ff: 'Micro-ATX', maxRam: '256GB', mem: '8800 MT/s (OC)', m2: 3, pcie: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '5GbE' }),
    offers: [C('msi-b860m-gaming-plus-wifi-motherboard-27095'), A('B0BV2D5H5X'), M('msi-b860m-gaming-plus-wifi-lga-1851-micro-atx-motherboard-intel-b860-chipset-4x-ddr5-udimm-slots-up-to-256gb-max-memory-4x-pcie-x16-slots-3x-m-2-slots-wifi-bt-connectivity-911-7e42-003')],
    description: `### MSI B860M Gaming Plus WiFi

لوحة Micro-ATX بشبكةٍ أسرع من فئتها: 5 جيجابت من Intel Killer، مع واي‑فاي 7.

**التقنيات الأساسية المدعومة:**

[green]شبكة Intel Killer E5000 بسرعة 5 جيجابت، وواي‑فاي 7 (Killer BE1750x).[/green]

[green]PCIe 5.0 للكرت والتخزين:[/green] فتحة الكرت x16 وأوّل منفذ M.2 بالجيل الخامس.

[green]DDR5 حتى 256 جيجابايت:[/green] أربع فتحات بسرعة تصل إلى 8800 MT/s كسر سرعة، مع دعم CUDIMM.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 الثالث بالجيل الرابع x2.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* حجم Micro-ATX: فتحات توسعةٍ أقلّ من لوحات ATX.

---
بإمكانك التوجه إلى [MSI PRO B860-P WiFi](/components/${ALT.msiB860P}) إذا كان توجهك يتركز على الآتي:
* لوحة ATX بالحجم الكامل من MSI.
https://www.msi.com/Motherboard/B860M-GAMING-PLUS-WIFI/Specification`,
  },
  {
    categoryId: MB, brand: 'MSI', name: 'MAG B860 Tomahawk WiFi', tdpWattage: 10, performanceTier: 4,
    specs: board({ socket: 'LGA1851', chipset: 'B860', ff: 'ATX', maxRam: '256GB', mem: '9200 MT/s (OC)', m2: 3, pcie: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '5GbE' }),
    offers: [C('msi-mag-b860-tomahawk-wifi-motherboard-27099'), A('B0BV2CQMHJ'), M('msi-mag-b860-tomahawk-wifi-lga-1851-atx-motherboard-intel-b860-chipset-4x-ddr5-udimm-slots-up-to-256gb-max-memory-2x-pcie-slots-3x-m-2-slots-wifi-bt-connectivity-911-7e39-001')],
    description: `### MSI MAG B860 Tomahawk WiFi

أعلى لوحة B860 في الكتالوج: ذاكرةٌ أسرع، وثلاثة منافذ M.2 بأربعة مسارات كاملة، وشبكة 5 جيجابت.

**التقنيات الأساسية المدعومة:**

[green]DDR5 بسرعة تصل إلى 9200 MT/s كسر سرعة:[/green] أربع فتحات حتى 256 جيجابايت، مع دعم CUDIMM.

[green]ثلاثة منافذ M.2 بأربعة مسارات:[/green] الأوّل بالجيل الخامس من المعالج، والآخران بالجيل الرابع x4.

[green]شبكة Intel Killer E5000 بسرعة 5 جيجابت، وواي‑فاي 7.[/green]

[green]PCIe 5.0 لفتحة الكرت:[/green] x16 من المعالج.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* شيبست B860 لا يدعم كسر سرعة المعالج — لذلك Z890.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* فتحتا توسعة فقط بحسب MSI.

---
بإمكانك التوجه إلى [Gigabyte Z890 AORUS Elite WiFi7](/components/${ALT.z890Elite}) إذا كان توجهك يتركز على الآتي:
* كسر سرعة معالجات K، وأربعة منافذ M.2.
https://www.msi.com/Motherboard/MAG-B860-TOMAHAWK-WIFI/Specification`,
  },
  // ═════════════════════ اللوحات — X870 / Z890 ═════════════════════
  {
    categoryId: MB, brand: 'ASUS', name: 'PRIME X870-P WiFi', tdpWattage: 15, performanceTier: 4,
    specs: board({ socket: 'AM5', chipset: 'X870', ff: 'ATX', maxRam: '256GB', mem: '8000+ MT/s (OC)', m2: 4, pcie: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE' }),
    offers: [C('asus-prime-x870-p-wifi-motherboard-23472'), A('B0DGQ6RGD6')],
    description: `### ASUS PRIME X870-P WiFi

مدخل ASUS إلى شيبست X870: منفذا USB4، وأربعة منافذ M.2، وواي‑فاي 7.

**التقنيات الأساسية المدعومة:**

[green]منفذا USB4 بسرعة 40 جيجابت:[/green] يحملان صورة الشاشة مع المعالجات ذات الرسوميات المدمجة.

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس x4.

[green]PCIe 5.0 لفتحة الكرت:[/green] x16 من المعالج.

[green]واي‑فاي 7 وشبكة 2.5 جيجابت.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منافذ التخزين تتقاسم المسارات: M.2_2 يعطّل إحدى فتحات x1، وM.2_4 (الجيل الثالث x2) يعطّل منفذَي SATA 1 و2.
* منفذا SATA فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* الشبكة السلكيّة 2.5 جيجابت — بعض لوحات X870 تعطي 5.

---
بإمكانك التوجه إلى [MSI PRO X870-P WiFi](/components/${ALT.msiX870P}) إذا كان توجهك يتركز على الآتي:
* البديل المقابل من MSI بالشيبست نفسه.
https://www.asus.com/motherboards-components/motherboards/prime/prime-x870-p-wifi/techspec/`,
  },
  {
    categoryId: MB, brand: 'Gigabyte', name: 'Z890 EAGLE WiFi7', tdpWattage: 15, performanceTier: 4,
    specs: board({ socket: 'LGA1851', chipset: 'Z890', ff: 'ATX', maxRam: '256GB', mem: '9200 MT/s (OC)', m2: 4, pcie: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE' }),
    offers: [C('gigabyte-z890-eagle-wifi7-motherboard-30772'), A('B0DK7L53KD'), M('gigabyte-z890-eagle-wi-fi-7-lga-1851-atx-motherboard-intel-z890-chipset-4x-ddr5-dimm-slots-up-to-256gb-max-memory-wi-fi-7-bt-5-4-1x-pcie-5-0-x16-4x-m-2-slots-z890-eagle-wifi7')],
    description: `### Gigabyte Z890 EAGLE WiFi7

أرخص طريق إلى شيبست Z890 في الكتالوج — لمن يريد كسر سرعة معالجات Core Ultra K.

**التقنيات الأساسية المدعومة:**

[green]شيبست Z890:[/green] يدعم كسر سرعة المعالجات المفتوحة (K) والذاكرة.

[green]DDR5 بسرعة تصل إلى 9200 MT/s كسر سرعة:[/green] أربع فتحات حتى 256 جيجابايت.

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس x4، والثلاثة الأخرى بالجيل الرابع.

[green]منفذ USB4 بصورة DisplayPort، وواي‑فاي 7، وشبكة 2.5 جيجابت.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الفتحتان الإضافيّتان بالجيل الرابع x4.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* مراحل طاقة أبسط من لوحات Z890 الأعلى — لكسر سرعةٍ معتدل لا قاسٍ.

---
بإمكانك التوجه إلى [Gigabyte Z890 AORUS Elite WiFi7](/components/${ALT.z890Elite}) إذا كان توجهك يتركز على الآتي:
* مراحل طاقة وتبريدٌ أقوى لمعالجات Core Ultra 9.
https://www.gigabyte.com/Motherboard/Z890-EAGLE-WIFI7/sp`,
  },
  // ═════════════════════ المعالجات ═════════════════════
  {
    categoryId: CPU, brand: 'Intel', name: 'Core Ultra 5 245KF', tdpWattage: 159, performanceTier: 3,
    specs: { socket: 'LGA1851', tdpW: 125, cores: '14', threads: '14', pCores: 6, eCores: 8, baseClock: '4.2 GHz', boostClock: '5.2 GHz', l3Cache: '24MB', architecture: 'Arrow Lake', memorySupport: 'DDR5-6400', includedCooler: 'None', integratedGraphics: 'None' },
    offers: [C('intel-core-ultra-i5-245kf-cpu-23180'), A('B0DFK8HHK4')],
    description: `### Intel Core Ultra 5 245KF

الشريحة نفسها التي في Core Ultra 5 245K، بلا رسوميات مدمجة — أرخص منها لمن سيركّب كرت شاشة على أيّ حال.

**التقنيات الأساسية المدعومة:**

[green]14 نواة (6 أداء + 8 كفاءة):[/green] حتى 5.2 جيجاهرتز.

[green]مفتوح لكسر السرعة:[/green] على لوحات Z890.

[green]DDR5-6400 رسمياً:[/green] ومنصّة LGA1851 الحاليّة من إنتل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 14 مساراً فقط — Arrow Lake بلا تقنية المسارين لكلّ نواة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ⚠️ **بلا رسوميات مدمجة**: لا يعمل الجهاز بلا كرت شاشة.
* بلا مبرّد في العلبة.

---
بإمكانك التوجه إلى [Intel Core Ultra 5 245K](/components/${ALT.u5_245k}) إذا كان توجهك يتركز على الآتي:
* رسوميات مدمجة تشغّل الجهاز بلا كرت، أو عند عطل الكرت.
https://www.intel.com/content/www/us/en/products/sku/241066/intel-core-ultra-5-processor-245kf-24m-cache-up-to-5-20-ghz/specifications.html`,
  },
  {
    categoryId: CPU, brand: 'Intel', name: 'Core i7-14700F', tdpWattage: 219, performanceTier: 4,
    specs: { socket: 'LGA1700', tdpW: 65, cores: '20', threads: '28', pCores: 8, eCores: 12, baseClock: '2.1 GHz', boostClock: '5.4 GHz', l3Cache: '33MB', architecture: 'Raptor Lake Refresh', memorySupport: 'DDR5-5600 / DDR4-3200', includedCooler: 'Laminar RM1', integratedGraphics: 'None' },
    offers: [C('intel-core-i7-14700f-cpu-aa16621'), A('B0CQ65ST43')],
    description: `### Intel Core i7-14700F

Core i7-14700 نفسه بلا رسوميات مدمجة: 20 نواة على منصّة LGA1700، ويعمل مع لوحات DDR4 وDDR5.

**التقنيات الأساسية المدعومة:**

[green]20 نواة (8 أداء + 12 كفاءة) و28 مساراً:[/green] حتى 5.4 جيجاهرتز.

[green]DDR5-5600 أو DDR4-3200:[/green] يركب على لوحات LGA1700 القديمة والجديدة.

[green]مبرّد Laminar RM1 في العلبة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المبرّد المرفق يكفي الاستعمال العاديّ؛ لحملٍ طويل (مونتاج، تصيير) مبرّدٌ أقوى أفضل — يسحب حتى 219 واط.
* منصّة LGA1700 لن تستقبل أجيالاً جديدة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ⚠️ **بلا رسوميات مدمجة**: يحتاج كرت شاشة.
* مقفل — لا كسر سرعة.

---
بإمكانك التوجه إلى [Intel Core i7-14700](/components/${ALT.i7_14700}) إذا كان توجهك يتركز على الآتي:
* رسوميات مدمجة تشغّل الجهاز بلا كرت.
https://www.intel.com/content/www/us/en/products/sku/236854/intel-core-i7-processor-14700f-33m-cache-up-to-5-40-ghz/specifications.html`,
  },
  // ═════════════════════ المزوّدات ═════════════════════
  {
    categoryId: PSU, brand: 'ASUS', name: 'ROG Strix 1000W Platinum White', tdpWattage: 0, performanceTier: 5,
    specs: { wattage: '1000', rating: '80+ Platinum', modularity: 'Full', formFactor: 'ATX 3.1', color: 'White', qualityTier: 'A' },
    offers: [C('asus-rog-strix-1000w-platinum-edition-white-28411'), A('B0H85FHVRC'), M('asus-rog-strix-1000w-platinum-fully-modular-power-supply-80-plus-platinum-efficiency-active-pfc-gan-mosfet-atx-3-1-compatible-cybernetic-lambda-a-dual-ball-fan-bearings-white-90ye00w4-b0na00')],
    description: `### ASUS ROG Strix 1000W Platinum (White)

مزوّد 1000 واط بكفاءة بلاتينيّة وتصنيف A في قائمة SPL المستقلّة — يكفي أقوى الكروت بهامشٍ مريح.

**التقنيات الأساسية المدعومة:**

[green]80 Plus Platinum:[/green] حرارةٌ وهدرٌ أقلّ من المزوّدات الذهبيّة.

[green]ATX 3.1 بموصّل 12V-2x6:[/green] للكروت الحديثة بكابلٍ واحد.

[green]كابلات قابلة للفكّ بالكامل:[/green] ترتيبٌ أسهل وكابلاتٌ أقلّ في الكيس.

[green]تصنيف A في قائمة SPL:[/green] جودة مكوّناتٍ وحماية تناسب الأجهزة القويّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 1000 واط أكثر ممّا يحتاجه أغلب الأجهزة — تأكّد من حاجتك قبل دفع الفرق.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* النسخة البيضاء — لونها جزءٌ من سعرها.

---
بإمكانك التوجه إلى [ASUS ROG Strix 1200W Platinum](/components/${ALT.strix1200}) إذا كان توجهك يتركز على الآتي:
* هامش 1200 واط لكروت RTX 5090 وما يشبهها.
https://rog.asus.com/power-supply-units/rog-strix/rog-strix-1000p-gaming/`,
  },
  {
    categoryId: PSU, brand: 'ASUS', name: 'Prime 750W Bronze', tdpWattage: 0, performanceTier: 2,
    specs: { wattage: '750', rating: '80+ Bronze', modularity: 'Non-Modular', formFactor: 'ATX', color: 'Black' },
    offers: [C('asus-prime-750w-bronze-psu-black-33963'), A('B0F13RC5WK'), M('asus-prime-750w-non-modular-power-supply-80-plus-bronze-atx12v-form-factor-dual-ball-fan-bearings-135mm-fan-design-etched-cables-black-90ye00y0-b0na00')],
    description: `### ASUS Prime 750W Bronze

مزوّد 750 واط اقتصاديّ من ASUS — يكفي جهازاً بكرتٍ متوسّط.

**التقنيات الأساسية المدعومة:**

[green]750 واط بكفاءة 80 Plus Bronze.[/green]

[green]مروحة 135 مم بمحامل كرويّة مزدوجة:[/green] أطول عمراً من المحامل الانزلاقيّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ليس في القائمة الرئيسيّة لتصنيف SPL — فلا تقييم مستقلّاً لجودته عندنا.
* كفاءة برونزيّة: هدرٌ وحرارةٌ أعلى من الذهبيّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* كابلاتٌ ثابتة غير قابلة للفكّ.

---
بإمكانك التوجه إلى [MSI MAG A650BN](/components/${ALT.a650bn}) إذا كان توجهك يتركز على الآتي:
* مزوّدٌ أرخص بقدرة 650 واط لجهازٍ أخفّ.
https://www.asus.com/motherboards-components/power-supply-units/prime/prime-750b-black/techspec/`,
  },
  // ═════════════════════ التخزين ═════════════════════
  {
    categoryId: STO, brand: 'Samsung', name: '990 PRO 4TB', tdpWattage: 8, performanceTier: 5,
    specs: { type: 'NVMe M.2', capacity: '4TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7450 MB/s', writeSpeed: '6900 MB/s', dramCache: 'Yes', tbw: '2400 TB' },
    offers: [A('B0CBYZ6DD1'), M('samsung-980-pro-4tb-nvme-m-2-internal-ssd-pcie-gen-4-0-x4-nvme-1-3-interface-7450-mb-s-sequential-read-speed-6900-mb-s-sequential-write-speed-3-3v-voltage-v-nand-3-bit-mlc-mz-v9p4t0bw-am')],
    description: `### Samsung 990 PRO 4TB

قرص 990 PRO نفسه بسعة 4 تيرابايت — أسرع أقراص الجيل الرابع ومعه ذاكرة DRAM.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7450 وكتابة 6900 ميجابايت/ث:[/green] قرب سقف الجيل الرابع.

[green]ذاكرة DRAM مؤقّتة:[/green] أداءٌ ثابت في النسخ الطويل وحين يمتلئ القرص.

[green]تحمّل 2400 تيرابايت كتابة:[/green] بحسب Samsung — ضعف نسخة 2 تيرابايت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* أقراص الجيل الخامس أسرع على الورق، والفرق في الألعاب يكاد لا يُرى.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* هذه النسخة بلا مشتّت حرارة — ركّبه تحت مشتّت اللوحة.

---
بإمكانك التوجه إلى [Samsung 990 PRO 2TB](/components/${ALT.pro2tb}) إذا كان توجهك يتركز على الآتي:
* القرص نفسه بنصف السعة والسعر.
https://www.samsung.com/us/memory-storage/nvme-ssd/990-pro-pcie-4-0-nvme-ssd-4tb-sku-mz-v9p4t0b-am/`,
  },
];

// ---------------------------------------------------------------- التنفيذ
const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));

let blocked = false;
for (const p of PARTS) {
  const live = p.offers.length;
  console.log(`\n=== ${p.brand} ${p.name}  (${live} متاجر)`);
  const dup = await prisma.component.findFirst({ where: { brand: p.brand, name: { equals: p.name, mode: 'insensitive' } } });
  if (dup) { console.log(`    ⛔ موجودة: ${dup.id}`); blocked = true; }
  if (live < 2) { console.log('    ⛔ أقلّ من متجرين'); blocked = true; }
  for (const o of p.offers) {
    const taken = await prisma.componentOffer.findFirst({ where: { url: o.url }, select: { component: { select: { name: true } } } });
    if (taken) { console.log(`    ⛔ رابط ${o.store} مستعمل في: ${taken.component.name}`); blocked = true; } else console.log(`    ✔ ${o.store}`);
  }
}
for (const id of Object.values(ALT)) if (!(await prisma.component.findUnique({ where: { id }, select: { id: true } }))) { console.log(`⛔ بديلٌ لا يشير إلى قطعة: ${id}`); blocked = true; }

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log(`\n(عرضٌ فقط — ${PARTS.length} قطعة · أضف --apply)`); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-batch-${stamp}.json`, JSON.stringify(PARTS, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch-${stamp}.json`);

const ids = {};
for (const p of PARTS) {
  const { offers, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  for (const o of offers) await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: true } });
  ids[`${p.brand} ${p.name}`] = c.id;
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}
/* البديلان المتبادلان بين لوحتَي Gigabyte B850 — لم يكن لهما معرّفٌ قبل الإنشاء */
const swap = { '{{AORUS_B850}}': ids['Gigabyte B850 AORUS Elite WiFi7'], '{{GAMINGX_B850}}': ids['Gigabyte B850 GAMING X WiFi6E'] };
for (const id of Object.values(ids)) {
  const c = await prisma.component.findUnique({ where: { id }, select: { description: true } });
  if (c?.description?.includes('{{')) {
    let d = c.description; for (const [k, v] of Object.entries(swap)) d = d.split(k).join(v);
    await prisma.component.update({ where: { id }, data: { description: d } });
  }
}
console.log(`\nالتالي:\n  npx tsx scripts/scrape-one.ts ${Object.values(ids).join(' ')}\n  npx tsx scripts/fetch-images.ts --missing`);
await prisma.$disconnect();
