export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">

      {/* البرق النابض */}
      <div className="relative w-14 h-14 mb-6">
        <div className="absolute inset-0 bg-cyan-400/30 blur-2xl rounded-full animate-pulse-slow"></div>
        <svg viewBox="0 0 24 24" fill="currentColor" className="relative w-full h-full text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] animate-pulse">
          <path d="M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z" />
        </svg>
      </div>

      {/* شريط التحميل */}
      <div className="w-48 h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-loading-bar"></div>
      </div>

      <p className="font-mono text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
        LOADING
      </p>

    </div>
  );
}