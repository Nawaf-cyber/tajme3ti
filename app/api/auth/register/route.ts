import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hash } from 'bcryptjs';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// حماية من السبام: 5 محاولات تسجيل في الساعة لكل IP
let ratelimit: Ratelimit | null = null;
try {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: true,
  });
} catch (error) {
  console.warn("Upstash غير مهيأ — تخطّي rate limit على التسجيل.");
}

export async function POST(request: NextRequest) {
  try {
    // تحديد المعدل حسب عنوان IP
    if (ratelimit) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const { success } = await ratelimit.limit(`register_${ip}`);
      if (!success) {
        return NextResponse.json(
          { message: 'محاولات كثيرة جداً. يرجى المحاولة بعد قليل.' },
          { status: 429 }
        );
      }
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, { status: 400 });
    }

    // التحقق من صيغة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email)) {
      return NextResponse.json({ message: 'صيغة البريد الإلكتروني غير صحيحة' }, { status: 400 });
    }

    // التحقق من قوة كلمة المرور (٨ أحرف على الأقل)
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ message: 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل' }, { status: 400 });
    }
    if (password.length > 100) {
      return NextResponse.json({ message: 'كلمة المرور طويلة جداً' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // التحقق مما إذا كان الإيميل مستخدماً مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'البريد الإلكتروني مسجل مسبقاً' }, { status: 409 });
    }

    // تشفير كلمة المرور
    const hashedPassword = await hash(password, 12);

    // إنشاء المستخدم بصلاحية USER افتراضياً (لا يمكن تمرير role من الخارج)
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: 'USER',
      }
    });

    return NextResponse.json({ message: 'تم إنشاء الحساب بنجاح', userId: user.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'حدث خطأ في السيرفر' }, { status: 500 });
  }
}
