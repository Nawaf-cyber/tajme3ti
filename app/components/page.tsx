import { prisma } from '../../lib/prisma';
import ComponentsClient from './ComponentsClient';

// تحديث حي دائماً — يعرض أحدث الأسعار والصور والتوفّر بلا حاجة redeploy
export const dynamic = 'force-dynamic';

export default async function ComponentsPage() {
  const components = await prisma.component.findMany({
    include: { category: true },
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