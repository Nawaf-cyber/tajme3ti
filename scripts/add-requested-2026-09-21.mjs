/**
 * ============ طلبان من «اقترح قطعة» — 2026-09-21 ============
 *
 * «RTX 5070 MSI VENTUS X3,OR,X2»  و  «INTEL core i7 ULTRA -K,KF-»
 *
 * ⚠️ والاسم الصحيح **VENTUS 2X / 3X** لا X2/X3 — هكذا تكتبه MSI، وبه
 * وحده يُوجد في المتاجر.
 *
 * ⚠️ وما بحثتُه ووجدتُه ثمّ **رفضتُه**، كي لا يُعاد:
 *   • RTX 5070 (غير Ti) بنسخة **3X**: المنتج موجودٌ عند MSI فعلاً، ولا
 *     يبيعه أيٌّ من متاجرنا الستّة. لا يُضاف ما لا رابطَ له.
 *   • VENTUS 2X OC **White** في كازاسوق بـ٢٨٣٠ ﷼ — قرأتُ صفحته فإذا هو
 *     **نافد**. وهو نفس فخّ «السعر المغري في عرضٍ نافد» المسجَّل عندنا.
 *   • و5070 Ti VENTUS 3X في كازاسوق بـ٤٠٠٠ ﷼ — نافدٌ أيضاً. لكنّه
 *     يُضاف عرضاً خامداً: يعود مع المخزون فيصير أرخص من مايكرولس
 *     بـ١٬٦٠٦ ريالاً.
 *
 * ⚠️ و265KF **بنسخة الصندوق** (`bx80768265kf`) لا التراي
 *   (`at8076806410` بـ١٬٢٠٥): لا مبرّد في الاثنين — الفرق الضمان،
 *   ثلاث سنواتٍ للصندوق وسنةٌ للتراي. والفرق ١٨٣ ريالاً.
 *
 *   node scripts/add-requested-2026-09-21.mjs           # عرض
 *   node scripts/add-requested-2026-09-21.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const GPU = 'cmpfziqnv0004x4ymffnp204c';
const CPU = 'cmpfziqb20000x4ymfmkovawm';

/* مراجعُ الأوصاف — قُرئت من القاعدة */
const RTX5070_GENERIC = 'cmq122okp000mjwymt3193qwb';   // NVIDIA GeForce RTX 5070 12GB — 3699
const RTX5070TI_GENERIC = 'cmr3g8pei0008ncym5xpf3k1s'; // NVIDIA GeForce RTX 5070 Ti 16GB — 5249
const ULTRA7_265K = 'cmpiebgoe001t00ymddi46682';       // Core Ultra 7 265K — 1759
const ULTRA7_265F = 'cmtjkeme00006ygym45ohh335';       // Core Ultra 7 265F — 1376

