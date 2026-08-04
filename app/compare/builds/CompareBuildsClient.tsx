'use client';

/* ============ مقارنة التجميعات الكاملة ============
   مقارنة القطع تجيب "أي كرت أفضل؟"، وهذه تجيب السؤال الحقيقي:
   "أي جهاز أشتري؟" — بمقارنة السعر الكلي والأداء والاستهلاك وقطعة بقطعة.
   بنفس مفردات صفحة مقارنة القطع كي تبدوَا ميزةً واحدة لا صفحتين. */

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatPrice } from '../../../lib/price';
import {
  analyzeBuild, buildVerdicts, buildWarnings,
  BUILD_PART_ORDER, type BuildLike, type BuildPartKey,
} from '../../../lib/build-compare';
import { SERIES_COLORS } from '../ComparePriceHistory';

const MAX = 3;

const RiyalIcon = ({ size = 'h-4 w-4', colorClass = 'bg-emerald-600 dark:bg-emerald-400' }) => (
  <div className={`${size} ${colorClass} inline-block shrink-0 align-middle`} style={{
    maskImage: "url('/riyal.svg')", WebkitMaskImage: "url('/riyal.svg')",
    maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center',
  }} />
);

const PART_LABEL: Record<BuildPartKey, string> = {
  CPU: 'المعالج', GPU: 'كرت الشاشة', Motherboard: 'اللوحة الأم',
  RAM: 'الذاكرة', Storage: 'التخزين', PSU: 'مزوّد الطاقة', Case: 'الكيس',
};

