'use client';

/* إدارة طلبات القطع: تغيير الحالة + ربط القطعة الفعلية. كل صف نموذج
   server action مستقل، فالحفظ فوري بلا حالة عميل معقّدة. */

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { updatePartRequest, deletePartRequest } from '../actions';
import { STATUS_META, STATUS_ORDER, matchesSearch, type PartStatus } from '../../../lib/part-request';
import ComponentPicker, { type Comp } from './ComponentPicker';

type Row = {
  id: string;
  name: string;
  status: PartStatus;
  count: number;
  createdAt: string;
  component: { id: string; label: string } | null;
};

export default function AdminPartRequests({ data, components }: { data: Row[]; components: Comp[] }) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PartStatus | 'ALL'>('ALL');

  /* البحث يشمل اسم الطلب والقطعة المربوطة به — فتقدر تلقى الطلب
     سواء تذكّرت الاسم الذي كتبه المستخدم أو اسم القطعة عندنا. */
  const filtered = useMemo(
    () =>
      data.filter(
        (r) =>
          (statusFilter === 'ALL' || r.status === statusFilter) &&
          matchesSearch(`${r.name} ${r.component?.label || ''}`, query),
      ),
    [data, query, statusFilter],
  );

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">لا توجد طلبات بعد.</p>
      </div>
    );
  }

  const counts = STATUS_ORDER.reduce(
    (acc, s) => ({ ...acc, [s]: data.filter((r) => r.status === s).length }),
    {} as Record<PartStatus, number>,
  );

  return (
    <div className="space-y-3">
      {/* شريط البحث + تصفية بالحالة */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm space-y-3">
        <div className="relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">🔍</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم القطعة المطلوبة أو القطعة المربوطة…"
            className="w-full py-2.5 pr-9 pl-9 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500 placeholder:font-semibold placeholder:text-slate-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="مسح البحث"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(['ALL', ...STATUS_ORDER] as const).map((s) => {
            const active = statusFilter === s;
            const label = s === 'ALL' ? `الكل (${data.length})` : `${STATUS_META[s].icon} ${STATUS_META[s].label} (${counts[s]})`;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`text-[11px] font-black px-2.5 py-1.5 rounded-lg border transition-colors ${
                  active
                    ? 'bg-cyan-600 border-cyan-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-400'
                }`}
              >
                {label}
              </button>
            );
          })}
          {(query || statusFilter !== 'ALL') && (
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-auto tabular-nums">
              {filtered.length} من {data.length}
            </span>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">لا يوجد طلب يطابق البحث.</p>
        </div>
      )}

      {filtered.map((r) => {
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

              <ComponentPicker components={components} defaultValue={r.component?.id || ''} />

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
