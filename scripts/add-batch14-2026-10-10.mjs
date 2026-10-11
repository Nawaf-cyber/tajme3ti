/**
 * ============ الدفعة الرابعة عشرة — بقيّة جدول الأربعين (١٨ قطعة) — 2026-10-10 ============
 *
 * طلب نوّاف بعد الدفعة ١٣: «ضيف اذا فيه باقي». بقي من جدول الأربعين ١٩ — أُضيف ١٨:
 *   + Toughpower GT 1200W بنسختيه (السوداء -3 والبيضاء Snow -W) لأنّ كلتيهما في المتجرين.
 *   − Cooler Master Elite 481 Wood: لا صفحة رسميّة في موقع الشركة (كأخيه Elite 690 Wood).
 *   − Gigabyte P750BS: غير مُدرَج في SPL، وسلفه P-B مُقيَّم E وC — لا يُقترح مزوّدٌ من خطٍّ ضعيف بلا تقييم.
 *
 * كلّ صفحة أمازون قُرئت (زرّ الشراء، والرمز في الصفحة حيث وُجد: 90MB1NT0/90MB1M90/90MB1NY0/90MB1M30،
 * N7-B85XT-B1، CA-11H-00F6WN-00، C-F500F-FM1E-G0K، E681-WHNN-S00، PS-TPT-1200FNFAGE-3/-W، RB0750B،
 * CL-P142-AL12SW-A). والمواصفات من جدول مايكرولس، وما يُشكّ فيه من صفحة الشركة:
 *   - ASUS (rog.asus.com/asus.com): الذاكرة مع Ryzen 9000 (مايكرولس كتب رقم Ryzen 8000 الأعلى)،
 *     الشبكة، الواي‑فاي، عدد SATA. Dark Hero = 10GbE + 5GbE وMT7927؛ X870E-H = RTL8922AE وALC1220P.
 *   - TUF X870-PRO WiFi7 W NEO وB850-G: بيضاوان (لوحة دارة بيضاء — مراجعات ومتاجر).
 *   - NZXT N7 B850: واي‑فاي 6E لا 7 (nzxt.com)، وذاكرة حتى 192GB.
 *   - MSI MPG Z890I EDGE TI: شبكة Killer 5G وواي‑فاي BE1750x وذاكرة حتى 128GB (msi.com).
 *   - Gigabyte Z890 Eagle WiFi7 PLUS: شبكة 2.5GbE وBE202 بعرض 160MHz (gigabyte.com).
 *   - Lian Li RB750: غير معياريّ (lian-li.com؛ أمازون كتب «teilmodular»).
 *   - FLOVA F50: الكرت 420 مم بلا مروحة Cross Flow و360 معها — وهي مركّبة، فسُجّل 360.
 *
 *   node scripts/add-batch14-2026-10-10.mjs           # عرض
 *   node scripts/add-batch14-2026-10-10.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const MB = 'cmpfziqe70001x4ym928tt3o2';
const PSU = 'cmpfziqh70002x4ym6ln587z2';
const STO = 'cmpfziqr70005x4ym3k7uh079';
const CASE = 'cmpfziquj0006x4ym53f0ehcw';
const COOL = 'cmszm2ym00000swymvd5s2yxm';

const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });
const M = (slug) => ({ store: 'microless', url: `https://saudi.microless.com/product/${slug}/` });

const ALT = {
  CHHERO: ['ASUS ROG Crosshair X870E Hero', 'cmuzsa1ct0014u8ymaqjltr2p'],
  X870EE: ['ASUS ROG Strix X870E-E Gaming WiFi', 'cmpiec8zy003c00ymdvvn2eez'],
  X870ETMAX: ['MSI MAG X870E Tomahawk MAX WiFi', 'cmv1xyh3s0003zsymvuyhoely'],
  B850PROW: ['ASUS TUF Gaming B850-PRO WiFi7 W NEO', 'cmv1xyhm00009zsymlaphuoyg'],
  B850MORTAR: ['MSI MAG B850M Mortar WiFi', 'cmv1xyi2p000fzsympx55oaa6'],
  B850TW: ['MSI MAG B850 Tomahawk WiFi', 'cmv1xyhud000czsym52iwhms4'],
  Z790I: ['ASUS ROG Strix Z790-I Gaming WiFi', 'cmpi5ha2h000904l1sk5ch745'],
  Z890ELP: ['Gigabyte Z890 AORUS Elite WiFi7 PLUS', 'cmv1xyibe000izsymx2uct0pl'],
  Z890S: ['MSI PRO Z890-S WiFi', 'cmuzv426h000lpcymakc3zdxd'],
  H610HDV: ['ASRock H610M-HDV/M.2+ D5', 'cmti4cuqq000dasym3c1no9r1'],
  V600B: ['Thermaltake View 600 TG Black', 'cmv1xyipi000nzsympd0rv644'],
  POP2AIR: ['Fractal Design Pop 2 Air RGB Black TG', 'cmv1esgje000r8oym8s39j89c'],
  E502W: ['Cooler Master Elite 502 White', 'cmv1esjlp001i8oymxujze3fc'],
  A1250GS: ['MSI MPG A1250GS PCIE5', 'cmv1xyjnc000zzsymndh819d6'],
  GT1000S: ['Thermaltake Toughpower GT 1000W Snow', 'cmv1xyjvx0012zsymnoeoc82q'],
  RB650: ['Lian Li RB650', 'cmv18knef000njgymszevzlbx'],
  SE214: ['ID-Cooling SE-214-XT V2 ARGB', 'cmv1xykm0001bzsymgmxyuns8'],
  S9100_4: ['Samsung 9100 PRO 4TB Heatsink', 'cmtjky8ki000070ymxc9ucmx1'],
};
const alt = (k, ...why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const MOVE = [];
const EXTRA = [];

const AM5 = 'AM5';
const SOCK_AIR = 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X';

/* المواصفات المشتركة لنسختَي Toughpower GT 1200W */
const GT1200 = (color) => ({ wattage: '1200', rating: '80+ Gold', modularity: 'Full', formFactor: 'ATX 3.1', color });

