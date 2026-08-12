import { specLabel, sortedSpecs, specValueLines, isCompatKey, heroKeys } from '../lib/spec-labels';
import { StatStrip, type Stat } from './Panel';

/**
 * ============ جدول المواصفات ============
 *
 * كان شبكةً من مربّعين في الصفّ، التسميةُ فوق القيمة بحجم ٩ بكسل و
 * `tracking-widest`. ثلاثة أخطاء في سطر واحد:
 *
 * ١) العربية خطٌّ متّصل، والتباعد بين الحروف يفصل ما يجب أن يتّصل فتبدو
 *    الكلمة مكسورة. توصية W3C: `letter-spacing: 0` لأي نصّ عربي.
 * ٢) ٩ بكسل دون حدّ القراءة المريحة للعربية (١٥–١٦ بكسل للمتن)، والعربية
 *    تحتاج ارتفاعاً أكبر من اللاتينية لصواعدها ونوازلها.
 * ٣) زوجان متجاوران في الصفّ يُضيّعان أيُّ قيمة تتبع أيَّ تسمية.
 *
 * ثم كان الإصلاح الأول قائمةً مسطّحة — مقروءة، لكن كل سطر فيها بوزن
 * جاره: «المعمارية» بحجم «الطول». والزائر لا يقرأ ثمانية أسطر ليعرف
 * الثلاثة التي تهمّه. فصار الجدول طبقتين:
 *
 *   • **شريط علوي** لثلاث قيم تُعرّف القطعة — كبيرة تُقرأ من بعيد.
 *   • **قائمة** لما تبقّى، صفٌّ لكل مواصفة: التسمية عند اليمين والقيمة
 *     عند اليسار، فتصطفّ القيم عموداً يُمسح بنظرة.
 *
 * مصدر واحد لصفحة القطعة ولنافذة المجمّع — لا نسختان تتباعدان.
 */

type Props = {
  categoryName?: string | null;
  specs: Record<string, unknown>;
  /** النافذة المنبثقة أضيق من الصفحة، فتحتاج صفوفاً أقصر */
  dense?: boolean;
};

export default function SpecSheet({ categoryName, specs, dense = false }: Props) {
  const all = sortedSpecs(categoryName, specs);

  if (all.length === 0) {
    return (
      <p className="py-6 text-center text-sm font-bold text-slate-400 dark:text-slate-500">
        لا توجد مواصفات فنية مسجلة.
      </p>
    );
  }

  /* الشريط يحتاج قائمةً تحته ليكون طبقةً لا بديلاً. تحت خمس مواصفات
     يبتلع الشريطُ الجدولَ ويترك سطراً يتيماً، فتبقى القائمة وحدها. */
  const hero = all.length >= 5 ? heroKeys(categoryName, all.map(([k]) => k)) : [];
  const heroRows = hero.map((k) => all.find(([key]) => key === k)!);
  const listRows = all.filter(([k]) => !hero.includes(k));

  const heroStats: Stat[] = heroRows.map(([key, value]) => {
    const { lines, unit } = specValueLines(key, value);
    const compat = isCompatKey(categoryName, key);
    return {
      label: specLabel(key),
      value: lines.join(' '),
      unit,
      accent: compat ? 'cyan' : 'none',
      marker: compat ? 'يدخل في فحص التوافق' : undefined,
    };
  });

  const hasCompat = all.some(([key]) => isCompatKey(categoryName, key));

  return (
    <div>
      <StatStrip stats={heroStats} dense={dense} />

      <dl className="divide-y divide-slate-200/80 dark:divide-slate-800">
        {listRows.map(([key, value]) => {
          const { lines, unit } = specValueLines(key, value);
          const compat = isCompatKey(categoryName, key);
          /* المنافذ قائمةٌ خُزّنت سطراً واحداً. عرضُها شارات يجعل كلَّ
             منفذ وحدةً تُعدّ بالنظر بدل نصٍّ يُقرأ بالفواصل. */
          const asChips = lines.length > 1;

          return (
            <div
              key={key}
              className={`group flex items-baseline justify-between gap-5 transition-colors hover:bg-cyan-50/70 dark:hover:bg-cyan-950/20 ${
                dense ? 'py-2 px-2 -mx-2' : 'py-2.5 px-3 -mx-3'
              }`}
            >
              <dt
                className={`flex shrink-0 items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400 ${
                  dense ? 'text-[12.5px]' : 'text-[13.5px]'
                }`}
              >
                {compat && (
                  <span
                    title="يدخل في فحص التوافق"
                    aria-label="يدخل في فحص التوافق"
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500 shadow-[0_0_6px] shadow-cyan-500/60"
                  />
                )}
                {specLabel(key)}
              </dt>

              {/* dir=ltr لأن القيم تقنية لاتينية؛ ووضعها عند حافة النهاية
                  يجعلها عموداً واحداً تُقارَن رأسياً */}
              <dd
                dir="ltr"
                className={`min-w-0 text-left font-bold tabular-nums leading-snug text-slate-900 dark:text-slate-100 ${
                  dense ? 'text-[13px]' : 'text-[14.5px]'
                }`}
              >
                {asChips ? (
                  <span className="flex flex-wrap justify-start gap-1">
                    {lines.map((line, i) => (
                      <span
                        key={i}
                        className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[11.5px] font-bold text-slate-700 dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-200"
                      >
                        {line}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="block">
                    {lines[0]}
                    {/* مسافة حقيقية لا هامش: الهامش يفصل بصرياً لكنه ينسخ
                        «303مم» ملتصقةً ويقرؤها قارئ الشاشة كلمةً واحدة */}
                    {unit && (
                      <>
                        {' '}
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          {unit}
                        </span>
                      </>
                    )}
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      {/* الوسم بلا مفتاحٍ يقرؤه لغزٌ صغير. والسطر يشرح ما يميّز الموقع:
          هذه الأرقام ليست زينة — عليها يُبنى قبول التجميعة أو رفضها. */}
      {hasCompat && (
        <p className="mt-4 flex items-center gap-1.5 border-t border-dashed border-slate-200 pt-3 text-[11.5px] font-semibold text-slate-400 dark:border-slate-800 dark:text-slate-500">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
          يعتمد عليها فحص التوافق في المجمّع
        </p>
      )}
    </div>
  );
}
