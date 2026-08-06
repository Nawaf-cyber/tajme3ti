import { prisma } from '../../lib/prisma';
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

export default async function ComponentsPage() {
  const components = await prisma.component.findMany({
    include: { category: true, ...OFFER_INCLUDE },
    orderBy: { createdAt: 'desc' }
  });
  
  const categories = await prisma.category.findMany();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">تصفح القطع</h1>
        <ComponentsClient components={components} categories={categories} />
      </div>
    </div>
  );
}