/* ============ إكمال روابط المبرّدات + قطعتان ============
 *
 * روابط مايكرولس السعودية، مُطابَقةٌ **برمز الطراز واللون** لا بالاسم
 * القريب — فرمز المنتج في آخر الرابط (r-le240-bkammc) يفصل الأسود عن
 * الأبيض والجيل عن الجيل.
 *
 * ⚠️ وما رُفض عمداً:
 *   • «AG400 WH ARGB **V2**» في مايكرولس ليس «AG400 **G2** ARGB» عندنا —
 *     جيلان مختلفان يتشابه اسمهما.
 *   • LE360 V2 الأسود: مايكرولس يعرض النسخة البيضاء وحدها، فلا رابط له.
 *
 * والقطعتان الجديدتان تنويعُ لونٍ لطرازين مواصفاتُهما محقّقةٌ سلفاً من
 * صفحة المصنّع — فلا رقم جديد يُخترع، واللون وحده يتغيّر.
 *
 *   npx tsx scripts/coolers-offers-and-more.ts --apply
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { judgeSpecs } from '../lib/import-specs';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const M = 'https://saudi.microless.com/product/';
const COOLER = 'cmszm2ym00000swymvd5s2yxm';
const ALL = 'AM5/AM4/LGA1851/LGA1700';

/** [اسم القطعة عندنا, رمز الطراز في الرابط] */
const OFFERS: [string, string][] = [
  ['LE240 V2',            'deepcool-le240-v2-liquid-cpu-cooler-240mm-radiator-2x-120mm-pre-installed-argb-fan-2100-rpm-fan-speed-75-89-cfm-fan-airflow-hydro-bearing-type-anti-leak-technology-black-r-le240-bkammc-g-2/'],
  ['LE240 V2 White',      'deepcool-le240-v2-liquid-cpu-cooler-240mm-radiator-2x-120mm-pre-installed-argb-fan-2100-rpm-fan-speed-75-89-cfm-fan-airflow-hydro-bearing-type-anti-leak-technology-white-r-le240-whammn-g-2/'],
  ['LE360 V2 White',      'deepcool-le360-wh-v2-liquid-cpu-cooler-360mm-radiator-3x-120mm-pre-installed-argb-fan-2100-rpm-fan-speed-75-89-cfm-fan-airflow-hydro-bearing-type-anti-leak-technology-white-r-le360-whammn-g-2/'],
  ['LT240 ARGB',          'deepcool-lt240-argb-liquid-cpu-cooler-240mm-radiator-2x-fd12-argb-fan-2400-rpm-fan-speed-72-04-cfm-airflow-hydro-bearing-type-anti-leak-technology-black-r-lt240-bkamnc-g-1/'],
  ['LT360 ARGB White',    'deepcool-lt360-argb-liquid-cpu-cooler-360mm-radiator-3x-fd12-argb-fan-2400-rpm-fan-speed-72-04-cfm-airflow-hydro-bearing-type-anti-leak-technology-white-r-lt360-whamnc-g-1/'],
  ['Mystique 360 ARGB',   'deepcool-mystique-360-argb-liquid-cpu-cooler-2-83-tft-lcd-display-360mm-radiator-120mm-fan-size-2400-rpm-fan-speed-72-04-cfm-airflow-hydro-bearing-type-black-r-lx750-bkadsnc-g-1/'],
  ['Kraken Core 240 RGB', 'nzxt-kraken-core-240-rgb-liquid-cpu-cooler-240mm-radiator-f240-rgb-core-fan-2400-rpm-fan-speed-75-05-cfm-airflow-fluid-dynamic-bearing-black-rl-kr24c-b1/'],
  ['Kraken Core 360 RGB', 'nzxt-kraken-core-360-rgb-liquid-cpu-cooler-360mm-radiator-f360-rgb-core-fan-2400-rpm-fan-speed-75-05-cfm-airflow-fluid-dynamic-bearing-black-rl-kr36c-b1/'],
];

