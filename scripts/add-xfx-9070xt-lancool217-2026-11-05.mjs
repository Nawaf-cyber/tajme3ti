/**
 * 2026-11-05 — طلبا زوّار (٤ نوفمبر)، ونوّاف قال «ضيف القطعتين المقترحة (1،2) فقط».
 *
 * ① XFX Quicksilver Radeon RX 9070 XT Gaming Edition 16GB (أسود) = RX-97TQICKB9.
 *    المواصفات من صفحة XFX (قُرئت 2026-11-05): 35×14×6.7 سم، 3.5 فتحة، 2x 8-pin، مزوّد 850 واط أدنى،
 *    3x DP 2.1 + 1x HDMI 2.1، 20Gbps/256-bit، PTM7950، Zero dB، شعار أبيض بلا RGB، ضمان ٣ سنوات.
 *    واستهلاك اللوحة لا تذكره XFX: 304 واط (المرجعيّ؛ وتردّد Boost هنا 2970 = المرجعيّ) كما عند GPU Monkey.
 *    العروض (قُرئت بالمتصفّح 2026-11-05):
 *      كازاسوق   330 دينار ≈ 3290 ريال، InStock (JSON-LD، الباركود 840191502637؛ الأبيض صفحةٌ أخرى)
 *      أمازون    B0DXVMSQ5T — «Model Number RX-97TQICKB9»، 4200 من بائعين آخرين («See All Buying Options»)
 *      مايكرولس  OutOfStock (العنوان يحمل RX-97TQICKB9)
 *      إنفيني آرك: لا شيء. نون وريد زون: لم يُقرأ بحثهما.
 *    الصورة من أمازون — صورة كازاسوق على api.cazasouq.com خارج النطاقات المسموحة.
 *
 * ② Lian Li LANCOOL 217 (أسود، خشب جوز) = LAN217X. الاسم كأخيه «LANCOOL 217 INF» (الأسود بلا لون في الاسم).
 *    المواصفات من lian-li.com/product/lancool-217 (قُرئت 2026-11-05)، وهي مواصفات الأبيض نفسها.
 *    العروض: أمازون B0DWF95QP7 — 529، InStock، يشحنه أمازون (LAN217X)؛ مايكرولس OutOfStock (LAN217X).
 *    كازاسوق فيه الأبيض وINF فقط. إنفيني آرك: لا شيء.
 *
 * ⚠️ حالة الطلبين (RequestedPart) لا تُمسّ: قرار نوّاف.
 *
 *   node scripts/add-xfx-9070xt-lancool217-2026-11-05.mjs           # عرض
 *   node scripts/add-xfx-9070xt-lancool217-2026-11-05.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const PULSE = 'cmu6n3atv000cw4ymspizfwpb';
const L217W = 'cmuztrtwp0003kcymfw9vt8ir';

const alt = (name, id, ...why) => `---\nبإمكانك التوجه إلى [${name}](/components/${id}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const PARTS = [
  {
    category: 'GPU',
    brand: 'XFX',
    name: 'Quicksilver Radeon RX 9070 XT Gaming Edition 16GB',
    imageUrl: 'https://m.media-amazon.com/images/I/61r31aDojEL._AC_SL1500_.jpg',
    tdpWattage: 304,
    performanceTier: 4,
    specs: { vram: '16GB', ports: '1x HDMI 2.1b, 3x DP 2.1a', lengthMm: '350', interface: 'PCIe 5.0 x16', memoryBus: '256-bit', memoryType: 'GDDR6', architecture: 'RDNA 4', powerConnectors: '2x 8-pin', boostClock: '2970 MHz' },
    offers: [
      { store: 'cazasouq', url: 'https://www.cazasouq.com/product/xfx-quicksilver-rx-9070-xt-gaming-edition-16gb-gpu', inStock: true, key: 'xfx-quicksilver-rx-9070-xt-gaming-edition-16gb-gpu' },
      { store: 'amazon', url: 'https://www.amazon.sa/dp/B0DXVMSQ5T', inStock: true, key: 'B0DXVMSQ5T' },
      { store: 'microless', url: 'https://saudi.microless.com/product/xfx-quicksilver-amd-radeon-rx-9070xt-gaming-edition-graphics-card-16gb-gddr6-256-bit-memory-2970-mhz-boost-clock-4096-stream-processors-20-gbps-memory-speed-pci-express-5-0-rx-97tqickb9/', inStock: false, key: 'rx-97tqickb9' },
    ],
    description: `### XFX Quicksilver Radeon RX 9070 XT Gaming Edition 16GB

نسخة XFX من كرت RX 9070 XT بتبريدٍ كبير بثلاث مراوح، وغطاءٍ بجناحين مغناطيسيّين تقدر تشيلهم أو تبدّلهم (RX-97TQICKB9). مكانه تجميعة ألعاب 1440p عالية، لمن يبي أداء 9070 XT كاملاً في كرتٍ هادئ وبارد.

**التقنيات الأساسية المدعومة:**

[green]أداء 1440p عالٍ:[/green] شريحة RX 9070 XT تعطي قرابة 116 إطاراً في 1440p بإعدادات Ultra في متوسّط اختبارات Tom's Hardware — بمستوى RTX 5070 Ti تقريباً بدون تتبّع الأشعة.

[green]16 جيجابايت GDDR6 بناقل 256 بت:[/green] بسرعة 20 جيجابت/ث وعرض نطاق 640 جيجابايت/ث، فلا تضيق الذاكرة في 1440p ولا في أغلب ألعاب 4K.

[green]تبريد ثلاث مراوح بمادّة PTM7950:[/green] مراوح بمحامل كرويّة مزدوجة، وأنابيب حراريّة 6 مم، وقاعدة نحاس مطليّة بالنيكل. وPTM7950 مادّة تتغيّر بالحرارة بدل المعجون، فلا تجفّ ولا تتسرّب مع السنين.

[green]المراوح تقف في الاستخدام الخفيف (Zero dB):[/green] في التصفّح والأفلام يبقى الكرت صامتاً تماماً، ولا تدور المراوح إلا تحت الحمل.

[green]موصّلا 8-pin عاديّان:[/green] بلا محوّل 12V-2x6، فيركب على أغلب المزوّدات الموجودة بدون كابلات خاصّة.

[green]FSR 4 بالذكاء الاصطناعي:[/green] رفع الدقّة الجديد من AMD يعمل على كروت RDNA 4 وحدها، ويرفع الإطارات بصورةٍ أنظف بوضوح من FSR 3.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **طوله 350 مم وسماكته 3.5 فتحة:** من أطول نسخ 9070 XT، فتأكّد أنّ كيسك يقبل 350 مم على الأقلّ، وأنّه لن يغطّي منفذاً تحتاجه في اللوحة.
* XFX توصي بمزوّد 850 واط على الأقلّ.
* مع تتبّع الأشعة ينزل إلى قرابة 56 إطاراً في 1440p، أقلّ من RTX 5070 Ti (نحو 66) — الفرق يظهر في الألعاب الثقيلة بالأشعّة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا إضاءة RGB: الإضاءة شعار XFX أبيض فقط.

${alt('Sapphire PULSE Radeon RX 9070 XT 16GB', PULSE, 'الشريحة نفسها في كرتٍ أقصر بـ30 مم (320 مم)، إن كان كيسك لا يقبل 350.')}
https://www.xfxforce.com/shop/xfx-quicksilver-amd-radeon-rx-9070xt-gaming-edition`,
  },
  {
    category: 'Case',
    brand: 'Lian Li',
    name: 'LANCOOL 217',
    imageUrl: 'https://m.media-amazon.com/images/I/8131bpKa8BL._AC_SL1500_.jpg',
    tdpWattage: 0,
    performanceTier: 4,
    specs: {
      color: 'Black',
      features: ['حواف خشب جوز طبيعيّ في الواجهة', 'يقبل لوحات Back-Connect'],
      formFactor: 'Mid Tower',
      includedFans: '2x 170mm + 2x 120mm + 1x 140mm',
      maxGpuLength: '380',
      psuFormFactor: 'ATX',
      maxCoolerHeight: '180',
      radiatorSupport: '360mm',
    },
    offers: [
      { store: 'amazon', url: 'https://www.amazon.sa/dp/B0DWF95QP7', inStock: true, key: 'B0DWF95QP7' },
      { store: 'microless', url: 'https://saudi.microless.com/product/lian-li-lancool-217-mid-tower-case-2x-170mm-2x-120mm-1x-140mm-pre-installed-fan-up-to-360mm-radiator-12x-fan-support-steel-4-0mm-tempered-glass-wood-black-lan217x/', inStock: false, key: 'lan217x' },
    ],
    description: `### Lian Li LANCOOL 217

النسخة السوداء من LANCOOL 217: كيس متوسّط بحوافٍ من خشب الجوز الطبيعيّ في الواجهة، وخمس مراوح مركّبة منها اثنتان 170 مم في الأمام (LAN217X). لمن يبي كيساً هادئ الشكل بتدفّق هواءٍ كبير، بدون شراء مراوح إضافيّة.

**التقنيات الأساسية المدعومة:**

[green]خمس مراوح مركّبة:[/green] اثنتان 170 مم في الأمام تدفعان هواءً كثيراً بسرعةٍ بطيئة، واثنتان 120 مم فوق غطاء المزوّد توجّهان الهواء إلى الكرت مباشرة، وواحدة 140 مم في الخلف.

[green]خشب جوز طبيعيّ:[/green] الحواف الخشبيّة الداكنة مع الأسود تعطي الكيس شكل قطعة أثاث لا شكل جهاز ألعاب — والأبيض بخشبٍ فاتح.

[green]يقبل لوحات Back-Connect:[/green] ATX وMicro-ATX بموصلاتٍ خلف اللوحة لتجميعةٍ بلا كابلات ظاهرة، ويقبل أيضاً E-ATX حتى 280 مم وSSI-EEB.

[green]مساحة واسعة للقطع:[/green] كرت حتى 380 مم، ومبرّد هواء حتى 180 مم، ورادييتر 360 مم في السقف.

[green]موزّع مدمج لستّ مراوح PWM وأربعة منافذ ARGB:[/green] تُدار المراوح كلّها من رأسٍ واحد في اللوحة، ومعه منفذ USB-C ومنفذا USB 3.0 في الواجهة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الرادييتر في السقف فقط — الواجهة مخصّصة لمراوح 170 مم.
* المزوّد حتى 220 مم في الوضع العاديّ، و180 مم إن دُوِّر 90 درجة.
* ضمان الكيس سنة واحدة (والمراوح ثلاث سنوات).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* المراوح المرفقة بلا إضاءة RGB — تصميمٌ هادئ المظهر.

${alt('Lian Li LANCOOL 217 White', L217W, 'الكيس نفسه بلونٍ أبيض وخشبٍ فاتح.')}
https://lian-li.com/product/lancool-217/`,
  },
];

// ---------------------------------------------------------------- الفحص
const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
const cats = Object.fromEntries((await prisma.category.findMany({ select: { id: true, name: true } })).map((c) => [c.name, c.id]));
let bad = false;
const stop = (m) => { console.log('⛔ ' + m); bad = true; };

for (const id of [PULSE, L217W]) if (!(await prisma.component.findUnique({ where: { id }, select: { id: true } }))) stop(`رابط البديل مفقود: ${id}`);
for (const P of PARTS) {
  if (!cats[P.category]) stop(`فئة غير معروفة: ${P.category}`);
  const dup = await prisma.component.findFirst({ where: { brand: { equals: P.brand, mode: 'insensitive' }, name: { equals: P.name, mode: 'insensitive' } } });
  if (dup) stop(`موجودة: ${P.brand} ${P.name} → ${dup.id}`);
  if (/\*\*\[(yellow|red|green)\]/.test(P.description)) stop(`${P.name}: نجوم حول وسم`);
  if (!P.description.trim().split('\n').pop().startsWith('https://')) stop(`${P.name}: الرابط ليس السطر الأخير`);
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
writeFileSync(`backups/xfx-9070xt-lancool217-${stamp}.json`, JSON.stringify({ PARTS }, null, 2));

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

console.log(`\nنسخة: backups/xfx-9070xt-lancool217-${stamp}.json\nالتالي: npx tsx scripts/scrape-one.ts ${ids.join(' ')}`);
await prisma.$disconnect();
