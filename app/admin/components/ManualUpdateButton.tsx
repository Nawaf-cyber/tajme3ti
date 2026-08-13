"use client";
import { useState } from "react";

/**
 * ============ فحصٌ سريع لأقدم القطع ============
 *
 * ⚠️ كان الزرّ يكذب: مكتوبٌ عليه «آخر 10 قطع» ورسالته تقول «جاري تحديث 10
 * قطع»، وهو ينادي المسار **بلا `limit`** — فيسحب دفعةً كاملة (٣٥ قطعة)،
 * أي ثلاثة أضعاف ما يعد به وثلاثة أضعاف الرصيد المتوقَّع (~٥٦٠ وحدة بدل
 * ~١٦٠). ولا سبيل للأدمن أن يعرف: الردّ لا يُعرض عدده إلا كقائمة أسماء.
 *
 * الآن العدد ثابتٌ واحد يحكم النداء والنصّ معاً، فلا يفترقان مرّةً أخرى.
 *
 * وهو غير زرّ «تحديث أسعار المتاجر» الأزرق: ذاك يكنس الكتالوج كلّه في حلقة
 * (٢٥٦ قطعة ≈ ٤٬١٠٠ وحدة سحب و~٧ دقائق)، وهذا لمسةٌ واحدة للتحقّق من أن
 * السحب سليم بعد تعديل محدّد أو إضافة متجر.
 */
const QUICK_LIMIT = 10;

export default function ManualUpdateButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [updatedItems, setUpdatedItems] = useState<string[]>([]);

  const handleUpdate = async () => {
    setIsLoading(true);
    setMessage(`جاري تحديث ${QUICK_LIMIT} قطع... يرجى الانتظار (قد يستغرق دقيقة).`);
    setUpdatedItems([]); // تصفير القائمة قبل بدء التحديث

    try {
      const res = await fetch(`/api/cron/update-all?limit=${QUICK_LIMIT}`);
      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        if (data.updatedNames && data.updatedNames.length > 0) {
          setUpdatedItems(data.updatedNames);
        }
      } else {
        setMessage(`❌ حدث خطأ: ${data.error || data.message}`);
      }
    } catch (error) {
      setMessage("❌ فشل الاتصال بالخادم.");
    }

    setIsLoading(false);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleUpdate}
          disabled={isLoading}
          className={`px-4 py-2 rounded font-bold text-white transition-colors ${
            isLoading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "جاري التحديث..." : `فحص سريع (أقدم ${QUICK_LIMIT} قطع)`}
        </button>

        {message && (
          <span className={`text-sm font-medium ${message.includes('✅') ? 'text-green-600' : message.includes('❌') ? 'text-red-600' : 'text-gray-600'}`}>
            {message}
          </span>
        )}
      </div>

      {/* عرض قائمة القطع المحدثة */}
      {updatedItems.length > 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded">
          <h3 className="font-bold text-sm text-gray-800 mb-2">القطع التي تم تحديثها:</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 flex flex-col gap-1">
            {updatedItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
