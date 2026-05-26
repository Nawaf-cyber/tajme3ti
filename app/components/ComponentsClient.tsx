"use client";
import { useState } from 'react';
import Link from 'next/link';

// إضافة colorClass للتحكم بلون الشعار حسب مكانه (أزرق للفلتر، أخضر للأسعار)
const RiyalIcon = ({ size = 'h-4 w-4', colorClass = 'bg-emerald-500' }: { size?: string, colorClass?: string }) => (
  <div 
    className={`${size} ${colorClass} inline-block align-middle`} 
    style={{ 
      maskImage: "url('/riyal.svg')", 
      WebkitMaskImage: "url('/riyal.svg')", 
      maskSize: 'contain', 
      WebkitMaskSize: 'contain', 
      maskRepeat: 'no-repeat', 
      WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskPosition: 'center'
    }} 
  />
);

export default function ComponentsClient({ components, categories }: { components: any[], categories: any[] }) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [maxPrice, setMaxPrice] = useState(15000);

  // منطق الفلترة
  const filtered = components.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'all' || c.categoryId === selectedCat;
    const matchPrice = c.price <= maxPrice;
    return matchSearch && matchCat && matchPrice;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* قسم الفلاتر (الجانبي) */}
      <div className="w-full lg:w-72 shrink-0 h-fit lg:sticky lg:top-6">
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col gap-8">
          
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">تصفية القطع</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">البحث</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                placeholder="اسم القطعة أو الشركة..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/50 rounded-xl pr-11 pl-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">الفئة</label>
            <div className="relative">
              <select 
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all cursor-pointer"
              >
                <option value="all">جميع الفئات</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">أقصى سعر</label>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800/30">
                {maxPrice} <RiyalIcon size="h-3 w-3" colorClass="bg-blue-600 dark:bg-blue-400" />
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="15000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-bold">
              <span>0</span>
              <span>15,000</span>
            </div>
          </div>

        </div>
      </div>

      {/* قسم عرض البطاقات */}
      <div className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">لا توجد نتائج</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed">
              لم نتمكن من العثور على أي قطع تطابق الفلاتر المحددة. جرب تغيير كلمات البحث أو تخفيف الفلاتر.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((comp) => (
              <div key={comp.id} className="group relative bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                
                {/* قسم الصورة العلوية */}
                <div className="relative w-full h-52 bg-slate-50/50 dark:bg-[#0B1120]/50 p-6 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                  <img 
                    src={comp.imageUrl || `/images/${comp.categoryId}/boxed.png`} 
                    alt={comp.name} 
                    className="max-w-full max-h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                    {comp.category?.name}
                  </span>
                </div>

                {/* قسم تفاصيل القطعة */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4 flex-1">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">{comp.brand}</p>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2" title={comp.name}>
                      {comp.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-end justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">السعر</p>
                      <span className="font-black text-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        {comp.price} <RiyalIcon size="h-5 w-5" />
                      </span>
                    </div>
                    <Link href={`/components/${comp.id}`} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm rounded-xl transition-colors border border-slate-200 dark:border-slate-700">
                      التفاصيل
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}