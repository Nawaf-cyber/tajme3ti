'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productImage } from '../../lib/image';

/* ============ أنواع ============ */

type Part = { id: string; name: string; brand: string; price: number; imageUrl: string | null };

type Slot = { field: string; label: string; short: string; part: Part | null };

type BuildRow = {
  id: string;
  name: string;
  createdAt: string;
  slots: Slot[];
  filled: number;
  totalSlots: number;
  totalPrice: number;
  currentPart: Part | null;
};

type Comp = {
  id: string;
  name: string;
  brand: string;
  price: number;
  categoryId: string;
  imageUrl?: string | null;
};

/* ============ أدوات ============ */

const RiyalIcon = ({ size = 'h-3 w-3', colorClass = 'bg-emerald-600 dark:bg-emerald-400' }) => (
  <div
    className={`${size} ${colorClass} inline-block shrink-0`}
    style={{
      maskImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1124.14 1256.39'%3E%3Cpath d='M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z'/%3E%3Cpath d='M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.28-62.16c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.86c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-25.24,73.27-51.67l68.35-104.32c7.27-11.68,11.11-25.15,11.11-38.89v-160.18l132.25-28.11v285.99c50.67-28.45,95.67-66.32,132.25-110.99v-203.42l292.28-62.16Z'/%3E%3C/svg%3E\")",
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
    }}
  />
);

const fmt = (n: number) => n.toLocaleString('en-US');

const brandColor = (brand: string) => {
  const b = (brand || '').toLowerCase();
  if (b.includes('nvidia')) return 'text-lime-500';
  if (b.includes('amd')) return 'text-red-500';
  if (b.includes('intel')) return 'text-blue-500';
  return 'text-slate-500 dark:text-slate-400';
};

/* ---- صورة قطعة صغيرة ---- */
const PartThumb = ({ src, alt, size = 'w-14 h-14' }: { src?: string | null; alt: string; size?: string }) => (
  <div
    className={`${size} bg-white rounded-sm shrink-0 flex items-center justify-center p-1 border border-slate-200 dark:border-slate-800`}
  >
    {/* التغليف داخل المكوّن يغطّي كل استخداماته دفعة واحدة */}
    <img
      src={productImage(src)}
      alt={alt}
      loading="lazy"
      className="max-w-full max-h-full object-contain mix-blend-multiply"
    />
  </div>
);

/* ============ المكوّن ============ */

