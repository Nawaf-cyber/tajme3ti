import { prisma } from '../../../lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImageZoom from '../ImageZoom';
import { buildAffiliateUrl, AFFILIATE_LINK_PROPS } from '../../../lib/affiliate';
import { getAffiliateIds } from '../../../lib/affiliate-server';
import PriceHistoryChart from '../../../components/PriceHistoryChart';
import { formatPrice, discountPercent, componentDiscount } from '../../../lib/price';

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

  // معالجة المقاطع داخل السطر: روابط، ألوان، ونص عريض **...**
  const renderInline = (line: string, keyPrefix: string) => {
    const regex = /(\[[^\]]+\]\([^\)]+\)|\[red\].*?\[\/red\]|\[green\].*?\[\/green\]|\[blue\].*?\[\/blue\]|\[yellow\].*?\[\/yellow\]|\*\*[^*]+\*\*|https?:\/\/[^\s]+)/g;
    const parts = line.split(regex);

    return parts.map((part, i) => {
      if (!part) return null;
      const key = `${keyPrefix}-${i}`;

      // نص عريض **...**
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={key} className="font-black text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }

      if (part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/)) {
        const [, linkText, linkUrl] = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/)!;
        return (
          <a
            key={key}
            href={linkUrl}
            target={linkUrl.startsWith('http') ? "_blank" : "_self"}
            rel={linkUrl.startsWith('http') ? "noopener noreferrer" : ""}
            className="text-cyan-600 dark:text-cyan-400 font-bold underline hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors mx-1"
          >
            {linkText}
          </a>
        );
      }

      if (part.match(/^https?:\/\/[^\s]+$/)) {
        return (
          <span key={key} className="block mt-8 flex justify-end w-full">
            <a
              href={part}
              {...AFFILIATE_LINK_PROPS}
              className="inline-flex items-center gap-2 px-5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-full transition-all border border-slate-300 dark:border-slate-700 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              الموقع الرسمي
            </a>
          </span>
        );
      }

      if (part.startsWith('[red]') && part.endsWith('[/red]')) return <span key={key} className="text-rose-600 dark:text-rose-400 font-black">{part.slice(5, -6)}</span>;
      if (part.startsWith('[green]') && part.endsWith('[/green]')) return <span key={key} className="text-emerald-600 dark:text-emerald-400 font-black">{part.slice(7, -8)}</span>;
      if (part.startsWith('[blue]') && part.endsWith('[/blue]')) return <span key={key} className="text-cyan-600 dark:text-cyan-400 font-black">{part.slice(6, -7)}</span>;
      if (part.startsWith('[yellow]') && part.endsWith('[/yellow]')) return <span key={key} className="text-amber-600 dark:text-amber-400 font-black">{part.slice(8, -9)}</span>;

      return <span key={key}>{part}</span>;
    });
  };

  // معالجة النص سطراً سطراً لدعم عناوين Markdown (###, ##, #)
  const lines = text.split('\n');

  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // عنوان: ### أو ## أو #
    const headingMatch = trimmed.match(/^(#{1,3})\s*(.+?)\s*#*$/);
    if (headingMatch) {
      const cleanTitle = headingMatch[2];
      return (
        <span key={`h-${idx}`} className="block text-lg md:text-xl font-black text-slate-900 dark:text-white mt-6 mb-2 first:mt-0">
          {renderInline(cleanTitle, `h${idx}`)}
        </span>
      );
    }

    // سطر فارغ = مسافة
    if (trimmed === '') {
      return <span key={`br-${idx}`} className="block h-3" />;
    }

    // سطر عادي
    return (
      <span key={`p-${idx}`} className="block mb-1">
        {renderInline(line, `p${idx}`)}
      </span>
    );
  });
};

