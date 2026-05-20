'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'حدث خطأ أثناء التسجيل');
        setLoading(false);
        return;
      }

      toast.success('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.');
      router.push('/api/auth/signin'); 
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">إنشاء حساب جديد</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
              dir="ltr"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'جاري التسجيل...' : 'تسجيل'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">لديك حساب بالفعل؟ </span>
          <button onClick={() => router.push('/api/auth/signin')} className="text-sm text-blue-600 hover:underline">
            تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
}