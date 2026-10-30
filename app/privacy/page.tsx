import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  description: 'سياسة الخصوصية الخاصة بمنصة تجميعتي: كيف نجمع بياناتك ونستخدمها ونحميها، بما في ذلك استخدام ملفات تعريف الارتباط وإعلانات Google AdSense وروابط التسويق بالعمولة.',
};

export default function PrivacyPage() {
  const lastUpdated = '15 أكتوبر 2026';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="relative bg-white/80 dark:bg-[#0F172A]/75 backdrop-blur-sm rounded-sm shadow-sm border-x border-b border-t-2 border-slate-200 dark:border-slate-800 border-t-cyan-500/70 p-8 md:p-12">

        <h1 className="flex items-center gap-3 text-3xl md:text-4xl font-black tracking-tight mb-3 text-slate-900 dark:text-white"><span aria-hidden="true" className="h-9 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_10px] shadow-cyan-500/40"></span>
          سياسة الخصوصية
        </h1>

        <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
          آخر تحديث: {lastUpdated}
        </p>

        <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">

          <p>
            نحن في <strong className="text-cyan-700 dark:text-cyan-400">تجميعتي</strong> نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضّح هذه السياسة كيف نجمع المعلومات ونستخدمها ونحميها عند استخدامك لمنصتنا. باستخدامك للموقع فإنك توافق على الممارسات الموضّحة في هذه الصفحة.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">١. المعلومات التي نجمعها</h2>
            <p>
              نجمع نوعين من المعلومات. الأول هو المعلومات التي تقدّمها بنفسك طواعية: اسمك وبريدك الإلكتروني عند إنشاء حساب (مباشرةً أو عبر تسجيل الدخول بحساب Google)، والتجميعات التي تحفظها، والقطع التي تطلب متابعة سعرها لنراسلك عند انخفاضه، والمحتوى الذي ترسله عبر نموذج الاقتراحات أو طلب إضافة قطعة. والثاني هو المعلومات التي تُجمع تلقائياً أثناء تصفّحك، مثل نوع المتصفح، ونظام التشغيل، والصفحات التي تزورها، وعنوان الـ IP، وذلك لأغراض تحليلية وتحسين تجربة الاستخدام.
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
              نستخدم خدمة Google AdSense لعرض الإعلانات على موقعنا للمساهمة في تغطية تكاليف التشغيل والاستضافة. تستخدم Google، كطرف ثالث، ملفات تعريف ارتباط لعرض إعلانات مبنية على زياراتك السابقة لموقعنا أو لمواقع أخرى، ومنها ملف تعريف الارتباط DoubleClick الذي يتيح لـ Google وشركائها عرض الإعلانات بناءً على زياراتك لهذا الموقع ولمواقع أخرى على الإنترنت. يمكنك إلغاء الاشتراك في الإعلانات المخصّصة من خلال زيارة صفحة
              {' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-700 dark:text-cyan-400 font-bold underline">
                إعدادات إعلانات Google
              </a>
              ، والاطّلاع على طريقة استخدام Google للبيانات في
              {' '}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-700 dark:text-cyan-400 font-bold underline">
                سياسات Google للإعلانات
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">٥. روابط التسويق بالعمولة (Affiliate)</h2>
            <p>
              يحتوي موقعنا على روابط تابعة لمتاجر خارجية موثوقة. عند إتمامك لعملية شراء عبر أحد هذه الروابط، قد نحصل على عمولة بسيطة دون أي زيادة في السعر عليك. هذه العمولات تساعدنا على الاستمرار في تقديم خدمة مجانية، ولا تؤثّر على ترتيب القطع أو المتاجر: الترتيب بالسعر والتوافق وحدهما، ولا ترتيب مدفوع.
              {' '}
              <strong>بصفتنا مشاركين في برنامج Amazon Associates (شركاء أمازون)، نحصل على عمولة من المشتريات المؤهّلة.</strong>
              {' '}
              نحن لسنا مسؤولين عن سياسات الخصوصية الخاصة بتلك المتاجر، وننصحك بمراجعتها.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">٦. خدمات الطرف الثالث</h2>
            <p>
              نستعين بخدمات خارجية موثوقة لتشغيل المنصة: Vercel للاستضافة وتحليل الزيارات الإجماليّ، وNeon لقاعدة البيانات، وGoogle لتسجيل الدخول وعرض الإعلانات. تحصل هذه الخدمات على البيانات اللازمة فقط لأداء مهامها، وهي ملتزمة بحماية معلوماتك وعدم استخدامها لأي غرض آخر.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">٧. حقوقك</h2>
            <p>
              لك الحق في الوصول إلى بياناتك الشخصية التي نحتفظ بها، وطلب تصحيحها أو حذفها. كما يمكنك حذف حسابك في أي وقت. للتواصل بشأن أي من هذه الحقوق، راسلنا على
              {' '}
              <a href="mailto:Tajme3ti02@gmail.com" className="text-cyan-700 dark:text-cyan-400 font-bold underline" dir="ltr">Tajme3ti02@gmail.com</a>
              {' '}أو عبر صفحة{' '}
              <a href="/contact" className="text-cyan-700 dark:text-cyan-400 font-bold underline">اتصل بنا</a>.
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

          <div className="bg-blue-50 dark:bg-slate-800/50 p-6 rounded-sm border border-blue-100 dark:border-slate-700 mt-8">
            <h3 className="font-bold text-xl text-blue-800 dark:text-blue-400 mb-2">لديك سؤال؟</h3>
            <p className="text-sm">
              إذا كان لديك أي استفسار حول سياسة الخصوصية أو طريقة تعاملنا مع بياناتك، يسعدنا تواصلك معنا عبر صفحة{' '}
              <a href="/contact" className="text-cyan-700 dark:text-cyan-400 font-bold underline">اتصل بنا</a>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
