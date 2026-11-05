/**
 * ============ تدقيق منافذ الكروت على جدول المعماريّات (lib/gpu-display) ============
 *
 * نصّ specs.ports حرّ، ويُكتب يدوياً مع كلّ كرت. هذا يقارن نسخة DP وHDMI فيه بما تقوله
 * الشركة عن معماريّته — بالرقمين لا بالحرف («2.1» و«2.1b» سواء). قراءةٌ فقط.
 * أوّل تشغيل (2026-11-05) وجد Arc B580 مكتوباً DP 2.0، وIntel تقول DP 2.1 حتى UHBR 13.5.
 *
 *   npx tsx scripts/audit-gpu-ports.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { portsMismatch } from '../lib/gpu-display';

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  const gpus = await prisma.component.findMany({
    where: { category: { name: 'GPU' } },
    select: { id: true, brand: true, name: true, specs: true },
    orderBy: [{ brand: 'asc' }, { name: 'asc' }],
  });
  let bad = 0;
  for (const g of gpus) {
    const s: any = typeof g.specs === 'string' ? JSON.parse(g.specs) : g.specs || {};
    const issues = portsMismatch(s.architecture, s.ports);
    if (!issues.length) continue;
    bad++;
    console.log(`✖ ${g.brand} ${g.name} (${g.id})\n    «${s.ports}» · ${issues.join(' · ')}`);
  }
  console.log(`\n${gpus.length} كرتاً · ${bad} تخالف معماريّتها`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
