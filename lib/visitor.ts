/* ============ من هو الزائر؟ ============
 *
 * لا توجد طريقةٌ تعرف «الشخص». كلّها تعرف متصفّحاً على جهاز — بما فيها
 * تحليلات فيرسل. فالسؤال ليس «كيف نعرفه» بل «أيّ خطأٍ نقبله ولماذا».
 *
 * وهنا نموذجان معاً:
 *
 *   ١) المسجَّل يُعدّ بحسابه. يقينٌ تامّ، ويكسر التباس CGNAT، ويعبر
 *      الأجهزة: من فتح من جواله ثم حاسبه شخصٌ واحد.
 *
 *   ٢) وغيرُه ببصمةٍ **يوميّة**: HMAC(سرّ الخادم، اليوم) على IP والمتصفّح.
 *      بلا كوكي، فبلا بانر موافقة. وتتغيّر عند منتصف الليل، فلا يُتتبَّع
 *      أحدٌ عبر الأيام حتى لو تسرّب الجدول.
 *
 * ⚠️ وحدود (٢) تُقال ولا تُخفى: مشغّلو الجوال في السعودية يجمعون آلافاً
 * خلف IP واحد. فمن تطابق متصفّحه معهم اندمج في بصمةٍ واحدة، ومن غيّر
 * شبكته صار زائرين. ولذلك الرقم يُسمّى في اللوحة «متصفّحات في اليوم» لا
 * «أشخاص» — ورقمٌ مسمّىً خطأً يُبنى عليه قرارٌ خطأ.
 *
 * ⚠️ ولا يُخزَّن IP خام أبداً. يدخل الدالّة ولا يخرج منها.
 */

import { createHmac } from 'crypto';

/** اليوم بتوقيت الرياض — التجميع يوميّ، فيجب أن يبدأ اليوم حيث يبدأ عند القارئ */
export function riyadhDay(at: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at);
}

/**
 * أوّل عنوانٍ في `x-forwarded-for` — وهو عنوان الزائر، وما بعده وسطاء.
 *
 * ⚠️ ويُؤخذ الأوّل لا الأخير: الأخير عنوان بوّابة فيرسل نفسها، فلو أُخذ
 * لصار كلُّ زوّار الموقع بصمةً واحدة.
 */
export function clientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for') || '';
  const first = xff.split(',')[0]?.trim();
  return first || headers.get('x-real-ip') || '';
}

/** بصمة اليوم — لا تُقارن ببصمة يومٍ آخر، فالملح يتغيّر */
export function dailyVisitorHash(ip: string, userAgent: string, day: string): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.DATABASE_URL || 'fallback';
  /* الملح مشتقٌّ من سرٍّ لا يغادر الخادم + اليوم: يتغيّر وحده بلا جدولٍ
     يُدار، ولا يُعكَس من خارجٍ لأن السرّ غير معروف. */
  return createHmac('sha256', `${secret}:${day}`)
    .update(`${ip}|${userAgent}`)
    .digest('hex')
    .slice(0, 32);
}

/* ============ الروبوتات ============
 *
 * ⚠️ بلا هذا المرشِّح الأرقام كذبة: الزواحف تفتح كل صفحات الكتالوج بانتظام،
 * فتُنتج «زيارات» لا يقابلها قارئ. وقد لاحظنا في سجلّ التطوير زحفَ صفحات
 * القطع كلَّها في دقائق — ذلك ليس اهتماماً بالسوق.
 */
const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview|monitor|uptime|curl|wget|python-requests|axios|headless|lighthouse|pagespeed|gtmetrix|semrush|ahrefs|dataprovider|scrapy|node-fetch/i;

export const isBot = (userAgent: string): boolean => !userAgent || BOT.test(userAgent);

/** جوّال أم مكتب — تصنيفٌ خشن يكفي لقرار «هل نُحسّن للجوال؟» */
export const deviceOf = (userAgent: string): string =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) ? 'mobile' : 'desktop';

/**
 * نطاق المُحيل فقط.
 *
 * ⚠️ ولا يُخزَّن الرابط كاملاً: صفحةُ بحثٍ في جوجل تحمل نصَّ ما بحث عنه
 * الزائر، وحفظُه حفظٌ لسؤاله لا لمصدره. والنطاق يكفي للسؤال الذي نسأله:
 * من أين يأتي الناس؟
 */
export function refererHost(referer: string | null, selfHost: string): string | null {
  if (!referer) return null;
  try {
    const h = new URL(referer).hostname.replace(/^www\./, '');
    return h && h !== selfHost.replace(/^www\./, '') ? h : null;
  } catch {
    return null;
  }
}

/**
 * معرّف القطعة من المسار — `/components/<id>` فقط.
 *
 * ⚠️ والمسار يُطبَّع قبل الحفظ: `/components/cmxyz` مسارٌ فريدٌ لكل قطعة،
 * فلو حُفظ كما هو لصار جدول «أكثر الصفحات» ثلاثمئة صفٍّ بزيارةٍ واحدة.
 * فيُحفظ النمط `/components/[id]` ويُحفظ المعرّف في عموده.
 */
export function normalizePath(pathname: string): { path: string; componentId: string | null } {
  const m = pathname.match(/^\/components\/([A-Za-z0-9_-]{10,})\/?$/);
  if (m) return { path: '/components/[id]', componentId: m[1] };

  const generic = pathname.match(/^\/(build|guides|news|prebuilds)\/([A-Za-z0-9_-]{10,})\/?$/);
  if (generic) return { path: `/${generic[1]}/[id]`, componentId: null };

  return { path: pathname.replace(/\/+$/, '') || '/', componentId: null };
}
