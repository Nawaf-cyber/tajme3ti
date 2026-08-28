'use client';

/* ============ صفحة «ابحث عن مصدرٍ ثانٍ» ============
 *
 * خطوتان لا واحدة: يبحث فيعرض، ثم تُقرّ فيُكتب. والفصل مقصود — المطابق
 * أخطأ ثلاث مرّاتٍ في التطوير (قَبِل 9950X3D مكان 9950X، ولابتوباً مكان
 * معالج)، وكتابةٌ بلا مراجعة تعني سعرَ منتجٍ آخر على قطعتنا.
 *
 * وكل سطرٍ يُظهر ما يكفي للحكم: اسم قطعتنا، وعنوان المرشّح كاملاً (فيه
 * رمز الطراز)، ورابطه لمن أراد أن يفتح ويتأكّد.
 */

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Row = {
  componentId: string;
  part: string;
  category: string;
  currentPrice: number;
  currentStore: string | null;
  query: string;
  candidateCount: number;
  match: { title: string; url: string; price: number | null } | null;
  nearest: string | null;
};

const CATEGORIES = ['GPU', 'RAM', 'Motherboard', 'CPU', 'Storage', 'PSU', 'Case', 'Cooler'];

type SourceMeta = { slug: string; label: string; needsProxy: boolean; note: string };

