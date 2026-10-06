'use server';

/**
 * ============ طلبات انضمام المتاجر — إجراءات الأدمن ============
 * الحالة والملاحظة الداخليّة والحذف. والإضافة الفعليّة للمتجر تبقى في
 * /admin/stores — الطلب يُعرّفك بالمتجر، لا يُنشئه.
 */

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { adminEmail } from '../../lib/admin-guard';
import { LIMITS, type StoreAppStatus } from '../../lib/store-application';

const STATUSES: StoreAppStatus[] = ['NEW', 'REVIEWING', 'ACCEPTED', 'REJECTED'];

async function assertAdmin() {
  if (!(await adminEmail())) throw new Error('غير مصرح: هذه العملية تتطلب صلاحية أدمن.');
}

export async function updateStoreApplication(
  id: string,
  patch: { status?: StoreAppStatus; adminNote?: string },
): Promise<{ success: boolean; error?: string }> {
  await assertAdmin();
  const data: { status?: StoreAppStatus; adminNote?: string | null } = {};
  if (patch.status !== undefined) {
    if (!STATUSES.includes(patch.status)) return { success: false, error: 'حالةٌ غير معروفة.' };
    data.status = patch.status;
  }
  if (patch.adminNote !== undefined) {
    data.adminNote = patch.adminNote.trim().slice(0, LIMITS.notes) || null;
  }
  try {
    await prisma.storeApplication.update({ where: { id }, data });
    revalidatePath('/admin/store-applications');
    revalidatePath('/admin');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'تعذّر الحفظ.' };
  }
}

export async function deleteStoreApplication(id: string): Promise<{ success: boolean; error?: string }> {
  await assertAdmin();
  try {
    await prisma.storeApplication.delete({ where: { id } });
    revalidatePath('/admin/store-applications');
    revalidatePath('/admin');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'تعذّر الحذف.' };
  }
}
