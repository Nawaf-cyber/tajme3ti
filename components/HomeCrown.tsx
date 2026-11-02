/* ============ رأس الرئيسية — «التاج» (2026-11-02) ============
 * الشعار في الوسط كما كان أيّام «جمّع بثقة» (طلب نوّاف: «شعارنا بالوسط وتحسه
 * هيبة»)، وفوقه منقلةٌ نصف دائريّة على رسم المخطّط، والمتاجر السبع على قوسها:
 * الأكثرُ قطعاً في القمّة ثمّ يميناً ويساراً بالتناوب. من كلّ متجرٍ مسارٌ إلى
 * الشعار تجري فيه نبضةٌ بلون المتجر — الأسعار تصبّ في مكانٍ واحد. والنصّ لا
 * يتحرّك ولا يُخفى: الحركة في الرسم وحده (globals.css · .hc-*).
 *
 * الإحداثيّات حول (0,0) = مركز الشعار. القوس R=300، والحلقات الداخليّة حتى ١٢٤.
 * التسميات من sm (عرض ٦٤٠ → مقياس ٠٫٨ → ١٢px)؛ ودونه نقاطٌ وقائمة نصّيّة تحت. */
import Link from 'next/link';
import type { ShowStore } from '../lib/home-plan';

const R = 300;
/* مواضع المتاجر بزاوية القوس (٩٠ = القمّة)، بترتيب `stores` (الأكثر قطعاً أوّلاً):
   القمّة، ثمّ اليمين قبل اليسار لأنّ القراءة من اليمين */
const ANGLES = [90, 60, 120, 30, 150, 0, 180];
const rad = (deg: number) => (deg * Math.PI) / 180;
const at = (deg: number, r: number) => [Math.round(r * Math.cos(rad(deg)) * 10) / 10, Math.round(-r * Math.sin(rad(deg)) * 10) / 10] as const;

/* قطاع دائريّ من زاوية الشاشة a إلى b (باتّجاه عقارب الساعة، y للأسفل) */
const sector = (a: number, b: number, r: number) => {
  const [x1, y1] = [r * Math.cos(rad(a)), r * Math.sin(rad(a))];
  const [x2, y2] = [r * Math.cos(rad(b)), r * Math.sin(rad(b))];
  return `M0 0L${x1.toFixed(1)} ${y1.toFixed(1)}A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}Z`;
};

/* البرق نفسه (شعار الموقع، viewBox 24) مكبّراً حول المركز */
const BOLT = 'M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z';
const BOLT_T = 'translate(-71.3 -74.4) scale(6.2)';

