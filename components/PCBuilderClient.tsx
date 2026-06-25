'use client';
export const dynamic = 'force-dynamic';
import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type Component = {
  id: string;
  name: string;
  brand: string;
  price: number;
  tdpWattage: number;
  specs: any;
  imageUrl?: string | null;
  amazonUrl?: string | null;
  cazasouqUrl?: string | null;
  microlessUrl?: string | null;
  amazonInStock?: boolean | null;
  cazasouqInStock?: boolean | null;
  microlessInStock?: boolean | null;
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

// دالة التسويق بالعمولة الذكية
const getAffiliateUrl = (url: string | null | undefined, store: 'amazon' | 'cazasouq' | 'microless') => {
  if (!url) return '#';
  
  switch(store) {
    case 'amazon':
      if (url.includes('amazon.sa') || url.includes('amazon.com')) {
        const match = url.match(/(https?:\/\/[^\/]+\/(?:[^\/]+\/)?(?:dp|gp\/product)\/[A-Z0-9]{10})/i);
        if (match) return `${match[1]}?tag=tajmee3ti-21`;
        return url.includes('?') ? `${url}&tag=tajmee3ti-21` : `${url}?tag=tajmee3ti-21`;
      }
      return url;
      
    case 'cazasouq':
      if (url.includes('cazasouq.com')) {
        const cazasouqAffId = ''; 
        if (!cazasouqAffId) return url;
        return url.includes('?') ? `${url}&aff=${cazasouqAffId}` : `${url}?aff=${cazasouqAffId}`;
      }
      return url;
      
    case 'microless':
      if (url.includes('microless.com')) {
        const microlessAffId = ''; 
        if (!microlessAffId) return url;
        return url.includes('?') ? `${url}&aff_id=${microlessAffId}` : `${url}?aff_id=${microlessAffId}`;
      }
      return url;
      
    default:
      return url;
  }
};

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

const formatTextWithLinks = (text: string) => {
  if (!text) return null;
  
  const regex = /(\[[^\]]+\]\([^\)]+\)|\[red\].*?\[\/red\]|\[green\].*?\[\/green\]|\[blue\].*?\[\/blue\]|\[yellow\].*?\[\/yellow\]|https?:\/\/[^\s]+)/g;
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    if (!part) return null;

    const mdLinkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (mdLinkMatch) {
      const [, linkText, linkUrl] = mdLinkMatch;
      return (
        <a 
          key={i} 
          href={linkUrl} 
          target={linkUrl.startsWith('http') ? "_blank" : "_self"} 
          rel={linkUrl.startsWith('http') ? "noopener noreferrer" : ""} 
          className="text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors mx-1"
        >
          {linkText}
        </a>
      );
    }

    if (part.match(/^https?:\/\/[^\s]+$/)) {
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center gap-2 mt-3 mb-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-400 font-bold text-xs rounded-xl transition-all w-fit border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
          الموقع الرسمي
        </a>
      );
    }
    
    if (part.startsWith('[red]') && part.endsWith('[/red]')) return <span key={i} className="text-rose-600 dark:text-rose-400 font-bold">{part.slice(5, -6)}</span>;
    if (part.startsWith('[green]') && part.endsWith('[/green]')) return <span key={i} className="text-emerald-600 dark:text-emerald-400 font-bold">{part.slice(7, -8)}</span>;
    if (part.startsWith('[blue]') && part.endsWith('[/blue]')) return <span key={i} className="text-blue-600 dark:text-blue-400 font-bold">{part.slice(6, -7)}</span>;
    if (part.startsWith('[yellow]') && part.endsWith('[/yellow]')) return <span key={i} className="text-amber-600 dark:text-amber-400 font-bold">{part.slice(8, -9)}</span>;
    
    return <span key={i}>{part}</span>;
  });
};

const getBrandColor = (comp: Component, categoryName: string) => {
  if (categoryName !== 'CPU' && categoryName !== 'GPU') return 'text-blue-700 dark:text-blue-400';
  
  const textToSearch = `${comp.brand} ${comp.name}`.toLowerCase();
  
  if (textToSearch.includes('amd') || textToSearch.includes('radeon')) {
    return 'text-red-700 dark:text-red-500';
  }
  if (textToSearch.includes('nvidia') || textToSearch.includes('geforce') || textToSearch.includes('rtx') || textToSearch.includes('gtx')) {
    return 'text-emerald-700 dark:text-[#8ce600]'; 
  }
  if (textToSearch.includes('intel')) {
    return 'text-blue-700 dark:text-blue-500'; 
  }
  
  return 'text-slate-800 dark:text-slate-200'; 
};

