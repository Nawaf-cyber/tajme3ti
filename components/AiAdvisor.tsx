'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

/* ============ الأنواع ============ */
type Intent = {
  use: string | null;
  resolution: string | null;
  fpsTarget: number | null;
  budget: number | null;
  alsoStreams: boolean | null;
  question: string | null;
  summary: string | null;
};

type Msg = { role: 'user' | 'ai'; text: string };

export type TierPlan = {
  key: 'value' | 'balanced' | 'strong';
  label: string;
  note: string;
  total: number;
  picks: Record<string, any>;
};

/* ============ أوزان النيّة ============
   لكل استخدام أولوياته. شوتر تنافسي يحتاج معالجاً قوياً وفريمات،
   لا رسوميات ثقيلة. المونتاج يحتاج رام ومعالجاً. إلخ.
   هذه الأوزان *ترتيبية* — تحدّد أي فئة تُخدم أولاً من المتبقي. */
export const USE_PROFILE: Record<string, { cpu: number; gpu: number; ram: number; storage: number; label: string }> = {
  'competitive-shooter': { cpu: 0.30, gpu: 0.34, ram: 0.14, storage: 0.08, label: 'شوتر تنافسي' },
  'aaa-gaming':          { cpu: 0.20, gpu: 0.44, ram: 0.14, storage: 0.08, label: 'ألعاب ثقيلة' },
  'casual-gaming':       { cpu: 0.24, gpu: 0.36, ram: 0.14, storage: 0.08, label: 'ألعاب خفيفة' },
  'editing':             { cpu: 0.32, gpu: 0.26, ram: 0.20, storage: 0.12, label: 'مونتاج وتصميم' },
  'streaming':           { cpu: 0.32, gpu: 0.30, ram: 0.16, storage: 0.10, label: 'بث مباشر' },
  'office':              { cpu: 0.30, gpu: 0.16, ram: 0.18, storage: 0.14, label: 'مكتبي ودراسة' },
  'mixed':               { cpu: 0.26, gpu: 0.34, ram: 0.16, storage: 0.10, label: 'استخدام متنوّع' },
};

export default function AiAdvisor({
  onPlans,
  buildPlans,
}: {
  onPlans: (plans: TierPlan[], intent: Intent) => void;
  buildPlans: (intent: Intent) => TierPlan[] | null;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);

  const EXAMPLES = [
    'ألعب شوتر تنافسي وأبي فريمات عالية',
    'أبي جهاز للألعاب الثقيلة على 1440p',
    'أصوّر وأمنتج فيديو 4K',
  ];

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

    const nextMsgs: Msg[] = [...msgs, { role: 'user', text }];
    setMsgs(nextMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: msgs.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', text: m.text })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || 'تعذّر الاتصال بالمساعد.');
        setLoading(false);
        return;
      }

      const intent: Intent = data;

      // النموذج لم يفهم الاستخدام — نسأل
      if (!intent.use) {
        setMsgs([...nextMsgs, { role: 'ai', text: intent.question || 'وش تبي تسوي بالجهاز؟ ألعاب؟ مونتاج؟' }]);
        setLoading(false);
        return;
      }

      // ينقص شيء مهم — نسأل سؤالاً واحداً
      if (intent.question && !intent.resolution && intent.use !== 'office') {
        setMsgs([...nextMsgs, { role: 'ai', text: intent.question }]);
        setLoading(false);
        return;
      }

      // اكتمل الفهم — نبني من الكتالوج الحقيقي
      const plans = buildPlans(intent);
      if (!plans || plans.length === 0) {
        setMsgs([...nextMsgs, { role: 'ai', text: 'تعذّر بناء تجميعة من القطع المتوفّرة حالياً. جرّب لاحقاً.' }]);
        setLoading(false);
        return;
      }

      setMsgs([
        ...nextMsgs,
        { role: 'ai', text: intent.summary || 'فهمت. هذي ثلاثة خيارات من القطع المتوفّرة:' },
      ]);
      onPlans(plans, intent);
    } catch {
      toast.error('تعذّر الاتصال بالمساعد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-l from-cyan-500/[0.06] to-transparent dark:from-cyan-950/30 overflow-hidden">
      {/* الرأس */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-right hover:bg-cyan-500/[0.04] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">ما تدري وش تبي؟</h3>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-500 text-white">جديد</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
              قل لنا وش تسوي بالجهاز، ونبني لك تجميعة من القطع المتوفّرة.
            </p>
          </div>
        </div>
        <svg className={`w-5 h-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* المحتوى */}
      {open && (
        <div className="px-4 pb-4">
          {/* المحادثة */}
          {msgs.length > 0 && (
            <div className="mb-3 space-y-2 max-h-52 overflow-y-auto">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-[12.5px] font-medium leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tr-sm'
                      : 'bg-cyan-500/10 border border-cyan-500/25 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-end">
                  <div className="px-3.5 py-2 rounded-2xl rounded-tl-sm bg-cyan-500/10 border border-cyan-500/25">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* أمثلة سريعة */}
          {msgs.length === 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => send(ex)}
                  className="px-3 py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-500/60 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          {/* الإدخال */}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(input); }}
              disabled={loading}
              placeholder="مثال: ألعب فالورانت وأبي 240 فريم..."
              className="flex-1 min-w-0 px-4 py-2.5 text-sm font-medium bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50"
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-black rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
            >
              {loading ? '...' : 'اسأل'}
            </button>
          </div>

          <p className="mt-2.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            المساعد يفهم طلبك فقط — القطع والأسعار كلها من كتالوجنا الحقيقي المتوفّر.
          </p>
        </div>
      )}
    </div>
  );
}