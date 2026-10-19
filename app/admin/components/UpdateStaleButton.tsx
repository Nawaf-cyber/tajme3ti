'use client';

/**
 * ============ «حدّث المتأخّرة فقط» ============
 *
 * الدورات المجدولة تمرّ على ~٩٣٪ من الكتالوج يومياً، فيتخلّف كلّ يومٍ عشراتٌ بعد
 * حدّ اليوم بساعاتٍ قليلة — وتعدّها اللوحة «متأخّرة». والشامل يكنس الكتالوج كلّه
 * (٧٢٢ قطعة) ليصل إليها، أي عشرة أضعاف الرصيد. هذا يمرّ عليها وحدها، دفعةً بعد
 * دفعة، حتى يفرغ الطابور.
 *
 * والاختيار في الخادم (app/api/cron/update-all · ?stale=1) بتعريف اللوحة نفسه
 * (lib/price-staleness)، و`since` بداية التشغيلة: ما سُحب بعدها لا يُعاد ولو بقي
 * متأخّراً (متجرٌ فشلت قراءته)، فتنتهي الحلقة دائماً.
 */

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/* مقيسٌ من عدّاد Scrape.do (2026-08-11) — وهو معامل الكرون نفسه في estimatedCredits */
const CREDITS_PER_PART = 16.1;

/* `fixable` ما يصلحه السحب من المتأخّرة، و`manual` الباقي (سعرُه يدويّ — يُصحَّح يداً).
   والعدّان بالتعريف نفسه الذي يختار به الخادم (lib/price-staleness). */
export default function UpdateStaleButton({ fixable, manual }: { fixable: number; manual: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const cancelRef = useRef(false);

  const run = async () => {
    setLoading(true);
    setSummary(null);
    setErrors([]);
    cancelRef.current = false;
    const since = new Date().toISOString();
    /* الدفعة الأولى تأخذ نحو دقيقة قبل أوّل رقم — فيُقال ما يجري لا «نجهّز» وحدها */
    const toastId = toast.loading(`الدفعة الأولى… (حتى 35 قطعة، نحو دقيقة)`);
    setProgress({ done: 0, total: fixable });

    let done = 0;
    let total = 0;
    let unfixable = 0;
    let held = 0;
    const collected: string[] = [];
    let ended: 'done' | 'cancelled' | 'empty' = 'done';

    try {
      while (true) {
        if (cancelRef.current) { ended = 'cancelled'; break; }

        const res = await fetch(`/api/cron/update-all?stale=1&since=${encodeURIComponent(since)}`);
        if (!(res.headers.get('content-type') || '').includes('application/json')) {
          throw new Error('تعليقٌ مؤقّت من السيرفر (انتهت مهلة الدفعة).');
        }
        const data = await res.json();

        if (data.disabled) {
          toast.error(data.message, { id: toastId });
          return;
        }
        if (!data.success || !data.staleMode) {
          throw new Error(data.message || data.error || 'خطأ غير معروف');
        }

        done += data.processed ?? 0;
        held += data.heldForReview ?? 0;
        unfixable = data.staleUnfixable ?? 0;
        total = done + (data.staleRemaining ?? 0);
        /* «توقّف مبكر: بقيت N…» رسالة الكرون لدفعته — والحلقة هنا تكملها، فليست تنبيهاً */
        if (data.errors) collected.push(...data.errors.filter((e: string) => !e.startsWith('توقّف مبكر')));
        setProgress({ done, total });

        if (total === 0) { ended = 'empty'; break; }
        toast.loading(`حُدّثت ${done} من ${total} متأخّرة...`, { id: toastId });

        // الطابور فرغ، أو دفعةٌ لم تُنجز شيئاً (لا تقدّم = لا تكرار)
        if ((data.staleRemaining ?? 0) === 0 || (data.processed ?? 0) === 0) break;
      }

      const skipped = unfixable > 0
        ? ` · ${unfixable} متأخّرة لا يصلحها السحب (سعرها يدويّ أو لا متجر يُسحب لها)`
        : '';
      const heldNote = held > 0 ? ` · ${held} ارتفاعاً ينتظر مراجعتك` : '';
      const msg =
        ended === 'empty' ? `لا شيء يُحدَّث${skipped}`
        : ended === 'cancelled' ? `أُوقف — حُدّثت ${done} من ${total}${heldNote}`
        : `اكتمل — حُدّثت ${done} قطعة${heldNote}${skipped}`;
      setSummary(msg);
      if (ended === 'cancelled') toast(msg, { id: toastId, icon: '🛑', duration: 6000 });
      else toast.success(msg, { id: toastId, duration: 6000 });
      if (collected.length) setErrors(collected);
    } catch (e: any) {
      /* يُقال كما هو: ما حُدّث محفوظ، والضغط ثانيةً يكمل الباقي (ما سُحب لا يُعاد) */
      const msg = `توقّف قبل أن يكتمل — حُدّثت ${done}${total ? ` من ${total}` : ''}. اضغط ثانيةً ليكمل الباقي.`;
      setSummary(msg);
      toast.error(msg, { id: toastId, duration: 9000 });
      setErrors([...collected, e.message]);
    } finally {
      setLoading(false);
      // العدّادات في اللوحة من الخادم — تُعاد قراءتها
      router.refresh();
    }
  };

  const credits = Math.round(fixable * CREDITS_PER_PART);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={run}
          disabled={loading || fixable === 0}
          className="py-2 px-5 rounded-lg font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-fit"
        >
          {loading
            ? `⏳ نحدّث المتأخّرة… ${progress ? `(${progress.done} / ${progress.total})` : ''}`
            : fixable === 0
            ? '✓ لا متأخّرة يصلحها السحب'
            : `🕰 حدّث المتأخّرة فقط (${fixable})`}
        </button>
        {loading && (
          <button
            onClick={() => { cancelRef.current = true; }}
            className="py-2 px-4 rounded-lg font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors w-fit"
          >
            🛑 إيقاف
          </button>
        )}
      </div>
      {!loading && !summary && (fixable > 0 || manual > 0) && (
        <span className="text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
          {fixable > 0 && <>يمرّ على المتأخّرة وحدها — نحو {credits.toLocaleString('en-US')} وحدة سحب بدل كنس الكتالوج كلّه.</>}
          {manual > 0 && <>{fixable > 0 ? ' و' : ''}{manual} متأخّرة سعرها يدويّ (لا يبيعها متجرٌ يُسحب) — تُصحَّح من جدول القطع.</>}
        </span>
      )}
      {summary && <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{summary}</span>}
      {errors.length > 0 && (
        <details className="text-[12px] text-rose-700 dark:text-rose-400">
          <summary className="cursor-pointer font-bold">⚠️ {errors.length} تنبيه من المتاجر</summary>
          <ul className="list-disc list-inside mt-1 space-y-0.5 max-h-48 overflow-y-auto">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
}
