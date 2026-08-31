/* ============ حارس الأدمن لمسارات الـAPI ============
 *
 * ⚠️ والدور مكتوبٌ في المستودع بأربع صيغٍ مختلفة (`actions.ts`،
 * `price-review-actions.ts`، صفحات الأدمن، ومسار «ابحث في المتاجر»).
 * وهذا الملفّ لا يوحّدها كلّها — لكنّه يمنع الخامسة، ويُستعمل في كل
 * مسارٍ جديد. والفرق بين الصيغ ليس تجميليّاً: بعضها يقرأ الدور من الجلسة
 * وبعضها من قاعدة البيانات، والأولى تبقى صحيحةً حتى بعد سحب الصلاحية
 * لأنّ التوكن لا يُحدَّث. فالقراءة هنا من القاعدة.
 *
 * ⚠️ ويُعيد البريد أو `null` — لا `Response`. فمن كتب يوماً:
 *     const gate = await requireAdmin(); if (gate) return gate;
 * قلب المعنى: منع الأدمن وأدخل الجميع.
 */

import { getServerSession } from 'next-auth/next';
import { prisma } from './prisma';
import { authOptions } from '../app/api/auth/[...nextauth]/route';

/** بريد الأدمن، أو `null` لغيره */
export async function adminEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  return user?.role === 'ADMIN' ? email : null;
}
