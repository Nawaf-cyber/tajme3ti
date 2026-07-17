import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * مساعد فهم النيّة.
 *
 * ⚠️ مبدأ معماري لا يُخالَف:
 * النموذج **لا يختار قطعاً إطلاقاً**. مهمته الوحيدة ترجمة كلام المستخدم
 * إلى JSON منظّم. اختيار القطع يتم في العميل من الكتالوج الحقيقي فقط.
 *
 * السبب: لو ترك للنموذج الاختيار، سيقترح "RTX 4090" التي قد لا نملكها،
 * أو سعراً من ذاكرته لا يطابق سوقنا. هذا يهدم "نوجّه المجتمع، لا نبيع".
 */

let ratelimit: Ratelimit | null = null;
try {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(15, '10 m'),
    analytics: true,
  });
} catch {
  console.warn('Upstash غير مُعدّ — تخطّي حد المعدّل.');
}

const SYSTEM_PROMPT = `أنت مساعد في منصة "تجميعتي" لتجميع أجهزة الحاسب في السعودية.

مهمتك الوحيدة: فهم ما يريده المستخدم وتحويله إلى JSON. أنت **لا تقترح قطعاً ولا أسعاراً إطلاقاً** — النظام يتولى ذلك من كتالوجه.

حلّل رسالة المستخدم واستخرج:
- use: الاستخدام الأساسي. القيم المسموحة فقط:
  "competitive-shooter" (شوتر تنافسي: فالورانت، CS، أبيكس، وارزون)
  "aaa-gaming" (ألعاب ثقيلة: سايبربانك، RDR2، ألعاب عالم مفتوح)
  "casual-gaming" (ألعاب خفيفة: ماين كرافت، فورتنايت، ألعاب قديمة)
  "editing" (مونتاج فيديو، رندر، تصميم)
  "streaming" (بث مباشر)
  "office" (مكتبي، دراسة، برمجة)
  "mixed" (أكثر من استخدام)
- resolution: "1080p" أو "1440p" أو "4K" أو null إن لم يُذكر
- fpsTarget: رقم (60/144/240) أو null
- budget: رقم بالريال إن ذكره المستخدم صراحة، وإلا null
- alsoStreams: true/false/null (هل يبث أو يصوّر؟)
- missing: مصفوفة بما ينقص لبناء دقيق. القيم: "resolution" أو "alsoStreams"
- question: سؤال عربي قصير واحد عن أهم ناقص، أو null إن اكتمل كل شيء
- summary: جملة عربية قصيرة تلخّص فهمك (بلا ذكر قطع أو أسعار)

قواعد صارمة:
1. أخرج JSON فقط. بلا شرح، بلا markdown، بلا \`\`\`.
2. لا تذكر اسم أي قطعة (RTX، Ryzen، إلخ) في أي حقل.
3. لا تذكر أي سعر أو ميزانية لم يقلها المستخدم صراحة.
4. سؤال واحد فقط في question — الأهم.
5. إن لم تفهم الرسالة إطلاقاً، اجعل use = null و question سؤالاً توضيحياً.

مثال:
المستخدم: "ألعب شوتر تنافسي وأبي فريمات عالية"
المخرج: {"use":"competitive-shooter","resolution":null,"fpsTarget":144,"budget":null,"alsoStreams":null,"missing":["resolution"],"question":"على أي دقة تلعب — 1080p أم 1440p؟","summary":"تريد جهازاً للشوتر التنافسي بفريمات عالية."}`;

export async function POST(req: NextRequest) {
  // حد المعدّل — استدعاءات النموذج مكلفة
  const session = await getServerSession(authOptions);
  const ip = req.headers.get('x-forwarded-for') || 'anon';
  const key = (session?.user as any)?.id || ip;

  if (ratelimit) {
    const { success } = await ratelimit.limit(`ai_advisor_${key}`);
    if (!success) {
      return NextResponse.json(
        { error: 'تجاوزت عدد المحاولات. انتظر قليلاً وحاول مجدداً.' },
        { status: 429 }
      );
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'المساعد غير مُفعّل حالياً.' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const message = typeof body?.message === 'string' ? body.message.slice(0, 500) : '';
    const history = Array.isArray(body?.history) ? body.history.slice(-6) : [];

    if (!message.trim()) {
      return NextResponse.json({ error: 'اكتب ما تريده أولاً.' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    // نمرّر المحادثة السابقة ليفهم الإجابات على أسئلته
    const convo = history
      .map((h: any) => `${h.role === 'user' ? 'المستخدم' : 'المساعد'}: ${String(h.text).slice(0, 300)}`)
      .join('\n');

    const prompt = convo ? `${convo}\nالمستخدم: ${message}` : `المستخدم: ${message}`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    let intent: any;
    try {
      intent = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      return NextResponse.json({ error: 'تعذّر فهم الرد. حاول بصياغة أوضح.' }, { status: 502 });
    }

    // ===== تعقيم المخرجات =====
    // لا نثق بالنموذج. نفرض القيم المسموحة فقط.
    const ALLOWED_USE = [
      'competitive-shooter', 'aaa-gaming', 'casual-gaming',
      'editing', 'streaming', 'office', 'mixed',
    ];
    const ALLOWED_RES = ['1080p', '1440p', '4K'];

    const clean = {
      use: ALLOWED_USE.includes(intent?.use) ? intent.use : null,
      resolution: ALLOWED_RES.includes(intent?.resolution) ? intent.resolution : null,
      fpsTarget: typeof intent?.fpsTarget === 'number' && intent.fpsTarget > 0 ? intent.fpsTarget : null,
      budget: typeof intent?.budget === 'number' && intent.budget > 0 ? intent.budget : null,
      alsoStreams: typeof intent?.alsoStreams === 'boolean' ? intent.alsoStreams : null,
      question: typeof intent?.question === 'string' ? intent.question.slice(0, 200) : null,
      summary: typeof intent?.summary === 'string' ? intent.summary.slice(0, 200) : null,
    };

    return NextResponse.json(clean, { status: 200 });
  } catch (err: any) {
    console.error('AI advisor error:', err?.message);
    return NextResponse.json({ error: 'تعذّر الاتصال بالمساعد.' }, { status: 500 });
  }
}