/**
 * 2026-10-11 — طلب زائر «Pny 5070 نسخة rgb» (cmv2w7e3h000306id2xao0fn1). سأل نوّاف: هل لها أكثر من متجر؟ ثمّ «ضيف وخلني اشوف».
 *
 *   ① PNY GeForce RTX 5070 12GB ARGB OC Triple Fan (VCG507012TFXXPB1-O):
 *      جرير 652116 «ARGB Overclocked Triple Fan» (3749، المخزون 11) — كان عرضاً داخل الصفّ العامّ «NVIDIA GeForce RTX 5070 12GB» فيُنقل.
 *      أمازون B0DYPGBX6J «12GB ARGB OC Triple Fan» (3873.48، In Stock).
 *   ② PNY GeForce RTX 5070 12GB Triple Fan (VCG507012TFXPB1، العاديّة):
 *      أمازون B0F59N58GV (3699، «2512 MHz boost» في نقاطه) + إنفيني آرك (SKU VCG507012TFXPB1، 3799، متوفّر).
 *   مايكرولس لا يبيع PNY 5070.
 *
 * المواصفات من نشرتَي PNY الرسميّتين (PDF): 6144 CUDA، 12GB GDDR7 192-bit بسرعة 28 و672 GB/s، 250 واط، مزوّد 650 واط،
 * 16-pin مع محوّل 2×8، ثلاثة DP 2.1b (UHBR20) وHDMI 2.1b، 299.5×120×48 مم بسماكة 2.4 فتحة. Boost: ARGB OC = 2685، العاديّة = 2512.
 *
 *   node scripts/add-pny-5070-2026-10-11.mjs           # عرض
 *   node scripts/add-pny-5070-2026-10-11.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const GPU = 'cmpfziqnv0004x4ymffnp204c';
const GENERIC = 'cmq122okp000mjwymt3193qwb'; // NVIDIA GeForce RTX 5070 12GB
const REQUEST = 'cmv2w7e3h000306id2xao0fn1';
const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });

const ALT = {
  GENERIC: ['NVIDIA GeForce RTX 5070 12GB', GENERIC],
  VENTUS: ['MSI GeForce RTX 5070 12G VENTUS 2X OC', 'cmubenryf00000cymx3uqe3k4'],
};
const alt = (k, ...why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const SPECS = (boost) => ({ vram: '12GB', ports: '1x HDMI 2.1b, 3x DP 2.1b', lengthMm: '300', cudaCores: '6144', interface: 'PCIe 5.0 x16', memoryBus: '192-bit', boostClock: `${boost} MHz`, memoryType: 'GDDR7', architecture: 'Blackwell', powerConnectors: '1x 16-pin' });

const PARTS = [
  {
    brand: 'PNY', name: 'GeForce RTX 5070 12GB ARGB OC Triple Fan', specs: SPECS(2685), request: true,
    offers: [A('B0DYPGBX6J')], moveJarir: true,
    description: `### PNY GeForce RTX 5070 12GB ARGB OC Triple Fan

نسخة PNY المرفوعة التردّد من RTX 5070 (VCG507012TFXXPB1-O): ثلاث مراوح وإضاءة ARGB على الواجهة، وتردّد Boost يبلغ 2685 ميجاهرتز من المصنع. تناسب تجميعة ألعابٍ بدقّة 1440p لمن يريد كرتاً مضيئاً بسعرٍ قريب من النسخ العاديّة.

**التقنيات الأساسية المدعومة:**

[green]Boost بتردّد 2685 ميجاهرتز:[/green] فوق تردّد NVIDIA المرجعيّ (2512) من المصنع، بحسب نشرة PNY — فرقٌ صغير في الإطارات لكنّه بلا أيّ ضبطٍ منك.

[green]6,144 نواة CUDA و12 جيجابايت GDDR7:[/green] على ناقل 192-bit بسرعة 28 جيجابت/ث وعرض نطاق 672 جيجابايت/ث، مع DLSS 4 وتوليد الإطارات المتعدّد.

[green]إضاءة ARGB وبرنامج VelocityX:[/green] تتحكّم في الإضاءة والأداء من برنامج PNY.

[green]ثلاث مراوح ولوح خلفيّ معدنيّ:[/green] تبريدٌ هادئ لكرتٍ استهلاكه 250 واط، واللوح يمنع انحناء الكرت.

[green]ثلاثة DisplayPort 2.1b (UHBR20) وHDMI 2.1b:[/green] حتى أربع شاشات، و4K بتردّد 480 هرتز مع DSC.

[green]محوّل الطاقة مرفق:[/green] من 16-pin إلى منفذي 8-pin، ومزوّد 650 واط يكفيه بحسب PNY.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **12 جيجابايت على ناقل 192-bit** — مريحة في 1440p، وضيّقة في 4K مع حزم النسيج العالية.
* طولها 299.5 مم وسماكتها 2.4 فتحة — راجع طول الكرت الذي يقبله صندوقك.
* متوفّرة في جرير وأمازون فقط (مايكرولس لا يبيع PNY 5070).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليست Ti: تلك 16 جيجابايت وناقل 256-bit وفارق أداءٍ حقيقيّ.
* ليست كرتاً لـ4K بإعداداتٍ قصوى مع تتبّع أشعّةٍ ثقيل.

${alt('GENERIC', 'مقارنة نسخ الشركات الأخرى من الشريحة نفسها، وبعضها أرخص.')}
https://www.pny.com/geforce-rtx-5070-models`,
  },
  {
    brand: 'PNY', name: 'GeForce RTX 5070 12GB Triple Fan', specs: SPECS(2512),
    offers: [A('B0F59N58GV'), { store: 'infiniarc', url: 'https://www.infiniarc.com/shop/gpu/vcg507012tfxpb1-pny-geforce-rtx-5070-12gb-gddr7-black-gpu-11503' }],
    description: `### PNY GeForce RTX 5070 12GB Triple Fan

النسخة العاديّة من RTX 5070 عند PNY (VCG507012TFXPB1): ثلاث مراوح وتصميمٌ أسود بلا إضاءة، بتردّد NVIDIA المرجعيّ. تناسب من يريد أداء 5070 كاملاً بأقلّ سعرٍ ممكن ولا يهمّه الشكل.

**التقنيات الأساسية المدعومة:**

[green]6,144 نواة CUDA و12 جيجابايت GDDR7:[/green] على ناقل 192-bit بعرض نطاق 672 جيجابايت/ث، مع DLSS 4 وتوليد الإطارات المتعدّد.

[green]تردّد Boost المرجعيّ 2512 ميجاهرتز:[/green] أداء RTX 5070 كما صمّمته NVIDIA؛ الفرق عن النسخ المرفوعة بضعة إطارات فقط.

[green]ثلاث مراوح ولوح خلفيّ معدنيّ:[/green] تبريدٌ أهدأ من نسخ المروحتين لكرتٍ استهلاكه 250 واط.

[green]ثلاثة DisplayPort 2.1b وHDMI 2.1b:[/green] حتى أربع شاشات.

[green]محوّل الطاقة مرفق:[/green] من 16-pin إلى منفذي 8-pin، ومزوّد 650 واط يكفيه بحسب PNY.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **12 جيجابايت على ناقل 192-bit** — مريحة في 1440p، وضيّقة في 4K مع حزم النسيج العالية.
* طولها 299.5 مم وسماكتها 2.4 فتحة.
* بلا إضاءة ولا رفع تردّد من المصنع.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليست Ti، ولا كرتاً لـ4K بإعداداتٍ قصوى.

${alt('VENTUS', 'نسخة 5070 أقصر بكثير (236 مم) تدخل الصناديق الصغيرة.')}
https://www.pny.com/geforce-rtx-5070-models`,
  },
];

// ---------------------------------------------------------------- الفحص
const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
let bad = false;
const stop = (m) => { console.log('⛔ ' + m); bad = true; };
const jarir = await prisma.componentOffer.findFirst({ where: { componentId: GENERIC, url: { contains: '652116' } } });
if (!jarir) stop('عرض جرير 652116 ليس على الصفّ العامّ');
for (const p of PARTS) {
  const dup = await prisma.component.findFirst({ where: { brand: { equals: p.brand, mode: 'insensitive' }, name: { equals: p.name, mode: 'insensitive' } } });
  if (dup) stop(`موجودة: ${dup.id}`);
  if (/\*\*\[(yellow|red)\]/.test(p.description)) stop('نجوم حول وسم');
  for (const o of p.offers) {
    const asin = (o.url.match(/\/dp\/([A-Z0-9]{10})/) || [])[1];
    const t = await prisma.componentOffer.findFirst({ where: asin ? { url: { contains: `/dp/${asin}` } } : { url: o.url }, select: { component: { select: { name: true } } } });
    if (t) stop(`${o.url} مستعمل في ${t.component.name}`);
  }
  console.log(`✚ ${p.brand} ${p.name} — ${[...p.offers.map((o) => o.store), ...(p.moveJarir ? ['jarir (نقل)'] : [])].join(' + ')}`);
}
for (const [k, [n, id]] of Object.entries(ALT)) {
  const c = await prisma.component.findUnique({ where: { id }, select: { brand: true, name: true } });
  if (!c || `${c.brand} ${c.name}` !== n && c.name !== n) stop(`البديل ${k}`);
}
const req = await prisma.requestedPart.findUnique({ where: { id: REQUEST } });
if (!req) stop('الطلب غير موجود'); else console.log(`↳ الطلب «${req.name}» (${req.status}) سيُربط ويصير ADDED`);
if (bad || !apply) { console.log(bad ? '⛔ متوقّف' : '(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(bad ? 1 : 0); }

// ---------------------------------------------------------------- التنفيذ
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/add-pny-5070-${stamp}.json`, JSON.stringify({ jarirBefore: jarir, request: req, PARTS }, null, 2));
const ids = [];
for (const p of PARTS) {
  const { offers, moveJarir, request, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, categoryId: GPU, tdpWattage: 250, performanceTier: 4, price: 0 } });
  for (const o of offers) await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: true } });
  if (moveJarir) await prisma.componentOffer.update({ where: { id: jarir.id }, data: { componentId: c.id } });
  if (request) await prisma.requestedPart.update({ where: { id: REQUEST }, data: { status: 'ADDED', componentId: c.id } });
  ids.push(c.id);
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}
console.log(`\nنسخة: backups/add-pny-5070-${stamp}.json\nالتالي: scrape-one ${ids.join(' ')} ${GENERIC}`);
await prisma.$disconnect();
