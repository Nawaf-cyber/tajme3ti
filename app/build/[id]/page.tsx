import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

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

const getBottleneckMessage = (cpu: any, gpu: any) => {
  if (cpu?.performanceTier && gpu?.performanceTier) {
    const diff = cpu.performanceTier - gpu.performanceTier;
    if (diff < -1) {
      return {
        title: "⚠️ تنبيه أداء: المعالج أضعف بكثير من كرت الشاشة.",
        desc: "سيشكل المعالج 'عنق زجاجة' ولن يتمكن من مجاراة الكرت، خاصة على دقة 1080p. يُنصح بترقية المعالج أو اللعب على دقة 4K لتقليل الضغط عليه.",
        color: "text-amber-800 dark:text-amber-300",
        bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
      };
    } else if (diff > 1) {
      return {
        title: "💡 تنبيه أداء: كرت الشاشة أضعف من المعالج.",
        desc: "الأداء سيكون ممتازاً في ألعاب الرياضات الإلكترونية (Esports) لاعتمادها على المعالج، لكن الكرت سيحد من الأداء بشكل كبير في ألعاب القصة (AAA) والدقات العالية مثل 1440p و 4K.",
        color: "text-blue-800 dark:text-blue-300",
        bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      };
    } else {
      return {
        title: "🚀 توازن مثالي بين المعالج وكرت الشاشة.",
        desc: "المعالج والكرت من نفس الفئة تقريباً. ستحصل على أداء مستقر وتستغل كامل قوة الجهاز بدون عنق زجاجة ملحوظ.",
        color: "text-emerald-800 dark:text-emerald-300",
        bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
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
    RAM: build.ramId ? compMap.get(build.ramId) : null,
    Motherboard: build.motherboardId ? compMap.get(build.motherboardId) : null,
    Case: build.caseId ? compMap.get(build.caseId) : null,
    PSU: build.psuId ? compMap.get(build.psuId) : null,
    Storage: build.storageId ? compMap.get(build.storageId) : null,
  };

  const totalPriceRaw = Object.values(parts).reduce((sum, part) => sum + (part?.price || 0), 0);
  const totalPrice = Number(totalPriceRaw.toFixed(2));
  
  const bottleneck = getBottleneckMessage(parts.CPU, parts.GPU);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[80vh]">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="bg-blue-900 dark:bg-slate-800 p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{build.name}</h1>
            <p className="text-blue-200 dark:text-gray-400 text-sm mt-1">
              تم الإنشاء في: {new Date(build.createdAt).toLocaleDateString('ar-SA')}
            </p>
          </div>
          <div className="text-xl font-bold bg-blue-800 dark:bg-slate-700 px-4 py-2 rounded-lg flex items-center gap-1">
            {totalPrice} <RiyalIcon size="h-5 w-5" colorClass="bg-white" />
          </div>
        </div>

        <div className="p-6">
          
          {/* صندوق الاختناق بالتصميم الجديد والـ Tooltip */}
          {bottleneck && (
            <div className={`mb-6 p-4 border rounded-lg ${bottleneck.bg} flex items-center gap-2 w-fit relative`}>
              <span className={`font-bold text-sm ${bottleneck.color}`}>
                {bottleneck.title}
              </span>
              
         <div tabIndex={0} className="relative group cursor-pointer flex items-center justify-center shrink-0 outline-none">
           <span className={`text-sm font-bold underline cursor-pointer hover:opacity-70 transition-opacity ${bottleneck.color}`}>
  لماذا؟
</span>
  
          {/* الصندوق العائم (Tooltip) متوافق مع الجوال */}
          <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-[80vw] max-w-[260px] sm:w-64 p-3 bg-gray-900 dark:bg-black text-white text-xs leading-relaxed font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible transition-all duration-200 z-50 shadow-xl pointer-events-none text-center">
        {/* لاحظ: في ملف شاشة البناء المتغير اسمه result.bottleneck.desc وفي الملفين الأخرى اسمه bottleneck.desc */}
          {/* استخدم المتغير الصحيح بناءً على الملف، أو استخدم هذا السطر المزدوج ليعمل في كل الملفات تلقائياً: */}
          {bottleneck.desc}    
            <div className="absolute top-full right-1/2 translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-black"></div>
             </div>
           </div>
            </div>
          )}

          <div className="space-y-4">
            {Object.entries(parts).map(([category, part]: [string, any]) => (
              <div key={category} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700 gap-4">
                <div className="flex items-center gap-4">
                  {part?.imageUrl && (
                    <img src={part.imageUrl} alt={part.name} className="w-16 h-16 rounded object-contain bg-white dark:bg-slate-700 p-1 shadow-sm" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-gray-500 block mb-1">[{category}]</span>
                    <span className="text-gray-900 dark:text-gray-100 font-bold text-lg">
                      {part ? `${part.brand} ${part.name}` : <span className="text-red-500">لم يتم اختيار قطعة</span>}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {part && (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      {part.price} <RiyalIcon size="h-3 w-3" />
                    </span>
                  )}
                  
                  {part && (part.amazonUrl || part.cazasouqUrl) && (
                    <div className="flex gap-2">
                      {part.amazonUrl && (
                        <a href={part.amazonUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded font-bold transition-colors">
                          أمازون
                        </a>
                      )}
                      {part.cazasouqUrl && (
                        <a href={part.cazasouqUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded font-bold transition-colors">
                          كازاسوق
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center border-t border-gray-200 dark:border-slate-700 pt-6">
            <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm">
              ابني تجميعتك الخاصة ⚡
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}