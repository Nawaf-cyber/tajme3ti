/* ============ إضافة قطعٍ جديدة — دفعة ٢٠٢٦-٠٨ ============
 *
 * ما الذي نقص فعلاً؟ سؤالٌ أُجيب بجرد الكتالوج لا بالانطباع:
 *
 *   المبرّدات ١٧ قطعة، **١١ منها DeepCool** — وأشهر مبرّدات الهواء في كل
 *   دليل تجميع (Peerless Assassin، Hyper 212، Pure Rock) غائبةٌ كلّها.
 *   والصناديق ٢١ قابلةً للشراء، وستٌّ منها فقط تحت ٥٠٠ ﷼.
 *
 * ⚠️ وما لم يُضَف ولماذا:
 *   • **الرام** أكبر فجوةٍ رقميّاً (صفر قطعة تحت ٥٠٠ ﷼) — ولم تُسدّ: مايكرولس
 *     يبيع طقم DDR5 32GB بـ٢٠٣٣ ﷼، والأسعار المعقولة عند كازاسوق الذي يردّ
 *     403 لكل طلبٍ من خادم ويحتاج SCRAPER_API_KEY غير الموجود محلياً.
 *   • **DeepCool AK620** أُسقط رغم جودته: صفحة المتجر تعلن مقابس LGA1200/AM4
 *     بلا AM5 ولا LGA1700، فلو أُدخلت كما هي لظهر غير متوافقٍ مع كل معالجاتنا.
 *     وصفحة المصنّع لم تُفتح للتحقّق — فتُرك بدل أن يُخمَّن مقبسه.
 *   • **MasterBox E500L** أُسقط: صفحته لا تذكر ارتفاع المبرّد ولا طول الكرت،
 *     وهما بوّابتا التوافق. قطعةٌ ببياناتٍ ناقصة تكذب في الباني.
 *
 * ⚠️ والمواصفات تُقرأ من جدول الصفحة لا من الذاكرة: نصّ صفحة Peerless Assassin
 * يقول «ارتفاع ١٥٥ مم» بينما جدولها يقول المشتّت وحده H148 — والفرق يقلب
 * حكم التوافق مع صندوقٍ ضيّق.
 *
 *   npx tsx scripts/add-parts-2026-08.ts          ← تجربة بلا كتابة
 *   npx tsx scripts/add-parts-2026-08.ts --commit ← كتابة
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readProduct } from './find-candidates';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

type NewPart = {
  category: string;
  brand: string;
  name: string;
  url: string;
  tier: number;
  specs: Record<string, any>;
  description: string;
};

const COOLER_TR = 'LGA1851/LGA1700/LGA1200/LGA115X/AM5/AM4';
const COOLER_BQ = 'LGA1851/LGA1700/LGA1200/LGA115X/AM5/AM4';
const COOLER_CM = 'LGA1700/LGA1200/LGA115X/AM5/AM4';

const PARTS: NewPart[] = [
  /* ============ المبرّدات ============ */
  {
    category: 'Cooler', brand: 'Thermalright', name: 'Peerless Assassin 120 SE ARGB',
    url: 'https://saudi.microless.com/product/thermalright-peerless-assassin-120-se-argb-cpu-air-cooler-dual-tower-6x6mm-heatpipes-pure-copper-base-2x-120mm-argb-fans-1550rpm-66-17cfm-25-6db-black-pa120/',
    tier: 3,
    specs: { rgb: 'Yes', type: 'Air', sizeMm: '155', fanSize: '120mm', fanCount: '2', sockets: COOLER_TR, color: 'Black' },
    description: `### Thermalright Peerless Assassin 120 SE ARGB

برجان مزدوجان بستّة أنابيب حرارية ٦ مم وقاعدة نحاس C1100 مطليّة بالنيكل، ومروحتا ١٢٠ مم PWM بإضاءة ARGB.

**لماذا يُذكر في كل دليل تجميع:** يقارب أداء مبرّدات هوائية بضعف سعره، ويُبرّد معالجات الفئة المتوسطة والعليا بلا ضجيج يُذكر (٢٥٫٦ ديسيبل عند ١٥٥٠ دورة).

**قبل الشراء:** ارتفاعه ١٥٥ مم — تحقّق أن صندوقك يسع هذا الارتفاع، وأغلب الأبراج المتوسطة تسعه. ويدعم مقابس إنتل LGA115X/1200/1700/1851 وAMD AM4/AM5.`,
  },
  {
    category: 'Cooler', brand: 'Thermalright', name: 'Peerless Assassin 120 SE ARGB White',
    url: 'https://saudi.microless.com/product/thermalright-peerless-assassin-120-se-argb-cpu-air-cooler-dual-tower-6x6mm-heatpipes-pure-copper-base-2x-120mm-argb-fans-1550rpm-66-17cfm-25-6db-white-pa120/',
    tier: 3,
    specs: { rgb: 'Yes', type: 'Air', sizeMm: '155', fanSize: '120mm', fanCount: '2', sockets: COOLER_TR, color: 'White' },
    description: `### Thermalright Peerless Assassin 120 SE ARGB White

النسخة البيضاء من Peerless Assassin 120 SE ARGB — نفس البرجين المزدوجين وستّة الأنابيب الحرارية ٦ مم وقاعدة النحاس المطليّة، ومروحتَي ١٢٠ مم ARGB.

**لمن؟** لمن يبني تجميعةً بيضاء ولا يريد أن يدفع ضعف السعر مقابل اللون. الأداء مطابقٌ للنسخة السوداء تماماً.

**قبل الشراء:** ارتفاعه ١٥٥ مم، ويدعم LGA115X/1200/1700/1851 وAM4/AM5.`,
  },
  {
    category: 'Cooler', brand: 'Thermalright', name: 'Phantom Spirit 120 SE ARGB',
    url: 'https://saudi.microless.com/product/thermalright-phantom-spirit-120-se-argb-cpu-air-cooler-dual-tower-7x6mm-heatpipes-pure-copper-base-2x-120mm-argb-pwm-fans-1500rpm-66-17cfm-25-6db-ps120seargb/',
    tier: 4,
    specs: { rgb: 'Yes', type: 'Air', sizeMm: '154', fanSize: '120mm', fanCount: '2', sockets: COOLER_TR, color: 'Black' },
    description: `### Thermalright Phantom Spirit 120 SE ARGB

سبعة أنابيب حرارية ٦ مم — أي أنبوبٌ أكثر من Peerless Assassin — مع برجين وقاعدة نحاس C1100 ومروحتَي ١٢٠ مم ARGB بسرعة ١٥٠٠ دورة.

**أين يتقدّم؟** الأنبوب السابع يمنحه هامشاً على أخيه الأصغر مع معالجات تتجاوز ١٥٠ واط، وهو الفرق الذي يظهر تحت الحمل الطويل لا في اللعب العابر.

**قبل الشراء:** ارتفاعه ١٥٤ مم، ويدعم LGA1150 حتى LGA1851 وAM4/AM5.`,
  },
  {
    category: 'Cooler', brand: 'Thermalright', name: 'Phantom Spirit 120 EVO',
    url: 'https://saudi.microless.com/product/thermalright-phantom-spirit-120-evo-cpu-air-cooler-dual-tower-7x6mm-heatpipes-pure-copper-base-2x-120mm-argb-pwm-fans-2150rpm-69cfm-27db-black-phantom-spirit-120-evo/',
    tier: 4,
    specs: { rgb: 'No', type: 'Air', sizeMm: '157', fanSize: '120mm', fanCount: '2', sockets: 'LGA2066/LGA2011/LGA1851/LGA1700/LGA1200/LGA115X/AM5/AM4', color: 'Black' },
    description: `### Thermalright Phantom Spirit 120 EVO

النسخة الأقوى من Phantom Spirit: سبعة أنابيب حرارية ٦ مم، ومروحتان تصلان إلى ٢١٥٠ دورة و٦٩ CFM — تدفّقٌ أعلى مقابل ضجيجٍ أعلى قليلاً (٢٧ ديسيبل).

**لمن؟** لمعالجات الفئة العليا التي تُشغَّل تحت حملٍ طويل. ولا إضاءة فيه — من يريد الإضاءة فالنسخة SE ARGB خيارُه.

**قبل الشراء:** ارتفاعه ١٥٧ مم وهو أطول من أخويه، فتحقّق من ارتفاع صندوقك. ويدعم حتى LGA2011/2066 إضافةً إلى المقابس الحديثة.`,
  },
  {
    category: 'Cooler', brand: 'Cooler Master', name: 'Hyper 212 Spectrum V3',
    url: 'https://saudi.microless.com/product/cooler-master-hyper-212-spectrum-v3-cpu-air-cooler-120mm-spectrum-argb-fan-1750-rpm-71-93-cfm-airflow-nickel-plated-heat-pipes-argb-detection-2-vdc-4-pin-pwm-black-silver-rr-s4na-17pa-r1/',
    tier: 2,
    specs: { rgb: 'Yes', type: 'Air', sizeMm: '152', fanSize: '120mm', fanCount: '1', sockets: COOLER_CM, color: 'Black/Silver' },
    description: `### Cooler Master Hyper 212 Spectrum V3

الجيل الثالث من أشهر مبرّد هواءٍ اقتصاديّ في تاريخ التجميع: برجٌ واحد بأربعة أنابيب حرارية مطليّة بالنيكل، ومروحة ١٢٠ مم ARGB حتى ١٧٥٠ دورة و٧١٫٩٣ CFM.

**لمن؟** للتجميعات الاقتصادية والمتوسطة. يكفي معالجات الفئة المتوسطة بلا مبالغة في السعر، وهو بديلٌ مباشرٌ للمبرّد المرفق مع المعالج.

**قبل الشراء:** ارتفاعه ١٥٢ مم، ويدعم LGA115X/1200/1700 وAM4/AM5.`,
  },
  {
    category: 'Cooler', brand: 'be quiet!', name: 'Pure Rock 3 LX',
    url: 'https://saudi.microless.com/product/be-quiet-pure-rock-3-lx-cpu-cooler-120mm-light-wings-lx-fan-2000-rpm-fan-speed-61-8-cfm-airflow-rifle-bearing-technology-4-high-performance-6mm-heat-pipes-with-hdt-technology-black-bk040/',
    tier: 2,
    specs: { rgb: 'Yes', type: 'Air', sizeMm: '154', fanSize: '120mm', fanCount: '1', sockets: COOLER_BQ, color: 'Black' },
    description: `### be quiet! Pure Rock 3 LX

أربعة أنابيب حرارية ٦ مم بتقنية التلامس المباشر (HDT)، ومروحة Light Wings LX مقاس ١٢٠ مم حتى ٢٠٠٠ دورة.

**اسم الشركة وعدُها:** be quiet! بنت سمعتها على الهدوء، وهذا أرخص مدخلٍ إلى مبرّداتها. أداءٌ يكفي الفئة المتوسطة في تصميمٍ مضغوط.

**قبل الشراء:** ارتفاعه ١٥٤ مم، ويدعم LGA115X/1200/1700/1851 وAM4/AM5.`,
  },
  {
    category: 'Cooler', brand: 'be quiet!', name: 'Pure Rock Pro 3 LX',
    url: 'https://saudi.microless.com/product/be-quiet-pure-rock-pro-3-lx-cpu-cooler-120mm-light-wings-lx-fan-2000-rpm-speed-61-8-cfm-airflow-rifle-bearing-technology-6-high-performance-6mm-heat-pipes-with-nickel-plated-base-black-bk043/',
    tier: 3,
    specs: { rgb: 'Yes', type: 'Air', sizeMm: '155', fanSize: '120mm', fanCount: '1', sockets: COOLER_BQ, color: 'Black' },
    description: `### be quiet! Pure Rock Pro 3 LX

ستّة أنابيب حرارية ٦ مم وقاعدة نحاس مطليّة بالنيكل — أنبوبان أكثر من Pure Rock 3 LX — مع مروحة Light Wings LX مقاس ١٢٠ مم.

**الفرق عن الأصغر:** الأنبوبان الإضافيّان والقاعدة النحاسية يرفعان سقف التبريد إلى معالجات الفئة الأعلى، مع بقاء الحجم مضغوطاً نسبياً.

**قبل الشراء:** ارتفاعه ١٥٥ مم، ويدعم LGA115X/1200/1700/1851 وAM4/AM5.`,
  },

  /* ============ الصناديق ============ */
  {
    category: 'Case', brand: 'Montech', name: 'AIR 903 MAX White',
    url: 'https://saudi.microless.com/product/montech-air-903-max-mid-tower-atx-computer-case-3x-140mm-pwm-pre-installed-fans-360mm-radiator-support-9x-fan-support-mesh-front-panel-dust-filter-white-air-903-max-white/',
    tier: 3,
    specs: { formFactor: 'Mid Tower', includedFans: '3x 140mm ARGB + 1x 140mm', maxGpuLength: 400, psuFormFactor: 'ATX', maxCoolerHeight: '180', radiatorSupport: '360mm', color: 'White' },
    description: `### Montech AIR 903 MAX

صندوقٌ متوسط بواجهة شبكيّة مفتوحة و**أربع مراوح مركّبة من المصنع**: ثلاث ١٤٠ مم ARGB في المقدّمة وواحدة ١٤٠ مم خلفاً.

**قيمته:** أربع مراوح ١٤٠ مم بهذا السعر تعني أنك لا تحتاج شراء مراوح إضافية — وهو أكبر ما يُنسى في حساب ميزانية الصندوق.

**المقاسات:** يسع مبرّداً بارتفاع ١٨٠ مم، وكرتاً بطول ٤٠٠ مم، ورادييتر ٣٦٠ مم علويّاً أو أماميّاً. ويدعم لوحات ATX وMicro-ATX وMini-ITX.`,
  },
  {
    category: 'Case', brand: 'Montech', name: 'AIR 903 BASE White',
    url: 'https://saudi.microless.com/product/montech-air-90air-903-base-mid-tower-atx-computer-case-3x-140mm-pre-installed-pwm-fans-up-to-360mm-radiator-support-mesh-front-panel-vertical-gpu-mounting-white-air-903-base-white/',
    tier: 2,
    specs: { formFactor: 'Mid Tower', includedFans: '2x 140mm + 1x 140mm', maxGpuLength: 400, psuFormFactor: 'ATX', maxCoolerHeight: '180', radiatorSupport: '360mm', color: 'White', verticalGpu: 'Supported' },
    description: `### Montech AIR 903 BASE

النسخة الأساسية من AIR 903: نفس الهيكل والمقاسات، وثلاث مراوح ١٤٠ مم PWM بلا إضاءة — والفرق عن MAX هو الإضاءة وعدد المراوح لا المساحة.

**لمن؟** لمن يريد تهويةً ممتازةً بأقلّ سعر ولا تهمّه الإضاءة. ويدعم تركيب كرت الشاشة عموديّاً.

**المقاسات:** مبرّد حتى ١٨٠ مم، كرت حتى ٤٠٠ مم، رادييتر ٣٦٠ مم علويّاً أو أماميّاً، ولوحات ATX/Micro-ATX/Mini-ITX.`,
  },
  {
    category: 'Case', brand: 'Montech', name: 'KING 65 PRO',
    url: 'https://saudi.microless.com/product/montech-king-65-pro-atx-computer-case-3x-argb-pwm-pre-installed-fans-up-to-360mm-radiator-support-9x-fan-support-flat-glass-tinted-panel-black-king-65-pro-black/',
    tier: 3,
    specs: { formFactor: 'Mid Tower', includedFans: '2x 140mm ARGB (Side) + 1x 120mm ARGB (Rear)', maxGpuLength: 420, psuFormFactor: 'ATX', maxCoolerHeight: '175', radiatorSupport: '360mm', color: 'Black' },
    description: `### Montech KING 65 PRO

صندوقٌ بزجاجٍ مسطّحٍ مُظلَّل وثلاث مراوح ARGB مركّبة — مروحتا ١٤٠ مم جانبيّتان تدفعان الهواء إلى اللوحة مباشرةً، وواحدة ١٢٠ مم خلفاً.

**ما يميّزه:** المراوح الجانبية لا الأمامية — تصميمٌ يوصل الهواء البارد إلى الكرت واللوحة بلا أن يمرّ عبر أقراصٍ أو كوابل. ويسع كرتاً بطول ٤٢٠ مم وهو من أوسع ما في فئته.

**المقاسات:** مبرّد حتى ١٧٥ مم، رادييتر ٣٦٠ مم علويّاً، مزوّد ATX حتى ١٨٥ مم، ولوحات ATX/Micro-ATX/Mini-ITX.`,
  },
  {
    category: 'Case', brand: 'Montech', name: 'Sky One Lite ARGB',
    url: 'https://saudi.microless.com/product/montech-sky-one-lite-argb-atx-mid-tower-case-up-to-360mm-radiator-support-3x-preinstalled-fan-front-bottom-dust-filter-swivel-glass-side-panel-usb-type-c-port-black-sky-one-lite-bk/',
    tier: 2,
    specs: { formFactor: 'Mid Tower', includedFans: '2x 120mm (Front) + 1x 120mm (Rear)', maxGpuLength: 350, psuFormFactor: 'ATX', maxCoolerHeight: '170', radiatorSupport: '360mm', color: 'Black' },
    description: `### Montech Sky One Lite ARGB

صندوقٌ اقتصاديّ بلوحٍ زجاجيّ يُفتح كالباب، وثلاث مراوح ١٢٠ مم مركّبة، وشريط ARGB أماميّ، ومنفذ Type-C في الواجهة.

**لمن؟** لأوّل تجميعةٍ بميزانيةٍ محدودة: منفذ Type-C وفلاتر غبارٍ أماميّة وسفليّة في هذه الفئة السعرية ليست معتادة.

**⚠️ قبل الشراء:** أضيق ممّا سبقه — كرتٌ حتى ٣٥٠ مم فقط (و**٣١٠ مم** إن ركّبتَ رادييتراً أماميّاً)، ومبرّدٌ حتى ١٧٠ مم. فراجع طول كرتك قبل الطلب.`,
  },
  {
    category: 'Case', brand: 'Cooler Master', name: 'MasterBox 600',
    url: 'https://saudi.microless.com/product/cooler-master-masterbox-600-mid-tower-computer-case-3x-140mm-argb-pwm-1x-120mm-argb-pre-installed-fan-support-up-to-420mm-radiator-7x-max-fan-support-black-mb600-kgnn-s00/',
    tier: 3,
    specs: { formFactor: 'Mid Tower', includedFans: '3x 140mm ARGB + 1x 120mm ARGB', maxGpuLength: 360, psuFormFactor: 'ATX', maxCoolerHeight: '170', radiatorSupport: '420mm', color: 'Black' },
    description: `### Cooler Master MasterBox 600

أربع مراوح ARGB مركّبة مع موزّع إضاءة، ولوح جانبيّ زجاجيّ، ودعم رادييتر **٤٢٠ مم** أماميّاً — وهو من القليل في فئته الذي يقبل هذا المقاس.

**ما يميّزه:** يدعم لوحات E-ATX إضافةً إلى ATX، وموزّع الإضاءة المرفق يغنيك عن شراء واحد.

**⚠️ قبل الشراء:** طول الكرت ٣٦٠ مم مع رادييترٍ أماميّ، و٤١٠ مم بدونه — فإن كان كرتك طويلاً فاختر أحدهما. والمبرّد الهوائيّ حتى ١٧٠ مم.`,
  },

  /* ============ مزوّد الطاقة ============ */
  {
    category: 'PSU', brand: 'MSI', name: 'MAG A650BN',
    url: 'https://saudi.microless.com/product/msi-mag-a650bn-650w-80-bronze-power-supply-dc-dc-circuit-design-120-mm-fan-size-active-pfc-100-240vac-atx-306-7zp2b18-ce0/',
    tier: 2,
    specs: { rating: '80+ Bronze', wattage: '650', formFactor: 'ATX', modularity: 'Non-Modular', color: 'Black' },
    description: `### MSI MAG A650BN

مزوّد ٦٥٠ واط بشهادة 80 PLUS Bronze وتصميم DC-DC وخطّ ١٢ فولت واحد، مع مروحة ١٢٠ مم منخفضة الضجيج وحمايات OVP/OCP/OPP/OTP/SCP.

**لمن؟** للتجميعات الاقتصادية والمتوسطة التي لا تحتاج أكثر من ٦٥٠ واط. مدخلٌ موثوقٌ بسعرٍ منخفض.

**⚠️ قبل الشراء:** كوابله **ثابتة غير منفصلة** (Non-Modular)، أي أن كل الكوابل تخرج منه سواء استعملتها أو لا — وهذا يزيد الفوضى داخل الصندوق. وفيه موصّلا PCIe 6+2 فقط، فلا يكفي كروتاً تطلب ثلاثة.`,
  },
];

