/* ============ تسجيل زيارة ============
 *
 * ⚠️ اسم المسار `/api/hit` لا `/api/analytics` ولا `/api/track`: مانعات
 * الإعلانات تحجب بقوائم مساراتٍ معروفة، والاسمان الأخيران فيها. ومسارٌ
 * محجوبٌ يعني أرقاماً ناقصةً بلا أن يظهر خطأ — أسوأ من ألّا نقيس.
 *
 * ⚠️ ويعمل على Node لا Edge: البصمة تحتاج `crypto` والكتابة تحتاج Prisma.
 * ولهذا لا يُسجَّل من `middleware.ts` — ذاك على Edge ولا يبلغ قاعدتنا.
 *
 * ⚠️ ولا يُصدّق المتصفّح في شيءٍ يخصّ الهويّة: البصمة تُحسب هنا من ترويسات
 * الطلب، والحسابُ يُقرأ من الجلسة. وكل ما يرسله العميل هو **أين كان** —
 * وهو ما لا يستطيع الخادم معرفته في التنقّل داخل التطبيق.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import {
  riyadhDay, clientIp, dailyVisitorHash, isBot, deviceOf, refererHost, normalizePath,
} from '../../../lib/visitor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** ردٌّ فارغ بلا محتوى — النبضة لا تنتظر جواباً */
const ok = () => new NextResponse(null, { status: 204 });

export async function POST(req: Request) {
  try {
    const ua = req.headers.get('user-agent') || '';
    /* الروبوت يُردّ عليه بنجاحٍ ولا يُسجَّل: خطأٌ يجعله يعيد المحاولة */
    if (isBot(ua)) return ok();

    const body = await req.json().catch(() => ({}) as any);
    const raw = String(body?.p || '');
    if (!raw.startsWith('/')) return ok();
    /* ⚠️ ولا تُسجَّل صفحات الإدارة: زياراتنا نحن ليست قياساً للسوق */
    if (raw.startsWith('/admin')) return ok();

    const { path, componentId } = normalizePath(raw.split('?')[0]);
    const day = riyadhDay();
    const ip = clientIp(req.headers);
    const visitorHash = dailyVisitorHash(ip, ua, day);

    /* الجلسة اختياريّة: غيابها لا يمنع التسجيل، ووجودها يرفع الدقّة */
    const session = await getServerSession(authOptions).catch(() => null);
    const userId = (session?.user as any)?.id ?? null;

    const selfHost = new URL(req.url).hostname;

    await prisma.pageHit.create({
      data: {
        day,
        visitorHash,
        userId: userId ? String(userId) : null,
        path: path.slice(0, 180),
        componentId,
        refHost: refererHost(String(body?.r || '') || null, selfHost)?.slice(0, 120) ?? null,
        device: deviceOf(ua),
      },
    });

    return ok();
  } catch (e) {
    /* ⚠️ ولا يُرجع خطأ للزائر مهما حدث: هذه نبضةُ قياسٍ لا وظيفةُ الموقع.
       فشلُ التسجيل يخصّنا نحن، ولا يجوز أن يظهر في متصفّح أحد. */
    console.error('[hit]', e);
    return ok();
  }
}
