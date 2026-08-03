import { NextResponse } from 'next/server';
import { prisma } from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { isCazasouqTrackingUrl } from '../../../../lib/affiliate';

/* رابط تتبّع كازاسوق من ملف الاستيراد: نقبله فقط إن كان idevaffiliate صالحاً،
   وإلا null — كي لا يوجّه رابطٌ خاطئ في الملف المشتري لوجهة غلط. */
const cleanCazaAff = (v: any): string | null => {
  const s = (typeof v === 'string' ? v : '').trim();
  return isCazasouqTrackingUrl(s) ? s : null;
};

export async function POST(req: NextRequest) {
  // حماية: أدمن فقط
  const token = await getToken({ req });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }
  try {
    const data = await req.json();

    /* ============ الحارس: يمنع القطع الناقصة قبل دخول القاعدة ============
       الدرس المكلّف: قطعة واحدة بمستوى null (Core Ultra 9) أو سعة خاطئة
       (T-Create) كسرت منطق التوصية مراراً. الـ import هو البوابة الوحيدة
       للبيانات — فنفحص هنا، مرّة، بدل مطاردة الأعطال لاحقاً. */

    // الفئات التي يعتمد عليها منطق التوصية وتحتاج performanceTier إلزامياً
    const TIER_REQUIRED = new Set(['CPU', 'GPU', 'Motherboard', 'PSU', 'Storage']);

    // نجلب أسماء الفئات لربط categoryId باسمها
    const cats = await prisma.category.findMany({ select: { id: true, name: true } });
    const catName = (id: string) => cats.find(c => c.id === id)?.name || '';

    const validateItem = (item: any): string | null => {
      // نتحقق فقط عند الإنشاء أو حين يُرسَل الحقل صراحةً
      const cat = catName(item.categoryId);

      // performanceTier: إلزامي 1..5 للفئات الحسّاسة (إن كانت قطعة جديدة)
      if (TIER_REQUIRED.has(cat)) {
        const t = item.performanceTier;
        if (t !== undefined) {
          const n = Number(t);
          if (!Number.isInteger(n) || n < 1 || n > 5) {
            return `مستوى الأداء (performanceTier) لازم يكون رقماً من 1 إلى 5 — القيمة الحالية: ${t}`;
          }
        }
      }

      // الرام: نفحص السعة والنوع (يمنع تكرار T-Create بسعة خاطئة)
      if (cat === 'RAM') {
        let sp = item.specs;
        if (typeof sp === 'string') { try { sp = JSON.parse(sp); } catch { sp = {}; } }
        const capRaw = sp?.capacity ?? sp?.Capacity;
        if (capRaw != null) {
          const gb = parseFloat(String(capRaw).replace(/[^\d.]/g, ''));
          // نتحقق أن السعة تطابق الاسم تقريباً (T-Create: اسمه 64 وسعته 16)
          const nameMatch = String(item.name || '').match(/(\d+)\s*GB/i);
          if (nameMatch) {
            const nameGb = parseFloat(nameMatch[1]);
            if (gb > 0 && nameGb > 0 && Math.abs(gb - nameGb) > 0.5) {
              return `تعارض السعة: الاسم يقول ${nameGb}GB لكن specs.capacity = ${capRaw}`;
            }
          }
        }
      }

      // السعر: نحذّر من صفر أو سالب (يكسر خوارزمية القيمة)
      if (item.price !== undefined && Number(item.price) <= 0) {
        return `السعر لازم يكون أكبر من صفر — القيمة: ${item.price}`;
      }

      return null;
    };

    let updatedCount = 0;
    let addedCount = 0;
    let failedCount = 0;
    let errors = [];
    // تفاصيل للمعاينة: كل قطعة أُضيفت/حُدّثت مع الفروق
    const added: any[] = [];
    const updated: any[] = [];

    // التأكد من أن البيانات مصفوفة
    const items = Array.isArray(data) ? data : [data];

    for (const item of items) {
      try {
        // الحارس أولاً — نرفض القطعة الناقصة بلا لمس القاعدة
        const invalid = validateItem(item);
        if (invalid) {
          failedCount++;
          errors.push(`رُفضت "${item.name || item.id}": ${invalid}`);
          continue;
        }

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
          // نلتقط ما سيتغيّر فعلاً: الحقل الذي أُرسل ويختلف عن الحالي
          const TRACK = ['brand','name','price','amazonPrice','cazasouqPrice','microlessPrice','tdpWattage','performanceTier','amazonInStock','cazasouqInStock','microlessInStock','imageUrl','description'];
          const changes: { field: string; from: any; to: any }[] = [];
          for (const f of TRACK) {
            if (item[f] !== undefined && item[f] !== (existingComponent as any)[f]) {
              changes.push({ field: f, from: (existingComponent as any)[f], to: item[f] });
            }
          }

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
              cazasouqAffiliateUrl: item.cazasouqAffiliateUrl !== undefined ? cleanCazaAff(item.cazasouqAffiliateUrl) : existingComponent.cazasouqAffiliateUrl,
              description: item.description !== undefined ? item.description : existingComponent.description,
              performanceTier: item.performanceTier !== undefined ? item.performanceTier : existingComponent.performanceTier,
            }
          });
          updatedCount++;
          updated.push({
            id: existingComponent.id,
            name: item.name ?? existingComponent.name,
            category: catName(item.categoryId ?? existingComponent.categoryId),
            price: item.price ?? existingComponent.price,
            performanceTier: item.performanceTier ?? existingComponent.performanceTier,
            changes,  // ← وش تغيّر بالضبط
          });
        } else {
          // إنشاء قطعة جديدة (التحقق من البيانات الإجبارية لتفادي خطأ 500)
          if (!item.categoryId || !item.brand || !item.name) {
            failedCount++;
            errors.push(`تم التخطي: "${item.name || item.id}" غير موجودة بالقاعدة وينقصها بيانات أساسية لإنشائها.`);
            continue; // تجاوز القطعة الفاسدة وإكمال الحلقة
          }

          // منع القطعة الجديدة الحسّاسة بلا مستوى — لا null صامت يخترق السقوف لاحقاً
          if (TIER_REQUIRED.has(catName(item.categoryId)) &&
              (item.performanceTier === undefined || item.performanceTier === null)) {
            failedCount++;
            errors.push(`رُفضت "${item.name}": قطعة جديدة في فئة ${catName(item.categoryId)} بلا performanceTier (لازم 1-5).`);
            continue;
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
              cazasouqAffiliateUrl: cleanCazaAff(item.cazasouqAffiliateUrl),
              description: item.description || null,
              performanceTier: item.performanceTier || null,
            }
          });
          addedCount++;
          added.push({
            name: item.name,
            category: catName(item.categoryId),
            brand: item.brand,
            price: item.price || 0,
            performanceTier: item.performanceTier ?? null,
            tdpWattage: item.tdpWattage || 0,
            inStock: {
              amazon: item.amazonInStock ?? true,
              cazasouq: item.cazasouqInStock ?? true,
            },
          });
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
      errors: errors.length > 0 ? errors : undefined,
      // تفاصيل المعاينة
      added,
      updated,
    });

  } catch (error: any) {
    console.error("Global Import Error:", error);
    return NextResponse.json({ error: 'خطأ رئيسي في السيرفر أو صيغة الملف غير صحيحة.' }, { status: 500 });
  }
}