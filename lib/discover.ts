/* ============ اكتشافُ ما ليس عندنا ============
 *
 * `/admin/store-search` تبحث بكلمةٍ **يكتبها الأدمن**. وهذا الملفّ يجيب عن
 * السؤال الذي قبلها: بأيّ كلمةٍ يبحث أصلاً؟
 *
 * ⚠️ والجواب من كتالوجنا نفسه لا من قائمةٍ مكتوبةٍ بيد: عائلاتُ الطرازات
 * التي نحملها («GeForce RTX 5070» · «Radeon RX 9070» · «B850») تُستخرج من
 * أسماء قطعنا، ثمّ يُسأل بها المتجر. وما يعود ولا رابطَ له عندنا = نسخةٌ
 * لا نحملها — لونٌ آخر أو إصدار OC أو ماركةٌ ثانية لنفس الشريحة.
 *
 * وهذا بالضبط ما كان المستخدم يضيفه بيده طوال هذه الجلسات: HYTE Y70
 * **Snow White** و5070 EAGLE OC **ICE** وA23 PLUS **White**.
 *
 * ⚠️ ولا قائمةَ كلماتٍ ثابتة: قائمةٌ مكتوبةٌ بيدٍ تشيخ في شهر، وتُصبح هي
 * سقفَ ما نكتشفه. أمّا الكتالوج فينمو، فينمو معه ما نسأل عنه.
 */

import { queryFor, IS_SYSTEM } from './source-match';

/**
 * حاسوبٌ جاهز أو خادمٌ لا قطعة — القاعدة في `lib/source-match.ts`.
 *
 * ⚠️ ولا تُكتب هنا نسخةٌ ثانية منها. كانت نسختين فتباعدتا **مرّتين**:
 *   • «desktop computer» أُضيفت هنا ولم تُضف هناك، فقبِل المُطابِق جهاز
 *     «ASUS D500ME … NVIDIA GeForce RTX 3060» مرشَّحاً لكرت شاشة.
 *   • و«all-in-one» و«bundle» أُضيفتا هناك ولم تُضافا هنا، فمرّ
 *     «Dell Pro 24 **All-In-One** … Core Ultra 5 235T» بـ٥٬٨٠١ ﷼ مرشَّحاً
 *     لمعالج — قِيس يوم 2026-09-16.
 *
 * والنسختان تسألان نفس السؤال، فخطأٌ يُصلَح في إحداهما يعيش في الأخرى.
 */
export { IS_SYSTEM };

export const isSystem = (title: string): boolean => IS_SYSTEM.test(String(title || ''));

export type Known = { id: string; brand: string; name: string; categoryName: string; offerUrls: string[] };
export type Found = { title: string; url: string; price?: number | null; image?: string | null };

/**
 * اسمٌ قصيرٌ يُقرأ من عنوان المتجر الطويل.
 *
 * ⚠️ وسببُ وجوده أنّ عناوين المتاجر تُكتب للفهرسة لا للقراءة: «XFX Speedster
 * SWFT210 Radeon RX 7600 Graphics Card with 8GB GDDR6 HDMI 3xDP, AMD RDNA 3
 * RX-76PSWFTFY» — مئةٌ وثلاثون حرفاً، الاسمُ فيها أوّلُ ثلاثين والباقي
 * إعادةٌ لما في المواصفات. وفي صفحةٍ عربيّةٍ يُقصّ العنوان من **أوّله**،
 * فيرى الأدمن «…dster MERC319 RX 7800 XT Black Gaming Graphics Card».
 *
 * فالقصّ ثلاث خطوات: عند أوّل فاصلةٍ أو شرطةٍ أو «with»، ثمّ عند اسم
 * النوع العامّ («Graphics Card») لأنّ ما بعده وصفٌ لا اسم، ثمّ سقفُ طول.
 *
 * ⚠️ ولا تُحذف كلمة «Gaming»: جُرّب فأفسد «RTX 4060 **Gaming X** 8G» فصار
 * «RTX 4060 X 8G». الكلمة جزءٌ من أسماء طرازاتٍ كثيرة — Gaming X وGaming
 * OC وGaming Trio. والحشوُ يُقطع بموضعه لا باسمه.
 */
export function shortTitle(title: string): string {
  let t = String(title || '').replace(/\s+/g, ' ').trim();
  /* ما بعد أوّل فاصلةٍ أو شرطةٍ طويلة وصفٌ لا اسم */
  t = t.split(/\s*[,،|]|\s+[-–—]\s+/)[0];
  /* «with 8GB GDDR6 …» تفصيلٌ يعيده جدول المواصفات */
  t = t.split(/\s+with\s+/i)[0];
  /* واسمُ النوع العامّ نهايةُ الاسم وبدايةُ الوصف */
  t = t
    .split(/\s+(?:graphics card|video card|desktop processor|memory kit|gaming pc)\b/i)[0]
    /* ⚠️ وأسماءُ أنواع المبرّدات أُضيفت بعد قياس: «ThermalRight Assassin X 120
       Refined SE ARGB **CPU Air Coo…**» — الحشو أكل آخر الاسم لا الوصف.
       ⚠️ و«AIO Liquid» تُقطع **قبل** «Liquid Cooler» وإلّا اختلف الاسمان
       لمنتجٍ واحد: «… AIO Liquid CPU Cooler» تُقطع عند AIO فتصير «(2024)»،
       و«… AIO Liquid Cooler» تُقطع عند Liquid فتصير «(2024) AIO» — فيمرّ
       المكرّر الذي جاء هذا الحذفُ ليمسكه. */
    .split(/\s+aio\s+liquid\b/i)[0]
    .split(/\s+(?:cpu\s+)?(?:air|liquid)\s+cool(?:er|ing)\b/i)[0]
    .split(/\s+cpu\s+cooler\b/i)[0]
    .trim();
  return t.length > 56 ? t.slice(0, 55).trimEnd() + '…' : t;
}

