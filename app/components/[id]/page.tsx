import { prisma } from '../../../lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// دالة لاكتشاف الروابط في النص وتحويلها
const formatTextWithLinks = (text: string) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export default async function ComponentDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const comp = await prisma.component.findUnique({
    where: { id },
    include: { category: true }
  });

  if (!comp) return notFound();

  const specs = typeof comp.specs === 'string' ? JSON.parse(comp.specs) : comp.specs || {};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        
        {/* شريط التنقل العلوي (Breadcrumb) */}
        <nav className="mb-8">
          <Link href="/components" className="text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-2">
            &rarr; العودة لتصفح القطع
          </Link>
        </nav>
        
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row">
          
          {/* قسم الصورة الجانبي */}
          <div className="lg:w-2/5 bg-slate-50/50 dark:bg-[#0B1120]/50 p-12 flex items-center justify-center border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-800">
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center bg-white dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-4">
              <img 
                src={comp.imageUrl || `/images/${comp.categoryId}/boxed.png`} 
                alt={comp.name} 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* قسم المعلومات والمواصفات */}
          <div className="lg:w-3/5 p-8 lg:p-12 flex flex-col">
            
            {/* الترويسة */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-md tracking-wider uppercase">
                  {comp.category?.name}
                </span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-500">
                  {comp.brand}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                {comp.name}
              </h1>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                ${comp.price}
              </div>

              {/* أزرار الشراء */}
              {(comp.amazonUrl || comp.cazasouqUrl) && (
                <div className="flex flex-wrap gap-4 mt-2">
                  {comp.amazonUrl && (
                    <a href={comp.amazonUrl} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[150px] text-center bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-3 px-6 rounded-lg transition-colors border border-slate-700 dark:border-white shadow-sm">
                      شراء من Amazon
                    </a>
                  )}
                  {comp.cazasouqUrl && (
                    <a href={comp.cazasouqUrl} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[150px] text-center bg-[#FF9900] hover:bg-[#E68A00] text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm">
                      شراء من Cazasouq
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* المواصفات التقنية */}
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                المواصفات التقنية
              </h3>
              
              {Object.keys(specs).length === 0 ? (
                <p className="text-slate-500 text-sm">لا توجد مواصفات فنية مسجلة.</p>
              ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {Object.entries(specs).map(([key, value]) => (
                    <li key={key} className="flex flex-col py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {key}
                      </span>
                      <span className="text-base font-medium text-slate-900 dark:text-slate-200">
                        {String(value)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>

        {/* قسم الوصف */}
        <div className="mt-8 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">نظرة عامة</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm lg:text-base whitespace-pre-wrap">
            {comp.description ? formatTextWithLinks(comp.description) : "لا يوجد وصف إضافي متاح لهذه القطعة حالياً."}
          </p>
        </div>

      </div>
    </div>
  );
}