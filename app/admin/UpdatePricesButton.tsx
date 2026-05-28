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

      const amazonTargets = components.filter((c: any) => c.amazonUrl);
      const cazaTargets = components.filter((c: any) => c.cazasouqUrl);

      let amzUpdated = 0;
      let cazaUpdated = 0;

      // 2. حلقة تحديث أمازون
      toast.loading('جاري تحديث أمازون...', { id: toastId });
      for (let i = 0; i < amazonTargets.length; i++) {
        setStatusText(`أمازون: ${i + 1} / ${amazonTargets.length}`);
        try {
          const res = await fetch('/api/update-amazon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id: amazonTargets[i].id, 
              amazonUrl: amazonTargets[i].amazonUrl,
              cazasouqPrice: amazonTargets[i].cazasouqPrice
            })
          });
          if (res.ok) amzUpdated++;
        } catch (e) {
          console.error('Amazon Error:', e);
        }
      }

      // 3. حلقة تحديث كازاسوق
      toast.loading('جاري تحديث كازاسوق...', { id: toastId });
      for (let i = 0; i < cazaTargets.length; i++) {
        setStatusText(`كازاسوق: ${i + 1} / ${cazaTargets.length}`);
        try {
          const res = await fetch('/api/update-cazasouq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id: cazaTargets[i].id, 
              cazasouqUrl: cazaTargets[i].cazasouqUrl,
              amazonPrice: cazaTargets[i].amazonPrice // إرسال سعر أمازون للمقارنة وضبط الدينار
            })
          });
          if (res.ok) cazaUpdated++;
        } catch (e) {
          console.error('Cazasouq Error:', e);
        }
      }

      // 4. إنهاء العملية
      toast.success(`تم التحديث! (أمازون: ${amzUpdated} | كازاسوق: ${cazaUpdated})`, { 
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