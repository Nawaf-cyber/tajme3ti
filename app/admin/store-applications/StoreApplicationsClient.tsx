'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { updateStoreApplication, deleteStoreApplication } from '../store-application-actions';
import { PLATFORMS, AFFILIATE, STATUS_META, labelOf, type StoreAppStatus } from '../../../lib/store-application';

type App = {
  id: string;
  storeName: string;
  website: string;
  host: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  platform: string;
  cities: string | null;
  warranty: string | null;
  productList: boolean;
  affiliate: string | null;
  notes: string | null;
  status: StoreAppStatus;
  adminNote: string | null;
  createdAt: string;
};

const ORDER: StoreAppStatus[] = ['NEW', 'REVIEWING', 'ACCEPTED', 'REJECTED'];

/** رقمٌ سعوديّ محلّيّ (05…) → دوليّ لرابط واتساب */
const waNumber = (phone: string) => {
  const d = phone.replace(/[^\d]/g, '');
  return d.startsWith('05') ? `966${d.slice(1)}` : d;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-[13px]">
      <dt className="w-24 shrink-0 font-bold text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="min-w-0 text-slate-800 dark:text-slate-200 break-words">{children}</dd>
    </div>
  );
}

function Card({ app }: { app: App }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState(app.adminNote ?? '');
  const noteDirty = note !== (app.adminNote ?? '');

  const save = (patch: { status?: StoreAppStatus; adminNote?: string }, ok: string) =>
    start(async () => {
      const r = await updateStoreApplication(app.id, patch);
      if (r.success) { toast.success(ok); router.refresh(); } else toast.error(r.error || 'تعذّر الحفظ');
    });

  const remove = () => {
    if (!confirm(`حذف طلب «${app.storeName}» نهائياً؟`)) return;
    start(async () => {
      const r = await deleteStoreApplication(app.id);
      if (r.success) { toast.success('حُذف الطلب'); router.refresh(); } else toast.error(r.error || 'تعذّر الحذف');
    });
  };

  const meta = STATUS_META[app.status];

  return (
    <article className={`rounded-xl border bg-white dark:bg-slate-900/70 p-5 ${
      app.status === 'NEW' ? 'border-rose-300 dark:border-rose-500/40' : 'border-slate-200 dark:border-slate-800'
    } ${pending ? 'opacity-60' : ''}`}>
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-slate-900 dark:text-white truncate">{app.storeName}</h2>
          <a href={app.website} target="_blank" rel="noopener noreferrer nofollow" dir="ltr"
            className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
            {app.host} ↗
          </a>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${meta.badge}`}>{meta.label}</span>
          <span className="text-[11px] font-semibold text-slate-500">
            {new Date(app.createdAt).toLocaleDateString('ar-SA-u-ca-gregory', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </header>

      <dl className="space-y-1.5 mb-4">
        <Row label="المنصّة">{labelOf(PLATFORMS, app.platform)}</Row>
        {app.cities && <Row label="الشحن">{app.cities}</Row>}
        {app.warranty && <Row label="الضمان">{app.warranty}</Row>}
        <Row label="قائمة منتجات">{app.productList ? '✓ يقدرون يرسلونها' : '—'}</Row>
        {app.affiliate && <Row label="العمولة">{labelOf(AFFILIATE, app.affiliate)}</Row>}
        <Row label="المسؤول">{app.contactName}</Row>
        <Row label="البريد">
          <a href={`mailto:${app.contactEmail}`} dir="ltr" className="text-cyan-600 dark:text-cyan-400 hover:underline">{app.contactEmail}</a>
        </Row>
        {app.contactPhone && (
          <Row label="الجوال">
            <span dir="ltr">{app.contactPhone}</span>
            {' · '}
            <a href={`https://wa.me/${waNumber(app.contactPhone)}`} target="_blank" rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:underline">واتساب ↗</a>
          </Row>
        )}
      </dl>

      {app.notes && (
        <p className="text-[13px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 mb-4 whitespace-pre-wrap">
          {app.notes}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3" role="group" aria-label="الحالة">
        {ORDER.map((s) => (
          <button key={s} type="button" disabled={pending || s === app.status}
            onClick={() => save({ status: s }, `صار «${STATUS_META[s].label}»`)}
            aria-pressed={s === app.status}
            className={`text-xs font-bold px-3 py-1.5 rounded-md border transition-colors ${
              s === app.status
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-500'
            }`}>
            {STATUS_META[s].label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
          placeholder="ملاحظةٌ داخليّة — لا يراها المتجر"
          className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-y" />
        <div className="flex sm:flex-col gap-2">
          <button type="button" disabled={pending || !noteDirty} onClick={() => save({ adminNote: note }, 'حُفظت الملاحظة')}
            className="text-xs font-bold px-3 py-2 rounded-md bg-cyan-600 text-white disabled:opacity-40">
            حفظ الملاحظة
          </button>
          <button type="button" disabled={pending} onClick={remove}
            className="text-xs font-bold px-3 py-2 rounded-md text-rose-600 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40">
            حذف
          </button>
        </div>
      </div>
    </article>
  );
}

export default function StoreApplicationsClient({ apps }: { apps: App[] }) {
  const [filter, setFilter] = useState<StoreAppStatus | 'ALL'>('ALL');
  const count = (s: StoreAppStatus) => apps.filter((a) => a.status === s).length;
  const shown = filter === 'ALL' ? apps : apps.filter((a) => a.status === filter);

  if (!apps.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500 dark:text-slate-400 font-semibold">
        لا طلبات بعد. رابط النموذج في تذييل الموقع: «انضم كمتجر».
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-5">
        {(['ALL', ...ORDER] as const).map((s) => {
          const n = s === 'ALL' ? apps.length : count(s);
          const on = filter === s;
          return (
            <button key={s} type="button" onClick={() => setFilter(s)} aria-pressed={on}
              className={`text-sm font-bold px-3.5 py-1.5 rounded-full border transition-colors ${
                on ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-500'
              }`}>
              {s === 'ALL' ? 'الكلّ' : STATUS_META[s].label}
              <span className="ms-1.5 tabular-nums opacity-80">{n}</span>
            </button>
          );
        })}
      </div>
      <div className="grid gap-4">
        {shown.map((a) => <Card key={a.id} app={a} />)}
        {!shown.length && <p className="text-sm text-slate-500 text-center py-8">لا طلبات بهذه الحالة.</p>}
      </div>
    </>
  );
}
