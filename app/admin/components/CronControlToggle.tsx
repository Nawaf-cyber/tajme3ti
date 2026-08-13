'use client';

import { useState, useTransition } from 'react';
import { toggleCronStatus, setUpdateFrequency } from '../actions';
import { UPDATE_FREQUENCIES, BATCHES_PER_RUN, PER_RUN } from '../../../lib/cron-settings';
import toast from 'react-hot-toast';

/**
 * لوحة التحديث الآلي: مفتاح تشغيل + عدد الدورات اليومية.
 *
 * ملاحظة مهمّة عن معنى المفتاح: هو **بوّابة** لا مُجدوِل. الجدولة تعيش في
 * GitHub Actions التي تنادي /api/cron/update-all كل ساعة؛ والمسار يقرأ من
 * هنا: هل التحديث مسموح؟ وهل مضى ما يكفي منذ آخر دورة؟ فإطفاء المفتاح
 * يوقف التنفيذ فوراً بلا حاجة إلى لمس أي ملف جدولة.
 *
 * (الوصف القديم كان يقول "كل 24 ساعة" — لم يكن صحيحاً في أي وقت.)
 */
export default function CronControlToggle({
  initialStatus,
  initialPerDay,
  lastRunAt,
  catalogCount = 0,
}: {
  initialStatus: boolean;
  initialPerDay: number;
  lastRunAt?: Date | string | null;
  /** حجم الكتالوج الحقيقي — كان مكتوباً في النصّ «٢٢٥» وقد صار ٢٥٦ */
  catalogCount?: number;
}) {
  const [isEnabled, setIsEnabled] = useState(initialStatus);
  const [perDay, setPerDay] = useState(initialPerDay);
  const [pending, startTransition] = useTransition();

  const handleToggle = async () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState); // تحديث فوري للواجهة لسرعة الاستجابة

    const res = await toggleCronStatus(nextState);
    if (res.success) {
      toast.success(nextState ? 'تم تفعيل التحديث الآلي' : 'تم إيقاف التحديث الآلي');
    } else {
      setIsEnabled(!nextState); // التراجع في حال الفشل
      toast.error('فشل تحديث الإعدادات في السيرفر');
    }
  };

  const handleFrequency = (value: number) => {
    const previous = perDay;
    setPerDay(value);
    startTransition(async () => {
      const res = await setUpdateFrequency(value);
      if (res.success) {
        toast.success(`صار التحديث ${value} ${value === 1 ? 'مرّة' : 'مرّات'} يومياً`);
      } else {
        setPerDay(previous);
        toast.error(res.error || 'فشل حفظ التردّد');
      }
    });
  };

  /* الفترة بين الدورات — الرقم الذي يهمّ الأدمن فعلاً، فنحسبه له
     بدل أن يقسم ٢٤ على العدد في رأسه */
  const gapHours = 24 / perDay;
  const gapLabel = gapHours >= 1 ? `كل ${gapHours} ساعة` : `كل ${Math.round(gapHours * 60)} دقيقة`;

  const lastRun = lastRunAt ? new Date(lastRunAt) : null;
  const lastRunLabel = lastRun
    ? new Intl.DateTimeFormat('ar-SA', { dateStyle: 'short', timeStyle: 'short' }).format(lastRun)
    : 'لم تُنفَّذ بعد';

  /* تغطية اليوم — تُحسب ولا تُكتب. الجملة المكتوبة قالت «دفعتين (~٧٠ قطعة)»
     بعد أن صارت التشغيلة ثلاث دفعات، و«الكتالوج ٢٢٥» بعد أن صار ٢٥٦، فكان
     الأدمن يضبط التردّد على حسابٍ لم يعد صحيحاً. */
  const dailyChecks = PER_RUN * perDay;
  const coverage = catalogCount > 0 ? dailyChecks / catalogCount : 0;
  const coverageLabel =
    coverage >= 1
      ? `كل قطعة ~${coverage.toFixed(1)} مرّة يومياً`
      : `~${Math.round(coverage * 100)}٪ من الكتالوج يومياً`;

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 w-full sm:w-auto">
      <div className="flex items-center justify-between gap-8">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-sm text-slate-900 dark:text-white">التحديث الآلي للأسعار</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            عند الإيقاف تُرفض كل دورة تحديث آلية — والزرّ اليدوي يتوقّف معها.
          </span>
        </div>

        <button
          onClick={handleToggle}
          aria-label={isEnabled ? 'إيقاف التحديث الآلي' : 'تفعيل التحديث الآلي'}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none ${
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

      {/* التردّد — يظهر باهتاً حين يكون التحديث موقوفاً لأنه بلا أثر عندها */}
      <div
        className={`mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60 transition-opacity ${
          isEnabled ? '' : 'opacity-45'
        }`}
      >
        <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
          <span className="font-bold text-xs text-slate-900 dark:text-white">عدد مرّات التحديث يومياً</span>
          <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
            {/* «مجدولة» صراحةً: الطابع لم يعد يُكتب عند الضغط اليدوي، فقولُ
                «آخر دورة» وحدها كان سيوهم أن الجدولة عملت وإنّما عمل الزرّ. */}
            {gapLabel} · آخر دورة مجدولة: {lastRunLabel}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {UPDATE_FREQUENCIES.map((n) => (
            <button
              key={n}
              onClick={() => handleFrequency(n)}
              disabled={pending}
              className={`font-mono text-xs font-black w-9 h-8 rounded-md border transition-colors tabular-nums disabled:opacity-50 ${
                perDay === n
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-[0_0_10px_rgba(5,150,105,0.35)]'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* تحذير التكلفة: كل دورة تستهلك رصيد سحب، والرقم يتضاعف بصمت */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          كل دورة تفحص {BATCHES_PER_RUN} دفعات (~{PER_RUN} قطعة) وتستهلك رصيد السحب.
          {catalogCount > 0 && <> الكتالوج {catalogCount} قطعة، فـ
            <span className="font-bold text-slate-700 dark:text-slate-200"> {perDay} {perDay === 1 ? 'مرّة' : 'مرّات'} </span>
            تفحص {coverageLabel}.</>}
        </p>
      </div>
    </div>
  );
}
