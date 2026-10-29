// components/BlueprintParts.tsx
// مخطّط القطع — خلفيّة الوضع الداكن (2026-10-29): توأم «ورقة المخطّط» ليلاً.
// القطع نفسها مرسومةً كمخطّطٍ أزرق باهت في الهوامش، بمقاسها النسبيّ الحقيقيّ
// (٢٫٢px لكلّ مم ثمّ ×٠٫٩): اللوحة الأمّ ATX والمروحة ١٤٠ على اليسار، وكرت
// الشاشة والمزوّد والذاكرة وقرص M.2 والمبرّد ٣٦٠ على اليمين.
//
// الإحداثيّات نسبةً لمنتصف الشاشة (svg x="50%") وعمود المحتوى 1280 (max-w-7xl)
// فحافّتاه عند ±640؛ القطع تبدأ من ±664 إلى الخارج فلا تقع تحت بطاقةٍ أبداً،
// وما جاوز الشاشة الضيّقة يُقصّ من طرفها (لوحةٌ تطلّ من الحافّة). وتحت 1536px
// تُخفى كلّها (globals.css · .bp-parts) — هامشٌ أضيق من ١٢٨ لا يُظهر إلّا شريطاً.
//
// الحركة (globals.css · bp-draw/bp-spin/bp-pulse): كلّ شكلٍ يأخذ pathLength=1
// (drawable أدناه) فتُخطّ القطع مرّةً عند التحميل بتفاوت --d، ثمّ تدور حلقات
// المراوح (bp-spin · --spin) وتجري نبضةٌ على المحيطات (bp-pulse · --pulse/--pd).
//
// ⚠️ التسميات من public/draft-labels.svg عبر use لا نصّاً هنا: نصٌّ داخل SVG
// الصفحة يقرؤه الزاحف أوّلَ ما في كلّ صفحة (درس أدسنس 2026-10).
// تُستعمل مرّتين: باهتةً في PCBBackground، ومضيئةً داخل مصباح المؤشّر (lit).

import { Children, cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from 'react';

const LABEL = '/draft-labels.svg#';
const SHAPES = new Set(['rect', 'circle', 'path']);
const vars = (v: Record<string, string>) => v as CSSProperties;

/* يضيف pathLength=1 لكلّ شكلٍ لم يحدّده — فتعمل حركة الخطّ (stroke-dashoffset
   من ١ إلى ٠) على كلّ الأشكال بقاعدة CSS واحدة بدل تكرار الخاصّيّة ٩٠ مرّة */
function drawable(node: ReactNode): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<Record<string, unknown>>;
    const kids = el.props.children as ReactNode | undefined;
    const add = typeof el.type === 'string' && SHAPES.has(el.type) && el.props.pathLength === undefined;
    if (!add && kids === undefined) return el;
    return kids === undefined ? cloneElement(el, { pathLength: 1 }) : cloneElement(el, add ? { pathLength: 1 } : {}, drawable(kids));
  });
}

function Motherboard() {
  return (
    <g transform="translate(-1268 140) scale(0.9)" style={vars({ '--d': '0s' })}>
      <g className="bp-line">
        <rect x="0" y="0" width="671" height="537" rx="4" />
        <rect x="-4" y="40" width="44" height="170" rx="2" />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={`v${i}`} x={200 + 14 * i} y="70" width="10" height="36" rx="1" />
        ))}
        <rect x="230" y="130" width="120" height="120" rx="2" />
        <rect x="250" y="150" width="80" height="80" rx="1" />
        <path d="M250 150l12 0l-12 12z" />
        {Array.from({ length: 4 }, (_, i) => (
          <g key={`d${i}`}>
            <rect x={400 + 18 * i} y="60" width="10" height="300" rx="1" />
            <path d={`M${400 + 18 * i} 80h10M${400 + 18 * i} 340h10`} />
          </g>
        ))}
        <rect x="598" y="150" width="26" height="110" rx="2" />
        <rect x="300" y="330" width="56" height="56" rx="2" />
        <path d="M310 345h36M310 358h36M310 371h36" />
        <rect x="380" y="290" width="22" height="110" rx="2" />
        <rect x="160" y="400" width="22" height="110" rx="2" />
        <rect x="60" y="290" width="214" height="10" rx="1" />
        <rect x="60" y="330" width="64" height="10" rx="1" />
        <rect x="60" y="370" width="64" height="10" rx="1" />
        <rect x="60" y="410" width="214" height="10" rx="1" />
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={`s${i}`} x="612" y={320 + 24 * i} width="14" height="20" rx="1" />
        ))}
        <circle cx="120" cy="470" r="12" />
        <rect x="420" y="480" width="60" height="12" rx="1" />
        <rect x="520" y="480" width="40" height="12" rx="1" />
      </g>
      <g className="bp-fill">
        {Array.from({ length: 12 }, (_, r) => (
          <g key={`p${r}`}>
            <circle cx="606" cy={158 + 8.5 * r} r="1.6" />
            <circle cx="616" cy={158 + 8.5 * r} r="1.6" />
          </g>
        ))}
        <circle cx="14" cy="14" r="4" /><circle cx="657" cy="14" r="4" />
        <circle cx="14" cy="523" r="4" /><circle cx="657" cy="523" r="4" />
        <circle cx="335" cy="14" r="4" /><circle cx="335" cy="523" r="4" />
        <circle cx="14" cy="268" r="4" /><circle cx="657" cy="268" r="4" />
      </g>
      <rect className="bp-pulse" x="0" y="0" width="671" height="537" rx="4" pathLength={100} style={vars({ '--pulse': '16s', '--pd': '4s' })} />
      <use href={`${LABEL}bp-atx`} x="0" y="562" />
    </g>
  );
}

