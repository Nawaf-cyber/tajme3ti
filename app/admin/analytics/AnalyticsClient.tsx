'use client';

/* ============ لوحة الزيارات ============
 *
 * ⚠️ والرقم الأوّل فيها مسمّىً «متصفّحات في اليوم» لا «زوّار»: البصمة
 * يوميّة، فمن زار ثلاثة أيّام عُدّ ثلاثاً. ولو كُتب «زوّار فريدون» لصار
 * الرقم أكبر من الحقيقة، وبُنيت عليه قراراتٌ (نشرٌ، إعلانٌ، تسعيرٌ) على وهم.
 *
 * والصدق هنا ليس تورّعاً: تحليلاتُ فيرسل نفسها تقديرٌ بالطريقة ذاتها، لكنّها
 * لا تقول لك ذلك.
 */

import { useEffect, useState } from 'react';

export type Analytics = {
  span: number;
  totalViews: number;
  browserDays: number;
  signedInUsers: number;
  series: { day: string; views: number; browsers: number }[];
  paths: { path: string; views: number }[];
  components: { id: string | null; name: string; category: string; views: number }[];
  referrers: { host: string | null; views: number }[];
  devices: { device: string; views: number }[];
};

const PANEL =
  'bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm rounded-sm border-x border-b border-t-2 border-slate-200 border-t-cyan-500/70 dark:border-slate-800/80 dark:border-t-cyan-500/70 shadow-sm';

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className={`${PANEL} p-4`}>
      <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{value}</div>
      <div className="mt-0.5 text-[13px] font-black text-slate-700 dark:text-slate-300">{label}</div>
      {hint && <div className="mt-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">{hint}</div>}
    </div>
  );
}

function Bars({ series }: { series: Analytics['series'] }) {
  const max = Math.max(1, ...series.map((s) => s.views));
  return (
    <div className="flex items-end gap-[3px] h-32" dir="ltr">
      {series.map((s) => (
        <div key={s.day} className="flex-1 min-w-0 group relative flex flex-col justify-end h-full">
          <div
            className="w-full rounded-t-sm bg-cyan-600/80 dark:bg-cyan-500/70 group-hover:bg-cyan-500"
            style={{ height: `${Math.round((s.views / max) * 100)}%` }}
          />
          {/* تلميحٌ بالوقوف: عرضُ الأرقام كلَّها يزدحم، وإخفاؤها يجعل الرسم زينة */}
          <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-sm bg-slate-900 px-2 py-1 text-[11px] font-bold text-white opacity-0 group-hover:opacity-100 dark:bg-slate-700">
            {s.day} · {s.views} مشاهدة · {s.browsers} متصفّح
          </span>
        </div>
      ))}
    </div>
  );
}

function Table({ title, rows, note }: {
  title: string; note?: string;
  rows: { key: string; label: React.ReactNode; value: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className={`${PANEL} p-5`}>
      <h2 className="text-sm font-black text-slate-900 dark:text-white">{title}</h2>
      {note && <p className="mt-1 mb-2 text-[12px] font-semibold text-slate-500 dark:text-slate-400">{note}</p>}
      {rows.length === 0 && <p className="mt-3 text-[13px] font-bold text-slate-500 dark:text-slate-400">لا بيانات بعد.</p>}
      <div className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <div key={r.key} className="relative flex items-center justify-between gap-3 rounded-sm px-2 py-1.5">
            {/* شريطٌ خلف الصف: النسبة تُدرَك بالنظر قبل قراءة الرقم */}
            <span
              className="absolute inset-y-0 right-0 rounded-sm bg-cyan-500/[0.10]"
              style={{ width: `${Math.round((r.value / max) * 100)}%` }}
            />
            <span className="relative min-w-0 truncate text-[13px] font-bold text-slate-800 dark:text-slate-200">{r.label}</span>
            <span className="relative shrink-0 text-[13px] font-black tabular-nums text-slate-900 dark:text-white">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsClient({ initial }: { initial: Analytics }) {
  const [data, setData] = useState<Analytics>(initial);
  const [days, setDays] = useState(initial.span);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (days === data.span) return;
    setBusy(true);
    fetch(`/api/admin/analytics?days=${days}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d))
      .finally(() => setBusy(false));
  }, [days, data.span]);

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        {[7, 30, 90].map((n) => (
          <button
            key={n}
            onClick={() => setDays(n)}
            className={`px-4 py-2 rounded-sm text-[13px] font-black border transition-all active:scale-95 ${
              days === n
                ? 'bg-cyan-700 text-white border-cyan-700'
                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60'
            }`}
          >
            آخر {n} يوماً
          </button>
        ))}
        {busy && <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400">…يُحدَّث</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="مشاهدات الصفحات" value={data.totalViews.toLocaleString('en-US')} hint="كل فتح صفحة، بلا الروبوتات وبلا صفحات الإدارة." />
        <Stat
          label="متصفّحات في اليوم"
          value={data.browserDays.toLocaleString('en-US')}
          hint="مجموع البصمات اليوميّة. من زار ثلاثة أيّام عُدّ ثلاثاً — وليست «أشخاصاً»."
        />
        <Stat label="حسابات مسجَّلة زارت" value={data.signedInUsers} hint="هؤلاء وحدهم نعرفهم يقيناً عبر الأيام والأجهزة." />
      </div>

      <div className={`${PANEL} p-5`}>
        <h2 className="mb-3 text-sm font-black text-slate-900 dark:text-white">المشاهدات يوماً بيوم</h2>
        <Bars series={data.series} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Table
          title="أكثر القطع مشاهدةً"
          note="وهذا ما لا تعطيه تحليلات فيرسل: أيّ قطعة، لا أيّ رابط."
          rows={data.components.map((c) => ({
            key: c.id ?? c.name,
            value: c.views,
            label: (
              <a href={c.id ? `/components/${c.id}` : '#'} className="hover:underline">
                {c.name} <span className="text-slate-500 dark:text-slate-400">· {c.category}</span>
              </a>
            ),
          }))}
        />
        <Table
          title="أكثر الصفحات"
          rows={data.paths.map((p) => ({ key: p.path, value: p.views, label: p.path }))}
        />
        <Table
          title="من أين يأتون"
          note="النطاق فقط — ولا يُحفظ نصّ ما بحثوا عنه."
          rows={data.referrers.map((r) => ({ key: r.host ?? '—', value: r.views, label: r.host ?? '—' }))}
        />
        <Table
          title="الجهاز"
          rows={data.devices.map((d) => ({
            key: d.device,
            value: d.views,
            label: d.device === 'mobile' ? 'جوّال' : d.device === 'desktop' ? 'مكتب' : d.device,
          }))}
        />
      </div>
    </div>
  );
}
