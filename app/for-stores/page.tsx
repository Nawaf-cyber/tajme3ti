import type { Metadata } from 'next';
import StoreApplicationForm from './StoreApplicationForm';

export const metadata: Metadata = {
  title: 'انضم كمتجر',
  description: 'متجر قطع حاسب يشحن داخل السعودية؟ اعرض أسعارك بجانب المتاجر الأخرى في تجميعتي — في صفحة كل قطعة وفي باني التجميعة.',
  alternates: { canonical: '/for-stores' },
};

/* ============ صفحة «انضم كمتجر» ============
   الشروط منشورةٌ هنا قبل النموذج عمداً: تحمي مصداقيّة المقارنة، وتعطي
   سبباً واضحاً لأيّ رفض — ويقرؤها المتجر قبل أن يتعب في التعبئة. */

const BENEFITS = [
  { title: 'أمام من يشتري فعلاً', body: 'زوّارنا يجمّعون أجهزتهم الآن — يرون سعرك بجانب المتاجر الأخرى في صفحة كل قطعة وفي باني التجميعة.' },
  { title: 'الزائر يصل لمنتجك مباشرة', body: 'زرّ الشراء ينقله إلى صفحة المنتج في متجرك، لا إلى صفحةٍ وسيطة.' },
  { title: 'تحديثٌ تلقائيّ', body: 'نقرأ الأسعار والتوفّر من متجرك عدّة مرّاتٍ يومياً — لا ترسل لنا شيئاً بعد الإضافة.' },
];

const CRITERIA = [
  'يبيع ويشحن داخل السعودية.',
  'قطع حاسب جديدة، بضمانٍ واضح مكتوب.',
  'السعر والتوفّر ظاهران في صفحة المنتج بلا تسجيل دخول.',
  'متجرٌ موثوق: سجلٌّ تجاريّ أو توثيقٌ من المنصّة أو من معروف.',
];

const STEPS = [
  'ترسل الطلب من النموذج أدناه.',
  'نراجع المتجر ونختبر قراءة أسعاره.',
  'نربط منتجاتك بالقطع عندنا ونبلغك على البريد.',
];

export default function ForStoresPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-gray-100 dark:border-slate-800 p-6 sm:p-8 md:p-12">
        <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
          انضم كمتجر
        </h1>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-8 border-b border-gray-100 dark:border-slate-800 pb-4">
          اعرض أسعار متجرك أمام من يجمّع جهازه
        </h2>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-sm p-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">{b.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <section>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">شروط القبول</h3>
            <ul className="space-y-2">
              {CRITERIA.map((c) => (
                <li key={c} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="text-emerald-600 dark:text-emerald-400 font-black shrink-0">✓</span>
                  {c}
                </li>
              ))}
            </ul>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
              الترتيب عندنا بالسعر وحده: الأرخص أولاً دائماً، ولا يُشترى مكانٌ أعلى.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">كيف تتمّ الإضافة</h3>
            <ol className="space-y-2">
              {STEPS.map((s, i) => (
                <li key={s} className="flex gap-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-cyan-600 text-white text-xs font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <StoreApplicationForm />
      </div>
    </div>
  );
}
