/**
 * ترحيل المتاجر الثلاثة من أعمدة Component الثابتة إلى Store + ComponentOffer.
 *
 * ⚠️ لا يحذف ولا يعدّل أي عمود قديم — يقرأ منها ويكتب في الجداول الجديدة فقط.
 * قابل لإعادة التشغيل بأمان (upsert)، فلو انقطع في المنتصف أعد تشغيله.
 *
 * التشغيل:  node scripts/migrate-stores.mjs
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/* المتاجر الحالية بإعداداتها المؤكّدة اليوم.
   scrapeMode: 'native' = لها محرّك سحب مكتوب بالكود مربوط بالـslug — لا نفقد
   إصلاحات مثل محدّد كازاسوق المحصور في كتلة المنتج. */
const STORES = [
  {
    slug: 'amazon', name: 'أمازون', latinName: 'Amazon',
    color: '#FF9900', domain: 'amazon.sa', sortOrder: 1,
    affiliateParam: 'tag', affiliateId: 'tajmee3ti-21', usesDeepLinks: false,
    currency: 'SAR', rateToSar: 1, scrapeMode: 'native', premiumProxy: true,
  },
  {
    slug: 'cazasouq', name: 'كازاسوق', latinName: 'CazaSouq',
    color: '#A855F7', domain: 'cazasouq.com', sortOrder: 2,
    // iDevAffiliate: لا يقبل معاملاً على رابط المنتج — يتطلّب رابط تتبّع مولّداً
    affiliateParam: null, affiliateId: '800', usesDeepLinks: true,
    currency: 'SAR', rateToSar: 1, scrapeMode: 'native', premiumProxy: false,
  },
  {
    slug: 'microless', name: 'مايكرولس', latinName: 'Microless',
    color: '#DC2626', domain: 'microless.com', sortOrder: 3,
    // المعامل غير مؤكّد → يبقى فارغاً (رابط بمعامل خاطئ أسوأ من رابط بلا معامل)
    affiliateParam: 'aff_id', affiliateId: '', usesDeepLinks: false,
    currency: 'SAR', rateToSar: 1, scrapeMode: 'native', premiumProxy: true,
  },
];

const storeIds = {};
for (const s of STORES) {
  const row = await prisma.store.upsert({
    where: { slug: s.slug },
    update: {}, // لا نكتب فوق تعديلات الأدمن لو أُعيد التشغيل
    create: s,
  });
  storeIds[s.slug] = row.id;
  console.log(`متجر: ${row.name} (${row.slug})`);
}

const comps = await prisma.component.findMany({
  select: {
    id: true,
    amazonUrl: true, amazonPrice: true, amazonListPrice: true, amazonInStock: true,
    cazasouqUrl: true, cazasouqPrice: true, cazasouqListPrice: true, cazasouqInStock: true,
    cazasouqAffiliateUrl: true,
    microlessUrl: true, microlessPrice: true, microlessListPrice: true, microlessInStock: true,
  },
});

let created = 0;
for (const c of comps) {
  const offers = [
    { slug: 'amazon', url: c.amazonUrl, price: c.amazonPrice, listPrice: c.amazonListPrice, inStock: c.amazonInStock, affiliateUrl: null },
    { slug: 'cazasouq', url: c.cazasouqUrl, price: c.cazasouqPrice, listPrice: c.cazasouqListPrice, inStock: c.cazasouqInStock, affiliateUrl: c.cazasouqAffiliateUrl },
    { slug: 'microless', url: c.microlessUrl, price: c.microlessPrice, listPrice: c.microlessListPrice, inStock: c.microlessInStock, affiliateUrl: null },
  ];

  for (const o of offers) {
    /* عرض بلا رابط وبلا سعر = المتجر غير مرتبط بهذه القطعة أصلاً؛ لا ننشئ صفّاً
       فارغاً لكل قطعة × كل متجر. */
    if (!o.url && o.price == null) continue;

    const data = {
      url: o.url ?? null,
      affiliateUrl: o.affiliateUrl ?? null,
      price: o.price ?? null,
      listPrice: o.listPrice ?? null,
      inStock: o.inStock ?? true,
    };
    await prisma.componentOffer.upsert({
      where: { componentId_storeId: { componentId: c.id, storeId: storeIds[o.slug] } },
      update: data,
      create: { componentId: c.id, storeId: storeIds[o.slug], ...data },
    });
    created++;
  }
}

console.log(`\n✅ ${comps.length} قطعة → ${created} عرض متجر.`);
await prisma.$disconnect();
