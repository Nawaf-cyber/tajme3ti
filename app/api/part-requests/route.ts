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

    /* ============ الاقتراح يتطلّب حساباً ============
       ليس تقييداً بل شرطُ اكتمال: الاقتراح المجهول يصل ولا يُرَدّ عليه ولا
       يعرف صاحبه مصيره — فيبدو للمقترِح أنه ذهب سدى. الحساب يفتح المتابعة
       والمحادثة وزرّ البناء عند الإضافة. */
    if (!userId) {
      return NextResponse.json(
        { message: 'سجّل دخولك لتتابع اقتراحك ونردّ عليك.', needsLogin: true },
        { status: 401 },
      );
    }

    if (ratelimit) {
      const { success } = await ratelimit.limit(`partreq_${userId}`);
      if (!success) {
        return NextResponse.json({ message: 'أرسلت طلبات كثيرة. جرّب بعد قليل.' }, { status: 429 });
      }
    }

    const body = await req.json();
    const rawName: string = typeof body?.name === 'string' ? body.name : '';
    const source: string | null = ['builder', 'components', 'compare'].includes(body?.source) ? body.source : null;

    /* الفئة يختارها المقترِح — نتحقّق أنها فئة موجودة فعلاً بدل الوثوق بما
       يُرسله العميل، فلا يُدسّ معرّف عشوائي. */
    const rawCat = typeof body?.categoryId === 'string' ? body.categoryId : '';
    const categoryId = rawCat
      ? (await prisma.category.findUnique({ where: { id: rawCat }, select: { id: true } }))?.id ?? null
      : null;

    if (!isValidPartName(rawName)) {
      return NextResponse.json({ message: 'اكتب اسم القطعة (حرفان على الأقل).' }, { status: 400 });
    }

    const name = rawName.trim().replace(/\s+/g, ' ').slice(0, 80);
    const normalized = normalizePartName(rawName);

    // نجد القطعة المطلوبة أو ننشئها (الدمج بالاسم المطبّع)
    const rp = await prisma.requestedPart.upsert({
      where: { normalized },
      // موجودة → نُبقي اسمها الأول وحالتها، ونملأ الفئة إن كانت ناقصة
      update: categoryId ? { category: { connect: { id: categoryId } } } : {},
      create: { name, normalized, categoryId },
    });

    // صوت واحد لكل مستخدم لكل قطعة
    let alreadyRequested = false;
    {
      const existing = await prisma.partVote.findUnique({
        where: { requestedPartId_userId: { requestedPartId: rp.id, userId } },
      });
      if (existing) {
        // كان قد أزاله ثم عاد يطلبه → نُعيد تفعيله بدل رفضه كـ"مسجّل مسبقاً"
        if (existing.removedAt) {
          await prisma.partVote.update({ where: { id: existing.id }, data: { removedAt: null } });
        } else {
          alreadyRequested = true;
        }
      } else {
        await prisma.partVote.create({ data: { requestedPartId: rp.id, userId, source } });
      }
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
      where: { userId, removedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        seenAt: true,
        requestedPart: {
          select: {
            name: true,
            status: true,
            id: true,
            updatedAt: true,
            /* ⚠️ القطعة الواحدة يطلبها عدّة أشخاص، والمحادثة مشتركة عليها.
               بلا هذا الشرط تظهر رسالة كل طالب لبقيّة الطالبين — وتُعرض
               لهم باسم "أنت" لأن الواجهة تميّز بـuserId === null فقط.
               نُبقي: رسائل الإدارة + رسائل هذا المستخدم وحده. */
            messages: {
              where: { OR: [{ userId: null }, { userId }] },
              orderBy: { createdAt: 'asc' },
              select: { body: true, userId: true, createdAt: true },
            },
            category: { select: { name: true } },
            component: {
              select: {
                id: true, name: true, brand: true, price: true,
                categoryId: true, imageUrl: true,
                category: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    const requests = votes.map((v) => ({
      name: v.requestedPart.name,
      status: v.requestedPart.status,
      createdAt: v.createdAt,
      requestId: v.requestedPart.id,
      categoryName: v.requestedPart.category?.name || null,
      // المحادثة: userId=null → من الإدارة، غيره → من صاحب الطلب
      messages: v.requestedPart.messages.map((m) => ({
        body: m.body,
        fromAdmin: m.userId === null,
        at: m.createdAt,
      })),
      /* جديد لم يره: لم يفتح القسم قط، أو تغيّر الطلب بعد آخر اطّلاع.
         نحسبها على الخادم كي لا يعيد العميل منطق المقارنة. */
      unseen: !v.seenAt || new Date(v.requestedPart.updatedAt) > new Date(v.seenAt),
      component: v.requestedPart.component
        ? {
            id: v.requestedPart.component.id,
            name: v.requestedPart.component.name,
            brand: v.requestedPart.component.brand,
            price: v.requestedPart.component.price,
            categoryId: v.requestedPart.component.categoryId,
            imageUrl: v.requestedPart.component.imageUrl,
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

/* ============ ردّ المستخدم على استيضاح الإدارة ============
   يُقبل فقط من صاحب الطلب (له صوت عليه) — لا يفتح باب رسائل للجميع. */
export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const userId = token?.id as string | undefined;
    if (!userId) return NextResponse.json({ message: 'سجّل دخولك للردّ.' }, { status: 401 });

    /* حدّ معدّل على الردود أيضاً — قاعدة "ردّ واحد لكل رسالة" تمنع تكرار
       الردّ على طلب واحد، لكن لا تمنع من طلب ١٠٠ قطعة ثم الردّ عليها كلها
       دفعةً. الحدّ يغلق هذا الباب. */
    if (ratelimit) {
      const { success } = await ratelimit.limit(`partreply_${userId}`);
      if (!success) {
        return NextResponse.json({ message: 'أرسلت ردوداً كثيرة. جرّب بعد قليل.' }, { status: 429 });
      }
    }

    const payload = await req.json();
    const requestId = typeof payload?.requestId === 'string' ? payload.requestId : '';
    const body = payload?.body;
    const text = typeof body === 'string' ? body.trim().slice(0, 400) : '';
    if (!requestId || text.length < 2) {
      return NextResponse.json({ message: 'اكتب ردّك أولاً.' }, { status: 400 });
    }

    // لا يردّ إلا من طلب هذه القطعة فعلاً
    const owns = await prisma.partVote.findUnique({
      where: { requestedPartId_userId: { requestedPartId: requestId, userId } },
      select: { id: true },
    });
    if (!owns) return NextResponse.json({ message: 'غير مصرح.' }, { status: 403 });

    /* ============ ردّ واحد لكل رسالة إدارة ============
       الدور يبدأ من الإدارة وينتهي بردّ واحد. بلا هذا يتحوّل المربّع إلى
       قناة رسائل مفتوحة تُغرق لوحة الطلبات. الفحص هنا لا في الواجهة فقط،
       لأن الواجهة تُتجاوز بطلب مباشر. */
    const lastTwo = await prisma.partRequestMessage.findMany({
      where: { requestedPartId: requestId },
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: { userId: true },
    });

    if (lastTwo.length === 0) {
      return NextResponse.json({ message: 'انتظر ردّ الإدارة على اقتراحك أولاً.' }, { status: 409 });
    }
    if (lastTwo[0].userId !== null) {
      return NextResponse.json(
        { message: 'أرسلت ردّك — انتظر ردّ الإدارة قبل إرسال رسالة أخرى.' },
        { status: 409 },
      );
    }

    await prisma.partRequestMessage.create({
      data: { requestedPartId: requestId, userId, body: text },
    });
    // ردّه مقروء عنده، وغير مقروء عند الإدارة (seenByAdmin افتراضياً false)
    await prisma.partVote.update({ where: { id: owns.id }, data: { seenAt: new Date() } });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'حدث خطأ.' }, { status: 500 });
  }
}

/* ============ إزالة الطلب من قائمة المستخدم ============
   نحذف **صوته** لا الطلب نفسه: قد يكون غيره طلب القطعة نفسها، وحذف الطلب
   يمحو تاريخهم ويُفسد العدّاد. ومسموح فقط بعد الإضافة (ADDED) — قبلها
   الحذف يُفقده متابعة طلب لم يُنجَز بعد. */
export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const userId = token?.id as string | undefined;
    if (!userId) return NextResponse.json({ message: 'سجّل دخولك.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('requestId') || '';
    if (!requestId) return NextResponse.json({ message: 'طلب غير محدّد.' }, { status: 400 });

    const vote = await prisma.partVote.findUnique({
      where: { requestedPartId_userId: { requestedPartId: requestId, userId } },
      select: { id: true, requestedPart: { select: { status: true } } },
    });
    if (!vote) return NextResponse.json({ message: 'غير مصرح.' }, { status: 403 });

    if (vote.requestedPart.status !== 'ADDED') {
      return NextResponse.json(
        { message: 'يمكن الحذف بعد إتمام الطلب فقط.' },
        { status: 409 },
      );
    }

    /* حذف ناعم: الصفّ يبقى بعلامة removedAt. الأدمن يحتاج أن يرى من أزال
       وماذا — والحذف الصلب يمحو الأثر ويجعل العدّاد يتقلّص بلا تفسير.
       ورسائله تبقى في المحادثة لأنها جزء من سياق القرار. */
    await prisma.partVote.update({ where: { id: vote.id }, data: { removedAt: new Date() } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: 'حدث خطأ.' }, { status: 500 });
  }
}

/* ============ تعليم طلبات المستخدم كمقروءة ============
   يُستدعى حين يفتح المستخدم قسم الطلبات — فتُطفأ النقطة عنده وحده. */
export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const userId = token?.id as string | undefined;
    if (!userId) return NextResponse.json({ ok: false }, { status: 200 });

    await prisma.partVote.updateMany({ where: { userId }, data: { seenAt: new Date() } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
