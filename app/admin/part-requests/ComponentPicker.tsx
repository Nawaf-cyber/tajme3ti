'use client';

/* منتقي القطعة مع بحث — بديل عن <select> الذي يحوي مئات القطع فيصعب
   التمرير فيه. القيمة تُرسل عبر input مخفي باسم componentId نفسه، فلا
   يتغيّر شيء في الـ server action. */

import { useEffect, useMemo, useRef, useState } from 'react';
import { matchesSearch } from '../../../lib/part-request';

export type Comp = { id: string; label: string; category: string };

/* نعرض أول 60 نتيجة فقط — أكثر من ذلك لا يُقرأ، والبحث يضيّق القائمة أصلاً */
const MAX_RESULTS = 60;

export default function ComponentPicker({
  components,
  defaultValue,
  name = 'componentId',
}: {
  components: Comp[];
  defaultValue?: string;
  name?: string;
}) {
  const [value, setValue] = useState(defaultValue || '');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = components.find((c) => c.id === value) || null;

  const matches = useMemo(
    () => components.filter((c) => matchesSearch(`${c.label} ${c.category}`, query)),
    [components, query],
  );
  const results = matches.slice(0, MAX_RESULTS);

  // إغلاق عند النقر خارج المنتقي
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // إبقاء العنصر النشط ضمن مجال الرؤية أثناء التنقّل بالأسهم
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const pick = (id: string) => {
    setValue(id);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      setActive((i) => {
        const next = e.key === 'ArrowDown' ? i + 1 : i - 1;
        return Math.max(0, Math.min(results.length - 1, next));
      });
      return;
    }
    if (e.key === 'Enter' && open) {
      // Enter داخل القائمة يختار، لا يُرسل النموذج
      e.preventDefault();
      if (results[active]) pick(results[active].id);
    }
  };

  return (
    <div ref={boxRef} className="relative flex-1 min-w-0">
      <input type="hidden" name={name} value={value} />

      <input
        type="text"
        dir="auto"
        autoComplete="off"
        value={open ? query : selected ? `${selected.label} · ${selected.category}` : ''}
        placeholder={
          open && selected
            ? `المربوط حالياً: ${selected.label}`
            : '— ابحث واربط بقطعة فعلية (يفعّل زر البناء) —'
        }
        onFocus={() => { setQuery(''); setActive(0); setOpen(true); }}
        /* النقر يفتح أيضاً — لو أُغلقت القائمة والحقل ما زال مركّزاً، فلن
           يتكرّر حدث focus فيبقى المنتقي مغلقاً بلا سبب واضح للأدمن. */
        onClick={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setActive(0); setOpen(true); }}
        onKeyDown={onKeyDown}
        className="w-full p-2.5 pl-8 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-400 placeholder:text-[13px]"
      />

      {value && !open && (
        <button
          type="button"
          onClick={() => { setValue(''); setQuery(''); }}
          aria-label="إلغاء ربط القطعة"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          ✕
        </button>
      )}

      {open && (
        <ul
          ref={listRef}
          className="absolute z-30 mt-1 w-full max-h-64 overflow-auto bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1"
        >
          {selected && (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setValue(''); setQuery(''); setOpen(false); }}
                className="w-full text-right px-3 py-2 text-[11px] font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              >
                ✕ إلغاء الربط
              </button>
            </li>
          )}

          {results.length === 0 && (
            <li className="px-3 py-3 text-xs font-bold text-slate-400 text-center">لا توجد قطعة مطابقة</li>
          )}

          {results.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                data-idx={i}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(c.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-right transition-colors ${
                  i === active ? 'bg-cyan-50 dark:bg-cyan-900/20' : ''
                } ${c.id === value ? 'font-black text-cyan-700 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-200'}`}
              >
                <span className="truncate" dir="ltr">{c.label}</span>
                <span className="shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {c.category}
                </span>
              </button>
            </li>
          ))}

          {matches.length > results.length && (
            <li className="px-3 py-2 text-[11px] font-bold text-slate-400 text-center border-t border-slate-100 dark:border-slate-800">
              يُعرض {results.length} من {matches.length} — ضيّق البحث
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
