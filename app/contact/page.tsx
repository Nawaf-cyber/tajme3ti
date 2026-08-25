"use client";

import { useState } from 'react';
import SuggestionModal from '../../components/SuggestionModal';

export default function ContactPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-gray-100 dark:border-slate-800 p-8 md:p-12">

        <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
          اتصل بنا
        </h1>

        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
          نسعد بتواصلك معنا
        </h2>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">

          <p>
            في <strong className="text-blue-600 dark:text-blue-400">تجميعتي</strong>، رأيك يهمّنا. سواء كان لديك اقتراح لتحسين المنصة، أو لاحظت مشكلة تقنية، أو عندك سؤال عن تجميعة أو قطعة معيّنة، أو ترغب في التعاون معنا — يسعدنا أن نسمع منك.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-8">

            <div className="bg-blue-50 dark:bg-slate-800/50 p-6 rounded-sm border border-blue-100 dark:border-slate-700">
              <h3 className="font-bold text-xl text-blue-800 dark:text-blue-400 mb-2">اقتراح أو إبلاغ عن مشكلة</h3>
              <p className="text-sm mb-4">
                أسرع طريقة للوصول إلينا هي عبر نموذج الاقتراحات المباشر. اكتب رسالتك وسنطّلع عليها بأقرب وقت.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-sm transition-colors"
              >
                إرسال رسالة
              </button>
            </div>

            <div className="bg-emerald-50 dark:bg-slate-800/50 p-6 rounded-sm border border-emerald-100 dark:border-slate-700">
              <h3 className="font-bold text-xl text-emerald-800 dark:text-emerald-400 mb-2">البريد الإلكتروني</h3>
              <p className="text-sm mb-4">
                للاستفسارات المتعلّقة بالتعاون أو الإعلانات أو المواضيع الرسمية، يمكنك مراسلتنا مباشرة عبر البريد الإلكتروني.
              </p>
              <a
                href="mailto:info@tajme3ti.com"
                className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-6 rounded-sm transition-colors"
              >
                tajme3ti@gmail.com
              </a>
            </div>

          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            نبذل جهدنا للرد على جميع الرسائل في أقرب وقت ممكن. شكراً لاهتمامك ومساهمتك في تطوير المنصة.
          </p>

        </div>
      </div>

      <SuggestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
