'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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

  if (status === 'loading' || loading) return <div className="min-h-screen flex items-center justify-center font-bold">جاري التحميل...</div>;

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">يجب تسجيل الدخول لرؤية تجميعاتك</h2>
        <Link href="/api/auth/signin" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">تسجيل الدخول</Link>
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
          {builds.map((build) => (
            <div key={build.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl mb-1 text-blue-700 dark:text-blue-400">{build.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{new Date(build.createdAt).toLocaleDateString('ar-SA')}</p>
                <div className="mb-4 text-gray-800 dark:text-gray-200 font-bold">
                  التكلفة الإجمالية: <span className="text-green-600 dark:text-green-400">${build.totalPrice}</span>
                </div>
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
          ))}
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
                        <span className="font-bold text-green-600 dark:text-green-400 whitespace-nowrap">${part.price}</span>
                      )}
                    </div>
                    
                    {/* أزرار الشراء تظهر تحت القطعة */}
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
              <div className="font-bold text-lg">الإجمالي: <span className="text-green-600 dark:text-green-400">${selectedBuild.totalPrice}</span></div>
              <button onClick={() => setSelectedBuild(null)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}