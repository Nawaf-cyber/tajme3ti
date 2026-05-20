import { NextRequest, NextResponse } from 'next/server';
// تأكد أن مسار الاستدعاء هذا صحيح ويطابق موقع مجلد lib عندك
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
    // هذا السطر بيكشف لنا المشكلة بالضبط في الـ Terminal
    console.error("🔴 خطأ في الـ API:", error);
    return NextResponse.json({ message: 'حدث خطأ في السيرفر' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const suggestions = await prisma.suggestion.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(suggestions, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'خطأ في جلب البيانات' }, { status: 500 });
  }
}
