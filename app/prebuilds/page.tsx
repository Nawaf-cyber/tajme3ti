import { prisma } from '../../lib/prisma';
import SavePrebuildButton from './SavePrebuildButton';

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

  const economic = prebuilds.filter(p => p.budgetType === 'economic');
  const midrange = prebuilds.filter(p => p.budgetType === 'midrange');
  const highend = prebuilds.filter(p => p.budgetType === 'highend');

  const renderSection = (title: string, list: any[], colorMarker: string) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-14 last:mb-0">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
          <span className={`w-1.5 h-6 rounded-sm ${colorMarker}`}></span>
          {title}
        </h2>
        
        <div className="flex flex-col gap-4">
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

            return (
              <div 
                key={build.id} 
                className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-lg transition-all flex flex-col lg:flex-row overflow-hidden"
              >
                {/* القسم الأيمن: التفاصيل */}
                <div className="p-6 md:p-8 flex-1 selection:bg-blue-500/10">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white line-clamp-1">{build.title}</h3>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700/50">
                      تتضمن {partsCount} قطع
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap font-medium max-w-3xl selection:text-blue-600 selection:bg-blue-50">
                    {build.description}
                  </p>
                </div>
                
                {/* القسم الأيسر: السعر والإجراء */}
                <div className="bg-slate-50 dark:bg-[#0B1120] border-t lg:border-t-0 lg:border-r border-slate-100 dark:border-slate-800/80 p-6 md:p-8 lg:w-72 shrink-0 flex flex-col justify-center items-center lg:items-end gap-6">
                  <div className="font-black text-2xl text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 selection:bg-emerald-50 selection:text-emerald-700">
                    {build.price} <RiyalIcon size="h-6 w-6" />
                  </div>
                  <div className="w-full selection:bg-blue-600/10">
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-10 px-4 sm:px-6 lg:px-8 transition-colors selection:bg-blue-500/20">
      <div className="max-w-7xl mx-auto">
        
        {/* الترويسة الجديدة بناءً على الصورة المرفقة */}
        <div className="relative mb-20 pt-16 text-right selection:bg-blue-500/20">
          
          {/* الكبسولة العلوية كنمط التصميم الفني */}
          <div className="flex flex-col items-start lg:flex-row-reverse lg:items-center justify-between gap-6 mb-12">
            
            {/* الشارة اليمنى العلوية - "ARCHITECTURE PREVIEW 2026" مع الوميض الأزرق */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/50 shadow-[0_0_15px_-3px_#2563eb]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[11px] font-bold text-white uppercase tracking-widest">ARCHITECTURE PREVIEW 2026</span>
            </div>

            {/* النص الجانبي اليساري السفلي "VERIFIED CONFIGURATIONS" */}
            <span className="absolute bottom-20 left-0 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] selection:text-slate-900">
                VERIFIED CONFIGURATIONS
            </span>
          </div>

          {/* العنوان الرئيسي والوصف المقروء */}
          <div className="w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white leading-tight mb-5 selection:text-white dark:selection:text-slate-950">
              تكوينات <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400 selection:text-white dark:selection:text-slate-950">مثالية</span> جاهزة.
            </h1>
            
            <p className="text-base md:text-lg font-medium text-slate-600 dark:text-slate-400 max-w-2xl ml-auto leading-relaxed selection:text-slate-950 dark:selection:text-slate-100">
              أنظمة تم اختبار توافقها برمجياً لضمان أعلى مستويات الأداء. اختر تجميعتك وابدأ في تخصيصها داخل حسابك الشخصي بلمسة واحدة.
            </p>
          </div>
          
        </div>

        {prebuilds.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 font-bold shadow-sm selection:bg-blue-500/10">
            لا توجد تجميعات مقترحة مضافة حالياً.
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