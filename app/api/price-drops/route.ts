/* ============ انخفاضات أسعار قطع المستخدم ============
 *
 *   GET               → { fresh, pinned, lowest, totalSaved, unseen }
 *   POST {seen:true}  → يُعلّمها مقروءة (تُطفأ النقطة، وتضيق النافذة)
 *
 * ⚠️ و`seen` هنا يفعل شيئين لا شيئاً واحداً: يُطفئ النقطة الحمراء، **ويُقدّم
 * حدّ النافذة** — فما رآه لا يُعرض في الزيارة التالية. ذلك هو المقصود: خبرٌ
 * يُعرض كلَّ يومٍ تسعةً وعشرين يوماً يصير أثاثاً يُتجاهل. ومن أراد الإمساك
 * بواحدٍ منها فله «احفظ» في `/api/price-watch`.
 *
 * ⚠️ ولا إشعار يُرسَل: لا مزوّد بريدٍ في الإعداد، ولا دفعَ ويب بعد. فما يقع
 * اليوم أن المستخدم **يراها حين يفتح الموقع** — ولا يُكتب في الواجهة وعدٌ
 * بأكثر من ذلك.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { userDropsView } from '../../../lib/price-drops';

export const dynamic = 'force-dynamic';

const EMPTY = { fresh: [], pinned: [], lowest: [], totalSaved: 0, unseen: 0 };

async function currentUser() {
  const session = await getServerSession(authOptions);
  const id = (session?.user as any)?.id as string | undefined;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id }, select: { id: true, dropsSeenAt: true } });
}

export async function GET() {
  const user = await currentUser();
  /* غير المسجّل لا يُعدّ خطأً: القسم ببساطة لا يُعرض له */
  if (!user) return NextResponse.json(EMPTY);

  try {
    const view = await userDropsView(prisma, user.id, { seenAt: user.dropsSeenAt });
    /* كلّ ما في «الجديد» جديدٌ بحكم النافذة — فالعدد هو طوله لا حسابٌ ثانٍ */
    return NextResponse.json({ ...view, unseen: view.fresh.length });
  } catch (error) {
    console.error('[GET /api/price-drops]', error);
    return NextResponse.json(EMPTY, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'سجّل دخولك أولاً.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body?.seen) return NextResponse.json({ error: 'طلب غير مفهوم' }, { status: 400 });

  try {
    await prisma.user.update({ where: { id: user.id }, data: { dropsSeenAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[POST /api/price-drops]', error);
    return NextResponse.json({ error: 'تعذّر الحفظ' }, { status: 500 });
  }
}
