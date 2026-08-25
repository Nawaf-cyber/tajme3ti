'use client';

/* ============ شريط التنقّل ============
 *
 * أُعيدت صياغته لأربعة عيوبٍ لا لأجل الشكل وحده:
 *
 *   ١) **لا يقول أين أنت.** خمسة روابط بلا أيّ أثرٍ للصفحة الحالية —
 *      وهي أوّل وظيفةٍ لشريط التنقّل قبل أن تكون زينة.
 *
 *   ٢) **قوس قزح.** «أدلّة» تُضيء أخضر و«الأخبار» سيان و«قارن» سيان
 *      و«تخفيضات» ورديّ — أربعة ألوانٍ لأربعة روابط متساوية الرتبة.
 *      صار اللون واحداً، والورديّ وحده استثناءٌ **له معنى**: صفحة
 *      التخفيضات نفسها ورديّة، فاللون إشارةٌ لا تزيين.
 *
 *   ٣) **رابطان مفقودان في الجوّال.** «قارن القطع» و«تخفيضات» لم يكونا
 *      في القائمة المنسدلة إطلاقاً — فمن يفتح الموقع من جوّاله لا يصل
 *      إليهما من الشريط. عطبٌ لا ذوق.
 *
 *   ٤) **قائمة الحساب تفتح بالمرور (hover) فقط** — ولا مرورَ في الشاشة
 *      اللمسية. صارت بالنقر، وتُغلق بالنقر خارجها أو بـEsc.
 *
 * وشرطُ الأدمن كان `email === "admin@pcbuilder.com"` مكتوباً بالحرف في
 * موضعٍ و`role === 'ADMIN'` في آخر — فأيّ أدمنٍ غيره لا يرى نصف روابطه.
 * صار الدور وحده هو الحكم.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

/* أيقونات الروابط — مكتوبةً مرّة، فالشريط كان يكرّر مسار كل أيقونة مرّتين
   (سطح المكتب والجوّال) وتعديلُ واحدةٍ يترك الأخرى. */
const ICONS: Record<string, string> = {
  guides: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  news: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15',
  compare: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  deals: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  builds: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
};

