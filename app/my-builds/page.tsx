'use client';

import { useSession } from 'next-auth/react';
import { buildEditUrl, analyzeBuild, buildStatus } from '../../lib/build-compare';
import { buildTitle, shortPartName } from '../../lib/build-name';
import { goToLogin } from '../../lib/login-href';
import { shortDateAr } from '../../lib/time-ago';
import GamePerformance from '../../components/GamePerformance';
import { brandColor } from '../../lib/brand';
import { formatPrice, formatTotal } from '../../lib/price';
import StoreBuyChips from '../../components/StoreBuyChips';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { isAvailable, priceAsOf } from '../../lib/stores';
import MyPartRequests from './MyPartRequests';
import PriceDropsForUser from '../../components/PriceDropsForUser';
import CurrentRigCard from '../../components/CurrentRigCard';
import RigIntroModal from '../../components/RigIntroModal';
import { bottleneck as computeBottleneck } from '../../lib/bottleneck';
import { productImage } from '../../lib/image';
import { catMeta, BUILD_ORDER } from '../../lib/category-meta';
import { timeAgoAr, exactAr, isPriceStale } from '../../lib/time-ago';


const RiyalIcon = ({ size = 'h-4 w-4', colorClass = 'bg-emerald-500' }: { size?: string, colorClass?: string }) => (
  <div 
    className={`${size} ${colorClass} inline-block shrink-0 align-middle`} 
    style={{ 
      maskImage: "url('/riyal.svg')", 
      WebkitMaskImage: "url('/riyal.svg')", 
      maskSize: 'contain', 
      WebkitMaskSize: 'contain', 
      maskRepeat: 'no-repeat', 
      WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskPosition: 'center'
    }} 
  />
);

/* لون العلامة صار من lib/brand — كانت أربع نسخ بأربع لوحات */

/* ============ هل يحتاج المستخدم مبرّداً؟ ============
 *
 * سؤالٌ يكلّف مالاً في الاتجاهين: من يشتري مبرّداً ومعالجُه يأتي بواحد يدفع
 * بلا داعٍ، ومن يظنّ أن معالجه يأتي بمبرّد وهو لا يأتي يستلم تجميعةً لا
 * تُقلع. والجواب مخزَّنٌ عندنا في `includedCooler` على ٤٢ معالجاً.
 *
 * ⚠️ ويُعرض هنا لا في الباني وحده: التجميعة تُفتح لحظةَ الشراء، وهي
 * اللحظة التي يُتّخذ فيها القرار.
 */
const CoolerNotice = ({ parts }: { parts: any }) => {
  const cpu = parts?.['CPU'];
  if (!cpu) return null;

  const specs = typeof cpu.specs === 'string' ? (() => { try { return JSON.parse(cpu.specs); } catch { return {}; } })() : cpu.specs || {};
  const included = String(specs.includedCooler ?? '').trim();
  if (!included) return null; // غير معلن — لا نخمّن

  const hasNone = included === 'None' || included === 'لا يوجد';
  const chosen = parts?.['Cooler'];

  /* ثلاث حالاتٍ فقط تستحقّ الكلام. والرابعة — معالجٌ بمبرّد والمستخدم اختار
     مبرّداً أفضل — قرارٌ واعٍ لا يُنبَّه عليه. */
  if (hasNone && !chosen) {
    return (
      <div className="mb-4 rounded-2xl border border-rose-200 dark:border-rose-800/40 bg-rose-50 dark:bg-rose-900/10 p-4">
        <p className="font-black text-rose-700 dark:text-rose-400 text-sm mb-1">❄️ التجميعة بلا مبرّد</p>
        <p className="text-[12.5px] text-rose-700/90 dark:text-rose-300/90 leading-relaxed">
          معالج <b>{cpu.name}</b> لا يأتي بمبرّد، ولم تختر واحداً. الجهاز لن يعمل بدونه — أضف مبرّداً قبل الشراء.
        </p>
      </div>
    );
  }

  if (!hasNone && !chosen) {
    return (
      <div className="mb-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/10 p-4">
        <p className="font-black text-emerald-700 dark:text-emerald-400 text-sm mb-1">❄️ لا تحتاج شراء مبرّد</p>
        <p className="text-[12.5px] text-emerald-700/90 dark:text-emerald-300/90 leading-relaxed">
          معالج <b>{cpu.name}</b> يأتي بمبرّد <b>{included}</b> في العلبة — يكفي للاستعمال العادي.
        </p>
      </div>
    );
  }

  return null;
};

const getBottleneckMessage = (parts: any) => computeBottleneck(parts?.['CPU'], parts?.['GPU']);

/* ============ شكل ت (2026-10-31) — جدولٌ أو بطاقات، والمقارنة من القائمة ============ */
const MAX_PICK = 3;
const VIEW_KEY = 'tajme3ti:my-builds-view';
const TONE = {
  ok: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10',
  warn: 'text-amber-700 dark:text-amber-400 bg-amber-500/10',
  block: 'text-red-700 dark:text-red-400 bg-red-500/10',
} as const;
/* التوازن وسماً قصيراً — نصّه الكامل في نافذة التجميعة */
const BAL = {
  'cpu-weak': { text: '⚠ المعالج أضعف', cls: 'text-amber-700 dark:text-amber-400 bg-amber-500/10' },
  'gpu-weak': { text: '💡 الكرت أضعف', cls: 'text-blue-700 dark:text-blue-400 bg-blue-500/10' },
  balanced: { text: '🚀 متوازنة', cls: 'text-cyan-700 dark:text-cyan-400 bg-cyan-500/10' },
} as const;

