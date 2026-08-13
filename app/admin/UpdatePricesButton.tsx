'use client';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

export default function UpdatePricesButton() {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('🔄 تحديث أسعار المتاجر');
  const [updateErrors, setUpdateErrors] = useState<string[]>([]);
  const cancelRef = useRef(false);

  const handleUpdate = async () => {
    setLoading(true);
    setUpdateErrors([]);
    cancelRef.current = false;
    const toastId = toast.loading('جاري بدء التحديث الشامل...');
    
    let totalUpdated = 0;
    let targetTotal = 0;
    let hasMore = true;
    let allCollectedErrors: string[] = [];
    let wasCancelled = false;

    try {
      while (hasMore) {
        if (cancelRef.current) {
          wasCancelled = true;
          break;
        }

        setStatusText(targetTotal > 0 ? `جاري التحديث... (${totalUpdated} / ${targetTotal})` : `جاري بدء التحديث...`);
        
        const response = await fetch('/api/cron/update-all');
        const contentType = response.headers.get("content-type");
        
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`تعليق مؤقت من السيرفر. تم تخطي القطع المتعطلة.`);
        }

        const data = await response.json();

        if (data.totalMatchingCount) {
            targetTotal = data.totalMatchingCount;
        }

        if (data.success && data.updatedNames) {
          totalUpdated += data.updatedNames.length;
          toast.loading(`تم تحديث ${totalUpdated} من أصل ${targetTotal} قطعة حتى الآن...`, { id: toastId });
          
          if (data.errors && data.errors.length > 0) {
            allCollectedErrors = [...allCollectedErrors, ...data.errors];
          }

          // شروط الإيقاف:
          // 1) وصلنا للإجمالي (كل القطع تحدّثت)
          // 2) أو الدفعة رجعت فاضية (ما فيه قطع جديدة تُحدّث)
          if (data.updatedNames.length === 0 || (targetTotal > 0 && totalUpdated >= targetTotal)) {
            hasMore = false;
          }
        } else {
          hasMore = false;
          /* علمٌ من السيرفر لا مطابقةُ نصّ: كانت المقارنة على الرسالة حرفاً
             بحرف، فتعديل كلمةٍ فيها يحوّل «موقوف من اللوحة» إلى «خطأ غير
             معروف». (يُقبل النصّ القديم أيضاً حتى ينتشر النشر.) */
          if (data.disabled || data.message === "التحديث التلقائي معطل حالياً من لوحة التحكم.") {
            toast.error(data.message, { id: toastId });
            setLoading(false);
            setStatusText('🔄 تحديث أسعار المتاجر');
            return;
          } else if (!data.success) {
            allCollectedErrors.push(data.message || data.error || 'حدث خطأ غير معروف');
          }
        }
      }

      if (wasCancelled) {
        toast.success(`تم الإيقاف! تم حفظ ${totalUpdated} قطعة بنجاح.`, { id: toastId, duration: 5000 });
      } else if (targetTotal > 0 && totalUpdated < targetTotal) {
        // انتهت الحلقة بدفعة فارغة قبل بلوغ الإجمالي — نقصٌ لا اكتمال
        toast(
          `انتهى التحديث عند ${totalUpdated} من ${targetTotal}. اضغط الزر مجدداً ليكمل الباقي.`,
          { id: toastId, icon: '⚠️', duration: 8000 },
        );
      } else {
        toast.success(`اكتمل التحديث بنجاح! إجمالي القطع: ${totalUpdated} / ${targetTotal}`, { id: toastId, duration: 5000 });
      }

      if (allCollectedErrors.length > 0) setUpdateErrors(allCollectedErrors);

    } catch (error: any) {
      /* ⚠️ كان هذا يعرض toast.success ويقول "اكتمل التحديث" — أي أن انقطاع
         دفعة في المنتصف (مهلة فيرسل ٦٠ث، أو رد HTML بدل JSON) يظهر نجاحاً
         كاملاً بينما بقيت مئات القطع بلا تحديث. هذا سبب انطباع "أمازون
         ما يتحدّث": الأداة تقول تمّ، والقطع الباقية لم تُمسّ.
         الآن نقولها كما هي، ونذكر كم بقي وكيف يُستأنف. */
      const remaining = targetTotal > 0 ? Math.max(0, targetTotal - totalUpdated) : null;
      toast.error(
        `توقّف التحديث قبل أن يكتمل — أُنجزت ${totalUpdated}` +
        (remaining !== null ? ` من ${targetTotal}، وبقيت ${remaining} قطعة.` : ' قطعة.') +
        ' اضغط الزر مجدداً ليكمل من حيث توقّف.',
        { id: toastId, duration: 9000 },
      );
      setUpdateErrors(prev => [...prev, error.message]);
    } finally {
      setLoading(false);
      setStatusText('🔄 تحديث أسعار المتاجر');
    }
  };

  const handleCancel = () => {
    cancelRef.current = true;
    setStatusText('جاري الإيقاف...');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button 
          onClick={handleUpdate} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 w-fit"
        >
          {loading ? `⏳ ${statusText}` : statusText}
        </button>

        {loading && (
          <button 
            onClick={handleCancel}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center gap-2 w-fit"
          >
            🛑 إيقاف
          </button>
        )}
      </div>

      {updateErrors.length > 0 && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-right w-full max-h-64 overflow-y-auto">
          <h4 className="font-bold mb-2">⚠️ تنبيهات وأخطاء التحديث:</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            {updateErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}