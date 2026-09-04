/* ============ كاتب أوصاف القطع ============
 *
 * ⚠️ لماذا وُجد: ٢٣ قطعةً أُضيفت يوم 2026-09-02 وخرجت بلا وصفٍ إطلاقاً —
 * مُلئت مواصفاتها وصورها وعروضها ونُسي الوصف، ولم يُكتشف حتى سأل المستخدم.
 * وكتابتها يدويّاً استغرقت ساعةً ونصفاً لثلاثٍ وعشرين قطعة.
 *
 * ============ ما لا يفعله هذا الملفّ ============
 *
 * ⚠️ **لا يكتب في القاعدة.** يُعيد مسوّدةً ونتيجةَ فحصٍ، والكتابة بإقرار
 * المستخدم — وهو نفس فصل «البحث ثمّ الإقرار» في `/admin/find-sources`،
 * وللسبب نفسه: النموذج يكتب نصّاً واثقاً عن بياناتٍ خاطئة بلا أن يشكّ.
 * وأخطاءُ يومٍ واحدٍ في هذا المشروع تشهد: عرضا tray يَعِدان بمبرّدٍ لا
 * يصل، وطقمُ ذاكرةٍ بسعر منتجٍ آخر، وحقلُ الرسوميّات غائبٌ في ٤٠ من ٤٦.
 * فالنموذج يصف ما نعطيه، والبيانات مسؤوليّتنا لا مسؤوليّته.
 *
 * ============ الحرّاس بعد التوليد ============
 *
 * ⚠️ ولا يُوثق بالمخرَج لأنّه جاء من نموذج: يُفحص آليّاً قبل أن يُعرض —
 * كلُّ رابطٍ داخليّ يجب أن يشير إلى قطعةٍ **موجودة** ومن **نفس الفئة**،
 * والأقسام الثلاثة يجب أن تكون حاضرة. رابطٌ ميتٌ في وصفٍ منشورٍ عطبٌ
 * يراه الزائر، وقد قِيست الأوصاف القائمة: ٣٠٠ رابطٍ داخليّ، ٠ ميت.
 */

import Anthropic from '@anthropic-ai/sdk';

export const DESCRIBE_MODEL = 'claude-opus-5';

export type PartInput = {
  id: string;
  brand: string;
  name: string;
  category: string;
  price: number;
  tdpWattage?: number | null;
  specs: Record<string, unknown>;
  /** أسماء المتاجر التي عندها عرضٌ حيّ — تُذكر حين تكون ذات دلالة */
  stores: string[];
};

/** بديلٌ مرشَّح للربط في آخر الوصف — من نفس الفئة، بمعرّفٍ حقيقيّ */
export type PeerInput = {
  id: string;
  brand: string;
  name: string;
  price: number;
  specs: Record<string, unknown>;
};

export type DraftResult = {
  description: string;
  problems: string[];
  usage: { input: number; output: number; cacheRead: number; cacheWrite: number };
};

/* ------------------------------------------------------------------ */

/**
 * البادئة الثابتة — تُخزَّن مؤقّتاً فتُقرأ بعُشر السعر في كلّ نداءٍ بعد الأوّل.
 *
 * ⚠️ ولذلك **لا يدخلها شيءٌ متغيّر**: لا اسم قطعة ولا تاريخ ولا سعر. أيّ
 * بايتٍ يتغيّر في البادئة يُبطل التخزين لما بعده، فتُدفع الأسعار كاملةً بلا
 * أن يظهر خطأ. يُتحقّق منه بـ`usage.cacheRead` — صفرٌ متكرّرٌ يعني تسرّباً.
 */
const SYSTEM = `أنت تكتب أوصاف قطع الحاسب لموقع «تجميعتي» — منصّة سعوديّة لمقارنة أسعار القطع وبناء التجميعات.

## الصيغة المطلوبة حرفيّاً

### <الشركة واسم القطعة>

<فقرةٌ واحدة تقول ما يميّز هذه القطعة بالضبط، ويفضَّل أن تقارنها بما في الكتالوج>

التقنيات الأساسية المدعومة:

[green]<الميزة>:[/green] <التفصيل>

<أربعُ ميزاتٍ إلى خمس، كلٌّ في سطرٍ مستقلّ بينها سطرٌ فارغ>

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* <بندان إلى ثلاثة، تبدأ الأخطرَ بـ⚠️ ونصٍّ عريض>

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* <بندان>

---
بإمكانك التوجه إلى [<اسم البديل>](/components/<معرّفه>) إذا كان توجهك يتركز على الآتي:
* <سببٌ واحد يقول ماذا يكسب المشتري وماذا يخسر>

## قواعد لا تُخالَف

١. **لا تخترع رقماً.** كلُّ رقمٍ تكتبه يجب أن يكون في المواصفات المعطاة. إن لم تُعطَ الرقم فلا تذكر الميزة.
٢. **البديل من القائمة المعطاة وحدها**، وبمعرّفه كما هو حرفاً بحرف. لا تخترع معرّفاً ولا تربط قطعةً من فئةٍ أخرى.
٣. **القيود الحقيقيّة تُقال بصراحة** في القسم الأصفر: ارتفاعُ ذاكرةٍ يصطدم بالمبرّد، سقفُ مبرّدٍ لا يقبل أيّ برج، عصا واحدة تعني قناةً واحدة، منفذ M.2 من جيلٍ أقدم. هذه أنفع ما في الوصف.
٤. **لا مبالغة تسويقيّة.** «الأفضل» و«الأقوى» لا تُكتب إلّا إن كان الرقم يثبتها ضمن الكتالوج المعطى.
٥. العربيّة فصيحةٌ سهلة، والأرقام التقنيّة بالإنجليزيّة كما تُكتب على المنتج (DDR5 · PCIe 5.0 · LGA1851).
٦. اكتب الوصف وحده. لا مقدّمة ولا تعليق ولا أسوار كود.`;

