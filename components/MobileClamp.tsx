'use client';
/* ============ قسمٌ مطويّ على الجوال وحده ============
 *
 * المواصفات والوصف في صفحة القطعة تأخذ على الجوال ستّ شاشاتٍ فأكثر، فيُطوى كلٌّ
 * منهما على ارتفاعٍ ثابت مع زرّ «كل المواصفات ↓». ⚠️ المحتوى كلّه في الصفحة من
 * الخادم (يُقصّ بـoverflow لا يُحذف) — الزاحف وأدسنس يقرآنه كاملاً، وكان إخفاء
 * المحتوى عن الزاحف سبب رفض أدسنس 2026-10. وعلى الكمبيوتر لا طيّ.
 * ولا زرّ ولا تظليل إن كان المحتوى أقصر من الحدّ (يُقاس بعد التركيب).
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export default function MobileClamp({ children, label, height = 380 }: { children: ReactNode; label: string; height?: number }) {
  const [open, setOpen] = useState(false);
  const [tall, setTall] = useState(true); // قبل القياس: مطويّ (كما في HTML الخادم)
  const inner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const check = () => setTall(el.scrollHeight > height + 60);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [height]);
  const clamped = !open && tall;

  return (
    <div className="relative">
      <div
        ref={inner}
        className={clamped ? 'max-lg:overflow-hidden max-lg:max-h-[var(--clamp)]' : ''}
        style={{ '--clamp': `${height}px` } as React.CSSProperties}
      >
        {children}
      </div>
      {clamped && (
        <div className="lg:hidden absolute inset-x-0 bottom-0 h-24 flex items-end justify-center pb-1 bg-gradient-to-t from-[#FCFBF8] via-[#FCFBF8]/90 to-transparent dark:from-[#0E1628] dark:via-[#0E1628]/90">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="min-h-[44px] px-5 rounded-full border-2 border-cyan-600/60 bg-white dark:bg-slate-900 text-[13px] font-black text-cyan-800 dark:text-cyan-300 shadow-sm"
          >
            {label}
          </button>
        </div>
      )}
    </div>
  );
}