const NEW = [
  {
    brand: 'DeepCool', name: 'LT240 ARGB White', tier: 3,
    specs: { type: 'AIO', sizeMm: '240', sockets: ALL, fanCount: '2', fanSize: '120mm', rgb: 'Yes', color: 'White' },
    url: M + 'deepcool-lt240-argb-liquid-cpu-cooler-240mm-radiator-2x-fd12-argb-fan-2400-rpm-fan-speed-72-04-cfm-airflow-hydro-bearing-type-anti-leak-technology-white-r-lt240-whamnc-g-1/',
    description: `### DeepCool LT240 ARGB White\n\nالنسخة البيضاء من LT240 ARGB — رادييتر ٢٤٠ مم ومروحتا FD12 ومضخّة الجيل الخامس.\n\n[green]رادييتر 240 مم:[/green] يدخل معظم الأبراج المتوسطة.`,
  },
  {
    brand: 'DeepCool', name: 'LT360 ARGB', tier: 4,
    specs: { type: 'AIO', sizeMm: '360', sockets: ALL, fanCount: '3', fanSize: '120mm', rgb: 'Yes' },
    url: M + 'deepcool-lt360-argb-liquid-cpu-cooler-360mm-radiator-3x-fd12-argb-fan-2400-rpm-fan-speed-72-04-cfm-airflow-hydro-bearing-type-anti-leak-technology-black-r-lt360-bkamnc-g-1/',
    description: `### DeepCool LT360 ARGB\n\nالنسخة السوداء من LT360 ARGB — رادييتر ٣٦٠ مم وثلاث مراوح FD12 ARGB.\n\n[green]رادييتر 360 مم:[/green] لمعالجات الفئة العليا تحت حملٍ طويل.`,
  },
];

const apply = process.argv.includes('--apply');

async function main() {
  const store = await prisma.store.findFirst({ where: { slug: 'microless' }, select: { id: true } });
  if (!store) { console.error('⛔ مايكرولس غير موجود'); process.exit(1); }

  console.log('\n── عروض مايكرولس للقطع القائمة ──');
  let n = 0;
  for (const [name, slug] of OFFERS) {
    const url = M + slug;
    const c = await prisma.component.findFirst({ where: { name, category: { name: 'Cooler' } }, select: { id: true } });
    if (!c) { console.error(`  ⛔ لا مبرّد «${name}»`); process.exit(1); }
    if (await prisma.componentOffer.findFirst({ where: { url } })) { console.log(`  ⏭️  ${name}`); continue; }
    console.log(`  ➕ ${name}`);
    if (apply) { await prisma.componentOffer.create({ data: { componentId: c.id, storeId: store.id, url, inStock: true } }); n++; }
  }

  console.log('\n── قطعتان جديدتان ──');
  const ids: string[] = [];
  for (const p of NEW) {
    const v = judgeSpecs('Cooler', null, p.specs);
    if (v.reject) { console.error(`  ⛔ ${p.name}: ${v.reject}`); process.exit(1); }
    if (await prisma.component.findFirst({ where: { name: p.name } })) { console.log(`  ⏭️  ${p.name}`); continue; }
    if (await prisma.componentOffer.findFirst({ where: { url: p.url } })) { console.log(`  ⏭️  رابط ${p.name} مستعمل`); continue; }
    console.log(`  ➕ ${p.brand} ${p.name}   رادييتر ${p.specs.sizeMm}`);
    if (!apply) continue;
    const c = await prisma.component.create({
      data: { categoryId: COOLER, brand: p.brand, name: p.name, price: 0, tdpWattage: 0, performanceTier: p.tier, specs: p.specs, description: p.description },
    });
    await prisma.componentOffer.create({ data: { componentId: c.id, storeId: store.id, url: p.url, inStock: true } });
    ids.push(c.id);
  }

  console.log(`\n${apply ? `عروض أُضيفت: ${n}   ·   قطع جديدة: ${ids.length}` : 'أضف --apply'}`);
  if (apply && ids.length) console.log(`\nمعرّفات جديدة: ${ids.join(' ')}`);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
