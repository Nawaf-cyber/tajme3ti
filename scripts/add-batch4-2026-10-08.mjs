/**
 * ============ الدفعة الرابعة من «القطع الناقصة» — ٢٥ قطعة — 2026-10-08 ============
 *
 * طلب نوّاف: «كمل ضيف دفعة رابعة». القاعدة: متجران حيّان على الأقلّ، بلا تكرار.
 *
 * المصدر: بقيّة مسح كازاسوق في الدفعة الثالثة + قسم M.2 (`/m-2-4-627`، ٧٧ منتجاً)،
 * ثمّ أمازون (بحث المتصفّح) ومايكرولس (بفاصل ١٥ ث). كلّ صفحة متجرٍ قُرئت 2026-10-08،
 * والمواصفات من صفحة الصانع في آخر الوصف.
 *
 * لُبسٌ حُسم بالـEAN:
 *   · LANCOOL 207 في كازاسوق «207RX White» = EAN 4718466015846 = LAN207RW (الأبيض).
 *   · Kraken Elite 240 في كازاسوق EAN 5056547204116 = RL-KN24E-B2 (بلا RGB) = أمازون B0DCFMG8PB.
 *   · MP700 PRO 1TB في كازاسوق EAN 840006675129 = CSSD-F1000GBMP700PRO (بالمروحة) = أمازون
 *     «with Cooler»؛ ومايكرولس يبيع PNH (بلا مبرّد) فلم يُحتسب.
 *   · HydroShift II في كازاسوق «LCD-C 360CL» (EAN 4718466021380/97) — أمازون الأبيض LCD-S
 *     فلم يُطابَق؛ والأسود LCD-C في أمازون (B0FDW3PJDQ) طابق.
 * سرعة MP700 PRO 1TB (11,700/9,600) من قائمة EAN ومايكرولس؛ صفحة Corsair تعرض «حتى 12,400» للسلسلة.
 * ✕ لم يُضف رغم المتجرين:
 *   · DeepCool PF700X — درجة E في SPL («700W drops out»).
 *   · Lian Li SP850 V2 — سلفه SP850 درجة F (عيبٌ قاتل)، والإصدار الثاني بلا تقييمٍ بعد.
 *   · DeepCool PN1200M — كازاسوق أبيض ومايكرولس أسود.
 *
 *   node scripts/add-batch4-2026-10-08.mjs           # عرض
 *   node scripts/add-batch4-2026-10-08.mjs --apply   # تنفيذ
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
  LANCOOL_216: ['Lian Li LANCOOL 216', 'cmpfzir17000gx4ymtjjn4ag1'],
  AIR903_MAX_W: ['Montech AIR 903 MAX White', 'cmtcr2g9d000lo8ymvzkob7m7'],
  Y60: ['HYTE Y60', 'cmpiec10g002k00ym6tok8itf'],
  VISION_COMPACT: ['Lian Li O11 Vision Compact White', 'cmu6n396c0000w4ymd6gibkjc'],
  SKY_ONE_LITE: ['Montech Sky One Lite ARGB', 'cmtcr2hzk000uo8ymo39ajebz'],
  NORTH_MOMENTUM: ['Fractal Design North Momentum Edition (Black)', 'cmu6n39ep0002w4ymbxkk1sgu'],
  AP202: ['ASUS Prime AP202 ARGB', 'cmuzsa4a80020u8ym1u616z8n'],
  FORGE_M100A: ['MSI MAG Forge M100A', 'cmsq0k1kq000064ym7ldos7uf'],
  C1200: ['NZXT C1200 Gold ATX 3.1', 'cmuzsa3co001qu8ymzvekx5wu'],
  THOR_1200: ['ASUS ROG Thor 1200P2', 'cmpiecipz004g00ymnacid88v'],
  A750BN_III: ['MSI MAG A750BN PCIe 5 III', 'cmtjkye22000970ymdss7ay3h'],
  HX1500I: ['Corsair HX1500i', 'cmpiecicv004e00ymu52u0a1i'],
  KRAKEN_PLUS_360: ['NZXT Kraken Plus 360 RGB', 'cmti4ct64000aasym7ks1zjxo'],
  DVP_360_W: ['Thermalright Dynamic Vision PRO 360 ARGB White', 'cmu3md8pd0007f8ymswhsvfyf'],
  LE240_W: ['DeepCool LE240 V2 White', 'cmszmclka0006zsym0339h7e2'],
  KRAKEN_CORE_240: ['NZXT Kraken Core 240 RGB', 'cmszn26en000aw8ymba5g8iyy'],
  AG400_W: ['DeepCool AG400 G2 ARGB White', 'cmszmcl500002zsym6wx8hykr'],
  DELTA_DDR4_16: ['TeamGroup T-Force Delta RGB 16GB (2x8GB) DDR4 3600MHz', 'cmsq1r5cf0006toymvvnlag08'],
  SN850X_1TB: ['WD Black SN850X 1TB', 'cmpi5h9ch000404l1bar2y7zx'],
  P9100_2TB: ['Samsung 9100 PRO 2TB Gen5', 'cmr3fmva0000c04lhzn9faxeg'],
  P9100_1TB: ['Samsung 9100 PRO 1TB Gen5', 'cmsqbq6d40000pgymsq8ebx4x'],
};
const alt = (k, why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n* ${why}`;

const SOCKETS_ALL = 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X';

const PARTS = [
  // ================================================================ الصناديق
  {
    categoryId: CASE, brand: 'Lian Li', name: 'LANCOOL 217 INF', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '380', maxCoolerHeight: '180', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '2x 170mm + 1x 140mm', color: 'Black', features: ['واجهة «مرآة لا نهائيّة» مضيئة', 'يقبل لوحات Back-Connect'] },
    offers: [C('lian-li-lancool-217-inf-case-black-41837'), A('B0FMDKDKFS')],
    description: `### Lian Li LANCOOL 217 INF

كيس متوسّط بواجهة «مرآة لا نهائيّة» مضيئة، ومروحتين 170 مم في الأمام — تدفّقٌ كبير بضجيجٍ قليل.

**التقنيات الأساسية المدعومة:**

[green]مروحتان 170 مم في الواجهة ومروحة 140 مم في الخلف:[/green] المراوح الكبيرة تدفع هواءً أكثر بسرعةٍ أبطأ.

[green]يقبل لوحات Back-Connect:[/green] بموصلاتٍ خلف اللوحة (ATX وMicro-ATX)، ويقبل حتى E-ATX.

[green]رادييتر 360 مم في السقف:[/green] ومبرّد هواء حتى 180 مم، وكرت حتى 380 مم.

[green]موزّع مراوح وإضاءة مدمج:[/green] تُدار المراوح والإضاءة من رأسٍ واحد في اللوحة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الرادييتر في السقف فقط — الواجهة مخصّصة لمراوح 170 مم.
* المزوّد حتى 220 مم في الوضع العاديّ، و180 مم إن دُوِّر.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مراوح سفليّة مركّبة — مكانها موجود لمن أراد إضافتها.

${alt('LANCOOL_216', 'مراوح 160 مم في الواجهة ورادييتر 360 مم في الأمام بسعرٍ أقلّ عادةً.')}
https://lian-li.com/product/lancool-217-inf/`,
  },
  {
    categoryId: CASE, brand: 'Lian Li', name: 'LANCOOL 217 White', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '380', maxCoolerHeight: '180', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '2x 170mm + 2x 120mm + 1x 140mm', color: 'White', features: ['لمسات خشبيّة في الواجهة', 'يقبل لوحات Back-Connect'] },
    offers: [C('lian-li-lancool-217-case-white-41825'), M('lian-li-lancool-217-mid-tower-case-2x-170mm-2x-120mm-1x-140mm-pre-installed-fan-up-to-360mm-radiator-12x-fan-support-steel-4-0mm-tempered-glass-wood-white-lan217w')],
    description: `### Lian Li LANCOOL 217 White

كيس متوسّط أبيض بلمساتٍ خشبيّة، وخمس مراوح مركّبة منها اثنتان 170 مم في الواجهة.

**التقنيات الأساسية المدعومة:**

[green]خمس مراوح مركّبة:[/green] اثنتان 170 مم في الأمام، واثنتان 120 مم فوق غطاء المزوّد تدفعان الهواء إلى الكرت، وواحدة 140 مم في الخلف.

[green]يقبل لوحات Back-Connect:[/green] بموصلاتٍ خلف اللوحة (ATX وMicro-ATX)، ويقبل حتى E-ATX.

[green]رادييتر 360 مم في السقف:[/green] ومبرّد هواء حتى 180 مم، وكرت حتى 380 مم.

[green]موزّع مدمج لستّ مراوح وأربعة منافذ إضاءة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الرادييتر في السقف فقط — الواجهة مخصّصة لمراوح 170 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB في المراوح المرفقة — تصميمٌ هادئ المظهر.

${alt('LANCOOL_216', 'مراوح 160 مم في الواجهة ورادييتر 360 مم في الأمام بسعرٍ أقلّ عادةً.')}
https://lian-li.com/product/lancool-217/`,
  },
  {
    categoryId: CASE, brand: 'HYTE', name: 'X50 Air Snow White', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '430', maxCoolerHeight: '170', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: 'لا يوجد', color: 'White', features: ['جانبٌ شبكيّ كامل للتهوية'] },
    offers: [C('hyte-x50-air-atx-case-mesh-side-panel-snow-white-35019'), A('B0FQBXVFXR'), M('hyte-x50-air-modern-performance-atx-mid-tower-pc-gaming-case-full-coverage-micro-mesh-up-to-10-fans-x-120mm-1x-3-5-hdd-and-2x-2-5-ssd-snow-white-cs-hyte-x50a-ww')],
    description: `### HYTE X50 Air Snow White

كيس HYTE بزوايا منحنية وجانبٍ شبكيّ كامل — للتهوية القصوى مع شكلٍ مختلف عن الأكياس المعتادة.

**التقنيات الأساسية المدعومة:**

[green]كرت حتى 430 مم:[/green] يتّسع لأطول الكروت.

[green]رادييتر 360 مم في الواجهة أو الجانب:[/green] بسماكة حتى 105 مم في الأمام.

[green]عشر مراوح:[/green] ثلاث في الجانب، وثلاث في الأمام، وثلاث في الأسفل، وواحدة في الخلف.

[green]منفذ Type-C أماميّ بسرعة 20 جيجابت:[/green] وضمان أربع سنوات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هواء حتى 170 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مراوح في العلبة إطلاقاً — احسب ثمن ستّ مراوح على الأقلّ.

${alt('AIR903_MAX_W', 'كيس أبيض بأربع مراوح 140 مم مركّبة بسعرٍ أقلّ.')}
https://hyte.com/store/x50/cs-hyte-x50a-ww`,
  },
  {
    categoryId: CASE, brand: 'HYTE', name: 'X50 Snow White', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '430', maxCoolerHeight: '170', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: 'لا يوجد', color: 'White', features: ['جانب زجاجيّ منحنٍ'] },
    offers: [C('hyte-x50-atx-case-tempered-glass-side-panel-snow-white-35024'), A('B0FQBXPRL3')],
    description: `### HYTE X50 Snow White

كيس HYTE بزوايا منحنية وجانبٍ من الزجاج المصفّح — لعرض القطع بشكلٍ مختلف عن الأكياس المعتادة.

**التقنيات الأساسية المدعومة:**

[green]جانب زجاجيّ مصفّح بسماكة 4 مم:[/green] ينحني مع حوافّ الكيس.

[green]كرت حتى 430 مم:[/green] يتّسع لأطول الكروت.

[green]رادييتر 360 مم في الواجهة أو الجانب:[/green] بسماكة حتى 105 مم في الأمام.

[green]منفذ Type-C أماميّ بسرعة 20 جيجابت:[/green] وضمان أربع سنوات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الجانب الزجاجيّ يحجب مراوح الجانب — تهويةٌ أقلّ من نسخة Air.
* مبرّد هواء حتى 170 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مراوح في العلبة إطلاقاً — احسب ثمن المراوح.

${alt('Y60', 'كيس HYTE بانوراميّ بثلاث مراوح مركّبة وكابل تركيبٍ عموديّ للكرت.')}
https://hyte.com/store/x50/cs-hyte-x50g-ww`,
  },
  {
    categoryId: CASE, brand: 'Lian Li', name: 'LANCOOL 207 White', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '375', maxCoolerHeight: '180', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '2x 140mm ARGB + 2x 120mm', color: 'White' },
    offers: [C('lian-li-lancool-207rx-case-white-23550'), A('B0DJDM5W78'), M('lian-li-lancool-207-mid-tower-case-2x-140mm-2x-120mm-pre-installed-fan-up-to-360mm-radiator-8x-fan-support-steel-4mm-tempered-glass-support-white-g99-lan207rw-00')],
    description: `### Lian Li LANCOOL 207 White

كيس متوسّط أبيض بواجهةٍ شبكيّة وأربع مراوح مركّبة — من أفضل الأكياس قيمةً في فئته.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح مركّبة:[/green] اثنتان 140 مم ARGB في الواجهة، واثنتان 120 مم فوق غطاء المزوّد تدفعان الهواء إلى الكرت.

[green]واجهة شبكيّة:[/green] لتدفّقٍ أماميّ مباشر.

[green]رادييتر 360 مم في السقف:[/green] ومبرّد هواء حتى 180 مم، وكرت حتى 375 مم.

[green]منفذ Type-C أماميّ.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الرادييتر في السقف فقط.
* المزوّد في الأمام تحت الغطاء: طوله يجب ألّا يتجاوز 160 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات E-ATX (أقصى عرض 244 مم).

${alt('AIR903_MAX_W', 'كيس أبيض بأربع مراوح 140 مم ورادييتر 360 مم في الواجهة.')}
https://lian-li.com/product/lancool-207/`,
  },
  {
    categoryId: CASE, brand: 'MSI', name: 'MAG PANO 130R PZ White', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '400', maxCoolerHeight: '165', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '4x 120mm ARGB', color: 'White', features: ['واجهة وجانب زجاجيّان بلا عمود', 'يقبل لوحات Back-Connect'] },
    offers: [C('msi-mag-pano-130r-pz-mid-tower-back-connect-atx-matx-usb-type-c-20gbps-gaming-case-white-41621'), A('B096Y5LXC6')],
    description: `### MSI MAG PANO 130R PZ White

كيس بانوراميّ أبيض بزجاجٍ في الواجهة والجانب، وأربع مراوح ARGB، ويقبل لوحات الموصلات الخلفيّة.

**التقنيات الأساسية المدعومة:**

[green]زجاج بانوراميّ:[/green] الواجهة والجانب بلا عمودٍ في الزاوية.

[green]أربع مراوح 120 مم ARGB:[/green] ثلاثٌ بشفراتٍ معكوسة في الجانب، وواحدة في الخلف.

[green]يقبل لوحات Back-Connect:[/green] (ATX وMicro-ATX) ولوحاتٍ عاديّة.

[green]رادييتر 360 مم في السقف أو الجانب:[/green] ومنفذ Type-C أماميّ بسرعة 20 جيجابت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هواء حتى 165 مم.
* المزوّد حتى 180 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تهوية أماميّة — الواجهة زجاج، والهواء يدخل من الجانب والأسفل.

${alt('VISION_COMPACT', 'كيس بانوراميّ أبيض آخر بحجرتين منفصلتين.')}
https://www.msi.com/PC-Case/MAG-PANO-130R-PZ/Specification`,
  },
  {
    categoryId: CASE, brand: 'MSI', name: 'MAG Forge 112R', tdpWattage: 0, performanceTier: 2,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '330', maxCoolerHeight: '160', radiatorSupport: '240mm', psuFormFactor: 'ATX', includedFans: '4x 120mm ARGB', color: 'Black' },
    offers: [C('msi-mag-forge-112-r-micro-atx-tower-black-gaming-case-41639'), A('B09RGHK5CY')],
    description: `### MSI MAG Forge 112R

كيس اقتصاديّ متوسّط بأربع مراوح ARGB مركّبة وجانبٍ زجاجيّ — لجهازٍ أوّل بميزانيّةٍ محدودة.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح 120 مم ARGB:[/green] ثلاثٌ في الواجهة وواحدة في الخلف.

[green]يقبل لوحات ATX:[/green] وMicro-ATX وMini-ITX.

[green]رادييتر 240 مم في الأمام أو السقف.[/green]

[green]جانب زجاجيّ:[/green] بسعرٍ اقتصاديّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* كرت حتى 330 مم فقط — كثيرٌ من كروت RTX 5070 Ti وما فوقها أطول.
* مبرّد هواء حتى 160 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رادييتر 360 مم، ولا منفذ Type-C أماميّ.

${alt('SKY_ONE_LITE', 'كيس اقتصاديّ يقبل رادييتر 360 مم وكروتاً حتى 350 مم.')}
https://www.msi.com/PC-Case/MAG-FORGE-112R/Specification`,
  },
  {
    categoryId: CASE, brand: 'Lian Li', name: 'B4-mATX Wood Black', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Micro-ATX Tower', maxGpuLength: '358', maxCoolerHeight: '159', radiatorSupport: '240mm', psuFormFactor: 'ATX / SFX', includedFans: '2x 120mm (slim)', color: 'Black', features: ['واجهة من خشبٍ حقيقيّ', 'حجم 21.3 لتر'] },
    offers: [C('lian-li-b4-matx-wood-case-black-49655'), A('B0GX5D2FHW')],
    description: `### Lian Li B4-mATX Wood Black

كيس صغير جداً (21 لتراً) بواجهةٍ من خشبٍ حقيقيّ — لجهازٍ قويّ يأخذ مساحة جهازٍ مكتبيّ صغير.

**التقنيات الأساسية المدعومة:**

[green]حجم 21.3 لتر:[/green] يقبل لوحات Micro-ATX وMini-ITX.

[green]كرت حتى 358 مم:[/green] رغم صغر الكيس.

[green]مزوّد ATX أو SFX:[/green] مع SFX يتّسع الجانب لرادييتر 360 مم.

[green]مروحتان رفيعتان مركّبتان في السقف.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مع مزوّد ATX: الرادييتر حتى 240 مم والمزوّد حتى 140 مم طولاً.
* مبرّد هواء حتى 159 مم، ومكانان فقط للأقراص التقليديّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات ATX ولا لوحات Back-Connect.

${alt('NORTH_MOMENTUM', 'واجهة خشبيّة أيضاً في كيسٍ متوسّط يقبل لوحات ATX.')}
https://lian-li.com/product/b4-matx/`,
  },
  {
    categoryId: CASE, brand: 'Lian Li', name: 'Vector V150 INF', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Micro-ATX Tower', maxGpuLength: '400', maxCoolerHeight: '163', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '2x 140mm + 1x 120mm ARGB', color: 'Black', features: ['واجهة «مرآة لا نهائيّة» مضيئة', 'يقبل لوحات Back-Connect'] },
    offers: [C('lian-li-vector-v150-inf-case-black-49700'), A('B0GGZ3PMMY')],
    description: `### Lian Li Vector V150 INF

كيس Micro-ATX بواجهة «مرآة لا نهائيّة» وثلاث مراوح ARGB — يتّسع لكرتٍ حتى 400 مم.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح ARGB مركّبة:[/green] اثنتان 140 مم في الواجهة وواحدة 120 مم في الخلف.

[green]كرت حتى 400 مم:[/green] ورادييتر 360 مم في السقف.

[green]يقبل لوحات Back-Connect Micro-ATX.[/green]

[green]لوحة تحكّمٍ لاسلكيّة مدمجة:[/green] تعمل مع برنامج L-Connect 3.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هواء حتى 163 مم.
* جهاز التحكّم اللاسلكيّ (L-Wireless Controller) يُباع منفصلاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات ATX — Micro-ATX وMini-ITX فقط.

${alt('AP202', 'كيس Micro-ATX بزجاجٍ منحنٍ وثلاث مراوح ARGB.')}
https://lian-li.com/product/vector-v150inf/`,
  },
  {
    categoryId: CASE, brand: 'ASUS', name: 'Prime AP201 TG', tdpWattage: 0, performanceTier: 2,
    specs: { formFactor: 'Micro-ATX Tower', maxGpuLength: '338', maxCoolerHeight: '170', radiatorSupport: '360mm', psuFormFactor: 'ATX', includedFans: '1x 120mm', color: 'Black' },
    offers: [C('asus-prime-ap201-tempered-glass-black-46953'), A('B0BVKZ6P9C')],
    description: `### ASUS Prime AP201 TG

كيس Micro-ATX بسيط بحجم 33 لتراً وجانبٍ زجاجيّ، وجوانب أخرى مثقّبة للتهوية — يقبل رادييتر 360 مم رغم صغره.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 360 مم في السقف:[/green] ومبرّد هواء حتى 170 مم.

[green]ألواح بلا أدوات:[/green] تُفتح وتُركّب باليد.

[green]منفذ Type-C أماميّ بسرعة 10 جيجابت.[/green]

[green]أربعة أماكن للأقراص:[/green] ثلاثة 2.5/3.5 بوصة وواحد 2.5 بوصة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* كرت حتى 338 مم — بعض الكروت الكبيرة لا تدخل.
* مروحة واحدة مرفقة فقط (في الخلف).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات ATX — Micro-ATX وMini-ITX فقط.

${alt('FORGE_M100A', 'كيس Micro-ATX بأربع مراوح ARGB مركّبة.')}
https://www.asus.com/motherboards-components/cases/prime/asus-prime-ap201-tempered-glass-microatx-case/techspec/`,
  },

  // ================================================================ المزوّدات
  {
    categoryId: PSU, brand: 'Lian Li', name: 'EDGE Gold 1200W White', tdpWattage: 0, performanceTier: 5,
    specs: { wattage: '1200', rating: '80+ Gold', modularity: 'Full', formFactor: 'ATX 3.1', color: 'White', qualityTier: 'A' },
    offers: [C('lian-li-edge-1200w-80plus-gold-usb-white'), A('B0DX38B41Q')],
    description: `### Lian Li EDGE Gold 1200W White

النسخة البيضاء بقدرة 1200 واط من مزوّد Lian Li ذي الشكل L: موصلاته على الجانب، ومعه موزّع USB ومراوح.

**التقنيات الأساسية المدعومة:**

[green]موصلات جانبيّة:[/green] الكابلات تخرج من جانب المزوّد فتختفي خلف اللوحة.

[green]موزّع EDGE Hub مرفق:[/green] ستّة رؤوس مراوح ومنافذ USB داخليّة.

[green]درجة A في تقييم SPL:[/green] وكفاءة Cybenetics Gold.

[green]معيار ATX 3.1 وكابل 12V-2x6 (600 واط).[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* طوله 182 مم وشكله غير معتاد — مصمّمٌ لأكياسٍ بعينها، فتأكّد من التوافق.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب الأكياس الصغيرة أو ذات غطاء المزوّد الضيّق.

${alt('C1200', '1200 واط بدرجة A+ وتصميمٍ عاديّ يركب في أيّ كيس.')}
https://lian-li.com/product/edge-gold/`,
  },
  {
    categoryId: PSU, brand: 'MSI', name: 'MEG Ai1300P PCIe 5', tdpWattage: 0, performanceTier: 5,
    specs: { wattage: '1300', rating: '80+ Platinum', modularity: 'Full', formFactor: 'ATX 3.1', color: 'Black', qualityTier: 'A+' },
    offers: [C('msi-meg-ai1300p-pcie-5-80-1300w-platinum-modular-psu-41603'), A('B0B433ZCRP')],
    description: `### MSI MEG Ai1300P PCIe 5

مزوّد MSI الرائد بقدرة 1300 واط وكفاءة Platinum، ودرجة A+ في تقييم SPL — لأثقل الأجهزة.

**التقنيات الأساسية المدعومة:**

[green]درجة A+ في تقييم SPL:[/green] من أعلى درجات الجودة.

[green]كابل 16 سنّاً (600 واط) وثمانية كابلات 6+2:[/green] لكرتٍ حديث وآخر قديم معاً إن احتجت.

[green]80+ Platinum:[/green] بكفاءة تصل إلى 92%.

[green]ضمان عشر سنوات:[/green] ويتحمّل قفزات الاستهلاك حتى 200% من قدرته لحظياً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مروحة 120 مم — أعلى صوتاً تحت الحمل الثقيل من مزوّدات 135 مم.
* طوله 160 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* 1300 واط فوق حاجة معظم الأجهزة — لا تشتريه لجهازٍ بكرتٍ متوسّط.

${alt('THOR_1200', '1200 واط Platinum بشاشة OLED وإضاءة.')}
https://www.msi.com/Power-Supply/MEG-Ai1300P-PCIE5/Specification`,
  },
  {
    categoryId: PSU, brand: 'DeepCool', name: 'PL750D', tdpWattage: 0, performanceTier: 2,
    specs: { wattage: '750', rating: '80+ Bronze', modularity: 'Non-Modular', formFactor: 'ATX 3.0', color: 'Black', qualityTier: 'C' },
    offers: [C('deepcool-pl750d-750w-bronze-atx3-0-pcie-5-0-psu-21325'), M('deepcool-pl750d-80-plus-bronze-non-modular-power-supply-750w-power-atx12v-v3-0-hydro-bearing-120mm-fan-chinese-electrolytic-capacitors-active-pfc-dc-to-dc-black-r-pl750d-fc0b-uk')],
    description: `### DeepCool PL750D

مزوّد اقتصاديّ بقدرة 750 واط بمعيار ATX 3.0 وكابل 16 سنّاً — من أرخص طرق تشغيل كرتٍ حديث.

**التقنيات الأساسية المدعومة:**

[green]كابل 12VHPWR (16 سنّاً):[/green] وثلاثة كابلات 6+2.

[green]معيار ATX 3.0:[/green] يتحمّل ضعف قدرته لجزءٍ من الثانية.

[green]سعرٌ منخفض:[/green] لجهازٍ اقتصاديّ بكرتٍ متوسّط.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* درجة C في تقييم SPL: مكوّنات متواضعة وحماياتٌ مضبوطة على حدودٍ عالية.
* كابلات ثابتة (Non-Modular) — كلّها تبقى في الكيس.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يُنصح به لكروت الفئة العليا أو المعالجات الثقيلة.

${alt('A750BN_III', 'مزوّد 750 واط اقتصاديّ بدرجة أعلى (B-) في تقييم SPL.')}
https://www.deepcool.com/products/PowerSupplyUnits/powersupplyunits/PL750D-ATX3.0-Direct-Power-Supply/2023/17602.shtml`,
  },
  {
    categoryId: PSU, brand: 'DeepCool', name: 'PX1300P', tdpWattage: 0, performanceTier: 5,
    specs: { wattage: '1300', rating: '80+ Platinum', modularity: 'Full', formFactor: 'ATX 3.0', color: 'Black', qualityTier: 'A+' },
    offers: [C('deepcool-px1300p-1300w-80-plus-platinum-modular-psu-26767'), M('deepcool-px1300p-fully-modular-atx-power-supply-1300w-power-80-platinum-efficiency-full-japan-electrolytic-capacitors-120mm-fan-fluid-dynamic-bearing-dedicated-12vhpwr-black-r-pxd00p-fc0b-uk')],
    description: `### DeepCool PX1300P

مزوّد 1300 واط بكفاءة Platinum ودرجة A+ في تقييم SPL — من أقوى مزوّدات DeepCool.

**التقنيات الأساسية المدعومة:**

[green]درجة A+ في تقييم SPL:[/green] أداءٌ كهربائيّ ممتاز.

[green]كابل 12VHPWR (600 واط):[/green] ومحوّلٌ إضافيّ من 8 سنون.

[green]مكثّفات يابانيّة بالكامل:[/green] وكابلات منفصلة بالكامل.

[green]80+ Platinum ومعيار ATX 3.0.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* طوله 160 مم، ومروحته 120 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* 1300 واط فوق حاجة معظم الأجهزة.

${alt('HX1500I', '1500 واط Platinum بدرجة A+ ومراقبة رقميّة.')}
https://www.deepcool.com/products/PowerSupplyUnits/powersupplyunits/PX1300P-ATX-3.0-Platinum-Power-Supply/2023/17420.shtml`,
  },

  // ================================================================ المبرّدات
  {
    categoryId: COOL, brand: 'Lian Li', name: 'HydroShift II LCD-C 360CL', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'Black', features: ['شاشة IPS مقاس 2.1 بوصة بدقّة 480×480'] },
    offers: [C('lian-li-hydroshift-ii-lcdc-360cl-black'), A('B0FDW3PJDQ')],
    description: `### Lian Li HydroShift II LCD-C 360CL

مبرّد مائيّ 360 مم بشاشةٍ دائريّة ومراوح UNI FAN CL اللاسلكيّة الإضاءة — أسلاكٌ أقلّ وإضاءةٌ متزامنة.

**التقنيات الأساسية المدعومة:**

[green]شاشة IPS دائريّة مقاس 2.1 بوصة:[/green] بدقّة 480×480 وسطوع 500 شمعة.

[green]ثلاث مراوح UNI FAN CL:[/green] حتى 2600 دورة، وتتوقّف عند الحمل الخفيف.

[green]رادييتر رفيع (24 مم):[/green] أسهل تركيباً في السقف فوق الذاكرة.

[green]ضمان ستّ سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الإضاءة لا تتزامن مع برنامج اللوحة — عبر برنامج Lian Li فقط.
* المضخّة 28 ديسيبل — أعلى قليلاً من المضخّات الهادئة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* المقابس المدعومة: AM5 وAM4 وLGA1851 وLGA1700.

${alt('KRAKEN_PLUS_360', 'مبرّد 360 مم بشاشة LCD وإضاءة RGB من NZXT.')}
https://lian-li.com/product/hydroshift-ii/`,
  },
  {
    categoryId: COOL, brand: 'ASUS', name: 'ROG Ryujin III 360 ARGB Extreme White', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'AIO', sizeMm: '360', sockets: SOCKETS_ALL, fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'White', features: ['شاشة LCD مقاس 3.5 بوصة', 'مروحة مدمجة في الرأس تبرّد مراحل الطاقة'] },
    offers: [C('asus-rog-ryujin-iii-360-argb-extreme-white-aio-liquid-cooler'), A('B0DQPZTX97')],
    description: `### ASUS ROG Ryujin III 360 ARGB Extreme White

مبرّد ROG الرائد بالأبيض: مضخّة Asetek Gen8 V2، وشاشة 3.5 بوصة، ومروحةٌ في الرأس تبرّد مراحل طاقة اللوحة.

**التقنيات الأساسية المدعومة:**

[green]مضخّة Asetek Gen8 V2 بمحرّكٍ ثلاثيّ الأطوار:[/green] تدفّقٌ أعلى ومقاومةٌ أقلّ.

[green]شاشة LCD مقاس 3.5 بوصة:[/green] تعرض الحرارة أو الصور.

[green]مروحة مدمجة في الرأس:[/green] تخفض حرارة مراحل طاقة اللوحة حتى 36 درجة بحسب ASUS.

[green]ثلاث مراوح مغناطيسيّة 120 مم (30 مم سماكة):[/green] حتى 2800 دورة و89.7 CFM، وتتّصل ببعضها دون كابلات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* رادييتر بسماكة 30 مم — تأكّد من المساحة فوق الذاكرة إن رُكّب في السقف.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعره من الأعلى في الفئة — للشاشة والتصميم أكثر من الحرارة.

${alt('DVP_360_W', 'مبرّد 360 مم أبيض بشاشة بسعرٍ أقلّ بكثير عادةً.')}
https://rog.asus.com/cooling/cpu-liquid-coolers/rog-ryujin/rog-ryujin-iii-360-argb-extreme-white-edition/`,
  },
  {
    categoryId: COOL, brand: 'MSI', name: 'MAG CoreLiquid E240 White', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'AIO', sizeMm: '240', sockets: SOCKETS_ALL, fanCount: '2', fanSize: '120mm', rgb: 'Yes', color: 'White' },
    offers: [C('msi-mag-coreliquid-e240-cpu-liquid-cooler-white-21853'), A('B0CC5FT1LH')],
    description: `### MSI MAG CoreLiquid E240 White

النسخة البيضاء من مبرّد MSI المائيّ 240 مم: مروحتان ARGB ورأسٌ يدور ليستقيم شعاره.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 240 مم بمروحتين 120 مم:[/green] لمعالجات Core i5 وRyzen 5 و7.

[green]مراوح FDB حتى 75 CFM:[/green] بعمرٍ مقدّر 50 ألف ساعة.

[green]مضخّة 3000 دورة بضوضاء 20 ديسيبل:[/green] وقاعدة نحاسيّة.

[green]أبيض بالكامل:[/green] الرادييتر والأنابيب والمراوح.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 240 مم لا تكفي معالجات i9 وRyzen 9 تحت الحمل الطويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة في الرأس.

${alt('LE240_W', 'مبرّد 240 مم أبيض آخر بسعرٍ أقلّ عادةً.')}
https://www.msi.com/Liquid-Cooling/MAG-CORELIQUID-E240/Specification`,
  },
  {
    categoryId: COOL, brand: 'NZXT', name: 'Kraken Elite 360 RGB', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'AIO', sizeMm: '360', sockets: SOCKETS_ALL, fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'Black', features: ['شاشة IPS مقاس 2.72 بوصة بدقّة 640×640'] },
    offers: [C('nzxt-kraken-elite-360mm-rgb-bl-cooler-controller-2024-24469'), A('B0D9GV78D8')],
    description: `### NZXT Kraken Elite 360 RGB

إصدار 2024 من مبرّد NZXT الأعلى: مضخّة Turbine، وشاشة 2.72 بوصة، ومروحة F360 RGB Core بكابلٍ واحد.

**التقنيات الأساسية المدعومة:**

[green]شاشة IPS مقاس 2.72 بوصة:[/green] بدقّة 640×640 وسطوع 690 شمعة — تعرض الحرارة أو صوراً متحرّكة.

[green]مضخّة NZXT Turbine:[/green] حتى 2800 دورة فوق قاعدةٍ نحاسيّة.

[green]مروحة F360 RGB Core:[/green] ثلاث مراوح 120 مم في إطارٍ واحد بكابلٍ واحد للسرعة والإضاءة.

[green]ضمان ستّ سنوات:[/green] ويدعم كلّ المقابس الحاليّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الشاشة والإضاءة تحتاجان برنامج NZXT CAM.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعره للشاشة — مبرّداتٌ بالحجم نفسه دونها تبرّد مثله بسعرٍ أقلّ.

${alt('KRAKEN_PLUS_360', 'مبرّد NZXT بشاشةٍ أصغر بسعرٍ أقلّ عادةً.')}
https://nzxt.com/products/kraken-360-elite-rgb-1`,
  },
  {
    categoryId: COOL, brand: 'NZXT', name: 'Kraken Elite 360 RGB White', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'AIO', sizeMm: '360', sockets: SOCKETS_ALL, fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'White', features: ['شاشة IPS مقاس 2.72 بوصة بدقّة 640×640'] },
    offers: [C('nzxt-kraken-elite-360mm-lcd-rgb-cooler-ips-single-frame-with-controller-white-26647'), A('B0D9GWQPDM')],
    description: `### NZXT Kraken Elite 360 RGB White

النسخة البيضاء من إصدار 2024 لمبرّد NZXT الأعلى: مضخّة Turbine، وشاشة 2.72 بوصة، ومروحة F360 RGB Core.

**التقنيات الأساسية المدعومة:**

[green]شاشة IPS مقاس 2.72 بوصة:[/green] بدقّة 640×640 وسطوع 690 شمعة.

[green]مضخّة NZXT Turbine:[/green] حتى 2800 دورة فوق قاعدةٍ نحاسيّة.

[green]مروحة F360 RGB Core:[/green] ثلاث مراوح في إطارٍ واحد بكابلٍ واحد.

[green]أبيض بالكامل:[/green] وضمان ستّ سنوات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الشاشة والإضاءة تحتاجان برنامج NZXT CAM.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعره للشاشة والمظهر أكثر من الحرارة.

${alt('DVP_360_W', 'مبرّد 360 مم أبيض بشاشة بسعرٍ أقلّ بكثير عادةً.')}
https://nzxt.com/products/kraken-360-elite-rgb-1`,
  },
  {
    categoryId: COOL, brand: 'NZXT', name: 'Kraken Elite 240', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '240', sockets: SOCKETS_ALL, fanCount: '2', fanSize: '120mm', rgb: 'No', color: 'Black', features: ['شاشة IPS مقاس 2.72 بوصة بدقّة 640×640'] },
    offers: [C('nzxt-kraken-elite-240mm-black-liquid-cooler-2024-24487'), A('B0DCFMG8PB')],
    description: `### NZXT Kraken Elite 240

إصدار 2024 من Kraken Elite بحجم 240 مم: الشاشة الكبيرة نفسها، بمراوح F120P عالية الضغط بلا إضاءة.

**التقنيات الأساسية المدعومة:**

[green]شاشة IPS مقاس 2.72 بوصة:[/green] بدقّة 640×640 وسطوع 690 شمعة.

[green]مروحتا F120P للضغط العالي:[/green] حتى 2000 دورة و73 CFM.

[green]مضخّة NZXT Turbine:[/green] فوق قاعدةٍ نحاسيّة، وضمان ستّ سنوات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 240 مم لا تكفي معالجات i9 وRyzen 9 تحت الحمل الطويل.
* رأس المضخّة يتّصل بموصل 3 سنون — تأكّد من رأس المضخّة في لوحتك.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB في المراوح.

${alt('KRAKEN_CORE_240', 'مبرّد NZXT بحجم 240 مم بإضاءة RGB وسعرٍ أقلّ بكثير.')}
https://nzxt.com/products/kraken-240-elite`,
  },
  {
    categoryId: COOL, brand: 'DeepCool', name: 'AK400 Digital White', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'Air', sizeMm: '156', sockets: SOCKETS_ALL, fanCount: '1', fanSize: '120mm', rgb: 'Yes', color: 'White', features: ['شاشة رقميّة تعرض حرارة المعالج واستهلاكه'] },
    offers: [C('deepcool-ak400-digital-120mm-cooler-white-aa15537'), M('deepcool-ak400-digital-wh-single-tower-cpu-air-cooler-120mm-fdb-pwm-fan-1850-rpm-speed-68-99-cfm-airflow-digital-statues-display-4-heatpipes-tdp-220w-argb-led-strips-white-r-ak400-whadmn-g')],
    description: `### DeepCool AK400 Digital White

مبرّد هوائيّ أبيض ببرجٍ واحد وشاشةٍ رقميّة على سطحه تعرض حرارة المعالج واستهلاكه لحظةً بلحظة.

**التقنيات الأساسية المدعومة:**

[green]شاشة رقميّة:[/green] حرارة المعالج ونسبة استهلاكه، مع تنبيهٍ عند الحرارة العالية.

[green]أربعة أنابيب حراريّة 6 مم بتلامسٍ مباشر:[/green] ومروحة FK120 بمحمل FDB حتى 1850 دورة.

[green]ارتفاع 156 مم:[/green] يدخل معظم الأكياس المتوسّطة.

[green]إضاءة ARGB:[/green] على الحوافّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* برجٌ واحد بمروحةٍ واحدة — لمعالجات Core i5 وRyzen 5 و7، لا لمعالجات i9 وRyzen 9.
* الشاشة تحتاج رأس USB 2.0 داخليّاً وبرنامج DeepCool.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب كسر السرعة الثقيل.

${alt('AG400_W', 'مبرّد برجٍ واحد أبيض بسعرٍ أقلّ، دون الشاشة.')}
https://www.deepcool.com/products/Cooling/cpuaircoolers/AK400-Digital-WH-CPU-Cooler-With-A-Status-Display-1851-1700-AM5/2024/17273.shtml`,
  },

  // ================================================================ الرام
  {
    categoryId: RAM, brand: 'XPG', name: 'Spectrix D35G 16GB (2x8GB) DDR4 3200MHz', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'DDR4', capacity: '16GB', kit: '2x8GB', speed: '3200', casLatency: 'CL16', profile: 'XMP 2.0', rgb: 'Yes', heightMm: '36', color: 'Black' },
    offers: [C('xpg-spectrix-d35-ddr4-16gb-3200mhz-2x8gb-black-aa18109'), A('B0CB1SDD6W')],
    description: `### XPG Spectrix D35G 16GB (2x8GB) DDR4 3200MHz

طقم DDR4 بسعةٍ 16 جيجابايت وإضاءة RGB ومشتّتٍ منخفض — لترقية جهازٍ قديم أو جهازٍ اقتصاديّ على لوحة DDR4.

**التقنيات الأساسية المدعومة:**

[green]3200 MT/s بتوقيت CL16:[/green] بملفّ XMP 2.0 يُفعّل من البيوس.

[green]ارتفاع 36 مم:[/green] لا يتعارض مع المبرّدات الهوائيّة الكبيرة.

[green]إضاءة RGB:[/green] تتزامن مع برامج اللوحات الكبرى.

[green]ضمانٌ مدى الحياة (محدود).[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 16 جيجابايت حدٌّ أدنى للألعاب اليوم — بعض الألعاب الحديثة تستفيد من 32.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* DDR4 — لا يعمل على لوحات DDR5 (AM5 وLGA1851 وأغلب لوحات LGA1700 الحديثة).

${alt('DELTA_DDR4_16', 'طقم DDR4 بسرعة 3600 وإضاءة RGB أعرض.')}
https://www.xpg.com/us/xpg/dram-modules-spectrix-d35g-rgb-ddr4`,
  },

  // ================================================================ التخزين
  {
    categoryId: STO, brand: 'MSI', name: 'Spatium M480 Pro 1TB', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7400 MB/s', writeSpeed: '6000 MB/s', dramCache: 'Yes', tbw: '700 TB' },
    offers: [C('msi-spatium-m480-pro-pcie-gen-4-m2-nvme-1tb-40997'), A('B0C5Y4DFL9')],
    description: `### MSI Spatium M480 Pro 1TB

قرص NVMe من الجيل الرابع بأقصى سرعاته، بمتحكّم Phison E18 وذاكرة DRAM مخبّئة.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7400 MB/s:[/green] في سقف الجيل الرابع.

[green]ذاكرة DRAM بسعة 1 جيجابايت:[/green] أداءٌ ثابت في النسخ الطويل والأقراص الممتلئة.

[green]متحكّم Phison E18:[/green] منصّةٌ مجرّبة في أقراصٍ كثيرة عالية الأداء.

[green]ضمان خمس سنوات أو 700 تيرابايت كتابة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الكتابة 6000 MB/s في نسخة 1TB — أقلّ من النسخ الأكبر (7000).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مشتّت حرارة مرفق — يعتمد على مشتّت اللوحة.

${alt('SN850X_1TB', 'قرص جيلٍ رابع بالسرعة نفسها تقريباً وسعرٍ أقلّ عادةً.')}
https://us.msi.com/Storage/SPATIUM-M480-PRO-PCIe-4.0-NVMe-M.2/Specification`,
  },
  {
    categoryId: STO, brand: 'Samsung', name: '9100 PRO 2TB Heatsink', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'NVMe M.2', capacity: '2TB', interface: 'PCIe 5.0 x4', formFactor: 'M.2 2280', readSpeed: '14800 MB/s', writeSpeed: '13400 MB/s', dramCache: 'Yes', tbw: '1200 TB' },
    offers: [C('samsung-9100-pro-m2-2tb'), A('B0DWT6JGQH')],
    description: `### Samsung 9100 PRO 2TB Heatsink

أسرع أقراص Samsung من الجيل الخامس بمشتّت حرارةٍ مرفق — يناسب أيضاً جهاز PS5.

**التقنيات الأساسية المدعومة:**

[green]قراءة 14,800 MB/s وكتابة 13,400 MB/s:[/green] من أعلى سرعات الجيل الخامس.

[green]مشتّت حرارة مرفق:[/green] بارتفاع 8.88 مم يدخل اللوحات وجهاز PS5.

[green]ذاكرة LPDDR4X بسعة 2 جيجابايت ومتحكّم Samsung:[/green] أداءٌ ثابت تحت الضغط.

[green]ضمان خمس سنوات أو 1200 تيرابايت كتابة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سرعته الكاملة تحتاج منفذ M.2 من الجيل الخامس — في الجيل الرابع يعمل بنصفها تقريباً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا فرق ملموس في زمن تحميل الألعاب عن أقراص الجيل الرابع.

${alt('P9100_2TB', 'القرص نفسه بلا مشتّت — أرخص إن كان في لوحتك مشتّتٌ للمنفذ.')}
https://www.samsung.com/us/memory-storage/nvme-ssd/9100-pro-w-heatsink-nvme-ssd-sku-mz-vap2t0cw/`,
  },
  {
    categoryId: STO, brand: 'Corsair', name: 'MP700 PRO 1TB Air Cooler', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 5.0 x4', formFactor: 'M.2 2280', readSpeed: '11700 MB/s', writeSpeed: '9600 MB/s', dramCache: 'Yes', tbw: '700 TB' },
    offers: [C('corsair-force-series-mp700-pro-nvme-m-2-gen5-1tb-19673'), A('B0CM42DQTH')],
    description: `### Corsair MP700 PRO 1TB Air Cooler

قرص جيلٍ خامس بمتحكّم Phison E26 ومبرّدٍ هوائيّ بمروحةٍ صغيرة مرفق — يبقى بارداً تحت الضغط الطويل.

**التقنيات الأساسية المدعومة:**

[green]قراءة 11,700 MB/s وكتابة 9,600 MB/s:[/green] بالجيل الخامس.

[green]مبرّد بمروحة مرفق:[/green] Corsair تذكر أنّه أبرد حتى 20 درجة من مشتّت اللوحة.

[green]ذاكرة DRAM ومتحكّم Phison E26:[/green] وضمان خمس سنوات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المبرّد أطول من المشتّتات العاديّة — تأكّد من المساحة فوق المنفذ وتحت الكرت.
* المروحة تحتاج كابل تغذية وقد تُسمع.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سرعته الكاملة تحتاج منفذاً من الجيل الخامس.

${alt('P9100_1TB', 'قرص جيلٍ خامس أسرع بلا مروحة.')}
https://www.corsair.com/us/en/p/data-storage/cssd-f1000gbmp700pro/mp700-pro-1tb-with-air-cooler-pcie-gen5-x4-nvme-2-0-m-2-ssd-cssd-f1000gbmp700pro`,
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
writeFileSync(`backups/added-batch4-${stamp}.json`, JSON.stringify(PARTS, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch4-${stamp}.json`);

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