/* ------------------------------------------------------------------ */

const fmtSpecs = (s: Record<string, unknown>): string =>
  Object.entries(s).map(([k, v]) => `  ${k}: ${v}`).join('\n') || '  (لا مواصفات مسجّلة)';

const fmtPeer = (p: PeerInput): string =>
  `- ${p.id} | ${p.brand} ${p.name} | ${Math.round(p.price)}﷼ | ` +
  Object.entries(p.specs).slice(0, 6).map(([k, v]) => `${k}=${v}`).join(' · ');

export const buildUserPrompt = (part: PartInput, peers: PeerInput[]): string =>
  `الفئة: ${part.category}
القطعة: ${part.brand} ${part.name}
السعر المعروض: ${Math.round(part.price)}﷼${part.tdpWattage ? `\nالاستهلاك المسجّل: ${part.tdpWattage}W` : ''}
متوفّرة في: ${part.stores.join('، ') || 'لا عرضَ حيّاً'}

المواصفات المسجّلة عندنا:
${fmtSpecs(part.specs)}

بدائل من نفس الفئة في كتالوجنا — اختر منها واحداً واربطه بمعرّفه:
${peers.map(fmtPeer).join('\n')}

اكتب الوصف.`;

/* ------------------------------------------------------------------ */

/**
 * فحصُ المسوّدة قبل عرضها.
 *
 * ⚠️ والرابط الميت هو أخطر ما يخرج من هنا: المستخدم لا يفتح كلّ وصفٍ
 * ليجرّب روابطه، فيعيش العطب. فيُتحقّق من وجود القطعة **ومن فئتها** معاً —
 * ربطُ لوحةٍ أمّ في وصف مزوّدٍ رابطٌ حيٌّ ونصيحةٌ خاطئة.
 */
export function checkDraft(
  text: string,
  opts: { category: string; peerIds: Set<string>; selfId: string },
): string[] {
  const problems: string[] = [];

  if (!/\[green\]/.test(text)) problems.push('ينقصه قسم المزايا [green]');
  if (!/\[yellow\]/.test(text)) problems.push('ينقصه قسم [yellow]');
  if (!/\[red\]/.test(text)) problems.push('ينقصه قسم [red]');
  if (!/^###\s/m.test(text)) problems.push('ينقصه العنوان ###');

  const links = [...text.matchAll(/\/components\/([A-Za-z0-9]+)\)/g)].map((m) => m[1]);
  if (!links.length) problems.push('بلا بديلٍ مرتبط');
  for (const id of links) {
    if (id === opts.selfId) problems.push('يربط القطعة بنفسها');
    else if (!opts.peerIds.has(id)) problems.push(`معرّفٌ ليس من قائمة البدائل: ${id}`);
  }

  /* أسوار الكود والمقدّمات — تُفسد العرض إن مرّت */
  if (/```/.test(text)) problems.push('فيه أسوار كود');
  if (text.length < 400) problems.push(`قصيرٌ جدّاً (${text.length} حرفاً)`);

  return problems;
}

/* ------------------------------------------------------------------ */

export async function draftDescription(
  part: PartInput,
  peers: PeerInput[],
  client = new Anthropic(),
): Promise<DraftResult> {
  const res = await client.messages.create({
    model: DESCRIBE_MODEL,
    max_tokens: 16000,
    /* ⚠️ البادئة الثابتة وحدها تُخزَّن — والقطعة تأتي بعدها فلا تُبطلها */
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    thinking: { type: 'adaptive' },
    messages: [{ role: 'user', content: buildUserPrompt(part, peers) }],
  });

  const description = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  return {
    description,
    problems: checkDraft(description, {
      category: part.category,
      peerIds: new Set(peers.map((p) => p.id)),
      selfId: part.id,
    }),
    usage: {
      input: res.usage.input_tokens,
      output: res.usage.output_tokens,
      cacheRead: res.usage.cache_read_input_tokens ?? 0,
      cacheWrite: res.usage.cache_creation_input_tokens ?? 0,
    },
  };
}

/** كلفة النداء بأسعار Opus 5 المعلنة — تُطبع للمستخدم فلا تكون الفاتورة مفاجأة */
export const costUsd = (u: DraftResult['usage']): number =>
  (u.input * 5 + u.cacheWrite * 6.25 + u.cacheRead * 0.5 + u.output * 25) / 1_000_000;
