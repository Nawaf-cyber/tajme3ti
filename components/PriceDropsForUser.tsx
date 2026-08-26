'use client';

/* ============ «أسعارٌ تخصّك» — الجلب ============
 *
 * يُعرض في «تجميعاتي» لا في صفحةٍ جديدة: المستخدم قال بالفعل ما يهمّه حين
 * حفظ تجميعته (٤٠٧ أزواج مستخدم×قطعة موجودة أصلاً)، وصفحةٌ تطلب منه أن
 * يقوله ثانيةً تبدأ فارغةً عند ثُلثَي مستخدميه.
 *
 * ⚠️ ولا يُكتب هنا وعدُ «يصلك إشعار»: لا مزوّد بريدٍ ولا دفعَ ويب بعد.
 * ما يقع أنه **يراها حين يفتح** — والنصّ يقول ذلك حرفياً.
 *
 * ويُعلَّم مقروءاً عند العرض لا عند النقر: رؤيتُه للقائمة هي الاطّلاع.
 * ⚠️ وهذا يضيّق النافذة أيضاً — ما رآه لا يعود في الزيارة القادمة. فمن أراد
 * الإمساك بشيءٍ فله علامة الحفظ، وهي السبب في وجودها.
 */

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DropsPanel, { type DropsView } from './DropsPanel';

const EMPTY: DropsView = { fresh: [], pinned: [], lowest: [], totalSaved: 0 };

export default function PriceDropsForUser({ onOpenBuild }: {
  onOpenBuild?: (buildId: string) => void;
} = {}) {
  const [view, setView] = useState<DropsView>(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/price-drops')
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setView({
          fresh: Array.isArray(d.fresh) ? d.fresh : [],
          pinned: Array.isArray(d.pinned) ? d.pinned : [],
          lowest: Array.isArray(d.lowest) ? d.lowest : [],
          totalSaved: Number(d.totalSaved) || 0,
        });
        /* الاطّلاع يُسجَّل بعد العرض — ولو لم يكن جديدٌ فلا حاجة لكتابة */
        if ((Number(d.unseen) || 0) > 0) {
          fetch('/api/price-drops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seen: true }),
          }).catch(() => {});
          /* والنافبار في الـlayout لا يُعاد تركيبه — فيُخبَر مباشرةً */
          window.dispatchEvent(new Event('drops-seen'));
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  /* الحفظ يُغيّر المجموعات لا صفّاً واحداً (ينتقل من «جديد» إلى «محفوظة»
     وقد يبقى في الاثنين)، فتُعاد القراءة من المصدر بدل تخمين النتيجة هنا.
     ⚠️ ولا يُعلَّم مقروءاً في هذه القراءة: الاطّلاع سُجّل عند العرض، وتكرارُه
     هنا يقدّم حدَّ النافذة فيبتلع ما لم يره بعد. */
  const refresh = async () => {
    const d = await fetch('/api/price-drops').then((r) => r.json());
    setView({
      fresh: Array.isArray(d.fresh) ? d.fresh : [],
      pinned: Array.isArray(d.pinned) ? d.pinned : [],
      lowest: Array.isArray(d.lowest) ? d.lowest : [],
      totalSaved: Number(d.totalSaved) || 0,
    });
  };

  const onPin = async (componentId: string, next: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/price-watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentId, pin: next }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || 'تعذّر الحفظ');
      await refresh();
      toast.success(next ? 'حُفظ السعر — يبقى هنا حتى ترفعه.' : 'رُفع الحفظ.');
    } catch (e: any) {
      toast.error(e?.message || 'تعذّر الحفظ، حاول ثانيةً.');
    } finally {
      setBusy(false);
    }
  };

  return <DropsPanel view={view} onOpenBuild={onOpenBuild} onPin={onPin} busy={busy} />;
}
