/**
 * 2026-11-02 — بعد الأبيض (scripts/add-xpg-lancer-blade-2026-11-02.mjs) قال نوّاف «ضيف الاسود وعدل اسم الـ32».
 *
 * ① XPG Lancer Blade RGB 16GB (2x8GB) DDR5 5600 CL46 **Black** = AX5U5600C468G-DTLABRBK (باركود 4711085949950).
 *    قُرئت الصفحات بالمتصفّح 2026-11-02، وكلّها تحمل الرمز أو الباركود نفسه:
 *      كازاسوق   105 دينار ≈ 1047.94 ريال، InStock (JSON-LD، الباركود 4711085949950)
 *      نون        1199، InStock، البائع TechTroniX (الرمز في المواصفات) — نون يدويّ: يُكتب سعره ووقت قراءته
 *      ريد زون    1499، InStock (JSON-LD، الباركود 4711085949950)
 *      مايكرولس   OutOfStock (الباركود 4711085949950)
 *      أمازون: لا طقم 2x8 أسود (شريحةٌ مفردة 16GB فقط). جرير وإنفيني آرك: لا شيء.
 *    الصورة من كازاسوق (og:image، نطاق supabase المسموح) — صور مايكرولس مستبعدة.
 *
 * ② «ADATA Lancer Blade 32GB 6000MHz» (cmpiecqao005c00ym91dkcumi) ← XPG «Lancer Blade RGB 32GB (2x16GB) DDR5 6000MHz CL36 Black».
 *    عرضا مايكرولس وأمازون = AX5U6000C3616G-DTLABRBK (أسود CL36). ومعه تصحيح: كان ارتفاعه 33.8 مم — وذاك ارتفاع
 *    Lancer Blade **بلا** إضاءة؛ صفحة XPG لنسخة RGB تقول 133.35×40×7.86 مم. والوصف بُني على الرقم الخطأ («من أقصر
 *    أطقم RGB»). واللون يُضاف للمواصفات. الصفّ في ٥ تجميعات محفوظة — المعرّف لا يتغيّر.
 *    ⚠️ عرض كازاسوق عليه (نافد، 100 دينار) عنوانه «Lancer Blade» بلا RGB وباركوده 4711085944887 لم يُعرف طرازه — لم يُمسّ.
 *
 * ③ رابط البديل في وصف الأبيض يأخذ الاسم الجديد.
 *
 *   node scripts/add-xpg-lancer-black-2026-11-02.mjs           # عرض
 *   node scripts/add-xpg-lancer-black-2026-11-02.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const RAM = 'cmpfziqks0003x4yma730h1be';
const LB32 = 'cmpiecqao005c00ym91dkcumi';
const WHITE = 'cmvzehxm6000064ym17odp21r';
const LB32_NAME = 'Lancer Blade RGB 32GB (2x16GB) DDR5 6000MHz CL36 Black';

const alt = (name, id, ...why) => `---\nبإمكانك التوجه إلى [${name}](/components/${id}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const PART = {
  brand: 'XPG',
  name: 'Lancer Blade RGB 16GB (2x8GB) DDR5 5600MHz CL46 Black',
  imageUrl: 'https://chqgmmjhrrcjwtnbhcpr.supabase.co/storage/v1/object/public/media-library/opencart/6d9d70243d9f8b7c2d14de26a05d4a1a6e99d4c2e30eded8720dc2ab98dbf1ff.png',
  tdpWattage: 0,
  performanceTier: 2,
  specs: { type: 'DDR5', capacity: '16GB', kit: '2x8GB', speed: '5600', casLatency: 'CL46', profile: 'XMP 3.0 & EXPO', rgb: 'Yes', heightMm: '40', color: 'Black' },
  offers: [
    { store: 'cazasouq', url: 'https://www.cazasouq.com/product/xpg-lancer-blade-rgb-ddr5-16gb-5600mhz-2x8gb-black' },
    { store: 'noon', url: 'https://www.noon.com/saudi-en/xpg-lancer-blade-rgb-ddr5-ram-16gb-2x8gb-5600mt-s-cl46-low-profile-gaming-memory-black-intel-xmp-3-0-amd-expo-ready/N70437542V/p/', price: 1199, inStock: true },
    { store: 'redzone', url: 'https://redzzone.com/products/%D8%B1%D8%A7%D9%85%D8%A7%D8%AA-%D8%A7%D9%83%D8%B3-%D8%A8%D9%8A-%D8%AC%D9%8A-adata-xpg-lancer-blade-rgb-%D8%B3%D8%B9%D8%A9-16gb-2x8gb-ddr5-%D8%A8%D8%B3%D8%B1%D8%B9%D8%A9-5600mhz-%D9%84%D9%88%D9%86-%D8%A3%D8%B3%D9%88%D8%AF' },
    { store: 'microless', url: 'https://saudi.microless.com/product/adata-xpg-lancer-blade-rgb-16gb-2x-8gb-ddr5-desktop-memory-5600mt-s-memory-speed-cas-latency-46-amd-expo-intel-xmp-3-0-ready-288-pin-udimm-form-factor-black-ax5u5600c468g-dtlabrbk/' },
  ],
  description: `### XPG Lancer Blade RGB 16GB (2x8GB) DDR5 5600MHz CL46 Black

النسخة السوداء من طقم Lancer Blade RGB: 16 جيجابايت في شريحتين (8+8) بسرعة 5600 وتوقيت CL46، وفوق مشتّته المنخفض شريط إضاءة RGB (AX5U5600C468G-DTLABRBK). مكانه تجميعة ألعابٍ اقتصاديّة أو متوسّطة، لمن يبي إضاءة بدون ما تعلق الرام في مبرّد المعالج.

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

${alt(`XPG ${LB32_NAME}`, LB32, 'ضعف السعة (32 جيجابايت) وسرعة 6000 بتوقيت CL36 من السلسلة نفسها وباللون نفسه.')}
https://www.xpg.com/en/xpg/dram-modules-lancer-blade-rgb-ddr5`,
};

/* ② تعديلات وصف الـ32 — كلّ نصٍّ يجب أن يوجد مرّةً واحدة بالضبط */
const LB32_EDITS = [
  ['### ADATA XPG Lancer Blade RGB 32GB (2x16GB) DDR5 6000MHz CL36', `### XPG ${LB32_NAME}`],
  ['طقم XPG بمشتّتٍ نحيف منخفض الارتفاع (33.8 مم) وإضاءة RGB، بسرعة 6000 وملفّي XMP وEXPO.',
    'طقم XPG أسود بمشتّتٍ منخفض الارتفاع (40 مم مع الإضاءة) وإضاءة RGB، بسرعة 6000 وملفّي XMP وEXPO (AX5U6000C3616G-DTLABRBK).'],
  ['[green]ارتفاع 33.8 مم فقط:[/green] من أقصر أطقم RGB، فلا يتعارض مع المبرّدات الهوائيّة الضخمة ولا الرادييترات العلويّة.',
    '[green]ارتفاعه 40 مم مع الإضاءة:[/green] أقصر من أغلب أطقم RGB (Fury Beast RGB نحو 42 وVengeance RGB نحو 44)، فيمرّ تحت المبرّدات الهوائيّة الضخمة في الغالب.'],
];
const WHITE_EDIT = ['[ADATA Lancer Blade 32GB 6000MHz](/components/cmpiecqao005c00ym91dkcumi)', `[XPG ${LB32_NAME}](/components/${LB32})`];

