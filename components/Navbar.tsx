'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // حالة فتح وإغلاق القائمة

  useEffect(() => setMounted(true), []);

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* الشعار */}
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-blue-900 dark:text-blue-400 hover:text-blue-700 transition-colors">
            <span className="text-2xl">⚡</span> PC Builder
          </Link>
          
          {/* زر القائمة (الشخطات) للجوال */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* عناصر الشاشة الكبيرة (تختفي في الجوال) */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/news" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors flex items-center gap-1">
              <span>📰</span> الأخبار
            </Link>

            {session?.user?.email === "admin@pcbuilder.com" && (
              <Link href="/admin/suggestions" className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-3 py-2 rounded-lg transition-colors">
                ⚙️ إدارة الاقتراحات
              </Link>
            )}

            <div className="flex items-center gap-4">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  title="تغيير المظهر"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
              )}

              {session ? (
                <>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {session.user?.email}
                  </span>

                  <Link href="/my-builds" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg transition-colors border border-blue-200 dark:border-blue-800">
                    تجميعاتي
                  </Link>
                  
                  {session.user?.role === 'ADMIN' && (
                    <Link href="/admin" className="text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-4 py-2 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800">
                      لوحة الإدارة
                    </Link>
                  )}

                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })} 
                    className="text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    تسجيل خروج
                  </button>
                </>
              ) : (
                <Link href="/api/auth/signin" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-white dark:hover:text-white hover:bg-blue-600 dark:hover:bg-blue-600 px-5 py-2 rounded-lg transition-colors border-2 border-blue-600 dark:border-blue-500">
                  دخول
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* القائمة المنسدلة للجوال (تظهر فقط عند تفعيل الزر) */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-800 flex flex-col gap-4">
            <Link href="/news" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 dark:text-gray-300 font-semibold flex items-center gap-2 px-2">
              <span>📰</span> الأخبار
            </Link>

            {session?.user?.email === "admin@pcbuilder.com" && (
              <Link href="/admin/suggestions" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-amber-600 dark:text-amber-500 px-2">
                ⚙️ إدارة الاقتراحات
              </Link>
            )}

            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                المظهر:
              </span>
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
              )}
            </div>

            {session ? (
              <div className="flex flex-col gap-3 px-2 mt-2 border-t border-gray-100 dark:border-slate-700 pt-4">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate w-full text-center">
                  {session.user?.email}
                </span>

                <Link href="/my-builds" onClick={() => setIsMobileMenuOpen(false)} className="text-center text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  تجميعاتي
                </Link>
                
                {session.user?.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-center text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    لوحة الإدارة
                  </Link>
                )}

                <button 
                  onClick={() => signOut({ callbackUrl: '/' })} 
                  className="text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg"
                >
                  تسجيل خروج
                </button>
              </div>
            ) : (
              <Link href="/api/auth/signin" onClick={() => setIsMobileMenuOpen(false)} className="text-center text-sm font-bold text-blue-600 dark:text-blue-400 bg-transparent border-2 border-blue-600 dark:border-blue-500 px-5 py-3 rounded-lg mt-2">
                تسجيل الدخول
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}