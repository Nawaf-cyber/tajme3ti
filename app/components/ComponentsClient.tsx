"use client";
import { useState, useMemo, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { brandColor } from '../../lib/brand';
import { isAvailable, offerDeal, type Offer } from '../../lib/stores';
import { formatPrice } from '../../lib/price';
import { specBadges as getSpecBadges } from '../../lib/spec-badges';
import { track } from '../../lib/track';
import SuggestPartCard from '../../components/SuggestPartCard';
import RiyalSign from '../../components/RiyalSign';
import { productImage, IMAGE_FALLBACK } from '../../lib/image';
import { catMeta, CATEGORY_META } from '../../lib/category-meta';
import { partRatings, levelWord } from '../../lib/perf-rating';
import RatingMeter from '../../components/RatingMeter';
import { timeAgoAr } from '../../lib/time-ago';

/* ============ تصفّح القطع — شكل ز «شريط الفئات بالأعداد» (2026-10-29) ============
 *
 * الفلاتر صارت شريطاً فوق البطاقات بدل العمود الجانبي، فالبطاقات تأخذ عرض
 * الصفحة كلّه (ثلاثة أعمدة). الفئات أزرارٌ بأعدادها الحقيقية تبدّل الشبكة
 * بنقرة، وكلّ بطاقة تقول من أوّل نظرة وين الأرخص وكم متجرٍ عنده القطعة.
 * على الجوال شريط الفئات صفٌّ يُمرَّر أفقياً، والبطاقات عمودٌ واحد.
 *
 * والمنطق (الفلاتر، الفرز، النافد إلى الذيل، العرض التدريجيّ، الوضع المقفول
 * على التخفيضات) كما كان — تغيّر الشكل لا الحساب. */

/* درجات فلتر الأداء: [أدنى مستوى، التسمية]. والكلمات من lib/perf-rating — هي نفسها على البطاقات */
const PERF_STEPS = [[0, 'الكل'], [3, `${levelWord(3)} فأعلى`], [4, `${levelWord(4)} فأعلى`], [5, levelWord(5)]] as const;

/* «متجر واحد» · «متجرين» · «3 متاجر» · «12 متجراً» */
const storesAr = (n: number) => (n === 1 ? 'متجر واحد' : n === 2 ? 'متجرين' : n <= 10 ? `${n} متاجر` : `${n} متجراً`);

const Mono = ({ children }: { children: ReactNode }) => <span className="font-mono tabular-nums" dir="ltr">{children}</span>;

/* ---- سطرا العروض على البطاقة ----
 * الرأس: «متوفر في متجر من 3» — كم متجرٍ يبيعها الآن من كم متجرٍ نرصدها عنده.
 * الذيل: المتجران التاليان بسعريهما (وفرقُهما إن كانا اثنين)، أو «نافد عند …». */
function offerLines(c: any): { avail: string; secondary: ReactNode; cheapestStore: string | null } {
  const rows: Offer[] = (c.offers || []).filter((o: Offer) => !!o.url);
  const live = rows.filter((o) => o.inStock && !!o.price).sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  const out = rows.filter((o) => !(o.inStock && !!o.price));
  const avail =
    rows.length === 0 ? ''
    : live.length === 0 ? 'غير متوفر حالياً'
    : rows.length === 1 ? 'عند متجر واحد'
    : live.length === rows.length ? `متوفر في ${storesAr(live.length)}`
    : `متوفر في ${live.length === 1 ? 'متجر' : storesAr(live.length)} من ${rows.length}`;
  let secondary: ReactNode = null;
  if (live.length > 1) {
    const others = live.slice(1, 3);
    secondary = (
      <>
        {others.map((o, i) => (
          <span key={o.storeId}>{i > 0 && ' · '}{o.store.name} <Mono>{formatPrice(o.price)}</Mono></span>
        ))}
        {live.length === 2 && <> · فرق <Mono>{formatPrice((live[1].price ?? 0) - (live[0].price ?? 0))}</Mono></>}
      </>
    );
  } else if (out.length > 0 && live.length > 0) {
    secondary = <>نافد عند {out.slice(0, 2).map((o) => o.store.name).join(' و')}</>;
  }
  return { avail, secondary, cheapestStore: live[0]?.store.name ?? null };
}

/* زرّ شريط الأدوات: مضغوطٌ سماويّ، وإلّا رماديّ بحدّ */
const tb = (on: boolean, extra = '') =>
  `flex items-center gap-1.5 px-3 py-2 rounded-sm text-[12px] font-bold border transition-all active:scale-95 whitespace-nowrap ${
    on
      ? 'bg-cyan-500 text-white dark:text-[#052e37] border-cyan-500 shadow-sm shadow-cyan-500/30'
      : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:border-cyan-400 dark:hover:border-cyan-600'
  } ${extra}`;

const CAT_ORDER = Object.keys(CATEGORY_META);
const catRank = (name: string) => { const i = CAT_ORDER.indexOf(name); return i < 0 ? 99 : i; };

/* ============ الوضع المقفول على التخفيضات ============
 * `dealsLocked` تُشغَّل من `/deals`: الفلتر لا يُلغى ولا يُعرض زرُّه، والترتيب
 * الافتراضي «الأكثر انخفاضاً». والبطاقة تبقى واحدة: نسخةٌ ثانية منها تعني
 * عيباً يُصلَح هنا ويعيش هناك. */
export default function ComponentsClient({
  components, categories, dealsLocked = false, initialCatId = 'all', storesCount = 0, updatedAt = null,
}: {
  components: any[];
  categories: any[];
  dealsLocked?: boolean;
  /** الفئة المفتوحة ابتداءً (?cat=GPU من بلاطات الرئيسية) */
  initialCatId?: string;
  storesCount?: number;
  /** آخر سحبٍ للأسعار — ISO */
  updatedAt?: string | null;
}) {
  const [search, setSearch] = useState('');

  /* ما يبحث عنه الزائر — يُسجَّل بعد سكوتٍ ثانيةً ونصف لا عند كلّ حرف،
     ويُشترط ثلاثةُ محارف: حرفان يعودان بنصف الكتالوج ولا يدلّان على قصد. */
  useEffect(() => {
    const q = search.trim();
    if (q.length < 3) return;
    const t = setTimeout(() => track('search', { label: q }), 1500);
    return () => clearTimeout(t);
  }, [search]);
  const [selectedCat, setSelectedCat] = useState(initialCatId);

  /* سقف شريط السعر يُشتقّ من أغلى قطعة ويُقرَّب لأعلى ألف — فلا يشيخ الرقم
     كلّما دخلت قطعة أغلى (ROG Astral RTX 5090 بـ٢٤٬١٤٣ كانت تختفي تحت سقف ٢٠٬٠٠٠) */
  const priceCeiling = useMemo(() => {
    const top = Math.max(0, ...components.map((c) => Number(c.price) || 0));
    return Math.max(1000, Math.ceil(top / 1000) * 1000);
  }, [components]);

  const [maxPrice, setMaxPrice] = useState(priceCeiling);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'discount' | 'power'>(dealsLocked ? 'discount' : 'newest');
  const [onlyDeals, setOnlyDeals] = useState(dealsLocked);

  /* فلتر الأداء — للمعالج والكرت وحدهما؛ والمستوى من lib/perf-rating نفسه الذي
     تعرضه البطاقة ويحكم به الباني. وللمعالج تقييمان فيختار الزائر أيّهما. */
  const [minLevel, setMinLevel] = useState(0);
  const [cpuUse, setCpuUse] = useState<0 | 1>(0);
  const perfCat = useMemo(() => {
    const name = categories.find((cat) => cat.id === selectedCat)?.name;
    return name === 'CPU' || name === 'GPU' ? (name as 'CPU' | 'GPU') : null;
  }, [categories, selectedCat]);
  const useIdx = perfCat === 'CPU' ? cpuUse : 0;

  /* نحسب الخصم والتقييم مرّة واحدة لكل قطعة — الدالتان مشتركتان مع صفحة المنتج */
  const withDeals = useMemo(
    () => components.map((c) => {
      const specs = typeof c.specs === 'string' ? (() => { try { return JSON.parse(c.specs); } catch { return {}; } })() : c.specs || {};
      return { ...c, _deal: offerDeal(c), _live: isAvailable(c), _ratings: partRatings(c.category?.name, c.name, specs) };
    }),
    [components],
  );

  const isFiltered = search !== '' || selectedCat !== 'all' || maxPrice !== priceCeiling || sortBy !== (dealsLocked ? 'discount' : 'newest') || (onlyDeals && !dealsLocked) || (perfCat != null && minLevel > 0);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCat('all');
    setMaxPrice(priceCeiling);
    setSortBy(dealsLocked ? 'discount' : 'newest');
    setOnlyDeals(dealsLocked);
    setMinLevel(0);
    setCpuUse(0);
  };

  /* تغيير الفئة يُسقط فلتر الأداء وترتيبه إن لم تعد الفئة معالجاً أو كرتاً */
  const handleCatChange = (id: string) => {
    setSelectedCat(id);
    const name = categories.find((cat) => cat.id === id)?.name;
    if (name !== 'CPU' && name !== 'GPU') {
      setMinLevel(0);
      if (sortBy === 'power') setSortBy(dealsLocked ? 'discount' : 'newest');
    }
  };

  /* ما يطابق البحث والسعر (وقفل التخفيضات) بلا فئة — لعدّادات أزرار الفئات */
  const preCat = useMemo(() => withDeals.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q);
    const matchPrice = c.price <= maxPrice;
    const matchDeal = !(onlyDeals || dealsLocked) || c._deal.pct > 0;
    return matchSearch && matchPrice && matchDeal;
  }), [withDeals, search, maxPrice, onlyDeals, dealsLocked]);

  /* عدّادات الفئات: ما ستراه لو ضغطت الزر، ضمن الفلاتر الحالية */
  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    preCat.forEach((c) => m.set(c.categoryId, (m.get(c.categoryId) || 0) + 1));
    return m;
  }, [preCat]);
  const orderedCats = useMemo(() => [...categories].sort((a, b) => catRank(a.name) - catRank(b.name)), [categories]);

  // الفلاتر الأساسية (بلا فلتر التخفيضات ولا الأداء) — نحتاجها لعدّاد الصفقات وعدّادات الأداء
  const prePerf = useMemo(() => withDeals.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q);
    const matchCat = selectedCat === 'all' || c.categoryId === selectedCat;
    const matchPrice = c.price <= maxPrice;
    return matchSearch && matchCat && matchPrice;
  }), [withDeals, search, selectedCat, maxPrice]);

  const baseFiltered = useMemo(
    () => (!perfCat || minLevel === 0 ? prePerf : prePerf.filter((c) => (c._ratings[useIdx]?.level ?? 0) >= minLevel)),
    [prePerf, perfCat, minLevel, useIdx],
  );

  const perfCounts = useMemo(
    () => PERF_STEPS.map(([min]) => (min === 0 ? prePerf.length : prePerf.filter((c) => (c._ratings[useIdx]?.level ?? 0) >= min).length)),
    [prePerf, useIdx],
  );

  const dealsCount = useMemo(() => baseFiltered.filter((c) => c._deal.pct > 0).length, [baseFiltered]);

  const filtered = useMemo(() => {
    const list = (onlyDeals || dealsLocked) ? baseFiltered.filter((c) => c._deal.pct > 0) : [...baseFiltered];
    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'discount') {
      list.sort((a, b) =>
        (b._deal.pct - a._deal.pct) ||
        ((b._deal.listPrice ?? b.price) - b.price) - ((a._deal.listPrice ?? a.price) - a.price),
      );
    } else if (sortBy === 'power') {
      const key = (c: any) => { const r = c._ratings[useIdx]; return r?.level != null ? r.level * 1000 + (r.value ?? 0) : -1; };
      list.sort((a, b) => key(b) - key(a));
    }
    /* النافد إلى الذيل — لا يُحذف ولا يُخفى، و`sort` مستقرّة فمفتاحٌ واحد يكفي */
    list.sort((a, b) => Number(b._live) - Number(a._live));
    return list;
  }, [baseFiltered, onlyDeals, sortBy, dealsLocked, useIdx]);

  /* عرض تدريجي: زرٌّ صريح لا تمريرٌ لانهائي (الأخير يمنع الوصول للفوتر ويُفقد موضعك عند الرجوع) */
  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, selectedCat, maxPrice, sortBy, onlyDeals, minLevel, cpuUse]);

  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visible.length;
  const updatedAgo = updatedAt ? timeAgoAr(updatedAt) : null;

  return (
    <div className="flex flex-col gap-4">

      {/* ===== الرأس: العنوان وسطره + البحث ===== */}
      <div className="flex items-end justify-between gap-5 flex-wrap">
        {!dealsLocked && (
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">تصفّح القطع</h1>
            <p className="mt-1.5 text-[11.5px] font-bold text-slate-500 dark:text-slate-400">
              {components.length} قطعة من {storesAr(storesCount)} سعودية{updatedAgo ? ` · آخر تحديث ${updatedAgo}` : ''}
            </p>
          </div>
        )}
        <label className="relative flex-[0_1_340px] min-w-[240px] group">
          <span className="absolute inset-y-0 start-3 flex items-center text-slate-400 group-focus-within:text-cyan-500 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input
            type="text"
            placeholder="اسم القطعة أو الشركة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/60 rounded-sm ps-10 pe-4 py-3 text-[13.5px] font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/30 hover:border-cyan-300 dark:hover:border-cyan-700 outline-none transition-all placeholder:font-medium placeholder:text-slate-400"
          />
        </label>
      </div>

      {/* ===== شريط الفئات بأعدادها — صفٌّ يُمرَّر أفقياً على الجوال ===== */}
      <nav aria-label="الفئات" className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible">
        {[{ id: 'all', name: 'الكل', count: preCat.length }, ...orderedCats.map((c) => ({ id: c.id, name: catMeta(c.name).label, count: catCounts.get(c.id) || 0 }))].map((c) => {
          const on = selectedCat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => handleCatChange(c.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-sm border text-[13px] font-extrabold whitespace-nowrap transition-all active:scale-95 ${
                on
                  ? 'bg-cyan-500 border-cyan-500 text-white dark:text-[#052e37] shadow-md shadow-cyan-500/30'
                  : 'bg-white/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-cyan-400 dark:hover:border-cyan-600'
              }`}
            >
              {c.name}
              <span className={`font-mono text-[11.5px] font-black tabular-nums ${on ? 'text-white/75 dark:text-[#052e37]/70' : 'text-slate-400 dark:text-slate-500'}`}>{c.count}</span>
            </button>
          );
        })}
      </nav>

      {/* ===== شريط الأدوات: التخفيضات · الترتيب · الأداء · أقصى سعر · العدد ===== */}
      <div className="relative flex flex-wrap items-center gap-2.5 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm px-3.5 py-2.5 rounded-sm border-t-2 border-t-cyan-500/70 border-x border-b border-slate-200 dark:border-slate-800/80 shadow-sm">

        {!dealsLocked && (
          <button
            onClick={() => dealsCount > 0 && setOnlyDeals(!onlyDeals)}
            disabled={dealsCount === 0}
            title={dealsCount === 0 ? 'لا توجد تخفيضات مرصودة حالياً' : 'اعرض القطع المخفّضة فقط'}
            className={`flex items-center gap-2 px-3 py-2 rounded-sm text-[12px] font-black transition-all active:scale-95 border whitespace-nowrap ${
              dealsCount === 0
                ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700/50 cursor-not-allowed'
                : onlyDeals
                ? 'bg-rose-700 text-white border-rose-700 shadow-md shadow-rose-500/30'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/40'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            عليها تخفيض
            <span className={`min-w-[20px] px-1.5 py-0.5 rounded-sm text-[11px] font-black font-mono tabular-nums ${
              dealsCount === 0 ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' : onlyDeals ? 'bg-white/25 text-white' : 'bg-rose-500 text-white'
            }`}>{dealsCount}</span>
          </button>
        )}
        {!dealsLocked && <span className="w-px h-7 bg-slate-200 dark:bg-slate-700/60"></span>}

        {/* الفرز */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 me-0.5">الترتيب</span>
          {([
            ...(dealsLocked || onlyDeals ? [{ key: 'discount', label: 'الأكثر انخفاضاً' }] as const : []),
            { key: 'newest', label: 'الأحدث' },
            { key: 'price-asc', label: 'الأرخص' },
            { key: 'price-desc', label: 'الأغلى' },
            ...(perfCat ? [{ key: 'power', label: 'الأقوى أولاً' }] as const : []),
          ] as const).map((o) => (
            <button key={o.key} onClick={() => setSortBy(o.key)} className={tb(sortBy === o.key)}>{o.label}</button>
          ))}
        </div>

        {/* الأداء — للمعالج والكرت */}
        {perfCat && (
          <>
            <span className="w-px h-7 bg-slate-200 dark:bg-slate-700/60"></span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 me-0.5">الأداء</span>
              {perfCat === 'CPU' && (
                <span className="flex gap-0.5 p-0.5 me-1 bg-slate-100 dark:bg-slate-800/60 rounded-sm">
                  {(['للألعاب', 'للمونتاج'] as const).map((t, i) => (
                    <button key={t} onClick={() => setCpuUse(i as 0 | 1)} className={`px-2.5 py-1.5 rounded-sm text-[11.5px] font-black transition-all ${cpuUse === i ? 'bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{t}</button>
                  ))}
                </span>
              )}
              {PERF_STEPS.map(([min, label], i) => (
                <button key={min} onClick={() => setMinLevel(min)} className={tb(minLevel === min)} title="من اختبارات منشورة؛ غير المقيس لا يطلع في «فأعلى»">
                  {label}<span className="tabular-nums opacity-75 text-[11px]">{perfCounts[i]}</span>
                </button>
              ))}
              <Link href="/how-we-rate" className="text-[11.5px] font-bold text-cyan-700 dark:text-cyan-400 underline ms-1">كيف نقيّم؟</Link>
            </div>
          </>
        )}

        {/* أقصى سعر */}
        <span className="w-px h-7 bg-slate-200 dark:bg-slate-700/60"></span>
        <div className="flex items-center gap-2.5">
          <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">أقصى سعر</span>
          <input
            type="range"
            min="0"
            max={priceCeiling}
            step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            aria-label="أقصى سعر"
            className="w-[120px] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-500"
          />
          {/* عند السقف لا حدّ فعلاً — و«بلا حدّ» أصدق من رقمٍ يوهم أن هناك أغلى محجوب */}
          <span className="text-[12px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-sm border border-emerald-100 dark:border-emerald-800/30 whitespace-nowrap">
            {maxPrice >= priceCeiling ? 'بلا حدّ' : <><Mono>{formatPrice(maxPrice)}</Mono><RiyalSign /></>}
          </span>
        </div>

        {/* العدد + إعادة التعيين */}
        <span className="ms-auto flex items-center gap-3">
          {isFiltered && (
            <button onClick={handleClearFilters} title="مسح جميع الفلاتر والبحث" className="text-[12px] font-extrabold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 active:scale-95">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              إعادة تعيين
            </button>
          )}
          <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">
            {remaining > 0 ? <>عرض <Mono>{visible.length}</Mono> من <Mono>{filtered.length}</Mono> قطعة</> : <><Mono>{filtered.length}</Mono> قطعة</>}
          </span>
        </span>
      </div>

      {/* ===== البطاقات ===== */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm rounded-sm border-x border-b border-t-2 border-slate-200 border-t-cyan-500/70 dark:border-slate-800/80 shadow-sm text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">لا توجد نتائج</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed">ما لقينا قطعاً تطابق الفلاتر. جرّب تغيير كلمة البحث أو تخفيف الفلاتر.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((comp) => {
            const available = isAvailable(comp);
            const specBadges = getSpecBadges(comp, 3);
            const { avail, secondary, cheapestStore } = offerLines(comp);

            return (
              <div key={comp.id} className={`group relative flex flex-col overflow-hidden rounded-sm border-x border-b border-t-2 bg-gradient-to-b from-white/80 to-white/60 dark:from-[#0F172A]/70 dark:to-[#0B1120]/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-cyan-500/15 hover:-translate-y-1 transition-all duration-300 ${available ? 'border-t-cyan-500 border-slate-200 dark:border-slate-800' : 'border-t-amber-500 border-amber-300 dark:border-amber-600/50'}`}>
                <span aria-hidden="true" className={`absolute top-0 right-0 w-0 h-0 border-t-[14px] border-l-[14px] border-l-transparent z-20 ${available ? 'border-t-cyan-500/60' : 'border-t-amber-500/60'}`}></span>

                {/* الرأس: الفئة بالعربية + كم متجرٍ يبيعها */}
                <div className="flex items-center justify-between gap-2 px-3.5 pt-2.5 pb-2">
                  <span className="text-[11.5px] font-black text-cyan-700 dark:text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded-sm">
                    {comp.category?.name ? catMeta(comp.category.name).label : ''}
                  </span>
                  <span className={`text-[11.5px] font-bold truncate ${available ? 'text-slate-500 dark:text-slate-400' : 'text-amber-600 dark:text-amber-400'}`}>{avail}</span>
                </div>

                {/* الصورة */}
                <div className="relative mx-3.5 h-[170px] bg-white rounded-sm flex items-center justify-center p-3">
                  <img
                    src={productImage(comp.imageUrl, IMAGE_FALLBACK)}
                    alt={comp.name}
                    loading="lazy"
                    decoding="async"
                    className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-sm group-hover:scale-105 transition-transform duration-500"
                  />
                  {comp._deal.pct > 0 && (
                    <span className="absolute top-2 right-2 bg-rose-700 text-white text-[12px] font-black px-2 py-1 rounded-sm shadow-md shadow-rose-500/40 font-mono tabular-nums z-10">
                      ‎-{comp._deal.pct}%
                    </span>
                  )}
                </div>

                {/* التفاصيل */}
                <div className="flex flex-col gap-1.5 px-3.5 pt-3 pb-3.5 flex-1">
                  <p className={`font-mono text-[11.5px] font-extrabold uppercase tracking-[0.14em] ${brandColor(comp.brand, comp.name, comp.category?.name)}`}>{comp.brand}</p>
                  <h3 className="text-[15px] font-black text-slate-900 dark:text-white leading-[1.45] line-clamp-2 min-h-[44px]" title={comp.name}>{comp.name}</h3>

                  {comp._ratings.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {comp._ratings.map((r: any) => <RatingMeter key={r.label} r={r} />)}
                    </div>
                  )}

                  {specBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {specBadges.map((b, i) => (
                        <span key={i} className="font-mono text-[11.5px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-sm border border-slate-200 dark:border-slate-700/50" dir="ltr">{b}</span>
                      ))}
                    </div>
                  )}

                  {/* السعر: أقلّ سعرٍ ومتجره، ثم المتاجر الأخرى أو النافدة */}
                  <div className="mt-auto pt-3 border-t border-slate-100 dark:border-cyan-500/10 flex items-end justify-between gap-2.5">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 truncate">
                        {available ? (cheapestStore ? `أقل سعر · ${cheapestStore}` : 'السعر') : comp.price > 0 ? 'آخر سعر رصدناه' : 'السعر'}
                      </p>
                      {available ? (
                        <>
                          <span className="font-mono text-[21px] font-black leading-none text-emerald-600 dark:text-emerald-400 tabular-nums" dir="ltr">{formatPrice(comp.price)}<RiyalSign /></span>
                          {comp._deal.pct > 0 && comp._deal.listPrice && (
                            <span className="block text-[11.5px] font-bold text-slate-500 dark:text-slate-400 line-through mt-0.5 font-mono" dir="ltr">{formatPrice(comp._deal.listPrice)}</span>
                          )}
                        </>
                      ) : comp.price > 0 ? (
                        <span className="font-mono text-[19px] font-black leading-none text-amber-600 dark:text-amber-400 tabular-nums" dir="ltr">{formatPrice(comp.price)}<RiyalSign /></span>
                      ) : (
                        /* سعرُ صفرٍ ليس سعراً: يُقال إنه غير معروف بدل أن يُختلق */
                        <span className="font-black text-[13px] text-slate-500 dark:text-slate-300">لا سعر مسجّل</span>
                      )}
                      {secondary && <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 truncate">{secondary}</p>}
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <Link href={`/components/${comp.id}`} className="group/btn flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-[#052e37] font-extrabold text-[13px] rounded-sm transition-all shadow-sm shadow-cyan-500/20 hover:shadow-md hover:shadow-cyan-500/40 active:scale-95 whitespace-nowrap">
                        التفاصيل
                        <span className="transition-transform group-hover/btn:-translate-x-1" aria-hidden="true">&larr;</span>
                      </Link>
                      <Link href={`/compare?ids=${comp.id}`} className="flex items-center justify-center w-[34px] h-[34px] bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 dark:hover:bg-cyan-500 text-slate-600 dark:text-slate-400 hover:text-white rounded-sm transition-all active:scale-95" title="قارن هذه القطعة">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== تحميل المزيد ===== */}
      {remaining > 0 && (
        <div className="mt-2 flex flex-col items-center gap-2.5">
          <button
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            className="group flex items-center gap-2.5 px-7 py-3 rounded-sm bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700/60 text-[13.5px] font-black text-slate-700 dark:text-slate-200 hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 transition-all active:scale-95"
          >
            <svg className="w-4 h-4 text-cyan-500 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            تحميل المزيد
            <span className="font-mono text-[12px] font-black text-slate-500 dark:text-slate-400 tabular-nums" dir="ltr">(+{Math.min(PAGE_SIZE, remaining)})</span>
          </button>
          <div className="w-40 h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden" dir="ltr">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500" style={{ width: `${(visible.length / filtered.length) * 100}%` }}></div>
          </div>
          <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">بقيت {remaining} قطعة بهذا الفلتر</span>
        </div>
      )}

      {/* ===== اقترح قطعة ناقصة ===== */}
      <SuggestPartCard source="components" className="mt-4" />
    </div>
  );
}
