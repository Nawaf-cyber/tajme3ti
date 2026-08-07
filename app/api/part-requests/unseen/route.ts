import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

/**
 * عدد التحديثات التي لم يرها المستخدم على طلباته.
 *
 * مسار مستقلّ وخفيف عن `/api/part-requests` عمداً: الشريط العلوي يُرسم في
 * كل صفحة، فلا يجوز أن يجرّ معه المحادثات كاملة لمجرّد رسم نقطة.
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const userId = token?.id as string | undefined;
    if (!userId) return NextResponse.json({ unseen: 0 });

    const votes = await prisma.partVote.findMany({
      where: { userId, removedAt: null },
      select: { seenAt: true, requestedPart: { select: { updatedAt: true } } },
    });

    // جديد = لم يفتح القسم قط، أو تغيّر الطلب بعد آخر اطّلاع
    const unseen = votes.filter(
      (v) => !v.seenAt || v.requestedPart.updatedAt > v.seenAt,
    ).length;

    return NextResponse.json({ unseen });
  } catch {
    return NextResponse.json({ unseen: 0 });
  }
}
