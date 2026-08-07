import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminPartRequests from './AdminPartRequests';
import MarkSeenOnOpen from './MarkSeenOnOpen';

export const dynamic = 'force-dynamic';

export default async function PartRequestsAdminPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');

  // الطلبات مرتّبة حسب العدد (الأكثر طلباً أولاً) — يوجّه أولوياتك
  const parts = await prisma.requestedPart.findMany({
    include: {
      _count: { select: { votes: true } },
      component: { select: { id: true, name: true, brand: true } },
      category: { select: { name: true } },
      // أصحاب الطلب — لتعرف بمن تتحدّث قبل أن تردّ
      votes: { select: { userId: true, removedAt: true, user: { select: { name: true, email: true } } } },
      // المحادثة كاملة — الأدمن يقرأ ردّ صاحب الطلب ويكمل الحوار
      messages: { orderBy: { createdAt: 'asc' }, select: { body: true, userId: true, createdAt: true, seenByAdmin: true, user: { select: { name: true, email: true } } } },
    },
  });
  /* ============ الترتيب ============
     ١) الطلبات الحيّة أولاً، والتي أزالها الجميع في القاع — طلبٌ لم يبقَ
        له صاحب لا يستحق صدارة القائمة مهما كان عدده التاريخي.
     ٢) ثم الأكثر طلباً — يوجّه أولوياتك.
     ٣) ثم الأحدث. */
  const liveVotes = (p: (typeof parts)[number]) => p.votes.filter((v) => !v.removedAt).length;
  parts.sort((a, b) => {
    const aDead = liveVotes(a) === 0 ? 1 : 0;
    const bDead = liveVotes(b) === 0 ? 1 : 0;
    return aDead - bDead || liveVotes(b) - liveVotes(a) || b.createdAt.getTime() - a.createdAt.getTime();
  });

  // قائمة القطع للربط (الأدمن يختار القطعة المضافة)
  const components = await prisma.component.findMany({
    select: { id: true, name: true, brand: true, category: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });

  const data = parts.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    count: p.votes.filter((v) => !v.removedAt).length,
    createdAt: p.createdAt.toISOString(),
    messages: p.messages.map((m) => ({
      body: m.body,
      fromAdmin: m.userId === null,
      author: m.user?.name || m.user?.email?.split('@')[0] || null,
      at: m.createdAt.toISOString(),
      unread: m.userId !== null && !m.seenByAdmin,
    })),
    isNew: p.adminSeenAt === null,
    categoryName: p.category?.name || null,
    // المسجّلون بأسمائهم، والمجهولون رقماً — لا وسيلة للردّ عليهم
    people: p.votes
      .filter((v) => v.userId && v.user && !v.removedAt)
      .map((v) => ({ name: v.user!.name, email: v.user!.email })),
    anonymous: p.votes.filter((v) => !v.userId && !v.removedAt).length,
    /* من أزالها من قائمته — إشارة مفيدة: إزالة الجميع بعد الإضافة قد تعني
       أنك أضفت قطعة غير التي قصدوها. */
    removed: p.votes
      .filter((v) => v.removedAt && v.user)
      .map((v) => ({
        name: v.user!.name,
        email: v.user!.email,
        at: v.removedAt!.toISOString(),
      })),
    /* حالتا الحذف — تُميّزان في التصفية:
       allRemoved = أزالها كل من طلبها (لم يبقَ أحد)
       someRemoved = أزالها بعضهم وبقي غيرهم */
    allRemoved: p.votes.some((v) => v.removedAt) && p.votes.every((v) => v.removedAt),
    someRemoved: p.votes.some((v) => v.removedAt) && p.votes.some((v) => !v.removedAt),
    component: p.component ? { id: p.component.id, label: `${p.component.brand} ${p.component.name}` } : null,
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
            طلبات القطع
            <span className="text-sm font-normal text-slate-400">({data.length})</span>
          </h1>
          <Link href="/admin" className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
            ← رجوع للوحة
          </Link>
        </div>

        <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          مرتّبة حسب <b>عدد الطلبات</b> — أضف الأكثر طلباً أولاً. حين تربط الطلب بقطعة فعلية،
          يتحوّل تلقائياً إلى «تمت الإضافة» ويظهر لكل من طلبها زرّ «ابنِ بهذه القطعة».
        </p>

        {/* فتح الصفحة = قراءة: تُطفأ نقطة «طلبات جديدة» بعد الرسم */}
        <MarkSeenOnOpen hasNew={data.some((d) => d.isNew || d.messages.some((m) => m.unread))} />

        <AdminPartRequests data={data} components={components.map((c) => ({ id: c.id, label: `${c.brand} ${c.name}`, category: c.category?.name || '' }))} />
      </div>
    </div>
  );
}
