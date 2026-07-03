'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="relative w-full bg-white/70 dark:bg-[#0B1120]/40 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
      {/* خط سيان سفلي يربط الشريط بهوية الموقع */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* الشعار */}
          <Link href="/" className="flex items-center gap-2.5 font-black text-2xl text-slate-900 dark:text-white group">
            <div className="relative w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform shadow-md shadow-cyan-500/30">
              <div className="absolute inset-0 bg-cyan-400/40 blur-lg rounded-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z" />
              </svg>
            </div>
            <span className="tracking-tight">تجميعتي</span>
          </Link>
          
          {/* زر القائمة (Mobile Toggle) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* عناصر الشاشة الكبيرة */}
          <div className="hidden md:flex items-center gap-2">
            
            <Link href="/news" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" /></svg>
              الأخبار
            </Link>

            {session?.user?.email === "admin@pcbuilder.com" && (
              <Link href="/admin/suggestions" className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                إدارة الاقتراحات
              </Link>
            )}

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={theme === 'dark' ? 'تفعيل الوضع المضيء' : 'تفعيل الوضع الليلي'}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
            )}

            {session ? (
              <div className="flex items-center gap-2 ml-2">
                
                {session.user?.role === 'ADMIN' && (
                  <Link href="/admin" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-xl transition-colors">
                    لوحة الإدارة
                  </Link>
                )}

                <Link href="/my-builds" className="text-sm font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/40 px-4 py-2 rounded-xl transition-colors border border-cyan-100 dark:border-cyan-800/30 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  تجميعاتي
                </Link>

                <div className="relative group ml-1">
                  <button className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:ring-2 hover:ring-cyan-500/50 transition-all">
                    <span className="text-sm font-bold uppercase">{session.user?.email?.[0] || 'U'}</span>
                  </button>
                  {/* Tooltip للمستخدم وتسجيل الخروج */}
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-400 mb-0.5">مسجل الدخول كـ</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{session.user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button 
                        onClick={() => signOut({ callbackUrl: '/' })} 
                        className="w-full text-right flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-2 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <Link href="/login" className="ml-2 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95">
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>

        {/* القائمة المنسدلة للجوال */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-2 animate-in slide-in-from-top-4 duration-200">
            
            <Link href="/news" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-slate-700 dark:text-slate-200 font-bold flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" /></svg>
              الأخبار
            </Link>

            {session?.user?.email === "admin@pcbuilder.com" && (
              <Link href="/admin/suggestions" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-3 px-4 py-3 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 rounded-xl transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                إدارة الاقتراحات
              </Link>
            )}

            <div className="w-full h-px bg-slate-100 dark:bg-slate-800/60 my-2"></div>

            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">مظهر الموقع</span>
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 text-sm font-bold"
                >
                  {theme === 'dark' ? (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> مضيء</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> ليلي</>
                  )}
                </button>
              )}
            </div>

            <div className="w-full h-px bg-slate-100 dark:bg-slate-800/60 my-2"></div>

            {session ? (
              <div className="flex flex-col gap-2">
                <div className="px-4 py-2">
                  <p className="text-xs text-slate-400 mb-0.5">مسجل الدخول كـ</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{session.user?.email}</p>
                </div>

                <Link href="/my-builds" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-4 py-3.5 rounded-xl border border-cyan-100 dark:border-cyan-800/30 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  تجميعاتي المحفوظة
                </Link>
                
                {session.user?.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-4 py-3.5 rounded-xl flex items-center justify-center gap-2">
                    لوحة الإدارة
                  </Link>
                )}

                <button 
                  onClick={() => signOut({ callbackUrl: '/' })} 
                  className="mt-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-4 text-center text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3.5 rounded-xl shadow-md shadow-cyan-500/20">
                تسجيل الدخول
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}