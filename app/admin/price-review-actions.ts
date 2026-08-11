'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { applyApproval, applyRejection } from '../../lib/price-review';

/**
 * قرار الأدمن في الارتفاعات المعلَّقة — تصريحٌ ثم نداء.
 * الجوهر في lib/price-review كي يبقى قابلاً للاختبار بلا جلسة ولا متصفّح.
 */

async function requireAdmin(): Promise<string> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) throw new Error('غير مصرح');
  /* الدور يُقرأ من القاعدة لا من الجلسة: توكن قديم قد يحمل دوراً سُحب. */
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  if (user?.role !== 'ADMIN') throw new Error('غير مصرح: هذه العملية تتطلب صلاحية أدمن.');
  return email;
}

const isId = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length < 100;

export async function approvePriceReview(reviewId: string) {
  try {
    const email = await requireAdmin();
    if (!isId(reviewId)) return { success: false, error: 'معرّف غير صالح.' };
    const res = await applyApproval(prisma, reviewId, email);
    if (res.success) revalidatePath('/admin');
    return res;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * إغلاق بلاغ زائر.
 * @param dismissed true = فحصتُ والسعر سليم · false = كان مختلفاً وصُحّح
 * التفريق ليس تجميلاً: نسبة «سليم» العالية على متجرٍ بعينه تعني أن مشكلته
 * في مكان آخر (رابط، أو منطقة عرض)، ونسبة «صُحّح» تعني أن السحب متأخّر.
 */
export async function resolvePriceReport(reportId: string, dismissed: boolean) {
  try {
    const email = await requireAdmin();
    if (!isId(reportId)) return { success: false, error: 'معرّف غير صالح.' };

    const report = await prisma.priceReport.findUnique({ where: { id: reportId } });
    if (!report) return { success: false, error: 'البلاغ غير موجود.' };
    if (report.status !== 'OPEN') return { success: false, error: 'هذا البلاغ أُغلق من قبل.' };

    await prisma.priceReport.update({
      where: { id: reportId },
      data: {
        status: dismissed ? 'DISMISSED' : 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: email,
      },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectPriceReview(reviewId: string) {
  try {
    const email = await requireAdmin();
    if (!isId(reviewId)) return { success: false, error: 'معرّف غير صالح.' };
    const res = await applyRejection(prisma, reviewId, email);
    if (res.success) revalidatePath('/admin');
    return res;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
