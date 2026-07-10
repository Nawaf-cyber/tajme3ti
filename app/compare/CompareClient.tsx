'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isComponentAvailable } from '../../lib/availability';
import UseInBuildModal from './UseInBuildModal';
import CompareActions from './CompareActions';
import BuyCell from './BuyCell';

type Comp = any;

/* ============ أدوات ============ */

const RiyalIcon = ({ size = 'h-4 w-4', colorClass = 'bg-emerald-600 dark:bg-emerald-400' }: { size?: string; colorClass?: string }) => (
  <div
    className={`${size} ${colorClass} inline-block shrink-0`}
    style={{
      maskImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1124.14 1256.39'%3E%3Cpath d='M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z'/%3E%3Cpath d='M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.28-62.16c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.86c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-25.24,73.27-51.67l68.35-104.32c7.27-11.68,11.11-25.15,11.11-38.89v-160.18l132.25-28.11v285.99c50.67-28.45,95.67-66.32,132.25-110.99v-203.42l292.28-62.16Z'/%3E%3C/svg%3E\")",
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
    }}
  />
);

// ألوان العلامات التجارية
const brandColor = (brand: string) => {
  const b = (brand || '').toLowerCase();
  if (b.includes('nvidia')) return 'text-lime-500';
  if (b.includes('amd')) return 'text-red-500';
  if (b.includes('intel')) return 'text-blue-500';
  return 'text-slate-500 dark:text-slate-400';
};

/* ---- توحيد المواصفات ---- */
const normKey = (k: string) => k.toLowerCase().replace(/[\s_-]/g, '');

const SPEC_LABELS: Record<string, string> = {
  // معالجات
  socket: 'المقبس',
  cores: 'الأنوية',
  threads: 'الخيوط',
  baseclock: 'التردد الأساسي',
  boostclock: 'التردد الأقصى',
  l3cache: 'ذاكرة الكاش L3',
  pcores: 'أنوية الأداء',
  performancecores: 'أنوية الأداء',
  ecores: 'أنوية الكفاءة',
  efficientcores: 'أنوية الكفاءة',
  graphics: 'الرسوميات المدمجة',
  integratedgraphics: 'الرسوميات المدمجة',
  architecture: 'المعمارية',
  memorysupport: 'الذاكرة المدعومة',

  // كروت شاشة
  vram: 'ذاكرة الكرت',
  memorytype: 'نوع ذاكرة الكرت',
  memorybus: 'ناقل الذاكرة',
  memoryspeed: 'سرعة الذاكرة',
  powerconnectors: 'موصّلات الطاقة',
  length: 'الطول',
  lengthmm: 'الطول',

  // لوحات أم
  chipset: 'الشيبست',
  ramtype: 'نوع الذاكرة المدعومة',
  maxram: 'أقصى ذاكرة',
  m2slots: 'فتحات M.2',
  pcieversion: 'إصدار PCIe',

  // ذاكرة
  capacity: 'السعة',
  speed: 'السرعة',
  kit: 'الطقم',
  profile: 'ملف التعريف',
  caslatency: 'زمن الوصول',

  // تخزين
  interface: 'الواجهة',
  readspeed: 'سرعة القراءة',
  writespeed: 'سرعة الكتابة',

  // مزوّد طاقة
  wattage: 'القدرة',
  rating: 'شهادة الكفاءة',
  modularity: 'الكابلات',
  modular: 'الكابلات',

  // كيسات
  form: 'الحجم',
  formfactor: 'الحجم',
  fans: 'المراوح',
  includedfans: 'المراوح',
  sidepanel: 'اللوح الجانبي',
  sidepanels: 'اللوح الجانبي',
  verticalgpu: 'تركيب عمودي للكرت',
  verticalgpumount: 'تركيب عمودي للكرت',
  gpumount: 'تركيب عمودي للكرت',
  maxgpulength: 'أقصى طول للكرت',
  radiatorsupport: 'دعم الرادييتر',
  coolingmodes: 'أنماط التبريد',
  airflow: 'تدفّق الهواء',
  acoustics: 'العزل الصوتي',
  cablemanagement: 'ترتيب الكابلات',
  frontpanel: 'اللوح الأمامي',
  dualchamber: 'غرفتان منفصلتان',
  pcieriser: 'كابل PCIe Riser',
  glass: 'الزجاج',
  handles: 'المقابض',
  screen: 'شاشة مدمجة',
  storage: 'خانات التخزين',
  design: 'التصميم',

  // مشترك بين الفئات
  type: 'النوع',
  ports: 'المنافذ',
  color: 'اللون',
  rgb: 'إضاءة RGB',
};

