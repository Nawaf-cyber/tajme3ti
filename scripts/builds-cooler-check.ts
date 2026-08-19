/* ============ هل يصل المبرّد إلى التجميعة المحفوظة؟ ============
 *
 * السلسلة كانت مقطوعةً في أربع حلقات: الباني لا يرسل، والمسار لا يكتب،
 * ولا يقرأ، والصفحة لا تعرض. وأخطرها الثالثة — لأن المبرّد كان يسقط من
 * **مجموع السعر** بلا أثر.
 *
 * ⚠️ والفحص داخل معاملةٍ تتراجع: التجميعات الـ٨٩ لمستخدمين حقيقيين، فلا
 * تُكتب فيها قيمةُ اختبار. نضع مبرّداً، نقرأ بنفس استعلام المسار، ثم نرجع.
 *
 *   npx tsx scripts/builds-cooler-check.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { OFFER_INCLUDE } from '../lib/stores-server';
import { BUILD_PART_ORDER } from '../lib/build-compare';
import { CATEGORY_META, BUILD_ORDER } from '../lib/category-meta';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G = '\x1b[32m', R = '\x1b[31m', D = '\x1b[2m', X = '\x1b[0m';
let pass = 0, fail = 0;
const check = (t: string, ok: boolean, d = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${t}`); } else { fail++; console.log(`  ${R}✘ ${t}${X} ${d}`); }
};

class Rollback extends Error {}

async function main() {
  /* ١ — القوائم الثابتة تعرف المبرّد */
  console.log('\n١) القوائم');
  check('BUILD_ORDER فيه Cooler', (BUILD_ORDER as readonly string[]).includes('Cooler'));
  check('BUILD_PART_ORDER فيه Cooler', (BUILD_PART_ORDER as readonly string[]).includes('Cooler'));
  check('CATEGORY_META فيه Cooler بتسمية عربية', CATEGORY_META.Cooler?.label === 'المبرّد');
  check('كل فئات الترتيب لها تسمية', (BUILD_ORDER as readonly string[]).every((k) => !!CATEGORY_META[k]));

  const cooler = await prisma.component.findFirst({
    where: { category: { name: 'Cooler' }, price: { gt: 0 } },
    select: { id: true, name: true, price: true },
    orderBy: { price: 'desc' },
  });
  if (!cooler) { console.error('⛔ لا مبرّد في الكتالوج'); process.exit(1); }

  const target = await prisma.savedBuild.findFirst({ where: { cpuId: { not: null } }, select: { id: true, name: true } });
  if (!target) { console.error('⛔ لا تجميعة بمعالج'); process.exit(1); }

  console.log(`\n٢) المسار كاملاً — تجميعة «${target.name}» + مبرّد «${cooler.name}» (${cooler.price} ﷼)`);

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.savedBuild.findUnique({ where: { id: target.id } });

      /* الكتابة — نفس ما يفعله POST */
      await tx.savedBuild.update({ where: { id: target.id }, data: { coolerId: cooler.id } });

      /* القراءة — نفس استعلام GET حرفياً */
      const builds = await tx.savedBuild.findMany({ where: { id: target.id } });
      const PART_IDS = (b: (typeof builds)[number]) =>
        [b.cpuId, b.gpuId, b.ramId, b.motherboardId, b.caseId, b.psuId, b.storageId, b.coolerId];

      const componentIds = builds.flatMap(PART_IDS).filter(Boolean) as string[];
      const components = await tx.component.findMany({
        where: { id: { in: componentIds } },
        select: { id: true, name: true, price: true, specs: true, lastScrapedAt: true, ...OFFER_INCLUDE },
      });
      const compMap = new Map(components.map((c) => [c.id, c]));
      const b = builds[0];

      const parts: Record<string, any> = {
        CPU: b.cpuId ? compMap.get(b.cpuId) : null,
        Cooler: b.coolerId ? compMap.get(b.coolerId) : null,
      };
      const totalWith = PART_IDS(b).reduce((s, id) => s + (id ? (compMap.get(id)?.price || 0) : 0), 0);
      const totalWithout = PART_IDS(b).slice(0, 7).reduce((s, id) => s + (id ? (compMap.get(id)?.price || 0) : 0), 0);

      check('coolerId كُتب', b.coolerId === cooler.id, String(b.coolerId));
      check('المبرّد يظهر في parts', parts.Cooler?.id === cooler.id, JSON.stringify(parts.Cooler?.name));
      /* بهامشٍ لا بمساواة: 9087.64 − 8521 تعطي 566.6399999999994 في
         الفاصلة العائمة. المساواة الحرفية هنا تُسقط فحصاً صحيحاً. */
      check(
        'سعره يدخل المجموع',
        Math.abs(totalWith - totalWithout - cooler.price) < 0.01,
        `${totalWithout} → ${totalWith}`,
      );
      console.log(`      ${D}المجموع بدونه ${totalWithout} ﷼  ←  معه ${totalWith} ﷼${X}`);

      /* ٣ — عمر السعر متاح للعرض */
      const anyPart = components.find((c) => c.lastScrapedAt);
      check('lastScrapedAt يصل الصفحة', !!anyPart, 'لا قطعة تحمل تاريخ سحب');

      /* ٤ — includedCooler على المعالج يصل أيضاً */
      const cpu = parts.CPU;
      const sp: any = typeof cpu?.specs === 'string' ? JSON.parse(cpu.specs) : cpu?.specs || {};
      check('includedCooler يصل من المعالج', !!String(sp.includedCooler ?? '').trim(), JSON.stringify(sp.includedCooler));
      console.log(`      ${D}${cpu?.name} → مبرّد مرفق: ${sp.includedCooler}${X}`);

      if (before?.coolerId !== null) throw new Error('التجميعة كانت تحمل مبرّداً — أوقف');
      throw new Rollback();
    });
  } catch (e) {
    if (!(e instanceof Rollback)) throw e;
  }

  /* ٥ — لا أثر بعد التراجع */
  console.log('\n٣) بعد التراجع');
  const after = await prisma.savedBuild.findUnique({ where: { id: target.id } });
  check('التجميعة عادت كما كانت', after?.coolerId === null, String(after?.coolerId));
  const filled = await prisma.savedBuild.count({ where: { coolerId: { not: null } } });
  check('٠ تجميعة تحمل مبرّداً', filled === 0, String(filled));

  console.log(`\n${'═'.repeat(44)}`);
  console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
  await prisma.$disconnect();
  if (fail) process.exit(1);
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
