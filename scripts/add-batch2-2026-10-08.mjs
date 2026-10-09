/**
 * ============ الدفعة الثانية من «القطع الناقصة» — ٢٠ قطعة — 2026-10-08 ============
 *
 * طلب نوّاف: «كمل ضيف اكبر قدر تقدر عليه + تأكد من الوصف والمواصفات وكامل الاشياء».
 * قاعدته: متجران حيّان على الأقلّ، بلا تكرار. والكروت لا تُضاف (صفٌّ واحدٌ لكلّ شريحة).
 *
 * كلّ صفحة متجرٍ هنا قُرئت 2026-10-08 (كازاسوق: «التوفر» والعنوان؛ أمازون: العنوان
 * والسعر والتوفّر ورقم الموديل عند اللبس؛ مايكرولس: البيان المُهيكل).
 * والمواصفات من صفحة الصانع المذكورة في آخر سطرٍ من كلّ وصف — فُتحت كلّها.
 *
 * ✕ XPG Lancer Blade RGB 32GB 6000 CL36 أسود — كان في القائمة وحُذف: هو نفسه
 *   «ADATA Lancer Blade 32GB 6000MHz» (cmpiecqao005c00ym91dkcumi) — عرض مايكرولس
 *   هناك AX5U6000C3616G-DTLABRBK وعرض أمازون B0F8SP6TQ2، أي القطعة ذاتها.
 *
 * ↪ MSI MPG A1000GS: عرض كازاسوق 34438 مربوطٌ خطأً بـ«MPG A1000G PCIe 5» (طرازٌ أقدم)
 *   فيُنقل إلى صفّه الصحيح هنا بدل إضافة رابطٍ ثانٍ له.
 *
 *   node scripts/add-batch2-2026-10-08.mjs           # عرض
 *   node scripts/add-batch2-2026-10-08.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const MB = 'cmpfziqe70001x4ym928tt3o2';
const PSU = 'cmpfziqh70002x4ym6ln587z2';
const CASE = 'cmpfziquj0006x4ym53f0ehcw';
const COOL = 'cmszm2ym00000swymvd5s2yxm';

const C = (slug) => ({ store: 'cazasouq', url: `https://www.cazasouq.com/${slug}` });
const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });
const M = (slug) => ({ store: 'microless', url: `https://saudi.microless.com/product/${slug}/` });

/* البدائل في سطر «بإمكانك التوجه إلى» — يُتحقَّق من وجود كلٍّ منها قبل الكتابة */
const ALT = {
  STEEL_LEGEND: ['ASRock B850 Steel Legend WiFi', 'cmuzkkgbo000hu4ymni68rfcj'],
  TUF_B850M: ['ASUS TUF Gaming B850M-Plus WiFi', 'cmuzkkf4d0003u4ymwvmyd4uv'],
  PRIME_B650M: ['ASUS PRIME B650M-A WiFi', 'cmpiec7yr003800ymo8zhug3e'],
  PRIME_X870P: ['ASUS PRIME X870-P WiFi', 'cmuzkkhyr000zu4ymd2rvzlx2'],
  X870_ELITE: ['Gigabyte X870 AORUS Elite WiFi7', 'cmpiec6p9003400ymwohd55y3'],
  X870E_GPLUS: ['MSI X870E Gaming Plus WiFi', 'cmuzjsmyz00002kymo9ezj0td'],
  X870E_E: ['ASUS ROG Strix X870E-E Gaming WiFi', 'cmpiec8zy003c00ymdvvn2eez'],
  Z890_EAGLE: ['Gigabyte Z890 EAGLE WiFi7', 'cmuzkki8s0012u4ymfw1ofa3v'],
  B860M_GPLUS: ['MSI B860M Gaming Plus WiFi', 'cmuzkkh91000ru4ymn940fnmy'],
  GF3_1000: ['Thermaltake Toughpower GF3 1000W', 'cmpiechj4004a00ym7kkv09n4'],
  RM1000X_SHIFT: ['Corsair RM1000x Shift 1000W', 'cmpieb9r7001000ymgi5gvaai'],
  LANCOOL_216: ['Lian Li LANCOOL 216', 'cmpfzir17000gx4ymtjjn4ag1'],
  D4000_AIRFLOW: ['Corsair 4000D Airflow', 'cmpieb39w000c00ym9n758myw'],
  LANCOOL_III: ['Lian Li Lancool III RGB', 'cmpieby64002a00ym3f3vl6no'],
  Y60: ['HYTE Y60', 'cmpiec10g002k00ym6tok8itf'],
  VISION_COMPACT: ['Lian Li O11 Vision Compact White', 'cmu6n396c0000w4ymd6gibkjc'],
  D5000_AIRFLOW: ['Corsair 5000D Airflow', 'cmpiec081002h00ymnwss7xit'],
  LE360_WHITE: ['DeepCool LE360 V2 White', 'cmszmclxq000azsymfdlrfubz'],
  KRAKEN_CORE_360: ['NZXT Kraken Core 360 RGB', 'cmszn26jy000cw8ym0jada1sr'],
};
const alt = (k, why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n* ${why}`;

const board = (brand, name, tdpWattage, performanceTier, specs, offers, description) =>
  ({ categoryId: MB, brand, name, tdpWattage, performanceTier, specs: { ramType: 'DDR5', ...specs }, offers, description });

const PARTS = [
  // ================================================================ اللوحات
  board('ASUS', 'ROG Strix B850-F Gaming WiFi', 10, 4,
    { socket: 'AM5', chipset: 'B850', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8000+ MT/s (OC)', m2Slots: '4', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE' },
    [C('asus-rog-strix-b850-f-gaming-wifi-motherboard-27703'), A('B0DPLQWLBD')],
    `### ASUS ROG Strix B850-F Gaming WiFi

لوحة B850 من فئة ROG Strix بمواصفات قريبة من لوحات X870: فتحة كرتٍ من الجيل الخامس، ومنفذا تخزينٍ من الجيل الخامس، وواي‑فاي 7.

**التقنيات الأساسية المدعومة:**

[green]PCIe 5.0 للكرت والتخزين:[/green] فتحة الكرت الأولى بالجيل الخامس x16، ومنفذان من أربعة منافذ M.2 بالجيل الخامس.

[green]أربعة منافذ M.2:[/green] متّسعٌ لأربعة أقراص NVMe دون بطاقات إضافيّة.

[green]واي‑فاي 7 وشبكة Intel بسرعة 2.5 جيجابت:[/green] مثبّتان في اللوحة.

[green]DDR5 حتى 256 جيجابايت:[/green] أربع فتحات، وسرعة تصل إلى 8000+ MT/s كسر سرعة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذا SATA فقط — يكفيان قرصين تقليديّين، لا أكثر.
* فتحة PCIe 4.0 الثانية (من الشيبست) تتقاسم المسارات مع منفذ M.2 الثالث.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا USB4 — منفذ 40 جيجابت حكرٌ على لوحات X870 في هذا الجيل.

${alt('STEEL_LEGEND', 'أربعة منافذ M.2 وواي‑فاي 7 بسعرٍ أقلّ عادةً، دون اسم ROG وبرامجه.')}
https://rog.asus.com/motherboards/rog-strix/rog-strix-b850-f-gaming-wifi/spec/`),

  board('Gigabyte', 'B850M Force WiFi6E', 10, 2,
    { socket: 'AM5', chipset: 'B850', formFactor: 'Micro-ATX', maxRam: '128GB', memorySpeed: '9600 MT/s (OC)', m2Slots: '3', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 6E', lan: '2.5GbE' },
    [C('gigabyte-b850m-aorus-force-wifi6e-motherboard-47654'), A('B0FH29B7XW'), M('gigabyte-b850m-force-wifi6e-am5-micro-atx-motherboard-amd-b850-chipset-2x-ddr5-dimm-slots-up-to-256gb-max-memory-1x-pcie-5-0-x16-slot-3x-m-2-slots-wifi-6e-bt-5-3-b850m-force-wf6e')],
    `### Gigabyte B850M Force WiFi6E

لوحة B850 صغيرة (Micro-ATX) بفتحتَي ذاكرة فقط، تعطي الجيل الخامس للكرت والتخزين بسعر لوحةٍ اقتصاديّة.

**التقنيات الأساسية المدعومة:**

[green]PCIe 5.0 للكرت وأوّل منفذ M.2:[/green] كلاهما من المعالج مع Ryzen 9000 و7000.

[green]ثلاثة منافذ M.2:[/green] اثنان من المعالج (الجيل الخامس والرابع) وثالثٌ من الشيبست، مع أربعة منافذ SATA.

[green]واي‑فاي 6E وبلوتوث 5.3:[/green] مع شبكةٍ سلكيّة Realtek بسرعة 2.5 جيجابت.

[green]ذاكرة عالية السرعة:[/green] فتحتان فقط تعنيان مساراً أقصر، والصانع يذكر حتى 9600 MT/s كسر سرعة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا ذاكرة فقط وحدٌّ أقصى 128 جيجابايت — الترقية لاحقاً تعني استبدال الشريحتين لا الإضافة إليهما.
* منفذ M.2 الثالث من الشيبست يعمل بالجيل الرابع x2، أي نصف سرعة المنفذين الآخرين.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا واي‑فاي 7 ولا USB4.

${alt('TUF_B850M', 'أربع فتحات ذاكرة تقبل 256 جيجابايت في لوحة Micro-ATX من الشيبست نفسه.')}
https://www.gigabyte.com/Motherboard/B850M-FORCE-WIFI6E-rev-10/sp`),

  board('MSI', 'B650M Gaming Plus WiFi', 10, 2,
    { socket: 'AM5', chipset: 'B650', formFactor: 'Micro-ATX', maxRam: '256GB', memorySpeed: '7200+ MT/s (OC)', m2Slots: '2', pcieVersion: 'PCIe 4.0', wifi: 'Wi-Fi 6E', lan: '2.5GbE' },
    [A('B0CRKRJQ1T'), M('msi-b650m-gaming-plus-wifi-matx-am5-motherboard-amd-b650-chipset-4x-ddr5-udimm-slot-up-to-256gb-max-memory-1x-pci-e-x16-slot-2x-m-2-slot-911-7e24-013')],
    `### MSI B650M Gaming Plus WiFi

لوحة AM5 صغيرة (Micro-ATX) بأربع فتحات ذاكرة وواي‑فاي 6E — قاعدةٌ عمليّة لجهاز ألعاب بمعالج Ryzen.

**التقنيات الأساسية المدعومة:**

[green]أربع فتحات DDR5 حتى 256 جيجابايت:[/green] بسرعة تصل إلى 7200+ MT/s كسر سرعة.

[green]منفذا M.2 من المعالج:[/green] كلاهما بالجيل الرابع x4، مع أربعة منافذ SATA.

[green]واي‑فاي 6E وبلوتوث 5.3:[/green] مع شبكةٍ سلكيّة Realtek بسرعة 2.5 جيجابت.

[green]منفذ Type-C أماميّ بسرعة 10 جيجابت:[/green] رأسٌ داخليّ لمنفذ الكيس الأماميّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحة الكرت بالجيل الرابع لا الخامس — لا أثر لها في أداء كروت اليوم، لكنّها أقلّ قابليّةً للمستقبل.
* شريحة صوت Realtek ALC897 أساسيّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تخزين من الجيل الخامس (PCIe 5.0 NVMe).

${alt('PRIME_B650M', 'لوحة B650 صغيرة بواي‑فاي بسعرٍ أقلّ عادةً، إن كان السعر هو الأهمّ.')}
https://www.msi.com/Motherboard/B650M-GAMING-PLUS-WIFI/Specification`),

  board('ASUS', 'X870 MAX Gaming WiFi7', 15, 4,
    { socket: 'AM5', chipset: 'X870', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8000+ MT/s (OC)', m2Slots: '3', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE' },
    [C('asus-x870-max-gaming'), M('asus-x870-max-gaming-wifi7-am5-atx-motherboard-amd-x870-chipset-4x-ddr5-dimm-slots-up-to-256gb-max-memory-1x-pcie-5-0-x16-3x-m-2-slots-wi-fi-7-bluetooth-v5-4-90mb1ly0-m0eay0')],
    `### ASUS X870 MAX Gaming WiFi7

لوحة X870 سوداء من سلسلة ASUS «MAX Gaming»: منفذا USB4 وواي‑فاي 7 وفتحة كرتٍ من الجيل الخامس.

**التقنيات الأساسية المدعومة:**

[green]منفذا USB4 بسرعة 40 جيجابت:[/green] يحملان صورةً أيضاً مع المعالجات ذات الرسوميات المدمجة.

[green]PCIe 5.0 للكرت وأوّل منفذ M.2:[/green] كلاهما من المعالج مع Ryzen 9000 و7000.

[green]واي‑فاي 7 وبلوتوث 5.4:[/green] مع شبكةٍ سلكيّة Realtek بسرعة 2.5 جيجابت.

[green]DDR5 حتى 256 جيجابايت:[/green] أربع فتحات بسرعة تصل إلى 8000+ MT/s كسر سرعة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 الثاني يتقاسم المسارات مع USB4: يتعطّل حين يعمل أحد منفذَي USB4 (يُبدَّل من البيوس) — فعملياً قرصان NVMe مع USB4.
* فتحة PCIe 3.0 السفليّة تُعطّل منفذَي SATA رقم 3 و4 حين تُستعمل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تخزين من الجيل الخامس غير المنفذ الأوّل، ولا شبكة أسرع من 2.5 جيجابت.

${alt('PRIME_X870P', 'أربعة منافذ M.2 من شيبست X870 بسعرٍ أقلّ عادةً.')}
https://www.asus.com/motherboards-components/motherboards/others/x870-max-gaming-wifi7/techspec/`),

  board('Gigabyte', 'X870 Gaming X WiFi7', 15, 4,
    { socket: 'AM5', chipset: 'X870', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8200 MT/s (OC)', m2Slots: '3', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE' },
    [C('gigabyte-x870-gaming-x-wifi7-motherboard-30732'), A('B0DHVLP1L9'), M('gigabyte-x870-gaming-x-wifi7-motherboard-amd-x870-chipset-amd-socket-am5-dual-channel-ddr5-wifi-ez-plug-friendly-ui-ultra-fast-storage-ez-latch-click-x870-gaming-x-wifi7')],
    `### Gigabyte X870 Gaming X WiFi7

مدخل Gigabyte إلى شيبست X870: منفذا USB4 وواي‑فاي 7 ومراحل طاقة 16+2+2، في ثلاثة متاجر.

**التقنيات الأساسية المدعومة:**

[green]منفذا USB4 خلفيّان:[/green] يحملان صورةً حتى 4K بتردّد 240 هرتز مع المعالجات ذات الرسوميات المدمجة.

[green]PCIe 5.0 للكرت وأوّل منفذ M.2:[/green] من المعالج مع Ryzen 9000 و7000، ومنفذان آخران بالجيل الرابع.

[green]مراحل طاقة 16+2+2 بـDrMOS 60 أمبير:[/green] تكفي معالجات Ryzen 9 تحت الحمل.

[green]واي‑فاي 7 وبلوتوث 5.4:[/green] مع شبكةٍ سلكيّة Realtek بسرعة 2.5 جيجابت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ثلاثة منافذ M.2 — أقلّ من لوحات X870 التي تصل إلى أربعة.
* فتحتا التوسعة الإضافيّتان بالجيل الثالث x1 فقط — لبطاقات صغيرة لا لكرتٍ ثانٍ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شبكة 5 جيجابت ولا صوتٌ متقدّم.

${alt('X870_ELITE', 'أربعة منافذ M.2 وتبريد أقوى لمراحل الطاقة من الصانع نفسه.')}
https://www.gigabyte.com/Motherboard/X870-GAMING-X-WIFI7-rev-1x/sp`),

  board('ASUS', 'TUF Gaming X870-Plus WiFi', 15, 4,
    { socket: 'AM5', chipset: 'X870', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8000+ MT/s (OC)', m2Slots: '4', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE' },
    [C('asus-tuf-gaming-x870-plus-wifi-motherboard-23105'), A('B0DGB8Q19Y')],
    `### ASUS TUF Gaming X870-Plus WiFi

لوحة X870 من سلسلة TUF المعروفة بالمتانة: منفذا M.2 من الجيل الخامس، وUSB4، وواي‑فاي 7.

**التقنيات الأساسية المدعومة:**

[green]منفذا M.2 بالجيل الخامس من المعالج:[/green] ومنفذان آخران بالجيل الرابع من الشيبست — أربعة أقراص NVMe إجمالاً.

[green]USB4 بسرعة 40 جيجابت:[/green] من مزايا شيبست X870.

[green]واي‑فاي 7 وبلوتوث 5.4:[/green] مع شبكةٍ سلكيّة Realtek بسرعة 2.5 جيجابت.

[green]DDR5 حتى 256 جيجابايت:[/green] أربع فتحات بسرعة تصل إلى 8000+ MT/s كسر سرعة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 الثاني (الجيل الخامس) يتقاسم المسارات مع فتحة الكرت: إن رُكّب فيه قرصٌ نزلت الفتحة إلى x8.
* منفذ M.2 الرابع يُعطّل فتحة PCIe 4.0 السفليّة، ومنفذا SATA فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شبكة 5 جيجابت.

${alt('X870E_GPLUS', 'شيبست X870E وشبكة 5 جيجابت بسعرٍ قريبٍ أو أقلّ.')}
https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-x870-plus-wifi/techspec/`),

  board('MSI', 'PRO X870E-P WiFi', 15, 4,
    { socket: 'AM5', chipset: 'X870E', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8200+ MT/s (OC)', m2Slots: '3', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '5GbE' },
    [C('msi-pro-x870e-p-wifi-motherboard-35439'), A('B0F97HZ5R1')],
    `### MSI PRO X870E-P WiFi

لوحة X870E من سلسلة PRO العمليّة: شبكة 5 جيجابت وواي‑فاي 7 وUSB4، بتصميمٍ هادئ لا يستهدف الإضاءة.

**التقنيات الأساسية المدعومة:**

[green]شبكة سلكيّة Realtek بسرعة 5 جيجابت:[/green] ضعف ما في معظم لوحات هذه الفئة.

[green]PCIe 5.0 للكرت وأوّل منفذ M.2:[/green] كلاهما من المعالج مع Ryzen 9000 و7000.

[green]منفذ USB4 بسرعة 40 جيجابت:[/green] يحمل صورة DisplayPort مع المعالجات ذات الرسوميات المدمجة، ومعه منفذ Type-C خلفيّ بسرعة 20 جيجابت.

[green]واي‑فاي 7:[/green] مثبّتٌ في اللوحة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ثلاثة منافذ M.2، اثنان منها بالجيل الرابع من الشيبست.
* شريحة صوت Realtek ALC897 أساسيّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* فتحات التوسعة الإضافيّة من الشيبست (x4 وx1) — لا تصلح لكرتٍ ثانٍ بأداءٍ كامل.

${alt('X870E_E', 'خمسة منافذ M.2 ومراحل طاقة أقوى لمعالجات Ryzen 9 تحت حملٍ طويل.')}
https://www.msi.com/Motherboard/PRO-X870E-P-WIFI/Specification`),

  board('ASUS', 'Prime Z890M-Plus WiFi', 15, 4,
    { socket: 'LGA1851', chipset: 'Z890', formFactor: 'Micro-ATX', maxRam: '256GB', memorySpeed: '8666+ MT/s (OC)', m2Slots: '3', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE' },
    [C('asus-prime-z890m-plus-wifi-motherboard-23492'), A('B0DJDFDYSN')],
    `### ASUS Prime Z890M-Plus WiFi

لوحة Z890 صغيرة (Micro-ATX) لمعالجات Core Ultra 200S — تتيح كسر سرعة معالجات K في كيسٍ صغير.

**التقنيات الأساسية المدعومة:**

[green]شيبست Z890:[/green] كسر سرعة المعالج والذاكرة متاحٌ مع معالجات K.

[green]PCIe 5.0 للكرت وأوّل منفذ M.2:[/green] من المعالج، ومنفذان آخران بالجيل الرابع من الشيبست.

[green]ستّة منافذ SATA:[/green] أكثر من معظم اللوحات الصغيرة — لمن يجمع أقراصاً كثيرة.

[green]واي‑فاي 7 وبلوتوث 5.4:[/green] مع شبكةٍ سلكيّة Realtek بسرعة 2.5 جيجابت، ومنفذ Type-C خلفيّ بسرعة 20 جيجابت يحمل صورة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ثلاثة منافذ M.2 — حجم اللوحة لا يتّسع لأكثر.
* فتحتا التوسعة السفليّتان تعملان x1 فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا Thunderbolt 4 مدمجاً في اللوحة الخلفيّة.

${alt('Z890_EAGLE', 'لوحة Z890 بحجم ATX كامل وأربعة منافذ M.2، إن كان الكيس يتّسع لها.')}
https://www.asus.com/motherboards-components/motherboards/prime/prime-z890m-plus-wifi/techspec/`),

  board('Gigabyte', 'B860M Gaming WiFi6', 10, 2,
    { socket: 'LGA1851', chipset: 'B860', formFactor: 'Micro-ATX', maxRam: '128GB', memorySpeed: '9066 MT/s (OC)', m2Slots: '2', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 6', lan: '2.5GbE' },
    [A('B0F5NVPVRV'), M('gigabyte-b860m-gaming-wifi6-lga-1851-m-atx-motherboard-intel-b860-chipset-2x-dimm-ddr5-slots-up-to-128gb-max-memory-1x-pcie-5-0-x16-2x-m-2-slots-wifi-6-bt-5-3-b860m-gaming-wifi6')],
    `### Gigabyte B860M Gaming WiFi6

لوحة B860 اقتصاديّة صغيرة (Micro-ATX) لمعالجات Core Ultra 200S، بفتحتَي ذاكرة وواي‑فاي 6.

**التقنيات الأساسية المدعومة:**

[green]PCIe 5.0 للكرت وأوّل منفذ M.2:[/green] من المعالج، ومنفذٌ ثانٍ بالجيل الرابع من الشيبست.

[green]مراحل طاقة 8+1+2:[/green] كافية لمعالجات Core Ultra 5 و7 غير K.

[green]شبكة Realtek بسرعة 2.5 جيجابت وواي‑فاي 6:[/green] مع بلوتوث 5.3.

[green]أربعة منافذ SATA:[/green] للأقراص التقليديّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا ذاكرة فقط وحدٌّ أقصى 128 جيجابايت.
* الواي‑فاي على النطاقين 2.4 و5 جيجاهرتز فقط — بلا نطاق 6 جيجاهرتز.
* المنافذ الخلفيّة محدودة: ثلاثة بسرعة 5 جيجابت وثلاثة USB 2.0.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كسر سرعة للمعالج — شيبست B860.

${alt('B860M_GPLUS', 'أربع فتحات ذاكرة وواي‑فاي 7 وثلاثة منافذ M.2 في لوحة B860 صغيرة.')}
https://www.gigabyte.com/Motherboard/B860M-GAMING-WIFI6/sp`),

  board('ASUS', 'ROG Strix B860-F Gaming WiFi', 10, 4,
    { socket: 'LGA1851', chipset: 'B860', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '9066 MT/s (OC)', m2Slots: '4', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE' },
    [C('asus-rog-strix-b860-f-gaming-wifi-lga1851-motherboard-46974'), A('B0DPMR5NRR')],
    `### ASUS ROG Strix B860-F Gaming WiFi

لوحة B860 من فئة ROG Strix لمعالجات Core Ultra 200S: أربعة منافذ M.2، ومنفذ Thunderbolt 4، وواي‑فاي 7.

**التقنيات الأساسية المدعومة:**

[green]منفذ Thunderbolt 4 خلفيّ:[/green] Type-C يحمل صورةً وبيانات — نادرٌ في لوحات B860.

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج، والثلاثة الباقية بالجيل الرابع، مع أربعة منافذ SATA.

[green]واي‑فاي 7 وشبكة Intel بسرعة 2.5 جيجابت:[/green] مثبّتان في اللوحة.

[green]DDR5 حتى 256 جيجابايت:[/green] أربع فتحات بسرعة تصل إلى 9066 MT/s كسر سرعة، مع دعم ذاكرة CUDIMM.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 الرابع يُعطّل فتحة PCIe 4.0 السفليّة حين يُستعمل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كسر سرعة للمعالج — شيبست B860؛ معالجات K تعمل بسرعتها الأصليّة.

${alt('Z890_EAGLE', 'شيبست Z890 يتيح كسر سرعة معالجات K، بسعرٍ أقلّ عادةً.')}
https://rog.asus.com/motherboards/rog-strix/rog-strix-b860-f-gaming-wifi/spec/`),

  // ================================================================ المزوّدات
  {
    categoryId: PSU, brand: 'MSI', name: 'MPG A1000GS PCIe 5', tdpWattage: 0, performanceTier: 5,
    specs: { wattage: '1000', rating: '80+ Gold', modularity: 'Full', formFactor: 'ATX 3.1', color: 'Black', qualityTier: 'A' },
    offers: [A('B0BZNQ38Y9'), M('msi-mpg-a1000gs-pcie5-fully-modular-power-supply-1000w-power-80-plus-gold-efficiency-135mm-fluid-dynamic-bearing-type-active-pfc-zero-fan-mode-black-306-7zpfy18-ce0')],
    description: `### MSI MPG A1000GS PCIe 5

مزوّد 1000 واط بشهادة 80+ Gold وتصميمٍ قصير (150 مم)، بكابلَي 16 سنّاً — جاهزٌ لكروت RTX 5090 و5080 دون محوّلات.

**التقنيات الأساسية المدعومة:**

[green]كابلان PCIe 5.1 بـ16 سنّاً (600 واط لكلٍّ منهما):[/green] لكرتٍ واحد بأيّ قدرة، أو لترقيةٍ لاحقة.

[green]معيار ATX 3.1:[/green] يتحمّل قفزات الاستهلاك اللحظيّة حتى 235% من قدرته.

[green]كابلات منفصلة بالكامل (Full Modular):[/green] تركّب ما تحتاجه فقط.

[green]مروحة 135 مم بمحمل FDB:[/green] مع وضعٍ يوقف المروحة تحت الحمل الخفيف.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* كابل PCIe واحد فقط من نوع 6+2 — الكروت القديمة بثلاثة موصلات 8 سنون تحتاج محوّلاً.
* ثمانية منافذ SATA — تكفي معظم الأجهزة لا أكثرها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس بشهادة Platinum — كفاءةٌ أقلّ قليلاً من الفئة الأعلى.

${alt('GF3_1000', 'درجة جودةٍ أعلى (A+) في تقييم SPL للقدرة نفسها.')}
https://www.msi.com/Power-Supply/MPG-A1000GS-PCIE5/Specification`,
  },
  {
    categoryId: PSU, brand: 'ASUS', name: 'ROG Thor 1000P2', tdpWattage: 0, performanceTier: 5,
    specs: { wattage: '1000', rating: '80+ Platinum', modularity: 'Full', formFactor: 'ATX', color: 'Black', qualityTier: 'A' },
    offers: [A('B0BTJ5BZKR'), M('asus-rog-thor-1000p2-gaming-1000w-oled-power-supply-unit-80-plus-platinum-ii-aura-sync-atx12v-0db-cooling-100-240vac-input-range-dual-ball-fan-bearings-90ye00l1-b0na00'), C('asus-rog-thor-1000p2-1000w-platinum-ii-psu-20145')],
    description: `### ASUS ROG Thor 1000P2

مزوّد 1000 واط بشهادة 80+ Platinum وشاشة OLED تعرض الاستهلاك لحظةً بلحظة — للأجهزة الفاخرة المكشوفة من الجانب.

**التقنيات الأساسية المدعومة:**

[green]80+ Platinum:[/green] كفاءةٌ أعلى من Gold، أي حرارةٌ وفاقدٌ أقلّ.

[green]شاشة OLED وإضاءة Aura Sync:[/green] تعرض الواط المسحوب، وتتزامن إضاءتها مع اللوحة.

[green]كابل 16 سنّاً وثمانية كابلات 6+2:[/green] للكروت الحديثة والقديمة معاً، مع 12 منفذ SATA.

[green]تصنيف ضوضاء Cybenetics A++:[/green] وزرٌّ يوقف المروحة تحت الحمل الخفيف.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* طوله 190 مم — أطول من المعتاد، فتأكّد من مساحة الكيس.
* سعره للشاشة والإضاءة أكثر منه للكهرباء: مزوّداتٌ بجودةٍ مماثلة أرخص.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* كابل 16 سنّاً واحد فقط.

${alt('RM1000X_SHIFT', 'درجة جودةٍ أعلى (A+) بسعرٍ أقلّ عادةً، دون الشاشة والإضاءة.')}
https://rog.asus.com/power-supply-units/rog-thor/rog-thor-1000p2-gaming-model/spec/`,
  },

  // ================================================================ الصناديق
  {
    categoryId: CASE, brand: 'Lian Li', name: 'LANCOOL 207 Digital', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '375', maxCoolerHeight: '180', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '2x 140mm + 2x 120mm', color: 'Black', screen: '6" 720×1600' },
    offers: [C('lian-li-lancool-207-digital-case-black-41819'), M('lian-li-lancool-207-digital-mid-tower-6-700-x-1600-60hz-display-pre-installed-2x-140mm-2x-120mm-fans-up-to-360mm-radiator-8x-fan-support-steel-4-0mm-tempered-glass-black-lan207dx')],
    description: `### Lian Li LANCOOL 207 Digital

كيس متوسّط بواجهةٍ شبكيّة وأربع مراوح مركّبة، وشاشة 6 بوصات تعرض حرارة القطع أو صورةً من اختيارك.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح مركّبة:[/green] اثنتان 140 مم في الواجهة، واثنتان 120 مم فوق غطاء المزوّد تدفعان الهواء إلى الكرت.

[green]شاشة 6 بوصات بدقّة 720×1600:[/green] بسطوع 500 شمعة.

[green]رادييتر 360 مم في السقف:[/green] ومبرّد هواء حتى 180 مم.

[green]كرت حتى 375 مم:[/green] يتّسع لمعظم الكروت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الرادييتر في السقف فقط — لا مكان لرادييتر في الواجهة.
* المزوّد في الأمام تحت الغطاء: طوله يجب ألّا يتجاوز 160 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات E-ATX (أقصى عرض 244 مم).

${alt('LANCOOL_216', 'مراوح 160 مم أكبر في الواجهة ورادييتر 360 مم في الأمام، دون الشاشة.')}
https://lian-li.com/product/lancool-207-digital/`,
  },
  {
    categoryId: CASE, brand: 'Lian Li', name: 'Vector V100R', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '420', maxCoolerHeight: '178', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '4x 120mm ARGB', color: 'Black' },
    offers: [C('lian-li-vector-v100-argb-e-atx-mid-tower-case-black-49665'), A('B0F2T66QC9'), M('lian-li-vector-v100-mid-tower-computer-case-4x-120mm-pre-installed-fan-up-to-360mm-radiator-7x-120mm-fan-support-4mm-tempered-glass-steel-plastic-materials-black-v100rx')],
    description: `### Lian Li Vector V100R

كيس متوسّط زجاجيّ الواجهة بأربع مراوح ARGB مركّبة، ويقبل لوحات الموصلات الخلفيّة (Back-Connect) — من أرخص طرق الدخول إلى Lian Li.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح 120 مم ARGB:[/green] ثلاثٌ في الجانب وواحدة في الخلف.

[green]كرت حتى 420 مم:[/green] يتّسع لأطول الكروت الحاليّة.

[green]لوحات Back-Connect:[/green] بموصلاتٍ خلف اللوحة لمظهرٍ بلا كابلات (ATX وMicro-ATX).

[green]رادييتر 360 مم في السقف:[/green] ومبرّد هواء حتى 178 مم.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الرادييتر في السقف فقط.
* مكان قرصٍ واحد من كلّ نوع: 2.5 بوصة وآخر 3.5 بوصة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* الواجهة زجاجيّة لا شبكيّة — الهواء يدخل من الجانب والأسفل فقط.

${alt('D4000_AIRFLOW', 'واجهة شبكيّة تقليديّة لتدفّق هواءٍ أمامي مباشر.')}
https://lian-li.com/product/vector-v100/`,
  },
  {
    categoryId: CASE, brand: 'NZXT', name: 'H7 Flow RGB', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '410', maxCoolerHeight: '185', radiatorSupport: '420mm', psuFormFactor: 'ATX', includedFans: '3x 120mm RGB', color: 'Black' },
    offers: [A('B0CV4RRBNJ'), M('nzxt-h7-flow-rgb-mid-tower-atx-airflow-computer-case-3x-rgb-core-pre-installed-fans-up-to-420mm-radiator-10x-fans-support-sgcc-steel-material-dark-tinted-tempered-glass-black-cm-h72fb-r1'), C('nzxt-h7-flow-rgb-edition-atx-mid-tower-2024-black-21728')],
    description: `### NZXT H7 Flow RGB

إصدار 2024 من كيس NZXT المتوسّط الشبكيّ: المزوّد واقفٌ بجانب اللوحة، فيتّسع الأسفل لثلاث مراوح تدفع الهواء إلى الكرت مباشرة.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح سفليّة اختياريّة:[/green] تبريدٌ مباشرٌ للكرت دون توسيع الكيس.

[green]رادييتر 420 مم في الواجهة و360 مم في السقف:[/green] لأكبر أحجام التبريد المائيّ.

[green]كرت حتى 410 مم ومبرّد هواء حتى 185 مم:[/green] يتّسع لمعظم القطع.

[green]مروحة F360 RGB Core مركّبة:[/green] ثلاث مراوح 120 مم في إطارٍ واحد بكابلٍ واحد، في الواجهة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المراوح المرفقة بثلاثة أسنان (DC) لا PWM — تحكّمٌ أقلّ دقّة في سرعتها.
* لا مروحة خلفيّة مرفقة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات Back-Connect.

${alt('LANCOOL_III', 'أربع مراوح 140 مم ARGB مركّبة ولوح زجاجيّ يُفتح كالباب.')}
https://nzxt.com/products/h7-flow-rgb`,
  },
  {
    categoryId: CASE, brand: 'HYTE', name: 'Y40 Black Cherry', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '422', maxCoolerHeight: '183', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '2x 120mm', color: 'Black/Red', verticalGpu: 'PCIe 4.0 Riser' },
    offers: [C('hyte-y40-atx-mid-tower-case-black-red-23132'), M('hyte-y40-modern-aesthetic-panoramic-mid-tower-atx-gaming-pc-case-tempered-glass-design-up-to-360mm-radiator-7x-120mm-fans-support-vertical-gpu-support-usb-type-c-black-red-cs-hyte-y40-br')],
    description: `### HYTE Y40 Black Cherry

كيس بانوراميّ بزجاجٍ في الواجهة والجانب، والكرت فيه عموديّ بكابل PCIe 4.0 مرفق — بلونٍ أسود بلمساتٍ حمراء.

**التقنيات الأساسية المدعومة:**

[green]تركيب الكرت عمودياً:[/green] بكابل PCIe 4.0 x16 مرفق، والكرت حتى 422 مم وبسماكة أربع فتحات.

[green]رادييتر 360 مم في السقف و280 مم في الجانب:[/green] لتبريدٍ مائيٍّ مزدوج.

[green]مبرّد هواء حتى 183 مم:[/green] يتّسع لمعظم مبرّدات البرج.

[green]مروحتان 120 مم مرفقتان:[/green] واحدة في الأرضيّة تدفع الهواء إلى الكرت، وواحدة في الخلف.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مروحتان فقط — جهازٌ قويّ يحتاج مراوح إضافيّة في الجانب.
* مكان قرصٍ واحد 3.5 بوصة أو قرصين 2.5 بوصة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة مدمجة ولا تهوية أماميّة — الواجهة زجاج.

${alt('Y60', 'الكيس الأكبر من HYTE بثلاث مراوح مركّبة والفكرة البانوراميّة نفسها.')}
https://hyte.com/store/y40/cs-hyte-y40-br`,
  },
  {
    categoryId: CASE, brand: 'Lian Li', name: 'O11 Vision-M', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Micro-ATX Tower', maxGpuLength: '410', maxCoolerHeight: '162', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '1x 140mm', color: 'Black', dualChamber: 'Yes' },
    offers: [C('lian-li-o11-vision-m-matx-case-black-49715'), A('B0GLP7LRHM')],
    description: `### Lian Li O11 Vision-M

النسخة الصغيرة (Micro-ATX) من O11 Vision: زجاجٌ في ثلاث جهات بلا أعمدة في الزاوية، وحجرتان منفصلتان للقطع والمزوّد.

**التقنيات الأساسية المدعومة:**

[green]زجاج بانوراميّ بلا عمود زاوية:[/green] الواجهة والجانب والسقف قطعةٌ واحدة المنظر.

[green]كرت حتى 410 مم:[/green] رغم صِغَر الكيس.

[green]رادييتر 360 مم في السقف:[/green] ومراوح حتى ثلاث في الأسفل لتبريد الكرت.

[green]حجرة خلفيّة للمزوّد والكابلات:[/green] مع مروحة 140 مم مركّبة فيها.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هواء حتى 162 مم — مبرّدات البرج الكبيرة لا تدخل.
* مروحة واحدة مرفقة فقط، في الحجرة الخلفيّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات ATX — Micro-ATX وMini-ITX فقط.

${alt('VISION_COMPACT', 'الفكرة البانوراميّة نفسها بحجمٍ يقبل لوحات ATX.')}
https://lian-li.com/product/o11-vision-m/`,
  },
  {
    categoryId: CASE, brand: 'Corsair', name: 'iCUE 5000X RGB White', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '400', maxCoolerHeight: '170', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '3x 120mm RGB', color: 'White', verticalGpu: 'Bracket Ready' },
    offers: [C('crs-5000d'), A('B08M4BN431')],
    description: `### Corsair iCUE 5000X RGB White

كيس متوسّط بزجاجٍ في أربع جهات، وثلاث مراوح SP120 RGB ELITE مركّبة مع وحدة تحكّم بالإضاءة — بلونٍ أبيض.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح RGB مركّبة:[/green] مع وحدة iCUE Lighting Node CORE وموزّع PWM يتحكّم بستّ مراوح.

[green]ثلاثة أماكن لرادييتر 360 مم:[/green] الواجهة والجانب والسقف — يتّسع لرادييتريْن معاً.

[green]كرت حتى 400 مم:[/green] ومزوّد حتى 250 مم.

[green]نظام RapidRoute للكابلات:[/green] قناةٌ خلف اللوحة تجمع الكابلات بسهولة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الواجهة زجاجيّة — تدفّق هواءٍ أقلّ من نسخة Airflow الشبكيّة.
* مبرّد هواء حتى 170 مم فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* تركيب الكرت عمودياً يحتاج كابل PCIe يُشترى منفصلاً.

${alt('D5000_AIRFLOW', 'الهيكل نفسه بواجهة شبكيّة لتهويةٍ أفضل.')}
https://www.corsair.com/us/en/p/pc-cases/cc-9011213-ww/icue-5000x-rgb-tempered-glass-mid-tower-atx-pc-case-white-cc-9011213-ww`,
  },

  // ================================================================ المبرّدات
  {
    categoryId: COOL, brand: 'MSI', name: 'MAG CoreLiquid E360 White', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'White' },
    offers: [C('msi-mag-coreliquid-e360-cpu-liquid-cooler-white-21849'), M('msi-mag-coreliquid-e360-liquid-cpu-cooler-360mm-radiator-3x-fans-included-75-04-cfm-fan-airflow-3000-rpm-pump-speed-fluid-dynamic-bearing-white-306-7zw6e27-c24')],
    description: `### MSI MAG CoreLiquid E360 White

مبرّد مائيّ 360 مم أبيض بثلاث مراوح ARGB ورأسٍ يدور 270 درجة ليستقيم شعاره في أيّ اتجاه.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 360 مم بثلاث مراوح 120 مم:[/green] تكفي معالجات Core i7 وRyzen 7 تحت الحمل الطويل.

[green]مراوح FDB حتى 75 CFM:[/green] بمحامل هادئة وعمرٍ مقدّر 50 ألف ساعة.

[green]إضاءة ARGB:[/green] في الرأس والمراوح، تُضبط من MSI Center أو اللوحة.

[green]رادييتر رفيع (27 مم):[/green] أسهل تركيباً في السقف فوق الذاكرة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الرادييتر الرفيع يبرّد أقلّ من رادييترات 30 مم+ في المبرّدات الأغلى.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة في الرأس.

${alt('LE360_WHITE', 'مبرّد 360 مم أبيض آخر بسعرٍ أقلّ عادةً.')}
https://www.msi.com/Liquid-Cooling/MAG-CORELIQUID-E360/Specification`,
  },
  {
    categoryId: COOL, brand: 'Fractal Design', name: 'Radius 240 RGB', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'AIO', sizeMm: '240', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', fanCount: '2', fanSize: '120mm', rgb: 'Yes', color: 'Black' },
    offers: [A('B0G2SVSQKW'), M('fractal-radius-240-rgb-aio-liquid-cpu-cooler-240mm-radiator-2x-dynamic-3-12-rgb-fans-2200-rpm-63-9-cfm-airflow-2-1-mmh2o-static-pressure-31-9-dba-noise-level-black-fd-w-ra1-2402')],
    description: `### Fractal Design Radius 240 RGB

مبرّد مائيّ 240 مم من Fractal بمراوح Dynamic 3 RGB، وكابلاتٍ مدمجة في الأنابيب تقلّل الفوضى.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 240 مم بمروحتين 120 مم:[/green] لمعالجات Core i5 وRyzen 5 و7 الحاليّة.

[green]كابلات مدمجة في الأنابيب:[/green] وصلةٌ واحدة إلى اللوحة بدل كابلات المضخّة والمراوح.

[green]مضخّة بمحمل سيراميك (3400 دورة):[/green] بضوضاء 17.6 ديسيبل.

[green]ضمان خمس سنوات:[/green] وحامل AM5 مركّبٌ مسبقاً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 240 مم لا تكفي معالجات i9 وRyzen 9 تحت الحمل الطويل.
* ضبط الإضاءة عبر تطبيق ويب (Adjust Pro) لا برنامج اللوحة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة في الرأس.

${alt('KRAKEN_CORE_360', 'رادييتر 360 مم بسعرٍ قريب لمعالجاتٍ أسخن.')}
https://www.fractal-design.com/products/water-cooling/radius-series/radius-240/radius-240-rgb-black/`,
  },
];

