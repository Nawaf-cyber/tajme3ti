/**
 * ============ دفعة: أقراص 512GB ورامات DDR4 ============
 *
 * أكبر ثغرتين في الكتالوج بعد مسحٍ كامل:
 *
 *   التخزين — قرص واحد بسعة 500GB، وهو SATA بـ٩٣١ ﷼. ولا NVMe بهذه
 *   السعة إطلاقاً، مع أن كل تجميعة اقتصادية تبدأ بقرص إقلاع رخيص. وأرخص
 *   NVMe في الكتالوج ١ تيرابايت بـ٣٧٣ ﷼ — أي أن من يريد نصف تيرابايت
 *   كان مضطرّاً لدفع ثمن تيرابايت.
 *
 *   الرام — أربع قطع DDR4 فقط، أرخصها ١٦ جيجابايت بـ٧١٤ ﷼. وهي ذاكرة
 *   منصّات AM4 وLGA1700 الاقتصادية، فغلاؤها يقتل الغرض منها.
 *
 * الخمسة كلّها من أقسام كازاسوق (M.2 و«رامات») لا من بحثٍ عام،
 * والمواصفات من صفحات الصانع وأوراق بياناته.
 *
 *   node scripts/add-batch-storage-ram.mjs           # عرض
 *   node scripts/add-batch-storage-ram.mjs --apply   # تنفيذ مع نسخة احتياطية
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const STORAGE = 'cmpfziqr70005x4ym3k7uh079';
const RAM = 'cmpfziqks0003x4yma730h1be';

const P3_PLUS_1TB = 'cmpi5h9ho000504l1ee6sj9va';
const LEGEND_800_1TB = 'cmr3fmw5c000i04lhjatxwihi';
const LPX_16 = 'cmr3al4ap000004jy5yd63rjq';
const RIPJAWS_32 = 'cmr3al4q8000304jymzjx9fs6';

const PARTS = [
  {
    categoryId: STORAGE, brand: 'XPG', name: 'SX6000 Pro 512GB',
    tdpWattage: 0, performanceTier: 1,
    specs: {
      type: 'NVMe M.2', capacity: '512GB', interface: 'PCIe 3.0 x4',
      formFactor: 'M.2 2280', readSpeed: '2100 MB/s', writeSpeed: '1500 MB/s',
    },
    url: 'https://www.cazasouq.com/adata-sx6000-pro-512gb-m-2-40799',
    description: `### XPG SX6000 Pro 512GB

أرخص مدخل إلى قرص NVMe في الكتالوج — قرص إقلاع لنظام التشغيل وبضع ألعاب، بسعرٍ يقارب أقراص SATA وسرعةٍ تضاعفها.

التقنيات الأساسية المدعومة:

[green]أسرع ثلاث مرّات من SATA:[/green] قراءة 2100 ميجابايت/ث مقابل نحو 550 لأسرع أقراص SATA — الفرق محسوس في إقلاع النظام وفتح البرامج.

[green]PCIe 3.0 x4:[/green] المسارات الأربع كاملة، لا مسارين كما في الأقراص الاقتصادية المشابهة.

[green]300 TBW وخمس سنوات ضمان:[/green] متانة كافية لقرص نظام يعمل سنوات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا ذاكرة DRAM مستقلّة — يعتمد على HMB من رام النظام، فيتباطأ في النسخ الطويل المتواصل.
* 512 جيجابايت تمتلئ سريعاً مع الألعاب الحديثة؛ هو قرص نظام لا مكتبة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* الجيل الثالث من PCIe — لا يقارَب أقراص الجيل الرابع في السرعة القصوى.

---
بإمكانك التوجه إلى [Crucial P3 Plus 1TB](/components/${P3_PLUS_1TB}) إذا كان توجهك يتركز على الآتي:
* ضِعف السعة وسرعة الجيل الرابع بفارق سعر معقول.
https://www.adata.com/en/consumer/category/ssds/solid-state-drives-XPG-SX6000-Pro/`,
  },
  {
    categoryId: STORAGE, brand: 'Adata', name: 'Legend 710 512GB',
    tdpWattage: 0, performanceTier: 1,
    specs: {
      type: 'NVMe M.2', capacity: '512GB', interface: 'PCIe 3.0 x4',
      formFactor: 'M.2 2280', readSpeed: '2400 MB/s', writeSpeed: '1800 MB/s',
    },
    url: 'https://www.cazasouq.com/adata-legend-710-gen-3-m-2-512gb-23846',
    description: `### Adata Legend 710 512GB

قرص إقلاع متوازن: أسرع من فئة الدخول وأرخص من الجيل الرابع، بمتانة 520 تيرابايت كتابة — أعلى من أقرانه في السعر نفسه.

التقنيات الأساسية المدعومة:

[green]2400/1800 ميجابايت/ث:[/green] قراءةً وكتابةً — أسرع من أقراص SATA بأربع مرّات تقريباً.

[green]520 TBW:[/green] متانة عالية لهذه الفئة، تكفي سنوات من الاستعمال اليومي الثقيل.

[green]تشفير AES 256-bit وLDPC:[/green] تصحيح أخطاء وتشفير عتادي، وهما ما يميّزان أقراص العلامات المعروفة عن المغمورة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* بلا DRAM مستقلّة — يعتمد HMB، فيتباطأ في نقل الملفات الضخمة المتواصلة.
* الجيل الثالث؛ اللوحات الحديثة تدعم الرابع وتبقى مسارات معطّلة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا مشتّت حراري مرفق في هذه النسخة.

---
بإمكانك التوجه إلى [Adata Legend 800 1TB](/components/${LEGEND_800_1TB}) إذا كان توجهك يتركز على الآتي:
* ضِعف السعة وواجهة PCIe 4.0.
https://www.adata.com/us/consumer/category/ssds/solid-state-drives-LEGEND-710/`,
  },
  {
    categoryId: STORAGE, brand: 'XPG', name: 'GAMMIX S70 Blade 512GB',
    tdpWattage: 0, performanceTier: 3,
    specs: {
      type: 'NVMe M.2', capacity: '512GB', interface: 'PCIe 4.0 x4',
      formFactor: 'M.2 2280', readSpeed: '7400 MB/s', writeSpeed: '6800 MB/s',
    },
    url: 'https://www.cazasouq.com/xpg-gammix-s70-blade-gen-4-m-2-512gb-aa15769',
    description: `### XPG GAMMIX S70 Blade 512GB

قرص جيل رابع كامل السرعة بنصف تيرابايت — ومشتّته الرقيق يجعله يدخل تحت مشتّت اللوحة الأم ويعمل في PlayStation 5 كذلك.

التقنيات الأساسية المدعومة:

[green]PCIe 4.0 x4:[/green] بمتحكّم Innogrit IG5236 وذاكرة DRAM مستقلّة — لا اعتماد على رام النظام.

[green]مشتّت ألومنيوم رقيق:[/green] يخفض الحرارة نحو ٢٠٪، وسماكته 4.3 مم فيدخل تحت مشتّتات اللوحات.

[green]750 ألف IOPS:[/green] قراءةً وكتابةً عشوائية — وهو الرقم الذي يُحسّ في تحميل الألعاب لا السرعة المتسلسلة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ الشركة تنشر «حتى 7400/6800» لكل السعات بلا تفصيل لكل سعة، والسعات الصغيرة عادةً أبطأ في الكتابة المتواصلة لقلّة رقائقها. فالرقم سقفُ العائلة لا وعدٌ لهذه السعة.
* 512 جيجابايت لمكتبة ألعاب صغيرة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سعره لكل جيجابايت أعلى من سعات التيرابايت.

---
بإمكانك التوجه إلى [Crucial P3 Plus 1TB](/components/${P3_PLUS_1TB}) إذا كان توجهك يتركز على الآتي:
* ضِعف السعة بسعر أقل، مع تنازل عن السرعة القصوى.
https://www.xpg.com/us/xpg/830?tab=spec`,
  },
  {
    categoryId: RAM, brand: 'TeamGroup', name: 'T-Force Delta RGB 16GB (2x8GB) DDR4 3600MHz',
    tdpWattage: 0, performanceTier: 2,
    specs: {
      type: 'DDR4', capacity: '16GB', kit: '2x8GB', speed: '3600',
      casLatency: 'CL18', profile: 'XMP 2.0', rgb: 'Yes',
    },
    url: 'https://www.cazasouq.com/teamgroup-t-force-delta-ddr4-16gb-3600mhz-2x8gb-rgb-black-48249',
    description: `### TeamGroup T-Force Delta RGB 16GB DDR4 3600MHz

طقم 3600 ميجاهرتز — وهو التردّد الذي تقف عنده منصّات AM4 بأفضل توافق بين سرعة الذاكرة وساعة الرابط (Infinity Fabric)، فلا يُهدر أداءً كما تفعل الترددات الأعلى.

التقنيات الأساسية المدعومة:

[green]3600MHz CL18:[/green] توقيتات 18-22-22-42 عند 3600 — النقطة المثلى لمعالجات Ryzen من الجيلين الثالث والخامس.

[green]إضاءة بزاوية 120 درجة:[/green] شريط ناشر عريض بدل نقاط مضيئة، ويتزامن مع Aura Sync وأشباهها.

[green]مشتّت ألومنيوم منخفض نسبياً:[/green] لا يزاحم أغلب مبرّدات المعالج الهوائية.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* CL18 أعلى من CL16 في الأطقم الأغلى — فرق طفيف في الألعاب ومحسوس في الحسابات الحسّاسة للكمون.
* 16 جيجابايت كافية للألعاب اليوم، ضيّقة للبثّ والمونتاج معاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* DDR4 — لا تعمل في لوحات AM5 ولا في لوحات DDR5.

---
بإمكانك التوجه إلى [Corsair Vengeance LPX 16GB](/components/${LPX_16}) إذا كان توجهك يتركز على الآتي:
* طقم بلا إضاءة وبارتفاع أقل، يناسب المبرّدات الضخمة.
https://www.teamgroupinc.com/en/product-detail/memory/T-FORCE/delta-rgb-ddr4-black/delta-rgb-ddr4-black-TF3D416G3600HC18JDC01/`,
  },
  {
    categoryId: RAM, brand: 'XPG', name: 'Spectrix D60G 32GB (2x16GB) DDR4 3600MHz',
    tdpWattage: 0, performanceTier: 3,
    specs: {
      type: 'DDR4', capacity: '32GB', kit: '2x16GB', speed: '3600',
      casLatency: 'CL18', profile: 'XMP 2.0', rgb: 'Yes',
    },
    url: 'https://www.cazasouq.com/xpg-spectrix-d60g-ddr4-32gb-3600mhz-2x16gb-rgb-19613',
    description: `### XPG Spectrix D60G 32GB DDR4 3600MHz

اثنان وثلاثون جيجابايت من DDR4 عند 3600 ميجاهرتز — السعة التي تفتح المونتاج والبثّ مع اللعب في آنٍ واحد، على منصّة لا تحتاج ثمن DDR5.

التقنيات الأساسية المدعومة:

[green]32GB (2x16GB):[/green] قناتان مزدوجتان بفتحتين، فتبقى فتحتان فارغتان للتوسعة لاحقاً.

[green]3600MHz CL18 عند 1.35 فولت:[/green] بروفايل XMP 2.0 يُفعَّل بضغطة، ومدى تشغيل واسع من 3000 إلى 4133.

[green]شريطا إضاءة:[/green] تصميم مزدوج الشريط بزاوية عرض واسعة — أوضح من الأطقم أحادية الشريط.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* CL18 لا CL16؛ الفرق طفيف في الاستعمال العام.
* ارتفاع المشتّت مع الإضاءة قد يزاحم المبرّدات الهوائية الضخمة — يُقاس قبل الشراء.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* DDR4 — لا تعمل في لوحات AM5 ولا في لوحات DDR5.

---
بإمكانك التوجه إلى [G.Skill Ripjaws V 32GB](/components/${RIPJAWS_32}) إذا كان توجهك يتركز على الآتي:
* السعة نفسها بلا إضاءة وبارتفاع أقلّ بكثير.
https://www.xpg.com/us/xpg/565`,
  },
];

// ---------------------------------------------------------------- التنفيذ

const caza = await prisma.store.findFirst({ where: { slug: 'cazasouq' }, select: { id: true } });

let blocked = false;
for (const p of PARTS) {
  const dup = await prisma.component.findFirst({ where: { name: p.name, brand: p.brand } });
  const urlTaken = await prisma.componentOffer.findFirst({
    where: { url: p.url }, select: { component: { select: { name: true } } },
  });
  console.log(`\n=== ${p.brand} ${p.name}`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  if (dup) { console.log(`    ⛔ موجودة مسبقاً: ${dup.id}`); blocked = true; }
  if (urlTaken) { console.log(`    ⛔ الرابط مستعمل في: ${urlTaken.component.name}`); blocked = true; }
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-batch-${stamp}.json`, JSON.stringify(PARTS, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch-${stamp}.json`);

const ids = [];
for (const p of PARTS) {
  const { url, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  await prisma.componentOffer.create({ data: { componentId: c.id, storeId: caza.id, url, inStock: true } });
  ids.push(c.id);
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}

console.log('\nالخطوة التالية:');
console.log(`  npx tsx scripts/scrape-one.ts ${ids.join(' ')}`);
console.log('  npx tsx scripts/fetch-images.ts --missing');
await prisma.$disconnect();
