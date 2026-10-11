'use client';

import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { setPartRequestMode } from '../actions';
import type { PartRequestMode } from '../../../lib/part-request';

/**
 * من يقترح قطعة ناقصة؟ — مفتاحٌ بخيارين.
 * «حساب»: البطاقة تعرض للزائر دعوة تسجيل، والخادم يرفض إرساله (401).
 * «بدون حساب»: الزائر يقترح، ويُسأل أوّلاً هل يسجّل ليتابع طلبه.
 * الأثر فوريّ: البطاقة والخادم يقرآن القيمة عند كلّ تحميل/إرسال.
 */
export default function PartRequestModeToggle({ initialMode }: { initialMode: PartRequestMode }) {
  const [mode, setMode] = useState<PartRequestMode>(initialMode);
  const [pending, startTransition] = useTransition();

  const handle = (value: PartRequestMode) => {
    if (value === mode) return;
    const previous = mode;
    setMode(value);
    startTransition(async () => {
      const res = await setPartRequestMode(value);
      if (res.success) {
        toast.success(value === 'account' ? 'صار الاقتراح للمسجّلين فقط' : 'صار الاقتراح مفتوحاً للجميع');
      } else {
        setMode(previous);
        toast.error(res.error || 'فشل حفظ الوضع');
      }
    });
  };

  return (
    <div className="mb-6 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
      <div className="flex-1 min-w-0">
        <span className="block font-bold text-sm text-slate-900 dark:text-white">من يقترح القطع؟</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
          {mode === 'account'
            ? 'المسجّلون فقط — الزائر يرى دعوة تسجيل بدل النموذج، فتعرف صاحب كلّ طلب وتستطيع الردّ عليه.'
            : 'الجميع — الزائر يقترح بلا حساب (يُسأل أوّلاً إن كان يريد التسجيل)، ولا وسيلة للردّ عليه.'}
        </span>
      </div>
      <div className="inline-flex self-start sm:self-auto shrink-0 rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
        {(['account', 'open'] as const).map((m) => (
          <button
            key={m}
            onClick={() => handle(m)}
            disabled={pending}
            className={`px-3.5 h-8 text-xs font-bold transition-colors disabled:opacity-50 ${
              mode === m
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {m === 'account' ? 'حساب' : 'بدون حساب'}
          </button>
        ))}
      </div>
    </div>
  );
}
