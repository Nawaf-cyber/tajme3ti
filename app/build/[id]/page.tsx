import type { Metadata } from 'next';
import { longDateAr } from '../../../lib/time-ago';
import { analyzeBuild, partLabel } from '../../../lib/build-compare';
import { catMeta } from '../../../lib/category-meta';
import { feel, GPU_PERF_SOURCE } from '../../../lib/gpu-perf';
import RiyalSign from '../../../components/RiyalSign';
import CopyLinkButton from '../../../components/CopyLinkButton';
import { brandColor } from '../../../lib/brand';
import { prisma } from '../../../lib/prisma';
import StoreBuyChips from '../../../components/StoreBuyChips';
import { OFFER_INCLUDE } from '../../../lib/stores-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { productImage, IMAGE_FALLBACK } from '../../../lib/image';
import { timeAgoAr, exactAr, isPriceStale } from '../../../lib/time-ago';
import { priceAsOf, liveOffers } from '../../../lib/stores';
import { buildCard, formatTotal, STATE_TEXT, isAutoName, CARD_CATEGORIES } from '../../../lib/build-card';
import { formatPrice } from '../../../lib/price';
import { bottleneck as computeBottleneck } from '../../../lib/bottleneck';
import { upgradeOptions } from '../../../lib/rig-upgrade';
import type { BuildParts } from '../../../lib/build-check';

/* لون العلامة صار من lib/brand — كانت أربع نسخ بأربع لوحات */

// حاسبة الفريمات مجهزة للعمل بشكل كامل على السيرفر باستخدام Tailwind CSS
/* إطارات الكرت المقيسة — components/GamePerformance (كانت FpsEstimator المقدِّرة) */


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const card = await buildCard(id);
  if (!card) return { title: 'التجميعة غير موجودة', robots: { index: false, follow: true } };

  /* ⚠️ `openGraph` و`twitter` صريحان هنا: بدونهما يُورَّثان من الجذر كاملَين،
     فتظهر المعاينة في واتساب بعنوان الموقع العامّ لا باسم التجميعة.
     والصورة من `opengraph-image.tsx` المجاور — لا تُذكر هنا فتُلغى. */
  const [gpu, cpu] = [card.parts.find((p) => p.category === 'GPU'), card.parts.find((p) => p.category === 'CPU')];
  const headline = [cpu?.title, gpu?.title].filter(Boolean).join(' · ');
  const summary = `${headline ? headline + ' — ' : ''}${formatTotal(card.total)} ريال · ${STATE_TEXT[card.state]}. شوف القطع وأسعارها اليوم في المتاجر السعودية.`;

  return {
    title: `${card.name} — تجميعة مشتركة`,
    description: summary,
    alternates: { canonical: `/build/${id}` },
    openGraph: {
      type: 'website',
      locale: 'ar_SA',
      siteName: 'تجميعتي',
      url: `/build/${id}`,
      title: card.name,
      description: summary,
    },
    twitter: { card: 'summary_large_image', title: card.name, description: summary },
  };
}

