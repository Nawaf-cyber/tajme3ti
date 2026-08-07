'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { isCazasouqTrackingUrl } from '../../lib/affiliate';

/* رابط تتبّع كازاسوق: نقبله فقط إن كان رابط idevaffiliate صالحاً.
   قيمة خاطئة ملصوقة (رابط منتج عادي مثلاً) تُحفظ null فيسقط الكود
   للسلوك الاحتياطي بدل أن يوجّه المشتري لوجهة خاطئة. */
const cleanCazaAffiliate = (val: FormDataEntryValue | null): string | null => {
  const s = (val as string || '').trim();
  return isCazasouqTrackingUrl(s) ? s : null;
};

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

/* ============ حفظ عروض المتاجر ============
 * النموذج يولّد لكل متجر مفعّل حقولاً باسم store_<id>_url|price|stock|aff،
 * فإضافة متجر في اللوحة تضيف حقوله تلقائياً بلا تعديل هنا ولا في النموذج.
 *
 * ملاحظة: الأعمدة القديمة (amazonPrice…) لم تعد تُكتب — هي نسخة مجمّدة
 * لحظة الترحيل، والنسخة الحيّة للرجوع هي backups/store-columns-*.json.
 */
async function saveOffersFromForm(componentId: string, formData: FormData) {
  const stores = await prisma.store.findMany({ select: { id: true, usesDeepLinks: true } });

  for (const s of stores) {
    const url = ((formData.get(`store_${s.id}_url`) as string) || '').trim() || null;
    const price = parsePriceSafely(formData.get(`store_${s.id}_price`));
    const inStock = formData.get(`store_${s.id}_stock`) === 'true';
    // رابط التتبّع العميق: يُقبل فقط بشكله الصحيح، وإلا null فيسقط للاحتياطي
    const affiliateUrl = s.usesDeepLinks
      ? cleanCazaAffiliate(formData.get(`store_${s.id}_aff`))
      : null;

    const existing = await prisma.componentOffer.findUnique({
      where: { componentId_storeId: { componentId, storeId: s.id } },
      select: { id: true },
    });

    // لا رابط ولا سعر = المتجر غير مرتبط بهذه القطعة؛ نحذف العرض إن وُجد
    if (!url && price == null) {
      if (existing) await prisma.componentOffer.delete({ where: { id: existing.id } });
      continue;
    }

    const data = { url, price, inStock, affiliateUrl };
    if (existing) {
      await prisma.componentOffer.update({ where: { id: existing.id }, data });
    } else {
      await prisma.componentOffer.create({ data: { componentId, storeId: s.id, ...data } });
    }
  }
}

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

  const ptRaw = formData.get('performanceTier') as string;
  const performanceTier = (ptRaw && ptRaw.trim() !== '') ? parseInt(ptRaw, 10) : null;

  const created = await prisma.component.create({
    data: { categoryId, brand, name, price, tdpWattage, specs, description, imageUrl, performanceTier },
  });
  await saveOffersFromForm(created.id, formData);

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

  const ptRaw = formData.get('performanceTier') as string;
  const performanceTier = (ptRaw && ptRaw.trim() !== '') ? parseInt(ptRaw, 10) : null;

  await prisma.component.update({
    where: { id },
    data: { categoryId, brand, name, price, tdpWattage, specs, description, imageUrl, performanceTier },
  });
  await saveOffersFromForm(id, formData);

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

/** رسالة من الإدارة في محادثة الطلب — يراها صاحبه في «تجميعاتي» ويردّ عليها */
export async function replyToPartRequest(formData: FormData) {
  await assertAdmin();
  const id = formData.get('id') as string;
  const body = ((formData.get('adminNote') as string) || '').trim().slice(0, 400);
  if (!id || !body) return;

  await prisma.partRequestMessage.create({
    data: { requestedPartId: id, userId: null, body, seenByAdmin: true },
  });

  /* الرسالة حدثٌ يخصّ أصحاب الطلب: نلمس الطلب لتتحرّك updatedAt، ونصفّر
     seenAt لأصواتهم كي تظهر لهم النقطة. بلا هذا يبقى السؤال صامتاً. */
  await prisma.requestedPart.update({ where: { id }, data: { updatedAt: new Date() } });
  await prisma.partVote.updateMany({
    where: { requestedPartId: id, userId: { not: null } },
    data: { seenAt: null },
  });

  revalidatePath('/admin/part-requests');
  revalidatePath('/my-builds');
}

/** يُعلّم ردود المستخدمين كمقروءة — تُطفئ نقطة «ردود جديدة» عند الأدمن */
export async function markPartMessagesSeen() {
  await assertAdmin();
  await prisma.partRequestMessage.updateMany({
    where: { userId: { not: null }, seenByAdmin: false },
    data: { seenByAdmin: true },
  });
  revalidatePath('/admin');
  revalidatePath('/admin/part-requests');
}

/** يُعلّم الطلبات المعروضة كمقروءة — تُطفئ نقطة «طلبات جديدة» */
export async function markPartRequestsSeen() {
  await assertAdmin();
  await prisma.requestedPart.updateMany({
    where: { adminSeenAt: null },
    data: { adminSeenAt: new Date() },
  });
  revalidatePath('/admin');
  revalidatePath('/admin/part-requests');
}

/* ============ إدارة طلبات القطع ============ */
const PART_STATUSES = ['REVIEWING', 'ADDING', 'ADDED'] as const;

/** تحديث حالة طلب قطعة وربطه بقطعة فعلية.
 *  ربط القطعة يفعّل زر "ابنِ بهذه القطعة" لكل من طلبها.
 *  عند الربط نضبط الحالة تلقائياً إلى ADDED إن لم تُحدَّد أخرى. */
export async function updatePartRequest(formData: FormData) {
  await assertAdmin();
  const id = formData.get('id') as string;
  if (!id) return;

  const statusRaw = formData.get('status') as string;
  const componentRaw = (formData.get('componentId') as string || '').trim();
  const componentId = componentRaw || null;

  // القطعة المرتبطة تعني ضمناً "تمت الإضافة" إن لم يختر الأدمن حالة صريحة أدنى
  let status = PART_STATUSES.includes(statusRaw as any) ? statusRaw : 'REVIEWING';
  if (componentId && status !== 'ADDED') status = 'ADDED';
  // لا نُبقي حالة ADDED بلا قطعة مرتبطة — يفقد الزر معناه
  if (status === 'ADDED' && !componentId) status = 'ADDING';

  await prisma.requestedPart.update({
    where: { id },
    data: { status: status as any, componentId },
  });

  revalidatePath('/admin/part-requests');
}

export async function deletePartRequest(formData: FormData) {
  await assertAdmin();
  const id = formData.get('id') as string;
  if (id) await prisma.requestedPart.delete({ where: { id } });
  revalidatePath('/admin/part-requests');
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