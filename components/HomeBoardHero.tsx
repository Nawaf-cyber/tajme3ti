import Link from 'next/link';
import { formatPrice } from '../lib/price';
import { GPU_PERF_SOURCE } from '../lib/gpu-perf';
import type { HomeShowcase } from '../lib/home-showcase';
import RiyalSign from './RiyalSign';

/* ============ رأس الرئيسية — شكل س١ «البرق في المقبس» (2026-11-01) ============
 * طلب نوّاف رئيسيّةً «توضح الموقع نفس القديمة يوم كان شعارنا بالوسط وتحسه هيبة».
 * فالرأس لوحةٌ أمّ مرسومة بخطّ المخطّط نفسه الذي في الخلفية (ن٢)، والشعار مكان
 * المعالج في وسطها، ومن قطعها تخرج تعليقاتٌ أربعة تشرح الموقع بأمثلةٍ من القاعدة
 * (lib/home-showcase): الذاكرة → التوافق، منفذ الكرت → المتاجر، الـVRM → الأداء،
 * الشريحة → التجميعات الجاهزة.
 *
 * ⚠️ العناصر نفسها في كلّ المقاسات (عنوانٌ واحد للزاحف): من 1280 تُرصّ فوق الرسم
 * بإحداثيّاته (1152×800)، ودونه تنسدل عموداً — الشعار فالعنوان فالتعليقات بطاقات.
 * والرسم آخر العناصر في الصفحة وaria-hidden: تسمياته (SOCKET، VRM…) لا تسبق العنوان. */

const BOLT = 'M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z';
const storesAr = (n: number) => (n === 1 ? 'متجر واحد' : n === 2 ? 'متجرين' : n <= 10 ? `${n} متاجر` : `${n} متجراً`);
const Num = ({ children }: { children: React.ReactNode }) => <span className="font-mono tabular-nums" dir="ltr">{children}</span>;

