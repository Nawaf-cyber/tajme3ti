/* ============ قُمع الأسبوع ============
 *
 * أربعة أسئلة طلبها المستخدم، مصفوفةً كما تُقرأ: كم دخل · كم بدأ بناءً ·
 * كم وصل إلى التقرير · كم نقر رابط شراء. ثمّ ما يبحث عنه وما يطلبه.
 *
 * ⚠️ ومكوّن خادم: البيانات تُجلب في الصفحة، فلا حالةَ ولا نداءَ من المتصفّح.
 *
 * ⚠️ والأرقام **بصمات لا أشخاص**، والاسم مكتوبٌ في الصفحة صراحةً: الملح
 * يوميّ، فمن زار ثلاثة أيّامٍ عُدّ ثلاثاً. وكتابةُ «زائر» فوق هذا الرقم
 * تبني قراراً على وهم.
 */

import Link from 'next/link';

type Week = {
  label: string; from: string; to: string;
  visitors: number; started: number; finished: number; clicked: number;
  reachPct: number; buyPct: number;
};

const Bar = ({ value, max, tone }: { value: number; max: number; tone: string }) => (
  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
    <div className={`h-full ${tone}`} style={{ width: `${max > 0 ? Math.round((value / max) * 100) : 0}%` }} />
  </div>
);

export default function FunnelSection({
  weeks, searches, buys, requested,
}: {
  weeks: Week[];
  searches: Array<{ term: string; count: number }>;
  buys: { components: Array<{ id: string | null; name: string; clicks: number }>; stores: Array<{ store: string; clicks: number }> };
  requested: Array<{ id: string; name: string; category: string; votes: number; status: string }>;
}) {
  const max = Math.max(1, ...weeks.map((w) => w.visitors));
  const last = weeks[weeks.length - 1];
  const prev = weeks[weeks.length - 2];
  const empty = weeks.every((w) => w.started === 0 && w.finished === 0 && w.clicked === 0);

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white/70 dark:bg-[#0F172A]/70 rounded-sm border border-slate-200 dark:border-slate-800 p-5">
      <h2 className="text-[15px] font-black text-slate-900 dark:text-white mb-3">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="mt-10 space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">القُمع الأسبوعيّ</h2>
        <p className="mt-1 text-[13px] font-semibold text-slate-600 dark:text-slate-400">
          الأرقام <strong>بصمات يوميّة</strong> لا أشخاص — من زار ثلاثة أيّامٍ عُدّ ثلاثاً.
        </p>
      </div>

      {/* ⚠️ ويُقال إن كان الجدول فارغاً لأنّ القياس جديد لا لأنّ أحداً لم
          يستعمل الموقع: الفراغ بلا تفسيرٍ يُقرأ عطلاً. */}
      {empty && (
        <p className="px-4 py-3 rounded-sm bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[13px] font-bold">
          لا أحداث بعد — القياس بدأ للتوّ. امتلاء الجدول يحتاج زيارات بعد نشر هذا التحديث.
        </p>
      )}

      <div className="overflow-x-auto rounded-sm border border-slate-200 dark:border-slate-800">
        <table className="w-full text-[13px]">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400">
            <tr className="text-right">
              <th className="p-3 font-black">الأسبوع</th>
              <th className="p-3 font-black">بصمات</th>
              <th className="p-3 font-black">بدأ بناءً</th>
              <th className="p-3 font-black">وصل للتقرير</th>
              <th className="p-3 font-black">نقر شراءً</th>
              <th className="p-3 font-black">وصل ÷ بدأ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {weeks.map((w) => (
              <tr key={w.from} className="text-slate-800 dark:text-slate-200">
                <td className="p-3 font-mono text-[11px] font-bold text-slate-500" dir="ltr">{w.from} → {w.to}</td>
                <td className="p-3 tabular-nums font-black">
                  {w.visitors}
                  <Bar value={w.visitors} max={max} tone="bg-slate-400" />
                </td>
                <td className="p-3 tabular-nums font-black text-cyan-700 dark:text-cyan-400">{w.started}</td>
                <td className="p-3 tabular-nums font-black text-violet-700 dark:text-violet-400">{w.finished}</td>
                <td className="p-3 tabular-nums font-black text-emerald-700 dark:text-emerald-400">{w.clicked}</td>
                <td className="p-3 tabular-nums font-black">{w.started ? `${w.reachPct}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {last && prev && (last.started || prev.started) && (
        <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-400">
          هذا الأسبوع: <strong>{last.started}</strong> بدأ بناءً و<strong>{last.finished}</strong> وصل للتقرير
          {prev.started > 0 && (
            <> — والأسبوع الماضي {prev.started} و{prev.finished}.</>
          )}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="أكثر ما يُبحث عنه">
          {searches.length === 0 ? (
            <p className="text-[13px] font-bold text-slate-400">لا بحثٌ مسجّل بعد.</p>
          ) : (
            <ul className="space-y-1.5">
              {searches.map((s) => (
                <li key={s.term} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate" dir="auto">{s.term}</span>
                  <span className="font-mono font-black text-slate-500 tabular-nums shrink-0">{s.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="أكثر ما يُطلب إضافته">
          {requested.length === 0 ? (
            <p className="text-[13px] font-bold text-slate-400">لا طلبات.</p>
          ) : (
            <ul className="space-y-1.5">
              {requested.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {r.name}
                    {r.category && <span className="text-slate-400 font-mono text-[11px]"> · {r.category}</span>}
                  </span>
                  <span className="font-mono font-black text-slate-500 tabular-nums shrink-0">{r.votes} صوت</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="أكثر ما يُنقر شراؤه">
          {buys.components.length === 0 ? (
            <p className="text-[13px] font-bold text-slate-400">لا نقرات شراءٍ مسجّلة بعد.</p>
          ) : (
            <ul className="space-y-1.5">
              {buys.components.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 text-[13px]">
                  {c.id ? (
                    <Link href={`/components/${c.id}`} className="font-bold text-slate-800 dark:text-slate-200 hover:text-cyan-600 truncate">{c.name}</Link>
                  ) : <span className="font-bold text-slate-400">{c.name}</span>}
                  <span className="font-mono font-black text-slate-500 tabular-nums shrink-0">{c.clicks}</span>
                </li>
              ))}
            </ul>
          )}
          {/* ⚠️ ولا تُسمّى مبيعاً: لا نرى ما بعد المغادرة إلى المتجر */}
          <p className="mt-3 text-[11px] font-semibold text-slate-400">
            نقرةٌ لا عمليةُ شراء — ما بعد المغادرة إلى المتجر لا نراه.
          </p>
        </Card>

        <Card title="نقرات الشراء بالمتجر">
          {buys.stores.length === 0 ? (
            <p className="text-[13px] font-bold text-slate-400">لا شيء بعد.</p>
          ) : (
            <ul className="space-y-1.5">
              {buys.stores.map((s) => (
                <li key={s.store} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200" dir="ltr">{s.store}</span>
                  <span className="font-mono font-black text-slate-500 tabular-nums">{s.clicks}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
