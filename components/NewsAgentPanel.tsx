'use client';

/* ============ لوحة كاتب الأخبار ============
 *
 * ثلاث خطوات ظاهرة: يبحث فيقترح · تختار عنواناً · يكتب فتراجع وتحفظ.
 *
 * ⚠️ والعناوين تُعرض بمصدرها وتاريخها **قبل** أن يُكتب حرف: خبرٌ بلا مصدرٍ
 * ولا تاريخ لا يُوثق به، وموقعٌ يقرؤه مشترون لا يحتمل خبراً مختلَقاً.
 *
 * ⚠️ والمقال يُعرض في حقلٍ قابلٍ للتحرير لا في نصٍّ جامد: المراجعة تعديلُ
 * جملةٍ لا قبولٌ أعمى، والنبرة الإنسانيّة تُضبط بيدك في آخر الأمر.
 */

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Topic = { title: string; angle: string; source: string; date: string; why: string };
type Article = { title: string; summary: string; category: string; content: string };
type Meta = { model: string; hasKey: boolean; total: number; daysSince: number | null; lastTitle: string | null };

const CATS = ['كروت الشاشة', 'المعالجات', 'الذواكر', 'التخزين', 'عام'];

export default function NewsAgentPanel() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [focus, setFocus] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState<null | 'topics' | 'write' | 'save'>(null);
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [chosen, setChosen] = useState<Topic | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [words, setWords] = useState(0);
  const [spent, setSpent] = useState(0);

  useEffect(() => {
    fetch('/api/admin/news-agent').then((r) => r.json()).then((d) => { if (!d.error) setMeta(d); }).catch(() => {});
  }, []);

  const post = async (payload: any) => {
    const r = await fetch('/api/admin/news-agent', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    const d = await r.json();
    /* ⚠️ و`message` كذلك: حارس middleware يردّ قبل المسار بصيغةٍ أخرى */
    if (!r.ok) throw new Error(d?.error || d?.message || 'تعذّر الطلب');
    if (d.costSar) setSpent((s) => s + d.costSar);
    return d;
  };

  const findTopics = async () => {
    setBusy('topics'); setTopics(null); setChosen(null); setArticle(null);
    const t = toast.loading('يبحث في الأخبار…');
    try {
      const d = await post({ action: 'topics', focus });
      toast.dismiss(t);
      setTopics(d.topics || []);
      if (!d.topics?.length) {
        toast('لم يعد بعناوين — ' + (d.raw ? 'الصيغة اختلّت، جرّب ثانيةً' : 'لا أخبار حديثة في هذا الموضوع'), { icon: '⚠️', duration: 8000 });
      } else toast.success(`${d.topics.length} عنواناً · ${d.costSar}﷼`);
    } catch (e: any) { toast.dismiss(t); toast.error(e.message); }
    finally { setBusy(null); }
  };

  const write = async (topic: Topic) => {
    setChosen(topic); setArticle(null); setBusy('write');
    const t = toast.loading('يبحث ويكتب… قد يأخذ دقيقة');
    try {
      const d = await post({ action: 'write', title: topic.title, angle: topic.angle, source: topic.source, notes });
      toast.dismiss(t);
      if (!d.article) { toast.error('لم أستطع قراءة الجواب — أعد المحاولة'); return; }
      setArticle(d.article); setProblems(d.problems || []); setWords(d.words || 0);
      if (d.problems?.length) toast(`كُتب — بملاحظات: ${d.problems.join(' · ')}`, { icon: '⚠️', duration: 9000 });
      else toast.success(`${d.words} كلمة · ${d.costSar}﷼`);
    } catch (e: any) { toast.dismiss(t); toast.error(e.message); }
    finally { setBusy(null); }
  };

  const save = async () => {
    if (!article) return;
    setBusy('save');
    try {
      await post({ action: 'save', ...article });
      toast.success('نُشر المقال');
      setArticle(null); setChosen(null); setTopics(null);
      fetch('/api/admin/news-agent').then((r) => r.json()).then((d) => { if (!d.error) setMeta(d); }).catch(() => {});
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  const F = 'w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500';

  return (
    <div className="mb-8 p-5 rounded-xl border-2 border-dashed border-violet-300 dark:border-violet-700/60 bg-violet-500/[0.04]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-black text-gray-900 dark:text-white">✨ كاتب الأخبار</h3>
        <div className="flex flex-wrap items-center gap-3 text-[12px] font-bold text-slate-500 dark:text-slate-400">
          {meta && <span>{meta.total} مقالاً</span>}
          {/* ⚠️ ومنذ متى لم يُنشر شيء: أدسنس ترفض المواقع الراكدة، والرقم يُرى قبل أن يُسأل عنه */}
          {meta?.daysSince != null && (
            <span className={meta.daysSince > 14 ? 'text-amber-600 dark:text-amber-400' : ''}>
              آخر نشر منذ {meta.daysSince} يوماً
            </span>
          )}
          {spent > 0 && <span dir="ltr">{spent.toFixed(2)}﷼</span>}
        </div>
      </div>

      {meta && !meta.hasKey && (
        <p className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-[12px] font-black">
          ⛔ لا ANTHROPIC_API_KEY في البيئة — أضفه لتشغيل الكاتب
        </p>
      )}

      {/* ===== ١ · ابحث عن عناوين ===== */}
      <div className="flex flex-wrap gap-2 mb-2">
        <input
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="موضوعٌ بعينه (اختياري) — مثل: كروت RTX 50 · أسعار الذواكر · معالجات AMD"
          className={F + ' flex-1 min-w-[260px]'}
        />
        <button
          onClick={findTopics}
          disabled={!!busy || !meta?.hasKey}
          className="px-5 py-3 rounded-lg bg-violet-700 hover:bg-violet-800 text-white text-[13px] font-black disabled:opacity-50 transition-colors"
        >
          {busy === 'topics' ? 'يبحث…' : '🔎 اقترح عناوين'}
        </button>
      </div>
      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-4">
        يبحث في الويب أوّلاً — كلّ عنوان يأتي بمصدره وتاريخه، ولا يُكتب مقالٌ حتى تختار.
      </p>

      {/* ===== ٢ · اختر عنواناً ===== */}
      {topics && topics.length > 0 && !article && (
        <ul className="space-y-2 mb-4">
          {topics.map((t, i) => (
            <li key={i} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-black text-gray-900 dark:text-white">{t.title}</p>
                  <p className="mt-1 text-[12px] font-semibold text-slate-600 dark:text-slate-400">{t.why}</p>
                  <p className="mt-1 text-[11px] font-bold text-slate-400">
                    {t.source} · {t.date}
                    {t.angle && <span className="text-slate-500 dark:text-slate-500"> — {t.angle}</span>}
                  </p>
                </div>
                <button
                  onClick={() => write(t)}
                  disabled={!!busy}
                  className="shrink-0 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-black disabled:opacity-50"
                >
                  {busy === 'write' && chosen?.title === t.title ? 'يكتب…' : 'اكتب هذا'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {topics && topics.length > 0 && !article && (
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="ملاحظاتٌ للكاتب (اختياري) — مثل: ركّز على أثره على أسعار السوق السعودي"
          className={F + ' mb-4'}
        />
      )}

      {/* ===== ٣ · راجع واحفظ ===== */}
      {article && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-black text-slate-600 dark:text-slate-300">{words} كلمة</span>
            {problems.length > 0 ? (
              <span className="px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-black">
                {problems.join(' · ')}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-black">✔ اجتاز الفحص</span>
            )}
          </div>

          <input value={article.title} onChange={(e) => setArticle({ ...article, title: e.target.value })} className={F} placeholder="العنوان" />
          <textarea value={article.summary} onChange={(e) => setArticle({ ...article, summary: e.target.value })} rows={2} className={F} placeholder="الملخّص" />
          <select value={article.category} onChange={(e) => setArticle({ ...article, category: e.target.value })} className={F}>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            {!CATS.includes(article.category) && <option value={article.category}>{article.category}</option>}
          </select>
          <textarea
            value={article.content}
            onChange={(e) => { setArticle({ ...article, content: e.target.value }); }}
            rows={18}
            dir="rtl"
            className={F + ' font-mono text-[12px] leading-relaxed'}
            placeholder="نصّ المقال (HTML)"
          />

          <div className="flex flex-wrap gap-2">
            <button onClick={save} disabled={!!busy} className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-black disabled:opacity-50">
              {busy === 'save' ? 'ينشر…' : 'انشر المقال'}
            </button>
            <button onClick={() => { setArticle(null); }} className="px-4 py-3 rounded-lg text-[13px] font-black text-slate-500 hover:underline">
              رجوع للعناوين
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