const Icon = ({ d, className = 'w-4 h-4' }: { d: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

/* الروابط في مكانٍ واحد — يقرؤها الشريط والقائمة المنسدلة معاً */
const NAV = [
  { href: '/guides', label: 'أدلّة', icon: ICONS.guides, accent: false },
  { href: '/news', label: 'الأخبار', icon: ICONS.news, accent: false },
  { href: '/compare', label: 'قارن القطع', icon: ICONS.compare, accent: false },
  /* الورديّ هنا وحده — ولأن صفحة التخفيضات ورديّة، فهو ربطٌ لا تلوين */
  { href: '/deals', label: 'تخفيضات', icon: ICONS.deals, accent: true },
] as const;

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  /* تحديثات طلبات القطع التي لم يرها — نقطة على "تجميعاتي" */
  const [unseen, setUnseen] = useState(0);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!session) { setUnseen(0); return; }
    fetch('/api/part-requests/unseen')
      .then((r) => r.json())
      .then((d) => setUnseen(Number(d?.unseen) || 0))
      .catch(() => {});
  }, [session]);

  /* الانتقال يُغلق كل ما هو مفتوح — وإلا بقيت القائمة معلّقة فوق الصفحة الجديدة */
  useEffect(() => { setIsMobileMenuOpen(false); setAccountOpen(false); }, [pathname]);

  /* إغلاق قائمة الحساب بالنقر خارجها أو بـEsc — ما كان ممكناً أصلاً حين
     كانت تفتح بالمرور: اللمس لا يمرّ، ولوحة المفاتيح لا تصل. */
  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAccountOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [accountOpen]);

  /* «نشط» يشمل الصفحات الفرعية: /guides/123 تُبقي «أدلّة» مضيئة */
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <nav className="relative w-full bg-white/80 dark:bg-[#0B1120]/60 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
      {/* خط سيان سفلي يربط الشريط بهوية الموقع */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* الشعار */}
          <Link href="/" className="flex items-center gap-2.5 font-black text-2xl text-slate-900 dark:text-white group shrink-0">
            <div className="relative w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform shadow-md shadow-cyan-500/30">
              <div className="absolute inset-0 bg-cyan-400/40 blur-lg rounded-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                <path d="M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z" />
              </svg>
            </div>
            <span className="tracking-tight">تجميعتي</span>
          </Link>

          {/* زر القائمة (الجوّال) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            className="md:hidden p-2 rounded-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Icon className="w-6 h-6" d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </button>

          {/* ===== الشاشة الكبيرة ===== */}
          <div className="hidden md:flex items-center gap-1">

            {NAV.map((item) => {
              const on = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={on ? 'page' : undefined}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-sm font-bold transition-all ${
                    on
                      ? item.accent
                        ? 'text-rose-600 dark:text-rose-400 bg-rose-500/[0.08]'
                        : 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/[0.08]'
                      : item.accent
                        ? 'text-rose-600/90 dark:text-rose-400/90 hover:bg-rose-500/[0.07]'
                        : 'text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/[0.07]'
                  }`}
                >
                  <Icon d={item.icon} />
                  {item.label}
                  {/* خطٌّ سفليّ يقول «أنت هنا» — الأثر الذي كان غائباً */}
                  {on && (
                    <span
                      className={`absolute -bottom-px inset-x-2 h-0.5 rounded-full ${
                        item.accent ? 'bg-rose-500' : 'bg-cyan-500'
                      }`}
                    />
                  )}
                </Link>
              );
            })}

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/70 mx-2" />

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={theme === 'dark' ? 'تفعيل الوضع المضيء' : 'تفعيل الوضع الليلي'}
                aria-label={theme === 'dark' ? 'تفعيل الوضع المضيء' : 'تفعيل الوضع الليلي'}
              >
                <Icon
                  className="w-5 h-5"
                  d={theme === 'dark'
                    ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                    : 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'}
                />
              </button>
            )}

            {session ? (
              <div className="flex items-center gap-1.5 mr-1">

                {isAdmin && (
                  <Link
                    href="/admin"
                    aria-current={isActive('/admin') ? 'page' : undefined}
                    className={`text-sm font-bold px-3 py-2 rounded-sm transition-colors ${
                      isActive('/admin')
                        ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/[0.08]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    الإدارة
                  </Link>
                )}

                <Link
                  href="/my-builds"
                  aria-current={isActive('/my-builds') ? 'page' : undefined}
                  className={`text-sm font-bold px-3.5 py-2 rounded-sm border transition-colors flex items-center gap-1.5 ${
                    isActive('/my-builds')
                      ? 'text-white bg-cyan-600 border-cyan-600 shadow-sm shadow-cyan-500/25'
                      : 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/40 border-cyan-100 dark:border-cyan-800/30'
                  }`}
                >
                  <Icon d={ICONS.builds} />
                  تجميعاتي
                  {unseen > 0 && (
                    <span className="relative flex h-2 w-2" title={`${unseen} تحديث على طلباتك`}>
                      <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-70 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                    </span>
                  )}
                </Link>

                {/* ===== الحساب — بالنقر لا بالمرور ===== */}
                <div className="relative" ref={accountRef}>
                  <button
                    onClick={() => setAccountOpen((v) => !v)}
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                    aria-label="قائمة الحساب"
                    className={`flex items-center justify-center w-9 h-9 rounded-full border text-slate-600 dark:text-slate-300 transition-all ${
                      accountOpen
                        ? 'bg-cyan-50 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700 ring-2 ring-cyan-500/40'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-cyan-500/40'
                    }`}
                  >
                    <span className="text-sm font-black uppercase">{session.user?.email?.[0] || 'U'}</span>
                  </button>

                  {accountOpen && (
                    <div
                      role="menu"
                      className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40">
                        <p className="text-[11px] font-bold text-slate-400 mb-0.5">مسجّل الدخول كـ</p>
                        <p className="text-[13px] font-black text-slate-900 dark:text-white truncate" dir="ltr">
                          {session.user?.email}
                        </p>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          role="menuitem"
                          className="w-full text-right flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-2 rounded-sm transition-colors"
                        >
                          <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <Link
                href="/login"
                className="mr-2 text-sm font-black text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-5 py-2.5 rounded-sm transition-all shadow-md shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>

        {/* ===== قائمة الجوّال ===== */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-1 animate-in slide-in-from-top-4 duration-200">

            {/* ⚠️ تُبنى من نفس `NAV`: كان «قارن القطع» و«تخفيضات» غائبَين
                عن الجوّال لأن القائمتين كانتا مكتوبتين يدوياً ومنفصلتين. */}
            {NAV.map((item) => {
              const on = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={on ? 'page' : undefined}
                  className={`text-sm font-bold flex items-center gap-3 px-4 py-3 rounded-sm transition-colors border-r-2 ${
                    on
                      ? item.accent
                        ? 'text-rose-600 dark:text-rose-400 bg-rose-500/[0.08] border-rose-500'
                        : 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/[0.08] border-cyan-500'
                      : `border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          item.accent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
                        }`
                  }`}
                >
                  <Icon className="w-5 h-5" d={item.icon} />
                  {item.label}
                </Link>
              );
            })}

            <div className="w-full h-px bg-slate-100 dark:bg-slate-800/60 my-2" />

            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">مظهر الموقع</span>
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 px-3 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 text-sm font-bold"
                >
                  {theme === 'dark' ? (
                    <><Icon d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /> مضيء</>
                  ) : (
                    <><Icon d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /> ليلي</>
                  )}
                </button>
              )}
            </div>

            <div className="w-full h-px bg-slate-100 dark:bg-slate-800/60 my-2" />

            {session ? (
              <div className="flex flex-col gap-2">
                <div className="px-4 py-2">
                  <p className="text-[11px] font-bold text-slate-400 mb-0.5">مسجّل الدخول كـ</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate" dir="ltr">{session.user?.email}</p>
                </div>

                <Link
                  href="/my-builds"
                  className="text-sm font-black text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-4 py-3.5 rounded-sm border border-cyan-100 dark:border-cyan-800/30 flex items-center justify-center gap-2"
                >
                  <Icon className="w-5 h-5" d={ICONS.builds} />
                  تجميعاتي المحفوظة
                  {unseen > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center tabular-nums">
                      {unseen}
                    </span>
                  )}
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-4 py-3.5 rounded-sm flex items-center justify-center gap-2"
                  >
                    لوحة الإدارة
                  </Link>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="mt-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-4 py-3.5 rounded-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Icon className="w-5 h-5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="mt-4 text-center text-sm font-black text-white bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3.5 rounded-sm shadow-md shadow-cyan-500/20"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
