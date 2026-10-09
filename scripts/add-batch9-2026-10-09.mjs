/**
 * ============ الدفعة التاسعة — سدّ نقص الفئات — ٤٧ قطعة — 2026-10-09 ============
 *
 * طلب نوّاف: «اجمع منتجات ثانية بناءً على نقص الفئة في جدول» ثم «ضيفها كلها مع عروض المتاجر الإضافية».
 *
 * النقص المقيس (متوفّرةٌ في متجرين+ من المجموع): الرام 14/42، المزوّدات 27/55، لوحات B550/A620/B840
 * قليلة، والأقراص دون 1TB أربعة فقط. فمُسحت أقسام مايكرولس لهذه الفئات بالمتصفّح، وطُرح ما عندنا،
 * وبُحث عن كلّ مرشّحٍ في أمازون برمز طرازه وقُرئت صفحته (الرمز، التوفّر، البائع، اللون).
 * عروضٌ إضافية: كازاسوق (Samsung 990، TUF 1000G White، A1250GL نافد) وجرير (SN850P 1TB، 11 قطعة)
 * وريد زون (TUF 750W Gold بالرمز 90YE00S3، NV3 500GB بالباركود). تصنيف SPL للمزوّدات قُرئ 2026-10-09.
 *
 * ✕ لم يُضف: AM4 (5600X/5700X/5700X3D…) ولوحات B550 — في أمازون وحده؛ V750 SFX (أسود/أبيض)،
 *   Toughpower GT 750 (قابس EU/UK)، RM750x Shift (CP-9020273≠9020251)، BX3 Pro، B840M Gaming (اللون).
 *
 *   node scripts/add-batch9-2026-10-09.mjs           # عرض
 *   node scripts/add-batch9-2026-10-09.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const MB = 'cmpfziqe70001x4ym928tt3o2';
const PSU = 'cmpfziqh70002x4ym6ln587z2';
const RAM = 'cmpfziqks0003x4yma730h1be';
const STO = 'cmpfziqr70005x4ym3k7uh079';

const C = (slug) => ({ store: 'cazasouq', url: `https://www.cazasouq.com/${slug}` });
const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });
const M = (slug) => ({ store: 'microless', url: `https://saudi.microless.com/product/${slug}/` });
const J = (path) => ({ store: 'jarir', url: `https://www.jarir.com/sa-en/${path}` });
const RZ = (slug) => ({ store: 'redzone', url: encodeURI(`https://redzzone.com/products/${slug}`) });

const ALT = {
  FLAREX5: ['G.Skill Flare X5 DDR5 32GB 6000MHz', 'cmpiecrkg005h00ymkt3mt6pp'],
  VEN16: ['Corsair Vengeance 16GB (2x8GB) 5200MHz', 'cmpiedh03006b00ym57kak80u'],
  BEAST64: ['Kingston Fury Beast 64GB (2x32GB) DDR5 6000MHz CL30', 'cmtjkyciz000670ymzgbqg9si'],
  TZ5RW: ['G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz CL36 White', 'cmv14qab2001650ymhbrajthf'],
  LPX32: ['Corsair Vengeance LPX 32GB (2x16GB) DDR4 3600MHz', 'cmr3al4g4000104jy62ztrmu8'],
  A550BN: ['MSI MAG A550BN', 'cmr3b1d4e0001ncymhucwjtot'],
  A650GL: ['MSI MAG A650GL', 'cmpi5h9s2000704l1iq4czxdf'],
  A750GL: ['MSI MAG A750GL PCIe 5', 'cmpnewmaga750gl000000000'],
  RM750E: ['Corsair RM750e', 'cmpnewrm750e0000000000000'],
  PP13_750: ['be quiet! Pure Power 13 M 750W', 'cmuzymvix001qwwymtyp9yo7k'],
  FGX850: ['Seasonic Focus GX-850', 'cmr3crglp0004ncym20vrcnug'],
  GX3_850: ['Cooler Master GX III Gold 850W', 'cmpiechc0004900ymibo2v8bf'],
  C850: ['NZXT C850 Gold', 'cmpiech5s004800ymicj1g7qh'],
  RM850EW: ['Corsair RM850e 850W ATX 3.1 Gold White', 'cmsxgetcm0006j8ymgue6lyuz'],
  GF3_1000: ['Thermaltake Toughpower GF3 1000W', 'cmpiechj4004a00ym7kkv09n4'],
  RM1000EW: ['Corsair RM1000e 1000W ATX 3.1 White', 'cmsxgeuty000ij8ymqxeue551'],
  C1200: ['NZXT C1200 Gold ATX 3.1', 'cmuzsa3co001qu8ymzvekx5wu'],
  EDGE1200W: ['Lian Li EDGE Gold 1200W White', 'cmuztrwdn000wkcymmc2rgwvw'],
  B650MDS3H: ['Gigabyte B650M DS3H', 'cmpiec87q003900ymbge1evlg'],
  B840MP: ['MSI PRO B840M-P WiFi6E', 'cmuzv43g0000zpcym7h9wju94'],
  B850MDS3H: ['Gigabyte B850M DS3H', 'cmuzkkfen0006u4ympd4lej5s'],
  B850GX: ['Gigabyte B850 GAMING X WiFi6E', 'cmuzkkfpp000au4ymb7a4v538'],
  H610MK: ['ASUS PRIME H610M-K D4', 'cmsrkfbz00002rcym23d53vn8'],
  B760MPRORS: ['ASRock B760M Pro RS', 'cmpieb67b000m00ymc9cu16eo'],
  B760MAW: ['MSI PRO B760M-A WiFi', 'cmpieb6o7000o00ymqej7bko3'],
  H810MH: ['Gigabyte H810M H', 'cmsqke9vu0000h0ymg80t79nw'],
  B850IEDGE: ['MSI MPG B850I EDGE TI WIFI', 'cmtjkeozr000eygymbt7vxqqy'],
  NV3_1: ['Kingston NV3 1TB', 'cmr3fmu4a000404lhu1iu5ptw'],
  SN580_1: ['WD Blue SN580 1TB', 'cmr2lb6ic000ujgymo0sj1lsi'],
  P310_1: ['Crucial P310 1TB', 'cmr3fmw04000h04lhev74orvq'],
  EVOPLUS1: ['Samsung 990 EVO Plus 1TB', 'cmr2lb510000ojgymiia4ot0o'],
  T705_1HS: ['Crucial T705 1TB Heatsink', 'cmv14qbri001o50ymlfrm3oxp'],
  PRO990HS1: ['Samsung 990 PRO 1TB Heatsink', 'cmv14qcid001x50ymule3u87a'],
};
const alt = (k, why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n* ${why}`;

/* عرض أمازون B0CBRJ63RT (CMK32GX5M2B6000Z30 = CL30) كان على صفّ «Vengeance DDR5 32GB 6000MHz» العامّ
   ومواصفاته CL36 — وهو عرضه الوحيد المتوفّر، فكان يعرض سعر CL30 لنسخة CL36. لا CL36 في أمازون (بحثٌ برمزه) */
const MOVE = [{ offerId: 'cmsgej9100009psym088pkf76', from: 'cmpiebd2l001e00ym1y8bzzlv', to: 'Vengeance 32GB (2x16GB) DDR5 6000MHz CL30', brand: 'Corsair', urlHas: 'B0CBRJ63RT' }];
/* عروض كازاسوق لقرصين من الدفعة الثامنة — ظهرا في بحث هذه الدفعة */
const EXTRA = [
  { id: 'cmv14qc9d001u50ym67678akx', name: '990 PRO 2TB Heatsink', offer: C('samsung-990-pro-2tb-pcie-nvme-gen4-with-heat-sink-aa13347-4-13347') },
  { id: 'cmv14qcid001x50ymule3u87a', name: '990 PRO 1TB Heatsink', offer: C('samsung-990-pro-1tb-pcie-nvme-gen4-with-heat-sink-aa13345-4-13345') },
];

