/**
 * ============ طلب «5070 aorus master تكفى حاول توفرها» — 2026-09-28 ============
 *
 * Gigabyte AORUS GeForce RTX 5070 MASTER 12G — GV-N5070AORUS M-12GD.
 *
 * ⚠️ صفٌّ مستقلّ لا عرضٌ على صفّ RTX 5070 العامّ، بقاعدة نوّاف: النسخة
 * تستحقّ صفّاً إذا تحقّق اثنان من ثلاثة — طُلبت بالاسم، وتختلف فعلاً
 * (فاخرة: طول ٣١٧ مم وسعرٌ أعلى)، وتُباع في متجرين فأكثر. وهذه الثلاثة.
 *
 * المواصفات من صفحة Gigabyte: https://www.gigabyte.com/Graphics-Card/GV-N5070AORUS-M-12GD/sp
 *
 * العروض (قُرئت صفحاتها 2026-09-28):
 *   · كازاسوق    ٣٬٧٠٠ ﷼ — متوفّر (قطعة واحدة)
 *   · أمازون     ٤٬١٩٠٫١٤ ﷼ — يبيعه ويشحنه Amazon UK (B0DTGMBHQ3). والعرض
 *     الآخر (B0DTR3WM7Y، بائعٌ خارجيّ بقطعةٍ واحدة) لم يُختر: عرضٌ واحد
 *     لكلّ متجر، والأثبتُ أولى.
 *   · مايكرولس   ٤٬٧٣٨٫٥٥ ﷼ — متوفّر
 *   ✕ نون: عرضان باسم «Generic» بـ٨٬٦٩٩ — أكثر من ضعف كازاسوق. لم يُضف.
 *
 * والوصف بنبرة «المستشار المتوازن» وبالفصحى المبسّطة — قرار نوّاف 2026-09-28:
 * الحقيقة نفسها («القيمة في التبريد لا في الفريمات») بلا تطبيلٍ ولا تهكّم.
 *
 *   node scripts/add-requested-2026-09-28.mjs           # عرض
 *   node scripts/add-requested-2026-09-28.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const GPU = 'cmpfziqnv0004x4ymffnp204c';
const RTX5070_GENERIC = 'cmq122okp000mjwymt3193qwb'; // NVIDIA GeForce RTX 5070 12GB

const PARTS = [
  {
    request: '5070 aorus master تكفى حاول توفرها',
    categoryId: GPU, brand: 'Gigabyte', name: 'GeForce RTX 5070 AORUS MASTER 12G',
    tdpWattage: 250, performanceTier: 4,
    specs: {
      vram: '12GB', memoryType: 'GDDR7', memoryBus: '192-bit', interface: 'PCIe 5.0 x16',
      architecture: 'Blackwell', lengthMm: '317', powerConnectors: '1x 16-pin',
      ports: '1x HDMI 2.1b, 3x DP 2.1b',
    },
    offers: [
      { store: 'cazasouq', url: 'https://www.cazasouq.com/gigabyte-aorus-rtx-5070-oc-master-12gb-gddr7-gpu-41405' },
      { store: 'amazon', url: 'https://www.amazon.sa/dp/B0DTGMBHQ3' },
      { store: 'microless', url: 'https://saudi.microless.com/product/gigabyte-aorus-geforce-rtx-5070-master-graphics-card-12gb-gddr7-192-bit-memory-2715-mhz-core-clock-6144-cuda-cores-28-gbps-memory-clock-pci-express-5-0-gv-n5070aorus-m-12gd/' },
    ],
    description: `### Gigabyte AORUS GeForce RTX 5070 MASTER 12G

لمن يريد أداء RTX 5070 مع هدوءٍ أكثر وشكلٍ أفخم، ومستعدٌّ لدفع فرق ذلك. هي نسخة Gigabyte الأعلى من الشريحة نفسها.

**التقنيات الأساسية المدعومة:**

[green]تبريد WINDFORCE بغرفة تبخير:[/green] ثلاث مراوح Hawk ومادّة توصيلٍ حراريّ من فئة الخوادم، فيبقى الكرت هادئاً وبارداً في جلسات اللعب الطويلة.

[green]BIOS مزدوج:[/green] تختار بمفتاحٍ بين وضع الأداء والوضع الهادئ.

[green]تردّد أعلى من المرجعيّ:[/green] 2715 ميجاهرتز مقابل 2512 للنسخة المرجعيّة من NVIDIA.

[green]12 جيجابايت GDDR7 ومعمارية Blackwell:[/green] تدعم DLSS 4 وتوليد الإطارات المتعدّد، وهي مناسبة لدقّة 1440p بأعلى الإعدادات.

[green]بناءٌ متين:[/green] ظهرٌ معدنيٌّ مقوّى، وحاملٌ للكرت في العلبة يمنع انحناءه مع الوقت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الأداء أعلى من النسخ الأساسيّة بفارقٍ بسيط، فالقيمة الحقيقيّة هنا في التبريد والهدوء لا في الفريمات.
* يحتاج مزوّداً بقدرة 750 واط بحسب Gigabyte، بموصّل 16-pin واحد. وفي العلبة محوّلٌ إلى موصّلَي 8-pin لمن لا يملك مزوّداً حديثاً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* يحتاج كيساً واسعاً: طوله 317 مم وسمكه يتجاوز ثلاث فتحات، فلا يدخل أغلب الكيسات الصغيرة.
* الذاكرة 12 جيجابايت كبقيّة نسخ 5070، فلا يعالج ضيقها في ألعاب 4K المستقبليّة.

---
بإمكانك التوجه إلى [NVIDIA GeForce RTX 5070 12GB](/components/${RTX5070_GENERIC}) إذا كان توجهك يتركز على الآتي:
* الأداء نفسه تقريباً بسعرٍ أقلّ، مع نسخٍ أقصر تناسب الكيسات الصغيرة.
https://www.gigabyte.com/Graphics-Card/GV-N5070AORUS-M-12GD/sp`,
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
  const req = await prisma.requestedPart.findFirst({ where: { name: p.request } });
  if (!req) { console.log(`    ⛔ لم أجد الطلب «${p.request}»`); blocked = true; }
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
  await prisma.requestedPart.update({
    where: { id: r.id },
    data: { status: 'ADDED', componentId: c.id, adminSeenAt: r.adminSeenAt ?? new Date() },
  });
  console.log(`✔ الطلب «${request}» → ADDED`);
}

console.log(`\nالتالي:\n  npx tsx scripts/scrape-one.ts ${ids.join(' ')}\n  npx tsx scripts/fetch-images.ts --missing`);
await prisma.$disconnect();
