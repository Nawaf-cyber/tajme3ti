/**
 * ============ ثلاثة صناديق MAJESTY — أمازون + نون — 2026-10-13 ============
 *
 * طلب قطعة من زائر: «جميع صناديق كمبيوتر ماجيستي». ماجيستي (Majesty Technology —
 * متجرٌ بفروع في السعوديّة يبيع صناديقه) عندها ~٨ موديلات بأكثر من لون، ولا تُباع
 * إلّا في أمازون ونون (ومتجرها). فاقترحتُ لنوّاف ألّا نضيفها كلّها، فقال:
 * «ضيف 3 موديلات من ماجيستي» — ثلاث فئات سعر: X-Space (~٤١٠) وTitan (~٤٩٠)
 * وFalcon X بشاشة 9.2 بوصة (~٦٤٠). الأسود في الثلاثة (نون يحمله من متجر الشركة).
 *
 * التحقّق (كلّه اليوم):
 *   - أمازون: كلّ ASIN فُتح — العنوان ينتهي بـ«Black»، زرّ الشراء موجود، البائع
 *     Majesty Technology-SA، ورقم الموديل في جدول المواصفات (CASE-006/220/416).
 *   - نون: من بين ٤٤ نتيجة (فيها بائعون بأسعار ٦٣٥–١٤٩٠) اختيرت صفحة متجر الشركة
 *     نفسه لكلّ موديل، وقُرئ JSON-LD: X-Space ٤١٠ · Titan ٤٩٩ · Falcon X ٦٦٥ — InStock.
 *   - المواصفات: صفحات الشركة majestytechnology.com (رقم الموديل، اللون، الوزن) +
 *     نقاط أمازون + «Product Overview» في نون. Falcon X بالشاشة = «FALCON X + LCD»
 *     ‏CASE-416؛ وFalcon X بلا شاشة CASE-414 وFalcon CASE-412 قطعتان أخريان.
 *   - أبعاد صفحات الشركة منسوخةٌ بين الموديلات (41.8×28×41.8 لـTitan وFalcon معاً)
 *     فلا يُعتمد عليها؛ ومقاس مزوّد الطاقة لم تذكره الشركة ⇒ ATX مستنتجاً (كـGalaxy).
 *
 *   node scripts/add-majesty-cases-2026-10-13.mjs           # عرض
 *   node scripts/add-majesty-cases-2026-10-13.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const CASE = 'cmpfziquj0006x4ym53f0ehcw';
const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });
/* نون يدويّ (scrapeMode: off): السعر مقروءٌ اليوم بلوحة المتصفّح ويُكتب مع وقت الفحص */
const N = (path, price) => ({ store: 'noon', url: `https://www.noon.com/saudi-en/${path}/p/`, price, inStock: true });

