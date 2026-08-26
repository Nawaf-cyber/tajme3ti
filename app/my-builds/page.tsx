'use client';

import { useSession } from 'next-auth/react';
import { shortDateAr } from '../../lib/time-ago';
import FpsEstimator from '../../components/FpsEstimator';
import { brandColor } from '../../lib/brand';
import { formatPrice } from '../../lib/price';
import StoreBuyChips from '../../components/StoreBuyChips';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { isAvailable } from '../../lib/stores';
import MyPartRequests from './MyPartRequests';
import PriceDropsForUser from '../../components/PriceDropsForUser';
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

const getBottleneckMessage = (parts: any) => {
  const cpu = parts['CPU'];
  const gpu = parts['GPU'];
  if (cpu?.performanceTier && gpu?.performanceTier) {
    const diff = cpu.performanceTier - gpu.performanceTier;
    if (diff < -1) {
      return {
        title: "⚠️ تنبيه: المعالج أضعف من الكرت",
        desc: "سيشكل المعالج 'عنق زجاجة' ولن يتمكن من مجاراة الكرت، خاصة على دقة 1080p. يُنصح بترقية المعالج أو اللعب على دقة 4K لتقليل الضغط عليه.",
        color: "text-amber-700 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/40"
      };
    } else if (diff > 1) {
      return {
        title: "💡 تنبيه: الكرت أضعف من المعالج",
        desc: "أداء ممتاز في ألعاب (Esports) لاعتمادها على المعالج، لكن الكرت سيحد من قوة الجهاز في ألعاب القصة (AAA) والدقات العالية.",
        color: "text-blue-700 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/40"
      };
    } else {
      return {
        title: "🚀 توازن أداء مثالي",
        desc: "المعالج والكرت من نفس الفئة تقريباً. ستحصل على أداء مستقر وتستغل كامل قوة الجهاز بدون عنق زجاجة ملحوظ.",
        color: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40"
      };
    }
  }
  return null;
};

/* FpsEstimator صار مكوّناً مشتركاً — components/FpsEstimator */


