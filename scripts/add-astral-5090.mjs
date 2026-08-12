/**
 * ============ ROG Astral RTX 5090 — نسختان ============
 *
 * طلبٌ من زائر (MR_EGG). والكتالوج فيه «GeForce RTX 5090 32GB» عامّة
 * بطول ٣٤٨ مم — فلماذا مدخلتان جديدتان؟
 *
 * لأن الأسترال ليس لوناً آخر للكرت نفسه، بل مقاسان مختلفان يقرّران التوافق:
 *
 *   الهوائية:  357.6 مم · 3.8 فتحة  → أطول من المدخلة العامة بعشرة مم،
 *              فتجميعةٌ تمرّ على ٣٤٨ قد لا يدخل فيها هذا الكرت فعلاً.
 *   المائية:   288.5 مم · 2.5 فتحة  → **أقصر بستّين مم** من المدخلة العامة،
 *              فتدخل كيسات ترفض الكرت العادي — لكنها تحتاج مكان رادييتر
 *              400×120 مم لا يفحصه المحرّك.
 *
 * وكلتاهما أرخص من المدخلة العامة (١٧٥٠٠ ﷼) في كازاسوق.
 *
 * المقاسات من صفحتَي المواصفات في rog.asus.com.
 *
 *   node scripts/add-astral-5090.mjs --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const GPU = 'cmpfziqnv0004x4ymffnp204c';
const GENERIC_5090 = 'cmq122o2y000kjwymptwf4bds';

const PARTS = [
  {
    categoryId: GPU, brand: 'ASUS', name: 'ROG Astral RTX 5090 OC 32GB',
    tdpWattage: 600, performanceTier: 5,
    specs: {
      vram: '32GB', memoryType: 'GDDR7', memoryBus: '512-bit', lengthMm: '358',
      powerConnectors: '1x 16-pin', interface: 'PCIe 5.0',
      ports: '2x HDMI 2.1b, 3x DP 2.1b', architecture: 'Blackwell', formFactor: '3.8 Slot',
    },
    url: 'https://www.cazasouq.com/asus-rog-astral-geforce-rtx-5090-32gb-gddr7-oc-edition-gpu-27043',
    description: `### ASUS ROG Astral RTX 5090 OC 32GB

أضخم نسخة من RTX 5090: أربع مراوح على 3.8 فتحة توسعة، وطولٌ يبلغ **357.6 مم** — وهو رقمٌ يقرّر إن كان الكرت يدخل كيسك قبل أي حديث عن الأداء.

التقنيات الأساسية المدعومة:

[green]أربع مراوح وغرفة بخارية:[/green] المروحة الرابعة على ظهر الكرت تدفع الهواء عبر المشتّت — تصميمٌ لا تجده في نسخ الفئة الأدنى، ويخفض الحرارة والضجيج معاً.

[green]تردّد مصنعي أعلى:[/green] 2610 ميجاهرتز في وضع OC مقابل 2580 في الافتراضي.

[green]32 جيجابايت GDDR7 على ناقل 512-bit:[/green] بسرعة 28 جيجابت/ث — أعلى ما في السوق.

[green]منافذ 2.1b كاملة:[/green] منفذا HDMI وثلاثة DisplayPort من الجيل الأحدث.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **3.8 فتحة توسعة** — يحجب ثلاث فتحات ونصفاً على اللوحة الأم، فلا مكان لبطاقة صوت أو شبكة تحته في أغلب اللوحات.
* ⚠️ **357.6 مم** — أطول من كثير من كيسات Mid Tower. فحص التوافق هنا يستعمل هذا الرقم، لكن قِس كيسك بنفسك قبل الشراء.
* تنصح ASUS بمزوّد **1000 واط**؛ فحص الطاقة في الموقع يحسب الاستهلاك لا توصية المصنّع.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* وزنه يستدعي حاملاً للكرت في الكيسات الطويلة.
* نسخة **BTF** المذكورة أحياناً تحتاج لوحةً أمّاً من طراز BTF بموصّلات خلفية — لا تعمل مع اللوحات العادية، وهي منتج آخر لا هذا.

---
بإمكانك التوجه إلى [GeForce RTX 5090 32GB](/components/${GENERIC_5090}) إذا كان توجهك يتركز على الآتي:
* مقارنة أسعار الطراز عبر كل المتاجر بلا التقيّد بنسخة مصنّعٍ بعينه.
https://rog.asus.com/graphics-cards/graphics-cards/rog-astral/rog-astral-rtx5090-o32g-gaming/spec/`,
  },
  {
    categoryId: GPU, brand: 'ASUS', name: 'ROG Astral LC RTX 5090 OC 32GB',
    tdpWattage: 600, performanceTier: 5,
    specs: {
      vram: '32GB', memoryType: 'GDDR7', memoryBus: '512-bit', lengthMm: '289',
      powerConnectors: '1x 16-pin', interface: 'PCIe 5.0',
      ports: '2x HDMI 2.1b, 3x DP 2.1b', architecture: 'Blackwell', formFactor: '2.5 Slot',
      radiatorSupport: '360mm AIO مرفق',
    },
    url: 'https://www.cazasouq.com/asus-rog-astral-geforce-lc-rtx-5090-32gb-gddr7-oc-edition-gpu-28427',
    description: `### ASUS ROG Astral LC RTX 5090 OC 32GB

نفس الشريحة بتبريد مائي مغلق مرفق — فينكمش الكرت إلى **288.5 مم و2.5 فتحة** بدل 357.6 مم و3.8 فتحة في النسخة الهوائية. أي أنه يدخل كيسات ترفض أخاه الأكبر.

التقنيات الأساسية المدعومة:

[green]أقصر بسبعين مم من النسخة الهوائية:[/green] وأنحف بفتحة ونصف — فيترك مكاناً على اللوحة ويدخل هياكل أضيق.

[green]رادييتر 360×120 بسماكة 38 مم:[/green] ثلاث مراوح عالية الأداء ولوح نحاسي كامل التغطية على الشريحة.

[green]32 جيجابايت GDDR7 على 512-bit:[/green] نفس ذاكرة النسخة الهوائية بلا تنازل.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **يحتاج مكان رادييتر 400×120×65 مم في كيسك** — ومحرّك التوافق هنا يقارن طول الكرت بمساحة الكيس ولا يفحص مكان الرادييتر إطلاقاً. فتجميعةٌ تمرّ عنده قد لا تُركَّب. تأكّد أن كيسك يقبل رادييتر 360 مم قبل الشراء.
* تردّده المصنعي 2467 ميجاهرتز — أقلّ من النسخة الهوائية (2610) رغم التبريد الأفضل.
* تنصح ASUS بمزوّد 1000 واط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* أنبوبا التبريد يقيّدان توجيه الكرت ومكان تركيبه.
* لا يصلح للكيسات التي شُغل مكان الرادييتر فيها بمبرّد المعالج المائي.

---
بإمكانك التوجه إلى [GeForce RTX 5090 32GB](/components/${GENERIC_5090}) إذا كان توجهك يتركز على الآتي:
* مقارنة أسعار الطراز عبر كل المتاجر بلا التقيّد بنسخة مصنّعٍ بعينه.
https://rog.asus.com/graphics-cards/graphics-cards/rog-astral/rog-astral-lc-rtx5090-o32g-gaming/spec/`,
  },
];

// ---------------------------------------------------------------- التنفيذ
const caza = await prisma.store.findFirst({ where: { slug: 'cazasouq' }, select: { id: true } });
let blocked = false;
for (const p of PARTS) {
  const dup = await prisma.component.findFirst({ where: { name: p.name, brand: p.brand } });
  const taken = await prisma.componentOffer.findFirst({ where: { url: p.url }, select: { component: { select: { name: true } } } });
  console.log(`\n=== ${p.brand} ${p.name}`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  if (dup) { console.log(`    ⛔ موجودة: ${dup.id}`); blocked = true; }
  if (taken) { console.log(`    ⛔ الرابط مستعمل في: ${taken.component.name}`); blocked = true; }
}
if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/added-astral-${stamp}.json`, JSON.stringify(PARTS, null, 2));
const ids = [];
for (const p of PARTS) {
  const { url, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  await prisma.componentOffer.create({ data: { componentId: c.id, storeId: caza.id, url, inStock: true } });
  ids.push(c.id);
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}
console.log(`\nنسخ للتالي:\n${ids.join(' ')}`);
await prisma.$disconnect();
