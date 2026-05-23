import { prisma } from "../../../lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hashedPassword = await hash("123456", 10);

    // إنشاء حساب مستخدم عادي للتجارب
    await prisma.user.upsert({
      where: { email: "nawaf1290m@gmail.com" },
      update: {},
      create: {
        name: "Nawaf Admin",
        email: "nawaf1290m@gmail.com",
        password: hashedPassword,
        role: "ADMIN" // مستخدم بصلاحيات إدارية
      }
    });

    return NextResponse.json({ 
      message: "تم إنشاء الحساب بنجاح.",
      email: "nawaf1290m@gmail.com",
      password: "hashedPassword"
    });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ أثناء الإنشاء." }, { status: 500 });
  }
}