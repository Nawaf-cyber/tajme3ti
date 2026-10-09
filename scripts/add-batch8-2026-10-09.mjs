/**
 * ============ الدفعة الثامنة — ٥٣ قطعة من مسح مايكرولس — 2026-10-09 ============
 *
 * طلب نوّاف: «جيب مجموعة قطع ثانية… نفس الشروط»، ثم «ضيفها كلها مع عروض المتاجر الإضافية».
 *
 * المصدر: مُسحت أقسام مايكرولس كاملةً بالمتصفّح (~١٦٠٠ منتجٍ متوفّر: رام، أقراص، معالجات،
 * مبرّدات هواء وماء)، وطُرح منها ما عندنا (بالرابط ثم بالاسم)، ثم بُحث عن كلّ مرشّحٍ في أمازون
 * **برمز طرازه** وقُرئت صفحته (السعر، التوفّر، البائع، والرمز في الصفحة). ثم فُحص كازاسوق
 * وإنفيني آرك وجرير وريد زون للمتجر الثالث.
 *
 * عروضٌ إضافية:
 *   · إنفيني آرك: 9950X3D2 (4,599 متوفّر). · جرير: 990 PRO 1TB Heatsink (1,249، 43 قطعة).
 *   · كازاسوق متوفّر: TRYX Stage 360 الأبيض (٥ قطع). ونافدةٌ تُربط ليظهر سعرها حين تعود:
 *     Core Ultra 5 225، 14700KF، 14900KF، 990 EVO 2TB، AORUS Gen5 14000 1TB.
 *   · نون: ١٥ عرضاً جاهزة الروابط في b8/noon.json — نون حجب المتصفّح (Access Denied) بعد بحثٍ
 *     كثيف فلم تُقرأ أسعارها؛ تُضاف بسكربتٍ لاحق حين تُقرأ (نون سعرُه يدويّ ولا يُضاف بلا قراءة).
 *
 * ✕ لم يُربط: Vengeance RGB 6400 في كازاسوق (باركوده 840006602002 لم يُتحقَّق أنه C32 الأسود)،
 *   وFury Beast RGB 6400 في كازاسوق (لم يُعرف أهو EXPO أم XMP).
 *
 *   node scripts/add-batch8-2026-10-09.mjs           # عرض
 *   node scripts/add-batch8-2026-10-09.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const CPU = 'cmpfziqb20000x4ymfmkovawm';
const RAM = 'cmpfziqks0003x4yma730h1be';
const STO = 'cmpfziqr70005x4ym3k7uh079';
const COOL = 'cmszm2ym00000swymvd5s2yxm';

const C = (slug) => ({ store: 'cazasouq', url: `https://www.cazasouq.com/${slug}` });
const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });
const M = (slug) => ({ store: 'microless', url: `https://saudi.microless.com/product/${slug}/` });
const IA = (url) => ({ store: 'infiniarc', url });
const J = (url) => ({ store: 'jarir', url });

const ALT = {
  R7800X3D: ['AMD Ryzen 7 7800X3D', 'cmpiebdjz001g00ymhtv4lhxg'],
  R7600X: ['AMD Ryzen 5 7600X', 'cmplabz470000mwym2x95ji3y'],
  R9950X3D: ['AMD Ryzen 9 9950X3D', 'cmsqb1rq30000gwym28jxq94q'],
  R9800X3D: ['AMD Ryzen 7 9800X3D', 'cmpfzir160007x4ym7w2xdh50'],
  U225F: ['Intel Core Ultra 5 225F', 'cmsqb1sxw0008gwym42i0r04s'],
  U265F: ['Intel Core Ultra 7 265F', 'cmtjkeme00006ygym45ohh335'],
  I14700K: ['Intel Core i7-14700K', 'cmpfzir170008x4ymbxuyvrxc'],
  I14900K: ['Intel Core i9-14900K', 'cmpiebe3m001i00ymrmrw2zep'],
  I14600KF: ['Intel Core i5-14600KF', 'cmrd7ishg000904l6rvxxopne'],
  R5600: ['AMD Ryzen 5 5600', 'cmrzaf9j20009c0ymwg08kmel'],
  R7700: ['AMD Ryzen 7 7700', 'cmrd7irgy000204l6f0eofmx8'],
  FLAREX5: ['G.Skill Flare X5 DDR5 32GB 6000MHz', 'cmpiecrkg005h00ymkt3mt6pp'],
  VEN6000: ['Corsair Vengeance DDR5 32GB 6000MHz', 'cmpiebd2l001e00ym1y8bzzlv'],
  BEAST6000: ['Kingston Fury Beast DDR5 32GB 6000MHz', 'cmpiebdbz001f00ymszifpqs9'],
  BEAST64: ['Kingston Fury Beast 64GB (2x32GB) DDR5 6000MHz CL30', 'cmtjkyciz000670ymzgbqg9si'],
  CRUCIALPRO: ['Crucial Pro 32GB (2x16GB) DDR5 6000MHz CL36', 'cmuzymt7k0012wwymlkey8obj'],
  VENRGBW: ['Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30 White', 'cmsqkaln50002ugym1alavhrp'],
  PRO990_2: ['Samsung 990 PRO 2TB', 'cmpfzir17000fx4ym3tkdck9n'],
  PRO990_1: ['Samsung 990 PRO 1TB', 'cmr3fmtja000004lh77ygs5nh'],
  EVOPLUS2: ['Samsung 990 EVO Plus 2TB', 'cmr3fmuzl000a04lhss2v2014'],
  SN850X2: ['WD Black SN850X 2TB', 'cmpieb8q5000w00ym8y2x0huq'],
  NV3_4: ['Kingston NV3 4TB', 'cmuzymtts0018wwymrnkaz5tv'],
  T705_2: ['Crucial T705 2TB Gen5', 'cmr2lb59v000pjgymlxk40ry4'],
  PRO9100_1: ['Samsung 9100 PRO 1TB Gen5', 'cmsqbq6d40000pgymsq8ebx4x'],
  PRO9100_2: ['Samsung 9100 PRO 2TB Gen5', 'cmr3fmva0000c04lhzn9faxeg'],
  KC3000: ['Kingston KC3000 1TB', 'cmr3fmvkh000e04lh5ji2l8iv'],
  NM790_1: ['Lexar NM790 1TB', 'cmu4jsndl000crkymmjry2v4z'],
  NM790_4: ['Lexar NM790 4TB', 'cmpieccvi003q00ym7xkryaeb'],
  SN7100_1: ['WD Black SN7100 1TB', 'cmuzymtih0015wwymnka9ebix'],
  T500: ['Crucial T500 1TB', 'cmr3fmup4000804lhyomf5gpy'],
  PA120: ['Thermalright Peerless Assassin 120 SE ARGB', 'cmtcr2c0i0000o8ym7e5jnmft'],
  PA120W: ['Thermalright Peerless Assassin 120 SE ARGB White', 'cmtcr2cmg0003o8ymnvab7k4g'],
  PS120EVO: ['Thermalright Phantom Spirit 120 EVO', 'cmtcr2dw50009o8ym694ecx7s'],
  LT360: ['DeepCool LT360 ARGB', 'cmt05uj38000angymxap4iutv'],
  KE360W: ['NZXT Kraken Elite 360 RGB White', 'cmuztryee001kkcymzw85r224'],
  AQUA360: ['Thermalright Aqua Elite 360 V3', 'cmv0ioa0u000r0symyh8koqxe'],
  AQUA360W: ['Thermalright Aqua Elite 360 V3 White', 'cmv0ioa9t000u0sym7dt32j6r'],
  LE240: ['DeepCool LE240 V2', 'cmszmcldq0004zsymj2u94h5v'],
  FROZEN240W: ['Thermalright Frozen Notte 240 White ARGB V2', 'cmu3md8ja0005f8ymw8n6yd0u'],
  PRLX: ['be quiet! Pure Rock 3 LX', 'cmtcr2f0x000fo8ymhraec8dl'],
  KCORE360: ['NZXT Kraken Core 360 RGB', 'cmszn26jy000cw8ym0jada1sr'],
  STRIXLC3W: ['ASUS ROG Strix LC III 360 ARGB White', 'cmuzv442e0016pcym6m417hxz'],
};
const alt = (k, why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n* ${why}`;

/* عرض كازاسوق لـ14700KF (aa15093) كان مربوطاً خطأً بصفّ «Core i7-14700K» — اكتشفه فحص التكرار؛
   يُنقل إلى صفّه الصحيح بعد إنشائه (كما نُقلت A1000GS وZ890M ICE وLancool III RGB الأبيض) */
/* وكذلك عرض أمازون B0B7CKZGN6 (SN850X 2TB **with Heatsink**، والرمز WDS200T2XHE في صفحته) كان على صفّ
   «Black SN850X 2TB» العاديّ وهو عرضه الوحيد المتوفّر — فكان يعرض سعر نسخة المشتّت للنسخة العاديّة */
const MOVE = [
  { offerId: 'cmsgekbyn009qpsymb1zj0bk5', from: 'cmpfzir170008x4ymbxuyvrxc', to: 'Core i7-14700KF', brand: 'Intel', urlHas: 'intel-core-i7-14700kf-aa15093' },
  { offerId: 'cmsgekb4k009ipsymk4w0t299', from: 'cmpieb8q5000w00ym8y2x0huq', to: 'Black SN850X 2TB Heatsink', brand: 'WD', urlHas: 'B0B7CKZGN6' },
];
const EXTRA = [];

