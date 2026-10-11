/**
 * ============ الدفعة السادسة عشرة — قطعٌ بمتجرين أو أكثر (٢٨ قطعة + عرضان) — 2026-10-10 ============
 *
 * طلب نوّاف: «جيب جمع قطع فيها متجرين او اكثر كحد ادنى» ثمّ «ضيفها كلها ولا تنسى تتاكد من الوصف والمواصفات».
 * الجدول كان ٣٠؛ استُبعد اثنان:
 *   − ASUS TUF GT502 PLUS White: صفحة أمازون تحمل نقاط GT502 القديم (USB-C 10Gbps) ولا يتبيّن أهي نسخة ARGB بأربع مراوح أم لا.
 *   − Fractal Torrent Compact RGB: صفحتها حُذفت من موقع Fractal (متوقّفة) فلا مصدر رسميّ للمواصفات — كاستبعاد Elite 481 Wood.
 *
 * التحقّق (كلّه اليوم):
 *   - أمازون: كلّ ASIN فُتح (زرّ الشراء، Model name/اللون). O11D EVO XL الأسود «Temporarily out of stock» — أُبقي رابطه، والمتوفّر مايكرولس + جرير.
 *   - مايكرولس: JSON-LD = InStock لكلّ رابط، والـmpn/رمز الطراز في الرابط.
 *   - إنفيني آرك: #stickyBarAddToCart = «Add to Cart» لكلّ رابط. A21 PLUS عندهم 90DC00H3-B19000 وفي أمازون/مايكرولس -B19010 (اللاحقة إقليميّة، الطراز H3 الأبيض نفسه).
 *   - المواصفات من صفحات الشركات: Gigabyte (بالمتصفّح؛ نسخ اللوحات rev 1.3/1.x/1.2)، ASUS/ROG (WebFetch)، MSI (بالمتصفّح)،
 *     Corsair وNZXT وFractal (WebFetch)، Lian Li (بحث + صفحة SUP01). عند التعارض الأحوط: Corsair 3500X كرت 425 عند Corsair و410 عند مايكرولس ⇒ 410.
 *   - SUP01: ارتفاع المبرّد الهوائيّ 88.2 مم فقط (جدول Lian Li ومايكرولس) — الكيس للمبرّدات المائيّة.
 *
 * وعرضان إضافيّان لقطعتين قائمتين: مايكرولس لـ ROG Strix B650E-F (له أمازون وحده) ولـ ROG Strix Z890-E (متوفّر 3198.6).
 *
 *   node scripts/add-batch16-2026-10-10.mjs           # عرض
 *   node scripts/add-batch16-2026-10-10.mjs --apply   # تنفيذ
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

const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });
const M = (slug) => ({ store: 'microless', url: `https://saudi.microless.com/product/${slug}/` });
const I = (path) => ({ store: 'infiniarc', url: `https://www.infiniarc.com/shop/${path}` });
const J = (slug) => ({ store: 'jarir', url: `https://www.jarir.com/sa-en/${slug}.html` });

const ALT = {
  B860E: ['Gigabyte B860 Eagle WiFi6E', 'cmv2qbin200006symz9e1x8ug'],
  X870GX: ['Gigabyte X870 Gaming X WiFi7', 'cmuzoq0f3000dnoymfryaju1y'],
  Z890A: ['ASUS ROG Strix Z890-A Gaming WiFi White', 'cmtjkyszt001370ymp5mxtbyo'],
  TUFZ890: ['ASUS TUF Gaming Z890-Plus WiFi', 'cmuzs9z3f000fu8ymy90to4j9'],
  PROZ890A: ['MSI PRO Z890-A WiFi', 'cmuzs9yft0009u8ymvn1y50lx'],
  B850GP: ['MSI B850 GAMING PLUS WiFi', 'cmsxdaibx0006skymhs0llh1k'],
  B650TH: ['MSI MAG B650 TOMAHAWK WIFI', 'cmpi1czn4000204l76f6pg7jr'],
  STRIXLC: ['ASUS ROG Strix LC III 360 ARGB White', 'cmuzv442e0016pcym6m417hxz'],
  C6500DB: ['Corsair 6500D Airflow Black', 'cmv2qbj4e00046symu4ydoavl'],
  C5000D: ['Corsair 5000D Airflow', 'cmpiec081002h00ymnwss7xit'],
  FRAMEB: ['Corsair FRAME 4500X RS-R ARGB Black', 'cmv1ese3o00068oymqtxm1pv0'],
  FRAMEW: ['Corsair FRAME 4500X RS-R ARGB White', 'cmv1eseeu00098oymdor0j2x0'],
  H6RGBW: ['NZXT H6 Flow RGB White', 'cmpieb3if000d00ymz13tdkyt'],
  VISIONB: ['Lian Li O11 Vision Compact Black', 'cmv0io7l700000symau5sst8e'],
  A23W: ['ASUS A23 PLUS White', 'cmtjkyn2i000r70ympwjtro2d'],
  O11EVO: ['Lian Li O11 Dynamic EVO', 'cmpieb3ts000e00ymflyrzgd2'],
  NORTHXL: ['Fractal Design North XL', 'cmpieb4ax000g00ymgj1zamtu'],
  X50W: ['HYTE X50 Air Snow White', 'cmuztru610006kcym27wmpqvu'],
};
const alt = (k, ...why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const MOVE = [];
const EXTRA = [
  { id: 'cmpfzir170009x4ymcefw7ao7', name: 'ROG STRIX B650E-F GAMING WIFI', offer: M('asus-rog-strix-b650e-f-gaming-wifi-atx-motherboard-am5-socket-amd-b650-chipset-intel-2-5gb-ethernet-4-x-2-channel-ddr5-128gb-max-1xpcie-5-0x16-3xm-2-pcie-usb-2-0-3-2-1xhdmi-dp-b650e-f-g-wifi') },
  { id: 'cmr2k5vko0004jgymduvqft9q', name: 'ROG STRIX Z890-E Gaming WiFi', offer: M('asus-rog-strix-z890-e-gaming-wi-fi-lga-1851-atx-motherboard-intel-z890-chipset-4x-ddr5-dimm-slot-up-to-192gb-max-memory-wi-fi-7-bt-5-4-1x-pcie-5-0-x16-7x-m-2-slots-black-90mb1im0-m0eay0') },
];

const INTEL_B860 = { socket: 'LGA1851', chipset: 'B860', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', wifi: 'Wi-Fi 6E', lan: '2.5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '9066 MT/s (OC)' };

const PARTS = [
  /* ============================== لوحات أمّ ============================== */
  {
    categoryId: MB, brand: 'Gigabyte', name: 'B860 Gaming X WiFi6E', tdpWattage: 10, performanceTier: 3,
    specs: { ...INTEL_B860, m2Slots: '3' },
    offers: [
      A('B0DQLLLHYY'),
      M('gigabyte-b860-gaming-x-wifi6e-lga-1851-atx-motherboard-4x-dimm-ddr5-slots-up-to-256gb-max-memory-1x-pcie-5-0-x16-3x-m-2-slots-wi-fi-6e-bt-5-3-connectivity-b860-gaming-x-wifi6e'),
      I('board/b860-gaming-x-wifi6e-1-0-gigabyte-b860-gaming-x-wifi6e-intel-ultra-ddr5-motherboard-10260'),
    ],
    description: `### Gigabyte B860 GAMING X WIFI6E

لوحة ATX على شيبست B860 لمعالجات Intel Core Ultra (السلسلة 200)، تتميّز عن أخواتها في الفئة بمنفذ **USB4** خلفيّ. تناسب تجميعة ألعابٍ بمعالج Core Ultra 5 أو 7 لمن يحتاج منفذاً سريعاً لقرص خارجيّ أو شاشة إضافيّة.

**التقنيات الأساسية المدعومة:**

[green]منفذ USB4 خلفيّ متّصل بالمعالج:[/green] نقلٌ حتى 40 جيجابت/ث لأقراص خارجيّة سريعة، ويُخرج صورة DisplayPort 2.1 أيضاً — مع HDMI وDisplayPort تدعم اللوحة ثلاث شاشات من رسوميّات المعالج.

[green]ثلاثة منافذ M.2 أحدها من الجيل الخامس:[/green] قرص NVMe من الجيل الخامس على المنفذ المتّصل بالمعالج، ومنفذان من الجيل الرابع عبر الشيبست.

[green]منفذ كرت شاشة PCIe 5.0 بعرض x16:[/green] متّصل بالمعالج، فلا يُخنق أيّ كرت حاليّ.

[green]ذاكرة DDR5 حتى 256 جيجابايت و9066 MT/s كسر سرعة:[/green] أربعة منافذ بأطقم حتى 64 جيجابايت للشريحة، مع XMP.

[green]واي‑فاي 6E وبلوتوث 5.3 وشبكة Realtek 2.5 جيجابت:[/green] اتّصال لاسلكيّ على نطاق 6GHz وسلكيّ أسرع من الجيجابت.

[green]ثلاث ترويسات ARGB Gen2 وزرّ Q-Flash Plus:[/green] إضاءة المراوح من اللوحة، وتحديث BIOS بلا معالج.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ المنفذ الرئيسيّ يقبل **كرت شاشة أو قرص NVMe فقط** بحسب Gigabyte، والمنفذان الآخران بطول x16 يعملان بسرعة x1.
* شريحة الواي‑فاي بحسب نسخة اللوحة: Intel AX211 (النسخة 1.0) أو Realtek RTL8852CE (النسخة 1.1).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* شيبست B860 لا يدعم كسر سرعة المعالج (كسر سرعة الرام مدعوم).
* لا تقبل معالجات LGA1700.

${alt('B860E', 'اللوحة الأقرب من Gigabyte بالمنافذ نفسها تقريباً وبسعرٍ أقلّ، إن لم تحتج منفذ USB4.')}
https://www.gigabyte.com/Motherboard/B860-GAMING-X-WIFI6E/sp`,
  },
  {
    categoryId: MB, brand: 'Gigabyte', name: 'B860 DS3H WiFi6E', tdpWattage: 10, performanceTier: 2,
    specs: { ...INTEL_B860, m2Slots: '2' },
    offers: [
      A('B0DQLL6Z51'),
      M('gigabyte-b860-ds3h-wifi6e-lga-1851-atx-motherboard-intel-b860-express-chipset-4x-ddr5-dimm-slot-up-to-256gb-max-memory-1x-pcie-5-0-x16-2x-m-2-slots-wi-fi-6e-bt-5-3-b860-ds3h-wifi6e'),
      I('board/b860-ds3h-wifi6e-1-3-gigabyte-b860-ds3h-wifi6e-intel-lga-1851-ddr5-atx-black-motherboard-13269'),
    ],
    description: `### Gigabyte B860 DS3H WIFI6E

لوحة ATX اقتصاديّة كاملة الحجم من Gigabyte على شيبست B860 مع واي‑فاي، لمعالجات Intel Core Ultra (السلسلة 200). تناسب تجميعة اقتصاديّة بمعالج Core Ultra 5 225F أو 245K لمن يريد حجم ATX بسعر لوحةٍ صغيرة.

**التقنيات الأساسية المدعومة:**

[green]منفذ M.2 من الجيل الخامس متّصل بالمعالج:[/green] يقبل أسرع أقراص NVMe الحاليّة، ومعه منفذ ثانٍ من الجيل الرابع.

[green]منفذ كرت شاشة PCIe 5.0 بعرض x16:[/green] لا يحدّ من أداء أيّ كرت شاشة.

[green]ذاكرة DDR5 حتى 256 جيجابايت و9066 MT/s كسر سرعة:[/green] أربعة منافذ مع XMP؛ نفس سقف الذاكرة في لوحات الفئة الأعلى.

[green]واي‑فاي 6E وشبكة Realtek 2.5 جيجابت:[/green] اتّصالٌ كامل بلا بطاقة إضافيّة، وهي ميزة نادرة في هذا السعر.

[green]منفذ USB-C خلفيّ بسرعة 20 جيجابت (Gen 2x2) وأربعة منافذ توسعة x1:[/green] مكان لبطاقة صوت أو التقاط أو شبكة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **منفذا M.2 فقط** — القرص الثالث يحتاج منفذ SATA (أربعة متاحة).
* المنفذ الرئيسيّ يقبل كرت شاشة أو قرص NVMe فقط، وبقيّة المنافذ x1.
* شريحة الواي‑فاي بحسب النسخة: Intel AX211 أو Realtek RTL8852CE (النسخة 1.3).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدعم كسر سرعة المعالج، ومراحل الطاقة أبسط من لوحات الفئة الأعلى — لا تناسب Core Ultra 9 تحت حملٍ طويل.
* لا تقبل معالجات LGA1700.

${alt('B860E', 'ثلاثة منافذ M.2 بدل اثنين، بفارق سعرٍ صغير.')}
https://www.gigabyte.com/Motherboard/B860-DS3H-WIFI6E-rev-13/sp`,
  },
  {
    categoryId: MB, brand: 'Gigabyte', name: 'X870 Eagle WiFi7', tdpWattage: 10, performanceTier: 3,
    specs: { socket: 'AM5', chipset: 'X870', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '3', wifi: 'Wi-Fi 7', lan: '2.5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '8200 MT/s (OC)' },
    offers: [
      A('B0DGVMYTW6'),
      M('gigabyte-x870-eagle-wifi7-motherboard-amd-socket-am5-4x-ddr5-dimm-slots-amd-x870-chipset-ddr5-up-to-256gb-memory-ez-latch-plus-3-x-m-2-slots-x870-eagle-wifi7'),
      I('board/x870-eagle-wifi7-1-1-gigabyte-x870-eagle-am5-wifi7-ddr5-black-motherboard-10395'),
    ],
    description: `### Gigabyte X870 EAGLE WIFI7

أرخص لوحات X870 من Gigabyte لمنصّة AM5: كرت شاشة PCIe 5.0، ومنفذا USB4، وواي‑فاي 7. تناسب تجميعة ألعابٍ بمعالج Ryzen 7 9800X3D أو 9700X لمن يريد مزايا X870 دون سعر لوحات AORUS.

**التقنيات الأساسية المدعومة:**

[green]منفذ كرت شاشة PCIe 5.0 بعرض x16:[/green] مع معالجات Ryzen 9000 و7000، بتصميم PCIe UD Slot المقوّى للكروت الثقيلة.

[green]منفذا USB4 خلفيّان (40 جيجابت):[/green] شرطٌ في شيبست X870، لأقراص خارجيّة سريعة وإخراج الصورة.

[green]منفذ M.2 من الجيل الخامس متّصل بالمعالج:[/green] ومعه منفذان من الجيل الرابع عبر الشيبست.

[green]واي‑فاي 7 وبلوتوث 5.4 وشبكة 2.5 جيجابت:[/green] شريحة MediaTek MT7925 أو Realtek RTL8922AE بحسب نسخة اللوحة.

[green]ذاكرة DDR5 حتى 256 جيجابايت و8200 MT/s كسر سرعة:[/green] مع EXPO وXMP، ومراحل طاقة رقميّة 14+2+2 بحسب Gigabyte.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ منفذا M.2 الشيبست **يتشاركان النطاق**: عند تركيب قرصين يعمل M2B بسرعة x2.
* مزايا الواي‑فاي 7 الكاملة تحتاج ويندوز 11 الحديث، ولا تعريف لها على ويندوز 10.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* منفذا التوسعة الآخران من الجيل الثالث بسرعة x1 فقط.
* لا تقبل معالجات AM4.

${alt('X870GX', 'اللوحة الأعلى درجة في سلسلة Gigabyte X870 بتبريدٍ أوسع لمراحل الطاقة.')}
https://www.gigabyte.com/Motherboard/X870-EAGLE-WIFI7-rev-1x/sp`,
  },
  {
    categoryId: MB, brand: 'ASUS', name: 'ROG Strix Z890-F Gaming WiFi', tdpWattage: 15, performanceTier: 4,
    specs: { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '5', wifi: 'Wi-Fi 7', lan: '2.5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '9066+ MT/s (OC)' },
    offers: [
      A('B0DJDFR3L5'),
      M('asus-rog-strix-z890-f-gaming-wi-fi-lga-1851-atx-motherboard-intel-z890-chipset-4x-ddr5-dimm-slot-up-to-192gb-max-memory-wi-fi-7-bt-5-4-1x-pcie-5-0-x16-slot-5x-m-2-slots-90mb1i40-m0eay0'),
      I('board/90mb1i40-m0eay0-asus-rog-strix-z890-f-gaming-ddr5-lga1851-gaming-wifi-intel-motherboard-9216'),
    ],
    description: `### ASUS ROG Strix Z890-F Gaming WiFi

لوحة ROG Strix سوداء على شيبست Z890 لمعالجات Intel Core Ultra (السلسلة 200)، بخمسة منافذ M.2 ومنفذَي Thunderbolt 4. تناسب Core Ultra 7 265K أو Ultra 9 285K لمن يريد كسر السرعة ومنافذ كثيرة دون سعر لوحات Hero.

**التقنيات الأساسية المدعومة:**

[green]كسر سرعة المعالج والذاكرة:[/green] شيبست Z890 يفتح معالجات K، والرام حتى 9066+ MT/s مع ذاكرة CUDIMM.

[green]خمسة منافذ M.2 كلّها بعرض x4:[/green] منفذ من الجيل الخامس ومنفذ من الرابع متّصلان بالمعالج، وثلاثة من الرابع عبر الشيبست (أحدها يقبل SATA).

[green]منفذا Thunderbolt 4 خلفيّان وترويسة USB4 أماميّة:[/green] لأجهزة التخزين الخارجيّة السريعة والشاشات عبر الكابل الواحد.

[green]منفذ كرت PCIe 5.0 يقبل تقسيم x8/x4/x4:[/green] ومعه منفذ PCIe 4.0 بسرعة x4 من الشيبست.

[green]واي‑فاي 7 (2x2) وبلوتوث 5.4 وشبكة Intel 2.5 جيجابت:[/green] مع منفذ USB-C خلفيّ يشحن حتى 30 واط.

[green]صوت SupremeFX ALC4080:[/green] صوتٌ مدمج أنقى من لوحات الفئة المتوسّطة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سعرها في مايكرولس وإنفيني آرك أعلى بكثير من أمازون — قارن قبل الشراء.
* الشبكة السلكيّة 2.5 جيجابت، بينما Z890-H الأرخص منها بشبكة 5 جيجابت.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تقبل معالجات LGA1700.
* مبالغة لمعالج Core Ultra 5 بلا كسر سرعة؛ لوحة B860 تكفيه.

${alt('Z890A', 'المواصفات نفسها تقريباً في نسخة Strix البيضاء.')}
https://rog.asus.com/motherboards/rog-strix/rog-strix-z890-f-gaming-wifi/spec/`,
  },
  {
    categoryId: MB, brand: 'ASUS', name: 'ROG Strix Z890-H Gaming WiFi', tdpWattage: 15, performanceTier: 4,
    specs: { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '4', wifi: 'Wi-Fi 7', lan: '5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '9066+ MT/s (OC)' },
    offers: [
      A('B0DTCR75Z3'),
      M('asus-rog-strix-z890-h-gaming-wifi-lga-1851-atx-motherboard-intel-z890-chipset-4x-ddr5-dimm-slots-up-to-256gb-max-memory-wi-fi-7-bt-5-4-1x-pcie-5-0-x16-slot-4x-m-2-slots-90mb1k20-m0eay0'),
    ],
    description: `### ASUS ROG Strix Z890-H Gaming WiFi

لوحة ROG Strix على شيبست Z890 بسعرٍ أدنى من Z890-F، تحتفظ بكسر السرعة وواي‑فاي 7 وشبكة 5 جيجابت، وتستغني عن منافذ Thunderbolt الخلفيّة. تناسب تجميعة ألعابٍ بمعالج Core Ultra 7 265K.

**التقنيات الأساسية المدعومة:**

[green]كسر سرعة المعالج والذاكرة:[/green] شيبست Z890 مع الرام حتى 9066+ MT/s.

[green]شبكة Realtek بسرعة 5 جيجابت:[/green] ضعف شبكات 2.5 جيجابت المعتادة، لنقل الملفّات الضخمة داخل البيت.

[green]أربعة منافذ M.2:[/green] منفذ من الجيل الخامس ومنفذ من الرابع على المعالج، ومنفذان من الرابع عبر الشيبست (أحدهما يقبل SATA).

[green]منفذ كرت PCIe 5.0 يقبل التقسيم x8/x4/x4:[/green] ومعه منفذان PCIe 4.0 بسرعة x4 من الشيبست — توسعة أكثر من Z890-F.

[green]واي‑فاي 7 (2x2) وبلوتوث 5.4:[/green] مع منفذ USB-C خلفيّ يشحن حتى 30 واط وآخر بسرعة 20 جيجابت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **لا منافذ Thunderbolt خلفيّة** — ترويسة USB4 داخليّة فقط لمنفذ الصندوق الأماميّ.
* الصوت Realtek ALC1220P، أبسط من SupremeFX في Z890-F.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تقبل معالجات LGA1700.

${alt('TUFZ890', 'لوحة Z890 من ASUS بسعرٍ أقلّ ومتانة سلسلة TUF، بشبكة 2.5 جيجابت.')}
https://rog.asus.com/motherboards/rog-strix/rog-strix-z890-h-gaming-wifi/spec/`,
  },
  {
    categoryId: MB, brand: 'MSI', name: 'Z890 Gaming Plus WiFi', tdpWattage: 15, performanceTier: 3,
    specs: { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '4', wifi: 'Wi-Fi 7', lan: '5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '9200+ MT/s (OC)' },
    offers: [
      A('B0DH6ZJB9Y'),
      M('msi-z890-gaming-plus-wi-fi-lga-1851-atx-motherboard-intel-z890-chipset-4x-ddr5-udimm-slots-up-to-256-max-memory-wi-fi-7-bt-5-4-3x-pci-e-x16-slots-4x-m-2-slots-black-911-7e34-002'),
    ],
    description: `### MSI Z890 GAMING PLUS WIFI

لوحة Z890 من MSI بسعرٍ متوسّط، فيها ما لا يتوقّعه المشتري في هذه الفئة: منفذ Thunderbolt 4 وشبكة 5 جيجابت وواي‑فاي 7. تناسب Core Ultra 7 265K أو Ultra 9 لمن يريد كسر السرعة بلوحةٍ عمليّة.

**التقنيات الأساسية المدعومة:**

[green]كسر سرعة المعالج والذاكرة:[/green] رام حتى 9200+ MT/s بشريحةٍ واحدة لكلّ قناة، مع دعم CUDIMM وXMP 3.0.

[green]منفذ Thunderbolt 4 خلفيّ (40 جيجابت):[/green] يُخرج صورة DisplayPort 2.1، ويقبل سلسلة حتى ثلاثة أجهزة Thunderbolt 4.

[green]أربعة منافذ M.2:[/green] منفذ من الجيل الخامس على المعالج، وثلاثة من الجيل الرابع (أحدها يقبل SATA)، مع RAID لأقراص NVMe.

[green]شبكة Killer E5000 بسرعة 5 جيجابت وواي‑فاي Killer BE1750x:[/green] واي‑فاي 7 بعرض 320MHz وبلوتوث 5.4.

[green]منفذ USB-C أماميّ بسرعة 20 جيجابت:[/green] وأربع ترويسات USB 5 جيجابت للصندوق، وخمس ترويسات مراوح للنظام.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الصوت Realtek ALC897 — أبسط شريحة صوت في الفئة؛ تكفي السمّاعات لا محبّي الصوت.
* منفذا x16 الإضافيّان بسرعة x4، وثالثٌ بسرعة x1.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تقبل معالجات LGA1700.

${alt('PROZ890A', 'لوحة Z890 من MSI بسعرٍ قريب وتصميمٍ عمليّ أبسط.')}
https://www.msi.com/Motherboard/Z890-GAMING-PLUS-WIFI/Specification`,
  },
  {
    categoryId: MB, brand: 'ASUS', name: 'B650E MAX Gaming WiFi', tdpWattage: 10, performanceTier: 3,
    specs: { socket: 'AM5', chipset: 'B650E', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '3', wifi: 'Wi-Fi 6E', lan: '2.5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '8000+ MT/s (OC)' },
    offers: [
      A('B0DVZSNF8G'),
      I('board/90mb1ld0-m0eay0-asus-b650e-max-gaming-wifi-am5-atx-motherboard-8934'),
    ],
    description: `### ASUS B650E MAX GAMING WIFI

لوحة ATX من ASUS على شيبست B650E لمنصّة AM5، تجمع كرت شاشة PCIe 5.0 وM.2 من الجيل الخامس بسعر لوحات B650 العاديّة. تناسب Ryzen 5 9600X أو Ryzen 7 9800X3D في تجميعة ألعابٍ متوسّطة.

**التقنيات الأساسية المدعومة:**

[green]منفذ كرت شاشة PCIe 5.0 بعرض x16:[/green] مع معالجات Ryzen 9000 و7000 — ميزة «E» التي تفرّقها عن B650 العاديّة.

[green]منفذ M.2 من الجيل الخامس على المعالج:[/green] ومعه منفذ من الجيل الرابع على المعالج، وثالث عبر الشيبست.

[green]ذاكرة DDR5 حتى 256 جيجابايت و8000+ MT/s كسر سرعة:[/green] مع Ryzen 9000 و8000 و7000.

[green]واي‑فاي 6E وشبكة Realtek 2.5 جيجابت:[/green] اتّصالٌ كامل بلا بطاقة إضافيّة.

[green]أربعة منافذ USB خلفيّة بسرعة 10 جيجابت:[/green] منها USB-C، مع مخرجَي DisplayPort وHDMI.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 الثالث بسرعة PCIe 4.0 x2 فقط — نصف سرعة أقراص الجيل الرابع.
* مع معالجات Ryzen 8000 (APU) يصير منفذ الكرت PCIe 4.0 بسرعة x8 أو x4.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا منفذ USB4 (ميزة شيبست X870).
* لا تقبل معالجات AM4.

${alt('B850GP', 'لوحة B850 من MSI بسعرٍ قريب وشيبستٍ أحدث.')}
https://www.asus.com/motherboards-components/motherboards/all-series/b650e-max-gaming-wifi/techspec/`,
  },
  {
    categoryId: MB, brand: 'Gigabyte', name: 'B650 Eagle AX', tdpWattage: 10, performanceTier: 2,
    specs: { socket: 'AM5', chipset: 'B650', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '3', wifi: 'Wi-Fi 6E', lan: '1GbE', pcieVersion: 'PCIe 4.0', memorySpeed: '8000 MT/s (OC)' },
    offers: [
      A('B083TZ68H1'),
      I('board/b650-eagle-ax-gigabyte-b650-eagle-ax-am5-wi-fi-ddr5-atx-motherboard-10233'),
    ],
    description: `### Gigabyte B650 EAGLE AX

لوحة ATX اقتصاديّة من Gigabyte لمنصّة AM5 بواي‑فاي 6E وثلاثة منافذ M.2 أحدها من الجيل الخامس. تناسب تجميعة ألعابٍ بمعالج Ryzen 5 7600 أو 9600X لمن يريد أرخص طريقٍ إلى AM5 بلوحةٍ كاملة الحجم.

**التقنيات الأساسية المدعومة:**

[green]منفذ M.2 من الجيل الخامس على المعالج:[/green] يقبل أسرع أقراص NVMe مع Ryzen 7000 و9000، ومعه منفذان آخران.

[green]ذاكرة DDR5 حتى 256 جيجابايت و8000 MT/s كسر سرعة:[/green] مع EXPO وXMP بحسب نشرة Gigabyte للنسخة 1.2.

[green]واي‑فاي 6E وبلوتوث 5.3:[/green] Intel AX210 في النسخة 1.2 (Realtek في 1.0/1.1).

[green]مراحل طاقة رقميّة 12+2+2:[/green] كافية لمعالجات Ryzen 7 بلا خنق.

[green]منفذا USB 10 جيجابت خلفيّان وHDMI وDisplayPort:[/green] لتشغيل الشاشة من رسوميّات المعالج.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ منفذ الكرت **PCIe 4.0** لا 5.0 — لا فرق اليوم في الألعاب، لكنّه سقفٌ لكروت المستقبل.
* منفذ M.2 الثاني بسرعة PCIe 4.0 x2.
* النسخ الأقدم (1.0/1.1) قد تحتاج تحديث BIOS قبل معالجات Ryzen 9000.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* الشبكة السلكيّة 1 جيجابت فقط.
* لا منفذ USB-C سريع في الخلف (Gen 1 فقط).

${alt('B650TH', 'لوحة B650 أعلى درجة بشبكة 2.5 جيجابت ومراحل طاقة أقوى.')}
https://www.gigabyte.com/Motherboard/B650-EAGLE-AX-rev-12/sp`,
  },

  /* ============================== مبرّد ============================== */
  {
    categoryId: COOL, brand: 'ASUS', name: 'TUF Gaming LC III 360 ARGB LCD White', tdpWattage: 0, performanceTier: 4,
    specs: { rgb: 'Yes', type: 'AIO', color: 'White', sizeMm: '360', fanSize: '120mm', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200', fanCount: '3', features: ['شاشة IPS ملوّنة مقاس 2.8 بوصة على رأس المضخّة'] },
    offers: [
      A('B0GNN28TYL'),
      M('asus-tuf-gaming-lc-iii-360-argb-liquid-cpu-cooler-2-8-full-color-ips-lcd-display-360mm-radiator-size-3x-mf-12-argb-fans-2600-rpm-fan-speed-90-78-cfm-airflow-white-90rc01a2-b0eay0'),
      I('cooler/90rc01a2-b0eay0-asus-tuf-gaming-lc-iii-360-argb-cpu-white-liquid-cooler-9289'),
    ],
    description: `### ASUS TUF Gaming LC III 360 ARGB LCD (أبيض)

مبرّد مائيّ 360 مم أبيض من سلسلة TUF بشاشة IPS ملوّنة على المضخّة وثلاث مراوح ARGB، وضمان ستّ سنوات. يناسب تجميعة بيضاء بمعالج Core Ultra 7 أو Ryzen 9 لمن يريد شاشةً على المضخّة بسعرٍ أقلّ من سلسلة ROG.

**التقنيات الأساسية المدعومة:**

[green]مشعّ 360 مم من الألومنيوم:[/green] أبعاده 397×120×27 مم، يكفي معالجات الفئة العليا في الألعاب والعمل.

[green]شاشة IPS ملوّنة مقاس 2.8 بوصة:[/green] تعرض حرارة المعالج أو صورةً أو GIF من برنامج ASUS.

[green]ثلاث مراوح MF-12 ARGB:[/green] من 650 إلى 2600 دورة، بتدفّق 90.78 CFM وضغط ساكن 3.82 mmH2O مناسب للمشعّ.

[green]أنابيب مغلّفة بطول 400 مم ومعجون حراريّ مدهون مسبقاً:[/green] تصل إلى أعلى الصندوق أو أمامه بسهولة.

[green]يدعم LGA1851 وLGA1700 وLGA1200 وAM5 وAM4:[/green] مع ضمان ستّ سنوات من ASUS.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ ضجيج المراوح يبلغ 37.4 ديسيبل بأقصى سرعة — اضبط منحنى المراوح من BIOS للهدوء.
* سعره يتفاوت كثيراً بين المتاجر الثلاثة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدخل صناديق لا تقبل مشعّ 360 مم.

${alt('STRIXLC', 'مبرّد ASUS الأبيض من سلسلة ROG Strix بالحجم نفسه وبلا شاشة.')}
https://www.asus.com/motherboards-components/cooling/all-in-one-liquid-cpu-cooler/tuf-gaming-lc-iii-360-argb-lcd-white-edition/techspec/`,
  },

  /* ============================== صناديق ============================== */
  {
    categoryId: CASE, brand: 'Corsair', name: '6500D Airflow White', tdpWattage: 0, performanceTier: 4,
    specs: { color: 'White', dualChamber: 'Yes', features: ['حجرتان: اللوحة والكرت في حجرة، والمزوّد والكابلات خلفها', 'يدعم لوحات Back-Connect', 'يقبل لوحات E-ATX'], formFactor: 'Mid Tower', includedFans: 'لا يوجد', maxGpuLength: '400', psuFormFactor: 'ATX', maxCoolerHeight: '190', radiatorSupport: '360mm' },
    offers: [
      A('B0CQ5CHKRB'),
      M('corsair-6500d-airflow-mid-tower-computer-case-up-to-360mm-radiator-13x-fan-support-tempered-glass-fully-mesh-sides-dual-chamber-design-modern-front-panel-i-o-white-cc-9011260-ww'),
      I('case/cc-9011260-ww-corsair-6500d-airflow-mid-tower-dual-chamber-white-pc-case-9404'),
    ],
    description: `### Corsair 6500D AIRFLOW (أبيض)

النسخة البيضاء من صندوق Corsair ذي الحجرتين: اللوحة والكرت في الحجرة الأماميّة، والمزوّد والكابلات خلفها، مع واجهة وجانبٍ أيمن شبكيّين لتدفّق هواءٍ عالٍ. يناسب تجميعة بيضاء قويّة بمبرّد مائيّ 360 وكرت كبير.

**التقنيات الأساسية المدعومة:**

[green]تصميم حجرتين بواجهة شبكيّة:[/green] المزوّد والكابلات خارج مسار الهواء، فيصل الهواء البارد إلى الكرت والمعالج مباشرة.

[green]مشعّ 360 مم في أربعة أماكن:[/green] أعلى أو جانب أو أسفل أو أمام، ومشعّ 140 مم في الخلف.

[green]حتى 13 مروحة 120 مم:[/green] ثلاث في كلٍّ من الأعلى والأسفل والجانب والأمام، وواحدة خلف.

[green]كرت حتى 400 مم ومبرّد هوائيّ حتى 190 مم:[/green] يتّسع لأغلب الكروت الطويلة والأبراج المزدوجة الكبيرة.

[green]يدعم لوحات الموصّلات الخلفيّة:[/green] ASUS BTF وMSI Project Zero وGigabyte Project Stealth.

[green]USB-C أماميّ بسرعة 10 جيجابت وأربعة USB-A:[/green] مع 109 مم لتمرير الكابلات خلف اللوحة وفلاتر غبار.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **لا يأتي بأيّ مروحة** — احسب ثمن ثلاث مراوح على الأقلّ.
* عريض (328 مم) وطوله 481 مم، وضمانه سنتان.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مكان لمشعّ 420 مم، والمزوّد حتى 225 مم.

${alt('C6500DB', 'الصندوق نفسه باللون الأسود، وغالباً أرخص.')}
https://www.corsair.com/us/en/p/pc-cases/cc-9011260-ww/6500d-airflow-mid-tower-dual-chamber-pc-case-white-cc-9011260-ww`,
  },
  ...[
    { name: '6500X White', color: 'White', title: 'أبيض', look: 'النسخة البيضاء الأساسيّة', offers: [A('B0CQ5FJKVN'), I('case/cc-9011258-ww-corsair-6500x-mid-tower-dual-chamber-white-pc-case-9408')], code: 'CC-9011258-WW' },
    { name: '6500X Black/Obsidian Aluminum', color: 'Black', title: 'أسود / ألومنيوم Obsidian', look: 'إصدارٌ خاصّ أسود بلمسات ألومنيوم داكنة', offers: [M('corsair-6500x-mid-tower-dual-chamber-pc-case-panoramic-tempered-glass-support-up-to-10x-120mm-fans-up-to-360mm-radiator-reverse-connection-mb-compatible-black-obsidian-aluminum-cc-9011283-ww'), I('case/cc-9011283-ww-corsair-6500x-black-obsidian-aluminium-dual-chamber-tempered-glass-mid-tower-pc-case-9405')], code: 'CC-9011283-WW' },
    { name: '6500X White/Bamboo', color: 'White', title: 'أبيض / خشب Bamboo', look: 'إصدارٌ خاصّ أبيض بلمسات خشب الخيزران', offers: [M('corsair-6500x-mid-tower-computer-case-up-to-360mm-radiator-10x-fan-support-tempered-glass-dual-chamber-modern-front-panel-i-o-wide-cooling-flexibility-white-bamboowood-cc-9011284-ww'), I('case/cc-9011284-ww-corsair-6500x-white-bamboo-dual-chamber-tempered-glass-mid-tower-pc-case-9409')], code: 'CC-9011284-WW' },
    { name: '6500X White/Satin Gray Aluminum', color: 'White', title: 'أبيض / ألومنيوم Satin Gray', look: 'إصدارٌ خاصّ أبيض بلمسات ألومنيوم رماديّ مطفأ', offers: [M('corsair-6500x-mid-tower-computer-case-up-to-360mm-radiator-10x-fan-support-tempered-glass-dual-chamber-modern-front-panel-i-o-wide-cooling-flexibility-white-satingrayaluminum-cc-9011285-ww'), I('case/cc-9011285-ww-corsair-6500x-white-satin-gray-aluminum-dual-chamber-tempered-glass-mid-tower-pc-case-9410')], code: 'CC-9011285-WW' },
  ].map((v) => ({
    categoryId: CASE, brand: 'Corsair', name: v.name, tdpWattage: 0, performanceTier: 4,
    specs: { color: v.color, dualChamber: 'Yes', features: ['زجاج بانوراميّ في الواجهة والجانب', 'يدعم لوحات Back-Connect', 'يقبل لوحات E-ATX'], formFactor: 'Mid Tower', includedFans: 'لا يوجد', maxGpuLength: '400', psuFormFactor: 'ATX', maxCoolerHeight: '190', radiatorSupport: '360mm' },
    offers: v.offers,
    description: `### Corsair 6500X (${v.title})

${v.look} (${v.code}) من صندوق Corsair ذي الحجرتين بواجهةٍ وجانبٍ زجاجيّين متّصلين بلا عمود — «حوض سمك» يعرض القطع كاملة. يناسب تجميعة استعراضيّة بمبرّد مائيّ ومراوح مضيئة.

**التقنيات الأساسية المدعومة:**

[green]زجاج بانوراميّ في الواجهة والجانب:[/green] رؤية كاملة للكرت واللوحة، والمزوّد والكابلات مخفيّة في الحجرة الخلفيّة.

[green]مشعّ 360 مم أعلى أو أسفل أو على الجانب:[/green] ومشعّ 140 مم في الخلف — حتى 10 مراوح 120 مم.

[green]كرت حتى 400 مم ومبرّد هوائيّ حتى 190 مم:[/green] مع 8 فتحات توسعة أفقيّة.

[green]يدعم لوحات الموصّلات الخلفيّة:[/green] ASUS BTF وMSI Project Zero وGigabyte Project Stealth.

[green]USB-C أماميّ بسرعة 10 جيجابت وأربعة USB-A:[/green] مع 109 مم لتمرير الكابلات وفلاتر غبار.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **لا يأتي بمراوح**، والواجهة زجاجيّة بلا مداخل هواء — السحب من الأسفل والجانب، فاحسب ثلاث مراوح على الأقلّ.
* الضمان سنتان، والحجم كبير (481 مم طولاً و328 عرضاً).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مشعّ ولا مراوح في الواجهة، ولا مكان لمشعّ 420 مم.

${alt('C6500DB', 'الهيكل نفسه بواجهةٍ شبكيّة لتدفّق هواءٍ أعلى بدل الزجاج.')}
https://www.corsair.com/us/en/p/pc-cases/cc-9011258-ww/6500x-mid-tower-dual-chamber-pc-case-white-cc-9011258-ww`,
  })),
  ...[
    { name: '3500X White', color: 'White', title: 'أبيض', offers: [A('B0CZV22HDF'), M('corsair-3500x-mid-tower-computer-case-up-to-360mm-radiator-10x-fan-support-tempered-glass-case-window-1x-type-c-2x-type-a-audio-in-out-interface-white-cc-9011277-ww'), I('case/cc-9011277-ww-corsair-3500x-tempered-glass-no-fans-included-mid-tower-white-pc-case-9387')], url: 'cc-9011277-ww/3500x-mid-tower-pc-case-white-cc-9011277-ww', alt: alt('FRAMEW', 'صندوق Corsair أبيض بزجاجٍ منحنٍ وثلاث مراوح مرفقة.') },
    { name: '3500X Black', color: 'Black', title: 'أسود', offers: [A('B0CZVN6KY5'), M('corsair-3500x-mid-tower-computer-case-up-to-360mm-radiator-10x-fan-support-tempered-glass-case-window-1x-type-c-2x-type-a-audio-in-out-interface-black-cc-9011276-ww')], url: 'cc-9011276-ww/3500x-mid-tower-pc-case-black-cc-9011276-ww', alt: alt('FRAMEB', 'صندوق Corsair أسود بزجاجٍ منحنٍ وثلاث مراوح مرفقة.') },
  ].map((v) => ({
    categoryId: CASE, brand: 'Corsair', name: v.name, tdpWattage: 0, performanceTier: 3,
    specs: { color: v.color, features: ['زجاج بانوراميّ في الواجهة والجانب', 'يدعم لوحات Back-Connect', 'يقبل لوحات E-ATX'], formFactor: 'Mid Tower', includedFans: 'لا يوجد', maxGpuLength: '410', psuFormFactor: 'ATX', maxCoolerHeight: '170', radiatorSupport: '360mm' },
    offers: v.offers,
    description: `### Corsair 3500X (${v.title})

صندوق Mid Tower اقتصاديّ من Corsair بزجاجٍ بانوراميّ في الواجهة والجانب ودعم لوحات الموصّلات الخلفيّة. يناسب تجميعة استعراضيّة بميزانيّة محدودة لمن سيشتري مراوحه بنفسه.

**التقنيات الأساسية المدعومة:**

[green]زجاج بانوراميّ بلا عمود أماميّ:[/green] يعرض الكرت واللوحة كاملين.

[green]مشعّ 360 مم أعلى أو على الجانب:[/green] ومراوح أسفل الصندوق تسحب الهواء البارد إلى الكرت مباشرة — حتى 10 مراوح 120 مم.

[green]كرت طويل ومبرّد هوائيّ حتى 170 مم:[/green] Corsair تذكر 425 مم للكرت ومايكرولس 410 — سجّلنا الأحوط.

[green]يدعم لوحات الموصّلات الخلفيّة ولوحات E-ATX:[/green] حتى 305×277 مم.

[green]USB-C أماميّ بسرعة 10 جيجابت ومنفذا USB-A:[/green] مع لوح أقراص يتّسع لقرصين 3.5 وقرصين 2.5.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **لا يأتي بمراوح**، والواجهة زجاجيّة بلا مداخل هواء.
* ⚠️ **المزوّد حتى 180 مم طولاً فقط** — أغلب مزوّدات 1000 واط فما فوق أطول من ذلك؛ تحقّق قبل الشراء.
* الضمان سنتان.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مشعّ في الواجهة ولا في الأسفل، ولا حجرة خلفيّة منفصلة للمزوّد.

${v.alt}
https://www.corsair.com/us/en/p/pc-cases/${v.url}`,
  })),
  ...[
    { name: '2500D Airflow White', color: 'White', title: 'أبيض', offers: [A('B0CQ5CW8D1'), M('corsair-2500d-airflow-mid-tower-pc-case-upto-360mm-radiator-11-x-fans-support-dual-chamber-design-modern-i-o-panel-1-x-usb-c-3-2-gen-1-2-x-usb-3-2-gen-1-ports-audio-jack-white-cc-9011264-ww'), I('case/cc-9011264-ww-corsair-2500d-airflow-micro-atx-tower-dual-chamber-white-pc-case-9371')], url: 'cc-9011264-ww/2500d-airflow-small-tower-pc-case-white-cc-9011264-ww' },
    { name: '2500D Airflow Black', color: 'Black', title: 'أسود', offers: [A('B0CQ5G3NW9'), M('corsair-2500d-airflow-mid-tower-pc-case-upto-360mm-radiator-11-x-fans-support-dual-chamber-design-modern-i-o-panel-1-x-usb-c-3-2-gen-1-2-x-usb-3-2-gen-1-ports-audio-jack-black-cc-9011263-ww')], url: 'cc-9011263-ww/2500d-airflow-small-tower-pc-case-black-cc-9011263-ww' },
  ].map((v) => ({
    categoryId: CASE, brand: 'Corsair', name: v.name, tdpWattage: 0, performanceTier: 3,
    specs: { color: v.color, dualChamber: 'Yes', features: ['حجرتان بمقاس Micro-ATX', 'يدعم لوحات Back-Connect'], formFactor: 'Micro-ATX Tower', includedFans: 'لا يوجد', maxGpuLength: '400', psuFormFactor: 'ATX', maxCoolerHeight: '180', radiatorSupport: '360mm' },
    offers: v.offers,
    description: `### Corsair 2500D AIRFLOW (${v.title})

صندوق Corsair صغير بحجرتين للوحات Micro-ATX وMini-ITX، بواجهةٍ وجانبٍ شبكيّين. يناسب تجميعة قويّة في حجمٍ أقصر من صناديق ATX، بكرتٍ كامل الطول ومبرّد مائيّ 360.

**التقنيات الأساسية المدعومة:**

[green]حجرتان في جسمٍ قصير (376 مم ارتفاعاً):[/green] المزوّد والكابلات خلف اللوحة، والهواء يصل الكرت مباشرة.

[green]مشعّ 360 مم أعلى أو أسفل:[/green] ومشعّ 280 في الأمام و240 على الجانب — مكان لمبرّد مائيّ كبير رغم الحجم.

[green]كرت حتى 400 مم ومبرّد هوائيّ حتى 180 مم:[/green] كروت الفئة العليا والأبراج المزدوجة تدخل.

[green]مزوّد ATX حتى 225 مم:[/green] لا يحتاج مزوّد SFX الغالي.

[green]يدعم لوحات الموصّلات الخلفيّة:[/green] ASUS BTF وMSI Project Zero وGigabyte Project Stealth، مع 106 مم لتمرير الكابلات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **لا يأتي بمراوح**.
* أربع فتحات توسعة فقط — كرت بسماكة 3.5 فتحات يأخذ أغلبها.
* عريض (304 مم) نسبةً إلى ارتفاعه، وضمانه سنتان.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ⚠️ **لا يقبل لوحات ATX** — Micro-ATX وMini-ITX فقط.

${alt('A23W', 'صندوق Micro-ATX أرخص بكثير ومعه أربع مراوح ARGB.')}
https://www.corsair.com/us/en/p/pc-cases/${v.url}`,
  })),
  {
    categoryId: CASE, brand: 'Corsair', name: '5000D Core Airflow White', tdpWattage: 0, performanceTier: 3,
    specs: { color: 'White', features: ['نظام RapidRoute لتمرير الكابلات خلف اللوحة', 'يقبل لوحات E-ATX'], formFactor: 'Mid Tower', includedFans: 'لا يوجد', maxGpuLength: '400', psuFormFactor: 'ATX', maxCoolerHeight: '170', radiatorSupport: '360mm' },
    offers: [
      A('B0CDTPZ923'),
      M('corsair-5000d-core-airflow-mid-tower-atx-pc-case-high-airflow-front-panel-tempered-glass-case-windows-up-to-360mm-radiator-12x-fan-support-25mm-cable-routing-white-cc-9011262-ww'),
      I('case/cc-9011262-ww-corsair-5000d-core-airflow-mid-tower-atx-white-pc-case-9398'),
    ],
    description: `### Corsair 5000D CORE AIRFLOW (أبيض)

نسخة «Core» المخفّضة من صندوق Corsair 5000D الشهير: الهيكل الواسع والواجهة الشبكيّة نفسهما، بلا مراوح ولا قفص أقراص صلبة. يناسب من يريد صندوقاً واسعاً بتبريدٍ ممتاز وسيختار مراوحه بنفسه.

**التقنيات الأساسية المدعومة:**

[green]واجهة شبكيّة عالية التدفّق:[/green] ومكان لمشعّ 360 مم في الأمام وآخر على الجانب، و120 مم في الخلف.

[green]حتى عشر مراوح 120 مم:[/green] ثلاث في كلٍّ من الأعلى والأمام والجانب، وواحدة خلف (أو مراوح 140 مم).

[green]كرت حتى 400 مم ومزوّد حتى 250 مم:[/green] أيّ كرت وأيّ مزوّد حاليّ يدخل بلا حساب.

[green]نظام RapidRoute:[/green] قناة خلف اللوحة تجمع الكابلات بمساحة 25 مم، ويقبل لوحات E-ATX.

[green]USB-C أماميّ بسرعة 10 جيجابت ومنفذا USB-A:[/green] مع سبع فتحات توسعة أفقيّة واثنتين رأسيّتين.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **لا يأتي بمراوح**.
* المبرّد الهوائيّ حتى 170 مم — أغلب الأبراج المزدوجة تدخل، والأطول منها لا.
* لا قفص للأقراص الصلبة 3.5 (يُباع منفصلاً)، وثلاثة أماكن لأقراص 2.5.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدعم لوحات الموصّلات الخلفيّة بحسب Corsair.

${alt('C5000D', 'الصندوق نفسه في نسخته الكاملة بمروحتين مرفقتين.')}
https://www.corsair.com/us/en/p/pc-cases/cc-9011262-ww/5000d-core-airflow-mid-tower-atx-pc-case-white-cc-9011262-ww`,
  },
  ...[
    { name: 'H6 Flow White', color: 'White', title: 'أبيض', glass: 'زجاج شفّاف', fans: '3x 120mm', fanTxt: 'ثلاث مراوح F120Q هادئة (1200 دورة، 25.1 ديسيبل)', offers: [A('B0C89G9QDK'), M('nzxt-h6-flow-compact-dual-chamber-airflow-mid-tower-atx-case-panoramic-glass-panels-up-to-360-mm-radiator-3x-120mm-f120q-fans-cable-management-usb-c-3-2-usb-a-3-2-white-cc-h61fw-01'), I('case/cc-h61fw-01-nzxt-h6-flow-compact-dual-chamber-atx-white-case-11416')], code: 'CC-H61FW-01', url: 'h6-flow' },
    { name: 'H6 Flow Black', color: 'Black', title: 'أسود', glass: 'زجاج داكن', fans: '3x 120mm', fanTxt: 'ثلاث مراوح F120Q هادئة (1200 دورة، 25.1 ديسيبل)', offers: [A('B0C89FCDFP'), I('case/cc-h61fb-01-nzxt-h6-flow-compact-dual-chamber-atx-black-case-11414')], code: 'CC-H61FB-01', url: 'h6-flow' },
    { name: 'H6 Flow RGB Black', color: 'Black', title: 'RGB، أسود', glass: 'زجاج داكن', fans: '3x 120mm RGB', fanTxt: 'ثلاث مراوح F120 RGB Core مضيئة', offers: [A('B0CN5LSXDF'), M('nzxt-h6-flow-rgb-compact-dual-chamber-airflow-mid-tower-atx-case-panoramic-glass-panels-up-to-360-mm-radiator-3x-120mm-rgb-fans-cable-mgt-usb-c-3-2-usb-a-3-2-black-cc-h61fb-r1')], code: 'CC-H61FB-R1', url: 'h6-flow-rgb' },
  ].map((v) => ({
    categoryId: CASE, brand: 'NZXT', name: v.name, tdpWattage: 0, performanceTier: 3,
    specs: { color: v.color, formFactor: 'Mid Tower', dualChamber: 'Yes', includedFans: v.fans, maxGpuLength: '365', psuFormFactor: 'ATX', maxCoolerHeight: '163', radiatorSupport: '360mm' },
    offers: v.offers,
    description: `### NZXT H6 Flow (${v.title})

صندوق NZXT مدمج بحجرتين (${v.code}) وزجاجٍ بانوراميّ في الزاوية الأماميّة، والمراوح مائلة بزاويةٍ نحو الكرت. يناسب تجميعة ألعاب ATX في حجمٍ أصغر من الصناديق التقليديّة.

**التقنيات الأساسية المدعومة:**

[green]${v.fanTxt}:[/green] مركّبة في الجانب الأماميّ بزاوية تدفع الهواء البارد إلى الكرت والمعالج مباشرة.

[green]حجرتان في جسمٍ مدمج (51.8 لتر):[/green] المزوّد والكابلات خلف اللوحة مع 91 مم لتمرير الكابلات.

[green]مشعّ 360 مم في الأعلى:[/green] ومروحتا 140 مم في الأسفل ومروحة 120 خلف.

[green]${v.glass} بلا عمود في الزاوية:[/green] رؤية كاملة للقطع من الأمام والجانب.

[green]USB-C أماميّ ومنفذا USB-A:[/green] مع مكانين لأقراص 2.5 ومكان لقرص 3.5.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ الكرت حتى 365 مم والمبرّد الهوائيّ حتى 163 مم — بعض أطول الكروت والأبراج المزدوجة لا تدخل.
* سماكة المشعّ مع المراوح في الأعلى محدودة (30 مم بحسب جدول NZXT).
* المزوّد حتى 200 مم، والضمان سنتان.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدعم لوحات الموصّلات الخلفيّة، ولا لوحات E-ATX.

${alt('H6RGBW', 'الصندوق نفسه أبيض بمراوح RGB مضيئة.')}
https://nzxt.com/product/${v.url}`,
  })),
  {
    categoryId: CASE, brand: 'Lian Li', name: 'SUP01 Black', tdpWattage: 0, performanceTier: 4,
    specs: { color: 'Black', features: ['الكرت مركّب رأسيّاً في الواجهة بكابل PCIe 4.0 مرفق', 'يدعم لوحات Back-Connect', 'المبرّد الهوائيّ حتى 88 مم فقط — للمبرّدات المائيّة'], formFactor: 'Mid Tower', includedFans: '3x 120mm PWM', maxGpuLength: '400', psuFormFactor: 'ATX', maxCoolerHeight: '88', radiatorSupport: '360mm' },
    offers: [
      A('B0D5QRPC63'),
      M('lian-li-sup01-small-tower-atx-case-stand-up-platform-design-front-gpu-mount-pre-installed-3-x-120mm-pwm-pcie-4-0-riser-cables-3-side-mesh-panels-dual-argb-strip-lights-black-g99-sup01x-00'),
      I('case/g99-sup01x-00-lian-li-sup01-tempered-glass-atx-mini-tower-case-11219'),
    ],
    description: `### Lian Li SUP01 (أسود)

صندوق «منصّة قائمة» من Lian Li بحجم 44.8 لتراً يقبل لوحات ATX: الكرت يُركّب رأسيّاً خلف الواجهة الزجاجيّة بكابل PCIe 4.0 مرفق، فيبدو كأنّه معروضٌ في واجهة متجر. يناسب تجميعة استعراضيّة صغيرة البصمة بمبرّد مائيّ.

**التقنيات الأساسية المدعومة:**

[green]الكرت في حجرةٍ أماميّة مستقلّة:[/green] بكابل PCIe 4.0 بطول 510 مم مرفق، وكرت حتى 400 مم وسماكة أربع فتحات.

[green]بصمة صغيرة (212 مم عرضاً و403 عمقاً):[/green] يقبل لوحة ATX كاملة ومزوّد ATX حتى 220 مم.

[green]ثلاث مراوح 120 مم PWM مرفقة:[/green] من 300 إلى 1800 دورة، ومكانٌ لثلاث أخرى.

[green]مشعّ 360 أو 280 مم على الجانب:[/green] لتبريد المعالج بمبرّد مائيّ.

[green]يدعم لوحات الموصّلات الخلفيّة:[/green] مع USB-C أماميّ وشريطَي ARGB.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **المبرّد الهوائيّ حتى 88.2 مم فقط** بحسب Lian Li — عمليّاً يحتاج مبرّداً مائيّاً أو مبرّداً منخفضاً جدّاً.
* الضمان سنة واحدة فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب الأبراج الهوائيّة العاديّة إطلاقاً.

${alt('VISIONB', 'صندوق Lian Li زجاجيّ بتركيبٍ تقليديّ يقبل المبرّدات الهوائيّة حتى 170 مم.')}
https://lian-li.com/product/sup-01/`,
  },
  {
    categoryId: CASE, brand: 'Gigabyte', name: 'AORUS C601 Glass', tdpWattage: 0, performanceTier: 4,
    specs: { color: 'Black', features: ['أربع مراوح 140 مم ARGB مرفقة', 'يدعم لوحات Back-Connect', 'يقبل لوحات E-ATX'], formFactor: 'Mid Tower', includedFans: '4x 140mm ARGB', maxGpuLength: '420', psuFormFactor: 'ATX', maxCoolerHeight: '190', radiatorSupport: '420mm' },
    offers: [
      A('B0GMK1CQN2'),
      M('gigabyte-aorus-c601-glass-global-e-atx-mid-tower-computer-case-4x-140mm-pre-installed-argb-pwm-fans-420mm-radiator-support-rgb-lighting-8-expansion-slots-dust-filters-black-gb-ac601g-global'),
      I('case/ac601g-gigabyte-ac601g-glass-e-atx-black-gaming-case-10177'),
    ],
    description: `### Gigabyte AORUS C601 GLASS

صندوق AORUS كبير بلوحَي زجاجٍ مدخّن وأربع مراوح 140 مم ARGB ومشعّ 420 مم في الأمام أو الأعلى. يناسب تجميعة رائدة بكرتٍ ضخم ومبرّد مائيّ 420 لمن يريد صندوقاً جاهزاً بالمراوح.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح 140 مم ARGB وPWM مرفقة:[/green] ثلاث في الأمام وواحدة خلف، مع موزّع بستّ ترويسات ARGB وستّ ترويسات مراوح.

[green]مشعّ 420 مم في الأمام أو الأعلى:[/green] ومشعّ 140 في الخلف — أكبر المبرّدات المائيّة تدخل.

[green]كرت حتى 420 مم ومبرّد هوائيّ حتى 190 مم:[/green] وتركيب رأسيّ للكرت بمساحة 107 مم.

[green]يدعم لوحات الموصّلات الخلفيّة ولوحات E-ATX:[/green] مثل سلسلة Gigabyte STEALTH.

[green]USB-C أماميّ بسرعة 10 جيجابت وأربعة USB-A:[/green] مع أربعة أماكن لأقراص 3.5 وسبعة لأقراص 2.5، وثماني فتحات توسعة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **ضخم وثقيل**: 611 مم ارتفاعاً و565 عمقاً و21.5 كغ صافياً — يحتاج مكاناً على الأرض لا على المكتب.
* المزوّد حتى 220 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ارتفاعه 611 مم لا يدخل تحت أغلب المكاتب.

${alt('NORTHXL', 'صندوق كبير آخر بمشعّ 420 مم وواجهة خشبيّة وثلاث مراوح 140 مم.')}
https://www.gigabyte.com/PC-Case/GB-AC601G-GLOBAL`,
  },
  {
    categoryId: CASE, brand: 'ASUS', name: 'A21 Plus White', tdpWattage: 0, performanceTier: 2,
    specs: { color: 'White', features: ['يدعم لوحات ASUS BTF'], formFactor: 'Micro-ATX Tower', includedFans: '4x 120mm ARGB', maxGpuLength: '380', psuFormFactor: 'ATX', maxCoolerHeight: '165', radiatorSupport: '360mm' },
    offers: [
      A('B08H5FX83F'),
      M('asus-a21-plus-m-atx-computer-case-4x-120mm-argb-pre-installed-fan-up-to-360mm-radiator-7x-fan-support-btf-support-headphone-microphone-2x-usb-3-2-gen1-interface-white-90dc00h3-b19010'),
      I('case/90dc00h3-b19000-asus-a21-plus-four-pre-installed-argb-fans-microatx-white-gaming-case-8923'),
    ],
    description: `### ASUS A21 PLUS (أبيض)

صندوق Micro-ATX اقتصاديّ أبيض من ASUS بأربع مراوح ARGB مرفقة وواجهة شبكيّة. يناسب تجميعة ألعابٍ بيضاء متوسّطة بلوحة Micro-ATX لمن يريد صندوقاً جاهزاً بلا مصاريف مراوح.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح 120 مم ARGB مرفقة:[/green] ثلاث في الأمام وواحدة خلف — تبريدٌ كامل من أوّل يوم.

[green]واجهة شبكيّة ومشعّ 360 مم في الأمام أو الأعلى:[/green] مكانٌ لمبرّد مائيّ كبير رغم الحجم الصغير.

[green]كرت حتى 380 مم ومبرّد هوائيّ حتى 165 مم:[/green] أغلب كروت الفئة المتوسّطة والعليا تدخل.

[green]يدعم لوحات ASUS BTF:[/green] لوحات الموصّلات الخلفيّة تخفي الكابلات من الواجهة.

[green]مزوّد ATX حتى 210 مم:[/green] مع مكانٍ لقرص 2.5 ومكانين مشتركين 2.5/3.5.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **لا منفذ USB-C أماميّ** — منفذا USB-A ومنفذا صوت فقط.
* رمز النسخة عند إنفيني آرك ينتهي بـ B19000 وفي أمازون ومايكرولس B19010؛ اللاحقة إقليميّة والصندوق نفسه.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ⚠️ **لا يقبل لوحات ATX** — Micro-ATX وMini-ITX فقط.

${alt('A23W', 'الصندوق الأقرب من ASUS بأربع مراوح ARGB أيضاً وتصميمٍ مختلف.')}
https://www.asus.com/motherboards-components/cases/asus/asus-a21-plus-case/techspec/`,
  },
  ...[
    { name: 'O11 Dynamic EVO XL Black', color: 'Black', title: 'أسود', code: 'O11DEXL-X', offers: [A('B0CGM5HJM8'), M('lian-li-o11-dynamic-evo-xl-full-tower-computer-case-aluminum-steel-glass-materials-up-to-420mm-radiator-support-11x-fans-3-5mm-jack-usb-a-3-2x4-usb-c-3-2-i-o-ports-black-g99-o11dexl-x-00'), J('lian-li-xl-other-gaming-accessories-633685')] },
    { name: 'O11 Dynamic EVO XL White', color: 'White', title: 'أبيض', code: 'O11DEXL-W', offers: [A('B0CGM6RKV8'), M('lian-li-o11-dynamic-evo-xl-full-tower-computer-case-aluminum-steel-glass-materials-up-to-420mm-radiator-support-11x-fans-3-5mm-jack-usb-a-3-2x4-usb-c-3-2-i-o-ports-white-g99-o11dexl-w-00')] },
  ].map((v) => ({
    categoryId: CASE, brand: 'Lian Li', name: v.name, tdpWattage: 0, performanceTier: 5,
    specs: { color: v.color, dualChamber: 'Yes', features: ['ثلاثة مشعّات 420 مم معاً (أعلى وجانب وأسفل)', 'وضع عاديّ ووضع معكوس', 'يقبل لوحات E-ATX'], formFactor: 'Full Tower', includedFans: 'لا يوجد', maxGpuLength: '460', psuFormFactor: 'ATX', maxCoolerHeight: '167', radiatorSupport: '3x 420mm' },
    offers: v.offers,
    description: `### Lian Li O11 Dynamic EVO XL (${v.title})

النسخة الكبيرة (${v.code}) من صندوق Lian Li الأشهر للتبريد المائيّ: حجرتان، وزجاج في الواجهة والجانب، ومكان لثلاثة مشعّات 420 مم معاً. يناسب تجميعة رائدة بتبريدٍ مائيّ مخصّص أو مبرّدات مائيّة متعدّدة.

**التقنيات الأساسية المدعومة:**

[green]ثلاثة مشعّات 420 مم في وقتٍ واحد:[/green] أعلى وجانب وأسفل — حتى 11 مروحة، ثلاث 140 مم في كلّ جهة.

[green]كرت حتى 460 مم:[/green] أطول كروت الشاشة الحاليّة تدخل بفارقٍ كبير.

[green]وضع عاديّ ووضع معكوس:[/green] يُقلب الصندوق ليكون الزجاج على اليمين أو اليسار، ولوحة المنافذ تُنقل إلى ثلاثة أماكن بلا أدوات.

[green]لوحات E-ATX حتى 280 مم عرضاً:[/green] مع ثماني فتحات توسعة.

[green]تخزين واسع:[/green] ثلاثة أقراص 2.5 خلف اللوحة وقفص لأربعة أقراص 3.5، ومنفذ USB-C وأربعة USB-A في الواجهة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **لا يأتي بمراوح** — صندوق بهذا الحجم يحتاج ستّ مراوح على الأقلّ.
* المبرّد الهوائيّ حتى 167 مم فقط؛ الصندوق مصمّم للتبريد المائيّ.
* ⚠️ **ضمان Lian Li سنة واحدة**، والحجم ضخم (522 عمقاً و531.9 ارتفاعاً).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب تجميعة صغيرة أو مكتباً ضيّقاً.

${alt('O11EVO', 'الحجم الأصغر من السلسلة نفسها بسعرٍ أقلّ ومشعّ 420 مم واحد.')}
https://lian-li.com/product/o11-dynamic-evo-xl/`,
  })),
  {
    categoryId: CASE, brand: 'Fractal Design', name: 'Torrent Black Solid', tdpWattage: 0, performanceTier: 4,
    specs: { color: 'Black', features: ['مروحتان 180 مم وثلاث 140 مم مرفقة', 'جانب معدنيّ مصمت بلا زجاج', 'يقبل لوحات E-ATX'], formFactor: 'Mid Tower', includedFans: '2x 180mm + 3x 140mm', maxGpuLength: '461', psuFormFactor: 'ATX', maxCoolerHeight: '188', radiatorSupport: '420mm' },
    offers: [
      A('B08699B69Z'),
      I('case/fd-c-tor1a-05-fractal-design-torrent-mid-tower-black-case-10166'),
    ],
    description: `### Fractal Design Torrent (Black Solid)

صندوق Fractal الأشهر في تدفّق الهواء: واجهة شبكيّة مفتوحة بمروحتين ضخمتين 180 مم، وثلاث مراوح 140 مم في الأسفل تدفع الهواء إلى الكرت مباشرة. نسخة Solid بجانبٍ معدنيّ بلا زجاج. يناسب أقوى الكروت والمعالجات لمن يقدّم التبريد على الاستعراض.

**التقنيات الأساسية المدعومة:**

[green]خمس مراوح مرفقة:[/green] مروحتان Dynamic X2 GP-18 بقطر 180 مم في الأمام وثلاث GP-14 بقطر 140 مم في الأسفل — تدفّق هواءٍ عالٍ جدّاً بسرعاتٍ منخفضة.

[green]كرت حتى 461 مم ومبرّد هوائيّ حتى 188 مم:[/green] أيّ كرت وأيّ برج مزدوج.

[green]مشعّ 420 مم في الأمام أو الأسفل:[/green] ومشعّ 140 في الخلف.

[green]لوحات E-ATX وSSI-EEB:[/green] ومزوّد ATX حتى 230 مم.

[green]USB-C أماميّ بسرعة 20 جيجابت ومنفذا USB-A:[/green] مع مكانين لأقراص 3.5 وأربعة لأقراص 2.5، وسبع فتحات توسعة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **جانب معدنيّ مصمت** — لا ترى القطع من الخارج (اختر نسخة TG إن أردت الزجاج).
* كبير وثقيل (544 مم طولاً و530 ارتفاعاً)، والضمان سنتان.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مكان لمشعّ في الأعلى؛ السقف مغلق بتصميمه.

${alt('NORTHXL', 'صندوق Fractal كبير بواجهة خشبيّة وزجاجٍ جانبيّ إن أردت الشكل مع تبريدٍ قويّ.')}
https://www.fractal-design.com/products/cases/torrent/torrent/black-solid/`,
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
  if (new Set(p.offers.map((o) => o.store)).size < 2) bad("أقلّ من متجرين");
  for (const o of p.offers) {
    if (!stores[o.store]) { bad(`لا متجر «${o.store}»`); continue; }
    /* الرابط نفسه بلا ذيل استعلام — لا «يبدأ بـ» وحدها: ‎…ultra5-225 بادئةٌ لـ‎…ultra5-225f وهما قطعتان */
    const base = o.url.replace(/\/$/, '');
    const asin = (base.match(/\/dp\/([A-Z0-9]{10})$/) || [])[1];
    const taken = await prisma.componentOffer.findFirst({ where: { OR: [{ url: base }, { url: base + '/' }, { url: { startsWith: base + '?' } }, { url: { startsWith: base + '/?' } }, ...(asin ? [{ url: { contains: `/dp/${asin}` } }] : [])] }, select: { url: true, component: { select: { name: true } } } });
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
  else console.log(`\n↪ سيُنقل العرض (${m.urlHas}) إلى «${m.to}»`);
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log(`\n${PARTS.length} قطعة — (عرضٌ فقط — أضف --apply)`); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const movedBefore = await prisma.componentOffer.findMany({ where: { id: { in: MOVE.map((m) => m.offerId) } } });
writeFileSync(`backups/added-batch16-${stamp}.json`, JSON.stringify({ PARTS, EXTRA, movedBefore }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch16-${stamp}.json`);

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
  const to = await prisma.component.findFirst({ where: { name: m.to, brand: m.brand }, select: { id: true } });
  await prisma.componentOffer.update({ where: { id: m.offerId }, data: { componentId: to.id } });
  ids.push(m.from);
  console.log(`↪ نُقل العرض إلى ${m.to}`);
}
for (const e of EXTRA) {
  await prisma.componentOffer.create({ data: { componentId: e.id, storeId: stores[e.offer.store], url: e.offer.url, inStock: true } });
  ids.push(e.id);
  console.log(`➕ ${e.name} ← ${e.offer.store}`);
}

console.log(`\nالتالي (واحدةً واحدة):\n  ${ids.join(' ')}`);
await prisma.$disconnect();
