'use client';
/* ============ «شاشة تلائم كرتك» — الاقتراح نفسه في الباني وصفحة التصفّح ============
 *
 * المنطق كلّه في lib/monitor-match (وافق نوّاف على الجدول 2026-11-14): الدقّة من إطارات الكرت
 * المقيسة، والهرتز من إطاراته إلى ضعفها (أو 180)، والمنافذ. وهنا العرض فقط.
 * ⚠️ اقتراحٌ لا خانة: لا يُحفظ مع التجميعة (قرار نوّاف) — لذلك لا زرّ «أضف» بل رابط صفحة الشاشة.
 *
 *   <MonitorAdviceCard gpu={...} monitors={...} />   البطاقة كاملة (الباني تحت القطع، والتصفّح)
 *   <MonitorAdviceLine gpu={...} monitors={...} />   سطرٌ واحد تحت خانة الكرت في الباني
 */
import { useEffect, useMemo, useState } from 'react';
import { adviseMonitors, type MonitorLike, type MonRes, type Pick } from '../lib/monitor-match';
import { isAvailable, type Offer } from '../lib/stores';
import { specBadges } from '../lib/spec-badges';
import { productImage, IMAGE_FALLBACK } from '../lib/image';
import { formatPrice } from '../lib/price';

type PartLike = { id: string; brand: string; name: string; price: number; specs?: unknown; imageUrl?: string | null; offers?: Offer[] | null };
export type MonitorItem = MonitorLike & { imageUrl?: string | null };

const specsOf = (s: unknown): Record<string, any> => {
  if (!s) return {};
  if (typeof s === 'string') { try { return JSON.parse(s); } catch { return {}; } }
  return s as Record<string, any>;
};

/** القطعة كما تأتي من القاعدة ← شكل monitor-match (التوفّر من العروض الحيّة كبقيّة الموقع) */
export const toMonitorItem = (c: PartLike): MonitorItem => ({
  id: c.id, brand: c.brand, name: c.name, price: c.price, imageUrl: c.imageUrl,
  specs: specsOf(c.specs), available: isAvailable(c),
});

/* «1440p» تُكتب في الرابط بالارتفاع، كفلتر الدقّة في التصفّح (ComponentsClient · MON_FILTERS) */
const RES_KEY: Record<MonRes, string> = { '1080p': '1080', '1440p': '1440', '4K': '2160' };
export const monitorsHref = (res: MonRes) => `/components?cat=Monitor&res=${RES_KEY[res]}`;

