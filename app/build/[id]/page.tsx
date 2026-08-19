import type { Metadata } from 'next';
import { brandColor } from '../../../lib/brand';
import { prisma } from '../../../lib/prisma';
import StoreBuyChips from '../../../components/StoreBuyChips';
import { OFFER_INCLUDE } from '../../../lib/stores-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { productImage } from '../../../lib/image';

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

/* لون العلامة صار من lib/brand — كانت أربع نسخ بأربع لوحات */

const parseSpecs = (specsStr: any) => {
  if (!specsStr) return {};
  return typeof specsStr === 'string' ? JSON.parse(specsStr) : specsStr;
};

// حاسبة الفريمات مجهزة للعمل بشكل كامل على السيرفر باستخدام Tailwind CSS
const FpsEstimator = ({ cpuTier, gpuTier }: { cpuTier: number, gpuTier: number }) => {
  const gpuBasePower: Record<number, number> = { 1: 120, 2: 180, 3: 270, 4: 380, 5: 550 };
  const baseScore = gpuBasePower[gpuTier] || 120;
  const resMultipliers: Record<string, number> = { '1080p': 1.0, '1440p': 0.70, '4K': 0.45 };
  
  const gameMultipliers: Record<string, any> = {
    esports: { name: 'Valorant', mult: 3.0, icon: '🎯' },
    competitive: { name: 'Warzone', mult: 0.9, icon: '🪂' },
    aaa: { name: 'Cyberpunk', mult: 0.45, icon: '🌃' }
  };

  const generateDynamicData = () => {
    const result: any = { data: {} };
    if (gpuTier >= 5) result.recommended = '4K';
    else if (gpuTier >= 3) result.recommended = '1440p';
    else result.recommended = '1080p';

    ['1080p', '1440p', '4K'].forEach(res => {
      result.data[res] = {};
      let cpuPenalty = 0;
      const tierDiff = gpuTier - cpuTier;
      if (tierDiff > 0) {
        if (res === '1080p') cpuPenalty = tierDiff * 0.15;
        if (res === '1440p') cpuPenalty = tierDiff * 0.08;
        if (res === '4K') cpuPenalty = tierDiff * 0.02;
      }

      Object.entries(gameMultipliers).forEach(([type, game]) => {
        const rawFps = baseScore * resMultipliers[res] * game.mult;
        let finalFps = rawFps * (1 - cpuPenalty);

        finalFps = Math.round(finalFps / 5) * 5;
        if (finalFps > 500) finalFps = 500;

        let quality = '';
        if (type === 'aaa') {
          if (res === '1080p') quality = gpuTier > 3 ? ' (Ultra RT)' : ' (High)';
          else if (res === '1440p') quality = gpuTier > 3 ? ' (Ultra)' : ' (Med)';
          else quality = gpuTier >= 4 ? ' (High)' : ' (Low)';
        }

        result.data[res][type] = {
          name: game.name + quality,
          fps: `${finalFps}+`,
          icon: game.icon
        };
      });
    });
    return result;
  };

  const tierData = generateDynamicData();

  return (
    <div className="mb-8 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden bg-white dark:bg-[#0F172A] shadow-sm relative">
      {/* الأزرار المخفية التي تدير الواجهة تفاعلياً */}
      <input type="radio" name="res-tabs" id="res-1080p" className="peer/1080p hidden" defaultChecked={tierData.recommended === '1080p'} />
      <input type="radio" name="res-tabs" id="res-1440p" className="peer/1440p hidden" defaultChecked={tierData.recommended === '1440p'} />
      <input type="radio" name="res-tabs" id="res-4k" className="peer/4k hidden" defaultChecked={tierData.recommended === '4K'} />

      <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          الأداء المتوقع في الألعاب
        </h4>
        
        <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-lg w-full sm:w-auto">
          {/* Label 1080p */}
          <label htmlFor="res-1080p" title={tierData.recommended === '1080p' ? "الدقة المثالية لقوة جهازك" : "عرض الأداء على دقة 1080p"}
            className="flex-1 sm:flex-none text-center px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 peer-checked/1080p:bg-white peer-checked/1080p:dark:bg-slate-700 peer-checked/1080p:text-blue-600 peer-checked/1080p:dark:text-blue-400 peer-checked/1080p:shadow-sm"
          >
            1080p {tierData.recommended === '1080p' && <span className="text-blue-500 text-sm leading-none ml-0.5">★</span>}
          </label>
          
          {/* Label 1440p */}
          <label htmlFor="res-1440p" title={tierData.recommended === '1440p' ? "الدقة المثالية لقوة جهازك" : "عرض الأداء على دقة 1440p"}
            className="flex-1 sm:flex-none text-center px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 peer-checked/1440p:bg-white peer-checked/1440p:dark:bg-slate-700 peer-checked/1440p:text-blue-600 peer-checked/1440p:dark:text-blue-400 peer-checked/1440p:shadow-sm"
          >
            1440p {tierData.recommended === '1440p' && <span className="text-blue-500 text-sm leading-none ml-0.5">★</span>}
          </label>

          {/* Label 4K */}
          <label htmlFor="res-4k" title={tierData.recommended === '4K' ? "الدقة المثالية لقوة جهازك" : "عرض الأداء على دقة 4K"}
            className="flex-1 sm:flex-none text-center px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 peer-checked/4k:bg-white peer-checked/4k:dark:bg-slate-700 peer-checked/4k:text-blue-600 peer-checked/4k:dark:text-blue-400 peer-checked/4k:shadow-sm"
          >
            4K {tierData.recommended === '4K' && <span className="text-blue-500 text-sm leading-none ml-0.5">★</span>}
          </label>
        </div>
      </div>
      
      {/* 1080p Content */}
      <div className="hidden peer-checked/1080p:grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-100 dark:divide-slate-700/50 p-2">
        {Object.entries(tierData.data['1080p']).map(([type, data]: any) => (
          <div key={type} className="p-3 text-center flex flex-col items-center justify-center group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl">
            <span className="text-xl mb-1 drop-shadow-sm">{data.icon}</span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{data.name}</span>
            <span className="text-lg font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform">{data.fps}</span>
          </div>
        ))}
      </div>

      {/* 1440p Content */}
      <div className="hidden peer-checked/1440p:grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-100 dark:divide-slate-700/50 p-2">
        {Object.entries(tierData.data['1440p']).map(([type, data]: any) => (
          <div key={type} className="p-3 text-center flex flex-col items-center justify-center group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl">
            <span className="text-xl mb-1 drop-shadow-sm">{data.icon}</span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{data.name}</span>
            <span className="text-lg font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform">{data.fps}</span>
          </div>
        ))}
      </div>

      {/* 4K Content */}
      <div className="hidden peer-checked/4k:grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-100 dark:divide-slate-700/50 p-2">
        {Object.entries(tierData.data['4K']).map(([type, data]: any) => (
          <div key={type} className="p-3 text-center flex flex-col items-center justify-center group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl">
            <span className="text-xl mb-1 drop-shadow-sm">{data.icon}</span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{data.name}</span>
            <span className="text-lg font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform">{data.fps}</span>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          الأرقام تقريبية وتعتمد على إعدادات الجودة وتقنيات (DLSS/FSR).
        </span>
        <span className="hidden sm:block text-slate-300 dark:text-slate-700">|</span>
        <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold flex items-center gap-1">
          <span className="text-sm leading-none">★</span> تشير إلى دقة الشاشة المثالية لجهازك.
        </span>
      </div>
    </div>
  );
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const build = await prisma.savedBuild.findUnique({ where: { id }, select: { name: true } });
  if (!build) return { title: 'التجميعة غير موجودة', robots: { index: false, follow: true } };
  return {
    title: `${build.name} — تجميعة مشتركة`,
    description: `تفاصيل تجميعة "${build.name}": القطع وأسعارها اللحظية وفحص التوافق — على منصة تجميعتي.`,
    alternates: { canonical: `/build/${id}` },
  };
}

export default async function SharedBuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const build = await prisma.savedBuild.findUnique({
    where: { id }
  });

  if (!build) return notFound();

  // كانت روابط هذه الصفحة بلا معرّف أفلييت إطلاقاً — كل نقرة تضيع

  const componentIds = [build.cpuId, build.gpuId, build.ramId, build.motherboardId, build.caseId, build.psuId, build.storageId].filter(Boolean) as string[];

  const components = await prisma.component.findMany({
    where: { id: { in: componentIds } },
    select: { id: true, name: true, brand: true, price: true, imageUrl: true, performanceTier: true, specs: true, ...OFFER_INCLUDE }
  });

  const compMap = new Map(components.map(c => [c.id, c]));

  const parts: Record<string, any> = {
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
  
  let bottleneck = null;
  if (parts.CPU?.performanceTier && parts.GPU?.performanceTier) {
    const diff = parts.CPU.performanceTier - parts.GPU.performanceTier;
    let suggestions: any[] = [];

    if (diff < -1) {
      const moboSpecs = parseSpecs(parts.Motherboard?.specs);
      const allCpus = await prisma.component.findMany({
        where: { category: { name: 'CPU' } },
        select: { id: true, name: true, brand: true, price: true, specs: true, performanceTier: true }
      });
      
      suggestions = allCpus.filter(c => {
        const cSpecs = parseSpecs(c.specs);
        const isSocketMatch = moboSpecs.socket && cSpecs.socket ? cSpecs.socket === moboSpecs.socket : true;
        return isSocketMatch &&
               c.performanceTier !== null &&
               c.performanceTier >= parts.GPU.performanceTier - 1 &&
               c.id !== parts.CPU.id;
      }).sort((a, b) => a.price - b.price).slice(0, 6).map(item => ({ category: 'CPU', item }));

      bottleneck = {
        title: "⚠️ المعالج قد يحد من أداء الكرت في بعض الألعاب، خصوصًا على 1080p و1440p.",
        desc: "يُنصح بترقية المعالج، أو اللعب بدقة 4K لنقل ثقل المعالجة إلى الكرت وتخفيف الضغط عن المعالج.",
        color: "text-amber-900 dark:text-amber-400",
        bg: "bg-amber-100 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800/50",
        suggestions
      };
    } else if (diff > 1) {
      const caseSpecs = parseSpecs(parts.Case?.specs);
      const allGpus = await prisma.component.findMany({
        where: { category: { name: 'GPU' } },
        select: { id: true, name: true, brand: true, price: true, specs: true, performanceTier: true }
      });

      suggestions = allGpus.filter(c => {
        const cSpecs = parseSpecs(c.specs);
        const maxLen = parseFloat(caseSpecs.maxGpuLength || "999");
        const gpuLen = parseFloat(cSpecs.lengthMm || "0");
        return gpuLen <= maxLen &&
               c.performanceTier !== null &&
               c.performanceTier >= parts.CPU.performanceTier - 1 &&
               c.id !== parts.GPU.id;
      }).sort((a, b) => a.price - b.price).slice(0, 6).map(item => ({ category: 'GPU', item }));

      bottleneck = {
        title: "💡 كرت الشاشة سيحد من قوة الجهاز.",
        desc: "الأداء سيكون ممتازاً وسلساً في ألعاب الشوتر والتنافسية، لكن الكرت سيقلل الفريمات في ألعاب القصة الثقيلة والدقات العالية.",
        color: "text-blue-900 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800/50",
        suggestions
      };
    } else {
      bottleneck = {
        title: "🚀 توازن أداء مثالي.",
        desc: "المعالج والكرت من نفس الفئة تقريباً. ستحصل على أداء مستقر وتستغل كامل قوة الجهاز بدون اختناق.",
        color: "text-emerald-900 dark:text-emerald-400",
        bg: "bg-emerald-100 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800/50"
      };
    }
  }

  const getUpgradeUrl = (sugCategory: string, sugItemId: string) => {
    const p = new URLSearchParams();
    if (sugCategory === 'CPU' || parts.CPU) p.set('cpu', sugCategory === 'CPU' ? sugItemId : parts.CPU.id);
    if (sugCategory === 'GPU' || parts.GPU) p.set('gpu', sugCategory === 'GPU' ? sugItemId : parts.GPU.id);
    if (parts.Motherboard) p.set('motherboard', parts.Motherboard.id);
    if (parts.RAM) p.set('ram', parts.RAM.id);
    if (parts.Storage) p.set('storage', parts.Storage.id);
    if (parts.PSU) p.set('psu', parts.PSU.id);
    if (parts.Case) p.set('case', parts.Case.id);
    return `/builder?${p.toString()}`;
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-[#0B1120] py-12 lg:py-20 px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        
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

        {bottleneck && (
          <div className={`mb-8 p-6 border rounded-3xl ${bottleneck.bg} flex flex-col relative shadow-sm`}>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h4 className={`font-black text-lg mb-1.5 ${bottleneck.color}`}>
                  {bottleneck.title}
                </h4>
                <p className={`text-sm font-medium opacity-90 leading-relaxed ${bottleneck.color}`}>
                  {bottleneck.desc}
                </p>
              </div>
            </div>

            {bottleneck.suggestions && bottleneck.suggestions.length > 0 && (
              <div className="mt-6 pt-5 border-t border-current/15 w-full">
                <span className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${bottleneck.color} opacity-90`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  خيارات الترقية المقترحة:
                </span>
                
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
                  {bottleneck.suggestions.map((sug: any, idx: number) => (
                    <Link
                      key={idx}
                      href={getUpgradeUrl(sug.category, sug.item.id)}
                      className="group flex flex-col text-right p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/60 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-400 dark:hover:border-blue-500/50 min-w-[260px] max-w-[260px] shrink-0 snap-center relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between items-start w-full mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${brandColor(sug.item.brand, sug.item.name, sug.category)} bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700/50`}>
                          {sug.item.brand}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                          {sug.category}
                        </span>
                      </div>
                      <span className="text-sm font-extrabold line-clamp-2 leading-relaxed mb-4 text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={sug.item.name}>
                        {sug.item.name}
                      </span>
                      <div className="mt-auto flex justify-between items-end w-full pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">السعر</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                            {sug.item.price} <RiyalIcon size="h-3 w-3" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                          </span>
                        </div>
                        <span className="text-[11px] font-black flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-600 group-hover:text-white px-3 py-2 rounded-xl transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          استبدال
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {parts.CPU?.performanceTier && parts.GPU?.performanceTier && (
          <FpsEstimator cpuTier={parts.CPU.performanceTier} gpuTier={parts.GPU.performanceTier} />
        )}

        <div className="flex flex-col gap-3">
          {Object.entries(parts).map(([category, part]: [string, any]) => {
            /* اسمٌ محلّيّ مختلف عن الدالّة المستوردة — كان يتصادم معها */
            const brandCls = part ? brandColor(part.brand, part.name, category) : 'text-slate-400';
            
            return (
              <div key={category} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 transition-colors gap-4">
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 shrink-0 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center justify-center p-2 border border-slate-100 dark:border-slate-800">
                    <img 
                      src={productImage(part?.imageUrl, `/images/${category.toLowerCase()}/boxed.png`)} 
                      alt={part?.name || category} 
                      className="max-w-full max-h-full object-contain filter drop-shadow-sm opacity-90"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                      {category}
                    </span>
                    {part ? (
                      <h3 className={`text-sm md:text-base font-bold ${brandCls} leading-tight`}>
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
                    
                    <div className="flex gap-1.5">
                      <StoreBuyChips offers={(part as any).offers} />
                    </div>
                  </div>
                )}
                
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/builder" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-sm active:scale-95 text-sm">
            ابني تجميعتك الخاصة ⚡
          </Link>
        </div>

      </div>
    </div>
  );
}