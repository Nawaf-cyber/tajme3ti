/**
 * ============ الدفعة الثالثة — الكيسات والمزوّدات وكرتان ============
 *
 * الكيسات أكثرُ فئةٍ فيها موتى: ثمانٍ من أربعين بلا عرضٍ حيّ. وأشهرُ ما
 * في السوق اليوم ليس عندنا: O11 Vision Compact وMeshify 3 وNorth العاديّ
 * (عندنا XL وحده).
 *
 * ⚠️ وسقط من القائمة ما ظننتُه ثغرة: **طقم رام ١٦ جيجابايت**. Corsair
 * Vengeance RGB 16GB بـ١١٥٩ ﷼ بدا سدّاً لأكثر ما يُبحث عنه — حتى قُورن
 * بما عندنا: G.Skill Flare X5 16GB (2x8GB) DDR5-**6000 CL30** بـ**٨١٧**.
 * أي أنّ المرشَّح أغلى بـ٣٤٢ ريالاً وأبطأ (5200 CL40). فالفجوة لم تكن
 * فجوةً، وإضافتُه كانت ستُضعف الفئة لا تُقوّيها.
 *
 * ⚠️ وكلُّ `maxGpuLength` و`maxCoolerHeight` من صفحة الصانع لا من عنوان
 * المتجر — عليهما يقوم فحصُ التوافق في الباني، ورقمٌ مُخمَّن هنا يعني
 * تجميعةً لا تُغلق. (Meshify 3: المراجعات تقول ١٧٣ و١٨٥، وورقةُ Fractal
 * تقول **١٧٣** — فأُخذ الأصغر الموثّق.)
 *
 * ⚠️ وGigabyte 9070 XT Gaming OC ICE **٢٨٨ مم بثلاثة موصّلات 8-pin**،
 * وSapphire PULSE **٣٢٠ مم بموصّلين**. الفرقُ يغيّر أيَّ كيسٍ ومزوّدٍ
 * يقبلهما، فلا يُنسخ رقمُ أحدهما للآخر.
 *
 *   node scripts/add-gaps-2026-09-18.mjs           # عرض
 *   node scripts/add-gaps-2026-09-18.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const CASE = 'cmpfziquj0006x4ym53f0ehcw';
const PSU = 'cmpfziqh70002x4ym6ln587z2';
const GPU = 'cmpfziqnv0004x4ymffnp204c';

/* مراجعُ الأوصاف — قُرئت من القاعدة */
const O11_EVO = 'cmpieb3ts000e00ymflyrzgd2';
const MESHIFY_2 = 'cmpiec0gj002i00ymud3xdj2y';
const NORTH_XL = 'cmpieb4ax000g00ymgj1zamtu';
const KING_65 = 'cmtcr2hdn000ro8ym9825hfit';
const LANCOOL_216 = 'cmpfzir17000gx4ymtjjn4ag1';
const A1000G = 'cmr3f2h6q0006ncymnqmyss5w';
const PURE_13M = 'cmpiebabc001200ymf3v1d2y6';
const RX9070XT = 'cmpi143h6000004l7p2q35kwr';

