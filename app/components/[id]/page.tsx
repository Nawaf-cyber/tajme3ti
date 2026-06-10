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
  
  const regex = /(\[[^\]]+\]\([^\)]+\)|\[red\].*?\[\/red\]|\[green\].*?\[\/green\]|\[blue\].*?\[\/blue\]|\[yellow\].*?\[\/yellow\]|https?:\/\/[^\s]+)/g;
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    if (!part) return null;

    if (part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/)) {
      const [, linkText, linkUrl] = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/)!;
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

    if (part.match(/^https?:\/\/[^\s]+$/)) {
      return (
        <span key={i} className="block mt-8 flex justify-end w-full">
          <a 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 px-5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-full transition-all border border-slate-300 dark:border-slate-700 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            الموقع الرسمي
          </a>
        </span>
      );
    }
    
    if (part.startsWith('[red]') && part.endsWith('[/red]')) return <span key={i} className="text-rose-600 dark:text-rose-400 font-black">{part.slice(5, -6)}</span>;
    if (part.startsWith('[green]') && part.endsWith('[/green]')) return <span key={i} className="text-emerald-600 dark:text-emerald-400 font-black">{part.slice(7, -8)}</span>;
    if (part.startsWith('[blue]') && part.endsWith('[/blue]')) return <span key={i} className="text-cyan-600 dark:text-cyan-400 font-black">{part.slice(6, -7)}</span>;
    if (part.startsWith('[yellow]') && part.endsWith('[/yellow]')) return <span key={i} className="text-amber-600 dark:text-amber-400 font-black">{part.slice(8, -9)}</span>;
    
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
            <div className="w-full max-w-[450px] aspect-square bg-white rounded-3xl flex items-center justify-center p-6 shadow-md">
              <style dangerouslySetInnerHTML={{ __html: `
                [data-rmiz], [data-rmiz-content] { 
                  width: 100%; 
                  height: 100%; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                }
                [data-rmiz-content] img { 
                  width: 100% !important; 
                  height: 100% !important; 
                  object-fit: contain !important; 
                  mix-blend-mode: multiply; 
                  transition: transform 0.4s ease;
                }
                [data-rmiz-content] img:hover { transform: scale(1.05); }
                [data-rmiz-overlay], [data-rmiz-modal-overlay] { 
                  background-color: rgba(15, 23, 42, 0.95) !important;
                }
                [data-rmiz-modal-img] { 
                  background-color: white !important;
                  padding: 2rem !important;
                  border-radius: 24px !important;
                  box-shadow: 0 0 40px rgba(0,0,0,0.5) !important;
                }
              `}} />

              <ImageZoom 
                src={comp.imageUrl || `/images/${comp.categoryId}/boxed.png`} 
                alt={comp.name} 
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-widest">
                {comp.category?.name}
              </span>
              <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800/30">
                {comp.brand}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
              {comp.name}
            </h1>
            
            <div className="flex flex-wrap items-end gap-5 mb-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">أقل سعر حالي</p>
                <div className="text-4xl md:text-5xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  {comp.price} <RiyalIcon size="h-9 w-9" />
                </div>
              </div>
              {sourceText && (
                <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-400 text-sm font-extrabold flex items-center gap-2 mb-1 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse"></span>
                  {sourceText}
                </div>
              )}
            </div>

            {(comp.amazonUrl || comp.cazasouqUrl || comp.microlessUrl) && (
              <div className="flex flex-col gap-3 mt-4 w-full relative z-0">
                <h3 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 mb-2">مقارنة الأسعار في المتاجر:</h3>

                {comp.amazonUrl && (
                  <a 
                    href={comp.amazonUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`flex items-center justify-between p-4 border rounded-2xl transition-all group shadow-sm ${
                      !comp.amazonInStock || !comp.amazonPrice
                        ? 'bg-slate-100 dark:bg-[#0B1120] border-slate-200 dark:border-slate-800 opacity-60 grayscale cursor-not-allowed' 
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-[#FF9900] hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#FF9900]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className={`w-3 h-3 rounded-full ${comp.amazonInStock && comp.amazonPrice ? 'bg-[#FF9900] shadow-[0_0_8px_#FF9900]/60' : 'bg-rose-500'}`}></span>
                      </div>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-[#FF9900] transition-colors flex flex-col">
                        Amazon
                        {(!comp.amazonInStock || !comp.amazonPrice) && (
                          <span className="text-[10px] font-black text-rose-500 mt-0.5">غير متوفر حالياً</span>
                        )}
                      </span>
                    </div>
                    <span className={`font-black text-xl flex items-center gap-1.5 ${comp.amazonInStock && comp.amazonPrice ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500' : 'text-slate-500'} transition-colors`}>
                      {comp.amazonPrice ? (
                        <>
                          {comp.amazonPrice} <RiyalIcon size="h-5 w-5" />
                        </>
                      ) : '---'}
                    </span>
                  </a>
                )}

                {comp.cazasouqUrl && (
                  <a 
                    href={comp.cazasouqUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`flex items-center justify-between p-4 border rounded-2xl transition-all group shadow-sm ${
                      !comp.cazasouqInStock || !comp.cazasouqPrice
                        ? 'bg-slate-100 dark:bg-[#0B1120] border-slate-200 dark:border-slate-800 opacity-60 grayscale cursor-not-allowed' 
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className={`w-3 h-3 rounded-full ${comp.cazasouqInStock && comp.cazasouqPrice ? 'bg-purple-500 shadow-[0_0_8px_#A855F7]/60' : 'bg-rose-500'}`}></span>
                      </div>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-purple-500 transition-colors flex flex-col">
                        CazaSouq
                        {(!comp.cazasouqInStock || !comp.cazasouqPrice) && (
                          <span className="text-[10px] font-black text-rose-500 mt-0.5">غير متوفر حالياً</span>
                        )}
                      </span>
                    </div>
                    <span className={`font-black text-xl flex items-center gap-1.5 ${comp.cazasouqInStock && comp.cazasouqPrice ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500' : 'text-slate-500'} transition-colors`}>
                      {comp.cazasouqPrice ? (
                        <>
                          {comp.cazasouqPrice} <RiyalIcon size="h-5 w-5" />
                        </>
                      ) : '---'}
                    </span>
                  </a>
                )}

                {comp.microlessUrl && (
                  <a 
                    href={comp.microlessUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`flex items-center justify-between p-4 border rounded-2xl transition-all group shadow-sm ${
                      !comp.microlessInStock || !comp.microlessPrice
                        ? 'bg-slate-100 dark:bg-[#0B1120] border-slate-200 dark:border-slate-800 opacity-60 grayscale cursor-not-allowed' 
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-red-600 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className={`w-3 h-3 rounded-full ${comp.microlessInStock && comp.microlessPrice ? 'bg-red-600 shadow-[0_0_8px_#DC2626]/60' : 'bg-rose-500'}`}></span>
                      </div>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-red-500 transition-colors flex flex-col">
                        Microless
                        {(!comp.microlessInStock || !comp.microlessPrice) && (
                          <span className="text-[10px] font-black text-rose-500 mt-0.5">غير متوفر حالياً</span>
                        )}
                      </span>
                    </div>
                    <span className={`font-black text-xl flex items-center gap-1.5 ${comp.microlessInStock && comp.microlessPrice ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500' : 'text-slate-500'} transition-colors`}>
                      {comp.microlessPrice ? (
                        <>
                          {comp.microlessPrice} <RiyalIcon size="h-5 w-5" />
                        </>
                      ) : '---'}
                    </span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white px-2 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              المواصفات التقنية
            </h3>
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm h-full">
              {Object.keys(specs).length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 font-bold text-sm">
                  لا توجد مواصفات فنية مسجلة.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="bg-slate-50 dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors group">
                      <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 group-hover:text-blue-500 transition-colors">
                        {key}
                      </span>
                      <span className="block text-sm font-black text-slate-900 dark:text-white" dir="ltr">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white px-2 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              نظرة عامة
            </h3>
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm h-full">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-loose whitespace-pre-wrap font-medium text-[15px] md:text-base">
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