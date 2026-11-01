import { prisma } from '../../lib/prisma';
import type { Metadata } from 'next';
import { formatTotal } from '../../lib/price';
import { catMeta } from '../../lib/category-meta';

export const metadata: Metadata = {
  title: 'تجميعات جاهزة بميزانيات مختلفة',
  description: 'تجميعات حاسب جاهزة ومفحوصة التوافق لكل ميزانية — قطعها متوفّرة فعلاً بأسعارها اللحظية في المتاجر السعودية.',
  alternates: { canonical: '/prebuilds' },
};
import SavePrebuildButton from './SavePrebuildButton';
import Link from 'next/link';
import { OFFER_INCLUDE } from '../../lib/stores-server';
import RiyalSign from '../../components/RiyalSign';
import { prebuildLive } from '../../lib/prebuilds';

// تحديث حي دائماً — يعرض أحدث حالة التوفّر بلا حاجة redeploy
export const dynamic = 'force-dynamic';

export default async function PrebuildsPage() {
  /* من الأرخص داخل كلّ فئة — `price` يُكتب يوم تُنشأ (scripts/add-prebuilds-*)، والمعروض لحظيّ */
  const prebuilds = await prisma.prebuild.findMany({
    orderBy: { price: 'asc' },
  });
  
  const categories = await prisma.category.findMany();
  
  const allComponents = await prisma.component.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      ...OFFER_INCLUDE,
    }
  });

  const economic = prebuilds.filter(p => p.budgetType === 'economic');
  const midrange = prebuilds.filter(p => p.budgetType === 'midrange');
  const highend = prebuilds.filter(p => p.budgetType === 'highend');

  const renderSection = (title: string, list: any[], colorMarker: string) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-12 last:mb-0">
        <div className="flex items-center gap-2.5 mb-5">
          <div className={`w-1.5 h-8 rounded-full ${colorMarker}`}></div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
        </div>
        
        <div className="flex flex-col gap-5">
          {list.map((build) => {
            /* القطع والمجموع اللحظيّ والرابط من lib/prebuilds — الرئيسية تقرأ الحساب نفسه */
            const { compObj, builderHref, parts: buildPartsDisplay, missingParts, liveTotal } = prebuildLive(build, categories, allComponents as any);
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
              storageId: getCompId('Storage'),
              /* كان غائباً: «حفظ في حسابي» يُسقط المبرّد، فتصل التجميعة إلى «تجميعاتي» بلا تبريد */
              coolerId: getCompId('Cooler'),
            };

            return (
              <div 
                key={build.id} 
                className="group relative bg-gradient-to-b from-white/80 to-white/60 dark:from-[#0F172A]/70 dark:to-[#0B1120]/50 backdrop-blur-sm border-x border-b border-t-2 border-slate-200 dark:border-slate-800 border-t-cyan-500 rounded-sm shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 hover:border-x-cyan-500/40 hover:border-b-cyan-500/40 transition-all duration-300 flex flex-col lg:flex-row overflow-hidden"
              >
                {/* القسم الأيمن: المحتوى والقطع */}
                <div className="p-6 md:p-8 flex-1 flex flex-col selection:bg-blue-500/10">
                  
                  {/* العنوان ووسم عدد القطع */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800/60">
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                      {build.title}
                    </h3>
                    <div className="shrink-0 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-xs font-bold px-4 py-2 rounded-sm border border-slate-200 dark:border-slate-700/50">
                      <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                      تتضمن {partsCount} قطع
                    </div>
                  </div>

                  {/* شبكة مربعات القطع */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
                    {buildPartsDisplay.map((part: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={`bg-slate-50 dark:bg-[#151E32]/50 border p-3 rounded-sm flex items-center gap-3.5 hover:bg-white dark:hover:bg-[#1A233A] hover:shadow-md transition-all duration-300 ${part.isAvailable ? 'border-slate-100 dark:border-slate-800/60' : 'border-amber-300 dark:border-amber-600/50'}`}
                      >
                        {/* أيقونة الفئة — كانت «CP» و«MO» و«PS»: حرفان إنجليزيّان يبدوان رمزاً داخلياً */}
                        <div className="w-10 h-10 shrink-0 rounded-sm bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-lg border border-slate-300/50 dark:border-slate-700/50" aria-hidden="true">
                          {catMeta(part.categoryName).icon}
                        </div>
                        <div className="flex flex-col overflow-hidden flex-1">
                          <span className="text-[12px] text-slate-500 dark:text-slate-300 font-bold mb-0.5">
                            {catMeta(part.categoryName).label}
                          </span>
                          {/* dir="auto": الاسم الإنجليزيّ في صفحةٍ RTL كان يُقصّ من أوّله («…efined SE ARGB White») */}
                          <span dir="auto" className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate w-full pr-2 text-right">
                            {part.componentName}
                          </span>
                          {!part.isAvailable && (
                            <span className="text-[12px] text-amber-700 dark:text-amber-400 font-black inline-flex items-center gap-1 mt-0.5">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              غير متوفر حالياً
                            </span>
                          )}
                        </div>
                        {part.componentId && (
                          <Link 
                            href={`/components/${part.componentId}`} 
                            title="التفاصيل"
                            aria-label={`تفاصيل ${part.componentName}`}
                            className="p-2 text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-sm transition-colors shrink-0"
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
                    <div className="mt-auto bg-slate-50 dark:bg-[#151E32]/30 border-r-2 border-r-cyan-500 rounded-sm p-5">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-loose whitespace-pre-wrap">
                        {build.description}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* القسم الأيسر: السعر وزر الحفظ */}
                <div className="bg-slate-50 dark:bg-[#0B1120] border-t lg:border-t-0 lg:border-r border-slate-100 dark:border-slate-800/80 p-7 lg:w-80 shrink-0 flex flex-col justify-center items-center lg:items-end gap-6 relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none"></div>
                  
                  <div className="text-center lg:text-right relative z-10 w-full">
                    <span className="inline-block text-[12px] font-black text-slate-500 dark:text-slate-300 mb-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-sm border border-slate-200 dark:border-slate-700">
                      أرخص سعر اليوم
                    </span>
                    <div className="font-black text-[34px] leading-none text-emerald-600 dark:text-emerald-400 flex items-center justify-center lg:justify-end gap-2 mt-2 selection:bg-emerald-50 selection:text-emerald-700">
                      <span className="font-mono tabular-nums" dir="ltr">{formatTotal(liveTotal)}<RiyalSign /></span>
                    </div>
                    {missingParts.length > 0 && (
                      <p className="mt-2 text-[12px] font-bold text-amber-700 dark:text-amber-400">
                        بدون {missingParts.map((p) => catMeta(p.categoryName).label).join('، ')} — غير متوفّر الآن، فاختر بديلاً في الباني
                      </p>
                    )}
                  </div>

                  <div className="w-full relative z-10 flex flex-col gap-3">
                    <Link
                      href={builderHref}
                      className="w-full flex justify-center items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-[#052e37] font-bold py-3 rounded-sm transition-colors text-sm"
                    >
                      افتحها في الباني وعدّل عليها
                    </Link>
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
    <div className="min-h-screen py-8 md:py-10 px-4 sm:px-6 lg:px-8 transition-colors selection:bg-cyan-500/20 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* الرأس مضغوطٌ كرأس «تصفّح القطع» (2026-10-30) — كان عنواناً ٧٢ بكسل فوق شاشةٍ فارغة */}
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              تجميعات <span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-500 to-emerald-500 dark:from-cyan-400 dark:to-emerald-400">جاهزة</span> ومفحوصة.
            </h1>
            <p className="mt-2 text-[14px] font-semibold text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              كل تجميعة مفحوصة بنفس فحص الباني، وأسعارها لحظية من المتاجر. افتحها في الباني وعدّل عليها، أو احفظها في حسابك.
            </p>
          </div>
          <Link href="/builder" className="text-[13px] font-extrabold text-cyan-700 dark:text-cyan-400 hover:underline">ما تدري وش تبي؟ خلّنا نقترح لك &larr;</Link>
        </div>

        {prebuilds.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-sm text-slate-500 font-bold shadow-sm flex flex-col items-center gap-6">
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