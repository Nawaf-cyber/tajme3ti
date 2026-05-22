'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-black text-xl text-blue-900 dark:text-blue-400 hover:text-blue-700 transition-colors">
              <span className="text-2xl">⚡</span> PC Builder
            </Link>
            
            <Link href="/news" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors flex items-center gap-1">
              <span>📰</span> الأخبار
            </Link>
          </div>
          {session?.user?.email === "admin@pcbuilder.com" && (
            <Link 
               href="/admin/suggestions" 
              className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-3 py-2 rounded-lg transition-colors">
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
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full hidden sm:block">
                  {session.user?.email}
                </span>

                <Link href="/my-builds" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg transition-colors border border-blue-200 dark:border-blue-800">
                  تجميعاتي
                </Link>
                
                {/* إخفاء زر الإدارة عن المستخدمين العاديين */}
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
              <div className="flex items-center gap-2">
                <Link href="/api/auth/signin" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-white dark:hover:text-white hover:bg-blue-600 dark:hover:bg-blue-600 px-5 py-2 rounded-lg transition-colors border-2 border-blue-600 dark:border-blue-500">
                  دخول
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}