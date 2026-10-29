import Link from 'next/link';
import CountdownTimer from './CountdownTimer';
import { formatTotal } from '../lib/price';
import { tierBuilds } from '../lib/auto-builds';

/* القسم القديم للتجميعات اليوميّة الثلاث. الحساب في lib/auto-builds (تقرؤه
   بطاقة الرأس في الرئيسية HomeBuildsCard أيضاً). لم يعد يُعرض في الرئيسية
   منذ شكل هـ (2026-10-29)؛ باقٍ لمن يريد إرجاعه. */

export default async function AutoBuildsSection() {
  const displayBuilds = await tierBuilds();

  const RiyalIcon = ({ size = 'h-4 w-4', colorClass = 'bg-current' }: { size?: string, colorClass?: string }) => (
    <div
      className={`${size} ${colorClass} inline-block align-middle`}
      style={{
        maskImage: "url('/riyal.svg')",
        WebkitMaskImage: "url('/riyal.svg')",
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center'
      }}
    />
  );

  return (
    <section className="max-w-7xl mx-auto px-4 pb-20 mt-10">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-slate-200 dark:border-slate-800/60 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
            تجميعات مقترحة ومحدثة تلقائياً
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
            تجميعات متوافقة تُختار يومياً من الكتالوج، وتبقى ثابتة حتى التحديث القادم.
          </p>
        </div>
        <CountdownTimer />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayBuilds.map((build) => (
          <div
            key={build.id}
            className={`border rounded-sm p-8 flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1 ${build.bgTheme}`}
          >
            <div>
              <h3 className={`text-xl font-black mb-3 ${build.textColor}`}>{build.title}</h3>
              <p className={`text-sm mb-8 line-clamp-3 leading-loose font-bold opacity-80 ${build.textColor}`}>
                {build.desc}
              </p>
            </div>

            <div className="pt-6 border-t border-current/10">
              <span className={`block text-xs font-extrabold uppercase tracking-widest mb-2 opacity-60 ${build.textColor}`}>
                التكلفة التقريبية
              </span>
              <div className="flex items-center justify-between">
                <div className={`text-2xl font-black flex items-center justify-center gap-1.5 leading-none ${build.textColor}`}>
                  {formatTotal(build.price)} <RiyalIcon size="h-5 w-5" />
                </div>
                <Link
                  href={`/builder?${build.params}`}
                  className="text-xs font-black bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md px-5 py-2.5 rounded-sm transition-all active:scale-95"
                >
                  استعراض التجميعة
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}