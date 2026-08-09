'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * ============ الشريط المنساب — الحركة والسحب ============
 *
 * البطاقات كلّها مرسومة من السيرفر وتُمرَّر children؛ ما يهبط للمتصفّح هو
 * هذا الملف وحده.
 *
 * ---- لماذا الحركة هنا لا في CSS (تصحيح معماري) ----
 * كانت الحركة @keyframes في globals.css والسحب هنا، فصار السلوك موزّعاً
 * على مصدرين وعطلُ أحدهما يشلّ الآخر:
 *   • وصل الملف قديماً مرّةً (حفظ Turbopack المؤقّت) فاختفت الحركة، فصارت
 *     getAnimations() فارغة والسحب يخرج مبكراً بلا أثر.
 *   • واختفت معها قاعدة :hover التي توقف الشريط، فظلّ يزحف تحت المؤشّر —
 *     فيقع mousedown على بطاقة وmouseup على أخرى، والمتصفّح لا يُطلق click
 *     حين يختلف الهدفان. فلا سحب ولا فتح.
 * وكان الإيقاف عبر animation-play-state يتنازع مع pause()/play() من WAAPI.
 *
 * الآن مصدر واحد: الحركة تُنشأ بـWAAPI، والإيقاف والسحب يخاطبان الكائن
 * نفسه. ملف الأنماط لم يبقَ له إلا المظهر (التلاشي والمؤشّر). ولو تعطّل
 * جافاسكربت كلّه، يبقى الشريط صفّاً ساكناً مقروءاً وروابطه تعمل.
 */
export default function MarqueeRail({
  durationSeconds,
  children,
}: {
  durationSeconds: number;
  children: ReactNode;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    /* احترام تفضيل تقليل الحركة: لا حركة ولا سحب، ويتولّى المتصفّح
       التمرير الأفقي (globals.css تفتح overflow-x وتعيد touch-action). */
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let anim: Animation | null = null;
    if (!reduced) {
      /* النسبة المئوية محسوبة على عرض العنصر نفسه: 50% من المسار = طبعة
         واحدة بالضبط. فحين تنتهي الدورة تكون الطبعة الثانية في محلّ الأولى
         تماماً — وهذا سرّ الالتفاف بلا قفزة. وهي تتكيّف تلقائياً لو تغيّر
         عرض المسار بعد تحميل الصور. */
      anim = track.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(50%)' }],
        { duration: durationSeconds * 1000, iterations: Infinity, easing: 'linear' },
      );
    }

    let startX = 0;
    let startTime = 0;
    let dragging = false;
    let travelled = 0;

    /* :hover حالةٌ في المتصفّح لا قاعدةٌ في ملف الأنماط، فقراءتها هنا
       تعمل حتى لو ضاع الملف — وهو ما جعل الإيقاف يفشل سابقاً. */
    const pointerIsOver = () => viewport.matches(':hover');

    const pause = () => anim?.pause();
    const resume = () => {
      if (!anim || dragging || pointerIsOver()) return;
      anim.play();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return; // الأيمن والأوسط لهما وظائفهما
      if (!anim) return;

      dragging = true;
      travelled = 0;
      startX = e.clientX;
      startTime = Number(anim.currentTime ?? 0);
      anim.pause();
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || !anim) return;

      const laneWidth = track.scrollWidth / 2; // طبعة واحدة = مدى دورة كاملة
      const duration = durationSeconds * 1000;
      if (!laneWidth) return;

      const dx = e.clientX - startX;
      travelled = Math.max(travelled, Math.abs(dx));

      /* سحبُ Δ بكسل ⇔ تقديم الساعة (Δ / L) × D — فالسحب والانسياب في نظام
         إحداثيات واحد، والإفلات لا يحتاج مزامنة. والالتفاف بالباقي يجعل
         السحب بلا حدّ في الاتجاهين. */
      const next = startTime + (dx / laneWidth) * duration;
      anim.currentTime = ((next % duration) + duration) % duration;
    };

    const endDrag = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove('is-dragging');
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch {
        /* قد يكون أُفلت أصلاً (pointercancel) */
      }
      resume(); // يبقى واقفاً إن كان المؤشّر ما زال فوق الشريط
    };

    /* سحبٌ انتهى فوق بطاقة ليس نقرةً عليها. بلا هذا يفتح كلُّ سحبٍ صفحةَ
       القطعة التي تصادف وجودها تحت الإصبع — وهو أسوأ ما يحدث لمن كان
       يحاول إرجاع قطعة فاتته. العتبة ٦ بكسل تسمح باهتزاز اليد. */
    const onClickCapture = (e: MouseEvent) => {
      if (travelled > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
      travelled = 0;
    };

    /* الروابط والصور قابلة للسحب افتراضياً في HTML، وسحبُ المتصفّح الأصلي
       يُلغي سلسلة المؤشّر ويمنع click. السمة draggable={false} موضوعة على
       الرابط والصورة، وهذا احتياطٌ يرثه أي عنصر يُضاف لاحقاً. */
    const blockNativeDrag = (e: DragEvent) => e.preventDefault();

    viewport.addEventListener('pointerenter', pause);
    viewport.addEventListener('pointerleave', resume);
    viewport.addEventListener('focusin', pause);
    viewport.addEventListener('focusout', resume);
    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('click', onClickCapture, true);
    viewport.addEventListener('dragstart', blockNativeDrag);

    return () => {
      anim?.cancel();
      viewport.removeEventListener('pointerenter', pause);
      viewport.removeEventListener('pointerleave', resume);
      viewport.removeEventListener('focusin', pause);
      viewport.removeEventListener('focusout', resume);
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', endDrag);
      viewport.removeEventListener('pointercancel', endDrag);
      viewport.removeEventListener('click', onClickCapture, true);
      viewport.removeEventListener('dragstart', blockNativeDrag);
    };
  }, [durationSeconds]);

  return (
    <div ref={viewportRef} className="marquee-viewport marquee-draggable relative overflow-hidden py-5">
      <div
        ref={trackRef}
        className="marquee-track"
        /* التخطيط مضمّن لا صفّي: ملفُ أنماطٍ ناقص يوقف الحركة ولا يكسر
           الشكل — انظر التعليق في globals.css */
        style={{ display: 'flex', width: 'max-content' }}
      >
        {children}
      </div>
    </div>
  );
}
