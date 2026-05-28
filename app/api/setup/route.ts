import { prisma } from "../../../lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hashedPassword = await hash("123456", 10);

    // إنشاء حساب مستخدم عادي للتجارب
    await prisma.user.upsert({
      where: { email: "admin2@pcbuilder.com" },
      update: {},
      create: {
        name: "Nawaf Admin",
        email: "admin2@pcbuilder.com",
        password: hashedPassword,
        role: "ADMIN" // مستخدم بصلاحيات إدارية
      }
    });

    return NextResponse.json({ 
      message: "تم إنشاء الحساب بنجاح.",
      email: "admin2@pcbuilder.com",
      password: "hashedPassword"
    });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ أثناء الإنشاء." }, { status: 500 });
  }
}