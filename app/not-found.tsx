import Link from 'next/link';

/* ============ 404 — شكل ر (2026-10-31) ============
 * كانت «404» بحجم ٩٦ بكسل في الوسط وفوقها «ERROR · 404» بالإنجليزي. صارت بحجم باقي
 * الصفحات، ومعها بحثٌ يوصل الزائر لما جاء يدوّر عليه (?q= في تصفّح القطع، بلا
 * جافاسكربت)، وروابط لأهمّ الصفحات. والرسم من مخطّط الخلفية نفسه: لوحةٌ أمّ بخانة
 * PCIe فاضية — «القطعة مو مركّبة»، جملة الصفحة القديمة نفسها. */

const LINE = 'fill-none stroke-slate-400/60 dark:stroke-[#A8CCE4]/45';

function EmptySlotBoard() {
  return (
    <svg viewBox="0 0 520 420" className="w-full h-auto" aria-hidden="true">
      <g className={LINE} strokeWidth="1.4">
        <rect x="10" y="10" width="500" height="400" rx="4" />
        <rect x="190" y="70" width="110" height="110" rx="2" />
        <rect x="208" y="88" width="74" height="74" rx="1" />
        {[0, 1, 2, 3].map((i) => <rect key={`d${i}`} x={340 + 16 * i} y="50" width="9" height="230" rx="1" />)}
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={`v${i}`} x={150 + 12 * i} y="40" width="8" height="24" rx="1" />)}
        <rect x="60" y="300" width="200" height="10" rx="1" />
        <rect x="60" y="340" width="60" height="10" rx="1" />
        <circle cx="90" cy="380" r="10" />
      </g>
      <rect x="56" y="216" width="208" height="20" rx="2" className="fill-cyan-500/10 stroke-cyan-500 dark:stroke-cyan-400" strokeWidth="2" strokeDasharray="7 6" />
      <path d="M264 226 H330 L350 206 H440" className="fill-none stroke-cyan-500 dark:stroke-cyan-400" strokeWidth="1.5" />
      <circle cx="264" cy="226" r="4" className="fill-cyan-500 dark:fill-cyan-400" />
      <text x="445" y="200" className="fill-cyan-600 dark:fill-cyan-400" style={{ font: '900 26px ui-monospace, Consolas, monospace' }}>404</text>
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_480px] gap-10 lg:gap-12 items-center">
      <div className="flex flex-col gap-4">
        <span className="self-start px-2.5 py-1 rounded-sm bg-slate-100 dark:bg-slate-800 text-[12px] font-bold text-slate-600 dark:text-slate-300">
          الرمز <span className="font-mono">404</span>
        </span>
        <h1 className="text-3xl md:text-[38px] leading-[1.25] font-black tracking-tight text-slate-900 dark:text-white">
          الصفحة{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400">مو موجودة.</span>
        </h1>
        <p className="text-base font-semibold leading-[1.85] text-slate-600 dark:text-slate-400 max-w-md">
          كأنها قطعة مو مركّبة في اللوحة — الرابط يمكن تغيّر أو انحذفت الصفحة. دوّر على اللي تبيه، أو ارجع من هنا:
        </p>
        <form action="/components" method="get" role="search" className="relative max-w-md">
          <label htmlFor="nf-q" className="sr-only">ابحث عن قطعة</label>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            id="nf-q"
            name="q"
            type="search"
            placeholder="اسم القطعة أو الشركة..."
            className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700/70 rounded-sm pr-10 pl-24 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/30 placeholder:font-medium placeholder:text-slate-400"
          />
          <button type="submit" className="absolute left-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-sm bg-cyan-600 hover:bg-cyan-500 text-white text-[12.5px] font-black">ابحث</button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="px-5 py-2.5 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[13px] font-black shadow-lg shadow-cyan-500/25">الرئيسية</Link>
          {[['/components', 'تصفّح القطع'], ['/builder', 'الباني'], ['/deals', 'التخفيضات']].map(([href, label]) => (
            <Link key={href} href={href} className="px-4 py-2.5 rounded-sm border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-[#0F172A]/70 text-[13px] font-black text-slate-700 dark:text-slate-200 hover:border-cyan-500">{label}</Link>
          ))}
        </div>
      </div>
      <div className="rounded-sm border-x border-b border-t-2 border-slate-200 dark:border-slate-800 border-t-cyan-500/45 bg-white/60 dark:bg-[#0B1120]/50 p-4">
        <EmptySlotBoard />
      </div>
    </div>
  );
}
