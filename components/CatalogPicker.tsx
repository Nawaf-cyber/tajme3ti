'use client';

/* ============ منتقي قطعٍ من الكتالوج ============
 *
 * «مصدر ثانٍ» كان يعمل بالجملة فقط: اختر فئةً وعدداً، فيأخذ الأغلى سعراً
 * منها. وهذا يكفي للمسح الدوريّ ولا يكفي حين تعرف بعينها القطعةَ التي
 * تريد لها شاهداً ثانياً — كنتَ تُشغّل الفئة كلّها وتنتظر، أو ترفع الحدّ
 * حتى تصل إليها، وكلاهما يُنفق رصيد الوسيط على ما لا تريد.
 *
 * فهنا: اكتب فتُرشَّح ٣٠١ قطعة فوراً، وتُمرَّر القائمة، وتُختار واحدةٌ أو
 * أكثر.
 *
 * ⚠️ والترشيح محليٌّ لا بطلبٍ لكل حرف: الكتالوج ٤٥ كيلوبايت يُجلب مرّةً.
 * فالكتابة بلا تأخّرٍ ولا طلباتٍ متسابقة — والبديل ثلاثون طلباً لجملة.
 *
 * ⚠️ ويُعلَّم قبل الاختيار ما لا فائدة من اختياره: قطعةٌ عندها المتجر
 * المقصود أصلاً بحثُها هدرٌ للرصيد، وقطعةٌ بمصدرين لا تحتاج ثالثاً بإلحاح.
 * فالعلامة تسبق النقرة، لا تأتي بعدها في رسالة «تُخطّي».
 */

import { useEffect, useMemo, useRef, useState } from 'react';

export type CatalogItem = {
  id: string;
  name: string;
  brand: string;
  price: number | null;
  category: string;
  stores: string[];
};

/** يُرجى استدعاؤه مرّةً: يجلب الكتالوج المختصر عند أوّل حاجة */
export function useCatalog(enabled: boolean) {
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const asked = useRef(false);

  useEffect(() => {
    if (!enabled || asked.current) return;
    asked.current = true;
    setLoading(true);
    fetch('/api/admin/catalog')
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [enabled]);

  return { items, loading };
}

export default function CatalogPicker({
  items, loading, selected, onChange, storeSlug, category, max = 40,
}: {
  items: CatalogItem[] | null;
  loading: boolean;
  selected: string[];
  onChange: (ids: string[]) => void;
  /** المتجر المقصود — لتعليم ما عنده عرضٌ فيه أصلاً */
  storeSlug?: string;
  /** فئةٌ تُقدَّم في الترتيب (اختياريّ) */
  category?: string;
  max?: number;
}) {
  const [q, setQ] = useState('');

  const byId = useMemo(() => new Map((items || []).map((i) => [i.id, i])), [items]);

  const shown = useMemo(() => {
    const list = items || [];
    const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const hit = list.filter((it) => {
      const hay = (it.brand + ' ' + it.name + ' ' + it.category).toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
    /* ⚠️ الترتيب ليس أبجديّاً: ما ينقصه المتجر المقصود أوّلاً، ثم الأقلّ
       مصادر. فأوّل ما يراه الأدمن هو ما يحتاج العمل فعلاً. */
    return hit
      .sort((a, b) => {
        const aHas = storeSlug && a.stores.includes(storeSlug) ? 1 : 0;
        const bHas = storeSlug && b.stores.includes(storeSlug) ? 1 : 0;
        if (aHas !== bHas) return aHas - bHas;
        if (a.stores.length !== b.stores.length) return a.stores.length - b.stores.length;
        if (category && (a.category === category) !== (b.category === category)) {
          return a.category === category ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, 200);
  }, [items, q, storeSlug, category]);

  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else if (selected.length < max) onChange([...selected, id]);
  };

  const chip = 'px-2 py-0.5 rounded-sm text-[12px] font-black';

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث في كل القطع — بالاسم أو الماركة أو الفئة"
          className="flex-1 min-w-[240px] bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 rounded-sm px-3 py-2.5 text-[13px] font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40"
        />
        {selected.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="px-3 py-2.5 text-[12px] font-black text-slate-600 dark:text-slate-300 hover:underline"
          >
            امسح الاختيار ({selected.length})
          </button>
        )}
      </div>

      {/* المختارة — تبقى ظاهرةً ولو خرجت من الترشيح */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((id) => {
            const it = byId.get(id);
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className="px-2.5 py-1 rounded-sm bg-cyan-700 text-white text-[12px] font-black"
                title="أزل"
              >
                {it ? `${it.brand} ${it.name}` : id} ✕
              </button>
            );
          })}
        </div>
      )}

      <div className="max-h-72 overflow-y-auto rounded-sm border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#0B1120]">
        {loading && <div className="px-3 py-3 text-[12px] font-bold text-slate-500 dark:text-slate-400">…يُحمّل الكتالوج</div>}
        {!loading && shown.length === 0 && (
          <div className="px-3 py-3 text-[12px] font-bold text-slate-500 dark:text-slate-400">لا قطعة تطابق «{q}»</div>
        )}
        {shown.map((it) => {
          const on = selected.includes(it.id);
          const has = !!storeSlug && it.stores.includes(storeSlug);
          return (
            <button
              key={it.id}
              onClick={() => toggle(it.id)}
              className={`w-full text-right px-3 py-2 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/70 last:border-b-0 ${
                on ? 'bg-cyan-50 dark:bg-cyan-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span className="min-w-0 flex items-center gap-2">
                <span className={`shrink-0 w-4 h-4 rounded-sm border grid place-items-center text-[11px] font-black ${
                  on ? 'bg-cyan-700 border-cyan-700 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'
                }`}>✓</span>
                <span className="min-w-0 truncate text-[13px] font-bold text-slate-900 dark:text-white">
                  {it.brand} {it.name}
                </span>
              </span>
              <span className="shrink-0 flex items-center gap-2">
                {has && (
                  <span className={`${chip} bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300`}>
                    عندها {storeSlug}
                  </span>
                )}
                <span className={`${chip} ${
                  it.stores.length <= 1
                    ? 'bg-amber-500/[0.12] text-amber-700 dark:text-amber-400'
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400'
                }`}>
                  {it.stores.length === 0 ? 'بلا مصدر' : it.stores.length === 1 ? 'مصدرٌ واحد' : `${it.stores.length} مصادر`}
                </span>
                <span className="text-[12px] font-black text-slate-500 dark:text-slate-400 tabular-nums">
                  {it.price != null ? Math.round(it.price) : '—'}
                </span>
                <span className="text-[12px] font-bold text-slate-400 dark:text-slate-500 w-20 text-left">{it.category}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-1.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
        {selected.length > 0
          ? `تبحث في ${selected.length} قطعةً مختارة — الفئة والعدد يُتجاهلان.`
          : 'بلا اختيار: يمسح الفئة كلّها بالعدد المحدَّد.'}
      </p>
    </div>
  );
}
