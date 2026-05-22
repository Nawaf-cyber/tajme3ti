"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function ComponentsClient({ components, categories }: { components: any[], categories: any[] }) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [maxPrice, setMaxPrice] = useState(5000);

  // منطق الفلترة
  const filtered = components.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'all' || c.categoryId === selectedCat;
    const matchPrice = c.price <= maxPrice;
    return matchSearch && matchCat && matchPrice;
  });

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* قسم الفلاتر */}
      <div className="w-full md:w-64 shrink-0 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">البحث</label>
          <input 
            type="text" 
            placeholder="اسم القطعة أو الشركة..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الفئة</label>
          <select 
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white"
          >
            <option value="all">جميع الفئات</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            الحد الأقصى للسعر: <span className="text-blue-600">${maxPrice}</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max="5000" 
            step="50"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* قسم عرض البطاقات */}
      <div className="flex-1">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            لا توجد قطع تطابق الفلاتر المحددة.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((comp) => (
              <div key={comp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
                    {comp.category?.name}
                  </span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">${comp.price}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{comp.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">{comp.brand}</p>
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link href={`/components/${comp.id}`} className="block w-full text-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold py-2 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                    التفاصيل
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}