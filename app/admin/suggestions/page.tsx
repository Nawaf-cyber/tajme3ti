"use client";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Suggestion {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/suggestions')
      .then(res => res.json())
      .then(data => {
        setSuggestions(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاقتراح؟')) return;

    try {
      const res = await fetch(`/api/suggestions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuggestions(suggestions.filter(s => s.id !== id));
        toast.success('تم الحذف بنجاح');
      } else {
        toast.error('حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال');
    }
  };

  if (loading) return <div className="p-8 text-center text-xl font-bold">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white">إدارة الاقتراحات</h1>
      
      {suggestions.length === 0 ? (
        <div className="text-gray-500 text-lg bg-gray-50 dark:bg-slate-800/50 p-6 rounded-xl border border-gray-200 dark:border-slate-800">
          لا توجد اقتراحات حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.map((s) => (
            <div key={s.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{s.title}</h2>
                <button 
                  onClick={() => handleDelete(s.id)}
                  className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                >
                  حذف
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed break-words">
                 {s.content}
              </p>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                <span className="text-xs font-bold text-gray-400">
                  {new Date(s.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}