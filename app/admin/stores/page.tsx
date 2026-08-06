import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StoresClient from './StoresClient';

export const dynamic = 'force-dynamic';

export default async function StoresAdminPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');

  const stores = await prisma.store.findMany({ orderBy: { sortOrder: 'asc' } });

  // كم قطعة مرتبطة بكل متجر — يوضّح أثر الحذف قبل تنفيذه
  const grouped = await prisma.componentOffer.groupBy({
    by: ['storeId'],
    _count: { _all: true },
  });
  const withUrls = await prisma.componentOffer.groupBy({
    by: ['storeId'],
    where: { url: { not: null } },
    _count: { _all: true },
  });

  const counts: Record<string, { total: number; withUrl: number }> = {};
  for (const s of stores) {
    counts[s.id] = {
      total: grouped.find((g) => g.storeId === s.id)?._count._all ?? 0,
      withUrl: withUrls.find((g) => g.storeId === s.id)?._count._all ?? 0,
    };
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
            المتاجر
            <span className="text-sm font-normal text-slate-400">({stores.length})</span>
          </h1>
          <Link href="/admin" className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
            ← رجوع للوحة
          </Link>
        </div>

        <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          كل متجر هنا يظهر تلقائياً في كل صفحات الموقع بلونه وترتيبه: بطاقات الشراء، صفحة القطعة،
          المقارنة، المُجمّع، ورسم تاريخ الأسعار. ولون المتجر هو نفسه في كل مكان — لا تكرار ولا تضارب.
        </p>

        <StoresClient stores={JSON.parse(JSON.stringify(stores))} counts={counts} />
      </div>
    </div>
  );
}
