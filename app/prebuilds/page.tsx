import { prisma } from '../../lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تجميعات جاهزة بميزانيات مختلفة',
  description: 'تجميعات حاسب جاهزة ومفحوصة التوافق لكل ميزانية — قطعها متوفّرة فعلاً بأسعارها اللحظية في المتاجر السعودية.',
  alternates: { canonical: '/prebuilds' },
};
import SavePrebuildButton from './SavePrebuildButton';
import Link from 'next/link';
import { isComponentAvailable } from '../../lib/availability';

// تحديث حي دائماً — يعرض أحدث حالة التوفّر بلا حاجة redeploy
export const dynamic = 'force-dynamic';

const RiyalIcon = ({ size = 'h-5 w-5', colorClass = 'bg-emerald-600 dark:bg-emerald-400' }: { size?: string, colorClass?: string }) => (
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

export default async function PrebuildsPage() {
  const prebuilds = await prisma.prebuild.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  const categories = await prisma.category.findMany();
  
  const allComponents = await prisma.component.findMany({
    select: {
      id: true,
      name: true,
      amazonPrice: true,
      amazonInStock: true,
      cazasouqPrice: true,
      cazasouqInStock: true,
      microlessPrice: true,
      microlessInStock: true,
    }
  });

  const economic = prebuilds.filter(p => p.budgetType === 'economic');
  const midrange = prebuilds.filter(p => p.budgetType === 'midrange');
  const highend = prebuilds.filter(p => p.budgetType === 'highend');

  const renderSection = (title: string, list: any[], colorMarker: string) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-20 last:mb-0">
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-3 h-10 rounded-full ${colorMarker} shadow-lg`}></div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
        </div>
        
        <div className="flex flex-col gap-8">
          {list.map((build) => {
            const compObj = typeof build.components === 'string' ? JSON.parse(build.components) : build.components || {};
            const partsCount = Object.keys(compObj).length;
            
            const getCompId = (catName: string) => {
              const cat = categories.find((c: any) => c.name === catName);
              return cat ? (compObj[cat.id] || null) : null;
            };

            const payload = {
              name: build.title,
              cpuId: getCompId('CPU'),
              motherboardId: getCompId('Motherboard'),
              ramId: getCompId('RAM'),
              gpuId: getCompId('GPU'),
              caseId: getCompId('Case'),
              psuId: getCompId('PSU'),
              storageId: getCompId('Storage')
            };

            const buildPartsDisplay = categories.map(cat => {
              const compId = compObj[cat.id];
              if (!compId) return null;
              const compDetails = allComponents.find((c: any) => c.id === compId);
              return {
                categoryId: cat.id,
                categoryName: cat.name,
                componentId: compId,
                componentName: compDetails?.name || 'غير متوفر',
                isAvailable: compDetails ? isComponentAvailable(compDetails) : false,
                shortCode: cat.name.substring(0, 2).toUpperCase()
              };
            }).filter(Boolean);

            return (
              <div 
                key={build.id} 
                className="group bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300 flex flex-col lg:flex-row overflow-hidden"
              >
                {/* القسم الأيمن: المحتوى والقطع */}
                <div className="p-6 md:p-8 flex-1 flex flex-col selection:bg-blue-500/10">
                  
                  {/* العنوان ووسم عدد القطع */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800/60">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {build.title}
                    </h3>
                    <div className="shrink-0 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/50">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      تتضمن {partsCount} قطع
                    </div>
                  </div>

                  {/* شبكة مربعات القطع */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                    {buildPartsDisplay.map((part: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={`bg-slate-50 dark:bg-[#151E32]/50 border p-3 rounded-2xl flex items-center gap-3.5 hover:bg-white dark:hover:bg-[#1A233A] hover:shadow-md transition-all duration-300 ${part.isAvailable ? 'border-slate-100 dark:border-slate-800/60' : 'border-amber-300 dark:border-amber-600/50'}`}
                      >
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 border border-slate-300/50 dark:border-slate-700/50">
                          {part.shortCode}
                        </div>
                        <div className="flex flex-col overflow-hidden flex-1">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-0.5">
                            {part.categoryName}
                          </span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate w-full pr-2">
                            {part.componentName}
                          </span>
                          {!part.isAvailable && (
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-black inline-flex items-center gap-1 mt-0.5">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              غير متوفر حالياً
                            </span>
                          )}
                        </div>
                        {part.componentId && (
                          <Link 
                            href={`/components/${part.componentId}`} 
                            title="التفاصيل"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* صندوق الوصف */}
                  {build.description && (
                    <div className="mt-auto bg-slate-50 dark:bg-[#151E32]/30 border-r-4 border-r-blue-500 dark:border-r-blue-400 rounded-l-2xl p-5">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-loose whitespace-pre-wrap">
                        {build.description}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* القسم الأيسر: السعر وزر الحفظ */}
                <div className="bg-slate-50 dark:bg-[#0B1120] border-t lg:border-t-0 lg:border-r border-slate-100 dark:border-slate-800/80 p-8 lg:w-80 shrink-0 flex flex-col justify-center items-center lg:items-end gap-8 relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none"></div>
                  
                  <div className="text-center lg:text-right relative z-10 w-full">
                    <span className="inline-block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                      أفضل سعر مجمع
                    </span>
                    <div className="font-black text-4xl text-emerald-600 dark:text-emerald-400 flex items-center justify-center lg:justify-end gap-2 mt-2 selection:bg-emerald-50 selection:text-emerald-700">
                      {Number(build.price).toFixed(2)} <RiyalIcon size="h-8 w-8" />
                    </div>
                  </div>

                  <div className="w-full relative z-10">
                    <SavePrebuildButton payload={payload} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-10 px-4 sm:px-6 lg:px-8 transition-colors selection:bg-blue-500/20 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="relative mb-24 pt-16 text-right selection:bg-blue-500/20">
          <div className="flex flex-col items-start lg:flex-row-reverse lg:items-center justify-between gap-6 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-700/50 shadow-[0_0_20px_-5px_#2563eb]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-[0.15em]">ARCHITECTURE PREVIEW 2026</span>
            </div>

            <span className="absolute bottom-20 left-0 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] selection:text-slate-900">
                VERIFIED CONFIGURATIONS
            </span>
          </div>

          <div className="w-full">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-950 dark:text-white leading-[1.1] mb-6 tracking-tight">
              تكوينات <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-emerald-400">مثالية</span> جاهزة.
            </h1>
            <p className="text-lg md:text-xl font-medium text-slate-600 dark:text-slate-400 max-w-2xl ml-auto leading-relaxed">
              أنظمة تم اختبار توافقها برمجياً لضمان أعلى مستويات الأداء. اختر تجميعتك وابدأ في تخصيصها داخل حسابك الشخصي بلمسة واحدة.
            </p>
          </div>
        </div>

        {prebuilds.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-[2rem] text-slate-500 font-bold shadow-sm flex flex-col items-center gap-6">
            <span className="text-6xl drop-shadow-md opacity-80">🛠️</span>
            <p className="text-xl">لا توجد تجميعات مقترحة مضافة حالياً.</p>
          </div>
        ) : (
          <>
            {renderSection("الفئة الاقتصادية", economic, "bg-emerald-500")}
            {renderSection("الفئة المتوسطة", midrange, "bg-blue-500")}
            {renderSection("الفئة الاحترافية العليا", highend, "bg-purple-500")}
          </>
        )}
        
      </div>
    </div>
  );
}