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
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleUpdate}
          disabled={isLoading}
          className="py-2 px-5 rounded-lg font-bold text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-wait w-fit"
        >
          {isLoading ? "⏳ جاري الفحص…" : `⚡ فحص سريع (أقدم ${QUICK_LIMIT} قطع)`}
        </button>

        {message && (
          <span className={`text-sm font-medium ${message.includes('✅') ? 'text-green-600' : message.includes('❌') ? 'text-red-600' : 'text-gray-600'}`}>
            {message}
          </span>
        )}
      </div>

      {/* عرض قائمة القطع المحدثة */}
      {updatedItems.length > 0 && (
        <div className="mt-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto">
          <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-2">القطع التي فُحصت:</h3>
          <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-1">
            {updatedItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
