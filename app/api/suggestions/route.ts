import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// حماية من السبام: 5 اقتراحات في الساعة لكل مستخدم
let ratelimit: Ratelimit | null = null;
try {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: true,
  });
} catch (error) {
  console.warn("Upstash غير مهيأ — تخطّي rate limit على الاقتراحات.");
}

export async function POST(req: NextRequest) {
  try {
    // 1. التحقق من تسجيل الدخول
    const token = await getToken({ req });
    if (!token || !token.id) {
      return NextResponse.json({ message: 'يجب تسجيل الدخول أولاً لإرسال اقتراح' }, { status: 401 });
    }

    // 2. تحديد المعدل لمنع السبام
    if (ratelimit) {
      const { success } = await ratelimit.limit(`suggestion_${token.id}`);
      if (!success) {
        return NextResponse.json({ message: 'لقد أرسلت عدداً كبيراً من الاقتراحات. يرجى المحاولة لاحقاً.' }, { status: 429 });
      }
    }

    const body = await req.json();
    let { title, content } = body;

    // 3. التحقق من صحة المدخلات
    if (!title || !content || typeof title !== 'string' || typeof content !== 'string') {
      return NextResponse.json({ message: 'العنوان والوصف مطلوبان' }, { status: 400 });
    }

    title = title.trim();
    content = content.trim();

    if (title.length === 0 || content.length === 0) {
      return NextResponse.json({ message: 'العنوان والوصف لا يمكن أن يكونا فارغين' }, { status: 400 });
    }

    // 4. فرض حدود للطول لمنع إغراق قاعدة البيانات
    if (title.length > 150) {
      return NextResponse.json({ message: 'العنوان طويل جداً (الحد 150 حرفاً)' }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ message: 'الوصف طويل جداً (الحد 2000 حرف)' }, { status: 400 });
    }

    // 5. حفظ الاقتراح وربطه بمعرف المستخدم
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

export async function GET(req: NextRequest) {
  try {
    // حماية: أدمن فقط — لأن الرد يتضمن أسماء وإيميلات المستخدمين (بيانات شخصية)
    const token = await getToken({ req });
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
    }

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
