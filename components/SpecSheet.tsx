import { specLabel, sortedSpecs, specValueLines, isCompatKey, heroKeys } from '../lib/spec-labels';
import { isFeatureKey, readFeatures, isNoteKey, readNotes } from '../lib/spec-schema';
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
  /* ⚠️ المزايا تُستخرج قبل الجدول وتُستبعد منه.
     هي مصفوفة جُمَل لا قيمةً مفردة، فلو دخلت الصفوف طُبعت مسرودةً بفواصل
     في خانةٍ عرضها خانة — والأسوأ أن صفّاً باسم «Features» يَعِد بمقابلٍ
     في القطع الأخرى وهو غير موجود. */
  const features = readFeatures(specs);
  /* الملاحظات تُستخرج مثل المزايا وتُستبعد من الجدول لنفس السبب — لكنها
     ليست مثلها في المعنى: تلك في صالح القطعة وهذه تحفّظٌ عليها. */
  const notes = readNotes(specs);
  const all = sortedSpecs(categoryName, specs).filter(([k]) => !isFeatureKey(k) && !isNoteKey(k));

  if (all.length === 0 && features.length === 0 && notes.length === 0) {
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

  /* شارات لا صفوف: الميزة خبرٌ مفردٌ يُقرأ حيث هو، ولا يُنتظر له نظيرٌ في
     قطعةٍ أخرى — فلا تُوضع في جدولٍ يوحي بالمقابلة. */
  const FeatureBadges = () =>
    features.length === 0 ? null : (
      <div className="mt-4 border-t border-slate-200/80 pt-4 dark:border-slate-800">
        <p className="mb-2 text-[11px] font-black text-slate-400 dark:text-slate-500">مزايا إضافية</p>
        <ul className="flex flex-wrap gap-1.5">
          {features.map((f) => (
            <li
              key={f}
              className="rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 text-[11.5px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
            >
              {f}
            </li>
          ))}
        </ul>
      </div>
    );

  /* كهرمانيّ لا رماديّ — واللون هنا معنىً لا زينة: القارئ يعرف قبل أن
     يقرأ أن هذا ممّا يُنتبه له، لا ممّا يُغري بالشراء. */
  const NoteBlock = () =>
    notes.length === 0 ? null : (
      <div className="mt-4 rounded-sm border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/60 dark:bg-amber-900/10">
        <p className="mb-1.5 text-[11px] font-black text-amber-700 dark:text-amber-400">ملاحظات</p>
        <ul className="space-y-1.5">
          {notes.map((n) => (
            <li
              key={n}
              className="flex gap-2 text-[12.5px] font-semibold leading-relaxed text-amber-800 dark:text-amber-200"
            >
              <span className="mt-[0.5em] h-1 w-1 shrink-0 rounded-full bg-amber-500" />
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </div>
    );

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

      <FeatureBadges />
      {/* بعد المزايا: التحفّظ يُقرأ بعد الوصف لا قبله */}
      <NoteBlock />

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
