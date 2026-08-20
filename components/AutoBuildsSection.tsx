import Link from 'next/link';
import { prisma } from '../lib/prisma';
import CountdownTimer from './CountdownTimer';
import { isAvailable } from '../lib/stores';
import { OFFER_INCLUDE } from '../lib/stores-server';
import { boardFitsCase, psuFitsCase } from '../lib/fit';
import { capacityGb } from '../lib/capacity';

/* ⚠️ كان هنا `export const revalidate = 86400` — وهو **بلا أثر**: Next يقرأ
   إعدادات المقطع من page/layout/route فقط، ويتجاهلها في ملفات المكوّنات
   بصمت. فالتعليق القديم ("تُعاد كل ٢٤ ساعة") كان يصف سلوكاً لم يحدث.
   التخزين تحكمه الصفحة المستضيفة (app/page.tsx). */

export default async function AutoBuildsSection() {
  const categories = await prisma.category.findMany({
    include: { components: { include: OFFER_INCLUDE } }
  });

  // نجلب فقط القطع المتوفرة (متجر واحد على الأقل عنده سعر ومخزون)
  // حتى لا تختار التجميعات المقترحة قطعاً غير متوفرة.
  const getCat = (name: string) =>
    (categories.find(c => c.name === name)?.components || []).filter(isAvailable);

  const cpus = getCat('CPU').sort((a, b) => a.price - b.price);
  const gpus = getCat('GPU').sort((a, b) => a.price - b.price);
  const mobos = getCat('Motherboard').sort((a, b) => a.price - b.price);
  const rams = getCat('RAM').sort((a, b) => a.price - b.price);
  const psus = getCat('PSU').sort((a, b) => a.price - b.price);
  const storages = getCat('Storage').sort((a, b) => a.price - b.price);
  const cases = getCat('Case').sort((a, b) => a.price - b.price);

  const parseSpecs = (specsStr: any) => {
    if (!specsStr) return {};
    try { return typeof specsStr === 'string' ? JSON.parse(specsStr) : specsStr; } catch (e) { return {}; }
  };

  /* ============ البذرة اليومية ============
     بديل Math.random: دالة تجزئة بسيطة (FNV-1a) على نص ثابت.
     نفس النص ⟵ نفس النتيجة دائماً، فتثبت التجميعة طوال اليوم. */
  const todaySeed = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const hashStr = (str: string): number => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  };

  /* اختيار ثابت من مصفوفة حسب البذرة — بديل getRandom العشوائي */
  const pickSeeded = (arr: any[], key: string): any => {
    if (!arr || arr.length === 0) return null;
    return arr[hashStr(todaySeed + ':' + key) % arr.length];
  };

  /* السعة تُقرأ من `lib/capacity.ts` — كانت هنا نسخةٌ ثانية تعد في
     تعليقها بأن «2x16GB» تساوي ٣٢ ثم تُعطي ١٦، لأن مطابقة «GB» تسبق
     مطابقة الضرب. نسختان تعني عيباً يُصلَح في واحدة ويعيش في الأخرى. */
  const capacityToGB = (raw: any): number | null => {
    const gb = capacityGb(raw);
    return gb > 0 ? gb : null;
  };

  // مستويات الأداء (performanceTier من 1 إلى 5) المسموح بها لكل فئة.
  const TIER_LEVELS: Record<'economy' | 'mid' | 'high', number[]> = {
    economy: [1, 2],
    mid: [3],
    high: [4, 5],
  };

  // مستويات احتياطية تُستخدم فقط إذا لم تتوفر قطعة بالمستوى الأساسي.
  const TIER_FALLBACK: Record<'economy' | 'mid' | 'high', number[]> = {
    economy: [1, 2, 3],
    mid: [2, 3, 4],
    high: [3, 4, 5],
  };

  const pickByTier = (arr: any[], tier: 'economy' | 'mid' | 'high') => {
    let pool = arr.filter(c => c.performanceTier != null && TIER_LEVELS[tier].includes(c.performanceTier));
    if (pool.length === 0) {
      pool = arr.filter(c => c.performanceTier != null && TIER_FALLBACK[tier].includes(c.performanceTier));
    }
    if (pool.length === 0) pool = arr;
    return pool;
  };

  const createTierBuild = (tier: 'economy' | 'mid' | 'high') => {
    // 1. تصفية المعالجات التي لها لوحة أم متوافقة فقط (لمنع خطأ الصفر)
    const cpusWithMobos = cpus.filter(cpu => {
      const socket = String(parseSpecs(cpu.specs).socket || '').trim();
      if (!socket) return false;
      return mobos.some(mb => String(parseSpecs(mb.specs).socket || '').trim() === socket);
    });

    if (cpusWithMobos.length === 0 || gpus.length === 0) return null;

    // 2. الكرت والمعالج حسب مستوى الأداء — اختيار ثابت بالبذرة
    const validGpus = pickByTier(gpus, tier);
    const gpu = pickSeeded(validGpus, tier + ':gpu') || validGpus[0];

    const validCpus = pickByTier(cpusWithMobos, tier);
    const cpu = pickSeeded(validCpus, tier + ':cpu') || validCpus[0];

    if (!cpu || !gpu) return null;

    const cpuSpecs = parseSpecs(cpu.specs);
    const gpuSpecs = parseSpecs(gpu.specs);
    // بعض الكروت تستخدم lengthMm وأخرى length — نلتقط الحالتين
    const reqGpuLength = parseFloat(gpuSpecs.lengthMm || gpuSpecs.length || '320');

    /* 3. اللوحة الأم — بالمستوى لا بقائمة شرائح ثابتة.
       الفلتر السابق كان يبحث عن أسماء شرائح مكتوبة يدوياً (H610/A620/…)
       ولم تكن في الكتالوج حينها، فكان فرع «الاقتصادي» ميتاً دائماً.
       (صارت A620 وH610 وH810 موجودة اليوم — وهذا بالضبط سبب اختيار
       المستوى بدل الأسماء: القائمة اليدوية تشيخ، والمستوى لا يشيخ.) */
    const compMobos = mobos.filter(
      mb => String(parseSpecs(mb.specs).socket || '').trim() === String(cpuSpecs.socket || '').trim()
    );
    if (compMobos.length === 0) return null;

    const moboPool = pickByTier(compMobos, tier);
    const mobo = pickSeeded(moboPool, tier + ':mobo') || moboPool[0];
    if (!mobo) return null;

    /* 4. الرام — سقف/أرضية السعة فقط.
       القيد السعري السابق (gpuPrice*0.6) كان يقصي كل الرامات في الاقتصادي:
       أرخص رام 16GB = 714 ريال بينما السقف كان 704. الفلتر كان ميتاً. */
    const moboSpecs = parseSpecs(mobo.specs);
    let compRams = rams.filter(
      r => String(parseSpecs(r.specs).type || '').trim() === String(moboSpecs.ramType || '').trim()
    );
    if (compRams.length === 0) compRams = rams;

    const capMax = tier === 'economy' ? 16 : tier === 'mid' ? 32 : 64;
    const capMin = tier === 'high' ? 32 : tier === 'mid' ? 16 : 0;
    const getCap = (r: any) => {
      const c = capacityToGB(parseSpecs(r.specs).capacity);
      return c == null ? 16 : c;
    };

    let filteredRams = compRams.filter(r => {
      const cap = getCap(r);
      return cap >= capMin && cap <= capMax;
    });
    if (filteredRams.length === 0) filteredRams = compRams.filter(r => getCap(r) <= capMax);
    if (filteredRams.length === 0) filteredRams = compRams;

    const ram = pickSeeded(filteredRams, tier + ':ram') || filteredRams[0];

    /* 5. مزود الطاقة — الاستهلاك يشمل كل القطع لا المعالج والكرت فقط.
       الحساب السابق كان يتجاهل اللوحة والرام رغم وجود tdpWattage لها
       في القاعدة، فيقترح مزوّداً أضعف من اللازم. */
    const totalDraw =
      (cpu.tdpWattage || 65) +
      (gpu.tdpWattage || 200) +
      (mobo.tdpWattage || 0) +
      ((ram && ram.tdpWattage) || 0) +
      50; // هامش للمراوح والمحيطيات
    const reqWattage = totalDraw + 150; // هامش أمان

    let compPsus = psus.filter(p => parseFloat(parseSpecs(p.specs).wattage || '0') >= reqWattage);
    if (compPsus.length === 0) compPsus = psus;

    const psuPool = pickByTier(compPsus, tier);
    const psu = pickSeeded(psuPool, tier + ':psu') || psuPool[0] || psus[0];

    /* 6. التخزين — سعةً **وسعراً**.
       كان يُختار بالسعة وحدها بلا أي حدّ سعري، فوقعت التجميعة الاقتصادية
       على Kingston KC3000 بـ١٥٦٦ ﷼ — ربعُ ثمن التجميعة كلّها في قرص
       إقلاع، والكتالوج فيه NVMe بـ٣٧٣. */
    const stMin = tier === 'high' ? 2048 : tier === 'mid' ? 1024 : 0;
    const stMax = tier === 'economy' ? 1024 : tier === 'mid' ? 2048 : 999999;
    const stPriceCap = tier === 'economy' ? 700 : tier === 'mid' ? 1200 : Infinity;
    /* ⚠️ القرص الميكانيكي يُستبعد من قرص النظام. سقفُ السعر وحده دفع
       التجميعتين الاقتصادية والمتوسطة إلى Seagate BarraCuda 1TB — قرصٌ
       دوّار في جهاز ألعابٍ سنة ٢٠٢٦، والكتالوج فيه NVMe بسعرٍ مقارب.
       يُقبل احتياطياً فقط إن لم يوجد سواه. */
    const isSSD = (st: any) => !/^HDD$/i.test(String(parseSpecs(st.specs).type || '').trim());
    const inRange = (st: any) => {
      const c = capacityToGB(parseSpecs(st.specs).capacity);
      const cap = c == null ? 0 : c;
      return cap >= stMin && cap <= stMax && st.price <= stPriceCap;
    };
    let filteredStorages = storages.filter(st => inRange(st) && isSSD(st));
    if (filteredStorages.length === 0) filteredStorages = storages.filter(st => st.price <= stPriceCap && isSSD(st));
    if (filteredStorages.length === 0) filteredStorages = storages.filter(isSSD);
    if (filteredStorages.length === 0) filteredStorages = storages;
    const storage = pickSeeded(filteredStorages, tier + ':storage') || filteredStorages[0];

    /* 7. الكيس — يقبل طول الكرت **ومقاس اللوحة**.
       فحص المقاس لم يكن موجوداً إطلاقاً، فكانت تُقترح لوحة ATX في كيس
       Micro-ATX ولوحة Micro-ATX في كيس Mini-ITX — تجميعتان لا تُركَّبان.
       انظر lib/fit.ts. */
    let compCases = cases.filter(
      c => parseFloat(parseSpecs(c.specs).maxGpuLength || '999') >= reqGpuLength
        && boardFitsCase(moboSpecs.formFactor, parseSpecs(c.specs).formFactor)
        && psuFitsCase(parseSpecs(psu?.specs).formFactor, parseSpecs(c.specs).psuFormFactor)
    );
    /* السقوط الاحتياطي يتخلّى عن الطول لا عن المقاس: كرتٌ أطول بقليل قد
       يدخل بنزع قفص الأقراص، أمّا لوحة ATX في كيس Mini-ITX فلا حيلة فيها. */
    if (compCases.length === 0) {
      compCases = cases.filter(c => boardFitsCase(moboSpecs.formFactor, parseSpecs(c.specs).formFactor));
    }
    if (compCases.length === 0) compCases = cases;

    /* ⚠️ كان هنا سقفٌ سعري (٥٠٠ للاقتصادي و٨٠٠ للمتوسط) بدل المستوى —
       لأن ٢٣ كيساً من ٢٧ كانت بلا `performanceTier`، فلا شيء يُصفّى به.
       وقد صُنّفت كلّها (scripts/set-case-tiers.ts)، فصار الكيس يُختار
       كما تُختار بقيّة القطع: بمستواه.

       والفرق ليس شكلياً: السقف السعري كان يُدخل HYTE Y60 بـ١٠٦٨ في
       التجميعة العليا وسعة كرته ٣٧٥ مم، ويُقصي Meshify 2 بـ٥٢٥ وسعته
       ٤٦٧ من المتوسطة لأنه… أرخص من أن يُستبعد لكنه لم يُفضَّل. */
    let filteredCases = pickByTier(compCases, tier);
    if (filteredCases.length === 0) filteredCases = compCases;
    const pcase = pickSeeded(filteredCases, tier + ':case') || filteredCases[0] || cases[0];

    // التجميع والنتيجة
    const selected = { cpu, gpu, motherboard: mobo, ram, psu, storage, case: pcase };
    let totalPrice = 0;
    const queryParams = new URLSearchParams();

    Object.entries(selected).forEach(([key, comp]: [string, any]) => {
      if (comp) {
        totalPrice += comp.price;
        queryParams.set(key, comp.id);
      }
    });

    return { price: totalPrice.toFixed(2), params: queryParams.toString() };
  };

  const ecoBuild = createTierBuild('economy');
  const midBuild = createTierBuild('mid');
  const highBuild = createTierBuild('high');

  const displayBuilds = [
    {
      id: 'high',
      title: 'تجميعة عليا (4K)',
      desc: 'لأقصى أداء بدون تنازلات، مخصصة لصناع المحتوى وألعاب الـ 4K.',
      bgTheme: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/50 hover:shadow-purple-500/10',
      textColor: 'text-purple-700 dark:text-purple-400',
      price: highBuild?.price || '0.00',
      params: highBuild?.params || '',
    },
    {
      id: 'mid',
      title: 'تجميعة متوسطة (1440p)',
      desc: 'أداء ممتاز في جميع ألعاب القصة والشوتر بإعدادات عالية.',
      bgTheme: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50 hover:shadow-blue-500/10',
      textColor: 'text-blue-700 dark:text-blue-400',
      price: midBuild?.price || '0.00',
      params: midBuild?.params || '',
    },
    {
      id: 'economy',
      title: 'تجميعة اقتصادية (1080p)',
      desc: 'مثالية لألعاب الرياضات الإلكترونية (Valorant, CS:GO) بتكلفة منخفضة.',
      bgTheme: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50 hover:shadow-emerald-500/10',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      price: ecoBuild?.price || '0.00',
      params: ecoBuild?.params || '',
    }
  ];

  const RiyalIcon = ({ size = 'h-4 w-4', colorClass = 'bg-current' }: { size?: string, colorClass?: string }) => (
    <div
      className={`${size} ${colorClass} inline-block align-middle`}
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

  return (
    <section className="max-w-7xl mx-auto px-4 pb-20 mt-10">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-slate-200 dark:border-slate-800/60 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
            تجميعات مقترحة ومحدثة تلقائياً
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
            تجميعات متوافقة تُختار يومياً من الكتالوج، وتبقى ثابتة حتى التحديث القادم.
          </p>
        </div>
        <CountdownTimer />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayBuilds.map((build) => (
          <div
            key={build.id}
            className={`border rounded-3xl p-8 flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1 ${build.bgTheme}`}
          >
            <div>
              <h3 className={`text-xl font-black mb-3 ${build.textColor}`}>{build.title}</h3>
              <p className={`text-sm mb-8 line-clamp-3 leading-loose font-bold opacity-80 ${build.textColor}`}>
                {build.desc}
              </p>
            </div>

            <div className="pt-6 border-t border-current/10">
              <span className={`block text-xs font-extrabold uppercase tracking-widest mb-2 opacity-60 ${build.textColor}`}>
                التكلفة التقريبية
              </span>
              <div className="flex items-center justify-between">
                <div className={`text-2xl font-black flex items-center justify-center gap-1.5 leading-none ${build.textColor}`}>
                  {parseFloat(Number(build.price).toFixed(2))} <RiyalIcon size="h-5 w-5" />
                </div>
                <Link
                  href={`/builder?${build.params}`}
                  className="text-xs font-black bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md px-5 py-2.5 rounded-xl transition-all active:scale-95"
                >
                  استعراض التجميعة
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}