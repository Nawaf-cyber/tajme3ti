export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '../../../../lib/prisma';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * خريطة معرّف الفئة → اسم العمود في SavedBuild.
 * تُستنتج على الخادم فقط. العميل لا يرسل اسم الحقل إطلاقاً،
 * وإلّا أمكن دسّ كرت شاشة في حقل المعالج.
 */
const CATEGORY_TO_FIELD: Record<string, string> = {
  cmpfziqb20000x4ymfmkovawm: 'cpuId',
  cmpfziqe70001x4ym928tt3o2: 'motherboardId',
  cmpfziqh70002x4ym6ln587z2: 'psuId',
  cmpfziqks0003x4yma730h1be: 'ramId',
  cmpfziqnv0004x4ymffnp204c: 'gpuId',
  cmpfziqr70005x4ym3k7uh079: 'storageId',
  cmpfziquj0006x4ym53f0ehcw: 'caseId',
};

// ترتيب عرض الخانات في بطاقة التجميعة (منطقي، لا أبجدي)
const SLOTS = [
  { field: 'cpuId', label: 'المعالج', short: 'CPU' },
  { field: 'motherboardId', label: 'اللوحة الأم', short: 'MB' },
  { field: 'gpuId', label: 'كرت الشاشة', short: 'GPU' },
  { field: 'ramId', label: 'الذاكرة', short: 'RAM' },
  { field: 'storageId', label: 'التخزين', short: 'SSD' },
  { field: 'psuId', label: 'مزوّد الطاقة', short: 'PSU' },
  { field: 'caseId', label: 'الكيس', short: 'CASE' },
] as const;

let ratelimit: Ratelimit | null = null;
try {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
  });
} catch {
  console.warn('لم يتم إعداد Upstash Redis بعد.');
}

/**
 * GET — يعيد تجميعات المستخدم مع ملخّص كامل لكل خانة.
 * الاستعلام: ?categoryId=...
 * targetField يحدّد الخانة التي ستُملأ/تُستبدل.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const categoryId = req.nextUrl.searchParams.get('categoryId') || '';
  const targetField = CATEGORY_TO_FIELD[categoryId];

  if (!targetField) {
    return NextResponse.json({ message: 'فئة غير مدعومة' }, { status: 400 });
  }

  try {
    const builds = await prisma.savedBuild.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (builds.length === 0) {
      return NextResponse.json({ targetField, slots: SLOTS, builds: [] }, { status: 200 });
    }

    // كل معرّفات القطع عبر كل التجميعات، دفعة واحدة
    const allIds = builds
      .flatMap((b) => SLOTS.map((s) => (b as any)[s.field] as string | null))
      .filter(Boolean) as string[];

    const parts = allIds.length
      ? await prisma.component.findMany({
          where: { id: { in: [...new Set(allIds)] } },
          select: { id: true, name: true, brand: true, price: true, imageUrl: true },
        })
      : [];

    const partMap = new Map(parts.map((c) => [c.id, c]));

    const result = builds.map((b) => {
      const slotData = SLOTS.map((s) => {
        const pid = (b as any)[s.field] as string | null;
        return {
          field: s.field,
          label: s.label,
          short: s.short,
          part: pid ? partMap.get(pid) ?? null : null,
        };
      });

      const filled = slotData.filter((s) => s.part).length;
      const totalPrice = slotData.reduce((sum, s) => sum + (s.part?.price || 0), 0);
      const target = slotData.find((s) => s.field === targetField)!;

      return {
        id: b.id,
        name: b.name,
        createdAt: b.createdAt,
        slots: slotData,
        filled,
        totalSlots: SLOTS.length,
        totalPrice,
        currentPart: target.part, // القطعة التي ستُستبدل (أو null)
      };
    });

    return NextResponse.json({ targetField, builds: result }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'خطأ في السيرفر' }, { status: 500 });
  }
}

/**
 * POST — يُدرج قطعة في تجميعة محفوظة.
 * الجسم: { buildId, componentId }
 * الحقل يُستنتج من categoryId للقطعة على الخادم.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ message: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  if (ratelimit) {
    const { success } = await ratelimit.limit(`ratelimit_updatepart_${userId}`);
    if (!success) {
      return NextResponse.json(
        { message: 'تجاوزت الحد المسموح به. يرجى الانتظار دقيقة والمحاولة مجدداً.' },
        { status: 429 }
      );
    }
  }

  try {
    const body = await req.json();
    const buildId = typeof body?.buildId === 'string' ? body.buildId : '';
    const componentId = typeof body?.componentId === 'string' ? body.componentId : '';

    if (!buildId || !componentId) {
      return NextResponse.json({ message: 'بيانات ناقصة' }, { status: 400 });
    }

    // 1) فحص الملكية
    const build = await prisma.savedBuild.findUnique({ where: { id: buildId } });
    if (!build || build.userId !== userId) {
      return NextResponse.json({ message: 'غير مصرح بتعديل هذه التجميعة' }, { status: 403 });
    }

    // 2) جلب القطعة واستنتاج الحقل من فئتها
    const component = await prisma.component.findUnique({
      where: { id: componentId },
      select: { id: true, name: true, categoryId: true },
    });

    if (!component) {
      return NextResponse.json({ message: 'القطعة غير موجودة' }, { status: 404 });
    }

    const field = CATEGORY_TO_FIELD[component.categoryId];
    if (!field) {
      return NextResponse.json(
        { message: 'هذه الفئة لا يمكن إضافتها للتجميعة' },
        { status: 400 }
      );
    }

    const previousId = (build as any)[field] as string | null;

    // 3) لا شيء يتغيّر
    if (previousId === componentId) {
      return NextResponse.json(
        { message: 'هذه القطعة موجودة في التجميعة أصلاً', changed: false },
        { status: 200 }
      );
    }

    // 4) التحديث
    await prisma.savedBuild.update({
      where: { id: buildId },
      data: { [field]: componentId } as any,
    });

    return NextResponse.json(
      {
        message: previousId ? 'تم استبدال القطعة بنجاح' : 'تمت إضافة القطعة بنجاح',
        changed: true,
        replaced: Boolean(previousId),
        buildId,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ message: 'خطأ في السيرفر' }, { status: 500 });
  }
}