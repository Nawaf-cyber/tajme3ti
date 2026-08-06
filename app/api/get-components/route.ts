import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * تصدير القطع لملف العمل (زر «تصدير القطع» في اللوحة).
 *
 * يُخرج عموداً لكل متجر مفعّل بأسماء <slug>Url / <slug>Price / <slug>AffiliateUrl،
 * وهي نفس الأسماء التي يقبلها مسار الاستيراد — فتُصدّر، تعدّل في Excel،
 * وتُعيد الاستيراد. المتجر الذي تضيفه اليوم تظهر أعمدته هنا تلقائياً.
 */
export async function GET() {
  try {
    const [components, stores] = await Promise.all([
      prisma.component.findMany({
        select: {
          id: true,
          name: true,
          offers: {
            where: { store: { active: true } },
            select: { url: true, price: true, inStock: true, affiliateUrl: true, store: { select: { slug: true } } },
          },
        },
      }),
      prisma.store.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' }, select: { slug: true, usesDeepLinks: true } }),
    ]);

    const rows = components.map((c) => {
      const row: Record<string, any> = { id: c.id, name: c.name };
      for (const s of stores) {
        const o = c.offers.find((x) => x.store.slug === s.slug);
        row[`${s.slug}Url`] = o?.url ?? null;
        row[`${s.slug}Price`] = o?.price ?? null;
        row[`${s.slug}InStock`] = o?.inStock ?? null;
        // عمود رابط التتبّع يظهر فقط لمن يحتاجه — لا نُثقل الملف بأعمدة فارغة
        if (s.usesDeepLinks) row[`${s.slug}AffiliateUrl`] = o?.affiliateUrl ?? null;
      }
      return row;
    });

    return NextResponse.json({ components: rows, stores: stores.map((s) => s.slug) });
  } catch (error) {
    return NextResponse.json({ error: "فشل جلب القطع" }, { status: 500 });
  }
}
