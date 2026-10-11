/**
 * ============ الدفعة الحادية عشرة — المجموعة الثانية (٢٠ كيساً من ٤٨) — 2026-10-09 ============
 *
 * تتمّة طلب نوّاف «ضيف مجموعات 20 … وركز على الوصف … والبيانات بعد ركز عليها».
 * المرشّحون من مسح مايكرولس نفسه في الدفعة العاشرة، وكلّهم قُرئت صفحتهم في أمازون
 * (الرمز، زرّ الشراء) وطُوبق ASIN بالقاعدة.
 *
 * البيانات: جدول مواصفات مايكرولس لكلّ كيس، وما نقص منه من صفحات الشركات ومن مراجعين:
 *   H6 RGB+ (وحدتا F360 RGB Reverse + F120 RGB + Control Hub Lite)، LANCOOL 217 INF
 *   (مروحتا 170 + مروحة 140)، View 270 Plus (مروحتان جانبيّتان + خلفيّة)، S380 (SF360
 *   + SF120)، CTE C750 (كرت 420 بلا رادييتر/370 معه، مبرّد 190)، FRAME 4500X (كرت 460).
 *   ⚠️ TR300: مايكرولس يذكر 410 مم «بمزوّد ≤160 مم» وفي عنوانه 365 — سُجّل 365 (الآمن).
 *
 *   node scripts/add-batch11-2026-10-09.mjs           # عرض
 *   node scripts/add-batch11-2026-10-09.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const CASE = 'cmpfziquj0006x4ym53f0ehcw';

const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });
const M = (slug) => ({ store: 'microless', url: `https://saudi.microless.com/product/${slug}/` });

const ALT = {
  H6B: ['NZXT H6 Compact Black', 'cmv1edw9y001id0ym4ddjgqkv'],
  H6W: ['NZXT H6 Compact White', 'cmtjkyoi3000u70yms91tejjt'],
  O11VCB: ['Lian Li O11 Vision Compact Black', 'cmv0io7l700000symau5sst8e'],
  FRAME4000W: ['Corsair FRAME 4000D RS ARGB White', 'cmv1edwpe001ld0ym4lxql8zj'],
  L217W: ['Lian Li LANCOOL 217 White', 'cmuztrtwp0003kcymfw9vt8ir'],
  V100R: ['Lian Li Vector V100R', 'cmuzoq31v0016noymtjvksnlv'],
  B4WB: ['Lian Li B4-mATX Wood Black', 'cmuztrvm1000nkcymuew6fjjb'],
  MESH3B: ['Fractal Design Meshify 3 Black', 'cmuzymsnd000wwwympdu7cegb'],
  C4000D: ['Corsair 4000D Airflow', 'cmpieb39w000c00ym9n758myw'],
  V380S: ['Thermaltake View 380 WS ARGB Snow', 'cmv0io87x00070symo570nq5q'],
  L216: ['Lian Li LANCOOL 216', 'cmpfzir17000gx4ymtjjn4ag1'],
  C5000D: ['Corsair 5000D Airflow', 'cmpiec081002h00ymnwss7xit'],
  SB800W: ['be quiet! Shadow Base 800 FX (White)', 'cmpiebzcq002e00ymgbk1ipig'],
  TD500: ['Cooler Master TD500 Mesh V2', 'cmpiebxxk002900ym6hzx5w2l'],
  MB600: ['Cooler Master MasterBox 600', 'cmtcr2ilt000xo8ymnugdhs30'],
  A903W: ['Montech AIR 903 BASE White', 'cmtcr2gtk000oo8ym3gsqyofc'],
  O11VM: ['Lian Li O11 Vision-M', 'cmuzoq42n001hnoymuukhc00q'],
};
const alt = (k, ...why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const MOVE = [];
const EXTRA = [];

const PARTS = [
  // ================================================================ NZXT
  {
    categoryId: CASE, brand: 'NZXT', name: 'H6 RGB+ Black', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '390', psuFormFactor: 'ATX', maxCoolerHeight: '165', radiatorSupport: '360mm', includedFans: '6x 120mm RGB Reverse + 1x 120mm RGB', dualChamber: 'Yes', color: 'Black', features: ['يدعم لوحات Back-Connect', 'متحكّم NZXT Control Hub Lite مرفق'] },
    offers: [A('B0GQ9L7QRW'), M('nzxt-h6-rgb-compact-dual-chamber-atx-mid-tower-airflow-case-support-up-to-360mm-radiator-steel-tempered-glass-material-up-to-10-fans-8-pin-connector-rear-connecting-black-cc-h62fb-p1')],
    description: `### NZXT H6 RGB+ Black

كيس H6 الجديد بحجرتين في نسخته الكاملة: يصل بسبع مراوح RGB ومتحكّم NZXT للإضاءة والسرعة، فلا تحتاج شراء أيّ مروحة. يناسب من يريد تجميعة ألعابٍ جاهزة التبريد والإضاءة من أوّل يوم.

**التقنيات الأساسية المدعومة:**

[green]سبع مراوح RGB مرفقة:[/green] وحدتا F360 RGB Reverse (ستّ مراوح بإطارٍ واحد) للإدخال من الجانب والأسفل، ومروحة F120 RGB للإخراج في الخلف. الشفرات المعكوسة تُظهر الوجه المضيء نحو الزجاج.

[green]متحكّم NZXT Control Hub Lite:[/green] يُدير سرعة المراوح وإضاءتها من برنامج NZXT CAM بلا منافذ إضافيّة من اللوحة الأمّ.

[green]حجرتان في 55 لتراً:[/green] المزوّد والكابلات خلف اللوحة، والهواء البارد يصل إلى الكرت مباشرةً من الأسفل.

[green]يقبل لوحات Back-Connect (ATX):[/green] ASUS BTF وMSI Project Zero وGigabyte Stealth، فتختفي الكابلات من الواجهة.

[green]رادييتر 360 مم في السقف، ومبرّد هوائيّ حتى 165 مم:[/green] بسماكة 67 مم للرادييتر مع مراوحه.

[green]منفذ USB-C بسرعة 20 جيجابت (3.2 Gen 2x2):[/green] ومنفذا USB-A.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مراوح NZXT بموصل خاصّ (8 أسنان) تعمل مع متحكّمها، فاستبدالها لاحقاً بمراوح عاديّة يحتاج تغيير التوصيل.
* طول الكرت 390 مم مع مروحة أماميّة 30 مم، وصفحة الدعم تذكر 360 مم. راجع طول الكروت الضخمة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رادييتر في الواجهة أو الجانب، والمكان الوحيد لرادييتر 360 هو السقف.
* لا يقبل لوحات E-ATX.

${alt('H6B', 'الكيس نفسه بلا مراوح، إن كانت عندك مراوح أو تريد اختيارها بنفسك.')}
https://nzxt.com/products/h6-rgb-plus`,
  },
  {
    categoryId: CASE, brand: 'NZXT', name: 'H6 RGB+ White', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '390', psuFormFactor: 'ATX', maxCoolerHeight: '165', radiatorSupport: '360mm', includedFans: '6x 120mm RGB Reverse + 1x 120mm RGB', dualChamber: 'Yes', color: 'White', features: ['يدعم لوحات Back-Connect', 'متحكّم NZXT Control Hub Lite مرفق'] },
    offers: [A('B0GQ9KSV3T'), M('nzxt-h6-rgb-compact-dual-chamber-atx-mid-tower-airflow-case-support-up-to-360mm-radiator-steel-tempered-glass-material-up-to-10-fans-8-pin-connector-rear-connecting-white-cc-h62fw-p1')],
    description: `### NZXT H6 RGB+ White

النسخة البيضاء من كيس H6 الجديد بحجرتين، مع سبع مراوح RGB بيضاء ومتحكّم NZXT. خيارٌ جاهز لتجميعة بيضاء كاملة دون شراء مراوح منفصلة.

**التقنيات الأساسية المدعومة:**

[green]سبع مراوح RGB بيضاء مرفقة:[/green] وحدتا F360 RGB Reverse للإدخال من الجانب والأسفل، ومروحة F120 RGB في الخلف. الشفرات المعكوسة تُظهر الوجه المضيء نحو الزجاج.

[green]متحكّم Control Hub Lite:[/green] السرعة والإضاءة من برنامج NZXT CAM.

[green]حجرتان في حجمٍ مدمج (55 لتراً):[/green] كابلاتٌ مخفيّة ومسار هواءٍ مباشر إلى الكرت.

[green]يقبل لوحات Back-Connect:[/green] للتجميعات البيضاء النظيفة بلا كابلاتٍ ظاهرة.

[green]رادييتر 360 مم في السقف وكرت حتى 390 مم:[/green] ومبرّد هوائيّ حتى 165 مم.

[green]منفذ USB-C بسرعة 20 جيجابت:[/green] ومنفذا USB-A.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المراوح بموصل NZXT الخاصّ، واستبدالها بمراوح عاديّة يحتاج تغيير التوصيل.
* القطع البيضاء الأخرى (المبرّد، الكرت، المزوّد) يجب أن تُختار بيضاء أيضاً ليكتمل الشكل، وهي أغلى عادةً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رادييتر في الواجهة، ولا يقبل لوحات E-ATX.

${alt('H6W', 'الكيس الأبيض نفسه بلا مراوح وبسعرٍ أقلّ.')}
https://nzxt.com/products/h6-rgb-plus`,
  },
  // ================================================================ Corsair
  {
    categoryId: CASE, brand: 'Corsair', name: 'FRAME 4500X RS-R ARGB Black', tdpWattage: 0, performanceTier: 5,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '460', psuFormFactor: 'ATX', maxCoolerHeight: '185', radiatorSupport: '2x 360mm', includedFans: '3x 120mm ARGB Reverse', color: 'Black', features: ['يدعم لوحات Back-Connect', 'يقبل لوحات E-ATX', 'زجاج بانوراميّ منحنٍ من قطعة واحدة'] },
    offers: [A('B0FJ2QMQYC'), M('corsair-frame-4500x-rs-r-argb-panoramic-glass-mid-tower-pc-case-3x-rs-r-argb-pre-installed-fans-up-to-360mm-radiator-10x-120mm-fans-support-dust-filtration-black-cc-9011314-ww')],
    description: `### Corsair FRAME 4500X RS-R ARGB Black

كيس عرضٍ بانوراميّ بزجاجٍ منحنٍ من قطعةٍ واحدة يغطّي الواجهة والجانب، ويتّسع لأضخم القطع: كرت حتى 460 مم ورادييتران 360 مم. يناسب تجميعة عرضٍ رائدة بكرت RTX 5090 وتبريدٍ مائيّ.

**التقنيات الأساسية المدعومة:**

[green]زجاج منحنٍ بلا عمود في الزاوية:[/green] رؤيةٌ كاملة للقطع من الأمام والجانب.

[green]ثلاث مراوح RS120-R ARGB معكوسة الشفرات:[/green] في الأسفل تدفع الهواء البارد نحو الكرت، والوجه المضيء نحو الزجاج.

[green]كرت حتى 460 مم ومبرّد هوائيّ حتى 185 مم:[/green] أرقامٌ تتّسع لأيّ كرتٍ أو مبرّدٍ في السوق، مع ذراعٍ لمنع تقوّس الكرت.

[green]رادييتران 360 مم معاً:[/green] في السقف والجانب، ورادييتر 140 مم في الخلف.

[green]يقبل لوحات Back-Connect ولوحات E-ATX:[/green] حتى مقاس 305 × 277 مم، ومزوّداً بطول 250 مم.

[green]منفذ USB-C بسرعة 10 جيجابت:[/green] ومنفذا USB-A.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الواجهة زجاج بلا مراوح، والهواء يدخل من الأسفل والجانب فقط. يحتاج مراوح إضافيّة في السقف أو الجانب لتجميعةٍ عالية الحرارة.
* وزنه قرابة 14 كجم وحجمه كبير.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رادييتر ولا مراوح في الواجهة.
* ليس كيس تهوية للأداء الصافي. الشكل أولويّته.

${alt('O11VCB', 'كيس عرضٍ بانوراميّ أصغر وأرخص، إن كانت قطعك أصغر.')}
https://www.corsair.com/us/en/p/pc-cases/cc-9011314-ww/frame-4500x-rs-r-argb-panoramic-glass-mid-tower-pc-case-cc-9011314-ww`,
  },
  {
    categoryId: CASE, brand: 'Corsair', name: 'FRAME 4500X RS-R ARGB White', tdpWattage: 0, performanceTier: 5,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '460', psuFormFactor: 'ATX', maxCoolerHeight: '185', radiatorSupport: '2x 360mm', includedFans: '3x 120mm ARGB Reverse', color: 'White', features: ['يدعم لوحات Back-Connect', 'يقبل لوحات E-ATX', 'زجاج بانوراميّ منحنٍ من قطعة واحدة'] },
    offers: [A('B0FJ2PYLFB'), M('corsair-frame-4500x-rs-r-argb-panoramic-glass-mid-tower-pc-case-3x-rs-r-argb-pre-installed-fans-up-to-360mm-radiator-10x-120mm-fans-support-dust-filtration-white-cc-9011315-ww')],
    description: `### Corsair FRAME 4500X RS-R ARGB White

النسخة البيضاء من كيس العرض البانوراميّ FRAME 4500X: زجاجٌ منحنٍ يغطّي الواجهة والجانب، ومساحةٌ لكرت 460 مم ورادييترين 360 مم. مكانه تجميعة عرضٍ بيضاء رائدة.

**التقنيات الأساسية المدعومة:**

[green]زجاج منحنٍ من قطعةٍ واحدة:[/green] بلا عمودٍ في الزاوية الأماميّة، فالقطع ظاهرة كاملة.

[green]ثلاث مراوح RS120-R ARGB بيضاء معكوسة الشفرات:[/green] في الأسفل تدفع الهواء نحو الكرت.

[green]كرت حتى 460 مم ومبرّد هوائيّ حتى 185 مم:[/green] ومعه ذراعٌ لمنع تقوّس الكرت.

[green]رادييتران 360 مم معاً:[/green] في السقف والجانب.

[green]يقبل لوحات Back-Connect ولوحات E-ATX:[/green] ومزوّداً بطول 250 مم.

[green]منفذ USB-C بسرعة 10 جيجابت:[/green] ومنفذا USB-A.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الهواء يدخل من الأسفل والجانب فقط، فتحتاج تجميعةٌ حارّة مراوح إضافيّة.
* حجمه كبير ووزنه قرابة 14 كجم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رادييتر ولا مراوح في الواجهة.

${alt('FRAME4000W', 'كيس Corsair أبيض بواجهة شبكيّة وتهوية أفضل وسعرٍ أقلّ.')}
https://www.corsair.com/us/en/p/pc-cases/cc-9011315-ww/frame-4500x-rs-r-argb-panoramic-glass-mid-tower-pc-case-white-cc-9011315-ww`,
  },
  // ================================================================ Lian Li
  {
    categoryId: CASE, brand: 'Lian Li', name: 'LANCOOL 217 INF White', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '380', psuFormFactor: 'ATX', maxCoolerHeight: '180', radiatorSupport: '360mm', includedFans: '2x 170mm + 1x 140mm ARGB', color: 'White', features: ['يدعم لوحات Back-Connect', 'يقبل لوحات E-ATX', 'موزّع مراوح وإضاءة مدمج'] },
    offers: [A('B0FMDSL7DV'), M('lian-li-lancool-217-inf-mid-tower-pc-case-3x-pre-installed-fans-e-atx-eeb-support-380mm-gpu-clearance-360mm-radiator-top-dual-psu-mount-white-lan217infw')],
    description: `### Lian Li LANCOOL 217 INF White

كيس تهويةٍ بمروحتين أماميّتين بقطر 170 مم، بمحاور مضيئة بتأثير المرآة اللانهائيّة (INF). يجمع تدفّق هواءٍ عالياً بضجيجٍ منخفض وشكلٍ مميّز بالأبيض.

**التقنيات الأساسية المدعومة:**

[green]مروحتان 170 مم في الواجهة:[/green] بسماكة 30 مم ومحامل FDB. المروحة الكبيرة تدفع هواءً أكثر بدورانٍ أبطأ، فالضجيج أقلّ من ثلاث مراوح 120 بالتدفّق نفسه.

[green]مروحة 140 مم في الخلف:[/green] والثلاث بإضاءة INF، أي محورٌ بتأثير المرآة اللانهائيّة.

[green]موزّع مدمج للمراوح والإضاءة:[/green] ثلاثة منافذ للمراوح ومنفذ ARGB، يُتحكّم بها من أزرار الكيس أو من اللوحة الأمّ.

[green]يقبل لوحات Back-Connect (ATX وMicro-ATX):[/green] ولوحات E-ATX وSSI-EEB.

[green]مبرّد هوائيّ حتى 180 مم ورادييتر 360 مم في السقف:[/green] ومزوّد حتى 220 مم.

[green]منفذ USB-C:[/green] ومنفذا USB 3.0.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* طول الكرت حتى 380 مم، وهو أقلّ من كيساتٍ منافسة. بعض كروت RTX 5090 الضخمة تتجاوزه.
* الرادييتر في السقف فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رادييتر في الواجهة، فالمروحتان 170 مم لا تُستبدلان برادييتر.

${alt('L217W', 'النسخة العاديّة من LANCOOL 217 الأبيض بلا إضاءة INF وبسعرٍ أقلّ.')}
https://lian-li.com/product/lancool-217-inf/`,
  },
  {
    categoryId: CASE, brand: 'Lian Li', name: 'Vector V100 White', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '420', psuFormFactor: 'ATX', maxCoolerHeight: '178', radiatorSupport: '360mm', includedFans: '4x 120mm ARGB', color: 'White', features: ['يدعم لوحات Back-Connect'] },
    offers: [A('B0F2T9777V'), M('lian-li-vector-v100-mid-tower-computer-case-4x-120mm-pre-installed-fan-up-to-360mm-radiator-7x-120mm-fan-support-4mm-tempered-glass-steel-plastic-materials-white-v100rw')],
    description: `### Lian Li Vector V100 White

كيسٌ أبيض اقتصاديّ بأربع مراوح ARGB وزجاجٍ في الواجهة والجانب، ومساحةٍ لكروتٍ حتى 420 مم. خيارٌ قويّ لتجميعة بيضاء متوسّطة الميزانيّة.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح 120 مم ARGB بتحكّم PWM:[/green] ثلاث في الجانب للإدخال وواحدة في الخلف، فالكيس يعمل جيّداً من دون شراء مراوح.

[green]كرت حتى 420 مم:[/green] رقمٌ مرتفع لكيسٍ بهذا السعر، يتّسع لأغلب كروت RTX 5080 و5090.

[green]مبرّد هوائيّ حتى 178 مم ورادييتر 360 مم في السقف.[/green]

[green]يقبل لوحات Back-Connect (ATX وMicro-ATX):[/green] للتجميعات النظيفة بلا كابلاتٍ ظاهرة.

[green]منفذ USB-C (3.1):[/green] ومنفذا USB 3.0.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* خانة قرصٍ واحدة 2.5 بوصة خلف اللوحة وخانة 3.5 بوصة في الأسفل، أي مساحة أقراصٍ محدودة.
* الواجهة زجاج، والهواء يدخل من الجانب فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رادييتر في الواجهة أو الجانب.

${alt('V100R', 'الكيس نفسه بالأسود.')}
https://lian-li.com/product/vector-v100/`,
  },
  {
    categoryId: CASE, brand: 'Lian Li', name: 'B4-mATX Mesh Black', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Micro-ATX Tower', maxGpuLength: '358', psuFormFactor: 'ATX / SFX', maxCoolerHeight: '162', radiatorSupport: '360mm', includedFans: '2x 120mm Slim', color: 'Black', features: ['يقبل مزوّد SFX'] },
    offers: [A('B0H6PW5CPC'), M('lian-li-b4-matx-mesh-computer-case-2x-120mm-pre-installed-fans-supports-360mm-radiator-140mm-atx-psu-steel-material-magnetic-filter-black-b4x')],
    description: `### Lian Li B4-mATX Mesh Black

كيسٌ صغير بارتفاع 288 مم فقط للوحات Micro-ATX وMini-ITX، بألواحٍ شبكيّة للتهوية. يناسب جهاز ألعابٍ صغيراً على المكتب دون التنازل عن كرتٍ كامل الحجم.

**التقنيات الأساسية المدعومة:**

[green]حجمٌ مدمج (420 × 191 × 288 مم):[/green] يجلس على المكتب بجانب الشاشة.

[green]كرت حتى 358 مم:[/green] يتّسع لأغلب كروت RTX 5070 و5070 Ti وRX 9070.

[green]رادييتر 360 مم في الجانب مع مزوّد SFX:[/green] أو 240 مم مع مزوّد ATX.

[green]يقبل مزوّد ATX حتى 140 مم أو SFX.[/green]

[green]مروحتان نحيفتان 120 مم (15 مم) في السقف:[/green] للإخراج دون أن تزاحما المبرّد.

[green]منفذ USB-C:[/green] ومنفذا USB-A.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هوائيّ حتى 162 مم فقط (168 مم بلا حامل المروحة الجانبيّة).
* مزوّد ATX محدود بطول 140 مم، وأغلب المزوّدات الكبيرة أطول. تأكّد من الطول قبل الشراء.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات ATX، ولا لوحات Back-Connect.

${alt('B4WB', 'الكيس نفسه بواجهةٍ خشبيّة سوداء.')}
https://lian-li.com/product/b4-matx/`,
  },
  {
    categoryId: CASE, brand: 'Lian Li', name: 'B4-mATX Wood White', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Micro-ATX Tower', maxGpuLength: '358', psuFormFactor: 'ATX / SFX', maxCoolerHeight: '162', radiatorSupport: '360mm', includedFans: '2x 120mm Slim', color: 'White', features: ['يقبل مزوّد SFX', 'لمسات خشبيّة'] },
    offers: [A('B0H6Q62RTJ'), M('lian-li-b4-matx-wood-computer-case-2x-120mm-pre-installed-fans-supports-360mm-radiator-140mm-atx-psu-steel-wood-material-magnetic-filter-white-b4w-wd')],
    description: `### Lian Li B4-mATX Wood White

كيسٌ صغير أبيض بلمساتٍ من خشب الجوز أو الزان، للوحات Micro-ATX وMini-ITX. يناسب من يريد جهازاً يندمج مع أثاث المكتب أو غرفة المعيشة.

**التقنيات الأساسية المدعومة:**

[green]تصميم خشبيّ أبيض:[/green] شكلٌ هادئ بعيد عن الإضاءة الصاخبة.

[green]حجمٌ مدمج بارتفاع 288 مم:[/green] يجلس على المكتب.

[green]كرت حتى 358 مم:[/green] يتّسع لأغلب الكروت المتوسّطة والعالية.

[green]رادييتر 360 مم في الجانب مع مزوّد SFX:[/green] أو 240 مم مع مزوّد ATX.

[green]مروحتان نحيفتان 120 مم في السقف:[/green] مع منفذ USB-C ومنفذي USB-A في الواجهة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هوائيّ حتى 162 مم.
* مزوّد ATX حتى 140 مم طولاً فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات ATX ولا لوحات Back-Connect.

${alt('B4WB', 'الكيس نفسه بالأسود.')}
https://lian-li.com/product/b4-matx/`,
  },
  // ================================================================ Fractal
  {
    categoryId: CASE, brand: 'Fractal Design', name: 'Pop 2 Air Black TG', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '416', psuFormFactor: 'ATX', maxCoolerHeight: '170', radiatorSupport: '360mm', includedFans: '3x 120mm', color: 'Black', features: [] },
    offers: [A('B0FDQYCZNM'), M('fractal-pop-2-air-computer-case-tempered-glass-3x-aspect-12x-pre-installed-fan-up-to-360mm-radiator-7x-120mm-fan-support-fine-cubic-pattern-mesh-black-fd-c-poa2a-02')],
    description: `### Fractal Design Pop 2 Air Black TG

كيس تهويةٍ متوسّط السعر من Fractal بواجهةٍ شبكيّة بنمط خليّة النحل وثلاث مراوح أماميّة. خيارٌ عمليّ لتجميعة ألعابٍ تريد حرارةً منخفضة بلا مبالغة في الشكل.

**التقنيات الأساسية المدعومة:**

[green]واجهة شبكيّة كاملة:[/green] تدفّق هواءٍ مباشر إلى الكرت والمعالج.

[green]ثلاث مراوح Aspect 12X مرفقة في الواجهة:[/green] الكيس جاهز للعمل دون شراء مراوح.

[green]كرت حتى 416 مم وبعرض 175 مم:[/green] يتّسع لأغلب الكروت الحاليّة.

[green]رادييتر 360 مم في السقف:[/green] وخلوص 47 مم للرام تحته، ورادييتر 120 مم في الخلف.

[green]فتحٌ بلا أدوات:[/green] الواجهة والجانبان والمرشّحات تُفتح باليد، مع قناة كابلات بعمق 35 مم.

[green]منفذ USB-C:[/green] ومنفذ USB-A.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المراوح المرفقة بثلاثة أسنان (DC) لا PWM، فالتحكّم بسرعتها أقلّ دقّة.
* منفذا USB فقط في الواجهة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة في هذه النسخة.
* المزوّد حتى 180 مم طولاً.

${alt('MESH3B', 'كيس Fractal الأعلى بمراوح أكبر (140 مم) وتهويةٍ أقوى.')}
https://www.fractal-design.com/products/cases/pop-series/pop-2-air/`,
  },
  {
    categoryId: CASE, brand: 'Fractal Design', name: 'Pop 2 Air RGB Black TG', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '416', psuFormFactor: 'ATX', maxCoolerHeight: '170', radiatorSupport: '360mm', includedFans: '3x 120mm RGB', color: 'Black', features: [] },
    offers: [A('B0FDR2YLPW'), M('fractal-pop-2-air-computer-case-tempered-glass-3x-aspect-12x-rgb-pre-installed-fan-up-to-360mm-radiator-7x-120mm-fan-support-fine-cubic-pattern-mesh-black-fd-c-poa2a-03')],
    description: `### Fractal Design Pop 2 Air RGB Black TG

نسخة الإضاءة من كيس Pop 2 Air: الواجهة الشبكيّة نفسها مع ثلاث مراوح Aspect 12X RGB. يناسب من يريد تهويةً جيّدة وإضاءةً بسعرٍ متوسّط.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح RGB أماميّة:[/green] إضاءة تتزامن مع برامج اللوحات الأمّ.

[green]واجهة شبكيّة كاملة:[/green] تدفّق هواءٍ مباشر إلى الكرت.

[green]كرت حتى 416 مم ومبرّد هوائيّ حتى 170 مم.[/green]

[green]رادييتر 360 مم في السقف:[/green] بخلوص 47 مم للرام.

[green]فتحٌ بلا أدوات:[/green] وقناة كابلات بعمق 35 مم خلف اللوحة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المراوح بثلاثة أسنان لا PWM.
* المزوّد حتى 180 مم طولاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رادييتر في الواجهة.

${alt('C4000D', 'كيس تهويةٍ آخر مجرّب بواجهةٍ شبكيّة.')}
https://www.fractal-design.com/products/cases/pop-series/pop-2-air/`,
  },
  // ================================================================ Thermaltake
  {
    categoryId: CASE, brand: 'Thermaltake', name: 'View 270 Plus WS ARGB Black', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '420', psuFormFactor: 'ATX', maxCoolerHeight: '180', radiatorSupport: '360mm', includedFans: '3x 120mm ARGB', color: 'Black', features: ['يقبل لوحات E-ATX', 'لمسات خشبيّة'] },
    offers: [A('B0CPDD7B7C'), M('thermaltake-view-270-plus-ws-argb-mid-tower-case-tempered-glass-e-atx-support-argb-fans-black-ca-1y7-00m1wn-ws')],
    description: `### Thermaltake View 270 Plus WS ARGB Black

كيس عرضٍ بزجاجٍ في الواجهة والجانب ولمساتٍ خشبيّة، يصل بثلاث مراوح ARGB. يناسب تجميعة ألعابٍ متوسّطة تريد الشكل البانوراميّ بسعرٍ معقول.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح 120 مم ARGB:[/green] اثنتان معكوستان في جانب اللوحة للإدخال وواحدة في الخلف، وتُدار إضاءتها ببرامج ASUS وGigabyte وMSI وASRock.

[green]كرت حتى 420 مم ومبرّد هوائيّ حتى 180 مم:[/green] مساحةٌ واسعة لكيسٍ بهذا السعر.

[green]يقبل لوحات E-ATX:[/green] ومزوّداً حتى 280 مم طولاً.

[green]رادييتر 360 مم في السقف:[/green] ويتّسع لتسع مراوح 120 مم.

[green]منفذ USB-C بسرعة 10 جيجابت:[/green] ومنفذا USB 3.0.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الواجهة زجاج، والهواء يدخل من الجانب فقط عبر مروحتين.
* الرادييتر في السقف فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رادييتر في الواجهة أو الجانب.

${alt('V380S', 'كيس Thermaltake بحجرتين وأربع مراوح ويقبل لوحات Back-Connect.')}
https://www.thermaltake.com/view-270-plus-ws-argb-mid-tower-chassis.html`,
  },
  {
    categoryId: CASE, brand: 'Thermaltake', name: 'View 270 Plus WS ARGB Snow', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '420', psuFormFactor: 'ATX', maxCoolerHeight: '180', radiatorSupport: '360mm', includedFans: '3x 120mm ARGB', color: 'White', features: ['يقبل لوحات E-ATX', 'لمسات خشبيّة'] },
    offers: [A('B0FP1NZ6L2'), M('thermaltake-view-270-plus-ws-argb-mid-tower-case-tempered-glass-e-atx-chassis-with-argb-fans-snow-ca-1y7-00m6wn-ws')],
    description: `### Thermaltake View 270 Plus WS ARGB Snow

النسخة البيضاء من كيس View 270 Plus: زجاجٌ في الواجهة والجانب، ولمساتٌ خشبيّة، وثلاث مراوح ARGB. خيارٌ لتجميعة بيضاء بانوراميّة متوسّطة السعر.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح 120 مم ARGB بيضاء:[/green] اثنتان معكوستان في الجانب وواحدة في الخلف.

[green]كرت حتى 420 مم ومبرّد هوائيّ حتى 180 مم.[/green]

[green]يقبل لوحات E-ATX:[/green] ومزوّداً حتى 280 مم.

[green]رادييتر 360 مم في السقف:[/green] ويتّسع لتسع مراوح.

[green]منفذ USB-C بسرعة 10 جيجابت:[/green] ومنفذا USB 3.0.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الهواء يدخل من الجانب فقط عبر مروحتين، فالتجميعات الحارّة تحتاج مراوح إضافيّة في غطاء المزوّد.
* الرادييتر في السقف فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات Back-Connect.

${alt('V380S', 'كيس Thermaltake أبيض بحجرتين ويقبل لوحات Back-Connect.')}
https://www.thermaltake.com/view-270-plus-ws-argb-snow-mid-tower-chassis.html`,
  },
  {
    categoryId: CASE, brand: 'Thermaltake', name: 'S380 TG ARGB Black', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '400', psuFormFactor: 'ATX', maxCoolerHeight: '180', radiatorSupport: '360mm', includedFans: '3x 120mm ARGB Reverse + 1x 120mm ARGB', color: 'Black', features: ['يدعم لوحات Back-Connect'] },
    offers: [A('B0G2XV4CX9'), M('thermaltake-s380-tg-argb-atx-mid-tower-pc-case-hidden-connector-mb-sf360-argb-reverse-fan-sf120-argb-fan-360mm-rad-4mm-tg-usb-c-gpu-holder-400mm-gpu-180mm-cpu-black-ca-11k-00m1wn-00')],
    description: `### Thermaltake S380 TG ARGB Black

كيس تهويةٍ بفكرةٍ ذكيّة: وحدة مراوح SF360 معكوسة فوق غطاء المزوّد تدفع الهواء البارد مباشرةً إلى الكرت. يناسب تجميعة ألعابٍ بكرتٍ قويّ يُنتج حرارةً عالية.

**التقنيات الأساسية المدعومة:**

[green]وحدة SF360 ARGB PWM معكوسة في الأسفل:[/green] ثلاث مراوح 120 مم بسرعة 500 إلى 1800 دورة، تدفع نحو 174 قدماً مكعّباً في الدقيقة إلى الكرت من الأسفل.

[green]مروحة SF120 ARGB PWM في الخلف:[/green] للإخراج.

[green]يقبل لوحات Back-Connect (ATX وMicro-ATX):[/green] الكابلات تختفي خلف اللوحة.

[green]رادييتر 360 مم في السقف أو الواجهة:[/green] ويتّسع لعشر مراوح 120 مم.

[green]كرت حتى 400 مم ومبرّد هوائيّ حتى 180 مم.[/green]

[green]منفذ USB-C بسرعة 10 جيجابت:[/green] ومنفذا USB 3.0.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المزوّد حتى 200 مم طولاً، ولا يقبل لوحات E-ATX.
* الزجاج في الجانب فقط، فليس كيس عرضٍ بانوراميّ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رادييتر في الجانب أو الأسفل، فالأماكن المتاحة السقف والواجهة فقط.

${alt('L216', 'كيس تهويةٍ آخر مشهور بمروحتين أماميّتين 160 مم.')}
https://www.thermaltake.com/s380-tg-argb-mid-tower-chassis.html`,
  },
  {
    categoryId: CASE, brand: 'Thermaltake', name: 'TR300 TG Black', tdpWattage: 0, performanceTier: 2,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '365', psuFormFactor: 'ATX', maxCoolerHeight: '165', radiatorSupport: '360mm', includedFans: '1x 120mm', color: 'Black', features: ['تصميم بطابعٍ قديم (Retro)'] },
    offers: [A('B0GL2PNFVF'), M('thermaltake-tr300-tg-mid-tower-chassis-tempered-glass-side-panel-micro-atx-mini-itx-pc-case-360mm-radiator-support-365mm-gpu-clearance-usb-type-c-black-ca-11m-00m1wn-00')],
    description: `### Thermaltake TR300 TG Black

كيسٌ اقتصاديّ بتصميمٍ مستوحى من أجهزة الثمانينيات، مع زجاجٍ جانبيّ. يناسب من يريد شكلاً مختلفاً عن الكيسات المعتادة بميزانيّةٍ منخفضة.

**التقنيات الأساسية المدعومة:**

[green]تصميم Retro مميّز:[/green] واجهة بطابع الحواسيب القديمة.

[green]كرت حتى 365 مم:[/green] ويصل إلى 410 مم مع مزوّدٍ لا يتجاوز 160 مم طولاً.

[green]رادييتر 360 مم في السقف:[/green] و120 مم في الخلف.

[green]يتّسع لثماني مراوح:[/green] واحدة في الواجهة، وثلاث في السقف، وواحدة في الخلف، وثلاث في الأسفل.

[green]منفذ USB-C بسرعة 10 جيجابت:[/green] ومنفذا USB 3.0.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **مروحة واحدة فقط** مرفقة في الخلف. احسب ثمن مراوح الإدخال في الميزانيّة.
* الواجهة مغلقة بمروحة أماميّة واحدة، والتهوية محدودة مقارنةً بالكيسات الشبكيّة.
* طول 410 مم للكرت مشروطٌ بمزوّد قصير (160 مم)، والرقم الآمن 365 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة، ولا يقبل لوحات E-ATX.

${alt('C4000D', 'كيس تهويةٍ بواجهةٍ شبكيّة ومروحتين مرفقتين.')}
https://www.thermaltake.com/tr300-tg-mid-tower-chassis.html`,
  },
  {
    categoryId: CASE, brand: 'Thermaltake', name: 'View 390 Air Black', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '420', psuFormFactor: 'ATX', maxCoolerHeight: '160', radiatorSupport: '360mm', includedFans: '2x 120mm', color: 'Black', features: ['حاملٌ لمنع تقوّس الكرت'] },
    offers: [A('B0FHMY11JH'), M('thermaltake-view-390-air-mid-tower-case-atx-gaming-chassis-curved-tempered-glass-panel-up-to-360mm-radiator-11x-120mm-fan-support-gpu-support-bracket-black-ca-11f-00m1wn-00')],
    description: `### Thermaltake View 390 Air Black

كيسٌ بزجاجٍ منحنٍ في الواجهة والجانب، مع تهويةٍ من الأمام والجانب ومكانٍ لمراوح 200 مم. يناسب تجميعة عرضٍ تريد تهويةً أفضل من الكيسات البانوراميّة المغلقة.

**التقنيات الأساسية المدعومة:**

[green]واجهة تقبل مروحتي 200 مم:[/green] أو ثلاث مراوح 120 أو مروحتي 140، ورادييتر 360 مم في الواجهة أو الجانب.

[green]مروحتان CT120 PWM في الخلف:[/green] بسرعة 500 إلى 2000 دورة.

[green]كرت حتى 420 مم بلا رادييتر:[/green] و390 مم مع رادييتر أماميّ، مع حاملٍ لمنع التقوّس.

[green]يتّسع لإحدى عشرة مروحة:[/green] في الأمام والجانب والخلف والأسفل.

[green]منفذ USB-C بسرعة 10 جيجابت:[/green] ومنفذا USB 3.0.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هوائيّ حتى 160 مم فقط، فالمبرّدات الكبيرة ذات البرجين لا تدخل.
* المراوح المرفقة للإخراج فقط، ويحتاج مراوح إدخال.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات E-ATX.

${alt('C5000D', 'كيس تهويةٍ أكبر بواجهةٍ شبكيّة ويقبل رادييترين.')}
https://www.thermaltake.com/view-390-air-mid-tower-chassis.html`,
  },
  {
    categoryId: CASE, brand: 'Thermaltake', name: 'CTE C750 TG ARGB Snow', tdpWattage: 0, performanceTier: 5,
    specs: { formFactor: 'Full Tower', maxGpuLength: '420', psuFormFactor: 'ATX', maxCoolerHeight: '190', radiatorSupport: '420mm', includedFans: '3x 140mm ARGB', color: 'White', features: ['يقبل لوحات E-ATX', 'تصميم CTE بلوحةٍ مدارة'] },
    offers: [A('B0C2VBPPMZ'), M('thermaltake-cte-c750-tg-argb-snow-full-tower-computer-case-spcc-abs-tempered-glass-material-up-to-360mm-radiator-420mm-aio-only-up-to-14-fans-support-snow-white-ca-1x6-00f6wn-01')],
    description: `### Thermaltake CTE C750 TG ARGB Snow

كيسٌ كبير (Full Tower) بتصميم CTE: اللوحة الأمّ مدارة ليصير الكرت والمعالج في مسار الهواء المباشر من مراوح الواجهة. يناسب محطّة عملٍ أو تجميعة ألعابٍ رائدة بتبريدٍ مائيّ كبير.

**التقنيات الأساسية المدعومة:**

[green]تصميم CTE (Centralized Thermal Efficiency):[/green] الهواء البارد يصل إلى المعالج والكرت قبل أن يسخن بأيّ قطعةٍ أخرى.

[green]ثلاث مراوح CT140 ARGB PWM:[/green] بقطر 140 مم وسرعة 1500 دورة.

[green]رادييتر 420 مم:[/green] في الواجهة أو الخلف أو جانب اللوحة، ويتّسع لأربع عشرة مروحة 140 مم.

[green]مبرّد هوائيّ حتى 190 مم وكرت حتى 420 مم:[/green] (370 مم مع رادييتر أماميّ).

[green]يقبل لوحات E-ATX:[/green] ومساحة أقراصٍ واسعة (حتى سبعة أقراص 3.5 بوصة).

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* حجمه ضخم (قرابة 565 × 327 × 599 مم) ووزنه قرابة 17 كجم.
* السقف يقبل رادييتر 240 مم فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس لمكتبٍ صغير ولا لتجميعةٍ متوسّطة.

${alt('SB800W', 'كيسٌ كبير أبيض آخر بمراوح be quiet! الهادئة.')}
https://www.thermaltake.com/cte-c750-tg-argb-snow-full-tower-chassis.html`,
  },
  // ================================================================ Cooler Master
  {
    categoryId: CASE, brand: 'Cooler Master', name: 'QUBE 540 Moonstone', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '415', psuFormFactor: 'ATX / SFX', maxCoolerHeight: '172', radiatorSupport: '360mm', includedFans: '1x 120mm', color: 'Grey', features: ['يقبل مزوّد SFX', 'لوحة منافذ أماميّة قابلة للنقل'] },
    offers: [A('B0G2TCY2JD'), M('cooler-master-qube-540-atx-mid-tower-case-1x-120mm-black-pre-installed-fan-up-to-360mm-radiator-support-7x-expansion-slots-steel-frame-windowed-side-panel-moonstone-q540-lgnn-s00')],
    description: `### Cooler Master QUBE 540 Moonstone

كيسٌ مكعّب الشكل بحجم 40 لتراً فقط، باللون الرماديّ (Moonstone)، يتّسع رغم صغره لكرتٍ بطول 415 مم ورادييترات 360 مم في ثلاثة أماكن. يناسب من يريد جهازاً قويّاً بحجمٍ أصغر من الكيسات المعتادة.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 360 مم في الواجهة أو السقف أو الأسفل:[/green] مرونةٌ نادرة في كيسٍ صغير.

[green]كرت حتى 415 مم:[/green] بلا مروحةٍ أماميّة.

[green]مبرّد هوائيّ حتى 172 مم:[/green] ومزوّد ATX حتى 200 مم أو SFX.

[green]لوحة منافذ أماميّة قابلة للنقل:[/green] تُنقل لتفسح مكان المروحة الثالثة.

[green]منفذ USB-C بسرعة 20 جيجابت (3.2 Gen 2x2):[/green] ومنفذا USB-A.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **مروحة واحدة فقط** في الخلف. يحتاج مراوح إدخال في الميزانيّة.
* بعض الأماكن (ثلاث مراوح أو رادييتر 360) مشروطة بإزالة لوحة المنافذ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة.

${alt('TD500', 'كيس Cooler Master بواجهةٍ شبكيّة وثلاث مراوح ARGB مرفقة.')}
https://www.coolermaster.com/en-global/products/qube-540.html`,
  },
  {
    categoryId: CASE, brand: 'Cooler Master', name: 'Elite 502 Black', tdpWattage: 0, performanceTier: 2,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '410', psuFormFactor: 'ATX', maxCoolerHeight: '170', radiatorSupport: '420mm', includedFans: '3x 120mm ARGB', color: 'Black', features: ['يقبل لوحات E-ATX'] },
    offers: [A('B0FKHQJK2B'), M('cooler-master-elite-502-mid-tower-computer-case-3x-120mm-argb-pre-installed-fans-up-to-420mm-radiator-7x-120mm-fan-support-tempered-glass-side-panel-black-e502-kgnn-s00')],
    description: `### Cooler Master Elite 502 Black

كيسٌ اقتصاديّ بثلاث مراوح ARGB في الواجهة ودعمٍ لرادييتر 420 مم. يناسب تجميعة ألعابٍ بميزانيّةٍ محدودة لا تريد شراء مراوح.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح 120 مم ARGB في الواجهة:[/green] بمرشّح غبار، والكيس جاهز للعمل.

[green]رادييتر حتى 420 مم في الواجهة:[/green] و360 مم في السقف، وهو دعمٌ نادر في هذه الفئة السعريّة.

[green]كرت حتى 410 مم:[/green] (360 مم مع رادييتر أماميّ)، ومبرّد هوائيّ حتى 170 مم.

[green]يقبل لوحات E-ATX:[/green] حتى 30.5 × 27.7 سم.

[green]منفذ USB-C:[/green] ومنفذ USB-A.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* لا مروحة خلفيّة مرفقة.
* المزوّد حتى 170 مم (210 مم بلا قفص الأقراص).
* منفذا USB فقط بسرعة 5 جيجابت.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات Back-Connect.

${alt('MB600', 'كيس Cooler Master آخر من فئةٍ سعريّةٍ قريبة.')}
https://www.coolermaster.com/en-global/products/elite-502.html`,
  },
  {
    categoryId: CASE, brand: 'Cooler Master', name: 'Elite 502 White', tdpWattage: 0, performanceTier: 2,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '410', psuFormFactor: 'ATX', maxCoolerHeight: '170', radiatorSupport: '420mm', includedFans: '3x 120mm ARGB', color: 'White', features: ['يقبل لوحات E-ATX'] },
    offers: [A('B0FKHJNR3W'), M('cooler-master-elite-502-mid-tower-computer-case-3x-120mm-argb-pre-installed-fans-up-to-420mm-radiator-7x-120mm-fan-support-tempered-glass-side-panel-white-e502-wgnn-s00')],
    description: `### Cooler Master Elite 502 White

النسخة البيضاء من Elite 502: كيسٌ اقتصاديّ بثلاث مراوح ARGB ودعمٍ لرادييتر 420 مم. من أرخص الطرق لتجميعة بيضاء بإضاءة.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح 120 مم ARGB في الواجهة:[/green] بمرشّح غبار.

[green]رادييتر حتى 420 مم في الواجهة و360 مم في السقف.[/green]

[green]كرت حتى 410 مم ومبرّد هوائيّ حتى 170 مم.[/green]

[green]يقبل لوحات E-ATX.[/green]

[green]منفذ USB-C:[/green] ومنفذ USB-A.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* لا مروحة خلفيّة مرفقة.
* المزوّد حتى 170 مم مع قفص الأقراص.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات Back-Connect.

${alt('A903W', 'كيس تهويةٍ أبيض بواجهةٍ شبكيّة.')}
https://www.coolermaster.com/en-global/products/elite-502.html`,
  },
  {
    categoryId: CASE, brand: 'Cooler Master', name: 'MasterFrame 400 Mesh Black', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Micro-ATX Tower', maxGpuLength: '390', psuFormFactor: 'ATX', maxCoolerHeight: '190', radiatorSupport: '360mm', includedFans: '1x 120mm ARGB', color: 'Black', features: ['تصميم إطارٍ مفتوح', 'حاملٌ لمنع تقوّس الكرت'] },
    offers: [A('B0GKQ2PGR5'), M('cooler-master-masterframe-400-mesh-micro-atx-mid-tower-case-1x-sickleflow-120mm-argb-pre-installed-fan-up-to-360mm-radiator-support-al-sgcc-tg-mesh-material-black-mf400m-khnn-s00')],
    description: `### Cooler Master MasterFrame 400 Mesh Black

كيسٌ بتصميم إطارٍ مفتوح للوحات Micro-ATX وMini-ITX، بألواحٍ شبكيّة تُركَّب بأوضاعٍ مختلفة. يناسب من يريد شكلاً مختلفاً مع تهويةٍ ممتازة ومكانٍ لمراوح 200 مم.

**التقنيات الأساسية المدعومة:**

[green]إطار مفتوح بألواح شبكيّة:[/green] تدفّق هواءٍ عالٍ، والألواح تُعاد ترتيبها.

[green]مبرّد هوائيّ حتى 190 مم:[/green] أعلى من أغلب كيسات Micro-ATX.

[green]يتّسع لتسع مراوح:[/green] بينها مروحتا 200 مم في السقف أو الأسفل.

[green]رادييتر 360 مم في السقف:[/green] وكرت حتى 390 مم مع حاملٍ لمنع التقوّس.

[green]منفذ USB-C بسرعة 20 جيجابت:[/green] ومنفذا USB-A.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مروحة SickleFlow ARGB واحدة فقط في الخلف.
* المزوّد حتى 160 مم طولاً.
* الإطار المفتوح يُدخل الغبار أكثر.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات ATX، وأربع فتحات توسعة فقط.

${alt('O11VM', 'كيس Micro-ATX مغلق بزجاجٍ بانوراميّ وحجرتين.')}
https://legacy.coolermaster.com/en-global/products/masterframe-400-mesh/`,
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
writeFileSync(`backups/added-batch11-${stamp}.json`, JSON.stringify({ PARTS, EXTRA, movedBefore }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch11-${stamp}.json`);

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
