// components/BlueprintParts.tsx
// مخطّط القطع — خلفيّة الوضع الداكن: توأم «ورقة المخطّط» ليلاً.
//
// ============ الجولة الثانية (2026-11-02، «ابيك تحسن الرسمات الي يسار ويمين») ============
// كانت مستطيلاتٍ ودوائر مجرّدة، وعلى شاشة نوّاف (~2000px) تُقصّ من الطرفين لأنّ
// إحداثيّاتها ثابتة (±664 إلى ±1268 عن المنتصف). الآن:
//   · لوحتان (يسار ويمين) كلٌّ منهما <svg> بـviewBox، عرضها هامشُ الشاشة نفسه
//     (globals.css · .bp-side) — فتصغر مع الشاشة ولا تُقصّ.
//   · رسمٌ هندسيّ بمصطلحاته: خطٌّ سميك للمحيط ورفيع للتفاصيل، خطوط أبعادٍ
//     بأسهم وخطوط امتداد، خطوط مراكز (شرطة-نقطة)، تهشير المشتّتات، «تفصيلة A»
//     مكبّرة لمقبس المعالج، ومربّع عنوانٍ كلوحات المهندسين.
//   · القطع بمقاسها الحقيقيّ (٢٫٢ وحدة لكلّ مم): ATX 305×244، مروحة ١٤٠، كرت
//     304 بثلاث مراوح ٩٠، ظهر المزوّد 150×86، شريحة DDR5 133×31، M.2 2280.
//     والمبرّد ٣٦٠ وحده بمقياس ١:٢ (مكتوبٌ في تسميته) وإلّا ما وسعته اللوحة.
//
// الحركة (globals.css · bp-draw/bp-spin/bp-pulse): كلّ شكلٍ يأخذ pathLength=1
// (drawable أدناه) فتُخطّ القطع مرّةً عند التحميل بتفاوت --d، وتدور حلقةٌ
// متقطّعة عند حافّة كلّ مروحة، وتجري نبضةٌ على المحيطات.
// ⚠️ ما له strokeDasharray لا يأخذ pathLength: الطول المعياريّ يكبّر الشرطات
// بنسبة طول الشكل فيصير الخطّ المتقطّع متّصلاً — وهكذا كانت حلقات المراوح
// «الدوّارة» دوائر مصمتة لا تُرى حركتها.
//
// ⚠️ التسميات من public/draft-labels.svg عبر use لا نصّاً هنا: نصٌّ داخل SVG
// الصفحة يقرؤه الزاحف أوّلَ ما في كلّ صفحة (درس أدسنس 2026-10).
// تُستعمل مرّتين: باهتةً في PCBBackground، ومضيئةً داخل مصباح المؤشّر (lit) —
// فمعرّفات النقوش والقصّ بلاحقةٍ لكلّ نسخة.

import { Children, cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from 'react';

const LABEL = '/draft-labels.svg#';
const SHAPES = new Set(['rect', 'circle', 'path', 'line', 'ellipse', 'polygon', 'polyline']);
const vars = (v: Record<string, string>) => v as CSSProperties;
const f = (n: number) => Math.round(n * 10) / 10;
const rad = (deg: number) => (deg * Math.PI) / 180;
const P = (cx: number, cy: number, deg: number, r: number) => `${f(cx + r * Math.cos(rad(deg)))} ${f(cy + r * Math.sin(rad(deg)))}`;
/* خطّ المراكز في الرسم الهندسيّ: شرطةٌ طويلة ثمّ نقطة */
const CENTER = '14 4 2 4';

/* يضيف pathLength=1 لكلّ شكلٍ لم يحدّده ولا شرطات له — فتعمل حركة الخطّ
   (stroke-dashoffset من ١ إلى ٠) على كلّ الأشكال بقاعدة CSS واحدة.
   ⚠️ يمشي على شجرة العناصر كما هي، فالقطع تُستدعى دوالَّ ({Gpu()}) لا عناصر
   (<Gpu />): مكوّنٌ لم يُرسم بعد لا أبناء له هنا، فتبقى أشكاله بلا pathLength
   وتظهر الشرطة «1.01 1» نقاطاً بكسليّة بدل خطٍّ متّصل */
function drawable(node: ReactNode): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<Record<string, unknown>>;
    const kids = el.props.children as ReactNode | undefined;
    const add = typeof el.type === 'string' && SHAPES.has(el.type)
      && el.props.pathLength === undefined && el.props.strokeDasharray === undefined;
    if (!add && kids === undefined) return el;
    return kids === undefined ? cloneElement(el, { pathLength: 1 }) : cloneElement(el, add ? { pathLength: 1 } : {}, drawable(kids));
  });
}

