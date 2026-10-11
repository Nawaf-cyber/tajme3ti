/**
 * ============ الدفعة العاشرة — المجموعة الأولى (٢٠ من ٤٨) — 2026-10-09 ============
 *
 * طلب نوّاف: «اجمع قطع الان في جدول» ثم «ضيف مجموعات 20 اول شي، وركز على الوصف
 * لا تخليه قليل … والبيانات بعد ركز عليها».
 *
 * المصدر: مسحُ أقسام الرام والكيسات والأقراص في مايكرولس كاملةً بالمتصفّح، وطرحُ ما
 * عندنا، ثم قراءة صفحة كلّ مرشّحٍ في أمازون (الرمز، زرّ الشراء، البائع) ومطابقة ASIN
 * بالقاعدة. هذه المجموعة: الرام الثمانية + الأقراص العشرة + كيسان.
 *
 * البيانات: جدول مواصفات مايكرولس لكلّ قطعة، ومُطابَقة بصفحة الشركة حيث تُفتح:
 *   Corsair (اللون Grey لـZ30 وZ30K — مايكرولس يكتب «white» في رابط Dominator خطأً،
 *   والرمز هو الحَكَم)، G.Skill (RM5RK بملفّي XMP وEXPO، ارتفاع السلسلة 41 مم)،
 *   SanDisk (SN8100 4TB: 2400 TBW)، Crucial (E100 2TB: 100 TBW)، Lexar (NM620 1TB:
 *   3000 كتابة و500 TBW)، NZXT (H6 2026: بلا مراوح، كرت 390 — صفحة الدعم تقول 360).
 *   صفحة Kingston تعرض تحدّي Cloudflare فلم تُقرأ — أرقامها من جدول مايكرولس.
 *   ارتفاع Dominator Titanium (57) من صفّ Dominator الموجود — Corsair لا تنشره للسلسلة.
 *
 *   node scripts/add-batch10-2026-10-09.mjs           # عرض
 *   node scripts/add-batch10-2026-10-09.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const RAM = 'cmpfziqks0003x4yma730h1be';
const STO = 'cmpfziqr70005x4ym3k7uh079';
const CASE = 'cmpfziquj0006x4ym53f0ehcw';

const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });
const M = (slug) => ({ store: 'microless', url: `https://saudi.microless.com/product/${slug}/` });

const ALT = {
  BEAST64_30: ['Kingston Fury Beast 64GB (2x32GB) DDR5 6000MHz CL30', 'cmtjkyciz000670ymzgbqg9si'],
  BEASTRGB64W30: ['Kingston Fury Beast RGB 64GB (2x32GB) DDR5 6000MHz CL30 White', 'cmv18kmb8000bjgyma8357d5a'],
  BEASTRGB64_36: ['Kingston Fury Beast RGB 64GB (2x32GB) DDR5 6000MHz CL36', 'cmv18km0m0008jgymh5clmze1'],
  VEN30: ['Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz CL30', 'cmv18klcb0000jgymj6mis6yg'],
  VENRGB30W: ['Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30 White', 'cmsqkaln50002ugym1alavhrp'],
  VENRGB64: ['Corsair Vengeance RGB 64GB 6400MHz', 'cmpiecrbz005g00ym3k9f15y0'],
  BEASTRGB32W30: ['Kingston Fury Beast RGB 32GB DDR5 6000MHz CL30 White', 'cmtjkyagy000370yml2d0oz5f'],
  LPX32: ['Corsair Vengeance LPX 32GB (2x16GB) DDR4 3600MHz', 'cmr3al4g4000104jy62ztrmu8'],
  PRO990_2: ['Samsung 990 PRO 2TB', 'cmpfzir17000fx4ym3tkdck9n'],
  PRO990_4: ['Samsung 990 PRO 4TB', 'cmuzkkk19001ku4ymij980p9c'],
  P310_2: ['Crucial P310 2TB', 'cmsxgeug6000ej8ymre25guy2'],
  SN8100_2: ['WD Black SN8100 2TB Gen5', 'cmr3fmvf7000d04lh7vnm3p80'],
  MP700AIR: ['Corsair MP700 PRO 1TB Air Cooler', 'cmuztrzzj0022kcymx8nk1xpf'],
  NV3_4: ['Kingston NV3 4TB', 'cmuzymtts0018wwymrnkaz5tv'],
  P310_1: ['Crucial P310 1TB', 'cmr3fmw04000h04lhev74orvq'],
  EVO870_1: ['Samsung 870 EVO 1TB SATA', 'cmr2lb5is000qjgymrzv3tija'],
  H6W: ['NZXT H6 Compact White', 'cmtjkyoi3000u70yms91tejjt'],
  C4000D: ['Corsair 4000D Airflow', 'cmpieb39w000c00ym9n758myw'],
};
const alt = (k, ...why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const MOVE = [];
const EXTRA = [];

const PARTS = [
  // ================================================================ الرام
  {
    categoryId: RAM, brand: 'Kingston', name: 'Fury Beast RGB 64GB (2x32GB) DDR5 6400MHz CL32', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'DDR5', capacity: '64GB', kit: '2x32GB', speed: '6400', casLatency: 'CL32', profile: 'EXPO', rgb: 'Yes', heightMm: '42.23', color: 'Black' },
    offers: [A('B0CYM412PY'), M('kingston-fury-beast-rgb-64gb-2x-32gb-ddr5-desktop-memory-kit-6400mt-s-memory-speed-cl32-cas-latency-288-pin-kit-intel-xmp-3-0-amd-expo-profile-black-kf564c32bbeak2-64')],
    description: `### Kingston Fury Beast RGB 64GB (2x32GB) DDR5 6400MHz CL32

أسرع طقم 64 جيجابايت في سلسلة Fury Beast: شريحتان بسعة 32 جيجابايت على 6400 بتوقيت CL32، بإضاءة RGB وملفّ EXPO جاهز. مكانه جهازٌ يجمع الألعاب مع المونتاج أو البرامج الثقيلة، ويريد صاحبه ألّا يفكّر في الذاكرة لسنوات.

**التقنيات الأساسية المدعومة:**

[green]64 جيجابايت في شريحتين فقط:[/green] السعة كلّها في منفذين ويبقى الآخران فارغين. وهذا هو الطريق الصحيح لهذه السعة: أربع شرائح DDR5 تُجبر المعالج غالباً على خفض السرعة.

[green]6400 MT/s بتوقيت 32-39-39:[/green] زمن الوصول الفعليّ قرابة 10 نانوثانية، مثل أطقم 6000 CL30، مع عرض نطاقٍ أعلى تستفيد منه برامج الضغط والتصيير والمونتاج.

[green]ملفّ AMD EXPO جاهز:[/green] تُفعَّل السرعة والتوقيتات بضغطةٍ واحدة في البايوس بدل الضبط اليدويّ.

[green]شرائح ثنائيّة الرتبة (Dual Rank) بكثافة 16 جيجابت:[/green] الرتبتان تعوّضان جزءاً من فرق السرعة في الألعاب أمام الشرائح أحاديّة الرتبة.

[green]إضاءة RGB بتقنية Infrared Sync:[/green] تتزامن الشريحتان بالأشعّة تحت الحمراء فلا تتباعد ألوانهما، وتُدار ببرنامج Kingston FURY CTRL أو ببرنامج اللوحة الأمّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* على Ryzen 7000 و9000 تتجاوز 6400 النقطة المثلى (6000)، وقد تعمل الذاكرة بنسبة 1:2 مع المتحكّم فيضيع جزءٌ من المكسب. فائدتها الكاملة أوضح مع معالجات Intel الحديثة.
* جهدها 1.40 فولت، فحرارتها أعلى من أطقم 5600 بجهد 1.25. تحتاج تهويةً معقولة في الكيس.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* 64 جيجابايت تزيد عن حاجة الألعاب وحدها، و32 جيجابايت تكفي أيّ لعبةٍ اليوم.
* لا يركب على لوحات DDR4.

${alt('BEAST64_30', 'الطقم نفسه بلا إضاءة على 6000 CL30، وهي النقطة المثلى لمعالجات Ryzen، وسعره أقلّ عادةً.')}
https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-rgb-memory`,
  },
  {
    categoryId: RAM, brand: 'Kingston', name: 'Fury Beast RGB 64GB (2x32GB) DDR5 6000MHz CL30 Black', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'DDR5', capacity: '64GB', kit: '2x32GB', speed: '6000', casLatency: 'CL30', profile: 'EXPO', rgb: 'Yes', heightMm: '42.23', color: 'Black' },
    offers: [A('B0CYM3WCXM'), M('kingston-fury-beast-64gb-32gb-x2-ddr5-rgb-desktop-memory-6000mt-s-memory-speed-cl30-cas-latency-1-4-voltage-288-pin-intel-xmp-amd-expo-black-kf560c30bbeak2-64')],
    description: `### Kingston Fury Beast RGB 64GB (2x32GB) DDR5 6000MHz CL30 Black

الطقم الذي يُنصح به لمعالجات Ryzen حين تكون السعة الكبيرة مطلوبة: 64 جيجابايت على 6000 بتوقيت CL30، بإضاءة RGB ومشتّتٍ أسود. يناسب جهازاً للألعاب والبثّ والمونتاج معاً.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت 30-36-36:[/green] السرعة التي يعمل عندها متحكّم الذاكرة في Ryzen 7000 و9000 بنسبة 1:1 دون إجهاد، فتُعطي أقلّ زمن وصولٍ ممكن على هذه المنصّة.

[green]64 جيجابايت بشريحتين:[/green] تتّسع للمونتاج بدقّة 4K والآلات الافتراضيّة وعشرات التبويبات، ويبقى منفذان فارغان.

[green]ملفّ AMD EXPO جاهز:[/green] تفعيلٌ بضغطة في البايوس، والسرعة مختبَرة على لوحات AMD.

[green]شرائح ثنائيّة الرتبة بكثافة 16 جيجابت:[/green] أداءٌ أفضل في الألعاب من الشرائح أحاديّة الرتبة بالسرعة نفسها.

[green]إضاءة RGB متزامنة:[/green] بتقنية Infrared Sync وبرنامج Kingston FURY CTRL.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* جهدها 1.40 فولت، وحرارتها أعلى قليلاً من الأطقم البطيئة.
* سعره مرتفع مع ارتفاع أسعار الذاكرة، والفرق عن نسخة CL36 لا يظهر إلّا في الألعاب الحسّاسة للذاكرة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* السعة تزيد عن حاجة الألعاب وحدها.
* لا يركب على لوحات DDR4.

${alt('BEASTRGB64W30', 'الطقم نفسه بالأبيض للتجميعات البيضاء.')}
https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-rgb-memory`,
  },
  {
    categoryId: RAM, brand: 'G.Skill', name: 'Ripjaws M5 RGB 64GB (2x32GB) DDR5 5200MHz CL40', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'DDR5', capacity: '64GB', kit: '2x32GB', speed: '5200', casLatency: 'CL40', profile: 'XMP 3.0 & EXPO', rgb: 'Yes', heightMm: '41', color: 'Black' },
    offers: [A('B0D4TB8RP1'), M('g-skill-ripjaws-m5-rgb-series-64gb-2x32gb-ddr5-dual-channel-desktop-memory-5200-mt-s-memory-speed-cl40-40-40-83-latency-1-10v-voltage-intel-xmp-3-0-black-f5-5200j4040a32gx2-rm5rk')],
    description: `### G.Skill Ripjaws M5 RGB 64GB (2x32GB) DDR5 5200MHz CL40

64 جيجابايت بجهدٍ منخفض ومشتّتٍ قصير: طقمٌ للسعة لا للسرعة. يناسب جهاز عملٍ يحتاج ذاكرةً كبيرة للمونتاج أو التصميم أو البرمجة، ويناسب معالجات Intel غير القابلة لكسر السرعة.

**التقنيات الأساسية المدعومة:**

[green]جهد 1.10 فولت فقط:[/green] الجهد القياسيّ لذاكرة DDR5، فحرارتها أقلّ ما يكون، واستقرارها أسهل على أيّ لوحة.

[green]ارتفاع 41 مم:[/green] من أقصر أطقم RGB، فتدخل تحت المبرّدات الهوائيّة الكبيرة ذات البرجين دون أن تزاحم المروحة.

[green]ملفّا XMP 3.0 وEXPO:[/green] تعمل على لوحات Intel وAMD معاً بضغطة في البايوس.

[green]64 جيجابايت بشريحتين:[/green] تُبقي منفذين فارغين بدل أربع شرائح تُبطئ المتحكّم.

[green]مشتّت ألومنيوم أسود مطفأ بإضاءة RGB:[/green] يتزامن مع ASUS Aura وMSI Mystic Light وGigabyte RGB Fusion وASRock Polychrome.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 5200 بتوقيت 40-40-40-83 أبطأ بوضوح من أطقم 6000 CL30. في الألعاب الحسّاسة للذاكرة يظهر الفرق بضع إطارات.
* على Ryzen 7000 و9000 النقطة المثلى 6000، وهذا الطقم دونها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس خياراً لمن يريد أعلى أداءٍ في الألعاب.
* لا يركب على لوحات DDR4.

${alt('BEASTRGB64_36', 'السعة نفسها بسرعة 6000 وإضاءة RGB، أنسب لمعالجات Ryzen وللألعاب.')}
https://www.gskill.com/product/165/421/1716885342/F5-5200J4040A32GX2-RM5RK`,
  },
  {
    categoryId: RAM, brand: 'Corsair', name: 'Dominator Titanium RGB 32GB (2x16GB) DDR5 6000MHz CL30 Grey', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '6000', casLatency: 'CL30', profile: 'XMP 3.0 & EXPO', rgb: 'Yes', heightMm: '57', color: 'Grey' },
    offers: [A('B0CHSDCR8V'), M('corsair-dominator-titanium-32gb-2x16gb-ddr5-rgb-desktop-memory-kit-6000mhz-memory-speed-cl30-cas-latency-1-40v-memory-voltage-288-pin-xmp-amd-icue-cmpt-white-cmp32gx5m2b6000z30')],
    description: `### Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5 6000MHz CL30 Grey

أفخم سلاسل Corsair للذاكرة: مشتّت ألومنيوم مصبوب بلونٍ رماديّ، وإضاءة RGB بإحدى عشرة نقطة، وأشرطة علويّة قابلة للتبديل. أداؤها هو أداء 6000 CL30 المعروف، وما تدفعه زيادةً تدفعه للشكل والتبريد.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت 30-36-36-76:[/green] النقطة المثلى لمعالجات Ryzen 7000 و9000، وسرعةٌ ممتازة لمعالجات Intel أيضاً.

[green]ملفّا EXPO وXMP:[/green] تفعيلٌ بضغطة على لوحات AMD وIntel.

[green]تبريد DHX:[/green] الحرارة تُسحب من الشرائح ومن طبقة التأريض في اللوحة المطبوعة معاً، فتبقى الذاكرة أبرد عند كسر السرعة.

[green]11 نقطة RGB قابلة للعنونة:[/green] تُدار ببرنامج iCUE، والأشرطة العلويّة تُستبدل بأشكالٍ أخرى من Corsair.

[green]منظّم جهد (PMIC) مخصّص لكسر السرعة:[/green] يترك هامشاً لمن يريد رفع السرعة يدوياً فوق الملفّ الجاهز.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ارتفاعها قرابة 57 مم، وهو أطول من أغلب الأطقم. راجع خلوص المبرّد الهوائيّ قبل الشراء، خاصّةً المبرّدات ذات البرجين.
* جهد 1.40 فولت.
* اللون رماديّ وليس أسود. وصفُ مايكرولس يكتب «أبيض»، لكنّ الرمز CMP32GX5M2B6000Z30 هو النسخة الرماديّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تعطي إطاراً واحداً زيادةً على أطقم 6000 CL30 الأرخص.
* لا تركب على لوحات DDR4.

${alt('VEN30', 'السرعة والتوقيت نفسهما بلا إضاءة وبارتفاع 35 مم، وبسعرٍ أقلّ بكثير.')}
https://www.corsair.com/us/en/p/memory/cmp32gx5m2b6000z30/dominator-titanium-rgb-32gb-2x16gb-ddr5-dram-6000mt-s-cl30-amd-expo-memory-kit-grey-cmp32gx5m2b6000z30`,
  },
  {
    categoryId: RAM, brand: 'Corsair', name: 'Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30 Grey', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '6000', casLatency: 'CL30', profile: 'XMP 3.0 & EXPO', rgb: 'Yes', heightMm: '44', color: 'Grey' },
    offers: [A('B0BPTKD797'), M('corsair-vengeance-32gb-2x16gb-rgb-ddr5-288-pin-dual-channel-desktop-memory-kit-6000-mhz-tested-speed-30-36-36-76-latency-amd-expo-intel-xmp-profile-1-40v-gray-cmh32gx5m2b6000z30k')],
    description: `### Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30 Grey

طقم 32 جيجابايت بالمواصفة الأكثر طلباً للألعاب، 6000 بتوقيت CL30، بإضاءة RGB ومشتّتٍ رماديّ. خيارٌ آمن لأيّ تجميعة Ryzen أو Intel حديثة.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت 30-36-36-76:[/green] أقلّ زمن وصولٍ تحصل عليه بلا ضبطٍ يدويّ على معالجات Ryzen 7000 و9000.

[green]ملفّا AMD EXPO وIntel XMP:[/green] الطقم نفسه يعمل بسرعته الكاملة على المنصّتين.

[green]عشر مناطق إضاءة لكلّ شريحة:[/green] تحكّمٌ أدقّ من الشريط المستمرّ، ويُدار ببرنامج iCUE أو ببرنامج اللوحة الأمّ.

[green]32 جيجابايت بشريحتين:[/green] السعة المناسبة للألعاب الحديثة مع البثّ أو المتصفّح في الخلفيّة.

[green]ارتفاع 44 مم:[/green] يتوافق مع أغلب المبرّدات الهوائيّة المتوسّطة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* جهد 1.40 فولت، فحرارتها أعلى قليلاً داخل كيسٍ ضعيف التهوية.
* مع المبرّدات الهوائيّة الضخمة ذات البرجين قد تحتاج المروحة الأماميّة أن تُرفع قليلاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* 32 جيجابايت قد لا تكفي للمونتاج الثقيل بدقّة 4K.
* لا يركب على لوحات DDR4.

${alt('VENRGB30W', 'الطقم نفسه باللون الأبيض.')}
https://www.corsair.com/us/en/p/memory/cmh32gx5m2b6000z30k/vengeance-rgb-32gb-2x16gb-ddr5-dram-6000mt-s-cl30-amd-expo-intel-xmp-memory-kit-cmh32gx5m2b6000z30k`,
  },
  {
    categoryId: RAM, brand: 'Corsair', name: 'Vengeance RGB 96GB (2x48GB) DDR5 5600MHz CL40', tdpWattage: 0, performanceTier: 4,
    specs: { type: 'DDR5', capacity: '96GB', kit: '2x48GB', speed: '5600', casLatency: 'CL40', profile: 'XMP 3.0', rgb: 'Yes', heightMm: '44', color: 'Black' },
    offers: [A('B0BVN19N31'), M('corsair-vengeance-rgb-96gb-2x48gb-ddr5-desktop-memory-kit-5600-mhz-memory-speed-40-40-40-77-tested-latency-1-25v-memory-voltage-xmp-3-0-288-pin-dynamic-multi-zone-rgb-cmh96gx5m2b5600c40')],
    description: `### Corsair Vengeance RGB 96GB (2x48GB) DDR5 5600MHz CL40

سعةٌ كبيرة في شريحتين فقط: 96 جيجابايت لمحطّات العمل المنزليّة. يناسب المونتاج بدقّة 8K، والنماذج المحلّية للذكاء الاصطناعي، والآلات الافتراضيّة المتعدّدة، والمشاريع الضخمة في برامج التصميم.

**التقنيات الأساسية المدعومة:**

[green]96 جيجابايت في منفذين:[/green] شرائح 48 جيجابايت بكثافة 24 جيجابت. تصل إلى هذه السعة دون أربع شرائح، فتبقى السرعة أعلى وتبقى منافذ الترقية فارغة.

[green]جهد 1.25 فولت:[/green] حرارةٌ منخفضة واستقرارٌ أسهل مع سعةٍ بهذا الحجم.

[green]5600 MT/s بتوقيت 40-40-40-77 وملفّ Intel XMP:[/green] سرعةٌ مختبَرة على لوحات Intel 600 و700 و800.

[green]عشر نقاط RGB لكلّ شريحة:[/green] تُدار ببرنامج iCUE.

[green]منظّم جهد مخصّص لكسر السرعة:[/green] يترك هامشاً لمن يريد الضبط يدوياً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الملفّ الجاهز Intel XMP فقط. على لوحات AMD يعمل غالباً عبر ترجمة اللوحة للملفّ، لكنّ نسخة Corsair الموجّهة لـAMD هي 6000 CL36.
* توقيت CL40 بطيءٌ للألعاب مقارنةً بأطقم 6000 CL30.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا معنى لهذه السعة في جهاز ألعابٍ فقط.
* لا يركب على لوحات DDR4.

${alt('VENRGB64', '64 جيجابايت بسرعة 6400 CL32 إن كانت هذه السعة تكفيك وتريد أداءً أعلى في الألعاب.')}
https://www.corsair.com/us/en/p/memory/cmh96gx5m2b5600c40/vengeance-rgb-96gb-2x48gb-ddr5-dram-5600mhz-c40-memory-kit-black-cmh96gx5m2b5600c40`,
  },
  {
    categoryId: RAM, brand: 'Kingston', name: 'Fury Beast RGB 32GB (2x16GB) DDR5 5600MHz CL36 White', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'DDR5', capacity: '32GB', kit: '2x16GB', speed: '5600', casLatency: 'CL36', profile: 'EXPO', rgb: 'Yes', heightMm: '42.23', color: 'White' },
    offers: [A('B0BZJBLL76'), M('kingston-fury-beast-rgb-32gb-2x16gb-ddr5-desktop-memory-5600mt-s-memory-speed-cl36-cas-latency-1-25-voltage-288-pin-intel-xmp-3-0-amd-expo-profile-white-kf556c36bweak2-32')],
    description: `### Kingston Fury Beast RGB 32GB (2x16GB) DDR5 5600MHz CL36 White

طقمٌ أبيض بإضاءة RGB وجهدٍ منخفض: 32 جيجابايت على 5600 بتوقيت CL36. خيارٌ متوازن لتجميعة ألعابٍ بيضاء متوسّطة، أو لمن يريد الشكل دون كلفة أطقم 6000 CL30.

**التقنيات الأساسية المدعومة:**

[green]جهد 1.25 فولت:[/green] أقلّ حرارةً من أطقم 6000 بجهد 1.35 إلى 1.40، وأسهل استقراراً على اللوحات الاقتصاديّة.

[green]5600 بتوقيت 36-38-38:[/green] زمن وصول قرابة 12.9 نانوثانية. أبطأ قليلاً من 6000 CL30، لكنّه أسرع بوضوح من ذاكرة 4800 القياسيّة.

[green]ملفّ AMD EXPO:[/green] تفعيلٌ بضغطة في البايوس.

[green]مشتّت أبيض بإضاءة Infrared Sync:[/green] تتزامن الشريحتان بلا كابلات، وتُدار ببرنامج Kingston FURY CTRL أو برامج اللوحات.

[green]ارتفاع 42.23 مم:[/green] لا يتعارض مع أغلب المبرّدات الهوائيّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* على Ryzen 7000 و9000 النقطة المثلى 6000، فتترك هذه الذاكرة بضعة بالمئة في الألعاب الحسّاسة للذاكرة.
* الفرق في السعر عن أطقم 6000 أحياناً صغير، فقارن قبل الشراء.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليست للكسر اليدويّ للسرعة.
* لا تركب على لوحات DDR4.

${alt('BEASTRGB32W30', 'الطقم الأبيض نفسه بسرعة 6000 CL30، الأسرع لمعالجات Ryzen.')}
https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-rgb-memory`,
  },
  {
    categoryId: RAM, brand: 'Kingston', name: 'Fury Renegade RGB 16GB (2x8GB) DDR4 4000MHz CL19', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'DDR4', capacity: '16GB', kit: '2x8GB', speed: '4000', casLatency: 'CL19', profile: 'XMP 2.0', rgb: 'Yes', heightMm: '43', color: 'Black' },
    offers: [A('B0CKJ6FPMY'), M('kingston-fury-renegade-ddr4-rgb-memory-kit-16gb-8gb-x2-capacity-4000mt-s-memory-speed-cl19-cas-latency-1-35-voltage-288-pin-intel-xmp-profile-kf440c19rb2ak2-16')],
    description: `### Kingston Fury Renegade RGB 16GB (2x8GB) DDR4 4000MHz CL19

ذاكرة DDR4 سريعة بمشتّتٍ أسود وفضّي وإضاءة RGB، لمن يرقّي جهازاً قائماً على لوحة DDR4 (AM4 أو Intel من الجيل العاشر إلى الرابع عشر) دون تغيير اللوحة.

**التقنيات الأساسية المدعومة:**

[green]4000 MT/s بتوقيت 19-23-23:[/green] من أسرع سرعات DDR4 الجاهزة، وتفيد معالجات Intel من الجيل الثاني عشر إلى الرابع عشر على لوحات DDR4.

[green]ملفّ Intel XMP:[/green] تفعيلٌ بضغطة في البايوس.

[green]جهد 1.35 فولت:[/green] الجهد المعتاد لذاكرة DDR4 السريعة.

[green]إضاءة RGB بتقنية Infrared Sync:[/green] مزامنةٌ بين الشريحتين وتحكّمٌ ببرنامج Kingston FURY CTRL.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مع Ryzen 5000 لا يصل أغلب المعالجات إلى نسبة 1:1 عند 4000، فتعمل الذاكرة بنسبةٍ أبطأ أو تحتاج خفضها إلى 3600. وطقم 3600 CL16 أنسب لهذه المنصّة.
* سعة 16 جيجابايت صارت الحدّ الأدنى، وبعض الألعاب الحديثة تطلب 32.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* DDR4 فقط، فلا يركب على لوحات DDR5 الحديثة.
* ليس خياراً لتجميعةٍ جديدة، فهو لترقية الأجهزة القائمة.

${alt('LPX32', 'ضعف السعة بسرعة 3600 CL18، أنسب لمعالجات Ryzen 5000 وأكثر عمراً للألعاب الحديثة.')}
https://www.kingston.com/en/memory/gaming/kingston-fury-renegade-ddr4-rgb-memory`,
  },
  // ================================================================ التخزين
  {
    categoryId: STO, brand: 'Samsung', name: '990 2TB', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'NVMe M.2', capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7250 MB/s', writeSpeed: '6450 MB/s', dramCache: 'No', tbw: '800 TB' },
    offers: [A('B0H3C4V8DQ'), M('smsung-990-nvme-internal-ssd-2tb-capacity-black-pcie-4-0-x4-m-2-2280-7250-mb-s-read-6450-mb-s-write-v-nand-memory-type-800tbw-mz-v9v2t0bw')],
    description: `### Samsung 990 2TB

أحدث أقراص Samsung الاستهلاكيّة بلا ذاكرة DRAM: سرعة جيلٍ رابع كاملة بمتحكّم Samsung وشرائح V-NAND من صنعها. سعة 2 تيرابايت تتّسع لمكتبة ألعابٍ كبيرة، فهو قرصٌ رئيسيّ مناسب لأغلب التجميعات.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7250 وكتابة 6450 ميجابايت/ث:[/green] قرب سقف الجيل الرابع. تحميل الألعاب ونقل الملفّات الكبيرة لا يختلف عمليّاً عن الأقراص الأغلى.

[green]أداء عشوائيّ 850 ألف قراءة و1.2 مليون كتابة (IOPS):[/green] هذا ما يحدّد سرعة الإقلاع وفتح البرامج، وهو رقمٌ مرتفع لقرصٍ بلا DRAM.

[green]متحكّم Samsung وذاكرة V-NAND من صنعها:[/green] البرنامج الثابت والمتحكّم والشرائح من مصنّعٍ واحد، وتُدار التحديثات ببرنامج Samsung Magician.

[green]تحمّل 800 تيرابايت كتابة:[/green] أكثر من حاجة أيّ استخدامٍ منزليّ لسنوات طويلة.

[green]استهلاك منخفض (4.3 واط قراءةً):[/green] حرارته معتدلة، ويكفيه مشتّت اللوحة الأمّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا DRAM، يعتمد على ذاكرة الجهاز (HMB). ممتاز للألعاب، لكنّه يتراجع أمام أقراص DRAM في الكتابة العشوائيّة الطويلة والمتواصلة.
* ضمانه 3 سنوات، أقصر من ضمان 990 PRO (5 سنوات).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مشتّت مرفق، وليس الخيار الأول للعمل الاحترافيّ الثقيل.

${alt('PRO990_2', 'قرص بذاكرة DRAM وضمان خمس سنوات وتحمّل 1200 تيرابايت، للعمل الاحترافيّ والمونتاج.')}
https://www.samsung.com/sg/memory-storage/nvme-ssd/990-2tb-nvme-pcie-gen-4-mz-v9v2t0bw/`,
  },
  {
    categoryId: STO, brand: 'Samsung', name: '990 PRO 4TB Heatsink', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'NVMe M.2', capacity: '4TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7450 MB/s', writeSpeed: '6900 MB/s', dramCache: 'Yes', tbw: '2400 TB' },
    offers: [A('B0CDJ61VJW'), M('samsung-990-pro-with-heatsink-4tb-nvme-2-0-m-2-2280-internal-ssd-7450-mb-s-sequential-read-speed-6900-mb-s-sequential-write-speed-3-3-voltage-v-nand-3-bit-mlc-black-mz-v9p4t0cw')],
    description: `### Samsung 990 PRO 4TB Heatsink

أعلى أقراص الجيل الرابع من Samsung بأكبر سعة، مع مشتّت ألومنيوم وإضاءة RGB. يناسب جهاز ألعابٍ بمكتبةٍ ضخمة، وجهاز مونتاج يعمل على ملفّات كبيرة، وجهاز PlayStation 5 بفضل المشتّت المتوافق.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7450 وكتابة 6900 ميجابايت/ث:[/green] سقف الجيل الرابع عمليّاً.

[green]ذاكرة DRAM من نوع LPDDR4:[/green] تحافظ على السرعة في الكتابة العشوائيّة والطويلة، كنسخ مشاريع المونتاج وتثبيت الألعاب الضخمة.

[green]تحمّل 2400 تيرابايت كتابة:[/green] من أعلى أرقام التحمّل في الأقراص الاستهلاكيّة، وضمان خمس سنوات.

[green]مشتّت مدمج:[/green] يمنع خنق السرعة بالحرارة تحت الضغط الطويل، ويناسب منفذ التوسعة في PS5.

[green]4 تيرابايت في قرصٍ واحد:[/green] مساحةٌ كافية لعشرات الألعاب الحديثة دون حذفٍ وإعادة تنزيل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المشتّت يرفع سماكة القرص. إن كانت لوحتك تأتي بمشتّتٍ لمنفذ M.2 فنسخة القرص بلا مشتّت أوفر.
* سعره مرتفع، وأقراص الجيل الخامس بالسعر نفسه تقريباً أسرع إن كانت لوحتك تدعمها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يصل لسرعات الجيل الخامس (14000 ميجابايت/ث).

${alt('PRO990_4', 'القرص نفسه بلا مشتّت، إن كانت لوحتك تأتي بمشتّتٍ لمنفذ M.2.')}
https://www.samsung.com/us/computing/memory-storage/solid-state-drives/990-pro-w-heatsink-pcie-4-0-nvme-ssd-4tb-mz-v9p4t0cw/`,
  },
  {
    categoryId: STO, brand: 'Crucial', name: 'P310 2TB Heatsink', tdpWattage: 0, performanceTier: 3,
    specs: { type: 'NVMe M.2', capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '7100 MB/s', writeSpeed: '6000 MB/s', dramCache: 'No', tbw: '440 TB' },
    offers: [A('B0DQBQZ9LX'), M('crucial-p310-internal-ssd-with-heatsink-2tb-storage-capacity-m-2-2280-form-factor-pcie-4-0-interface-up-to-7100-mb-s-sequential-read-6000-mb-s-sequential-write-speed-black-ct2000p310ssd5')],
    description: `### Crucial P310 2TB Heatsink

قرص جيلٍ رابع سريع بسعرٍ متوسّط ومعه مشتّت. يناسب لوحةً لا تأتي بمشتّتٍ لمنفذ M.2، ويناسب جهاز PlayStation 5.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7100 وكتابة 6000 ميجابايت/ث:[/green] قرب سقف الجيل الرابع، بفارقٍ لا يُلحظ في الألعاب عن الأقراص الأغلى.

[green]متحكّم Phison E27T:[/green] متحكّم موفّر للطاقة وبارد، صُمّم للأقراص بلا DRAM، مع ذاكرة Micron QLC بـ232 طبقة.

[green]مشتّت مدمج:[/green] يحمي السرعة من الخنق الحراريّ في النسخ الطويل، ويطابق مقاسات منفذ PS5.

[green]2 تيرابايت:[/green] السعة الأنسب لجهاز ألعابٍ اليوم.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا DRAM، فتنخفض سرعة الكتابة بعد امتلاء الذاكرة المؤقّتة في النسخ الضخم المتواصل.
* تحمّله 440 تيرابايت، وهو كافٍ للاستخدام المنزليّ لكنّه أقلّ من أقراص DRAM.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يركب مع مشتّت اللوحة الأمّ، فاختر واحداً منهما.
* ليس للعمل الاحترافيّ كثيف الكتابة.

${alt('P310_2', 'القرص نفسه بلا مشتّت، إن كانت لوحتك تأتي بمشتّتٍ لمنفذ M.2.')}
https://www.crucial.com/ssd/p310/ct2000p310ssd5`,
  },
  {
    categoryId: STO, brand: 'Crucial', name: 'E100 2TB', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'NVMe M.2', capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', readSpeed: '5000 MB/s', writeSpeed: '4500 MB/s', dramCache: 'No', tbw: '100 TB' },
    offers: [A('B0DQSJZTZ5'), M('crucial-gen4-e100-internal-ssd-2tb-storage-capacity-m-2-form-factor-3d-nand-technology-up-to-5000mb-s-read-speed-up-to-4500mb-s-write-speed-ct2000e100ssd8')],
    description: `### Crucial E100 2TB

قرص جيلٍ رابع اقتصاديّ بسعة 2 تيرابايت، الغرض منه المساحة بأقلّ كلفة. مكانه قرصٌ ثانٍ لمكتبة الألعاب، أو قرصٌ رئيسيّ لجهازٍ مكتبيّ أو جهاز ألعابٍ بميزانيّةٍ محدودة.

**التقنيات الأساسية المدعومة:**

[green]قراءة 5000 وكتابة 4500 ميجابايت/ث:[/green] أسرع من أقراص الجيل الثالث بنحو مرّة ونصف. والفرق عن أقراص 7000 في تحميل الألعاب صغير جدّاً.

[green]واجهة PCIe 4.0 x4:[/green] يركب في أيّ منفذ M.2 حديث، ويعمل بسرعةٍ أقلّ في منافذ الجيل الثالث.

[green]2 تيرابايت:[/green] مساحةٌ تتّسع لنحو عشرين لعبةً حديثة كبيرة.

[green]استهلاك منخفض:[/green] بلا DRAM وبحرارةٍ معتدلة لا تحتاج مشتّتاً في أغلب الحالات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* تحمّله 100 تيرابايت فقط، وهو منخفضٌ جداً. يكفي مكتبة ألعابٍ وتخزيناً عاديّاً، ولا يناسب المونتاج أو التنزيل اليوميّ الكثيف.
* ضمانه 3 سنوات.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا DRAM، فتنخفض السرعة بوضوح في النسخ الطويل بعد امتلاء الذاكرة المؤقّتة.
* ليس قرصاً للعمل الاحترافيّ.

${alt('P310_2', 'السعة نفسها بسرعة 7100 وتحمّل 440 تيرابايت، أكثر من أربعة أضعاف التحمّل، بفارق سعرٍ بسيط عادةً.')}
https://www.crucial.com/ssd/e100/ct2000e100ssd8`,
  },
  {
    categoryId: STO, brand: 'Kingston', name: 'Fury Renegade G5 2TB Gen5', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'NVMe M.2', capacity: '2TB', interface: 'PCIe 5.0 x4', formFactor: 'M.2 2280', readSpeed: '14700 MB/s', writeSpeed: '14000 MB/s', dramCache: 'Yes', tbw: '2000 TB' },
    offers: [A('B0F4455L4R'), M('kingston-fury-renegade-g5-pcie-5-0-nvme-m-2-internal-ssd-2tb-2048gb-capacity-sequential-read-write-14-700-14-000-mb-s-3d-tlc-nand-sm2508-controller-black-sfyr2s-2t0')],
    description: `### Kingston Fury Renegade G5 2TB Gen5

قرص جيلٍ خامس من الجيل الثاني لهذه الأقراص: سرعة 14700 ميجابايت/ث بمتحكّمٍ أبرد بكثير من الأقراص الأولى. يناسب جهازاً حديثاً بمنفذ PCIe 5.0 يعمل صاحبه على ملفّاتٍ ضخمة.

**التقنيات الأساسية المدعومة:**

[green]قراءة 14700 وكتابة 14000 ميجابايت/ث:[/green] ضعف سقف الجيل الرابع. يظهر الفرق في نسخ مشاريع المونتاج وفكّ ضغط الملفّات الكبيرة.

[green]متحكّم Silicon Motion SM2508 بدقّة 6 نانومتر:[/green] أوفر طاقةً وأقلّ حرارةً من متحكّم Phison E26 في أقراص الجيل الخامس الأولى، فيكفيه مشتّت اللوحة الأمّ غالباً.

[green]ذاكرة DRAM وشرائح TLC:[/green] أداءٌ ثابت في الكتابة الطويلة والعشوائيّة، وأداء عشوائيّ يصل إلى 2.2 مليون IOPS.

[green]تحمّل 2000 تيرابايت كتابة:[/green] رقمٌ احترافيّ يناسب العمل اليوميّ الكثيف، مع ضمان خمس سنوات.

[green]سماكة 2.3 مم بلا مشتّت:[/green] يركب تحت مشتّت اللوحة الأمّ أو في الحواسيب الصغيرة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* يحتاج منفذ M.2 من الجيل الخامس (لوحات X870 وB850 وZ890 وبعض B650E وZ790). في منفذٍ من الجيل الرابع يعمل بسرعته فقط.
* في الألعاب لا يكاد يختلف عن أقراص الجيل الرابع.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مشتّت مرفق.

${alt('SN8100_2', 'قرص جيلٍ خامس آخر بالسعة نفسها، وأداء عشوائيّ أعلى قليلاً.')}
https://www.kingston.com/en/ssd/gaming/kingston-fury-renegade-g5-nvme-m2-ssd`,
  },
  {
    categoryId: STO, brand: 'WD', name: 'Black SN8100 4TB Gen5', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'NVMe M.2', capacity: '4TB', interface: 'PCIe 5.0 x4', formFactor: 'M.2 2280', readSpeed: '14900 MB/s', writeSpeed: '14000 MB/s', dramCache: 'Yes', tbw: '2400 TB' },
    offers: [A('B0F3B6MZM9'), M('wd_black-sn8100-nvme-internal-ssd-m-2-2280-form-factor-4tb-capacity-14900-mb-s-sequential-read-14000-mb-s-sequential-write-2400-tbw-endurance-wds400t1x0m')],
    description: `### WD Black SN8100 4TB Gen5

من أسرع الأقراص الاستهلاكيّة اليوم، وبأكبر سعة: 4 تيرابايت من الجيل الخامس بقراءة 14900 ميجابايت/ث. يناسب محطّة عملٍ للمونتاج والتصيير، أو جهاز ألعابٍ رائداً بمكتبةٍ ضخمة. غيّرت SanDisk اسمه لاحقاً إلى Optimus GX PRO 8100.

**التقنيات الأساسية المدعومة:**

[green]قراءة 14900 وكتابة 14000 ميجابايت/ث:[/green] عند سقف الجيل الخامس الحاليّ.

[green]أداء عشوائيّ 2.3 مليون قراءة و2.4 مليون كتابة (IOPS):[/green] من أعلى الأرقام في فئته، وهو ما يسرّع فتح المشاريع الكبيرة والبرامج الثقيلة.

[green]ذاكرة DRAM:[/green] السرعة ثابتة في الكتابة الطويلة، كنسخ مئات الجيجابايت من لقطات الفيديو.

[green]تحمّل 2400 تيرابايت كتابة:[/green] مع ضمان خمس سنوات.

[green]كفاءة طاقة عالية لقرص جيلٍ خامس:[/green] حرارته أقلّ من الجيل الأول من هذه الأقراص، فيكفيه مشتّت اللوحة الأمّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* يحتاج منفذ M.2 من الجيل الخامس ليعطي سرعته. في منفذٍ من الجيل الرابع يعمل بنحو 7000 فقط.
* هذه النسخة بلا مشتّت، ونسخة المشتّت برمزٍ آخر (WDS400T1XHM).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا فائدة ملموسة منه في الألعاب مقارنةً بقرص جيلٍ رابع جيّد.

${alt('SN8100_2', 'القرص نفسه بسعة 2 تيرابايت، إن كانت تكفيك.')}
https://www.sandisk.com/products/ssd/internal-ssd/wd-black-sn8100-ssd?sku=WDS400T1X0M-00CMT0`,
  },
  {
    categoryId: STO, brand: 'Corsair', name: 'MP700 PRO 1TB (No Heatsink)', tdpWattage: 0, performanceTier: 5,
    specs: { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 5.0 x4', formFactor: 'M.2 2280', readSpeed: '11700 MB/s', writeSpeed: '9600 MB/s', dramCache: 'Yes', tbw: '700 TB' },
    offers: [A('B0CM41J7F9'), M('corsair-1tb-mp700-pro-nvme-pcie-5-0-m-2-internal-ssd-11700-mb-s-sequential-read-speeds-9600-sequential-write-speeds-3d-tlc-nand-technology-1-6-million-hours-mtbf-black-cssd-f1000gbmp700pnh')],
    description: `### Corsair MP700 PRO 1TB (No Heatsink)

قرص جيلٍ خامس بمتحكّم Phison E26 وشرائح TLC، يصل بلا مشتّت ليُركَّب تحت مشتّت اللوحة الأمّ. يناسب لوحةً حديثة مزوّدة بمشتّتٍ قويّ لمنفذ M.2 الأول.

**التقنيات الأساسية المدعومة:**

[green]قراءة 11700 وكتابة 9600 ميجابايت/ث:[/green] أسرع من أيّ قرصٍ من الجيل الرابع بنحو 60%.

[green]ذاكرة DRAM وشرائح 3D TLC:[/green] أداءٌ ثابت في الكتابة الطويلة، وأداء عشوائيّ يصل إلى 1.4 مليون قراءة و1.5 مليون كتابة (IOPS).

[green]تحمّل 700 تيرابايت ومتوسّط عمر 1.6 مليون ساعة:[/green] ضعف تحمّل أغلب أقراص 1 تيرابايت الاقتصاديّة.

[green]بلا مشتّت:[/green] يستفيد من مشتّت اللوحة الأمّ دون أن تدفع ثمن مشتّتٍ لن تستخدمه.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* متحكّم E26 حارّ. **لا يعمل بلا تبريد**، فإن لم تكن للوحتك مشتّتٌ على منفذ M.2 فسيُخنق بالحرارة سريعاً.
* يحتاج منفذاً من الجيل الخامس، وفي الجيل الرابع يعمل بسرعته.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* 1 تيرابايت صغيرة لجهاز ألعابٍ حديث.
* الأقراص الأحدث بمتحكّم SM2508 أسرع وأبرد منه.

${alt('MP700AIR', 'القرص نفسه مع مشتّت هواءٍ مرفق، للوحاتٍ بلا مشتّت M.2.')}
https://www.corsair.com/us/en/p/data-storage/cssd-f1000gbmp700pnh/mp700-pro-1tb-pcie-gen5-x4-nvme-2-0-m-2-ssd-cssd-f1000gbmp700pnh`,
  },
  {
    categoryId: STO, brand: 'Crucial', name: 'BX500 4TB SATA', tdpWattage: 0, performanceTier: 1,
    specs: { type: 'SATA SSD 2.5"', capacity: '4TB', interface: 'SATA III', formFactor: '2.5-inch', readSpeed: '540 MB/s', writeSpeed: '500 MB/s', dramCache: 'No', tbw: '1000 TB' },
    offers: [A('B0CY7638WZ'), M('crucial-bx500-4tb-2-5-internal-ssd-sata-6gb-s-interface-500-mb-s-sequential-write-speed-540-mb-s-sequential-read-speed-3d-nand-efficiency-black-ct4000bx500ssd1')],
    description: `### Crucial BX500 4TB SATA

قرص SATA بمقاس 2.5 بوصة وسعة 4 تيرابايت. مكانه قرصٌ ثانٍ للأرشيف ومكتبة الألعاب، أو ترقية لجهازٍ قديم أو حاسوبٍ محمول لا يملك منفذ M.2.

**التقنيات الأساسية المدعومة:**

[green]4 تيرابايت:[/green] مساحةٌ للصور والفيديوهات والنسخ الاحتياطيّة ومكتبة الألعاب القديمة.

[green]قراءة 540 وكتابة 500 ميجابايت/ث:[/green] سقف واجهة SATA، وأسرع من القرص الميكانيكيّ بنحو خمس مرّات، مع زمن وصولٍ أقلّ بكثير.

[green]تحمّل 1000 تيرابايت كتابة:[/green] رقمٌ مرتفع لقرص SATA بهذا السعر.

[green]مقاس 2.5 بوصة بسماكة 7 مم:[/green] يركب في خانات الكيس، وفي الحواسيب المحمولة القديمة بمحوّلٍ بسيط.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سرعته عُشر سرعة أقراص NVMe الحديثة. لا يصلح قرصاً لنظام تشغيل جهازٍ جديد.
* بلا DRAM، فتنخفض سرعة الكتابة بوضوح في النسخ الطويل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* يحتاج كابل SATA ومنفذ طاقة من المزوّد، وكثيرٌ من الكيسات الحديثة قلّلت خانات 2.5 بوصة.

${alt('NV3_4', 'السعة نفسها بقرص NVMe أسرع بعشر مرّات، إن كان في لوحتك منفذ M.2 فارغ.')}
https://eu.crucial.com/ssd/bx500/ct4000bx500ssd1`,
  },
  {
    categoryId: STO, brand: 'Lexar', name: 'NM620 1TB', tdpWattage: 0, performanceTier: 2,
    specs: { type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 3.0 x4', formFactor: 'M.2 2280', readSpeed: '3300 MB/s', writeSpeed: '3000 MB/s', dramCache: 'No', tbw: '500 TB' },
    offers: [A('B093CNPVX1'), M('lexar-nm620-m-2-2280-pcie-gen3x4-nvme-1tb-internal-ssd-up-to-3300mb-s-read-3000mb-s-write-speeds-3d-tlc-nand-technology-1-5-million-hours-mtbf-shock-vibration-resistance-black-lnm620x001t-lnm620x001t')],
    description: `### Lexar NM620 1TB

قرص NVMe من الجيل الثالث بسعرٍ منخفض وتحمّلٍ جيّد. يناسب ترقية جهازٍ قديم بمنفذ M.2 من الجيل الثالث، أو تجميعةً اقتصاديّة لا تحتاج أعلى سرعة.

**التقنيات الأساسية المدعومة:**

[green]قراءة 3300 وكتابة 3000 ميجابايت/ث:[/green] أسرع من أقراص SATA بنحو ستّ مرّات. والإقلاع وتحميل الألعاب قريبان جداً من أقراص الجيل الرابع.

[green]شرائح 3D TLC:[/green] أثبت في الكتابة من شرائح QLC في الأقراص الاقتصاديّة المنافسة.

[green]تحمّل 500 تيرابايت:[/green] رقمٌ ممتاز لقرصٍ اقتصاديّ، ومعه ضمان خمس سنوات.

[green]يعمل في أيّ منفذ M.2 NVMe:[/green] من لوحات الجيل الثالث القديمة إلى أحدث اللوحات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* واجهة الجيل الثالث تحدّه بنحو 3500 ميجابايت/ث، وأقراص الجيل الرابع صارت بسعرٍ قريب.
* بلا DRAM، فيعتمد على ذاكرة الجهاز (HMB).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يستفيد من منافذ الجيل الرابع والخامس في اللوحات الحديثة.

${alt('P310_1', 'السعة نفسها بقرص جيلٍ رابع بسرعة 7100، إن كانت لوحتك حديثة.')}
https://americas.lexar.com/product/lexar-nm620-m-2-2280-nvme-ssd/`,
  },
  {
    categoryId: STO, brand: 'WD', name: 'Blue 3D NAND 1TB SATA', tdpWattage: 0, performanceTier: 1,
    specs: { type: 'SATA SSD 2.5"', capacity: '1TB', interface: 'SATA III', formFactor: '2.5-inch', readSpeed: '560 MB/s', writeSpeed: '530 MB/s', dramCache: 'Yes', tbw: '400 TB' },
    offers: [A('B073SBQMCX'), M('wd-1tb-blue-3d-nand-internal-ssd-sata-iii-6-gb-s-2-5-7mm-solid-state-drive-wds100t2b0a')],
    description: `### WD Blue 3D NAND 1TB SATA

قرص SATA معروف ومجرّب من Western Digital بذاكرة DRAM. يناسب ترقية حاسوبٍ قديم أو محمولٍ لا يملك منفذ M.2، أو قرصاً ثانياً للملفّات.

**التقنيات الأساسية المدعومة:**

[green]قراءة 560 وكتابة 530 ميجابايت/ث:[/green] سقف واجهة SATA. يحوّل جهازاً قديماً بقرصٍ ميكانيكيّ إلى جهازٍ يُقلع في ثوانٍ.

[green]ذاكرة DRAM:[/green] تحافظ على السرعة في الكتابة الطويلة أفضل من أقراص SATA الاقتصاديّة بلا DRAM.

[green]شرائح 3D TLC وتحمّل 400 تيرابايت:[/green] مع ضمان خمس سنوات.

[green]مقاس 2.5 بوصة بسماكة 7 مم:[/green] يركب في الحواسيب المحمولة وخانات الكيسات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* واجهة SATA تحدّه بنحو 550 ميجابايت/ث، أي سدس سرعة أقراص NVMe الاقتصاديّة.
* طرازٌ قديم نسبياً، وسعر أقراص NVMe بالسعة نفسها صار قريباً منه.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يصلح قرصاً رئيسياً لجهازٍ جديد فيه منفذ M.2.

${alt('EVO870_1', 'قرص SATA بتحمّل 600 تيرابايت وأداءٍ عشوائيّ أعلى قليلاً.')}
https://www.westerndigital.com/products/internal-drives/wd-blue-sata-2-5-ssd?sku=WDS100T2B0A`,
  },
  // ================================================================ الكيسات
  {
    categoryId: CASE, brand: 'NZXT', name: 'H6 Compact Black', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '390', psuFormFactor: 'ATX', maxCoolerHeight: '165', radiatorSupport: '360mm', includedFans: 'لا يوجد', dualChamber: 'Yes', color: 'Black', features: ['يدعم لوحات Back-Connect', 'حاملٌ لمنع تقوّس الكرت'] },
    offers: [A('B0GQ8X8LTG'), M('nzxt-h6-compact-dual-chamber-atx-mid-tower-pc-case-55l-360mm-aio-10x-120mm-fans-390mm-gpu-mesh-panels-gpu-anti-sag-btf-ready-2x-usb-a-1x-usb-c-no-fans-black-cc-h62fb-01')],
    description: `### NZXT H6 Compact Black

الجيل الجديد من كيس H6 (الطراز CC-H62): حجرتان في حجمٍ مدمج (55 لتراً)، وألواح شبكيّة للتهوية، ويقبل اللوحات ذات الموصلات الخلفيّة. يصل بلا مراوح، لمن يريد اختيار مراوحه بنفسه.

**التقنيات الأساسية المدعومة:**

[green]حجرتان:[/green] المزوّد والكابلات في حجرةٍ خلفيّة، فتبقى الحجرة الرئيسيّة نظيفة والهواء يمرّ مباشرةً إلى الكرت.

[green]يتّسع لعشر مراوح 120 مم:[/green] ثلاث في الواجهة اليمنى، وثلاث في السقف، وثلاث في الأسفل، وواحدة في الخلف.

[green]يقبل لوحات Back-Connect (ATX):[/green] مثل ASUS BTF وMSI Project Zero وGigabyte Stealth، فتختفي الكابلات من الواجهة تماماً.

[green]رادييتر 360 مم في السقف:[/green] بسماكة 67 مم للرادييتر مع المراوح، ومبرّد هوائيّ حتى 165 مم.

[green]كرت حتى 390 مم مع حاملٍ لمنع التقوّس:[/green] يتّسع لأغلب كروت RTX 5080 و5090.

[green]منافذ أماميّة:[/green] منفذا USB-A ومنفذ USB-C.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **بلا مراوح**. احسب ثمن ثلاث إلى ستّ مراوح في الميزانيّة، فهذا الكيس لا يعمل جيّداً بلا مروحة إدخال.
* طول الكرت 390 مم في صفحة المنتج، لكنّ صفحة الدعم في NZXT تذكر 360 مم مع مروحة أماميّة بسماكة 30 مم. راجع طول كرتك إن كان طويلاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل رادييتر 420 أو 280 في الواجهة. المكان الوحيد لرادييتر 360 هو السقف.
* لا يقبل لوحات E-ATX.

${alt('H6W', 'الكيس نفسه باللون الأبيض.')}
https://nzxt.com/products/h6`,
  },
  {
    categoryId: CASE, brand: 'Corsair', name: 'FRAME 4000D RS ARGB White', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '430', psuFormFactor: 'ATX', maxCoolerHeight: '170', radiatorSupport: '360mm', includedFans: '3x 120mm ARGB', color: 'White', features: ['يدعم لوحات Back-Connect', 'يقبل لوحات E-ATX', 'رادييتران 360 مم معاً'] },
    offers: [A('B0DFJ9PKK4'), M('corsair-frame-4000d-rs-argb-mid-tower-pc-case-3x-rs120-argb-pre-installed-fans-360mm-radiator-support-7-expansion-slots-tempered-glass-3d-y-airflow-steel-white-cc-9011297-ww')],
    description: `### Corsair FRAME 4000D RS ARGB White

خليفة الكيس الشهير 4000D بتصميمٍ قابلٍ للتعديل وتهوية أماميّة واسعة، ويصل بثلاث مراوح RS120 ARGB. خيارٌ متكامل لتجميعة ألعابٍ بيضاء قويّة، ويتّسع لأكبر الكروت والمبرّدات.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح RS120 ARGB مرفقة:[/green] تُوصَل بسلسلةٍ واحدة، فتقلّ الكابلات خلف اللوحة.

[green]رادييتر 360 مم في السقف أو الواجهة أو الجانب:[/green] ويقبل رادييترين بمقاس 360 مم معاً، لمن يبرّد المعالج والكرت بالماء.

[green]كرت حتى 430 مم ومبرّد هوائيّ حتى 170 مم:[/green] يتّسع لأيّ كرتٍ حاليّ ولأغلب المبرّدات ذات البرجين.

[green]يقبل لوحات Back-Connect ولوحات E-ATX:[/green] حتى مقاس 305 × 277 مم.

[green]مرونة في المراوح:[/green] الواجهة تقبل ثلاث مراوح 120 أو مروحتي 140 أو مروحتي 200 مم، والجانب يقبل ثلاث مراوح 120.

[green]منفذ USB-C بسرعة 10 جيجابت (3.2 Gen 2):[/green] ومنفذا USB-A.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* دليل Corsair يذكر 405 مم لطول الكرت مع مروحةٍ أماميّة، فراجع الطول إن كان كرتك ضخماً جداً.
* المراوح المرفقة 120 مم، ومن يريد تدفّقاً أعلى يستبدلها بمراوح 140 أو 200 في الواجهة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رادييتر في الأسفل.
* ليس بحجرتين، فالمزوّد تحت غطاءٍ في الأسفل بالطريقة التقليديّة.

${alt('C4000D', 'الجيل السابق بتصميمٍ مجرّب وسعرٍ أقلّ عادةً، إن لم تحتج المرونة الجديدة.')}
https://www.corsair.com/us/en/p/pc-cases/cc-9011297-ww/frame-4000d-rs-argb-modular-mid-tower-pc-case-white-cc-9011297-ww`,
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
writeFileSync(`backups/added-batch10-${stamp}.json`, JSON.stringify({ PARTS, EXTRA, movedBefore }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch10-${stamp}.json`);

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