const PARTS = [
  {
    categoryId: CASE, brand: 'Lian Li', name: 'O11 Vision Compact White',
    tdpWattage: 0, performanceTier: 4,
    specs: {
      formFactor: 'Mid Tower', color: 'White', dualChamber: 'Yes',
      maxGpuLength: '408', maxCoolerHeight: '170', radiatorSupport: '360mm',
      psuFormFactor: 'ATX', includedFans: 'لا يوجد',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/lian-li-o11-vision-compact-tower-computer-case-up-to-360mm-radiator-9x-120mm-fan-support-1x-4mm-1x-3mm-tempered-glass-panels-steel-aluminum-materials-white-g99-o11vpw-00/' }],
    description: `### Lian Li O11 Vision Compact White

نسخةٌ أصغر من O11 Vision بثلاث واجهاتٍ زجاجيّة — الأمام والجنب والأعلى — وغرفتين تُخفيان المزوّد والكابلات خلف اللوحة.

**التقنيات الأساسية المدعومة:**

[green]كرت حتى 408 مم:[/green] يقبل أطول كروت الجيل الحالي، ومعه حاملُ كرتٍ مضادّ للتدلّي قابلٌ للضبط.

[green]غرفتان (Dual Chamber):[/green] المزوّد والأقراص خلف اللوحة، فتبقى الغرفةُ الأمامية نظيفة.

[green]رادييتر 360 مم في ثلاثة مواضع:[/green] الأعلى والجنب والأسفل — تسع مراوح ١٢٠ مم بحدٍّ أقصى.

[green]زجاجٌ مقسّى بسماكتين:[/green] ٤ مم للوحة الجانبية و٣ مم للباقي.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **مبرّدٌ هوائيّ حتى ١٧٠ مم فقط** — يقبل Phantom Spirit ولا يقبل ما فوقه.
* **لا مراوح في العلبة إطلاقاً.** احسب ثمن ثلاثٍ على الأقلّ فوق سعر الكيس.
* رادييتر ٣٦٠ في الأمام يحتاج مراوح لا تتجاوز ٢٥ مم سماكة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* الزجاج الثلاثيّ يعني حرارةً أعلى من كيسٍ شبكيّ بنفس المراوح.

---
بإمكانك التوجه إلى [Lian Li O11 Dynamic EVO](/components/${O11_EVO}) إذا كان توجهك يتركز على الآتي:
* رادييتر ٤٢٠ مم وكرتٌ أطول، بسعرٍ أقلّ.
https://lian-li.com/product/o11-vision-compact/`,
  },
  {
    categoryId: CASE, brand: 'Fractal Design', name: 'North Momentum Edition (Black)',
    tdpWattage: 0, performanceTier: 4,
    specs: {
      formFactor: 'Mid Tower', color: 'Black',
      maxGpuLength: '355', maxCoolerHeight: '170', radiatorSupport: '360mm',
      psuFormFactor: 'ATX', includedFans: '3x 120mm Momentum',
      features: ['واجهة أمامية من خشبٍ حقيقي'],
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/fractal-design-north-momentum-edition-atx-gaming-case-3x-120mm-momentum-fans-included-up-to-360mm-radiator-7-expansion-slots-tempered-glass-panel-cable-management-black-fd-c-nor1c-05/' }],
    description: `### Fractal Design North Momentum Edition (Black)

كان عندنا North **XL** وحده. وهذه النسخة العاديّة — نفس الواجهة الخشبيّة التي جعلت الكيس مشهوراً، بحجمٍ متوسّطٍ وسعرٍ أقلّ.

**التقنيات الأساسية المدعومة:**

[green]واجهة من خشبٍ حقيقيّ:[/green] ليست طبقةً مطبوعة — وهي سببُ شهرة هذا الكيس، ويناسب من لا يريد جهازاً يبدو «قيمنق».

[green]ثلاث مراوح Momentum 120 مم في العلبة:[/green] لا تحتاج شراءً إضافياً ليعمل التهوية.

[green]رادييتر حتى 360 مم في الأمام:[/green] و٢٤٠ في الأعلى و١٢٠ في الخلف.

[green]سبع فتحات توسعة ولوحٌ زجاجيّ مقسّى.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **كرت حتى ٣٥٥ مم** — أقصر بـ٥٨ مم من North XL. راجع طول كرتك؛ كروت 5090 وبعض 9070 XT تتجاوزه.
* **مبرّدٌ هوائيّ حتى ١٧٠ مم.**
* الواجهة الخشبيّة تقيّد الهواء أكثر من الشبك — التهوية جيّدة لا ممتازة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة ARGB في المراوح المرفقة.

---
بإمكانك التوجه إلى [Fractal Design North XL](/components/${NORTH_XL}) إذا كان توجهك يتركز على الآتي:
* كرتٌ حتى ٤١٣ مم ورادييتر ٤٢٠ ومبرّدٌ حتى ١٨٥ مم.
https://www.fractal-design.com/products/cases/north/north/`,
  },
  {
    categoryId: CASE, brand: 'Fractal Design', name: 'Meshify 3 White',
    tdpWattage: 0, performanceTier: 4,
    specs: {
      formFactor: 'Mid Tower', color: 'White',
      maxGpuLength: '349', maxCoolerHeight: '173', radiatorSupport: '360mm',
      psuFormFactor: 'ATX', includedFans: '3x Momentum 140mm',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/fractal-design-meshify-3-atx-mid-tower-computer-case-3x-momentum-14-fans-up-to-360mm-radiator-6x-fan-support-cable-organizers-clear-tint-glass-panel-white-fd-c-mes3a-04/' }],
    description: `### Fractal Design Meshify 3 White

الجيل الثالث من Meshify — واجهةٌ شبكيّة بالكامل وثلاث مراوح ١٤٠ مم في العلبة. وعندنا Meshify 2 وحده، وبينهما خمسُ سنوات.

**التقنيات الأساسية المدعومة:**

[green]3 مراوح Momentum 140 مم أماميّة:[/green] مقاسٌ أكبر من ١٢٠، فهواءٌ أكثر بضجيجٍ أقلّ عند نفس التبريد.

[green]واجهة شبكيّة كاملة:[/green] وهي سببُ وجود خطّ Meshify — التهوية قبل الشكل.

[green]رادييتر 360 مم أماميّ و280 علويّ.[/green]

[green]يقبل لوحات E-ATX حتى 277 مم:[/green] ومنظّمات كابلاتٍ مدمجة خلف اللوحة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **كرت حتى ٣٤٩ مم** — أقصر بـ١١٨ مم من Meshify 2. راجع طول كرتك قبل الشراء.
* **مبرّدٌ هوائيّ حتى ١٧٣ مم** (رقمُ ورقة Fractal؛ بعض المراجعات تقول ١٨٥).
* مزوّدٌ حتى ١٨٠ مم طولاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة في المراوح المرفقة — نسخة RGB منفصلة وأغلى.

---
بإمكانك التوجه إلى [Fractal Design Meshify 2](/components/${MESHIFY_2}) إذا كان توجهك يتركز على الآتي:
* كرتٌ حتى ٤٦٧ مم ورادييتر ٤٢٠ مم — مساحةٌ أكبر بكلّ المقاييس.
https://www.fractal-design.com/products/cases/meshify/meshify-3/`,
  },
  {
    categoryId: CASE, brand: 'Montech', name: 'KING 65 PRO White',
    tdpWattage: 0, performanceTier: 3,
    specs: {
      formFactor: 'Mid Tower', color: 'White',
      includedFans: '3x ARGB PWM', maxGpuLength: '420', maxCoolerHeight: '175',
      radiatorSupport: '360mm', psuFormFactor: 'ATX',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/montech-king-65-pro-atx-computer-case-3x-argb-pwm-pre-installed-fans-up-to-360mm-radiator-support-9x-fan-support-flat-glass-tinted-panel-white-king-65-pro-white/' }],
    description: `### Montech KING 65 PRO White

النسخة البيضاء من KING 65 PRO الموجود عندنا بالأسود — نفس الهيكل والمراوح والمقاسات، ويتغيّر اللون وحده.

**التقنيات الأساسية المدعومة:**

[green]3 مراوح ARGB بتحكّم PWM في العلبة:[/green] جاهزةٌ من الصندوق بلا شراءٍ إضافيّ.

[green]كرت حتى 420 مم:[/green] من أوسع ما في فئته — يقبل أطول كروت الجيل الحالي بلا قلق.

[green]رادييتر حتى 360 مم ودعم 9 مراوح.[/green]

[green]مبرّدٌ هوائيّ حتى 175 مم:[/green] يقبل Phantom Spirit وNH-D12L ومعظم الأبراج المزدوجة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الأبيض يبقى أبيض إن كانت بقيّة قطعك بيضاء؛ خلطُ الدرجات يظهر.
* اللوح الزجاجيّ المسطّح المعتّم يقلّل وضوح الإضاءة داخل الكيس.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تصميم غرفتين — المزوّد والكابلات في نفس الغرفة مع اللوحة.

---
بإمكانك التوجه إلى [Montech KING 65 PRO](/components/${KING_65}) إذا كان توجهك يتركز على الآتي:
* نفس الكيس بالأسود وبسعرٍ أقلّ.

بإمكانك التوجه إلى [Lian Li LANCOOL 216](/components/${LANCOOL_216}) إذا كان توجهك يتركز على الآتي:
* مروحتا ١٦٠ مم أماميّتان — هواءٌ أكثر بضجيجٍ أقلّ.
https://www.montechpc.com/`,
  },
  {
    categoryId: PSU, brand: 'MSI', name: 'MAG A1000GL PCIe 5',
    tdpWattage: 0, performanceTier: 5,
    specs: { wattage: '1000', rating: '80+ Gold', formFactor: 'ATX 3.1', modularity: 'Full', color: 'Black' },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/msi-mag-a1000gl-pcie5-power-supply-1000w-power-atx-3-1-ready-native-dual-color-pcie-cem-5-1-connector-supports-nvidia-geforce-rtx-40-series-llc-half-bridge-topology-black-306-7zp9b18-ce0/' }],
    description: `### MSI MAG A1000GL PCIe 5

ألفُ واط بمعيار **ATX 3.1** — وهو الأحدث من A1000G الموجود عندنا (ATX 3.0)، وبسعرٍ أقلّ منه.

**التقنيات الأساسية المدعومة:**

[green]ATX 3.1 وPCIe CEM 5.1:[/green] الجيل الذي عالج مشكلة موصّل 12VHPWR — الموصّل هنا 12V-2x6 الأحدث.

[green]موصّل PCIe ثنائيّ اللون:[/green] طرفُه يتغيّر لونه إن لم يدخل كاملاً — علامةٌ بصريّة على التركيب الناقص، وهو سببُ أشهر أعطال كروت 4090.

[green]1000 واط بكفاءة 80+ Gold:[/green] تكفي RTX 5080 أو 9070 XT مع معالجٍ عالي الاستهلاك.

[green]مُجزّأ بالكامل:[/green] لا كابل يبقى في الكيس بلا حاجة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* Gold لا Platinum — كفاءةٌ أقلّ بقليلٍ تحت الحمل المتوسّط.
* بنية LLC نصف جسريّة — كافية، ودون تصاميم الفئة العليا في تثبيت الجهد.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مراقبة رقميّة ولا برنامج تحكّم.

---
بإمكانك التوجه إلى [MSI MPG A1000G PCIe 5](/components/${A1000G}) إذا كان توجهك يتركز على الآتي:
* نفس القدرة بسلسلة MPG الأعلى — إن قبلت معيار ATX 3.0 الأقدم.
https://www.msi.com/Power-Supply/MAG-A1000GL-PCIE5`,
  },
  {
    categoryId: PSU, brand: 'be quiet!', name: 'POWER ZONE 2 850W',
    tdpWattage: 0, performanceTier: 5,
    specs: { wattage: '850', rating: '80+ Platinum', formFactor: 'ATX 3.1', modularity: 'Full', color: 'Black' },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/be-quiet-power-zone-2-fully-modular-power-supply-850w-power-supply-80-plus-platinum-efficiency-pcie-5-1-atx-3-1-compatibility-140-mm-pure-wings-3-fan-black-bp007uk/' }],
    description: `### be quiet! POWER ZONE 2 850W

٨٥٠ واط بكفاءة **Platinum** ومعيار ATX 3.1 — وأغلى مزوّداتنا عند هذه القدرة كانت Gold.

**التقنيات الأساسية المدعومة:**

[green]80+ Platinum:[/green] فقدٌ أقلّ في التحويل — أقلّ حرارةً وأهدأ عند نفس الحمل من Gold.

[green]ATX 3.1 وPCIe 5.1:[/green] يتحمّل قفزات استهلاك الكروت الحديثة اللحظيّة بلا إطفاء.

[green]مروحة Pure Wings 3 مقاس 140 مم:[/green] وbe quiet! شركةٌ اسمُها برنامجُها — الهدوء هو ما تبيعه.

[green]مُجزّأ بالكامل.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ٨٥٠ واط سقفٌ عمليّ: RTX 5090 مع معالجٍ عالٍ يحتاج أكثر.
* Platinum يرفع السعر على Gold بنفس القدرة — الفرقُ في فاتورة الكهرباء لا يعوّضه سريعاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مراقبة رقميّة.

---
بإمكانك التوجه إلى [be quiet! Pure Power 13 M 850W](/components/${PURE_13M}) إذا كان توجهك يتركز على الآتي:
* نفس الشركة وقدرة ٨٥٠ واط بكفاءة Gold وسعرٍ أقلّ.
https://www.bequiet.com/en/powersupply/power-zone-2`,
  },
  {
    categoryId: GPU, brand: 'Sapphire', name: 'PULSE Radeon RX 9070 XT 16GB',
    tdpWattage: 304, performanceTier: 4,
    specs: {
      vram: '16GB', memoryType: 'GDDR6', memoryBus: '256-bit', interface: 'PCIe 5.0 x16',
      architecture: 'RDNA 4', lengthMm: '320', powerConnectors: '2x 8-pin',
      ports: '2x HDMI 2.1b, 2x DP 2.1a',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/sapphire-pulse-amd-radeon-rx-9070-xt-graphics-card-16gb-gddr6-256-bit-memory-2970-mhz-boost-clock-4096-stream-processors-20-gbps-memory-clock-pci-express-5-0-x16-11348-03-20g/' }],
    description: `### Sapphire PULSE Radeon RX 9070 XT 16GB

خطُّ PULSE هو مدخل Sapphire — أقلُّ ما تدفعه مقابل كرت 9070 XT من شركةٍ متخصّصةٍ في رادِيون وحدها.

**التقنيات الأساسية المدعومة:**

[green]4096 وحدة معالجة و16 جيجابايت GDDR6:[/green] بذاكرةٍ بسرعة ٢٠ جيجابت/ث وناقل ٢٥٦ بت.

[green]تردّد Boost يبلغ 2970 ميجاهرتز.[/green]

[green]PCIe 5.0 x16:[/green] وموصّلا طاقة 8-pin قياسيّان — لا حاجة إلى محوّل 12VHPWR.

[green]معمارية RDNA 4:[/green] قفزةٌ حقيقيّة في تتبّع الأشعّة عن الجيل الذي قبلها.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **٣٢٠ مم طولاً وثلاث فتحات** — راجع طول كيسك؛ لا يدخل Meshify 3 (٣٤٩ مم يكفي) لكنّه يضيق في الكيسات الصغيرة.
* ٣٠٤ واط استهلاكاً — مزوّد ٨٥٠ واط موصىً به.
* PULSE أبسطُ خطوطهم تبريداً؛ NITRO+ أهدأ وأبرد وأغلى.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا شاشةٍ ولا إضاءةٍ تُذكر.

---
بإمكانك التوجه إلى [AMD Radeon RX 9070 XT OC](/components/${RX9070XT}) إذا كان توجهك يتركز على الآتي:
* مقارنةُ نسخ الشركات الأخرى من نفس الشريحة.
https://www.sapphiretech.com/en/consumer/pulse-radeon-rx-9070-xt-16g-gddr6`,
  },
  {
    categoryId: GPU, brand: 'Gigabyte', name: 'Radeon RX 9070 XT GAMING OC ICE 16G',
    tdpWattage: 304, performanceTier: 4,
    specs: {
      vram: '16GB', memoryType: 'GDDR6', memoryBus: '256-bit', interface: 'PCIe 5.0 x16',
      architecture: 'RDNA 4', lengthMm: '288', powerConnectors: '3x 8-pin',
      ports: '2x HDMI 2.1b, 2x DP 2.1a',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/gigabyte-radeon-rx-9070-xt-gaming-oc-ice-graphics-card-16gb-gddr6-256-bit-memory-3060-mhz-boost-clock-4096-stream-processors-20-gbps-memory-clock-gv-r907xgamingocice-16gd/' }],
    description: `### Gigabyte Radeon RX 9070 XT GAMING OC ICE 16G

النسخة **البيضاء** من 9070 XT، وأعلى تردّداً من PULSE — و**أقصر بـ٣٢ مم** منها، وهو ما يهمّ من يبني في كيسٍ ضيّق.

**التقنيات الأساسية المدعومة:**

[green]288 مم طولاً:[/green] أقصر من أغلب نسخ 9070 XT — يدخل كيساتٍ لا يدخلها كرتُ ٣٢٠ مم.

[green]تردّد Boost يبلغ 3060 ميجاهرتز:[/green] أعلى بـ٩٠ ميجاهرتز من PULSE.

[green]لونٌ أبيض كامل (ICE):[/green] للتجميعات البيضاء التي يكثر طلبها.

[green]أربعة منافذ عرض:[/green] منفذا HDMI 2.1b ومنفذا DP 2.1a — وأغلب الكروت تعطي واحداً HDMI.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **ثلاثة موصّلات 8-pin** لا اثنان — تأكّد أنّ مزوّدك يعطي ثلاثة كابلات PCIe مستقلّة.
* ارتفاعه ٥٦ مم (ثلاث فتحات) — يغطّي الفتحة المجاورة للوحة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* النسخة البيضاء أغلى من السوداء بنفس الأداء.

---
بإمكانك التوجه إلى [Sapphire PULSE Radeon RX 9070 XT 16GB](/components/PULSE) إذا كان توجهك يتركز على الآتي:
* نفس الشريحة بموصّلَي طاقة بدل ثلاثة، وسعرٍ أقلّ.
https://www.gigabyte.com/Graphics-Card/GV-R907XGAMINGOCICE-16GD/sp`,
  },
];

// ---------------------------------------------------------------- التنفيذ

const stores = Object.fromEntries(
  (await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]),
);

let blocked = false;
for (const p of PARTS) {
  console.log(`\n=== ${p.brand} ${p.name}`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${Array.isArray(v) ? v.join('/') : v}`).join(' · ')}`);
  const dup = await prisma.component.findFirst({ where: { name: p.name, brand: p.brand } });
  if (dup) { console.log(`    ⛔ موجودة: ${dup.id}`); blocked = true; }
  for (const o of p.offers) {
    if (!stores[o.store]) { console.log(`    ⛔ لا متجر «${o.store}»`); blocked = true; continue; }
    const taken = await prisma.componentOffer.findFirst({ where: { url: o.url }, select: { component: { select: { name: true } } } });
    if (taken) { console.log(`    ⛔ رابط ${o.store} مستعمل في: ${taken.component.name}`); blocked = true; }
    else console.log(`    ✔ ${o.store}`);
  }
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-gaps-${stamp}.json`, JSON.stringify(PARTS, null, 2));
console.log(`\nنسخة احتياطية: backups/added-gaps-${stamp}.json`);

const ids = [];
const created = {};
for (const p of PARTS) {
  const { offers, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  for (const o of offers) {
    await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: true } });
  }
  created[p.name] = c.id;
  ids.push(c.id);
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}

/* ⚠️ إحالةٌ بين قطعتين في نفس الدفعة: معرّف Sapphire لا يوجد قبل إنشائه،
   فيُكتب نائباً ثمّ يُستبدل هنا. وبلا هذا يخرج رابطٌ ميّت في الوصف. */
const sapphire = created['PULSE Radeon RX 9070 XT 16GB'];
const ice = created['Radeon RX 9070 XT GAMING OC ICE 16G'];
if (sapphire && ice) {
  const c = await prisma.component.findUnique({ where: { id: ice }, select: { description: true } });
  await prisma.component.update({
    where: { id: ice },
    data: { description: c.description.replace('/components/PULSE', `/components/${sapphire}`) },
  });
  console.log('✔ صُحّحت إحالةُ ICE إلى Sapphire');
}

console.log(`\nالتالي:\n  npx tsx scripts/scrape-one.ts ${ids.join(' ')}\n  npx tsx scripts/fetch-images.ts --missing`);
await prisma.$disconnect();
