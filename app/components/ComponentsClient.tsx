"use client";
import { useState, useMemo, useEffect } from 'react';
import { brandColor } from '../../lib/brand';
import Link from 'next/link';
import { isAvailable, offerDeal } from '../../lib/stores';
import { formatPrice } from '../../lib/price';
import { specBadges as getSpecBadges } from '../../lib/spec-badges';
import SuggestPartCard from '../../components/SuggestPartCard';
import { productImage } from '../../lib/image';

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
/* لون العلامة صار من lib/brand — كانت أربع نسخ بأربع لوحات */

/* `startOnDeals` تُشغَّل من صفحة /deals: الواجهة نفسها بفلترٍ مفعّل مسبقاً.
   بُنيت الصفحة بإعادة الاستخدام لا بالنسخ — نسخةٌ ثانية من بطاقة القطعة
   تعني عيباً يُصلَح في واحدة ويعيش في الأخرى. */
export default function ComponentsClient({ components, categories, startOnDeals = false }: { components: any[], categories: any[], startOnDeals?: boolean }) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  /* ============ سقف شريط السعر ============
   *
   * كان الرقم ٢٠٬٠٠٠ مكتوباً في خمسة مواضع: الحالة الابتدائية، وشرط
   * «هل من فلتر مفعّل»، وزرّ المسح، وحدّ الشريط، والتسمية تحته.
   *
   * فكل قطعة أغلى من ٢٠٬٠٠٠ كانت **تختفي من الصفحة نهائياً** — ولا يملك
   * الزائر إظهارها لأن الشريط نفسه لا يتجاوز ذلك الحدّ. ظهر العطل فعلاً
   * حين دخل ROG Astral RTX 5090 بـ٢٤٬١٤٣ ﷼ فلم يُعرض إطلاقاً.
   *
   * الآن يُشتقّ من أغلى قطعة موجودة ويُقرَّب لأعلى ألف — فلا يشيخ الرقم
   * كلّما دخلت قطعة أغلى.
   */
  const priceCeiling = useMemo(() => {
    const top = Math.max(0, ...components.map((c) => Number(c.price) || 0));
    return Math.max(1000, Math.ceil(top / 1000) * 1000);
  }, [components]);

  const [maxPrice, setMaxPrice] = useState(priceCeiling);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [onlyDeals, setOnlyDeals] = useState(startOnDeals);

  /* نحسب الخصم مرّة واحدة لكل قطعة — الدالة مشتركة مع صفحة المنتج */
  const withDeals = useMemo(
    () => components.map(c => ({ ...c, _deal: offerDeal(c) })),
    [components]
  );

  const isFiltered = search !== '' || selectedCat !== 'all' || maxPrice !== priceCeiling || sortBy !== 'newest' || onlyDeals;

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCat('all');
    setMaxPrice(priceCeiling);
    setSortBy('newest');
    setOnlyDeals(false);
  };

  // الفلاتر الأساسية (بلا فلتر التخفيضات) — نحتاجها لحساب عدّاد الصفقات
  const baseFiltered = useMemo(() => withDeals.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q);
    const matchCat = selectedCat === 'all' || c.categoryId === selectedCat;
    const matchPrice = c.price <= maxPrice;
    return matchSearch && matchCat && matchPrice;
  }), [withDeals, search, selectedCat, maxPrice]);

  /* العدّاد يعكس ما ستراه لو فعّلت الزر — أي ضمن الفلاتر الحالية،
     لا إجمالي الموقع. رقم لا يطابق النتيجة يُفقد الثقة. */
  const dealsCount = useMemo(() => baseFiltered.filter(c => c._deal.pct > 0).length, [baseFiltered]);

  const filtered = useMemo(() => {
    const list = onlyDeals ? baseFiltered.filter(c => c._deal.pct > 0) : [...baseFiltered];
    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [baseFiltered, onlyDeals, sortBy]);

  /* ============ عرض تدريجي ============
     كانت الصفحة ترسم كل القطع دفعةً واحدة: مئات البطاقات ومئات طلبات
     الصور في التحميل الأول. البيانات نفسها خفيفة، فنُبقيها كاملة في
     الذاكرة (البحث والفرز وعدّاد الصفقات تعمل على الكل) ونرسم دفعةً
     فقط. اخترنا زراً صريحاً لا تمريراً لانهائياً: الأخير يمنع الوصول
     للفوتر ويُفقد موضعك عند الرجوع. */
  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // أي تغيير في الفلاتر يعيد العرض للبداية — وإلا بقيت على صفحة 5 لنتيجة من 3
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, selectedCat, maxPrice, sortBy, onlyDeals]);

  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visible.length;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* قسم الفلاتر (الجانبي) */}
      <div className="w-full lg:w-72 shrink-0 h-fit lg:sticky lg:top-6">
        {/* اللوحة نفسها التي تحمل البطاقات: حدٌّ سماويّ علويّ واستدارة ٤
            بكسل. كانت rounded-3xl بلا حدٍّ علويّ — صندوقٌ من صفحة أخرى
            يجاور بطاقاتٍ لغتها غيره. */}
        <div className="bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm p-6 rounded-sm border-x border-b border-t-2 border-slate-200 border-t-cyan-500/70 dark:border-slate-800/80 dark:border-t-cyan-500/70 shadow-sm flex flex-col gap-8">

          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/30 shadow-sm">
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
                className="text-[15px] font-extrabold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 border border-rose-100 dark:border-rose-900/30 active:scale-95"
                title="مسح جميع الفلاتر والبحث"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                إعادة تعيين
              </button>
            )}
          </div>

          <div>
            {/* عربيّ بلا tracking: التباعد يفصل حروفاً يجب أن تتّصل، و
                uppercase لا معنى له عليها. القاعدة في MicroLabel */}
            <label className="block text-[12px] font-bold text-slate-400 dark:text-slate-500 mb-3">البحث</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400 group-focus-within:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                placeholder="اسم القطعة أو الشركة..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 rounded-sm pr-11 pl-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/30 hover:border-cyan-300 dark:hover:border-cyan-700 outline-none transition-all placeholder:font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-slate-400 dark:text-slate-500 mb-3">الفئة</label>
            <div className="relative group">
              <select 
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 rounded-sm px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/30 hover:border-cyan-300 dark:hover:border-cyan-700 outline-none transition-all cursor-pointer"
              >
                <option value="all">جميع الفئات</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400 group-focus-within:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0B1120] p-4 rounded-sm border border-slate-200 dark:border-slate-700/60">
            <div className="flex justify-between items-center mb-5">
              <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400">أقصى سعر</label>
              {/* عند السقف لا حدّ فعلاً — و«بلا حدّ» أصدق من رقمٍ يوهم
                  الزائر أن هناك ما هو أغلى منه محجوب */}
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-sm border border-emerald-100 dark:border-emerald-800/30 shadow-sm">
                {maxPrice >= priceCeiling ? (
                  'بلا حدّ'
                ) : (
                  <>
                    {formatPrice(maxPrice)} <RiyalIcon size="h-3.5 w-3.5" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                  </>
                )}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={priceCeiling}
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-500 hover:accent-cyan-500 transition-all"
            />
            <div className="mt-3 flex justify-between text-[11px] font-bold text-slate-400 tabular-nums">
              <span>0</span>
              <span>{formatPrice(priceCeiling)}</span>
            </div>
          </div>

        </div>
      </div>

      {/* قسم عرض البطاقات */}
      <div className="flex-1">

        {/* ===== شريط الأدوات: الفرز + الصفقات + العدد ===== */}
        <div className="relative mb-6 flex flex-wrap items-center gap-3 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm p-3 rounded-sm border-t-2 border-t-cyan-500/70 border-x border-b border-slate-200 dark:border-slate-800/80 shadow-sm">

          {/* زر الصفقات — يظهر معطّلاً إن لم توجد تخفيضات، لا يُخفى */}
          <button
            onClick={() => dealsCount > 0 && setOnlyDeals(!onlyDeals)}
            disabled={dealsCount === 0}
            title={dealsCount === 0 ? 'لا توجد تخفيضات مرصودة حالياً' : 'اعرض القطع المخفّضة فقط'}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-black transition-all active:scale-95 border ${
              dealsCount === 0
                ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700/50 cursor-not-allowed'
                : onlyDeals
                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/40'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            عليها تخفيض
            <span className={`min-w-[22px] px-1.5 py-0.5 rounded-sm text-[11px] font-black font-mono tabular-nums ${
              dealsCount === 0
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                : onlyDeals
                ? 'bg-white/25 text-white'
                : 'bg-rose-500 text-white'
            }`}>
              {dealsCount}
            </span>
          </button>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700/60"></div>

          {/* الفرز */}
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-slate-400 dark:text-slate-500 ml-1">الترتيب</span>
            {([
              { key: 'newest', label: 'الأحدث', icon: null },
              { key: 'price-asc', label: 'الأرخص', icon: 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12' },
              { key: 'price-desc', label: 'الأغلى', icon: 'M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4' },
            ] as const).map(o => (
              <button
                key={o.key}
                onClick={() => setSortBy(o.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-sm text-[12px] font-bold transition-all active:scale-95 border ${
                  sortBy === o.key
                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm shadow-cyan-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:border-cyan-400 dark:hover:border-cyan-600'
                }`}
              >
                {o.icon && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={o.icon} />
                  </svg>
                )}
                {o.label}
              </button>
            ))}
          </div>

          {/* عدد النتائج — المعروض من الإجمالي كي يعرف أن هناك المزيد */}
          {/* tabular-nums بلا font-mono: الأرقام تصطفّ (وهو المطلوب) والعربية
              تبقى على خطّ الصفحة بدل السقوط إلى بديلٍ لا يحمل محارفها */}
          <span className="mr-auto text-[11.5px] font-bold text-slate-400 dark:text-slate-500 tabular-nums px-2">
            {remaining > 0 ? `${visible.length} من ${filtered.length} قطعة` : `${filtered.length} قطعة`}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm rounded-sm border-x border-b border-t-2 border-slate-200 border-t-cyan-500/70 dark:border-slate-800/80 dark:border-t-cyan-500/70 shadow-sm text-center">
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
            {visible.map((comp) => {
              const available = isAvailable(comp);
              // أهم 3 مواصفات — المنطق مشترك مع شريط التخفيضات في lib/spec-badges
              const specBadges = getSpecBadges(comp, 3);
              // كود القطعة المختصر من الـ id
              const partCode = comp.id.slice(-4).toUpperCase();

              return (
              <div key={comp.id} className={`group relative bg-gradient-to-b from-white/80 to-white/60 dark:from-[#0F172A]/70 dark:to-[#0B1120]/50 backdrop-blur-sm border-t-2 shadow-sm hover:shadow-xl hover:shadow-cyan-500/15 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden rounded-sm ${available ? 'border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800' : 'border-t-amber-500 border-x border-b border-amber-300 dark:border-amber-600/50'}`}>

                {/* زاوية هندسية علوية */}
                <div className={`absolute top-0 right-0 w-0 h-0 border-t-[14px] border-l-[14px] border-l-transparent z-20 ${available ? 'border-t-cyan-500/60' : 'border-t-amber-500/60'}`}></div>

                {/* رأس تقني: كود القطعة + الفئة */}
                <div className="flex justify-between items-center px-4 pt-3 pb-2">
                  <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 tracking-wider">#{partCode}</span>
                  <span className="font-mono text-[10px] font-black text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded-sm uppercase tracking-widest">
                    {comp.category?.name}
                  </span>
                </div>

                {/* الصورة (تبقى كما هي — الأهم للزبون) */}
                <div className="relative w-full h-52 bg-white mx-4 mb-1 rounded-sm flex items-center justify-center" style={{width:'calc(100% - 2rem)'}}>
                  {/* loading="lazy" — كانت كل الصور تُطلب فوراً عند التحميل */}
                  <img
                    src={productImage(comp.imageUrl, `/images/${comp.categoryId}/boxed.png`)}
                    alt={comp.name}
                    loading="lazy"
                    decoding="async"
                    className="max-w-full max-h-full object-contain p-4 mix-blend-multiply filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* شارة الخصم — أعلى يمين الصورة */}
                  {comp._deal.pct > 0 && (
                    <span className="absolute top-2 right-2 bg-rose-500 text-white text-[11px] font-black px-2 py-1 rounded-sm shadow-md shadow-rose-500/40 font-mono tabular-nums z-10">
                      ‎-{comp._deal.pct}%
                    </span>
                  )}
                  {/* بلا font-mono: الخطّ الأحادي لا يحمل محارف عربية
                      فيسقط «غير متوفر» إلى خطٍّ بديل غير خطّ الصفحة */}
                  {!available && (
                    <span className="absolute top-2 left-2 bg-amber-500/90 backdrop-blur-sm text-white text-[10.5px] font-black px-2 py-1 rounded-sm shadow-sm flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      غير متوفر
                    </span>
                  )}
                </div>

                {/* قسم التفاصيل */}
                <div className="p-4 flex flex-col flex-1">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 font-mono ${brandColor(comp.brand)}`}>
                    {comp.brand}
                  </p>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug line-clamp-2 h-11 mb-3" title={comp.name}>
                    {comp.name}
                  </h3>

                  {/* شارات المواصفات السريعة */}
                  {specBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {specBadges.map((b, i) => (
                        <span key={i} className="font-mono text-[12px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-1 rounded-sm border border-slate-200 dark:border-slate-700/50">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* السعر + الزر: خط فاصل حاد */}
                  <div className="flex items-end justify-between mt-2 pt-4 border-t border-slate-100 dark:border-cyan-500/10">
                    <div>
                      <p className="text-[12px] text-slate-400 font-bold mb-1">السعر</p>
                      {available ? (
                        <>
                          <span className="font-black text-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            {formatPrice(comp.price)} <RiyalIcon size="h-5 w-5" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                          </span>
                          {/* السعر قبل الخصم — مشطوباً */}
                          {comp._deal.pct > 0 && comp._deal.listPrice && (
                            <span className="block text-[12px] font-bold text-slate-400 dark:text-slate-500 line-through mt-0.5 font-mono" dir="ltr">
                              {formatPrice(comp._deal.listPrice)}
                            </span>
                          )}
                        </>
                      ) : comp.price > 0 ? (
                        <span className="font-black text-xl text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          {formatPrice(comp.price)} <RiyalIcon size="h-5 w-5" colorClass="bg-amber-600 dark:bg-amber-400" />
                          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 mr-1">(غير متوفر حالياً)</span>
                        </span>
                      ) : (
                        /* ⚠️ سعرُ صفرٍ ليس سعراً. كان يُعرض «0 ﷼» حرفياً — وهو
                           رقمٌ يقرأه المشتري ثمناً. القطعة تصل هذه الحال حين
                           يُحذف عرضٌ كان يشير إلى منتجٍ آخر، فيبقى السعر بلا
                           مصدر: فيُقال إنه غير معروف بدل أن يُختلق. */
                        <span className="font-black text-sm text-slate-400 dark:text-slate-500">
                          غير متوفر — لا سعر مسجّل
                        </span>
                      )}
                    </div>
                    
                    {/* زر التفاصيل الجديد (Premium) */}
                    <Link 
                      href={`/components/${comp.id}`} 
                      className="group/btn flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-[#052e37] font-bold text-sm rounded-sm transition-all shadow-sm shadow-cyan-500/20 hover:shadow-md hover:shadow-cyan-500/40 active:scale-95"
                    >
                      التفاصيل
                      <svg className="w-4 h-4 transition-transform group-hover/btn:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </Link>
                    <Link 
                      href={`/compare?ids=${comp.id}`}
                      className="flex items-center justify-center w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 dark:hover:bg-cyan-500 text-slate-600 dark:text-slate-400 hover:text-white rounded-sm transition-all active:scale-95"
                      title="قارن هذه القطعة"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </Link>
                  </div>
                </div>

              </div>
              );
            })}
          </div>
        )}

        {/* ===== تحميل المزيد ===== */}
        {remaining > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              className="group flex items-center gap-2.5 px-8 py-3.5 rounded-sm bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700/60 text-sm font-black text-slate-700 dark:text-slate-200 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 transition-all active:scale-95"
            >
              <svg className="w-4 h-4 text-cyan-500 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              تحميل المزيد
              <span className="font-mono text-[11px] font-black text-slate-400 dark:text-slate-500 tabular-nums">
                (+{Math.min(PAGE_SIZE, remaining)})
              </span>
            </button>

            {/* شريط تقدّم بصري: كم رأيت من الإجمالي */}
            <div className="w-40 h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                style={{ width: `${(visible.length / filtered.length) * 100}%` }}
              ></div>
            </div>
            <span className="text-[11.5px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">
              بقيت {remaining} قطعة
            </span>
          </div>
        )}

        {/* ===== اقترح قطعة ناقصة ===== */}
        <SuggestPartCard source="components" className="mt-8" />
      </div>
    </div>
  );
}