async function main() {
  const commit = process.argv.includes('--commit');
  console.log(commit ? `${Y}== كتابة ==${X}` : `${D}== تجربة بلا كتابة (أضف --commit للكتابة) ==${X}`);

  const store = await prisma.store.findFirst({ where: { slug: 'microless' } });
  if (!store) { console.error('⛔ لا متجر microless'); process.exit(1); }

  const cats = await prisma.category.findMany();
  const catId = new Map(cats.map((c) => [c.name, c.id]));

  const existingNames = new Set((await prisma.component.findMany({ select: { name: true } }))
    .map((c) => c.name.trim().toLowerCase()));
  const existingUrls = new Set((await prisma.componentOffer.findMany({ select: { url: true } }))
    .map((o) => (o.url || '').replace(/\/$/, '')));

  const ready: { part: NewPart; price: number; image: string | null }[] = [];
  let skipped = 0;

  for (const part of PARTS) {
    const tag = `${part.brand} ${part.name}`;
    if (!catId.has(part.category)) { console.log(`${R}✘ ${tag} — لا فئة «${part.category}»${X}`); skipped++; continue; }
    if (existingNames.has(part.name.trim().toLowerCase())) { console.log(`${R}✘ ${tag} — الاسم موجودٌ عندنا${X}`); skipped++; continue; }
    if (existingUrls.has(part.url.replace(/\/$/, ''))) { console.log(`${R}✘ ${tag} — الرابط مستعملٌ عندنا${X}`); skipped++; continue; }

    /* ⚠️ السعر يُقرأ لحظةَ الكتابة لا من قائمةٍ جُمعت قبل ساعة: سعرٌ قديم
       يدخل الكتالوج ثم يُرصد «انخفاضاً» كاذباً في أوّل دورة سحب. */
    const live = await readProduct(part.url);
    if (!live) { console.log(`${R}✘ ${tag} — تعذّر فتح الصفحة${X}`); skipped++; continue; }
    if (!live.price) { console.log(`${R}✘ ${tag} — بلا سعرٍ معلن${X}`); skipped++; continue; }
    if (!live.inStock) { console.log(`${Y}✘ ${tag} — نافدٌ الآن، يُؤجَّل${X}`); skipped++; continue; }

    ready.push({ part, price: live.price, image: live.image });
    console.log(`${G}✔${X} ${String(live.price).padStart(8)} ﷼  ${tag} ${D}(${part.category})${X}`);
  }

  console.log(`\n${ready.length} جاهزة · ${skipped} متروكة`);
  if (!commit || !ready.length) { await prisma.$disconnect(); return; }

  let added = 0;
  for (const { part, price, image } of ready) {
    await prisma.$transaction(async (tx) => {
      const comp = await tx.component.create({
        data: {
          categoryId: catId.get(part.category)!,
          brand: part.brand,
          name: part.name,
          price,
          tdpWattage: 0,
          performanceTier: part.tier,
          specs: part.specs,
          imageUrl: image,
          description: part.description,
          /* الأعمدة القديمة تُكتب أيضاً — بعض الشيفرة ما زالت تقرؤها */
          microlessUrl: part.url,
          microlessPrice: price,
          microlessInStock: true,
          lastScrapedAt: new Date(),
        },
      });
      await tx.componentOffer.create({
        data: {
          componentId: comp.id,
          storeId: store.id,
          url: part.url,
          price,
          inStock: true,
          lastCheckedAt: new Date(),
        },
      });
      /* نقطةُ سعرٍ أولى: بلا سجلٍّ لا رسم بيانيّ ولا «أدنى سعر منذ شهر» */
      await tx.priceHistory.create({
        data: { componentId: comp.id, store: 'microless', price },
      });
    });
    added++;
  }
  console.log(`${G}أُضيفت ${added} قطعة${X}`);
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