/* عرض كازاسوق للـA1000GS مربوطٌ بصفّ A1000G — يُنقل إلى صفّه بعد إنشائه */
const MOVE = [{ url: 'https://www.cazasouq.com/msi-mpg-a1000gs-pcie5-1000w-80-plus-gold-modular-psu-34438?search=MPG%20A1000G%20PCIe%205', to: 'MPG A1000GS PCIe 5', cleanUrl: 'https://www.cazasouq.com/msi-mpg-a1000gs-pcie5-1000w-80-plus-gold-modular-psu-34438' }];

// ---------------------------------------------------------------- التنفيذ

const stores = Object.fromEntries(
  (await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]),
);

let blocked = false;
const bad = (m) => { console.log(`    ⛔ ${m}`); blocked = true; };
for (const p of PARTS) {
  console.log(`\n=== ${p.brand} ${p.name}  (t${p.performanceTier})`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  const dup = await prisma.component.findFirst({ where: { name: { equals: p.name, mode: 'insensitive' }, brand: p.brand } });
  if (dup) bad(`موجودة: ${dup.id}`);
  if (/\*\*\[(yellow|red)\]/.test(p.description)) bad('نجومٌ حول وسمٍ ملوّن');
  if (!/^https:\/\/\S+$/.test(p.description.trim().split('\n').pop())) bad('آخر سطرٍ ليس رابط الصانع');
  const live = p.offers.length;
  if (live < 2) bad('أقلّ من متجرين');
  for (const o of p.offers) {
    if (!stores[o.store]) { bad(`لا متجر «${o.store}»`); continue; }
    const taken = await prisma.componentOffer.findFirst({ where: { url: o.url }, select: { component: { select: { name: true } } } });
    if (taken) bad(`رابط ${o.store} مستعمل في: ${taken.component.name}`);
    else console.log(`    ✔ ${o.store}`);
  }
}
for (const [name, id] of Object.values(ALT)) {
  const c = await prisma.component.findUnique({ where: { id }, select: { brand: true, name: true } });
  if (!c) bad(`البديل ${name} (${id}) لا يشير إلى قطعة`);
  else if (`${c.brand} ${c.name}` !== name) bad(`البديل ${id} اسمه «${c.brand} ${c.name}» لا «${name}»`);
}
for (const m of MOVE) {
  const o = await prisma.componentOffer.findFirst({ where: { url: m.url }, include: { component: { select: { name: true } } } });
  if (!o) bad(`عرض النقل غير موجود: ${m.url}`);
  else console.log(`\n↪ سيُنقل عرض كازاسوق من «${o.component.name}» إلى «${m.to}»`);
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log(`\n${PARTS.length} قطعة — (عرضٌ فقط — أضف --apply)`); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const moved = await prisma.componentOffer.findMany({ where: { url: { in: MOVE.map((m) => m.url) } } });
writeFileSync(`backups/added-batch2-${stamp}.json`, JSON.stringify({ PARTS, movedOffersBefore: moved }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch2-${stamp}.json`);

const ids = {};
for (const p of PARTS) {
  const { offers, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  for (const o of offers) {
    await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: true } });
  }
  ids[p.name] = c.id;
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}
for (const m of MOVE) {
  const o = moved.find((x) => x.url === m.url);
  await prisma.componentOffer.update({ where: { id: o.id }, data: { componentId: ids[m.to], url: m.cleanUrl, inStock: true } });
  console.log(`↪ نُقل عرض كازاسوق إلى ${m.to}`);
}

console.log(`\nالتالي (واحدةً واحدة):\n  ${Object.values(ids).join(' ')}`);
await prisma.$disconnect();
