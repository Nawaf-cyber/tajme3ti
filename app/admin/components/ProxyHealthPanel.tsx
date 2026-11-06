'use client';

/**
 * ============ صحّة البروكسي العاديّ — آخر ٢٤ ساعة ============
 *
 * أمازون ومايكرولس يُسحبان بالبروكسي العاديّ (وحدة سحب) ويرجعان للمتقدّم (١٠ وحدات)
 * إن لم تخرج القراءة نظيفة (lib/proxy-fallback). وكازاسوق بالقاعدة نفسها، لكن طريقاه
 * المباشر (بلا وحدات) والوسيط (وحدة) — فالأسماء والكلفة لكلّ متجر من PROXY_CHANNELS.
 * وهذا الصندوق يقول للأدمن هل يصمد: كم صفحةٍ قُرئت بالأرخص، وكم احتاجت الاحتياط، وكم
 * فشلت بالطريقتين، وما قالته عيّنة المقارنة — والفرق فيها هو ما لا يظهر خطأً، فيُعرض
 * بالقطعة والسعرين.
 *
 * ومفتاحٌ لكلّ متجر (يُقرأ أوّلَ كلّ تشغيلة، بلا نشر). ⚠️ والسرعة تُذكر بجانبه: العاديّ في
 * مايكرولس أبطأ أربع مرّات فيقلّ ما تغطّيه الدورة — وهو ما رفع المتأخّرة إلى ٢٩١ في أوّل يوم.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { setProxyModeAction } from '../actions';
import type { ProxyStatus } from '../../../lib/proxy-stats';
import { PROXY_STORES, DEFAULT_PROXY_MODES, channelOf } from '../../../lib/proxy-fallback';

const STORE_AR: Record<string, string> = { amazon: 'أمازون', microless: 'مايكرولس', cazasouq: 'كازاسوق' };
/* عتبة التنبيه نفسها في lib/proxy-stats (FALLBACK_ALERT_RATE) — لا يُستورد الملفّ هنا لأنه يستورد prisma */
const ALERT_RATE = 0.3;
/* متوسّط ثواني الصفحة بالطريقتين: أمازون ومايكرولس خمس صفحات لكلٍّ (2026-10-20)، وكازاسوق
   الوسيطُ لـ٢٥٧ صفحةً مباشرةً و١٢ بالوسيط (2026-11-06) */
const SPEED: Record<string, { normal: number; premium: number }> = {
  amazon: { normal: 4.0, premium: 4.0 },
  microless: { normal: 6.9, premium: 1.6 },
  cazasouq: { normal: 0.4, premium: 3.5 },
};
const STORES: readonly string[] = PROXY_STORES;

