'use client';

/**
 * حقول المتاجر في نموذج القطعة — تُولَّد من جدول Store.
 *
 * كانت ثلاث كتل ثابتة (رابط + سعر + توفّر لكل متجر) موزّعة في مكانين من
 * النموذج، وإضافة متجر رابع كانت تعني نسخ كتلة رابعة. الآن كتلة واحدة لكل
 * متجر مفعّل، بأسماء حقول store_<id>_* يقرأها saveOffersFromForm تلقائياً.
 */

import { useState } from 'react';
import { storeVars, type StoreInfo } from '../../lib/stores';

export type ExistingOffer = {
  storeId: string;
  url: string | null;
  affiliateUrl: string | null;
  price: number | null;
  inStock: boolean;
};

export default function StoreFieldsGroup({
  stores,
  offers,
}: {
  stores: StoreInfo[];
  offers: ExistingOffer[];
}) {
  const byStore = new Map(offers.map((o) => [o.storeId, o]));
  // مفتاح التوفّر لكل متجر — يعطّل حقل السعر عند إلغائه كما في النموذج السابق
  const [stock, setStock] = useState<Record<string, boolean>>(
    Object.fromEntries(stores.map((s) => [s.id, byStore.get(s.id)?.inStock ?? true])),
  );

  if (stores.length === 0) {
    return (
      <div className="md:col-span-2 p-4 rounded-xl border border-dashed border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm font-bold">
        لا يوجد متجر مفعّل. أضف متجراً من «المتاجر» أولاً كي تظهر حقول الروابط والأسعار.
      </div>
    );
  }

  const input =
    'w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all text-left';

  return (
    <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-blue-200 dark:border-blue-900/50 mt-2">
      <h4 className="text-sm font-black text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        روابط المتاجر وأسعارها
        <span className="font-normal text-[11px] text-slate-500">
          السعر اليدوي يتجاوز السحب حتى الدورة القادمة
        </span>
      </h4>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {stores.map((s) => {
          const cur = byStore.get(s.id);
          const on = stock[s.id] ?? true;
          return (
            <div
              key={s.id}
              style={storeVars(s.color)}
              className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 border-r-4 border-r-[color:var(--store-color)] shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[color:var(--store-color)]" />
                  {s.name}
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) => setStock((p) => ({ ...p, [s.id]: e.target.checked }))}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">متوفّر</span>
                </label>
              </div>
              <input type="hidden" name={`store_${s.id}_stock`} value={String(on)} />

              <input
                type="url"
                name={`store_${s.id}_url`}
                defaultValue={cur?.url || ''}
                placeholder={`رابط المنتج في ${s.name}`}
                className={input}
                dir="ltr"
              />

              <input
                type="number"
                step="0.01"
                name={`store_${s.id}_price`}
                defaultValue={cur?.price ?? ''}
                placeholder={`السعر في ${s.name} (ريال)`}
                disabled={!on}
                className={input}
                dir="ltr"
              />

              {/* شبكات الروابط العميقة فقط — لا معنى للحقل في غيرها */}
              {s.usesDeepLinks && (
                <div className="flex flex-col gap-1">
                  <input
                    type="url"
                    name={`store_${s.id}_aff`}
                    defaultValue={cur?.affiliateUrl || ''}
                    placeholder="رابط التتبّع المولَّد (idevaffiliate.php?id=…&url=…)"
                    pattern="https?://.*idevaffiliate\.com/.*"
                    className="w-full p-2.5 border-2 border-emerald-300 dark:border-emerald-800/60 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                    dir="ltr"
                  />
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold leading-relaxed">
                    🔗 من لوحة الشريك: روابط التتبّع ← الروابط البديلة للصفحات الداخلة ← إنشاء رابط.
                    متى وُضِع، تُحتسب عمولتك <b>ويهبط الزائر على المنتج مباشرة</b>.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
