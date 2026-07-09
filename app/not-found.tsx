import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      
      {/* البرق — عنصر التوقيع */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full"></div>
        <svg viewBox="0 0 24 24" fill="currentColor" className="relative w-full h-full text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
          <path d="M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z" />
        </svg>
      </div>

      {/* رمز الخطأ */}
      <div className="font-mono text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-3">
        ERROR · 404
      </div>

      <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-300 tracking-tighter mb-4 font-mono">
        404
      </h1>

      <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
        الصفحة غير موجودة
      </h2>

      <p className="text-base text-slate-600 dark:text-slate-400 font-medium max-w-md mb-10 leading-relaxed">
        يبدو أن هذه القطعة غير متصلة باللوحة. تأكد من الرابط، أو ارجع لتصفّح القطع المتاحة.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Link
          href="/"
          className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 px-8 rounded-sm transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2 overflow-hidden"
        >
          <span className="relative z-10">العودة للرئيسية</span>
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700"></span>
        </Link>

        <Link
          href="/components"
          className="bg-white/60 dark:bg-[#0F172A]/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 dark:hover:text-cyan-300 font-bold py-3.5 px-8 rounded-sm transition-all duration-300 text-sm hover:-translate-y-0.5"
        >
          تصفّح القطع
        </Link>
      </div>

    </div>
  );
}