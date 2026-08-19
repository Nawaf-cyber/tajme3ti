/**
 * رقائق الشراء — صفحة تجميعاتي وصفحة التجميعة المشتركة.
 *
 * كانت في كل صفحة ثلاث كتل، لكل متجر لونه المكتوب يدوياً (bg-[#232F3E]…)
 * وبألوان متضاربة بين الصفحتين. الآن لون واحد لكل متجر مصدره جدول Store.
 *
 * ============ ⚠️ لماذا لم تعد الشارة مصمتة ============
 *
 * كانت تُملأ بلون المتجر ويُكتب عليها بالأبيض. وقياس التباين يقول إن هذا
 * يُخفي ثلاثة من أربعة متاجر:
 *
 *   Microless #DC2626 → 4.83 ✓ · CazaSouq #A855F7 → 3.96 ✗
 *   Amazon    #FF9900 → 2.14 ✗ · Noon     #EEFF00 → 1.11 ✗✗
 *
 * والحدّ ٤٫٥. فأصفر نون مع الأبيض يكاد يختفي — وهو ما رآه المستخدم.
 *
 * فصارت **محدَّدةً لا مملوءة**: الحدّ يحمل لون المتجر كما هو (الحدّ لا
 * يُقرأ فلا يخضع لحدّ التباين)، والنصّ يأخذ `--store-ink` — أقربَ صورةٍ
 * من لون المتجر تبلغ ٤٫٥ على الخلفية الفعلية. فأصفر نون يصير زيتونياً
 * داكناً على الأبيض ويبقى أصفر على الداكن: الهويّة تُحفظ حيث تُقرأ.
 *
 * والسعر على كل شارة لأن الموقع قائمٌ على المقارنة: شارةٌ تقول «أين»
 * ولا تقول «بكم» تجبر الزائر على فتح كل رابطٍ ليعرف.
 */

import { buildStoreUrl, storeLinkProps } from '../lib/affiliate';
import { liveOffers, storeVars, type Offer } from '../lib/stores';
import { formatPrice } from '../lib/price';

export default function StoreBuyChips({ offers }: { offers?: Offer[] | null }) {
  const rows = liveOffers(offers);
  if (rows.length === 0) return null;

  /* `liveOffers` تُرتّب تصاعدياً بالسعر، فالأوّل هو الأرخص بحكم الترتيب لا
     بحسابٍ ثانٍ يتباعد عنه. وأرخصُ من واحدٍ لا معنى لتعليمه. */
  const markCheapest = rows.length > 1;

  return (
    <>
      {rows.map((o, i) => {
        const cheapest = markCheapest && i === 0;
        return (
          <a
            key={o.storeId}
            href={buildStoreUrl(o.store, o.url, o.affiliateUrl)}
            {...storeLinkProps(o.store)}
            title={cheapest ? `${o.store.latinName} — الأرخص` : o.store.latinName}
            style={storeVars(o.store.color)}
            className={
              'relative flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-bold ' +
              'border-[color:var(--store-color)] bg-[var(--store-tint)] ' +
              'text-[color:var(--store-ink)] dark:text-[color:var(--store-ink-dark)] ' +
              'transition-all hover:bg-[var(--store-soft)] hover:-translate-y-0.5'
            }
          >
            {/* علامة الأرخص: نقطةٌ خضراء صغيرة فوق الحافّة.
                ⚠️ فوق الشارة لا داخلها: الشارة عرضها نصٌّ ورقم، وأي عنصرٍ
                إضافيّ داخلها يدفع الشارات إلى سطرٍ ثانٍ في كل صفّ. وحلقةٌ
                حول الشارة كانت تنافس حدَّها الملوّن فتُربك الحدّين.
                والأخضر هو لون السعر في الموقع كلّه، فالنقطة تُقرأ بلا شرح —
                والكلمة تبقى في `title` لمن يقف عليها. */}
            {cheapest && (
              <span
                aria-hidden
                className="absolute -top-1 start-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0F172A]"
              />
            )}

            <span>{o.store.latinName}</span>

            {/* dir=ltr على الرقم: العربية تقلب ترتيب «1,234.5» بدونه.
                و tabular-nums تجعل الأرقام متساوية العرض فتصطفّ الشارات. */}
            <span dir="ltr" className="tabular-nums font-black opacity-90">
              {formatPrice(o.price)}
            </span>

            <svg className="w-2.5 h-2.5 opacity-60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        );
      })}
    </>
  );
}
