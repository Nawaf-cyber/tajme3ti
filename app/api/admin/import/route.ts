import { NextResponse } from 'next/server';
import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    let updatedCount = 0;
    let notFoundCount = 0;

    for (const item of data) {
      if (item.id) {
        const exists = await prisma.component.findUnique({
          where: { id: item.id }
        });

        if (exists) {
          await prisma.component.update({
            where: { id: item.id },
            data: {
              // تم إزالة categoryId لتجنب تعارض المفاتيح الأجنبية (Foreign Key)
              brand: item.brand || exists.brand,
              tdpWattage: item.tdpWattage !== undefined ? item.tdpWattage : exists.tdpWattage,
              performanceTier: item.performanceTier || exists.performanceTier,
              description: item.description || exists.description,
              specs: item.specs ? item.specs : exists.specs 
            }
          });
          updatedCount++;
        } else {
          notFoundCount++;
        }
      }
    }

    revalidatePath('/admin');
    revalidatePath('/admin/components');

    return NextResponse.json({ 
      success: true, 
      message: `تم تحديث ${updatedCount} قطعة بنجاح! (لم يتم العثور على ${notFoundCount})` 
    });

  } catch (error: any) {
    console.error("Import Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}