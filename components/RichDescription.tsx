import { AFFILIATE_LINK_PROPS } from '../lib/affiliate';

/**
 * ============ عرض وصف القطعة ============
 *
 * ⚠️ لماذا هذا الملف موجود:
 * كان المُصيّر مكتوباً مرّتين — في صفحة القطعة وفي مودال المولّد — وتباعدت
 * النسختان فعلاً: نسخة الصفحة تفهم العناوين (###) والخطّ العريض (**)،
 * ونسخة المولّد لا تفهمهما. فالوصف الواحد يظهر بشكلين، وفي المولّد تظهر
 * علامات # و** حروفاً على الشاشة. أي إصلاح كان يحتاج تحريرين، ونُسي أحدهما.
 * الآن مصدر واحد: كل مكان يعرض وصفاً يستدعي هذا.
 *
 * ---- ما يفهمه ----
 *   ### عنوان        عنوان قسم
 *   **نصّ**          خطّ عريض
 *   - نقطة / * نقطة   قائمة نقطية
 *   ---              فاصل
 *   [نصّ](/رابط)      رابط داخلي أو خارجي
 *   [green]…[/green]  ألوان: green · red · blue · yellow
 *   رابط عارٍ         زرّ «الموقع الرسمي»
 *
 * (بلا مكتبة ماركداون: القواعد سبع، ومكتبة كاملة تجرّ حزمة كبيرة لصفحة
 *  هي الأكثر زيارةً — ثم تفتح باب HTML خام في نصّ يُحرَّر من اللوحة.)
 */

const INLINE = /(\[[^\]]+\]\([^\)]+\)|\[red\].*?\[\/red\]|\[green\].*?\[\/green\]|\[blue\].*?\[\/blue\]|\[yellow\].*?\[\/yellow\]|\*\*[^*]+\*\*|https?:\/\/[^\s]+)/g;

const COLORS: Record<string, string> = {
  red: 'text-rose-600 dark:text-rose-400',
  green: 'text-emerald-600 dark:text-emerald-400',
  blue: 'text-cyan-600 dark:text-cyan-400',
  yellow: 'text-amber-600 dark:text-amber-400',
};

function renderInline(line: string, keyPrefix: string) {
  return line.split(INLINE).map((part, i) => {
    if (!part) return null;
    const key = `${keyPrefix}-${i}`;

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={key} className="font-black text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    const md = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (md) {
      const [, text, url] = md;
      const external = url.startsWith('http');
      return (
        <a
          key={key}
          href={url}
          target={external ? '_blank' : '_self'}
          /* روابط المتاجر داخل الوصف تجارية بطبيعتها — جوجل يشترط
             sponsored/nofollow عليها، وغيابها مخالفة صريحة لإرشاداته. */
          rel={external ? 'nofollow sponsored noopener noreferrer' : ''}
          className="text-cyan-600 dark:text-cyan-400 font-bold underline hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors mx-1"
        >
          {text}
        </a>
      );
    }

    if (part.match(/^https?:\/\/[^\s]+$/)) {
      return (
        <span key={key} className="block mt-8 flex justify-end w-full">
          <a
            href={part}
            {...AFFILIATE_LINK_PROPS}
            className="inline-flex items-center gap-2 px-5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-full transition-all border border-slate-300 dark:border-slate-700 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            الموقع الرسمي
          </a>
        </span>
      );
    }

    for (const [name, cls] of Object.entries(COLORS)) {
      const open = `[${name}]`;
      const close = `[/${name}]`;
      if (part.startsWith(open) && part.endsWith(close)) {
        return (
          <span key={key} className={`${cls} font-black`}>
            {part.slice(open.length, -close.length)}
          </span>
        );
      }
    }

    return <span key={key}>{part}</span>;
  });
}

export default function RichDescription({ text }: { text: string | null | undefined }) {
  if (!text) return null;

  return (
    <>
      {text.split('\n').map((line, idx) => {
        const trimmed = line.trim();

        // فاصل: --- أو أكثر
        if (/^-{3,}$/.test(trimmed)) {
          return <span key={`hr-${idx}`} className="block h-px my-4 bg-slate-200 dark:bg-slate-700" />;
        }

        // عنوان قسم
        const heading = trimmed.match(/^(#{1,3})\s*(.+?)\s*#*$/);
        if (heading) {
          return (
            <span
              key={`h-${idx}`}
              className="block text-lg md:text-xl font-black text-slate-900 dark:text-white mt-6 mb-2 first:mt-0"
            >
              {renderInline(heading[2], `h${idx}`)}
            </span>
          );
        }

        /* نقطة قائمة: كانت الشرطة والنجمة تصلان الزائر حرفين عاريين في ٩٧٪
           من الأوصاف. نرسم نقطة حقيقية ونُزيح النصّ، ونمنع التفافه تحتها. */
        const bullet = trimmed.match(/^[-*•]\s+(.+)$/);
        if (bullet) {
          return (
            <span key={`li-${idx}`} className="flex gap-2 mb-1.5 items-start">
              <span className="text-cyan-500 dark:text-cyan-400 mt-[0.45em] shrink-0 leading-none">•</span>
              <span className="flex-1">{renderInline(bullet[1], `li${idx}`)}</span>
            </span>
          );
        }

        if (trimmed === '') return <span key={`br-${idx}`} className="block h-3" />;

        return (
          <span key={`p-${idx}`} className="block mb-1">
            {renderInline(line, `p${idx}`)}
          </span>
        );
      })}
    </>
  );
}
