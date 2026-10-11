/**
 * ============ الدفعة الثالثة عشرة — ٢٠ قطعة (لوحات، كيسات، مزوّدات، مبرّدات، أقراص) — 2026-10-10 ============
 *
 * طلب نوّاف: «اجمع قطع الان في جدول» ثمّ «20 فقط ولا تنسى التركيز على الوصف والمواصفات».
 * المرشّحون من مسح أقسام مايكرولس (لوحات/كيسات/مزوّدات/مبرّدات/أقراص) مطروحاً منها كلّ ما في
 * القاعدة برمز الطراز وبالاسم، ثمّ قُرئت صفحة كلّ قطعة في أمازون (العنوان، زرّ الشراء، اللون).
 * اختيرت ٢٠ متوازنة من ٤٠ (٨ لوحات، ٤ كيسات، ٣ مزوّدات، ٣ مبرّدات، قرصان).
 *
 * البيانات: جدول مواصفات مايكرولس، وما يُشكّ فيه من صفحة الشركة نفسها:
 *   - MSI PRO B860-P: منفذ Thunderbolt 4 خلفيّ وشبكة 5G وبلا واي‑فاي (msi.com).
 *   - MAG B850M Mortar / X870E Tomahawk MAX: شبكة Realtek 8126 بسرعة 5G وواي‑فاي 7 (msi.com).
 *   - ROG Strix B850-A NEO: شبكة 5Gb وواي‑فاي MT7925 بعرض 160MHz (rog.asus.com).
 *   - TUF B850-PRO W NEO: «W» = النسخة البيضاء (متاجر عدّة)، شبكة 2.5Gb، ومنفذ M.2_3 يتقاسم مع الفتحة الثانية.
 *   - X870E AORUS PRO X3D وZ890 AORUS Elite WiFi7 PLUS: شبكة 5GbE (gigabyte.com).
 *   - Toughpower GT 1000W في مايكرولس هو **Snow الأبيض** (PS-TPT-1000FNFAG*-W «Color Snow»)، فأُخذ رابط أمازون Snow.
 *   - SPL: MPG A-GS PCIE5 = A (كابل 8 سنون واحد فقط)، Power Zone 2 1000W = B+، وToughpower GT غير مُدرَج.
 *   - Elite 302: الكرت 365 مم بلا مراوح أماميّة — المراوح الثلاث مركّبةٌ في الأمام، فسُجّل 340.
 *   - 870 EVO: مايكرولس كتب MLC، وهي V-NAND ثلاثيّة البتّ (TLC).
 * استُبدل Cooler Master Elite 690 Wood بـ Hyper 411 Nano: لا صفحة رسميّة له في موقع الشركة بأيّ منطقة.
 *
 *   node scripts/add-batch13-2026-10-10.mjs           # عرض
 *   node scripts/add-batch13-2026-10-10.mjs --apply   # تنفيذ
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
  X870EGP: ['MSI X870E Gaming Plus WiFi', 'cmuzjsmyz00002kymo9ezj0td'],
  X870EP: ['MSI PRO X870E-P WiFi', 'cmuzoq11s000knoymde767t9i'],
  B850F: ['ASUS ROG Strix B850-F Gaming WiFi', 'cmuzopz9q0000noymr9ntl6gq'],
  B850E: ['ASUS TUF Gaming B850-E WiFi', 'cmuzsa0d9000tu8ymzkc8xf24'],
  B850TMAX: ['MSI MAG B850 Tomahawk MAX WiFi', 'cmuzkkgkm000ku4ymh5n59kjq'],
  B850MPLUS: ['ASUS TUF Gaming B850M-Plus WiFi', 'cmuzkkf4d0003u4ymwvmyd4uv'],
  Z890EL: ['Gigabyte Z890 AORUS Elite WiFi7', 'cmr2k5vs40005jgymmq0eke3e'],
  B860PW: ['MSI PRO B860-P WiFi', 'cmr2k5vx40006jgym04l2zz5r'],
  V390: ['Thermaltake View 390 Air Black', 'cmv1esi8t00168oymtog80dyd'],
  POP2AIR: ['Fractal Design Pop 2 Air RGB Black TG', 'cmv1esgje000r8oym8s39j89c'],
  E502: ['Cooler Master Elite 502 Black', 'cmv1esjal001f8oymawdc304m'],
  A1250GL: ['MSI MAG A1250GL PCIE5', 'cmv18ksgj0027jgymqtndzf73'],
  GT850S: ['Thermaltake Toughpower GT 850W Snow', 'cmv18kqa5001ijgymxsxq1xyc'],
  PZ850: ['be quiet! POWER ZONE 2 850W', 'cmu6n3aih000aw4ym71v9imyi'],
  PA120: ['Thermalright Peerless Assassin 120 SE ARGB', 'cmtcr2c0i0000o8ym7e5jnmft'],
  H212: ['Cooler Master Hyper 212 3DHP', 'cmv14qgrl003b50ym469u3ya4'],
  AG300: ['DeepCool AG300', 'cmszn258k0000w8ymc4gsbswk'],
  EVO2: ['Samsung 990 EVO Plus 2TB', 'cmr3fmuzl000a04lhss2v2014'],
  S870_2: ['Samsung 870 EVO 2TB SATA', 'cmuzymu3n001bwwym6emdfnzt'],
};
const alt = (k, ...why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

/* أمازون B0DQQCFFHT («MSI PRO B860-P»، رمز 7E41-002 = بلا واي‑فاي) كان على صفّ PRO B860-P WiFi
   فيعرض سعر لوحةٍ أخرى؛ يُنقل إلى صفّه الصحيح، ويأخذ صفّ WiFi رابطه الحقيقيّ B0BX6MRR8N (7E41-001). */
const MOVE = [{ offerId: 'cmsgekeb400aepsym2palzzna', from: 'cmr2k5vx40006jgym04l2zz5r', to: 'PRO B860-P', brand: 'MSI', urlHas: 'B0DQQCFFHT' }];
const EXTRA = [{ id: 'cmr2k5vx40006jgym04l2zz5r', name: 'PRO B860-P WiFi', offer: A('B0BX6MRR8N') }];

const AM5 = 'AM5';
const SOCK_AIR = 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X';

