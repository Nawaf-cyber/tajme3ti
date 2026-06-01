'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ExportComponentsButton() {
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