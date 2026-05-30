'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function UpdatePricesButton() {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('🔄 تحديث أسعار المتاجر');

  const handleUpdate = async () => {
    setLoading(true);
    const toastId = toast.loading('جاري تجهيز قائمة القطع...');
    
    try {
      // 1. جلب قائمة القطع
      const listRes = await fetch('/api/get-components');
      if (!listRes.ok) throw new Error('فشل جلب البيانات من السيرفر');
      const { components } = await listRes.json();

      // تصفية القطع التي تمتلك رابطاً واحداً على الأقل
      const targets = components.filter((c: any) => c.amazonUrl || c.cazasouqUrl);

      if (targets.length === 0) {
        toast.success('لا توجد قطع بروابط متاجر لتحديثها', { id: toastId });
        setLoading(false);
        return;
      }

      let updatedCount = 0;
      let failedCount = 0;

      // 2. حلقة التحديث باستخدام مسار update-single الدقيق
      for (let i = 0; i < targets.length; i++) {
        setStatusText(`جاري التحديث: ${i + 1} / ${targets.length}`);
        toast.loading(`تحديث: ${targets[i].name || 'قطعة'}...`, { id: toastId });

        try {
          // استدعاء نفس API التحديث المفرد الدقيق
          // تنويه: تأكد أن المسار هنا يطابق مسار ملف update-single لديك
          const res = await fetch('/api/update-single', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: targets[i].id })
          });

          if (res.ok) {
            updatedCount++;
          } else {
            failedCount++;
          }
        } catch (e) {
          console.error(`خطأ في تحديث ${targets[i].name}:`, e);
          failedCount++;
        }
      }

      // 3. إنهاء العملية
      toast.success(`تم الانتهاء! (نجاح: ${updatedCount} | فشل: ${failedCount})`, { 
        id: toastId, 
        duration: 5000 
      });

    } catch (error: any) {
      toast.error(error.message, { id: toastId, duration: 5000 });
    } finally {
      setLoading(false);
      setStatusText('🔄 تحديث أسعار المتاجر');
    }
  };

  return (
    <button 
      onClick={handleUpdate} 
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? `⏳ ${statusText}` : statusText}
    </button>
  );
}