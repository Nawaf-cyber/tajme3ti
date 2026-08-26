/* ============ لوحة الأسعار — على بياناتٍ حقيقية ============
 *
 * **يقرأ ولا يكتب** إلا داخل معاملةٍ تتراجع.
 *
 * يُشغّل `lib/price-drops.ts` على مستخدمين حقيقيين ويقيس:
 *   ١) المتابعة التلقائية تلتقط قطع التجميعات بلا صفٍّ في PriceWatch.
 *   ٢) الجديد حقيقيّ (السعر الحالي أقلّ من السابق فعلاً).
 *   ٣) **النافذة تُقاس من آخر زيارته**: ما رآه لا يعود، وسقفُها ٣٠ يوماً.
 *   ٤) «أدنى سعر منذ شهر» لا يُدّعى بلا قراءاتٍ ومدّةٍ كافيتين.
 *   ٥) الحفظ يبقى بعد أن يخرج من النافذة، ويُشطب حين يرتفع السعر.
 *
 *   npx tsx scripts/price-drops-check.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { userDropsView, watchedComponentIds } from '../lib/price-drops';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

let pass = 0, fail = 0;
const check = (t: string, ok: boolean, d = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${t}`); } else { fail++; console.log(`  ${R}✘ ${t}${X}  ${d}`); }
};

class Rollback extends Error {}

async function main() {
  /* المستخدم صاحب أكثر انخفاضات — أوسع حالةٍ حقيقية عندنا */
  const uids = [...new Set((await prisma.savedBuild.findMany({ select: { userId: true } })).map((x) => x.userId))];
  let uid = '', best = 0;
  for (const u of uids) {
    const v = await userDropsView(prisma, u, { seenAt: null });
    if (v.fresh.length > best) { best = v.fresh.length; uid = u; }
  }
  if (!uid) { console.error('⛔ لا مستخدم بانخفاضات'); process.exit(1); }

  const { ids, fromBuild, pins } = await watchedComponentIds(prisma, uid);
  console.log(`\nمستخدم ${uid.slice(0, 8)}… — قطعٌ متابَعة: ${ids.length}`);
  console.log(`  ${D}من تجميعاته: ${fromBuild.size} · متابعة صريحة: ${ids.length - fromBuild.size} · محفوظة: ${pins.size}${X}`);

  console.log('\n١) المتابعة التلقائية');
  check('التقطت قطعاً بلا أي صفٍّ في PriceWatch', fromBuild.size > 0, `${fromBuild.size}`);
  const explicit = await prisma.priceWatch.count({ where: { userId: uid } });
  check('لا صفوفَ منسوخة لقطع التجميعات', explicit <= ids.length - fromBuild.size + pins.size, `صفوف=${explicit}`);

  console.log('\n٢) الجديد');
  const v0 = await userDropsView(prisma, uid, { seenAt: null });
  console.log(`   ${D}${v0.fresh.length} جديداً · ${v0.lowest.length} في أدنى سعرٍ لها · مجموع ${v0.totalSaved} ﷼${X}`);
  v0.fresh.slice(0, 3).forEach((d) =>
    console.log(`     ${Y}-${d.pct}%${X} ${d.name} ${D}${d.previousPrice} ← ${d.price} ﷼${d.atLowest ? ' · أدنى سعر' : ''}${X}`));
  check('كل جديدٍ حقيقيّ (الحالي < السابق)', v0.fresh.every((d) => d.previousPrice != null && d.price < d.previousPrice));
  check('النِّسب موجبة ومعقولة', v0.fresh.every((d) => d.pct > 0 && d.pct < 100));
  check('كلٌّ منها من قطعةٍ متابَعة', v0.fresh.every((d) => ids.includes(d.componentId)));

  console.log('\n٣) النافذة من آخر زيارة');
  const after = await userDropsView(prisma, uid, { seenAt: new Date() });
  check('من زار للتوّ لا يرى جديداً', after.fresh.length === 0, `${after.fresh.length}`);
  const yest = await userDropsView(prisma, uid, { seenAt: new Date(Date.now() - 86400000) });
  check('ومن غاب يوماً يرى ما جدّ فيه فقط', yest.fresh.length <= v0.fresh.length, `${yest.fresh.length} ≤ ${v0.fresh.length}`);
  const ancient = await userDropsView(prisma, uid, { seenAt: new Date(Date.now() - 400 * 86400000) });
  check('وسقفُ الغياب ٣٠ يوماً لا أكثر', ancient.fresh.length === v0.fresh.length,
    `${ancient.fresh.length} مقابل ${v0.fresh.length}`);

  console.log('\n٤) «أدنى سعر منذ شهر» لا يُدّعى بلا دليل');
  const lows = [...v0.fresh, ...v0.lowest].filter((d) => d.atLowest);
  console.log(`   ${D}${lows.length} قطعةً في أدنى سعرها${X}`);
  let evidenceOk = true, priceOk = true;
  for (const d of lows) {
    const rows = await prisma.priceHistory.findMany({
      where: { componentId: d.componentId, recordedAt: { gte: new Date(Date.now() - 30 * 86400000) } },
      select: { price: true, recordedAt: true },
    });
    if (rows.length < 5) evidenceOk = false;
    const span = Date.now() - Math.min(...rows.map((r) => r.recordedAt.getTime()));
    if (span < 7 * 86400000) evidenceOk = false;
    if (d.price > Math.min(...rows.map((r) => r.price)) + 0.5) priceOk = false;
  }
  check('لكلٍّ منها ٥ قراءاتٍ فأكثر تمتدّ ٧ أيامٍ فأكثر', evidenceOk);
  check('وسعرها الحالي فعلاً هو الأدنى في السجلّ', priceOk);

  /* ⚠️ الفحص الذي كان ناقصاً: «لا تكرار» كان يقارن القائمتين في اللحظة نفسها،
     والتكرار يقع **عبر الزمن** — ما كان «جديداً» أمس يعود «أدنى» اليوم. وهو
     ما شكا منه المستخدم: ٧ من ١٦ صفّاً عادت تحت عنوانٍ آخر. */
  const wide = await userDropsView(prisma, uid, { seenAt: null });
  const everFresh = new Set(wide.fresh.map((d) => d.componentId));
  const quiet = await userDropsView(prisma, uid, { seenAt: new Date() });
  check('ولا يعود «جديدُ» أمسٍ «أدنى» اليوم',
    !quiet.lowest.some((l) => everFresh.has(l.componentId)),
    `${quiet.lowest.filter((l) => everFresh.has(l.componentId)).length} عادت`);

  /* سعرٌ ثابتٌ طوال الشهر «أدنى سعرٍ له» بالتعريف — وليس خبراً */
  let spreadOk = true;
  for (const d of quiet.lowest) {
    const rows = await prisma.priceHistory.findMany({
      where: { componentId: d.componentId, recordedAt: { gte: new Date(Date.now() - 30 * 86400000) } },
      select: { price: true },
    });
    if (Math.max(...rows.map((r) => r.price)) < d.price * 1.03) spreadOk = false;
  }
  check('ولا تُدّعى لقطعةٍ لم يتحرّك سعرها', spreadOk);

  console.log('\n٥) الحفظ (داخل معاملةٍ تتراجع)');
  const target = v0.fresh[0] ?? v0.lowest[0];
  if (!target) {
    console.log(`   ${D}لا قطعة لاختبار الحفظ — يُتخطّى${X}`);
  } else {
    try {
      await prisma.$transaction(async (tx) => {
        const comp = await tx.component.findUnique({ where: { id: target.componentId }, select: { price: true } });
        await tx.priceWatch.upsert({
          where: { userId_componentId: { userId: uid, componentId: target.componentId } },
          create: { userId: uid, componentId: target.componentId, pinnedPrice: comp!.price, pinnedAt: new Date() },
          update: { pinnedPrice: comp!.price, pinnedAt: new Date() },
        });

        /* بعد الحفظ: يبقى ظاهراً حتى لو زار للتوّ فخرج من النافذة */
        const vp = await userDropsView(tx as any, uid, { seenAt: new Date() });
        check(`«${target.name}» صارت محفوظة`, vp.pinned.some((d) => d.componentId === target.componentId));
        check('وتبقى بعد أن يخرج الجديدُ من النافذة', vp.fresh.length === 0 && vp.pinned.length > 0);

        /* ⚠️ ولا تبقى في «جديد» أيضاً: صفٌّ في مكانين يُقرأ «لم يتغيّر شيء» */
        const vw = await userDropsView(tx as any, uid, { seenAt: null });
        check('ولا تُعرض في «جديد» بعد حفظها',
          !vw.fresh.some((d) => d.componentId === target.componentId));
        check('ولا في «أدنى» أيضاً',
          !vw.lowest.some((d) => d.componentId === target.componentId));
        check('والسعر المحفوظ هو سعر القطعة لا رقمٌ من الطلب',
          vp.pinned.find((d) => d.componentId === target.componentId)?.pinnedPrice === comp!.price);
        check('والفرق عن المحفوظ صفرٌ ساعةَ الحفظ',
          vp.pinned.find((d) => d.componentId === target.componentId)?.vsPinned === 0);

        /* ثم نرفع السعر المحفوظ تحت الحاليّ فيصير «انتهى الخصم» */
        await tx.priceWatch.update({
          where: { userId_componentId: { userId: uid, componentId: target.componentId } },
          data: { pinnedPrice: comp!.price - 40 },
        });
        const vr = await userDropsView(tx as any, uid, { seenAt: new Date() });
        const row = vr.pinned.find((d) => d.componentId === target.componentId);
        check('وحين يرتفع السعر عن المحفوظ يصير الفرق موجباً (يُشطب)', (row?.vsPinned ?? 0) === 40, `${row?.vsPinned}`);

        throw new Rollback();
      });
    } catch (e) { if (!(e instanceof Rollback)) throw e; }

    const left = await prisma.priceWatch.count({ where: { userId: uid } });
    check('لا أثر بعد التراجع', left === explicit, `${left} مقابل ${explicit}`);
  }

  console.log(`\n${'═'.repeat(48)}`);
  console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
  await prisma.$disconnect();
  if (fail) process.exit(1);
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
