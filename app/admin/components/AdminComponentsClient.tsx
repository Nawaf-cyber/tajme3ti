'use client';

import { useState, useMemo } from 'react';

type Category = {
  id: string;
  name: string;
};

type Component = {
  id: string;
  name: string;
  brand: string;
  price: number;
  categoryId: string;
  category: Category;
};

export default function AdminComponentsClient({ 
  initialComponents, 
  categories 
}: { 
  initialComponents: Component[], 
  categories: Category[] 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // فلترة القطع بناءً على البحث والتصنيف
  const filteredComponents = useMemo(() => {
    return initialComponents.filter(comp => {
      const matchSearch = 
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        comp.brand.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory = selectedCategory === 'ALL' || comp.categoryId === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [initialComponents, searchTerm, selectedCategory]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
      
      {/* شريط البحث والفلترة */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="ابحث باسم القطعة أو العلامة التجارية..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white min-w-[200px]"
        >
          <option value="ALL">جميع التصنيفات</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* إحصائيات سريعة */}
      <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 font-bold">
        عرض {filteredComponents.length} قطعة من أصل {initialComponents.length}
      </div>

      {/* جدول القطع */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">التصنيف</th>
              <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">العلامة التجارية</th>
              <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">اسم القطعة</th>
              <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">السعر</th>
            </tr>
          </thead>
          <tbody>
            {filteredComponents.length > 0 ? (
              filteredComponents.map(comp => (
                <tr key={comp.id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-800">
                      {comp.category.name}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-gray-200">{comp.brand}</td>
                  <td className="p-4 text-gray-700 dark:text-gray-300">{comp.name}</td>
                  <td className="p-4 font-mono font-bold text-green-600 dark:text-green-400">${comp.price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  لا توجد قطع مطابقة لعملية البحث.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}