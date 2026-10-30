/* ============ نصّ المقال إلى عناوين وفقرات (2026-10-30) ============
 *
 * المقالات نصٌّ عاديّ في القاعدة: فقراتٌ بينها سطرٌ فارغ، والعنوان الفرعيّ سطرٌ
 * قصير في أوّل الكتلة («كيف تحسب القدرة التي تحتاجها؟» ثم الفقرة تحته)، أو كتلةٌ
 * وحدها. لا Markdown ولا وسوم (قِيس على المقالات العشرين كلّها). فكان يُعرض كتلةً
 * واحدة بـwhitespace-pre-wrap، والعنوان الفرعيّ بحجم الفقرة نفسه.
 *
 * القاعدة: سطرٌ أوّل ≤ ٧٠ حرفاً لا ينتهي بنقطةٍ أو فاصلة = عنوان. والفقرة التي
 * تبدأ بـ«الخلاصة:» تُرفع إلى صندوقٍ فوق المقال وتُحذف من آخره — لا تُقال مرّتين.
 */

export type ArticleBlock = { type: 'h'; text: string; id: string } | { type: 'p'; text: string };
export type ParsedArticle = { blocks: ArticleBlock[]; summary: string | null; words: number };

const HEADING_MAX = 70;
const isHeading = (line: string) => line.length > 0 && line.length <= HEADING_MAX && !/[.!،,:؛]$/.test(line);
const SUMMARY = /^الخلاصة\s*[:：]\s*/;

export function parseArticle(content: string): ParsedArticle {
  const blocks: ArticleBlock[] = [];
  let summary: string | null = null;
  let h = 0;

  for (const raw of content.replace(/\r\n/g, '\n').split(/\n\s*\n/)) {
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    let rest = lines;
    if (isHeading(lines[0]) && !(lines.length === 1 && blocks.length === 0)) {
      blocks.push({ type: 'h', text: lines[0], id: `s${++h}` });
      rest = lines.slice(1);
    }
    if (!rest.length) continue;
    const text = rest.join('\n');
    if (!summary && SUMMARY.test(text)) {
      summary = text.replace(SUMMARY, '');
      continue;
    }
    blocks.push({ type: 'p', text });
  }

  /* عنوانٌ بلا فقرةٍ بعده (آخر المقال) لا معنى له وحده */
  while (blocks.length && blocks[blocks.length - 1].type === 'h') blocks.pop();

  const words = content.split(/\s+/).filter(Boolean).length;
  return { blocks, summary, words };
}

/** «قراءة 3 دقائق» — نحو ١٨٠ كلمة في الدقيقة للعربيّة */
export const readingMinutes = (words: number) => Math.max(1, Math.round(words / 180));
