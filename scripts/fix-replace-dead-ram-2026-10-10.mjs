/**
 * 2026-10-10 — قرار نوّاف «عدلها كلها لكن 2 اترك القرار لك» على أربع رامات بلا رابطٍ مطابق:
 *
 * (١) استبدال ثلاثة صفوف **في مكانها** (المعرّف نفسه) بإصدارٍ موجودٍ فعلاً — لأنّ تجميعتين محفوظتين وتجميعة جاهزة
 *     تشير إليها، فالاستبدال يجعلها تشير إلى قطعةٍ تُشترى بدل «لا سعر مسجّل»:
 *   - Crucial Pro DDR5 32GB 5600 CL46 (CP2K16G56C46U5، لا يُباع)  →  Crucial Pro 32GB 6000 CL36 **أبيض** CP2K16G60C36U5W
 *       (الأسود CP2K16G60C36U5B صفٌّ قائم cmuzymt7k0012wwymlkey8obj فلا يُكرَّر). أمازون B0D2JLWLWZ (2191.68، In Stock).
 *       المواصفات من crucial.com (صفحة الأسود، الطقم نفسه): 36-38-38-80، 1.35V، JEDEC 5600 46-45-45، XMP 3.0 وEXPO، ضمان محدود مدى الحياة.
 *   - Corsair Dominator Titanium 48GB 7200 White (لا رابط؛ صفحة مايكرولس متناقضة ونافدة)  →  Dominator Titanium RGB 32GB 6000 CL30 **White**
 *       CMP32GX5M2B6000Z30W. أمازون B0F32S38P7 (3533.71). المواصفات من corsair.com: CL30، 1.40V، EXPO وXMP، 11 نقطة RGB، ضمان مدى الحياة.
 *       (الرماديّ CMP32GX5M2B6000Z30 صفٌّ قائم.)
 *   - Silicon Power Zenith DDR5 32GB 6000 (بلا RGB، رماديّ/أسود — لا يُباع)  →  Zenith DDR5 32GB 6000 **White** SU032GXLWU60AFDGSW.
 *       أمازون B0FYPNNWVS (2870). ⚠️ جدول silicon-power.com يعطي هذا الرمز توقيت 36-36-36-96 وأمازون يكتب CL30 ⇒ سُجّل الأحوط CL36.
 *       وصورة الصفّ القديمة كانت صورة Corsair Vengeance (بقيّة رابط أمازون الخاطئ) فتُمسح ليُجلب البديل.
 *   سجلّ الأسعار لهذه الثلاثة يُحذف (بعد النسخ): كلّه من أمازون لروابط خاطئة سابقة، ولا يخصّ القطعة الجديدة.
 *
 * (٢) قراري في Corsair Vengeance DDR5 32GB 6000 CL36 (CMK32GX5M2D6000Z36): يُربط أمازون **F6000Z36** (B0FV3JQB3H، 2588.99):
 *     المواصفة الرسميّة نفسها (32GB، 6000، CL36، رماديّ، EXPO وXMP) — المراجعات D/E/F تختلف في مصدر الشرائح لا في التقنين.
 *     ويُضاف سطرٌ أصفر يقول ذلك صراحةً. (سجلّ أسعاره القديم باقٍ — داخلٌ في قرار حذف التاريخ المعلّق.)
 *
 *   node scripts/fix-replace-dead-ram-2026-10-10.mjs           # عرض
 *   node scripts/fix-replace-dead-ram-2026-10-10.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });

const ALT = {
  CRUCIALB: ['Crucial Pro 32GB (2x16GB) DDR5 6000MHz CL36', 'cmuzymt7k0012wwymlkey8obj'],
  DOMGREY: ['Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5 6000MHz CL30 Grey', 'cmv1edqub0009d0ymkxz16cwd'],
  VENG30: ['Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz CL30', 'cmv18klcb0000jgymj6mis6yg'],
};
const alt = (k, ...why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const REPLACE = [
  {
    id: 'cmpiecptm005a00ym19nh2ieb', was: 'Pro DDR5 32GB 5600MHz',
    name: 'Pro 32GB (2x16GB) DDR5 6000MHz CL36 White', performanceTier: 3,
    specs: { kit: '2x16GB', rgb: 'No', type: 'DDR5', color: 'White', speed: '6000', profile: 'XMP 3.0 & EXPO', capacity: '32GB', casLatency: 'CL36' },
    offers: [A('B0D2JLWLWZ')],
    description: `### Crucial Pro 32GB (2x16GB) DDR5 6000MHz CL36 (أبيض)

طقم Crucial Pro الأبيض لكسر السرعة من Micron: 32 جيجابايت بسرعة 6000 وتوقيت CL36، بمشتّتٍ أبيض بسيط. يناسب تجميعة بيضاء بمعالج Ryzen 7000/9000 أو Intel Core Ultra لمن يريد ذاكرة ألعابٍ موثوقة بلا إضاءة.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت 36-38-38-80:[/green] النقطة المثلى لمعالجات Ryzen، وسرعةٌ جيّدة لمعالجات Intel — بحسب جدول Crucial.

[green]ملفّا XMP 3.0 وEXPO:[/green] تفعيلٌ بضغطة على لوحات Intel وAMD.

[green]يعمل 5600 بلا أيّ ضبط:[/green] السرعة الافتراضيّة (JEDEC) 5600 بتوقيت 46-45-45، فيشتغل على أيّ لوحة DDR5 قبل تفعيل الملفّ.

[green]جهد 1.35 فولت فقط:[/green] أقلّ من أطقم 6000 CL30 (1.40 فولت)، فحرارته أقلّ.

[green]شرائح Micron وضمان محدود مدى الحياة:[/green] الطقم والشرائح من مصنّعٍ واحد.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* توقيت CL36 أبطأ قليلاً من أطقم CL30 — فرقٌ صغير في الألعاب.
* متوفّر الآن في أمازون فقط؛ النسخة السوداء في متجرين.
* Crucial لا تنشر صفحةً للنسخة البيضاء؛ المواصفات من صفحة الطقم الأسود (الرمز نفسه عدا اللاحقة W).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB.
* لا يُركَّب على لوحات DDR4.

${alt('CRUCIALB', 'الطقم نفسه باللون الأسود، متوفّر في أمازون ومايكرولس.')}
https://www.crucial.com/memory/ddr5/cp2k16g60c36u5b`,
  },
  {
    id: 'cmpiecq26005b00ymniswty6k', was: 'Dominator Titanium 48GB 7200MHz',
    name: 'Dominator Titanium RGB 32GB (2x16GB) DDR5 6000MHz CL30 White', performanceTier: 4,
    specs: { kit: '2x16GB', rgb: 'Yes', type: 'DDR5', color: 'White', speed: '6000', profile: 'XMP 3.0 & EXPO', capacity: '32GB', heightMm: '57', casLatency: 'CL30' },
    offers: [A('B0F32S38P7')],
    description: `### Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5 6000MHz CL30 (أبيض)

النسخة البيضاء من أفخم سلاسل Corsair للذاكرة: مشتّت ألومنيوم مصبوب، وإضاءة RGB قابلة للعنونة، وأشرطة علويّة قابلة للتبديل. أداؤها أداء 6000 CL30 المعروف، وما تدفعه زيادةً تدفعه للشكل والتبريد في تجميعة بيضاء.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s بتوقيت CL30:[/green] النقطة المثلى لمعالجات Ryzen 7000 و9000، وسرعةٌ ممتازة لمعالجات Intel.

[green]ملفّا AMD EXPO وIntel XMP:[/green] تفعيلٌ بضغطة على المنصّتين.

[green]تبريد DHX:[/green] الحرارة تُسحب من الشرائح ومن اللوحة المطبوعة معاً، فتبقى الذاكرة أبرد عند كسر السرعة.

[green]إضاءة RGB قابلة للعنونة:[/green] تُدار ببرنامج iCUE، وتنسجم مع تجميعة بيضاء.

[green]ضمان محدود مدى الحياة من Corsair:[/green] بحسب صفحة الطقم.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ارتفاعها قرابة 57 مم، أطول من أغلب الأطقم — راجع خلوص المبرّد الهوائيّ.
* جهد 1.40 فولت، وسعرها أعلى بكثير من أطقم 6000 CL30 العاديّة.
* متوفّرة الآن في أمازون فقط، بشحنٍ يستغرق أيّاماً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا تعطي إطاراً واحداً زيادةً على أطقم 6000 CL30 الأرخص.
* لا تُركَّب على لوحات DDR4.

${alt('DOMGREY', 'الطقم نفسه باللون الرماديّ، متوفّر في أمازون ومايكرولس.')}
https://www.corsair.com/us/en/p/memory/cmp32gx5m2b6000z30w/dominator-titanium-rgb-32gb-2x16gb-ddr5-dram-6000mt-s-cl30-amd-expo-memory-kit-white-cmp32gx5m2b6000z30w`,
  },
  {
    id: 'cmpiecqry005e00ymvr32waij', was: 'Zenith DDR5 32GB 6000MHz',
    name: 'Zenith DDR5 32GB 6000MHz White', performanceTier: 3,
    specs: { kit: '2x16GB', rgb: 'No', type: 'DDR5', color: 'White', speed: '6000', profile: 'XMP 3.0 & EXPO', capacity: '32GB', heightMm: '38.5', casLatency: 'CL36' },
    offers: [A('B0FYPNNWVS')],
    description: `### Silicon Power XPOWER Zenith DDR5 32GB 6000MHz (أبيض)

طقم Zenith من Silicon Power بسعة 32 جيجابايت (2×16) وسرعة 6000، بمشتّت ألومنيوم أبيض بلمسةٍ مصقولة وبلا إضاءة. يناسب تجميعة بيضاء هادئة الشكل.

**التقنيات الأساسية المدعومة:**

[green]6000 MT/s:[/green] السرعة المثلى لمعالجات Ryzen 7000 و9000، وسرعةٌ جيّدة لمعالجات Intel.

[green]ملفّا Intel XMP 3.0 وAMD EXPO:[/green] تفعيلٌ بضغطة على المنصّتين.

[green]جهد 1.35 فولت:[/green] حرارةٌ أقلّ من أطقم 1.40 فولت.

[green]مشتّت ألومنيوم منخفض:[/green] لا يتعارض مع أغلب المبرّدات الهوائيّة.

[green]ضمان محدود مدى الحياة:[/green] بحسب صفحة Silicon Power.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **التوقيت غير محسوم**: جدول Silicon Power يعطي هذا الرمز (SU032GXLWU60AFDGSW) توقيت 36-36-36-96، وعنوان أمازون يكتب CL30 — سجّلنا CL36 الأحوط.
* متوفّر الآن في أمازون فقط، بشحنٍ يستغرق أيّاماً، وسعره أعلى من أطقم Corsair وCrucial المماثلة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB.
* لا يُركَّب على لوحات DDR4.

${alt('VENG30', 'طقم 6000 بتوقيت CL30 مؤكّد ومتوفّر في أكثر من متجر.')}
https://www.silicon-power.com/product-detail/XPOWER_Zenith_DDR5_Gaming_UDIMM/`,
  },
];

const VENG = {
  id: 'cmpiebd2l001e00ym1y8bzzlv', name: 'Vengeance DDR5 32GB 6000MHz',
  offer: A('B0FV3JQB3H'),
  after: '* توقيت CL36 أبطأ قليلاً من نسخة CL30.',
  add: '* رابط أمازون للمراجعة **F** (CMK32GX5M2F6000Z36)، والصفّ مسجّلٌ بالمراجعة D: التقنين نفسه (6000 CL36 بملفّي EXPO وXMP)، والفرق في مصدر الشرائح.',
};

// ---------------------------------------------------------------- الفحص
const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
let bad = false;
const stop = (m) => { console.log('⛔ ' + m); bad = true; };
for (const r of REPLACE) {
  const c = await prisma.component.findUnique({ where: { id: r.id }, select: { brand: true, name: true, offers: { select: { id: true, url: true } }, _count: { select: { priceHistory: true } } } });
  if (!c || c.name !== r.was) { stop(`${r.id} ليس «${r.was}»`); continue; }
  const dup = await prisma.component.findFirst({ where: { name: { equals: r.name, mode: 'insensitive' }, brand: c.brand, NOT: { id: r.id } } });
  if (dup) stop(`«${r.name}» موجود: ${dup.id}`);
  if (/\*\*\[(yellow|red)\]/.test(r.description)) stop('نجوم حول وسم');
  for (const o of r.offers) {
    const asin = o.url.match(/\/dp\/([A-Z0-9]{10})/)[1];
    const t = await prisma.componentOffer.findFirst({ where: { url: { contains: `/dp/${asin}` } }, select: { component: { select: { name: true } } } });
    if (t) stop(`${asin} مستعمل في ${t.component.name}`);
  }
  console.log(`↻ ${c.brand} ${c.name}  →  ${r.name}   (عروض قديمة ${c.offers.length}، تاريخ ${c._count.priceHistory} نقطة يُحذف)`);
}
for (const [k, [n, id]] of Object.entries(ALT)) {
  const c = await prisma.component.findUnique({ where: { id }, select: { brand: true, name: true } });
  if (!c || `${c.brand} ${c.name}` !== n) stop(`البديل ${k}: «${c ? c.brand + ' ' + c.name : '—'}» لا «${n}»`);
}
const v = await prisma.component.findUnique({ where: { id: VENG.id }, select: { name: true, description: true } });
if (!v || v.name !== VENG.name) stop('Vengeance تغيّر');
else if (!v.description.includes(VENG.after)) stop('سطر Vengeance المرجعيّ مفقود');
const vt = await prisma.componentOffer.findFirst({ where: { url: { contains: '/dp/B0FV3JQB3H' } } });
if (vt) stop('B0FV3JQB3H مستعمل');
console.log(`➕ أمازون F لـ ${VENG.name} + سطر أصفر`);

if (bad || !apply) { console.log(bad ? '⛔ متوقّف' : '(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(bad ? 1 : 0); }

// ---------------------------------------------------------------- التنفيذ
const ids = REPLACE.map((r) => r.id);
const before = {
  components: await prisma.component.findMany({ where: { id: { in: [...ids, VENG.id] } } }),
  offers: await prisma.componentOffer.findMany({ where: { componentId: { in: ids } } }),
  history: await prisma.priceHistory.findMany({ where: { componentId: { in: ids } } }),
};
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/fix-replace-dead-ram-${stamp}.json`, JSON.stringify(before, null, 2));
console.log(`نسخة احتياطية: backups/fix-replace-dead-ram-${stamp}.json (${before.history.length} نقطة تاريخ)`);

for (const r of REPLACE) {
  await prisma.$transaction([
    prisma.priceHistory.deleteMany({ where: { componentId: r.id } }),
    prisma.componentOffer.deleteMany({ where: { componentId: r.id } }),
    prisma.component.update({ where: { id: r.id }, data: { name: r.name, specs: r.specs, description: r.description, performanceTier: r.performanceTier, price: 0, imageUrl: null } }),
    ...r.offers.map((o) => prisma.componentOffer.create({ data: { componentId: r.id, storeId: stores[o.store], url: o.url, inStock: true } })),
  ]);
  console.log(`✔ ${r.name}`);
}
await prisma.component.update({ where: { id: VENG.id }, data: { description: v.description.replace(VENG.after, `${VENG.after}\n${VENG.add}`) } });
await prisma.componentOffer.create({ data: { componentId: VENG.id, storeId: stores.amazon, url: VENG.offer.url, inStock: true } });
console.log(`✔ ${VENG.name} ← amazon F`);
console.log(`\nالتالي: scrape-one لـ ${[...ids, VENG.id].join(' ')} ثم fetch-images --missing`);
await prisma.$disconnect();
