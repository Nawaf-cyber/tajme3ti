'use client';

import { useState } from 'react';

/**
 * شريط "نعمل عليه الآن" — إشارة حياة لا وعد بتاريخ.
 *
 * ⚠️ مبدأ: لا تاريخ، ولا ادّعاء بما لم يُنجَز.
 * "نعمل عليه" صادق دائماً. "قريباً" و"الأسبوع القادم" ديون على مصداقيتك.
 * احذف المكوّن أو غيّر النص فور إطلاق الميزة — شريط قديم أسوأ من لا شريط.
 */

type Item = {
  icon: string;
  title: string;
  desc: string;
  /** 'building' = قيد التطوير · 'testing' = قيد الاختبار */
  stage: 'building' | 'testing';
};

const ITEMS: Item[] = [
  {
    icon: '🎛️',
    title: 'خصّص تجميعتك',
    desc: 'بدائل لكل قطعة بأسعارها الحقيقية، وترى أثر أي تغيير على الإجمالي قبل ما تطبّقه.',
    stage: 'testing',
  },
  {
    icon: '💡',
    title: 'مساعد اختيار التجميعة',
    desc: 'قل لنا وش تسوي بجهازك — ألعاب؟ مونتاج؟ — ونبني لك تجميعة كاملة من القطع المتوفّرة.',
    stage: 'building',
  }
];

const STAGE_META = {
  testing: {
    label: 'قيد الاختبار',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'border-emerald-500/40 bg-emerald-500/[0.06]',
  },
  building: {
    label: 'قيد التطوير',
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'border-amber-500/40 bg-amber-500/[0.06]',
  }
};

export default function WorkInProgress() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-right hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* نبضة حياة */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>

          <div className="min-w-0">
            <h3 className="text-[13px] font-black text-slate-900 dark:text-white">
              نشتغل على ميزات جديدة الآن
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
              المنصة تتطوّر باستمرار — شوف وش قادم
            </p>
          </div>
        </div>

        <svg
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {ITEMS.map((item) => {
            const meta = STAGE_META[item.stage];
            return (
              <div
                key={item.title}
                className={`flex items-start gap-3 p-3.5 rounded-xl border ${meta.ring}`}
              >
                <span className="w-9 h-9 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base">
                  {item.icon}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12.5px] font-black text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded ${meta.text}`}>
                      <span className={`w-1 h-1 rounded-full ${meta.dot}`}></span>
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}

          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium pt-1">
            بلا تواريخ ولا وعود — ننشرها أول ما تجهز فعلاً.{' '}
            <a href="/about" className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold">
              عندك اقتراح؟
            </a>
          </p>
        </div>
      )}
    </div>
  );
}