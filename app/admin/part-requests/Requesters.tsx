'use client';

/**
 * أصحاب الاقتراح — من طلب هذه القطعة.
 *
 * الغاية: أن تعرف بمن تتحدّث قبل أن تردّ. اقتراح مثل «32GB DDR5 6000MHz»
 * بلا شركة يحتاج سؤالاً، والسؤال بلا معرفة صاحبه معلّق في الهواء.
 * المجهولون يُجمعون في رقم واحد — لا اسم لهم ولا وسيلة للردّ عليهم.
 */

export type Requester = { name: string | null; email: string | null };

/** أول حرف من الاسم (أو البريد) — بديل الصورة الرمزية */
const initial = (r: Requester): string => {
  const s = (r.name || r.email || '؟').trim();
  return s.charAt(0).toUpperCase();
};

const displayName = (r: Requester): string =>
  r.name?.trim() || r.email?.split('@')[0] || 'مستخدم';

/* لون ثابت مشتقّ من النص — نفس الشخص يأخذ نفس اللون دائماً فيسهل تمييزه */
const TONES = [
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
];
const toneFor = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
};

export type RemovedRequester = Requester & { at: string };

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });

export default function Requesters({
  people,
  anonymous,
  removed = [],
}: {
  people: Requester[];
  anonymous: number;
  /** من أزال الطلب من قائمته بعد إتمامه */
  removed?: RemovedRequester[];
}) {
  if (people.length === 0 && anonymous === 0 && removed.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-2">
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 shrink-0">طلبها:</span>

      {people.map((p, i) => {
        const label = displayName(p);
        return (
          <span
            key={i}
            title={p.email || label}
            className={`inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-bold ${toneFor(label)}`}
          >
            <span className="w-4 h-4 rounded-full bg-white/70 dark:bg-black/25 flex items-center justify-center text-[9px] font-black shrink-0">
              {initial(p)}
            </span>
            {label}
          </span>
        );
      })}

      {anonymous > 0 && (
        <span
          title="طلبات من زوّار غير مسجّلين — تُحتسب في العدد ولا يمكن الردّ عليها"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          + {anonymous} زائر
        </span>
      )}

      {people.length === 0 && anonymous === 0 && (
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
          — لم يبقَ أحد
        </span>
      )}
    </div>

    {/* ===== من أزالها من قائمته =====
        إشارة تستحق النظر: إزالة الجميع بعد الإضافة قد تعني أن القطعة التي
        أضفتها ليست التي قصدوها. */}
    {removed.length > 0 && (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 shrink-0">
          أزالها:
        </span>
        {removed.map((p, i) => (
          <span
            key={i}
            title={`${p.email || ''} — أزالها في ${shortDate(p.at)}`}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 line-through decoration-slate-400/60"
          >
            ✕ {displayName(p)}
            <span className="no-underline font-mono text-[9px] opacity-70">{shortDate(p.at)}</span>
          </span>
        ))}
      </div>
    )}
    </div>
  );
}
