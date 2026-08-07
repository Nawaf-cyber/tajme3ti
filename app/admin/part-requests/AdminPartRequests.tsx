'use client';

/* إدارة طلبات القطع: تغيير الحالة + ربط القطعة الفعلية. كل صف نموذج
   server action مستقل، فالحفظ فوري بلا حالة عميل معقّدة. */

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { updatePartRequest, deletePartRequest, replyToPartRequest } from '../actions';
import Requesters, { type Requester, type RemovedRequester } from './Requesters';
import { STATUS_META, STATUS_ORDER, matchesSearch, type PartStatus } from '../../../lib/part-request';
import ComponentPicker, { type Comp } from './ComponentPicker';

export type Msg = {
  body: string;
  fromAdmin: boolean;
  author: string | null;
  at: string;
  unread: boolean;
};

type Row = {
  id: string;
  name: string;
  status: PartStatus;
  count: number;
  createdAt: string;
  component: { id: string; label: string } | null;
  messages: Msg[];
  isNew: boolean;
  people: Requester[];
  anonymous: number;
  removed: RemovedRequester[];
  categoryName: string | null;
  allRemoved: boolean;
  someRemoved: boolean;
};

/** مرشّحات الحذف — تُضاف بجانب مرشّحات الحالة */
type Filter = PartStatus | 'ALL' | 'REMOVED_ALL' | 'REMOVED_SOME';

