'use client';

/* ============ متى تظهر رسوم الإنشاء؟ ============
   رسوم الهوامش (PCBBackground · draft-sketch) زخرفةُ فراغ: على الشاشات
   المتوسّطة الهوامش ضيّقة فكانت أطرافها تطلّ من خلف البطاقات كخربشات. فلا
   تظهر إلّا في الرئيسيّة وأنت في أعلاها (فوق «جمّع بثقة» الفضاء مفتوح)،
   وتخبو حين تنزل، وتُطفأ في بقيّة الصفحات — ومعها تتوقّف حركتها فلا تكلّف
   الجهاز شيئاً وهي غير مرئيّة (globals.css · data-sketch). */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function SketchGate() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (pathname !== '/') {
      root.removeAttribute('data-sketch');
      return;
    }
    const update = () => {
      if (window.scrollY < 80) root.setAttribute('data-sketch', '');
      else root.removeAttribute('data-sketch');
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      root.removeAttribute('data-sketch');
    };
  }, [pathname]);

  return null;
}
