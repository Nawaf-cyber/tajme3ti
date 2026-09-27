'use client';

/* ============ «↑ القائمة» ============
 *
 * الشريط الجانبيّ صار في القسم العلويّ وحده (المحتوى الطويل يمتدّ تحته)،
 * فلم يعد يلحقك وأنت في أسفل الجدول. هذا الزرّ يعيدك إليه.
 *
 * ولا يظهر إلّا حين يخرج الشريط من الشاشة — زرٌّ عائمٌ فوق شريطٍ ظاهر
 * ضجيجٌ لا فائدة منه.
 */

import { useEffect, useState } from 'react';

export default function BackToMenuButton({ targetId }: { targetId: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHidden(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [targetId]);

  return (
    <button
      type="button"
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      aria-label="العودة إلى القائمة"
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-black text-white bg-slate-900/90 dark:bg-cyan-600/90 backdrop-blur shadow-lg shadow-black/20 hover:bg-slate-800 dark:hover:bg-cyan-500 transition-all duration-300 ${
        hidden ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <span aria-hidden>↑</span> القائمة
    </button>
  );
}
