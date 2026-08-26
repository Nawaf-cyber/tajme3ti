'use client';

/* ============ «تابع السعر» ============
 *
 * لمن يريد قطعةً ليست في تجميعةٍ له. أمّا ما في تجميعاته فمتابَعٌ تلقائياً،
 * فلا يُعرض له زرٌّ يطلب ما هو حاصلٌ أصلاً — يُقال له إنها متابَعة ولماذا.
 *
 * ⚠️ ولا يقول الزرّ «سنُرسل لك»: لا بريد ولا دفعَ ويب. الوعد المكتوب هو
 * الواقع — يراها في «تجميعاتي» حين يفتح. وعدٌ لا يقع أسوأ من لا وعد.
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { goToLogin } from '../lib/login-href';

type State = { watching: boolean; viaBuild: boolean; buildName?: string };

export default function WatchPriceButton({ componentId }: { componentId: string }) {
  const { status } = useSession();
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') { setState(null); return; }
    let alive = true;
    fetch(`/api/price-watch?id=${encodeURIComponent(componentId)}`)
      .then((r) => r.json())
      .then((d) => { if (alive) setState({ watching: !!d.watching, viaBuild: !!d.viaBuild, buildName: d.buildName }); })
      .catch(() => {});
    return () => { alive = false; };
  }, [componentId, status]);

  /* الزائر يرى الدعوة لا فراغاً: هي أوضح سببٍ للتسجيل في الصفحة كلّها */
  if (status === 'unauthenticated') {
    return (
      <Link
        href="/login"
        onClick={goToLogin}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border border-dashed border-slate-300 dark:border-slate-700 text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors"
      >
        <BellIcon />
        سجّل دخولك لتتابع سعرها
      </Link>
    );
  }

  if (status === 'loading' || !state) return null;

  /* في تجميعته: خبرٌ لا زرّ */
  if (state.viaBuild) {
    return (
      <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-[13px] font-bold text-emerald-800 dark:text-emerald-300">
        <BellIcon />
        <span className="truncate">
          سعرها متابَعٌ — لأنها في {state.buildName ? `«${state.buildName}»` : 'تجميعتك'}
        </span>
      </div>
    );
  }

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    const next = !state.watching;
    /* تفاؤليّاً ثم يُصحَّح: زرٌّ ينتظر الشبكة ليتلوّن يبدو معطَّلاً */
    setState({ ...state, watching: next });
    try {
      const res = await fetch('/api/price-watch', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || 'تعذّر الحفظ');
      setState({ watching: !!d.watching, viaBuild: !!d.viaBuild, buildName: d.buildName });
      toast.success(
        next
          ? 'تتابع سعرها الآن — يظهر الانخفاض في «تجميعاتي».'
          : 'أوقفنا متابعة سعرها.',
      );
    } catch (e: any) {
      setState({ ...state, watching: !next });
      toast.error(e?.message || 'تعذّر الحفظ، حاول ثانيةً.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={state.watching}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border text-[13px] font-black transition-colors disabled:opacity-60 ${
          state.watching
            ? 'bg-cyan-700 border-cyan-700 text-white hover:bg-cyan-800'
            : 'bg-white dark:bg-slate-900/40 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-400'
        }`}
      >
        <BellIcon />
        {state.watching ? 'تتابع سعرها' : 'تابع السعر'}
      </button>
      {state.watching && (
        <p className="mt-1.5 text-[12px] font-semibold text-slate-600 dark:text-slate-400 text-center">
          يظهر الانخفاض في «تجميعاتي» حين تفتح الموقع.
        </p>
      )}
    </div>
  );
}

const BellIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