function Crown({ stores, labels }: { stores: ShowStore[]; labels: boolean }) {
  const shown = stores.slice(0, ANGLES.length);
  /* نسختان في الصفحة (بتسميات ومن دونها) — والمعرّف المكرّر يجعل url(#…) يشير
     إلى نسخةٍ مخفيّة فيختفي التدرّج */
  const id = (n: string) => `hc-${n}-${labels ? 'a' : 'b'}`;
  return (
    <svg
      viewBox={labels ? '-380 -368 760 498' : '-330 -330 660 460'}
      className="block w-full h-auto overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={id('glow')}>
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0.30" />
          <stop offset="0.45" stopColor="#0ea5e9" stopOpacity="0.10" />
          <stop offset="1" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('bolt-d')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cffafe" />
          <stop offset="0.45" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id={id('bolt-l')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#06b6d4" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <filter id={id('blur')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        {/* النصف السفليّ من الدوائر الكبيرة يذوب قبل العنوان */}
        <linearGradient id={id('fade-g')} gradientUnits="userSpaceOnUse" x1="0" y1="-370" x2="0" y2="140">
          <stop offset="0.74" stopColor="#fff" />
          <stop offset="0.97" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={id('fade')}>
          <rect x="-400" y="-400" width="800" height="560" fill={`url(#${id('fade-g')})`} />
        </mask>
      </defs>

      {/* الهالة — ليلاً فقط */}
      <circle r="330" fill={`url(#${id('glow')})`} className="hidden dark:inline" />

      <g mask={`url(#${id('fade')})`}>
        {/* المنقلة: القوس، وتدريجه كلّ ٥ درجات، وقطرها */}
        <path d={`M${-R} 0A${R} ${R} 0 0 1 ${R} 0`} className="hc-line" />
        <path
          d={Array.from({ length: 37 }, (_, i) => {
            const deg = i * 5;
            const len = deg % 45 === 0 ? 16 : deg % 15 === 0 ? 10 : 5;
            const [x1, y1] = at(deg, R);
            const [x2, y2] = at(deg, R + len);
            return `M${x1} ${y1}L${x2} ${y2}`;
          }).join('')}
          className="hc-line"
        />
        <path d={`M${-R - 40} 0H${R + 40}`} className="hc-line hc-faint" />
        {/* دائرةٌ متقطّعة تدور ببطء */}
        <g className="hc-rot" style={{ ['--spin' as string]: '160s', animationDirection: 'reverse' }}>
          <circle r="204" className="hc-line hc-faint" strokeDasharray="2 7" />
        </g>
      </g>

      {/* المسارات: من كلّ متجرٍ إلى حلقة الشعار، ونبضةٌ بلونه */}
      {shown.map((s, i) => {
        const [x1, y1] = at(ANGLES[i], R - 14);
        const [x2, y2] = at(ANGLES[i], 128);
        return (
          <g key={s.name}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} className="hc-line hc-trace" />
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              pathLength={1}
              className="hc-pulse"
              style={{ ['--c' as string]: s.color, ['--d' as string]: `${(i * 0.52).toFixed(2)}s` }}
            />
          </g>
        );
      })}

      {/* المسح — ليلاً فقط: قطاعٌ يعبر المنقلة من اليسار إلى اليمين */}
      <g className="hc-sweep hidden dark:inline">
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <path key={k} d={sector(180 - (k + 1) * 4, 180 - k * 4, R - 16)} fill="#22d3ee" fillOpacity={[0.13, 0.09, 0.06, 0.04, 0.025, 0.012][k]} />
        ))}
      </g>

      {/* الشعار: قرصٌ يحجب القطر، حلقةٌ مدرّجة تدور، والبرق */}
      <circle r="104" style={{ fill: 'var(--page-bg)' }} />
      <circle r="104" className="hc-line" />
      <g className="hc-rot" style={{ ['--spin' as string]: '90s' }}>
        <path
          d={Array.from({ length: 60 }, (_, i) => {
            const deg = i * 6;
            const [x1, y1] = at(deg, 112);
            const [x2, y2] = at(deg, i % 5 === 0 ? 124 : 118);
            return `M${x1} ${y1}L${x2} ${y2}`;
          }).join('')}
          className="hc-line"
        />
      </g>
      <path d={BOLT} transform={BOLT_T} fill="#22d3ee" filter={`url(#${id('blur')})`} className="hc-charge hidden dark:inline" />
      <path d={BOLT} transform={BOLT_T} fill={`url(#${id('bolt-l')})`} className="dark:hidden" />
      <path d={BOLT} transform={BOLT_T} fill={`url(#${id('bolt-d')})`} className="hidden dark:inline" />

      {/* المتاجر: نقطةٌ بلونه وحلقة، واسمه خارج القوس */}
      {shown.map((s, i) => {
        const deg = ANGLES[i];
        const [x, y] = at(deg, R);
        const side = deg === 0 || deg === 180;
        const [lx, ly] = side ? [x, 36] : at(deg, R + 42);
        return (
          <g key={s.name}>
            <circle cx={x} cy={y} r="14" className="hc-ring" style={{ stroke: s.color }} />
            <circle cx={x} cy={y} r="7.5" fill={s.color} className="hc-node" />
            {labels && (
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="hc-label">
                {s.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

const storesAr = (n: number) => (n === 1 ? 'متجر واحد' : n === 2 ? 'متجرين' : n <= 10 ? `${n} متاجر` : `${n} متجراً`);

export default function HomeCrown({
  stores, partsCount, livePrices, updatedAgo,
}: { stores: ShowStore[]; partsCount: number; livePrices: number; updatedAgo: string | null }) {
  return (
    <section className="relative flex flex-col items-center text-center pt-2 lg:pt-4">
      <div className="relative w-full max-w-[700px] mx-auto">
        <div className="hidden sm:block"><Crown stores={stores} labels /></div>
        <div className="sm:hidden px-2"><Crown stores={stores} labels={false} /></div>
      </div>

      <h1 className="relative -mt-1 sm:-mt-3 text-[46px] leading-[1.12] sm:text-6xl lg:text-[76px] lg:leading-[1.08] font-black tracking-tight text-slate-900 dark:text-white">
        جمّع بثقة.{' '}
        <br className="sm:hidden" />
        <span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-500 via-blue-500 to-cyan-400 dark:from-cyan-300 dark:via-blue-400 dark:to-cyan-300">
          من أول مرة.
        </span>
      </h1>

      <p className="mt-4 max-w-2xl text-[17px] sm:text-xl leading-relaxed font-medium text-slate-600 dark:text-slate-400">
        نقارن أسعار {storesAr(stores.length)} سعودية على كل قطعة، ونفحص توافق تجميعتك قطعة قطعة قبل لا تدفع ريال.
      </p>

      <div className="mt-7 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Link
          href="/builder"
          className="group relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-10 py-4 text-base font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all"
        >
          ابدأ تجميعتك
          <svg className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </Link>
        <a
          href="#planner"
          className="inline-flex items-center justify-center rounded-sm border border-slate-300 dark:border-slate-700/80 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-sm px-10 py-4 text-base font-bold text-slate-800 dark:text-slate-200 hover:border-cyan-500/60 hover:text-cyan-700 dark:hover:text-cyan-300 hover:-translate-y-0.5 transition-all"
        >
          ما تدري وش تبي؟
        </a>
      </div>

      <p className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[13px] font-bold text-slate-500 dark:text-slate-400">
        {updatedAgo && (
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            الأسعار محدّثة {updatedAgo}
          </span>
        )}
        <span aria-hidden="true" className="h-3.5 w-px bg-slate-300 dark:bg-slate-700"></span>
        <span><b className="font-mono text-slate-800 dark:text-slate-200 tabular-nums">{partsCount.toLocaleString('en-US')}</b> قطعة</span>
        <span aria-hidden="true" className="h-3.5 w-px bg-slate-300 dark:bg-slate-700"></span>
        <span><b className="font-mono text-slate-800 dark:text-slate-200 tabular-nums">{livePrices.toLocaleString('en-US')}</b> سعر متوفر الحين</span>
      </p>

      {/* أسماء المتاجر نصّاً: على الجوال بدل تسميات الرسم، ولقارئ الشاشة دائماً */}
      <ul className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-[12.5px] font-extrabold text-slate-600 dark:text-slate-300 sm:sr-only">
        {stores.map((s) => (
          <li key={s.name} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full ring-1 ring-slate-900/20 dark:ring-white/10" style={{ background: s.color }}></span>
            {s.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
