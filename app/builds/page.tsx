import Link from 'next/link';
import { prisma } from '../../lib/prisma';
import CountdownTimer from '../../components/CountdownTimer';
import { capacityGb } from '../../lib/capacity';

export const revalidate = 86400;

export const metadata = {
  title: 'تجميعات مقترحة ومحدّثة تلقائياً',
  description: 'أفضل تجميعات الـ PC الجاهزة (اقتصادية، متوسطة، عليا) متوافقة 100%.',
};

export default async function AutoBuildsPage() {
  const categories = await prisma.category.findMany({
    include: { components: true }
  });

  const getCat = (name: string) => categories.find(c => c.name === name)?.components || [];

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
      /* ⚠️ كان `includes('2TB') || includes('4TB')` — فقرص ٨ تيرابايت
         ليس «كبيراً»، وقائمةُ أسماءٍ كهذه تسقط مع كل سعةٍ تُضاف.
         القاعدة بالقياس لا بالاسم: ٢ تيرابايت فأكثر. */
      const isLarge = capacityGb(specs.capacity) >= 2048;
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
      id: 'economy',
      title: 'تجميعة اقتصادية (1080p)',
      desc: 'مثالية لألعاب الرياضات الإلكترونية بتكلفة منخفضة جداً مع الحفاظ على التوافق التام.',
      theme: 'from-emerald-500/20 to-emerald-900/10 border-emerald-500/30 hover:border-emerald-400 hover:shadow-emerald-500/20 text-emerald-400',
      btn: 'bg-emerald-600 hover:bg-emerald-500',
      price: ecoBuild?.price || '0.00',
      params: ecoBuild?.params || '',
    },
    {
      id: 'mid',
      title: 'تجميعة متوسطة (1440p)',
      desc: 'أداء مستقر وممتاز لجميع ألعاب القصة والشوتر بإعدادات رسومية عالية.',
      theme: 'from-blue-500/20 to-blue-900/10 border-blue-500/30 hover:border-blue-400 hover:shadow-blue-500/20 text-blue-400',
      btn: 'bg-blue-600 hover:bg-blue-500',
      price: midBuild?.price || '0.00',
      params: midBuild?.params || '',
    },
    {
      id: 'high',
      title: 'تجميعة عليا (4K)',
      desc: 'لأقصى أداء ممكن بدون تنازلات، مصممة لأصحاب الفريمات العالية وصناع المحتوى.',
      theme: 'from-purple-500/20 to-purple-900/10 border-purple-500/30 hover:border-purple-400 hover:shadow-purple-500/20 text-purple-400',
      btn: 'bg-purple-600 hover:bg-purple-500',
      price: highBuild?.price || '0.00',
      params: highBuild?.params || '',
    }
  ];

  return (
    <div className="relative bg-[#060B14] overflow-hidden py-16 px-4">
      {/* شبكة الخلفية التجميلية */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* إضاءات محيطية */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            تجميعات مقترحة <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">ومحدثة تلقائياً</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto mb-8">
            نقوم بمسح قاعدة البيانات واختيار أفضل القطع المتوافقة لضمان حصولك على أعلى قيمة مقابل السعر، بدون أي عناء.
          </p>
          
          <CountdownTimer />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayBuilds.map((build) => (
            <div 
              key={build.id} 
              className={`relative p-8 rounded-3xl border bg-gradient-to-br backdrop-blur-sm transition-all duration-300 shadow-lg flex flex-col ${build.theme} hover:-translate-y-2`}
            >
              {/* إضاءة خلفية للبطاقة */}
              <div className="absolute inset-0 bg-white/5 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="mb-6">
                <span className={`inline-block px-3 py-1 bg-white/10 rounded-lg text-xs font-black uppercase tracking-widest mb-4 border border-white/5`}>
                  {build.id} TIER
                </span>
                <h2 className="text-2xl font-black text-white mb-3">{build.title}</h2>
                <p className="text-slate-300 text-sm font-medium leading-relaxed">
                  {build.desc}
                </p>
              </div>
              
              <div className="mt-auto pt-8 border-t border-white/10">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">التكلفة التقريبية</span>
                <div className="flex items-end gap-1 mb-8">
                  <span className={`text-4xl font-black ${build.theme.split(' ').pop()}`}>{build.price}</span>
                  <span className="text-slate-400 font-bold mb-1">ريال</span>
                </div>
                
                <Link 
                  href={`/builder?${build.params}`} 
                  className={`block w-full text-center py-4 text-white font-black rounded-xl shadow-lg transition-transform active:scale-95 ${build.btn}`}
                >
                  استعراض التجميعة
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}