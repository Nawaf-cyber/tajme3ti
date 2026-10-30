"use client";

import { useState } from 'react';
import Link from 'next/link';
import SuggestionModal from '../../components/SuggestionModal';

export default function ContactPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="relative bg-white/80 dark:bg-[#0F172A]/75 backdrop-blur-sm rounded-sm shadow-sm border-x border-b border-t-2 border-slate-200 dark:border-slate-800 border-t-cyan-500/70 p-8 md:p-12">

        <h1 className="flex items-center gap-3 text-3xl md:text-4xl font-black tracking-tight mb-3 text-slate-900 dark:text-white"><span aria-hidden="true" className="h-9 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_10px] shadow-cyan-500/40"></span>
          اتصل بنا
        </h1>

        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
          نسعد بتواصلك معنا
        </h2>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">

          <p>
            في <strong className="text-cyan-700 dark:text-cyan-400">تجميعتي</strong>، رأيك يهمّنا. سواء كان لديك اقتراح لتحسين المنصة، أو لاحظت مشكلة تقنية، أو عندك سؤال عن تجميعة أو قطعة معيّنة، أو ترغب في التعاون معنا — يسعدنا أن نسمع منك.
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
                href="mailto:Tajme3ti02@gmail.com"
                className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-6 rounded-sm transition-colors"
              >
                Tajme3ti02@gmail.com
              </a>
            </div>

          </div>

          <p className="text-base bg-cyan-50 dark:bg-slate-800/50 border border-cyan-100 dark:border-slate-700 rounded-sm p-4">
            صاحب متجر وتريد عرض أسعارك عندنا؟{' '}
            <Link href="/for-stores" className="font-bold text-cyan-700 dark:text-cyan-400 hover:underline">قدّم طلب الانضمام ←</Link>
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            نبذل جهدنا للرد على جميع الرسائل في أقرب وقت ممكن. شكراً لاهتمامك ومساهمتك في تطوير المنصة.
          </p>

        </div>
      </div>

      <SuggestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
