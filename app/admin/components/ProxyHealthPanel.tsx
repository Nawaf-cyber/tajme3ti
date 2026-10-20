'use client';

/**
 * ============ صحّة البروكسي العاديّ — آخر ٢٤ ساعة ============
 *
 * أمازون ومايكرولس يُسحبان بالبروكسي العاديّ (وحدة سحب) ويرجعان للمتقدّم (١٠ وحدات)
 * إن لم تخرج القراءة نظيفة (lib/proxy-fallback). وهذا الصندوق يقول للأدمن هل يصمد:
 * كم صفحةٍ قُرئت بالعاديّ، وكم احتاجت المتقدّم، وكم فشلت بالطريقتين، وما قالته
 * عيّنة المقارنة — والفرق فيها هو ما لا يظهر خطأً، فيُعرض بالقطعة والسعرين.
 *
 * ومفتاحٌ لكلّ متجر (يُقرأ أوّلَ كلّ تشغيلة، بلا نشر). ⚠️ والسرعة تُذكر بجانبه: العاديّ في
 * مايكرولس أبطأ أربع مرّات فيقلّ ما تغطّيه الدورة — وهو ما رفع المتأخّرة إلى ٢٩١ في أوّل يوم.
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
/* مقيس 2026-10-20 — خمس صفحات لكلّ متجر بالطريقتين (متوسّط ثواني الصفحة) */
const SPEED: Record<string, { normal: number; premium: number }> = {
  amazon: { normal: 4.0, premium: 4.0 },
  microless: { normal: 6.9, premium: 1.6 },
};
const STORES = ['amazon', 'microless'];

export default function ProxyHealthPanel({ status }: { status: ProxyStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showDiffs, setShowDiffs] = useState(false);
  const modeOf = (s: string) => status.modes[s] ?? (s === 'amazon' ? 'auto' : 'premium');
  const anyAuto = STORES.some((s) => modeOf(s) === 'auto');

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

  const toggle = (store: string) =>
    start(async () => {
      const next = modeOf(store) === 'auto' ? 'premium' : 'auto';
      const r = await setProxyModeAction(store, next);
      if (r.success) {
        toast.success(`${STORE_AR[store]}: ${next === 'premium' ? 'المتقدّم دائماً' : 'العادي أولاً'} — من التشغيلة الجاية`);
        router.refresh();
      } else toast.error(r.error || 'تعذّر الحفظ');
    });

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 p-4 flex flex-col gap-3">
      <div>
        <span className="block font-bold text-sm text-slate-900 dark:text-white">البروكسي — أمازون ومايكرولس</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          «العادي أولاً» وحدة للصفحة، والمتقدّم تلقائياً إذا جاءت محجوبة أو بلا سعر. «المتقدّم دائماً» ١٠ وحدات.
        </span>
      </div>

      {/* مفتاحٌ لكلّ متجر، وسرعته بالطريقتين — الأبطأ يقلّل ما تغطّيه الدورة */}
      <div className="flex flex-col gap-2">
        {STORES.map((s) => {
          const auto = modeOf(s) === 'auto';
          const sp = SPEED[s];
          const slower = sp && sp.normal > sp.premium * 1.5;
          return (
            <div key={s} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
              <div className="min-w-0">
                <span className="text-[13px] font-black text-slate-900 dark:text-white">{STORE_AR[s]}: </span>
                <span className={`text-[12.5px] font-bold ${auto ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {auto ? 'العادي أولاً' : 'المتقدّم دائماً'}
                </span>
                {sp && (
                  <span className={`block text-[11px] font-semibold ${slower ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    سرعة الصفحة: العادي {sp.normal}ث · المتقدّم {sp.premium}ث
                    {slower && ' — العادي أبطأ، فيقلّ ما تغطّيه الدورة وتكثر المتأخّرة'}
                  </span>
                )}
              </div>
              <button
                onClick={() => toggle(s)}
                disabled={pending}
                className="shrink-0 py-1 px-2.5 rounded-md text-[11.5px] font-black border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-cyan-500 disabled:opacity-50"
              >
                {pending ? '…' : auto ? 'خلّه متقدّم دائماً' : 'جرّب العادي أولاً'}
              </button>
            </div>
          );
        })}
      </div>

      {total === 0 ? (
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {anyAuto ? 'ما فيه أرقام للحين — تظهر بعد أوّل تشغيلة سحب.' : 'المتجران على المتقدّم دائماً — لا أرقام للعادي.'}
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
