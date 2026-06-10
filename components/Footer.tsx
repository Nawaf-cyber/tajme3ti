"use client";
import Link from 'next/link';
import { useState } from 'react';
import SuggestionModal from './SuggestionModal';

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-transparent border-t border-slate-200/60 dark:border-slate-800/60 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            <div className="text-center md:text-right">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center md:justify-start gap-1.5">
                طُوّر في السعودية <span className="text-base">🇸🇦</span> لخدمة مجتمع اللاعبين العرب
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 font-mono">
                جميع الحقوق محفوظة © {new Date().getFullYear()} تجميعتي | tajme3ti 
              </p>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1.5"
              >
                <span>💡</span> للاقتراحات
              </button>
              
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-800"></div>

              <Link href="/about" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                عن المنصة
              </Link>
            </div>

          </div>
        </div>
      </footer>

      <SuggestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}