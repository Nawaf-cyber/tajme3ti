"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuggestionModal({ isOpen, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        toast.success('تم الإرسال بنجاح، شكراً لمساهمتك!');
        setTitle('');
        setContent('');
        onClose();
      } else {
        toast.error('حدث خطأ أثناء الإرسال');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">إرسال اقتراح 💡</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">عنوان الاقتراح</label>
            <input 
              type="text" 
              required 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: إضافة قسم للاكسسوارات"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">التفاصيل</label>
            <textarea 
              required 
              rows={4} 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="اشرح فكرتك هنا..."
            ></textarea>
            <p className="text-[13px] text-gray-400 leading-6 mt-4">
              مع العلم سوف تظهر بياناتك (بريدك الاكتروني واسمك) مع الاقتراح، ولكن لا تقلق سيتم إخفاء بريدك الإلكتروني عن الجميع ولن يتم استخدامه إلا للرد عليك في حال تم تنفيذ اقتراحك أو إذا كنا بحاجة لمزيد من التفاصيل.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              إلغاء
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-6 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}