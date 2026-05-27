'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const RiyalIcon = ({ size = 'h-4 w-4', colorClass = 'bg-emerald-500' }: { size?: string, colorClass?: string }) => (
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

const getBrandColor = (brand: string, name: string, categoryName: string) => {
  if (categoryName !== 'CPU' && categoryName !== 'GPU') return 'text-blue-600 dark:text-blue-400';
  const textToSearch = `${brand || ''} ${name || ''}`.toLowerCase();
  if (textToSearch.includes('amd') || textToSearch.includes('radeon')) return 'text-red-600 dark:text-red-500';
  if (textToSearch.includes('nvidia') || textToSearch.includes('geforce') || textToSearch.includes('rtx') || textToSearch.includes('gtx')) return 'text-[#76b900] dark:text-[#8ce600]';
  if (textToSearch.includes('intel')) return 'text-blue-600 dark:text-blue-500';
  return 'text-blue-600 dark:text-blue-400';
};

const getBottleneckMessage = (parts: any) => {
  const cpu = parts['CPU'];
  const gpu = parts['GPU'];
  if (cpu?.performanceTier && gpu?.performanceTier) {
    const diff = cpu.performanceTier - gpu.performanceTier;
    if (diff < -1) {
      return {
        title: "⚠️ تنبيه: المعالج أضعف من الكرت",
        desc: "سيشكل المعالج 'عنق زجاجة' ولن يتمكن من مجاراة الكرت، خاصة على دقة 1080p. يُنصح بترقية المعالج أو اللعب على دقة 4K لتقليل الضغط عليه.",
        color: "text-amber-700 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/40"
      };
    } else if (diff > 1) {
      return {
        title: "💡 تنبيه: الكرت أضعف من المعالج",
        desc: "أداء ممتاز في ألعاب (Esports) لاعتمادها على المعالج، لكن الكرت سيحد من قوة الجهاز في ألعاب القصة (AAA) والدقات العالية.",
        color: "text-blue-700 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/40"
      };
    } else {
      return {
        title: "🚀 توازن أداء مثالي",
        desc: "المعالج والكرت من نفس الفئة تقريباً. ستحصل على أداء مستقر وتستغل كامل قوة الجهاز بدون عنق زجاجة ملحوظ.",
        color: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40"
      };
    }
  }
  return null;
};

