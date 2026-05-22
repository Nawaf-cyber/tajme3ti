import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  try {
    // 1. التحقق من تسجيل الدخول وجلب بيانات المستخدم
    const token = await getToken({ req });

    if (!token || !token.id) {
      return NextResponse.json({ message: 'يجب تسجيل الدخول أولاً لإرسال اقتراح' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ message: 'العنوان والوصف مطلوبان' }, { status: 400 });
    }

    // 2. حفظ الاقتراح وربطه بمعرف المستخدم (userId)
    await prisma.suggestion.create({
      data: {
        title,
        content,
        userId: token.id as string,
      },
    });

    return NextResponse.json({ message: 'تم إرسال الاقتراح بنجاح' }, { status: 201 });
  } catch (error) {
    console.error("🔴 خطأ في الـ API أثناء إضافة اقتراح:", error);
    return NextResponse.json({ message: 'حدث خطأ في السيرفر' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // 3. جلب الاقتراحات متضمنة اسم وإيميل المستخدم الذي كتبها
    const suggestions = await prisma.suggestion.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(suggestions, { status: 200 });
  } catch (error) {
    console.error("🔴 خطأ في الـ API أثناء جلب الاقتراحات:", error);
    return NextResponse.json({ message: 'خطأ في جلب البيانات' }, { status: 500 });
  }
}