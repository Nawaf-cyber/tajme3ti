'use client';

import { useState } from 'react';

export type TierPlan = {
  key: 'value' | 'balanced' | 'strong';
  label: string;
  note: string;
  total: number;
  picks: Record<string, any>;
};

type Intent = {
  use: string | null;
  resolution: string | null;
  /* ⚠️ حُذف من هنا `fpsTarget` و`budget`: كانا يُرسلان في كل نداء
     (144 للشوتر و60 لغيره، والميزانية null دائماً) ولا يقرؤهما buildPlans
     إطلاقاً. حقلان يوهمان قارئ الكود بأن للـFPS المستهدف أو للميزانية
     أثراً في الاختيار — ولا أثر لهما. */
  alsoStreams: boolean | null;
  /* تفضيل الشركة — اختياري. null = لا يهمّه، فيبني النظام بمنطقه المعتاد. */
  gpuBrand: string | null;
  cpuBrand: string | null;
};

/* ---- الاستخدامات المعروضة ---- */
const USES = [
  { key: 'competitive-shooter', icon: '🎯', title: 'شوتر تنافسي', desc: 'فالورانت · CS · أبيكس' },
  { key: 'aaa-gaming',          icon: '🌆', title: 'ألعاب ثقيلة',  desc: 'سايبربانك · عالم مفتوح' },
  { key: 'casual-gaming',       icon: '🎮', title: 'ألعاب خفيفة',  desc: 'ماين كرافت · فورتنايت' },
  { key: 'editing',             icon: '🎬', title: 'مونتاج وتصميم', desc: 'فيديو · رندر · تصميم' },
  { key: 'streaming',           icon: '📡', title: 'بث مباشر',      desc: 'تويتش · يوتيوب' },
];

const RESOLUTIONS = [
  { key: '1080p', label: '1080p', desc: 'الأكثر شيوعاً' },
  { key: '1440p', label: '1440p', desc: 'التوازن الأمثل' },
  { key: '4K',    label: '4K',    desc: 'أعلى دقة' },
];

/* ---- تفضيل الشركة (اختياري) ----
   القيم تطابق حقل brand في الكتالوج حرفياً. "لا يهمّني" = null فيختار
   النظام بمنطقه. ملاحظة: كروت Intel لا تتجاوز المستوى ٣ في كتالوجنا،
   فاختيارها على 4K يعطي أقوى ما تملكه Intel لا أقوى كرت متاح. */
const GPU_BRANDS = [
  { key: null,     label: 'لا يهمّني', hint: 'أفضل خيار متاح' },
  { key: 'NVIDIA', label: 'NVIDIA',   hint: 'GeForce RTX' },
  { key: 'AMD',    label: 'AMD',      hint: 'Radeon RX' },
  { key: 'Intel',  label: 'Intel',    hint: 'Arc' },
];

const CPU_BRANDS = [
  { key: null,    label: 'لا يهمّني', hint: 'أفضل خيار متاح' },
  { key: 'AMD',   label: 'AMD',      hint: 'Ryzen' },
  { key: 'Intel', label: 'Intel',    hint: 'Core' },
];

