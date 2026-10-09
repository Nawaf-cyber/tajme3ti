/**
 * ============ الدفعة الثالثة من «القطع الناقصة» — ٢٤ قطعة — 2026-10-08 ============
 *
 * طلب نوّاف: «كمل ضيف دفعة ثالثة». القاعدة: متجران حيّان على الأقلّ، بلا تكرار.
 *
 * كيف وُجدت: مُسحت أقسام كازاسوق كلّها (٩٣٣ منتجاً: لوحات، معالجات، رامات، مبرّدات،
 * مزوّدات، كيسات) وطوبقت بالكتالوج، فبقي ٦٥١ غير موجود؛ قُرئت صفحة كلٍّ منها
 * لعدد «التوفر»، ثمّ بُحث عن المتوفّر في أمازون (بحث المتصفّح) ومايكرولس.
 * كلّ صفحة متجرٍ هنا قُرئت 2026-10-08، والمواصفات من صفحة الصانع في آخر الوصف.
 *
 * لُبسٌ حُسم بالـEAN:
 *   · NZXT 1000W في كازاسوق = C1000 Gold **Core** (PA-0G3BB، EAN 5056547208763)،
 *     لا C1000 Gold ATX 3.1 الذي في أمازون — فشريكه مايكرولس (PA-0G3BB-UK) لا أمازون.
 *   · NZXT C1200 في كازاسوق EAN 5056547204611 = الأسود (الأبيض 5056547206257).
 *   · MSI PRO Z790-P WiFi في كازاسوق EAN 4711377015738 = نسخة DDR5، وأمازون DDR5.
 * ✕ لم يُحتسب: ROG Strix LC III وTitan 240 RX في مايكرولس (كلاهما أبيض)، وAP202 في
 *   مايكرولس (بلا «ARGB» في اسمه — قد يكون الطراز الشبكيّ).
 *
 *   node scripts/add-batch3-2026-10-08.mjs           # عرض
 *   node scripts/add-batch3-2026-10-08.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const CPU = 'cmpfziqb20000x4ymfmkovawm';
const MB = 'cmpfziqe70001x4ym928tt3o2';
const PSU = 'cmpfziqh70002x4ym6ln587z2';
const CASE = 'cmpfziquj0006x4ym53f0ehcw';
const COOL = 'cmszm2ym00000swymvd5s2yxm';

const C = (slug) => ({ store: 'cazasouq', url: `https://www.cazasouq.com/${slug}` });
const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });
const M = (slug) => ({ store: 'microless', url: `https://saudi.microless.com/product/${slug}/` });

const ALT = {
  Z790_TOMAHAWK: ['MSI MAG Z790 TOMAHAWK WIFI', 'cmpfzir17000ax4ymde0z65hz'],
  B860M_PRO_RS: ['ASRock B860M Pro RS WiFi', 'cmr2k5w2s0007jgym4ibatlpn'],
  Z890_EAGLE: ['Gigabyte Z890 EAGLE WiFi7', 'cmuzkki8s0012u4ymfw1ofa3v'],
  B850_GPLUS: ['MSI B850 GAMING PLUS WiFi', 'cmsxdaibx0006skymhs0llh1k'],
  X870_ELITE: ['Gigabyte X870 AORUS Elite WiFi7', 'cmpiec6p9003400ymwohd55y3'],
  X870E_E: ['ASUS ROG Strix X870E-E Gaming WiFi', 'cmpiec8zy003c00ymdvvn2eez'],
  Z890_ELITE: ['Gigabyte Z890 AORUS Elite WiFi7', 'cmr2k5vs40005jgymmq0eke3e'],
  B850_TOMAHAWK: ['MSI MAG B850 Tomahawk MAX WiFi', 'cmuzkkgkm000ku4ymh5n59kjq'],
  X870_GAMINGX: ['Gigabyte X870 Gaming X WiFi7', 'cmuzoq0f3000dnoymfryaju1y'],
  B860M_GPLUS: ['MSI B860M Gaming Plus WiFi', 'cmuzkkh91000ru4ymn940fnmy'],
  I5_14400F: ['Intel Core i5-14400F', 'cmpiebdsb001h00ymvfl5kfn2'],
  MYSTIQUE_360: ['DeepCool Mystique 360 ARGB', 'cmszn26380006w8ymwcp1pmyx'],
  LE240: ['DeepCool LE240 V2', 'cmszmcldq0004zsymj2u94h5v'],
  KRAKEN_CORE_240: ['NZXT Kraken Core 240 RGB', 'cmszn26en000aw8ymba5g8iyy'],
  GF3_1000: ['Thermaltake Toughpower GF3 1000W', 'cmpiechj4004a00ym7kkv09n4'],
  PQ1200G: ['DeepCool PQ1200G 1200W Gold', 'cmsxgetv80008j8ymfin66hwj'],
  RM1000X_SHIFT: ['Corsair RM1000x Shift 1000W', 'cmpieb9r7001000ymgi5gvaai'],
  RM850E_WHITE: ['Corsair RM850e 850W ATX 3.1 Gold White', 'cmsxgetcm0006j8ymgue6lyuz'],
  VISION_M: ['Lian Li O11 Vision-M', 'cmuzoq42n001hnoymuukhc00q'],
  AIR903_BASE: ['Montech AIR 903 BASE White', 'cmtcr2gtk000oo8ym3gsqyofc'],
};
const alt = (k, why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n* ${why}`;

const board = (brand, name, tdpWattage, performanceTier, specs, offers, description) =>
  ({ categoryId: MB, brand, name, tdpWattage, performanceTier, specs: { ramType: 'DDR5', ...specs }, offers, description });

const PARTS = [
  // ================================================================ لوحات Intel
  board('MSI', 'PRO Z790-P WiFi', 15, 3,
    { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '7000+ MT/s (OC)', m2Slots: '4', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 6E', lan: '2.5GbE' },
    [C('msi-pro-z790-p-wifi-motherboard-47114'), A('B0DF5WNFJ2')],
    `### MSI PRO Z790-P WiFi

لوحة Z790 عمليّة لمعالجات Intel من الجيل الثاني عشر حتى الرابع عشر: أربعة منافذ M.2، وستّة منافذ SATA، وواي‑فاي 6E.

**التقنيات الأساسية المدعومة:**

[green]شيبست Z790:[/green] كسر سرعة معالجات K والذاكرة متاح.

[green]أربعة منافذ M.2 بالجيل الرابع:[/green] واحدٌ من المعالج وثلاثة من الشيبست، مع ستّة منافذ SATA — متّسعٌ لأقراصٍ كثيرة.

[green]فتحة كرت PCIe 5.0 x16:[/green] من المعالج مباشرة.

[green]واي‑فاي 6E وشبكة Intel بسرعة 2.5 جيجابت:[/green] ومنفذ Type-C خلفيّ بسرعة 20 جيجابت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* لا منفذ M.2 من الجيل الخامس — الأقراص الأسرع تعمل بسرعة الجيل الرابع.
* شريحة صوت Realtek ALC897 أساسيّة.
* معالجات الجيل الرابع عشر قد تحتاج تحديث بيوس إن كانت اللوحة من مخزونٍ قديم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* مقبس LGA1700 انتهى بالجيل الرابع عشر — لا ترقية لمعالجات Intel الأحدث على هذه اللوحة.

${alt('Z790_TOMAHAWK', 'مراحل طاقة وتبريدٌ أقوى لمعالجات i7 وi9 من فئة K تحت حملٍ طويل.')}
https://www.msi.com/Motherboard/PRO-Z790-P-WIFI/Specification`),

  board('ASUS', 'PRIME H810M-A WiFi', 7, 2,
    { socket: 'LGA1851', chipset: 'H810', formFactor: 'Micro-ATX', maxRam: '128GB', memorySpeed: '7200 MT/s', m2Slots: '2', pcieVersion: 'PCIe 4.0', wifi: 'Wi-Fi 6', lan: '1GbE', maxCpuTdpW: 125 },
    [C('Asus-prime-h810m-a-wifi-motherboard'), A('B0DQQ8X9PX')],
    `### ASUS PRIME H810M-A WiFi

أرخص مدخلٍ إلى معالجات Core Ultra 200S بواي‑فاي مدمج: لوحة H810 صغيرة (Micro-ATX) لجهازٍ اقتصاديّ أو مكتبيّ.

**التقنيات الأساسية المدعومة:**

[green]مقبس LGA1851:[/green] لمعالجات Core Ultra 200S، وقائمة ASUS تذكر حتى Core Ultra 9 285K (125 واط).

[green]واي‑فاي 6 وبلوتوث:[/green] مثبّتان في اللوحة — نادرٌ في لوحات H810.

[green]منفذا M.2 وأربعة منافذ SATA:[/green] الأوّل بالجيل الرابع x4.

[green]ذاكرة DDR5 حتى 7200 MT/s:[/green] مع معالجات Core Ultra 200S Plus، و6400 مع الجيل الأوّل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا ذاكرة فقط وحدٌّ أقصى 128 جيجابايت.
* منفذ M.2 الثاني بنصف المسارات (الجيل الرابع x2).
* شبكة سلكيّة بسرعة 1 جيجابت، والواي‑فاي 1x1 (هوائيٌّ واحد).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كسر سرعة للمعالج، وفتحة الكرت بالجيل الرابع لا الخامس.

${alt('B860M_PRO_RS', 'شيبست B860 بأربع فتحات ذاكرة وفتحة كرتٍ من الجيل الخامس.')}
https://www.asus.com/motherboards-components/motherboards/prime/prime-h810m-a-wifi/techspec/`),

  board('ASUS', 'PRIME Z890-P', 15, 3,
    { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8666+ MT/s (OC)', m2Slots: '4', pcieVersion: 'PCIe 5.0', wifi: 'No', lan: '2.5GbE' },
    [C('asus-prime-z890-p-motherboard-23488'), A('B0DJDFX4M1')],
    `### ASUS PRIME Z890-P

أرخص لوحة Z890 بحجم ATX كامل عند ASUS: أربعة منافذ M.2 وكسر سرعة لمعالجات K — دون واي‑فاي.

**التقنيات الأساسية المدعومة:**

[green]شيبست Z890:[/green] كسر سرعة معالجات Core Ultra 200S من فئة K والذاكرة.

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج، والثلاثة الباقية بالجيل الرابع، مع أربعة منافذ SATA.

[green]فتحة كرت PCIe 5.0 x16:[/green] وثلاث فتحاتٍ إضافيّة من الشيبست.

[green]منفذ Type-C خلفيّ بسرعة 20 جيجابت يحمل صورة:[/green] وشبكة Realtek بسرعة 2.5 جيجابت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* لا Thunderbolt 4 في اللوحة الخلفيّة — رأسٌ داخليّ لبطاقةٍ تُشترى منفصلة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا واي‑فاي ولا بلوتوث — تحتاج كيبل شبكة أو بطاقة إضافيّة.

${alt('Z890_EAGLE', 'لوحة Z890 بواي‑فاي 7 مدمج بسعرٍ قريب.')}
https://www.asus.com/motherboards-components/motherboards/prime/prime-z890-p/techspec/`),

  board('MSI', 'PRO Z890-A WiFi', 15, 4,
    { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '9200 MT/s (OC)', m2Slots: '4', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '5GbE' },
    [C('msi-pro-z890-a-wifi-motherboard-23198'), A('B0DCZM8QK5')],
    `### MSI PRO Z890-A WiFi

لوحة Z890 من سلسلة PRO بمزايا لوحات أغلى: منفذا Thunderbolt 4، وشبكة 5 جيجابت، وواي‑فاي 7.

**التقنيات الأساسية المدعومة:**

[green]منفذا Thunderbolt 4 خلفيّان:[/green] 40 جيجابت مع صورة DisplayPort.

[green]شبكة Realtek بسرعة 5 جيجابت وواي‑فاي 7:[/green] اتصالٌ سريع سلكياً ولاسلكياً.

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس، والثاني بالجيل الرابع من المعالج، واثنان من الشيبست.

[green]صوت Realtek ALC1220P:[/green] أعلى من شرائح اللوحات الاقتصاديّة، مع مخرج S/PDIF.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا التوسعة الإضافيّتان من الشيبست بالجيل الرابع x4 — لبطاقاتٍ لا لكرتٍ ثانٍ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* تصميمٌ عمليّ بلا إضاءة ولا شاشة تشخيص.

${alt('Z890_ELITE', 'مراحل طاقةٍ أقوى من Gigabyte لمعالجات Core Ultra 9 تحت حملٍ طويل.')}
https://www.msi.com/Motherboard/PRO-Z890-A-WIFI/Specification`),

  board('MSI', 'MPG Z890 Carbon WiFi', 20, 5,
    { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '9200 MT/s (OC)', m2Slots: '5', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '5GbE + 2.5GbE' },
    [C('msi-mpg-z890-carbon-wifi-motherboard-23192'), A('B0BX6L3LYB')],
    `### MSI MPG Z890 Carbon WiFi

لوحة Z890 من الفئة العليا: خمسة منافذ M.2، وشبكتان سلكيّتان، ومنفذا Thunderbolt 4، وفتحتا كرتٍ من الجيل الخامس.

**التقنيات الأساسية المدعومة:**

[green]خمسة منافذ M.2:[/green] الأوّل بالجيل الخامس، والأربعة الباقية بالجيل الرابع.

[green]فتحتان PCIe 5.0 من المعالج:[/green] الأولى x16 والثانية x8، مع تقسيمٍ للمسارات من البيوس.

[green]شبكتان سلكيّتان (5 و2.5 جيجابت) وواي‑فاي 7:[/green] Intel Killer E5000B وIntel I226V.

[green]منفذا Thunderbolt 4 بسرعة 40 جيجابت:[/green] وصوت Realtek ALC1220P.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* أربعة منافذ SATA فقط رغم حجمها.
* سعرها للمنافذ والتوسعة: الأداء في الألعاب لا يختلف عن لوحة Z890 أرخص.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تُقصد للأجهزة الاقتصاديّة — معالج Core Ultra 5 لا يحتاج إلى كلّ هذا.

${alt('Z890_ELITE', 'شيبست Z890 وأربعة منافذ M.2 وواي‑فاي 7 بسعرٍ أقلّ عادةً.')}
https://www.msi.com/Motherboard/MPG-Z890-CARBON-WIFI/Specification`),

  board('ASUS', 'TUF Gaming Z890-Plus WiFi', 15, 4,
    { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '9066+ MT/s (OC)', m2Slots: '4', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE' },
    [C('asus-tuf-gaming-z890-plus-wifi-lga1851-motherboard-46995'), A('B0DGWNVCHL')],
    `### ASUS TUF Gaming Z890-Plus WiFi

لوحة Z890 من سلسلة TUF: منفذ Thunderbolt 4، وأربعة منافذ M.2، وواي‑فاي 7، وشبكة Intel.

**التقنيات الأساسية المدعومة:**

[green]منفذ Thunderbolt 4 خلفيّ:[/green] Type-C يحمل صورةً وبيانات.

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج، والثلاثة الباقية بالجيل الرابع، مع أربعة منافذ SATA.

[green]واي‑فاي 7 وشبكة Intel بسرعة 2.5 جيجابت:[/green] مثبّتان في اللوحة.

[green]DDR5 حتى 9066+ MT/s كسر سرعة:[/green] مع دعم ذاكرة CUDIMM.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا PCIe 4.0 x1 وفتحة x4 من الشيبست — لبطاقاتٍ صغيرة لا لكرتٍ ثانٍ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شبكة 5 جيجابت.

${alt('Z890_EAGLE', 'لوحة Z890 بواي‑فاي 7 وأربعة منافذ M.2 بسعرٍ أقلّ عادةً.')}
https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-z890-plus-wifi/techspec/`),

  board('ASUS', 'TUF Gaming B860M-Plus WiFi', 10, 3,
    { socket: 'LGA1851', chipset: 'B860', formFactor: 'Micro-ATX', maxRam: '256GB', memorySpeed: '8800+ MT/s (OC)', m2Slots: '3', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '2.5GbE' },
    [C('asus-tuf-gaming-b860m-plus-wifi-lga1851'), A('B0DQ5ZS8NG')],
    `### ASUS TUF Gaming B860M-Plus WiFi

لوحة B860 صغيرة (Micro-ATX) بأربع فتحات ذاكرة وواي‑فاي 7 — لمعالجات Core Ultra 200S في كيسٍ صغير.

**التقنيات الأساسية المدعومة:**

[green]أربع فتحات DDR5 حتى 256 جيجابايت:[/green] بسرعة تصل إلى 8800+ MT/s كسر سرعة.

[green]ثلاثة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج، واثنان بالجيل الرابع، مع أربعة منافذ SATA.

[green]فتحة كرت PCIe 5.0 x16:[/green] من المعالج.

[green]واي‑فاي 7 وشبكة 2.5 جيجابت:[/green] ومنفذ Type-C خلفيّ بسرعة 20 جيجابت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحة توسعةٍ إضافيّة واحدة (PCIe 4.0 x4) بسبب صغر الحجم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كسر سرعة للمعالج — شيبست B860.

${alt('B860M_GPLUS', 'لوحة B860 صغيرة بواي‑فاي 7 بسعرٍ أقلّ عادةً.')}
https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b860m-plus-wifi/techspec/`),

  board('Gigabyte', 'Z890 UD WiFi6E', 15, 3,
    { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '9200 MT/s (OC)', m2Slots: '3', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 6E', lan: '2.5GbE' },
    [C('gigabyte-z890-ud-wifi6e-motherboard-30784'), A('B0DJP8W3BY'), M('gigabyte-z890-ud-wifi6e-lga-1851-atx-motherboard-intel-z890-express-chipset-for-intel-core-ultra-processors-series-2-ddr5-up-to-256gb-ram-1x-pcie-5-0-x16-slot-4x-m-2-slots-z890-ud-wifi6e')],
    `### Gigabyte Z890 UD WiFi6E

مدخل Gigabyte الاقتصاديّ إلى شيبست Z890: كسر سرعة معالجات K ومنفذ USB4، بواي‑فاي 6E.

**التقنيات الأساسية المدعومة:**

[green]شيبست Z890:[/green] كسر سرعة معالجات Core Ultra 200S من فئة K والذاكرة.

[green]منفذ USB4 خلفيّ:[/green] 40 جيجابت مع صورة DisplayPort.

[green]ثلاثة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج، واثنان بالجيل الرابع، مع أربعة منافذ SATA.

[green]واي‑فاي 6E وشبكة Realtek بسرعة 2.5 جيجابت:[/green] مثبّتان في اللوحة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ثلاثة منافذ M.2 — أقلّ من لوحات Z890 الأعلى.
* واي‑فاي 6E لا 7.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليست لكسر سرعة Core Ultra 9 تحت حملٍ طويل — مراحل طاقتها اقتصاديّة.

${alt('Z890_EAGLE', 'أربعة منافذ M.2 وواي‑فاي 7 من الصانع نفسه.')}
https://www.gigabyte.com/Motherboard/Z890-UD-WIFI6E-rev-10/sp`),

  // ================================================================ لوحات AMD
  board('MSI', 'B840 Gaming Plus WiFi', 10, 2,
    { socket: 'AM5', chipset: 'B840', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8000+ MT/s (OC)', m2Slots: '2', pcieVersion: 'PCIe 4.0', wifi: 'Wi-Fi 7', lan: '2.5GbE' },
    [C('msi-b840-gaming-plus-wifi'), A('B0BX6KHN7Y'), M('msi-b840-gaming-plus-wifi-am5-atx-motherboard-amd-b840-chipset-4x-ddr5-udimm-slots-up-to-256gb-max-memory-5x-pcie-x16-slots-2x-m-2-slots-wifi-bt-connectivity-911-7e57-002')],
    `### MSI B840 Gaming Plus WiFi

لوحة AM5 بحجم ATX كامل على أرخص شيبست في المنصّة (B840)، ومعها واي‑فاي 7 — لمعالجات Ryzen دون إنفاقٍ على مزايا لن تُستعمل.

**التقنيات الأساسية المدعومة:**

[green]واي‑فاي 7 وبلوتوث 5.4:[/green] وشبكة Realtek بسرعة 2.5 جيجابت.

[green]أربع فتحات DDR5 حتى 256 جيجابايت:[/green] بسرعة تصل إلى 8000+ MT/s كسر سرعة.

[green]منفذا M.2 من المعالج:[/green] كلاهما بالجيل الرابع x4، مع أربعة منافذ SATA.

[green]ترقيةٌ على AM5:[/green] تدعم Ryzen 7000 و8000 و9000.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحة الكرت بالجيل الرابع، والشيبست نفسه بالجيل الثالث — فتحات التوسعة الإضافيّة بطيئة.
* شريحة صوت Realtek ALC897 أساسيّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كسر سرعة للمعالج (شيبست B840 يسمح بكسر سرعة الذاكرة فقط)، ولا تخزين من الجيل الخامس.

${alt('B850_GPLUS', 'شيبست B850 بفتحة كرتٍ وتخزينٍ من الجيل الخامس وكسر سرعة المعالج.')}
https://www.msi.com/Motherboard/B840-GAMING-PLUS-WIFI/Specification`),

  board('ASUS', 'TUF Gaming B850-E WiFi', 10, 3,
    { socket: 'AM5', chipset: 'B850', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8000+ MT/s (OC)', m2Slots: '3', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 6E', lan: '2.5GbE' },
    [C('asus-tuf-gaming-b850-e-wifi-am5-motherboard-46988'), A('B0F6HB62B4')],
    `### ASUS TUF Gaming B850-E WiFi

لوحة B850 من سلسلة TUF المعروفة بالمتانة، بالجيل الخامس للكرت وأوّل منفذ تخزين.

**التقنيات الأساسية المدعومة:**

[green]PCIe 5.0 للكرت وأوّل منفذ M.2:[/green] كلاهما من المعالج مع Ryzen 9000 و7000.

[green]ثلاثة منافذ M.2:[/green] مع أربعة منافذ SATA.

[green]واي‑فاي 6E وشبكة Realtek بسرعة 2.5 جيجابت:[/green] مثبّتان في اللوحة.

[green]DDR5 حتى 256 جيجابايت:[/green] بسرعة تصل إلى 8000+ MT/s كسر سرعة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا التوسعة الإضافيّتان x1 فقط.
* واي‑فاي 6E لا 7.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا USB4 — حكرٌ على لوحات X870.

${alt('B850_TOMAHAWK', 'أربعة منافذ M.2 وواي‑فاي 7 في لوحة B850 بسعرٍ قريب.')}
https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b850-e-wifi/techspec/`),

  board('Gigabyte', 'X870 Gaming WiFi6', 15, 3,
    { socket: 'AM5', chipset: 'X870', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8200 MT/s (OC)', m2Slots: '3', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 6', lan: '2.5GbE' },
    [C('gigabyte-x870-gaming-wf6-motherboard-30728'), A('B0DHWLN5XT'), M('gigabyte-x870-gaming-wifi6-am5-atx-motherboard-amd-x870-chipset-for-amd-ryzen-9000-8000-7000-series-processors-ddr5-3x-m-2-slots-pcie-5-0-x16-black-x870-gaming-wf6')],
    `### Gigabyte X870 Gaming WiFi6

أرخص لوحات X870 عند Gigabyte: منفذا USB4 وفتحة كرتٍ من الجيل الخامس، بواي‑فاي 6 بدل 7.

**التقنيات الأساسية المدعومة:**

[green]منفذا USB4 خلفيّان:[/green] يحملان صورةً مع المعالجات ذات الرسوميات المدمجة.

[green]PCIe 5.0 للكرت وأوّل منفذ M.2:[/green] من المعالج، ومنفذان آخران بالجيل الرابع من الشيبست.

[green]DDR5 حتى 256 جيجابايت:[/green] أربع فتحات بسرعة تصل إلى 8200 MT/s كسر سرعة.

[green]شبكة Realtek بسرعة 2.5 جيجابت:[/green] مع ستّة رؤوس مراوح.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الواي‑فاي 6 على النطاقين 2.4 و5 جيجاهرتز فقط، بلا نطاق 6 جيجاهرتز.
* مراحل طاقة 8+2+2 — أخفّ من لوحات X870 الأغلى لمعالجات Ryzen 9.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* فتحتا التوسعة الإضافيّتان بالجيل الثالث x1 فقط.

${alt('X870_GAMINGX', 'واي‑فاي 7 ومراحل طاقة 16+2+2 أقوى من الصانع نفسه.')}
https://www.gigabyte.com/Motherboard/X870-GAMING-WIFI6-rev-1x/sp`),

  board('Gigabyte', 'X870 AORUS Stealth', 15, 4,
    { socket: 'AM5', chipset: 'X870', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8200 MT/s (OC)', m2Slots: '4', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '5GbE' },
    [C('gigabyte-x870-aorus-stealth-am5-atx-motherboard-41381'), A('B0GDM6MD5T'), M('gigabyte-x870-aorus-stealth-am5-atx-motherboard-amd-x870-chipset-4x-ddr5-dimm-slots-256gb-max-memory-1x-pcie-5-0-x16-4x-m-2-slots-wifi-7-bt-5-4-x870-a-stealth')],
    `### Gigabyte X870 AORUS Stealth

لوحة X870 بموصلاتٍ خلفيّة (Reverse-Connect): كابلات الكهرباء والمراوح تُركَّب من خلف اللوحة فيبدو الجهاز بلا كابلات.

**التقنيات الأساسية المدعومة:**

[green]موصلات خلفيّة:[/green] واجهة اللوحة نظيفة من الكابلات تماماً.

[green]منفذا M.2 بالجيل الخامس من المعالج:[/green] ومنفذان آخران بالجيل الرابع — أربعة أقراص NVMe.

[green]شبكة Realtek بسرعة 5 جيجابت وواي‑فاي 7:[/green] مع منفذَي USB4.

[green]صوت Realtek ALC1220:[/green] مع مخرج S/PDIF.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 الثاني يتقاسم المسارات مع USB4: إن رُكّب فيه قرصٌ عمل الاثنان بنصف المسارات.
* منفذا SATA فقط، وفتحة PCIe الثانية تتعطّل إن استُعمل منفذ M.2 الرابع.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* تحتاج كيساً يدعم اللوحات ذات الموصلات الخلفيّة — في كيسٍ عاديّ لا تصل الكابلات إليها.

${alt('X870_ELITE', 'المواصفات قريبة بموصلاتٍ عاديّة تركب في أيّ كيس.')}
https://www.gigabyte.com/Motherboard/X870-AORUS-STEALTH/sp`),

  board('ASUS', 'ROG Crosshair X870E Hero', 20, 5,
    { socket: 'AM5', chipset: 'X870E', formFactor: 'ATX', maxRam: '256GB', memorySpeed: '8200+ MT/s (OC)', m2Slots: '5', pcieVersion: 'PCIe 5.0', wifi: 'Wi-Fi 7', lan: '5GbE + 2.5GbE' },
    [C('asus-rog-crosshair-x870e-hero-gaming-motherboard-23090'), A('B0DDZSP2BG'), M('asus-rog-crosshair-x870e-hero-amd-am5-motherboard-ddr5-192gb-max-support-expo-ai-intelligence-wi-fi-7-2-x-usb4-ports-overclocking-support-90mb1ie0-m0eay0')],
    `### ASUS ROG Crosshair X870E Hero

لوحة ROG الرائدة لمعالجات Ryzen: مراحل طاقة 18+2+2، وخمسة منافذ M.2 ثلاثةٌ منها بالجيل الخامس، وشبكتان سلكيّتان.

**التقنيات الأساسية المدعومة:**

[green]مراحل طاقة 18+2+2:[/green] لمعالجات Ryzen 9 تحت كسر السرعة والحمل الطويل.

[green]خمسة منافذ M.2:[/green] ثلاثة بالجيل الخامس من المعالج واثنان بالجيل الرابع، ومنفذ SlimSAS وأربعة منافذ SATA.

[green]شبكتان سلكيّتان (5 و2.5 جيجابت) وواي‑فاي 7:[/green] Realtek وIntel.

[green]منفذا USB4 بسرعة 40 جيجابت:[/green] مع فتحتَي كرتٍ من الجيل الخامس.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* تشغيل منفذَي M.2 الثاني أو الثالث (الجيل الخامس) يُنزل فتحة الكرت الأولى إلى x8.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعرها لكسر السرعة والمنافذ — لا تزيد فريمات الألعاب على لوحة X870 أرخص.

${alt('X870E_E', 'شيبست X870E وخمسة منافذ M.2 بسعرٍ أقلّ عادةً.')}
https://rog.asus.com/motherboards/rog-crosshair/rog-crosshair-x870e-hero/spec/`),

  // ================================================================ المعالج
  {
    categoryId: CPU, brand: 'Intel', name: 'Core i3-14100', tdpWattage: 110, performanceTier: 1,
    specs: { socket: 'LGA1700', tdpW: 60, cores: '4', threads: '8', pCores: 4, eCores: 0, baseClock: '3.5 GHz', boostClock: '4.7 GHz', l3Cache: '12MB', architecture: 'Raptor Lake Refresh', memorySupport: 'DDR5-4800 / DDR4-3200', includedCooler: 'Laminar RM1', integratedGraphics: 'Intel UHD 730' },
    offers: [C('intel-core-i3-14100-cpu-aa16601'), A('B0CQ2ZLXB4')],
    description: `### Intel Core i3-14100

معالج اقتصاديّ بأربع أنوية وثماني مسارات، ومعه رسوميات مدمجة ومبرّدٌ في العلبة — يشغّل جهازاً مكتبيّاً كاملاً دون كرت شاشة.

**التقنيات الأساسية المدعومة:**

[green]رسوميات Intel UHD 730 مدمجة:[/green] الجهاز يعمل دون كرت شاشة — للمكتب والدراسة والأفلام، أو مؤقتاً حتى تشتري الكرت.

[green]مبرّد Laminar RM1 في العلبة:[/green] يكفيه، فلا حاجة لمبرّدٍ إضافيّ.

[green]DDR5 أو DDR4:[/green] يعمل على لوحات LGA1700 بأيٍّ من الذاكرتين.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* أربع أنوية فقط: تكفي ألعاب الرياضات الإلكترونيّة، لكنّ ألعاب العالم المفتوح الحديثة تتقطّع معها.
* الرسوميات المدمجة لا تصلح للألعاب الحديثة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* مقبس LGA1700 انتهى بهذا الجيل — لا ترقية لمعالجات Intel الأحدث على اللوحة نفسها.

${alt('I5_14400F', 'عشر أنوية للألعاب الحديثة مع كرت شاشة منفصل.')}
https://www.intel.com/content/www/us/en/products/sku/236774/intel-core-i3-processor-14100-12m-cache-up-to-4-70-ghz/specifications.html`,
  },

  // ================================================================ المبرّدات
  {
    categoryId: COOL, brand: 'MSI', name: 'MPG CoreLiquid P13 360', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'Black', features: ['شاشة IPS مقاس 2.1 بوصة بدقّة 480×480'] },
    offers: [C('msi-mpg-coreliquid-p13-360-360mm-argb-aio-liquid-cooler-ips-2-1-lcd-triple-120mm-pwm-fans-black-41615'), A('B0FBRQ2D76')],
    description: `### MSI MPG CoreLiquid P13 360

مبرّد مائيّ 360 مم بشاشة IPS دائريّة في الرأس — تعرض حرارة المعالج أو صورةً من اختيارك.

**التقنيات الأساسية المدعومة:**

[green]شاشة IPS مقاس 2.1 بوصة:[/green] بدقّة 480×480 وسطوع 600 شمعة.

[green]رادييتر 360 مم بثلاث مراوح 120 مم:[/green] تكفي معالجات Core i7 وRyzen 7 تحت الحمل الطويل.

[green]مضخّة 3400 دورة:[/green] بضوضاء 20 ديسيبل.

[green]إضاءة ARGB:[/green] في المراوح، تُضبط من اللوحة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المراوح بمحامل Rifle — عمرها المقدّر أقصر من محامل FDB.
* الرادييتر رفيع (27 مم).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* المقابس المدعومة: AM5 وAM4 وLGA1851 وLGA1700 فقط — لا LGA1200 ولا الأقدم.

${alt('MYSTIQUE_360', 'مبرّد 360 مم بشاشةٍ أكبر (2.8 بوصة) بسعرٍ أقلّ عادةً.')}
https://www.msi.com/Liquid-Cooling/MPG-CORELIQUID-P13/Specification`,
  },
  {
    categoryId: COOL, brand: 'MSI', name: 'MAG CoreLiquid E240', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'AIO', sizeMm: '240', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', fanCount: '2', fanSize: '120mm', rgb: 'Yes', color: 'Black' },
    offers: [C('msi-mag-coreliquid-e240-cpu-liquid-cooler-21851'), A('B0CC5DT54L')],
    description: `### MSI MAG CoreLiquid E240

مبرّد مائيّ 240 مم بمروحتين ARGB ورأسٍ يدور ليستقيم شعاره في أيّ اتجاه — للمعالجات المتوسّطة.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 240 مم بمروحتين 120 مم:[/green] لمعالجات Core i5 وRyzen 5 و7.

[green]مراوح FDB حتى 75 CFM:[/green] بعمرٍ مقدّر 50 ألف ساعة.

[green]مضخّة 3000 دورة بضوضاء 20 ديسيبل:[/green] وقاعدة نحاسيّة.

[green]إضاءة ARGB:[/green] في الرأس والمراوح.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 240 مم لا تكفي معالجات i9 وRyzen 9 تحت الحمل الطويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة في الرأس.

${alt('LE240', 'مبرّد 240 مم آخر بسعرٍ أقلّ عادةً.')}
https://www.msi.com/Liquid-Cooling/MAG-CORELIQUID-E240/Specification`,
  },
  {
    categoryId: COOL, brand: 'ASUS', name: 'ROG Strix LC III 360 ARGB LCD', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'Black', features: ['شاشة IPS مقاس 2.1 بوصة تدور 360 درجة'] },
    offers: [C('asus-rog-strix-lc-iii-360-argb-lcd-aio-liquid-cooler-40307'), A('B0DC1WB2RM')],
    description: `### ASUS ROG Strix LC III 360 ARGB LCD

مبرّد مائيّ 360 مم بمضخّة Asetek من الجيل السابع وشاشة IPS تدور مع اتّجاه الرأس.

**التقنيات الأساسية المدعومة:**

[green]مضخّة Asetek Gen7 V2:[/green] منصّةٌ مجرّبة في مبرّداتٍ كثيرة.

[green]شاشة IPS مقاس 2.1 بوصة:[/green] بدقّة 480×480، وصورتها تدور 360 درجة.

[green]ثلاث مراوح ROG Strix AF-12S ARGB:[/green] حتى 2200 دورة، وتتوقّف عند الحمل الخفيف.

[green]ضمان ستّ سنوات:[/green] ومعجون حراريّ مطبّق مسبقاً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المراوح تصل إلى 36 ديسيبل بأقصى سرعتها.
* الرادييتر رفيع (27 مم).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعره للشاشة والاسم — مبرّداتٌ بالحجم نفسه دونها أرخص.

${alt('MYSTIQUE_360', 'مبرّد 360 مم بشاشةٍ أكبر (2.8 بوصة) بسعرٍ أقلّ عادةً.')}
https://rog.asus.com/cooling/cpu-liquid-coolers/rog-strix-lc/rog-strix-lc-iii-360-argb-lcd/spec/`,
  },
  {
    categoryId: COOL, brand: 'Corsair', name: 'iCUE LINK TITAN 240 RX RGB', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '240', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '2', fanSize: '120mm', rgb: 'Yes', color: 'Black' },
    offers: [C('corsair-icue-link-titan-240-rx-rgb-liquid-cpu-cooler-black-24358'), A('B0D6BF3RXL')],
    description: `### Corsair iCUE LINK TITAN 240 RX RGB

مبرّد مائيّ 240 مم من نظام iCUE LINK: المراوح والمضخّة تتّصل ببعضها بكابلٍ واحد إلى موزّعٍ مرفق.

**التقنيات الأساسية المدعومة:**

[green]مضخّة FlowDrive بمحرّكٍ ثلاثيّ الأطوار:[/green] وقاعدة نحاسيّة بمعجون XTM70 مطبّق مسبقاً.

[green]مروحتا RX120 RGB بمحامل مغناطيسيّة:[/green] من 300 إلى 2100 دورة.

[green]كابلٌ واحد لكلّ شيء:[/green] نظام iCUE LINK يقلّل الكابلات، والموزّع (System Hub) في العلبة.

[green]ضمان ستّ سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الإضاءة والسرعة تُضبطان من برنامج iCUE لا من اللوحة.
* 240 مم لا تكفي معالجات i9 وRyzen 9 تحت الحمل الطويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* مراوح iCUE LINK لا تعمل إلا مع موزّع Corsair — لا تُستبدل بمراوح عاديّة مباشرة.

${alt('KRAKEN_CORE_240', 'مبرّد 240 مم بإضاءة RGB بسعرٍ أقلّ عادةً.')}
https://www.corsair.com/us/en/p/cpu-coolers/cw-9061016-ww/icue-link-titan-240-rx-rgb-aio-liquid-cpu-cooler-cw-9061016-ww`,
  },

  // ================================================================ المزوّدات
  {
    categoryId: PSU, brand: 'NZXT', name: 'C1000 Gold Core', tdpWattage: 0, performanceTier: 5,
    specs: { wattage: '1000', rating: '80+ Gold', modularity: 'Full', formFactor: 'ATX 3.1', color: 'Black', qualityTier: 'A' },
    offers: [C('nzxt-atx-3-1-1000w-80-plus-gold-fully-modular-black-39669'), M('nzxt-c1000-gold-core-fully-modular-power-supply-1000w-power-80-plus-gold-efficiency-2-300-rpm-fan-speed-103-36-cfm-airflow-135mm-fan-fluid-dynamic-bearing-atx-3-1-black-pa-0g3bb-uk')],
    description: `### NZXT C1000 Gold Core

إصدار 2025 الأرخص من مزوّدات NZXT بقدرة 1000 واط: ATX 3.1 وكابل 16 سنّاً، وهدوءٌ لافت.

**التقنيات الأساسية المدعومة:**

[green]كابل 12V-2x6 (600 واط) وثلاثة كابلات 6+2:[/green] للكروت الحديثة والقديمة معاً.

[green]معيار ATX 3.1:[/green] يتحمّل قفزات الاستهلاك اللحظيّة للكروت الحديثة.

[green]هادئ جداً:[/green] تصنيف ضوضاء Cybenetics ‏A+، ومروحة 135 مم بمحمل FDB تتوقّف تحت الحمل الخفيف.

[green]كفاءة Cybenetics Platinum:[/green] وكابلات منفصلة بالكامل، بطول 150 مم فقط.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ضمان سبع سنوات — أقلّ من عشر سنوات في سلسلة C Gold الأغلى.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة ولا إضاءة — مزوّدٌ عمليّ.

${alt('GF3_1000', 'درجة جودةٍ أعلى (A+) في تقييم SPL للقدرة نفسها.')}
https://nzxt.com/products/c1000-gold-core`,
  },
  {
    categoryId: PSU, brand: 'NZXT', name: 'C1200 Gold ATX 3.1', tdpWattage: 0, performanceTier: 5,
    specs: { wattage: '1200', rating: '80+ Gold', modularity: 'Full', formFactor: 'ATX 3.1', color: 'Black', qualityTier: 'A+' },
    offers: [C('nzxt-3-1-atx-1200w-80-plus-gold-full-modular-psu-black-50095'), A('B0DCHZYWL1'), M('nzxt-c1200-gold-atx-3-1-1200w-fully-modular-power-supply-80-plus-gold-efficiency-135mm-fluid-dynamic-bearing-fan-2300-rpm-fan-speed-93-02-cfm-airflow-japanese-capacitors-black-pa-2g2bb-uk')],
    description: `### NZXT C1200 Gold ATX 3.1

مزوّد 1200 واط بدرجة A+ في تقييم SPL — لجهازٍ بكرت RTX 5090 أو معالجٍ ثقيل، بضمان عشر سنوات.

**التقنيات الأساسية المدعومة:**

[green]درجة A+ في تقييم SPL:[/green] من أعلى درجات الجودة لهذه القدرة.

[green]كابل 12V-2x6 (600 واط) وثلاثة كابلات 6+2:[/green] لكرت RTX 50 دون محوّلات.

[green]مروحة 135 مم بمحمل FDB:[/green] تتوقّف تماماً تحت 50% من الحمل.

[green]ضمان عشر سنوات:[/green] ومكثّفات يابانيّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* طوله 160 مم — أطول قليلاً من مزوّدات 150 مم، فتأكّد من الكيس.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* 1200 واط أكثر من حاجة معظم الأجهزة — جهازٌ بكرتٍ متوسّط لا يستفيد منها.

${alt('PQ1200G', '1200 واط بسعرٍ أقلّ عادةً، بدرجة جودةٍ أقلّ (A-).')}
https://nzxt.com/products/c1200-gold-atx`,
  },
  {
    categoryId: PSU, brand: 'Lian Li', name: 'EDGE Gold 1000W', tdpWattage: 0, performanceTier: 5,
    specs: { wattage: '1000', rating: '80+ Gold', modularity: 'Full', formFactor: 'ATX 3.1', color: 'Black', qualityTier: 'A' },
    offers: [C('lian-li-edge-80-plus-gold-1000w-power-supply-with-usb-hub-black-27115'), A('B0DX2X41MH')],
    description: `### Lian Li EDGE Gold 1000W

مزوّد 1000 واط بتصميمٍ على شكل L: موصلاته على الجانب، ومعه موزّع USB ومراوح — لأكياس Lian Li المزدوجة الحجرة.

**التقنيات الأساسية المدعومة:**

[green]موصلات جانبيّة:[/green] الكابلات تخرج من جانب المزوّد فتختفي خلف اللوحة.

[green]موزّع EDGE Hub مرفق:[/green] ستّة رؤوس مراوح وعدّة منافذ USB داخليّة.

[green]درجة A في تقييم SPL:[/green] وكفاءة Cybenetics Gold.

[green]معيار ATX 3.1 وكابل 12V-2x6 (600 واط).[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* طوله 182 مم وشكله غير معتاد — مصمّمٌ لأكياسٍ بعينها، فتأكّد من التوافق.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب الأكياس الصغيرة أو ذات غطاء المزوّد الضيّق.

${alt('RM1000X_SHIFT', 'موصلات جانبيّة أيضاً بتصميمٍ عاديّ يركب في معظم الأكياس، ودرجة A+.')}
https://lian-li.com/product/edge-gold/`,
  },
  {
    categoryId: PSU, brand: 'MSI', name: 'MAG A850GL PCIe 5 White', tdpWattage: 0, performanceTier: 4,
    specs: { wattage: '850', rating: '80+ Gold', modularity: 'Full', formFactor: 'ATX 3.0', color: 'White', qualityTier: 'B' },
    offers: [C('msi-mag-a850gl-pcie5-850w-80-plus-gold-modular-psu-white-19649'), A('B0CFYHHPPV')],
    description: `### MSI MAG A850GL PCIe 5 White

النسخة البيضاء من مزوّد MSI الشائع بقدرة 850 واط: كابلات بيضاء منفصلة بالكامل، وكابل 16 سنّاً للكروت الحديثة.

**التقنيات الأساسية المدعومة:**

[green]كابل PCIe 5.0 بـ16 سنّاً (600 واط):[/green] وأربعة كابلات 6+2 للكروت القديمة.

[green]كابلات بيضاء منفصلة بالكامل:[/green] لجهازٍ أبيض متناسق.

[green]80+ Gold:[/green] بكفاءة تصل إلى 90%.

[green]طوله 140 مم:[/green] يدخل معظم الأكياس.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* درجة B في تقييم SPL — حماياتٌ أقلّ ضبطاً من مزوّدات الفئة الأعلى.
* معيار ATX 3.0 لا 3.1، ومروحة 120 مم أعلى صوتاً تحت الحمل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا وضع إيقاف المروحة الكامل.

${alt('RM850E_WHITE', 'مزوّد 850 واط أبيض بدرجة جودةٍ أعلى (B+) ومعيار ATX 3.1.')}
https://www.msi.com/Power-Supply/MAG-A850GL-PCIE5-WHITE/Specification`,
  },

  // ================================================================ الصناديق
  {
    categoryId: CASE, brand: 'ASUS', name: 'Prime AP202 ARGB', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Micro-ATX Tower', maxGpuLength: '420', maxCoolerHeight: '175', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '3x 120mm ARGB', color: 'Black' },
    offers: [C('asus-ap202-microatx-argb-case'), A('B0FCMZQ4XF')],
    description: `### ASUS Prime AP202 ARGB

كيس Micro-ATX بزجاجٍ منحنٍ في الواجهة والجانب وثلاث مراوح ARGB — صغير الحجم ويتّسع لكروتٍ طويلة.

**التقنيات الأساسية المدعومة:**

[green]كرت حتى 420 مم:[/green] رغم صغر الكيس.

[green]رادييتر 360 مم في السقف:[/green] ومبرّد هواء حتى 175 مم.

[green]ثلاث مراوح 120 مم ARGB مركّبة:[/green] اثنتان في الجانب وواحدة في الخلف.

[green]منفذ Type-C أماميّ بسرعة 20 جيجابت:[/green] مع منفذَي USB-A.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الواجهة زجاجيّة — الهواء يدخل من الجانب والأسفل.
* مكانان فقط للأقراص التقليديّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات ATX — Micro-ATX وMini-ITX فقط.

${alt('VISION_M', 'كيس Micro-ATX بانوراميّ بحجرتين منفصلتين.')}
https://www.asus.com/motherboards-components/cases/prime/asus-prime-ap202-argb/techspec/`,
  },
  {
    categoryId: CASE, brand: 'Gamdias', name: 'Atlas E1 White', tdpWattage: 0, performanceTier: 2,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '340', maxCoolerHeight: '160', radiatorSupport: '240mm', psuFormFactor: 'ATX', includedFans: '3x 120mm ARGB', color: 'White', screen: 'شاشة حرارة صغيرة' },
    offers: [C('atlas-e1-white-case'), A('B0D5D4XYJH')],
    description: `### GAMDIAS Atlas E1 White

كيس اقتصاديّ أبيض بزجاجٍ في الواجهة والجانب، وثلاث مراوح ARGB، وشاشةٍ صغيرة تعرض حرارة المعالج والكرت.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح 120 مم ARGB:[/green] اثنتان تحت غطاء المزوّد تدفعان الهواء إلى الأعلى، وواحدة في الخلف.

[green]شاشة حرارة:[/green] تعرض حرارة المعالج أو الكرت أو الغرفة عبر برنامج ZEUS CAST.

[green]موزّع مراوح ARGB مركّب:[/green] بستّة منافذ.

[green]يقبل لوحات ATX:[/green] وMicro-ATX وMini-ITX.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* كرت حتى 340 مم فقط — بعض كروت RTX 5070 Ti وما فوقها أطول.
* رادييتر حتى 240 مم في السقف، ومبرّد هواء حتى 160 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رادييتر 360 مم.

${alt('AIR903_BASE', 'كيس أبيض اقتصاديّ آخر يقبل رادييتر 360 مم وكروتاً حتى 400 مم.')}
https://www.gamdias.com/en/component/case/ATLAS_E1_WH`,
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

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log(`\n${PARTS.length} قطعة — (عرضٌ فقط — أضف --apply)`); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-batch3-${stamp}.json`, JSON.stringify(PARTS, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch3-${stamp}.json`);

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

console.log(`\nالتالي (واحدةً واحدة):\n  ${ids.join(' ')}`);
await prisma.$disconnect();
