'use client';

/* ============ «ستوري لجهازك» ============
 *
 * زرٌّ في بطاقة الجهاز يفتح معاينة الستوري (`/api/rig/story`)، ومنها
 * المشاركة المباشرة إلى سناب وإنستقرام وواتساب.
 *
 * ⚠️ الصورة تُجلب **عند فتح النافذة** لا عند الضغط على «شارك»: سفاري
 * الآيفون لا يقبل `navigator.share` إلّا داخل لمسة المستخدم، وانتظارُ
 * شبكةٍ بين اللمسة والمشاركة يُسقطها (`NotAllowedError`). فالملفّ جاهزٌ
 * قبل اللمسة، والمعاينةُ نفسها تُعرض منه — طلبٌ واحد لا اثنان.
 *
 * ⚠️ ومشاركةُ الملفّات لا تعمل في متصفّحات الحاسب: هناك يصير الزرّ
 * «نزّل الصورة». والستوري أصلاً من الجوّال.
 */

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const FILE_NAME = 'jahazi-tajme3ti.png';

export default function RigStoryButton({ hasCustom }: { hasCustom: boolean }) {
  const [open, setOpen] = useState(false);
  const [withPrice, setWithPrice] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    try {
      const probe = new File([''], 'x.png', { type: 'image/png' });
      setCanShare(!!navigator.canShare?.({ files: [probe] }));
    } catch {
      setCanShare(false);
    }
  }, []);

  /* جلبٌ عند الفتح وعند تبديل السعر — والقديم يُلغى إن تبدّل قبل وصوله */
  useEffect(() => {
    if (!open) return;
    const ctrl = new AbortController();
    setFile(null);
    setFailed(false);
    fetch(`/api/rig/story?price=${withPrice ? 1 : 0}`, { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.blob();
      })
      .then((b) => setFile(new File([b], FILE_NAME, { type: 'image/png' })))
      .catch((e) => { if (e?.name !== 'AbortError') setFailed(true); });
    return () => ctrl.abort();
  }, [open, withPrice]);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const deliver = async () => {
    if (!file) return;
    if (canShare) {
      try {
        await navigator.share({ files: [file] });
      } catch (e: any) {
        if (e?.name !== 'AbortError') toast.error('تعذّرت المشاركة — جرّب «نزّل الصورة»');
      }
      return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = FILE_NAME;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3.5 py-2 rounded-sm text-[12.5px] font-black text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/60 bg-white/70 dark:bg-slate-900/40 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors"
      >
        📸 ستوري
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="ستوري جهازي"
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-[15px] text-slate-900 dark:text-white">ستوري جهازك</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>

            {/* المعاينة بنسبة الستوري — والهيكل ثابتٌ فلا تقفز النافذة */}
            <div className="relative mx-auto w-full max-w-[240px] aspect-[9/16] rounded-lg overflow-hidden bg-[#0B1120] border border-slate-200 dark:border-slate-800">
              {preview ? (
                <img src={preview} alt="معاينة الستوري" className="w-full h-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-slate-400">
                  {failed ? 'تعذّر إنشاء الصورة' : 'جارٍ التجهيز…'}
                </div>
              )}
            </div>

            <label
              className={`mt-4 flex items-center gap-2.5 text-[13px] font-bold ${
                hasCustom ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200 cursor-pointer'
              }`}
            >
              <input
                type="checkbox"
                checked={withPrice && !hasCustom}
                disabled={hasCustom}
                onChange={(e) => setWithPrice(e.target.checked)}
                className="w-4 h-4 accent-cyan-600"
              />
              أظهر «لو تشتريه اليوم» والسعر
            </label>
            {/* ⚠️ والسبب يُقال لا يُخفى: مربّعٌ معطّلٌ بلا تفسير يبدو عطلاً */}
            {hasCustom && (
              <p className="mt-1 ms-6 text-[11.5px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed">
                بعض قطعك مكتوبةٌ يدوياً بلا سعر — فالمجموع لن يكون سعر جهازك.
              </p>
            )}

            <button
              onClick={deliver}
              disabled={!file}
              className="mt-4 w-full py-3 rounded-sm text-[14px] font-black bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-wait text-white transition-colors"
            >
              {canShare ? 'شارك' : 'نزّل الصورة'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
