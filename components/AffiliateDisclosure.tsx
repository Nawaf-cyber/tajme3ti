/* ============ إفصاح العمولة عند أزرار المتاجر ============
 *
 * ردّ دعم شركاء أمازون (2026-11-25): الإفصاح يجب أن يكون «واضحاً وبارزاً» في كلّ مكانٍ فيه
 * رابط أمازون — صفحة القطعة والباني والمقارنة والتجميعة — لا في الفوتر وحده، ولا بخطٍّ
 * صغيرٍ باهت، ولا داخل قسمٍ مطويّ. فنصٌّ واحدٌ هنا بدل نسخٍ تتباعد، بحجمٍ وتباينٍ مقروءين.
 */
export default function AffiliateDisclosure({ className = '' }: { className?: string }) {
  return (
    <p
      className={`flex items-start gap-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-[13px] font-semibold leading-relaxed text-slate-700 dark:text-slate-200 ${className}`}
    >
      <svg className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        <strong className="font-black">إفصاح:</strong> بعض روابط المتاجر هنا روابط عمولة. وبصفتنا مشاركين في برنامج
        شركاء أمازون نكسب من المشتريات المؤهّلة، وما يزيد عليك السعر.
      </span>
    </p>
  );
}
