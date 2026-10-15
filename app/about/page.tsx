import Link from 'next/link';
import SuggestButton from './SuggestButton';

/* ============ عن المنصة ============
 * مكوّن خادم (كانت الصفحة كلّها 'use client' لأجل زرّ الاقتراح وحده — صار في
 * SuggestButton). والبيانات الوصفيّة في layout.tsx المجاور.
 *
 * مراجعة أدسنس 2026-10-15: المراجع البشريّ يبحث هنا عن: من خلف المنصة، وكيف تُجمع
 * الأسعار، وكيف تتموّل، وما لا تفعله. وحُذفت «نحن في مرحلة التطوير المستمر» —
 * عبارات «قيد التطوير» تُقرأ عندهم «موقعٌ تحت الإنشاء» (انظر تعليق WorkInProgress
 * في components/PCBuilderClient.tsx).
 */

const STORES = 'أمازون، ومايكرولس، وكازاسوق، ونون، وإنفيني آرك، وجرير، وريد زون';

export default function AboutPage() {
  const strong = 'text-blue-600 dark:text-blue-400';
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-gray-100 dark:border-slate-800 p-8 md:p-12">

        <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
          عن تجميعتي
        </h1>
        <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
          منصة عربية مستقلّة لفحص توافق قطع الحاسب ومقارنة أسعارها في المتاجر السعودية.
        </p>

        <div className="space-y-7 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
          <section>
            <h2 className={`font-black ${strong} mb-1`}>ما هي تجميعتي؟</h2>
            <p>
              أداةٌ تساعدك على اختيار قطع جهازك واحدةً واحدة، وتفحص توافقها مع بعضها لحظةَ الاختيار، وتعرض لكلّ قطعة أسعار
              المتاجر المتوفّرة الآن، ثمّ توصلك إلى صفحة الشراء في المتجر نفسه. ومعها أدلّة شراءٍ مكتوبة بالعربية، ومقارنةٌ بين
              القطع والتجميعات بأرقام أداءٍ مقيسة.
            </p>
          </section>

          <section>
            <h2 className={`font-black ${strong} mb-1`}>كيف نجمع الأسعار؟</h2>
            <p>
              نقرأ أسعار القطع من صفحاتها في المتاجر ({STORES}) تلقائياً عدّة مرّاتٍ يومياً، ونعرض أرخص عرضٍ متوفّرٍ فعلاً.
              العرض النافد لا يُحسب أقلَّ سعر، والمتجر الذي يُقرأ سعره يدوياً لا يُحسب سعره إن مضى عليه أكثر من ثلاثة أيّام. وكلّ صفحة قطعة
              تعرض تاريخ سعرها في كلّ متجر، فترى إن كان السعر الحاليّ مرتفعاً أو في أدنى مستوياته.
            </p>
          </section>

          <section>
            <h2 className={`font-black ${strong} mb-1`}>كيف نفحص التوافق؟</h2>
            <p>
              بقواعد مكتوبة من مواصفات الشركات المصنّعة لا بالتقدير: مقبس المعالج واللوحة، ونوع الذاكرة وسرعتها، وطول كرت
              الشاشة مقابل مساحة الكيس، ومقاس اللوحة والمزوّد، وقدرة المزوّد مقابل الاستهلاك، ودعم المبرّد للمقبس. وما يمنع
              التركيب يُقال مانعاً، وما يعمل بنقصٍ يُقال ملاحظة.
            </p>
          </section>

          <section>
            <h2 className={`font-black ${strong} mb-1`}>كيف تتموّل المنصة؟</h2>
            <p>
              من مصدرين: روابط الشراء التابعة (Affiliate) — قد نحصل على عمولةٍ بسيطة حين تشتري عبرها، دون أيّ زيادةٍ في
              السعر عليك — وبصفتنا مشاركين في برنامج Amazon Associates نحصل على عمولة من المشتريات المؤهّلة. والمصدر الثاني
              إعلانات Google AdSense. الاستخدام مجانيّ بالكامل.
            </p>
          </section>

          <section>
            <h2 className={`font-black ${strong} mb-1`}>ما لا نفعله</h2>
            <p>
              لا نبيع القطع ولا نستلم طلبات. ولا ترتيب مدفوع: لا يدفع متجرٌ ليظهر أوّلاً، والترتيب بالسعر والتوافق وحدهما —
              والعمولة لا تغيّر ما نوصي به. ولا نبيع بياناتك (التفاصيل في{' '}
              <Link href="/privacy" className="underline font-bold">سياسة الخصوصية</Link>).
            </p>
          </section>

          <section>
            <h2 className={`font-black ${strong} mb-1`}>من أنا</h2>
            <p>
              أنا نواف، أجمّع أجهزة الحاسب وأتابع سوق القطع. بنيت تجميعتي لأني رأيت المستخدم العربي يجمّع جهازه بلا أداةٍ عربية
              تحميه من أخطاء التوافق والتوازن. أكتب كل دليلٍ في الموقع بنفسي، من واقع تجربة.
            </p>
          </section>

          <div className="bg-blue-50 dark:bg-slate-800/50 p-6 rounded-sm border border-blue-100 dark:border-slate-700 mt-8">
            <h2 className="font-bold text-xl text-blue-800 dark:text-blue-400 mb-2">تواصل معنا</h2>
            <p className="text-sm mb-4">
              ملاحظاتكم هي ما يحسّن المنصة: قطعةٌ ناقصة، سعرٌ خاطئ، أو فكرةٌ لميزة. راسلنا على{' '}
              <a href="mailto:Tajme3ti02@gmail.com" className="underline font-bold" dir="ltr">Tajme3ti02@gmail.com</a>{' '}
              أو أرسل اقتراحك من هنا.
            </p>
            <SuggestButton />
          </div>
        </div>
      </div>
    </div>
  );
}
