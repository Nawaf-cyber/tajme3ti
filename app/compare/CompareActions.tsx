'use client';

import { useState, RefObject } from 'react';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';

/* ---- تبديل مصادر الصور إلى البروكسي (لتفادي تلويث الـ canvas) ---- */
async function withProxiedImages<T>(node: HTMLElement, fn: () => Promise<T>): Promise<T> {
  const imgs = Array.from(node.querySelectorAll('img'));
  const originals = imgs.map((img) => img.getAttribute('src') || '');

  imgs.forEach((img, i) => {
    const src = originals[i];
    // نتجاوز الصور المحلّية أو الـ data URLs — هي same-origin أصلاً
    if (!src || src.startsWith('/') || src.startsWith('data:')) return;
    img.setAttribute('src', `/api/img-proxy?url=${encodeURIComponent(src)}`);
    img.setAttribute('crossorigin', 'anonymous');
  });

  // ننتظر فك التشفير حتى لا نلتقط صوراً نصف محمّلة
  await Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : img.decode().catch(() => undefined)
    )
  );

  try {
    return await fn();
  } finally {
    imgs.forEach((img, i) => {
      img.setAttribute('src', originals[i]);
      img.removeAttribute('crossorigin');
    });
  }
}

/* ---- ختم توقيع أسفل الصورة ---- */
function stampWatermark(dataUrl: string, isDark: boolean): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const pad = 56;
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height + pad;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.fillStyle = isDark ? '#0B1120' : '#EDF1F6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // خط فاصل سيان
      const grad = ctx.createLinearGradient(0, img.height, canvas.width, img.height);
      grad.addColorStop(0, 'rgba(6,182,212,0)');
      grad.addColorStop(0.5, 'rgba(6,182,212,0.6)');
      grad.addColorStop(1, 'rgba(6,182,212,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, img.height, canvas.width, 2);

      ctx.textBaseline = 'middle';
      const y = img.height + pad / 2;

      ctx.font = 'bold 22px monospace';
      ctx.fillStyle = '#06b6d4';
      ctx.textAlign = 'right';
      ctx.fillText('tajme3ti.com', canvas.width - 24, y);

      ctx.font = '16px sans-serif';
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText('نوجّه المجتمع، لا نبيع', 24, y);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function CompareActions({
  targetRef,
  names,
}: {
  targetRef: RefObject<HTMLDivElement | null>;
  names: string[];
}) {
  const [exporting, setExporting] = useState(false);

  /* ---- نسخ / مشاركة الرابط ---- */
  const shareLink = async () => {
    const url = window.location.href;
    const title = `مقارنة: ${names.join(' · ')}`;

    // مشاركة أصلية على الجوال
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // ألغى المستخدم — نكمل للنسخ
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط المقارنة');
    } catch {
      toast.error('تعذّر النسخ. انسخ الرابط من شريط العنوان.');
    }
  };

  /* ---- تصدير كصورة ---- */
  const exportImage = async () => {
    const node = targetRef.current;
    if (!node || exporting) return;

    setExporting(true);
    const t = toast.loading('...جارٍ تجهيز الصورة');

    try {
      const isDark = document.documentElement.classList.contains('dark');

      const dataUrl = await withProxiedImages<string>(node, () =>
        toPng(node, {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: isDark ? '#0B1120' : '#EDF1F6',
          // نستبعد أي عنصر تفاعلي لا معنى له في صورة ثابتة
          filter: (el) => {
            if (!(el instanceof HTMLElement)) return true;
            return el.dataset.noexport === undefined;
          },
        })
      );

      const stamped = await stampWatermark(dataUrl, isDark);

      const a = document.createElement('a');
      a.download = `tajme3ti-compare-${Date.now()}.png`;
      a.href = stamped;
      a.click();

      toast.success('تم حفظ الصورة', { id: t });
    } catch (err) {
      console.error(err);
      toast.error('تعذّر إنشاء الصورة', { id: t });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div data-noexport className="flex items-center gap-2">
      {/* نسخ / مشاركة */}
      <button
        onClick={shareLink}
        title="انسخ رابط هذه المقارنة"
        className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-cyan-500/60 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-sm transition-colors active:scale-95"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M8.684 13.342a3 3 0 100-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        <span className="text-[11px] font-black">مشاركة</span>
      </button>

      {/* تصدير كصورة */}
      <button
        onClick={exportImage}
        disabled={exporting}
        title="حمّل المقارنة كصورة"
        className="flex items-center gap-1.5 px-3 py-2 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 disabled:opacity-50 disabled:pointer-events-none rounded-sm transition-all active:scale-95"
      >
        {exporting ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        )}
        <span className="text-[11px] font-black">{exporting ? 'جارٍ...' : 'صورة'}</span>
      </button>
    </div>
  );
}