export default async function ComponentDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const comp = await prisma.component.findUnique({
    where: { id },
    include: { category: true }
  });

  if (!comp) return notFound();

  // معرّفات الأفلييت من لوحة الإدارة
  const affIds = await getAffiliateIds();

  const specs = typeof comp.specs === 'string' ? JSON.parse(comp.specs) : comp.specs || {};

  let sourceText = "";
  const availablePrices = [
    { name: 'أمازون', price: comp.amazonPrice || 0, listPrice: comp.amazonListPrice, inStock: comp.amazonInStock },
    { name: 'كازاسوق', price: comp.cazasouqPrice || 0, listPrice: comp.cazasouqListPrice, inStock: comp.cazasouqInStock },
    { name: 'مايكروليس', price: comp.microlessPrice || 0, listPrice: comp.microlessListPrice, inStock: comp.microlessInStock }
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

  /* الخصم على المتجر الأرخص المتوفّر — نفس الدالة التي تستخدمها صفحة
     التصفّح، فلا يظهر خصم في مكان ويغيب في آخر. */
  const deal = componentDiscount(comp);
  const mainDiscount = deal.pct;
  const cheapestListPrice = deal.listPrice;
  const savedAmount = mainDiscount > 0 && cheapestListPrice ? cheapestListPrice - comp.price : 0;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <nav>
          <Link href="/components" className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors">
            <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span> عودة للقطع
          </Link>
        </nav>

        <div className="relative bg-gradient-to-b from-white/80 to-white/60 dark:from-[#0F172A]/70 dark:to-[#0B1120]/50 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-6 md:p-10 shadow-sm flex flex-col lg:flex-row gap-10 items-center overflow-hidden">
          {/* زاوية هندسية */}
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-cyan-500/60 border-l-[16px] border-l-transparent z-20"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/8 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="w-full lg:w-1/2 flex justify-center relative z-[100]">
            <div className="w-full max-w-[450px] aspect-square bg-white rounded-sm flex items-center justify-center p-6 shadow-md">

              <ImageZoom 
                src={comp.imageUrl || `/images/${comp.categoryId}/boxed.png`} 
                alt={comp.name} 
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 tracking-wider">#{comp.id.slice(-4).toUpperCase()}</span>
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-sm text-xs font-bold uppercase tracking-widest font-mono">
                {comp.category?.name}
              </span>
              <span className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-sm text-xs font-bold uppercase tracking-widest border border-cyan-500/40 font-mono">
                {comp.brand}
              </span>
            </div>
            
            <div className="flex items-start gap-3 mb-6">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                {comp.name}
              </h1>
              {mainDiscount > 0 && (
                <span className="shrink-0 mt-2 px-2.5 py-1 rounded-sm bg-rose-500 text-white text-xs font-black font-mono shadow-[0_0_12px_rgba(244,63,94,0.5)]">
                  ‎-{mainDiscount}%
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-end gap-5 mb-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 font-mono uppercase tracking-widest">أقل سعر · SAR</p>
                <div className="text-4xl md:text-5xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-mono">
                  {formatPrice(comp.price)} <RiyalIcon size="h-9 w-9" />
                </div>
                {/* السعر قبل الخصم — مشطوباً، مع قيمة التوفير */}
                {mainDiscount > 0 && cheapestListPrice && (
                  <div className="flex items-center gap-2.5 mt-2">
                    <span className="text-lg font-bold text-slate-400 dark:text-slate-500 line-through font-mono" dir="ltr">
                      {formatPrice(cheapestListPrice)}
                    </span>
                    <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 rounded-sm">
                      وفّرت {formatPrice(savedAmount)} ﷼
                    </span>
                  </div>
                )}
              </div>
              {sourceText && (
                <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-sm text-emerald-800 dark:text-emerald-400 text-sm font-extrabold flex items-center gap-2 mb-1 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse"></span>
                  {sourceText}
                </div>
              )}
            </div>

            {(comp.amazonUrl || comp.cazasouqUrl || comp.microlessUrl) && (
              <div className="flex flex-col gap-3 mt-4 w-full relative z-0">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 font-mono uppercase tracking-widest">مقارنة الأسعار · STORES</h3>

                {comp.amazonUrl && (
                  <a 
                    href={buildAffiliateUrl(comp.amazonUrl, 'amazon', affIds)} 
                    {...AFFILIATE_LINK_PROPS} 
                    className={`flex items-center justify-between p-3.5 border-r-2 rounded-sm transition-all group shadow-sm ${
                      !comp.amazonInStock || !comp.amazonPrice
                        ? 'bg-slate-100 dark:bg-[#0B1120]/60 border-r-slate-400 dark:border-r-slate-700 opacity-60 grayscale cursor-not-allowed' 
                        : 'bg-white/60 dark:bg-slate-800/40 border-r-[#FF9900] hover:bg-white dark:hover:bg-slate-800/70 hover:shadow-md hover:-translate-x-0.5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-sm bg-[#FF9900]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className={`w-3 h-3 rounded-full ${comp.amazonInStock && comp.amazonPrice ? 'bg-[#FF9900] shadow-[0_0_8px_#FF9900]/60' : 'bg-rose-500'}`}></span>
                      </div>
                      <span className="font-mono font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-[#FF9900] transition-colors flex flex-col">
                        Amazon
                        {(!comp.amazonInStock || !comp.amazonPrice) && (
                          <span className="text-[10px] font-black text-rose-500 mt-0.5">غير متوفر حالياً</span>
                        )}
                      </span>
                    </div>
                    <span className={`font-mono font-black text-xl flex items-center gap-1.5 ${comp.amazonInStock && comp.amazonPrice ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500' : 'text-slate-500'} transition-colors`}>
                      {comp.amazonPrice ? (
                        <>
                          {/* السعر المشطوب يظهر فقط عند وجود خصم معلن على هذا المتجر */}
                          {discountPercent(comp.amazonPrice, comp.amazonListPrice) > 0 && (
                            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 line-through" dir="ltr">
                              {formatPrice(comp.amazonListPrice)}
                            </span>
                          )}
                          {formatPrice(comp.amazonPrice)} <RiyalIcon size="h-5 w-5" />
                        </>
                      ) : '---'}
                    </span>
                  </a>
                )}

                {comp.cazasouqUrl && (
                  <a 
                    href={buildAffiliateUrl(comp.cazasouqUrl, 'cazasouq', affIds, comp.cazasouqAffiliateUrl)} 
                    {...AFFILIATE_LINK_PROPS} 
                    className={`flex items-center justify-between p-3.5 border-r-2 rounded-sm transition-all group shadow-sm ${
                      !comp.cazasouqInStock || !comp.cazasouqPrice
                        ? 'bg-slate-100 dark:bg-[#0B1120]/60 border-r-slate-400 dark:border-r-slate-700 opacity-60 grayscale cursor-not-allowed' 
                        : 'bg-white/60 dark:bg-slate-800/40 border-r-purple-500 hover:bg-white dark:hover:bg-slate-800/70 hover:shadow-md hover:-translate-x-0.5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-sm bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className={`w-3 h-3 rounded-full ${comp.cazasouqInStock && comp.cazasouqPrice ? 'bg-purple-500 shadow-[0_0_8px_#A855F7]/60' : 'bg-rose-500'}`}></span>
                      </div>
                      <span className="font-mono font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-purple-500 transition-colors flex flex-col">
                        CazaSouq
                        {(!comp.cazasouqInStock || !comp.cazasouqPrice) && (
                          <span className="text-[10px] font-black text-rose-500 mt-0.5">غير متوفر حالياً</span>
                        )}
                      </span>
                    </div>
                    <span className={`font-mono font-black text-xl flex items-center gap-1.5 ${comp.cazasouqInStock && comp.cazasouqPrice ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500' : 'text-slate-500'} transition-colors`}>
                      {comp.cazasouqPrice ? (
                        <>
                          {/* السعر المشطوب يظهر فقط عند وجود خصم معلن على هذا المتجر */}
                          {discountPercent(comp.cazasouqPrice, comp.cazasouqListPrice) > 0 && (
                            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 line-through" dir="ltr">
                              {formatPrice(comp.cazasouqListPrice)}
                            </span>
                          )}
                          {formatPrice(comp.cazasouqPrice)} <RiyalIcon size="h-5 w-5" />
                        </>
                      ) : '---'}
                    </span>
                  </a>
                )}

                {comp.microlessUrl && (
                  <a 
                    href={buildAffiliateUrl(comp.microlessUrl, 'microless', affIds)} 
                    {...AFFILIATE_LINK_PROPS} 
                    className={`flex items-center justify-between p-3.5 border-r-2 rounded-sm transition-all group shadow-sm ${
                      !comp.microlessInStock || !comp.microlessPrice
                        ? 'bg-slate-100 dark:bg-[#0B1120]/60 border-r-slate-400 dark:border-r-slate-700 opacity-60 grayscale cursor-not-allowed' 
                        : 'bg-white/60 dark:bg-slate-800/40 border-r-red-600 hover:bg-white dark:hover:bg-slate-800/70 hover:shadow-md hover:-translate-x-0.5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-sm bg-red-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className={`w-3 h-3 rounded-full ${comp.microlessInStock && comp.microlessPrice ? 'bg-red-600 shadow-[0_0_8px_#DC2626]/60' : 'bg-rose-500'}`}></span>
                      </div>
                      <span className="font-mono font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-red-500 transition-colors flex flex-col">
                        Microless
                        {(!comp.microlessInStock || !comp.microlessPrice) && (
                          <span className="text-[10px] font-black text-rose-500 mt-0.5">غير متوفر حالياً</span>
                        )}
                      </span>
                    </div>
                    <span className={`font-mono font-black text-xl flex items-center gap-1.5 ${comp.microlessInStock && comp.microlessPrice ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500' : 'text-slate-500'} transition-colors`}>
                      {comp.microlessPrice ? (
                        <>
                          {/* السعر المشطوب يظهر فقط عند وجود خصم معلن على هذا المتجر */}
                          {discountPercent(comp.microlessPrice, comp.microlessListPrice) > 0 && (
                            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 line-through" dir="ltr">
                              {formatPrice(comp.microlessListPrice)}
                            </span>
                          )}
                          {formatPrice(comp.microlessPrice)} <RiyalIcon size="h-5 w-5" />
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
              <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
              المواصفات التقنية
            </h3>
            <div className="relative bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-t-cyan-500/70 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-6 shadow-sm h-full">
              {Object.keys(specs).length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 font-bold text-sm">
                  لا توجد مواصفات فنية مسجلة.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="bg-white dark:bg-[#0B1120] p-3.5 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 transition-colors group">
                      <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 font-mono group-hover:text-cyan-500 transition-colors">
                        {key}
                      </span>
                      <span className="block text-sm font-black text-slate-900 dark:text-white font-mono" dir="ltr">
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
              <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
              نظرة عامة
            </h3>
            <div className="relative bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-t-cyan-500/70 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-6 md:p-8 shadow-sm h-full">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="text-slate-700 dark:text-slate-300 leading-loose font-medium text-[15px] md:text-base">
                  {comp.description ? formatTextWithLinks(comp.description) : "لا يوجد وصف إضافي متاح لهذه القطعة حالياً."}
                </div>
              </div>
            </div>
          </div>

        </div>
        <PriceHistoryChart componentId={comp.id} />
      </div>
    </div>
  );
}