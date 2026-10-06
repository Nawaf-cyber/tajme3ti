import { prisma } from '../../../lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { adminEmail } from '../../../lib/admin-guard';
import StoreApplicationsClient from './StoreApplicationsClient';

export const dynamic = 'force-dynamic';

export default async function StoreApplicationsAdminPage() {
  if (!(await adminEmail())) redirect('/');

  // الجديد أولاً ثم قيد المراجعة، وداخل كلٍّ الأحدث — المبتوت فيه في القاع
  const apps = await prisma.storeApplication.findMany({ orderBy: { createdAt: 'desc' } });
  const rank = { NEW: 0, REVIEWING: 1, ACCEPTED: 2, REJECTED: 3 } as const;
  apps.sort((a, b) => rank[a.status] - rank[b.status]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
            طلبات المتاجر
            <span className="text-sm font-normal text-slate-400">({apps.length})</span>
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/for-stores" target="_blank" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:underline">
              صفحة الطلب ↗
            </Link>
            <Link href="/admin" className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
              ← رجوع للوحة
            </Link>
          </div>
        </div>

        <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          ما يصل من نموذج «انضم كمتجر». قبول الطلب لا يُضيف المتجر — أضفه من{' '}
          <Link href="/admin/stores" className="text-cyan-600 dark:text-cyan-400 hover:underline">المتاجر</Link>
          {' '}بعد أن تختبر قراءة أسعاره، ثم غيّر الحالة هنا.
        </p>

        <StoreApplicationsClient apps={JSON.parse(JSON.stringify(apps))} />
      </div>
    </div>
  );
}
