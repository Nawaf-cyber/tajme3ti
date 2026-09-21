/* ============ «جهازي الحالي» ============
 *
 * تجميعةٌ محفوظةٌ عليها عَلَم `isCurrent` — لا كِيانٌ ثانٍ. والمسار هنا
 * يقرأها ويعيّنها، ولا ثالثَ له.
 *
 * ⚠️ والحمولة المُعادة **مقصوصة**: `specs` و`tdpWattage` والاسم وحدها —
 * وهي كلُّ ما يحتاجه `fitsRig`. وصفحةُ القطعة تُفتح مئات المرّات يوميّاً،
 * وإرسالُ الأسعار والعروض والصور في كلٍّ منها حملٌ بلا مستفيد.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';
import type { BuildParts, PartLike } from '../../../lib/build-check';
import type { RigCategory } from '../../../lib/rig-fit';

/** العمود في `SavedBuild` ← مفتاح `BuildParts` */
const COLUMN: Record<RigCategory, 'cpuId' | 'gpuId' | 'ramId' | 'motherboardId' | 'caseId' | 'psuId' | 'storageId' | 'coolerId'> = {
  CPU: 'cpuId', GPU: 'gpuId', RAM: 'ramId', Motherboard: 'motherboardId',
  Case: 'caseId', PSU: 'psuId', Storage: 'storageId', Cooler: 'coolerId',
};

export type RigPayload = {
  buildId: string;
  name: string;
  rig: BuildParts;
  /** فئاتٌ كتبها المستخدم نصّاً — بلا مواصفات، فلا تُفحص */
  customParts: Record<string, string>;
} | null;

const userId = (s: any) => (s?.user as any)?.id as string | undefined;

export async function GET() {
  const uid = userId(await getServerSession(authOptions));
  if (!uid) return NextResponse.json(null, { status: 200 });

  try {
    const build = await prisma.savedBuild.findFirst({
      where: { userId: uid, isCurrent: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!build) return NextResponse.json(null, { status: 200 });

    const ids = (Object.keys(COLUMN) as RigCategory[])
      .map((k) => (build as any)[COLUMN[k]] as string | null)
      .filter(Boolean) as string[];

    const parts = ids.length
      ? await prisma.component.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true, brand: true, specs: true, tdpWattage: true },
        })
      : [];
    const byId = new Map(parts.map((p) => [p.id, p as PartLike]));

    const rig: BuildParts = {};
    for (const k of Object.keys(COLUMN) as RigCategory[]) {
      const id = (build as any)[COLUMN[k]] as string | null;
      if (id && byId.has(id)) rig[k] = byId.get(id);
    }

    const raw = build.customParts as any;
    const customParts: Record<string, string> =
      raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};

    const payload: RigPayload = { buildId: build.id, name: build.name, rig, customParts };
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error('[GET /api/rig]', error);
    return NextResponse.json({ message: 'خطأ في السيرفر' }, { status: 500 });
  }
}

/** `{ buildId }` يُعيّنها جهازاً حاليّاً · `{ buildId: null }` يلغي التعيين */
export async function POST(req: NextRequest) {
  const uid = userId(await getServerSession(authOptions));
  if (!uid) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  try {
    const { buildId } = await req.json();

    if (buildId) {
      const own = await prisma.savedBuild.findUnique({ where: { id: buildId }, select: { userId: true } });
      if (!own || own.userId !== uid) {
        return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
      }
    }

    /* ⚠️ معاملةٌ لا كتابتان: «واحدٌ لكلّ مستخدم» لا يفرضه المخطّط — قيدُ
       `@@unique([userId, isCurrent])` كان سيمنع تجميعتين **عاديّتين**
       لنفس المستخدم. فالإنزال والرفع يقعان معاً أو لا يقعان، وإلّا بقي
       المستخدم بلا جهازٍ حاليٍّ إن انقطع بينهما. */
    await prisma.$transaction([
      prisma.savedBuild.updateMany({ where: { userId: uid, isCurrent: true }, data: { isCurrent: false } }),
      ...(buildId
        ? [prisma.savedBuild.update({ where: { id: buildId }, data: { isCurrent: true } })]
        : []),
    ]);

    return NextResponse.json({ ok: true, buildId: buildId ?? null }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/rig]', error);
    return NextResponse.json({ message: 'خطأ في السيرفر' }, { status: 500 });
  }
}
