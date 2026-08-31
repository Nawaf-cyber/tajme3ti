/* ============ صفحة البحث الحرّ في المتاجر ============
 *
 * أختُ «مصدر ثانٍ» لا نسخةٌ منها. والفرق في السؤال:
 *
 *   «مصدر ثانٍ»  يبدأ من قطعةٍ **عندنا** ينقصها متجر: أين أجدها؟
 *   وهذه         تبدأ من كلمةٍ **يكتبها الأدمن**: ماذا في السوق؟
 *
 * فالأولى تُكمل الكتالوج وهذه تُوسّعه، والمحرّك واحدٌ (`ADAPTERS`) — فمتجرٌ
 * يُضاف يظهر في الصفحتين معاً بلا تعديلٍ في أيّهما.
 */

import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import StoreSearchClient from './StoreSearchClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ابحث في المتاجر',
  robots: { index: false, follow: false },
};

export default async function StoreSearchPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');

  const [components, offers] = await Promise.all([
    prisma.component.count(),
    prisma.componentOffer.count(),
  ]);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="font-mono text-[11px] font-black text-cyan-600 dark:text-cyan-400 hover:underline">
            ← لوحة الإدارة
          </Link>
        </div>

        {/* حجم الكتالوج — مرجعٌ يعرف به الأدمن أهو يوسّع أم يكرّر */}
        <div className="mb-6 flex flex-wrap gap-2">
          <div className="px-4 py-2.5 rounded-sm bg-white/60 dark:bg-[#0F172A]/60 border border-slate-200 dark:border-slate-800">
            <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{components}</span>
            <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mr-2">قطعة في الكتالوج</span>
          </div>
          <div className="px-4 py-2.5 rounded-sm bg-white/60 dark:bg-[#0F172A]/60 border border-slate-200 dark:border-slate-800">
            <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{offers}</span>
            <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mr-2">عرض متجر</span>
          </div>
        </div>

        <StoreSearchClient />
      </div>
    </div>
  );
}
