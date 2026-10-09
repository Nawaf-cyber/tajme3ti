/**
 * ============ الدفعة السادسة من «القطع الناقصة» — ٢٢ قطعة — 2026-10-08 ============
 *
 * طلب نوّاف: «كمل ضيف دفعة سادسة». القاعدة: متجران حيّان على الأقلّ، بلا تكرار.
 *
 * المصدر هذه المرّة: مخزون كازاسوق نفد من الجديد، فبُحث عن ~٩٠ طرازاً شائعاً غير موجود
 * عندنا (رام، أقراص، مزوّدات، كيسات، مبرّدات) في أمازون (بحث المتصفّح) ومايكرولس
 * (بفاصل ١٥ ث) وكازاسوق معاً، وأُخذ ما وُجد حيّاً في متجرين بالطراز واللون نفسيهما.
 * كلّ صفحة متجرٍ قُرئت 2026-10-08، والمواصفات من صفحة الصانع في آخر الوصف.
 *
 * لُبسٌ حُسم:
 *   · H5 Flow RGB الأبيض في كازاسوق EAN 5056547205861 = NZXT CC-H52FW-R1 (صفحة NZXT)،
 *     وH5 Flow الأبيض 5056547205847؛ CH780 الأسود/الأبيض وCH560 DIGITAL WH بـEAN صفحة DeepCool.
 * ✕ لم يُضف رغم المتجرين:
 *   · Corsair Dominator Titanium 32GB الأبيض — أمازون نسخة XMP (C30) ومايكرولس نسخة EXPO (Z30).
 *   · Corsair 6500X RGB الأبيض — EAN كازاسوق لا يُعرف طرازه.
 *   · Corsair 4000D RGB Airflow — أمازون الأصليّ ومايكرولس V2؛ Nautilus 360 RS — مايكرولس نسخة LCD.
 *   · Kingston Fury Beast RGB 5600 — أمازون أبيض ومايكرولس أسود.
 *
 *   node scripts/add-batch6-2026-10-08.mjs           # عرض
 *   node scripts/add-batch6-2026-10-08.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const PSU = 'cmpfziqh70002x4ym6ln587z2';
const RAM = 'cmpfziqks0003x4yma730h1be';
const STO = 'cmpfziqr70005x4ym3k7uh079';
const CASE = 'cmpfziquj0006x4ym53f0ehcw';
const COOL = 'cmszm2ym00000swymvd5s2yxm';

const C = (slug) => ({ store: 'cazasouq', url: `https://www.cazasouq.com/${slug}` });
const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });
const M = (slug) => ({ store: 'microless', url: `https://saudi.microless.com/product/${slug}/` });

const ALT = {
  H6_FLOW_W: ['NZXT H6 Flow RGB White', 'cmpieb3if000d00ymz13tdkyt'],
  AIR903_MAX_W: ['Montech AIR 903 MAX White', 'cmtcr2g9d000lo8ymvzkob7m7'],
  LANCOOL_216: ['Lian Li LANCOOL 216', 'cmpfzir17000gx4ymtjjn4ag1'],
  LANCOOL_III: ['Lian Li Lancool III RGB', 'cmpieby64002a00ym3f3vl6no'],
  H9_FLOW: ['NZXT H9 Flow', 'cmpiebzwo002g00ym85eswm2w'],
  VISION_COMPACT: ['Lian Li O11 Vision Compact White', 'cmu6n396c0000w4ymd6gibkjc'],
  O11_EVO: ['Lian Li O11 Dynamic EVO', 'cmpieb3ts000e00ymflyrzgd2'],
  CH560D: ['DeepCool CH560 Digital', 'cmpiebxm6002800ymk4bd3ep4'],
  MESHIFY3_W: ['Fractal Design Meshify 3 White', 'cmu6n39q20004w4ymrr0kk1wz'],
  KING65_W: ['Montech KING 65 PRO White', 'cmu6n39zz0006w4ymwuyltzq8'],
  FLARE_X5: ['G.Skill Flare X5 DDR5 32GB 6000MHz', 'cmpiecrkg005h00ymkt3mt6pp'],
  EVO_PLUS_2TB: ['Samsung 990 EVO Plus 2TB', 'cmr3fmuzl000a04lhss2v2014'],
  NV3_2TB: ['Kingston NV3 2TB', 'cmpiecfxr004200ymi6fdyww9'],
  EVO870_1TB: ['Samsung 870 EVO 1TB SATA', 'cmr2lb5is000qjgymrzv3tija'],
  KRAKEN_ELITE_360_W: ['NZXT Kraken Elite 360 RGB White', 'cmuztryee001kkcymzw85r224'],
  FOCUS_GX850: ['Seasonic Focus GX-850', 'cmr3crglp0004ncym20vrcnug'],
  PP13M_850: ['be quiet! Pure Power 13 M 850W', 'cmpiebabc001200ymf3v1d2y6'],
  GF3_1000: ['Thermaltake Toughpower GF3 1000W', 'cmpiechj4004a00ym7kkv09n4'],
};
const alt = (k, why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n* ${why}`;
/* عرض مايكرولس لـLancool III RGB الأبيض (G99.LAN3RW.00) كان مربوطاً خطأً بصفّ «Lancool III RGB»
   الأسود (اكتشفه فحص التكرار) — يُنقل إلى صفّه الصحيح بعد إنشائه */
