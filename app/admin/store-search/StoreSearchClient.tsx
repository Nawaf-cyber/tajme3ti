'use client';

/* ============ ابحث في المتاجر — واجهة الإدارة ============
 *
 * ⚠️ ولا تُكتب قائمة المتاجر هنا: تُجلب من `ADAPTERS` عبر المسار. نسختان
 * تتباعدان، فيظهر متجرٌ لا محرّك بحثٍ له — أو يبقى متجرٌ أُضيف مخفيّاً.
 *
 * ⚠️ وما هو عندنا يُعلَّم قبل النتائج لا بعدها: الأدمن يبحث ليضيف، فاكتشافُ
 * التكرار بعد الإضافة عملٌ يُهدر ومرجعٌ مكرَّر في الكتالوج.
 */

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { productImage } from '../../../lib/image';

type SourceMeta = { slug: string; label: string; needsProxy: boolean; note: string };

type Row = {
  title: string;
  url: string;
  price: number | null;
  currency: string | null;
  inStock: boolean | null;
  image: string | null;
  existing: { id: string; name: string } | null;
};

type Result = {
  label: string; query: string; found: number; hiddenSystems: number;
  read: number; creditsUsed: number; results: Row[];
};

export default function StoreSearchClient() {
  const [sources, setSources] = useState<SourceMeta[]>([]);
  const [hasToken, setHasToken] = useState(true);
  const [source, setSource] = useState('');
  const [query, setQuery] = useState('');
  const [withSystems, setWithSystems] = useState(false);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);

  useEffect(() => {
    fetch('/api/admin/store-search')
      .then((r) => r.json())
      .then((d) => {
        const list: SourceMeta[] = Array.isArray(d.sources) ? d.sources : [];
        setSources(list);
        setHasToken(!!d.hasToken);
        /* المجّانيّ مبدئيّاً — لا نبدأ بما يستهلك رصيداً */
        setSource((cur) => cur || (list.find((s) => !s.needsProxy) ?? list[0])?.slug || '');
      })
      .catch(() => {});
  }, []);

  const active = sources.find((s) => s.slug === source) || null;

  const run = async () => {
    if (busy || query.trim().length < 2) return;
    setBusy(true);
    setRes(null);
    try {
      const r = await fetch('/api/admin/store-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), source, withSystems }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || 'تعذّر البحث');
      setRes(d);
      if (!d.results.length) toast('لا نتائج لهذا البحث في ' + d.label);
    } catch (e: any) {
      toast.error(e?.message || 'تعذّر البحث');
    } finally {
      setBusy(false);
    }
  };

  const copy = (r: Row) => {
    const line = [r.title, r.url, r.price != null ? `${r.price} ${r.currency || ''}`.trim() : 'بلا سعر']
      .filter(Boolean).join('\n');
    navigator.clipboard?.writeText(line).then(
      () => toast.success('نُسخ الاسم والرابط والسعر'),
      () => toast.error('تعذّر النسخ'),
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
      <header className="mb-6">
        <h1 className="text-xl font-black text-slate-900 dark:text-white">ابحث في المتاجر</h1>
        <p className="mt-1 text-[13px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
          اكتب اسم قطعة فيبحث عنها في المتجر الذي تختاره، ويقرأ سعرها وتوفّرها من صفحتها.
          وما هو عندنا أصلاً يُعلَّم — فلا تضيفه مرّتين.
        </p>
      </header>

      {/* ===== شريط الأدوات ===== */}
      <div className="bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm p-5 rounded-sm border-x border-b border-t-2 border-slate-200 border-t-cyan-500/70 dark:border-slate-800/80 dark:border-t-cyan-500/70 shadow-sm">
        <label className="block text-[12px] font-black text-slate-600 dark:text-slate-400 mb-1.5">المتجر</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {sources.length === 0 && (
            <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400 py-2.5">يُحمَّل…</span>
          )}
          {sources.map((o) => {
            /* متجرٌ يحتاج وسيطاً والرمز غائب: يُعرض معطَّلاً مع السبب لا يُخفى */
            const blocked = o.needsProxy && !hasToken;
            return (
              <button
                key={o.slug}
                onClick={() => !blocked && setSource(o.slug)}
                disabled={blocked}
                title={blocked ? 'يحتاج SCRAPER_API_KEY غير المضبوط' : o.note}
                className={`px-4 py-2.5 rounded-sm text-[13px] font-black border transition-all active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed ${
                  source === o.slug
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

        <label className="block text-[12px] font-black text-slate-600 dark:text-slate-400 mb-1.5">
          ما الذي تبحث عنه؟
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
            placeholder="مثال: Thermalright Peerless Assassin"
            className="flex-1 min-w-[220px] px-4 py-2.5 rounded-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-[13px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            onClick={run}
            disabled={busy || query.trim().length < 2 || !source}
            className="px-6 py-2.5 rounded-sm bg-cyan-700 hover:bg-cyan-800 text-white text-[13px] font-black disabled:opacity-50 transition-colors"
          >
            {busy ? 'يبحث…' : 'ابحث'}
          </button>
        </div>

        <label className="mt-3 flex items-center gap-2 text-[12px] font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" checked={withSystems} onChange={(e) => setWithSystems(e.target.checked)} />
          أظهر الأجهزة الجاهزة والخوادم أيضاً
        </label>

        {active?.needsProxy && (
          /* الكلفة تُقال قبل الضغط لا بعده */
          <p className="mt-3 text-[12px] font-bold text-amber-700 dark:text-amber-400">
            ⚠️ {active.label} يمرّ عبر Scrape.do — البحث الواحد يكلّف طلباً، وكل نتيجةٍ تُقرأ تكلّف طلباً آخر.
          </p>
        )}
      </div>

      {/* ===== النتائج ===== */}
      {res && (
        <div className="mt-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3 text-[13px] font-bold text-slate-700 dark:text-slate-300">
            <span className="font-black text-slate-900 dark:text-white">{res.label}</span>
            <span>«{res.query}» — {res.found} نتيجة</span>
            {res.hiddenSystems > 0 && (
              <span className="text-slate-600 dark:text-slate-400">
                (أُخفيت {res.hiddenSystems} أجهزة جاهزة)
              </span>
            )}
            {res.creditsUsed > 0 && (
              <span className="text-amber-700 dark:text-amber-400">استُهلك ~{res.creditsUsed} رصيداً</span>
            )}
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800/70 border-y border-slate-100 dark:border-slate-800/70">
            {res.results.map((r) => (
              <li key={r.url} className={`flex items-center gap-3 px-2 py-3 ${r.existing ? 'opacity-60' : ''}`}>
                <div className="shrink-0 w-12 h-12 rounded-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
                  {r.image
                    ? <img src={productImage(r.image)} alt="" className="w-full h-full object-contain p-0.5" loading="lazy" />
                    : <div className="w-full h-full grid place-items-center text-[12px] text-slate-400">—</div>}
                </div>

                <div className="min-w-0 flex-1">
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="block text-[13px] font-black text-slate-900 dark:text-white hover:text-cyan-700 dark:hover:text-cyan-400 truncate"
                    title={r.title}>
                    {r.title}
                  </a>
                  <p className="mt-0.5 text-[12px] font-bold text-slate-600 dark:text-slate-400 truncate">
                    {r.existing ? (
                      <span className="text-slate-700 dark:text-slate-300">عندنا أصلاً: {r.existing.name}</span>
                    ) : r.inStock === false ? (
                      <span className="text-rose-700 dark:text-rose-400">نافد</span>
                    ) : r.price == null ? (
                      <span className="text-amber-700 dark:text-amber-400">بلا سعرٍ معلن</span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400">متوفّر</span>
                    )}
                  </p>
                </div>

                <div className="shrink-0 text-left font-mono text-[13px] font-black tabular-nums text-slate-900 dark:text-white" dir="ltr">
                  {r.price != null ? `${r.price.toLocaleString('en-US')} ${r.currency || ''}`.trim() : '—'}
                </div>

                {r.existing ? (
                  <a href={`/components/${r.existing.id}`} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 px-3 py-1.5 rounded-sm text-[12px] font-black border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-500">
                    افتحها
                  </a>
                ) : (
                  <button onClick={() => copy(r)}
                    className="shrink-0 px-3 py-1.5 rounded-sm text-[12px] font-black border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-400">
                    انسخ
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* ⚠️ ولا يُوعد بإضافةٍ بضغطة: القطعة تحتاج فئةً ومواصفاتٍ ووصفاً
              عربيّاً، ولا يُستخرج ذلك من صفحة متجرٍ استخراجاً موثوقاً. */}
          <p className="mt-4 text-[12px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
            «انسخ» يأخذ الاسم والرابط والسعر — ألصقها في نموذج إضافة القطعة.
            الإضافة تبقى بيدك لأن القطعة تحتاج فئةً ومواصفاتٍ ووصفاً لا تُقرأ من صفحة المتجر.
          </p>
        </div>
      )}
    </div>
  );
}
