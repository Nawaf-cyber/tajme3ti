// components/PCBBackground.tsx
// خلفية مسارات اللوحة الأم — تُوضع في الـ layout لتظهر خلف كل الصفحات (navbar + المحتوى + footer)
// فتصبح هوية الموقع متناسقة بالكامل.

export default function PCBBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {/* الشبكة الخفيفة (الوضع الفاتح) */}
      <div className="absolute inset-0 dark:hidden bg-[linear-gradient(to_right,#8080800A_1px,transparent_1px),linear-gradient(to_bottom,#8080800A_1px,transparent_1px)] bg-[size:44px_44px]"></div>

      {/* مسارات اللوحة الأم — نمط متكرّر (الوضع الداكن) */}
      <svg className="absolute inset-0 w-full h-full hidden dark:block opacity-[0.55]" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="pcbPatternGlobal" width="340" height="280" patternUnits="userSpaceOnUse">
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
            <path className="trace-pulse" d="M0 60 H90 L120 90 H200 M200 90 L230 60 H340" stroke="url(#traceFlowGlobal)" strokeWidth="2" fill="none" />
            <path className="trace-pulse-3" d="M340 230 H260 L230 200 H150" stroke="url(#traceFlowGlobal)" strokeWidth="2" fill="none" />
          </pattern>
          <linearGradient id="traceFlowGlobal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#pcbPatternGlobal)" />
      </svg>

      {/* توهّجات سيان متوزّعة */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[55%] h-72 bg-cyan-500/8 dark:bg-cyan-500/12 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/8 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/5 dark:bg-cyan-500/8 rounded-full blur-[130px]"></div>
    </div>
  );
}