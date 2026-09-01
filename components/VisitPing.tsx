'use client';

/* ============ نبضة الزيارة ============
 *
 * سطرٌ واحد في `app/layout.tsx`، ولا يعرض شيئاً.
 *
 * ⚠️ ويُرسل عند كل تغيّر مسار لا عند التحميل الأوّل وحده: التطبيق يتنقّل
 * في المتصفّح بلا طلب صفحةٍ جديدة، فقياسٌ عند التحميل فقط يرى الصفحة
 * الأولى ويعمى عن كل ما بعدها — وهي أكثر التصفّح عندنا (كتالوج ← قطعة ←
 * مقارنة).
 *
 * ⚠️ ويُحرس من التكرار بمرجعٍ لا بحالة: React في التطوير يُشغّل الأثر
 * مرّتين، فتُسجَّل كل زيارةٍ زيارتين — ورقمٌ مضاعفٌ في التطوير يصير عادةً
 * لا يُشكّ فيها.
 *
 * ⚠️ و`sendBeacon` أوّلاً: الزائر الذي ينقر رابط متجرٍ ويغادر فوراً كان
 * طلبُه يُلغى مع الصفحة — وهو بالضبط الزائر الذي نريد أن نعرف أنّه جاء.
 */

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function VisitPing() {
  const pathname = usePathname();
  const params = useSearchParams();
  const sent = useRef<string>('');

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    /* مفتاح الحراسة يشمل الاستعلام: الانتقال من صفحةٍ إلى نفسها بمرشِّحٍ
       آخر زيارةٌ أخرى، والانتقال إليها بلا تغيير ليس كذلك. */
    const key = pathname + '?' + (params?.toString() ?? '');
    if (sent.current === key) return;
    sent.current = key;

    const payload = JSON.stringify({ p: pathname, r: document.referrer || '' });

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/hit', new Blob([payload], { type: 'application/json' }));
        return;
      }
    } catch { /* المتصفّح يمنع البيكون أحياناً — نُكمل بالطلب العاديّ */ }

    fetch('/api/hit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname, params]);

  return null;
}
