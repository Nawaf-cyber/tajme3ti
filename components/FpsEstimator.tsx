'use client';

/* ============ مُقدِّر الإطارات — مصدرٌ واحد ============
 *
 * ⚠️ كان منسوخاً في موضعين، وافترقا في **السلوك** لا في الشكل:
 * نسخة «تجميعاتي» عميلةٌ بحالة React فتعمل، ونسخة صفحة التجميعة المشتركة
 * خادميّةٌ بُنيت بمحدّد peer-checked من CSS خالص — وتسمياتُها ليست أشقّاء
 * لأزرار الراديو بل داخل حاويةٍ أخرى.
 *
 * ومحدّد الأخوّة العامّ في CSS يشترط أن يشترك العنصران في الأب، فكان
 * المحتوى يتبدّل (اللوحات أشقّاء فعلاً)
 * **ولا يتبدّل شكل التبويب المختار** — قُست خلفيّته فكانت شفّافة. أي أن
 * الزائر ينقر فيتغيّر الرقم ولا يعرف أيّ دقّةٍ يقرأ.
 *
 * فصار مكوّناً عميلاً واحداً تستعمله الصفحتان: الخادميّة تستطيع أن تُصيّر
 * عميلاً، والعكس هو الممنوع.
 */

import { useEffect, useState } from 'react';

export default function FpsEstimator({ cpuTier, gpuTier }: { cpuTier: number; gpuTier: number }) {
  const gpuBasePower: Record<number, number> = {
    1: 120, 
    2: 180, 
    3: 270, 
    4: 380, 
    5: 550  
  };

  const baseScore = gpuBasePower[gpuTier] || 120;

  const resMultipliers: Record<string, number> = {
    '1080p': 1.0,
    '1440p': 0.70,
    '4K': 0.45
  };

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
  const [activeRes, setActiveRes] = useState<string>(tierData.recommended);

  useEffect(() => {
    setActiveRes(tierData.recommended);
  }, [cpuTier, gpuTier]);

  return (
    <div className="mb-5 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/30 shadow-sm relative">
      <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          الأداء المتوقع
        </h4>
        
        <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-lg">
          {['1080p', '1440p', '4K'].map(res => {
            const isRecommended = tierData.recommended === res;
            return (
              <button
                key={res}
                onClick={(e) => { e.stopPropagation(); setActiveRes(res); }}
                title={isRecommended ? "الدقة المثالية لقوة جهازك" : `عرض الأداء على دقة ${res}`}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  activeRes === res
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {res} {isRecommended && '★'}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-100 dark:divide-slate-700/50 p-2">
        {Object.entries(tierData.data[activeRes]).map(([type, data]: any) => (
          <div key={type} className="p-3 text-center flex flex-col items-center justify-center group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl">
            <span className="text-xl mb-1">{data.icon}</span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{data.name}</span>
            <span className="text-lg font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform">{data.fps}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
