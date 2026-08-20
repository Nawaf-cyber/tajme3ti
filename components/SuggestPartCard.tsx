'use client';

/* ============ بطاقة "اقترح قطعة ناقصة" ============
   مكوّن واحد يُدرَج في ٣ صفحات (البناء · التصفّح · المقارنة). مصمّم بنفس
   مفردات الموقع: rounded-sm + حدّ علوي سيان + زاوية هندسية + عنوان متدرّج،
   فيندمج بلا غرابة. متغيّر `source` يميّز من أي صفحة أتى الطلب (للتقارير). */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { goToLogin } from '../lib/login-href';

export default function SuggestPartCard({
  source,
  className = '',
}: {
  source: 'builder' | 'components' | 'compare';
  className?: string;
}) {
  const { status } = useSession();
  const [name, setName] = useState('');
  /* الفئة: "32GB DDR5" وحدها لا تكفي لمعرفة أهي رام أم تخزين، فنسأل عنها
     قبل الاسم — سؤالٌ واحد يوفّر جولة استيضاح كاملة. */
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | { tracked: boolean; already: boolean }>(null);

  /* ============ خطوة التأكيد للزائر ============
   *
   * ⚠️ الترتيب هو الرسالة: صوتُ الزائر يُكتب `PartVote.userId = null` لحظةَ
   * إرساله، ولا يُربط بحسابٍ لاحقاً أبداً — وقائمةُ «تجميعاتي» تقرأ
   * `where: { userId }` وحدها. فمن يُرسل ثم يسجّل لا يجد طلبه، والتسجيل
   * **قبل** الاقتراح هو ما يُتيح المتابعة.
   *
   * ولذلك يُسأل قبل الإرسال لا بعده: بعد الإرسال يكون الأوان قد فات —
   * الصوت كُتب بلا حساب، وأي دعوةٍ للتسجيل حينها تَعِد بما لا يقع.
   *
   * و«لا» تُرسل ولا تُلغي: الاقتراح يُقبل من الزائر على كل حال، والتسجيل
   * مكافأةٌ لا بوّابة. */
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d.categories) ? d.categories : []))
      .catch(() => {});
  }, []);

  /* الضغط على «إرسال»: يتحقّق من المدخلات، ثم يسأل الزائر قبل أن يرسل.
     التحقّق أوّلاً كي لا يُسأل عن اقتراحٍ ناقصٍ لن يُرسل أصلاً. */
  const submit = () => {
    if (!categoryId) {
      toast.error('اختر نوع القطعة أولاً.');
      return;
    }
    if (name.trim().length < 2) {
      toast.error('اكتب اسم القطعة أولاً.');
      return;
    }
    if (status !== 'authenticated') {
      setAsking(true);
      return;
    }
    send();
  };

  const send = async () => {
    const trimmed = name.trim();
    setSending(true);
    try {
      const res = await fetch('/api/part-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, source, categoryId }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone({ tracked: !!data.tracked, already: !!data.alreadyRequested });
        setName('');
        setCategoryId('');
        setAsking(false);
      } else if (res.status === 401) {
        toast.error(data.message || 'سجّل دخولك أولاً.');
      } else {
        toast.error(data.message || 'تعذّر إرسال الاقتراح.');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-b from-white/80 to-white/60 dark:from-[#0F172A]/70 dark:to-[#0B1120]/50 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm shadow-sm ${className}`}
    >
      {/* الزاوية الهندسية — بصمة بطاقات الموقع */}
      <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-cyan-500/60 border-l-[14px] border-l-transparent pointer-events-none z-10"></div>
      {/* توهّج خفيف */}
      <div className="absolute -top-16 -left-16 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <div className="relative p-5 md:p-6">
        {done ? (
          /* ===== بعد الإرسال ===== */
          <div className="flex flex-col items-center text-center py-3 animate-fade-up">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl mb-3">
              ✅
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1.5">
              {done.already ? 'طلبك مسجّل مسبقاً' : done.tracked ? 'تم استلام اقتراحك' : 'الله يجزاك خير 🙏'}
            </h3>
            <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              {done.tracked
                ? 'ستظهر لك الحالة في «تجميعاتي»، ويصلك إشعار عند إضافتها.'
                : 'أخذت من وقتك عشان تفيدنا وأنت ما تعرفنا — وهذا ما يُنسى.'}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setDone(null)}
                className="px-4 py-2 rounded-sm text-[12px] font-black text-cyan-700 dark:text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500 hover:text-white transition-all active:scale-95"
              >
                اقترح قطعة أخرى
              </button>
              {/* ⚠️ كان هنا زرُّ «تابعه بحسابك» — ويَعِد بما لا يقع: الطلب سُجّل
                  بلا حساب ولا يُربط لاحقاً. وقد صار السؤالُ يسبق الإرسال، فمن
                  وصل إلى هنا قد اختار «لا» قبل قليل — وتكرارُ الدعوة عليه بعد
                  اختياره إلحاحٌ لا إفادة. فالردّ هنا شكرٌ خالص. */}
              {done.tracked && (
                <a
                  href="/my-builds#part-requests"
                  className="px-4 py-2 rounded-sm text-[12px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                >
                  تابع طلباتك
                </a>
              )}
            </div>
          </div>
        ) : asking ? (
          /* ===== سؤال الزائر — مربّعٌ داخل البطاقة ===== */
          <div className="animate-fade-up">
            <div className="rounded-sm border border-cyan-500/30 bg-cyan-50/60 dark:bg-cyan-950/20 overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-cyan-500/20 bg-white/60 dark:bg-[#0B1120]/50">
                <span className="w-1.5 h-4 bg-cyan-500 rounded-full shrink-0"></span>
                <h4 className="text-[13px] font-black text-slate-900 dark:text-white">
                  تبي تتابع طلبك؟
                </h4>
              </div>

              <div className="px-4 py-3.5">
                {/* ما سيُرسَل، معروضاً كي لا يُؤكَّد على المجهول */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 shrink-0">
                    اقتراحك
                  </span>
                  <span
                    dir="ltr"
                    className="min-w-0 truncate px-2 py-1 rounded-sm bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 text-[12px] font-bold text-slate-800 dark:text-slate-200"
                  >
                    {name.trim()}
                  </span>
                </div>

                <p className="text-[12px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
                  إذا سجّلت دخولك <b className="text-slate-900 dark:text-white">ثم</b> اقترحت، تتابع
                  حالة طلبك ونردّ عليك إن احتجنا تفصيلاً. والتسجيل بعد الإرسال لا يربط هذا الطلب
                  بحسابك.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <a
                    href="/login"
                    onClick={goToLogin}
                    className="flex-1 text-center px-4 py-2.5 rounded-sm text-[12px] font-black bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 transition-all active:scale-95 shadow-sm shadow-cyan-500/20"
                  >
                    نعم، سجّل دخولي
                  </a>
                  <button
                    onClick={send}
                    disabled={sending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm text-[12px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-60"
                  >
                    {sending && (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    لا، أرسله بدون حساب
                  </button>
                </div>
              </div>
            </div>

            {/* مخرجٌ للتعديل: الاسم معروضٌ أعلاه، فمن يرى فيه غلطةً يحتاج رجوعاً
                لا إرسالاً — و«اقترح قطعة أخرى» تأتي بعد الإرسال لا قبله. */}
            <button
              onClick={() => setAsking(false)}
              className="mt-2.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              ← رجوع للتعديل
            </button>
          </div>
        ) : (
          /* ===== نموذج الإرسال ===== */
          <>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 shrink-0 rounded-sm bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                  ما لقيت قطعتك؟ اقترح إضافتها
                </h3>
                <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  اختر نوعها واكتب اسمها — القطع الأكثر طلباً أولاً.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* نوع القطعة — أوّل ما يُسأل عنه */}
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                aria-label="نوع القطعة"
                className="shrink-0 sm:w-40 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 rounded-sm px-3 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 hover:border-cyan-400 dark:hover:border-cyan-700 transition-all"
              >
                <option value="">النوع…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !sending && submit()}
                maxLength={80}
                placeholder="RTX 5070 Super"
                dir="ltr"
                className="flex-1 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 rounded-sm px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 hover:border-cyan-400 dark:hover:border-cyan-700 transition-all placeholder:text-slate-400 placeholder:font-medium text-left"
              />
              <button
                onClick={submit}
                disabled={sending}
                className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-sm font-black rounded-sm transition-all active:scale-95 disabled:opacity-60 shadow-sm shadow-cyan-500/20"
              >
                {sending ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                إرسال الاقتراح
              </button>
            </div>

            {/* دعوة لا شرط: التسجيل مكافأة (متابعة + محادثة)، لا بوّابة */}
            {status !== 'authenticated' && (
              <p className="mt-2.5 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                💡 <a href="/login" onClick={goToLogin} className="text-cyan-600 dark:text-cyan-400 underline hover:opacity-80">سجّل دخولك</a> <b>قبل</b> الإرسال لتتابع حالة اقتراحك ونردّ عليك إن احتجنا تفصيلاً.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
