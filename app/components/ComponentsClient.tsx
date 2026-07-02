"use client";
import { useState } from 'react';
import Link from 'next/link';
import { isComponentAvailable } from '../../lib/availability';

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

// دالة تلوين أسماء الماركات
const getBrandColor = (brand: string) => {
  if (!brand) return 'text-blue-600 dark:text-blue-400';
  const textToSearch = brand.toLowerCase();
  if (textToSearch.includes('amd') || textToSearch.includes('radeon')) return 'text-red-600 dark:text-red-500';
  if (textToSearch.includes('nvidia') || textToSearch.includes('geforce') || textToSearch.includes('rtx') || textToSearch.includes('gtx')) return 'text-emerald-600 dark:text-[#8ce600]';
  if (textToSearch.includes('intel')) return 'text-blue-600 dark:text-blue-500';
  return 'text-blue-600 dark:text-blue-400';
};

export default function ComponentsClient({ components, categories }: { components: any[], categories: any[] }) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [maxPrice, setMaxPrice] = useState(20000);
  
  const isFiltered = search !== '' || selectedCat !== 'all' || maxPrice !== 20000;

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCat('all');
    setMaxPrice(20000);
  };

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
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">تصفية القطع</h2>
            </div>
            
            {/* زر المسح يظهر فقط عند وجود فلاتر مفعلة */}
            {isFiltered && (
              <button 
                onClick={handleClearFilters}
                className="text-[15px] font-extrabold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-rose-100 dark:border-rose-900/30 active:scale-95"
                title="مسح جميع الفلاتر والبحث"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                إعادة تعيين
              </button>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">البحث</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                placeholder="اسم القطعة أو الشركة..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 rounded-2xl pr-11 pl-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 hover:border-blue-300 dark:hover:border-blue-700 outline-none transition-all placeholder:font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">الفئة</label>
            <div className="relative group">
              <select 
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 hover:border-blue-300 dark:hover:border-blue-700 outline-none transition-all cursor-pointer"
              >
                <option value="all">جميع الفئات</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex justify-between items-center mb-5">
              <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">أقصى سعر</label>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/30 shadow-sm">
                {maxPrice} <RiyalIcon size="h-3.5 w-3.5" colorClass="bg-emerald-600 dark:bg-emerald-400" />
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="20000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 hover:accent-blue-500 transition-all"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-wider">
              <span>0</span>
              <span>20,000</span>
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
            {filtered.map((comp) => {
              const available = isComponentAvailable(comp);
              return (
              <div key={comp.id} className={`group relative bg-white dark:bg-[#0F172A] border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col ${available ? 'border-slate-200 dark:border-slate-800/80' : 'border-amber-300 dark:border-amber-600/50'}`}>
                
                {/* قسم الصورة العلوية الموحد */}
                <div className="relative w-full h-56 bg-white p-6 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                  <img 
                    src={comp.imageUrl || `/images/${comp.categoryId}/boxed.png`} 
                    alt={comp.name} 
                    className="max-w-full max-h-full object-contain mix-blend-multiply filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                    {comp.category?.name}
                  </span>
                  {!available && (
                    <span className="absolute top-4 left-4 bg-amber-500/90 backdrop-blur-sm border border-amber-400 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      غير متوفر
                    </span>
                  )}
                </div>

                {/* قسم تفاصيل القطعة */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4 flex-1">
                    <p className={`text-[11px] font-black uppercase tracking-widest mb-2 ${getBrandColor(comp.brand)}`}>
                      {comp.brand}
                    </p>
                    {/* ارتفاع ثابت للعنوان h-14 لمنع تفاوت أطوال البطاقات */}
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug line-clamp-2 h-14" title={comp.name}>
                      {comp.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-end justify-between mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">السعر</p>
                      {available ? (
                        <span className="font-black text-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          {comp.price} <RiyalIcon size="h-5 w-5" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                        </span>
                      ) : (
                        <span className="font-black text-xl text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          {comp.price} <RiyalIcon size="h-5 w-5" colorClass="bg-amber-600 dark:bg-amber-400" />
                          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 mr-1">(غير متوفر حالياً)</span>
                        </span>
                      )}
                    </div>
                    
                    {/* زر التفاصيل الجديد (Premium) */}
                    <Link 
                      href={`/components/${comp.id}`} 
                      className="group/btn flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-blue-500/25 active:scale-95"
                    >
                      التفاصيل
                      <svg className="w-4 h-4 transition-transform group-hover/btn:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </Link>
                  </div>
                </div>

              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}