const ML = {"7500X3D":"amd-ryzen-5-7500x3d-am5-gaming-processor-6-cores-12-threads-up-to-4-5-ghz-max-boost-clock-integrated-amd-radeon-graphics-96-mb-l3-cache-pci-express-5-0-100-100001904wof","9950X3D2":"amd-ryzen-9-9950x3d2-dual-edition-am5-desktop-processor-16-cores-32-threads-up-to-5-6-ghz-max-boost-clock-integrated-amd-radeon-graphics-256-max-memory-100-100001978wof","8700F":"amd-ryzen-7-8700f-am5-cpu-processor-8-cores-16-threads-5-ghz-max-boost-clock-8mb-l2-16mb-l3-cache-zen-4-architecture-ddr5-5200-memory-includes-wraith-stealth-cooler-100-100001590box","5800X3D":"amd-ryzen-7-5800x3d-10th-anniversary-edition-desktop-processor-am4-socket-8-cores-16-threads-4-5-ghz-max-turbo-boost-96mb-cache-105w-tdp-ddr4-memory-carbice-ice-pad-100-100000651pof","U5_225":"intel-core-ultra-5-225-processor-10-cores-10-threads-4-9-ghz-max-turbo-boost-20m-cache-memory-intel-graphics-up-to-ddr5-6400-mt-s-256gb-max-memory-lga-1851-socket-bx80768225","U7_265":"intel-core-ultra-7-265-lga-1851-processor-20-cores-20-threads-30mb-cache-memory-5-3-ghz-max-turbo-frequency-integrated-intel-graphics-dual-channel-ddr5-memory-256-gb-max-memory-bx80768265","14700KF":"intel-core-i7-14700kf-3-4-ghz-20-core-lga-1700-14th-gen-processor-20-cores-28-threads-30mb-cache-memory-5-6ghz-maxturbo-boost-dual-channel-ddr5-5600-192gb-max-memory-bx8071514700kfsrn3y","14900KF":"intel-core-i9-14900kf-3-2ghz-24-core-lga-1700-14th-gen-processor-24-cores-32-threads-36mb-cache-memory-6ghz-maxturbo-frequency-dual-ch-ddr5-5600-memory-192gb-max-bx8071514900kf","13900K":"intel-core-i9-13900k-3ghz-13th-gen-lga-1700-processor-24-cores-32-threads-36mb-cache-memory-integrated-intel-uhd-770-graphics-128-gb-max-memory-5-7-ghz-max-turbo-frequency","12600KF":"intel-core-i5-12600kf-alder-lake-s-12th-gen-desktop-processor-3-70-ghz-socket-1700-10-cpu-cores-16-threads-for-multitasking-bx8071512600kf","VEN6400":"corsair-vengeance-32gb-2x-16gb-ddr5-dram-desktop-memory-6400-mhz-tested-speed-cl32-latency-amd-expo-intel-xmp-compatible-288-pin-grey-cmk32gx5m2b6400z32","VENRGB6400":"corsair-vengeance-rgb-32gb-2x16gb-ddr5-desktop-memory-kit-6400mhz-memory-speed-c32-cas-latency-intel-xmp-3-0-1-40v-memory-voltage-288-pin-dynamic-multi-zone-rgb-black-cmh32gx5m2b6400c32","M5RGB":"g-skill-ripjaws-m5-rgb-series-32gb-2x16gb-ddr5-dual-channel-desktop-memory-6000-mt-s-memory-speed-cl36-36-36-96-latency-1-35v-voltage-intel-xmp-3-0-black-f5-6000j3636f16gx2-rm5rk","TZ5RW":"g-skill-trident-z5-rgb-series-64gb-2x32gb-ddr5-dual-channel-desktop-memory-kit-6000-mt-s-memory-speed-cl36-36-36-96-latency-1-35v-intel-xmp-3-0-amd-expo-white-f5-6000j3636f32gx2-tz5rw","BEAST6400":"kingston-fury-beast-rgb-32gb-2x-16gb-ddr5-desktop-memory-kit-6400mt-s-memory-speed-cl32-cas-latency-288-pin-kit-intel-xmp-3-0-amd-expo-profile-black-kf564c32bbeak2-32","REN7200":"kingston-fury-renegade-32gb-2x-16gb-ddr5-desktop-memory-7200mt-s-memory-speed-cl38-cas-latency-1-45-voltage-288-pins-intel-xmp-3-0-certified-kf572c38rsk2-32","THOROC":"lexar-thor-oc-ddr5-desktop-memory-32gb-2x16gb-capacity-6000-mt-s-memory-speed-cl38-cas-latency-intel-xmp-3-0-amd-expo-profiles-black-ld5u16g60c38lg-rgd","ARES6400":"lexar-ares-rgb-ddr5-desktop-memory-32gb-2x-16gb-capacity-6400-mhz-memory-speed-cl32-cas-latency-1-4-voltage-288-pin-support-intel-xmp-3-0-amd-expo-ld5eu016g-r6400gdla","T710_2":"crucial-t710-internal-ssd-with-heatsink-2tb-capacity-m-2-2280-form-factor-nvme-pcie-gen-5-x4-interface-13800-mb-s-sequential-write-14500-mb-s-sequential-read-ct2000t710ssd5","T705_1":"crucial-t705-nvme-internal-ssd-with-heatsink-1tb-capacity-pcie-gen-5-x4-interface-m-2-2280-form-factor-up-to-10-200-mb-s-sequential-write-13-600-mb-s-read-speed-600-tbw-black-ct1000t705ssd5","P510":"crucial-p510-pcie-gen5-nvme-m-2-internal-ssd-1tb-capacity-up-to-11-000-mb-s-sequential-read-9-500-mb-s-sequential-write-600tbw-endurance-ct1000p510ssd8","990PROHS2":"samsung-990-pro-with-heatsink-2-tb-nvme-2-0-m-2-2280-internal-ssd-7450-mb-s-sequential-read-speed-6900-mb-s-sequential-write-speed-3-3-voltage-v-nand-3-bit-mlc-black-mz-v9p2t0cw","990PROHS1":"samsung-990-pro-with-heatsink-1-tb-nvme-2-0-m-2-2280-internal-ssd-7450-mb-s-sequential-read-speed-6900-mb-s-sequential-write-speed-3-3-voltage-v-nand-3-bit-mlc-black-mz-v9p1t0cw","990EVO2":"samsung-2tb-990-evo-pcie-4-0-x4-5-0-x2-m-2-internal-ssd-sequential-writes-up-to-4200-mb-s-reads-up-to-5000-mb-s-v-nand-flash-technology-600tb-tbw-aes-256-bit-encryption-black-mz-v9e2t0bw","SN850XHS2":"western-digital-2-tb-black-sn850x-nvme-pcie-4-0-internal-ssd-with-heatsink-up-to-7300-mb-s-sequential-read-6600-mb-s-write-speeds-m-2-2280-1-75-million-hours-mttf-12000tb-endurance-wds200t2xhe","SN7100_4":"sandisk-wd_black-sn7100-internal-ssd-4tb-capacity-m-2-2280-form-factor-7000mb-s-sequential-read-6700mb-s-sequential-write-pcie-gen-4-0-interface-black-wds400t4x0e","SN5100":"sandisk-wd-blue-sn5100-internal-solid-state-drive-1tb-capacity-7100mb-s-read-6700mb-s-write-sequential-speed-pcie-gen-4-0-m-2-2280-form-factor-blue-wds100t5b0e","RENEGADE1":"kingston-fury-renegade-1-tb-pcie-4-0-nvme-internal-ssd-with-heatsink-read-write-speeds-up-to-7-300-6-000mb-s-3d-tlc-nand-slim-m-2-2280-form-factor-ps5-ready-black-sfyrsk-1000g","AORUS1":"gigabyte-aorus-gen5-14000-internal-ssd-1tb-capacity-pci-express-5-0x4-nvme-2-0-interface-m-2-2280-form-factor-up-to-13-600-mb-s-sequential-read-up-to-10-200-mb-s-sequential-write-ag514k1tb","NQ790_1":"lexar-nq790-internal-ssd-1tb-capacity-pcie-gen4-x4-interface-m-2-2280-form-factor-up-to-7000-mb-s-sequential-read-up-to-6000-mb-s-sequential-write-lnq790x001t-rnnng","NQ790_4":"lexar-nq790-internal-ssd-4tb-capacity-pcie-gen4-x4-interface-m-2-2280-form-factor-up-to-7000-mb-s-sequential-read-up-to-6000-mb-s-sequential-write-lnq790x004t-rnnng","NQ780_2":"lexar-nq780-pcie-gen-4-4-nvme-ssd-2tb-capacity-m-2-2280-form-factor-read-up-to-7000mb-s-write-up-to-5000mb-s-1200tbw-endurance-1-5m-hours-mtbf-lnq780x002t-rnnng","SDX1":"sandisk-extreme-m-2-nvme-pcie-4-0-m-2-internal-ssd-1tb-storage-capacity-4-0-technology-pcie-4-0-x4-interface-m-2-2280-form-factor-sdssdx3n-1t00-g26","D15G2":"noctua-nh-d15-g2-cpu-coolers-2x-nf-a14x25r-g2-pwm-fans-8-heatpipes-1500-rpm-fan-speed-91-58-cfm-airflow-copper-pipes-aluminum-fins-soldered-joints-nickel-plating-nh-d15-g2","D15G2CH":"noctua-nh-d15-g2-chromax-cpu-coolers-2x-nf-a14x25r-g2-fans-8-heatpipes-1500-rpm-fan-speed-91-58-cfm-airflow-copper-pipes-aluminum-fins-soldered-joint-nickel-plating-black-nh-d15-g2-ch-bk","D15CH":"noctua-nh-d15-cpu-air-cooler-premium-dual-tower-cooling-2x-nf-a15-140mm-pwm-fans-6-heatpipes-heatsink-ultra-quiet-operation-am5-am4-intel-lga1851-lga1700-compatible-black-nh-d15-ch-bk","U12A":"noctua-nh-u12a-cpu-cooler-premium-dual-120mm-nf-a12x25-pwm-fans-158mm-high-performance-tower-cooler-7-heatpipes-2000-rpm-quiet-cooling-intel-amd-compatible-169-nspr-brown-nh-u12a","U12SCH":"noctua-nh-u12s-cpu-cooler-premium-120mm-slim-tower-air-cooler-nf-f12-pwm-fan-158mm-height-intel-amd-support-black-edition-5-heatpipes-chromax-black-nh-u12s-ch-bk","H212":"cooler-master-hyper-212-3dhp-legendary-cooling-fan-profiles-non-led-fan-speed-2050-rpm-fan-airflow-107-2-fan-noise-level-22-6-dba-loop-dynamic-bearing-black-may-t2hp-217pk-r1","H622W":"cooler-master-hyper-622-halo-cpu-cooler-dual-redesigned-halo-fan-2050-rpm-fan-speed-51-88-cfm-airflow-rifle-bearing-fan-type-6-heat-pipes-dual-tower-heat-sink-white-rr-d6ww-20pa-r1","PR3":"be-quiet-pure-rock-3-cpu-cooler-120mm-pure-wings-3-fan-2000-rpm-fan-speed-59-6-cfm-airflow-rifle-bearing-technology-4-high-performance-6mm-heat-pipes-with-hdt-technology-black-bk039","DRE":"be-quiet-dark-rock-elite-air-cpu-cooler-2x-silent-wings-135mm-pwm-fans-speed-switch-with-2-modes-high-performance-heat-pipes-front-fan-rail-system-enhanced-ram-compatibility-black-bk037","T120B":"nzxt-t120-rgb-cpu-air-cooler-with-rgb-4-conductive-copper-heat-pipes-120mm-f120-rgb-fan-27-5dba-noise-4-pin-pwm-connector-suits-lga1700-115x-1200-am5-am4-black","TURRIS_K":"tryx-turris-620-dual-tower-air-cpu-cooler-5-ips-display-280w-tdp-high-performance-cooling-66-32-cfm-quiet-fans-intel-lga1851-1700-amd-am5-am4-compatible-black-h-t620n-dm2m-g0k","TURRIS_W":"tryx-turris-620-dual-tower-air-cpu-cooler-5-ips-display-280w-tdp-high-performance-cooling-66-32-cfm-quiet-fans-intel-lga1851-1700-amd-am5-am4-compatible-white-h-t620n-dm2m-g0w","RYUO4":"asus-rog-ryuo-iv-360-argb-liquid-cpu-cooler-6-67-amoled-display-360mm-radiator-3x-rog-ryuo-iv-mf-12c-argb-pre-installed-fan-2000-rpm-fan-speed-56-66-cfm-airflow-black-90rc01n1-b0eay0","RAD360_B":"fractal-radius-360-rgb-aio-liquid-cpu-cooler-360mm-radiator-3x-dynamic-3-12-rgb-fans-2200-rpm-63-9-cfm-airflow-2-1-mmh2o-static-pressure-31-9-dba-noise-level-black-fd-w-ra1-3602","RAD360_W":"fractal-radius-360-rgb-aio-liquid-cpu-cooler-360mm-radiator-3x-dynamic-3-12-rgb-fans-2200-rpm-63-9-cfm-airflow-2-1-mmh2o-static-pressure-31-9-dba-noise-level-white-fd-w-ra1-3603","E360B":"msi-mag-coreliquid-e360-liquid-cpu-cooler-360mm-radiator-3x-fans-included-75-04-cfm-fan-airflow-3000-rpm-pump-speed-fluid-dynamic-bearing-black-306-7zw6e17-c24","STAGE_W":"tryx-stage-360-argb-360mm-aio-liquid-cpu-cooler-dual-4-inch-ips-display-asetek-7th-gen-v2-pump-280w-tdp-65-64-cfm-high-airflow-argb-gaming-cooler-white-l-s360a-dm3m-g0w","GG240":"gigabyte-gaming-240-cpu-cooler-2x-120mm-argb-fan-2200-rpm-fan-speed-61-61-cfm-fan-airflow-2-ball-bearing-type-aluminum-radiator-copper-block-black-gp-gigabyte-gme-240","GG240I":"gigabyte-gaming-240-ice-cpu-cooler-2x-120mm-argb-fan-2200-rpm-fan-speed-61-61-cfm-fan-airflow-2-ball-bearing-type-aluminum-radiator-copper-block-white-gp-gigabyte-gme-240i","KE420W":"nzxt-kraken-elite-420-rgb-420mm-all-in-one-liquid-cpu-cooler-with-2-36-customizable-lcd-display-rgb-fans-and-cam-software-integration-white-rl-kr42e-w2"};

