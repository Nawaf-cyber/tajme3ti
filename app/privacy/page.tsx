import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | تجميعتي',
  description: 'سياسة الخصوصية الخاصة بمنصة تجميعتي: كيف نجمع بياناتك ونستخدمها ونحميها، بما في ذلك استخدام ملفات تعريف الارتباط وإعلانات Google AdSense وروابط التسويق بالعمولة.',
};

export default function PrivacyPage() {
  const lastUpdated = '1 يوليو 2026';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 md:p-12">

        <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
          سياسة الخصوصية
        </h1>

        <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
          آخر تحديث: {lastUpdated}
        </p>

        <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">

          <p>
            نحن في <strong className="text-blue-600 dark:text-blue-400">تجميعتي</strong> نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضّح هذه السياسة كيف نجمع المعلومات ونستخدمها ونحميها عند استخدامك لمنصتنا. باستخدامك للموقع فإنك توافق على الممارسات الموضّحة في هذه الصفحة.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">١. المعلومات التي نجمعها</h2>
            <p>
              نجمع نوعين من المعلومات. الأول هو المعلومات التي تقدّمها بنفسك طواعية، مثل بريدك الإلكتروني عند إنشاء حساب أو حفظ تجميعة، أو المحتوى الذي ترسله عبر نموذج الاقتراحات. والثاني هو المعلومات التي تُجمع تلقائياً أثناء تصفّحك، مثل نوع المتصفح، ونظام التشغيل، والصفحات التي تزورها، وعنوان الـ IP، وذلك لأغراض تحليلية وتحسين تجربة الاستخدام.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">٢. كيف نستخدم معلوماتك</h2>
            <p>
              نستخدم المعلومات التي نجمعها لتشغيل المنصة وتحسينها، وحفظ تجميعاتك المخصّصة وربطها بحسابك، والرد على استفساراتك واقتراحاتك، وتحليل سلوك الزوّار بشكل إجمالي لتطوير الميزات والمحتوى. نحن لا نبيع بياناتك الشخصية لأي طرف ثالث.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">٣. ملفات تعريف الارتباط (Cookies)</h2>
            <p>
              يستخدم موقعنا ملفات تعريف الارتباط لتحسين تجربتك، مثل تذكّر تفضيلاتك (كالوضع الفاتح أو الداكن) والحفاظ على جلسة تسجيل دخولك. كما تستخدم الأطراف الثالثة مثل Google ملفات تعريف الارتباط لعرض الإعلانات. يمكنك ضبط متصفّحك لرفض ملفات تعريف الارتباط، لكن ذلك قد يؤثّر على بعض وظائف الموقع.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">٤. إعلانات Google AdSense</h2>
            <p>
              نستخدم خدمة Google AdSense لعرض الإعلانات على موقعنا للمساهمة في تغطية تكاليف التشغيل والاستضافة. تستخدم Google، كطرف ثالث، ملفات تعريف ارتباط لعرض إعلانات مبنية على زياراتك السابقة لموقعنا أو لمواقع أخرى. يمكنك إلغاء الاشتراك في الإعلانات المخصّصة من خلال زيارة صفحة
              {' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-bold underline">
                إعدادات إعلانات Google
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">٥. روابط التسويق بالعمولة (Affiliate)</h2>
            <p>
              يحتوي موقعنا على روابط تابعة لمتاجر خارجية موثوقة. عند إتمامك لعملية شراء عبر أحد هذه الروابط، قد نحصل على عمولة بسيطة دون أي زيادة في السعر عليك. هذه العمولات تساعدنا على الاستمرار في تقديم خدمة مجانية. نحن لسنا مسؤولين عن سياسات الخصوصية الخاصة بتلك المتاجر، وننصحك بمراجعتها.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">٦. خدمات الطرف الثالث</h2>
            <p>
              قد نستعين بخدمات خارجية موثوقة لتشغيل المنصة، مثل مزوّدي الاستضافة وقواعد البيانات وأدوات التحليل. تحصل هذه الخدمات على البيانات اللازمة فقط لأداء مهامها، وهي ملتزمة بحماية معلوماتك وعدم استخدامها لأي غرض آخر.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">٧. حقوقك</h2>
            <p>
              لك الحق في الوصول إلى بياناتك الشخصية التي نحتفظ بها، وطلب تصحيحها أو حذفها. كما يمكنك حذف حسابك في أي وقت. للتواصل بشأن أي من هذه الحقوق، يمكنك مراسلتنا عبر صفحة .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">٨. خصوصية الأطفال</h2>
            <p>
              منصتنا غير موجّهة للأطفال دون سن الثالثة عشرة، ونحن لا نجمع عن قصد أي معلومات شخصية منهم. إذا اكتشفنا أننا جمعنا معلومات من طفل دون هذا السن، فسنعمل على حذفها فوراً.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">٩. تعديلات على هذه السياسة</h2>
            <p>
              قد نُحدّث سياسة الخصوصية من وقت لآخر لتعكس التغييرات في ممارساتنا أو المتطلبات القانونية. سننشر أي تعديلات على هذه الصفحة مع تحديث تاريخ "آخر تحديث" في الأعلى. ننصحك بمراجعة هذه الصفحة دورياً.
            </p>
          </section>

          <div className="bg-blue-50 dark:bg-slate-800/50 p-6 rounded-xl border border-blue-100 dark:border-slate-700 mt-8">
            <h3 className="font-bold text-xl text-blue-800 dark:text-blue-400 mb-2">لديك سؤال؟</h3>
            <p className="text-sm">
              إذا كان لديك أي استفسار حول سياسة الخصوصية أو طريقة تعاملنا مع بياناتك، يسعدنا تواصلك معنا عبر صفحة{' '}
              <a href="/contact" className="text-blue-600 dark:text-blue-400 font-bold underline">اتصل بنا</a>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
