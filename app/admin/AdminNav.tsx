'use client';

/* ============ تنقّل لوحة الإدارة ============
 *
 * كانت ثلاثة عشر زرّاً مرصوصةً في صفٍّ واحد، بثلاثة ألوانٍ وثلاثة أحجام،
 * ولا يُعرف منها ما هو تبويبٌ في هذه الصفحة وما ينقلك إلى صفحةٍ أخرى.
 * الآن أربع مجموعاتٍ بحسب العمل الذي تخدمه، وكلُّ عنصرٍ بشكلٍ واحد:
 * التبويب يُضيء حين يكون نشطاً، والرابط يحمل سهماً صغيراً ←.
 *
 * ⚠️ وعدّادُ الطلبات الجديدة يُعرض هنا — كان يُحسب في page.tsx ويُمرَّر ولا
 * يظهر في أيّ مكان، وتعليقُه يَعِدُ بـ«النقطة الحمراء».
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import ExportComponentsButton from './ExportComponentsButton';

export type AdminTab = 'components' | 'news' | 'affiliates';

type Item =
  | { kind: 'tab'; tab: AdminTab; icon: string; label: string; hint?: string }
  | { kind: 'link'; href: string; icon: string; label: string; hint?: string; badge?: number; alert?: boolean }
  | { kind: 'export' };

const ROW =
  'group flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-right transition-colors';

function Row({ icon, label, hint, active, trailing }: {
  icon: string; label: string; hint?: string; active?: boolean; trailing?: ReactNode;
}) {
  return (
    <>
      <span
        className={`w-8 h-8 shrink-0 rounded-md flex items-center justify-center text-[15px] ${
          active ? 'bg-cyan-500/15' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
        } transition-colors`}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-[13.5px] font-black truncate ${active ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-800 dark:text-slate-100'}`}>
          {label}
        </span>
        {hint && (
          <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">{hint}</span>
        )}
      </span>
      {trailing}
    </>
  );
}

export default function AdminNav({
  activeTab,
  onTab,
  storesCount,
  newRequests,
  variant = 'sidebar',
}: {
  activeTab: AdminTab;
  onTab: (t: AdminTab) => void;
  storesCount: number;
  newRequests: number;
  /** `sidebar`: عمودٌ ثابتٌ يمين الصفحة · `grid`: أربع بطاقاتٍ فوق المحتوى */
  variant?: 'sidebar' | 'grid';
}) {
  const groups: { title: string; items: Item[] }[] = [
    {
      title: 'الكتالوج',
      items: [
        { kind: 'tab', tab: 'components', icon: '💻', label: 'إدارة القطع', hint: 'إضافة وتعديل وجدول القطع' },
        { kind: 'link', href: '/admin/describe', icon: '✍️', label: 'كاتب الأوصاف', hint: 'أوصافٌ للقطع التي بلا وصف' },
        { kind: 'link', href: '/admin/find-sources', icon: '🔍', label: 'مصدر ثانٍ', hint: 'متجرٌ آخر لقطعةٍ عندنا' },
        { kind: 'link', href: '/admin/store-search', icon: '🛒', label: 'ابحث في المتاجر', hint: 'قطعٌ ليست عندنا بعد' },
      ],
    },
    {
      title: 'المتاجر والعمولات',
      items: [
        { kind: 'link', href: '/admin/stores', icon: '🏪', label: 'المتاجر', hint: `${storesCount} متجراً مفعّلاً`, badge: storesCount },
        { kind: 'tab', tab: 'affiliates', icon: '🔗', label: 'العمولات', hint: 'معرّفات كلّ متجر' },
        { kind: 'link', href: '/admin/import', icon: '📥', label: 'استيراد JSON', hint: 'قطعٌ وأسعارٌ بالجملة' },
        { kind: 'export' },
      ],
    },
    {
      title: 'الزوّار',
      items: [
        {
          kind: 'link', href: '/admin/part-requests', icon: '🙋', label: 'طلبات القطع',
          hint: newRequests ? 'طلباتٌ أو ردودٌ لم تُقرأ' : 'لا جديد', badge: newRequests || undefined, alert: newRequests > 0,
        },
        { kind: 'link', href: '/admin/suggestions', icon: '💡', label: 'اقتراحات الزوّار' },
        { kind: 'link', href: '/admin/analytics', icon: '📈', label: 'الزيارات', hint: 'مربوطةٌ بالقطع' },
      ],
    },
    {
      title: 'المحتوى',
      items: [
        { kind: 'tab', tab: 'news', icon: '📰', label: 'الأخبار', hint: 'كتابة ونشر' },
        { kind: 'link', href: '/admin/prebuilds', icon: '🧩', label: 'تجميعة جاهزة', hint: 'إضافة تجميعةٍ مقترحة' },
      ],
    },
  ];

  if (variant === 'sidebar') {
    /* ============ الشريط الجانبيّ ============
       عمودٌ يبقى ظاهراً وأنت تنزل في الجدول: التنقّل لا يختفي خلف المحتوى.
       العنصر النشط يحمل شريطاً سماويّاً على حافّته (بداية السطر في RTL). */
    return (
      <nav className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3">
        <div className="flex items-center gap-2.5 px-2 pt-1 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-sm font-black shadow-sm shadow-cyan-500/30">ت</span>
          <span className="leading-tight">
            <span className="block text-[14px] font-black text-slate-900 dark:text-white">تجميعتي</span>
            <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">لوحة الإدارة</span>
          </span>
        </div>

        {groups.map((g) => (
          <div key={g.title} className="mb-3 last:mb-0">
            <h2 className="px-2 pb-1 text-[10.5px] font-black tracking-wide text-slate-400 dark:text-slate-500">{g.title}</h2>
            <div className="flex flex-col gap-px">
              {g.items.map((it, i) => {
                if (it.kind === 'export') return <ExportComponentsButton key={i} variant="side" />;
                const active = it.kind === 'tab' && activeTab === it.tab;
                const cls = `relative flex items-center gap-2.5 w-full rounded-lg px-2.5 py-1.5 text-right text-[13px] font-bold transition-colors ${
                  active
                    ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-200 before:absolute before:right-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-full before:bg-cyan-500'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`;
                const inner = (
                  <>
                    <span className="w-6 text-center text-[14px] shrink-0">{it.icon}</span>
                    <span className="flex-1 truncate" title={it.hint}>{it.label}</span>
                    {it.kind === 'link' && it.badge ? (
                      <span className={`text-[10.5px] font-black px-1.5 py-0.5 rounded-full tabular-nums ${
                        it.alert ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {it.badge}
                      </span>
                    ) : null}
                  </>
                );
                return it.kind === 'tab' ? (
                  <button key={it.tab} onClick={() => onTab(it.tab)} aria-current={active ? 'page' : undefined} className={cls}>
                    {inner}
                  </button>
                ) : (
                  <Link key={it.href} href={it.href} className={cls}>{inner}</Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {groups.map((g) => (
        <section
          key={g.title}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3"
        >
          <h2 className="px-2 pt-1 pb-2 text-[11.5px] font-black text-slate-400 dark:text-slate-500">{g.title}</h2>
          <div className="flex flex-col gap-0.5">
            {g.items.map((it, i) => {
              if (it.kind === 'export') return <ExportComponentsButton key={i} variant="row" />;
              if (it.kind === 'tab') {
                const active = activeTab === it.tab;
                return (
                  <button
                    key={it.tab}
                    onClick={() => onTab(it.tab)}
                    aria-current={active ? 'page' : undefined}
                    className={`${ROW} ${
                      active
                        ? 'bg-cyan-50 dark:bg-cyan-500/10 ring-1 ring-cyan-300/70 dark:ring-cyan-500/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Row icon={it.icon} label={it.label} hint={it.hint} active={active} />
                  </button>
                );
              }
              return (
                <Link key={it.href} href={it.href} className={`${ROW} hover:bg-slate-50 dark:hover:bg-slate-800/60`}>
                  <Row
                    icon={it.icon}
                    label={it.label}
                    hint={it.hint}
                    trailing={
                      it.badge ? (
                        <span
                          className={`text-[11px] font-black px-2 py-0.5 rounded-full tabular-nums ${
                            it.alert
                              ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {it.badge}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors text-sm">←</span>
                      )
                    }
                  />
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}
