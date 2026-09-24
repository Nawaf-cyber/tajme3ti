/* ============ ستوري «جهازي» ============
 *
 * صورةٌ بمقاس الستوري (1080×1920) لجهاز المستخدم الحاليّ، يشاركها على
 * سناب وإنستقرام من زرٍّ في بطاقة الجهاز. وكلُّ ستوري إعلانٌ يصل إلى
 * متابعي صاحبه — لا إلى شخصٍ واحد كرابط واتساب.
 *
 * ⚠️ خلف تسجيل الدخول لا عامّ: يقرأ **جهازك أنت** من الجلسة، ويحمل
 * قطعك المكتوبة يدويّاً — وتلك لا تظهر في صفحة التجميعة العامّة.
 *
 * `?price=1` يُظهر «لو تشتريه اليوم» — خيارٌ لا افتراض: بعضُهم لا يريد
 * أن ينشر كم كلّف جهازه. والرسمُ نفسه في lib/rig-story.tsx.
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '../../../../lib/prisma';
import { buildCard } from '../../../../lib/build-card';
import { renderRigStory } from '../../../../lib/rig-story';

export async function GET(req: Request) {
  const uid = ((await getServerSession(authOptions))?.user as any)?.id as string | undefined;
  if (!uid) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  const rig = await prisma.savedBuild.findFirst({
    where: { userId: uid, isCurrent: true },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });
  const price = new URL(req.url).searchParams.get('price') === '1';
  const card = rig && (await buildCard(rig.id));
  if (!card) return NextResponse.json({ message: 'لا جهاز حاليّ' }, { status: 404 });

  const image = await renderRigStory(card, { price });

  /* ⚠️ صورةُ حسابٍ بعينه: لا تُخزَّن في وسيطٍ مشترك */
  image.headers.set('Cache-Control', 'private, no-store');
  return image;
}
