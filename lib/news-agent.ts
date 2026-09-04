/* ============ كاتب الأخبار ============
 *
 * خطوتان لا واحدة، وهو أهمّ ما في هذا الملفّ:
 *
 *   ١) يقترح عناوين — من **بحثٍ حيّ** لا من ذاكرته
 *   ٢) تختار عنواناً — فيكتب المقال، مستنداً إلى نفس البحث
 *
 * ⚠️ ولماذا البحث شرطٌ لا تحسين: نموذجٌ يُسأل «ما أخبار الكروت؟» بلا أدوات
 * يُجيب من تدريبه — فيكتب سعراً قديماً بثقة، أو إطلاقاً لم يحدث، أو يخلط
 * جيلين. وخبرٌ مختلَقٌ على موقعٍ يقرؤه مشترون أسوأ من لا خبر. فالأداة
 * `web_search` مفروضةٌ في الخطوتين، ويُطلب المصدر والتاريخ مع كلّ عنوان.
 *
 * ⚠️ والكتابة إنسانيّةٌ عمداً: لا عناوينَ فرعيّةٌ آليّة، ولا قوائم نقطيّة في
 * كلّ فقرة، ولا «في الختام». جملٌ مختلفة الطول، ورأيٌ صريحٌ حين يلزم،
 * وأرقامٌ من الكتالوج حين تنفع. القالب الجامد يُقرأ آلةً — وهذا ما طُلب
 * تجنّبه صراحةً.
 */

import Anthropic from '@anthropic-ai/sdk';

export const NEWS_MODEL = 'claude-opus-5';

/* ⚠️ نسخة الأداة تختلف بالنموذج: `_20260209` لـOpus 5، والقديمة لما دونه.
   وخطأُ النسخة يُعيد 400 لا نتيجةً فارغة. */
const WEB_SEARCH = { type: 'web_search_20260209', name: 'web_search', max_uses: 8 } as const;

export type Topic = {
  title: string;
  angle: string;
  source: string;
  date: string;
  why: string;
};

export type Usage = { input: number; output: number; cacheRead: number; cacheWrite: number };

export const costUsd = (u: Usage): number =>
  (u.input * 5 + u.cacheWrite * 6.25 + u.cacheRead * 0.5 + u.output * 25) / 1_000_000;

const usageOf = (res: any): Usage => ({
  input: res.usage?.input_tokens ?? 0,
  output: res.usage?.output_tokens ?? 0,
  cacheRead: res.usage?.cache_read_input_tokens ?? 0,
  cacheWrite: res.usage?.cache_creation_input_tokens ?? 0,
});

