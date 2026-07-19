"use client";

import { useEffect, useState } from "react";

/**
 * شاشة التحميل العامة — تظهر في كل صفحة بلا loading.tsx خاص.
 *
 * ⚠️ النصوص محايدة عمداً.
 * كانت: "تحليل التوافق... حساب الأداء..." — وهي تظهر في صفحة
 * الخصوصية والأخبار أيضاً، حيث لا يحدث شيء من ذلك. المؤقّت يدور
 * بلا علاقة بالتحميل الفعلي، فيصف عملاً وهمياً.
 * النصوص التقنية موضعها app/builder/loading.tsx حيث تصدق.
 */
const steps = [
  "جارٍ التحميل...",
  "لحظات من فضلك...",
  "شارف على الانتهاء...",
];

export default function Loading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // نتوقّف عند الأخير بدل الدوران — الدوران اللانهائي يوحي بتعطّل
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">

        {/* الشعار */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-500/20 bg-white shadow-[0_0_40px_rgba(34,211,238,.15)] dark:bg-slate-900">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-10 w-10 text-cyan-500 dark:text-cyan-400"
          >
            <path d="M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z" />
          </svg>
        </div>

        {/* الاسم */}
        <h1 className="text-2xl font-extrabold tracking-wide text-slate-900 dark:text-white">
          تجميعتي
        </h1>

        <p className="mt-2 h-6 text-sm text-slate-500 dark:text-slate-400 transition-all duration-300">
          {steps[step]}
        </p>

        {/* النقاط */}
        <div className="mt-8 flex justify-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-bounce"></span>
          <span
            className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-bounce"
            style={{ animationDelay: ".15s" }}
          ></span>
          <span
            className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-bounce"
            style={{ animationDelay: ".3s" }}
          ></span>
        </div>

        {/* شريط التقدّم */}
        <div className="mt-10 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full w-1/3 animate-loading-bar bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        </div>

      </div>
    </div>
  );
}