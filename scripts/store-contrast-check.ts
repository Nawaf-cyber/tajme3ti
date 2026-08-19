/* ============ فحص تباين ألوان المتاجر ============
 *
 * لون المتجر هويّةٌ لا لونُ نصّ. وهذا الفحص يمنع أن يعود متجرٌ جديد فيُكتب
 * اسمُه بلونٍ لا يُقرأ — كما حدث مع أصفر نون (1.11 على الأبيض).
 *
 *   npx tsx scripts/store-contrast-check.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readableOn, contrastRatio, SURFACE_LIGHT, SURFACE_DARK } from '../lib/stores';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G = '\x1b[32m', R = '\x1b[31m', D = '\x1b[2m', X = '\x1b[0m';
const TARGET = 4.5;
let fail = 0;

async function main() {
  const stores = await prisma.store.findMany({ select: { latinName: true, color: true } });
  console.log(`\n${'المتجر'.padEnd(12)} ${'اللون'.padEnd(9)} الخام→فاتح  المصحّح→فاتح   الخام→داكن  المصحّح→داكن`);

  for (const s of stores) {
    const c = s.color || '#0EA5E9';
    const inkL = readableOn(c, SURFACE_LIGHT);
    const inkD = readableOn(c, SURFACE_DARK);
    const rawL = contrastRatio(c, SURFACE_LIGHT);
    const fixL = contrastRatio(inkL, SURFACE_LIGHT);
    const rawD = contrastRatio(c, SURFACE_DARK);
    const fixD = contrastRatio(inkD, SURFACE_DARK);
    const ok = fixL >= TARGET && fixD >= TARGET;
    if (!ok) fail++;
    const f = (n: number) => n.toFixed(2).padStart(5);
    console.log(
      `${ok ? G + '✔' + X : R + '✘' + X} ${s.latinName.padEnd(10)} ${c}  ${f(rawL)}   ${G}${f(fixL)}${X} ${D}${inkL}${X}   ${f(rawD)}   ${G}${f(fixD)}${X} ${D}${inkD}${X}`
    );
  }

  console.log(`\n${fail === 0 ? G + `كل المتاجر تبلغ ${TARGET} في الوضعين` + X : R + `فشل ${fail}` + X}`);
  await prisma.$disconnect();
  if (fail) process.exit(1);
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
