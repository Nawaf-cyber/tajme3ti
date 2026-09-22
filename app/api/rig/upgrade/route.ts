/* ============ «وش أرقّي؟» ============
 *
 * السؤال الذي يسأله كلُّ من يملك جهازاً. والجواب ادّعاءٌ **نسبيّ بين
 * قطعتين** لا رقمُ أداء: أيُّ الاثنتين — المعالج أو الكرت — يقيّد الآخر.
 *
 * ⚠️ والمرشَّح يُفحص بـ`fitsRig` نفسها التي تُجيب في صفحة القطعة: فلا
 * يُقترح كرتٌ لا يدخل كيسه، ولا معالجٌ لا يقبله مقبسه، ولا ما يتجاوز
 * مزوّده. واقتراحُ ترقيةٍ لا تُركَّب أسوأ من السكوت.
 *
 * ⚠️ ولا يُقترح إلّا **أرخصُ** ما يفكّ الاختناق: الغرض أن يعرف الحدّ
 * الأدنى الذي يحلّ مشكلته، لا أن نبيعه أغلى ما عندنا.
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '../../../../lib/prisma';
import { OFFER_INCLUDE } from '../../../../lib/stores-server';
import { liveOffers } from '../../../../lib/stores';
import { weakestLink } from '../../../../lib/bottleneck';
import { type RigCategory } from '../../../../lib/rig-fit';
import { pickUpgrade } from '../../../../lib/rig-upgrade';
import type { BuildParts, PartLike } from '../../../../lib/build-check';

const COLUMN: Record<RigCategory, string> = {
  CPU: 'cpuId', GPU: 'gpuId', RAM: 'ramId', Motherboard: 'motherboardId',
  Case: 'caseId', PSU: 'psuId', Storage: 'storageId', Cooler: 'coolerId',
};

const uid = (s: any) => (s?.user as any)?.id as string | undefined;

export async function GET() {
  const id = uid(await getServerSession(authOptions));
  if (!id) return NextResponse.json(null, { status: 200 });

  try {
    const build = await prisma.savedBuild.findFirst({ where: { userId: id, isCurrent: true } });
    if (!build) return NextResponse.json(null, { status: 200 });

    const ids = (Object.keys(COLUMN) as RigCategory[])
      .map((k) => (build as any)[COLUMN[k]] as string | null)
      .filter(Boolean) as string[];
    if (!ids.length) return NextResponse.json(null, { status: 200 });

    const parts = await prisma.component.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, brand: true, specs: true, tdpWattage: true, performanceTier: true },
    });
    const byId = new Map(parts.map((p) => [p.id, p]));

    const rig: BuildParts = {};
    for (const k of Object.keys(COLUMN) as RigCategory[]) {
      const pid = (build as any)[COLUMN[k]] as string | null;
      if (pid && byId.has(pid)) rig[k] = byId.get(pid) as PartLike;
    }

    const weak = weakestLink(rig.CPU as any, rig.GPU as any);
    if (!weak) return NextResponse.json(null, { status: 200 });

    const currentPart = rig[weak] as any;
    const currentTier = currentPart?.performanceTier ?? 0;

    const raw = await prisma.component.findMany({
      where: { category: { name: weak } },
      select: {
        id: true, name: true, brand: true, price: true, imageUrl: true,
        specs: true, tdpWattage: true, performanceTier: true, ...OFFER_INCLUDE,
      },
    });

    const custom = build.customParts && typeof build.customParts === 'object' && !Array.isArray(build.customParts)
      ? (Object.keys(build.customParts as any) as RigCategory[])
      : [];

    const { pick, blocked } = pickUpgrade(
      rig,
      weak,
      raw.map((c) => ({
        ...(c as any),
        /* ⚠️ السعر من العرض الحيّ لا من العمود: العمود يُشتقّ منه لكنّه
           قد يشيخ بين دورتين، والمعروض للزائر هو الحيّ. */
        price: liveOffers(c.offers as any)[0]?.price ?? c.price,
        live: liveOffers(c.offers as any).length > 0,
      })),
      custom,
    );

    const base = { category: weak, current: currentPart?.name ?? null, currentTier };
    if (!pick) return NextResponse.json({ ...base, pick: null, blocked }, { status: 200 });

    return NextResponse.json(
      {
        ...base,
        pick: {
          id: (pick as any).id,
          brand: (pick as any).brand,
          name: (pick as any).name,
          price: pick.price,
          imageUrl: (pick as any).imageUrl,
          tier: pick.performanceTier,
        },
        blocked: false,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[GET /api/rig/upgrade]', error);
    return NextResponse.json(null, { status: 200 });
  }
}
