/**
 * ============ إعادة كتابة أوصاف المزوّدات القصيرة — 2026-10-09 ============
 *
 * ثمانية وعشرون مزوّداً دون 900 حرف. الأرقام من المواصفات المسجّلة (القدرة، الكفاءة، المعيار،
 * درجة SPL) ومن الوصف السابق نفسه. كلّ وصفٍ يشرح معنى درجة SPL لمن لا يعرفها.
 * MSI MAG A650BN وA650GL كانا بصيغةٍ قديمة (فقرات حرّة / بديلٌ بلا نجمة) — صارا بالقالب.
 *
 *   node scripts/rewrite-desc-psu-2026-10-09.mjs           # عرض
 *   node scripts/rewrite-desc-psu-2026-10-09.mjs --apply   # تنفيذ (نسخة احتياطية أوّلاً)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const TAG = 'psu';

const alt = (name, id, ...why) => `---\nبإمكانك التوجه إلى [${name}](/components/${id}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const SPL = 'تقييم SPL قائمةٌ مستقلّة يُعدّها مراجعون متخصّصون لجودة المكوّنات والحمايات';
const REWRITE = [
  {
    id: 'cmtcr2j4f0010o8ymgl50aa7g',
    description: `### MSI MAG A650BN

مزوّد 650 واط بشهادة 80 PLUS Bronze بسعرٍ منخفض، للتجميعات الاقتصاديّة والمتوسّطة التي لا تحتاج أكثر من 650 واط، مثل جهازٍ بكرت RTX 5060 أو RX 9060 XT.

**التقنيات الأساسية المدعومة:**

[green]تصميم DC-DC وخطّ 12 فولت واحد:[/green] جهدٌ أثبت للقطع الحديثة التي تعتمد على خطّ 12 فولت.

[green]حمايات OVP وOCP وOPP وOTP وSCP:[/green] تقطع الكهرباء عند زيادة الجهد أو التيار أو الحرارة أو القصر.

[green]مروحة 120 مم منخفضة الضجيج.[/green]

[green]كفاءة Bronze:[/green] كافية لجهازٍ متوسّط الاستهلاك.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* كابلاته ثابتة غير منفصلة (Non-Modular)، فكلّ الكابلات تخرج منه سواء استعملتها أم لا، وتزدحم داخل الكيس.
* درجة C في تقييم SPL، وهي الحدّ الأدنى المقبول لجهازٍ اقتصاديّ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* موصّلا PCIe 6+2 فقط، فلا يكفي كروتاً تطلب ثلاثة موصّلات، ولا كابل 12V-2x6.

---
بإمكانك التوجه إلى [MSI MAG A650GL](/components/cmpi5h9s2000704l1iq4czxdf) إذا كان توجهك يتركز على الآتي:
* القدرة نفسها بكفاءة Gold وكابلات منفصلة ودرجة B.
https://www.msi.com/Power-Supply/MAG-A650BN`,
  },
  {
    id: 'cmv18kpzh001fjgymiq0t1umn',
    description: `### SilverStone DA850R Gold

مزوّد SilverStone بقدرة 850 واط Gold وكابلات منفصلة وكابل 12V-2x6. يناسب جهازاً بكرت RTX 5070 Ti أو 5080 مع معالجٍ متوسّط إلى عالٍ.

**التقنيات الأساسية المدعومة:**

[green]درجة B+ في تقييم SPL:[/green] ${SPL}، وB+ تعني جودةً جيّدة لجهاز ألعابٍ قويّ.

[green]كابل 12V-2x6 (PCIe 5.0):[/green] يصل كروت RTX 40 و50 مباشرةً دون محوّل.

[green]كابلات منفصلة بالكامل:[/green] تركّب ما تحتاجه فقط، فيبقى الكيس مرتّباً.

[green]مروحة 120 مم صامتة وحمايات متقدّمة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* معيار ATX 3.0 لا 3.1. يعمل مع الكروت الحديثة، لكنّ موصّل 3.1 أكثر أماناً في تثبيت الكابل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا وضع إيقاف المروحة، فتعمل دائماً حتى في الحمل الخفيف.

---
بإمكانك التوجه إلى [Seasonic Focus GX-850](/components/cmr3crglp0004ncym20vrcnug) إذا كان توجهك يتركز على الآتي:
* مزوّد 850 واط بدرجة A- وضمان عشر سنوات.
https://www.silverstonetek.com/en/product/info/power-supplies/DA850R_Gold/`,
  },
  {
    id: 'cmv18kro8001yjgymje9xfvya',
    description: `### Seasonic Focus GX-1000 ATX 3.1

Focus GX بقدرة 1000 واط من الجيل الرابع (V4) بمعيار ATX 3.1: جودة Seasonic المعروفة بضمان عشر سنوات. يناسب جهازاً بكرت RTX 5080 أو 5090 مع معالجٍ عالٍ.

**التقنيات الأساسية المدعومة:**

[green]درجة A- في تقييم SPL:[/green] ${SPL}، وA- من الفئة العليا.

[green]ضمان عشر سنوات:[/green] من الأطول في السوق، ويعكس ثقة الشركة في مكوّناته.

[green]مروحة 135 مم بمحمل FDB:[/green] هادئةٌ وطويلة العمر.

[green]معيار ATX 3.1 وكابل 12V-2x6:[/green] لكروت RTX 50 مباشرةً.

[green]كابلات منفصلة بالكامل.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* تنبّه SPL إلى ضبطٍ فضفاض لخطّ 5VSB (خطّ الاستعداد)، وهو تفصيلٌ لا يؤثّر في أغلب الأجهزة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعره أعلى من مزوّدات 1000 واط الأخرى.

---
بإمكانك التوجه إلى [Thermaltake Toughpower GF3 1000W](/components/cmpiechj4004a00ym7kkv09n4) إذا كان توجهك يتركز على الآتي:
* مزوّد 1000 واط بدرجة A+ وسعرٍ أقلّ.
https://seasonic.com/focus-gx/`,
  },
  {
    id: 'cmv18krf4001vjgymzvhx9dsy',
    description: `### NZXT C1000 Gold ATX 3.1

مزوّد NZXT C1000 Gold إصدار 2024 بمعيار ATX 3.1، بدرجة A+ في تقييم SPL وضمان عشر سنوات. يناسب جهازاً رائداً بكرت RTX 5080 أو 5090.

**التقنيات الأساسية المدعومة:**

[green]درجة A+ في تقييم SPL:[/green] ${SPL}، وA+ أعلى درجاتها.

[green]مروحة 135 مم بمحمل FDB ووضع صامت:[/green] تتوقّف حتى 50% من الحمل، ويُلغى ذلك بزرّ.

[green]كابل 12V-2x6 وثلاثة موصّلات 6+2:[/green] لأيّ كرتٍ حاليّ.

[green]مكثّفات يابانيّة وضمان عشر سنوات.[/green]

[green]كفاءة حتى 91.9% عند نصف الحمل:[/green] حرارةٌ وهدرٌ أقلّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* أغلى من نسخة Gold Core بالقدرة نفسها، والفرق في الضمان (10 مقابل 7 سنوات) ودرجة الجودة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة ولا شاشة ولا مراقبة رقميّة.

---
بإمكانك التوجه إلى [NZXT C1200 Gold ATX 3.1](/components/cmuzsa3co001qu8ymzvekx5wu) إذا كان توجهك يتركز على الآتي:
* المزوّد نفسه بقدرة 1200 واط.
https://nzxt.com/products/c1000-gold-atx`,
  },
  {
    id: 'cmv18kpoz001cjgymtaa6gbky',
    description: `### SilverStone DA750R Gold

مزوّد SilverStone بقدرة 750 واط Gold ومكثّفات يابانيّة ومروحة FDB هادئة. يناسب جهاز ألعابٍ متوسّطاً إلى قويّ بكرت RTX 5070 أو RX 9070.

**التقنيات الأساسية المدعومة:**

[green]درجة B+ في تقييم SPL:[/green] ${SPL}، وB+ جودةٌ جيّدة.

[green]مكثّفات يابانيّة ومروحة 120 مم بمحمل FDB:[/green] عمرٌ أطول وضجيجٌ منخفض.

[green]كابل 12V-2x6 (PCIe 5.0):[/green] لكروت RTX 40 و50.

[green]كابلات منفصلة بالكامل.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* معيار ATX 3.0 لا 3.1.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا وضع إيقاف المروحة.
* 750 واط لا تكفي كروت RTX 5080 و5090 براحة.

---
بإمكانك التوجه إلى [Corsair RM750e](/components/cmpnewrm750e0000000000000) إذا كان توجهك يتركز على الآتي:
* مزوّد 750 واط Gold بدرجة B+ وسعرٍ قريب.
https://www.silverstonetek.com/en/product/info/power-supplies/DA750R_Gold/`,
  },
  {
    id: 'cmv18ks7t0024jgymj7c82dyr',
    description: `### Lian Li RS1200G White

نسخة 1200 واط البيضاء من سلسلة RS: مدخل كهرباء دوّار لترتيب الكابلات، وموزّع مراوح USB مرفق، ودرجة A في تقييم SPL. لتجميعة بيضاء رائدة بكرت RTX 5090.

**التقنيات الأساسية المدعومة:**

[green]مدخل كهرباء دوّار 90 درجة:[/green] يناسب الكيسات بحجرتين حيث يكون المزوّد في وضعٍ غير معتاد.

[green]موزّع مراوح USB مرفق بأربعة منافذ:[/green] يوفّر رؤوس مراوح إضافيّة.

[green]درجة A في تقييم SPL وضمان عشر سنوات:[/green] ${SPL}.

[green]معيار ATX 3.1 وكابل 12V-2x6.[/green]

[green]أبيض بالكامل مع الكابلات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 1200 واط تزيد عن حاجة أغلب التجميعات.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* كبيرٌ نسبياً لمزوّد ATX، فتأكّد من مساحة الكيس.

---
بإمكانك التوجه إلى [Lian Li EDGE Gold 1200W White](/components/cmuztrwdn000wkcymmc2rgwvw) إذا كان توجهك يتركز على الآتي:
* مزوّد Lian Li أبيض آخر بقدرة 1200 واط وموصلاتٍ جانبيّة.
https://lian-li.com/product/rs/`,
  },
  {
    id: 'cmv18ksgj0027jgymqtndzf73',
    description: `### MSI MAG A1250GL PCIE5

مزوّد MSI بقدرة 1250 واط Gold بمعيار ATX 3.1: هامشٌ واسع للتجميعات بكروت RTX 5090 ومعالجاتٍ عالية الاستهلاك.

**التقنيات الأساسية المدعومة:**

[green]1250 واط:[/green] يتحمّل قفزات استهلاك RTX 5090 مع معالج Core Ultra 9 أو Ryzen 9 دون أن يقترب من حدّه.

[green]معيار ATX 3.1 وكابل 12V-2x6.[/green]

[green]مروحة 135 مم بمحمل FDB:[/green] هادئةٌ وطويلة العمر.

[green]درجة B+ في تقييم SPL:[/green] ${SPL}.

[green]كابلات منفصلة بالكامل.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* تنبّه SPL إلى خللٍ في حماية خطّ 5 فولت عند الحرارة العالية.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* قدرته تزيد عن حاجة أغلب الأجهزة.

---
بإمكانك التوجه إلى [NZXT C1200 Gold ATX 3.1](/components/cmuzsa3co001qu8ymzvekx5wu) إذا كان توجهك يتركز على الآتي:
* مزوّد 1200 واط بدرجة A+ وضمان عشر سنوات.
https://www.msi.com/Power-Supply/MAG-A1250GL-PCIE5`,
  },
  {
    id: 'cmv18kqk1001ljgym6op318wx',
    description: `### Gigabyte UD1000GM PG5 V2

مزوّد 1000 واط Gold بكابلات منفصلة ومعيار ATX 3.1 بسعرٍ منخفض، لكنّ تقييم جودته متواضع. يناسب من يريد قدرةً عالية بأقلّ سعر لجهازٍ متوسّط.

**التقنيات الأساسية المدعومة:**

[green]1000 واط بسعر مزوّدات 850:[/green] هامشٌ كبير للترقية.

[green]كابل 12V-2x6 وكابلات منفصلة بالكامل.[/green]

[green]معيار ATX 3.1.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* درجة C+ في تقييم SPL: ضعفٌ في الاستجابة لقفزات الاستهلاك المفاجئة ومعامل قدرةٍ منخفض. ${SPL}.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يُنصح به لكروت RTX 5080 و5090 رغم قدرته، فهذه الكروت تولّد قفزاتٍ حادّة في الاستهلاك.

---
بإمكانك التوجه إلى [Thermaltake Toughpower GF3 1000W](/components/cmpiechj4004a00ym7kkv09n4) إذا كان توجهك يتركز على الآتي:
* مزوّد 1000 واط بدرجة A+ وسعرٍ قريب.
https://www.gigabyte.com/Power-Supply/GP-UD1000GM-PG5-V2/sp`,
  },
  {
    id: 'cmv18kp4s0016jgym5qao95m3',
    description: `### Seasonic Focus GX-750 White

Focus GX الأبيض بقدرة 750 واط ومعيار ATX 3.1: جودة Seasonic المعروفة بضمان عشر سنوات، لتجميعة بيضاء بكرت RTX 5070 أو 5070 Ti.

**التقنيات الأساسية المدعومة:**

[green]درجة A- في تقييم SPL:[/green] ${SPL}، وA- من الفئة العليا.

[green]ضمان عشر سنوات:[/green] من الأطول في السوق.

[green]مروحة 135 مم بمحمل FDB ووضع تشغيلٍ صامت.[/green]

[green]أبيض بالكامل مع الكابلات، ومعيار ATX 3.1 وكابل 12V-2x6.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* تنبّه SPL إلى ضبطٍ فضفاض لخطّ 5VSB وحماية التيار للخطوط الصغرى، وهي تفاصيل لا تؤثّر في الاستخدام المعتاد.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعره أعلى من مزوّداتٍ بالقدرة نفسها.

---
بإمكانك التوجه إلى [Seasonic Focus GX-850](/components/cmr3crglp0004ncym20vrcnug) إذا كان توجهك يتركز على الآتي:
* النسخة السوداء بقدرة 850 واط.
https://seasonic.com/focus-gx/`,
  },
  {
    id: 'cmv18knod000qjgymbo42yfso',
    description: `### be quiet! System Power 11 650W

مزوّد be quiet! المدخليّ بقدرة 650 واط ومعيار ATX 3.1 ومروحة هادئة. يناسب جهازاً اقتصاديّاً بكرتٍ متوسّط الاستهلاك.

**التقنيات الأساسية المدعومة:**

[green]معيار ATX 3.1 وكابل 12V-2x6 (450 واط):[/green] يصل الكروت الحديثة متوسّطة الاستهلاك مباشرةً.

[green]مروحة 120 مم مُحسَّنة للهدوء:[/green] قرابة 11 ديسيبل عند 20% من الحمل.

[green]كفاءة 80 PLUS Bronze حتى 89.7%:[/green] عند نصف الحمل.

[green]حمايات كاملة:[/green] الحرارة والتيار والقدرة والقصر والجهد.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* درجة C في تقييم SPL: مروحة ضعيفة الجودة ومكثّف رئيسيّ بتحمّل 85 درجة. ${SPL}.
* كابلات ثابتة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يُنصح به لكرتٍ يتجاوز 200 واط.

---
بإمكانك التوجه إلى [MSI MAG A650GL](/components/cmpi5h9s2000704l1iq4czxdf) إذا كان توجهك يتركز على الآتي:
* مزوّد 650 واط Gold بدرجة B وكابلات منفصلة.
https://www.bequiet.com/en/powersupply/5903`,
  },
  {
    id: 'cmv18knef000njgymszevzlbx',
    description: `### Lian Li RB650

مزوّد Lian Li الاقتصاديّ بقدرة 650 واط ومعيار ATX 3.1 ومروحة 135 مم. يناسب جهازاً اقتصاديّاً بكرتٍ متوسّط مثل RTX 5060.

**التقنيات الأساسية المدعومة:**

[green]معيار ATX 3.1 مع كابل 12V-2x6:[/green] للكروت الحديثة متوسّطة الاستهلاك دون محوّل.

[green]مروحة 135 مم بتحكّمٍ حراريّ:[/green] تدور ببطء في الحمل الخفيف.

[green]ستّ حمايات وضمان خمس سنوات.[/green]

[green]كفاءة 80 PLUS Bronze.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* غير مُدرَج في تقييم SPL بعد، فلا تقييم مستقلّاً لجودته.
* كابلات ثابتة، وضجيج المروحة يصل إلى 39 ديسيبل تحت الحمل الكامل.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب كروت RTX 5070 Ti وما فوقها.

---
بإمكانك التوجه إلى [MSI MAG A650GL](/components/cmpi5h9s2000704l1iq4czxdf) إذا كان توجهك يتركز على الآتي:
* مزوّد 650 واط Gold بكابلات منفصلة.
https://lian-li.com/product/rb-psu/`,
  },
  {
    id: 'cmv18koi0000zjgymiyg28gzr',
    description: `### ASUS TUF Gaming 750W Gold

مزوّد TUF بقدرة 750 واط Gold: كابلات منفصلة، ومروحة بمحملين كرويّين، وطلاء واقٍ للوحة الدارة. يناسب جهاز ألعابٍ متوسّطاً إلى قويّ.

**التقنيات الأساسية المدعومة:**

[green]كابل 16 سنّاً (12V-2x6):[/green] لكروت RTX 40 و50 مباشرةً.

[green]مروحة Axial-tech بمحملين كرويّين:[/green] أطول عمراً من المحامل الانزلاقيّة، ومستوحاة من مراوح كروت ASUS.

[green]طلاء واقٍ من الرطوبة والغبار:[/green] يحمي لوحة الدارة.

[green]كابلات منفصلة بالكامل.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* درجة B في تقييم SPL، جيّدٌ لا ممتاز. ${SPL}.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا وضع إيقاف المروحة.

---
بإمكانك التوجه إلى [Corsair RM750e](/components/cmpnewrm750e0000000000000) إذا كان توجهك يتركز على الآتي:
* مزوّد 750 واط Gold بدرجة B+.
https://www.asus.com/motherboards-components/power-supply-units/tuf-gaming/tuf-gaming-750g/`,
  },
  {
    id: 'cmv18kn4x000kjgym1tcalzfh',
    description: `### Gigabyte P550SS ICE

مزوّد 550 واط أبيض اقتصاديّ بكفاءة Silver، لتجميعة بيضاء بكرتٍ متوسّط الاستهلاك مثل RTX 5060 أو RX 9060.

**التقنيات الأساسية المدعومة:**

[green]أبيض بالكامل:[/green] للتجميعات البيضاء الاقتصاديّة.

[green]مروحة 120 مم بمحمل FDB هادئة.[/green]

[green]كفاءة 80 PLUS Silver:[/green] أعلى من Bronze بقليل.

[green]حماية OPP وOVP وSCP.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* درجة C+ في تقييم SPL، وحدود الحماية مضبوطة بتحفّظ. ${SPL}.
* كابلات ثابتة غير منفصلة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يكفي كروت الفئة العليا، ولا يحوي كابل 12V-2x6.

---
بإمكانك التوجه إلى [MSI MAG A550BN](/components/cmr3b1d4e0001ncymhucwjtot) إذا كان توجهك يتركز على الآتي:
* مزوّد 550 واط برونزيّ أسود بسعرٍ قريب.
https://www.gigabyte.com/Power-Supply/GP-P550SS-ICE/sp`,
  },
  {
    id: 'cmv18kqa5001ijgymxsxq1xyc',
    description: `### Thermaltake Toughpower GT 850W Snow

مزوّد Thermaltake الأبيض بقدرة 850 واط ومعيار ATX 3.1، بكابل 12V-2x6 أصليّ ووضع إيقاف المروحة. لتجميعة بيضاء بكرت RTX 5070 Ti أو 5080.

**التقنيات الأساسية المدعومة:**

[green]معيار ATX 3.1 وكابل 12V-2x6 أصليّ (600 واط):[/green] يصل أقوى الكروت دون محوّل.

[green]وضع Smart Zero Fan:[/green] المروحة متوقّفة عند الحمل الخفيف، فالجهاز صامت في التصفّح والعمل.

[green]أبيض بالكامل مع الكابلات.[/green]

[green]مروحة 120 مم بمحمل هيدروليكيّ وحمايات كاملة:[/green] OVP وUVP وOCP وOPP وOTP وSCP، مع ضمان خمس سنوات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* غير مُدرَج في تقييم SPL بعد، فلا تقييم مستقلّاً لمكوّناته.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يُعرف مستوى مكوّناته باختبارٍ مستقلّ بعد.

---
بإمكانك التوجه إلى [Corsair RM850e 850W ATX 3.1 Gold White](/components/cmsxgetcm0006j8ymgue6lyuz) إذا كان توجهك يتركز على الآتي:
* مزوّد 850 واط أبيض بدرجة B+ في تقييم SPL.
https://latam.thermaltake.com/toughpower-gt-snow-850w.html`,
  },
  {
    id: 'cmv18kryd0021jgymjjkkjd6o',
    description: `### Lian Li RS1000G

مزوّد Lian Li بقدرة 1000 واط بمدخل كهرباء دوّار 90 درجة لترتيب الكابلات، ودرجة A في تقييم SPL. لجهازٍ قويّ في كيسٍ بحجرتين.

**التقنيات الأساسية المدعومة:**

[green]مدخل كهرباء دوّار:[/green] يناسب الكيسات بحجرتين، حيث يُركَّب المزوّد بوضعٍ غير معتاد.

[green]درجة A في تقييم SPL وكفاءة Cybenetics Platinum:[/green] ${SPL}.

[green]ضمان عشر سنوات ووضع إيقاف المروحة.[/green]

[green]معيار ATX 3.1 وكابل 12V-2x6.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* موزّع المراوح USB اختياريّ في نسخة 1000 واط، فلا يأتي معها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يختلف عن المزوّدات الجيّدة إلّا بالمدخل الدوّار.

---
بإمكانك التوجه إلى [Thermaltake Toughpower GF3 1000W](/components/cmpiechj4004a00ym7kkv09n4) إذا كان توجهك يتركز على الآتي:
* مزوّد 1000 واط بدرجة A+ بلا المدخل الدوّار.
https://lian-li.com/product/rs/`,
  },
  {
    id: 'cmv18kqtp001ojgymf89k8df4',
    description: `### Cooler Master Elite Gold 1000

مزوّد Cooler Master الجديد بقدرة 1000 واط Gold ومعيار ATX 3.1، بسعرٍ منخفض جداً لقدرته. يناسب جهازاً قويّاً بميزانيّةٍ محدودة.

**التقنيات الأساسية المدعومة:**

[green]أداءٌ كهربائيّ بمستوى الفئة A:[/green] بحسب تقييم SPL، فالجهد ثابت والحمايات سليمة.

[green]معيار ATX 3.1 وكابل 12V-2x6:[/green] لكروت RTX 50.

[green]كابلات منفصلة بالكامل.[/green]

[green]سعرٌ منخفض لمزوّد 1000 واط:[/green] من أرخص الطرق إلى هذه القدرة بجودةٍ مقبولة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* درجته الإجماليّة B+ في تقييم SPL، لأنّ المروحة تحدّ من أدائه الحراريّ والصوتيّ. ${SPL}.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس الأهدأ تحت الحمل الثقيل.

---
بإمكانك التوجه إلى [Thermaltake Toughpower GF3 1000W](/components/cmpiechj4004a00ym7kkv09n4) إذا كان توجهك يتركز على الآتي:
* مزوّد 1000 واط بدرجة A+.
https://www.coolermaster.com/en-global/products/elite-gold-1000/`,
  },
  {
    id: 'cmv18ko81000wjgym4ao1dd8p',
    description: `### Gigabyte UD750GM PG5 V2

مزوّد 750 واط Gold بكابلات منفصلة ومعيار ATX 3.1 بسعرٍ منخفض، لكنّ تقييم جودته متواضع. يناسب جهازاً متوسّط الاستهلاك.

**التقنيات الأساسية المدعومة:**

[green]كابل 12V-2x6:[/green] لكروت RTX 40 و50 دون محوّل.

[green]كابلات منفصلة بالكامل:[/green] ترتيبٌ أسهل.

[green]مروحة 120 مم بمحمل هيدروليكيّ.[/green]

[green]كفاءة 80 PLUS Gold.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* درجة C+ في تقييم SPL: «مشكلاتٌ متعدّدة» منها ضعف الاستجابة لقفزات الاستهلاك. ${SPL}.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يُنصح به لكروت الفئة العليا.

---
بإمكانك التوجه إلى [be quiet! Pure Power 13 M 750W](/components/cmuzymvix001qwwymtyp9yo7k) إذا كان توجهك يتركز على الآتي:
* مزوّد 750 واط بدرجة B+ ومروحة تتوقّف عند الحمل الخفيف.
https://www.gigabyte.com/Power-Supply/GP-UD750GM-PG5-V2/sp`,
  },
  {
    id: 'cmv18kpf30019jgymwl2o5bmc',
    description: `### Cooler Master GX III Gold 750

مزوّد Cooler Master بقدرة 750 واط Gold، بكابل 12VHPWR بزاوية 90 درجة ووضع إيقاف المروحة. يناسب جهاز ألعابٍ متوسّطاً في كيسٍ ضيّق.

**التقنيات الأساسية المدعومة:**

[green]كابل 12VHPWR بزاوية 90 درجة:[/green] أسهل في الكيسات الضيّقة، ولا يُثنى الكابل بشدّة عند الكرت.

[green]وضع Zero RPM:[/green] المروحة تتوقّف عند الحمل الخفيف.

[green]درجة B+ في تقييم SPL:[/green] ${SPL}.

[green]كابلات منفصلة بالكامل.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* معيار ATX 3.0 لا 3.1.
* مروحة Yate Loon بمحمل Rifle، وهي ليست الأهدأ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يُعدّ من الفئة العليا.

---
بإمكانك التوجه إلى [Cooler Master GX III Gold 850W](/components/cmpiechc0004900ymibo2v8bf) إذا كان توجهك يتركز على الآتي:
* المزوّد نفسه بقدرة 850 واط.
https://www.coolermaster.com/en-global/products/gx-iii-gold-750/`,
  },
  {
    id: 'cmv18kr38001rjgym628gnahq',
    description: `### ASUS TUF Gaming 1000W Gold White

النسخة البيضاء من مزوّد TUF بقدرة 1000 واط: كابلات بيضاء، ومروحة بمحملين كرويّين، وطلاء واقٍ. لتجميعة بيضاء قويّة بكرت RTX 5080 أو 5090.

**التقنيات الأساسية المدعومة:**

[green]أبيض مع الكابلات:[/green] للتجميعات البيضاء.

[green]مروحة Axial-tech بمحملين كرويّين وطلاء واقٍ للوحة الدارة.[/green]

[green]كابل 16 سنّاً:[/green] للكروت الحديثة دون محوّل.

[green]1000 واط:[/green] هامشٌ واسع لأقوى الكروت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* درجة B في تقييم SPL. ${SPL}.
* معيار ATX 3.0 لا 3.1.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا وضع إيقاف المروحة.

---
بإمكانك التوجه إلى [Corsair RM1000e 1000W ATX 3.1 White](/components/cmsxgeuty000ij8ymqxeue551) إذا كان توجهك يتركز على الآتي:
* مزوّد 1000 واط أبيض بدرجة B+ ومعيار ATX 3.1.
https://www.asus.com/motherboards-components/power-supply-units/tuf-gaming/tuf-gaming-1000g-white/`,
  },
  {
    id: 'cmuzkkjnq001gu4ymz0uwv1nu',
    description: `### ASUS Prime 750W Bronze

مزوّد 750 واط اقتصاديّ من ASUS، يكفي جهازاً بكرتٍ متوسّط ويترك هامشاً للترقية.

**التقنيات الأساسية المدعومة:**

[green]750 واط بكفاءة 80 PLUS Bronze:[/green] قدرةٌ أعلى من مزوّدات 550 و650 الاقتصاديّة بفرقٍ صغير.

[green]مروحة 135 مم بمحامل كرويّة مزدوجة:[/green] أطول عمراً من المحامل الانزلاقيّة.

[green]علامة ASUS:[/green] ضمانٌ ودعمٌ متوفّران محلّيّاً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ليس في القائمة الرئيسيّة لتقييم SPL، فلا تقييم مستقلّاً لجودته عندنا.
* كفاءة برونزيّة: هدرٌ وحرارةٌ أعلى من الذهبيّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* كابلاتٌ ثابتة غير قابلة للفكّ.

---
بإمكانك التوجه إلى [MSI MAG A650BN](/components/cmtcr2j4f0010o8ymgl50aa7g) إذا كان توجهك يتركز على الآتي:
* مزوّدٌ أرخص بقدرة 650 واط لجهازٍ أخفّ.
https://www.asus.com/motherboards-components/power-supply-units/prime/prime-750b-black/techspec/`,
  },
  {
    id: 'cmv18kny5000tjgymf5aut15t',
    description: `### ASUS TUF Gaming 750W Bronze EVO

مزوّد TUF البرونزيّ الجديد بكابلات منفصلة بالكامل ومعيار ATX 3.1، وهي ميزةٌ نادرة في الفئة البرونزيّة. يناسب جهاز ألعابٍ متوسّطاً بميزانيّةٍ محدودة.

**التقنيات الأساسية المدعومة:**

[green]كابلات منفصلة بالكامل:[/green] في مزوّدٍ برونزيّ، فالكيس مرتّب.

[green]مروحة بمحملين كرويّين وطلاء واقٍ للوحة الدارة.[/green]

[green]معيار ATX 3.1 وكابل 12V-2x6:[/green] لكروت RTX 50.

[green]750 واط:[/green] تكفي جهازاً بكرت RTX 5070 مع معالجٍ متوسّط.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* إصدار 2026 غير مُدرَج في تقييم SPL بعد.
* كفاءة Bronze، فحرارته واستهلاكه أعلى من Gold.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا وضع إيقاف المروحة.

---
بإمكانك التوجه إلى [MSI MAG A750GL PCIe 5](/components/cmpnewmaga750gl000000000) إذا كان توجهك يتركز على الآتي:
* مزوّد 750 واط Gold بسعرٍ قريب.
https://www.asus.com/motherboards-components/power-supply-units/tuf-gaming/tuf-gaming-750b-evo/`,
  },
  {
    id: 'cmv18kovh0013jgymcr0rebtr',
    description: `### NZXT C750 Gold Core

نسخة Core من سلسلة NZXT C لعام 2025 بقدرة 750 واط: درجة A في تقييم SPL وضجيجٌ منخفض جداً. يناسب جهاز ألعابٍ متوسّطاً هادئاً.

**التقنيات الأساسية المدعومة:**

[green]درجة A في تقييم SPL:[/green] ${SPL}، وA جودة مكوّناتٍ وأداءٌ كهربائيّ ممتازان.

[green]مروحة 135 مم بمحمل FDB:[/green] من الأهدأ في فئته.

[green]معيار ATX 3.1 وكابل 12V-2x6 بقدرة 300 واط.[/green]

[green]كابلات منفصلة بالكامل وضمان سبع سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* كابل 12V-2x6 بقدرة 300 واط لا 600، فيكفي كروتاً حتى RTX 5070 تقريباً.
* تنبّه SPL إلى تذبذبٍ طفيف في خطّ 12 فولت في نسخة 750 تحديداً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس للكروت الأعلى استهلاكاً.

---
بإمكانك التوجه إلى [NZXT C850 Gold](/components/cmpiech5s004800ymicj1g7qh) إذا كان توجهك يتركز على الآتي:
* مزوّد NZXT 850 واط بدرجة A وكابلٍ بقدرةٍ أعلى.
https://nzxt.com/products/c750-gold-core`,
  },
  {
    id: 'cmuzymunt001hwwymq2c46orm',
    description: `### Gigabyte UD850GM PG5 V2

مزوّد 850 واط Gold بكابلات منفصلة ومعيار ATX 3.1 بسعرٍ منخفض، لكنّ تقييم جودته متواضع.

**التقنيات الأساسية المدعومة:**

[green]كابل 16 سنّاً:[/green] لكروت RTX 40 و50 دون محوّل.

[green]كابلات منفصلة بالكامل:[/green] ومعيار ATX 3.1.

[green]مروحة 120 مم بمحمل هيدروليكيّ:[/green] تتوقّف تحت 20% من الحمل.

[green]850 واط بسعر مزوّدات 750.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* درجة C+ في تقييم SPL: «مشكلاتٌ متعدّدة» منها ضعف الاستجابة لقفزات الاستهلاك. ${SPL}.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يُنصح به لكروت الفئة العليا، فمزوّداتٌ بالسعر نفسه تقريباً أعلى جودة.

---
بإمكانك التوجه إلى [Seasonic Focus GX-850](/components/cmr3crglp0004ncym20vrcnug) إذا كان توجهك يتركز على الآتي:
* مزوّد 850 واط بدرجة A- في تقييم SPL.
https://www.gigabyte.com/Power-Supply/GP-UD850GM-PG5-V2/sp`,
  },
  {
    id: 'cmuztrx4j0015kcymrze3tagt',
    description: `### DeepCool PX1300P

مزوّد 1300 واط بكفاءة Platinum ودرجة A+ في تقييم SPL، من أقوى مزوّدات DeepCool. لمحطّة عملٍ أو جهاز ألعابٍ رائد بكرت RTX 5090 ومعالجٍ ثقيل.

**التقنيات الأساسية المدعومة:**

[green]درجة A+ في تقييم SPL:[/green] ${SPL}، وA+ أعلى درجاتها.

[green]كفاءة 80 PLUS Platinum:[/green] هدرٌ وحرارةٌ أقلّ من Gold، وهو فرقٌ ملموس في هذه القدرة.

[green]كابل 12VHPWR بقدرة 600 واط:[/green] ومحوّلٌ إضافيّ من 8 سنون.

[green]مكثّفات يابانيّة بالكامل وكابلات منفصلة بالكامل.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* طوله 160 مم ومروحته 120 مم، فهو أطول من مزوّدات 150 مم.
* معيار ATX 3.0 لا 3.1.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* 1300 واط فوق حاجة معظم الأجهزة.

---
بإمكانك التوجه إلى [Corsair HX1500i](/components/cmpiecicv004e00ymu52u0a1i) إذا كان توجهك يتركز على الآتي:
* 1500 واط Platinum بدرجة A+ ومراقبة رقميّة.
https://www.deepcool.com/products/PowerSupplyUnits/powersupplyunits/PX1300P-ATX-3.0-Platinum-Power-Supply/2023/17420.shtml`,
  },
  {
    id: 'cmpi5h9s2000704l1iq4czxdf',
    description: `### MSI MAG A650GL

مزوّد طاقة بقدرة 650 واط وكفاءة Gold وكابلات منفصلة، لتجميعات الفئة المتوسّطة التي لا تستهلك طاقةً عالية، مثل جهازٍ بكرت RTX 5060 أو RX 9060 XT.

**التقنيات الأساسية المدعومة:**

[green]كابلات منفصلة بالكامل:[/green] تركّب ما تحتاجه فقط، فيبقى الكيس مرتّباً وتتحسّن التهوية.

[green]كفاءة 80 PLUS Gold:[/green] هدرٌ أقلّ وحرارةٌ أقلّ داخل الكيس من المزوّدات البرونزيّة.

[green]درجة B في تقييم SPL:[/green] ${SPL}، وB جودةٌ جيّدة لجهازٍ متوسّط.

[green]650 واط:[/green] قدرةٌ مريحة لكرتٍ حتى 200 واط مع معالجٍ متوسّط.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 650 واط لا تترك مساحةً لترقية الكرت لاحقاً إلى الفئة العليا (RTX 5070 Ti فما فوق).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا كابل 12V-2x6 أصليّ لكروت NVIDIA الحديثة، فيحتاج محوّلاً.

---
بإمكانك التوجه إلى [Corsair RM850 (2021)](/components/cmpfzir17000bx4ymjufo8pu8) إذا كان توجهك يتركز على الآتي:
* قدرةٌ أعلى تدعم ترقيات الكرت لسنوات.
https://www.msi.com/Power-Supply/MAG-A650GL/Specification`,
  },
  {
    id: 'cmuztrwdn000wkcymmc2rgwvw',
    description: `### Lian Li EDGE Gold 1200W White

النسخة البيضاء بقدرة 1200 واط من مزوّد Lian Li ذي الشكل L: موصلاته على الجانب، ومعه موزّع USB ومراوح. لتجميعة بيضاء رائدة في كيسٍ مصمّم له.

**التقنيات الأساسية المدعومة:**

[green]موصلات جانبيّة:[/green] الكابلات تخرج من جانب المزوّد فتختفي خلف اللوحة تماماً.

[green]موزّع EDGE Hub مرفق:[/green] ستّة رؤوس مراوح ومنافذ USB داخليّة.

[green]درجة A في تقييم SPL وكفاءة Cybenetics Gold:[/green] ${SPL}.

[green]معيار ATX 3.1 وكابل 12V-2x6 بقدرة 600 واط.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* طوله 182 مم وشكله غير معتاد، فهو مصمّمٌ لكيساتٍ بعينها. تأكّد من التوافق.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يناسب الكيسات الصغيرة أو ذات غطاء المزوّد الضيّق.

---
بإمكانك التوجه إلى [NZXT C1200 Gold ATX 3.1](/components/cmuzsa3co001qu8ymzvekx5wu) إذا كان توجهك يتركز على الآتي:
* 1200 واط بدرجة A+ وتصميمٍ عاديّ يركب في أيّ كيس.
https://lian-li.com/product/edge-gold/`,
  },
  {
    id: 'cmuzymv90001nwwymbey6gel7',
    description: `### ASUS TUF Gaming 850W Gold EVO

الإصدار الأحدث من مزوّد TUF بقدرة 850 واط: معيار ATX 3.1، وكفاءة Cybenetics Platinum على 230 فولت، وضمان ثماني سنوات. يناسب جهازاً بكرت RTX 5070 Ti أو 5080.

**التقنيات الأساسية المدعومة:**

[green]معيار ATX 3.1 وكابل 12V-2x6:[/green] لكروت RTX 50.

[green]كفاءة Cybenetics Platinum على 230 فولت:[/green] وهي كهرباء المنازل في السعوديّة، فالكفاءة الحقيقيّة عندنا أعلى ممّا تقوله شهادة 115 فولت.

[green]مروحة 135 مم بمحملين كرويّين:[/green] وطولٌ مدمج (140 مم) يركب في الكيسات الصغيرة.

[green]ضمان ثماني سنوات ودرجة B+ في تقييم SPL:[/green] ${SPL}.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* تصنيف ضوضاء Cybenetics ‏A-، فليس الأهدأ.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا وضع إيقاف المروحة.

---
بإمكانك التوجه إلى [Seasonic Focus GX-850](/components/cmr3crglp0004ncym20vrcnug) إذا كان توجهك يتركز على الآتي:
* مزوّد 850 واط بدرجة A- في تقييم SPL.
https://www.asus.com/motherboards-components/power-supply-units/tuf-gaming/tuf-gaming-850g-evo/techspec/`,
  },
  {
    id: 'cmuzsa3co001qu8ymzvekx5wu',
    description: `### NZXT C1200 Gold ATX 3.1

مزوّد 1200 واط بدرجة A+ في تقييم SPL وضمان عشر سنوات. لجهازٍ بكرت RTX 5090 أو معالجٍ ثقيل، أو لمن يخطّط لترقيةٍ كبيرة لاحقاً.

**التقنيات الأساسية المدعومة:**

[green]درجة A+ في تقييم SPL:[/green] ${SPL}، وA+ أعلى درجات الجودة لهذه القدرة.

[green]كابل 12V-2x6 (600 واط) وثلاثة كابلات 6+2:[/green] لكرت RTX 50 دون محوّلات.

[green]مروحة 135 مم بمحمل FDB:[/green] تتوقّف تماماً تحت 50% من الحمل.

[green]ضمان عشر سنوات ومكثّفات يابانيّة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* طوله 160 مم، أطول قليلاً من مزوّدات 150 مم، فتأكّد من الكيس.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* 1200 واط أكثر من حاجة معظم الأجهزة، وجهازٌ بكرتٍ متوسّط لا يستفيد منها.

---
بإمكانك التوجه إلى [DeepCool PQ1200G 1200W Gold](/components/cmsxgetv80008j8ymfin66hwj) إذا كان توجهك يتركز على الآتي:
* 1200 واط بسعرٍ أقلّ عادةً، بدرجة جودةٍ أقلّ (A-).
https://nzxt.com/products/c1200-gold-atx`,
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
