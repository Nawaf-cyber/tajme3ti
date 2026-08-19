'use client';
export const dynamic = 'force-dynamic';
import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import WorkInProgress from './WorkInProgress';
import IntentPicker from './IntentPicker';
import BuildTuner from './BuildTuner';
import { Sk, SkSelectCard } from './loading-ui';
import SuggestPartCard from './SuggestPartCard';

/* ملاحظة: IntentPicker (الذكاء) لا يزال مؤجّلاً حتى تجهز واجهته.
   buildPlans و USE_PROFILE محفوظان أدناه لإعادة وصله بسطر واحد.
   BuildTuner (خصّص تجميعتك) مُفعّل. */
import { toPng } from 'html-to-image';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { isAvailable, liveOffers, type Offer } from '../lib/stores';
import { buildStoreUrl, storeLinkProps } from '../lib/affiliate';
import { productImage } from '../lib/image';
import RichDescription from './RichDescription';
import SpecSheet from './SpecSheet';
import {
  boardFitsCase, fitReason, psuFitsCase, psuFitReason,
  coolerFitsCase, coolerFitReason, coolerFitsCpu, coolerCpuReason,
} from '../lib/fit';

type Component = {
  id: string;
  name: string;
  brand: string;
  price: number;
  tdpWattage: number;
  specs: any;
  imageUrl?: string | null;
  offers?: Offer[] | null;
  description?: string | null;
  performanceTier?: number | null;
};

type Category = {
  id: string;
  name: string;
  components: Component[];
};

type ComponentWithCompatibility = Component & {
  isCompatible: boolean;
  reason?: string;
};

/* ============ روابط العمولة ============
   ⚠️ كانت هنا نسخة مكرّرة من منطق بناء الروابط بمعرّفات ممرّرة من الصفحة.
   الآن معرّف كل متجر يأتي مع عرضه من جدول Store، فيبنى الرابط من مصدر
   واحد (buildStoreUrl) بلا تمرير معرّفات عبر الخصائص. */

type TierPlan = {
  key: 'value' | 'balanced' | 'strong';
  label: string;
  note: string;
  total: number;
  picks: Record<string, any>;
};

/* ---- عروض المتاجر لقطعة: المتوفّر فقط، الأرخص أولاً ----
   كانت ثلاث كتل بأسماء متاجر مكتوبة يدوياً؛ الآن من عروض القطعة مباشرة
   فأي متجر يضيفه الأدمن يظهر هنا بلونه واسمه بلا تعديل. */
const getStoreOffers = (comp: Component) => liveOffers(comp.offers);

