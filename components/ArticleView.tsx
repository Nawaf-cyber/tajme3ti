/* ============ صفحة المقال — شكل ل (2026-10-30) ============
 *
 * صفحتا الخبر والدليل كانتا نسختين متطابقتين تقريباً، وفيهما عيبٌ ظاهر على
 * الشاشة العريضة: الغلاف يتمدّد بعرض الشاشة (٢٥٤٥ بكسل) والعنوان فوقه — والغلاف
 * المولَّد (/covers/) مكتوبٌ فيه العنوان نفسه، فيظهر العنوان مرّتين متراكبين.
 *
 * الآن: العنوان مرّةً واحدة، والغلاف المكتوب يبقى للمشاركة وبطاقات القوائم فقط،
 * والصورة الحقيقيّة (تصوير) تُعرض تحت الرأس بعرض العمود. عمودُ قراءةٍ ٧٤٠ بكسل،
 * و«الخلاصة» فوقه لمن يستعجل، والعناوين الفرعيّة بشريط القسم (lib/article-body).
 * وعمودٌ جانبيّ بأسعار الشرائح التي يذكرها المقال الآن (lib/article-parts).
 */
import Link from 'next/link';
import { prisma } from '../lib/prisma';
import { AUTHOR, GUIDE_CATEGORIES } from '../lib/content';
import { parseArticle, readingMinutes } from '../lib/article-body';
import { mentionedParts, type MentionedPart } from '../lib/article-parts';
import { gpuChipsIn } from '../lib/gpu-perf';
import { cpuChipsIn } from '../lib/cpu-perf';
import { longDateAr } from '../lib/time-ago';
import { formatPrice } from '../lib/price';
import { CATEGORY_META } from '../lib/category-meta';
import { Panel } from './Panel';
import RiyalSign from './RiyalSign';

type Article = { id: string; title: string; summary: string; content: string; category: string; imageUrl: string | null; createdAt: Date };

/* الغلاف المولَّد بطاقةُ عنوان لا صورة — لا يُعرض فوق عنوانٍ هو نفسه */
const isTitleCard = (url: string) => url.startsWith('/covers/');

/* تصنيف الخبر بالعربية: «GPU» ← «كروت الشاشة» */
const NEWS_CAT: Record<string, string> = { GPU: 'كروت الشاشة', CPU: 'المعالجات' };
const newsCatLabel = (c: string) => NEWS_CAT[c] ?? CATEGORY_META[c]?.label ?? (c === 'عام' ? '' : c);

/* «دقيقة» · «دقيقتين» · «3 دقائق» · «12 دقيقة» */
const minutesAr = (n: number) => (n === 1 ? 'دقيقة' : n === 2 ? 'دقيقتين' : n <= 10 ? `${n} دقائق` : `${n} دقيقة`);

const mentions = (text: string, p: MentionedPart) =>
  (p.kind === 'GPU' ? gpuChipsIn(text) : cpuChipsIn(text)).includes(p.chip);