/* ---- الرسم: كلّ شكلٍ بـpathLength=1 فيُخطّ عند التحميل (globals.css · hb-draw) ---- */
const P = { pathLength: 1 } as const;
function BoardDrawing() {
  const fins = Array.from({ length: 9 }, (_, i) => 372 + i * 11);
  const ram = [702, 726, 750, 774];
  const pins = Array.from({ length: 12 }, (_, r) => 134 + r * 9);
  const hatch = Array.from({ length: 9 }, (_, i) => 804 + i * 11);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1152 800"
      className="hidden xl:block absolute inset-0 w-[1152px] h-[800px] pointer-events-none text-[#2F5D8A] dark:text-[#A8CCE4]"
    >
      <g className="hb-draw" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.3">
        <rect x="206" y="24" width="740" height="752" rx="6" {...P} />
        {[[226, 44], [926, 44], [226, 756], [926, 756], [576, 756]].map(([x, y]) => <circle key={`h${x}${y}`} cx={x} cy={y} r="7" {...P} />)}
        {/* المقبس — الشعار فوقه */}
        <rect x="496" y="60" width="160" height="160" rx="3" {...P} />
        <rect x="512" y="76" width="128" height="128" rx="2" strokeDasharray="4 5" {...P} />
        {/* الـVRM بزعانفه */}
        <rect x="362" y="64" width="108" height="152" rx="2" {...P} />
        {fins.map((x) => <path key={`f${x}`} d={`M${x} 72V208`} {...P} />)}
        {/* الذاكرة */}
        {ram.map((x) => (
          <g key={`r${x}`}>
            <rect x={x} y="52" width="12" height="184" rx="1" {...P} />
            <rect x={x - 1} y="46" width="14" height="8" rx="1" {...P} />
          </g>
        ))}
        {/* موصل الطاقة ٢٤ سنّاً */}
        <rect x="848" y="124" width="30" height="116" rx="2" {...P} />
        {pins.map((y) => (
          <g key={`p${y}`}>
            <circle cx="858" cy={y} r="1.7" {...P} />
            <circle cx="868" cy={y} r="1.7" {...P} />
          </g>
        ))}
        <path d="M656 96H702M656 112H702M656 168H702M656 184H702M470 120H496M470 160H496" strokeOpacity="0.35" {...P} />
        {/* M.2 ومنفذا PCIe والشريحة */}
        <rect x="300" y="624" width="210" height="16" rx="1" {...P} />
        <circle cx="520" cy="632" r="5" {...P} />
        <rect x="260" y="660" width="500" height="20" rx="1" {...P} />
        <rect x="260" y="710" width="170" height="14" rx="1" {...P} />
        <rect x="800" y="640" width="104" height="100" rx="2" {...P} />
        {hatch.map((x) => <path key={`c${x}`} d={`M${x} 736L${x + 30} 646`} {...P} />)}
      </g>
      <path d="M500 64h14l-14 14z" fill="currentColor" fillOpacity="0.4" className="hb-fade" style={{ '--d': '1.2s' } as React.CSSProperties} />
      {/* نبضةٌ على محيط اللوحة كما في الخلفية */}
      <rect className="bp-pulse" x="206" y="24" width="740" height="752" rx="6" pathLength={100} style={{ '--pulse': '15s', '--pd': '3s' } as React.CSSProperties} />

      {/* خطوط التعليقات — بعد أن تكتمل اللوحة */}
      <g className="hb-draw text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" strokeOpacity="0.8" strokeWidth="1.2" style={{ '--d': '1.5s' } as React.CSSProperties}>
        <path d="M786 96H966" {...P} />
        <path d="M362 140H186" {...P} />
        <path d="M260 670H186" {...P} />
        <path d="M904 690H966" {...P} />
      </g>
      <g className="hb-fade text-cyan-600 dark:text-cyan-400" fill="currentColor" style={{ '--d': '1.5s' } as React.CSSProperties}>
        {[[786, 96], [362, 140], [260, 670], [904, 690]].map(([x, y]) => <circle key={`d${x}${y}`} cx={x} cy={y} r="3.5" />)}
      </g>
      <g className="hb-fade" fill="currentColor" fillOpacity="0.75" style={{ font: '11px ui-monospace, Consolas, monospace', '--d': '1.6s' } as React.CSSProperties}>
        <text x="702" y="252">DIMM · DDR5</text>
        <text x="378" y="232">VRM</text>
        <text x="500" y="52">SOCKET</text>
        <text x="300" y="616">M.2</text>
        <text x="610" y="700">PCIe 5.0 x16</text>
        <text x="806" y="760">CHIPSET</text>
      </g>
    </svg>
  );
}

/* تعليقٌ على قطعة: بطاقةٌ في الجوال، ونصٌّ مرصوصٌ على طرف الرسم من 1280 */
function Callout({ n, title, href, pos, children }: { n: string; title: string; href: string; pos: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`group block rounded-sm border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0F172A]/60 p-4 xl:p-0 xl:border-0 xl:bg-transparent xl:dark:bg-transparent xl:absolute xl:w-[176px] ${pos}`}
    >
      <b className="flex items-center gap-2 text-[14.5px] font-black text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
        <span className="w-6 h-6 shrink-0 flex items-center justify-center rounded-sm border border-cyan-500/60 bg-cyan-500/10 font-mono text-[12px] font-black text-cyan-700 dark:text-cyan-400">{n}</span>
        {title}
      </b>
      <p className="mt-1.5 text-[12.5px] font-semibold leading-[1.75] text-slate-600 dark:text-slate-400">{children}</p>
    </Link>
  );
}

