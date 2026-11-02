/**
 * 2026-11-02 — طلب زائر (رابط كازاسوق «xpg-lancer-blade-ddr5-16gb-5600mhz-2x8gb-white»). قال نوّاف «شوف الاقتراح الجديد وجمع المتاجر حقته (الرام)».
 *
 * ⚠️ أيّ نسخة؟ عنوان كازاسوق «Lancer Blade» وصورته النسخة بلا إضاءة، لكنّ وصفه «LANCER BLADE RGB»، وباركوده
 * 4711085949936 هو نفسه في صفحة مايكرولس لـ AX5U5600C468G-DTLABRWH (و«R» في رموز XPG = RGB، وGeeknetic يربط الباركود
 * بالرمز نفسه). فالقطعة: XPG Lancer Blade **RGB** 16GB (2x8GB) DDR5 5600 CL46 **White**.
 *
 * المتاجر (قُرئت بالمتصفّح 2026-11-02):
 *   كازاسوق   99 دينار ≈ 988.05 ريال، InStock (JSON-LD)
 *   مايكرولس  الرمز نفسه والباركود نفسه، OutOfStock (JSON-LD، السعر 0)
 *   أمازون    B0DVZPK5JW = AX5U5600C468G-DTLABRWH، بلا عرضٍ مميّز («See All Buying Options»، بائعٌ واحد)
 *   نون وريد زون: الأسود وحده (1199 في نون). جرير وإنفيني آرك: لا شيء.
 *
 * المواصفات من صفحة XPG الرسميّة (dram-modules-lancer-blade-rgb-ddr5، تبويب المواصفات): SPD لنسخة 5600 = 5600 بتوقيت
 * 46-45-45-89 وجهد 1.1V، الأبعاد 133.35×40×7.86 مم، XMP 3.0 وEXPO، ضمانٌ محدود مدى الحياة.
 * الصورة من أمازون (#landingImage) — صور مايكرولس مستبعدة بطلب نوّاف (scripts/fetch-images).
 *
 *   node scripts/add-xpg-lancer-blade-2026-11-02.mjs           # عرض
 *   node scripts/add-xpg-lancer-blade-2026-11-02.mjs --apply   # تنفيذ
 * الطلب لا يُغيَّر هنا — ربطُه وجعلُه «أُضيفت» قرار نوّاف.
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const RAM = 'cmpfziqks0003x4yma730h1be';
const ALT = {
  LB32: ['ADATA Lancer Blade 32GB 6000MHz', 'cmpiecqao005c00ym91dkcumi'],
};
const alt = (k, ...why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const PART = {
  brand: 'XPG',
  name: 'Lancer Blade RGB 16GB (2x8GB) DDR5 5600MHz CL46 White',
  imageUrl: 'https://m.media-amazon.com/images/I/51kHy8G3NfL._AC_SL1500_.jpg',
  tdpWattage: 0,
  performanceTier: 2,
  specs: { type: 'DDR5', capacity: '16GB', kit: '2x8GB', speed: '5600', casLatency: 'CL46', profile: 'XMP 3.0 & EXPO', rgb: 'Yes', heightMm: '40', color: 'White' },
  offers: [
    { store: 'cazasouq', url: 'https://www.cazasouq.com/product/xpg-lancer-blade-ddr5-16gb-5600mhz-2x8gb-white' },
    { store: 'microless', url: 'https://saudi.microless.com/product/adata-xpg-lancer-blade-rgb-16gb-2x-8gb-ddr5-desktop-memory-5600mt-s-memory-speed-cas-latency-46-amd-expo-intel-xmp-3-0-ready-288-pin-udimm-form-factor-white-ax5u5600c468g-dtlabrwh/' },
    { store: 'amazon', url: 'https://www.amazon.sa/dp/B0DVZPK5JW' },
  ],
  description: `### XPG Lancer Blade RGB 16GB (2x8GB) DDR5 5600MHz CL46 White

طقم ذاكرة DDR5 أبيض من XPG بسعة 16 جيجابايت في شريحتين (8+8)، بسرعة 5600 وتوقيت CL46، وفوق مشتّته المنخفض شريط إضاءة RGB (AX5U5600C468G-DTLABRWH). مكانه تجميعة ألعابٍ اقتصاديّة أو متوسّطة بلونٍ أبيض، لمن يبي إضاءة بدون ما تعلق الرام في مبرّد المعالج.

**التقنيات الأساسية المدعومة:**

[green]5600 من أوّل تشغيل:[/green] نسخة 5600 مبرمجةٌ في الـSPD نفسها بتوقيت 46-45-45 وجهد 1.1 فولت، فتشتغل بسرعتها المعلنة على أغلب اللوحات بلا تفعيل XMP أو EXPO.

[green]ملفّا Intel XMP 3.0 وAMD EXPO:[/green] جاهزان في البايوس إن احتاجت لوحتك تفعيل الملفّ يدوياً — على معالجات Intel وRyzen معاً.

[green]ارتفاعه 40 مم مع الإضاءة:[/green] أقصر من أغلب أطقم RGB (Fury Beast RGB نحو 42 وVengeance RGB نحو 44)، فيمرّ تحت مراوح المبرّدات الهوائيّة الكبيرة في الغالب.

[green]إضاءة RGB تتزامن مع اللوحة:[/green] شريطٌ على الحافّة العلويّة يُدار من برامج إضاءة اللوحات الأمّ الشائعة، فيتماشى مع بقيّة إضاءة الجهاز.

[green]جهد 1.1 فولت وضمان مدى الحياة المحدود:[/green] حرارته منخفضة ولا يحتاج تهويةً خاصّة، وعليه ضمان XPG المحدود مدى الحياة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **توقيت CL46 بطيءٌ نسبياً:** زمن الوصول الفعليّ قرابة 16 نانوثانية، مقابل نحو 10 في أطقم 6000 CL30 — فرقٌ يظهر في الألعاب المعتمدة على المعالج أكثر من غيرها.
* 16 جيجابايت تكفي ألعاب اليوم، لكنّ بعض الألعاب الحديثة — أو اللعب مع البثّ — يستفيد من 32.
* شرائح DDR5 بسعة 8 جيجابايت تُبنى برقاقات x16 فيها نصف مجموعات البنوك، فأداؤها أقلّ قليلاً من شرائح 16 جيجابايت بالسرعة نفسها.
* الترقية لاحقاً بشريحتين إضافيّتين (أربع شرائح DDR5) قد تُجبر اللوحة على خفض السرعة؛ الأفضل حينها استبدال الطقم بطقم 32.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يركب على لوحات DDR4.
* ليس طقماً لرفع السرعة: سقفه الرسميّ 5600.

${alt('LB32', 'ضعف السعة (32 جيجابايت) وسرعة 6000 بتوقيت CL36 من السلسلة نفسها — بلونٍ أسود.')}
https://www.xpg.com/en/xpg/dram-modules-lancer-blade-rgb-ddr5`,
};

// ---------------------------------------------------------------- الفحص
const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
let bad = false;
const stop = (m) => { console.log('⛔ ' + m); bad = true; };

const dup = await prisma.component.findFirst({ where: { brand: { equals: PART.brand, mode: 'insensitive' }, name: { equals: PART.name, mode: 'insensitive' } } });
if (dup) stop(`موجودة: ${dup.id}`);
if (/\*\*\[(yellow|red|green)\]/.test(PART.description)) stop('نجوم حول وسم');
for (const o of PART.offers) {
  if (!stores[o.store]) stop(`متجر غير معروف: ${o.store}`);
  const asin = (o.url.match(/\/dp\/([A-Z0-9]{10})/) || [])[1];
  const key = asin ? `/dp/${asin}` : o.url.replace(/\/$/, '').split('/').pop();
  const t = await prisma.componentOffer.findFirst({ where: { url: { contains: key } }, select: { component: { select: { brand: true, name: true } } } });
  if (t) stop(`${o.store}: الرابط مستعمل في ${t.component.brand} ${t.component.name}`);
}
for (const [k, [n, id]] of Object.entries(ALT)) {
  const c = await prisma.component.findUnique({ where: { id }, select: { brand: true, name: true } });
  if (!c || `${c.brand} ${c.name}` !== n) stop(`البديل ${k}: ${c ? `${c.brand} ${c.name}` : 'غير موجود'}`);
}
const cat = await prisma.category.findUnique({ where: { id: RAM }, select: { name: true } });
if (cat?.name !== 'RAM') stop('فئة الرام');
console.log(`✚ ${PART.brand} ${PART.name}\n  ${PART.offers.map((o) => o.store).join(' + ')} · وصف ${PART.description.length} حرفاً`);
if (bad || !apply) { console.log(bad ? '⛔ متوقّف' : '(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(bad ? 1 : 0); }

// ---------------------------------------------------------------- التنفيذ
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/add-xpg-lancer-blade-${stamp}.json`, JSON.stringify({ PART }, null, 2));
const { offers, ...data } = PART;
const c = await prisma.component.create({ data: { ...data, categoryId: RAM, price: 0 } });
for (const o of offers) await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: true } });
console.log(`✔ ${PART.brand} ${PART.name} → ${c.id}\nنسخة: backups/add-xpg-lancer-blade-${stamp}.json\nالتالي: npx tsx scripts/scrape-one.ts ${c.id}`);
await prisma.$disconnect();
