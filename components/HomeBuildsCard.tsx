/* ============ «تجميعات جاهزة اليوم» — بطاقة رأس الرئيسية (شكل هـ · 2026-10-29) ============
 *
 * التجميعات اليوميّة الثلاث (lib/auto-builds) كانت قسماً كاملاً تحت الرأس، وصارت
 * ثلاثة صفوفٍ في الرأس نفسه: أوّل ما يراه القادم هو تجميعةٌ متوافقة بسعرها —
 * وهو ما طلبته تجربة المستخدمين (2026-10-17) حين كانت في الشاشة السابعة.
 */
import Link from 'next/link';
import { tierBuilds } from '../lib/auto-builds';
import { formatTotal } from '../lib/price';
import RiyalSign from './RiyalSign';

export default async function HomeBuildsCard() {
  const builds = (await tierBuilds()).filter((b) => b.params);

  return (
    <aside className="relative w-full lg:w-[380px] shrink-0 flex flex-col gap-2.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0B1120]/65 p-4 pb-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400">تجميعات جاهزة اليوم · بأرخص سعر لكل قطعة</p>
        <span className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px] shadow-emerald-500"></span>
          متوافقة
        </span>
      </div>

      {builds.length === 0 ? (
        <p className="py-6 text-center text-[13px] font-bold text-slate-500 dark:text-slate-400">ما قدرنا نكوّن تجميعة اليوم من المتوفّر — جرّب الباني.</p>
      ) : (
        builds.map((b) => (
          <Link
            key={b.id}
            href={`/builder?${b.params}`}
            className="group flex items-center justify-between gap-3.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B1120]/60 px-3.5 py-3 hover:border-cyan-400/60 dark:hover:border-cyan-500/50 transition-colors"
          >
            <span className="min-w-0">
              <b className="block text-[14px] font-black text-slate-900 dark:text-white">{b.title}</b>
              <small className="block mt-0.5 text-[11.5px] font-bold text-slate-500 dark:text-slate-400 line-clamp-1">{b.desc}</small>
            </span>
            <span className="flex items-center gap-2.5 shrink-0">
              <span className="font-mono text-[17px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap" dir="ltr">
                {formatTotal(b.price)}<RiyalSign />
              </span>
              <span className="text-[11.5px] font-black text-white dark:text-[#0B1120] bg-cyan-600 dark:bg-cyan-400 group-hover:bg-cyan-500 px-2.5 py-1.5 rounded-sm whitespace-nowrap transition-colors">استعرض</span>
            </span>
          </Link>
        ))
      )}

      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-extrabold">
        <Link href="/builder" className="text-cyan-700 dark:text-cyan-400 hover:underline">ما تدري وش تبي؟ خلّنا نقترح لك ←</Link>
        <Link href="/prebuilds" className="text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300">تجميعات من اختيارنا ←</Link>
      </p>
    </aside>
  );
}
