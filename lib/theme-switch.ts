'use client';

import { flushSync } from 'react-dom';

/**
 * ============ التبديل بين الليليّ والمضيء — «الموجة الناعمة» ============
 *
 * المتصفّح يلتقط الصفحة قبل التبديل وبعده (View Transitions)، والجديدة تنتشر
 * فوق القديمة من زرّ المظهر بحافّةٍ عريضة ناعمة (globals.css · vt-wave).
 * (اختارها نوّاف 2026-10-12 بعد عشر حركاتٍ وتشويشٍ وتهكيرٍ وخطوطٍ تتحوّل.)
 *
 * ⚠️ الصنف يُبدَّل هنا يدوياً لا عبر next-themes وحده: next-themes يطبّقه في
 * useEffect، أي بعد أن يلتقط المتصفّح «الصفحة الجديدة» — فتُلتقط قديمةً
 * وتنتشر الموجة على لا شيء. ثمّ setTheme يحفظ الاختيار ويحدّث الأيقونة
 * (flushSync كي تكون الأيقونة الجديدة في اللقطة)، وتطبيقه اللاحق للصنف لا يغيّر شيئاً.
 *
 * بلا View Transitions (متصفّحٌ قديم): تلاشٍ لونيّ قصير. ومن طلب تقليل
 * الحركة: تبديلٌ فوريّ.
 */

/** مركز العنصر المضغوط — منه تنطلق الموجة */
export const originOf = (el: Element) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

const EDGE = 240; // عرض الحافّة الناعمة — نفسه في globals.css

export function switchTheme(
  next: 'light' | 'dark',
  setTheme: (theme: string) => void,
  origin?: { x: number; y: number },
) {
  const root = document.documentElement;
  const apply = () => {
    root.classList.remove('light', 'dark');
    root.classList.add(next);
    root.style.colorScheme = next;
    flushSync(() => setTheme(next));
  };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    apply();
    return;
  }

  if (typeof document.startViewTransition !== 'function') {
    root.setAttribute('data-theme-fading', '');
    apply();
    window.setTimeout(() => root.removeAttribute('data-theme-fading'), 450);
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  // حتى أبعد زاوية + عرض الحافّة، كي تغطّي الموجة الشاشة كاملةً
  const rmax = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + EDGE;
  root.style.setProperty('--vt-x', `${x}px`);
  root.style.setProperty('--vt-y', `${y}px`);
  root.style.setProperty('--vt-rmax', `${rmax}px`);
  // data-vt يشغّل الموجة في globals.css ويجمّد انتقالات الألوان طوال التبديل
  root.setAttribute('data-vt', '');
  const transition = document.startViewTransition(apply);
  transition.finished.finally(() => root.removeAttribute('data-vt'));
}