const MOVE = [{ offerId: 'cmsgek3o6007ipsymkqjuq9ww', from: 'cmpieby64002a00ym3f3vl6no', to: 'Lancool III RGB White', brand: 'Lian Li', urlHas: 'white-g99-lan3rw-00' }];
const EXTRA = [];


const h5 = (name, color, fans, offers, intro, alt1) => ({
  categoryId: CASE, brand: 'NZXT', name, tdpWattage: 0, performanceTier: 3,
  specs: { formFactor: 'Mid Tower', maxGpuLength: '410', maxCoolerHeight: '170', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: fans, color },
  offers,
  description: `### NZXT ${name}

${intro}

**التقنيات الأساسية المدعومة:**

[green]كرت حتى 410 مم ومبرّد هواء حتى 170 مم:[/green] في كيسٍ متوسّط صغير الحجم.

[green]رادييتر 360 مم في الواجهة:[/green] و240 مم في السقف.

[green]واجهة وسقف شبكيّان:[/green] تدفّقٌ هوائيّ مباشر.

[green]يقبل حتى E-ATX:[/green] بعرضٍ حتى 277 مم، ومزوّداً حتى 200 مم.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* رادييتر السقف حتى 240 مم فقط (280 مع ذاكرةٍ منخفضة).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات Back-Connect.

${alt1}
https://nzxt.com/products/${name.includes('RGB') ? 'h5-flow-rgb' : 'h5-flow'}`,
});