/* ---------------------------------------------------------------- أدوات الرسم */

/* خطّ أبعادٍ أفقيّ عند y: خطّا امتداد من الجسم (from) إلى ما بعد الخطّ بست
   وحدات، والخطّ بفجوةٍ في وسطه للرقم، وسهمان مصمتان */
function dimH(x1: number, x2: number, y: number, from: number, gap = 46) {
  const s = y < from ? -1 : 1;
  const m = (x1 + x2) / 2;
  return {
    lines: `M${x1} ${from + 4 * s}V${y + 6 * s}M${x2} ${from + 4 * s}V${y + 6 * s}M${x1} ${y}H${m - gap / 2}M${m + gap / 2} ${y}H${x2}`,
    arrows: `M${x1} ${y}l10 -3.2v6.4zM${x2} ${y}l-10 -3.2v6.4z`,
    mid: m,
  };
}
function dimV(y1: number, y2: number, x: number, from: number, gap = 46) {
  const s = x < from ? -1 : 1;
  const m = (y1 + y2) / 2;
  return {
    lines: `M${from + 4 * s} ${y1}H${x + 6 * s}M${from + 4 * s} ${y2}H${x + 6 * s}M${x} ${y1}V${m - gap / 2}M${x} ${m + gap / 2}V${y2}`,
    arrows: `M${x} ${y1}l-3.2 10h6.4zM${x} ${y2}l-3.2 -10h6.4z`,
    mid: m,
  };
}

