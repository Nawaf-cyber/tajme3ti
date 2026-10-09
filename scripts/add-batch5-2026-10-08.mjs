/**
 * ============ الدفعة الخامسة من «القطع الناقصة» — ٢٤ قطعة — 2026-10-08 ============
 *
 * طلب نوّاف: «كمل ضيف دفعة خامسة». القاعدة: متجران حيّان على الأقلّ، بلا تكرار.
 *
 * المصدر: بقيّة مسح كازاسوق (الدفعة الثالثة) — لوحات Gigabyte ICE البيضاء وZ890،
 * ومبرّداتٌ من ASUS وCorsair وMSI وDeepCool، وكيسان من GAMDIAS — ثمّ أمازون ومايكرولس.
 * كلّ صفحة متجرٍ قُرئت 2026-10-08، والمواصفات من صفحة الصانع في آخر الوصف.
 *
 * لُبسٌ حُسم بالـEAN:
 *   · Mystique 240 في كازاسوق نسختان: ARGB (6933412728870) وبلا ARGB (6933412728771)،
 *     ولكلٍّ نظيرها في مايكرولس (R-LX550-BKADSNC / R-LX550-BKDSNC) — فأُضيفتا صفّين.
 *   · Titan 240 RX LCD في أمازون CW-9061022-WW = الأسود.
 *   · LC III 360 الأبيض في كازاسوق بلا شاشة (ARGB White) = أمازون B0CTCTP2WV؛ ونسخة LCD
 *     البيضاء في مايكرولس لم تُحتسب.
 * ✕ لم يُضف: GAMDIAS Boreas E1-410/E2-410 WH — صفحة الصانع بلا ارتفاعٍ ولا TDP؛
 *   DeepCool LM240 (كازاسوق أسود ومايكرولس أبيض)؛ DeepCool LE720 (مايكرولس نافد)؛
 *   TUF Z890-Pro WiFi (أمازون بلا سعر).
 * ↪ عرض مايكرولس لـZ890M ICE كان على صفّ «Z890 AORUS Elite WiFi7» الأسود خطأً — يُنقل إلى صفّه.
 * ➕ عرض مايكرولس للأبيض ROG Ryujin III Extreme White (أُضيف في الدفعة الرابعة) — صار ٣ متاجر.
 *
 *   node scripts/add-batch5-2026-10-08.mjs           # عرض
 *   node scripts/add-batch5-2026-10-08.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const MB = 'cmpfziqe70001x4ym928tt3o2';
const CASE = 'cmpfziquj0006x4ym53f0ehcw';
const COOL = 'cmszm2ym00000swymvd5s2yxm';

const C = (slug) => ({ store: 'cazasouq', url: `https://www.cazasouq.com/${slug}` });
const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });
const M = (slug) => ({ store: 'microless', url: `https://saudi.microless.com/product/${slug}/` });

const ALT = {
  Z890_ELITE: ['Gigabyte Z890 AORUS Elite WiFi7', 'cmr2k5vs40005jgymmq0eke3e'],
  Z890M_PLUS: ['ASUS Prime Z890M-Plus WiFi', 'cmuzoq1c6000nnoym2fpnwl5k'],
  X870_ELITE: ['Gigabyte X870 AORUS Elite WiFi7', 'cmpiec6p9003400ymwohd55y3'],
  X870_STEALTH: ['Gigabyte X870 AORUS Stealth', 'cmuzsa1030010u8ymfdbahimi'],
  Z890_CARBON: ['MSI MPG Z890 Carbon WiFi', 'cmuzs9ytc000cu8ymv57td6r6'],
  PRO_Z890A: ['MSI PRO Z890-A WiFi', 'cmuzs9yft0009u8ymvn1y50lx'],
  X870E_E: ['ASUS ROG Strix X870E-E Gaming WiFi', 'cmpiec8zy003c00ymdvvn2eez'],
  Z890_UD: ['Gigabyte Z890 UD WiFi6E', 'cmuzs9zm6000lu8ym46h4fsch'],
  B850M_FORCE: ['Gigabyte B850M Force WiFi6E', 'cmuzopzjj0003noym9ol7qnq3'],
  KRAKEN_ELITE_360: ['NZXT Kraken Elite 360 RGB', 'cmuztry3w001hkcym6asxo80e'],
  KRAKEN_ELITE_240: ['NZXT Kraken Elite 240', 'cmuztryn1001nkcymj5jmbgw7'],
  LE360_W: ['DeepCool LE360 V2 White', 'cmszmclxq000azsymfdlrfubz'],
  LE360: ['DeepCool LE360 V2', 'cmszmclr60008zsym20d7ig0m'],
  LE240: ['DeepCool LE240 V2', 'cmszmcldq0004zsymj2u94h5v'],
  E240_W: ['MSI MAG CoreLiquid E240 White', 'cmuztrxv8001ekcymz8jpbyli'],
  E360_W: ['MSI MAG CoreLiquid E360 White', 'cmuzoq4n5001nnoym0neok3vd'],
  DVP_360_W: ['Thermalright Dynamic Vision PRO 360 ARGB White', 'cmu3md8pd0007f8ymswhsvfyf'],
  MYSTIQUE_360: ['DeepCool Mystique 360 ARGB', 'cmszn26380006w8ymwcp1pmyx'],
  ATLAS_E1_W: ['Gamdias Atlas E1 White', 'cmuzsa4jr0023u8ymny8w9y4k'],
  AIR903_BASE: ['Montech AIR 903 BASE White', 'cmtcr2gtk000oo8ym3gsqyofc'],
};
const alt = (k, why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n* ${why}`;

const board = (brand, name, tdpWattage, performanceTier, specs, offers, description) =>
  ({ categoryId: MB, brand, name, tdpWattage, performanceTier, specs: { ramType: 'DDR5', ...specs }, offers, description });

const SOCKETS_ALL = 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X';

/* عرض مايكرولس لـZ890M ICE كان مربوطاً خطأً بصفّ «Z890 AORUS Elite WiFi7» الأسود
   (اكتشفه فحص التكرار) — يُنقل إلى صفّه الصحيح بعد إنشائه */
const MOVE = [{ offerId: 'cmsgejowo003zpsymoncnkdg3', from: 'cmr2k5vs40005jgymmq0eke3e', to: 'Z890M AORUS Elite WiFi7 ICE', urlHas: 'z890m-aorus-elite-wifi7-ice' }];