const PARTS = [
  // ================================================================ الصناديق
  h5('H5 Flow RGB White', 'White', 'F360 RGB Core + 1x 120mm',
    [C('nzxt-h5-flow-rgb-atx-midtower-white'), A('B0D2MJG9WJ'), M('2Xaptz5lYp')],
    'إصدار 2024 من كيس NZXT المتوسّط الصغير بالأبيض: واجهة شبكيّة ومروحة F360 RGB Core (ثلاث مراوح في إطارٍ واحد) ومروحة خلفيّة.',
    alt('H6_FLOW_W', 'كيس NZXT أبيض بحجرتين وزجاجٍ بانوراميّ.')),
  h5('H5 Flow RGB Black', 'Black', 'F360 RGB Core + 1x 120mm',
    [C('nzxt-h5-flow-rgb-edition-atx-compact-mid-tower-all-black-41879'), A('B0D2MJT1FY')],
    'إصدار 2024 من كيس NZXT المتوسّط الصغير بالأسود: واجهة شبكيّة ومروحة F360 RGB Core (ثلاث مراوح في إطارٍ واحد) ومروحة خلفيّة.',
    alt('LANCOOL_216', 'مراوح 160 مم أكبر في الواجهة بسعرٍ قريب.')),
  h5('H5 Flow White', 'White', '2x 120mm',
    [C('h5-flow-white-mid-tower-case'), A('B0D2MHBXRR')],
    'إصدار 2024 من كيس NZXT المتوسّط الصغير بالأبيض دون إضاءة: واجهة شبكيّة ومروحتان F120Q هادئتان.',
    alt('AIR903_MAX_W', 'كيس أبيض بأربع مراوح 140 مم ARGB مركّبة.')),

  {
    categoryId: CASE, brand: 'Lian Li', name: 'Lancool III RGB White', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '435', maxCoolerHeight: '185', radiatorSupport: '420mm', psuFormFactor: 'ATX', includedFans: '4x 140mm ARGB', color: 'White', features: ['لوح جانبي زجاجي بمفصّلة — يُفتح كالباب'] },
    offers: [C('lian-li-lancool-iii-mesh-rgb-case-white-cp994-4-8624'), A('B0B467H81C')],
    description: `### Lian Li Lancool III RGB White

النسخة البيضاء من كيس Lancool III الكبير: أربع مراوح 140 مم ARGB، ورادييتر 420 مم في الواجهة، ولوحٌ زجاجيّ يُفتح كالباب.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح 140 مم ARGB:[/green] ثلاثٌ في الواجهة وواحدة في الخلف.

[green]كرت حتى 435 مم:[/green] ومبرّد هواء حتى 185 مم.

[green]رادييتر 420 مم في الواجهة:[/green] و360 مم في السقف.

[green]لوح جانبيّ بمفصّلة:[/green] يُفتح كالباب دون فكّ براغٍ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* حجمه كبير — يأخذ مساحةً على المكتب.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس مدمجاً ولا مناسباً للأماكن الضيّقة.

${alt('LANCOOL_III', 'الكيس نفسه بالأسود.')}
https://lian-li.com/product/lancool-iii/`,
  },
  {
    categoryId: CASE, brand: 'Lian Li', name: 'Lancool III White', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '435', maxCoolerHeight: '185', radiatorSupport: '420mm', psuFormFactor: 'ATX', includedFans: '4x 140mm', color: 'White', features: ['لوح جانبي زجاجي بمفصّلة — يُفتح كالباب'] },
    offers: [A('B0B7NSQS5Q'), M('lian-li-lancool-iii-e-atx-mid-tower-case-tempered-glass-side-panel-140mm-pwm-fans-up-to-420mm-radiator-size-support-8-expansion-slots-white-g99-lan3w-00')],
    description: `### Lian Li Lancool III White

Lancool III الأبيض دون إضاءة: أربع مراوح 140 مم PWM، ورادييتر 420 مم في الواجهة، ولوحٌ زجاجيّ بمفصّلة.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح 140 مم PWM:[/green] ثلاثٌ في الواجهة وواحدة في الخلف.

[green]كرت حتى 435 مم:[/green] ومبرّد هواء حتى 185 مم.

[green]رادييتر 420 مم في الواجهة:[/green] و360 مم في السقف.

[green]لوح جانبيّ بمفصّلة:[/green] يُفتح كالباب.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* حجمه كبير.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة في المراوح — نسخة RGB أغلى.

${alt('LANCOOL_III', 'النسخة ذات المراوح المضيئة.')}
https://lian-li.com/product/lancool-iii/`,
  },
  {
    categoryId: CASE, brand: 'NZXT', name: 'H9 Elite White', tdpWattage: 0, performanceTier: 5,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '435', maxCoolerHeight: '165', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '3x 120mm RGB + 1x 120mm', color: 'White', dualChamber: 'Yes' },
    offers: [A('B0BJH5PJ7N'), M('nzxt-h9-elite-dual-chamber-atx-mid-tower-pc-case-unique-glass-panel-intuitive-cable-mgt-360mm-radiators-10x120mm-fans-support-built-in-rgb-fan-controller-usb-3-2-type-c-a-white-cm-h91ew-01')],
    description: `### NZXT H9 Elite White

كيس NZXT الأعلى بحجرتين وزجاجٍ في الواجهة والجانب والسقف، وأربع مراوح مركّبة ووحدة تحكّمٍ بالإضاءة.

**التقنيات الأساسية المدعومة:**

[green]حجرتان منفصلتان:[/green] القطع في الأمامية، والمزوّد والكابلات خلفها.

[green]أربع مراوح مركّبة:[/green] ثلاث F120 RGB Duo في الجانب وF120Q في الخلف، مع وحدة تحكّمٍ بستّ قنوات إضاءة.

[green]ثلاثة أماكن لرادييتر 360 مم:[/green] وعشر مراوح إجمالاً.

[green]كرت حتى 435 مم:[/green] ومزوّد حتى 200 مم.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هواء حتى 165 مم.
* وزنه 13 كيلو وحجمه كبير.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات Back-Connect.

${alt('H9_FLOW', 'الهيكل نفسه بسقفٍ شبكيّ وسعرٍ أقلّ.')}
https://support.nzxt.com/hc/en-us/articles/37840024628891-H9-2023-Series-Specs`,
  },
  {
    categoryId: CASE, brand: 'Lian Li', name: 'O11 Vision-M White', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Micro-ATX Tower', maxGpuLength: '410', maxCoolerHeight: '162', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '1x 140mm', color: 'White', dualChamber: 'Yes' },
    offers: [C('lian-li-o11-vision-m-matx-case-white-49720'), A('B0GLPFNN1J'), M('lian-li-o11-vision-m-mid-tower-case-m-atx-mini-itx-3-sided-tempered-glass-dual-chamber-360mm-radiator-410mm-gpu-anti-sag-bracket-1x-140mm-fan-white-g99-o11vmw-00')],
    description: `### Lian Li O11 Vision-M White

النسخة البيضاء من O11 Vision الصغير (Micro-ATX): زجاجٌ في ثلاث جهات بلا عمود زاوية، وحجرتان منفصلتان.

**التقنيات الأساسية المدعومة:**

[green]زجاج بانوراميّ بلا عمود زاوية:[/green] الواجهة والجانب والسقف.

[green]كرت حتى 410 مم:[/green] رغم صغر الكيس.

[green]رادييتر 360 مم في السقف:[/green] ومراوح حتى ثلاث في الأسفل.

[green]حجرة خلفيّة للمزوّد والكابلات:[/green] مع مروحة 140 مم مركّبة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هواء حتى 162 مم، ومروحة واحدة مرفقة فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات ATX — Micro-ATX وMini-ITX فقط.

${alt('VISION_COMPACT', 'الفكرة نفسها بحجمٍ يقبل لوحات ATX.')}
https://lian-li.com/product/o11-vision-m/`,
  },
  ...['White', 'Black'].map((color) => ({
    categoryId: CASE, brand: 'DeepCool', name: `CH780 ${color}`, tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Full Tower', maxGpuLength: '480', maxCoolerHeight: '132', radiatorSupport: '420mm', psuFormFactor: 'ATX', includedFans: '1x 420mm ARGB (3x 140mm)', color, dualChamber: 'Yes', verticalGpu: 'PCIe 4.0 Riser' },
    offers: color === 'White'
      ? [C('deepcool-ch780-case-white-aa16241'), M('deepcool-ch780-full-tower-atx-pc-case-panoramic-glass-panel-vertical-mount-gen-4-riser-cable-up-to-420mm-aio-trinity-140mm-argb-fans-type-c-4x-usb-3-0-white-r-ch780-whade41-g-1')]
      : [C('deepcool-ch780-case-black-aa16237'), M('deepcool-ch780-full-tower-atx-pc-case-panoramic-tempered-glass-vertical-mount-gen-4-riser-cable-up-to-420mm-aio-trinity-140mm-argb-fans-type-c-4x-usb-3-0-black-r-ch780-bkade41-g-1')],
    description: `### DeepCool CH780 ${color}

كيس بانوراميّ كبير بحجرتين، والكرت فيه عموديّ إلزاماً بكابل PCIe 4.0 مرفق — مصمّمٌ للتبريد المائيّ بثلاثة رادييترات 420 مم.

**التقنيات الأساسية المدعومة:**

[green]ثلاثة أماكن لرادييتر 420 مم:[/green] السقف والجانب والأسفل.

[green]مروحة 420 مم ARGB مركّبة:[/green] ثلاث مراوح 140 مم في إطارٍ واحد بكابلٍ واحد.

[green]كرت عموديّ حتى 480 مم:[/green] بكابل PCIe 4.0 وحاملٍ مرفقين.

[green]منفذ Type-C أماميّ وأربعة USB 3.0.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هواء حتى 132 مم فقط — الكيس مصمّم للتبريد المائيّ.
* حجمه كبير جداً (55 سم ارتفاعاً).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تركيب أفقيّ للكرت — العموديّ فقط.

${alt('O11_EVO', 'كيس بحجرتين يقبل المبرّدات الهوائيّة والتركيب الأفقيّ للكرت.')}
https://www.deepcool.com/products/Cases/${color === 'White' ? 'CH780-WH-Panoramic-Tempered-Glass-ATX-Case/2023/17535' : 'CH780-Panoramic-Tempered-Glass-ATX-Case/2023/17534'}.shtml`,
  })),
  {
    categoryId: CASE, brand: 'DeepCool', name: 'CH560 Digital White', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '380', maxCoolerHeight: '175', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '3x 140mm ARGB + 1x 120mm ARGB', color: 'White', screen: 'Dual-Status Digital Display' },
    offers: [C('deepcool-ch560-digital-e-atx-4f-rgb-case-white-aa14170'), M('deepcool-ch560-digital-atx-mid-tower-computer-case-abs-spcc-tempered-glass-materials-real-time-dual-status-digital-display-hybrid-airflow-glass-side-panel-white-r-ch560-whape4d-g-1')],
    description: `### DeepCool CH560 Digital White

النسخة البيضاء من كيس DeepCool الشبكيّ بشاشةٍ رقميّة تعرض حرارة المعالج والكرت، وأربع مراوح ARGB.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح ARGB:[/green] ثلاث 140 مم في الواجهة وواحدة 120 مم في الخلف.

[green]شاشة رقميّة مزدوجة:[/green] حرارة المعالج والكرت واستهلاكهما.

[green]واجهة شبكيّة وجانبٌ هجين:[/green] زجاجٌ مع فتحات تهويةٍ للكرت.

[green]رادييتر 360 مم في الواجهة أو السقف.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* كرت حتى 380 مم، ومزوّد حتى 170 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات Back-Connect.

${alt('CH560D', 'الكيس نفسه بالأسود.')}
https://www.deepcool.com/products/Cases/CH560-DIGITAL-WH-Airflow-Case-With-Status-Screen/2023/17175.shtml`,
  },
  {
    categoryId: CASE, brand: 'Fractal Design', name: 'Meshify 3 Black', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '349', maxCoolerHeight: '173', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '3x Momentum 140mm', color: 'Black' },
    offers: [A('B0CS3SYPB1'), M('fractal-design-meshify-3-atx-mid-tower-computer-case-3x-momentum-14-fans-up-to-360mm-radiator-6x-fan-support-cable-organizers-light-tint-glass-panel-black-fd-c-mes3a-02')],
    description: `### Fractal Design Meshify 3 Black

كيس Fractal الشبكيّ بنسخته الثالثة بالأسود: ثلاث مراوح Momentum 140 مم وزجاجٌ فاتح التظليل.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح Momentum 140 مم:[/green] تدفّقٌ عالٍ بضجيجٍ منخفض.

[green]واجهة شبكيّة بنمطٍ هندسيّ:[/green] تهويةٌ أماميّة مباشرة.

[green]رادييتر 360 مم:[/green] ومبرّد هواء حتى 173 مم.

[green]منظّمات كابلات مدمجة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* كرت حتى 349 مم — بعض الكروت الكبيرة أطول.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة في المراوح.

${alt('MESHIFY3_W', 'الكيس نفسه بالأبيض.')}
https://www.fractal-design.com/products/cases/meshify/meshify-3/`,
  },
  {
    categoryId: CASE, brand: 'Montech', name: 'Sky Two White', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '400', maxCoolerHeight: '168', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '4x 120mm ARGB', color: 'White' },
    offers: [A('B0BNTM5W5P'), M('montech-sky-two-argb-atx-mid-tower-computer-cases-up-to-360mm-radiator-support-4x-preinstalled-pwm-fans-side-bottom-dust-filter-built-in-cable-management-white-sky-two-wh')],
    description: `### Montech Sky Two White

كيس أبيض بزجاجٍ في الواجهة والجانب وأربع مراوح ARGB PWM مركّبة — مظهرٌ بانوراميّ بسعرٍ متوسّط.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح 120 مم ARGB PWM:[/green] في الجانب والأسفل والخلف.

[green]كرت حتى 400 مم:[/green] ومزوّد حتى 210 مم.

[green]رادييتر 360 مم في السقف.[/green]

[green]زجاجٌ في الواجهة والجانب.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هواء حتى 168 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تهوية أماميّة — الواجهة زجاج.

${alt('KING65_W', 'كيس Montech أبيض بانوراميّ آخر بمراوح أكبر.')}
https://www.montechpc.com/sky-two`,
  },

  // ================================================================ الرام
  {
    categoryId: RAM, brand: 'Crucial', name: 'Pro 32GB (2x16GB) DDR5 6000MHz CL36', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '6000', casLatency: 'CL36', profile: 'XMP 3.0 & EXPO', rgb: 'No', heightMm: '35', color: 'Black' },
    offers: [A('B0CTHXMYL8'), M('crucial-pro-oc-gaming-desktop-memory-32gb-2x-16gb-capacity-ddr5-memory-type-6000-mhz-memory-speed-cl36-cas-latency-1-35-voltage-intel-xmp-3-0-amd-expo-profile-cp2k16g60c36u5b')],
    description: `### Crucial Pro 32GB (2x16GB) DDR5 6000MHz CL36

طقم DDR5 بسرعة 6000 بملفّي XMP وEXPO معاً ومشتّتٍ منخفض — يناسب Intel وAMD دون بحثٍ عن نسخةٍ مخصّصة.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت CL36:[/green] السرعة المثلى لمعالجات Ryzen 7000 و9000.

[green]ملفّا XMP 3.0 وEXPO:[/green] يعمل على لوحات Intel وAMD معاً.

[green]ارتفاع 35 مم:[/green] لا يتعارض مع المبرّدات الهوائيّة الكبيرة.

[green]من Micron مباشرة:[/green] شركةٌ تصنع شرائح الذاكرة نفسها.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيت CL36 — أبطأ قليلاً من أطقم CL30 بالسرعة نفسها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB.

${alt('FLARE_X5', 'طقم 6000 بتوقيت CL28–30 أسرع، مخصّص لـAMD.')}
https://www.crucial.com/memory/ddr5/cp2k16g60c36u5b`,
  },

  // ================================================================ التخزين
  {
    categoryId: STO, brand: 'WD', name: 'Black SN7100 1TB', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7250 MB/s', writeSpeed: '6900 MB/s', dramCache: 'No (HMB)', tbw: '600 TB' },
    offers: [A('B0DN7CYYSD'), M('sandisk-wd_black-sn7100-internal-ssd-1tb-capacity-m-2-2280-form-factor-7250mb-s-sequential-read-6900mb-s-sequential-write-pcie-gen-4-0-interface-black-wds100t4x0e')],
    description: `### WD Black SN7100 1TB

قرص الجيل الرابع الأحدث من WD_Black (صار اسمه SanDisk Optimus GX 7100): قريبٌ من سقف الجيل الرابع باستهلاكٍ منخفض.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7250 MB/s وكتابة 6900 MB/s:[/green] قرب سقف الجيل الرابع.

[green]كفاءة طاقة عالية:[/green] يناسب الأجهزة المحمولة والمكتبيّة معاً.

[green]ذاكرة NAND من الجيل BiCS8:[/green] وضمان خمس سنوات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا ذاكرة DRAM — يستعير من ذاكرة الجهاز (HMB)، فيتراجع أداؤه قليلاً في النسخ الطويل جداً.
* تحمّل 600 تيرابايت كتابة — متوسّط للفئة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مشتّت حرارة مرفق.

${alt('EVO_PLUS_2TB', 'سعةٌ أكبر بالسرعة نفسها تقريباً.')}
https://www.sandisk.com/products/ssd/internal-ssd/wd-black-sn7100-nvme-internal-ssd?sku=WDS100T4X0E-00CJA0`,
  },
  {
    categoryId: STO, brand: 'Kingston', name: 'NV3 4TB', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'NVMe M.2', capacity: '4TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '6000 MB/s', writeSpeed: '5000 MB/s', dramCache: 'No', tbw: '1280 TB' },
    offers: [A('B0DJ1QC42R'), M('kingston-nv3-pcie-4-0-nvme-internal-ssd-4tb-capacity-m-2-2280-form-factor-6000-mb-s-sequential-read-5000-mb-s-sequential-write-speed-3d-nand-technology-1280-tbw-endurance-snv3s-4000g')],
    description: `### Kingston NV3 4TB

أرخص طريقٍ إلى 4 تيرابايت NVMe من الجيل الرابع — مساحةٌ كبيرة لمكتبة ألعاب.

**التقنيات الأساسية المدعومة:**

[green]سعة 4 تيرابايت:[/green] تتّسع لعشرات الألعاب الكبيرة.

[green]قراءة 6000 MB/s:[/green] أسرع بكثير من أقراص SATA.

[green]تحمّل 1280 تيرابايت كتابة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا ذاكرة DRAM — يتباطأ في النسخ الطويل بعد امتلاء الذاكرة المؤقّتة.
* أبطأ من أقراص الجيل الرابع العليا (7000+).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب العمل الاحترافيّ الثقيل بالكتابة المستمرّة.

${alt('NV3_2TB', 'القرص نفسه بسعة 2 تيرابايت وسعرٍ أقلّ.')}
https://www.kingston.com/en/ssd/nv3-nvme-pcie-ssd`,
  },
  {
    categoryId: STO, brand: 'Samsung', name: '870 EVO 2TB SATA', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'SATA SSD 2.5"', capacity: '2TB', interface: 'SATA III', formFactor: '2.5-inch', readSpeed: '560 MB/s', writeSpeed: '530 MB/s', dramCache: 'Yes', tbw: '1200 TB' },
    offers: [A('B08T25MBF3'), M('samsung-870-evo-2tb-2-5-sata-iii-internal-ssd-up-to-560-mb-s-seq-read-530-mb-s-seq-write-speed-v-nand-technology-2gb-lpddr4-cache-mkx-controller-1-5-m-hrs-mtbf-black-mz-77e2t0bw')],
    description: `### Samsung 870 EVO 2TB SATA

قرص SATA بحجم 2.5 بوصة بسعة 2 تيرابايت — لترقية جهازٍ قديم بلا منفذ M.2، أو قرصاً ثانياً للتخزين.

**التقنيات الأساسية المدعومة:**

[green]منفذ SATA:[/green] يعمل في أيّ جهازٍ تقريباً.

[green]ذاكرة DRAM بسعة 2 جيجابايت:[/green] أداءٌ ثابت.

[green]تحمّل 1200 تيرابايت وضمان خمس سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سرعة SATA (560 MB/s) أبطأ بكثير من أقراص NVMe — وسعره قريبٌ من NVMe بالسعة نفسها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يُنصح به قرصاً رئيسيّاً في جهازٍ جديد فيه منفذ M.2.

${alt('EVO870_1TB', 'القرص نفسه بسعة 1 تيرابايت.')}
https://www.samsung.com/us/memory-storage/sata-ssd/870-evo-sata-2-5-ssd-2tb-sku-mz-77e2t0b-am/`,
  },

  // ================================================================ المبرّد
  {
    categoryId: COOL, brand: 'Lian Li', name: 'Galahad II Trinity SL-INF 360 White', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'White' },
    offers: [A('B0CBV7LM9C'), M('lian-li-galahad-ii-trinity-sl-inf-360-all-in-one-cpu-cooler-argb-pwm-3-fan-slots-120-mm-2150-rpm-fan-speed-fluid-dynamic-bearing-61-3-cfm-airflow-360mm-radiator-size-white-g89-ga2t36inw-00')],
    description: `### Lian Li Galahad II Trinity SL-INF 360 White

مبرّد مائيّ 360 مم أبيض بمراوح UNI FAN SL-Infinity المتّصلة ببعضها بلا كابلات، وإضاءة «مرآة لا نهائيّة».

**التقنيات الأساسية المدعومة:**

[green]مراوح SL-INF متّصلة ببعضها:[/green] تُركّب كقطعةٍ واحدة بكابلٍ واحد.

[green]مضخّة 3200 دورة بمحمل FDB:[/green] بضوضاء 16.6 ديسيبل فقط.

[green]ضمان ستّ سنوات:[/green] ويدعم كلّ المقابس الحاليّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المراوح حتى 2100 دورة و61 CFM — أقلّ تدفّقاً من مراوح الأداء العالي.
* الإضاءة الكاملة تحتاج برنامج L-Connect.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة في الرأس.

${alt('KRAKEN_ELITE_360_W', 'مبرّد 360 مم أبيض بشاشة LCD كبيرة.')}
https://lian-li.com/product/galahad-ii-trinity/`,
  },

  // ================================================================ المزوّدات
  {
    categoryId: PSU, brand: 'Gigabyte', name: 'UD850GM PG5 V2', tdpWattage: 0, performanceTier: 3,
    specs: { wattage: '850', rating: '80+ Gold', modularity: 'Full', formFactor: 'ATX 3.1', color: 'Black', qualityTier: 'C+' },
    offers: [A('B0FFMYW8CV'), M('gigabyte-ud850gm-pg5-v2-fully-modular-power-supply-850w-power-80-plus-gold-efficiency-120mm-hydraulic-bearing-atx-12v-v3-1-active-pfc-japanese-capacitors-black-gp-ud850gm-pg5-v2')],
    description: `### Gigabyte UD850GM PG5 V2

مزوّد 850 واط Gold بكابلات منفصلة ومعيار ATX 3.1 بسعرٍ منخفض — لكنّ تقييم جودته متواضع.

**التقنيات الأساسية المدعومة:**

[green]كابل 16 سنّاً:[/green] لكروت RTX 40 و50 دون محوّل.

[green]كابلات منفصلة بالكامل:[/green] ومعيار ATX 3.1.

[green]مروحة 120 مم بمحمل هيدروليكيّ:[/green] تتوقّف تحت 20% من الحمل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* درجة C+ في تقييم SPL: «مشكلاتٌ متعدّدة» منها ضعف الاستجابة لقفزات الاستهلاك.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يُنصح به لكروت الفئة العليا — مزوّداتٌ بالسعر نفسه تقريباً أعلى جودة.

${alt('FOCUS_GX850', 'مزوّد 850 واط بدرجة A- في تقييم SPL.')}
https://www.gigabyte.com/Power-Supply/GP-UD850GM-PG5-V2/sp`,
  },
  {
    categoryId: PSU, brand: 'ASUS', name: 'TUF Gaming 850W Gold', tdpWattage: 0, performanceTier: 4,
    specs: { wattage: '850', rating: '80+ Gold', modularity: 'Full', formFactor: 'ATX 3.0', color: 'Black', qualityTier: 'B' },
    offers: [A('B0BK541686'), M('asus-tuf-gaming-850w-80plus-gold-fully-modular-power-supply-atx-3-0-compatible-80-gold-certified-military-grade-dual-ball-bearing-axial-tech-fan-pcb-coating-black-90ye00s2-b0na00')],
    description: `### ASUS TUF Gaming 850W Gold

مزوّد TUF بقدرة 850 واط: كابلات منفصلة، ومروحة بمحملين كرويّين، وطلاءٌ واقٍ للوحة الدارة.

**التقنيات الأساسية المدعومة:**

[green]كابل 16 سنّاً (PCIe 5.0):[/green] لكروت RTX 40 و50.

[green]مروحة Axial-tech بمحملين كرويّين:[/green] عمرٌ أطول من محامل الكمّ.

[green]طلاء واقٍ للوحة الدارة:[/green] يحميها من الرطوبة والغبار.

[green]80+ Gold وكابلات منفصلة بالكامل.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* درجة B في تقييم SPL — جيّد لا ممتاز.
* معيار ATX 3.0 لا 3.1.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا وضع إيقاف المروحة.

${alt('PP13M_850', 'مزوّد 850 واط بدرجة أعلى (B+) ومعيار ATX 3.1 ومروحةٍ تتوقّف عند الحمل الخفيف.')}
https://www.asus.com/motherboards-components/power-supply-units/tuf-gaming/tuf-gaming-850g/techspec/`,
  },
  {
    categoryId: PSU, brand: 'ASUS', name: 'TUF Gaming 850W Gold EVO', tdpWattage: 0, performanceTier: 4,
    specs: { wattage: '850', rating: '80+ Gold', modularity: 'Full', formFactor: 'ATX 3.1', color: 'Black', qualityTier: 'B+' },
    offers: [A('B0GHNB7JYQ'), M('asus-tuf-gaming-850w-gold-evo-full-modular-power-supply-atx-3-1-compatible-80-plus-gold-active-pfc-dual-ball-fan-bearings-protective-pcb-coating-black-90ye00sa-b0na00')],
    description: `### ASUS TUF Gaming 850W Gold EVO

الإصدار الأحدث من مزوّد TUF بقدرة 850 واط: معيار ATX 3.1، وكفاءة Cybenetics Platinum على 230 فولت، وضمان ثماني سنوات.

**التقنيات الأساسية المدعومة:**

[green]معيار ATX 3.1 وكابل 12V-2x6:[/green] لكروت RTX 50.

[green]كفاءة Cybenetics Platinum على 230 فولت:[/green] وهي الكهرباء المنزليّة في السعوديّة.

[green]مروحة 135 مم بمحملين كرويّين:[/green] وطولٌ مدمج (140 مم).

[green]ضمان ثماني سنوات:[/green] ودرجة B+ في تقييم SPL.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ضوضاء Cybenetics ‏A- — ليس الأهدأ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا وضع إيقاف المروحة.

${alt('FOCUS_GX850', 'مزوّد 850 واط بدرجة A- في تقييم SPL.')}
https://www.asus.com/motherboards-components/power-supply-units/tuf-gaming/tuf-gaming-850g-evo/techspec/`,
  },
  ...[['750', 'B0FBX9VS3B', 'be-quiet-pure-power-13-m-fully-modular-power-supply-750w-power-atx-3-1-compatible-80-plus-gold-efficiency-pcie-5-1-12v-2x6-600w-semi-passive-120mm-silent-fan-bp026uk', '5960', 4],
      ['1000', 'B0FBXX1D17', 'be-quiet-pure-power-13-m-fully-modular-power-supply-1000w-power-atx-3-1-compatible-80-plus-gold-efficiency-pcie-5-1-12v-2x6-600w-semi-passive-120mm-silent-fan-bp028uk', '5932', 5]]
    .map(([w, asin, ml, page, tier]) => ({
      categoryId: PSU, brand: 'be quiet!', name: `Pure Power 13 M ${w}W`, tdpWattage: 0, performanceTier: tier,
      specs: { wattage: w, rating: '80+ Gold', modularity: 'Full', formFactor: 'ATX 3.1', color: 'Black', qualityTier: 'B+' },
      offers: [A(asin), M(ml)],
      description: `### be quiet! Pure Power 13 M ${w}W

مزوّد be quiet! الهادئ بقدرة ${w} واط: معيار ATX 3.1، وكابل 12V-2x6، ومروحة تتوقّف تماماً تحت الحمل الخفيف.

**التقنيات الأساسية المدعومة:**

[green]هادئ جداً:[/green] المروحة تتوقّف عند الحمل الخفيف، وضجيجها نحو 8 ديسيبل عند نصف الحمل.

[green]كابل 12V-2x6 (600 واط) وأربعة كابلات 6+2:[/green] للكروت الحديثة والقديمة.

[green]معيار ATX 3.1:[/green] يتحمّل ضعف قدرته لحظياً.

[green]كابلات منفصلة بالكامل.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* درجة B+ في تقييم SPL — وتنبّه القائمة إلى أنّ بعض الوحدات منذ 2026 تُشحن بمكثّفاتٍ أقلّ تحمّلاً للحرارة.
* طوله 160 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة ولا إضاءة — مزوّدٌ عمليّ.

${alt(w === '750' ? 'PP13M_850' : 'GF3_1000', w === '750' ? 'القدرة الأعلى من السلسلة نفسها (850 واط).' : '1000 واط بدرجة جودةٍ أعلى (A+) في تقييم SPL.')}
https://www.bequiet.com/en/powersupply/${page}`,
    })),
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
writeFileSync(`backups/added-batch6-${stamp}.json`, JSON.stringify({ PARTS, EXTRA, movedBefore }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch6-${stamp}.json`);

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
