/* ============ صفحة البحث عن مصدرٍ ثانٍ ============
 *
 * ٦٠٪ من الكتالوج بشاهدٍ واحد — أي أن وعدنا «نقارن أسعار المتاجر» غير
 * محقَّقٍ فيها. وإضافةُ شاهدٍ ثانٍ تُصلح السعر والثقة معاً بلا سطر كود،
 * لكنها كانت تُنجز يدوياً بستّ محاولاتٍ للقطعة الواحدة.
 *
 * هذه الصفحة تُؤتمت **البحث** وتُبقي **الكتابة** بإقرارٍ منك.
 */

import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { liveOffers } from '../../../lib/stores';
import { OFFER_INCLUDE } from '../../../lib/stores-server';
import FindSourcesClient from './FindSourcesClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'البحث عن مصدر ثانٍ',
  robots: { index: false, follow: false },
};

export default async function FindSourcesPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');

  const all = await prisma.component.findMany({
    include: { category: true, ...OFFER_INCLUDE },
  });

  const single = all.filter((c) => liveOffers(c.offers as any).length === 1);
  const byCat: Record<string, number> = {};
  single.forEach((c) => { byCat[c.category.name] = (byCat[c.category.name] || 0) + 1; });
  const ranked = Object.entries(byCat).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <Link href="/admin" className="font-mono text-[11px] font-black text-cyan-600 dark:text-cyan-400 hover:underline">
            ← لوحة الإدارة
          </Link>
          <h1 className="mt-3 text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            البحث عن <span className="text-cyan-600 dark:text-cyan-400">مصدرٍ ثانٍ</span>
          </h1>
          <p className="mt-2 text-[15px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            قطعةٌ بمتجرٍ واحد لا تُقارَن، تُنقَل. وهذه الصفحة تبحث عن شاهدٍ ثانٍ بمطابقةٍ صارمة —
            ولا تكتب حرفاً حتى تُقرّه أنت.
          </p>
        </div>

        {/* حالة الكتالوج — الرقم الذي يقيس التقدّم */}
        <div className="mb-6 flex flex-wrap gap-2">
          <div className="px-4 py-2.5 rounded-sm bg-amber-500/[0.08] border border-amber-500/30">
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 tabular-nums">{single.length}</span>
            <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mr-2">قطعة بمصدرٍ واحد</span>
          </div>
          {ranked.map(([cat, n]) => (
            <div key={cat} className="px-3 py-2.5 rounded-sm bg-white/60 dark:bg-[#0F172A]/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[13px] font-black text-slate-900 dark:text-white tabular-nums">{n}</span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1.5">{cat}</span>
            </div>
          ))}
        </div>

        <FindSourcesClient />
      </div>
    </div>
  );
}
