/* ============ صفحة الزيارات ============
 *
 * ⚠️ وتُجلب البيانات هنا في الخادم لا في المتصفّح: اللوحة تُفتح فتكون
 * مملوءة، بلا وميض فراغٍ ثم امتلاء. والمسار `/api/admin/analytics` يبقى
 * لتبديل المدّة بعد ذلك.
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminEmail } from '../../../lib/admin-guard';
import { analyticsSummary } from '../../../lib/analytics';
import AnalyticsClient from './AnalyticsClient';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'الزيارات', robots: { index: false, follow: false } };

export default async function AnalyticsPage() {
  if (!(await adminEmail())) redirect('/');

  const initial = await analyticsSummary(30);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="font-mono text-[11px] font-black text-cyan-600 dark:text-cyan-400 hover:underline">
            ← لوحة الإدارة
          </Link>
          <h1 className="mt-3 text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            الزيارات
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
            مقيسةٌ من عندنا لا من خدمةٍ خارجيّة، وبلا كوكي ولا عنوان IP محفوظ.
            الهويّة بصمةٌ يوميّة تتبدّل مع منتصف الليل — إلّا من سجّل دخوله، فيُعرف بحسابه.
          </p>
        </div>

        <AnalyticsClient initial={initial} />
      </div>
    </div>
  );
}
