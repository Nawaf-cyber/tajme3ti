"use client";

import { useState } from 'react';
import SuggestionModal from '../../components/SuggestionModal';

export default function AboutPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
    
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 md:p-12">
        
        {/* اسم المنصة */}
        <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
         <strong className="text-blue-600 dark:text-blue-400"> تجميعتي</strong>
        </h1>
        
        {/* عنوان فرعي */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
          عن المنصة
        </h2>
        
        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
          <p>
            <strong className="text-blue-600 dark:text-blue-400">تجميعتي</strong> هي منصة سعودية تهدف إلى تسهيل عملية اختيار وتجميع أجهزة الكمبيوتر للمستخدم العربي بطريقة ذكية وسهلة.
          </p>
          <p>
            نوفر أداة تساعدك على اختيار القطع المتوافقة تقنيًا، مع إمكانية مقارنة الأسعار والوصول إلى روابط شراء مباشرة من المتاجر المحلية والعالمية الموثوقة.
          </p>
          <p> 
              نسعى لتقديم تجربة مبسطة تناسب الجميع، سواء كنت مبتدئًا في عالم الـ PC أو محترفًا يبحث عن أفضل تجميعة ممكنة.
          </p>
          
          <div className="bg-blue-50 dark:bg-slate-800/50 p-6 rounded-xl border border-blue-100 dark:border-slate-700 mt-8">
            <h3 className="font-bold text-xl text-blue-800 dark:text-blue-400 mb-2">تواصل معنا</h3>
            <p className="text-sm mb-4">
              نحن في مرحلة التطوير المستمر، وملاحظاتكم تهمنا جداً لتحسين المنصة وإضافة ميزات جديدة. لا تتردد في إرسال أفكارك أو الإبلاغ عن أي مشكلة.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              إرسال اقتراح
            </button>
          </div>
        </div>
      </div>

      {/* النافذة المنبثقة للاقتراحات */}
      <SuggestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}