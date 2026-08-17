/**
 * ============ إغلاق طلبات القطع بعد إضافتها ============
 *
 * الطلب لا ينتهي بإضافة القطعة: صاحبه يرى حالته في الموقع، وطلبٌ يبقى
 * «قيد المراجعة» بعد أن أُضيفت قطعته يقول له إننا لم نقرأه.
 *
 * وقد وُجد طلبان عالقان في ADDING منذ أسبوعين — أحدهما «32GB DDR5 6000MHz
 * CL30 RGB White» وقطعتاه في الكتالوج فعلاً. فالربط اليدوي يُنسى، وهذه
 * الأداة تجعله خطوةً مذكورة في السلسلة.
 *
 *   npx tsx scripts/resolve-requests.ts            # عرض
 *   npx tsx scripts/resolve-requests.ts --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

/** طلب → القطعة التي تُغلقه */
const LINKS: { request: string; componentId: string }[] = [
  { request: 'rtx5070ti', componentId: 'cmsxdahr80000skymkwso4pd0' },        // PNY 5070 Ti OC Triple Fan Plus
  { request: '5060 ti gigabyte', componentId: 'cmsxdahz50002skymm2277w38' }, // Gigabyte 5060 Ti WINDFORCE 16G
  { request: 'msi pro b650m', componentId: 'cmsxdai5k0004skym012fa6l9' },    // MSI PRO B650M-A WiFi
  { request: 'b850', componentId: 'cmsxdaibx0006skymhs0llh1k' },             // MSI B850 GAMING PLUS WiFi
  { request: 'b850 gaming', componentId: 'cmsxdaisj0009skymlwo2pbe0' },      // MSI B850M GAMING PLUS WiFi
  /* عالقٌ من 2026-08-06 — أُضيفت قطعتاه يوم 2026-08-11 ولم يُوسم */
  { request: '32gb ddr5 6000mhz cl30 rgb white', componentId: null as any },
];

async function main() {
  const apply = process.argv.includes('--apply');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  /* الرام الأبيض طُلب بالوصف لا بالموديل، فيُربط بأرخص قطعة تطابقه */
  const white = await prisma.component.findFirst({
    where: { name: { contains: '6000MHz CL30 White' } },
    orderBy: { price: 'asc' },
    select: { id: true, brand: true, name: true },
  });
  for (const l of LINKS) if (!l.componentId && white) l.componentId = white.id;

  for (const { request, componentId } of LINKS) {
    const req = await prisma.requestedPart.findFirst({ where: { normalized: request } });
    if (!req) { console.log(`✖ لا طلب باسم «${request}»`); continue; }
    if (!componentId) { console.log(`✖ «${req.name}» بلا قطعة مطابقة`); continue; }

    const comp = await prisma.component.findUnique({
      where: { id: componentId },
      select: { brand: true, name: true, price: true },
    });
    if (!comp) { console.log(`✖ قطعة مجهولة: ${componentId}`); continue; }

    console.log(`${req.status.padEnd(9)} → ADDED   «${req.name}»`);
    console.log(`            ↳ ${comp.brand} ${comp.name} — ${comp.price}﷼`);

    if (apply) {
      await prisma.requestedPart.update({
        where: { id: req.id },
        data: { status: 'ADDED', componentId },
      });
    }
  }

  if (!apply) console.log('\n(عرضٌ فقط — أضف --apply)');
  await prisma.$disconnect();
}

main();