/* تهشيرٌ بزاوية ٤٥ داخل مستطيل — مسارٌ واحد */
function hatch(x: number, y: number, w: number, h: number, step = 8) {
  let d = '';
  for (let k = step; k < w + h; k += step) {
    d += `M${f(x + Math.min(k, w))} ${f(y + Math.max(0, k - w))}L${f(x + Math.max(0, k - h))} ${f(y + Math.min(k, h))}`;
  }
  return d;
}
/* زعانف مشتّت: خطوطٌ متوازية داخل مستطيل */
function fins(x: number, y: number, w: number, h: number, step: number, dir: 'v' | 'h', inset = 4) {
  let d = '';
  if (dir === 'v') for (let k = x + step; k < x + w - 1; k += step) d += `M${f(k)} ${y + inset}V${y + h - inset}`;
  else for (let k = y + step; k < y + h - 1; k += step) d += `M${x + inset} ${f(k)}H${x + w - inset}`;
  return d;
}
/* شفرات مروحة منحنية من المحور r0 إلى الطرف r1 — مسارٌ واحد */
function blades(cx: number, cy: number, r0: number, r1: number, n: number, sweep: number, width: number) {
  const rm = (r0 + r1) / 2;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (360 / n) * i - 90;
    d += `M${P(cx, cy, a, r0)}Q${P(cx, cy, a + sweep * 0.3, rm * 1.05)} ${P(cx, cy, a + sweep, r1)}`
      + `A${r1} ${r1} 0 0 1 ${P(cx, cy, a + sweep + width, r1)}`
      + `Q${P(cx, cy, a + width * 0.85 + sweep * 0.32, rm * 0.98)} ${P(cx, cy, a + width * 0.6, r0)}Z`;
  }
  return d;
}
/* علامة مركز: صليبٌ يتجاوز الدائرة قليلاً */
const crossAt = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}H${cx + r}M${cx} ${cy - r}V${cy + r}`;

/* مروحةٌ كاملة: حلقة، شفرات، محور، حلقةٌ متقطّعة تدور عند الحافّة، وعلامة مركز */
function Rotor({ cx, cy, r, n, hub }: { cx: number; cy: number; r: number; n: number; hub: number }) {
  return (
    <>
      <g className="bp-line">
        <circle cx={cx} cy={cy} r={r} />
        <circle cx={cx} cy={cy} r={hub} />
      </g>
      <g className="bp-thin">
        <path d={blades(cx, cy, hub + 2, r - 6, n, n > 7 ? 30 : 36, n > 7 ? 19 : 25)} />
        <circle cx={cx} cy={cy} r={hub * 0.4} />
        <circle className="bp-spin" cx={cx} cy={cy} r={r - 3} strokeDasharray="5 13" />
        <path className="bp-dash" d={crossAt(cx, cy, r + 10)} strokeDasharray={CENTER} />
      </g>
    </>
  );
}

/* ================================================================ اللوحة اليسرى */

function Motherboard({ uid }: { uid: string }) {
  const w = dimH(0, 671, -24, 0);
  const h = dimV(0, 537, -30, 0);
  return (
    <g transform="translate(52 44)" style={vars({ '--d': '0s' })}>
      <g className="bp-line">
        <rect x="0" y="0" width="671" height="537" rx="4" />
        {/* غطاء المنافذ الخلفيّة */}
        <path d="M-6 20H58L66 30V240L58 250H-6Z" />
        {/* مشتّتا الطاقة حول المقبس */}
        <rect x="80" y="22" width="238" height="44" rx="4" />
        <rect x="80" y="74" width="44" height="170" rx="4" />
        {/* المقبس: الإطار وصفيحة الضغط */}
        <rect x="150" y="86" width="150" height="150" rx="4" />
        <rect x="166" y="102" width="118" height="118" rx="2" />
        {/* أربعة منافذ رام */}
        {[356, 374, 392, 410].map((x) => <rect key={x} x={x} y="34" width="10" height="293" rx="1" />)}
        {/* موصّل ٢٤ سنّاً وموصّل المعالج ٨ */}
        <rect x="620" y="150" width="30" height="122" rx="2" />
        <rect x="92" y="2" width="44" height="14" rx="1" />
        {/* غطاء M.2 الأوّل، ومنافذ PCIe */}
        <rect x="140" y="252" width="204" height="46" rx="4" />
        <rect x="56" y="310" width="204" height="20" rx="2" />
        <rect x="60" y="360" width="52" height="12" rx="1" />
        <rect x="60" y="448" width="196" height="12" rx="1" />
        {/* مشتّت الشريحة، وSATA، والبطّاريّة */}
        <rect x="440" y="360" width="120" height="96" rx="8" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x="624" y={322 + 24 * i} width="24" height="18" rx="1" />)}
        <circle cx="392" cy="480" r="18" />
      </g>
      <g className="bp-thin">
        <path d={hatch(-2, 24, 64, 222, 9)} />
        <path d={fins(80, 22, 238, 44, 7, 'v')} />
        <path d={fins(80, 74, 44, 170, 7, 'h')} />
        <path d={fins(140, 252, 204, 46, 8, 'v', 6)} />
        <path d={hatch(446, 366, 108, 84, 10)} />
        {/* ثقوب التثبيت التسعة */}
        {[[20, 22], [300, 22], [650, 22], [20, 290], [330, 300], [650, 300], [20, 515], [330, 515], [650, 515]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="7" />
        ))}
        {/* مسامير المقبس، ومثلّث السنّ الأوّل */}
        {[[140, 76], [310, 76], [140, 246], [310, 246]].map(([x, y]) => <circle key={`s${x}${y}`} cx={x} cy={y} r="4" />)}
        <path d="M166 102h14l-14 14z" />
        {/* لسانا منفذ الرام ومفتاح DDR5 */}
        <path d={[356, 374, 392, 410].map((x) => `M${x} 48h10M${x} 313h10M${x} 172h10`).join('')} />
        {/* تقوية منفذ PCIe الأوّل ومزلاجه، ومفاتيح المنافذ */}
        <path d="M60 320H256M86 314v12M86 448v12M76 360v12M260 306h12v28h-12M256 444h12v20h-12" />
        {/* M.2 الثاني: الموصّل ومسمار التثبيت والقرص بخطٍّ مخفيّ */}
        <rect x="140" y="384" width="10" height="48" rx="1" />
        <circle cx="318" cy="408" r="5" />
        <circle cx="392" cy="480" r="13" />
        {/* رؤوس اللوحة الأماميّة */}
        <path d="M60 508h44v14h-44zM300 508h52v14h-52zM470 508h64v14h-64zM560 508h40v14h-40zM442 6h22v12h-22zM592 60h22v12h-22z" />
      </g>
      <g className="bp-thin">
        <path className="bp-dash" d="M150 384H316V432H150" strokeDasharray="6 4" />
        {/* مركز المقبس، ودائرة التفصيلة A */}
        <path className="bp-dash" d={crossAt(225, 161, 92)} strokeDasharray={CENTER} />
        <circle className="bp-dash" cx="225" cy="161" r="100" strokeDasharray={CENTER} />
      </g>
      <g className="bp-fill">
        {Array.from({ length: 12 }, (_, r) => (
          <g key={`p${r}`}>
            <circle cx="630" cy={159 + 9.2 * r} r="1.7" />
            <circle cx="640" cy={159 + 9.2 * r} r="1.7" />
          </g>
        ))}
        <path d={w.arrows + h.arrows} />
      </g>
      <path className="bp-thin" d={w.lines + h.lines} />
      <use href={`${LABEL}bp-d305`} x={w.mid} y="-24" />
      <use href={`${LABEL}bp-d244`} transform={`translate(-30 ${h.mid}) rotate(-90)`} />
      <use href={`${LABEL}bp-a`} x="306" y="72" />
      <rect className="bp-pulse" x="0" y="0" width="671" height="537" rx="4" pathLength={100} style={vars({ '--pulse': '16s', '--pd': '4s' })} />
      <use href={`${LABEL}bp-atx`} x="0" y="566" />
      {DetailA({ uid })}
    </g>
  );
}

/* تفصيلة A: المقبس مكبّراً ٢:١ — حقل الأسنان ومنتصفه الخالي، والإطار مقصوصاً بالدائرة */
function DetailA({ uid }: { uid: string }) {
  const cx = 512, cy = 760, R = 128;
  const clip = `bp-clip-${uid}`;
  const pins = `bp-pins-${uid}`;
  return (
    <g style={vars({ '--d': '0.8s' })}>
      <defs>
        <clipPath id={clip}><circle cx={cx} cy={cy} r={R - 1} /></clipPath>
        <pattern id={pins} width="9" height="9" patternUnits="userSpaceOnUse" x={cx} y={cy}>
          <circle className="bp-pat" cx="4.5" cy="4.5" r="1.4" />
        </pattern>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <path className="bp-patfill" fillRule="evenodd" fill={`url(#${pins})`} d={`M${cx - 104} ${cy - 104}h208v208h-208zM${cx - 30} ${cy - 30}v60h60v-60z`} />
        <g className="bp-line">
          <rect x={cx - 150} y={cy - 150} width="300" height="300" rx="8" />
          <rect x={cx - 118} y={cy - 118} width="236" height="236" rx="4" />
        </g>
        <g className="bp-thin">
          <rect x={cx - 104} y={cy - 104} width="208" height="208" />
          <rect x={cx - 30} y={cy - 30} width="60" height="60" />
          <path d={`M${cx - 104} ${cy - 104}h22l-22 22z`} />
          <path className="bp-dash" d={crossAt(cx, cy, R)} strokeDasharray={CENTER} />
        </g>
      </g>
      <circle className="bp-line" cx={cx} cy={cy} r={R} style={{ fill: 'none' }} />
      <use href={`${LABEL}bp-det-a`} x={cx} y={cy + R + 26} />
    </g>
  );
}

