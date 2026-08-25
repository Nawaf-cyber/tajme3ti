"use client";

/* ============ صفحة الدخول ============
 *
 * كانت أنحف صفحةٍ في الموقع (٥٥ كلمة) وأوّل ما يراه كل مستخدمٍ جديد:
 * بطاقةٌ بيضاء بلا هويّةٍ ولا سببٍ يدعو للتسجيل، ولا شيء يحدث حين تُخطئ
 * كلمة المرور — الخطأ كان يرمي المستخدم إلى صفحة NextAuth الإنجليزية.
 *
 * فصارت تُجيب السؤال الذي يأتي به الزائر — «ولماذا أسجّل؟» — بثلاثة
 * أشياء يقدر عليها بحسابٍ ولا يقدر عليها بدونه، لا بشعاراتٍ عامّة.
 *
 * وبلغة الموقع نفسها: حدٌّ علويّ سيان، واستدارة ٤ بكسل، وزجاجٌ خفيف.
 */

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { safeCallback } from '../../lib/login-href';

/* رسائل NextAuth بالعربية — كانت رموزاً إنجليزية على صفحةٍ أخرى */
const ERRORS: Record<string, string> = {
  CredentialsSignin: 'البريد أو كلمة المرور غير صحيحة.',
  OAuthAccountNotLinked: 'هذا البريد مسجّل بطريقة دخولٍ أخرى. جرّب الطريقة التي سجّلت بها أوّل مرّة.',
  OAuthSignin: 'تعذّر بدء الدخول عبر Google. حاول مرّة أخرى.',
  OAuthCallback: 'تعذّر إكمال الدخول عبر Google. حاول مرّة أخرى.',
  AccessDenied: 'لا صلاحية لهذا الحساب.',
  Verification: 'انتهت صلاحية رابط الدخول. اطلب رابطاً جديداً.',
  Default: 'تعذّر تسجيل الدخول. حاول مرّة أخرى.',
};

const PERKS = [
  {
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    title: 'تجميعاتك تبقى محفوظة',
    body: 'تبني تجميعة وترجع لها بعد أسبوع، تعدّلها وتقارنها بغيرها — وأسعارها تتحدّث وحدها.',
  },
  {
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    title: 'يصلك خبر نزول السعر',
    body: 'القطع التي في تجميعاتك تُرصد، فتعرف حين ينزل سعرها بدل أن تفتح المتاجر كل يوم.',
  },
  {
    icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'تتابع اقتراحك للقطع الناقصة',
    body: 'تقترح قطعة فتعرف أين وصلت، ونردّ عليك إن احتجنا تفصيلاً. والاقتراح بلا حساب يصلنا ولا تتابعه.',
  },
];

