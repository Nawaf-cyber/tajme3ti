import { prisma } from '../../../lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImageZoom from '../ImageZoom';

const RiyalIcon = ({ size = 'h-6 w-6' }: { size?: string }) => (
  <div 
    className={`${size} bg-emerald-500 inline-block align-middle`} 
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
  
  const regex = /(\[red\].*?\[\/red\]|\[green\].*?\[\/green\]|\[blue\].*?\[\/blue\]|\[yellow\].*?\[\/yellow\]|https?:\/\/[^\s]+)/g;
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    if (part.match(/https?:\/\/[^\s]+/)) {
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

export default async function ComponentDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const comp = await prisma.component.findUnique({
    where: { id },
    include: { category: true }
  });

  if (!comp) return notFound();

  const specs = typeof comp.specs === 'string' ? JSON.parse(comp.specs) : comp.specs || {};

  let sourceText = "";
  const availablePrices = [
    { name: 'أمازون', price: comp.amazonPrice || 0, inStock: comp.amazonInStock },
    { name: 'كازاسوق', price: comp.cazasouqPrice || 0, inStock: comp.cazasouqInStock },
    { name: 'مايكروليس', price: comp.microlessPrice || 0, inStock: comp.microlessInStock }
  ].filter(p => p.price > 0 && p.inStock !== false);

  if (availablePrices.length > 0) {
    availablePrices.sort((a, b) => a.price - b.price);
    const minPrice = availablePrices[0].price;
    const lowestStores = availablePrices.filter(p => p.price === minPrice).map(p => p.name);
    
    if (lowestStores.length > 1) {
      sourceText = `السعر متطابق في: ${lowestStores.join(' و ')}`;
    } else {
      sourceText = `أفضل سعر من: ${lowestStores[0]}`;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <nav>
          <Link href="/components" className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
            <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span> عودة للقطع
          </Link>
        </nav>

        <div className="relative bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-10 shadow-sm flex flex-col lg:flex-row gap-10 items-center">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="w-full lg:w-1/2 flex justify-center relative z-[100]">
            <div className="w-full max-w-[450px] aspect-square bg-slate-100/50 dark:bg-[#0B1120]/50 rounded-2xl flex items-center justify-center p-8 lg:p-12 border border-slate-200/50 dark:border-slate-700/30">
              <ImageZoom 
                src={comp.imageUrl || `/images/${comp.categoryId}/boxed.png`} 
                alt={comp.name} 
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-bold uppercase tracking-widest">
                {comp.category?.name}
              </span>
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-xs font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800/30">
                {comp.brand}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
              {comp.name}
            </h1>
            
            <div className="flex flex-wrap items-end gap-4 mb-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">أقل سعر حالي</p>
                <div className="text-4xl md:text-5xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  {comp.price} <RiyalIcon size="h-9 w-9" />
                </div>
              </div>
              {sourceText && (
                <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {sourceText}
                </div>
              )}
            </div>

            {(comp.amazonUrl || comp.cazasouqUrl || comp.microlessUrl) && (
              <div className="flex flex-col gap-3 mt-4 w-full relative z-0">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">مقارنة الأسعار في المتاجر:</h3>

                {/* زر أمازون */}
                {comp.amazonUrl && (
                  <a 
                    href={comp.amazonUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`flex items-center justify-between p-4 border rounded-xl transition-all group shadow-sm ${
                      !comp.amazonInStock || !comp.amazonPrice
                        ? 'bg-slate-100 dark:bg-[#0B1120] border-slate-200 dark:border-slate-800 opacity-60 grayscale' 
                        : 'bg-slate-50 dark:bg-[#0F172A]/50 border-slate-200 dark:border-slate-700/50 hover:border-[#FF9900]/80'
                    }`}
                  >
                    <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${comp.amazonInStock && comp.amazonPrice ? 'bg-[#FF9900] shadow-[0_0_8px_#FF9900]/60' : 'bg-rose-500 shadow-[0_0_8px_#F43F5E]/60'}`}></span>
                      Amazon
                      {(!comp.amazonInStock || !comp.amazonPrice) && (
                        <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/50">
                          غير متوفر
                        </span>
                      )}
                    </span>
                    <span className={`font-black text-lg ${comp.amazonInStock && comp.amazonPrice ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500' : 'text-slate-500'} transition-colors`}>
                      {comp.amazonPrice ? `${comp.amazonPrice} ر.س` : '---'}
                    </span>
                  </a>
                )}

                {/* زر كازاسوق */}
                {comp.cazasouqUrl && (
                  <a 
                    href={comp.cazasouqUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`flex items-center justify-between p-4 border rounded-xl transition-all group shadow-sm ${
                      !comp.cazasouqInStock || !comp.cazasouqPrice
                        ? 'bg-slate-100 dark:bg-[#0B1120] border-slate-200 dark:border-slate-800 opacity-60 grayscale' 
                        : 'bg-slate-50 dark:bg-[#0F172A]/50 border-slate-200 dark:border-slate-700/50 hover:border-purple-500/80'
                    }`}
                  >
                    <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${comp.cazasouqInStock && comp.cazasouqPrice ? 'bg-purple-500 shadow-[0_0_8px_#A855F7]/60' : 'bg-rose-500 shadow-[0_0_8px_#F43F5E]/60'}`}></span>
                      CazaSouq
                      {(!comp.cazasouqInStock || !comp.cazasouqPrice) && (
                        <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/50">
                          غير متوفر
                        </span>
                      )}
                    </span>
                    <span className={`font-black text-lg ${comp.cazasouqInStock && comp.cazasouqPrice ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500' : 'text-slate-500'} transition-colors`}>
                      {comp.cazasouqPrice ? `${comp.cazasouqPrice} ر.س` : '---'}
                    </span>
                  </a>
                )}

                {/* زر مايكروليس */}
                {comp.microlessUrl && (
                  <a 
                    href={comp.microlessUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`flex items-center justify-between p-4 border rounded-xl transition-all group shadow-sm ${
                      !comp.microlessInStock || !comp.microlessPrice
                        ? 'bg-slate-100 dark:bg-[#0B1120] border-slate-200 dark:border-slate-800 opacity-60 grayscale' 
                        : 'bg-slate-50 dark:bg-[#0F172A]/50 border-slate-200 dark:border-slate-700/50 hover:border-red-600/80'
                    }`}
                  >
                    <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${comp.microlessInStock && comp.microlessPrice ? 'bg-red-600 shadow-[0_0_8px_#DC2626]/60' : 'bg-rose-500 shadow-[0_0_8px_#F43F5E]/60'}`}></span>
                      Microless
                      {(!comp.microlessInStock || !comp.microlessPrice) && (
                        <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/50">
                          غير متوفر
                        </span>
                      )}
                    </span>
                    <span className={`font-black text-lg ${comp.microlessInStock && comp.microlessPrice ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500' : 'text-slate-500'} transition-colors`}>
                      {comp.microlessPrice ? `${comp.microlessPrice} ر.س` : '---'}
                    </span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white px-2">
              المواصفات التقنية
            </h3>
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm h-full overflow-hidden">
              {Object.keys(specs).length === 0 ? (
                <p className="text-sm text-slate-500 font-medium">لا توجد مواصفات فنية مسجلة.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="relative pl-4 border-l-4 border-blue-500 dark:border-blue-600">
                      <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                        {key}
                      </span>
                      <span className="block text-base font-bold text-slate-900 dark:text-slate-200" dir="ltr">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white px-2">
              نظرة عامة
            </h3>
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-sm h-full overflow-hidden">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium text-[15px] md:text-base">
                  {comp.description ? formatTextWithLinks(comp.description) : "لا يوجد وصف إضافي متاح لهذه القطعة حالياً."}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}