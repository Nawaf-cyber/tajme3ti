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

type Draft = {
  category: string | null; brand: string; name: string;
  price: number | null; currency: string | null; url: string;
  imageUrl: string | null; storeSlug: string;
  tdpWattage: number; performanceTier: number;
  specs: Record<string, string>; description: string;
  origins: Record<string, 'read' | 'guess' | 'empty'>;
  missing: string[];
};

type Result = {
  label: string; query: string; found: number; hiddenSystems: number;
  read: number; creditsUsed: number; results: Row[];
};

const INPUT = 'w-full px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-[13px] font-bold text-slate-900 dark:text-white';

function Field({ label, hint, hintClass, children }: {
  label: string; hint?: string; hintClass?: string; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block mb-1 text-[12px] font-black text-slate-700 dark:text-slate-300">
        {label}
        {hint ? <span className={`mr-1.5 font-bold ${hintClass || 'text-slate-600 dark:text-slate-400'}`}>· {hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export default function StoreSearchClient() {
  const [sources, setSources] = useState<SourceMeta[]>([]);
  const [hasToken, setHasToken] = useState(true);
  const [source, setSource] = useState('');
  const [query, setQuery] = useState('');
  const [withSystems, setWithSystems] = useState(false);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  /* المسودّة: تُبنى في الخادم ثم تُعدَّل هنا، والنقص يُعاد حسابه مع كل ضغطة */
  const [draft, setDraft] = useState<Draft | null>(null);
  const [cats, setCats] = useState<string[]>([]);
  const [required, setRequired] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

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

  /* المسودّة تُبنى في الخادم: التخمين والحقول المطلوبة منطقٌ واحدٌ لا يُنسخ */
  const openDraft = async (r: Row) => {
    setSaving(false);
    try {
      const res2 = await fetch('/api/admin/store-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'draft', title: r.title, url: r.url, price: r.price,
          currency: r.currency, image: r.image, source,
        }),
      });
      const d = await res2.json();
      if (!res2.ok) throw new Error(d?.error || 'تعذّر بناء المسودّة');
      setDraft(d.draft);
      setCats(d.categories || []);
      setRequired(d.requiredSpecs || {});
    } catch (e: any) {
      toast.error(e?.message || 'تعذّر بناء المسودّة');
    }
  };

  /* النقص يُحسب هنا أيضاً لتعطيل الزرّ فوراً — والخادم يُعيده قبل الكتابة */
  const missingNow = (d: Draft): string[] => {
    const out: string[] = [];
    if (!d.category) out.push('الفئة');
    if (!d.brand?.trim()) out.push('الماركة');
    if (!d.name?.trim()) out.push('الاسم');
    if (!(Number(d.price) > 0)) out.push('السعر');
    if (d.category) {
      for (const k of required[d.category] || []) if (!String(d.specs?.[k] ?? '').trim()) out.push(k);
      if (['CPU', 'GPU', 'Motherboard'].includes(d.category) && !(Number(d.tdpWattage) > 0)) out.push('الاستهلاك (واط)');
    }
    return out;
  };

  const setCat = (cat: string) => {
    if (!draft) return;
    /* تبديل الفئة يعيد بناء هيكل المواصفات — مفاتيح فئةٍ في أخرى لا تُقرأ */
    const specs: Record<string, string> = {};
    for (const k of required[cat] || []) specs[k] = draft.specs[k] ?? '';
    setDraft({ ...draft, category: cat, specs });
  };

  const save = async () => {
    if (!draft || saving) return;
    setSaving(true);
    try {
      const r = await fetch('/api/admin/store-search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', draft }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || 'تعذّر الحفظ');
      toast.success('أُضيفت: ' + d.name);
      setDraft(null);
      /* تُعلَّم في النتائج فوراً كي لا تُضاف مرّتين */
      setRes((cur) => cur && ({
        ...cur,
        results: cur.results.map((x) =>
          x.url === draft.url ? { ...x, existing: { id: d.id, name: draft.brand + ' ' + draft.name } } : x),
      }));
    } catch (e: any) {
      toast.error(e?.message || 'تعذّر الحفظ');
    } finally {
      setSaving(false);
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
            ⚠️ {active.label} يمرّ عبر Scrape.do — البحث الواحد يكلّف طلباً، وكل نتيجةٍ تُقرأ تكلّف طلباً آخر،
            و«أضف» يكلّف طلباً ثالثاً لقراءة جدول المواصفات.
          </p>
        )}
      </div>

      {/* ===== المعاينة قبل الحفظ =====
           ⚠️ ولا يُحفظ شيءٌ ناقص: `fit.ts` يبني حكم التوافق على المواصفات،
           فقطعةٌ بمقبسٍ فارغ تُقبل مع كل معالج وتكذب في الباني. */}
      {draft && (() => {
        const miss = missingNow(draft);
        const badge = (k: string) => {
          const o = draft.origins['specs.' + k] ?? draft.origins[k];
          const filled = String(draft.specs?.[k] ?? '').trim();
          /* ثلاثُ حالاتٍ لا اثنتان: «قُرئ» من جدول المتجر يُوثَق ويُترك،
             و«استُنتج» يُراجَع، و«مطلوب» يُكتب. وبلا التمييز يظنّ الأدمن أنّ
             كل ممتلئٍ مقروء، فيمرّ تخمينٌ من العنوان دون أن يراه أحد. */
          if (filled && o === 'read') return { t: 'من المتجر', c: 'text-emerald-700 dark:text-emerald-400' };
          if (filled && o === 'guess') return { t: 'مستنتَج', c: 'text-amber-700 dark:text-amber-400' };
          if (filled) return { t: '', c: '' };
          return { t: 'مطلوب', c: 'text-rose-700 dark:text-rose-400' };
        };
        return (
          <div className="mt-6 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm p-5 rounded-sm border-x border-b border-t-2 border-slate-200 border-t-emerald-500 dark:border-slate-800/80 dark:border-t-emerald-500 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-[15px] font-black text-slate-900 dark:text-white">معاينة قبل الحفظ</h2>
              <button onClick={() => setDraft(null)}
                className="text-[12px] font-black text-slate-600 dark:text-slate-400 hover:underline">أغلق</button>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="shrink-0 w-20 h-20 rounded-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                {draft.imageUrl
                  ? <img src={productImage(draft.imageUrl)} alt="" className="w-full h-full object-contain p-1" />
                  : <div className="w-full h-full grid place-items-center text-[12px] text-slate-400">بلا صورة</div>}
              </div>
              <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="الفئة" hint={draft.category ? 'مستنتَجة من العنوان' : 'مطلوبة'}>
                  <select value={draft.category ?? ''} onChange={(e) => setCat(e.target.value)} className={INPUT}>
                    <option value="">— اختر —</option>
                    {cats.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="الماركة" hint={draft.brand ? 'مستنتَجة' : 'مطلوبة'}>
                  <input value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })} className={INPUT} />
                </Field>
                <Field label="الاسم" hint="نُظّف من الماركة والوصف">
                  <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={INPUT} />
                </Field>
                <Field label={`السعر (${draft.currency || 'SAR'})`} hint="قُرئ من المتجر">
                  <input type="number" value={draft.price ?? ''} onChange={(e) => setDraft({ ...draft, price: e.target.value === '' ? null : Number(e.target.value) })} className={INPUT} />
                </Field>
                <Field label="الاستهلاك (واط)" hint={['CPU','GPU','Motherboard'].includes(draft.category || '') ? 'مطلوب — الباني يجمعه' : 'اختياريّ'}>
                  <input type="number" value={draft.tdpWattage} onChange={(e) => setDraft({ ...draft, tdpWattage: Number(e.target.value) || 0 })} className={INPUT} />
                </Field>
                <Field label="الفئة السعرية (١–٥)" hint="٣ افتراضاً">
                  <input type="number" min={1} max={5} value={draft.performanceTier} onChange={(e) => setDraft({ ...draft, performanceTier: Number(e.target.value) || 3 })} className={INPUT} />
                </Field>
              </div>
            </div>

            {draft.category && (
              <>
                <h3 className="text-[13px] font-black text-slate-900 dark:text-white mb-2">
                  المواصفات — يقرؤها فاحص التوافق
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {(required[draft.category] || []).map((k) => {
                    const b = badge(k);
                    return (
                      <Field key={k} label={k} hint={b.t} hintClass={b.c}>
                        <input
                          value={draft.specs[k] ?? ''}
                          onChange={(e) => setDraft({ ...draft, specs: { ...draft.specs, [k]: e.target.value } })}
                          className={INPUT}
                        />
                      </Field>
                    );
                  })}
                </div>

                {/* ⚠️ وما زاد عن المطلوب يُعرض أيضاً: المعاينة عهدٌ بأن يُرى
                     كلُّ ما سيُحفظ. وحقلٌ يُحفظ ولا يظهر هنا نقضٌ للعهد. */}
                {(() => {
                  const extra = Object.keys(draft.specs || {})
                    .filter((k) => !(required[draft.category!] || []).includes(k))
                    .filter((k) => String(draft.specs[k] ?? '').trim());
                  if (!extra.length) return null;
                  return (
                    <>
                      <h3 className="text-[13px] font-black text-slate-900 dark:text-white mb-2">
                        مواصفاتٌ إضافيّة قرأها المتجر
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {extra.map((k) => (
                          <Field key={k} label={k} hint="من المتجر" hintClass="text-emerald-700 dark:text-emerald-400">
                            <input
                              value={draft.specs[k] ?? ''}
                              onChange={(e) => setDraft({ ...draft, specs: { ...draft.specs, [k]: e.target.value } })}
                              className={INPUT}
                            />
                          </Field>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </>
            )}

            <Field label="الوصف (عربيّ · اختياريّ)" hint="يظهر في صفحة القطعة">
              <textarea rows={4} value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder={'### ' + (draft.brand + ' ' + draft.name).trim()}
                className={INPUT + ' font-normal leading-relaxed'} />
            </Field>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button onClick={save} disabled={saving || miss.length > 0}
                className="px-6 py-2.5 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white text-[13px] font-black disabled:opacity-50 transition-colors">
                {saving ? 'يحفظ…' : 'احفظ القطعة'}
              </button>
              {miss.length > 0 && (
                <p className="text-[12px] font-bold text-rose-700 dark:text-rose-400">
                  ينقص {miss.length}: {miss.slice(0, 6).join('، ')}{miss.length > 6 ? '…' : ''}
                </p>
              )}
            </div>
          </div>
        );
      })()}

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
                  <div className="shrink-0 flex gap-1.5">
                    <button onClick={() => openDraft(r)}
                      className="px-3 py-1.5 rounded-sm text-[12px] font-black bg-cyan-700 hover:bg-cyan-800 text-white transition-colors">
                      أضف
                    </button>
                    <button onClick={() => copy(r)}
                      className="px-3 py-1.5 rounded-sm text-[12px] font-black border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-400">
                      انسخ
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* ⚠️ ولا يُوعد بإضافةٍ بضغطة: القطعة تحتاج فئةً ومواصفاتٍ ووصفاً
              عربيّاً، ولا يُستخرج ذلك من صفحة متجرٍ استخراجاً موثوقاً. */}
          <p className="mt-4 text-[12px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
            «أضف» يفتح مسودّةً مملوءةً بما يحمله العنوان فعلاً — راجعها وأكملها ثم احفظ.
            و«انسخ» يأخذ الاسم والرابط والسعر إن أردت نموذجاً آخر.
          </p>
        </div>
      )}
    </div>
  );
}
