/**
 * ============ عناصر التحميل المشتركة ============
 *
 * مصدر واحد لكل حالات التحميل في الموقع.
 * الهوية: البرق السيان + شريط التحميل — نفس app/loading.tsx.
 *
 * لماذا الهياكل العظمية بدل الدوّارة؟
 * الدوّارة تقول "انتظر" فقط. الهيكل يقول "المحتوى قادم، وهذا شكله" —
 * فيبدو التحميل أسرع (الإدراك) وتقلّ قفزات التخطيط عند الوصول.
 */

/* ---- البرق النابض: شعار التحميل ---- */
export const LoadingBolt = ({ size = 'w-14 h-14' }: { size?: string }) => (
  <div className={`relative ${size}`}>
    <div className="absolute inset-0 bg-cyan-400/30 blur-2xl rounded-full animate-pulse-slow"></div>
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="relative w-full h-full text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] animate-pulse"
    >
      <path d="M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z" />
    </svg>
  </div>
);

/* ---- شريط التحميل المتحرّك ---- */
export const LoadingBar = ({ width = 'w-48' }: { width?: string }) => (
  <div className={`${width} h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden`}>
    <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-loading-bar"></div>
  </div>
);

/**
 * شاشة تحميل كاملة — للصفحات التي لا نعرف شكل محتواها مسبقاً.
 * @param label نص يخبر المستخدم *ماذا* يُحمَّل — لا "LOADING" مجرّدة
 */
export const FullPageLoader = ({ label = 'جارٍ التحميل' }: { label?: string }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 gap-6">
    <LoadingBolt />
    <LoadingBar />
    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wide">
      {label}
    </p>
  </div>
);

/* ---- لبنة هيكل عظمي ---- */
export const Sk = ({ className = '' }: { className?: string }) => (
  <div className={`bg-slate-200/70 dark:bg-slate-800/70 rounded-lg animate-pulse ${className}`} />
);

/* ---- رأس صفحة (عنوان + وصف) ---- */
export const SkPageHeader = () => (
  <div className="mb-10">
    <Sk className="h-10 w-56 mb-4" />
    <Sk className="h-4 w-full max-w-md" />
  </div>
);

/* ---- بطاقة قطعة: تطابق شبكة /components ---- */
export const SkComponentCard = () => (
  <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <Sk className="h-40 w-full rounded-none" />
    <div className="p-4">
      <Sk className="h-2.5 w-14 mb-2.5" />
      <Sk className="h-4 w-full mb-1.5" />
      <Sk className="h-4 w-2/3 mb-4" />
      <div className="flex gap-1.5 mb-4">
        <Sk className="h-5 w-12" />
        <Sk className="h-5 w-14" />
        <Sk className="h-5 w-10" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
        <Sk className="h-7 w-20" />
        <Sk className="h-8 w-24" />
      </div>
    </div>
  </div>
);

/* ---- شبكة بطاقات ---- */
export const SkCardGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkComponentCard key={i} />
    ))}
  </div>
);

/* ---- بطاقة اختيار في صفحة البناء ---- */
export const SkSelectCard = () => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 bg-white dark:bg-[#0F172A]">
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
        <Sk className="w-6 h-6 rounded-lg" />
        <Sk className="h-2.5 w-16" />
      </div>
      <Sk className="h-5 w-16 rounded-lg" />
    </div>
    <div className="flex items-center gap-3">
      <Sk className="w-14 h-14 rounded-xl" />
      <div className="flex-1">
        <Sk className="h-2 w-10 mb-1.5" />
        <Sk className="h-4 w-4/5 mb-2" />
        <Sk className="h-3.5 w-20" />
      </div>
      <Sk className="w-8 h-8 rounded-lg" />
    </div>
  </div>
);

/* ---- بطاقة مقال/خبر ---- */
export const SkArticleCard = () => (
  <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <Sk className="h-56 w-full rounded-none" />
    <div className="p-8">
      <Sk className="h-5 w-24 mb-4 rounded-md" />
      <Sk className="h-6 w-full mb-2" />
      <Sk className="h-6 w-3/4 mb-5" />
      <Sk className="h-3.5 w-full mb-2" />
      <Sk className="h-3.5 w-full mb-2" />
      <Sk className="h-3.5 w-1/2 mb-8" />
      <Sk className="h-12 w-full rounded-xl" />
    </div>
  </div>
);