const ML = {"VEN6000C30":"corsair-vengeance-64gb-2x32gb-ddr5-desktop-memory-kit-6000-mhz-memory-speed-cl30-cas-latency-1-1v-memory-voltage-amd-expo-intel-xmp-288-pin-black-cmk32gx5m2b6000z30","BEASTRGB64_36":"kingston-fury-beast-rgb-64gb-2x-32gb-ddr5-dual-desktop-memory-kit-6000-mhz-memory-speed-cl36-cas-latency-288-pin-kit-intel-xmp-amd-expo-ready-black-kf560c36bbe2ak2-64","BEASTRGB64W30":"kingston-fury-beast-rgb-64gb-ddr5-dual-desktop-memory-kit-6000-mhz-memory-speed-cl30-cas-latency-288-pin-kit-intel-xmp-3-0-amd-expo-profile-white-kf560c30bweak2-64","VENRGB16_5200":"corsair-vengeance-rgb-16gb-2x8gb-rgb-ddr5-288-pin-dual-channel-desktop-memory-kit-5200-mhz-tested-speed-40-40-40-77-latency-intel-xmp-3-0-chipset-overclock-pmic-cmh16gx5m2b5200c40","VENRGB48":"corsair-vengeance-rgb-48gb-2-x-24gb-288-pin-ddr5-5600-desktop-memory-5600mhz-memory-speed-c40-cas-latency-1-4-voltage-intel-700-600-series-xmp-3-0-black-cmh48gx5m2b5600c40","TZ5RK64":"g-skill-trident-z5-rgb-series-64gb-2-x-32gb-ddr5-dual-channel-desktop-memory-kit-6400-mhz-memory-speed-cl32-cas-latency-1-40v-intel-xmp-3-0-288-pin-matte-black-f5-6000j3636f32gx2-tz5rk","BEASTRGB64D4":"kingston-fury-beast-rgb-64gb-2x-32gb-ddr4-desktop-memory-kit-3200mt-s-memory-speed-cl16-cas-latency-288-pin-intel-xmp-2-0-black-kf432c16bb2ak2-64","UD750V2":"gigabyte-ud750gm-pg5-v2-fully-modular-power-supply-750w-power-120mm-hydraulic-bearing-hyb-fan-80-plus-gold-efficiency-active-pfc-black-gp-ud750gm-pg5-v2","UD1000V2":"gigabyte-ud1000gm-pg5-v2-fully-modular-power-supply-1000w-power-120mm-hydraulic-bearing-hyb-fan-80-plus-gold-efficiency-active-pfc-black-gp-ud1000gm-pg5-v2","P550SSICE":"gigabyte-p550ss-ice-non-modular-power-supply-550w-power-80-plus-silver-efficiency-120mm-fluid-dynamic-bearing-fan-intel-form-factor-atx-12v-v3-0-active-pfc-white-gp-p550ss-ice","ELITEG1000":"cooler-master-elite-gold-1000-fully-modular-power-supply-1000w-power-80-plus-gold-efficiency-120mm-fan-size-atx-12v-ver-3-1-fluid-dynamic-bearing-fdb-black-mpw-a001-afag-buk","RB650":"lian-li-rb-series-650w-80-plus-bronze-atx-3-1-power-supply-non-modular-psu-with-135mm-hyb-fan-black-rb0650b","RS1000B":"lian-li-rs-rotational-shift-fully-modular-power-supply-1000w-power-80-plus-gold-efficiency-135mm-cooling-fan-german-epcos-industrial-grade-capacitors-atx-3-1-ready-black-rs1000g-bh00","RS1200W":"lian-li-rs-rotational-shift-fully-modular-power-supply-1200w-power-80-plus-gold-efficiency-135mm-cooling-fan-german-epcos-industrial-grade-capacitors-atx-3-1-ready-white-rs1200g-wh00","TUF750BRZ":"asus-tuf-gaming-750w-bronze-evo-full-modular-power-supply-atx-3-1-compatible-80-plus-bronze-active-pfc-dual-ball-fan-bearings-protective-pcb-coating-black-90ye00d5-b0na00","TUF750G":"asus-tuf-gaming-750w-fully-modular-power-supply-80-plus-gold-efficiency-active-pfc-atx12v-form-factor-dual-ball-fan-bearings-axial-tech-fan-design-black-90ye00s3-b0na00","TUF1000W":"asus-tuf-gaming-1000w-80plus-gold-fully-modular-power-supply-atx-3-0-compatible-80-gold-certified-military-grade-dual-ball-bearing-axial-tech-fan-pcb-coating-white-90ye00s5-b0na00","C750CORE":"nzxt-c750-gold-core-full-modular-power-supply-750w-power-80-plus-gold-efficiency-2-300-rpm-fan-speed-103-36-cfm-airflow-135mm-fan-fluid-dynamic-bearing-atx-3-1-black-pa-7g3bb-uk","C1000G":"nzxt-c1000-80-plus-gold-fully-modular-power-supply-1000w-power-atx12v-v3-1-fluid-dynamic-bearing-japanese-capacitors-active-pf-correction-matte-black-pa-0g2bb-uk","FGX750W":"seasonic-focus-gx-white-atx-3-1-fully-modular-power-supply-750w-power-80-plus-gold-efficiency-135mm-fluid-dynamic-bearing-type-atx-eps-form-factor-white-srp-fgx751-a5a32sf-w","FGX1000":"seasonic-focus-gx-atx-3-1-fully-modular-power-supply-1000w-power-80-plus-gold-efficiency-135mm-fluid-dynamic-bearing-type-atx-eps-form-factor-black-srp-fgx102-a5a32sf","GXIII750":"cooler-master-gx-iii-gold-750-full-modular-power-supply-750w-power-80-plus-gold-efficiency-active-pfc-atx-3-0-support-90-degree-12vhpwr-cable-zero-rpm-mode-black-mpx-7503-afag-buk","DA750R":"silverstone-da750r-gold-fully-modular-power-supply-80-plus-gold-750w-atx-3-0-pcie-5-0-active-pfc-silent-120mm-fdb-fan-japanese-capacitors-black-sst-da750r-gm","DA850R":"silverstone-da850r-fully-modular-power-supply-80-plus-gold-850w-atx-3-0-pcie-5-0-active-pfc-silent-120mm-fan-advanced-protections-12v-2x6-pcie-connector-black-sst-da850r-gma","TGT850W":"thermaltake-toughpower-gt-850w-fully-modular-power-supply-80-plus-gold-efficiency-active-pfc-120mm-hydraulic-bearing-fan-pcie-gen-5-1-atx-3-1-ready-white-ps-tpt-0850fnfagk-w","SP11_650":"be-quiet-system-power-11-non-modular-power-supply-650w-power-80-plus-efficiency-atx-3-1-pcie-5-1-compatible-120-mm-silence-optimized-fan-bp011uk","A1250GL":"msi-mag-a1250gl-pcie5-fully-modular-power-supply-1250-watts-80-plus-gold-certified-atx-3-1-ready-active-pfc-135-mm-fluid-dynamic-bearing-fan-half-bridge-llc-sr-dc-dc-black-306-7zp9a18-ce0","B760MDS3HW":"gigabyte-b760m-ds3h-wifi6e-gen5-lga-1700-micro-atx-motherboard-intel-b760-chipset-4x-ddr5-dimm-slots-256gb-max-memory-1x-pcie-5-0-x16-2x-m-2-slots-wifi-6e-bt-5-3-b760m-ds3h-wf6e-gen5","B840MK":"asus-prime-b840m-k-am5-matx-motherboard-amd-b840-chipset-2x-dimm-ddr5-slots-up-to-128gb-max-memory-1x-pcie-4-0-x16-slot-2x-m-2-slots-90mb1pk0-m0eay0","B840MB":"msi-pro-b840m-b-micro-atx-am5-motherboard-amd-b840-chipset-2x-ddr5-udimm-slots-up-to-128gb-max-memory-1x-pci-e-x16-slot-2x-m-2-slots-911-7e76-002","A620MH":"gigabyte-a620m-h-micro-atx-motherboard-amd-a620a-chipset-2x-ddr5-dimm-slots-128gb-max-memory-1x-pcie-4-0-x16-slot-1x-m-2-pcie-3-0-slot-9ma62mh-00-g22","H610MD3W":"gigabyte-h610m-d3w-wifi6-lga-1700-micro-atx-motherboard-intel-h610-chipset-2x-ddr5-dimm-slots-128gb-max-memory-1x-pcie-4-0-x16-slot-1x-m-2-pcie-3-0-slot-h610m-d3w-wifi6","B760MAW2":"asus-prime-b760m-a-wifi-ii-lga-1700-micro-atx-motherboard-intel-b760-chipset-4x-dimm-ddr5-slots-256gb-max-memory-1-x-pcie-5-0-x16-safeslot-2-x-m-2-slots-90mb1nf0-m0eay0","H810MGW6":"gigabyte-h810m-gaming-wifi6-m-atx-lga-1851-motherboard-intel-h810-chipset-2x-ddr5-dimm-slots-128gb-max-memory-1-x-pcie-4-0-x16-slot-1-x-pcie-4-0-m-2-slot-h810m-gaming-wifi6","B840MEW6":"gigabyte-b840m-eagle-wifi6-m-atx-am5-motherboard-amd-b840-chipset-2x-ddr5-dimm-slots-up-to-128gb-max-memory-1x-pcie-4-0-x16-slot-2-x-m-2-slots-b840m-eagle-wifi6","B760MD3HPW":"gigabyte-b760m-d3hp-wifi6-lga1700-micro-atx-motherboard-intel-b760-chipset-4x-ddr5-dimm-slots-up-to-192gb-max-memory-1x-pcie-4-0-x16-slot-2x-m-2-pcie-4-0-x4-wi-fi-6-bt-5-3-b760m-d3hp-wifi6","B760IEDGE":"msi-mpg-b760i-edge-wifi-lga-1700-mini-itx-motherboard-intel-b760-chipset-2x-ddr5-slots-up-to-128gb-max-memory-1x-1x-pci-e-x16-slot-2x-m-2-slots-wi-fi-6e-bt-5-3-911-7d40-014","B840PLUSW":"asus-prime-b840-plus-wi-fi-am5-atx-motherboard-amd-b840-chipset-4x-dimm-ddr5-slots-up-to-192gb-max-memory-1-x-pcie-4-0-x16-safeslot-core-3-x-m-2-slots-wifi-bt-connectivity-90mb1iz0-m0eay0","SN5100_500":"sandisk-wd-blue-sn5100-internal-solid-state-drive-500gb-capacity-6600mb-s-read-5600mb-s-write-sequential-speed-pcie-gen-4-0-m-2-2280-form-factor-blue-wds500g5b0e","SN5000_500":"western-digital-blue-sn5000-nvme-internal-ssd-500gb-capacity-m-2-2280-form-factor-pcie-gen4-x4-interface-5000-mb-s-sequential-read-4000-mb-s-sequential-write-wds500g4b0e","NV3_500":"kingston-nv3-pcie-4-0-nvme-internal-ssd-500gb-capacity-m-2-2280-form-factor-5000-mb-s-sequential-read-3000-mb-s-sequential-write-speed-3d-nand-technology-160-tbw-endurance-snv3s-500g","NM620_512":"lexar-nm620-512gb-m-2-2280-internal-solid-state-drive-up-to-3300mb-s-read-2400mb-s-write-speeds-3d-tlc-nand-technology-1-5-million-hours-mtbf-shock-vibration-resistance-black-lnm620x512g","NQ780_1":"lexar-nq780-pcie-gen-4-4-nvme-ssd-1tb-capacity-m-2-2280-form-factor-read-up-to-6500mb-s-write-up-to-2500mb-s-600tbw-endurance-1-5m-hours-mtbf-lnq780x001t-rnnng","S990_1":"smsung-990-nvme-internal-ssd-1tb-capacity-black-pcie-4-0-x4-m-2-2280-7150-mb-s-read-6450-mb-s-write-v-nand-memory-type-400tbw-mz-v9v1t0bw","P310HS1":"crucial-p310-internal-ssd-with-heatsink-1tb-storage-capacity-m-2-2280-form-factor-pcie-4-0-interface-up-to-7100-mb-s-sequential-read-6000-mb-s-sequential-write-speed-black-ct1000p310ssd5","T700_1":"crucial-t700-1tb-pcie-gen5-nvme-m-2-internal-ssd-with-heatsink-up-to-11700mb-s-read-9500mb-s-write-speed-232-layer-tlc-nand-up-to-600tb-1-5-million-hrs-mttf-black-ct1000t700ssd5","SN850P1":"western-digital-black-sn850p-1tb-nvme-ssd-for-ps5-playstation-5-storage-expansion-pcie-gen4-up-to-7-300mb-s-read-speed-m-2-2280-internal-gaming-ssd-black-wdbbyv0010bnc-wrsn"};

