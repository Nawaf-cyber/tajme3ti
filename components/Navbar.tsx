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
import { switchTheme, originOf } from '../lib/theme-switch';

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
  /* resolvedTheme لا theme: الافتراضيّ «system»، فكان زائرٌ نظامه داكن يرى
     أيقونة القمر ويضغط فيُطلب «dark» وهو داكنٌ أصلاً — الضغطة الأولى بلا
     أثر. المحسوب هو ما على الشاشة فعلاً. */
  const { resolvedTheme: theme, setTheme } = useTheme();
  const toggleTheme = (e: React.MouseEvent<HTMLElement>) =>
    switchTheme(theme === 'dark' ? 'light' : 'dark', setTheme, originOf(e.currentTarget));
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  /* ما لم يره على "تجميعاتي": تحديثات طلبات القطع + انخفاضات أسعار قطعه.
     الوجهة واحدة، فالنقطة واحدة — نقطتان متجاورتان على زرٍّ واحد ضجيج. */
  const [reqUnseen, setReqUnseen] = useState(0);
  const [dropUnseen, setDropUnseen] = useState(0);
  const unseen = reqUnseen + dropUnseen;
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!session) { setReqUnseen(0); setDropUnseen(0); return; }
    fetch('/api/part-requests/unseen')
      .then((r) => r.json())
      .then((d) => setReqUnseen(Number(d?.unseen) || 0))
      .catch(() => {});
    fetch('/api/price-drops')
      .then((r) => r.json())
      .then((d) => setDropUnseen(Number(d?.unseen) || 0))
      .catch(() => {});
  }, [session]);

  /* النافبار في الـlayout فلا يُعاد تركيبه بين الصفحات: لولا هذا لبقيت
     النقطة حمراء بعد أن قرأ الانخفاضات فعلاً، حتى يُحدّث الصفحة. */
  useEffect(() => {
    const clear = () => setDropUnseen(0);
    window.addEventListener('drops-seen', clear);
    return () => window.removeEventListener('drops-seen', clear);
  }, []);

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

  /* الزرّ المربّع — الوضع والحساب بالمقاس نفسه */
  const SQUARE = 'w-9 h-9 shrink-0 flex items-center justify-center rounded-sm border transition-colors';

  return (
    <nav className="w-full bg-white/80 dark:bg-[#0B1120]/70 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
      {/* ===== المسطرة — شكل ن٢ (2026-10-31) =====
          الخطّ السفليّ مسطرةُ ورقة المخطّط: شرطةٌ كلّ ٢٤ وأطول كلّ ١٢٠، مرساها وسط
          الشاشة (x=50%) كشبكة الخلفية في PCBBackground — فتقع كلّ شرطةٍ على خطّ شبكة.
          نهاراً بحبر الورقة، وليلاً بخطّ المخطّط يتلاشى على الطرفين. */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-300 dark:bg-transparent dark:bg-gradient-to-r dark:from-transparent dark:via-cyan-500/35 dark:to-transparent" />
      <svg
        className="absolute bottom-0 left-0 w-full h-[7px] text-[#2F5D8A] dark:text-[#A8CCE4] dark:[mask-image:linear-gradient(90deg,transparent,#000_22%,#000_78%,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern id="navTickMinor" x="50%" width="24" height="7" patternUnits="userSpaceOnUse">
            <path d="M0.5 7V4" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
          </pattern>
          <pattern id="navTickMajor" x="50%" width="120" height="7" patternUnits="userSpaceOnUse">
            <rect width="120" height="7" fill="url(#navTickMinor)" />
            <path d="M0.5 7V0" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="7" fill="url(#navTickMajor)" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* الشعار — بلاطةٌ بزوايا اللوحات (rounded-sm) بلا توهّجٍ ولا دوران */}
          <Link href="/" className="flex items-center gap-2.5 font-black text-xl lg:text-2xl text-slate-900 dark:text-white group shrink-0">
            <span className="w-9 h-9 rounded-sm bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/25 group-hover:shadow-cyan-500/45 transition-shadow">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                <path d="M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z" />
              </svg>
            </span>
            <span className="tracking-tight">تجميعتي</span>
          </Link>

          {/* زر القائمة (الجوّال) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            className={`md:hidden ${SQUARE} ${isMobileMenuOpen ? 'border-cyan-500 text-cyan-700 dark:text-cyan-400 bg-cyan-500/10' : 'border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300'}`}
          >
            <Icon className="w-5 h-5" d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </button>

          {/* ===== الشاشة الكبيرة =====
              ⚠️ بين 768 و1024 لا يتّسع الشريط كاملاً: كان «قارن القطع» ينكسر سطرين
              ومجموعة الحساب تخرج عن حافّة الشاشة ٢٠ بكسل (قِيس بحساب أدمن على 768).
              فهناك تُخفى أيقونات الروابط ويضيق الحشو، ولا ينكسر نصّ (whitespace-nowrap) */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2">

            {/* الروابط في سكّةٍ واحدة كمبدّلات الصفحات الجديدة (جدول/بطاقات، 1080p/1440p):
                الصفحة الحاليّة معبّأة — سماويّ، والتخفيضات ورديّ لأن صفحتها ورديّة */}
            <div className="flex items-center p-0.5 rounded-sm border border-slate-200 dark:border-slate-700/80 bg-white/60 dark:bg-slate-900/50">
              {NAV.map((item) => {
                const on = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={on ? 'page' : undefined}
                    className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-sm text-[13.5px] font-bold whitespace-nowrap transition-colors ${
                      on
                        ? item.accent
                          ? 'bg-rose-600 text-white'
                          : 'bg-cyan-600 text-white'
                        : item.accent
                          ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/[0.08]'
                          : 'text-slate-600 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-cyan-500/[0.08]'
                    }`}
                  >
                    <Icon d={item.icon} className="w-4 h-4 hidden lg:block" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {mounted && (
              <button
                onClick={toggleTheme}
                className={`${SQUARE} border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 hover:border-cyan-500/60`}
                title={theme === 'dark' ? 'تفعيل الوضع المضيء' : 'تفعيل الوضع الليلي'}
                aria-label={theme === 'dark' ? 'تفعيل الوضع المضيء' : 'تفعيل الوضع الليلي'}
              >
                <Icon
                  className="w-[18px] h-[18px]"
                  d={theme === 'dark'
                    ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                    : 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'}
                />
              </button>
            )}

            {session ? (
              <div className="flex items-center gap-1.5">

                {isAdmin && (
                  <Link
                    href="/admin"
                    aria-current={isActive('/admin') ? 'page' : undefined}
                    className={`text-[13.5px] font-bold px-2.5 py-2 rounded-sm whitespace-nowrap transition-colors ${
                      isActive('/admin')
                        ? 'text-cyan-700 dark:text-cyan-400 bg-cyan-500/[0.08]'
                        : 'text-slate-600 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-400'
                    }`}
                  >
                    الإدارة
                  </Link>
                )}

                {/* زرّ الإطار السماويّ — نفس «⚖ قارن تجميعاتك» في رؤوس الصفحات الجديدة */}
                <Link
                  href="/my-builds"
                  aria-current={isActive('/my-builds') ? 'page' : undefined}
                  className={`text-[13.5px] font-black px-3 lg:px-3.5 h-9 rounded-sm border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive('/my-builds')
                      ? 'text-white bg-cyan-600 border-cyan-600'
                      : 'text-cyan-800 dark:text-cyan-300 bg-cyan-500/10 dark:bg-cyan-400/10 border-cyan-500/50 dark:border-cyan-400/40 hover:bg-cyan-500 hover:text-white hover:border-cyan-500'
                  }`}
                >
                  <Icon d={ICONS.builds} />
                  تجميعاتي
                  {unseen > 0 && (
                    <span className="relative flex h-2 w-2" title={dropUnseen > 0 && reqUnseen === 0 ? `${dropUnseen} قطعة نزل سعرها` : `${unseen} تحديث في تجميعاتي`}>
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
                    className={`${SQUARE} ${
                      accountOpen
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-700/80 bg-slate-100/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:border-cyan-500/60'
                    }`}
                  >
                    <span className="text-sm font-black font-mono uppercase">{session.user?.email?.[0] || 'U'}</span>
                  </button>

                  {accountOpen && (
                    /* لوحةٌ بحدٍّ علويّ سماويّ وزاوية — مفردة اللوحات في الصفحات */
                    <div
                      role="menu"
                      className="absolute top-full left-0 mt-2 w-60 bg-white dark:bg-[#0F172A] border-x border-b border-t-2 border-slate-200 dark:border-slate-700/80 border-t-cyan-500 dark:border-t-cyan-500 rounded-sm shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <span className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-cyan-500/60 border-l-[12px] border-l-transparent pointer-events-none" />
                      <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">مسجّل الدخول كـ</p>
                        <p className="text-[13px] font-black text-slate-900 dark:text-white truncate" dir="ltr">
                          {session.user?.email}
                        </p>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          role="menuitem"
                          className="w-full text-right flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/[0.08] px-3 py-2 rounded-sm transition-colors"
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
                className="text-[13.5px] font-black whitespace-nowrap text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-4 h-9 flex items-center rounded-sm transition-colors shadow-md shadow-cyan-500/20"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>

        {/* ===== قائمة الجوّال ===== */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-3 pb-5 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-1 animate-in slide-in-from-top-4 duration-200">

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
                        : 'text-cyan-700 dark:text-cyan-400 bg-cyan-500/[0.08] border-cyan-500'
                      : `border-transparent hover:bg-slate-500/[0.06] ${
                          item.accent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
                        }`
                  }`}
                >
                  <Icon className="w-5 h-5" d={item.icon} />
                  {item.label}
                </Link>
              );
            })}

            <div className="w-full h-px bg-slate-200/70 dark:bg-slate-800/70 my-2" />

            <div className="flex items-center justify-between px-4 py-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">مظهر الموقع</span>
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="h-9 px-3 rounded-sm border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 flex items-center gap-2 text-sm font-bold"
                >
                  {theme === 'dark' ? (
                    <><Icon d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /> مضيء</>
                  ) : (
                    <><Icon d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /> ليلي</>
                  )}
                </button>
              )}
            </div>

            <div className="w-full h-px bg-slate-200/70 dark:bg-slate-800/70 my-2" />

            {session ? (
              <div className="flex flex-col gap-2">
                <div className="px-4 py-1">
                  <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">مسجّل الدخول كـ</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate" dir="ltr">{session.user?.email}</p>
                </div>

                <Link
                  href="/my-builds"
                  className="text-sm font-black text-cyan-800 dark:text-cyan-300 bg-cyan-500/10 dark:bg-cyan-400/10 px-4 py-3.5 rounded-sm border border-cyan-500/50 dark:border-cyan-400/40 flex items-center justify-center gap-2"
                >
                  <Icon className="w-5 h-5" d={ICONS.builds} />
                  تجميعاتي المحفوظة
                  {unseen > 0 && (
                    <span className="min-w-[20px] h-[20px] px-1 rounded-sm bg-rose-500 text-white text-[12px] font-black flex items-center justify-center tabular-nums">
                      {unseen}
                    </span>
                  )}
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 px-4 py-3.5 rounded-sm flex items-center justify-center gap-2"
                  >
                    لوحة الإدارة
                  </Link>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="mt-1 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/[0.08] px-4 py-3.5 rounded-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Icon className="w-5 h-5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="mt-2 text-center text-sm font-black text-white bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3.5 rounded-sm shadow-md shadow-cyan-500/20"
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
