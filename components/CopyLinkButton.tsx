'use client';

/* «انسخ الرابط» — صفحة التجميعة المشتركة (شكل م١ · 2026-10-31). الرابط رابطُ الصفحة الحاليّة */
import { useState } from 'react';

export default function CopyLinkButton({ className = '' }: { className?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      /* متصفّحٌ بلا إذن الحافظة: يبقى الرابط في شريط العنوان */
    }
  };
  return (
    <button type="button" onClick={copy} className={className} aria-live="polite">
      {done ? '✓ نسخنا الرابط' : 'انسخ الرابط'}
    </button>
  );
}