export default function HomeBoardHero({ show, partsCount, storesCount }: { show: HomeShowcase; partsCount: number; storesCount: number }) {
  const g = show.gpu;
  const cheap = g?.quotes[0];
  const dear = g?.quotes[g.quotes.length - 1];
  const priced = show.prebuilds.filter((p) => p.total > 0);
  const minP = priced.length ? Math.min(...priced.map((p) => p.total)) : 0;
  const maxP = priced.length ? Math.max(...priced.map((p) => p.total)) : 0;

  return (
    <section className="relative mx-auto w-full xl:w-[1152px] xl:h-[800px] flex flex-col items-center xl:block pt-4 xl:pt-0">
      {/* الشعار — مكان المعالج في الرسم */}
      <span className="relative xl:absolute xl:left-[524px] xl:top-[88px] w-20 h-20 xl:w-[104px] xl:h-[104px] rounded-[4px] bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_0_1px_rgba(103,232,249,0.4),0_0_60px_rgba(6,182,212,0.5)]">
        <span aria-hidden="true" className="absolute -inset-16 -z-10 rounded-full bg-cyan-500/20 blur-3xl hidden dark:block"></span>
        <svg viewBox="0 0 24 24" fill="#FFFFFF" className="w-11 h-11 xl:w-[58px] xl:h-[58px]" aria-hidden="true"><path d={BOLT} /></svg>
      </span>

      {/* العنوان والأزرار — في المنطقة الفاضية بين المقبس ومنافذ PCIe */}
      <div className="relative mt-7 xl:mt-0 xl:absolute xl:top-[262px] xl:inset-x-[256px] flex flex-col items-center text-center gap-5 xl:gap-[22px]">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm border border-cyan-500/35 bg-cyan-500/[0.07] dark:bg-cyan-950/30 text-[12.5px] font-extrabold text-cyan-800 dark:text-cyan-300">
          <span className="w-[7px] h-[7px] rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_2px] shadow-cyan-500/50"></span>
          منصة تجميع الحواسيب في السعودية
        </span>
        <h1 className="text-[44px] sm:text-6xl xl:text-[66px] leading-[1.06] font-black tracking-tight text-slate-900 dark:text-white">
          جمّع بثقة.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-300">من أول مرة.</span>
        </h1>
        <p className="text-[17px] xl:text-lg font-semibold leading-relaxed text-slate-600 dark:text-slate-400">
          نفحص توافق كل قطعة، ونقارن أسعارها في {storesAr(storesCount)} سعودية.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/builder" className="group relative overflow-hidden flex items-center justify-center gap-2 px-8 py-4 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[15.5px] font-black shadow-lg shadow-cyan-500/30 transition-colors">
            ابدأ التجميع
            <span className="group-hover:-translate-x-1 transition-transform" aria-hidden="true">&larr;</span>
          </Link>
          <Link href="/components" className="flex items-center justify-center gap-1.5 px-8 py-4 rounded-sm border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-[#0F172A]/70 text-[15.5px] font-black text-slate-800 dark:text-slate-200 hover:border-cyan-500 transition-colors">
            تصفّح <Num>{partsCount}</Num> قطعة
          </Link>
        </div>
      </div>

      {/* التعليقات الأربعة — غلافها يذوب من 1280 (contents) فتُرصّ على الرسم */}
      <div className="relative mt-10 xl:mt-0 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 xl:contents">
        <Callout n="١" title="يفحص التوافق" href="/builder" pos="xl:top-[70px] xl:right-0">
          المقبس، نوع الذاكرة، مقاس اللوحة، طول الكرت وقدرة المزوّد — مع كل قطعة تضيفها.
        </Callout>
        <Callout n="٢" title={`يقارن ${storesAr(storesCount)}`} href={g ? `/components/${g.id}` : '/components'} pos="xl:top-[642px] xl:left-0">
          {g && cheap && dear ? (
            <>كرت <bdi>{g.brand} {g.perf?.chip}</bdi> بـ<Num>{formatPrice(Math.round(cheap.price))}</Num> في {cheap.store}، وبـ<Num>{formatPrice(Math.round(dear.price))}</Num> في {dear.store}.</>
          ) : (
            <>نجيب سعر كل قطعة من كل المتاجر ونعلّم لك الأرخص.</>
          )}
        </Callout>
        <Callout n="٣" title="أداء مقيس" href={g ? `/components/${g.id}` : '/how-we-rate'} pos="xl:top-[112px] xl:left-0">
          {g?.perf ? (
            <>كرت <bdi>{g.perf.chip}</bdi> يطلع <Num>{Math.round(g.perf.f1440)}</Num> إطار بدقّة <Num>1440p</Num> — من قياسات <bdi>{GPU_PERF_SOURCE.name}</bdi>.</>
          ) : (
            <>إطارات الألعاب من قياسات <bdi>{GPU_PERF_SOURCE.name}</bdi> — لا تقدير.</>
          )}
        </Callout>
        <Callout n="٤" title={`${show.prebuilds.length} تجميعات جاهزة`} href="/prebuilds" pos="xl:top-[662px] xl:right-0">
          {priced.length ? (
            <>مفحوصة في الباني — من <Num>{formatPrice(Math.round(minP))}</Num> إلى <Num>{formatPrice(Math.round(maxP))}</Num> ريال.</>
          ) : (
            <>مفحوصة في الباني، افتحها وعدّلها على كيفك.</>
          )}
        </Callout>
      </div>

      <BoardDrawing />
    </section>
  );
}

