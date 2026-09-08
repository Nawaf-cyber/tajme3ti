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

/** أسابيعُ إلى الوراء: كلٌّ بأوّل يومٍ وآخره — والأسبوع يبدأ الأحد كما في السعودية */
const weeksBack = (n: number): Array<{ from: string; to: string; label: string }> => {
  const out: Array<{ from: string; to: string; label: string }> = [];
  const today = new Date();
  /* الأحدُ صفرٌ في getDay — فنرجع إلى أحدِ هذا الأسبوع ثمّ نعدّ أسابيع */
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  for (let i = n - 1; i >= 0; i--) {
    const s = new Date(startOfWeek);
    s.setDate(startOfWeek.getDate() - i * 7);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    out.push({ from: riyadhDay(s), to: riyadhDay(e), label: riyadhDay(s).slice(5) });
  }
  return out;
};

/**
 * القُمع الأسبوعيّ: من بدأ بناءً · من وصل للتقرير · من نقر رابط شراء.
 *
 * ⚠️ ويُعدّ **بالبصمات المميّزة** لا بالأحداث: زائرٌ ينقر ثلاثة روابط شراء
 * ليس ثلاثةَ مشترين. والنسبةُ التي يُبنى عليها القرار تصير ثلاثةَ أضعاف
 * الحقيقة لو عُدّت الأحداث.
 *
 * ⚠️ وبصمةُ اليوم تتغيّر يوميّاً (الملح يوميّ)، فـ«الزائر» داخل الأسبوع
 * يُعدّ مرّةً لكلّ يومٍ زاره. والاسم هنا «بصمات» لا «أشخاص» — كما في بقيّة
 * هذا الملفّ، ولنفس السبب: اسمٌ صحيحٌ يمنع قراراً مبنيّاً على وهم.
 */
export async function funnelByWeek(weeks: number) {
  const span = Math.min(Math.max(weeks || 8, 1), 26);
  const ws = weeksBack(span);
  const from = ws[0].from;

  const rows = await prisma.pageHit.findMany({
    where: { day: { gte: from }, event: { in: ['build_start', 'build_complete', 'offer_click'] } },
    select: { day: true, event: true, visitorHash: true },
    distinct: ['day', 'event', 'visitorHash'],
  });

  /* وزوّار الأسبوع كلّهم — القاعدة التي تُنسب إليها النسب */
  const visits = await prisma.pageHit.findMany({
    where: { day: { gte: from } },
    select: { day: true, visitorHash: true },
    distinct: ['day', 'visitorHash'],
  });

  return ws.map((w) => {
    const inWeek = <T extends { day: string }>(r: T) => r.day >= w.from && r.day <= w.to;
    const count = (ev: string) => rows.filter((r) => inWeek(r) && r.event === ev).length;
    const started = count('build_start');
    const finished = count('build_complete');
    const clicked = count('offer_click');
    return {
      label: w.label, from: w.from, to: w.to,
      visitors: visits.filter(inWeek).length,
      started, finished, clicked,
      /* نسبةُ من وصل ممّن بدأ — الرقم الذي يقول هل الأداة تعمل */
      reachPct: started ? Math.round((finished / started) * 100) : 0,
      buyPct: finished ? Math.round((clicked / finished) * 100) : 0,
    };
  });
}

/** أكثر ما يبحث عنه الزائر — الكلمة التي استقرّ عليها لا كلّ حرفٍ كتبه */
export async function topSearches(daysSpan: number, take = 20) {
  const from = riyadhDay(new Date(Date.now() - Math.min(daysSpan, 180) * 86400000));
  const rows = await prisma.pageHit.groupBy({
    by: ['label'],
    where: { day: { gte: from }, event: 'search', label: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { label: 'desc' } },
    take,
  });
  return rows.map((r) => ({ term: r.label!, count: r._count._all }));
}

/**
 * أكثر ما يُنقر شراؤه — وأيّ متجرٍ يأخذه.
 *
 * ⚠️ وهذا أقربُ ما نملك إلى «مبيعات»: لا نرى ما بعد المغادرة إلى المتجر،
 * فالنقرة آخرُ إشارةٍ عندنا. ولا تُسمّى مبيعاً في أيّ تقرير.
 */
export async function topBuyClicks(daysSpan: number, take = 15) {
  const from = riyadhDay(new Date(Date.now() - Math.min(daysSpan, 180) * 86400000));
  const [byComp, byStore] = await Promise.all([
    prisma.pageHit.groupBy({
      by: ['componentId'],
      where: { day: { gte: from }, event: 'offer_click', componentId: { not: null } },
      _count: { _all: true }, orderBy: { _count: { componentId: 'desc' } }, take,
    }),
    prisma.pageHit.groupBy({
      by: ['label'],
      where: { day: { gte: from }, event: 'offer_click', label: { not: null } },
      _count: { _all: true }, orderBy: { _count: { label: 'desc' } }, take: 8,
    }),
  ]);

  const ids = byComp.map((c) => c.componentId!).filter(Boolean);
  const comps = ids.length
    ? await prisma.component.findMany({ where: { id: { in: ids } }, select: { id: true, brand: true, name: true } })
    : [];
  const byId = new Map(comps.map((c) => [c.id, c]));

  return {
    components: byComp.map((c) => {
      const k = byId.get(c.componentId!);
      return { id: c.componentId, name: k ? `${k.brand} ${k.name}` : '(محذوفة)', clicks: c._count._all };
    }),
    stores: byStore.map((s) => ({ store: s.label!, clicks: s._count._all })),
  };
}

/** أكثر القطع طلباً — من جدول الطلبات لا من القياس، فهو نيّةٌ صريحة */
export async function topRequested(take = 15) {
  const rows = await prisma.requestedPart.findMany({
    select: { id: true, name: true, status: true, category: { select: { name: true } }, _count: { select: { votes: true } } },
    orderBy: { votes: { _count: 'desc' } },
    take,
  });
  return rows.map((r) => ({
    id: r.id, name: r.name, status: r.status,
    category: r.category?.name ?? '', votes: r._count.votes,
  }));
}

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
