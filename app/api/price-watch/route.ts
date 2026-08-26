/* ============ متابعة سعر قطعة، وحفظ السعر الذي رآه ============
 *
 *   GET  ?id=…                        → هل يتابعها؟ وهل حفظ سعرها؟
 *   POST {componentId}                → يتابعها
 *   POST {componentId, pin:true}      → يحفظ سعرها الحالي (ويتابعها ضمناً)
 *   POST {componentId, pin:false}     → يرفع الحفظ ويبقي المتابعة
 *   DELETE {componentId}              → يتوقّف عن المتابعة (والحفظ معها)
 *
 * ⚠️ والحفظ **ليس مفهوماً ثالثاً**: عمودان على صفّ المتابعة لا جدولٌ جديد.
 * المستخدم يرى «متابعة» و«حفظ» شيئاً واحداً — قطعةٌ تهمّه — والفرق أنّ الحفظ
 * يخزّن السعر الذي رآه **هو**، وهو مرجعٌ أصدق من `previousPrice` عندنا: ذاك
 * آخر سعرٍ سجّلناه نحن، وقد لا يكون ما ظهر له على الشاشة.
 *
 * ⚠️ ولا يُسجَّل صفٌّ لقطعةٍ في تجميعةٍ له **للمتابعة**: هي متابَعةٌ تلقائياً،
 * وتسجيلُها يعني حالتين تتباعدان. أمّا **الحفظ** فيُسجَّل لها: حفظُ سعرٍ رآه
 * معلومةٌ لا تستنبطها التجميعة، فالصفّ هنا يحمل السعر لا المتابعة.
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
  if (!uid || !id) return NextResponse.json({ watching: false, viaBuild: false, pinned: false });

  try {
    const { fromBuild, pins } = await watchedComponentIds(prisma, uid);
    const pin = pins.get(id);
    const build = fromBuild.get(id);
    if (build) {
      return NextResponse.json({
        watching: true, viaBuild: true, buildName: build.name,
        pinned: !!pin, pinnedPrice: pin?.price ?? null,
      });
    }
    const row = await prisma.priceWatch.findUnique({
      where: { userId_componentId: { userId: uid, componentId: id } },
      select: { id: true },
    });
    return NextResponse.json({
      watching: !!row, viaBuild: false, pinned: !!pin, pinnedPrice: pin?.price ?? null,
    });
  } catch (error) {
    console.error('[GET /api/price-watch]', error);
    return NextResponse.json({ watching: false, viaBuild: false, pinned: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ error: 'سجّل دخولك لتتابع الأسعار.' }, { status: 401 });

  const { componentId, pin } = await req.json().catch(() => ({}) as any);
  if (!componentId) return NextResponse.json({ error: 'القطعة مطلوبة' }, { status: 400 });

  try {
    const comp = await prisma.component.findUnique({
      where: { id: componentId }, select: { id: true, price: true },
    });
    if (!comp) return NextResponse.json({ error: 'القطعة غير موجودة' }, { status: 404 });

    const { fromBuild } = await watchedComponentIds(prisma, uid);
    const viaBuild = fromBuild.has(componentId);

    /* ===== حفظ السعر / رفعه ===== */
    if (pin !== undefined) {
      if (pin) {
        /* ⚠️ السعر يُقرأ من قاعدة البيانات لا من جسم الطلب: لو أُرسل من
           المتصفّح لَحفظ من شاء ما شاء، فيُشطب لاحقاً مقابل رقمٍ مخترع. */
        await prisma.priceWatch.upsert({
          where: { userId_componentId: { userId: uid, componentId } },
          create: { userId: uid, componentId, pinnedPrice: comp.price, pinnedAt: new Date() },
          update: { pinnedPrice: comp.price, pinnedAt: new Date() },
        });
        return NextResponse.json({ watching: true, viaBuild, pinned: true, pinnedPrice: comp.price });
      }
      /* رفعُ الحفظ لا يُلغي المتابعة — إلا إن كانت المتابعة من الحفظ وحده
         (قطعةٌ في تجميعته: صفُّها وُجد ليحمل السعر، فلا معنى لبقائه فارغاً) */
      if (viaBuild) {
        await prisma.priceWatch.deleteMany({ where: { userId: uid, componentId } });
      } else {
        await prisma.priceWatch.updateMany({
          where: { userId: uid, componentId },
          data: { pinnedPrice: null, pinnedAt: null },
        });
      }
      return NextResponse.json({ watching: true, viaBuild, pinned: false });
    }

    /* ===== متابعة ===== */
    if (viaBuild) {
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
    const viaBuild = fromBuild.has(componentId);
    return NextResponse.json({ watching: viaBuild, viaBuild, pinned: false });
  } catch (error) {
    console.error('[DELETE /api/price-watch]', error);
    return NextResponse.json({ error: 'تعذّر الحذف' }, { status: 500 });
  }
}
