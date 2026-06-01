'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BulkImportPage() {
  const [status, setStatus] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('جاري معالجة الملف...');
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

        if (response.ok) {
          const resData = await response.json();
          setStatus(`✅ ${resData.message}`);
        } else {
          setStatus('❌ حدث خطأ أثناء الرفع.');
        }
      } catch (error) {
        setStatus('❌ صيغة الملف غير صحيحة. يرجى التأكد من أنه ملف JSON سليم.');
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-slate-900 rounded-lg shadow border dark:border-slate-800">
      
      {/* زر الرجوع */}
      <div className="mb-8">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          🔙 رجوع للوحة الإدارة
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">الرفع المجمع للقطع (Bulk Import)</h1>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-700 dark:text-blue-300">
        <p className="font-semibold mb-2">تعليمات:</p>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>قم بتجهيز بيانات القطع في ملف Excel.</li>
          <li>قم بتحويل ملف Excel إلى صيغة JSON.</li>
          <li>ارفع ملف الـ JSON هنا ليتم إدخال جميع القطع دفعة واحدة.</li>
        </ol>
      </div>

      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="sr-only">اختر ملف JSON</span>
          <input 
            type="file" 
            accept=".json"
            onChange={handleFileUpload}
            className={`block w-full text-sm text-gray-500 dark:text-gray-400 cursor-pointer
              file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold 
              file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400 
              hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 
              border dark:border-slate-700 rounded-md p-2 bg-gray-50 dark:bg-slate-800`}
          />
        </label>
        
        {status && (
          <div className="mt-4 font-medium text-gray-800 dark:text-gray-200">
            الحالة: {status}
          </div>
        )}
      </div>
    </div>
  );
}