export default function MyBuildsPage() {
  const { data: session, status } = useSession();
  const [builds, setBuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuild, setSelectedBuild] = useState<any>(null);

  useEffect(() => {
    fetchBuilds();
  }, [status]);

  const fetchBuilds = () => {
    if (status === 'authenticated') {
      fetch('/api/builds')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setBuilds(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذه التجميعة نهائياً؟')) return;

    try {
      const res = await fetch(`/api/builds/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل الحذف');

      toast.success('تم الحذف بنجاح');
      setBuilds(builds.filter(build => build.id !== id));
      if (selectedBuild?.id === id) setSelectedBuild(null);
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleShare = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/build/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('تم نسخ رابط التجميعة بنجاح');
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] font-bold text-slate-500">جاري التحميل...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1120] px-4">
        <div className="bg-white dark:bg-[#111827] p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 max-w-sm w-full text-center">
          <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">حسابك غير متصل</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">سجل دخولك للوصول لتجميعاتك المحفوظة.</p>
          <Link href="/api/auth/signin" className="block w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-sm"></span>
            مكتبة التجميعات
          </h1>
          <Link href="/builder" className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-2 px-5 rounded-xl transition-colors text-sm">
            + بناء جديد
          </Link>
        </div>
        
        {builds.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 mb-4 font-bold">لا توجد تجميعات محفوظة.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {builds.map((build) => {
              const bottleneck = getBottleneckMessage(build.parts);
              const cpu = build.parts['CPU'];
              const gpu = build.parts['GPU'];
              
              return (
                <div 
                  key={build.id} 
                  className="bg-white dark:bg-[#111827] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer flex flex-col"
                  onClick={() => setSelectedBuild(build)}
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">{build.name}</h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {new Date(build.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {cpu && (
                        <div className="text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-2 rounded-lg truncate">
                          <span className="font-bold text-slate-400 mr-1">المعالج:</span>
                          <span className={`${getBrandColor(cpu.brand, cpu.name, 'CPU')} font-bold mr-1`}>{cpu.brand}</span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">{cpu.name}</span>
                        </div>
                      )}
                      {gpu && (
                        <div className="text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-2 rounded-lg truncate">
                          <span className="font-bold text-slate-400 mr-1">الكرت:</span>
                          <span className={`${getBrandColor(gpu.brand, gpu.name, 'GPU')} font-bold mr-1`}>{gpu.brand}</span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">{gpu.name}</span>
                        </div>
                      )}
                    </div>

                    {bottleneck && (
                      <div className={`p-2 border rounded-lg ${bottleneck.bg} mb-4`}>
                        <span className={`font-bold text-xs ${bottleneck.color}`}>{bottleneck.title}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center rounded-b-xl">
                    <span className="font-black text-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      {Number(build.totalPrice).toFixed(2)} <RiyalIcon size="h-4 w-4" />
                    </span>
                    <div className="flex gap-2">
                      <button onClick={(e) => handleShare(build.id, e)} className="p-2 text-slate-400 hover:text-blue-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors" title="مشاركة">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      </button>
                      <button onClick={(e) => handleDelete(build.id, e)} className="p-2 text-rose-500 hover:text-rose-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors" title="حذف">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* نافذة استعراض التجميعة (Modal) */}
        {selectedBuild && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm p-4" onClick={() => setSelectedBuild(null)}>
            <div 
              className="bg-white dark:bg-[#111827] rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">{selectedBuild.name}</h2>
                <div className="flex gap-2">
                  <button onClick={() => handleShare(selectedBuild.id)} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  </button>
                  <button onClick={() => setSelectedBuild(null)} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 flex items-center justify-center hover:text-rose-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              
              <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                {/* شرح التنبيه التفصيلي يظهر هنا داخل النافذة بشكل نظيف وملائم للشاشة */}
                {(() => {
                  const modalBottleneck = getBottleneckMessage(selectedBuild.parts);
                  if (modalBottleneck) {
                    return (
                      <div className={`p-4 rounded-xl border ${modalBottleneck.bg} mb-5`}>
                        <h4 className={`font-bold text-sm mb-1.5 ${modalBottleneck.color}`}>{modalBottleneck.title}</h4>
                        <p className={`text-xs font-medium leading-relaxed opacity-90 ${modalBottleneck.color}`}>{modalBottleneck.desc}</p>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="grid grid-cols-1 gap-2.5">
                  {['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'Case', 'PSU'].map((category) => {
                    const part = selectedBuild.parts[category];
                    return (
                      <div key={category} className="flex flex-col sm:flex-row justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/50 flex items-center justify-center shrink-0">
                            {part?.imageUrl ? <img src={part.imageUrl} alt={part.name} className="max-w-full max-h-full p-1 object-contain" /> : <span className="opacity-20 text-sm">⚙️</span>}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{category}</span>
                            {part ? (
                              <div className="text-sm">
                                <span className={`${getBrandColor(part.brand, part.name, category)} font-bold mr-1`}>{part.brand}</span>
                                <span className="text-slate-900 dark:text-white font-bold">{part.name}</span>
                              </div>
                            ) : (
                              <span className="text-rose-500 font-bold text-xs">لم يتم الاختيار</span>
                            )}
                          </div>
                        </div>
                        
                        {part && (
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pl-1 sm:pl-0 sm:border-r border-t sm:border-t-0 border-slate-200 dark:border-slate-700 pt-2 sm:pt-0 mt-1 sm:mt-0">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-sm bg-emerald-50 dark:bg-emerald-900/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/20">
                              {part.price} <RiyalIcon size="h-3 w-3" />
                            </span>
                            <div className="flex gap-1">
                              {part.amazonUrl && <a href={part.amazonUrl} target="_blank" className="px-2 py-1 bg-[#232F3E] text-white text-[10px] rounded font-bold">أمازون</a>}
                              {part.cazasouqUrl && <a href={part.cazasouqUrl} target="_blank" className="px-2 py-1 bg-[#FF9900] text-white text-[10px] rounded font-bold">كازاسوق</a>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center shrink-0">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">الإجمالي</span>
                  <span className="font-black text-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    {Number(selectedBuild.totalPrice).toFixed(2)} <RiyalIcon size="h-4 w-4" />
                  </span>
                </div>
                <button onClick={() => handleDelete(selectedBuild.id)} className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold transition-colors text-sm">
                  حذف التجميعة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}