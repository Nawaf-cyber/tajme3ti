'use client';

/* ============ واجهة كاتب الأوصاف ============
 *
 * خطوتان لا واحدة: تُختار القطع فتُكتب مسوّداتها، ثمّ تُقرأ فتُعتمد. وكلّ
 * مسوّدةٍ تُعرض **كاملةً وقابلةً للتحرير** — لأنّ المراجعة الحقيقيّة تعديلُ
 * سطرٍ لا قبولٌ أعمى، والنموذج يصف ما نعطيه لا ما هو صحيح.
 *
 * ⚠️ وما لم يجتز الحرّاس يُعرض بحمرةٍ ولا يُعتمد: رابطٌ ميتٌ في وصفٍ منشور
 * عطبٌ يراه الزائر ولا يراه أحدٌ منّا.
 */

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Item = { id: string; part: string; category: string; price: number; described?: boolean };
type Draft = {
  componentId: string;
  part: string;
  category?: string;
  description?: string;
  problems?: string[];
  cost?: number;
  error?: string;
};

export default function DescribeClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [meta, setMeta] = useState<{ model: string; hasKey: boolean; maxPerRun: number } | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [cost, setCost] = useState<{ usd: number; sar: number } | null>(null);
  /* ⚠️ لإعادة كتابة وصفٍ موجود — والاعتماد يستبدل نصّاً قد يكون بيدك */
  const [showAll, setShowAll] = useState(false);

  const load = (all = showAll) => {
    fetch('/api/admin/describe' + (all ? '?all=1' : ''))
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { toast.error(d.error); return; }
        setItems(d.items || []);
        setMeta({ model: d.model, hasKey: d.hasKey, maxPerRun: d.maxPerRun });
      })
      .catch(() => toast.error('تعذّر جلب القائمة'));
  };
  useEffect(() => { load(showAll); }, [showAll]);

  const toggle = (id: string) =>
    setPicked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const draft = async () => {
    if (!picked.size) { toast.error('لم تختر قطعاً'); return; }
    setBusy(true); setDrafts(null); setEdited({}); setCost(null);
    try {
      const res = await fetch('/api/admin/describe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'draft', componentIds: [...picked] }),
      });
      const d = await res.json();
      /* ⚠️ و`message` كذلك: حارس middleware يردّ قبل المسار بصيغةٍ أخرى */
      if (!res.ok) { toast.error(d.error || d.message || 'تعذّر التوليد'); return; }
      setDrafts(d.results || []);
      setCost({ usd: d.costUsd, sar: d.costSar });
      toast.success(`كُتبت ${d.drafted} مسوّدة · ${d.costSar}﷼`);
      if (d.overflow > 0) toast(`قُصّت ${d.overflow} — الطلب الواحد يسع ${d.maxPerRun}. كرّر.`, { icon: '⏱️', duration: 8000 });
    } catch { toast.error('خطأ في الاتصال'); }
    finally { setBusy(false); }
  };

  const textOf = (d: Draft) => edited[d.componentId] ?? d.description ?? '';
  /* المعتمَد: ما اجتاز الحرّاس، أو ما حرّرتَه أنت بيدك */
  const approvable = (d: Draft) => !!d.description && (!d.problems?.length || edited[d.componentId] !== undefined);

  const apply = async () => {
    const picks = (drafts || []).filter(approvable)
      .map((d) => ({ componentId: d.componentId, description: textOf(d) }));
    if (!picks.length) { toast.error('لا مسوّدة صالحة'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/describe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply', picks }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || d.message || 'تعذّر الاعتماد'); return; }
      toast.success(`اعتُمد ${d.added} وصفاً`);
      if (d.skipped?.length) toast(`تُخطّي ${d.skipped.length}: ${d.skipped[0]}`, { icon: '⚠️', duration: 6000 });
      setDrafts(null); setPicked(new Set()); load(showAll);
    } catch { toast.error('خطأ في الاتصال'); }
    finally { setBusy(false); }
  };

  const okCount = (drafts || []).filter(approvable).length;

  return (
    <div className="space-y-6">

      {/* ===== شريط الأدوات ===== */}
      <div className="bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm p-5 rounded-sm border-x border-b border-t-2 border-slate-200 border-t-cyan-500/70 dark:border-slate-800/80 dark:border-t-cyan-500/70 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={draft}
            disabled={busy || !picked.size || !meta?.hasKey}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-black rounded-sm transition-all active:scale-95 disabled:opacity-60 shadow-sm shadow-cyan-500/20"
          >
            {busy ? 'يكتب…' : picked.size ? `اكتب ${picked.size} وصفاً` : 'اختر قطعاً أوّلاً'}
          </button>
          <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400">
            {meta ? <>النموذج {meta.model} · حتى {meta.maxPerRun} في الطلب</> : 'يُحمَّل…'}
          </span>
          {/* ⚠️ غياب المفتاح يُقال صراحةً: زرٌّ معطَّلٌ بلا سبب يبدو عطلاً */}
          {meta && !meta.hasKey && (
            <span className="px-3 py-2 rounded-sm bg-red-500/10 text-red-600 dark:text-red-400 text-[12px] font-black">
              ⛔ لا ANTHROPIC_API_KEY في البيئة — أضفه لتشغيل الكاتب
            </span>
          )}
          {cost && (
            <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 tabular-nums" dir="ltr">
              ${cost.usd} ≈ {cost.sar}﷼
            </span>
          )}
        </div>
      </div>

      {/* ===== القطع ===== */}
      {!drafts && (
        <>
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input type="checkbox" checked={showAll} onChange={(e) => { setShowAll(e.target.checked); setPicked(new Set()); }} className="w-4 h-4 accent-cyan-600" />
          <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300">
            أظهر القطع الموصوفة أيضاً <span className="text-slate-400">(لإعادة كتابة وصفٍ ضعيف)</span>
          </span>
        </label>
        {items.length === 0 ? (
          <div className="p-6 text-center text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/[0.06] rounded-sm border border-emerald-500/30">
            ✔ كلّ قطعة في الكتالوج لها وصف.
          </div>
        ) : (
          <div className="bg-white/60 dark:bg-[#0F172A]/60 rounded-sm border border-slate-200 dark:border-slate-800">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[13px] font-black text-slate-700 dark:text-slate-200">
                {showAll ? 'كلّ القطع' : 'بلا وصف'} — {items.length}
              </span>
              <button
                onClick={() => setPicked((s) => s.size ? new Set() : new Set(items.slice(0, meta?.maxPerRun ?? 2).map((i) => i.id)))}
                className="text-[12px] font-black text-cyan-700 dark:text-cyan-400 hover:underline"
              >
                {picked.size ? 'ألغِ الاختيار' : `اختر أوّل ${meta?.maxPerRun ?? 2}`}
              </button>
            </div>
            <ul className="max-h-96 overflow-y-auto p-2 custom-scrollbar">
              {items.map((i) => (
                <li key={i.id}>
                  <label className="flex items-center gap-3 p-2.5 rounded-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <input type="checkbox" checked={picked.has(i.id)} onChange={() => toggle(i.id)} className="w-4 h-4 accent-cyan-600 shrink-0" />
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white flex-1 min-w-0 truncate">{i.part}</span>
                    {/* ⚠️ الموصوفة تُعلَّم: اعتمادُها يستبدل نصّاً موجوداً */}
                    {i.described && (
                      <span className="px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-black shrink-0">موصوفة</span>
                    )}
                    <span className="font-mono text-[11px] font-bold text-slate-400 shrink-0" dir="ltr">{i.category} · {Math.round(i.price)}﷼</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
        </>
      )}

      {/* ===== المسوّدات ===== */}
      {drafts && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={apply}
              disabled={busy || !okCount}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-sm transition-all active:scale-95 disabled:opacity-50"
            >
              اعتمد {okCount} وصفاً
            </button>
            <button onClick={() => { setDrafts(null); setCost(null); }} className="text-[13px] font-black text-slate-500 hover:underline">
              رجوع
            </button>
          </div>

          {drafts.map((d) => (
            <div key={d.componentId} className="bg-white/60 dark:bg-[#0F172A]/60 rounded-sm border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[13px] font-black text-slate-900 dark:text-white">{d.part}</span>
                {d.category && <span className="font-mono text-[11px] font-bold text-slate-400">{d.category}</span>}
                {d.cost !== undefined && <span className="font-mono text-[11px] text-slate-400" dir="ltr">${d.cost}</span>}
                {d.error && <span className="px-2 py-0.5 rounded-sm bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-black">فشل النداء</span>}
                {!!d.problems?.length && (
                  <span className="px-2 py-0.5 rounded-sm bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-black">
                    لم تجتز: {d.problems.join(' · ')}
                  </span>
                )}
                {d.description && !d.problems?.length && (
                  <span className="px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-black">✔ اجتازت</span>
                )}
              </div>

              {d.error ? (
                <p className="font-mono text-[11px] text-red-500 break-all" dir="ltr">{d.error}</p>
              ) : (
                <>
                  <textarea
                    value={textOf(d)}
                    onChange={(e) => setEdited((s) => ({ ...s, [d.componentId]: e.target.value }))}
                    rows={14}
                    className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 rounded-sm p-3 text-[13px] leading-relaxed font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                  {!!d.problems?.length && edited[d.componentId] === undefined && (
                    <p className="mt-1.5 text-[12px] font-bold text-red-600 dark:text-red-400">
                      لن تُعتمد حتى تُصلحها بيدك — عدّل النصّ أعلاه.
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
