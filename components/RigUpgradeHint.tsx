'use client';

/* ============ «وش أرقّي؟» — السطر الذي يجيب ============
 *
 * ⚠️ ولا يُعرض لمن جهازُه متوازن: `weakestLink` تُعيد `null` حين يكون
 * الفارق درجةً أو أقلّ، والمسار يردّ `null` — فلا صندوقَ فارغ يقول
 * «لا شيء». ومن لا اختناقَ عنده لا يحتاج نصيحةً بالترقية.
 *
 * ⚠️ والحالةُ الثالثة تُقال: قد يكون الاختناق موجوداً ولا ترقيةَ
 * **تُركَّب** — كرتٌ أقوى لا يدخل الكيس، أو معالجٌ أعلى لا يقبله المقبس.
 * والصدق حينها أن نقول «تحتاج تغيير قطعةٍ ثانية معه»، لا أن نسكت
 * فيظنّ أنّ جهازه لا يُرقّى.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productImage, IMAGE_FALLBACK } from '../lib/image';
import { formatPrice } from '../lib/price';

type Upgrade = {
  category: 'CPU' | 'GPU';
  current: string | null;
  pick: { id: string; brand: string; name: string; price: number; imageUrl: string | null; tier: number } | null;
  blocked: boolean;
} | null;

const LABEL = { CPU: 'المعالج', GPU: 'كرت الشاشة' } as const;
const WITH = { CPU: 'اللوحة الأمّ', GPU: 'الكيس أو المزوّد' } as const;

export default function RigUpgradeHint({ rigId }: { rigId: string }) {
  const [u, setU] = useState<Upgrade | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    fetch('/api/rig/upgrade')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive) setU(d); })
      .catch(() => { if (alive) setU(null); });
    return () => { alive = false; };
    /* يُعاد السؤال حين يتبدّل الجهاز */
  }, [rigId]);

  if (u === undefined || u === null) return null;

  return (
    <div className="mt-3 p-3.5 rounded-sm border border-violet-200 dark:border-violet-800/40 bg-violet-50/70 dark:bg-violet-900/15">
      <p className="text-[12.5px] font-black text-violet-800 dark:text-violet-300 mb-2">
        🔧 أضعف حلقة: <span className="underline decoration-violet-400/60">{LABEL[u.category]}</span>
        {u.current && <span className="font-bold opacity-70"> — {u.current}</span>}
      </p>

      {u.pick ? (
        <Link
          href={`/components/${u.pick.id}`}
          className="group flex items-center gap-3 p-2 rounded-sm bg-white/80 dark:bg-slate-900/50 border border-violet-200/70 dark:border-violet-800/40 hover:border-violet-400 dark:hover:border-violet-600 transition-colors"
        >
          <img
            src={productImage(u.pick.imageUrl, IMAGE_FALLBACK)}
            alt=""
            loading="lazy"
            className="w-10 h-10 object-contain rounded-sm bg-white shrink-0 p-0.5"
          />
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-black text-violet-500 dark:text-violet-400">
              أرخصُ ترقيةٍ تفكّها — وتُركَّب في جهازك
            </span>
            <span className="block text-[12.5px] font-black text-slate-800 dark:text-slate-100 truncate">
              {u.pick.brand} {u.pick.name}
            </span>
          </div>
          <span className="shrink-0 font-black text-[15px] text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatPrice(u.pick.price)} ﷼
          </span>
          <span className="shrink-0 text-violet-500 transition-transform group-hover:-translate-x-1">←</span>
        </Link>
      ) : (
        <p className="text-[12px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
          {u.blocked
            ? `عندنا ما هو أقوى، لكن لا شيء منه يُركَّب في جهازك كما هو — ستحتاج تغيير ${WITH[u.category]} معه.`
            : 'ولا نحمل اليوم ما هو أقوى منه ومتوفّرٌ للشراء.'}
        </p>
      )}
    </div>
  );
}
