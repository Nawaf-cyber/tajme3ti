/* ============ «بدون DLSS/FSR» — تنبيهٌ واحد لكلّ رقم إطارات في الموقع ============
 *
 * أرقامنا من جدول Tom's Hardware على الدقّة الأصليّة بلا DLSS/FSR، ولا نقدّر رقماً معها (رقمٌ نقدّره
 * يخلط المقيس بالمخمَّن فتسقط ثقة الأرقام كلّها). فالتنبيه يوضّح شرط القياس بدل تغيير الرقم.
 * كان في ٩ أماكن بخطٍّ رماديّ صغير وأربع صيغ؛ وصار شارةً واحدة بصيغةٍ واحدة (نوّاف 2026-11-18، الخيار «أ»).
 *
 *   <NoUpscaleBadge />  مرّةً لكلّ بطاقة أو جدول، جنب العنوان — لا تحت كلّ رقم
 *   <FpsSource />       سطر المصدر: قياس Tom's Hardware · لو شغّلت DLSS أو FSR تطلع إطارات أكثر · كيف نقيّم؟
 *
 * ⚠️ الشارة رابط <a>: لا تضعها داخل <button> أو <a> آخر.
 * بلا حالة ولا 'use client': تُرسم في صفحات الخادم والعميل.
 */
import { GPU_PERF_SOURCE } from '../lib/gpu-perf';

export function NoUpscaleBadge({ className = '', href = '/how-we-rate' }: { className?: string; href?: string }) {
  return (
    <a
      href={href}
      title="الأرقام على الدقّة الأصلية بدون DLSS أو FSR — كيف نقيّم؟"
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm border border-cyan-600/30 dark:border-cyan-400/30 bg-cyan-500/[0.07] text-[11.5px] font-black text-cyan-800 dark:text-cyan-300 whitespace-nowrap align-middle hover:border-cyan-500 transition-colors ${className}`}
    >
      <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12h8M12 8v8" strokeLinecap="round" /></svg>
      بدون DLSS/FSR
    </a>
  );
}

/** يُضمَّن داخل فقرة؛ how: رابط «كيف نقيّم؟» (null لإخفائه حين يكون في السطر رابطٌ غيره) */
export function FpsSource({ how = '/how-we-rate' }: { how?: string | null }) {
  return (
    <>
      قياس{' '}
      <bdi><a href={GPU_PERF_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline whitespace-nowrap hover:text-cyan-700 dark:hover:text-cyan-400">{GPU_PERF_SOURCE.name}</a></bdi>
      {' · '}لو شغّلت DLSS أو FSR تطلع إطارات أكثر
      {how && <>{' · '}<a href={how} className="underline font-bold text-cyan-700 dark:text-cyan-400">كيف نقيّم؟</a></>}
    </>
  );
}