const ALT = {
  KING65: ['Montech KING 65 PRO', 'cmtcr2hdn000ro8ym9825hfit'],
  CH560: ['DeepCool CH560 Digital', 'cmpiebxm6002800ymk4bd3ep4'],
  VISIONMD: ['Lian Li O11 Vision-M Digital', 'cmv0io7zn00040sym1hajbf1p'],
};
const alt = (k, ...why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const PSU_NOTE = 'مقاس مزوّد الطاقة مستنتجٌ ATX لأنّ الصندوق Mid Tower يقبل لوحات ATX؛ الشركة لم تذكره.';
const WARRANTY = 'ضمان سنتين مع تبديلٍ فوريّ من أيّ فرعٍ لماجيستي في السعوديّة';

const PARTS = [
  {
    categoryId: CASE, brand: 'MAJESTY', name: 'X-Space Black', tdpWattage: 0, performanceTier: 3,
    imageUrl: 'https://majestytechnology.com/wp-content/uploads/2025/07/0-1.webp',
    specs: {
      color: 'Black', formFactor: 'Mid Tower', includedFans: '7 × 120mm ARGB', maxGpuLength: '400', maxCoolerHeight: '157',
      radiatorSupport: '360mm', psuFormFactor: 'ATX',
      features: ['زجاج مقسّى بانوراميّ', 'يدعم لوحات Back-Connect', 'مراوح «بلوك» تجمع ثلاثاً بسلكٍ واحد'],
      notes: [PSU_NOTE],
    },
    offers: [
      A('B0DK1YY9XW'),
      N('majesty-x-space-mid-tower-pc-case-7-pre-installed-120mm-infinity-argb-fans-atx-support-360mm-water-cooler-support-type-c-2-x-usb-3-0-ports-back-connect-design-black/ZC2B4DBB326E9D5557456Z', 410),
    ],
    description: `### MAJESTY X-Space (أسود)

صندوق Mid Tower اقتصاديّ من ماجيستي (CASE-006) يأتي جاهزاً بسبع مراوح ARGB وزجاجٍ بانوراميّ، فتبدأ تجميعةً مضيئة دون شراء مراوح. يناسب تجميعة ألعاب متوسّطة بمبرّد مائيّ، ومن يريد ${WARRANTY}.

**التقنيات الأساسية المدعومة:**

[green]سبع مراوح ARGB مقاس 120 مم مركّبة:[/green] تبريدٌ كامل من أوّل يوم، وثمن طقم المراوح وحده يقارب ثمن صندوقٍ اقتصاديّ آخر.

[green]مراوح «بلوك» ثلاثٌ في قطعة:[/green] كلّ ثلاث مراوح موصولة معاً بسلكٍ واحد، فالتركيب أسهل والكابلات أقلّ خلف اللوحة.

[green]مبرّد مائيّ حتى 360 مم وكرت حتى 400 مم:[/green] يتّسع لأغلب الكروت الثلاثيّة الطويلة ولمبرّدات المعالجات المائيّة الكبيرة.

[green]يدعم لوحات الموصّلات الخلفيّة (Back-Connect):[/green] مثل ASUS BTF وMSI Project Zero، فتختفي الكابلات من واجهة التجميعة.

[green]تحكّم بالإضاءة والسرعة من اللوحة الأمّ:[/green] يتزامن مع Aura Sync وMystic Light وRGB Fusion، مع USB-C ومنفذَي USB 3.0 في الأمام وفلتر غبار مغناطيسيّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **سقف المبرّد الهوائيّ 157 مم** — أبراج التبريد المزدوجة الكبيرة لن تدخل؛ خطّط لمبرّدٍ مائيّ أو برجٍ منخفض.
* ماركةٌ محلّيّة بلا اختبارات حرارةٍ وضجيج مستقلّة نقيس عليها، ومقاس المزوّد لم تذكره الشركة (ATX مستنتجاً).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مكان لمشعّ 420 مم، ولا شاشة عرض.

${alt('KING65', 'سعرٌ مقارب وسقف مبرّدٍ هوائيّ 175 مم وكرت حتى 420 مم، من ماركةٍ معروفة الاختبارات — لكن بثلاث مراوح بدل سبع.')}
https://majestytechnology.com/product/majesty-x-space-black-mid-tower-7/`,
  },
  {
    categoryId: CASE, brand: 'MAJESTY', name: 'Titan Black', tdpWattage: 0, performanceTier: 3,
    imageUrl: 'https://majestytechnology.com/wp-content/uploads/2026/09/0-3.webp',
    specs: {
      color: 'Black', formFactor: 'Mid Tower', includedFans: '8 × 120mm ARGB', maxGpuLength: '420', maxCoolerHeight: '165',
      radiatorSupport: '360mm', psuFormFactor: 'ATX',
      features: ['واجهة وجانب أيسر من الزجاج المقسّى', 'يدعم لوحات Back-Connect', 'مراوح «بلوك» بسلكٍ واحد'],
      notes: [PSU_NOTE],
    },
    offers: [
      A('B0HK3N843W'),
      N('majesty-titan-mid-tower-pc-case-hi-end-pro-design-8-infinity-argb-block-fan-atx-support-360mm-water-cooler-support-type-c-2-x-usb-3-0-ports-back-connect-support-black/Z4C26FDFF6ED7F5CFADCAZ', 499),
    ],
    description: `### MAJESTY Titan (أسود)

صندوق Mid Tower واسع من ماجيستي (CASE-220) بهيكل فولاذ SPCC وواجهةٍ وجانبٍ من الزجاج، يأتي بثماني مراوح ARGB مركّبة. يناسب تجميعة ألعاب قويّة بكرتٍ طويل، ومن يريد ${WARRANTY}.

**التقنيات الأساسية المدعومة:**

[green]ثماني مراوح ARGB مقاس 120 مم مركّبة:[/green] ثلاثٌ في الأعلى وثلاثٌ في الأسفل واثنتان في الخلف — تدفّقٌ كامل من الأسفل إلى الأعلى دون أيّ شراءٍ إضافيّ.

[green]كرت حتى 420 مم ومبرّد هوائيّ حتى 165 مم:[/green] يتّسع لأطول الكروت الحاليّة ولأغلب الأبراج المفردة والمزدوجة المتوسّطة.

[green]مبرّد مائيّ حتى 360 مم:[/green] مع ألواحٍ شبكيّة في الأعلى والأسفل وفلاتر غبار.

[green]يدعم لوحات الموصّلات الخلفيّة (Back-Connect):[/green] تجميعةٌ أنظف بكابلاتٍ مخفيّة، مع لوحات ATX وMicro-ATX وMini-ITX.

[green]تخزينٌ مرن ومنافذ حديثة:[/green] ثلاثة أقراص 2.5 بوصة وقرص 3.5 بوصة، وUSB-C بسرعة 3.1 ومنفذا USB 3.0 في الأمام، وتحكّمٌ بالإضاءة من اللوحة الأمّ.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الواجهة زجاجٌ بلا مراوح، فالهواء البارد يدخل من الأسفل — لا تضعه على سجّادٍ أو سطحٍ يسدّ قاعدته.
* كبيرٌ نسبيّاً (نحو 460 × 290 × 476 مم)، وماركةٌ محلّيّة بلا اختبارات حرارةٍ مستقلّة، ومقاس المزوّد مستنتج (ATX).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مكان لمشعّ 420 مم، ولا شاشة عرض.

${alt('CH560', 'أرخص بواجهةٍ شبكيّة تُدخل الهواء من الأمام، وسقف مبرّدٍ هوائيّ 175 مم وشاشة حرارة — لكن بأربع مراوح وكرتٍ حتى 380 مم.')}
https://majestytechnology.com/product/majesty-titan-pc-case-black-8-argb/`,
  },
  {
    categoryId: CASE, brand: 'MAJESTY', name: 'Falcon X LCD Black', tdpWattage: 0, performanceTier: 4,
    imageUrl: 'https://majestytechnology.com/wp-content/uploads/2026/02/0-25.webp',
    specs: {
      color: 'Black', formFactor: 'Mid Tower', includedFans: '8 × 120mm ARGB', maxGpuLength: '420', maxCoolerHeight: '165',
      radiatorSupport: '360mm', psuFormFactor: 'ATX', screen: '9.2"',
      features: ['شاشة أماميّة 9.2 بوصة للفيديو ومعلومات النظام', 'يدعم لوحات Back-Connect', 'USB-C و2× USB 3.0 و4× USB 2.0 في الأعلى'],
      notes: [PSU_NOTE],
    },
    offers: [
      A('B0GNMV4QK6'),
      N('majesty-falcon-x-mid-tower-pc-case-9-2-inch-video-display-hi-end-professional-design-8-infinity-argb-block-fan-atx-support-360mm-water-cooler-supports-rear-plug-black/ZF8B73D7559E84D3436B3Z', 665),
    ],
    description: `### MAJESTY Falcon X + LCD (أسود)

نسخة الشاشة من صندوق Falcon X لماجيستي (CASE-416): شاشةٌ أماميّة مدمجة 9.2 بوصة مع ثماني مراوح ARGB وهيكلٍ زجاجيّ. يناسب من يريد تجميعة استعراضيّة تعرض فيديو أو معلومات النظام، مع ${WARRANTY}.

**التقنيات الأساسية المدعومة:**

[green]شاشة أماميّة مدمجة 9.2 بوصة:[/green] تعرض فيديو وصوراً متحرّكة ومعلومات النظام وتصاميمك الخاصّة — لمسةٌ نادرة في هذا السعر.

[green]ثماني مراوح ARGB مقاس 120 مم مركّبة:[/green] بتصميم «بلوك» يقلّل الأسلاك، ومتزامنة مع إضاءة اللوحة الأمّ (Aura Sync وMystic Light وRGB Fusion).

[green]كرت حتى 420 مم ومبرّد هوائيّ حتى 165 مم:[/green] يتّسع لأطول الكروت الحاليّة ولأغلب الأبراج المتوسّطة.

[green]مبرّد مائيّ 360 مم في الأعلى أو على الجانب:[/green] مرونةٌ في مكان المشعّ مع لوحات ATX وMicro-ATX وMini-ITX ولوحات Back-Connect.

[green]منافذ كثيرة في الأعلى:[/green] USB-C ومنفذا USB 3.0 وأربعة USB 2.0 وصوت، مع قرصين 2.5 بوصة وقرصين 3.5 بوصة وفلاتر غبار مغناطيسيّة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المصادر لا تذكر دقّة الشاشة ولا طريقة تشغيلها (البرنامج والوصلة) — اسأل البائع قبل الشراء إن كانت الشاشة سبب اختيارك.
* النسخة نفسها بلا شاشة (FALCON X، ‏CASE-414) أرخص بوضوح؛ والماركة محلّيّة بلا اختبارات حرارةٍ مستقلّة، ومقاس المزوّد مستنتج (ATX).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مكان لمشعّ 420 مم.

${alt('VISIONMD', 'شاشةٌ بالمقاس نفسه (9.2 بوصة IPS بدقّة 1920×462) وبسعرٍ مقارب من Lian Li، بجودة تصنيعٍ واختباراتٍ معروفة — لكن بمروحةٍ واحدة بدل ثمانٍ.')}
https://majestytechnology.com/product/majesty-falcon-x-mid-tower-8-argb-fans/`,
  },
];

const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
let blocked = false;
const bad = (m) => { blocked = true; console.log(`    ⛔ ${m}`); };

for (const p of PARTS) {
  console.log(`\n=== ${p.brand} ${p.name}  (t${p.performanceTier})  وصف ${p.description.length} حرفاً`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  const dup = await prisma.component.findFirst({ where: { name: { equals: p.name, mode: 'insensitive' }, brand: { equals: p.brand, mode: 'insensitive' } } });
  if (dup) bad(`موجودة: ${dup.id}`);
  if (/\*\*\[(yellow|red)\]/.test(p.description)) bad('نجومٌ حول وسمٍ ملوّن');
  if (!/^https:\/\/\S+$/.test(p.description.trim().split('\n').pop())) bad('آخر سطرٍ ليس رابط الصانع');
  if (new Set(p.offers.map((o) => o.store)).size < 2) bad('أقلّ من متجرين');
  for (const o of p.offers) {
    if (!stores[o.store]) { bad(`لا متجر «${o.store}»`); continue; }
    const base = o.url.replace(/\/$/, '');
    const asin = (base.match(/\/dp\/([A-Z0-9]{10})$/) || [])[1];
    const noonId = (base.match(/\/(Z[0-9A-F]+Z)\/p$/) || [])[1];
    const taken = await prisma.componentOffer.findFirst({ where: { OR: [{ url: base }, { url: base + '/' }, ...(asin ? [{ url: { contains: `/dp/${asin}` } }] : []), ...(noonId ? [{ url: { contains: noonId } }] : [])] }, select: { component: { select: { name: true } } } });
    if (taken) bad(`رابط ${o.store} مستعمل في: ${taken.component.name}`);
    else console.log(`    ✔ ${o.store}${o.price ? ` ${o.price}` : ''}`);
  }
}
for (const [name, id] of Object.values(ALT)) {
  const c = await prisma.component.findUnique({ where: { id }, select: { brand: true, name: true } });
  if (!c) bad(`البديل ${name} (${id}) لا يشير إلى قطعة`);
  else if (`${c.brand} ${c.name}` !== name) bad(`البديل ${id} اسمه «${c.brand} ${c.name}» لا «${name}»`);
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log(`\n${PARTS.length} قطع — (عرضٌ فقط — أضف --apply)`); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-majesty-${stamp}.json`, JSON.stringify({ PARTS }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-majesty-${stamp}.json`);

const ids = [];
for (const p of PARTS) {
  const { offers, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  for (const o of offers) {
    await prisma.componentOffer.create({
      data: o.store === 'noon'
        ? { componentId: c.id, storeId: stores.noon, url: o.url, price: o.price, inStock: o.inStock, lastCheckedAt: new Date() }
        : { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: true },
    });
  }
  ids.push(c.id);
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}
console.log(`\nالتالي (واحدةً واحدة):\n  ${ids.join(' ')}`);
await prisma.$disconnect();
