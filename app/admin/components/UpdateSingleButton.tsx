'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function UpdateSingleButton({ id, name }: { id: string, name: string }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    const loadingToast = toast.loading(`جاري تحديث سعر ${name}...`);
    
    try {
      const res = await fetch('/api/update-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`تم تحديث السعر بنجاح: ${data.price} ر.س`, { id: loadingToast });
        // تنبيه: السعر لن يتحدث في الواجهة فوراً إلا إذا قمت بعمل Refresh للصفحة أو تحديث الـ State
        // يمكنك إضافة router.refresh() هنا إذا أردت تحديث الجدول فوراً
      } else {
        toast.error('فشل التحديث. تأكد من الروابط.', { id: loadingToast });
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالسيرفر', { id: loadingToast });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button 
      onClick={handleUpdate} 
      disabled={isUpdating}
      title="تحديث السعر"
      className="px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50 flex items-center justify-center"
    >
      {isUpdating ? (
        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      )}
    </button>
  );
}