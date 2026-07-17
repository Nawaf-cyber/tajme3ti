'use client';

import { useState } from 'react';

/* ============ أوزان النيّة ============
   لكل استخدام أولوياته. شوتر تنافسي يحتاج معالجاً قوياً وفريمات عالية،
   لا رسوميات ثقيلة. المونتاج يحتاج رام ومعالجاً. إلخ.
   الأوزان *ترتيبية*: تحدّد أي فئة تُخدم أولاً — لا نسباً من ميزانية. */
export const USE_PROFILE: Record<string, { cpu: number; gpu: number; ram: number; storage: number; label: string }> = {
  'competitive-shooter': { cpu: 0.30, gpu: 0.34, ram: 0.14, storage: 0.08, label: 'شوتر تنافسي' },
  'aaa-gaming':          { cpu: 0.20, gpu: 0.44, ram: 0.14, storage: 0.08, label: 'ألعاب ثقيلة' },
  'casual-gaming':       { cpu: 0.24, gpu: 0.36, ram: 0.14, storage: 0.08, label: 'ألعاب خفيفة' },
  'editing':             { cpu: 0.32, gpu: 0.26, ram: 0.20, storage: 0.12, label: 'مونتاج وتصميم' },
  'streaming':           { cpu: 0.32, gpu: 0.30, ram: 0.16, storage: 0.10, label: 'بث مباشر' },
  'office':              { cpu: 0.30, gpu: 0.16, ram: 0.18, storage: 0.14, label: 'مكتبي ودراسة' },
  'mixed':               { cpu: 0.26, gpu: 0.34, ram: 0.16, storage: 0.10, label: 'استخدام متنوّع' },
};

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
  fpsTarget: number | null;
  budget: number | null;
  alsoStreams: boolean | null;
};

/* ---- الاستخدامات المعروضة ---- */
const USES = [
  { key: 'competitive-shooter', icon: '🎯', title: 'شوتر تنافسي', desc: 'فالورانت · CS · أبيكس' },
  { key: 'aaa-gaming',          icon: '🌆', title: 'ألعاب ثقيلة',  desc: 'سايبربانك · عالم مفتوح' },
  { key: 'casual-gaming',       icon: '🎮', title: 'ألعاب خفيفة',  desc: 'ماين كرافت · فورتنايت' },
  { key: 'editing',             icon: '🎬', title: 'مونتاج وتصميم', desc: 'فيديو · رندر · تصميم' },
  { key: 'streaming',           icon: '📡', title: 'بث مباشر',      desc: 'تويتش · يوتيوب' },
  { key: 'office',              icon: '💼', title: 'مكتبي ودراسة',  desc: 'أوفيس · برمجة · تصفّح' },
];

const RESOLUTIONS = [
  { key: '1080p', label: '1080p', desc: 'الأكثر شيوعاً' },
  { key: '1440p', label: '1440p', desc: 'التوازن الأمثل' },
  { key: '4K',    label: '4K',    desc: 'أعلى دقة' },
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
  const [error, setError] = useState<string | null>(null);

  const needsResolution = use !== null && use !== 'office' && use !== 'editing';
  const canBuild = use !== null && (!needsResolution || resolution !== null);

  const handleBuild = (nextRes?: string) => {
    if (!use) return;
    const res = nextRes ?? resolution;
    if (needsResolution && !res) return;

    const plans = buildPlans({
      use,
      resolution: res,
      fpsTarget: use === 'competitive-shooter' ? 144 : 60,
      budget: null,
      alsoStreams: alsoStreams || use === 'streaming',
    });

    if (!plans || plans.length === 0) {
      setError('تعذّر بناء تجميعة من القطع المتوفّرة حالياً. جرّب لاحقاً.');
      return;
    }
    setError(null);
    onPlans(plans);
  };

  // اختيار الاستخدام: يبني فوراً إن لم تلزم الدقة
  const pickUse = (k: string) => {
    setUse(k);
    setResolution(null);
    setError(null);
    if (k === 'office' || k === 'editing') {
      setTimeout(() => {
        const plans = buildPlans({
          use: k, resolution: null, fpsTarget: null, budget: null,
          alsoStreams: alsoStreams,
        });
        if (plans?.length) onPlans(plans);
        else setError('تعذّر بناء تجميعة من القطع المتوفّرة حالياً.');
      }, 0);
    }
  };

  const pickRes = (r: string) => {
    setResolution(r);
    setError(null);
    setTimeout(() => handleBuild(r), 0);
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

          {/* ===== خيار البثّ ===== */}
          {use && use !== 'office' && use !== 'streaming' && (
            <label className="flex items-center gap-2.5 mb-4 cursor-pointer group w-fit">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={alsoStreams}
                  onChange={e => {
                    setAlsoStreams(e.target.checked);
                    if (canBuild) setTimeout(() => handleBuild(), 0);
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