/* ============ عروض أمازون ونون للمبرّدات ============
 *
 * البند كان معلّقاً لأن البحث بالاسم يعطي **أشباهاً لا أطرافاً**:
 * `AG400 BK ARGB` ليس `AG400 G2 ARGB`، و`GAMMAXX L360` ليس `LE360`.
 * فالمطابقة هنا برمز الطراز الذي يظهر في عنوان المنتج أو في مسار رابطه،
 * لا باسمه المترجَم.
 *
 * ما وُجد بعد فحص كل مبرّد على المتجرين:
 *
 *   أمازون — يحمل NZXT وXigmatek ولا يحمل مبرّدات DeepCool إطلاقاً
 *   (أربع عمليات بحث مختلفة أعادت Thermalright وCooler Master وGamdias).
 *
 *   نون — يحمل DeepCool، ومنه أُخذت السبعة.
 *
 * ⚠️ وما رُفض عمداً:
 *   • AG400 G2 ARGB (والأبيض) — نون يحمل `R-AG400-BKAMMN-GJD`، وهو
 *     AG400 BK ARGB V2 لا G2. طرازان مختلفان، ووضعُ أحدهما مكان الآخر
 *     هو الخطأ نفسه الذي أوقف البند من البداية.
 *   • LT240/LT360 ARGB الأسودان وMystique 360 — لا وجود لهما على أيٍّ
 *     من المتجرين. الأبيضان موجودان وأُضيفا.
 *
 *   npx tsx scripts/add-cooler-offers-amazon-noon.ts          (عرض فقط)
 *   npx tsx scripts/add-cooler-offers-amazon-noon.ts --apply  (تنفيذ)
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const APPLY = process.argv.includes('--apply');
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

type Row = { part: string; store: 'amazon' | 'noon'; price: number; url: string; code: string };

const ROWS: Row[] = [
  /* ---- أمازون ---- */
  {
    part: 'Kraken Core 240 RGB', store: 'amazon', price: 291.74,
    code: 'كور 240 RGB · مروحة إطار واحد 240 ملم',
    url: 'https://www.amazon.sa/dp/B0FLTCSL45',
  },
  {
    part: 'Kraken Core 360 RGB', store: 'amazon', price: 438.88,
    code: 'كراكين كور 360 RGB · إطار واحد 360 ملم',
    url: 'https://www.amazon.sa/dp/B0FLTZ2SHM',
  },
  {
    /* مايكرولس يسمّيه `…-white-en47925` وأمازون `(EN47925)` — الطراز نفسه */
    part: 'Air-Killer Pro Arctic White', store: 'amazon', price: 125,
    code: 'EN47925',
    url: 'https://www.amazon.sa/dp/B0BFFVV46B',
  },

  /* ---- نون ---- */
  {
    part: 'AG300', store: 'noon', price: 89, code: 'R-AG300-BKNNMN-G',
    url: 'https://www.noon.com/saudi-ar/ag300-single-tower-92mm-cpu-cooler-500-3050-rpm-fan-speed-36-75-cfm-airflow-1-56w-power-30-5-dbafan-noise-hydro-bearing-4-pin-pwm-fan-connector-black-r-ag300-bknnmn-g/ZC1F9011B31131AE7C3F9Z/p/',
  },
  {
    part: 'LE240 V2', store: 'noon', price: 279, code: 'R-LE240-BKAMMC-G',
    url: 'https://www.noon.com/saudi-ar/le240-v2-liquid-cpu-cooler-240mm-aluminum-radiator-120mm-hydro-bearing-fans-addressable-rgb-led-410mm-tubing-2500-3400-rpm-pump-speed-4-pin-pwm-connector-anti-leak-technology-compatible-with-intel-lga-1700-1200-1151-amd-am5-am4-black-r-le240-bkammc-g/Z04E953D85E6303F3876CZ/p/',
  },
  {
    part: 'LE240 V2 White', store: 'noon', price: 323, code: 'R-LE240-WHAMMN-G-2',
    url: 'https://www.noon.com/saudi-ar/le240-wh-v2-240mm-liquid-cpu-cooler-dual-120mm-argb-fans-hydro-bearing-pump-anti-leak-technology-intel-amd-compatible-high-performance-rgb-aio-cooling-for-gaming-overclocking-white-r-le240-whammn-g-2/Z260B97190181E447F5AAZ/p/',
  },
  {
    part: 'LE360 V2', store: 'noon', price: 346, code: 'R-LE360-BKAMMC-G-2',
    url: 'https://www.noon.com/saudi-ar/le360-v2-360mm-argb-liquid-cpu-cooler-triple-120mm-argb-fans-aluminum-radiator-hydro-bearing-75-89-cfm-31-6db-anti-leak-tech-2500-3400-rpm-pwm-pump-intel-lga-1851-1700-1200-115x-amd-am5-am4-compatible-black-r-le360-bkammc-g-2/ZDC010446BAAFCAE7AD38Z/p/',
  },
  {
    part: 'LE360 V2 White', store: 'noon', price: 390, code: 'LE360-WHAMMN-G-2',
    url: 'https://www.noon.com/saudi-ar/le360-wh-v2-360mm-argb-aio-liquid-cpu-cooler-triple-120mm-pwm-fans-3400rpm-pump-anti-leak-technology-aluminum-radiator-intel-amd-compatible-white-le360-whammn-g-2/Z56A24D9383E66F75D53AZ/p/',
  },
  {
    part: 'LT240 ARGB White', store: 'noon', price: 502, code: 'R-LT240-WHAMNC-G-1',
    url: 'https://www.noon.com/saudi-ar/lt240-argb-liquid-cpu-cooler-240mm-radiator-2-fd12-fans-600-2400-rpm-fan-speed-72-04-cfm-airflow-3400-rpm-10-pump-speed-argb-led-lights-hydro-bearing-r-lt240-whamnc-g-1/Z0267A4BC05226B407B5EZ/p/',
  },
  {
    part: 'LT360 ARGB White', store: 'noon', price: 580, code: 'R-LT360-WHAMNC-G-1',
    url: 'https://www.noon.com/saudi-ar/lt360-argb-wh-360mm-aio-liquid-cpu-cooler-infinity-mirror-pump-3-120mm-argb-pwm-fans-anti-leak-tech-intel-lga1851-1700-amd-am5-am4-compatible-600-2400rpm-72-04cfm-38-71dba-white-r-lt360-whamnc-g-1/Z8A385B43A95C9D94B081Z/p/',
  },
];

