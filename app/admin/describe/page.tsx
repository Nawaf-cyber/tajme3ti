/* ============ صفحة كاتب الأوصاف ============
 *
 * ثلاثٌ وعشرون قطعةً أُضيفت يوم 2026-09-02 وخرجت بلا وصفٍ إطلاقاً، ولم
 * يُكتشف حتى سأل المستخدم بعد يومين. فالرقم الأوّل في هذه الصفحة هو
 * «كم قطعةً بلا وصف» — يُرى قبل أن يُسأل عنه.
 *
 * والصفحة تُؤتمت **الكتابة** وتُبقي **الاعتماد** بيدك.
 */

import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import DescribeClient from './DescribeClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'كاتب الأوصاف',
  robots: { index: false, follow: false },
};

export default async function DescribePage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');

  const all = await prisma.component.findMany({
    select: { description: true, category: { select: { name: true } } },
  });
  const missing = all.filter((c) => !String(c.description ?? '').trim());
  const byCat: Record<string, number> = {};
  for (const c of missing) byCat[c.category.name] = (byCat[c.category.name] || 0) + 1;
  const ranked = Object.entries(byCat).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <Link href="/admin" className="font-mono text-[11px] font-black text-cyan-600 dark:text-cyan-400 hover:underline">
            ← لوحة الإدارة
          </Link>
          <h1 className="mt-3 text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            كاتب <span className="text-cyan-600 dark:text-cyan-400">الأوصاف</span>
          </h1>
          <p className="mt-2 text-[15px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            يكتب المسوّدة من مواصفات القطعة المسجّلة عندنا — لا من معرفةٍ عامّة — ويربط بديلاً حقيقيّاً من
            الكتالوج. ولا يُكتب حرفٌ في القاعدة حتى تُقرّه أنت.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <div className="px-4 py-2.5 rounded-sm bg-amber-500/[0.08] border border-amber-500/30">
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 tabular-nums">{missing.length}</span>
            <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mr-2">قطعة بلا وصف</span>
          </div>
          <div className="px-4 py-2.5 rounded-sm bg-emerald-500/[0.08] border border-emerald-500/30">
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{all.length - missing.length}</span>
            <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mr-2">موصوفة</span>
          </div>
          {ranked.map(([cat, n]) => (
            <div key={cat} className="px-3 py-2.5 rounded-sm bg-white/60 dark:bg-[#0F172A]/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[13px] font-black text-slate-900 dark:text-white tabular-nums">{n}</span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1.5">{cat}</span>
            </div>
          ))}
        </div>

        <DescribeClient />
      </div>
    </div>
  );
}