const ROW_ORDER = [
  'المقبس', 'المعمارية', 'الأنوية', 'أنوية الأداء', 'أنوية الكفاءة', 'الخيوط',
  'التردد الأساسي', 'التردد الأقصى', 'ذاكرة الكاش L3', 'الرسوميات المدمجة',
  'ذاكرة الكرت', 'نوع ذاكرة الكرت', 'ناقل الذاكرة', 'سرعة الذاكرة', 'موصّلات الطاقة',
  'الشيبست', 'نوع الذاكرة المدعومة', 'أقصى ذاكرة', 'فتحات M.2', 'إصدار PCIe',
  'النوع', 'السعة', 'السرعة', 'الطقم', 'زمن الوصول', 'ملف التعريف',
  'الواجهة', 'سرعة القراءة', 'سرعة الكتابة',
  'القدرة', 'شهادة الكفاءة', 'الكابلات',
  'الحجم', 'المراوح', 'دعم الرادييتر', 'أنماط التبريد', 'أقصى طول للكرت',
  'تركيب عمودي للكرت', 'كابل PCIe Riser', 'غرفتان منفصلتان',
  'اللوح الجانبي', 'اللوح الأمامي', 'الزجاج', 'تدفّق الهواء', 'العزل الصوتي',
  'ترتيب الكابلات', 'خانات التخزين', 'المقابض', 'شاشة مدمجة', 'التصميم',
  'المنافذ', 'الطول', 'الذاكرة المدعومة', 'اللون', 'إضاءة RGB',
];

const specLabel = (key: string) => SPEC_LABELS[normKey(key)] ?? key;

const HIGHER_IS_BETTER = [
  'الأنوية', 'أنوية الأداء', 'أنوية الكفاءة', 'الخيوط',
  'التردد الأساسي', 'التردد الأقصى', 'ذاكرة الكاش L3',
  'ذاكرة الكرت', 'ناقل الذاكرة', 'سرعة الذاكرة',
  'السعة', 'السرعة', 'أقصى ذاكرة', 'فتحات M.2',
  'سرعة القراءة', 'سرعة الكتابة', 'القدرة',
  'المراوح', 'أقصى طول للكرت',
];
const LOWER_IS_BETTER = ['زمن الوصول', 'الطول'];

const parseNum = (v: any): number | null => {
  if (v == null) return null;
  const m = String(v).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
};

const compareDirection = (label: string): 'higher' | 'lower' | null => {
  if (LOWER_IS_BETTER.includes(label)) return 'lower';
  if (HIGHER_IS_BETTER.includes(label)) return 'higher';
  return null;
};

/* ============ المكوّن ============ */