const Riyal = () => (
  <span
    className="inline-block h-3.5 w-3.5 bg-emerald-600 dark:bg-emerald-400 align-middle"
    style={{ maskImage: "url('/riyal.svg')", WebkitMaskImage: "url('/riyal.svg')", maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' }}
  />
);

function roleLabel(p: Pick, base: MonRes): string {
  if (p.role === 'best') return 'الأنسب لكرتك';
  if (p.role === 'image') return 'صورة أحلى · OLED';
  const order: MonRes[] = ['1080p', '1440p', '4K'];
  return order.indexOf(p.res) > order.indexOf(base) ? `دقّة أعلى · ${p.res}` : `أرخص · ${p.res}`;
}

type Props = {
  gpu: { name: string; specs?: unknown } | null | undefined;
  monitors: MonitorItem[];
  /** في صفحة التصفّح: «شوف كل الشاشات» يضبط الفلتر بدل الانتقال */
  onShowAll?: (res: MonRes) => void;
  className?: string;
};

export function MonitorAdviceCard({ gpu, monitors, onShowAll, className = '' }: Props) {
  if (!gpu) return null;
  const a = adviseMonitors({ name: gpu.name, specs: specsOf(gpu.specs) }, monitors);
  const shell = `border border-slate-200 dark:border-slate-700/50 rounded-sm overflow-hidden bg-white dark:bg-slate-800/30 shadow-sm ${className}`;

  if (!a || a.picks.length === 0) {
    return (
      <div id="monitor-advice" className={shell}>
        <div className="px-4 py-3 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
          🖥️ ما عندنا قياس أداء منشور لـ{gpu.name}، فما نقترح شاشة بالتخمين.{' '}
          <a href="/components?cat=Monitor" className="font-black text-cyan-700 dark:text-cyan-400 underline">تصفّح الشاشات</a>
        </div>
      </div>
    );
  }

  const sameRes = monitors.filter((m) => m.available && m.price > 0 && String(m.specs.resolution ?? '').endsWith('x' + RES_KEY[a.res])).length;
  return (
    <div id="monitor-advice" className={shell}>
      <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700/50">
        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">🖥️ شاشة تلائم كرتك</h4>
        <p className="text-[12.5px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
          {a.perf.chip} يجيب تقريباً <b className="font-black text-slate-800 dark:text-slate-200">{Math.round(a.fps)} إطار</b> في <bdi dir="ltr">{a.res}</bdi>،
          فالأنسب له شاشة <bdi dir="ltr">{a.res}</bdi> بين <bdi dir="ltr">{a.band[0]}–{a.band[1]}</bdi> هرتز.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3">
        {a.picks.map((p) => {
          const m = p.mon as MonitorItem;
          const best = p.role === 'best';
          return (
            <div key={p.role} className={`flex flex-col rounded-sm border p-3 ${best ? 'border-cyan-500/60 bg-cyan-500/[0.04]' : 'border-slate-200 dark:border-slate-700/60'}`}>
              <span className={`self-start px-2 py-0.5 rounded-sm text-[11.5px] font-black ${best ? 'bg-cyan-500 text-white dark:text-[#052e37]' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                {roleLabel(p, a.res)}
              </span>
              <a href={`/components/${m.id}`} className="group mt-2.5 flex gap-3 items-start">
                <img src={productImage(m.imageUrl, IMAGE_FALLBACK)} alt="" loading="lazy" className="h-16 w-16 shrink-0 object-contain rounded-sm bg-white p-1 border border-slate-100 dark:border-slate-700" />
                <div className="min-w-0">
                  <div className="text-[11.5px] font-black text-slate-500 dark:text-slate-400">{m.brand}</div>
                  <div className="text-[13px] font-extrabold leading-snug text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 line-clamp-2" dir="ltr" style={{ textAlign: 'right' }}>{m.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {specBadges(m, 3).map((b) => (
                      <span key={b} dir="ltr" className="px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">{b}</span>
                    ))}
                  </div>
                </div>
              </a>
              <ul className="mt-2.5 space-y-1 text-[12px] font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                {p.reasons.map((r) => (
                  <li key={r} className="flex gap-1.5"><span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-slate-400" /><span>{r}</span></li>
                ))}
              </ul>
              <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">{formatPrice(m.price)} <Riyal /></span>
                <a href={`/components/${m.id}`} className="text-[12px] font-black text-cyan-700 dark:text-cyan-400 hover:underline">التفاصيل والأسعار ←</a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2.5 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
        <span>اقتراح بس — ما ينحفظ مع التجميعة. الإطارات بدون DLSS أو FSR · <a href="/how-we-rate" className="underline">كيف نقيّم؟</a></span>
        {onShowAll ? (
          <button onClick={() => onShowAll(a.res)} className="font-black text-cyan-700 dark:text-cyan-400 hover:underline">شوف كل شاشات <bdi dir="ltr">{a.res}</bdi> ({sameRes}) ←</button>
        ) : (
          <a href={monitorsHref(a.res)} className="font-black text-cyan-700 dark:text-cyan-400 hover:underline">شوف كل شاشات <bdi dir="ltr">{a.res}</bdi> ({sameRes}) ←</a>
        )}
      </div>
    </div>
  );
}

/** سطر تحت خانة الكرت: الدقّة والهرتز، وينزل للبطاقة */
export function MonitorAdviceLine({ gpu, monitors }: Props) {
  if (!gpu) return null;
  const a = adviseMonitors({ name: gpu.name, specs: specsOf(gpu.specs) }, monitors);
  if (!a) return null;
  return (
    <button
      type="button"
      onClick={() => document.getElementById('monitor-advice')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
      className="mt-2 w-full flex items-center justify-between gap-2 px-3 py-2 rounded-sm border border-dashed border-cyan-500/40 bg-cyan-500/[0.04] text-[12.5px] font-bold text-slate-600 dark:text-slate-300 hover:border-cyan-500 transition-colors"
    >
      <span>🖥️ شاشته المناسبة: <bdi dir="ltr" className="font-black text-slate-800 dark:text-slate-100">{a.res} · {a.band[0]}–{a.band[1]}Hz</bdi></span>
      <span className="font-black text-cyan-700 dark:text-cyan-400 whitespace-nowrap">شوف الاقتراحات ↓</span>
    </button>
  );
}

/* ============ قسم «شاشة تلائم تجميعتك» في صفحة التصفّح ============
 * الكرت من تجميعة الزائر المحفوظة في المتصفّح (draft_pc_build — الباني يكتبها)، وإلّا يختاره هنا.
 * والاختيار هنا لا يغيّر تجميعته: قراءةٌ فقط من localStorage. */
type GpuOpt = { id: string; brand: string; name: string; specs?: unknown };
export function MonitorFitSection({ gpus, monitors, onShowAll }: { gpus: GpuOpt[]; monitors: MonitorItem[]; onShowAll?: (res: MonRes) => void }) {
  const [gpuId, setGpuId] = useState<string>('');
  const [fromBuild, setFromBuild] = useState(false);
  useEffect(() => {
    try {
      const g = JSON.parse(localStorage.getItem('draft_pc_build') || '{}')?.GPU;
      if (g?.id && gpus.some((x) => x.id === g.id)) { setGpuId(g.id); setFromBuild(true); }
    } catch { /* مسودّة تالفة — نبدأ بلا كرت */ }
  }, [gpus]);
  const gpu = gpus.find((g) => g.id === gpuId) ?? null;
  const sorted = useMemo(() => [...gpus].sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`)), [gpus]);

  return (
    <section className="mb-6 rounded-sm border-x border-b border-t-2 border-slate-200 border-t-cyan-500/70 dark:border-slate-800/80 dark:border-t-cyan-500/70 bg-white/70 dark:bg-[#0F172A]/70 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">شاشة تلائم تجميعتك</h2>
          <p className="text-[12.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            {fromBuild && gpu ? 'أخذنا الكرت من تجميعتك — وتقدر تغيّره هنا بدون ما تتغيّر تجميعتك.' : 'اختر كرت الشاشة اللي عندك أو ناوي عليه، ونقترح لك الشاشة المناسبة له.'}
          </p>
        </div>
        <select
          value={gpuId}
          onChange={(e) => { setGpuId(e.target.value); setFromBuild(false); }}
          aria-label="كرت الشاشة"
          dir={gpuId ? 'ltr' : undefined}
          className="min-w-0 max-w-full sm:w-72 px-3 py-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[13px] font-bold text-slate-700 dark:text-slate-200"
        >
          <option value="">اختر كرتك…</option>
          {sorted.map((g) => <option key={g.id} value={g.id}>{g.brand} {g.name}</option>)}
        </select>
      </div>
      {gpu && <MonitorAdviceCard gpu={gpu} monitors={monitors} onShowAll={onShowAll} className="mt-4" />}
    </section>
  );
}
