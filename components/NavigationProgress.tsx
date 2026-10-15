'use client';

/* ============ شريط تقدّم التنقّل — بديل شاشات التحميل ============
 *
 * ⚠️ لماذا حُذفت loading.tsx (2026-10-15): كلّ ملفّ منها حدُّ Suspense، فيرسل
 * الخادم شاشة التحميل أوّلاً ويضع محتوى الصفحة كلّه في `<div hidden id="S:0">`
 * تكشفه الجافاسكربت. فالزاحف الذي لا يشغّلها (ومنه زاحف أدسنس) يرى في كلّ صفحة
 * «تجميعتي · جارٍ التحميل...» — حتى صفحة الخصوصية. قِيس على الموقع الحيّ بعد
 * رفض أدسنس: المحتوى في الكتلة المخفيّة في كلّ الصفحات المفحوصة.
 *
 * وبلا تلك الشاشات تنتظر الصفحة القديمة حتى تصل الجديدة بلا إشارة — فهذا الشريط
 * الرفيع يظهر عند النقر على رابطٍ داخليّ ويختفي حين يتغيّر العنوان. لا نصّ فيه.
 */

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [active, setActive] = useState(false);

  /* وصلت الصفحة الجديدة */
  useEffect(() => { setActive(false); }, [pathname, search]);

  useEffect(() => {
    /* ⚠️ في مرحلة الالتقاط: Link يستدعي preventDefault في معالجه (وهو أسبق منّا
       على document)، فالاعتماد على defaultPrevented يُسقط كلّ تنقّلٍ داخليّ */
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('/') || href.startsWith('//')) return;
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setActive(true);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  /* أمانٌ: تنقّلٌ أُلغي أو فشل لا يُبقي الشريط للأبد */
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(false), 12000);
    return () => clearTimeout(t);
  }, [active]);

  if (!active) return null;
  return (
    <div className="fixed top-0 inset-x-0 z-[100] h-0.5 overflow-hidden bg-cyan-500/15" role="progressbar" aria-label="جارٍ فتح الصفحة">
      <div className="h-full w-1/3 animate-loading-bar bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
    </div>
  );
}
