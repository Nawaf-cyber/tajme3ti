/**
 * ============ أوصاف المبرّدات الضعيفة (المرحلة ٢) — 2026-10-10 ============
 *
 * طلب نوّاف: «عدل الاوصاف السابقة القليلة». 27 مبرّداً أغلبها جيّد ببنودٍ خضراء عارية
 * («يدعم LGA1851…» بلا معنى) — تُشرح بـ edits. ومعها تصحيحات بيانات وجدها التحقّق:
 *   - Assassin X 120 Refined SE White: ارتفاعه 148 مم لا 165 (تقرؤه أداة التوافق) — وصفٌ جديد.
 *   - MAG CoreFrozr AA13 White: 152 مم لا 150 (صفحة MSI)، وأنابيب بتلامسٍ مباشر.
 *   - TH360-S V3 White: له شاشة LCD مقطعيّة تعرض الحرارة، والوصف القديم نفاها.
 *
 *   node scripts/rewrite-desc-cooler3-2026-10-10.mjs           # عرض
 *   node scripts/rewrite-desc-cooler3-2026-10-10.mjs --apply   # تنفيذ (نسخة احتياطية أوّلاً)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const TAG = 'cooler3';

const alt = (name, id, ...why) => `---\nبإمكانك التوجه إلى [${name}](/components/${id}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

/* البند العاري الأكثر تكراراً: قائمة المقابس بلا معنى — يُشرح بما يعنيه للمشتري */
const S4 = ['[green]يدعم LGA1851 وLGA1700 وAM5 وAM4.[/green]', '[green]يدعم LGA1851 وLGA1700 وAM5 وAM4:[/green] كلّ المنصّات الحديثة من Intel وAMD، فيبقى معك إن غيّرت المعالج أو المنصّة.'];
const SALL = ['[green]يدعم كلّ المقابس الحاليّة.[/green]', '[green]يدعم كلّ المقابس الحاليّة:[/green] من AM5 وLGA1851 إلى المنصّات الأقدم، فينتقل معك إلى أيّ تجميعةٍ قادمة.'];
const R240 = ['* 240 مم لا تكفي معالجات Core i9 وRyzen 9 تحت الحمل الطويل.', '* 240 مم لا تكفي معالجات Core i9 وRyzen 9 تحت الحمل الطويل، فترتفع حرارتها وتخفض سرعتها.'];
const REWRITE = [
  {
    id: 'cmszn25sd0004w8ymbbfqdicn',
    edits: [
      ['[green]غطاء علويّ بتأثير المرآة اللانهائيّة:[/green] وأبيض بالكامل.', '[green]غطاء علويّ بتأثير المرآة اللانهائيّة:[/green] حلقات ضوءٍ تبدو بلا نهاية، والمبرّد أبيض بالكامل مع الأنابيب.'],
      S4,
      ['* لا شاشة على المضخّة.', '* لا شاشة على المضخّة.\n* مبرّدات السوائل فيها مضخّةٌ تتعطّل بمرور السنين، ومبرّد الهواء أطول عمراً بطبيعته.'],
    ],
  },
  {
    id: 'cmszn26jy000cw8ym0jada1sr',
    edits: [
      ['[green]رادييتر 360 مم:[/green] لمعالجات الفئة العليا.', '[green]رادييتر 360 مم:[/green] لمعالجات الفئة العليا مثل Core Ultra 9 وRyzen 9 تحت الحمل الطويل.'],
      S4,
      ['* لا شاشة، وهي في سلسلة Kraken Elite الأغلى.', '* لا شاشة، وهي في سلسلة Kraken Elite الأغلى.\n* يحتاج صندوقاً يقبل رادييتر 360 مم.'],
    ],
  },
  {
    id: 'cmv14qi0h003q50ym89dkk7rq',
    edits: [['[green]ضمان ستّ سنوات للمبرّد وثلاث للشاشة.[/green]', '[green]ضمان ستّ سنوات للمبرّد وثلاث للشاشة:[/green] أطول من ضمان أغلب المبرّدات الهوائيّة (سنتان أو ثلاث).']],
  },
  {
    id: 'cmv14qi9z003t50ymr3htd2vi',
    edits: [['[green]ضمان ستّ سنوات للمبرّد وثلاث للشاشة.[/green]', '[green]ضمان ستّ سنوات للمبرّد وثلاث للشاشة:[/green] أطول من ضمان أغلب المبرّدات الهوائيّة (سنتان أو ثلاث).']],
  },
  /* له شاشة LCD مقطعيّة تعرض حرارة المعالج — الوصف القديم نفاها خطأً */
  {
    id: 'cmtjkyxkb001c70ym55keqdfv',
    force: true,
    edits: [
      ['[green]لونٌ أبيض كامل:[/green] الأنابيب والمشعاع والمراوح.', '[green]لونٌ أبيض كامل:[/green] الأنابيب والمشعاع والمراوح.\n\n[green]شاشة LCD مقطعيّة على المضخّة:[/green] تعرض حرارة المعالج بالأرقام، وغطاؤها يدور ليناسب اتّجاه التركيب.\n\n[green]إطار مراوح واحد يجمع الثلاث:[/green] كابلٌ واحد وتركيبٌ أسرع، والمراوح حتى 2500 دورة.'],
      ['* لا شاشة عرضٍ على المضخّة كالفئة الأعلى.', '* شاشته أرقامٌ فقط، لا صور ولا فيديو كشاشات الفئة الأعلى.'],
    ],
    append: 'https://thermaltake.com/products/th360-s-v3-argb-sync-aio-liquid-cooler-snow-edition',
  },
  {
    id: 'cmszmclr60008zsym20d7ig0m',
    edits: [S4, ['* لا شاشة.', '* لا شاشة.\n* إضاءته ARGB تحتاج رأس 5V في اللوحة.']],
  },
  {
    id: 'cmtcr2c0i0000o8ym7e5jnmft',
    edits: [
      ['[green]قاعدة نحاس C1100 مطليّة بالنيكل.[/green]', '[green]قاعدة نحاس C1100 مطليّة بالنيكل:[/green] النحاس ينقل الحرارة من المعالج أسرع من الألمنيوم، والنيكل يحميه من الأكسدة.'],
      S4,
      ['* معالجات Core i9 K تحت الحمل الطويل تحتاج تبريداً مائيّاً.', '* معالجات Core i9 K تحت الحمل الطويل تحتاج تبريداً مائيّاً.\n* عرضه كبير، فراجع خلوص الذاكرة الطويلة تحت المروحة الأماميّة.'],
    ],
  },
  {
    id: 'cmv14qjvi004c50ymxvkqg80r',
    edits: [
      ['[green]رادييتر 240 مم ومروحتان 120 مم ARGB:[/green] حتى 2200 دورة.', '[green]رادييتر 240 مم ومروحتان 120 مم ARGB:[/green] حتى 2200 دورة، يكفي معالجات Ryzen 7 وCore Ultra 7 في الألعاب.'],
      S4,
      R240,
      ['* لا شاشة.', '* لا شاشة.\n* مبرّدات السوائل فيها مضخّةٌ تتعطّل بمرور السنين، ومبرّد الهواء أطول عمراً بطبيعته.'],
    ],
  },
  {
    id: 'cmv14qk5w004f50ympye34d46',
    edits: [
      ['[green]رادييتر 240 مم ومروحتان 120 مم ARGB:[/green] حتى 2200 دورة.', '[green]رادييتر 240 مم ومروحتان 120 مم ARGB:[/green] حتى 2200 دورة، يكفي معالجات Ryzen 7 وCore Ultra 7 في الألعاب.'],
      ['[green]تركيبٌ منزلق وكابلٌ واحد:[/green] ترتيبٌ أسهل.', '[green]تركيبٌ منزلق وكابلٌ واحد:[/green] المراوح تنزلق في مكانها وتتّصل ببعضها، فالترتيب أسهل.'],
      ['[green]سعر منخفض لمبرّدٍ مائيّ.[/green]', '[green]سعر منخفض لمبرّدٍ مائيّ:[/green] بديلٌ أبيض لمبرّدٍ هوائيّ متوسّط بشكلٍ أنظف.'],
      R240,
    ],
  },
  {
    id: 'cmv14qjap004550ymfsj0v0dv',
    edits: [
      ['[green]مضخّة حتى 3000 دورة برأسٍ مضيء ARGB.[/green]', '[green]مضخّة حتى 3000 دورة برأسٍ مضيء ARGB:[/green] تدفّقٌ كافٍ لرادييتر 360، والإضاءة تُدار من اللوحة.'],
      ['[green]يدعم كلّ المقابس الحاليّة والقديمة.[/green]', '[green]يدعم كلّ المقابس الحاليّة والقديمة:[/green] من AM5 وLGA1851 حتى LGA1200 و115X، فينتقل معك إلى أيّ تجميعة.'],
      ['* لا شاشة في المضخّة.', '* لا شاشة في المضخّة.\n* يحتاج صندوقاً يقبل رادييتر 360 مم.'],
    ],
  },
  {
    id: 'cmv14qgrl003b50ym469u3ya4',
    edits: [
      ['[green]مروحة 120 مم حتى 2050 دورة.[/green]', '[green]مروحة 120 مم حتى 2050 دورة:[/green] هادئة في الاستخدام اليوميّ، وتسرع تحت الحمل.'],
      S4,
      ['* لا إضاءة في هذه النسخة.', '* لا إضاءة في هذه النسخة.\n* ارتفاعه 158 مم، فراجع سقف الصناديق الصغيرة.'],
    ],
  },
  /* ارتفاعه 148 مم لا 165 (صفحات المتاجر والبيان الصحفيّ لـ Thermalright) — والوصف القديم بُني على الرقم الخاطئ */
  {
    id: 'cmtjkyum4001670ym0xp21tr0',
    force: true,
    specs: { sizeMm: '148', color: 'White' },
    description: `### Thermalright Assassin X 120 Refined SE ARGB White

مبرّد هوائيّ أبيض مضيء ببرجٍ واحد ومروحة 120 مم، بأقلّ سعرٍ لمبرّدٍ أبيض عندنا. يناسب تجميعة بيضاء اقتصاديّة بمعالج 65 واط مثل Ryzen 5 7600 أو Core Ultra 5 225F.

**التقنيات الأساسية المدعومة:**

[green]سعرٌ منخفض جداً:[/green] أقلّ من كثيرٍ من المبرّدات السوداء العاديّة، وأفضل بوضوح من مبرّد المعالج المرفق.

[green]أربعة أنابيب حراريّة بقطر 6 مم وقاعدة نحاسيّة:[/green] بنيةٌ أعلى ممّا يوحي به السعر، تكفي حتى 125 واط في الألعاب.

[green]ارتفاع 148 مم:[/green] يدخل أغلب الصناديق، ومنها صناديق Micro-ATX التي تقف عند 155 أو 160 مم.

[green]عمقٌ نحيف 46 مم:[/green] لا يغطّي فتحات الذاكرة، فتركب أطقم الرام العالية بلا تعارض.

[green]إضاءة ARGB:[/green] تُدار من رأس 5V في اللوحة الأمّ.

[green]يدعم AM4 وAM5 وLGA1200 وLGA1700 وLGA1851:[/green] كلّ المنصّات الحديثة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* برجٌ واحد بمروحةٍ واحدة: يكفي معالجات 65 إلى 105 واط، ولا يُقارن بالبرج المزدوج تحت حملٍ ثقيل طويل.
* لا وحدة تحكّم إضاءةٍ مرفقة، فاللوحة تحتاج رأس ARGB.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس مبرّد الفئة العليا: لمعالج K مفتوح بـ125 واط أو أكثر اختر برجاً مزدوجاً أو مبرّد سوائل.

---
بإمكانك التوجه إلى [Thermalright Peerless Assassin 120 SE ARGB White](/components/cmtcr2cmg0003o8ymnvab7k4g) إذا كان توجهك يتركز على الآتي:
* برجٌ مزدوج بمروحتين من الشركة نفسها، بتبريدٍ من فئةٍ أعلى بكثير مقابل فرقٍ صغير.
https://www.thermalright.com/product/assassin-x-120-refined-se-white-argb/`,
  },
  {
    id: 'cmszn26en000aw8ymba5g8iyy',
    edits: [
      ['[green]مراوح حتى 2400 دورة بعمرٍ مقدّر 60 ألف ساعة.[/green]', '[green]مراوح حتى 2400 دورة بعمرٍ مقدّر 60 ألف ساعة:[/green] هادئة في الخمول، وسريعة حين يحتاج المعالج.'],
      ['[green]ضمان خمس سنوات، ويدعم LGA1851 وLGA1700 وAM5 وAM4.[/green]', '[green]ضمان خمس سنوات، ويدعم LGA1851 وLGA1700 وAM5 وAM4:[/green] كلّ المنصّات الحديثة، فيبقى معك إن غيّرت المعالج.'],
      R240,
    ],
  },
  {
    id: 'cmszmclxq000azsymfdlrfubz',
    edits: [S4, ['* لا شاشة.', '* لا شاشة.\n* إضاءته ARGB تحتاج رأس 5V في اللوحة.']],
  },
  {
    id: 'cmuzv45jr001npcymva731dbx',
    edits: [
      ['[green]مضخّة 3400 دورة بضوضاء 20 ديسيبل.[/green]', '[green]مضخّة 3400 دورة بضوضاء 20 ديسيبل:[/green] تدفّقٌ عالٍ بلا طنينٍ مسموع.'],
      ['[green]أبيض بالكامل مع إضاءة ARGB.[/green]', '[green]أبيض بالكامل مع إضاءة ARGB:[/green] الأنابيب والرادييتر والمراوح، لتجميعة بيضاء بلا قطعٍ ناشزة.'],
      ['* المقابس المدعومة AM5 وAM4 وLGA1851 وLGA1700 فقط، فلا يناسب المنصّات القديمة.', '* المقابس المدعومة AM5 وAM4 وLGA1851 وLGA1700 فقط، فلا يناسب المنصّات القديمة.\n* يحتاج صندوقاً يقبل رادييتر 360 مم.'],
    ],
  },
  {
    id: 'cmuzv442e0016pcym6m417hxz',
    edits: [
      ['[green]أبيض بالكامل مع إضاءة Aura Sync.[/green]', '[green]أبيض بالكامل مع إضاءة Aura Sync:[/green] تتزامن مع لوحات ASUS وقطعها الأخرى من برنامجٍ واحد.'],
      ['[green]ضمان ستّ سنوات، ويدعم كلّ المقابس الحاليّة.[/green]', '[green]ضمان ستّ سنوات، ويدعم كلّ المقابس الحاليّة:[/green] أطول من ضمان أغلب المبرّدات المائيّة (خمس سنوات).'],
      ['* لا شاشة في الرأس، ونسخة LCD أغلى.', '* لا شاشة في الرأس، ونسخة LCD أغلى.\n* يحتاج صندوقاً يقبل رادييتر 360 مم.'],
    ],
  },
  {
    id: 'cmuzv46k8001zpcym7zkm1x7x',
    edits: [
      ['[green]مضخّة الجيل الخامس:[/green] 3400 دورة.', '[green]مضخّة الجيل الخامس:[/green] 3400 دورة، تدفّقٌ أعلى من سلسلة LE عند الحجم نفسه.'],
      SALL,
      R240,
    ],
  },
  {
    id: 'cmszn25gy0002w8ymc3yp8y3c',
    edits: [
      ['[green]غطاء علويّ بتأثير المرآة اللانهائيّة.[/green]', '[green]غطاء علويّ بتأثير المرآة اللانهائيّة:[/green] حلقات ضوءٍ تبدو بلا نهاية فوق المضخّة.'],
      S4,
      R240,
    ],
  },
  {
    id: 'cmuzsa29j001eu8ym5v3hytx8',
    edits: [
      ['[green]إضاءة ARGB:[/green] في الرأس والمراوح.', '[green]إضاءة ARGB:[/green] في الرأس والمراوح، تُدار من رأس 5V في اللوحة.'],
      R240,
      ['* لا شاشة في الرأس.', '* لا شاشة في الرأس.\n* مبرّدات السوائل فيها مضخّةٌ تتعطّل بمرور السنين، ومبرّد الهواء أطول عمراً بطبيعته.'],
    ],
  },
  {
    id: 'cmtcr2d8h0006o8ymekyhdaav',
    edits: [
      ['[green]قاعدة نحاس C1100.[/green]', '[green]قاعدة نحاس C1100:[/green] النحاس ينقل الحرارة من المعالج أسرع من الألمنيوم.'],
      S4,
    ],
  },
  {
    id: 'cmt05uijs0008ngym9ng8x50q',
    edits: [
      ['[green]غطاء علويّ بتأثير المرآة اللانهائيّة.[/green]', '[green]غطاء علويّ بتأثير المرآة اللانهائيّة:[/green] حلقات ضوءٍ تبدو بلا نهاية فوق المضخّة البيضاء.'],
      S4,
      R240,
    ],
  },
  {
    id: 'cmszmcldq0004zsymj2u94h5v',
    edits: [
      ['[green]مروحتان ARGB بمحمل هيدروليكيّ.[/green]', '[green]مروحتان ARGB بمحمل هيدروليكيّ:[/green] أهدأ وأطول عمراً من المحامل الانزلاقيّة.'],
      S4,
    ],
  },
  {
    id: 'cmuzv44y0001gpcymydu6vwyj',
    edits: [
      ['[green]مضخّة FlowDrive بمحرّكٍ ثلاثيّ الأطوار:[/green] وقاعدة نحاسيّة بمعجون XTM70.', '[green]مضخّة FlowDrive بمحرّكٍ ثلاثيّ الأطوار:[/green] أهدأ وأثبت من المضخّات العاديّة، وقاعدة نحاسيّة بمعجون XTM70 مطبّق مسبقاً.'],
      ['[green]كابلٌ واحد لكلّ شيء:[/green] والموزّع في العلبة.', '[green]كابلٌ واحد لكلّ شيء:[/green] المضخّة والمراوح والإضاءة بكابل iCUE LINK واحد، والموزّع في العلبة.'],
      ['[green]أبيض بالكامل:[/green] وضمان ستّ سنوات.', '[green]أبيض بالكامل:[/green] وضمان ستّ سنوات، أطول من أغلب المبرّدات المائيّة.'],
    ],
  },
  {
    id: 'cmuzv462f001tpcym8wznyc97',
    edits: [['[green]إضاءة ARGB:[/green] في الرأس والمراوح.', '[green]إضاءة ARGB:[/green] في الرأس والمراوح، تُدار من رأس 5V في اللوحة.']],
  },
  /* ارتفاعه 152 مم بحسب صفحة MSI (152×121×94.5) لا 150 */
  {
    id: 'cmtjkyw15001970ymtx50bbcn',
    force: true,
    specs: { sizeMm: '152', color: 'White' },
    edits: [
      ['[green]ارتفاع ١٥٠ مم:[/green] يدخل صناديق Micro-ATX التي تقف عند ١٦٥ — بهامشٍ مريح.', '[green]ارتفاع ١٥٢ مم:[/green] يدخل صناديق Micro-ATX التي تقف عند ١٦٥ — بهامشٍ مريح.\n\n[green]أربعة أنابيب حراريّة بتلامسٍ مباشر:[/green] الأنابيب تلامس المعالج نفسه بلا قاعدةٍ وسيطة، وتحتها 50 زعنفة ألمنيوم.'],
      ['* مروحةٌ واحدة بلا ثانيةٍ في العلبة.', '* مروحةٌ واحدة بلا ثانيةٍ في العلبة، بمحمل Rifle عمره المقدّر 40 ألف ساعة.'],
    ],
    append: 'https://www.msi.com/Air-Cooling/MAG-COREFROZR-AA13/Specification',
  },
  {
    id: 'cmtcr2cmg0003o8ymnvab7k4g',
    edits: [
      ['[green]قاعدة نحاس C1100 مطليّة بالنيكل.[/green]', '[green]قاعدة نحاس C1100 مطليّة بالنيكل:[/green] النحاس ينقل الحرارة من المعالج أسرع من الألمنيوم، والنيكل يحميه من الأكسدة.'],
      ['[green]أداءٌ مطابق للنسخة السوداء.[/green]', '[green]أداءٌ مطابق للنسخة السوداء:[/green] اللون وحده يختلف، فلا تدفع تبريداً أقلّ مقابل الأبيض.'],
      S4,
    ],
  },
  {
    id: 'cmv14qiiw003w50ymao1ax7ih',
    edits: [
      ['[green]مضخّة Asetek Gen8 V2:[/green] حتى 3,200 لفّة.', '[green]مضخّة Asetek Gen8 V2:[/green] حتى 3,200 لفّة، أحدث منصّات Asetek وأهدؤها.'],
      ['[green]ثلاث مراوح ARGB مقاس 120 مم.[/green]', '[green]ثلاث مراوح ARGB مقاس 120 مم:[/green] رادييتر 360 يكفي Core Ultra 9 وRyzen 9 تحت الحمل الطويل.'],
      ['[green]ضمان ستّ سنوات للمبرّد وسنتين للشاشة.[/green]', '[green]ضمان ستّ سنوات للمبرّد وسنتين للشاشة:[/green] أطول من ضمان أغلب المبرّدات المائيّة.'],
    ],
  },
];
// ---------------------------------------------------------------- التنفيذ
const backup = [];
let bad = 0;
for (const r of REWRITE) {
  const c = await prisma.component.findUnique({ where: { id: r.id }, select: { id: true, name: true, description: true, specs: true } });
  if (!c) { console.log(`✗ ${r.id} غير موجود`); bad++; continue; }
  /* edits: استبدالاتٌ نصّيّة دقيقة [قديم، جديد] — لشرح بندٍ أخضر عارٍ أو إضافة نقطة، بلا إعادة كتابة الوصف كلّه */
  const missing = [];
  let base = c.description.trimEnd();
  if (r.edits) { for (const [a, b] of r.edits) { if (!base.includes(a)) missing.push(a.slice(0, 40)); base = base.replace(a, b); } r.description = base; }
  /* وصفٌ غنيّ ينقصه رابط الشركة وحده: يُلحق الرابط، أو يُنظَّف سطره الأخير، بلا إعادة كتابة */
  if (r.append) r.description = base + '\n' + r.append;
  if (r.trimLast) r.description = base.split('\n').map((l, i, a) => (i === a.length - 1 ? l.replace(/^موقع الشركة الرسمي:\s*/, '').trim() : l)).join('\n');
  /* url: يستبدل سطر الرابط الأخير (أو يُلحقه إن لم يكن) — لرابطٍ مكسور أو بذيل تتبّع */
  if (r.url) { const ls = base.split('\n'); if (/^https?:\/\//.test(ls[ls.length - 1].trim())) ls.pop(); r.description = [...ls, r.url].join('\n'); }
  const d = r.description;
  const errs = missing.map((m) => `مقطعٌ غير موجود «${m}»`);
  if (/\*\*\[(yellow|red)/.test(d)) errs.push('نجوم حول وسم اللون');
  if (!/^https?:\/\/\S+$/.test(d.trim().split('\n').pop())) errs.push('السطر الأخير ليس رابطاً');
  if (!d.startsWith('### ')) errs.push('لا عنوان');
  for (const m of d.matchAll(/\]\(\/components\/([a-z0-9]+)\)/g)) {
    if (!(await prisma.component.findUnique({ where: { id: m[1] }, select: { id: true } }))) errs.push(`بديلٌ مفقود ${m[1]}`);
  }
  /* force: تصحيحُ بياناتٍ في وصفٍ قديمٍ أطولَ بحشوٍ أو بمعلومةٍ خاطئة — الطول هنا ليس المقياس */
  if (!r.trimLast && !r.url && !r.force && d.length <= (c.description || '').length) errs.push(`ليس أطول (${d.length} ≤ ${c.description.length})`);
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