function CaseFan() {
  const d = dimH(0, 308, 334, 308);
  return (
    <g transform="translate(52 628)" style={vars({ '--d': '0.5s', '--spin': '40s' })}>
      <g className="bp-line">
        <rect x="0" y="0" width="308" height="308" rx="22" />
      </g>
      <g className="bp-thin">
        {[[22, 22], [286, 22], [22, 286], [286, 286]].map(([x, y]) => (
          <g key={`${x}-${y}`}><circle cx={x} cy={y} r="8" /><circle cx={x} cy={y} r="4" /></g>
        ))}
      </g>
      {/* دعامات الإطار من الزوايا إلى المحور — خلف الشفرات، فخطٌّ مخفيّ */}
      <path className="bp-thin bp-dash" d="M36 36L118 118M272 36L190 118M36 272L118 190M272 272L190 190" strokeDasharray="6 4" />
      {Rotor({ cx: 154, cy: 154, r: 146, n: 7, hub: 36 })}
      <path className="bp-thin" d={d.lines} />
      <path className="bp-fill" d={d.arrows} />
      <use href={`${LABEL}bp-d140`} x={d.mid} y="334" />
      <use href={`${LABEL}bp-fan`} x="0" y="372" />
    </g>
  );
}

/* ================================================================ اللوحة اليمنى */

