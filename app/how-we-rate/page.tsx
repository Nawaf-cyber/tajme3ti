import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd, { breadcrumbs } from '../../components/JsonLd';
import { cpuPerf, CPU_PERF_SOURCE, CPU_GAMING_TOP } from '../../lib/cpu-perf';
import { gpuPerf, GPU_PERF_SOURCE } from '../../lib/gpu-perf';
import { CPU_GAMING_LEVELS, CPU_MULTI_LEVELS, cpuTierFromGaming, cpuTierFromMulti } from '../../lib/perf-tier';
import { GPU_FPS_LEVELS, gpuTierFromFps, levelWord } from '../../lib/perf-rating';

/* ============ كيف نقيّم أداء القطع؟ ============
 * يشرح بطاقة «تقييم الأداء» (components/PartRating): المصدر، والحدود، ولماذا للمعالج تقييمان،
 * وما لا قياس له. والحدود والأمثلة **تُقرأ من الكود نفسه** (lib/perf-tier · lib/perf-rating ·
 * جداول القياس) — جدولٌ مكتوبٌ باليد هنا كان سيفترق عن الحساب عند أوّل تعديل.
 */

export const metadata: Metadata = {
  title: 'كيف نقيّم أداء القطع',
  description: 'تقييم أداء المعالجات وكروت الشاشة في تجميعتي محسوبٌ من اختبارات منشورة لا بالتقدير: المصدر، وحدود كلّ درجة، ولماذا للمعالج تقييمان للألعاب وللمونتاج.',
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

export default function HowWeRatePage() {
  const strong = 'text-blue-600 dark:text-blue-400';
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
              أكثر شي.
              {gpuEx && <> مثلاً RTX 5080 يعطي نحو {Math.round(gpuEx.f1440)} إطاراً، فتقييمه «{levelWord(gpuTierFromFps(gpuEx.f1440))}».</>}
            </p>
            <LevelTable title="متوسّط الإطارات في 1440p" rows={ranges(GPU_FPS_LEVELS, '')} />
            <p className="text-[15px] mt-2 text-slate-500 dark:text-slate-400">
              وفي صفحة كل كرت تلقى إطاراته في 1080p و1440p و4K.
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
