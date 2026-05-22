'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SavePrebuildButton({ payload }: { payload: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!session) {
      toast.error('يجب تسجيل الدخول لحفظ التجميعة');
      router.push('/login');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('فشل الحفظ');
      
      toast.success('تم حفظ التجميعة بنجاح!');
      router.push('/my-builds'); // عدل هذا المسار ليتطابق مع مسار صفحة تجميعاتي لديك
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button 
      onClick={handleSave}
      disabled={isSaving}
      className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
    >
      {isSaving ? 'جاري الحفظ...' : 'حفظ التجميعة في حسابي 💾'}
    </button>
  );
}