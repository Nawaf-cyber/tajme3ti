import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // حماية: أدمن فقط — لمنع حذف اقتراحات المستخدمين من قِبل أي شخص
  const token = await getToken({ req });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.suggestion.delete({ where: { id } });
    return NextResponse.json({ message: 'تم الحذف' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'خطأ في الحذف' }, { status: 500 });
  }
}