// ---------------------------------------------------------------- الفحص
const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
let bad = false;
const stop = (m) => { console.log('⛔ ' + m); bad = true; };
const once = (text, s, label) => { const n = text.split(s).length - 1; if (n !== 1) stop(`${label}: النصّ موجود ${n} مرّة — «${s.slice(0, 50)}…»`); };

// ①
const dup = await prisma.component.findFirst({ where: { brand: { equals: PART.brand, mode: 'insensitive' }, name: { equals: PART.name, mode: 'insensitive' } } });
if (dup) stop(`الأسود موجود: ${dup.id}`);
if (/\*\*\[(yellow|red|green)\]/.test(PART.description)) stop('نجوم حول وسم');
for (const o of PART.offers) {
  if (!stores[o.store]) stop(`متجر غير معروف: ${o.store}`);
  const key = o.store === 'noon' ? 'N70437542V' : o.url.replace(/\/$/, '').split('/').pop();
  const t = await prisma.componentOffer.findFirst({ where: { url: { contains: key } }, select: { component: { select: { brand: true, name: true } } } });
  if (t) stop(`${o.store}: الرابط مستعمل في ${t.component.brand} ${t.component.name}`);
}
console.log(`✚ ${PART.brand} ${PART.name}\n  ${PART.offers.map((o) => o.store + (o.price ? ` (${o.price})` : '')).join(' + ')} · وصف ${PART.description.length} حرفاً`);

