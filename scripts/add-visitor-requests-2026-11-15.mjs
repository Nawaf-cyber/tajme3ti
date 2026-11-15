/**
 * 2026-11-15 — طلبات الزوّار. نوّاف: «إذا تشوف البند الأول مهمّة كلّها ضيفها».
 * البند الأول عشر قطع لطلبات «قيد المراجعة» (ولانكول 217 الجوز أُضيف 2026-11-05 فلا يُعاد):
 *
 *   ① ASUS ROG Astral RTX 5080 OC (90YV0LV0-M0NA00)، طلب 2026-10-16
 *      المواصفات من جدول مايكرولس (منسوخٌ من ASUS) وصفحة ROG (قُرئت اليوم): 357.6×149.3×76 مم، 3.8 فتحة،
 *      16-pin واحد، مزوّد 850 واط، 2x HDMI 2.1b + 3x DP 2.1b، أربع مراوح، Power Detector+، BIOS مزدوج.
 *      والتردّد 2760 من أمازون. العروض: مايكرولس 9991.31 متوفّر · أمازون B0DS643QRW ‏9399 (بائع خارجيّ،
 *      Clickndealstore) · كازاسوق نافد. إنفيني آرك عنده Dhahab وحده (نسخةٌ أخرى).
 *   ② ASRock X870E Taichi Lite (90-MXBPA0-A0UAYZ)، طلب 2026-10-13
 *      المواصفات من جدول مايكرولس وصفحة ASRock: E-ATX 30.5×26.7 سم، 24+2+1 طوراً 110A، USB4 ×2، 5GbE، Wi-Fi 7.
 *      العروض: أمازون B0DFNPK2MX ‏1729 (باقي ٣) · مايكرولس نافد · كازاسوق نافد.
 *   ③ Gigabyte RTX 5060 EAGLE OC ICE 8G (GV-N5060EAGLEOC ICE-8GD) — «5060 oc eagle white»، طلب 2026-10-09
 *      المواصفات من صفحة Gigabyte /sp (لوحة المتصفّح؛ curl يُردّ 403): 208×120×40 مم، 8-pin واحد، مزوّد 550 واط.
 *      العروض: أمازون B0F6NP452Y ‏1498.08 (بلا زرّ شراءٍ مباشر — من بائعين آخرين) · كازاسوق نافد.
 *      مايكرولس يحمل EAGLE OC **بلا ICE** (GV-N5060EAGLE OC-8GD) — قطعةٌ أخرى فلا تُربط.
 *   ④ MAJESTY CLL-401 مبرّد 360 بشاشة 3.9 بوصة، طلب 2026-11-09 — أمازون B0FQ8TQ745 ‏399، يبيعه متجر ماجيستي.
 *      المواصفات من صفحة الشركة (CLL-401-B) ونقاط أمازون.
 *   ⑤ MAJESTY MPS700-S 700W أسود — طلبان (2026-08-18 و09-26)؛ أمازون B0GSRD9PB7 ‏175.75.
 *      ⚠️ أمازون يكتب في الجدول «Full Modular» وعنوانه وصفحة الشركة «غير معياري» — والصحيح الأخير.
 *   ⑥ MAJESTY MPS850-G 850W Gold أبيض — أمازون B0G3XSXMTQ ‏420 + ريد زون 489 (رابط «…-gold» = الأبيض،
 *      و«…-gold-1» = الأسود كما في وصفيهما). ⚠️ جدول أمازون يقول MPS850-G01 وهو رمز الأسود عند الشركة،
 *      والعنوان والسعر (420 = سعر الأبيض G02 عندها) يقولان أبيض — فالعنوان هو الحكم.
 *   ⑦–⑩ صناديق MAJESTY («جميع صناديق ماجيستي»، طلب 2026-10-13؛ أُضيف منها أربعة قبل):
 *      Mavera Pro أسود CASE-300 — أمازون B0DJJTZ69D ‏435.99 + ريد زون 499
 *      Orion أبيض CASE-211 — أمازون B0GKVKY236 ‏435.99 (الأسود CASE-210 نافدٌ عند الشركة وغير موجود في أمازون)
 *      Boulevard أبيض CASE-009 — أمازون B0FGDWCSBY ‏415.99
 *      X-Space Plus أسود CASE-208 — ريد زون 499 وحده (الشركة 414 نافد)؛ وهو أيضاً الأقرب لطلب «Majestay Space C».
 *      المواصفات من صفحات الشركة + نقاط أمازون؛ وعند التعارض يُكتب الأحوط ويُذكر الآخر في الأصفر.
 *
 * حالة الطلبات (RequestedPart) لا يمسّها هذا السكربت — رُبطت بعده بقرار نوّاف في link-visitor-requests-2026-11-15.mjs.
 *
 *   node scripts/add-visitor-requests-2026-11-15.mjs           # عرض
 *   node scripts/add-visitor-requests-2026-11-15.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const ALT = {
  PRIME5080: ['ASUS GeForce RTX 5080 PRIME OC 16G', 'cmti4cpao0000asym6eeam24p'],
  GAMINGPLUS: ['MSI X870E Gaming Plus WiFi', 'cmuzjsmyz00002kymo9ezj0td'],
  TI16: ['NVIDIA GeForce RTX 5060 Ti 16GB', 'cmq5060tixx00000ym00000002'],
  AQUA360: ['Thermalright Aqua Elite 360 V3', 'cmv0ioa0u000r0symyh8koqxe'],
  PL750D: ['DeepCool PL750D', 'cmuztrwvi0012kcymmbzg3xsi'],
  UD850: ['Gigabyte UD850GM PG5 V2', 'cmuzymunt001hwwymq2c46orm'],
  XSPACE: ['MAJESTY X-Space Black', 'cmv6xm8hy0000kkym6w6hkbyh'],
  L217INFW: ['Lian Li LANCOOL 217 INF White', 'cmv1eseqf000c8oymxlbiq5dc'],
};
const alt = (k, ...why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const A = (asin, inStock = true) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}`, inStock, key: asin });
const RZ = (slug) => ({ store: 'redzone', url: `https://redzzone.com/products/${encodeURIComponent(slug)}`, inStock: true, key: encodeURIComponent(slug) });

const PSU_NOTE = 'مقاس مزوّد الطاقة مستنتجٌ ATX لأنّ الصندوق Mid Tower يقبل لوحات ATX؛ الشركة لم تذكره.';
const LOCAL = 'ماركةٌ محلّيّة بلا اختبارات حرارةٍ وضجيج مستقلّة نقيس عليها';
const WARRANTY2 = 'ضمان سنتين مع تبديلٍ فوريّ من أيّ فرعٍ لماجيستي في السعوديّة';

const PARTS = [
  // ---------------------------------------------------------------- ①
  {
    category: 'GPU', brand: 'ASUS', name: 'ROG Astral RTX 5080 OC 16GB',
    imageUrl: 'https://m.media-amazon.com/images/I/81Wcw8qLt3L._AC_SL1500_.jpg',
    tdpWattage: 360, performanceTier: 5,
    specs: { vram: '16GB', ports: '2x HDMI 2.1b, 3x DP 2.1b', lengthMm: '357.6', cudaCores: '10752', interface: 'PCIe 5.0', memoryBus: '256-bit', boostClock: '2760 MHz', memoryType: 'GDDR7', architecture: 'Blackwell', powerConnectors: '1x 16-pin' },
    offers: [
      { store: 'microless', url: 'https://saudi.microless.com/product/asus-rog-astral-geforce-rtx-5080-oc-graphics-card-16gb-gddr7-256-bit-memory-10752-cuda-cores-30-gbps-memory-clock-pci-express-5-0-90yv0lv0-m0na00/', inStock: true, key: '90yv0lv0-m0na00' },
      A('B0DS643QRW'),
      { store: 'cazasouq', url: 'https://www.cazasouq.com/product/asus-rog-astral-geforce-rtx-5080-16gb-gddr7-oc-edition-gpu', inStock: false, key: 'asus-rog-astral-geforce-rtx-5080-16gb-gddr7-oc-edition-gpu' },
    ],
    description: `### ASUS ROG Astral RTX 5080 OC 16GB

أفخم نسخ RTX 5080 من ASUS (90YV0LV0-M0NA00): أوّل كرتٍ من ROG بأربع مراوح، بهيكلٍ معدنيّ مصبوب وتبريدٍ مبالَغ فيه. لمن يبي أداء 5080 كاملاً في 1440p عالي التردّد و4K، بأبرد حرارةٍ وأهدأ صوتٍ ممكنين لهذه الشريحة.

**التقنيات الأساسية المدعومة:**

[green]أداء 1440p و4K عالٍ:[/green] شريحة RTX 5080 تعطي قرابة 128 إطاراً في 1440p و77 في 4K بإعدادات Ultra في متوسّط اختبارات Tom's Hardware بلا DLSS، ومع DLSS 4 وتوليد الإطارات يرتفع الرقم كثيراً.

[green]أربع مراوح وغرفة بخار:[/green] المروحة الرابعة في الخلف تسحب الهواء عبر المشتّت، مع غرفة بخار (Vapor Chamber) ووسادة حراريّة تتغيّر بالحرارة بدل المعجون، فتبقى الحرارة منخفضة والمراوح بطيئة تحت الحمل الطويل.

[green]مراقبة موصّل الطاقة (Power Detector+):[/green] الكرت يراقب كلّ سنٍّ من أسنان موصّل 16-pin الستّة، وينبّهك إن اختلّ أحدها لتعيد تركيب الكابل — حمايةٌ عمليّة من مشكلة الموصّلات الذائبة.

[green]BIOS مزدوج:[/green] مفتاح بين وضع الأداء ووضع الهدوء بنفس حدّ الطاقة، فتختار بين حرارةٍ أقلّ أو صوتٍ أقلّ بدون برامج.

[green]16 جيجابايت GDDR7 بسرعة 30 جيجابت/ث:[/green] على ناقل 256 بت، مع منفذَي HDMI 2.1b وثلاثة DisplayPort 2.1b — خمسة مخارج بدل أربعة في أغلب النسخ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **طوله 357.6 مم وسماكته 3.8 فتحة ووزنه قرابة 2.9 كجم:** تأكّد أنّ كيسك يقبل 360 مم، واستعمل الحامل المرفق في العلبة.
* السعر أعلى بنحو ألف ريال أو أكثر من نسخ 5080 العاديّة، والفرق في الإطارات بضعة بالمئة فقط — أغلب ما تدفعه للتبريد والهدوء.
* ASUS توصي بمزوّد 850 واط على الأقلّ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* الذاكرة 16 جيجابايت كأيّ 5080 — لا تزيد بالنسخة الفاخرة.

${alt('PRIME5080', 'الشريحة نفسها في كرتٍ أقصر (304 مم) بسعرٍ أقلّ بكثير، إن كانت الحرارة والضجيج ليست أولويّتك.')}
https://rog.asus.com/graphics-cards/graphics-cards/rog-astral/rog-astral-rtx5080-o16g-gaming/`,
  },
  // ---------------------------------------------------------------- ②
  {
    category: 'Motherboard', brand: 'ASRock', name: 'X870E Taichi Lite',
    imageUrl: 'https://m.media-amazon.com/images/I/81eScUAD-7L._AC_SL1500_.jpg',
    tdpWattage: 20, performanceTier: 5,
    specs: { wifi: 'Yes', maxRam: '256GB', socket: 'AM5', chipset: 'X870E', m2Slots: '4', ramType: 'DDR5', formFactor: 'E-ATX', memorySpeed: '8200+ MT/s (OC)', pcieVersion: 'PCIe 5.0', lan: '5GbE' },
    offers: [
      A('B0DFNPK2MX'),
      { store: 'microless', url: 'https://saudi.microless.com/product/asrock-x870e-taichi-lite-am5-e-atx-motherboard-amd-x870e-chipset-4x-ddr5-dimm-slots-up-to-256gb-max-memory-2x-pcie-gen5-x16-slots-4x-m-2-slots-wifi-bt-connectivity-90-mxbpa0-a0uayz/', inStock: false, key: '90-mxbpa0-a0uayz' },
      { store: 'cazasouq', url: 'https://www.cazasouq.com/product/asrock-x870e-taichi-lite-ddr5-e-atx-motherboard', inStock: false, key: 'asrock-x870e-taichi-lite-ddr5-e-atx-motherboard' },
    ],
    description: `### ASRock X870E Taichi Lite

النسخة الهادئة الشكل من Taichi، لوحة ASRock الأعلى لمنصّة AM5: نفس العتاد الكهربائيّ والمنافذ بدون الزخرفة والإضاءة، وبسعرٍ أقلّ. لمعالجات Ryzen 9 مثل 9950X و9950X3D، ولمن يبي لوحة لا يضيق بها شيء لسنين.

**التقنيات الأساسية المدعومة:**

[green]تغذية 24+2+1 طوراً بقدرة 110 أمبير:[/green] من أقوى دوائر الطاقة في لوحات AM5، فتشغّل أقوى معالجات Ryzen تحت الحمل الكامل وكسر السرعة بدون اختناقٍ حراريّ في الدائرة.

[green]منفذا USB4 بسرعة 40 جيجابت/ث:[/green] في الخلف، لأقراص خارجيّة سريعة وشاشات ومحطّات توصيل، ومعهما USB-C أماميّ بسرعة 20 جيجابت/ث.

[green]أربع فتحات M.2:[/green] واحدة PCIe 5.0 وثلاث PCIe 4.0، بمشتّت حراريّ متعدّد الطبقات يُركّب بلا أدوات، ومعها ستّة منافذ SATA.

[green]شبكة 5 جيجابت وWi-Fi 7:[/green] منفذ إيثرنت 5GbE من Realtek، ولاسلكيّ Wi-Fi 7 مع Bluetooth 5.4.

[green]فتحتا PCIe 5.0 x16:[/green] تعملان x16 أو x8/x8، مع صوتٍ من Realtek ALC4082 ومحوّل ESS SABRE، وزرّ تحديث BIOS بلا معالج.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **مقاسها E-ATX (30.5 × 26.7 سم):** أعرض من ATX بنحو 2.3 سم، فتأكّد أنّ كيسك يقبل E-ATX — أغلب صناديق Mid Tower الحديثة تقبلها.
* سرعة 8200 للذاكرة رقم كسر سرعة؛ الواقعيّ مع أغلب المعالجات DDR5-6000 إلى 6400.
* متوفّرة اليوم في أمازون وحده بكمّيةٍ قليلة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تدعم معالجات AM4 ولا ذاكرة DDR4.

${alt('GAMINGPLUS', 'لوحة X870E بمقاس ATX عاديّ وبنصف السعر تقريباً، إن كان معالجك Ryzen 5 أو 7 ولا تحتاج USB4 ولا 5GbE.')}
https://www.asrock.com/mb/AMD/X870E%20Taichi%20Lite/index.asp`,
  },
  // ---------------------------------------------------------------- ③
  {
    category: 'GPU', brand: 'Gigabyte', name: 'GeForce RTX 5060 EAGLE OC ICE 8G White',
    imageUrl: 'https://m.media-amazon.com/images/I/71HWoRXkLtL._AC_SL1500_.jpg',
    tdpWattage: 145, performanceTier: 2,
    specs: { vram: '8GB', ports: '1x HDMI 2.1b, 3x DP 2.1b', lengthMm: '208', interface: 'PCIe 5.0 x8', memoryBus: '128-bit', memoryType: 'GDDR7', architecture: 'Blackwell', powerConnectors: '1x 8-pin', boostClock: '2550 MHz' },
    offers: [
      A('B0F6NP452Y'),
      { store: 'cazasouq', url: 'https://www.cazasouq.com/product/gigabyte-geforce-rtx-5060-eagle-oc-ice-8gb-gddr7-gpu-white', inStock: false, key: 'gigabyte-geforce-rtx-5060-eagle-oc-ice-8gb-gddr7-gpu-white' },
    ],
    description: `### Gigabyte GeForce RTX 5060 EAGLE OC ICE 8G (أبيض)

نسخة Gigabyte البيضاء من RTX 5060 (GV-N5060EAGLEOC ICE-8GD): كرتٌ قصير بمروحتين يناسب تجميعات الألعاب البيضاء في 1080p. لمن يبي كرتاً حديثاً بميزانيّة محدودة ولون يطابق كيسه.

**التقنيات الأساسية المدعومة:**

[green]أداء 1080p ممتاز:[/green] شريحة RTX 5060 تعطي قرابة 88 إطاراً في 1080p بإعدادات Ultra في متوسّط اختبارات Tom's Hardware، وتبقى فوق 60 في أغلب الألعاب الثقيلة.

[green]DLSS 4 وتوليد الإطارات المتعدّد:[/green] ميزة كروت RTX 50 وحدها؛ ترفع الإطارات أضعافاً في الألعاب الداعمة، وهي ما يجعل 1440p ممكناً على هذا الكرت.

[green]قصير ونحيف:[/green] طوله 208 مم وسماكته فتحتان، فيدخل أغلب الصناديق الصغيرة وMicro-ATX بلا حساب.

[green]موصّل 8-pin واحد ومزوّد 550 واط:[/green] بلا محوّل 16-pin، ويكفيه مزوّدٌ متوسّط — فلا تحتاج ترقية المزوّد غالباً.

[green]تردّد مرفوع من المصنع:[/green] 2550 ميجاهرتز بدل 2497 في المرجعيّ، مع ذاكرة GDDR7 بسرعة 28 جيجابت/ث.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **ذاكرته 8 جيجابايت:** بعض الألعاب الحديثة تطلب أكثر بإعدادات النسيج العالية، فقد تحتاج تخفيضها درجة.
* في 1440p بلا DLSS ينزل إلى قرابة 60 إطاراً.
* يعمل على PCIe 5.0 x8 — على لوحات PCIe 3.0 القديمة يخسر قليلاً من أدائه.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس كرت 4K: قرابة 22 إطاراً فقط بإعدادات Ultra.

${alt('TI16', 'ضعف الذاكرة (16 جيجابايت) وأداءٌ أعلى، إن كانت ميزانيّتك تسمح وتبي كرتاً يصمد سنين أكثر.')}
https://www.gigabyte.com/Graphics-Card/GV-N5060EAGLEOC-ICE-8GD`,
  },
  // ---------------------------------------------------------------- ④
  {
    category: 'Cooler', brand: 'MAJESTY', name: 'CLL-401 360 ARGB LCD',
    imageUrl: 'https://m.media-amazon.com/images/I/61f2A-PXc9L._SL1500_.jpg',
    tdpWattage: 0, performanceTier: 3,
    specs: { rgb: 'Yes', type: 'AIO', color: 'Black', sizeMm: '360', fanSize: '120mm', sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X', fanCount: '3', features: ['شاشة IPS مقاس 3.9 بوصة تعرض فيديو وصوراً وحرارة المعالج'] },
    offers: [A('B0FQ8TQ745')],
    description: `### MAJESTY CLL-401 360 ARGB LCD

مبرّد مائيّ 360 مم من ماجيستي بشاشة IPS كبيرة مقاسها 3.9 بوصة فوق المضخّة، تعرض فيديو أو صورة أو حرارة المعالج. لمن يبي شاشة على المبرّد بسعر مبرّدٍ عاديّ، مع ${WARRANTY2}.

**التقنيات الأساسية المدعومة:**

[green]شاشة 3.9 بوصة:[/green] أكبر من شاشات أغلب المبرّدات (2.1–2.8 بوصة عند غيره)، تعرض مقاطع وصوراً تختارها أو قراءة الحرارة، فتصير المضخّة قطعة عرضٍ في التجميعة.

[green]رادييتر 360 مم بثلاث مراوح:[/green] مراوح 120 مم بسرعة 600–1800 دورة وتدفّق 49 قدماً مكعّباً للمروحة، تكفي معالجات الألعاب الحاليّة مثل Ryzen 7 وCore i7.

[green]المراوح الثلاث في بلوك واحد:[/green] تركيبها قطعة واحدة بسلكٍ واحد، فالتركيب أسرع والكابلات أقلّ.

[green]مضخّة بمحمل سيراميك:[/green] بسرعة 2550 دورة وعمرٍ تقدّره الشركة بـ40 ألف ساعة، وأنابيب مجدولة بطول 440 مم.

[green]إضاءة ARGB تتزامن مع اللوحة:[/green] تُدار من Aura Sync وMystic Light وRGB Fusion عبر منفذ 5V ثلاثيّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **${LOCAL}:** لا نعرف كيف يقارن تبريده بمبرّدات 360 المختبَرة.
* الشركة تذكر LGA1700 ولا تذكر LGA1851، لكنّ معالجات Core Ultra بنفس فتحات التثبيت.
* الشاشة تحتاج منفذ USB داخلياً فارغاً في اللوحة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس مبرّداً صامتاً: الشركة تذكر 36.9 ديسيبل للمضخّة.

${alt('AQUA360', 'مبرّد 360 أرخص بأداءٍ مختبَر مستقلّاً، إن كانت الشاشة لا تهمّك.')}
https://majestytechnology.com/product/مبرد-مائي-ماجيستي-360mm-argb-شاشة-ips-lcd،-ثلاث-مرا/`,
  },
  // ---------------------------------------------------------------- ⑤
  {
    category: 'PSU', brand: 'MAJESTY', name: 'MPS700-S 700W',
    imageUrl: 'https://m.media-amazon.com/images/I/71c+sts3tGL._AC_SL1500_.jpg',
    tdpWattage: 0, performanceTier: 1,
    specs: { color: 'Black', rating: '80+ Standard', wattage: '700', formFactor: 'ATX', modularity: 'Non-Modular' },
    offers: [A('B0GSRD9PB7')],
    description: `### MAJESTY MPS700-S 700W

مزوّد طاقة اقتصاديّ من ماجيستي بقدرة 700 واط وشهادة 80 Plus الأساسيّة، بكابلاتٍ ثابتة. لتجميعات المكتب والألعاب الخفيفة بكرتٍ متوسّط، ولمن يبي ضمان ثلاث سنوات مع تبديلٍ فوريّ من فروع ماجيستي في السعوديّة.

**التقنيات الأساسية المدعومة:**

[green]سعرٌ منخفض جداً:[/green] من أرخص مزوّدات 700 واط في السوق، فيترك ميزانيّتك للكرت والمعالج.

[green]ضمان ثلاث سنوات بتبديلٍ فوريّ:[/green] تأخذه لأيّ فرع من فروع ماجيستي في المملكة، بدون شحنٍ للخارج ولا انتظار.

[green]مكثّفات تتحمّل 105 درجات:[/green] تصمد أطول في حرارة الصيف داخل الكيس من مكثّفات 85 درجة الشائعة في هذه الفئة.

[green]مروحة 120 مم بمحمل سائل:[/green] أهدأ وأطول عمراً من المحامل العاديّة.

[green]حمايات أساسيّة:[/green] من ارتفاع الجهد وانخفاضه، والحمل الزائد، والقصر الكهربائيّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **كفاءة 80 Plus الأساسيّة (حتى 84%):** أقلّ من Bronze وGold، فحرارته أعلى واستهلاكه أكثر قليلاً.
* ليس في قائمة SPL لتصنيف المزوّدات ولا اختبارات كهربائيّة مستقلّة له، فالأحوط ألّا تحمّله كرتاً قويّاً — يناسب كروتاً مثل RTX 5060 وRX 9060 XT.
* الشركة لم تذكر معيار ATX 3 ولا موصّل 12V-2x6.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* الكابلات ثابتة كلّها (غير معياريّ)، فترتيبها داخل الكيس أصعب.

${alt('PL750D', 'مزوّد Bronze بتصنيف SPL معروف (C) بفرقٍ صغير في السعر.')}
https://majestytechnology.com/product/باور-سبلاي-700-واط-غير-معياري-كفاءة-80/`,
  },
  // ---------------------------------------------------------------- ⑥
  {
    category: 'PSU', brand: 'MAJESTY', name: 'MPS850-G 850W Gold White',
    imageUrl: 'https://m.media-amazon.com/images/I/61TSxRSs2-L._AC_SL1500_.jpg',
    tdpWattage: 0, performanceTier: 3,
    specs: { color: 'White', rating: '80+ Gold', wattage: '850', formFactor: 'ATX 3.1', modularity: 'Full' },
    offers: [A('B0G3XSXMTQ'), RZ('مزود-الطاقه-ماجستي-850-واط-ذهبي-ماجيستي-معياري-بالكامل-atx-31-وpcie-51-يدعم-rtx-50-مكثفات-يابانية-105-كفاءة-80-gold')],
    description: `### MAJESTY MPS850-G 850W Gold (أبيض)

مزوّد ماجيستي الأبيض بقدرة 850 واط وشهادة 80 Plus Gold، معياريّ بالكامل وجاهز لكروت RTX 50 بكابل 12V-2x6 أصليّ. لتجميعات الألعاب البيضاء المتوسّطة والعالية، مع أطول ضمانٍ في فئته.

**التقنيات الأساسية المدعومة:**

[green]ضمان عشر سنوات بتبديلٍ فوريّ:[/green] من أيّ فرعٍ لماجيستي في السعوديّة — أطول من ضمان أغلب المزوّدات العالميّة في نفس السعر.

[green]ATX 3.1 وكابل 12V-2x6 أصليّ:[/green] يوصل كروت RTX 5070 Ti و5080 مباشرة بلا محوّل، ويتحمّل قفزات الطاقة القصيرة في الكروت الحديثة.

[green]كفاءة 80 Plus Gold:[/green] حرارة أقلّ داخل الكيس وكهرباء أقلّ مهدورة من مزوّدات Bronze.

[green]معياريّ بالكامل وأبيض:[/green] تركّب الكابلات التي تحتاجها فقط، فالكيس أنظف والهواء يمرّ أفضل — ولونه يطابق التجميعات البيضاء.

[green]مكثّفات يابانيّة 105 درجات ومروحة بمحمل سائل:[/green] مع دعم Modern Standby وحمايات من ارتفاع الجهد وانخفاضه والحمل الزائد والقصر.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **ليس في قائمة SPL ولا اختبارات كهربائيّة مستقلّة له:** الضمان الطويل يطمّن، لكن جودة التنظيم والتموّج غير مقيسة.
* الحمايات المذكورة أربع؛ الشركة لم تذكر الحماية من الحرارة (OTP) ولا من التيّار الزائد (OCP).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* الشركة لم تذكر وضع إيقاف المروحة في الحمل الخفيف (Zero RPM).

${alt('UD850', 'مزوّد 850 Gold أسود بتصنيف SPL معروف (C+) وبسعرٍ قريب.')}
https://majestytechnology.com/product/مزود-طاقة-من-ماجيستي-باور-سبلاي-850-واط-ذه-2/`,
  },
  // ---------------------------------------------------------------- ⑦
  {
    category: 'Case', brand: 'MAJESTY', name: 'Mavera Pro Black',
    imageUrl: 'https://m.media-amazon.com/images/I/71dilouxxRL._AC_SL1500_.jpg',
    tdpWattage: 0, performanceTier: 3,
    specs: {
      color: 'Black', formFactor: 'Mid Tower', includedFans: '7 × 120mm ARGB', maxGpuLength: '400', maxCoolerHeight: '155',
      radiatorSupport: '360mm', psuFormFactor: 'ATX',
      features: ['زجاج مقسّى بانوراميّ', 'يدعم لوحات Back-Connect', 'مراوح «بلوك» تجمع ثلاثاً بسلكٍ واحد', 'USB-C أماميّ بسرعة 20Gbps'],
      notes: [PSU_NOTE],
    },
    offers: [A('B0DJJTZ69D'), RZ('صندوق-كمبيوتر-majesty-mavera-pro-mid-tower-7-fans-argb-باللون-الأسود')],
    description: `### MAJESTY Mavera Pro (أسود)

النسخة المطوّرة من صندوق Mavera من ماجيستي (CASE-300): Mid Tower أوسع بزجاجٍ بانوراميّ وسبع مراوح ARGB مركّبة، ومكانٌ لرادييتر 360 في السقف والواجهة والأرضيّة. لمن يبي صندوقاً جاهزاً للتبريد المائيّ الكبير، مع ${WARRANTY2}.

**التقنيات الأساسية المدعومة:**

[green]سبع مراوح ARGB مقاس 120 مم مركّبة:[/green] تبريد كامل من أوّل يوم، بلا شراء مراوح إضافيّة.

[green]رادييتر 360 في ثلاثة أماكن:[/green] السقف (360/280/240) والواجهة (360/240) والأرضيّة (360/280/240) — مرونةٌ نادرة في صناديق هذا السعر، تسمح بمبرّدٍ مائيّ للمعالج وآخر للكرت.

[green]يدعم لوحات Back-Connect:[/green] مثل ASUS BTF وMSI Project Zero، فتختفي الكابلات من واجهة التجميعة، ويقبل ATX وMicro-ATX وMini-ITX.

[green]USB-C أماميّ بسرعة 20 جيجابت/ث:[/green] مع USB 3.0 ومنفذ صوت، وفلاتر غبار.

[green]مكان لخمسة أقراص:[/green] ثلاثة 2.5 بوصة واثنان 3.5 بوصة، لمن عنده أقراص تخزين كبيرة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **سقف المبرّد الهوائيّ 155 مم:** الشركة تذكر 155 وأمازون 157 — والأبراج المزدوجة الكبيرة لن تدخل؛ خطّط لمبرّدٍ مائيّ.
* طول الكرت: أمازون 400 مم والشركة 420 — اعتمدنا 400 احتياطاً.
* ${LOCAL}، ومقاس المزوّد لم تذكره الشركة (ATX مستنتجاً).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة فيه — نسخة «Mavera Pro» بشاشة 9.12 بوصة منتجٌ آخر.

${alt('XSPACE', 'نفس المراوح السبع والزجاج البانوراميّ بسعرٍ أقلّ قليلاً، إن كان رادييتر واحد يكفيك.')}
https://majestytechnology.com/product/mid-mavera-pro-black-mid-tower-7/`,
  },
  // ---------------------------------------------------------------- ⑧
  {
    category: 'Case', brand: 'MAJESTY', name: 'Orion White',
    imageUrl: 'https://m.media-amazon.com/images/I/81aRLdylG1L._AC_SL1500_.jpg',
    tdpWattage: 0, performanceTier: 3,
    specs: {
      color: 'White', formFactor: 'Mid Tower', includedFans: '7 × 120mm ARGB', maxGpuLength: '410', maxCoolerHeight: '158',
      radiatorSupport: '360mm', psuFormFactor: 'ATX',
      features: ['زجاج مقسّى في الواجهة والجانب', 'إضاءة RGB محيطيّة أعلى الصندوق وأسفله', 'يدعم لوحات Back-Connect', 'USB-C أماميّ بسرعة 20Gbps'],
      notes: [PSU_NOTE],
    },
    offers: [A('B0GKVKY236')],
    description: `### MAJESTY Orion (أبيض)

صندوق Mid Tower أبيض من ماجيستي (CASE-211) بزجاجٍ في الواجهة والجانب، وإضاءة RGB محيطيّة فوق الصندوق وتحته تنعكس على المكتب. لمن يبي تجميعة بيضاء مضيئة بشكلٍ مختلف عن الصناديق المعتادة، مع ${WARRANTY2}.

**التقنيات الأساسية المدعومة:**

[green]إضاءة محيطيّة علويّة وسفليّة:[/green] خطّا إضاءة يرسمان وهجاً حول الصندوق على سطح المكتب، إضافةً لإضاءة المراوح — أوضح ما يميّزه في الغرف المعتمة.

[green]سبع مراوح ARGB مركّبة:[/green] ثلاث في السقف وثلاث في الجانب وواحدة في الخلف، فالهواء يدخل من الجانب مباشرة على الكرت.

[green]رادييتر 360 في السقف وآخر في الجانب:[/green] يتّسع لمبرّدين مائيّين كاملين في وقتٍ واحد.

[green]يدعم لوحات Back-Connect:[/green] ATX وMicro-ATX وMini-ITX، مع كرت حتى 410 مم.

[green]USB-C أماميّ بسرعة 20 جيجابت/ث:[/green] مع منفذَي USB 3.0 وصوت، وفلاتر غبار علويّة وسفليّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **سقف المبرّد الهوائيّ 158 مم** (حسب أمازون؛ الشركة لم تذكره) — الأبراج المزدوجة الكبيرة لن تدخل.
* مكان الأقراص محدود: قرص 2.5 واثنان 3.5، أو ثلاثة 2.5 وواحد 3.5.
* ${LOCAL}، ومقاس المزوّد لم تذكره الشركة (ATX مستنتجاً).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مراوح في الواجهة: الواجهة زجاج، والهواء يدخل من الجانب.

${alt('L217INFW', 'صندوق أبيض من ماركةٍ معروفة الاختبارات بسعرٍ قريب — لكن بثلاث مراوح بدل سبع.')}
https://majestytechnology.com/product/كيس-ألعاب-ماجيستي-اوريون/`,
  },
  // ---------------------------------------------------------------- ⑨
  {
    category: 'Case', brand: 'MAJESTY', name: 'Boulevard White',
    imageUrl: 'https://m.media-amazon.com/images/I/71giwuluoLL._AC_SL1500_.jpg',
    tdpWattage: 0, performanceTier: 3,
    specs: {
      color: 'White', formFactor: 'Mid Tower', includedFans: '7 × 120mm ARGB', maxGpuLength: '410', maxCoolerHeight: '166',
      radiatorSupport: '360mm', psuFormFactor: 'ATX',
      features: ['خطّ إضاءة ARGB أماميّ متزامن مع المراوح', 'جهاز تحكّم بالإضاءة (ريموت)', 'يدعم لوحات Back-Connect'],
      notes: [PSU_NOTE],
    },
    offers: [A('B0FGDWCSBY')],
    description: `### MAJESTY Boulevard (أبيض)

صندوق Mid Tower أبيض من ماجيستي (CASE-009) بخطّ إضاءة أماميّ يتزامن مع سبع مراوح ARGB، وريموت لتغيير الإضاءة. الأرخص بين صناديق ماجيستي البيضاء ذات المراوح السبع، مع ${WARRANTY2}.

**التقنيات الأساسية المدعومة:**

[green]سبع مراوح ARGB مركّبة:[/green] ثلاث في الواجهة وثلاث في الأرضيّة تدفع الهواء البارد للكرت، وواحدة في الخلف تُخرجه.

[green]أعلى سقف مبرّد هوائيّ بين صناديق ماجيستي:[/green] 166 مم حسب أمازون، فتدخل أغلب أبراج التبريد الأحاديّة الكبيرة.

[green]كرت حتى 410 مم ورادييتر 360 في الواجهة:[/green] يتّسع لأطول الكروت الحاليّة ولمبرّدٍ مائيّ كبير.

[green]إضاءة أماميّة بريموت أو من اللوحة:[/green] تتحكّم بها بالريموت المرفق، أو تربطها بـAura Sync وMystic Light وRGB Fusion.

[green]يدعم لوحات Back-Connect:[/green] ATX وMicro-ATX وMini-ITX، مع فلاتر غبار تُفكّ للتنظيف.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **المنافذ الأماميّة غير محسومة:** أمازون يذكر USB-C ومنفذَي USB 3.0، وصفحة الشركة تذكر USB 3.0 وUSB 2.0 بلا USB-C — تأكّد من الصور قبل الشراء إن كان USB-C يهمّك.
* الرادييتر 360 في الواجهة فقط حسب الشركة.
* ${LOCAL}، ومقاس المزوّد لم تذكره الشركة (ATX مستنتجاً).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رادييتر في السقف — للمبرّد المائيّ مكانٌ واحد.

${alt('L217INFW', 'صندوق أبيض من ماركةٍ معروفة الاختبارات — لكن بثلاث مراوح بدل سبع وبسعرٍ أعلى قليلاً.')}
https://majestytechnology.com/product/كيس-ألعاب-ماجيستي-بوليفارد/`,
  },
  // ---------------------------------------------------------------- ⑩
  {
    category: 'Case', brand: 'MAJESTY', name: 'X-Space Plus Black',
    imageUrl: 'https://majestytechnology.com/wp-content/uploads/2026/01/0-1.webp',
    tdpWattage: 0, performanceTier: 3,
    specs: {
      color: 'Black', formFactor: 'Mid Tower', includedFans: '7 × 120mm ARGB', maxGpuLength: '400',
      radiatorSupport: '360mm', psuFormFactor: 'ATX',
      features: ['إضاءة RGB محيطيّة أسفل الصندوق', 'جهاز تحكّم بالإضاءة (ريموت)'],
      notes: [PSU_NOTE, 'أقصى ارتفاع للمبرّد الهوائيّ لم تذكره الشركة.'],
    },
    offers: [RZ('صندوق-كمبيوتر-majesty-x-space-plus-mid-tower-ابيض-1')],
    description: `### MAJESTY X-Space Plus (أسود)

النسخة المطوّرة من X-Space (CASE-208): نفس الصندوق بسبع مراوح ARGB، ومعه إضاءة RGB محيطيّة أسفل الصندوق تنعكس على المكتب. لمن أعجبه X-Space ويبي لمسة إضاءةٍ إضافيّة، مع ${WARRANTY2}.

**التقنيات الأساسية المدعومة:**

[green]إضاءة سفليّة محيطيّة:[/green] وهجٌ تحت الصندوق يضيء سطح المكتب، يعطي التجميعة حضوراً في الإضاءة الخافتة.

[green]سبع مراوح ARGB مقاس 120 مم:[/green] تبريد كامل من أوّل يوم، وتتحكّم بإضاءتها بالريموت المرفق أو من برنامج اللوحة.

[green]كرت حتى 400 مم ورادييتر 360:[/green] يتّسع لأغلب الكروت الثلاثيّة الطويلة ولمبرّدٍ مائيّ كبير.

[green]منافذ أماميّة حديثة:[/green] USB-C ومنفذا USB 3.0 ومنفذ صوت.

[green]تتزامن مع اللوحة الأمّ:[/green] Aura Sync وMystic Light وRGB Fusion، للتحكّم بالإضاءة وسرعة المراوح.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **سقف المبرّد الهوائيّ غير منشور:** أخوه X-Space يقبل 157 مم — خطّط لمبرّدٍ مائيّ أو برجٍ متوسّط.
* الشركة تذكر لوحات ATX وMicro-ATX فقط، ولا تذكر Back-Connect.
* متوفّر اليوم في ريد زون وحده (499)، ومتجر الشركة نافد.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ${LOCAL}.

${alt('XSPACE', 'الصندوق نفسه بلا الإضاءة السفليّة، بسعرٍ أقلّ ومتوفّر في أكثر من متجر.')}
https://majestytechnology.com/product/كيس-ألعاب-ماجيستي-إكس-سبيس-بلس-2/`,
  },
];

/* روابط ماجيستي عربيّة — تُحفظ مرمّزة (%D9…) كي لا يقطعها مكتشف الروابط عند الفاصلة العربيّة «،» */
for (const P of PARTS) {
  const lines = P.description.trimEnd().split('\n');
  lines[lines.length - 1] = encodeURI(decodeURI(lines[lines.length - 1]));
  P.description = lines.join('\n');
}