// مكون شريط الطاقة
const PowerMeter = ({ totalTdp, psuWattage }: { totalTdp: number, psuWattage: number }) => {
  const percentage = psuWattage > 0 ? Math.min((totalTdp / psuWattage) * 100, 100) : 0;
  
  let colorClass = 'bg-emerald-500';
  if (percentage > 85) colorClass = 'bg-rose-500';
  else if (percentage > 70) colorClass = 'bg-amber-500';

  return (
    <div className="w-full mt-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
      <div className="flex justify-between items-center text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
        <span className="flex items-center gap-1">⚡ استهلاك القطع: {totalTdp}W</span>
        <span>سعة المزود: {psuWattage ? `${psuWattage}W` : 'لم يحدد'}</span>
      </div>
      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
      {percentage > 85 && (
        <p className="text-[10px] text-rose-500 mt-2 font-bold">الاستهلاك مرتفع جداً. يُنصح بمزود طاقة بسعة أكبر لضمان استقرار الجهاز وهامش كسر السرعة.</p>
      )}
    </div>
  );
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
    <div className={`relative flex-1 min-w-0 transition-all ${isOpen ? 'z-50' : 'z-10'}`} ref={wrapperRef}>
      <div 
        className={`p-3.5 border rounded-xl flex justify-between items-center w-full min-h-[56px] gap-2 transition-all cursor-pointer ${
          isOpen 
            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-slate-800' 
            : 'border-slate-300 dark:border-slate-700/80 bg-slate-50 hover:bg-white dark:bg-[#0B1120] dark:hover:bg-slate-800/80'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="whitespace-normal break-words flex-1 text-slate-900 dark:text-slate-200 text-sm font-bold">
          {selectedComponent ? (
            <span className="flex items-center gap-1.5 flex-wrap">
              <span className={getBrandColor(selectedComponent, categoryName)}>{selectedComponent.brand}</span> 
              <span className="font-extrabold">{selectedComponent.name}</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-black flex items-center gap-1 mx-1 bg-emerald-100/50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md text-xs border border-emerald-200 dark:border-emerald-800/30">
                {selectedComponent.price} <RiyalIcon size="h-3 w-3" />
              </span>
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400 font-medium">اختر {categoryName}...</span>
          )}
        </span>

        {selectedComponent && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg transition-colors shrink-0"
            title="إزالة القطعة"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        )}

        <svg className={`w-5 h-5 text-slate-500 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>

      {isOpen && (
        <div className="absolute w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-[350px] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="relative mb-2">
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                className="w-full pl-3 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400"
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
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-colors ${sortBy === 'default' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
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
                            <img src={comp.imageUrl} alt="" className="w-full h-full object-contain" />
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

  const gameMultipliers: Record<string, any> = {
    esports: { name: 'Valorant', mult: 3.0, icon: '🎯' },
    competitive: { name: 'Warzone', mult: 0.9, icon: '🪂' },
    aaa: { name: 'Cyberpunk', mult: 0.45, icon: '🌃' }
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
          icon: game.icon
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
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
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
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {res} {isRecommended && '★'}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-100 dark:divide-slate-700/50 p-2">
        {Object.entries(tierData.data[activeRes]).map(([type, data]: any) => (
          <div key={type} className="p-3 text-center flex flex-col items-center justify-center group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl">
            <span className="text-xl mb-1">{data.icon}</span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{data.name}</span>
            <span className="text-lg font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform">{data.fps}</span>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          الأرقام تقريبية وتعتمد على إعدادات الجودة وتقنيات (DLSS/FSR).
        </span>
        <span className="hidden sm:block text-slate-300 dark:text-slate-700">|</span>
        <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold flex items-center gap-1">
          <span className="text-sm leading-none">★</span> تشير إلى دقة الشاشة المثالية لجهازك.
        </span>
      </div>
    </div>
  );
};

export default function PCBuilderClient({ categories, importedSelections = {} }: { categories: Category[], importedSelections?: Record<string, string> }) {
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
      
      if (categoryName === 'GPU' && pcCase) {
        const caseSpecs = parseSpecs(pcCase.specs);
        if (specs.lengthMm && caseSpecs.maxGpuLength && parseFloat(specs.lengthMm) > parseFloat(caseSpecs.maxGpuLength)) {
          isCompatible = false;
          reason = `طول الكرت (${specs.lengthMm}mm) لا يتسع داخل الكيس (${caseSpecs.maxGpuLength}mm)`;
        }
      }

      return { ...comp, isCompatible, reason };
    });
  };

  const handleAutoFill = (tier: 'economy' | 'mid' | 'high') => {
    let newSelections = { ...selectedComponents };
    
    // سحب القطع مرتبة حسب السعر
    const getCategoryComponents = (name: string) => [...(categories.find(c => c.name === name)?.components || [])].sort((a, b) => a.price - b.price);

    const cpus = getCategoryComponents('CPU');
    const gpus = getCategoryComponents('GPU');
    const mobos = getCategoryComponents('Motherboard');
    const rams = getCategoryComponents('RAM');
    const psus = getCategoryComponents('PSU');
    const storages = getCategoryComponents('Storage');
    const cases = getCategoryComponents('Case');

    // دالة لتقسيم القطع لشرائح حسب الفئة السعرية والأداء
    const getTierSlice = (arr: any[], t: 'economy' | 'mid' | 'high') => {
      if (arr.length <= 3) return arr;
      const third = Math.floor(arr.length / 3);
      if (t === 'economy') return arr.slice(0, third + Math.floor(third/2)); // النصف الأرخص
      if (t === 'mid') return arr.slice(third, arr.length - third); // الوسط
      return arr.slice(arr.length - Math.floor(third * 1.5)); // النصف الأغلى
    };

    // 1. اختيار كرت الشاشة (الأساس)
    let validGpus = getTierSlice(gpus, tier);
    let gpu = tier === 'high' ? validGpus[validGpus.length - 1] : validGpus[Math.floor(validGpus.length / 3)];
    if (tier === 'economy') gpu = validGpus[0];
    
    if (!gpu) {
      toast.error('لا توجد كروت شاشة كافية في قاعدة البيانات.');
      return;
    }
    newSelections['GPU'] = gpu;
    const gpuPrice = gpu.price;
    const reqGpuLength = parseFloat(parseSpecs(gpu.specs).lengthMm || "320");

    // 2. اختيار المعالج
    let validCpus = getTierSlice(cpus, tier);
    let cpu = tier === 'high' ? validCpus[validCpus.length - 1] : validCpus[Math.floor(validCpus.length / 3)];
    if (tier === 'economy') cpu = validCpus[0];
    newSelections['CPU'] = cpu;

    const cpuSpecs = parseSpecs(cpu.specs);
    const reqWattage = (cpu.tdpWattage || 65) + (gpu.tdpWattage || 200) + 100; // الاستهلاك الفعلي + هامش 100W

    // 3. اختيار اللوحة الأم
    const compMobos = mobos.filter(mb => String(parseSpecs(mb.specs).socket) === String(cpuSpecs.socket));
    let filteredMobos = compMobos.filter(mb => {
      const chipset = String(parseSpecs(mb.specs).chipset || '').toUpperCase();
      const isBasic = chipset.includes('H610') || chipset.includes('A620') || chipset.includes('A520') || chipset.includes('B450');
      const isMid = chipset.includes('B760') || chipset.includes('B660') || chipset.includes('B650') || chipset.includes('B550');
      
      // القيود الصارمة للقيمة
      if (tier === 'economy') return (isBasic || isMid) && mb.price <= (gpuPrice * 0.6); // اللوحة لا تتجاوز 60% من سعر الكرت
      if (tier === 'mid') return isMid && mb.price <= gpuPrice;
      return true; // الفئة العليا بدون قيود
    });
    if (filteredMobos.length === 0) filteredMobos = compMobos;
    newSelections['Motherboard'] = tier === 'high' ? filteredMobos[filteredMobos.length - 1] : filteredMobos[0];

    // 4. اختيار الرام
    const moboSpecs = parseSpecs(newSelections['Motherboard']!.specs);
    const compRams = rams.filter(r => String(parseSpecs(r.specs).type) === String(moboSpecs.ramType));
    let filteredRams = compRams.filter(r => {
      const cap = parseFloat(parseSpecs(r.specs).capacity || "16");
      // منع الرامات الأغلى من الكرت
      if (tier !== 'high' && r.price > (gpuPrice * 0.45)) return false; 

      if (tier === 'economy') return cap <= 32;
      if (tier === 'mid') return cap >= 32;
      return true;
    });
    if (filteredRams.length === 0) filteredRams = compRams.filter(r => r.price <= gpuPrice);
    if (filteredRams.length === 0) filteredRams = compRams;
    newSelections['RAM'] = tier === 'high' ? filteredRams[filteredRams.length - 1] : filteredRams[0];

    // 5. اختيار مزود الطاقة (PSU)
    const compPsus = psus.filter(p => parseFloat(parseSpecs(p.specs).wattage || "0") >= reqWattage);
    let filteredPsus = compPsus.filter(p => {
      const psuW = parseFloat(parseSpecs(p.specs).wattage || "0");
      // حماية من مزودات 1000W لتجميعة تستهلك 350W
      if (tier === 'economy') return psuW <= (reqWattage + 200) && p.price <= (gpuPrice * 0.5);
      if (tier === 'mid') return psuW <= (reqWattage + 300);
      return true;
    });
    if (filteredPsus.length === 0) filteredPsus = compPsus;
    newSelections['PSU'] = tier === 'high' ? filteredPsus[filteredPsus.length - 1] : filteredPsus[0];

    // 6. اختيار التخزين
    let filteredStorages = storages.filter(st => {
      const capStr = String(parseSpecs(st.specs).capacity || '').toUpperCase();
      if (tier !== 'high' && st.price > (gpuPrice * 0.4)) return false;
      if (tier === 'economy') return capStr.includes('1TB') || capStr.includes('500GB');
      if (tier === 'mid') return capStr.includes('1TB') || capStr.includes('2TB');
      return true;
    });
    if (filteredStorages.length === 0) filteredStorages = storages;
    newSelections['Storage'] = tier === 'high' ? filteredStorages[filteredStorages.length - 1] : filteredStorages[0];

    // 7. اختيار الكيس
    const compCases = cases.filter(c => parseFloat(parseSpecs(c.specs).maxGpuLength || "999") >= reqGpuLength);
    let filteredCases = compCases.filter(c => {
      if (tier !== 'high' && c.price > (gpuPrice * 0.4)) return false;
      if (tier === 'economy') return c.price <= 350;
      if (tier === 'mid') return c.price <= 700;
      return true;
    });
    if (filteredCases.length === 0) filteredCases = compCases;
    newSelections['Case'] = tier === 'high' ? filteredCases[filteredCases.length - 1] : filteredCases[0];

    setSelectedComponents(newSelections);
    const tierName = tier === 'economy' ? 'الاقتصادية' : tier === 'mid' ? 'المتوسطة' : 'العليا';
    toast.success(`تم بناء تجميعة كاملة من الفئة ${tierName} بنجاح!`, { icon: '✨' });
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

    if (cpuSpecs?.socket !== moboSpecs?.socket) {
      setResult({ status: 'error', message: `عدم توافق: المعالج بمقبس ${cpuSpecs?.socket} واللوحة الأم بمقبس ${moboSpecs?.socket}.`, totalTdp, totalPrice });
      return;
    }
    if (ramSpecs?.type !== moboSpecs?.ramType) {
      setResult({ status: 'error', message: `عدم توافق: اللوحة الأم تدعم ${moboSpecs?.ramType} والرام من نوع ${ramSpecs?.type}.`, totalTdp, totalPrice });
      return;
    }
    if (parseFloat(gpuSpecs?.lengthMm) > parseFloat(caseSpecs?.maxGpuLength)) {
      setResult({ status: 'error', message: `عدم توافق: طول الكرت (${gpuSpecs?.lengthMm}mm) أكبر من مساحة الكيس (${caseSpecs?.maxGpuLength}mm).`, totalTdp, totalPrice });
      return;
    }

    const requiredWattage = totalTdp + 100;
    if (psuSpecs?.wattage < requiredWattage) {
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
          color: "text-blue-900 dark:text-blue-400",
          bg: "bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800/50",
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

  const renderSpecs = (specsStr: any) => {
    if (!specsStr) return <p className="text-sm text-slate-500 font-medium">لا توجد مواصفات فنية مسجلة.</p>;
    try {
      const parsed = parseSpecs(specsStr);
      return (
        <div className="grid grid-cols-2 gap-3 mt-3">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key} className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/50">
              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{key}</span>
              <span className="block text-sm font-bold text-slate-900 dark:text-slate-200" dir="ltr">{String(value)}</span>
            </div>
          ))}
        </div>
      );
    } catch (e) {
      return <p className="text-sm text-slate-700 dark:text-slate-300">{String(specsStr)}</p>;
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto my-10 bg-white dark:bg-[#0F172A] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800/80">
      
      {/* الهيدر العلوي */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-10 text-center text-white relative overflow-hidden rounded-t-3xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 flex items-center justify-center gap-3 relative z-10">
          منصة تجميع الـ PC
        </h1>
        <p className="text-slate-300 font-medium text-sm md:text-base relative z-10">اختر قطعك، تأكد من التوافق الذكي، وابنِ جهاز أحلامك.</p>
      </div>

      <div className="p-6 md:p-10">
        
        {/* شريط الخيارات العلوي */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 pb-6 border-b border-slate-200 dark:border-slate-800/60 gap-4">
          
          {/* اليمين: العنوان وأزرار الاستكمال */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              لوحة اختيار القطع
            </h2>
            
            {selectedComponents['CPU'] && selectedComponents['GPU'] && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                تجميع تلقائي:
              </span>
              <button onClick={() => handleAutoFill('economy')} className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg shadow-sm transition-all border border-slate-200 dark:border-slate-600">اقتصادي</button>
              <button onClick={() => handleAutoFill('mid')} className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg shadow-sm transition-all border border-blue-200 dark:border-blue-800/50">متوسط</button>
              <button onClick={() => handleAutoFill('high')} className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 rounded-lg shadow-sm transition-all border border-purple-200 dark:border-purple-800/50">عالي</button>
            </div>
            )}
          </div>

          {/* اليسار: التفريغ والعرض */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={handleClearBuild}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-rose-500 bg-white hover:bg-rose-50 dark:text-rose-400 dark:bg-slate-800/40 dark:hover:bg-rose-950/40 rounded-xl transition-all border border-slate-200 hover:border-rose-200 dark:border-slate-700/50 dark:hover:border-rose-900/50 shadow-sm"
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
                <div className="w-10 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
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
              <div key={category.id} className="flex flex-col gap-2.5">
                <label className="font-extrabold text-slate-800 dark:text-slate-300 flex items-center gap-2 text-sm uppercase tracking-wide ml-1">
                  {category.name}
                </label>
                <div className="flex gap-3 items-stretch w-full min-w-0">
                  {selectedComponents[category.name]?.imageUrl && (
                    <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                      <img 
                        src={selectedComponents[category.name]?.imageUrl as string} 
                        alt={selectedComponents[category.name]?.name}
                        className="max-w-full max-h-full object-contain filter drop-shadow-sm" 
                      />
                    </div>
                  )}
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
              </div>
            );
          })}
        </div>

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
              <div ref={resultRef} className={`p-8 rounded-3xl border shadow-sm relative overflow-hidden ${
                result.status === 'success' 
                  ? 'bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-[#0F172A] border-emerald-200 dark:border-emerald-800/50' 
                  : 'bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/20 dark:to-[#0F172A] border-rose-200 dark:border-rose-800/50'
              }`}>
                
                <div className="flex flex-col md:flex-row md:items-start gap-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    result.status === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-200 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
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
                    
                    <div className="flex flex-wrap gap-3 text-sm font-bold">
                      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 flex items-center gap-2 text-slate-800 dark:text-slate-200 shadow-sm">
                        ⚡ الطاقة التقريبية: <span className="text-amber-700 dark:text-amber-400">{result.totalTdp}W</span>
                      </div>
                      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 flex items-center gap-2 text-slate-800 dark:text-slate-200 shadow-sm">
                        💰 التكلفة الإجمالية: 
                        <span className="text-emerald-700 dark:text-emerald-400 font-black flex items-center gap-1">
                          {result.totalPrice} <RiyalIcon size="h-4 w-4" />
                        </span>
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
                                  className="group flex flex-col text-right p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/60 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-400 dark:hover:border-blue-500/50 min-w-[260px] max-w-[260px] shrink-0 snap-center relative overflow-hidden"
                                >
                                  {/* خط علوي جمالي يظهر عند التمرير */}
                                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  
                                  <div className="flex justify-between items-start w-full mb-3">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${getBrandColor(sug.item, sug.category)} bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700/50`}>
                                      {sug.item.brand}
                                    </span>
                                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                                      {sug.category}
                                    </span>
                                  </div>

                                  <span className="text-sm font-extrabold line-clamp-2 leading-relaxed mb-4 text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={sug.item.name}>
                                    {sug.item.name}
                                  </span>
                                  
                                  <div className="mt-auto flex justify-between items-end w-full pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                      <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">السعر</span>
                                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                                        {sug.item.price} <RiyalIcon size="h-3 w-3" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                                      </span>
                                    </div>
                                    
                                    <span className="text-[11px] font-black flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-600 group-hover:text-white px-3 py-2 rounded-xl transition-all">
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
                        <h4 className="font-extrabold text-emerald-900 dark:text-emerald-500 mb-5 text-sm uppercase tracking-widest">
                          قائمة القطع المعتمدة:
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {Object.entries(selectedComponents).map(([catName, comp]) => {
                            if (!comp) return null;
                            return (
                              <div key={catName} className="flex p-4 bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/60 gap-4 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors group items-start sm:items-center">
                                {comp.imageUrl ? (
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 p-2 flex items-center justify-center shrink-0">
                                     <img src={comp.imageUrl} alt={comp.name} className="max-w-full max-h-full object-contain export-ignore" />
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
                                      {comp.amazonUrl && comp.amazonInStock === true && (
                                        <a href={getAffiliateUrl(comp.amazonUrl, 'amazon')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-[#232F3E] hover:bg-[#131A22] text-white text-[10px] rounded-lg font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                                          <span>Amazon</span>
                                          <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                      )}
                                      {comp.cazasouqUrl && comp.cazasouqInStock === true && (
                                        <a href={getAffiliateUrl(comp.cazasouqUrl, 'cazasouq')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-[#FF9900] hover:bg-[#E68A00] text-white text-[10px] rounded-lg font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                                          <span>Cazasouq</span>
                                          <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                      )}
                                      {comp.microlessUrl && comp.microlessInStock === true && (
                                        <a href={getAffiliateUrl(comp.microlessUrl, 'microless')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-[#0053D9] hover:bg-[#003899] text-white text-[10px] rounded-lg font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                                          <span>Microless</span>
                                          <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
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
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm border border-slate-200 dark:border-slate-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  نسخ كنص
                </button>
                <button 
                  onClick={exportBuildAsImage}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm border border-slate-200 dark:border-slate-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  تصدير صورة
                </button>
                
                <button 
                  onClick={handleSaveBuildClick}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
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
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0B1120] shrink-0">
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
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
                    <img src={detailsModal.comp.imageUrl} alt={detailsModal.comp.name} className="max-w-full max-h-full object-contain filter drop-shadow-sm" />
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
                  <span className="text-blue-600">⚙️</span> المواصفات الفنية
                </h4>
                {renderSpecs(detailsModal.comp.specs)}
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="text-blue-600">📄</span> نظرة عامة
                </h4>
                <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/30">
                  {detailsModal.comp.description 
                    ? formatTextWithLinks(detailsModal.comp.description) 
                    : "لا يوجد وصف إضافي متوفر لهذه القطعة حالياً."}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0B1120] flex gap-3 shrink-0">
              <button 
                onClick={() => { handleSelect(detailsModal.categoryName, detailsModal.comp.id); setDetailsModal(null); }} 
                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
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
              className="px-6 py-2.5 bg-blue-600 active:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md"
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
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0B1120] shrink-0">
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
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
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white font-medium"
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
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 flex justify-center items-center gap-2"
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