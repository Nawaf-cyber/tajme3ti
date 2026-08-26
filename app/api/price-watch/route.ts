/* ============ متابعة سعر قطعة صراحةً ============
 *
 *   GET  ?id=…   → هل يتابعها؟
 *   POST {componentId}   → يتابعها
 *   DELETE {componentId} → يتوقّف
 *
 * ⚠️ ولا يُسجَّل صفٌّ لقطعةٍ في تجميعةٍ له: هي متابَعةٌ تلقائياً، وتسجيلُها
 * هنا يعني حالتين تتباعدان — يحذف التجميعة فيبقى الصفّ يتيماً. فيُقال له
 * إنها متابَعةٌ أصلاً بدل أن يُكتب صفٌّ لا معنى له.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { watchedComponentIds } from '../../../lib/price-drops';

export const dynamic = 'force-dynamic';

async function userId() {
  const session = await getServerSession(authOptions);
  return ((session?.user as any)?.id as string | undefined) ?? null;
}

export async function GET(req: Request) {
  const uid = await userId();
  const id = new URL(req.url).searchParams.get('id');
  if (!uid || !id) return NextResponse.json({ watching: false, viaBuild: false });

  try {
    const { fromBuild } = await watchedComponentIds(prisma, uid);
    if (fromBuild.has(id)) {
      return NextResponse.json({ watching: true, viaBuild: true, buildName: fromBuild.get(id)?.name });
    }
    const row = await prisma.priceWatch.findUnique({
      where: { userId_componentId: { userId: uid, componentId: id } },
      select: { id: true },
    });
    return NextResponse.json({ watching: !!row, viaBuild: false });
  } catch (error) {
    console.error('[GET /api/price-watch]', error);
    return NextResponse.json({ watching: false, viaBuild: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ error: 'سجّل دخولك لتتابع الأسعار.' }, { status: 401 });

  const { componentId } = await req.json().catch(() => ({}));
  if (!componentId) return NextResponse.json({ error: 'القطعة مطلوبة' }, { status: 400 });

  try {
    const exists = await prisma.component.findUnique({ where: { id: componentId }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: 'القطعة غير موجودة' }, { status: 404 });

    const { fromBuild } = await watchedComponentIds(prisma, uid);
    if (fromBuild.has(componentId)) {
      return NextResponse.json({
        watching: true, viaBuild: true, buildName: fromBuild.get(componentId)?.name,
        message: 'متابَعةٌ أصلاً لأنها في تجميعتك.',
      });
    }

    await prisma.priceWatch.upsert({
      where: { userId_componentId: { userId: uid, componentId } },
      create: { userId: uid, componentId },
      update: {},
    });
    return NextResponse.json({ watching: true, viaBuild: false });
  } catch (error) {
    console.error('[POST /api/price-watch]', error);
    return NextResponse.json({ error: 'تعذّر الحفظ' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { componentId } = await req.json().catch(() => ({}));
  if (!componentId) return NextResponse.json({ error: 'القطعة مطلوبة' }, { status: 400 });

  try {
    await prisma.priceWatch.deleteMany({ where: { userId: uid, componentId } });
    /* ⚠️ ويبقى ما جاء من تجميعة: حذفُ المتابعة الصريحة لا يُلغي كونها في
       تجميعته. فيُعاد الوضع الحقيقيّ لا `false` دائماً. */
    const { fromBuild } = await watchedComponentIds(prisma, uid);
    return NextResponse.json({ watching: fromBuild.has(componentId), viaBuild: fromBuild.has(componentId) });
  } catch (error) {
    console.error('[DELETE /api/price-watch]', error);
    return NextResponse.json({ error: 'تعذّر الحذف' }, { status: 500 });
  }
}