export default function CompareBuildsClient() {
  const { status } = useSession();
  const [builds, setBuilds] = useState<BuildLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') { setLoading(false); return; }
    if (status !== 'authenticated') return;
    fetch('/api/builds')
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setBuilds(list);
        // نبدأ بأحدث تجميعتين — المقارنة جاهزة فوراً بلا نقرات
        setPicked(list.slice(0, 2).map((b: any) => b.id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  const selected = useMemo(
    () => picked.map((id) => builds.find((b) => b.id === id)).filter(Boolean) as BuildLike[],
    [picked, builds]
  );
  const analyses = useMemo(() => selected.map(analyzeBuild), [selected]);
  const verdicts = useMemo(
    () => buildVerdicts(selected.map((b) => b.name), analyses),
    [selected, analyses]
  );

  const toggle = (id: string) => {
    setPicked((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : p.length >= MAX ? p : [...p, id]
    );
  };

  /* أفضل قيمة في صف رقمي — للتمييز البصري */
  const bestIdx = (vals: (number | null)[], dir: 'higher' | 'lower') => {
    const valid = vals.filter((v): v is number => v != null && v > 0);
    if (valid.length < 2) return -1;
    const best = dir === 'higher' ? Math.max(...valid) : Math.min(...valid);
    if (vals.filter((v) => v === best).length === valid.length) return -1;
    return vals.indexOf(best);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">جاري التحميل...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-8">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">سجّل دخولك</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">مقارنة التجميعات تحتاج تجميعاتك المحفوظة.</p>
          <Link href="/api/auth/signin" className="block w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2.5 rounded-sm font-black">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

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
          <Link href="/compare" className="inline-block mt-4 font-mono text-[11px] font-black text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 px-3 py-1.5 rounded-sm hover:bg-cyan-500 hover:text-white transition-all">
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
              <h2 className="text-sm font-black text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest font-mono">
                اختر حتى {MAX} تجميعات ({picked.length}/{MAX})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {builds.map((b) => {
                  const on = picked.includes(b.id);
                  const idx = picked.indexOf(b.id);
                  const a = analyzeBuild(b);
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
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-black text-slate-900 dark:text-white truncate">{b.name}</span>
                        {on && <span className="shrink-0 text-[9px] font-black text-white bg-cyan-500 px-1.5 py-0.5 rounded-sm">✓</span>}
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          {formatPrice(a.totalPrice)} <RiyalIcon size="h-3 w-3" />
                        </span>
                        <span>·</span>
                        <span>{a.filledCount}/7 قطع</span>
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
                {verdicts.length > 0 && (
                  <div className="relative bg-white/70 dark:bg-[#0F172A]/50 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-5 md:p-6 shadow-sm mb-8 animate-fade-up">
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-cyan-500/60 border-l-[14px] border-l-transparent pointer-events-none"></div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                      <span className="w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
                      أيّها أنصح؟
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {verdicts.map((v) => (
                        <div key={v.forWhat} className="relative flex items-start gap-3 p-3.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 overflow-hidden">
                          <span className="absolute top-0 bottom-0 right-0 w-[3px]" style={{ backgroundColor: SERIES_COLORS[v.buildIdx % SERIES_COLORS.length] }}></span>
                          <span className="text-lg leading-none mt-0.5 shrink-0">{v.icon}</span>
                          <div className="min-w-0">
                            <div className="font-mono text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{v.forWhat}</div>
                            <div className="text-[13px] font-black text-slate-900 dark:text-white leading-snug">{selected[v.buildIdx]?.name}</div>
                            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">{v.why}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== جدول المقارنة ===== */}
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4 px-1">
                  <span className="w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
                  جدول المقارنة
                </h2>

                <div className="relative bg-white/70 dark:bg-[#0F172A]/50 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm overflow-x-auto shadow-sm">
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-cyan-500/60 border-l-[14px] border-l-transparent z-30 pointer-events-none"></div>
                  <table className="w-full min-w-[600px] border-collapse">
                    <thead>
                      <tr>
                        <th className="sticky right-0 z-20 w-[130px] md:w-[160px] border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm"></th>
                        {selected.map((b, i) => (
                          <th key={b.id} className="relative p-4 border-b border-r border-slate-200 dark:border-slate-800 align-top">
                            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}></div>
                            <div className="text-sm font-black text-slate-900 dark:text-white mb-1 mt-1">{b.name}</div>
                            <div className="font-mono text-[10px] text-slate-400">{analyses[i].filledCount}/7 قطع</div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {/* السعر الكلي */}
                      {(() => {
                        const vals = analyses.map((a) => (a.totalPrice > 0 ? a.totalPrice : null));
                        const bi = bestIdx(vals, 'lower');
                        const min = Math.min(...vals.filter((v): v is number => v != null));
                        return (
                          <tr className="bg-cyan-500/[0.03]">
                            <th scope="row" className="sticky right-0 z-10 py-4 px-4 text-right text-sm font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm">السعر الكلي</th>
                            {analyses.map((a, i) => (
                              <td key={i} className="py-4 px-3 text-center border-b border-r border-slate-200 dark:border-slate-800">
                                <div className="inline-flex items-center gap-1 font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">
                                  {formatPrice(a.totalPrice)} <RiyalIcon size="h-4 w-4" />
                                  {i === bi && <span className="text-amber-400 text-xs">★</span>}
                                </div>
                                {a.totalPrice > min && (
                                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                                    أغلى بـ <span className="text-red-500 font-mono">{formatPrice(a.totalPrice - min)}</span> ﷼
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })()}

                      {/* مؤشّر الأداء */}
                      {(() => {
                        const vals = analyses.map((a) => a.perfScore);
                        const bi = bestIdx(vals, 'higher');
                        return (
                          <tr>
                            <th scope="row" className="sticky right-0 z-10 py-3.5 px-4 text-right text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm">
                              مستوى الأداء
                              <div className="font-mono text-[9px] font-normal text-slate-400">متوسط المعالج والكرت</div>
                            </th>
                            {analyses.map((a, i) => (
                              <td key={i} className="py-3.5 px-3 text-center border-b border-r border-slate-200 dark:border-slate-800">
                                {a.perfScore != null ? (
                                  <span className="inline-flex items-center gap-1 font-mono font-black text-base text-slate-900 dark:text-white">
                                    {i === bi && <span className="text-amber-400 text-xs">★</span>}
                                    {a.perfScore.toFixed(1)}<span className="text-[10px] font-normal text-slate-400">/5</span>
                                  </span>
                                ) : <span className="text-slate-300 dark:text-slate-700">—</span>}
                              </td>
                            ))}
                          </tr>
                        );
                      })()}

                      {/* الاستهلاك + هامش المزوّد */}
                      {(() => {
                        const vals = analyses.map((a) => (a.totalTdp > 0 ? a.totalTdp : null));
                        const bi = bestIdx(vals, 'lower');
                        return (
                          <tr className="bg-cyan-500/[0.03]">
                            <th scope="row" className="sticky right-0 z-10 py-3.5 px-4 text-right text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm">
                              الاستهلاك
                              <div className="font-mono text-[9px] font-normal text-slate-400">مقابل سعة المزوّد</div>
                            </th>
                            {analyses.map((a, i) => (
                              <td key={i} className="py-3.5 px-3 text-center border-b border-r border-slate-200 dark:border-slate-800 font-mono" dir="ltr">
                                <span className="font-black text-sm text-slate-900 dark:text-white">
                                  {a.totalTdp}W{i === bi && <span className="text-amber-400 text-xs mr-1">★</span>}
                                </span>
                                {a.psuWattage > 0 && (
                                  <div className={`text-[10px] font-bold mt-0.5 ${
                                    a.powerHeadroomPct != null && a.powerHeadroomPct < 0 ? 'text-red-500'
                                    : a.powerHeadroomPct != null && a.powerHeadroomPct < 20 ? 'text-amber-500'
                                    : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    / {a.psuWattage}W · هامش {a.powerHeadroomPct}%
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })()}

                      {/* الرام والتخزين */}
                      {([
                        { label: 'الذاكرة', get: (a: any) => a.ramGb, unit: 'GB' },
                        { label: 'التخزين', get: (a: any) => a.storageGb, unit: 'GB' },
                      ]).map((row, ri) => {
                        const vals = analyses.map((a) => (row.get(a) > 0 ? row.get(a) : null));
                        const bi = bestIdx(vals, 'higher');
                        return (
                          <tr key={row.label} className={ri % 2 === 1 ? 'bg-cyan-500/[0.03]' : ''}>
                            <th scope="row" className="sticky right-0 z-10 py-3.5 px-4 text-right text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm">{row.label}</th>
                            {analyses.map((a, i) => (
                              <td key={i} className="py-3.5 px-3 text-center border-b border-r border-slate-200 dark:border-slate-800 font-mono font-black text-sm text-slate-900 dark:text-white" dir="ltr">
                                {row.get(a) > 0 ? <>{row.get(a)}{row.unit}{i === bi && <span className="text-amber-400 text-xs mr-1">★</span>}</> : <span className="text-slate-300 dark:text-slate-700">—</span>}
                              </td>
                            ))}
                          </tr>
                        );
                      })}

                      {/* قطعة بقطعة */}
                      {BUILD_PART_ORDER.map((key, ri) => {
                        const prices = selected.map((b) => b.parts?.[key]?.price ?? null);
                        const bi = bestIdx(prices, 'lower');
                        return (
                          <tr key={key} className={ri % 2 === 0 ? '' : 'bg-cyan-500/[0.03]'}>
                            <th scope="row" className="sticky right-0 z-10 py-3 px-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm">
                              {PART_LABEL[key]}
                            </th>
                            {selected.map((b, i) => {
                              const p = b.parts?.[key];
                              return (
                                <td key={i} className="py-3 px-3 text-center border-b border-r border-slate-200 dark:border-slate-800">
                                  {p ? (
                                    <>
                                      <div className="text-[11px] font-black text-slate-900 dark:text-white leading-snug">{p.name}</div>
                                      <div className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                        {formatPrice(p.price)} ﷼{i === bi && <span className="text-amber-400 mr-1">★</span>}
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-500">ناقصة</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ===== تحذيرات كل تجميعة ===== */}
                {analyses.some((a) => buildWarnings(a).length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                    {selected.map((b, i) => {
                      const w = buildWarnings(analyses[i]);
                      if (w.length === 0) return null;
                      return (
                        <div key={b.id} className="p-4 rounded-sm border border-amber-500/40 bg-amber-500/[0.07]">
                          <div className="text-[12px] font-black text-amber-700 dark:text-amber-400 mb-2">⚠ {b.name}</div>
                          <ul className="space-y-1">
                            {w.map((x, j) => (
                              <li key={j} className="text-[11px] font-semibold text-amber-700/80 dark:text-amber-500/80 leading-relaxed">• {x}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}

                <p className="mt-8 text-center font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  ★ يشير إلى الأفضل في هذا الصف · الأسعار لحظية من كتالوجنا
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
