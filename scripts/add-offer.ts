/**
 * ============ ربط عرض متجر بقطعة موجودة ============
 *
 * القطعة بعرضٍ واحد نصفُ قطعة: الموقع قائم على المقارنة، وعمودٌ واحد لا
 * يُقارَن. هذه الأداة تضيف عرضاً لمتجر إلى قطعة قائمة.
 *
 * وتحرس خطأً واحداً بعينه: **الرابط المستعمل مرّتين**. عرضان يشيران إلى
 * صفحة واحدة يعنيان أن إحدى القطعتين تعرض سعر الأخرى — وهو الخطأ الذي
 * حذفنا بسببه عرض ميكروليس من RX 7900 GRE (كان يشير إلى موديل AIB آخر).
 *
 *   npx tsx scripts/add-offer.ts <componentId> <storeSlug> <url>
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

async function main() {
  const [componentId, slug, url] = process.argv.slice(2);
  if (!componentId || !slug || !url) {
    console.error('استعمال: npx tsx scripts/add-offer.ts <componentId> <storeSlug> <url>');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const comp = await prisma.component.findUnique({
    where: { id: componentId },
    select: { id: true, brand: true, name: true },
  });
  if (!comp) { console.error(`⛔ قطعة غير موجودة: ${componentId}`); process.exit(1); }

  const store = await prisma.store.findFirst({ where: { slug }, select: { id: true, name: true } });
  if (!store) { console.error(`⛔ متجر غير معروف: ${slug}`); process.exit(1); }

  const taken = await prisma.componentOffer.findFirst({
    where: { url },
    select: { component: { select: { brand: true, name: true } } },
  });
  if (taken) {
    console.error(`⛔ الرابط مستعمل في: ${taken.component.brand} ${taken.component.name}`);
    process.exit(1);
  }

  const existing = await prisma.componentOffer.findFirst({
    where: { componentId, storeId: store.id },
    select: { id: true, url: true },
  });
  if (existing) {
    console.error(`⛔ للقطعة عرضٌ في ${store.name} أصلاً:\n   ${existing.url}`);
    process.exit(1);
  }

  await prisma.componentOffer.create({
    data: { componentId, storeId: store.id, url, inStock: true },
  });
  console.log(`✔ ${comp.brand} ${comp.name} ← ${store.name}\n  ${url}`);
  console.log('\nالسعر يبقى غير مقروء حتى: npx tsx scripts/scrape-one.ts ' + componentId);

  await prisma.$disconnect();
}

main();