/* عروضٌ تُضاف لقطعٍ موجودة */
const EXTRA = [
  { id: 'cmuztrxm0001bkcymjsfgnz4n', name: 'ROG Ryujin III 360 ARGB Extreme White', offer: M('asus-rog-ryujin-iii-360-argb-extreme-liquid-cpu-cooler-360mm-radiator-120mm-rog-magnetic-daisy-chainable-fan-89-73-cfm-airflow-2800-rpm-speed-3-5-lcd-display-white-90rc0132-m0eay0') },
];

const PARTS = [
  // ================================================================ لوحات Intel
  board('Gigabyte', 'Z890 AORUS Elite X ICE', 15, 5,
    { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '9500 MT/s (OC)', m2Slots: '5', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE', color: 'White' },
    [C('gigabyte-z890-a-elite-x-ice-motherboard-white-30760'), A('B0DKFRFJP4'), M('gigabyte-z890-aorus-elite-x-ice-lga-1851-atx-motherboard-intel-z890-chipset-4x-ddr5-dimm-slots-up-to-256gb-max-memory-wi-fi-7-bt-5-4-1x-pcie-5-0-x16-5x-m-2-slots-white-z890-a-elite-x-ice')],
    `### Gigabyte Z890 AORUS Elite X ICE

لوحة Z890 بيضاء بالكامل من سلسلة AORUS Elite بنسختها «X»: خمسة منافذ M.2، وThunderbolt 4، وذاكرة حتى 9500 MT/s.

**التقنيات الأساسية المدعومة:**

[green]خمسة منافذ M.2:[/green] الأوّل بالجيل الخامس، واثنان من المعالج والشيبست بالجيل الرابع — مع أربعة منافذ SATA.

[green]منفذ Thunderbolt 4 (USB4):[/green] Type-C بسرعة 40 جيجابت يحمل صورة.

[green]DDR5 حتى 9500 MT/s كسر سرعة:[/green] أربع فتحات حتى 256 جيجابايت.

[green]واي‑فاي 7 وشبكة 2.5 جيجابت:[/green] مع لوحةٍ بيضاء بالكامل لجهازٍ أبيض.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* شبكة سلكيّة 2.5 جيجابت فقط في لوحةٍ من هذا السعر.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعرها للون والمنافذ — لا تزيد فريمات الألعاب على لوحة Z890 أرخص.

${alt('Z890_ELITE', 'النسخة السوداء الأرخص بأربعة منافذ M.2 وواي‑فاي 7.')}
https://www.gigabyte.com/Motherboard/Z890-AORUS-ELITE-X-ICE/sp`),

  board('Gigabyte', 'Z890 AORUS Elite WiFi7 ICE', 15, 4,
    { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '9200 MT/s (OC)', m2Slots: '4', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE', color: 'White' },
    [C('gigabyte-z890-a-elite-wf7-ice-motherboard-white-30752'), A('B0DJP7NRXX'), M('gigabyte-z890-aorus-elite-wi-fi-7-ice-lga-1851-atx-motherboard-intel-z890-chipset-4x-ddr5-dimm-slot-up-to-256gb-max-memory-wi-fi7-bt5-4-pcie-5-0-x16-4x-m-2-slot-white-z890-a-elite-wf7-ice')],
    `### Gigabyte Z890 AORUS Elite WiFi7 ICE

النسخة البيضاء من لوحة Z890 AORUS Elite: أربعة منافذ M.2، وThunderbolt 4، وواي‑فاي 7.

**التقنيات الأساسية المدعومة:**

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج، مع أربعة منافذ SATA.

[green]منفذ Thunderbolt 4 (USB4):[/green] Type-C بسرعة 40 جيجابت يحمل صورة.

[green]DDR5 حتى 9200 MT/s كسر سرعة:[/green] أربع فتحات حتى 256 جيجابايت.

[green]واي‑فاي 7 وشبكة 2.5 جيجابت:[/green] ولوحةٌ بيضاء بالكامل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* شبكة سلكيّة 2.5 جيجابت فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* اللون الأبيض يرفع السعر دون أيّ فرقٍ في الأداء.

${alt('Z890_ELITE', 'اللوحة نفسها بالأسود بسعرٍ أقلّ عادةً.')}
https://www.gigabyte.com/Motherboard/Z890-AORUS-ELITE-WIFI7-ICE/sp`),

  board('Gigabyte', 'Z890M AORUS Elite WiFi7 ICE', 15, 4,
    { socket: 'LGA1851', chipset: 'Z890', formFactor: 'Micro-ATX', maxRam: '256GB', memorySpeed: '9200 MT/s (OC)', m2Slots: '3', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE', color: 'White' },
    [C('gigabyte-z890m-a-elite-wf7-ice-motherboard-white-30788'), A('B0DJP8Q6JK')],
    `### Gigabyte Z890M AORUS Elite WiFi7 ICE

لوحة Z890 صغيرة (Micro-ATX) بيضاء بالكامل — لجهازٍ أبيض صغير بمعالج K قابلٍ لكسر السرعة.

**التقنيات الأساسية المدعومة:**

[green]شيبست Z890 في حجمٍ صغير:[/green] كسر سرعة المعالج والذاكرة.

[green]ثلاثة منافذ M.2:[/green] الأوّل بالجيل الخامس، مع أربعة منافذ SATA.

[green]منفذ USB4:[/green] بسرعة 40 جيجابت يحمل صورة.

[green]واي‑فاي 7 وشبكة 2.5 جيجابت:[/green] وأربع فتحات DDR5 حتى 9200 MT/s.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ثلاثة منافذ M.2 بسبب صغر الحجم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تناسب الأكياس الكبيرة إن أردت ملء الفراغ — مقاسها Micro-ATX.

${alt('Z890M_PLUS', 'لوحة Z890 صغيرة بسعرٍ أقلّ عادةً، بستّة منافذ SATA.')}
https://www.gigabyte.com/Motherboard/Z890M-AORUS-ELITE-WIFI7-ICE/sp`),

  board('Gigabyte', 'Z890 AORUS Elite Duo X', 15, 4,
    { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '10266+ MT/s (OC)', m2Slots: '5', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '5GbE' },
    [C('gigabyte-z890-aorus-elite-duo-x-motherboard-47696'), A('B0GYD24MFG')],
    `### Gigabyte Z890 AORUS Elite Duo X

لوحة Z890 بفتحتَي ذاكرة فقط مصمّمة لأعلى سرعات DDR5 — ومع ذلك تقبل 256 جيجابايت بذاكرة CQDIMM رباعيّة الصفوف.

**التقنيات الأساسية المدعومة:**

[green]DDR5 حتى 10266+ MT/s كسر سرعة:[/green] فتحتان فقط تعنيان مساراً أقصر وسرعةً أعلى.

[green]حتى 256 جيجابايت بذاكرة CQDIMM:[/green] وحدات رباعيّة الصفوف عالية السعة.

[green]خمسة منافذ M.2:[/green] الأوّل بالجيل الخامس، مع أربعة منافذ SATA.

[green]شبكة 5 جيجابت وواي‑فاي 7 (Intel BE200) ومنفذ USB4:[/green] وصوت Realtek ALC1220.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا ذاكرة: الوصول إلى 128 جيجابايت فما فوق يحتاج وحداتٍ كبيرة غالية.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تُضاف ذاكرةٌ لاحقاً دون استبدال الطقم.

${alt('Z890_ELITE', 'أربع فتحات ذاكرة للترقية التدريجيّة بسعرٍ قريب.')}
https://www.gigabyte.com/Motherboard/Z890-AORUS-ELITE-DUO-X/sp`),

  board('MSI', 'MEG Z890 ACE', 20, 5,
    { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '9200 MT/s (OC)', m2Slots: '5', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '10GbE' },
    [C('msi-meg-z890-ace-motherboard-23189'), A('B0BSLLRKDP'), M('msi-meg-z890-ace-lga-1851-atx-motherboard-intel-z890-chipset-4x-ddr5-udimm-slots-up-to-256gb-max-memory-wi-fi-7-bt-5-4-3x-pci-e-x16-slots-5x-m-2-slots-black-911-7e22-001')],
    `### MSI MEG Z890 ACE

لوحة MSI الرائدة لمعالجات Core Ultra 200S: شبكة 10 جيجابت، ومنفذا Thunderbolt 4، ومنفذا M.2 من الجيل الخامس.

**التقنيات الأساسية المدعومة:**

[green]شبكة Marvell بسرعة 10 جيجابت:[/green] وواي‑فاي 7.

[green]خمسة منافذ M.2:[/green] اثنان بالجيل الخامس من المعالج، والباقي بالجيل الرابع.

[green]فتحتان PCIe 5.0 من المعالج:[/green] الأولى x16 والثانية x8، مع تقسيمٍ للمسارات من البيوس.

[green]منفذا Thunderbolt 4:[/green] 40 جيجابت مع صورة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سعرها من الأعلى — مزاياها للمحترفين وكسر السرعة لا للألعاب.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تزيد فريمات الألعاب على لوحة Z890 أرخص.

${alt('Z890_CARBON', 'خمسة منافذ M.2 وThunderbolt 4 بسعرٍ أقلّ بكثير.')}
https://www.msi.com/Motherboard/MEG-Z890-ACE/Specification`),

  board('MSI', 'MAG Z890 Tomahawk WiFi', 15, 4,
    { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '9200 MT/s (OC)', m2Slots: '4', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '5GbE' },
    [C('msi-mag-z890-tomahawk-wifi-motherboard-23195'), A('B0DFQ5Z7KN')],
    `### MSI MAG Z890 Tomahawk WiFi

لوحة Tomahawk لشيبست Z890: شبكة Killer بسرعة 5 جيجابت، ومنفذا Thunderbolt 4، ومراحل طاقة متينة.

**التقنيات الأساسية المدعومة:**

[green]شبكة Intel Killer E5000B بسرعة 5 جيجابت:[/green] وواي‑فاي 7.

[green]منفذا Thunderbolt 4:[/green] 40 جيجابت مع صورة.

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج، مع أربعة منافذ SATA.

[green]DDR5 حتى 9200 MT/s كسر سرعة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا التوسعة الإضافيّتان من الشيبست بالجيل الرابع x4.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا منفذ M.2 ثانٍ من الجيل الخامس.

${alt('PRO_Z890A', 'المزايا نفسها تقريباً (Thunderbolt 4 وشبكة 5 جيجابت) بسعرٍ أقلّ عادةً.')}
https://www.msi.com/Motherboard/MAG-Z890-TOMAHAWK-WIFI/Specification`),

  board('MSI', 'PRO Z890-S WiFi', 15, 3,
    { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8800 MT/s (OC)', m2Slots: '3', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE' },
    [C('msi-pro-z980-s-wifi-motherboard-26635'), A('B0BV2CQZFV')],
    `### MSI PRO Z890-S WiFi

مدخل MSI الاقتصاديّ إلى شيبست Z890 بحجم ATX: كسر سرعة معالجات K وواي‑فاي 7 ومنفذ Thunderbolt 4.

**التقنيات الأساسية المدعومة:**

[green]شيبست Z890:[/green] كسر سرعة المعالج والذاكرة.

[green]منفذ Thunderbolt 4:[/green] Type-C بسرعة 40 جيجابت يحمل صورة.

[green]ثلاثة منافذ M.2:[/green] الأوّل بالجيل الخامس، مع أربعة منافذ SATA.

[green]واي‑فاي 7 وشبكة 2.5 جيجابت.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* شريحة صوت Realtek ALC897 أساسيّة.
* مراحل طاقة اقتصاديّة — لا تناسب كسر سرعة Core Ultra 9 تحت حملٍ طويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ثلاثة منافذ M.2 فقط.

${alt('Z890_UD', 'لوحة Z890 اقتصاديّة أخرى بمنفذ USB4.')}
https://www.msi.com/Motherboard/PRO-Z890-S-WIFI/Specification`),

  // ================================================================ لوحات AMD
  board('Gigabyte', 'X870 AORUS Elite WiFi7 ICE', 15, 5,
    { socket: 'AM5', chipset: 'X870', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8200 MT/s (OC)', m2Slots: '4', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE', color: 'White' },
    [C('gigabyte-x870-a-elite-wf7-ice-motherboard-white-30716'), A('B0DGVGRVLQ'), M('gigabyte-x870-aorus-elite-wifi7-ice-am5-atx-motherboard-amd-x870-chipset-4x-ddr5-dimm-slot-256gb-max-memory-4x-m-2-slots-1x-pcie-5-0-x16-white-x870-a-elite-wf7-ice')],
    `### Gigabyte X870 AORUS Elite WiFi7 ICE

النسخة البيضاء من لوحة X870 AORUS Elite: أربعة منافذ M.2، ومنفذا USB4، وواي‑فاي 7.

**التقنيات الأساسية المدعومة:**

[green]أربعة منافذ M.2:[/green] مع أربعة منافذ SATA.

[green]منفذا USB4 بسرعة 40 جيجابت:[/green] يحملان صورةً مع المعالجات ذات الرسوميات المدمجة.

[green]PCIe 5.0 للكرت والتخزين:[/green] مع Ryzen 9000 و7000.

[green]واي‑فاي 7 وشبكة 2.5 جيجابت:[/green] ولوحةٌ بيضاء بالكامل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* شبكة سلكيّة 2.5 جيجابت فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* اللون الأبيض يرفع السعر دون فرقٍ في الأداء.

${alt('X870_ELITE', 'اللوحة نفسها بالأسود بسعرٍ أقلّ عادةً.')}
https://www.gigabyte.com/Motherboard/X870-AORUS-ELITE-WIFI7-ICE-rev-10-11/sp`),

  board('Gigabyte', 'X870 AORUS Stealth ICE', 15, 4,
    { socket: 'AM5', chipset: 'X870', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8200 MT/s (OC)', m2Slots: '4', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '5GbE', color: 'White' },
    [C('gigabyte-x870-aorus-stealth-am5-atx-ice-motherboard-41393'), A('B0FDL6182M'), M('gigabyte-x870-aorus-stealth-ice-am5-atx-motherboard-amd-x870-chipset-4x-ddr5-dimm-slots-256gb-max-memory-1x-pcie-5-0-x16-4x-m-2-slots-wifi-7-bt-5-4-white-x870-a-stealth-ice')],
    `### Gigabyte X870 AORUS Stealth ICE

النسخة البيضاء من لوحة Stealth بالموصلات الخلفيّة: الكابلات تُركّب من خلف اللوحة فيبدو الجهاز الأبيض بلا كابلات.

**التقنيات الأساسية المدعومة:**

[green]موصلات خلفيّة (Reverse-Connect):[/green] واجهة اللوحة نظيفة من الكابلات.

[green]منفذا M.2 بالجيل الخامس من المعالج:[/green] ومنفذان آخران بالجيل الرابع.

[green]شبكة 5 جيجابت وواي‑فاي 7:[/green] مع منفذَي USB4.

[green]صوت Realtek ALC1220:[/green] ولوحةٌ بيضاء بالكامل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 الثاني يتقاسم المسارات مع USB4.
* منفذا SATA فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* تحتاج كيساً يدعم اللوحات ذات الموصلات الخلفيّة — في كيسٍ عاديّ لا تصل الكابلات إليها.

${alt('X870_STEALTH', 'اللوحة نفسها بالأسود.')}
https://www.gigabyte.com/Motherboard/X870-AORUS-STEALTH-ICE-rev-10/sp`),

  board('ASUS', 'ProArt X870E-Creator WiFi', 20, 5,
    { socket: 'AM5', chipset: 'X870E', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8000+ MT/s (OC)', m2Slots: '4', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '10GbE + 2.5GbE' },
    [C('asus-proart-x870e-creator-wifi-am5-motherboard-33998'), A('B09KB8GGN1')],
    `### ASUS ProArt X870E-Creator WiFi

لوحة X870E لصنّاع المحتوى: شبكة 10 جيجابت، ومنفذا M.2 من الجيل الخامس، وتصميمٌ هادئ بلا إضاءة.

**التقنيات الأساسية المدعومة:**

[green]شبكتان سلكيّتان (10 و2.5 جيجابت):[/green] Marvell AQtion وIntel — لنقل الملفّات الكبيرة.

[green]منفذا M.2 بالجيل الخامس من المعالج:[/green] ومنفذان آخران بالجيل الرابع.

[green]منفذا USB4 بسرعة 40 جيجابت:[/green] يحملان صورة.

[green]واي‑فاي 7:[/green] مثبّتٌ في اللوحة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحة PCIe 5.0 الثانية تتقاسم المسارات مع منفذ M.2 الثاني.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* مزاياها للعمل لا للألعاب — لاعبٌ لا يحتاج 10 جيجابت.

${alt('X870E_E', 'شيبست X870E بتوجّهٍ للألعاب وخمسة منافذ M.2.')}
https://www.asus.com/motherboards-components/motherboards/proart/proart-x870e-creator-wifi/techspec/`),

  board('MSI', 'PRO B840M-P WiFi6E', 10, 2,
    { socket: 'AM5', chipset: 'B840', formFactor: 'Micro-ATX', maxRam: '256GB', memorySpeed: '8000 MT/s (OC)', m2Slots: '2', pcieVersion: 'PCIe 4.0', wifi: 'Wi-Fi 6E', lan: '2.5GbE' },
    [C('msi-pro-b840m-p-wifi-6e-am5-ddr5-m-atx-motherboard-40985'), A('B096Y53VL8')],
    `### MSI PRO B840M-P WiFi6E

لوحة AM5 اقتصاديّة صغيرة (Micro-ATX) على شيبست B840 بواي‑فاي 6E — أرخص طريقٍ إلى Ryzen الحديث.

**التقنيات الأساسية المدعومة:**

[green]أربع فتحات DDR5 حتى 256 جيجابايت:[/green] بسرعة تصل إلى 8000 MT/s كسر سرعة.

[green]منفذا M.2 من المعالج:[/green] كلاهما بالجيل الرابع، مع أربعة منافذ SATA.

[green]واي‑فاي 6E وشبكة 2.5 جيجابت.[/green]

[green]ترقيةٌ على AM5:[/green] تدعم Ryzen 7000 و8000 و9000.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحة الكرت بالجيل الرابع، وفتحة توسعةٍ إضافيّة واحدة فقط (x1).
* شريحة صوت Realtek ALC897 أساسيّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كسر سرعة للمعالج (B840)، ولا تخزين من الجيل الخامس.

${alt('B850M_FORCE', 'شيبست B850 صغير بالجيل الخامس للكرت والتخزين.')}
https://www.msi.com/Motherboard/PRO-B840M-P-WIFI6E/Specification`),

  // ================================================================ المبرّدات
  {
    categoryId: COOL, brand: 'ASUS', name: 'ROG Ryujin III 360 ARGB Extreme', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'AIO', sizeMm: '360', sockets: SOCKETS_ALL, fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'Black', features: ['شاشة LCD مقاس 3.5 بوصة', 'مروحة مدمجة في الرأس تبرّد مراحل الطاقة'] },
    offers: [C('asus-rog-ryujin-iii-360-argb-extreme-aio-liquid-cooler-27743'), A('B0DPPBVSNC'), M('asus-rog-ryujin-iii-360-argb-extreme-liquid-cpu-cooler-360mm-radiator-120mm-rog-magnetic-daisy-chainable-fan-89-73-cfm-airflow-2800-rpm-speed-3-5-lcd-display-black-90rc0131-m0eay0')],
    description: `### ASUS ROG Ryujin III 360 ARGB Extreme

مبرّد ROG الرائد بالأسود: مضخّة Asetek Gen8 V2، وشاشة 3.5 بوصة، ومروحةٌ في الرأس تبرّد مراحل طاقة اللوحة.

**التقنيات الأساسية المدعومة:**

[green]مضخّة Asetek Gen8 V2 بمحرّكٍ ثلاثيّ الأطوار:[/green] تدفّقٌ أعلى ومقاومةٌ أقلّ.

[green]شاشة LCD مقاس 3.5 بوصة:[/green] تعرض الحرارة أو الصور.

[green]مروحة مدمجة في الرأس:[/green] تخفض حرارة مراحل طاقة اللوحة بحسب ASUS.

[green]ثلاث مراوح مغناطيسيّة 120 مم (30 مم سماكة):[/green] حتى 2800 دورة، وتتّصل ببعضها دون كابلات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* رادييتر بسماكة 30 مم — تأكّد من المساحة فوق الذاكرة إن رُكّب في السقف.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعره من الأعلى في الفئة — للشاشة والتصميم أكثر من الحرارة.

${alt('KRAKEN_ELITE_360', 'مبرّد 360 مم بشاشةٍ كبيرة بسعرٍ أقلّ عادةً.')}
https://rog.asus.com/cooling/cpu-liquid-coolers/rog-ryujin/rog-ryujin-iii-360-argb-extreme/`,
  },
  {
    categoryId: COOL, brand: 'ASUS', name: 'ROG Strix LC III 360 ARGB White', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: SOCKETS_ALL, fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'White' },
    offers: [C('asus-rog-strix-lc-iii-360-argb-white-aio-liquid-cooler-40313'), A('B0CTCTP2WV')],
    description: `### ASUS ROG Strix LC III 360 ARGB White

مبرّد مائيّ 360 مم أبيض بمضخّة Asetek وثلاث مراوح ARGB تتوقّف عند الحمل الخفيف — دون شاشة.

**التقنيات الأساسية المدعومة:**

[green]مضخّة Asetek من الجيل السابع:[/green] منصّةٌ مجرّبة في مبرّداتٍ كثيرة.

[green]ثلاث مراوح ROG Strix AF-12S ARGB:[/green] حتى 2200 دورة و70 CFM، وتتوقّف تماماً عند الحمل الخفيف.

[green]أبيض بالكامل:[/green] مع إضاءة Aura Sync.

[green]ضمان ستّ سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المراوح تصل إلى 36 ديسيبل بأقصى سرعتها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة في الرأس — نسخة LCD أغلى.

${alt('LE360_W', 'مبرّد 360 مم أبيض بسعرٍ أقلّ عادةً.')}
https://rog.asus.com/cooling/cpu-liquid-coolers/rog-strix-lc/rog-strix-lc-iii-360-argb-white-edition/`,
  },
  {
    categoryId: COOL, brand: 'ASUS', name: 'ROG Ryuo III 360 ARGB White', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: 'AM5/AM4/LGA1700/LGA1200/LGA115X', fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'White', features: ['شاشة Anime Matrix بنقاط LED'] },
    offers: [C('asus-rog-ryuo-iii-360-argb-360mm-white-cp1206'), A('B0BTS2FFWK')],
    description: `### ASUS ROG Ryuo III 360 ARGB White

مبرّد مائيّ 360 مم أبيض بمضخّة Asetek من الجيل الثامن وشاشة Anime Matrix بنقاط LED على الرأس.

**التقنيات الأساسية المدعومة:**

[green]مضخّة Asetek Gen8:[/green] بمحرّكٍ ثلاثيّ الأطوار، حتى 2600 دورة.

[green]شاشة Anime Matrix:[/green] نقاط LED تعرض رسوماً متحرّكة وبيانات النظام.

[green]ثلاث مراوح ROG AF-12S ARGB:[/green] حتى 2200 دورة و70 CFM.

[green]ضمان ستّ سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* رادييتر بسماكة 30 مم.
* صفحة ASUS للنسخة البيضاء لا تذكر مقبس LGA1851 — تأكّد من المثبّت قبل تركيبه على Core Ultra 200S.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* الشاشة نقطيّة لا ملوّنة — لا تعرض صوراً.

${alt('DVP_360_W', 'مبرّد 360 مم أبيض بشاشةٍ ملوّنة بسعرٍ أقلّ عادةً.')}
https://rog.asus.com/us/cooling/cpu-liquid-coolers/rog-ryuo/rog-ryuo-iii-360-argb-white-edition-model/`,
  },
  {
    categoryId: COOL, brand: 'Corsair', name: 'iCUE LINK TITAN 240 RX LCD', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '240', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '2', fanSize: '120mm', rgb: 'Yes', color: 'Black', features: ['شاشة IPS مقاس 2.1 بوصة'] },
    offers: [C('corsair-icue-link-titan-240-rx-lcd-rgb-liquid-cpu-cooler-black-24355'), A('B0DF7CGGCW'), M('corsair-icue-link-titan-240-rx-lcd-aio-liquid-cpu-cooler-customizable-lcd-screen-compatible-with-intel-socket-lga-1851-1700-amd-am5-am4-addressable-rgb-extreme-cooling-black-cw-9061022-ww')],
    description: `### Corsair iCUE LINK TITAN 240 RX LCD

مبرّد Titan 240 RX بشاشة LCD في الرأس: مضخّة FlowDrive، ومروحتا RX120 RGB، ونظام iCUE LINK بكابلٍ واحد.

**التقنيات الأساسية المدعومة:**

[green]شاشة IPS مقاس 2.1 بوصة:[/green] تعرض الحرارة أو الصور المتحرّكة.

[green]مضخّة FlowDrive بمحرّكٍ ثلاثيّ الأطوار:[/green] وقاعدة نحاسيّة بمعجون XTM70.

[green]مروحتا RX120 RGB بمحامل مغناطيسيّة:[/green] من 300 إلى 2100 دورة.

[green]كابلٌ واحد لكلّ شيء:[/green] والموزّع (System Hub) في العلبة، وضمان ستّ سنوات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الشاشة والإضاءة والسرعة عبر برنامج iCUE لا اللوحة.
* 240 مم لا تكفي معالجات i9 وRyzen 9 تحت الحمل الطويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* مراوح iCUE LINK لا تعمل إلا مع موزّع Corsair.

${alt('KRAKEN_ELITE_240', 'مبرّد 240 مم بشاشةٍ أكبر (2.72 بوصة).')}
https://www.corsair.com/us/en/p/cpu-coolers/cw-9061022-ww/icue-link-titan-240-rx-lcd-liquid-cpu-cooler-cw-9061022-ww`,
  },
  {
    categoryId: COOL, brand: 'Corsair', name: 'iCUE LINK TITAN 240 RX RGB White', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '240', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '2', fanSize: '120mm', rgb: 'Yes', color: 'White' },
    offers: [C('corsair-icue-link-titan-240-rx-lcd-rgb-liquid-cpu-cooler-white-24361'), A('B0D6BGFVX8'), M('corsair-icue-link-titan-240-rx-rgb-aio-liquid-cpu-cooler-compatible-with-intel-socket-lga-1851-1700-amd-am5-am4-addressable-rgb-extreme-cooling-performance-white-cw-9061020-ww')],
    description: `### Corsair iCUE LINK TITAN 240 RX RGB White

النسخة البيضاء من مبرّد Titan 240 RX: مضخّة FlowDrive، ومروحتا RX120 RGB، ونظام iCUE LINK بكابلٍ واحد.

**التقنيات الأساسية المدعومة:**

[green]مضخّة FlowDrive بمحرّكٍ ثلاثيّ الأطوار:[/green] وقاعدة نحاسيّة بمعجون XTM70.

[green]مروحتا RX120 RGB بمحامل مغناطيسيّة:[/green] من 300 إلى 2100 دورة.

[green]كابلٌ واحد لكلّ شيء:[/green] والموزّع في العلبة.

[green]أبيض بالكامل:[/green] وضمان ستّ سنوات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الإضاءة والسرعة عبر برنامج iCUE لا اللوحة.
* 240 مم لا تكفي معالجات i9 وRyzen 9 تحت الحمل الطويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة في الرأس.

${alt('E240_W', 'مبرّد 240 مم أبيض بسعرٍ أقلّ عادةً.')}
https://www.corsair.com/us/en/p/cpu-coolers/cw-9061020-ww/icue-link-titan-240-rx-rgb-aio-liquid-cpu-cooler-white-cw-9061020-ww`,
  },
  {
    categoryId: COOL, brand: 'Corsair', name: 'iCUE LINK H100i LCD', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '240', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '2', fanSize: '120mm', rgb: 'Yes', color: 'Black', features: ['شاشة IPS مقاس 2.1 بوصة بدقّة 480×480'] },
    offers: [C('corsair-icue-link-h100i-lcd-rgb-liquid-cpu-cooler-black-24349'), A('B0CLB8TWB2')],
    description: `### Corsair iCUE LINK H100i LCD

مبرّد مائيّ 240 مم بشاشة IPS ومراوح QX120 RGB التي تحمل حسّاس حرارةٍ في كلّ مروحة — من نظام iCUE LINK.

**التقنيات الأساسية المدعومة:**

[green]شاشة IPS مقاس 2.1 بوصة:[/green] بدقّة 480×480 وسطوع 600 شمعة.

[green]مروحتا QX120 RGB:[/green] حتى 2400 دورة، بـ34 ضوءاً وحسّاس حرارةٍ في كلّ مروحة، وتتوقّف عند الحمل الخفيف.

[green]قاعدة نحاسيّة ومعجون XTM70 مطبّق مسبقاً.[/green]

[green]موزّع iCUE LINK في العلبة:[/green] يصل حتى 24 جهازاً بكابلٍ واحد.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* التحكّم عبر برنامج iCUE لا اللوحة.
* 240 مم لا تكفي معالجات i9 وRyzen 9 تحت الحمل الطويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* مراوح iCUE LINK لا تعمل إلا مع موزّع Corsair.

${alt('KRAKEN_ELITE_240', 'مبرّد 240 مم بشاشةٍ أكبر بسعرٍ قريب.')}
https://www.corsair.com/us/en/p/cpu-coolers/cw-9061007-ww/icue-link-h100i-lcd-liquid-cpu-cooler-cw-9061007-ww`,
  },
  {
    categoryId: COOL, brand: 'MSI', name: 'MPG CoreLiquid P13 360 White', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'White', features: ['شاشة IPS مقاس 2.1 بوصة بدقّة 480×480'] },
    offers: [C('msi-mpg-coreliquid-p13-360-360mm-argb-aio-liquid-cooler-ips-2-1-lcd-triple-120mm-pwm-fans-white-41609'), A('B0FBRVSR1P')],
    description: `### MSI MPG CoreLiquid P13 360 White

النسخة البيضاء من مبرّد MSI بشاشة IPS دائريّة: 360 مم وثلاث مراوح ARGB.

**التقنيات الأساسية المدعومة:**

[green]شاشة IPS مقاس 2.1 بوصة:[/green] بدقّة 480×480 وسطوع 600 شمعة.

[green]رادييتر 360 مم بثلاث مراوح 120 مم:[/green] لمعالجات Core i7 وRyzen 7 تحت الحمل الطويل.

[green]مضخّة 3400 دورة:[/green] بضوضاء 20 ديسيبل.

[green]أبيض بالكامل:[/green] مع إضاءة ARGB.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المراوح بمحامل Rifle — عمرها المقدّر أقصر من محامل FDB.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* المقابس المدعومة: AM5 وAM4 وLGA1851 وLGA1700 فقط.

${alt('E360_W', 'مبرّد MSI أبيض بحجم 360 مم بمراوح FDB، دون الشاشة.')}
https://www.msi.com/Liquid-Cooling/MPG-CORELIQUID-P13/Specification`,
  },
  {
    categoryId: COOL, brand: 'MSI', name: 'MPG CoreLiquid D360', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: SOCKETS_ALL, fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'Black', features: ['شاشة IPS مقاس 2.4 بوصة'] },
    offers: [C('msi-mpg-coreliquid-d360-cpu-liquid-cooler-19037'), A('B0CNF2F186')],
    description: `### MSI MPG CoreLiquid D360

مبرّد مائيّ 360 مم بشاشة IPS مستطيلة 2.4 بوصة تعرض الحرارة والصور وحتى الطقس.

**التقنيات الأساسية المدعومة:**

[green]شاشة IPS مقاس 2.4 بوصة:[/green] بسطوع 500 شمعة — بيانات العتاد، وصور GIF وMP4، والساعة.

[green]ثلاث مراوح 120 مم ARGB:[/green] بمحملين كرويّين و77 CFM.

[green]مضخّة 2800 دورة:[/green] بضوضاء 21 ديسيبل، وقاعدة نحاسيّة.

[green]يدعم كلّ المقابس الحاليّة والقديمة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الشاشة بدقّة 320×240 — أقلّ وضوحاً من شاشات المبرّدات الأحدث.
* تحتاج رأس USB 2.0 داخليّاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* جيلٌ أقدم من مبرّدات MSI.

${alt('MYSTIQUE_360', 'مبرّد 360 مم بشاشةٍ أكبر وأوضح (2.8 بوصة) بسعرٍ أقلّ عادةً.')}
https://www.msi.com/Liquid-Cooling/MPG-CORELIQUID-D360/Specification`,
  },
  {
    categoryId: COOL, brand: 'MSI', name: 'MAG CoreLiquid C360', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: SOCKETS_ALL, fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'Black' },
    offers: [C('msi-mpg-coreliquid-c360-cooler-cp1143-4-10028'), A('B0992176M7')],
    description: `### MSI MAG CoreLiquid C360

مبرّد مائيّ 360 مم بثلاث مراوح ARGB ومضخّةٍ في الرادييتر لا في الرأس — ضجيجٌ أقلّ قرب المعالج.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 360 مم بثلاث مراوح 120 مم:[/green] بمحملين كرويّين و78.7 CFM، وعمرٍ مقدّر 70 ألف ساعة.

[green]مضخّة بعمرٍ مقدّر 100 ألف ساعة:[/green] بسرعة 4200 دورة.

[green]يدعم كلّ المقابس الحاليّة والقديمة:[/green] حتى Threadripper.

[green]إضاءة ARGB:[/green] في الرأس والمراوح.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المضخّة سريعة (4200 دورة) — قد تُسمع في الهدوء.
* جيلٌ أقدم من مبرّدات MSI.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة في الرأس.

${alt('LE360', 'مبرّد 360 مم بسعرٍ أقلّ عادةً.')}
https://www.msi.com/Liquid-Cooling/MAG-CORELIQUID-C360/Specification`,
  },
  {
    categoryId: COOL, brand: 'DeepCool', name: 'Mystique 240 ARGB', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'AIO', sizeMm: '240', sockets: SOCKETS_ALL, fanCount: '2', fanSize: '120mm', rgb: 'Yes', color: 'Black', features: ['شاشة TFT مقاس 2.8 بوصة بدقّة 640×480', 'حسّاس دوران يضبط اتجاه الشاشة تلقائياً'] },
    offers: [C('deepcool-aio-liquid-cooler-mystique-240-a-rgb-2-8-lcd-black-22943'), M('deepcool-mystique-240-argb-liquid-cpu-cooler-2-83-tft-lcd-display-240mm-radiator-120mm-fan-size-2400-rpm-fan-speed-72-04-cfm-airflow-hydro-bearing-type-black-r-lx550-bkadsnc-g-1')],
    description: `### DeepCool Mystique 240 ARGB

مبرّد مائيّ 240 مم بشاشةٍ كبيرة 2.8 بوصة تدور تلقائياً مع اتّجاه الرأس، وإضاءة ARGB.

**التقنيات الأساسية المدعومة:**

[green]شاشة TFT مقاس 2.8 بوصة:[/green] بدقّة 640×480 وحسّاس دورانٍ يضبط اتجاهها تلقائياً.

[green]مضخّة الجيل الخامس:[/green] 3400 دورة، وقنوات تبريد 0.13 مم.

[green]مروحتا FD12 ARGB:[/green] حتى 2400 دورة و72 CFM، بكابلٍ واحد متسلسل.

[green]يدعم كلّ المقابس الحاليّة:[/green] ومعجون مطبّق مسبقاً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المراوح تصل إلى 38.7 ديسيبل بأقصى سرعتها.
* 240 مم لا تكفي معالجات i9 وRyzen 9 تحت الحمل الطويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب كسر السرعة الثقيل.

${alt('LE240', 'مبرّد 240 مم بسعرٍ أقلّ بكثير، دون الشاشة.')}
https://www.deepcool.com/products/Cooling/cpuliquidcoolers/MYSTIQUE-240-ARGB-5th-Gen-LCD-Liquid-Cooler-1851-1700-AM5/2024/18770.shtml`,
  },
  {
    categoryId: COOL, brand: 'DeepCool', name: 'Mystique 240', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'AIO', sizeMm: '240', sockets: SOCKETS_ALL, fanCount: '2', fanSize: '120mm', rgb: 'No', color: 'Black', features: ['شاشة TFT مقاس 2.8 بوصة بدقّة 640×480'] },
    offers: [C('deepcool-aio-liquid-cooler-mystique-240-2-8-lcd-black-aa18337'), M('deepcool-mystique-240-liquid-cpu-cooler-2-8-tft-lcd-screen-240mm-radiator-120mm-fan-size-2150-rpm-fan-speed-72-45-cfm-fan-airflow-3400-rpm-pump-speed-fdb-fan-black-r-lx550-bkdsnc-g-1')],
    description: `### DeepCool Mystique 240

النسخة الهادئة بلا إضاءة من مبرّد Mystique 240: الشاشة الكبيرة نفسها، بمراوح FDB أهدأ.

**التقنيات الأساسية المدعومة:**

[green]شاشة TFT مقاس 2.8 بوصة:[/green] بدقّة 640×480 تعرض الحرارة أو الصور.

[green]مضخّة الجيل الخامس:[/green] 3400 دورة.

[green]مروحتان بمحامل FDB:[/green] حتى 2150 دورة و72 CFM، بضوضاء حتى 36.5 ديسيبل — أهدأ من نسخة ARGB.

[green]يدعم كلّ المقابس الحاليّة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 240 مم لا تكفي معالجات i9 وRyzen 9 تحت الحمل الطويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة ARGB في المراوح.

${alt('LE240', 'مبرّد 240 مم بسعرٍ أقلّ بكثير، دون الشاشة.')}
https://www.deepcool.com/products/Cooling/cpuliquidcoolers/MYSTIQUE-240-5th-Gen-Liquid-Cooler-with-LCD-1700-AM5/2024/18058.shtml`,
  },

  // ================================================================ الصناديق
  {
    categoryId: CASE, brand: 'Gamdias', name: 'Atlas M1 White', tdpWattage: 0, performanceTier: 2,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '410', maxCoolerHeight: '160', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '3x 120mm ARGB', color: 'White', screen: 'شاشة حرارة صغيرة' },
    offers: [C('gamdias-atlas-m1-case-white-21422'), A('B0CXDX69LM')],
    description: `### GAMDIAS Atlas M1 White

كيس اقتصاديّ أبيض بزجاجٍ في الواجهة والجانب، وثلاث مراوح ARGB، وشاشةٍ صغيرة لحرارة القطع — ويتّسع لكرتٍ حتى 410 مم.

**التقنيات الأساسية المدعومة:**

[green]كرت حتى 410 مم:[/green] يتّسع لأغلب الكروت.

[green]رادييتر 360 مم في السقف:[/green] و240 مم في الجانب.

[green]ثلاث مراوح 120 مم ARGB PWM:[/green] اثنتان في الجانب وواحدة في الخلف، مع موزّعٍ بستّة منافذ.

[green]شاشة حرارة:[/green] ومنفذ Type-C أماميّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هواء حتى 160 مم، ومزوّد حتى 180 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تهوية أماميّة — الواجهة زجاج.

${alt('ATLAS_E1_W', 'كيس GAMDIAS أبيض أصغر وأرخص.')}
https://www.gamdias.com/en/component/case/ATLAS_M1_WH`,
  },
  {
    categoryId: CASE, brand: 'Gamdias', name: 'Talos E3 White', tdpWattage: 0, performanceTier: 2,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '300', maxCoolerHeight: '160', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '3x 120mm ARGB', color: 'White' },
    offers: [C('gamdias-talos-e3-cg-case-white-32860'), A('B0B8VMNN2S')],
    description: `### GAMDIAS Talos E3 White

كيس أبيض صغير اقتصاديّ جداً بثلاث مراوح ARGB وجانبٍ زجاجيّ — لجهازٍ أوّل بكرتٍ قصير.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح 120 مم ARGB:[/green] اثنتان في الواجهة وواحدة في الخلف.

[green]رادييتر 360 مم في الواجهة:[/green] بعد نزع قفص الأقراص.

[green]يقبل لوحات ATX:[/green] وMicro-ATX وMini-ITX.

[green]سعرٌ منخفض جداً.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* كرت حتى 300 مم فقط — كثيرٌ من كروت RTX 5060 Ti وما فوقها أطول.
* مبرّد هواء حتى 160 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا منفذ Type-C أماميّ.

${alt('AIR903_BASE', 'كيس أبيض اقتصاديّ يتّسع لكروتٍ حتى 400 مم.')}
https://www.gamdias.com/en/component/case/TALOS_E3_WH`,
  },
];

