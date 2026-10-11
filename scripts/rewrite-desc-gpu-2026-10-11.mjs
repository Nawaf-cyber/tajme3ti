/**
 * 2026-10-11 — المرحلة ١ («ثقة البيانات — تغطية الكروت»)، الجزء الثالث: الأوصاف القصيرة للكروت (١٣ تحت ٩٠٠ حرف).
 *
 * المصادر: قاعدة TechPowerUp للشرائح (تُقرأ بالمتصفّح — أنوية/تردّد/ذاكرة/عرض نطاق/TDP/المزوّد المقترح)،
 * وصفحة NVIDIA لـ RTX 5050، وصفحتا Intel لـ A750 وA750E. الإطارات من جدول الموقع نفسه (lib/gpu-perf.ts = Tom's Hardware).
 * ورابط الشركة الأخير صفحة الشريحة الرسميّة (لا لوحة شركةٍ بعينها كما كان في 3060/3070/4070).
 *
 * تصحيحات بيانات مع الأوصاف:
 *   - RX 6600 XT: tdpWattage 132 → 160 (TBP الرسميّ؛ يدخل في تقدير المزوّد)، وعنوان الوصف كان «RX 6600» (شريحةٌ أخرى).
 *   - «Arc A750E» → «Arc A750 8GB»: صفحة Intel تصنّف A750E **مدمجة (Embedded) بذاكرة 16GB**، وصفّنا 8GB وروابطه كلّها
 *     ASRock A750 Challenger D (المكتبيّة). فالصفّ هو A750 واسمه خطأ. ويُستبدل رابط أمازون النافد بـ B0BJSYQ822
 *     (ASRock A750 Challenger D 8GB OC، 1501.57، «Graphics co-processor Intel Arc A750»).
 *
 *   node scripts/rewrite-desc-gpu-2026-10-11.mjs           # عرض
 *   node scripts/rewrite-desc-gpu-2026-10-11.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const ALT = {
  R5070: ['NVIDIA GeForce RTX 5070 12GB', 'cmq122okp000mjwymt3193qwb'],
  R5060: ['NVIDIA GeForce RTX 5060', 'cmq5060xx000000ym00000001'],
  R5060TI16: ['NVIDIA GeForce RTX 5060 Ti 16GB', 'cmq5060tixx00000ym00000002'],
  X9060XT8: ['AMD Radeon RX 9060 XT 8GB', 'cmsqbc2ux0002ucym3ao7916c'],
  X9060XT16: ['AMD Radeon RX 9060 XT 16GB', 'cmr3g8py9000bncymdsx8dbv8'],
  X9070: ['AMD Radeon RX 9070 OC', 'cmpfzir17000cx4ymvygar6x2'],
  B580: ['Intel Arc B580', 'cmpiebcif001c00ymfowp9clr'],
};
const alt = (k, ...why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;
const VARIANT = '* هذا صفّ الشريحة: كلّ متجرٍ يبيع نسخة شركةٍ مختلفة، فالطول وموصّلات الطاقة والسعر تختلف — راجع اسم النسخة بجانب كلّ متجر.';

const R = [
  {
    id: 'cmpiecnam005000ymvzl1xqhg', was: 'GeForce RTX 3080 Ti',
    d: `### NVIDIA GeForce RTX 3080 Ti

كرت NVIDIA الأقوى في جيل RTX 30 بعد 3090: 10,240 نواة CUDA و12 جيجابايت GDDR6X على ناقلٍ عريض 384-bit. أداؤه في 1440p ما زال في مستوى كروت اليوم المتوسّطة العليا، لكنّ استهلاكه 350 واط.

**التقنيات الأساسية المدعومة:**

[green]10,240 نواة CUDA و80 نواة تتبّع أشعّة:[/green] متوسّط 89 إطاراً في 1440p و51 في 4K بحسب Tom's Hardware — قرب RTX 5070.

[green]12 جيجابايت GDDR6X على ناقل 384-bit:[/green] عرض نطاق 912 جيجابايت/ث، أعلى بكثير من كروت الفئة نفسها اليوم.

[green]DLSS 2 وReflex وتتبّع الأشعّة:[/green] رفع الدقّة بالذكاء الاصطناعيّ يعمل في مئات الألعاب.

[green]PCIe 4.0 x16:[/green] بعرضٍ كامل، فلا يُخنق على اللوحات القديمة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **استهلاك 350 واط** ومزوّد مقترح 750 واط — ضعف ما يحتاجه كرتٌ حديث بأداءٍ مماثل.
* لا يدعم توليد الإطارات (DLSS 3/4) الخاصّ بالأجيال 40 و50.
${VARIANT}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* جيلٌ متوقّف: المعروض غالباً من بائعين طرفٍ ثالث بلا ضمانٍ محلّيّ واضح.

${alt('R5070', 'أداء قريب في 1440p بجيلٍ أحدث، وDLSS 4 بتوليد الإطارات، واستهلاك 250 واط فقط.')}
https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3080-3080ti/`,
  },
  {
    id: 'cmr3g8sso000pncyms008om95', was: 'Radeon RX 6750 XT 12GB',
    d: `### AMD Radeon RX 6750 XT 12GB

نسخة AMD المرفوعة من RX 6700 XT في جيل RDNA 2: 40 وحدة حوسبة و12 جيجابايت GDDR6 وذاكرة Infinity Cache بسعة 96 ميجابايت. كرت 1440p من الجيل السابق ما زال منافساً في الأداء الخام.

**التقنيات الأساسية المدعومة:**

[green]متوسّط 58 إطاراً في 1440p و83 في 1080p:[/green] بحسب Tom's Hardware — قرب RTX 5060 وRTX 3070.

[green]12 جيجابايت GDDR6 على ناقل 192-bit:[/green] بعرض نطاق 432 جيجابايت/ث، ومعها Infinity Cache بسعة 96 ميجابايت تخفّف الضغط على الذاكرة.

[green]تردّد Boost حتى 2600 ميجاهرتز:[/green] أعلى من 6700 XT (2581).

[green]FSR وAMD Software:[/green] رفع الدقّة يعمل على أيّ لعبة تدعمه، مع أدوات ضبط الأداء.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **استهلاك 250 واط** ومزوّد مقترح 600 واط — أعلى من كروت اليوم بأداءٍ مماثل.
* تتبّع الأشعّة أضعف بوضوح من كروت NVIDIA وRDNA 4.
${VARIANT}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدعم FSR 4 بالذكاء الاصطناعيّ (حصريّ لـ RX 9000).

${alt('X9060XT16', 'أداء أعلى قليلاً بجيل RDNA 4 مع FSR 4، و16 جيجابايت، واستهلاك أقلّ بكثير.')}
https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6750-xt.html`,
  },
  {
    id: 'cmr3g8rki000jncymzr76rddt', was: 'Radeon RX 7900 GRE 16GB',
    d: `### AMD Radeon RX 7900 GRE 16GB

النسخة المخفّفة من عائلة RX 7900 في جيل RDNA 3: 80 وحدة حوسبة و16 جيجابايت GDDR6 على ناقل 256-bit. صُمّمت لدقّة 1440p العالية، وأداؤها الخام قريب من كروت الفئة العليا السابقة.

**التقنيات الأساسية المدعومة:**

[green]80 وحدة حوسبة (5,120 معالج تظليل):[/green] تردّد Boost حتى 2245 ميجاهرتز بحسب TechPowerUp.

[green]16 جيجابايت GDDR6 على ناقل 256-bit:[/green] عرض نطاق 576 جيجابايت/ث، مع Infinity Cache بسعة 64 ميجابايت — سعةٌ تكفي ألعاب 1440p الثقيلة سنوات.

[green]DisplayPort 2.1:[/green] منفذان منها لشاشات التردّد العالي، ومنفذ USB-C في النسخة المرجعيّة.

[green]FSR 3 وتوليد الإطارات من AMD:[/green] يعمل في الألعاب الداعمة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* استهلاك 260 واط ومزوّد مقترح 600 واط.
* تتبّع الأشعّة أضعف من كروت NVIDIA في الفئة نفسها.
${VARIANT}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدعم FSR 4 بالذكاء الاصطناعيّ (حصريّ لـ RX 9000)، وأسعاره الحاليّة من بائعين طرفٍ ثالث.

${alt('X9070', 'الجيل الأحدث من AMD بأداء أعلى وFSR 4 واستهلاك أقلّ، وغالباً بسعرٍ أقلّ اليوم.')}
https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7900-gre.html`,
  },
  {
    id: 'cmr3g8r06000gncymylaniwgi', was: 'Radeon RX 6700 XT 12GB',
    d: `### AMD Radeon RX 6700 XT 12GB

كرت 1440p من جيل RDNA 2 بذاكرةٍ سخيّة لفئته: 40 وحدة حوسبة و12 جيجابايت GDDR6 وInfinity Cache بسعة 96 ميجابايت. اشتهر بقيمته مقابل السعر، وما زال قادراً على ألعاب اليوم بإعداداتٍ عالية.

**التقنيات الأساسية المدعومة:**

[green]متوسّط 54 إطاراً في 1440p و79 في 1080p:[/green] بحسب Tom's Hardware.

[green]12 جيجابايت GDDR6 على ناقل 192-bit:[/green] عرض نطاق 384 جيجابايت/ث، والسعة أريح من كروت 8 جيجابايت في الألعاب الحديثة.

[green]تردّد Boost حتى 2581 ميجاهرتز وPCIe 4.0 x16:[/green] بعرضٍ كامل على أيّ لوحة.

[green]FSR وAMD Software:[/green] رفع الدقّة وأدوات ضبط الأداء والتسجيل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* استهلاك 230 واط ومزوّد مقترح 550 واط — أعلى من كروت اليوم بأداءٍ مماثل.
* تتبّع الأشعّة ضعيف مقارنةً بـ NVIDIA وRDNA 4.
${VARIANT}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدعم FSR 4 بالذكاء الاصطناعيّ.

${alt('X9060XT16', 'أداء أعلى بجيل RDNA 4 مع FSR 4 و16 جيجابايت واستهلاك أقلّ.')}
https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6700-xt.html`,
  },
  {
    id: 'cmr3g8qsn000fncym56qdxg80', was: 'Radeon RX 6600 XT 8GB', tdp: 160,
    d: `### AMD Radeon RX 6600 XT 8GB

كرت 1080p من جيل RDNA 2: 32 وحدة حوسبة و8 جيجابايت GDDR6 وInfinity Cache بسعة 32 ميجابايت. صُمّم للّعب بإعداداتٍ عالية في 1080p، ويناسب ميزانيّةً محدودة ومزوّد طاقةٍ متوسّط.

**التقنيات الأساسية المدعومة:**

[green]متوسّط 63 إطاراً في 1080p و41 في 1440p:[/green] بحسب Tom's Hardware.

[green]تردّد Boost حتى 2589 ميجاهرتز:[/green] بحسب TechPowerUp.

[green]استهلاك 160 واط وموصّل 8-pin واحد:[/green] مزوّد 450 واط يكفيه.

[green]FSR وAMD Software:[/green] رفع الدقّة يرفع الإطارات في الألعاب الثقيلة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **8 جيجابايت على ناقل 128-bit وPCIe 4.0 x8** — على لوحةٍ من الجيل الثالث (PCIe 3.0) يخسر جزءاً من أدائه.
* تتبّع الأشعّة ضعيف جدّاً.
${VARIANT}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب 1440p بإعداداتٍ عالية في الألعاب الحديثة.

${alt('X9060XT8', 'أداء أعلى بنحو النصف في 1080p بجيل RDNA 4 مع FSR 4، وبسعرٍ قريب.')}
https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6600-xt.html`,
  },
  {
    id: 'cmr3g8reu000incymgaata2yd', was: 'GeForce RTX 3070 8GB',
    d: `### NVIDIA GeForce RTX 3070 8GB

كرت NVIDIA الشهير من جيل RTX 30: 5,888 نواة CUDA و8 جيجابايت GDDR6 على ناقل 256-bit. كان كرت 1440p الأوّل في وقته، وما زال يقدّم أداءً قريباً من RTX 5060.

**التقنيات الأساسية المدعومة:**

[green]متوسّط 58 إطاراً في 1440p و87 في 1080p:[/green] بحسب Tom's Hardware.

[green]5,888 نواة CUDA و46 نواة تتبّع أشعّة:[/green] تردّد Boost حتى 1725 ميجاهرتز.

[green]ناقل 256-bit بعرض نطاق 448 جيجابايت/ث:[/green] أوسع من كروت الفئة المتوسّطة الحديثة (128-bit).

[green]DLSS 2 وReflex:[/green] رفع الدقّة بالذكاء الاصطناعيّ في مئات الألعاب.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **8 جيجابايت** بدأت تضيق في ألعاب 1440p الحديثة بإعدادات النسيج العالية.
* استهلاك 220 واط، ولا يدعم توليد الإطارات (DLSS 3/4).
${VARIANT}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* جيلٌ متوقّف: المعروض غالباً من بائعين طرفٍ ثالث.

${alt('R5060', 'أداء مماثل بجيلٍ جديد مع DLSS 4 وتوليد الإطارات، واستهلاك أقلّ، وضمانٍ من المتاجر المحلّيّة.')}
https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3070-3070ti/`,
  },
  {
    id: 'cmr3g8r87000hncymfq5q7ue5', was: 'GeForce RTX 4070 12GB',
    d: `### NVIDIA GeForce RTX 4070 12GB

كرت 1440p من جيل Ada Lovelace: 5,888 نواة CUDA و12 جيجابايت GDDR6X، باستهلاك 200 واط فقط. أعطى أداء RTX 3080 تقريباً بنصف استهلاكه، مع توليد الإطارات DLSS 3.

**التقنيات الأساسية المدعومة:**

[green]متوسّط 78 إطاراً في 1440p و112 في 1080p:[/green] بحسب Tom's Hardware.

[green]DLSS 3 وتوليد الإطارات:[/green] يرفع الإطارات بوضوح في الألعاب الداعمة.

[green]استهلاك 200 واط:[/green] مزوّد 550 واط يكفيه بحسب TechPowerUp، وحرارته منخفضة.

[green]12 جيجابايت GDDR6X وذاكرة L2 بسعة 36 ميجابايت:[/green] عرض نطاق 504 جيجابايت/ث.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 12 جيجابايت مريحة في 1440p، وقد تضيق في 4K بحزم النسيج العالية.
* لا يدعم توليد الإطارات المتعدّد (DLSS 4 MFG) الخاصّ بسلسلة 50.
${VARIANT}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* RTX 5070 أسرع منه ويُباع اليوم بسعرٍ أقرب.

${alt('R5070', 'أداء أعلى بنحو الربع في 1440p مع DLSS 4، وبسعرٍ قريب في المتاجر المحلّيّة.')}
https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4070-family/`,
  },
  {
    id: 'cmr3g8rqz000kncym1f63bk88', was: 'GeForce RTX 4060 Ti 16GB',
    d: `### NVIDIA GeForce RTX 4060 Ti 16GB

نسخة الذاكرة المضاعفة من RTX 4060 Ti (جيل Ada Lovelace): 4,352 نواة CUDA و16 جيجابايت GDDR6 على ناقل 128-bit. أداؤها الخام هو أداء نسخة 8 جيجابايت تقريباً؛ الفرق في السعة لا السرعة.

**التقنيات الأساسية المدعومة:**

[green]16 جيجابايت GDDR6:[/green] تمنع الاختناق في الألعاب التي تستهلك ذاكرةً عالية وفي برامج الذكاء الاصطناعيّ المحلّيّة.

[green]متوسّط 61 إطاراً في 1440p و89 في 1080p:[/green] بحسب Tom's Hardware — قرب RTX 5060.

[green]DLSS 3 وتوليد الإطارات:[/green] مع ذاكرة L2 بسعة 32 ميجابايت.

[green]استهلاك 165 واط:[/green] مزوّد 450 واط يكفيه.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **ناقل 128-bit وPCIe 4.0 x8** — عرض النطاق 288 جيجابايت/ث فقط، ويخسر على لوحات PCIe 3.0.
* المعروض الآن من بائعٍ طرفٍ ثالث بسعرٍ مرتفع جدّاً لأدائه.
${VARIANT}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدعم توليد الإطارات المتعدّد (DLSS 4 MFG).

${alt('R5060TI16', 'الذاكرة نفسها (16 جيجابايت) بأداءٍ أعلى وجيلٍ أحدث، وبسعرٍ أقلّ بكثير اليوم.')}
https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4060-4060ti/`,
  },
  {
    id: 'cmr3g8t61000rncympdiu2bi7', was: 'Radeon RX 6650 XT 8GB',
    d: `### AMD Radeon RX 6650 XT 8GB

النسخة المرفوعة من RX 6600 XT في جيل RDNA 2: 32 وحدة حوسبة وذاكرةٌ أسرع (عرض نطاق 280 جيجابايت/ث). كرت 1080p اقتصاديّ للألعاب التنافسية بإعداداتٍ عالية.

**التقنيات الأساسية المدعومة:**

[green]متوسّط 64 إطاراً في 1080p و38 في 1440p:[/green] بحسب Tom's Hardware.

[green]تردّد Boost حتى 2635 ميجاهرتز:[/green] أعلى من 6600 XT، مع Infinity Cache بسعة 32 ميجابايت.

[green]موصّل 8-pin واحد:[/green] ومزوّد 450 واط يكفيه بحسب TechPowerUp.

[green]FSR وAMD Software:[/green] رفع الدقّة يرفع الإطارات في الألعاب الثقيلة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **8 جيجابايت على ناقل 128-bit وPCIe 4.0 x8** — يخسر جزءاً من أدائه على لوحات PCIe 3.0.
* تتبّع الأشعّة ضعيف، واستهلاك نحو 180 واط.
${VARIANT}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب 1440p بإعداداتٍ عالية.

${alt('X9060XT8', 'أداء أعلى بنحو النصف في 1080p بجيل RDNA 4 مع FSR 4.')}
https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6650-xt.html`,
  },
  {
    id: 'cmr3g8qly000encym7apcklu3', was: 'Radeon RX 7600 8GB',
    d: `### AMD Radeon RX 7600 8GB

كرت 1080p من جيل RDNA 3: 32 وحدة حوسبة و8 جيجابايت GDDR6، ومخارج DisplayPort 2.1. خيار اقتصاديّ للألعاب في 1080p بإعداداتٍ عالية، وغالباً من أرخص الكروت الجديدة.

**التقنيات الأساسية المدعومة:**

[green]متوسّط 70 إطاراً في 1080p و45 في 1440p:[/green] بحسب Tom's Hardware — قرب RTX 5050.

[green]تردّد Boost حتى 2655 ميجاهرتز:[/green] مع Infinity Cache بسعة 32 ميجابايت.

[green]DisplayPort 2.1 وترميز AV1:[/green] لشاشات التردّد العالي وللبثّ والتسجيل بجودةٍ أعلى.

[green]استهلاك 165 واط وموصّل 8-pin واحد:[/green] مزوّد 450 واط يكفيه.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **8 جيجابايت على ناقل 128-bit وPCIe 4.0 x8** — تضيق في الألعاب الحديثة الثقيلة.
* تتبّع الأشعّة متوسّط.
${VARIANT}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدعم FSR 4 بالذكاء الاصطناعيّ، ولا يناسب 1440p العالية.

${alt('X9060XT8', 'أداء أعلى بنحو الثلث في 1080p بجيل RDNA 4 مع FSR 4.')}
https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7600.html`,
  },
  {
    id: 'cmr3g8qdh000dncymif9nzfpy', was: 'GeForce RTX 3060 12GB',
    d: `### NVIDIA GeForce RTX 3060 12GB

من أكثر كروت NVIDIA انتشاراً (جيل RTX 30): 3,584 نواة CUDA و12 جيجابايت GDDR6 — سعةٌ نادرة في فئته. كرت 1080p مريح، وذاكرته الكبيرة تنفع برامج الذكاء الاصطناعيّ والمونتاج.

**التقنيات الأساسية المدعومة:**

[green]12 جيجابايت GDDR6 على ناقل 192-bit:[/green] عرض نطاق 360 جيجابايت/ث، وسعةٌ أكبر من كروت 8 جيجابايت الأحدث.

[green]متوسّط 62 إطاراً في 1080p و42 في 1440p:[/green] بحسب Tom's Hardware.

[green]DLSS 2 وReflex وتتبّع الأشعّة:[/green] 28 نواة تتبّع أشعّة، وتردّد Boost حتى 1777 ميجاهرتز.

[green]استهلاك 170 واط:[/green] مزوّد 450 واط يكفيه، وPCIe 4.0 x16 بعرضٍ كامل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* أداؤه الخام أقلّ من RTX 5050 الأحدث في 1080p.
* لا يدعم توليد الإطارات (DLSS 3/4).
${VARIANT}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب 1440p بإعداداتٍ عالية في الألعاب الحديثة.

${alt('R5060', 'أداء أعلى بنحو النصف في 1080p مع DLSS 4، إن لم تحتج الـ12 جيجابايت.')}
https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3060-3060ti/`,
  },
  {
    id: 'cmr3g8pru000ancym86ilohco', was: 'GeForce RTX 5050 8GB',
    d: `### NVIDIA GeForce RTX 5050 8GB

كرت الدخول لسلسلة RTX 50 (جيل Blackwell): 2,560 نواة CUDA و8 جيجابايت GDDR6، باستهلاك 130 واط فقط. يناسب تجميعة 1080p اقتصاديّة لمن يريد DLSS 4 وتوليد الإطارات المتعدّد بأقلّ سعر.

**التقنيات الأساسية المدعومة:**

[green]DLSS 4 مع توليد الإطارات المتعدّد:[/green] بحسب صفحة NVIDIA — يرفع الإطارات أضعافاً في الألعاب الداعمة.

[green]متوسّط 69 إطاراً في 1080p و45 في 1440p:[/green] بحسب Tom's Hardware، دون توليد الإطارات.

[green]استهلاك 130 واط:[/green] أقلّ كروت السلسلة، وNVIDIA تذكر مزوّد 550 واط للنظام كاملاً.

[green]تردّد Boost حتى 2.57 جيجاهرتز ومشفّر NVENC من الجيل التاسع:[/green] للبثّ والتسجيل بجودةٍ عالية.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **8 جيجابايت GDDR6 على ناقل 128-bit وPCIe 5.0 x8** — ذاكرةٌ أبطأ من GDDR7 في بقيّة السلسلة.
* أداؤه الخام بلا توليد الإطارات قريب من RX 7600.
${VARIANT}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب 1440p بإعداداتٍ عالية، ولا 4K.

${alt('R5060', 'أداء أعلى بنحو الربع في 1080p وذاكرة GDDR7 أسرع.')}
https://www.nvidia.com/en-me/geforce/graphics-cards/50-series/rtx-5050/`,
  },
  {
    id: 'cmpiecmr2004y00ym97v6ggf3', was: 'Arc A750E', rename: 'Arc A750 8GB',
    offer: { store: 'amazon', url: 'https://www.amazon.sa/dp/B0BJSYQ822' },
    d: `### Intel Arc A750 8GB

كرت Intel المكتبيّ من جيل Alchemist: 28 نواة Xe و8 جيجابايت GDDR6 على ناقل 256-bit عريض. يستهدف ألعاب 1080p بسعرٍ منخفض.

**التقنيات الأساسية المدعومة:**

[green]28 نواة Xe و28 وحدة تتبّع أشعّة:[/green] بتردّد رسوميّات 2050 ميجاهرتز بحسب صفحة Intel.

[green]ناقل 256-bit بعرض نطاق 512 جيجابايت/ث:[/green] أوسع من كروت الفئة نفسها (128-bit).

[green]XeSS وترميز AV1:[/green] رفع الدقّة من Intel، وترميز AV1 للبثّ والتسجيل بجودةٍ أعلى.

[green]PCIe 4.0 x16:[/green] بعرضٍ كامل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **يحتاج تفعيل Resizable BAR** في BIOS — بدونه ينخفض الأداء بوضوح، فلا يناسب اللوحات القديمة جدّاً.
* استهلاك 225 واط ومزوّد مقترح 550 واط — مرتفع لأدائه.
* أداؤه متفاوت في الألعاب القديمة (DirectX 9/11).
${VARIANT}

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يدعم توليد الإطارات.

${alt('B580', 'جيل Intel التالي (Battlemage) بأداءٍ أعلى و12 جيجابايت واستهلاكٍ أقلّ.')}
https://www.intel.com/content/www/us/en/products/sku/227954/intel-arc-a750-graphics/specifications.html`,
  },
];

// ---------------------------------------------------------------- الفحص
const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
let bad = false;
const stop = (m) => { console.log('⛔ ' + m); bad = true; };
for (const r of R) {
  const c = await prisma.component.findUnique({ where: { id: r.id }, select: { name: true, description: true, offers: { select: { id: true, inStock: true, store: { select: { slug: true } } } } } });
  if (!c || c.name !== r.was) { stop(`${r.id} ليس «${r.was}»`); continue; }
  if (/\*\*\[(yellow|red)\]/.test(r.d)) stop(`${r.was}: نجوم حول وسم`);
  if (!/^https:\/\/\S+$/.test(r.d.trim().split('\n').pop())) stop(`${r.was}: آخر سطر ليس رابطاً`);
  if (!r.d.includes('بإمكانك التوجه')) stop(`${r.was}: بلا بديل`);
  if (r.d.length <= c.description.length) stop(`${r.was}: الجديد ليس أطول`);
  if (r.offer) {
    const asin = r.offer.url.match(/\/dp\/([A-Z0-9]{10})/)[1];
    const t = await prisma.componentOffer.findFirst({ where: { url: { contains: `/dp/${asin}` } } });
    if (t) stop(`${asin} مستعمل`);
    const mine = c.offers.filter((o) => o.store.slug === r.offer.store);
    if (mine.length !== 1 || mine[0].inStock) stop(`${r.was}: عرض ${r.offer.store} القائم ليس واحداً نافداً`);
    r.offerId = mine[0]?.id;
  }
  console.log(`✎ ${r.was}${r.rename ? ` → ${r.rename}` : ''}  ${c.description.length} → ${r.d.length}${r.tdp ? `  · tdp→${r.tdp}` : ''}${r.offer ? '  · أمازون↻' : ''}`);
}
for (const [k, [n, id]] of Object.entries(ALT)) {
  const c = await prisma.component.findUnique({ where: { id }, select: { brand: true, name: true } });
  if (!c || `${c.brand} ${c.name}` !== n) stop(`البديل ${k}: «${c ? c.brand + ' ' + c.name : '—'}»`);
}
if (bad || !apply) { console.log(bad ? '⛔ متوقّف' : `\n${R.length} وصفاً — (عرضٌ فقط — أضف --apply)`); await prisma.$disconnect(); process.exit(bad ? 1 : 0); }

const before = await prisma.component.findMany({ where: { id: { in: R.map((r) => r.id) } }, select: { id: true, name: true, description: true, tdpWattage: true, offers: true } });
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/rewrite-desc-gpu-${stamp}.json`, JSON.stringify(before, null, 2));
for (const r of R) {
  await prisma.component.update({ where: { id: r.id }, data: { description: r.d, ...(r.rename ? { name: r.rename } : {}), ...(r.tdp ? { tdpWattage: r.tdp } : {}) } });
  if (r.offer) await prisma.componentOffer.update({ where: { id: r.offerId }, data: { url: r.offer.url, inStock: true } });
}
console.log(`✔ ${R.length} وصفاً — نسخة: backups/rewrite-desc-gpu-${stamp}.json`);
await prisma.$disconnect();