async function main() {
  console.log(APPLY ? `\n${Y}وضع التنفيذ${X}` : `\n${D}عرض فقط — أضف --apply للتنفيذ${X}`);

  const stores = await prisma.store.findMany({ select: { id: true, slug: true, name: true } });
  const bySlug = new Map(stores.map((s) => [s.slug, s]));

  let added = 0, skipped = 0, missing = 0;

  for (const r of ROWS) {
    /* ⚠️ مطابقةٌ حرفية لا `contains`: «LE360 V2» تحتويها «LE360 V2 White»،
       فكان السطران يقعان على القطعة البيضاء نفسها — كشفه العرضُ التجريبي. */
    const comp = await prisma.component.findFirst({
      where: { category: { name: 'Cooler' }, name: r.part },
      select: { id: true, name: true, price: true, offers: { select: { id: true, storeId: true, price: true } } },
    });
    if (!comp) { missing++; console.log(`  ${R}✘${X} لا قطعة باسم «${r.part}»`); continue; }

    const store = bySlug.get(r.store);
    if (!store) { missing++; console.log(`  ${R}✘${X} لا متجر «${r.store}»`); continue; }

    if (comp.offers.some((o) => o.storeId === store.id)) {
      skipped++;
      console.log(`  ${D}—${X} «${comp.name}» عنده عرض ${store.name} أصلاً`);
      continue;
    }

    const cheaper = r.price < comp.price;
    console.log(
      `  ${G}+${X} ${comp.name}  ${D}·${X} ${store.name} ${r.price} ﷼  ` +
      `${cheaper ? `${G}(أرخص من ${comp.price})${X}` : `${D}(الحالي ${comp.price})${X}`}`,
    );
    console.log(`      ${D}الطراز المطابَق: ${r.code}${X}`);

    if (APPLY) {
      await prisma.componentOffer.create({
        data: {
          componentId: comp.id,
          storeId: store.id,
          url: r.url,
          price: r.price,
          inStock: true,
          lastCheckedAt: new Date(),
        },
      });
      /* السعر المعروض = أرخص عرضٍ متوفّر، فيُحدَّث إن نزل */
      if (cheaper) {
        await prisma.component.update({ where: { id: comp.id }, data: { price: r.price } });
        console.log(`      ${G}↓ السعر المخزّن ${comp.price} → ${r.price}${X}`);
      }
      added++;
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(APPLY ? `أُضيف ${added} · تُخطّي ${skipped} · تعذّر ${missing}` : `جاهز للإضافة: ${ROWS.length - skipped - missing}`);

  const coolers = await prisma.component.findMany({
    where: { category: { name: 'Cooler' } },
    select: { name: true, offers: { select: { store: { select: { name: true } } } } },
    orderBy: { name: 'asc' },
  });
  const counts = coolers.map((c) => c.offers.length);
  console.log(`\nالمبرّدات: ${coolers.length} · متوسّط المتاجر لكل مبرّد: ${(counts.reduce((a, b) => a + b, 0) / coolers.length).toFixed(1)}`);
  console.log(`بمتجرٍ واحد: ${counts.filter((n) => n === 1).length} · باثنين: ${counts.filter((n) => n === 2).length} · بثلاثة+: ${counts.filter((n) => n >= 3).length}`);

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
