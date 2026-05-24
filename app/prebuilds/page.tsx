import { prisma } from '../../lib/prisma';
import SavePrebuildButton from './SavePrebuildButton';

const RiyalIcon = ({ size = 'h-5 w-5' }: { size?: string }) => (
  <div 
    className={`${size} bg-emerald-600 dark:bg-emerald-400 inline-block`} 
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

  const renderSection = (title: string, list: any[], badgeColor: string) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-6 flex items-center gap-3">
          <span className={`w-3 h-6 rounded-sm ${badgeColor}`}></span>
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((build) => {
            const compObj = typeof build.components === 'string' ? JSON.parse(build.components) : build.components || {};
            
            // دالة استخراج معرف القطعة بناءً على اسم الفئة ليتوافق مع API الحفظ
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
              <div key={build.id} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{build.title}</h3>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                    {build.price} <RiyalIcon size="h-6 w-6" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{build.description}</p>
                </div>
                <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-auto pt-4">
                  <SavePrebuildButton payload={payload} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center lg:text-right">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3">تجميعات PC جاهزة ومقترحة</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">اختر التجميعة المناسبة واحفظها في حسابك مباشرة</p>
        </div>

        {prebuilds.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 font-medium shadow-sm">
            لا توجد تجميعات مقترحة مضافة حالياً.
          </div>
        ) : (
          <>
            {renderSection("الفئة الاقتصادية", economic, "bg-slate-400")}
            {renderSection("الفئة المتوسطة", midrange, "bg-blue-500")}
            {renderSection("الفئة الاحترافية العليا", highend, "bg-purple-600")}
          </>
        )}
      </div>
    </div>
  );
}