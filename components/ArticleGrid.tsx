/* ============ شبكة المقالات — صفحتا الأخبار والأدلّة (2026-10-30) ============
 *
 * كانت البطاقة نفسها منسوخةً في app/news وapp/guides بفرق اللون وحده. صارت هنا:
 * أوّل مقالٍ عريض (عمودين، صورة أطول، عنوان أكبر وملخّص أطول) كما في قسم المقالات
 * بالرئيسية، والباقي ثلاثة في الصفّ. والحدّ العلويّ السماويّ والاستدارة الحادّة
 * من لغة اللوحات نفسها. وللأدلّة لونها الأخضر الذي يميّزها عن الأخبار.
 *
 * ⚠️ الشارة بلا uppercase ولا tracking: كلاهما يكسر الحرف العربيّ (MicroLabel في Panel.tsx).
 */
import Link from 'next/link';
import { longDateAr } from '../lib/time-ago';

type Article = { id: string; title: string; summary: string | null; imageUrl: string | null; createdAt: Date; category: string };

const TONES = {
  news: {
    top: 'border-t-cyan-500/70',
    badge: 'text-cyan-700 dark:text-cyan-400',
    hoverTitle: 'group-hover:text-cyan-700 dark:group-hover:text-cyan-400',
    hoverBtn: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-400 hover:border-cyan-500/40',
    shadow: 'hover:shadow-cyan-500/10',
  },
  guide: {
    top: 'border-t-emerald-500/70',
    badge: 'text-emerald-700 dark:text-emerald-400',
    hoverTitle: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-400',
    hoverBtn: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40',
    shadow: 'hover:shadow-emerald-500/10',
  },
} as const;

export default function ArticleGrid({
  items, base, tone, cta, badge, emptyIcon, emptyText,
}: {
  items: Article[];
  base: '/news' | '/guides';
  tone: keyof typeof TONES;
  cta: string;
  /** شارة الصورة: للأخبار تصنيفُها، وللأدلّة «دليل» */
  badge: (a: Article) => string;
  emptyIcon: string;
  emptyText: string;
}) {
  const t = TONES[tone];

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm rounded-sm border-x border-b border-t-2 border-slate-200 dark:border-slate-800/80 border-t-cyan-500/70 shadow-sm">
        <span className="text-4xl block mb-4 opacity-50">{emptyIcon}</span>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-bold">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((a, i) => {
        const big = i === 0;
        return (
          <article
            key={a.id}
            className={`group relative flex flex-col overflow-hidden rounded-sm border-x border-b border-t-2 border-slate-200 dark:border-slate-800/80 ${t.top} bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-sm shadow-sm hover:shadow-xl ${t.shadow} hover:-translate-y-1 transition-all duration-300 ${big ? 'md:col-span-2' : ''}`}
          >
            <div className={`relative w-full overflow-hidden border-b border-slate-100 dark:border-slate-800/60 bg-slate-100 dark:bg-[#0B1120] ${big ? 'h-56 md:h-72' : 'h-48'}`}>
              {a.imageUrl ? (
                <>
                  <img src={a.imageUrl} alt={a.title} loading={big ? 'eager' : 'lazy'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent opacity-0 dark:opacity-100 pointer-events-none"></div>
                </>
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">{emptyIcon}</span>
              )}
              <span className={`absolute top-3 right-3 z-10 px-2.5 py-1 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-sm text-[12px] font-black rounded-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm ${t.badge}`}>
                {badge(a)}
              </span>
            </div>

            <div className={`flex flex-col flex-1 ${big ? 'p-6 md:p-7' : 'p-5'}`}>
              <span className="self-start text-[11.5px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-sm mb-3">
                {longDateAr(a.createdAt)}
              </span>
              <h2 className={`${big ? 'text-2xl md:text-[26px]' : 'text-lg'} font-black text-slate-900 dark:text-white leading-snug line-clamp-2 mb-2.5 transition-colors ${t.hoverTitle}`}>
                {a.title}
              </h2>
              <p className={`text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-6 flex-1 ${big ? 'line-clamp-4' : 'line-clamp-3'}`}>
                {a.summary}
              </p>
              <Link
                href={`${base}/${a.id}`}
                className={`mt-auto inline-flex items-center justify-center gap-2 ${big ? 'self-start px-6' : 'w-full'} py-3 rounded-sm border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 font-bold text-sm transition-all group/btn ${t.hoverBtn}`}
              >
                <span>{cta}</span>
                <span className="group-hover/btn:-translate-x-1 transition-transform" aria-hidden="true">&larr;</span>
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
