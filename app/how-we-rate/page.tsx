import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd, { breadcrumbs } from '../../components/JsonLd';
import { cpuPerf, CPU_PERF_SOURCE, CPU_GAMING_TOP } from '../../lib/cpu-perf';
import { gpuPerf, GPU_PERF_SOURCE } from '../../lib/gpu-perf';
import { CPU_GAMING_LEVELS, CPU_MULTI_LEVELS, cpuTierFromGaming, cpuTierFromMulti } from '../../lib/perf-tier';
import { GPU_FPS_LEVELS, gpuTierFromFps, levelWord } from '../../lib/perf-rating';
import { MON_RULES, SIZE_FOR, bandFor, bandText, ppiOf, targetFor, type MonRes } from '../../lib/monitor-match';

/* ============ كيف نقيّم أداء القطع؟ ============
 * يشرح بطاقة «تقييم الأداء» (components/PartRating): المصدر، والحدود، ولماذا للمعالج تقييمان،
 * وما لا قياس له. والحدود والأمثلة **تُقرأ من الكود نفسه** (lib/perf-tier · lib/perf-rating ·
 * جداول القياس) — جدولٌ مكتوبٌ باليد هنا كان سيفترق عن الحساب عند أوّل تعديل.
 */

export const metadata: Metadata = {
  title: 'كيف نقيّم أداء القطع',
  description: 'تقييم أداء المعالجات وكروت الشاشة في تجميعتي محسوبٌ من اختبارات منشورة لا بالتقدير: المصدر، وحدود كلّ درجة، ولماذا للمعالج تقييمان، وكيف نحكم إنّ الشاشة تناسب كرتك.',
  alternates: { canonical: '/how-we-rate' },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' });

/** صفوف جدول الحدود: [المستوى، النطاق بالكلمات] من مصفوفة [الحدّ الأدنى، المستوى] تنازليّة */
const ranges = (levels: [number, number][], unit: string) =>
  levels.map(([min, level], i) => {
    const upper = i === 0 ? null : levels[i - 1][0];
    const span = upper == null ? `${min}${unit} فأكثر` : min === 0 ? `أقلّ من ${upper}${unit}` : `${min}–${upper}${unit}`;
    return { level, span };
  });

function LevelTable({ title, rows }: { title: string; rows: { level: number; span: string }[] }) {
  return (
    <table className="w-full text-[15px] border-collapse mt-3">
      <thead>
        <tr className="text-right text-slate-500 dark:text-slate-400 text-[13px]">
          <th className="font-bold pb-2 border-b border-gray-100 dark:border-slate-800">التقييم</th>
          <th className="font-bold pb-2 border-b border-gray-100 dark:border-slate-800">{title}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.level}>
            <td className="py-1.5 border-b border-gray-50 dark:border-slate-800/60 font-black">{levelWord(r.level)}</td>
            <td className="py-1.5 border-b border-gray-50 dark:border-slate-800/60 font-mono" dir="rtl">{r.span}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* أمثلة حقيقيّة من جداول القياس — تُحسب، لا تُكتب */
const cpuExample = (name: string) => {
  const p = cpuPerf(name);
  return p && p.gaming != null && p.multi != null
    ? { name, games: levelWord(cpuTierFromGaming(p.gaming)), work: levelWord(cpuTierFromMulti(p.multi)) }
    : null;
};

/* مثال الشاشات من الحساب نفسه (lib/monitor-match) — لا أرقام مكتوبة باليد */
const monExample = (chip: string) => {
  const p = gpuPerf(chip);
  if (!p) return null;
  const res = targetFor('heavy', p);
  const fps = Math.round(res === '4K' ? p.f4k : res === '1440p' ? p.f1440 : p.f1080);
  return { chip, res, fps, band: bandText(bandFor('heavy', p, res)) };
};
const SIZE_ROWS: [MonRes, string, number][] = [['1080p', '1920x1080', 24.5], ['1440p', '2560x1440', 27], ['4K', '3840x2160', 32]];

export default function HowWeRatePage() {
  const strong = 'text-blue-600 dark:text-blue-400';
  const h3 = 'font-black text-slate-800 dark:text-slate-200 mt-5 mb-1';
  const monEx = monExample('RTX 5070');
  const soft27 = Math.round(ppiOf({ resolution: '1920x1080', sizeInch: 27 }) ?? 0);
  const gpuEx = gpuPerf('RTX 5080');
  const cpuExs = ['Ryzen 7 9800X3D', 'Core i9-14900K'].map(cpuExample).filter(Boolean) as NonNullable<ReturnType<typeof cpuExample>>[];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <JsonLd data={breadcrumbs([['الرئيسية', '/'], ['كيف نقيّم أداء القطع', '/how-we-rate']])} />
      <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-gray-100 dark:border-slate-800 p-8 md:p-12">
        <h1 className="text-4xl font-black mb-2 text-slate-900 dark:text-white">كيف نقيّم أداء القطع؟</h1>
        <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
          كل معالج وكرت شاشة عندنا له «تقييم أداء» بخمس درجات: أساسي، اقتصادي، متوسّط، قوي، قمّة. والتقييم ما نكتبه بإيدنا،
          نحسبه من اختبارات منشورة.
        </p>

        <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
          <section>
            <h2 className={`font-black ${strong} mb-1`}>من وين الأرقام؟</h2>
            <p>
              من جداول الأداء اللي ينشرها موقع {GPU_PERF_SOURCE.name}، بعد ما يختبر القطع على نفس الجهاز ونفس الألعاب:{' '}
              <a href={GPU_PERF_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline">جدول كروت الشاشة</a>
              {' '}(حُدّث {fmtDate(GPU_PERF_SOURCE.updated)}) و
              <a href={CPU_PERF_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline">جدول المعالجات</a>
              {' '}(حُدّث {fmtDate(CPU_PERF_SOURCE.updated)}). ننقل الأرقام كما هي، ونحدّثها لمّا يحدّثون جداولهم.
            </p>
          </section>

          <section>
            <h2 className={`font-black ${strong} mb-1`}>كروت الشاشة: الإطارات في 1440p</h2>
            <p>
              نقيس الكرت بمتوسّط الإطارات في الثانية بدقّة 1440p على ألعاب حديثة بإعدادات عالية، لأنها الدقّة اللي يفرق فيها الكرت
              أكثر شي. والأرقام على الدقّة الأصلية بدون DLSS أو FSR وبدون توليد إطارات، عشان تكون المقارنة بين الكروت عادلة؛ ولو
              شغّلتها في لعبتك بتطلع لك إطارات أكثر من المكتوب.
              {gpuEx && <> مثلاً RTX 5080 يعطي نحو {Math.round(gpuEx.f1440)} إطاراً، فتقييمه «{levelWord(gpuTierFromFps(gpuEx.f1440))}».</>}
            </p>
            <LevelTable title="متوسّط الإطارات في 1440p" rows={ranges(GPU_FPS_LEVELS, '')} />
            <p className="text-[15px] mt-2 text-slate-500 dark:text-slate-400">
              وفي صفحة كل كرت تلقى إطاراته في 1080p و1440p و4K، ومعها إطاراته لو شغّلت تتبّع الأشعة.
            </p>
          </section>

          <section>
            <h2 className={`font-black ${strong} mb-1`}>المعالجات: تقييمان لا تقييم واحد</h2>
            <p>
              المعالج اللي يطيّر الفريمات في الألعاب مو بالضرورة الأفضل في المونتاج، والعكس. فنعطي كل معالج تقييمين:
            </p>
            <ul className="list-disc pr-6 mt-2 space-y-1">
              <li><strong>للألعاب:</strong> أداؤه في الألعاب كنسبة من أسرع معالج ألعاب اليوم ({CPU_GAMING_TOP}).</li>
              <li><strong>للمونتاج والتصميم:</strong> أداؤه لمّا يشتغل بكل أنويته، كنسبة من الأسرع في هذا الاختبار.</li>
            </ul>
            {cpuExs.length === 2 && (
              <p className="mt-2">
                مثلاً {cpuExs[0].name} تقييمه للألعاب «{cpuExs[0].games}» وللمونتاج «{cpuExs[0].work}»، بينما {cpuExs[1].name} للألعاب
                «{cpuExs[1].games}» وللمونتاج «{cpuExs[1].work}».
              </p>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              <LevelTable title="الألعاب: ٪ من أسرع معالج" rows={ranges(CPU_GAMING_LEVELS, '٪')} />
              <LevelTable title="المونتاج: ٪ من الأسرع في تعدّد الأنوية" rows={ranges(CPU_MULTI_LEVELS, '٪')} />
            </div>
          </section>

          <section id="monitors" className="scroll-mt-24">
            <h2 className={`font-black ${strong} mb-1`}>الشاشات: وش تناسب كرتك؟</h2>
            <p>
              ما نعطي الشاشة «تقييم جودة»، لأنّه ما فيه مصدر قياس موحّد للشاشات مثل جداول الكروت. اللي نحسبه هو <strong>تناسبها مع
              كرتك</strong>، من ثلاث أشياء:
            </p>
            <ol className="list-decimal pr-6 mt-2 space-y-1.5">
              <li>
                <strong>الدقّة:</strong> أعلى دقّة يعطي فيها كرتك {MON_RULES.comfortFps} إطار أو أكثر في الألعاب الثقيلة (نفس أرقام الكروت
                فوق). من {MON_RULES.acceptFps} لين {MON_RULES.comfortFps - 1} إطار نسمّيها «مقبول، مو مريح»، وتحتها «ثقيلة على كرتك».
              </li>
              <li>
                <strong>الهرتز:</strong> من إطارات كرتك في هالدقّة لين ضعفها، والسقف ما ينزل عن {MON_RULES.heavyHzFloor} هرتز. الشاشة اللي
                هرتزها أقل من إطاراتك تقصّ منها، واللي فوق الضعف ما تستفيد منها في الألعاب الثقيلة.
                {monEx && <> مثلاً {monEx.chip} يعطي نحو {monEx.fps} إطار في {monEx.res}، فالأنسب له شاشة {monEx.res} بين <bdi dir="ltr">{monEx.band}</bdi> هرتز.</>}
              </li>
              <li>
                <strong>المنافذ:</strong> نحسب البيانات اللي تحتاجها الشاشة بأعلى هرتز، ونقارنها بأقوى منفذ مشترك بين كرتك والشاشة
                (DisplayPort أو HDMI). ونقول لك لو تشتغل بكامل سرعتها، أو تحتاج ضغط DSC، أو توقف قبل سرعتها.
              </li>
            </ol>

            <h3 className={h3}>وش تلعب؟</h3>
            <ul className="list-disc pr-6 space-y-1.5">
              <li><strong>ثقيلة وقصصية:</strong> الحساب فوق كما هو.</li>
              <li>
                <strong>تنافسية خفيفة</strong> (مثل Valorant وCS2): بإعدادات منخفضة تطلع إطارات أعلى بكثير من الألعاب الثقيلة، والمعالج
                غالباً هو اللي يحدّها. وما عندنا قياس منشور موحّد لهالألعاب، فما نخترع رقم: نستخدم قاعدة عامة، {MON_RULES.compHz} هرتز
                فأكثر ({MON_RULES.compHzWeak} لو كرتك تحت {MON_RULES.compWeakFps} إطار في 1080p بالألعاب الثقيلة)، والدقّة ما تتعدّى 1440p
                لأنّ الهرتز هنا أهمّ من الدقّة.
              </li>
              <li>
                <strong>الاثنين:</strong> نفس حساب الثقيلة، بس السقف ما ينزل عن {MON_RULES.mixedHzFloor} هرتز، ونقدّم الشاشة اللي توصل{' '}
                {MON_RULES.mixedHzFloor} لو كانت ضمن النطاق.
              </li>
            </ul>

            <h3 className={h3}>حدّة الصورة</h3>
            <p>
              نفس الدقّة تطلع أحدّ على شاشة أصغر. نحسب كثافة البكسل (كم بكسل في كل بوصة)، ولو كانت تحت {MON_RULES.softPpi} ننبّهك، مثل
              27 بوصة بدقّة 1080p ({soft27}). ولو فيه شاشة أحدّ في نفس النطاق نقدّمها في الاقتراح.
            </p>
            <table className="w-full text-[15px] border-collapse mt-3">
              <thead>
                <tr className="text-right text-slate-500 dark:text-slate-400 text-[13px]">
                  <th className="font-bold pb-2 border-b border-gray-100 dark:border-slate-800">الدقّة</th>
                  <th className="font-bold pb-2 border-b border-gray-100 dark:border-slate-800">المقاس الأنسب</th>
                  <th className="font-bold pb-2 border-b border-gray-100 dark:border-slate-800">مثال: بكسل لكل بوصة</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_ROWS.map(([r, px, inch]) => (
                  <tr key={r}>
                    <td className="py-1.5 border-b border-gray-50 dark:border-slate-800/60 font-black" dir="ltr" style={{ textAlign: 'right' }}>{r}</td>
                    <td className="py-1.5 border-b border-gray-50 dark:border-slate-800/60">{SIZE_FOR[r]} بوصة</td>
                    <td className="py-1.5 border-b border-gray-50 dark:border-slate-800/60">{inch} بوصة: <b className="font-black">{Math.round(ppiOf({ resolution: px, sizeInch: inch }) ?? 0)}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className={h3}>«الأنسب» يعني إيش؟</h3>
            <p>
              الأرخص المتوفّر من الشاشات اللي تناسب الحساب (غير OLED)، وجنبه خيار OLED لصورة أحلى، وبديل بدقّة أعلى أو أرخص. وما
              نرتّب الشاشات بالجودة لأنّنا ما نملك قياساً لها؛ نعرض المواصفات اللي تفرّق بينها: نوع اللوحة، والسطوع، وشهادة HDR، وزمن
              الاستجابة مع طريقة قياسه (GtG أو MPRT)، والطريقتين ما تنقارن ببعض.
            </p>
          </section>

          <section>
            <h2 className={`font-black ${strong} mb-1`}>نفس الشريحة بأسماء مختلفة</h2>
            <p>
              بعض المعالجات لها نسخ بنفس الشريحة: بحرف F (بدون رسوميّات مدمجة)، أو KF، أو بدون X. إذا ما لقينا قياساً للنسخة
              نفسها، نعطيها قياس نظيرتها ونكتب ذلك صراحةً في بطاقتها، مثل «مقيس على Ryzen 5 9600X، نفس الشريحة».
            </p>
          </section>

          <section>
            <h2 className={`font-black ${strong} mb-1`}>اللي ما له قياس</h2>
            <p>
              قطعة ما لقينا لها قياساً منشوراً ولا نظيراً مقيساً، نكتب لها «غير مقيس»، وما نعطيها تقييماً بالتخمين. نفضّل نقول
              «ما ندري» على رقم ما نقدر نثبته.
            </p>
          </section>

          <section>
            <h2 className={`font-black ${strong} mb-1`}>وين نستخدم التقييم؟</h2>
            <ul className="list-disc pr-6 space-y-1">
              <li>
                في <Link href="/builder" className="underline">الباني</Link>: نقارن تقييم المعالج للألعاب بتقييم الكرت. إذا كان الكرت أعلى
                بدرجتين أو أكثر، ننبّهك إنّ المعالج ممكن يحدّ من الكرت في بعض الألعاب، خصوصاً على 1080p و1440p.
              </li>
              <li>
                في «ما تدري وش تبي؟»: تجميعات الألعاب تُبنى بتقييم الألعاب، وتجميعات المونتاج بتقييم المونتاج.
              </li>
              <li>
                في «شاشة تلائم كرتك» (الباني وصفحة الشاشات) وصفّ «تناسب كرتك؟» في مقارنة الشاشات: إطارات الكرت هي اللي تحدّد الدقّة
                والهرتز المناسبة.
              </li>
            </ul>
          </section>

          <section>
            <h2 className={`font-black ${strong} mb-1`}>حدود التقييم</h2>
            <p>
              التقييم متوسّط على عدّة ألعاب واختبارات، والأداء الفعلي يختلف حسب اللعبة والدقّة والإعدادات وباقي قطع الجهاز. استخدمه
              عشان تقارن القطع ببعض وتعرف مكان كل وحدة، مو كوعد برقم محدّد في لعبة معيّنة.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