const PARTS = [
  /* ============================== لوحات أمّ ============================== */
  {
    categoryId: MB, brand: 'ASUS', name: 'ROG Crosshair X870E Dark Hero', tdpWattage: 20, performanceTier: 5,
    specs: { socket: AM5, chipset: 'X870E', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '5', wifi: 'Wi-Fi 7', lan: '10GbE + 5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '8600+ MT/s (OC)' },
    offers: [A('B09BFGYPRH'), M('asus-rog-crosshair-x870e-dark-hero-atx-am5-motherboard-amd-x870e-chipset-4x-ddr5-dimm-slots-256gb-max-memory-2x-pcie-5-0-x16-slots-5x-m-2-slots-90mb1nt0-m0eay0')],
    description: `### ASUS ROG Crosshair X870E Dark Hero

أعلى لوحات ROG لمنصّة AM5 بتصميمٍ أسود كامل: مراحل طاقة 20+2+2، وشبكتان سلكيّتان (10 و5 جيجابت)، وخمسة منافذ M.2. تناسب جهازاً رائداً بمعالج 9950X3D لمن يريد كسر السرعة وأفضل عتادٍ ممكن.

**التقنيات الأساسية المدعومة:**

[green]مراحل طاقة 20+2+2:[/green] تتحمّل Ryzen 9 تحت كسر سرعةٍ طويل بلا خنقٍ حراريّ، تحت مشتّتاتٍ ضخمة.

[green]شبكتان سلكيّتان (10 و5 جيجابت):[/green] لنقل الملفّات الضخمة إلى جهاز تخزينٍ شبكيّ بسرعة قرصٍ داخليّ.

[green]واي‑فاي 7 (MediaTek MT7927):[/green] بعرض 320MHz، أسرع معيارٍ لاسلكيّ.

[green]خمسة منافذ M.2 وأربعة منافذ SATA:[/green] مكتبة أقراصٍ كاملة بلا بطاقة توسعة.

[green]منفذا USB4 بسرعة 40 جيجابت:[/green] مع صورة، ومنفذا USB-C أماميّان بسرعة 20 جيجابت.

[green]صوت SupremeFX ALC4082 مع محوّل ESS:[/green] أنقى صوتٍ مدمج في لوحات ASUS.

[green]ذاكرة DDR5 حتى 8600 MT/s كسر سرعة مع Ryzen 9000:[/green] بتقنية NitroPath لثبات الإشارة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سعرها من الأعلى في الكتالوج، ومزاياها لكسر السرعة والعمل لا لزيادة الفريمات.
* توزيع مسارات المنافذ الخمسة يتغيّر بحسب سلسلة المعالج؛ راجع الدليل قبل ملئها كلّها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تقبل معالجات AM4.
* مبالغةٌ لجهاز ألعابٍ عاديّ.

${alt('CHHERO', 'المنصّة نفسها من خطّ Crosshair بسعرٍ أقلّ، بشبكة 5 جيجابت بدل 10.')}
https://rog.asus.com/motherboards/rog-crosshair/rog-crosshair-x870e-dark-hero/spec/`,
  },
  {
    categoryId: MB, brand: 'ASUS', name: 'ROG Strix X870E-A Gaming WiFi7 NEO', tdpWattage: 15, performanceTier: 4,
    specs: { socket: AM5, chipset: 'X870E', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '4', wifi: 'Wi-Fi 7', lan: '5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '8600+ MT/s (OC)', color: 'White' },
    offers: [A('B0GS3JDMGD'), M('asus-rog-strix-x870e-a-gaming-wifi7-neo-atx-am5-motherboard-amd-x870e-chipset-4x-dimm-ddr5-slots-up-to-256gb-max-memory-1x-pcie-5-0-x16-safeslot-4x-m-2-slots-90mb1p30-m0eay0')],
    description: `### ASUS ROG Strix X870E-A Gaming WiFi7 NEO

لوحة ROG Strix بتصميمٍ أبيض وفضّيّ على شيبست X870E، في إصدار NEO بشبكة 5 جيجابت وواي‑فاي 7. تناسب تجميعة ألعابٍ بيضاء قويّة بمعالج 9800X3D أو Ryzen 9.

**التقنيات الأساسية المدعومة:**

[green]شيبست X870E وتصميمٌ أبيض:[/green] شريحتان في اللوحة لمساراتٍ أكثر، بمشتّتاتٍ فاتحة تناسب الصناديق البيضاء.

[green]مراحل طاقة 16+2+2:[/green] تتحمّل Ryzen 9 تحت الحمل الطويل.

[green]أربعة منافذ M.2 وأربعة منافذ SATA:[/green] الأوّل بالجيل الخامس، فتتّسع لأقراصٍ كثيرة.

[green]شبكة Realtek بسرعة 5 جيجابت وواي‑فاي 7 (MT7925):[/green] ضعف الشبكة المعتادة، وأحدث معيارٍ لاسلكيّ.

[green]منفذا USB4 بسرعة 40 جيجابت:[/green] مع صورة، لأقراصٍ خارجيّة سريعة.

[green]صوت SupremeFX ALC4080:[/green] شريحة ROG الأنقى.

[green]ذاكرة DDR5 حتى 8600 MT/s كسر سرعة مع Ryzen 9000:[/green] أربع فتحات حتى 256 جيجابايت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الواي‑فاي بعرض 160MHz لا 320MHz كلوحات الفئة العليا.
* أغلى بوضوح من لوحات B850 البيضاء، والفرق أساساً في USB4 والمسارات.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تقبل معالجات AM4.

${alt('X870EE', 'شيبست X870E من ROG Strix بخمسة منافذ M.2 وتصميمٍ داكن.')}
https://rog.asus.com/motherboards/rog-strix/rog-strix-x870e-a-gaming-wifi7-neo/spec/`,
  },
  {
    categoryId: MB, brand: 'ASUS', name: 'ROG Strix X870E-H Gaming WiFi7', tdpWattage: 15, performanceTier: 4,
    specs: { socket: AM5, chipset: 'X870E', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '4', wifi: 'Wi-Fi 7', lan: '5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '8000+ MT/s (OC)' },
    offers: [A('B09CD4WSR6'), M('asus-rog-strix-x870e-h-gaming-wifi-7-atx-motherboard-amd-x870e-chipset-4x-ddr5-dimm-slots-256gb-max-memory-1x-pcie-5-0-x16-slots-4-x-m-2-slots-90mb1m90-m0eay0')],
    description: `### ASUS ROG Strix X870E-H Gaming WiFi7

مدخل ROG Strix إلى شيبست X870E: منفذا M.2 من الجيل الخامس، وشبكة 5 جيجابت، ومنفذا USB4. تناسب تجميعة ألعابٍ قويّة على AM5 لمن يريد X870E بأقلّ سعرٍ في سلسلة ROG.

**التقنيات الأساسية المدعومة:**

[green]منفذا M.2 بالجيل الخامس من المعالج:[/green] ومنفذان آخران من الشيبست بالجيل الرابع، مع أربعة منافذ SATA.

[green]شبكة Realtek بسرعة 5 جيجابت:[/green] ضعف الشبكة المعتادة، مع حماية LANGuard.

[green]واي‑فاي 7 (Realtek RTL8922AE) وبلوتوث 5.4:[/green] بلا بطاقةٍ إضافيّة.

[green]منفذا USB4 بسرعة 40 جيجابت:[/green] مع صورة، لأقراصٍ خارجيّة أو شاشةٍ إضافيّة.

[green]فتحة كرت PCIe 5.0 x16 مدعّمة:[/green] تتحمّل وزن الكروت الضخمة.

[green]ذاكرة DDR5 حتى 8000 MT/s كسر سرعة:[/green] أربع فتحات حتى 256 جيجابايت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* صوت Realtek ALC1220P لا شريحة SupremeFX كباقي لوحات Strix.
* منفذ M.2 الثاني بالجيل الخامس لا يعمل مع معالجات Ryzen 8000.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تقبل معالجات AM4.

${alt('X870ETMAX', 'شيبست X870E نفسه بسعرٍ أقلّ عادةً وصوتٍ أفضل (ALC4080).')}
https://rog.asus.com/motherboards/rog-strix/rog-strix-x870e-h-gaming-wifi7/spec/`,
  },
  {
    categoryId: MB, brand: 'ASUS', name: 'TUF Gaming X870-PRO WiFi7 W NEO', tdpWattage: 15, performanceTier: 4,
    specs: { socket: AM5, chipset: 'X870', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '4', wifi: 'Wi-Fi 7', lan: '5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '8600+ MT/s (OC)', color: 'White' },
    offers: [A('B09D2VXY7B'), M('asus-tuf-gaming-x870-pro-wifi7-w-neo-atx-am5-motherboard-amd-x870-chipset-4x-dimm-ddr5-slots-up-to-256gb-max-memory-1x-pcie-5-0-x16-safeslot-4x-m-2-slots-90mb1ny0-m0eay0')],
    description: `### ASUS TUF Gaming X870-PRO WiFi7 W NEO

النسخة البيضاء بالكامل من TUF X870-PRO: لوحة الدارة والمشتّتات وفتحات الذاكرة كلّها بيضاء، مع شبكة 5 جيجابت ومنفذَي USB4. تناسب تجميعة بيضاء قويّة على AM5.

**التقنيات الأساسية المدعومة:**

[green]أبيض بالكامل حتى لوحة الدارة:[/green] نادرٌ في اللوحات، فتختفي اللوحة في تجميعةٍ بيضاء.

[green]مراحل طاقة 16+2+1 بقدرة 80 أمبير:[/green] على لوحة دارة من ثماني طبقات، تتحمّل Ryzen 9.

[green]شيبست X870 ومنفذا USB4:[/green] 40 جيجابت مع صورة، وهو ما لا تعطيه لوحات B850.

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج.

[green]شبكة Realtek بسرعة 5 جيجابت وواي‑فاي 7 (RTL8922AE):[/green] ضعف الشبكة المعتادة.

[green]ذاكرة DDR5 حتى 8600 MT/s كسر سرعة مع Ryzen 9000:[/green] بتقنية NitroPath لثبات الإشارة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذا SATA فقط.
* صوت Realtek ALC1220P، جيّدٌ لا من الفئة العليا.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تقبل معالجات AM4.

${alt('B850PROW', 'لوحة TUF البيضاء نفسها تقريباً بشيبست B850 وسعرٍ أقلّ، بلا USB4.')}
https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-x870-pro-wifi7-w-neo/techspec/`,
  },
  {
    categoryId: MB, brand: 'ASUS', name: 'ROG Strix B850-G Gaming WiFi', tdpWattage: 10, performanceTier: 4,
    specs: { socket: AM5, chipset: 'B850', formFactor: 'Micro-ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '4', wifi: 'Wi-Fi 7', lan: '2.5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '8000+ MT/s (OC)', color: 'White' },
    offers: [A('B0BSH7KHK5'), M('asus-rog-strix-b850-g-gaming-wifi-am5-micro-atx-motherboard-amd-b850-chipset-4x-dimm-ddr5-slots-256gb-max-memory-1x-pcie-5-0-x16-safeslot-4x-m-2-slots-90mb1m30-m0eay0')],
    description: `### ASUS ROG Strix B850-G Gaming WiFi

لوحة Micro-ATX من ROG Strix بلوحة دارة بيضاء وأربعة منافذ M.2، وهو عددٌ نادر في هذا الحجم. تناسب تجميعة بيضاء صغيرة قويّة بمعالج 9800X3D.

**التقنيات الأساسية المدعومة:**

[green]لوحة دارة بيضاء ومشتّتات فضّيّة:[/green] للصناديق البيضاء الصغيرة، بإضاءة Aura Sync.

[green]أربعة منافذ M.2 في مقاس Micro-ATX:[/green] الأوّل بالجيل الخامس، فلا تضطرّ إلى لوحة ATX لأقراصٍ كثيرة.

[green]مراحل طاقة 14+2+1:[/green] تتحمّل Ryzen 7 و9 في صندوقٍ صغير.

[green]شبكة Intel بسرعة 2.5 جيجابت وواي‑فاي 7:[/green] بلا بطاقةٍ إضافيّة.

[green]فتحة كرت PCIe 5.0 x16 مدعّمة (SafeSlot):[/green] تتحمّل وزن الكروت الضخمة.

[green]ذاكرة DDR5 حتى 8000 MT/s كسر سرعة:[/green] أربع فتحات حتى 256 جيجابايت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذا SATA فقط.
* صوت Realtek ALC1220P لا SupremeFX.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا منفذ USB4.
* لا تقبل معالجات AM4.

${alt('B850MORTAR', 'لوحة B850 صغيرة بتصميمٍ داكن، بشبكة 5 جيجابت ومنفذَي M.2 من الجيل الخامس.')}
https://rog.asus.com/motherboards/rog-strix/rog-strix-b850-g-gaming-wifi/spec/`,
  },
  {
    categoryId: MB, brand: 'NZXT', name: 'N7 B850 Black', tdpWattage: 10, performanceTier: 4,
    specs: { socket: AM5, chipset: 'B850', formFactor: 'ATX', ramType: 'DDR5', maxRam: '192GB', m2Slots: '3', wifi: 'Wi-Fi 6E', lan: '2.5GbE', pcieVersion: 'PCIe 5.0', color: 'Black' },
    offers: [A('B0FK13RWDJ'), M('nzxt-n7-b850-am5-atx-motherboard-amd-b850-chipset-4x-ddr5-dimm-slots-up-to-192gb-max-memory-1x-pcie-5-0-x16-slots-3x-m-2-slots-black-n7-b85xt-b1')],
    description: `### NZXT N7 B850 Black

لوحة NZXT بغطاءٍ معدنيّ يخفي اللوحة كلّها تقريباً فتبدو قطعةً واحدة نظيفة، مع تحكّمٍ بالمراوح والإضاءة من برنامج NZXT CAM. تناسب تجميعة NZXT متناسقة بصندوق H5 أو H9.

**التقنيات الأساسية المدعومة:**

[green]غطاءٌ معدنيّ كامل:[/green] يخفي المكوّنات والكابلات الصغيرة، فيبدو الجهاز مرتّباً من الزجاج.

[green]تحكّم NZXT CAM:[/green] منافذ NZXT للمراوح والإضاءة تُدار من البرنامج نفسه الذي يدير مبرّدات Kraken.

[green]مراحل طاقة 16+2+1:[/green] تتحمّل Ryzen 9 تحت الحمل الطويل.

[green]ثلاثة منافذ M.2:[/green] الأوّل بالجيل الخامس x4، والثاني بالجيل الرابع x4، مع أربعة منافذ SATA.

[green]فتحة كرت PCIe 5.0 x16:[/green] من المعالج مباشرة.

[green]صوت Realtek ALC1220 مع مخرج S/PDIF.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* واي‑فاي 6E لا 7، وبلوتوث 5.2.
* الذاكرة حتى 192 جيجابايت لا 256.
* منفذ M.2 الثالث بالجيل الرابع x2.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا منفذ USB4.
* لا تقبل معالجات AM4.

${alt('B850TW', 'لوحة B850 بشبكة 5 جيجابت وواي‑فاي 7 بسعرٍ أقلّ، بلا الغطاء الكامل.')}
https://nzxt.com/products/n7-b850`,
  },
  {
    categoryId: MB, brand: 'MSI', name: 'MPG Z890I EDGE TI WIFI', tdpWattage: 15, performanceTier: 4,
    specs: { socket: 'LGA1851', chipset: 'Z890', formFactor: 'Mini-ITX', ramType: 'DDR5', maxRam: '128GB', m2Slots: '4', wifi: 'Wi-Fi 7', lan: '5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '8600 MT/s (OC)', color: 'White' },
    offers: [A('B0DPY43LJC'), M('msi-mpg-z890i-edge-ti-wifi-lga-1851-mini-itx-motherboard-intel-z890-chipset-2x-ddr5-udimm-slots-up-to-128gb-max-memory-1x-pci-e-x16-slots-4x-m-2-slots-wifi-bt-connectivity-911-7e33-004')],
    description: `### MSI MPG Z890I EDGE TI WIFI

لوحة Mini-ITX بيضاء بشيبست Z890 لمعالجات Core Ultra: أربعة منافذ M.2 ومنفذا Thunderbolt 4 وشبكة 5 جيجابت في لوحةٍ بحجم 17×17 سم. تناسب تجميعة Intel صغيرة رائدة بمعالج K.

**التقنيات الأساسية المدعومة:**

[green]شيبست Z890 في مقاس Mini-ITX:[/green] كسر سرعة معالجات K والذاكرة في تجميعةٍ صغيرة.

[green]أربعة منافذ M.2:[/green] بالجيلين الخامس والرابع، رقمٌ نادر في لوحةٍ بهذا الحجم.

[green]منفذا Thunderbolt 4:[/green] 40 جيجابت مع صورةٍ حتى 8K، لأقراصٍ خارجيّة وشاشاتٍ بكابلٍ واحد.

[green]شبكة Intel Killer E5000B بسرعة 5 جيجابت وواي‑فاي 7 (BE1750x):[/green] بلا بطاقةٍ إضافيّة.

[green]صوت Realtek ALC4080 ومنفذ USB-C أماميّ بسرعة 20 جيجابت:[/green] يشحن حتى 27 واط.

[green]لونٌ أبيض (EDGE TI):[/green] يناسب الصناديق البيضاء الصغيرة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا ذاكرة فقط (حتى 128 جيجابايت): زيادة السعة لاحقاً تعني استبدال الطقم.
* منفذا SATA فقط، وفتحة توسعة واحدة للكرت.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تقبل معالجات الجيل 12 إلى 14 (LGA1700).

${alt('Z790I', 'لوحة Mini-ITX من ROG لمنصّة Intel السابقة (LGA1700)، لمعالجات الجيل 12 إلى 14.')}
https://www.msi.com/Motherboard/MPG-Z890I-EDGE-TI-WIFI/Specification`,
  },
  {
    categoryId: MB, brand: 'Gigabyte', name: 'Z890 EAGLE WiFi7 PLUS', tdpWattage: 15, performanceTier: 3,
    specs: { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '4', wifi: 'Wi-Fi 7', lan: '2.5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '9466+ MT/s (OC)' },
    offers: [A('B0GV17GF1T'), M('gigabyte-z890-eagle-wifi7-plus-atx-lga-1851-motherboard-intel-z890-chipset-4x-ddr5-dimm-slots-up-to-256gb-max-memory-1x-pcie-5-0-x16-with-pcie-ud-slot-4x-m-2-slots-z890-eagle-wifi7-p')],
    description: `### Gigabyte Z890 EAGLE WiFi7 PLUS

لوحة Z890 اقتصاديّة من Gigabyte في إصدار PLUS المحدّث: كسر سرعة معالجات K، وأربعة منافذ M.2، وواي‑فاي 7، ومنفذ USB4. تناسب تجميعة Core Ultra 7 K بميزانيّةٍ معقولة.

**التقنيات الأساسية المدعومة:**

[green]شيبست Z890:[/green] يفتح مضاعف معالجات K وكسر سرعة الذاكرة معاً.

[green]مراحل طاقة 14+1+2:[/green] كافيةٌ لـ Core Ultra 7 K وكسر سرعةٍ معتدل.

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج، والبقيّة بالجيل الرابع.

[green]ذاكرة DDR5 حتى 9466 MT/s كسر سرعة:[/green] مع دعم ذاكرة CUDIMM، حتى 256 جيجابايت.

[green]منفذ USB4 ومخرج DisplayPort 2.1:[/green] صورةٌ من المعالج، ونقلٌ سريع لأقراصٍ خارجيّة.

[green]واي‑فاي 7 (Intel BE202) وبلوتوث 5.4:[/green] بلا بطاقةٍ إضافيّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الشبكة السلكيّة 2.5 جيجابت لا 5.
* الواي‑فاي بعرض 160MHz لا 320MHz.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تقبل معالجات الجيل 12 إلى 14 (LGA1700).

${alt('Z890ELP', 'إصدار PLUS الأعلى من Gigabyte بشبكة 5 جيجابت وواي‑فاي BE200 بعرض 320MHz.')}
https://www.gigabyte.com/Motherboard/Z890-EAGLE-WIFI7-PLUS/sp`,
  },
  {
    categoryId: MB, brand: 'Gigabyte', name: 'Z890 D PLUS', tdpWattage: 15, performanceTier: 3,
    specs: { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '4', wifi: 'No', lan: '2.5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '9466+ MT/s (OC)' },
    offers: [A('B0GVQ4FQXF'), M('gigabyte-z890-d-plus-lga-1851-atx-motherboard-intel-z890-chipset-4x-ddr5-dimm-slots-up-to-256gb-max-memory-1x-pcie-5-0-x16-with-pcie-ud-slot-4x-m-2-slots-z890-d-plus')],
    description: `### Gigabyte Z890 D PLUS

أرخص طريقٍ إلى شيبست Z890 من Gigabyte: كسر سرعة معالجات K وأربعة منافذ M.2، بلا واي‑فاي. تناسب جهاز Core Ultra 7 K متّصلاً بكابل شبكة لمن يريد كسر السرعة بأقلّ كلفة.

**التقنيات الأساسية المدعومة:**

[green]شيبست Z890 بسعرٍ منخفض:[/green] كسر سرعة المعالج والذاكرة، وهو ما يمنعه B860.

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج، والبقيّة بالجيل الرابع x4.

[green]ذاكرة DDR5 حتى 9466 MT/s كسر سرعة:[/green] مع دعم CUDIMM، حتى 256 جيجابايت.

[green]فتحة كرت PCIe 5.0 بتحريرٍ سريع:[/green] الكرت يُفكّ بزرّ.

[green]شبكة Realtek بسرعة 2.5 جيجابت:[/green] أسرع من أغلب اتّصالات الإنترنت المنزليّة.

[green]رأسٌ لبطاقة Thunderbolt:[/green] يمكن إضافة Thunderbolt لاحقاً ببطاقة توسعة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا واي‑فاي ولا بلوتوث؛ الاتّصال اللاسلكيّ يحتاج بطاقة.
* مراحل طاقة 12+1+2 اقتصاديّة، فلا تناسب كسر سرعة Core Ultra 9 تحت حملٍ طويل.
* مخرج صورة واحد (DisplayPort) وصوتٌ أساسيّ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا منفذ USB4.
* لا تقبل معالجات الجيل 12 إلى 14.

${alt('Z890S', 'لوحة Z890 اقتصاديّة بواي‑فاي 7 ومنفذ Thunderbolt 4.')}
https://www.gigabyte.com/Motherboard/Z890-D-PLUS/sp`,
  },
  {
    categoryId: MB, brand: 'MSI', name: 'PRO H610M-E', tdpWattage: 7, performanceTier: 1,
    specs: { socket: 'LGA1700', chipset: 'H610', formFactor: 'Micro-ATX', ramType: 'DDR5', maxRam: '96GB', m2Slots: '1', wifi: 'No', lan: '1GbE', pcieVersion: 'PCIe 4.0', memorySpeed: '5600 MT/s' },
    offers: [A('B0CC9G49JQ'), M('msi-pro-h610m-e-lga-1700-micro-atx-motherboard-intel-h610-chipset-2x-ddr5-dimm-slots-96gb-max-memory-1x-pcie-4-0-x16-1x-m-2-slot-4x-sata-6g-slots-911-7d48-075')],
    description: `### MSI PRO H610M-E

أبسط لوحة DDR5 لمعالجات Intel من الجيل 12 إلى 14، بسعرٍ منخفض جداً. تناسب جهازاً مكتبيّاً أو جهاز ألعابٍ اقتصاديّاً بمعالج Core i3 أو i5 مثل 12400F أو 14400F.

**التقنيات الأساسية المدعومة:**

[green]مقبس LGA1700:[/green] يقبل معالجات الجيل 12 و13 و14، وهي اليوم أرخص معالجات Intel.

[green]ذاكرة DDR5 حتى 5600 MT/s:[/green] فتحتان حتى 96 جيجابايت، مع ملفّات XMP 3.0.

[green]فتحة كرت PCIe 4.0 x16:[/green] تكفي أيّ كرتٍ حاليّ بلا فرقٍ ملموس عن الجيل الخامس.

[green]أربعة منافذ SATA:[/green] لأقراص التخزين التقليديّة الكبيرة.

[green]مخرجا HDMI وVGA:[/green] للمعالجات ذات الرسوميات المدمجة، والـ VGA للشاشات القديمة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **منفذ M.2 واحد وهو من الجيل الثالث**، فقرص Gen4 يعمل بنصف سرعته القصوى.
* شبكة 1 جيجابت فقط، وفتحتا ذاكرة لا أربع.
* منفذ SATA الخامس يتعطّل إن رُكّب قرص M.2 من نوع SATA.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا واي‑فاي، ولا كسر سرعة للمعالج ولا للذاكرة فوق 5600.
* لا تقبل معالجات Core Ultra (LGA1851).

${alt('H610HDV', 'لوحة H610 بذاكرة DDR5 من ASRock بثلاثة مخارج عرض ومنفذ USB-C.')}
https://www.msi.com/Motherboard/PRO-H610M-E/Specification`,
  },

  /* ============================== كيسات ============================== */
  {
    categoryId: CASE, brand: 'Thermaltake', name: 'View 600 TG Snow', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Full Tower', maxGpuLength: '480', psuFormFactor: 'ATX', maxCoolerHeight: '175', radiatorSupport: '420mm', includedFans: 'لا يوجد', color: 'White', features: ['يدعم لوحات Back-Connect', 'يقبل لوحات E-ATX', 'زجاج على أربع جهات'] },
    offers: [A('B0FMYCDKDC'), M('thermaltake-view-600-tg-snow-full-tower-chassis-e-atx-case-with-4-tempered-glass-panels-420mm-radiator-support-high-airflow-gaming-design-snow-ca-11h-00f6wn-00')],
    description: `### Thermaltake View 600 TG Snow

النسخة البيضاء من View 600: صندوق Full Tower بانوراميّ بأربعة ألواح زجاجيّة 4 مم، يتّسع لأضخم القطع ولرادييترين بحجم 420 مم. يناسب تجميعة عرضٍ بيضاء رائدة.

**التقنيات الأساسية المدعومة:**

[green]أبيض بالكامل:[/green] الهيكل والداخل أبيضان، فتظهر القطع البيضاء بلا خلفيّةٍ داكنة.

[green]كرت حتى 480 مم:[/green] أطول ممّا يحتاجه أيّ كرتٍ حاليّ.

[green]رادييتر 420 مم في السقف وفي الجانب:[/green] مكانان لأكبر مقاسٍ شائع.

[green]أربعة ألواح زجاجيّة 4 مم:[/green] رؤيةٌ للقطع من الأمام والجانب.

[green]يقبل لوحات E-ATX ولوحات Back-Connect:[/green] لوحات الموصلات الخلفيّة تخفي الكابلات.

[green]مزوّد حتى 220 مم ومبرّد هوائيّ حتى 175 مم.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **بلا مراوح مرفقة**: يتّسع لعشر مراوح، وكلّها تُشترى منفصلة، فاحسبها في الميزانيّة.
* حجمه كبير جدّاً (560 × 249 × 584 مم) ويحتاج مكاناً على الأرض.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس صندوق تهويةٍ شبكيّاً؛ الزجاج يحتاج مراوح كافية ليبرّد جيّداً.

${alt('V600B', 'الصندوق نفسه بالأسود، وسعره أقلّ عادةً.')}
https://thermaltake.com/products/view-600-tg-snow-full-tower-chassis`,
  },
  {
    categoryId: CASE, brand: 'TRYX', name: 'FLOVA F50 Black', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '360', psuFormFactor: 'ATX', maxCoolerHeight: '170', radiatorSupport: '360mm', includedFans: 'Cross Flow + 1x 120mm', color: 'Black', features: ['يدعم لوحات Back-Connect', 'مروحة Cross Flow أماميّة'] },
    offers: [A('B0G6KSC2G8'), M('tryx-flova-f50-mid-tower-pc-case-supports-360mm-radiator-3x-120mm-pre-installed-cross-flow-fan-innovative-crossflow-cooling-system-fabric-mesh-tempered-glass-panel-black-c-f500f-fm1e-g0k')],
    description: `### TRYX FLOVA F50 Black

صندوق متوسّط بفكرةٍ مختلفة: مروحة Cross Flow أسطوانيّة في الواجهة تدفع الهواء بعرض الصندوق كلّه بهدوء، وواجهةٌ من القماش الشبكيّ. يناسب تجميعة ألعابٍ هادئة بمظهرٍ أقرب إلى الأثاث.

**التقنيات الأساسية المدعومة:**

[green]مروحة Cross Flow أماميّة:[/green] أسطوانةٌ طويلة تدفع الهواء على ارتفاع الصندوق كلّه بسرعةٍ منخفضة، فالتدفّق كبير والصوت قليل.

[green]واجهة من القماش الشبكيّ:[/green] تمرّ منها الهواء بسهولة وتخفي الداخل، مع فلاتر غبار من أربع جهات.

[green]يقبل لوحات Back-Connect (ATX):[/green] مثل Project Zero وBTF، فتختفي الكابلات من الواجهة.

[green]رادييتر 360 مم في الواجهة و280 مم في السقف أو الجانب:[/green] مرونةٌ في مكان مبرّد السوائل.

[green]منفذا USB-C بسرعة 10 جيجابت في الواجهة:[/green] ومنفذا USB-A.

[green]مبرّد هوائيّ حتى 170 مم ومزوّد حتى 200 مم.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **الكرت حتى 360 مم مع مروحة Cross Flow** (420 مم بنزعها)، فأضخم نسخ RTX 5090 قد لا تدخل وهي مركّبة.
* مساحة الكابلات خلف اللوحة 40 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس صندوق عرضٍ زجاجيّاً من الأمام؛ الزجاج في الجانب فقط.

${alt('POP2AIR', 'صندوق تهويةٍ تقليديّ بثلاث مراوح RGB وكرتٍ حتى 416 مم، وسعرٍ أقلّ.')}
https://www.tryx.com/en/products/cases/flova/flova-f50/black`,
  },
  {
    categoryId: CASE, brand: 'Cooler Master', name: 'Elite 681 White', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '410', psuFormFactor: 'ATX', maxCoolerHeight: '160', radiatorSupport: '360mm', includedFans: '3x 120mm ARGB Reverse + 1x 120mm ARGB', color: 'White', features: ['زجاج بانوراميّ'] },
    offers: [A('B0FCRHYFHV'), M('cooler-master-elite-681-atx-computer-case-4x-120mm-pre-installed-fans-up-to-360mm-radiator-support-7-expansion-slots-tempered-glass-side-panel-white-e681-whnn-s00')],
    description: `### Cooler Master Elite 681 White

صندوق بانوراميّ أبيض بزجاجٍ في الواجهة والجانب وأربع مراوح ARGB مرفقة، بسعرٍ اقتصاديّ. يناسب تجميعة ألعابٍ بيضاء مضيئة بميزانيّةٍ محدودة.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح ARGB مرفقة:[/green] ثلاث بشفراتٍ معكوسة في الجانب (الوجه المضيء نحو الزجاج) وواحدة في الخلف.

[green]زجاجٌ في الواجهة والجانب:[/green] رؤيةٌ بانوراميّة للقطع والإضاءة.

[green]كرت حتى 410 مم:[/green] يتّسع لأطول الكروت الحاليّة تقريباً.

[green]رادييتر 360 مم في السقف أو في الأسفل:[/green] و280 مم في الجانب.

[green]منفذ USB-C بسرعة 20 جيجابت:[/green] ومنفذا USB 3.0 في الواجهة.

[green]مزوّد حتى 240 مم:[/green] لأيّ مزوّد ATX مهما كانت قدرته.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هوائيّ حتى 160 مم فقط؛ الأبراج المزدوجة الشائعة (155 مم) تدخل، والأطول لا.
* الصناديق الزجاجيّة تبرّد أقلّ من الشبكيّة عند العدد نفسه من المراوح.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات E-ATX.

${alt('E502W', 'صندوق Cooler Master أبيض بواجهةٍ شبكيّة لتهويةٍ أقوى ومبرّدٍ حتى 170 مم.')}
https://www.coolermaster.com/en-global/products/elite-681.html`,
  },

  /* ============================== مزوّدات ============================== */
  {
    categoryId: PSU, brand: 'Thermaltake', name: 'Toughpower GT 1200W', tdpWattage: 0, performanceTier: 5,
    specs: GT1200('Black'),
    offers: [A('B0FCS5J6Z6'), M('thermaltake-toughpower-gt-1200w-fully-modular-power-supply-1200w-power-80-plus-gold-efficiency-active-pfc-120cm-hydraulic-bearing-fan-atx-3-1-ready-black-ps-tpt-1200fnfagk-3')],
    description: `### Thermaltake Toughpower GT 1200W

مزوّد Thermaltake بقدرة 1200 واط Gold ومعيار ATX 3.1، بكابلَي 12V-2x6 أصليّين. يناسب جهازاً رائداً بكرت RTX 5090 ومعالجٍ عالي الاستهلاك.

**التقنيات الأساسية المدعومة:**

[green]كابلا 12V-2x6 (12+4) وخمسة موصّلات 6+2:[/green] لكرت RTX 5090 بكابلٍ مستقلّ، وللكروت الأقدم بموصّلات عدّة.

[green]1200 واط:[/green] هامشٌ واسع يتحمّل قفزات استهلاك الكروت الرائدة دون أن يقترب من حدّه.

[green]معيار ATX 3.1 وPCIe 5.1:[/green] آخر نسخةٍ من المواصفة.

[green]وضع إيقاف المروحة الذكيّ:[/green] لا تدور المروحة في الحمل الخفيف.

[green]كابلات منفصلة بالكامل وحمايات كاملة:[/green] OVP وUVP وOCP وOPP وOTP وSCP.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* غير مُدرَج في تقييم SPL بعد، فلا تقييم مستقلّاً لجودته.
* مروحة 120 مم بمحمل هيدروليكيّ، أعلى صوتاً تحت الحمل الكامل من مراوح 135 و140 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* 1200 واط تزيد كثيراً عن حاجة الأجهزة المتوسّطة.

${alt('A1250GS', 'مزوّد بقدرةٍ قريبة ودرجة A في تقييم SPL ومروحة 135 مم أهدأ.')}
https://thermaltake.com/products/toughpower-gt-1200w`,
  },
  {
    categoryId: PSU, brand: 'Thermaltake', name: 'Toughpower GT 1200W Snow', tdpWattage: 0, performanceTier: 5,
    specs: GT1200('White'),
    offers: [A('B0FCS33ZTF'), M('thermaltake-toughpower-gt-1200w-fully-modular-power-supply-1200w-power-80-plus-gold-efficiency-active-pfc-120mm-hydraulic-bearing-fan-atx-3-1-ready-white-ps-tpt-1200fnfagk-w')],
    description: `### Thermaltake Toughpower GT 1200W Snow

النسخة البيضاء بقدرة 1200 واط من Toughpower GT: كابلات بيضاء منفصلة بالكامل وكابلا 12V-2x6. يناسب تجميعة بيضاء رائدة بكرت RTX 5090.

**التقنيات الأساسية المدعومة:**

[green]أبيض بالكامل مع الكابلات:[/green] لا يظهر كابلٌ أسود خلف الزجاج في تجميعةٍ بيضاء.

[green]كابلا 12V-2x6 (12+4) وخمسة موصّلات 6+2:[/green] لكرت RTX 5090 بكابلٍ مستقلّ، وللكروت الأقدم بموصّلات عدّة.

[green]1200 واط:[/green] هامشٌ واسع لأقوى الكروت والمعالجات.

[green]معيار ATX 3.1 وPCIe 5.1:[/green] آخر نسخةٍ من المواصفة.

[green]وضع إيقاف المروحة الذكيّ:[/green] صامتٌ في الحمل الخفيف.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* غير مُدرَج في تقييم SPL بعد.
* مروحة 120 مم، أعلى صوتاً تحت الحمل الكامل من مراوح 135 و140 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* 1200 واط تزيد كثيراً عن حاجة الأجهزة المتوسّطة.

${alt('GT1000S', 'المزوّد نفسه باللون نفسه بقدرة 1000 واط، يكفي RTX 5080.')}
https://thermaltake.com/products/toughpower-gt-snow-1200w`,
  },
  {
    categoryId: PSU, brand: 'Lian Li', name: 'RB750', tdpWattage: 0, performanceTier: 2,
    specs: { wattage: '750', rating: '80+ Bronze', modularity: 'Non', formFactor: 'ATX 3.1', color: 'Black' },
    offers: [A('B0FYH5FBRW'), M('lian-li-rb-series-750w-80-plus-bronze-atx-3-1-power-supply-non-modular-psu-with-135mm-hyb-fan-black-rb0750b')],
    description: `### Lian Li RB750

مزوّد Lian Li الاقتصاديّ بقدرة 750 واط Bronze ومعيار ATX 3.1 ومروحة 135 مم. يناسب جهاز ألعابٍ متوسّطاً بكرت RTX 5060 Ti أو 5070 بميزانيّةٍ محدودة.

**التقنيات الأساسية المدعومة:**

[green]معيار ATX 3.1:[/green] يتحمّل قفزات استهلاك الكروت الحديثة متوسّطة الاستهلاك.

[green]مروحة 135 مم بمحمل هيدروليكيّ:[/green] تدفع هواءً أكثر بسرعةٍ أقلّ من مراوح 120.

[green]ستّ حمايات:[/green] OPP وOVP وSCP وOCP وUVP وOTP، الحدّ الذي يجب ألّا يُتنازل عنه.

[green]كفاءة 80 PLUS Bronze:[/green] كافيةٌ لجهازٍ لا يعمل تحت حملٍ ثقيل طوال اليوم.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* غير مُدرَج في تقييم SPL، فلا تقييم مستقلّاً لجودته.
* كابلات ثابتة غير منفصلة، فيبقى ما لا تحتاجه مكوّماً في الصندوق.
* ضجيج المروحة يصل إلى 40 ديسيبل تحت الحمل الكامل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب كروت RTX 5080 و5090.

${alt('RB650', 'المزوّد نفسه بقدرة 650 واط لجهازٍ أخفّ.')}
https://lian-li.com/product/rb-psu/`,
  },

  /* ============================== مبرّد ============================== */
  {
    categoryId: COOL, brand: 'Thermaltake', name: 'UX400 ARGB', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'Air', sizeMm: '152', sockets: SOCK_AIR, fanCount: '1', fanSize: '120mm', rgb: 'Yes', color: 'Black', tdpRating: '240' },
    offers: [A('B0FCS4Y69B'), M('thermaltake-ux400-argb-sync-cpu-cooler-120mm-pwm-fan-4-heat-pipes-design-240w-tdp-performance-62-72-cfm-airflow-9-addressable-leds-black-cl-p142-al12sw-a')],
    description: `### Thermaltake UX400 ARGB

مبرّد هوائيّ اقتصاديّ ببرجٍ واحد ومروحة 120 مم ARGB هادئة، بقدرة تبريد 240 واط. يناسب معالجات Ryzen 5 و7 وCore Ultra 5 في جهاز ألعابٍ اقتصاديّ مضيء.

**التقنيات الأساسية المدعومة:**

[green]أربعة أنابيب حراريّة بقطر 6 مم:[/green] قدرة تبريد 240 واط بحسب Thermaltake، تكفي معالجات الفئة المتوسّطة في الألعاب.

[green]مروحة 120 مم ARGB بتسعة مصابيح:[/green] تُدار من رأس ARGB في اللوحة.

[green]ضجيج 25 ديسيبل:[/green] من 700 إلى 1800 دورة، من أهدأ المبرّدات في فئته.

[green]ارتفاع 152 مم:[/green] يدخل أغلب الصناديق، ومنها صناديق Micro-ATX.

[green]يدعم LGA1851 وLGA1700 وAM5 وAM4:[/green] كلّ المنصّات الحديثة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* برجٌ واحد بمروحةٍ واحدة: لا يُقارن بالأبراج المزدوجة تحت حملٍ ثقيل طويل.
* عمر محمل المروحة المقدّر 30 ألف ساعة، أقصر من مراوح الفئة الأعلى.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب معالجات Core i9 وRyzen 9 تحت الحمل الكامل.

${alt('SE214', 'مبرّد اقتصاديّ مضيء آخر بأنابيب تلامس المعالج مباشرة وسعرٍ قريب.')}
https://thermaltake.com/products/ux400-argb-sync-cpu-cooler`,
  },

  /* ============================== قرص ============================== */
  {
    categoryId: STO, brand: 'Samsung', name: '9100 PRO 8TB Heatsink', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'NVMe M.2', capacity: '8TB', interface: 'PCIe 5.0 x4', formFactor: 'M.2 2280', readSpeed: '14800 MB/s', writeSpeed: '13400 MB/s', dramCache: 'Yes', tbw: '4800 TB' },
    offers: [A('B0FGPVM9GP'), M('samsung-9100-pro-heatsink-pcie-5-0-nvme-m-2-internal-ssd-8tb-capacity-v-nand-tlc-type-up-to-14-800-mb-s-sequential-read-up-to-13-400-mb-s-sequential-write-trim-smart-support-mz-vap8t0cw')],
    description: `### Samsung 9100 PRO 8TB Heatsink

أكبر قرص Samsung من الجيل الخامس: ثمانية تيرابايت بسرعة 14,800 ميجابايت/ث ومشتّت حرارةٍ مركّب من المصنع. يناسب محطّة عملٍ لمشاريع فيديو ضخمة، أو مكتبة ألعابٍ لا تنتهي على قرصٍ واحد.

**التقنيات الأساسية المدعومة:**

[green]قراءة 14,800 وكتابة 13,400 ميجابايت/ث:[/green] قرابة سقف PCIe 5.0، أي ضعف أسرع أقراص الجيل الرابع.

[green]سعة 8 تيرابايت:[/green] مشاريع فيديو 8K خام أو مكتبة ألعابٍ كاملة بلا قرصٍ ثانٍ.

[green]ذاكرة LPDDR4X بسعة 8 جيجابايت:[/green] أداءٌ ثابت في النسخ الطويل والكتابة العشوائيّة حتى حين يمتلئ القرص.

[green]مشتّت حرارة مرفق:[/green] أقراص الجيل الخامس تسخن فعلاً، والمشتّت يمنع خفض السرعة تحت الحمل الطويل، ويركب في PS5.

[green]تحمّل 4800 تيرابايت وضمان خمس سنوات:[/green] مع تشفير AES 256-bit وبرنامج Samsung Magician.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **يحتاج منفذ M.2 من الجيل الخامس** ليعطي سرعته؛ على منفذ Gen4 يعمل بنصفها تقريباً.
* المشتّت يرفع سُمك القرص، وقد يتعارض مع مشتّت اللوحة فوق المنفذ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعره مرتفع جدّاً، والألعاب لا تحمّل أسرع بفرقٍ ملموس.

${alt('S9100_4', 'القرص نفسه بنصف السعة وبأقلّ من نصف السعر.')}
https://www.samsung.com/us/memory-storage/nvme-ssd/9100-pro-w-heatsink-nvme-ssd-sku-mz-vap8t0cw/`,
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
  if (p.offers.length + MOVE.filter((m) => m.to === p.name && m.brand === p.brand).length < 2) bad('أقلّ من متجرين');
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
writeFileSync(`backups/added-batch14-${stamp}.json`, JSON.stringify({ PARTS, EXTRA, movedBefore }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch14-${stamp}.json`);

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