/**
 * دورانُ العائلات.
 *
 * ⚠️ ولولاه لبقيت المتاجر المدفوعة تُسأل عن نفس الشريحة أبداً: السقف
 * الزمنيّ يعطي كازاسوق ثماني عائلاتٍ في الطلب، و`slice(0, cap)` يأخذ
 * أوّل ثمانٍ دائماً. قِيس: من خمسٍ وخمسين عائلةً في اللوحات الأمّ تُسأل
 * ثمانٍ — **١٥٪، وهي هي في كلّ تشغيل**. فما بعدها لا يُكتشف أبداً.
 *
 * والدوران يحفظ أين وقف ويبدأ من بعده، فتُغطّى الخمس والخمسون في سبعة
 * تشغيلات. ويلتفّ عند النهاية فيعود إلى الأوّل — والسوق يتغيّر فتستحقّ
 * العائلةُ سؤالاً ثانياً.
 */
export function rotate<T>(all: T[], offset: number, take: number): { slice: T[]; next: number } {
  if (!all.length || take <= 0) return { slice: [], next: 0 };
  const start = ((offset % all.length) + all.length) % all.length;
  const n = Math.min(take, all.length);
  const slice = all.slice(start, start + n);
  if (slice.length < n) slice.push(...all.slice(0, n - slice.length));
  return { slice, next: (start + n) % all.length };
}

/**
 * حذفُ المكرّر بالاسم لا بالرابط.
 *
 * ⚠️ والرابط وحده لا يكفي: قِيس على مايكرولس فظهر «NZXT Kraken Elite 360
 * RGB (2024)» **سطرين** برابطين مختلفين — صفحتان لمنتجٍ واحد. والأدمن
 * يقرأ السطرين ويقارنهما ثمّ يكتشف أنّهما شيءٌ واحد.
 */
export function dedupeByName<T extends { title: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of rows) {
    const key = shortTitle(r.title).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

/** يُسوّى الرابط قبل المقارنة: نفس المنتج يأتي بذيولِ بحثٍ مختلفة */
export const normUrl = (u: string): string =>
  String(u || '')
    .split('?')[0].split('#')[0]
    .replace(/\/+$/, '')
    .toLowerCase()
    /* ⚠️ وبادئةُ اللغة تُحذف: إنفيني آرك يعطي نفس المنتج بـ`/ar/shop/…`
       وبـ`/shop/…`، وخريطةُ موقعه تستعمل الأولى وروابطُنا المحفوظة الثانية.
       فبلا هذا يُحسب المنتج الواحد اثنين — يُعرض «جديداً» في الاكتشاف وقد
       يُضاف عرضاً مكرّراً للقطعة نفسها. قِيس فعلاً على ROG Astral 5090. */
    .replace(/^(https?:\/\/[^/]+)\/(ar|en)(\/)/, '$1$3');

/**
 * كلماتُ السؤال — عائلاتُ ما نحمله في فئةٍ واحدة.
 *
 * ⚠️ و`queryFor` هي نفسها التي يستعملها «مصدر ثانٍ»: ثلاثُ كلماتٍ بعد
 * تجريد الوحدات. ولا تُكتب هنا نسخةٌ ثانية منها — نسختان تتباعدان.
 */
export function seedQueries(known: Known[], category: string, limit = 40): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of known) {
    if (k.categoryName !== category) continue;
    const q = queryFor(k.name).trim();
    /* كلمةٌ من حرفين لا تصلح سؤالاً — تُعيد نصف المتجر */
    if (q.length < 4) continue;
    const key = q.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * ما عاد من البحث وليس عندنا.
 *
 * ⚠️ والمطابقة **بالرابط** لا بالاسم — وهو نفس اختيار `/admin/store-search`،
 * وسببه أنّ الاسم يُكتب في كلّ متجرٍ بصيغة: «RTX 5070 EAGLE OC ICE 12G»
 * هنا و«Gigabyte GeForce RTX5070 Eagle OC Ice» هناك. الرابط لا يكذب.
 *
 * ⚠️ ويُستبعد المكرّر داخل النتائج نفسها: عائلتان من كلماتنا قد تُعيدان
 * نفس المنتج، فيظهر مرّتين في صفحة المراجعة بلا سبب.
 */
export function unknownOnly(
  found: Array<Found & { query: string }>,
  known: Known[],
): Array<Found & { query: string }> {
  const mine = new Set<string>();
  for (const k of known) for (const u of k.offerUrls) mine.add(normUrl(u));

  const seen = new Set<string>();
  const out: Array<Found & { query: string }> = [];
  for (const f of found) {
    const u = normUrl(f.url);
    if (!u || mine.has(u) || seen.has(u)) continue;
    seen.add(u);
    out.push(f);
  }
  return out;
}
