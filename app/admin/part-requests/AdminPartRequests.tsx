'use client';

/* إدارة طلبات القطع: تغيير الحالة + ربط القطعة الفعلية. كل صف نموذج
   server action مستقل، فالحفظ فوري بلا حالة عميل معقّدة. */

import { useState } from 'react';
import toast from 'react-hot-toast';
import { updatePartRequest, deletePartRequest } from '../actions';
import { STATUS_META, STATUS_ORDER, type PartStatus } from '../../../lib/part-request';

type Row = {
  id: string;
  name: string;
  status: PartStatus;
  count: number;
  createdAt: string;
  component: { id: string; label: string } | null;
};
type Comp = { id: string; label: string; category: string };

export default function AdminPartRequests({ data, components }: { data: Row[]; components: Comp[] }) {
  const [savingId, setSavingId] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">لا توجد طلبات بعد.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((r) => {
        const meta = STATUS_META[r.status];
        return (
          <div key={r.id} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            {/* الرأس: الاسم + العدّاد + الحالة الحالية */}
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 flex items-center justify-center min-w-[44px] h-9 px-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 font-black text-sm tabular-nums border border-cyan-200 dark:border-cyan-800/40" title="عدد الطلبات">
                  {r.count}
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white break-words" dir="ltr">{r.name}</span>
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-md border ${meta.badge}`}>
                {meta.icon} {meta.label}
              </span>
            </div>

            {/* النموذج: الحالة + ربط القطعة + حفظ */}
            <form
              action={async (fd) => {
                setSavingId(r.id);
                try {
                  await updatePartRequest(fd);
                  toast.success('تم الحفظ');
                } catch {
                  toast.error('فشل الحفظ');
                } finally {
                  setSavingId(null);
                }
              }}
              className="flex flex-col md:flex-row gap-2 items-stretch md:items-center"
            >
              <input type="hidden" name="id" value={r.id} />

              <select
                name="status"
                defaultValue={r.status}
                className="p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500 min-w-[150px]"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{STATUS_META[s].icon} {STATUS_META[s].label}</option>
                ))}
              </select>

              <select
                name="componentId"
                defaultValue={r.component?.id || ''}
                className="flex-1 p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                dir="ltr"
              >
                <option value="">— اربط بقطعة فعلية (يفعّل زر البناء) —</option>
                {components.map((c) => (
                  <option key={c.id} value={c.id}>{c.label} · {c.category}</option>
                ))}
              </select>

              <button
                type="submit"
                disabled={savingId === r.id}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-black rounded-lg transition-colors disabled:opacity-50"
              >
                {savingId === r.id ? '...' : 'حفظ'}
              </button>
            </form>

            {/* حذف */}
            <form
              action={async (fd) => {
                if (!window.confirm(`حذف طلب "${r.name}"؟`)) return;
                try { await deletePartRequest(fd); toast.success('حُذف'); }
                catch { toast.error('فشل الحذف'); }
              }}
              className="mt-2 text-left"
            >
              <input type="hidden" name="id" value={r.id} />
              <button type="submit" className="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:underline">حذف الطلب</button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
