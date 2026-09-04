'use client';

/* ============ زرّ «توليد وصف» ============
 *
 * ⚠️ ولماذا يقرأ من الـDOM: نموذج إضافة القطعة في لوحة الإدارة **غير
 * متحكَّمٍ به** — يُرسَل بـ`action` من الخادم وتُقرأ قيمُه من الحقول عند
 * الإرسال. فالشركةُ والاسم والسعر لا توجد في حالة React أصلاً. أمّا
 * المواصفات فحالةٌ فعلاً، وتُمرَّر خاصّيّةً.
 *
 * ⚠️ ولا يُحفظ شيء: كان السبيل الوحيد لوصفٍ آليّ أن تُحفظ القطعة ثمّ يُطلب
 * وصفُها ثمّ تُحذف إن لم يعجب. هنا يُكتب النصّ في الحقل وأنت تقرؤه وتعدّله
 * قبل أن تضغط «حفظ» — ولا شيء يمسّ القاعدة قبل ذلك.
 */

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function GenerateDescriptionButton({
  category,
  specs,
  componentId,
}: {
  category: string;
  specs: Record<string, string>;
  /** معرّف القطعة حين تكون محفوظةً وتُعدَّل — تُستبعد من بدائلها */
  componentId?: string | null;
}) {
  const [busy, setBusy] = useState(false);

  const run = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if (!form) return;

    const val = (n: string) =>
      String((form.elements.namedItem(n) as HTMLInputElement | null)?.value ?? '').trim();

    const brand = val('brand');
    const name = val('name');
    if (!category || !brand || !name) {
      toast.error('أكمل الفئة والشركة والاسم أوّلاً');
      return;
    }

    /* الحقول الفارغة تُحذف: «socket: » في الطلب توحي بأنّنا نعرفها وهي فارغة */
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(specs)) if (String(v ?? '').trim()) clean[k] = String(v).trim();

    setBusy(true);
    const t = toast.loading('يكتب الوصف…');
    try {
      const r = await fetch('/api/admin/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'input',
          category, brand, name,
          componentId: componentId || undefined,
          price: val('price'),
          tdpWattage: val('tdpWattage'),
          specs: clean,
        }),
      });
      const d = await r.json();
      /* ⚠️ و`message` كذلك: حارس middleware يردّ قبل المسار بصيغةٍ أخرى */
      if (!r.ok) throw new Error(d?.error || d?.message || 'تعذّر التوليد');

      const ta = form.elements.namedItem('description') as HTMLTextAreaElement | null;
      if (!ta) throw new Error('لم أجد حقل الوصف');

      /* ⚠️ ولا يُكتب بـ`ta.value = …` وحده: React لا يرى التغيير فيرجع النصّ
         القديم عند أوّل إعادة رسم. فتُستدعى دالّةُ الضبط الأصليّة ثمّ يُبَثّ
         حدثُ input كي تعلم به الشجرة. */
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value',
      )?.set;
      setter ? setter.call(ta, d.description) : (ta.value = d.description);
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 520) + 'px';

      toast.dismiss(t);
      if (d.problems?.length) {
        toast(`كُتب — لكنّه لم يجتز الفحص: ${d.problems.join(' · ')}`, { icon: '⚠️', duration: 9000 });
      } else {
        toast.success(`كُتب الوصف · ${d.costSar}﷼`);
      }
    } catch (err: any) {
      toast.dismiss(t);
      toast.error(err?.message || 'تعذّر التوليد');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={busy}
      title="يكتب وصفاً من المواصفات التي أدخلتها، ويقترح بديلاً من الكتالوج في آخره"
      className="px-3 py-1.5 rounded-lg text-[12px] font-black bg-violet-700 hover:bg-violet-800 text-white transition-colors disabled:opacity-50"
    >
      {busy ? 'يكتب…' : '✨ توليد وصف'}
    </button>
  );
}
