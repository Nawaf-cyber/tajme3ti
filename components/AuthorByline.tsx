import { AUTHOR } from '../lib/content';

/**
 * سطر الكاتب — يظهر أعلى/أسفل الأدلّة.
 * إشارة E-E-A-T صريحة: من الإنسان صاحب الخبرة خلف هذا المحتوى.
 */
export default function AuthorByline({ date }: { date?: Date | string }) {
  const initial = AUTHOR.name.trim().charAt(0);

  return (
    <div className="flex items-center gap-4 p-4 rounded-sm bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80">
      {/* الحرف الأول كصورة رمزية */}
      <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-bold text-slate-500 dark:text-slate-300">بقلم</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">{AUTHOR.name}</span>
          {date && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400">
                {new Date(date).toLocaleDateString('ar-SA')}
              </span>
            </>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {AUTHOR.bio}
        </p>
      </div>
    </div>
  );
}