const PARTS = [
  {
    request: 'RTX 5070 MSI VENTUS X3,OR,X2',
    categoryId: GPU, brand: 'MSI', name: 'GeForce RTX 5070 12G VENTUS 2X OC',
    tdpWattage: 250, performanceTier: 4,
    specs: {
      vram: '12GB', memoryType: 'GDDR7', memoryBus: '192-bit', interface: 'PCIe 5.0 x16',
      architecture: 'Blackwell', lengthMm: '236', powerConnectors: '1x 16-pin',
      ports: '1x HDMI 2.1b, 3x DP 2.1a',
    },
    offers: [{ store: 'cazasouq', url: 'https://www.cazasouq.com/msi-geforce-rtx-5070-12g-ventus-2x-oc-gpu-28223' }],
    description: `### MSI GeForce RTX 5070 12G VENTUS 2X OC

أقصرُ كرت RTX 5070 في الكتالوج — **٢٣٦ مم** بمروحتين. وهو ما يجعله يدخل كيساتٍ لا يدخلها غيره.

**التقنيات الأساسية المدعومة:**

[green]236 مم فقط:[/green] أقصرُ بـ٤٦ مم من صفّ 5070 العامّ عندنا (٢٨٢ مم)، ويدخل Meshify 3 وNorth وكلّ كيساتنا المتوسّطة بفائضٍ كبير.

[green]12 جيجابايت GDDR7 بناقل 192 بت:[/green] وتردّد Boost يبلغ 2542 ميجاهرتز — أعلى من التردّد المرجعيّ.

[green]معمارية Blackwell:[/green] تدعم DLSS 4 وتوليد الإطارات المتعدّد.

[green]موصّل 16-pin واحد:[/green] ومزوّد ٦٥٠ واط يكفيه بحسب MSI.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **مروحتان لا ثلاث** — VENTUS 2X أبسطُ خطوط MSI تبريداً. كافٍ لـ٢٥٠ واط، وأعلى صوتاً من كرتٍ ثلاثيّ المراوح تحت حملٍ طويل.
* بلا إضاءة RGB.
* يحتاج ATX 3.1 أو محوّل 16-pin — راجع مزوّدك.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة ولا مفتاح BIOS مزدوج.

---
بإمكانك التوجه إلى [NVIDIA GeForce RTX 5070 12GB](/components/${RTX5070_GENERIC}) إذا كان توجهك يتركز على الآتي:
* مقارنةُ نسخ الشركات الأخرى من نفس الشريحة.
https://www.msi.com/Graphics-Card/GeForce-RTX-5070-12G-VENTUS-2X-OC/Specification`,
  },
  {
    request: 'RTX 5070 MSI VENTUS X3,OR,X2',
    categoryId: GPU, brand: 'MSI', name: 'GeForce RTX 5070 Ti 16G VENTUS 3X OC',
    tdpWattage: 300, performanceTier: 4,
    specs: {
      vram: '16GB', memoryType: 'GDDR7', memoryBus: '256-bit', interface: 'PCIe 5.0 x16',
      architecture: 'Blackwell', lengthMm: '303', powerConnectors: '1x 16-pin',
      ports: '1x HDMI 2.1b, 3x DP 2.1a',
    },
    /* ⚠️ والثاني نافدٌ اليوم ويُضاف عمداً: يعود مع المخزون بـ٤٠٠٠ ﷼ —
       أرخص من مايكرولس بـ١٬٦٠٦. والعرض الخامد لا يُعرض للزائر، ولا يُحسب
       في «أرخص سعر»، ويستيقظ وحده في دورة السحب. */
    offers: [
      { store: 'microless', url: 'https://saudi.microless.com/product/msi-geforce-rtx-5070-ti-16g-ventus-3x-oc-graphics-card-16gb-gddr7-256-bit-memory-2482-mhz-boost-clock-8960-cuda-cores-28-gbps-memory-speed-pci-express-gen-5-912-v531-092/' },
      { store: 'cazasouq', url: 'https://www.cazasouq.com/msi-geforce-rtx-5070-ti-16gb-ventus-3x-oc-gpu-39264' },
    ],
    description: `### MSI GeForce RTX 5070 Ti 16G VENTUS 3X OC

نسخة VENTUS **الثلاثيّة المراوح** — ولا توجد على 5070 العاديّ في أيّ متجرٍ نتابعه، فهذه أقربُ ما إليها.

**التقنيات الأساسية المدعومة:**

[green]8960 نواة CUDA و16 جيجابايت GDDR7:[/green] بناقل ٢٥٦ بت وسرعة ذاكرة ٢٨ جيجابت/ث — فئةٌ فوق 5070 بوضوح.

[green]ثلاث مراوح على جسمٍ 303 مم:[/green] مساحةُ تبديدٍ أكبر وصوتٌ أهدأ من النسخة المزدوجة تحت ٣٠٠ واط.

[green]تردّد Boost يبلغ 2482 ميجاهرتز.[/green]

[green]موصّل 16-pin واحد:[/green] ومزوّد ATX 3.1 موصىً به.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **٣٠٣ مم طولاً** — لا يدخل North (٣٥٥ يكفي) ولا Meshify 3 (٣٤٩ يكفي)، لكنّه يضيق في الكيسات الصغيرة. راجع كيسك.
* ٣٠٠ واط — مزوّد ٧٥٠ واط فأعلى.
* VENTUS خطُّ MSI الأساسيّ؛ SUPRIM وGAMING TRIO أهدأ وأبرد وأغلى.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا إضاءة RGB ولا شاشة.

---
بإمكانك التوجه إلى [NVIDIA GeForce RTX 5070 Ti 16GB](/components/${RTX5070TI_GENERIC}) إذا كان توجهك يتركز على الآتي:
* مقارنةُ نسخ الشركات الأخرى من نفس الشريحة.
https://www.msi.com/Graphics-Card/GeForce-RTX-5070-Ti-16G-VENTUS-3X-OC/Specification`,
  },
  {
    request: 'INTEL core i7 ULTRA -K,KF-',
    categoryId: CPU, brand: 'Intel', name: 'Core Ultra 7 265KF',
    tdpWattage: 125, performanceTier: 4,
    specs: {
      socket: 'LGA1851', cores: '20', pCores: '8', eCores: '12', threads: '20',
      baseClock: '3.9 GHz', boostClock: '5.5 GHz', l3Cache: '30MB',
      architecture: 'Arrow Lake', includedCooler: 'None', integratedGraphics: 'None',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/intel-core-ultra-7-265kf-3-9-ghz-lga-1851-processor-20-cores-20-threads-36-mb-cache-5-5-ghz-max-turbo-frequency-dual-channel-ddr5-memory-192gb-max-memory-size-bx80768265kf/' }],
    description: `### Intel Core Ultra 7 265KF

نفسُ معالج 265K حرفاً بحرف — **بلا كرت الشاشة المدمج**، وبسعرٍ أقلّ. وهذا هو معنى حرف F.

**التقنيات الأساسية المدعومة:**

[green]20 نواة (8 أداء + 12 كفاءة) و20 خيطاً:[/green] معمارية Arrow Lake بدقّة ٣ نانومتر.

[green]3.9 جيجاهرتز أساساً و5.5 قصوى:[/green] ومضاعِفٌ مفتوح (حرف K) لمن يكسر السرعة.

[green]30 ميجابايت ذاكرة L3:[/green] ومقبس LGA1851 مع ذاكرة DDR5 ثنائية القناة حتى ١٩٢ جيجابايت.

[green]أرخص من 265K:[/green] لأنّك لا تدفع ثمن رسوميّاتٍ لن تستعملها مع كرتٍ منفصل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **لا مبرّد في العلبة** — معالجات K وKF كلُّها كذلك. احسب ثمن مبرّدٍ فوق السعر؛ و١٢٥ واط تحتاج برجاً مزدوجاً أو تبريداً مائيّاً.
* تُباع نسخةُ «Tray» أرخص بـ١٨٣ ريالاً: نفس المعالج بضمان سنةٍ بدل ثلاث.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* **لا كرت شاشة مدمج** — لا صورة بلا كرتٍ منفصل، ولا مخرجَ احتياطيّاً إن تعطّل كرتك.

---
بإمكانك التوجه إلى [Intel Core Ultra 7 265K](/components/${ULTRA7_265K}) إذا كان توجهك يتركز على الآتي:
* رسوميّات مدمجة تُشغّل الجهاز بلا كرت — مفيدةٌ لتشخيص الأعطال.

بإمكانك التوجه إلى [Intel Core Ultra 7 265F](/components/${ULTRA7_265F}) إذا كان توجهك يتركز على الآتي:
* مبرّد Laminar RM2 في العلبة و65 واطاً — بلا كسر سرعة.
https://www.intel.com/content/www/us/en/products/sku/241062/intel-core-ultra-7-processor-265kf-30m-cache-up-to-5-50-ghz/specifications.html`,
  },
];

// ---------------------------------------------------------------- التنفيذ

const stores = Object.fromEntries(
  (await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]),
);

