/* ============ أرقام الزيارات — للإدارة ============
 *
 * ⚠️ والمنطق في `lib/analytics.ts` لا هنا: صفحة اللوحة تحتاج الأرقام نفسها،
 * وكانت ستُنادي هذا المسار عبر HTTP من داخل الخادم — طلبٌ يخرج ليعود، يحمل
 * الكوكي يدوياً، ويفشل بصمتٍ إن تغيّر النطاق.
 */

import { NextResponse } from 'next/server';
import { adminEmail } from '../../../../lib/admin-guard';
import { analyticsSummary } from '../../../../lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!(await adminEmail())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const days = Number(new URL(req.url).searchParams.get('days')) || 30;
  return NextResponse.json(await analyticsSummary(days));
}