function Gpu() {
  return (
    <g transform="translate(680 140) scale(0.9)" style={vars({ '--d': '0.3s', '--spin': '24s' })}>
      <g className="bp-line">
        <rect x="0" y="0" width="670" height="300" rx="6" />
        {[150, 335, 520].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="150" r="62" />
            <circle cx={cx} cy="150" r="14" />
            <circle className="bp-spin" cx={cx} cy="150" r="42" strokeDasharray="7 11" />
          </g>
        ))}
        <rect x="-18" y="10" width="18" height="280" rx="1" />
        <rect x="-14" y="40" width="10" height="22" />
        <rect x="-14" y="72" width="10" height="22" />
        <rect x="-14" y="104" width="10" height="22" />
        <rect x="-14" y="136" width="10" height="22" />
        <rect x="60" y="300" width="180" height="10" />
        <rect x="600" y="-12" width="48" height="12" rx="1" />
      </g>
      <rect className="bp-pulse" x="0" y="0" width="670" height="300" rx="6" pathLength={100} style={vars({ '--pulse': '13s', '--pd': '7s' })} />
      <use href={`${LABEL}bp-gpu`} x="0" y="330" />
    </g>
  );
}

function Psu() {
  return (
    <g transform="translate(680 482) scale(0.9)" style={vars({ '--d': '0.9s', '--spin': '32s' })}>
      <g className="bp-line">
        <rect x="0" y="0" width="330" height="190" rx="4" />
        <circle cx="130" cy="95" r="70" />
        <circle cx="130" cy="95" r="12" />
        <circle className="bp-spin" cx="130" cy="95" r="46" strokeDasharray="7 11" />
      </g>
      <g className="bp-fill">
        {Array.from({ length: 24 }, (_, k) => (
          <circle key={k} cx={250 + 12 * (k % 6)} cy={40 + 12 * Math.floor(k / 6)} r="2" />
        ))}
      </g>
      <use href={`${LABEL}bp-psu`} x="0" y="214" />
    </g>
  );
}

function Ram() {
  return (
    <g transform="translate(986 482) scale(0.9)" style={vars({ '--d': '1.1s' })}>
      <g className="bp-line">
        <rect x="0" y="0" width="300" height="32" rx="2" />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={10 + 36 * i} y="7" width="28" height="18" rx="1" />
        ))}
        <path className="bp-dash" d="M8 32h284" strokeDasharray="3 3" />
      </g>
      <use href={`${LABEL}bp-ram`} x="0" y="56" />
    </g>
  );
}

function M2() {
  return (
    <g transform="translate(986 554) scale(0.9)" style={vars({ '--d': '1.3s' })}>
      <g className="bp-line">
        <rect x="0" y="0" width="176" height="22" rx="2" />
        <rect x="30" y="4" width="40" height="14" rx="1" />
        <rect x="80" y="4" width="40" height="14" rx="1" />
        <rect x="130" y="4" width="26" height="14" rx="1" />
        <path d="M0 6h-8v10h8" />
      </g>
      <use href={`${LABEL}bp-m2`} x="0" y="46" />
    </g>
  );
}

function Fan() {
  return (
    <g transform="translate(-1228 720) scale(0.9)" style={vars({ '--d': '0.6s', '--spin': '40s' })}>
      <g className="bp-line">
        <rect x="0" y="0" width="308" height="308" rx="20" />
        <circle cx="154" cy="154" r="150" />
        <circle cx="154" cy="154" r="28" />
        <circle className="bp-spin" cx="154" cy="154" r="100" strokeDasharray="9 14" />
        <circle cx="22" cy="22" r="5" /><circle cx="286" cy="22" r="5" />
        <circle cx="22" cy="286" r="5" /><circle cx="286" cy="286" r="5" />
      </g>
      <use href={`${LABEL}bp-fan`} x="0" y="332" />
    </g>
  );
}

function Aio() {
  return (
    <g transform="translate(708 720) scale(0.9)" style={vars({ '--d': '1.5s', '--spin': '28s' })}>
      <g className="bp-line">
        <rect x="0" y="0" width="394" height="120" rx="4" />
        {[65, 197, 329].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="60" r="55" />
            <circle cx={cx} cy="60" r="10" />
            <circle className="bp-spin" cx={cx} cy="60" r="38" strokeDasharray="7 11" />
          </g>
        ))}
        <path d="M394 30h40q30 0 30 30v120M394 90h20q30 0 30 30v60" />
      </g>
      <path className="bp-pulse" d="M394 30h40q30 0 30 30v120M394 90h20q30 0 30 30v60" pathLength={100} style={vars({ '--pulse': '9s', '--pd': '5.5s' })} />
      <use href={`${LABEL}bp-aio`} x="0" y="144" />
    </g>
  );
}

export default function BlueprintParts({ lit = false }: { lit?: boolean }) {
  return (
    <svg x="50%" overflow="visible" className={lit ? 'bp-parts bp-parts--lit' : 'bp-parts'} aria-hidden="true">
      {drawable(
        <>
          {Motherboard()}
          {Fan()}
          {Gpu()}
          {Psu()}
          {Ram()}
          {M2()}
          {Aio()}
        </>,
      )}
    </svg>
  );
}
