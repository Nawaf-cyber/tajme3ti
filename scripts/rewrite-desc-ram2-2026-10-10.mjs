/**
 * ============ أوصاف الرام الضعيفة (المرحلة الثانية) — 2026-10-10 ============
 *
 * المرحلة الثانية للرام، ومعها تصحيح مواصفاتٍ قُرئت من رموز الطرازات (عنوان أمازون/آخر رابط مايكرولس):
 *   Kingston 64GB CL30 = KF560C30BBEK2-64 (E = EXPO) — الوصف كان يحذّر «XMP فقط بلا EXPO» وهو العكس؛
 *   Trident Z5 RGB 6400 = CL32 لا CL36 وفضّيّ (TZ5RS)؛ T-Force Delta 6400 = CL40 (FF3D532G6400HC40BDC01)؛
 *   Crucial Pro 5600 = CL46 (CP2K16G56C46U5)؛ Lancer Blade = **RGB** (الوصف كان يقول بلا إضاءة)؛
 *   Dominator Titanium 48GB 7200 = أبيض وفيه RGB (CMP48GX5M2X7200C36W)؛ Fury Beast 32GB = EXPO وXMP.
 * البدائل التي تشير لصفوفٍ بلا عرض (Vengeance 6000 CL36، Crucial Pro 5600) نُقلت لطرازٍ متوفّر.
 * الروابط المربوطة بطرازٍ آخر حُذفت في fix-mislinks-ram-2026-10-10.mjs.
 *
 *   node scripts/rewrite-desc-ram2-2026-10-10.mjs           # عرض
 *   node scripts/rewrite-desc-ram2-2026-10-10.mjs --apply   # تنفيذ (نسخة احتياطية أوّلاً)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const TAG = 'ram2';

const alt = (name, id, ...why) => `---\nبإمكانك التوجه إلى [${name}](/components/${id}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const REWRITE = [
  {
    id: 'cmtjkzbaa000024ym3k1a3v4x',
    description: `### XPG ARMAX RGB 32GB (2x16GB) DDR5 6000MHz CL30

طقمٌ مضيء بتوقيت CL30 وملفّي XMP وEXPO معاً: يعمل بسرعته المعلنة على Intel وAMD بلا فرق. يناسب تجميعة ألعابٍ مضيئة على أيّ منصّة.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت CL30:[/green] نقطة التوازن في DDR5 اليوم، سرعةٌ عالية بزمن استجابةٍ منخفض، والأنسب لمعالجات Ryzen.

[green]ملفّا XMP 3.0 وEXPO معاً:[/green] ملفٌّ لكلّ منصّة، فلا تسقط الذاكرة إلى سرعتها الأساسيّة على أيٍّ منهما.

[green]طقمٌ من قطعتين (2×16GB):[/green] قناتان مزدوجتان، وهو شرط الأداء الكامل في DDR5.

[green]إضاءة ARGB:[/green] تُدار من برنامج لوحتك الأمّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ارتفاعها 39.5 مم، أعلى من الشرائح القياسيّة (32 مم). راجع مساحة المبرّد الهوائيّ فوق فتحات الذاكرة.
* سعره أعلى من أطقم 6000 CL30 أخرى في كتالوجنا، ومعظم الفرق للإضاءة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليست ذاكرة أرقامٍ قياسيّة، فأطقم 6400 و7200 موجودة لمن يريد التردّد.
* لا تُركَّب على لوحات DDR4.

---
بإمكانك التوجه إلى [TeamGroup T-Force Delta RGB 32GB (2x16GB) DDR5 6000MHz](/components/cmsqkaldp0000ugym0dga7spf) إذا كان توجهك يتركز على الآتي:
* السعة والسرعة والإضاءة نفسها بسعرٍ أقلّ بكثير.
https://www.xpg.com/us/xpg/dram-modules-armax-rgb-ddr5`,
  },
  {
    id: 'cmpiecqao005c00ym91dkcumi', force: true,
    specs: { profile: 'XMP 3.0 & EXPO' },
    description: `### ADATA XPG Lancer Blade RGB 32GB (2x16GB) DDR5 6000MHz CL36

طقم XPG بمشتّتٍ نحيف منخفض الارتفاع (33.8 مم) وإضاءة RGB، بسرعة 6000 وملفّي XMP وEXPO. يناسب التجميعات المضغوطة والمبرّدات الهوائيّة الضخمة.

**التقنيات الأساسية المدعومة:**

[green]ارتفاع 33.8 مم فقط:[/green] من أقصر أطقم RGB، فلا يتعارض مع المبرّدات الهوائيّة الضخمة ولا الرادييترات العلويّة.

[green]6000 MT/s بتوقيت 36-38-38:[/green] السرعة الأنسب لمعالجات Ryzen، وأداءٌ ثابت للألعاب.

[green]ملفّا XMP 3.0 وEXPO:[/green] تفعيلٌ بضغطة على Intel وAMD.

[green]إضاءة RGB:[/green] تتزامن مع برامج اللوحات الأمّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيت CL36 أبطأ قليلاً من أطقم CL30 بالسرعة نفسها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعة 32 جيجابايت ممتازة للألعاب، لكنّها لا تكفي المشاريع والمحاكاة الضخمة.
* لا تُركَّب على لوحات DDR4.

---
بإمكانك التوجه إلى [G.Skill Trident Z5 RGB 32GB 6400MHz](/components/cmpiebcpt001d00ymnktdbbjv) إذا كان توجهك يتركز على الآتي:
* سرعة 6400 بتوقيت CL32 لزيادةٍ طفيفة في الأداء.
https://www.xpg.com/us/xpg/dram-modules-lancer-blade-rgb-ddr5`,
  },
  {
    id: 'cmpiecq26005b00ymniswty6k',
    specs: { rgb: 'Yes', color: 'White' },
    description: `### Corsair Dominator Titanium 48GB 7200MHz

ذاكرةٌ فائقة الأداء من أفخم سلاسل Corsair، بالأبيض: 48 جيجابايت بسرعة 7200. موجّهة لكاسري السرعة وصنّاع المحتوى بمشاريع ضخمة، وأصحاب تجميعات Intel القصوى.

**التقنيات الأساسية المدعومة:**

[green]7200 MT/s بتوقيت CL36:[/green] من أعلى التردّدات الجاهزة، تستخرج آخر قطرة أداء من معالجات Intel الرائدة.

[green]48 جيجابايت في شريحتين:[/green] شرائح 24 جيجابايت تعطي مساحةً للمونتاج وتعدّد المهامّ الثقيل دون ملء أربع فتحات وإرهاق متحكّم الذاكرة.

[green]تبريد DHX وأشرطة علويّة قابلة للاستبدال:[/green] تبريدٌ للوحة المطبوعة نفسها، وتخصيصٌ للشكل.

[green]إضاءة Capellix:[/green] ساطعة ودقيقة، تُدار ببرنامج iCUE.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الوصول إلى 7200 يشترط لوحةً من الفئة العليا (يُفضّل بفتحتين للذاكرة) ومعالجاً بمتحكّم ذاكرة ممتاز، وإلّا فلن تعمل بسرعتها كاملة.
* ارتفاعها قرابة 57 مم، فراجع المبرّد الهوائيّ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ملفّ Intel XMP فقط، فليست مضبوطة لمعالجات AMD عند هذه السرعة.
* أرقامها القصوى لا يحتاجها المستخدم العاديّ، وتكلفة الجيجابايت فيها أعلى بكثير.

---
بإمكانك التوجه إلى [Crucial Pro 32GB (2x16GB) DDR5 6000MHz CL36](/components/cmuzymt7k0012wwymlkey8obj) إذا كان توجهك يتركز على الآتي:
* جهاز ألعابٍ يكفيه 32 جيجابايت على أيّ لوحة، بسعرٍ أقلّ بكثير.
https://www.corsair.com/us/en/p/memory/cmp48gx5m2x7200c36w/dominator-titanium-rgb-48gb-2x24gb-ddr5-dram-7200mt-s-cl36-intel-xmp-memory-kit-white-cmp48gx5m2x7200c36w`,
  },
  {
    id: 'cmpiebd2l001e00ym1y8bzzlv', force: true,
    specs: { profile: 'XMP 3.0 & EXPO', color: 'Grey' },
    description: `### Corsair Vengeance DDR5 32GB 6000MHz

طقم Vengeance بسعة 32 جيجابايت (2×16) وسرعة 6000 بتوقيت CL36، بمشتّتٍ منخفض ولونٍ رماديّ، وملفّي XMP وEXPO. السرعة التي تُعدّ نقطة التوازن لمعالجات اليوم.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت 36-36-36-76:[/green] نقل بيانات سريع للألعاب وبرامج المونتاج، والسرعة المثلى لمعالجات Ryzen.

[green]ملفّا XMP 3.0 وEXPO:[/green] تفعيلٌ بضغطة على لوحات Intel وAMD.

[green]مشتّت ألومنيوم منخفض (35 مم):[/green] لا يتعارض مع المبرّدات الهوائيّة الضخمة.

[green]32 جيجابايت بشريحتين:[/green] السعة المناسبة للألعاب الحديثة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيت CL36 أبطأ قليلاً من نسخة CL30.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB.
* لا تُركَّب على لوحات DDR4.

---
بإمكانك التوجه إلى [Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz CL30](/components/cmv18klcb0000jgymj6mis6yg) إذا كان توجهك يتركز على الآتي:
* الطقم نفسه بتوقيت CL30 أسرع.
https://www.corsair.com/us/en/p/memory/cmk32gx5m2d6000z36/vengeance-32gb-2x16gb-ddr5-dram-6000mt-s-cl36-amd-expo-intel-xmp-memory-kit-grey-cmk32gx5m2d6000z36`,
  },
  {
    id: 'cmtjkyagy000370yml2d0oz5f', force: true,
    description: `### Kingston Fury Beast RGB 32GB DDR5 6000MHz CL30 White

شريحةٌ واحدة بسعة 32 جيجابايت، بيضاء ومضيئة. وهذا التفصيل يغيّر كلّ شيء: تُشترى لتُضاف إلى شريحةٍ مثلها، لا لتعمل وحدها.

**التقنيات الأساسية المدعومة:**

[green]32 جيجابايت في شريحةٍ واحدة:[/green] تُبقي الفتحات الأخرى فارغة، طريقٌ إلى 64 أو 128 جيجابايت لاحقاً بلا رمي ما اشتريت.

[green]6000 MT/s بتوقيت CL30:[/green] نقطة التوازن المعتادة في DDR5.

[green]ملفّا XMP 3.0 وEXPO:[/green] تعمل بسرعتها المعلنة على Intel وAMD.

[green]بيضاء بإضاءة ARGB:[/green] تناسب التجميعات البيضاء.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* شريحةٌ واحدة تعني قناةً واحدة: بمفردها يعمل النظام بنصف عرض الذاكرة، والفرق محسوس في الألعاب وفي الرسوميات المدمجة خصوصاً. اشترِ اثنتين أو اختر طقماً.
* ارتفاعها 42.23 مم، فراجع المبرّد الهوائيّ قبل الشراء.
* سعر الشريحة الواحدة قريبٌ من سعر أطقمٍ كاملة من شريحتين.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليست خياراً اقتصاديّاً لتجميعةٍ جديدة، فالطقم المزدوج أرخص وأسرع.
* لا تُركَّب على لوحات DDR4.

---
بإمكانك التوجه إلى [Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30 White](/components/cmsqkaln50002ugym1alavhrp) إذا كان توجهك يتركز على الآتي:
* السعة واللون والإضاءة نفسها في شريحتين: قناتان وأداءٌ كامل، بسعرٍ أقلّ.
https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-rgb-memory`,
  },
  {
    id: 'cmpiebdbz001f00ymszifpqs9', force: true,
    specs: { profile: 'XMP 3.0 & EXPO' },
    description: `### Kingston Fury Beast DDR5 32GB 6000MHz

طقمٌ موثوق من سلسلة Kingston الشهيرة: 32 جيجابايت (2×16) بسرعة 6000 وتوقيت CL36، بملفّي XMP وEXPO ومشتّتٍ أسود منخفض بلا إضاءة. خيارٌ آمن لأيّ تجميعة ألعاب.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت CL36:[/green] السرعة المثلى لمعالجات Ryzen 7000 و9000، وسرعةٌ ممتازة لـIntel.

[green]ملفّا XMP 3.0 وEXPO معاً:[/green] الطقم نفسه يعمل بسرعته الكاملة على المنصّتين.

[green]مشتّت ألومنيوم أسود بارتفاع 34.9 مم:[/green] يتوافق مع المبرّدات الهوائيّة الكبيرة.

[green]طقم من شريحتين:[/green] قناتان مزدوجتان وأداءٌ كامل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيت CL36 أبطأ قليلاً من أطقم CL30.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB.
* لا تُركَّب على لوحات DDR4.

---
بإمكانك التوجه إلى [Kingston Fury Beast 64GB (2x32GB) DDR5 6000MHz CL30](/components/cmtjkyciz000670ymzgbqg9si) إذا كان توجهك يتركز على الآتي:
* ضعف السعة بتوقيت CL30 للمونتاج والعمل الثقيل.
https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-memory`,
  },
  {
    id: 'cmpiebcpt001d00ymnktdbbjv', force: true,
    specs: { casLatency: 'CL32', color: 'Silver' },
    description: `### G.Skill Trident Z5 RGB 32GB 6400MHz

طقمٌ من أشهر سلاسل G.Skill بلونٍ فضّيّ وشريط إضاءة RGB: 32 جيجابايت بسرعة 6400 وتوقيت CL32. للاعبين وصنّاع المحتوى على منصّات Intel خاصّةً.

**التقنيات الأساسية المدعومة:**

[green]6400 MT/s بتوقيت 32-39-39-102 وجهد 1.40 فولت:[/green] زمن وصولٍ فعليّ قرابة 10 نانوثانية، مع عرض نطاقٍ أعلى من أطقم 6000.

[green]إضاءة RGB:[/green] شريطٌ متّصل يتزامن مع برامج ASUS وMSI وGigabyte وASRock.

[green]مشتّت ألومنيوم:[/green] يحافظ على حرارةٍ منخفضة حتى تحت الضغط.

[green]ملفّ Intel XMP 3.0:[/green] السرعة الكاملة بضغطةٍ في البايوس.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سرعة 6400 قد تحتاج تحديث البايوس على بعض اللوحات المتوسّطة لتستقرّ.
* على Ryzen قد يلزم خفضها إلى 6000، والنسخة المضبوطة لـAMD هي Trident Z5 Neo.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ارتفاعها 44 مم، فقد تتعارض مع بعض المبرّدات الهوائيّة الكبيرة جداً.

---
بإمكانك التوجه إلى [Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz CL30](/components/cmv18klcb0000jgymj6mis6yg) إذا كان توجهك يتركز على الآتي:
* توفير الميزانيّة بلا إضاءة، مع ملفّ EXPO لمعالجات AMD.
https://www.gskill.com/products/1/165/374/Trident-Z5-RGB`,
  },
  {
    id: 'cmpiecrbz005g00ym3k9f15y0',
    specs: { color: 'Black' },
    description: `### Corsair Vengeance RGB 64GB 6400MHz

ذاكرة DDR5 بسعة 64 جيجابايت (2×32) بسرعة 6400 وتوقيت CL32، بإضاءة RGB متعدّدة المناطق. مخصّصة للتصيير وصناعة المحتوى وتعدّد المهامّ المكثّف على منصّات Intel.

**التقنيات الأساسية المدعومة:**

[green]64 جيجابايت في شريحتين:[/green] تكفي برامج المونتاج والمحاكاة، وتُبقي فتحتين فارغتين.

[green]6400 MT/s بتوقيت CL32:[/green] سرعةٌ عالية نادرة في هذه السعة.

[green]إضاءة RGB بعشر مناطق لكلّ شريحة:[/green] تُدار ببرنامج iCUE.

[green]ملفّ Intel XMP 3.0:[/green] تفعيلٌ بضغطة في البايوس.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* التحكّم الكامل بالإضاءة يحتاج برنامج iCUE في الخلفيّة.
* على معالجات AMD قد تحتاج الخفض إلى 6000.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ارتفاعها 44 مم، وقد تتعارض مع المبرّدات الهوائيّة الضخمة.

---
بإمكانك التوجه إلى [Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz CL30](/components/cmv18klcb0000jgymj6mis6yg) إذا كان توجهك يتركز على الآتي:
* جهاز ألعابٍ لا يحتاج 64 جيجابايت، بلا إضاءة وبسعرٍ أقلّ.
https://www.corsair.com/us/en/p/memory/cmh64gx5m2b6400c32/vengeance-rgb-64gb-2x32gb-ddr5-dram-6400mt-s-cl32-memory-kit-black-cmh64gx5m2b6400c32`,
  },
  {
    id: 'cmtjkyciz000670ymzgbqg9si', force: true,
    specs: { profile: 'EXPO' },
    description: `### Kingston Fury Beast 64GB (2x32GB) DDR5 6000MHz CL30

64 جيجابايت بتوقيت CL30، وهو توقيتٌ لا يُتاح عادةً في هذه السعة. طقمُ من يحرّر الفيديو أو يشغّل أجهزةً افتراضيّة على منصّة Ryzen، لا من يلعب فقط.

**التقنيات الأساسية المدعومة:**

[green]64 جيجابايت في شريحتين:[/green] تُبقي فتحتين فارغتين في لوحةٍ رباعيّة.

[green]6000 MT/s بتوقيت CL30:[/green] سرعةٌ وزمن استجابةٍ من فئة أطقم 32 جيجابايت، لا من فئة السعات الكبيرة البطيئة.

[green]ملفّ AMD EXPO معتمد:[/green] السرعة الكاملة بضغطة على لوحات AM5.

[green]ارتفاع 34.9 مم:[/green] منخفض، يمرّ تحت أغلب المبرّدات الهوائيّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* هذه نسخة EXPO، ونسخة XMP منفصلة لمنصّات Intel. على Intel يعمل غالباً عبر ترجمة اللوحة للملفّ.
* تشغيل أربع شرائح DDR5 لاحقاً يخفض التردّد عادةً، فالتوسعة ليست بلا ثمن.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا إضاءة.
* لا قيمة له في تجميعة ألعابٍ خالصة، فالمبلغ نفسه في كرتٍ أعلى يعطيك فرقاً تراه.

---
بإمكانك التوجه إلى [TeamGroup T-Create Expert 64GB 6000MHz](/components/cmpiecrvk005i00ym5hjcu7d7) إذا كان توجهك يتركز على الآتي:
* السعة والسرعة نفسها بسعرٍ أقلّ، في طقمٍ موجّه أصلاً لأعمال المحتوى.
https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-memory`,
  },
  {
    id: 'cmv14q9ra001050ymoh4t9kh6',
    description: `### Corsair Vengeance RGB 32GB (2x16GB) DDR5 6400MHz CL32

طقم Vengeance RGB الأسود بسرعة 6400 وتوقيت CL32، بإضاءةٍ متعدّدة المناطق، ومضبوطٌ لمنصّات Intel. يناسب تجميعة Intel مضيئة.

**التقنيات الأساسية المدعومة:**

[green]6400 MT/s بتوقيت CL32:[/green] زمن وصولٍ فعليّ قرابة 10 نانوثانية، مع عرض نطاقٍ أعلى من 6000.

[green]إضاءة RGB بعشر مناطق:[/green] تُدار ببرنامج iCUE أو ببرنامج اللوحة.

[green]منظّم جهدٍ لكسر السرعة (PMIC):[/green] على الطقم نفسه، لمن يريد الضبط يدوياً.

[green]32 جيجابايت بشريحتين:[/green] السعة المناسبة للألعاب الحديثة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ملفّ XMP فقط، فعلى لوحات AMD يحتاج ضبطاً يدوياً، والنسخة Z32 (EXPO) أنسب لها.
* ارتفاعه 44 مم، فراجع المبرّد الهوائيّ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا ملفّ EXPO.
* لا يُركَّب على لوحات DDR4.

---
بإمكانك التوجه إلى [Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30 White](/components/cmsqkaln50002ugym1alavhrp) إذا كان توجهك يتركز على الآتي:
* طقم Vengeance RGB أبيض بسرعة 6000 CL30 وملفّ EXPO.
https://www.corsair.com/us/en/p/memory/cmh32gx5m2b6400c32/vengeance-rgb-32gb-2x16gb-ddr5-dram-6400mhz-c32-memory-kit-black`,
  },
  {
    id: 'cmpiecptm005a00ym19nh2ieb', force: true,
    specs: { casLatency: 'CL46', profile: 'XMP 3.0 & EXPO' },
    description: `### Crucial Pro DDR5 32GB 5600MHz

ذاكرة DDR5 قياسيّة من Crucial (ذراع Micron) بسرعة 5600 وتوقيت CL46: ثباتٌ تامّ على أيّ لوحة بلا تعقيدات. تناسب جهاز عملٍ أو تجميعة اقتصاديّة.

**التقنيات الأساسية المدعومة:**

[green]5600 MT/s:[/green] أعلى سرعةٍ رسميّة لمعالجات كثيرة (مثل Ryzen 9000 وCore Ultra)، فتعمل بلا ملفّات كسرٍ في الغالب.

[green]ملفّا XMP 3.0 وEXPO:[/green] تفعيلٌ بضغطة على المنصّتين.

[green]مشتّت ألومنيوم بسيط:[/green] بحجمٍ يتوافق مع كلّ الأجهزة والكيسات الصغيرة.

[green]من Micron مباشرة:[/green] الشرائح والطقم من مصنّعٍ واحد، مع ضمانٍ محدود مدى الحياة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيت CL46 بطيء مقارنةً بأطقم الألعاب (CL30 إلى CL36).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة.
* ليست للألعاب التنافسيّة، فأطقم 6000 أسرع بوضوح.

---
بإمكانك التوجه إلى [Crucial Pro 32GB (2x16GB) DDR5 6000MHz CL36](/components/cmuzymt7k0012wwymlkey8obj) إذا كان توجهك يتركز على الآتي:
* الطقم نفسه بسرعة 6000 وتوقيت CL36 للألعاب.
https://www.crucial.com/memory/ddr5/cp2k16g56c46u5`,
  },
  {
    id: 'cmpiecpi9005900ymuuylqjby', force: true,
    specs: { casLatency: 'CL40' },
    description: `### TeamGroup T-Force Delta RGB 32GB 6400MHz

من أشهر أطقم DDR5 محلّياً بفضل تصميمها وشريط إضاءتها الواسع: 32 جيجابايت بسرعة 6400 وتوقيت CL40، بملفّ Intel XMP.

**التقنيات الأساسية المدعومة:**

[green]6400 MT/s:[/green] عرض نطاقٍ عالٍ لمعالجات Intel الحديثة.

[green]إضاءة بزاوية 120 درجة:[/green] شريطٌ ممتدّ بتوزيعٍ لونيّ واسع، يتزامن مع برامج اللوحات.

[green]ملفّ Intel XMP 3.0:[/green] السرعة الكاملة بضغطة.

[green]32 جيجابايت بشريحتين.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيت CL40 واسع، فزمن الوصول الفعليّ أعلى من أطقم 6000 CL30 رغم السرعة الأعلى.
* على لوحات AMD قد تحتاج الخفض يدوياً إلى 6000 لتستقرّ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ارتفاعها 46.1 مم، من أطول الأطقم، فقد تتعارض مع المبرّدات الهوائيّة الضخمة.

---
بإمكانك التوجه إلى [Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz CL30](/components/cmv18klcb0000jgymj6mis6yg) إذا كان توجهك يتركز على الآتي:
* مشتّت منخفض يتوافق مع أيّ مبرّد، وملفّ EXPO لمعالجات Ryzen.
https://www.teamgroupinc.com/en/product-detail/memory/T-FORCE/delta-rgb-ddr5-black/delta-rgb-ddr5-black-FF3D532G6400HC40BDC01/`,
  },
];
// ---------------------------------------------------------------- التنفيذ
const backup = [];
let bad = 0;
for (const r of REWRITE) {
  const c = await prisma.component.findUnique({ where: { id: r.id }, select: { id: true, name: true, description: true, specs: true } });
  if (!c) { console.log(`✗ ${r.id} غير موجود`); bad++; continue; }
  /* وصفٌ غنيّ ينقصه رابط الشركة وحده: يُلحق الرابط، أو يُنظَّف سطره الأخير، بلا إعادة كتابة */
  if (r.append) r.description = c.description.trimEnd() + '\n' + r.append;
  if (r.trimLast) r.description = c.description.trimEnd().split('\n').map((l, i, a) => (i === a.length - 1 ? l.replace(/^موقع الشركة الرسمي:\s*/, '').trim() : l)).join('\n');
  const d = r.description;
  const errs = [];
  if (/\*\*\[(yellow|red)/.test(d)) errs.push('نجوم حول وسم اللون');
  if (!/^https?:\/\/\S+$/.test(d.trim().split('\n').pop())) errs.push('السطر الأخير ليس رابطاً');
  if (!d.startsWith('### ')) errs.push('لا عنوان');
  for (const m of d.matchAll(/\]\(\/components\/([a-z0-9]+)\)/g)) {
    if (!(await prisma.component.findUnique({ where: { id: m[1] }, select: { id: true } }))) errs.push(`بديلٌ مفقود ${m[1]}`);
  }
  /* force: تصحيحُ بياناتٍ في وصفٍ قديمٍ أطولَ بحشوٍ أو بمعلومةٍ خاطئة — الطول هنا ليس المقياس */
  if (!r.trimLast && !r.force && d.length <= (c.description || '').length) errs.push(`ليس أطول (${d.length} ≤ ${c.description.length})`);
  console.log(`${errs.length ? '✗' : '✔'} ${c.name}: ${(c.description || '').length} → ${d.length}${r.specs ? ' + مواصفات ' + JSON.stringify(r.specs) : ''}${errs.length ? '  ⟵ ' + errs.join('، ') : ''}`);
  if (errs.length) bad++;
  backup.push(c);
}
if (bad) { console.log(`\n${bad} خطأ — لم يُنفَّذ شيء`); process.exit(1); }
if (apply) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  writeFileSync(`backups/desc-${TAG}-${stamp}.json`, JSON.stringify(backup, null, 2));
  for (const r of REWRITE) {
    const c = backup.find((b) => b.id === r.id);
    const specs = r.specs ? { ...(typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs), ...r.specs } : undefined;
    await prisma.component.update({ where: { id: r.id }, data: { description: r.description, ...(specs ? { specs } : {}) } });
  }
  console.log(`\nنُفّذ ${REWRITE.length} — النسخة في backups/desc-${TAG}-${stamp}.json`);
} else console.log(`\n${REWRITE.length} وصفاً — (عرضٌ فقط — أضف --apply)`);
await prisma.$disconnect();
