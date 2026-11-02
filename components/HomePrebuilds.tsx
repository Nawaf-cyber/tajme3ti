import Link from 'next/link';
import RiyalSign from './RiyalSign';
import { formatPrice } from '../lib/price';
import type { HomeShowcase } from '../lib/home-showcase';

/* ============ التجميعات الجاهزة — الستّ بمجموعها اللحظيّ ============ */
const BUDGET: Record<string, string> = { economic: 'اقتصادية', midrange: 'متوسطة', highend: 'عالية' };
export default function HomePrebuilds({ show }: { show: Pick<HomeShowcase, 'prebuilds'> }) {
  if (!show.prebuilds.length) return null;
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <h2 className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          <span className="h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_10px] shadow-cyan-500/40"></span>
          تجميعات جاهزة
          <small className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">· اخترناها وفحصناها في الباني</small>
        </h2>
        <Link href="/prebuilds" className="text-[13px] font-extrabold text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300">كلها &larr;</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
        {show.prebuilds.map((p) => (
          <Link
            key={p.id}
            href={p.href}
            className="group relative flex flex-col gap-2 rounded-sm border-x border-b border-t-2 border-slate-200 dark:border-slate-800 border-t-cyan-500/70 dark:border-t-cyan-500/70 bg-white/70 dark:bg-[#0F172A]/60 p-4 hover:border-x-cyan-500/40 hover:border-b-cyan-500/40 transition-colors"
          >
            <span className="text-[12px] font-extrabold text-cyan-700 dark:text-cyan-400">{BUDGET[p.budgetType] ?? ''}</span>
            <b className="text-[14px] font-black leading-snug text-slate-900 dark:text-white min-h-[2.6em] group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">{p.title}</b>
            <span className="font-mono text-[17px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums" dir="ltr">{formatPrice(Math.round(p.total))}<RiyalSign /></span>
            <span className={`text-[12px] font-bold ${p.missing ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {p.missing ? `${p.missing === 1 ? 'قطعة نافدة' : `${p.missing} قطع نافدة`} — بدونها` : 'افتحها في الباني ←'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
