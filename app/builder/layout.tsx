import Link from 'next/link';

/* ============ رأس الباني وشرحه — خارج حدّ التحميل ============
 *
 * ⚠️ الصفحة نفسها تجلب الكتالوج كلّه (ثقيلة) فلها loading.tsx، وما داخل ذلك الحدّ
 * يُرسَل مخفيّاً حتى تكشفه الجافاسكربت؛ والباني نفسه لا يرسم شيئاً قبل التحميل.
 * فكان زاحف أدسنس يرى في /builder «جلب الكتالوج...» وحدها (٥١٥ حرفاً).
 * والتخطيط (layout) خارج ذلك الحدّ: العنوان والشرح هنا يصلان في HTML الخادم
 * مكانَهما، وتبقى الأداة التفاعليّة وحدها تُحمَّل في المتصفّح.
 *
 * والشرح يصف ما يفحصه الباني فعلاً (lib/build-check) — لا وعوداً.
 */

const CATS: [string, string][] = [
  ['المعالج', 'يحدّد المقبس ونوع الرام، وهل يجي معه مبرّد ورسوميات مدمجة.'],
  ['اللوحة الأم', 'نشيّك عليها مع المعالج (المقبس وحدّ القدرة) ومع الكيس (المقاس).'],
  ['الذاكرة', 'نوعها (DDR4 ولا DDR5) وحجمها وسرعتها، وهل اللوحة تدعمها.'],
  ['كرت الشاشة', 'هل طوله يدخل الكيس، واستهلاكه نحسبه على المزوّد.'],
  ['التخزين', 'نوع القرص وحجمه وسرعته.'],
  ['مزوّد الطاقة', 'هل قدرته تكفي القطع مع هامش يكبر كل ما كبر الكرت، وهل مقاسه يركب في الكيس.'],
  ['الكيس', 'هل يسع اللوحة والكرت والمزوّد والمبرّد.'],
  ['المبرّد', 'هل يدعم مقبس المعالج ويدخل الكيس — وننبّهك إذا المعالج ما معه مبرّد.'],
];

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="max-w-5xl mx-auto mt-10 px-4 sm:px-0">
        <div className="bg-gradient-to-br from-slate-900 to-[#0B1120] p-8 md:p-10 text-center text-white relative overflow-hidden rounded-sm border border-cyan-500/20">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"></div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">
            منصة تجميع <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">الـ PC</span>
          </h1>
          <p className="text-slate-300 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            اختر قطعك وحدة وحدة، والباني يشيّك على توافقها أول بأول، ويوريك سعر كل قطعة في المتاجر السعودية المتوفّرة الحين.
            وإذا ما تدري من وين تبدأ، جاوب على سؤالين في «ما تدري وش تبي؟» ونبني لك ثلاث تجميعات من القطع المتوفّرة.
          </p>
        </div>
      </header>

      {children}

      {/* ===== ما الذي يفحصه الباني — نصٌّ من الخادم يشرح الأداة ===== */}
      <section className="max-w-5xl mx-auto mb-14 px-4 sm:px-0" aria-labelledby="builder-how">
        <div className="bg-white/70 dark:bg-[#0F172A]/60 border border-slate-200 dark:border-slate-800 rounded-sm p-6 md:p-8">
          <h2 id="builder-how" className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-2">وش يفحص الباني؟</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
            كل قطعة تختارها نقارنها باللي اخترته قبلها. اللي يمنع التركيب (مقبس ما يطابق، لوحة ما تدخل الكيس، مزوّد أصغر من اللي تحتاجه)
            نوقفك عنده، واللي يشتغل بس فيه نقص (رام أسرع من اللوحة، معالج بدون مبرّد) نعطيك عليه ملاحظة. والقطع اللي ما تتوافق نخفيها
            من القائمة، وتقدر تطلّعها عشان تشوف السبب.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
            {CATS.map(([name, what]) => (
              <li key={name} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-black text-slate-900 dark:text-white">{name}: </span>{what}
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-5">
            الأسعار نحدّثها من المتاجر تلقائياً كذا مرة في اليوم، والسعر اللي تشوفه هو أرخص عرض متوفّر.
            ولو تبي شرح أوسع عن كل قطعة، اقرأ <Link href="/guides" className="underline font-bold text-cyan-700 dark:text-cyan-400">أدلّة التجميع</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
