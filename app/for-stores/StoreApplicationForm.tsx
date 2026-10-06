"use client";

import { useState, type ReactNode } from 'react';
import {
  PLATFORMS, AFFILIATE, LIMITS, normalizeWebsite, isValidEmail, isValidPhone,
} from '../../lib/store-application';

type Field = 'storeName' | 'website' | 'platform' | 'contactName' | 'contactEmail' | 'contactPhone';

const INPUT =
  'w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 aria-[invalid=true]:border-rose-500';

function Label({ htmlFor, children, optional }: { htmlFor: string; children: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
      {children}
      {optional && <span className="font-medium text-slate-500 dark:text-slate-400"> (اختياري)</span>}
    </label>
  );
}

export default function StoreApplicationForm() {
  const [form, setForm] = useState({
    storeName: '', website: '', platform: '', contactName: '', contactEmail: '', contactPhone: '',
    cities: '', warranty: '', productList: false, affiliate: '', notes: '', company: '',
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  /* تحقّقٌ فوريّ للراحة — والمسار يعيده كلّه، فلا يُعتمد على هذا وحده */
  const validate = (): boolean => {
    const e: Partial<Record<Field, string>> = {};
    if (form.storeName.trim().length < 2) e.storeName = 'اكتب اسم المتجر.';
    if (!normalizeWebsite(form.website)) e.website = 'رابط غير صحيح — مثال: mystore.com';
    if (!form.platform) e.platform = 'اختر منصّة المتجر.';
    if (form.contactName.trim().length < 2) e.contactName = 'اكتب اسم المسؤول.';
    if (!isValidEmail(form.contactEmail)) e.contactEmail = 'البريد الإلكتروني غير صحيح.';
    if (form.contactPhone.trim() && !isValidPhone(form.contactPhone)) e.contactPhone = 'رقم الجوال غير صحيح.';
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) document.getElementById(`sa-${first}`)?.focus();
    return !first;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSending(true);
    try {
      const res = await fetch('/api/store-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(data.message || 'تم استلام طلبك.');
      } else if (data.field) {
        setErrors({ [data.field]: data.message });
        document.getElementById(`sa-${data.field}`)?.focus();
      } else {
        setServerError(data.message || 'تعذّر الإرسال. جرّب مرّةً أخرى.');
      }
    } catch {
      setServerError('تعذّر الاتصال. تأكّد من الإنترنت وجرّب مرّةً أخرى.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div role="status" className="border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-900/20 rounded-sm p-6 text-center">
        <div className="text-3xl mb-2">✓</div>
        <p className="font-bold text-emerald-800 dark:text-emerald-300">{done}</p>
      </div>
    );
  }

  const err = (k: Field) =>
    errors[k] ? <p id={`sa-${k}-err`} className="text-sm text-rose-600 dark:text-rose-400 mt-1">{errors[k]}</p> : null;
  const aria = (k: Field) => ({
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `sa-${k}-err` : undefined,
  });

  return (
    <form onSubmit={submit} noValidate className="border-t border-gray-100 dark:border-slate-800 pt-8 space-y-8">
      <h3 className="text-2xl font-black text-slate-900 dark:text-white">طلب الانضمام</h3>

      {/* فخّ الروبوتات — مخفيّ عن الإنسان وعن قارئ الشاشة */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="sa-company">Company</label>
        <input id="sa-company" tabIndex={-1} autoComplete="off" value={form.company} onChange={(e) => set('company', e.target.value)} />
      </div>

      <fieldset className="space-y-4">
        <legend className="font-bold text-slate-900 dark:text-white mb-3">المتجر</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sa-storeName">اسم المتجر</Label>
            <input id="sa-storeName" className={INPUT} maxLength={LIMITS.short} value={form.storeName}
              onChange={(e) => set('storeName', e.target.value)} {...aria('storeName')} />
            {err('storeName')}
          </div>
          <div>
            <Label htmlFor="sa-website">رابط المتجر</Label>
            <input id="sa-website" dir="ltr" inputMode="url" placeholder="mystore.com" className={`${INPUT} text-left`}
              maxLength={LIMITS.medium} value={form.website} onChange={(e) => set('website', e.target.value)} {...aria('website')} />
            {err('website')}
          </div>
        </div>

        <div role="radiogroup" aria-labelledby="sa-platform-label" id="sa-platform" tabIndex={-1} className="outline-none">
          <p id="sa-platform-label" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">منصّة المتجر</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2.5">تعرّفنا من البداية كيف نقرأ أسعارك.</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const on = form.platform === p.value;
              return (
                <button key={p.value} type="button" role="radio" aria-checked={on} onClick={() => set('platform', p.value)}
                  className={`px-4 py-2 rounded-sm border text-sm font-bold transition-colors ${
                    on
                      ? 'bg-cyan-600 border-cyan-600 text-white'
                      : 'border-gray-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-500'
                  }`}>
                  {p.label}
                </button>
              );
            })}
          </div>
          {errors.platform && <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">{errors.platform}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sa-cities" optional>مدن الشحن</Label>
            <input id="sa-cities" placeholder="مثال: كل مدن المملكة" className={INPUT} maxLength={LIMITS.medium}
              value={form.cities} onChange={(e) => set('cities', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sa-warranty" optional>الضمان</Label>
            <input id="sa-warranty" placeholder="مثال: ضمان الوكيل سنتان" className={INPUT} maxLength={LIMITS.medium}
              value={form.warranty} onChange={(e) => set('warranty', e.target.value)} />
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-1 w-4 h-4 accent-cyan-600 shrink-0" checked={form.productList}
            onChange={(e) => set('productList', e.target.checked)} />
          <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            نقدر نرسل قائمة بمنتجاتنا وروابطها <span className="text-slate-500 dark:text-slate-400">(تسرّع الإضافة كثيراً)</span>
          </span>
        </label>

        <div role="radiogroup" aria-labelledby="sa-aff-label">
          <p id="sa-aff-label" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            برنامج عمولة؟ <span className="font-medium text-slate-500 dark:text-slate-400">(اختياري)</span>
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {AFFILIATE.map((a) => (
              <label key={a.value} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="radio" name="affiliate" className="accent-cyan-600" checked={form.affiliate === a.value}
                  onChange={() => set('affiliate', a.value)} />
                {a.label}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-bold text-slate-900 dark:text-white mb-3">التواصل</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sa-contactName">اسم المسؤول</Label>
            <input id="sa-contactName" autoComplete="name" className={INPUT} maxLength={LIMITS.short}
              value={form.contactName} onChange={(e) => set('contactName', e.target.value)} {...aria('contactName')} />
            {err('contactName')}
          </div>
          <div>
            <Label htmlFor="sa-contactEmail">البريد الإلكتروني</Label>
            <input id="sa-contactEmail" type="email" dir="ltr" autoComplete="email" className={`${INPUT} text-left`} maxLength={120}
              value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} {...aria('contactEmail')} />
            {err('contactEmail')}
          </div>
          <div>
            <Label htmlFor="sa-contactPhone" optional>الجوال</Label>
            <input id="sa-contactPhone" type="tel" dir="ltr" autoComplete="tel" placeholder="+9665XXXXXXXX" className={`${INPUT} text-left`}
              maxLength={30} value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} {...aria('contactPhone')} />
            {err('contactPhone')}
          </div>
        </div>
        <div>
          <Label htmlFor="sa-notes" optional>ملاحظات</Label>
          <textarea id="sa-notes" rows={4} className={`${INPUT} resize-y`} maxLength={LIMITS.notes}
            placeholder="أيّ شيءٍ تحبّ أن نعرفه عن متجرك"
            value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>
      </fieldset>

      {serverError && (
        <p role="alert" className="text-sm font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-sm p-3">
          {serverError}
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button type="submit" disabled={sending}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-bold py-3 px-8 rounded-sm transition-colors">
          {sending ? 'جارٍ الإرسال…' : 'أرسل الطلب'}
        </button>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          بياناتك للتواصل بخصوص الطلب فقط، ولا تُعرض في الموقع.
        </p>
      </div>
    </form>
  );
}
