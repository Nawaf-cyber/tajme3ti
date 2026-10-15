'use client';

/* ============ مقارنة التجميعات الكاملة ============
   مقارنة القطع تجيب "أي كرت أفضل؟"، وهذه تجيب السؤال الحقيقي:
   "أي جهاز أشتري؟" — بمقارنة السعر الكلي والأداء والاستهلاك وقطعة بقطعة.
   بنفس مفردات صفحة مقارنة القطع كي تبدوَا ميزةً واحدة لا صفحتين.

   مراجعة 2026-10-14 (lib/build-compare يشرح المنطق): الأداء بالقياس لا بالدرجة،
   وفحص التوافق، والنافد يُسمّى ولا يُجمع، و«ناقصة» من المعالج لا من قائمةٍ ثابتة.
   والواجهة: النجمة للأرقام وحدها (كانت على أرخص قطعة «الأفضل» — أرخص كرتٍ هو
   الأضعف)، والصفوف المتطابقة باهتة كي تقع العين على الفرق، وبطاقة الاختيار تذكر
   المعالج والكرت وتاريخ الحفظ (تجميعتان بالاسم نفسه لا تُفرَّقان بالاسم)، وفي
   الجوال عمودان يتّسعان للشاشة بلا سحب. ولا نصّ دون ١٢ بكسل.

   ومراجعة ثانية: الدقّة يختارها الزائر (1080p/1440p/4K)، وحكم السعر بالمجموع
   التقديريّ، و«افتح في الباني» تحت كلّ عمود، وخطأ الجلب يُقال (كان يظهر «لا توجد
   تجميعات»)، والتقارب يُعلن بدل أن يختفي المربّع، والاختيار محفوظ في الرابط ?ids=. */

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatPrice } from '../../../lib/price';
import {
  analyzeBuild, buildVerdicts, buildWarnings, buildStatus, partLabel, priceComparable, fpsAt, buildEditUrl,
  BUILD_PART_ORDER, type BuildLike, type BuildAnalysis, type Res,
} from '../../../lib/build-compare';
import { shortDateAr } from '../../../lib/time-ago';
import { formatCapacity } from '../../../lib/capacity';
import { GPU_PERF_SOURCE, feelLine } from '../../../lib/gpu-perf';
import { CPU_PERF_SOURCE } from '../../../lib/cpu-perf';
import { goToLogin } from '../../../lib/login-href';
import { SERIES_COLORS } from '../ComparePriceHistory';

const MAX = 3;
const RESES: Res[] = ['1080p', '1440p', '4K'];

const RiyalIcon = ({ size = 'h-4 w-4', colorClass = 'bg-emerald-600 dark:bg-emerald-400' }) => (
  <div className={`${size} ${colorClass} inline-block shrink-0 align-middle`} style={{
    maskImage: "url('/riyal.svg')", WebkitMaskImage: "url('/riyal.svg')",
    maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center',
  }} />
);

const TONE = {
  ok: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10',
  warn: 'text-amber-700 dark:text-amber-400 bg-amber-500/10',
  block: 'text-red-700 dark:text-red-400 bg-red-500/10',
} as const;

/* اسمٌ قصير للبطاقة: «GeForce RTX 5070 12GB» ← «RTX 5070 12GB» */
const shortName = (s?: string | null) => (s || '').replace(/^(GeForce|Radeon)\s+/i, '').trim();

/* الأفضل في صفٍّ رقميّ — كلّ من يساويه (تجميعتان بالكرت نفسه تنالان النجمة معاً)،
   والتعادل التامّ بلا نجمة */
const bestIdx = (vals: (number | null)[], dir: 'higher' | 'lower'): Set<number> => {
  const valid = vals.filter((v): v is number => v != null && v > 0);
  if (valid.length < 2) return new Set();
  const best = dir === 'higher' ? Math.max(...valid) : Math.min(...valid);
  if (vals.filter((v) => v === best).length === valid.length) return new Set();
  return new Set(vals.flatMap((v, i) => (v === best ? [i] : [])));
};

