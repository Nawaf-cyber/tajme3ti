'use client';
export const dynamic = 'force-dynamic';
import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

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
  
  // تمت إضافة صيغة الماركداون للروابط المخصصة في بداية البحث
  const regex = /(\[[^\]]+\]\([^\)]+\)|\[red\].*?\[\/red\]|\[green\].*?\[\/green\]|\[blue\].*?\[\/blue\]|\[yellow\].*?\[\/yellow\]|https?:\/\/[^\s]+)/g;
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    if (!part) return null;

    // 1. معالجة الروابط المخصصة بصيغة [الاسم](الرابط)
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

    // 2. معالجة الروابط الخام (لزر الموقع الرسمي)
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
    
    // 3. معالجة الألوان
    if (part.startsWith('[red]') && part.endsWith('[/red]')) return <span key={i} className="text-rose-600 dark:text-rose-400 font-bold">{part.slice(5, -6)}</span>;
    if (part.startsWith('[green]') && part.endsWith('[/green]')) return <span key={i} className="text-emerald-600 dark:text-emerald-400 font-bold">{part.slice(7, -8)}</span>;
    if (part.startsWith('[blue]') && part.endsWith('[/blue]')) return <span key={i} className="text-blue-600 dark:text-blue-400 font-bold">{part.slice(6, -7)}</span>;
    if (part.startsWith('[yellow]') && part.endsWith('[/yellow]')) return <span key={i} className="text-amber-600 dark:text-amber-400 font-bold">{part.slice(8, -9)}</span>;
    
    // 4. النص العادي
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

