'use client';

/* ============ التقاط نقرات الشراء ============
 *
 * سطرٌ واحد في `app/layout.tsx`، ولا يعرض شيئاً — كـ`VisitPing`.
 *
 * ⚠️ ولماذا مستمعٌ واحدٌ لا مُعالِجٌ في كلّ رابط: أسطحُ الشراء أربعة
 * (`StoreOfferList` · `StoreBuyChips` · `BuyCell` · الباني)، وثلاثةٌ منها
 * **مكوّناتُ خادم**. وتحويلُها إلى عميلٍ لأجل نقرةٍ ثمنٌ لا يستحقّه —
 * وأربعُ نسخٍ من نفس المُعالِج تتباعد، وهو الدرس الذي كلّفنا هذه الجلسة
 * مرّتين (ساحبات الأسعار، وقاعدة اختيار الاكتشاف).
 *
 * ⚠️ والالتقاط في مرحلة الالتقاط (`capture: true`): الرابط يفتح تبويباً
 * جديداً، وبعض المتصفّحات توقف دورة الأحداث فور المغادرة. والالتقاط قبل
 * الفقاعة يضمن أن تُرسل النبضة أوّلاً.
 */

import { useEffect } from 'react';
import { track } from '../lib/track';

export default function OfferClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.('a[data-store]') as HTMLAnchorElement | null;
      if (!el) return;
      const store = el.getAttribute('data-store');
      if (!store) return;
      track('offer_click', {
        /* ⚠️ ومعرّف القطعة اختياريّ: في صفحة القطعة يستنتجه الخادم من
           المسار، وفي الباني والمقارنة لا مسارَ يدلّ عليه — فتُعطيه السمة. */
        componentId: el.getAttribute('data-cid'),
        label: store,
      });
    };

    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true } as any);
  }, []);

  return null;
}
