// components/PCBBackground.tsx
// خلفية الموقع: مسارات اللوحة الأم في الداكن، وورقة رسمٍ هندسيّ في الفاتح.
// تُوضع في الـ layout لتظهر خلف كل الصفحات (navbar + المحتوى + footer).

import BackgroundLamp from './BackgroundLamp';
import SketchGate from './SketchGate';

/* منحنى «رفع الأبيض»: ٤١ نقطة على [٠،١] — مطابقٌ حتى ٠٫٨، ثمّ أعمق قليلاً، والأبيض ١ */
const WHITE_LIFT = [
  ...Array.from({ length: 33 }, (_, i) => i / 40),
  0.8, 0.815, 0.835, 0.855, 0.88, 0.905, 0.94, 1,
].map((v) => v.toFixed(4)).join(' ');

export default function PCBBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">

      {/* ===== الوضع الفاتح: ورقة رسمٍ هندسيّ (2026-10-11) =====
          شبكةٌ دقيقة كلّ ٢٤px، وأخرى أوضح كلّ ١٢٠px، وعلامة «+» عند تقاطعاتها
          كورق المهندسين. والقناع يخفّفها في الوسط حيث يُقرأ المحتوى. */}
      <svg
        className="absolute inset-0 w-full h-full dark:hidden [mask-image:radial-gradient(ellipse_at_50%_35%,rgb(0_0_0/0.45),#000_75%)]"
        aria-hidden="true"
      >
        <defs>
          <pattern id="draftMinor" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="#2F5D8A" strokeOpacity="0.09" strokeWidth="1" />
          </pattern>
          <pattern id="draftMajor" x="50%" width="120" height="120" patternUnits="userSpaceOnUse">
            <rect width="120" height="120" fill="url(#draftMinor)" />
            <path d="M120 0H0V120" fill="none" stroke="#2F5D8A" strokeOpacity="0.17" strokeWidth="1" />
            {/* «+» عند التقاطع: كلّ بلاطةٍ ترسم ربعها عند زواياها الأربع،
                فتكتمل العلامة من البلاطات الأربع المتجاورة */}
            <g stroke="#1A3D5E" strokeOpacity="0.38" strokeWidth="1.2">
              <path d="M0 0H5M0 0V5" />
              <path d="M120 0H115M120 0V5" />
              <path d="M0 120H5M0 120V115" />
              <path d="M120 120H115M120 120V115" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#draftMajor)" />
      </svg>

      {/* ===== رسوم الإنشاء — تُخطّ وحدها ثمّ تتلاشى (globals.css · draft-sketch) =====
          الشبكة مرساها وسط الشاشة (x=50%)، وهذه الطبقة كذلك، فالإحداثيّات
          نسبةً للمنتصف ومضاعفاتٌ لـ٢٤ — كلّ خطٍّ يقع على خطّ شبكة. والمقاسات
          من عالم القطع: عرض اللوحة الأمّ ATX، مروحة ١٤٠، أقراص M.2 2280،
          منفذ PCIe. في الهوامش لا تحت النصّ. */}
      <svg className="draft-sketches absolute inset-0 w-full h-full dark:hidden" aria-hidden="true">
        <svg x="50%" overflow="visible">
          <g fill="none" stroke="#1A3D5E" strokeOpacity="0.5" strokeWidth="1">
            {/* ATX: خطّ أبعاد بخطّي امتداد وعلامتين مائلتين */}
            <g className="draft-sketch" style={{ animationDelay: '1s' }}>
              <path pathLength={1} d="M-600 120V192M-360 120V192" />
              <path pathLength={1} d="M-600 168H-360" />
              <path pathLength={1} d="M-606 174L-594 162M-366 174L-354 162" />
              <text x="-480" y="156" textAnchor="middle" direction="ltr">305 mm · ATX</text>
            </g>
            {/* مروحة ١٤٠: دائرةٌ بفرجار، ومحورٌ، وقطرٌ مائل */}
            <g className="draft-sketch" style={{ animationDelay: '7s' }}>
              <path pathLength={1} d="M552 336A72 72 0 1 1 408 336A72 72 0 1 1 552 336" />
              <path pathLength={1} d="M504 336A24 24 0 1 1 456 336A24 24 0 1 1 504 336" />
              <path pathLength={1} d="M456 336H504M480 312V360" />
              <path pathLength={1} d="M429 387L531 285L564 252H624" />
              <text x="594" y="244" textAnchor="middle" direction="ltr">Ø140 FAN</text>
            </g>
            {/* M.2 2280: بصمة القرص وسطر الموصل وبُعده */}
            <g className="draft-sketch" style={{ animationDelay: '13s' }}>
              <path pathLength={1} d="M-576 432H-528V600H-576Z" />
              <path pathLength={1} d="M-576 576H-528M-560 576V600" />
              <path pathLength={1} d="M-504 432V600M-510 438L-498 426M-510 606L-498 594" />
              <text x="-468" y="520" textAnchor="middle" direction="ltr">M.2</text>
              <text x="-468" y="536" textAnchor="middle" direction="ltr">2280</text>
            </g>
            {/* PCIe: دائرة إشارةٍ وخطّ استدعاءٍ إلى العنوان */}
            <g className="draft-sketch" style={{ animationDelay: '19s' }}>
              <path pathLength={1} d="M414 624A6 6 0 1 1 402 624A6 6 0 1 1 414 624" />
              <path pathLength={1} d="M412 618L480 552H624" />
              <text x="552" y="544" textAnchor="middle" direction="ltr">PCIe 5.0 ×16</text>
            </g>
          </g>
        </svg>
      </svg>

      {/* ===== الوضع الداكن: مسارات داكنة + نبضات مضيئة ===== */}
      <svg className="absolute inset-0 w-full h-full hidden dark:block opacity-[0.55]" aria-hidden="true">
        <defs>
          <pattern id="pcbPatternDark" width="340" height="280" patternUnits="userSpaceOnUse">
            <path d="M0 0 H340 M0 0 V280" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.06" />
            <g stroke="#1e3a4a" strokeWidth="1.5" fill="none">
              <path d="M0 60 H90 L120 90 H200 M200 90 L230 60 H340" />
              <path d="M0 210 H70 L100 180 H180" />
              <path d="M340 230 H260 L230 200 H150" />
              <path d="M45 0 V40 L75 70 V130" />
              <path d="M300 280 V220 L270 190 V120" />
              <path d="M180 90 V160 L210 190 H280" />
            </g>
            <g fill="#164e63">
              <circle cx="90" cy="60" r="3.5" /><circle cx="200" cy="90" r="3.5" />
              <circle cx="70" cy="210" r="3.5" /><circle cx="260" cy="230" r="3.5" />
              <circle cx="75" cy="70" r="3.5" /><circle cx="180" cy="160" r="3.5" />
              <circle cx="280" cy="190" r="3.5" />
            </g>
            <path className="trace-pulse" d="M0 60 H90 L120 90 H200 M200 90 L230 60 H340" stroke="url(#traceFlowDark)" strokeWidth="2" fill="none" />
            <path className="trace-pulse-3" d="M340 230 H260 L230 200 H150" stroke="url(#traceFlowDark)" strokeWidth="2" fill="none" />
          </pattern>
          <linearGradient id="traceFlowDark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#pcbPatternDark)" />
      </svg>

      {/* ===== التوهّجات — ليليّةٌ فقط؛ الورق لا يتوهّج ===== */}
      <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-[55%] h-72 bg-cyan-500/12 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="hidden dark:block absolute top-1/3 -left-20 w-72 h-72 bg-blue-500/8 rounded-full blur-[120px]"></div>
      <div className="hidden dark:block absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/8 rounded-full blur-[130px]"></div>

      {/* مصباحٌ يتبع المؤشّر — طبقةٌ أوضح من الخلفية حوله */}
      <BackgroundLamp />
      {/* رسوم الإنشاء: في أعلى الرئيسيّة فقط */}
      <SketchGate />

      {/* ===== «رفع الأبيض الخفيف» لصور القطع نهاراً (globals.css · img.object-contain) =====
          الدمج (multiply) يذيب خلفيّة الصورة البيضاء في الورق — ويذيب معها جسم
          القطعة البيضاء (كيسٌ أبيض يكاد يختفي). هذا المنحنى يُبقي الأبيض الصافي
          أبيض (فتذوب الخلفيّة كما كانت) ويُعمّق الدرجات الأفتح منه قليلاً (٠٫٨٢–٠٫٩٩)
          فيظهر جسم القطعة البيضاء؛ وما دون ٠٫٨ لا يُمسّ، فالقطع الداكنة كما هي.
          جُرّب 2026-10-12 مقابل «مربّعٍ أغمق» و«بلا دمج» على O11 Dynamic EVO XL White. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="white-lift" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="table" tableValues={WHITE_LIFT} />
            <feFuncG type="table" tableValues={WHITE_LIFT} />
            <feFuncB type="table" tableValues={WHITE_LIFT} />
          </feComponentTransfer>
        </filter>
      </svg>
    </div>
  );
}