export default function IntentPicker({
  onPlans,
  buildPlans,
}: {
  onPlans: (plans: TierPlan[]) => void;
  buildPlans: (intent: Intent) => TierPlan[] | null;
}) {
  const [open, setOpen] = useState(true);
  const [use, setUse] = useState<string | null>(null);
  const [resolution, setResolution] = useState<string | null>(null);
  const [alsoStreams, setAlsoStreams] = useState(false);
  const [gpuBrand, setGpuBrand] = useState<string | null>(null);
  const [cpuBrand, setCpuBrand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const needsResolution = use !== null && use !== 'office' && use !== 'editing';
  const canBuild = use !== null && (!needsResolution || resolution !== null);

  /* بانٍ واحد لكل المسارات — يمنع تباعد الوسائط بين الأزرار */
  const run = (over: Partial<Intent> = {}) => {
    if (!use) return;
    const res = over.resolution !== undefined ? over.resolution : resolution;
    if (needsResolution && !res) return;

    const plans = buildPlans({
      use,
      resolution: needsResolution ? res : null,
      alsoStreams: (over.alsoStreams ?? alsoStreams) || use === 'streaming',
      gpuBrand: over.gpuBrand !== undefined ? over.gpuBrand : gpuBrand,
      cpuBrand: over.cpuBrand !== undefined ? over.cpuBrand : cpuBrand,
    });

    if (!plans || plans.length === 0) {
      setError('تعذّر بناء تجميعة من القطع المتوفّرة حالياً. جرّب لاحقاً.');
      return;
    }
    setError(null);
    onPlans(plans);
  };

  const handleBuild = (nextRes?: string) =>
    run(nextRes !== undefined ? { resolution: nextRes } : {});

  // اختيار الاستخدام: يبني فوراً إن لم تلزم الدقة
  const pickUse = (k: string) => {
    setUse(k);
    setResolution(null);
    setError(null);
    if (k === 'office' || k === 'editing') {
      setTimeout(() => {
        const plans = buildPlans({
          use: k, resolution: null,
          alsoStreams, gpuBrand, cpuBrand,
        });
        if (plans?.length) onPlans(plans);
        else setError('تعذّر بناء تجميعة من القطع المتوفّرة حالياً.');
      }, 0);
    }
  };

  const pickRes = (r: string) => {
    setResolution(r);
    setError(null);
    setTimeout(() => run({ resolution: r }), 0);
  };

  /* تغيير الشركة يعيد البناء فوراً إن كانت المدخلات مكتملة */
  const pickGpuBrand = (b: string | null) => {
    setGpuBrand(b);
    setError(null);
    if (canBuild) setTimeout(() => run({ gpuBrand: b }), 0);
  };
  const pickCpuBrand = (b: string | null) => {
    setCpuBrand(b);
    setError(null);
    if (canBuild) setTimeout(() => run({ cpuBrand: b }), 0);
  };

  return (
    <div className="mb-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-l from-cyan-500/[0.06] to-transparent dark:from-cyan-950/30 overflow-hidden">
      {/* الرأس */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-right hover:bg-cyan-500/[0.04] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
            <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">ما تدري وش تبي؟</h3>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-500 text-white">جديد</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
              قل لنا وش تسوي بالجهاز، ونبني لك تجميعة من القطع المتوفّرة.
            </p>
          </div>
        </div>
        <svg className={`w-5 h-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4">

          {/* ===== الخطوة ١: الاستخدام ===== */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-5 h-5 rounded-md bg-cyan-500 text-white text-[10px] font-black flex items-center justify-center">١</span>
              <span className="text-[11px] font-black text-slate-600 dark:text-slate-300">وش تسوي بالجهاز؟</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {USES.map(u => (
                <button
                  key={u.key}
                  onClick={() => pickUse(u.key)}
                  className={`p-3 rounded-xl border text-right transition-all hover:-translate-y-0.5 ${
                    use === u.key
                      ? 'border-cyan-500 bg-cyan-500/[0.08] ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="text-lg mb-1">{u.icon}</div>
                  <div className={`text-[12px] font-black ${use === u.key ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {u.title}
                  </div>
                  <div className="text-[9.5px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                    {u.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ===== الخطوة ٢: الدقة (للألعاب فقط) ===== */}
          {needsResolution && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-5 h-5 rounded-md bg-cyan-500 text-white text-[10px] font-black flex items-center justify-center">٢</span>
                <span className="text-[11px] font-black text-slate-600 dark:text-slate-300">على أي دقة تلعب؟</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {RESOLUTIONS.map(r => (
                  <button
                    key={r.key}
                    onClick={() => pickRes(r.key)}
                    className={`p-2.5 rounded-xl border text-center transition-all hover:-translate-y-0.5 ${
                      resolution === r.key
                        ? 'border-cyan-500 bg-cyan-500/[0.08] ring-2 ring-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-cyan-500/50'
                    }`}
                  >
                    <div className={`text-[13px] font-black ${resolution === r.key ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {r.label}
                    </div>
                    <div className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== الخطوة ٣: تفضيل الشركة — اختياري ===== */}
          {use && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-5 h-5 rounded-md bg-slate-400 dark:bg-slate-600 text-white text-[10px] font-black flex items-center justify-center">{needsResolution ? '٣' : '٢'}</span>
                <span className="text-[11px] font-black text-slate-600 dark:text-slate-300">تفضّل شركة معيّنة؟</span>
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500">(اختياري — اتركه ونختار لك الأفضل)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* كرت الشاشة */}
                <div>
                  <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-1.5">كرت الشاشة</div>
                  <div className="flex flex-wrap gap-1.5">
                    {GPU_BRANDS.map(b => (
                      <button
                        key={b.label}
                        onClick={() => pickGpuBrand(b.key)}
                        title={b.hint}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                          gpuBrand === b.key
                            ? 'border-cyan-500 bg-cyan-500/[0.08] text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500/20'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-500/50'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* المعالج */}
                <div>
                  <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-1.5">المعالج</div>
                  <div className="flex flex-wrap gap-1.5">
                    {CPU_BRANDS.map(b => (
                      <button
                        key={b.label}
                        onClick={() => pickCpuBrand(b.key)}
                        title={b.hint}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                          cpuBrand === b.key
                            ? 'border-cyan-500 bg-cyan-500/[0.08] text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500/20'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-500/50'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* تنبيه صادق: كروت Intel لا تصل الفئات العليا في كتالوجنا */}
              {gpuBrand === 'Intel' && (resolution === '4K' || resolution === '1440p') && (
                <p className="mt-2 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  كروت Intel Arc في كتالوجنا لا تتجاوز الفئة المتوسطة — على {resolution} ستحصل على أقوى ما تملكه Intel، لا أقوى كرت متاح.
                </p>
              )}
            </div>
          )}

          {/* ===== خيار البثّ ===== */}
          {use && use !== 'office' && use !== 'streaming' && (
            <label className="flex items-center gap-2.5 mb-4 cursor-pointer group w-fit">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={alsoStreams}
                  onChange={e => {
                    const next = e.target.checked;
                    setAlsoStreams(next);
                    // نمرّر القيمة صراحةً — لا نعتمد على وصول تحديث الحالة
                    if (canBuild) setTimeout(() => run({ alsoStreams: next }), 0);
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-cyan-500 transition-colors"></div>
                <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:-translate-x-4 shadow"></div>
              </div>
              <span className="text-[11.5px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                أصوّر أو أبثّ أحياناً
              </span>
            </label>
          )}

          {/* ===== زر البناء (احتياطي إن لم يُبنَ تلقائياً) ===== */}
          {canBuild && (
            <button
              onClick={() => handleBuild()}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-black rounded-xl hover:opacity-90 transition-opacity"
            >
              ابنِ لي تجميعة ←
            </button>
          )}

          {error && (
            <p className="mt-3 text-[11px] font-bold text-red-500 text-center">{error}</p>
          )}

          <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center">
            كل القطع والأسعار من كتالوجنا الحقيقي المتوفّر — لا تقديرات.
          </p>
        </div>
      )}
    </div>
  );
}