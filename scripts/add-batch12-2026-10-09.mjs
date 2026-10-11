/**
 * ============ الدفعة الثانية عشرة — المجموعة الثالثة والأخيرة (٨ كيسات من ٤٨) — 2026-10-09 ============
 *
 * تتمّة طلب نوّاف «ضيف مجموعات 20 … وركز على الوصف … والبيانات بعد ركز عليها».
 * المرشّحون من مسح مايكرولس نفسه في الدفعة العاشرة، وكلّهم قُرئت صفحتهم في أمازون
 * (الرمز، زرّ الشراء) وطُوبق ASIN بالقاعدة.
 *
 * البيانات: جدول مواصفات مايكرولس، وما نقص من صفحات الشركات: VELOX 100P (MSI: كرت 380،
 *   مبرّد 175، ثلاث مراوح أماميّة بلا إضاءة + ARGB خلفيّة)، Helios II (ASUS: كرت 450)،
 *   FARA 514X (كرت 378 بالمراوح داخلاً / 394 خارجاً — سُجّل 378)، A32 PLUS (ASUS: حجرتان).
 *
 *   node scripts/add-batch12-2026-10-09.mjs           # عرض
 *   node scripts/add-batch12-2026-10-09.mjs --apply   # تنفيذ
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
  PANO130W: ['MSI MAG PANO 130R PZ White', 'cmuztrv4d000hkcym9fbroawc'],
  C4000D: ['Corsair 4000D Airflow', 'cmpieb39w000c00ym9n758myw'],
  A23W: ['ASUS A23 PLUS White', 'cmtjkyn2i000r70ympwjtro2d'],
  AP201: ['ASUS Prime AP201 TG', 'cmuztrw4a000tkcymtcra54z7'],
  NXL: ['Fractal Design North XL', 'cmpieb4ax000g00ymgj1zamtu'],
  L216: ['Lian Li LANCOOL 216', 'cmpfzir17000gx4ymtjjn4ag1'],
};
const alt = (k, ...why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const MOVE = [];
const EXTRA = [];

const PARTS = [
  {
    categoryId: CASE, brand: 'MSI', name: 'MAG PANO 110R PZ Black', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '400', psuFormFactor: 'ATX', maxCoolerHeight: '160', radiatorSupport: '360mm', includedFans: '3x 120mm ARGB Reverse + 1x 120mm ARGB', color: 'Black', features: ['يدعم لوحات Back-Connect', 'زجاج بانوراميّ 270 درجة'] },
    offers: [A('B0BSLKQ1K3'), M('msi-mag-pano-110r-pz-mid-tower-computer-case-4x-argb-pre-installed-fan-up-to-360mm-radiator-10x-fan-support-270-panoramic-design-top-bottom-dust-filter-black-306-7g28r21-ja4')],
    description: `### MSI MAG PANO 110R PZ Black

كيس عرضٍ بانوراميّ بزجاجٍ يلتفّ 270 درجة حول الواجهة والجانب، يصل بأربع مراوح ARGB ويقبل اللوحات ذات الموصلات الخلفيّة (PZ). يناسب تجميعة ألعابٍ متوسّطة تريد شكل الكيسات البانوراميّة بسعرٍ منخفض.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح ARGB مرفقة:[/green] ثلاث بشفراتٍ معكوسة في الجانب للإدخال (الوجه المضيء نحو الزجاج)، وواحدة في الخلف للإخراج.

[green]يقبل لوحات Back-Connect (ATX وMicro-ATX):[/green] مثل MSI Project Zero، فتختفي الكابلات من الواجهة.

[green]كرت حتى 400 مم:[/green] يتّسع لأغلب الكروت الحاليّة.

[green]رادييتر 360 مم في السقف:[/green] و120 مم في الخلف، ويتّسع لعشر مراوح.

[green]منفذ USB-C بسرعة 20 جيجابت:[/green] ومنفذا USB-A، مع زرٍّ للتحكّم بالإضاءة.

[green]مرشّحا غبار في السقف والأسفل.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هوائيّ حتى 160 مم فقط، فالمبرّدات ذات البرجين غالباً لا تدخل. المائيّ 360 هو الخيار الطبيعيّ هنا.
* المزوّد حتى 200 مم طولاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مراوح ولا رادييتر في الواجهة، فهي زجاج.
* لا رادييتر في الجانب.

${alt('PANO130W', 'النسخة الأكبر من السلسلة، تقبل رادييتراً جانبياً ومبرّداً هوائيّاً حتى 165 مم (بالأبيض).')}
https://www.msi.com/PC-Case/MAG-PANO-110R-PZ`,
  },
  {
    categoryId: CASE, brand: 'MSI', name: 'MAG PANO 110R PZ White', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '400', psuFormFactor: 'ATX', maxCoolerHeight: '160', radiatorSupport: '360mm', includedFans: '3x 120mm ARGB Reverse + 1x 120mm ARGB', color: 'White', features: ['يدعم لوحات Back-Connect', 'زجاج بانوراميّ 270 درجة'] },
    offers: [A('B0DQD82GQP'), M('msi-mag-pano-110r-pz-mid-tower-computer-case-4x-argb-pre-installed-fan-up-to-360mm-radiator-10x-fan-support-270-panoramic-design-top-bottom-dust-filter-white-306-7g28w21-ja4')],
    description: `### MSI MAG PANO 110R PZ White

النسخة البيضاء من كيس العرض البانوراميّ PANO 110R: زجاجٌ يلتفّ 270 درجة، وأربع مراوح ARGB، ودعمٌ للوحات الموصلات الخلفيّة. من أرخص الطرق لتجميعة بيضاء بانوراميّة.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح ARGB بيضاء مرفقة:[/green] ثلاث معكوسة في الجانب وواحدة في الخلف.

[green]يقبل لوحات Back-Connect:[/green] تجميعة بيضاء نظيفة بلا كابلاتٍ ظاهرة.

[green]كرت حتى 400 مم ورادييتر 360 مم في السقف.[/green]

[green]منفذ USB-C بسرعة 20 جيجابت:[/green] ومنفذا USB-A.

[green]يتّسع لعشر مراوح:[/green] مع مرشّحي غبار في السقف والأسفل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هوائيّ حتى 160 مم فقط.
* المزوّد حتى 200 مم طولاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مراوح ولا رادييتر في الواجهة، ولا رادييتر في الجانب.

${alt('PANO130W', 'النسخة الأكبر بالأبيض، تقبل رادييتراً جانبياً 360 مم.')}
https://www.msi.com/PC-Case/MAG-PANO-110R-PZ`,
  },
  {
    categoryId: CASE, brand: 'MSI', name: 'MAG PANO 130R PZ Black', tdpWattage: 0, performanceTier: 4,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '400', psuFormFactor: 'ATX', maxCoolerHeight: '165', radiatorSupport: '2x 360mm', includedFans: '3x 120mm ARGB Reverse + 1x 120mm ARGB', color: 'Black', features: ['يدعم لوحات Back-Connect', 'زجاج بانوراميّ 270 درجة'] },
    offers: [A('B0FT8YQSNL'), M('msi-mag-pano-130r-pz-mid-tower-pc-case-atx-matx-back-connect-mb-support-270-panoramic-tg-10x-fan-support-360mm-aio-usb-c-20gbps-black-306-7g32r21-hh9')],
    description: `### MSI MAG PANO 130R PZ Black

الأخ الأكبر في سلسلة PANO: زجاجٌ بانوراميّ 270 درجة، وأربع مراوح ARGB، ورادييتر 360 مم في الجانب والسقف معاً. يناسب تجميعة عرضٍ بتبريدٍ مائيّ للمعالج ومكانٍ لرادييترٍ ثانٍ.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 360 مم في الجانب والسقف:[/green] ميزةٌ لا توجد في PANO 110R، تسمح برادييترين أو بمراوح جانبيّة أكبر.

[green]أربع مراوح ARGB:[/green] ثلاث معكوسة في الجانب وواحدة في الخلف.

[green]يقبل لوحات Back-Connect (ATX وMicro-ATX).[/green]

[green]كرت حتى 400 مم ومبرّد هوائيّ حتى 165 مم.[/green]

[green]ثلاث مراوح إضافيّة فوق غطاء المزوّد:[/green] تدفع الهواء إلى الكرت من الأسفل.

[green]منفذ USB-C بسرعة 20 جيجابت:[/green] ومنفذا USB-A.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المزوّد حتى 180 مم طولاً، وبعض مزوّدات 1000 واط وما فوق أطول من ذلك.
* وزنه قرابة 8.4 كجم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مراوح في الواجهة، فهي زجاج.

${alt('PANO130W', 'الكيس نفسه بالأبيض.')}
https://www.msi.com/PC-Case/MAG-PANO-130R-PZ`,
  },
  {
    categoryId: CASE, brand: 'MSI', name: 'MPG VELOX 100P AIRFLOW', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '380', psuFormFactor: 'ATX', maxCoolerHeight: '175', radiatorSupport: '360mm', includedFans: '3x 120mm + 1x 120mm ARGB', color: 'Black', features: [] },
    offers: [A('B0979X9DWD'), M('msi-mpg-velox-100p-airflow-mid-tower-pc-case-temp-glass-panel-optimized-for-airflow-rgb-mystic-light-up-to-7-fans-up-to-360mm-radiator-support-side-ventilation-config-black-306-7g18p21-809')],
    description: `### MSI MPG VELOX 100P AIRFLOW

كيس تهويةٍ بواجهةٍ شبكيّة وأربع مراوح مرفقة، من سلسلة MSI MPG. خيارٌ عمليّ لتجميعة ألعابٍ تريد حرارةً منخفضة وكابلاتٍ مرتّبة.

**التقنيات الأساسية المدعومة:**

[green]واجهة شبكيّة مع ثلاث مراوح 120 مم:[/green] تدفّق هواءٍ مباشر إلى الكرت والمعالج.

[green]مروحة ARGB في الخلف:[/green] تتزامن مع MSI Mystic Light.

[green]رادييتر 360 مم في الواجهة أو السقف:[/green] و240 مم في الجانب، و120 مم في الخلف.

[green]مبرّد هوائيّ حتى 175 مم وكرت حتى 380 مم.[/green]

[green]مزوّد حتى 220 مم:[/green] بعد إزالة حامل القرص 3.5 بوصة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المراوح الأماميّة بلا إضاءة.
* طول الكرت 380 مم، فبعض كروت RTX 5090 الضخمة لا تدخل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات Back-Connect.
* يتّسع لسبع مراوح فقط.

${alt('C4000D', 'كيس تهويةٍ مجرّب بواجهةٍ شبكيّة من Corsair.')}
https://www.msi.com/PC-Case/MPG-VELOX-100P-AIRFLOW`,
  },
  {
    categoryId: CASE, brand: 'ASUS', name: 'A32 PLUS Black', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '420', psuFormFactor: 'ATX', maxCoolerHeight: '165', radiatorSupport: '360mm', includedFans: '4x 120mm ARGB', dualChamber: 'Yes', color: 'Black', features: ['زجاج بانوراميّ'] },
    offers: [A('B0FRB5PZ85'), M('asus-a32-plus-atx-computer-case-4x-pre-installed-argb-fans-up-to-360mm-radiator-10x-120mm-fan-support-270-panoramic-view-detach-side-panels-black-90dc00s0-b19000')],
    description: `### ASUS A32 PLUS Black

كيسٌ بحجرتين وزجاجٍ في الواجهة والجانب، يصل بأربع مراوح ARGB. يناسب تجميعة ألعابٍ بانوراميّة متوسّطة بكرتٍ طويل.

**التقنيات الأساسية المدعومة:**

[green]حجرتان:[/green] المزوّد والكابلات خلف اللوحة، والحجرة الرئيسيّة ظاهرة كاملة عبر الزجاج.

[green]أربع مراوح 120 مم ARGB:[/green] ثلاث في الجانب بشفراتٍ معكوسة للإدخال، وواحدة في الخلف.

[green]كرت حتى 420 مم:[/green] يتّسع لأطول الكروت الحاليّة تقريباً.

[green]رادييتر 360 مم في السقف:[/green] و120 مم في الخلف.

[green]مزوّد حتى 220 مم:[/green] ومساحة 90 مم للكابلات خلف اللوحة.

[green]منفذ USB-C بسرعة 10 جيجابت:[/green] ومنفذا USB 3.0.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هوائيّ حتى 165 مم.
* الرادييتر في السقف فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مراوح في الواجهة، فهي زجاج.
* لا يقبل لوحات E-ATX.

${alt('A23W', 'كيس ASUS آخر بالأبيض من الفئة نفسها.')}
https://www.asus.com/motherboards-components/cases/asus/asus-a32-plus-case/`,
  },
  {
    categoryId: CASE, brand: 'ASUS', name: 'Prime AP303 TG Black', tdpWattage: 0, performanceTier: 2,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '360', psuFormFactor: 'ATX', maxCoolerHeight: '165', radiatorSupport: '360mm', includedFans: '1x 120mm', color: 'Black', features: [] },
    offers: [A('B09CD53X1G'), M('asus-prime-ap303-tempered-glass-computer-case-1x-120mm-pre-installed-fan-up-to-360mm-radiator-support-4x-120mm-fan-support-quasi-filter-mesh-panels-black-90dc00v0-b39010')],
    description: `### ASUS Prime AP303 TG Black

كيس ATX صغير الحجم (44 لتراً) بزجاجٍ جانبيّ وألواحٍ شبكيّة ناعمة تعمل كمرشّح. يناسب جهاز عملٍ أو ألعابٍ متوسّط يريد حجماً أصغر من الكيسات المعتادة.

**التقنيات الأساسية المدعومة:**

[green]حجم 44 لتراً للوحات ATX:[/green] أصغر من أغلب كيسات ATX، ويناسب المكاتب الضيّقة.

[green]رادييتر حتى 360 مم في السقف:[/green] بسماكة حتى 60 مم، و120 مم في الخلف.

[green]ألواح شبكيّة بنمطٍ يعمل كمرشّح غبار:[/green] (Quasi-filter).

[green]منفذ USB-C بسرعة 20 جيجابت (3.2 Gen 2x2):[/green] ومنفذا USB-A.

[green]كابل طاقة داخليّ معتمد بقدرة 15 أمبير.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **مروحة واحدة فقط** في الخلف. يحتاج مراوح إدخال في الميزانيّة.
* كرت حتى 360 مم، فالكروت الضخمة (RTX 5080 و5090 بثلاث مراوح) قد لا تدخل.
* المزوّد حتى 180 مم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة، ولا يقبل لوحات Back-Connect.

${alt('AP201', 'كيس ASUS أصغر للوحات Micro-ATX.')}
https://www.asus.com/motherboards-components/cases/prime/asus-prime-ap303-tempered-glass-panel/`,
  },
  {
    categoryId: CASE, brand: 'ASUS', name: 'ROG Strix Helios II GX601 Black', tdpWattage: 0, performanceTier: 5,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '450', psuFormFactor: 'ATX', maxCoolerHeight: '190', radiatorSupport: '420mm', includedFans: '4x 140mm', color: 'Black', features: ['يقبل لوحات E-ATX', 'موزّع لست مراوح وست إضاءات'] },
    offers: [A('B0FKZ1C5NJ'), M('asus-strix-helios-ii-gx601s-gaming-mid-tower-computer-case-4x-140mm-pre-installed-fans-up-to-420mm-radiator-7x-fan-support-usb-c-20gbps-cable-management-psu-shroud-black-90dc00w0-b39000')],
    description: `### ASUS ROG Strix Helios II GX601 Black

كيس ROG الرائد بأربع مراوح 140 مم ومساحةٍ لأضخم القطع: كرت 450 مم، ومبرّد هوائيّ 190 مم، ورادييتر 420 مم. يناسب تجميعة ألعابٍ رائدة بكرت RTX 5090 أو محطّة عملٍ بلوحة E-ATX.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح 140 مم:[/green] ثلاث PWM في الواجهة وواحدة في الخلف. المراوح الكبيرة تدفع هواءً أكثر بضجيجٍ أقلّ.

[green]رادييتر 420 مم في الواجهة:[/green] و360 مم في السقف، و140 مم في الخلف.

[green]كرت حتى 450 مم ومبرّد هوائيّ حتى 190 مم:[/green] مساحةٌ لأيّ قطعةٍ في السوق.

[green]موزّع مدمج لست مراوح PWM وستّ إضاءات ARGB:[/green] كابلٌ واحد إلى اللوحة الأمّ يكفي.

[green]منفذا USB-C بسرعة 20 جيجابت:[/green] وأربعة منافذ USB-A في الواجهة.

[green]يقبل لوحات E-ATX:[/green] ومزوّداً حتى 220 مم.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* حجمه كبير جداً (250 × 565 × 591 مم)، فيحتاج مكاناً واسعاً تحت المكتب.
* سعره مرتفع مقارنةً بكيساتٍ واسعة أخرى.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب التجميعات المتوسّطة، لأنّ مساحته تزيد عن حاجتها.

${alt('NXL', 'كيسٌ كبير بتصميمٍ هادئ ولمساتٍ خشبيّة، أخفّ شكلاً.')}
https://rog.asus.com/cases/rog-strix-helios-ii/`,
  },
  {
    categoryId: CASE, brand: 'SilverStone', name: 'FARA 514X Black', tdpWattage: 0, performanceTier: 3,
    specs: { formFactor: 'Mid Tower', maxGpuLength: '378', psuFormFactor: 'ATX', maxCoolerHeight: '168', radiatorSupport: '2x 360mm', includedFans: '4x 120mm ARGB', color: 'Black', features: ['حاملٌ لمنع تقوّس الكرت'] },
    offers: [A('B0D8W3NP8F'), M('silverstone-fara-514x-atx-mid-tower-computer-case-4x-120mm-argb-pre-installed-fans-dual-360mm-radiator-support-7-expansion-slot-front-mesh-panel-black-sst-fa514x-bg')],
    description: `### SilverStone FARA 514X Black

كيس تهويةٍ اقتصاديّ بواجهةٍ شبكيّة وأربع مراوح ARGB، ويقبل رادييترين 360 مم. يناسب تجميعة ألعابٍ بميزانيّةٍ محدودة تريد تهويةً قويّة.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح 120 مم ARGB مرفقة:[/green] ثلاث في الواجهة وواحدة في الخلف، فالكيس جاهز للعمل.

[green]واجهة شبكيّة:[/green] تدفّق هواءٍ مباشر إلى القطع.

[green]رادييتر 360 مم في الواجهة والسقف معاً:[/green] و120 مم في الخلف.

[green]مبرّد هوائيّ حتى 168 مم:[/green] ومزوّد حتى 217 مم (حين يكون قفص الأقراص في الأمام).

[green]منفذ USB-C:[/green] ومنفذا USB 3.0، مع حاملٍ لمنع تقوّس الكرت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* طول الكرت 378 مم حين تكون المراوح الأماميّة داخل الكيس، و394 مم إن رُكّبت خارجه خلف الواجهة. الكروت الضخمة قد لا تدخل.
* المبرّدات الهوائيّة الكبيرة جداً (أعلى من 168 مم) لا تدخل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات E-ATX ولا لوحات Back-Connect.

${alt('L216', 'كيس تهويةٍ بمروحتين 160 مم ومساحةٍ أكبر للكرت.')}
https://www.silverstonetek.com/en/product/info/computer-chassis/fara_514x/`,
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
writeFileSync(`backups/added-batch12-${stamp}.json`, JSON.stringify({ PARTS, EXTRA, movedBefore }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch12-${stamp}.json`);

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
