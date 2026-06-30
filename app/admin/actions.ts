'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';

// حارس صلاحية: يرفع استثناءً إن لم يكن المستخدم أدمن
async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
    throw new Error('غير مصرح: هذه العملية تتطلب صلاحية أدمن.');
  }
}

export async function getCronStatus() {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { id: "default" } });
    return setting ? setting.cronEnabled : false;
  } catch (error) {
    console.error("Failed to fetch cron status:", error);
    return false;
  }
}

export async function toggleCronStatus(enabled: boolean) {
  await assertAdmin();
  try {
    await prisma.systemSetting.upsert({
      where: { id: "default" },
      update: { cronEnabled: enabled },
      create: { id: "default", cronEnabled: enabled },
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// دالة مساعدة لتحويل السعر بأمان وتجنب خطأ NaN
const parsePriceSafely = (val: FormDataEntryValue | null) => {
  if (!val) return null;
  const parsed = parseFloat(val.toString());
  return isNaN(parsed) ? null : parsed;
};

export async function addComponent(formData: FormData) {
  await assertAdmin();
  const categoryId = formData.get('categoryId') as string;
  const brand = formData.get('brand') as string;
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string);
  const tdpWattage = parseInt(formData.get('tdpWattage') as string);
  const specs = JSON.parse(formData.get('specs') as string);
  const description = formData.get('description') as string || null;
  const imageUrl = formData.get('imageUrl') as string || null;
  const amazonUrl = formData.get('amazonUrl') as string || null;
  const cazasouqUrl = formData.get('cazasouqUrl') as string || null;
  const microlessUrl = formData.get('microlessUrl') as string || null;
  
  const ptRaw = formData.get('performanceTier') as string;
  const performanceTier = (ptRaw && ptRaw.trim() !== '') ? parseInt(ptRaw, 10) : null;

  // الحقول اليدوية الجديدة (الأسعار والتوفر)
  const amazonPrice = parsePriceSafely(formData.get('amazonPrice'));
  const cazasouqPrice = parsePriceSafely(formData.get('cazasouqPrice'));
  const microlessPrice = parsePriceSafely(formData.get('microlessPrice'));

  const amazonInStock = formData.get('amazonInStock') === 'true';
  const cazasouqInStock = formData.get('cazasouqInStock') === 'true';
  const microlessInStock = formData.get('microlessInStock') === 'true';

  await prisma.component.create({
    data: { 
      categoryId, brand, name, price, tdpWattage, specs, description, imageUrl, amazonUrl, cazasouqUrl, performanceTier, microlessUrl,
      amazonPrice, cazasouqPrice, microlessPrice, amazonInStock, cazasouqInStock, microlessInStock
    }
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function updateComponent(formData: FormData) {
  await assertAdmin();
  const id = formData.get('id') as string;
  const categoryId = formData.get('categoryId') as string;
  const brand = formData.get('brand') as string;
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string);
  const tdpWattage = parseInt(formData.get('tdpWattage') as string);
  const specs = JSON.parse(formData.get('specs') as string);
  const description = formData.get('description') as string || null;
  const imageUrl = formData.get('imageUrl') as string || null;
  const amazonUrl = formData.get('amazonUrl') as string || null;
  const cazasouqUrl = formData.get('cazasouqUrl') as string || null;
  const microlessUrl = formData.get('microlessUrl') as string || null;
  
  const ptRaw = formData.get('performanceTier') as string;
  const performanceTier = (ptRaw && ptRaw.trim() !== '') ? parseInt(ptRaw, 10) : null;

  // الحقول اليدوية الجديدة (الأسعار والتوفر)
  const amazonPrice = parsePriceSafely(formData.get('amazonPrice'));
  const cazasouqPrice = parsePriceSafely(formData.get('cazasouqPrice'));
  const microlessPrice = parsePriceSafely(formData.get('microlessPrice'));

  const amazonInStock = formData.get('amazonInStock') === 'true';
  const cazasouqInStock = formData.get('cazasouqInStock') === 'true';
  const microlessInStock = formData.get('microlessInStock') === 'true';

  await prisma.component.update({
    where: { id },
    data: { 
      categoryId, brand, name, price, tdpWattage, specs, description, imageUrl, amazonUrl, cazasouqUrl, performanceTier, microlessUrl,
      amazonPrice, cazasouqPrice, microlessPrice, amazonInStock, cazasouqInStock, microlessInStock
    }
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deleteComponent(formData: FormData) {
  await assertAdmin();
  const id = formData.get('id') as string;
  await prisma.component.delete({ where: { id } });
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function addNews(formData: FormData) {
  await assertAdmin();
  const title = formData.get('title') as string;
  const summary = formData.get('summary') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const imageUrl = formData.get('imageUrl') as string || null;

  await prisma.news.create({
    data: { title, summary, content, category, imageUrl }
  });

  revalidatePath('/admin');
  revalidatePath('/news');
}

export async function updateNews(formData: FormData) {
  await assertAdmin();
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const summary = formData.get('summary') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const imageUrl = formData.get('imageUrl') as string || null;

  await prisma.news.update({
    where: { id },
    data: { title, summary, content, category, imageUrl }
  });

  revalidatePath('/admin');
  revalidatePath('/news');
}

export async function deleteNews(formData: FormData) {
  await assertAdmin();
  const id = formData.get('id') as string;
  await prisma.news.delete({ where: { id } });
  revalidatePath('/admin');
  revalidatePath('/news');
}

export async function updateSettings(formData: FormData) {
  await assertAdmin();
  try {
    const amazon = formData.get('amazon_affiliate')?.toString() || '';
    const cazasouq = formData.get('cazasouq_affiliate')?.toString() || '';
    const microless = formData.get('microless_affiliate')?.toString() || '';

    const settings = [
      { key: 'amazon_affiliate', value: amazon },
      { key: 'cazasouq_affiliate', value: cazasouq },
      { key: 'microless_affiliate', value: microless }
    ];

    for (const setting of settings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value }
      });
    }

    revalidatePath('/admin'); // تحديث مسار الإدارة لإظهار القيم الجديدة
  } catch (error: any) {
    console.error("خطأ قاعدة البيانات أثناء حفظ العمولات:", error);
    throw new Error("فشل الحفظ في قاعدة البيانات");
  }
}