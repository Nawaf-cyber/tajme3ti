export const dynamic = 'force-dynamic';

import { OFFER_INCLUDE } from '../../../lib/stores-server';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// إعداد نظام الحماية (10 طلبات في الدقيقة كحد أقصى)
let ratelimit: Ratelimit | null = null;
try {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
  });
} catch (error) {
  console.warn("لم يتم إعداد Upstash Redis بعد.");
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  try {
    const builds = await prisma.savedBuild.findMany({
      where: { userId: (session.user as any).id as string },
      orderBy: { createdAt: 'desc' }
    });

    /* ⚠️ ثلاث قوائم لنفس الأعمدة الثمانية: الجلب، والخريطة، ومجموع السعر.
       نسيان عمودٍ في إحداها يُنتج عطلاً مختلفاً في كلٍّ منها — غيابه عن
       الجلب يجعل القطعة null، وعن المجموع ينقص السعر بلا أثر. فأي عمودٍ
       يُضاف لاحقاً يجب أن يُضاف في الثلاث. */
    const PART_IDS = (b: typeof builds[number]) =>
      [b.cpuId, b.gpuId, b.ramId, b.motherboardId, b.caseId, b.psuId, b.storageId, b.coolerId];

    const componentIds = builds.flatMap(PART_IDS).filter(Boolean) as string[];
    
    const components = await prisma.component.findMany({
      where: { id: { in: componentIds } },
      select: {
        id: true,
        name: true,
        brand: true,
        price: true,
        imageUrl: true,
        ...OFFER_INCLUDE,
        performanceTier: true,
        // مطلوبة لمقارنة التجميعات: الاستهلاك الكلي وسعة المزوّد/الرام
        tdpWattage: true,
        specs: true,
        /* التجميعة المحفوظة تُفتح بعد أسابيع، فهي أحوج إلى عمر السعر من
           صفحة القطعة التي تُفتح بعد بحثٍ مباشر. */
        lastScrapedAt: true,
      }
    });

    const compMap = new Map(components.map(c => [c.id, c]));

    const buildsWithDetails = builds.map(b => ({
      ...b,
      parts: {
        CPU: b.cpuId ? compMap.get(b.cpuId) : null,
        GPU: b.gpuId ? compMap.get(b.gpuId) : null,
        RAM: b.ramId ? compMap.get(b.ramId) : null,
        Motherboard: b.motherboardId ? compMap.get(b.motherboardId) : null,
        Case: b.caseId ? compMap.get(b.caseId) : null,
        PSU: b.psuId ? compMap.get(b.psuId) : null,
        Storage: b.storageId ? compMap.get(b.storageId) : null,
        Cooler: b.coolerId ? compMap.get(b.coolerId) : null,
      },
      totalPrice: PART_IDS(b)
        .reduce((sum, id) => sum + (id ? (compMap.get(id)?.price || 0) : 0), 0)
    }));
    
    return NextResponse.json(buildsWithDetails, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'خطأ في السيرفر' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ message: 'يجب تسجيل الدخول لحفظ التجميعة' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  // تطبيق نظام الحماية بناءً على رقم حساب المستخدم
  if (ratelimit) {
    const { success } = await ratelimit.limit(`ratelimit_build_${userId}`);
    if (!success) {
      return NextResponse.json(
        { message: 'تجاوزت الحد المسموح به. يرجى الانتظار دقيقة والمحاولة مجدداً.' }, 
        { status: 429 }
      );
    }
  }

  try {
    const body = await req.json();
    const { id, name, cpuId, gpuId, ramId, motherboardId, caseId, psuId, storageId, coolerId } = body;

    if (id) {
      // 1. التحقق من ملكية التجميعة قبل التعديل
      const existingBuild = await prisma.savedBuild.findUnique({ where: { id } });
      if (!existingBuild || existingBuild.userId !== userId) {
        return NextResponse.json({ message: 'غير مصرح بتعديل هذه التجميعة' }, { status: 403 });
      }

      // 2. تحديث التجميعة الحالية
      await prisma.savedBuild.update({
        where: { id },
        /* ⚠️ `coolerId` هنا آمنٌ مع العملاء القدامى: صفحةٌ محفوظةٌ في ذاكرة
           المتصفّح ترسل الحمولة بلا هذا الحقل، فتصل `undefined` — و Prisma
           تتجاهل غير المعرّف ولا تكتب null. فالمبرّد المحفوظ لا يُمحى بحفظٍ
           من علامة تبويبٍ قديمة. */
        data: { name: name || existingBuild.name, cpuId, gpuId, ramId, motherboardId, caseId, psuId, storageId, coolerId }
      });
      return NextResponse.json({ message: 'تم تعديل التجميعة بنجاح' }, { status: 200 });
      
    } else {
      // 3. إنشاء تجميعة جديدة
      const newBuild = await prisma.savedBuild.create({
        data: {
          userId, name: name || "تجميعة مخصصة", cpuId, gpuId, ramId, motherboardId, caseId, psuId, storageId, coolerId
        }
      });
      return NextResponse.json({ message: 'تم الحفظ بنجاح', buildId: newBuild.id }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'خطأ في السيرفر' }, { status: 500 });
  }
}