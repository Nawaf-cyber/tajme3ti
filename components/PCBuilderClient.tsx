'use client';
export const dynamic = 'force-dynamic';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { brandColor } from '../lib/brand';
import { catMeta } from '../lib/category-meta';
import WorkInProgress from './WorkInProgress';
import IntentPicker from './IntentPicker';
import BuildTuner from './BuildTuner';
import { Sk, SkSelectCard } from './loading-ui';
import SuggestPartCard from './SuggestPartCard';

/* IntentPicker («ما تدري وش تبي؟») مُفعّل، ومنطقه في lib/intent-plans.ts.
   BuildTuner (خصّص تجميعتك) مُفعّل. */
import { toPng } from 'html-to-image';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { isAvailable, liveOffers, cheapestOffer, cheapestStoreNames, type Offer } from '../lib/stores';
import { formatPrice, formatTotal } from '../lib/price';
import { goToLogin } from '../lib/login-href';
import { partRatings, type Rating } from '../lib/perf-rating';
import RatingMeter from './RatingMeter';
import GamePerformance from './GamePerformance';
import { buildStoreUrl, storeLinkProps } from '../lib/affiliate';
import { track, trackOnce } from '../lib/track';
import { productImage } from '../lib/image';
import RichDescription from './RichDescription';
import SpecSheet from './SpecSheet';
import { SeriesLine, SeriesPanel } from './SeriesInfo';
import StoreOfferList from './StoreOfferList';
import {
  boardFitsCase, fitReason, psuFitsCase, psuFitReason,
  coolerFitsCase, coolerFitReason, coolerFitsCpu, coolerCpuReason,
  socketMatch, ramTypeMatch, gpuFitsCase, caseGpuMaxMm, cpuPowerFitsBoard,
  gpuFitVerdict, shortestGpuMm, shownGpuLengthMm,
} from '../lib/fit';
import { checkBuild } from '../lib/build-check';
import { buildIntentPlans, type TierPlan, type Intent } from '../lib/intent-plans';
import { GPU_PERF_SOURCE } from '../lib/gpu-perf';

type Component = {
  id: string;
  name: string;
  brand: string;
  price: number;
  tdpWattage: number;
  specs: any;
  imageUrl?: string | null;
  offers?: Offer[] | null;
  description?: string | null;
  performanceTier?: number | null;
};

type Category = {
  id: string;
  name: string;
  components: Component[];
};

/**
 * رقم الطاقة في نافذة التفاصيل — حيث يعني شيئاً فقط.
 *
 * ⚠️ كان يُعرض tdpWattage لكلّ قطعة: «0W» للمزوّد والرام والقرص والكيس (يوحي
 * أنّها لا تستهلك شيئاً)، وللمعالج رقمٌ يخلط القدرة الرسميّة بالقصوى (i5-14500
 * = 65 الأساسيّة، وi5-14600K = 181 القصوى، و9800X3D = 162 ورسميّته 120).
 * فالمعالج بقدرته الرسميّة specs.tdpW وحدها (لمعالجات AM5)، والكرت باستهلاكه.
 */
function detailsPower(comp: Component, category: string): { label: string; watts: number } | null {
  const specs = typeof comp.specs === 'string' ? (() => { try { return JSON.parse(comp.specs); } catch { return {}; } })() : comp.specs ?? {};
  if (category === 'CPU') {
    const w = Number(specs.tdpW);
    return w > 0 ? { label: 'القدرة الرسميّة (TDP)', watts: w } : null;
  }
  if (category === 'GPU') return comp.tdpWattage > 0 ? { label: 'استهلاك الكرت', watts: comp.tdpWattage } : null;
  return null;
}

type ComponentWithCompatibility = Component & {
  isCompatible: boolean;
  reason?: string;
};

/* ============ روابط العمولة ============
   ⚠️ كانت هنا نسخة مكرّرة من منطق بناء الروابط بمعرّفات ممرّرة من الصفحة.
   الآن معرّف كل متجر يأتي مع عرضه من جدول Store، فيبنى الرابط من مصدر
   واحد (buildStoreUrl) بلا تمرير معرّفات عبر الخصائص. */

/* ---- عروض المتاجر لقطعة: المتوفّر فقط، الأرخص أولاً ----
   كانت ثلاث كتل بأسماء متاجر مكتوبة يدوياً؛ الآن من عروض القطعة مباشرة
   فأي متجر يضيفه الأدمن يظهر هنا بلونه واسمه بلا تعديل. */
const getStoreOffers = (comp: Component) => liveOffers(comp.offers);

/* صفوف بطاقة خطّة المساعد — بترتيب التركيب */
const PLAN_ROWS: [string, string][] = [
  ['CPU', 'المعالج'], ['GPU', 'الكرت'], ['Motherboard', 'اللوحة'], ['RAM', 'الرام'],
  ['Storage', 'التخزين'], ['PSU', 'المزوّد'], ['Case', 'الكيس'], ['Cooler', 'المبرّد'],
];

