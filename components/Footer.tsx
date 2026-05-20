"use client";
import Link from 'next/link';
import { useState } from 'react';
import SuggestionModal from './SuggestionModal';

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-right">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                منصة سعودية لتسهيل بناء أجهزة الـ PC 🇸🇦
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                جميع الحقوق محفوظة © {new Date().getFullYear()}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                💡 للاقتراحات
              </button>
              <Link href="/about" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
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