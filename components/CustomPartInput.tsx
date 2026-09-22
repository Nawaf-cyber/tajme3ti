'use client';

/* ============ قطعةٌ أملكها وليست عندكم ============
 *
 * ⚠️ ولا يُعرض الحقل ابتداءً: يظهر تحت الفتحات **الفارغة** وحدها، وبعد
 * أن يضغط «اكتبها». وأكثرُ «ما لقيتها» بحثٌ فاشل لا قطعةٌ ناقصة، فالحارس
 * الحقيقيّ في الخادم — يطابق ما كتبه بالكتالوج ويردّ «تقصد هذي؟» قبل أن
 * يحفظ نصّاً لقطعةٍ نملكها.
 *
 * ⚠️ ويُقال له ما يخسره: قطعةٌ بلا معرّف = بلا سعر، ولا تنبيه، ولا فحص
 * توافق. وبلا هذا السطر يضعف جواب «هل يناسب جهازي؟» بلا أن يدري لماذا.
 */

import { useState } from 'react';
import toast from 'react-hot-toast';
import { productImage, IMAGE_FALLBACK } from '../lib/image';
import { formatPrice } from '../lib/price';

type Suggest = { id: string; brand: string; name: string; imageUrl: string | null; price: number | null };

export default function CustomPartInput({
  category,
  label,
  value,
  onSaved,
  onPickExisting,
}: {
  category: string;
  label: string;
  value?: string;
  onSaved: (customParts: Record<string, string>) => void;
  onPickExisting: (componentId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ?? '');
  const [busy, setBusy] = useState(false);
  const [suggest, setSuggest] = useState<Suggest | null>(null);

  const send = async (force: boolean) => {
    setBusy(true);
    setSuggest(null);
    try {
      const res = await fetch('/api/rig/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, text, force }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.message || 'فشل');

      if (d.suggest) { setSuggest(d.suggest); return; }

      onSaved(d.customParts ?? {});
      setOpen(false);
      toast.success(text ? 'أُضيفت إلى جهازك' : 'حُذفت');
    } catch (e: any) {
      toast.error(e?.message || 'تعذّر الحفظ');
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-[10.5px] font-bold text-slate-400 dark:text-slate-500 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors text-start"
      >
        {value ? '✍️ عدّلها' : '✍️ اكتبها بنفسك'}
      </button>
    );
  }

  return (
    <div className="col-span-2 sm:col-span-4 p-3 rounded-sm border border-dashed border-cyan-400/60 dark:border-cyan-700/50 bg-white/70 dark:bg-slate-900/60">
      <p className="text-[11px] font-black text-slate-600 dark:text-slate-300 mb-2">
        {label} — اكتب ما تملكه
      </p>

      <div className="flex flex-wrap gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !busy) send(false); }}
          placeholder="مثال: GTX 1060 6GB"
          autoFocus
          className="flex-1 min-w-[180px] px-3 py-2 rounded-sm text-[12.5px] font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={() => send(false)}
          disabled={busy || !text.trim()}
          className="px-3 py-2 rounded-sm text-[12px] font-black bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-colors"
        >
          احفظ
        </button>
        {value && (
          <button
            onClick={() => { setText(''); setTimeout(() => send(true), 0); }}
            disabled={busy}
            className="px-3 py-2 rounded-sm text-[12px] font-bold text-rose-600 dark:text-rose-400 border border-slate-300 dark:border-slate-700 hover:border-rose-400 transition-colors"
          >
            احذفها
          </button>
        )}
        <button
          onClick={() => { setOpen(false); setSuggest(null); }}
          className="px-3 py-2 rounded-sm text-[12px] font-bold text-slate-500 dark:text-slate-400"
        >
          إلغاء
        </button>
      </div>

      {/* ============ «تقصد هذي؟» ============ */}
      {suggest && (
        <div className="mt-3 p-2.5 rounded-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40">
          <p className="text-[11.5px] font-black text-emerald-800 dark:text-emerald-300 mb-2">
            عندنا هذي — تقصدها؟ باختيارها تحصل على سعرها وفحص توافقها.
          </p>
          <div className="flex items-center gap-2.5">
            <img
              src={productImage(suggest.imageUrl, IMAGE_FALLBACK)}
              alt=""
              className="w-9 h-9 object-contain rounded-sm bg-white shrink-0 p-0.5"
            />
            <div className="min-w-0 flex-1">
              <span className="block text-[12px] font-black text-slate-800 dark:text-slate-100 truncate">
                {suggest.brand} {suggest.name}
              </span>
              {suggest.price != null && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatPrice(suggest.price)} ﷼
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-2.5">
            <button
              onClick={() => { onPickExisting(suggest.id); setOpen(false); setSuggest(null); }}
              className="flex-1 px-3 py-1.5 rounded-sm text-[11.5px] font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              نعم، هذي هي
            </button>
            <button
              onClick={() => send(true)}
              disabled={busy}
              className="px-3 py-1.5 rounded-sm text-[11.5px] font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
            >
              لا، احفظ ما كتبتُه
            </button>
          </div>
        </div>
      )}

      <p className="mt-2.5 text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
        ✍️ قطعةٌ تكتبها بنفسك: نعرضها في جهازك، ولا نستطيع تتبّع سعرها ولا فحص توافقها.
      </p>
    </div>
  );
}
