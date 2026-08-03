'use client';

/* ============ طلبات القطع الخاصة بالمستخدم ============
   يعرض القطع التي طلبها مع حالتها الحيّة، وزر "ابنِ تجميعة بهذه القطعة"
   عند إضافتها. يظهر في صفحة "تجميعاتي" (حساب المستخدم). */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { STATUS_META, buildWithPartUrl, type PartStatus } from '../../lib/part-request';

type Req = {
  name: string;
  status: PartStatus;
  createdAt: string;
  component: { id: string; name: string; categoryName: string } | null;
};

export default function MyPartRequests() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/part-requests')
      .then((r) => r.json())
      .then((d) => setRequests(Array.isArray(d.requests) ? d.requests : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // لا نعرض القسم إطلاقاً إن لم يطلب شيئاً — كي لا نُشوّش صفحة من لا يستخدم الميزة
  if (loading || requests.length === 0) return null;

  const addedCount = requests.filter((r) => r.status === 'ADDED').length;

  return (
    <section id="part-requests" className="mb-10 scroll-mt-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-sm"></span>
          طلبات القطع
        </h2>
        {addedCount > 0 && (
          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-md border border-emerald-300 dark:border-emerald-800/50">
            ✅ {addedCount} أُضيفت
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {requests.map((r, i) => {
          const meta = STATUS_META[r.status];
          return (
            <div
              key={i}
              className="relative overflow-hidden bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-t-cyan-500/70 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-sm font-black text-slate-900 dark:text-white leading-snug break-words" dir="ltr">
                  {r.name}
                </span>
                <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-md border ${meta.badge}`}>
                  {meta.icon} {meta.label}
                </span>
              </div>

              {/* زر البناء يظهر فقط عند الإضافة وربط القطعة */}
              {r.status === 'ADDED' && r.component ? (
                <Link
                  href={buildWithPartUrl(r.component.categoryName, r.component.id)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-[12px] font-black transition-all active:scale-95 shadow-sm shadow-cyan-500/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                  ابنِ تجميعة بهذه القطعة
                </Link>
              ) : (
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
                  {r.status === 'REVIEWING'
                    ? 'نراجع طلبك — سنُضيفها إن توفّرت وكانت مطلوبة.'
                    : 'جارٍ إضافتها الآن — ستصلك هنا فور جهوزها.'}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
