/* ============ «نفس القطعة، وسعرها يختلف» — ليش الموقع موجود (2026-11-02) ============
 * رقمٌ محسوب على الكتالوج كلّه لا مكتوب: كم قطعةً لها سعرٌ في متجرين فأكثر،
 * ووسيط الفرق بين أرخصها وأغلاها (lib/home-showcase). وبجانبه كرتٌ واحد بعروضه:
 * طول الشريط سعر المتجر، والجزء الورديّ ما تدفعه زيادةً على الأرخص. */
import Link from 'next/link';
import RiyalSign from './RiyalSign';
import { formatPrice, formatTotal } from '../lib/price';
import type { Spread } from '../lib/home-showcase';

export default function HomeSpread({ spread }: { spread: Spread }) {
  const g = spread.gpu;
  if (!spread.multi) return null;
  const pct = Math.round(spread.medianPct * 100);
  const max = g ? g.quotes[g.quotes.length - 1].price : 0;
  const lo = g ? g.quotes[0].price : 0;

  return (
    <section className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-12 items-center">
      <div className="flex flex-col gap-4 text-center lg:text-start items-center lg:items-start">
        <h2 className="text-[27px] sm:text-[40px] leading-tight font-black tracking-tight text-slate-900 dark:text-white">
          نفس القطعة، وسعرها يختلف
        </h2>
        <p className="font-mono text-[96px] sm:text-[120px] leading-[0.9] font-black tracking-tighter text-rose-500 dark:text-rose-400 tabular-nums" dir="ltr">
          {pct}%
        </p>
        <p className="max-w-md text-[16px] sm:text-[17px] font-medium leading-relaxed text-slate-600 dark:text-slate-400">
          <b className="font-mono text-slate-900 dark:text-white">{spread.multi}</b> قطعة عندنا تنباع في أكثر من متجر، ونصّها يفرق سعرها <b className="text-rose-600 dark:text-rose-400">{pct}٪ أو أكثر</b> بين أرخص متجر وأغلاه. نعرض لك كل الأسعار ونعلّم الأرخص.
        </p>
      </div>

      {g && (
        <div className="rounded-sm border border-slate-200 dark:border-slate-800 border-t-2 border-t-cyan-500 dark:border-t-cyan-500 bg-white/85 dark:bg-[#0F172A]/80 backdrop-blur-sm p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <span className="text-[13px] font-extrabold text-slate-500 dark:text-slate-400">مثال من اليوم</span>
            <bdi className="text-[15px] font-black text-slate-900 dark:text-white" dir="ltr">{g.name}</bdi>
          </div>
          <ul className="flex flex-col gap-3">
            {g.quotes.map((q, i) => {
              const base = (lo / max) * 100;
              const over = ((q.price - lo) / max) * 100;
              return (
                <li key={q.store} className="grid grid-cols-[92px_minmax(0,1fr)_auto] items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-slate-700 dark:text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full ring-1 ring-slate-900/15 dark:ring-white/10" style={{ background: q.color }}></span>
                    {q.store}
                  </span>
                  <span className="flex h-3 rounded-sm overflow-hidden bg-slate-100 dark:bg-slate-800/60">
                    <span className={i === 0 ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'} style={{ width: `${base.toFixed(1)}%` }}></span>
                    {i > 0 && <span className="bg-rose-500 dark:bg-rose-400" style={{ width: `${over.toFixed(1)}%` }}></span>}
                  </span>
                  <span className="text-end whitespace-nowrap">
                    <span className={`font-mono text-[15px] font-black tabular-nums ${i === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`} dir="ltr">{formatPrice(q.price)}<RiyalSign /></span>
                    <span className={`block text-[12px] font-bold ${i === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {i === 0 ? 'الأرخص' : <>+<span className="font-mono" dir="ltr">{formatTotal(q.price - lo)}</span> ريال</>}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between gap-3 flex-wrap border-t border-dashed border-slate-300 dark:border-slate-700 pt-3.5">
            <p className="text-[14px] font-bold text-slate-600 dark:text-slate-400">
              الفرق على نفس الكرت <b className="font-mono text-rose-600 dark:text-rose-400" dir="ltr">{formatTotal(max - lo)}</b> ريال
            </p>
            <Link href={`/components/${g.id}`} className="text-[13px] font-extrabold text-cyan-700 dark:text-cyan-400 hover:underline">
              شوف عروضه كلها &larr;
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
