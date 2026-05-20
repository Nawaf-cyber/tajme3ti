import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ message: 'العنوان والوصف مطلوبان' }, { status: 400 });
    }

    await prisma.suggestion.create({
      data: {
        title,
        content,
      },
    });

    return NextResponse.json({ message: 'تم إرسال الاقتراح بنجاح' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'حدث خطأ في السيرفر' }, { status: 500 });
  }
}