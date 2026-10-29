import { prisma } from '../../lib/prisma';
import { HAS_PARTS } from '../../lib/categories';
import { OFFER_INCLUDE } from '../../lib/stores-server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تصفّح قطع الحاسب وأسعارها',
  description: 'تصفّح كتالوج قطع الحاسب: كروت الشاشة والمعالجات واللوحات والذاكرة والتخزين — بأسعار لحظية من المتاجر السعودية مع رصد التخفيضات.',
  alternates: { canonical: '/components' },
};
import ComponentsClient from './ComponentsClient';

// تحديث حي دائماً — يعرض أحدث الأسعار والصور والتوفّر بلا حاجة redeploy
export const dynamic = 'force-dynamic';

/* ?cat=GPU من بلاطات الرئيسية: الفئة باسمها الإنجليزيّ (مفتاح Category.name)
   لا بمعرّفها — الرابط يُقرأ ويُكتب بيد، والمعرّف cuid لا يُقرأ. */
export default async function ComponentsPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const [components, categories, storesCount, newest] = await Promise.all([
    prisma.component.findMany({ include: { category: true, ...OFFER_INCLUDE }, orderBy: { createdAt: 'desc' } }),
    prisma.category.findMany({ where: HAS_PARTS }),
    prisma.store.count({ where: { active: true } }),
    prisma.component.aggregate({ _max: { lastScrapedAt: true } }),
  ]);
  const initialCatId = (cat && categories.find((c) => c.name === cat)?.id) || 'all';

  return (
    <div className="min-h-screen py-8 md:py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <ComponentsClient
          components={components}
          categories={categories}
          initialCatId={initialCatId}
          storesCount={storesCount}
          updatedAt={newest._max.lastScrapedAt?.toISOString() ?? null}
        />
      </div>
    </div>
  );
}
