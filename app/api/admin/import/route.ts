import { NextResponse } from 'next/server';
import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    let updatedCount = 0;
    let addedCount = 0;
    let failedCount = 0;
    let errors = [];

    // التأكد من أن البيانات مصفوفة
    const items = Array.isArray(data) ? data : [data];

    for (const item of items) {
      try {
        // معالجة المواصفات لتفادي أخطاء JSON
        let parsedSpecs = item.specs;
        if (typeof item.specs === 'string') {
          try { parsedSpecs = JSON.parse(item.specs); } catch (e) { parsedSpecs = {}; }
        }

        // البحث عن القطعة
        let existingComponent = null;
        if (item.id) {
          existingComponent = await prisma.component.findUnique({ where: { id: item.id } });
        }
        if (!existingComponent && item.name) {
          existingComponent = await prisma.component.findFirst({ where: { name: item.name } });
        }

        if (existingComponent) {
          // تحديث القطعة الموجودة فقط بالحقول المُرسلة
          await prisma.component.update({
            where: { id: existingComponent.id },
            data: {
              categoryId: item.categoryId !== undefined ? item.categoryId : existingComponent.categoryId,
              brand: item.brand !== undefined ? item.brand : existingComponent.brand,
              name: item.name !== undefined ? item.name : existingComponent.name,
              price: item.price !== undefined ? item.price : existingComponent.price,
              amazonPrice: item.amazonPrice !== undefined ? item.amazonPrice : existingComponent.amazonPrice,
              amazonInStock: item.amazonInStock !== undefined ? item.amazonInStock : existingComponent.amazonInStock,
              cazasouqPrice: item.cazasouqPrice !== undefined ? item.cazasouqPrice : existingComponent.cazasouqPrice,
              cazasouqInStock: item.cazasouqInStock !== undefined ? item.cazasouqInStock : existingComponent.cazasouqInStock,
              microlessUrl: item.microlessUrl !== undefined ? item.microlessUrl : existingComponent.microlessUrl,
              microlessPrice: item.microlessPrice !== undefined ? item.microlessPrice : existingComponent.microlessPrice,
              microlessInStock: item.microlessInStock !== undefined ? item.microlessInStock : existingComponent.microlessInStock,
              tdpWattage: item.tdpWattage !== undefined ? item.tdpWattage : existingComponent.tdpWattage,
              specs: item.specs !== undefined ? parsedSpecs : existingComponent.specs,
              imageUrl: item.imageUrl !== undefined ? item.imageUrl : existingComponent.imageUrl,
              amazonUrl: item.amazonUrl !== undefined ? item.amazonUrl : existingComponent.amazonUrl,
              cazasouqUrl: item.cazasouqUrl !== undefined ? item.cazasouqUrl : existingComponent.cazasouqUrl,
              description: item.description !== undefined ? item.description : existingComponent.description,
              performanceTier: item.performanceTier !== undefined ? item.performanceTier : existingComponent.performanceTier,
            }
          });
          updatedCount++;
        } else {
          // إنشاء قطعة جديدة (التحقق من البيانات الإجبارية لتفادي خطأ 500)
          if (!item.categoryId || !item.brand || !item.name) {
            failedCount++;
            errors.push(`تم التخطي: "${item.name || item.id}" غير موجودة بالقاعدة وينقصها بيانات أساسية لإنشائها.`);
            continue; // تجاوز القطعة الفاسدة وإكمال الحلقة
          }

          await prisma.component.create({
            data: {
              id: item.id || undefined, // الحفاظ على الـ ID القديم إن وُجد
              categoryId: item.categoryId,
              brand: item.brand,
              name: item.name,
              price: item.price || 0,
              amazonPrice: item.amazonPrice || null,
              amazonInStock: item.amazonInStock ?? true,
              cazasouqPrice: item.cazasouqPrice || null,
              cazasouqInStock: item.cazasouqInStock ?? true,
              microlessUrl: item.microlessUrl || null,
              microlessPrice: item.microlessPrice || null,
              microlessInStock: item.microlessInStock ?? true,
              tdpWattage: item.tdpWattage || 0,
              specs: parsedSpecs || {},
              imageUrl: item.imageUrl || null,
              amazonUrl: item.amazonUrl || null,
              cazasouqUrl: item.cazasouqUrl || null,
              description: item.description || null,
              performanceTier: item.performanceTier || null,
            }
          });
          addedCount++;
        }
      } catch (itemError: any) {
        // حصر أي خطأ في القطعة الحالية فقط لضمان عدم انهيار النظام
        failedCount++;
        errors.push(`خطأ في "${item.name}": ${itemError.message}`);
      }
    }

    revalidatePath('/admin');
    revalidatePath('/admin/components');

    return NextResponse.json({ 
      success: true,
      message: `مكتمل. تحديث: ${updatedCount} | إضافة: ${addedCount} | فشل التخطي: ${failedCount}`,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error("Global Import Error:", error);
    return NextResponse.json({ error: 'خطأ رئيسي في السيرفر أو صيغة الملف غير صحيحة.' }, { status: 500 });
  }
}