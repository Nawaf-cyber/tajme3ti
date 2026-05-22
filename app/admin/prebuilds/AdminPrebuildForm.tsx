"use client";
import { useState } from 'react';

export default function AdminPrebuildForm({ dbComponents, categories, action }: { dbComponents: any[], categories: any[], action: any }) {
  // حالة حفظ القطع المحددة
  const [selections, setSelections] = useState<Record<string, string>>({});

  // جلب القطع حسب الفئة
  const getCompsByCat = (catId: string) => dbComponents.filter(c => c.categoryId === catId);

  // حساب السعر الإجمالي آلياً
  const totalPrice = Object.values(selections).reduce((sum, compId) => {
    const comp = dbComponents.find(c => c.id === compId);
    return sum + (comp?.price || 0);
  }, 0);

  return (
    <form action={action} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mb-10">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">إضافة تجميعة جديدة (نظام الاختيار)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم التجميعة</label>
          <input type="text" name="title" required className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">فئة الميزانية</label>
          <select name="budgetType" required className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white">
            <option value="economic">اقتصادية</option>
            <option value="midrange">متوسطة</option>
            <option value="highend">احترافية عليا</option>
          </select>
        </div>
      </div>

      {/* منطقة اختيار القطع */}
      <div className="mb-6 bg-slate-50 dark:bg-[#0B1120] p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">اختيار القطع الأساسية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat: any) => (
            <div key={cat.id}>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{cat.name}</label>
              <select
                className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm"
                value={selections[cat.id] || ''}
                onChange={(e) => setSelections({ ...selections, [cat.id]: e.target.value })}
              >
                <option value="">-- اختر {cat.name} --</option>
                {getCompsByCat(cat.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name} - ${c.price}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">وصف التجميعة ومميزاتها</label>
        <textarea name="description" rows={4} required className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white whitespace-pre-wrap"></textarea>
      </div>

      {/* حقول مخفية لإرسال السعر والقطع للقاعدة */}
      <input type="hidden" name="componentsJson" value={JSON.stringify(selections)} />
      <input type="hidden" name="price" value={totalPrice} />

      <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-4">
        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
          السعر: ${totalPrice.toFixed(2)}
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
          حفظ التجميعة 
        </button>
      </div>
    </form>
  );
}