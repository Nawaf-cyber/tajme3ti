/* ============ علامة الريال بلون النصّ ============
 *
 * كانت `RiyalIcon` منسوخةً في ستّة ملفات بأحجامٍ وألوانٍ مكتوبة في كلّ نسخة.
 * هذه تأخذ لونها من `currentColor` وحجمها من حجم الخطّ (٠٫٨em) فتصلح لأيّ
 * سعرٍ بأيّ حجم: `<span className="text-emerald-500">3,765<RiyalSign /></span>`.
 */
export default function RiyalSign({ className = '' }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="ريال"
      className={`inline-block h-[0.8em] w-[0.72em] shrink-0 bg-current align-[-0.08em] ms-[0.18em] ${className}`}
      style={{
        maskImage: "url('/riyal.svg')",
        WebkitMaskImage: "url('/riyal.svg')",
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}
