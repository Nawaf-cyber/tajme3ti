'use client';

import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { approvePriceReview, rejectPriceReview } from './price-review-actions';
import { formatPrice } from '../../lib/price';

export type ReviewRow = {
  id: string;
  componentId: string;
  componentName: string;
  brand: string;
  storeName: string;
  storeColor: string;
  url: string | null;
  oldPrice: number;
  newPrice: number;
  changePct: number;
  seenCount: number;
  detectedAt: string;
};

/**
 * ============ ارتفاعات تحتاج مراجعة ============
 *
 * الغرض من الشاشة أن تُقرَّر بنظرة: كم كان، كم صار، من أي متجر، وكم مرّة
 * تكرّر الرقم. وزرّ يفتح صفحة المتجر في تبويب جديد — القرار لا يُتّخذ من
 * الأرقام وحدها بل من رؤية الصفحة.
 *
 * لا تُعرض إن كان الطابور فارغاً: قسمٌ يقول «لا يوجد» في لوحة مزدحمة
 * ضجيجٌ دائم مقابل فائدة عابرة.
 */
export default function PriceReviewPanel({ rows }: { rows: ReviewRow[] }) {
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, 'approved' | 'rejected'>>({});

  if (rows.length === 0) return null;

  const act = (id: string, kind: 'approve' | 'reject') => {
    setBusyId(id);
    startTransition(async () => {
      const res = kind === 'approve' ? await approvePriceReview(id) : await rejectPriceReview(id);
      setBusyId(null);
      if (res.success) {
        setDone((d) => ({ ...d, [id]: kind === 'approve' ? 'approved' : 'rejected' }));
        toast.success(kind === 'approve' ? 'اعتُمد السعر الجديد' : 'رُفض — بقي السعر السابق');
      } else {
        toast.error(('error' in res && res.error) || 'تعذّر تنفيذ القرار');
      }
    });
  };

  const open = rows.filter((r) => !done[r.id]);

  return (
    <div className="mb-8 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50/70 dark:bg-amber-500/5 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-amber-200 dark:border-amber-500/30 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <div>
            <h3 className="font-black text-sm text-amber-900 dark:text-amber-200">
              ارتفاع سعري يحتاج مراجعة
            </h3>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70 font-medium mt-0.5">
              السعر القديم ما زال معروضاً للزوار حتى تقرّر. افتح رابط المتجر ثم اعتمد أو ارفض.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-black text-amber-900 dark:text-amber-200 bg-amber-200/70 dark:bg-amber-500/20 px-2.5 py-1 rounded-full tabular-nums">
          {open.length}
        </span>
      </div>

      <div className="divide-y divide-amber-200/70 dark:divide-amber-500/20">
        {rows.map((r) => {
          const decided = done[r.id];
          return (
            <div
              key={r.id}
              className={`flex items-center gap-3 px-4 py-3 flex-wrap transition-opacity ${decided ? 'opacity-45' : ''}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded-sm text-white shrink-0"
                    style={{ backgroundColor: r.storeColor }}
                  >
                    {r.storeName}
                  </span>
                  <span className="font-bold text-[13px] text-slate-900 dark:text-white truncate" dir="ltr">
                    {r.brand} {r.componentName}
                  </span>
                  {r.seenCount > 1 && (
                    /* التكرار حجّة للاعتماد: رقمٌ يعود كل دورة أقرب للحقيقة من خطأ عابر */
                    <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-700/60 px-1.5 rounded-sm">
                      تكرّر ×{r.seenCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 font-mono text-[12px] tabular-nums">
                  <span className="text-slate-500 dark:text-slate-400 line-through">{formatPrice(r.oldPrice)}</span>
                  <span className="text-slate-400">←</span>
                  <span className="font-black text-amber-700 dark:text-amber-300">{formatPrice(r.newPrice)} ﷼</span>
                  <span className="font-black text-red-600 dark:text-red-400">▲{r.changePct}%</span>
                  <span className="text-slate-400 dark:text-slate-500 font-bold">
                    (+{formatPrice(r.newPrice - r.oldPrice)} ﷼)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-400 transition-colors"
                  >
                    افتح المتجر ↗
                  </a>
                )}
                <button
                  onClick={() => act(r.id, 'approve')}
                  disabled={pending || !!decided}
                  className="text-xs font-black px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors"
                >
                  {busyId === r.id && !decided ? '…' : decided === 'approved' ? 'اعتُمد ✓' : 'اعتماد'}
                </button>
                <button
                  onClick={() => act(r.id, 'reject')}
                  disabled={pending || !!decided}
                  className="text-xs font-black px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-colors"
                >
                  {decided === 'rejected' ? 'رُفض' : 'رفض'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
