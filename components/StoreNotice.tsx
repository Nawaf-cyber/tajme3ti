/**
 * إعلان حالة متجر — يظهر عند عروض ذلك المتجر وحده.
 *
 * لماذا ليس لافتة عامة أعلى الموقع: العطل يخصّ متجراً واحداً من عدّة،
 * وتحذيرٌ عامّ يجعل الزائر يشكّ في كل الأسعار. وهنا يقرأه في اللحظة التي
 * يهمّه فيها — قبل الضغط على رابط الشراء مباشرةً.
 */

import { storeVars } from '../lib/stores';

export type NoticeStore = {
  id: string;
  name: string;
  color: string;
  noticeMessage?: string | null;
  noticeUntil?: string | Date | null;
};

/** الإعلان فعّال؟ (لا رسالة = لا شيء، وانتهاء الوقت يُنهيه تلقائياً) */
export const noticeActive = (s?: NoticeStore | null): boolean => {
  if (!s?.noticeMessage?.trim()) return false;
  if (!s.noticeUntil) return true; // بلا تاريخ = مفتوح حتى يُمسح يدوياً
  return new Date(s.noticeUntil).getTime() > Date.now();
};

/** شريط مضغوط داخل بطاقة المتجر */
export function StoreNoticeInline({ store }: { store: NoticeStore }) {
  if (!noticeActive(store)) return null;
  return (
    <p className="flex items-start gap-1.5 mt-1.5 text-[11px] font-bold leading-relaxed text-amber-700 dark:text-amber-400">
      <span aria-hidden className="shrink-0">⚠</span>
      <span>{store.noticeMessage}</span>
    </p>
  );
}

/** شريط أعلى الصفحة — يُعرض فقط للمتاجر التي لها عرض في هذه الصفحة */
export default function StoreNotices({ stores }: { stores: NoticeStore[] }) {
  const active = stores.filter(noticeActive);
  if (active.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-4">
      {active.map((s) => (
        <div
          key={s.id}
          style={storeVars(s.color)}
          role="status"
          className="flex items-start gap-2.5 p-3 rounded-sm border border-amber-300 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20"
        >
          <span
            className="mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 bg-[color:var(--store-color)]"
            aria-hidden
          />
          <p className="text-[12.5px] font-bold text-amber-900 dark:text-amber-300 leading-relaxed">
            <span className="font-black">{s.name}:</span> {s.noticeMessage}
          </p>
        </div>
      ))}
    </div>
  );
}