const RiyalIcon = ({ size = 'h-4 w-4', colorClass = 'bg-emerald-700 dark:bg-emerald-400' }: { size?: string, colorClass?: string }) => (
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


/* لون العلامة صار من lib/brand. وكان توقيعه (comp, cat) فيُمرَّر مفكوكاً. */
const getBrandColor = (comp: Component, categoryName: string) =>
  brandColor(comp.brand, comp.name, categoryName);

// مكون شريط الطاقة
const PowerMeter = ({ totalTdp, psuWattage }: { totalTdp: number, psuWattage: number }) => {
  const percentage = psuWattage > 0 ? Math.min((totalTdp / psuWattage) * 100, 100) : 0;
  const headroom = psuWattage > 0 ? psuWattage - totalTdp : 0;
  const headroomPct = psuWattage > 0 ? Math.round((headroom / psuWattage) * 100) : 0;
  // هامش ضيّق: المقياس يمرّ لكن أقل من 20% احتياطاً — تحذير لا خطأ
  const tightMargin = psuWattage > 0 && percentage > 80 && percentage <= 100;

  return (
    <div className="w-full mt-4 bg-slate-50 dark:bg-[#0B1120] p-5 rounded-sm border border-slate-200 dark:border-slate-800">
      {/* mb-8 لا mb-4: علامة الحدّ فوق الشريط بارتفاع سطر، فكانت تلامس العنوان وتُقرأ نسبةً له
          (تجربة المستخدمين 2026-10-17) */}
      <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-1.5">
        ⚡ كم تسحب القطع من المزوّد؟
      </h4>

      {/* المسار: مناطق أمان خافتة + تعبئة فعلية + علامة 80% */}
      <div className="relative h-4 rounded-sm bg-slate-200 dark:bg-slate-800" dir="ltr">
        {/* مناطق الأمان (خلفية خافتة): أخضر ← أصفر ← أحمر */}
        <div
          className="absolute inset-0 rounded-sm opacity-25"
          style={{ background: 'linear-gradient(90deg,#10b981 0%,#10b981 62%,#f59e0b 80%,#ef4444 100%)' }}
        ></div>
        {/* التعبئة الفعلية */}
        <div
          className="absolute top-0 left-0 h-full rounded-sm transition-all duration-700"
          style={{
            width: `${percentage}%`,
            background: percentage > 85
              ? 'linear-gradient(90deg,#10b981 0%,#f59e0b 60%,#ef4444 100%)'
              : percentage > 70
              ? 'linear-gradient(90deg,#10b981 0%,#10b981 55%,#f59e0b 100%)'
              : 'linear-gradient(90deg,#10b981,#34d399)',
          }}
        ></div>
        {/* علامة حدّ الأمان 80% */}
        {psuWattage > 0 && (
          <div className="absolute -top-1.5 -bottom-1.5 w-0.5 bg-amber-500" style={{ left: '80%' }}>
            {/* dir=rtl: الشريط ltr، فكانت «حدّ الأمان 80%» تُعرض «%حدّ الأمان 80» */}
            <span dir="rtl" className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11.5px] font-black text-amber-600 dark:text-amber-500 whitespace-nowrap">
              حدّ الأمان 80%
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4 text-[12px] font-bold text-slate-500 dark:text-slate-400">
        <span>{totalTdp}W مستهلكة</span>
        <span>{psuWattage ? `سعة المزوّد ${psuWattage}W` : 'ما اخترت مزوّد'}</span>
      </div>
      {/* النسبة في سطرها: داخل سطر الواطات كانت تلتفّ وتنقلب أقواسها على الجوال */}
      {psuWattage > 0 && (
        <p className="mt-1.5 text-[12px] font-bold text-slate-600 dark:text-slate-300">
          القطع تسحب تقريباً <span dir="ltr" className="font-mono">{Math.round((totalTdp / psuWattage) * 100)}%</span> من قدرة المزوّد
        </p>
      )}

      {/* تحذير الهامش الضيّق — التجميعة تمرّ لكن بلا احتياط كافٍ */}
      {tightMargin && (
        <div className="mt-4 flex items-start gap-3 p-3.5 rounded-sm bg-amber-500/[0.07] border border-amber-500/40">
          <span className="w-7 h-7 shrink-0 rounded-sm bg-amber-900/60 text-amber-400 flex items-center justify-center text-sm font-black">!</span>
          <div className="min-w-0">
            <p className="text-[13px] font-black text-amber-600 dark:text-amber-400">
              هامش الطاقة ضيّق: باقي {headroom}W بس ({headroomPct}%).
            </p>
            <p className="text-[11.5px] text-amber-700/80 dark:text-amber-500/70 font-semibold mt-1 leading-relaxed">
              التجميعة بتشتغل، بس مزوّد أعلى يعطيك أمان أكثر وعمر أطول ومجال للترقية. ما ننصح بهامش أقل من 20%.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/* أيقونة ورمز كل فئة — كانت خريطةً ثالثة، صارت من lib/category-meta */
const getCatMeta = catMeta;

/* ---- شارة ثانوية: TDP أو المقبس أو السعة — معلومة مفيدة كانت مخفية ---- */
const getQuickSpec = (comp: Component, categoryName: string): string | null => {
  const sp: any = (typeof comp.specs === 'string' ? (() => { try { return JSON.parse(comp.specs); } catch { return {}; } })() : comp.specs) || {};
  if (categoryName === 'Motherboard') return sp.socket || null;
  if (categoryName === 'RAM') return sp.type || null;
  if (categoryName === 'PSU') return sp.wattage ? `${sp.wattage}W` : null;
  if (comp.tdpWattage) return `${comp.tdpWattage}W`;
  if (categoryName === 'CPU') return sp.socket || null;
  return null;
};

const SearchableSelect = ({ 
  categoryName, 
  components, 
  selectedComponent, 
  onSelect, 
  onRemove,
  onShowDetails,
  showIncompatible
}: { 
  categoryName: string, 
  components: ComponentWithCompatibility[], 
  selectedComponent: Component | null, 
  onSelect: (id: string) => void,
  onRemove: () => void,
  onShowDetails: (comp: Component) => void,
  showIncompatible: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'power'>('default');
  /* تقييم الألعاب لكلّ قطعة — للمعالج والكرت وحدهما (lib/perf-rating). يُحسب مرّةً للقائمة */
  const rated = categoryName === 'CPU' || categoryName === 'GPU';
  const ratingOf = (c: Component): Rating | null => {
    if (!rated) return null;
    const sp = typeof c.specs === 'string' ? (() => { try { return JSON.parse(c.specs as any); } catch { return {}; } })() : c.specs || {};
    return partRatings(categoryName, c.name, sp)[0] ?? null;
  };
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let processed = components.filter(c => 
    `${c.brand} ${c.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortBy === 'price-asc') {
    processed.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    processed.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'power') {
    /* «الأقوى أولاً»: المستوى ثمّ الرقم المقيس داخله، وغير المقيس آخراً بترتيبه */
    const key = (c: Component) => { const r = ratingOf(c); return r?.level != null ? r.level * 1000 + (r.value ?? 0) : -1; };
    processed.sort((a, b) => key(b) - key(a));
  }
  /* المتوفّر أولاً في كلّ ترتيب (والفرز ثابت فيبقى ترتيبه داخل المجموعتين):
     كان أوّل صندوقٍ في القائمة HYTE Y70 النافد، فاختاره المجرّب ودخل سعرُه القديم
     في المجموع (تجربة المستخدمين 2026-10-17) */
  processed.sort((a, b) => Number(isAvailable(b)) - Number(isAvailable(a)));

  const displayedComponents = showIncompatible 
    ? [...processed].sort((a, b) => Number(b.isCompatible) - Number(a.isCompatible))
    : processed.filter(c => c.isCompatible);

  return (
    <div className={`relative w-full min-w-0 transition-all ${isOpen ? 'z-50' : 'z-10'}`} ref={wrapperRef}>
      {(() => {
        const meta = getCatMeta(categoryName);
        const avail = selectedComponent ? isAvailable(selectedComponent) : true;
        const quickSpec = selectedComponent ? getQuickSpec(selectedComponent, categoryName) : null;
        const compatCount = components.filter(c => c.isCompatible).length;

        return (
          <div
            className={`relative overflow-hidden rounded-sm border p-3.5 transition-all ${
              isOpen
                ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-white dark:bg-[#0F172A]'
                : selectedComponent
                ? (avail
                    ? 'border-emerald-500/40 bg-white dark:bg-[#0F172A] hover:border-cyan-500/50 hover:-translate-y-0.5'
                    : 'border-amber-500/50 bg-white dark:bg-[#0F172A] hover:border-cyan-500/50 hover:-translate-y-0.5')
                : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0F172A] hover:border-cyan-500/50'
            }`}
          >
            {/* الشريط الجانبي الملوّن: أخضر=سليمة، أصفر=تحذير */}
            {selectedComponent && (
              <div className={`absolute top-0 right-0 bottom-0 w-[3px] ${avail ? 'bg-gradient-to-b from-emerald-500 to-emerald-400' : 'bg-amber-500'}`}></div>
            )}

            {/* الرأس: الفئة + شارة الحالة */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[13px]">{meta.icon}</span>
                {/* الاسم العربيّ — كان `CPU` و`PSU` بتباعد حروف، والمبتدئ لا يعرف أنّ PSU مزوّد الطاقة
                    (تجربة المستخدمين 2026-10-17). والتباعد يقطّع الحروف العربية فأُزيل */}
                <span className="text-[12.5px] font-black text-slate-600 dark:text-slate-300">{meta.label}</span>
              </div>
              {selectedComponent ? (
                avail ? (
                  <span className="text-[12px] font-black px-2.5 py-1 rounded-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700">✓ متوفر</span>
                ) : (
                  <span className="text-[12px] font-black px-2.5 py-1 rounded-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700">⚠ غير متوفر</span>
                )
              ) : (
                <span className="text-[12px] font-black px-2.5 py-1 rounded-sm text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700">لم تُختر</span>
              )}
            </div>

            {/* الجسم — زرٌّ فعليّ للوحة المفاتيح وقارئ الشاشة: كانت خانةً تُنقر بالفأرة وحدها */}
            <div
              className="flex items-center gap-3 cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              onClick={() => setIsOpen(!isOpen)}
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              aria-label={selectedComponent ? `غيّر ${meta.label}: ${selectedComponent.brand} ${selectedComponent.name}` : `اختر ${meta.label}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
            >
              {/* الصورة داخل البطاقة */}
              {selectedComponent?.imageUrl ? (
                <div className="w-14 h-14 rounded-sm bg-white border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center shrink-0">
                  <img src={productImage(selectedComponent.imageUrl)} alt={selectedComponent.name} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-sm bg-slate-50 dark:bg-[#0B1120] border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-600 text-xl font-light">
                  ＋
                </div>
              )}

              <div className="flex-1 min-w-0">
                {selectedComponent ? (
                  <>
                    <div className={`text-[12px] font-black tracking-[1.5px] mb-0.5 ${getBrandColor(selectedComponent, categoryName)}`}>
                      {selectedComponent.brand}
                    </div>
                    {/* سطران لا سطرٌ مقطوع: «GeForce RTX 5060 Ti 16GB» كان يُقصّ على الجوال */}
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2 break-words">
                      {selectedComponent.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {/* سعرٌ صفر = لا سعر مسجّل — لا «0 ريال» (كصفحة القطعة) */}
                      {selectedComponent.price > 0 ? (
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          {formatPrice(selectedComponent.price)} <RiyalIcon size="h-3 w-3" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                        </span>
                      ) : (
                        <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400">لا سعر مسجّل</span>
                      )}
                      {quickSpec && (
                        <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {quickSpec}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[13px] font-bold text-slate-500 dark:text-slate-400">اختر {meta.label}</div>
                    {compatCount > 0 && (
                      <div className="mt-1.5">
                        <span className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded">
                          {compatCount} خيار متوافق
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* الإجراءات — على الجوال تنتقل أزرار القطعة المختارة إلى صفٍّ بنصوصٍ تحت البطاقة
                  (أدناه): أربعة أزرارٍ في صفٍّ كانت تترك للاسم ٣٧ بكسلاً على عرض ٣٧٥، وشبكةُ ٢×٢
                  بعدها أيقوناتٌ بلا كلمات لم يعرف المجرّب ما تفعله، ولا تلميح للّمس
                  (تجربة المستخدمين 2026-10-17). فيبقى هنا سهم الفتح وحده */}
              <div className="flex gap-1.5 shrink-0">
                {selectedComponent && (
                  <div className="hidden sm:flex gap-1.5">
                    {/* التفاصيل ثابتةٌ هنا: «المزيد» في سطر السلسلة يغيب مع غيابه
                        (كرت شاشةٍ عامّ بلا ملاحظات) — فتغيب التفاصيل معه */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onShowDetails(selectedComponent); }}
                      title="تفاصيل القطعة"
                      aria-label="تفاصيل القطعة"
                      className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                    <a
                      href={`/compare?ids=${selectedComponent.id}`}
                      onClick={(e) => e.stopPropagation()}
                      title="قارن هالقطعة"
                      aria-label="قارن هالقطعة"
                      className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    </a>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(); }}
                      title="إزالة القطعة"
                      aria-label="إزالة القطعة"
                      className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                  title={selectedComponent ? `غيّر ${meta.label}` : `اختر ${meta.label}`}
                  aria-label={selectedComponent ? `غيّر ${meta.label}` : `اختر ${meta.label}`}
                  aria-expanded={isOpen}
                  className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            </div>

            {/* أزرار القطعة على الجوال: بكلماتها لا أيقونات وحدها */}
            {selectedComponent && (
              <div className="sm:hidden mt-3 grid grid-cols-4 gap-1.5">
                {[
                  { label: 'التفاصيل', onClick: () => onShowDetails(selectedComponent), danger: false },
                  { label: 'قارنها', href: `/compare?ids=${selectedComponent.id}`, danger: false },
                  { label: 'غيّرها', onClick: () => setIsOpen(!isOpen), danger: false },
                  { label: 'إزالة', onClick: onRemove, danger: true },
                ].map((a) => {
                  const cls = `h-9 rounded-sm border text-[12px] font-black flex items-center justify-center transition-colors ${
                    a.danger
                      ? 'border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60'
                  }`;
                  return a.href ? (
                    <a key={a.label} href={a.href} className={cls}>{a.label}</a>
                  ) : (
                    <button key={a.label} type="button" onClick={(e) => { e.stopPropagation(); a.onClick!(); }} className={cls}>{a.label}</button>
                  );
                })}
              </div>
            )}

            {/* السلسلة وضمان الشركة — بعرض البطاقة كلّه، لا في العمود الأوسط الضيّق على الجوال */}
            {selectedComponent && (
              <SeriesLine part={selectedComponent} category={categoryName} offers={(selectedComponent.offers ?? []) as any} onMore={() => onShowDetails(selectedComponent)} />
            )}

            {/* تنبيه عدم التوفّر */}
            {selectedComponent && !avail && (
              <div className="mt-3 px-3 py-2 rounded-sm bg-amber-500/[0.08] border border-amber-500/40 text-[10.5px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                خلصت من كل المتاجر — السعر يمكن قديم
              </div>
            )}
          </div>
        );
      })()}

      {isOpen && (
        <div className="absolute w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm shadow-2xl max-h-[350px] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="relative mb-2">
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                className="w-full pl-3 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400"
                placeholder={`ابحث في ${getCatMeta(categoryName).label}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
            
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setSortBy('default'); }}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-sm whitespace-nowrap transition-colors ${sortBy === 'default' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                الافتراضي
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setSortBy('price-asc'); }}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-sm whitespace-nowrap transition-colors flex items-center gap-1 ${sortBy === 'price-asc' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                الأرخص
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setSortBy('price-desc'); }}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-sm whitespace-nowrap transition-colors flex items-center gap-1 ${sortBy === 'price-desc' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" /></svg>
                الأغلى
              </button>
              {rated && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSortBy('power'); }}
                  className={`px-3 py-1.5 text-[12px] font-bold rounded-sm whitespace-nowrap transition-colors ${sortBy === 'power' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                >
                  الأقوى أولاً
                </button>
              )}
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {displayedComponents.length > 0 ? (
              displayedComponents.map((comp) => (
                <li 
                  key={comp.id} 
                  className={`p-3 mb-1 rounded-sm transition-all border cursor-pointer ${
                    comp.isCompatible 
                      ? 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50' 
                      : 'border-rose-200 bg-rose-50 hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-900/10 dark:hover:bg-rose-900/30 opacity-95'
                  }`}
                  onClick={() => {
                    onSelect(comp.id);
                    setIsOpen(false);
                    setSearchTerm('');
                    setSortBy('default');
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start w-full gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        {comp.imageUrl && (
                          <div className="w-8 h-8 rounded bg-white dark:bg-slate-900 p-0.5 shrink-0 border border-slate-200 dark:border-slate-700/50">
                            <img src={productImage(comp.imageUrl)} alt="" className="w-full h-full object-contain" />
                          </div>
                        )}
                        <span className="flex flex-col gap-1 min-w-0">
                          <span className={`text-sm font-bold leading-tight ${comp.isCompatible ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                            <span className={`${getBrandColor(comp, categoryName)} mr-1`}>{comp.brand}</span>
                            {comp.name}
                          </span>
                          {/* «أداء الألعاب: قوي» بشريط — لا «٤/٥» الذي يُقرأ عدد ألعاب */}
                          {(() => { const r = ratingOf(comp); return r ? <RatingMeter r={r} /> : null; })()}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-sm font-black flex items-center gap-1 ${comp.isCompatible ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                          {formatPrice(comp.price)} <RiyalIcon size="h-3 w-3" colorClass={comp.isCompatible ? 'bg-emerald-700 dark:bg-emerald-400' : 'bg-slate-500'} />
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onShowDetails(comp); }}
                          className="px-2.5 py-1 text-[12px] font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded transition-colors"
                        >
                          التفاصيل
                        </button>
                      </div>
                    </div>
                    {!comp.isCompatible && (
                      <span className="text-[12px] mt-1 text-rose-700 dark:text-rose-400 font-extrabold bg-rose-100 dark:bg-rose-900/40 px-2.5 py-1 rounded-sm w-fit inline-flex items-center gap-1 border border-rose-200 dark:border-rose-800/50">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {comp.reason} (ونشيل القطعة اللي تتعارض معها)
                      </span>
                    )}
                    {!isAvailable(comp) && (
                      <span className="text-[12px] mt-1 text-amber-700 dark:text-amber-400 font-extrabold bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 rounded-sm w-fit inline-flex items-center gap-1 border border-amber-200 dark:border-amber-800/50">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        غير متوفر حالياً
                      </span>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="p-6 text-slate-500 text-center text-sm font-bold">ما لقينا قطع تطابق بحثك</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function PCBuilderClient({ categories, importedSelections = {} }: { categories: Category[], importedSelections?: Record<string, string> }) {
  // نطبّق معرّفات لوحة الإدارة قبل أي رسم — الروابط تُبنى أثناء الرسم
  const { data: session } = useSession();
  const router = useRouter(); 
  const [editModeId, setEditModeId] = useState<string | null>(null); 
  const [buildName, setBuildName] = useState(""); 
  const [selectedComponents, setSelectedComponents] = useState<Record<string, Component | null>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initializeBuilder = () => {
      const hasImported = Object.keys(importedSelections || {}).length > 0;
      const params = new URLSearchParams(window.location.search);
      
      const editId = params.get('editId');
      if (editId) setEditModeId(editId);
      
      const editName = params.get('editName');
      if (editName) setBuildName(editName);
      
      const hasUrlParams = categories.some(cat => params.has(cat.name.toLowerCase()));

      let freshSelections: Record<string, Component | null> = {};

      if (hasUrlParams) {
        categories.forEach(cat => {
          const compId = params.get(cat.name.toLowerCase());
          freshSelections[cat.name] = compId ? (cat.components.find(c => c.id === compId) || null) : null;
        });
      } else if (hasImported) {
        categories.forEach(cat => {
          const id = importedSelections[cat.id];
          freshSelections[cat.name] = id ? (cat.components.find(c => c.id === id) || null) : null;
        });
      } else {
        const savedBuild = localStorage.getItem('draft_pc_build');
        if (savedBuild) {
          try {
            const parsed = JSON.parse(savedBuild);
            categories.forEach(cat => {
              const savedComp = parsed[cat.name];
              freshSelections[cat.name] = (savedComp?.id) 
                ? (cat.components.find(c => c.id === savedComp.id) || null) 
                : null;
            });
          } catch (e) {
            categories.forEach(cat => freshSelections[cat.name] = null);
          }
        } else {
          categories.forEach(cat => freshSelections[cat.name] = null);
        }
      }

      /* «أضفها لتجميعتي» من صفحة القطعة (?add=<id>): تُدمج في المسودّة ولا تمحوها —
         معاملات الفئات تستبدل التجميعة كلّها، وهذا زائرٌ في منتصف تجميعته غالباً.
         وتحلّ محلّ قطعة فئتها إن وُجدت، ويُقال له ذلك صراحةً. وفحص التوافق يجري كعادته. */
      const addId = params.get('add');
      if (addId && !hasUrlParams && !hasImported) {
        const cat = categories.find(c => c.components.some(x => x.id === addId));
        const part = cat?.components.find(x => x.id === addId);
        if (cat && part) {
          const prev = freshSelections[cat.name];
          freshSelections[cat.name] = part;
          const label = catMeta(cat.name).label;
          setTimeout(() => {
            toast.success(
              prev && prev.id !== part.id
                ? `وضعنا ${part.name} مكان ${prev.name} في خانة ${label}`
                : `أضفنا ${part.name} إلى تجميعتك (${label})`,
              { duration: 5000 },
            );
          }, 300);
        }
      }

      setSelectedComponents(freshSelections);
      setIsLoaded(true);
    };

    initializeBuilder();
  }, [categories, importedSelections]);

  useEffect(() => {
    if (!isLoaded) return;
    
    localStorage.setItem('draft_pc_build', JSON.stringify(selectedComponents));
    
    const params = new URLSearchParams();
    
    if (editModeId) params.set('editId', editModeId);
    if (buildName && editModeId) params.set('editName', buildName);

    Object.entries(selectedComponents).forEach(([cat, comp]) => {
      if (comp) params.set(cat.toLowerCase(), comp.id);
    });

    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [selectedComponents, isLoaded, editModeId, buildName]);

  const [result, setResult] = useState<{ 
    status: 'success' | 'error' | 'idle' | 'incomplete', 
    message: string, 
    missingCategories?: string[],
    /** ملاحظاتٌ لا تمنع التركيب — تُعرض مع النجاح لا تُبتلع */
    warnings?: string[],
    bottleneck?: { title: string, desc: string, color: string, bg: string, suggestions?: { category: string, item: Component }[] } | null, 
    totalTdp: number, 
    totalPrice: number 
  }>({ status: 'idle', message: '', totalTdp: 0, totalPrice: 0 });
  
  const [detailsModal, setDetailsModal] = useState<{ comp: Component, categoryName: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [showIncompatible, setShowIncompatible] = useState(false);
  const [aiPlans, setAiPlans] = useState<TierPlan[] | null>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);

  /* ⚠️ الخطط تُرسم تحت المساعد، وبعد اختيار الدقّة كانت تبدأ تحت حدّ الشاشة
     (١٢٩٥ بكسل والشاشة تنتهي عند ١٠٦٢ على الجوال، و٩٥١ مقابل ٧٦٨ على المكتب)،
     والظاهر سؤال الشركة الاختياريّ — فظنّ المجرّب أنّ شيئاً لم يحدث (تجربة
     المستخدمين 2026-10-17). فننزل إليها — إلّا إن كان أعلاها ظاهراً أصلاً، كي لا
     تقفز الصفحة مع كلّ تغيير شركةٍ والخطط أمام العين. */
  const showPlans = (plans: TierPlan[]) => {
    setAiPlans(plans);
    setTimeout(() => {
      const el = plansRef.current;
      if (!el) return;
      if (el.getBoundingClientRect().top > window.innerHeight - 140) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  useEffect(() => {
    if (isLoaded) checkCompatibility();
  }, [selectedComponents, isLoaded]);

  const parseSpecs = (specsStr: any) => {
    if (!specsStr) return {};
    return typeof specsStr === 'string' ? JSON.parse(specsStr) : specsStr;
  };

  const handleSelect = (categoryName: string, componentId: string) => {
    const category = categories.find(c => c.name === categoryName);
    const component = category?.components.find(c => c.id === componentId) || null;
    if (!component) return;

    /* ⚠️ «بدأ بناءً» مرّةً واحدةً في الجلسة: بلا الحارس يُطلق مع كلّ قطعة،
       فيظهر زائرٌ اختار سبع قطعٍ سبعةَ زوّار — ونسبةُ الوصول تصير سُبع
       الحقيقة، وهي أهمّ رقمٍ في التقرير. */
    trackOnce('build_start', 'build_start', { label: categoryName });

    const specs = parseSpecs(component.specs);
    
    let newSelections = { ...selectedComponents, [categoryName]: component };
    let toastMessage = "";

    if (categoryName === 'CPU' && selectedComponents['Motherboard']) {
      const moboSpecs = parseSpecs(selectedComponents['Motherboard']!.specs);
      if (specs.socket && moboSpecs.socket && String(specs.socket) !== String(moboSpecs.socket)) {
        newSelections['Motherboard'] = null;
        toastMessage = 'شلنا اللوحة الأم السابقة لأن مقبس المعالج تغيّر';
      }
    }
    else if (categoryName === 'Motherboard') {
      if (selectedComponents['CPU']) {
        const cpuSpecs = parseSpecs(selectedComponents['CPU']!.specs);
        if (specs.socket && cpuSpecs.socket && String(specs.socket) !== String(cpuSpecs.socket)) {
          newSelections['CPU'] = null;
          toastMessage = 'شلنا المعالج السابق لأنه ما يتوافق مع اللوحة الجديدة';
        }
      }
      if (selectedComponents['RAM']) {
        const ramSpecs = parseSpecs(selectedComponents['RAM']!.specs);
        if (specs.ramType && ramSpecs.type && String(specs.ramType) !== String(ramSpecs.type)) {
          newSelections['RAM'] = null;
          toastMessage = toastMessage 
            ? toastMessage + ' والرام بعد' 
            : 'شلنا الرام السابق لأنه ما يتوافق مع اللوحة الجديدة';
        }
      }
    }
    else if (categoryName === 'RAM' && selectedComponents['Motherboard']) {
      const moboSpecs = parseSpecs(selectedComponents['Motherboard']!.specs);
      if (specs.type && moboSpecs.ramType && String(specs.type) !== String(moboSpecs.ramType)) {
        newSelections['Motherboard'] = null;
        toastMessage = 'شلنا اللوحة الأم لأن نوع الرام تغيّر';
      }
    }
    else if (categoryName === 'GPU' && selectedComponents['Case']) {
      const caseSpecs = parseSpecs(selectedComponents['Case']!.specs);
      if (gpuFitVerdict(component, caseSpecs) === false) {
        newSelections['Case'] = null;
        toastMessage = 'شلنا الكيس لأن الكرت الجديد أطول من مساحته';
      }
    }
    else if (categoryName === 'Case' && selectedComponents['GPU']) {
      const gpuSpecs = parseSpecs(selectedComponents['GPU']!.specs);
      if (gpuFitVerdict(selectedComponents['GPU']!, specs) === false) {
        newSelections['GPU'] = null;
        toastMessage = 'شلنا الكرت لأن الكيس الجديد مساحته أصغر';
      }
    }

    /* مقاس اللوحة: تغيير أحدهما قد يُبطل الآخر — فيُزال المُبطَل بدل أن
       تبقى تجميعةٌ مستحيلة معروضة على أنها سليمة */
    if (categoryName === 'Case' && selectedComponents['Motherboard']) {
      const moboSpecs = parseSpecs(selectedComponents['Motherboard']!.specs);
      if (!boardFitsCase(moboSpecs.formFactor, specs.formFactor)) {
        newSelections['Motherboard'] = null;
        toastMessage = `شلنا اللوحة (${moboSpecs.formFactor}) لأنها ما تدخل كيس ${specs.formFactor}`;
      }
    }
    if (categoryName === 'Motherboard' && selectedComponents['Case']) {
      const caseSpecs = parseSpecs(selectedComponents['Case']!.specs);
      if (!boardFitsCase(specs.formFactor, caseSpecs.formFactor)) {
        newSelections['Case'] = null;
        toastMessage = `شلنا الكيس (${caseSpecs.formFactor}) لأنه ما يساع لوحة ${specs.formFactor}`;
      }
    }

    /* ============ المبرّد: يُزال ولا يُزيل ============
       ⚠️ عمداً في اتجاهٍ واحد. المبرّد قطعةٌ **اختيارية** يُغيّرها المستخدم
       آخراً، فإسقاط كيسٍ أو معالجٍ اختاره بعناية لأجل مبرّد يقلب الأولوية.
       أمّا العكس — تغيير الكيس أو المعالج — فيُسقط المبرّد لأنه التابع. */
    const chosenCooler = selectedComponents['Cooler'];
    if (chosenCooler && categoryName !== 'Cooler') {
      const k = parseSpecs(chosenCooler.specs);

      if (categoryName === 'Case' && !coolerFitsCase(k.type, k.sizeMm, specs.maxCoolerHeight, specs.radiatorSupport)) {
        newSelections['Cooler'] = null;
        toastMessage = toastMessage
          ? toastMessage + ' والمبرّد بعد'
          : `شلنا المبرّد (${k.sizeMm}مم) لأنه ما يدخل الكيس الجديد`;
      }

      if (categoryName === 'CPU' && !coolerFitsCpu(k.sockets, specs.socket)) {
        newSelections['Cooler'] = null;
        toastMessage = toastMessage
          ? toastMessage + ' والمبرّد بعد'
          : `شلنا المبرّد لأنه ما يدعم مقبس ${specs.socket}`;
      }
    }

    setSelectedComponents(newSelections);
    
    if (toastMessage) {
      toast(toastMessage, { icon: '🔄' });
    }
  };

  const handleRemove = (categoryName: string) => {
    setSelectedComponents(prev => ({ ...prev, [categoryName]: null }));
  };

  const getComponentsWithCompatibility = (categoryName: string, components: Component[]): ComponentWithCompatibility[] => {
    const cpu = selectedComponents['CPU'];
    const mobo = selectedComponents['Motherboard'];
    const ram = selectedComponents['RAM'];
    const gpu = selectedComponents['GPU'];
    const pcCase = selectedComponents['Case'];

    return components.map(comp => {
      const specs = parseSpecs(comp.specs);
      let isCompatible = true;
      let reason = "";

      if (categoryName === 'Motherboard') {
        if (cpu) {
          const cpuSpecs = parseSpecs(cpu.specs);
          if (specs.socket && cpuSpecs.socket && String(specs.socket) !== String(cpuSpecs.socket)) {
            isCompatible = false;
            reason = `المعالج اللي اخترته يبي مقبس ${cpuSpecs.socket}`;
          }
          /* حدّ قدرة اللوحة — القاعدة في lib/fit لا هنا، والفحص الموحّد يقرؤها نفسها */
          const power = isCompatible ? cpuPowerFitsBoard(cpuSpecs, specs) : null;
          if (power) { isCompatible = false; reason = power; }
        }
        if (isCompatible && ram) {
          const ramSpecs = parseSpecs(ram.specs);
          if (specs.ramType && ramSpecs.type && String(specs.ramType) !== String(ramSpecs.type)) {
            isCompatible = false;
            reason = `الرام اللي اخترته ${ramSpecs.type} واللوحة تدعم ${specs.ramType}`;
          }
        }
      }
      
      if (categoryName === 'CPU' && mobo) {
        const moboSpecs = parseSpecs(mobo.specs);
        if (specs.socket && moboSpecs.socket && String(specs.socket) !== String(moboSpecs.socket)) {
          isCompatible = false;
          reason = `اللوحة الأم اللي اخترتها مقبسها ${moboSpecs.socket} بس`;
        }
        const power = isCompatible ? cpuPowerFitsBoard(specs, moboSpecs) : null;
        if (power) { isCompatible = false; reason = power; }
      }
      
      if (categoryName === 'RAM' && mobo) {
        const moboSpecs = parseSpecs(mobo.specs);
        if (specs.type && moboSpecs.ramType && String(specs.type) !== String(moboSpecs.ramType)) {
          isCompatible = false;
          reason = `اللوحة الأم تدعم رامات ${moboSpecs.ramType} بس`;
        }
      }
      
      if (categoryName === 'Case' && gpu) {
        /* بعروض الكرت: «لا يدخل» حين لا تدخل أيُّ نسخةٍ متوفّرة منه (lib/fit) */
        if (gpuFitVerdict(gpu, specs) === false) {
          isCompatible = false;
          reason = `طول الكرت اللي اخترته (${shortestGpuMm(gpu)}mm) أكبر من مساحة الكيس (${caseGpuMaxMm(specs)}mm)`;
        }
      }

      /* ============ مقاس اللوحة مقابل الكيس ============
         لم يكن يُفحص إطلاقاً: تختار لوحة ATX وكيس Mini-ITX فيقول
         «متوافق». والكيس يقبل مقاسه وما دونه لا ما فوقه — انظر lib/fit */
      if (categoryName === 'Case' && mobo) {
        const moboSpecs = parseSpecs(mobo.specs);
        if (!boardFitsCase(moboSpecs.formFactor, specs.formFactor)) {
          isCompatible = false;
          reason = `اللوحة اللي اخترتها مقاسها ${moboSpecs.formFactor} وما تدخل كيس ${specs.formFactor}`;
        }
      }

      if (categoryName === 'Motherboard' && isCompatible && pcCase) {
        const caseSpecs = parseSpecs(pcCase.specs);
        if (!boardFitsCase(specs.formFactor, caseSpecs.formFactor)) {
          isCompatible = false;
          reason = `الكيس اللي اخترته (${caseSpecs.formFactor}) ما يساع لوحة مقاسها ${specs.formFactor}`;
        }
      }

      /* مقاس المزوّد: كيسات SFF تقبل SFX وحدها، وهو ما لا يظهر من الحجم */
      if (categoryName === 'PSU' && pcCase) {
        const caseSpecs = parseSpecs(pcCase.specs);
        if (!psuFitsCase(specs.formFactor, caseSpecs.psuFormFactor)) {
          isCompatible = false;
          reason = `الكيس يقبل مزوّدات ${caseSpecs.psuFormFactor} بس`;
        }
      }

      if (categoryName === 'Case' && isCompatible && selectedComponents['PSU']) {
        const psuSpecs = parseSpecs(selectedComponents['PSU']!.specs);
        if (!psuFitsCase(psuSpecs.formFactor, specs.psuFormFactor)) {
          isCompatible = false;
          reason = `يقبل مزوّدات ${specs.psuFormFactor} والمزوّد اللي اخترته ${psuSpecs.formFactor}`;
        }
      }

      if (categoryName === 'GPU' && pcCase) {
        const caseSpecs = parseSpecs(pcCase.specs);
        if (gpuFitVerdict(comp, caseSpecs) === false) {
          isCompatible = false;
          reason = `طول الكرت (${shortestGpuMm(comp)}mm) ما يدخل الكيس (${caseGpuMaxMm(caseSpecs)}mm)`;
        }
      }

      /* ============ المبرّد ============
         قيدان لا واحد: المقبس (عضويّة في مجموعة) والمقاس (عمودٌ يختاره
         النوع). ويُفحصان في الاتجاهين — تصفّح المبرّدات بعد اختيار الكيس،
         وتصفّح الكيسات بعد اختيار المبرّد. */
      if (categoryName === 'Cooler') {
        if (cpu) {
          const cpuSpecs = parseSpecs(cpu.specs);
          if (!coolerFitsCpu(specs.sockets, cpuSpecs.socket)) {
            isCompatible = false;
            reason = coolerCpuReason(specs.sockets, cpuSpecs.socket) || '';
          }
        }
        if (isCompatible && pcCase) {
          const caseSpecs = parseSpecs(pcCase.specs);
          if (!coolerFitsCase(specs.type, specs.sizeMm, caseSpecs.maxCoolerHeight, caseSpecs.radiatorSupport)) {
            isCompatible = false;
            reason = coolerFitReason(specs.type, specs.sizeMm, caseSpecs.maxCoolerHeight, caseSpecs.radiatorSupport) || '';
          }
        }
      }

      const cooler = selectedComponents['Cooler'];

      if (categoryName === 'Case' && isCompatible && cooler) {
        const cSpecs = parseSpecs(cooler.specs);
        if (!coolerFitsCase(cSpecs.type, cSpecs.sizeMm, specs.maxCoolerHeight, specs.radiatorSupport)) {
          isCompatible = false;
          reason = `المبرّد اللي اخترته (${cSpecs.sizeMm}مم) ما يدخل هالكيس`;
        }
      }

      if (categoryName === 'CPU' && isCompatible && cooler) {
        const cSpecs = parseSpecs(cooler.specs);
        if (!coolerFitsCpu(cSpecs.sockets, specs.socket)) {
          isCompatible = false;
          reason = `المبرّد اللي اخترته ما يدعم مقبس ${specs.socket}`;
        }
      }

      return { ...comp, isCompatible, reason };
    });
  };

  /* ============ بناء ثلاثة مستويات من الكتالوج الحقيقي ============
     يُستدعى بعد أن يفهم المساعد النيّة. النموذج لا يلمس هذا إطلاقاً —
     كل قطعة هنا موجودة ومتوفّرة في كتالوجنا بسعرها الفعلي. */
  const applyPlan = (plan: TierPlan) => {
    /* ⚠️ و«بدأ بناءً» يُطلق هنا أيضاً: هذا المسار يضع القطع دفعةً واحدة
       ولا يمرّ بـ`handleSelect`. فكان القُمع يعطي رقماً **مستحيلاً** —
       ٩٨ وصلوا و٦٥ بدأوا. ومن بنى بالمساعد بدأ بناءً كمن اختار بيده. */
    trackOnce('build_start', 'build_start', { label: 'assistant' });
    setSelectedComponents(plan.picks as any);
    setAiPlans(null);
    toast.success(`جهّزنا لك تجميعة ${plan.label} — ${formatTotal(plan.total)} ريال`, { icon: '✨' });
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  /* ============ بناء المستويات من الكتالوج الحقيقي ============
     المنطق كلّه في lib/intent-plans.ts (نُقل 2026-10-14 كي يُختبر وحده):
     ملفّات الاستخدام، والسلّم، والمبرّد، والسعة، وسقف سرعة الرام.
     النموذج لا يلمس هذا إطلاقاً؛ كل قطعة موجودة ومتوفّرة بسعرها الفعلي. */
  const buildPlans = (intent: Intent): TierPlan[] | null => buildIntentPlans(categories, intent);




  const handleCopyText = () => {
    let text = "💻 تجميعتي المخصصة:\n\n";
    Object.entries(selectedComponents).forEach(([cat, comp]) => {
      if (comp) text += `▪️ ${cat}: ${comp.brand} ${comp.name}\n`;
    });
    
    const totalPrice = Object.values(selectedComponents).reduce((sum, comp) => sum + (comp ? comp.price : 0), 0);
    text += `\n💰 التكلفة الإجمالية: ${formatTotal(totalPrice)} ريال\n`;
    text += `🔗 تفاصيل أكثر: ${window.location.href}`;

    navigator.clipboard.writeText(text);
    toast.success('نسخنا مواصفات التجميعة!', { icon: '📋' });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('نسخنا رابط التجميعة — شاركه!', { icon: '🔗' });
  };

  const checkCompatibility = () => {
    const cpu = selectedComponents['CPU'];
    const mobo = selectedComponents['Motherboard'];
    const ram = selectedComponents['RAM'];
    const gpu = selectedComponents['GPU'];
    const pcCase = selectedComponents['Case'];
    const psu = selectedComponents['PSU'];

    let totalTdp = 0;
    let totalPrice = 0;

    Object.values(selectedComponents).forEach(comp => {
      if (comp) {
        totalTdp += comp.tdpWattage;
        totalPrice += comp.price;
      }
    });
    totalPrice = Number(totalPrice.toFixed(2));

    /* الكرت مطلوبٌ إلّا مع معالجٍ برسوميّات مدمجة (2026-10-14): خطّة «مكتبي» في
       المساعد بلا كرتٍ عمداً، فكان التقرير لا يُفتح لها أبداً. والحقل الغائب أو
       «None» = لا رسوميّات، فيبقى الكرت مطلوباً (وفي الفحص تحذير noDisplay). */
    const igpu = String(parseSpecs(cpu?.specs).integratedGraphics ?? '').trim();
    const hasIgpu = !!igpu && !/^(none|no|لا يوجد)$/i.test(igpu);
    const requiredCategories = ['CPU', 'Motherboard', 'RAM', ...(hasIgpu ? [] : ['GPU']), 'Case', 'PSU', 'Storage'];
    const missingCategories = requiredCategories.filter(cat => !selectedComponents[cat]);

    if (missingCategories.length > 0) {
      setResult({ 
        status: 'incomplete', 
        message: 'باقي تختار هالقطع عشان يطلع لك تقرير التوافق:', 
        missingCategories,
        totalTdp, 
        totalPrice 
      });
      return;
    }

    const cpuSpecs = parseSpecs(cpu!.specs);
    const moboSpecs = parseSpecs(mobo!.specs);
    const ramSpecs = parseSpecs(ram!.specs);
    const caseSpecs = parseSpecs(pcCase!.specs);
    const psuSpecs = parseSpecs(psu!.specs);

    /* ============ الحكم كلّه من `lib/build-check.ts` ============
     * كانت الفحوص مكتوبةً هنا واحداً واحداً، ويستدعي «المُعدِّل»
     * و«تجميعات مقترحة» بعضَها لا كلَّها — فتخرج منهما تجميعةٌ لا تُركَّب.
     * والمبرّد لم يكن يُفحص هنا إطلاقاً: يُفحص عند الاختيار ثم يُنسى، فإن
     * جاءت التجميعة محفوظةً أو معدَّلةً مرّ مبرّدٌ لا يُركَّب على المعالج. */
    const issues = checkBuild({
      CPU: cpu, Motherboard: mobo, RAM: ram, GPU: gpu,
      Case: pcCase, PSU: psu, Storage: selectedComponents['Storage'],
      Cooler: selectedComponents['Cooler'],
    });

    const blocking = issues.find((i) => i.level === 'block');
    if (blocking) {
      setResult({ status: 'error', message: `فيه مشكلة توافق: ${blocking.message}`, totalTdp, totalPrice });
      return;
    }

    let bottleneck = null;
    if (cpu!.performanceTier && gpu?.performanceTier) { // بلا كرت (رسوميّات مدمجة): لا حكم اختناق
      const diff = cpu!.performanceTier - gpu!.performanceTier;
      let suggestions: { category: string, item: Component }[] = [];
      /* الحكم بالكلمات حين يُقاس الطرفان (lib/perf-rating): «المعالج متوسّط والكرت قمّة» يشرح
         نفسه، وجملةٌ عامّة كانت تترك الزائر يسأل «ليش؟». وما لا قياس له يبقى بالجملة العامّة. */
      const cpuWord = partRatings('CPU', cpu!.name, parseSpecs(cpu!.specs))[0]?.word;
      const gpuWord = partRatings('GPU', gpu!.name, parseSpecs(gpu!.specs))[0]?.word;
      const named = !!(cpuWord && gpuWord);

      if (diff < -1) {
        const cpuCategory = categories.find(c => c.name === 'CPU');
        if (cpuCategory && moboSpecs) {
          suggestions = cpuCategory.components.filter(c => {
            const cSpecs = parseSpecs(c.specs);
            return cSpecs.socket === moboSpecs.socket && 
                   c.performanceTier !== null && 
                   c.performanceTier >= gpu!.performanceTier! - 1 &&
                   c.id !== cpu!.id;
          })
          .sort((a, b) => a.price - b.price).slice(0, 6)
          .map(item => ({ category: 'CPU', item }));
        }

        bottleneck = {
          title: named
            ? `⚠️ أداء المعالج في الألعاب «${cpuWord}» والكرت «${gpuWord}» — المعالج ممكن يحدّ من الكرت في بعض الألعاب، خصوصاً على 1080p و1440p.`
            : "⚠️ المعالج ممكن يحدّ من أداء الكرت في بعض الألعاب، خصوصاً على 1080p و1440p.",
          desc: "ننصحك ترقّي المعالج، أو تلعب على 4K عشان الحمل يروح على الكرت ويخف الضغط عن المعالج.",
          color: "text-amber-900 dark:text-amber-400",
          bg: "bg-amber-100 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800/50",
          suggestions
        };
      } else if (diff > 1) {
        const gpuCategory = categories.find(c => c.name === 'GPU');
        if (gpuCategory && caseSpecs) {
          suggestions = gpuCategory.components.filter(c => {
            return gpuFitVerdict(c, caseSpecs) !== false && 
                   c.performanceTier !== null && 
                   c.performanceTier >= cpu!.performanceTier! - 1 &&
                   c.id !== gpu!.id;
          })
          .sort((a, b) => a.price - b.price).slice(0, 6)
          .map(item => ({ category: 'GPU', item }));
        }

        bottleneck = {
          title: named
            ? `💡 الكرت «${gpuWord}» والمعالج «${cpuWord}» في الألعاب — كرت الشاشة بيحدّ من قوة الجهاز.`
            : "💡 كرت الشاشة بيحدّ من قوة الجهاز.",
          desc: "الأداء بيكون ممتاز وسلس في ألعاب الشوتر والتنافسية، بس الكرت بينزّل الفريمات في ألعاب القصة الثقيلة والدقات العالية.",
          color: "text-cyan-900 dark:text-cyan-400",
          bg: "bg-cyan-100 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-800/50",
          suggestions
        };
      } else {
        bottleneck = {
          title: named
            ? `🚀 توازن ممتاز: المعالج «${cpuWord}» في الألعاب والكرت «${gpuWord}».`
            : "🚀 توازن ممتاز بين المعالج والكرت.",
          desc: "المعالج والكرت من نفس الفئة تقريباً، يعني أداء مستقر وتستفيد من قوة الجهاز كاملة بدون اختناق.",
          color: "text-emerald-900 dark:text-emerald-400",
          bg: "bg-emerald-100 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800/50"
        };
      }
    }

    /* ⚠️ والتحذيرات تُعرض مع النجاح: «توافق تامّ» فوق معالجٍ بلا مبرّد
       كذبةٌ مريحة — ٢٩ من ٤٦ معالجاً عندنا لا يأتي بمبرّد. */
    const warnings = issues.filter((i) => i.level === 'warn').map((i) => i.message);
    /* وصل إلى تقرير التوافق — الطرف الثاني من القُمع */
    trackOnce('build_complete', 'build_complete', { label: warnings.length ? 'warnings' : 'clean' });
    setResult({
      status: 'success',
      message: warnings.length
        ? 'القطع متوافقة — بس فيه ملاحظات.'
        : 'توافق تام! كل القطع تركب وتشتغل مع بعض.',
      warnings,
      bottleneck,
      totalTdp,
      totalPrice,
    });
  };

  const handleClearBuild = () => {
    if (!confirm('متأكد تبي تفرّغ كل القطع؟ بتنمسح اختياراتك وتبدأ من جديد.')) return;
    
    const emptyState: Record<string, Component | null> = {};
    categories.forEach(cat => emptyState[cat.name] = null);
    setSelectedComponents(emptyState);
    
    setEditModeId(null);
    setBuildName("");
    
    localStorage.removeItem('draft_pc_build');
    window.history.replaceState({}, '', window.location.pathname);
    
    toast.success('فرّغنا التجميعة');
  };

  const handleSaveBuildClick = () => {
    if (!session || !session.user) {
      /* كانت رسالةً حمراء تختفي بعد ثوانٍ بلا زرّ دخول، والزائر لا يدري أنّ تجميعته باقية
         (تجربة المستخدمين 2026-10-17). والمسودّة في المتصفّح ومعاملات الرابط، و`goToLogin`
         يعود به إلى الرابط نفسه بعد الدخول. */
      toast(
        (tt) => (
          <div className="text-right">
            <p className="text-[13px] font-black">سجّل دخولك عشان تحفظ التجميعة في حسابك</p>
            <p className="text-[12px] font-semibold opacity-80 mt-0.5">تجميعتك باقية هنا وما راح تضيع — نرجّعك لها بعد الدخول.</p>
            <div className="flex gap-2 mt-2">
              <a href="/login" onClick={goToLogin} className="px-3 py-1.5 rounded-sm bg-cyan-600 text-white text-[12px] font-black">تسجيل الدخول</a>
              <button type="button" onClick={() => toast.dismiss(tt.id)} className="px-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-600 text-[12px] font-bold">لاحقاً</button>
            </div>
          </div>
        ),
        { duration: 10000, icon: '💾' },
      );
      return;
    }
    if (!buildName && !editModeId) {
       setBuildName("تجميعة " + new Date().toLocaleDateString('ar-SA'));
    }
    setSaveModalOpen(true);
  };

  const confirmSaveBuild = async () => {
    setIsSaving(true);
    try {
      const getComponentId = (searchCategory: string) => {
        const key = Object.keys(selectedComponents).find(
          (k) => k.toLowerCase() === searchCategory.toLowerCase()
        );
        return key && selectedComponents[key] ? selectedComponents[key]!.id : null;
      };

      const payload = {
        id: editModeId, 
        name: buildName || "تجميعة مخصصة",
        cpuId: getComponentId('CPU'),
        gpuId: getComponentId('GPU'),
        ramId: getComponentId('RAM'),
        motherboardId: getComponentId('Motherboard'),
        caseId: getComponentId('Case'),
        psuId: getComponentId('PSU'),
        storageId: getComponentId('Storage'),
        /* المبرّد آخر ما وصل، وكان يُفقد صامتاً: يُختار في الباني ولا يصل
           الحفظ، فلا يظهر في التجميعة ولا يدخل مجموع سعرها. */
        coolerId: getComponentId('Cooler'),
      };

      const res = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errorMessage = 'ما قدرنا نحفظ — صار خطأ عندنا في السيرفر.';
        try {
          const errorData = await res.json();
          if (errorData.message) errorMessage = errorData.message;
        } catch (e) {
          console.error("السيرفر لم يرجع JSON صالح (انهيار 500).", e);
        }
        throw new Error(errorMessage);
      }
      
      toast.success(editModeId ? 'حدّثنا تجميعتك!' : 'انحفظت تجميعتك!');
      setSaveModalOpen(false);

      localStorage.removeItem('draft_pc_build');
      const emptyState: Record<string, Component | null> = {};
      categories.forEach(cat => emptyState[cat.name] = null);
      setSelectedComponents(emptyState);
      setBuildName("");

      if (editModeId) {
        setEditModeId(null);
        window.location.href = '/my-builds';
      } else {
        window.history.replaceState({}, '', window.location.pathname);
      }
      
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || 'صار خطأ وإحنا نحفظ التجميعة');
    } finally {
      setIsSaving(false);
    }
  };

  const exportBuildAsImage = async () => {
    if (!resultRef.current) return;
    const loadingToast = toast.loading('نجهّز الصورة...');
    
    try {
      const filter = (node: HTMLElement | any) => {
        if (node?.classList && typeof node.classList.contains === 'function') {
          if (node.classList.contains('export-ignore')) return false;
        }
        if (node?.tagName === 'IMG') return false;
        return true;
      };

      const dataUrl = await toPng(resultRef.current, { 
        backgroundColor: '#0f172a',
        cacheBust: true,
        pixelRatio: 2,
        filter: filter
      }); 

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `PC-Build-${new Date().getTime()}.png`;
      link.click();
      
      toast.success('الصورة جاهزة!', { id: loadingToast });
    } catch (error) {
      console.error("خطأ في تصدير الصورة:", error);
      toast.error('ما قدرنا نطلّع الصورة — بعض المتاجر تحمي صورها.', { id: loadingToast });
    }
  };

  /* الفئة تُمرَّر للترتيب: jsonb يعيد ترتيب المفاتيح بطول الاسم، فالترتيب
     المفيد يُفرض هنا لا عند الحفظ — انظر التعليق في lib/spec-labels */
  const renderSpecs = (specsStr: any, categoryName?: string) => {
    if (!specsStr) return <p className="text-sm text-slate-500 font-medium">ما عندنا مواصفات مسجّلة لهالقطعة.</p>;
    try {
      const parsed = parseSpecs(specsStr);
      return (
        <div className="mt-3 rounded-sm border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 px-4 py-2">
          <SpecSheet categoryName={categoryName} specs={parsed} dense />
        </div>
      );
    } catch (e) {
      return <p className="text-sm text-slate-700 dark:text-slate-300">{String(specsStr)}</p>;
    }
  };

  if (!isLoaded) {
    /* هيكل عظمي يطابق التخطيط الفعلي — لا دوّارة عارية.
       يُشعر بأن المحتوى قادم، ويمنع قفزة التخطيط عند الوصول. */
    return (
      <div className="max-w-5xl mx-auto mt-4 mb-10 bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm rounded-sm border border-slate-200 dark:border-slate-800/80">
        <div className="p-6 md:p-10">
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800/60">
            <Sk className="h-8 w-48" />
            <Sk className="h-10 w-64 rounded-sm" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 mb-10">
            {Array.from({ length: 7 }).map((_, i) => <SkSelectCard key={i} />)}
          </div>
          <Sk className="h-14 w-full rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-4 mb-10 bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm rounded-sm shadow-sm border border-slate-200 dark:border-slate-800/80">
      
      {/* العنوان والشرح في app/builder/layout.tsx — من الخادم، خارج حدّ التحميل */}

      <div className="p-6 md:p-10">
        
        {/* ⚠️ شريط "نشتغل عليه الآن" مُعطَّل عن العرض عمداً.
            مراجع AdSense يقرأ "قيد التطوير" على صفحة رئيسية كإشارة
            "موقع تحت الإنشاء" — وهو سبب رفض صريح في سياساتهم.
            المكوّن باقٍ في المشروع؛ أعِد <WorkInProgress /> هنا متى قُبِلت
            المنصة وأردت إعلان ميزة قادمة. */}

        {/* ===== ١) المساعد: يسأل وش تلعب، ويبني ثلاث خطط من الكتالوج ===== */}
        <IntentPicker onPlans={showPlans} buildPlans={buildPlans} />

        {/* ===== خيارات المساعد ===== */}
        {aiPlans && aiPlans.length > 0 && (() => {
          /* المُوصى به = الأوسط حين تكون ثلاث خطط، وإلا الأولى.
             كان مثبّتاً على الفهرس ١، فيوصي بـ"قوي" حين تبقى خطتان. */
          const recIdx = aiPlans.length >= 3 ? 1 : 0;
          return (
          <div ref={plansRef} className="mb-8 p-5 rounded-sm border border-cyan-500/30 bg-white dark:bg-[#0F172A] scroll-mt-20">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">اختر المستوى اللي يناسبك:</h3>
              <button onClick={() => setAiPlans(null)} className="text-[12px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">إخفاء</button>
            </div>
            {/* ننزل إلى الخطط تلقائياً، فيُقال أين صار السؤال الاختياريّ */}
            <p className="mb-4 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
              تبي شركة معيّنة أو تصوّر وتبث؟ غيّرها من الأسئلة فوق وتتحدّث الخطط على طول.
            </p>
            <div className={`grid grid-cols-1 gap-3 ${aiPlans.length >= 3 ? 'md:grid-cols-3' : aiPlans.length === 2 ? 'md:grid-cols-2' : ''}`}>
              {aiPlans.map((plan, i) => (
                <button
                  key={plan.key}
                  onClick={() => applyPlan(plan)}
                  className={`text-right p-4 rounded-sm border transition-all hover:-translate-y-1 group ${
                    i === recIdx ? 'border-cyan-500 bg-cyan-500/[0.06] ring-2 ring-cyan-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[12px] font-black tracking-widest ${i === recIdx ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`}>{plan.label}</span>
                    {i === recIdx && <span className="text-[12px] font-black px-1.5 py-0.5 rounded bg-cyan-500 text-white">مُوصى به</span>}
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{Math.round(plan.total).toLocaleString('en-US')}</span>
                    <RiyalIcon size="h-3.5 w-3.5" colorClass="bg-slate-900 dark:bg-white" />
                  </div>
                  {/* «يكفيني؟» — إطارات الكرت المقيسة بدقّة الزائر (lib/intent-plans · perf) */}
                  {plan.perf && (
                    <div className="mb-2 text-[12px] font-bold text-slate-600 dark:text-slate-300">
                      نحو <span className="font-mono font-black text-slate-900 dark:text-white">{plan.perf.fps}</span> إطار بدقّة <span dir="ltr">{plan.perf.res}</span>
                      <span className={`mr-1.5 px-1.5 py-0.5 rounded-sm text-[11px] font-black ${
                        plan.perf.feel === 'مريح' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : plan.perf.feel === 'مقبول' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                      }`}>{plan.perf.feel}</span>
                      {plan.perf.note && <span className="block mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{plan.perf.note}</span>}
                    </div>
                  )}
                  <div className="mb-3 flex items-start gap-1.5 text-right">
                    <svg className="w-3 h-3 mt-0.5 shrink-0 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    <p className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">{plan.note}</p>
                  </div>
                  {/* القطع كلّها لا المعالج والكرت وحدهما (2026-10-14): الزائر كان يرى
                      سطرين ثمّ يُفاجأ بسبع قطعٍ في الباني — والسعر يشمل الكيس والمبرّد. */}
                  <div className="space-y-1">
                    {PLAN_ROWS.map(([cat, label]) => {
                      const part = plan.picks[cat];
                      if (!part && !(cat === 'GPU' && plan.picks['CPU'])) return null;
                      return (
                        <div key={cat} className="flex items-center gap-1.5 text-[12px]">
                          <span className="font-black text-slate-400 w-14 shrink-0">{label}</span>
                          {/* الاسم لاتينيّ: باتّجاهه يُقصّ من آخره لا من أوّله («…B (2x8GB) DDR5») */}
                          <span dir={part ? 'ltr' : undefined} className="font-bold text-slate-600 dark:text-slate-300 truncate min-w-0 flex-1 text-right" title={part?.name}>
                            {part ? part.name : 'رسوميّات المعالج المدمجة'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className={`mt-3 pt-3 border-t text-[12px] font-black text-center transition-colors ${
                    i === recIdx ? 'border-cyan-500/30 text-cyan-600 dark:text-cyan-400' : 'border-slate-100 dark:border-slate-800 text-slate-400 group-hover:text-cyan-500'
                  }`}>استخدم هذي ←</div>
                </button>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-slate-400 font-medium text-center">كل القطع متوفّرة فعلاً بأسعارها الحين · وتقدر تغيّر أي قطعة بعد ما تختار</p>
            {aiPlans.some((p) => p.perf) && (
              <p className="mt-1 text-[12px] text-slate-400 font-medium text-center">
                الإطارات: متوسّط ألعاب حديثة على Ultra بدون DLSS/FSR ·{' '}
                <a href={GPU_PERF_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-600 dark:hover:text-cyan-400">{GPU_PERF_SOURCE.name}</a>
              </p>
            )}
          </div>
          );
        })()}

        {/* ===== ٢) خصّص تجميعتك: تحت المساعد، يظهر متى اخترت قطعة ===== */}
        {Object.values(selectedComponents).some(Boolean) && (
          <BuildTuner
            categories={categories}
            selectedComponents={selectedComponents}
            onApply={(next) => {
              setSelectedComponents(next);
              setResult({ status: 'idle', message: '', totalTdp: 0, totalPrice: 0 });
              toast.success('طبّقنا التغييرات — شيّك على التوافق مرة ثانية.', { icon: '✅' });
            }}
          />
        )}

        {/* شريط الخيارات العلوي */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 pb-6 border-b border-slate-200 dark:border-slate-800/60 gap-4">
          
          {/* اليمين: العنوان وأزرار الاستكمال */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 shrink-0 tracking-tight">
              <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
              لوحة اختيار القطع
            </h2>
            

          </div>

          {/* اليسار: التفريغ والعرض */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={handleClearBuild}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-rose-500 bg-white hover:bg-rose-50 dark:text-rose-400 dark:bg-slate-800/40 dark:hover:bg-rose-950/40 rounded-sm transition-all border border-slate-200 hover:border-rose-200 dark:border-slate-700/50 dark:hover:border-rose-900/50 shadow-sm"
              title="امسح كل القطع وابدأ من جديد"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              تفريغ التجميعة
            </button>

            <label className="group flex items-center gap-3 cursor-pointer bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 rounded-sm border border-slate-200 dark:border-slate-700/50 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-sm">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={showIncompatible}
                  onChange={(e) => setShowIncompatible(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-10 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer-checked:bg-cyan-600 transition-colors"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 select-none group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                اعرض القطع اللي ما تتوافق (عشان تعرف السبب)
              </span>
            </label>
          </div>
        </div>

        {/* شبكة القطع */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 mb-10">
          {categories.map((category) => {
            const compsWithComp = getComponentsWithCompatibility(category.name, category.components);
            return (
              <div key={category.id} className="w-full min-w-0">
                <SearchableSelect 
                  categoryName={category.name}
                  components={compsWithComp}
                  selectedComponent={selectedComponents[category.name]}
                  onSelect={(id) => handleSelect(category.name, id)}
                  onRemove={() => handleRemove(category.name)}
                  onShowDetails={(comp) => setDetailsModal({ comp, categoryName: category.name })}
                  showIncompatible={showIncompatible}
                />
              </div>
            );
          })}
        </div>

        {/* ===== اقترح قطعة ناقصة — هنا يدرك المستخدم أن قطعته غير موجودة ===== */}
        <SuggestPartCard source="builder" className="mt-8" />

        {/* صندوق النتيجة */}
        {result.status !== 'idle' && (
          <div className="mt-10 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {result.status === 'incomplete' ? (
              <div className="p-8 rounded-sm border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-sm flex items-center justify-center text-slate-500 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-lg font-extrabold text-slate-700 dark:text-slate-300">{result.message}</h3>
                
                {/* عرض القطع الناقصة.
                    ⚠️ `rose-400` على `rose-900/30` كان يعطي 3.06:1 — دون AA.
                    و`rose-200` يعطي 6.22، قِيسا على العنصر نفسه. */}
                {result.missingCategories && result.missingCategories.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-1">
                    {result.missingCategories.map(cat => (
                      <span key={cat} className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-200 text-[12px] font-black uppercase tracking-widest rounded-sm border border-rose-200 dark:border-rose-800/50">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
                
                {(result.totalPrice > 0 || result.totalTdp > 0) && (
                  <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm font-bold">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2 flex items-center gap-2 text-slate-600 dark:text-slate-400 shadow-sm">
                      ⚡ الطاقة الحالية: <span className="text-amber-600 dark:text-amber-500">{result.totalTdp}W</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-2 flex items-center gap-2 text-slate-600 dark:text-slate-400 shadow-sm">
                      💰 التكلفة الحالية: 
                      <span className="text-emerald-600 dark:text-emerald-500 font-black flex items-center gap-1">
                        {formatTotal(result.totalPrice)} <RiyalIcon size="h-4 w-4" colorClass="bg-emerald-600 dark:bg-emerald-500" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div ref={resultRef} className={`rounded-sm border shadow-sm relative overflow-hidden ${
                result.status === 'success' 
                  ? 'bg-white dark:bg-[#0F172A] border-emerald-200 dark:border-emerald-800/40' 
                  : 'bg-white dark:bg-[#0F172A] border-rose-200 dark:border-rose-800/40'
              }`}>
                {/* شريط الحالة العلوي */}
                <div className={`h-1.5 w-full ${
                  result.status === 'success'
                    ? 'bg-gradient-to-l from-emerald-500 to-emerald-400'
                    : 'bg-gradient-to-l from-rose-500 to-rose-400'
                }`}></div>

                <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6 relative z-10">
                  <div className={`w-14 h-14 rounded-sm flex items-center justify-center shrink-0 shadow-sm border-2 ${
                    result.status === 'success' ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-600/50' : 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-600/50'
                  }`}>
                    {result.status === 'success' ? (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xl font-black mb-3 ${result.status === 'success' ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-900 dark:text-rose-400'}`}>
                      {result.message}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-3">
                        <div className="text-[12px] font-black text-slate-500 dark:text-slate-300 mb-1">التكلفة الإجمالية</div>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          {formatTotal(result.totalPrice)} <RiyalIcon size="h-4 w-4" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                        </div>
                        {(() => {
                          const n = Object.values(selectedComponents).filter((c) => c && !isAvailable(c)).length;
                          return n > 0 ? (
                            <div className="mt-1 text-[11.5px] font-black text-amber-600 dark:text-amber-400">
                              ⚠ يشمل {n === 1 ? 'قطعةً غير متوفّرة' : `${n} قطع غير متوفّرة`} بآخر سعر رصدناه
                            </div>
                          ) : null;
                        })()}
                      </div>
                      <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-3">
                        <div className="text-[12px] font-black text-slate-500 dark:text-slate-300 mb-1">الطاقة التقريبية</div>
                        <div className="text-xl font-black text-amber-600 dark:text-amber-400">{result.totalTdp}W</div>
                      </div>
                    </div>

                    {/* ⚠️ ملاحظاتٌ لا تمنع التركيب — وتُعرض مع النجاح لا
                        تُبتلع: «توافق تامّ» فوق معالجٍ بلا مبرّد كذبةٌ مريحة. */}
                    {result.warnings && result.warnings.length > 0 && (
                      <ul className="mt-4 space-y-1.5 rounded-sm border border-amber-300 bg-amber-50/70 p-3 dark:border-amber-800/50 dark:bg-amber-900/15">
                        {result.warnings.map((w) => (
                          <li key={w} className="flex gap-2 text-[13px] font-bold leading-relaxed text-amber-900 dark:text-amber-300">
                            <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <PowerMeter
                      totalTdp={result.totalTdp}
                      psuWattage={selectedComponents['PSU'] ? parseFloat(parseSpecs(selectedComponents['PSU'].specs).wattage || "0") : 0}
                    />

                    {result.bottleneck && (
                      <div className={`mt-6 p-5 border rounded-sm ${result.bottleneck.bg} flex flex-col relative shadow-sm`}>
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h4 className={`font-black text-base mb-1 ${result.bottleneck.color}`}>
                              {result.bottleneck.title}
                            </h4>
                            <p className={`text-sm font-medium opacity-90 ${result.bottleneck.color}`}>
                              {result.bottleneck.desc}
                              {' '}<a href="/how-we-rate" target="_blank" className="underline underline-offset-2 opacity-90 hover:opacity-100 whitespace-nowrap">كيف نقيّم؟</a>
                            </p>
                          </div>
                        </div>

                        {/* قسم الاقتراحات */}
                        {result.bottleneck.suggestions && result.bottleneck.suggestions.length > 0 && (
                          <div className="mt-6 pt-5 border-t border-current/15 w-full">
                            <span className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${result.bottleneck.color} opacity-90`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                              ترقيات نقترحها:
                            </span>
                            
                            {/* حاوية التمرير */}
                            <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
                              {result.bottleneck.suggestions.map((sug, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSelect(sug.category, sug.item.id)}
                                  className="group flex flex-col text-right p-4 rounded-sm bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 min-w-[260px] max-w-[260px] shrink-0 snap-center relative overflow-hidden"
                                >
                                  {/* خط علوي جمالي يظهر عند التمرير */}
                                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  
                                  <div className="flex justify-between items-start w-full mb-3">
                                    <span className={`text-[12px] font-black uppercase tracking-widest ${getBrandColor(sug.item, sug.category)} bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-sm border border-slate-100 dark:border-slate-700/50`}>
                                      {sug.item.brand}
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-300 text-[12px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-sm">
                                      {sug.category}
                                    </span>
                                  </div>

                                  <span className="text-sm font-extrabold line-clamp-2 leading-relaxed mb-4 text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" title={sug.item.name}>
                                    {sug.item.name}
                                  </span>
                                  
                                  <div className="mt-auto flex justify-between items-end w-full pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                      <span className="block text-[12px] font-bold text-slate-500 dark:text-slate-300 mb-0.5">السعر</span>
                                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                                        {formatPrice(sug.item.price)} <RiyalIcon size="h-3 w-3" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                                      </span>
                                    </div>
                                    
                                    <span className="text-[12px] font-black flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 group-hover:bg-cyan-600 group-hover:text-white px-3 py-2 rounded-sm transition-all">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                      استبدال
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* إطاراتٌ مقيسة للكرت (components/GamePerformance) — كانت بطاقاتٍ مقدَّرة من المستويات */}
                    {result.status === 'success' && selectedComponents['GPU'] && (
                      <GamePerformance gpu={selectedComponents['GPU']} cpu={selectedComponents['CPU']} />
                    )}

                    {result.status === 'success' && (
                      <div className="mt-8 pt-8 border-t border-emerald-200/50 dark:border-emerald-800/30">
                        <h4 className="font-extrabold text-emerald-900 dark:text-emerald-500 mb-2 text-sm uppercase tracking-widest">
                          اشترِ قطعك الحين:
                        </h4>

                        {/* سطر التوفير الجماعي (div لا p — RiyalIcon بداخله div) */}
                        {(() => {
                          const savings = Object.values(selectedComponents).reduce((sum, comp) => {
                            if (!comp) return sum;
                            const offers = getStoreOffers(comp);
                            if (offers.length < 2) return sum;
                            return sum + (offers[offers.length - 1].price - offers[0].price);
                          }, 0);
                          if (savings <= 0) return <div className="mb-5"></div>;
                          return (
                            <div className="mb-5 text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                              <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                              لو أخذت كل قطعة من أرخص متجر توفّر
                              <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                                {formatTotal(savings)} <RiyalIcon size="h-3 w-3" colorClass="bg-emerald-600 dark:bg-emerald-400" />
                              </span>
                              مقارنةً بأغلى العروض — ورتّبناها لك.
                            </div>
                          );
                        })()}
                        <div className="grid grid-cols-1 gap-3">
                          {Object.entries(selectedComponents).map(([catName, comp]) => {
                            if (!comp) return null;
                            return (
                              <div key={catName} className="flex p-4 bg-white dark:bg-slate-800/80 rounded-sm shadow-sm border border-slate-200 dark:border-slate-700/60 gap-4 hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-colors group items-start sm:items-center">
                                {comp.imageUrl ? (
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 p-2 flex items-center justify-center shrink-0">
                                     <img src={productImage(comp.imageUrl)} alt={comp.name} className="max-w-full max-h-full object-contain export-ignore" />
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center shrink-0">
                                    <span className="text-2xl opacity-40">⚙️</span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="text-sm leading-tight">
                                    <span className="font-bold text-slate-500 dark:text-slate-300 text-[12px] block mb-1">{getCatMeta(catName).label}</span>
                                    <span className={getBrandColor(comp, catName) + " ml-1"}>{comp.brand}</span>
                                    <span className="text-slate-900 dark:text-white font-bold line-clamp-1">{comp.name}</span>
                                  </div>

                                  {/* ⚠️ لا `shrink-0` هنا: كان يمنع الصفّ من الانكماش، فيبقى على
                                      عرضه الطبيعيّ ويفيض خارج البطاقة — ولا يلفّ `flex-wrap`
                                      شيئاً لأنّ الصفّ لم يضق أصلاً. قيس على معالجٍ بأربعة
                                      عروض: البطاقة ٧٩٤ والمحتوى ٩٢٤، فشارةُ المتجر الرابع
                                      كاملةً خارج الحدّ. فيُترك الانكماش ويُحفظ السعر وحده. */}
                                  <div className="flex items-center gap-3 min-w-0 flex-wrap">
                                    <span className="font-black text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 rounded-sm border border-emerald-100 dark:border-emerald-800/30 shrink-0">
                                      {formatPrice(comp.price)} <RiyalIcon size="h-3.5 w-3.5" colorClass="bg-emerald-700 dark:bg-emerald-400" />
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 export-ignore">
                                      {/* ⚠️ `data-cid` لا مُعالِج نقرة: المستمع العامّ في
                                          `OfferClickTracker` يلتقطها، والسمة تعطيه القطعة.
                                          ولا يُكتب تعليقٌ بين السمات — لا بصيغة JSX ولا بصيغة
                                          جافاسكربت — فذاك خطأُ تحليلٍ يُسقط البناء كلَّه. */}
                                      {getStoreOffers(comp).map((offer, i) => (
                                        <a
                                          key={offer.storeId}
                                          href={buildStoreUrl(offer.store, offer.url, offer.affiliateUrl)}
                                          {...storeLinkProps(offer.store)}
                                          data-cid={comp.id}
                                          className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-sm font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                                            i === 0
                                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300 dark:ring-emerald-500/40'
                                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                                          }`}
                                        >
                                          <span>{offer.store.name}</span>
                                          <span className="font-black flex items-center gap-0.5">
                                            {formatPrice(offer.price)}
                                            <RiyalIcon size="h-2.5 w-2.5" colorClass={i === 0 ? 'bg-white' : 'bg-slate-500 dark:bg-slate-400'} />
                                          </span>
                                          {i === 0 && getStoreOffers(comp).length > 1 && (
                                            <span className="bg-white/20 rounded px-1 py-0.5 text-[12px] font-black">الأرخص</span>
                                          )}
                                          <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                      ))}
                                      {getStoreOffers(comp).length === 0 && (
                                        <span className="px-3 py-1.5 text-[12px] font-bold text-slate-400 dark:text-slate-600 border border-dashed border-slate-300 dark:border-slate-700 rounded-sm">
                                          غير متوفر حالياً
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                </div>{/* /p-8 */}
              </div>
            )}

            {result.status === 'success' && (
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                {editModeId && (
                  <button 
                    onClick={() => {
                      localStorage.removeItem('draft_pc_build');
                      window.location.href = '/my-builds';
                    }}
                    className="px-6 py-3 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold rounded-sm transition-all flex items-center gap-2 border border-rose-200 dark:border-rose-900/30"
                  >
                    إلغاء التعديل
                  </button>
                )}
                
                <button 
                  onClick={handleCopyText}
                  className="px-6 py-3.5 bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-sm transition-all flex items-center gap-2 border-[1.5px] border-slate-300 dark:border-slate-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  نسخ كنص
                </button>
                <button 
                  onClick={exportBuildAsImage}
                  className="px-6 py-3.5 bg-white dark:bg-[#0F172A] hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 font-bold rounded-sm transition-all flex items-center gap-2 border-[1.5px] border-cyan-500/40 hover:border-cyan-500/70"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  تصدير صورة
                </button>
                
                <button 
                  onClick={handleSaveBuildClick}
                  className="flex-1 min-w-[220px] justify-center px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  {editModeId ? 'حفظ التعديلات' : 'احفظها في حسابي'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* نافذة التفاصيل — في body لا هنا: حاوية الباني فيها backdrop-blur، وهو
          يجعلها مرجعَ fixed بدل الشاشة، فكانت النافذة تتوسّط الباني كلّه (3720px)
          وتنزل تحته — وأكثر كلّما طال بنتيجة التوافق. والحفظ مثلها. */}
      {detailsModal && createPortal((
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0F172A] rounded-sm w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0B1120]/60 backdrop-blur-sm shrink-0">
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-5 bg-cyan-600 rounded-full"></span>
                تفاصيل القطعة
              </h2>
              <button onClick={() => setDetailsModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors">
                <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="flex gap-5 items-start mb-6">
                {detailsModal.comp.imageUrl && (
                  <div className="w-24 h-24 rounded-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-2 flex items-center justify-center shrink-0">
                    <img src={productImage(detailsModal.comp.imageUrl)} alt={detailsModal.comp.name} className="max-w-full max-h-full object-contain filter drop-shadow-sm" />
                  </div>
                )}
                <div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${getBrandColor(detailsModal.comp, detailsModal.categoryName)}`}>{detailsModal.comp.brand}</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 leading-tight">{detailsModal.comp.name}</h3>
                </div>
              </div>

              {(() => {
                /* السعر بمتجره: «أقلّ سعر من مايكرولس» — لا رقمٌ بلا مصدر، ولا «0 ريال»
                   لقطعةٍ بلا سعر (BarraCuda 1TB بعد حذف عرضه الخاطئ) */
                const comp = detailsModal.comp;
                const best = cheapestOffer(comp.offers);
                const stores = cheapestStoreNames(comp);
                const power = detailsPower(comp, detailsModal.categoryName);
                return (
                  <div className={`grid ${power ? 'grid-cols-2' : 'grid-cols-1'} gap-3 mb-8`}>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-sm border border-slate-200 dark:border-slate-700/50">
                      <span className="block text-xs font-bold text-slate-500 mb-1">{best ? 'أقلّ سعر متاح' : 'السعر'}</span>
                      {best ? (
                        <>
                          <span className="font-black text-xl text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            {formatPrice(best.price)} <RiyalIcon size="h-5 w-5" colorClass="bg-emerald-700 dark:bg-emerald-400" />
                          </span>
                          <span className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 mt-1">من {stores.join('، ')}</span>
                        </>
                      ) : comp.price > 0 ? (
                        <>
                          <span className="font-black text-xl text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            {formatPrice(comp.price)} <RiyalIcon size="h-5 w-5" colorClass="bg-slate-500 dark:bg-slate-400" />
                          </span>
                          <span className="block text-[12px] font-bold text-amber-600 dark:text-amber-400 mt-1">خلصت من كل المتاجر — هذا آخر سعر سجّلناه</span>
                        </>
                      ) : (
                        <span className="block font-black text-base text-slate-500 dark:text-slate-400">غير متوفر — لا سعر مسجّل</span>
                      )}
                    </div>
                    {power && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-sm border border-slate-200 dark:border-slate-700/50">
                        <span className="block text-xs font-bold text-slate-500 mb-1">{power.label}</span>
                        <span className="font-black text-xl text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                          {power.watts}W
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {(() => {
                /* توافقها مع ما اخترتَه — بالدالّة نفسها التي تُعلّم قائمة الاختيار،
                   لا حكمٌ ثانٍ. ولا يُقال شيءٌ إن لم يُختر غيرها: لا شيء يُقارَن به. */
                const cat = detailsModal.categoryName;
                const others = Object.entries(selectedComponents).some(([k, v]) => k !== cat && !!v);
                if (!others) return null;
                const [c] = getComponentsWithCompatibility(cat, [detailsModal.comp]);
                return c.isCompatible ? (
                  <div className="mb-6 px-3.5 py-2.5 rounded-sm border border-emerald-500/40 bg-emerald-500/[0.07] text-[13px] font-bold text-emerald-800 dark:text-emerald-300">
                    ✓ تركب مع القطع اللي اخترتها
                  </div>
                ) : (
                  <div className="mb-6 px-3.5 py-2.5 rounded-sm border border-rose-300 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-900/20 text-[13px] font-bold text-rose-800 dark:text-rose-300 leading-relaxed">
                    ✗ ما تركب مع قطعك: {c.reason}. ولو اخترتها نشيل القطعة اللي تتعارض معها.
                  </div>
                );
              })()}

              {/* المتاجر بأسعارها وروابطها — القائمة نفسها التي في صفحة القطعة */}
              <div className="mb-8 -mt-4">
                <StoreOfferList
                  offers={(detailsModal.comp.offers ?? []) as any}
                  rowName={detailsModal.comp.name}
                  gpuSpecs={detailsModal.categoryName === 'GPU' ? (typeof detailsModal.comp.specs === 'string' ? JSON.parse(detailsModal.comp.specs) : detailsModal.comp.specs ?? {}) : undefined}
                />
              </div>

              <div className="mb-8">
                <h4 className="font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="text-cyan-600">⚙️</span> المواصفات الفنية
                </h4>
                {renderSpecs(detailsModal.comp.specs, detailsModal.categoryName)}
              </div>

              <SeriesPanel part={detailsModal.comp} category={detailsModal.categoryName} offers={(detailsModal.comp.offers ?? []) as any} />

              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="text-cyan-600">📄</span> نظرة عامة
                </h4>
                <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/30 p-4 rounded-sm border border-slate-200 dark:border-slate-700/30">
                  {detailsModal.comp.description
                    ? <RichDescription text={detailsModal.comp.description} />
                    : "ما عندنا وصف إضافي لهالقطعة حالياً."}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0B1120] flex gap-3 shrink-0">
              {/* الصفحة الكاملة: تاريخ السعر وتنبيهه وتقرير فرق السعر — في تبويبٍ
                  جديد فتبقى التجميعة كما هي */}
              <a
                href={`/components/${detailsModal.comp.id}`}
                target="_blank"
                rel="noopener"
                className="px-4 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-sm font-bold border border-slate-300 dark:border-slate-700 transition-colors text-center whitespace-nowrap"
              >
                الصفحة الكاملة ↗
              </a>
              {/* القطعة المختارة أصلاً لا تُعتمد مرّةً ثانية */}
              {selectedComponents[detailsModal.categoryName]?.id === detailsModal.comp.id ? (
                <span className="flex-1 py-3.5 text-center rounded-sm font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                  ✓ مختارة في تجميعتك
                </span>
              ) : (
                <button
                  onClick={() => { handleSelect(detailsModal.categoryName, detailsModal.comp.id); setDetailsModal(null); }}
                  className="flex-1 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-sm font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                >
                  اعتماد القطعة
                </button>
              )}
            </div>
          </div>
        </div>
      ), document.body)}

      {/* شريط الملخص العائم للجوال — في body لما سبق: داخل الحاوية يلتصق بأسفلها لا بأسفل الشاشة */}
      {result.status === 'success' && createPortal((
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:hidden flex justify-between items-center animate-in slide-in-from-bottom-full duration-300">
          <div className="flex flex-col">
            <span className="text-[12px] font-black text-slate-500">التكلفة الإجمالية</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg flex items-center gap-1">
              {formatTotal(result.totalPrice)} <RiyalIcon size="h-4 w-4" />
            </span>
            {/* المجموع يحسب سعر القطعة النافدة كما هو — فيُقال ذلك تحته، لا في بطاقتها وحدها
                (تجربة المستخدمين 2026-10-17: صندوقٌ نافد دخل المجموع بلا تنبيه في الشريط) */}
            {(() => {
              const n = Object.values(selectedComponents).filter((c) => c && !isAvailable(c)).length;
              return n > 0 ? (
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                  ⚠ يشمل {n === 1 ? 'قطعةً غير متوفّرة' : `${n} قطع غير متوفّرة`} بآخر سعر
                </span>
              ) : null;
            })()}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCopyLink}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-sm font-bold border border-slate-200 dark:border-slate-700 shadow-sm"
              title="نسخ الرابط"
              aria-label="نسخ رابط التجميعة"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </button>
            <button 
              onClick={handleSaveBuildClick} 
              className="px-6 py-2.5 bg-cyan-600 active:bg-cyan-700 text-white text-sm font-bold rounded-sm shadow-md"
            >
              حفظ
            </button>
          </div>
        </div>
      ), document.body)}

      {/* نافذة حفظ التجميعة — في body لما سبق في نافذة التفاصيل */}
      {saveModalOpen && createPortal((
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0F172A] rounded-sm w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0B1120]/60 backdrop-blur-sm shrink-0">
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-5 bg-cyan-600 rounded-full"></span>
                {editModeId ? 'تحديث التجميعة' : 'حفظ التجميعة'}
              </h2>
              <button onClick={() => setSaveModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors">
                <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                اسم التجميعة:
              </label>
              <input
                type="text"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                placeholder="مثال: تجميعة الألعاب، تجميعة المونتاج..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm outline-none focus:ring-2 focus:ring-cyan-500/50 text-slate-900 dark:text-white font-medium"
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-3 font-medium">
                تقدر ترجع لها بعدين وتعدّلها من صفحة حسابك.
              </p>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0B1120] flex gap-3">
              <button 
                onClick={() => setSaveModalOpen(false)} 
                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-sm font-bold transition-all"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmSaveBuild} 
                disabled={isSaving || !buildName.trim()}
                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-sm font-bold transition-all shadow-md shadow-cyan-500/20 flex justify-center items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    لحظة، نحفظ...
                  </>
                ) : (
                  'احفظ'
                )}
              </button>
            </div>
          </div>
        </div>
      ), document.body)}

    </div>
  );
}