let blocked = false;
for (const p of PARTS) {
  console.log(`\n=== ${p.brand} ${p.name}   ${'\x1b[2m'}← «${p.request}»${'\x1b[0m'}`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  const dup = await prisma.component.findFirst({ where: { name: p.name, brand: p.brand } });
  if (dup) { console.log(`    ⛔ موجودة: ${dup.id}`); blocked = true; }
  for (const o of p.offers) {
    if (!stores[o.store]) { console.log(`    ⛔ لا متجر «${o.store}»`); blocked = true; continue; }
    const taken = await prisma.componentOffer.findFirst({ where: { url: o.url }, select: { component: { select: { name: true } } } });
    if (taken) { console.log(`    ⛔ رابط ${o.store} مستعمل في: ${taken.component.name}`); blocked = true; }
    else console.log(`    ✔ ${o.store}`);
  }
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-requested-${stamp}.json`, JSON.stringify(PARTS, null, 2));
console.log(`\nنسخة احتياطية: backups/added-requested-${stamp}.json`);

const ids = [];
/* ⚠️ الطلب يُربط بأوّل قطعةٍ أُضيفت له: `RequestedPart.componentId` عمودٌ
   واحد، والطلب الواحد هنا أنتج كرتين. فيُربط بالأقرب إلى نصّه — وهو
   5070 العاديّ — ويُذكر الثاني في الردّ لا في العمود. */
const forRequest = new Map();
for (const p of PARTS) {
  const { offers, request, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  for (const o of offers) {
    await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: true } });
  }
  if (!forRequest.has(request)) forRequest.set(request, c.id);
  ids.push(c.id);
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}

for (const [name, componentId] of forRequest) {
  const r = await prisma.requestedPart.findFirst({ where: { name } });
  if (!r) { console.log(`⚠️ لم أجد الطلب «${name}»`); continue; }
  await prisma.requestedPart.update({
    where: { id: r.id },
    data: { status: 'ADDED', componentId, adminSeenAt: r.adminSeenAt ?? new Date() },
  });
  console.log(`✔ الطلب «${name}» → ADDED`);
}

console.log(`\nالتالي:\n  npx tsx scripts/scrape-one.ts ${ids.join(' ')}\n  npx tsx scripts/fetch-images.ts --missing`);
await prisma.$disconnect();
