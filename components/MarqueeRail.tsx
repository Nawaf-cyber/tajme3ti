'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * ============ غلاف الشريط المنساب — السحب باليد ============
 *
 * لماذا مكوّن عميل صغير لا مكوّن كامل: البطاقات كلّها تبقى مرسومة من
 * السيرفر وتُمرَّر children؛ ما يهبط للمتصفّح هو هذا الملف وحده.
 *
 * ---- الفكرة التي تجعل السحب نظيفاً ----
 * لا نحرّك الشريط بأنفسنا. الحركة CSS من translateX(0) إلى translateX(50%)
 * على مدّة D، أي إزاحةٌ خطّية من صفر إلى عرض طبعة واحدة L. فبدل أن نضيف
 * تحويلاً يدوياً ثم نحتار كيف نوفّق بينه وبين الحركة عند الإفلات، نُحرّك
 * **ساعة الحركة**:
 *
 *     سحبُ Δ بكسل  ⇔  تقديم الساعة (Δ / L) × D
 *
 * فالسحب والانسياب في نظام إحداثيات واحد. الإفلات لا يحتاج مزامنة: تعود
 * الحركة من حيث تركتها بالضبط، بلا قفزة.
 *
 * ---- الإيقاف ----
 * لا نستدعي pause()/play() من جافاسكربت: خاصية animation-play-state في
 * CSS تتنازع معهما فيبقى الشريط ساكناً أو يقفز. نضيف صنفاً فقط، وCSS
 * وحدها تقرّر الإيقاف — للمرور بالفأرة وللسحب معاً.
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

    let anim: Animation | undefined;
    let startX = 0;
    let startTime = 0;
    let dragging = false;
    let travelled = 0;

    const currentAnim = () =>
      track.getAnimations().find((a) => (a as CSSAnimation).animationName === 'marquee-drift') ??
      track.getAnimations()[0];

    const onPointerDown = (e: PointerEvent) => {
      // الزرّ الأيمن ووسط الفأرة لهما وظائفهما؛ لا نخطفهما
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      anim = currentAnim();
      /* بلا حركة (تفضيل «تقليل الحركة») لا شيء نحرّكه — وهناك تمرير
         أصلي مفعّل في CSS، فتركُ الحدث يمرّ أفضل من تعطيله. */
      if (!anim) return;

      dragging = true;
      travelled = 0;
      startX = e.clientX;
      startTime = Number(anim.currentTime ?? 0);
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || !anim) return;

      const laneWidth = track.scrollWidth / 2; // طبعة واحدة = مدى دورة كاملة
      const duration = Number(anim.effect?.getTiming().duration ?? 0);
      if (!laneWidth || !duration) return;

      const dx = e.clientX - startX;
      travelled = Math.max(travelled, Math.abs(dx));

      /* الالتفاف بالباقي: السحب بلا حدّ في الاتجاهين، وعند تجاوز الدورة
         تعود الساعة لبدايتها — وهي اللحظة التي تحلّ فيها الطبعة الثانية
         محلّ الأولى تماماً، فلا يرى الساحب حافّة ولا فراغاً. */
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
        /* المؤشّر قد يكون أُفلت أصلاً (pointercancel) */
      }
    };

    /* سحبٌ انتهى فوق بطاقة ليس نقرةً عليها. بلا هذا يفتح كلُّ سحبٍ صفحةَ
       القطعة التي تصادف وجودها تحت الإصبع — وهو أسوأ ما يمكن أن يحدث
       لمن كان يحاول إرجاع قطعة فاتته. العتبة ٦ بكسل تسمح باهتزاز اليد. */
    const onClickCapture = (e: MouseEvent) => {
      if (travelled > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
      travelled = 0;
    };

    /* ============ إبطال السحب الأصلي ============
     * الروابط والصور قابلة للسحب افتراضياً في HTML. فأوّل تحريك بعد الضغط
     * كان يُطلق سحب-وإفلات المتصفّح، وهو يُلغي سلسلة المؤشّر (pointercancel)
     * ويمنع click — فلا الشريط يتحرّك ولا البطاقة تُفتح.
     *
     * السمة draggable={false} موضوعة على الرابط والصورة، وهذا الحاجز
     * احتياطٌ على مستوى الحاوية: أي عنصر يُضاف لاحقاً (نصّ مُظلَّل، أيقونة
     * SVG) يرثه بلا أن يتذكّره أحد. dragstart هو الحدث الصحيح للمنع —
     * preventDefault على pointerdown كان سيُسقط النقرة معه. */
    const blockNativeDrag = (e: DragEvent) => e.preventDefault();

    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('click', onClickCapture, true);
    viewport.addEventListener('dragstart', blockNativeDrag);

    return () => {
      viewport.removeEventListener('dragstart', blockNativeDrag);
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', endDrag);
      viewport.removeEventListener('pointercancel', endDrag);
      viewport.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  return (
    <div
      ref={viewportRef}
      className="marquee-viewport marquee-draggable relative overflow-hidden py-5"
    >
      <div
        ref={trackRef}
        className="marquee-track"
        /* التخطيط مضمّن لا صفّي — انظر التعليق في globals.css */
        style={{
          display: 'flex',
          width: 'max-content',
          ['--marquee-duration' as any]: `${durationSeconds}s`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
