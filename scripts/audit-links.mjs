/**
 * ============ فاحص الروابط الداخلية في أوصاف القطع ============
 *
 * ١٨ رابطاً انكسرت لأن لا شيء كان يفحصها: نصوص نائبة لم تُستبدل، وقطعٌ
 * حُذفت وبقيت الإشارة إليها. إصلاحها مرّة لا يمنع التاسع عشر — هذا يمنعه.
 *
 * يُرجع رمز خروج غير صفري عند وجود مكسور، فيصلح للتشغيل قبل النشر.
 *
 *   node scripts/audit-links.mjs
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const comps = await prisma.component.findMany({
  select: { id: true, name: true, description: true, category: { select: { name: true } } },
});
const ids = new Set(comps.map((c) => c.id));

const broken = [];
let total = 0;
for (const c of comps) {
  for (const m of (c.description || '').matchAll(/\/components\/([A-Za-z0-9_-]+)/g)) {
    total++;
    if (!ids.has(m[1])) broken.push({ from: `${c.category?.name}/${c.name}`, id: m[1] });
  }
}

console.log(`روابط داخلية: ${total} · مكسورة: ${broken.length}`);
for (const b of broken) {
  const kind = b.id.startsWith('PLACEHOLDER') ? 'نصّ نائب لم يُستبدل' : 'قطعة محذوفة';
  console.log(`  ❌ ${b.from} → ${b.id}  (${kind})`);
}

if (broken.length === 0) console.log('✅ لا رابط مكسور.');
await prisma.$disconnect();
process.exit(broken.length === 0 ? 0 : 1);
