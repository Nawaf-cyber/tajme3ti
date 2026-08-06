/**
 * تحقّق صفّاً بصف: هل جدول ComponentOffer يطابق الأعمدة القديمة تماماً؟
 * لا نبدّل أي صفحة للقراءة من الجديد قبل أن يخرج هذا السكربت بصفر فروق.
 *
 * التشغيل:  node scripts/verify-stores.mjs
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const comps = await prisma.component.findMany({
  select: {
    id: true, name: true,
    amazonUrl: true, amazonPrice: true, amazonListPrice: true, amazonInStock: true,
    cazasouqUrl: true, cazasouqPrice: true, cazasouqListPrice: true, cazasouqInStock: true,
    cazasouqAffiliateUrl: true,
    microlessUrl: true, microlessPrice: true, microlessListPrice: true, microlessInStock: true,
    offers: { include: { store: { select: { slug: true } } } },
  },
});

const diffs = [];
let checked = 0, offersSeen = 0;

const eq = (a, b) => (a ?? null) === (b ?? null);

for (const c of comps) {
  const byStore = Object.fromEntries(c.offers.map((o) => [o.store.slug, o]));
  offersSeen += c.offers.length;

  const expect = [
    { slug: 'amazon', url: c.amazonUrl, price: c.amazonPrice, listPrice: c.amazonListPrice, inStock: c.amazonInStock, affiliateUrl: null },
    { slug: 'cazasouq', url: c.cazasouqUrl, price: c.cazasouqPrice, listPrice: c.cazasouqListPrice, inStock: c.cazasouqInStock, affiliateUrl: c.cazasouqAffiliateUrl },
    { slug: 'microless', url: c.microlessUrl, price: c.microlessPrice, listPrice: c.microlessListPrice, inStock: c.microlessInStock, affiliateUrl: null },
  ];

  for (const e of expect) {
    const hasData = Boolean(e.url) || e.price != null;
    const got = byStore[e.slug];

    if (!hasData) {
      // لا بيانات قديمة → يجب ألا يوجد عرض (أو عرض فارغ لو أضافه الأدمن لاحقاً)
      if (got && (got.url || got.price != null)) {
        diffs.push(`${c.name} [${e.slug}]: عرض موجود بلا مصدر قديم`);
      }
      continue;
    }
    checked++;
    if (!got) { diffs.push(`${c.name} [${e.slug}]: عرض مفقود`); continue; }
    if (!eq(got.url, e.url)) diffs.push(`${c.name} [${e.slug}] url: ${got.url} ≠ ${e.url}`);
    if (!eq(got.price, e.price)) diffs.push(`${c.name} [${e.slug}] price: ${got.price} ≠ ${e.price}`);
    if (!eq(got.listPrice, e.listPrice)) diffs.push(`${c.name} [${e.slug}] listPrice: ${got.listPrice} ≠ ${e.listPrice}`);
    if (!eq(got.inStock, e.inStock ?? true)) diffs.push(`${c.name} [${e.slug}] inStock: ${got.inStock} ≠ ${e.inStock}`);
    if (!eq(got.affiliateUrl, e.affiliateUrl)) diffs.push(`${c.name} [${e.slug}] affiliateUrl مختلف`);
  }
}

console.log(`قطع: ${comps.length} · عروض في القاعدة: ${offersSeen} · قيم مفحوصة: ${checked}`);
if (diffs.length === 0) {
  console.log('✅ تطابق تام — لا فرق واحد بين الجديد والقديم.');
} else {
  console.log(`❌ ${diffs.length} فرق:`);
  diffs.slice(0, 30).forEach((d) => console.log('   ' + d));
}

await prisma.$disconnect();
process.exit(diffs.length ? 1 : 0);