export default function FindSourcesClient() {
  /* ⚠️ القائمة تُجلب من السجلّ ولا تُكتب هنا: نسختان تتباعدان، فيظهر للأدمن
     متجرٌ لا محرّك بحثٍ له — أو يبقى متجرٌ أُضيف مخفيّاً بلا سبب ظاهر. */
  const [sources, setSources] = useState<SourceMeta[]>([]);
  const [hasToken, setHasToken] = useState(true);
  const [source, setSource] = useState<string>('');
  const [category, setCategory] = useState<string>('GPU');
  const [limit, setLimit] = useState(15);

  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const active = sources.find((s) => s.slug === source) || null;
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [used, setUsed] = useState(0);

  useEffect(() => {
    fetch('/api/admin/find-sources')
      .then((r) => r.json())
      .then((d) => {
        const list: SourceMeta[] = Array.isArray(d.sources) ? d.sources : [];
        setSources(list);
        setHasToken(!!d.hasToken);
        /* أوّل متجرٍ مجّاني هو المبدئيّ — لا نبدأ بما يستهلك رصيداً */
        setSource((cur) => cur || (list.find((s) => !s.needsProxy) ?? list[0])?.slug || '');
      })
      .catch(() => {});
  }, []);

  const search = async () => {
    setBusy(true);
    setRows(null);
    setChosen(new Set());
    try {
      const res = await fetch('/api/admin/find-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', source, category, limit }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || 'تعذّر البحث'); return; }
      setRows(d.results);
      setUsed(d.creditsUsed || 0);
      /* كل مطابقٍ يُعلَّم مبدئياً — والمراجعة إزالةٌ لا إضافة، فهي أسرع */
      setChosen(new Set(d.results.filter((r: Row) => r.match).map((r: Row) => r.componentId)));
      toast.success(`فُحصت ${d.scanned} قطعة · ${d.matched} مطابقاً`);
    } catch { toast.error('خطأ في الاتصال'); }
    finally { setBusy(false); }
  };

  const apply = async () => {
    const picks = (rows || [])
      .filter((r) => r.match && chosen.has(r.componentId))
      .map((r) => ({ componentId: r.componentId, url: r.match!.url, source }));
    if (!picks.length) { toast.error('لم تختر شيئاً'); return; }

    setBusy(true);
    try {
      const res = await fetch('/api/admin/find-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply', picks }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || 'تعذّر الاعتماد'); return; }
      toast.success(`أُضيف ${d.added} عرضاً — السعر يملؤه تحديث الأسعار`);
      if (d.skipped?.length) toast(`تُخطّي ${d.skipped.length}: ${d.skipped[0]}`, { icon: '⚠️', duration: 6000 });
      setRows((prev) => (prev || []).filter((r) => !picks.some((p) => p.componentId === r.componentId)));
    } catch { toast.error('خطأ في الاتصال'); }
    finally { setBusy(false); }
  };

  const toggle = (id: string) =>
    setChosen((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const matched = (rows || []).filter((r) => r.match);
  const missed = (rows || []).filter((r) => !r.match);

  return (
    <div className="space-y-6">

      {/* ===== شريط الأدوات ===== */}
      <div className="bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm p-5 rounded-sm border-x border-b border-t-2 border-slate-200 border-t-cyan-500/70 dark:border-slate-800/80 dark:border-t-cyan-500/70 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">

          <div>
            <label className="block text-[12px] font-black text-slate-500 dark:text-slate-400 mb-1.5">المتجر</label>
            <div className="flex gap-2">
              {sources.length === 0 && (
                <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 py-2.5">يُحمَّل…</span>
              )}
              {sources.map((o) => {
                /* متجرٌ يحتاج وسيطاً والرمز غائب: يُعرض معطَّلاً مع السبب،
                   لا يُخفى — إخفاؤه يجعل غيابه لغزاً. */
                const blocked = o.needsProxy && !hasToken;
                return (
                  <button
                    key={o.slug}
                    onClick={() => !blocked && setSource(o.slug)}
                    disabled={blocked}
                    title={blocked ? 'يحتاج SCRAPER_API_KEY غير المضبوط' : o.note}
                    className={`px-4 py-2.5 rounded-sm text-[13px] font-black border transition-all active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed ${
                      source === o.slug
                        /* ⚠️ cyan-500 بنصٍّ أبيض = ٢٫٣٧ فقط، والسطر تحته ١٫٩٧ — دون
                           AA بكثير. cyan-700 يرفعه فوق ٤٫٥ ويبقي اللون هويّةً. */
                        ? 'bg-cyan-700 text-white border-cyan-700 shadow-sm shadow-cyan-700/30'
                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60'
                    }`}
                  >
                    {o.label}
                    <span className={`block text-[12px] font-bold ${source === o.slug ? 'text-cyan-50' : 'text-slate-500 dark:text-slate-400'}`}>
                      {blocked ? 'بلا رمز' : o.note}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-black text-slate-500 dark:text-slate-400 mb-1.5">الفئة</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 rounded-sm px-3 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-black text-slate-500 dark:text-slate-400 mb-1.5">كم قطعة</label>
            <input
              type="number" min={1} max={40} value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-24 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 rounded-sm px-3 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          <button
            onClick={search}
            disabled={busy}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-black rounded-sm transition-all active:scale-95 disabled:opacity-60 shadow-sm shadow-cyan-500/20"
          >
            {busy ? 'جارٍ…' : 'ابحث'}
          </button>
        </div>

        <p className="mt-3.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
          البحث لا يكتب شيئاً. كازاسوق يمرّ عبر Scrape.do فيستهلك طلباً لكل قطعة؛ مايكرولس مباشر بلا رصيد.
          {used > 0 && <span className="text-amber-600 dark:text-amber-400 font-black"> · استُهلك {used} طلباً</span>}
        </p>
      </div>

      {/* ===== النتائج ===== */}
      {rows && (
        <>
          {matched.length > 0 ? (
            <div className="bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm rounded-sm border-x border-b border-t-2 border-slate-200 border-t-emerald-500/70 dark:border-slate-800/80 shadow-sm overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  مطابقات مقترحة — {chosen.size} من {matched.length} مختارة
                </h2>
                <button
                  onClick={apply}
                  disabled={busy || chosen.size === 0}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-black rounded-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  اعتمد المختار ({chosen.size})
                </button>
              </div>

              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {matched.map((r) => (
                  <li key={r.componentId} className="p-4 flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={chosen.has(r.componentId)}
                      onChange={() => toggle(r.componentId)}
                      className="mt-1 w-4 h-4 accent-emerald-600 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-black text-slate-900 dark:text-white">{r.part}</span>
                        <span className="font-mono text-[11px] font-bold text-slate-400" dir="ltr">
                          {Math.round(r.currentPrice)} ﷼ · {r.currentStore}
                        </span>
                      </div>
                      {/* العنوان كاملاً: فيه رمز الطراز، وعليه يقوم الحكم */}
                      <p className="mt-1.5 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 leading-relaxed break-words">
                        {r.match!.title}
                      </p>
                      <a
                        href={r.match!.url} target="_blank" rel="noopener noreferrer"
                        className="mt-1 inline-block font-mono text-[10px] text-slate-400 hover:text-cyan-500 underline break-all"
                        dir="ltr"
                      >
                        {r.match!.url.slice(0, 100)}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-6 text-center text-sm font-bold text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-[#0F172A]/60 rounded-sm border border-slate-200 dark:border-slate-800">
              لا مطابق في هذه الدفعة.
            </div>
          )}

          {/* ما لم يُطابق — يُعرض كي لا يبدو البحث صامتاً */}
          {missed.length > 0 && (
            <details className="bg-white/50 dark:bg-[#0F172A]/50 rounded-sm border border-slate-200 dark:border-slate-800 p-4">
              <summary className="text-[13px] font-black text-slate-600 dark:text-slate-300 cursor-pointer">
                بلا مطابق — {missed.length} قطعة
              </summary>
              <ul className="mt-3 space-y-2">
                {missed.map((r) => (
                  <li key={r.componentId} className="text-[12px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{r.part}</span>
                    <span className="text-slate-400 font-mono text-[10px]"> · سُئل «{r.query}» · {r.candidateCount} مرشّحاً</span>
                    {r.nearest && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">أقربها: {r.nearest.slice(0, 100)}</p>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}
