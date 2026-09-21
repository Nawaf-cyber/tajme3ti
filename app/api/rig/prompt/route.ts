/* ============ تعريفُ «جهازي الحالي» — مرّةً واحدة ============
 *
 *   GET  → { show, hasBuilds }   هل تُعرض النافذة؟ وبأيِّ دعوةٍ فيها؟
 *   POST → تُعلَّم مقروءةً فلا تعود
 *
 * ⚠️ ولا تُعرض لمن عيّن جهازه أصلاً: النافذة تعريفٌ بميزةٍ لا إعلانٌ
 * متكرّر، ومن استعملها لا يُعرَّف بها.
 *
 * ⚠️ و«hasBuilds» يغيّر الدعوة لا الرسالة: من له تجميعاتٌ محفوظة يُشير
 * إلى واحدةٍ منها بنقرة، ومن لا تجميعةَ له يُرسَل إلى الباني. ودعوةٌ
 * واحدة للاثنين تكون نصفَ فارغةٍ عند ٨٦ من ١٢٩ مستخدماً.
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '../../../../lib/prisma';
import { shouldPromptRig } from '../../../../lib/rig-prompt';

const uid = (s: any) => (s?.user as any)?.id as string | undefined;

export async function GET() {
  const id = uid(await getServerSession(authOptions));
  if (!id) return NextResponse.json({ show: false, hasBuilds: false }, { status: 200 });

  try {
    const [user, rigCount, buildCount] = await Promise.all([
      prisma.user.findUnique({ where: { id }, select: { rigPromptSeenAt: true } }),
      prisma.savedBuild.count({ where: { userId: id, isCurrent: true } }),
      prisma.savedBuild.count({ where: { userId: id } }),
    ]);

    if (!user) return NextResponse.json({ show: false, hasBuilds: false }, { status: 200 });
    return NextResponse.json(
      shouldPromptRig({ seenAt: user.rigPromptSeenAt, currentRigs: rigCount, savedBuilds: buildCount }),
      { status: 200 },
    );
  } catch (error) {
    /* ⚠️ والصمت هو الافتراض عند العطل: نافذةٌ تظهر بسبب خطأ خادمٍ أسوأ
       من نافذةٍ لا تظهر. */
    console.error('[GET /api/rig/prompt]', error);
    return NextResponse.json({ show: false, hasBuilds: false }, { status: 200 });
  }
}

export async function POST() {
  const id = uid(await getServerSession(authOptions));
  if (!id) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  try {
    await prisma.user.update({ where: { id }, data: { rigPromptSeenAt: new Date() } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/rig/prompt]', error);
    return NextResponse.json({ message: 'خطأ في السيرفر' }, { status: 500 });
  }
}