// ---------------------------------------------------------------- التنفيذ

const stores = Object.fromEntries(
  (await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]),
);

let blocked = false;
const bad = (m) => { console.log(`    ⛔ ${m}`); blocked = true; };
for (const p of PARTS) {
  console.log(`\n=== ${p.brand} ${p.name}  (t${p.performanceTier})`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  const dup = await prisma.component.findFirst({ where: { name: { equals: p.name, mode: 'insensitive' }, brand: { equals: p.brand, mode: 'insensitive' } } });
  if (dup) bad(`موجودة: ${dup.id}`);
  if (/\*\*\[(yellow|red)\]/.test(p.description)) bad('نجومٌ حول وسمٍ ملوّن');
  if (!/^https:\/\/\S+$/.test(p.description.trim().split('\n').pop())) bad('آخر سطرٍ ليس رابط الصانع');
  if (p.offers.length < 2) bad('أقلّ من متجرين');
  for (const o of p.offers) {
    if (!stores[o.store]) { bad(`لا متجر «${o.store}»`); continue; }
    const taken = await prisma.componentOffer.findFirst({ where: { url: { startsWith: o.url.replace(/\/$/, '') } }, select: { url: true, component: { select: { name: true } } } });
    if (taken) bad(`رابط ${o.store} مستعمل في: ${taken.component.name}`);
    else console.log(`    ✔ ${o.store}`);
  }
}
for (const [name, id] of Object.values(ALT)) {
  const c = await prisma.component.findUnique({ where: { id }, select: { brand: true, name: true } });
  if (!c) bad(`البديل ${name} (${id}) لا يشير إلى قطعة`);
  else if (`${c.brand} ${c.name}` !== name) bad(`البديل ${id} اسمه «${c.brand} ${c.name}» لا «${name}»`);
}

for (const e of EXTRA) {
  const c = await prisma.component.findUnique({ where: { id: e.id }, select: { name: true } });
  if (!c || c.name !== e.name) bad('العرض الإضافيّ: القطعة ' + e.id + ' ليست «' + e.name + '»');
  const taken = await prisma.componentOffer.findFirst({ where: { url: e.offer.url } });
  if (taken) bad('العرض الإضافيّ مستعمل: ' + e.offer.url);
  else console.log(`\n➕ سيُضاف عرض ${e.offer.store} إلى «${e.name}»`);
}
for (const m of MOVE) {
  const o = await prisma.componentOffer.findUnique({ where: { id: m.offerId }, select: { componentId: true, url: true } });
  if (!o || o.componentId !== m.from || !o.url.includes(m.urlHas)) bad(`عرض النقل ${m.offerId} تغيّر`);
  else console.log(`\n↪ سيُنقل عرض مايكرولس (${m.urlHas}) إلى «${m.to}»`);
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log(`\n${PARTS.length} قطعة — (عرضٌ فقط — أضف --apply)`); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const movedBefore = await prisma.componentOffer.findMany({ where: { id: { in: MOVE.map((m) => m.offerId) } } });
writeFileSync(`backups/added-batch5-${stamp}.json`, JSON.stringify({ PARTS, EXTRA, movedBefore }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch5-${stamp}.json`);

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
for (const m of MOVE) {
  const to = await prisma.component.findFirst({ where: { name: m.to, brand: 'Gigabyte' }, select: { id: true } });
  await prisma.componentOffer.update({ where: { id: m.offerId }, data: { componentId: to.id } });
  ids.push(m.from);
  console.log(`↪ نُقل عرض مايكرولس إلى ${m.to}`);
}
for (const e of EXTRA) {
  await prisma.componentOffer.create({ data: { componentId: e.id, storeId: stores[e.offer.store], url: e.offer.url, inStock: true } });
  ids.push(e.id);
  console.log(`➕ ${e.name} ← ${e.offer.store}`);
}

console.log(`\nالتالي (واحدةً واحدة):\n  ${ids.join(' ')}`);
await prisma.$disconnect();
