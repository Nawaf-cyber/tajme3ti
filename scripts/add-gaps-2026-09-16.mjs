/**
 * ============ ما نقص فعلاً — لا ما يحسُن وجودُه ============
 *
 * قِيس الكتالوج فئةً فئةً يوم 2026-09-16، فبان ثقبان:
 *
 * ١) **المبرّدات أنحف فئة**: ٢٨ قطعة من ٣٣١، وثلاثٌ منها بلا عرضٍ حيّ —
 *    وكلّ الثلاث Thermalright، أي أنّ أكثر ماركةٍ يُوصى بها في هذه الفئة
 *    حاضرةٌ في الكتالوج وغائبةٌ عن الشراء. وما بقي حيّاً يميل إلى DeepCool
 *    وحدها: عشرٌ من خمسٍ وعشرين.
 *
 * ٢) **لا لوحة ASUS واحدة بشيبست B850**: عندنا MSI (لوحتان) وجيجابايت،
 *    وصفرٌ من ASUS. وهذا بالضبط ما طلبه زائرٌ يوم 2026-09-08 في «اقترح
 *    قطعة» — طلبٌ مفتوحٌ لم يُردّ عليه منذ ثمانية أيام.
 *
 * ⚠️ وكلّ سعرٍ هنا قُرئ من صفحة المنتج نفسها لا من نتائج البحث، والمخزون
 * تُحقّق منه بعد إصلاح قارئ إنفيني آرك (بياناتُهم المُهيكلة تقول InStock
 * على صفحةٍ زرُّ شرائها معطَّل — انظر lib/store-search.ts).
 *
 * ⚠️ وسقطت من القائمة أربعُ قطعٍ كانت مرشَّحة:
 *   • Thermalright Burst Assassin 120 EVO DARK — بدا متوفّراً ١٤٩ ﷼، ثمّ
 *     كشف الإصلاحُ أنه نافد. وهو المرشَّح الذي كشف العطل.
 *   • Arctic Freezer 36 CO وRyzen 7 5700X3D وRyzen 5 5600X — نافدةٌ كلّها.
 *   • أطقم رام ١٦ جيجابايت — وهي **أكثر ما يُبحث عنه** بعد كروت الشاشة
 *     («Ram ddr5 16gb» · «Ddr4 8»)، لكنّ كلّ ما وجدتُه متوفّراً عصاً
 *     **مفردة** لا طقماً. والعصا المفردة في قناةٍ واحدة تُضيّع ثلث أداء
 *     الألعاب، فإضافتُها إلى باني تجميعاتٍ فخٌّ لا سدُّ نقص.
 *
 *   node scripts/add-gaps-2026-09-16.mjs           # عرض
 *   node scripts/add-gaps-2026-09-16.mjs --apply   # تنفيذ مع نسخة احتياطية
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const COOLER_CAT = 'cmszm2ym00000swymvd5s2yxm';
const MB_CAT = 'cmpfziqe70001x4ym928tt3o2';

/* قطعٌ تُحال إليها الأوصاف — تُقرأ من القاعدة لا تُخمَّن */
const PHANTOM_SPIRIT_SE = 'cmtcr2c0i0000o8ym7e5jnmft'; // Peerless Assassin 120 SE ARGB
const PHANTOM_EVO = 'cmtcr2dw50009o8ym694ecx7s'; // Phantom Spirit 120 EVO
const LE360_V2 = 'cmszmclr60008zsym20d7ig0m';
const KRAKEN_CORE_360 = 'cmszn26jy000cw8ym0jada1sr';
const MSI_B850_PLUS = 'cmsxdaibx0006skymhs0llh1k';

