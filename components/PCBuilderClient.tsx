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

const RiyalIcon = ({ size = 'h-4 w-4', colorClass = 'bg-emerald-600 dark:bg-emerald-400' }: { size?: string, colorClass?: string }) => (
  <div 
    className={`${size} ${colorClass} inline-block shrink-0`} 
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
        className="p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 cursor-pointer flex justify-between items-center w-full min-h-[50px] gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="whitespace-normal break-words flex-1 text-gray-800 dark:text-gray-100 rtl:text-right text-sm leading-relaxed">
          {selectedComponent ? (
            <span className="flex items-center gap-1 flex-wrap">
              {selectedComponent.brand} {selectedComponent.name} - 
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mx-1">
                {selectedComponent.price} <RiyalIcon size="h-3 w-3" />
              </span>
            </span>
          ) : (
            `-- اختر ${categoryName} --`
          )}
        </span>
        <span className="text-gray-500 shrink-0">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-h-96 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 dark:border-slate-700">
            <input
              type="text"
              className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder={`ابحث في ${categoryName}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <ul className="flex-1 overflow-y-auto">
            {displayedComponents.length > 0 ? (
              displayedComponents.map((comp) => (
                <li 
                  key={comp.id} 
                  className={`p-3 border-b border-gray-50 dark:border-slate-700/50 last:border-0 transition-all ${
                    comp.isCompatible 
                      ? 'hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer' 
                      : 'bg-red-50/30 dark:bg-red-900/10 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (!comp.isCompatible) return;
                    onSelect(comp.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-sm font-semibold ${comp.isCompatible ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500'}`}>
                        {comp.brand} {comp.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${comp.isCompatible ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {comp.price} <RiyalIcon size="h-3 w-3" />
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onShowDetails(comp); }}
                          className="px-2 py-1 text-xs bg-gray-200 dark:bg-slate-600 rounded"
                        >التفاصيل</button>
                      </div>
                    </div>
                    {!comp.isCompatible && (
                      <span className="text-[11px] text-red-600 dark:text-red-400 font-bold bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded w-fit">
                        ❌ غير متوافق: {comp.reason}
                      </span>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="p-4 text-gray-500 text-center text-sm">لا توجد قطع مطابقة</li>
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
          reason = `طول الكرت الحالي (${gpuSpecs.lengthMm}mm) يتجاوز أقصى مساحة للكيس (${specs.maxGpuLength}mm)`;
        }
      }
      
      if (categoryName === 'GPU' && pcCase) {
        const caseSpecs = parseSpecs(pcCase.specs);
        if (specs.lengthMm && caseSpecs.maxGpuLength && parseFloat(specs.lengthMm) > parseFloat(caseSpecs.maxGpuLength)) {
          isCompatible = false;
          reason = `طول الكرت (${specs.lengthMm}mm) لا يتسع داخل الكيس المختار (${caseSpecs.maxGpuLength}mm)`;
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
      setResult({ status: 'error', message: 'الرجاء اختيار القطع الأساسية للتحقق.', totalTdp, totalPrice });
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
      setResult({ status: 'error', message: `تحذير طاقة: الاستهلاك التقريبي مع هامش الأمان (${requiredWattage} واط) يتجاوز قدرة مزود الطاقة (${psuSpecs?.wattage} واط).`, totalTdp, totalPrice });
      return;
    }

    let bottleneck = null;
    if (cpu.performanceTier && gpu.performanceTier) {
      const diff = cpu.performanceTier - gpu.performanceTier;
      if (diff < -1) {
        bottleneck = {
          title: "⚠️ تنبيه أداء: المعالج أضعف بكثير من كرت الشاشة.",
          desc: "سيشكل المعالج 'عنق زجاجة' ولن يتمكن من مجاراة الكرت، خاصة على دقة 1080p. يُنصح بترقية المعالج أو اللعب على دقة 4K لتقليل الضغط عليه.",
          color: "text-amber-800 dark:text-amber-300",
          bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
        };
      } else if (diff > 1) {
        bottleneck = {
          title: "💡 تنبيه أداء: كرت الشاشة أضعف من المعالج.",
          desc: "الأداء سيكون ممتازاً في ألعاب الرياضات الإلكترونية (Esports) لاعتمادها على المعالج، لكن الكرت سيحد من الأداء بشكل كبير في ألعاب القصة (AAA) والدقات العالية مثل 1440p و 4K.",
          color: "text-blue-800 dark:text-blue-300",
          bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        };
      } else {
        bottleneck = {
          title: "🚀 توازن مثالي بين المعالج وكرت الشاشة.",
          desc: "المعالج والكرت من نفس الفئة تقريباً. ستحصل على أداء مستقر وتستغل كامل قوة الجهاز بدون عنق زجاجة ملحوظ.",
          color: "text-emerald-800 dark:text-emerald-300",
          bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
        };
      }
    }

    setResult({ 
      status: 'success', 
      message: 'تم التوافق! جميع القطع متوافقة تماماً.', 
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
    if (!specsStr) return "لا توجد تفاصيل إضافية.";
    try {
      const parsed = parseSpecs(specsStr);
      return (
        <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700 dark:text-gray-300">
          {Object.entries(parsed).map(([key, value]) => (
            <li key={key}><span className="font-semibold capitalize">{key}:</span> {String(value)}</li>
          ))}
        </ul>
      );
    } catch (e) {
      return String(specsStr);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 dark:from-slate-800 dark:to-slate-900 p-8 text-center text-white rounded-t-2xl">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
          <span>💻</span> منصة بناء أجهزة الـ PC
        </h1>
        <p className="text-blue-100 dark:text-gray-300 text-sm">اختر القطع، ابحث عنها، وتأكد من توافقها</p>
      </div>

      <div className="p-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-100 dark:border-slate-800 gap-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">اختر قطع التجميعة</h2>
          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors hover:bg-gray-100 dark:hover:bg-slate-700">
            <input
              type="checkbox"
              checked={showIncompatible}
              onChange={(e) => setShowIncompatible(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 select-none">
              إظهار القطع غير المتوافقة (لتفسير السبب)
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {categories.map((category) => {
            const compsWithComp = getComponentsWithCompatibility(category.name, category.components);
            return (
              <div key={category.id} className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {category.name}
                </label>
                <div className="flex gap-3 items-start w-full min-w-0">
                  {selectedComponents[category.name]?.imageUrl && (
                    <img 
                      src={selectedComponents[category.name]?.imageUrl as string} 
                      alt={selectedComponents[category.name]?.name}
                      className="w-14 h-14 rounded-lg object-contain bg-white dark:bg-slate-800 border p-1 shadow-sm shrink-0 mt-1" 
                    />
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
                {selectedComponents[category.name] && 
                 !getComponentsWithCompatibility(category.name, category.components).find(c => c.id === selectedComponents[category.name]?.id)?.isCompatible && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400 font-bold">
                    ❌ غير متوافق: {getComponentsWithCompatibility(category.name, category.components).find(c => c.id === selectedComponents[category.name]?.id)?.reason}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {result.status !== 'idle' && (
          <div className="mt-8 relative">
            <div ref={resultRef} className={`p-6 rounded-xl border ${result.status === 'success' ? 'bg-green-50 dark:bg-slate-800 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200'}`}>
              <div className="flex items-start gap-4">
                <div className="text-2xl">{result.status === 'success' ? '✅' : '❌'}</div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 ${result.status === 'success' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                    {result.message}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-gray-800 dark:text-gray-200">
                    <span>⚡ الطاقة المطلوبة: {result.totalTdp}W</span>
                    <span className="flex items-center gap-1">💰 التكلفة الإجمالية: <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">{result.totalPrice} <RiyalIcon size="h-4 w-4" /></span></span>
                  </div>

                  {result.bottleneck && (
                    <div className={`mt-5 p-4 border rounded-lg ${result.bottleneck.bg} flex items-center gap-2 w-fit relative`}>
                      <span className={`font-bold text-sm ${result.bottleneck.color}`}>
                        {result.bottleneck.title}
                      </span>
                      
                      <div className="relative group cursor-pointer flex items-center justify-center">
                        <span className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg transition-colors">
                          ℹ️
                        </span>
                        
                        <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-64 p-3 bg-gray-900 dark:bg-black text-white text-xs leading-relaxed font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl pointer-events-none text-center">
                          {result.bottleneck.desc}
                          <div className="absolute top-full right-1/2 translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-black"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.status === 'success' && (
                    <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-800/50">
                      <h4 className="font-bold text-green-900 dark:text-green-400 mb-4">🛒 قطع التجميعة المتوافقة:</h4>
                      <div className="space-y-3">
                        {Object.entries(selectedComponents).map(([catName, comp]) => {
                          if (!comp) return null;
                          return (
                            <div key={catName} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700/50 gap-3">
                              <div className="text-sm flex-1 whitespace-normal break-words leading-relaxed">
                                <span className="font-bold text-gray-400 dark:text-gray-500 ml-2 block sm:inline">[{catName}]</span>
                                <span className="text-gray-900 dark:text-gray-100 font-medium">{comp.brand} {comp.name}</span>
                              </div>
                              <div className="flex gap-2 export-ignore shrink-0">
                                {comp.amazonUrl && (
                                  <a href={comp.amazonUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-md font-bold transition-colors shadow-sm">
                                    أمازون
                                  </a>
                                )}
                                {comp.cazasouqUrl && (
                                  <a href={comp.cazasouqUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md font-bold transition-colors shadow-sm">
                                    كازاسوق
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
              <div className="mt-4 flex justify-end gap-3">
                <button 
                  onClick={exportBuildAsImage}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-md"
                >
                  📸 حفظ التجميعة كصورة
                </button>
                <button 
                  onClick={handleSaveBuildClick}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-md"
                >
                  💾 حفظ في حسابي
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {detailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b dark:border-slate-800 bg-gray-50 dark:bg-slate-800 shrink-0 rounded-t-2xl">
              <h2 className="font-bold text-xl text-gray-900 dark:text-white">تفاصيل القطعة</h2>
              <button onClick={() => setDetailsModal(null)} className="text-gray-500 hover:text-red-500 font-bold text-xl transition-colors">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-4">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{detailsModal.comp.brand}</span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 whitespace-normal break-words">{detailsModal.comp.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                  <span className="block text-sm text-gray-500 dark:text-gray-400">السعر</span>
                  <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    {detailsModal.comp.price} <RiyalIcon size="h-4 w-4" />
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                  <span className="block text-sm text-gray-500 dark:text-gray-400">استهلاك الطاقة</span>
                  <span className="font-bold text-lg dark:text-white">{detailsModal.comp.tdpWattage}W</span>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 dark:text-gray-200 border-b dark:border-slate-700 pb-2 mb-2">المواصفات التقنية:</h4>
                {renderSpecs(detailsModal.comp.specs)}
              </div>
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 dark:text-gray-200 border-b dark:border-slate-700 pb-2 mb-2">وصف القطعة:</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line break-words">
                  {detailsModal.comp.description ? (
                    detailsModal.comp.description.split(/(https?:\/\/[^\s]+)/g).map((part, index) => 
                      /(https?:\/\/[^\s]+)/.test(part) ? (
                        <a 
                          key={index} 
                          href={part} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                        >
                          {part}
                        </a>
                      ) : (
                        part
                      )
                    )
                  ) : (
                    "لا يوجد وصف متوفر لهذه القطعة."
                  )}
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <button onClick={() => { handleSelect(detailsModal.categoryName, detailsModal.comp.id); setDetailsModal(null); }} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors">اختيار القطعة</button>
                <button onClick={() => setDetailsModal(null)} className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-white rounded-xl font-bold transition-colors">إغلاق</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">تسمية التجميعة</h3>
              <input 
                type="text" 
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-white font-bold mb-6"
                placeholder="أدخل اسم التجميعة هنا..."
                autoFocus
              />
              <div className="flex gap-3">
                <button 
                  onClick={confirmSaveBuild} 
                  disabled={isSaving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button 
                  onClick={() => setSaveModalOpen(false)} 
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-white py-2 rounded-lg font-bold transition-colors"
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