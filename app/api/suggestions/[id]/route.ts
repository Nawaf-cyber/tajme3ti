import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.suggestion.delete({ where: { id } });
    return NextResponse.json({ message: 'تم الحذف' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'خطأ في الحذف' }, { status: 500 });
  }
}