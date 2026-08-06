/**
 * حارس التكافؤ: هل يولّد البناء العام (buildStoreUrl) نفس روابط العمولة
 * التي يولّدها القديم (buildAffiliateUrl) على **كل** رابط حقيقي في القاعدة؟
 *
 * صحّة روابط العمولة كلّفت جلسات فحص طويلة؛ أي انحراف صامت هنا = عمولة
 * ضائعة بلا أي عرض خاطئ يكشفه. لا نبدّل أي صفحة قبل صفر اختلافات.
 *
 * التشغيل:  npx tsx scripts/verify-affiliate-urls.mjs
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { buildAffiliateUrl, buildStoreUrl } from '../lib/affiliate';

dotenv.config();
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
const stores = await prisma.store.findMany();
const byslug = Object.fromEntries(stores.map((s) => [s.slug, s]));

// نفس المعرّفات التي يمرّرها الموقع اليوم للنسخة القديمة
const ids = {
  amazon_affiliate: byslug.amazon.affiliateId,
  cazasouq_affiliate: byslug.cazasouq.affiliateId,
  microless_affiliate: byslug.microless.affiliateId,
};

const comps = await prisma.component.findMany({
  select: {
    name: true,
    amazonUrl: true, cazasouqUrl: true, cazasouqAffiliateUrl: true, microlessUrl: true,
  },
});

let checked = 0;
const diffs = [];

for (const c of comps) {
  const cases = [
    { slug: 'amazon', url: c.amazonUrl, deep: null },
    { slug: 'cazasouq', url: c.cazasouqUrl, deep: c.cazasouqAffiliateUrl },
    { slug: 'microless', url: c.microlessUrl, deep: null },
  ];
  for (const t of cases) {
    if (!t.url) continue;
    checked++;
    const oldUrl = buildAffiliateUrl(t.url, t.slug as any, ids, t.deep);
    const newUrl = buildStoreUrl(byslug[t.slug], t.url, t.deep);
    if (oldUrl !== newUrl) {
      diffs.push(`${c.name} [${t.slug}]\n     قديم: ${oldUrl}\n     جديد: ${newUrl}`);
    }
  }
}

console.log(`روابط مفحوصة: ${checked}`);
if (diffs.length === 0) {
  console.log('✅ تطابق تام — البناء العام يعطي نفس روابط العمولة حرفياً.');
} else {
  console.log(`❌ ${diffs.length} اختلاف:`);
  diffs.slice(0, 15).forEach((d) => console.log('   ' + d));
}

await prisma.$disconnect();
process.exit(diffs.length ? 1 : 0);
}

main();
