/**
 * ============ الدفعة السابعة — «ضيف الي ماضفتها» — ١١ قطعة — 2026-10-09 ============
 *
 * ما بقي من قائمة الدفعة السادسة متوفّراً في مايكرولس وحده أو كازاسوق وحده، فبُحث له عن
 * متجرٍ ثانٍ (أمازون بالمتصفّح + كازاسوق + مايكرولس) ورُبط كلّ عرضٍ برمز طرازه:
 *   CA-1Z2-00M6WN-WS / CA-11E-00M6WN-WS (Thermaltake)، RL-KR240-B2/W2 وRL-KR360-W2 (NZXT)،
 *   CW-9061006-WW (Corsair)، R-AK400-WPNPMN-G = EAN 6933412728757 (DeepCool)،
 *   EAN كازاسوق 5056547205236/5205229 = Kraken Plus 240 RGB أسود/أبيض.
 * كلّ صفحة متجرٍ قُرئت 2026-10-09.
 *
 * ✕ لم يُضف:
 *   · Samsung 990 EVO Plus 4TB — كازاسوق نافد، وإعلان أمازون الوحيد برمز MZ-V9S2T0 (2TB) مع «4 TB».
 *   · Samsung 9100 PRO 4TB، Fractal Meshify 3 RGB، View 380 Bubble Pink، O11 Vision-M Digital الأبيض — متجرٌ واحد.
 *   · DeepCool AK620 / AK620 Digital / AK400 Digital / AK400 G2 / CH560 الأبيض — كازاسوق نافد وأمازون لا يعرض DeepCool.
 *   · Corsair H150i LCD — أمازون الأبيض (CW-9061010) ومايكرولس الأسود (CW-9061008).
 *   · NZXT Kraken Elite 240 RGB الأبيض — كازاسوق جيل 2023 (RL-KR24E-W1) وأمازون 2024 (W2).
 *   · NZXT Kraken Elite 280 RGB الأبيض — EAN كازاسوق لم يُعرف جيله.
 *
 *   node scripts/add-batch7-2026-10-09.mjs           # عرض
 *   node scripts/add-batch7-2026-10-09.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const CASE = 'cmpfziquj0006x4ym53f0ehcw';
const COOL = 'cmszm2ym00000swymvd5s2yxm';

const C = (slug) => ({ store: 'cazasouq', url: `https://www.cazasouq.com/${slug}` });
const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });
const M = (slug) => ({ store: 'microless', url: `https://saudi.microless.com/product/${slug}/` });

const ALT = {
  VISION_COMPACT_W: ['Lian Li O11 Vision Compact White', 'cmu6n396c0000w4ymd6gibkjc'],
  VISION_M: ['Lian Li O11 Vision-M', 'cmuzoq42n001hnoymuukhc00q'],
  KRAKEN_CORE_240: ['NZXT Kraken Core 240 RGB', 'cmszn26en000aw8ymba5g8iyy'],
  KRAKEN_PLUS_360: ['NZXT Kraken Plus 360 RGB', 'cmti4ct64000aasym7ks1zjxo'],
  GALAHAD_W: ['Lian Li Galahad II Trinity SL-INF 360 White', 'cmuzymudv001ewwym72zj6jcw'],
  SKY_TWO_W: ['Montech Sky Two White', 'cmuzymsxd000zwwymdawensyf'],
  AIR903_MAX_W: ['Montech AIR 903 MAX White', 'cmtcr2g9d000lo8ymvzkob7m7'],
  PS120_EVO: ['Thermalright Phantom Spirit 120 EVO', 'cmtcr2dw50009o8ym694ecx7s'],
  PA120_W: ['Thermalright Peerless Assassin 120 SE ARGB White', 'cmtcr2cmg0003o8ymnvab7k4g'],
  AK400D_W: ['DeepCool AK400 Digital White', 'cmuztryww001qkcymtwaqf61f'],
};
const alt = (k, why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n* ${why}`;

const MOVE = [];
const EXTRA = [];

const KP_SOCKETS = 'LGA1851/LGA1700/LGA1200/LGA1151/LGA1155/LGA1156/LGA1152/AM5/AM4';
const krakenPlus = (size, color, offers, altKey, altWhy) => ({
  categoryId: COOL, brand: 'NZXT', name: `Kraken Plus ${size} RGB${color === 'White' ? ' White' : ''}`, tdpWattage: 0, performanceTier: size === '360' ? 5 : 4,
  specs: { type: 'AIO', sizeMm: size, sockets: KP_SOCKETS, fanCount: size === '360' ? '3' : '2', fanSize: '120mm', rgb: 'Yes', color },
  offers,
  description: `### NZXT Kraken Plus ${size} RGB${color === 'White' ? ' White' : ''}

مبرّد NZXT المائيّ ${size} مم ${color === 'White' ? 'بالأبيض' : 'بالأسود'} (إصدار 2025): شاشة TFT مقاس 1.54 بوصة على المضخّة، ومراوح RGB في إطارٍ واحد بكابلٍ واحد.

**التقنيات الأساسية المدعومة:**

[green]رادييتر ${size} مم:[/green] ${size === '360' ? 'بثلاث' : 'بمروحتين'} 120 مم حتى 2,400 لفّة في إطار F${size} RGB Core واحد.

[green]شاشة TFT بـ262 ألف لون:[/green] تعرض الحرارة أو صورةً تختارها.

[green]مضخّة متغيّرة السرعة:[/green] من 1,200 إلى 2,800 لفّة بحسب الحمل.

[green]يغطّي المقبسين الحديثين:[/green] LGA1851 و1700 من إنتل، وAM5 وAM4 من AMD.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الشاشة 1.54 بوصة TFT، لا 2.72 بوصة IPS كما في نسخة Elite.
* سعره أعلى بوضوح من نسخة Core بأرقام تبريدٍ متقاربة — الفارق شاشةٌ لا حرارة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يُركّب على مقابس العمل الاحترافيّ (sTRX4 وTR4).

${alt(altKey, altWhy)}
https://nzxt.com/product/kraken-plus-${size}-rgb`,
});

const view380 = (xl, offers) => ({
  categoryId: CASE, brand: 'Thermaltake', name: `View 380 ${xl ? 'XL ' : ''}WS ARGB Snow`, tdpWattage: 0, performanceTier: 3,
  specs: { formFactor: 'Mid Tower', maxGpuLength: xl ? '420' : '415', maxCoolerHeight: '160', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '4x 120mm ARGB', color: 'White', dualChamber: 'Yes', features: ['يدعم لوحات Back-Connect', 'لمسات خشبية'] },
  offers,
  description: `### Thermaltake View 380 ${xl ? 'XL ' : ''}WS ARGB Snow

كيس أبيض بحجرتين ولمساتٍ خشبيّة${xl ? ' — النسخة الأكبر (XL) من View 380 WS' : ''}: زجاجٌ في الواجهة والجانب، وأربع مراوح ARGB مركّبة، ويقبل لوحات الموصلات الخلفيّة.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح 120 مم ARGB:[/green] ثلاثٌ معكوسة الشفرات في الجانب وواحدة في الخلف.

[green]يقبل لوحات Back-Connect:[/green] ASUS BTF وMSI Project Zero وGigabyte Stealth.

[green]كرت حتى ${xl ? '420' : '415'} مم:[/green] ورادييتر 360 مم في السقف${xl ? ' والجانب' : ''}.

[green]منفذ USB-C أماميّ (3.2 Gen 2).[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هواء حتى 160 مم فقط.
* ${xl ? 'مزوّد حتى 180 مم.' : 'رادييتر الجانب حتى 280 مم.'}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تهوية أماميّة — الواجهة زجاج، والهواء يدخل من الجانب.

${xl ? alt('AIR903_MAX_W', 'كيس أبيض بمراوح 140 مم وتهويةٍ أماميّة.') : alt('SKY_TWO_W', 'كيس أبيض بانوراميّ بأربع مراوح وسعرٍ أقلّ.')}
https://www.thermaltake.com/view-380-${xl ? 'xl-' : ''}ws-argb-snow-mid-tower-chassis.html`,
});

const aquaElite = (white, offers) => ({
  categoryId: COOL, brand: 'Thermalright', name: `Aqua Elite 360 V3${white ? ' White' : ''}`, tdpWattage: 0, performanceTier: 3,
  specs: { type: 'AIO', sizeMm: '360', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: white ? 'White' : 'Black' },
  offers,
  description: `### Thermalright Aqua Elite 360 V3${white ? ' White' : ''}

مبرّد مائيّ 360 مم اقتصاديّ ${white ? 'بالأبيض' : 'بالأسود'} بثلاث مراوح ARGB — أرخص طريقٍ إلى رادييتر 360 مم تقريباً.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 360 مم وثلاث مراوح 120 مم:[/green] بمحامل S-FDB حتى 1,500 لفّة و66 CFM.

[green]هادئ:[/green] المراوح حتى 25.6 ديسيبل والمضخّة حتى 23.

[green]إضاءة ARGB:[/green] في المضخّة والمراوح بموصل 5V.

[green]يدعم كلّ المقابس الحاليّة:[/green] LGA1851 و1700 وAM5 وAM4.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المراوح بطيئة (1,500 لفّة) — أقلّ تبريداً من مبرّدات 360 مم الأعلى مع المعالجات الحارّة جداً.
* ضمان ثلاث سنوات فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة في المضخّة.

${white ? alt('PA120_W', 'مبرّد هوائيّ أبيض بلا مضخّة ولا خطر تسريب، بأداءٍ قريب مع معظم المعالجات.') : alt('PS120_EVO', 'مبرّد هوائيّ مزدوج بلا مضخّة ولا خطر تسريب، بأداءٍ قريب.')}
https://www.thermalright.com/product/aqua-elite-360-${white ? 'white-' : ''}v3/`,
});

const PARTS = [
  // ================================================================ الصناديق
  {
    categoryId: CASE, brand: 'Lian Li', name: 'O11 Vision Compact Black', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '408', maxCoolerHeight: '170', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: 'لا يوجد', color: 'Black', dualChamber: 'Yes' },
    offers: [C('lian-li-o11-vision-compact-case-black-41807'), A('B0DJPV8XG3'), M('lian-li-o11-vision-compact-tower-computer-case-up-to-360mm-radiator-9x-120mm-fan-support-1x-4mm-1x-3mm-tempered-glass-panels-steel-aluminum-materials-black-g99-o11vpx-00')],
    description: `### Lian Li O11 Vision Compact Black

النسخة السوداء من O11 Vision الأصغر: زجاجٌ في الأمام والجنب والأعلى بلا عمود زاوية، وحجرتان تُخفيان المزوّد والكابلات.

**التقنيات الأساسية المدعومة:**

[green]كرت حتى 408 مم:[/green] ومعه حاملٌ مضادّ للتدلّي.

[green]حجرتان منفصلتان:[/green] المزوّد والأقراص خلف اللوحة.

[green]رادييتر 360 مم في ثلاثة مواضع:[/green] الأعلى والجنب والأسفل — تسع مراوح 120 مم.

[green]زجاجٌ مقسّى:[/green] 4 مم للجانب و3 مم للباقي.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هواء حتى 170 مم فقط.
* لا مراوح في العلبة إطلاقاً — احسب ثمن ثلاثٍ على الأقلّ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* الزجاج الثلاثيّ يعني حرارةً أعلى من كيسٍ شبكيّ بالمراوح نفسها.

${alt('VISION_COMPACT_W', 'الكيس نفسه بالأبيض.')}
https://lian-li.com/product/o11-vision-compact/`,
  },
  {
    categoryId: CASE, brand: 'Lian Li', name: 'O11 Vision-M Digital', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Micro-ATX Tower', maxGpuLength: '410', maxCoolerHeight: '162', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '1x 140mm', color: 'Black', dualChamber: 'Yes', screen: '9.2" IPS 1920×462' },
    offers: [C('lian-li-o11-vision-m-digital-matx-case-black-49640'), A('B0H74KK1J2')],
    description: `### Lian Li O11 Vision-M Digital

O11 Vision-M الأسود (Micro-ATX) مع شاشة IPS مقاس 9.2 بوصة مدمجة تعرض حالة الجهاز أو صوراً تختارها.

**التقنيات الأساسية المدعومة:**

[green]شاشة IPS مقاس 9.2 بوصة:[/green] بدقّة 1920×462 وسطوع 500 nit.

[green]زجاج بانوراميّ بلا عمود زاوية:[/green] الواجهة والجانب والسقف.

[green]كرت حتى 410 مم:[/green] رغم صغر الكيس.

[green]حجرة خلفيّة للمزوّد والكابلات:[/green] ورادييتر 360 مم في السقف.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هواء حتى 162 مم، ومروحة واحدة 140 مم مرفقة فقط.
* أغلى من النسخة العاديّة بفارق الشاشة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات ATX — Micro-ATX وMini-ITX فقط.

${alt('VISION_M', 'الكيس نفسه دون شاشة وبسعرٍ أقلّ.')}
https://lian-li.com/product/o11-vision-m/`,
  },
  view380(false, [A('B0CPDGJVDL'), M('thermaltake-view-380-ws-argb-mid-tower-case-dual-chamber-atx-gaming-chassis-tempered-glass-wood-design-up-to-360mm-radiator-10x-120mm-fan-support-white-ca-1z2-00m6wn-ws')]),
  view380(true, [A('B0FTQJSQRT'), M('thermaltake-view-380-xl-ws-argb-mid-tower-pc-case-atx-hidden-connector-mb-support-dual-4mm-tg-panels-4x-argb-fans-360mm-rad-wood-elements-white-ca-11e-00m6wn-ws')]),

  // ================================================================ المبرّدات
  krakenPlus('240', 'Black', [C('nzxt-kraken-plus-240-rgb-v2-cooler-black-33511'), A('B0F5S84X8P'), M('nzxt-kraken-plus-240-rgb-liquid-cpu-cooler-1-54-transmissive-tft-262k-color-panel-240mm-radiator-f240-fans-2400-rpm-fan-speed-75-05-cfm-fan-airflow-black-rl-kr240-b2')],
    'KRAKEN_CORE_240', 'الرادييتر نفسه دون شاشة وبسعرٍ أقلّ بكثير.'),
  krakenPlus('240', 'White', [C('nzxt-kraken-plus-240-rgb-v2-cooler-white-33527'), A('B0F5SNTBNC'), M('nzxt-kraken-plus-240-rgb-liquid-cpu-cooler-1-54-transmissive-tft-262k-color-panel-240mm-radiator-f240-fans-2400-rpm-fan-speed-75-05-cfm-fan-airflow-white-rl-kr240-w2')],
    'KRAKEN_CORE_240', 'الرادييتر نفسه دون شاشة وبسعرٍ أقلّ بكثير.'),
  krakenPlus('360', 'White', [A('B0F5SCG6QC'), M('nzxt-kraken-plus-360-rgb-liquid-cpu-cooler-1-54-transmissive-tft-262k-color-panel-360mm-radiator-f360-fans-2400-rpm-fan-speed-75-05-cfm-fan-airflow-white-rl-kr360-w2')],
    'KRAKEN_PLUS_360', 'المبرّد نفسه بالأسود.'),
  {
    categoryId: COOL, brand: 'Corsair', name: 'iCUE LINK H150i RGB White', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'White' },
    offers: [A('B0C6PXT7YF'), M('corsair-icue-link-h150i-rgb-aio-liquid-cpu-cooler-360mm-radiator-with-120mm-qx120-rgb-fans-up-to-2400-rpm-speed-63-1-cfm-airflow-intel-1700-amd-am5-sockets-white')],
    description: `### Corsair iCUE LINK H150i RGB White

مبرّد مائيّ 360 مم أبيض من منظومة iCUE LINK: ثلاث مراوح QX120 RGB تتّصل ببعضها بكابلٍ واحد، ومعه وحدة System Hub.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح QX120 RGB:[/green] من 480 إلى 2,400 لفّة، بحسّاس حرارةٍ في كلّ مروحة.

[green]منظومة iCUE LINK:[/green] المراوح والمضخّة على كابلٍ واحد إلى الـHub المرفق.

[green]ضمان ستّ سنوات:[/green] وقاعدة نحاسيّة لـLGA1851/1700 وAM5/AM4.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* يحتاج برنامج iCUE للتحكّم الكامل بالإضاءة والمراوح.
* إضافة مراوح لاحقاً تتطلّب مراوح iCUE LINK الخاصّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة في المضخّة — نسخة LCD منفصلة وأغلى.

${alt('GALAHAD_W', 'مبرّد 360 مم أبيض بمراوح متّصلة وسعرٍ أقلّ.')}
https://www.corsair.com/us/en/p/cpu-coolers/cw-9061006-ww/icue-link-h150i-rgb-aio-liquid-cpu-cooler-white-cw-9061006-ww`,
  },
  aquaElite(false, [A('B0CCNTYLP2'), M('thermalright-aqua-elite-360-v3-cpu-liquid-cooler-360mm-radiator-triple-120mm-pwm-fans-argb-lighting-s-fdb-bearing-intel-lga-1700-1851-amd-am4-am5-black-aqua-elite-360-v3')]),
  aquaElite(true, [A('B0CFYP8DC1'), M('thermalright-aqua-elite-360-v3-cpu-liquid-cooler-360mm-radiator-triple-120mm-pwm-fans-argb-lighting-s-fdb-bearing-intel-lga-1700-1851-amd-am4-am5-white-aqua-elite-360-v3')]),
  {
    categoryId: COOL, brand: 'DeepCool', name: 'AK400 Pink', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'Air', sizeMm: '155', sockets: 'AM5/AM4/LGA1700/LGA1200/LGA115X', fanCount: '1', fanSize: '120mm', rgb: 'No', color: 'Pink' },
    offers: [C('deepcool-ak400-air-cooler-pink-21313'), M('deepcool-ak400-cpu-cooler-120mm-fdb-fan-1850-rpm-fan-speed-66-47-cfm-fan-airflow-29dba-fan-noise-4-pin-pwm-fan-connector-4x-direct-touch-copper-heatpipes-pink-r-ak400-wpnpmn-g')],
    description: `### DeepCool AK400 Pink

الإصدار الورديّ المحدود من AK400: مبرّد برجٍ واحد بأربعة أنابيب حراريّة يكفي معظم معالجات الفئة المتوسّطة.

**التقنيات الأساسية المدعومة:**

[green]أربعة أنابيب حراريّة 6 مم:[/green] بتماسٍ مباشر مع المعالج، وقدرة تبديد حتى 220 واط بحسب الشركة.

[green]مروحة 120 مم بمحمل FDB:[/green] حتى 1,850 لفّة بضوضاء لا تتجاوز 29 ديسيبل.

[green]ارتفاع 155 مم:[/green] يدخل معظم الكيسات المتوسّطة.

[green]معجون حراريّ مطبّق مسبقاً.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* برجٌ واحد بمروحة واحدة — لا يناسب معالجات i7/i9 أو Ryzen 9 تحت حملٍ طويل.
* صفحة الشركة الإنجليزيّة لا تذكر LGA1851 (Core Ultra).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة ولا شاشة.

${alt('AK400D_W', 'المبرّد نفسه بالأبيض مع شاشةٍ تعرض حرارة المعالج.')}
https://www.deepcool.com/products/Cooling/cpuaircoolers/AK400-PINK-LIMITED-Performance-CPU-Cooler-1700-AM5/2024/18016.shtml`,
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
writeFileSync(`backups/added-batch7-${stamp}.json`, JSON.stringify({ PARTS, EXTRA, movedBefore }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch7-${stamp}.json`);

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
  console.log(`↪ نُقل عرض مايكرولس إلى ${m.to}`);
}
for (const e of EXTRA) {
  await prisma.componentOffer.create({ data: { componentId: e.id, storeId: stores[e.offer.store], url: e.offer.url, inStock: true } });
  ids.push(e.id);
  console.log(`➕ ${e.name} ← ${e.offer.store}`);
}

console.log(`\nالتالي (واحدةً واحدة):\n  ${ids.join(' ')}`);
await prisma.$disconnect();
