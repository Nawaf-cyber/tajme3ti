import Link from 'next/link';
import { prisma } from '../lib/prisma';
import CountdownTimer from './CountdownTimer';

export default async function AutoBuildsSection() {
  // جلب القطع من قاعدة البيانات
  const categories = await prisma.category.findMany({
    include: { components: true }
  });

  const getCat = (name: string) => categories.find(c => c.name === name)?.components || [];

  // ترتيب القطع من الأرخص للأغلى
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

  const createTierBuild = (tier: 'economy' | 'mid' | 'high') => {
    let cpu, gpu;
    
    if (tier === 'economy') {
      cpu = cpus[0];
      gpu = gpus[0];
    } else if (tier === 'high') {
      cpu = cpus[cpus.length - 1]; 
      gpu = gpus[gpus.length - 1];
    } else {
      cpu = cpus[Math.floor(cpus.length / 2)]; 
      gpu = gpus[Math.floor(gpus.length / 2)];
    }

    if(!cpu || !gpu) return null;

    const cpuSpecs = parseSpecs(cpu.specs);
    const reqWattage = (cpu.tdpWattage || 0) + (gpu.tdpWattage || 0) + 200;
    const reqGpuLength = parseFloat(parseSpecs(gpu.specs).lengthMm || "320");

    const compMobos = mobos.filter(mb => String(parseSpecs(mb.specs).socket) === String(cpuSpecs.socket));
    let mobo = compMobos.find(mb => {
      const chipset = String(parseSpecs(mb.specs).chipset || '').toUpperCase();
      if (tier === 'economy') return chipset.includes('H610') || chipset.includes('A620') || chipset.includes('B450') || chipset.includes('B550');
      if (tier === 'mid') return chipset.includes('B760') || chipset.includes('B650');
      if (tier === 'high') return chipset.includes('Z790') || chipset.includes('X670') || chipset.includes('Z690');
      return true;
    }) || compMobos[0];

    let ram;
    if (mobo) {
      const moboSpecs = parseSpecs(mobo.specs);
      const compRams = rams.filter(r => String(parseSpecs(r.specs).type) === String(moboSpecs.ramType));
      ram = compRams.find(r => {
        const cap = parseFloat(parseSpecs(r.specs).capacity || "16");
        if (tier === 'economy') return cap <= 16;
        if (tier === 'mid') return cap === 32;
        if (tier === 'high') return cap >= 32;
        return true;
      }) || compRams[0];
    }

    const compPsus = psus.filter(p => parseFloat(parseSpecs(p.specs).wattage || "0") >= reqWattage);
    let psu = compPsus.find(p => {
      const eff = String(parseSpecs(p.specs).efficiency || '').toLowerCase();
      if (tier === 'economy') return eff.includes('bronze') || eff.includes('white');
      return eff.includes('gold') || eff.includes('platinum') || eff.includes('titanium');
    }) || compPsus[0];

    let storage = storages.find(st => {
      const specs = parseSpecs(st.specs);
      const isGen4 = String(specs.type || '').toLowerCase().includes('gen4');
      const capStr = String(specs.capacity || '').toUpperCase();
      const isLarge = capStr.includes('2TB') || capStr.includes('4TB');
      if (tier === 'economy') return !isGen4 && !isLarge;
      if (tier === 'mid') return isGen4 && !isLarge;
      if (tier === 'high') return isGen4 && isLarge;
      return true;
    }) || storages[0];

    const compCases = cases.filter(c => parseFloat(parseSpecs(c.specs).maxGpuLength || "999") >= reqGpuLength);
    let pcase = compCases.find(c => {
      if (tier === 'economy') return c.price <= 350;
      if (tier === 'mid') return c.price > 350 && c.price <= 650;
      if (tier === 'high') return c.price > 650;
      return true;
    }) || compCases[0];

    const selected = { cpu, gpu, motherboard: mobo, ram, psu, storage, case: pcase };
    
    let totalPrice = 0;
    let queryParams = new URLSearchParams();
    
    Object.entries(selected).forEach(([key, comp]) => {
      if (comp) {
        totalPrice += comp.price;
        queryParams.set(key, comp.id);
      }
    });

    return {
      price: totalPrice.toFixed(2),
      params: queryParams.toString()
    };
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
      
      {/* العنوان والعداد الزمني مدمجان بنفس عرض الأقسام الأخرى */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-slate-200 dark:border-slate-800/60 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            تجميعات مقترحة ومحدثة تلقائياً
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
            هذه التجميعات تم اختيارها برمجياً لضمان التوافق التام وأفضل قيمة مقابل السعر.
          </p>
        </div>
        <CountdownTimer />
      </div>

      {/* البطاقات الملونة */}
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