export default function AdminPartRequests({ data, components }: { data: Row[]; components: Comp[] }) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Filter>('ALL');
  /* الترتيب: الأكثر طلباً افتراضياً (يوجّه الأولويات)، أو الأحدث حين
     يهمّك ما وصل للتوّ. المحذوفة كلياً تبقى في القاع في الحالتين. */
  const [sortBy, setSortBy] = useState<'demand' | 'newest'>('demand');

  /* البحث يشمل اسم الطلب والقطعة المربوطة به — فتقدر تلقى الطلب
     سواء تذكّرت الاسم الذي كتبه المستخدم أو اسم القطعة عندنا. */
  const filtered = useMemo(
    () =>
      data.filter((r) => {
        const passFilter =
          statusFilter === 'ALL' ? true
          : statusFilter === 'REMOVED_ALL' ? r.allRemoved
          : statusFilter === 'REMOVED_SOME' ? r.someRemoved
          : r.status === statusFilter;
        return passFilter && matchesSearch(`${r.name} ${r.component?.label || ''}`, query);
      }),
    [data, query, statusFilter],
  );

  const ordered = useMemo(() => {
    const rows = [...filtered];
    rows.sort((a, b) => {
      const aDead = a.allRemoved ? 1 : 0;
      const bDead = b.allRemoved ? 1 : 0;
      if (aDead !== bDead) return aDead - bDead;
      if (sortBy === 'newest') return +new Date(b.createdAt) - +new Date(a.createdAt);
      return b.count - a.count || +new Date(b.createdAt) - +new Date(a.createdAt);
    });
    return rows;
  }, [filtered, sortBy]);

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
  const removedAllCount = data.filter((r) => r.allRemoved).length;
  const removedSomeCount = data.filter((r) => r.someRemoved).length;

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
          {/* مرشّحا الحذف — يفصلان "انسحب الجميع" عن "انسحب بعضهم" */}
          {removedSomeCount > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'REMOVED_SOME' ? 'ALL' : 'REMOVED_SOME')}
              title="طلبها أكثر من شخص، وأزالها بعضهم وبقي غيرهم"
              className={`text-[11px] font-black px-2.5 py-1.5 rounded-lg border transition-colors ${
                statusFilter === 'REMOVED_SOME'
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 hover:border-amber-500'
              }`}
            >
              ◐ حُذف بعضها ({removedSomeCount})
            </button>
          )}
          {removedAllCount > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'REMOVED_ALL' ? 'ALL' : 'REMOVED_ALL')}
              title="أزالها كل من طلبها — لم يبقَ لها صاحب"
              className={`text-[11px] font-black px-2.5 py-1.5 rounded-lg border transition-colors ${
                statusFilter === 'REMOVED_ALL'
                  ? 'bg-slate-600 border-slate-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-500'
              }`}
            >
              ✕ حُذفت كلياً ({removedAllCount})
            </button>
          )}

          {(query || statusFilter !== 'ALL') && (
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-auto tabular-nums">
              {filtered.length} من {data.length}
            </span>
          )}
        </div>
      </div>

      {/* مبدّل الترتيب */}
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-[11px] font-black text-slate-400 dark:text-slate-500">الترتيب:</span>
        {([
          { k: 'demand' as const, t: 'الأكثر طلباً' },
          { k: 'newest' as const, t: 'الأحدث' },
        ]).map((o) => (
          <button
            key={o.k}
            type="button"
            onClick={() => setSortBy(o.k)}
            className={`text-[11px] font-black px-2.5 py-1 rounded-lg border transition-colors ${
              sortBy === o.k
                ? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-200 dark:border-slate-200 dark:text-slate-900'
                : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400'
            }`}
          >
            {o.t}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">لا يوجد طلب يطابق البحث.</p>
        </div>
      )}

      {ordered.map((r, idx) => {
        const meta = STATUS_META[r.status];
        return (
          <div
            key={r.id}
            className={`bg-white dark:bg-[#0F172A] border rounded-xl p-4 shadow-sm transition-opacity ${
              r.allRemoved
                ? 'border-slate-200 dark:border-slate-800 opacity-60'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            {/* الرأس: الاسم + العدّاد + الحالة الحالية */}
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* رقم الترتيب — مرجع سريع تشير إليه */}
                <span className="shrink-0 font-mono text-[11px] font-black text-slate-300 dark:text-slate-600 tabular-nums w-5 text-left">
                  {idx + 1}
                </span>
                <span
                  className={`shrink-0 flex items-center justify-center min-w-[44px] h-9 px-2 rounded-lg font-black text-sm tabular-nums border ${
                    r.count === 0
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                      : 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/40'
                  }`}
                  title="عدد الطلبات القائمة"
                >
                  {r.count}
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white break-words" dir="ltr">{r.name}</span>
                {r.isNew && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-500 text-white">
                    جديد
                  </span>
                )}
                {r.categoryName && (
                  <span className="shrink-0 inline-flex items-center text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono uppercase tracking-wider" title="النوع الذي حدّده المقترِح">
                    {r.categoryName}
                  </span>
                )}
                {r.allRemoved && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-500 text-white" title="أزالها كل من طلبها">
                    ✕ حُذفت كلياً
                  </span>
                )}
                {r.someRemoved && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-white" title="أزالها بعض من طلبها">
                    ◐ حُذف بعضها
                  </span>
                )}
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-md border ${meta.badge}`}>
                {meta.icon} {meta.label}
              </span>
            </div>

            {/* من طلبها — تعرف بمن تتحدّث قبل أن تسأل */}
            <Requesters people={r.people} anonymous={r.anonymous} removed={r.removed} />

            {/* المحادثة — أخذٌ وردّ في نفس المربّع */}
            {r.messages.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {r.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.fromAdmin ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-lg text-[12px] font-bold leading-relaxed ${
                        m.fromAdmin
                          ? 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-900/50'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className="block text-[9px] font-black opacity-60 mb-0.5">
                        {m.fromAdmin ? 'أنت' : m.author || 'صاحب الطلب'}
                        {m.unread && <span className="mr-1.5 text-rose-500">● جديد</span>}
                      </span>
                      {m.body}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ردّ/استيضاح يصل صاحب الطلب في «تجميعاتي» */}
            <form
              action={async (fd) => {
                try {
                  await replyToPartRequest(fd);
                  toast.success('أُرسل الردّ لصاحب الطلب');
                } catch {
                  toast.error('فشل إرسال الردّ');
                }
              }}
              className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mt-3 mb-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700"
            >
              <input type="hidden" name="id" value={r.id} />
              <input
                name="adminNote"
                defaultValue=""
                placeholder="اسأله أو ردّ عليه — مثال: أي شركة تقصد؟ (Corsair · G.Skill · Kingston)"
                maxLength={400}
                className="flex-1 p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-black rounded-lg transition-colors shrink-0"
              >
                💬 أرسل
              </button>
            </form>

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

              {/* المقترِح حدّد النوع → نضيّق المنتقي عليه، فالربط أسرع وأدقّ */}
              <ComponentPicker
                components={r.categoryName ? components.filter((c) => c.category === r.categoryName) : components}
                defaultValue={r.component?.id || ''}
              />

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