const PARTS = [
  /* ============================== لوحات أمّ ============================== */
  {
    categoryId: MB, brand: 'Gigabyte', name: 'X870E AORUS PRO X3D', tdpWattage: 20, performanceTier: 5,
    specs: { socket: AM5, chipset: 'X870E', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '4', wifi: 'Wi-Fi 7', lan: '5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '9000 MT/s (OC)' },
    offers: [A('B0G5ZXFXNH'), M('gigabyte-x870e-aorus-pro-x3d-atx-am5-motherboard-amd-x870e-chipset-4x-ddr5-dimm-slots-up-to-256gb-max-memory-1x-pcie-5-0-x16-with-pcie-ud-slots-4x-m-2-slots-x870e-a-pro-x')],
    description: `### Gigabyte X870E AORUS PRO X3D

لوحة X870E من فئة AORUS PRO، مضبوطةٌ لمعالجات Ryzen X3D مثل 9800X3D و9950X3D. تناسب جهاز ألعابٍ رائداً على AM5 لمن يريد شبكةً سريعة ومنافذ USB4 ومراحل طاقة تتحمّل Ryzen 9.

**التقنيات الأساسية المدعومة:**

[green]شيبست X870E:[/green] شريحتان في اللوحة بدل واحدة، فمسارات الأقراص والمنافذ أكثر من X870 العاديّ.

[green]وضع X3D Turbo في البيوس:[/green] إعدادٌ من Gigabyte يوجّه الألعاب إلى أنوية الكاش الإضافيّ في معالجات X3D.

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج، فتتّسع لأقراص النظام والألعاب بلا بطاقة توسعة.

[green]شبكة Realtek بسرعة 5 جيجابت وواي‑فاي 7 (Qualcomm بعرض 320MHz):[/green] ضعف الشبكة المعتادة، وأسرع معيارٍ لاسلكيّ.

[green]منفذا USB4 بسرعة 40 جيجابت:[/green] يحملان صورة الشاشة، لأقراصٍ خارجيّة سريعة أو محطّة توصيل.

[green]ذاكرة DDR5 حتى 9000 MT/s كسر سرعة:[/green] أربع فتحات حتى 256 جيجابايت، مع ملفّات EXPO.

[green]فتحة PCIe UD بتحريرٍ سريع:[/green] الكرت يُفكّ بزرّ، بلا البحث عن المزلاج تحت الكرت الضخم.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سعرها أعلى بوضوح من لوحات X870E الأساسيّة، والفرق في المراحل والشبكة لا في الفريمات.
* بعض منافذ M.2 تتقاسم المسارات مع منافذ أو فتحات أخرى؛ راجع الدليل قبل تركيب أربعة أقراص.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تقبل معالجات AM4 ولا ذاكرة DDR4.
* مقاس ATX لا يدخل الصناديق الصغيرة.

${alt('X870EGP', 'شيبست X870E نفسه وشبكة 5 جيجابت وواي‑فاي 7 بسعرٍ أقلّ، إن لم تحتج مراحل طاقة الفئة العليا.')}
https://www.gigabyte.com/Motherboard/X870E-AORUS-PRO-X3D/sp`,
  },
  {
    categoryId: MB, brand: 'MSI', name: 'MAG X870E Tomahawk MAX WiFi', tdpWattage: 15, performanceTier: 4,
    specs: { socket: AM5, chipset: 'X870E', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '4', wifi: 'Wi-Fi 7', lan: '5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '8400 MT/s (OC)' },
    offers: [A('B0GLH7F4G5'), M('msi-mag-x870e-tomahawk-max-wifi-atx-am5-motherboard-amd-x870e-chipset-4x-ddr5-udimm-slots-up-to-256gb-max-memory-3x-pci-e-x16-slots-4x-m-2-slots-911-7e59-025')],
    description: `### MSI MAG X870E Tomahawk MAX WiFi

نسخة Tomahawk من شيبست X870E: منفذا M.2 من الجيل الخامس، وشبكة 5 جيجابت، ومنفذا USB4. تناسب جهاز ألعابٍ قويّاً بمعالج 9800X3D أو Ryzen 9 لمن يريد عتاد X870E بلا سعر الفئة العليا.

**التقنيات الأساسية المدعومة:**

[green]منفذا M.2 بالجيل الخامس من المعالج:[/green] ومنفذان آخران بالجيل الرابع x4 من الشيبست، أي أربعة أقراص NVMe بلا بطاقة توسعة.

[green]فتحة كرت PCIe 5.0 x16:[/green] من المعالج مباشرة، جاهزةٌ لكروت الأجيال القادمة.

[green]شبكة Realtek 8126 بسرعة 5 جيجابت وواي‑فاي 7:[/green] ضعف الشبكة المعتادة، ونطاق 6 جيجاهرتز الأقلّ ازدحاماً.

[green]منفذا USB4:[/green] 40 جيجابت مع صورة، لأقراصٍ خارجيّة سريعة أو شاشةٍ إضافيّة.

[green]صوت Realtek ALC4080:[/green] أنقى من شرائح الصوت الاقتصاديّة، مع مخرج S/PDIF.

[green]ذاكرة DDR5 حتى 8400 MT/s كسر سرعة:[/green] أربع فتحات حتى 256 جيجابايت، مع دعم CUDIMM.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الفتحة الثانية بالجيل الثالث x1 فقط، والثالثة بالجيل الرابع x4: لبطاقات التوسعة لا لكرتٍ ثانٍ.
* أغلى من لوحات B850 بمواصفاتٍ قريبة؛ الفرق أساساً في USB4 والمسارات الإضافيّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تقبل معالجات AM4.
* ليست لوحة كسر سرعةٍ متطرّف بمراحل الفئة العليا.

${alt('X870EP', 'شيبست X870E نفسه وشبكة 5 جيجابت بسعرٍ أقلّ، بمنافذ M.2 أقلّ.')}
https://www.msi.com/Motherboard/MAG-X870E-TOMAHAWK-MAX-WIFI/Specification`,
  },
  {
    categoryId: MB, brand: 'ASUS', name: 'ROG Strix B850-A Gaming WiFi7 NEO', tdpWattage: 10, performanceTier: 4,
    specs: { socket: AM5, chipset: 'B850', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '4', wifi: 'Wi-Fi 7', lan: '5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '8400+ MT/s (OC)', color: 'White' },
    offers: [A('B0GKGT264T'), M('asus-rog-strix-b850-a-gaming-wifi7-neo-atx-am5-motherboard-amd-b850-chipset-4x-ddr5-dimm-slots-up-to-256gb-max-memory-1x-pcie-5-0-x16-safeslot-4x-m-2-slots-90mb1p10-m0eay0')],
    description: `### ASUS ROG Strix B850-A Gaming WiFi7 NEO

لوحة ROG Strix بتصميمٍ أبيض وفضّيّ، في إصدار NEO المحدّث بشبكة 5 جيجابت وواي‑فاي 7. تناسب تجميعة ألعابٍ بيضاء على AM5 بمعالج Ryzen 7 أو 9800X3D.

**التقنيات الأساسية المدعومة:**

[green]تصميمٌ أبيض وفضّيّ:[/green] مشتّتاتٌ فاتحة تناسب الصناديق البيضاء، بإضاءة Aura Sync.

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج، فتتّسع لمكتبة أقراصٍ كاملة.

[green]شبكة Realtek بسرعة 5 جيجابت:[/green] ضعف الشبكة المعتادة في لوحات B850، مع حماية LANGuard.

[green]واي‑فاي 7 (MediaTek MT7925) وبلوتوث 5.4:[/green] أحدث معيارٍ لاسلكيّ بلا بطاقةٍ إضافيّة.

[green]صوت SupremeFX ALC4080:[/green] شريحة ROG الأنقى، مع مخرج S/PDIF.

[green]فتحة كرت PCIe 5.0 x16 مدعّمة (SafeSlot):[/green] تتحمّل وزن الكروت الضخمة، وتفكّها بزرّ Q-Release.

[green]ذاكرة DDR5 حتى 8400 MT/s كسر سرعة مع Ryzen 9000:[/green] أربع فتحات حتى 256 جيجابايت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذا SATA فقط، فالأقراص التقليديّة محدودة.
* الواي‑فاي بعرض 160MHz لا 320MHz كلوحات الفئة الأعلى.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا منفذ USB4، وهو من مزايا X870.
* لا تقبل معالجات AM4.

${alt('B850F', 'لوحة Strix B850 بتصميمٍ داكن وسعرٍ قريب، إن لم يكن اللون الفاتح شرطاً.')}
https://rog.asus.com/motherboards/rog-strix/rog-strix-b850-a-gaming-wifi7-neo/spec/`,
  },
  {
    categoryId: MB, brand: 'ASUS', name: 'TUF Gaming B850-PRO WiFi7 W NEO', tdpWattage: 10, performanceTier: 3,
    specs: { socket: AM5, chipset: 'B850', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '3', wifi: 'Wi-Fi 7', lan: '2.5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '8400+ MT/s (OC)', color: 'White' },
    offers: [A('B0GKGN7CHM'), M('asus-tuf-gaming-b850-pro-wifi7-w-neo-am5-atx-motherboard-amd-b850-chipset-4x-ddr5-dimm-slots-up-to-256gb-max-memory-1x-pcie-5-0-x16-safeslot-3-x-m-2-slots-90mb1nw0-m0eay0')],
    description: `### ASUS TUF Gaming B850-PRO WiFi7 W NEO

النسخة البيضاء (W) من TUF B850-PRO في إصدار NEO: مراحل طاقة متينة وواي‑فاي 7 ولوحة دارة من ثماني طبقات. تناسب تجميعة بيضاء متوسّطة إلى قويّة على AM5 بسعرٍ معقول.

**التقنيات الأساسية المدعومة:**

[green]لونٌ أبيض:[/green] مشتّتاتٌ بيضاء تكمل الصناديق والقطع البيضاء، بإضاءة Aura Sync.

[green]مراحل طاقة 14+2+1 بقدرة 80 أمبير:[/green] تتحمّل Ryzen 9 تحت الحمل الطويل، على لوحة دارة من ثماني طبقات.

[green]ثلاثة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج والآخران بالجيل الرابع، مع أربعة منافذ SATA للأقراص التقليديّة.

[green]واي‑فاي 7 (Realtek RTL8922AE) وبلوتوث 5.4:[/green] بلا بطاقةٍ إضافيّة.

[green]فتحة كرت PCIe 5.0 x16 مدعّمة (SafeSlot):[/green] تتحمّل وزن الكروت الضخمة.

[green]ذاكرة DDR5 حتى 8400 MT/s كسر سرعة مع Ryzen 9000:[/green] أربع فتحات حتى 256 جيجابايت، مع ملفّات EXPO وAEMP.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2_3 يتقاسم المسارات مع الفتحة الثانية: إن استُعملا معاً عمل كلٌّ منهما بالجيل الرابع x2.
* الشبكة السلكيّة 2.5 جيجابت، وبعض لوحات B850 تعطي 5.
* الواي‑فاي بعرض 160MHz لا 320MHz.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا منافذ USB4 خلفيّة (رأسٌ داخليّ لبطاقة توسعة فقط).
* لا تقبل معالجات AM4.

${alt('B850E', 'لوحة TUF B850 أخرى بلونٍ داكن وسعرٍ قريب، بواي‑فاي 6E.')}
https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b850-pro-wifi7-w-neo/techspec/`,
  },
  {
    categoryId: MB, brand: 'MSI', name: 'MAG B850 Tomahawk WiFi', tdpWattage: 10, performanceTier: 4,
    specs: { socket: AM5, chipset: 'B850', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '3', wifi: 'Wi-Fi 7', lan: '5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '8200 MT/s (OC)' },
    offers: [A('B0G3SVRLT3'), M('msi-mag-b850-tomahawk-wifi-atx-am5-motherboard-amd-b850-chipset-4x-ddr5-udimm-slots-up-to-256gb-max-memory-2x-pci-e-x16-slot-3x-m-2-slots-911-7e53-001')],
    description: `### MSI MAG B850 Tomahawk WiFi

Tomahawk بشيبست B850 في نسخته الأساسيّة (بلا MAX): شبكة 5 جيجابت وواي‑فاي 7 ومراحل طاقة بقدرة 80 أمبير. تناسب تجميعة ألعابٍ قويّة بمعالج 9800X3D أو Ryzen 7 لمن لا يحتاج منفذ M.2 رابعاً.

**التقنيات الأساسية المدعومة:**

[green]مراحل طاقة SPS بقدرة 80 أمبير:[/green] تتحمّل Ryzen 9 تحت الحمل الطويل بلا خنقٍ حراريّ، تحت مشتّتاتٍ كبيرة.

[green]ثلاثة منافذ M.2 بأربعة مسارات كاملة:[/green] الأوّل بالجيل الخامس من المعالج، والثاني بالجيل الرابع من المعالج، والثالث من الشيبست.

[green]شبكة Realtek 8126 بسرعة 5 جيجابت وواي‑فاي 7:[/green] ضعف الشبكة المعتادة في لوحات B850.

[green]فتحة كرت PCIe 5.0 x16:[/green] من المعالج مباشرة، جاهزةٌ لكروت الأجيال القادمة.

[green]صوت Realtek ALC4080:[/green] أنقى من شرائح الصوت الاقتصاديّة، مع مخرج S/PDIF.

[green]منفذ USB-C خلفيّ بسرعة 20 جيجابت:[/green] لأقراصٍ خارجيّة سريعة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ثلاثة منافذ M.2 لا أربعة كنسخة MAX.
* الفتحة الثالثة بالجيل الثالث x1، لبطاقاتٍ صغيرة فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا منفذ USB4، وهو من مزايا X870.
* لا تقبل معالجات AM4.

${alt('B850TMAX', 'منفذ M.2 رابع بالجيل الخامس في الخطّ نفسه، بفرقٍ صغير.')}
https://www.msi.com/Motherboard/MAG-B850-TOMAHAWK-WIFI/Specification`,
  },
  {
    categoryId: MB, brand: 'MSI', name: 'MAG B850M Mortar WiFi', tdpWattage: 10, performanceTier: 3,
    specs: { socket: AM5, chipset: 'B850', formFactor: 'Micro-ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '3', wifi: 'Wi-Fi 7', lan: '5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '8200 MT/s (OC)' },
    offers: [A('B0F4Q45RKX'), M('msi-mag-b850m-mortar-wifi-matx-am5-motherboard-amd-b850-chipset-4x-ddr5-udimm-slots-up-to-256gb-max-memory-1x-pcie-x16-slot-3x-m-2-slots-911-7e61-008')],
    description: `### MSI MAG B850M Mortar WiFi

لوحة Micro-ATX من خطّ Mortar بمزايا لوحات ATX: منفذا M.2 من الجيل الخامس، وشبكة 5 جيجابت، وواي‑فاي 7. تناسب تجميعة ألعابٍ قويّة في صندوقٍ متوسّط أو صغير.

**التقنيات الأساسية المدعومة:**

[green]منفذا M.2 بالجيل الخامس من المعالج:[/green] نادرٌ في لوحةٍ بهذا الحجم، ومنفذٌ ثالث من الشيبست.

[green]شبكة Realtek 8126 بسرعة 5 جيجابت:[/green] ضعف الشبكة المعتادة، لنقل الملفّات داخل المنزل بسرعة.

[green]واي‑فاي 7 بعرض 320MHz:[/green] حتى 5.8 جيجابت على نطاق 6 جيجاهرتز.

[green]مراحل طاقة SPS بقدرة 60 أمبير:[/green] تكفي Ryzen 7 و9800X3D تحت الحمل الطويل.

[green]أربع فتحات DDR5 حتى 256 جيجابايت:[/green] بسرعة تصل إلى 8200 MT/s كسر سرعة، رغم صغر اللوحة.

[green]صوت ALC4080 ومنفذ USB-C خلفيّ بسرعة 20 جيجابت.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 الثالث بالجيل الرابع x2، نصف سرعة المنافذ الأخرى.
* فتحتا توسعة فقط بحكم المقاس: الكرت وبطاقةٌ واحدة بالجيل الرابع x4.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا منفذ USB4.
* لا تقبل معالجات AM4.

${alt('B850MPLUS', 'لوحة B850 صغيرة أخرى بسعرٍ أقلّ عادةً، بشبكة 2.5 جيجابت وواي‑فاي 6E.')}
https://www.msi.com/Motherboard/MAG-B850M-MORTAR-WIFI/Specification`,
  },
  {
    categoryId: MB, brand: 'Gigabyte', name: 'Z890 AORUS Elite WiFi7 PLUS', tdpWattage: 15, performanceTier: 4,
    specs: { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '4', wifi: 'Wi-Fi 7', lan: '5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '9466+ MT/s (OC)' },
    offers: [A('B0GTZT12W1'), M('gigabyte-z890-aorus-elite-wifi7-plus-atx-lga-1851-motherboard-intel-z890-chipset-4x-ddr5-dimm-slot-up-to-256gb-max-memory-1x-pcie-5-0-x16-with-pcie-ud-slot-4x-m-2-slots-z890-a-elite-wifi7-p')],
    description: `### Gigabyte Z890 AORUS Elite WiFi7 PLUS

الإصدار المحدّث (PLUS) من Z890 AORUS Elite: شبكة 5 جيجابت بدل 2.5، وواي‑فاي Intel BE200، وذاكرة أسرع. تناسب تجميعة Core Ultra 7 أو 9 من فئة K لمن يريد كسر السرعة.

**التقنيات الأساسية المدعومة:**

[green]شيبست Z890:[/green] يفتح مضاعف معالجات K وكسر سرعة الذاكرة معاً.

[green]شبكة Realtek بسرعة 5 جيجابت:[/green] أهمّ ما يضيفه إصدار PLUS على النسخة الأصليّة.

[green]واي‑فاي 7 (Intel BE200) بعرض 320MHz:[/green] أسرع معيارٍ لاسلكيّ، مع بلوتوث 5.4.

[green]ذاكرة DDR5 حتى 9466 MT/s كسر سرعة:[/green] مع دعم ذاكرة CUDIMM الأسرع، حتى 256 جيجابايت.

[green]أربعة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج، والبقيّة بالجيل الرابع.

[green]منفذ USB4 ومخرج DisplayPort:[/green] صورةٌ من المعالج، ونقلٌ سريع لأقراصٍ خارجيّة.

[green]فتحة PCIe UD بتحريرٍ سريع:[/green] الكرت يُفكّ بزرّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذ M.2 واحد فقط من الجيل الخامس.
* كسر السرعة يحتاج معالجاً بلاحقة K؛ مع 265F أو 285 تدفع ثمن ميزةٍ لا تستعملها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تقبل معالجات الجيل 12 إلى 14 (LGA1700).

${alt('Z890EL', 'النسخة الأصليّة نفسها بشبكة 2.5 جيجابت، إن وجدتها بسعرٍ أقلّ.')}
https://www.gigabyte.com/Motherboard/Z890-AORUS-ELITE-WIFI7-PLUS/sp`,
  },
  {
    categoryId: MB, brand: 'MSI', name: 'PRO B860-P', tdpWattage: 10, performanceTier: 3,
    specs: { socket: 'LGA1851', chipset: 'B860', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '3', wifi: 'No', lan: '5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '8800 MT/s (OC)' },
    offers: [M('msi-pro-b860-p-atx-lga-1851-motherboard-intel-b860-chipset-4x-ddr5-udimm-slots-256gb-max-memory-4x-pcie-x16-slots-3x-m-2-slots-frozr-design-911-7e41-002')],
    description: `### MSI PRO B860-P

لوحة B860 بحجم ATX بلا واي‑فاي، لكن بمنفذ Thunderbolt 4 وشبكة 5 جيجابت وهما نادران في فئتها. تناسب جهاز Core Ultra 5 أو 7 مكتبيّاً أو للألعاب متّصلاً بكابل شبكة.

**التقنيات الأساسية المدعومة:**

[green]منفذ Thunderbolt 4 خلفيّ:[/green] 40 جيجابت مع صورة DisplayPort 2.1، لأقراصٍ خارجيّة سريعة أو شاشةٍ بكابلٍ واحد.

[green]شبكة Realtek 8126 بسرعة 5 جيجابت:[/green] ضعف الشبكة المعتادة حتى في لوحاتٍ أغلى.

[green]ثلاثة منافذ M.2:[/green] الأوّل بالجيل الخامس من المعالج، والثاني بالجيل الرابع x4، والثالث بالجيل الرابع x2.

[green]أربع فتحات DDR5 حتى 256 جيجابايت:[/green] بسرعة تصل إلى 8800 MT/s كسر سرعة، مع دعم CUDIMM.

[green]فتحة كرت PCIe 5.0 x16 وثلاث فتحاتٍ إضافيّة:[/green] لبطاقات التقاطٍ أو شبكةٍ أو صوت.

[green]مخرجا HDMI 2.1 وDisplayPort:[/green] للمعالجات ذات الرسوميات المدمجة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا واي‑فاي ولا بلوتوث؛ الاتّصال اللاسلكيّ يحتاج بطاقةً تُشترى منفصلة.
* شريحة صوت Realtek ALC897 أساسيّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كسر سرعة للمعالج (B860).
* لا تقبل معالجات الجيل 12 إلى 14.

${alt('B860PW', 'اللوحة نفسها تقريباً مع واي‑فاي مدمج.')}
https://www.msi.com/Motherboard/PRO-B860-P/Specification`,
  },

  /* ============================== كيسات ============================== */
  {
    categoryId: CASE, brand: 'Thermaltake', name: 'View 600 TG Black', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Full Tower', maxGpuLength: '480', psuFormFactor: 'ATX', maxCoolerHeight: '175', radiatorSupport: '420mm', includedFans: 'لا يوجد', color: 'Black', features: ['يدعم لوحات Back-Connect', 'يقبل لوحات E-ATX', 'زجاج على أربع جهات'] },
    offers: [A('B0CQX1MGH4'), M('thermaltake-view-600-tg-full-tower-chassis-e-atx-case-with-4-tempered-glass-panels-420mm-radiator-support-high-airflow-gaming-tower-black-ca-11h-00f1wn-00')],
    description: `### Thermaltake View 600 TG Black

صندوق Full Tower بانوراميّ بأربعة ألواح زجاجيّة سماكتها 4 مم، يتّسع لأضخم القطع ولرادييترين بحجم 420 مم. يناسب تجميعة عرضٍ رائدة بكرت RTX 5090 ومبرّد سوائل كبير.

**التقنيات الأساسية المدعومة:**

[green]كرت حتى 480 مم:[/green] أطول ممّا يحتاجه أيّ كرتٍ حاليّ، فلا حساب للطول إطلاقاً.

[green]رادييتر 420 مم في السقف وفي الجانب:[/green] مكانان لأكبر مقاسٍ شائع، لمبرّد المعالج وحلقة تبريدٍ مخصّصة.

[green]أربعة ألواح زجاجيّة 4 مم:[/green] رؤيةٌ للقطع من الأمام والجانب، وهو سبب وجود هذا الصندوق.

[green]يقبل لوحات E-ATX ولوحات Back-Connect:[/green] لوحات الموصلات الخلفيّة تخفي الكابلات من الواجهة.

[green]مزوّد حتى 220 مم ومبرّد هوائيّ حتى 175 مم:[/green] لمزوّدات 1200 واط وأبراج التبريد الكبيرة.

[green]منفذ USB-C بسرعة 10 جيجابت:[/green] ومنفذا USB 3.0 في الواجهة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **بلا مراوح مرفقة**: يتّسع لعشر مراوح، وكلّها تُشترى منفصلة، فاحسبها في الميزانيّة.
* حجمه كبير جدّاً (560 × 249 × 584 مم) ووزنه ثقيل، ويحتاج مكاناً على الأرض لا على المكتب.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس صندوق تهويةٍ شبكيّاً؛ الزجاج يحتاج مراوح كافية ليبرّد جيّداً.

${alt('V390', 'صندوق Thermaltake متوسّط بواجهةٍ شبكيّة ومروحتين مرفقتين، أصغر وأرخص بكثير.')}
https://thermaltake.com/products/view-600-tg-full-tower-chassis`,
  },
  {
    categoryId: CASE, brand: 'Thermaltake', name: 'View 370 TG ARGB Black', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '420', psuFormFactor: 'ATX', maxCoolerHeight: '165', radiatorSupport: '360mm', includedFans: '3x 120mm ARGB Reverse + 1x 120mm ARGB', color: 'Black', features: ['يدعم لوحات Back-Connect', 'زجاج على أربع جهات'] },
    offers: [A('B0GH9PT1FR'), M('thermaltake-view-370-tg-argb-mid-tower-chassis-atx-tempered-glass-gaming-pc-case-black-ca-11n-00m1wn-00')],
    description: `### Thermaltake View 370 TG ARGB Black

صندوق عرضٍ متوسّط بأربعة ألواح زجاجيّة وأربع مراوح ARGB مرفقة، وفتحات توسعة تدور لتركيب الكرت عموديّاً. يناسب تجميعة ألعابٍ مضيئة بسعرٍ متوسّط.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح ARGB مرفقة:[/green] إطار SF360 بثلاث مراوح معكوسة في الجانب (الوجه المضيء نحو الزجاج) ومروحة SF120 خلفيّة، فالصندوق جاهزٌ بلا شراءٍ إضافيّ.

[green]فتحات توسعة تدور:[/green] تصميمٌ مسجّل يسمح بتركيب الكرت عموديّاً ليظهر بواجهته عبر الزجاج.

[green]كرت حتى 420 مم:[/green] يتّسع لأطول الكروت الحاليّة تقريباً.

[green]رادييتر 360 مم في السقف أو في الجانب:[/green] مبرّد سوائل لمعالجات الفئة العليا.

[green]يقبل لوحات Back-Connect (ATX وMicro-ATX):[/green] فتختفي الكابلات من الواجهة.

[green]منفذ USB-C بسرعة 10 جيجابت:[/green] ومنفذا USB 3.0.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هوائيّ حتى 165 مم بالضبط؛ راجع ارتفاع البرج قبل الشراء.
* الصناديق الزجاجيّة تبرّد أقلّ من الشبكيّة عند العدد نفسه من المراوح.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات E-ATX، ولا رادييتر 420 مم.

${alt('POP2AIR', 'صندوق تهويةٍ بواجهةٍ شبكيّة وثلاث مراوح RGB، أبرد عند الحمل الطويل.')}
https://thermaltake.com/products/view-370-tg-argb-mid-tower-chassis`,
  },
  {
    categoryId: CASE, brand: 'Fractal Design', name: 'Pop 2 Vision Black RGB', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '412', psuFormFactor: 'ATX', maxCoolerHeight: '172', radiatorSupport: '360mm', includedFans: '4x 120mm RGB Reverse', color: 'Black', dualChamber: 'Yes', features: ['يدعم لوحات Back-Connect', 'يقبل لوحات E-ATX', 'زجاج بانوراميّ'] },
    offers: [A('B0FV352BCT'), M('fractal-pop-2-vision-computer-case-tempered-glass-4x-aspect-12x-reverse-rgb-pre-installed-fans-up-to-8x-120mm-fans-up-to-360mm-radiator-dual-chamber-design-black-fd-c-pov2a-02')],
    description: `### Fractal Design Pop 2 Vision Black RGB

صندوق Fractal بحجرتين وزجاجٍ بانوراميّ في الواجهة والجانب، ومعه أربع مراوح RGB معكوسة. يناسب تجميعة عرضٍ مضيئة لمن يريد جودة Fractal في الترتيب والتصنيع.

**التقنيات الأساسية المدعومة:**

[green]حجرتان وزجاجٌ بانوراميّ:[/green] المزوّد والكابلات خلف اللوحة، والحجرة الرئيسيّة ظاهرة كاملة من الأمام والجانب.

[green]أربع مراوح Aspect 12X Reverse RGB:[/green] شفراتٌ معكوسة تُظهر الوجه المضيء نحو الزجاج، مع زرّين للتحكّم بالإضاءة في الواجهة.

[green]كرت حتى 412 مم ومبرّد هوائيّ حتى 172 مم:[/green] يتّسع لأطول الكروت الحاليّة ولأغلب أبراج التبريد.

[green]يقبل لوحات E-ATX ولوحات Back-Connect:[/green] مرونةٌ في اختيار اللوحة الأمّ.

[green]مساحة 93 مم للكابلات خلف اللوحة:[/green] ترتيبٌ سهل بأشرطةٍ لاصقة وفتحات مطّاطيّة.

[green]فتحٌ بلا أدوات:[/green] الألواح الثلاثة والفلاتر تُنزع باليد.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منفذا الواجهة بسرعة 5 جيجابت فقط (USB-C وUSB-A).
* الرادييتر في السقف فقط (حتى 360 مم)، ومزوّدٌ حتى 190 مم طولاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رادييتر في الواجهة، فهي زجاج.

${alt('POP2AIR', 'الشركة والفئة نفسها بواجهةٍ شبكيّة لتهويةٍ أقوى وسعرٍ أقلّ.')}
https://www.fractal-design.com/products/cases/pop-series/pop-2-vision/pop-2-vision-black-rgb/`,
  },
  {
    categoryId: CASE, brand: 'Cooler Master', name: 'Elite 302 Black', tdpWattage: 0, performanceTier: 2,
    specs: { formFactor: 'Micro-ATX Tower', maxGpuLength: '340', psuFormFactor: 'ATX', maxCoolerHeight: '163', radiatorSupport: '360mm', includedFans: '3x 120mm ARGB', color: 'Black', features: [] },
    offers: [A('B0F8SJDJSW'), M('cooler-master-elite-302-mini-tower-computer-case-3x-120mm-argb-fans-pre-installed-support-360mm-radiator-6x-fan-support-tempered-glass-side-panel-dust-filters-black-e302-kgnn-s00')],
    description: `### Cooler Master Elite 302 Black

صندوق Micro-ATX صغير (34 لتراً) بواجهةٍ شبكيّة وثلاث مراوح ARGB مرفقة. يناسب تجميعة ألعابٍ اقتصاديّة أو متوسّطة على المكتب بلوحة Micro-ATX.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح 120 مم ARGB في الواجهة:[/green] تهويةٌ جاهزة تدفع الهواء مباشرةً نحو الكرت والمعالج.

[green]واجهة شبكيّة وفلاتر غبار:[/green] في الأمام والسقف والأسفل، فيبقى الداخل نظيفاً.

[green]رادييتر 360 مم في الواجهة:[/green] بسماكةٍ حتى 60 مم مع المراوح، و280 مم في السقف.

[green]مبرّد هوائيّ حتى 163 مم:[/green] يقبل أغلب الأبراج المزدوجة الشائعة (155 مم).

[green]جانب زجاجيّ ومنفذ USB-C أماميّ.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **الكرت حتى 365 مم بلا مراوح أماميّة**، والمراوح الثلاث مركّبةٌ في الأمام؛ معها يبقى نحو 340 مم، وهو ما سجّلناه لأداة التوافق.
* المزوّد حتى 160 مم طولاً، ومساحة الكابلات خلف اللوحة 18.5 مم فقط.
* منفذا الواجهة بسرعة 5 جيجابت.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات ATX.

${alt('E502', 'صندوق Cooler Master متوسّط يقبل لوحات ATX وE-ATX وكروتاً حتى 410 مم، بسعرٍ قريب.')}
https://www.coolermaster.com/en-global/products/elite-302.html`,
  },

  /* ============================== مزوّدات ============================== */
  {
    categoryId: PSU, brand: 'MSI', name: 'MPG A1250GS PCIE5', tdpWattage: 0, performanceTier: 5,
    specs: { wattage: '1250', rating: '80+ Gold', modularity: 'Full', formFactor: 'ATX 3.1', color: 'Black', qualityTier: 'A' },
    offers: [A('B0BSWSCP7B'), M('msi-mpg-a1250gs-pcie5-fully-modular-power-supply-1250w-power-80-plus-gold-efficiency-135mm-fluid-dynamic-bearing-type-active-pfc-zero-fan-mode-black-306-7zpfx18-ce0')],
    description: `### MSI MPG A1250GS PCIE5

مزوّد MSI من فئة MPG بقدرة 1250 واط Gold، بدرجة A في تقييم SPL وكابلَي 12V-2x6 أصليّين. يناسب جهازاً رائداً بكرت RTX 5090 ومعالج Ryzen 9 أو Core Ultra 9.

**التقنيات الأساسية المدعومة:**

[green]درجة A في تقييم SPL:[/green] قائمةٌ مستقلّة يُعدّها مراجعون متخصّصون لجودة المكوّنات والحمايات، وA مكوّناتٌ وأداءٌ كهربائيّ ممتازان.

[green]كابلا 12V-2x6 أصليّان (600 واط لكلٍّ منهما):[/green] لكرت RTX 5090 بكابلٍ مستقلّ، أو لكرتين حديثين.

[green]معيار ATX 3.1 وتحمّل قفزات حتى 235%:[/green] قفزات استهلاك الكروت الحديثة لا تُطفئ الجهاز.

[green]مروحة 135 مم بمحمل FDB ووضع إيقاف المروحة:[/green] صامتٌ في الحمل الخفيف، وطويل العمر.

[green]كابلات منفصلة بالكامل وحمايات كاملة:[/green] OCP وOVP وOPP وSCP وOTP.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **موصّل PCIe 6+2 واحد فقط**: الكروت القديمة التي تحتاج موصّلين أو ثلاثة بثمانية سنون لا تُغذّى منه مباشرة.
* طوله 150 مم، أطول من المزوّدات المدمجة؛ راجع مساحة الصندوق السفليّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* 1250 واط تزيد كثيراً عن حاجة الأجهزة المتوسّطة.

${alt('A1250GL', 'مزوّد MSI بالقدرة نفسها وموصّلاتٍ أكثر للكروت القديمة، بدرجة B+.')}
https://www.msi.com/Power-Supply/MPG-A1250GS-PCIE5`,
  },
  {
    categoryId: PSU, brand: 'Thermaltake', name: 'Toughpower GT 1000W Snow', tdpWattage: 0, performanceTier: 4,
    specs: { wattage: '1000', rating: '80+ Gold', modularity: 'Full', formFactor: 'ATX 3.1', color: 'White' },
    offers: [A('B0FCS35V79'), M('thermaltake-toughpower-gt-1000w-fully-modular-power-supply-1000w-power-80-plus-gold-efficiency-active-pfc-120cm-hydraulic-bearing-fan-atx-3-1-ready-white-ps-tpt-1000fnfagk-w')],
    description: `### Thermaltake Toughpower GT 1000W Snow

النسخة البيضاء بقدرة 1000 واط من Toughpower GT: معيار ATX 3.1 وكابلات بيضاء منفصلة بالكامل. تناسب تجميعة بيضاء قويّة بكرت RTX 5080 أو 5070 Ti.

**التقنيات الأساسية المدعومة:**

[green]أبيض بالكامل مع الكابلات:[/green] لا يظهر كابلٌ أسود خلف الزجاج في تجميعةٍ بيضاء.

[green]كابل 12V-2x6 (600 واط) وخمسة موصّلات 6+2:[/green] لكرتٍ حديث بكابلٍ واحد، أو لكروتٍ أقدم بموصّلات عدّة.

[green]معيار ATX 3.1 وPCIe 5.1:[/green] آخر نسخةٍ من المواصفة، بموصّل 12V-2x6 الأكثر أماناً من 12VHPWR القديم.

[green]وضع إيقاف المروحة الذكيّ:[/green] لا تدور المروحة في الحمل الخفيف، فالجهاز صامتٌ في التصفّح.

[green]كفاءة 80 PLUS Gold وطوله 140 مم:[/green] يدخل أغلب الصناديق ويترك مساحةً للكابلات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* غير مُدرَج في تقييم SPL بعد، فلا تقييم مستقلّاً لجودته.
* مروحة 120 مم بمحمل هيدروليكيّ، أعلى صوتاً تحت الحمل الكامل من مراوح 135 و140 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدخل صناديق SFX الصغيرة.

${alt('GT850S', 'المزوّد نفسه باللون نفسه بقدرة 850 واط، لكرتٍ أقلّ استهلاكاً.')}
https://thermaltake.com/products/toughpower-gt-snow-1000w`,
  },
  {
    categoryId: PSU, brand: 'be quiet!', name: 'POWER ZONE 2 1000W', tdpWattage: 0, performanceTier: 5,
    specs: { wattage: '1000', rating: '80+ Platinum', modularity: 'Full', formFactor: 'ATX 3.1', color: 'Black', qualityTier: 'B+' },
    offers: [A('B0DLHG5K8B'), M('be-quiet-power-zone-2-fully-modular-power-supply-1000w-power-supply-80-plus-platinum-efficiency-pcie-5-1-atx-3-1-compatibility-140-mm-pure-wings-3-fan-black-bp008uk')],
    description: `### be quiet! POWER ZONE 2 1000W

مزوّد be quiet! بقدرة 1000 واط وكفاءة Platinum، بمروحة 140 مم تكاد لا تُسمع حتى نصف الحمل. يناسب جهازاً قويّاً هادئاً بكرت RTX 5080 أو 5090.

**التقنيات الأساسية المدعومة:**

[green]كفاءة Platinum (80 PLUS وCybenetics):[/green] 94% عند نصف الحمل، فحرارةٌ وهدرٌ أقلّ من Gold.

[green]ضجيج 6.5 ديسيبل حتى 50% من الحمل:[/green] أوّل مزوّد be quiet! بتشغيلٍ شبه صامت، ومروحة Pure Wings 3 بقطر 140 مم.

[green]كابل 12V-2x6 بقدرة 600 واط وثلاثة موصّلات 6+2:[/green] لكرتٍ حديث بكابلٍ واحد.

[green]معيار ATX 3.1 وعمرٌ مقدّر يتجاوز 100 ألف ساعة:[/green] بتصميم LLC وSR وDC-DC الحديث، تصنيع FSP.

[green]كابلات منفصلة مسطّحة ومغلّفة:[/green] أسهل في الترتيب خلف اللوحة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* درجة B+ في تقييم SPL، جيّدٌ لا من الفئة العليا.
* ثلاثة موصّلات 6+2 فقط للكروت القديمة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدخل صناديق SFX الصغيرة.

${alt('PZ850', 'المزوّد نفسه بقدرة 850 واط، يكفي جهازاً بكرت RTX 5070 Ti أو 5080.')}
https://www.bequiet.com/en/powersupply/power-zone-2`,
  },

  /* ============================== مبرّدات ============================== */
  {
    categoryId: COOL, brand: 'Cooler Master', name: 'Hyper 612 APEX', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'Air', sizeMm: '159', sockets: SOCK_AIR, fanCount: '2', fanSize: '120mm', rgb: 'No', color: 'Black', tdpRating: '260' },
    offers: [A('B0DTHX5T88'), M('cooler-master-hyper-612-apex-air-cooler-fan-non-led-fan-speed-2400-rpm-airflow-75-2-cfm-fan-pressure-3-63-noise-level-30-dba-fan-bearing-ldb-black-map-t6pn-225pk-r1')],
    description: `### Cooler Master Hyper 612 APEX

مبرّد هوائيّ ببرجٍ واحد كثيف وستّة أنابيب حراريّة ومروحتين 120 مم، بقدرة تبريد 260 واط. يناسب معالجات Ryzen 7 وCore Ultra 7 تحت الحمل الطويل بلا إضاءة.

**التقنيات الأساسية المدعومة:**

[green]ستّة أنابيب حراريّة فائقة التوصيل:[/green] قدرة تبريد 260 واط، تكفي معالجات الفئة العليا في الألعاب.

[green]مروحتان 120 مم بنظام دفعٍ وسحب:[/green] حتى 2400 دورة و75 قدماً مكعّباً في الدقيقة، فيمرّ الهواء عبر الزعانف بقوّة.

[green]محامل LDB بعمرٍ يتجاوز 200 ألف ساعة:[/green] أطول عمراً من المحامل الانزلاقيّة.

[green]وضع إيقاف المراوح:[/green] السرعة تبدأ من الصفر، فيهدأ تماماً في الخمول.

[green]يدعم LGA1851 وLGA1700 وAM5 وAM4:[/green] كلّ المنصّات الحديثة، فيبقى معك إن غيّرت المعالج.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ارتفاعه 159 مم، فراجع سقف الصناديق الصغيرة.
* المروحتان تصلان إلى 30 ديسيبل بأقصى سرعتهما.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة إطلاقاً.
* معالجات Core i9 وRyzen 9 تحت حملٍ كامل طويل تحتاج مبرّد سوائل.

${alt('PA120', 'برجان مزدوجان بإضاءة ARGB وتبريدٍ أقوى قليلاً بسعرٍ أقلّ.')}
https://www.coolermaster.com/en-global/products/hyper-612-apex.html`,
  },
  {
    categoryId: COOL, brand: 'ID-Cooling', name: 'SE-214-XT V2 ARGB', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'Air', sizeMm: '152', sockets: SOCK_AIR, fanCount: '1', fanSize: '120mm', rgb: 'Yes', color: 'Black', tdpRating: '200' },
    offers: [A('B0G4CM3RHN'), M('id-cooling-se-214-xt-v2-argb-cpu-air-cooler-200w-tdp-4x6mm-direct-touch-heatpipes-120mm-argb-fan-2000rpm-58cfm-27-2db-intel-lga1851-1700-amd-am5-am4-550g-black-se-214-xt-v2-argb')],
    description: `### ID-Cooling SE-214-XT V2 ARGB

مبرّد هوائيّ اقتصاديّ ببرجٍ واحد ومروحة 120 مم ARGB، بقدرة تبريد 200 واط وتصميمٍ نحيف لا يغطّي الذاكرة. يناسب معالجات Ryzen 5 و7 وCore Ultra 5 في جهاز ألعابٍ اقتصاديّ مضيء.

**التقنيات الأساسية المدعومة:**

[green]أربعة أنابيب حراريّة بتلامسٍ مباشر:[/green] الأنابيب تلامس المعالج نفسه، فتنقل الحرارة أسرع في مبرّدٍ بهذا السعر.

[green]قدرة تبريد 200 واط:[/green] تكفي معالجات 65 إلى 105 واط في الألعاب بلا خنق.

[green]مروحة 120 مم ARGB هادئة:[/green] من 300 إلى 2000 دورة بضجيجٍ حتى 27.2 ديسيبل.

[green]مساحةٌ كاملة للذاكرة:[/green] البرج النحيف لا يغطّي فتحات الذاكرة، فتركب الأطقم العالية بلا تعارض.

[green]ارتفاع 152 مم:[/green] يدخل أغلب الصناديق، ومنها صناديق Micro-ATX.

[green]يدعم LGA1851 وLGA1700 وAM5 وAM4:[/green] كلّ المنصّات الحديثة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* برجٌ واحد بمروحةٍ واحدة: لا يُقارن بالأبراج المزدوجة تحت حملٍ ثقيل طويل.
* الإضاءة تحتاج رأس ARGB بجهد 5 فولت في اللوحة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب معالجات Core i9 وRyzen 9 تحت الحمل الكامل.

${alt('H212', 'مبرّد اقتصاديّ آخر بأنابيب 3DHP المتطوّرة، بلا إضاءة.')}
https://www.idcooling.com/product/detail?id=559&name=SE-214-XT%20V2%20ARGB`,
  },
  {
    categoryId: COOL, brand: 'Cooler Master', name: 'Hyper 411 Nano', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'Air', sizeMm: '136', sockets: SOCK_AIR, fanCount: '1', fanSize: '92mm', rgb: 'No', color: 'Black', tdpRating: '180' },
    offers: [A('B0DKJN2TVR'), M('cooler-master-hyper-411-nano-compact-cooler-fan-speed-650-2500-rpm-fan-airflow-45-14-cfm-noise-level-30-04-dba-connector-4-pin-pwm-4-heat-pipes-black-rr-h410-25pk-r1')],
    description: `### Cooler Master Hyper 411 Nano

مبرّد هوائيّ مدمج بارتفاع 136 مم ومروحة 92 مم، بأربعة أنابيب حراريّة وقدرة تبريد 180 واط. يناسب الصناديق الصغيرة التي لا يدخلها برجٌ عاديّ، بمعالج Ryzen 5 أو Core Ultra 5.

**التقنيات الأساسية المدعومة:**

[green]ارتفاع 136 مم فقط:[/green] يدخل صناديق Micro-ATX وMini-ITX التي تقف عند 140 مم، وأغلب الأبراج لا تدخلها.

[green]أربعة أنابيب حراريّة بتلامسٍ مباشر:[/green] قدرة تبريد 180 واط في حجمٍ صغير.

[green]مروحة 92 مم PWM:[/green] من 650 إلى 2500 دورة، تهدأ في الخمول وتسرع تحت الحمل.

[green]قاعدة صغيرة (102 × 85 مم):[/green] لا تتعارض مع الذاكرة ولا مع مشتّتات اللوحات الصغيرة.

[green]يدعم LGA1851 وLGA1700 وAM5 وAM4:[/green] كلّ المنصّات الحديثة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المروحة الصغيرة تدور أسرع لتعطي الهواء نفسه، فتصل إلى 30 ديسيبل تحت الحمل.
* ضمانه سنتان.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب معالجات 125 واط وما فوقها تحت حملٍ طويل.
* لا إضاءة.

${alt('AG300', 'مبرّد مدمج أرخص بارتفاع 129 مم، إن كان الصندوق أضيق.')}
https://www.coolermaster.com/en-global/products/hyper-411-nano.html`,
  },

  /* ============================== أقراص ============================== */
  {
    categoryId: STO, brand: 'Samsung', name: '990 EVO Plus 4TB', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'NVMe M.2', capacity: '4TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7250 MB/s', writeSpeed: '6300 MB/s', dramCache: 'No', tbw: '2400 TB' },
    offers: [A('B0DGH3HBHJ'), M('samsung-990-evo-plus-internal-ssd-4tb-capacity-pcie-gen-4-0-x4-5-0-x2-nvme-2-0-interface-up-to-7-250-mb-s-read-6-300-mb-s-write-support-v-nand-tlc-mz-v9s4t0bw')],
    description: `### Samsung 990 EVO Plus 4TB

قرص Samsung الأكبر من سلسلة 990 EVO Plus: أربعة تيرابايت بسرعة قريبة من سقف الجيل الرابع. يناسب مكتبة ألعابٍ كاملة أو مشاريع فيديو على قرصٍ واحد.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7,250 وكتابة 6,300 ميجابايت/ث:[/green] قرب سقف الجيل الرابع، وأسرع من حاجة الألعاب.

[green]واجهة مرنة PCIe 4.0 x4 أو 5.0 x2:[/green] يعمل بسرعته الكاملة على منافذ الجيل الرابع، وعلى المنافذ الحديثة بمسارين فقط.

[green]سعة 4 تيرابايت:[/green] تتّسع لثلاثين لعبةً حديثة أو أكثر بلا حذفٍ وإعادة تحميل.

[green]تحمّل 2400 تيرابايت وضمان خمس سنوات:[/green] أعلى بكثير من حاجة الاستخدام المنزليّ.

[green]ذاكرة V-NAND TLC وتشفير AES 256-bit:[/green] مع برنامج Samsung Magician للتحديث ومراقبة الصحّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا ذاكرة DRAM (يستعمل HMB)، فالكتابة الطويلة جدّاً تنخفض بعد امتلاء الذاكرة المؤقّتة.
* لا مشتّت حرارة مرفق؛ يعتمد على مشتّت اللوحة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس بسرعة أقراص الجيل الخامس الكاملة (PCIe 5.0 x4).

${alt('EVO2', 'القرص نفسه بنصف السعة وبأقلّ من نصف السعر تقريباً.')}
https://semiconductor.samsung.com/consumer-storage/internal-ssd/990-evo-plus/`,
  },
  {
    categoryId: STO, brand: 'Samsung', name: '870 EVO 4TB SATA', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'SATA SSD 2.5"', capacity: '4TB', interface: 'SATA III', formFactor: '2.5-inch', readSpeed: '560 MB/s', writeSpeed: '530 MB/s', dramCache: 'Yes', tbw: '2400 TB' },
    offers: [A('B08PC5ZC73'), M('samsung-870-evo-4tb-2-5-inch-sata-iii-internal-ssd-up-to-560-mb-s-seq-read-530-mb-s-seq-write-speed-v-nand-technology-1gb-lpddr4-cache-mkx-controller-1-5-m-hrs-mtbf-black-mz-77e4t0bw')],
    description: `### Samsung 870 EVO 4TB SATA

قرص SATA بمقاس 2.5 بوصة وسعة 4 تيرابايت، من أكثر أقراص SATA موثوقيّةً في السوق. يناسب قرصاً ثانياً للتخزين في جهازٍ امتلأت منافذ M.2 فيه، أو ترقية جهازٍ قديم بلا منفذ NVMe.

**التقنيات الأساسية المدعومة:**

[green]قراءة 560 وكتابة 530 ميجابايت/ث:[/green] سقف واجهة SATA، وأسرع بكثير من الأقراص الميكانيكيّة في التحميل والإقلاع.

[green]ذاكرة LPDDR4 بسعة 4 جيجابايت ومتحكّم Samsung MKX:[/green] أداءٌ ثابت في النسخ الطويل حتى حين يمتلئ القرص.

[green]تحمّل 2400 تيرابايت وضمان خمس سنوات:[/green] من أعلى الأرقام في أقراص SATA.

[green]مقاس 2.5 بوصة بكابل SATA:[/green] يركب في أيّ جهاز، ولا يأخذ منفذ M.2.

[green]تشفير AES 256-bit:[/green] مع برنامج Samsung Magician للتحديث ومراقبة الصحّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* أبطأ بأكثر من عشر مرّات من أقراص NVMe في النقل المتواصل.
* سعره للتيرابايت أعلى من أقراص NVMe بالسعة نفسها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يُنصح به قرصاً رئيسيّاً في جهازٍ حديث فيه منفذ M.2 فارغ.

${alt('S870_2', 'القرص نفسه بنصف السعة وبأقلّ من نصف السعر.')}
https://www.samsung.com/us/memory-storage/sata-ssd/870-evo-sata-2-5-ssd-4tb-sku-mz-77e4t0b-am/`,
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
writeFileSync(`backups/added-batch13-${stamp}.json`, JSON.stringify({ PARTS, EXTRA, movedBefore }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch13-${stamp}.json`);

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
