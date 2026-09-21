'use client';

/* ============ «سجّل جهازك» — تعريفٌ مرّةً واحدة ============
 *
 * ⚠️ ولا تَعِد إلّا بما يقع اليوم: الموقع لا يُرسل بريداً ولا إشعارَ دفع،
 * و«أضعف حلقة» لم تُبنَ بعد. فالمكتوب هنا فحصُ التوافق والكتم وحدهما —
 * وهما يعملان. ووعدٌ لا يقع أسوأ من لا وعد، وهي قاعدةُ هذا الموقع
 * المكتوبة في «تابع السعر» من قبل.
 *
 * ⚠️ وتُعرض في «تجميعاتي» لا في كلّ صفحة: النافذة فوق صفحة قطعةٍ تقطع
 * قراراً يُتَّخذ، وهنا وحدها يكون الزرّان على بعد نقرة.
 *
 * ⚠️ والإغلاق يُعلَّم مقروءاً مهما كان سببه — بالزرّ أو بالخلفيّة أو
 * بـEsc. فمن أغلقها لا يريدها، وإعادتُها غداً تحوّل التعريف إلى إلحاح.
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function RigIntroModal({ onPick }: { onPick?: () => void }) {
  const { status } = useSession();
  const [state, setState] = useState<{ show: boolean; hasBuilds: boolean } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    let alive = true;
    fetch('/api/rig/prompt')
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setState({ show: !!d.show, hasBuilds: !!d.hasBuilds });
        if (d.show) setOpen(true);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [status]);

  const dismiss = () => {
    setOpen(false);
    /* ولا يُنتظر الردّ: الإغلاق وقع في عينه، وفشلُ الكتابة يعني ظهورها
       مرّةً أخرى لا أكثر — وهو أهونُ من نافذةٍ تتجمّد حتى يردّ الخادم. */
    fetch('/api/rig/prompt', { method: 'POST' }).catch(() => {});
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    /* الخلفيّة لا تُمرَّر تحت النافذة */
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !state?.show) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rig-intro-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-300/60 dark:border-cyan-800/50 bg-gradient-to-br from-cyan-50 via-white to-white dark:from-cyan-950/60 dark:via-slate-900 dark:to-slate-900 shadow-2xl"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400" />
        <div className="absolute -top-24 -start-24 w-64 h-64 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none" />

        <button
          onClick={dismiss}
          aria-label="إغلاق"
          className="absolute top-3 end-3 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>

        <div className="relative p-6 sm:p-7">
          <span className="inline-block text-[10.5px] font-black text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-900/40 border border-cyan-300 dark:border-cyan-700/50 px-2.5 py-1 rounded-full mb-3">
            جديد
          </span>

          <h2 id="rig-intro-title" className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            سجّل جهازك الحالي
          </h2>
          <p className="text-[13.5px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
            قل لنا ما الذي تملكه اليوم — مرّةً واحدة — ويتغيّر الموقع لك.
          </p>

          <ul className="space-y-3 mb-6">
            <li className="flex gap-3">
              <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-sm bg-emerald-100 dark:bg-emerald-900/30 text-[15px]">✅</span>
              <div>
                <p className="text-[13px] font-black text-slate-800 dark:text-slate-100">نقول لك: هل تدخل جهازك؟</p>
                <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                  تفتح أيّ قطعة فيظهر الحكم فوراً — «طول الكرت ٣٤٠ مم أكبر من كيسك ٣٢٥ مم»،
                  أو «مزوّدك ٦٥٠ واط ولا يكفيه». قبل الشراء لا بعده.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-sm bg-cyan-100 dark:bg-cyan-900/30 text-[15px]">🔕</span>
              <div>
                <p className="text-[13px] font-black text-slate-800 dark:text-slate-100">ونسكت عمّا تملكه</p>
                <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                  قطعُ جهازك تتوقّف عن إزعاجك بتنبيهات الأسعار — اشتريتها، فلا معنى لإخبارك أنّها نزلت.
                </p>
              </div>
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-2.5">
            {state.hasBuilds ? (
              <button
                onClick={() => { dismiss(); onPick?.(); }}
                className="flex-1 px-4 py-2.5 rounded-sm text-[13px] font-black bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm hover:shadow-md hover:shadow-cyan-500/20 transition-all"
              >
                🖥️ اختر واحدةً من تجميعاتك
              </button>
            ) : (
              <Link
                href="/builder"
                onClick={dismiss}
                className="flex-1 px-4 py-2.5 rounded-sm text-[13px] font-black bg-cyan-600 hover:bg-cyan-500 text-white text-center shadow-sm hover:shadow-md hover:shadow-cyan-500/20 transition-all"
              >
                🖥️ ابنِ جهازك الحالي
              </Link>
            )}
            <button
              onClick={dismiss}
              className="px-4 py-2.5 rounded-sm text-[13px] font-bold text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            >
              لاحقاً
            </button>
          </div>

          <p className="mt-4 text-[11px] font-semibold text-slate-400 dark:text-slate-500 text-center">
            {state.hasBuilds
              ? 'اضغط زرّ 🖥️ على أيّ تجميعةٍ لتصير جهازك — وتقدر تغيّرها في أيّ وقت.'
              : 'تقدر تسجّله لاحقاً من «تجميعاتي» — وتغيّره في أيّ وقت.'}
          </p>
        </div>
      </div>
    </div>
  );
}