// ②
const lb = await prisma.component.findUnique({ where: { id: LB32 }, select: { brand: true, name: true, specs: true, description: true, categoryId: true } });
if (!lb || lb.name !== 'Lancer Blade 32GB 6000MHz' || lb.categoryId !== RAM) stop('صفّ الـ32 ليس كما قُرئ');
const clash = await prisma.component.findFirst({ where: { name: { equals: LB32_NAME, mode: 'insensitive' } } });
if (clash) stop(`الاسم الجديد مستعمل: ${clash.id}`);
const lbSpecs = typeof lb?.specs === 'string' ? JSON.parse(lb.specs) : { ...(lb?.specs || {}) };
if (lbSpecs.casLatency !== 'CL36' || lbSpecs.speed !== '6000' || lbSpecs.capacity !== '32GB') stop('مواصفات الـ32 لا تطابق الاسم الجديد');
let lbDesc = lb?.description || '';
for (const [a, b] of LB32_EDITS) { once(lbDesc, a, 'وصف الـ32'); lbDesc = lbDesc.replace(a, b); }
if (/33\.8/.test(lbDesc)) stop('بقي 33.8 في وصف الـ32');
const nextSpecs = { ...lbSpecs, heightMm: '40', color: 'Black' };
console.log(`✎ ${lb?.brand} ${lb?.name} → XPG ${LB32_NAME}\n  الارتفاع ${lbSpecs.heightMm} → 40 · اللون → Black · الوصف ${LB32_EDITS.length} تعديلات`);

// ③
const white = await prisma.component.findUnique({ where: { id: WHITE }, select: { description: true } });
once(white?.description || '', WHITE_EDIT[0], 'وصف الأبيض');
console.log('✎ رابط البديل في وصف الأبيض');

if (bad || !apply) { console.log(bad ? '⛔ متوقّف' : '(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(bad ? 1 : 0); }

// ---------------------------------------------------------------- التنفيذ
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/xpg-lancer-black-and-32-rename-${stamp}.json`, JSON.stringify({ PART, lb32Before: lb, whiteDescriptionBefore: white?.description }, null, 2));

const { offers, ...data } = PART;
const c = await prisma.component.create({ data: { ...data, categoryId: RAM, price: 0 } });
for (const o of offers) {
  await prisma.componentOffer.create({
    data: o.store === 'noon'
      ? { componentId: c.id, storeId: stores.noon, url: o.url, price: o.price, inStock: o.inStock, lastCheckedAt: new Date() }
      : { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: true },
  });
}
console.log(`✔ ${PART.brand} ${PART.name} → ${c.id}`);

await prisma.component.update({ where: { id: LB32 }, data: { brand: 'XPG', name: LB32_NAME, specs: nextSpecs, description: lbDesc } });
console.log(`✔ ${LB32} → XPG ${LB32_NAME}`);

await prisma.component.update({ where: { id: WHITE }, data: { description: white.description.replace(WHITE_EDIT[0], WHITE_EDIT[1]) } });
console.log('✔ وصف الأبيض');

console.log(`\nنسخة: backups/xpg-lancer-black-and-32-rename-${stamp}.json\nالتالي: npx tsx scripts/scrape-one.ts ${c.id}`);
await prisma.$disconnect();
