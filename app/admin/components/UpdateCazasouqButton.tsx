'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function UpdateCazasouqButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/update-cazasouq');
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.error || 'حدث خطأ أثناء التحديث');
      }
    } catch (error) {
      toast.error('فشل الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpdate}
      disabled={isLoading}
      // تم تعديل الكلاسات هنا لتطابق تصميم لوحة التحكم الداكنة
      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 font-medium py-2 px-4 rounded-lg transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          جاري التحديث...
        </>
      ) : (
        '🔄 تحديث كازاسوق'
      )}
    </button>
  );
}