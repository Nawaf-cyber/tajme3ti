'use client';

/* ============ حقل وصفٍ يُشير إلى قطعنا ============
 *
 * الوصف يفهم `[نصّ](/components/ID)` ويعرضه رابطاً. لكن كتابتها باليد تعني
 * أن يفتح الأدمن تبويباً آخر، ويبحث، وينسخ مُعرّفاً من ٢٥ حرفاً. فيُكتفى
 * بالاسم بلا رابط، أو يُلصق مُعرّفٌ خاطئ فيصير الرابط ٤٠٤ صامتة.
 *
 * فهنا: «@» ثم جزءٌ من الاسم ← قائمةٌ ← إدراجُ الرابط كاملاً.
 *
 * ⚠️ و«#» لا تصلح مُطلِقاً كما اقتُرح: «###» عنوانُ قسمٍ في نفس اللغة،
 * فكلّ عنوانٍ يكتبه الأدمن كان سيفتح القائمة. فـ«#» تعمل **إلّا في أوّل
 * السطر** — وهو بالضبط موضع العنوان. و«@» تعمل في كل موضع.
 *
 * ⚠️ والقائمة تُرتَّب بفئة القطعة المُحرَّرة أوّلاً: من يكتب وصف لوحةٍ أمّ
 * يوصي بلوحةٍ أخرى غالباً. لكن الفئات الأخرى تبقى ظاهرةً بعدها مُعلَّمة —
 * فالنصيحة قد تكون «هذا المعالج يحتاج مبرّداً أقوى».
 *
 * ⚠️ والمسافات مسموحةٌ داخل الاستعلام: «PRO B760M-P DDR4» أربع كلمات،
 * ووقفُ البحث عند أوّل مسافةٍ يجعل الإشارة عديمة الفائدة لأسماء القطع.
 * والقائمة تُغلق وحدها حين لا يُطابق شيء، فلا تعلق مفتوحةً في نصٍّ عاديّ.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { detectMention, rankMentions, applyMention, type MentionItem } from '../lib/mention';

type Item = MentionItem;

export default function MentionTextarea(props: {
  /** للنماذج غير المُتحكَّم بها (`<form action=…>`) */
  name?: string;
  defaultValue?: string;
  /** للحقول المُتحكَّم بها */
  value?: string;
  onChange?: (v: string) => void;
  /** فئة القطعة المُحرَّرة — تُقدَّم في الترتيب */
  category?: string | null;
  className?: string;
  rows?: number;
  placeholder?: string;
  id?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [start, setStart] = useState(-1);
  const [active, setActive] = useState(0);

  /* تُجلب مرّةً واحدةً عند أوّل «@» — لا عند فتح الصفحة: أكثر الأوصاف
     تُكتب بلا إشارةٍ واحدة، فلا داعي لتحميل الكتالوج لكل من فتح النموذج. */
  const ensureItems = () => {
    if (items || loading) return;
    setLoading(true);
    fetch('/api/admin/catalog')
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  const sync = () => {
    const el = ref.current;
    if (!el) return;
    const hit = detectMention(el.value, el.selectionStart ?? 0);
    if (!hit) { setOpen(false); setStart(-1); return; }
    ensureItems();
    setStart(hit.at);
    setQuery(hit.query);
    setOpen(true);
    /* ⚠️ ولا يُصفَّر المُحدَّد إلّا حين يتغيّر الاستعلام فعلاً. كان يُصفَّر مع
       كل مزامنة، والمزامنة تجري على `keyup` — فسهمُ النزول يُحرّك المُحدَّد
       ثم يُعيده رفعُ الإصبع إلى الأوّل. قيس بالضغط: يبقى على الصفّ الأوّل. */
    if (hit.query !== query || hit.at !== start) setActive(0);
  };

  /** مفاتيح التنقّل لا تُغيّر النصّ — ومزامنتها تُفسد المُحدَّد */
  const NAV = new Set(['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape']);

  const matches = useMemo(
    () => (open && items ? rankMentions(items, query, props.category) : []),
    [open, items, query, props.category],
  );

  /* لا تبقى القائمة مفتوحةً على نصٍّ عاديّ بعد «@» */
  const visible = open && (loading || matches.length > 0);

  const insert = (it: Item) => {
    const el = ref.current;
    if (!el || start < 0) return;
    const { text: next, caret: pos } = applyMention(el.value, start, el.selectionStart ?? 0, it);

    if (props.onChange) props.onChange(next);
    else el.value = next;

    setOpen(false);
    setStart(-1);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!visible) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % Math.max(1, matches.length)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + matches.length) % Math.max(1, matches.length)); }
    else if (e.key === 'Enter' || e.key === 'Tab') {
      if (!matches[active]) return;
      e.preventDefault();
      insert(matches[active]);
    } else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); setStart(-1); }
  };

  /* نقرةٌ خارج القائمة تُغلقها */
  useEffect(() => {
    if (!visible) return;
    const away = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node) && e.target !== ref.current) setOpen(false);
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [visible]);

  return (
    <div className="relative" ref={boxRef}>
      <textarea
        ref={ref}
        id={props.id}
        name={props.name}
        rows={props.rows ?? 4}
        placeholder={props.placeholder}
        className={props.className}
        {...(props.onChange
          ? { value: props.value ?? '', onChange: (e) => { props.onChange!(e.target.value); sync(); } }
          : { defaultValue: props.defaultValue ?? '', onChange: sync })}
        onKeyUp={(e) => { if (!NAV.has(e.key) || !visible) sync(); }}
        onClick={sync}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
      />

      {visible && (
        <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          {loading && (
            <div className="px-3 py-2 text-[12px] font-bold text-slate-500 dark:text-slate-400">…يُحمّل الكتالوج</div>
          )}
          {matches.map((it, i) => (
            <button
              key={it.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); insert(it); }}
              onMouseEnter={() => setActive(i)}
              className={`w-full text-right px-3 py-2 flex items-center justify-between gap-3 ${
                i === active ? 'bg-cyan-50 dark:bg-cyan-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <span className="min-w-0 truncate text-[13px] font-bold text-slate-900 dark:text-white">
                {it.brand} {it.name}
              </span>
              <span
                className={`shrink-0 text-[12px] font-black ${
                  it.category === (props.category || '')
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {it.category}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