const PARTS = [
  // ================================================================ المعالجات
  {
    categoryId: CPU, brand: 'AMD', name: 'Ryzen 5 7500X3D', tdpWattage: 88, performanceTier: 4,
    specs: { tdpW: 65, cores: '6', threads: '12', socket: 'AM5', l3Cache: '96MB', baseClock: '4.0 GHz', boostClock: '4.5 GHz', architecture: 'Zen 4', memorySupport: 'DDR5-5200', includedCooler: 'None', integratedGraphics: 'Radeon Graphics' },
    offers: [A('B0FT8X951Z'), M(ML['7500X3D'])],
    description: `### AMD Ryzen 5 7500X3D

أرخص معالجٍ بذاكرة 3D V-Cache على منصّة AM5: ست أنوية مع 96 ميجابايت كاش — للألعاب أوّلاً بسعر الفئة المتوسّطة.

**التقنيات الأساسية المدعومة:**

[green]ذاكرة 3D V-Cache بسعة 96 ميجابايت:[/green] ترفع أداء الألعاب فوق معالجاتٍ أعلى تردّداً بلا كاش مكدّس.

[green]استهلاك 65 واط:[/green] يكفيه مبرّد هوائيّ متوسّط.

[green]منصّة AM5 بذاكرة DDR5:[/green] تقبل ترقية المعالج لاحقاً على اللوحة نفسها.

[green]رسوميات Radeon مدمجة:[/green] تشغّل الجهاز مؤقّتاً حتى يصل الكرت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ست أنوية فقط — أقلّ من غيره في المونتاج والتصميم ومهامّ التعدّد.
* تردّده حتى 4.5 جيجاهرتز — أدنى من 7600X في البرامج التي لا تستفيد من الكاش.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مبرّد في العلبة.

${alt('R7800X3D', 'ثمانية أنوية بالكاش نفسه وأداء ألعابٍ أعلى.')}
https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7500x3d.html`,
  },
  {
    categoryId: CPU, brand: 'AMD', name: 'Ryzen 9 9950X3D2', tdpWattage: 270, performanceTier: 5,
    specs: { tdpW: 200, cores: '16', threads: '32', socket: 'AM5', l3Cache: '192MB', baseClock: '4.3 GHz', boostClock: '5.6 GHz', architecture: 'Zen 5', memorySupport: 'DDR5-5600', includedCooler: 'None', integratedGraphics: 'Radeon Graphics' },
    offers: [A('B0GTRTJSNZ'), M(ML['9950X3D2']), IA('https://www.infiniarc.com/shop/cpu/100-100001978wof-amd-ryzen-9-9950x3d2-am5-dual-edition-desktop-processor-14857')],
    description: `### AMD Ryzen 9 9950X3D2 Dual Edition

أوّل معالجٍ مكتبيّ بذاكرة 3D V-Cache على شريحتيه الاثنتين: 16 نواة و192 ميجابايت L3 — للمونتاج الثقيل والألعاب معاً بلا تنازل.

**التقنيات الأساسية المدعومة:**

[green]3D V-Cache على الشريحتين:[/green] كلّ الأنوية الست عشرة تستفيد من الكاش، لا نصفها كما في 9950X3D.

[green]16 نواة و32 مساراً:[/green] الأعلى في تطبيقات التعدّد بين معالجات AM5.

[green]تردّد حتى 5.6 جيجاهرتز:[/green] بمعمارية Zen 5.

[green]يقبل كسر السرعة:[/green] ورسوميات Radeon مدمجة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* استهلاك 200 واط افتراضياً — يحتاج مبرّداً مائيّاً 360 مم ومزوّداً قويّاً.
* في الألعاب وحدها لا يتفوّق على 9800X3D بثمانية أنوية، وسعره قرابة ضعفه.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مبرّد في العلبة.

${alt('R9950X3D', 'الأنوية نفسها بكاشٍ مكدّس على شريحةٍ واحدة وسعرٍ أقلّ.')}
https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x3d2-dual-edition.html`,
  },
  {
    categoryId: CPU, brand: 'AMD', name: 'Ryzen 7 8700F', tdpWattage: 88, performanceTier: 3,
    specs: { tdpW: 65, cores: '8', threads: '16', socket: 'AM5', l3Cache: '16MB', baseClock: '4.1 GHz', boostClock: '5.0 GHz', architecture: 'Zen 4', memorySupport: 'DDR5-5200', includedCooler: 'Wraith Stealth', integratedGraphics: 'None' },
    offers: [A('B0D2JCMP34'), M(ML['8700F'])],
    description: `### AMD Ryzen 7 8700F

ثمانية أنوية Zen 4 على AM5 بسعرٍ منخفض ومعه مبرّد — مدخلٌ رخيص إلى منصّة AMD الحديثة.

**التقنيات الأساسية المدعومة:**

[green]ثمانية أنوية و16 مساراً:[/green] تكفي الألعاب والمونتاج الخفيف.

[green]مبرّد Wraith Stealth في العلبة:[/green] لا حاجة لشراء مبرّدٍ مع الاستخدام العاديّ.

[green]استهلاك 65 واط:[/green] حرارةٌ منخفضة ومزوّدٌ متواضع يكفي.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* كاش L3 بسعة 16 ميجابايت فقط (نصف 7700) — أبطأ منه في الألعاب.
* يدعم PCIe 4.0 لا 5.0 للكرت والأقراص.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رسوميات مدمجة — يلزمه كرت شاشة.

${alt('R7700', 'ثمانية أنوية بكاش 32 ميجابايت ودعم PCIe 5.0.')}
https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-7-8700f.html`,
  },
  {
    categoryId: CPU, brand: 'AMD', name: 'Ryzen 7 5800X3D', tdpWattage: 142, performanceTier: 4,
    specs: { tdpW: 105, cores: '8', threads: '16', socket: 'AM4', l3Cache: '96MB', baseClock: '3.4 GHz', boostClock: '4.5 GHz', architecture: 'Zen 3', memorySupport: 'DDR4-3200', includedCooler: 'None', integratedGraphics: 'None' },
    offers: [A('B0H41D4KFT'), M(ML['5800X3D'])],
    description: `### AMD Ryzen 7 5800X3D

إصدار الذكرى العاشرة لمنصّة AM4 من أشهر معالج ألعاب لها: ثمانية أنوية و96 ميجابايت كاش، ومعه وسادة حراريّة Carbice — أقوى ترقيةٍ لمن عنده لوحة AM4.

**التقنيات الأساسية المدعومة:**

[green]ذاكرة 3D V-Cache بسعة 96 ميجابايت:[/green] أداء ألعابٍ يقارب معالجات DDR5 الأحدث.

[green]يركب على لوحات AM4 القديمة:[/green] B450 وB550 وX570 بعد تحديث البايوس، مع رام DDR4 الموجودة.

[green]وسادة Carbice Ice Pad مرفقة:[/green] بدل المعجون الحراريّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* منصّة AM4 منتهية — لا ترقية بعده على اللوحة نفسها.
* أبطأ في المونتاج وتطبيقات النواة الواحدة من معالجات Zen 4 وZen 5.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدعم DDR5 ولا PCIe 5.0، ولا رسوميات مدمجة ولا مبرّد.

${alt('R7800X3D', 'خليفته على AM5 بأداء ألعابٍ أعلى ومنصّةٍ مستمرّة.')}
https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-7-5800x3d.html`,
  },
  {
    categoryId: CPU, brand: 'Intel', name: 'Core Ultra 5 225', tdpWattage: 121, performanceTier: 3,
    specs: { tdpW: 65, cores: '10', pCores: 6, eCores: 4, threads: '10', socket: 'LGA1851', l3Cache: '20MB', baseClock: '3.3 GHz', boostClock: '4.9 GHz', architecture: 'Arrow Lake', memorySupport: 'DDR5-6400', includedCooler: 'Laminar RM2', integratedGraphics: 'Intel Graphics' },
    offers: [A('B0DTRYXZFJ'), M(ML.U5_225), C('intel-core-ultra5-225')],
    description: `### Intel Core Ultra 5 225

معالج إنتل الاقتصاديّ على منصّة LGA1851: عشرة أنوية (6 أداء + 4 كفاءة)، ورسوميات مدمجة، ومبرّد في العلبة.

**التقنيات الأساسية المدعومة:**

[green]عشرة أنوية بتردّدٍ حتى 4.9 جيجاهرتز:[/green] تكفي الألعاب والعمل المكتبيّ.

[green]رسوميات Intel Graphics مدمجة:[/green] تشغّل الجهاز بلا كرت، وتفيد في ترميز الفيديو.

[green]ذاكرة DDR5 حتى 6400:[/green] ومنصّةٌ حديثة بـ PCIe 5.0.

[green]مبرّد في العلبة واستهلاك أساسيّ 65 واط.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* لا Hyper-Threading — عشرة أنوية بعشرة مسارات فقط.
* غير مفتوح لكسر السرعة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدعم DDR4.

${alt('U225F', 'المعالج نفسه بلا رسوميات مدمجة وبسعرٍ أقلّ عادةً.')}
https://www.intel.com/content/www/us/en/products/sku/241070/intel-core-ultra-5-processor-225-20m-cache-up-to-4-90-ghz/specifications.html`,
  },
  {
    categoryId: CPU, brand: 'Intel', name: 'Core Ultra 7 265', tdpWattage: 182, performanceTier: 4,
    specs: { tdpW: 65, cores: '20', pCores: 8, eCores: 12, threads: '20', socket: 'LGA1851', l3Cache: '30MB', baseClock: '2.4 GHz', boostClock: '5.3 GHz', architecture: 'Arrow Lake', memorySupport: 'DDR5-6400', includedCooler: 'Laminar RM2', integratedGraphics: 'Intel Graphics' },
    offers: [A('B0DTRYQ6B1'), M(ML.U7_265)],
    description: `### Intel Core Ultra 7 265

عشرون نواة (8 أداء + 12 كفاءة) على LGA1851 مع رسوميات مدمجة ومبرّد — قويّ في المونتاج والتعدّد باستهلاكٍ أساسيّ 65 واط.

**التقنيات الأساسية المدعومة:**

[green]عشرون نواة:[/green] أداءٌ عالٍ في المونتاج والتصميم وضغط الملفّات.

[green]رسوميات Intel Graphics بأربع أنوية Xe:[/green] وترميز AV1 للفيديو.

[green]ذاكرة DDR5 حتى 6400 وPCIe 5.0 وThunderbolt 4.[/green]

[green]مبرّد في العلبة:[/green] للاستخدام العاديّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* يسحب حتى 182 واط تحت الحمل الطويل — مبرّد العلبة لا يكفيه حينها.
* في الألعاب أبطأ من معالجات X3D بسعرٍ قريب.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* غير مفتوح لكسر السرعة، ولا يدعم DDR4.

${alt('U265F', 'المعالج نفسه بلا رسوميات مدمجة.')}
https://www.intel.com/content/www/us/en/products/sku/241068/intel-core-ultra-7-processor-265-30m-cache-up-to-5-30-ghz/specifications.html`,
  },
  {
    categoryId: CPU, brand: 'Intel', name: 'Core i7-14700KF', tdpWattage: 253, performanceTier: 5,
    specs: { tdpW: 125, cores: '20', pCores: 8, eCores: 12, threads: '28', socket: 'LGA1700', l3Cache: '33MB', baseClock: '3.4 GHz', boostClock: '5.6 GHz', architecture: 'Raptor Lake Refresh', memorySupport: 'DDR5-5600 / DDR4-3200', includedCooler: 'None', integratedGraphics: 'None' },
    offers: [A('B0CGJC178L'), M(ML['14700KF'])],
    description: `### Intel Core i7-14700KF

نسخة 14700K بلا رسوميات مدمجة: عشرون نواة و28 مساراً بتردّدٍ حتى 5.6 جيجاهرتز — أداءٌ عالٍ في الألعاب والمونتاج على منصّة LGA1700.

**التقنيات الأساسية المدعومة:**

[green]عشرون نواة (8 أداء + 12 كفاءة):[/green] 28 مساراً للتعدّد.

[green]مفتوح لكسر السرعة:[/green] على لوحات Z790 وZ690.

[green]يدعم DDR5 وDDR4 معاً:[/green] بحسب اللوحة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* يسحب حتى 253 واط — يحتاج مبرّداً مائيّاً 360 مم أو هوائيّاً مزدوجاً قويّاً.
* منصّة LGA1700 منتهية — لا معالجات جديدة لها. وحدّث البايوس لمعالجة مشكلة استقرار الجيلين 13 و14.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رسوميات مدمجة ولا مبرّد في العلبة.

${alt('I14700K', 'الشريحة نفسها مع رسوميات UHD 770 المدمجة.')}
https://www.intel.com/content/www/us/en/products/sku/236789/intel-core-i7-processor-14700kf-33m-cache-up-to-5-60-ghz/specifications.html`,
  },
  {
    categoryId: CPU, brand: 'Intel', name: 'Core i9-14900KF', tdpWattage: 253, performanceTier: 5,
    specs: { tdpW: 125, cores: '24', pCores: 8, eCores: 16, threads: '32', socket: 'LGA1700', l3Cache: '36MB', baseClock: '3.2 GHz', boostClock: '6.0 GHz', architecture: 'Raptor Lake Refresh', memorySupport: 'DDR5-5600 / DDR4-3200', includedCooler: 'None', integratedGraphics: 'None' },
    offers: [A('B0CGJDBCTK'), M(ML['14900KF']), C('intel-core-i9-14900kf-aa15153')],
    description: `### Intel Core i9-14900KF

أعلى معالجات LGA1700 بلا رسوميات مدمجة: 24 نواة و32 مساراً بتردّدٍ يصل إلى 6.0 جيجاهرتز.

**التقنيات الأساسية المدعومة:**

[green]24 نواة (8 أداء + 16 كفاءة):[/green] للمونتاج والبثّ والعمل الثقيل.

[green]تردّد حتى 6.0 جيجاهرتز:[/green] من أعلى أداء النواة الواحدة.

[green]مفتوح لكسر السرعة، ويدعم DDR5 وDDR4.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* يسحب حتى 253 واط ويسخن كثيراً — مبرّد مائيّ 360 مم كحدٍّ أدنى.
* منصّة منتهية، وحدّث البايوس لمعالجة مشكلة استقرار الجيلين 13 و14.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رسوميات مدمجة ولا مبرّد في العلبة.

${alt('I14900K', 'الشريحة نفسها مع رسوميات مدمجة.')}
https://www.intel.com/content/www/us/en/products/sku/236787/intel-core-i9-processor-14900kf-36m-cache-up-to-6-00-ghz/specifications.html`,
  },
  {
    categoryId: CPU, brand: 'Intel', name: 'Core i9-13900K', tdpWattage: 253, performanceTier: 5,
    specs: { tdpW: 125, cores: '24', pCores: 8, eCores: 16, threads: '32', socket: 'LGA1700', l3Cache: '36MB', baseClock: '3.0 GHz', boostClock: '5.8 GHz', architecture: 'Raptor Lake', memorySupport: 'DDR5-5600 / DDR4-3200', includedCooler: 'None', integratedGraphics: 'Intel UHD Graphics 770' },
    offers: [A('B0BCF54SR1'), M(ML['13900K'])],
    description: `### Intel Core i9-13900K

معالج إنتل الأعلى من الجيل الثالث عشر: 24 نواة و32 مساراً بتردّدٍ حتى 5.8 جيجاهرتز ورسوميات UHD 770.

**التقنيات الأساسية المدعومة:**

[green]24 نواة (8 أداء + 16 كفاءة):[/green] أداءٌ عالٍ في التعدّد.

[green]رسوميات UHD 770 مدمجة:[/green] تشغّل الجهاز بلا كرت.

[green]مفتوح لكسر السرعة، ويدعم DDR5 وDDR4.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 14900K خليفته بالأنوية نفسها وتردّدٍ أعلى وسعرٍ قريب غالباً.
* يسحب حتى 253 واط، وحدّث البايوس لمعالجة مشكلة استقرار الجيلين 13 و14.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مبرّد في العلبة.

${alt('I14900K', 'الأنوية نفسها بتردّدٍ يصل 6.0 جيجاهرتز.')}
https://www.intel.com/content/www/us/en/products/sku/230496/intel-core-i913900k-processor-36m-cache-up-to-5-80-ghz/specifications.html`,
  },
  {
    categoryId: CPU, brand: 'Intel', name: 'Core i5-12600KF', tdpWattage: 150, performanceTier: 3,
    specs: { tdpW: 125, cores: '10', pCores: 6, eCores: 4, threads: '16', socket: 'LGA1700', l3Cache: '20MB', baseClock: '3.7 GHz', boostClock: '4.9 GHz', architecture: 'Alder Lake', memorySupport: 'DDR5-4800 / DDR4-3200', includedCooler: 'None', integratedGraphics: 'None' },
    offers: [A('B09FXFJW2F'), M(ML['12600KF'])],
    description: `### Intel Core i5-12600KF

معالج ألعاب من الجيل الثاني عشر: عشرة أنوية و16 مساراً، مفتوح لكسر السرعة، ويعمل مع DDR4 لتقليل كلفة التجميعة.

**التقنيات الأساسية المدعومة:**

[green]عشرة أنوية (6 أداء + 4 كفاءة):[/green] تكفي الألعاب بكروت الفئة المتوسّطة.

[green]يدعم DDR4 وDDR5:[/green] لوحة DDR4 رخيصة تكفيه.

[green]مفتوح لكسر السرعة:[/green] على لوحات Z690 وZ790.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* أقدم من 14600KF وأبطأ منه بفارقٍ ملحوظ في التعدّد.
* منصّة LGA1700 منتهية.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رسوميات مدمجة ولا مبرّد في العلبة.

${alt('I14600KF', 'الجيل الأحدث بأربعة عشر نواة وأداءٍ أعلى.')}
https://www.intel.com/content/www/us/en/products/sku/134590/intel-core-i512600kf-processor-20m-cache-up-to-4-90-ghz/specifications.html`,
  },

  // ================================================================ الرام
  {
    categoryId: RAM, brand: 'Corsair', name: 'Vengeance 32GB (2x16GB) DDR5 6400MHz CL32', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '6400', casLatency: 'CL32', profile: 'XMP 3.0 & EXPO', rgb: 'No', heightMm: '35', color: 'Grey' },
    offers: [A('B0DF2D3XSB'), M(ML.VEN6400)],
    description: `### Corsair Vengeance 32GB (2x16GB) DDR5 6400MHz CL32

طقم Vengeance منخفض الارتفاع بالرماديّ: 6400 بتوقيت CL32 وبملفّي XMP وEXPO معاً.

**التقنيات الأساسية المدعومة:**

[green]6400 MT/s بتوقيت CL32:[/green] أسرع من أطقم 6000 الشائعة.

[green]ملفّا XMP 3.0 وEXPO:[/green] يعمل على لوحات Intel وAMD.

[green]ارتفاع 35 مم:[/green] لا يتعارض مع المبرّدات الهوائيّة الكبيرة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* معالجات AMD تعمل أفضل عند 6000 — فرق 6400 عليها ضئيل وقد يحتاج ضبطاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB.

${alt('VEN6000', 'الطقم نفسه بسرعة 6000 الأنسب لمعالجات AMD.')}
https://www.corsair.com/us/en/p/memory/cmk32gx5m2b6400z32/vengeance-32gb-2x16gb-ddr5-dram-6400mts-cl32-amd-expo-intel-xmp-memory-kit-cmk32gx5m2b6400z32`,
  },
  {
    categoryId: RAM, brand: 'Corsair', name: 'Vengeance RGB 32GB (2x16GB) DDR5 6400MHz CL32', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '6400', casLatency: 'CL32', profile: 'XMP 3.0', rgb: 'Yes', heightMm: '44', color: 'Black' },
    offers: [A('B0BPL82FD9'), M(ML.VENRGB6400)],
    description: `### Corsair Vengeance RGB 32GB (2x16GB) DDR5 6400MHz CL32

طقم Vengeance RGB الأسود بسرعة 6400 وتوقيت CL32، بإضاءةٍ متعدّدة المناطق — مضبوطٌ لمنصّات Intel.

**التقنيات الأساسية المدعومة:**

[green]6400 MT/s بتوقيت CL32:[/green] سرعةٌ عالية لمعالجات Intel.

[green]إضاءة RGB بعشر مناطق:[/green] تُدار ببرنامج iCUE.

[green]منظّم جهدٍ لكسر السرعة (PMIC):[/green] على الطقم نفسه.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ملفّ XMP فقط — على لوحات AMD يحتاج ضبطاً يدويّاً، والنسخة Z32 (EXPO) أنسب لها.
* ارتفاعه 44 مم — راجع ارتفاع الرام المسموح في المبرّد الهوائيّ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا ملفّ EXPO.

${alt('VENRGBW', 'طقم Vengeance RGB أبيض بسرعة 6000 CL30 وملفّ EXPO.')}
https://www.corsair.com/us/en/p/memory/cmh32gx5m2b6400c32/vengeance-rgb-32gb-2x16gb-ddr5-dram-6400mhz-c32-memory-kit-black`,
  },
  {
    categoryId: RAM, brand: 'G.Skill', name: 'Ripjaws M5 RGB 32GB (2x16GB) DDR5 6000MHz CL36', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '6000', casLatency: 'CL36', profile: 'XMP 3.0', rgb: 'Yes', color: 'Black' },
    offers: [A('B0DN5SD5LN'), M(ML.M5RGB)],
    description: `### G.Skill Ripjaws M5 RGB 32GB (2x16GB) DDR5 6000MHz CL36

سلسلة G.Skill الأحدث ذات الإضاءة بسعرٍ متوسّط: 6000 بتوقيت CL36 ومشتّت ألمنيوم أسود مطفأ.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت CL36:[/green] السرعة الشائعة للمنصّتين.

[green]إضاءة RGB:[/green] تتزامن مع برامج ASUS وMSI وGigabyte وASRock.

[green]ضمان مدى الحياة من G.Skill.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيت CL36 — أبطأ قليلاً من أطقم CL30 بالسرعة نفسها.
* هذه نسخة XMP — لمعالجات AMD نسخة Ripjaws M5 Neo بملفّ EXPO.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب كسر السرعة المتقدّم.

${alt('FLAREX5', 'طقم 6000 بتوقيت CL28 أسرع، بملفّ EXPO لمعالجات AMD.')}
https://www.gskill.com/product/165/421/1725420239/F5-6000J3636F16GX2-RM5RK`,
  },
  {
    categoryId: RAM, brand: 'G.Skill', name: 'Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz CL36 White', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'DDR5', capacity: '64GB', kit: '2x32GB', speed: '6000', casLatency: 'CL36', profile: 'XMP 3.0 & EXPO', rgb: 'Yes', heightMm: '44', color: 'White' },
    offers: [A('B0CBLBRY6Q'), M(ML.TZ5RW)],
    description: `### G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz CL36 White

طقم 64 جيجابايت بالأبيض المطفأ من سلسلة Trident Z5 RGB — سعةٌ كبيرة للمونتاج والبرامج الثقيلة بإضاءةٍ مميّزة.

**التقنيات الأساسية المدعومة:**

[green]64 جيجابايت بشريحتين:[/green] تترك منفذين فارغين للترقية.

[green]6000 MT/s بتوقيت CL36:[/green] مع ملفّي XMP 3.0 وEXPO.

[green]تصميم Trident Z5 بإضاءة RGB:[/green] مشتّت ألمنيوم أبيض مطفأ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 64 جيجابايت تزيد عن حاجة الألعاب وحدها — الفائدة في المونتاج والتصميم.
* ارتفاعه 44 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس الأسرع توقيتاً — توجد أطقم 6000 CL30 بالسعة نفسها.

${alt('BEAST64', 'طقم 64 جيجابايت 6000 بتوقيت CL30 أسرع.')}
https://www.gskill.com/product/165/374/1688607621/F5-6000J3636F32GX2-TZ5RW`,
  },
  {
    categoryId: RAM, brand: 'Kingston', name: 'Fury Beast RGB 32GB (2x16GB) DDR5 6400MHz CL32', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '6400', casLatency: 'CL32', profile: 'EXPO', rgb: 'Yes', heightMm: '42', color: 'Black' },
    offers: [A('B0CYM25PSL'), M(ML.BEAST6400)],
    description: `### Kingston Fury Beast RGB 32GB (2x16GB) DDR5 6400MHz CL32

طقم Fury Beast RGB الأسود بسرعة 6400 وتوقيت CL32 — نسخة EXPO المعتمدة لمنصّات AMD.

**التقنيات الأساسية المدعومة:**

[green]6400 MT/s بتوقيت CL32:[/green] من أسرع الأطقم في فئته.

[green]ملفّ AMD EXPO:[/green] معتمدٌ لمعالجات Ryzen 7000 و9000.

[green]إضاءة RGB:[/green] ببرنامج Kingston FURY CTRL.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* معالجات Ryzen تعمل أفضل عند 6000 — 6400 قد لا تستقرّ على كلّ معالج.
* سعره أعلى من أطقم 6000 بفارقٍ لا يقابله فرقٌ كبير في الألعاب.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* نسخة EXPO — على لوحات Intel تعمل لكن بلا ملفّ XMP معتمد.

${alt('BEAST6000', 'طقم Fury Beast بسرعة 6000 وسعرٍ أقلّ.')}
https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-rgb-memory`,
  },
  {
    categoryId: RAM, brand: 'Kingston', name: 'Fury Renegade 32GB (2x16GB) DDR5 7200MHz CL38', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '7200', casLatency: 'CL38', profile: 'XMP 3.0', rgb: 'No', heightMm: '39', color: 'Silver' },
    offers: [A('B0BMQTXZ3Q'), M(ML.REN7200)],
    description: `### Kingston Fury Renegade 32GB (2x16GB) DDR5 7200MHz CL38

طقمٌ عالي السرعة لمنصّات Intel: 7200 بتوقيت CL38 ومشتّت فضّيّ بلا إضاءة.

**التقنيات الأساسية المدعومة:**

[green]7200 MT/s:[/green] للوحات Z790 وZ890 ومعالجات Intel الحديثة.

[green]ملفّ XMP 3.0 معتمد من Intel.[/green]

[green]ارتفاع 39 مم بلا إضاءة:[/green] مناسبٌ للمبرّدات الهوائيّة الكبيرة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سرعة 7200 تحتاج لوحةً بمنفذين للرام ومعالجاً يتحمّلها — بعض الأنظمة لا تثبت عليها.
* الفائدة في الألعاب صغيرة مقارنةً بأطقم 6000.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب معالجات AMD عند سرعته الكاملة، ولا إضاءة.

${alt('BEAST6000', 'طقم 6000 يعمل على المنصّتين بلا ضبط.')}
https://www.kingston.com/en/memory/gaming/kingston-fury-renegade-ddr5-memory`,
  },
  {
    categoryId: RAM, brand: 'Lexar', name: 'THOR OC 32GB (2x16GB) DDR5 6000MHz CL38', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '6000', casLatency: 'CL38', profile: 'XMP 3.0 & EXPO', rgb: 'No', heightMm: '41', color: 'Black' },
    offers: [A('B0D9XZVQSD'), M(ML.THOROC)],
    description: `### Lexar THOR OC 32GB (2x16GB) DDR5 6000MHz CL38

طقمٌ اقتصاديّ بسرعة 6000 وملفّي XMP وEXPO معاً، بمشتّتٍ أسود منخفض بلا إضاءة.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s:[/green] السرعة المثلى لمعالجات Ryzen 7000 و9000.

[green]ملفّا XMP 3.0 وEXPO:[/green] يعمل على المنصّتين.

[green]ارتفاع نحو 41 مم:[/green] ومشتّت ألمنيوم.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيت CL38 — أبطأ من أطقم CL30 وCL36 بالسرعة نفسها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة.

${alt('CRUCIALPRO', 'طقم 6000 بتوقيت CL36 أسرع قليلاً.')}
https://americas.lexar.com/product/lexar-thor-oc-ddr5-desktop-memory/`,
  },
  {
    categoryId: RAM, brand: 'Lexar', name: 'ARES RGB 32GB (2x16GB) DDR5 6400MHz CL32', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '6400', casLatency: 'CL32', profile: 'XMP 3.0 & EXPO', rgb: 'Yes', heightMm: '43', color: 'Black' },
    offers: [A('B0CBNN3BKK'), M(ML.ARES6400)],
    description: `### Lexar ARES RGB 32GB (2x16GB) DDR5 6400MHz CL32

طقم Lexar الأعلى بسرعة 6400 وتوقيت CL32 وإضاءة RGB — أداءٌ قريبٌ من الأطقم المشهورة بسعرٍ أقلّ غالباً.

**التقنيات الأساسية المدعومة:**

[green]6400 MT/s بتوقيت CL32-38-38-76:[/green] توقيتاتٌ ضيّقة لهذه السرعة.

[green]ملفّا XMP 3.0 وEXPO.[/green]

[green]إضاءة RGB ومشتّت ألمنيوم.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ارتفاعه 43 مم — راجع المبرّد الهوائيّ.
* على معالجات AMD قد يلزم خفضه إلى 6000 للاستقرار.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ضمانه ودعمه أقلّ انتشاراً من Corsair وKingston.

${alt('FLAREX5', 'طقم 6000 بتوقيت CL28 مضبوط لمعالجات AMD.')}
https://americas.lexar.com/product/lexar-ares-rgb-ddr5-desktop-memory/`,
  },

  // ================================================================ التخزين
  {
    categoryId: STO, brand: 'Crucial', name: 'T710 2TB Heatsink', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'NVMe M.2', capacity: '2TB', interface: 'PCIe 5.0 x4', formFactor: 'M.2 2280', readSpeed: '14500 MB/s', writeSpeed: '13800 MB/s', dramCache: 'Yes', tbw: '1200 TB' },
    offers: [A('B0F9XN6MZW'), M(ML.T710_2)],
    description: `### Crucial T710 2TB Heatsink

قرص Crucial الأحدث من الجيل الخامس، مع مشتّت حرارة: قراءة 14,500 وكتابة 13,800 ميجابايت/ث — من أسرع الأقراص المتاحة.

**التقنيات الأساسية المدعومة:**

[green]قراءة 14,500 MB/s وكتابة 13,800 MB/s:[/green] قرب سقف PCIe 5.0.

[green]ذاكرة DRAM من نوع LPDDR4:[/green] أداءٌ ثابت في النسخ الطويل.

[green]مشتّت حرارة مرفق:[/green] يمنع خفض السرعة عند السخونة.

[green]تحمّل 1200 تيرابايت وضمان خمس سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سرعته الكاملة تحتاج منفذ M.2 من الجيل الخامس — وعلى الرابع يعمل بنصفها تقريباً.
* المشتّت قد يتعارض مع مشتّت اللوحة نفسها — يُستعمل أحدهما فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا فرق ملموس في الألعاب عن أقراص الجيل الرابع الجيّدة.

${alt('T705_2', 'الجيل الخامس السابق من Crucial بسعرٍ أقلّ.')}
https://www.crucial.com/ssd/t710/ct2000t710ssd5`,
  },
  {
    categoryId: STO, brand: 'Crucial', name: 'T705 1TB Heatsink', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 5.0 x4', formFactor: 'M.2 2280', readSpeed: '13600 MB/s', writeSpeed: '10200 MB/s', dramCache: 'Yes', tbw: '600 TB' },
    offers: [A('B0CTRXBKHP'), M(ML.T705_1)],
    description: `### Crucial T705 1TB Heatsink

قرص الجيل الخامس من Crucial بسعة 1 تيرابايت ومشتّت حرارة: قراءة 13,600 ميجابايت/ث.

**التقنيات الأساسية المدعومة:**

[green]قراءة 13,600 MB/s وكتابة 10,200 MB/s.[/green]

[green]ذاكرة DRAM ومتحكّم Phison E26:[/green] أداءٌ ثابت.

[green]مشتّت حرارة مرفق.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* تحمّل 600 تيرابايت — متوسّط لقرصٍ بهذا السعر.
* يسخن كثيراً بلا تهوية جيّدة حول المنفذ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا فائدة ملموسة في الألعاب مقارنةً بأقراص الجيل الرابع.

${alt('PRO9100_1', 'قرص جيلٍ خامس بسعة 1 تيرابايت أسرع وأبرد.')}
https://www.crucial.com/ssd/t705/ct1000t705ssd5`,
  },
  {
    categoryId: STO, brand: 'Crucial', name: 'P510 1TB', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 5.0 x4', formFactor: 'M.2 2280', readSpeed: '11000 MB/s', writeSpeed: '9500 MB/s', dramCache: 'No', tbw: '600 TB' },
    offers: [A('B0DZ5ZK225'), M(ML.P510)],
    description: `### Crucial P510 1TB

أرخص طريقٍ إلى الجيل الخامس من Crucial: قراءة 11,000 ميجابايت/ث باستهلاكٍ منخفض وبلا حاجةٍ لمشتّت كبير.

**التقنيات الأساسية المدعومة:**

[green]قراءة 11,000 MB/s وكتابة 9,500 MB/s:[/green] قرابة ضعف أقراص الجيل الرابع.

[green]استهلاك وحرارة منخفضان:[/green] يكفيه مشتّت اللوحة.

[green]ضمان خمس سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا ذاكرة DRAM — يتراجع في النسخ الطويل جداً.
* على منفذ الجيل الرابع يعمل بسرعته (~7,000) فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مشتّت حرارة في هذه النسخة.

${alt('T500', 'قرص جيلٍ رابع بذاكرة DRAM وسعرٍ أقلّ.')}
https://www.crucial.com/ssd/p510/ct1000p510ssd8`,
  },
  {
    categoryId: STO, brand: 'Samsung', name: '990 PRO 2TB Heatsink', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'NVMe M.2', capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7450 MB/s', writeSpeed: '6900 MB/s', dramCache: 'Yes', tbw: '1200 TB' },
    offers: [A('B0BM459NHM'), M(ML['990PROHS2'])],
    description: `### Samsung 990 PRO 2TB Heatsink

قرص Samsung الأعلى من الجيل الرابع مع مشتّت حرارة بإضاءة RGB — مناسبٌ للبلايستيشن 5 والأجهزة المكتبيّة.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7,450 MB/s وكتابة 6,900 MB/s:[/green] سقف الجيل الرابع.

[green]ذاكرة LPDDR4 بسعة 2 جيجابايت:[/green] أداءٌ ثابت.

[green]مشتّت حرارة مرفق:[/green] يركب مباشرةً في البلايستيشن 5.

[green]تحمّل 1200 تيرابايت وضمان خمس سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* أغلى من النسخة بلا مشتّت — ولوحاتٌ كثيرة فيها مشتّتٌ للمنفذ أصلاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس من الجيل الخامس.

${alt('PRO990_2', 'القرص نفسه بلا مشتّت وبسعرٍ أقلّ.')}
https://www.samsung.com/us/computing/memory-storage/solid-state-drives/990-pro-w-heatsink-pcie-4-0-nvme-ssd-2tb-mz-v9p2t0cw/`,
  },
  {
    categoryId: STO, brand: 'Samsung', name: '990 PRO 1TB Heatsink', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7450 MB/s', writeSpeed: '6900 MB/s', dramCache: 'Yes', tbw: '600 TB' },
    offers: [A('B0BHJGV9WR'), M(ML['990PROHS1']), J('https://www.jarir.com/sa-en/samsung-990-pro-with-heatsink-other-gaming-accessories-631428.html')],
    description: `### Samsung 990 PRO 1TB Heatsink

990 PRO بسعة 1 تيرابايت مع مشتّت حرارة بإضاءة RGB — جاهزٌ للبلايستيشن 5 والأجهزة المكتبيّة.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7,450 MB/s وكتابة 6,900 MB/s.[/green]

[green]ذاكرة LPDDR4 بسعة 1 جيجابايت:[/green] أداءٌ ثابت.

[green]مشتّت حرارة مرفق:[/green] يركب في البلايستيشن 5 مباشرةً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* تحمّل 600 تيرابايت.
* المشتّت يرفع السعر — ولوحاتٌ كثيرة فيها مشتّت للمنفذ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس من الجيل الخامس.

${alt('PRO990_1', 'القرص نفسه بلا مشتّت وبسعرٍ أقلّ.')}
https://www.samsung.com/us/computing/memory-storage/solid-state-drives/990-pro-w-heatsink-pcie-4-0-nvme-ssd-1tb-mz-v9p1t0cw/`,
  },
  {
    categoryId: STO, brand: 'Samsung', name: '990 EVO 2TB', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'NVMe M.2', capacity: '2TB', interface: 'PCIe 4.0 x4 / 5.0 x2', formFactor: 'M.2 2280', readSpeed: '5000 MB/s', writeSpeed: '4200 MB/s', dramCache: 'No (HMB)', tbw: '1200 TB' },
    offers: [A('B0CP42QVT8'), M(ML['990EVO2']), C('samsung-990-evo-pcie-4-0-nvme-m-2-2tb-20757')],
    description: `### Samsung 990 EVO 2TB

قرص Samsung الاقتصاديّ الموفّر للطاقة، يعمل على الجيل الرابع x4 أو الخامس x2 — سعةٌ كبيرة بسعرٍ أقلّ من 990 PRO.

**التقنيات الأساسية المدعومة:**

[green]قراءة 5,000 MB/s وكتابة 4,200 MB/s.[/green]

[green]يدعم PCIe 4.0 x4 و5.0 x2:[/green] مرونةٌ مع اللوحات الحديثة.

[green]تحمّل 1200 تيرابايت وضمان خمس سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا ذاكرة DRAM (يستعير من ذاكرة الجهاز HMB).
* أبطأ من 990 EVO Plus الأحدث بسعرٍ قريب.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يصل إلى سرعات الجيل الرابع العليا (7,000+).

${alt('EVOPLUS2', 'خليفته بقراءة 7,250 MB/s وبالسعة نفسها.')}
https://www.samsung.com/uk/memory-storage/nvme-ssd/990-evo-2tb-nvme-pcie-mz-v9e2t0bw/`,
  },
  {
    categoryId: STO, brand: 'WD', name: 'Black SN850X 2TB Heatsink', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'NVMe M.2', capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7300 MB/s', writeSpeed: '6600 MB/s', dramCache: 'Yes', tbw: '1200 TB' },
    offers: [M(ML.SN850XHS2)], /* + عرض أمازون المنقول (MOVE) */
    description: `### WD Black SN850X 2TB Heatsink

SN850X بمشتّت حرارة بإضاءة RGB — قرص ألعابٍ من أعلى الجيل الرابع، ومناسبٌ للبلايستيشن 5.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7,300 MB/s وكتابة 6,600 MB/s.[/green]

[green]ذاكرة DRAM ووضع Game Mode 2.0:[/green] تحميلٌ أسرع للألعاب.

[green]مشتّت حرارة مرفق:[/green] جاهزٌ للبلايستيشن 5.

[green]تحمّل 1200 تيرابايت.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المشتّت يرفع السعر — ولوحاتٌ كثيرة فيها مشتّت للمنفذ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس من الجيل الخامس.

${alt('SN850X2', 'القرص نفسه بلا مشتّت.')}
https://www.sandisk.com/products/ssd/internal-ssd/wd-black-sn850x-nvme-ssd?sku=WDS200T2XHE-00BCA0`,
  },
  {
    categoryId: STO, brand: 'WD', name: 'Black SN7100 4TB', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'NVMe M.2', capacity: '4TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7000 MB/s', writeSpeed: '6700 MB/s', dramCache: 'No (HMB)', tbw: '2400 TB' },
    offers: [A('B0DZK9C789'), M(ML.SN7100_4)],
    description: `### WD Black SN7100 4TB

SN7100 بسعة 4 تيرابايت (صار اسمه SanDisk Optimus GX 7100): سعةٌ كبيرة بسرعة الجيل الرابع العليا واستهلاكٍ منخفض.

**التقنيات الأساسية المدعومة:**

[green]سعة 4 تيرابايت:[/green] مكتبة ألعابٍ كبيرة على قرصٍ واحد.

[green]قراءة 7,000 MB/s وكتابة 6,700 MB/s.[/green]

[green]تحمّل 2400 تيرابايت وضمان خمس سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا ذاكرة DRAM (يستعير من ذاكرة الجهاز HMB).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مشتّت حرارة مرفق.

${alt('NV3_4', 'سعة 4 تيرابايت بسعرٍ أقلّ وسرعةٍ أدنى.')}
https://www.sandisk.com/products/ssd/internal-ssd/wd-black-sn7100-nvme-internal-ssd?sku=WDS400T4X0E-00CJA0`,
  },
  {
    categoryId: STO, brand: 'WD', name: 'Blue SN5100 1TB', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7100 MB/s', writeSpeed: '6700 MB/s', dramCache: 'No', tbw: '600 TB' },
    offers: [A('B0FJ8QFWBQ'), M(ML.SN5100)],
    description: `### WD Blue SN5100 1TB

قرص WD الاقتصاديّ بسرعة الجيل الرابع العليا تقريباً: قراءة 7,100 ميجابايت/ث بسعر الفئة الدنيا.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7,100 MB/s وكتابة 6,700 MB/s:[/green] أرقام قرصٍ أعلى فئة.

[green]تحمّل 600 تيرابايت وضمان خمس سنوات.[/green]

[green]تصميم بوجهٍ واحد:[/green] يناسب الأجهزة المحمولة أيضاً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ذاكرة QLC وبلا DRAM — تنخفض الكتابة كثيراً بعد امتلاء الذاكرة المؤقّتة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب الكتابة الطويلة المستمرّة (تصوير الفيديو الخام، النسخ الضخم).

${alt('NM790_1', 'قرص 1 تيرابايت بذاكرة TLC أثبت في الكتابة الطويلة.')}
https://www.sandisk.com/products/ssd/internal-ssd/wd-blue-sn5100-nvme-ssd?sku=WDS100T5B0E-00CPE0`,
  },
  {
    categoryId: STO, brand: 'Kingston', name: 'Fury Renegade 1TB Heatsink', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7300 MB/s', writeSpeed: '6000 MB/s', dramCache: 'Yes', tbw: '1000 TB' },
    offers: [A('B0BJL61R71'), M(ML.RENEGADE1)],
    description: `### Kingston Fury Renegade 1TB Heatsink

قرص Kingston للألعاب بمشتّت حرارة رفيع جاهزٍ للبلايستيشن 5، وبتحمّل كتابةٍ عالٍ لسعته.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7,300 MB/s وكتابة 6,000 MB/s.[/green]

[green]ذاكرة DRAM ومتحكّم Phison E18:[/green] أداءٌ ثابت.

[green]تحمّل 1000 تيرابايت:[/green] أعلى من أغلب أقراص 1 تيرابايت.

[green]مشتّت جرافين ألمنيوم رفيع:[/green] يركب في البلايستيشن 5.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* متحكّمه من جيلٍ أقدم — أعلى استهلاكاً من الأقراص الأحدث.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس من الجيل الخامس.

${alt('KC3000', 'قرص Kingston بالمتحكّم نفسه بلا مشتّت.')}
https://www.kingston.com/en/ssd/gaming/kingston-fury-renegade-nvme-m2-ssd`,
  },
  {
    categoryId: STO, brand: 'Gigabyte', name: 'AORUS Gen5 14000 1TB', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 5.0 x4', formFactor: 'M.2 2280', readSpeed: '13600 MB/s', writeSpeed: '10200 MB/s', dramCache: 'Yes', tbw: '700 TB' },
    offers: [A('B0DPB6PBXG'), M(ML.AORUS1), C('gigabyte-aorus-gen5-14000-nvme-m-2-2280-ssd-1tb-33312')],
    description: `### Gigabyte AORUS Gen5 14000 1TB

قرص الجيل الخامس من Gigabyte: قراءة 13,600 ميجابايت/ث بمتحكّم Phison E26 وذاكرة DRAM.

**التقنيات الأساسية المدعومة:**

[green]قراءة 13,600 MB/s وكتابة 10,200 MB/s.[/green]

[green]ذاكرة LPDDR4 بسعة 2 جيجابايت:[/green] أداءٌ ثابت.

[green]تحمّل 700 تيرابايت وضمان خمس سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* يسخن كثيراً — يحتاج مشتّت اللوحة أو مشتّتاً منفصلاً.
* سرعته الكاملة على منفذ الجيل الخامس فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا فائدة ملموسة في الألعاب مقارنةً بالجيل الرابع.

${alt('PRO9100_1', 'قرص جيلٍ خامس أحدث وأبرد بالسعة نفسها.')}
https://www.gigabyte.com/SSD/AORUS-Gen5-14000-SSD-1TB`,
  },
  {
    categoryId: STO, brand: 'Lexar', name: 'NQ790 1TB', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7000 MB/s', writeSpeed: '6000 MB/s', dramCache: 'No', tbw: '600 TB' },
    offers: [A('B0CHRX3TKK'), M(ML.NQ790_1)],
    description: `### Lexar NQ790 1TB

قرص Lexar الاقتصاديّ من الجيل الرابع: قراءة 7,000 ميجابايت/ث بسعر الفئة الدنيا.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7,000 MB/s وكتابة 6,000 MB/s.[/green]

[green]يناسب البلايستيشن 5 (مع مشتّت).[/green]

[green]تحمّل 600 تيرابايت وضمان خمس سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا ذاكرة DRAM — يتراجع في النسخ الطويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مشتّت حرارة مرفق.

${alt('NM790_1', 'قرص Lexar الأسرع قليلاً بسعرٍ قريب.')}
https://americas.lexar.com/product/lexar-nq790-m-2-2280-pcie-gen-4x4-nvme-ssd/`,
  },
  {
    categoryId: STO, brand: 'Lexar', name: 'NQ790 4TB', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'NVMe M.2', capacity: '4TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7000 MB/s', writeSpeed: '6000 MB/s', dramCache: 'No', tbw: '2400 TB' },
    offers: [A('B0D2QL46DK'), M(ML.NQ790_4)],
    description: `### Lexar NQ790 4TB

سعة 4 تيرابايت بسرعة الجيل الرابع العليا تقريباً — من أرخص أقراص 4 تيرابايت السريعة.

**التقنيات الأساسية المدعومة:**

[green]سعة 4 تيرابايت:[/green] مكتبة ألعابٍ كاملة.

[green]قراءة 7,000 MB/s وكتابة 6,000 MB/s.[/green]

[green]تحمّل 2400 تيرابايت.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا ذاكرة DRAM — يتراجع في النسخ الطويل جداً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مشتّت حرارة مرفق.

${alt('NM790_4', 'قرص Lexar 4 تيرابايت بقراءة 7,400 MB/s.')}
https://americas.lexar.com/product/lexar-nq790-m-2-2280-pcie-gen-4x4-nvme-ssd/`,
  },
  {
    categoryId: STO, brand: 'Lexar', name: 'NQ780 2TB', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'NVMe M.2', capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7000 MB/s', writeSpeed: '5000 MB/s', dramCache: 'No', tbw: '1200 TB' },
    offers: [A('B0F25C3PMM'), M(ML.NQ780_2)],
    description: `### Lexar NQ780 2TB

قرص Lexar الاقتصاديّ بسعة 2 تيرابايت: قراءة 7,000 ميجابايت/ث بذاكرة QLC.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7,000 MB/s وكتابة 5,000 MB/s.[/green]

[green]تحمّل 1200 تيرابايت.[/green]

[green]سعرٌ منخفض لسعة 2 تيرابايت.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ذاكرة QLC وبلا DRAM — تنخفض الكتابة كثيراً بعد امتلاء الذاكرة المؤقّتة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب الكتابة الطويلة المستمرّة.

${alt('EVOPLUS2', 'قرص 2 تيرابايت أسرع في الكتابة.')}
https://americas.lexar.com/product/lexar-nq780-m-2-2280-pcie-gen-4x4-nvme-ssd/`,
  },
  {
    categoryId: STO, brand: 'SanDisk', name: 'Extreme M.2 NVMe 1TB', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '5150 MB/s', writeSpeed: '4900 MB/s', dramCache: 'No', tbw: '600 TB' },
    offers: [A('B0CN1M7X89'), M(ML.SDX1)],
    description: `### SanDisk Extreme M.2 NVMe 1TB

قرص SanDisk الداخليّ من الجيل الرابع بسرعة 5,150 ميجابايت/ث — اختيارٌ متوسّط للأجهزة المكتبيّة والمحمولة.

**التقنيات الأساسية المدعومة:**

[green]قراءة 5,150 MB/s وكتابة 4,900 MB/s.[/green]

[green]تحمّل 600 تيرابايت.[/green]

[green]استهلاكٌ منخفض.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* أبطأ من أقراص الجيل الرابع العليا (7,000+) بسعرٍ مقارب.
* بلا ذاكرة DRAM.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مشتّت حرارة مرفق.

${alt('SN7100_1', 'قرص 1 تيرابايت أسرع بكثير وبسعرٍ قريب.')}
https://www.sandisk.com/products/ssd/internal-ssd/sandisk-extreme-m2-nvme-ssd?sku=SDSSDX3N-1T00-G26`,
  },

  // ================================================================ المبرّدات الهوائيّة
  ...[[false, 'D15G2', 'B0D5B6MXJF', 'nh-d15-g2', 'Brown'], [true, 'D15G2CH', 'B0FXGWKHND', 'nh-d15-g2-chromax-black', 'Black']].map(([ch, key, asin, page, color]) => ({
    categoryId: COOL, brand: 'Noctua', name: `NH-D15 G2${ch ? ' chromax.black' : ''}`, tdpWattage: 0, performanceTier: 5,
    specs: { type: 'Air', sizeMm: '168', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '2', fanSize: '140mm', rgb: 'No', color },
    offers: [A(asin), M(ML[key])],
    description: `### Noctua NH-D15 G2${ch ? ' chromax.black' : ''}

الجيل الثاني من أشهر مبرّد هوائيّ مزدوج${ch ? ' بالأسود الكامل' : ''}: ثمانية أنابيب حراريّة ومروحتان NF-A14x25r G2 — أداءٌ يضاهي مبرّدات الماء 360 مم بهدوءٍ لافت.

**التقنيات الأساسية المدعومة:**

[green]برجان وثمانية أنابيب حراريّة:[/green] يبرّد معالجات i9 وRyzen 9 تحت الحمل الطويل.

[green]مروحتان 140 مم من الجيل الثاني:[/green] حتى 1,500 لفّة بضجيجٍ منخفض جداً.

[green]لا مضخّة ولا خطر تسريب:[/green] عمرٌ طويل وضمان ستّ سنوات.

[green]قاعدة للاستخدام العامّ:[/green] النسخة القياسيّة المناسبة لـAM5 وLGA1851 معاً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ارتفاعه 168 مم وعرضه كبير — راجع ارتفاع المبرّد المسموح في الكيس وارتفاع الرام.
* سعره أعلى من مبرّدات مائيّة 360 مم كثيرة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة.

${alt('PS120EVO', 'مبرّد مزدوج بأداءٍ قريب وبنحو نصف السعر.')}
https://www.noctua.at/en/products/${page}`,
  })),
  {
    categoryId: COOL, brand: 'Noctua', name: 'NH-D15 chromax.black', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'Air', sizeMm: '165', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', fanCount: '2', fanSize: '140mm', rgb: 'No', color: 'Black' },
    offers: [A('B07Y87YHRH'), M(ML.D15CH)],
    description: `### Noctua NH-D15 chromax.black

الجيل الأوّل من NH-D15 بالأسود الكامل: برجان وستّة أنابيب حراريّة ومروحتان NF-A15 مقاس 140 مم.

**التقنيات الأساسية المدعومة:**

[green]برجان ومروحتان 140 مم:[/green] تبريدٌ قويّ وهادئ.

[green]لا مضخّة ولا خطر تسريب:[/green] وضمان ستّ سنوات.

[green]أسود كامل:[/green] يناسب التجميعات الداكنة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* العلب القديمة قد تحتاج طقم تركيب LGA1700 المجّانيّ من Noctua.
* ارتفاعه 165 مم وعرضه كبير.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة، والجيل الثاني أقوى منه بفارقٍ واضح.

${alt('PS120EVO', 'مبرّد مزدوج بأداءٍ قريب وسعرٍ أقلّ بكثير.')}
https://www.noctua.at/en/products/nh-d15-chromax-black`,
  },
  {
    categoryId: COOL, brand: 'Noctua', name: 'NH-U12A', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'Air', sizeMm: '158', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', fanCount: '2', fanSize: '120mm', rgb: 'No', color: 'Brown' },
    offers: [A('B07PN4RDW3'), M(ML.U12A)],
    description: `### Noctua NH-U12A

برجٌ واحد بسبعة أنابيب حراريّة ومروحتين NF-A12x25 — أداءٌ قريبٌ من المبرّدات المزدوجة بحجمٍ أصغر بكثير.

**التقنيات الأساسية المدعومة:**

[green]مروحتان NF-A12x25:[/green] من أفضل مراوح 120 مم.

[green]برجٌ واحد عرضه 125 مم:[/green] لا يغطّي الرام ولا يتعارض معها.

[green]لا مضخّة ولا خطر تسريب، وضمان ستّ سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سعره مرتفع لمبرّدٍ ببرجٍ واحد.
* العلب القديمة قد تحتاج طقم LGA1700 المجّانيّ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة، ولونه البنّيّ لا يناسب كلّ تجميعة.

${alt('PS120EVO', 'مبرّد مزدوج بأداءٍ قريب وسعرٍ أقلّ بكثير.')}
https://www.noctua.at/en/products/nh-u12a`,
  },
  {
    categoryId: COOL, brand: 'Noctua', name: 'NH-U12S chromax.black', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'Air', sizeMm: '158', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', fanCount: '1', fanSize: '120mm', rgb: 'No', color: 'Black' },
    offers: [A('B07Y88BNYZ'), M(ML.U12SCH)],
    description: `### Noctua NH-U12S chromax.black

برجٌ نحيف بخمسة أنابيب حراريّة ومروحة NF-F12 بالأسود الكامل — هادئٌ ومتوافق مع كلّ الرامات.

**التقنيات الأساسية المدعومة:**

[green]برجٌ نحيف:[/green] لا يغطّي منافذ الرام ولا مشتّتات اللوحة.

[green]هادئ جداً:[/green] مروحة Noctua بضمان ستّ سنوات.

[green]أسود كامل.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مروحة واحدة — لا يناسب معالجات i7/i9 أو Ryzen 9 تحت الحمل الطويل.
* سعره أعلى من مبرّدات مزدوجة أقوى منه.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة.

${alt('PA120', 'مبرّد مزدوج أقوى بسعرٍ أقلّ.')}
https://www.noctua.at/en/products/nh-u12s-chromax-black`,
  },
  {
    categoryId: COOL, brand: 'Cooler Master', name: 'Hyper 212 3DHP', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'Air', sizeMm: '158', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '1', fanSize: '120mm', rgb: 'No', color: 'Black' },
    offers: [A('B0FVLXMKFR'), M(ML.H212)],
    description: `### Cooler Master Hyper 212 3DHP

الجيل الأحدث من مبرّد Hyper 212 الشهير، بأنابيب حراريّة ثلاثيّة الأبعاد (3DHP) — مبرّدٌ اقتصاديّ للفئة المتوسّطة.

**التقنيات الأساسية المدعومة:**

[green]أنابيب 3DHP:[/green] توزيعٌ أفضل للحرارة من التصميم التقليديّ.

[green]مروحة 120 مم حتى 2,050 لفّة.[/green]

[green]سعرٌ منخفض:[/green] يكفي معالجات Ryzen 5 وCore i5.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* برجٌ واحد بمروحةٍ واحدة — لا يكفي المعالجات العالية.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة في هذه النسخة.

${alt('PA120', 'مبرّد مزدوج بسعرٍ قريب وتبريدٍ أقوى.')}
https://www.coolermaster.com/en-global/products/hyper-212-3dhp-black/`,
  },
  {
    categoryId: COOL, brand: 'Cooler Master', name: 'Hyper 622 Halo White', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'Air', sizeMm: '157', sockets: 'AM5/AM4/LGA1700/LGA1200/LGA115X', fanCount: '2', fanSize: '120mm', rgb: 'Yes', color: 'White' },
    offers: [A('B0BX6JJHLJ'), M(ML.H622W)],
    description: `### Cooler Master Hyper 622 Halo White

مبرّد هوائيّ مزدوج أبيض بستّة أنابيب حراريّة ومروحتي Halo² بإضاءة ARGB مزدوجة الحلقة.

**التقنيات الأساسية المدعومة:**

[green]برجان وستّة أنابيب حراريّة:[/green] تبريدٌ قويّ للفئة المتوسّطة والعليا.

[green]مروحتان Halo² ARGB:[/green] إضاءةٌ بحلقتين.

[green]ارتفاع 157 مم وغطاء ألمنيوم.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* LGA1851 (Core Ultra) غير مذكور في قائمته الأصليّة — راجع توفّر طقم التركيب.
* أغلى من مبرّدات مزدوجة بأداءٍ مماثل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب معالجات i9 تحت الحمل الطويل.

${alt('PA120W', 'مبرّد أبيض مزدوج بإضاءة ARGB بسعرٍ أقلّ.')}
https://www.coolermaster.com/en-global/products/hyper-622-halo-white/`,
  },
  {
    categoryId: COOL, brand: 'be quiet!', name: 'Pure Rock 3', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'Air', sizeMm: '154', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', fanCount: '1', fanSize: '120mm', rgb: 'No', color: 'Black' },
    offers: [A('B0DWZ2JPTF'), M(ML.PR3)],
    description: `### be quiet! Pure Rock 3

مبرّدٌ نحيف هادئ بأربعة أنابيب حراريّة ومروحة Pure Wings 3 — تبريدٌ يصل إلى 190 واط للأجهزة المتوسّطة.

**التقنيات الأساسية المدعومة:**

[green]قدرة تبريد 190 واط:[/green] تكفي Ryzen 5/7 وCore i5.

[green]هادئ:[/green] 24 ديسيبل عند 75% من السرعة.

[green]تصميمٌ نحيف:[/green] لا يتعارض مع الرام الطويلة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* برجٌ واحد بمروحةٍ واحدة — لا يكفي المعالجات العالية.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة — نسخة LX فيها مروحة ARGB.

${alt('PRLX', 'المبرّد نفسه بمروحةٍ مضيئة.')}
https://www.bequiet.com/en/cpucooler/5591`,
  },
  {
    categoryId: COOL, brand: 'be quiet!', name: 'Dark Rock Elite', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'Air', sizeMm: '168', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', fanCount: '2', fanSize: '135mm', rgb: 'Yes', color: 'Black' },
    offers: [A('B0CJY2QS2W'), M(ML.DRE)],
    description: `### be quiet! Dark Rock Elite

أعلى مبرّدات be quiet! الهوائيّة: برجان وسبعة أنابيب حراريّة ومروحتان Silent Wings 135 مم، وغطاءٌ علويّ بإضاءة ARGB.

**التقنيات الأساسية المدعومة:**

[green]قدرة تبريد 280 واط:[/green] يكفي معالجات i9 وRyzen 9.

[green]مفتاح سرعتين:[/green] الهادئ حتى 1,500 لفّة، والأداء حتى 2,000.

[green]مروحة أماميّة على سكّة:[/green] تتحرّك لتفسح للرام الطويلة.

[green]إضاءة ARGB في الغطاء.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ارتفاعه 168 مم ووزنه 1.34 كجم.
* سعره قريبٌ من مبرّدات مائيّة 360 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ضمانه ثلاث سنوات فقط.

${alt('PS120EVO', 'مبرّد مزدوج بأداءٍ قريب وبنحو ثلث السعر.')}
https://www.bequiet.com/en/cpucooler/4468`,
  },
  {
    categoryId: COOL, brand: 'NZXT', name: 'T120 RGB', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'Air', sizeMm: '159', sockets: 'AM5/AM4/LGA1700/LGA1200/LGA115X', fanCount: '1', fanSize: '120mm', rgb: 'Yes', color: 'Black' },
    offers: [A('B0BKN4JB7S'), M(ML.T120B)],
    description: `### NZXT T120 RGB

مبرّد NZXT الهوائيّ ببرجٍ واحد وأربعة أنابيب حراريّة ومروحة F120 RGB — يتكامل مع إضاءة منظومة NZXT.

**التقنيات الأساسية المدعومة:**

[green]مروحة F120 RGB:[/green] تُدار ببرنامج NZXT CAM.

[green]أربعة أنابيب حراريّة بتماسٍ مباشر.[/green]

[green]تصميمٌ أنيق بغطاء علويّ.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* برجٌ واحد — يكفي الفئة المتوسّطة فقط.
* LGA1851 غير مذكور في قائمته الأصليّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* أغلى من مبرّداتٍ مزدوجة أقوى منه.

${alt('PA120', 'مبرّد مزدوج بإضاءة ARGB وتبريدٍ أقوى بسعرٍ أقلّ.')}
https://nzxt.com/product/t120-rgb`,
  },
  ...[['Black', 'TURRIS_K', 'B0GGRDL4NG', 'black'], ['White', 'TURRIS_W', 'B0GGRS2H3X', 'white']].map(([color, key, asin, page]) => ({
    categoryId: COOL, brand: 'TRYX', name: `TURRIS 620${color === 'White' ? ' White' : ''}`, tdpWattage: 0, performanceTier: 4,
    specs: { type: 'Air', sizeMm: '165', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '2', fanSize: '120mm', rgb: 'No', color, features: ['شاشة IPS مقاس 5 بوصات'] },
    offers: [A(asin), M(ML[key])],
    description: `### TRYX TURRIS 620${color === 'White' ? ' White' : ''}

مبرّد هوائيّ مزدوج ${color === 'White' ? 'أبيض ' : ''}بشاشة IPS مقاس 5 بوصات تعرض الحرارة أو صوراً وفيديوهات — نادرٌ في المبرّدات الهوائيّة.

**التقنيات الأساسية المدعومة:**

[green]شاشة IPS مقاس 5 بوصات (1280×720):[/green] مغناطيسيّة وتُدار ببرنامج KANALI.

[green]برجان وستّة أنابيب حراريّة:[/green] قدرة تبريد 280 واط.

[green]مروحتان 120 مم حتى 1,850 لفّة:[/green] والأماميّة على سكّة لتفسح للرام (45–55 مم).

[green]ضمان ستّ سنوات للمبرّد وثلاث للشاشة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ارتفاعه نحو 165 مم ووزنه 1.85 كجم.
* سعره قريبٌ من مبرّدات مائيّة 360 مم بشاشة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB في المراوح.

${alt('PS120EVO', 'مبرّد مزدوج بأداءٍ قريب بلا شاشة وبسعرٍ أقلّ بكثير.')}
https://www.tryx.com/en/products/cooling/turris/turris-620/${page}`,
  })),

  // ================================================================ المبرّدات المائيّة
  {
    categoryId: COOL, brand: 'ASUS', name: 'ROG Ryuo IV 360 ARGB', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'AIO', sizeMm: '360', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'Black', features: ['شاشة AMOLED منحنية 6.67 بوصة'] },
    offers: [A('B09BNJXFJT'), M(ML.RYUO4)],
    description: `### ASUS ROG Ryuo IV 360 ARGB

مبرّد مائيّ 360 مم بشاشة AMOLED منحنية مقاس 6.67 بوصة على المضخّة، ومضخّة Asetek Gen8 V2.

**التقنيات الأساسية المدعومة:**

[green]شاشة AMOLED منحنية 6.67 بوصة:[/green] تعرض الحرارة والصور والفيديو، وتنزلق لضبط موضعها.

[green]مضخّة Asetek Gen8 V2:[/green] حتى 3,200 لفّة.

[green]ثلاث مراوح ARGB مقاس 120 مم.[/green]

[green]ضمان ستّ سنوات للمبرّد وسنتين للشاشة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الشاشة تضاعف السعر تقريباً — التبريد نفسه متاحٌ بأرخص بكثير.
* سماكة الرادييتر 30 مم — راجع المساحة في سقف الكيس.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يُنصح به لمن لا يريد الشاشة.

${alt('STRIXLC3W', 'مبرّد ASUS 360 مم بلا شاشة وبسعرٍ أقلّ بكثير.')}
https://rog.asus.com/cooling/cpu-liquid-coolers/rog-ryuo/rog-ryuo-iv-360-argb/`,
  },
  ...[['Black', 'RAD360_B', 'B0G2SY96G2', 'black'], ['White', 'RAD360_W', 'B0G2SW7L6F', 'white']].map(([color, key, asin, page]) => ({
    categoryId: COOL, brand: 'Fractal Design', name: `Radius 360 RGB${color === 'White' ? ' White' : ''}`, tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '3', fanSize: '120mm', rgb: 'Yes', color },
    offers: [A(asin), M(ML[key])],
    description: `### Fractal Design Radius 360 RGB${color === 'White' ? ' White' : ''}

مبرّد Fractal المائيّ 360 مم ${color === 'White' ? 'بالأبيض ' : ''}بثلاث مراوح Dynamic 3 RGB — بسعرٍ متوسّط ومن شركةٍ معروفة بالهدوء.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 360 مم وثلاث مراوح 120 مم:[/green] حتى 2,200 لفّة و63.9 CFM.

[green]إضاءة RGB:[/green] في المراوح والمضخّة.

[green]يدعم LGA1851 وAM5.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ضجيج المراوح يصل 31.9 ديسيبل بأقصى سرعة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة في المضخّة.

${alt(color === 'White' ? 'AQUA360W' : 'AQUA360', 'مبرّد 360 مم بإضاءة ARGB بسعرٍ أقلّ.')}
https://www.fractal-design.com/products/water-cooling/radius-series/radius-360/radius-360-rgb-${page}/`,
  })),
  {
    categoryId: COOL, brand: 'MSI', name: 'MAG CoreLiquid E360', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'Black' },
    offers: [A('B0CC5F5Q7G'), M(ML.E360B)],
    description: `### MSI MAG CoreLiquid E360

مبرّد MSI المائيّ 360 مم بالأسود: رأس مضخّة بإضاءة ARGB وقاعدة نحاسيّة كبيرة ومراوح بمحامل FDB — بسعرٍ متوسّط.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 360 مم وثلاث مراوح 120 مم:[/green] حتى 75 CFM.

[green]قاعدة نحاسيّة موسّعة:[/green] تغطّي معالجات AM5 وLGA1851 كاملةً.

[green]مضخّة حتى 3,000 لفّة برأسٍ مضيء ARGB.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المراوح بلا إضاءة — الإضاءة في رأس المضخّة فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة في المضخّة.

${alt('AQUA360', 'مبرّد 360 مم بإضاءة ARGB في المراوح وسعرٍ أقلّ.')}
https://www.msi.com/Liquid-Cooling/MAG-CORELIQUID-E360`,
  },
  {
    categoryId: COOL, brand: 'TRYX', name: 'STAGE 360 ARGB White', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'AIO', sizeMm: '360', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '3', fanSize: '120mm', rgb: 'Yes', color: 'White', features: ['شاشتان IPS مقاس 4 بوصات'] },
    offers: [A('B0G6K6Z7GB'), M(ML.STAGE_W), C('tryx-stage-argb-360mm-liquid-cooler-white-42921')],
    description: `### TRYX STAGE 360 ARGB White

مبرّد مائيّ 360 مم أبيض بشاشتين IPS مقاس 4 بوصات على رأس المضخّة، ومضخّة Asetek من الجيل السابع.

**التقنيات الأساسية المدعومة:**

[green]شاشتان IPS مقاس 4 بوصات (720×720):[/green] بأوضاع مرآة وتقسيم وامتداد ببرنامج KANALI.

[green]مضخّة Asetek Gen 7 V2:[/green] قدرة تبريد 280 واط.

[green]ثلاث مراوح ROTA SL ARGB:[/green] بوصلاتٍ مغناطيسيّة.

[green]ضمان ستّ سنوات للمبرّد وثلاث للشاشتين.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الشاشتان ترفعان السعر — التبريد نفسه متاحٌ بأرخص بكثير.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يُنصح به لمن لا يريد الشاشات.

${alt('KE360W', 'مبرّد 360 مم أبيض بشاشة LCD واحدة كبيرة.')}
https://shop.tryx.com/products/tryx-stage-360-white`,
  },
  ...[['', 'GG240', 'B0F2P4DC5C', 'Black', 'GIGABYTE-GAMING-240'], [' ICE', 'GG240I', 'B0F2P22LWK', 'White', 'GIGABYTE-GAMING-240-ICE']].map(([ice, key, asin, color, page]) => ({
    categoryId: COOL, brand: 'Gigabyte', name: `Gaming 240${ice}`, tdpWattage: 0, performanceTier: 3,
    specs: { type: 'AIO', sizeMm: '240', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '2', fanSize: '120mm', rgb: 'Yes', color },
    offers: [A(asin), M(ML[key])],
    description: `### Gigabyte Gaming 240${ice}

مبرّد Gigabyte المائيّ الاقتصاديّ 240 مم${ice ? ' بالأبيض' : ''}: مروحتان ARGB تُركّبان بالانزلاق وتتّصلان ببعضهما بكابلٍ واحد.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 240 مم ومروحتان 120 مم ARGB:[/green] حتى 2,200 لفّة.

[green]تركيبٌ منزلق وكابلٌ واحد:[/green] أسهل في الترتيب.

[green]سعرٌ منخفض لمبرّدٍ مائيّ.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 240 مم لا تكفي معالجات i9 وRyzen 9 تحت الحمل الطويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة.

${alt(ice ? 'FROZEN240W' : 'LE240', ice ? 'مبرّد 240 مم أبيض بإضاءة ARGB.' : 'مبرّد 240 مم اقتصاديّ آخر بإضاءة ARGB.')}
https://www.gigabyte.com/Thermal/${page}`,
  })),
  {
    categoryId: COOL, brand: 'NZXT', name: 'Kraken Elite 420 RGB White', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'AIO', sizeMm: '420', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '3', fanSize: '140mm', rgb: 'Yes', color: 'White', features: ['شاشة LCD مقاس 2.72 بوصة'] },
    offers: [A('B0DN4GS9FM'), M(ML.KE420W)],
    description: `### NZXT Kraken Elite 420 RGB White

أكبر مبرّدات NZXT المائيّة (إصدار 2025): رادييتر 420 مم بثلاث مراوح 140 مم وشاشة LCD مقاس 2.72 بوصة.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 420 مم:[/green] أعلى قدرة تبريد بين مبرّدات NZXT — هادئٌ مع أقوى المعالجات.

[green]شاشة LCD مقاس 2.72 بوصة:[/green] تعرض الحرارة أو صوراً وGIF.

[green]مراوح F420 RGB Core:[/green] ثلاث مراوح 140 مم في إطارٍ واحد.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* يحتاج كيساً يقبل رادييتر 420 مم — كثيرٌ من الكيسات لا تقبله.
* سعره مرتفع جداً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب الكيسات الصغيرة والمتوسّطة الشائعة.

${alt('KE360W', 'النسخة 360 مم الأسهل تركيباً.')}
https://nzxt.com/product/kraken-elite-420-rgb`,
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
writeFileSync(`backups/added-batch8-${stamp}.json`, JSON.stringify({ PARTS, EXTRA, movedBefore }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch8-${stamp}.json`);

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
