export const dynamic = 'force-dynamic'; // هذا السطر هو الذي سيحل المشكلة ويدمر الكاش

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '../../../lib/prisma';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "fallback_secret_key_for_development" });

  if (!token || !token.id) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  try {
    const builds = await prisma.savedBuild.findMany({
      where: { userId: token.id as string },
      orderBy: { createdAt: 'desc' }
    });

    const componentIds = builds.flatMap(b => [b.cpuId, b.gpuId, b.ramId, b.motherboardId, b.caseId, b.psuId, b.storageId]).filter(Boolean) as string[];
    
    const components = await prisma.component.findMany({
      where: { id: { in: componentIds } },
      select: { 
        id: true, 
        name: true, 
        brand: true, 
        price: true, 
        imageUrl: true,
        amazonUrl: true,
        cazasouqUrl: true,
        performanceTier: true // تأكدنا من وجودها هنا
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
      },
      totalPrice: [b.cpuId, b.gpuId, b.ramId, b.motherboardId, b.caseId, b.psuId, b.storageId]
        .reduce((sum, id) => sum + (id ? (compMap.get(id)?.price || 0) : 0), 0)
    }));
    
    return NextResponse.json(buildsWithDetails, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'خطأ في السيرفر' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "fallback_secret_key_for_development" });

  if (!token || !token.id) {
    return NextResponse.json({ message: 'يجب تسجيل الدخول لحفظ التجميعة' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, cpuId, gpuId, ramId, motherboardId, caseId, psuId, storageId } = body;

    const newBuild = await prisma.savedBuild.create({
      data: {
        userId: token.id as string,
        name: name || "تجميعة مخصصة",
        cpuId, gpuId, ramId, motherboardId, caseId, psuId, storageId
      }
    });

    return NextResponse.json({ message: 'تم الحفظ بنجاح', buildId: newBuild.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'خطأ في السيرفر' }, { status: 500 });
  }
}