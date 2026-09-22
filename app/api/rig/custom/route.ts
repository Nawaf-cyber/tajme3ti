/* ============ قطعةٌ يملكها وليست في الكتالوج ============
 *
 *   POST { category, text }         → يحفظ، أو يقترح مطابقاً عندنا
 *   POST { category, text, force }  → يحفظ رغم الاقتراح
 *   POST { category, text: '' }     → يحذف
 *
 * ⚠️ والمطابقةُ **في الخادم قبل الحفظ**، لا اقتراحٌ في الواجهة يُتجاوَز:
 * أكثرُ «ما لقيتها» بحثٌ فاشل لا قطعةٌ ناقصة — يكتب «rtx5060» أو «كرت
 * 5060» فلا يجدها وهي عندنا. ولو حُفظ النصّ بلا حارس لامتلأ الحقل
 * بأسماءِ قطعٍ نملكها، وخسر صاحبُها السعرَ وفحصَ التوافق بلا سبب.
 *
 * ⚠️ ولا تدخل `RequestedPart`: ذاك طابور **طلبٍ للشراء** فيه أصواتٌ
 * وحالةُ «أُضيفت»، ومن يكتب «GTX 1060» لا يطلب شراءها — يخبرنا أنّه
 * يملكها. خلطُهما يُميّع العمودين ويُغرق الطلبات الحقيقيّة.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '../../../../lib/prisma';
import { normalizePartName, isValidPartName, matchesSearch } from '../../../../lib/part-request';
import { liveOffers } from '../../../../lib/stores';
import { OFFER_INCLUDE } from '../../../../lib/stores-server';

const CATEGORIES = ['CPU', 'GPU', 'RAM', 'Motherboard', 'Case', 'PSU', 'Storage', 'Cooler'] as const;
type Cat = (typeof CATEGORIES)[number];

const uid = (s: any) => (s?.user as any)?.id as string | undefined;

export async function POST(req: NextRequest) {
  const id = uid(await getServerSession(authOptions));
  if (!id) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  try {
    const body = await req.json();
    const category = String(body?.category ?? '') as Cat;
    const raw = String(body?.text ?? '').trim();
    const force = body?.force === true;

    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ message: 'فئةٌ غير معروفة' }, { status: 400 });
    }

    const rig = await prisma.savedBuild.findFirst({
      where: { userId: id, isCurrent: true },
      select: { id: true, customParts: true },
    });
    if (!rig) return NextResponse.json({ message: 'لا جهازَ حاليّ' }, { status: 404 });

    const current = (rig.customParts && typeof rig.customParts === 'object' && !Array.isArray(rig.customParts))
      ? { ...(rig.customParts as Record<string, string>) }
      : {};

    /* ---- الحذف ---- */
    if (!raw) {
      delete current[category];
      await prisma.savedBuild.update({ where: { id: rig.id }, data: { customParts: current } });
      return NextResponse.json({ ok: true, customParts: current }, { status: 200 });
    }

    if (!isValidPartName(raw)) {
      return NextResponse.json({ message: 'اسمٌ قصيرٌ جداً أو طويلٌ جداً' }, { status: 400 });
    }

    /* ---- الحارس: هل هي عندنا أصلاً؟ ---- */
    if (!force) {
      const inCat = await prisma.component.findMany({
        where: { category: { name: category } },
        select: { id: true, brand: true, name: true, imageUrl: true, ...OFFER_INCLUDE },
      });

      /* ⚠️ والمرشَّح يجب أن يكون **قابلاً للشراء**: اقتراحُ قطعةٍ بلا عرضٍ
         حيّ يُبدّل نصّاً مفهوماً بصفٍّ لا سعرَ له — وذلك أسوأ ممّا نمنعه. */
      const hit = inCat.find(
        (c) => matchesSearch(`${c.brand} ${c.name}`, raw) && liveOffers(c.offers as any).length > 0,
      );

      if (hit) {
        return NextResponse.json(
          {
            suggest: {
              id: hit.id,
              brand: hit.brand,
              name: hit.name,
              imageUrl: hit.imageUrl,
              price: liveOffers(hit.offers as any)[0]?.price ?? null,
            },
          },
          { status: 200 },
        );
      }
    }

    /* ---- الحفظ ---- */
    current[category] = normalizePartName(raw).slice(0, 80);
    await prisma.savedBuild.update({ where: { id: rig.id }, data: { customParts: current } });
    return NextResponse.json({ ok: true, customParts: current }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/rig/custom]', error);
    return NextResponse.json({ message: 'خطأ في السيرفر' }, { status: 500 });
  }
}
