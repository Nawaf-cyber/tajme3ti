/* ============ منطق الإشارة إلى قطعةٍ داخل نصّ ============
 *
 * مفصولٌ عن المكوّن لسببين: أنّه الجزء الذي يخطئ (لا الأزرار)، ولأنّه
 * يُختبَر هكذا بحالاتٍ حقيقيّة بلا متصفّح.
 *
 * ⚠️ والتصادم الأهمّ: «###» عنوانُ قسمٍ في لغة الوصف نفسها. فلو أطلقت «#»
 * القائمةَ في كل موضعٍ لانفتحت مع كل عنوانٍ يكتبه الأدمن. فهي تعمل إلّا في
 * أوّل السطر — وهو موضع العنوان بالضبط.
 *
 * ⚠️ والبريد: «nawaf@gmail» ليس إشارة. فالمُطلِق يجب أن يبدأ كلمةً — أي أن
 * يسبقه فراغٌ أو بدايةُ سطر.
 */

export type MentionItem = { id: string; name: string; brand: string; category: string };

/** أقصى طول استعلامٍ بعد المُطلِق — أطول من هذا نثرٌ لا بحث */
export const MAX_QUERY = 40;

/**
 * يقرأ المُطلِق الذي يقع المؤشّر داخل استعلامه.
 *
 * ⚠️ والمسافات مسموحةٌ داخل الاستعلام عمداً: «PRO B760M-P DDR4» أربع كلمات،
 * ووقفُ البحث عند أوّل مسافةٍ يجعل الإشارة عديمة الفائدة لأسماء القطع.
 * والقائمة تُغلق وحدها حين لا يُطابق شيء — فلا تعلق مفتوحةً في نثرٍ عاديّ.
 */
export function detectMention(text: string, caret: number): { at: number; query: string } | null {
  for (let i = caret - 1; i >= 0 && caret - i <= MAX_QUERY + 1; i--) {
    const ch = text[i];
    if (ch === '\n') return null;
    if (ch !== '@' && ch !== '#') continue;

    const atLineStart = i === 0 || text[i - 1] === '\n';
    /* «#» في أوّل السطر عنوانُ قسمٍ لا إشارة */
    if (ch === '#' && atLineStart) return null;
    /* المُطلِق يبدأ كلمة — وإلّا فبريدٌ أو وسمٌ داخل كلمة */
    if (!atLineStart && !/[\s(\[،,]/.test(text[i - 1])) return null;

    return { at: i, query: text.slice(i + 1, caret) };
  }
  return null;
}

/** ترشيحٌ بكل كلمات الاستعلام، وفئةُ القطعة المُحرَّرة أوّلاً */
export function rankMentions(
  items: MentionItem[],
  query: string,
  category?: string | null,
  limit = 8,
): MentionItem[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const cat = category || '';
  return items
    .filter((it) => {
      const hay = (it.brand + ' ' + it.name).toLowerCase();
      return tokens.every((t) => hay.includes(t));
    })
    .sort((a, b) => {
      /* ⚠️ من يكتب وصف لوحةٍ أمّ يوصي بلوحةٍ أخرى غالباً — لكنّ الفئات
         الأخرى تبقى ظاهرةً بعدها: «هذا المعالج يحتاج مبرّداً أقوى». */
      const sa = a.category === cat ? 0 : 1;
      const sb = b.category === cat ? 0 : 1;
      return sa - sb || a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

/** نصّ الرابط كما يفهمه `RichDescription` */
export function mentionLink(it: MentionItem): string {
  /* ⚠️ الأقواس تُزال من النصّ: «]» داخله يقطع الرابط في المُصيّر */
  const label = `${it.brand} ${it.name}`.replace(/[\[\]()]/g, '').replace(/\s+/g, ' ').trim();
  return `[${label}](/components/${it.id})`;
}

/** يستبدل المُطلِق واستعلامه بالرابط، ويُعيد النصّ وموضع المؤشّر بعده */
export function applyMention(
  text: string,
  at: number,
  caret: number,
  it: MentionItem,
): { text: string; caret: number } {
  const link = mentionLink(it);
  return {
    text: text.slice(0, at) + link + ' ' + text.slice(caret),
    caret: at + link.length + 1,
  };
}
