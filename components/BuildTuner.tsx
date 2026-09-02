'use client';

import { useState, useMemo } from 'react';
import { CATEGORY_META } from '../lib/category-meta';
import { productImage } from '../lib/image';
import { isAvailable } from '../lib/stores';
import { checkBuild } from '../lib/build-check';

/* ============ الأنواع ============ */
type Comp = any;

type Cat = { id: string; name: string; components: Comp[] };

/* بديل معروض في القائمة */
type Alt = {
  comp: Comp;
  isCurrent: boolean;
  delta: number;              // الفارق عن القطعة الحالية في هذه الفئة
  blocked: string | null;     // سبب عدم التوافق، أو null
};

/* ============ أدوات ============ */

const parseSpecs = (specsStr: any) => {
  if (!specsStr) return {};
  if (typeof specsStr === 'string') {
    try { return JSON.parse(specsStr); } catch { return {}; }
  }
  return specsStr;
};

const RiyalIcon = ({ size = 'h-3 w-3', colorClass = 'bg-slate-500' }: { size?: string; colorClass?: string }) => (
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
      WebkitMaskPosition: 'center',
    }}
  />
);

/* كانت خريطةً ثانيةً بنفس الأيقونات والتسميات — والخرائط المتطابقة تفترق
   بمرور الوقت. صارت من `lib/category-meta`. */
const CAT_META = CATEGORY_META;

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/* ============ حساب الطاقة ============
   مصدر واحد للحقيقة: كان الحساب مكرّراً في موضعين (كشف التعارض
   وسبب المنع)، فأي تعديل في أحدهما يجعل التحذير يخالف الشارة.
   نستبعد المزوّد نفسه — لا يغذّي ذاته — ونضيف هامشاً للمراوح. */
const PSU_HEADROOM = 150;
const PERIPHERAL_DRAW = 50;

const computeDraw = (parts: Record<string, any>): number => {
  const sum = Object.entries(parts)
    .filter(([k]) => k !== 'PSU')
    .reduce((s: number, [, c]: [string, any]) => s + ((c && c.tdpWattage) || 0), 0);
  return sum > 0 ? sum + PERIPHERAL_DRAW : 0;
};

/* ============ المكوّن ============ */

