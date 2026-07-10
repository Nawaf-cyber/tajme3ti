import { prisma } from '../../lib/prisma';
import CompareClient from './CompareClient';
import type { Metadata } from 'next';

// تحديث حي — الأسعار والتوفّر تتغيّر
export const dynamic = 'force-dynamic';

type SearchParams = { ids?: string };

// توليد عنوان ووصف ديناميكيين للمقارنة (مهم لـ SEO)
export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const ids = params.ids?.split(',').filter(Boolean).slice(0, 3) ?? [];

  if (ids.length < 2) {
    return {
      title: 'قارن القطع جنباً إلى جنب',
      description: 'قارن مواصفات وأسعار قطع الحاسوب جنباً إلى جنب، واختر الأنسب لتجميعتك بثقة.',
    };
  }

  try {
    const comps = await prisma.component.findMany({
      where: { id: { in: ids } },
      select: { name: true, brand: true },
    });
    if (comps.length < 2) throw new Error('not enough');

    const names = comps.map((c) => `${c.brand} ${c.name}`);
    const title = `مقارنة ${names.join(' مقابل ')}`;
    return {
      title,
      description: `مقارنة تفصيلية بين ${names.join(' و ')} — المواصفات والأسعار والأداء، لتختار الأنسب لتجميعتك.`,
      alternates: { canonical: `/compare?ids=${ids.join(',')}` },
    };
  } catch {
    return { title: 'قارن القطع جنباً إلى جنب' };
  }
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const ids = params.ids?.split(',').filter(Boolean).slice(0, 3) ?? [];

  // القطع المختارة للمقارنة
  const selected = ids.length
    ? await prisma.component.findMany({
        where: { id: { in: ids } },
        include: { category: true },
      })
    : [];

  // نحافظ على ترتيب الـ IDs كما في الرابط
  const ordered = ids
    .map((id) => selected.find((c) => c.id === id))
    .filter(Boolean) as typeof selected;

  // فئة المقارنة الحالية (نفس الفئة فقط)
  const activeCategoryId = ordered[0]?.categoryId ?? null;

  // القطع المتاحة للإضافة (نفس الفئة، غير المختارة)
  const available = activeCategoryId
    ? await prisma.component.findMany({
        where: {
          categoryId: activeCategoryId,
          id: { notIn: ids },
        },
        select: {
          id: true,
          name: true,
          brand: true,
          price: true,
          imageUrl: true,
        },
        orderBy: { name: 'asc' },
      })
    : [];

  // كل الفئات (لاختيار فئة عند بدء مقارنة جديدة)
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  // إن لم تُختر قطع بعد: نجلب قطعاً من كل فئة للبدء
  const starterComponents = !activeCategoryId
    ? await prisma.component.findMany({
        select: {
          id: true,
          name: true,
          brand: true,
          price: true,
          imageUrl: true,
          categoryId: true,
        },
        orderBy: { name: 'asc' },
      })
    : [];

  return (
    <CompareClient
      selected={JSON.parse(JSON.stringify(ordered))}
      available={JSON.parse(JSON.stringify(available))}
      categories={JSON.parse(JSON.stringify(categories))}
      starterComponents={JSON.parse(JSON.stringify(starterComponents))}
      activeCategoryId={activeCategoryId}
    />
  );
}