const textOf = (res: any): string =>
  (res.content ?? [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('\n')
    .trim();

/* ------------------------------------------------------------------ */

const TOPICS_SYSTEM = `أنت محرّر أخبار تقنية لموقع «تجميعتي» — منصّة سعوديّة لبناء الحواسيب ومقارنة أسعار قطعها. قرّاؤك مشترون سعوديّون يبنون أجهزة، لا متخصّصون.

مهمّتك: **اقتراح عناوين أخبار حديثة وموثوقة** — ولا تكتب المقال.

## قواعد لا تُخالَف

١. **ابحث أولاً.** استعمل أداة البحث. لا تقترح خبراً من معرفتك السابقة إطلاقاً.
٢. **كلّ عنوان يجب أن يستند إلى خبرٍ منشورٍ فعلاً** خلال الأسابيع الأربعة الماضية، ومصدره موقعٌ تقنيّ معروف أو إعلان الشركة نفسها.
٣. **إن لم تجد أخباراً حديثة في موضوعٍ ما، قل ذلك** ولا تملأ الفراغ باقتراحاتٍ عامّة.
٤. اختر ما **يهمّ مشترياً سعوديّاً**: إطلاق قطعة، تغيّر أسعار، مشكلة في منتج، تحديث يرفع الأداء، توفّر في السوق. وتجاهل أخبار الشركات المالية وأخبار المؤتمرات التي لا تغيّر قرار شراء.

## صيغة الجواب

أعِد **JSON فقط** بلا أيّ نصٍّ قبله أو بعده، بهذا الشكل:

[
  {
    "title": "عنوان عربيّ جاهز للنشر، لا ترجمة حرفيّة",
    "angle": "الزاوية التي سيُكتب بها المقال في جملة",
    "source": "اسم الموقع الذي نُشر فيه الخبر",
    "date": "تاريخ النشر كما وجدته",
    "why": "لماذا يهمّ مشترياً سعوديّاً — جملة واحدة"
  }
]

من خمسة إلى سبعة عناوين. وإن لم تجد إلّا ثلاثة موثوقة فأعِد ثلاثة.`;

export async function suggestTopics(
  focus: string,
  client = new Anthropic(),
): Promise<{ topics: Topic[]; raw: string; usage: Usage }> {
  const res = await client.messages.create({
    model: NEWS_MODEL,
    max_tokens: 8000,
    system: [{ type: 'text', text: TOPICS_SYSTEM, cache_control: { type: 'ephemeral' } }],
    thinking: { type: 'adaptive' },
    tools: [WEB_SEARCH as any],
    messages: [{
      role: 'user',
      content: focus.trim()
        ? `ابحث عن أحدث أخبار: ${focus.trim()}\n\nثمّ اقترح العناوين.`
        : 'ابحث عن أحدث أخبار قطع الحاسب (كروت الشاشة، المعالجات، الذواكر، التخزين) في الأسابيع الأربعة الماضية، ثمّ اقترح العناوين.',
    }],
  });

  const raw = textOf(res);
  /* ⚠️ ويُنتزع أوّل مصفوفةٍ من النصّ: النموذج قد يسبقها بسطرٍ رغم الطلب،
     وإسقاطُ الجواب كلِّه لأجل سطرٍ زائد إهدارٌ لبحثٍ دُفع ثمنُه. */
  let topics: Topic[] = [];
  const m = raw.match(/\[[\s\S]*\]/);
  if (m) { try { topics = JSON.parse(m[0]); } catch { topics = []; } }

  return { topics: Array.isArray(topics) ? topics : [], raw, usage: usageOf(res) };
}

/* ------------------------------------------------------------------ */

const WRITE_SYSTEM = `أنت تكتب مقالاً إخبارياً عربياً لموقع «تجميعتي» — منصّة سعوديّة لبناء الحواسيب.

## من يقرأ

مشترٍ سعوديّ يفكّر في تجميعة أو ترقية. يعرف أساسيّات القطع ولا يعرف تفاصيل المعماريّات. يريد أن يعرف: **هل يغيّر هذا الخبر قراري؟**

## ابحث قبل أن تكتب

استعمل أداة البحث للتحقّق من كل رقم وتاريخ واسم قبل كتابته. ولا تكتب رقماً لم تره في مصدر. وإن اختلفت المصادر فقل ذلك.

## كيف تكتب — والأهمّ في هذا القسم

اكتب كما يكتب **إنسان يعرف الموضوع ويحدّث صديقاً**، لا كما تكتب آلة تملأ قالباً:

- **نوّع طول الجمل.** جملة طويلة تشرح، ثمّ قصيرة تُثبّت. الإيقاع الواحد يُقرأ آلةً.
- **ابدأ بما يهمّ فعلاً**، لا بمقدّمة عن أهمّية التقنية. لا «في عالم التقنية المتسارع».
- **لا عناوين فرعيّة كثيرة.** فقرتان أو ثلاث تحت عنوانٍ فرعيّ واحد على الأكثر، وقد لا تحتاج أيّاً منها.
- **لا قوائم نقطيّة** إلّا حين تكون القائمة هي الشكل الطبيعيّ للمعلومة (مواصفات، أسعار).
- **قل رأيك بصراحة** حين تملك سبباً: «هذا لا يستحقّ الانتظار» أو «إن كنت على 3070 فالترقية الآن منطقيّة». المقال الذي لا يقول شيئاً لا يُقرأ.
- **لا خاتمة تلخّص ما قلته.** انتهِ عند آخر معلومة مفيدة.
- **لا مبالغة تسويقيّة**: «ثورة» و«الأقوى على الإطلاق» و«يغيّر قواعد اللعبة» ممنوعة.
- اذكر المصادر في آخر المقال كسطرٍ بسيط.

## الطول والصيغة

من ٦٠٠ إلى ٩٠٠ كلمة. أعِد **JSON فقط** بهذا الشكل:

{
  "title": "العنوان النهائيّ",
  "summary": "ملخّص في جملتين — يظهر في بطاقة الخبر",
  "category": "كروت الشاشة | المعالجات | الذواكر | التخزين | عام",
  "content": "نصّ المقال كاملاً بصيغة HTML بسيطة: <p> للفقرات، <h2> لعنوان فرعيّ إن لزم، <strong> للتأكيد، <ul><li> للقوائم عند الحاجة فقط"
}`;

export type Article = { title: string; summary: string; category: string; content: string };

export async function writeArticle(
  topic: { title: string; angle?: string; source?: string },
  context: string,
  client = new Anthropic(),
): Promise<{ article: Article | null; raw: string; problems: string[]; usage: Usage }> {
  const res = await client.messages.create({
    model: NEWS_MODEL,
    max_tokens: 16000,
    system: [{ type: 'text', text: WRITE_SYSTEM, cache_control: { type: 'ephemeral' } }],
    thinking: { type: 'adaptive' },
    tools: [WEB_SEARCH as any],
    messages: [{
      role: 'user',
      content:
        `العنوان المطلوب: ${topic.title}\n` +
        (topic.angle ? `الزاوية: ${topic.angle}\n` : '') +
        (topic.source ? `المصدر الذي وُجد فيه الخبر: ${topic.source}\n` : '') +
        (context.trim() ? `\nملاحظات المحرّر: ${context.trim()}\n` : '') +
        `\nابحث للتحقّق، ثمّ اكتب المقال.`,
    }],
  });

  const raw = textOf(res);
  let article: Article | null = null;
  const m = raw.match(/\{[\s\S]*\}/);
  if (m) { try { article = JSON.parse(m[0]); } catch { article = null; } }

  return { article, raw, problems: checkArticle(article), usage: usageOf(res) };
}

/* ------------------------------------------------------------------ */

/**
 * فحصُ المقال قبل عرضه.
 *
 * ⚠️ ويفحص **النبرة** كما يفحص البنية: العبارات الممنوعة أدناه هي علامات
 * الكتابة الآليّة التي طُلب تجنّبها صراحةً. ووجودُها يعني أنّ النموذج سقط
 * في القالب رغم التعليمات، فيُقال للمحرّر بدل أن يمرّ.
 */
const CLICHES = [
  'في عالم التقنية',
  'في الختام',
  'وفي النهاية',
  'يغيّر قواعد اللعبة',
  'ثورة حقيقية',
  'الأقوى على الإطلاق',
  'مما لا شك فيه',
  'جدير بالذكر',
  'تجدر الإشارة',
];

export function checkArticle(a: Article | null): string[] {
  const p: string[] = [];
  if (!a) return ['لم أستطع قراءة الجواب — أعد المحاولة'];
  if (!String(a.title ?? '').trim()) p.push('بلا عنوان');
  if (!String(a.summary ?? '').trim()) p.push('بلا ملخّص');

  const body = String(a.content ?? '');
  const words = body.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  if (words < 450) p.push(`قصير (${words} كلمة)`);
  if (!/<p[\s>]/i.test(body)) p.push('بلا فقرات <p>');

  const found = CLICHES.filter((c) => body.includes(c));
  if (found.length) p.push('عباراتٌ آليّة: ' + found.join('، '));

  return p;
}

/** عدد كلمات المقال — للعرض في الواجهة */
export const wordCount = (html: string): number =>
  String(html || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
