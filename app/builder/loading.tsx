"use client";

import { useEffect, useState } from "react";
import { Sk, SkSelectCard } from "../../components/loading-ui";

/**
 * تحميل صفحة البناء.
 * النصوص التقنية تصدق هنا فعلاً — الصفحة تجلب الكتالوج وتفحص التوافق.
 * وتحتها هيكل عظمي يطابق التخطيط، فلا تقفز الصفحة عند الوصول.
 */
const steps = [
  "جلب الكتالوج...",
  "تحديث الأسعار...",
  "تجهيز لوحة الاختيار...",
];

export default function Loading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-[#0B1120] min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800/80 p-6 md:p-10">

        {/* رأس التحميل */}
        <div className="flex flex-col items-center text-center mb-10 pb-8 border-b border-slate-200 dark:border-slate-800/60">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-white shadow-[0_0_40px_rgba(34,211,238,.15)] dark:bg-slate-900">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-cyan-500 dark:text-cyan-400">
              <path d="M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z" />
            </svg>
          </div>
          <p className="h-5 text-[13px] font-bold text-slate-500 dark:text-slate-400 transition-all duration-300">
            {steps[step]}
          </p>
          <div className="mt-5 w-40 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full w-1/3 animate-loading-bar bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
          </div>
        </div>

        {/* هيكل شبكة القطع */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 mb-10">
          {Array.from({ length: 7 }).map((_, i) => <SkSelectCard key={i} />)}
        </div>
        <Sk className="h-14 w-full rounded-2xl" />

      </div>
    </div>
  );
}