import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminPartRequests from './AdminPartRequests';

export const dynamic = 'force-dynamic';

export default async function PartRequestsAdminPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');

  // الطلبات مرتّبة حسب العدد (الأكثر طلباً أولاً) — يوجّه أولوياتك
  const parts = await prisma.requestedPart.findMany({
    include: {
      _count: { select: { votes: true } },
      component: { select: { id: true, name: true, brand: true } },
    },
  });
  parts.sort((a, b) => b._count.votes - a._count.votes || b.createdAt.getTime() - a.createdAt.getTime());

  // قائمة القطع للربط (الأدمن يختار القطعة المضافة)
  const components = await prisma.component.findMany({
    select: { id: true, name: true, brand: true, category: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });

  const data = parts.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    count: p._count.votes,
    createdAt: p.createdAt.toISOString(),
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

        <AdminPartRequests data={data} components={components.map((c) => ({ id: c.id, label: `${c.brand} ${c.name}`, category: c.category?.name || '' }))} />
      </div>
    </div>
  );
}
