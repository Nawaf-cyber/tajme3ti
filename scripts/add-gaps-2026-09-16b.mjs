/**
 * ============ الدفعة الثانية — نوكتوا ومنخفضُ الارتفاع ============
 *
 * الدفعةُ الأولى اليوم سدّت لوحةَ ASUS B850 وثلاثةَ مبرّدات. وهذا ما بان
 * بعدها حين وُسّع البحث:
 *
 * ١) **نوكتوا غائبةٌ تماماً** — وهي أشهر ما يُوصى به في تبريد الهواء.
 *    وأهمُّ ما تعطيه هنا ليس الاسم بل **الارتفاع**: عندنا ستّةُ كيسات
 *    Mini-ITX و**صفرُ مبرّداتٍ منخفضة**. أقصرُ ما نحمله DeepCool AG300
 *    بـ١٢٩ مم — ولا يدخل NR200P ولا H210 بمروحةٍ فوقه. فكان الباني
 *    يقبل تجميعةً لا تُغلق.
 *
 * ٢) **قفزةُ السعر في المعالجات عند ٧٦٩ ﷼**: بين Ryzen 5 7600X (٧٦٩)
 *    وما تحته لا شيء بـDDR5 وستّ نوىً **يأتي معه مبرّد**. و8400F يملأها.
 *
 * ٣) **أسرعُ رامٍ عندنا 7200MT/s** — و8000 موجودةٌ بسعرٍ أقلّ من أطقم
 *    6000 كثيرة عندنا.
 *
 * ⚠️ وكلُّ سعرٍ قُرئ من صفحة المنتج، وكلُّ مقبسٍ وارتفاعٍ من صفحة الصانع
 * لا من عنوان المتجر. و«Assassin Spirit 120 EVO WHITE» تحديداً: عنوانُ
 * أمازون يُسقط LGA1851 وصفحةُ Thermalright تُثبته — فأُخذ من الصانع.
 *
 * ⚠️ و8400F **بنسخة الصندوق** (`100-100001591box`) لا التراي: التراي
 * بـ٥٩٠ ﷼ يأتي بلا مبرّد، والصندوق بـ٦٨٦ معه Wraith Stealth. والفرقُ
 * ٩٦ ﷼ بينما أرخصُ مبرّدٍ عندنا ٦٠ — فالتراي ليس أوفر، وهو الفخّ الذي
 * حذفنا من أجله عرضين قبل أسابيع.
 *
 *   node scripts/add-gaps-2026-09-16b.mjs           # عرض
 *   node scripts/add-gaps-2026-09-16b.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const COOLER = 'cmszm2ym00000swymvd5s2yxm';
const CPU = 'cmpfziqb20000x4ymfmkovawm';
const RAM = 'cmpfziqks0003x4yma730h1be';
const STORAGE = 'cmpfziqr70005x4ym3k7uh079';

/* مراجعُ الأوصاف — قُرئت من القاعدة */
const AG400_W = 'cmszmcl500002zsym6wx8hykr';
const PHANTOM_EVO = 'cmtcr2dw50009o8ym694ecx7s';
const ASSASSIN_X_W = 'cmtjkyum4001670ym0xp21tr0';
const NR200P = 'cmpieb303000b00ymn7wfi2t2';
const R5_7500F = 'cmrd7ir6a000004l6ytznx4nk';
const R5_8500G = 'cmpiecxkd006200ymru4pgipc';
const NM790_2TB = 'cmsxgeu21000aj8ym2g1a4nsl';
const TZ5_6400 = 'cmpiebcpt001d00ymnktdbbjv';

