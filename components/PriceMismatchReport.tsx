'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { storeVars, type Offer } from '../lib/stores';
import { formatPrice } from '../lib/price';

/**
 * ============ «السعر مختلف عن المتجر؟» ============
 *
 * لماذا يحتاجه الموقع أصلاً: السحب يعرف أن السعر **تغيّر**، ولا يعرف أنه
 * **خاطئ**. رابطٌ يشير لنسخة أخرى من المنتج، أو محدّدٌ يقرأ سعر باقة بدل
 * القطعة، أو صفحة بسعر منطقة مختلفة — كلّها تُنتج رقماً معقولاً يمرّ من كل
 * الحرّاس. الزائر الذي فتح المتجر للتوّ هو الوحيد الذي يرى الفرق.
 *
 * ---- لماذا هذا الشكل ----
 * شريط هادئ بحدّ متقطّع لا بطاقة مصمتة: هو دعوة لا إعلان، ووضعه تحت قائمة
 * الأسعار مباشرةً — عند النظر إلى الرقم لا في أسفل الصفحة. ولا يُفتح
 * النموذج إلا بالضغط، فلا يزاحم أزرار الشراء بصرياً.
 *
 * واختيار المتجر إلزاميّ: «السعر مختلف» بلا تحديد المتجر لا يقول للأدمن
 * أي رابط يفتح — فيصير البلاغ عبئاً بدل أن يكون دليلاً.
 */
export default function PriceMismatchReport({ offers }: { offers: Offer[] }) {
  const rows = (offers || []).filter((o) => !!o.url);

  const [open, setOpen] = useState(false);
  const [offerId, setOfferId] = useState(rows[0]?.id ?? '');
  const [price, setPrice] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  if (rows.length === 0) return null;

  const submit = async () => {
    if (!offerId) return;
    setSending(true);
    try {
      const res = await fetch('/api/price-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, reportedPrice: price || null }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDone(true);
        setOpen(false);
        toast.success('وصلنا بلاغك — نراجع الرابط ونصحّح السعر.');
      } else {
        toast.error(data.message || 'تعذّر إرسال البلاغ.');
      }
    } catch {
      toast.error('تعذّر الاتصال بالخادم.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="mt-4 flex items-center gap-2.5 p-3.5 rounded-sm border border-emerald-300/70 dark:border-emerald-600/40 bg-emerald-50/70 dark:bg-emerald-500/5">
        <span className="text-emerald-600 dark:text-emerald-400 text-lg">✓</span>
        <p className="text-[13px] font-bold text-emerald-800 dark:text-emerald-300 leading-relaxed">
          شكراً — وصلنا بلاغك. نفتح رابط المتجر ونصحّح السعر إن كان مختلفاً.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-sm border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-[#0B1120]/40 overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-3.5 flex-wrap">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="text-base leading-none mt-0.5">⚑</span>
          <div className="min-w-0">
            <p className="text-[13px] font-black text-slate-700 dark:text-slate-200">
              لقيت السعر عندنا مختلفاً عن المتجر؟
            </p>
            {/* الشرح يوضّح الفائدة ويمنع الظنّ بأن الزرّ شكوى بلا أثر */}
            <p className="text-[11.5px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
              نُحدّث الأسعار آلياً عدّة مرّات يومياً، وقد يسبقنا المتجر بتغيير.
              بلّغنا فنفتح الرابط ونصحّحه — ويستفيد كل من يزور الصفحة بعدك.
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 text-[12px] font-black px-3.5 py-2 rounded-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-cyan-400 dark:hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
        >
          {open ? 'إغلاق' : 'بلّغ عن فرق سعر'}
        </button>
      </div>

      {open && (
        <div className="border-t border-dashed border-slate-300 dark:border-slate-700 p-3.5 flex flex-col gap-3">
          <div>
            <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 font-mono">
              أي متجر؟
            </p>
            <div className="flex flex-wrap gap-2">
              {rows.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOfferId(o.id)}
                  style={storeVars(o.store.color)}
                  className={`text-[12px] font-bold px-3 py-1.5 rounded-sm border transition-colors ${
                    offerId === o.id
                      ? 'border-[color:var(--store-color)] bg-[color:var(--store-tint)] text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400'
                  }`}
                >
                  {o.store.name}
                  {o.price ? (
                    <span className="font-mono text-[11px] opacity-70 ms-1.5 tabular-nums">
                      {formatPrice(o.price)}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 font-mono">
              كم السعر في المتجر؟ <span className="normal-case tracking-normal font-bold">(اختياري)</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="مثال: 1250"
              className="w-full sm:w-48 px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono tabular-nums focus:outline-none focus:border-cyan-400"
              dir="ltr"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={submit}
              disabled={sending || !offerId}
              className="text-[12.5px] font-black px-4 py-2 rounded-sm bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors"
            >
              {sending ? 'جارٍ الإرسال…' : 'إرسال البلاغ'}
            </button>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              لا يتطلّب تسجيل دخول
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