export default function MyBuildsPage() {
  const { data: session, status } = useSession();
  const [builds, setBuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuild, setSelectedBuild] = useState<any>(null);
  /* الفرز في الحالة لا في الرابط: المكتبة تُتصفَّح ولا تُشارَك برابطها،
     فإقحام الترتيب في العنوان يُعقّد بلا فائدة. */
  const [sort, setSort] = useState<'newest' | 'cheapest' | 'priciest'>('newest');

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

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذه التجميعة نهائياً؟')) return;

    try {
      const res = await fetch(`/api/builds/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل الحذف');

      toast.success('تم الحذف بنجاح');
      setBuilds(builds.filter(build => build.id !== id));
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

  const getEditUrl = (build: any) => {
    if (!build || !build.parts) return '#';

    const params = new URLSearchParams();
    params.set('editId', build.id);
    if (build.name) params.set('editName', build.name);
    
    Object.entries(build.parts).forEach(([cat, comp]: [string, any]) => {
      if (comp && comp.id) params.set(cat.toLowerCase(), comp.id);
    });
    return `/builder?${params.toString()}`;
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] font-bold text-slate-500">جاري التحميل...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1120] px-4">
        <div className="bg-white dark:bg-[#111827] p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 max-w-sm w-full text-center">
          <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">حسابك غير متصل</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">سجل دخولك للوصول لتجميعاتك المحفوظة.</p>
          <Link href="/api/auth/signin" className="block w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          {/* ============ من مفردات الصفحة الرئيسية ============
              الشريط المتدرّج المتوهّج قبل العنوان هو توقيع الرئيسية —
              `from-cyan-400 to-blue-500` مع هالة. كان هنا مستطيلاً أزرق
              مصمتاً بلا صلةٍ ببقيّة النظام.
              ⚠️ ولمسةُ هذه الصفحة أنها تعدّ ما تملك: عدد التجميعات بجانب
              العنوان. الرئيسية تُعرّف بالمنتج، وهذه تُدير مقتنياتٍ — فرقٌ
              يستحقّ أن يظهر بدل نسخ الرأس حرفياً. */}
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40" />
            مكتبة التجميعات
            {builds.length > 0 && (
              <span className="text-[11px] font-black text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 rounded-full px-2.5 py-1 tabular-nums">
                {builds.length}
              </span>
            )}
          </h1>
          <Link
            href="/builder"
            className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black py-2.5 px-6 rounded-xl text-sm shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all"
          >
            + بناء جديد
          </Link>
        </div>

        {/* ============ شريط الحصيلة ============
            ⚠️ المكتبة كانت شبكةً تُعرض بلا خلاصة: يفتحها صاحب ٢٢ تجميعة
            فلا يعرف كم أنفق ولا أين يقف. وثلاثة أرقامٍ تجيب ما يسأله فعلاً
            — كم عندي، وكم مجموعها، وما مداها.
            والأرقام مشتقّة من `builds` لا محفوظة: قيمةٌ ثانية تتباعد. */}
        {builds.length > 0 && (
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {(() => {
              const totals = builds.map((b) => Number(b.totalPrice) || 0).filter((n) => n > 0);
              const sum = totals.reduce((a, c) => a + c, 0);
              const stats = [
                { label: 'تجميعاتك', value: String(builds.length), unit: '', accent: 'cyan' },
                { label: 'مجموع قيمتها', value: formatPrice(sum), unit: 'riyal', accent: 'emerald' },
                { label: 'أقلّها', value: totals.length ? formatPrice(Math.min(...totals)) : '—', unit: 'riyal', accent: 'slate' },
                { label: 'أعلاها', value: totals.length ? formatPrice(Math.max(...totals)) : '—', unit: 'riyal', accent: 'slate' },
              ];
              return stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-800/60 rounded-2xl px-4 py-3"
                >
                  <span className="block text-[10.5px] font-bold text-slate-500 dark:text-slate-400 mb-1">{s.label}</span>
                  <span
                    className={`flex items-center gap-1 font-black text-lg tabular-nums ${
                      s.accent === 'cyan'
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : s.accent === 'emerald'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {s.value}
                    {s.unit === 'riyal' && s.value !== '—' && (
                      <RiyalIcon
                        size="h-3.5 w-3.5"
                        colorClass={s.accent === 'emerald' ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-slate-500 dark:bg-slate-300'}
                      />
                    )}
                  </span>
                </div>
              ));
            })()}
          </div>
        )}

        {/* ===== دعوة صريحة لمقارنة التجميعات =====
            كانت زراً صغيراً في الرأس يضيع بين العناصر. الآن بطاقة كاملة
            العرض تشرح الفائدة وتعرض عدد التجميعات الجاهزة — فالمستخدم
            يفهم "ليش أقارن؟" لا "وش هذا الزر؟". */}
        {builds.length >= 2 && (
          <Link
            href="/compare/builds"
            className="group relative block overflow-hidden mb-8 bg-gradient-to-l from-cyan-50 via-white to-white dark:from-cyan-950/30 dark:via-[#0F172A] dark:to-[#0F172A] border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-5 md:p-6 shadow-sm hover:shadow-lg hover:shadow-cyan-500/10 transition-all"
          >
            {/* الزاوية الهندسية — بصمة بطاقات الموقع */}
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-cyan-500/60 border-l-[16px] border-l-transparent pointer-events-none"></div>
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 shrink-0 rounded-sm bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
                ⚖️
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-1 leading-snug">
                  تبي تقارن تجميعاتك؟
                </h2>
                <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
                  السعر الكلي، الأداء، الاستهلاك، وقطعة بقطعة — ونقول لك أيّها أنصح ولماذا.
                </p>
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className="font-mono text-[10px] font-black text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30 border border-cyan-300 dark:border-cyan-800/50 px-2 py-0.5 rounded-sm">
                    {builds.length} تجميعة جاهزة
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    اختر حتى ٣ للمقارنة
                  </span>
                </div>
              </div>

              <span className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-black shadow-sm shadow-cyan-500/20 group-hover:opacity-90 transition-opacity w-full sm:w-auto justify-center">
                قارن الآن
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </span>
            </div>
          </Link>
        )}

        {/* تلميح لمن عنده تجميعة واحدة — يشرح الشرط بدل إخفاء الميزة بصمت */}
        {builds.length === 1 && (
          <div className="mb-8 flex items-center gap-3 p-4 rounded-sm border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30">
            <span className="text-xl shrink-0 opacity-50">⚖️</span>
            <p className="text-[12.5px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
              احفظ تجميعة ثانية لتفتح <b className="text-slate-700 dark:text-slate-300">مقارنة التجميعات</b> —
              تعرض السعر والأداء والاستهلاك جنباً إلى جنب.
            </p>
          </div>
        )}

        /* ===== نزلت أسعارها — قبل طلبات القطع: خبرٌ يخصّ ما بناه
           بالفعل، وأقربُ إلى سبب زيارته من طلبٍ ينتظر ردّاً ===== */
        <PriceDropsForUser />

        {/* ===== طلبات القطع (يظهر فقط إن طلب المستخدم شيئاً) ===== */}
        <MyPartRequests />

        {builds.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 mb-4 font-bold">لا توجد تجميعات محفوظة.</p>
          </div>
        ) : (
          <>
            {/* ⚠️ الفرز يظهر من ثلاثٍ فصاعداً: ترتيبُ اثنتين لا يُغني عن
                النظر إليهما، وزرٌّ بلا فائدة يشغل حيّزاً ويطلب قراراً. */}
            {builds.length >= 3 && (
              <div className="mb-4 flex items-center justify-end gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 me-1">الترتيب</span>
                {([
                  ['newest', 'الأحدث'],
                  ['cheapest', 'الأقلّ سعراً'],
                  ['priciest', 'الأعلى سعراً'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSort(key)}
                    className={`text-[11.5px] font-black rounded-full px-3 py-1.5 border transition-all ${
                      sort === key
                        ? 'bg-cyan-500/10 border-cyan-400/70 text-cyan-700 dark:text-cyan-300 shadow-[0_0_10px] shadow-cyan-500/20'
                        : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 hover:border-cyan-400/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...builds]
              .sort((a, b) => {
                if (sort === 'cheapest') return (Number(a.totalPrice) || 0) - (Number(b.totalPrice) || 0);
                if (sort === 'priciest') return (Number(b.totalPrice) || 0) - (Number(a.totalPrice) || 0);
                /* الأحدث: المسار يُرجعها مرتّبةً بـcreatedAt تنازلياً أصلاً،
                   لكن الترتيب يُثبَّت هنا صراحةً كي لا يعتمد العرضُ على
                   ترتيبٍ قد يتغيّر في المسار بلا أن ينتبه أحد. */
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .map((build) => {
              const bottleneck = getBottleneckMessage(build.parts);
              const cpu = build.parts['CPU'];
              const gpu = build.parts['GPU'];
              const unavailableCount = Object.values(build.parts).filter(
                (c: any) => c && !isAvailable(c)
              ).length;
              
              return (
                <div 
                  key={build.id} 
                  /* السطح الزجاجيّ من الرئيسية: `bg-white/60 dark:bg-slate-900/40`
                     مع `backdrop-blur-sm` و`rounded-2xl`.
                     ⚠️ ولمسةُ هذه الصفحة: خطٌّ سماويّ يزحف من الأعلى عند
                     التحويم (`before:` بارتفاع صفر يكبر). الرئيسية بطاقاتُها
                     ساكنة تُعرض، وهذه بطاقاتٌ تُنقر — فالاستجابة للمس جزءٌ
                     من معناها لا زخرفة. */
                  className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm cursor-pointer flex flex-col transition-all hover:border-cyan-400/60 dark:hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5 before:absolute before:inset-x-0 before:top-0 before:h-0 before:bg-gradient-to-r before:from-cyan-400 before:to-blue-500 before:transition-all hover:before:h-0.5"
                  onClick={() => setSelectedBuild(build)}
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">{build.name}</h3>
                      {/* ⚠️ كان `ar-SA` مجرّداً، وهو يترك التقويم ونظام الأرقام
                          لتقدير المتصفّح: فيخرج التاريخ بأرقامٍ هندية (٢٠٢٦/٧/١٨)
                          بينما السعر تحته بأرقامٍ لاتينية (9602.00) — نظامان في
                          بطاقةٍ واحدة. وقد يخرج هجرياً على متصفّحٍ آخر فيتغيّر
                          التاريخ نفسه. فالتقويم والأرقام يُثبتان صراحةً. */}
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded tabular-nums">
                        {shortDateAr(build.createdAt)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {cpu && (
                        <div className="text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-2 rounded-lg truncate">
                          <span className="font-bold text-slate-400 me-1">المعالج:</span>
                          <span className={`${brandColor(cpu.brand, cpu.name, 'CPU')} font-bold me-1`}>{cpu.brand}</span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">{cpu.name}</span>
                        </div>
                      )}
                      {gpu && (
                        <div className="text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-2 rounded-lg truncate">
                          <span className="font-bold text-slate-400 me-1">الكرت:</span>
                          <span className={`${brandColor(gpu.brand, gpu.name, 'GPU')} font-bold me-1`}>{gpu.brand}</span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">{gpu.name}</span>
                        </div>
                      )}
                    </div>

                    {bottleneck && (
                      <div className={`p-2 border rounded-lg ${bottleneck.bg} mb-4`}>
                        <span className={`font-bold text-xs ${bottleneck.color}`}>{bottleneck.title}</span>
                      </div>
                    )}


                    {/* ============ شريط صور القطع ============
                        ⚠️ البطاقة كانت نصّاً خالصاً: اسمان وتنبيه. والصور
                        موجودةٌ عندنا لكلّ قطعة ولا تُستعمل هنا — والزائر
                        يميّز تجميعاته بشكل الكيس والكرت أسرع ممّا يقرأ
                        أسماءها. فصفٌّ من مصغّراتٍ يعطي البطاقة وجهاً.
                        وتُعرض المتاحة فقط بلا مربّعاتٍ فارغة تعدّ النقص. */}
                    {(() => {
                      const thumbs = BUILD_ORDER
                        .map((c) => build.parts[c])
                        .filter((x: any) => x?.imageUrl)
                        .slice(0, 6);
                      if (thumbs.length < 2) return null;
                      return (
                        <div className="flex items-center gap-1.5 mb-4">
                          {thumbs.map((x: any) => (
                            <div
                              key={x.id}
                              title={x.name}
                              className="h-8 w-8 shrink-0 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 p-0.5 flex items-center justify-center"
                            >
                              <img src={productImage(x.imageUrl)} alt="" className="max-w-full max-h-full object-contain" />
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    {unavailableCount > 0 && (
                      <div className="p-2 border rounded-lg bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/40 mb-4">
                        <span className="font-bold text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          {unavailableCount} من القطع غير متوفرة حالياً
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* rounded-b-2xl لا b-xl: البطاقة صارت 2xl، وزاويةٌ لا تطابق حاويتها
                      تترك شقّاً رفيعاً من لون الخلفية عند الحافّة. */}
                  <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center rounded-b-2xl">
                    <span className="font-black text-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      {Number(build.totalPrice).toFixed(2)} <RiyalIcon size="h-4 w-4" />
                    </span>
                    <div className="flex gap-2">
                      <button onClick={(e) => handleShare(build.id, e)} className="p-2 text-slate-400 hover:text-blue-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors" title="مشاركة">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      </button>
                      <button onClick={(e) => handleDelete(build.id, e)} className="p-2 text-rose-500 hover:text-rose-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors" title="حذف">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
                  {selectedBuild.name}
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

                {/* حاسبة الإطارات المتقدمة التفاعلية */}
                {selectedBuild.parts['CPU']?.performanceTier && selectedBuild.parts['GPU']?.performanceTier && (
                  <FpsEstimator 
                    cpuTier={selectedBuild.parts['CPU'].performanceTier} 
                    gpuTier={selectedBuild.parts['GPU'].performanceTier} 
                  />
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
                              {comp.price} <RiyalIcon size="h-3 w-3" />
                            </span>

                            {/* عمر السعر: التجميعة تُفتح بعد أسابيع، والرقم
                                بلا تاريخه وعدٌ لا يُوفى عند المتجر. */}
                            {(comp as any).lastScrapedAt && (
                              <span
                                title={exactAr((comp as any).lastScrapedAt)}
                                className={`text-[10.5px] font-bold ${
                                  isPriceStale((comp as any).lastScrapedAt)
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                {timeAgoAr((comp as any).lastScrapedAt)}
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
                    {Number(selectedBuild.totalPrice).toFixed(2)} <RiyalIcon size="h-4 w-4" />
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