const SearchableSelect = ({ 
  categoryName, 
  components, 
  selectedComponent, 
  onSelect, 
  onShowDetails,
  showIncompatible
}: { 
  categoryName: string, 
  components: ComponentWithCompatibility[], 
  selectedComponent: Component | null, 
  onSelect: (id: string) => void,
  onShowDetails: (comp: Component) => void,
  showIncompatible: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const searched = components.filter(c => 
    `${c.brand} ${c.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const displayedComponents = showIncompatible ? searched : searched.filter(c => c.isCompatible);

  return (
    <div className="relative flex-1 min-w-0" ref={wrapperRef}>
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
        <svg className={`w-5 h-5 text-slate-500 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>

      {isOpen && (
        <div className="absolute z-30 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-[350px] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="relative">
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                className="w-full pl-3 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="ابحث عن قطعة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {displayedComponents.length > 0 ? (
              displayedComponents.map((comp) => (
                <li 
                  key={comp.id} 
                  className={`p-3 mb-1 rounded-lg transition-all border ${
                    comp.isCompatible 
                      ? 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer' 
                      : 'border-rose-200 bg-rose-50 dark:border-rose-900/30 dark:bg-rose-900/10 cursor-not-allowed opacity-90'
                  }`}
                  onClick={() => {
                    if (!comp.isCompatible) return;
                    onSelect(comp.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start w-full gap-2">
                      <span className={`text-sm font-bold leading-tight ${comp.isCompatible ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                        <span className={`${getBrandColor(comp, categoryName)} mr-1`}>{comp.brand}</span>
                        {comp.name}
                      </span>
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
                      <span className="text-[11px] text-rose-700 dark:text-rose-400 font-extrabold bg-rose-100 dark:bg-rose-900/40 px-2.5 py-1 rounded-md w-fit inline-flex items-center gap-1 border border-rose-200 dark:border-rose-800/50">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {comp.reason}
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

export default function PCBuilderClient({ categories, importedSelections = {} }: { categories: Category[], importedSelections?: Record<string, string> }) {
  const { data: session } = useSession();
  
  const getInitialSelections = () => {
    const initialState: Record<string, Component | null> = {};
    categories.forEach(cat => {
      const importedCompId = importedSelections[cat.id];
      if (importedCompId) {
        initialState[cat.name] = cat.components.find(c => c.id === importedCompId) || null;
      } else {
        initialState[cat.name] = null;
      }
    });
    return initialState;
  };

  const [selectedComponents, setSelectedComponents] = useState<Record<string, Component | null>>(getInitialSelections);
  const [result, setResult] = useState<{ 
    status: 'success' | 'error' | 'idle', 
    message: string, 
    bottleneck?: { title: string, desc: string, color: string, bg: string } | null, 
    totalTdp: number, 
    totalPrice: number 
  }>({ status: 'idle', message: '', totalTdp: 0, totalPrice: 0 });
  const [detailsModal, setDetailsModal] = useState<{ comp: Component, categoryName: string } | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [buildName, setBuildName] = useState("");
  const [showIncompatible, setShowIncompatible] = useState(false);
  
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkCompatibility();
  }, [selectedComponents]);

  const handleSelect = (categoryName: string, componentId: string) => {
    const category = categories.find(c => c.name === categoryName);
    const component = category?.components.find(c => c.id === componentId) || null;
    setSelectedComponents(prev => ({ ...prev, [categoryName]: component }));
  };

  const parseSpecs = (specsStr: any) => {
    if (!specsStr) return {};
    return typeof specsStr === 'string' ? JSON.parse(specsStr) : specsStr;
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

    if (!cpu || !mobo || !ram || !gpu || !pcCase || !psu) {
      setResult({ status: 'error', message: 'الرجاء اختيار جميع القطع الأساسية لإتمام الفحص.', totalTdp, totalPrice });
      return;
    }

    const cpuSpecs = parseSpecs(cpu.specs);
    const moboSpecs = parseSpecs(mobo.specs);
    const ramSpecs = parseSpecs(ram.specs);
    const gpuSpecs = parseSpecs(gpu.specs);
    const caseSpecs = parseSpecs(pcCase.specs);
    const psuSpecs = parseSpecs(psu.specs);

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
    if (cpu.performanceTier && gpu.performanceTier) {
      const diff = cpu.performanceTier - gpu.performanceTier;
      if (diff < -1) {
        bottleneck = {
          title: "⚠️ عنق زجاجة ملحوظ: المعالج أضعف من كرت الشاشة.",
          desc: "لن يتمكن المعالج من مجاراة سرعة الكرت (خصوصاً على دقة 1080p). يُنصح بترقية المعالج أو اللعب بدقة 4K.",
          color: "text-amber-900 dark:text-amber-400",
          bg: "bg-amber-100 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800/50"
        };
      } else if (diff > 1) {
        bottleneck = {
          title: "💡 تنبيه أداء: كرت الشاشة أضعف من المعالج.",
          desc: "الأداء سيكون ممتازاً لألعاب (Esports)، لكن الكرت سيحد من قوة الجهاز في ألعاب القصة (AAA) والدقات العالية.",
          color: "text-blue-900 dark:text-blue-400",
          bg: "bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800/50"
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

  const handleSaveBuildClick = () => {
    if (!session) {
      toast.error('يجب تسجيل الدخول أولاً لحفظ التجميعة');
      return;
    }
    setBuildName("تجميعة " + new Date().toLocaleDateString('ar-SA'));
    setSaveModalOpen(true);
  };

  const confirmSaveBuild = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: buildName || "تجميعة مخصصة",
        cpuId: selectedComponents['CPU']?.id || null,
        gpuId: selectedComponents['GPU']?.id || null,
        ramId: selectedComponents['RAM']?.id || null,
        motherboardId: selectedComponents['Motherboard']?.id || null,
        caseId: selectedComponents['Case']?.id || null,
        psuId: selectedComponents['PSU']?.id || null,
        storageId: selectedComponents['Storage']?.id || null,
      };

      const res = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('فشل الحفظ');
      
      toast.success('تم حفظ التجميعة بنجاح!');
      setSaveModalOpen(false);
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ التجميعة');
    } finally {
      setIsSaving(false);
    }
  };

  const exportBuildAsImage = async () => {
    if (!resultRef.current) return;
    try {
      const filter = (node: HTMLElement) => {
        return !node.classList?.contains('export-ignore');
      };

      const dataUrl = await toPng(resultRef.current, { 
        backgroundColor: '#0f172a',
        filter: filter as any
      }); 

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "My-PC-Build.png";
      link.click();
    } catch (error) {
      console.error("خطأ في تصدير الصورة:", error);
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

  return (
    <div className="max-w-5xl mx-auto my-10 bg-white dark:bg-[#0F172A] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800/80 overflow-hidden">
      
      {/* الهيدر العلوي */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-10 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 flex items-center justify-center gap-3 relative z-10">
          منصة تجميع الـ PC
        </h1>
        <p className="text-slate-300 font-medium text-sm md:text-base relative z-10">اختر قطعك، تأكد من التوافق الذكي، وابنِ جهاز أحلامك.</p>
      </div>

      <div className="p-6 md:p-10">
        
        {/* شريط الخيارات العلوي */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b border-slate-200 dark:border-slate-800/60 gap-4">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            لوحة اختيار القطع
          </h2>
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

                <div className="flex-1">
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

                  {result.bottleneck && (
                    <div className={`mt-6 p-5 border rounded-2xl ${result.bottleneck.bg} flex items-start gap-4 relative shadow-sm`}>
                      <div className="flex-1">
                        <h4 className={`font-black text-base mb-1 ${result.bottleneck.color}`}>
                          {result.bottleneck.title}
                        </h4>
                        <p className={`text-sm font-medium opacity-90 ${result.bottleneck.color}`}>
                          {result.bottleneck.desc}
                        </p>
                      </div>
                    </div>
                  )}

                  {result.status === 'success' && (
                    <div className="mt-8 pt-8 border-t border-emerald-200/50 dark:border-emerald-800/30">
                      <h4 className="font-extrabold text-emerald-900 dark:text-emerald-500 mb-5 text-sm uppercase tracking-widest">
                        قائمة القطع المعتمدة:
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {Object.entries(selectedComponents).map(([catName, comp]) => {
                          if (!comp) return null;
                          return (
                            <div key={catName} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white dark:bg-slate-800/80 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 gap-3">
                              <div className="text-sm flex-1 leading-tight">
                                <span className="font-bold text-slate-500 dark:text-slate-400 ml-2 text-[11px] uppercase tracking-wider block sm:inline">{catName}</span>
                                <span className={getBrandColor(comp, catName) + " ml-1"}>{comp.brand}</span>
                                <span className="text-slate-900 dark:text-white font-bold">{comp.name}</span>
                              </div>
                              <div className="flex gap-2 export-ignore shrink-0">
                                {comp.amazonUrl && (
                                  <a href={comp.amazonUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#232F3E] hover:bg-[#131A22] text-white text-[11px] rounded-lg font-bold transition-colors shadow-sm">
                                    Amazon
                                  </a>
                                )}
                                {comp.cazasouqUrl && (
                                  <a href={comp.cazasouqUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#FF9900] hover:bg-[#E68A00] text-white text-[11px] rounded-lg font-bold transition-colors shadow-sm">
                                    Cazasouq
                                  </a>
                                )}
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

            {result.status === 'success' && (
              <div className="mt-6 flex flex-wrap justify-end gap-3">
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
                  حفظ التجميعة لحسابي
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

      {/* نافذة حفظ التجميعة */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-blue-100 dark:border-blue-800/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              </div>
              <h3 className="font-black text-2xl mb-2 text-slate-900 dark:text-white">حفظ التجميعة</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">أدخل اسماً مميزاً لتجميعتك للرجوع إليها لاحقاً</p>
              
              <input 
                type="text" 
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white font-bold mb-8 text-center placeholder-slate-400"
                placeholder="مثال: تجميعة المونتاج 2026..."
                autoFocus
              />
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmSaveBuild} 
                  disabled={isSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 active:scale-95"
                >
                  {isSaving ? 'جاري الحفظ...' : 'تأكيد الحفظ'}
                </button>
                <button 
                  onClick={() => setSaveModalOpen(false)} 
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-transparent dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400 py-3 rounded-xl font-bold transition-colors border border-slate-200 dark:border-transparent"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}