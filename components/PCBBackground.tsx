// components/PCBBackground.tsx
// خلفية مسارات اللوحة الأم — تظهر في الوضعين الداكن والفاتح بألوان مناسبة لكل منهما.
// تُوضع في الـ layout لتظهر خلف كل الصفحات (navbar + المحتوى + footer).

export default function PCBBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">

      {/* ===== الوضع الفاتح: مسارات سيان فاتحة ===== */}
      <svg className="absolute inset-0 w-full h-full dark:hidden opacity-[0.85]" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="pcbPatternLight" width="340" height="280" patternUnits="userSpaceOnUse">
            {/* شبكة دقيقة */}
            <path d="M0 0 H340 M0 0 V280" stroke="#0891b2" strokeWidth="0.6" strokeOpacity="0.14" />
            {/* المسارات */}
            <g stroke="#0891b2" strokeWidth="1.6" fill="none" strokeOpacity="0.55">
              <path d="M0 60 H90 L120 90 H200 M200 90 L230 60 H340" />
              <path d="M0 210 H70 L100 180 H180" />
              <path d="M340 230 H260 L230 200 H150" />
              <path d="M45 0 V40 L75 70 V130" />
              <path d="M300 280 V220 L270 190 V120" />
              <path d="M180 90 V160 L210 190 H280" />
            </g>
            {/* نقاط التوصيل */}
            <g fill="#0e7490" fillOpacity="0.55">
              <circle cx="90" cy="60" r="3.5" /><circle cx="200" cy="90" r="3.5" />
              <circle cx="70" cy="210" r="3.5" /><circle cx="260" cy="230" r="3.5" />
              <circle cx="75" cy="70" r="3.5" /><circle cx="180" cy="160" r="3.5" />
              <circle cx="280" cy="190" r="3.5" />
            </g>
            {/* نبضات الطاقة */}
            <path className="trace-pulse" d="M0 60 H90 L120 90 H200 M200 90 L230 60 H340" stroke="url(#traceFlowLight)" strokeWidth="2.5" fill="none" />
            <path className="trace-pulse-3" d="M340 230 H260 L230 200 H150" stroke="url(#traceFlowLight)" strokeWidth="2.5" fill="none" />
          </pattern>
          <linearGradient id="traceFlowLight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="50%" stopColor="#0e7490" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#pcbPatternLight)" />
      </svg>

      {/* ===== الوضع الداكن: مسارات داكنة + نبضات مضيئة ===== */}
      <svg className="absolute inset-0 w-full h-full hidden dark:block opacity-[0.55]" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
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

      {/* ===== التوهّجات (أقوى في الفاتح ليظهر العمق) ===== */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[55%] h-72 bg-cyan-300/12 dark:bg-cyan-500/12 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-300/8 dark:bg-blue-500/8 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-300/8 dark:bg-cyan-500/8 rounded-full blur-[130px]"></div>
    </div>
  );
}