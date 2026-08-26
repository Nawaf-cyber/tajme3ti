/* ============ تنبيهات انخفاض السعر — على بياناتٍ حقيقية ============
 *
 * **يقرأ ولا يكتب** إلا داخل معاملةٍ تتراجع.
 *
 * يُشغّل `lib/price-drops.ts` على مستخدمين حقيقيين ويقيس:
 *   ١) المتابعة التلقائية تلتقط قطع التجميعات بلا صفٍّ في PriceWatch.
 *   ٢) الانخفاض المعروض حقيقيّ (السعر الحالي أقلّ من السابق فعلاً).
 *   ٣) «لم يره» يتبدّل مع `dropsSeenAt`.
 *   ٤) المتابعة الصريحة تُضاف ولا تُكرّر ما جاء من تجميعة.
 *
 *   npx tsx scripts/price-drops-check.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { userPriceDrops, watchedComponentIds } from '../lib/price-drops';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

let pass = 0, fail = 0;
const check = (t: string, ok: boolean, d = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${t}`); } else { fail++; console.log(`  ${R}✘ ${t}${X}  ${d}`); }
};

class Rollback extends Error {}

async function main() {
  /* نختار مستخدماً له تجميعات فعلاً */
  const owner = await prisma.savedBuild.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { userId: true, name: true },
  });
  if (!owner) { console.error('⛔ لا تجميعات'); process.exit(1); }

  const { ids, fromBuild } = await watchedComponentIds(prisma, owner.userId);
  console.log(`\nمستخدم ${owner.userId.slice(0, 8)}… — قطعٌ متابَعة: ${ids.length}`);
  console.log(`  ${D}منها من تجميعاته: ${fromBuild.size} · متابعة صريحة: ${ids.length - fromBuild.size}${X}`);

  console.log('\n١) المتابعة التلقائية');
  check('التقطت قطعاً بلا أي صفٍّ في PriceWatch', fromBuild.size > 0, `${fromBuild.size}`);
  const explicit = await prisma.priceWatch.count({ where: { userId: owner.userId } });
  check('لا صفوفَ منسوخة لقطع التجميعات', explicit === ids.length - fromBuild.size, `صفوف=${explicit}`);

  console.log('\n٢) الانخفاضات المعروضة');
  const drops = await userPriceDrops(prisma, owner.userId, { seenAt: null });
  console.log(`   ${D}${drops.length} انخفاضاً خلال ٣٠ يوماً${X}`);
  drops.slice(0, 4).forEach((d) =>
    console.log(`     ${Y}-${d.pct}%${X} ${d.name} ${D}${d.previousPrice} ← ${d.price} ﷼ · ${d.source === 'build' ? `من «${d.buildName}»` : 'متابعة'}${X}`));
  check('كل انخفاضٍ معروضٍ حقيقيّ (الحالي < السابق)', drops.every((d) => d.price < d.previousPrice));
  check('النِّسب موجبة ومعقولة', drops.every((d) => d.pct > 0 && d.pct < 100));
  check('كلٌّ منها من قطعةٍ متابَعة', drops.every((d) => ids.includes(d.componentId)));

  console.log('\n٣) «لم يره» يتبدّل مع dropsSeenAt');
  if (drops.length) {
    const allUnseen = drops.filter((d) => d.unseen).length;
    const after = await userPriceDrops(prisma, owner.userId, { seenAt: new Date() });
    check(`قبل الاطّلاع: ${allUnseen} غير مرئيّ`, allUnseen === drops.length);
    check('بعد الاطّلاع: صفر', after.filter((d) => d.unseen).length === 0);
  } else {
    console.log(`   ${D}لا انخفاضات لهذا المستخدم — يُتخطّى${X}`);
  }

  console.log('\n٤) المتابعة الصريحة (داخل معاملةٍ تتراجع)');
  const outside = await prisma.component.findFirst({
    where: { id: { notIn: ids.length ? ids : ['-'] }, priceDroppedAt: { not: null }, previousPrice: { not: null } },
    select: { id: true, name: true },
  });
  if (!outside) {
    console.log(`   ${D}لا قطعة منخفضة خارج متابعته — يُتخطّى${X}`);
  } else {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.priceWatch.create({ data: { userId: owner.userId, componentId: outside.id } });
        const after = await watchedComponentIds(tx as any, owner.userId);
        check(`«${outside.name}» صارت متابَعة`, after.ids.includes(outside.id));
        check('ولم تُنسب إلى تجميعة', !after.fromBuild.has(outside.id));
        const d2 = await userPriceDrops(tx as any, owner.userId, { seenAt: null });
        check('وتظهر في الانخفاضات بمصدر «متابعة»',
          d2.some((d) => d.componentId === outside.id && d.source === 'watch'));
        throw new Rollback();
      });
    } catch (e) { if (!(e instanceof Rollback)) throw e; }

    const left = await prisma.priceWatch.count({ where: { userId: owner.userId } });
    check('لا أثر بعد التراجع', left === explicit, `${left} مقابل ${explicit}`);
  }

  console.log(`\n${'═'.repeat(48)}`);
  console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
  await prisma.$disconnect();
  if (fail) process.exit(1);
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