const Icon = ({ d, className = 'w-5 h-5' }: { d: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = safeCallback(params.get('callbackUrl'));
  const errorCode = params.get('error');
  const authError = errorCode ? (ERRORS[errorCode] ?? ERRORS.Default) : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<null | 'google' | 'credentials'>(null);
  /* ============ كلمة المرور: بابٌ جانبيّ لا واجهة ============
   *
   * قِيست الحسابات: ١٠٠ مستخدماً، **٩٧ منهم بـGoogle**، وثلاثةٌ لهم كلمة
   * مرور — اثنان منهم أدمن. فنموذجُ كلمة المرور بارزاً يُشوّش ٩٧٪ ممّن
   * يفتح الصفحة، ولا يخدم إلا حساباتٍ ثلاثة.
   *
   * ولا يُحذف: هو مدخلُ الإدارة الوحيد. فيُطوى خلف نقرة.
   *
   * وفائدةٌ عرضية: نموذج كلمة مرورٍ بارزٌ على صفحةٍ عامّة هدفٌ لحشو بيانات
   * الاعتماد. طيُّه لا يمنع الهجوم، لكنه يُخرجه من طريق الآليات الغبيّة.
   *
   * ⚠️ ويُفتح تلقائياً إن جاء خطأُ اعتمادٍ من NextAuth: من أخطأ كلمته
   * يجب أن يجد النموذج مفتوحاً لا مطويّاً يبحث عنه.
   */
  const [showPassword, setShowPassword] = useState(errorCode === 'CredentialsSignin');

  /* ============ ولا يُعرض الزرّ أصلاً إلا لمن يعرفه ============
   *
   * `/login?staff=1` — أو تلقائياً حين يعود خطأُ اعتماد، فمن حاول يجب
   * أن يجد الباب حيث تركه.
   *
   * ⚠️ وهذا **إخفاءٌ لا حماية**: المسار `/api/auth/callback/credentials`
   * يُنادى بأمر `curl` واحد سواء ظهر الزرّ أو لا. الحمايةُ الحقيقية في
   * `authorize` — حدُّ خمس محاولات لكل بريدٍ وIP في ربع ساعة، ورفضُ كل
   * من ليس ADMIN. وهذا السطر يمنع الفضول فقط، ولا يُحتسب أماناً.
   */
  const staffMode = params.get('staff') === '1' || errorCode === 'CredentialsSignin';

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('اكتب البريد وكلمة المرور.'); return; }
    setBusy('credentials');
    await signIn('credentials', { email, password, callbackUrl });
    /* لا `setBusy(null)`: النجاح ينتقل بالصفحة، والفشل يُعيد تحميلها بـ?error */
  };

  const handleGoogleLogin = () => { setBusy('google'); signIn('google', { callbackUrl }); };

  /* ⚠️ حُذف من هنا زرُّ «أرسل لي رابط دخول» — كان يستدعي `signIn('email')`
     و**لا مزوّد بريدٍ في الإعداد إطلاقاً** (Google وCredentials فقط)،
     فكان يفشل دائماً. والدالّة كانت موجودةً قبل إعادة الصياغة، لكن
     تسميتَها الصريحة حوّلت عطباً مخفيّاً إلى وعدٍ ظاهر — وزرٌّ يَعِد بما
     لا يقع أسوأ من زرٍّ غامض. */

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid lg:grid-cols-[1.1fr_1fr] gap-6 items-start">

        {/* ===== النموذج ===== */}
        <div className="relative overflow-hidden bg-white/80 dark:bg-[#0F172A]/70 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm shadow-sm">
          {/* الزاوية الهندسية — بصمة بطاقات الموقع */}
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-cyan-500/60 border-l-[14px] border-l-transparent pointer-events-none" />
          <div className="absolute -top-16 -left-16 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative p-7 md:p-9">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">تسجيل الدخول</h1>
            <p className="mt-1.5 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
              حسابٌ واحد يكفي — ولا نطلب منك أكثر من بريدك.
            </p>

            {/* خطأٌ قادمٌ من NextAuth، بالعربية وفي مكانه */}
            {authError && (
              <div className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-sm bg-rose-500/[0.08] border border-rose-500/30">
                <span className="shrink-0 w-5 h-5 rounded-full bg-rose-600 text-white text-[12px] font-black flex items-center justify-center">!</span>
                <p className="text-[13px] font-bold text-rose-700 dark:text-rose-300 leading-relaxed">{authError}</p>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={!!busy}
              className="mt-6 w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 py-3 px-4 rounded-sm font-black text-sm hover:border-cyan-400 dark:hover:border-cyan-700 transition-colors disabled:opacity-60 active:scale-[0.99]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {busy === 'google' ? 'جارٍ التحويل…' : 'الدخول بواسطة Google'}
            </button>

            {/* ٩٧ من ١٠٠ يدخلون بـGoogle — فهو المدخل، وما تحته بابٌ جانبيّ */}
            <p className="mt-3 text-[12px] font-semibold text-slate-500 dark:text-slate-400 text-center">
              أسرع طريقة، وبلا كلمة مرورٍ تُنسى.
            </p>

            {staffMode && (
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-expanded={showPassword}
                  className="w-full flex items-center justify-center gap-1.5 text-[12px] font-bold text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  دخول الإدارة بكلمة مرور
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${showPassword ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}

            {staffMode && showPassword && (
            <form onSubmit={handleCredentialsLogin} className="space-y-4 mt-5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div>
                <label htmlFor="email" className="block text-[12px] font-black text-slate-600 dark:text-slate-300 mb-1.5">
                  البريد الإلكتروني
                </label>
                <input
                  id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  dir="ltr" autoComplete="email" required
                  className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 rounded-sm px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 hover:border-cyan-400 dark:hover:border-cyan-700 transition-all text-left"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[12px] font-black text-slate-600 dark:text-slate-300 mb-1.5">
                  كلمة المرور
                </label>
                <input
                  id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  dir="ltr" autoComplete="current-password"
                  className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 rounded-sm px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 hover:border-cyan-400 dark:hover:border-cyan-700 transition-all text-left"
                />
              </div>

              <button
                type="submit"
                disabled={!!busy}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-black text-sm py-3 px-4 rounded-sm transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm shadow-cyan-500/20"
              >
                {busy === 'credentials' ? 'جارٍ الدخول…' : 'الدخول بكلمة المرور'}
              </button>
            </form>
            )}
          </div>
        </div>

        {/* ===== ولماذا أسجّل؟ ===== */}
        <aside className="lg:sticky lg:top-24">
          <div className="bg-white/60 dark:bg-[#0F172A]/50 backdrop-blur-sm border-x border-b border-t-2 border-slate-200 border-t-slate-300 dark:border-slate-800 dark:border-t-slate-700 rounded-sm p-6 md:p-7">
            {/* ⚠️ كان `text-slate-500` في الليليّ فأعطى 3.36:1 — دون AA.
                قِيس فرُفع، وليس عنواناً كبيراً يشفع له الحجم (١٣ بكسل). */}
            <h2 className="text-[13px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest font-mono mb-5">
              ماذا يعطيك الحساب
            </h2>

            <ul className="space-y-5">
              {PERKS.map((p) => (
                <li key={p.title} className="flex items-start gap-3.5">
                  <span className="shrink-0 w-9 h-9 rounded-sm bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <Icon d={p.icon} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-black text-slate-900 dark:text-white leading-snug">{p.title}</h3>
                    <p className="mt-1 text-[12.5px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                ولا يلزمك حساب لتتصفّح: الكتالوج والباني والمقارنة مفتوحةٌ للجميع.
              </p>
              <Link
                href="/builder"
                className="mt-3 inline-block text-[12px] font-black text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 px-3 py-1.5 rounded-sm hover:bg-cyan-500 hover:text-white transition-all"
              >
                ابنِ تجميعة بلا تسجيل ←
              </Link>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

/* `useSearchParams` يوجب حدَّ Suspense وإلا سقط البناء الثابت للصفحة. */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