export default async function SharedBuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  /* ⚠️ `select` صريح: الاستعلام كان يجلب الصفَّ كاملاً بما فيه `userId`،
     وهذه **صفحةٌ عامّة** يفتحها أي أحدٍ بالرابط. فمعرّف صاحب التجميعة كان
     يصل حمولة العرض بلا داعٍ — لا يُعرض، لكنه يُرسَل.
     والقاعدة: الصفحة العامّة تطلب ما تعرضه لا ما يوجد. */
  const build = await prisma.savedBuild.findUnique({
    where: { id },
    select: {
      id: true, name: true, createdAt: true,
      cpuId: true, gpuId: true, ramId: true, motherboardId: true,
      caseId: true, psuId: true, storageId: true, coolerId: true,
    },
  });

  if (!build) return notFound();

  // كانت روابط هذه الصفحة بلا معرّف أفلييت إطلاقاً — كل نقرة تضيع

  /* ⚠️ المبرّد كان غائباً عن هذه القائمة، فالتجميعة المشتركة تُعرض
     ناقصةً قطعةً ومجموعُها أقلّ من الحقيقة. */
  const componentIds = [build.cpuId, build.gpuId, build.ramId, build.motherboardId, build.caseId, build.psuId, build.storageId, build.coolerId].filter(Boolean) as string[];

  const components = await prisma.component.findMany({
    where: { id: { in: componentIds } },
    select: { id: true, name: true, brand: true, price: true, imageUrl: true, performanceTier: true, specs: true, tdpWattage: true, lastScrapedAt: true, ...OFFER_INCLUDE }
  });

  const compMap = new Map(components.map(c => [c.id, c]));

  const parts: Record<string, any> = {
    CPU: build.cpuId ? compMap.get(build.cpuId) : null,
    GPU: build.gpuId ? compMap.get(build.gpuId) : null,
    Motherboard: build.motherboardId ? compMap.get(build.motherboardId) : null,
    RAM: build.ramId ? compMap.get(build.ramId) : null,
    Storage: build.storageId ? compMap.get(build.storageId) : null,
    PSU: build.psuId ? compMap.get(build.psuId) : null,
    Case: build.caseId ? compMap.get(build.caseId) : null,
    Cooler: build.coolerId ? compMap.get(build.coolerId) : null,
  };

  const totalPriceRaw = Object.values(parts).reduce((sum, part) => sum + (part?.price || 0), 0);
  const totalPrice = Number(totalPriceRaw.toFixed(2));
  
  /* ============ التوازن والترقية — من المصدر الواحد ============
   *
   * ⚠️ كانت الصفحة تحمل نسختها من الاثنين: عتبةُ الاختناق مكتوبةٌ هنا،
   * والاقتراحُ «الأرخص بالدرجة» بلا فحص توفّر ولا حارس ترقية، ولا فحص
   * تركيبٍ إلّا المقبس أو الطول. فكانت تقترح قطعةً نافدة، أو نسخةً أضعف
   * من الشريحة نفسها («9600X ← 9600»). وهذه الصفحة أوّلُ ما يراه من
   * يضغط رابطاً مشاركاً.
   *
   * الآن: التوازن من lib/bottleneck، والاقتراحات من upgradeOptions — نفسُ
   * ما يُجيب «وش أرقّي؟» في بطاقة الجهاز، بشرطٍ واحدٍ مختلف مقصود: هنا
   * يُطلب ما **يسدّ الفجوة** مع القطعة الأخرى لا مجرّد «أقوى».
   */
  const balance = computeBottleneck(parts.CPU, parts.GPU);
  const weak: 'CPU' | 'GPU' | null =
    balance?.kind === 'cpu-weak' ? 'CPU' : balance?.kind === 'gpu-weak' ? 'GPU' : null;

  let suggestions: { category: string; item: any }[] = [];
  if (weak) {
    const other = weak === 'CPU' ? parts.GPU : parts.CPU;
    const raw = await prisma.component.findMany({
      where: { category: { name: weak } },
      select: {
        id: true, name: true, brand: true, price: true, specs: true,
        tdpWattage: true, performanceTier: true, ...OFFER_INCLUDE,
      },
    });
    const all = raw.map((c) => ({ ...c, live: liveOffers(c.offers as any).length > 0 }));
    const rig = Object.fromEntries(Object.entries(parts).filter(([, v]) => v)) as BuildParts;
    suggestions = upgradeOptions(rig, weak, all, [], {
      limit: 6,
      minTier: (other?.performanceTier ?? 0) - 1,
      allowWarn: true,
    }).options.map((item) => ({ category: weak, item }));
  }

  const bottleneck = balance ? { ...balance, suggestions } : null;

  const getUpgradeUrl = (sugCategory: string, sugItemId: string) => {
    const p = new URLSearchParams();
    if (sugCategory === 'CPU' || parts.CPU) p.set('cpu', sugCategory === 'CPU' ? sugItemId : parts.CPU.id);
    if (sugCategory === 'GPU' || parts.GPU) p.set('gpu', sugCategory === 'GPU' ? sugItemId : parts.GPU.id);
    if (parts.Motherboard) p.set('motherboard', parts.Motherboard.id);
    if (parts.RAM) p.set('ram', parts.RAM.id);
    if (parts.Storage) p.set('storage', parts.Storage.id);
    if (parts.PSU) p.set('psu', parts.PSU.id);
    if (parts.Case) p.set('case', parts.Case.id);
    /* المبرّد كان يسقط من رابط الترقية: يفتح الزائرُ الباني فيجد تجميعته
       بلا مبرّدها. */
    if (parts.Cooler) p.set('cooler', parts.Cooler.id);
    return `/builder?${p.toString()}`;
  };

  /* ============ شكل م١ «ملخّص فوق وصفوف» (2026-10-31) ============
   * القادم من رابطٍ مُرسَل يسأل: وش هذي؟ كم سعرها؟ تركب؟ — والصفحة كانت تبدأ بعنوانٍ هو
   * تاريخ، وسعرٍ وحده، ولا تذكر التوافق، وأسماء الفئات إنجليزيّة، والنافد سعره «0».
   * الأرقام كلّها من analyzeBuild (lib/build-compare) — الحساب نفسه في «قارن تجميعاتك»،
   * فلا تقول الصفحتان رقمين مختلفين للتجميعة نفسها. */
  const analysis = analyzeBuild({ id: build.id, name: build.name, parts: parts as any });
  const issues = analysis.issues;
  const blockIssue = issues.find((i) => i.level === 'block');
  const warnIssues = issues.filter((i) => i.level === 'warn');
  const cpu = parts.CPU;
  const gpu = parts.GPU;
  const auto = isAutoName(build.name);
  const headline = auto && (cpu || gpu) ? [cpu?.name, gpu?.name].filter(Boolean).join(' + ') : build.name;
  const builderHref = (() => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(parts)) if (v) p.set(k.toLowerCase(), v.id);
    return `/builder?${p.toString()}`;
  })();
  const outLabels = analysis.unavailable.map((u) => partLabel(u.key));
  const psuOk = analysis.psuWattage > 0 && analysis.psuWattage >= analysis.psuNeed;
  const fps = analysis.gpuPerf;

  /* القطع مجمّعةً حسب أرخص متجر لكلٍّ منها — «3 طلبات بدل 8» */
  const groups = (() => {
    const m = new Map<string, { name: string; color: string; count: number; total: number }>();
    for (const part of Object.values(parts)) {
      if (!part) continue;
      const o = liveOffers(part.offers as any)[0];
      if (!o?.price) continue;
      const g = m.get(o.store.name) ?? { name: o.store.name, color: (o.store as any).color || '#0EA5E9', count: 0, total: 0 };
      g.count += 1;
      g.total += o.price;
      m.set(o.store.name, g);
    }
    return [...m.values()].sort((a, b) => b.count - a.count || b.total - a.total);
  })();
  const partCount = Object.values(parts).filter(Boolean).length;
  const countAr = (n: number, one: string, two: string, many: string) => (n === 1 ? one : n === 2 ? two : `${n} ${many}`);

  const tag = (tone: 'ok' | 'warn' | 'bad' | 'info', text: string) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[12px] font-extrabold border ${
      tone === 'ok' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60'
        : tone === 'warn' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/60'
        : tone === 'bad' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800/60'
        : 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800/60'
    }`}>{text}</span>
  );

  return (
    <div className="min-h-[85vh] py-8 md:py-10 px-4 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col gap-5">

        <nav aria-label="مسار الصفحة" className="text-[12px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Link href="/" className="hover:text-cyan-700 dark:hover:text-cyan-400">الرئيسية</Link>
          <span aria-hidden="true">‹</span>
          <span className="text-slate-700 dark:text-slate-300">تجميعة مشتركة</span>
        </nav>

        {/* ===== الرأس: وش هذي، تركب؟، كم سعرها ===== */}
        <section className="relative overflow-hidden rounded-sm border-x border-b border-t-2 border-slate-200 dark:border-slate-800 border-t-cyan-500 bg-gradient-to-b from-white/85 to-white/65 dark:from-[#0F172A]/80 dark:to-[#0B1120]/60 backdrop-blur-sm shadow-sm p-5 md:p-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-center">
          <span aria-hidden="true" className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-cyan-500/60 border-l-[16px] border-l-transparent"></span>
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-sm text-[12px] font-black bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-500/40 text-cyan-700 dark:text-cyan-400">تجميعة مشتركة</span>
              <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400">
                أُنشئت {longDateAr(build.createdAt)}{auto ? '' : ''}
              </span>
            </div>
            <h1 className="text-3xl md:text-[34px] leading-[1.25] font-black tracking-tight text-slate-900 dark:text-white break-words">
              <bdi>{headline}</bdi>
            </h1>
            {auto && <p className="-mt-1 text-[12.5px] font-bold text-slate-500 dark:text-slate-400">باسم «{build.name}»</p>}
            <div className="flex flex-wrap gap-2">
              {blockIssue
                ? tag('bad', `✕ فيها تعارض: ${blockIssue.message}`)
                : warnIssues.length
                ? tag('warn', `متوافقة — مع ${warnIssues.length === 1 ? 'ملاحظة' : `${warnIssues.length} ملاحظات`}`)
                : tag('ok', '✓ تُركَّب — القطع متوافقة')}
              {outLabels.length > 0 && tag('warn', `⚠ نافدة الحين: ${outLabels.join('، ')}`)}
              {analysis.missing.length > 0 && tag('warn', `ناقصة: ${analysis.missing.map(partLabel).join('، ')}`)}
              {bottleneck && tag(bottleneck.kind === 'balanced' ? 'info' : 'warn', bottleneck.title)}
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              <Link href={builderHref} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[13px] font-black shadow-lg shadow-cyan-500/25 transition-all">
                افتحها في الباني وعدّل عليها <span aria-hidden="true">&larr;</span>
              </Link>
              <CopyLinkButton className="px-4 py-2.5 rounded-sm border border-slate-300 dark:border-slate-700 text-[13px] font-black text-slate-700 dark:text-slate-200 hover:border-cyan-500 transition-colors" />
            </div>
          </div>

          <div className="flex flex-col gap-2.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0B1120]/65 p-4">
            <p className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400">المجموع الحين · بأرخص متجر لكل قطعة</p>
            <span className="font-mono text-[38px] leading-none font-black text-emerald-600 dark:text-emerald-400 tabular-nums" dir="ltr">
              {formatTotal(analysis.totalPrice)}<RiyalSign />
            </span>
            {analysis.unavailable.length > 0 && (
              <p className="text-[12px] font-bold text-amber-700 dark:text-amber-400">
                بدون {outLabels.join('، ')} — {analysis.unpriced.length ? 'نافدة بلا سعر معروف' : `نافدة (آخر سعر ${formatTotal(analysis.unavailable.reduce((s, u) => s + u.lastPrice, 0))})`}
              </p>
            )}
            <div className="grid grid-cols-3 gap-1.5 mt-1 text-center">
              <div className="rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-1.5 py-2">
                <b className="block font-mono text-[17px] font-black text-slate-900 dark:text-white">{fps ? Math.round(fps.f1440) : '—'}</b>
                <span className="block text-[10.5px] font-bold text-slate-500 dark:text-slate-400">إطار · <span dir="ltr">1440p</span></span>
              </div>
              <div className="rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-1.5 py-2">
                <b className="block font-mono text-[17px] font-black text-slate-900 dark:text-white">{analysis.totalTdp ? `${analysis.totalTdp}W` : '—'}</b>
                <span className={`block text-[10.5px] font-bold ${analysis.psuWattage ? (psuOk ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400') : 'text-slate-500 dark:text-slate-400'}`}>
                  {analysis.psuWattage ? `من ${analysis.psuWattage}W · ${psuOk ? 'يكفي' : 'ما يكفي'}` : 'بلا مزوّد'}
                </span>
              </div>
              <div className="rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-1.5 py-2">
                <b className="block font-mono text-[17px] font-black text-slate-900 dark:text-white">{groups.length}</b>
                <span className="block text-[10.5px] font-bold text-slate-500 dark:text-slate-400">{groups.length === 1 ? 'متجر' : groups.length === 2 ? 'متجرين' : 'متاجر'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== القطع صفوفاً + الشراء والأداء جانباً ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <section className="flex flex-col gap-2.5 min-w-0">
            <h2 className="flex items-center gap-2.5 text-xl font-black text-slate-900 dark:text-white mb-1">
              <span className="h-7 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_10px] shadow-cyan-500/40"></span>
              القطع
              <span className="text-[12.5px] font-semibold text-slate-500 dark:text-slate-400">{countAr(partCount, 'قطعة', 'قطعتين', 'قطع')} · كل سعر بجانبه متاجره ووقت آخر تحديث</span>
            </h2>
            {CARD_CATEGORIES.map((category) => {
              const part = parts[category];
              const label = catMeta(category).label;
              const out = analysis.unavailable.find((u) => u.key === category);
              if (!part) {
                return (
                  <div key={category} className="flex items-center gap-3 rounded-sm border border-dashed border-slate-300 dark:border-slate-700 px-4 py-3 text-[13px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="w-24 shrink-0">{catMeta(category).icon} {label}</span>
                    ما اختار صاحبها قطعة هنا
                  </div>
                );
              }
              return (
                <div key={category} className={`grid grid-cols-[56px_minmax(0,1fr)] sm:grid-cols-[104px_56px_minmax(0,1fr)_auto] gap-x-3.5 gap-y-2 items-center rounded-sm border border-slate-200 dark:border-slate-800 border-s-2 ${out ? 'border-s-amber-500' : 'border-s-emerald-500'} bg-white/75 dark:bg-[#0F172A]/72 px-3.5 py-3`}>
                  <span className="hidden sm:flex items-center gap-2 text-[12.5px] font-extrabold text-slate-600 dark:text-slate-300">
                    <span className="w-6 h-6 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[13px]">{catMeta(category).icon}</span>
                    {label}
                  </span>
                  <span className="w-14 h-14 rounded-sm bg-white border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center">
                    <img src={productImage(part.imageUrl, IMAGE_FALLBACK)} alt={part.name} className="max-w-full max-h-full object-contain" />
                  </span>
                  <span className="min-w-0 flex flex-col gap-1">
                    <span className="sm:hidden text-[11.5px] font-bold text-slate-500 dark:text-slate-400">{label}</span>
                    <span className={`font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] ${brandColor(part.brand, part.name, category)}`}>{part.brand}</span>
                    <b className="text-[14.5px] font-black text-slate-900 dark:text-white leading-snug truncate" title={part.name}>{part.name}</b>
                    <span className="flex flex-wrap gap-1.5 mt-0.5">
                      {out ? (
                        <>
                          <span className="px-2 py-0.5 rounded-sm text-[11.5px] font-black bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60">نافدة عند كل المتاجر</span>
                          <Link href={`/components?cat=${encodeURIComponent(category)}`} className="text-[12px] font-extrabold text-cyan-700 dark:text-cyan-400 hover:underline">بدائلها ←</Link>
                        </>
                      ) : (
                        <StoreBuyChips offers={(part as any).offers} />
                      )}
                    </span>
                  </span>
                  <span className="col-start-2 sm:col-start-auto flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0.5">
                    {out ? (
                      <span className="text-[13px] font-black text-slate-500 dark:text-slate-400">{out.lastPrice > 0 ? <>آخر سعر <span className="font-mono">{formatPrice(out.lastPrice)}</span></> : 'لا سعر معروف'}</span>
                    ) : (
                      <span className="font-mono text-[18px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums" dir="ltr">{formatPrice(part.price)}<RiyalSign /></span>
                    )}
                    {/* عمر السعر: التجميعة المشتركة تُفتح بعد أيام من إرسالها، فالرقم بلا تاريخه وعدٌ لا يُوفى */}
                    {!out && priceAsOf(part as any) && (
                      <span title={exactAr(priceAsOf(part as any))} className={`text-[11px] font-bold ${isPriceStale(priceAsOf(part as any)) ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {timeAgoAr(priceAsOf(part as any))}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </section>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
            {groups.length > 0 && (
              <section className="relative rounded-sm border-x border-b border-t-2 border-slate-200 dark:border-slate-800 border-t-emerald-500 bg-white/80 dark:bg-[#0F172A]/70 p-4">
                <h3 className="text-[15px] font-black text-slate-900 dark:text-white">اشترِ القطع</h3>
                <p className="mb-2 text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
                  {countAr(groups.length, 'طلب واحد', 'طلبين', 'طلبات')} بدل {countAr(partCount, 'قطعة', 'قطعتين', 'قطع')} — كل قطعة من أرخص متجر يبيعها
                </p>
                {groups.map((g) => (
                  <div key={g.name} className="flex items-center justify-between gap-3 py-2.5 border-b last:border-b-0 border-slate-200 dark:border-slate-800">
                    <span className="inline-flex items-center gap-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 px-2.5 py-1 text-[12.5px] font-bold text-slate-700 dark:text-slate-200" style={{ borderInlineStartColor: g.color, borderInlineStartWidth: 3 }}>
                      {g.name} · {countAr(g.count, 'قطعة', 'قطعتين', 'قطع')}
                    </span>
                    <span className="font-mono text-[15px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums" dir="ltr">{formatTotal(g.total)}<RiyalSign /></span>
                  </div>
                ))}
                <p className="mt-2 text-[11.5px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">روابط المتاجر بجانب كل قطعة في القائمة.</p>
              </section>
            )}
            {fps && (
              <section className="rounded-sm border-x border-b border-t-2 border-slate-200 dark:border-slate-800 border-t-cyan-500/70 bg-white/80 dark:bg-[#0F172A]/70 p-4">
                <h3 className="mb-2 text-[14px] font-black text-slate-900 dark:text-white">أداء الكرت في الألعاب</h3>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {([['1080p', fps.f1080], ['1440p', fps.f1440], ['4K', fps.f4k]] as [string, number][]).map(([res, f]) => (
                    <div key={res} className="rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 py-2">
                      <b className="block font-mono text-lg font-black text-slate-900 dark:text-white">{Math.round(f)}</b>
                      <span className="block text-[10.5px] font-bold text-slate-500 dark:text-slate-400" dir="ltr">{res}</span>
                      <span className={`inline-block mt-1 px-1.5 rounded-sm text-[10.5px] font-black ${feel(f) === 'مريح' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : feel(f) === 'مقبول' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'}`}>{feel(f)}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
                  متوسّط <a href={GPU_PERF_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline">{GPU_PERF_SOURCE.name}</a> · <Link href="/how-we-rate" className="text-cyan-700 dark:text-cyan-400">كيف نقيّم؟</Link>
                </p>
              </section>
            )}
          </aside>
        </div>

        {/* ===== اقتراحات الترقية حين يختلّ التوازن (upgradeOptions — المنطق كما كان) ===== */}
        {bottleneck && bottleneck.suggestions && bottleneck.suggestions.length > 0 && (
          <section className={`p-5 border rounded-sm ${bottleneck.bg}`}>
            <h3 className={`font-black text-base mb-1 ${bottleneck.color}`}>{bottleneck.title}</h3>
            <p className={`text-sm font-medium opacity-90 leading-relaxed mb-4 ${bottleneck.color}`}>{bottleneck.desc}</p>
            <div className="flex gap-3 overflow-x-auto pb-3 snap-x custom-scrollbar">
              {bottleneck.suggestions.map((sug: any, idx: number) => (
                <Link
                  key={idx}
                  href={getUpgradeUrl(sug.category, sug.item.id)}
                  className="group flex flex-col text-right p-4 rounded-sm bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700/60 shadow-sm transition-all hover:-translate-y-1 hover:border-cyan-400/60 dark:hover:border-cyan-500/50 min-w-[250px] max-w-[250px] shrink-0 snap-center"
                >
                  <span className="flex justify-between items-start mb-2.5">
                    <span className={`font-mono text-[11px] font-black uppercase tracking-widest ${brandColor(sug.item.brand, sug.item.name, sug.category)}`}>{sug.item.brand}</span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{catMeta(sug.category).label}</span>
                  </span>
                  <span className="text-sm font-extrabold line-clamp-2 leading-relaxed mb-3 text-slate-800 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-400" title={sug.item.name}>{sug.item.name}</span>
                  {/* ملاحظة التركيب («لا يأتي بمبرّد») تُقال مع الاقتراح لا بدلَه */}
                  {sug.item.fitNote && <span className="-mt-1 mb-3 text-[11px] font-bold leading-relaxed text-amber-700 dark:text-amber-400">⚠️ {sug.item.fitNote}</span>}
                  <span className="mt-auto flex justify-between items-end pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm tabular-nums" dir="ltr">{formatPrice(sug.item.price)}<RiyalSign /></span>
                    <span className="text-[11.5px] font-black text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 group-hover:bg-cyan-600 group-hover:text-white px-3 py-1.5 rounded-sm transition-all">استبدال</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== الدعوة: عدّل عليها — لا «ابنِ من الصفر» وحده ===== */}
        <section className="rounded-sm border-x border-b border-t-2 border-slate-200 dark:border-slate-800 border-t-cyan-500/45 bg-white/75 dark:bg-[#0F172A]/65 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <span>
            <b className="block text-base font-black text-slate-900 dark:text-white">عجبتك؟ عدّل عليها وخلّها تجميعتك.</b>
            <span className="block mt-1 text-[12.5px] font-semibold text-slate-500 dark:text-slate-400">تنفتح في الباني بنفس القطع، وتقدر تبدّل أي قطعة ونفحص التوافق من جديد.</span>
          </span>
          <span className="flex flex-wrap gap-2">
            <Link href={builderHref} className="px-5 py-2.5 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[13px] font-black">افتحها في الباني &larr;</Link>
            <Link href="/builder" className="px-4 py-2.5 rounded-sm border border-slate-300 dark:border-slate-700 text-[13px] font-black text-slate-700 dark:text-slate-200 hover:border-cyan-500">ابدأ تجميعة من الصفر</Link>
          </span>
        </section>
      </div>
    </div>
  );
}
