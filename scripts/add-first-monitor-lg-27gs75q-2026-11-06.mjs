/**
 * 2026-11-06 — أوّل شاشة (تجربة الأساس حيّاً، خطّة الشاشات). نوّاف: «نعم».
 *
 * LG UltraGear 27GS75Q-B — 27" QHD IPS، 180Hz (200 بالرفع)، 1ms GtG.
 * المصادر (قُرئت 2026-11-06):
 *   · LG السعوديّة lg.com/sa_en/monitors/gaming/27gs75q-b: 2560x1440 IPS، 180Hz (O/C 200Hz)، 1ms GtG، HDR10،
 *     sRGB 99%، G-SYNC Compatible وFreeSync، ميلان −5°~15° وارتفاع 110 مم وPivot، و«DisplayPort 1.4 للرفع إلى 200».
 *   · مايكرولس (جدوله): 300 cd/m²، تباين 1000:1، Adaptive Sync = FreeSync، DisplayPort وHDMI وسمّاعة رأس.
 *   · displayspecifications: DP 1.4 واحد، وHDMI **مختلفٌ فيه** (2.1 في صفحة الطراز و2.0 في صفحات المقارنة)
 *     ← يُكتب الأحوط 2.0 ويُذكر الخلاف في الأصفر (قاعدة الأوصاف).
 * العروض: أمازون B0CZ3PS82R «27GS75Q-B.AEU» 1135، متوفّر، يشحنه Amazon.sa؛ مايكرولس OutOfStock؛
 * كازاسوق وريد زون وإنفيني آرك: لا شيء (بحث lib/store-search). الصورة من أمازون.
 *
 * performanceTier = null: «المستوى» من 5 لا معنى له للشاشة (كان component-save يجعله 3 افتراضاً).
 * ولا قسم بديل في الوصف: أوّل قطعةٍ في فئتها.
 *
 *   node scripts/add-first-monitor-lg-27gs75q-2026-11-06.mjs           # عرض
 *   node scripts/add-first-monitor-lg-27gs75q-2026-11-06.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const PART = {
  brand: 'LG',
  name: 'UltraGear 27GS75Q-B',
  imageUrl: 'https://m.media-amazon.com/images/I/816yiS6dnuL._AC_SL1500_.jpg',
  tdpWattage: 0,
  performanceTier: null,
  specs: {
    sizeInch: '27',
    resolution: '2560x1440',
    refreshHz: '180',
    panel: 'IPS',
    responseMs: '1',
    hdr: 'HDR10',
    vrr: 'FreeSync · G-Sync Compatible',
    dpVersion: '1.4',
    hdmiVersion: '2.0',
    curvature: 'Flat',
    brightnessNits: '300',
  },
  offers: [
    { store: 'amazon', url: 'https://www.amazon.sa/dp/B0CZ3PS82R', inStock: true, key: 'B0CZ3PS82R' },
    { store: 'microless', url: 'https://saudi.microless.com/product/lg-27gs75q-ultragear-gaming-monitor-27-qhd-ips-display-up-to-200hz-refresh-rate-1ms-gtg-response-time-amd-freesync-nvidia-g-sync-compatible-16-7m-color-display-black-27gs75q-b/', inStock: false, key: '27gs75q-b' },
  ],
  description: `### LG UltraGear 27GS75Q-B

شاشة ألعاب 27 بوصة بدقّة 1440p (QHD) ولوحة IPS بتردّد 180 هرتز، يرتفع إلى 200 بالرفع (Overclock). مكانها مع كرتٍ متوسّط أو عالٍ يلعب على 1440p، لمن يبي صورةً حادّة وحركةً سلسة بسعرٍ معقول.

**التقنيات الأساسية المدعومة:**

[green]1440p على 27 بوصة:[/green] قرابة 109 نقطة في البوصة — أوضح بكثير من 1080p على المقاس نفسه، فالنصّ والتفاصيل حادّة من مسافة الجلوس المعتادة.

[green]180 هرتز، و200 بالرفع:[/green] تناسب كرتاً يعطي بين 100 و180 إطاراً في 1440p. والرفع إلى 200 يحتاج كرتاً وكابلاً يدعمان DisplayPort 1.4 كما تقول LG.

[green]لوحة IPS باستجابة 1ms (GtG):[/green] ألوانٌ أدقّ وزوايا رؤية 178 درجة، مع حركةٍ واضحة في الألعاب السريعة.

[green]FreeSync وG-Sync Compatible:[/green] مزامنة الإطارات تعمل مع كروت AMD وNVIDIA، فلا تتمزّق الصورة حين تنزل الإطارات تحت 180.

[green]sRGB 99% وHDR10:[/green] تغطيةٌ شبه كاملة لألوان الألعاب والويب المعتادة.

[green]حاملٌ يرتفع 110 مم ويميل ويدور عمودياً (Pivot):[/green] تضبط الشاشة على مستوى عينك بدل رفعها بكتبٍ تحتها.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **HDR10 هنا اسمٌ أكثر منه تجربة:** سطوعها نحو 300 نِت، والـHDR الحقيقيّ يحتاج 600 فأكثر — فلا تنتظر فرقاً كبيراً في الأفلام والألعاب بـHDR.
* تباين IPS المعتاد (1000:1): السواد في غرفةٍ مظلمة أفتح منه في شاشات VA وOLED.
* المصادر تختلف في نسخة HDMI (2.0 أو 2.1)، فللـ180 هرتز وما فوقها استعمل منفذ DisplayPort.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليست 4K: من يملك كرتاً يعطي 60 إطاراً فأكثر في 4K يستفيد من دقّةٍ أعلى.
* ليست OLED: سواد OLED وسرعته في فئةٍ أخرى بسعرٍ أعلى.

https://www.lg.com/sa_en/monitors/gaming/27gs75q-b/`,
};

// ---------------------------------------------------------------- الفحص
const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
const cat = await prisma.category.findUnique({ where: { name: 'Monitor' }, select: { id: true } });
let bad = false;
const stop = (m) => { console.log('⛔ ' + m); bad = true; };

if (!cat) stop('لا فئة Monitor — شغّل scripts/create-monitor-category-2026-11-06.mjs أوّلاً');
const dup = await prisma.component.findFirst({ where: { name: { contains: '27GS75Q', mode: 'insensitive' } }, select: { id: true } });
if (dup) stop(`موجودة: ${dup.id}`);
if (/\*\*\[(yellow|red|green)\]/.test(PART.description)) stop('نجوم حول وسم');
if (!PART.description.trim().split('\n').pop().startsWith('https://')) stop('الرابط ليس السطر الأخير');
for (const o of PART.offers) {
  if (!stores[o.store]) stop(`متجر غير معروف: ${o.store}`);
  const t = await prisma.componentOffer.findFirst({ where: { url: { contains: o.key, mode: 'insensitive' } }, select: { component: { select: { name: true } } } });
  if (t) stop(`${o.store}: الرابط مستعمل في ${t.component.name}`);
}
console.log(`✚ Monitor · ${PART.brand} ${PART.name}\n  ${PART.offers.map((o) => o.store + (o.inStock ? '' : ' (نافد)')).join(' + ')} · وصف ${PART.description.length} حرفاً`);

if (bad || !apply) { console.log(bad ? '⛔ متوقّف' : '(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(bad ? 1 : 0); }

// ---------------------------------------------------------------- التنفيذ
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/first-monitor-lg-27gs75q-${stamp}.json`, JSON.stringify({ PART }, null, 2));
const { offers, ...data } = PART;
const c = await prisma.component.create({ data: { ...data, categoryId: cat.id, price: 0 } });
for (const o of offers) await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: o.inStock } });
console.log(`✔ ${PART.brand} ${PART.name} → ${c.id}\nنسخة: backups/first-monitor-lg-27gs75q-${stamp}.json\nالتالي: npx tsx scripts/scrape-one.ts ${c.id}`);
await prisma.$disconnect();