const PARTS = [
  {
    categoryId: COOLER, brand: 'Noctua', name: 'NH-D12L chromax.black',
    tdpWattage: 0, performanceTier: 4,
    specs: {
      type: 'Air', rgb: 'No', color: 'Black', sizeMm: '145', fanSize: '120mm', fanCount: '1',
      sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', clearanceMm: '0',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/noctua-nh-d12l-cpu-air-cooler-dual-tower-heatsink-120mm-nf-a12x25r-pwm-fan-low-profile-145mm-height-ultra-quiet-premium-cooling-am5-am4-intel-lga1851-lga1700-compatible-black-nh-d12l-ch-bk/' }],
    description: `### Noctua NH-D12L chromax.black

أوّل نوكتوا في الكتالوج. وبرجان في **١٤٥ مم** — أي أقصرُ بـ١٣ مم من مبرّدات ١٢٠ مم المعتادة، وأقصرُ بـ١٥ مم من Phantom Spirit Vision.

**التقنيات الأساسية المدعومة:**

[green]ارتفاع 145 مم:[/green] يدخل كيساتٍ ضيّقة كانت محصورةً بمبرّدات مروحة ٩٢ مم، ويدخل هياكل 4U.

[green]توافق رام 100٪:[/green] المروحة واحدة والزعانف غير متناظرة، فلا يمرّ المشتّت فوق فتحات الذاكرة إطلاقاً — تركّب أيَّ طقمٍ بأي ارتفاع.

[green]مروحة NF-A12x25r:[/green] النسخة الدائرية من أشهر مروحة ١٢٠ مم في السوق، بمحمل SSO2.

[green]تثبيت SecuFirm2 وضمان ٦ سنوات:[/green] وأطولُ ضمانٍ في فئة المبرّدات عندنا.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* خمسةُ أنابيب حرارية ومروحةٌ واحدة — دون Phantom Spirit (سبعة أنابيب ومروحتان) في الحمل الطويل.
* ثمنُه أعلى من مبرّداتٍ تُبرّد مثله أو أكثر؛ ما تدفعه الزيادة هو الارتفاع المنخفض والهدوء والضمان.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة ARGB ولا شاشة.

---
بإمكانك التوجه إلى [Thermalright Phantom Spirit 120 EVO](/components/${PHANTOM_EVO}) إذا كان توجهك يتركز على الآتي:
* تبريدٌ أقوى بسعرٍ أقلّ — إن كان كيسك يقبل ١٥٥ مم.
https://noctua.at/en/nh-d12l`,
  },
  {
    categoryId: COOLER, brand: 'Noctua', name: 'NH-L9a-AM5',
    tdpWattage: 0, performanceTier: 2,
    specs: {
      type: 'Air', rgb: 'No', color: 'Brown', sizeMm: '37', fanSize: '92mm', fanCount: '1',
      sockets: 'AM5', clearanceMm: '0',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/noctua-nh-l9a-am5-cpu-cooler-nf-a9x14-hs-pwm-fan-2500-rpm-fan-speed-33-84-cfm-fan-airflow-secufirm2-am5-mounting-kit-copper-base-fins-aluminum-cooling-fins-brown-nh-l9a-am5/' }],
    description: `### Noctua NH-L9a-AM5

**٣٧ مم.** أقصرُ مبرّدٍ في الكتالوج بفارقٍ هائل — ما كان أقصرَ قبله ١٢٩ مم.

وهذه ليست مبالغة: عندنا ستّةُ كيسات Mini-ITX، وأشهرُها Cooler Master NR200P يقبل ٧٦ مم فقط في الوضع الذي تُركَّب فيه مروحةٌ فوق المعالج. فكان الباني يقبل تجميعةً **لا تُغلق**.

**التقنيات الأساسية المدعومة:**

[green]ارتفاع 37 مم:[/green] يدخل كلّ كيسٍ صغيرٍ عندنا بلا استثناء، ولا يزاحم كرت الشاشة ولا الرام.

[green]لا يتجاوز حدود المقبس:[/green] المشتّت بمساحة اللوحة تحته، فلا يعترض فتحات الذاكرة ولا المشتّتات المجاورة.

[green]مروحة NF-A9x14 HS-PWM ٢٥٠٠ دورة:[/green] ١٤ مم سماكة، وهدوءٌ لا تعطيه مراوح الكيسات الصغيرة عادةً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **٦٥ واط فقط** عملياً — لمعالجات Ryzen 5 غير المكسورة. لا يناسب Ryzen 7 ولا 9 تحت حمل.
* **AM5 وحده** — لا AM4 ولا إنتل. لكلّ منصّةٍ نسخةٌ بمقبسها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة، واللون البنّي/البيج علامةُ نوكتوا المعروفة — لمن يريد الأسود فنسخة chromax.black.

---
بإمكانك التوجه إلى [Cooler Master MasterBox NR200P](/components/${NR200P}) إذا كنت تبني على هذا المبرّد — فهو الكيس الذي وُجد لمثله.

بإمكانك التوجه إلى [DeepCool AG400 G2 ARGB White](/components/${AG400_W}) إذا كان توجهك يتركز على الآتي:
* معالجٌ أعلى استهلاكاً في كيسٍ يقبل ١٥٢ مم.
https://noctua.at/en/nh-l9a-am5`,
  },
  {
    categoryId: COOLER, brand: 'Noctua', name: 'NH-L9i-17xx chromax.black',
    tdpWattage: 0, performanceTier: 2,
    specs: {
      type: 'Air', rgb: 'No', color: 'Black', sizeMm: '37', fanSize: '92mm', fanCount: '1',
      sockets: 'LGA1851/LGA1700', clearanceMm: '0',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/noctua-nh-l9i-17xx-cpu-cooler-ultra-low-profile-37mm-height-silent-air-cooling-solution-for-intel-lga1700-lga1851-sockets-compact-92mm-pwm-fan-low-noise-cooling-chromax-black-nh-l9i-17xx-ch-bk/' }],
    description: `### Noctua NH-L9i-17xx chromax.black

توأمُ NH-L9a لكن لمقابس إنتل الحديثة — **٣٧ مم** وباللون الأسود كاملاً.

**التقنيات الأساسية المدعومة:**

[green]ارتفاع 37 مم:[/green] يدخل أضيق الكيسات الصغيرة، ويترك مجالاً لمروحةٍ فوقه.

[green]LGA1851 وLGA1700:[/green] يغطّي Core Ultra والجيلين ١٢ و١٣ و١٤.

[green]أسود بالكامل:[/green] المشتّت والمروحة معاً — لمن لا يريد بنّي نوكتوا.

[green]لا يتجاوز حدود المقبس:[/green] توافقُ رامٍ كامل بلا استثناء.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **٦٥ واط عملياً** — لمعالجات Core i3 وi5 غير المكسورة، لا لـi7 ولا i9.
* إنتل وحدها — لا AM5 ولا AM4.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة ولا شاشة.

---
بإمكانك التوجه إلى [Thermalright Assassin X 120 Refined SE ARGB White](/components/${ASSASSIN_X_W}) إذا كان توجهك يتركز على الآتي:
* معالجٌ أقوى، وكيسٌ يقبل الارتفاع الكامل، وسعرٌ أقلّ.
https://noctua.at/en/nh-l9i-17xx-chromax-black`,
  },
  {
    categoryId: COOLER, brand: 'Thermalright', name: 'Assassin Spirit 120 EVO ARGB White',
    tdpWattage: 0, performanceTier: 2,
    specs: {
      type: 'Air', rgb: 'Yes', color: 'White', sizeMm: '156', fanSize: '120mm', fanCount: '1',
      sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/thermalright-assassin-spirit-120-evo-argb-cpu-air-cooler-single-tower-4x6mm-heatpipes-120mm-argb-fan-2000rpm-68-9cfm-28-2db-s-fdb-bearing-white-assassin-spirit-120-evo/' }],
    description: `### Thermalright Assassin Spirit 120 EVO ARGB White

برجٌ واحد أبيض بمروحة ARGB — أرخصُ طريقٍ إلى تجميعةٍ بيضاء مضيئة.

**التقنيات الأساسية المدعومة:**

[green]4 أنابيب حرارية 6 مم بتقنية AGHP:[/green] تكفي معالجاً متوسّطاً بلا كسر سرعة.

[green]مروحة 120 مم ARGB حتى 2000 دورة:[/green] على موصّل ٥ فولت ٣ بن القياسيّ، فتتزامن مع اللوحة الأمّ.

[green]يغطّي المقابس الحيّة كلّها:[/green] AM5 وAM4 وLGA1851 وLGA1700 وما قبلها — والقائمة من صفحة الصانع، وعناوين المتاجر تُسقط منها 1851.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **ارتفاعه ١٥٦ مم** — راجع خلوص كيسك؛ كثيرٌ من المتوسّطة يقف عند ١٥٥.
* ٢٨٫٢ ديسيبل على أقصى سرعة — مسموعٌ تحت الحمل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* برجٌ واحد ومروحةٌ واحدة — لا يناسب Ryzen 9 ولا i9.

---
بإمكانك التوجه إلى [Thermalright Assassin X 120 Refined SE ARGB White](/components/${ASSASSIN_X_W}) إذا كان توجهك يتركز على الآتي:
* نفس الفئة بسعرٍ أقلّ وارتفاعٍ أقصر.
https://www.thermalright.com/product/assassin-spirit-120-evo-white-argb/`,
  },
  {
    categoryId: CPU, brand: 'AMD', name: 'Ryzen 5 8400F',
    tdpWattage: 65, performanceTier: 2,
    specs: {
      socket: 'AM5', cores: '6', threads: '12', baseClock: '4.2 GHz', boostClock: '4.7 GHz',
      l3Cache: '16MB', architecture: 'Zen 4', includedCooler: 'Wraith Stealth',
      integratedGraphics: 'None', memorySupport: 'DDR5-5200',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/amd-ryzen-5-8400f-am5-desktop-processor-6-cores-12-threads-4-7-ghz-max-boost-clock-6mb-l2-16mb-l3-cache-ddr5-5200-memory-zen-4-architecture-includes-wraith-stealth-cooler-100-100001591box/' }],
    description: `### AMD Ryzen 5 8400F

ستُّ نوىً على AM5 **ومعه مبرّده** — وهذا مربطُ الفرس. أرخصُ معالجات AM5 عندنا تأتي بلا مبرّد، فيُضاف إليها ستّون ريالاً على الأقلّ. و8400F يدخل بالمبرّد في الصندوق.

**التقنيات الأساسية المدعومة:**

[green]6 نوى و12 خيطاً بمعمارية Zen 4:[/green] نفس معمارية Ryzen 7000، بتردّد يصل ٤٫٧ جيجاهرتز.

[green]Wraith Stealth في الصندوق:[/green] يكفي ٦٥ واط هذا المعالج بلا شراءٍ إضافيّ.

[green]مقبس AM5 حيّ:[/green] طريقُ ترقيةٍ إلى Ryzen 9000 لاحقاً بلا تغيير لوحةٍ ولا رام.

[green]65 واط:[/green] مزوّدٌ متواضعٌ يكفيه، وحرارتُه منخفضة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **١٦ ميجابايت L3 فقط** — نصفُ ما في Ryzen 5 7600. وهو ما يُشعر به في الألعاب أكثر من التردّد.
* الذاكرة رسمياً DDR5-5200، وPCIe 4.0 لا 5.0 — شريحة Phoenix لا Raphael.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* **لا كرت شاشة مدمج** (حرف F) — لا صورة بلا كرتٍ منفصل.
* نسخة «Tray» تُباع أرخص بلا مبرّد؛ الفرق لا يستحقّ بعد شراء مبرّدٍ مستقلّ.

---
بإمكانك التوجه إلى [AMD Ryzen 5 7500F](/components/${R5_7500F}) إذا كان توجهك يتركز على الآتي:
* ٣٢ ميجابايت L3 وPCIe 5.0 — أداءُ ألعابٍ أعلى، لكن بلا مبرّدٍ في الصندوق.

بإمكانك التوجه إلى [AMD Ryzen 5 8500G](/components/${R5_8500G}) إذا كان توجهك يتركز على الآتي:
* كرت شاشة مدمج يُشغّل الجهاز بلا كرتٍ منفصل.
https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-5-8400f.html`,
  },
  {
    categoryId: RAM, brand: 'Kingston', name: 'FURY Renegade RGB 32GB (2x16GB) DDR5 8000MHz CL38',
    tdpWattage: 0, performanceTier: 5,
    specs: {
      type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '8000', casLatency: 'CL38',
      profile: 'XMP 3.0', rgb: 'Yes', color: 'Black',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/kingston-fury-renegade-rgb-32gb-16gb-x2-ddr5-desktop-memory-cl38-cas-latency-8000mt-s-speed-non-ecc-dimm-288-pin-1-4-voltage-intel-xmp-3-0-support-kf580c38rsak2-32/' }],
    description: `### Kingston FURY Renegade RGB 32GB (2x16GB) DDR5 8000MHz CL38

**٨٠٠٠ ميجاترانسفر** — أسرعُ طقمٍ في الكتالوج، وما كان قبله ٧٢٠٠. والأغرب أنّه أرخصُ من أطقم ٦٠٠٠ كثيرةٍ عندنا.

**التقنيات الأساسية المدعومة:**

[green]8000MT/s بـCL38:[/green] توقيت 38-48-48-128 على ١٫٤٥ فولت، مفحوصٌ مصنعياً على السرعة المعلنة.

[green]XMP 3.0 بملفّين قابلين للتعديل:[/green] وPMIC قابلٌ للبرمجة على اللوحة نفسها.

[green]إضاءة ARGB بـ18 نمطاً:[/green] مع Infrared Sync لمزامنة العصاتين بلا كابل.

[green]On-die ECC:[/green] تصحيحُ أخطاءٍ داخل الشريحة — من متطلّبات DDR5 وليس ECC كامل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **هذا طقمُ إنتل.** على AM5 لا تبلغ ٨٠٠٠ عملياً: منصّةُ AMD تعمل أفضل ما تكون عند ٦٠٠٠–٦٤٠٠ بنسبة ١:١ مع وحدة التحكّم، وما فوقها يكسر النسبة فيقلّ الأداء رغم زيادة الرقم.
* الملفّ XMP لا EXPO — تقرؤه لوحات AM5 غالباً، لكنّه ليس مضبوطاً لها.
* ١٫٤٥ فولت — أعلى من المعتاد، فحرارةُ العصا أعلى.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلوغُ ٨٠٠٠ يحتاج لوحةً ومعالجاً يقبلانها — وليست كلُّ لوحات LGA1851 كذلك.

---
بإمكانك التوجه إلى [G.Skill Trident Z5 RGB 32GB 6400MHz](/components/${TZ5_6400}) إذا كان توجهك يتركز على الآتي:
* سرعةٌ تبلغها كلُّ اللوحات بلا ضبطٍ يدويّ.
https://www.kingston.com/en/memory/gaming/fury-renegade-ddr5-rgb`,
  },
  {
    categoryId: STORAGE, brand: 'Lexar', name: 'NM790 1TB',
    tdpWattage: 0, performanceTier: 4,
    specs: {
      type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280',
      readSpeed: '7400 MB/s', writeSpeed: '6500 MB/s',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/lexar-nm790-1-tb-m-2-2280-pcie-gen4x4-nvme-internal-ssd-up-to-7400-mb-s-read-up-to-6500mb-s-write-speeds-1-5m-hours-mtbf-1000tbw-endurance-compatible-with-playstation5-black-lnm790x001t-rnnng/' }],
    description: `### Lexar NM790 1TB

كان عندنا NM790 بسعتَي ٢ و٤ تيرابايت وينقصه أصغرُها. و**١ تيرابايت بـ٧٤٠٠ ميجابايت/ث** أرخصُ طريقٍ إلى قرص Gen4 كامل السرعة في الكتالوج.

**التقنيات الأساسية المدعومة:**

[green]7400/6500 ميجابايت/ث:[/green] سرعةُ Gen4 القصوى تقريباً — لا تنازل مقابل السعر.

[green]1000 تيرابايت كتابة (TBW):[/green] متانةٌ أعلى من أقراص الفئة نفسها، وأعلى من كثيرٍ من أقراص ٢ تيرابايت الأرخص.

[green]M.2 2280 بلا DRAM لكن بـHMB:[/green] يستعير من رام النظام بدل شريحةٍ مستقلّة — وهو سبب السعر.

[green]معتمدٌ لبلايستيشن 5.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا DRAM مستقلّة — الكتابةُ المتواصلة الطويلة (نقلُ مئات الجيجابايت دفعةً) تهبط بعد نفاد الذاكرة المؤقّتة.
* بلا مشتّت حراريّ في العلبة؛ لوحاتٌ كثيرة تعطي واحداً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* PCIe 4.0 لا 5.0.

---
بإمكانك التوجه إلى [Lexar NM790 2TB](/components/${NM790_2TB}) إذا كان توجهك يتركز على الآتي:
* ضعفُ السعة بأقلّ من ضعف السعر.
https://www.lexar.com/product/lexar-nm790-m-2-2280-pcie-gen4x4-nvme-ssd/`,
  },
];

/** عرضٌ يُضاف إلى قطعةٍ قائمة — لا قطعةٌ جديدة */
const NEW_OFFERS = [
  {
    componentId: 'cmpfzir160007x4ym7w2xdh50',
    label: 'AMD Ryzen 7 9800X3D',
    store: 'microless',
    /* ⚠️ `wof` = Without Fan، وهو الصحيح: 9800X3D يأتي فعلاً بلا مبرّد،
       ومواصفاتُنا تقول `includedCooler: None`. فالرابط للنسخة الصحيحة. */
    url: 'https://saudi.microless.com/product/amd-ryzen-7-9800x3d-am5-desktop-processor-8-cores-16-threads-up-to-5-2-ghz-max-boost-clock-integrated-amd-radeon-graphics-192gb-max-memory-dual-channel-96mb-l3-cache-100-100001084wof/',
    why: 'مصدرٌ ثانٍ بـ١٥٨٩ ﷼ بدل ١٩١٢ المعروضة — ١٧٪ أقلّ على أكثرِ معالجٍ يُسأل عنه',
  },
];

// ---------------------------------------------------------------- التنفيذ

const stores = Object.fromEntries(
  (await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]),
);

let blocked = false;
for (const p of PARTS) {
  console.log(`\n=== ${p.brand} ${p.name}`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  const dup = await prisma.component.findFirst({ where: { name: p.name, brand: p.brand } });
  if (dup) { console.log(`    ⛔ موجودة: ${dup.id}`); blocked = true; }
  for (const o of p.offers) {
    if (!stores[o.store]) { console.log(`    ⛔ لا متجر «${o.store}»`); blocked = true; continue; }
    const taken = await prisma.componentOffer.findFirst({ where: { url: o.url }, select: { component: { select: { name: true } } } });
    if (taken) { console.log(`    ⛔ رابط ${o.store} مستعمل في: ${taken.component.name}`); blocked = true; }
    else console.log(`    ✔ ${o.store}`);
  }
}

console.log('\n=== عروضٌ لقطعٍ قائمة');
for (const o of NEW_OFFERS) {
  const c = await prisma.component.findUnique({ where: { id: o.componentId }, select: { name: true } });
  const taken = await prisma.componentOffer.findFirst({ where: { url: o.url } });
  const already = await prisma.componentOffer.findFirst({ where: { componentId: o.componentId, storeId: stores[o.store] } });
  console.log(`    ${c ? c.name : '⛔ قطعةٌ مفقودة'} + ${o.store} — ${o.why}`);
  if (!c) blocked = true;
  if (taken) { console.log('    ⛔ الرابط مستعمل'); blocked = true; }
  if (already) { console.log(`    ⛔ للقطعة عرضٌ من ${o.store} أصلاً`); blocked = true; }
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-gaps-b-${stamp}.json`, JSON.stringify({ PARTS, NEW_OFFERS }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-gaps-b-${stamp}.json`);

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
for (const o of NEW_OFFERS) {
  await prisma.componentOffer.create({ data: { componentId: o.componentId, storeId: stores[o.store], url: o.url, inStock: true } });
  ids.push(o.componentId);
  console.log(`✔ عرض ${o.store} → ${o.label}`);
}

console.log(`\nالتالي:\n  npx tsx scripts/scrape-one.ts ${ids.join(' ')}\n  npx tsx scripts/fetch-images.ts --missing`);
await prisma.$disconnect();
