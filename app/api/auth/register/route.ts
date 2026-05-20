import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, { status: 400 });
    }

    // التحقق مما إذا كان الإيميل مستخدماً مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'البريد الإلكتروني مسجل مسبقاً' }, { status: 409 });
    }

    // تشفير كلمة المرور
    const hashedPassword = await hash(password, 10);

    // إنشاء المستخدم بصلاحية USER افتراضياً
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER',
      }
    });

    return NextResponse.json({ message: 'تم إنشاء الحساب بنجاح', userId: user.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'حدث خطأ في السيرفر' }, { status: 500 });
  }
}