/* ============ المبرّدات — دفعة Gamdias ============
 *
 * البند كان «Gamdias وسلاسل DeepCool الأخرى (LM/LD/Mystique 240)».
 * وبعد فحص المتجرين:
 *
 *   • Gamdias Aura GL240 V2 وGL360 V2 — موجودان على أمازون بسعرٍ ومخزونٍ
 *     ومواصفاتٍ منشورة، فأُضيفا.
 *   • LD240 وLM720 وLS520 وMystique 240 — **لا وجود لها** على نون ولا
 *     أمازون. بحثٌ مستقلٌّ لكلٍّ منها أعاد أثاثاً وقطع غيار جرّارات.
 *     سلبٌ محقَّق لا نقصُ محاولة.
 *   • AK400/AK620 موجودان على نون بـ٢٩٨ و٥٣٣ ﷼ — أضعافُ سعرهما المعتاد،
 *     وإضافتهما تستورد مشكلة «الإعلان المغالي» بدل أن تحلّها. تُركا عمداً.
 *
 * ⚠️ المقابس تُكتب كما نشرها المصنّع على صفحة المنتج لا كما يُظنّ:
 *   GL240 V2 → نصُّ الصفحة يذكر LGA1700 وAM5/AM4 (وLGA2066 وAM3 وFM2
 *              التي لا معالجَ لنا عليها) — ولا يذكر LGA1851. فلا يُكتب.
 *   GL360 V2 → عنوانه يذكر LGA 1851/1700 وAM5/AM4 صراحةً.
 * والفرق بينهما مقصود: كتابةُ LGA1851 على الأوّل تخترع توافقاً، وحذفُها
 * من الثاني تخترع منعاً.
 *
 * و`tdpRating` غير منشور عند Gamdias كما هو غير منشور عند DeepCool —
 * يُترك فارغاً ويظهر «غير معلن»، ولا يُقدَّر.
 *
 *   npx tsx scripts/add-coolers-gamdias.ts          (عرض فقط)
 *   npx tsx scripts/add-coolers-gamdias.ts --apply  (كتابة)
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { judgeSpecs } from '../lib/import-specs';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const APPLY = process.argv.includes('--apply');
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

type Part = {
  brand: string; name: string; tier: number; price: number;
  specs: Record<string, string>;
  url: string; image: string; description: string;
};

const PARTS: Part[] = [
  {
    brand: 'Gamdias', name: 'Aura GL240 V2', tier: 3, price: 225,
    specs: { type: 'AIO', sizeMm: '240', sockets: 'AM5/AM4/LGA1700', fanCount: '2', fanSize: '120mm', rgb: 'Yes' },
    url: 'https://www.amazon.sa/dp/B0CQJ7CRDQ',
    image: 'https://m.media-amazon.com/images/I/61EQXUK1TyL._AC_SL1500_.jpg',
    description: `### Gamdias Aura GL240 V2

مبرّد سائل مغلق برادييتر ٢٤٠ مم ومروحتين ١٢٠ مم بإضاءة ARGB.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 240 مم:[/green] يدخل أي كيسٍ يعلن دعم 240mm — وهي أوسع فئة في الأبراج المتوسطة.

[green]مضخّة قابلة للتدوير:[/green] غطاؤها يدور، فيبقى الشعار معتدلاً مهما كان اتجاه التركيب.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المقابس: AM5 و AM4 و LGA1700 — **ولا يذكر المصنّع LGA1851**، فلا يُرشَّح لمعالجات Arrow Lake.
* قدرة التبديد غير معلنة من المصنّع.`,
  },
  {
    brand: 'Gamdias', name: 'Aura GL360 V2', tier: 4, price: 249,
    specs: { type: 'AIO', sizeMm: '360', sockets: 'AM5/AM4/LGA1851/LGA1700', fanCount: '3', fanSize: '120mm', rgb: 'Yes' },
    url: 'https://www.amazon.sa/dp/B0CQJ6KRDH',
    image: 'https://m.media-amazon.com/images/I/71IEJiMrRnL._AC_SL1500_.jpg',
    description: `### Gamdias Aura GL360 V2

مبرّد سائل مغلق برادييتر ٣٦٠ مم وثلاث مراوح PWM بإضاءة ARGB.

**التقنيات الأساسية المدعومة:**

[green]رادييتر 360 مم:[/green] أكبر مساحة تبديد في الفئة السائلة الشائعة، لمعالجات ١٢٥ واط فأعلى.

[green]توافق كامل مع الكتالوج:[/green] AM5 و AM4 و LGA1851 و LGA1700 — أي معالجٍ عندنا.

[green]تمرير كيبل مخفي:[/green] يقلّل الفوضى خلف اللوحة الأم.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* يحتاج كيساً يعلن دعم رادييتر 360mm — وكثيرٌ من الأبراج المتوسطة يقف عند 240mm.
* قدرة التبديد غير معلنة من المصنّع.`,
  },
];

async function main() {
  console.log(APPLY ? `\n${Y}وضع الكتابة${X}` : `\n${D}عرض فقط — أضف --apply للكتابة${X}`);

  const cat = await prisma.category.findFirst({ where: { name: 'Cooler' }, select: { id: true } });
  if (!cat) { console.error('⛔ فئة المبرّدات غير موجودة'); process.exit(1); }
  const store = await prisma.store.findFirst({ where: { slug: 'amazon' }, select: { id: true } });
  if (!store) { console.error('⛔ متجر أمازون غير موجود'); process.exit(1); }

  /* البوّابة نفسها التي يمرّ بها الاستيراد */
  console.log('\n── فحص المخطّط ──');
  let bad = 0;
  for (const p of PARTS) {
    const v = judgeSpecs('Cooler', null, p.specs);
    if (v.reject) { console.error(`  ${R}⛔ ${p.name}: ${v.reject}${X}`); bad++; }
    else console.log(`  ${G}✔${X} ${p.name}${v.gaps.length ? `   ${D}(ينقصها: ${v.gaps.join('، ')})${X}` : ''}`);
  }
  if (bad) { console.error('\nلم يُكتب شيء.'); process.exit(1); }

  /* رابطٌ مستعمل = قطعةٌ مكرّرة أو رابطٌ خاطئ */
  const taken = await prisma.componentOffer.findMany({
    where: { url: { in: PARTS.map((p) => p.url) } },
    select: { url: true, component: { select: { name: true } } },
  });
  if (taken.length) {
    console.error('\n⛔ روابط مستعملة:');
    taken.forEach((t) => console.error(`   ${t.component.name} ← ${t.url}`));
    process.exit(1);
  }

  const existing = await prisma.component.findMany({
    where: { name: { in: PARTS.map((p) => p.name) } }, select: { name: true },
  });
  if (existing.length) {
    console.error('\n⛔ أسماء موجودة سلفاً: ' + existing.map((e) => e.name).join('، '));
    process.exit(1);
  }

  console.log('');
  for (const p of PARTS) {
    console.log(`  💧 ${(p.brand + ' ' + p.name).padEnd(26)} رادييتر ${p.specs.sizeMm}  ${String(p.price).padStart(6)} ﷼  فئة ${p.tier}`);
    console.log(`      ${D}${p.specs.sockets}${X}`);
    if (!APPLY) continue;

    const c = await prisma.component.create({
      data: {
        categoryId: cat.id, brand: p.brand, name: p.name,
        price: p.price, tdpWattage: 0, performanceTier: p.tier,
        specs: p.specs, description: p.description, imageUrl: p.image,
      },
    });
    await prisma.componentOffer.create({
      data: { componentId: c.id, storeId: store.id, url: p.url, price: p.price, inStock: true, lastCheckedAt: new Date() },
    });
  }

  const n = await prisma.component.count({ where: { categoryId: cat.id } });
  console.log(`\n${'─'.repeat(50)}\n${APPLY ? `المبرّدات الآن: ${n}` : 'أضف --apply للكتابة.'}`);

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