export default function BuildTuner({
  categories,
  selectedComponents,
  onApply,
}: {
  categories: Cat[];
  selectedComponents: Record<string, Comp | null>;
  onApply: (next: Record<string, Comp | null>) => void;
}) {
  const [open, setOpen] = useState(false);
  // التغييرات المعلّقة: لا تُطبَّق حتى يضغط "طبّق"
  const [staged, setStaged] = useState<Record<string, Comp>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  /* الحالة الفعّالة = المختار + المعلّق فوقه */
  const effective = useMemo(() => {
    const e: Record<string, Comp | null> = { ...selectedComponents };
    for (const [cat, comp] of Object.entries(staged)) e[cat] = comp;
    return e;
  }, [selectedComponents, staged]);

  const currentTotal = useMemo(
    () => Object.values(selectedComponents).reduce((s: number, c: any) => s + (c?.price || 0), 0),
    [selectedComponents]
  );
  const nextTotal = useMemo(
    () => Object.values(effective).reduce((s: number, c: any) => s + (c?.price || 0), 0),
    [effective]
  );
  const totalDelta = nextTotal - currentTotal;
  const hasChanges = Object.keys(staged).length > 0;

  /* ============ كشف التعارضات في الحالة الفعّالة ============
     نفحص ما *سيحدث* لو طُبّقت التغييرات — لا ما حدث. */
  const conflicts = useMemo(() => {
    const list: { cat: string; reason: string; fixCat: string; unknown?: boolean }[] = [];
    const cpu = effective['CPU'];
    const mobo = effective['Motherboard'];
    const ram = effective['RAM'];
    const gpu = effective['GPU'];
    const psu = effective['PSU'];
    const cse = effective['Case'];

    /* ⚠️ والحكم من `lib/build-check.ts` لا من هنا: كانت هذه النسخة تفحص
       المقبس ونوع الذاكرة وطول الكرت والطاقة — **ولا تفحص** مقاس اللوحة
       مقابل الصندوق ولا مقاس المزوّد ولا المبرّد. فكان المستخدم يُخرج من
       هذه الشاشة تجميعةً بلوحة ATX في صندوق Mini-ITX وهي لا تُركَّب. */
    for (const issue of checkBuild({
      CPU: cpu, Motherboard: mobo, RAM: ram, GPU: gpu, PSU: psu, Case: cse,
      Cooler: effective['Cooler'], Storage: effective['Storage'],
    })) {
      /* «لا مبرّد» ليس تعارضاً بين قطعتين، فلا موضع له في شاشةٍ تُصلح
         بالاستبدال — يُعرض في الباني حيث يمكن أن يُضاف مبرّد. */
      if (issue.code === 'noCooler') continue;
      list.push({
        cat: issue.fixCategory,
        reason: issue.message,
        fixCat: issue.fixCategory,
        unknown: issue.level === 'warn',
      });
    }

    return list;
  }, [effective]);

  const conflictFor = (cat: string) => conflicts.find(c => c.cat === cat) || null;

  /* سبب منع قطعة بعينها ضمن الحالة الفعّالة الحالية */
  const blockReason = (catName: string, comp: Comp): string | null => {
    const sp = parseSpecs(comp.specs);

    if (catName === 'Motherboard') {
      const cpu = effective['CPU'];
      if (cpu) {
        const a = String(parseSpecs(cpu.specs).socket || '').trim();
        const b = String(sp.socket || '').trim();
        if (a && b && a !== b) return `تتطلب معالج ${b}`;
      }
    }
    if (catName === 'CPU') {
      const mobo = effective['Motherboard'];
      if (mobo) {
        const a = String(sp.socket || '').trim();
        const b = String(parseSpecs(mobo.specs).socket || '').trim();
        if (a && b && a !== b) return `يتطلب لوحة ${a}`;
      }
    }
    if (catName === 'RAM') {
      const mobo = effective['Motherboard'];
      if (mobo) {
        const a = String(sp.type || '').trim();
        const b = String(parseSpecs(mobo.specs).ramType || '').trim();
        if (a && b && a !== b) return `اللوحة تدعم ${b}`;
      }
    }
    if (catName === 'GPU') {
      const cse = effective['Case'];
      if (cse) {
        const len = parseFloat(sp.lengthMm);
        const max = parseFloat(parseSpecs(cse.specs).maxGpuLength);
        if (!isNaN(len) && !isNaN(max) && len > max) return `أطول من الكيس (${max}mm)`;
      }
    }
    if (catName === 'Case') {
      const gpu = effective['GPU'];
      if (gpu) {
        const len = parseFloat(parseSpecs(gpu.specs).lengthMm);
        const max = parseFloat(sp.maxGpuLength);
        if (!isNaN(len) && !isNaN(max) && len > max) return `أصغر من الكرت (${len}mm)`;
      }
    }
    if (catName === 'PSU') {
      const draw = computeDraw(effective);
      const w = parseFloat(sp.wattage || '0');
      if (w > 0 && draw > 0 && w < draw + PSU_HEADROOM) {
        return `لا يكفي (تحتاج ${draw + PSU_HEADROOM}W)`;
      }
    }
    return null;
  };

  /* ============ توليد البدائل الخمسة ============
     موزّعة على الطيف: الأرخص · أقل من الحالي · الحالي · أعلى · الأقوى.
     يعطي سياقاً للقرار بدل خمسة متشابهة. */
  const getAlternatives = (catName: string): Alt[] => {
    const cat = categories.find(c => c.name === catName);
    if (!cat) return [];

    const current = effective[catName];

    /* ---- الترتيب: بالأداء لا بالسعر ----
       السعر لا يساوي القوة: RX 6950 XT بـ861 أقوى من Arc A770 بـ2,026،
       و RTX 4070 SUPER بـ5,417 أضعف من 5070 Ti بـ3,950.
       الترتيب بالسعر كان يكذب على المستخدم.

       ⚠️ كان الكيس مستثنىً هنا ويُرتَّب بالسعر وحده، لأن ٢٣ من ٢٧ كيساً
       كانت بلا `performanceTier`. وقد صُنّفت كلّها (راجع
       scripts/set-case-tiers.ts: سعة الكرت، وقدرة التبريد، والبناء)،
       فسقط سبب الاستثناء. وترتيبُ الكيسات بالسعر كان يقول إن XT View
       بـ٥٧٢ أقدرُ من Meshify 2 بـ٥٢٥ — والثاني يبتلع كرتاً أطول بـ٥٢ مم.

       نرتّب بالمستوى، ثم بالسعر داخل المستوى الواحد. */
    let pool = cat.components.filter((c: any) => c.price > 0);
    if (pool.length === 0) return [];

    {
      // قطعة بلا مستوى: نقدّر رتبتها من موقعها السعري بين أقرانها
      const withTier = pool.filter((c: any) => c.performanceTier != null);
      const tiers = withTier.map((c: any) => c.performanceTier as number);
      const minT = tiers.length ? Math.min(...tiers) : 1;
      const maxT = tiers.length ? Math.max(...tiers) : 5;
      /* الرتبة السعرية بالتطبيع بين الأدنى والأعلى.
         الاعتماد على indexOf كان يعطي رتبة واحدة لقطعتين بنفس السعر
         (مثل RTX 4060 و RTX 5060 وكلاهما 1,500)، ويعطي -1 لو لم يجد السعر. */
      const priceList = pool.map((c: any) => c.price);
      const minP = Math.min(...priceList);
      const maxP = Math.max(...priceList);
      const priceRank = (p: number) => (maxP > minP ? (p - minP) / (maxP - minP) : 0.5);
      const effTier = (c: any) =>
        c.performanceTier != null
          ? c.performanceTier
          : minT + priceRank(c.price) * (maxT - minT);

      pool = [...pool].sort((a: any, b: any) => {
        const d = effTier(a) - effTier(b);
        return Math.abs(d) > 0.01 ? d : a.price - b.price;
      });
    }

    /* لو هذه الفئة هي محلّ تعارض، نعرض المتوافقة أولاً —
       وإلا وعدنا المستخدم بـ"اختر من N متوافقة" ثم عرضنا خمساً كلها ممنوعة. */
    const isConflictTarget = conflicts.some(c => c.fixCat === catName);
    if (isConflictTarget) {
      const okOnly = pool.filter((c: any) => !blockReason(catName, c));
      if (okOnly.length > 0) pool = okOnly;
    }

    const curIdx = current ? pool.findIndex((c: any) => c.id === current.id) : -1;

    /* اختيار خمسة مؤشّرات موزّعة حول الحالي */
    const picks = new Set<number>();
    picks.add(0);                              // الأرخص
    picks.add(pool.length - 1);                // الأقوى
    if (curIdx >= 0) {
      picks.add(curIdx);                       // الحالي
      if (curIdx > 0) picks.add(Math.max(0, Math.floor(curIdx / 2)));      // أقل
      if (curIdx < pool.length - 1) picks.add(Math.min(pool.length - 1, curIdx + Math.max(1, Math.floor((pool.length - 1 - curIdx) / 2)))); // أعلى
    } else {
      picks.add(Math.floor(pool.length * 0.25));
      picks.add(Math.floor(pool.length * 0.5));
      picks.add(Math.floor(pool.length * 0.75));
    }

    // نكمل إلى خمسة إن نقصت
    let fill = 0;
    while (picks.size < Math.min(5, pool.length) && fill < pool.length) {
      picks.add(fill);
      fill++;
    }

    const idxs = [...picks].sort((a, b) => a - b).slice(0, 5);

    return idxs.map(i => {
      const comp = pool[i];
      return {
        comp,
        isCurrent: current?.id === comp.id,
        delta: comp.price - (current?.price || 0),
        blocked: blockReason(catName, comp),
      };
    });
  };

  /* عدد البدائل المتوافقة في فئة — يُستخدم في زر حلّ التعارض */
  const countCompatible = (catName: string): number => {
    const cat = categories.find(c => c.name === catName);
    if (!cat) return 0;
    return cat.components.filter((c: any) => c.price > 0 && !blockReason(catName, c)).length;
  };

  /* ============ الإجراءات ============ */

  const stage = (catName: string, comp: Comp) => {
    setStaged(prev => {
      const next = { ...prev };
      // اختيار نفس القطعة الأصلية = إلغاء التعليق
      if (selectedComponents[catName]?.id === comp.id) delete next[catName];
      else next[catName] = comp;
      return next;
    });
  };

  const reset = () => setStaged({});

  const apply = () => {
    onApply({ ...selectedComponents, ...staged });
    setStaged({});
    setExpanded(null);
    setOpen(false);
  };

  const cats = categories.filter(c => selectedComponents[c.name] || staged[c.name]);
  if (cats.length === 0) return null;

  /* ============ العرض ============ */

  return (
    <div className="mt-6" data-noexport>
      {/* زر الفتح */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-full py-4 rounded-sm border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black text-sm hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          هل تريد تغيير شيء؟
        </button>
      )}

      {open && (
        <div className="rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden">
          {/* الرأس */}
          <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1 h-5 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">خصّص تجميعتك</h3>
            </div>
            <button
              onClick={() => { setOpen(false); reset(); }}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              إغلاق
            </button>
          </div>

          {/* تعارض: نوجّه للحل، لا نمنع الاختيار */}
          {conflicts.length > 0 && (
            <div className="mx-4 mt-4 p-3.5 rounded-sm bg-amber-500/[0.07] border border-amber-500/40">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 shrink-0 rounded-sm bg-amber-900/50 text-amber-400 flex items-center justify-center text-xs font-black">!</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-black text-amber-600 dark:text-amber-400">
                    اختيارك يتطلب تغيير قطعة أخرى:
                  </p>
                  {conflicts.map((c, i) => {
                    const fixCount = countCompatible(c.fixCat);
                    return (
                      <div key={i} className="mt-2">
                        <p className="text-[11px] font-semibold text-amber-700/90 dark:text-amber-400/80 mb-1.5">
                          {c.reason}
                        </p>
                        {/* النقص لا يُحَلّ بتبديل قطعة — العيب في بياناتنا
                            لا في اختياره، فلا يُعرض عليه زرُّ إصلاح. */}
                        {!c.unknown && (
                          <button
                            onClick={() => setExpanded(c.fixCat)}
                            className="text-[10px] font-black px-2.5 py-1 rounded-sm bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                          >
                            {fixCount > 0
                              ? `اختر من ${fixCount} ${CAT_META[c.fixCat]?.label || c.fixCat} متوافقة ←`
                              : `غيّر ${CAT_META[c.fixCat]?.label || c.fixCat} ←`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* قائمة الفئات */}
          <div className="p-4 space-y-2">
            {cats.map(cat => {
              const cur = effective[cat.name];
              const isStaged = Boolean(staged[cat.name]);
              const conflict = conflictFor(cat.name);
              const isOpen = expanded === cat.name;
              const meta = CAT_META[cat.name] || { icon: '🔧', label: cat.name };
              const alts = isOpen ? getAlternatives(cat.name) : [];

              return (
                <div
                  key={cat.id}
                  className={`rounded-sm border transition-colors ${
                    conflict
                      ? 'border-red-500/50 bg-red-500/[0.03]'
                      : isStaged
                      ? 'border-cyan-500/50 bg-cyan-500/[0.03]'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* رأس الفئة — خلفية أغمق ليُقرأ كترويسة لا كبديل */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : cat.name)}
                    className={`w-full flex items-center gap-3 p-3 text-right transition-colors ${
                      isOpen
                        ? 'bg-slate-100 dark:bg-slate-800/80 rounded-t-xl border-b-2 border-cyan-500'
                        : 'rounded-sm'
                    }`}
                  >
                    <span className="w-8 h-8 shrink-0 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm">
                      {meta.icon}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black tracking-wider text-slate-400">{meta.label}</span>
                        {isStaged && (
                          <span className="text-[12px] font-black px-1.5 py-0.5 rounded bg-cyan-500 text-white">مُعدَّلة</span>
                        )}
                        {conflict && (
                          <span className="text-[12px] font-black px-1.5 py-0.5 rounded bg-red-500 text-white">تعارض</span>
                        )}
                      </div>
                      <div className="text-[12.5px] font-bold text-slate-900 dark:text-white truncate mt-0.5">
                        {cur?.name || '—'}
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <div className="text-[13px] font-black text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                        {fmt(cur?.price || 0)}
                        <RiyalIcon colorClass="bg-slate-900 dark:bg-white" />
                      </div>
                    </div>

                    <svg
                      className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* البدائل — مُزاحة للداخل لتنتمي للترويسة بصرياً */}
                  {isOpen && (
                    <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-b-xl">
                      <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
                        <span className="text-[9.5px] font-black tracking-wider text-slate-400 dark:text-slate-500">
                          بدائل متاحة
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600">
                          {cat.name === 'Case' ? 'الأرخص ← الأغلى' : 'الأضعف ← الأقوى'}
                        </span>
                      </div>
                      <div className="px-4 pb-4 space-y-1.5 max-h-[300px] overflow-y-auto">
                      {alts.length === 0 ? (
                        <p className="text-[11px] text-slate-400 text-center py-3">لا توجد بدائل.</p>
                      ) : (
                        alts.map(alt => {
                          /* التوفّر من العروض — كان يقرأ أعمدة المتاجر الثلاثة
                             المجمّدة، فيعرض حالة قديمة ولا يرى أي متجر جديد. */
                          const avail = isAvailable(alt.comp);
                          return (
                            <button
                              key={alt.comp.id}
                              onClick={() => stage(cat.name, alt.comp)}
                              className={`w-full flex items-center gap-2.5 p-2.5 rounded-sm border text-right transition-all ${
                                alt.blocked
                                  ? 'border-amber-500/50 bg-amber-500/[0.05] hover:border-amber-500 hover:bg-amber-500/[0.1]'
                                  : alt.isCurrent
                                  ? 'border-cyan-500 bg-cyan-500/[0.08]'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-cyan-500/60 hover:bg-cyan-500/[0.04]'
                              }`}
                            >
                              <div className="w-9 h-9 shrink-0 rounded-sm bg-white border border-slate-200 dark:border-slate-800 p-0.5 flex items-center justify-center">
                                {alt.comp.imageUrl ? (
                                  <img src={productImage(alt.comp.imageUrl)} alt="" className="max-w-full max-h-full object-contain" />
                                ) : (
                                  <span className="text-[10px] text-slate-300">—</span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {alt.comp.name}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                                    {fmt(alt.comp.price)}
                                    <RiyalIcon size="h-2 w-2" colorClass="bg-slate-500 dark:bg-slate-400" />
                                  </span>
                                  {/* مستوى الأداء — يكشف ما يخفيه السعر */}
                                  {alt.comp.performanceTier != null && (
                                    <span className="text-[9px] tracking-tight" dir="ltr" title={`مستوى الأداء ${alt.comp.performanceTier}/5`}>
                                      <span className="text-cyan-500 dark:text-cyan-400">{'●'.repeat(alt.comp.performanceTier)}</span>
                                      <span className="text-slate-300 dark:text-slate-700">{'●'.repeat(Math.max(0, 5 - alt.comp.performanceTier))}</span>
                                    </span>
                                  )}
                                  {alt.isCurrent && (
                                    <span className="text-[12px] font-black px-1.5 py-0.5 rounded bg-cyan-500 text-white">الحالية</span>
                                  )}
                                  {!avail && (
                                    <span className="text-[12px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40">
                                      نافدة
                                    </span>
                                  )}
                                  {alt.blocked && (
                                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                      ⚠ {alt.blocked} — سنساعدك تغيّرها
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* أثر السعر — أو علامة الاختيار للحالية */}
                              {alt.isCurrent ? (
                                <div className="w-6 h-6 shrink-0 rounded-full bg-cyan-500 flex items-center justify-center">
                                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="text-left shrink-0">
                                  <div className={`text-[11px] font-black flex items-center gap-0.5 justify-end ${
                                    alt.delta > 0 ? 'text-red-500' : alt.delta < 0 ? 'text-emerald-500' : 'text-slate-400'
                                  }`}>
                                    {alt.delta > 0 ? '▲' : '▼'} {fmt(Math.abs(alt.delta))}
                                    <RiyalIcon
                                      size="h-2 w-2"
                                      colorClass={
                                        alt.delta > 0
                                          ? 'bg-red-500'
                                          : alt.delta < 0
                                          ? 'bg-emerald-500'
                                          : 'bg-slate-400'
                                      }
                                    />
                                  </div>
                                  <div className="text-[12px] font-bold text-slate-400 mt-0.5">
                                    الإجمالي يصير {fmt(nextTotal - (cur?.price || 0) + alt.comp.price)}
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* شريط التطبيق */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120]">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">الإجمالي</span>
              <div className="flex items-center gap-2 flex-wrap">
                {hasChanges && (
                  <>
                    <span className="text-[12px] font-black text-slate-400 line-through flex items-center gap-1">
                      {fmt(currentTotal)} <RiyalIcon size="h-2.5 w-2.5" colorClass="bg-slate-400" />
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">←</span>
                  </>
                )}
                <span className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1">
                  {fmt(nextTotal)} <RiyalIcon size="h-3.5 w-3.5" colorClass="bg-slate-900 dark:bg-white" />
                </span>
                {hasChanges && totalDelta !== 0 && (
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded ${
                    totalDelta > 0
                      ? 'text-red-600 bg-red-500/10 border border-red-500/30'
                      : 'text-emerald-600 bg-emerald-500/10 border border-emerald-500/30'
                  }`}>
                    {totalDelta > 0 ? '▲ زيادة' : '▼ توفير'} {fmt(Math.abs(totalDelta))}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={apply}
                disabled={!hasChanges}
                className={`flex-1 py-3 text-white text-sm font-black rounded-sm transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 ${
                  conflicts.length > 0
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {!hasChanges
                  ? 'لم تغيّر شيئاً بعد'
                  : conflicts.length > 0
                  ? `طبّق رغم التعارض (${Object.keys(staged).length})`
                  : `طبّق ${Object.keys(staged).length} تغيير`}
              </button>
              {hasChanges && (
                <button
                  onClick={reset}
                  className="px-5 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  تراجع
                </button>
              )}
            </div>

            <p className="mt-2.5 text-[10px] text-slate-400 text-center font-medium">
              {conflicts.length > 0
                ? '⚠ التجميعة فيها تعارض — تقدر تطبّق وتصلحه لاحقاً، أو تحلّه الآن'
                : 'لا شيء يتغيّر حتى تضغط "طبّق" · الأسعار لحظية من كتالوجنا'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}