/* ============ «تفاصيل اللوحة» — الأمثلة الثلاثة كاملةً تحت الرأس ============ */
export function HomeBoardDetails({ show }: { show: HomeShowcase }) {
  const g = show.gpu;
  const c = show.cpu;
  const panel = 'relative flex flex-col gap-3.5 rounded-sm border-x border-b border-t-2 border-slate-200 dark:border-slate-800 border-t-cyan-500 dark:border-t-cyan-500 bg-white/70 dark:bg-[#0F172A]/60 p-5';
  const Head = ({ n, k, t }: { n: string; k: string; t: string }) => (
    <span className="flex items-center gap-2 text-[12px] font-extrabold text-slate-500 dark:text-slate-400">
      <span className="w-6 h-6 flex items-center justify-center rounded-sm border border-cyan-500/60 bg-cyan-500/10 font-mono text-[12px] font-black text-cyan-700 dark:text-cyan-400">{n}</span>
      <span className="font-mono" dir="ltr">DETAIL {k}</span> · {t}
    </span>
  );
  const Corner = () => <span aria-hidden="true" className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-cyan-500/60 border-l-[14px] border-l-transparent"></span>;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
        <span className="h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_10px] shadow-cyan-500/40"></span>
        تفاصيل اللوحة
        <small className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">· وش يسوي الموقع، بأمثلة من اليوم</small>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* ١ التوافق */}
        <div className={panel}>
          <Corner />
          <Head n="١" k="A" t="التوافق" />
          {c ? (
            <p className="text-[13.5px] font-bold leading-relaxed text-slate-800 dark:text-slate-200">
              <bdi className="font-black">{c.name}</bdi> ← <Num>{c.boards}</Num> لوحة أم متوفّرة تركب عليه، أرخصها <Num>{formatPrice(c.cheapestBoard)}</Num><RiyalSign />
            </p>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            {[c ? `المقبس ${c.socket}` : 'المقبس', 'نوع الذاكرة', 'مقاس اللوحة', 'طول الكرت', 'قدرة المزوّد'].map((t) => (
              <span key={t} className="text-[12px] font-extrabold px-2 py-0.5 rounded-sm border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">✓ {t}</span>
            ))}
          </div>
          <Link href={c ? `/builder?cpu=${c.id}` : '/builder'} className="mt-auto text-[13px] font-extrabold text-cyan-700 dark:text-cyan-400 hover:underline">جرّبه في الباني &larr;</Link>
        </div>

        {/* ٢ الأسعار */}
        <div className={panel}>
          <Corner />
          <Head n="٢" k="B" t="الأسعار" />
          {g ? (
            <>
              <bdi className="text-[13.5px] font-black text-slate-800 dark:text-slate-200">{g.brand} {g.name}</bdi>
              <div className="flex flex-wrap gap-1.5">
                {g.quotes.map((q, i) => (
                  <span
                    key={q.store}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border border-s-2 text-[12px] font-extrabold ${i === 0 ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
                    style={{ borderInlineStartColor: q.color ?? undefined }}
                  >
                    {q.store} <Num>{formatPrice(q.price)}</Num>{i === 0 ? ' · الأرخص' : ''}
                  </span>
                ))}
              </div>
              <p className="text-[12.5px] font-bold text-slate-600 dark:text-slate-400">
                الفرق بين أرخص وأغلى متجر <span className="font-mono font-black text-rose-600 dark:text-rose-400" dir="ltr">{formatPrice(Math.round(g.quotes[g.quotes.length - 1].price - g.quotes[0].price))}</span> ريال
              </p>
              <Link href={`/components/${g.id}`} className="mt-auto text-[13px] font-extrabold text-cyan-700 dark:text-cyan-400 hover:underline">شوف عروضه كلها &larr;</Link>
            </>
          ) : (
            <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-400">نجيب سعر كل قطعة من كل المتاجر ونعلّم لك الأرخص.</p>
          )}
        </div>

        {/* ٣ الأداء */}
        <div className={panel}>
          <Corner />
          <Head n="٣" k="C" t="الأداء" />
          {g?.perf ? (
            <>
              <span className="text-[13.5px] font-black text-slate-800 dark:text-slate-200"><bdi>{g.perf.chip}</bdi> · متوسّط الإطارات في الألعاب</span>
              <div className="flex flex-col gap-2">
                {([['1080p', g.perf.f1080], ['1440p', g.perf.f1440], ['4K', g.perf.f4k]] as const).map(([r, f]) => (
                  <span key={r} className="grid grid-cols-[48px_1fr_68px] items-center gap-2.5">
                    <span className="font-mono text-[12px] font-bold text-slate-500 dark:text-slate-400" dir="ltr">{r}</span>
                    <span className="h-2.5 rounded-sm bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <span className="block h-full rounded-sm bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${Math.round((f / g.perf!.f1080) * 100)}%` }}></span>
                    </span>
                    <span className="text-[13px] font-black text-slate-900 dark:text-white"><Num>{Math.round(f)}</Num> إطار</span>
                  </span>
                ))}
              </div>
              <a href={GPU_PERF_SOURCE.url} target="_blank" rel="noopener noreferrer" className="mt-auto text-[12px] font-bold text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 underline">
                من قياسات {GPU_PERF_SOURCE.name} — لا تقدير
              </a>
            </>
          ) : (
            <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-400">إطارات الألعاب لكل كرت من قياسات {GPU_PERF_SOURCE.name}.</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============ التجميعات الجاهزة — الستّ بمجموعها اللحظيّ ============ */
const BUDGET: Record<string, string> = { economic: 'اقتصادية', midrange: 'متوسطة', highend: 'عالية' };
export function HomePrebuilds({ show }: { show: HomeShowcase }) {
  if (!show.prebuilds.length) return null;
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <h2 className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          <span className="h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_10px] shadow-cyan-500/40"></span>
          تجميعات جاهزة
          <small className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">· اخترناها وفحصناها في الباني</small>
        </h2>
        <Link href="/prebuilds" className="text-[13px] font-extrabold text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300">كلها &larr;</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
        {show.prebuilds.map((p) => (
          <Link
            key={p.id}
            href={p.href}
            className="group relative flex flex-col gap-2 rounded-sm border-x border-b border-t-2 border-slate-200 dark:border-slate-800 border-t-cyan-500/70 dark:border-t-cyan-500/70 bg-white/70 dark:bg-[#0F172A]/60 p-4 hover:border-x-cyan-500/40 hover:border-b-cyan-500/40 transition-colors"
          >
            <span className="text-[12px] font-extrabold text-cyan-700 dark:text-cyan-400">{BUDGET[p.budgetType] ?? ''}</span>
            <b className="text-[14px] font-black leading-snug text-slate-900 dark:text-white min-h-[2.6em] group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">{p.title}</b>
            <span className="font-mono text-[17px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums" dir="ltr">{formatPrice(Math.round(p.total))}<RiyalSign /></span>
            <span className={`text-[12px] font-bold ${p.missing ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {p.missing ? `${p.missing === 1 ? 'قطعة نافدة' : `${p.missing} قطع نافدة`} — بدونها` : 'افتحها في الباني ←'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
