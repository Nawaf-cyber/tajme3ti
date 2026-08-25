'use client';

/* ============ طلبات القطع الخاصة بالمستخدم ============
   يعرض القطع التي طلبها مع حالتها الحيّة، ومحادثته مع الإدارة، وعند
   إتمام الطلب: زرّ بناء تجميعة جديدة بها، وزرّ إضافتها لتجميعة قائمة،
   وخيار إزالتها من قائمته.

   التنسيق يتبع بصمة الموقع: زاوية هندسية، حدّ علوي سماوي، عناوين
   font-mono مفرودة — بدل البطاقة العامة السابقة. */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { STATUS_META, buildWithPartUrl, type PartStatus } from '../../lib/part-request';
import { productImage } from '../../lib/image';
import UseInBuildModal from '../compare/UseInBuildModal';

type ReqComponent = {
  id: string;
  name: string;
  brand: string;
  price: number;
  categoryId: string;
  imageUrl?: string | null;
  categoryName: string;
};

type Req = {
  name: string;
  status: PartStatus;
  createdAt: string;
  requestId: string;
  categoryName: string | null;
  component: ReqComponent | null;
  messages: { body: string; fromAdmin: boolean; at: string }[];
  unseen: boolean;
};

export default function MyPartRequests() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  // القطعة المطلوب إضافتها لتجميعة قائمة — تفتح نافذة الاختيار
  const [addTarget, setAddTarget] = useState<ReqComponent | null>(null);

  useEffect(() => {
    fetch('/api/part-requests')
      .then((r) => r.json())
      .then((d) => {
        const list: Req[] = Array.isArray(d.requests) ? d.requests : [];
        setRequests(list);
        /* رآها الآن → نُطفئ النقطة على الخادم. لا نُطفئها محلّياً كي تبقى
           العلامات ظاهرة في هذه الزيارة، وتختفي في التالية. */
        if (list.some((r) => r.unseen)) {
          fetch('/api/part-requests', { method: 'PATCH' }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sendReply = async (requestId: string) => {
    const body = (drafts[requestId] || '').trim();
    if (body.length < 2) return;
    setSending(requestId);
    try {
      const res = await fetch('/api/part-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, body }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.message) alert(data.message);
        throw new Error();
      }
      setRequests((prev) =>
        prev.map((r) =>
          r.requestId === requestId
            ? { ...r, messages: [...r.messages, { body, fromAdmin: false, at: new Date().toISOString() }] }
            : r,
        ),
      );
      setDrafts((d) => ({ ...d, [requestId]: '' }));
    } catch {
      /* صامت: النصّ يبقى في الحقل فيقدر يعيد المحاولة */
    } finally {
      setSending(null);
    }
  };

  const removeRequest = async (requestId: string, name: string) => {
    if (!window.confirm(`إزالة "${name}" من قائمتك؟\nلن يؤثّر ذلك على القطعة في الموقع.`)) return;
    setRemoving(requestId);
    try {
      const res = await fetch(`/api/part-requests?requestId=${encodeURIComponent(requestId)}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        alert(d?.message || 'تعذّر الحذف.');
        return;
      }
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } finally {
      setRemoving(null);
    }
  };

  // لا نعرض القسم إطلاقاً إن لم يطلب شيئاً — كي لا نُشوّش صفحة من لا يستخدم الميزة
  if (loading || requests.length === 0) return null;

  const addedCount = requests.filter((r) => r.status === 'ADDED').length;
  const unseenCount = requests.filter((r) => r.unseen).length;

  return (
    <section id="part-requests" className="mb-10 scroll-mt-24 animate-fade-up">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
          طلبات القطع
          <span className="font-mono text-[10px] font-normal text-slate-400 tracking-widest uppercase">
            requests
          </span>
          {unseenCount > 0 && (
            <span className="relative flex h-2.5 w-2.5" title={`${unseenCount} تحديث جديد`}>
              <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-70 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
          )}
        </h2>
        {addedCount > 0 && (
          <span className="font-mono text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 rounded-sm border border-emerald-300 dark:border-emerald-800/50 uppercase tracking-wider">
            ✅ {addedCount} أُضيفت
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {requests.map((r) => {
          const meta = STATUS_META[r.status];
          const done = r.status === 'ADDED' && r.component;
          const myTurn = r.messages.length > 0 && r.messages[r.messages.length - 1].fromAdmin;

          return (
            <div
              key={r.requestId}
              className={`relative overflow-hidden bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-4 shadow-sm transition-colors ${
                r.unseen ? 'border-t-rose-500' : 'border-t-cyan-500/70'
              }`}
            >
              {/* الزاوية الهندسية — بصمة بطاقات الموقع */}
              <div
                className={`absolute top-0 right-0 w-0 h-0 border-l-[14px] border-l-transparent pointer-events-none ${
                  r.unseen ? 'border-t-[14px] border-t-rose-500/70' : 'border-t-[14px] border-t-cyan-500/50'
                }`}
              />

              {/* ===== الرأس: الاسم + الحالة ===== */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white leading-snug break-words flex items-center gap-2" dir="ltr">
                    {r.name}
                    {r.unseen && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" title="فيه جديد" />
                    )}
                  </p>
                  <p className="font-mono text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                    {r.categoryName ? `${r.categoryName} · ` : ''}
                    {new Date(r.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1 font-mono text-[9px] font-black px-2 py-1 rounded-sm border uppercase tracking-wider ${meta.badge}`}>
                  {meta.icon} {meta.label}
                </span>
              </div>

              {/* ===== القطعة بعد إضافتها ===== */}
              {done && (
                <Link
                  href={`/components/${r.component!.id}`}
                  className="group flex items-center gap-3 mb-3 p-2.5 rounded-sm bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  title="افتح صفحة القطعة"
                >
                  <div className="w-12 h-12 bg-white rounded-sm shrink-0 flex items-center justify-center p-1 border border-emerald-200 dark:border-emerald-900/40 group-hover:scale-105 transition-transform">
                    <img
                      src={productImage(r.component!.imageUrl)}
                      alt={r.component!.name}
                      loading="lazy"
                      className="max-w-full max-h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" dir="ltr">
                      {r.component!.brand} {r.component!.name}
                    </p>
                    <p className="font-mono text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                      {r.component!.price.toLocaleString('en-US')} ﷼
                    </p>
                  </div>
                  <svg className="w-4 h-4 shrink-0 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              )}

              {/* ===== المحادثة ===== */}
              {r.messages.length > 0 && (
                <div className="mb-3 p-2.5 rounded-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <p className="font-mono text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    محادثة مع الإدارة
                  </p>
                  {r.messages.map((m, k) => (
                    <div key={k} className={`flex ${m.fromAdmin ? 'justify-start' : 'justify-end'}`}>
                      <span
                        className={`max-w-[85%] px-2.5 py-1.5 rounded-sm text-[12px] font-bold leading-relaxed ${
                          m.fromAdmin
                            ? 'bg-cyan-100 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span className="block font-mono text-[12px] font-black opacity-60 mb-0.5 uppercase tracking-wider">
                          {m.fromAdmin ? 'الإدارة' : 'أنت'}
                        </span>
                        {m.body}
                      </span>
                    </div>
                  ))}

                  {/* ردّ واحد لكل رسالة إدارة — الحقل يظهر حين يكون الدور دوره */}
                  {myTurn ? (
                    <div className="flex gap-1.5 pt-1">
                      <input
                        value={drafts[r.requestId] || ''}
                        onChange={(e) => setDrafts((d) => ({ ...d, [r.requestId]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendReply(r.requestId); } }}
                        placeholder="اكتب ردّك… (ردّ واحد)"
                        maxLength={400}
                        className="flex-1 min-w-0 p-2 rounded-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[12px] font-bold outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <button
                        onClick={() => sendReply(r.requestId)}
                        disabled={sending === r.requestId || (drafts[r.requestId] || '').trim().length < 2}
                        className="px-3 py-2 rounded-sm bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white font-mono text-[10px] font-black uppercase tracking-wider transition-colors shrink-0"
                      >
                        {sending === r.requestId ? '...' : 'إرسال'}
                      </button>
                    </div>
                  ) : (
                    <p className="pt-1 font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-wider">
                      وصل ردّك — بانتظار الإدارة
                    </p>
                  )}
                </div>
              )}

              {/* ===== الإجراءات ===== */}
              {done ? (
                <div className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <Link
                      href={buildWithPartUrl(r.component!.categoryName, r.component!.id)}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-[11px] font-black transition-all active:scale-95 shadow-sm shadow-cyan-500/20"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      تجميعة جديدة
                    </Link>

                    <button
                      onClick={() => setAddTarget(r.component)}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-sm border-2 border-cyan-500/60 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-[11px] font-black transition-all active:scale-95"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      أضفها لتجميعتي
                    </button>
                  </div>

                  {/* الحذف متاح بعد الإتمام فقط — قبله يفقد متابعة طلب لم يُنجَز */}
                  <button
                    onClick={() => removeRequest(r.requestId, r.name)}
                    disabled={removing === r.requestId}
                    className="font-mono text-[10px] font-bold text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors py-1 uppercase tracking-wider disabled:opacity-50"
                  >
                    {removing === r.requestId ? '...' : '✕ إزالة من قائمتي'}
                  </button>
                </div>
              ) : (
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
                  {r.status === 'REVIEWING'
                    ? 'نراجع طلبك — سنُضيفها إن توفّرت وكانت مطلوبة.'
                    : 'جارٍ إضافتها الآن — ستصلك هنا فور جهوزها.'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* نافذة "أضفها لتجميعتي" — نفس نافذة صفحة المقارنة، بلا نسخة ثانية */}
      {addTarget && <UseInBuildModal component={addTarget} onClose={() => setAddTarget(null)} />}
    </section>
  );
}
