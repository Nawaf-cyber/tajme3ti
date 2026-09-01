/* ============ تجميع أرقام الزيارات ============
 *
 * مفصولٌ عن المسار لأنّ صفحة اللوحة تحتاجه أيضاً — وكانت ستُنادي مسارها
 * عبر HTTP لتحصل عليه: طلبٌ يخرج من الخادم ليعود إليه، ويحمل الكوكي يدوياً،
 * ويفشل بصمتٍ إن تغيّر اسم النطاق. والدالّة تُنادى مباشرةً.
 *
 * ⚠️ والتجميع في القاعدة لا في جافاسكربت: `groupBy` على مئات الآلاف من
 * الصفوف يعود بعشرات، وجلبُها كلَّها ثم عدُّها هنا نقلٌ للجدول عبر الشبكة.
 */

import { prisma } from './prisma';
import { riyadhDay } from './visitor';

/** أيام إلى الوراء بصيغة YYYY-MM-DD */
const daysBack = (n: number): string[] => {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(riyadhDay(new Date(Date.now() - i * 86400000)));
  return out;
};

export async function analyticsSummary(daysSpan: number) {
  const span = Math.min(Math.max(daysSpan || 30, 1), 180);
  const days = daysBack(span);
  const from = days[0];

  const [byDay, byPath, byComponent, byRef, byDevice, signedIn, total] = await Promise.all([
    prisma.pageHit.groupBy({ by: ['day'], where: { day: { gte: from } }, _count: { _all: true } }),
    prisma.pageHit.groupBy({
      by: ['path'], where: { day: { gte: from } }, _count: { _all: true },
      orderBy: { _count: { path: 'desc' } }, take: 12,
    }),
    prisma.pageHit.groupBy({
      by: ['componentId'], where: { day: { gte: from }, componentId: { not: null } },
      _count: { _all: true }, orderBy: { _count: { componentId: 'desc' } }, take: 15,
    }),
    prisma.pageHit.groupBy({
      by: ['refHost'], where: { day: { gte: from }, refHost: { not: null } },
      _count: { _all: true }, orderBy: { _count: { refHost: 'desc' } }, take: 10,
    }),
    prisma.pageHit.groupBy({ by: ['device'], where: { day: { gte: from } }, _count: { _all: true } }),
    prisma.pageHit.findMany({
      where: { day: { gte: from }, userId: { not: null } }, select: { userId: true }, distinct: ['userId'],
    }),
    prisma.pageHit.count({ where: { day: { gte: from } } }),
  ]);

  /* ⚠️ «الزوّار» تُحسب بالبصمات المميّزة **لكل يوم على حدة** ثم تُجمع، لا
     بالبصمات المميّزة عبر المدّة: الملح يتغيّر يوميّاً، فبصمة أمس وبصمة
     اليوم لنفس الشخص مختلفتان أصلاً. وجمعُها عبر المدّة يعطي رقماً لا
     معنى له — لا زوّاراً فريدين ولا زياراتٍ. */
  const visitorsPerDay = await prisma.pageHit.findMany({
    where: { day: { gte: from } }, select: { day: true, visitorHash: true }, distinct: ['day', 'visitorHash'],
  });
  const visitorsByDay = new Map<string, number>();
  for (const v of visitorsPerDay) visitorsByDay.set(v.day, (visitorsByDay.get(v.day) || 0) + 1);

  const viewsByDay = new Map(byDay.map((d) => [d.day, d._count._all]));

  /* أسماء القطع — الجدول بلا مفتاحٍ أجنبيّ، فالوصل هنا */
  const ids = byComponent.map((c) => c.componentId!).filter(Boolean);
  const comps = ids.length
    ? await prisma.component.findMany({
        where: { id: { in: ids } },
        select: { id: true, brand: true, name: true, category: { select: { name: true } } },
      })
    : [];
  const byId = new Map(comps.map((c) => [c.id, c]));

  return {
    span,
    totalViews: total,
    /* ⚠️ ويُسمّى «متصفّحات» لا «أشخاص»: مجموع البصمات اليوميّة، ومن زار
       ثلاثة أيّام عُدّ ثلاثاً. الاسم الصحيح يمنع قراراً مبنيّاً على وهم. */
    browserDays: [...visitorsByDay.values()].reduce((a, b) => a + b, 0),
    signedInUsers: signedIn.length,
    series: days.map((d) => ({ day: d, views: viewsByDay.get(d) || 0, browsers: visitorsByDay.get(d) || 0 })),
    paths: byPath.map((p) => ({ path: p.path, views: p._count._all })),
    components: byComponent.map((c) => {
      const comp = byId.get(c.componentId!);
      return {
        id: c.componentId,
        name: comp ? `${comp.brand} ${comp.name}` : '(محذوفة)',
        category: comp?.category?.name ?? '',
        views: c._count._all,
      };
    }),
    referrers: byRef.map((r) => ({ host: r.refHost, views: r._count._all })),
    devices: byDevice.map((d) => ({ device: d.device ?? 'غير معروف', views: d._count._all })),
  };
}
