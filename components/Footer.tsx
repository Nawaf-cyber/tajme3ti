"use client";
import Link from 'next/link';
import { useState } from 'react';
import SuggestionModal from './SuggestionModal';

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <footer className="relative bg-transparent mt-auto transition-colors duration-300 overflow-hidden">
        {/* خط سيان علوي يربط الفوتر بهوية الموقع */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10">

            {/* العلامة + الوصف */}
            <div className="text-center md:text-right max-w-sm">
              <Link href="/" className="inline-flex items-center gap-2.5 font-black text-2xl text-slate-900 dark:text-white group mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-cyan-500/30 group-hover:rotate-12 transition-transform">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z" />
                  </svg>
                </div>
                تجميعتي
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                منصة عربية تفحص توافق قطع الحاسوب برمجياً وتقارن أسعار المتاجر السعودية لحظياً. نوجّه المجتمع، لا نبيع.
              </p>
            </div>

            {/* الروابط */}
            <div className="flex flex-col items-center md:items-end gap-5">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                >
                  <span>💡</span> للاقتراحات
                </button>

                <Link href="/about" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  عن المنصة
                </Link>

                <Link href="/contact" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  اتصل بنا
                </Link>

                <Link href="/privacy" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  سياسة الخصوصية
                </Link>
              </div>

              <div className="hidden md:block w-40 h-px bg-gradient-to-l from-cyan-500/30 to-transparent"></div>

              <p className="text-xs font-medium text-slate-500 dark:text-slate-500 font-mono flex items-center gap-1.5">
                طُوّر في السعودية <span className="text-sm">🇸🇦</span> © {new Date().getFullYear()} تجميعتي
              </p>
            </div>

          </div>
        </div>
      </footer>

      <SuggestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}