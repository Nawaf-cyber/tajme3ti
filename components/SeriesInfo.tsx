'use client';

/**
 * السلسلة وضمان الشركة (lib/series.ts) — سطرٌ تحت القطعة المختارة في الباني،
 * وقسمٌ في نافذة التفاصيل. كلُّه ممّا تنشره الشركة، ومصدره ظاهر.
 */

import { ISSUES_CHECKED, seriesInfo, seriesLine, warrantyText, type IssueLevel } from '../lib/series';

/* الدرجة ظاهرةٌ على كلّ ملاحظة — الزائر يعرف من قالها قبل أن يقرأها */
const LEVEL: Record<IssueLevel, { label: string; cls: string }> = {
  official: { label: 'رسميّ · من الشركة', cls: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800' },
  tested: { label: 'اختبار مستقلّ', cls: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-800' },
  reported: { label: 'متداول · غير رسميّ', cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
};

const linkCls = 'text-cyan-600 dark:text-cyan-400 hover:underline';

type Part = { brand: string; name: string };

/** سطرٌ واحد: «سلسلة RMe · الدرجة 2 من 6 في تشكيلة Corsair · ضمان الشركة 7 سنوات»
 *  في الباني: زرٌّ يفتح نافذة التفاصيل (onMore). في صفحة القطعة: رابطٌ ينزل
 *  إلى القسم الكامل (href)، وتنسيقه تحت العنوان (className). */
export function SeriesLine({ part, category, onMore, href, className }: {
  part: Part; category: string; onMore?: () => void; href?: string; className?: string;
}) {
  const s = seriesInfo(part, category);
  if (!s) return null;
  const more = s.issues.length === 0 ? 'المزيد' : s.issues.length === 1 ? 'المزيد وملاحظة' : `المزيد و${s.issues.length} ملاحظات`;
  const moreCls = 'mr-1.5 text-cyan-600 dark:text-cyan-400 hover:underline';
  return (
    <div className={className ?? 'mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[12px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed'}>
      {seriesLine(s)}
      {href ? (
        <a href={href} className={moreCls}>· {more} ↓</a>
      ) : onMore && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onMore(); }} className={moreCls}>
          · {more}
        </button>
      )}
    </div>
  );
}

/** القسم في نافذة التفاصيل بالباني — عنوانه وإطاره حول SeriesDetails */
export function SeriesPanel({ part, category }: { part: Part; category: string }) {
  if (!seriesInfo(part, category)) return null;
  return (
    <div className="mb-8">
      <h4 className="font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <span className="text-cyan-600">🏷️</span> السلسلة وضمان الشركة
      </h4>
      <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-sm border border-slate-200 dark:border-slate-700/30">
        <SeriesDetails part={part} category={category} />
      </div>
    </div>
  );
}

/** المحتوى وحده: سُلَّم الشركة وموضعها فيه، والضمان، والملاحظات، والمصادر.
 *  نافذة الباني وصفحة القطعة تغلّفانه كلٌّ بإطارها. */
export function SeriesDetails({ part, category }: { part: Part; category: string }) {
  const s = seriesInfo(part, category);
  if (!s) return null;

  return (
      <div className="text-sm text-slate-700 dark:text-slate-300 space-y-3">
        {s.ladder ? (
          <div>
            <div className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2">
              تشكيلة {s.brand} كما ترتّبها الشركة، من الأدنى إلى الأعلى:
            </div>
            {/* باتّجاه الصفحة: الأدنى يمين حيث تبدأ القراءة، فيطابق «من الأدنى إلى الأعلى» */}
            <div className="flex flex-wrap gap-1.5">
              {s.ladder.map((step, i) => {
                const here = s.rank === i + 1;
                return (
                  <span
                    key={step}
                    className={`text-[12px] font-bold px-2 py-1 rounded-sm border ${
                      here
                        ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-500'
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {step}
                  </span>
                );
              })}
            </div>
            <div className="mt-2 font-bold">
              {s.rank
                ? <>هذه القطعة من سلسلة <span dir="ltr">{s.label}</span>: الدرجة {s.rank} من {s.ladder.length}.</>
                : <>هذه القطعة من سلسلة <span dir="ltr">{s.label}</span>: {s.offLadder}.</>}
            </div>
          </div>
        ) : (
          <div>
            <span className="font-bold">السلسلة: <span dir="ltr">{s.label}</span>{s.offLadder ? ` · ${s.offLadder}` : ''}.</span>{' '}
            <span className="text-slate-500 dark:text-slate-400">لم نجد ترتيباً رسمياً تنشره {s.brand} لسلاسلها، فلا نرتّبها نحن.</span>
          </div>
        )}

        <div>
          <span className="font-bold">ضمان الشركة: </span>
          {s.warranty ? warrantyText(s.warranty) : 'لم تنشر الشركة مدّته لهذه السلسلة.'}
          {s.warranty && (
            <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
              هذا ما تنشره الشركة، وقد يختلف بحسب المنطقة. الضمان الفعليّ في السعودية يحدّده المتجر والوكيل، فاسأل عنه قبل الشراء.
            </div>
          )}
        </div>

        {s.note && <div className="text-[13px] font-bold text-amber-700 dark:text-amber-400">{s.note}</div>}

        {(s.issues.length > 0 || s.cleanTest) && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700/50 space-y-3">
            <div className="font-bold">ملاحظات معروفة</div>
            {s.issues.map((i, k) => (
              <div key={k} className="space-y-1">
                <span className={`inline-block text-[11px] font-bold px-1.5 py-0.5 rounded-sm border ${LEVEL[i.level].cls}`}>{LEVEL[i.level].label}</span>
                <div className="leading-relaxed">{i.text}</div>
                {i.resolved && <div className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400">انتهت: {i.resolved}</div>}
                <div className="text-[12px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3">
                  {i.sources.map((src) => (
                    <a key={src.url} href={src.url} target="_blank" rel="noopener noreferrer" className={linkCls}>
                      {src.name}{src.date ? ` (${src.date})` : ''}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            {/* يُخفى إن وجد اختبارٌ ما يُذكر؛ ويبقى مع الرسميّة — شرطُ تركيبٍ من الشركة لا ينقض حكم المختبر */}
            {!s.issues.some((i) => i.level === 'tested') && s.cleanTest && (
              <div>
                اختبرها{' '}
                <a href={s.cleanTest.url} target="_blank" rel="noopener noreferrer" className={linkCls}>{s.cleanTest.name}</a>
                {s.cleanTest.date ? ` (${s.cleanTest.date})` : ''} ولم يجد فيها ما يمسّ المشتري.
              </div>
            )}
            <div className="text-[12px] text-slate-500 dark:text-slate-400">راجعنا المصادر في {ISSUES_CHECKED}.</div>
          </div>
        )}

        <div className="text-[12px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3">
          <span>مصادر الترتيب والضمان:</span>
          {s.ladderSource && <a href={s.ladderSource} target="_blank" rel="noopener noreferrer" className={linkCls}>ترتيب التشكيلة</a>}
          <a href={s.source} target="_blank" rel="noopener noreferrer" className={linkCls}>الضمان</a>
        </div>
      </div>
  );
}
