/**
 * ============ إعادة كتابة أوصاف الرام القصيرة — 2026-10-09 ============
 *
 * طلب نوّاف: «عدل الاوصاف السابقة القليلة». هذه أوصاف الرام التي كانت دون 900 حرف:
 * بنودٌ خضراء بلا شرح («ملفّ XMP 3.0.» وحدها)، أو صيغةٌ قديمة بلا عنوانٍ ولا نجمة
 * (TeamGroup وSilicon Power)، أو بلا رابط الشركة (T-Create).
 *
 * القاعدة: لا رقم جديد إلّا من مصدر — الأرقام من مواصفات القطعة المسجّلة، وما أُضيف قُرئ:
 *   Ripjaws M5 RGB 6000 CL36: صفحة G.Skill تقول XMP **و**EXPO (كان الوصف يقول XMP فقط
 *     ويحيل لنسخة Neo — خطأ) — صُحّح الملفّ وأُضيف الارتفاع 41 (ارتفاع السلسلة).
 *   Zenith 6000 CL30: 1.35 فولت، 30-38-38-96 (BuildCores / Pangoly برمز القطعة).
 *   رابطان مكسوران صُحّحا: Kingston Renegade DDR5 (‎…/fury-renegade-ddr5) وT-Create Expert.
 *
 *   node scripts/rewrite-desc-ram-2026-10-09.mjs           # عرض
 *   node scripts/rewrite-desc-ram-2026-10-09.mjs --apply   # تنفيذ (نسخة احتياطية أوّلاً)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const TAG = 'ram';

const alt = (name, id, ...why) => `---\nبإمكانك التوجه إلى [${name}](/components/${id}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const REWRITE = [
  {
    id: 'cmv14qb11001f50ymwsflsfql',
    description: `### Lexar THOR OC 32GB (2x16GB) DDR5 6000MHz CL38

طقمٌ اقتصاديّ بسرعة 6000 يعمل على لوحات Intel وAMD معاً، بمشتّتٍ أسود منخفض بلا إضاءة. يناسب تجميعة ألعابٍ متوسّطة تريد السرعة المناسبة لمعالجات Ryzen بأقلّ كلفة.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s:[/green] السرعة التي يعمل عندها متحكّم الذاكرة في Ryzen 7000 و9000 بنسبة 1:1، وهي سرعةٌ ممتازة لمعالجات Intel الحديثة أيضاً.

[green]ملفّا XMP 3.0 وEXPO:[/green] تُفعَّل السرعة بضغطةٍ واحدة في البايوس على أيّ منصّة، دون البحث عن نسخةٍ مخصّصة.

[green]32 جيجابايت بشريحتين:[/green] السعة المناسبة للألعاب الحديثة مع المتصفّح والبثّ في الخلفيّة.

[green]ارتفاع نحو 41 مم:[/green] مشتّت ألومنيوم منخفض لا يزاحم المبرّدات الهوائيّة الكبيرة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيت CL38 أبطأ من أطقم CL30 وCL36 بالسرعة نفسها. الفرق في الألعاب الحسّاسة للذاكرة بضعة بالمئة.
* Lexar أقلّ انتشاراً في الذاكرة من Corsair وKingston، فدعمها في قوائم توافق اللوحات أضيق أحياناً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB.
* لا يركب على لوحات DDR4.

${alt('Crucial Pro 32GB (2x16GB) DDR5 6000MHz CL36', 'cmuzymt7k0012wwymlkey8obj', 'طقم 6000 بتوقيت CL36 أسرع قليلاً ومن شركةٍ تصنع شرائحها بنفسها.')}
https://americas.lexar.com/product/lexar-thor-oc-ddr5-desktop-memory/`,
  },
  {
    id: 'cmv18kmld000ejgym9rpqxtdk',
    description: `### G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz CL36 Black

طقم 64 جيجابايت من أشهر سلاسل G.Skill، بمشتّتٍ أسود مطفأ وشريط إضاءة RGB بتصميم Trident المعروف. يناسب جهازاً يجمع الألعاب مع المونتاج أو التصميم ثلاثيّ الأبعاد.

**التقنيات الأساسية المدعومة:**

[green]64 جيجابايت بشريحتين:[/green] السعة كلّها في منفذين ويبقى الآخران فارغين. أربع شرائح DDR5 تُجبر المعالج غالباً على خفض السرعة.

[green]6000 MT/s بتوقيت 36-36-36-96 وجهد 1.35 فولت:[/green] سرعة النقطة المثلى لمعالجات Ryzen، بجهدٍ أقلّ من أطقم CL30.

[green]ملفّ Intel XMP 3.0:[/green] تفعيلٌ بضغطة في البايوس.

[green]إضاءة RGB:[/green] تتزامن مع ASUS Aura وMSI Mystic Light وGigabyte RGB Fusion وASRock Polychrome.

[green]ضمان مدى الحياة من G.Skill.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ارتفاعه 44 مم، فراجع خلوص المبرّد الهوائيّ الكبير قبل الشراء.
* الملفّ الجاهز XMP. على لوحات AMD يعمل غالباً عبر ترجمة اللوحة للملفّ، لكنّ النسخة المضبوطة لـAMD هي Trident Z5 Neo.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس الأسرع توقيتاً بين أطقم 64 جيجابايت، فأطقم CL30 أسرع قليلاً.
* لا يركب على لوحات DDR4.

${alt('G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz CL36 White', 'cmv14qab2001650ymhbrajthf', 'الطقم نفسه باللون الأبيض.')}
https://www.gskill.com/products/1/165/374/Trident-Z5-RGB`,
  },
  {
    id: 'cmv18km0m0008jgymh5clmze1',
    description: `### Kingston Fury Beast RGB 64GB (2x32GB) DDR5 6000MHz CL36

64 جيجابايت بشريحتين بسرعة 6000 وإضاءة RGB، بملفّي XMP وEXPO. يناسب جهازاً للمونتاج والبثّ والألعاب معاً، ويعمل على لوحات Intel وAMD.

**التقنيات الأساسية المدعومة:**

[green]64 جيجابايت بشريحتين:[/green] سعةٌ للمونتاج بدقّة 4K والآلات الافتراضيّة، مع منفذين فارغين للترقية.

[green]6000 MT/s بتوقيت CL36:[/green] السرعة المثلى لمعالجات Ryzen 7000 و9000، بجهدٍ أقلّ من نسخة CL30.

[green]ملفّا XMP 3.0 وEXPO:[/green] تفعيلٌ بضغطة على المنصّتين.

[green]إضاءة RGB بتقنية Infrared Sync:[/green] تتزامن الشريحتان دون كابلات، وتُدار ببرنامج Kingston FURY CTRL أو برامج اللوحات.

[green]ارتفاع 42 مم:[/green] يتوافق مع أغلب المبرّدات الهوائيّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيت CL36 أبطأ قليلاً من أطقم CL30. الفرق يظهر في الألعاب الحسّاسة للذاكرة فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* 64 جيجابايت تزيد عن حاجة الألعاب وحدها، و32 تكفي.
* لا يركب على لوحات DDR4.

${alt('Kingston Fury Beast 64GB (2x32GB) DDR5 6000MHz CL30', 'cmtjkyciz000670ymzgbqg9si', 'السعة نفسها بتوقيت CL30 أسرع وبلا إضاءة.')}
https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-rgb-memory`,
  },
  {
    id: 'cmv18kmvc000hjgymkk2waid7',
    description: `### Kingston Fury Beast RGB 64GB (2x32GB) DDR4 3200MHz CL16

سعة 64 جيجابايت لمنصّات DDR4 (AM4 ولوحات Intel من الجيل العاشر إلى الرابع عشر)، لمن يرقّي جهازه القائم إلى سعةٍ كبيرة دون تغيير اللوحة والمعالج.

**التقنيات الأساسية المدعومة:**

[green]64 جيجابايت في شريحتين:[/green] شرائح 32 جيجابايت تُبقي منفذين فارغين، وهي أسهل على المتحكّم من أربع شرائح.

[green]3200 بتوقيت CL16:[/green] توقيتٌ ضيّق لهذه السرعة، وسرعةٌ تعمل عليها معالجات Ryzen 3000 و5000 بلا ضبطٍ يدويّ.

[green]ملفّ Intel XMP:[/green] تفعيلٌ بضغطة في البايوس، ويعمل على لوحات AMD أيضاً.

[green]إضاءة RGB بتقنية Infrared Sync:[/green] مزامنةٌ بين الشريحتين بلا كابلات.

[green]ارتفاع 42 مم:[/green] يتوافق مع أغلب المبرّدات الهوائيّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* DDR4 منصّةٌ منتهية، فهذا الطقم للترقية لا لتجميعةٍ جديدة.
* سعره مرتفع الآن مقارنةً بسعته، فاشترِه فقط إن احتجت 64 جيجابايت فعلاً على لوحة DDR4.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يركب على لوحات DDR5.

${alt('Corsair Vengeance LPX 32GB (2x16GB) DDR4 3600MHz', 'cmr3al4g4000104jy62ztrmu8', 'طقم DDR4 بسعة 32 جيجابايت وسرعة 3600، أرخص بكثير ويكفي الألعاب.')}
https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr4-rgb-memory`,
  },
  {
    id: 'cmv18kmb8000bjgyma8357d5a',
    description: `### Kingston Fury Beast RGB 64GB (2x32GB) DDR5 6000MHz CL30 White

أسرع أطقم 64 جيجابايت من Kingston بالأبيض: 6000 بتوقيت CL30 وملفّ EXPO لمعالجات Ryzen. يناسب تجميعة بيضاء قويّة للألعاب والمونتاج معاً.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت 30-36-36:[/green] أقلّ زمن وصولٍ تحصل عليه بلا ضبطٍ يدويّ على Ryzen 7000 و9000.

[green]64 جيجابايت بشريحتين:[/green] سعةٌ للمونتاج والآلات الافتراضيّة، ومنفذان فارغان.

[green]ملفّ AMD EXPO:[/green] تفعيلٌ بضغطة في البايوس.

[green]مشتّت أبيض بإضاءة RGB:[/green] بتقنية Infrared Sync، ويُدار ببرنامج Kingston FURY CTRL.

[green]شرائح ثنائيّة الرتبة:[/green] أداءٌ أفضل في الألعاب من الشرائح أحاديّة الرتبة بالسرعة نفسها.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سعره مرتفع جداً مع ارتفاع أسعار الذاكرة.
* جهد 1.40 فولت، فحرارته أعلى قليلاً من الأطقم البطيئة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* نسخة EXPO مضبوطة لـAMD، ولمنصّات Intel نسخة XMP منفصلة.
* لا يركب على لوحات DDR4.

${alt('G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz CL36 White', 'cmv14qab2001650ymhbrajthf', 'طقم 64 جيجابايت أبيض آخر بتوقيت CL36 وسعرٍ أقلّ عادةً.')}
https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-rgb-memory`,
  },
  {
    id: 'cmv14qb97001i50ymyovp4md5',
    description: `### Lexar ARES RGB 32GB (2x16GB) DDR5 6400MHz CL32

أعلى أطقم Lexar للألعاب: 6400 بتوقيت CL32 وإضاءة RGB. أداؤه قريبٌ من الأطقم المشهورة بسعرٍ أقلّ غالباً، ويناسب تجميعة ألعابٍ قويّة على Intel أو AMD.

**التقنيات الأساسية المدعومة:**

[green]6400 MT/s بتوقيت 32-38-38-76:[/green] زمن وصولٍ فعليّ قرابة 10 نانوثانية، مثل أطقم 6000 CL30، مع عرض نطاقٍ أعلى.

[green]ملفّا XMP 3.0 وEXPO:[/green] تفعيلٌ بضغطة على المنصّتين.

[green]إضاءة RGB ومشتّت ألومنيوم:[/green] بشكلٍ أسود بسيط.

[green]32 جيجابايت بشريحتين:[/green] السعة المناسبة للألعاب الحديثة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* على معالجات Ryzen قد يلزم خفضه إلى 6000 ليعمل المتحكّم بنسبة 1:1 ويستقرّ.
* ارتفاعه 43 مم، فراجع خلوص المبرّد الهوائيّ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* دعم Lexar وقوائم توافقها أقلّ انتشاراً من Corsair وKingston.
* لا يركب على لوحات DDR4.

${alt('G.Skill Flare X5 DDR5 32GB 6000MHz', 'cmpiecrkg005h00ymkt3mt6pp', 'طقم 6000 بتوقيتٍ ضيّق مضبوط لمعالجات AMD.')}
https://americas.lexar.com/product/lexar-ares-rgb-ddr5-desktop-memory/`,
  },
  {
    id: 'cmpiedhk4006d00ymjqr6stcy',
    description: `### TeamGroup Elite 16GB (2x8GB) DDR5 4800MHz

ذاكرة DDR5 قياسيّة بلا مشتّت ولا إضاءة، تعمل بسرعتها مباشرةً دون أيّ ضبط. تناسب جهازاً مكتبيّاً أو جهاز عملٍ بسيطاً، أو تجميعةً بميزانيّةٍ ضيّقة جداً تُرقّى لاحقاً.

**التقنيات الأساسية المدعومة:**

[green]4800 MT/s بمعيار JEDEC:[/green] السرعة القياسيّة لـDDR5. تعمل فور التركيب بلا ملفّات كسرٍ، فهي الأكثر توافقاً مع أيّ لوحة.

[green]جهد 1.1 فولت:[/green] الجهد القياسيّ، فحرارتها منخفضة.

[green]قناتان (2×8 جيجابايت):[/green] أداءٌ أفضل من شريحةٍ واحدة بسعة 16.

[green]ارتفاع 32 مم:[/green] لا تتعارض مع أيّ مبرّد هوائيّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا مشتّت حراريّ، وهذا كافٍ عند 4800 لكنّه لا يترك هامشاً لرفع السرعة.
* 16 جيجابايت باتت الحدّ الأدنى، والألعاب الحديثة تفضّل 32.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بطيئة للألعاب الحديثة مقارنةً بأطقم 6000، والفرق ملموس في الألعاب الحسّاسة للذاكرة.
* لا ملفّ XMP أو EXPO، ولا إضاءة.

${alt('Corsair Vengeance 16GB (2x8GB) 5200MHz', 'cmpiedh03006b00ym57kak80u', 'سرعة 5200 ومشتّت معدنيّ بفارق سعرٍ بسيط.')}
https://www.teamgroupinc.com/en/product-detail/memory/TEAMGROUP/elite-u-dimm-ddr5/elite-u-dimm-ddr5-TED516G4800C40DC016/`,
  },
  {
    id: 'cmv18klid0002jgym5suztftn',
    description: `### Corsair Vengeance RGB 16GB (2x8GB) DDR5 5200MHz CL40

طقم DDR5 مدخليّ بإضاءة RGB من Corsair، لتجميعةٍ اقتصاديّة أو جهازٍ مكتبيّ يريد شيئاً من الشكل. يعمل على أيّ لوحة DDR5 حديثة.

**التقنيات الأساسية المدعومة:**

[green]قناتان (2×8 جيجابايت):[/green] أداءٌ أفضل من شريحةٍ واحدة بالسعة نفسها، وهو ضروريّ لمعالجات الرسوميّات المدمجة.

[green]5200 MT/s بتوقيت 40-40-40-77 وجهد 1.25 فولت:[/green] أسرع من ذاكرة 4800 القياسيّة، بحرارةٍ منخفضة.

[green]إضاءة RGB بعشر مناطق لكلّ شريحة:[/green] تُدار ببرنامج iCUE أو ببرنامج اللوحة الأمّ.

[green]ملفّ Intel XMP 3.0:[/green] تفعيلٌ بضغطة في البايوس.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 16 جيجابايت باتت الحدّ الأدنى للألعاب الحديثة، و32 أريح.
* 5200 بتوقيت CL40 أبطأ من أطقم 6000.
* ارتفاعه 44 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا ملفّ EXPO مضبوط لمعالجات AMD.
* لا يركب على لوحات DDR4.

${alt('Corsair Vengeance 16GB (2x8GB) 5200MHz', 'cmpiedh03006b00ym57kak80u', 'الطقم نفسه بلا إضاءة وبسعرٍ أقلّ.')}
https://www.corsair.com/us/en/p/memory/cmh16gx5m2b5200c40/vengeance-rgb-16gb-2x8gb-ddr5-dram-5200mts-cl40-memory-kit-black-cmh16gx5m2b5200c40`,
  },
  {
    id: 'cmpiecrvk005i00ym5hjcu7d7',
    description: `### TeamGroup T-Create Expert 64GB DDR5 6000MHz

طقم 64 جيجابايت من سلسلة T-Create الموجّهة لصنّاع المحتوى ومحطّات العمل: مشتّتٌ معدنيّ منخفض بلا إضاءة، وسرعة 6000 بملفّي XMP وEXPO.

**التقنيات الأساسية المدعومة:**

[green]64 جيجابايت بشريحتين:[/green] سعةٌ لمشاريع التصيير ثلاثيّ الأبعاد والمونتاج والآلات الافتراضيّة، ومنفذان فارغان للترقية.

[green]6000 MT/s:[/green] السرعة المثلى لمعالجات Ryzen 7000 و9000، وسرعةٌ جيّدة لمعالجات Intel.

[green]ملفّا XMP وEXPO:[/green] تفعيلٌ بضغطة على المنصّتين.

[green]ارتفاع 32 مم:[/green] من أقصر الأطقم، فلا يزاحم أيّ مبرّدٍ هوائيّ مهما كبر.

[green]مشتّت معدنيّ يغطّي الشرائح:[/green] يحافظ على حرارةٍ ثابتة في الأحمال الطويلة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيتاته ليست الأضيق بين أطقم 6000، فهو مضبوط للاستقرار لا لأقصى أداءٍ في الألعاب.
* تصميمٌ عمليّ بلا إضاءة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس مخصّصاً لكسر السرعة اليدويّ.
* لا يركب على لوحات DDR4.

${alt('Corsair Dominator Titanium 48GB 7200MHz', 'cmpiecq26005b00ymniswty6k', 'سرعة 7200 أعلى وإضاءة RGB، على حساب سعةٍ أقلّ (48 جيجابايت).')}
https://www.teamgroupinc.com/en/product-detail/memory/T-CREATE/expert-u-dimm-ddr5-black/`,
  },
  {
    id: 'cmpiecqry005e00ymvr32waij',
    description: `### Silicon Power Zenith DDR5 32GB 6000MHz

طقم 32 جيجابايت بسرعة 6000 وتوقيت CL30 من سلسلة XPOWER Zenith، بسعرٍ أقلّ عادةً من الأسماء المشهورة. يناسب تجميعة ألعابٍ تبحث عن التوقيت الأمثل لمعالجات Ryzen بميزانيّةٍ محدودة.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت 30-38-38-96:[/green] التوقيت الأوّل CL30 هو نفسه في الأطقم الأغلى، وهو أكثر ما يحدّد زمن الوصول.

[green]ملفّا XMP وEXPO:[/green] تفعيلٌ بضغطة على Intel وAMD.

[green]جهد 1.35 فولت:[/green] أقلّ من أطقم CL30 الأخرى التي تعمل عند 1.40، فحرارته أقلّ.

[green]ارتفاع 38.5 مم:[/green] منخفضٌ نسبياً، ويتوافق مع المبرّدات الهوائيّة الكبيرة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* التوقيتات الثانويّة (38-38) أوسع من أطقم CL30 الممتازة، فالفرق عنها صغير لكنّه موجود.
* Silicon Power أقلّ حضوراً في قوائم توافق اللوحات.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يترك هامشاً كبيراً لكسر السرعة اليدويّ.
* لا يركب على لوحات DDR4.

${alt('Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz CL30', 'cmv18klcb0000jgymj6mis6yg', 'الطقم الأشهر بالسرعة والتوقيت نفسيهما ومشتّت 35 مم.')}
https://www.silicon-power.com/product-detail/XPOWER_Zenith_DDR5_Gaming_UDIMM/`,
  },
  {
    id: 'cmuzymt7k0012wwymlkey8obj',
    description: `### Crucial Pro 32GB (2x16GB) DDR5 6000MHz CL36

طقم DDR5 من Crucial (ذراع Micron، صانعة الشرائح نفسها) بسرعة 6000 وملفّي XMP وEXPO، ومشتّتٍ منخفض. يناسب أيّ تجميعة Intel أو AMD دون البحث عن نسخةٍ مخصّصة.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت CL36 وجهد 1.35 فولت:[/green] السرعة المثلى لمعالجات Ryzen 7000 و9000، بجهدٍ معتدل وحرارةٍ منخفضة.

[green]ملفّا XMP 3.0 وEXPO:[/green] الطقم نفسه يعمل بسرعته الكاملة على المنصّتين.

[green]ارتفاع 35 مم:[/green] لا يتعارض مع المبرّدات الهوائيّة الضخمة ذات البرجين.

[green]من Micron مباشرة:[/green] الشرائح والطقم من مصنّعٍ واحد، ومعه ضمانٌ محدود مدى الحياة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيت CL36 أبطأ قليلاً من أطقم CL30 بالسرعة نفسها. الفرق في الألعاب صغير.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB.
* لا يركب على لوحات DDR4.

${alt('G.Skill Flare X5 DDR5 32GB 6000MHz', 'cmpiecrkg005h00ymkt3mt6pp', 'طقم 6000 بتوقيتٍ أضيق، مضبوط لمعالجات AMD.')}
https://www.crucial.com/memory/ddr5/cp2k16g60c36u5b`,
  },
  {
    id: 'cmv14qa1c001350ymd04l48aj',
    specs: { profile: 'XMP 3.0 & EXPO', heightMm: '41' },
    description: `### G.Skill Ripjaws M5 RGB 32GB (2x16GB) DDR5 6000MHz CL36

سلسلة G.Skill الأحدث ذات الإضاءة بسعرٍ متوسّط: 6000 بتوقيت CL36 ومشتّت ألومنيوم أسود مطفأ بارتفاع 41 مم فقط. يناسب تجميعة ألعابٍ على Intel أو AMD.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت 36-36-36-96 وجهد 1.35 فولت:[/green] السرعة المثلى لمعالجات Ryzen وجهدٌ معتدل.

[green]ملفّا Intel XMP 3.0 وAMD EXPO:[/green] الطقم نفسه يعمل بسرعته الكاملة على المنصّتين.

[green]ارتفاع 41 مم:[/green] من أقصر أطقم RGB، فيدخل تحت المبرّدات الهوائيّة الكبيرة.

[green]إضاءة RGB:[/green] تتزامن مع ASUS Aura وMSI Mystic Light وGigabyte RGB Fusion وASRock Polychrome.

[green]ضمان مدى الحياة من G.Skill.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيت CL36 أبطأ قليلاً من أطقم CL30 بالسرعة نفسها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب كسر السرعة المتقدّم.
* لا يركب على لوحات DDR4.

${alt('G.Skill Flare X5 DDR5 32GB 6000MHz', 'cmpiecrkg005h00ymkt3mt6pp', 'طقم 6000 بتوقيتٍ أضيق مضبوط لـAMD، بلا إضاءة.')}
https://www.gskill.com/product/165/421/1725420239/F5-6000J3636F16GX2-RM5RK`,
  },
  {
    id: 'cmv18klrj0005jgymv971arev',
    description: `### Corsair Vengeance RGB 48GB (2x24GB) DDR5 5600MHz CL40

سعة 48 جيجابايت بشريحتين: وسطٌ بين 32 و64 لمن يحتاج ذاكرةً أكبر للمونتاج أو التصميم دون كلفة 64. شرائح 24 جيجابايت حلٌّ ذكيّ لهذه السعة.

**التقنيات الأساسية المدعومة:**

[green]48 جيجابايت بشريحتين فقط:[/green] شرائح بكثافة 24 جيجابت، فتبقى المنافذ الأخرى فارغة وتبقى السرعة أعلى من أربع شرائح.

[green]جهد 1.25 فولت:[/green] حرارةٌ منخفضة واستقرارٌ سهل.

[green]5600 MT/s بتوقيت CL40 وملفّ Intel XMP 3.0:[/green] سرعةٌ مختبَرة على لوحات Intel.

[green]إضاءة RGB بعشر مناطق لكلّ شريحة:[/green] ببرنامج iCUE.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 5600 بتوقيت CL40 أبطأ من أطقم 6000 للألعاب.
* ارتفاعه 44 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ملفّ XMP فقط، مضبوطٌ لمنصّات Intel.
* لا يركب على لوحات DDR4.

${alt('Kingston Fury Beast 64GB (2x32GB) DDR5 6000MHz CL30', 'cmtjkyciz000670ymzgbqg9si', 'سعة 64 جيجابايت بسرعة 6000 CL30 أسرع للألعاب.')}
https://www.corsair.com/us/en/p/memory/cmh48gx5m2b5600c40/vengeance-rgb-48gb-2x24gb-ddr5-dram-5600mhz-c40-memory-kit-black-cmh48gx5m2b5600c40`,
  },
  {
    id: 'cmv14q9hb000x50ympfq9zk6z',
    description: `### Corsair Vengeance 32GB (2x16GB) DDR5 6400MHz CL32

طقم Vengeance منخفض الارتفاع بالرماديّ: 6400 بتوقيت CL32 وبملفّي XMP وEXPO معاً. يناسب تجميعة Intel حديثة، ويعمل على AMD أيضاً.

**التقنيات الأساسية المدعومة:**

[green]6400 MT/s بتوقيت CL32:[/green] زمن وصولٍ فعليّ قرابة 10 نانوثانية، مع عرض نطاقٍ أعلى من أطقم 6000.

[green]ملفّا XMP 3.0 وEXPO:[/green] يعمل على لوحات Intel وAMD بضغطة في البايوس.

[green]ارتفاع 35 مم:[/green] لا يتعارض مع المبرّدات الهوائيّة الكبيرة ذات البرجين.

[green]32 جيجابايت بشريحتين:[/green] السعة المناسبة للألعاب الحديثة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* معالجات AMD تعمل أفضل عند 6000. فرق 6400 عليها ضئيل وقد يحتاج ضبطاً ليعمل المتحكّم بنسبة 1:1.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB.
* لا يركب على لوحات DDR4.

${alt('Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz CL30', 'cmv18klcb0000jgymj6mis6yg', 'الطقم نفسه بسرعة 6000 CL30، الأنسب لمعالجات AMD.')}
https://www.corsair.com/us/en/p/memory/cmk32gx5m2b6400z32/vengeance-32gb-2x16gb-ddr5-dram-6400mts-cl32-amd-expo-intel-xmp-memory-kit-cmk32gx5m2b6400z32`,
  },
  {
    id: 'cmv18klcb0000jgymj6mis6yg',
    description: `### Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz CL30

الطقم الأشهر لمعالجات Ryzen: 6000 بتوقيت CL30 بملفّي EXPO وXMP، ومشتّتٌ منخفض بلا إضاءة. خيارٌ آمن لأيّ تجميعة ألعابٍ حديثة.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت 30-36-36-76:[/green] النقطة المثلى لمعالجات Ryzen 7000 و9000، حيث يعمل المتحكّم بنسبة 1:1 ويعطي أقلّ زمن وصول.

[green]ملفّا EXPO وXMP 3.0:[/green] يعمل على المنصّتين بضغطة في البايوس.

[green]ارتفاع 35 مم:[/green] لا يتعارض مع المبرّدات الهوائيّة الكبيرة ذات البرجين.

[green]32 جيجابايت بشريحتين:[/green] السعة المناسبة للألعاب مع البثّ والمتصفّح في الخلفيّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* جهد 1.40 فولت، أعلى قليلاً من الأطقم الأبطأ، فحرارته أعلى قليلاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB.
* لا يركب على لوحات DDR4.

${alt('G.Skill Flare X5 DDR5 32GB 6000MHz', 'cmpiecrkg005h00ymkt3mt6pp', 'طقم 6000 بتوقيتٍ أضيق قليلاً لمعالجات AMD.')}
https://www.corsair.com/us/en/p/memory/cmk32gx5m2b6000z30/vengeance-32gb-2x16gb-ddr5-dram-6000mt-s-cl30-amd-expo-memory-black-cmk32gx5m2b6000z30`,
  },
  {
    id: 'cmv14qast001c50ym3ugqrhgl',
    description: `### Kingston Fury Renegade 32GB (2x16GB) DDR5 7200MHz CL38

طقمٌ عالي السرعة لمنصّات Intel: 7200 بتوقيت CL38 ومشتّت فضّيّ وأسود بلا إضاءة. يناسب تجميعة Intel قويّة على لوحة Z790 أو Z890 لمن يريد أعلى عرض نطاقٍ للذاكرة.

**التقنيات الأساسية المدعومة:**

[green]7200 MT/s:[/green] عرض نطاقٍ أعلى بنحو 20% من أطقم 6000، يفيد برامج الضغط والتصيير وبعض الألعاب على Intel.

[green]ملفّ XMP 3.0 معتمد من Intel:[/green] مختبَر على لوحات Intel الحديثة.

[green]ارتفاع 39 مم بلا إضاءة:[/green] مناسبٌ للمبرّدات الهوائيّة الكبيرة.

[green]32 جيجابايت بشريحتين أحاديّة الرتبة:[/green] الشرائح أحاديّة الرتبة أسهل في الوصول إلى السرعات العالية.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سرعة 7200 تحتاج لوحةً جيّدة (يُفضّل بمنفذين للرام) ومعالجاً يتحمّلها، وبعض الأنظمة لا تثبت عليها.
* الفائدة في الألعاب صغيرة مقارنةً بأطقم 6000 CL30.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب معالجات AMD عند سرعته الكاملة.
* لا إضاءة، ولا يركب على لوحات DDR4.

${alt('Kingston Fury Beast DDR5 32GB 6000MHz', 'cmpiebdbz001f00ymszifpqs9', 'طقم 6000 يعمل على المنصّتين بلا ضبط.')}
https://www.kingston.com/en/memory/gaming/fury-renegade-ddr5`,
  },
];

// ---------------------------------------------------------------- التنفيذ
const backup = [];
let bad = 0;
for (const r of REWRITE) {
  const c = await prisma.component.findUnique({ where: { id: r.id }, select: { id: true, name: true, description: true, specs: true } });
  if (!c) { console.log(`✗ ${r.id} غير موجود`); bad++; continue; }
  const d = r.description;
  const errs = [];
  if (/\*\*\[(yellow|red)/.test(d)) errs.push('نجوم حول وسم اللون');
  if (!/^https?:\/\/\S+$/.test(d.trim().split('\n').pop())) errs.push('السطر الأخير ليس رابطاً');
  if (!d.startsWith('### ')) errs.push('لا عنوان');
  for (const m of d.matchAll(/\]\(\/components\/([a-z0-9]+)\)/g)) {
    if (!(await prisma.component.findUnique({ where: { id: m[1] }, select: { id: true } }))) errs.push(`بديلٌ مفقود ${m[1]}`);
  }
  if (d.length <= (c.description || '').length) errs.push(`ليس أطول (${d.length} ≤ ${c.description.length})`);
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
