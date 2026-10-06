"use client";
import Link from 'next/link';
import { useState } from 'react';
import SuggestionModal from './SuggestionModal';

/*
 * الروابط مجمّعةً في أعمدة بدل صفٍّ واحد مسطّح — كان التذييل يعرض خمس
 * روابط إداريّة فقط، ولا رابط فيه لأدوات الموقع نفسها (الباني، القطع، …).
 * و«اقتراح» ليس رابطاً بل زرّ يفتح النافذة، فيُميَّز بـ action.
 */
type FooterLink = { label: string; href?: string; action?: 'suggest' };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'الأدوات',
    links: [
      { label: 'باني التجميعة', href: '/builder' },
      { label: 'تصفّح القطع', href: '/components' },
      { label: 'قارن القطع', href: '/compare' },
      { label: 'تخفيضات اليوم', href: '/deals' },
    ],
  },
  {
    title: 'اقرأ',
    links: [
      { label: 'تجميعات جاهزة', href: '/prebuilds' },
      { label: 'أدلّة الشراء', href: '/guides' },
      { label: 'الأخبار', href: '/news' },
    ],
  },
  {
    title: 'المنصّة',
    links: [
      { label: 'عن المنصّة', href: '/about' },
      { label: 'اتصل بنا', href: '/contact' },
      { label: 'أرسل اقتراحاً', action: 'suggest' },
      { label: 'انضم كمتجر', href: '/for-stores' },
      { label: 'سياسة الخصوصية', href: '/privacy' },
      // ⚠️ فيها إخلاء مسؤوليّة الأسعار — والزائر يبحث عنه هنا لا في
      // صفحة القطعة. وغيابُها كان من نواقص مراجعة أدسنس.
      { label: 'شروط الاستخدام', href: '/terms' },
    ],
  },
];

const LINK_CLASS =
  'text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors';

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <footer className="relative bg-transparent mt-auto transition-colors duration-300 overflow-hidden">
        {/* خط سيان علوي يربط الفوتر بهوية الموقع */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10">

            {/* العلامة + الوصف — يأخذ السطر كاملاً على الجوّال */}
            <div className="col-span-2 md:col-span-5 lg:col-span-6 max-w-sm">
              <Link href="/" className="inline-flex items-center gap-2.5 font-black text-2xl text-slate-900 dark:text-white group mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-sm flex items-center justify-center text-white shadow-md shadow-cyan-500/30 group-hover:rotate-12 transition-transform">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z" />
                  </svg>
                </div>
                تجميعتي
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                منصة عربية تفحص توافق قطع الحاسوب برمجياً وتقارن أسعار المتاجر. نوجّه المجتمع، لا نبيع.
              </p>
            </div>

            {COLUMNS.map((col, i) => (
              <nav
                key={col.title}
                aria-label={col.title}
                // العمود الأخير على الجوّال يأخذ السطر كاملاً كي لا يبقى عمودٌ وحيد بنصف عرض
                className={`md:col-span-2 ${i === COLUMNS.length - 1 ? 'col-span-2 md:col-span-3 lg:col-span-2' : ''}`}
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{col.title}</h3>
                <ul className={`flex flex-col gap-2.5 ${i === COLUMNS.length - 1 ? 'max-md:grid max-md:grid-cols-2 max-md:gap-x-6' : ''}`}>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.action === 'suggest' ? (
                        <button type="button" onClick={() => setIsModalOpen(true)} className={`${LINK_CLASS} text-start`}>
                          {l.label}
                        </button>
                      ) : (
                        <Link href={l.href!} className={LINK_CLASS}>{l.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* الشريط السفلي: الحقوق + إفصاحٌ مختصر عن الأسعار والعمولة */}
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center md:items-start justify-between gap-3 text-center md:text-start">
            <p className="text-xs font-medium text-slate-500">
              © {new Date().getFullYear()} تجميعتي · طُوّر في السعودية
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              الأسعار تُحدَّث تلقائياً من المتاجر وقد تختلف لحظة الشراء. بعض الروابط بعمولة لا تزيد السعر عليك.
            </p>
          </div>
        </div>
      </footer>

      <SuggestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
