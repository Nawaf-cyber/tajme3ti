'use client';

/* قائمة المتاجر: بطاقة لكل متجر بلونه وعدد قطعه، مع تعديل/إيقاف/حذف. */

import { useState } from 'react';
import toast from 'react-hot-toast';
import StoreForm, { type StoreRow } from './StoreForm';
import { toggleStore, deleteStore } from '../store-actions';
import { storeVars } from '../../../lib/stores';

const MODE_LABEL: Record<string, string> = {
  auto: 'تلقائي (JSON-LD/meta)',
  custom: 'محدّد CSS',
  native: 'محرّك مخصّص',
  off: 'بلا سحب',
};

export default function StoresClient({
  stores,
  counts,
}: {
  stores: StoreRow[];
  counts: Record<string, { total: number; withUrl: number }>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {!adding && !editingId && (
        <button
          onClick={() => setAdding(true)}
          className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-sm font-black text-slate-500 dark:text-slate-400 hover:border-cyan-500 hover:text-cyan-600 transition-colors"
        >
          + إضافة متجر جديد
        </button>
      )}

      {adding && <StoreForm onDone={() => setAdding(false)} />}

      {stores.map((s) => {
        const c = counts[s.id] || { total: 0, withUrl: 0 };
        if (editingId === s.id) return <StoreForm key={s.id} store={s} onDone={() => setEditingId(null)} />;

        return (
          <div
            key={s.id}
            style={storeVars(s.color)}
            className={`bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 border-r-4 border-r-[color:var(--store-color)] rounded-xl p-4 shadow-sm ${
              s.active ? '' : 'opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center font-black text-sm text-white"
                  style={{ backgroundColor: 'var(--store-color)' }}
                >
                  {s.latinName.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{s.name}</span>
                    <span className="font-mono text-[10px] text-slate-400" dir="ltr">{s.slug}</span>
                    {!s.active && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        موقوف
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                    {c.withUrl} قطعة مرتبطة · {MODE_LABEL[s.scrapeMode] || s.scrapeMode}
                    {s.premiumProxy && ' · بروكسي متقدّم'}
                    {s.affiliateId || s.usesDeepLinks ? ' · عمولة مفعّلة' : ' · بلا عمولة'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditingId(s.id)}
                  className="px-3 py-1.5 text-[11px] font-black rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-500 hover:text-cyan-600 transition-colors"
                >
                  تعديل
                </button>

                <form action={async (fd) => { await toggleStore(fd); toast.success(s.active ? 'أُوقف المتجر' : 'فُعّل المتجر'); }}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="px-3 py-1.5 text-[11px] font-black rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-500 hover:text-amber-600 transition-colors">
                    {s.active ? 'إيقاف' : 'تفعيل'}
                  </button>
                </form>

                <form
                  action={async (fd) => {
                    /* الحذف يمحو عروض هذا المتجر لكل القطع — نُظهر الرقم في
                       التأكيد كي لا يُحذف متجر عليه مئات الروابط بنقرة. */
                    if (!window.confirm(`حذف «${s.name}» نهائياً؟ سيُفقد ${c.total} عرض سعر مرتبط به.\nالإيقاف يخفيه بلا فقدان بيانات.`)) return;
                    await deleteStore(fd);
                    toast.success('حُذف المتجر');
                  }}
                >
                  <input type="hidden" name="id" value={s.id} />
                  <button className="px-3 py-1.5 text-[11px] font-black rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                    حذف
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
