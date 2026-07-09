'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // تسجيل الخطأ للمراقبة
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">

      {/* أيقونة التحذير */}
      <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full"></div>
        <svg className="relative w-14 h-14 text-amber-500 dark:text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div className="font-mono text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-3">
        SYSTEM · ERROR
      </div>

      <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
        حدث خطأ غير متوقع
      </h1>

      <p className="text-base text-slate-600 dark:text-slate-400 font-medium max-w-md mb-3 leading-relaxed">
        واجهنا مشكلة أثناء تحميل هذا الجزء. جرّب إعادة المحاولة، وإن تكرر الخطأ تواصل معنا.
      </p>

      {error.digest && (
        <p className="font-mono text-[10px] text-slate-400 dark:text-slate-600 mb-8">
          REF: {error.digest}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
        <button
          onClick={reset}
          className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 px-8 rounded-sm transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2 overflow-hidden"
        >
          <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="relative z-10">إعادة المحاولة</span>
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700"></span>
        </button>

        <Link
          href="/"
          className="bg-white/60 dark:bg-[#0F172A]/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 dark:hover:text-cyan-300 font-bold py-3.5 px-8 rounded-sm transition-all duration-300 text-sm hover:-translate-y-0.5 flex items-center justify-center"
        >
          العودة للرئيسية
        </Link>
      </div>

    </div>
  );
}