const THB = 'sticky right-0 z-10 px-2 md:px-4 text-right border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A]';
const TH = `${THB} py-3.5 text-[12px] md:text-sm font-bold text-slate-600 dark:text-slate-400`;
const TDB = 'px-2 md:px-3 text-center align-top border-b border-r border-slate-200 dark:border-slate-800';
const TD = `${TDB} py-3.5`;
const Star = () => <span className="text-amber-500 dark:text-amber-400 text-[12px] mr-1">★</span>;

export default function CompareBuildsClient() {
  const { status } = useSession();
  const [builds, setBuilds] = useState<BuildLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [res, setRes] = useState<Res>('1440p');
  /* ⚠️ كان الخطأ يُبتلع: عطلٌ في الخادم أو تجاوزُ حدّ الطلبات يصير «لا توجد تجميعات
     محفوظة» — يُقال لمن يملك عشراً إنّه لا يملك شيئاً. */
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    fetch('/api/builds')
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then((d) => {
        const list: BuildLike[] = Array.isArray(d) ? d : [];
        setBuilds(list);
        /* الاختيار من الرابط (?ids=) إن وُجد — تحديث الصفحة لا يُضيّعه؛ وإلّا أحدث
           تجميعتين، فالمقارنة جاهزة بلا نقرات */
        const fromUrl = (new URLSearchParams(window.location.search).get('ids') || '')
          .split(',').filter((id) => list.some((b) => b.id === id)).slice(0, MAX);
        setPicked(fromUrl.length ? fromUrl : list.slice(0, 2).map((b) => b.id));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status === 'unauthenticated') { setLoading(false); return; }
    if (status !== 'authenticated') return;
    load();
  }, [status]);

  /* الاختيار في الرابط — يُحفظ مع التحديث ويُنسخ */
  useEffect(() => {
    if (loading || error || !builds.length) return;
    const url = new URL(window.location.href);
    if (picked.length) url.searchParams.set('ids', picked.join(','));
    else url.searchParams.delete('ids');
    window.history.replaceState(null, '', url.toString());
  }, [picked, loading, error, builds.length]);

  const allAnalyses = useMemo(() => new Map(builds.map((b) => [b.id, analyzeBuild(b)])), [builds]);
  const selected = useMemo(
    () => picked.map((id) => builds.find((b) => b.id === id)).filter(Boolean) as BuildLike[],
    [picked, builds]
  );
  const analyses = useMemo(() => selected.map((b) => allAnalyses.get(b.id)!), [selected, allAnalyses]);
  const verdicts = useMemo(() => buildVerdicts(analyses, res), [analyses, res]);
  const pc = useMemo(() => priceComparable(analyses.filter((a) => !a.blocked)), [analyses]);

  const toggle = (id: string) => {
    setPicked((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : p.length >= MAX ? p : [...p, id]
    );
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">جاري التحميل...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-t-red-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-8">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">تعذّر جلب تجميعاتك</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">تجميعاتك محفوظة — العطل في الاتصال. حاول بعد لحظة.</p>
          <button onClick={load} className="block w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2.5 rounded-sm font-black">أعد المحاولة</button>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-8">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">سجّل دخولك</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">مقارنة التجميعات تحتاج تجميعاتك المحفوظة.</p>
          {/* يعود إلى هنا بعد الدخول (lib/login-href) — كان يعود إلى الرئيسيّة */}
          <a href="/login" onClick={goToLogin} className="block w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2.5 rounded-sm font-black">تسجيل الدخول</a>
        </div>
      </div>
    );
  }

  const anyUnavailable = analyses.some((a) => a.unavailable.length > 0);
  /* التقارب يُقال: كان المربّع يختفي كلّه فيظنّ الزائر أنّ شيئاً تعطّل */
  const closeCall = verdicts.length === 0 && !analyses.some((a) => a.blocked);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ===== الرأس ===== */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">
            قارن{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400">تجميعاتك</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            السعر الكلي، الأداء، الاستهلاك، وقطعة بقطعة — لتعرف أي جهاز تبنيه فعلاً.
          </p>
          <Link href="/compare" className="inline-block mt-4 text-[12px] font-black text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 px-3 py-1.5 rounded-sm hover:bg-cyan-500 hover:text-white transition-all">
            ← أو قارن قطعاً مفردة
          </Link>
        </div>

        {builds.length === 0 ? (
          <div className="max-w-md mx-auto text-center bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-10">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">لا توجد تجميعات محفوظة</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">احفظ تجميعتين على الأقل لتبدأ المقارنة.</p>
            <Link href="/builder" className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-3 px-8 rounded-sm">ابنِ تجميعة</Link>
          </div>
        ) : (
          <>
            {/* ===== اختيار التجميعات ===== */}
            <div className="mb-8">
              <h2 className="text-sm font-black text-slate-500 dark:text-slate-400 mb-3">
                اختر حتى {MAX} تجميعات ({picked.length}/{MAX})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {builds.map((b) => {
                  const on = picked.includes(b.id);
                  const idx = picked.indexOf(b.id);
                  const a = allAnalyses.get(b.id)!;
                  const st = buildStatus(a);
                  const gpu = b.parts?.GPU ? shortName(b.parts.GPU.name) : a.igpuOnly ? 'رسوميّات مدمجة' : 'بلا كرت';
                  return (
                    <button
                      key={b.id}
                      onClick={() => toggle(b.id)}
                      disabled={!on && picked.length >= MAX}
                      className={`relative overflow-hidden text-right p-4 rounded-sm border transition-all active:scale-[0.98] ${
                        on
                          ? 'border-cyan-500 bg-cyan-500/[0.07] shadow-sm'
                          : picked.length >= MAX
                          ? 'border-slate-200 dark:border-slate-800 opacity-40 cursor-not-allowed'
                          : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 bg-white/60 dark:bg-slate-900/30'
                      }`}
                    >
                      {on && (
                        <span className="absolute top-0 right-0 bottom-0 w-[3px]" style={{ backgroundColor: SERIES_COLORS[idx % SERIES_COLORS.length] }}></span>
                      )}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-black text-slate-900 dark:text-white truncate">{b.name}</span>
                        {on && <span className="shrink-0 text-[12px] font-black text-white bg-cyan-500 px-1.5 rounded-sm">✓</span>}
                      </div>
                      {/* المعالج والكرت يفرّقان تجميعتين بالاسم نفسه */}
                      <div className="text-[12px] font-bold text-slate-600 dark:text-slate-300 truncate mb-1.5" dir="ltr" style={{ textAlign: 'right' }}>
                        {b.parts?.CPU ? b.parts.CPU.name : '—'} · {gpu}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-[12px] font-bold text-slate-500 dark:text-slate-400">
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                          {formatPrice(a.totalPrice)} <RiyalIcon size="h-3 w-3" />
                        </span>
                        <span className={`px-1.5 rounded-sm ${TONE[st.tone]}`}>{st.text}</span>
                        {b.createdAt && <span className="mr-auto" dir="ltr">{shortDateAr(b.createdAt)}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selected.length < 2 ? (
              <div className="text-center py-12 bg-white/60 dark:bg-[#0F172A]/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-sm">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">اختر تجميعتين على الأقل للمقارنة.</p>
              </div>
            ) : (
              <>
                {/* ===== أيّها أنصح؟ ===== */}
                {(verdicts.length > 0 || analyses.some((a) => a.blocked) || closeCall) && (
                  <div className="relative bg-white/70 dark:bg-[#0F172A]/50 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-5 md:p-6 shadow-sm mb-8 animate-fade-up">
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-cyan-500/60 border-l-[14px] border-l-transparent pointer-events-none"></div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                      <span className="w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
                      أيّها أنصح؟
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {closeCall && (
                        <p className="md:col-span-2 text-[13px] font-bold text-slate-700 dark:text-slate-300">
                          متقاربة — لا فرق يُذكر بينها في الألعاب ولا في السعر (أقلّ من ٥٪). اختر بما يهمّك في جدول القطع.
                        </p>
                      )}
                      {verdicts.map((v) => (
                        <div key={v.forWhat} className="relative flex items-start gap-3 p-3.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 overflow-hidden">
                          <span className="absolute top-0 bottom-0 right-0 w-[3px]" style={{ backgroundColor: SERIES_COLORS[v.buildIdx % SERIES_COLORS.length] }}></span>
                          <span className="text-lg leading-none mt-0.5 shrink-0">{v.icon}</span>
                          <div className="min-w-0">
                            <div className="text-[12px] font-black text-slate-500 dark:text-slate-400 mb-0.5">{v.forWhat}</div>
                            <div className="text-[13px] font-black text-slate-900 dark:text-white leading-snug">{[v.buildIdx, ...(v.others ?? [])].map((i) => selected[i]?.name).join(' و')}</div>
                            <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 mt-1">{v.why}</div>
                          </div>
                        </div>
                      ))}
                      {/* حكما السعر والقيمة يُسكت عنهما حين لا تكتمل الأسعار — ويُقال لماذا */}
                      {!pc.ok && !closeCall && !verdicts.some((v) => v.icon === '💰' || v.why.includes('الأرخص أيضاً')) && (
                        <p className="md:col-span-2 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                          لا حكم في السعر والقيمة: {pc.reason}.
                        </p>
                      )}
                      {/* التي لا تُركَّب لا يُوصى بها — ويُقال ذلك بدل أن تغيب صامتة */}
                      {analyses.map((a, i) => a.blocked && (
                        <div key={`blk-${selected[i].id}`} className="relative flex items-start gap-3 p-3.5 rounded-sm border border-red-500/40 bg-red-500/[0.06] overflow-hidden">
                          <span className="text-lg leading-none mt-0.5 shrink-0">⛔</span>
                          <div className="min-w-0">
                            <div className="text-[12px] font-black text-red-700 dark:text-red-400 mb-0.5">لا تُركَّب كما هي — استُبعدت من التوصية</div>
                            <div className="text-[13px] font-black text-slate-900 dark:text-white leading-snug">{selected[i].name}</div>
                            <div className="text-[12px] font-semibold text-slate-600 dark:text-slate-400 mt-1">{a.issues.find((x) => x.level === 'block')?.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== جدول المقارنة ===== */}
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4 px-1">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
                    جدول المقارنة
                  </h2>
                  {/* دقّة شاشتك — تغيّر رقم الإطارات وحكم «للألعاب» و«لأفضل قيمة» */}
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 dark:text-slate-400" role="group" aria-label="دقّة الشاشة">
                    دقّة شاشتك:
                    {RESES.map((r) => (
                      <button key={r} onClick={() => setRes(r)} aria-pressed={res === r} dir="ltr"
                        className={`px-2 py-1 rounded-sm border font-black transition-colors ${res === r ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400' : 'border-slate-200 dark:border-slate-700 hover:border-cyan-500/50'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative bg-white/70 dark:bg-[#0F172A]/50 border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm overflow-x-auto shadow-sm">
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-cyan-500/60 border-l-[14px] border-l-transparent z-30 pointer-events-none"></div>
                  {/* تجميعتان تتّسعان لشاشة الجوال؛ والثالثة وحدها تحتاج سحباً */}
                  <table className={`w-full border-collapse table-fixed ${selected.length > 2 ? 'min-w-[600px]' : ''}`}>
                    <colgroup>
                      <col className="w-[92px] md:w-[170px]" />
                      {selected.map((b) => <col key={b.id} />)}
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="sticky right-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A]"></th>
                        {selected.map((b, i) => {
                          const st = buildStatus(analyses[i]);
                          return (
                            <th key={b.id} className="relative p-2 md:p-4 border-b border-r border-slate-200 dark:border-slate-800 align-top">
                              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}></div>
                              <div className="text-[13px] md:text-sm font-black text-slate-900 dark:text-white mb-1 mt-1 break-words">{b.name}</div>
                              <span className={`inline-block text-[12px] font-bold px-1.5 rounded-sm ${TONE[st.tone]}`}>{st.text}</span>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>

                    <tbody>
                      {/* السعر الكلي — المتوفّر، وللنافد آخرُ سعرٍ معروف معلَناً «تقديريّ».
                          والنجمة والفرق فقط حين تُقارَن الأسعار بعدل (priceComparable) */}
                      {(() => {
                        const shown = analyses.map((a) => (a.unpriced.length ? a.totalPrice : a.estTotal));
                        const bi = pc.ok ? bestIdx(shown.map((v) => (v > 0 ? v : null)), 'lower') : new Set<number>();
                        const min = Math.min(...shown.filter((v) => v > 0));
                        return (
                          <tr className="bg-cyan-500/[0.03]">
                            <th scope="row" className={`${THB} py-3.5 text-[12px] md:text-sm font-black text-slate-900 dark:text-white`}>
                              السعر الكلي
                            </th>
                            {analyses.map((a, i) => (
                              <td key={i} className={TD}>
                                <div className="inline-flex items-center gap-1 font-mono font-black text-base md:text-lg text-emerald-600 dark:text-emerald-400">
                                  {formatPrice(shown[i])} <RiyalIcon size="h-4 w-4" />
                                  {bi.has(i) && <Star />}
                                </div>
                                {a.unpriced.length > 0 ? (
                                  <div className="text-[12px] font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                                    بدون {a.unpriced.map(partLabel).join('، ')} — نافد بلا سعر
                                  </div>
                                ) : a.estimated ? (
                                  <div className="text-[12px] font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                                    تقديريّ — {a.unavailable.map((u) => partLabel(u.key)).join('، ')} بآخر سعر
                                  </div>
                                ) : null}
                                {pc.ok && shown[i] > min && (
                                  <div className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                                    أغلى بـ <span className="text-red-500 font-mono">{formatPrice(shown[i] - min)}</span> ﷼{pc.estimated ? ' تقريباً' : ''}
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })()}

                      {/* التوافق — فحص الباني نفسه (lib/build-check) */}
                      <tr>
                        <th scope="row" className={TH}>التوافق</th>
                        {analyses.map((a, i) => {
                          const block = a.issues.find((x) => x.level === 'block');
                          const warns = a.issues.filter((x) => x.level === 'warn').length;
                          return (
                            <td key={i} className={TD}>
                              {block ? (
                                <span className="text-[12px] font-black text-red-600 dark:text-red-400">⛔ لا تُركَّب</span>
                              ) : (
                                <span className="text-[12px] font-black text-emerald-700 dark:text-emerald-400">✓ تُركَّب</span>
                              )}
                              {warns > 0 && <div className="text-[12px] font-bold text-amber-700 dark:text-amber-400 mt-0.5">{warns === 1 ? 'ملاحظة' : `${warns} ملاحظات`} — تحت الجدول</div>}
                            </td>
                          );
                        })}
                      </tr>

                      {/* الألعاب — إطارات الكرت المقيسة */}
                      {(() => {
                        const vals = analyses.map((a) => (a.hasGpu ? fpsAt(a, res) : null));
                        const bi = bestIdx(vals, 'higher');
                        return (
                          <tr className="bg-cyan-500/[0.03]">
                            <th scope="row" className={TH}>
                              الألعاب
                              <span className="block mt-0.5 text-[12px] font-normal text-slate-500 dark:text-slate-400 leading-relaxed">
                                متوسّط الإطارات ·{' '}
                                <a href={GPU_PERF_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-700 dark:hover:text-cyan-400">{GPU_PERF_SOURCE.name}</a>
                              </span>
                            </th>
                            {analyses.map((a, i) => (
                              <td key={i} className={TD}>
                                <GamingCell a={a} star={bi.has(i)} res={res} />
                              </td>
                            ))}
                          </tr>
                        );
                      })()}

                      {/* المعالج — أداؤه المقيس في الألعاب والتعدّد */}
                      {(() => {
                        const g = bestIdx(analyses.map((a) => a.cpuPerf?.gaming ?? null), 'higher');
                        const m = bestIdx(analyses.map((a) => a.cpuPerf?.multi ?? null), 'higher');
                        return (
                          <tr>
                            <th scope="row" className={TH}>
                              المعالج
                              <span className="block mt-0.5 text-[12px] font-normal text-slate-500 dark:text-slate-400 leading-relaxed">
                                نسبةً للأسرع ·{' '}
                                <a href={CPU_PERF_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-700 dark:hover:text-cyan-400">{CPU_PERF_SOURCE.name}</a>
                              </span>
                            </th>
                            {analyses.map((a, i) => (
                              <td key={i} className={TD}>
                                {a.cpuPerf ? (
                                  <div className="text-[12px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                                    <div>الألعاب <span className="font-mono font-black text-slate-900 dark:text-white">{a.cpuPerf.gaming ?? '—'}٪</span>{g.has(i) && <Star />}</div>
                                    <div>التعدّد <span className="font-mono font-black text-slate-900 dark:text-white">{a.cpuPerf.multi ?? '—'}٪</span>{m.has(i) && <Star />}</div>
                                  </div>
                                ) : (
                                  <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">ليس في جدول المصدر{a.cpuTier ? ` · فئة ${a.cpuTier}/5` : ''}</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })()}

                      {/* الاستهلاك — بقاعدة فحص الباني (هامشٌ يكبر مع الكرت) لا بنسبةٍ ثابتة */}
                      {(() => {
                        const vals = analyses.map((a) => (a.totalTdp > 0 ? a.totalTdp : null));
                        const bi = bestIdx(vals, 'lower');
                        return (
                          <tr className="bg-cyan-500/[0.03]">
                            <th scope="row" className={TH}>
                              الاستهلاك
                              <div className="text-[12px] font-normal text-slate-500 dark:text-slate-400">مقابل المزوّد</div>
                            </th>
                            {analyses.map((a, i) => (
                              <td key={i} className={TD}>
                                <span className="font-mono font-black text-sm text-slate-900 dark:text-white" dir="ltr">{a.totalTdp}W</span>{bi.has(i) && <Star />}
                                {a.psuWattage > 0 && (
                                  <div className={`text-[12px] font-bold mt-0.5 ${a.psuWattage >= a.psuNeed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    مزوّد <span className="font-mono" dir="ltr">{a.psuWattage}W</span> — {a.psuWattage >= a.psuNeed ? 'يكفي' : <>يحتاج نحو <span className="font-mono" dir="ltr">{Math.ceil(a.psuNeed / 50) * 50}W</span></>}
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })()}

                      {/* الرام والتخزين — السعة الأكبر بنجمة.
                          ⚠️ الوحدة تُشتقّ من القيمة (formatCapacity) — كان يُلصق «GB» فيظهر 2TB «2GB» */}
                      {([
                        { label: 'سعة الذاكرة', key: 'RAM', get: (a: BuildAnalysis) => a.ramGb },
                        { label: 'سعة التخزين', key: 'Storage', get: (a: BuildAnalysis) => a.storageGb },
                      ] as const).map((row, ri) => {
                        /* سعة قطعةٍ نافدة لا تنال النجمة — لا تُشترى اليوم */
                        const vals = analyses.map((a) => (row.get(a) > 0 && !a.unavailable.some((u) => u.key === row.key) ? row.get(a) : null));
                        const bi = bestIdx(vals, 'higher');
                        return (
                          <tr key={row.label} className={ri % 2 === 1 ? 'bg-cyan-500/[0.03]' : ''}>
                            <th scope="row" className={TH}>{row.label}</th>
                            {analyses.map((a, i) => (
                              <td key={i} className={`${TD} font-mono font-black text-sm text-slate-900 dark:text-white`}>
                                {row.get(a) > 0 ? <><span dir="ltr">{formatCapacity(row.get(a))}</span>{bi.has(i) && <Star />}</> : <span className="text-slate-400 dark:text-slate-600">—</span>}
                              </td>
                            ))}
                          </tr>
                        );
                      })}

                      {/* قطعة بقطعة — بلا نجمة: الأرخص ليس الأفضل. والصفّ المتطابق باهت */}
                      {BUILD_PART_ORDER.map((key, ri) => {
                        const ids = selected.map((b) => b.parts?.[key]?.id ?? null);
                        const same = ids.every((x) => x && x === ids[0]);
                        return (
                          <tr key={key} className={`${ri % 2 === 0 ? '' : 'bg-cyan-500/[0.03]'} ${same ? 'opacity-60' : ''}`}>
                            <th scope="row" className={`${THB} py-3 text-[12px] font-bold text-slate-600 dark:text-slate-400`}>
                              {partLabel(key)}
                              {same && <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">متطابقة</div>}
                            </th>
                            {selected.map((b, i) => {
                              const p = b.parts?.[key];
                              const a = analyses[i];
                              const gone = p && a.unavailable.find((u) => u.key === key);
                              return (
                                <td key={i} className={`${TDB} py-3`}>
                                  {p ? (
                                    <>
                                      <div className="text-[12px] font-black text-slate-900 dark:text-white leading-snug break-words" dir="ltr">{p.name}</div>
                                      {gone ? (
                                        <div className="text-[12px] font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                                          نافدة{gone.lastPrice > 0 && <span className="font-normal text-slate-500 dark:text-slate-400"> · آخر سعر <span className="font-mono">{formatPrice(gone.lastPrice)}</span></span>}
                                        </div>
                                      ) : (
                                        <div className="font-mono text-[12px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatPrice(p.price)} ﷼</div>
                                      )}
                                    </>
                                  ) : a.required.includes(key) ? (
                                    <span className="text-[12px] font-black text-amber-700 dark:text-amber-500">ناقصة</span>
                                  ) : (
                                    <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                                      {key === 'GPU' ? 'رسوميّات المعالج' : key === 'Cooler' ? 'مبرّد العلبة' : '—'}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                      {/* بعد القرار خطوةٌ تالية: افتحها في الباني لتعدّلها أو تشتريها */}
                      <tr>
                        <th scope="row" className={TH}></th>
                        {selected.map((b) => (
                          <td key={b.id} className="px-2 md:px-3 py-3.5 text-center align-top border-r border-slate-200 dark:border-slate-800">
                            <Link href={buildEditUrl(b as any)} className="inline-block w-full text-[12px] font-black text-white bg-gradient-to-r from-cyan-500 to-blue-600 px-2 py-2 rounded-sm hover:opacity-90">
                              افتحها في الباني ←
                            </Link>
                            <Link href={`/build/${b.id}`} className="inline-block mt-1.5 text-[12px] font-bold text-cyan-700 dark:text-cyan-400 underline">
                              صفحتها للمشاركة
                            </Link>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ===== تحذيرات كل تجميعة — المانع أوّلاً ===== */}
                {analyses.some((a) => buildWarnings(a).length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                    {selected.map((b, i) => {
                      const w = buildWarnings(analyses[i]);
                      if (w.length === 0) return null;
                      const blocked = w.some((x) => x.level === 'block');
                      return (
                        <div key={b.id} className={`p-4 rounded-sm border ${blocked ? 'border-red-500/40 bg-red-500/[0.06]' : 'border-amber-500/40 bg-amber-500/[0.07]'}`}>
                          <div className={`text-[13px] font-black mb-2 ${blocked ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>{blocked ? '⛔' : '⚠'} {b.name}</div>
                          <ul className="space-y-1">
                            {w.map((x, j) => (
                              <li key={j} className={`text-[12px] font-semibold leading-relaxed ${x.level === 'block' ? 'text-red-700 dark:text-red-400' : 'text-amber-800 dark:text-amber-500/90'}`}>• {x.text}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}

                <p className="mt-8 text-center text-[12px] text-slate-500 dark:text-slate-400">
                  ★ الأفضل في صفوف الأرقام · الأسعار لحظية من كتالوجنا، والنافد بآخر سعرٍ معروف ويُكتب «تقديريّ»
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* خليّة الألعاب: الرقم الكبير 1440p، و1080p و4K تحته، ثمّ «يكفيني؟» — كمقارنة القطع */
function GamingCell({ a, star, res }: { a: BuildAnalysis; star: boolean; res: Res }) {
  if (!a.hasGpu) {
    return <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{a.igpuOnly ? 'رسوميّات مدمجة — ليست للألعاب الثقيلة' : 'بلا كرت'}</span>;
  }
  const p = a.gpuPerf;
  if (!p) {
    return <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">الكرت ليس في جدول المصدر{a.gpuTier ? ` · فئة ${a.gpuTier}/5` : ''}</span>;
  }
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-black text-base text-slate-900 dark:text-white">
        <span className="font-mono">{Math.round(fpsAt(a, res) ?? 0)}</span> إطار{star && <Star />}
      </span>
      <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">بدقّة <span dir="ltr">{res}</span></span>
      <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400" dir="ltr">
        {RESES.filter((r) => r !== res).map((r) => `${r} ${Math.round(fpsAt(a, r) ?? 0)}`).join(' · ')}
      </span>
      <span className="mt-1 text-[12px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{feelLine(p)}</span>
    </div>
  );
}