export default function UseInBuildModal({
  component,
  onClose,
}: {
  component: Comp;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [builds, setBuilds] = useState<BuildRow[]>([]);
  const [targetField, setTargetField] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [confirming, setConfirming] = useState<BuildRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<{ buildId: string; replaced: boolean; buildName: string } | null>(null);

  /* ---- جلب التجميعات ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/builds/update-part?categoryId=${component.categoryId}`);
        if (cancelled) return;
        if (res.status === 401) {
          setNeedsLogin(true);
          return;
        }
        if (!res.ok) {
          setError('تعذّر جلب تجميعاتك.');
          return;
        }
        const data = await res.json();
        setBuilds(data.builds ?? []);
        setTargetField(data.targetField ?? '');
      } catch {
        if (!cancelled) setError('تعذّر الاتصال بالخادم.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [component.categoryId]);

  /* ---- Escape للإغلاق + قفل تمرير الصفحة ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const commit = async (build: BuildRow) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/builds/update-part', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildId: build.id, componentId: component.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || 'تعذّر الحفظ.');
        setSaving(false);
        return;
      }
      setDone({ buildId: build.id, replaced: Boolean(data?.replaced), buildName: build.name });
    } catch {
      setError('تعذّر الاتصال بالخادم.');
    } finally {
      setSaving(false);
    }
  };

  const handlePick = (build: BuildRow) => {
    if (build.currentPart?.id === component.id) return;
    if (build.currentPart) setConfirming(build);
    else commit(build);
  };

  /* ---- فرق السعر عند الاستبدال ---- */
  const priceDelta = confirming?.currentPart
    ? component.price - confirming.currentPart.price
    : 0;

  const newTotal = confirming ? confirming.totalPrice + priceDelta : 0;

  /* ============ العرض ============ */

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-slate-950/85 backdrop-blur-md p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0B1120] border-t-2 border-t-cyan-500 sm:border-x sm:border-b border-slate-200 dark:border-slate-800 rounded-t-lg sm:rounded-sm w-full max-w-xl max-h-[92vh] sm:max-h-[86vh] flex flex-col shadow-2xl shadow-cyan-950/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ==================== الرأس ==================== */}
        <div className="relative px-5 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {done ? 'تم' : confirming ? 'تأكيد الاستبدال' : 'استخدم في تجميعتي'}
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
            >
              ✕
            </button>
          </div>

          {/* شريط القطعة المختارة — يثبت السياق دائماً */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-sm">
            <PartThumb src={component.imageUrl} alt={component.name} />
            <div className="flex-1 min-w-0">
              <div className={`font-mono text-[9px] font-black uppercase tracking-wider ${brandColor(component.brand)}`}>
                {component.brand}
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white truncate leading-snug">
                {component.name}
              </div>
              {component.price > 0 && (
                <div className="mt-0.5 flex items-center gap-1 font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {fmt(component.price)} <RiyalIcon />
                </div>
              )}
            </div>
            <span className="font-mono text-[9px] font-black text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 rounded-sm px-2 py-1 shrink-0">
              القطعة المختارة
            </span>
          </div>
        </div>

        {/* ==================== المحتوى ==================== */}
        <div className="overflow-y-auto flex-1 p-4">

          {/* ---------- حالة النجاح ---------- */}
          {done ? (
            <div className="text-center py-10">
              <div className="relative w-16 h-16 mx-auto mb-5">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                <div className="relative w-full h-full rounded-sm border-2 border-emerald-500/50 flex items-center justify-center text-emerald-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white mb-1.5">
                {done.replaced ? 'تم الاستبدال' : 'تمت الإضافة'}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-8">
                في تجميعة «{done.buildName}»
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center px-4">
                <Link
                  href={`/build/${done.buildId}`}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-black rounded-sm hover:opacity-90 transition-opacity"
                >
                  عرض التجميعة
                </Link>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  متابعة المقارنة
                </button>
              </div>
            </div>

          /* ---------- خطوة تأكيد الاستبدال ---------- */
          ) : confirming ? (
            <div>
              <p className="mb-4 text-xs font-bold text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                هذه الخانة في «{confirming.name}» مشغولة. راجع التغيير قبل التأكيد.
              </p>

              {/* المقارنة البصرية: القديم ← الجديد */}
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden">
                {/* القديم */}
                <div className="flex items-center gap-3 p-3 bg-red-50/50 dark:bg-red-950/10">
                  <PartThumb src={confirming.currentPart!.imageUrl} alt={confirming.currentPart!.name} size="w-12 h-12" />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[9px] font-black text-red-500 uppercase tracking-wider mb-0.5">
                      ستُزال
                    </div>
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 line-through truncate">
                      {confirming.currentPart!.name}
                    </div>
                  </div>
                  {confirming.currentPart!.price > 0 && (
                    <div className="font-mono text-xs font-black text-slate-400 line-through flex items-center gap-1 shrink-0">
                      {fmt(confirming.currentPart!.price)} <RiyalIcon colorClass="bg-slate-400" />
                    </div>
                  )}
                </div>

                {/* سهم الفصل */}
                <div className="relative h-px bg-slate-200 dark:bg-slate-800">
                  <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-6 h-6 rounded-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <svg className="w-3 h-3 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>

                {/* الجديد */}
                <div className="flex items-center gap-3 p-3 bg-cyan-50/60 dark:bg-cyan-950/20 border-r-2 border-r-cyan-500">
                  <PartThumb src={component.imageUrl} alt={component.name} size="w-12 h-12" />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-0.5">
                      ستُضاف
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {component.name}
                    </div>
                  </div>
                  {component.price > 0 && (
                    <div className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                      {fmt(component.price)} <RiyalIcon />
                    </div>
                  )}
                </div>
              </div>

              {/* أثر التغيير على إجمالي التجميعة */}
              {confirming.totalPrice > 0 && priceDelta !== 0 && (
                <div className="mt-3 p-3 border border-slate-200 dark:border-slate-800 rounded-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500 dark:text-slate-400">إجمالي التجميعة</span>
                    <div className="flex items-center gap-2 font-mono font-black">
                      <span className="text-slate-400 line-through flex items-center gap-1">
                        {fmt(confirming.totalPrice)} <RiyalIcon size="h-2.5 w-2.5" colorClass="bg-slate-400" />
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">←</span>
                      <span className="text-slate-900 dark:text-white flex items-center gap-1">
                        {fmt(newTotal)} <RiyalIcon size="h-2.5 w-2.5" colorClass="bg-slate-900 dark:bg-white" />
                      </span>
                    </div>
                  </div>
                  <div
                    className={`mt-1.5 font-mono text-[10px] font-black ${
                      priceDelta > 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {priceDelta > 0 ? '▲ زيادة' : '▼ توفير'} {fmt(Math.abs(priceDelta))} ريال
                  </div>
                </div>
              )}

              {error && (
                <p className="mt-4 text-xs font-bold text-red-600 dark:text-red-500 text-center">{error}</p>
              )}

              <div className="flex gap-2 mt-6">
                <button
                  disabled={saving}
                  onClick={() => commit(confirming)}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-black rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saving ? '...جارٍ الاستبدال' : 'أكّد الاستبدال'}
                </button>
                <button
                  disabled={saving}
                  onClick={() => {
                    setConfirming(null);
                    setError(null);
                  }}
                  className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  تراجع
                </button>
              </div>
            </div>

          /* ---------- تحميل (هياكل عظمية) ---------- */
          ) : loading ? (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="p-4 border border-slate-200 dark:border-slate-800 rounded-sm animate-pulse">
                  <div className="h-3.5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-sm mb-3"></div>
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <div key={j} className="h-5 w-9 bg-slate-100 dark:bg-slate-800/60 rounded-sm"></div>
                    ))}
                  </div>
                  <div className="h-2.5 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded-sm"></div>
                </div>
              ))}
            </div>

          /* ---------- تسجيل الدخول ---------- */
          ) : needsLogin ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-5 rounded-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white mb-1.5">سجّل الدخول أولاً</p>
              <p className="font-mono text-[10px] text-slate-400 mb-7">تجميعاتك محفوظة في حسابك.</p>
              <Link
                href="/login"
                className="inline-block px-7 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-black rounded-sm hover:opacity-90 transition-opacity"
              >
                تسجيل الدخول
              </Link>
            </div>

          /* ---------- خطأ ---------- */
          ) : error && builds.length === 0 ? (
            <p className="text-center py-14 text-sm font-bold text-red-600 dark:text-red-500">{error}</p>

          /* ---------- لا توجد تجميعات ---------- */
          ) : builds.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-5 rounded-sm border border-dashed border-cyan-500/50 flex items-center justify-center text-cyan-500 text-2xl font-light">
                +
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white mb-1.5">ما عندك تجميعات بعد</p>
              <p className="font-mono text-[10px] text-slate-400 mb-7 leading-relaxed">
                ابنِ تجميعتك الأولى ثم عُد لإضافة القطع إليها.
              </p>
              <Link
                href="/builder"
                className="inline-block px-7 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-black rounded-sm hover:opacity-90 transition-opacity"
              >
                ابدأ تجميعة جديدة
              </Link>
            </div>

          /* ---------- قائمة التجميعات ---------- */
          ) : (
            <>
              <p className="mb-3 font-mono text-[10px] text-slate-400 px-1">
                اختر التجميعة التي تريد إضافة القطعة إليها
              </p>

              {error && (
                <p className="mb-3 text-xs font-bold text-amber-600 dark:text-amber-500 text-center">{error}</p>
              )}

              <div className="space-y-2">
                {builds.map((b) => {
                  const isSame = b.currentPart?.id === component.id;
                  const willReplace = Boolean(b.currentPart) && !isSame;

                  return (
                    <button
                      key={b.id}
                      onClick={() => handlePick(b)}
                      disabled={isSame}
                      className={`w-full text-right p-4 rounded-sm border transition-all group ${
                        isSame
                          ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed'
                          : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500/60 hover:bg-cyan-50/40 dark:hover:bg-cyan-950/20 active:scale-[0.995] cursor-pointer'
                      }`}
                    >
                      {/* السطر الأول: الاسم + الشارة */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {b.name}
                        </h4>
                        {isSame ? (
                          <span className="font-mono text-[9px] font-black text-slate-400 border border-slate-300 dark:border-slate-700 rounded-sm px-2 py-0.5 shrink-0">
                            موجودة هنا
                          </span>
                        ) : willReplace ? (
                          <span className="font-mono text-[9px] font-black text-amber-600 dark:text-amber-500 border border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 rounded-sm px-2 py-0.5 shrink-0">
                            استبدال
                          </span>
                        ) : (
                          <span className="font-mono text-[9px] font-black text-emerald-600 dark:text-emerald-400 border border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20 rounded-sm px-2 py-0.5 shrink-0">
                            خانة فارغة
                          </span>
                        )}
                      </div>

                      {/* شريط الخانات — يُظهر بنية التجميعة كاملة */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {b.slots.map((s) => {
                          const isTarget = s.field === targetField;
                          const filled = Boolean(s.part);
                          return (
                            <span
                              key={s.field}
                              title={s.part ? `${s.label}: ${s.part.name}` : `${s.label}: فارغة`}
                              className={`font-mono text-[9px] font-black px-1.5 py-1 rounded-sm border transition-colors ${
                                isTarget
                                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-500/30'
                                  : filled
                                  ? 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                  : 'border-dashed border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700'
                              }`}
                            >
                              {s.short}
                            </span>
                          );
                        })}
                      </div>

                      {/* السطر الأخير: القطعة الحالية + الإجمالي */}
                      <div className="flex items-end justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">
                            {b.currentPart ? 'الحالية في هذه الخانة' : 'هذه الخانة'}
                          </div>
                          <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">
                            {b.currentPart ? b.currentPart.name : '— فارغة —'}
                          </div>
                        </div>

                        <div className="text-left shrink-0">
                          <div className="font-mono text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">
                            {b.filled}/{b.totalSlots} قطعة
                          </div>
                          {b.totalPrice > 0 && (
                            <div className="font-mono text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                              {fmt(b.totalPrice)}
                              <RiyalIcon size="h-2.5 w-2.5" colorClass="bg-slate-900 dark:bg-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ==================== التذييل ==================== */}
        {!done && !confirming && !needsLogin && builds.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-center shrink-0">
            <p className="font-mono text-[10px] text-slate-400">
              {builds.length} تجميعة · لن يُستبدل شيء بدون تأكيدك
            </p>
          </div>
        )}
      </div>
    </div>
  );
}