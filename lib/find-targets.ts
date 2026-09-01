/* ============ ما الذي يُفحص في «مصدر ثانٍ» ============
 *
 * مفصولٌ عن المسار لأنّه القرار الذي يُنفق الرصيد: كل قطعةٍ تدخل هنا =
 * طلبُ بحثٍ في المتجر، وبعض المتاجر بطلبٍ مدفوع.
 *
 * وضعان لا واحد:
 *
 *   مسحٌ بالفئة   — الأدمن لا يعرف أيّها ينقصه، فيُختار له: ما له **مصدرٌ
 *                   حيٌّ واحد** فقط، مرتّباً بالأغلى (خطؤه أكلف).
 *
 *   قطعٌ بعينها   — الأدمن سمّاها، فقد حكم. ولا يُطبَّق شرط «مصدرٌ واحد»:
 *                   قطعةٌ بمصدرين قد يُراد لها ثالثٌ يكسر تعادلاً.
 *
 * ⚠️ وشرطٌ واحد يبقى في الوضعين: ألّا يكون عندها عرضٌ في المتجر المقصود.
 * ذاك بحثٌ نتيجته معروفةٌ سلفاً وثمنه طلبٌ من الوسيط. ويُقال سببُ الاستبعاد
 * للمختارة صراحةً — أدمنٌ اختار خمساً وفُحصت ثلاثٌ يظنّها عطلاً.
 */

export type Target = {
  id: string;
  brand: string;
  name: string;
  /** أسماء متاجر كل العروض (حيّةً كانت أو لا) */
  storeSlugs: string[];
  /** عدد العروض الحيّة — يقرّره النداء بـ`liveOffers` */
  liveCount: number;
};

export function selectTargets<T extends Target>(
  all: T[],
  opts: { source: string; sourceLabel: string; explicitIds?: string[]; limit: number },
): { targets: T[]; skipped: string[] } {
  const explicit = new Set((opts.explicitIds || []).filter(Boolean));
  const byExplicit = explicit.size > 0;
  const skipped: string[] = [];

  /* ⚠️ والترشيح بالمعرّفات يجري **هنا** لا عند المُنادي وحده. قيس: مرِّر
     الكتالوج كلّه مع معرّفين، فتخرج ١٨٤ رسالة «عندها المتجر أصلاً» عن قطعٍ
     لم يخترها أحد. أن يعتمد الحارس على ترشيحٍ سابقٍ يعني أنّه ليس حارساً. */
  let out = (byExplicit ? all.filter((c) => explicit.has(c.id)) : all).filter((c) => {
    if (c.storeSlugs.includes(opts.source)) {
      if (byExplicit) skipped.push(`«${c.brand} ${c.name}» عندها عرضٌ في ${opts.sourceLabel} أصلاً`);
      return false;
    }
    return true;
  });

  if (!byExplicit) out = out.filter((c) => c.liveCount === 1);

  return { targets: out.slice(0, Math.max(1, opts.limit)), skipped };
}
