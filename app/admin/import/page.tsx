'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ترجمة أسماء الحقول للعربية في جدول "وش تغيّر" */
const FIELD_AR: Record<string, string> = {
  brand: 'العلامة', name: 'الاسم', price: 'السعر',
  amazonPrice: 'سعر أمازون', cazasouqPrice: 'سعر كازاسوق', microlessPrice: 'سعر مايكرولس',
  tdpWattage: 'استهلاك الطاقة', performanceTier: 'مستوى الأداء',
  amazonInStock: 'توفّر أمازون', cazasouqInStock: 'توفّر كازاسوق', microlessInStock: 'توفّر مايكرولس',
  imageUrl: 'الصورة', description: 'الوصف',
};

const fmtVal = (v: any) => {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'متوفّر' : 'نافد';
  return String(v);
};

type ImportResult = {
  message: string;
  errors?: string[];
  /* ملحوظاتٌ لا ترفض: القطعة حُفظت وينقصها حقلُ مقارنة. تُعرض لأن الردّ
     الذي لا يُقرأ لا يُصلح شيئاً — والرافع لن يفتح كل قطعة ليكتشف نقصها. */
  warnings?: string[];
  added?: any[];
  updated?: any[];
};

export default function BulkImportPage() {
  const [status, setStatus] = useState<string>('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [openAdded, setOpenAdded] = useState(true);
  const [openUpdated, setOpenUpdated] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('جاري معالجة الملف...');
    setResult(null);
    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setStatus('جاري رفع البيانات إلى قاعدة البيانات...');

        const response = await fetch('/api/admin/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json),
        });

        const resData = await response.json();

        if (response.ok) {
          setStatus(`✅ ${resData.message}`);
          setResult(resData);
        } else {
          setStatus(`❌ حدث خطأ: ${resData.error || resData.message}`);
        }
      } catch (error) {
        setStatus('❌ صيغة الملف غير صحيحة. يرجى التأكد من أنه ملف JSON سليم.');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const addedCount = result?.added?.length || 0;
  const updatedCount = result?.updated?.length || 0;
  const errorCount = result?.errors?.length || 0;
  const warnCount = result?.warnings?.length || 0;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">

      {/* زر الرجوع */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          🔙 رجوع للوحة الإدارة
        </Link>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow border dark:border-slate-800">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">الرفع المجمع للقطع (Bulk Import)</h1>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-700 dark:text-blue-300">
          <p className="font-semibold mb-2">تعليمات:</p>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>قم بتجهيز بيانات القطع في ملف Excel.</li>
            <li>قم بتحويل ملف Excel إلى صيغة JSON.</li>
            <li>ارفع ملف الـ JSON هنا ليتم إدخال جميع القطع دفعة واحدة.</li>
            <li className="font-bold">
              كل قطعة تحتاج مفاتيح التوافق كاملةً في <span className="font-mono" dir="ltr">specs</span> —
              وما نقص منها يُرفض ويُذكر باسمه.
            </li>
            <li>
              ⚠️ حقل <span className="font-mono" dir="ltr">specs</span> <b>يستبدل</b> المواصفات ولا يدمجها:
              أرسله كاملاً، فإرسال مفتاحٍ واحد يمحو الباقي.
            </li>
          </ol>
        </div>

        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="sr-only">اختر ملف JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={loading}
              className={`block w-full text-sm text-gray-500 dark:text-gray-400 cursor-pointer
                file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400
                hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
                border dark:border-slate-700 rounded-md p-2 bg-gray-50 dark:bg-slate-800`}
            />
          </label>

          {status && (
            <div className="mt-2 font-medium text-gray-800 dark:text-gray-200">
              الحالة: {status}
            </div>
          )}
        </div>
      </div>

      {/* ===== المعاينة ===== */}
      {result && (
        <div className="mt-6 space-y-4">

          {/* شريط ملخّص ملوّن */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-center">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{addedCount}</div>
              <div className="text-xs font-bold text-emerald-700/70 dark:text-emerald-400/70 mt-1">أُضيفت</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{updatedCount}</div>
              <div className="text-xs font-bold text-blue-700/70 dark:text-blue-400/70 mt-1">حُدّثت</div>
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-center">
              <div className="text-2xl font-black text-red-600 dark:text-red-400">{errorCount}</div>
              <div className="text-xs font-bold text-red-700/70 dark:text-red-400/70 mt-1">رُفضت</div>
            </div>
          </div>

          {/* المرفوضة */}
          {errorCount > 0 && (
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10 overflow-hidden">
              <div className="px-4 py-3 bg-red-100/60 dark:bg-red-900/20 font-black text-sm text-red-700 dark:text-red-400">
                ❌ رُفضت ({errorCount}) — تحتاج تصحيحاً قبل إعادة الرفع
              </div>
              <ul className="p-4 space-y-1.5">
                {result.errors!.map((err, i) => (
                  <li key={i} className="text-[12.5px] text-red-600 dark:text-red-300 flex gap-2">
                    <span className="text-red-400">•</span>{err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* حُفظت وينقصها — بين المرفوضة والمُضافة: أهمّ من النجاح وأقلّ من الرفض */}
          {warnCount > 0 && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-900/10 overflow-hidden">
              <div className="px-4 py-3 bg-amber-100/60 dark:bg-amber-900/20 font-black text-sm text-amber-700 dark:text-amber-400">
                ⚠️ حُفظت وينقصها ({warnCount}) — تظهر صفوفها فارغة في الجدول والمقارنة
              </div>
              <ul className="p-4 space-y-1.5">
                {result.warnings!.map((w, i) => (
                  <li key={i} className="text-[12.5px] text-amber-700 dark:text-amber-300 flex gap-2">
                    <span className="text-amber-400">•</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* المُضافة */}
          {addedCount > 0 && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 overflow-hidden">
              <button
                onClick={() => setOpenAdded(!openAdded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-emerald-100/60 dark:bg-emerald-900/20 font-black text-sm text-emerald-700 dark:text-emerald-400"
              >
                <span>🆕 القطع المُضافة ({addedCount})</span>
                <span className={`transition-transform ${openAdded ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {openAdded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="p-2.5 text-right font-bold">الاسم</th>
                        <th className="p-2.5 text-right font-bold">الفئة</th>
                        <th className="p-2.5 text-right font-bold">العلامة</th>
                        <th className="p-2.5 text-center font-bold">السعر</th>
                        <th className="p-2.5 text-center font-bold">المستوى</th>
                        <th className="p-2.5 text-center font-bold">الطاقة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.added!.map((c, i) => (
                        <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{c.name}</td>
                          <td className="p-2.5 text-slate-500 dark:text-slate-400">{c.category}</td>
                          <td className="p-2.5 text-slate-500 dark:text-slate-400">{c.brand}</td>
                          <td className="p-2.5 text-center font-bold text-slate-700 dark:text-slate-300">{fmtVal(c.price)}</td>
                          <td className="p-2.5 text-center">
                            {c.performanceTier != null ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 font-black">{c.performanceTier}</span>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="p-2.5 text-center text-slate-500 dark:text-slate-400">{c.tdpWattage ? `${c.tdpWattage}W` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* المُحدّثة — مع وش تغيّر */}
          {updatedCount > 0 && (
            <div className="rounded-xl border border-blue-200 dark:border-blue-900 overflow-hidden">
              <button
                onClick={() => setOpenUpdated(!openUpdated)}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-100/60 dark:bg-blue-900/20 font-black text-sm text-blue-700 dark:text-blue-400"
              >
                <span>🔄 القطع المُحدّثة ({updatedCount})</span>
                <span className={`transition-transform ${openUpdated ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {openUpdated && (
                <div className="p-3 space-y-2">
                  {result.updated!.map((c, i) => (
                    <div key={i} className="rounded-lg border border-slate-100 dark:border-slate-800 p-3">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">{c.name}</span>
                        <span className="text-[10px] font-bold text-slate-400">{c.category}</span>
                      </div>
                      {c.changes && c.changes.length > 0 ? (
                        <div className="space-y-1">
                          {c.changes.map((ch: any, j: number) => (
                            <div key={j} className="flex items-center gap-2 text-[11.5px] flex-wrap">
                              <span className="font-bold text-slate-500 dark:text-slate-400 min-w-[80px]">{FIELD_AR[ch.field] || ch.field}:</span>
                              <span className="text-red-500 line-through">{fmtVal(ch.from)}</span>
                              <span className="text-slate-400">←</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{fmtVal(ch.to)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">لا تغييرات فعلية (نفس القيم).</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}