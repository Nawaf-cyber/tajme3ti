'use client';

/* نموذج متجر واحد — إضافة أو تعديل، مع منتقي لون واختبار سحب حيّ. */

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createStore, updateStore } from '../store-actions';

export type StoreRow = {
  id: string; slug: string; name: string; latinName: string; color: string;
  domain: string | null; active: boolean; sortOrder: number;
  affiliateParam: string | null; affiliateId: string | null; usesDeepLinks: boolean;
  currency: string; rateToSar: number;
  scrapeMode: string; priceSelector: string | null; listSelector: string | null;
  stockSelector: string | null; premiumProxy: boolean;
  noticeMessage: string | null; noticeUntil: string | Date | null;
};

const input =
  'w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500';
const label = 'block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1.5';

/* ألوان جاهزة — تغني عن اختيار لون عشوائي يضيع وسط تنسيق الموقع */
const PRESETS = ['#FF9900', '#A855F7', '#DC2626', '#0EA5E9', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

export default function StoreForm({ store, onDone }: { store?: StoreRow; onDone?: () => void }) {
  const editing = !!store;
  const [color, setColor] = useState(store?.color || '#0EA5E9');
  const [mode, setMode] = useState(store?.scrapeMode || 'auto');
  const [deep, setDeep] = useState(store?.usesDeepLinks ?? false);
  const [premium, setPremium] = useState(store?.premiumProxy ?? false);
  const [testUrl, setTestUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const runTest = async (form: HTMLFormElement) => {
    if (!testUrl.startsWith('http')) {
      toast.error('ألصق رابط منتج من هذا المتجر أولاً');
      return;
    }
    setTesting(true);
    setResult(null);
    try {
      const fd = new FormData(form);
      const res = await fetch('/api/admin/test-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: testUrl,
          storeId: store?.id,
          name: fd.get('name'),
          currency: fd.get('currency'),
          rateToSar: fd.get('rateToSar'),
          scrapeMode: mode,
          priceSelector: fd.get('priceSelector'),
          listSelector: fd.get('listSelector'),
          stockSelector: fd.get('stockSelector'),
          premiumProxy: premium,
        }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) toast.success(`قرأ السعر: ${data.price}`);
      else toast.error('لم يُقرأ سعر — راجع التفاصيل');
    } catch {
      toast.error('فشل الاتصال بالخادم');
    } finally {
      setTesting(false);
    }
  };

  return (
    <form
      action={async (fd) => {
        setSaving(true);
        try {
          if (editing) await updateStore(fd);
          else await createStore(fd);
          toast.success(editing ? 'حُفظ المتجر' : 'أُضيف المتجر');
          onDone?.();
        } catch (e: any) {
          toast.error(e?.message || 'فشل الحفظ');
        } finally {
          setSaving(false);
        }
      }}
      className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 shadow-sm"
    >
      {editing && <input type="hidden" name="id" value={store.id} />}
      <input type="hidden" name="color" value={color} />
      <input type="hidden" name="scrapeMode" value={mode} />
      <input type="hidden" name="usesDeepLinks" value={String(deep)} />
      <input type="hidden" name="premiumProxy" value={String(premium)} />

      {/* ---- الهوية ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={label}>الاسم بالعربي *</label>
          <input name="name" defaultValue={store?.name} required placeholder="مثال: جرير" className={input} />
        </div>
        <div>
          <label className={label}>الاسم اللاتيني</label>
          <input name="latinName" defaultValue={store?.latinName} placeholder="Jarir" className={input} dir="ltr" />
        </div>
        <div>
          <label className={label}>النطاق (يفصل بفاصلة لو أكثر)</label>
          <input name="domain" defaultValue={store?.domain || ''} placeholder="jarir.com" className={input} dir="ltr" />
        </div>
        <div>
          <label className={label}>ترتيب الظهور</label>
          <input name="sortOrder" type="number" defaultValue={store?.sortOrder ?? 10} className={input} />
        </div>
      </div>

      {/* ---- اللون ---- */}
      <div>
        <label className={label}>لون المتجر — يظهر في كل الصفحات</label>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value.toUpperCase())}
            className="w-11 h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer"
            aria-label="اختر لون المتجر"
          />
          <span className="font-mono text-xs font-black px-2 py-1 rounded" style={{ backgroundColor: `${color}1A`, color }}>
            {color}
          </span>
          {PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`لون ${c}`}
              className={`w-6 h-6 rounded-md border-2 transition-transform hover:scale-110 ${
                color === c ? 'border-slate-900 dark:border-white' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* ---- العمولة ---- */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
        <p className="text-[11px] font-black text-slate-400 mb-3">العمولة</p>
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input type="checkbox" checked={deep} onChange={(e) => setDeep(e.target.checked)} className="w-4 h-4 accent-cyan-600" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            يستخدم روابط تتبّع مولَّدة لكل منتج (مثل iDevAffiliate)
          </span>
        </label>
        {!deep && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={label}>اسم المعامل</label>
              <input name="affiliateParam" defaultValue={store?.affiliateParam || ''} placeholder="tag" className={input} dir="ltr" />
            </div>
            <div>
              <label className={label}>قيمته (معرّفك)</label>
              <input name="affiliateId" defaultValue={store?.affiliateId || ''} placeholder="my-id-21" className={input} dir="ltr" />
            </div>
          </div>
        )}
        {deep && (
          <input type="hidden" name="affiliateId" value={store?.affiliateId || ''} />
        )}
        <p className="text-[10px] font-semibold text-slate-400 mt-2 leading-relaxed">
          اتركه فارغاً إن لم تتأكّد من المعامل — رابط بمعامل خاطئ أسوأ من رابط بلا معامل: يبدو ناجحاً ولا يُحتسب.
        </p>
      </div>

      {/* ---- إعلان حالة المتجر ---- */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
        <p className="text-[11px] font-black text-slate-400 mb-3">إعلان للزوّار (عطل · صيانة · تأخّر شحن)</p>
        <textarea
          name="noticeMessage"
          defaultValue={store?.noticeMessage || ''}
          rows={2}
          placeholder="مثال: موقع المتجر يمرّ بعطل تقني حالياً — قد لا تفتح صفحات المنتجات."
          className={`${input} resize-y`}
        />
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <label className={label + ' mb-0'}>يختفي تلقائياً في</label>
          <input
            type="datetime-local"
            name="noticeUntil"
            defaultValue={store?.noticeUntil ? new Date(store.noticeUntil).toISOString().slice(0, 16) : ''}
            className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <span className="text-[10px] font-semibold text-slate-400">
            اتركه فارغاً ليبقى حتى تمسح النص. الإعلان يظهر عند عروض هذا المتجر في صفحة القطعة وصفحة البناء.
          </span>
        </div>
      </div>

      {/* ---- العملة ---- */}
      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
        <div>
          <label className={label}>العملة المعروضة</label>
          <input name="currency" defaultValue={store?.currency || 'SAR'} className={input} dir="ltr" />
        </div>
        <div>
          <label className={label}>تحويلها للريال (×)</label>
          <input name="rateToSar" type="number" step="0.001" defaultValue={store?.rateToSar ?? 1} className={input} dir="ltr" />
        </div>
      </div>

      {/* ---- السحب ---- */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
        <p className="text-[11px] font-black text-slate-400 mb-3">تحديث الأسعار</p>
        <div className="flex gap-1.5 flex-wrap mb-3">
          {[
            { k: 'auto', t: 'تلقائي', d: 'JSON-LD ثم وسوم meta' },
            { k: 'custom', t: 'محدّد CSS', d: 'محدّدات تكتبها أنت' },
            { k: 'native', t: 'محرّك مخصّص', d: 'مكتوب بالكود لهذا المتجر' },
            { k: 'off', t: 'بلا سحب', d: 'سعر يدوي، لا يستهلك رصيداً' },
          ].map((m) => (
            <button
              key={m.k}
              type="button"
              onClick={() => setMode(m.k)}
              title={m.d}
              className={`text-[11px] font-black px-3 py-1.5 rounded-lg border transition-colors ${
                mode === m.k
                  ? 'bg-cyan-600 border-cyan-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-400'
              }`}
            >
              {m.t}
            </button>
          ))}
        </div>

        {mode === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className={label}>محدّد السعر</label>
              <input name="priceSelector" defaultValue={store?.priceSelector || ''} placeholder=".product-price" className={input} dir="ltr" />
            </div>
            <div>
              <label className={label}>محدّد السعر قبل الخصم</label>
              <input name="listSelector" defaultValue={store?.listSelector || ''} placeholder=".old-price" className={input} dir="ltr" />
            </div>
            <div>
              <label className={label}>محدّد التوفّر</label>
              <input name="stockSelector" defaultValue={store?.stockSelector || ''} placeholder=".in-stock" className={input} dir="ltr" />
            </div>
          </div>
        )}
        {mode !== 'custom' && (
          <>
            <input type="hidden" name="priceSelector" value={store?.priceSelector || ''} />
            <input type="hidden" name="listSelector" value={store?.listSelector || ''} />
            <input type="hidden" name="stockSelector" value={store?.stockSelector || ''} />
          </>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={premium} onChange={(e) => setPremium(e.target.checked)} className="w-4 h-4 accent-cyan-600" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            بروكسي متقدّم — لازم للمتاجر ذات الحماية العالية، ويستهلك رصيداً أكثر
          </span>
        </label>

        {/* ---- الاختبار الحيّ ---- */}
        <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700">
          <label className={label}>جرّب على رابط منتج قبل الاعتماد</label>
          <div className="flex gap-2 flex-wrap">
            <input
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://…/product/…"
              className={`${input} flex-1 min-w-[220px]`}
              dir="ltr"
            />
            <button
              type="button"
              disabled={testing}
              onClick={(e) => runTest((e.currentTarget.closest('form') as HTMLFormElement))}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-black rounded-lg disabled:opacity-50"
            >
              {testing ? 'جارٍ الفحص…' : '🔍 اختبر المتجر'}
            </button>
          </div>

          {result && (
            <div
              className={`mt-3 p-3 rounded-lg text-xs font-bold border ${
                result.success
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-800/50 text-rose-800 dark:text-rose-300'
              }`}
            >
              {result.success ? (
                <div className="space-y-1">
                  <div>✅ السعر: <span className="font-mono font-black">{result.price}</span> {result.currencyFound || ''}</div>
                  {result.listPrice && <div>قبل الخصم: <span className="font-mono">{result.listPrice}</span></div>}
                  <div>التوفّر: {result.inStock ? 'متوفّر' : 'نافد'}</div>
                  <div className="opacity-80">قُرئ من: {result.viaLabel} · {result.tookMs}ms</div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div>❌ {result.error || 'لم يُقرأ سعر'}</div>
                  {(result.errors || []).map((e: string, i: number) => <div key={i} className="opacity-80">{e}</div>)}
                  <div className="opacity-80">جرّب «محدّد CSS» أو فعّل البروكسي المتقدّم.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="active" value="true" defaultChecked={store?.active ?? true} className="w-4 h-4 accent-emerald-600" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">مفعّل (يظهر في الموقع)</span>
        </label>
        <button
          type="submit"
          disabled={saving}
          className="mr-auto px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-black rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? '...' : editing ? 'حفظ التعديلات' : 'إضافة المتجر'}
        </button>
      </div>
    </form>
  );
}