function Gpu() {
  const d = dimH(0, 670, -30, -14);
  return (
    <g transform="translate(40 50)" style={vars({ '--d': '0.3s', '--spin': '24s' })}>
      <g className="bp-line">
        {/* الغطاء بزواياه المشطوفة */}
        <path d="M16 0H654L670 16V248L654 264H16L0 248V16Z" />
        {/* الحامل المعدنيّ بمخارج الشاشة */}
        <path d="M-24 -8H-4V284H-24Z" />
        {/* أصابع PCIe ×16 وموصّل الطاقة 12V-2x6 */}
        <rect x="60" y="264" width="196" height="16" rx="1" />
        <rect x="528" y="-14" width="56" height="14" rx="2" />
      </g>
      <g className="bp-thin">
        <path d="M0 34H78L98 14H572L592 34H670M0 230H78L98 250H572L592 230H670" />
        {[18, 64, 110, 156].map((y) => <rect key={y} x="-20" y={y} width="12" height="34" rx="2" />)}
        <path d={fins(60, 266, 196, 14, 4.2, 'v', 1) + 'M85 264v16'} />
        <path d={Array.from({ length: 6 }, (_, i) => `M${534 + 8 * i} -10h5v6h-5z`).join('')} />
      </g>
      {[125, 335, 545].map((cx) => <g key={cx}>{Rotor({ cx, cy: 132, r: 98, n: 9, hub: 28 })}</g>)}
      <path className="bp-thin" d={d.lines} />
      <path className="bp-fill" d={d.arrows} />
      <use href={`${LABEL}bp-d304`} x={d.mid} y="-30" />
      <path className="bp-pulse" d="M16 0H654L670 16V248L654 264H16L0 248V16Z" pathLength={100} style={vars({ '--pulse': '13s', '--pd': '7s' })} />
      <use href={`${LABEL}bp-gpu`} x="0" y="312" />
    </g>
  );
}

/* ظهر المزوّد: شبكة التهوية المثقّبة، ومدخل الكهرباء، والمفتاح */
function Psu({ uid }: { uid: string }) {
  const grille = `bp-grille-${uid}`;
  const d = dimH(0, 330, -22, 0);
  return (
    <g transform="translate(40 418)" style={vars({ '--d': '0.9s' })}>
      <defs>
        <pattern id={grille} width="12" height="10.4" patternUnits="userSpaceOnUse">
          <circle className="bp-pat-s" cx="3" cy="2.6" r="2.3" />
          <circle className="bp-pat-s" cx="9" cy="7.8" r="2.3" />
        </pattern>
      </defs>
      <rect className="bp-patfill" x="22" y="20" width="196" height="149" rx="6" fill={`url(#${grille})`} />
      <g className="bp-line">
        <rect x="0" y="0" width="330" height="189" rx="4" />
        <rect x="22" y="20" width="196" height="149" rx="6" />
        <path d="M244 46H292V70L282 84H254L244 70Z" />
        <rect x="256" y="112" width="26" height="40" rx="3" />
      </g>
      <g className="bp-thin">
        {[[10, 10], [320, 10], [10, 179], [320, 179]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" />)}
        <path d="M256 54h8v12h-8zM272 54h8v12h-8zM264 70h8v8h-8zM260 132H278M269 118v8M269 138a5 5 0 1 0 0.1 0" />
      </g>
      <path className="bp-thin" d={d.lines} />
      <path className="bp-fill" d={d.arrows} />
      <use href={`${LABEL}bp-d150`} x={d.mid} y="-22" />
      <use href={`${LABEL}bp-psu`} x="0" y="214" />
    </g>
  );
}

/* شريحة DDR5: الرقائق الثمان ومنظّم الطاقة، والأصابع ومفتاحها، وثلمتا المزلاج */
function Ram() {
  const d = dimH(0, 293, -18, 0);
  return (
    <g transform="translate(410 418)" style={vars({ '--d': '1.1s' })}>
      <g className="bp-line">
        <path d="M0 0H293V24A6 6 0 0 0 293 36V69H150V62H144V69H0V36A6 6 0 0 0 0 24Z" />
      </g>
      <g className="bp-thin">
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={14 + 34 * i + (i > 3 ? 8 : 0)} y="10" width="26" height="26" rx="1" />)}
        <rect x="140" y="40" width="14" height="12" rx="1" />
        <path d={fins(4, 58, 286, 11, 3.6, 'v', 1)} />
      </g>
      <path className="bp-thin" d={d.lines} />
      <path className="bp-fill" d={d.arrows} />
      <use href={`${LABEL}bp-d133`} x={d.mid} y="-18" />
      <use href={`${LABEL}bp-ram`} x="0" y="94" />
    </g>
  );
}