/* زرّ أيقونةٍ في صفّ التجميعة — رابطٌ أو زرّ، ويوقف النقرة كي لا تُفتح التجميعة */
const IconBtn = ({ title, onClick, href, danger, active, children }: {
  title: string; onClick?: (e: React.MouseEvent) => void; href?: string; danger?: boolean; active?: boolean; children: React.ReactNode;
}) => {
  const cls = `w-8 h-8 shrink-0 flex items-center justify-center rounded-sm border transition-colors ${
    active
      ? 'text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700/50'
      : danger
      ? 'text-rose-500 hover:text-white hover:bg-rose-500 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60'
      : 'text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 hover:border-cyan-500/60 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60'
  }`;
  return href ? (
    <Link href={href} title={title} aria-label={title} onClick={(e) => e.stopPropagation()} className={cls}>{children}</Link>
  ) : (
    <button type="button" title={title} aria-label={title} onClick={onClick} className={cls}>{children}</button>
  );
};


/* إطارات الكرت المقيسة — components/GamePerformance (كانت FpsEstimator المقدِّرة) */


export default function MyBuildsPage() {
  const { data: session, status } = useSession();
  const [builds, setBuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuild, setSelectedBuild] = useState<any>(null);
  /* الفرز في الحالة لا في الرابط: المكتبة تُتصفَّح ولا تُشارَك برابطها،
     فإقحام الترتيب في العنوان يُعقّد بلا فائدة. */
  const [sort, setSort] = useState<'newest' | 'cheapest' | 'priciest'>('newest');
  /* أيّ تجميعةٍ يحيطها الإطار السماويّ — تُعلَّم قبل أن تُفتح، كي يعرف
     المستخدم أيّها قصد، ويبقى الإطار بعد الإغلاق فيجد نفسه عندها. */
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  /* جدولٌ أو بطاقات — يُحفظ في هذا المتصفّح. ⚠️ يُقرأ بعد التركيب لا في القيمة
     الأولى: التصيير على الخادم لا يعرف localStorage فيختلف عن المتصفّح */
  const [view, setView] = useState<'table' | 'cards'>('table');
  useEffect(() => {
    try {
      const v = localStorage.getItem(VIEW_KEY);
      if (v === 'table' || v === 'cards') setView(v);
    } catch {}
  }, []);
  const chooseView = (v: 'table' | 'cards') => {
    setView(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch {}
  };
  /* المختارة للمقارنة — حتى ثلاث، كما تقبل صفحة المقارنة */
  const [picked, setPicked] = useState<string[]>([]);
  const togglePick = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= MAX_PICK ? p : [...p, id]));
  /* هل في «أسعارٌ تخصّك» شيء؟ يفتح لها عموداً في الجدول */
  const [hasDrops, setHasDrops] = useState(false);
  /* الحالة بفحص المقارنة نفسه (lib/build-compare) — مكتملة / ناقصة / قطعة نافدة */
  const analyses = useMemo(() => new Map(builds.map((b) => [b.id, analyzeBuild(b)])), [builds]);
  const statusOf = (b: any) => buildStatus(analyses.get(b.id) ?? analyzeBuild(b));
  /* النقر على قطعةٍ نزل سعرها: يهبط إلى تجميعتها ثم يفتحها.
   *
   * والهبوط قبل الفتح لا بعده: النافذة تغطّي الشاشة، فلو فُتحت أوّلاً لَما
   * رأى الحركة — ولَعاد بعد إغلاقها إلى موضعه القديم في الأعلى بدل بطاقته.
   *
   * ⚠️ ويُؤجَّل الفتح: «scrollIntoView» بسلوكٍ ناعم يبدأ الحركة ثم يعود
   * فوراً، وتثبيتُ التمرير الذي تفرضه النافذة في اللحظة نفسها يقطعها. */
  const openBuildById = (buildId: string) => {
    const build = builds.find((b) => b.id === buildId);
    if (!build) return;
    const el = document.getElementById("build-" + buildId);
    const inView = () => {
      if (!el) return true;
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= window.innerHeight;
    };
    setHighlightedId(buildId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    /* ⚠️ والصحّة لا تتعلّق بنجاح الحركة: «smooth» قد لا تتقدّم خطوةً واحدة
       (تبويبٌ خفيّ، أو متصفّحٌ لا يركّب إطاراً) فتبقى الصفحة مكانها بلا
       خطأ — قيس ٥٥٣ بكسل فوريّاً مقابل صفرٍ ناعماً. فيُتحقَّق من الوصول
       ويُثبَّت الموضع قسراً قبل أن تغطّي النافذة الشاشة. */
    setTimeout(() => { if (!inView()) el?.scrollIntoView({ block: "center" }); }, 400);
    /* ٩٠٠ لا ٤٥٠: نصفُ ثانيةٍ بعد الوصول يرى فيها الإطار على بطاقته قبل أن
       تغطّي النافذة الشاشة. فتحٌ فوريٌّ يجعل الإبراز عملاً لا يراه أحد. */
    setTimeout(() => {
      setSelectedBuild(build);
    }, 900);
  };

  /* يُرفع الإطار بعد ثانيتين من إغلاق النافذة لا عند فتحها: من أغلقها يبحث
     بعينه عن مكانه، فالإطار حينها هو فائدته الحقيقية. */
  useEffect(() => {
    if (selectedBuild || !highlightedId) return;
    const t = setTimeout(() => setHighlightedId(null), 2000);
    return () => clearTimeout(t);
  }, [selectedBuild, highlightedId]);

  useEffect(() => {
    fetchBuilds();
  }, [status]);

  const fetchBuilds = () => {
    if (status === 'authenticated') {
      fetch('/api/builds')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setBuilds(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  };

  /**
   * تعيين تجميعةٍ جهازاً حاليّاً — أو إلغاؤه.
   *
   * ⚠️ والحالة تُصحَّح محليّاً بلا إعادة جلب: المسار يُنزل العَلَم عن
   * الباقي في معاملةٍ واحدة، فالواجهة تفعل المثل — وإلّا ظهرت بطاقتان
   * تقولان «جهازي الحالي» حتى التحديث التالي.
   */
  const handleSetCurrent = async (id: string, next: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch('/api/rig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildId: next ? id : null }),
      });
      if (!res.ok) throw new Error('فشل');
      setBuilds((prev) => prev.map((b) => ({ ...b, isCurrent: next && b.id === id })));
      toast.success(next ? 'صارت جهازك الحالي' : 'أُلغي التعيين');
    } catch {
      toast.error('تعذّر التعيين');
    }
  };

  /* ⚠️ الفصل مشتقٌّ لا محفوظ: قائمةٌ ثانية تتباعد عن `builds` مع كلّ حذفٍ
     أو تعيين. ومصدرٌ واحد يعني أنّ تعيين جهازٍ جديدٍ يُخرج القديم من
     البطاقة ويُدخله الشبكة في تصييرةٍ واحدة. */
  const currentRig = builds.find((b) => b.isCurrent) ?? null;
  const otherBuilds = currentRig ? builds.filter((b) => b.id !== currentRig.id) : builds;

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذه التجميعة نهائياً؟')) return;

    try {
      const res = await fetch(`/api/builds/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل الحذف');

      toast.success('تم الحذف بنجاح');
      setBuilds(builds.filter(build => build.id !== id));
      setPicked((p) => p.filter((x) => x !== id));
      if (selectedBuild?.id === id) setSelectedBuild(null);
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleShare = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/build/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('تم نسخ رابط التجميعة بنجاح');
  };

  /* الرابط من lib/build-compare — صفحة المقارنة تفتح التجميعة بالرابط نفسه */
  const getEditUrl = (build: any) => (build?.parts ? buildEditUrl(build) : '#');

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">جاري التحميل...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-8">
          <h2 className="text-xl font-black mb-2 text-slate-900 dark:text-white">سجّل دخولك</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm font-semibold">تجميعاتك المحفوظة وجهازك الحالي تحتاج حسابك.</p>
          {/* يعود إلى هنا بعد الدخول (lib/login-href) */}
          <a href="/login" onClick={goToLogin} className="block w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2.5 rounded-sm font-black">تسجيل الدخول</a>
        </div>
      </div>
    );
  }

  /* الترتيب مشتقٌّ عند العرض — ونفسه في الجدول والبطاقات */
  const sorted = [...otherBuilds].sort((a, b) => {
    if (sort === 'cheapest') return (Number(a.totalPrice) || 0) - (Number(b.totalPrice) || 0);
    if (sort === 'priciest') return (Number(b.totalPrice) || 0) - (Number(a.totalPrice) || 0);
    /* الأحدث: المسار يُرجعها مرتّبةً بـcreatedAt تنازلياً أصلاً، لكن الترتيب
       يُثبَّت هنا صراحةً كي لا يعتمد العرضُ على ترتيبٍ قد يتغيّر في المسار. */
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const totals = builds.map((b) => Number(b.totalPrice) || 0).filter((n) => n > 0);
  /* الرابط يحمل الاختيار — صفحة المقارنة تقرأ ?ids= وتبدأ بها */
  const compareHref = picked.length >= 2 ? `/compare/builds?ids=${picked.join(',')}` : '/compare/builds';

  /* مربّع الاختيار — زرٌّ لا input: يقع داخل صفٍّ يُنقر فيفتح التجميعة، فيوقف النقرة */
  const pickBox = (id: string, className = '') => {
    const on = picked.includes(id);
    const full = !on && picked.length >= MAX_PICK;
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={on}
        aria-label={on ? 'أزلها من المقارنة' : 'اخترها للمقارنة'}
        title={full ? `اخترت ${MAX_PICK} — أزل وحدة أوّلاً` : on ? 'أزلها من المقارنة' : 'اخترها للمقارنة'}
        disabled={full}
        onClick={(e) => { e.stopPropagation(); togglePick(id); }}
        className={`shrink-0 w-[22px] h-[22px] rounded-sm border flex items-center justify-center text-[13px] font-black transition-colors ${
          on
            ? 'bg-cyan-500 border-cyan-500 text-white'
            : full
            ? 'border-slate-200 dark:border-slate-800 text-transparent cursor-not-allowed'
            : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-cyan-500'
        } ${className}`}
      >
        ✓
      </button>
    );
  };

  /* العنوان والسطر الذي تحته — «تجميعة ٢٢/٩/٢٠٢٦» تصير «Ryzen 5 7500F + RTX 5070»
     والاسم المحفوظ تحتها، والاسم المكتوب يبقى وتحته المعالج والكرت */
  const titleBlock = (build: any) => {
    const t = buildTitle(build);
    const cpu = build.parts?.CPU?.name;
    const gpu = build.parts?.GPU?.name;
    return (
      <div className="min-w-0 flex flex-col gap-0.5">
        <span
          className="text-[14px] font-black text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors"
          dir={t.auto ? 'ltr' : undefined}
          style={t.auto ? { textAlign: 'right' } : undefined}
        >
          {t.title}
        </span>
        <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 truncate">
          {t.auto ? (
            <>باسم «{build.name}»</>
          ) : (
            <span dir="ltr">{[cpu, gpu && shortPartName(gpu)].filter(Boolean).join(' · ') || '—'}</span>
          )}
          <span className="mx-1.5 opacity-50">·</span>
          <span className="tabular-nums">{shortDateAr(build.createdAt)}</span>
        </span>
      </div>
    );
  };

  /* الحالة (فحص المقارنة نفسه) والتوازن — وسمان قصيران بدل صندوقين */
  const tags = (build: any, className = '') => {
    const st = statusOf(build);
    const bal = getBottleneckMessage(build.parts);
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        <span className={`text-[12px] font-black px-1.5 py-0.5 rounded-sm ${TONE[st.tone]}`}>{st.text}</span>
        {bal && <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded-sm ${BAL[bal.kind].cls}`}>{BAL[bal.kind].text}</span>}
      </div>
    );
  };

  const actions = (build: any, withOpen = false) => (
    <div className="flex items-center gap-1.5 justify-end">
      {/* ⚠️ نقرةٌ واحدة لا نموذجُ إدخال: ٤٣ من ١٢٩ مستخدماً لهم تجميعةٌ محفوظة
          أصلاً، فأسرعُ طريقٍ إلى «جهازي» أن يشير إلى واحدةٍ منها */}
      <IconBtn title={build.isCurrent ? 'ليست جهازي الحالي' : 'هذي تجميعتي الحاليّة'} active={build.isCurrent} onClick={(e) => handleSetCurrent(build.id, !build.isCurrent, e)}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </IconBtn>
      <IconBtn title="انسخ رابط المشاركة" onClick={(e) => handleShare(build.id, e)}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
      </IconBtn>
      {!withOpen && (
        <IconBtn title="افتحها في الباني" href={getEditUrl(build)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </IconBtn>
      )}
      <IconBtn title="احذفها" danger onClick={(e) => handleDelete(build.id, e)}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </IconBtn>
      {withOpen && (
        <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedBuild(build); }}
          className="px-3 h-8 rounded-sm border border-slate-300 dark:border-slate-700 text-[12.5px] font-black text-slate-700 dark:text-slate-200 hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors">
          افتح ←
        </button>
      )}
    </div>
  );

  const price = (build: any, size = 'text-base') => (
    <span className={`inline-flex items-center gap-1 font-mono font-black tabular-nums text-emerald-600 dark:text-emerald-400 ${size}`}>
      {formatTotal(build.totalPrice)} <RiyalIcon size="h-3.5 w-3.5" colorClass="bg-emerald-600 dark:bg-emerald-400" />
    </span>
  );

  /* الإطار السماويّ حول التجميعة التي نزل سعر قطعتها — يبقى بعد إغلاق النافذة
     فيجد نفسه عندها (openBuildById) */
  const hl = (id: string) => (highlightedId === id ? ' ring-2 ring-inset ring-cyan-500' : '');

  const sortChips = () =>
    /* ⚠️ الفرز يظهر من ثلاثٍ فصاعداً: ترتيبُ اثنتين لا يُغني عن النظر إليهما */
    otherBuilds.length >= 3 ? (
      <div className="flex items-center gap-1.5">
        <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 me-0.5">الترتيب</span>
        {([
          ['newest', 'الأحدث'],
          ['cheapest', 'الأرخص'],
          ['priciest', 'الأغلى'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSort(key)}
            aria-pressed={sort === key}
            className={`text-[12px] font-black rounded-sm px-2.5 py-1 border transition-colors ${
              sort === key
                ? 'bg-cyan-500/10 border-cyan-500/70 text-cyan-700 dark:text-cyan-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-cyan-500/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    ) : null;

  /* السويتش — جدولٌ أسرع حين تكثر التجميعات، وبطاقاتٌ لمن يحبّ الصور. والاختيار
     يُحفظ في هذا المتصفّح (localStorage) */
  const viewSwitch = () => (
    <div role="group" aria-label="طريقة العرض" className="inline-flex p-0.5 rounded-sm border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60">
      {([
        ['table', 'جدول', 'M4 6h16M4 12h16M4 18h16'],
        ['cards', 'بطاقات', 'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z'],
      ] as const).map(([key, label, d]) => (
        <button
          key={key}
          type="button"
          onClick={() => chooseView(key)}
          aria-pressed={view === key}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[12.5px] font-black transition-colors ${
            view === key ? 'bg-cyan-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} /></svg>
          {label}
        </button>
      ))}
    </div>
  );

  const pickedNames = picked.map((id) => builds.find((b) => b.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen py-6 md:py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-5">

        {/* ⚠️ تُركَّب دائماً لا داخل شرطٍ: هي تسأل الخادم بنفسها، ولا تُعرض إلّا لمن
            لم يرها ولم يعيّن جهازاً. والدعوة تُنزل نظره إلى المكتبة حيث الأزرار. */}
        <RigIntroModal onPick={() => {
          document.getElementById('builds-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }} />

        {/* ===== الرأس — شكل ت (2026-10-31): العنوان وما تملكه في سطر، بدل أربع
            بلاطات («مجموع قيمتها» رقمٌ لا يفيد قراراً) ولافتة مقارنة منفصلة ===== */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              تجميعا<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400">تي.</span>
            </h1>
            {builds.length > 0 && (
              <p className="mt-2 text-[14px] font-semibold text-slate-600 dark:text-slate-400">
                <span className="font-mono">{builds.length}</span> {builds.length === 1 ? 'تجميعة' : builds.length === 2 ? 'تجميعتان' : builds.length <= 10 ? 'تجميعات' : 'تجميعة'}
                {totals.length > 1 && (
                  <>
                    {' '}· أرخصها <span className="font-mono">{formatTotal(Math.min(...totals))}</span>
                    {' '}· أغلاها <span className="font-mono">{formatTotal(Math.max(...totals))}</span> ريال
                  </>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {builds.length >= 2 && (
              <Link href="/compare/builds" className="px-4 py-2.5 rounded-sm border border-cyan-500/50 dark:border-cyan-400/40 bg-cyan-500/10 dark:bg-cyan-400/10 text-[13px] font-black text-cyan-800 dark:text-cyan-300 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-colors">
                ⚖ قارن تجميعاتك
              </Link>
            )}
            <Link href="/builder" className="px-4 py-2.5 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[13px] font-black shadow-lg shadow-cyan-500/25 transition-colors">
              ＋ تجميعة جديدة
            </Link>
          </div>
        </div>

        {/* ============ جهازي الحالي — قبل المكتبة ============
            ⚠️ هو **مرجعُك**، والمكتبةُ ما تخطّط له. ويُستبعد من المكتبة لا يُكرَّر
            فيها: ظهورُه مرّتين يُربك من يبحث عنه. */}
        {currentRig && (
          <CurrentRigCard
            build={currentRig}
            onOpen={() => setSelectedBuild(currentRig)}
            onUnset={() => handleSetCurrent(currentRig.id, false)}
            onCustomChange={(cp) => setBuilds((prev) => prev.map((b) => (b.id === currentRig.id ? { ...b, customParts: cp } : b)))}
          />
        )}

        {/* تلميح لمن عنده تجميعة واحدة — يشرح الشرط بدل إخفاء المقارنة بصمت */}
        {builds.length === 1 && (
          <div className="flex items-center gap-3 p-4 rounded-sm border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30">
            <span className="text-xl shrink-0 opacity-50">⚖</span>
            <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
              احفظ تجميعة ثانية وتقدر <b className="text-slate-800 dark:text-slate-200">تقارن بينها</b> — السعر والأداء والاستهلاك جنباً إلى جنب.
            </p>
          </div>
        )}

        {/* ===== طلبات القطع (يظهر فقط إن طلب المستخدم شيئاً) ===== */}
        <MyPartRequests />

        {builds.length === 0 ? (
          <div className="text-center py-14 px-4 bg-white/70 dark:bg-[#0F172A]/60 border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm">
            <p className="text-lg font-black text-slate-900 dark:text-white mb-1.5">ما عندك تجميعات محفوظة</p>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-6">ابنِ وحدة في الباني واحفظها — تلقاها هنا بأسعارها الحين.</p>
            <Link href="/builder" className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-2.5 px-6 rounded-sm text-sm">افتح الباني</Link>
          </div>
        ) : view === 'table' ? (
          /* ============ ت١ — المكتبة جدولاً، وتنبيهات الأسعار عمودٌ جانبيّ ============ */
          <div className={`grid gap-5 items-start ${hasDrops ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : ''}`}>
            <section id="builds-grid" className="min-w-0 bg-white/70 dark:bg-[#0F172A]/60 border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm overflow-clip">
              <div className="flex items-center justify-between gap-3 flex-wrap px-3 md:px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {currentRig ? 'المحفوظة' : 'تجميعاتك'}
                  <span className="text-[13px] font-mono font-black text-slate-500 dark:text-slate-400">{otherBuilds.length}</span>
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                  {sortChips()}
                  {viewSwitch()}
                </div>
              </div>

              {otherBuilds.length === 0 ? (
                <p className="px-4 py-8 text-center text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                  ما فيه غير جهازك الحالي — احفظ تجميعة ثانية من الباني وتظهر هنا.
                </p>
              ) : (
                <>
                  {/* رؤوس الأعمدة — في الشاشة العريضة وحدها؛ والجوال صفوفٌ مكدّسة */}
                  <div className="hidden lg:grid grid-cols-[22px_minmax(0,1fr)_160px_112px_auto] gap-x-4 px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-[12px] font-black text-slate-500 dark:text-slate-400">
                    <span></span>
                    <span>التجميعة</span>
                    <span>الحالة</span>
                    <span className="text-left">السعر الحين</span>
                    <span className="w-[146px]"></span>
                  </div>
                  {sorted.map((build) => {
                    const on = picked.includes(build.id);
                    return (
                      <div
                        key={build.id}
                        id={'build-' + build.id}
                        onClick={() => setSelectedBuild(build)}
                        className={`group grid grid-cols-[22px_minmax(0,1fr)_auto] lg:grid-cols-[22px_minmax(0,1fr)_160px_112px_auto] gap-x-3 lg:gap-x-4 gap-y-2 items-center px-3 md:px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 last:border-b-0 cursor-pointer transition-colors ${
                          on ? 'bg-cyan-500/[0.07]' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                        }${hl(build.id)}`}
                      >
                        {pickBox(build.id, 'self-start mt-0.5 lg:self-center lg:mt-0')}
                        {titleBlock(build)}
                        <span className="row-start-1 col-start-3 lg:col-start-4 self-start lg:self-center text-left">
                          {price(build)}
                        </span>
                        {/* في الجوال: الوسوم والأزرار سطرٌ ثانٍ تحت العنوان — لو بقيت الأزرار
                            في عمود السعر لضاق العنوان إلى ١٢٦ بكسل. وفي العريضة يذوب
                            الغلاف (contents) فيقع كلٌّ في عموده */}
                        <div className="col-start-2 col-span-2 flex items-center justify-between gap-2 flex-wrap lg:contents">
                          {tags(build, 'lg:col-start-3')}
                          <div className="lg:col-start-5">{actions(build)}</div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* شريط المقارنة — المقارنة من القائمة نفسها بدل لافتةٍ منفصلة وصفحةٍ تعيد
                  الاختيار. ⚠️ overflow-clip لا hidden على القسم: hidden يكسر sticky */}
              {otherBuilds.length >= 2 && (
                <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 flex-wrap px-3 md:px-4 py-3 bg-cyan-50/95 dark:bg-[#0B2A36]/95 backdrop-blur-sm border-t border-cyan-500/40">
                  <span className="text-[13px] font-black text-slate-800 dark:text-slate-200">
                    {picked.length === 0
                      ? 'علّم تجميعتين أو ثلاث وقارن بينها'
                      : <>اخترت <span className="font-mono">{picked.length}</span> من <span className="font-mono">{MAX_PICK}</span> للمقارنة{picked.length === 1 ? ' — علّم وحدة ثانية' : ''}</>}
                  </span>
                  <div className="flex items-center gap-2">
                    {picked.length > 0 && (
                      <button type="button" onClick={() => setPicked([])} className="text-[12px] font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400">
                        امسح الاختيار
                      </button>
                    )}
                    <Link
                      href={compareHref}
                      aria-disabled={picked.length < 2}
                      onClick={(e) => { if (picked.length < 2) e.preventDefault(); }}
                      className={`px-4 py-2 rounded-sm text-[13px] font-black transition-opacity ${
                        picked.length >= 2 ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      قارنها الحين ←
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* «أسعارٌ تخصّك» — عمودٌ جانبيّ في الشاشة العريضة، وفوق المكتبة في الجوال.
                ⚠️ والعمود لا يُفتح إلّا حين يكون في اللوحة شيء (onHasContent) */}
            <aside className="order-first lg:order-none min-w-0 empty:hidden">
              <PriceDropsForUser onOpenBuild={openBuildById} onHasContent={setHasDrops} className="" />
            </aside>
          </div>
        ) : (
          /* ============ ت٢ — بطاقات، ودرجٌ سفليّ للمقارنة ============ */
          <>
            {/* ===== نزلت أسعارها — خبرٌ يخصّ ما بناه بالفعل ===== */}
            <PriceDropsForUser onOpenBuild={openBuildById} onHasContent={setHasDrops} className="" />

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-[17px] font-black text-slate-900 dark:text-white flex items-baseline gap-2">
                {currentRig ? 'المحفوظة' : 'تجميعاتك'}
                <span className="text-[13px] font-mono font-black text-slate-500 dark:text-slate-400">{otherBuilds.length}</span>
                {otherBuilds.length >= 2 && <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">· علّم اثنتين أو ثلاث للمقارنة</span>}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                {sortChips()}
                {viewSwitch()}
              </div>
            </div>

            {otherBuilds.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] font-semibold text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-sm">
                ما فيه غير جهازك الحالي — احفظ تجميعة ثانية من الباني وتظهر هنا.
              </p>
            ) : (
              <div id="builds-grid" className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {sorted.map((build) => {
                  const on = picked.includes(build.id);
                  const st = statusOf(build);
                  const t = buildTitle(build);
                  const cpu = build.parts?.CPU;
                  const gpu = build.parts?.GPU;
                  /* صورُ القطع — يميّز تجميعاته بشكل الكيس والكرت أسرع ممّا يقرأ أسماءها */
                  const thumbs = BUILD_ORDER.map((c) => build.parts?.[c]).filter((x: any) => x?.imageUrl).slice(0, 8);
                  return (
                    <div
                      key={build.id}
                      id={'build-' + build.id}
                      onClick={() => setSelectedBuild(build)}
                      className={`group relative flex flex-col gap-2.5 p-3.5 rounded-sm border-x border-b border-t-2 cursor-pointer transition-colors bg-white/70 dark:bg-[#0F172A]/70 ${
                        st.tone === 'ok' ? 'border-t-cyan-500/70' : st.tone === 'warn' ? 'border-t-amber-500' : 'border-t-red-500'
                      } ${on ? 'border-x-cyan-500/70 border-b-cyan-500/70 bg-cyan-500/[0.05]' : 'border-x-slate-200 border-b-slate-200 dark:border-x-slate-800 dark:border-b-slate-800 hover:border-x-cyan-500/50 hover:border-b-cyan-500/50'}${hl(build.id)}`}
                    >
                      {pickBox(build.id, 'absolute top-3 left-3')}
                      <div className="pl-8">
                        {titleBlock(build)}
                      </div>
                      {thumbs.length >= 2 && (
                        <div className="flex items-center gap-1.5">
                          {thumbs.map((x: any) => (
                            <span key={x.id} title={x.name} className="w-[30px] h-[30px] shrink-0 rounded-sm bg-white border border-slate-200 dark:border-slate-700/60 p-0.5 flex items-center justify-center">
                              <img src={productImage(x.imageUrl)} alt="" loading="lazy" className="max-w-full max-h-full object-contain" />
                            </span>
                          ))}
                        </div>
                      )}
                      {/* الاسم التلقائيّ صار «المعالج + الكرت» فوق — فلا يُكرَّران هنا */}
                      {!t.auto && (cpu || gpu) && (
                        <div className="flex flex-col gap-0.5 text-[12px] font-bold text-slate-700 dark:text-slate-300" dir="ltr" style={{ textAlign: 'right' }}>
                          {cpu && <span className="truncate">{cpu.name}</span>}
                          {gpu && <span className="truncate text-slate-500 dark:text-slate-400">{gpu.name}</span>}
                        </div>
                      )}
                      {tags(build)}
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80">
                        {price(build, 'text-lg')}
                        {actions(build, true)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* الدرج السفليّ — يظهر حين تعلّم وحدة، ويبقى لاصقاً وأنت تنزل */}
            {picked.length > 0 && (
              <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 flex-wrap px-3 md:px-4 py-3 rounded-sm border border-cyan-500/50 bg-white/95 dark:bg-[#082F3C]/95 backdrop-blur-sm shadow-xl shadow-slate-900/20">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="text-[13px] font-black text-slate-800 dark:text-slate-200">⚖ مختارة للمقارنة:</span>
                  {pickedNames.map((b: any) => {
                    const t = buildTitle(b);
                    return (
                      <button key={b.id} type="button" onClick={() => togglePick(b.id)} title="أزلها"
                        className="max-w-[220px] inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border border-slate-300 dark:border-slate-600 text-[12px] font-bold text-slate-700 dark:text-slate-200 hover:border-rose-400">
                        <span className="truncate" dir={t.auto ? 'ltr' : undefined}>{t.title}</span>
                        <span className="text-slate-400" aria-hidden="true">✕</span>
                      </button>
                    );
                  })}
                  {picked.length < MAX_PICK && (
                    <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                      {picked.length === 1 ? 'علّم وحدة ثانية' : 'وتقدر تضيف وحدة'}
                    </span>
                  )}
                </div>
                <Link
                  href={compareHref}
                  aria-disabled={picked.length < 2}
                  onClick={(e) => { if (picked.length < 2) e.preventDefault(); }}
                  className={`px-4 py-2 rounded-sm text-[13px] font-black transition-opacity ${
                    picked.length >= 2 ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  قارنها الحين ←
                </Link>
              </div>
            )}
          </>
        )}

        {/* نافذة استعراض التجميعة (Modal) */}
        {selectedBuild && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm p-4" onClick={() => setSelectedBuild(null)}>
            <div 
              /* ⚠️ كانت `max-w-2xl` (٦٧٢px) — وهي أضيق ممّا يحمله الصفّ:
                 صورة + اسم + سعر + عمر + أربع شارات متاجر. فكان كرت الشاشة
                 يفيض أفقياً وتُقطع شارة «نون» عند الحافة. و`4xl` (٨٩٦px)
                 تسع الصفّ كاملاً على الشاشات المتوسطة فما فوق، وتبقى
                 `w-full` على الجوّال. */
              className="bg-white dark:bg-[#0F172A] rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0B1120] shrink-0">
                <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
                  <span dir={buildTitle(selectedBuild).auto ? 'ltr' : undefined}>{buildTitle(selectedBuild).title}</span>
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => handleShare(selectedBuild.id)} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="مشاركة">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  </button>
                  <button onClick={() => setSelectedBuild(null)} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 flex items-center justify-center hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                    <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              
              <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                
                {/* شرح التنبيه التفصيلي */}
                {(() => {
                  const modalBottleneck = getBottleneckMessage(selectedBuild.parts);
                  if (modalBottleneck) {
                    return (
                      <div className={`p-4 rounded-2xl border ${modalBottleneck.bg} mb-5 shadow-sm`}>
                        <h4 className={`font-black text-sm mb-1.5 ${modalBottleneck.color}`}>{modalBottleneck.title}</h4>
                        <p className={`text-xs font-medium leading-relaxed opacity-90 ${modalBottleneck.color}`}>{modalBottleneck.desc}</p>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* إطارات الكرت المقيسة */}
                {selectedBuild.parts['GPU'] && (
                  <GamePerformance gpu={selectedBuild.parts['GPU']} cpu={selectedBuild.parts['CPU']} />
                )}

                <CoolerNotice parts={selectedBuild.parts} />

                {/* ⚠️ الرمز الذي لا يُشرح يُخمَّن. النقطة الخضراء تعني «أرخص
                    متجر لهذه القطعة»، وبلا مفتاحٍ يقرؤها الزائر «متوفّر» أو
                    «موصى به» أو لا يراها. والمفتاح في الرأس لا في التذييل
                    لأنه يُقرأ **قبل** الشارات لا بعدها. */}
                <div className="mb-3 mt-2 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-300 text-sm flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_8px] shadow-cyan-500/40" />
                    مكونات التجميعة
                  </h4>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-full px-2.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0F172A]" />
                    النقطة الخضراء = أرخص متجر للقطعة
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {BUILD_ORDER.map((category) => {
                    const comp = selectedBuild.parts[category];
                    /* المبرّد وحده يُخفى حين لا يُختار: تجميعةٌ بلا مبرّد
                       صالحة (قد يأتي مع المعالج)، فعرضُ «لم يتم الاختيار»
                       بالأحمر يجعل الصحيح يبدو ناقصاً. وبقيّة القطع مطلوبة
                       فغيابها نقصٌ يُقال. */
                    if (category === 'Cooler' && !comp) return null;
                    return (
                      <div key={category} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50 gap-3 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors group">
                        {/* ⚠️ `min-w-0` هنا هو ما يمنع الفيض: عنصر flex لا
                            ينكمش دون عرض محتواه ما لم يُسمح له صراحةً. وبدونه
                            يدفع الاسمُ الطويل الصفَّ خارج النافذة، فيظهر شريط
                            تمريرٍ أفقيّ وتُقطع الشارات عند الحافة. */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {comp?.imageUrl ? (
                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 p-1 flex items-center justify-center shrink-0 shadow-sm">
                               <img src={productImage(comp.imageUrl)} alt={comp.name} className="max-w-full max-h-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center shrink-0 shadow-sm">
                              <span className="text-lg opacity-30">⚙️</span>
                            </div>
                          )}
                          <div className="text-sm flex-1 leading-tight">
                            {/* عربيّةٌ بلا tracking: التباعد يكسر الخطّ المتّصل،
                                وuppercase لا معنى له في العربية. */}
                            <span className="font-bold text-slate-400 dark:text-slate-500 text-[11px] block mb-0.5">
                              {catMeta(category).icon} {catMeta(category).label}
                            </span>
                            {comp ? (
                              <>
                                <span className={brandColor(comp.brand, comp.name, category) + " ml-1"}>{comp.brand}</span>
                                <span className="text-slate-900 dark:text-white font-bold break-words">{comp.name}</span>
                                {!isAvailable(comp) && (
                                  <span className="mt-1 text-amber-700 dark:text-amber-400 font-black inline-flex items-center gap-1 text-[11px] bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40 w-fit">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    غير متوفر حالياً
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-rose-500 font-bold text-xs">لم يتم الاختيار</span>
                            )}
                          </div>
                        </div>
                        
                        {/* لا shrink-0 على كتلة السعر: تحوي حتى أربع شارات
                            متاجر، ومنعُها من الانكماش كان نصف سبب الفيض.
                            و flex-wrap يلفّها سطراً ثانياً بدل أن تُقطع. */}
                        {comp && (
                          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0 pl-12 sm:pl-0 sm:border-r border-t sm:border-t-0 border-slate-200 dark:border-slate-700 pt-2 sm:pt-0 sm:pr-3 sm:justify-end">
                            <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-sm bg-emerald-50 dark:bg-emerald-900/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/20 w-full sm:w-auto justify-center mb-1 sm:mb-0">
                              {formatPrice(comp.price)} <RiyalIcon size="h-3 w-3" />
                            </span>

                            {/* عمر السعر: التجميعة تُفتح بعد أسابيع، والرقم
                                بلا تاريخه وعدٌ لا يُوفى عند المتجر. */}
                            {priceAsOf(comp as any) && (
                              <span
                                title={exactAr(priceAsOf(comp as any))}
                                className={`text-[10.5px] font-bold ${
                                  isPriceStale(priceAsOf(comp as any))
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                {timeAgoAr(priceAsOf(comp as any))}
                              </span>
                            )}
                            
                            <StoreBuyChips offers={(comp as any).offers} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0B1120] flex justify-between items-center shrink-0">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">الإجمالي الكلي</span>
                  <span className="font-black text-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    {formatTotal(selectedBuild.totalPrice)} <RiyalIcon size="h-4 w-4" />
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link 
                    href={getEditUrl(selectedBuild)} 
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors text-sm shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    تعديل التجميعة
                  </Link>
                  <button onClick={() => handleDelete(selectedBuild.id)} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-colors text-sm shadow-sm hover:shadow-md">
                    حذف
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}