'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

/** `row`: بشكل عناصر تنقّل لوحة الإدارة (AdminNav) — نفس الأيقونة والخطّ */
export default function ExportComponentsButton({ variant }: { variant?: 'row' | 'side' } = {}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    const toastId = toast.loading('جاري تصدير البيانات...');

    try {
      const res = await fetch('/api/get-components');
      if (!res.ok) throw new Error('فشل الاتصال بقاعدة البيانات');
      
      const { components } = await res.json();

      if (!components || components.length === 0) {
        toast.error('لا توجد قطع لتصديرها', { id: toastId });
        setLoading(false);
        return;
      }

      // تحويل البيانات إلى نص JSON منظم
      const jsonString = JSON.stringify(components, null, 2);
      
      // إنشاء ملف وتحميله
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `components_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`تم تصدير ${components.length} قطعة بنجاح!`, { id: toastId, duration: 4000 });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'side') {
    return (
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2.5 w-full rounded-lg px-2.5 py-1.5 text-right text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-60"
      >
        <span className="w-6 text-center text-[14px] shrink-0">{loading ? '⏳' : '📤'}</span>
        <span className="flex-1 truncate">{loading ? 'جاري التصدير…' : 'تصدير JSON'}</span>
      </button>
    );
  }

  if (variant === 'row') {
    return (
      <button
        onClick={handleExport}
        disabled={loading}
        className="group flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-right transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-60"
      >
        <span className="w-8 h-8 shrink-0 rounded-md flex items-center justify-center text-[15px] bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
          {loading ? '⏳' : '📤'}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[13.5px] font-black text-slate-800 dark:text-slate-100">
            {loading ? 'جاري التصدير…' : 'تصدير JSON'}
          </span>
          <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">نسخةٌ من الكتالوج كلّه</span>
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? '⏳ جاري التصدير...' : '📥 تصدير القطع (JSON)'}
    </button>
  );
}