const RiyalIcon = ({ size = 'h-4 w-4', colorClass = 'bg-emerald-700 dark:bg-emerald-400' }: { size?: string, colorClass?: string }) => (
  <div 
    className={`${size} ${colorClass} inline-block shrink-0 align-middle`} 
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


const getBrandColor = (comp: Component, categoryName: string) => {
  if (categoryName !== 'CPU' && categoryName !== 'GPU') return 'text-cyan-700 dark:text-cyan-400';
  
  const textToSearch = `${comp.brand} ${comp.name}`.toLowerCase();
  
  if (textToSearch.includes('amd') || textToSearch.includes('radeon')) {
    return 'text-red-700 dark:text-red-500';
  }
  if (textToSearch.includes('nvidia') || textToSearch.includes('geforce') || textToSearch.includes('rtx') || textToSearch.includes('gtx')) {
    return 'text-emerald-700 dark:text-[#8ce600]'; 
  }
  if (textToSearch.includes('intel')) {
    return 'text-cyan-700 dark:text-cyan-500'; 
  }
  
  return 'text-slate-800 dark:text-slate-200'; 
};

// مكون شريط الطاقة
const PowerMeter = ({ totalTdp, psuWattage }: { totalTdp: number, psuWattage: number }) => {
  const percentage = psuWattage > 0 ? Math.min((totalTdp / psuWattage) * 100, 100) : 0;
  const headroom = psuWattage > 0 ? psuWattage - totalTdp : 0;
  const headroomPct = psuWattage > 0 ? Math.round((headroom / psuWattage) * 100) : 0;
  // هامش ضيّق: المقياس يمرّ لكن أقل من 20% احتياطاً — تحذير لا خطأ
  const tightMargin = psuWattage > 0 && percentage > 80 && percentage <= 100;

  return (
    <div className="w-full mt-4 bg-slate-50 dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
      <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
        ⚡ استهلاك القطع مقابل سعة المزوّد
      </h4>

      {/* المسار: مناطق أمان خافتة + تعبئة فعلية + علامة 80% */}
      <div className="relative h-4 rounded-lg bg-slate-200 dark:bg-slate-800" dir="ltr">
        {/* مناطق الأمان (خلفية خافتة): أخضر ← أصفر ← أحمر */}
        <div
          className="absolute inset-0 rounded-lg opacity-25"
          style={{ background: 'linear-gradient(90deg,#10b981 0%,#10b981 62%,#f59e0b 80%,#ef4444 100%)' }}
        ></div>
        {/* التعبئة الفعلية */}
        <div
          className="absolute top-0 left-0 h-full rounded-lg transition-all duration-700"
          style={{
            width: `${percentage}%`,
            background: percentage > 85
              ? 'linear-gradient(90deg,#10b981 0%,#f59e0b 60%,#ef4444 100%)'
              : percentage > 70
              ? 'linear-gradient(90deg,#10b981 0%,#10b981 55%,#f59e0b 100%)'
              : 'linear-gradient(90deg,#10b981,#34d399)',
          }}
        ></div>
        {/* علامة حدّ الأمان 80% */}
        {psuWattage > 0 && (
          <div className="absolute -top-1.5 -bottom-1.5 w-0.5 bg-amber-500" style={{ left: '80%' }}>
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-amber-500 whitespace-nowrap">
              80%
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4 text-[11px] font-bold text-slate-500 dark:text-slate-400">
        <span>{totalTdp}W مستهلكة</span>
        <span>{psuWattage ? `سعة المزوّد ${psuWattage}W` : 'لم يُحدَّد مزوّد'}</span>
      </div>

      {/* تحذير الهامش الضيّق — التجميعة تمرّ لكن بلا احتياط كافٍ */}
      {tightMargin && (
        <div className="mt-4 flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/40">
          <span className="w-7 h-7 shrink-0 rounded-lg bg-amber-900/60 text-amber-400 flex items-center justify-center text-sm font-black">!</span>
          <div className="min-w-0">
            <p className="text-[13px] font-black text-amber-600 dark:text-amber-400">
              هامش الطاقة ضيّق: {headroom}W فقط ({headroomPct}%).
            </p>
            <p className="text-[11.5px] text-amber-700/80 dark:text-amber-500/70 font-semibold mt-1 leading-relaxed">
              التجميعة تعمل، لكن مزوّداً أعلى سعةً يمنحك أماناً أطول عمراً ومساحةً للترقية. لا نوصي بهامش أقل من 20%.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---- أيقونة ورمز مختصر لكل فئة ---- */
const CATEGORY_META: Record<string, { icon: string; short: string }> = {
  'CPU':         { icon: '🔲', short: 'CPU' },
  'Motherboard': { icon: '🔳', short: 'MB' },
  'GPU':         { icon: '🎮', short: 'GPU' },
  'RAM':         { icon: '📊', short: 'RAM' },
  'Storage':     { icon: '💾', short: 'SSD' },
  'PSU':         { icon: '⚡', short: 'PSU' },
  'Case':        { icon: '🗄️', short: 'CASE' },
  'Cooler':      { icon: '❄️', short: 'COOL' },
};
const getCatMeta = (name: string) => CATEGORY_META[name] || { icon: '🔧', short: name.slice(0, 4).toUpperCase() };

/* ---- شارة ثانوية: TDP أو المقبس أو السعة — معلومة مفيدة كانت مخفية ---- */
const getQuickSpec = (comp: Component, categoryName: string): string | null => {
  const sp: any = (typeof comp.specs === 'string' ? (() => { try { return JSON.parse(comp.specs); } catch { return {}; } })() : comp.specs) || {};
  if (categoryName === 'Motherboard') return sp.socket || null;
  if (categoryName === 'RAM') return sp.type || null;
  if (categoryName === 'PSU') return sp.wattage ? `${sp.wattage}W` : null;
  if (comp.tdpWattage) return `${comp.tdpWattage}W`;
  if (categoryName === 'CPU') return sp.socket || null;
  return null;
};

const SearchableSelect = ({ 
  categoryName, 
  components, 
  selectedComponent, 
  onSelect, 
  onRemove,
  onShowDetails,
  showIncompatible
}: { 
  categoryName: string, 
  components: ComponentWithCompatibility[], 
  selectedComponent: Component | null, 
  onSelect: (id: string) => void,
  onRemove: () => void,
  onShowDetails: (comp: Component) => void,
  showIncompatible: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let processed = components.filter(c => 
    `${c.brand} ${c.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortBy === 'price-asc') {
    processed.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    processed.sort((a, b) => b.price - a.price);
  }

  const displayedComponents = showIncompatible 
    ? [...processed].sort((a, b) => Number(b.isCompatible) - Number(a.isCompatible))
    : processed.filter(c => c.isCompatible);

  return (
    <div className={`relative w-full min-w-0 transition-all ${isOpen ? 'z-50' : 'z-10'}`} ref={wrapperRef}>
      {(() => {
        const meta = getCatMeta(categoryName);
        const avail = selectedComponent ? isAvailable(selectedComponent) : true;
        const quickSpec = selectedComponent ? getQuickSpec(selectedComponent, categoryName) : null;
        const compatCount = components.filter(c => c.isCompatible).length;

        return (
          <div
            className={`relative overflow-hidden rounded-2xl border p-3.5 transition-all ${
              isOpen
                ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-white dark:bg-[#0F172A]'
                : selectedComponent
                ? (avail
                    ? 'border-emerald-500/40 bg-white dark:bg-[#0F172A] hover:border-cyan-500/50 hover:-translate-y-0.5'
                    : 'border-amber-500/50 bg-white dark:bg-[#0F172A] hover:border-cyan-500/50 hover:-translate-y-0.5')
                : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0F172A] hover:border-cyan-500/50'
            }`}
          >
            {/* الشريط الجانبي الملوّن: أخضر=سليمة، أصفر=تحذير */}
            {selectedComponent && (
              <div className={`absolute top-0 right-0 bottom-0 w-[3px] ${avail ? 'bg-gradient-to-b from-emerald-500 to-emerald-400' : 'bg-amber-500'}`}></div>
            )}

            {/* الرأس: الفئة + شارة الحالة */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[13px]">{meta.icon}</span>
                <span className="text-[11px] font-black tracking-[2px] text-slate-400 dark:text-slate-500">{categoryName}</span>
              </div>
              {selectedComponent ? (
                avail ? (
                  <span className="text-[9px] font-black px-2.5 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700">✓ متوفر</span>
                ) : (
                  <span className="text-[9px] font-black px-2.5 py-1 rounded-lg text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700">⚠ غير متوفر</span>
                )
              ) : (
                <span className="text-[9px] font-black px-2.5 py-1 rounded-lg text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700">لم تُختر</span>
              )}
            </div>

            {/* الجسم */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
              {/* الصورة داخل البطاقة */}
              {selectedComponent?.imageUrl ? (
                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center shrink-0">
                  <img src={productImage(selectedComponent.imageUrl)} alt={selectedComponent.name} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-600 text-xl font-light">
                  ＋
                </div>
              )}

              <div className="flex-1 min-w-0">
                {selectedComponent ? (
                  <>
                    <div className={`text-[9px] font-black tracking-[1.5px] mb-0.5 ${getBrandColor(selectedComponent, categoryName)}`}>
                      {selectedComponent.brand}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug truncate">
                      {selectedComponent.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        {selectedComponent.price} <RiyalIcon size="h-3 w-3" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                      </span>
                      {quickSpec && (
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {quickSpec}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[13px] font-bold text-slate-500 dark:text-slate-400">اختر {categoryName}</div>
                    {compatCount > 0 && (
                      <div className="mt-1.5">
                        <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded">
                          {compatCount} خيار متوافق
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* الإجراءات */}
              <div className="flex gap-1.5 shrink-0">
                {selectedComponent && (
                  <>
                    <a
                      href={`/compare?ids=${selectedComponent.id}`}
                      onClick={(e) => e.stopPropagation()}
                      title="قارن هذه القطعة"
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    </a>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(); }}
                      title="إزالة القطعة"
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            </div>

            {/* تنبيه عدم التوفّر */}
            {selectedComponent && !avail && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/[0.08] border border-amber-500/40 text-[10.5px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                نفدت من كل المتاجر — السعر قد يكون قديماً
              </div>
            )}
          </div>
        );
      })()}

      {isOpen && (
        <div className="absolute w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-[350px] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="relative mb-2">
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                className="w-full pl-3 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400"
                placeholder={`ابحث في ${categoryName}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
            
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setSortBy('default'); }}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-colors ${sortBy === 'default' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                الافتراضي
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setSortBy('price-asc'); }}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${sortBy === 'price-asc' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                الأرخص
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setSortBy('price-desc'); }}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${sortBy === 'price-desc' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" /></svg>
                الأغلى
              </button>
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {displayedComponents.length > 0 ? (
              displayedComponents.map((comp) => (
                <li 
                  key={comp.id} 
                  className={`p-3 mb-1 rounded-lg transition-all border cursor-pointer ${
                    comp.isCompatible 
                      ? 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50' 
                      : 'border-rose-200 bg-rose-50 hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-900/10 dark:hover:bg-rose-900/30 opacity-95'
                  }`}
                  onClick={() => {
                    onSelect(comp.id);
                    setIsOpen(false);
                    setSearchTerm('');
                    setSortBy('default');
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start w-full gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        {comp.imageUrl && (
                          <div className="w-8 h-8 rounded bg-white dark:bg-slate-900 p-0.5 shrink-0 border border-slate-200 dark:border-slate-700/50">
                            <img src={productImage(comp.imageUrl)} alt="" className="w-full h-full object-contain" />
                          </div>
                        )}
                        <span className={`text-sm font-bold leading-tight ${comp.isCompatible ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                          <span className={`${getBrandColor(comp, categoryName)} mr-1`}>{comp.brand}</span>
                          {comp.name}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-sm font-black flex items-center gap-1 ${comp.isCompatible ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                          {comp.price} <RiyalIcon size="h-3 w-3" colorClass={comp.isCompatible ? 'bg-emerald-700 dark:bg-emerald-400' : 'bg-slate-500'} />
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onShowDetails(comp); }}
                          className="px-2.5 py-1 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded transition-colors"
                        >
                          التفاصيل
                        </button>
                      </div>
                    </div>
                    {!comp.isCompatible && (
                      <span className="text-[11px] mt-1 text-rose-700 dark:text-rose-400 font-extrabold bg-rose-100 dark:bg-rose-900/40 px-2.5 py-1 rounded-md w-fit inline-flex items-center gap-1 border border-rose-200 dark:border-rose-800/50">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {comp.reason} (سيتم إلغاء المتعارض)
                      </span>
                    )}
                    {!isAvailable(comp) && (
                      <span className="text-[11px] mt-1 text-amber-700 dark:text-amber-400 font-extrabold bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 rounded-md w-fit inline-flex items-center gap-1 border border-amber-200 dark:border-amber-800/50">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        غير متوفر حالياً
                      </span>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="p-6 text-slate-500 text-center text-sm font-bold">لا توجد قطع مطابقة للبحث</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ============ خلفيات الألعاب: رسومات أصلية (ظلال + أجواء) ============
   مرسومة من الصفر — لا لقطات ولا شخصيات محمية. ملكيتها للموقع. */

const CyberpunkArt = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>
      <linearGradient id="ga-cyb-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a1650"/><stop offset="0.55" stopColor="#180d33"/><stop offset="1" stopColor="#0d0720"/>
      </linearGradient>
      <linearGradient id="ga-cyb-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.45" stopColor="#0d0720" stopOpacity="0"/><stop offset="1" stopColor="#0d0720" stopOpacity="0.92"/>
      </linearGradient>
      <radialGradient id="ga-cyb-glow" cx="0.5" cy="0.35" r="0.6">
        <stop offset="0" stopColor="#e879f9" stopOpacity="0.35"/><stop offset="1" stopColor="#e879f9" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <rect width="260" height="300" fill="url(#ga-cyb-sky)"/>
    <ellipse cx="130" cy="100" rx="120" ry="80" fill="url(#ga-cyb-glow)"/>
    <g opacity="0.85">
      <rect x="0" y="150" width="30" height="150" fill="#1c1040"/>
      <rect x="34" y="110" width="36" height="190" fill="#241455"/>
      <rect x="74" y="135" width="26" height="165" fill="#180d38"/>
      <rect x="104" y="88" width="40" height="212" fill="#2a1863"/>
      <rect x="148" y="120" width="30" height="180" fill="#1c1040"/>
      <rect x="182" y="142" width="26" height="158" fill="#241455"/>
      <rect x="212" y="105" width="32" height="195" fill="#1f1248"/>
      <rect x="248" y="130" width="12" height="170" fill="#180d38"/>
    </g>
    <rect x="104" y="84" width="40" height="3.5" fill="#e879f9"/>
    <rect x="34" y="106" width="36" height="3" fill="#fde047"/>
    <rect x="212" y="101" width="32" height="3" fill="#22d3ee"/>
    <g fill="#fde047" opacity="0.9">
      <rect x="8" y="162" width="4" height="5"/><rect x="18" y="180" width="4" height="5"/><rect x="8" y="204" width="4" height="5"/>
      <rect x="42" y="122" width="4" height="5"/><rect x="56" y="140" width="4" height="5"/><rect x="42" y="164" width="4" height="5"/><rect x="56" y="192" width="4" height="5"/>
      <rect x="112" y="100" width="5" height="6"/><rect x="128" y="118" width="5" height="6"/><rect x="112" y="146" width="5" height="6"/><rect x="128" y="176" width="5" height="6"/>
      <rect x="156" y="132" width="4" height="5"/><rect x="166" y="156" width="4" height="5"/>
      <rect x="220" y="118" width="4" height="5"/><rect x="232" y="142" width="4" height="5"/><rect x="220" y="170" width="4" height="5"/>
    </g>
    <g fill="#22d3ee" opacity="0.7">
      <rect x="88" y="150" width="4" height="5"/><rect x="80" y="176" width="4" height="5"/>
      <rect x="190" y="154" width="4" height="5"/><rect x="198" y="180" width="4" height="5"/>
    </g>
    <rect x="0" y="252" width="260" height="2.5" fill="#e879f9" opacity="0.75"/>
    <g transform="translate(130,0)">
      <path d="M-46 300 L-46 262 Q-44 236 -26 228 L-14 223 Q-20 216 -20 205 Q-20 196 -14 190 L-15 181 L-9 186 L-6 176 L-2 185 L4 175 L7 186 L13 180 L12 190 Q18 196 18 205 Q18 216 12 223 L24 228 Q42 236 44 262 L44 300 Z"
        fill="none" stroke="#e879f9" strokeWidth="3" opacity="0.55" transform="translate(2,-2)"/>
      <path d="M-46 300 L-46 262 Q-44 236 -26 228 L-14 223 Q-20 216 -20 205 Q-20 196 -14 190 L-15 181 L-9 186 L-6 176 L-2 185 L4 175 L7 186 L13 180 L12 190 Q18 196 18 205 Q18 216 12 223 L24 228 Q42 236 44 262 L44 300 Z"
        fill="#08040f"/>
      <path d="M-26 232 Q0 244 26 232" stroke="#fde047" strokeWidth="2" fill="none" opacity="0.8"/>
    </g>
    <rect width="260" height="300" fill="url(#ga-cyb-fade)"/>
  </svg>
);

const WarzoneArt = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>
      <linearGradient id="ga-wz-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#20351f"/><stop offset="0.55" stopColor="#12210f"/><stop offset="1" stopColor="#0a1408"/>
      </linearGradient>
      <linearGradient id="ga-wz-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.45" stopColor="#0a1408" stopOpacity="0"/><stop offset="1" stopColor="#0a1408" stopOpacity="0.92"/>
      </linearGradient>
      <radialGradient id="ga-wz-sun" cx="0.72" cy="0.22" r="0.35">
        <stop offset="0" stopColor="#facc15" stopOpacity="0.4"/><stop offset="1" stopColor="#facc15" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <rect width="260" height="300" fill="url(#ga-wz-sky)"/>
    <circle cx="188" cy="66" r="70" fill="url(#ga-wz-sun)"/>
    <circle cx="188" cy="66" r="17" fill="#facc15" opacity="0.55"/>
    <g fill="#0d1a0b" opacity="0.9">
      <path d="M36 40 L74 40 L82 45 L74 50 L36 50 L30 45 Z"/>
      <rect x="48" y="34" width="5" height="7"/>
      <rect x="60" y="34" width="5" height="7"/>
    </g>
    <g opacity="0.95">
      <path d="M96 66 Q112 50 128 66 L123 70 Q112 60 101 70 Z" fill="#facc15"/>
      <line x1="101" y1="70" x2="110" y2="88" stroke="#facc15" strokeWidth="1.2"/>
      <line x1="123" y1="70" x2="114" y2="88" stroke="#facc15" strokeWidth="1.2"/>
      <circle cx="112" cy="91" r="3.6" fill="#0d1a0b" stroke="#facc15" strokeWidth="1"/>
    </g>
    <g opacity="0.75" transform="translate(46,28) scale(0.72)">
      <path d="M96 66 Q112 50 128 66 L123 70 Q112 60 101 70 Z" fill="#4ade80"/>
      <line x1="101" y1="70" x2="110" y2="88" stroke="#4ade80" strokeWidth="1.2"/>
      <line x1="123" y1="70" x2="114" y2="88" stroke="#4ade80" strokeWidth="1.2"/>
      <circle cx="112" cy="91" r="3.4" fill="#0d1a0b" stroke="#4ade80" strokeWidth="1"/>
    </g>
    <polygon points="0,300 60,150 130,300" fill="#173d1c" opacity="0.55"/>
    <polygon points="150,300 215,120 300,300" fill="#123317" opacity="0.6"/>
    <path d="M0 218 Q 130 196 260 222" stroke="#4ade80" strokeWidth="1" fill="none" opacity="0.28"/>
    <path d="M0 246 Q 130 228 260 248" stroke="#4ade80" strokeWidth="1" fill="none" opacity="0.18"/>
    <path d="M0 300 L0 270 Q 70 254 140 264 Q 205 272 260 260 L260 300 Z" fill="#061007"/>
    <g transform="translate(150,0)" fill="#04120a">
      <path d="M-8 172 Q-8 162 0 160 Q9 162 9 172 L9 178 L-8 178 Z"/>
      <path d="M-13 178 L11 178 Q17 182 17 196 L15 232 L11 232 L11 264 L4 264 L3 236 L-4 236 L-5 264 L-12 264 L-12 232 L-16 232 L-18 196 Q-18 182 -13 178 Z"/>
      <path d="M-16 190 L-34 200 L-32 208 L-14 200 Z"/>
      <path d="M15 192 L30 186 L31 192 L17 199 Z"/>
      <path d="M-38 197 L34 183 L35 189 L20 193 L20 199 L14 199 L14 194 L-36 204 Z"/>
      <rect x="-30" y="202" width="4" height="9" transform="rotate(-10 -28 206)"/>
      <path d="M11 184 L22 186 L22 214 L13 214 Z"/>
    </g>
    <ellipse cx="150" cy="262" rx="42" ry="9" fill="#4ade80" opacity="0.14"/>
    <rect width="260" height="300" fill="url(#ga-wz-fade)"/>
  </svg>
);

const ValorantArt = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>
      <linearGradient id="ga-val-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#33121f"/><stop offset="0.55" stopColor="#1e0b14"/><stop offset="1" stopColor="#12070c"/>
      </linearGradient>
      <linearGradient id="ga-val-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.45" stopColor="#12070c" stopOpacity="0"/><stop offset="1" stopColor="#12070c" stopOpacity="0.92"/>
      </linearGradient>
    </defs>
    <rect width="260" height="300" fill="url(#ga-val-sky)"/>
    <polygon points="0,300 78,54 150,300" fill="#ff4655" opacity="0.16"/>
    <polygon points="104,300 186,26 274,300" fill="#0ee6c3" opacity="0.11"/>
    <polygon points="-44,300 34,116 96,300" fill="#ff4655" opacity="0.11"/>
    <line x1="14" y1="20" x2="246" y2="196" stroke="#ff4655" strokeWidth="1.4" opacity="0.32"/>
    <line x1="60" y1="6" x2="260" y2="160" stroke="#0ee6c3" strokeWidth="1" opacity="0.28"/>
    <line x1="-10" y1="60" x2="200" y2="220" stroke="#ff4655" strokeWidth="0.8" opacity="0.22"/>
    <g opacity="0.5" stroke="#ff4655" transform="translate(64,84)">
      <circle r="24" fill="none" strokeWidth="1.5"/>
      <circle r="3.5" fill="#ff4655" stroke="none"/>
      <line x1="0" y1="-34" x2="0" y2="-14" strokeWidth="1.5"/>
      <line x1="0" y1="14" x2="0" y2="34" strokeWidth="1.5"/>
      <line x1="-34" y1="0" x2="-14" y2="0" strokeWidth="1.5"/>
      <line x1="14" y1="0" x2="34" y2="0" strokeWidth="1.5"/>
    </g>
    <g transform="translate(158,0)">
      <g fill="none" stroke="#0ee6c3" strokeWidth="2.5" opacity="0.5" transform="translate(-2,-2)">
        <path d="M-30 300 L-30 262 Q-28 238 -12 230 L-4 226 Q-10 218 -10 208 Q-10 197 0 194 Q10 197 10 208 Q10 218 4 226 L12 230 Q26 236 28 258 L28 300"/>
      </g>
      <g fill="#0a0508">
        <path d="M-10 208 Q-10 196 0 193 Q10 196 10 208 Q10 219 3 226 L-4 226 Q-10 219 -10 208 Z"/>
        <path d="M8 199 Q30 188 46 196 Q34 200 26 210 Q20 218 10 216 Z"/>
        <path d="M-12 230 L12 230 Q22 236 24 256 L22 300 L-22 300 L-26 258 Q-24 238 -12 230 Z"/>
        <path d="M-12 236 L-30 214 L-25 209 L-8 230 Z"/>
        <path d="M-30 214 L-46 186 Q-40 190 -35 190 L-27 208 Z"/>
      </g>
      <path d="M-31 212 L-48 184 Q-42 188 -37 188 L-28 207 Z" fill="#1a1013" stroke="#ff4655" strokeWidth="1.4" opacity="0.9"/>
      <line x1="-33" y1="207" x2="-44" y2="189" stroke="#ff8a94" strokeWidth="1" opacity="0.7"/>
      <path d="M12 232 Q20 237 23 250" stroke="#ff4655" strokeWidth="2" fill="none" opacity="0.7"/>
    </g>
    <ellipse cx="158" cy="296" rx="44" ry="8" fill="#ff4655" opacity="0.12"/>
    <rect width="260" height="300" fill="url(#ga-val-fade)"/>
  </svg>
);

const GAME_ART: Record<string, FC> = {
  cyb: CyberpunkArt,
  wz: WarzoneArt,
  val: ValorantArt,
};

const FpsEstimator = ({ cpuTier, gpuTier }: { cpuTier: number, gpuTier: number }) => {
  const gpuBasePower: Record<number, number> = {
    1: 120, 
    2: 180, 
    3: 270, 
    4: 380, 
    5: 550  
  };

  const baseScore = gpuBasePower[gpuTier] || 120;

  const resMultipliers: Record<string, number> = {
    '1080p': 1.0,
    '1440p': 0.70,
    '4K': 0.45
  };

  /* ---- هوية بصرية لكل لعبة ----
     تدرّجات لونية تحاكي هوية كل لعبة بلا صور محمية بحقوق نشر.
     لو أردت صوراً حقيقية لاحقاً: ضع صورة مرخّصة في public/images/games/
     واكتب مسارها في bgImage — الكود يعرضها تلقائياً بدل التدرّج.
     ⚠️ لا تستخدم صوراً من الويب: لقطات الألعاب محمية، وAdSense يفحص ذلك. */
  const gameMultipliers: Record<string, any> = {
    esports: {
      name: 'Valorant',
      mult: 3.0,
      icon: '🎯',
      bgImage: '',
      artKind: 'val',
      cardBorder: 'border-[#ff4655]/40 hover:shadow-[#ff4655]/25',
      accent: 'text-[#ff6b7d]',
    },
    competitive: {
      name: 'Warzone',
      mult: 0.9,
      icon: '🪂',
      bgImage: '',
      artKind: 'wz',
      cardBorder: 'border-green-500/40 hover:shadow-green-500/25',
      accent: 'text-green-400',
    },
    aaa: {
      name: 'Cyberpunk',
      mult: 0.45,
      icon: '🌃',
      bgImage: '',
      artKind: 'cyb',
      cardBorder: 'border-yellow-400/40 hover:shadow-yellow-400/25',
      accent: 'text-yellow-300',
    }
  };

  const generateDynamicData = () => {
    const result: any = { data: {} };
    
    if (gpuTier >= 5) result.recommended = '4K';
    else if (gpuTier >= 3) result.recommended = '1440p';
    else result.recommended = '1080p';

    ['1080p', '1440p', '4K'].forEach(res => {
      result.data[res] = {};
      
      let cpuPenalty = 0;
      const tierDiff = gpuTier - cpuTier;
      if (tierDiff > 0) {
        if (res === '1080p') cpuPenalty = tierDiff * 0.15;
        if (res === '1440p') cpuPenalty = tierDiff * 0.08;
        if (res === '4K') cpuPenalty = tierDiff * 0.02;
      }

      Object.entries(gameMultipliers).forEach(([type, game]) => {
        const rawFps = baseScore * resMultipliers[res] * game.mult;
        let finalFps = rawFps * (1 - cpuPenalty);

        finalFps = Math.round(finalFps / 5) * 5;
        if (finalFps > 500) finalFps = 500;

        let quality = '';
        if (type === 'aaa') {
          if (res === '1080p') quality = gpuTier > 3 ? ' (Ultra RT)' : ' (High)';
          else if (res === '1440p') quality = gpuTier > 3 ? ' (Ultra)' : ' (Med)';
          else quality = gpuTier >= 4 ? ' (High)' : ' (Low)';
        }

        result.data[res][type] = {
          name: game.name + quality,
          fps: `${finalFps}+`,
          icon: game.icon,
          bgImage: game.bgImage,
          artKind: game.artKind,
          cardBorder: game.cardBorder,
          accent: game.accent
        };
      });
    });

    return result;
  };

  const tierData = generateDynamicData();
  const [activeRes, setActiveRes] = useState<string>(tierData.recommended);

  useEffect(() => {
    setActiveRes(tierData.recommended);
  }, [cpuTier, gpuTier]);

  return (
    <div className="mt-6 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/30 shadow-sm relative">
      <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          الأداء المتوقع في الألعاب
        </h4>
        
        <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-lg">
          {['1080p', '1440p', '4K'].map(res => {
            const isRecommended = tierData.recommended === res;
            return (
              <button
                key={res}
                onClick={() => setActiveRes(res)}
                title={isRecommended ? "الدقة المثالية لقوة جهازك" : `عرض الأداء على دقة ${res}`}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  activeRes === res
                    ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {res} {isRecommended && '★'}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3">
        {Object.entries(tierData.data[activeRes]).map(([type, data]: any) => {
          const Art = data.artKind ? GAME_ART[data.artKind] : null;
          return (
            <div
              key={type}
              className={`relative overflow-hidden text-center flex flex-col justify-end group rounded-2xl border min-h-[190px] pb-4 px-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${data.cardBorder}`}
            >
              {/* الخلفية: صورة مرخّصة إن وُفّرت، وإلا الرسم الأصلي */}
              {data.bgImage ? (
                <>
                  <img
                    src={data.bgImage}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                </>
              ) : Art ? (
                <div className="absolute inset-0 group-hover:scale-[1.03] transition-transform duration-500 origin-bottom">
                  <Art />
                </div>
              ) : null}

              {/* المحتوى */}
              <div className="relative z-10 flex flex-col items-center">
                <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${data.accent}`} style={{ textShadow: '0 0 12px currentColor' }}>{data.name}</span>
                <span className="text-3xl font-black text-white tabular-nums mt-1" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>{data.fps}</span>
                <span className="text-[9px] font-bold tracking-[0.3em] text-slate-300/80">FPS</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          الأرقام تقريبية وتعتمد على إعدادات الجودة وتقنيات (DLSS/FSR).
        </span>
        <span className="hidden sm:block text-slate-300 dark:text-slate-700">|</span>
        <span className="text-[10px] text-cyan-500 dark:text-cyan-400 font-bold flex items-center gap-1">
          <span className="text-sm leading-none">★</span> تشير إلى دقة الشاشة المثالية لجهازك.
        </span>
      </div>
    </div>
  );
};

export default function PCBuilderClient({ categories, importedSelections = {} }: { categories: Category[], importedSelections?: Record<string, string> }) {
  // نطبّق معرّفات لوحة الإدارة قبل أي رسم — الروابط تُبنى أثناء الرسم
  const { data: session } = useSession();
  const router = useRouter(); 
  const [editModeId, setEditModeId] = useState<string | null>(null); 
  const [buildName, setBuildName] = useState(""); 
  const [selectedComponents, setSelectedComponents] = useState<Record<string, Component | null>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initializeBuilder = () => {
      const hasImported = Object.keys(importedSelections || {}).length > 0;
      const params = new URLSearchParams(window.location.search);
      
      const editId = params.get('editId');
      if (editId) setEditModeId(editId);
      
      const editName = params.get('editName');
      if (editName) setBuildName(editName);
      
      const hasUrlParams = categories.some(cat => params.has(cat.name.toLowerCase()));

      let freshSelections: Record<string, Component | null> = {};

      if (hasUrlParams) {
        categories.forEach(cat => {
          const compId = params.get(cat.name.toLowerCase());
          freshSelections[cat.name] = compId ? (cat.components.find(c => c.id === compId) || null) : null;
        });
      } else if (hasImported) {
        categories.forEach(cat => {
          const id = importedSelections[cat.id];
          freshSelections[cat.name] = id ? (cat.components.find(c => c.id === id) || null) : null;
        });
      } else {
        const savedBuild = localStorage.getItem('draft_pc_build');
        if (savedBuild) {
          try {
            const parsed = JSON.parse(savedBuild);
            categories.forEach(cat => {
              const savedComp = parsed[cat.name];
              freshSelections[cat.name] = (savedComp?.id) 
                ? (cat.components.find(c => c.id === savedComp.id) || null) 
                : null;
            });
          } catch (e) {
            categories.forEach(cat => freshSelections[cat.name] = null);
          }
        } else {
          categories.forEach(cat => freshSelections[cat.name] = null);
        }
      }

      setSelectedComponents(freshSelections);
      setIsLoaded(true);
    };

    initializeBuilder();
  }, [categories, importedSelections]);

  useEffect(() => {
    if (!isLoaded) return;
    
    localStorage.setItem('draft_pc_build', JSON.stringify(selectedComponents));
    
    const params = new URLSearchParams();
    
    if (editModeId) params.set('editId', editModeId);
    if (buildName && editModeId) params.set('editName', buildName);

    Object.entries(selectedComponents).forEach(([cat, comp]) => {
      if (comp) params.set(cat.toLowerCase(), comp.id);
    });

    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [selectedComponents, isLoaded, editModeId, buildName]);

  const [result, setResult] = useState<{ 
    status: 'success' | 'error' | 'idle' | 'incomplete', 
    message: string, 
    missingCategories?: string[],
    bottleneck?: { title: string, desc: string, color: string, bg: string, suggestions?: { category: string, item: Component }[] } | null, 
    totalTdp: number, 
    totalPrice: number 
  }>({ status: 'idle', message: '', totalTdp: 0, totalPrice: 0 });
  
  const [detailsModal, setDetailsModal] = useState<{ comp: Component, categoryName: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [showIncompatible, setShowIncompatible] = useState(false);
  const [aiPlans, setAiPlans] = useState<TierPlan[] | null>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded) checkCompatibility();
  }, [selectedComponents, isLoaded]);

  const parseSpecs = (specsStr: any) => {
    if (!specsStr) return {};
    return typeof specsStr === 'string' ? JSON.parse(specsStr) : specsStr;
  };

  const handleSelect = (categoryName: string, componentId: string) => {
    const category = categories.find(c => c.name === categoryName);
    const component = category?.components.find(c => c.id === componentId) || null;
    if (!component) return;

    const specs = parseSpecs(component.specs);
    
    let newSelections = { ...selectedComponents, [categoryName]: component };
    let toastMessage = "";

    if (categoryName === 'CPU' && selectedComponents['Motherboard']) {
      const moboSpecs = parseSpecs(selectedComponents['Motherboard']!.specs);
      if (specs.socket && moboSpecs.socket && String(specs.socket) !== String(moboSpecs.socket)) {
        newSelections['Motherboard'] = null;
        toastMessage = 'تم إزالة اللوحة الأم السابقة لتغيير مقبس المعالج';
      }
    }
    else if (categoryName === 'Motherboard') {
      if (selectedComponents['CPU']) {
        const cpuSpecs = parseSpecs(selectedComponents['CPU']!.specs);
        if (specs.socket && cpuSpecs.socket && String(specs.socket) !== String(cpuSpecs.socket)) {
          newSelections['CPU'] = null;
          toastMessage = 'تم إزالة المعالج السابق لعدم توافقه مع اللوحة الجديدة';
        }
      }
      if (selectedComponents['RAM']) {
        const ramSpecs = parseSpecs(selectedComponents['RAM']!.specs);
        if (specs.ramType && ramSpecs.type && String(specs.ramType) !== String(ramSpecs.type)) {
          newSelections['RAM'] = null;
          toastMessage = toastMessage 
            ? toastMessage + ' والرام أيضاً' 
            : 'تم إزالة الرام السابق لعدم التوافق مع اللوحة الجديدة';
        }
      }
    }
    else if (categoryName === 'RAM' && selectedComponents['Motherboard']) {
      const moboSpecs = parseSpecs(selectedComponents['Motherboard']!.specs);
      if (specs.type && moboSpecs.ramType && String(specs.type) !== String(moboSpecs.ramType)) {
        newSelections['Motherboard'] = null;
        toastMessage = 'تم إزالة اللوحة الأم لتغيير نوع الرام';
      }
    }
    else if (categoryName === 'GPU' && selectedComponents['Case']) {
      const caseSpecs = parseSpecs(selectedComponents['Case']!.specs);
      if (specs.lengthMm && caseSpecs.maxGpuLength && parseFloat(specs.lengthMm) > parseFloat(caseSpecs.maxGpuLength)) {
        newSelections['Case'] = null;
        toastMessage = 'تم إزالة الكيس لأن الكرت الجديد أطول من المساحة المتاحة';
      }
    }
    else if (categoryName === 'Case' && selectedComponents['GPU']) {
      const gpuSpecs = parseSpecs(selectedComponents['GPU']!.specs);
      if (specs.maxGpuLength && gpuSpecs.lengthMm && parseFloat(gpuSpecs.lengthMm) > parseFloat(specs.maxGpuLength)) {
        newSelections['GPU'] = null;
        toastMessage = 'تم إزالة الكرت لأن الكيس الجديد مساحته أصغر';
      }
    }

    /* مقاس اللوحة: تغيير أحدهما قد يُبطل الآخر — فيُزال المُبطَل بدل أن
       تبقى تجميعةٌ مستحيلة معروضة على أنها سليمة */
    if (categoryName === 'Case' && selectedComponents['Motherboard']) {
      const moboSpecs = parseSpecs(selectedComponents['Motherboard']!.specs);
      if (!boardFitsCase(moboSpecs.formFactor, specs.formFactor)) {
        newSelections['Motherboard'] = null;
        toastMessage = `تم إزالة اللوحة (${moboSpecs.formFactor}) لأنها لا تدخل كيساً من نوع ${specs.formFactor}`;
      }
    }
    if (categoryName === 'Motherboard' && selectedComponents['Case']) {
      const caseSpecs = parseSpecs(selectedComponents['Case']!.specs);
      if (!boardFitsCase(specs.formFactor, caseSpecs.formFactor)) {
        newSelections['Case'] = null;
        toastMessage = `تم إزالة الكيس (${caseSpecs.formFactor}) لأنه لا يتّسع للوحة ${specs.formFactor}`;
      }
    }

    /* ============ المبرّد: يُزال ولا يُزيل ============
       ⚠️ عمداً في اتجاهٍ واحد. المبرّد قطعةٌ **اختيارية** يُغيّرها المستخدم
       آخراً، فإسقاط كيسٍ أو معالجٍ اختاره بعناية لأجل مبرّد يقلب الأولوية.
       أمّا العكس — تغيير الكيس أو المعالج — فيُسقط المبرّد لأنه التابع. */
    const chosenCooler = selectedComponents['Cooler'];
    if (chosenCooler && categoryName !== 'Cooler') {
      const k = parseSpecs(chosenCooler.specs);

      if (categoryName === 'Case' && !coolerFitsCase(k.type, k.sizeMm, specs.maxCoolerHeight, specs.radiatorSupport)) {
        newSelections['Cooler'] = null;
        toastMessage = toastMessage
          ? toastMessage + ' والمبرّد أيضاً'
          : `تم إزالة المبرّد (${k.sizeMm}مم) لأنه لا يدخل الكيس الجديد`;
      }

      if (categoryName === 'CPU' && !coolerFitsCpu(k.sockets, specs.socket)) {
        newSelections['Cooler'] = null;
        toastMessage = toastMessage
          ? toastMessage + ' والمبرّد أيضاً'
          : `تم إزالة المبرّد لأنه لا يدعم مقبس ${specs.socket}`;
      }
    }

    setSelectedComponents(newSelections);
    
    if (toastMessage) {
      toast(toastMessage, { icon: '🔄' });
    }
  };

  const handleRemove = (categoryName: string) => {
    setSelectedComponents(prev => ({ ...prev, [categoryName]: null }));
  };

  const getComponentsWithCompatibility = (categoryName: string, components: Component[]): ComponentWithCompatibility[] => {
    const cpu = selectedComponents['CPU'];
    const mobo = selectedComponents['Motherboard'];
    const ram = selectedComponents['RAM'];
    const gpu = selectedComponents['GPU'];
    const pcCase = selectedComponents['Case'];

    return components.map(comp => {
      const specs = parseSpecs(comp.specs);
      let isCompatible = true;
      let reason = "";

      if (categoryName === 'Motherboard') {
        if (cpu) {
          const cpuSpecs = parseSpecs(cpu.specs);
          if (specs.socket && cpuSpecs.socket && String(specs.socket) !== String(cpuSpecs.socket)) {
            isCompatible = false;
            reason = `المعالج المختار يتطلب مقبس ${cpuSpecs.socket}`;
          }
        }
        if (isCompatible && ram) {
          const ramSpecs = parseSpecs(ram.specs);
          if (specs.ramType && ramSpecs.type && String(specs.ramType) !== String(ramSpecs.type)) {
            isCompatible = false;
            reason = `الرام المختار من نوع ${ramSpecs.type} واللوحة تدعم ${specs.ramType}`;
          }
        }
      }
      
      if (categoryName === 'CPU' && mobo) {
        const moboSpecs = parseSpecs(mobo.specs);
        if (specs.socket && moboSpecs.socket && String(specs.socket) !== String(moboSpecs.socket)) {
          isCompatible = false;
          reason = `اللوحة الأم الحالية بمقبس ${moboSpecs.socket} فقط`;
        }
      }
      
      if (categoryName === 'RAM' && mobo) {
        const moboSpecs = parseSpecs(mobo.specs);
        if (specs.type && moboSpecs.ramType && String(specs.type) !== String(moboSpecs.ramType)) {
          isCompatible = false;
          reason = `اللوحة الأم تدعم رامات ${moboSpecs.ramType} فقط`;
        }
      }
      
      if (categoryName === 'Case' && gpu) {
        const gpuSpecs = parseSpecs(gpu.specs);
        if (specs.maxGpuLength && gpuSpecs.lengthMm && parseFloat(specs.maxGpuLength) < parseFloat(gpuSpecs.lengthMm)) {
          isCompatible = false;
          reason = `طول الكرت الحالي (${gpuSpecs.lengthMm}mm) يتجاوز مساحة الكيس (${specs.maxGpuLength}mm)`;
        }
      }

      /* ============ مقاس اللوحة مقابل الكيس ============
         لم يكن يُفحص إطلاقاً: تختار لوحة ATX وكيس Mini-ITX فيقول
         «متوافق». والكيس يقبل مقاسه وما دونه لا ما فوقه — انظر lib/fit */
      if (categoryName === 'Case' && mobo) {
        const moboSpecs = parseSpecs(mobo.specs);
        if (!boardFitsCase(moboSpecs.formFactor, specs.formFactor)) {
          isCompatible = false;
          reason = `اللوحة المختارة من مقاس ${moboSpecs.formFactor} ولا تدخل كيساً من نوع ${specs.formFactor}`;
        }
      }

      if (categoryName === 'Motherboard' && isCompatible && pcCase) {
        const caseSpecs = parseSpecs(pcCase.specs);
        if (!boardFitsCase(specs.formFactor, caseSpecs.formFactor)) {
          isCompatible = false;
          reason = `الكيس المختار (${caseSpecs.formFactor}) لا يتّسع للوحة من مقاس ${specs.formFactor}`;
        }
      }

      /* مقاس المزوّد: كيسات SFF تقبل SFX وحدها، وهو ما لا يظهر من الحجم */
      if (categoryName === 'PSU' && pcCase) {
        const caseSpecs = parseSpecs(pcCase.specs);
        if (!psuFitsCase(specs.formFactor, caseSpecs.psuFormFactor)) {
          isCompatible = false;
          reason = `الكيس يقبل مزوّدات ${caseSpecs.psuFormFactor} فقط`;
        }
      }

      if (categoryName === 'Case' && isCompatible && selectedComponents['PSU']) {
        const psuSpecs = parseSpecs(selectedComponents['PSU']!.specs);
        if (!psuFitsCase(psuSpecs.formFactor, specs.psuFormFactor)) {
          isCompatible = false;
          reason = `يقبل مزوّدات ${specs.psuFormFactor} والمزوّد المختار ${psuSpecs.formFactor}`;
        }
      }

      if (categoryName === 'GPU' && pcCase) {
        const caseSpecs = parseSpecs(pcCase.specs);
        if (specs.lengthMm && caseSpecs.maxGpuLength && parseFloat(specs.lengthMm) > parseFloat(caseSpecs.maxGpuLength)) {
          isCompatible = false;
          reason = `طول الكرت (${specs.lengthMm}mm) لا يتسع داخل الكيس (${caseSpecs.maxGpuLength}mm)`;
        }
      }

      /* ============ المبرّد ============
         قيدان لا واحد: المقبس (عضويّة في مجموعة) والمقاس (عمودٌ يختاره
         النوع). ويُفحصان في الاتجاهين — تصفّح المبرّدات بعد اختيار الكيس،
         وتصفّح الكيسات بعد اختيار المبرّد. */
      if (categoryName === 'Cooler') {
        if (cpu) {
          const cpuSpecs = parseSpecs(cpu.specs);
          if (!coolerFitsCpu(specs.sockets, cpuSpecs.socket)) {
            isCompatible = false;
            reason = coolerCpuReason(specs.sockets, cpuSpecs.socket) || '';
          }
        }
        if (isCompatible && pcCase) {
          const caseSpecs = parseSpecs(pcCase.specs);
          if (!coolerFitsCase(specs.type, specs.sizeMm, caseSpecs.maxCoolerHeight, caseSpecs.radiatorSupport)) {
            isCompatible = false;
            reason = coolerFitReason(specs.type, specs.sizeMm, caseSpecs.maxCoolerHeight, caseSpecs.radiatorSupport) || '';
          }
        }
      }

      const cooler = selectedComponents['Cooler'];

      if (categoryName === 'Case' && isCompatible && cooler) {
        const cSpecs = parseSpecs(cooler.specs);
        if (!coolerFitsCase(cSpecs.type, cSpecs.sizeMm, specs.maxCoolerHeight, specs.radiatorSupport)) {
          isCompatible = false;
          reason = `المبرّد المختار (${cSpecs.sizeMm}مم) لا يدخل هذا الكيس`;
        }
      }

      if (categoryName === 'CPU' && isCompatible && cooler) {
        const cSpecs = parseSpecs(cooler.specs);
        if (!coolerFitsCpu(cSpecs.sockets, specs.socket)) {
          isCompatible = false;
          reason = `المبرّد المختار لا يدعم مقبس ${specs.socket}`;
        }
      }

      return { ...comp, isCompatible, reason };
    });
  };

  /* ============ ملفّات الاستخدام ============
     المستوى (اقتصادي/متوازن/قوي) = **مستوى أداء مستهدف**، لا شريحة سعرية.
     كان التصميم السابق يقصّ الكتالوج بشرائح مئوية من السعر، فأنتج تناقضات:
     "قوي" أغلى بآلاف بلا ترقية، و1440p يعطي كرتاً أضعف من 1080p.
     الآن كل مستوى يستهدف performanceTier محدّداً، والدقة ترفع المستوى
     المستهدف واحتياج الذاكرة — فالسلّم مضمون بالبناء لا بالحظّ.

     gpuStep: إزاحة مستوى الكرت لهذا الاستخدام (سالب = يكفيه أقل).
     cpuBias: إزاحة مستوى المعالج نسبةً لمستوى الكرت (+ = المعالج أهم). */
  const USE_PROFILE: Record<string, {
    label: string;
    gpuStep: number;         // إزاحة مستوى الكرت المستهدف
    cpuBias: number;         // إزاحة مستوى المعالج نسبةً للكرت
    ramMinGB: number;        // السعة المطلوبة للرام
    ramCapGB: number;        // سقف سعة الرام (999 = بلا سقف)
    prefNvme: boolean;       // يفضّل NVMe سريعاً
    vramHeavy: boolean;      // الذاكرة الرسومية حاسمة (ألعاب ثقيلة/مونتاج)
    gpuCap: number;          // سقف مستوى الكرت (5 = بلا سقف)
    cpuCap: number;          // سقف مستوى المعالج
    cpuFloor: number;        // أدنى مستوى معالج مقبول
    cpuPref: 'x3d' | 'cores' | 'balanced'; // نوع المعالج المفضّل
    storageWeight: number;   // وزن التخزين في شريحة المستوى
    reason: string;          // قالب جملة السبب
  }> = {
    'competitive-shooter': { label: 'شوتر تنافسي', gpuStep:  0, cpuBias:  1, ramMinGB: 16, ramCapGB: 32,  prefNvme: true,  vramHeavy: false, gpuCap: 4, cpuCap: 5, cpuFloor: 3, cpuPref: 'x3d',      storageWeight: 0.7, reason: 'مناسبة لألعاب الشوتر التنافسي بأعلى فريمات ممكنة' },
    'aaa-gaming':          { label: 'ألعاب ثقيلة',  gpuStep:  0, cpuBias: -1, ramMinGB: 16, ramCapGB: 32,  prefNvme: true,  vramHeavy: true,  gpuCap: 5, cpuCap: 4, cpuFloor: 3, cpuPref: 'balanced', storageWeight: 0.8, reason: 'مناسبة للألعاب الثقيلة بإعدادات عالية' },
    'casual-gaming':       { label: 'ألعاب خفيفة',  gpuStep: -1, cpuBias:  0, ramMinGB: 16, ramCapGB: 16,  prefNvme: false, vramHeavy: false, gpuCap: 2, cpuCap: 3, cpuFloor: 1, cpuPref: 'balanced', storageWeight: 0.7, reason: 'مناسبة للألعاب الخفيفة والاستخدام اليومي' },
    'editing':             { label: 'مونتاج وتصميم', gpuStep: 0, cpuBias:  1, ramMinGB: 32, ramCapGB: 999, prefNvme: true,  vramHeavy: true,  gpuCap: 5, cpuCap: 5, cpuFloor: 4, cpuPref: 'cores',    storageWeight: 1.3, reason: 'مناسبة لتحرير الفيديو والتصميم بذاكرة كبيرة وتخزين سريع' },
    'streaming':           { label: 'بث مباشر',     gpuStep:  0, cpuBias:  1, ramMinGB: 32, ramCapGB: 32,  prefNvme: true,  vramHeavy: false, gpuCap: 4, cpuCap: 5, cpuFloor: 4, cpuPref: 'cores',    storageWeight: 0.9, reason: 'مناسبة للبث المباشر مع اللعب بسلاسة' },
    'office':              { label: 'مكتبي ودراسة', gpuStep: -1, cpuBias:  0, ramMinGB: 16, ramCapGB: 16,  prefNvme: true,  vramHeavy: false, gpuCap: 2, cpuCap: 3, cpuFloor: 1, cpuPref: 'balanced', storageWeight: 1.0, reason: 'مناسبة للأعمال المكتبية والدراسة والتصفّح' },
    'mixed':               { label: 'استخدام متنوّع', gpuStep: 0, cpuBias:  0, ramMinGB: 16, ramCapGB: 64,  prefNvme: true,  vramHeavy: false, gpuCap: 5, cpuCap: 5, cpuFloor: 3, cpuPref: 'balanced', storageWeight: 0.9, reason: 'مناسبة للاستخدام المتنوّع بين الألعاب والمهام' },
  };

  /* ---- قراءة آمنة للمواصفات (المفاتيح غير موحّدة في الكتالوج) ---- */
  const specVal = (sp: any, keys: string[]) => { for (const k of keys) if (sp?.[k] != null) return sp[k]; return null; };
  const specNum = (v: any) => { if (v == null) return 0; const m = String(v).match(/[\d.]+/); return m ? parseFloat(m[0]) : 0; };

  /* ---- ذاكرة الكرت: بعض القطع سعتها مفقودة في القاعدة (RX 6600 XT / 6700 XT)
     فنقرؤها من الاسم بدل أن تُحسب صفراً فتُظلم القطعة في الترشيح. ---- */
  const vramOf = (c: any): number => {
    const direct = specNum(specVal(parseSpecs(c.specs), ['vram', 'VRAM']));
    if (direct > 0) return direct;
    const m = String(c.name || '').match(/(\d+)\s*GB/i);
    return m ? parseFloat(m[1]) : 0;
  };

  /* ============ بناء ثلاثة مستويات من الكتالوج الحقيقي ============
     يُستدعى بعد أن يفهم المساعد النيّة. النموذج لا يلمس هذا إطلاقاً —
     كل قطعة هنا موجودة ومتوفّرة في كتالوجنا بسعرها الفعلي. */
  const applyPlan = (plan: TierPlan) => {
    setSelectedComponents(plan.picks as any);
    setAiPlans(null);
    toast.success(`تم بناء تجميعة ${plan.label} — ${Math.round(plan.total)} ﷼`, { icon: '✨' });
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  /* ============ بناء المستويات من الكتالوج الحقيقي ============
     ثوابت مضمونة بالبناء (وليست مأمولة):
     ١) صعود المستوى يرفع مستوى الكرت أو يساويه — أبداً لا يخفضه.
     ٢) رفع الدقة يرفع المستوى المستهدف واحتياج الذاكرة — أبداً لا يخفضهما.
     ٣) داخل المستوى: أفضل ما يلبّي الاحتياج، لا أغلى قطعة.
     ٤) خطة تُعرض فقط إن كانت ترقية حقيقية عن سابقتها — فلا "أغلى بلا فائدة".
     النموذج لا يلمس هذا إطلاقاً؛ كل قطعة موجودة ومتوفّرة بسعرها الفعلي. */
  const buildPlans = (intent: any): TierPlan[] | null => {
    const profile = USE_PROFILE[intent.use] || USE_PROFILE['mixed'];
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    const pool = (name: string) => [...(categories.find(c => c.name === name)?.components || [])]
      .filter(isAvailable)
      .sort((a, b) => a.price - b.price);

    const res = intent.resolution || '1080p';
    /* الدقة ترفع المستوى المستهدف واحتياج الذاكرة. و4K يرفع سقف الكرت درجة:
       حتى الشوتر يحتاج كرتاً أقوى على 4K، وكان السقف الثابت يمنع ذلك. */
    const resBump = res === '4K' ? 2 : res === '1440p' ? 1 : 0;
    const vramNeed = res === '4K' ? 16 : res === '1440p' ? 12 : 8;
    const gpuCapEff = res === '4K' ? Math.min(5, profile.gpuCap + 1) : profile.gpuCap;

    /* السقوف تُطبّق أولاً: "ألعاب خفيفة" لا تتجاوز كرت مستوى 2 مهما كان المستوى.
       المستوى المجهول (null) يُستبعد — لا يخترق السقف بصمت. */
    const gpusAll = pool('GPU').filter(c => c.performanceTier != null && c.performanceTier <= gpuCapEff);
    const cpuInRange = pool('CPU').filter(c => c.performanceTier != null && c.performanceTier >= profile.cpuFloor && c.performanceTier <= profile.cpuCap);
    let cpusAll = cpuInRange.length ? cpuInRange : pool('CPU').filter(c => c.performanceTier != null && c.performanceTier <= profile.cpuCap);
    /* ---- تفضيل الشركة (اختياري) ----
       نُطبّقه كتصفية، وإن أفرغ المجموعة نتجاهله بدل أن نفشل:
       تفضيل المستخدم لا يجوز أن يمنع ظهور أي تجميعة. */
    const byBrand = (arr: any[], brand?: string | null) => {
      if (!brand) return arr;
      const f = arr.filter(c => String(c.brand || '').toLowerCase() === brand.toLowerCase());
      return f.length ? f : arr;
    };
    const gpusBrandFiltered = byBrand(gpusAll, intent.gpuBrand);
    cpusAll = byBrand(cpusAll, intent.cpuBrand);

    /* الشوتر: ذاكرة 3D V-Cache هي محرّك الفريمات — إن توفّر X3D نقصر عليه.
       ⚠️ يأتي **بعد** تصفية الشركة عن قصد: X3D حصري لـAMD، فلو سبق التفضيل
       لأُلغي اختيار المستخدم لـIntel صامتاً. تفضيله الصريح يفوز على
       اجتهادنا، ونعطيه أفضل معالج ألعاب داخل شركته. */
    if (profile.cpuPref === 'x3d') {
      const x3ds = cpusAll.filter(c => /x3d/i.test(String(c.name || '')));
      if (x3ds.length) cpusAll = x3ds;
    }

    const mobos = pool('Motherboard');
    const ramCapped = pool('RAM').filter(c => {
      const gb = specNum(specVal(parseSpecs(c.specs), ['capacity', 'Capacity']));
      return gb > 0 && gb <= profile.ramCapGB;
    });
    const rams = ramCapped.length ? ramCapped : pool('RAM');
    const psus = pool('PSU');
    const cases = pool('Case');
    // قرص النظام لا يكون HDD — يطابق دليل SSD مقابل HDD
    const storages = pool('Storage').filter(st => {
      const t = String(parseSpecs(st.specs).type || '').toUpperCase();
      return t.includes('NVME') || t.includes('SSD');
    });

    if (!gpusAll.length || !cpusAll.length || !mobos.length || !rams.length || !psus.length || !cases.length || !storages.length) {
      return null;
    }

    const gpusPool = gpusBrandFiltered;
    const gTiers = [...new Set(gpusPool.map(c => c.performanceTier as number))].sort((a, b) => a - b);
    const cTiers = [...new Set(cpusAll.map(c => c.performanceTier as number))].sort((a, b) => a - b);
    const gLo = gTiers[0], gHi = gTiers[gTiers.length - 1];
    const cLo = cTiers[0], cHi = cTiers[cTiers.length - 1];

    /* مجموعة المستوى المستهدف؛ إن كان فارغاً نوسّع للأقرب صعوداً ثم هبوطاً */
    const poolAtTier = (arr: any[], target: number, lo: number, hi: number) => {
      for (let d = 0; d <= 5; d++) {
        for (const t of (d === 0 ? [target] : [target + d, target - d])) {
          if (t < lo || t > hi) continue;
          const p = arr.filter(c => c.performanceTier === t);
          if (p.length) return p;
        }
      }
      return arr;
    };

    const priceRank = (arr: any[], c: any) => {
      const s = [...arr].sort((a, b) => a.price - b.price);
      const i = s.findIndex(x => x.id === c.id);
      return s.length > 1 ? i / (s.length - 1) : 0.5;
    };

    const bandPick = (arr: any[], scorer: (c: any) => number, band: [number, number]) => {
      if (!arr.length) return null;
      const s = [...arr].sort((a, b) => a.price - b.price);
      const lo = Math.floor(s.length * band[0]);
      const hi = Math.max(lo + 1, Math.ceil(s.length * band[1]));
      const slice = s.slice(lo, hi);
      return (slice.length ? slice : s).sort((a, b) => scorer(b) - scorer(a))[0];
    };

    /* القوّة = المستوى ثم الذاكرة. السعر وكيل رديء للأداء في كتالوج
       أسعاره مضطربة (كرت قديم قد يكون أغلى من أحدث منه). */
    const gStrength = (c: any) => (c.performanceTier ?? 0) * 1000 + vramOf(c);
    const cStrength = (c: any) => (c.performanceTier ?? 0) * 100000 + c.price;

    const LEVELS: { key: TierPlan['key']; label: string; base: number; band: [number, number] }[] = [
      { key: 'value', label: 'اقتصادي', base: 2, band: [0.00, 0.40] },
      { key: 'balanced', label: 'متوازن', base: 3, band: [0.30, 0.70] },
      { key: 'strong', label: 'قوي', base: 4, band: [0.60, 1.00] },
    ];

    const plans: TierPlan[] = [];
    let lastGpuTier = -Infinity, lastGpuStrength = -Infinity, lastCpuTier = -Infinity;

    for (const L of LEVELS) {
      const picks: Record<string, any> = {};

      /* ---- الكرت ---- */
      let tGpu = clamp(L.base + resBump + profile.gpuStep, gLo, gHi);
      if (tGpu < lastGpuTier) tGpu = lastGpuTier;                 // سلّم لا يهبط
      const gPool = poolAtTier(gpusPool, tGpu, gLo, gHi);

      /* داخل المستوى: نرشّح ما يلبّي احتياج الذاكرة، ثم نتدرّج بالطموح.
         السقف نسبة من أرخص كافٍ في نفس المستوى — يمنع الوصول إلى أغلى
         كرت في الفئة (5090) بلا داعٍ. */
      const adequate = gPool.filter(c => vramOf(c) >= vramNeed);
      let gSrc = [...(adequate.length ? adequate : gPool)].sort((a, b) => a.price - b.price);
      const notWeaker = gSrc.filter(c => gStrength(c) >= lastGpuStrength);
      if (notWeaker.length) gSrc = notWeaker;
      const capMult = L.key === 'value' ? 1.0 : L.key === 'balanced' ? 1.45 : 2.0;
      const inBudget = gSrc.filter(c => c.price <= gSrc[0].price * capMult);
      const gList = inBudget.length ? inBudget : gSrc;
      // أعلى ذاكرة ضمن السقف، والأرخص عند التعادل — لا الأغلى
      picks['GPU'] = L.key === 'value'
        ? gList[0]
        : [...gList].sort((a, b) => (vramOf(b) - vramOf(a)) || (a.price - b.price))[0];

      /* ---- المعالج: يتبع مستوى الكرت لتفادي الاختناق ----
         4K ينقل الثقل للكرت فيكفي معالج أقل؛ 1080p يحتاج معالجاً أقوى. */
      const resCpuBias = res === '4K' ? -1 : res === '1440p' ? 0 : 1;
      const streamBias = intent.alsoStreams ? 1 : 0;
      const gpuTier = (picks['GPU'].performanceTier ?? L.base) as number;
      const antiBottleneck = Math.max(cLo, gpuTier - 1);   // لا نسمح باختناق فاضح
      let tCpu = clamp(gpuTier + profile.cpuBias + resCpuBias + streamBias, antiBottleneck, cHi);
      if (tCpu < lastCpuTier) tCpu = lastCpuTier;
      const cPool = poolAtTier(cpusAll, tCpu, cLo, cHi);

      const scoreCpu = (c: any) => {
        const sp = parseSpecs(c.specs);
        const coreScore = Math.min(1, (specNum(sp.cores) + specNum(sp.threads) / 2) / 40);
        const value = 1 - priceRank(cPool, c);
        if (profile.cpuPref === 'x3d') return (/x3d/i.test(String(c.name || '')) ? 0.5 : 0) + value * 0.4 + coreScore * 0.1;
        if (profile.cpuPref === 'cores') return coreScore * 0.6 + value * 0.4;
        return value * 0.6 + coreScore * 0.4;
      };
      picks['CPU'] = [...cPool].sort((a, b) => scoreCpu(b) - scoreCpu(a))[0];

      lastGpuTier = picks['GPU'].performanceTier ?? lastGpuTier;
      lastGpuStrength = gStrength(picks['GPU']);
      lastCpuTier = picks['CPU'].performanceTier ?? lastCpuTier;

      /* ---- اللوحة: أرخص متوافقة **تتحمّل المعالج** ----
         "الأرخص مطلقاً" كان خطأً: أرخص لوحة LGA1700 هي H610M (مستوى ١، DDR4)،
         وتركيبها مع i7-14700K بسحب 253W يعني VRM يخنق المعالج ورامات بطيئة.
         فنفرض أرضية مستوى للوحة مشتقّة من سحب المعالج ومستواه. */
      const socket = String(parseSpecs(picks['CPU'].specs).socket || '');
      const cpuDraw = picks['CPU'].tdpWattage || 65;
      const cpuTier = (picks['CPU'].performanceTier ?? 3) as number;
      const moboFloor = (cpuDraw >= 200 || cpuTier >= 5) ? 4
                      : (cpuDraw >= 125 || cpuTier >= 4) ? 3
                      : 2;   // نتفادى أدنى فئة (H610) حتى للمعالجات الهادئة
      const sameSocket = mobos.filter(m => String(parseSpecs(m.specs).socket || '') === socket);
      if (!sameSocket.length) continue;
      const strongEnough = sameSocket.filter(m => (m.performanceTier ?? 0) >= moboFloor);
      // إن لم تتوفّر لوحة بالأرضية المطلوبة، نأخذ أقوى المتاح لهذا المقبس
      const moboSrc = strongEnough.length
        ? strongEnough
        : [...sameSocket].sort((a, b) => (b.performanceTier ?? 0) - (a.performanceTier ?? 0));
      picks['Motherboard'] = moboSrc[0];   // مرتّبة سعرياً تصاعدياً

      /* ---- الرام: السعة تتبع الدقة والمستوى، ثم أفضل سرعة بفارق سعر معقول ----
         16GB لا تكفي 4K ولا الألعاب الثقيلة على متوازن/قوي — المعيار 32GB.
         وبين 5600 و6000 فارق سعر ضئيل ومكسب حقيقي في الفريمات، فلا نأخذ
         الأرخص عمياً بل أفضل سرعة داخل هامش ٢٥٪ من الأرخص الكافي. */
      const gamingUse = ['competitive-shooter', 'aaa-gaming', 'casual-gaming', 'mixed'].includes(intent.use);
      let ramNeed = profile.ramMinGB;
      if (gamingUse) {
        if (res === '4K') ramNeed = Math.max(ramNeed, 32);
        else if (res === '1440p' && L.key !== 'value') ramNeed = Math.max(ramNeed, 32);
      }
      ramNeed = Math.min(ramNeed, profile.ramCapGB);   // لا نخترق سقف الاستخدام

      const ramType = String(parseSpecs(picks['Motherboard'].specs).ramType || '');
      const compatRams = rams.filter(r => {
        const rt = String(parseSpecs(r.specs).type || '');
        return !ramType || rt === ramType;
      });
      const rPool = compatRams.length ? compatRams : rams;
      const meetsNeed = rPool.filter(r => specNum(specVal(parseSpecs(r.specs), ['capacity', 'Capacity'])) >= ramNeed);
      const rSrc = [...(meetsNeed.length ? meetsNeed : rPool)].sort((a, b) => a.price - b.price);
      const ramBudget = rSrc[0].price * 1.25;
      const ramCands = rSrc.filter(r => r.price <= ramBudget);
      // أعلى سرعة داخل الهامش، والأرخص عند تعادل السرعة
      picks['RAM'] = (ramCands.length ? ramCands : rSrc).sort((a, b) =>
        (specNum(specVal(parseSpecs(b.specs), ['speed', 'Speed'])) - specNum(specVal(parseSpecs(a.specs), ['speed', 'Speed']))) ||
        (a.price - b.price)
      )[0];

      /* ---- التخزين: يتبع شريحة المستوى (سعة/سرعة أعلى للأقوى) ---- */
      const scoreStorage = (c: any) => {
        const sp = parseSpecs(c.specs);
        const nvme = String(specVal(sp, ['type', 'Type']) || '').toUpperCase().includes('NVME');
        const s = Math.min(1, specNum(sp.readSpeed) / 7000) * 0.5
          + Math.min(1, specNum(specVal(sp, ['capacity', 'Capacity'])) / 2000) * 0.5;
        return clamp(s + (profile.prefNvme ? (nvme ? 0.25 : -0.15) : 0), 0, 1);
      };
      picks['Storage'] = bandPick(storages, scoreStorage, L.band) || storages[0];

      /* ---- المزوّد: بالقدرة لا بالمؤشّر — أصغر قدرة تكفي بهامش ٢٥٪ ---- */
      const drawW = (picks['CPU'].tdpWattage || 65) + (picks['GPU'].tdpWattage || 200) + 80;
      const reqW = Math.ceil(drawW * 1.25);
      const okPsus = psus.filter(ps => parseFloat(parseSpecs(ps.specs).wattage || '0') >= reqW);
      if (!okPsus.length) continue;
      const minW = Math.min(...okPsus.map(ps => parseFloat(parseSpecs(ps.specs).wattage || '0')));
      picks['PSU'] = okPsus.filter(ps => parseFloat(parseSpecs(ps.specs).wattage || '0') === minW)[0];

      /* ---- الكيس: أرخص يتسع للكرت **وللوحة** ----
         كان يفحص طول الكرت وحده، فيختار أرخص كيس ولو كان Mini-ITX واللوحة
         ATX — تجميعةٌ تُقترح على الزائر وهي لا تُركَّب. */
      const gpuLen = parseFloat(parseSpecs(picks['GPU'].specs).lengthMm || '320');
      const moboFF = parseSpecs(picks['Motherboard'].specs).formFactor;
      const psuFF = parseSpecs(picks['PSU'].specs).formFactor;
      const okCases = cases.filter(c =>
        parseFloat(parseSpecs(c.specs).maxGpuLength || '999') >= gpuLen
        && boardFitsCase(moboFF, parseSpecs(c.specs).formFactor)
        && psuFitsCase(psuFF, parseSpecs(c.specs).psuFormFactor));
      if (!okCases.length) continue;
      picks['Case'] = okCases[0];

      const total = Object.values(picks).reduce((sum: number, c: any) => sum + (c?.price || 0), 0);

      /* ---- جملة السبب: النيّة + الدقة + البثّ + مواصفات فعلية ---- */
      const gpuVram = vramOf(picks['GPU']);
      const ramGb = specNum(specVal(parseSpecs(picks['RAM'].specs), ['capacity', 'Capacity']));
      const stType = String(specVal(parseSpecs(picks['Storage'].specs), ['type', 'Type']) || '');
      let reason = profile.reason;
      if (intent.resolution && ['competitive-shooter', 'aaa-gaming', 'casual-gaming'].includes(intent.use)) {
        reason += ` بدقة ${intent.resolution}`;
      }
      if (intent.alsoStreams && intent.use !== 'streaming') reason += ' مع البثّ المباشر';
      const specBits: string[] = [];
      if (ramGb) specBits.push(`${ramGb}GB رام`);
      if (gpuVram) specBits.push(`${gpuVram}GB كرت`);
      if (stType.toUpperCase().includes('NVME')) specBits.push('تخزين NVMe سريع');
      const reasonFull = specBits.length ? `${reason} — ${specBits.join('، ')}.` : `${reason}.`;

      plans.push({ key: L.key, label: L.label, note: reasonFull, total, picks });
    }

    /* ---- مرشّح السلّم: خطة تُعرض فقط إن كانت أفضل *فعلاً* من سابقتها ----
       يمنع "قوي أغلى بآلاف بلا ترقية" (تشبّع المستوى) و"متوازن أرخص من
       اقتصادي" (انقلاب بسبب اختلاف المنصّة). عرض خطتين صادقتين أفضل من
       ثلاث إحداها بلا معنى. */
    const kept: TierPlan[] = [];
    for (const p of plans) {
      if (!kept.length) { kept.push(p); continue; }
      const prev = kept[kept.length - 1];
      const gUp = gStrength(p.picks['GPU']) > gStrength(prev.picks['GPU']);
      const cUp = cStrength(p.picks['CPU']) > cStrength(prev.picks['CPU']);
      if (p.total > prev.total + 300 && (gUp || cUp)) kept.push(p);
    }
    if (!kept.length) return null;

    /* ⚠️ لا تُعاد التسمية حسب العدد.
       كان الباقيان يُسمَّيان «متوازن/قوي» أياً كان أصلهما — فإن سقط مستوى
       «قوي» لأنه ليس ترقية، ظهرت خطّةُ **اقتصادي** باسم «متوازن».
       رُصد فعلاً: «متوازن ٥٬٧٤٥» كانت خطّة اقتصادي، وفرعُها يختار أرخص
       كرتٍ كافٍ عمداً (Arc B580 بـ١٤٩٩) — فبدا الاختيار خاطئاً وهو سليم،
       والخطأ في الاسم وحده.
       كل خطّة تحمل اسم مستواها الحقيقي، إلا حين تنجو واحدة فلا مقارنة. */
    if (kept.length === 1) kept[0].label = 'الأنسب لك';

    return kept;
  };




  const handleCopyText = () => {
    let text = "💻 تجميعتي المخصصة:\n\n";
    Object.entries(selectedComponents).forEach(([cat, comp]) => {
      if (comp) text += `▪️ ${cat}: ${comp.brand} ${comp.name}\n`;
    });
    
    const totalPrice = Object.values(selectedComponents).reduce((sum, comp) => sum + (comp ? comp.price : 0), 0);
    text += `\n💰 التكلفة الإجمالية: ${totalPrice.toFixed(2)} ريال\n`;
    text += `🔗 تفاصيل أكثر: ${window.location.href}`;

    navigator.clipboard.writeText(text);
    toast.success('تم نسخ مواصفات التجميعة!', { icon: '📋' });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('تم نسخ رابط التجميعة للمشاركة!', { icon: '🔗' });
  };

  const checkCompatibility = () => {
    const cpu = selectedComponents['CPU'];
    const mobo = selectedComponents['Motherboard'];
    const ram = selectedComponents['RAM'];
    const gpu = selectedComponents['GPU'];
    const pcCase = selectedComponents['Case'];
    const psu = selectedComponents['PSU'];

    let totalTdp = 0;
    let totalPrice = 0;

    Object.values(selectedComponents).forEach(comp => {
      if (comp) {
        totalTdp += comp.tdpWattage;
        totalPrice += comp.price;
      }
    });
    totalPrice = Number(totalPrice.toFixed(2));

    const requiredCategories = ['CPU', 'Motherboard', 'RAM', 'GPU', 'Case', 'PSU', 'Storage'];
    const missingCategories = requiredCategories.filter(cat => !selectedComponents[cat]);

    if (missingCategories.length > 0) {
      setResult({ 
        status: 'incomplete', 
        message: 'أكمل اختيار القطع التالية لفتح تقرير التوافق:', 
        missingCategories,
        totalTdp, 
        totalPrice 
      });
      return;
    }

    const cpuSpecs = parseSpecs(cpu!.specs);
    const moboSpecs = parseSpecs(mobo!.specs);
    const ramSpecs = parseSpecs(ram!.specs);
    const gpuSpecs = parseSpecs(gpu!.specs);
    const caseSpecs = parseSpecs(pcCase!.specs);
    const psuSpecs = parseSpecs(psu!.specs);

    // فحص المقبس — نفرّق بين "متعارض" و"بيانات ناقصة".
    // القاعدة: عند الجهل نحذّر، لا نؤكّد التوافق. تأكيد التوافق زوراً يهدم ثقة المنصة.
    const cpuSocket = cpuSpecs?.socket ? String(cpuSpecs.socket).trim() : '';
    const moboSocket = moboSpecs?.socket ? String(moboSpecs.socket).trim() : '';
    if (!cpuSocket || !moboSocket) {
      setResult({ status: 'error', message: `تعذّر التأكّد من توافق المقبس: بيانات المقبس ناقصة على ${!cpuSocket ? 'المعالج' : 'اللوحة الأم'}. لا نستطيع تأكيد التوافق — تحقّق يدوياً قبل الشراء.`, totalTdp, totalPrice });
      return;
    }
    if (cpuSocket !== moboSocket) {
      setResult({ status: 'error', message: `عدم توافق: المعالج بمقبس ${cpuSocket} واللوحة الأم بمقبس ${moboSocket}.`, totalTdp, totalPrice });
      return;
    }

    // فحص نوع الذاكرة — نفس المبدأ
    const ramType = ramSpecs?.type ? String(ramSpecs.type).trim() : '';
    const moboRamType = moboSpecs?.ramType ? String(moboSpecs.ramType).trim() : '';
    if (!ramType || !moboRamType) {
      setResult({ status: 'error', message: `تعذّر التأكّد من توافق الذاكرة: بيانات النوع ناقصة على ${!ramType ? 'الرام' : 'اللوحة الأم'}. تحقّق يدوياً قبل الشراء.`, totalTdp, totalPrice });
      return;
    }
    if (ramType !== moboRamType) {
      setResult({ status: 'error', message: `عدم توافق: اللوحة الأم تدعم ${moboRamType} والرام من نوع ${ramType}.`, totalTdp, totalPrice });
      return;
    }
    const gpuLen = parseFloat(gpuSpecs?.lengthMm);
    const caseMaxGpu = parseFloat(caseSpecs?.maxGpuLength);
    if (!isNaN(gpuLen) && !isNaN(caseMaxGpu) && gpuLen > caseMaxGpu) {
      setResult({ status: 'error', message: `عدم توافق: طول الكرت (${gpuLen}mm) أكبر من مساحة الكيس (${caseMaxGpu}mm).`, totalTdp, totalPrice });
      return;
    }

    /* مقاس اللوحة مقابل الكيس — الفحص الذي لم يكن موجوداً، فكانت لوحة ATX
       في كيس Mini-ITX تُعلن «متوافقة» وهي لا تُركَّب */
    const fitMsg = fitReason(moboSpecs?.formFactor, caseSpecs?.formFactor);
    if (fitMsg) {
      setResult({ status: 'error', message: `عدم توافق: ${fitMsg}`, totalTdp, totalPrice });
      return;
    }

    const psuFitMsg = psuFitReason(psuSpecs?.formFactor, caseSpecs?.psuFormFactor);
    if (psuFitMsg) {
      setResult({ status: 'error', message: `عدم توافق: ${psuFitMsg}`, totalTdp, totalPrice });
      return;
    }

    const requiredWattage = totalTdp + 100;
    const psuWattage = Number(psuSpecs?.wattage);
    if (!isNaN(psuWattage) && psuWattage < requiredWattage) {
      setResult({ status: 'error', message: `تحذير طاقة: الاستهلاك التقريبي مع هامش الأمان (${requiredWattage}W) يتجاوز قدرة المزود (${psuSpecs?.wattage}W).`, totalTdp, totalPrice });
      return;
    }

    let bottleneck = null;
    if (cpu!.performanceTier && gpu!.performanceTier) {
      const diff = cpu!.performanceTier - gpu!.performanceTier;
      let suggestions: { category: string, item: Component }[] = [];

      if (diff < -1) {
        const cpuCategory = categories.find(c => c.name === 'CPU');
        if (cpuCategory && moboSpecs) {
          suggestions = cpuCategory.components.filter(c => {
            const cSpecs = parseSpecs(c.specs);
            return cSpecs.socket === moboSpecs.socket && 
                   c.performanceTier !== null && 
                   c.performanceTier >= gpu!.performanceTier! - 1 &&
                   c.id !== cpu!.id;
          })
          .sort((a, b) => a.price - b.price).slice(0, 6)
          .map(item => ({ category: 'CPU', item }));
        }

        bottleneck = {
          title: "⚠️ المعالج قد يحد من أداء الكرت في بعض الألعاب، خصوصًا على 1080p و1440p.",
          desc: "يُنصح بترقية المعالج، أو اللعب بدقة 4K لنقل ثقل المعالجة إلى الكرت وتخفيف الضغط عن المعالج.",
          color: "text-amber-900 dark:text-amber-400",
          bg: "bg-amber-100 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800/50",
          suggestions
        };
      } else if (diff > 1) {
        const gpuCategory = categories.find(c => c.name === 'GPU');
        if (gpuCategory && caseSpecs) {
          suggestions = gpuCategory.components.filter(c => {
            const cSpecs = parseSpecs(c.specs);
            return parseFloat(cSpecs.lengthMm || "0") <= parseFloat(caseSpecs.maxGpuLength || "999") && 
                   c.performanceTier !== null && 
                   c.performanceTier >= cpu!.performanceTier! - 1 &&
                   c.id !== gpu!.id;
          })
          .sort((a, b) => a.price - b.price).slice(0, 6)
          .map(item => ({ category: 'GPU', item }));
        }

        bottleneck = {
          title: "💡 كرت الشاشة سيحد من قوة الجهاز.",
          desc: "الأداء سيكون ممتازاً وسلساً في ألعاب الشوتر والتنافسية، لكن الكرت سيقلل الفريمات في ألعاب القصة الثقيلة والدقات العالية.",
          color: "text-cyan-900 dark:text-cyan-400",
          bg: "bg-cyan-100 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-800/50",
          suggestions
        };
      } else {
        bottleneck = {
          title: "🚀 توازن أداء مثالي.",
          desc: "المعالج والكرت من نفس الفئة تقريباً. ستحصل على أداء مستقر وتستغل كامل قوة الجهاز بدون اختناق.",
          color: "text-emerald-900 dark:text-emerald-400",
          bg: "bg-emerald-100 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800/50"
        };
      }
    }

    setResult({ 
      status: 'success', 
      message: 'توافق تام! جميع القطع تعمل معاً بانسجام.', 
      bottleneck, 
      totalTdp, 
      totalPrice 
    });
  };

  const handleClearBuild = () => {
    if (!confirm('هل أنت متأكد من تفريغ جميع القطع؟ سيتم مسح اختياراتك والبدء من جديد.')) return;
    
    const emptyState: Record<string, Component | null> = {};
    categories.forEach(cat => emptyState[cat.name] = null);
    setSelectedComponents(emptyState);
    
    setEditModeId(null);
    setBuildName("");
    
    localStorage.removeItem('draft_pc_build');
    window.history.replaceState({}, '', window.location.pathname);
    
    toast.success('تم تفريغ لوحة البناء');
  };

  const handleSaveBuildClick = () => {
    if (!session || !session.user) {
      toast.error('يجب تسجيل الدخول أولاً لحفظ التجميعة');
      return;
    }
    if (!buildName && !editModeId) {
       setBuildName("تجميعة " + new Date().toLocaleDateString('ar-SA'));
    }
    setSaveModalOpen(true);
  };

  const confirmSaveBuild = async () => {
    setIsSaving(true);
    try {
      const getComponentId = (searchCategory: string) => {
        const key = Object.keys(selectedComponents).find(
          (k) => k.toLowerCase() === searchCategory.toLowerCase()
        );
        return key && selectedComponents[key] ? selectedComponents[key]!.id : null;
      };

      const payload = {
        id: editModeId, 
        name: buildName || "تجميعة مخصصة",
        cpuId: getComponentId('CPU'),
        gpuId: getComponentId('GPU'),
        ramId: getComponentId('RAM'),
        motherboardId: getComponentId('Motherboard'),
        caseId: getComponentId('Case'),
        psuId: getComponentId('PSU'),
        storageId: getComponentId('Storage'),
      };

      const res = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errorMessage = 'فشل الحفظ بسبب خطأ داخلي في السيرفر.';
        try {
          const errorData = await res.json();
          if (errorData.message) errorMessage = errorData.message;
        } catch (e) {
          console.error("السيرفر لم يرجع JSON صالح (انهيار 500).", e);
        }
        throw new Error(errorMessage);
      }
      
      toast.success(editModeId ? 'تم تحديث التجميعة بنجاح!' : 'تم حفظ التجميعة بنجاح!');
      setSaveModalOpen(false);

      localStorage.removeItem('draft_pc_build');
      const emptyState: Record<string, Component | null> = {};
      categories.forEach(cat => emptyState[cat.name] = null);
      setSelectedComponents(emptyState);
      setBuildName("");

      if (editModeId) {
        setEditModeId(null);
        window.location.href = '/my-builds';
      } else {
        window.history.replaceState({}, '', window.location.pathname);
      }
      
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || 'حدث خطأ أثناء حفظ التجميعة');
    } finally {
      setIsSaving(false);
    }
  };

  const exportBuildAsImage = async () => {
    if (!resultRef.current) return;
    const loadingToast = toast.loading('جاري تجهيز الصورة...');
    
    try {
      const filter = (node: HTMLElement | any) => {
        if (node?.classList && typeof node.classList.contains === 'function') {
          if (node.classList.contains('export-ignore')) return false;
        }
        if (node?.tagName === 'IMG') return false;
        return true;
      };

      const dataUrl = await toPng(resultRef.current, { 
        backgroundColor: '#0f172a',
        cacheBust: true,
        pixelRatio: 2,
        filter: filter
      }); 

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `PC-Build-${new Date().getTime()}.png`;
      link.click();
      
      toast.success('تم تصدير الصورة بنجاح!', { id: loadingToast });
    } catch (error) {
      console.error("خطأ في تصدير الصورة:", error);
      toast.error('تعذر تصدير الصورة بسبب حماية السيرفرات للصور.', { id: loadingToast });
    }
  };

  /* الفئة تُمرَّر للترتيب: jsonb يعيد ترتيب المفاتيح بطول الاسم، فالترتيب
     المفيد يُفرض هنا لا عند الحفظ — انظر التعليق في lib/spec-labels */
  const renderSpecs = (specsStr: any, categoryName?: string) => {
    if (!specsStr) return <p className="text-sm text-slate-500 font-medium">لا توجد مواصفات فنية مسجلة.</p>;
    try {
      const parsed = parseSpecs(specsStr);
      return (
        <div className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 px-4 py-2">
          <SpecSheet categoryName={categoryName} specs={parsed} dense />
        </div>
      );
    } catch (e) {
      return <p className="text-sm text-slate-700 dark:text-slate-300">{String(specsStr)}</p>;
    }
  };

  if (!isLoaded) {
    /* هيكل عظمي يطابق التخطيط الفعلي — لا دوّارة عارية.
       يُشعر بأن المحتوى قادم، ويمنع قفزة التخطيط عند الوصول. */
    return (
      <div className="max-w-5xl mx-auto my-10 bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800/80">
        <div className="p-6 md:p-10">
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800/60">
            <Sk className="h-8 w-48" />
            <Sk className="h-10 w-64 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 mb-10">
            {Array.from({ length: 7 }).map((_, i) => <SkSelectCard key={i} />)}
          </div>
          <Sk className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto my-10 bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800/80">
      
      {/* الهيدر العلوي */}
      <div className="bg-gradient-to-br from-slate-900 to-[#0B1120] dark:from-slate-900 dark:to-[#0B1120] p-10 text-center text-white relative overflow-hidden rounded-t-3xl border-b border-cyan-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        {/* خط سيان علوي متوهّج */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"></div>
        <h1 className="text-3xl md:text-5xl font-black mb-3 flex items-center justify-center gap-3 relative z-10 tracking-tight">
          منصة تجميع <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">الـ PC</span>
        </h1>
        <p className="text-slate-300 font-medium text-sm md:text-base relative z-10">اختر قطعك، تأكد من التوافق الذكي، وابنِ جهاز أحلامك.</p>
      </div>

      <div className="p-6 md:p-10">
        
        {/* ⚠️ شريط "نشتغل عليه الآن" مُعطَّل عن العرض عمداً.
            مراجع AdSense يقرأ "قيد التطوير" على صفحة رئيسية كإشارة
            "موقع تحت الإنشاء" — وهو سبب رفض صريح في سياساتهم.
            المكوّن باقٍ في المشروع؛ أعِد <WorkInProgress /> هنا متى قُبِلت
            المنصة وأردت إعلان ميزة قادمة. */}

        {/* ===== ١) المساعد: يسأل وش تلعب، ويبني ثلاث خطط من الكتالوج ===== */}
        <IntentPicker onPlans={(plans) => setAiPlans(plans)} buildPlans={buildPlans} />

        {/* ===== خيارات المساعد ===== */}
        {aiPlans && aiPlans.length > 0 && (() => {
          /* المُوصى به = الأوسط حين تكون ثلاث خطط، وإلا الأولى.
             كان مثبّتاً على الفهرس ١، فيوصي بـ"قوي" حين تبقى خطتان. */
          const recIdx = aiPlans.length >= 3 ? 1 : 0;
          return (
          <div className="mb-8 p-5 rounded-2xl border border-cyan-500/30 bg-white dark:bg-[#0F172A]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">اختر المستوى الذي يناسبك:</h3>
              <button onClick={() => setAiPlans(null)} className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">إخفاء</button>
            </div>
            <div className={`grid grid-cols-1 gap-3 ${aiPlans.length >= 3 ? 'md:grid-cols-3' : aiPlans.length === 2 ? 'md:grid-cols-2' : ''}`}>
              {aiPlans.map((plan, i) => (
                <button
                  key={plan.key}
                  onClick={() => applyPlan(plan)}
                  className={`text-right p-4 rounded-xl border transition-all hover:-translate-y-1 group ${
                    i === recIdx ? 'border-cyan-500 bg-cyan-500/[0.06] ring-2 ring-cyan-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-black tracking-widest ${i === recIdx ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`}>{plan.label}</span>
                    {i === recIdx && <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-cyan-500 text-white">مُوصى به</span>}
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{Math.round(plan.total).toLocaleString('en-US')}</span>
                    <RiyalIcon size="h-3.5 w-3.5" colorClass="bg-slate-900 dark:bg-white" />
                  </div>
                  <div className="mb-3 flex items-start gap-1.5 text-right">
                    <svg className="w-3 h-3 mt-0.5 shrink-0 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    <p className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">{plan.note}</p>
                  </div>
                  <div className="space-y-1">
                    {['CPU', 'GPU'].map(cat => plan.picks[cat] && (
                      <div key={cat} className="flex items-center gap-1.5 text-[10px]">
                        <span className="font-black text-slate-400 w-7 shrink-0">{cat}</span>
                        <span className="font-bold text-slate-600 dark:text-slate-300 truncate">{plan.picks[cat].name}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-3 pt-3 border-t text-[11px] font-black text-center transition-colors ${
                    i === recIdx ? 'border-cyan-500/30 text-cyan-600 dark:text-cyan-400' : 'border-slate-100 dark:border-slate-800 text-slate-400 group-hover:text-cyan-500'
                  }`}>استخدم هذي ←</div>
                </button>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-slate-400 font-medium text-center">كل القطع متوفّرة فعلاً بأسعارها اللحظية · يمكنك تعديل أي قطعة بعد الاختيار</p>
          </div>
          );
        })()}

        {/* ===== ٢) خصّص تجميعتك: تحت المساعد، يظهر متى اخترت قطعة ===== */}
        {Object.values(selectedComponents).some(Boolean) && (
          <BuildTuner
            categories={categories}
            selectedComponents={selectedComponents}
            onApply={(next) => {
              setSelectedComponents(next);
              setResult({ status: 'idle', message: '', totalTdp: 0, totalPrice: 0 });
              toast.success('تم تطبيق التغييرات — افحص التوافق مجدداً.', { icon: '✅' });
            }}
          />
        )}

        {/* شريط الخيارات العلوي */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 pb-6 border-b border-slate-200 dark:border-slate-800/60 gap-4">
          
          {/* اليمين: العنوان وأزرار الاستكمال */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 shrink-0 tracking-tight">
              <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
              لوحة اختيار القطع
            </h2>
            

          </div>

          {/* اليسار: التفريغ والعرض */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={handleClearBuild}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-rose-500 bg-white hover:bg-rose-50 dark:text-rose-400 dark:bg-slate-800/40 dark:hover:bg-rose-950/40 rounded-xl transition-all border border-slate-200 hover:border-rose-200 dark:border-slate-700/50 dark:hover:border-rose-900/50 shadow-sm"
              title="مسح جميع القطع والبدء من جديد"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              تفريغ التجميعة
            </button>

            <label className="group flex items-center gap-3 cursor-pointer bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-sm">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={showIncompatible}
                  onChange={(e) => setShowIncompatible(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-10 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer-checked:bg-cyan-600 transition-colors"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 select-none group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                عرض القطع غير المتوافقة (لتفسير السبب)
              </span>
            </label>
          </div>
        </div>

        {/* شبكة القطع */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 mb-10">
          {categories.map((category) => {
            const compsWithComp = getComponentsWithCompatibility(category.name, category.components);
            return (
              <div key={category.id} className="w-full min-w-0">
                <SearchableSelect 
                  categoryName={category.name}
                  components={compsWithComp}
                  selectedComponent={selectedComponents[category.name]}
                  onSelect={(id) => handleSelect(category.name, id)}
                  onRemove={() => handleRemove(category.name)}
                  onShowDetails={(comp) => setDetailsModal({ comp, categoryName: category.name })}
                  showIncompatible={showIncompatible}
                />
              </div>
            );
          })}
        </div>

        {/* ===== اقترح قطعة ناقصة — هنا يدرك المستخدم أن قطعته غير موجودة ===== */}
        <SuggestPartCard source="builder" className="mt-8" />

        {/* صندوق النتيجة */}
        {result.status !== 'idle' && (
          <div className="mt-10 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {result.status === 'incomplete' ? (
              <div className="p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm border border-slate-200 dark:border-slate-700">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-lg font-extrabold text-slate-700 dark:text-slate-300">{result.message}</h3>
                
                {/* عرض القطع الناقصة */}
                {result.missingCategories && result.missingCategories.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-1">
                    {result.missingCategories.map(cat => (
                      <span key={cat} className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-200 dark:border-rose-800/50">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
                
                {(result.totalPrice > 0 || result.totalTdp > 0) && (
                  <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm font-bold">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 flex items-center gap-2 text-slate-600 dark:text-slate-400 shadow-sm">
                      ⚡ الطاقة الحالية: <span className="text-amber-600 dark:text-amber-500">{result.totalTdp}W</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 flex items-center gap-2 text-slate-600 dark:text-slate-400 shadow-sm">
                      💰 التكلفة الحالية: 
                      <span className="text-emerald-600 dark:text-emerald-500 font-black flex items-center gap-1">
                        {result.totalPrice} <RiyalIcon size="h-4 w-4" colorClass="bg-emerald-600 dark:bg-emerald-500" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div ref={resultRef} className={`rounded-3xl border shadow-sm relative overflow-hidden ${
                result.status === 'success' 
                  ? 'bg-white dark:bg-[#0F172A] border-emerald-200 dark:border-emerald-800/40' 
                  : 'bg-white dark:bg-[#0F172A] border-rose-200 dark:border-rose-800/40'
              }`}>
                {/* شريط الحالة العلوي */}
                <div className={`h-1.5 w-full ${
                  result.status === 'success'
                    ? 'bg-gradient-to-l from-emerald-500 to-emerald-400'
                    : 'bg-gradient-to-l from-rose-500 to-rose-400'
                }`}></div>

                <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border-2 ${
                    result.status === 'success' ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-600/50' : 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-600/50'
                  }`}>
                    {result.status === 'success' ? (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xl font-black mb-3 ${result.status === 'success' ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-900 dark:text-rose-400'}`}>
                      {result.message}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3">
                        <div className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 mb-1">التكلفة الإجمالية</div>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          {result.totalPrice} <RiyalIcon size="h-4 w-4" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3">
                        <div className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 mb-1">الطاقة التقريبية</div>
                        <div className="text-xl font-black text-amber-600 dark:text-amber-400">{result.totalTdp}W</div>
                      </div>
                    </div>

                    <PowerMeter 
                      totalTdp={result.totalTdp} 
                      psuWattage={selectedComponents['PSU'] ? parseFloat(parseSpecs(selectedComponents['PSU'].specs).wattage || "0") : 0} 
                    />

                    {result.bottleneck && (
                      <div className={`mt-6 p-5 border rounded-2xl ${result.bottleneck.bg} flex flex-col relative shadow-sm`}>
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h4 className={`font-black text-base mb-1 ${result.bottleneck.color}`}>
                              {result.bottleneck.title}
                            </h4>
                            <p className={`text-sm font-medium opacity-90 ${result.bottleneck.color}`}>
                              {result.bottleneck.desc}
                            </p>
                          </div>
                        </div>

                        {/* قسم الاقتراحات */}
                        {result.bottleneck.suggestions && result.bottleneck.suggestions.length > 0 && (
                          <div className="mt-6 pt-5 border-t border-current/15 w-full">
                            <span className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${result.bottleneck.color} opacity-90`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                              خيارات الترقية المقترحة:
                            </span>
                            
                            {/* حاوية التمرير */}
                            <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
                              {result.bottleneck.suggestions.map((sug, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSelect(sug.category, sug.item.id)}
                                  className="group flex flex-col text-right p-4 rounded-3xl bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 min-w-[260px] max-w-[260px] shrink-0 snap-center relative overflow-hidden"
                                >
                                  {/* خط علوي جمالي يظهر عند التمرير */}
                                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  
                                  <div className="flex justify-between items-start w-full mb-3">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${getBrandColor(sug.item, sug.category)} bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700/50`}>
                                      {sug.item.brand}
                                    </span>
                                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                                      {sug.category}
                                    </span>
                                  </div>

                                  <span className="text-sm font-extrabold line-clamp-2 leading-relaxed mb-4 text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" title={sug.item.name}>
                                    {sug.item.name}
                                  </span>
                                  
                                  <div className="mt-auto flex justify-between items-end w-full pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                      <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">السعر</span>
                                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                                        {sug.item.price} <RiyalIcon size="h-3 w-3" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                                      </span>
                                    </div>
                                    
                                    <span className="text-[11px] font-black flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 group-hover:bg-cyan-600 group-hover:text-white px-3 py-2 rounded-xl transition-all">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                      استبدال
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {result.status === 'success' && selectedComponents['CPU']?.performanceTier && selectedComponents['GPU']?.performanceTier && (
                      <FpsEstimator 
                        cpuTier={selectedComponents['CPU'].performanceTier} 
                        gpuTier={selectedComponents['GPU'].performanceTier} 
                      />
                    )}

                    {result.status === 'success' && (
                      <div className="mt-8 pt-8 border-t border-emerald-200/50 dark:border-emerald-800/30">
                        <h4 className="font-extrabold text-emerald-900 dark:text-emerald-500 mb-2 text-sm uppercase tracking-widest">
                          اشترِ قطعك الآن:
                        </h4>

                        {/* سطر التوفير الجماعي (div لا p — RiyalIcon بداخله div) */}
                        {(() => {
                          const savings = Object.values(selectedComponents).reduce((sum, comp) => {
                            if (!comp) return sum;
                            const offers = getStoreOffers(comp);
                            if (offers.length < 2) return sum;
                            return sum + (offers[offers.length - 1].price - offers[0].price);
                          }, 0);
                          if (savings <= 0) return <div className="mb-5"></div>;
                          return (
                            <div className="mb-5 text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                              <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                              اختيار أرخص متجر لكل قطعة يوفّر لك
                              <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                                {savings.toFixed(0)} <RiyalIcon size="h-3 w-3" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                              </span>
                              مقارنةً بأغلى العروض المتاحة — رتّبناها لك.
                            </div>
                          );
                        })()}
                        <div className="grid grid-cols-1 gap-3">
                          {Object.entries(selectedComponents).map(([catName, comp]) => {
                            if (!comp) return null;
                            return (
                              <div key={catName} className="flex p-4 bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/60 gap-4 hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-colors group items-start sm:items-center">
                                {comp.imageUrl ? (
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 p-2 flex items-center justify-center shrink-0">
                                     <img src={productImage(comp.imageUrl)} alt={comp.name} className="max-w-full max-h-full object-contain export-ignore" />
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center shrink-0">
                                    <span className="text-2xl opacity-40">⚙️</span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="text-sm leading-tight">
                                    <span className="font-bold text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest block mb-1">{catName}</span>
                                    <span className={getBrandColor(comp, catName) + " ml-1"}>{comp.brand}</span>
                                    <span className="text-slate-900 dark:text-white font-bold line-clamp-1">{comp.name}</span>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                                    <span className="font-black text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                                      {comp.price} <RiyalIcon size="h-3.5 w-3.5" colorClass="bg-emerald-700 dark:bg-emerald-400" />
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 export-ignore">
                                      {getStoreOffers(comp).map((offer, i) => (
                                        <a
                                          key={offer.storeId}
                                          href={buildStoreUrl(offer.store, offer.url, offer.affiliateUrl)}
                                          {...storeLinkProps(offer.store)}
                                          className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded-lg font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                                            i === 0
                                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300 dark:ring-emerald-500/40'
                                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                                          }`}
                                        >
                                          <span>{offer.store.latinName}</span>
                                          <span className="font-black flex items-center gap-0.5">
                                            {(offer.price ?? 0).toLocaleString('en-US')}
                                            <RiyalIcon size="h-2.5 w-2.5" colorClass={i === 0 ? 'bg-white' : 'bg-slate-500 dark:bg-slate-400'} />
                                          </span>
                                          {i === 0 && getStoreOffers(comp).length > 1 && (
                                            <span className="bg-white/20 rounded px-1 py-0.5 text-[8px] font-black">الأرخص</span>
                                          )}
                                          <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                      ))}
                                      {getStoreOffers(comp).length === 0 && (
                                        <span className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-600 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                          غير متوفر حالياً
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                </div>{/* /p-8 */}
              </div>
            )}

            {result.status === 'success' && (
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                {editModeId && (
                  <button 
                    onClick={() => {
                      localStorage.removeItem('draft_pc_build');
                      window.location.href = '/my-builds';
                    }}
                    className="px-6 py-3 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold rounded-xl transition-all flex items-center gap-2 border border-rose-200 dark:border-rose-900/30"
                  >
                    إلغاء التعديل
                  </button>
                )}
                
                <button 
                  onClick={handleCopyText}
                  className="px-6 py-3.5 bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all flex items-center gap-2 border-[1.5px] border-slate-300 dark:border-slate-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  نسخ كنص
                </button>
                <button 
                  onClick={exportBuildAsImage}
                  className="px-6 py-3.5 bg-white dark:bg-[#0F172A] hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 font-bold rounded-xl transition-all flex items-center gap-2 border-[1.5px] border-cyan-500/40 hover:border-cyan-500/70"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  تصدير صورة
                </button>
                
                <button 
                  onClick={handleSaveBuildClick}
                  className="flex-1 min-w-[220px] justify-center px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  {editModeId ? 'حفظ التعديلات' : 'حفظ التجميعة لحسابي'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* نافذة التفاصيل */}
      {detailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0B1120]/60 backdrop-blur-sm shrink-0">
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-5 bg-cyan-600 rounded-full"></span>
                تفاصيل القطعة
              </h2>
              <button onClick={() => setDetailsModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors">
                <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="flex gap-5 items-start mb-6">
                {detailsModal.comp.imageUrl && (
                  <div className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-2 flex items-center justify-center shrink-0">
                    <img src={productImage(detailsModal.comp.imageUrl)} alt={detailsModal.comp.name} className="max-w-full max-h-full object-contain filter drop-shadow-sm" />
                  </div>
                )}
                <div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${getBrandColor(detailsModal.comp, detailsModal.categoryName)}`}>{detailsModal.comp.brand}</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 leading-tight">{detailsModal.comp.name}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">السعر الحالي</span>
                  <span className="font-black text-xl text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    {detailsModal.comp.price} <RiyalIcon size="h-5 w-5" colorClass="bg-emerald-700 dark:bg-emerald-400" />
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">الطاقة المطلوبة</span>
                  <span className="font-black text-xl text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    {detailsModal.comp.tdpWattage}W
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="text-cyan-600">⚙️</span> المواصفات الفنية
                </h4>
                {renderSpecs(detailsModal.comp.specs, detailsModal.categoryName)}
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="text-cyan-600">📄</span> نظرة عامة
                </h4>
                <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/30">
                  {detailsModal.comp.description
                    ? <RichDescription text={detailsModal.comp.description} />
                    : "لا يوجد وصف إضافي متوفر لهذه القطعة حالياً."}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0B1120] flex gap-3 shrink-0">
              <button 
                onClick={() => { handleSelect(detailsModal.categoryName, detailsModal.comp.id); setDetailsModal(null); }} 
                className="flex-1 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95"
              >
                اعتماد القطعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* شريط الملخص العائم للجوال */}
      {result.status === 'success' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:hidden flex justify-between items-center animate-in slide-in-from-bottom-full duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">التكلفة الإجمالية</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg flex items-center gap-1">
              {result.totalPrice} <RiyalIcon size="h-4 w-4" />
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCopyLink}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold border border-slate-200 dark:border-slate-700 shadow-sm"
              title="نسخ الرابط"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </button>
            <button 
              onClick={handleSaveBuildClick} 
              className="px-6 py-2.5 bg-cyan-600 active:bg-cyan-700 text-white text-sm font-bold rounded-xl shadow-md"
            >
              حفظ
            </button>
          </div>
        </div>
      )}

      {/* نافذة حفظ التجميعة */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0B1120]/60 backdrop-blur-sm shrink-0">
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-5 bg-cyan-600 rounded-full"></span>
                {editModeId ? 'تحديث التجميعة' : 'حفظ التجميعة'}
              </h2>
              <button onClick={() => setSaveModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors">
                <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                اسم التجميعة:
              </label>
              <input
                type="text"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                placeholder="مثال: تجميعة الألعاب، تجميعة المونتاج..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 text-slate-900 dark:text-white font-medium"
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-3 font-medium">
                ستتمكن من الرجوع لهذه التجميعة لاحقاً وتعديلها من صفحة حسابك.
              </p>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0B1120] flex gap-3">
              <button 
                onClick={() => setSaveModalOpen(false)} 
                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmSaveBuild} 
                disabled={isSaving || !buildName.trim()}
                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md shadow-cyan-500/20 flex justify-center items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  'تأكيد الحفظ'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}