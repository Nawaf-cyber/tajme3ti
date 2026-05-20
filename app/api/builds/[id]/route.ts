import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '../../../../lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "fallback_secret_key_for_development" });

  if (!token || !token.id) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const build = await prisma.savedBuild.findUnique({ where: { id } });
    
    if (!build || build.userId !== token.id) {
      return NextResponse.json({ message: 'التجميعة غير موجودة أو غير مصرح لك بحذفها' }, { status: 403 });
    }

    await prisma.savedBuild.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'تم الحذف بنجاح' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'خطأ في السيرفر' }, { status: 500 });
  }
}