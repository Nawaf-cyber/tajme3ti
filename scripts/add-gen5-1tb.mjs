/**
 * ============ أقراص Gen5 بسعة 1TB ============
 *
 * الكتالوج فيه أربعة أقراص PCIe 5.0 وكلّها **2 تيرابايت** (١٧٩١–١٩٧٥ ﷼)،
 * وصفر بسعة تيرابايت واحد. فمن يريد سرعة الجيل الخامس بميزانية أصغر لا
 * يجد مدخلاً، مع أن نصف السعة تعني نصف السعر تقريباً.
 *
 * ⚠️ ومصيدةٌ أوقفها التحقّق: عنوان المتجر لـ Legend 970 Pro 1TB يقول
 * «14000/11000 MB/s» — وهي أرقام نسخة **4 تيرابايت**. ونسخة التيرابايت
 * الواحد تقرأ 13000 وتكتب **5800** فقط، أي أقلّ من نصف الرقم المنشور.
 * ونقلُ عنوان المتجر كما هو كان سيضع في جدول المواصفات رقماً يقارنه
 * الزائر بأقراصٍ أخرى ويقرّر عليه.
 *
 *   node scripts/add-gen5-1tb.mjs --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const STORAGE = 'cmpfziqr70005x4ym3k7uh079';

const pro2tb = await prisma.component.findFirst({ where: { name: { contains: '9100 PRO 2TB' } }, select: { id: true } });
const p3plus = 'cmpi5h9ho000504l1ee6sj9va';

const PARTS = [
  {
    categoryId: STORAGE, brand: 'Samsung', name: '9100 PRO 1TB Gen5',
    tdpWattage: 0, performanceTier: 5,
    specs: {
      type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 5.0 x4',
      formFactor: 'M.2 2280', readSpeed: '14700 MB/s', writeSpeed: '13300 MB/s',
    },
    url: 'https://www.cazasouq.com/samsung-9100-pro-pcie-5-0-nvme-m-2-1tb-28071',
    description: `### Samsung 9100 PRO 1TB Gen5

أسرع قرص استهلاكي في الكتالوج قراءةً — 14,700 ميجابايت/ث — بنصف سعة نسخة التيرابايتين ونصف سعرها تقريباً.

التقنيات الأساسية المدعومة:

[green]14,700 / 13,300 ميجابايت/ث:[/green] قراءةً وكتابةً متسلسلة، أي نحو ضعف أسرع أقراص الجيل الرابع.

[green]ذاكرة DRAM بسعة 1 جيجابايت:[/green] لا اعتماد على رام النظام — وهو ما يفرّق أقراص الفئة العليا عن الاقتصادية في النسخ الطويل.

[green]600 تيرابايت كتابة وضمان خمس سنوات:[/green] متانة تكفي سنوات من الاستعمال الثقيل.

[green]تشفير AES 256 وTCG/Opal 2.0:[/green] تشفير عتادي كامل للبيانات.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* أقراص الجيل الخامس تُخرج حرارة عالية — يلزمها مشتّت اللوحة الأم أو مشتّت مرفق، وإلا خفضت سرعتها.
* الفرق عن الجيل الرابع لا يُحسّ في الألعاب؛ يظهر في نقل الملفات الضخمة والعمل على الفيديو.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* يحتاج لوحة أمّ بمنفذ M.2 من الجيل الخامس ليعطي سرعته — وفي منفذ الجيل الرابع يعمل بنصفها.

---
بإمكانك التوجه إلى [Crucial P3 Plus 1TB](/components/${p3plus}) إذا كان توجهك يتركز على الآتي:
* السعة نفسها بسعرٍ أقلّ بكثير، مع التنازل عن سرعةٍ لا تظهر في الألعاب.
https://www.samsung.com/au/business/memory-storage/nvme-ssd/9100-pro-1tb-nvme-pcie-gen-5-mz-vap1t0bw`,
  },
  {
    categoryId: STORAGE, brand: 'Adata', name: 'Legend 970 Pro 1TB Gen5',
    tdpWattage: 0, performanceTier: 4,
    specs: {
      type: 'NVMe M.2', capacity: '1TB', interface: 'PCIe 5.0 x4',
      formFactor: 'M.2 2280', readSpeed: '13000 MB/s', writeSpeed: '5800 MB/s',
    },
    url: 'https://www.cazasouq.com/adata-legend-970-pro-gen5-m-2-nvme-1tb-14000-11000-mb-s-22910',
    description: `### Adata Legend 970 Pro 1TB Gen5

مدخل الجيل الخامس الأقلّ سعراً في الكتالوج، بمتحكّم InnoGrit IG5666 وذاكرة Micron ثلاثية الطبقات ومتانة 740 تيرابايت كتابة.

التقنيات الأساسية المدعومة:

[green]13,000 ميجابايت/ث قراءةً:[/green] أسرع من أي قرص جيل رابع في الكتالوج.

[green]740 تيرابايت كتابة:[/green] متانة أعلى من كثير من أقراص الفئة العليا — أعلى حتى من Samsung 9100 PRO بهذه السعة.

[green]ذاكرة DRAM مستقلّة:[/green] لا اعتماد على رام النظام.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **الكتابة 5,800 ميجابايت/ث لا 11,000.** بعض المتاجر تنشر على صفحة نسخة التيرابايت أرقامَ نسخة الأربعة تيرابايت (14,000/11,000) — وهي ليست أرقام هذه السعة. الرقم هنا من مراجعات مستقلّة لهذه السعة تحديداً.
* الفجوة بين القراءة والكتابة كبيرة، فمن يكتب ملفّات ضخمة باستمرار قد لا يجد فرقاً عن الجيل الرابع.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* يحتاج لوحة بمنفذ M.2 جيل خامس، ومشتّتاً حرارياً.

---
بإمكانك التوجه إلى [Samsung 9100 PRO 1TB](/components/SAMSUNG_1TB) إذا كان توجهك يتركز على الآتي:
* كتابةٌ أسرع بأكثر من الضعف — وهو الفارق الحقيقي بين القرصين.
https://www.techpowerup.com/ssd-specs/adata-legend-970-1-tb.d1550`,
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
writeFileSync(`backups/added-gen5-${stamp}.json`, JSON.stringify(PARTS, null, 2));
const ids = {};
for (const p of PARTS) {
  const { url, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  await prisma.componentOffer.create({ data: { componentId: c.id, storeId: caza.id, url, inStock: true } });
  ids[p.name] = c.id;
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}
// الرابط الداخلي المتبادل لا يُعرف قبل الإنشاء
await prisma.component.update({
  where: { id: ids['Legend 970 Pro 1TB Gen5'] },
  data: { description: PARTS[1].description.replace('/components/SAMSUNG_1TB', `/components/${ids['9100 PRO 1TB Gen5']}`) },
});
console.log('✔ رُبط الوصف بالقرص الآخر');
console.log(`\nنسخ للتالي:\n${Object.values(ids).join(' ')}`);
await prisma.$disconnect();