/* M.2 2280: الموصّل بمفتاح M، والمتحكّم وشريحتا الذاكرة، ونصف ثقب المسمار */
function M2() {
  const d = dimH(0, 176, 66, 48);
  return (
    <g transform="translate(410 548)" style={vars({ '--d': '1.3s' })}>
      <g className="bp-line">
        <path d="M0 0H176V18A6 6 0 0 0 176 30V48H0V35H8V31H0Z" />
      </g>
      <g className="bp-thin">
        <rect x="22" y="10" width="34" height="28" rx="2" />
        <rect x="66" y="7" width="44" height="34" rx="2" />
        <rect x="118" y="7" width="44" height="34" rx="2" />
        <path d={fins(0, 3, 8, 28, 3, 'h', 1) + fins(0, 34, 8, 12, 3, 'h', 1)} />
      </g>
      <path className="bp-thin" d={d.lines} />
      <path className="bp-fill" d={d.arrows} />
      <use href={`${LABEL}bp-d80`} x={d.mid} y="66" />
      <use href={`${LABEL}bp-m2`} x="200" y="28" />
    </g>
  );
}

/* المبرّد المائيّ ٣٦٠ بمقياس ١:٢ — الرادييتر بخزّانيه ومراوحه، والأنبوبان إلى رأس المضخّة */
function Aio() {
  const tubes = 'M437 34H476Q504 34 504 62V188M437 98H462Q482 98 482 118V190';
  return (
    <g transform="translate(40 688)" style={vars({ '--d': '1.5s', '--spin': '28s' })}>
      <g className="bp-line">
        <rect x="0" y="0" width="437" height="132" rx="4" />
        <rect x="0" y="0" width="20" height="132" rx="3" />
        <rect x="417" y="0" width="20" height="132" rx="3" />
        <path d={tubes} />
        <circle cx="493" cy="232" r="46" />
      </g>
      <g className="bp-thin">
        {[20, 152, 284].map((x) => <rect key={x} x={x} y="0" width="132" height="132" rx="8" />)}
        <circle cx="493" cy="232" r="34" />
        {/* شاشة المضخّة: شعار البرق */}
        <path d="M497 210L479 236H492L489 254L507 228H494Z" />
      </g>
      {[86, 218, 350].map((cx) => <g key={cx}>{Rotor({ cx, cy: 66, r: 60, n: 7, hub: 16 })}</g>)}
      <path className="bp-pulse" d={tubes} pathLength={100} style={vars({ '--pulse': '9s', '--pd': '5.5s' })} />
      <use href={`${LABEL}bp-aio`} x="0" y="158" />
    </g>
  );
}

/* مربّع العنوان كما في لوحات المهندسين */
function TitleBlock() {
  return (
    <g transform="translate(586 688)" style={vars({ '--d': '1.8s' })}>
      <g className="bp-line"><rect x="0" y="0" width="130" height="100" rx="2" /></g>
      <path className="bp-thin" d="M0 34H130M0 62H130M65 62V100" />
      <use className="bp-big" href={`${LABEL}bp-tb1`} x="65" y="17" />
      <use href={`${LABEL}bp-tb2`} x="65" y="48" />
      <use href={`${LABEL}bp-tb3`} x="32.5" y="81" />
      <use href={`${LABEL}bp-tb4`} x="97.5" y="81" />
    </g>
  );
}

export default function BlueprintParts({ lit = false }: { lit?: boolean }) {
  const uid = lit ? 'l' : 'b';
  return (
    <div className={lit ? 'bp-parts bp-parts--lit' : 'bp-parts'} aria-hidden="true">
      <svg className="bp-side bp-side--l" viewBox="0 0 740 1010">
        {drawable(
          <>
            {Motherboard({ uid })}
            {CaseFan()}
          </>,
        )}
      </svg>
      <svg className="bp-side bp-side--r" viewBox="0 0 740 1010">
        {drawable(
          <>
            {Gpu()}
            {Psu({ uid })}
            {Ram()}
            {M2()}
            {Aio()}
            {TitleBlock()}
          </>,
        )}
      </svg>
    </div>
  );
}