// ---------------------------------------------------------------- الفحص
const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
const cats = Object.fromEntries((await prisma.category.findMany({ select: { id: true, name: true } })).map((c) => [c.name, c.id]));
let bad = false;
const stop = (m) => { console.log('⛔ ' + m); bad = true; };

for (const [, id] of Object.values(ALT)) if (!(await prisma.component.findUnique({ where: { id }, select: { id: true } }))) stop(`رابط البديل مفقود: ${id}`);
for (const P of PARTS) {
  if (!cats[P.category]) stop(`فئة غير معروفة: ${P.category}`);
  const dup = await prisma.component.findFirst({ where: { brand: { equals: P.brand, mode: 'insensitive' }, name: { equals: P.name, mode: 'insensitive' } } });
  if (dup) stop(`موجودة: ${P.brand} ${P.name} → ${dup.id}`);
  if (/\*\*\[(yellow|red|green)\]/.test(P.description)) stop(`${P.name}: نجوم حول وسم`);
  if (!P.description.trim().split('\n').pop().startsWith('https://')) stop(`${P.name}: الرابط ليس السطر الأخير`);
  if (!P.description.startsWith('### ')) stop(`${P.name}: بلا عنوان`);
  for (const o of P.offers) {
    if (!stores[o.store]) stop(`متجر غير معروف: ${o.store}`);
    const t = await prisma.componentOffer.findFirst({ where: { url: { contains: o.key, mode: 'insensitive' } }, select: { component: { select: { brand: true, name: true } } } });
    if (t) stop(`${o.store}: الرابط مستعمل في ${t.component.brand} ${t.component.name}`);
  }
  console.log(`✚ ${P.category} · ${P.brand} ${P.name}\n  ${P.offers.map((o) => o.store + (o.inStock ? '' : ' (نافد)')).join(' + ')} · وصف ${P.description.length} حرفاً`);
}

if (bad || !apply) { console.log(bad ? '⛔ متوقّف' : '(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(bad ? 1 : 0); }

// ---------------------------------------------------------------- التنفيذ
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/visitor-requests-${stamp}.json`, JSON.stringify({ PARTS }, null, 2));

const ids = [];
for (const P of PARTS) {
  const { offers, category, ...data } = P;
  const c = await prisma.component.create({ data: { ...data, categoryId: cats[category], price: 0 } });
  for (const o of offers) {
    await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: o.inStock } });
  }
  ids.push(c.id);
  console.log(`✔ ${P.brand} ${P.name} → ${c.id}`);
}

console.log(`\nنسخة: backups/visitor-requests-${stamp}.json\nالتالي: npx tsx scripts/scrape-one.ts ${ids.join(' ')}`);
await prisma.$disconnect();
