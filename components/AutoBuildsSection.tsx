import Link from 'next/link';
import { prisma } from '../lib/prisma';
import CountdownTimer from './CountdownTimer';
import { isComponentAvailable } from '../lib/availability';

export default async function AutoBuildsSection() {
  const categories = await prisma.category.findMany({
    include: { components: true }
  });

  // نجلب فقط القطع المتوفرة (متجر واحد على الأقل عنده سعر ومخزون)
  // حتى لا تختار التجميعات المقترحة قطعاً غير متوفرة.
  const getCat = (name: string) =>
    (categories.find(c => c.name === name)?.components || []).filter(isComponentAvailable);

  const cpus = getCat('CPU').sort((a, b) => a.price - b.price);
  const gpus = getCat('GPU').sort((a, b) => a.price - b.price);
  const mobos = getCat('Motherboard').sort((a, b) => a.price - b.price);
  const rams = getCat('RAM').sort((a, b) => a.price - b.price);
  const psus = getCat('PSU').sort((a, b) => a.price - b.price);
  const storages = getCat('Storage').sort((a, b) => a.price - b.price);
  const cases = getCat('Case').sort((a, b) => a.price - b.price);

  const parseSpecs = (specsStr: any) => {
    if (!specsStr) return {};
    try { return typeof specsStr === 'string' ? JSON.parse(specsStr) : specsStr; } catch(e) { return {}; }
  };

  const getRandom = (arr: any[]) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

  // مستويات الأداء (performanceTier من 1 إلى 5) المسموح بها لكل فئة.
  // هذا هو الأساس الجديد: نعتمد على تصنيف الأداء الحقيقي، وليس ترتيب السعر.
  const TIER_LEVELS: Record<'economy' | 'mid' | 'high', number[]> = {
    economy: [1, 2],     // اقتصادي: مستوى 1 و 2
    mid: [3],            // متوسط: مستوى 3 فقط (الأساسي)
    high: [4, 5],        // عالي: مستوى 4 و 5
  };

  // مستويات احتياطية تُستخدم فقط إذا لم تتوفر قطعة بالمستوى الأساسي،
  // لتوسيع البحث للمستوى المجاور بدل الرجوع لكل القطع عشوائياً.
  const TIER_FALLBACK: Record<'economy' | 'mid' | 'high', number[]> = {
    economy: [1, 2, 3],
    mid: [2, 3, 4],
    high: [3, 4, 5],
  };

  // اختيار القطع حسب مستوى الأداء، مع نظام احتياطي متدرّج
  const pickByTier = (arr: any[], tier: 'economy' | 'mid' | 'high') => {
    // 1) جرّب المستويات الأساسية أولاً
    let pool = arr.filter(c => c.performanceTier != null && TIER_LEVELS[tier].includes(c.performanceTier));
    // 2) إن لم تتوفر، وسّع للمستويات المجاورة
    if (pool.length === 0) {
      pool = arr.filter(c => c.performanceTier != null && TIER_FALLBACK[tier].includes(c.performanceTier));
    }
    // 3) كحل أخير فقط (لو القطع كلها بدون تصنيف)، استخدم كل القطع
    if (pool.length === 0) pool = arr;
    return pool;
  };

  const createTierBuild = (tier: 'economy' | 'mid' | 'high') => {
    // 1. تصفية المعالجات التي لها لوحة أم متوافقة فقط (لمنع خطأ الصفر)
    const cpusWithMobos = cpus.filter(cpu => {
      const socket = String(parseSpecs(cpu.specs).socket);
      return mobos.some(mb => String(parseSpecs(mb.specs).socket) === socket);
    });

    if (cpusWithMobos.length === 0 || gpus.length === 0) return null;

    // 2. اختيار الكرت والمعالج حسب مستوى الأداء الحقيقي (وليس السعر)
    let validGpus = pickByTier(gpus, tier);
    let gpu = getRandom(validGpus) || validGpus[0];

    let validCpus = pickByTier(cpusWithMobos, tier);
    let cpu = getRandom(validCpus) || validCpus[0];

    if(!cpu || !gpu) return null;

    const gpuPrice = gpu.price;
    const cpuSpecs = parseSpecs(cpu.specs);
    const reqWattage = (cpu.tdpWattage || 65) + (gpu.tdpWattage || 200) + 100;
    const reqGpuLength = parseFloat(parseSpecs(gpu.specs).lengthMm || "320");

    // 3. اللوحة الأم
    const compMobos = mobos.filter(mb => String(parseSpecs(mb.specs).socket) === String(cpuSpecs.socket));
    let filteredMobos = compMobos.filter(mb => {
      const chipset = String(parseSpecs(mb.specs).chipset || '').toUpperCase();
      const isBasic = chipset.includes('H610') || chipset.includes('A620') || chipset.includes('A520') || chipset.includes('B450') || chipset.includes('H510');
      const isMid = chipset.includes('B760') || chipset.includes('B660') || chipset.includes('B650') || chipset.includes('B550');
      
      if (tier === 'economy') return (isBasic || isMid) && mb.price <= (gpuPrice * 0.8);
      if (tier === 'mid') return isMid && mb.price <= (gpuPrice * 1.5);
      return true;
    });
    if (filteredMobos.length === 0) filteredMobos = compMobos;
    let mobo = getRandom(filteredMobos) || filteredMobos[0];

    // 4. الرام — سقف صارم للسعة حسب الفئة + احتياطي ذكي لا يتجاوز السقف
    let ram = null;
    if (mobo) {
      const moboSpecs = parseSpecs(mobo.specs);
      const compRams = rams.filter(r => String(parseSpecs(r.specs).type) === String(moboSpecs.ramType));

      if (compRams.length > 0) {
        // سقف السعة لكل فئة (بالجيجابايت) — لا يُتجاوز أبداً
        const capCap = tier === 'economy' ? 16 : tier === 'mid' ? 32 : 64;
        const capMin = tier === 'high' ? 32 : tier === 'mid' ? 16 : 0;

        const getCap = (r: any) => parseFloat(parseSpecs(r.specs).capacity || "16");

        // 1) محاولة أساسية: ضمن نطاق الفئة + قيد سعري منطقي
        let filteredRams = compRams.filter(r => {
          const cap = getCap(r);
          if (tier === 'economy') return cap <= 16 && r.price <= (gpuPrice * 0.6);
          if (tier === 'mid') return cap >= 16 && cap <= 32 && r.price <= gpuPrice;
          return cap >= 32 && cap <= 64; // high
        });

        // 2) احتياطي: نخفّف القيد السعري فقط، لكن نُبقي سقف السعة صارماً
        if (filteredRams.length === 0) {
          filteredRams = compRams.filter(r => {
            const cap = getCap(r);
            return cap >= capMin && cap <= capCap;
          });
        }

        // 3) حل أخير: أقرب رام لا تتجاوز السقف (نتجنّب 48GB في المتوسط نهائياً)
        if (filteredRams.length === 0) {
          filteredRams = compRams.filter(r => getCap(r) <= capCap);
        }
        if (filteredRams.length === 0) filteredRams = compRams;

        ram = getRandom(filteredRams) || filteredRams[0];
      }
    }

    // 5. مزود الطاقة
    const compPsus = psus.filter(p => parseFloat(parseSpecs(p.specs).wattage || "0") >= reqWattage);
    let filteredPsus = compPsus.filter(p => {
      const psuW = parseFloat(parseSpecs(p.specs).wattage || "0");
      if (tier === 'economy') return psuW <= (reqWattage + 250) && p.price <= (gpuPrice * 0.6);
      if (tier === 'mid') return psuW <= (reqWattage + 350) && p.price <= gpuPrice;
      return true;
    });
    if (filteredPsus.length === 0 && compPsus.length > 0) filteredPsus = compPsus;
    let psu = getRandom(filteredPsus) || filteredPsus[0] || psus[0];

    // 6. التخزين
    let filteredStorages = storages.filter(st => {
      const capStr = String(parseSpecs(st.specs).capacity || '').toUpperCase();
      if (tier === 'economy') return (capStr.includes('500GB') || capStr.includes('1TB')) && st.price <= (gpuPrice * 0.6);
      if (tier === 'mid') return capStr.includes('1TB') || capStr.includes('2TB');
      if (tier === 'high') return capStr.includes('2TB') || capStr.includes('4TB');
      return true;
    });
    if (filteredStorages.length === 0) filteredStorages = storages;
    let storage = getRandom(filteredStorages) || filteredStorages[0];

    // 7. الكيس
    const compCases = cases.filter(c => parseFloat(parseSpecs(c.specs).maxGpuLength || "999") >= reqGpuLength);
    let filteredCases = compCases.filter(c => {
      if (tier === 'economy') return c.price <= 450 && c.price <= (gpuPrice * 0.6);
      if (tier === 'mid') return c.price <= 800;
      return true;
    });
    if (filteredCases.length === 0 && compCases.length > 0) filteredCases = compCases;
    let pcase = getRandom(filteredCases) || filteredCases[0] || cases[0];

    // التجميع والنتيجة
    const selected = { cpu, gpu, motherboard: mobo, ram, psu, storage, case: pcase };
    let totalPrice = 0;
    let queryParams = new URLSearchParams();
    
    Object.entries(selected).forEach(([key, comp]) => {
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
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            تجميعات مقترحة ومحدثة تلقائياً
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
            يتم توليد تجميعات متوافقة بشكل ديناميكي لضمان تنوع الخيارات مع كل تحديث.
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