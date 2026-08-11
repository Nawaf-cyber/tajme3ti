'use client';

import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { resolvePriceReport } from './price-review-actions';
import { formatPrice } from '../../lib/price';
import UpdateSingleButton from './components/UpdateSingleButton';

export type ReportRow = {
  id: string;
  componentId: string;
  componentName: string;
  brand: string;
  storeName: string;
  storeColor: string;
  url: string | null;
  ourPriceNow: number | null;
  ourPriceAtReport: number;
  reportedPrice: number | null;
  count: number;
  lastReportedAt: string;
};

/**
 * ============ بلاغات الزوّار عن فروق الأسعار ============
 *
 * تختلف عن «الارتفاعات المعلَّقة»: تلك يرصدها النظام من تغيّر الرقم، وهذه
 * يرصدها إنسانٌ فتح المتجر ورأى شيئاً آخر — وهو النوع الذي لا يستطيع أي
 * حارس آليّ كشفه (رابط يشير لنسخة أخرى، محدّد يقرأ سعر باقة، صفحة بسعر
 * منطقة مختلفة). لذلك تُعرض منفصلة.
 *
 * الترتيب بعدد المبلّغين: خمسة يقولون الشيء نفسه أقرب للحقيقة من واحد.
 */
export default function PriceReportsPanel({ rows }: { rows: ReportRow[] }) {
  const [pending, startTransition] = useTransition();
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  if (rows.length === 0) return null;

  const close = (id: string, dismiss: boolean) => {
    startTransition(async () => {
      const res = await resolvePriceReport(id, dismiss);
      if (res.success) {
        setClosed((c) => ({ ...c, [id]: true }));
        toast.success(dismiss ? 'أُغلق البلاغ — السعر صحيح' : 'أُغلق البلاغ — صُحّح');
      } else {
        toast.error(('error' in res && res.error) || 'تعذّر إغلاق البلاغ');
      }
    });
  };

  const openCount = rows.filter((r) => !closed[r.id]).length;

  return (
    <div className="mb-8 rounded-xl border border-sky-300 dark:border-sky-500/40 bg-sky-50/70 dark:bg-sky-500/5 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-sky-200 dark:border-sky-500/30 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚑</span>
          <div>
            <h3 className="font-black text-sm text-sky-900 dark:text-sky-200">بلاغات زوّار عن فرق سعر</h3>
            <p className="text-[11px] text-sky-700/80 dark:text-sky-300/70 font-medium mt-0.5">
              زائر فتح المتجر ورأى سعراً مختلفاً. افتح الرابط: إن كان يشير لمنتج آخر فالمشكلة في الرابط لا في السحب.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-black text-sky-900 dark:text-sky-200 bg-sky-200/70 dark:bg-sky-500/20 px-2.5 py-1 rounded-full tabular-nums">
          {openCount}
        </span>
      </div>

      <div className="divide-y divide-sky-200/70 dark:divide-sky-500/20">
        {rows.map((r) => {
          const gone = closed[r.id];
          /* تغيّر سعرنا بعد البلاغ؟ إشارة إلى أن دورة سحب لاحقة صحّحته،
             فيكفي الأدمن أن يتأكّد بنظرة بدل فتح المتجر. */
          const movedSince = r.ourPriceNow != null && r.ourPriceNow !== r.ourPriceAtReport;
          return (
            <div key={r.id} className={`flex items-center gap-3 px-4 py-3 flex-wrap ${gone ? 'opacity-40' : ''}`}>
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
                  {r.count > 1 && (
                    <span className="font-mono text-[10px] font-black text-sky-800 dark:text-sky-300 bg-sky-200/80 dark:bg-sky-500/20 px-1.5 rounded-sm">
                      {r.count} بلاغات
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 font-mono text-[12px] tabular-nums flex-wrap">
                  <span className="text-slate-500 dark:text-slate-400">عندنا</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {formatPrice(r.ourPriceNow ?? r.ourPriceAtReport)} ﷼
                  </span>
                  {movedSince && (
                    <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                      (كان {formatPrice(r.ourPriceAtReport)} وقت البلاغ — تغيّر بعده)
                    </span>
                  )}
                  {r.reportedPrice != null && (
                    <>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 dark:text-slate-400">قال الزائر</span>
                      <span className="font-black text-sky-700 dark:text-sky-300">
                        {formatPrice(r.reportedPrice)} ﷼
                      </span>
                    </>
                  )}
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
                {/* إعادة السحب فوراً — أسرع طريق للتأكّد قبل القرار */}
                <UpdateSingleButton id={r.componentId} name={r.componentName} />
                <button
                  onClick={() => close(r.id, false)}
                  disabled={pending || gone}
                  className="text-xs font-black px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors"
                >
                  صُحّح
                </button>
                <button
                  onClick={() => close(r.id, true)}
                  disabled={pending || gone}
                  className="text-xs font-black px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-colors"
                >
                  سليم
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
