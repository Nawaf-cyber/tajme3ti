import { prisma } from "../../../lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hashedPassword = await hash("123456", 10);

    // إنشاء حساب مستخدم عادي للتجارب
    await prisma.user.upsert({
      where: { email: "user@test.com" },
      update: {},
      create: {
        name: "Nawaf Test",
        email: "user@test.com",
        password: hashedPassword,
        role: "USER" // مستخدم بصلاحيات عادية
      }
    });

    return NextResponse.json({ 
      message: "تم إنشاء الحساب بنجاح.",
      email: "user@test.com",
      password: "123456"
    });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ أثناء الإنشاء." }, { status: 500 });
  }
}