export default function CompareClient({
  selected,
  available,
  categories,
  starterComponents,
  activeCategoryId,
}: {
  selected: Comp[];
  available: Comp[];
  categories: any[];
  starterComponents: Comp[];
  activeCategoryId: string | null;
}) {
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState<string>(activeCategoryId ?? '');
  // القطعة المراد إدراجها في تجميعة محفوظة (null = النافذة مغلقة)
  const [buildTarget, setBuildTarget] = useState<Comp | null>(null);
  // مرجع منطقة التصدير
  const exportRef = useRef<HTMLDivElement | null>(null);

  // عمود مسحوب حالياً (index) — للسحب على سطح المكتب
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const ids = selected.map((c) => c.id);

  /* ---- تحديث الرابط ---- */
  const updateUrl = (newIds: string[]) => {
    if (newIds.length === 0) router.push('/compare');
    else router.push(`/compare?ids=${newIds.join(',')}`);
  };

  const addComponent = (id: string) => {
    if (ids.length >= 3) return;
    updateUrl([...ids, id]);
    setPickerOpen(false);
    search && setSearch('');
  };

  const removeComponent = (id: string) => updateUrl(ids.filter((x) => x !== id));

  /* ---- إعادة ترتيب الأعمدة ---- */
  // الترتيب مصدره الوحيد هو الرابط (?ids=). تحريك عمود = تحريك معرّفه.
  const moveColumn = (from: number, to: number) => {
    if (from === to || to < 0 || to >= ids.length) return;
    const next = [...ids];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateUrl(next);
  };

  const onDragStart = (i: number) => setDragIdx(i);
  const onDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };
  const onDrop = (i: number) => {
    if (dragIdx !== null) moveColumn(dragIdx, i);
    onDragEnd();
  };

  /* ---- صفوف المقارنة ---- */
  const specRows = useMemo(() => {
    if (selected.length === 0) return [];
    const labels = new Set<string>();
    selected.forEach((c) => {
      const sp = typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs || {};
      Object.keys(sp).forEach((k) => labels.add(specLabel(k)));
    });
    return Array.from(labels).sort((a, b) => {
      const ia = ROW_ORDER.indexOf(a);
      const ib = ROW_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b, 'ar');
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [selected]);

  const rowData = (label: string) => {
    const values = selected.map((c) => {
      const sp = typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs || {};
      const key = Object.keys(sp).find((k) => specLabel(k) === label);
      return key ? sp[key] : null;
    });
    const dir = compareDirection(label);
    let winnerIdx: number[] = [];
    if (dir && selected.length > 1) {
      const nums = values.map(parseNum);
      const valid = nums.filter((n): n is number => n != null);
      if (valid.length > 1) {
        const best = dir === 'higher' ? Math.max(...valid) : Math.min(...valid);
        winnerIdx = nums.map((n, i) => (n === best ? i : -1)).filter((i) => i >= 0);
        if (winnerIdx.length === valid.length) winnerIdx = [];
      }
    }
    return { values, winnerIdx };
  };

  const tdpRow = () => {
    const values = selected.map((c) => (c.tdpWattage > 0 ? `${c.tdpWattage}W` : null));
    const nums = selected.map((c) => (c.tdpWattage > 0 ? c.tdpWattage : null));
    const valid = nums.filter((n): n is number => n != null);
    let winnerIdx: number[] = [];
    if (valid.length > 1) {
      const best = Math.min(...valid);
      winnerIdx = nums.map((n, i) => (n === best ? i : -1)).filter((i) => i >= 0);
      if (winnerIdx.length === valid.length) winnerIdx = [];
    }
    return { values, winnerIdx };
  };

  const priceRow = () => {
    const nums = selected.map((c) => (c.price > 0 ? c.price : null));
    const valid = nums.filter((n): n is number => n != null);
    let winnerIdx: number[] = [];
    if (valid.length > 1) {
      const best = Math.min(...valid);
      winnerIdx = nums.map((n, i) => (n === best ? i : -1)).filter((i) => i >= 0);
      if (winnerIdx.length === valid.length) winnerIdx = [];
    }
    return { nums, winnerIdx };
  };

  const VALUE_EXPONENT = 2.0;
  const valueScore = (c: Comp): number | null =>
    c.performanceTier && c.price > 0
      ? Math.pow(c.performanceTier, VALUE_EXPONENT) / c.price
      : null;

  const analysis = useMemo(() => {
    if (selected.length < 2) {
      return { bestValueIdx: -1, topPerfIdx: -1, cheapestIdx: -1, lowTdpIdx: -1, minPrice: 0 };
    }
    const scores = selected.map(valueScore);
    const tiers = selected.map((c) => c.performanceTier ?? 0);
    const prices = selected.map((c) => (c.price > 0 ? c.price : null));
    const tdps = selected.map((c) => (c.tdpWattage > 0 ? c.tdpWattage : null));

    const validScores = scores.filter((s): s is number => s != null);
    const validPrices = prices.filter((p): p is number => p != null);
    const validTdps = tdps.filter((t): t is number => t != null);

    const topTier = Math.max(...tiers);
    const isTierUnique = tiers.filter((t) => t === topTier).length === 1;

    return {
      bestValueIdx: validScores.length > 1 ? scores.indexOf(Math.max(...validScores)) : -1,
      topPerfIdx: isTierUnique && topTier > 0 ? tiers.indexOf(topTier) : -1,
      cheapestIdx: validPrices.length > 1 ? prices.indexOf(Math.min(...validPrices)) : -1,
      lowTdpIdx: validTdps.length > 1 ? tdps.indexOf(Math.min(...validTdps)) : -1,
      minPrice: validPrices.length ? Math.min(...validPrices) : 0,
    };
  }, [selected]);

  const summary = useMemo(() => {
    if (selected.length < 2) return [];
    const { bestValueIdx, topPerfIdx, cheapestIdx, lowTdpIdx } = analysis;
    const out: { name: string; text: string }[] = [];

    selected.forEach((c, i) => {
      const parts: string[] = [];

      if (i === topPerfIdx) {
        const others = selected.filter((_, j) => j !== i).map((x) => x.price).filter((p) => p > 0);
        const cheapestOther = others.length ? Math.min(...others) : 0;
        parts.push(
          cheapestOther && c.price > cheapestOther
            ? `أعلى أداء في المقارنة، لكنه الأغلى بفارق ${(c.price - cheapestOther).toLocaleString('en-US')} ريال`
            : 'أعلى أداء في المقارنة'
        );
      }
      if (i === bestValueIdx && i !== topPerfIdx) parts.push('أفضل قيمة مقابل السعر');
      if (i === cheapestIdx && i !== bestValueIdx && i !== topPerfIdx) parts.push('الأوفر سعراً');

      if (i === lowTdpIdx && c.tdpWattage > 0) {
        const others = selected.filter((_, j) => j !== i).map((x) => x.tdpWattage).filter((t) => t > 0);
        if (others.length) parts.push(`الأقل استهلاكاً بـ ${Math.min(...others) - c.tdpWattage} واط`);
      }

      if (parts.length) out.push({ name: c.name, text: parts.join('، و') });
    });
    return out;
  }, [selected, analysis]);

  const pickerList = useMemo(() => {
    const source = activeCategoryId ? available : starterComponents;
    const filtered = source.filter((c: Comp) => {
      const matchSearch = `${c.brand} ${c.name}`.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategoryId ? true : !pickerCategory || c.categoryId === pickerCategory;
      return matchSearch && matchCat;
    });
    return filtered.slice(0, 40);
  }, [available, starterComponents, search, pickerCategory, activeCategoryId]);

  const categoryName = selected[0]?.category?.name ?? '';

  /* ============ العرض ============ */

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ===== الرأس ===== */}
        <div className="text-center mb-12">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 bg-cyan-400/25 blur-2xl rounded-full"></div>
            <svg viewBox="0 0 24 24" fill="currentColor" className="relative w-full h-full text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
              <path d="M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-tight">
            قارن القطع{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-300">
              جنباً إلى جنب
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            اختر حتى 3 قطع من نفس الفئة وقارن المواصفات والأسعار والأداء دفعة واحدة، لتختار الأنسب بثقة.
          </p>

          {categoryName && (
            <div className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] font-black text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 px-3 py-1.5 rounded-sm uppercase tracking-widest">
              الفئة: {categoryName}
            </div>
          )}
        </div>

        {/* ===== حالة الفراغ ===== */}
        {selected.length === 0 ? (
          <div className="max-w-md mx-auto text-center bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-10">
            <svg className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-700 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">ابدأ المقارنة</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-7 font-medium">
              أضف قطعتين على الأقل من نفس الفئة لتبدأ المقارنة.
            </p>
            <button
              onClick={() => setPickerOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-sm transition-all shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 text-sm"
            >
              اختر أول قطعة
            </button>
          </div>
        ) : (
          <>
          {/* ===== شريط الأدوات ===== */}
          <div data-noexport className="flex items-center justify-end mb-4">
            <CompareActions targetRef={exportRef} names={selected.map((c) => c.name)} />
          </div>

          {/* ===== منطقة التصدير ===== */}
          <div ref={exportRef}>

          {/* ===== جدول المقارنة ===== */}
          <div data-export-scroll className="bg-white/70 dark:bg-[#0F172A]/50 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm overflow-x-auto shadow-sm">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  {/* خانة فارغة (عمود التسميات) */}
                  <th className="w-[140px] md:w-[180px] border-b border-slate-200 dark:border-slate-800"></th>

                  {/* أعمدة القطع */}
                  {selected.map((c, colIdx) => {
                    const avail = isComponentAvailable(c);
                    const isBest = colIdx === analysis.bestValueIdx;
                    return (
                      <th
                        key={c.id}
                        draggable
                        onDragStart={() => onDragStart(colIdx)}
                        onDragEnd={onDragEnd}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setOverIdx(colIdx);
                        }}
                        onDrop={() => onDrop(colIdx)}
                        className={`p-4 border-b border-r border-slate-200 dark:border-slate-800 align-top relative group/col transition-all cursor-grab active:cursor-grabbing ${
                          isBest ? 'bg-cyan-500/[0.07] dark:bg-cyan-400/[0.06]' : ''
                        } ${dragIdx === colIdx ? 'opacity-40' : ''} ${
                          overIdx === colIdx && dragIdx !== null && dragIdx !== colIdx
                            ? 'ring-2 ring-inset ring-cyan-500/60'
                            : ''
                        }`}
                      >
                        {/* شارة أفضل قيمة */}
                        {isBest && (
                          <div className="absolute -top-px left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                        )}
                        {isBest && (
                          <div className="mb-2 font-mono text-[9px] font-black text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 rounded-sm py-1 uppercase tracking-widest">
                            أفضل قيمة
                          </div>
                        )}
                        
                        {/* زر الإزالة المطور */}
                        <button
                          data-noexport
                          onClick={() => removeComponent(c.id)}
                          aria-label="إزالة القطعة"
                          title="إزالة القطعة"
                          className="absolute top-3 left-3 z-10 w-7 h-7 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-white hover:bg-red-500 hover:border-red-500 dark:hover:bg-red-600 dark:hover:border-red-600 rounded-full transition-all shadow-sm opacity-100 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>

                        {/* ===== أسهم التحريك (تعمل باللمس، بعكس السحب) ===== */}
                        {selected.length > 1 && (
                          <div data-noexport className="absolute top-3 right-3 z-10 flex gap-0.5">
                            {/* في RTL: "يمين" = فهرس أصغر */}
                            <button
                              onClick={() => moveColumn(colIdx, colIdx - 1)}
                              disabled={colIdx === 0}
                              aria-label="حرّك يميناً"
                              title="حرّك يميناً"
                              className="w-6 h-6 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-cyan-600 hover:border-cyan-500/60 disabled:opacity-30 disabled:pointer-events-none rounded-sm transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => moveColumn(colIdx, colIdx + 1)}
                              disabled={colIdx === selected.length - 1}
                              aria-label="حرّك يساراً"
                              title="حرّك يساراً"
                              className="w-6 h-6 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-cyan-600 hover:border-cyan-500/60 disabled:opacity-30 disabled:pointer-events-none rounded-sm transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          </div>
                        )}

                        <Link href={`/components/${c.id}`} className="block group/link mt-2">
                          <div className="h-20 md:h-24 bg-white rounded-sm mb-3 flex items-center justify-center p-2 border border-slate-100 dark:border-slate-800">
                            <img
                              src={c.imageUrl || `/images/${c.categoryId}/boxed.png`}
                              alt={c.name}
                              className="max-w-full max-h-full object-contain mix-blend-multiply group-hover/link:scale-105 transition-transform"
                            />
                          </div>
                          <div className={`font-mono text-[9px] font-black uppercase tracking-wider mb-1 ${brandColor(c.brand)}`}>
                            {c.brand}
                          </div>
                          <div className="text-xs md:text-sm font-black text-slate-900 dark:text-white leading-snug group-hover/link:text-cyan-600 dark:group-hover/link:text-cyan-400 transition-colors">
                            {c.name}
                          </div>
                        </Link>

                        {!avail && (
                          <div className="mt-2 text-[9px] font-black text-red-600 dark:text-red-500 flex items-center justify-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            غير متوفر
                          </div>
                        )}
                      {/* ===== زر: استخدم في تجميعتي ===== */}
                        <button
                          data-noexport
                          onClick={() => setBuildTarget(c)}
                          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-2 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 rounded-sm transition-all active:scale-[0.98] group/use"
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-[10px] md:text-[11px] font-black whitespace-nowrap">
                            استخدم في تجميعتي
                          </span>
                        </button>
                      </th>
                    );
                  })}

                  {/* عمود الإضافة */}
                  {selected.length < 3 && (
                    <th data-noexport className="p-4 border-b border-slate-200 dark:border-slate-800 align-middle" style={{ borderRight: '1px dashed rgba(34,211,238,0.3)' }}>
                      <button
                        onClick={() => setPickerOpen(true)}
                        className="flex flex-col items-center justify-center gap-2 w-full py-6 group/add"
                      >
                        <div className="w-11 h-11 border border-dashed border-cyan-500/50 rounded-sm flex items-center justify-center text-cyan-500 text-2xl font-light group-hover/add:bg-cyan-50 dark:group-hover/add:bg-cyan-950/30 group-hover/add:border-cyan-500 transition-colors">
                          +
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover/add:text-cyan-600 dark:group-hover/add:text-cyan-400 transition-colors">
                          أضف قطعة
                        </span>
                      </button>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {/* صفوف المواصفات */}
                {specRows.map((label, rowIdx) => {
                  const { values, winnerIdx } = rowData(label);
                  return (
                    <tr key={label} className={rowIdx % 2 === 0 ? 'bg-cyan-500/[0.03]' : ''}>
                      <td className="py-3.5 px-4 text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        {label}
                      </td>
                      {values.map((v, i) => (
                        <td
                          key={i}
                          className={`py-3.5 px-3 text-center text-xs md:text-sm font-black border-b border-r border-slate-200 dark:border-slate-800 font-mono ${
                            i === analysis.bestValueIdx ? 'bg-cyan-500/[0.05] dark:bg-cyan-400/[0.04] ' : ''
                          }${
                            winnerIdx.includes(i)
                              ? 'text-cyan-600 dark:text-cyan-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                          dir="ltr"
                        >
                          {v ?? <span className="text-slate-300 dark:text-slate-700">—</span>}
                          {winnerIdx.includes(i) && <span className="text-amber-400 mr-1">★</span>}
                        </td>
                      ))}
                      {selected.length < 3 && (
                        <td className="border-b border-slate-200 dark:border-slate-800" style={{ borderRight: '1px dashed rgba(34,211,238,0.15)' }}></td>
                      )}
                    </tr>
                  );
                })}

                {/* صف الاستهلاك */}
                {selected.some((c) => c.tdpWattage > 0) && (() => {
                  const { values, winnerIdx } = tdpRow();
                  return (
                    <tr className={specRows.length % 2 === 0 ? 'bg-cyan-500/[0.03]' : ''}>
                      <td className="py-3.5 px-4 text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        الاستهلاك
                      </td>
                      {values.map((v, i) => (
                        <td
                          key={i}
                          className={`py-3.5 px-3 text-center text-xs md:text-sm font-black border-b border-r border-slate-200 dark:border-slate-800 font-mono ${
                            i === analysis.bestValueIdx ? 'bg-cyan-500/[0.05] dark:bg-cyan-400/[0.04] ' : ''
                          }${
                            winnerIdx.includes(i) ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-900 dark:text-white'
                          }`}
                          dir="ltr"
                        >
                          {v ?? <span className="text-slate-300 dark:text-slate-700">—</span>}
                          {winnerIdx.includes(i) && <span className="text-amber-400 mr-1">★</span>}
                        </td>
                      ))}
                      {selected.length < 3 && <td className="border-b border-slate-200 dark:border-slate-800" style={{ borderRight: '1px dashed rgba(34,211,238,0.15)' }}></td>}
                    </tr>
                  );
                })()}

                {/* صف مستوى الأداء */}
                {selected.some((c) => c.performanceTier) && (
                  <tr className="bg-cyan-500/[0.03]">
                    <td className="py-3.5 px-4 text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      مستوى الأداء
                    </td>
                    {selected.map((c, i) => (
                      <td key={c.id} className={`py-3.5 px-3 text-center border-b border-r border-slate-200 dark:border-slate-800 ${i === analysis.bestValueIdx ? 'bg-cyan-500/[0.05] dark:bg-cyan-400/[0.04]' : ''}`}>
                        <span className="text-sm tracking-widest" dir="ltr">
                          <span className="text-cyan-500 dark:text-cyan-400">{'●'.repeat(c.performanceTier ?? 0)}</span>
                          <span className="text-slate-200 dark:text-slate-700">{'●'.repeat(5 - (c.performanceTier ?? 0))}</span>
                        </span>
                      </td>
                    ))}
                    {selected.length < 3 && <td className="border-b border-slate-200 dark:border-slate-800" style={{ borderRight: '1px dashed rgba(34,211,238,0.15)' }}></td>}
                  </tr>
                )}

                {/* صف السعر */}
                {(() => {
                  const { nums, winnerIdx } = priceRow();
                  return (
                    <tr>
                      <td className="py-4 px-4 text-sm font-black text-slate-900 dark:text-white">السعر</td>
                      {nums.map((p, i) => {
                        const delta = p && analysis.minPrice && p > analysis.minPrice ? p - analysis.minPrice : 0;
                        const cheapestName = analysis.cheapestIdx >= 0 ? selected[analysis.cheapestIdx]?.name : '';
                        return (
                        <td key={i} className={`py-4 px-3 text-center border-r border-slate-200 dark:border-slate-800 ${i === analysis.bestValueIdx ? 'bg-cyan-500/[0.05] dark:bg-cyan-400/[0.04]' : ''}`}>
                          {p ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="inline-flex items-center gap-1 font-mono font-black text-lg md:text-xl text-emerald-600 dark:text-emerald-400">
                                {p.toLocaleString('en-US')}
                                <RiyalIcon size="h-4 w-4" />
                                {winnerIdx.includes(i) && <span className="text-amber-400 text-xs">★</span>}
                              </span>
                              {delta > 0 && cheapestName && (
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-tight">
                                  أغلى بـ <span className="font-mono text-red-500 dark:text-red-400">{delta.toLocaleString('en-US')}</span> ريال من {cheapestName}
                                </span>
                              )}
                              {i === analysis.cheapestIdx && selected.length > 1 && (
                                <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70">الأوفر</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700">—</span>
                          )}
                        </td>
                        );
                      })}
                      {selected.length < 3 && <td style={{ borderRight: '1px dashed rgba(34,211,238,0.15)' }}></td>}
                    </tr>
                  );
                })()}

                {/* ===== صف الشراء ===== */}
                <tr data-noexport className="bg-slate-50/60 dark:bg-slate-900/30">
                  <td className="py-4 px-4 text-sm font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 align-top">
                    الشراء
                    <div className="mt-1 font-mono text-[9px] font-normal text-slate-400 leading-tight">
                      روابط أفلييت
                    </div>
                  </td>
                  {selected.map((c, i) => (
                    <td
                      key={c.id}
                      className={`py-4 px-3 border-t border-r border-slate-200 dark:border-slate-800 align-top ${
                        i === analysis.bestValueIdx ? 'bg-cyan-500/[0.05] dark:bg-cyan-400/[0.04]' : ''
                      }`}
                    >
                      <BuyCell component={c} />
                    </td>
                  ))}
                  {selected.length < 3 && (
                    <td
                      className="border-t border-slate-200 dark:border-slate-800"
                      style={{ borderRight: '1px dashed rgba(34,211,238,0.15)' }}
                    ></td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

        {/* ===== الخلاصة ===== */}
        {summary.length > 0 && (
          <div className="mt-8 bg-white/70 dark:bg-[#0F172A]/50 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-5">
              <span className="w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
              الخلاصة
            </h2>

            <ul className="space-y-3">
              {summary.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-black text-slate-900 dark:text-white">{s.name}</span>
                    {' — '}
                    {s.text}.
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 font-mono text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
              خلاصة محسوبة من مواصفات القطع وأسعارها اللحظية — لا من رأي محرّر.
            </p>
          </div>
        )}

          </div>{/* /منطقة التصدير */}
          </>
        )}

        {/* ===== ملاحظة ختامية ===== */}
        {selected.length >= 2 && (
          <div className="text-center mt-8">
            <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
              <span className="text-amber-400">★</span>
              يشير إلى الأفضل في هذا الصف · العمود المميّز هو أفضل قيمة · اسحب الأعمدة أو استخدم الأسهم لإعادة الترتيب
            </p>
          </div>
        )}

      </div>

      {/* ===== نافذة اختيار القطعة ===== */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0F172A] border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* رأس النافذة */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {activeCategoryId ? `اختر قطعة من فئة ${categoryName}` : 'اختر أول قطعة'}
                </h3>
                <button
                  onClick={() => setPickerOpen(false)}
                  aria-label="إغلاق"
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* فلترة الفئة (فقط عند بدء مقارنة جديدة) */}
              {!activeCategoryId && (
                <select
                  value={pickerCategory}
                  onChange={(e) => setPickerCategory(e.target.value)}
                  className="w-full mb-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-sm py-2.5 px-3 text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 outline-none"
                >
                  <option value="">كل الفئات</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              )}

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم القطعة أو الشركة..."
                autoFocus
                className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-sm py-2.5 px-3 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 outline-none"
              />
            </div>

            {/* قائمة القطع */}
            <div className="overflow-y-auto flex-1 p-3">
              {pickerList.length === 0 ? (
                <p className="text-center py-10 text-sm text-slate-500 font-medium">لا توجد نتائج مطابقة.</p>
              ) : (
                <div className="space-y-1.5">
                  {pickerList.map((c: Comp) => (
                    <button
                      key={c.id}
                      onClick={() => addComponent(c.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-sm hover:bg-cyan-50 dark:hover:bg-cyan-950/20 border border-transparent hover:border-cyan-500/30 transition-colors text-right group"
                    >
                      <div className="w-12 h-12 bg-white rounded-sm shrink-0 flex items-center justify-center p-1 border border-slate-100 dark:border-slate-800">
                        <img
                          src={c.imageUrl || '/images/placeholder.png'}
                          alt={c.name}
                          className="max-w-full max-h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className={`font-mono text-[9px] font-black uppercase ${brandColor(c.brand)}`}>{c.brand}</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {c.name}
                        </div>
                      </div>
                      {c.price > 0 && (
                        <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                          {c.price} <RiyalIcon size="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* تذييل النافذة */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="font-mono text-[10px] text-slate-400">
                {pickerList.length} قطعة متاحة · المقارنة داخل نفس الفئة فقط
              </p>
            </div>
          </div>
        </div>
      )}

    {/* ===== نافذة: استخدم في تجميعتي ===== */}
      {buildTarget && (
        <UseInBuildModal
          component={buildTarget}
          onClose={() => setBuildTarget(null)}
        />
      )}

    </div>
  );
}