const PARTS = [
  {
    categoryId: MB_CAT, brand: 'ASUS', name: 'B850 MAX GAMING WIFI W',
    tdpWattage: 0, performanceTier: 3,
    specs: {
      /* ⚠️ ولا مفتاح `color` هنا: مخطّط اللوحات الأمّ لا يعرفه (يعرفه مخطّط
         المبرّدات والكيسات)، و«W» في الاسم تقول البياض. */
      socket: 'AM5', chipset: 'B850', formFactor: 'ATX',
      ramType: 'DDR5', maxRam: '256GB', memorySpeed: '8000+ MT/s (OC)',
      m2Slots: '3', pcieVersion: 'PCIe 5.0',
    },
    /* ⚠️ متجران برمزٍ واحد (90MB1M10-M0EAY0) والفرق بينهما ٢٢٦ ﷼ — ٢٣٪.
       وهذا ما وُجد الموقع له، ولا يتكرّر كثيراً: ٦٨٪ من الكتالوج بمصدرٍ واحد. */
    offers: [
      { store: 'infiniarc', url: 'https://www.infiniarc.com/shop/board/90mb1m10-m0eay0-asus-b850-max-gaming-wifi-amd-am5-white-atx-motherboard-13026' },
      { store: 'microless', url: 'https://saudi.microless.com/product/asus-b850-max-gaming-wifi-am5-atx-motherboard-amd-b850-chipset-4x-dimm-ddr5-slots-up-to-256gb-max-memory-1x-pcie-5-0-x16-3x-m-2-slots-wi-fi-6e-bt-5-3-white-90mb1m10-m0eay0/' },
    ],
    description: `### ASUS B850 MAX GAMING WIFI W

أوّل لوحة ASUS بشيبست B850 في الكتالوج، وجاءت بيضاء — وهو ما طلبه زائرٌ في «اقترح قطعة». وB850 هو شيبست AM5 المتوسط الحاليّ: يعطي PCIe 5.0 لكرت الشاشة وللقرص الأوّل، ويترك مسارات X870E لمن يحتاجها فعلاً.

**التقنيات الأساسية المدعومة:**

[green]PCIe 5.0 x16 و3 منافذ M.2:[/green] الفتحة الرئيسية من الجيل الخامس مع معالجات Ryzen 7000 و9000، ومنفذان من المعالج مباشرةً وثالثٌ من الشيبست.

[green]4 فتحات DDR5 حتى 256 جيجابايت:[/green] وسرعاتٌ تتجاوز 8000MT/s بالكسر — مجال توسعةٍ لا تبلغه اللوحات ثنائية الفتحات.

[green]Wi-Fi 6E وشبكة 2.5 جيجابت:[/green] بلا بطاقةٍ إضافية.

[green]مقبس AM5 حيّ:[/green] يقبل Ryzen من 7000 و8000 و9000 — منصّةٌ ما زالت تتلقّى معالجاتٍ جديدة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مع معالجات Ryzen 8000 تنزل الفتحة الرئيسية إلى PCIe 4.0 — قيدُ المعالج لا اللوحة.
* B850 أقلّ في مسارات PCIe الثانوية من X870E؛ من يركّب كرتين أو أربعة أقراص NVMe يضيق به.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* اللون الأبيض ليس مجّانياً في السوق السعودي — النسخة السوداء أرخص عند نفس المتجر.

---
بإمكانك التوجه إلى [MSI B850 GAMING PLUS WiFi](/components/${MSI_B850_PLUS}) إذا كان توجهك يتركز على الآتي:
* نفس الشيبست بلوحةٍ سوداء وسعرٍ أقلّ.
https://www.asus.com/motherboards-components/motherboards/prime/b850-max-gaming-wifi-w/techspec/`,
  },
  {
    categoryId: COOLER_CAT, brand: 'Thermalright', name: 'Phantom Spirit 120 Vision EVO',
    tdpWattage: 0, performanceTier: 4,
    specs: {
      type: 'Air', rgb: 'Yes', color: 'Black', sizeMm: '160', fanSize: '120mm', fanCount: '2',
      sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/thermalright-phantom-spirit-120-vision-evo-cpu-air-cooler-6mm-x-7-heat-pipes-pure-copper-3-95-screen-size-2150rpm-36dba-92cfm-airflow-s-fdb-v2-bearing-black-ps-120-vision/' }],
    description: `### Thermalright Phantom Spirit 120 Vision EVO

نسخة Phantom Spirit 120 EVO نفسها — سبعة أنابيب حرارية ٦ مم وبرجان ومروحتا ١٢٠ مم — مضافاً إليها شاشة ٣٫٩٥ بوصة فوق قاعدة النحاس.

**التقنيات الأساسية المدعومة:**

[green]٧ أنابيب حرارية ٦ مم وبرجان:[/green] هذه الفئة تنافس تبريداً مائياً ٢٤٠ مم في الهواء الساكن، وبلا مضخّةٍ تتعطّل.

[green]شاشة ٣٫٩٥ بوصة:[/green] تعرض حرارة المعالج وتردّده بلا برنامجٍ خارجيّ.

[green]يغطّي كلّ المقابس الحيّة:[/green] AM5 وAM4 وLGA1851 وLGA1700 وما قبلها.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **ارتفاعه ١٦٠ مم** — وهو أعلى من Phantom Spirit العادي. تأكّد من خلوص الكيس قبل الشراء؛ كثيرٌ من الكيسات المتوسطة تقف عند ١٥٥–١٦٠ مم.
* البرجان يغطّيان فتحة الرام الأولى في بعض اللوحات — الرام العالية تحتاج رفع المروحة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة ARGB في المشتّت نفسه — الشاشة وحدها.

---
بإمكانك التوجه إلى [Thermalright Phantom Spirit 120 EVO](/components/${PHANTOM_EVO}) إذا كان توجهك يتركز على الآتي:
* نفس أداء التبريد بلا شاشة وبسعرٍ أقلّ وارتفاعٍ أقصر.

بإمكانك التوجه إلى [Thermalright Peerless Assassin 120 SE ARGB](/components/${PHANTOM_SPIRIT_SE}) إذا كان توجهك يتركز على الآتي:
* إضاءة ARGB في المراوح.
https://www.thermalright.com/product/phantom-spirit-120-vision-evo/`,
  },
  {
    categoryId: COOLER_CAT, brand: 'Thermalright', name: 'Frozen Notte 240 White ARGB V2',
    tdpWattage: 0, performanceTier: 3,
    specs: {
      type: 'AIO', rgb: 'Yes', color: 'White', sizeMm: '240', fanSize: '120mm', fanCount: '2',
      sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/thermalright-frozen-240-argb-v2-liquid-cpu-cooler-5300rpm-pump-rated-speed-28dba-noise-level-72-37cfm-air-flow-s-fdb-bearing-aluminum-radiator-white-clr-0246-wht/' }],
    description: `### Thermalright Frozen Notte 240 White ARGB V2

تبريد مائي ٢٤٠ مم أبيض بمروحتين ARGB ومضخّةٍ بضمان خمس سنوات — وهو من أرخص ما يصل إلى هذه الفئة في السوق السعودي.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 277×120×27 مم:[/green] مقاس ٢٤٠ قياسيّ يركّب في أغلب الكيسات المتوسطة من الأعلى أو الأمام.

[green]مروحتا 120 مم بمحمل S-FDB V2:[/green] حتى ٢٠٠٠ دورة و٧٢٫٣٧ CFM، وإضاءة ARGB على موصّل ٣ بن ٥ فولت القياسيّ.

[green]يغطّي المقابس الحيّة كلّها:[/green] AM5 وAM4 وLGA1851 وLGA1700 وما قبلها.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* رادييتر ألمنيوم لا نحاس — كافٍ لمعالجٍ متوسّط، ودون فئة ٣٦٠ مم تحت حملٍ طويل.
* الأبيض يبقى أبيض إن كانت مراوح الكيس بيضاء؛ الخلط يُظهر فرق الدرجة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا شاشة ولا تحكّم برمجيّ في المضخّة — تعمل بمنحنى اللوحة الأمّ.

---
بإمكانك التوجه إلى [DeepCool LE360 V2](/components/${LE360_V2}) إذا كان توجهك يتركز على الآتي:
* رادييتر ٣٦٠ مم لمعالجٍ أعلى استهلاكاً.
https://www.thermalright.com/product/frozen-notte-240-white-argb-v2/`,
  },
  {
    categoryId: COOLER_CAT, brand: 'Thermalright', name: 'Dynamic Vision PRO 360 ARGB White',
    tdpWattage: 0, performanceTier: 5,
    specs: {
      type: 'AIO', rgb: 'Yes', color: 'White', sizeMm: '360', fanSize: '120mm', fanCount: '3',
      sockets: 'AM5/AM4/LGA1851/LGA1700/LGA1200/LGA115X',
    },
    offers: [{ store: 'microless', url: 'https://saudi.microless.com/product/thermalright-dynamic-vision-pro-360-argb-liquid-cpu-cooler-360mm-5-5-screen-size-2400rpm-fan-rated-speed-34-59dba-noise-level-71-5-3-cfm-air-flow-s-fdb-v2-bearing-white-dvpro-360/' }],
    description: `### Thermalright Dynamic Vision PRO 360 ARGB White

أعلى ما في فئة المبرّدات عندنا: رادييتر ٣٦٠ مم، وشاشة ٥٫٥ بوصة تدور ٣٦٠ درجة فوق قاعدة النحاس، ومروحةٌ صغيرة مدمجة في البلوك تُبرّد مراحل طاقة اللوحة الأمّ.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 360 مم بثلاث مراوح في إطارٍ واحد:[/green] المراوح الثلاث مدمجة في هيكلٍ واحد ٣٦٠×١٢٠×٢٥ مم — كابلٌ واحد بدل ثلاثة، وتركيبٌ أسرع.

[green]شاشة 5.5 بوصة بدقّة 960×540:[/green] مثبّتة مغناطيسياً وتميل حتى ١٥٧ درجة، فتُقرأ من أيّ زاويةٍ في الكيس.

[green]مروحة VRM مدمجة:[/green] ٢٥٠٠ دورة على مراحل طاقة اللوحة — وهي أكثر ما يسخن في اللوحات المتوسطة تحت معالجٍ عالي الاستهلاك.

[green]ضمان خمس سنوات على المضخّة.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ٣٤٫٥٩ ديسيبل على أقصى سرعة — ليس من المبرّدات الهادئة عند الحمل الكامل.
* رادييتر ٣٦٠ مم يحتاج كيساً يقبله من الأعلى أو الأمام؛ راجع مقاس كيسك.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعرُه في مستوى تبريدٍ مائيٍّ بلا شاشة وبأداءٍ مقارب — ما تدفعه الزيادة هو الشاشة ومروحة الـVRM.

---
بإمكانك التوجه إلى [NZXT Kraken Core 360 RGB](/components/${KRAKEN_CORE_360}) إذا كان توجهك يتركز على الآتي:
* نفس مقاس الرادييتر بسعرٍ أقلّ بلا شاشة.
https://www.thermalright.com/product/dynamic-vision-pro-360-argb-black/`,
  },
];

// ---------------------------------------------------------------- التنفيذ

const stores = Object.fromEntries(
  (await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]),
);

let blocked = false;
for (const p of PARTS) {
  console.log(`\n=== ${p.brand} ${p.name}`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  const dup = await prisma.component.findFirst({ where: { name: p.name, brand: p.brand } });
  if (dup) { console.log(`    ⛔ موجودة: ${dup.id}`); blocked = true; }
  for (const o of p.offers) {
    if (!stores[o.store]) { console.log(`    ⛔ لا متجر بالمعرّف «${o.store}»`); blocked = true; continue; }
    const taken = await prisma.componentOffer.findFirst({ where: { url: o.url }, select: { component: { select: { name: true } } } });
    if (taken) { console.log(`    ⛔ رابط ${o.store} مستعمل في: ${taken.component.name}`); blocked = true; }
    else console.log(`    ✔ ${o.store}`);
  }
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-gaps-${stamp}.json`, JSON.stringify(PARTS, null, 2));
console.log(`\nنسخة احتياطية: backups/added-gaps-${stamp}.json`);

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

console.log(`\nالتالي:\n  npx tsx scripts/scrape-one.ts ${ids.join(' ')}\n  npx tsx scripts/fetch-images.ts --missing`);
await prisma.$disconnect();
