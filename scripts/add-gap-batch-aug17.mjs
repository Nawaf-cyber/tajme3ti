/**
 * ============ عشر قطع تسدّ ثقوباً قاسها المسح لا الحدس ============
 *
 * `scripts/catalog-gaps.ts` سأل البيانات بدل الذاكرة، فخرج بثلاثة ثقوب:
 *
 * ١) **قفزة المزوّدات 250﷼ → 418﷼.** ما بينهما لا شيء — والفئة التي تقع
 *    فيها هي أكثر ما يُنصح به: 650 واط 80+ جولد مقسّم. فكل تجميعة متوسطة
 *    (5060 Ti · 9060 XT · 5070) كانت تُجبَر إمّا على 550 واط برونز غير
 *    مقسّم أو على القفز إلى 750 واط بسعرٍ أعلى ٧٠٪.
 *
 * ٢) **كل أقراص 2TB الرخيصة نافدة.** أربعة منها في الكتالوج (620 و699
 *    و900) وكلّها بلا عرضٍ حيّ، فأرخص 2TB يمكن شراؤه فعلاً هو 1139﷼.
 *    و2TB هي السعة الوسطى اليوم لا 1TB.
 *
 * ٣) **أرخص مزوّد SFX 765﷼** — وفي الكتالوج أربعة صناديق Mini-ITX. أي أن
 *    تجميعةً صغيرة اقتصادية مستحيلة: المزوّد وحده أغلى من الكيس.
 *
 * وثلاثة مزوّدات بيضاء تدخل الكتالوج لأوّل مرّة — لم يكن فيه ولا واحد،
 * والتجميعات البيضاء تُطلب كثيراً (كيسان أبيضان ورامان بيضاء موجودة).
 *
 * ⚠️ سرعات الكتابة كلّها من مصادر المصنّعين. وقرص Crucial E100 كان في
 * القائمة (أرخص 2TB حيّ عند كازاسوق) فأُسقط: المصادر تختلف في سرعة كتابته
 * بين 3000 و4500 م.ب/ث، ومخطّط `Storage` يوجب `writeSpeed`. رقمٌ مختلَف
 * فيه يُسجَّل يقيناً في القاعدة ثم يُقرأ كأنه مقيس.
 *
 *   node scripts/add-gap-batch-aug17.mjs --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const PSU = 'cmpfziqh70002x4ym6ln587z2';
const STORAGE = 'cmpfziqr70005x4ym3k7uh079';

const A550 = 'cmr3b1d4e0001ncymhucwjtot';       // MSI MAG A550BN 224
const MWE750 = 'cmr3f2hha0007ncym6kvyvit1';     // CM MWE Gold 750 V2 418
const RM750E = 'cmpnewrm750e0000000000000';     // Corsair RM750e 464
const V850SFX = 'cmrcmmrp6000204kvusqhpsx4';    // CM V850 SFX Gold 765
const RM850X = 'cmpieb9ip000z00ym8x341l21';     // Corsair RM850x Shift 712
const THOR = 'cmpiecipz004g00ymnacid88v';       // ROG Thor 1200P2 1294
const NV3_2TB = 'cmpiecfxr004200ymi6fdyww9';    // Kingston NV3 2TB 1139
const P990_2TB = 'cmpfzir17000fx4ym3tkdck9n';   // Samsung 990 PRO 2TB 1572
const EVO1TB = 'cmr2lb5is000qjgymrzv3tija';     // Samsung 870 EVO 1TB SATA 1708
const C2000D = 'cmsqbhr4c0000s4ymld2p1ytn';     // Corsair 2000D Airflow Mini-ITX 430
const NR200P = 'cmpieb303000b00ymn7wfi2t2';     // CM NR200P 844
const RM1000E = 'cmpi5h9mv000604l1vseruv2k';    // Corsair RM1000e 719

const PARTS = [
  // ═══════════════ المزوّدات: سدّ القفزة 250 → 418 ═══════════════
  {
    categoryId: PSU, brand: 'Thermalright', name: 'TR-KG650W 650W Gold White',
    tdpWattage: 0, performanceTier: 3,
    specs: { rating: '80+ Gold', wattage: '650', formFactor: 'ATX 3.1', modularity: 'Full', color: 'White' },
    offers: [['noon', 'https://www.noon.com/saudi-en/thermalright-tr-kg650w-650w-80-gold-fully-modular-atx-3-1-power-supply-white/Z8B8505CF7AD43C5B9AF9Z/p/']],
    description: `### Thermalright TR-KG650W 650W Gold

يسدّ أوسع فجوة في مزوّدات الكتالوج: كان ما بين 550 واط برونز غير مقسّم و750 واط جولد **خالياً تماماً** — وهي الفئة التي تحتاجها كل تجميعة متوسطة.

التقنيات الأساسية المدعومة:

[green]650 واط بشهادة 80+ جولد:[/green] القدرة المناسبة لكرت من فئة 5060 Ti أو 9060 XT أو 5070 مع معالج ٦ إلى ٨ أنوية.

[green]مقسّم بالكامل:[/green] لا تركّب إلا الكابلات التي تحتاجها — فرقٌ حقيقي في ترتيب الكيس وتدفّق الهواء، وهو ما تفتقده كل المزوّدات الأرخص عندنا.

[green]معيار ATX 3.1:[/green] يحتمل قفزات الطاقة اللحظية لكروت الجيل الجديد بلا إطفاء مفاجئ.

[green]لونٌ أبيض:[/green] أوّل مزوّد أبيض في الكتالوج — والتجميعات البيضاء تطلبه.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **الضمان سنتان** — أقصر بكثير من ٧ سنوات لدى Seasonic و١٠ لدى Corsair في الفئة نفسها. وهذا جوهر فرق السعر.
* Thermalright تُعرف بمبرّداتها لا بمزوّداتها؛ الوحدة مصنوعة لدى طرف ثالث.
* 650 واط لا تكفي 5070 Ti ولا ما فوقها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا منفذ 12V-2x6 أصليّ للكروت العليا.
* بلا وضع مروحة صامتة معلن.

---
بإمكانك التوجه إلى [Seasonic FOCUS 650 Gold](/components/SEASONIC_650) إذا كان توجهك يتركز على الآتي:
* نفس القدرة والشهادة بضمان ٧ سنوات وسمعة تصنيع أقوى — قارن الفرق بالسعر.

وإلى [Cooler Master MWE Gold 750 V2](/components/${MWE750}) إذا كان توجهك يتركز على الآتي:
* ١٠٠ واط إضافية إن كنت تنوي كرتاً أعلى لاحقاً.
https://www.thermalright.com/`,
  },
  {
    categoryId: PSU, brand: 'Seasonic', name: 'FOCUS 650 Gold SSR-650FM',
    tdpWattage: 0, performanceTier: 3,
    specs: { rating: '80+ Gold', wattage: '650', formFactor: 'ATX', modularity: 'Semi' },
    offers: [['noon', 'https://www.noon.com/saudi-en/seasonic-focus-650-gold-ssr-650fm-650w-80-gold-atx12v-eps12v-semi-modular-7-year-warranty-compact-140-mm-size-power-supply/Z62D8DD32A28C4EEBC9D7Z/p/']],
    description: `### Seasonic FOCUS 650 Gold SSR-650FM

المزوّد الذي يُشترى مرّة: Seasonic تصنع وحداتها بنفسها لا عبر طرفٍ ثالث، وتضمنها **سبع سنوات** — أطول من عمر أغلب التجميعات.

التقنيات الأساسية المدعومة:

[green]650 واط 80+ جولد:[/green] الفئة المناسبة للتجميعات المتوسطة، وكانت خالية في الكتالوج قبل اليوم.

[green]ضمان ٧ سنوات:[/green] ضِعف ما يقدّمه أغلب المنافسين في هذا السعر، وثلاثة أضعاف الوحدات الاقتصادية.

[green]طول 140 مم فقط:[/green] أقصر من المعتاد (٠٦١ مم شائع)، فيدخل الصناديق الضيّقة ويترك مجالاً لترتيب الكابلات.

[green]نصف مقسّم:[/green] كابلات اللوحة والمعالج ثابتة، وما عداها يُركَّب عند الحاجة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **نصف مقسّم لا كامل** — كابلا اللوحة والمعالج يبقيان مركّبين ولو لم تحتجهما.
* بمعيار ATX 12V القديم لا ATX 3.1: بلا منفذ ١٢ فولت ذي ١٢ سنّاً، فكروت الجيل الجديد تحتاج المحوّل المرفق معها.
* 650 واط سقفٌ لا يتجاوز كرتاً من فئة 5070.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا إضاءة وبلا لون أبيض.
* ليس من فئة البلاتينيوم في الكفاءة.

---
بإمكانك التوجه إلى [Corsair RM750e](/components/${RM750E}) إذا كان توجهك يتركز على الآتي:
* ١٠٠ واط إضافية وتقسيمٌ كامل بفارقٍ بسيط في السعر.
https://seasonic.com/focus-gx/`,
  },
  {
    categoryId: PSU, brand: 'Seasonic', name: 'Focus SGX-650 650W Gold SFX',
    tdpWattage: 0, performanceTier: 4,
    specs: { rating: '80+ Gold', wattage: '650', formFactor: 'SFX', modularity: 'Full' },
    offers: [['amazon', 'https://www.amazon.sa/dp/B07JVQQK69']],
    description: `### Seasonic Focus SGX-650 650W Gold SFX

**أرخص مزوّد SFX في الكتالوج** — وقبله كان أرخص خيارٍ صغير أغلى من الكيس نفسه، فكانت التجميعة الصغيرة الاقتصادية مستحيلة عملياً.

التقنيات الأساسية المدعومة:

[green]مقاس SFX:[/green] يدخل الصناديق الصغيرة التي ترفض المزوّد العادي — وفي الكتالوج أربعة منها.

[green]650 واط 80+ جولد ومقسّم بالكامل:[/green] قدرةٌ تكفي كرتاً من فئة 5070 في علبةٍ بحجم كتاب.

[green]ضمان ١٠ سنوات:[/green] وهو أطول ضمانٍ في مزوّدات الكتالوج.

[green]كابلات مسطّحة قصيرة:[/green] مصمّمة للمسافات الضيّقة، لا كابلات كيسٍ كبير تُحشر.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **مروحة 100 مم** — أصغر فتُدار أسرع، فهو أعلى صوتاً من مزوّد ATX بالقدرة نفسها تحت الحمل.
* بمعيار ATX 12V لا ATX 3.1؛ الكروت الجديدة تحتاج محوّلها المرفق.
* SFX لا SFX-L: أصغر، لكن بعض الصناديق تفضّل الأكبر لهدوئه.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا إضاءة وبلا شاشة.
* ليس خياراً لكيسٍ كبير — تشتري صِغَراً لا تحتاجه.

---
بإمكانك التوجه إلى [Corsair 2000D Airflow Mini-ITX](/components/${C2000D}) لتكملة التجميعة — كيس Mini-ITX يقبل SFX وSFX-L ويستوعب كرتاً بطول ٣٢٠ مم.

وإلى [Cooler Master V850 SFX Gold](/components/${V850SFX}) إذا كان توجهك يتركز على الآتي:
* ٢٠٠ واط إضافية في المقاس نفسه، لكرتٍ أعلى في علبةٍ صغيرة.
https://seasonic.com/focus-sgx/`,
  },
  {
    categoryId: PSU, brand: 'Corsair', name: 'RM850e 850W ATX 3.1 Gold White',
    tdpWattage: 0, performanceTier: 4,
    specs: { rating: '80+ Gold', wattage: '850', formFactor: 'ATX 3.1', modularity: 'Full', color: 'White' },
    offers: [['cazasouq', 'https://www.cazasouq.com/corsair-rm850e-850w-atx-3-1-cybenetics-gold-fully-modular-power-supply-white-41351']],
    description: `### Corsair RM850e 850W ATX 3.1 White

أوّل مزوّد 850 واط أبيض في الكتالوج — وهي القدرة التي تُبنى عليها أغلب التجميعات العالية، فالتجميعة البيضاء كانت تُجبَر على مزوّدٍ أسود يفسد مظهرها.

التقنيات الأساسية المدعومة:

[green]معيار ATX 3.1 بمنفذ 12V-2x6:[/green] كابل الكرت مباشرةً بلا محوّلات، وهو ما تطلبه كروت 5070 Ti و5080.

[green]850 واط 80+ جولد:[/green] مساحةٌ مريحة فوق كرتٍ يسحب ٣٠٠ واط ومعالجٍ ثمانيّ الأنوية.

[green]مقسّم بالكامل:[/green] وكابلاته بيضاء كذلك لا سوداء — تفصيلةٌ تُفسد المظهر حين تُهمَل.

[green]ضمان ٧ سنوات:[/green] ومروحة صامتة تتوقّف تحت الأحمال الخفيفة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **سلسلة e الاقتصادية** — مكثّفات وتنظيمُ جهدٍ أدنى من RMx وHX، والفرق يظهر تحت الحمل الطويل لا في الألعاب.
* 850 واط لا تُنصح مع 5090.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا مراقبة رقمية (iCUE) كما في السلسلة i.
* بلا إضاءة RGB.

---
بإمكانك التوجه إلى [Corsair RM850x Shift 850W Gold](/components/${RM850X}) إذا كان توجهك يتركز على الآتي:
* السلسلة الأعلى بمنافذ جانبية تسهّل التوصيل في الصناديق الضيّقة.
https://www.corsair.com/`,
  },
  {
    categoryId: PSU, brand: 'DeepCool', name: 'PQ1200G 1200W Gold',
    tdpWattage: 0, performanceTier: 5,
    specs: { rating: '80+ Gold', wattage: '1200', formFactor: 'ATX', modularity: 'Full' },
    offers: [['cazasouq', 'https://www.cazasouq.com/deepcool-pq1200g-1200w-80-plus-gold-fully-modular-power-supply-48424']],
    description: `### DeepCool PQ1200G 1200W Gold

1200 واط بنصف سعر الخيار الوحيد الذي كان في الكتالوج عند هذه القدرة — وهي القدرة التي يحتاجها فعلاً من يركّب 5090.

التقنيات الأساسية المدعومة:

[green]1200 واط 80+ جولد:[/green] تحتمل كرتاً يسحب ٥٧٥ واط مع معالج 9950X تحت حملٍ كامل، وتبقي هامشاً.

[green]مقسّم بالكامل:[/green] ضروريّ عند هذه القدرة — عدد الكابلات كبير ولا تحتاج نصفها.

[green]مروحة 135 مم بمحمل هيدروليكي:[/green] تتوقّف كلّياً تحت الأحمال الخفيفة.

[green]حماية كاملة:[/green] ضدّ الجهد الزائد والناقص والتيار الزائد والحرارة وقِصَر الدارة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **راجع منفذ الكرت قبل الشراء** — الوحدات الأقدم من هذه السلسلة تأتي بمنفذ ١٢ فولت من الجيل الأوّل (12VHPWR) لا 12V-2x6 المحدَّث.
* جولد لا بلاتينيوم: كفاءةٌ أدنى بنقطةٍ أو نقطتين، ولا تُلحظ في الفاتورة.
* 1200 واط زيادةٌ مهدورة لمن كرته دون 5080.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا مراقبة رقمية وبلا شاشة.
* بلا إضاءة.

---
بإمكانك التوجه إلى [ASUS ROG Thor 1200P2](/components/${THOR}) إذا كان توجهك يتركز على الآتي:
* كفاءة بلاتينيوم وشاشة OLED تعرض السحب لحظياً — بفارق سعرٍ كبير.
https://www.deepcool.com/`,
  },

  // ═══════════════ التخزين: إحياء فئة 2TB ═══════════════
  {
    categoryId: STORAGE, brand: 'Lexar', name: 'NM790 2TB',
    tdpWattage: 0, performanceTier: 4,
    specs: {
      type: 'NVMe M.2', capacity: '2TB', interface: 'PCIe 4.0 x4',
      readSpeed: '7400 MB/s', writeSpeed: '6500 MB/s', formFactor: 'M.2 2280',
    },
    offers: [['noon', 'https://www.noon.com/saudi-en/nm790-2tb-ssd-m-2-2280-pcie-gen4x4-nvme-1-4-internal-ssd-up-to-7400mb-s-read-up-to-6500mb-s-write-internal-solid-state-drive-for-ps5-pc-laptop-gamers-professionals-lnm790x002t-rnnng-2-tb/N70054839V/p/']],
    description: `### Lexar NM790 2TB

أسرع قرص 2TB من الجيل الرابع دخل الكتالوج — وكانت كل أقراص هذه السعة الرخيصة **نافدة** قبله، فأرخص 2TB قابل للشراء كان 1,139 ﷼.

التقنيات الأساسية المدعومة:

[green]7400 قراءة و6500 كتابة:[/green] قرب سقف الجيل الرابع النظري، ويضاهي أقراصاً أغلى منه بكثير.

[green]تحمّل 1500 تيرابايت كتابة:[/green] عالٍ لهذه الفئة — يعني سنواتٍ من الاستعمال الكثيف.

[green]بلا ذاكرة DRAM مستقلّة لكن بتقنية HMB:[/green] يستعير جزءاً من رام النظام، فيبلغ أداءً قريباً من أقراص الـDRAM بسعرٍ أقلّ.

[green]يعمل في PS5:[/green] بسمك 2280 قياسي بلا مشتّت، فيدخل تحت غطاء الجهاز.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **بلا ذاكرة DRAM** — الأداء يتراجع في الكتابة العشوائية المستمرّة (نقل ملفات ضخم متواصل) مقارنةً بـ990 PRO.
* بلا مشتّت حرارة مرفق: اللوحات الحديثة توفّره، والقديمة قد تحتاج شراءه.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس قرص الجيل الخامس.
* بلا برنامج إدارة بمستوى Samsung Magician.

---
بإمكانك التوجه إلى [Samsung 990 PRO 2TB](/components/${P990_2TB}) إذا كان توجهك يتركز على الآتي:
* ذاكرة DRAM وثباتٌ أعلى تحت الأحمال الطويلة، لمن يحرّر فيديو لا يلعب فقط.
https://www.lexar.com/`,
  },
  {
    categoryId: STORAGE, brand: 'WD', name: 'Blue SN5100 2TB',
    tdpWattage: 0, performanceTier: 4,
    specs: {
      type: 'NVMe M.2', capacity: '2TB', interface: 'PCIe 4.0 x4',
      readSpeed: '7100 MB/s', writeSpeed: '6700 MB/s', formFactor: 'M.2 2280',
    },
    offers: [['cazasouq', 'https://www.cazasouq.com/wd-blue-sn5100-2tb-nvme-ssd-m-2-2280-pcie-gen-4-0-48522']],
    description: `### WD Blue SN5100 2TB

الجيل الجديد من سلسلة Blue — أسرع من SN580 التي في الكتالوج بنحو ٧٠٪ في القراءة، وأعلى تحمّلاً بأربعة أضعاف.

التقنيات الأساسية المدعومة:

[green]7100 قراءة و6700 كتابة:[/green] مقابل 4150 في SN580 السابقة — قفزةُ جيلٍ كاملة داخل السلسلة نفسها.

[green]ذاكرة 3D CBA من SanDisk:[/green] بنيةٌ تضع دارة التحكّم تحت خلايا الذاكرة، فتقصر المسافات وتخفض الاستهلاك.

[green]تحمّل 900 تيرابايت كتابة:[/green] ومتوسط عمرٍ 1.75 مليون ساعة.

[green]كفاءة طاقة عالية:[/green] وهي ما تميّز سلسلة Blue — حرارةٌ أقلّ في الصناديق الضيّقة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **بلا ذاكرة DRAM** (يعتمد HMB) — كسائر سلسلة Blue، والأثر يظهر في الكتابة العشوائية المستمرّة.
* الكتابة تتباطأ بعد امتلاء ذاكرة التخزين المؤقّت في النقل المتواصل جداً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس قرص الجيل الخامس ولا من سلسلة Black الأعلى.
* بلا مشتّت مرفق.

---
بإمكانك التوجه إلى [WD Black SN850X 2TB](/components/cmpieb8q5000w00ym8y2x0huq) إذا كان توجهك يتركز على الآتي:
* سلسلة Black بذاكرة DRAM ووضع ألعاب مخصّص، لمن يريد الأعلى داخل الجيل الرابع.
https://www.sandisk.com/products/ssd/internal-ssd/wd-blue-sn5100-nvme-ssd`,
  },
  {
    categoryId: STORAGE, brand: 'Crucial', name: 'P310 2TB',
    tdpWattage: 0, performanceTier: 3,
    specs: {
      type: 'NVMe M.2', capacity: '2TB', interface: 'PCIe 4.0 x4',
      readSpeed: '7100 MB/s', writeSpeed: '6000 MB/s', formFactor: 'M.2 2280',
    },
    offers: [['noon', 'https://www.noon.com/saudi-en/crucial-p310-2tb-m-2-2280-nvme-pcie-gen4-x4-internal-ssd-up-to-7100mb-s-read-6000mb-s-write-232-layer-micron-qlc-nand-440tbw-endurance-high-performance-gaming-laptop-storage-ct2000p310ssd8-2-tb/N70251613V/p/']],
    description: `### Crucial P310 2TB

نسخة 2TB من القرص الذي في الكتالوج بسعة 1TB — بسرعةٍ عالية وسعرٍ منخفض لأنه يستعمل ذاكرة QLC لا TLC، وهي مقايضةٌ يجب أن تُعرف قبل الشراء.

التقنيات الأساسية المدعومة:

[green]7100 قراءة و6000 كتابة:[/green] أرقام الفئة العليا من الجيل الرابع.

[green]ذاكرة Micron بـ232 طبقة:[/green] من مصنّع الذاكرة نفسه، لا شرائح مشتراة.

[green]مقاس 2280 القياسي:[/green] يدخل كل لوحةٍ حديثة وجهاز PS5.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **ذاكرة QLC لا TLC** — أرخص للجيجابايت، لكن سرعة الكتابة تهبط بشدّة بعد امتلاء الذاكرة المؤقّتة في النقل الطويل المتواصل.
* ⚠️ **تحمّل 440 تيرابايت فقط** — نصف ما تحتمله أقراص TLC في السعة نفسها.
* ⚠️ **انتبه للمقاس عند الشراء**: من هذا القرص نسخة **2230** قصيرة مخصّصة لأجهزة اليد، لا تدخل اللوحات المكتبية. المسجَّل هنا هو 2280.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا ذاكرة DRAM وبلا مشتّت.
* ليس خياراً لمن يحرّر فيديو أو ينقل عشرات الجيجابايت يومياً.

---
بإمكانك التوجه إلى [Lexar NM790 2TB](/components/LEXAR_NM790) إذا كان توجهك يتركز على الآتي:
* ذاكرة TLC وتحمّلٌ 1500 تيرابايت — ثلاثة أضعاف، وأسرع في الكتابة الطويلة.
https://www.crucial.com/`,
  },
  {
    categoryId: STORAGE, brand: 'Crucial', name: 'BX500 1TB SATA',
    tdpWattage: 0, performanceTier: 1,
    specs: {
      type: 'SATA SSD 2.5"', capacity: '1TB', interface: 'SATA III',
      readSpeed: '540 MB/s', writeSpeed: '500 MB/s', formFactor: '2.5"',
    },
    offers: [['noon', 'https://www.noon.com/saudi-en/crucial-bx500-1tb-3d-nand-sata-2-5-inch-internal-ssd-up-to-540mb-s-ct1000bx500ssd1z-1-tb/N70055448V/p/']],
    description: `### Crucial BX500 1TB SATA

قرص SATA بسعرٍ معقول — والقرصان الوحيدان من هذا النوع في الكتالوج مسعّران بأرقامٍ لا تناسب فئتهما، فبقيت الفئة بلا خيارٍ عملي.

التقنيات الأساسية المدعومة:

[green]سعة 1 تيرابايت بأرخص سعرٍ للجيجابايت:[/green] الخيار الصحيح لقرصٍ ثانٍ يخزّن الألعاب التي لا تُلعب يومياً.

[green]مقاس 2.5 بوصة:[/green] يُركَّب في أي كيس وأي لوحة بمنفذ SATA — ولا يشغل منفذ M.2 المحدود.

[green]يعمل في الأجهزة القديمة:[/green] ترقيةٌ لحاسبٍ لا يملك منفذ M.2 أصلاً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **540 م.ب/ث سقف واجهة SATA** — أي **أبطأ بأربعة عشر ضعفاً** من أقراص NVMe في الكتالوج. لا يصلح قرصاً للنظام إن كان في متناولك NVMe.
* ذاكرة بلا DRAM: الكتابة المتواصلة تتباطأ بعد الدفعة الأولى.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يعمل في PS5 كقرص توسعة داخلي.
* ليس خياراً لتحميل الألعاب الحديثة بسرعة (DirectStorage).

---
بإمكانك التوجه إلى [Kingston NV3 2TB](/components/${NV3_2TB}) إذا كان توجهك يتركز على الآتي:
* ضِعف السعة وسرعةٌ أعلى بعشرة أضعاف على منفذ M.2 — إن كانت لوحتك تملك منفذاً فارغاً.
https://www.crucial.com/`,
  },
  {
    categoryId: PSU, brand: 'Corsair', name: 'RM1000e 1000W ATX 3.1 White',
    tdpWattage: 0, performanceTier: 5,
    specs: { rating: '80+ Gold', wattage: '1000', formFactor: 'ATX 3.1', modularity: 'Full', color: 'White' },
    offers: [['cazasouq', 'https://www.cazasouq.com/corsair-rm1000e-1000w-atx-3-1-cybenetics-platinum-fully-modular-power-supply-white-41357']],
    description: `### Corsair RM1000e 1000W ATX 3.1 White

النسخة البيضاء من مزوّد 1000 واط الموجود عندنا — وهي القدرة التي يحتاجها كرتٌ من فئة 5080 أو 7900 XTX، فتكتمل بها التجميعة البيضاء العالية.

التقنيات الأساسية المدعومة:

[green]1000 واط بمنفذ 12V-2x6:[/green] كابلٌ واحد إلى الكرت مباشرةً، بلا محوّل ثلاثيّ يزحم الكيس.

[green]معيار ATX 3.1:[/green] يحتمل قفزات سحبٍ تصل ضِعفَي القدرة الاسمية لحظياً.

[green]مقسّم بالكامل بكابلات بيضاء:[/green] وليست سوداء تُفسد المظهر.

[green]كفاءة Cybenetics بلاتينيوم:[/green] أعلى من شهادة 80+ جولد الاسمية.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **سلسلة e الاقتصادية** — تنظيم جهدٍ ومكثّفات أدنى من RMx وHX.
* 1000 واط أكثر ممّا تحتاجه تجميعةٌ دون 5080 — تدفع ثمن هامشٍ لا تستعمله.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا مراقبة iCUE رقمية.
* بلا إضاءة.

---
بإمكانك التوجه إلى [Corsair RM1000e (أسود)](/components/${RM1000E}) إذا كان توجهك يتركز على الآتي:
* المزوّد نفسه بلونٍ أسود — قارن السعرين، فاللون وحده قد يكلّف.
https://www.corsair.com/`,
  },
];

// ---------------------------------------------------------------- التنفيذ
const stores = Object.fromEntries(
  (await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]),
);

let blocked = false;
for (const p of PARTS) {
  const dup = await prisma.component.findFirst({ where: { name: p.name, brand: p.brand } });
  console.log(`\n=== ${p.brand} ${p.name}   [T${p.performanceTier}]`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  for (const [slug, url] of p.offers) {
    if (!stores[slug]) { console.log(`    ⛔ متجر مجهول: ${slug}`); blocked = true; continue; }
    const taken = await prisma.componentOffer.findFirst({ where: { url }, select: { component: { select: { name: true } } } });
    console.log(`    ${taken ? '⛔' : '·'} ${slug}: ${url.slice(0, 74)}`);
    if (taken) { console.log(`       الرابط مستعمل في: ${taken.component.name}`); blocked = true; }
  }
  if (dup) { console.log(`    ⛔ القطعة موجودة: ${dup.id}`); blocked = true; }
}
if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-gaps-${stamp}.json`, JSON.stringify(PARTS, null, 2));

/* الروابط المتبادلة بين قطعتين جديدتين لا تُعرف معرّفاتها قبل الإنشاء،
   فتُكتب رموزاً نائبة وتُستبدل بعده. */
const created = {};
for (const p of PARTS) {
  const { offers, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  for (const [slug, url] of offers) {
    await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[slug], url, inStock: true } });
  }
  created[p.name] = c.id;
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}

const SWAP = {
  SEASONIC_650: created['FOCUS 650 Gold SSR-650FM'],
  LEXAR_NM790: created['NM790 2TB'],
};
for (const [token, id] of Object.entries(SWAP)) {
  const hits = await prisma.component.findMany({
    where: { description: { contains: `/components/${token}` } },
    select: { id: true, description: true },
  });
  for (const h of hits) {
    await prisma.component.update({
      where: { id: h.id },
      data: { description: h.description.split(`/components/${token}`).join(`/components/${id}`) },
    });
    console.log(`   ↳ استُبدل ${token} في ${h.id}`);
  }
}

console.log(`\nنسخ للتالي:\n${Object.values(created).join(' ')}`);
await prisma.$disconnect();