export default async function ArticleView({ article, kind }: { article: Article; kind: 'news' | 'guide' }) {
  const guide = kind === 'guide';
  const parsed = parseArticle(article.content);
  const [parts, next] = await Promise.all([
    mentionedParts(`${article.title}\n${article.content}`),
    prisma.news.findMany({
      where: { category: { in: GUIDE_CATEGORIES }, id: { not: article.id } },
      orderBy: { createdAt: 'desc' },
      take: 2,
      select: { id: true, title: true, createdAt: true },
    }),
  ]);

  const lead = article.summary && article.summary !== 'بدون ملخص' ? article.summary : null;
  const headings = parsed.blocks.filter((b) => b.type === 'h') as { type: 'h'; text: string; id: string }[];
  const catLabel = guide ? '' : newsCatLabel(article.category);
  const photo = article.imageUrl && !isTitleCard(article.imageUrl) ? article.imageUrl : null;

  /* سطر السعر داخل النصّ: بعد أوّل فقرةٍ تذكر شريحةً لها سعرٌ عندنا — مرّةً واحدة */
  let calloutAt = -1;
  let callout: MentionedPart | null = null;
  for (let i = 0; i < parsed.blocks.length && !callout; i++) {
    const b = parsed.blocks[i];
    if (b.type !== 'p') continue;
    const p = parts.find((x) => mentions(b.text, x));
    if (p) { calloutAt = i; callout = p; }
  }

  const toc = [...(parsed.summary ? [{ id: 'khulasa', text: 'الخلاصة' }] : []), ...headings];
  const hasRail = parts.length > 0 || headings.length >= 2;
  const gpus = parts.some((p) => p.kind === 'GPU');
  const cpus = parts.some((p) => p.kind === 'CPU');
  const partsTitle = gpus && cpus ? 'القطع المذكورة' : gpus ? 'الكروت المذكورة' : 'المعالجات المذكورة';

  const accent = guide ? 'text-emerald-700 dark:text-emerald-400' : 'text-cyan-700 dark:text-cyan-400';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-16">
      <nav aria-label="مسار الصفحة" className="mb-5 text-[12px] font-bold text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
        <Link href="/" className="hover:text-cyan-700 dark:hover:text-cyan-400">الرئيسية</Link>
        <span aria-hidden="true">‹</span>
        <Link href={guide ? '/guides' : '/news'} className="hover:text-cyan-700 dark:hover:text-cyan-400">{guide ? 'الأدلّة' : 'الأخبار'}</Link>
        {catLabel && (<><span aria-hidden="true">‹</span><span className="text-slate-700 dark:text-slate-300">{catLabel}</span></>)}
      </nav>

      <div className={hasRail ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-9 items-start' : ''}>
        <article className={`min-w-0 max-w-[740px] ${hasRail ? '' : 'mx-auto'}`}>
          <div className="flex flex-wrap items-center gap-2 mb-3.5">
            <span className={`px-2.5 py-1 rounded-sm text-[12px] font-black border ${guide ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-400' : 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-500/40 text-cyan-700 dark:text-cyan-400'}`}>
              {guide ? 'دليل' : 'خبر'}
            </span>
            {catLabel && <span className="px-2.5 py-1 rounded-sm text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{catLabel}</span>}
            <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400">
              {longDateAr(article.createdAt)} · قراءة {minutesAr(readingMinutes(parsed.words))}
            </span>
          </div>

          <h1 className="text-3xl md:text-[38px] leading-[1.35] font-black tracking-tight text-slate-900 dark:text-white mb-4">{article.title}</h1>
          {lead && <p className="text-[17px] md:text-lg font-semibold leading-[1.9] text-slate-700 dark:text-slate-200 mb-5">{lead}</p>}

          {/* سطر الكاتب — إشارة E-E-A-T (مراجعة أدسنس 2026-10-15) */}
          <div className="flex items-center gap-3 py-3 mb-6 border-y border-slate-200 dark:border-slate-800">
            <span className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-black flex items-center justify-center">{AUTHOR.name.trim().charAt(0)}</span>
            <span className="min-w-0">
              <b className="block text-[13.5px] font-black text-slate-900 dark:text-white">بقلم {AUTHOR.name}</b>
              <span className="block text-[12px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">{AUTHOR.bio}</span>
            </span>
          </div>

          {photo && (
            <figure className="mb-7 overflow-hidden rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0B1120]">
              <img src={photo} alt={article.title} className="w-full aspect-[16/9] object-cover" />
            </figure>
          )}

          {parsed.summary && (
            <div id="khulasa" className="scroll-mt-24 mb-8 rounded-sm border border-cyan-500/35 border-s-[3px] border-s-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/25 px-4 py-4">
              <p className={`text-[12px] font-black mb-1.5 ${accent}`}>الخلاصة قبل ما تقرأ</p>
              <p className="text-[15px] font-bold leading-[1.9] text-slate-800 dark:text-slate-100">{parsed.summary}</p>
            </div>
          )}

          <div className="text-slate-700 dark:text-slate-300">
            {parsed.blocks.map((b, i) =>
              b.type === 'h' ? (
                <h2 key={i} id={b.id} className="scroll-mt-24 flex items-center gap-2.5 mt-9 mb-3 text-[22px] font-black leading-snug text-slate-900 dark:text-white">
                  <span aria-hidden="true" className="w-1.5 h-7 shrink-0 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500"></span>
                  {b.text}
                </h2>
              ) : (
                <div key={i}>
                  <p className="mb-5 text-base md:text-[17px] font-medium leading-[2] whitespace-pre-line break-words">{b.text}</p>
                  {i === calloutAt && callout && (
                    <Link href={`/components/${callout.id}`} className="group -mt-1 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-slate-200 dark:border-slate-800 border-s-2 border-s-emerald-500 bg-white/80 dark:bg-[#0F172A]/75 px-4 py-3">
                      <span className="text-[13.5px] font-extrabold text-slate-700 dark:text-slate-200">
                        وعندنا في السعودية الحين: <b className="text-slate-900 dark:text-white" dir="ltr">{callout.chip}</b> من{' '}
                        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 tabular-nums" dir="ltr">{formatPrice(callout.price)}<RiyalSign /></span>
                        <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400"> · {callout.store}</span>
                      </span>
                      <span className="text-[12.5px] font-black text-cyan-700 dark:text-cyan-400 group-hover:underline">قارن المتاجر &larr;</span>
                    </Link>
                  )}
                </div>
              ),
            )}
          </div>

          <div className="flex justify-center gap-2 pt-3 pb-8" aria-hidden="true">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
          </div>

          {next.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2.5 mb-3 text-xl font-black text-slate-900 dark:text-white">
                <span aria-hidden="true" className="w-1.5 h-7 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_10px] shadow-cyan-500/40"></span>
                اقرأ بعدها
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {next.map((n) => (
                  <Link key={n.id} href={`/guides/${n.id}`} className="group flex flex-col gap-2 rounded-sm border-x border-b border-t-2 border-slate-200 dark:border-slate-800 border-t-emerald-500/70 bg-white/80 dark:bg-[#0F172A]/75 px-4 py-4 hover:-translate-y-0.5 transition-transform">
                    <span className="text-[11.5px] font-bold text-emerald-700 dark:text-emerald-400">دليل · {longDateAr(n.createdAt)}</span>
                    <b className="text-[15px] font-black leading-snug text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{n.title}</b>
                    <span className="text-[12.5px] font-extrabold text-cyan-700 dark:text-cyan-400">اقرأ الدليل &larr;</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        {hasRail && (
          <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
            {parts.length > 0 && (
              <Panel className="px-4 py-4 border-t-emerald-500! dark:border-t-emerald-500!">
                <h3 className="text-[15px] font-black text-slate-900 dark:text-white">{partsTitle} · أسعارها عندنا الحين</h3>
                <p className="mb-2 text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">أرخص نسخة متوفّرة من كل شريحة</p>
                {parts.map((p) => (
                  <Link key={p.chip} href={`/components/${p.id}`} className="group flex items-center justify-between gap-3 py-2.5 border-b last:border-b-0 border-slate-200 dark:border-slate-800">
                    <span className="min-w-0">
                      <b className="block font-mono text-[13.5px] font-black text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-400 text-right" dir="ltr">{p.chip.replace(/ Plus$/, '')}</b>
                      {/* ltr: الاسم اللاتينيّ الطويل يُقصّ من آخره لا من أوّله */}
                      <small className="block truncate text-[11px] font-bold text-slate-500 dark:text-slate-400 text-right" dir="ltr">{p.name.startsWith(p.brand) ? p.name : `${p.brand} ${p.name}`}</small>
                    </span>
                    <span className="shrink-0 flex flex-col items-end">
                      <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400">من · {p.store}</span>
                      <span className="font-mono text-[15px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums" dir="ltr">{formatPrice(p.price)}<RiyalSign /></span>
                    </span>
                  </Link>
                ))}
                <div className="mt-3 flex flex-col gap-2">
                  {gpus && <Link href="/components?cat=GPU" className="text-center rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[12.5px] font-black py-2.5 hover:opacity-90">كل كروت الشاشة بأسعارها &larr;</Link>}
                  {cpus && <Link href="/components?cat=CPU" className="text-center rounded-sm border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[12.5px] font-black py-2.5 hover:border-cyan-500">كل المعالجات بأسعارها &larr;</Link>}
                </div>
              </Panel>
            )}
            {headings.length >= 2 && (
              <Panel className="px-4 py-3.5">
                <h3 className="mb-1.5 text-[14px] font-black text-slate-900 dark:text-white">في هذا المقال</h3>
                <ol className="flex flex-col">
                  {toc.map((t, i) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="flex gap-2.5 py-1.5 text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-400">
                        <span className="font-mono text-cyan-700 dark:text-cyan-400 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                        {t.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </Panel>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
