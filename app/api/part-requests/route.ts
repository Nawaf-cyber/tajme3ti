import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { normalizePartName, isValidPartName } from '../../../lib/part-request';

// حماية من السبام: 5 طلبات في الساعة لكل مستخدم/عنوان
let ratelimit: Ratelimit | null = null;
try {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: true,
  });
} catch {
  console.warn('Upstash غير مهيأ — تخطّي rate limit على طلبات القطع.');
}

/* ============ إرسال طلب قطعة ============
   متاح للجميع (يُحتسب للطلب)؛ المسجّل يُربط طلبه بحسابه ليتابع الحالة. */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const userId = (token?.id as string) || null;

    // مفتاح الحدّ: المستخدم إن وُجد، وإلا العنوان
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (ratelimit) {
      const { success } = await ratelimit.limit(userId ? `partreq_${userId}` : `partreq_ip_${ip}`);
      if (!success) {
        return NextResponse.json({ message: 'أرسلت طلبات كثيرة. جرّب بعد قليل.' }, { status: 429 });
      }
    }

    const body = await req.json();
    const rawName: string = typeof body?.name === 'string' ? body.name : '';
    const source: string | null = ['builder', 'components', 'compare'].includes(body?.source) ? body.source : null;

    if (!isValidPartName(rawName)) {
      return NextResponse.json({ message: 'اكتب اسم القطعة (حرفان على الأقل).' }, { status: 400 });
    }

    const name = rawName.trim().replace(/\s+/g, ' ').slice(0, 80);
    const normalized = normalizePartName(rawName);

    // نجد القطعة المطلوبة أو ننشئها (الدمج بالاسم المطبّع)
    const rp = await prisma.requestedPart.upsert({
      where: { normalized },
      update: {}, // موجودة → نُبقي اسمها الأول وحالتها
      create: { name, normalized },
    });

    // نسجّل الطلب: المسجّل صوت واحد (dedup)، المجهول كل مرة يُحتسب
    let alreadyRequested = false;
    if (userId) {
      const existing = await prisma.partVote.findUnique({
        where: { requestedPartId_userId: { requestedPartId: rp.id, userId } },
      });
      if (existing) {
        alreadyRequested = true;
      } else {
        await prisma.partVote.create({ data: { requestedPartId: rp.id, userId, source } });
      }
    } else {
      await prisma.partVote.create({ data: { requestedPartId: rp.id, userId: null, source } });
    }

    return NextResponse.json(
      {
        message: alreadyRequested ? 'طلبك مسجّل مسبقاً لهذه القطعة.' : 'تم استلام اقتراحك.',
        tracked: Boolean(userId),
        alreadyRequested,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('🔴 خطأ في طلب قطعة:', error);
    return NextResponse.json({ message: 'حدث خطأ في السيرفر.' }, { status: 500 });
  }
}

/* ============ طلبات المستخدم الحالي (للمتابعة في حسابه) ============ */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const userId = token?.id as string | undefined;
    if (!userId) return NextResponse.json({ requests: [] }, { status: 200 });

    const votes = await prisma.partVote.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        requestedPart: {
          select: {
            name: true,
            status: true,
            component: {
              select: { id: true, name: true, category: { select: { name: true } } },
            },
          },
        },
      },
    });

    const requests = votes.map((v) => ({
      name: v.requestedPart.name,
      status: v.requestedPart.status,
      createdAt: v.createdAt,
      component: v.requestedPart.component
        ? {
            id: v.requestedPart.component.id,
            name: v.requestedPart.component.name,
            categoryName: v.requestedPart.component.category?.name || '',
          }
        : null,
    }));

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error('🔴 خطأ في جلب طلبات المستخدم:', error);
    return NextResponse.json({ requests: [] }, { status: 500 });
  }
}
