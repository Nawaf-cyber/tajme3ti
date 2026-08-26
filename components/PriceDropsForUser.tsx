'use client';

/* ============ «نزلت أسعارها» — الجلب ============
 *
 * يُعرض في «تجميعاتي» لا في صفحةٍ جديدة: المستخدم قال بالفعل ما يهمّه حين
 * حفظ تجميعته (٤٠٧ أزواج مستخدم×قطعة موجودة أصلاً)، وصفحةٌ تطلب منه أن
 * يقوله ثانيةً تبدأ فارغةً عند ثُلثَي مستخدميه.
 *
 * ⚠️ ولا يُكتب هنا وعدُ «يصلك إشعار»: لا مزوّد بريدٍ ولا دفعَ ويب بعد.
 * ما يقع أنه **يراها حين يفتح** — والنصّ يقول ذلك حرفياً.
 *
 * ويُعلَّم مقروءاً عند العرض لا عند النقر: رؤيتُه للقائمة هي الاطّلاع،
 * وإبقاءُ النقطة حمراء بعد أن قرأها يجعلها ضجيجاً يُتجاهل.
 */

import { useEffect, useState } from 'react';
import DropsPanel, { type Drop } from './DropsPanel';

export default function PriceDropsForUser() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [unseen, setUnseen] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch('/api/price-drops')
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setDrops(Array.isArray(d.drops) ? d.drops : []);
        setUnseen(Number(d.unseen) || 0);
        setTotalSaved(Number(d.totalSaved) || 0);
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

  return <DropsPanel drops={drops} unseen={unseen} totalSaved={totalSaved} />;
}
