'use client';

/* ============ مصباح الخلفية — يتبع المؤشّر ============
   نهاراً مصباحٌ فوق ورقة الرسم: الشبكة تحته أوضح وأحدّ. وليلاً كشّافٌ على
   اللوحة الأمّ: المسارات حوله تضيء. طبقةٌ ثانية من الخلفية نفسها بألوانٍ
   أقوى، لا تظهر إلّا داخل دائرةٍ حول المؤشّر.

   ⚠️ الأداء: لا نحرّك القناع (يُعيد رسم الشاشة كلّ إطار). الصندوق المقنّع
   ثابت الحجم ويتحرّك بـtransform، والطبقة داخله تتحرّك بعكسه فتبقى
   خطوطها فوق خطوط الخلفية تماماً — والتحريكان كلاهما على بطاقة الرسوميّات
   بلا إعادة رسم. ويعمل بالفأرة فقط (لا مؤشّر للّمس)، ولا يعمل لمن طلب
   تقليل الحركة. */

import { useEffect, useRef } from 'react';

const SIZE = 560;

export default function BackgroundLamp() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* عرض الطبقة الداخلية = عرض الخلفية (بلا شريط التمرير) — وإلّا انزاح
       مركز شبكة النهار (x=50%) عن مركز الخلفية بنصف عرض الشريط */
    const size = () => {
      el.style.setProperty('--vw', `${document.documentElement.clientWidth}px`);
      el.style.setProperty('--vh', `${window.innerHeight}px`);
    };
    size();

    let x = 0;
    let y = 0;
    let frame = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        el.style.setProperty('--lx', `${x}px`);
        el.style.setProperty('--ly', `${y}px`);
        el.setAttribute('data-on', '');
      });
    };
    const leave = () => el.removeAttribute('data-on');

    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    window.addEventListener('resize', size);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
      window.removeEventListener('resize', size);
    };
  }, []);

  return (
    <div ref={ref} className="bg-lamp" style={{ ['--lamp' as string]: `${SIZE}px` }} aria-hidden="true">
      {/* بقعة الضوء نفسها: نهاراً ورقٌ مُنار، وليلاً وهجٌ سماويّ خافت */}
      <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgb(255_255_255/0.45),transparent)] dark:bg-[radial-gradient(closest-side,rgb(34_211_238/0.07),transparent)]" />
      <div className="bg-lamp-inner">
        {/* نهاراً: الشبكة نفسها (المرسى في المنتصف مثلها) بحبرٍ أغمق */}
        <svg className="absolute inset-0 w-full h-full dark:hidden">
          <defs>
            <pattern id="lampMinor" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0H0V24" fill="none" stroke="#1E4C7A" strokeOpacity="0.28" strokeWidth="1" />
            </pattern>
            <pattern id="lampMajor" x="50%" width="120" height="120" patternUnits="userSpaceOnUse">
              <rect width="120" height="120" fill="url(#lampMinor)" />
              <path d="M120 0H0V120" fill="none" stroke="#1E4C7A" strokeOpacity="0.45" strokeWidth="1" />
              <g stroke="#0F2A44" strokeOpacity="0.8" strokeWidth="1.3">
                <path d="M0 0H6M0 0V6" />
                <path d="M120 0H114M120 0V6" />
                <path d="M0 120H6M0 120V114" />
                <path d="M120 120H114M120 120V114" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lampMajor)" />
        </svg>
        {/* ليلاً: مسارات اللوحة نفسها (PCBBackground) مضيئة */}
        <svg className="absolute inset-0 w-full h-full hidden dark:block">
          <defs>
            <pattern id="lampPcb" width="340" height="280" patternUnits="userSpaceOnUse">
              <g stroke="#22d3ee" strokeOpacity="0.5" strokeWidth="1.5" fill="none">
                <path d="M0 60 H90 L120 90 H200 M200 90 L230 60 H340" />
                <path d="M0 210 H70 L100 180 H180" />
                <path d="M340 230 H260 L230 200 H150" />
                <path d="M45 0 V40 L75 70 V130" />
                <path d="M300 280 V220 L270 190 V120" />
                <path d="M180 90 V160 L210 190 H280" />
              </g>
              <g fill="#67e8f9" fillOpacity="0.85">
                <circle cx="90" cy="60" r="3.5" /><circle cx="200" cy="90" r="3.5" />
                <circle cx="70" cy="210" r="3.5" /><circle cx="260" cy="230" r="3.5" />
                <circle cx="75" cy="70" r="3.5" /><circle cx="180" cy="160" r="3.5" />
                <circle cx="280" cy="190" r="3.5" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lampPcb)" />
        </svg>
      </div>
    </div>
  );
}