export default function ProxyHealthPanel({ status }: { status: ProxyStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showDiffs, setShowDiffs] = useState(false);
  const modeOf = (s: string) => status.modes[s] ?? DEFAULT_PROXY_MODES[s] ?? 'premium';
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
  /* الرصيد الفعليّ مقابل ما كان سيُصرف بالاحتياط وحده — بكلفة طريقَي كلّ متجر (العيّنة تُحسب طلبين) */
  const { spent, wouldBe } = rows.reduce(
    (a, [s, c]) => {
      const { normal, premium } = channelOf(s).credits;
      const t = c.normalOk + c.fallback + c.bothFail;
      return {
        spent: a.spent + c.normalOk * normal + (c.fallback + c.bothFail) * (normal + premium) + (c.sampleSame + c.sampleDiff) * premium,
        wouldBe: a.wouldBe + t * premium,
      };
    },
    { spent: 0, wouldBe: 0 },
  );

  const toggle = (store: string) =>
    start(async () => {
      const next = modeOf(store) === 'auto' ? 'premium' : 'auto';
      const ch = channelOf(store);
      const r = await setProxyModeAction(store, next);
      if (r.success) {
        toast.success(`${STORE_AR[store]}: ${next === 'premium' ? `${ch.premium} دائماً` : `${ch.normal} أولاً`} — من التشغيلة الجاية`);
        router.refresh();
      } else toast.error(r.error || 'تعذّر الحفظ');
    });

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 p-4 flex flex-col gap-3">
      <div>
        <span className="block font-bold text-sm text-slate-900 dark:text-white">البروكسي — أمازون ومايكرولس وكازاسوق</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          «العادي أولاً» وحدة للصفحة، والمتقدّم تلقائياً إذا جاءت محجوبة أو بلا سعر. «المتقدّم دائماً» ١٠ وحدات.
          وكازاسوق «المباشر أولاً» بلا وحدات، والوسيط (وحدة) تلقائياً إذا ما ضبط.
        </span>
      </div>

      {/* مفتاحٌ لكلّ متجر، وسرعته بالطريقتين — الأبطأ يقلّل ما تغطّيه الدورة */}
      <div className="flex flex-col gap-2">
        {STORES.map((s) => {
          const auto = modeOf(s) === 'auto';
          const ch = channelOf(s);
          const sp = SPEED[s];
          const slower = sp && sp.normal > sp.premium * 1.5;
          return (
            <div key={s} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
              <div className="min-w-0">
                <span className="text-[13px] font-black text-slate-900 dark:text-white">{STORE_AR[s] ?? s}: </span>
                <span className={`text-[12.5px] font-bold ${auto ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {auto ? `${ch.normal} أولاً` : `${ch.premium} دائماً`}
                </span>
                {sp && (
                  <span className={`block text-[11px] font-semibold ${slower ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    سرعة الصفحة: {ch.normal} {sp.normal}ث · {ch.premium} {sp.premium}ث
                    {slower && ` — ${ch.normal} أبطأ، فيقلّ ما تغطّيه الدورة وتكثر المتأخّرة`}
                  </span>
                )}
              </div>
              <button
                onClick={() => toggle(s)}
                disabled={pending}
                className="shrink-0 py-1 px-2.5 rounded-md text-[11.5px] font-black border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-cyan-500 disabled:opacity-50"
              >
                {pending ? '…' : auto ? `خلّه ${ch.premium} دائماً` : `جرّب ${ch.normal} أولاً`}
              </button>
            </div>
          );
        })}
      </div>

      {total === 0 ? (
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {anyAuto ? 'ما فيه أرقام للحين — تظهر بعد أوّل تشغيلة سحب.' : 'كلّ المتاجر على الاحتياط دائماً — ما فيه أرقام.'}
        </p>
      ) : (
        <>
          <div className="text-[12.5px] font-bold text-slate-700 dark:text-slate-300 flex flex-col gap-1">
            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">آخر 24 ساعة</span>
            {/* سطرٌ لكلّ متجر: «العادي» و«المباشر» طريقان مختلفان، فجمعهما في رقمٍ واحد يُضلّل */}
            {rows.map(([s, c]) => {
              const ch = channelOf(s);
              const t = c.normalOk + c.fallback + c.bothFail;
              const rate = t ? (c.fallback + c.bothFail) / t : 0;
              return (
                <span key={s}>
                  {STORE_AR[s] ?? s}: ✓ {c.normalOk.toLocaleString('en-US')} ب{ch.normal} ·{' '}
                  <span className={rate > ALERT_RATE ? 'text-rose-600 dark:text-rose-400' : ''}>
                    ↻ {(c.fallback + c.bothFail).toLocaleString('en-US')} احتاجت {ch.premium} ({Math.round(rate * 100)}%)
                  </span>
                  {c.bothFail > 0 && <span className="text-rose-600 dark:text-rose-400"> · ⚠️ منها {c.bothFail} فشلت بالطريقتين</span>}
                </span>
              );
            })}
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
              {status.diffs.map((d, i) => {
                const ch = channelOf(d.store);
                return (
                  <li key={i}>
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="font-black underline">{d.name}</a>
                    {' '}({STORE_AR[d.store] ?? d.store}): {ch.normal} {d.normal.price ?? 'بلا سعر'}{d.normal.inStock ? '' : ' نافد'} · {ch.premium} {d.premium.price ?? 'بلا سعر'}{d.premium.inStock ? '' : ' نافد'}
                    <span className="text-slate-400"> — اعتمدنا {ch.premium}</span>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
            الرصيد: نحو {spent.toLocaleString('en-US')} وحدة بدل {wouldBe.toLocaleString('en-US')} بالاحتياط وحده
            {wouldBe > 0 && ` (توفير ${Math.max(0, Math.round((1 - spent / wouldBe) * 100))}%)`}.
          </p>
        </>
      )}
    </div>
  );
}
