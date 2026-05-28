import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const RiyalIcon = ({ size = 'h-4 w-4', colorClass = 'bg-emerald-600 dark:bg-emerald-400' }: { size?: string, colorClass?: string }) => (
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

// تحديد لون النص بناءً على الشركة (AMD، Intel، NVIDIA)
const getBrandColor = (brand: string, name: string, category: string) => {
  if (category !== 'CPU' && category !== 'GPU') return 'text-slate-900 dark:text-white';
  const text = `${brand || ''} ${name || ''}`.toLowerCase();
  
  if (text.includes('amd') || text.includes('radeon')) return 'text-red-600 dark:text-red-500';
  if (text.includes('nvidia') || text.includes('rtx') || text.includes('gtx')) return 'text-[#76b900] dark:text-[#8ce600]';
  if (text.includes('intel')) return 'text-blue-600 dark:text-blue-400';
  
  return 'text-slate-900 dark:text-white';
};

const getBottleneckMessage = (cpu: any, gpu: any) => {
  if (cpu?.performanceTier && gpu?.performanceTier) {
    const diff = cpu.performanceTier - gpu.performanceTier;
    if (diff < -1) {
      return {
        title: "تنبيه أداء: المعالج أضعف من الكرت",
        desc: "سيشكل المعالج 'عنق زجاجة' ولن يتمكن من مجاراة الكرت. يُنصح بترقية المعالج أو اللعب على دقات عالية لتقليل الضغط.",
        color: "text-amber-700 dark:text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
        icon: "⚠️"
      };
    } else if (diff > 1) {
      return {
        title: "تنبيه أداء: الكرت أضعف من المعالج",
        desc: "الكرت سيحد من الأداء بشكل كبير في ألعاب القصة (AAA) والدقات العالية. أداء ممتاز في ألعاب الرياضات الإلكترونية فقط.",
        color: "text-blue-700 dark:text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
        icon: "💡"
      };
    } else {
      return {
        title: "توازن أداء مثالي",
        desc: "المعالج والكرت من نفس الفئة تقريباً. ستحصل على أداء مستقر وتستغل كامل قوة الجهاز بدون عنق زجاجة ملحوظ.",
        color: "text-emerald-700 dark:text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
        icon: "🚀"
      };
    }
  }
  return null;
};

export default async function SharedBuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const build = await prisma.savedBuild.findUnique({
    where: { id }
  });

  if (!build) return notFound();

  const componentIds = [build.cpuId, build.gpuId, build.ramId, build.motherboardId, build.caseId, build.psuId, build.storageId].filter(Boolean) as string[];

  const components = await prisma.component.findMany({
    where: { id: { in: componentIds } },
    select: { id: true, name: true, brand: true, price: true, imageUrl: true, amazonUrl: true, cazasouqUrl: true, performanceTier: true }
  });

  const compMap = new Map(components.map(c => [c.id, c]));

  const parts = {
    CPU: build.cpuId ? compMap.get(build.cpuId) : null,
    GPU: build.gpuId ? compMap.get(build.gpuId) : null,
    Motherboard: build.motherboardId ? compMap.get(build.motherboardId) : null,
    RAM: build.ramId ? compMap.get(build.ramId) : null,
    Storage: build.storageId ? compMap.get(build.storageId) : null,
    PSU: build.psuId ? compMap.get(build.psuId) : null,
    Case: build.caseId ? compMap.get(build.caseId) : null,
  };

  const totalPriceRaw = Object.values(parts).reduce((sum, part) => sum + (part?.price || 0), 0);
  const totalPrice = Number(totalPriceRaw.toFixed(2));
  
  const bottleneck = getBottleneckMessage(parts.CPU, parts.GPU);

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-[#0B1120] py-12 lg:py-20 px-4 transition-colors">
      <div className="max-w-3xl mx-auto">
        
        {/* الترويسة */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-200 dark:border-slate-800/80 pb-6 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{build.name}</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              تم الإنشاء في: <span dir="ltr">{new Date(build.createdAt).toLocaleDateString('ar-SA')}</span>
            </p>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
            {totalPrice} <RiyalIcon size="h-6 w-6" colorClass="bg-emerald-600 dark:bg-emerald-400" />
          </div>
        </div>

        {/* مؤشر عنق الزجاجة (تصميم مباشر وواضح) */}
        {bottleneck && (
          <div className={`mb-8 p-5 border rounded-2xl ${bottleneck.bg} flex flex-col sm:flex-row gap-4 items-start sm:items-center`}>
            <div className="text-2xl shrink-0">{bottleneck.icon}</div>
            <div>
              <h3 className={`font-black text-base mb-1 ${bottleneck.color}`}>{bottleneck.title}</h3>
              <p className={`text-sm font-medium opacity-90 leading-relaxed ${bottleneck.color}`}>
                {bottleneck.desc}
              </p>
            </div>
          </div>
        )}

        {/* قائمة القطع */}
        <div className="flex flex-col gap-3">
          {Object.entries(parts).map(([category, part]: [string, any]) => {
            const brandColor = part ? getBrandColor(part.brand, part.name, category) : 'text-slate-400';
            
            return (
              <div key={category} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 transition-colors gap-4">
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 shrink-0 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center justify-center p-2 border border-slate-100 dark:border-slate-800">
                    <img 
                      src={part?.imageUrl || `/images/${category.toLowerCase()}/boxed.png`} 
                      alt={part?.name || category} 
                      className="max-w-full max-h-full object-contain filter drop-shadow-sm opacity-90"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                      {category}
                    </span>
                    {part ? (
                      <h3 className={`text-sm md:text-base font-bold ${brandColor} leading-tight`}>
                        {part.brand} {part.name}
                      </h3>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-medium text-sm">
                        لم يتم اختيار قطعة
                      </span>
                    )}
                  </div>
                </div>
                
                {part && (
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                    <div className="font-black text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                      {part.price} <RiyalIcon size="h-3.5 w-3.5" colorClass="bg-slate-900 dark:bg-white" />
                    </div>
                    
                    {(part.amazonUrl || part.cazasouqUrl) && (
                      <div className="flex gap-1.5">
                        {part.amazonUrl && (
                          <a href={part.amazonUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-[#FF9900]/10 hover:bg-[#FF9900]/20 text-[#D47E00] dark:text-[#FF9900] text-[10px] rounded border border-[#FF9900]/20 font-bold transition-colors">
                            أمازون
                          </a>
                        )}
                        {part.cazasouqUrl && (
                          <a href={part.cazasouqUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-[10px] rounded border border-purple-500/20 font-bold transition-colors">
                            كازاسوق
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            );
          })}
        </div>

        {/* زر الإجراء السفلي */}
        <div className="mt-12 text-center">
          <Link href="/builder" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-sm active:scale-95 text-sm">
            ابني تجميعتك الخاصة ⚡
          </Link>
        </div>

      </div>
    </div>
  );
}