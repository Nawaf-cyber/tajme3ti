import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'; // تأكد من مسار الاستدعاء الصحيح

export async function GET() {
  try {
    // ملاحظة: استبدل كلمة component باسم الجدول الخاص بالقطع في ملف schema عندك 
    // (مثلاً إذا كان اسم الجدول Part اكتب prisma.part بدلاً من prisma.component)
    const allItems = await prisma.component.findMany();

    const seenNames = new Set();
    const duplicateIds: string[] = [];

    for (const item of allItems) {
      // يفحص التكرار بناءً على اسم القطعة
      if (seenNames.has(item.name)) {
        duplicateIds.push(item.id);
      } else {
        seenNames.add(item.name);
      }
    }

    if (duplicateIds.length > 0) {
      await prisma.component.deleteMany({
        where: {
          id: { in: duplicateIds }
        }
      });
    }

    return NextResponse.json({ 
      message: `تم التنظيف بنجاح. تم حذف ${duplicateIds.length} قطعة مكررة.` 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'حدث خطأ أثناء التنظيف' }, { status: 500 });
  }
}