const PARTS = [
  // ================================================================ الرام
  {
    categoryId: RAM, brand: 'Corsair', name: 'Vengeance 32GB (2x16GB) DDR5 6000MHz CL30', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '6000', casLatency: 'CL30', profile: 'XMP 3.0 & EXPO', rgb: 'No', heightMm: '35', color: 'Grey' },
    offers: [M(ML.VEN6000C30)], /* + عرض أمازون المنقول (MOVE) */
    description: `### Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz CL30

الطقم الأشهر لمعالجات Ryzen: 6000 بتوقيت CL30 بملفّي EXPO وXMP، ومشتّتٌ منخفض بلا إضاءة.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت CL30:[/green] النقطة المثلى لمعالجات Ryzen 7000 و9000.

[green]ملفّا EXPO وXMP 3.0:[/green] يعمل على المنصّتين بضغطة في البايوس.

[green]ارتفاع 35 مم:[/green] لا يتعارض مع المبرّدات الهوائيّة الكبيرة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* جهد 1.4 فولت — أعلى قليلاً من الأطقم الأبطأ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB.

${alt('FLAREX5', 'طقم 6000 بتوقيت CL28 أسرع بقليل لمعالجات AMD.')}
https://www.corsair.com/us/en/p/memory/cmk32gx5m2b6000z30/vengeance-32gb-2x16gb-ddr5-dram-6000mt-s-cl30-amd-expo-memory-black-cmk32gx5m2b6000z30`,
  },
  {
    categoryId: RAM, brand: 'Corsair', name: 'Vengeance RGB 16GB (2x8GB) DDR5 5200MHz CL40', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'DDR5', capacity: '16GB', kit: '2x8GB', speed: '5200', casLatency: 'CL40', profile: 'XMP 3.0', rgb: 'Yes', heightMm: '44', color: 'Black' },
    offers: [A('B0D9PRVBRZ'), M(ML.VENRGB16_5200)],
    description: `### Corsair Vengeance RGB 16GB (2x8GB) DDR5 5200MHz CL40

طقم DDR5 مدخليّ بإضاءة RGB — لتجميعةٍ اقتصاديّة أو جهازٍ مكتبيّ.

**التقنيات الأساسية المدعومة:**

[green]قناتان (2×8 جيجابايت):[/green] أداءٌ أفضل من شريحةٍ واحدة بالسعة نفسها.

[green]إضاءة RGB متعدّدة المناطق:[/green] ببرنامج iCUE.

[green]ملفّ XMP 3.0.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 16 جيجابايت باتت الحدّ الأدنى للألعاب الحديثة — 32 أريح.
* 5200 بتوقيت CL40 — أبطأ من أطقم 6000.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا ملفّ EXPO لمعالجات AMD.

${alt('VEN16', 'الطقم نفسه بلا إضاءة وبسعرٍ أقلّ.')}
https://www.corsair.com/us/en/p/memory/cmh16gx5m2b5200c40/vengeance-rgb-16gb-2x8gb-ddr5-dram-5200mts-cl40-memory-kit-black-cmh16gx5m2b5200c40`,
  },
  {
    categoryId: RAM, brand: 'Corsair', name: 'Vengeance RGB 48GB (2x24GB) DDR5 5600MHz CL40', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'DDR5', capacity: '48GB', kit: '2x24GB', speed: '5600', casLatency: 'CL40', profile: 'XMP 3.0', rgb: 'Yes', heightMm: '44', color: 'Black' },
    offers: [A('B0BVN1GWXV'), M(ML.VENRGB48)],
    description: `### Corsair Vengeance RGB 48GB (2x24GB) DDR5 5600MHz CL40

سعة 48 جيجابايت بشريحتين — وسطٌ بين 32 و64 لمن يحتاج ذاكرةً أكبر للمونتاج أو التصميم دون كلفة 64.

**التقنيات الأساسية المدعومة:**

[green]48 جيجابايت بشريحتين فقط:[/green] تبقى منافذ اللوحة الأخرى فارغة للترقية.

[green]إضاءة RGB متعدّدة المناطق:[/green] ببرنامج iCUE.

[green]جهد 1.25 فولت:[/green] حرارةٌ منخفضة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 5600 بتوقيت CL40 — أبطأ من أطقم 6000 للألعاب.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ملفّ XMP فقط — مضبوطٌ لمنصّات Intel.

${alt('BEAST64', 'سعة 64 جيجابايت بسرعة 6000 CL30.')}
https://www.corsair.com/us/en/p/memory/cmh48gx5m2b5600c40/vengeance-rgb-48gb-2x24gb-ddr5-dram-5600mhz-c40-memory-kit-black-cmh48gx5m2b5600c40`,
  },
  {
    categoryId: RAM, brand: 'Kingston', name: 'Fury Beast RGB 64GB (2x32GB) DDR5 6000MHz CL36', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'DDR5', capacity: '64GB', kit: '2x32GB', speed: '6000', casLatency: 'CL36', profile: 'XMP 3.0 & EXPO', rgb: 'Yes', heightMm: '42', color: 'Black' },
    offers: [A('B0F8P54WBY'), M(ML.BEASTRGB64_36)],
    description: `### Kingston Fury Beast RGB 64GB (2x32GB) DDR5 6000MHz CL36

64 جيجابايت بشريحتين بسرعة 6000 وإضاءة RGB، بملفّي XMP وEXPO — للمونتاج والبثّ والألعاب معاً.

**التقنيات الأساسية المدعومة:**

[green]64 جيجابايت بشريحتين:[/green] سعةٌ كبيرة مع منفذين فارغين.

[green]6000 MT/s:[/green] بملفّي XMP 3.0 وEXPO.

[green]إضاءة RGB:[/green] ببرنامج Kingston FURY CTRL.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيت CL36 — أبطأ قليلاً من أطقم CL30.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* 64 جيجابايت تزيد عن حاجة الألعاب وحدها.

${alt('BEAST64', 'الطقم نفسه بتوقيت CL30 أسرع.')}
https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-rgb-memory`,
  },
  {
    categoryId: RAM, brand: 'Kingston', name: 'Fury Beast RGB 64GB (2x32GB) DDR5 6000MHz CL30 White', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'DDR5', capacity: '64GB', kit: '2x32GB', speed: '6000', casLatency: 'CL30', profile: 'EXPO', rgb: 'Yes', heightMm: '42', color: 'White' },
    offers: [A('B0CYM1HV7C'), M(ML.BEASTRGB64W30)],
    description: `### Kingston Fury Beast RGB 64GB (2x32GB) DDR5 6000MHz CL30 White

أسرع أطقم 64 جيجابايت من Kingston بالأبيض: 6000 بتوقيت CL30 وملفّ EXPO لمعالجات Ryzen.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت CL30:[/green] أفضل توليفةٍ لمعالجات Ryzen 7000 و9000.

[green]64 جيجابايت بشريحتين.[/green]

[green]أبيض مع إضاءة RGB:[/green] للتجميعات البيضاء.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سعره مرتفع جداً مع ارتفاع أسعار الذاكرة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* نسخة EXPO — لمنصّات Intel نسخة XMP منفصلة.

${alt('TZ5RW', 'طقم 64 جيجابايت أبيض آخر بتوقيت CL36.')}
https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-rgb-memory`,
  },
  {
    categoryId: RAM, brand: 'G.Skill', name: 'Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz CL36 Black', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'DDR5', capacity: '64GB', kit: '2x32GB', speed: '6000', casLatency: 'CL36', profile: 'XMP 3.0', rgb: 'Yes', heightMm: '44', color: 'Black' },
    offers: [A('B0C4X758YM'), M(ML.TZ5RK64)],
    description: `### G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz CL36 Black

طقم 64 جيجابايت بالأسود المطفأ من سلسلة Trident Z5 RGB — سعةٌ كبيرة بتصميمٍ مميّز.

**التقنيات الأساسية المدعومة:**

[green]64 جيجابايت بشريحتين:[/green] للمونتاج والتصميم والبرامج الثقيلة.

[green]6000 MT/s بتوقيت CL36.[/green]

[green]إضاءة RGB:[/green] تتزامن مع برامج اللوحات الأمّ الشائعة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ارتفاعه 44 مم — راجع المبرّد الهوائيّ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس الأسرع توقيتاً بين أطقم 64 جيجابايت.

${alt('TZ5RW', 'الطقم نفسه بالأبيض.')}
https://www.gskill.com/products/1/165/374/Trident-Z5-RGB`,
  },
  {
    categoryId: RAM, brand: 'Kingston', name: 'Fury Beast RGB 64GB (2x32GB) DDR4 3200MHz CL16', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'DDR4', capacity: '64GB', kit: '2x32GB', speed: '3200', casLatency: 'CL16', profile: 'XMP 2.0', rgb: 'Yes', heightMm: '42', color: 'Black' },
    offers: [A('B0CGLVKHKF'), M(ML.BEASTRGB64D4)],
    description: `### Kingston Fury Beast RGB 64GB (2x32GB) DDR4 3200MHz CL16

سعة 64 جيجابايت لمنصّات DDR4 (AM4 ولوحات Intel القديمة) — لمن يرقّي جهازه دون تغيير اللوحة.

**التقنيات الأساسية المدعومة:**

[green]64 جيجابايت DDR4 بشريحتين.[/green]

[green]3200 بتوقيت CL16:[/green] توقيتٌ ضيّق لهذه السرعة.

[green]إضاءة RGB:[/green] بتقنية Infrared Sync.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* DDR4 منصّةٌ منتهية — لا تناسب التجميعات الجديدة.
* سعره مرتفع الآن مقارنةً بسعته.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يركب على لوحات DDR5.

${alt('LPX32', 'طقم DDR4 بسعة 32 جيجابايت أرخص بكثير.')}
https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr4-rgb-memory`,
  },

  // ================================================================ المزوّدات
  ...[
    // [ماركة، اسم، واط، شهادة، كابلات، معيار، لون، درجة SPL، درجة الأداء، العروض، مقدّمة، أخضر[]، أصفر[]، أحمر، بديل، سبب البديل، رابط]
    ['Gigabyte', 'P550SS ICE', '550', '80+ Silver', 'Non', 'ATX 3.0', 'White', 'C+', 1, [A('B0DXGSYMJ1'), M(ML.P550SSICE)],
      'مزوّد 550 واط أبيض اقتصاديّ بكفاءة Silver — لتجميعةٍ بكرتٍ متوسّط الاستهلاك.',
      ['مروحة 120 مم بمحمل FDB هادئة.', 'أبيض بالكامل:[/green] للتجميعات البيضاء الاقتصاديّة.', 'حماية OPP وOVP وSCP.'],
      ['درجة C+ في تقييم SPL — حدود الحماية مضبوطةٌ بتحفّظ.', 'كابلات ثابتة غير منفصلة.'], 'لا يكفي كروت الفئة العليا ولا يحوي كابل 12V-2x6.',
      'A550BN', 'مزوّد 550 واط برونزيّ أسود بسعرٍ قريب.', 'https://www.gigabyte.com/Power-Supply/GP-P550SS-ICE/sp'],
    ['Lian Li', 'RB650', '650', '80+ Bronze', 'Non', 'ATX 3.1', 'Black', null, 2, [A('B0FH6NFHTD'), M(ML.RB650)],
      'مزوّد Lian Li الاقتصاديّ بقدرة 650 واط ومعيار ATX 3.1 ومروحة 135 مم.',
      ['معيار ATX 3.1 مع كابل 12V-2x6:[/green] للكروت الحديثة متوسّطة الاستهلاك.', 'مروحة 135 مم بتحكّمٍ حراريّ.', 'ستّ حمايات وضمان خمس سنوات.'],
      ['غير مُدرَج في تقييم SPL بعد.', 'كابلات ثابتة، وضجيج المروحة يصل 39 ديسيبل تحت الحمل.'], 'لا يناسب كروت RTX 5070 Ti وما فوقها.',
      'A650GL', 'مزوّد 650 واط Gold بكابلات منفصلة.', 'https://lian-li.com/product/rb-psu/'],
    ['be quiet!', 'System Power 11 650W', '650', '80+ Bronze', 'Non', 'ATX 3.1', 'Black', 'C', 2, [A('B0F5X7QZKY'), M(ML.SP11_650)],
      'مزوّد be quiet! المدخليّ بقدرة 650 واط ومعيار ATX 3.1 ومروحة هادئة.',
      ['معيار ATX 3.1 وكابل 12V-2x6.', 'مروحة 120 مم مُحسَّنة للهدوء.', 'علامةٌ معروفة بالضمان والدعم.'],
      ['درجة C في تقييم SPL: مروحة ضعيفة الجودة ومكثّف رئيسيّ بتحمّل 85 درجة.', 'كابلات ثابتة.'], 'لا يُنصح به لكرتٍ يتجاوز 200 واط.',
      'A650GL', 'مزوّد 650 واط Gold بدرجة B وكابلات منفصلة.', 'https://www.bequiet.com/en/powersupply/5903'],
    ['ASUS', 'TUF Gaming 750W Bronze EVO', '750', '80+ Bronze', 'Full', 'ATX 3.1', 'Black', null, 2, [A('B0GJ6BDSGB'), M(ML.TUF750BRZ)],
      'مزوّد TUF البرونزيّ الجديد بكابلات منفصلة كاملة ومعيار ATX 3.1 — نادرٌ في فئته.',
      ['كابلات منفصلة بالكامل:[/green] في مزوّدٍ برونزيّ.', 'مروحة بمحملين كرويّين وطلاء واقٍ للوحة الدارة.', 'معيار ATX 3.1 وكابل 12V-2x6.'],
      ['إصدار 2026 غير مُدرَج في تقييم SPL بعد.', 'كفاءة Bronze — حرارةٌ واستهلاكٌ أعلى من Gold.'], 'لا وضع إيقاف المروحة.',
      'A750GL', 'مزوّد 750 واط Gold بسعرٍ قريب.', 'https://www.asus.com/motherboards-components/power-supply-units/tuf-gaming/tuf-gaming-750b-evo/'],
    ['Gigabyte', 'UD750GM PG5 V2', '750', '80+ Gold', 'Full', 'ATX 3.1', 'Black', 'C+', 3, [A('B0FFN58NBZ'), M(ML.UD750V2)],
      'مزوّد 750 واط Gold بكابلات منفصلة ومعيار ATX 3.1 بسعرٍ منخفض — لكنّ تقييم جودته متواضع.',
      ['كابل 12V-2x6:[/green] لكروت RTX 40 و50.', 'كابلات منفصلة بالكامل.', 'مروحة 120 مم بمحمل هيدروليكيّ.'],
      ['درجة C+ في تقييم SPL: «مشكلاتٌ متعدّدة» منها ضعف الاستجابة لقفزات الاستهلاك.'], 'لا يُنصح به لكروت الفئة العليا.',
      'PP13_750', 'مزوّد 750 واط بدرجة B+ ومروحة تتوقّف عند الحمل الخفيف.', 'https://www.gigabyte.com/Power-Supply/GP-UD750GM-PG5-V2/sp'],
    ['ASUS', 'TUF Gaming 750W Gold', '750', '80+ Gold', 'Full', 'ATX 3.1', 'Black', 'B', 3, [A('B0BK54TKB9'), M(ML.TUF750G), RZ('مزود-طاقه-من-tuf-gaming-بقدرة-750w-معياري-بالكامل-بتصنيف-gold-80plus-متوافق-مع-atx31')],
      'مزوّد TUF بقدرة 750 واط Gold: كابلات منفصلة، ومروحة بمحملين كرويّين، وطلاء واقٍ للوحة الدارة.',
      ['كابل 16 سنّاً:[/green] لكروت RTX 40 و50.', 'مروحة Axial-tech بمحملين كرويّين.', 'طلاء واقٍ من الرطوبة والغبار.'],
      ['درجة B في تقييم SPL — جيّد لا ممتاز.'], 'لا وضع إيقاف المروحة.',
      'RM750E', 'مزوّد 750 واط Gold بدرجة B+.', 'https://www.asus.com/motherboards-components/power-supply-units/tuf-gaming/tuf-gaming-750g/'],
    ['NZXT', 'C750 Gold Core', '750', '80+ Gold', 'Full', 'ATX 3.1', 'Black', 'A', 3, [A('B0FQ4WX89P'), M(ML.C750CORE)],
      'نسخة Core من سلسلة C لعام 2025 بقدرة 750 واط — درجة A في تقييم SPL وضجيجٌ منخفض جداً.',
      ['درجة A في تقييم SPL:[/green] جودة مكوّناتٍ وأداءٌ كهربائيّ ممتازان.', 'مروحة 135 مم بمحمل FDB:[/green] من الأهدأ في فئته.', 'كابل 12V-2x6 بقدرة 300 واط.'],
      ['كابل 12V-2x6 بقدرة 300 واط لا 600 — يكفي كروتاً حتى RTX 5070 تقريباً.', 'تنبّه SPL إلى تذبذبٍ طفيف في خطّ 12 فولت في نسخة 750 تحديداً.'], 'ليس للكروت الأعلى استهلاكاً.',
      'C850', 'مزوّد NZXT 850 واط بدرجة A وكابلٍ بقدرةٍ أعلى.', 'https://nzxt.com/product/c750-gold-core'],
    ['Seasonic', 'Focus GX-750 White', '750', '80+ Gold', 'Full', 'ATX 3.1', 'White', 'A-', 3, [A('B0DWDTQB37'), M(ML.FGX750W)],
      'Focus GX الأبيض بقدرة 750 واط ومعيار ATX 3.1 — جودة Seasonic المعروفة بضمان عشر سنوات.',
      ['درجة A- في تقييم SPL.', 'ضمان عشر سنوات:[/green] من الأطول في السوق.', 'مروحة 135 مم بمحمل FDB ووضع تشغيلٍ صامت.'],
      ['تنبّه SPL إلى ضبطٍ فضفاض لخطّ 5VSB وحماية التيار للخطوط الصغرى.'], 'سعره أعلى من مزوّداتٍ بنفس القدرة.',
      'FGX850', 'النسخة السوداء بقدرة 850 واط.', 'https://seasonic.com/focus-gx/'],
    ['Cooler Master', 'GX III Gold 750', '750', '80+ Gold', 'Full', 'ATX 3.0', 'Black', 'B+', 3, [A('B0C9D91PYD'), M(ML.GXIII750)],
      'مزوّد Cooler Master بقدرة 750 واط Gold وكابل 12VHPWR بزاوية 90 درجة ووضع إيقاف المروحة.',
      ['كابل 12VHPWR بزاوية 90:[/green] أسهل في الكيسات الضيّقة.', 'وضع Zero RPM:[/green] المروحة تتوقّف عند الحمل الخفيف.', 'درجة B+ في تقييم SPL.'],
      ['معيار ATX 3.0 لا 3.1.', 'مروحة Yate Loon بمحمل Rifle — ليست الأهدأ.'], 'لا يُعدّ من الفئة العليا.',
      'GX3_850', 'المزوّد نفسه بقدرة 850 واط.', 'https://www.coolermaster.com/en-global/products/gx-iii-gold-750/'],
    ['SilverStone', 'DA750R Gold', '750', '80+ Gold', 'Full', 'ATX 3.0', 'Black', 'B+', 3, [A('B0CL42KDCK'), M(ML.DA750R)],
      'مزوّد SilverStone بقدرة 750 واط Gold ومكثّفات يابانيّة ومروحة FDB هادئة.',
      ['درجة B+ في تقييم SPL.', 'مكثّفات يابانيّة ومروحة 120 مم بمحمل FDB.', 'كابل 12V-2x6 (PCIe 5.0).'],
      ['معيار ATX 3.0 لا 3.1.'], 'لا وضع إيقاف المروحة.',
      'RM750E', 'مزوّد 750 واط Gold بدرجة B+ وسعرٍ قريب.', 'https://www.silverstonetek.com/en/product/info/power-supplies/DA750R_Gold/'],
    ['SilverStone', 'DA850R Gold', '850', '80+ Gold', 'Full', 'ATX 3.0', 'Black', 'B+', 4, [A('B0CHVNCXP4'), M(ML.DA850R)],
      'مزوّد SilverStone بقدرة 850 واط Gold وكابل 12V-2x6 وحماياتٍ متقدّمة.',
      ['درجة B+ في تقييم SPL.', 'كابل 12V-2x6:[/green] لكروت RTX 50.', 'مروحة 120 مم صامتة.'],
      ['معيار ATX 3.0 لا 3.1.'], 'لا وضع إيقاف المروحة.',
      'FGX850', 'مزوّد 850 واط بدرجة A-.', 'https://www.silverstonetek.com/en/product/info/power-supplies/DA850R_Gold/'],
    ['Thermaltake', 'Toughpower GT 850W Snow', '850', '80+ Gold', 'Full', 'ATX 3.1', 'White', null, 4, [A('B0DNZCT6ML'), M(ML.TGT850W)],
      'مزوّد Thermaltake الأبيض بقدرة 850 واط ومعيار ATX 3.1 ووضع إيقاف المروحة الذكيّ.',
      ['معيار ATX 3.1 وكابل 12V-2x6 أصليّ بقدرة 600 واط.', 'Smart Zero Fan:[/green] صامتٌ عند الحمل الخفيف.', 'أبيض بالكامل مع الكابلات.'],
      ['غير مُدرَج في تقييم SPL بعد.'], 'لا يُعرف مستوى مكوّناته باختبارٍ مستقلّ بعد.',
      'RM850EW', 'مزوّد 850 واط أبيض بدرجة B+.', 'https://latam.thermaltake.com/toughpower-gt-snow-850w.html'],
    ['Gigabyte', 'UD1000GM PG5 V2', '1000', '80+ Gold', 'Full', 'ATX 3.1', 'Black', 'C+', 4, [A('B0FFMZ9NT9'), M(ML.UD1000V2)],
      'مزوّد 1000 واط Gold بكابلات منفصلة ومعيار ATX 3.1 بسعرٍ منخفض — تقييم جودته متواضع.',
      ['1000 واط بسعر مزوّدات 850.', 'كابل 12V-2x6 وكابلات منفصلة.'],
      ['درجة C+ في تقييم SPL: ضعف الاستجابة لقفزات الاستهلاك ومعامل قدرةٍ منخفض.'], 'لا يُنصح به لكروت RTX 5080/5090 رغم قدرته.',
      'GF3_1000', 'مزوّد 1000 واط بدرجة A+ وسعرٍ قريب.', 'https://www.gigabyte.com/Power-Supply/GP-UD1000GM-PG5-V2/sp'],
    ['Cooler Master', 'Elite Gold 1000', '1000', '80+ Gold', 'Full', 'ATX 3.1', 'Black', 'B+', 4, [A('B0GSGPVHW8'), M(ML.ELITEG1000)],
      'مزوّد Cooler Master الجديد بقدرة 1000 واط Gold ومعيار ATX 3.1 بسعرٍ منخفض جداً لقدرته.',
      ['أداءٌ كهربائيّ بمستوى الفئة A:[/green] بحسب تقييم SPL.', 'معيار ATX 3.1 وكابلات منفصلة.', 'سعرٌ منخفض لمزوّد 1000 واط.'],
      ['درجة B+ في تقييم SPL — لأنّ المروحة تحدّ من أدائه الحراريّ والصوتيّ.'], 'ليس الأهدأ تحت الحمل الثقيل.',
      'GF3_1000', 'مزوّد 1000 واط بدرجة A+.', 'https://www.coolermaster.com/en-global/products/elite-gold-1000/'],
    ['ASUS', 'TUF Gaming 1000W Gold White', '1000', '80+ Gold', 'Full', 'ATX 3.0', 'White', 'B', 4, [A('B0CVTJ4964'), M(ML.TUF1000W), C('asus-tuf-gaming-1000g-white-1000w-80-plus-gold-fully-modular-psu')],
      'النسخة البيضاء من مزوّد TUF بقدرة 1000 واط: كابلات بيضاء ومروحة بمحملين كرويّين.',
      ['أبيض مع الكابلات:[/green] للتجميعات البيضاء.', 'مروحة Axial-tech بمحملين كرويّين وطلاء واقٍ.', 'كابل 16 سنّاً للكروت الحديثة.'],
      ['درجة B في تقييم SPL.', 'معيار ATX 3.0 لا 3.1.'], 'لا وضع إيقاف المروحة.',
      'RM1000EW', 'مزوّد 1000 واط أبيض بدرجة B+.', 'https://www.asus.com/motherboards-components/power-supply-units/tuf-gaming/tuf-gaming-1000g-white/'],
    ['NZXT', 'C1000 Gold ATX 3.1', '1000', '80+ Gold', 'Full', 'ATX 3.1', 'Black', 'A+', 5, [A('B0DHVNMGSV'), M(ML.C1000G)],
      'مزوّد NZXT C1000 Gold إصدار 2024 بمعيار ATX 3.1 — درجة A+ في تقييم SPL.',
      ['درجة A+ في تقييم SPL:[/green] من أعلى المزوّدات جودةً.', 'مروحة 135 مم بمحمل FDB ووضع صامت.', 'كابل 12V-2x6 ومكثّفات يابانيّة.'],
      ['أغلى من نسخة Core بقدرتها نفسها.'], 'لا إضاءة ولا شاشة.',
      'C1200', 'المزوّد نفسه بقدرة 1200 واط.', 'https://nzxt.com/products/c1000-gold-atx'],
    ['Seasonic', 'Focus GX-1000 ATX 3.1', '1000', '80+ Gold', 'Full', 'ATX 3.1', 'Black', 'A-', 5, [A('B0DJHCTJFC'), M(ML.FGX1000)],
      'Focus GX بقدرة 1000 واط (الجيل V4 بمعيار ATX 3.1) — جودة Seasonic بضمان عشر سنوات.',
      ['درجة A- في تقييم SPL.', 'ضمان عشر سنوات.', 'مروحة 135 مم بمحمل FDB.'],
      ['تنبّه SPL إلى ضبطٍ فضفاض لخطّ 5VSB.'], 'سعره أعلى من مزوّدات 1000 واط الأخرى.',
      'GF3_1000', 'مزوّد 1000 واط بدرجة A+ وسعرٍ أقلّ.', 'https://seasonic.com/focus-gx/'],
    ['Lian Li', 'RS1000G', '1000', '80+ Gold', 'Full', 'ATX 3.1', 'Black', 'A', 5, [A('B0FGPCFGZH'), M(ML.RS1000B)],
      'مزوّد Lian Li بمدخل كهرباء دوّار 90 درجة لترتيب الكابلات، بقدرة 1000 واط ودرجة A في تقييم SPL.',
      ['مدخل كهرباء دوّار:[/green] يناسب الكيسات بحجرتين.', 'درجة A في تقييم SPL وكفاءة Cybenetics Platinum.', 'ضمان عشر سنوات ووضع إيقاف المروحة.'],
      ['موزّع المراوح USB اختياريّ في نسخة 1000 واط.'], 'لا يختلف عن المزوّدات الجيّدة إلا بالمدخل الدوّار.',
      'GF3_1000', 'مزوّد 1000 واط بدرجة A+ بلا المدخل الدوّار.', 'https://lian-li.com/product/rs/'],
    ['Lian Li', 'RS1200G White', '1200', '80+ Gold', 'Full', 'ATX 3.1', 'White', 'A', 5, [A('B0FGPDZ5M9'), M(ML.RS1200W)],
      'نسخة 1200 واط البيضاء من سلسلة RS: مدخل كهرباء دوّار وموزّع مراوح USB مرفق.',
      ['مدخل كهرباء دوّار 90 درجة.', 'موزّع مراوح USB مرفق:[/green] أربعة منافذ.', 'درجة A في تقييم SPL وضمان عشر سنوات.'],
      ['1200 واط تزيد عن حاجة أغلب التجميعات.'], 'كبيرٌ نسبياً لمزوّد ATX.',
      'EDGE1200W', 'مزوّد Lian Li أبيض آخر بقدرة 1200 واط.', 'https://lian-li.com/product/rs/'],
    ['MSI', 'MAG A1250GL PCIE5', '1250', '80+ Gold', 'Full', 'ATX 3.1', 'Black', 'B+', 5, [A('B0CXQ67GZH'), M(ML.A1250GL), C('msi-mag-a1250gl-pcie5-1250w-80-plus-gold-modular-psu-19905')],
      'مزوّد MSI بقدرة 1250 واط Gold بكابلي 12V-2x6 — للتجميعات بكروت RTX 5090.',
      ['1250 واط:[/green] هامشٌ واسع لأقوى الكروت والمعالجات.', 'معيار ATX 3.1 ومروحة 135 مم FDB.', 'درجة B+ في تقييم SPL.'],
      ['تنبّه SPL إلى خللٍ في حماية خطّ 5 فولت عند الحرارة العالية.'], 'قدرته تزيد عن حاجة أغلب الأجهزة.',
      'C1200', 'مزوّد 1200 واط بدرجة A+.', 'https://www.msi.com/Power-Supply/MAG-A1250GL-PCIE5'],
  ].map(([brand, name, w, rating, mod, ff, color, tier, perf, offers, intro, greens, yellows, red, altKey, altWhy, url]) => ({
    categoryId: PSU, brand, name, tdpWattage: 0, performanceTier: perf,
    specs: { wattage: w, rating, modularity: mod, formFactor: ff, color, ...(tier ? { qualityTier: tier } : {}) },
    offers,
    description: `### ${brand} ${name}

${intro}

**التقنيات الأساسية المدعومة:**

${greens.map((g) => (g.includes('[/green]') ? `[green]${g}` : `[green]${g}[/green]`)).join('\n\n')}

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

${yellows.map((y) => `* ${y}`).join('\n')}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ${red}

${alt(altKey, altWhy)}
${url}`,
  })),

  // ================================================================ اللوحات الأمّ
  ...[
    // [ماركة، اسم، specs، tdp، درجة، العروض، مقدّمة، أخضر[]، أصفر[]، أحمر، بديل، سبب، رابط]
    ['Gigabyte', 'A620M H', { socket: 'AM5', chipset: 'A620', formFactor: 'Micro-ATX', ramType: 'DDR5', maxRam: '128GB', m2Slots: '1', wifi: 'No', lan: '1GbE', memorySpeed: '6400 MT/s (OC)', pcieVersion: 'PCIe 4.0' }, 7, 1,
      [A('B0C9R3VLW4'), M(ML.A620MH)],
      'أرخص لوحة AM5 في الكتالوج — مدخلٌ إلى منصّة Ryzen الحديثة بأقلّ كلفة.',
      ['يدعم Ryzen 7000 و8000 و9000:[/green] على مقبس AM5 الممتدّ دعمه.', 'منفذ M.2 من المعالج بالجيل الرابع.', 'مخرجا HDMI وDisplayPort للرسوميات المدمجة.'],
      ['منفذ M.2 واحد ومنفذا ذاكرة فقط.', 'مراحل طاقة بسيطة — الأنسب لمعالجات 65 واط مثل 7600 و9600؛ المعالجات العليا قد تُخفَّض سرعتها.'], 'لا واي‑فاي، وشبكة 1 جيجابت فقط، ولا كسر سرعة للمعالج.',
      'B650MDS3H', 'لوحة B650 بمنفذي M.2 وأربع فتحات ذاكرة بفرقٍ صغير.', 'https://www.gigabyte.com/Motherboard/A620M-H-rev-10/sp'],
    ['MSI', 'PRO B840M-B', { socket: 'AM5', chipset: 'B840', formFactor: 'Micro-ATX', ramType: 'DDR5', maxRam: '128GB', m2Slots: '2', wifi: 'No', lan: '2.5GbE', memorySpeed: '8000 MT/s (OC)', pcieVersion: 'PCIe 4.0' }, 7, 1,
      [A('B0F84CBWVC'), M(ML.B840MB)],
      'لوحة B840 اقتصاديّة من MSI: منفذا M.2 بالجيل الرابع وشبكة 2.5 جيجابت بسعرٍ قريب من A620.',
      ['منفذا M.2 بالجيل الرابع x4.', 'شبكة Realtek بسرعة 2.5 جيجابت.', 'ذاكرة DDR5 حتى 8000 كسر سرعة.'],
      ['منفذا ذاكرة فقط (128 جيجابايت كحدٍّ أقصى).', 'فتحة الكرت بالجيل الرابع.'], 'لا واي‑فاي مدمج.',
      'B840MP', 'لوحة B840 من MSI بواي‑فاي 6E وأربع فتحات ذاكرة.', 'https://www.msi.com/Motherboard/PRO-B840M-B'],
    ['ASUS', 'PRIME B840M-K', { socket: 'AM5', chipset: 'B840', formFactor: 'Micro-ATX', ramType: 'DDR5', maxRam: '128GB', m2Slots: '2', wifi: 'No', lan: '2.5GbE', pcieVersion: 'PCIe 4.0' }, 7, 1,
      [A('B09DC2R9JT'), M(ML.B840MK)],
      'لوحة ASUS الاقتصاديّة على شيبست B840: منفذا M.2 وشبكة 2.5 جيجابت ومنفذ Type-C أماميّ.',
      ['منفذا M.2 بالجيل الرابع.', 'شبكة Realtek بسرعة 2.5 جيجابت.', 'منفذ USB Type-C أماميّ وإضاءة Aura Sync.'],
      ['منفذا ذاكرة فقط.', 'فتحة الكرت بالجيل الرابع.'], 'لا واي‑فاي مدمج.',
      'B850MDS3H', 'لوحة B850 بأربع فتحات ذاكرة وفتحة كرت بالجيل الخامس.', 'https://www.asus.com/motherboards-components/motherboards/prime/prime-b840m-k/'],
    ['Gigabyte', 'B840M EAGLE WIFI6', { socket: 'AM5', chipset: 'B840', formFactor: 'Micro-ATX', ramType: 'DDR5', maxRam: '128GB', m2Slots: '2', wifi: 'Wi-Fi 6', lan: '2.5GbE', memorySpeed: '7600 MT/s (OC)', pcieVersion: 'PCIe 4.0' }, 7, 2,
      [A('B0FDL8TP8B'), M(ML.B840MEW6)],
      'لوحة B840 بواي‑فاي 6 وشبكة 2.5 جيجابت — اتّصالٌ لاسلكيّ في لوحةٍ اقتصاديّة.',
      ['واي‑فاي 6 وبلوتوث 5.3.', 'شبكة 2.5 جيجابت.', 'منفذا M.2 بآليّة EZ-Latch بلا براغٍ.'],
      ['منفذ M.2 الثاني بالجيل الثالث x2 فقط.', 'منفذا ذاكرة فقط.'], 'لا PCIe 5.0.',
      'B840MP', 'لوحة B840 بواي‑فاي 6E وأربع فتحات ذاكرة.', 'https://www.gigabyte.com/Motherboard/B840M-EAGLE-WIFI6-rev-10-11/sp'],
    ['ASUS', 'PRIME B840-PLUS WIFI', { socket: 'AM5', chipset: 'B840', formFactor: 'ATX', ramType: 'DDR5', maxRam: '192GB', m2Slots: '3', wifi: 'Wi-Fi 6E', lan: '2.5GbE', pcieVersion: 'PCIe 4.0' }, 10, 2,
      [A('B0DP5DT749'), M(ML.B840PLUSW)],
      'لوحة B840 بحجم ATX كامل: أربع فتحات ذاكرة وثلاثة منافذ M.2 وواي‑فاي 6E.',
      ['حجم ATX:[/green] أربع فتحات ذاكرة حتى 192 جيجابايت.', 'ثلاثة منافذ M.2.', 'واي‑فاي 6E وشبكة 2.5 جيجابت.'],
      ['شيبست B840 بخطوطٍ أقلّ من B850 — فتحة الكرت بالجيل الرابع.'], 'لا PCIe 5.0 للكرت ولا للأقراص.',
      'B850GX', 'لوحة B850 بحجم ATX وفتحة كرت بالجيل الخامس.', 'https://www.asus.com/motherboards-components/motherboards/prime/prime-b840-plus-wifi/'],
    ['Gigabyte', 'H610M D3W WIFI6', { socket: 'LGA1700', chipset: 'H610', formFactor: 'Micro-ATX', ramType: 'DDR5', maxRam: '128GB', m2Slots: '1', wifi: 'Wi-Fi 6', lan: '1GbE', pcieVersion: 'PCIe 4.0' }, 7, 1,
      [A('B0G1MQVVGZ'), M(ML.H610MD3W)],
      'لوحة H610 بذاكرة DDR5 وواي‑فاي 6 — لمعالجات Intel من الجيل 12 إلى 14 بأقلّ كلفة.',
      ['واي‑فاي 6 وبلوتوث 5.3 مدمجان.', 'ذاكرة DDR5.', 'فتحة الكرت بالجيل الرابع.'],
      ['منفذ M.2 واحد بالجيل الثالث، ومنفذا ذاكرة فقط.', 'مراحل طاقة بسيطة — الأنسب لمعالجات i3 وi5 غير K.'], 'لا كسر سرعة، وشبكة 1 جيجابت.',
      'H610MK', 'لوحة H610 أرخص بذاكرة DDR4 وبلا واي‑فاي.', 'https://www.gigabyte.com/Motherboard/H610M-D3W-WIFI6-rev-11/sp'],
    ['Gigabyte', 'B760M D3HP WIFI6', { socket: 'LGA1700', chipset: 'B760', formFactor: 'Micro-ATX', ramType: 'DDR5', maxRam: '192GB', m2Slots: '2', wifi: 'Wi-Fi 6', lan: '2.5GbE', pcieVersion: 'PCIe 4.0' }, 10, 2,
      [A('B0F48RWLBS'), M(ML.B760MD3HPW)],
      'لوحة B760 بأربع فتحات DDR5 ومنفذي M.2 بالجيل الرابع وواي‑فاي 6.',
      ['أربع فتحات DDR5:[/green] حتى 192 جيجابايت.', 'منفذا M.2 بالجيل الرابع x4.', 'واي‑فاي 6.'],
      ['فتحة الكرت بالجيل الرابع.'], 'لا كسر سرعة للمعالج (B760).',
      'B760MPRORS', 'لوحة B760 أخرى بثلاثة منافذ M.2.', 'https://www.gigabyte.com/Motherboard/B760M-D3HP-WIFI6/sp'],
    ['ASUS', 'PRIME B760M-A WIFI II', { socket: 'LGA1700', chipset: 'B760', formFactor: 'Micro-ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '2', wifi: 'Wi-Fi 6', lan: '2.5GbE', pcieVersion: 'PCIe 5.0' }, 10, 2,
      [A('B0GFMYWL62'), M(ML.B760MAW2)],
      'الإصدار الثاني من PRIME B760M-A WIFI بفتحة كرت بالجيل الخامس وأربع فتحات DDR5.',
      ['فتحة كرت PCIe 5.0 بتصميم SafeSlot.', 'أربع فتحات DDR5 حتى 256 جيجابايت.', 'واي‑فاي وشبكة 2.5 جيجابت.'],
      ['منفذا M.2 فقط.'], 'لا كسر سرعة للمعالج (B760).',
      'B760MAW', 'لوحة B760 من MSI بمواصفاتٍ قريبة.', 'https://www.asus.com/motherboards-components/motherboards/prime/prime-b760m-a-wifi-ii/'],
    ['Gigabyte', 'B760M DS3H WIFI6E GEN5', { socket: 'LGA1700', chipset: 'B760', formFactor: 'Micro-ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '2', wifi: 'Wi-Fi 6E', lan: '2.5GbE', pcieVersion: 'PCIe 5.0' }, 10, 2,
      [A('B0FPRQ3SPD'), M(ML.B760MDS3HW)],
      'إصدار GEN5 من B760M DS3H: فتحة كرت بالجيل الخامس وواي‑فاي 6E وأربع فتحات DDR5.',
      ['فتحة كرت PCIe 5.0.', 'واي‑فاي 6E وبلوتوث 5.3.', 'أربع فتحات DDR5 حتى 256 جيجابايت.'],
      ['منفذا M.2 فقط.'], 'لا كسر سرعة للمعالج (B760).',
      'B760MPRORS', 'لوحة B760 بثلاثة منافذ M.2 وسعرٍ أقلّ.', 'https://www.gigabyte.com/Motherboard/B760M-DS3H-WIFI6E-GEN5/sp'],
    ['MSI', 'MPG B760I EDGE WIFI', { socket: 'LGA1700', chipset: 'B760', formFactor: 'Mini-ITX', ramType: 'DDR5', maxRam: '128GB', m2Slots: '2', wifi: 'Wi-Fi 6E', lan: '2.5GbE', pcieVersion: 'PCIe 5.0' }, 10, 3,
      [A('B0BVZJTX1G'), M(ML.B760IEDGE)],
      'لوحة Mini-ITX من سلسلة MPG EDGE لتجميعات Intel الصغيرة: فتحة كرت بالجيل الخامس وواي‑فاي 6E.',
      ['حجم Mini-ITX:[/green] للكيسات الصغيرة.', 'فتحة كرت PCIe 5.0 ومنفذا M.2.', 'واي‑فاي 6E وشبكة 2.5 جيجابت.'],
      ['منفذا ذاكرة فقط، وفتحة توسعةٍ واحدة.', 'أغلى من لوحات mATX بالشيبست نفسه.'], 'لا كسر سرعة للمعالج (B760).',
      'B850IEDGE', 'لوحة EDGE Mini-ITX لمنصّة AMD.', 'https://www.msi.com/Motherboard/MPG-B760I-EDGE-WIFI'],
    ['Gigabyte', 'H810M GAMING WIFI6', { socket: 'LGA1851', chipset: 'H810', formFactor: 'Micro-ATX', ramType: 'DDR5', maxRam: '128GB', m2Slots: '1', wifi: 'Wi-Fi 6', lan: '2.5GbE', pcieVersion: 'PCIe 4.0' }, 7, 1,
      [A('B0DXFYKN8D'), M(ML.H810MGW6)],
      'لوحة H810 اقتصاديّة لمعالجات Core Ultra (السلسلة 2) بواي‑فاي 6 وشبكة 2.5 جيجابت.',
      ['واي‑فاي 6 وبلوتوث 5.3.', 'شبكة Realtek بسرعة 2.5 جيجابت.', 'منفذ M.2 بالجيل الرابع مع مشتّت.'],
      ['منفذ M.2 واحد ومنفذا ذاكرة فقط.', 'مراحل طاقة بسيطة — الأنسب لمعالجات Core Ultra 5 غير K.'], 'لا كسر سرعة، وفتحة الكرت بالجيل الرابع.',
      'H810MH', 'لوحة H810 أرخص بلا واي‑فاي.', 'https://www.gigabyte.com/Motherboard/H810M-GAMING-WIFI6/sp'],
  ].map(([brand, name, specs, tdp, perf, offers, intro, greens, yellows, red, altKey, altWhy, url]) => ({
    categoryId: MB, brand, name, tdpWattage: tdp, performanceTier: perf, specs, offers,
    description: `### ${brand} ${name}

${intro}

**التقنيات الأساسية المدعومة:**

${greens.map((g) => (g.includes('[/green]') ? `[green]${g}` : `[green]${g}[/green]`)).join('\n\n')}

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

${yellows.map((y) => `* ${y}`).join('\n')}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ${red}

${alt(altKey, altWhy)}
${url}`,
  })),

  // ================================================================ التخزين
  ...[
    // [ماركة، اسم، specs، درجة، العروض، مقدّمة، أخضر[]، أصفر[]، أحمر، بديل، سبب، رابط]
    ['WD', 'Blue SN5100 500GB', { type: 'NVMe M.2', capacity: '500GB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '6600 MB/s', writeSpeed: '5600 MB/s', dramCache: 'No', tbw: '300 TB' }, 2,
      [A('B0FJ8VGNK8'), M(ML.SN5100_500)],
      'أسرع أقراص 500 جيجابايت الاقتصاديّة: قراءة 6,600 ميجابايت/ث — قرصٌ للنظام في تجميعةٍ موفّرة.',
      ['قراءة 6,600 MB/s وكتابة 5,600 MB/s.', 'تحمّل 300 تيرابايت وضمان خمس سنوات.'],
      ['500 جيجابايت تمتلئ بسرعة مع الألعاب الحديثة.', 'ذاكرة QLC وبلا DRAM.'], 'لا يكفي مكتبة ألعابٍ كبيرة.',
      'SN580_1', 'قرص WD بسعة 1 تيرابايت بسعرٍ أعلى قليلاً.', 'https://www.sandisk.com/products/ssd/internal-ssd/wd-blue-sn5100-nvme-ssd?sku=WDS500G5B0E-00CPE0'],
    ['WD', 'Blue SN5000 500GB', { type: 'NVMe M.2', capacity: '500GB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '5000 MB/s', writeSpeed: '4000 MB/s', dramCache: 'No (HMB)', tbw: '300 TB' }, 2,
      [A('B0D7MKQKXZ'), M(ML.SN5000_500)],
      'قرص WD الاقتصاديّ من الجيل الرابع بسعة 500 جيجابايت — قرصٌ للنظام بسعرٍ منخفض.',
      ['قراءة 5,000 MB/s وكتابة 4,000 MB/s.', 'تقنية nCache 4.0 وتحمّل 300 تيرابايت.'],
      ['500 جيجابايت تمتلئ بسرعة.', 'أبطأ من SN5100 الأحدث بسعرٍ قريب.'], 'بلا ذاكرة DRAM.',
      'SN580_1', 'قرص WD بسعة 1 تيرابايت.', 'https://www.sandisk.com/products/ssd/internal-ssd/wd-blue-sn5000-nvme-ssd?sku=WDS500G4B0E-00CNZ0'],
    ['Kingston', 'NV3 500GB', { type: 'NVMe M.2', capacity: '500GB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '5000 MB/s', writeSpeed: '3000 MB/s', dramCache: 'No', tbw: '160 TB' }, 2,
      [A('B0DBR9RZLV'), M(ML.NV3_500), RZ('هاردسك-داخلي-كينجستون-اس-اس-دي-kingston-nv3-pcie-40-nvme-m2-بسعة-500-جيجابايت')],
      'أصغر سعات Kingston NV3 — قرصٌ للنظام في تجميعةٍ اقتصاديّة.',
      ['قراءة 5,000 MB/s.', 'متوفّرٌ في متاجر كثيرة.'],
      ['تحمّل 160 تيرابايت فقط.', 'كتابة 3,000 MB/s وبلا DRAM.'], 'لا يناسب الكتابة الكثيفة.',
      'NV3_1', 'القرص نفسه بسعة 1 تيرابايت.', 'https://www.kingston.com/en/ssd/nv3-nvme-pcie-ssd'],
    ['Lexar', 'NM620 512GB', { type: 'NVMe M.2', capacity: '512GB', interface: 'PCIe 3.0 x4', formFactor: 'M.2 2280', readSpeed: '3300 MB/s', writeSpeed: '2400 MB/s', dramCache: 'No', tbw: '250 TB' }, 1,
      [A('B093CN3P9V'), M(ML.NM620_512)],
      'قرص NVMe من الجيل الثالث بسعة 512 جيجابايت — يناسب اللوحات القديمة أو الترقية الرخيصة.',
      ['قراءة 3,300 MB/s:[/green] أسرع بستّ مرّات من أقراص SATA.', 'ذاكرة TLC ثلاثيّة الأبعاد.'],
      ['من الجيل الثالث — أبطأ بكثير من أقراص الجيل الرابع بسعرٍ قريب.', 'بلا DRAM.'], 'لا يُنصح به لتجميعةٍ جديدة.',
      'NV3_1', 'قرص جيلٍ رابع بسعة 1 تيرابايت.', 'https://americas.lexar.com/product/lexar-nm620-m-2-2280-nvme-ssd/'],
    ['Lexar', 'NQ780 1TB', { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '6500 MB/s', writeSpeed: '2500 MB/s', dramCache: 'No', tbw: '600 TB' }, 2,
      [A('B0FPM7RZS6'), M(ML.NQ780_1)],
      'قرص Lexar الاقتصاديّ بسعة 1 تيرابايت: قراءة 6,500 ميجابايت/ث بذاكرة QLC.',
      ['قراءة 6,500 MB/s.', 'تحمّل 600 تيرابايت.'],
      ['كتابة 2,500 MB/s فقط — QLC وبلا DRAM.'], 'لا يناسب الكتابة الطويلة المستمرّة.',
      'NV3_1', 'قرص 1 تيرابايت آخر اقتصاديّ.', 'https://americas.lexar.com/product/lexar-nq780-m-2-2280-pcie-gen-4x4-nvme-ssd/'],
    ['Samsung', '990 1TB', { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7150 MB/s', writeSpeed: '6450 MB/s', dramCache: 'No', tbw: '400 TB' }, 3,
      [A('B0H3C6XHGK'), M(ML.S990_1), C('samsung-990-1tb-pcie-4-0-x4-nvme-2-0-up-to-7150mb-s-nvme-m-2-48529')],
      'قرص Samsung 990 الجديد (بلا PRO ولا EVO): قراءة 7,150 ميجابايت/ث بسعرٍ أقلّ من 990 EVO Plus.',
      ['قراءة 7,150 MB/s وكتابة 6,450 MB/s.', 'NVMe 2.0 وبرنامج Samsung Magician.'],
      ['بلا DRAM، وتحمّل 400 تيرابايت وضمان ثلاث سنوات فقط.', 'مصادر تذكر ذاكرة QLC.'], 'لا مشتّت حرارة.',
      'EVOPLUS1', 'قرص Samsung بضمان خمس سنوات وتحمّل 600 تيرابايت.', 'https://www.samsung.com/sg/memory-storage/nvme-ssd/990-1tb-nvme-pcie-gen-4-mz-v9v1t0bw/'],
    ['Crucial', 'P310 1TB Heatsink', { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7100 MB/s', writeSpeed: '6000 MB/s', dramCache: 'No', tbw: '220 TB' }, 3,
      [A('B0DQ9K7S1Q'), M(ML.P310HS1)],
      'نسخة المشتّت من Crucial P310 — جاهزةٌ للبلايستيشن 5 بقراءة 7,100 ميجابايت/ث.',
      ['قراءة 7,100 MB/s وكتابة 6,000 MB/s.', 'مشتّت حرارة مرفق:[/green] يركب في البلايستيشن 5.'],
      ['تحمّل 220 تيرابايت فقط وذاكرة QLC.'], 'بلا DRAM.',
      'P310_1', 'القرص نفسه بلا مشتّت وبسعرٍ أقلّ.', 'https://www.crucial.com/ssd/p310/ct1000p310ssd5'],
    ['Crucial', 'T700 1TB Heatsink', { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 5.0 x4', formFactor: 'M.2 2280', readSpeed: '11700 MB/s', writeSpeed: '9500 MB/s', dramCache: 'Yes', tbw: '600 TB' }, 5,
      [A('B0C3K344ZV'), M(ML.T700_1)],
      'أوّل قرص جيلٍ خامس من Crucial، بمشتّتٍ ومتحكّم Phison E26: قراءة 11,700 ميجابايت/ث.',
      ['قراءة 11,700 MB/s وكتابة 9,500 MB/s.', 'ذاكرة DRAM ومشتّت مرفق.'],
      ['يسخن كثيراً — المشتّت ضروريّ.', 'خلفه T705 وT710 الأسرع.'], 'لا فائدة ملموسة في الألعاب مقارنةً بالجيل الرابع.',
      'T705_1HS', 'خليفته T705 بقراءة 13,600 MB/s.', 'https://www.crucial.com/ssd/t700/ct1000t700ssd5'],
    ['WD', 'Black SN850P 1TB', { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7300 MB/s', writeSpeed: '6300 MB/s', dramCache: 'Yes', tbw: '600 TB' }, 4,
      [A('B0C48B3RGL'), M(ML.SN850P1), J('wd-sn850p-nvme-other-gaming-accessories-624046.html')],
      'قرص WD Black المرخّص رسمياً للبلايستيشن 5، بمشتّت حرارة — ويعمل في الأجهزة المكتبيّة أيضاً.',
      ['مرخّص رسمياً من PlayStation.', 'قراءة 7,300 MB/s وذاكرة DRAM.', 'مشتّت حرارة مرفق.'],
      ['سعره أعلى من أقراصٍ بالأداء نفسه بلا ترخيص.'], 'ليس من الجيل الخامس.',
      'PRO990HS1', 'قرص 1 تيرابايت بمشتّت للبلايستيشن 5 أيضاً.', 'https://www.sandisk.com/products/ssd/internal-ssd/wd-black-sn850p-nvme-ssd-for-ps5?sku=WDBBYV0010BNC-WRSN'],
  ].map(([brand, name, specs, perf, offers, intro, greens, yellows, red, altKey, altWhy, url]) => ({
    categoryId: STO, brand, name, tdpWattage: 0, performanceTier: perf, specs, offers,
    description: `### ${brand} ${name}

${intro}

**التقنيات الأساسية المدعومة:**

${greens.map((g) => (g.includes('[/green]') ? `[green]${g}` : `[green]${g}[/green]`)).join('\n\n')}

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

${yellows.map((y) => `* ${y}`).join('\n')}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ${red}

${alt(altKey, altWhy)}
${url}`,
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
writeFileSync(`backups/added-batch9-${stamp}.json`, JSON.stringify({ PARTS, EXTRA, movedBefore }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch9-${stamp}.json`);

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
