/**
 * ============ طلب «5060 prime» — FatoOom Nasser · 2026-09-25 ============
 *
 * ASUS PRIME GeForce RTX 5060 OC Edition 8GB — رقم القطعة 90YV0N10-M0NA00
 * (الطراز PRIME-RTX5060-O8G). وجدتُه بنفس الرقم في ثلاثة متاجر.
 *
 * ⚠️ والطول **٢٦٨٫٣ مم** من صفحة ASUS الرسميّة، لا ٢٨٠ كما تكتب إنفيني
 * آرك. والطول هو ما يُفحص به دخولُ الكرت في الكيس — رقمٌ خاطئٌ هنا يقول
 * «لا يدخل» لكيسٍ يدخله، أو العكس.
 *
 * ⚠️ والمنافذ من ASUS أيضاً: HDMI 2.1b واحد وDP 2.1b ثلاثة. (صفّ 5060
 * العامّ عندنا مكتوبٌ «HDMI 2.1» بلا b — لا يؤثّر في فحصٍ، فتُرك.)
 *
 * ⚠️ والطاقة ١٤٥ واط — TGP الرسميّ من NVIDIA لـRTX 5060. (صفّ 5060
 * العامّ عندنا مكتوبٌ ١١٥ — وهو رقمُ نسخة الحاسب المحمول. مذكورٌ لنوّاف.)
 *
 * العروض (قُرئت 2026-09-25):
 *   · مايكرولس   ٢٬٢٥٣ ﷼ — متوفّر
 *   · إنفيني آرك ٢٬٣٩٩ ﷼ — نافد (يُضاف خامداً، ويعود مع المخزون)
 *   · أمازون     ٢٬١٣٠ ﷼ ظاهرٌ **بلا زرّ شراء** — أغلب الظنّ بائعٌ آخر.
 *     يُضاف ليحكم عليه محرّكُ أمازون بمسار الشراء لا بالرقم.
 *
 * ⚠️ وما بحثتُه ولم أضفه: كازاسوق عنده PRIME **5060 Ti** بنسختين، لا
 * 5060 — والطلب «5060» صريح.
 *
 *   node scripts/add-requested-2026-09-25.mjs           # عرض
 *   node scripts/add-requested-2026-09-25.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const GPU = 'cmpfziqnv0004x4ymffnp204c';
const RTX5060_GENERIC = 'cmq5060xx000000ym00000001'; // NVIDIA GeForce RTX 5060 — 1650

const PARTS = [
  {
    request: '5060 prime',
    categoryId: GPU, brand: 'ASUS', name: 'GeForce RTX 5060 PRIME OC 8G',
    tdpWattage: 145, performanceTier: 2,
    specs: {
      vram: '8GB', memoryType: 'GDDR7', memoryBus: '128-bit', interface: 'PCIe 5.0 x8',
      architecture: 'Blackwell', lengthMm: '268.3', powerConnectors: '1x 8-pin',
      ports: '1x HDMI 2.1b, 3x DP 2.1b',
    },
    offers: [
      { store: 'microless', url: 'https://saudi.microless.com/product/asus-prime-geforce-rtx-5060-oc-edition-graphics-card-8gb-gddr7-128-bit-memory-2565-mhz-boost-clock-28-gbps-memory-speed-3840-cuda-cores-pci-express-5-0-90yv0n10-m0na00/' },
      { store: 'infiniarc', url: 'https://www.infiniarc.com/shop/gpu/90yv0n10-m0na00-asus-prime-geforce-rtx-5060-8gb-gddr7-oc-edition-gpu-9004' },
      { store: 'amazon', url: 'https://www.amazon.sa/dp/B0CSFMYN1W' },
    ],
    description: `### ASUS PRIME GeForce RTX 5060 OC 8GB

نسخة ASUS الهادئة من RTX 5060 — **ثلاث مراوح** على كرتٍ من الفئة الاقتصاديّة، وجسمٌ يدخل الكيسات الصغيرة.

**التقنيات الأساسية المدعومة:**

[green]ثلاث مراوح بمحامل مزدوجة:[/green] نادرٌ في هذه الفئة — أغلب نسخ 5060 بمروحتين. فالحرارة والصوت تحت الحمل الطويل أقلّ.

[green]SFF Ready بعرض ٢٫٥ فتحة:[/green] يطابق معيار NVIDIA للكيسات الصغيرة، وطوله **٢٦٨٫٣ مم**.

[green]تردّد Boost يبلغ 2565 ميجاهرتز:[/green] و2595 في وضع OC من برنامج GPU Tweak III — فوق التردّد المرجعيّ.

[green]8 جيجابايت GDDR7 ومعمارية Blackwell:[/green] تدعم DLSS 4 وتوليد الإطارات المتعدّد.

[green]موصّل 8-pin واحد ومزوّد ٥٥٠ واط:[/green] بحسب ASUS — لا يحتاج محوّل 16-pin ولا مزوّد ATX 3.1.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* **8 جيجابايت فقط** — تكفي 1080p بأعلى الإعدادات، وتضيق في 1440p مع أعلى جودة للخامات في الألعاب الثقيلة.
* واجهة PCIe 5.0 **x8** لا x16 — لا فرق يُذكر على لوحات PCIe 5.0 و4.0، ويظهر قليلاً على لوحات PCIe 3.0 القديمة.
* أطول من نسخ 5060 ذات المروحتين (٢٢٠ مم تقريباً) — راجع كيسك إن كان صغيراً جداً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس لدقة 4K.
* بلا إضاءة RGB ولا مفتاح BIOS مزدوج.

---
بإمكانك التوجه إلى [NVIDIA GeForce RTX 5060](/components/${RTX5060_GENERIC}) إذا كان توجهك يتركز على الآتي:
* مقارنةُ أرخص نسخ الشركات الأخرى من نفس الشريحة.
https://www.asus.com/motherboards-components/graphics-cards/prime/prime-rtx5060-o8g/techspec/`,
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
for (const p of PARTS) {
  const { offers, request, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  for (const o of offers) {
    await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: true } });
  }
  ids.push(c.id);
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);

  const r = await prisma.requestedPart.findFirst({ where: { name: request } });
  if (!r) { console.log(`⚠️ لم أجد الطلب «${request}»`); continue; }
  await prisma.requestedPart.update({
    where: { id: r.id },
    data: { status: 'ADDED', componentId: c.id, adminSeenAt: r.adminSeenAt ?? new Date() },
  });
  console.log(`✔ الطلب «${request}» → ADDED`);
}

console.log(`\nالتالي:\n  npx tsx scripts/scrape-one.ts ${ids.join(' ')}\n  npx tsx scripts/fetch-images.ts --missing`);
await prisma.$disconnect();
