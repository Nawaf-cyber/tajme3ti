'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function UpdatePricesButton() {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    const toastId = toast.loading('جاري تحديث أمازون...');
    
    try {
      // 1. تحديث أمازون
      const resAmz = await fetch('/api/update-amazon');
      if (!resAmz.ok) throw new Error('فشل اتصال سيرفر أمازون');
      const dataAmz = await resAmz.json();
      
      // 2. تحديث كازاسوق
      toast.loading('جاري تحديث كازاسوق...', { id: toastId });
      const resCaza = await fetch('/api/update-cazasouq');
      if (!resCaza.ok) throw new Error('فشل اتصال سيرفر كازاسوق');
      const dataCaza = await resCaza.json();

      const amzCount = dataAmz.updatedCount || 0;
      const cazaCount = dataCaza.updatedCount || 0;
      
      // تجميع الأخطاء إن وجدت وفحصها
      const allErrors = [...(dataAmz.errors || []), ...(dataCaza.errors || [])];
      
      if (amzCount === 0 && cazaCount === 0 && allErrors.length > 0) {
        console.error('قائمة الأخطاء بالتفصيل:', allErrors);
        // عرض أول خطأ واجه النظام في الـ Toast
        toast.error(`لم يتحدث شيء. السبب الأول: ${allErrors[0]}`, { id: toastId, duration: 7000 });
      } else {
        toast.success(`تم بنجاح! (أمازون: ${amzCount} | كازاسوق: ${cazaCount})`, { 
          id: toastId, 
          duration: 5000 
        });
      }
      
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleUpdate} 
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? '⏳ جاري التحديث...' : '🔄 تحديث أسعار المتاجر'}
    </button>
  );
}