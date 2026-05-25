'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const RiyalIcon = ({ size = 'h-4 w-4', colorClass = 'bg-emerald-600 dark:bg-emerald-400' }: { size?: string, colorClass?: string }) => (
  <div 
    className={`${size} ${colorClass} inline-block shrink-0`} 
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

// الدالة المحدثة لتدعم المربع العائم (Tooltip) والتصاميم الملونة
const getBottleneckMessage = (parts: any) => {
  const cpu = parts['CPU'];
  const gpu = parts['GPU'];
  
  if (cpu?.performanceTier && gpu?.performanceTier) {
    const diff = cpu.performanceTier - gpu.performanceTier;
    if (diff < -1) {
      return {
        title: "⚠️ تنبيه أداء: المعالج أضعف بكثير من كرت الشاشة.",
        desc: "سيشكل المعالج 'عنق زجاجة' ولن يتمكن من مجاراة الكرت، خاصة على دقة 1080p. يُنصح بترقية المعالج أو اللعب على دقة 4K لتقليل الضغط عليه.",
        color: "text-amber-800 dark:text-amber-300",
        bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
      };
    } else if (diff > 1) {
      return {
        title: "💡 تنبيه أداء: كرت الشاشة أضعف من المعالج.",
        desc: "الأداء سيكون ممتازاً في ألعاب الرياضات الإلكترونية (Esports) لاعتمادها على المعالج، لكن الكرت سيحد من الأداء بشكل كبير في ألعاب القصة (AAA) والدقات العالية مثل 1440p و 4K.",
        color: "text-blue-800 dark:text-blue-300",
        bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      };
    } else {
      return {
        title: "🚀 توازن مثالي بين المعالج وكرت الشاشة.",
        desc: "المعالج والكرت من نفس الفئة تقريباً. ستحصل على أداء مستقر وتستغل كامل قوة الجهاز بدون عنق زجاجة ملحوظ.",
        color: "text-emerald-800 dark:text-emerald-300",
        bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
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

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه التجميعة؟')) return;

    try {
      const res = await fetch(`/api/builds/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('فشل الحذف');

      toast.success('تم حذف التجميعة');
      setBuilds(builds.filter(build => build.id !== id));
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/build/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('تم نسخ الرابط! يمكنك مشاركته الآن');
  };

  if (status === 'loading' || loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-800 dark:text-gray-200">جاري التحميل...</div>;

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0B1120] transition-colors duration-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">يجب تسجيل الدخول لرؤية تجميعاتك</h2>
        <Link href="/api/auth/signin" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">تسجيل الدخول</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">تجميعاتي المحفوظة</h1>
      
      {builds.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
          <p className="text-gray-600 dark:text-gray-400 mb-4 font-bold">لا يوجد لديك أي تجميعات محفوظة حالياً.</p>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors">ابني تجميعتك الأولى</Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {builds.map((build) => {
            const bottleneck = getBottleneckMessage(build.parts);
            
            return (
              <div key={build.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xl mb-1 text-blue-700 dark:text-blue-400">{build.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{new Date(build.createdAt).toLocaleDateString('ar-SA')}</p>
                  
                  <div className="mb-4 text-gray-800 dark:text-gray-200 font-bold flex items-center gap-1">
                    التكلفة الإجمالية: <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">{Number(build.totalPrice).toFixed(2)} <RiyalIcon size="h-3 w-3" /></span>
                  </div>

                  {/* صندوق الاختناق بتصميمه الجديد */}
                  {bottleneck && (
                    <div className={`mb-4 p-3 border rounded-lg ${bottleneck.bg} flex items-center justify-between gap-2 relative`}>
                      <span className={`font-bold text-xs ${bottleneck.color}`}>
                        {bottleneck.title}
                      </span>
                      
                      <div tabIndex={0} className="relative group cursor-pointer flex items-center justify-center shrink-0 outline-none">
                           <span className={`text-sm font-bold underline cursor-pointer hover:opacity-70 transition-opacity ${bottleneck.color}`}>
                           لماذا؟
                        </span>
  
                       {/* الصندوق العائم (Tooltip) متوافق مع الجوال */}
                     <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-[80vw] max-w-[260px] sm:w-64 p-3 bg-gray-900 dark:bg-black text-white text-xs leading-relaxed font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible transition-all duration-200 z-50 shadow-xl pointer-events-none text-center">
                     {/* لاحظ: في ملف شاشة البناء المتغير اسمه result.bottleneck.desc وفي الملفين الأخرى اسمه bottleneck.desc */}
                     {/* استخدم المتغير الصحيح بناءً على الملف، أو استخدم هذا السطر المزدوج ليعمل في كل الملفات تلقائياً: */}
                        {bottleneck.desc}
                     <div className="absolute top-full right-1/2 translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-black"></div>
                     </div>
                    </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => setSelectedBuild(build)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-bold py-2 rounded-lg transition-colors"
                  >
                    التفاصيل
                  </button>
                  <button 
                    onClick={() => handleShare(build.id)}
                    className="px-4 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-bold py-2 rounded-lg transition-colors"
                    title="مشاركة التجميعة"
                  >
                    🔗
                  </button>
                  <button 
                    onClick={() => handleDelete(build.id)}
                    className="px-4 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-bold py-2 rounded-lg transition-colors"
                    title="حذف التجميعة"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedBuild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b dark:border-slate-800 bg-gray-50 dark:bg-slate-800">
              <h2 className="font-bold text-xl text-gray-900 dark:text-white">{selectedBuild.name}</h2>
              <button onClick={() => setSelectedBuild(null)} className="text-gray-500 hover:text-red-500 font-bold text-xl transition-colors">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-3">
                {Object.entries(selectedBuild.parts).map(([category, part]: [string, any]) => (
                  <div key={category} className="flex flex-col p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700 gap-3">
                    <div className="flex sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {part?.imageUrl && (
                          <img src={part.imageUrl} alt={part.name} className="w-12 h-12 rounded object-contain bg-white dark:bg-slate-700 p-1" />
                        )}
                        <div>
                          <span className="text-xs font-bold text-gray-500 block">[{category}]</span>
                          <span className="text-gray-900 dark:text-gray-100 font-bold">
                            {part ? `${part.brand} ${part.name}` : <span className="text-red-500">لم يتم اختيار قطعة</span>}
                          </span>
                        </div>
                      </div>
                      {part && (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap flex items-center gap-1">
                          {part.price} <RiyalIcon size="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    
                    {part && (part.amazonUrl || part.cazasouqUrl) && (
                      <div className="flex gap-2 mt-1 mr-14">
                        {part.amazonUrl && (
                          <a href={part.amazonUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded font-bold transition-colors shadow-sm">
                            شراء من أمازون
                          </a>
                        )}
                        {part.cazasouqUrl && (
                          <a href={part.cazasouqUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded font-bold transition-colors shadow-sm">
                            شراء من كازاسوق
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t dark:border-slate-800 bg-gray-50 dark:bg-slate-800 flex justify-between items-center">
              <div className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-1">
                الإجمالي: <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">{Number(selectedBuild.totalPrice).toFixed(2)} <RiyalIcon size="h-4 w-4" /></span>
              </div>
              <button onClick={() => setSelectedBuild(null)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}