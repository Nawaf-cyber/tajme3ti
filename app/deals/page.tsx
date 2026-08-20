/* ============ صفحة التخفيضات ============
 *
 * كانت مؤجَّلةً بقرار: تُبنى حين تتجاوز الانخفاضات المرصودة ١٤ — سقفَ
 * الشريط في «تصفّح القطع». وقد بلغت ٢٣، فاستحقّت صفحةً تُقصد بذاتها.
 *
 * ⚠️ وأوّل صياغةٍ لها كانت «الواجهة نفسها بفلترٍ مضغوط» — وهذا ليس
 * صفحةً بل رابطاً لحالةِ فلتر. من يفتحها يرى «تصفّح القطع» حرفياً، وله
 * أن يسأل: لماذا كُرّرت؟
 *
 * فما يجعلها صفحةً هو ما لا تقوله الأخرى:
 *   • رأسٌ يجيب سؤال الزائر قبل أن ينزل: كم قطعة نزلت؟ وكم أكبر انخفاض؟
 *     وكم يوفّر مجموعها؟ — أرقامٌ تُحسب على الخادم من العروض الحيّة.
 *   • ترتيبٌ افتراضيّ بالانخفاض لا بالأحدث.
 *   • الفلتر مقفول: لا زرَّ يُطفئه فتعود الصفحتان واحدة.
 *
 * وتبقى **البطاقة** واحدة: نسخةٌ ثانية منها تعني عيباً يُصلَح هنا ويعيش
 * هناك — وهو درس ساحبات الأسعار.
 *
 * والخصم يُحسب من `offerDeal` على المتجر الأرخص المتوفّر وحده: إعلان
 * خصم متجرٍ أغلى بينما نعرض سعر متجرٍ آخر تضليلٌ لا ترويج.
 */

import { prisma } from '../../lib/prisma';
import { HAS_PARTS } from '../../lib/categories';
import { OFFER_INCLUDE } from '../../lib/stores-server';
import { offerDeal } from '../../lib/stores';
import ComponentsClient from '../components/ComponentsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تخفيضات قطع الحاسب اليوم',
  description:
    'القطع التي نزل سعرها في المتاجر السعودية — كروت شاشة ومعالجات ولوحات وذاكرة وتخزين، مرتّبة بأكبر انخفاض، مع سعرها قبل الخصم. محدَّثة لحظياً.',
  alternates: { canonical: '/deals' },
};

export const dynamic = 'force-dynamic';

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export default async function DealsPage() {
  const components = await prisma.component.findMany({
    include: { category: true, ...OFFER_INCLUDE },
    orderBy: { createdAt: 'desc' },
  });
  const categories = await prisma.category.findMany({ where: HAS_PARTS });

  /* الأرقام تُحسب هنا لا في المتصفّح: الزائر يقرأها قبل أن يحمّل شيئاً */
  const deals = components
    .map((c) => ({ c, d: offerDeal(c as any) }))
    .filter((x) => x.d.pct > 0);

  const count = deals.length;
  const topPct = count ? Math.max(...deals.map((x) => x.d.pct)) : 0;
  const top = deals.find((x) => x.d.pct === topPct);
  const totalSaving = deals.reduce((s, x) => s + Math.max(0, (x.d.listPrice ?? x.c.price) - x.c.price), 0);
  const cats = new Set(deals.map((x) => x.c.category.name)).size;

  const stats = [
    { label: 'قطعة نزل سعرها', value: fmt(count), tone: 'text-rose-600 dark:text-rose-400' },
    { label: 'أكبر انخفاض', value: `${topPct}%`, tone: 'text-rose-600 dark:text-rose-400' },
    { label: 'مجموع الفرق', value: `${fmt(totalSaving)} ﷼`, tone: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'فئة فيها تخفيض', value: fmt(cats), tone: 'text-slate-900 dark:text-white' },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            تخفيضات <span className="text-rose-600 dark:text-rose-400">اليوم</span>
          </h1>
          {/* ⚠️ قِيس التباين فلم يكن هو العلّة: 7.16:1 وهو فوق AA بمريح.
              العلّة الحجم — ١٤ بكسل بوزن ٦٠٠ على العربية تُقرأ باجتهاد،
              والحروف العربية تحتاج قياساً أكبر من اللاتينية لنفس الوضوح.
              فرُفع إلى ١٦ بكسل، ودُرِّج اللون فوق ذلك. */}
          <p className="text-[15px] md:text-base font-semibold text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            القطع التي نزل سعرها عند أرخص متجرٍ متوفّر، مرتّبةً بأكبر انخفاض. النسبة محسوبة من
            السعر المشطوب في المتجر نفسه — ولا نُعلن خصماً على متجرٍ أغلى بينما نعرض سعر غيره.
          </p>
        </div>

        {count > 0 ? (
          <>
            {/* ===== الرأس الرقميّ — ما لا تقوله صفحة التصفّح ===== */}
            <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm p-4 rounded-sm border-x border-b border-t-2 border-slate-200 border-t-rose-500/70 dark:border-slate-800/80 dark:border-t-rose-500/70 shadow-sm"
                >
                  <div className={`text-2xl md:text-3xl font-black tabular-nums ${s.tone}`} dir="ltr">{s.value}</div>
                  {/* ١١ بكسل كانت أصغر من أن تُقرأ بلمحة — والتسمية هي التي
                      تُعطي الرقمَ معناه، فلا يجوز أن تكون أخفتَ منه بمرّتين. */}
                  <div className="text-[13px] font-bold text-slate-600 dark:text-slate-300 mt-1.5 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>

            {/* أكبر انخفاض — سطرٌ واحد يستحقّ أن يُقرأ قبل النزول */}
            {top && (
              <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3.5 rounded-sm bg-rose-500/[0.07] border border-rose-500/30">
                {/* التسمية شارةٌ مصمتة لا نصٌّ باهت: هي التي تقول لِمَ هذا
                    السطر هنا، وكانت ١١ بكسل بلون الخلفية نفسها تقريباً.
                    ⚠️ و`rose-500` لا يكفي: أبيضُ عليه يعطي 3.75:1 وهو دون AA،
                    والاستثناء للخطّ الكبير يبدأ من ١٨.٦٦ بكسل لا من ١٢ مهما
                    ثقُل الوزن. و`rose-600` يعطي 4.53 — قِيسا كلاهما. */}
                <span className="shrink-0 text-[12px] font-black text-white bg-rose-600 px-2.5 py-1 rounded-sm">
                  الأكبر اليوم
                </span>
                <span className="text-[15px] font-black text-slate-900 dark:text-white truncate">
                  {top.c.brand} {top.c.name}
                </span>
                <span className="font-mono text-[14px] font-black text-slate-700 dark:text-slate-200 tabular-nums" dir="ltr">
                  <span className="line-through opacity-60">{fmt(top.d.listPrice ?? 0)}</span>
                  {' ← '}
                  <span className="text-rose-600 dark:text-rose-400">{fmt(top.c.price)} ﷼</span>
                </span>
              </div>
            )}

            <ComponentsClient components={components} categories={categories} dealsLocked />
          </>
        ) : (
          /* لا تخفيضات اليوم — تُقال صراحةً بدل صفحةٍ فارغة تبدو معطوبة */
          <div className="max-w-md mx-auto text-center bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-t-slate-300 dark:border-t-slate-700 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-10">
            <div className="text-3xl mb-3">🏷️</div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">لا تخفيضات مرصودة الآن</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              نرصد الأسعار باستمرار، وتظهر هنا أيّ قطعةٍ ينزل سعرها عن سعرها المعلن.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
