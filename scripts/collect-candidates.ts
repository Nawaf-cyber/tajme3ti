/* ============ جمع المرشّحين إلى ملفّ ============
 *
 * ⚠️ الروابط تُكتب برمجيّاً لا تُنسخ باليد: نسخُ رابطٍ من مخرجات الطرفية
 * أوصلني إلى ٤٠٤ (السطر ملوّنٌ ومقصوص، فتسلّل إليه محرف تلوين وضاع جزء).
 *
 *   npx tsx scripts/collect-candidates.ts out.json "استعلام" ["آخر" …]
 */

import 'dotenv/config';
import { writeFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { searchStore, readProductPage } from '../lib/store-search';
import { readProduct } from './find-candidates';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const IS_SYSTEM = /gaming pc|desktop pc|\bpc\b.*(ryzen|core ultra|rtx)|prebuilt|barebone|workstation|\bserver\b|rack ?mount|\bepyc\b|laptop|notebook/i;

async function main() {
  const [out, ...queries] = process.argv.slice(2);
  const have = new Set((await prisma.componentOffer.findMany({ select: { url: true } }))
    .map((o) => (o.url || '').replace(/\/$/, '')));

  const rows: any[] = [];
  for (const q of queries) {
    for (const c of (await searchStore('microless', q, '')).filter((x) => !IS_SYSTEM.test(x.title))) {
      if (have.has(c.url.replace(/\/$/, ''))) continue;
      if (rows.some((r) => r.url === c.url)) continue;
      const d = await readProduct(c.url);
      if (!d || !d.price || !d.inStock) continue;
      rows.push({ query: q, ...d });
    }
  }
  writeFileSync(out, JSON.stringify(rows, null, 2));
  console.log(`RESULT ${rows.length} مرشّحاً → ${out}`);
  rows.forEach((r, i) => console.log(`  [${i}] ${String(r.price).padStart(8)} ﷼  ${r.title.slice(0, 76)}`));
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
