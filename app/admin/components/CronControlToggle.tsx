'use client';

import { useState } from 'react';
import { toggleCronStatus } from '../actions';
import toast from 'react-hot-toast';

export default function CronControlToggle({ initialStatus }: { initialStatus: boolean }) {
  const [isEnabled, setIsEnabled] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(false);
    const nextState = !isEnabled;
    setIsEnabled(nextState); // تحديث فوري للواجهة لسرعة الاستجابة

    const res = await toggleCronStatus(nextState);
    if (res.success) {
      toast.success(nextState ? "تم تفعيل التحديث التلقائي اليومي وعمله في الخلفية" : "تم إيقاف التحديث التلقائي بنجاح");
    } else {
      setIsEnabled(!nextState); // التراجع في حال الفشل
      toast.error("فشل تحديث الإعدادات في السيرفر");
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 w-full sm:w-auto gap-8">
      <div className="flex flex-col gap-1">
        <span className="font-bold text-sm text-slate-900 dark:text-white">التحديث الآلي اليومي (Cron Job)</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">عند التفعيل، سيقوم السيرفر بتحديث كل الأسعار تلقائياً كل 24 ساعة.</span>
      </div>
      
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
          isEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
            isEnabled ? '-translate-x-6' : '-translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}