'use client';

/**
 * ============ صحّة البروكسي العاديّ — آخر ٢٤ ساعة ============
 *
 * أمازون ومايكرولس يُسحبان بالبروكسي العاديّ (وحدة سحب) ويرجعان للمتقدّم (١٠ وحدات)
 * إن لم تخرج القراءة نظيفة (lib/proxy-fallback). وهذا الصندوق يقول للأدمن هل يصمد:
 * كم صفحةٍ قُرئت بالعاديّ، وكم احتاجت المتقدّم، وكم فشلت بالطريقتين، وما قالته
 * عيّنة المقارنة — والفرق فيها هو ما لا يظهر خطأً، فيُعرض بالقطعة والسعرين.
 *
 * والمفتاح «المتقدّم دائماً» يرجّع الوضع القديم بلا نشر (يُقرأ أوّلَ كلّ تشغيلة).
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { setProxyModeAction } from '../actions';
import type { ProxyStatus } from '../../../lib/proxy-stats';

const STORE_AR: Record<string, string> = { amazon: 'أمازون', microless: 'مايكرولس' };
/* وحدات السحب: العاديّ ١، والمتقدّم ١٠ (مقيس من عدّاد Scrape.do) */
const NORMAL = 1;
const PREMIUM = 10;
/* عتبة التنبيه نفسها في lib/proxy-stats (FALLBACK_ALERT_RATE) — لا يُستورد الملفّ هنا لأنه يستورد prisma */
const ALERT_RATE = 0.3;

export default function ProxyHealthPanel({ status }: { status: ProxyStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showDiffs, setShowDiffs] = useState(false);
  const premiumAlways = status.mode === 'premium';

  const rows = Object.entries(status.stores);
  const sum = rows.reduce(
    (a, [, c]) => ({
      ok: a.ok + c.normalOk, fb: a.fb + c.fallback, fail: a.fail + c.bothFail,
      same: a.same + c.sampleSame, diff: a.diff + c.sampleDiff,
    }),
    { ok: 0, fb: 0, fail: 0, same: 0, diff: 0 },
  );
  const total = sum.ok + sum.fb + sum.fail;
  const fbRate = total ? (sum.fb + sum.fail) / total : 0;
  /* الرصيد الفعليّ مقابل ما كان سيُصرف بالمتقدّم وحده (العيّنة تُحسب طلبين) */
  const spent = sum.ok * NORMAL + (sum.fb + sum.fail) * (NORMAL + PREMIUM) + (sum.same + sum.diff) * PREMIUM;
  const wouldBe = total * PREMIUM;

  const toggle = () =>
    start(async () => {
      const next = premiumAlways ? 'auto' : 'premium';
      const r = await setProxyModeAction(next);
      if (r.success) {
        toast.success(next === 'premium' ? 'رجعنا للمتقدّم دائماً — من التشغيلة الجاية' : 'العادي أولاً — من التشغيلة الجاية');
        router.refresh();
      } else toast.error(r.error || 'تعذّر الحفظ');
    });

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 p-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="block font-bold text-sm text-slate-900 dark:text-white">البروكسي — أمازون ومايكرولس</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {premiumAlways
              ? 'المتقدّم دائماً (١٠ وحدات للصفحة) — الوضع القديم.'
              : 'العادي أولاً (وحدة للصفحة)، والمتقدّم تلقائياً إذا جاءت الصفحة محجوبة أو بلا سعر.'}
          </span>
        </div>
        <button
          onClick={toggle}
          disabled={pending}
          className={`shrink-0 py-1.5 px-3 rounded-lg text-xs font-black border transition-colors disabled:opacity-50 ${
            premiumAlways
              ? 'bg-amber-500 border-amber-500 text-white'
              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-amber-500'
          }`}
          title={premiumAlways ? 'ارجع للعادي أولاً' : 'ارجع للمتقدّم دائماً'}
        >
          {pending ? '…' : premiumAlways ? '✓ المتقدّم دائماً' : 'المتقدّم دائماً'}
        </button>
      </div>

      {total === 0 ? (
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {premiumAlways ? 'لا أرقام — العادي موقوف.' : 'ما فيه أرقام للحين — تظهر بعد أوّل تشغيلة سحب.'}
        </p>
      ) : (
        <>
          <div className="text-[12.5px] font-bold text-slate-700 dark:text-slate-300 flex flex-col gap-1">
            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">آخر 24 ساعة</span>
            <span>✓ {sum.ok.toLocaleString('en-US')} صفحة قُرئت بالعادي</span>
            <span className={fbRate > ALERT_RATE ? 'text-rose-600 dark:text-rose-400' : ''}>
              ↻ {sum.fb.toLocaleString('en-US')} احتاجت المتقدّم ({Math.round(fbRate * 100)}%)
            </span>
            <span className={sum.fail ? 'text-rose-600 dark:text-rose-400' : ''}>⚠️ {sum.fail} فشلت بالطريقتين</span>
            <span>
              🔍 عيّنة المقارنة: {sum.same} متطابقة ·{' '}
              {sum.diff > 0 ? (
                <button type="button" onClick={() => setShowDiffs(!showDiffs)} className="text-rose-600 dark:text-rose-400 underline font-black">
                  {sum.diff} مختلفة {showDiffs ? '▴' : '▾'}
                </button>
              ) : (
                <span>0 مختلفة</span>
              )}
            </span>
          </div>

          {showDiffs && status.diffs.length > 0 && (
            <ul className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 flex flex-col gap-1.5 border-t border-slate-200 dark:border-slate-700 pt-2">
              {status.diffs.map((d, i) => (
                <li key={i}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="font-black underline">{d.name}</a>
                  {' '}({STORE_AR[d.store] ?? d.store}): العادي {d.normal.price ?? 'بلا سعر'}{d.normal.inStock ? '' : ' نافد'} · المتقدّم {d.premium.price ?? 'بلا سعر'}{d.premium.inStock ? '' : ' نافد'}
                  <span className="text-slate-400"> — اعتمدنا المتقدّم</span>
                </li>
              ))}
            </ul>
          )}

          {rows.length > 1 && (
            <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {rows.map(([s, c]) => {
                const t = c.normalOk + c.fallback + c.bothFail;
                return (
                  <span key={s} className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    {STORE_AR[s] ?? s}: {t ? Math.round((c.normalOk / t) * 100) : 0}% بالعادي
                  </span>
                );
              })}
            </div>
          )}

          <p className="text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
            الرصيد: نحو {spent.toLocaleString('en-US')} وحدة بدل {wouldBe.toLocaleString('en-US')} بالمتقدّم وحده
            {wouldBe > 0 && ` (توفير ${Math.max(0, Math.round((1 - spent / wouldBe) * 100))}%)`}.
          </p>
        </>
      )}
    </div>
  );
}
